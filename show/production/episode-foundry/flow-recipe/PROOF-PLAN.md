# PROOF-PLAN — one proof cut on the replica, graded against the Flow target

Date: 2026-10-28. Companion to `FLOW-RECIPE.md` + `REPLICA-MAP.md`.
Rule: ONE cut, graded first. Pass releases the foundry loop at measured
pace; fail returns frames + failure class. No batch runs before this passes.

---

## The cut

- **CUT_ID: `V3-078`** (slot reserved for the manifest worker's pick;
  the cut manifest names V3-078 as its proof pick — Wispkin, S5 Garden
  Gate Night, 10 s: Wispkin floats UP for the first time, smoke swirling,
  and rings the gate bell with its tail of smoke. Source:
  `~/workspace/episode-foundry/data/cut-manifest-summary.md` §PROOF CUT PICK.)
- Why it fits the replica test: single character (no isolation confound),
  large readable action with a definite start/end, silhouette-distinct
  character (cracked skull mask + smoke tail = honest likeness judgement),
  living background plate (`gate-night.mp4` per spec — registry caveat
  noted in the manifest: no registry entry for the night plate; the proof
  validates generation, not plate currency).
- **Direct comparison target:** `flow-tests/flow-wispkin-darkwave.mp4`
  (same character, owner-graded GOOD, 1280×720 / 24 fps / 8.0 s) — the
  replica's Wispkin motion and design hold are judged against what Veo
  did with the same character, not against an abstract bar.
- Fallback pick if V3-078's night plate blocks staging: **V3-005**
  (Dorowani, Gate dawn) — because its Flow original and start frame both
  survive on disk (`grok-fix/`), giving a frame-for-frame comparison.

## Run order (stage by stage, replica numbering from REPLICA-MAP)

0. **Preflight.** Hash-check every reference before GPU time
   (`parity/preflight.py` pattern): Wispkin pack front, the V3-078 plate,
   the VACE weight, the Wispkin LoRA (`wispkin_mochii_wan21_1.3b.safetensors`,
   sha256 `c349a6c0…1230`). Log all hashes into the run folder. A reference
   that fails its hash stops the run before it starts.
1. **Start frame (Stage 1+2).** Build the composite exactly as the Flow
   recipe does: Wispkin pack front on the cut's plate at the staging
   record's placement, contact shadow at composite. ALSO save the
   tight-framed VACE reference prep (canon cutout ≥85% of frame height,
   per `prep_start_frame.py` contract). Save: `startframe.png` +
   `reference_tight.png`, each with sha256 in `run-record.json`.
2. **Generation (Stage 3).** Kaggle T4 seat, `workflow-i2v-locked.json`
   (native VACE graph, staged bytes only): VACE reference ← tight prep,
   start frame as anchor, Wispkin LoRA engaged (strength 0.8–1.0, trigger
   token `wispkin_mochii` first in prompt), prompt in the Flow formula —
   "2D cartoon animation." + the cut's action sentence ("Wispkin floats
   upward, smoke tail swirling, and rings the gate bell with the tip of
   its smoke tail.") + "Keep the character design exactly as in the start
   frame. No camera movement." 49 frames @ 16 fps per call.
   **Before trusting the clip:** run the `/history` audit
   (LOCK-ENGAGEMENT.md §1) — assert `reference_image` wired to the
   reference node, UNET = the VACE file, `trim_amount` ← VACE node output.
   A run whose audit fails is recorded as LOCK-NOT-ENGAGED and does not
   count as a generation attempt, whatever it looks like.
3. **Chaining (Stage 4).** Repeat step 2 from each segment's last frame
   (`chain_segments.py`, seam report saved) until ≥10 s of raw material
   exists (~4 links). Save every segment + every seam's last/first frame
   pair.
4. **Finish to target spec.** RIFE-interpolate 16 → 24 fps, upscale to
   1280×720, trim to the staged 10 s. Save the pre-finish raw chain as
   well — grading distinguishes generator faults from finishing faults.
5. **(Not in this proof)** Stages 5/7 (multi-character composite, episode
   assembly) are out of scope for a single-character proof; Stage 5's
   matte path is exercised only if the night plate must be separated.

## What gets saved per stage (run folder: `proof-V3-078/` beside this plan's output)

- `run-record.json` — every input file + sha256, workflow JSON as run,
  `/history` audit result, seeds, per-segment bytes + sha256, GPU minutes.
- Stage 1: start frame + tight reference (PNG + hashes).
- Stage 3/4: every raw segment MP4, seam frame pairs, chain report.
- Finish: final `V3-078-replica.mp4` (1280×720, 24 fps, 10 s) + extracted
  frames at 0 / 0.5 / mid / last — the same sampling the Flow clips were
  delivered with.

## Gate clauses (ALL must pass; from the finish-gate standards)

1. **Frame-1 anchor.** Frame 0/frame 1 of segment 1 IS the fed start
   frame's character — correct Wispkin, correct design, flat 2D style.
   Frame 1 already wrong = "reference never anchored" FAIL, its own
   failure class (the class the unlocked Wan proof died of).
2. **Likeness sample.** Likeness gate on sampled frames (first / middle /
   last of the finished cut) vs the pack front: SSIM ≥ 0.50, silhouette
   IoU ≥ 0.55, RGB MAD ≤ 40 (repo thresholds), AND a visual read against
   the pack `do_not_change` list — cracked mask shape, mask crack, horns,
   smoke tail, no invented parts. Any locked-trait drift = FAIL (the
   V3-005 Flow proof's invented tail is the standing example of what
   this clause exists to catch — including in replica output).
3. **Motion floor.** The named action must actually happen: a visible
   float-UP displacement and a bell-ring by the smoke tail, readable in
   the frame samples — not drift, not a near-still. Diagnostic floor from
   the repo's verify tooling: consecutive-frame diff must read as real
   motion, not the near-identical regime (calibration in
   `test-scene/TEST-REPORT.md` §1: still ≈ 0.005, real motion ≈ 4.50).
   Motion alone never passes a clip — the correct character must perform
   it (owner's bar).
4. **Background persistence.** The Gate night plate holds across the cut:
   no camera movement, no plate morphing/redrawing, gate and board stay
   put — judged on the same first/middle/last samples. (Registry caveat
   above: this grades persistence, not the plate's currency.)
5. **Spec conformance.** Delivered file measures 1280×720, 24 fps, 10 s
   (± trim tolerance), h264 — ffprobe output attached to the run record.

## Verdict handling

- **PASS (all five clauses):** the replica is declared a match for the
  Flow recipe on this character/action class; report the measured pace
  (finished passed seconds per GPU hour) and release the foundry loop.
- **FAIL:** return the frames, the failing clause, and the failure class
  (lock-not-engaged / never-anchored / drift / motion / background).
  No silent retries past the run record: each retry is a new logged
  attempt with its changed variable named.
- Either way, the side-by-side against `flow-wispkin-darkwave.mp4`
  (same timestamps, same character) is part of the report — the owner
  graded that clip GOOD, and the replica is measured against his proven
  target, not against its own paperwork.
