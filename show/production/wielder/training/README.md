# Wielder Train

Wielder's training lane: the LoRA trainer for the Mochiichao show and
game, wired end to end and gated so a broken environment can never
again burn a training run silently.

## What it is

- **Trainer core:** the industry-standard open-source SDXL LoRA
  trainer, vendored at a verified pin under `vendor/` (source, version
  and licence in `PROVENANCE.md`; upstream licence notices stay intact
  inside the vendored tree, as its Apache-2.0 licence requires).
- **Wielder layer (ours):** the `wielder-train` command —
  - `preflight` — step 0 of every run. Imports every dependency,
    verifies the trainer pin, verifies the dataset layout. Fails
    loudly, by name, before any GPU time is spent.
  - `train --config <character.json>` — runs one character's LoRA
    training with preflight first, and prints a `TRAIN_DONE` line with
    the real return code.
  - `collect --output-root <dir>` — lists every produced
    `.safetensors` with bytes and sha256.
- **Configs:** `configs/` holds the two owed trainings — Dorowani and
  Wispkin Illustrious XL LoRAs — at the exact recipe of record
  (dim 32 / alpha 16, 12 epochs, seed 42).
- **Kaggle package:** `kaggle/wielder_train_kernel.py` — the fixed
  re-run of the failed 2026-10-28 job (verified tag checkout, checked
  requirements install, preflight as step 0, collected manifest).
  Launched by Doro through the browser; nothing here launches itself.

## Why this exists

On 2026-10-28 the previous training job produced nothing: a truncated
git pin failed to check out, the requirements install broke on an
upstream `-e .` line, `ftfy` never landed, and both trainings died.
Every one of those failure points is now a Wielder gate or a Wielder
fix, named in `BUILD-REPORT.md`.

## Status

Local proof (preflight pass/fail behaviour, trainer help, config
parsing, a CPU micro-smoke through the trainer's own LoRA code) is
recorded in `BUILD-REPORT.md` and `proof/`. Full GPU training is
proven only when the Kaggle package runs and its `COLLECTED` manifest
lists two real LoRAs — until then this lane is wired, not proven.

## Related

A separate LoRA fix package from another lane lives at
`show/production/tooling/avatar-stack/gpu-4090/` in this repo (landed
as PR #15): the 4090 video pack's fix notes for the Wan video LoRA
path. That is a **different artifact** from this package — this one is
Wielder Train, the SDXL/Illustrious stills trainer lane under
`show/production/wielder/training/`. The two are linked here for
cross-reference only; they are not merged and neither duplicates the
other.
