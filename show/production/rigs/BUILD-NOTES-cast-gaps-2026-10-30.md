# BUILD NOTES — cast gaps build, 2026-10-30

**Why this package exists:** the spec's per-cast gap list (§7) carried Mochiko, Hex and Aeon as "no
sheet." The owner corrected that: all three **do** have game production sheets. This package builds the
show-production sheets, palettes, height charts and the shared hands library **from that existing game
material** — assembled, keyed, cropped, measured and sampled. No character art was generated or redrawn;
where the game material genuinely has no drawing, the sheet carries an explicit OWED placeholder.

## What landed, and from what
| Piece | Built from |
|---|---|
| `model-sheets/humans/{mochiko,hex,aeon}-model-sheet.{png,md}` + `assets/` crops | `src/assets/human-characters/named-canon/*-v2.webp` (likeness of record), `*-world-views.webp` (true 4-view turnarounds), `src/assets/human-characters/in-game-sheets/*-64px-atlas.{webp,json}` (portrait + battle cells), `rigs/builds/<name>/talking/` mouth contact sheets |
| `model-sheets/palettes/` — §2 files for the pilot six (+ the three humans) | Pilot six sampled from `show/production/canon-cutouts/*.png`; humans from their keyed v2 fronts. K-means (14 clusters) over opaque pixels; hex + RGB + CMYK-% per slot, 50%/75% tints on Dominant/Support, full cluster table in every file |
| `model-sheets/height-chart-{principal,secondary}.png` + `height-chart-data.md` | Creature units repo-stated on the species model sheets; human units derived from sheet art (method in the data file). Figures are the cast's own art on a shared baseline |
| `rigs/SHARED/hands/` — library v1, 15 poses | Hands cropped from the three humans' v2 + world-views art, keyed and cleaned; Foster's shared-library pattern (spec §3f). Wispkin excluded by design (species-specific mask-hold hands) |

## Canon-lock check (all verified against the art used)
- Dorowani palette sampled from the current cutout: blue body, pale belly, **red fin-cheek accent
  (#862a2e sampled; #a03436 family)**, tan shell clusters present. The orange-cheeked/long-eared/
  no-shell wrong version appears nowhere in this package.
- Wispkin sampled from the reference of record `canon-cutouts/wispkin.png` (sha256 b9de2318…, verified
  byte-identical to the working copy before sampling).
- Kittember: sampled dominant **#4a4a50 dark grey** (not black), Accent **#dd7013** = the tail-tip orb.
- Sproutle: sampled from the cleaned (no baked shadow) canon cutout — mint/green portrait colourway.
- Humans: v2 passes used as of record for all three (Mochiko teal eyes + dark-brown twin tails; Hex
  purple streak + amber eyes; Aeon grey afro/beard + glasses + coat over teal suit).
- No baked shadows in anything landed: source webps sit on flat studio grey (keyed out by
  edge-connected flood fill); the species cutouts were already clean.

## Contradictions found in the game material (for the owner's ledger — nothing was silently "fixed")
1. **Mochiko's world-views/atlas pass ≠ her v2 lock.** Pink-dipped twin-tail tips + teal bows (lock:
   dark-brown tails), open blazer + white shirt + fingerless gloves + dome capsule backpack (v2:
   mandarin navy jacket, capsule belt). The atlas portrait in that pass has **brown eyes** (lock: teal).
   Sheets use v2 as of record and carry the world views as the earlier pass, flagged in §Variants.
2. **Hex's world-views pass reads older** — light stubble and freckles, smaller purple streak,
   purple-panel suit vs v2's silver-trim high-collar jacket. Same handling.
3. **Aeon's world pass** drops the full teal suit legs to dark trousers (minor; face/coat match v2).
4. **Atlas manifests cite battle source art that is not in the repo** (`media-generation-*-battle-
   *-fullsize-*.webp`): the battle views survive only as 64×64 atlas cells 12/14. Full-res battle art
   is owed (the cells are landed in each human's `assets/` so the poses are on record).
5. **Kittember's model-sheet text says "black coat"** — the sampled art says dark grey #4a4a50; the
   palette file records the sampled truth with a note.

## Owed placeholders carried by this package (explicit, per README §10 — never invented)
- **¾ (TQ) turnaround view ×3** (Mochiko, Hex, Aeon) — no ¾ drawing exists in the game material.
- **Expression sets beyond the face of record ×3** — each human has exactly one drawn face; gate H-2
  stays NOT PASS on all three sheets until expressions are drawn (needed registers are named per sheet).
- **Full-res battle views ×3** (see contradiction 4).
- **Hands library v2 poses:** point, generic grip, TQ set, wave, palm-up offer (no source art yet).
- **Lustre palette deltas** for Mochii/Gabu/Kittember/Sproutle (sprites exist on their model sheets;
  delta sampling is a follow-up, noted in each palette file).
- Mouth sets: built and keyed (gate H-1 material PASS) but still **pending the owner's eye-check** per
  `rigs/builds/*/talking/TALKING-SET.md`; voice casting remains AWAITING OWNER for all three humans.

## Method notes
- Keying: edge-connected flood fill against the flat studio-grey backgrounds (mask: bright + low
  saturation), so interior whites (Aeon's coat, eyes) survive intact.
- Head-counts: crown→sole ÷ crown→chin on front sheet art, width-profile neck dip cross-checked by eye.
- Slot curations (where the raw coverage/saturation order produced a misleading slot) are recorded in
  each palette JSON's `slot_assignment_note` — Dorowani, Wispkin, Mochiko, Hex, Aeon each carry one;
  every slot value is drawn from that character's own sampled cluster table.
