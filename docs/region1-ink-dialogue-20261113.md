# Region 1 — live DialogueBox Ink wiring (step i, 2026-11-13)

## Audit: what was already on main (verified via GitHub API, main 91386dae)

| Piece | State on main before this PR |
|---|---|
| Truck start (new game spawns in `sector0_truck`) | DONE — IntroSequence `setMapState('sector0_truck', {x:6, y:8})` (sequence build 2026-10-28) |
| Phase A (Cave of Echoes ↔ Neon City) | DONE — exits in FullWorldMaps.ts AND Tiled JSON (cave `(11,27)` → neon `(18,35)`; neon `(18,37)` → cave `(11,27)`) |
| Phase B map skeleton | DONE as shells — all 46 keys in FULL_WORLD incl. route_2 … region2_arrival; Tiled JSON only through stoneport_city / dojo_3 |
| Phase B content | OWED — dojo_4–8 have 0 NPCs (no leaders/bosses); mainframe_plateau has ~1 NPC, 0 events (no Elite Four / Champion Hex); later maps have ~1 NPC, 0 events, 0 encounters |
| Ink story files | DONE — `src/lib/wiring/dialogue/region1-truck-start.ink` + compiled `region1-truck-start.json` (inkVersion 21, knots mom_truck → house_1f → house_2f_clock → rival_house → route_rescue → lab → mom_boots → END; flags clock_set / codex_get / sprint_boots); region1–5 dialogue JSON beat specs alongside |
| Ink validator + CI gate | DONE (PR #414) — `src/lib/wiring/validate-dialogue.ts` + CLI + tests; `validate:dialogue` script |
| inkjs dependency | DONE — `inkjs ^2.4.0` in package.json, but 0 imports anywhere: nothing played a story |
| DialogueBox | NO Ink — renders plain `lines[]` + YES/NO only; no `inkjs`, no choices list |
| Truck Mom talk | Plain `dialog[]` (her lines are the mom_truck knot's lines, verbatim) |

## What this PR wires (highest-impact missing piece)

1. **`src/lib/inkStory.ts`** — InkSession driver over inkjs. Loads a
   compiled Ink JSON story, splits `Name: text` speaker labels,
   walks lines, exposes choices, reads declared `global decl`
   variables. Two modes: knot-scoped (default — stops at the knot's
   divert boundary) and full-story (`followDiverts`, follows diverts
   to END). `createInkSession` returns null on unknown story / bad
   knot / bad JSON so callers fall back to plain dialog, never an
   empty box.
2. **`src/components/game/InkDialogueBox.tsx`** — drives DialogueBox
   line-by-line from a session; choices render as a vertical option
   list inside the same window (FireRed multichoice shape, not a
   popup). Fires `onComplete(variables)` once at the end.
3. **`src/components/game/DialogueBox.tsx`** — additive `options?` /
   `onOption?` props: multi-choice list on the last page, arrow-key /
   WASD cursor + Enter/Space/click to pick, same button styling as
   YES/NO. Undefined = old behaviour, untouched.
4. **`src/world/WorldEngine.tsx`** — `inkDialog` state + render
   branch; the NPC-talk path plays an NPC's `inkStory`/`inkKnot`
   through InkDialogueBox when a session can be created, else the
   plain `dialog[]` fallback. `finishInkDialog` records every flag
   the story set to true as `ink:<story>:<flag>` in completedEvents,
   then returns to the overworld.
5. **`src/world/FullWorldMaps.ts`** — truck Mom (`mom_truck`) now
   carries `inkStory: "region1-truck-start", inkKnot: "mom_truck"`.
   Her talk is the first live Ink dialogue in the game; the lines
   are unchanged (the knot's two lines, verbatim). The Sprint Boots
   grant is unaffected — it keys on NPC ids `mom` / `mom_house`,
   not `mom_truck`.
6. **`src/lib/inkStory.test.ts`** — vitest: speaker split, null
   fallbacks, mom_truck knot-scoped play (2 lines, then done),
   house_2f_clock (clock_set true), full-story walk with the
   5-starter choice (choose Tyrage) to END (all three flags true).
7. This doc.

## How to add the next story / knot

1. Add the compiled Ink JSON under `src/lib/wiring/dialogue/` and
   register it in `INK_STORIES` in `src/lib/inkStory.ts`.
2. Validate it: `npm run validate:dialogue` (exit/flag/divert checks).
3. Give an NPC `inkStory` + `inkKnot` in FullWorldMaps (knot-scoped
   is the default — one knot per talk), or open a full-story session
   from a scene that owns a whole beat.
4. Do NOT invent dialogue lines: story text comes from the locked
   `.ink` source / Mars's writing, never from the reference games.

## What remains for step (i) after this PR

- house_2f_clock event, lab starter Ink choice, mom_boots knot
  adoption (same seam, one knot per NPC/event).
- Regions 2–5 dialogue JSONs → compiled Ink stories, same pattern.
- Phase B content: dojo_4–8 leaders/teams, Elite Four + Champion
  Hex on mainframe_plateau, wild pools / trainers on the later maps
  (teams are a Mars gap — slots + level curve only, no invented
  stats).
- Tiled JSON for route_3 onward (TS world has them; Tiled dir stops
  at stoneport_city / dojo_3).
- `.ink` / `.json` drift (found during this audit, NOT changed here —
  locked content, Mars decides): the lab knot says "Route Topaz" in
  `region1-truck-start.ink` but "Route 1.0" in the compiled
  `region1-truck-start.json`. The JSON is the runtime source of
  truth; the test asserts the JSON line.

## Gate

PR-only, 0 file deletions, no force-push. Merge gate: guard +
budgets green, mergeable clean. Local full-repo gate not run (no
local node_modules with inkjs on this VM); CI is authoritative.
Bundle budgets carry large headroom (total gzip budget 1,600,000 vs
~785,210 measured 2026-10-29); inkjs adds ~tens of KB.
