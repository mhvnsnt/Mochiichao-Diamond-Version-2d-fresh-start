# Tier 2 — first locked generation: pre-flight prep (ready, NOT run)

Prepared by the orchestrator run of 2026-10-27 ~22:04 CDT.
No GPU job was started this run. Two things block any GPU run,
and both are still open:

1. The owner latch is OFF: `state.json` `next_action.approved_auto`
   is `false`. GPU jobs run only after the owner flips it to `true`.
2. The timed A/B rerun is already in flight on Kaggle through a
   separate lane (launched before this run). This run did NOT
   duplicate it, and its results have NOT been reported yet.

## What is ready now

- A/B results record template: `tier2-ab-rerun-record-TEMPLATE.md`
  (fields blank until the rerun reports; estimates are not
  measurements).
- Gate packet template: `tier2-gate-packet-TEMPLATE.json`
  (`PENDING_VERIFICATION` only; mirrors the runner's packet plus
  the Wispkin body-spec frame checks).
- Runner: `runners/kaggle_tier2_runner.py` (v2.1, writes
  `PENDING_VERIFICATION` packets only, never PASSED).
- Notebook: `show/production/tooling/kaggle/mochiichao-comfyui-wan-v2.ipynb`
  (A/B cells 7–9, seed 42 both runs).

## Pre-flight checklist (in order, before any GPU run)

1. Collect the in-flight A/B rerun report; fill the A/B record
   template with measured times only; update TOOLS-MANIFEST.md
   and README-kaggle.md in the same commit as the run report.
2. Re-check Kaggle GPU quota from the live account before
   starting (the manifest's "~21h56m of 30h" figure is dated
   2026-10-27 and is NOT treated as current quota here).
3. Owner flips `approved_auto` to `true`.
4. Confirm the canonical prompt (see the open prompt gap below).
5. Run exactly ONE locked generation via the runner.
6. Frame-verify the clip; write its gate packet as
   `PENDING_VERIFICATION`; no clip-index promotion until the
   gate step (automated scorer when wired, else owner review).

## Open prompt gap — flagged, NOT decided this run

The A/B prompt and the runner prompt are NOT the same text, so
A/B timing must not be confused with first-generation likeness:

- A/B prompt (notebook cell 7, shared by both A/B runs):
  positive: "Animate THIS EXACT character image, preserving its
  design and flat 2D cartoon style precisely. The character is a
  small round black creature holding a white cracked skull mask
  onto its face with two small black hands, smoke trailing
  beneath it. It floats gently up and down in place, the mask
  tilting slowly side to side as if it is listening, smoke
  curling softly below. Do not change the character design, do
  not add anything, no 3D rendering, no new characters.
  Locked-off camera, plain solid background."
  negative: "3d render, cgi, pixar, photorealistic, realistic,
  blurry, distorted, deformed, morphing, changing design, extra
  characters, extra limbs, text, watermark, logo, camera movement,
  zoom"
- First-locked-generation prompt (runner CONFIG):
  positive: "Animate THIS EXACT character, preserving its design
  and flat 2D cartoon style precisely: a small fat round BLACK
  ghost body wearing a white cracked skull MASK held onto its
  face by two small black hands touching the sides of the mask,
  a small black flame tip above the mask, and the body's bottom
  tapering into a little ghost tail that dissolves into curling
  smoke beneath it. No legs. It floats gently up and down in
  place, mask tilting slowly as if listening, smoke curling
  softly below. Locked-off camera, plain solid background."
  negative: "3d render, photorealistic, realistic human skull,
  anatomy, teeth, legs, feet, tail, hair, beak, bill, extra
  characters, text, watermark, style change, design change"

  Two things to settle at pre-flight step 4, by the runner/owner
  — not changed unilaterally here:
  (a) the runner prompt is fuller on the body spec (flame tip,
  ghost-tail bottom, hands on the mask sides); confirm it is
  the canonical first-generation prompt;
  (b) the runner negative bans "tail" while its own positive
  asks for a ghost tail — check that the negative does not
  fight the body-spec bottom before running.

## Licence notes (labels verified at the source docs in-repo)

- Wan22 Turbo LoRA: upstream Self-Forcing distill is MIT; the
  Kijai repack card declares no licence — recorded in
  `pipeline/manifest.json` as RECHECK_BEFORE_COMMERCIAL_SHIP.
  It is not labelled fully MIT-licensed for shipping.
- CC-BY-NC weights (MusicGen, F5-TTS) stay scratch-only, never
  shipped. Nothing in this prep touches them.
- No avatar-stack files were touched or claimed this run.
  Wispkin is not an avatar-stack asset.
