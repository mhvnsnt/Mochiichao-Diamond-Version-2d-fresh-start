# HEX — show model sheet (spec §1b, human)

**Sheet:** `hex-model-sheet.png` beside this file · **Status:** v1, built 2026-10-30 entirely from the game's
existing production art — no new character art was drawn for this sheet. Where the game material has no
drawing, the cell is an explicit **OWED** placeholder (§10 of the humans README), never an invented drawing.
**Likeness of record:** `src/assets/human-characters/named-canon/hex-v2.webp` (the v2 inked pass;
`docs/human-characters/CANON-HUMAN-CHARACTERS.md`).

**In one line:** the neighbour and rival — Black, black hair with the violet-purple streak, amber eyes,
black-and-purple high-collar jacket; Region 1 Champion in the endgame, the lab-beat rival at the start.
Human dialogue only.

## 1 · Turnaround
FR = v2 sheet (of record). BK / SD-L / SD-R = the game world-views sheet
(`named-canon/hex-world-views.webp`; atlas order FR, SDL, BK, SDR per
`in-game-sheets/hex-64px-atlas.json`). **¾ (TQ): OWED** — no ¾ drawing of Hex exists in the game material.
Silhouette: high collar + streak + belt device (gate G-1 pass).
**Design-pass warning:** the world-views pass reads *older* (light stubble, freckles, a smaller streak,
a purple-panel suit) — v2's youthful face and silver-trim high-collar jacket are of record. See §Variants.

## 2 · Head & face construction
Head crop from v2 + atlas portrait on the sheet PNG. Face of record: amber eyes, rival grin, the purple
streak falling over his left brow as one locked hair piece (§3e — the streak is a separate piece so it
never recolours with the black). Head ≈ 1/6 of his height (see §8).

## 3 · Expression set
**Of record:** rival grin — the challenge register (v2). **OWED:** determined, angry, surprised,
defeated/quiet — no expression drawings of Hex exist in the game material; the atlas portrait is the
world-pass face, not an expression variant. His scripted registers (challenge, loss, endgame Champion
gravity) need at minimum: grin (have), determined, humbled. **Gate H-2: NOT PASS** until drawn.

## 4 · Mouth set
**Gate H-1: PASS (material).** Full Blair 10-viseme set built at
`show/production/rigs/builds/hex/talking/` (frames 1–10 keyed to `mochiichao-mouth-data/v1`; rest frame =
his own grin cropped from the canon art). Contact sheet on the sheet PNG. Owner eye-check still pending
per TALKING-SET.md. Voice casting: AWAITING OWNER.

## 5 · Hands set
Shared library, adult plan: `FR-handR-fist-adult-001`, `FR-handL-fist-adult-001` (his own relaxed fists
from v2) + SD/BK relaxed poses shared with Aeon (`SD-hand-relaxed-adult-001/002`,
`BK-handR/L-relaxed-adult-001/002`). A pointing pose — his challenge gesture — is **owed** (no pointing
hand exists anywhere in the cast's art yet; see the library README).

## 6 · Costume breakdown (v2 = of record; §3f names)
| Piece | Rig name | Notes |
|---|---|---|
| Black/purple high-collar jacket, silver front trim | `FR-jacket-001` (+ `costume_back`) | collar is a constructed piece — holds its height in profile |
| Black undershirt | `FR-shirt-001` | |
| Dark trousers | `FR-trousers-001` | |
| Black/purple boots | `FR-boots-001` | |
| Hair + purple streak | `FR-hair-001`, `FR-hair-streak-001` | streak locked to his left brow |
| Belt device | `FR-belt-device-001` | see §9 |

## 7 · Palette
`show/production/model-sheets/palettes/hex-palette.json` (§2 format, sampled from the v2 art):
Dominant **#2f3135** (suit black-grey) · Support **#6c44ac** (jacket purple) · Accent **#b2b6bc**
(silver trim) · Ink **#07060a**. Skin tone #875941 in the cluster table.

## 8 · Scale chart
**6.0 heads tall** (derived from the v2 sheet art; labelled derived). Tallest of the young cast —
plotted on `show/production/model-sheets/height-chart-principal.png`.

## 9 · Device / prop interaction
Device design is **OPEN in canon** (humans README §9) — pose slots with the game art's own device,
flagged not faked: the belt-worn device at his left hip as drawn in v2 (crop on the sheet PNG), and the
battle-atlas action poses (cells 12/14 — dynamic stances, `assets/hex/`). Full-res battle art is named
in the atlas manifest but absent from the repo — **owed at full res**.

## Variants
- **v1 pale versions** (`hex-v1.webp` and the pale likeness): kept as a variant per the canon doc —
  never the primary build.
- **World-views pass:** older face (stubble/freckles), smaller streak, purple-panel suit without the
  silver-trim high collar. When a side/back view plays beside the v2 front, these deltas are the known
  cost — do not "fix" them by redrawing; flag for the owner if a shot depends on them.

## Watch-fors
- The streak: one piece, his left brow, purple — never mirrored, never merged into the black.
- Amber eyes; the grin is the default, not a permanent expression — neutral-mouth dialogue uses the
  talking set's rest frame (the grin), so deadpan lines need the owed expression pass.
- High collar height is part of the silhouette; squash passes must not collapse it.

## Sources
`src/assets/human-characters/named-canon/hex-v2.webp` · `hex-world-views.webp` ·
`src/assets/human-characters/in-game-sheets/hex-64px-atlas.{webp,json}` ·
`show/production/rigs/builds/hex/talking/` · `show/production/cast/CAST-RIG-SPECS.md` ·
`docs/human-characters/CANON-HUMAN-CHARACTERS.md`. Extracted art: `assets/hex/` beside this file.
