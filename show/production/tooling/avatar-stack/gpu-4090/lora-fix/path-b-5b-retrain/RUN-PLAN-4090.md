# Run plan — Path B on a single 24GB RTX 4090 (RunPod/Vast seat)

**Training has NOT been run.** This is the plan for when the seat is rented.
Times below are planning estimates, labelled as such — no TI2V-5B LoRA
training time has been measured on our hardware yet.

## Before the seat (no GPU needed)

1. Sheets audit reports the reference packs' view inventory.
2. `python3 build_dataset_from_refpacks.py --pack-root <repo>/show/production/tooling/avatar-stack/reference-packs --character dorowani` (and `wispkin`).
   Read `BUILD-REPORT-<char>.json`: every CANON view became items; every short
   slot is a named gap. If a character is front-only after the audit, that
   character's run waits or proceeds front-weighted **only** with the owner's
   written acceptance of the limitation.
3. Eyeball the contact set: no baked shadows, no mirrored Wispkin, captions
   start with the trigger.

## On the seat

4. Clone trainers at the verified commits (or later, re-checking the task list):
   DiffSynth-Studio @ `e5a44c427769`, ai-toolkit @ `b69b98314557`.
5. **Route B1 (DiffSynth, primary):**
   `python3 make_clips.py --character <char>` → copy `diffsynth/dataset/<char>/`
   to the seat as `data/mochiichao/<char>/` → run
   `diffsynth/train_<char>_ti2v5b_lowvram_4090.sh` (confirm flags first with
   `train.py --help`). Output: `models/train/<char>_ti2v5b_lora/epoch-4.safetensors`.
6. **Route B2 (ai-toolkit, cross-check / fallback):** copy
   `aitoolkit/datasets/<char>/` into the ai-toolkit checkout, run
   `python run.py config/train_<char>_ti2v5b_24gb.yaml` (per ai-toolkit README's
   own run instructions). Watch the every-250-step samples.
7. First-load check: load the new LoRA into the existing 5B scene workflow
   (the pack's `gpu-4090/workflows/` / repo `parity/workflow-turbo-fixed.json`
   pattern — `WanVideoLoraSelect` feeding `WanVideoModelLoader`'s `lora` input).
   A load error here means a format problem, and it is reported as one — never
   silently dropped.
8. Gate run: one locked scene per character → `parity/preflight.py` rules →
   frame-1 gate → likeness gate. Only a pass retires Path A.

## GPU time — ESTIMATES ONLY (not measured)

| Route | Planning allowance per character | Basis |
|---|---|---|
| B2 ai-toolkit stills (2,000 steps, images) | ~1–3 GPU-hours | Step count from ai-toolkit's own example guidance; image-mode training is the cheap form |
| B1 DiffSynth clips (24–36 clips × repeat 20 × 5 epochs, 49f @ 480×832) | ~4–10 GPU-hours | Planning allowance scaled from the sample count; video training is the expensive form. Measure the first 50 steps on the seat and re-project before committing the full run |

At the verified RunPod Community 4090 rate ($0.34/hr, see the production
pack's host verification), even the high end of both routes for both
characters is on the order of tens of dollars — the seat is not the cost
problem; the dataset views are the schedule problem.
