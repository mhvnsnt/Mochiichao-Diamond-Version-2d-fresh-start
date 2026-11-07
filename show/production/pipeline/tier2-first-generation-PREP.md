# Tier 2 — first locked generation: pre-flight prep (ready, NOT run)

Prepared by the orchestrator run of 2026-10-27 ~22:04 CDT.
No GPU job was started this run. Two things block any GPU run,
and both are still open:

1. The owner latch is OFF: `state.json` `next_action.approved_auto`
   is `false`. GPU jobs run only after the owner flips it to `true`.
2. The timed A/B rerun is already in flight on Kaggle through a
   separate lane (launched before this run). This run did NOT
   duplicate it, and its results have NOT been reported yet.

UPDATE 2026-11-05 (orchestrator run ~03:04 CST): item 1 is STALE —
the owner flipped `approved_auto` to `true` on 2026-10-27 (see
`state.json`, verified live on main by
`orchestrator-main-state-check.py`). What still blocks any GPU run:
the A/B rerun report is still owed (it ran in the owner's browser
session and never reported; its kernel
`marsfmmg/mochiichao-comfyui-wan-v2` is STILL in error state —
re-verified live 2026-11-05 ~03:04 CST, kernels_status HTTP 200
`status: error` — and its log shows a CPU run). Pre-flight items
closed this run: live quota re-check (below) and the canonical-prompt
gap (below). No GPU job was started this run.

## Pre-flight close, 2026-11-05 ~03:04 CST (orchestrator run)

- QUOTA RE-CHECKED (pre-flight step 2): live via the Kaggle API
  helper — `kernels_list marsfmmg` HTTP 200 (newest lastRunTime
  2026-10-28, no new kernel since; list carries no live status
  field, so it is not proof alone) and `kernels_status
  marsfmmg/mochiichao-comfyui-wan-v2` HTTP 200 `status: error`.
  No kernel is running or queued on any evidence. Account usage
  this week (post-reset week, reset 2026-10-31T00:00:00Z):
  9.414 h OBSERVED per the keep-busy ledger
  (`~/workspace/kaggle-check/gpu-queue.json`, last check
  2026-11-05 ~03:05 CST) — observed, not Kaggle-reported. Kaggle's
  API exposes no remaining-quota endpoint, so no Kaggle-reported
  remaining figure exists; headroom for one Turbo job (~30 min–1 h
  class) is ample on either reading (~20.6 h observed-remaining of
  the ~30 h week; orchestrator autonomous counter in `state.json`
  still 0 h — no autonomous GPU hours spent).
