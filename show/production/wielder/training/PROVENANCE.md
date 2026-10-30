# Wielder Train — Provenance

Every component below was verified at its source on 2026-10-28.
Licence labels come from the actual LICENSE files, never from memory
or from a search snippet. Third-party names appear in this manifest
and inside upstream licence notices only — that is what the licences
require, and it is what keeps the stack legal and free. All of our own
materials (wrapper, configs, docs, kernel package) carry the Wielder
name only.

## Primary trainer (vendored)

| Field | Value |
|---|---|
| Wielder name | Wielder Train (trainer core) |
| Upstream | kohya-ss/sd-scripts |
| Source | https://github.com/kohya-ss/sd-scripts |
| Version | tag `v0.12.3` |
| Commit | `cb70b96858477e716a2096292ab8aab433277f38` |
| Vendored at | `vendor/sd-scripts/` (full git clone at the tag; ~52 MB; per-file sha256 for the whole tree in `vendor-sha256.txt`) |
| Licence | **Apache License 2.0** (open source) — verified from the vendored `LICENSE.md`, whose text begins "Apache License / Version 2.0, January 2004" |
| Licence file sha256 | `e8d3af270e7b15ccab908481e4a8b2da03b27cc7ada3c9826cf709df5eb49c9e` |
| requirements.txt sha256 | `0417f71a8a7be1a18ac5427843376e8f22c666252ceb5d226a3b470adbbeea68` |
| sdxl_train_network.py sha256 | `ba8c8991a9d4b51f5343c503c1d8929fc52f506c53c615058f1e8665696a8c6e` |
| Modifications | None to upstream code. Our dependency file removes upstream's trailing `-e .` line (documented in requirements-wielder.txt) and pins two upstream-unpinned deps. |

Adoption evidence at check time (GitHub API, 2026-10-28): 7,252 stars,
1,228 forks, last push 2026-10-28 (actively maintained). The best-known
GUI for LoRA training, bmaltais/kohya_ss (12,641 stars, Apache-2.0), is
a wrapper around this same trainer — the trainer is the standard's
core, the GUI is optional furniture we do not need on a headless seat.

## Dependencies (from the trainer's own requirements, pinned)

Full resolved set: `requirements-lock.txt` (pip freeze of the proof
venv). Seat set: `requirements-wielder.txt`. Named licences for the
load-bearing pieces, verified at source:

| Package | Version | Licence (bucket) |
|---|---|---|
| ftfy | 6.3.1 | Apache-2.0 (open source) — PyPI project metadata, checked 2026-10-28 |
| torch | seat-provided | BSD-style (open source) — provided by the seat (Kaggle CUDA build / local CPU wheel), not vendored |
| accelerate / transformers / diffusers / safetensors / huggingface-hub | per lock | Apache-2.0 (open source) |
| bitsandbytes | 0.50.2 | MIT (open source) — verified from its GitHub LICENSE file (the PyPI metadata field for 0.50.2 is empty, so the label rests on the LICENSE file, not PyPI) |

## Complements — evaluated, not vendored (no duplication)

| Candidate | Evidence (GitHub API, 2026-10-28) | Disposition |
|---|---|---|
| ostris/ai-toolkit | 12,496 stars, MIT, pushed 2026-10-27 | Strong general toolkit, FLUX-first. Not the SDXL/Illustrious standard; adopting it would swap the recipe and the dataset format for no owed benefit. Named as the fallback if the primary ever stalls. |
| bmaltais/kohya_ss (GUI) | 12,641 stars, Apache-2.0, pushed 2026-08-01 | GUI wrapper over the primary trainer. Nothing to vendor for a headless Kaggle seat; its existence is adoption evidence for the primary. |
| Nerogar/OneTrainer | 3,254 stars, AGPL-3.0 | Smaller adoption; AGPL copyleft is a heavier obligation than Apache-2.0 for a stack we redistribute in a repo. Not picked. |
| bghira/SimpleTuner | 2,949 stars, AGPL-3.0 | Same reasoning as OneTrainer. Not picked. |
| huggingface/diffusers | 34,823 stars, Apache-2.0 | A library, not a trainer; its DreamBooth-LoRA scripts are reference examples. Already present as a dependency of the primary. Not a substitute. |
| kohya-ss/musubi-tuner | 2,119 stars; **no root LICENSE file at source** — its README carries a per-directory licence section (e.g. `wan/` code Apache-2.0; `hunyuan_model/` follows HunyuanVideo's licence) | Already in our stack for Wan video LoRAs. Different job (video, not SDXL stills). Accounted for here so it is never duplicated; not vendored into this lane. |

## Base model (not vendored, not ours)

| Field | Value |
|---|---|
| Model | Illustrious-XL-v2.0 (OnomaAIResearch) |
| Source | Hugging Face, `OnomaAIResearch/Illustrious-XL-v2.0` |
| Size | 6,938,040,674 bytes (verified in the 2026-10-28 run's log) |
| Licence | **CreativeML OpenRAIL-M** — free-but-restricted bucket, verified from the HF model card metadata (`license: creativeml-openrail-m`) on 2026-10-28. Use restrictions in that licence apply to the base model and its derivatives; it is not Apache/MIT and is never labelled as such here. |
| Home | Seat cache (Kaggle HF cache), as in the failed run. Not copied into this package. |

## Dataset (not vendored)

marsfmmg/mochiichao-likeness-datasets (private Kaggle dataset) — the
114-file hash-verified likeness set (Dorowani + Wispkin stills and
captions). Verified good in the failed run; the failure was in the
environment, not the data. Local verified extraction of record:
`~/workspace/ep01-rebuild/proof/sdxl-lora-train/extracted/data`.
