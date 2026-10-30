# Episode Foundry — batch kernel + gate/stitch (this lane's pieces)

Continuous clip factory for EP01: generate cuts back-to-back from the
repo's own material, grade every clip, stitch only the passes. This
folder is shared by several lanes; this README covers the batch-kernel
+ gate/stitch lane (foundry steps 3, 4, 6) and how its pieces fit the
others.

## Pieces

| File | What it does |
|---|---|
| `kernel/foundry_kernel.py` | Single Kaggle kernel script, road **vace-local**. Stages VACE-1.3B weights + likeness references once from the attached datasets, starts ComfyUI in-kernel, loops the cut queue: per-cut preflight → VACE job from the verified attempt-3 workflow → wait via `src/comfy_wait.py` (depended on, never reimplemented) → per-cut outputs + resumable `cut-ledger.json` in `/kaggle/working/foundry-out/`. |
| `src/gate.py` | Local per-clip grading implementing the finish-gate clauses: FRAME1 (MAD vs the FED reference, ≤ 40.0), LIKENESS_SAMPLE (SSIM/IoU/MAD vs CANON at first/mid/last), MOTION (frame-difference floor), BG_PERSIST (finish-gate bg_presence). Reuses finish-gate / likeness-gate measurer math with attribution in the docstring; thresholds are never edited here or there. |
| `src/stitch.py` | Gated assembly: concatenates ONLY gate-PASS clips in manifest order (1280x720/24 fps re-encode), writes `ep01-foundry-assembly.mp4` + `assembly-ledger.json`. Optional `--scratch-audio` silent bed, labelled scratch. `--self-test` runs the full gate+stitch path on synthetic clips. |
| `src/keyframe_feed.py` | SDXL keyframe source (Illustrious-XL-v2.0 + per-character LoRAs): start+end keyframes per cut, each likeness-graded, written as `keyframes.json` + `keyframes-index.json` in the shape the kernel queue consumes (`keyframe_start`/`keyframe_end`). Includes the owed `--proof` runner (3 graded prompts per character). **State: ready-to-run, BLOCKED on the SDXL LoRA dataset** — see below. |
| `data/cut-manifest.json` | The 107-cut manifest (separate lane). Schema verified by this lane: list of 107, V3-001..V3-107, 1260 s total. |
| `src/comfy_wait.py` | The fixed ComfyUI wait client (separate lane). The kernel imports `wait_for_completion(base_url, prompt_id, *, deadline_s, poll_s=5.0, log=print)` from it. |
| `flow-recipe/` | The flow-replica road's recipe (separate lane). |

## Roads + proof order

The foundry is multi-road; the cut ledger is road-agnostic and every
entry records its `road`: `flow-replica`, `vace-local` (the kernel
here), `part-pack`. Proof order per the owner addendum: the proof cut
runs the **flow-replica road first**; the vace-local kernel's proof run
follows. (Which historical pipeline produced the owner's two proven
clips is being settled by the stock-take lane from the source folders'
own records; nothing here asserts that attribution.)

## Frame-chaining

Where consecutive queue entries opt in (`continuous` /
`continuous_with_prev`), a cut's fed reference is the previous cut's
last frame. The kernel ledger records `reference_source` = `canon` |
`chained:<prev_cut_id>` plus the sha256 either way. Grading is NOT
relaxed: `gate.py` checks frame 1 against the reference actually fed
and the likeness clauses against canon.

## Two concurrent sessions (owner addendum 2026-10-28 15:48)

The vace-local kernel is the headline route for the replica of the
owner-graded recipe (Wan 2.1 + VACE substitutes for Google Flow /
Veo 3.1 Lite, whose free credits imposed the 5 clips/day cap on the
original — attribution settled from the records, see
flow-recipe/FLOW-RECIPE.md §0; self-hosting the substitute removes
the per-use cap). It runs
as one of TWO concurrent Kaggle sessions over disjoint ranges:
`--shard A|B` (contiguous halves), `--range A:B`, or `--cuts id,...`
(env: `FOUNDRY_SHARD` etc.). Each session writes
`cut-ledger-<shard>.json`; the merge rule (DONE wins, earliest DONE
is canonical, GPU seconds never double-count) is implemented in the
kernel's `merge_ledgers()` and runnable standalone via
`--merge-ledgers`. On start, a session folds in DONE cuts from prior
shard ledgers found in its inputs — restart-chaining. Every session
appends its GPU-seat wall-clock to the ledger's `sessions` list.
Spec note: `THROUGHPUT-ARCH.md` / `CAP-ANALYSIS.md` had not landed
when this was built; the kernel docstring's design notes are that
spec's input.

