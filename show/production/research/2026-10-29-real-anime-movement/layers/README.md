# Clean-plate layers — V3-072 redo

Extracted from the surgical proof (`make_surgical_proof.py`) so the next deformation / GPU / Krita pass can consume discrete parts instead of re-cutting `front.png`.

- `wispkin_head_clean.png` — mask with finger holes filled (mask white), solid silhouette gated
- `wispkin_handL.png` / `wispkin_handR.png` — separate dark-pixel hand sprites
- `wispkin_body_clean.png` — body with teeth band repainted in body colour (no leftover teeth on chest)
- `wispkin_smoke.png` — smoke crop as its own layer (to be animated as smoke, not a sliding crop)

Source: `show/production/tooling/avatar-stack/reference-packs/wispkin/front.png`
Proof script: `../proof/make_surgical_proof.py`
Diagnosis: `../REPORT.md`

These are intermediate production assets for the redo plan (shots A–F). Eyes gate still applies on any AI redraw.
