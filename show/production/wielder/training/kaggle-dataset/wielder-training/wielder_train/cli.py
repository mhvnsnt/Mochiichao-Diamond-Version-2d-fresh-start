#!/usr/bin/env python3
"""Wielder Train — CLI wrapper around the pinned trainer.

Wielder is our name and our layer: preflight gating, per-character
configs, run bookkeeping (TRAIN_DONE rc lines) and a final COLLECTED
manifest with sha256 for every produced .safetensors. The training
itself is done by the vendored trainer recorded in PROVENANCE.md,
invoked unmodified from its own directory.

Subcommands:
  preflight  step 0 gate (see preflight.py) — no GPU work happens without it
  train      run one character config end to end (preflight first)
  collect    list produced .safetensors with sizes + sha256 as JSON
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.dirname(HERE)
DEFAULT_TRAINER = os.path.join(PKG, "vendor", "sd-scripts")


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def run_preflight(trainer_dir, dataset_root):
    cmd = [sys.executable, os.path.join(HERE, "preflight.py"),
           "--trainer-dir", trainer_dir]
    if dataset_root:
        cmd += ["--dataset-dir", dataset_root]
    return subprocess.run(cmd).returncode


def build_train_command(cfg, trainer_dir):
    """Exact trainer invocation for a character config (JSON).

    The argument set reproduces the 2026-10-28 owed recipe verbatim
    (see BUILD-REPORT.md): sdxl_train_network.py, dim 32 / alpha 16,
    12 epochs, seed 42, adamw8bit, fp16, cache_latents.
    """
    return [
        sys.executable,
        os.path.join(trainer_dir, "sdxl_train_network.py"),
        "--pretrained_model_name_or_path", cfg["base_model"],
        "--dataset_config", cfg["dataset_config"],
        "--output_dir", cfg["output_dir"],
        "--output_name", cfg["output_name"],
        "--network_module", "networks.lora",
        "--network_dim", str(cfg["network_dim"]),
        "--network_alpha", str(cfg["network_alpha"]),
        "--learning_rate", str(cfg["learning_rate"]),
        "--text_encoder_lr", str(cfg["text_encoder_lr"]),
        "--optimizer_type", cfg["optimizer_type"],
        "--lr_scheduler", cfg["lr_scheduler"],
        "--mixed_precision", cfg["mixed_precision"],
        "--gradient_checkpointing",
        "--cache_latents",
        "--save_every_n_epochs", str(cfg["save_every_n_epochs"]),
        "--max_train_epochs", str(cfg["max_train_epochs"]),
        "--seed", str(cfg["seed"]),
        "--save_model_as", "safetensors",
        "--min_snr_gamma", str(cfg["min_snr_gamma"]),
    ]


def collect(output_root):
    found = {}
    for root, _dirs, files in os.walk(output_root):
        for name in sorted(files):
            if name.endswith(".safetensors"):
                p = os.path.join(root, name)
                found[os.path.relpath(p, output_root)] = {
                    "bytes": os.path.getsize(p),
                    "sha256": sha256_of(p),
                }
    print("COLLECTED " + json.dumps(found))
    return found


def cmd_train(args):
    with open(args.config) as f:
        cfg = json.load(f)
    dataset_root = cfg.get("dataset_root")
    rc = run_preflight(args.trainer_dir, dataset_root)
    if rc != 0:
        print(f"TRAIN_ABORTED_PREFLIGHT {cfg['character']} rc {rc}")
        return rc
    os.makedirs(cfg["output_dir"], exist_ok=True)
    cmd = build_train_command(cfg, args.trainer_dir)
    print("TRAIN_CMD " + " ".join(cmd))
    # The trainer resolves its library relative to its own directory;
    # run it from there (this is also why the upstream `-e .` line is
    # not needed — see requirements-wielder.txt).
    rc = subprocess.run(cmd, cwd=args.trainer_dir).returncode
    print(f"TRAIN_DONE {cfg['character']} rc {rc}")
    if rc == 0:
        collect(os.path.dirname(cfg["output_dir"].rstrip("/")) or cfg["output_dir"])
    return rc


def main():
    ap = argparse.ArgumentParser(prog="wielder-train")
    ap.add_argument("--trainer-dir", default=DEFAULT_TRAINER)
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("preflight").add_argument("--dataset-dir", default=None)

    t = sub.add_parser("train")
    t.add_argument("--config", required=True)

    c = sub.add_parser("collect")
    c.add_argument("--output-root", required=True)

    args = ap.parse_args()
    if args.cmd == "preflight":
        return run_preflight(args.trainer_dir, args.dataset_dir)
    if args.cmd == "train":
        return cmd_train(args)
    if args.cmd == "collect":
        collect(args.output_root)
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
