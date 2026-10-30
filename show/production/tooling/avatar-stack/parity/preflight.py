#!/usr/bin/env python3
"""Pre-flight abort gate for avatar-stack generation runs.

This check runs BEFORE any ComfyUI/Kaggle GPU work. It was added after the
2026-10-28 Dorowani proof failed with frame 1 already showing the wrong
character: the run had spent GPU time even though the reference path was not
locked in a way that could be audited, the wrapper T5 file was a rejected
scaled-fp8 build, and a stale LoRA input key could be silently ignored.

The gate is deliberately structural and hash-based. It does not claim that a
passing workflow will generate a good clip; it prevents the known silent
failure classes from consuming a run:

  * fed reference image missing, unreadable, or not hash-logged / mismatched;
  * a VACE workflow without an engaged reference-image connection;
  * a native VACE workflow without TrimVideoLatent wired from trim_latent;
  * any stale ``lora_args`` key, a zero/negative LoRA strength, or a LoRA
    selector whose output is not consumed by the model loader's ``lora`` input;
  * a WanVideoWrapper T5 loader fed a scaled-fp8 UMT5 file, either by name in
    the workflow or by an actual ``scaled_fp8`` key in a supplied file header;
  * a wrapper sampler fed by ``WanVideoImageToVideoEncode`` (which emits a
    ``y`` conditioning latent that the model channel-concats onto the noise)
    when the loaded model has no spare patch-embedding input channels for
    that concat — the Wan 2.2 TI2V-5B case (in_dim 48 == noise channels)
    that killed the locked-run v2 turbo phase with a 96-vs-48 channel
    RuntimeError after GPU time had already started.

Exit codes: 0 = PASS, 2 = ABORT (JSON packet still written when --out is used).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
from pathlib import Path
from typing import Any

WRAPPER_T5_CLASSES = {"LoadWanVideoT5TextEncoder", "WanVideoTextEncodeCached"}
LORA_SELECT_CLASSES = {"WanVideoLoraSelect", "WanVideoLoraSelectByName"}

# --- Sampler channel contract (the 96-vs-48 class, locked-run v2 turbo) ---
# Source-verified against kijai ComfyUI-WanVideoWrapper @ 088128b22424
# (nodes_sampler.py; wanvideo/modules/model.py, the "# I2V" block):
# WanVideoImageToVideoEncode emits embeds whose "image_embeds" value is a
# y conditioning latent. WanVideoSampler hands y to WanModel.forward,
# which channel-concats it onto the noise: x = [cat([u, v], dim=0)].
# That concat is only valid when the checkpoint's patch_embedding has
# MORE input channels than the noise latent (Wan 2.1 I2V: in_dim 36 vs
# 16 noise channels; y itself is mask(4) + latent(16) = 20, 16 + 20 = 36).
# The Wan 2.2 TI2V-5B checkpoint's patch_embedding.weight is
# [3072, 48, 1, 2, 2] (verified from the Comfy-Org repackaged file's
# safetensors header): in_dim == noise channels (48), so the concat
# yields 96 channels into a 48-channel convolution — the exact v2 turbo
# RuntimeError. The vendor's own TI2V-5B example
# (example_workflows/wanvideo_2_2_5B_I2V_example_WIP.json) never produces
# y: WanVideoEncode turns the start image into a LATENT that rides into
# the sampler via WanVideoEmptyEmbeds.extra_latents (first-frame latent
# injection at index 0). That is the only sanctioned pattern for a model
# whose in_dim equals its noise channels.
Y_ENCODE_CLASS = "WanVideoImageToVideoEncode"
# model filename substring -> (noise_channels, model in_dim, label);
# in_dim > noise_channels means the y concat has somewhere to land.
WRAPPER_MODEL_CHANNELS = [
    ("ti2v_5b", 48, 48, "Wan 2.2 TI2V-5B"),
    ("ti2v-5b", 48, 48, "Wan 2.2 TI2V-5B"),
    ("wan2.1_i2v", 16, 36, "Wan 2.1 I2V"),
    ("wan_2.1_i2v", 16, 36, "Wan 2.1 I2V"),
    ("wan21_i2v", 16, 36, "Wan 2.1 I2V"),
]


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def is_link(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 2
        and isinstance(value[0], (str, int))
        and isinstance(value[1], int)
    )


def link_node(value: Any) -> str | None:
    return str(value[0]) if is_link(value) else None


def walk(obj: Any, path: str = "$"):
    yield path, obj
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk(v, f"{path}[{i}]")


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def manifest_hashes(manifest_path: Path | None) -> dict[str, str]:
    """Read a reference manifest in any of the small shapes used by our jobs.

    Accepted shapes:
      {"dorowani_start.png": "sha256..."}
      {"images": {"path": "sha256..."}}
      [{"path"|"file"|"image": "...", "sha256": "..."}, ...]
      {"entries": [ ...same list shape... ]}
    Keys are normalised to both the literal key and its basename.
    """
    if manifest_path is None:
        return {}
    data = load_json(manifest_path)
    out: dict[str, str] = {}

    def add(key: Any, value: Any) -> None:
        if not isinstance(key, str) or not isinstance(value, str):
            return
        digest = value.lower().removeprefix("sha256:")
        out[key] = digest
        out[Path(key).name] = digest

    if isinstance(data, dict):
        images = data.get("images") if isinstance(data.get("images"), dict) else None
        if images:
            for k, v in images.items():
                add(k, v)
        entries = data.get("entries") if isinstance(data.get("entries"), list) else None
        if entries:
            data = entries
        else:
            for k, v in data.items():
                if k not in {"images", "entries"}:
                    add(k, v)
            return out
    if isinstance(data, list):
        for entry in data:
            if not isinstance(entry, dict):
                continue
            key = entry.get("path") or entry.get("file") or entry.get("image") or entry.get("name")
            value = entry.get("sha256") or entry.get("hash")
            add(key, value)
    return out


def job_references(job_path: Path | None, hashes: dict[str, str]) -> list[dict[str, Any]]:
    if job_path is None:
        return []
    job = load_json(job_path)
    refs: list[dict[str, Any]] = []
    base = job_path.parent

    def one(raw: Any, expected: Any = None, label: str = "job reference") -> None:
        if not isinstance(raw, str) or not raw:
            return
        p = Path(raw)
        resolved = p if p.is_absolute() else base / p
        digest = None
        if isinstance(expected, str):
            digest = expected.lower().removeprefix("sha256:")
        digest = digest or hashes.get(raw) or hashes.get(str(resolved)) or hashes.get(Path(raw).name)
        refs.append({"label": label, "declared": raw, "path": resolved, "expected_sha256": digest})

    if isinstance(job, dict):
        # Single-job shapes.
        one(job.get("reference_image") or job.get("start_image"),
            job.get("reference_sha256") or job.get("start_image_sha256") or job.get("sha256"),
            "job.start/reference")
        # Scene-job shape used by the test scene.
        for ch in job.get("characters", []) if isinstance(job.get("characters"), list) else []:
            if not isinstance(ch, dict):
                continue
            one(ch.get("start_image") or ch.get("reference_image"),
                ch.get("start_image_sha256") or ch.get("reference_sha256"),
                f"job character {ch.get('character', '?')}")
            for seg in ch.get("segments", []) if isinstance(ch.get("segments"), list) else []:
                if isinstance(seg, dict):
                    one(seg.get("reference_image"), seg.get("reference_sha256"),
                        f"job segment {seg.get('filename_prefix', '?')}")
    return refs


def check_reference(path: Path, expected: str | None, label: str,
                    failures: list[str], checks: list[dict[str, Any]]) -> None:
    item: dict[str, Any] = {"label": label, "path": str(path)}
    if not path.is_file():
        failures.append(f"{label}: reference image missing: {path}")
        item["status"] = "missing"
        checks.append(item)
        return
    try:
        from PIL import Image
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            item["format"] = im.format
            item["size"] = list(im.size)
            if im.size[0] <= 0 or im.size[1] <= 0:
                raise ValueError(f"invalid image dimensions {im.size}")
    except Exception as e:
        failures.append(f"{label}: reference image unreadable: {path}: {type(e).__name__}: {e}")
        item["status"] = "unreadable"
        checks.append(item)
        return
    actual = sha256_of(path)
    item["sha256"] = actual
    if not expected:
        failures.append(
            f"{label}: reference hash is not logged (no expected sha256 in job, manifest, or CLI): {path}")
        item["status"] = "hash-not-logged"
    elif actual.lower() != expected.lower():
        failures.append(
            f"{label}: reference hash mismatch for {path}: actual {actual}, expected {expected}")
        item["status"] = "hash-mismatch"
        item["expected_sha256"] = expected
    else:
        item["status"] = "pass"
        item["expected_sha256"] = expected
    checks.append(item)


def safetensors_keys(path: Path) -> set[str]:
    with path.open("rb") as f:
        raw = f.read(8)
        if len(raw) != 8:
            raise ValueError("file too short for a safetensors header")
        n = struct.unpack("<Q", raw)[0]
        if n <= 0 or n > 1 << 31:
            raise ValueError(f"implausible safetensors header length {n}")
        header = json.loads(f.read(n).decode("utf-8"))
    return set(header.keys())


def check_sampler_channel_contract(wf: dict, path: Path, item: dict[str, Any],
                                   failures: list[str]) -> None:
    """Abort wrapper graphs whose sampler conditioning cannot fit the
    loaded model's patch_embedding input channels (see the source note at
    WRAPPER_MODEL_CHANNELS). Runs on structure only; no GPU involved."""
    for node_id, node in wf.items():
        if not isinstance(node, dict) or node.get("class_type") != "WanVideoSampler":
            continue
        inputs = node.get("inputs", {}) if isinstance(node.get("inputs", {}), dict) else {}
        emb_src = link_node(inputs.get("image_embeds"))
        if not emb_src or emb_src not in wf or not isinstance(wf[emb_src], dict):
            continue
        producer = wf[emb_src].get("class_type")
        entry: dict[str, Any] = {"sampler_node": str(node_id), "embeds_producer": producer}
        if producer == "WanVideoEmptyEmbeds":
            # The TI2V-safe pattern iff a WanVideoEncode latent is injected.
            prod_inputs = wf[emb_src].get("inputs", {}) if isinstance(wf[emb_src].get("inputs", {}), dict) else {}
            lat_src = link_node(prod_inputs.get("extra_latents"))
            if lat_src and lat_src in wf and isinstance(wf[lat_src], dict) \
                    and wf[lat_src].get("class_type") == "WanVideoEncode":
                entry["pattern"] = "extra_latents_injection (no y produced)"
                entry["status"] = "pass"
            else:
                entry["pattern"] = "empty embeds, no latent injection (t2v shape)"
                entry["status"] = "pass"
            item.setdefault("channel_contract", []).append(entry)
            continue
        if producer != Y_ENCODE_CLASS:
            continue  # other producers (VACE etc.) are covered by their own checks
        # A y-producing encode feeds this sampler: the model must have
        # spare patch-embedding channels for the concat, verifiably.
        model_src = link_node(inputs.get("model"))
        model_name = None
        if model_src and model_src in wf and isinstance(wf[model_src], dict):
            m_inputs = wf[model_src].get("inputs", {}) if isinstance(wf[model_src].get("inputs", {}), dict) else {}
            if isinstance(m_inputs.get("model"), str):
                model_name = m_inputs["model"]
        entry["model"] = model_name
        matched = None
        if model_name:
            low = model_name.lower()
            for sub, noise_ch, in_dim, label in WRAPPER_MODEL_CHANNELS:
                if sub in low:
                    matched = (noise_ch, in_dim, label)
                    break
        if matched is None:
            entry["status"] = "unverifiable"
            item.setdefault("channel_contract", []).append(entry)
            failures.append(
                f"{path}: channel contract unverifiable: WanVideoSampler node {node_id} is fed by "
                f"{Y_ENCODE_CLASS} (a y-producing encode) but the loaded model {model_name!r} has no "
                "verified entry in the channel table; the y concat lands only when the model's in_dim "
                "exceeds its noise channels. Verify the model's patch_embedding shape and extend "
                "WRAPPER_MODEL_CHANNELS, or use the WanVideoEncode -> WanVideoEmptyEmbeds.extra_latents pattern")
            continue
        noise_ch, in_dim, label = matched
        entry.update({"model_label": label, "noise_channels": noise_ch, "model_in_dim": in_dim})
        if in_dim <= noise_ch:
            entry["status"] = "abort"
            item.setdefault("channel_contract", []).append(entry)
            failures.append(
                f"{path}: channel contract violation: WanVideoSampler node {node_id} is fed by "
                f"{Y_ENCODE_CLASS}, whose y latent WanModel.forward channel-concats onto the "
                f"{noise_ch}-channel noise, but {label} ({model_name}) has in_dim {in_dim} — the concat "
                f"produces {noise_ch + noise_ch} channels into a {in_dim}-channel patch_embedding "
                "(the locked-run v2 turbo RuntimeError, 96 vs 48). Use the vendor TI2V pattern: "
                "WanVideoEncode -> WanVideoEmptyEmbeds.extra_latents (first-frame latent injection, no y)")
        else:
            entry["status"] = "pass"
            item.setdefault("channel_contract", []).append(entry)


def check_workflow(path: Path, strict_vace: bool, t5_file: Path | None,
                   failures: list[str], checks: list[dict[str, Any]]) -> None:
    try:
        wf = load_json(path)
    except Exception as e:
        failures.append(f"workflow unreadable: {path}: {type(e).__name__}: {e}")
        return
    if not isinstance(wf, dict):
        failures.append(f"workflow is not a node dictionary: {path}")
        return

    item: dict[str, Any] = {"workflow": str(path), "nodes": len(wf)}
    checks.append(item)

    # Stale LoRA key anywhere is a hard abort: ComfyUI API prompts can ignore
    # unknown inputs, which is exactly how a Turbo LoRA can silently not merge.
    stale = [p for p, _ in walk(wf) if p.rsplit(".", 1)[-1] == "lora_args"]
    if stale:
        failures.append(f"{path}: stale LoRA key 'lora_args' present at {stale}; use 'lora'")

    # Scaled-fp8 by filename, but only where the wrapper loader will see it.
    for node_id, node in wf.items():
        if not isinstance(node, dict):
            continue
        cls = node.get("class_type")
        inputs = node.get("inputs", {}) if isinstance(node.get("inputs", {}), dict) else {}
        if cls in WRAPPER_T5_CLASSES:
            for key in ("model_name", "model"):
                value = inputs.get(key)
                if isinstance(value, str) and "scaled" in value.lower():
                    failures.append(
                        f"{path}: wrapper T5 node {node_id} ({cls}) is fed scaled file {value!r}; "
                        "the wrapper loader rejects scaled_fp8 unconditionally")

    if t5_file is not None:
        if not t5_file.is_file():
            failures.append(f"T5 file missing: {t5_file}")
        else:
            try:
                keys = safetensors_keys(t5_file)
                item["t5_file"] = str(t5_file)
                item["t5_file_sha256"] = sha256_of(t5_file)
                item["t5_scaled_fp8_key_present"] = "scaled_fp8" in keys
                if "scaled_fp8" in keys:
                    failures.append(f"T5 file contains a scaled_fp8 key and cannot feed the wrapper loader: {t5_file}")
                if not ({"token_embedding.weight", "shared.weight"} & keys):
                    failures.append(f"T5 file does not look like UMT5-XXL (no token_embedding/shared weight): {t5_file}")
            except Exception as e:
                failures.append(f"T5 file header unreadable: {t5_file}: {type(e).__name__}: {e}")

    # LoRA selectors: positive strength and a real consumption path into a
    # model loader's current `lora` input. merge_loras=false in the wrapper
    # selector means "hand the LoRA to the loader"; the loader connection is
    # the merge confirmation available before execution. A selector that is
    # not consumed is decoration and aborts the run.
    consumed: dict[str, list[str]] = {}
    for node_id, node in wf.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs", {}) if isinstance(node.get("inputs", {}), dict) else {}
        if "lora" in inputs and is_link(inputs["lora"]):
            consumed.setdefault(link_node(inputs["lora"]), []).append(str(node_id))
    for node_id, node in wf.items():
        if not isinstance(node, dict) or node.get("class_type") not in LORA_SELECT_CLASSES:
            continue
        inputs = node.get("inputs", {}) if isinstance(node.get("inputs", {}), dict) else {}
        strength = inputs.get("strength")
        if not isinstance(strength, (int, float)) or isinstance(strength, bool) or float(strength) <= 0:
            failures.append(f"{path}: LoRA selector node {node_id} has non-positive strength {strength!r}")
        if str(node_id) not in consumed:
            failures.append(
                f"{path}: LoRA selector node {node_id} output is not consumed by any model loader 'lora' input; merge is unconfirmed")
        else:
            item.setdefault("lora_consumers", {})[str(node_id)] = consumed[str(node_id)]

    # Sampler channel contract: a y-producing encode into a model with no
    # spare patch-embedding channels aborts HERE, not after GPU time.
    check_sampler_channel_contract(wf, path, item, failures)

    # VACE engagement. Native and wrapper spell the lock differently; both
    # must be a live graph connection, not a filename or a comment.
    native_vace = [nid for nid, n in wf.items() if isinstance(n, dict) and n.get("class_type") == "WanVaceToVideo"]
    wrapper_vace = [nid for nid, n in wf.items() if isinstance(n, dict) and n.get("class_type") == "WanVideoVACEEncode"]
    if strict_vace and not native_vace and not wrapper_vace:
        failures.append(f"{path}: strict VACE mode requested but no VACE node is present")
    for nid in native_vace:
        node = wf[nid]
        inputs = node.get("inputs", {})
        ref = inputs.get("reference_image") if isinstance(inputs, dict) else None
        src = link_node(ref)
        if not src or src not in wf:
            failures.append(f"{path}: WanVaceToVideo node {nid} lacks an engaged reference_image connection")
        else:
            src_cls = wf[src].get("class_type") if isinstance(wf[src], dict) else None
            item.setdefault("vace_reference_sources", {})[str(nid)] = {"node": src, "class_type": src_cls}
            if src_cls != "LoadImage":
                failures.append(f"{path}: WanVaceToVideo node {nid} reference_image source {src} is {src_cls}, not LoadImage")
        strength = inputs.get("strength") if isinstance(inputs, dict) else None
        if not isinstance(strength, (int, float)) or float(strength) <= 0:
            failures.append(f"{path}: WanVaceToVideo node {nid} has non-positive strength {strength!r}")
        # The trim wire is part of the lock: without it the prepended
        # reference latent is not removed by the node's own count.
        trim_ok = False
        for tid, tnode in wf.items():
            if isinstance(tnode, dict) and tnode.get("class_type") == "TrimVideoLatent":
                if tnode.get("inputs", {}).get("trim_amount") == [str(nid), 3]:
                    trim_ok = True
        if not trim_ok:
            failures.append(f"{path}: no TrimVideoLatent.trim_amount wired from WanVaceToVideo node {nid} output 3")
    for nid in wrapper_vace:
        node = wf[nid]
        inputs = node.get("inputs", {})
        ref = inputs.get("ref_images") if isinstance(inputs, dict) else None
        src = link_node(ref)
        if not src or src not in wf:
            failures.append(f"{path}: WanVideoVACEEncode node {nid} lacks an engaged ref_images connection")
        else:
            item.setdefault("vace_reference_sources", {})[str(nid)] = {
                "node": src, "class_type": wf[src].get("class_type") if isinstance(wf[src], dict) else None}
        strength = inputs.get("strength") if isinstance(inputs, dict) else None
        if not isinstance(strength, (int, float)) or float(strength) <= 0:
            failures.append(f"{path}: WanVideoVACEEncode node {nid} has non-positive strength {strength!r}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Abort avatar-stack runs before GPU time when a known silent failure is present.")
    ap.add_argument("--workflow", action="append", required=True, help="ComfyUI API workflow JSON (repeatable)")
    ap.add_argument("--job", help="scene/job JSON whose start/reference images must exist and hash-match")
    ap.add_argument("--reference", action="append", default=[], help="reference image path (repeatable); requires an expected hash")
    ap.add_argument("--expected-sha256", action="append", default=[],
                    help="expected sha256 for --reference, in the same order (repeatable)")
    ap.add_argument("--reference-manifest", help="JSON manifest mapping reference paths/names to sha256")
    ap.add_argument("--strict-vace", action="store_true", help="require a VACE lock in every workflow")
    ap.add_argument("--t5-file", help="actual UMT5 safetensors file to inspect for a scaled_fp8 key")
    ap.add_argument("--out", help="write the pre-flight packet JSON here")
    args = ap.parse_args()

    failures: list[str] = []
    checks: list[dict[str, Any]] = []
    hashes = manifest_hashes(Path(args.reference_manifest)) if args.reference_manifest else {}

    refs = job_references(Path(args.job), hashes) if args.job else []
    if args.job and not refs:
        failures.append(f"job declares no start/reference images: {args.job}")
    for ref in refs:
        check_reference(ref["path"], ref["expected_sha256"], ref["label"], failures, checks)

    if len(args.expected_sha256) > len(args.reference):
        failures.append("more --expected-sha256 values than --reference images")
    for i, raw in enumerate(args.reference):
        p = Path(raw)
        expected = None
        if i < len(args.expected_sha256):
            expected = args.expected_sha256[i].lower().removeprefix("sha256:")
        expected = expected or hashes.get(raw) or hashes.get(str(p)) or hashes.get(p.name)
        check_reference(p, expected, f"CLI reference {i + 1}", failures, checks)

    for wf in args.workflow:
        check_workflow(Path(wf), args.strict_vace,
                       Path(args.t5_file) if args.t5_file else None, failures, checks)

    packet = {
        "schema": "mochiichao-show/avatar-stack-preflight/v1",
        "verdict": "PASS" if not failures else "ABORT",
        "failures": failures,
        "checks": checks,
        "rule": "A FAIL here aborts before GPU time. A PASS is not a quality grade; the output still needs frame1_gate.py.",
    }
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(packet, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(packet, indent=2))
    return 0 if not failures else 2


if __name__ == "__main__":
    sys.exit(main())
