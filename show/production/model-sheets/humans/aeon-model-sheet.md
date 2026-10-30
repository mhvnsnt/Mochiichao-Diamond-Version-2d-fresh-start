# PROF. AEON — show model sheet (spec §1b, human)

**Sheet:** `aeon-model-sheet.png` beside this file · **Status:** v1, built 2026-10-30 entirely from the game's
existing production art — no new character art was drawn for this sheet. Where the game material has no
drawing, the cell is an explicit **OWED** placeholder (§10 of the humans README), never an invented drawing.
**Likeness of record:** `src/assets/human-characters/named-canon/aeon-v2.webp` (the v2 inked pass;
`docs/human-characters/CANON-HUMAN-CHARACTERS.md`).

**In one line:** Black, older — grey afro and beard, round glasses, white lab coat over the teal tech
suit. He runs the lab, hands over the partner and the Mochiioteca, and is the only human who knows the
world's secret. Human dialogue only; the exposition register is his home key.

## 1 · Turnaround
FR = v2 sheet (of record). BK / SD-L / SD-R = the game world-views sheet
(`named-canon/aeon-world-views.webp`; atlas order FR, BK, SDL, SDR per
`in-game-sheets/aeon-64px-atlas.json`). **¾ (TQ): OWED** — no ¾ drawing of Aeon exists in the game
material. Silhouette: afro + coat + beard (gate G-1 pass). Of the three humans, his world pass diverges
least from v2 (same coat/suit read; the world pass drops the full suit legs to dark trousers).

## 2 · Head & face construction
Head crop from v2 + atlas portrait on the sheet PNG. Face of record: round thin-frame glasses, grey
beard (one constructed piece with the jaw, §3e), warm smile, grey afro. Head ≈ 1/6.8 of his height (§8).

## 3 · Expression set
**Of record:** warm smile — the exposition register (v2). **OWED:** grave/serious (the Secret's
register), surprised, sad — no expression drawings of Aeon exist in the game material. His beats need at
minimum: warm (have), grave, kindly-sad. **Gate H-2: NOT PASS** until drawn.

## 4 · Mouth set
**Gate H-1: PASS (material).** Full Blair 10-viseme set built at
`show/production/rigs/builds/aeon/talking/` (frames 1–10 keyed to `mochiichao-mouth-data/v1`; rest frame
= his own mouth cropped from the canon art, beard included in the patch read). Contact sheet on the
sheet PNG. Owner eye-check still pending per TALKING-SET.md. Voice casting: AWAITING OWNER.

## 5 · Hands set
Shared library, adult plan: `FR-handR-relaxed-adult-001` (his own, from v2) and
`FR-handL-tabletgrip-adult-001` — **the library's prop-hold pose**, his left hand gripping the data
tablet, extracted from the v2 sheet. Plus SD/BK relaxed poses. His hands are the library's adult-plan
reference pair.

## 6 · Costume breakdown (v2 = of record; §3f names)
| Piece | Rig name | Notes |
|---|---|---|
| White lab coat | `FR-labcoat-001` (+ `costume_back`) | longest coat in the cast; hem is a deform piece |
| Teal tech suit, top + full legs | `FR-techsuit-top-001`, `FR-techsuit-legs-001` | circuit traces are texture, not geometry |
| Dark boots with teal accents | `FR-boots-001` | |
| Round glasses | `FR-glasses-001` | see watch-fors (reflections) |
| Afro + beard | `FR-hair-afro-001`, `FR-beard-001` | beard moves with the jaw piece |
| Data tablet | `FR-tablet-001` | prop — see §9 |

## 7 · Palette
`show/production/model-sheets/palettes/aeon-palette.json` (§2 format, sampled from the v2 art —
re-sampled without a near-white filter so the coat reads at full value):
Dominant **#f5f5f5** (lab coat) · Support **#0c999e** (teal suit) · Accent **#0d5a64** (deep-teal suit
shade) · Ink **#0d0e0f**. Skin tone #816659 in the cluster table.

## 8 · Scale chart
**6.8 heads tall** (derived from the v2 sheet art; labelled derived). Tallest of the principal cast —
plotted on `show/production/model-sheets/height-chart-principal.png`.

## 9 · Device / prop interaction
Device design is **OPEN in canon** (humans README §9) — pose slots with the game art's own device,
flagged not faked: the data tablet as drawn in v2, held in the left hand (the grip pose is in the shared
library), and the battle-atlas pose (cell 12: tablet raised — `assets/aeon/`). The tablet screen's glow
is a light source at composite time. Full-res battle art named in the atlas manifest is absent from the
repo — **owed at full res**.

## Variants
- **v1 pale versions:** kept as variants per the canon doc — never the primary build.
- **World-views pass:** tech suit reads as top + dark grey trousers (v2: full teal suit legs); face and
  coat match v2 closely. Do not mix passes in one shot.

## Watch-fors
- **Exposure halfway rule (§4.1):** the white coat is the cast's blow-out risk — check it against every
  plate at composite; the §2 tints give the 50%/75% steps, never an ad-hoc grey.
- Glasses: sky reflections read outdoors only; indoors the lenses go clear (donor-model law, spec §4).
- The beard is grey like the afro — never darker than the hair, never white-pure (Ink stays on the suit).

## Sources
`src/assets/human-characters/named-canon/aeon-v2.webp` · `aeon-world-views.webp` ·
`src/assets/human-characters/in-game-sheets/aeon-64px-atlas.{webp,json}` ·
`show/production/rigs/builds/aeon/talking/` · `show/production/cast/CAST-RIG-SPECS.md` ·
`docs/human-characters/CANON-HUMAN-CHARACTERS.md`. Extracted art: `assets/aeon/` beside this file.
