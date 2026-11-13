# Regions 2–5 story dialogue — Ink conversion (2026-11-13)

Converts the locked Region 2–5 story dialogue into compiled Ink stories,
registered in the same inkjs adapter Region 1 uses. No new dialogue is
written here: every line comes from the locked source spec
`story-dialogue-regions2-5-full.md` (World Builder lane, 2026-10-25, original
Mochiichao writing, LOCKED as written). The beats docs
`src/lib/wiring/dialogue/region{2,3,4,5}-dialogue.json` are the corrected
content-only source; the `.ink` files are generated from them by
`generate.py` (kept in the staging area, re-runnable) and compiled with
the inkjs Compiler to `region{2,3,4,5}-story.json` (inkVersion 21).

## What ships in this PR

| File | What it is |
| --- | --- |
| `src/lib/wiring/dialogue/region{2,3,4,5}-dialogue.json` | Corrected beats docs (content-only, no teams) |
| `src/lib/wiring/dialogue/region{2,3,4,5}-story.ink` | Generated Ink source (106 knots, 269 lines, 83 flags) |
| `src/lib/wiring/dialogue/region{2,3,4,5}-story.json` | Compiled Ink JSON (inkVersion 21) |
| `src/lib/inkStory.ts` | Registers the 4 region stories; `SPEAKER_RE` accepts digits (Elite 1, Region 3 Researcher) |
| `src/lib/inkStoryRegions25.test.ts` | New: exact pins for registration, walks, knot-scoped play, spot knots |
| `tests/dialogue-exit-flag.test.ts` | Stale-comment fix only (Regions 2–5 are converted now, not "later") |
| `docs/regions2-5-ink-dialogue-20261113.md` | This file |

## Counts (validator + full-story walks)

| Region | Beats entries | Knots | Lines | Flags |
| --- | --- | --- | --- | --- |
| 2 | 14 | 24 | 72 | 28 |
| 3 | 15 | 27 | 70 | 19 |
| 4 | 16 | 26 | 65 | 17 |
| 5 | 17 | 29 | 62 | 19 |
| **Total** | **62** | **106** | **269** | **83** |

