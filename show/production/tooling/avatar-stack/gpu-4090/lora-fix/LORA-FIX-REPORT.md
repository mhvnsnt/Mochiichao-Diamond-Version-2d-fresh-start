# LORA-FIX REPORT — the base-model mismatch, and the industry-standard fix

Date: 2026-10-28. **GPU training: NOT RUN.** No LoRA was trained, converted, or
loaded in this pass. Everything below is verified research + built, tested
packages that run when the 4090 seat is rented. Nothing was pushed to GitHub.

## The mismatch, in plain words

A LoRA is a small set of learned weights that only makes sense inside the
**exact** base model it was trained on — same architecture, same latent
channels, same everything. Our two character LoRAs (Wispkin, Dorowani) were
trained on **Wan2.1 T2V-1.3B**. The show's video scene runs **Wan2.2
TI2V-5B**, a different model (different VAE, 48 latent channels vs 16). The
files physically do not load there. There is no converter that fixes this —
anyone selling one is selling a file that loads and means nothing.

Why it happened: the trainer used at the time, kohya-ss/musubi-tuner, simply
has no TI2V-5B training task. That was verified when the LoRAs were trained,
and it is **still true today** (re-verified 2026-10-28, same commit
`f8a1b03`). The repo's own verdict stands: *"5B LoRA engagement waits on a
TI2V-5B-capable trainer or a 1.3B scene variant."* This package delivers both.

## The industry-standard fix

Train the adapter **for** the base it will run on, from a proper multi-view
character dataset. That is what every serious pipeline does; it is also the
repo's own named round-2 direction ("round-2 LoRAs want real model sheets —
front/¾/side/back + expressions").

### Trainer verification (at source, 2026-10-28 — full table in `path-b-5b-retrain/TRAINER-VERIFICATION.md`)

| Trainer | TI2V-5B LoRA? | Proof |
|---|---|---|
| **modelscope/DiffSynth-Studio** (Apache-2.0) | **YES — ships a named recipe** | `examples/wanvideo/model_training/lora/Wan2.2-TI2V-5B.sh` @ `e5a44c4`: rank 32, lr 1e-4, 5 epochs, targets `q,k,v,o,ffn.0,ffn.2`, 480×832, 49 frames |
| **ostris/ai-toolkit** (MIT) | **YES — dedicated code, no example config** | `wan22_5b_model.py` @ `b69b9831`: `class Wan225bModel, arch = "wan22_5b"`; README lists `Wan-AI/Wan2.2-TI2V-5B-Diffusers`. `config/examples/` has a Wan2.2 **14B** 24GB example only — 5B config adapted from it, changes marked |
| kohya-ss/musubi-tuner (Apache-2.0) | **NO (unchanged)** | `docs/wan.md` task list + `WAN_CONFIGS` keys contain no `ti2v-5B`; `wan_train_network.py` restricts `--task` to those keys |
| huggingface/diffusers examples | **NO** | `examples/` @ `51349f7` has CogVideoX trainers, no Wan trainer at all |
| huggingface/finetrainers (Apache-2.0) | **NO for 2.2** | `docs/models/wan.md` tested-checkpoint list is Wan2.1 only |

## Path B — PREFERRED: retrain for TI2V-5B (`path-b-5b-retrain/`)

Two independent routes from one dataset, so a trainer problem can't block us:

- **B1 DiffSynth-Studio (primary):** `diffsynth/train_<char>_ti2v5b.sh` +
  `_lowvram_4090.sh`. All hyperparameters are the trainer's own shipped
  TI2V-5B recipe; the single flagged deviation is `dataset_repeat` 100 → 20
  (our dataset is bigger than their example set; rationale in the script).
  24GB levers are the trainer's own documented flags (`--fp8_models "dit"`,
  `--enable_model_cpu_offload`; gradient checkpointing is forced on by
  DiffSynth itself). DiffSynth publishes no numeric VRAM figure, so "fits
  24GB" is a first-run measurement, not a promise — fallbacks are written
  into the README and run plan.
- **B2 ai-toolkit (stills cross-check):** `aitoolkit/train_<char>_ti2v5b_24gb.yaml`,
  adapted from ai-toolkit's own Wan2.2 24GB example with every change
  commented (arch/model → `wan22_5b` / `Wan-AI/Wan2.2-TI2V-5B-Diffusers`;
  MoE-only keys removed — the 5B is a single transformer; the 14B
  accuracy-recovery `qtype` file **removed**, because no 5B adapter file was
  verified and inventing the path would break the run).

