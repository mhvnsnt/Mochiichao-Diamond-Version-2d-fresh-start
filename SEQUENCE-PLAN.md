# SEQUENCE-PLAN — Mochiichao, built in story sequence

The master tracker for the sequenced build (owner's order,
2026-10-28): the game is built from New Game forward, one sequence
at a time, each brought to 100% complete and playable — map,
buildings, art, creatures, sprites, dialogue, gameplay,
smoke-verified by actually running it — before the next becomes
the focus. Content built ahead of its sequence is stock for its
act, wired when the sequence arrives.

**The owner's measurement rule (2026-10-28): progress is counted
in complete playable experiences/sequences, never in inventory or
systems-on-paper percentages.**

## The standard every sequence is measured against

Two layers, both at 100%, plus the run:

- **(a) Pokémon baseline** — 100% of what Pokémon does for that
  kind of sequence (opening / town / route / dojo / league),
  derived from the held decomp study material
  (`~/workspace/pokemon-code-study/`, pret-pokeheartgold /
  pret-pokeyellow and the rest) and the repo's own systems.
- **(b) Mochiichao layer** — 100% of what this universe adds on
  top, from the owner's canon and the landed systems: follower
  creatures, the Mochi Garden, encounter behaviour, the UI as
  designed, the movement system (`src/data/core/movement.json`).
