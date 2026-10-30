# Mochiichao Wielder Training Package

The runtime subset of **Wielder Train** (the Mochiichao show's LoRA
training lane), packaged as a Kaggle dataset so the training kernel can
stage it into its working directory.

## Contents

`wielder-training/` — exactly what the kernel needs at run time, and
nothing else:

- `requirements-wielder.txt` — the pinned, complete dependency set
  (ftfy first-class; the omission that killed the 2026-10-28 morning
  run is regression-pinned by the preflight below)
- `wielder_train/` — the Wielder wrapper package: `preflight.py`
  (step 0 of every run — imports every dependency, verifies the
  trainer pin and the dataset layout, fails loudly before any GPU
  time is spent) and `cli.py`
- `configs/` — the four training configs (Dorowani + Wispkin
  Illustrious XL dataset TOMLs and parameter JSONs)

Deliberately NOT in here: the vendored trainer (the kernel clones
kohya sd-scripts itself at the verified tag v0.12.3 pin), the proof
venv, proof artifacts, and the kernel script — those live in the repo
copy at `show/production/wielder/training/`.

## How the kernel uses it

Attach this dataset (`marsfmmg/mochiichao-wielder-training`) to the
`mochiichao-wielder-train` kernel alongside
`marsfmmg/mochiichao-likeness-datasets`. The kernel stages this
package automatically as its first step: it searches `/kaggle/input`
for the folder holding both `requirements-wielder.txt` and
`wielder_train/preflight.py`, copytrees it to
`/kaggle/working/wielder-training`, and prints `PKG_STAGED <source>`.
If the dataset is not attached, the kernel aborts loudly with
`WIELDER_ABORT wielder-training package dataset not attached` before
anything else runs.

## Licence

The Wielder wrapper contents are Apache-2.0. The trainer the kernel
installs (kohya sd-scripts v0.12.3) is Apache-2.0 under its own
licence; the base model (Illustrious-XL-v2.0, downloaded separately
from Hugging Face) is CreativeML OpenRAIL-M, free-but-restricted.
Full provenance: `PROVENANCE.md` in the repo copy.