**Dataset — from the REFERENCE PACKS (owner clarification, 2026-10-28).**
The multi-view stills live in the packs
(`avatar-stack/reference-packs/<char>/`); it was the *video* packs that held
one view. Spec (`DATASET-SPEC.md`): front + three-quarter + side + back +
expressions, minimum 36 stills / 24 clips per character, target 60 / 36.
`build_dataset_from_refpacks.py` reads each pack's `pack.json`, expands every
CANON view with the repo's proven recipe (plain backgrounds × scales, crops,
trigger-first captions — `CAPTIONING.md`; Wispkin never flipped, Dorowani
flip allowed), hashes every source, and writes both dataset forms;
`make_clips.py` renders the DiffSynth 49-frame clips from those stills.
**Both tools were test-run locally** (on the in-repo pack state): the builder
produced items + a gap report, and the clip renderer produced verified
49-frame 832×480 clips.

**Dataset gap flag (not an assumption):** the in-repo pack folder currently
lists `front.png` per character with the other slots marked GAP in
`pack.json`/`PACK-MANIFEST.md`. Per the owner's clarification, the packs hold
the multi-view stills — a parallel **sheets audit is inventorying exactly
which views each pack holds** (including where they are staged). So both
characters are flagged **PROVISIONAL GAP — front confirmed in-repo;
¾/side/back/expressions pending audit confirmation**. If the audit confirms
the views, the builder consumes them with no change. If a pack turns out
short, that character is a named dataset gap — it does not get quietly
trained front-only.

**What Path B needs to actually run:** the audit-confirmed pack stills; a
single 24GB 4090 seat; planning-estimate GPU time (NOT measured): ~1–3 h per
character for B2 stills, ~4–10 h per character for B1 clips — then the repo's
preflight + frame-1 + likeness gates in the 5B scene.

## Path A — STOPGAP: a 1.3B scene the existing LoRAs load in (`path-a-13b-scene/`)

The repo's own locked wrapper workflow already runs the LoRAs' exact training
base (Wan2.1 T2V-1.3B) with the VACE 1.3B reference lock — it just never had
the LoRA wired in. `workflow-vace-13b-lora-<char>.json` (both characters,
generated programmatically from the repo file so nothing drifted) adds
exactly: a `WanVideoLoraSelect` node with the existing LoRA @ strength 0.8,
wired into `WanVideoModelLoader`'s `lora` input (not the stale `lora_args`),
and the trigger token in the prompt. Labelled honestly: **lower-quality
stopgap** (1.3B ceiling; the LoRAs themselves are front-view anchors trained
on 1–2 artworks), **not yet run**, retires the moment a Path B LoRA passes
the gates in the 5B scene.

## Recommendation

**Path B, B1 first, with Path A as the working stopgap in the meantime.**
Reason: B is the only path that ends with the show's actual scene model (5B)
holding the characters — A spends GPU time polishing a scene we intend to
leave. Run A once on the seat first anyway (it is cheap and it finally
exercises the locked workflow end-to-end), then train B while A covers
drafts. The deciding factor for B's schedule is not the seat — it is the
sheets audit confirming the pack views.

## Sources

- Trainer verification table + URLs: `path-b-5b-retrain/TRAINER-VERIFICATION.md`
- Existing-state evidence: `~/workspace/mochiichao-4090-production/research/EXISTING-DECOMP-EXTRACTION.md` §7.1–7.2; repo files fetched and read for this pass: `avatar-stack/lora/{LORA-MANIFEST.md, train_dorowani.toml, dataset_dorowani.toml, build_datasets.py, DATASET-SOURCES.md}`, `avatar-stack/parity/{workflow-i2v-locked.json, workflow-i2v-locked-wrapper.json, workflow-turbo-fixed.json}`, `avatar-stack/reference-packs/{PACK-MANIFEST.md, README.md, dorowani/pack.json, wispkin/pack.json}` (all in `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start` @ main, 2026-10-28).
- Trainer repos: https://github.com/modelscope/DiffSynth-Studio · https://github.com/ostris/ai-toolkit · https://github.com/kohya-ss/musubi-tuner · https://github.com/huggingface/diffusers · https://github.com/huggingface/finetrainers
