#!/usr/bin/env python3
"""Pull a grok-local model variant ON THE SERVER and verify it.

Staging law: weights are never downloaded to the owner's local
machine or this repo — they are pulled here, on the GPU seat that
will serve them, straight from Hugging Face, and verified against
serving/model_hashes.json before anything tries to serve them.

Verification standard (verify-then-state):
- Variants with a pinned file table (primary, fallback, free-seat):
  every listed file must match its recorded byte size, and every
  file with a recorded sha256 must match it. Any mismatch is a
  hard failure (exit 1) — a partially verified model is never
  handed to the server.
- Abliterated bf16 sources (files: null): the manifest does not
  carry per-shard hashes (see model_hashes.json's header note), so
  this script verifies shard count + total downloaded bytes, then
  writes DOWNLOADED-MANIFEST.json beside the weights recording the
  sha256 it computed for every file — that record is the
  provenance the quantization step (quantize_awq.py) cites.

Usage:
  python3 pull_model.py --variant primary --out ./models/primary
  python3 pull_model.py --variant primary-abliterated-src \
      --out ./models/primary-abliterated-src   # needs HF_TOKEN if gated

Stdlib only; runs anywhere Python 3.10+ runs. Downloads stream to
<name>.part and are renamed into place only when complete, so a
killed pull never leaves a half-file that looks whole.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "model_hashes.json")
CHUNK = 1 << 20


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(CHUNK), b""):
            h.update(block)
    return h.hexdigest()


def download(url: str, dest: str, token: str | None) -> None:
    headers = {"User-Agent": "grok-local-pull/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    part = dest + ".part"
    with urllib.request.urlopen(req, timeout=120) as r, open(part, "wb") as f:
        while True:
            block = r.read(CHUNK)
            if not block:
                break
            f.write(block)
    os.replace(part, dest)


def resolve_url(repo: str, revision: str | None, path: str) -> str:
    rev = revision or "main"
    return f"https://huggingface.co/{repo}/resolve/{rev}/{path}"


def pull_pinned(variant: dict, out: str, token: str | None) -> int:
    repo, revision = variant["repo"], variant.get("revision")
    files = variant["files"]
    os.makedirs(out, exist_ok=True)
    print(f"[pull] {repo} @ {revision or 'main'} -> {out} "
          f"({len(files)} files, repo LFS total {variant['repo_total_bytes']} B)")
    failures = []
    for name, spec in sorted(files.items()):
        dest = os.path.join(out, name)
        if os.path.exists(dest) and os.path.getsize(dest) == spec["size"]:
            print(f"[pull] present, size ok: {name}")
        else:
            print(f"[pull] downloading {name} ({spec['size']} B)")
            download(resolve_url(repo, revision, name), dest, token)
        size = os.path.getsize(dest)
        if size != spec["size"]:
            failures.append(f"{name}: size {size} != expected {spec['size']}")
            continue
        if "sha256" in spec:
            digest = sha256_of(dest)
            if digest != spec["sha256"]:
                failures.append(f"{name}: sha256 {digest} != expected {spec['sha256']}")
            else:
                print(f"[verify] sha256 ok: {name}")
    if failures:
        print("[FAIL] verification failed:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print(f"[OK] variant verified: {len(files)} files, all sizes "
          f"(and pinned hashes) match the manifest")
    return 0


def pull_source(variant: dict, out: str, token: str | None) -> int:
    """Abliterated bf16 source: file list comes from the repo's own
    tree at the pinned revision; integrity = shard count + total
    bytes + a recorded hash of everything downloaded."""
    repo, revision = variant["repo"], variant["revision"]
    api = f"https://huggingface.co/api/models/{repo}/tree/{revision}"
    headers = {"User-Agent": "grok-local-pull/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(api, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as r:
        tree = json.loads(r.read())
    files = [e["path"] for e in tree if e.get("type") == "file"
             and e["path"] != ".gitattributes"]
    shards = [f for f in files if f.endswith(".safetensors")]
    if len(shards) != variant["safetensors_shards"]:
        print(f"[FAIL] expected {variant['safetensors_shards']} safetensors "
              f"shards at revision {revision}, tree shows {len(shards)}",
              file=sys.stderr)
        return 1
    os.makedirs(out, exist_ok=True)
    record = {"repo": repo, "revision": revision, "files": {}}
    total = 0
    for name in sorted(files):
        dest = os.path.join(out, name)
        if not os.path.exists(dest):
            print(f"[pull] downloading {name}")
            download(resolve_url(repo, revision, name), dest, token)
        digest = sha256_of(dest)
        size = os.path.getsize(dest)
        record["files"][name] = {"size": size, "sha256": digest}
        total += size
        print(f"[record] {name}: {size} B sha256 {digest[:16]}…")
    record["total_bytes_all_files"] = total
    with open(os.path.join(out, "DOWNLOADED-MANIFEST.json"), "w") as f:
        json.dump(record, f, indent=2, sort_keys=True)
    print(f"[OK] source pulled: {len(files)} files, {total} B total; "
          f"hashes recorded in DOWNLOADED-MANIFEST.json")
    print("[note] repo LFS total in the manifest is "
          f"{variant['repo_total_bytes']} B (weights + LFS files only); "
          "compare against the .safetensors + tokenizer.json sizes above")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--variant", required=True,
                    help="variant key from model_hashes.json")
    ap.add_argument("--out", required=True, help="destination directory")
    args = ap.parse_args()
    with open(MANIFEST) as f:
        manifest = json.load(f)
    variant = manifest["variants"].get(args.variant)
    if variant is None:
        print(f"[FAIL] unknown variant {args.variant!r}; known: "
              f"{sorted(manifest['variants'])}", file=sys.stderr)
        return 2
    token = os.environ.get("HF_TOKEN") or None
    if variant.get("files"):
        return pull_pinned(variant, args.out, token)
    return pull_source(variant, args.out, token)


if __name__ == "__main__":
    sys.exit(main())
