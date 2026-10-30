# OCIO — composite-stage plug-in note

`config.ocio` is the house colour config (see OPENCOLORIO-TEARDOWN.md
in the parent folder for the full teardown and the rule map).

**Where it plugs in:** the composite stage
(`show/production/FLOW-COMPOSITE-PIPELINE.md`,
`show/production/UNIFIED-PIPELINE.md` — composite = Natron graphs +
ffmpeg spine; working space named there as "linear/ACES via
OpenColorIO in Natron (32-bit float)").

**How a comp uses it:**
1. Point Natron at this config (Natron ships native OCIO support:
   set the OCIO config path in preferences, or launch with the `OCIO`
   environment variable set to this file's absolute path).
2. Read nodes: plate/texture material enters as `sRGB - Texture`;
   anything protected (model-sheet fills, mask plates, ink, subtitle
   cards — LIGHTING-SYSTEM.md LS-1/LS-2) is assigned
   `Protected Identity - Data` and is never converted.
3. Working conversions happen in `ACEScg`. Environment/atmosphere
   layers may take the named looks (`ENV - Cool Night Field`,
   `ENV - Warm Dusk Field`) — environment layers only, per LS-2; the
   per-shot lighting record (FLOW-COMPOSITE-PIPELINE) names which look
   a shot uses, if any.
4. Output through the `Show` view on the sRGB display. The
   `Protected Check (Data)` view exists to eyeball protected layers
   untransformed during a comp review.

**Check it:** `pip install opencolorio` then
`python3 check_config.py` (16/16 at landing — TEST-RECORD.md in the
parent folder).

Status: config written and library-validated; the first real shot
comp driven through Natron on this config is its first-run proof.
