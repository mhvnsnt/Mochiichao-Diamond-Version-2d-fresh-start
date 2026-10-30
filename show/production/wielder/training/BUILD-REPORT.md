# Wielder Train — Build Report (2026-10-28)

## In plain words

The training job that failed this morning did not fail because the
trainer was wrong. It failed because the trainer was installed badly:
an unverified pin, a broken install, and nobody checked the environment
before the training started. So Wielder Train is the same
industry-standard trainer, pulled in properly this time — pinned to an
exact version, with a complete dependency set, a Wielder name and
wrapper on everything that is ours, and a preflight gate that makes
the exact failure that killed the last run impossible to repeat
silently. The full GPU training itself is packaged and ready for
Kaggle; it has not been run yet, and nothing below claims it has.

## The pick, with the evidence

Primary trainer: **kohya sd-scripts, tag v0.12.3** — vendored.

Checked at source today (GitHub API, 2026-10-28):

| Candidate | Stars | Licence (from source) | Last push | Verdict |
|---|---|---|---|---|
| kohya-ss/sd-scripts | 7,252 | Apache-2.0 (LICENSE.md read) | 2026-10-28 | **PICKED** — the dedicated SDXL/Illustrious LoRA trainer; the recipe, dataset format and owed configs are already in its format |
| bmaltais/kohya_ss (GUI) | 12,641 | Apache-2.0 | 2026-08-01 | A GUI wrapper around sd-scripts. Its adoption is evidence for the pick; a GUI is dead weight on a headless seat, so nothing extra to vendor |
| ostris/ai-toolkit | 12,496 | MIT | 2026-10-27 | Strong, but FLUX-first general toolkit; swapping to it would change the recipe and dataset format for no owed benefit. Named fallback |
| huggingface/diffusers | 34,823 | Apache-2.0 | 2026-10-28 | A library, not a trainer; already in the stack as sd-scripts' dependency |
| Nerogar/OneTrainer | 3,254 | AGPL-3.0 | 2026-10-26 | Less adoption, heavier copyleft. Not picked |
| bghira/SimpleTuner | 2,949 | AGPL-3.0 | 2026-10-28 | Same. Not picked |
| kohya-ss/musubi-tuner | 2,119 | No root LICENSE file; README has a per-directory licence section | 2026-10-12 | Already ours for Wan **video** LoRAs — a different job. Accounted for, not duplicated |

So, plainly: **the trainer the failed run used IS the industry
standard.** The deliverable is that trainer pulled in properly, not a
novelty swap. No closed or proprietary tool is involved anywhere in
this lane — the standard is open source (Apache-2.0), so nothing had
to be decompiled or worked around; that case does not arise here, and
this report says so on the record. The one restricted item in the
chain is the base model, Illustrious-XL-v2.0, whose licence is
CreativeML OpenRAIL-M (free-but-restricted) — labelled as such in
PROVENANCE.md, never called open source.

## What actually killed the failed run (root cause, from its own log)

Read from `proof/sdxl-lora-train/extracted/out-collect/RUN-LOG.txt`:

1. `git checkout cb70b9685899` — a **truncated** hash — errored
   ("pathspec did not match"). The run continued anyway on an
   unpinned default HEAD. The full pin is
   `cb70b96858477e716a2096292ab8aab433277f38` (= tag v0.12.3).
2. `pip install -r requirements.txt` errored at line 58: upstream's
   trailing `-e .` (an editable install of the trainer itself)
   resolved against the wrong working directory, so the install broke
   partway. Upstream **did** list `ftfy==6.3.1` — it simply never
   landed.
3. Both trainings then died on `ModuleNotFoundError: No module named
   'ftfy'`, rc 1 each, zero .safetensors. Kaggle still stamped the
   kernel "Successfully ran."

Every one of those three points is now a Wielder fix or gate (below).

## What is wired

Package: `~/workspace/ep01-rebuild/wielder-training/` (53 MB excluding
the local proof scratch):

- `vendor/sd-scripts/` — the trainer at v0.12.3, commit
  `cb70b96858477e716a2096292ab8aab433277f38` (git HEAD verified against
  the pin after cloning). Upstream code and its licence notices are
  untouched. Per-file sha256 for the whole tree: `vendor-sha256.txt`.
