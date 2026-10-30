# Wispkin — palette sheet (§2 format)

Sampled from the canon cutout `show/production/canon-cutouts/wispkin.png` (2026-10-30, k-means over opaque pixels,
14 clusters; full cluster table below). Machine-readable twin: `wispkin-palette.json` beside this file.
Tint steps are the base mixed toward white at the named percentage — the only lightened
versions a colourist may use without a sheet revision (spec §2).

| Slot | Hex | RGB | CMYK % | Sampled coverage |
|---|---|---|---|---|
| Dominant | #010101 | 1, 1, 1 | C0 M5 Y6 K100 | 22.57% |
| Support | #e8e5e2 | 232, 229, 226 | C0 M1 Y3 K9 | 5.42% |
| Accent | #7e7b76 | 126, 123, 118 | C0 M3 Y7 K50 | 4.39% |
| Ink | #090809 | 9, 8, 9 | C3 M7 Y0 K96 | 9.68% |

**Dominant tints:** 50% → #808080 (C0 M0 Y0 K50) · 75% → #c0c0c0 (C0 M0 Y0 K25)
**Support tints:** 50% → #f4f2f0 (C0 M1 Y1 K5) · 75% → #f9f8f8 (C0 M0 Y1 K2)

## Full sampled cluster table

| Hex | RGB | CMYK % | Coverage | Saturation |
|---|---|---|---|---|
| #010101 | 1, 1, 1 | C0 M5 Y6 K100 | 22.57% | 0.064 |
| #090809 | 9, 8, 9 | C3 M7 Y0 K96 | 9.68% | 0.068 |
| #131213 | 19, 18, 19 | C2 M4 Y0 K92 | 8.49% | 0.044 |
| #2e2c2e | 46, 44, 46 | C1 M4 Y0 K82 | 6.91% | 0.037 |
| #3d3c3d | 61, 60, 61 | C0 M2 Y0 K76 | 6.72% | 0.023 |
| #95928c | 149, 146, 140 | C0 M2 Y6 K41 | 6.53% | 0.062 |
| #201f20 | 32, 31, 32 | C0 M4 Y0 K87 | 6.51% | 0.036 |
| #aba7a1 | 171, 167, 161 | C0 M2 Y6 K33 | 5.77% | 0.059 |
| #c2beb7 | 194, 190, 183 | C0 M2 Y6 K24 | 5.45% | 0.057 |
| #e8e5e2 | 232, 229, 226 | C0 M1 Y3 K9 | 5.42% | 0.026 |
| #7e7b76 | 126, 123, 118 | C0 M3 Y7 K50 | 4.39% | 0.068 |
| #676460 | 103, 100, 96 | C0 M3 Y7 K60 | 4.34% | 0.071 |
| #52504c | 82, 80, 76 | C0 M3 Y7 K68 | 3.85% | 0.074 |
| #d7d3cf | 215, 211, 207 | C0 M2 Y4 K16 | 3.35% | 0.036 |

## Notes / variant delta

Sampled from the reference-of-record cutout (show/production/canon-cutouts/wispkin.png, sha256 b9de2318…). The pre-mask game-sprite look is flashback-only and is not a variant palette.

Slot assignment: Support = skull-mask white (mask whites span #e8e5e2-#aba7a1 across the smoke gradient, see cluster table); Accent = smoke mid-grey; Ink = soft black of the smoke edges. Body black is both the dominant mass and the ink family on this character.
