# GPU in-between job — V3-072 Shot C (clean plate)

Staged for the first real run of AnimeInbet or ToonCrafter. Weights are load-verified; neither has been run on a clean plate yet.

## Inputs (this folder)
- Start key: `wispkin_head_clean.png` + `wispkin_handL.png` + `wispkin_body_clean.png` composited at the low/peek entry pose.
- End key: same layers at the peak lean + left-hand lift (arc path, not straight).
- Smoke: `wispkin_smoke.png` as a secondary layer, not part of the character in-between.

## Job
Generate 8–12 in-betweens on 2s between the two keys. Prefer AnimeInbet if it accepts the pair; ToonCrafter as fallback. Output frames must be checked against the eyes gate: no finger holes, no teeth on chest, likeness held against the canon front.

## Constraints
- AI may redraw; constraint is keep the likeness (owner correction 2026-10-29).
- No mouth animation (mask covers it).
- Do not use the original holed front.png as input.

## Status
Not yet run. Colab free T4 and Kaggle are the enabled lanes. First run should be a short smoke (one shot, ~12 frames) before any full V3-072 redo.

Related: `../REPORT.md` §3.5, `TAHOMA2D-SHOT-C.md`.
