# MaterialX (ASWF) — teardown + pull-in

**What it is.** MaterialX is the open standard for exchanging rich
material/shading definitions between applications — the shading
companion to OpenUSD (USD references MaterialX networks; Omniverse and
every major DCC speak it). Originated at ILM/Lucasfilm (2012),
governed by the Academy Software Foundation. Current release line:
**v1.39.x** (this package validated with the MaterialX **1.39.5**
Python library).

**Licence — OPEN SOURCE: Apache-2.0.** Bucket: open source, Apache-2.0
(the project's LICENSE file; a bundled third-party stb component rides
under its own terms inside the source tree — the standard itself and
its libraries are Apache-2.0).

**Why it fits — and where it stops.** The house system's one place
that speaks *material* language is the lustre law
(`show/bible/LIGHTING-SYSTEM.md` §6): a sheen band that lives on an
overlay, keyed to the standing key's direction, with placement and
intensity rules per light state. That is, in shading terms, a sheen
layer over a locked base — and `standard_surface` (the MaterialX/ASWF
reference surface) has exactly that parameter: `sheen`, `sheen_color`,
`sheen_roughness`. The fit is real, not forced — with one honest
boundary: in our 2D composite the sheen is a painted overlay band
(LV-3's own words: "painted, keyframed or masked"), so this file is
the **data home** of the lustre rules — the numbers the overlay works
from — not a claim that a 3D renderer shades our cels.

**Rule map — LV-1..LV-6 into the file** (`materialx/lustre_sheen.mtlx`):

| Rule | In the data |
|---|---|
| LV-1 overlay modulates value/sheen only, never re-hues fills | Graph inputs separate the locked `base_color` (sheet colour) from the sheen dials; no node touches base hue |
| LV-2 placement/accent/ink locked through light | Base colour + sheen colour are inputs with locked defaults; light states never write them |
| LV-3 sheen intensity scales with the key; full under hard day key, single rim-sheen at night, ABSENT in the Dark Forest | `sheen_amount` dial with three bound instances: `lustre_day` = 1.0, `lustre_night` = 0.35, `lustre_dark_forest` = **0.0** |
| LV-4 iridescence may borrow ONE neighbouring hue at the sheen edge only; never another cast accent, never the #a03436 zone | `edge_borrow` mix between sheen colour and one `neighbour_color` (violet, neighbour of the anchor blue), applied to the sheen only; the checker verifies no colour in the file comes near #a03436 |
| LV-5 night obligation: sheen placement carries the read on dark forms | `lustre_night` keeps a deliberate 0.35 — present, placed (rim), not zero |
| LV-6 variants are cast: sheen re-keys with the shift, colourway doesn't | The nodegraph is the reusable look; a colourway = same graph, its own locked `base_color`; state instances re-bind only the sheen dials |

Anchor: Dorowani's lustre deep blue **#3070b0** (COLOR-SYSTEM.md §5)
as the graph's default base colour.

**Validation.** `materialx/check_lustre.py` loads the standard
MaterialX libraries, reads the file, runs `Document.validate()` plus
house checks (the three LV-3 states as data, the locked base colour,
the quarantine sweep). **13/13 checks passed**; full output in
TEST-RECORD.md.

**Verdict: WIRED** as the show's material/sheen definition format —
the lustre rules now have a standard, renderer-legible data home that
any future 3D/plate lane (or USD stage) can consume unchanged.