- `wielder_train/` + `wielder-train` — our wrapper. Ours carries the
  Wielder name only; upstream names live in PROVENANCE.md and in the
  vendored licence notices, where the licence requires them.
- `wielder_train/preflight.py` — **step 0 of every run, the regression
  pin.** Imports every dependency by name (ftfy first), imports the
  trainer's entry module itself (so omissions in any dependency list
  fail here, by name), verifies the trainer pin (git HEAD or per-file
  sha256), and verifies the dataset layout (every image must have its
  caption). Exit 1 with a `PREFLIGHT_FAIL` line and named failures —
  before any GPU time exists to waste.
- `requirements-wielder.txt` — the seat dependency set, from the
  trainer's own requirements at the pin, with the `-e .` line removed
  (documented in the file), ftfy first-class, and the two
  upstream-unpinned deps pinned. Plus a fourth fix the preflight's
  first run earned: **torchvision added** — the trainer's library
  imports it, upstream never lists it, and seats usually preinstall
  it. Our own first local run caught it the same way ftfy was caught
  on Kaggle; it is now listed and preflight-checked.
- `requirements-lock.txt` — a full `pip freeze` (65 lines) of the
  proof venv: the exact resolved set that passed.
- `configs/` — the two owed trainings, Dorowani and Wispkin
  Illustrious XL LoRAs, recipe **unchanged** from the failed run's own
  command line: dim 32 / alpha 16, 12 epochs, seed 42, lr 1e-4 /
  text-encoder 5e-5, adamw8bit, cosine, fp16, gradient checkpointing,
  cache_latents, save every 4 epochs, min_snr_gamma 5. The standard
  trainer's defaults were not substituted — this is the same trainer,
  so there was nothing to reconcile; the dataset TOMLs are carried
  over from the verified set unchanged.
- `kaggle/wielder_train_kernel.py` — the fixed re-run, packaged:
  tag checkout + full-commit verification (abort on mismatch),
  requirements install with its return code checked (abort on
  failure), preflight as step 0, per-character `TRAIN_DONE <char> rc
  <n>` lines, and a final `COLLECTED` manifest (name, bytes, sha256
  per .safetensors) written to `out-collect/sdxl-lora-files.json`.
- `PROVENANCE.md` — source, version, licence (verified, bucketed) and
  hashes per component, including the candidates not picked and why.

## What is proven (checked against artifacts, 2026-10-28)

All proof outputs are in `proof/`:

1. **Preflight fails loudly when the environment is broken.** Run
   under the bare system Python: exit 1, `PREFLIGHT_FAIL`, ftfy named
   first among the missing — the failed run's exact defect, caught in
   under a second (`proof/preflight-negative-system-python.txt`).
2. **Preflight passes when the environment is right.** In a workspace
   venv built from requirements-wielder.txt (torch CPU wheel +
   torchvision installed under ~/workspace, never /tmp): exit 0,
   `PREFLIGHT_PASS` — 23/23 dependency imports OK, trainer entry
   module import OK, pin OK (git HEAD + 3 file hashes), dataset
   verified (`proof/preflight-positive-venv.txt`).
3. **The trainer runs.** `sdxl_train_network.py --help` exits 0 in
   that venv (`proof/trainer-help.txt`).
4. **Both configs parse.** Both character JSONs and both dataset
   TOMLs load clean.
5. **The trainer's own LoRA code produces a real file on CPU.**
   `proof/micro_smoke.py` drives the vendored trainer's
   `networks.lora` (create_network at the owed dim 32 / alpha 16 →
   apply_to → save_weights) on a tiny throwaway UNet: 12 LoRA modules
   created, and `proof/micro-smoke-lora.safetensors` on disk —
   171,008 bytes, 54 tensors, sha256
   `95593c5332485f7a22b408c940d087690f82d92e518c6087e74c4ebce0d82c61`,
   read back through safetensors. This proves the trainer core is
   alive end to end at code level. It is **not** a trained character
   LoRA and is never presented as one.
