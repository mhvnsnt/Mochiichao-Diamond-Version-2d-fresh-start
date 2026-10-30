# LANDING NOTES — Persona UI dialect package (verification addendum, 2026-10-28)

*This file is the landing pass's verification record. The four
package files beside it (`README.md`, `PERSONA5-UI-TEARDOWN.md`,
`MOCHII-UI-DIALECT.md`, `persona-dialect-fragment.json`) land
as authored in the workspace package; the only edit to any of
them is the dated landing addendum appended to `README.md`.
Everything below was checked against main itself, not against
the package's own claims.*

## Audit method

Full recursive tree listing of `main` @ `918b95fd` (23,119 blob
paths, not truncated), plus contents read for every file named
below. Tree searches run for `persona`, `dialect`,
`ui-dialect`, `syndicate` (case-insensitive).

## Was the package already landed? No.

None of `PERSONA5-UI-TEARDOWN.md`, `MOCHII-UI-DIALECT.md`, or
`persona-dialect-fragment.json` exists anywhere on main before
this PR. The search hits that *do* exist are different systems,
named here so nobody conflates them later:

- `docs/ui-art/persona-dialogue-tier1.md` — the Tier 1
  implementation record (see below); a precursor seat, not
  this dialect.
- `show/production/research/persona-5.md` and
  `show/production/research/persona-5-ui-principles.md` —
  earlier principles research for the show/game UI work; the
  teardown in this package is the deeper, sourced pass and
  does not contradict them.
- `show/production/world-systems/331-PERSONA-BONDS-CALENDAR.md`
  — #331 itself, which this dialect extends as its
  presentation layer (unchanged by this landing).
- `show/production/species-data/229-REGIONAL-CRY-DIALECTS.md` +
  `dialect-fragment.json` — *cry* dialects (creature sound
  regionality). Unrelated to this UI dialect; the shared word
  is a coincidence of naming, recorded here to prevent future
  confusion.
- `src/lib/personaDialogue.ts` — Tier 1 code (below).

## What already exists — the dialect's real seats on main

- **Tier 1 persona dialogue presentation is implemented in
  code** (read this pass): `src/lib/personaDialogue.ts`
  exports `personaPresentationForNpc`, wired through
  `DialogueBox`'s `presentationMode` prop — letterbox bars +
  larger portrait + name emphasis, opt-in per scene, for
  **Luigi Castagnoli only** (Castagnoli Island NPC routing).
  Its accent is the repo's StdWindow gold `#fbbf24`, not this
  dialect's (still-null) owner-slot accent.
- **The Mysterious Figure's slot exists**: `mysterious_figure`
  HumanSlot (label "Mysterious Figure", colour `#1a102e`,
  `sheetUrl: null`) per `docs/ui-art/mysterious-figure-slot-
  20261027.md`, with silhouette scene art in the repo. No NPC
  is placed, no scene exists, and `personaDialogue.ts` has
  **no** mysterious-figure branch — its header comment still
  records the pre-slot state. Persona framing for the figure
  remains an un-done one-function follow-up that waits on a
  placed scene (placement is an owner call per the slot doc).
- **Menu skins are a live codebase concept** exactly as
  `MOCHII-UI-DIALECT.md` §8 records (`src/lib/menuSkins.css`,
  `docs/ui-art/menu-skins/` with per-surface skin JSONs,
  `src/assets/ui/mochiichao-ui.css`).
- **#331** sits at `show/production/world-systems/331-
  PERSONA-BONDS-CALENDAR.md`; the dialect's seats for bond-rank
  ceremonies and calendar day-arrivals point there.

## How this dialect sits relative to Tier 1 — stated plainly

Tier 1 is a **shipped precursor**, not the dialect
implemented. It routes by speaker allowlist; the dialect's
§8 implementation shape routes by a `register`/`dialectClass`
data field with fragment validation. Tier 1 knows one
character and one treatment; the dialect is the reservation
law (classes A–D + Jax), the build-up curve, the full
grammar, and the audit data. Neither contradicts the other —
Tier 1 is, in dialect terms, a single Class-A-adjacent
dialogue treatment that predates the law — but **reconciling
them is implementation work this docs landing does not do**:
no code, CSS, or data file is changed by this PR.

## Implementation gaps (flagged, not papered over)

1. **No `register`/`dialectClass` field exists yet** on the
   dialogue-wiring JSONs or surface data; fragment validation
   rules are not yet in `src/lib/wiring/validate-dialogue.ts`.
   The dialect lands as the binding spec + fragment data; the
   game-side implementation is a follow-up build against
   `MOCHII-UI-DIALECT.md` §8.
2. **Mysterious Figure persona framing is unwired** (above):
   slot exists, no placed scene, no branch in
   `personaDialogue.ts`.
3. **League live-read locate-task remains open** (spec §8):
   `src/data/core/docs/league-fragment.json` is the canonical
   source of truth on main; the live read a reveal flag would
   wire into has not been located/built.
4. **Accent colour and glyph set are still null owner/art
   slots** (fragment `composition.palette.accent: null`) —
   the dialect cannot be rendered in full until slot 1 is
   ruled; Tier 1's gold is the base palette's accent, not a
   substitute ruling.
5. **Show side**: the companion landing (`show/production/
   SHOW-DIALECT-USE.md` + `show-dialect-fragment.json`) specs
   the register key on episode furniture rows; no show build
   tool consumes furniture styling keys — episode production
   is gate/checklist-driven, and the intertitle grammar
   (List 43 #422) it rides had itself not landed on main at
   this audit. Both flagged in that spec's §6.

## Landing homes — justification

- **This package → `docs/ui-art/persona-dialect/`**: `docs/
  ui-art/` is the game's UI design-docs home — it already
  holds `persona-dialogue-tier1.md`, `mysterious-figure-
  slot-20261027.md`, and the `menu-skins/` package (a sibling
  package in a named subfolder, the convention followed here).
- **The show extension → `show/production/`**: show
  presentation specs and their machine fragments live at the
  production root (`show-grammar-fragment.json`,
  `transition-fragment.json`, the numbered presentation
  docs), and the eyecatch host format it rides is at
  `show/production/list4-systems/EYECATCH-FORMAT.md`.
