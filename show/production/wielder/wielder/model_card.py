"""Model-seat cards + verification — the Hugging Face / Llama Stack
conventions, converged with grok-local's verify-before-serve.

Two conventions from the model ecosystem are load-bearing for
Wielder's seats, and until now only one of them existed in the tree:

1. Verify before serve (HAVE — grok-local): `grok-local/serving/
   pull_model.py` pulls weights on the seat and refuses to hand a
   partially verified model to the server; `model_hashes.json` pins
   per-file {size, sha256} per variant. This module does NOT replace
   that. It extracts the same standard into the Wielder package as a
   pure check — `verify_model_files` — so any seat (not only the
   grok-local serving scripts) can verify a model directory against
   a manifest in exactly that shape, and `hash_manifest_for_dir`
   produces the record half (the DOWNLOADED-MANIFEST pattern) for
   models whose upstream does not pin hashes.

2. The model card (GAP — now wired): every HF Hub model and every
   Llama Stack distribution carries a card: YAML frontmatter
   (license, base_model, library_name, pipeline_tag, tags) over a
   markdown body stating what the model is, how it was made, and its
   limits. Wielder's seats had manifests but no cards — a seat could
   be verified without ever being *described* in the format every
   tool in the ecosystem reads. `render_model_card` /
   `parse_model_card` implement the frontmatter convention (the
   subset of YAML the card spec uses: scalars and flat lists), so
   Wielder can write cards its own seats ship with and read cards
   other people's models arrive with. The licence field is mandatory
   in render: a card without a licence does not render (the honesty
   law — an unlabelled model is an unshipped model).

Stdlib only. The YAML handling is deliberately the card subset, not
a general YAML parser; a card using anchors or nested maps parses
those fields as raw strings, which parse_model_card reports in
`unparsed_fields` rather than guessing.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Mapping, Optional

CHUNK = 1 << 20

# Frontmatter fields, in the order HF renders them.
CARD_FIELD_ORDER = ["license", "license_name", "base_model", "library_name",
                    "pipeline_tag", "language", "tags", "datasets", "metrics"]


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(CHUNK), b""):
            h.update(block)
    return h.hexdigest()


# ------------------------------------------------------------------
# Verification — the pull_model.py standard, as a pure check
# ------------------------------------------------------------------

def verify_model_files(files: Mapping[str, Mapping[str, Any]], root: Path) -> dict:
    """Verify a model directory against a pinned file table in the
    grok-local model_hashes.json shape: {filename: {"size": int,
    "sha256": str (optional)}}. Every listed file must exist and
    match its size; every file with a recorded sha256 must match it.
    Returns a report dict; report["ok"] is the verdict. This is the
    same standard pull_model.py enforces at download time, applied
    to a directory that is already on disk."""
    root = Path(root)
    report: dict[str, Any] = {"root": str(root), "ok": True, "files": {}, "failures": []}
    for name in sorted(files):
        spec = files[name] or {}
        dest = root / name
        entry: dict[str, Any] = {"exists": dest.exists()}
        if not dest.exists():
            entry["size_ok"] = False
            entry["sha256_ok"] = None
            report["failures"].append(f"{name}: missing")
            report["ok"] = False
            report["files"][name] = entry
            continue
        size = dest.stat().st_size
        entry["bytes"] = size
        entry["size_ok"] = ("size" not in spec) or (size == spec["size"])
        if not entry["size_ok"]:
            report["failures"].append(f"{name}: size {size} != expected {spec['size']}")
            report["ok"] = False
        if "sha256" in spec:
            digest = sha256_of(dest)
            entry["sha256"] = digest
            entry["sha256_ok"] = digest == spec["sha256"]
            if not entry["sha256_ok"]:
                report["failures"].append(f"{name}: sha256 {digest} != expected {spec['sha256']}")
                report["ok"] = False
        else:
            entry["sha256_ok"] = None
        report["files"][name] = entry
    return report


def verify_variant(manifest: Mapping[str, Any], variant: str, root: Path) -> dict:
    """Verify against a whole grok-local-shaped manifest:
    {"variants": {name: {"repo": ..., "revision": ..., "files": {...}}}}."""
    entry = (manifest.get("variants") or {}).get(variant)
    if entry is None:
        return {"ok": False, "variant": variant,
                "failures": [f"unknown variant {variant!r}; known: "
                              f"{sorted((manifest.get('variants') or {}).keys())}"]}
    if not entry.get("files"):
        return {"ok": False, "variant": variant,
                "failures": ["variant carries no pinned file table (files: null) — "
                             "verify by shard count + total bytes and record hashes "
                             "with hash_manifest_for_dir, the pull_model.py source route"]}
    report = verify_model_files(entry["files"], root)
    report["variant"] = variant
    report["repo"] = entry.get("repo")
    report["revision"] = entry.get("revision")
    return report


def hash_manifest_for_dir(root: Path, relpaths: list[str]) -> dict:
    """Record {size, sha256} for files already on disk — the
    DOWNLOADED-MANIFEST pattern from pull_model.py's source route,
    for models whose upstream pins no hashes."""
    root = Path(root)
    files: dict[str, Any] = {}
    total = 0
    for rel in sorted(relpaths):
        dest = root / rel
        digest = sha256_of(dest)
        size = dest.stat().st_size
        files[rel] = {"size": size, "sha256": digest}
        total += size
    return {"files": files, "total_bytes_all_files": total}


# ------------------------------------------------------------------
# Model cards — the HF frontmatter convention
# ------------------------------------------------------------------

def _yaml_scalar(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value)
    if text == "" or any(c in text for c in ":#{}[]&,*!|>'\"%@`") or text.strip() != text:
        return json.dumps(text)
    return text


def render_model_card(meta: Mapping[str, Any], body: str = "") -> str:
    """Render a model card. `license` is mandatory — the honesty law
    applied to the seat layer: no licence label, no card."""
    if not meta.get("license"):
        raise ValueError("model card requires a licence label (meta['license']) — "
                         "an unlabelled model is an unshipped model")
    keys = [k for k in CARD_FIELD_ORDER if k in meta]
    keys += [k for k in meta if k not in CARD_FIELD_ORDER]
    lines = ["---"]
    for key in keys:
        value = meta[key]
        if isinstance(value, (list, tuple)):
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"- {_yaml_scalar(item)}")
        else:
            lines.append(f"{key}: {_yaml_scalar(value)}")
    lines.append("---")
    text = "\n".join(lines) + "\n"
    if body:
        text += "\n" + body.rstrip("\n") + "\n"
    return text


def parse_model_card(text: str) -> dict:
    """Parse a card's frontmatter (the flat subset) + body. Returns
    {"meta": {...}, "body": str, "unparsed_fields": [...]}. Fields
    whose values use YAML features outside the subset are reported,
    not guessed at."""
    result: dict[str, Any] = {"meta": {}, "body": text, "unparsed_fields": []}
    if not text.startswith("---"):
        return result
    head, sep, rest = text.partition("\n---")
    if not sep:
        return result
    result["body"] = rest.lstrip("\n")
    current_key: Optional[str] = None
    for raw in head.splitlines()[1:]:
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("- ") and current_key:
            result["meta"].setdefault(current_key, [])
            if isinstance(result["meta"][current_key], list):
                result["meta"][current_key].append(_parse_scalar(line[2:].strip()))
            continue
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            current_key = key.strip()
            value = value.strip()
            if value == "":
                result["meta"][current_key] = []  # list follows, or empty
            elif value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                result["meta"][current_key] = ([_parse_scalar(v.strip())
                                                for v in inner.split(",")] if inner else [])
            elif value.startswith("{"):
                result["meta"][current_key] = value
                result["unparsed_fields"].append(current_key)
            else:
                result["meta"][current_key] = _parse_scalar(value)
        else:
            if current_key:
                result["unparsed_fields"].append(current_key)
    # a key left as an empty list with no items was an empty scalar
    for key, value in list(result["meta"].items()):
        if value == [] and key not in result["unparsed_fields"]:
            pass  # legitimately an empty list; keep as-is
    return result


def _parse_scalar(text: str) -> Any:
    if text.startswith('"') and text.endswith('"'):
        try:
            return json.loads(text)
        except Exception:
            return text.strip('"')
    if text in ("true", "false"):
        return text == "true"
    return text
