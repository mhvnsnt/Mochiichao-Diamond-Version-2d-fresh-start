# MOCHIKO — show model sheet (spec §1b, human)

**Sheet:** `mochiko-model-sheet.png` beside this file · **Status:** v1, built 2026-10-30 entirely from the game's
existing production art — no new character art was drawn for this sheet. Where the game material has no
drawing, the cell is an explicit **OWED** placeholder (§10 of the humans README), never an invented drawing.
**Likeness of record:** `src/assets/human-characters/named-canon/mochiko-v2.webp` (the v2 inked pass;
`docs/human-characters/CANON-HUMAN-CHARACTERS.md` marks v1 superseded).

**In one line:** East Asian lab assistant, warm brown skin, straight dark-brown twin tails with teal
scrunchies, teal eyes — Aeon's assistant; runs the lab welcome and opens the Mochi Garden (game script
R1-BEAT3). Human dialogue only; she never cries.

## 1 · Turnaround
FR = v2 sheet (of record). BK / SD-L / SD-R = the game world-views sheet
(`named-canon/mochiko-world-views.webp`; atlas order FR, BK, SDL, SDR per
`in-game-sheets/mochiko-64px-atlas.json`). **¾ (TQ): OWED** — no ¾ drawing of Mochiko exists anywhere in
the game material. Silhouette reads at thumbnail size: twin tails + pleated skirt + capsule belt (gate G-1 pass).

**Design-pass warning (read before using any view):** the world-views sheet is an *earlier design pass*
than v2 — see §Variants. The views are true turnarounds of that pass; v2 is the costume of record.

## 2 · Head & face construction
Head crop from the v2 sheet + the atlas portrait cell (upscaled ×6, nearest) are on the sheet PNG.
Face of record: teal eyes (large, cyan-teal), small smile, twin tails framing the face, teal scrunchies.
Head ≈ 1/5 of her height (see §8).

## 3 · Expression set
**Of record:** warm neutral — the lab-welcome face (v2). **Everything else is OWED:** determined /
battle-ready, surprised, sad, angry — no expression drawings of Mochiko exist in the game material
(the step8 coverage JSON is geometry-only; the atlas carries one neutral portrait). The EP01/apprentice
beats she plays (welcome, pride, worry at the gate) need at minimum: warm smile (have, as neutral),
worried, proud-determined. **Gate H-2: NOT PASS** until those are drawn.

## 4 · Mouth set
**Gate H-1: PASS (material).** Full Blair 10-viseme set already built at
`show/production/rigs/builds/mochiko/talking/` (frames 1–10: rest / A_I / E / O / U / M_B_P / F_V /
L_T_D_N_Th / C_D_G_K_S_Z / W_Q, keyed to `mochiichao-mouth-data/v1`; rest frame is her own mouth cropped
from the canon art). Contact sheet reproduced on the sheet PNG. Owner eye-check of the set is still
pending per that folder's TALKING-SET.md ("BUILT v1, pending owner eye-check") — the set is built, not
yet owner-approved. Voice casting: AWAITING OWNER (CAST-RIG-SPECS.md).

## 5 · Hands set
From the shared library (`show/production/rigs/SHARED/hands/`, child plan — §3f):
`FR-handR-open-child-001`, `FR-handL-open-child-001` (her own hands, from the v2 sheet), plus the SD/BK
relaxed poses. Her world-pass hands wear the fingerless gloves (`SD-hand-gloved-child-001`,
`BK-handR/L-gloved-child-001`) — the gloves are a *costume* piece of the earlier pass, not her hand shape;
the v2 pass is bare-handed.

## 6 · Costume breakdown (v2 = of record; every piece a separate rig item, §3f names)
| Piece | Rig name | Notes |
|---|---|---|
| Navy mandarin-collar jacket, teal trim, star badge | `FR-jacket-001` (+ `costume_back` back) | teal pipework on collar/cuffs |
| Teal pleated skirt | `FR-skirt-001` | pleats are drawn folds — deform, don't redraw per frame |
| Teal leggings | `FR-leggings-001` | |
| Navy sneakers, teal stripes | `FR-shoes-001` | |
| Twin tails + teal scrunchies | `FR-hair-twintails-001`, `FR-hair-scrunchies-001` | tails are secondary-motion pieces (§3e) |
| Capsule belt, three capsules | `FR-capsule-belt-001` | see §9 |
| Backpack | `costume_back-backpack-001` | visible in v2 rear three-quarter of the front pose |

## 7 · Palette
`show/production/model-sheets/palettes/mochiko-palette.json` (§2 format, sampled from the v2 art):
Dominant **#19979c** (teal kit) · Support **#2d3e5f** (navy jacket) · Accent **#13636d** (deep-teal device
shade) · Ink **#150810**. Skin tones in the cluster table (#d9996e, #9d6454). The reserved red stays
unspent on Mochiko.

## 8 · Scale chart
**5.0 heads tall** (derived from the v2 sheet art — crown→chin vs crown→sole; labelled derived, not
repo-stated). Plotted on `show/production/model-sheets/height-chart-principal.png`.

## 9 · Device / prop interaction
Device design is **OPEN in canon** (humans README §9) — this section ships as pose slots with the game
art's own devices, flagged not faked: her three-capsule belt as drawn in v2 (capsules hold tiny creature
depictions — keep them generic at distance) and the battle-atlas poses (wide back stance, cells 12/14 of
the 64px atlas, reproduced in `assets/mochiko/`). Full-res battle art is named as a source in the atlas
manifest but does not exist in the repo — **owed at full res**.

## Variants
- **v1** (`mochiko-v1.webp`): SUPERSEDED inked pass — historical, never build from it.
- **World-views pass** (turnaround source): pink-dipped twin-tail tips + teal bows (v2: plain dark-brown
  tails + scrunchies), open blazer + white shirt (v2: mandarin jacket), fingerless gloves (v2: bare),
  dome capsule *backpack* (v2: belt + plain backpack). Atlas portrait in this pass has **brown eyes** —
  canon is teal. Do not mix passes in one shot; when a side/back view is used beside the v2 front, the
  costume deltas above are the known cost.

## Watch-fors
- Twin tails must never read as one mass; scrunchies stay teal in every colourway.
- The pink tips are the single most likely drift — flag any frame that grows them on the v2 design.
- Capsule-belt capsules: three, at her front waist. Not a backpack dome (that's the old pass).

## Sources
`src/assets/human-characters/named-canon/mochiko-v2.webp` · `mochiko-world-views.webp` ·
`src/assets/human-characters/in-game-sheets/mochiko-64px-atlas.{webp,json}` ·
`show/production/rigs/builds/mochiko/talking/` · `show/production/cast/CAST-RIG-SPECS.md` ·
`docs/human-characters/CANON-HUMAN-CHARACTERS.md`. Extracted art pieces: `assets/mochiko/` beside this file.