- PROMPT GAP CLOSED (pre-flight step 4): the canonical
  first-generation prompt is CONFIRMED as the runner CONFIG,
  now v2.2. The runner prompt is fuller on the body spec (flame
  tip, ghost-tail bottom, hands on the mask sides) and every one
  of those details matches the owner-directed body spec
  (`rigs/builds/wispkin/BODY-SPEC-OWNER-DIRECTION.md`) exactly.
  The contradiction is fixed, not just noted: v2.2 drops the bare
  word "tail" from the negative. That word banned the ghost-tail
  bottom the body spec REQUIRES ("BOTTOM: the body tapers into a
  little floating ghost tail ... that dissolves into the smoke
  trail"; gate: "ghost-tail-to-smoke bottom" must read in frame).
  The spec's "No legs, no feet, no tail" means no legs-and-tail
  animal body (the Psyduck shape stripped of those parts);
  "legs, feet" stay in the negative to ban exactly that body.
  The A/B prompt (notebook cell 7) and the runner prompt remain
  different texts, so A/B timing must still not be confused with
  first-generation likeness — timing only.
- STILL OWED, owner-side: the A/B rerun report (measured times).
  The rerun's kernel is in error state and its report never
  arrived from the owner's session; this run does NOT re-run it
  blind (pre-flight step 1 comes first by the checklist, and the
  kernel's error + CPU-run log mean a re-push needs its own
  pre-flight, not a retry here). First locked generation stays
  sequenced AFTER the A/B report lands.

## What is ready now

- A/B results record template: `tier2-ab-rerun-record-TEMPLATE.md`
  (fields blank until the rerun reports; estimates are not
  measurements).
- Gate packet template: `tier2-gate-packet-TEMPLATE.json`
  (`PENDING_VERIFICATION` only; mirrors the runner's packet plus
  the Wispkin body-spec frame checks).
- Runner: `runners/kaggle_tier2_runner.py` (v2.2 as of 2026-11-05,
  writes `PENDING_VERIFICATION` packets only, never PASSED).
- Notebook: `show/production/tooling/kaggle/mochiichao-comfyui-wan-v2.ipynb`
  (A/B cells 7–9, seed 42 both runs).

## Pre-flight checklist (in order, before any GPU run)

1. Collect the in-flight A/B rerun report; fill the A/B record
   template with measured times only; update TOOLS-MANIFEST.md
   and README-kaggle.md in the same commit as the run report.
   — STILL OPEN 2026-11-05: report owed from the owner's session;
   kernel re-verified in error state this run.
2. Re-check Kaggle GPU quota from the live account before
   starting (the manifest's "~21h56m of 30h" figure is dated
   2026-10-27 and is NOT treated as current quota here).
   — CLOSED 2026-11-05 ~03:04 CST: live helper checks above;
   9.414 h observed used this week, no kernel running; no
   Kaggle-reported remaining figure exists (no such endpoint).
3. Owner flips `approved_auto` to `true`.
   — DONE 2026-10-27 (owner latch ON; verified live on main).
4. Confirm the canonical prompt (see the open prompt gap below).
   — CLOSED 2026-11-05: runner CONFIG v2.2 confirmed canonical;
   negative fixed per the body spec (see below).
5. Run exactly ONE locked generation via the runner.
6. Frame-verify the clip; write its gate packet as
   `PENDING_VERIFICATION`; no clip-index promotion until the
   gate step (automated scorer when wired, else owner review).

## Open prompt gap — CLOSED 2026-11-05 (was: flagged, NOT decided)

CLOSED by the orchestrator run of 2026-11-05 ~03:04 CST (runner
v2.2; grounding in `rigs/builds/wispkin/BODY-SPEC-OWNER-DIRECTION.md`,
owner direction 2026-10-27). The runner CONFIG is the canonical
first-generation prompt. The negative dropped the bare word "tail":
it banned the ghost-tail bottom the body spec requires, while the
spec's "No legs, no feet, no tail" means no legs-and-tail animal
body — "legs, feet" stay in the negative to ban that body. The
original flagged text is kept below as the record of what was
open.

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
  negative (v2.2, 2026-11-05 — "tail" removed; see closure above):
  "3d render, photorealistic, realistic human skull,
  anatomy, teeth, legs, feet, hair, beak, bill, extra
  characters, text, watermark, style change, design change"
  (v2.1 negative, kept as the record of what was open, additionally
  contained "tail" after "feet" — the self-contradiction.)

  SETTLED 2026-11-05 at pre-flight step 4 (see closure above):
  (a) the runner prompt IS the canonical first-generation prompt —
  every body-spec detail in it matches the owner-directed body spec;
  (b) the negative no longer fights the body-spec bottom — "tail"
  removed, "legs, feet" retained to ban the legs-and-tail body.

## Licence notes (labels verified at the source docs in-repo)

- Wan22 Turbo LoRA: upstream Self-Forcing distill is MIT; the
  Kijai repack card declares no licence — recorded in
  `pipeline/manifest.json` as RECHECK_BEFORE_COMMERCIAL_SHIP.
  It is not labelled fully MIT-licensed for shipping.
- CC-BY-NC weights (MusicGen, F5-TTS) stay scratch-only, never
  shipped. Nothing in this prep touches them.
- No avatar-stack files were touched or claimed this run.
  Wispkin is not an avatar-stack asset.