- `validate:dialogue` (PR #414 gate): 0 errors on all four compiled stories.
  Warnings are flags written-never-read only.
- Full-story walks (followDiverts): R2 72 / R3 70 / R4 65 / R5 62 lines,
  0 choices, all flags true at END.
- Vitest (local gate dir, 2026-11-13): 41/41 pass — `inkStory.test.ts` 9,
  `inkStoryRegions25.test.ts` 21, `dialogue-exit-flag.test.ts` 9,
  `dialogue-structure.test.ts` 2. `tsc --noEmit` clean.
- Fixes found by the gate in this PR (test/adapter only, no dialogue
  content changed): a `*/` inside a JSDoc comment in `inkStory.ts` broke
  parsing; three pins in `inkStoryRegions25.test.ts` read flags before
  draining the knot (inkjs runs trailing `~` assignments only when the
  session is continued past the last line) and one pinned
  "Portal-Train Conductor" where the locked md's compound is
  "Portal-train" (see speaker rules).

## Audit: regionN-dialogue.json on main vs the locked md

The beats docs on main had drifted from the locked md. All of it was
corrected in staging to the md; re-audit drift = 0, md coverage complete
(253 unique lines).

| Drift found | Count | Correction |
| --- | --- | --- |
| Lines reworded (Ranger for trainer, Mochiioteca for Codex, world for Mainframe, Illuminate for Light-Pulse) | 31 / 265 | Reworded back to the md |
| Invented names (Merv, Kairos, Rin & Ren, Shimo, Nagisa, Delta, Bannon) | 7 | Removed, not canon — NAME GAP stays a gap |
| Town "Iridescence Plateau" for "Mainframe Plateau" | 4× | Corrected to Mainframe Plateau |
| Malformed flag (R3-09b prose note stored as a flag) | 1 | Removed from flags |

Trainer files on main corroborate the md: all leaders/elites/champions
are NAME GAP; Mythar team R5-047 exists; Hex teams R3-001 (lab-exit) +
R5-012 (Dojo 1) exist.

## Knot / flag / speaker rules

- **Knots:** one knot per beat id (`rN_MM_slug`), plus a `_after` knot for
  post-battle / post-event lines. A knot ends at the next knot's divert
  (knot-scoped play) or at `-> END` (full-story walk).
- **Flags:** `~ rN_* = true` assignments sit after the last line of their
  knot and run when the session is continued past it. Tests must drain a
  knot (`next()` to null) before asserting its flags — reading flags after
  the first line only is a test bug, not a story bug.
- **Speakers:** the clean display label is the base role title, title
  case. Dojo leaders render as "Dojo Leader", elites as "Elite N",
  champions as "First Champion" / "Mythar" / "Champion", Hex as "Hex".
  NPC labels are title-cased per space-separated word from the locked md
  label — a hyphenated compound in the md stays one word, so the md's
  "Portal-train conductor" renders "Portal-train Conductor", and
  "Hot-spring keeper" renders "Hot-spring Keeper". NAME GAP leaders /
  elites / champions stay gaps; canon names only (Prof. Aeon, Mochiko,
  Hex, Master Lin, Master Falk, Mythar).
- **Choices:** none. All four stories are linear; 0 choices in every walk.
- **Exit/flag checks:** the validator in `src/lib/wiring/validate-dialogue.ts`
  runs over the compiled stories; dead ends, flags read with no write,
  and diverts to missing knots are errors (pinned in
  `tests/dialogue-exit-flag.test.ts`).

## Trainer mapping

179 team-id mappings verified against `trainers-region2..5.ts` on main,
emitted as `// trainer:` comments in the `.ink` files (not as dialogue).
16 beats have dialogue but no trainer team on main — labelled
`// trainer GAP:` in the `.ink`, never invented:

| Beat | Gap |
| --- | --- |
| R2-04 | Well Syndicate operative has no Azalea team (only Mahogany Hideout Syndicate R2-010/R2-011) |
| R3-03 | Land faction scout has no Rustboro team (faction teams are all at Lilycove Hideout) |
| R3-05 | Sea faction scout has no Mauville team |
| R3-06 | Land faction base has no Lavaridge team |
| R3-08 | Sea faction weather-institute operative has no Fortree team |
| R3-10 | Legendary awakening encounters have no teams (ROSTER GAP by design) |
| R4-01 | No Twinleaf Hamlet team (nearest: Sandgem Route R4-001/R4-002) |
| R4-03 | No Jubilife-shape city team |
| R4-06 | Institute statue operative has no Eterna team |
| R4-08 | Institute warehouse operative has no Veilstone team |
| R5-02 | No Sandgem-shape town team |
| R5-05 | No Floaroma team |
| R5-08 | Liberation Front warehouse operative has no team |
| R5-09 | Frozen-plot Front operative has no team |
| R5-10 | No Celestic team |
| R5-16 | Hex tournament rematch has no dedicated team (R5-012 is the Dojo 1 Hex, not a tournament team) |

R5 dojos are positional by dojo number only — town labels diverge
(dialogue uses Region 4 town names; the trainer file + canon use
Floccesy / Virbank / Castelia / Nimbasa / Driftveil / Mistralton /
Icirrus / Opelucid). See Mars decisions below.

## What this PR does NOT do

- Regions 2–5 maps do NOT exist in `FULL_WORLD` yet (separate owed step);
  no NPC is wired to these knots in this PR.
- No trainer teams are defined here (ROSTER GAP in every beats entry —
  the trainer lane owns teams).
- No audio, Pages, or other lane's files touched.

## Mars decisions needed (flagged, never decided here)

- **Ranger vs trainer:** the attribution-test drift (dialogue-attribution-region1.test.ts fails 3/6 identically on main, pre-existing) is the same question — which speaker name is canon.
- **Codex vs Mochiioteca** naming in the R3/R4 lines.
- **Mainframe vs "the world"** wording (R4/R5 lines).
- **R5 town list:** dialogue batch reuses Region 4 town names; canon + trainer file use Floccesy / Virbank / Castelia / Nimbasa / Driftveil / Mistralton / Icirrus / Opelucid. Dialogue compiled as locked; mapping is positional only.
- **NAME GAP names stay gaps** (Merv / Kairos / Rin & Ren / Shimo / Nagisa / Delta / Bannon removed, not canon).
