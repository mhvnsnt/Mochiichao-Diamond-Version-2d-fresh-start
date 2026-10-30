# SHARED/hands — the cast's generic-hands library, v1

**Pattern:** Foster's shared generic-hands library (spec §3f) — one library the whole cast links;
hands and standard poses are never redrawn per character. This folder is **locked** (spec §3f):
poses are added by sheet revision, never edited in place.

**v1 contents (15 poses)** — every pose is extracted from the cast's own sheet art (keyed from the
game production sheets, cleaned, canon-line preserved). Overview: `hands-library-sheet.png`.

## Naming (spec §3f)
`<view>-<part><L/R>-<pose>-<plan>-<###>` — view codes FR / TQ / SD / BK. Body plans: **adult**
(Aeon/Hex proportions) and **child** (Mochiko proportions). Side-view poses hang at the body's side,
so L/R is not distinguishable in SD — those files omit the side letter honestly rather than guess it.

## Pose list
| File | Pose | Source art |
|---|---|---|
| FR-handR-relaxed-adult-001 | front, relaxed open | Aeon v2 sheet |
| FR-handL-tabletgrip-adult-001 | front, **prop-hold** — gripping a data tablet | Aeon v2 sheet |
| FR-handR-fist-adult-001 | front, relaxed fist | Hex v2 sheet |
| FR-handL-fist-adult-001 | front, relaxed fist | Hex v2 sheet |
| SD-hand-relaxed-adult-001 | side, relaxed | Aeon world-views |
| SD-hand-relaxed-adult-002 | side, relaxed | Hex world-views |
| BK-handR-relaxed-adult-001 / -002 | back, relaxed | Aeon / Hex world-views |
| BK-handL-relaxed-adult-001 / -002 | back, relaxed | Aeon / Hex world-views |
| FR-handR-open-child-001 | front, open relaxed | Mochiko v2 sheet |
| FR-handL-open-child-001 | front, open relaxed | Mochiko v2 sheet |
| SD-hand-gloved-child-001 | side, relaxed, fingerless glove | Mochiko world-views (glove = world-pass costume) |
| BK-handR-gloved-child-001 | back, relaxed, glove | Mochiko world-views |
| BK-handL-gloved-child-001 | back, relaxed, glove | Mochiko world-views |

## Use rules
- **Link, never copy.** A rig references the library file; a pose fix lands once, here.
- **Skin tone:** a pose carries its source character's skin tone. When another character borrows it,
  recolour to that character's palette skin swatch (in their §2 cluster table) — the line and shading
  structure stay the library's.
- **Plans don't cross silently:** adult poses on the adult plan, child on child; a cross-plan use is a
  sheet-revision note, not a quiet scale.
- **Gloved poses are costume variants,** not a different hand: the child plan's bare hand is the
  FR-open pair; the SD/BK gloved poses exist because the world-pass art wears the gloves there.
- Wispkin's hands are **not** in this library — his small black mask-hold hands are part of his species
  rig (CAST-RIG-SPECS), species-specific by design.

## Owed poses (v2 candidates — no source art exists yet)
- **Point** (front + side) — Hex's challenge gesture and general emphasis; no pointing hand exists in
  any cast art yet.
- **Generic grip** (cylinder hold without a specific prop) — the tablet-grip is prop-specific.
- **TQ (¾) set** — no ¾ art exists for any human yet; TQ hands arrive with the owed ¾ turnarounds.
- Wave, palm-up offer, two-hand hold.