6. **Dataset verified again locally:** 28 captioned Dorowani stills +
   26 captioned Wispkin stills in the verified extraction (the same
   set Kaggle hash-verified as 114 files including its config files).

One honest wrinkle: bitsandbytes prints a CPU warning on import
(it looks for an optional `kernels` package). The import succeeds and
the optimizer seat is a GPU seat, where that path differs; noted, not
hidden.

## What is not proven, and whose step it is

- **Full GPU training of the two character LoRAs: NOT run.** The
  fixed Kaggle package is ready; launching it is **Doro's step**
  (browser, Kaggle web UI — this lane does not launch Kaggle runs).
  Success standard for that run: its `COLLECTED` manifest lists
  `dorowani_illustrious_lora.safetensors` and
  `wispkin_illustrious_lora.safetensors` with sizes and sha256, and
  both `TRAIN_DONE` lines read rc 0. Until then the LoRAs do not
  exist and their quality is unjudged — the keyframes proof that
  grades them stays blocked behind this run, as before.
- **Landing into the repo: NOT done by this lane** (the repo is
  mid-move under other lanes today). Proposed home:
  **`show/production/wielder/training/`** — inside Wielder's landed
  home from PR #488, because the routing rule makes Wielder the
  execution layer for production work, this lane is a Wielder
  capability, and Wielder's charter is self-contained/one-folder-lift:
  a sibling under `show/production/tooling/` would split Wielder's
  training arm away from Wielder. Landing notes for whoever lands it:
  strip `vendor/sd-scripts/.git` (the pin then rests on
  `vendor-sha256.txt` + the preflight file hashes, which handle both
  cases), and exclude this workspace's `scratch/` entirely (it is the
  local proof venv/cache, ~2 GB, installation not staging). One
  cross-reference owed at landing: another lane's LoRA fix package
  already sits under `show/production/tooling/avatar-stack/gpu-4090/`
  (PR #15 in the private repo) — that is the 4090 video pack's fix
  notes, a different artifact from this trainer lane; the landing
  should link the two, not merge or duplicate them.

---

## Corrective addendum — kernel v1 staging failure, fixed (2026-10-28)

Under the owner's corrective-autonomy law: the failure was logged,
diagnosed to root cause, fixed, and the fix proven locally the same
day. The original report above is unchanged; this addendum supersedes
its "fixed Kaggle package is ready" line — v1 of that package was NOT
ready, for the reason below.

### What happened (from the run's own log)

Kernel `marsfmmg/mochiichao-wielder-train` v1 failed after 34.7s
(2026-10-28 12:10 CDT), before preflight, before any GPU training:

- `DATASET_LAYOUT_EXTRACTED` printed — the likeness dataset staged
  fine.
- `TRAINER_PIN_VERIFIED cb70b96858477e…` printed — the trainer pin
  fix from the morning's failure held.
- Then: `pip install -r /kaggle/working/wielder-training/requirements-wielder.txt`
  → "No such file or directory" → `WIELDER_ABORT requirements install
  failed`. Preflight never ran.

### Root cause — two staging gaps of the same class

1. **The package was never staged into the kernel.** The v1 script
   set `PKG=/kaggle/working/wielder-training` with the comment "this
   package, uploaded as a dataset/code file set" — but the script
   contained no step that stages that folder from an attached
   dataset into `/kaggle/working`, and the launch only attached
   `marsfmmg/mochiichao-likeness-datasets`. A Kaggle kernel's working
   dir starts empty except its own single code file, so the
   requirements path simply did not exist.
2. **The base model had the same gap.** The v1 script only looked
   for Illustrious-XL-v2.0 in the local HF cache and contained no
   download step; a fresh kernel's cache is empty. The failed morning
   run had the model only because its own setup fetched it.

### The fixes (in `kaggle/wielder_train_kernel.py`; everything else
in the script is behaviour-identical — tag pin + HEAD verify,
rc-checked install, preflight as step 0, TRAIN_DONE lines, COLLECTED
manifest, final abort logic)

