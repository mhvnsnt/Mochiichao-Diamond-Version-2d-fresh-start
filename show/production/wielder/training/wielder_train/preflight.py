#!/usr/bin/env python3
"""Wielder Train — step-0 preflight.

Regression pin for the 2026-10-28 SDXL LoRA failure class: the Kaggle run
reached training with an incomplete environment (ftfy missing, after a bad
git pin and a broken requirements install) and both trainings died rc 1
with zero .safetensors produced. This preflight makes that class
impossible to repeat silently: it runs BEFORE any GPU time is spent and
fails loudly, naming every missing piece.

Checks:
  1. Every Python dependency the trainer imports is importable.
  2. The vendored trainer is the pinned version (git HEAD or file hashes).
  3. The trainer entry module exists at its pinned hash.
  4. The dataset layout is valid (every image has a caption sidecar).

Exit code 0 and a PREFLIGHT_PASS line only when every check passes.
"""
import argparse
import hashlib
import importlib
import json
import os
import subprocess
import sys

# The full import surface the trainer needs, taken from the trainer's own
# requirements.txt at the pinned tag (v0.12.3) plus what its entry modules
# import directly. ftfy is listed FIRST on purpose: it is the module whose
# absence killed both trainings on 2026-10-28.
REQUIRED_MODULES = [
    "ftfy",
    "torch",
    "torchvision",  # imported by the trainer's library.utils; upstream
                    # requirements do not list it (seats usually preinstall
                    # it) — caught by this preflight's first local run,
                    # 2026-10-28, and pinned in requirements-wielder.txt
    "accelerate",
    "transformers",
    "diffusers",
    "einops",
    "safetensors",
    "toml",
    "voluptuous",
    "huggingface_hub",
    "imagesize",
    "numpy",
    "rich",
    "sentencepiece",
    "cv2",              # opencv-python (trainer requirements, non-ARM64)
    "bitsandbytes",     # provides adamw8bit, the recipe's optimizer
    "lion_pytorch",
    "schedulefree",
    "pytorch_optimizer",
    "prodigyopt",
    "tensorboard",
    "PIL",
]

PINNED_COMMIT = "cb70b96858477e716a2096292ab8aab433277f38"  # sd-scripts v0.12.3
PINNED_FILE_HASHES = {
    "LICENSE.md": "e8d3af270e7b15ccab908481e4a8b2da03b27cc7ada3c9826cf709df5eb49c9e",
    "requirements.txt": "0417f71a8a7be1a18ac5427843376e8f22c666252ceb5d226a3b470adbbeea68",
    "sdxl_train_network.py": "ba8c8991a9d4b51f5343c503c1d8929fc52f506c53c615058f1e8665696a8c6e",
}

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def check_modules(failures):
    for mod in REQUIRED_MODULES:
        try:
            importlib.import_module(mod)
            print(f"DEP_OK {mod}")
        except Exception as e:  # missing or broken install: name it, loudly
            print(f"DEP_MISSING {mod}: {type(e).__name__}: {e}")
            failures.append(f"dependency not importable: {mod} ({e})")


def check_trainer_entry(trainer_dir, failures):
    """Import the trainer's entry module itself.

    Dependency lists can lie by omission (torchvision did); importing
    sdxl_train_network executes the trainer's real import chain, so any
    missing module in that chain fails here, before training, by name.
    """
    sys.path.insert(0, trainer_dir)
    try:
        importlib.import_module("sdxl_train_network")
        print("TRAINER_ENTRY_IMPORT_OK sdxl_train_network")
    except Exception as e:
        print(f"TRAINER_ENTRY_IMPORT_FAIL sdxl_train_network: {type(e).__name__}: {e}")
        failures.append(f"trainer entry import failed: {e}")
    finally:
        sys.path.remove(trainer_dir)


def check_trainer(trainer_dir, failures):
    if not os.path.isdir(trainer_dir):
        print(f"TRAINER_MISSING {trainer_dir}")
        failures.append(f"trainer dir missing: {trainer_dir}")
        return
    git_dir = os.path.join(trainer_dir, ".git")
    if os.path.isdir(git_dir):
        try:
            head = subprocess.run(
                ["git", "-C", trainer_dir, "rev-parse", "HEAD"],
                capture_output=True, text=True, timeout=30,
            ).stdout.strip()
            if head == PINNED_COMMIT:
                print(f"TRAINER_PIN_OK git HEAD {head}")
            else:
                print(f"TRAINER_PIN_MISMATCH git HEAD {head} != pinned {PINNED_COMMIT}")
                failures.append(f"trainer git HEAD {head} != pinned {PINNED_COMMIT}")
        except Exception as e:
            failures.append(f"trainer git check failed: {e}")
    for rel, want in PINNED_FILE_HASHES.items():
        p = os.path.join(trainer_dir, rel)
        if not os.path.isfile(p):
            print(f"TRAINER_FILE_MISSING {rel}")
            failures.append(f"trainer file missing: {rel}")
            continue
        got = sha256_of(p)
        if got == want:
            print(f"TRAINER_FILE_OK {rel} {got}")
        else:
            print(f"TRAINER_FILE_HASH_MISMATCH {rel} {got} != {want}")
            failures.append(f"trainer file hash mismatch: {rel}")


def check_dataset(dataset_dir, failures):
    """dataset_dir holds one subdir per character, images + .txt captions."""
    if not os.path.isdir(dataset_dir):
        print(f"DATASET_MISSING {dataset_dir}")
        failures.append(f"dataset dir missing: {dataset_dir}")
        return
    total = 0
    for char in sorted(os.listdir(dataset_dir)):
        cdir = os.path.join(dataset_dir, char)
        if not os.path.isdir(cdir):
            continue
        # images may sit in a nested sdxl/ subdir (the verified layout does)
        img_dirs = [cdir] + [
            os.path.join(cdir, d) for d in sorted(os.listdir(cdir))
            if os.path.isdir(os.path.join(cdir, d))
        ]
        char_imgs = 0
        for d in img_dirs:
            for name in sorted(os.listdir(d)):
                stem, ext = os.path.splitext(name)
                if ext.lower() not in IMAGE_EXTS:
                    continue
                cap = os.path.join(d, stem + ".txt")
                if not os.path.isfile(cap):
                    print(f"DATASET_NOCAPTION {os.path.join(d, name)}")
                    failures.append(f"image without caption: {os.path.join(d, name)}")
                else:
                    char_imgs += 1
        print(f"DATASET_CHAR {char} images_with_captions={char_imgs}")
        if char_imgs == 0:
            failures.append(f"dataset character has no captioned images: {char}")
        total += char_imgs
    print(f"DATASET_VERIFIED {total}")
    if total == 0:
        failures.append("dataset contains zero captioned images")


def main():
    ap = argparse.ArgumentParser(prog="wielder-train preflight")
    ap.add_argument("--trainer-dir", required=True)
    ap.add_argument("--dataset-dir", default=None,
                    help="optional; layout verified when given")
    ap.add_argument("--skip-deps", action="store_true",
                    help="skip dependency imports (layout/pin checks only)")
    args = ap.parse_args()

    failures = []
    if not args.skip_deps:
        check_modules(failures)
    check_trainer(args.trainer_dir, failures)
    if not args.skip_deps and os.path.isdir(args.trainer_dir):
        check_trainer_entry(args.trainer_dir, failures)
    if args.dataset_dir:
        check_dataset(args.dataset_dir, failures)

    if failures:
        print("PREFLIGHT_FAIL")
        for f in failures:
            print(f"PREFLIGHT_FAILURE {f}")
        return 1
    print("PREFLIGHT_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
