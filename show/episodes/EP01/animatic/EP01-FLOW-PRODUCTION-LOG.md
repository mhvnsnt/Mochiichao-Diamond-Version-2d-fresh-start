# EP01 — Flow Composite Production Log

Production record for EP01 beats generated with the Flow composite pipeline
(owner-ruled CURRENT for EP01 production/previs — see
`show/production/FLOW-COMPOSITE-PIPELINE.md`). Method: one shared scene
timing map; each character generated separately from a composited start
frame (real canon cutout over the real plate) or a plate-only start frame;
8-second segments chained last-frame → next; shadows, colour grade and
effects in post.

## Engine and rights status

- Engine: Google Flow, model Veo 3.1 Lite, 16:9, 1280×720, 24fps, 8.0s
  per segment.
- Cost basis: free daily credits only. No purchases.
- **Commercial rights: UNCLEAR** (Flow output carries SynthID; the free
  tier's commercial terms are not resolved). These clips are CURRENT FOR
  PRODUCTION / PREVISUALISATION. The shippable-master question stays open
  until the rights resolve or the local Wan stack re-takes the frames, per
  `show/production/FLOW-COMPOSITE-PIPELINE.md`. Neither path is a silent
  fallback for the other.

## Credit state

- 2026-10-28: the day's 50 free credits were spent in full (balance 0
  after V3-002 segment 1 below). Free credits refresh daily at
  approximately 9:43 AM CT. At 10 credits per 8s segment, the free pace is
  ~5 segments (~40 finished seconds) per day.

## Section N1 — "Dawn Before the Keeper" (V3-001 – V3-006, 78s)

Brand-blue dawn key, wind CALM, no dialogue, no music until the T1 melody
stem enters solo at V3-003. 12 chained 8s segments total; each cut below
is 2 segments.

### V3-001 — Gate dawn, EMPTY frame (cut 0:00–0:14, 14s = 2 segments)

Start frame: the Gate dawn plate as-is
(`show/assets/backgrounds/gate/EP01-PLATE-gate-dawn-v1-derived-still.png`).
Audio per script (bell stir, one distant unidentifiable cry) is a sound
pass, not part of this picture generation.

- **Segment 1 — LANDED.**
  - File: `EP01-V3-001-flow-gate-dawn-seg1.mp4`
  - Size: 2,117,528 bytes
  - sha256: `46c7d684f96ab7c42bd4c479f96c9be8ac9d8982650718fd346a02dbbe0300fc`
  - Spec: 1280×720, 24fps, 8.0s, h264
  - Prompt (verbatim): "2D cartoon animation. A quiet garden gate at
    dawn. Soft golden light slowly brightens, a gentle breeze stirs the
    leaves, vines and flowers, thin morning mist drifts along the dirt
    path. The wooden gate and the Keeper Board sign stay perfectly still
    and unchanged. No characters, no camera movement."
  - **Gate verdict: PASS.** Frame-checked (first / middle / last): plate
    locked, mist band low on the path mid-clip, light warms across the
    segment, no characters, no camera drift.
- **Segment 2 — STILL OWED.** Chain from segment 1's last frame at the
  next credit refresh; the cut totals 14s, segment 1 covers the first 8s.

### V3-002 — Pond dawn, ripple under mist, Hex cameo (cut 0:14–0:26, 12s = 2 segments)

Staging per script: something crosses under the mist — ripple only, the
crossing thing is never shown. HEX distant and still at the far fence,
frame right edge, ~90px tall: an unintroduced cameo, delivered here as a
plate element composited into the start frame.

- **Start frame — LANDED.**
  - File: `EP01-V3-002-startframe.png`
  - Size: 40,179 bytes
  - sha256: `c7a55b1f8f36dea7fbdbcd8bf5c6bd80695452347979cd83fce6f401a9632e41`
  - Composite: Pond dawn derived plate
    (`show/assets/backgrounds/pond/EP01-PLATE-pond-dawn-v1-derived-still.png`)
    + Hex reference-pack front
    (`show/production/tooling/avatar-stack/reference-packs/hex/front.png`)
    at ~90px tall, far shore, frame right edge, with a soft contact
    shadow at composite.
- **Segment 1 — LANDED.**
  - File: `EP01-V3-002-flow-pond-seg1.mp4`
  - Size: 1,423,517 bytes
  - sha256: `39a4f4000044435a8b8466ae405d43e389a6079208fdf2787fd9e421ed2f07e0`
  - Spec: 1280×720, 24fps, 8.0s, h264
  - Prompt (verbatim): "2D cartoon animation. A still pond at dawn. Thin
    mist drifts slowly across the water. A single ripple crosses the pond
    beneath the mist, as if something passed underneath. The reeds and
    lily pads sway very slightly. The tiny distant figure at the far
    shore's right edge stands perfectly still and does not move at all.
    No camera movement."
  - **Owner verdict (2026-10-28): OWNER-APPROVED as it stands** — mist
    over the water, the ripple event crosses under the mist mid-clip,
    Hex held still at ~90px at the far shore right edge.
  - **Owner comparison ruling (2026-10-28):** this approved segment
    holds until Flow produces the re-run against the canon painted Pond
    plate. The owner will then compare the two versions, and both may be
    kept as two separate pond segments. The re-run is a comparison, not
    a replacement by default, and neither version is to be discarded.
  - **PLATE NOTE (carried, not a clip defect):** the Pond plate stayed
    flat / provisional through generation. **GAP-pond-canon** — the canon
    painted Pond plate — remains OPEN, and the style difference against
    the Gate plate is on record. When a canon Pond plate lands, this
    beat is the first re-take candidate.
- **Segment 2 — STILL OWED.** Chain from segment 1's last frame at the
  next credit refresh; the cut totals 12s, segment 1 covers the first 8s.

## Still owed for N1

- V3-001 segment 2, V3-002 segment 2 (chained extensions above).
- V3-003 – V3-006: not yet generated (see GENERATION-PACKAGE.md §7 for
  the per-beat recipes).