FP16: the VACE UNET + VAE are the FP16 staged variants (T4-native).
The UMT5 text encoder exists in the staged datasets only as the FP8
scaled build — it loads via dequant on T4 (no FP8 acceleration);
flagged in the kernel docstring + run log, not silently swapped.

## Pace

Headline pace = **finished seconds of PASSED video per GPU hour**
(secondary: cuts per GPU hour), computed in `stitch.py`'s assembly
ledger from gate verdicts + recorded GPU time (`gpu_seconds` in gate
records / kernel ledger, or `--gpu-hours`). Kernel shard ledgers
record per-cut `gpu_seconds` + per-session wall-clock so the merge
can total GPU hours across sessions. Kaggle budget reality:
~30 GPU hrs/week.

## VACE workflow verdict (from the artifact itself)

`ep01-rebuild/proof/vace-attempt3/workflow.json` (sha256 c9058122…):
the reference path IS engaged — node 8 `LoadImage` (canon cutout) →
node 9 `WanVaceToVideo.reference_image`; control video node 6 →
node 9; masks node 7 → node 14 `ImageToMask` → node 9; strength 1.0;
480x768, length 49 @ 16 fps (the node title's "832x480" is stale).
GAP: no `TrimVideoLatent` — the parity preflight treats the missing
trim wire as a lock failure. The kernel repairs it by default and
records the repair per cut (`FOUNDRY_EXACT_PROOF_GRAPH=1` reproduces
the proof graph and downgrades the gap to a warning). Full node table
in the kernel docstring.

## keyframe_feed state

READY-TO-RUN / BLOCKED-ON-DATASET. `FOUNDRY_SDXL_DATASET` is not set
and the Illustrious LoRAs (`dorowani_illustrious_lora.safetensors`
456,488,296 B; `wispkin_illustrious_lora.safetensors` 456,488,264 B)
are not staged on this machine; `python3 src/keyframe_feed.py --check`
exits 3 with a named BLOCKED message (no traceback). The 87 MB Wan 2.1
LoRAs in `marsfmmg/mochiichao-character-loras` are different files for
a different base model and are NOT consumed here. torch/diffusers are
also not installed on this VM — generation belongs on the GPU seat.

## Acceleration (accel layer, added 2026-10-28)

Full teardown: `accel/ACCEL-TEARDOWN.md` (31 candidates verified at
source — 5 wired, 7 test-on-proof, 19 rejected with evidence).
Wiring: `kernel/accel_profile.py`, consumed by the kernel via
`FOUNDRY_ACCEL` — unset = `baseline`, the proven recipe unchanged
(asserted byte-identical by `accel/test_accel_profile.py`, PASS).
Named profiles: `accel-lite` (25 steps + torch.compile),
`accel-a` (20 steps + torch.compile, SDPA pinned — the A/B arm),
`accel-b` (accel-a + core EasyCache). Transforms touch only
KSampler scalars and model-patcher links; VACE reference/control
wiring and the gate are untouched, and every cut's ledger entry
records the transforms in `workflow_repairs`. No distill artifact
exists for the VACE-1.3B native graph (LightX2V/FastWan/CausVid
are 14B-or-T2V; the one 1.3B few-step VACE checkpoint is a
post-proof separate experiment — teardown §1.4). Promotion of any
profile to default is decided only by `accel/AB-PROTOCOL.md`
(faster AND same gate pass, on proof cut V3-078).

## Self-test (run 2026-10-28, real output)

`python3 src/stitch.py --self-test` → PASS. One moving synthetic clip
graded PASS (frame-1 MAD 1.052; motion mean diff 2.4415) and stitched
(assembly 1280x720/24 fps, 1.0 s); one static clip excluded
(MOTION 0.0008 → `slideshow still`); one all-white clip excluded
(24/24 white frames → `background disappeared`). Pace demo from the
recorded 0.5 GPU h: 2.0 finished s/GPU h. Artefacts under
`selftest-out/`.
