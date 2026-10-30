# Tahoma2D Plastic / Xsheet — V3-072 Shot C (peek)

Uses the clean-plate layers in this folder. Host: Tahoma2D 1.6.3 (OpenToonz 1.8 is FUSE-blocked in the sandbox).

## Layers (bottom to top)
1. `wispkin_smoke.png` — smoke as its own column; animate with Plastic mesh or a travelling displacement, not a rigid crop slide.
2. `wispkin_body_clean.png` — teeth band already cleaned; squash/stretch via mesh, not uniform resize.
3. `wispkin_head_clean.png` — finger holes filled; Plastic mesh lean (displacement grows toward top of mask).
4. `wispkin_handL.png` / `wispkin_handR.png` — separate columns; path is an arc (anticipation dip, then lift), not a straight lerp.

## Timing (2s character, 1s camera)
- Hold low/peek entry for ~8 frames.
- Head lean and left-hand lift over ~16 frames with 1–2 in-betweens on the arc.
- One smear drawing on the hand lift (elongated along the arc).
- Hold the peak pose for ~8 frames with secondary smoke drift.
- Camera push-in runs independently on 1s.

## Eyes gate
Every frame must read as a complete drawing: no finger holes, no teeth on chest, no rigid cutout gaps. Likeness against canon front.

Source diagnosis: `../REPORT.md` §1 and §4.
Surgical proof: `../proof/make_surgical_proof.py`.
