# Height charts — data, method, sources (spec §1c)

Charts: `height-chart-principal.png` (pilot six + Mochiko, Hex, Aeon) and
`height-chart-secondary.png` (Falk, Mom, Players A–D). Both plotted on a shared baseline, unit = one
head of the character's own body plan (Gumball format, spec §1c).

## Principal cast

| Character | Units | Source of the number |
|---|---|---|
| Aeon | 6.8 heads | DERIVED — measured from the v2 game sheet art |
| Hex | 6.0 heads | DERIVED — measured from the v2 game sheet art |
| Mochiko | 5.0 heads | DERIVED — measured from the v2 game sheet art |
| Dorowani | ~2.6 heads | REPO-STATED — species model sheet vertical scale |
| Gabu | ~2.2 heads | REPO-STATED — species model sheet |
| Wispkin | ~2.0 (core) | DERIVED — flame tip → body bottom on the reference cutout; smoke trail excluded (trail length is a rig control, CAST-RIG-SPECS) |
| Kittember | ~1.8 heads | REPO-STATED — species model sheet |
| Sproutle | ~1.6 heads | REPO-STATED — species model sheet |
| Mochii | ~1.2 heads | REPO-STATED — species model sheet note ("about one head tall — it is nearly all head") |

`src/data/core/species.json` carries no height/weight fields for any species — the model-sheet scale
notes are the only repo-stated creature heights, so they are what the chart uses.

## Secondary cast (all DERIVED, coarse — re-measure when each sheet is built)

| Character | Units | Figure source |
|---|---|---|
| Player B | ~6.5 | game player-design art |
| Player A | ~6.0 | game player-design art |
| Player C | ~5.5 | game player-design art |
| Falk | ~5.0 | owner-locked model-sheet art (hair spikes included in the crown) |
| Mom (Mexican variant example) | ~5.0 | game art, v2 variant — **Mom is a variant set; her look follows the chosen player, so this is one example, not a fixed Mom** |
| Player D | ~5.0 | game player-design art |

## Method for DERIVED numbers
Crown→sole height divided by crown→chin height, read from the character's front sheet art (width-profile
neck dip cross-checked by eye against the face). Two passes were measured where both exist: the v2
likeness-of-record pass governs the principal numbers (the world-views pass reads differently — e.g.
Hex ~7 in that pass, Mochiko ~4.5 — because it is an earlier design pass; those readings are recorded in
each human's sheet document under Variants, not used here).

Figures on the charts are the cast's own art: canon cutouts for the creatures, game sheet fronts for
the humans. Wispkin is plotted floating with a dotted drop line — he has no ground contact (species lock).