1. **Package staging is the new first step of `main()`**
   (`stage_package()`): if PKG already contains
   `requirements-wielder.txt` + `wielder_train/preflight.py`, use it
   and print `PKG_ALREADY_PRESENT`. Else search `/kaggle/input`
   recursively for a directory containing both, copytree it to PKG,
   and print `PKG_STAGED <source>`. If none is found:
   `WIELDER_ABORT wielder-training package dataset not attached` —
   loudly, before anything else runs.
2. **Base model** (`ensure_base_model()`): search the HF cache AND
   `/kaggle/input` first. If no Illustrious-XL `.safetensors` exists,
   download from HF repo `OnomaAIResearch/Illustrious-XL-v2.0` — the
   exact file `Illustrious-XL-v2.0.safetensors` first (that is the
   filename the failed morning run's own kernel script downloaded and
   verified), then an API file-list pick by verified size, then a
   snapshot fallback. The obtained file is size-verified against
   6,938,040,674 B and `ILLUSTRIOUS_VERIFIED <size> <path>` printed;
   any size mismatch aborts.
3. **Header comment** now lists BOTH datasets under "Expected Kaggle
   setup": `marsfmmg/mochiichao-likeness-datasets` AND
   `marsfmmg/mochiichao-wielder-training`.

### The package dataset payload (new)

`kaggle-dataset/` holds what Doro attaches at the next launch:

- `wielder-training/` — runtime subset ONLY: `requirements-wielder.txt`,
  the whole `wielder_train/` package, and all 4 files of `configs/`.
  No vendor/, no scratch/, no proof/, no kaggle/.
- `wielder-training-pkg.zip` — zip of that folder (paths start with
  `wielder-training/`), 10,047 B, sha256
  `1c55d15efb76038741f1eebe52d73b08be9696704e265bbb4cc660e79893fd42`.
- `dataset-metadata.json` — id `marsfmmg/mochiichao-wielder-training`,
  title "Mochiichao Wielder Training Package", licences naming
  Apache-2.0 for the Wielder wrapper contents.
- `README-dataset.md` — what it is, and that the kernel stages it
  automatically as its first step.

### Local proof (artifacts in `proof/`)

- `python3 -m py_compile kaggle/wielder_train_kernel.py` — OK.
- `proof/staging_test.py` simulates the Kaggle layout (zip extracted
  under a fake `/kaggle/input`, empty fake working dir) and calls the
  patched script's own functions — no pip installs, no training:
  - Patched (`proof/staging-test-patched-2026-10-28.txt`):
    `PKG_STAGED` fires and finds `requirements-wielder.txt` (2,563 B)
    + `wielder_train/preflight.py` (7,572 B); a second call prints
    `PKG_ALREADY_PRESENT`; with no dataset attached it aborts
    `WIELDER_ABORT wielder-training package dataset not attached`
    (SystemExit 1); `find_base_model` returns None on empty roots and
    finds a sparse dummy of exactly 6,938,040,674 B (size-check path).
    `PATCHED_TEST_PASS`.
  - Original logic (`proof/staging-test-original-2026-10-28.txt`):
    the same harness against v1's logic (hard-coded PKG, nothing
    staged) reproduces the v1 failure verbatim — pip:
    `ERROR: Could not open requirements file: [Errno 2] No such file
    or directory`, rc 1, and the cache-only model check finds nothing.
    `ORIGINAL_TEST_FAILS_AS_EXPECTED`. That pair is the regression
    pin for this failure class.
- The download branch itself is NOT locally proven: this VM cannot
  reach the HF API directly (proxy-only egress; the API call fails on
  the proxy/TLS path), so the filename rests on the failed morning
  run's own verified script + log, and the runtime size check +
  abort guard the rest. First proof of the download is the next
  Kaggle run's `ILLUSTRIOUS_DOWNLOADED` / `ILLUSTRIOUS_VERIFIED`
  lines.

### Landing note (repo drift guard)

The patched kernel script and the new `kaggle-dataset/` payload must
ALSO land in the repo via a follow-up PR (landing lane) at
`show/production/wielder/training/`, so the repo copy (PR #25) and
this workspace do not drift: the repo currently holds the v1 script
that just failed. Launching is still Doro's browser step, and it now
requires BOTH datasets attached plus this patched script.