- **ANIMATION line** (standing, owner's Addendum 2, 2026-10-28):
  player walk/idle ✓, NPC animation ✓, follower animation ✓,
  battle-entry creature animation. Characters in the playable
  path are animated sprites — idle stance and 4-direction walk
  cycles from real sprite assets. Static cutouts and whole-sprite
  bob/tilt/zoom do not count. A character whose frames genuinely
  don't exist is a NAMED GAP in that sequence, and building the
  frames from the canon sheet is part of the sequence's work.
  No placeholder/prototype stand-ins anywhere in a "done"
  sequence's playable path.
- **Smoke**: the sequence actually runs — scripted headless drive
  with screenshots and save-state probes, recorded in a
  SMOKE-RECORD. A sequence is DONE only when (a) + (b) + the
  animation line pass AND the smoke runs.

Story content comes from the owner's canon spine: the five
region dialogue-wiring files in `src/lib/wiring/dialogue/`
(71 beats total) plus the locked truck-start ink. The spine is
the owner's writing; it is never rewritten here — sequences are
built FROM it. Canon gaps the files themselves flag (e.g. dojo
leader NAME GAPs) stay flagged; they are the owner's calls.

## Existential charge & the numinous — what a place IS (doctrine; owner-ruled 2026-10-28, logged 2026-10-29)

**THE GAME BIBLE NOW EXISTS:** `GAME-BIBLE.md` (repo
root), created on the owner's order (2026-10-29) precisely
because there was none. Its Part I opens with this same
doctrine — existential charge & the numinous — stated as
the book's first law, and its Part II stacks the Show
Bible whole (same coin; SHOW-BIBLE §5 law 10, the two-lane
consistency law: one ruling, both lanes, same terms; the
show-side charge entry is SHOW-BIBLE §5A). This tracker
section is the build-rule summary the sequence work runs
on; the bible is the doctrine's home.

Every area a sequence builds is graded on what the place
*is*, underneath what it contains: its **existential
charge** (production term; **numinous** / numinosity = how
the charge *feels*; *genius loci* = a place's own spirit).
In-world language is plain only — blessed / haunted /
cursed / lucky — and the production words appear in no UI
string, sign, or Mochiioteca entry.

- **States × strength:** BLESSED / LUCKY / HAUNTED / CURSED
  / UNMARKED × faint / settled / deep / peak. **Base
  charge is canon data** in the place's own record (#7
  area records): set by the owner or by story, never
  rewritten by any system. **Current charge is a
  read-time derivation** — base drifted by story events
  and accumulated in-place deeds, capped: drift deepens
  or softens strength, **never flips a state**, and never
  founds a settled or deep charge on unmarked ground. A
  sequence never assigns a base charge the owner has not
  ruled — unruled places build UNMARKED (owner slots
  41–42 of the machinery package).
- **Felt, never itemised — the build rule.** No meter,
  tally, UI label, or readout of any charge, ever. Charge
  effects are **fortune + presence only**: leans inside
  the already-derived effective encounter table (never a
  new row, rate, or species), finds and coincidence
  texture, phenomena (never creatures, encounters, or
  capture targets) — never damage, never a blocked path,
  never a battle or capture resolution. Effects are
  seeded (place + world beat + derivation version),
  reproducible, never pure RNG. **Acceptance is the
  owner's test, applied at the sequence smoke: the player
  FEELS the magic coming out of the setting. A charge
  that reads correctly in the data and is not felt in the
  hands fails the sequence.**
- **Presence-first + foreshadowing.** Presence is created
  first — lighting, colour, scenery; a place's charge
  read is recorded when its area is graded and built.
  Identity is revealed only when earned. Charged
  presentation may hint at **existence** (a shimmer, a
  silhouette crossing a sky) — never at **access**: no
  spawn row, no marked location, no door. Goddgachuu's
  seal stands exactly as landed (PR #96); foreshadowing
  is presentation, not obtainability.
- **The Forest.** The most numinous ground in the world:
  a dual read (deepest dread + the game's highest luck)
  at peak. Base charge ONLY — no drift; deeds there feed
  the DREAD tallies, never charge. Blessings arrive
  through the DREAD §0a mediation: bent, unexplained,
  never making it safe. **The depths spawn table stays
  EMPTY (0 rows), and charge never touches it.** Charge
  never explains what stopped moving.
- **Legendary sites (the peak class).** Maximum charge
  bound to a **one-time event** — an event, never a
  spawn-table entry; spent sites keep their charge and
  never re-arm. **Zero instances exist** (owner slot 48);
  the Dark Forest is charge-extreme, NOT a legendary
  site, unless the owner rules otherwise.
- **Machinery + open items.** PLACE-CHARGE.md +
  `fates-placecharge-fragment.json` (moral-choices
  package — **not yet landed in this repo**; workspace
  seat `~/workspace/mochiichao-show/moral-choices-
  system/`; landing owed). Owner slots 41–48 —
  assignments (41–42), drift caps/windows (43),
  story-event flips/foundings (44), the world-memory
  seam (45), the fortune menu + Forest luck ceiling
  (46), phenomena seats (47), legendary sites + the peak
  band's name (48) — are referenced, never filled by a
  build lane.

---

## §0 — Phase 0 audit: what actually runs (2026-10-28, verified)

### §0.1 The player-facing entry — pinned

The only Play surface named anywhere in the repo is the README's
Google AI Studio app
(`https://ai.studio/apps/2645a3ca-5bca-4555-9072-16b251d42c40`;
`metadata.json` calls it "Remix: Mochiichao Diamond Version"; the
root `index.html` title is still "My Google AI Studio App").
**That app — not the repo build — is what the owner gets when he
presses Play today**, and its state is the owner's own verdict,
quoted on record: **"three JS prototype bullshit"** — a raw
procedural Three.js prototype, little procedural shapes, no
character image at all. Verified from this side: GitHub code
search finds **zero** three.js / THREE / WebGLRenderer anywhere
in this repo or the account's repos; there is no GitHub Pages
(404) and no deployments list. The prototype lives only inside
the AI Studio project and has diverged from the repo.

Front-ends that exist, and their fates:

| # | Front-end | State | Fate |
|---|-----------|-------|------|
| 1 | AI Studio app (above) | Player-facing today; procedural prototype, no character sprites | **Replaced** by the repo build as the served surface (follow-up for the parent lane — needs the signed-in browser; not claimed by this build) |
| 2 | Repo React app (`src/`, Vite + Pixi) | The real game: full world, battle system, dialogue, saves | **The sequence build target** — Sequences 1–2 built and smoked here |
| 3 | `src/world/Maps.ts` MAPS | Legacy map set, unused by the engine (the engine runs FULL_WORLD from `FullWorldMaps.ts`) | Left in place, unused; not a playable path |
| 4 | parseJSX tooling files | Build tooling, not a front-end | n/a |

Screenshots of the AI Studio prototype itself need a signed-in
browser session — named follow-up for the parent, not faked here.

### §0.2 Baseline state before this build (commands run, results)

- `npm run build` — exit 0.
- `npx tsc --noEmit` — FAILED, exactly 1 error:
  `docs/` archive `TitleCreatureFigure.tsx(2,24) TS2307: Cannot
  find module './TitleScene'` (tsconfig had no include/exclude,
  so the docs archive was typechecked with the game).
- `npm run test` — 90/93. All 3 failures one root cause: the live
  MOVES_DB has **122** moves; the tests pinned 121. The 122nd is
  **WATER_ORB** (Dorowani's signature move, owner canon), present
  in the move DB but missing from
  `src/lib/generated/gameMoveScriptMap.json` entirely.
- Pre-change headless smoke (Playwright against the built app):
  boot → title → menu → save slots → Aeon intro → gender → names
  → world all ran; a new game spawned in the Sector 0 town. But:
  the truck map (`sector0_truck`) existed yet was **orphaned** —
  nothing led into it, and the canon
  `region1-truck-start.ink` was executed by no game code (its
  loader was referenced only by a validator). Creature NPCs
  rendered one frozen front sheet cell; nothing re-rendered the
  world between steps. **No follower existed.** Sprint Boots were
  fiction only (Mom's dialogue promises them; no flag, no
  mechanic). The house 2F clock was sign text only. Starter NPCs
  carried emoji sprites the canvas never draws, so they rendered
  as generic figures. `movement.json` existed only on PR #66's
  branch, consumed by nothing. Terrain renders as flat-colour
  procedural tiles; some human slots have real sheets (Hex,
  Aeon); the BOY player slot and Mom rendered drawn fallback
  figures.

### §0.3 Defects found by the audit and the smoke (all on record)

1. WATER_ORB unrouted and unlisted in the move script map
   (fixed in this build — see §0.4).
2. tsconfig typechecked the docs archive (fixed — §0.4).
3. Truck start orphaned; canon ink unexecuted (fixed by wiring
   the spawn + truck cast — Sequence 1).
4. Choice dialogues swallowed Enter/Space on every page: a
   keyboard player could only answer YES/NO blind from page 1,
   because the choice key handler returned early before the
   page-advance could run. Found by the smoke at the starter
   choice; fixed in `DialogueBox.tsx` (Enter/Space advance
   non-final pages; Y/N still answer from any page).
5. Keyboard held-movement relied on OS auto-repeat: `heldDir`
   was set only by the touch D-pad, so keyboard holds (and the
   B-button sprint) could never change keyboard move speed.
   Fixed in `WorldEngine.tsx` (keyboard now mirrors the D-pad:
   keydown sets heldDir, keyup clears it, auto-repeat ignored).
6. F5 pressed outside the overworld reloads the page (the
   handler only preventDefaults in the overworld screen) and the
   session restores from its last autosave. Recorded as a hazard
   for players too: an F5 during a dialogue or battle loses the
   session back to the last autosave point. Not changed by this
   build; named here.

### §0.4 Baseline fixes landed with this build

- `tsconfig.json`: include `[src, tests, tools, vite.config.ts]`,
  exclude `[node_modules, dist, docs]` — the docs archive no
  longer breaks the game's typecheck.
- `gameMoveScriptMap.json`: WATER_ORB added to `unmatched` with
  its reason (Water, Special, BP 80, SP.DEF-down secondary; no
  union script at the fit bar yet). Counts now
  {gameMoves: 122, exactId: 10, mappedHere: 76, totalMatched: 86,
  unmatched: 36}. Tests updated to the true counts
  (`combatPhase3.test.ts`, `moves-batch2.test.ts`).
- After fixes: `npm run build` exit 0, `npx tsc --noEmit` exit
  0, `npm run test` **93/93**.

---

## Sequence 1 — The Opening: truck, Boot Harbor, the Lab, Hex

*Story: Aeon's intro (Beats 0–1, locked ink
`region1-truck-start.ink`) → the moving truck → Boot Harbor
(Sector 0) → home (Mom, the clock, the Sprint Boots) → Prof.
Aeon's Lab → the starter gift → Hex's first battle.*

**Status: PLAYABLE END-TO-END, NOT DONE.** Every Sequence 1
experience runs through its real flow and is smoke-proven (see
`docs/sequence-build/SMOKE-RECORD-2026-10-28.md`): truck opening,
town, house + clock, Sprint Boots, lab, starter, follower, Hex
battle. It is not marked DONE because the ANIMATION line carries
named gaps the owner's bar does not waive: the BOY player sheet
does not exist, Mom's sheet variant is unassigned, and Hex's
standing pose renders his battle row at world scale (his real
overworld cells exist in his atlas). Closing those is art/lane
work, named below — the sequence completes when they land.

### (a) Pokémon baseline

- ✓ Truck/room opening interior, exit door to the town
  (this build: spawn moved from the town to `sector0_truck`
  (6,8); the ink's cast placed — Mom in the truck with her ink
  lines verbatim, both movers with their clock/room lines).
- ✓ Home interior: mother NPC with her real dialogue, heal
  point, upstairs room with the clock — the clock is a real
  step-on event with the ink's lines (this build), not sign text.
- ✓ Professor's lab: professor + assistant, the starter choice
  (five canon starters here, not three — the owner's design),
  the gift, the professor's speech event.
- ✓ First rival battle immediately after the starter, through
  the real battle UI, with reward money and a post-battle goal
  dialogue (Hex, fixed counter-pick team).
- ✓ First town complete: named NPCs with wired dialogue, four
  signs, a heal point, working doors (house, lab), wandering
  NPCs.
- ✓ Running shoes equivalent: the Sprint Boots — Mom's dialogue
  promises them, and this build makes them real
  (`hasSprintBoots` in the save; hold B to run at the movement
  config's 70 ms cadence vs 140 ms walking — smoke-measured at
  exactly 2×: 10 tiles vs 5 tiles in 1250 ms).
- ✓ Saving: 3 slots, F5 quicksave, autosave on map change.

### (b) Mochiichao layer

- ✓ Follower creature: the party lead trails the player from a
  command-buffer trail (per `movement.json`: cleared on warp,
  minimum buffered steps honoured) — smoke-proven in the lab.
- ✓ Creature NPCs are the canon species as themselves: the five
  lab starters (Mochii 001, Razorgater 004, Tyrage 007,
  Kittember 010, Sproutle 038) plus Dorowani and Gabu on display.
- ✓ The truck opening is this universe's own canon opening
  (the locked ink), not a borrowed one.
- ✓ Movement system consumed for real: `movement.json` +
  its schema landed from PR #66's branch and are imported by
  the engine (sprint cadence + follower trail parameters).
- — Mochi Garden hooks: the Garden itself opens in Sequence 3;
  no garden surface belongs to Sequence 1's path.

### ANIMATION line

- Player walk/idle: **GIRL ✓** (Player A atlas, real walk pairs,
  all four facings smoke-shot). **BOY — GAP (named): `player_boy`
  has no sheet at all**; the boy renders the engine's drawn
  fallback figure. Building the boy's sheet from canon art is
  Sequence 1 work that remains open.
- NPC anim: creatures ✓ (this build: creature NPCs and the
  follower render real walk frames from the walk-frame tables in
  the {step, stand, step, stand} rhythm — proven by pixel-diff
  burst: Dorowani 2,580 px, Gabu 3,834 px, Kittember 2,513 px,
  Mochii 3,923 px changing between frames with the camera still).
  Wandering humans animate while moving ✓. **Mom — GAP (named):
  four variant atlases exist as data (`variantSheets` in
  `humanSheets.ts`) but no variant is assigned — the slot's own
  comment says picking one would invent a canon Mom; she renders
  the fallback figure until that design call is made.**
  **Hex standing pose — GAP (named): his partial atlas's standing
  render takes the row-0 battle pose at world scale (the
  documented partial-atlas convention), so in the lab and in town
  he reads as a large dark-purple mass, not as Hex. His chibi
  walk cells exist in the same atlas (row 1) and his moving
  render uses them. Fix = standing render prefers the walk-idle
  cell when a slot carries a walk layout — named here for the
  human-sprite lane rather than landed silently, because row-0
  standing is a repo-wide convention (Aeon's row-0 front reads
  fine).**
  **Generic townsfolk — GAP (named): several unnamed Boot Harbor
  townsfolk slots have no sheet and render the drawn fallback
  figure; the truck's two movers have no human slot at all.**
- Follower anim ✓ (walk frames by direction and phase).
- Battle-entry creature anim ✓ (script-mapped move system,
  86/122 moves routed; the 36 unrouted — including WATER_ORB —
  are named in the script map, not silent).

### Canon calls flagged, not chosen

- The ink's `route_rescue` starter form vs the implemented lab
  pick: the game implements the lab pick (five starters, Hex
  counter-picks). The ink variant is flagged for the owner.
- The ink's `mom_boots` grant point (after the lab) vs the
  implemented grant (first Mom conversation, house or town):
  the build grants on the first non-event Mom conversation so
  the boots work for Route 1; flagged for the owner.

---

## Sequence 2 — Route 1 and Silicon Town services

*Story: R1-BEAT2 "first route" (town: Route Topaz) + the
Silicon Town services the road leads to (heal + the MochiiPlex
shop). The Dojo 1 / Garden beat in the same town is Sequence 3.*

**Status: PLAYABLE END-TO-END, NOT DONE** — for the same
animation reason as Sequence 1 (the BOY sheet gap is on this
sequence's path too) and one data mislabel named below. Route,
wilds, battles, town and shop are all smoke-proven (smoke
record, drives of 2026-10-28): Route 1 traversed on its road,
a wild battle triggered in verified tall grass and fought to a
win, Silicon Town reached, the MochiiPlex entered, and a LUIGI
CUBE bought — wallet 1100 → 1030, cubes 15 → 16.

### (a) Pokémon baseline

- ✓ First route complete: road, tall-grass patches, a ledge row
  (jump-down at y=28, road gap x13–15), 2 signs, 4 trainers
  (incl. Hiker Dan sightline battle on the road), HM-gated
  tiles present for later.
- ✓ Wild encounters live: tall grass, 15%/step, level 2–4 pool.
- ✓ First wild battle end-to-end through the real battle UI:
  encounter → commands → damage → win → return to the world.
- ✓ Second town reached (Silicon Town / binary_fields):
  MochiiPlex with heal point and shop; town exits wired.
- ✓ First store visit complete: walk in, browse, buy, leave —
  money and inventory actually change (smoke-proven, above).
- ✓ Trainer battles on the route playable through the same UI.

### (b) Mochiichao layer

- ✓ Follower stays with the player across the route and into
  town (trail clears on warp, per the movement config).
- ✓ Sprint Boots work on the route (B to run, 70 ms cadence).
- ✓ The shop sells this universe's capture item (LUIGI CUBE)
  through the real ShopView with confirm-before-money.
- **Data note (named): the Route 1 pool entry labelled
  "Zephling" carries species id "016", but 016 is Squirmite in
  the species/walk tables (Zephling is 019) — the wild that
  appears is species 016's data. One-line data fix, named here.**
- **Prices note: ShopView prices are self-declared placeholder
  — the CR economy is an owner slot, not filled here.**

### ANIMATION line

- Player walk/idle: GIRL ✓ / BOY GAP (same named gap as
  Sequence 1 — one sheet closes both).
- NPC anim ✓ (route trainers render their sheets; wandering
  townsfolk animate while moving; the unnamed-slot fallback
  figures named in Sequence 1 appear here too).
- Follower anim ✓. Battle-entry anim ✓ (same system as Seq 1).
- Wild creatures appear as themselves (species sprite + walk
  art), never as a generic shape ✓.

---

## Sequence 3 — Dojo 1 and the Mochi Garden (Silicon Town)

*Story: R1-BEAT3 — Dojo 1 (Master Lin, the Core Fragment),
the Mochi Garden opens, heavy-lift flag. Maps: binary_fields,
dojo_1, mochiiplex_1 — all exist in FULL_WORLD.*

**Status: NOT STARTED (next in sequence).** The town and the
plex already run (Sequence 2's smoke); the dojo interior, the
leader battle wiring from the beat file, and the Garden's first
opening are this sequence's work.

### (a) Pokémon baseline (checklist for the build)

- ☐ Dojo interior walkable, leader + trainers placed, badge
  battle through the real battle UI, badge + post-battle
  dialogue wired from the beat file.
- ☐ Town services already live (heal/shop — Sequence 2) stay
  live; dojo door + signs wired.
- ☐ Exit onward to Sequence 4 (binary_woods) opens on the
  badge/flag, not before.

### (b) Mochiichao layer

- ☐ The Mochi Garden opens: first garden surface, creature
  deposit/roam hooks per the garden design.
- ☐ Heavy-lift flag (`heavy_lift` in the beat) wired to its
  mechanic.
- ☐ Follower + garden interaction: the follower is present in
  town; garden creatures animate (ANIMATION line applies).

**Known early-access wart (named): `binary_fields` already has
a `dojo_8` door at (24,14) that opens Sequence 7's interior
early. Sequence 3's build should gate it on its badge flag.**

---

## Sequence 4 — R1-BEAT4: The Dark Forest, Route Emerald, Stoneport Dojo 2

*Region: Iridescence. Town/place: The Dark Forest / Stoneport. Maps: binary_woods, stoneport_city, dojo_2.*
*Dojo: leader Master Falk (canon), badge Wind Fragment.*
*Antagonist beat: Hacker, docks.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 5 — R1-BEAT5: Cave of Echoes, Signal Tunnel, Neon City Dojo 3

*Region: Iridescence. Town/place: Cave of Echoes / Neon City. Maps: cave_of_echoes, signal_tunnel, neon_city, dojo_3.*
*Dojo: leader ROSTER GAP leader name — Mars to name, do not invent, badge Badge 3/8.*
*Antagonist beat: Ferry captain.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 6 — R1-BEAT6: Pale Town Tower, Market City Dojo 4, Central City Dojo 5

*Region: Iridescence. Town/place: Pale Town / Market City / Central City. Maps: pale_town, market_city, dojo_4, central_city, dojo_5.*
*Dojo: leader NAME GAP, badge Badge 4/8.*
*Antagonist beat: Hideout leader.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 7 — R1-BEAT7: Harbor City Dojo 6, Ember Island Dojo 7, Silicon Town Dojo 8

*Region: Iridescence. Town/place: Harbor City / Ember Island / Silicon Town. Maps: harbor_city, dojo_6, ember_island, dojo_7, dojo_8.*
*Dojo: leader NAME GAP, badge Badge 6/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 8 — R1-BEAT8: Victory Route, Iridescence Plateau, Hall of Records

*Region: Iridescence. Town/place: Victory Route / Iridescence Plateau. Maps: victory_route, mainframe_plateau.*
*Champion: Champion Hex (canon).*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 9 — R1-BEAT9: Region 1 post-game, Seven Mochii Isles

*Region: Iridescence. Town/place: Seven Mochii Isles. Maps: data_isle_1, data_isle_2, data_isle_3, data_isle_4, data_isle_5, data_isle_6, data_isle_7, region2_arrival.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 10 — R2-01: arrival town, no dojo

*Region: Twin / Return. Town/place: Dawnfield. Maps: r2_dawnfield.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 11 — R2-02: opening road town, no dojo

*Region: Twin / Return. Town/place: Cherryport. Maps: r2_cherryport.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 12 — R2-03: Dojo 1, tower puzzle

*Region: Twin / Return. Town/place: Violet Town. Maps: r2_violet, r2_tower, r2_dojo_1.*
*Dojo: leader NAME GAP, badge R2-1/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 13 — R2-04: Dojo 2, well / spring rescue

*Region: Twin / Return. Town/place: Azalea Town. Maps: r2_azalea, r2_well, r2_dojo_2.*
*Dojo: leader NAME GAP, badge R2-2/8.*
*Antagonist beat: Syndicate operative, at the well.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 14 — R2-05: forest maze, shrine, no dojo

*Region: Twin / Return. Town/place: Ilex Forest. Maps: r2_ilex_forest, r2_shrine.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 15 — R2-06: Dojo 3, Radio Tower, market

*Region: Twin / Return. Town/place: Goldenrod City. Maps: r2_goldenrod, r2_radio_tower, r2_dojo_3, r2_garden_branch.*
*Dojo: leader NAME GAP, badge R2-3/8.*
*Antagonist beat: Syndicate operative, tower lobby.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 16 — R2-07: Dojo 4, Burned Tower

*Region: Twin / Return. Town/place: Ecruteak City. Maps: r2_ecruteak, r2_burned_tower, r2_dojo_4.*
*Dojo: leader NAME GAP, badge R2-4/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 17 — R2-08: Dojo 5, lighthouse, Wave-Ride gate

*Region: Twin / Return. Town/place: Olivine City. Maps: r2_olivine, r2_lighthouse, r2_dojo_5.*
*Dojo: leader Merv, badge R2-5/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 18 — R2-09: Dojo 6, across water, medicine beat

*Region: Twin / Return. Town/place: Cianwood City. Maps: r2_cianwood, r2_dojo_6.*
*Dojo: leader NAME GAP, badge R2-6/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 19 — R2-10: Dojo 7, lake, hideout raid

*Region: Twin / Return. Town/place: Mahogany Town. Maps: r2_mahogany, r2_lake, r2_hideout, r2_dojo_7.*
*Dojo: leader NAME GAP, badge R2-7/8.*
*Antagonist beat: Syndicate hideout leader (role only, NAME GAP for personal name).*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 20 — R2-11: Dojo 8, Dragon's Den trial

*Region: Twin / Return. Town/place: Blackthorn City. Maps: r2_blackthorn, r2_den, r2_dojo_8.*
*Dojo: leader NAME GAP, badge R2-8/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 21 — R2-12: Gauntlet, no dojo, no town

*Region: Twin / Return. Town/place: Victory Route. Maps: r2_victory_route.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 22 — R2-13: Elite Four + Champion

*Region: Twin / Return. Town/place: Iridescence Plateau, second ascent. Maps: r2_plateau, r2_elite_1, r2_elite_2, r2_elite_3, r2_elite_4, r2_champion, r2_hall.*
*Champion: CHAMPION — Rin & Ren (twins, joint holders).*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 23 — R2-14: post-game final battle, link to Region 3

*Region: Twin / Return. Town/place: Frost Peak. Maps: r2_frost_peak.*
*Champion: FIRST CHAMPION — Shimo.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 24 — R3-01: outpost bedroom + lab start (chapter opening, not a new game)

*Region: Sea / Land. Town/place: Root Hamlet. Maps: r3_outpost_2f, r3_outpost_1f, r3_root_hamlet, r3_lab.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 25 — R3-02: opening road, no dojo

*Region: Sea / Land. Town/place: Oldale Road. Maps: r3_oldale_road.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 26 — R3-03: Dojo 1, stone / rock theme

*Region: Sea / Land. Town/place: Rustboro City. Maps: r3_rustboro, r3_dojo_1.*
*Dojo: leader NAME GAP, badge R3-1/8.*
*Antagonist beat: Land faction scout.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 27 — R3-04: Dojo 2, island, cave

*Region: Sea / Land. Town/place: Dewford Town. Maps: r3_dewford, r3_cave, r3_dojo_2.*
*Dojo: leader NAME GAP, badge R3-2/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 28 — R3-05: Dojo 3, electric city, Arena

*Region: Sea / Land. Town/place: Mauville City. Maps: r3_mauville, r3_arena, r3_dojo_3.*
*Dojo: leader NAME GAP, badge R3-3/8.*
*Antagonist beat: Sea faction scout.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 29 — R3-06: Dojo 4, hot springs, Land base

*Region: Sea / Land. Town/place: Lavaridge Town. Maps: r3_lavaridge, r3_dojo_4, r3_land_base.*
*Dojo: leader NAME GAP, badge R3-4/8.*
*Antagonist beat: Land faction leader (role only, NAME GAP for personal name).*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 30 — R3-07: Dojo 5, return dojo

*Region: Sea / Land. Town/place: Petalburg City. Maps: r3_petalburg, r3_dojo_5.*
*Dojo: leader Kairos, badge R3-5/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 31 — R3-08: Dojo 6, tree city, weather institute

*Region: Sea / Land. Town/place: Fortree City. Maps: r3_fortree, r3_weather_institute, r3_dojo_6.*
*Dojo: leader NAME GAP, badge R3-6/8.*
*Antagonist beat: Sea faction operative, weather institute.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 32 — R3-09: Dojo 8 in canon order, Deep-Dive gate, awakening (canon order: Lilycove, Mossdeep, then this crater city)

*Region: Sea / Land. Town/place: Crater City. Maps: r3_crater_city, r3_dojo_8.*
*Dojo: leader NAME GAP, badge R3-8/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 33 — R3-09a: port, hideout under the city, no dojo

*Region: Sea / Land. Town/place: Lilycove. Maps: r3_lilycove, r3_hideout.*
*Antagonist beat: Land faction operative + Sea faction operative, colliding in the hideout.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 34 — R3-09b: island research city, Dojo 7

*Region: Sea / Land. Town/place: Mossdeep. Maps: r3_mossdeep, r3_dojo_7.*
*Dojo: leader NAME GAP, badge R3-7/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 35 — R3-10: legendary climax, before the League

*Region: Sea / Land. Town/place: The Awakening. Maps: r3_awakening.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 36 — R3-11: Gauntlet, sea and cave

*Region: Sea / Land. Town/place: Victory Route. Maps: r3_victory_route.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 37 — R3-12: Elite Four + Champion

*Region: Sea / Land. Town/place: Iridescence Plateau, third ascent. Maps: r3_plateau, r3_elite_1, r3_elite_2, r3_elite_3, r3_elite_4, r3_champion, r3_hall.*
*Champion: CHAMPION — Nagisa.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 38 — R3-13: post-game, link to Region 4

*Region: Sea / Land. Town/place: Frontier Arenas. Maps: r3_frontier_arenas.*
*Antagonist beat: Liberation Front speaker, on the airship route.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 39 — R4-01: airship arrival, no dojo

*Region: Rift. Town/place: Twinleaf Hamlet. Maps: r4_twinleaf.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 40 — R4-02: researcher's town, first route, no dojo (shape label, not a new place name)

*Region: Rift. Town/place: Sandgem-shape town. Maps: r4_sandgem.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 41 — R4-03: media city, institute's public face, no dojo (shape label, not a new place name)

*Region: Rift. Town/place: Jubilife-shape city. Maps: r4_jubilife.*
*Antagonist beat: Institute speaker.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 42 — R4-04: Dojo 1, mining / rock theme

*Region: Rift. Town/place: Oreburgh City. Maps: r4_oreburgh, r4_dojo_1.*
*Dojo: leader NAME GAP, badge R4-1/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 43 — R4-05: flower town, valley, first Rift crack, no dojo

*Region: Rift. Town/place: Floaroma Town. Maps: r4_floaroma.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 44 — R4-06: Dojo 2, forest city, institute theft

*Region: Rift. Town/place: Eterna City. Maps: r4_eterna, r4_dojo_2, r4_statue.*
*Dojo: leader NAME GAP, badge R4-2/8.*
*Antagonist beat: Institute operative, at the statue.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 45 — R4-07: Dojo 3, contest / Garden branch

*Region: Rift. Town/place: Hearthome City. Maps: r4_hearthome, r4_contest_hall, r4_dojo_3.*
*Dojo: leader NAME GAP, badge R4-3/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 46 — R4-08: Dojo 4, institute city, warehouses

*Region: Rift. Town/place: Veilstone City. Maps: r4_veilstone, r4_warehouse, r4_dojo_4.*
*Dojo: leader NAME GAP, badge R4-4/8.*
*Antagonist beat: Institute operative, warehouse.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 47 — R4-09: Dojo 5, marsh city, preserve

*Region: Rift. Town/place: Pastoria City. Maps: r4_pastoria, r4_preserve, r4_dojo_5.*
*Dojo: leader NAME GAP, badge R4-5/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 48 — R4-10: old town, cave painting, lore, no dojo

*Region: Rift. Town/place: Celestic Town. Maps: r4_celestic, r4_cave_painting.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 49 — R4-11: Dojo 6, port, library, island

*Region: Rift. Town/place: Canalave City. Maps: r4_canalave, r4_library, r4_island, r4_dojo_6.*
*Dojo: leader NAME GAP, badge R4-6/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 50 — R4-12: Dojo 7, snow city, temple

*Region: Rift. Town/place: Snowpoint City. Maps: r4_snowpoint, r4_temple, r4_dojo_7.*
*Dojo: leader NAME GAP, badge R4-7/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 51 — R4-13: Dojo 8, solar city, lighthouse road

*Region: Rift. Town/place: Sunyshore City. Maps: r4_sunyshore, r4_dojo_8.*
*Dojo: leader NAME GAP, badge R4-8/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 52 — R4-14: Gauntlet, mountain, snow, Rift cracks

*Region: Rift. Town/place: Victory Route. Maps: r4_victory_route.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 53 — R4-15: Elite Four + Champion

*Region: Rift. Town/place: Iridescence Plateau, fourth ascent. Maps: r4_plateau, r4_elite_1, r4_elite_2, r4_elite_3, r4_elite_4, r4_champion, r4_hall.*
*Champion: CHAMPION — Delta.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 54 — R4-16: post-game, link to Region 5

*Region: Rift. Town/place: Battle Zone + Rift Dungeon. Maps: r4_battle_zone, r4_rift_dungeon.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 55 — R5-01: portal-train arrival, no dojo

*Region: New Continent. Town/place: Start City. Maps: r5_start_city.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 56 — R5-02: researcher's town, first route, no dojo (shape label, not a new place name)

*Region: New Continent. Town/place: Sandgem-shape town. Maps: r5_sandgem.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 57 — R5-03: media city, Front rally, no dojo (shape label, not a new place name)

*Region: New Continent. Town/place: Jubilife-shape city. Maps: r5_jubilife.*
*Antagonist beat: Liberation Front speaker, rally.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 58 — R5-04: Dojo 1, mining / rock theme

*Region: New Continent. Town/place: Oreburgh City. Maps: r5_oreburgh, r5_dojo_1.*
*Dojo: leader NAME GAP, badge R5-1/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 59 — R5-05: flower town, valley, no dojo

*Region: New Continent. Town/place: Floaroma Town. Maps: r5_floaroma.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 60 — R5-06: Dojo 2, forest city

*Region: New Continent. Town/place: Eterna City. Maps: r5_eterna, r5_dojo_2.*
*Dojo: leader NAME GAP, badge R5-2/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 61 — R5-07: Dojo 3, contest / Garden branch

*Region: New Continent. Town/place: Hearthome City. Maps: r5_hearthome, r5_contest_hall, r5_dojo_3.*
*Dojo: leader NAME GAP, badge R5-3/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 62 — R5-08: Dojo 4, Front warehouse city

*Region: New Continent. Town/place: Veilstone City. Maps: r5_veilstone, r5_warehouse, r5_dojo_4.*
*Dojo: leader NAME GAP, badge R5-4/8.*
*Antagonist beat: Liberation Front operative, warehouse.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 63 — R5-09: Dojo 5, marsh city, preserve, frozen plot start

*Region: New Continent. Town/place: Pastoria City. Maps: r5_pastoria, r5_preserve, r5_dojo_5.*
*Dojo: leader NAME GAP, badge R5-5/8.*
*Antagonist beat: Liberation Front operative, cold corner.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 64 — R5-10: old town, lore, no dojo

*Region: New Continent. Town/place: Celestic Town. Maps: r5_celestic.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 65 — R5-11: Dojo 6, port, library, frozen plot escalates

*Region: New Continent. Town/place: Canalave City. Maps: r5_canalave, r5_library, r5_dojo_6.*
*Dojo: leader NAME GAP, badge R5-6/8.*
*Antagonist beat: Liberation Front speaker, library steps.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 66 — R5-12: Dojo 7, snow city, temple, frozen plot

*Region: New Continent. Town/place: Snowpoint City. Maps: r5_snowpoint, r5_temple, r5_dojo_7.*
*Dojo: leader NAME GAP, badge R5-7/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 67 — R5-13: Dojo 8, solar city, lighthouse road

*Region: New Continent. Town/place: Sunyshore City. Maps: r5_sunyshore, r5_dojo_8.*
*Dojo: leader NAME GAP, badge R5-8/8.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 68 — R5-14: Gauntlet, all five regions mixed

*Region: New Continent. Town/place: Victory Route. Maps: r5_victory_route.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 69 — R5-15: Elite Four + Champion

*Region: New Continent. Town/place: Iridescence Plateau, fifth ascent. Maps: r5_plateau, r5_elite_1, r5_elite_2, r5_elite_3, r5_elite_4, r5_champion, r5_hall.*
*Champion: CHAMPION — Bannon.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 70 — R5-16: post-game bracket, all regions

*Region: New Continent. Town/place: Grand Tournament. Maps: r5_grand_tournament.*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.

## Sequence 71 — R5-17: true final, Iridescence Plateau final ascent

*Region: New Continent. Town/place: Mythar — true final. Maps: r5_mythar_final.*
*Champion: MYTHAR (canon name, roster #331).*

**Status: NOT STARTED.** Maps for this sequence do not exist yet (FULL_WORLD covers Region 1 only) unless noted; the beat's canon dialogue is written and waiting in the region file.

Definition of done when its turn comes: (a) Pokémon baseline for its kind — map + buildings/interiors as the beat requires, NPCs with the beat's dialogue wired, wild encounters live where the beat has them, battles playable through the real UI, services working, exit to the next sequence gated on the beat's flags; (b) Mochiichao layer — follower, garden hooks where the beat opens them, encounter behaviour, UI as designed; ANIMATION line (player/NPC/follower/battle-entry) with any missing frames named as gaps; smoke run attached. Leader NAME GAPs in the beat file are the owner's own flags and stay unfilled until he names them.


---

## Standing gaps register (whole programme)

1. **player_boy sheet does not exist** — the BOY path renders a
   drawn fallback figure. Blocks DONE for Sequences 1–2.
2. **Mom's sheet variant unassigned** — four variant atlases
   exist as data; picking one is a design call (the slot's own
   comment refuses to invent a canon Mom). Blocks the Seq 1
   animation line.
3. **Hex standing pose** — row-0 battle pose at world scale
   (partial-atlas convention); fix direction named in Seq 1.
4. **Generic townsfolk / truck movers have no sheets** —
   fallback figures in the playable path, named in Seq 1.
5. **Route 1 pool mislabel** — "Zephling" entry carries species
   016 (Squirmite). One-line data fix owed.
6. **Shop prices are placeholder** — the CR economy is an
   owner slot.
7. **victory_route's `badges>=8` exit condition is metadata the
   engine does not enforce** — engine change owed at Sequence 8.
8. **binary_fields' dojo_8 door opens Sequence 7's interior
   early** — gate it at Sequence 3.
9. **Dojo leader NAME GAPs** are the owner's own flags in the
   beat files (R1 Beats 5/6/7 leaders, most R2–R5 leaders) —
   never invented. Named exceptions already in canon:
   Master Lin (R1-B3), Master Falk (R1-B4), Merv (R2-08),
   Kairos (R3-07).
10. **R2–R5 maps do not exist yet** (~60 FULL_WORLD maps cover
    Region 1) — each later sequence builds its maps from its
    beat's mapKeys when its turn comes.
11. **The served surface still points at the AI Studio
    prototype** (§0.1) — swapping what Play serves to the repo
    build is a parent-lane follow-up; until then the owner
    pressing Play still gets the prototype, not this build.
12. **F5 outside the overworld reloads the page** (§0.3 #6) —
    a player-facing hazard, named, not changed by this build.

## Progress, in the owner's measure

- Sequences fully DONE (both layers + animation + smoke): **0**.
- Sequences playable end-to-end with named gaps: **2 of 71**
  (Sequences 1–2 — gaps: boy sheet, Mom variant, Hex pose,
  townsfolk sheets).
- Next focus: Sequence 3 (Dojo 1 + Mochi Garden), after the
  Sequence 1–2 art gaps are closed or explicitly waived by the
  owner.
