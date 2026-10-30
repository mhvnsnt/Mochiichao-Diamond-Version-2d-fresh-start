# GATE — provenance (Work Package B, EP01 gap-fill, 2026-10-28)

## Base still (canon base art — NOT derived)
- `EP01-PLATE-gate-v1-still-2048.webp` — md5 `2d4207f638976799e877049f0bcb3dd3`,
  2048×1152. Byte-identical copy of the owner-accepted generated v1 plate,
  previously LOCAL-ONLY at
  `~/workspace/mochiichao-show/scene-01/media-generation-garden-gate-bg-plate-0-1cbbf046-0051-45d6-bb70-ff42bec529a7.webp`.
  Landed here to clear the staging debt: this is the base plate the living
  layers sit on (registry §1).
- `EP01-PLATE-gate-v1-still-1280.png` — md5 `3d3d76f29d0dd23aa8633db1e471b81e`,
  1280×720 working copy of the same plate (byte-identical to the local
  `gate-reference/gate-plate-v1-still-1280.png`).

## Dawn still — DERIVED
- `EP01-PLATE-gate-dawn-v1-derived-still.png` — md5
  `b1f3266666b8e8ce979341d413b2a2f1`, 1280×720.
- **DERIVED — not canon original art.** Derived-from: the v1 still 1280
  working copy above (md5 `3d3d76f29d0dd23aa8633db1e471b81e`).
- Process: `grade_plates.py gate` (kept in this folder; Pillow + NumPy,
  deterministic). Treatment, mapped to the key of record —
  GATE-MORNING "First Bell" (Lighting System §3: *low warm sun screen-left /
  bright sky bounce, low ratio (high-key) / rim: pale gold on edges facing
  the lane / temp warm-neutral / grade Signature Day*) plus the Generation
  Package N1 line *"dawn, brand-blue key"* (there is NO "Gate-dawn" key in
  the Lighting System):
  1. warm gradient wash strongest screen-left, fading right → the low warm
     sun's direction;
  2. shadow lift + slight contrast compression → low ratio, high-key sky
     bounce, everything readable;
  3. colour balance — shadows keep a blue lean (brand-blue key), highlights
     warm-neutral → warm-neutral temperature without losing brand blues;
  4. saturation ×1.05 → Signature Day stays full.
- Measured (mean RGB): base 161.2/169.8/133.6 → dawn still
  172.7/175.9/132.2 (brighter, warmer R−B gap 27.6 → 40.5, sky blue kept).
- **Limitation, stated plainly:** the pale-gold rim on lane-facing edges is
  an edge-selective light layer and is NOT produced by this whole-frame
  grade; it remains a composite/light-layer-stage item. The grade supplies
  key direction, temperature, ratio and grade family only.

## Dawn living grade — DERIVED (existing, landed as-is)
- `EP01-PLATE-gate-dawn-v1-derived-living.mp4` — md5
  `9fe9a295275fa2f863022c23ab2533eb`, 1280×720, 24 fps, 8.0 s.
  Byte-identical copy of the pre-existing local file
  `~/workspace/ep01-finish/assets/plates/gate-dawn.mp4` (built by the
  ep01-finish lane; its internal build process was not recorded there —
  provenance beyond "ep01-finish lane derived grade" is NOT claimed).
- Inspected 2026-10-28 (frames at n=10 and n=100 extracted and viewed):
  clean Gate environment art, **no characters in frame**, same composition
  as the v1 still, at a darker warm dawn grade (frame mean RGB
  122.4/131.7/106.2 vs the v1 still's 161.2/169.8/133.6; mean abs frame
  diff vs v1 still 34.92 — a real grade, not a copy of the still).
  This is the file the EP01 staging JSON names for V3-001/004/005/006.
