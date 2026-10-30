#!/usr/bin/env python3
"""download_models.py — fetch ONLY the ship-clean models for the 4090 pack.

Called by download_models.sh (thin bash wrapper). Rules, from
MODELS-MANIFEST.json + repo avatar-stack/fetch_consistency_models.py:

* Default set = disposition "ship-clean" rows only.
* The Turbo LoRA is fetched ONLY with --fast-lane; its
  RECHECK_BEFORE_COMMERCIAL_SHIP flag is printed first (Kijai repack
  card declares no licence; underlying Self-Forcing MIT, base Wan
  Apache-2.0 — repo backends.json).
* Eval-only / refused models (A14B tiers, VACE-14B, Phantom-Wan,
  ToonCrafter, MultiShotMaster, LTX-*, Hunyuan*) are NEVER fetched.
* Sizes are verified where a source gives an exact byte count; where
  no source gives one (bytes=null in MODELS-MANIFEST), the downloaded
  size + sha256 are MEASURED and written to download-manifest.json —
  never asserted in advance.
* HF resolution follows fetch_consistency_models.py: resolve ONE file
  per repo by pattern; 0 or >1 matches = fatal, no guessing.
* Fails loud: any failed fetch / size mismatch exits non-zero.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path


def sha256_of(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


# id, kind(url|resolve), repo/url, pattern-or-filename, dest, expected_bytes, licence
ROWS = [
    ("wan2.1-vace-1.3b", "resolve", "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
     ["vace", "1.3b"], "diffusion_models", None, "Apache License 2.0"),
    ("wan2.1-vae", "resolve", "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
     ["wan_2.1_vae"], "vae", 253815318, "Apache License 2.0"),
    ("umt5-xxl-fp8-scaled", "url",
     "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
     "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "text_encoders", None,
     "Apache License 2.0"),
    ("wan2.2-ti2v-5b-fp16", "resolve", "Comfy-Org/Wan_2.2_ComfyUI_Repackaged",
     ["ti2v", "5b", "fp16"], "diffusion_models", 9999658848,
     "Apache License 2.0"),
    ("umt5-xxl-fp8-nonscaled-kijai", "resolve", "Kijai/WanVideo_comfy",
     ["umt5-xxl-enc-fp8_e4m3fn"], "text_encoders", 6731333792,
     "Apache License 2.0 (Wan family; repack licence GAP — see MODELS-MANIFEST)"),
]
FAST_LANE_ROWS = [
    ("wan22-ti2v-5b-turbo-lora", "resolve", "Kijai/WanVideo_comfy",
     ["turbo", "ti2v", "5b"], "loras", None, "RECHECK_BEFORE_COMMERCIAL_SHIP"),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--models-dir", default="/workspace/models")
    ap.add_argument("--fast-lane", action="store_true")
    args = ap.parse_args()
    models_dir = Path(args.models_dir)
    for d in ("diffusion_models", "vae", "text_encoders", "loras"):
        (models_dir / d).mkdir(parents=True, exist_ok=True)

    from huggingface_hub import HfApi, hf_hub_download

    def fetch_resolved(repo, pattern, suffix, dest_dir):
        files = HfApi().list_repo_files(repo)
        hits = [f for f in files
                if all(b in f.lower() for b in pattern)
                and f.lower().endswith(suffix)]
        if len(hits) != 1:
            print(f"  FATAL-RESOLVE: {pattern} in {repo} matched "
                  f"{len(hits)}: {hits[:6]} — refusing to guess.")
            return None
        return Path(hf_hub_download(repo_id=repo, filename=hits[0],
                                    local_dir=str(dest_dir)))

    def fetch_url(url, dest):
        repo, fname = url.split("/resolve/main/", 1)
        repo = repo.replace("https://huggingface.co/", "")
        got = Path(hf_hub_download(repo_id=repo, filename=fname,
                                   local_dir=str(dest.parent / ".hf_tmp")))
        if got != dest:
            got.replace(dest)
        return dest

    rows = list(ROWS)
    if args.fast_lane:
        print("WARNING: --fast-lane fetches the Turbo LoRA, flagged "
              "RECHECK_BEFORE_COMMERCIAL_SHIP in repo backends.json "
              "(Kijai repack card declares no licence; underlying "
              "Self-Forcing MIT, base Wan Apache-2.0).", flush=True)
        rows += FAST_LANE_ROWS

    record = {"schema": "mochiichao-show/gpu-4090/download-manifest/v1",
              "fetched": [], "skipped_existing": [], "failed": []}
    failed = False
    for rid, kind, src, pat, dest_name, expected, licence in rows:
        print(f"\n[{rid}] licence: {licence}")
        dest_dir = models_dir / dest_name
        dest_dir.mkdir(parents=True, exist_ok=True)
        try:
            if kind == "url":
                dest = dest_dir / pat
                if dest.exists() and dest.stat().st_size > 0:
                    print(f"  exists, skipping: {dest}")
                    record["skipped_existing"].append(rid)
                    if expected and dest.stat().st_size != expected:
                        print(f"  FATAL-SIZE: existing {dest} is "
                              f"{dest.stat().st_size} B, expected {expected} B")
                        failed = True
                    continue
                fetch_url(src, dest)
            else:
                dest = fetch_resolved(src, pat, ".safetensors", dest_dir)
                if dest is None:
                    record["failed"].append(rid)
                    failed = True
                    continue
            size = dest.stat().st_size
            if expected is not None and size != expected:
                print(f"  FATAL-SIZE: {dest} is {size} B, source states "
                      f"{expected} B — refusing to continue.")
                record["failed"].append(rid)
                failed = True
                continue
            entry = {"id": rid, "path": str(dest), "bytes": size,
                     "sha256": sha256_of(dest), "expected_bytes": expected,
                     "size_verified": expected is not None, "licence": licence}
            record["fetched"].append(entry)
            print(f"  -> {dest} ({size} bytes, measured; "
                  f"sha256 {entry['sha256'][:16]}...)")
        except Exception as e:  # noqa: BLE001 — fail loud per row, keep going
            print(f"  FAILED: {e}")
            record["failed"].append(rid)
            failed = True

    out = models_dir / "download-manifest.json"
    out.write_text(json.dumps(record, indent=2) + "\n")
    print(f"\nmanifest: {out}  fetched={len(record['fetched'])} "
          f"skipped={len(record['skipped_existing'])} "
          f"failed={len(record['failed'])}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
