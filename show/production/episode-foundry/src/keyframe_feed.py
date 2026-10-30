#!/usr/bin/env python3
"""Episode Foundry — SDXL keyframe feed (start/end keyframes per cut).

READY-TO-RUN state: the code path is complete (diffusers SDXL +
per-character LoRA -> keyframes -> likeness grading via src/gate.py ->
keyframes.json in the shape the video step consumes). What it needs is
the staged LoRA dataset. Until that dataset is present this script
fails LOUDLY with a named BLOCKED message and exit code 3 — never a
traceback, never a silent substitute.

Staging contract (verified against the task brief; the staging lane is
confirming the dataset's final home):
  env FOUNDRY_SDXL_DATASET = folder holding
    dorowani_illustrious_lora.safetensors   (expected 456,488,296 bytes)
    wispkin_illustrious_lora.safetensors    (expected 456,488,264 bytes)
  A file present with the WRONG byte size is also BLOCKED (named) —
  a truncated or wrong file must never feed generation quietly.
  Base model: env FOUNDRY_SDXL_BASE_MODEL, default
  "OnomaAIResearch/Illustrious-XL-v2.0" (Illustrious-XL-v2.0).
  Canon references for grading: --cutouts DIR (default the workspace
  canon-cutouts folder) holding <character>.png.

NOTE — do not confuse these with the Wan 2.1 video LoRAs
(dorowani_mochii_wan21_1.3b.safetensors, 87,594,264 B, dataset
marsfmmg/mochiichao-character-loras): different files, different base
model, different job. This feed consumes ONLY the Illustrious SDXL
LoRAs named above.

Output shape (what kernel/foundry_kernel.py's queue consumes — queue
entries take keyframe_start / keyframe_end file paths):
  <out>/<cut_id>/keyframe_start.png, keyframe_end.png, keyframes.json
      {cut_id, character, road: "sdxl-keyframe",
       start: {path, sha256, gate: <gate.py record>},
       end:   {path, sha256, gate: <gate.py record>}}
  <out>/keyframes-index.json  {cut_id: {keyframe_start, keyframe_end,
                                        character, verdicts}}

--proof mode is the owed SDXL keyframes proof runner: 3 prompts per
character (dorowani, wispkin), each generated once and graded with the
likeness clause, verdicts printed and written to proof-records.json.

Usage:
  keyframe_feed.py --check
  keyframe_feed.py --manifest data/cut-manifest.json --out DIR
  keyframe_feed.py --proof --out DIR
Exit codes: 0 = ran, 3 = BLOCKED (named reason on stderr).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

EXPECTED_LORAS = {
    "dorowani": ("dorowani_illustrious_lora.safetensors", 456_488_296),
    "wispkin": ("wispkin_illustrious_lora.safetensors", 456_488_264),
}
CHARACTERS = sorted(EXPECTED_LORAS)
DEFAULT_BASE_MODEL = "OnomaAIResearch/Illustrious-XL-v2.0"
DEFAULT_CUTOUTS = Path.home() / "workspace/mochiichao-show/canon-cutouts"
# Negative prompt carried over from the verified VACE workflow (node 5).
NEGATIVE = ("photorealistic, 3d render, cgi, realistic, changing character "
            "design, morphing, deformed, extra limbs, extra characters, "
            "blurry, text, watermark, logo")
PROOF_PROMPTS = [
    "{c}, standing, full body, plain white background, flat 2D cartoon",
    "{c}, action pose, mid-action, plain white background, flat 2D cartoon",
    "{c}, portrait, head and shoulders, plain white background, flat 2D cartoon",
]


class Blocked(Exception):
    """A named, expected blocker — reported, never tracebacked."""


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def resolve_dataset() -> dict[str, Path]:
    """Locate + byte-verify the staged SDXL LoRA dataset, or raise Blocked."""
    raw = os.environ.get("FOUNDRY_SDXL_DATASET")
    if not raw:
        raise Blocked(
            "BLOCKED: FOUNDRY_SDXL_DATASET is not set — the SDXL LoRA staging "
            "dataset (dorowani_illustrious_lora.safetensors + "
            "wispkin_illustrious_lora.safetensors) has not been pointed at "
            "this script. Set FOUNDRY_SDXL_DATASET to the staged dataset "
            "folder once the staging lane confirms it.")
    root = Path(raw)
    if not root.is_dir():
        raise Blocked(f"BLOCKED: FOUNDRY_SDXL_DATASET={raw} is not a directory "
                      "present on this machine — dataset not staged here.")
    found: dict[str, Path] = {}
    for char, (fname, expected_bytes) in EXPECTED_LORAS.items():
        hits = sorted(root.rglob(fname))
        if not hits:
            raise Blocked(f"BLOCKED: {fname} not found under {root} — the SDXL "
                          "LoRA dataset is incomplete (staging not confirmed).")
        actual = hits[0].stat().st_size
        if actual != expected_bytes:
            raise Blocked(f"BLOCKED: {fname} is {actual} bytes, expected "
                          f"{expected_bytes} — wrong or truncated file; "
                          "refusing to generate from it.")
        found[char] = hits[0]
    return found


def check() -> dict:
    loras = resolve_dataset()
    report = {"status": "READY",
              "dataset": os.environ.get("FOUNDRY_SDXL_DATASET"),
              "loras": {c: {"path": str(p), "bytes": p.stat().st_size,
                            "sha256": sha256_of(p)} for c, p in loras.items()},
              "base_model": os.environ.get("FOUNDRY_SDXL_BASE_MODEL",
                                           DEFAULT_BASE_MODEL)}
    try:
        import torch  # noqa: F401
        import diffusers  # noqa: F401
        report["deps"] = "torch + diffusers importable"
    except Exception as e:  # noqa: BLE001
        report["deps"] = f"NOT importable on this machine ({type(e).__name__}: {e})"
        report["status"] = "READY-TO-RUN (dataset staged; generation needs a seat with torch+diffusers, e.g. Kaggle)"
    return report


def load_pipeline(lora_path: Path):
    try:
        import torch
        from diffusers import StableDiffusionXLPipeline
    except Exception as e:  # noqa: BLE001
        raise Blocked(f"BLOCKED: torch/diffusers not importable on this seat "
                      f"({type(e).__name__}: {e}) — run on the Kaggle/GPU seat.")
    base = os.environ.get("FOUNDRY_SDXL_BASE_MODEL", DEFAULT_BASE_MODEL)
    pipe = StableDiffusionXLPipeline.from_pretrained(
        base, torch_dtype=torch.float16,
        variant="fp16" if str(base).startswith("/") is False else None)
    pipe = pipe.to("cuda")
    pipe.load_lora_weights(str(lora_path.parent), weight_name=lora_path.name)
    return pipe


def generate(pipe, prompt: str, seed: int, steps: int = 28):
    import torch
    gen = torch.Generator(device="cuda").manual_seed(seed)
    return pipe(prompt=prompt, negative_prompt=NEGATIVE, width=1024, height=1024,
                num_inference_steps=steps, guidance_scale=7.0,
                generator=gen).images[0]


def grade(path: Path, character: str, cut_id: str, cutouts: Path) -> dict:
    import gate as gate_mod
    ref = Path(cutouts) / f"{character}.png"
    if not ref.is_file():
        return {"schema": gate_mod.SCHEMA, "cut_id": cut_id, "verdict": "FAIL",
                "fail_classes": ["fail-cannot-measure"],
                "error": f"canon reference not found: {ref}"}
    return gate_mod.grade_image(path, ref, cut_id=cut_id)


def run_manifest(manifest_path: Path, out_dir: Path, cutouts: Path,
                 steps: int, seed_base: int) -> dict:
    loras = resolve_dataset()
    data = json.loads(Path(manifest_path).read_text())
    cuts = data.get("cuts") if isinstance(data, dict) else data
    out_dir.mkdir(parents=True, exist_ok=True)
    index: dict = {}
    pipes: dict = {}
    try:
        for i, cut in enumerate(cuts):
            cut_id = cut.get("cut_id")
            chars = [str(c).lower() for c in (cut.get("characters") or [])]
            char = next((c for c in chars if c in EXPECTED_LORAS), None)
            if char is None:
                print(f"SKIP {cut_id}: no SDXL-LoRA character in {chars} "
                      f"(LoRAs exist for {CHARACTERS})")
                index[cut_id] = {"status": "SKIPPED_NO_LORA",
                                 "characters": chars}
                continue
            if char not in pipes:
                pipes[char] = load_pipeline(loras[char])
            beat = (cut.get("beat") or "standing").strip()
            cut_out = out_dir / cut_id
            cut_out.mkdir(parents=True, exist_ok=True)
            record = {"cut_id": cut_id, "character": char,
                      "road": "sdxl-keyframe",
                      "created_utc": datetime.now(timezone.utc).isoformat()}
            # Trigger token: the character name (the LoRA training captions
            # are the training lane's record; the name token is the
            # documented placeholder until that record is wired here).
            for tag, suffix in (("start", ""), ("end", ", action completed, final pose")):
                prompt = (f"{char}, {beat}{suffix}, full body, plain white "
                          "background, flat 2D cartoon")
                img = generate(pipes[char], prompt,
                               seed_base + i * 10 + (0 if tag == "start" else 1),
                               steps=steps)
                dest = cut_out / f"keyframe_{tag}.png"
                img.save(dest)
                record[tag] = {"path": str(dest), "sha256": sha256_of(dest),
                               "prompt": prompt,
                               "gate": grade(dest, char, f"{cut_id}-{tag}", cutouts)}
                print(f"{cut_id} {tag}: {dest.name} "
                      f"likeness={record[tag]['gate']['verdict']}")
            (cut_out / "keyframes.json").write_text(json.dumps(record, indent=2) + "\n")
            index[cut_id] = {"keyframe_start": record["start"]["path"],
                             "keyframe_end": record["end"]["path"],
                             "character": char,
                             "verdicts": {"start": record["start"]["gate"]["verdict"],
                                          "end": record["end"]["gate"]["verdict"]}}
    finally:
        for pipe in pipes.values():
            try:
                pipe.to("cpu")
            except Exception:  # noqa: BLE001
                pass
    (out_dir / "keyframes-index.json").write_text(json.dumps(index, indent=2) + "\n")
    return index


def run_proof(out_dir: Path, cutouts: Path, steps: int, seed_base: int) -> list:
    loras = resolve_dataset()
    out_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for char in CHARACTERS:
        pipe = load_pipeline(loras[char])
        try:
            for j, template in enumerate(PROOF_PROMPTS):
                prompt = template.format(c=char)
                img = generate(pipe, prompt, seed_base + j, steps=steps)
                dest = out_dir / f"proof-{char}-{j + 1}.png"
                img.save(dest)
                rec = {"character": char, "prompt": prompt, "path": str(dest),
                       "sha256": sha256_of(dest),
                       "gate": grade(dest, char, f"proof-{char}-{j + 1}", cutouts)}
                records.append(rec)
                print(f"PROOF {char} #{j + 1}: likeness={rec['gate']['verdict']} "
                      f"prompt={prompt!r}")
        finally:
            try:
                pipe.to("cpu")
            except Exception:  # noqa: BLE001
                pass
    (out_dir / "proof-records.json").write_text(json.dumps(records, indent=2) + "\n")
    return records


def main() -> int:
    ap = argparse.ArgumentParser(description="Episode Foundry SDXL keyframe feed.")
    ap.add_argument("--check", action="store_true",
                    help="validate staging only; print READY or BLOCKED")
    ap.add_argument("--manifest", help="cut manifest JSON (start+end keyframes per cut)")
    ap.add_argument("--proof", action="store_true",
                    help="proof mode: 3 graded prompts per character")
    ap.add_argument("--out", default=str(HERE.parent / "keyframes-out"))
    ap.add_argument("--cutouts", default=str(DEFAULT_CUTOUTS))
    ap.add_argument("--steps", type=int, default=28)
    ap.add_argument("--seed-base", type=int, default=42)
    args = ap.parse_args()
    try:
        if args.check:
            print(json.dumps(check(), indent=2))
            return 0
        if args.proof:
            run_proof(Path(args.out), Path(args.cutouts), args.steps, args.seed_base)
            return 0
        if args.manifest:
            run_manifest(Path(args.manifest), Path(args.out), Path(args.cutouts),
                         args.steps, args.seed_base)
            return 0
        ap.error("one of --check, --proof or --manifest is required")
    except Blocked as b:
        print(str(b), file=sys.stderr)
        return 3


if __name__ == "__main__":
    sys.exit(main())
