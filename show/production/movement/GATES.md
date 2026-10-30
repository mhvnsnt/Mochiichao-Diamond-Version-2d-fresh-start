# Gate definitions — movement (G0–G6) and TV timing

Gates are how a deliverable is measured BEFORE the owner sees it
(new deal, rule 2). A gate measures from the artifact's own pixels
or frames — never from a log line's say-so.

## Movement gates (from the movement-identity research, 2026-10-28)

Method: frame-difference displaced-pixel proportion over the
character region. Thresholds are derived engineering values,
honestly flagged as calibrated, NOT published standards. Calibrate
the floor against a Pokémon Black/White game clip, the target
against a Pokémon TV clip, with the same code (`motion_gates.py`
in this folder is the implementation of record).

- **G0 — background presence.** 0 unwhitelisted near-white frames
  mid-scene. A background blinking to white inside a scene is a
  hard render fail, regardless of what the timing sheet intended.
  (A designed switch reads as a defect on screen; calibration
  gimmicks that read as defects are defects.)
- **G1 — body-region motion.** Body-mask pixels (character mask
  minus the face region) must be in motion in ≥60% of frames per
  1-second window. Face-only animation scores ~0 — the documented
  1957 Hanna-Barbera cost cut, and the exact failure this gate
  exists to catch.
- **G2 — silhouette deformation.** Centroid-aligned silhouette IoU
  < 0.97 in ≥30% of frames; for liquid characters the width/height
  range must reach ≥5% per 2 seconds. A rigid body translated
  around the frame fails.
- **G3 — no dead body.** Never more than 12 consecutive frames
  (0.5s) with a static body region.
- **G4 — per-region coverage.** Every named region — including
  appendages: tail flame, leaves, smoke trail — must show motion.
  An appendage fused static to the body fails. (Kittember's flame
  is a continuous state track: it is the character's health/mood
  meter, per Charmander canon.)
- **G5 — anticipation + settle.** Every major action must be
  preceded by anticipation and followed by a settle, present as
  track events, mechanically required by the sheet schema (an
  action event without both fails validation).
- **G6 — signature checklist.** Per-character movement-identity
  spec (see movement-specs/): the character's defining physical
  behaviours must be present — liquid wobble for the water drop,
  spine gather-extend for the cat, base-origin sway + leaf lag for
  the plant, drift + dissipate/re-form for the ghost, heavy timing
  + shell-mass lag for the shelled biped (the shell itself NEVER
  deforms — the honest exception).

## TV timing gates (tv-standard programme)

- **X-sheet is the single source of truth.** Frame-numbered,
  24 rows = 1 second at 24fps. Every downstream cue file (e.g. the
  performance cue CSV) is generated FROM the sheet, never authored
  separately. (pipeline/xsheet.py)
- **Timing gate.** Each rendered frame's background is classified
  from its pixels and must match the sheet's background track on
  the exact frame. The old defective calibration render fails this
  gate (switch measured at frame 56 vs sheet frame 72); the
  rebuilt render passes (garden 0–71, white from exactly 72).
  (pipeline/timing_check.py)
- **Timing rules.** Action phrases follow the convention in
  timing/timing_rules.json: anticipation hold → smears/ones →
  impact frame (1–3f) → held aftermath; mouth = 3 shapes
  (closed/half/open) on their own layer, changing on twos, held
  open 2–3 frames past the line end; blink intervals irregular
  2–5s.
- **Blocking staging check (G17 seat).** A blocking pass must
  render the sheet's full duration, and a background-switch event
  must be measurable in the blocking frames themselves (lower-half
  saturation before/after; plain luminance does not discriminate
  these pale palettes).
- **Kage rule check (G10 seat).** Character art hashes must be
  byte-identical before and after kage banking/compositing —
  shadow and highlight exist only as separate bank layers seated
  in the composite step.

## Grading (not a gate — the owner's standard)

Gates passing never makes a clip "good". A generated clip is
judged whole: wrong character = FAIL. Gate numbers are stated
with the delivery as measurements, and the delivery itself names
any failure plainly (see WORKING-RULES.md).
