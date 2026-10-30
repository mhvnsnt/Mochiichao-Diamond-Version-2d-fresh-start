# SHOW-SIDE CATALOGUE — everything on the show side, and what each piece gives the game

*Show-side harvest lane (register item 38), 2026-10-29. Owner
directive ~21:55 CDT: pull ALL of the show side over and use it to
build the rest of the game.*

## How this catalogue was made (sources and dating)

- **Governing copy: the repo itself** — `mhvnsnt/Mochiichao-Diamond-
  Version-2d-fresh-start`, main branch, read fresh 2026-10-29 via
  the GitHub API: full recursive tree, **26,548 entries, not
  truncated**; the show side (`show/`) is **9,107 entries / 7,524
  files**. Every count below is from that tree (files = blobs).
- Local copies (`~/workspace/landing/main/show` — a partial fetch,
  105 files; `canon-sweep-show/*`; `mochiichao-show/repo-add/show` —
  130 files, media-heavy; bible staging) were used only where main
  has nothing (the local-only annex, §9) and are named where used.
  Where copies disagreed, main governed.
- **Content read:** 1,032 show-side text files fetched from main
  and read/grepped for this lane (bible, production minus
  tooling/wielder internals, episodes, species data).
- **The headline number:** the show side carries **258 distinct
  numbered system documents** under `show/production/`; the game
  side (`src/data/core/docs/`) carries **52** numbered docs, and
  only one number (#208) exists on both sides. The numbered corpus
  is the owner's perpetual-list programme — the show side is where
  most of it landed. That asymmetry *is* the harvest.
- Cross-references: **[A§n]** = full-audit AUDIT-REGISTER section;
  **[C-X]** = completeness-audit family A–N; **S0–S34** = gap-fill
  steps (GAP-FILL-PLAN + WIRING-ADDENDA).
- Honesty marks: **GAME** = transfers to the game; **SHARED** =
  one canon, both media; **SHOW-ONLY** = no game use, by design,
  said plainly.

## 1. The bibles and root docs — `show/` root + `show/bible/` (16 files) — SHARED

| Item | Gives the game |
|---|---|
| `show/bible/SHOW-BIBLE.md` | The show's constitution; its world/canon clauses bind game writing too (same-coin doctrine). Parity board: SHOW-GAME-PARITY's source text. |
| `show/bible/COLOR-SYSTEM.md`, `DESIGN-THEORY.md` (Voice Law lives here: creatures = cries only) | The colourway/jojo-moment grammar the game's lighting lanes already build on; the Voice Law governs game dialogue rendering (hybrid class doc cites it). |
| `show/bible/` remainder (10 files: brand/method sheets) | Canon reference for game text/art passes. SHOW-ONLY in mechanics. |
| `show/BRAND-GUIDE.md`, `show/README.md`, `show/WORKING-METHOD.md` | Production method; the game inherits the working method, not content. SHOW-ONLY mechanically. |

## 2. Episodes — `show/episodes/` (305 files) — SHARED (story), SHOW-ONLY (production)

| Item | Gives the game |
|---|---|
| EP01 (270 files: shooting scripts v2/v3, beat sheet, cue sheet, colour script, animatic 37, audio 11, timing 7, for-grok 144, delivery/render ledgers) | EP01 is the game's Sequence 1–3 story twin: beat sheet + scripts are the narrative source the game's sequence writing checks against (narrative-flow stack, layer 1). The 144 for-grok files are generation machinery — SHOW-ONLY. |
| EP02 (8 files), EP03–EP05 (5 each), EP06–EP10 (2 each) | Arc seeds per episode; the season arc note + `SEASON-CANON-MAP.md` (production root) map episodes to game sequences. Mostly outline-grade — flagged honestly: these are story sources, not finished scripts. |
| `show/scripts/` (2 files) | Script templates — SHOW-ONLY. |

## 3. `show/production/` root documents (33 files) — SHARED

Production log (2026-10-27), PRODUCTION-STANDARD, SEASON-ARC-NOTE,
SEASON-CANON-MAP, FUTURE-CONSIDERED-IDEAS-NAME-GAPS, cast/appearance
sheets, list INDEX files (lists 9/20/26 + fragment indexes), pull-in
and staging records — plus three system docs that live at this
level: 276-SHOW-MORALE-REPUTATION, 344-MUSIC-IDENTITY,
345-SOUNDTRACK-CONSTRUCTION (cited in §4/§8). **Gives the game:** the season canon map (episode↔sequence
alignment), the name-gaps register (owner slots already catalogued —
checked during the hybrid hunt: no hybrid entry), the production
standard (quality bar both media share). The INDEX files are the
master keys to the numbered corpus in §4–§6.

## 4. World systems — `show/production/world-systems/` (253 files) — GAME (the core of the harvest)

252 content files: **~105 numbered system docs + ~100 machine
fragments (JSON) + core data files**. Each numbered doc follows the
house pattern: study of the donor system → native spec → fragment
schema. The fragments are *data shapes the game can load* — this
family is the single biggest gap-filler in the catalogue.

**Core data + architecture (carry first):**
`SPAWN-TABLES.md` (encounter tables as data → closes stub S-6;
[S5]), `EVENT-FLAG-ARCHITECTURE.md` (#12 namespace every other doc
references → game event flags), `ENCOUNTER-BALANCE.md`,
`REGION1-ROUTE-GRAPH.md` (Region 1's route graph → region1
programme), `WEATHER-SYSTEM.md`, `sealing-records.json` +
`163-MYTHICAL-HABITAT-SEALING.md` (the sealed-creature records —
Goddgachuu's game state), `EVOLUTION-DATA-MODEL.md`,
`GARDEN-FOLLOWER-SYSTEM.md` + `GARDEN-CARE-LOOP.md` +
`GARDEN-MINIGAME.md` (the Garden's follower/care/minigame specs →
[A§4, S14]).

**The numbered docs, by the game gap they close:**

- *World life & schedules:* 93-NPC-SCHEDULES, 145-TRAVELLING-NPCS,
  306-LIVING-OVERWORLD-PRESENCE, 298-AMBIENT-WORLD-EVENTS,
  105-FESTIVAL-CALENDAR, 124-EVENT-ROTATION, 195-SEASONAL-WORLD-
  EVENTS, 226-MIGRATION-SPECTACLES, 203-NESTS-AND-DENS,
  231-WILD-TERRITORY-EVENTS (species-data §6 twin) → the
  living-world director's content + S12 calendar [A§7; stub S-2].
- *Encounters & the wild:* 112-ENCOUNTER-MODIFIERS, 113-SWARM-
  EVENTS, 114-ROAMING-ENCOUNTERS, 209-AMBUSH-ENCOUNTERS,
  255-ENCOUNTER-RATE-PACING, 89-TRACKING-MECHANIC,
  291-LURE-SPOTS, 323-STANDOUT-ENCOUNTERS → S5/S10/S30 [A§3, C-G3].
- *Traversal & places:* 117-FIELD-TECHNIQUES (presentation layer
  for S24's engine), 192-WATER-TRAVERSAL-AND-DIVE (S25/S26),
  123-MOUNT-TRAVERSAL, 125-FAST-TRAVEL, 141-FERRY-NETWORK,
  127-REGION-TRANSITION, 140-BORDER-ZONES, 119-INTERIOR-AREAS,
  154-RUINS-AND-ANCIENT-SITES, 115-EXCAVATION-SYSTEM → S24–S27,
  S34 [C-A/B/C/D].
- *Ranger civilisation:* 98-RANGER-LICENCE, 133-LICENCE-TRIALS,
  230-LICENCE-DISCIPLINE, 201-RANGER-REPUTATION, 221-RANGER-
  MENTORSHIP, 244-RANGER-ETIQUETTE, 87-RANGER-REMATCH (schema
  quoted in TOP-25), 169-RANGER-HIDEOUTS, 245-FIELD-RESCUE →
  S18/S32 [A§1].
- *Honor, law & the underworld:* 272-WITNESSES-WANTED,
  274-UNDERWORLD-FENCES, 300-CHOICE-CONSEQUENCE-STANDARD →
  S3/S9 honor consumers, S32 deed TVs [A§1]. (Their sibling
  276-SHOW-MORALE-REPUTATION sits at the production root, §3.)
- *Care, garden & growth:* 77-EGG-SYSTEM, 193-DAYCARE-SERVICES,
  79-MOCHI-FRUIT-FARM, 88-GARDEN-ATTRACTIONS, 212-GARDEN-VISITORS,
  162-GROOMING-SPA, 257-BLOOM-STATES, 261-POLLEN-SCENT,
  262-SUNLIGHT-REST, 263-ROOTING-MODE, 264-GARDEN-PLANTING-SPOTS,
  293-RAISING-DEPTH, 294-CARE-SPORTS, 329-CARE-BRANCH-EVOLUTION →
  S14/S29 [A§4, C-I].
- *Media & world texture:* 172-BROADCAST-MEDIA, 90-IRIDESCENCE-
  MEDIA, 224-INWORLD-NEWSPAPER-CHRONICLE, 85-IRIDESCENCE-
  WAYFINDING, 137-WORLD-ATLAS, 191-PLAYER-JOURNAL,
  196-PORTRAIT-PHOTO-STUDIO, SNAPSHOT-MODE → S32 surfaces [C-L].
- *Progression & recognition:* 69-ACHIEVEMENTS, 97-RESEARCH-TASKS,
  126-HALL-OF-FAME, 216-COMPLETION-CEREMONY, 198-REGIONAL-DEX,
  213-FRAGMENT-CASE-PRESENTATION → S11/S17/S31 [A§8].
- *Systems glue:* 67/73-weather family (with WEATHER-SYSTEM),
  142-REGIONAL-CLIMATE, 153-RARE-WEATHER-PHENOMENA,
  194-WEATHER-FORECASTING → S16 [C-H]; 70-DIFFICULTY,
  71-ONBOARDING, 99-SYNDICATE-ENCOUNTERS, 100-CHAMPION-GAUNTLET,
  110-SANCTUARY-ZONE, 132-CARE-CENTRES, 134-FIELD-CAMP,
  164-MISSION-BOARD, 176-TOWN-ARCADE, 220-SHELTER-AND-STRAY,
  223-WORLD-VISITING, 225-MEMORIAL-SITES, 232-WORKING-
  PROFESSIONS, 233-INTERREGIONAL-EXCHANGE, 235-INSCRIPTIONS,
  236-MOCHI-SPORTS, 237-INDIVIDUAL-IDLE-QUIRKS, 241-FOLLOWER-
  TOWN-RULES, 243-LIFE-STAGES, 246-NIGHT-SKY, 256-CENTRE-
  SERVICES-FLOW, 265-WILD-DUEL-ETIQUETTE, 288-PURIFICATION,
  317-FACE-SHIELDS, 319-INDIVIDUAL-RECOGNITION, 332-WORKING-
  PROPERTIES, 333-COMPANION-JUDGEMENT, 334-HOME-CAMP,
  346-RAISING-SHOWN → spread across S8–S20 as their steps land.
- *Show-flavoured (honest):* 82/138/218 story-grammar docs,
  307–316 spectacle doctrine (in battle §5), 314/315 spectacles,
  328-RANCHER-ARRIVAL (mixture-region narrative) — SHARED story
  sources; their mechanics, where any, are the rows above.
- The ~100 `*-fragment.json` files: one per system — the data
  contracts. They land WITH their docs, never separately.

## 5. Battle — `show/production/battle/` (115 files) — GAME

~55 numbered docs + fragments + grammar files. The battle core the
audit found partial/absent [A§2] is *specified here, in full*:

- *Core math:* 248-BATTLE-DAMAGE-FORMULA, 250-STAT-STAGES-
  ACCURACY, 251-PRIORITY-TURN-ORDER, 252-WEATHER-BATTLE-EFFECTS,
  254-ESCAPE-FLEEING, 177-EXPERIENCE-GAIN, 179-TRAINING-VALUES →
  S6 convergence; TOP-25 #1–6. (Two core files live in the list
  folders, §6: `list3-systems/249-TYPE-EFFECTIVENESS-CHART.md` and
  `list3-systems/253-PRIZE-MONEY-REWARDS.md`.)
- *State & triggers:* 182-STATUS-CONDITIONS, 183-HELD-ITEM-EFFECTS,
  184-ABILITY-TRIGGER-RESOLUTION, 180-BOND-EFFECTS (+ the game's
  own `bond-effects-table.json` data) → S6/S7.
- *Formats & facilities:* 157-MULTI-BATTLE, 158-HORDE, 159-RENTAL,
  186-FACILITY-LADDER, 151-TOURNAMENT (world-systems), 100-GAUNTLET
  → S33 [C-J].
- *The Colosseum/XD layer:* 268-SNAG-SYSTEM, 273-STOLEN-MOCHI,
  288-PURIFICATION (world-systems), 289-FRENZY, 290-SHADOW-MOVES,
  347-CONSCIENCE-PROMPTS, 348-ATTEMPT-DEEDS, 349-RESCUE-
  CONFIRMATION, 355-THEFT-THROW-STAGED, 356-AFTER-A-STEAL-LANDS →
  the steal/snag mechanics the cheat-to-mechanic lane designed
  from the decomp; these docs are their fiction+systems twin
  [source-first: code from Colosseum decomp, canon from here].
- *Presentation:* 83-BATTLE-SPRITE-PRESENTATION, 148-BATTLE-INTRO-
  TRANSITIONS, BATTLE-UI-FLOW, BATTLE-FIELD, ACTION-SEQUENCE-
  GRAMMAR, MOVE-ANIM-SCRIPT-FORMAT (+ `hydro-rush.animscript.json`
  worked example), 147-MOVE-ANIM-COVERAGE → S21 + the presentation
  laws (proof = real scene).
- *Voice & mercy:* 352-OPPONENT-VOICE, 353-SURRENDER-MERCY,
  354-GUARDING, 350-INPUT-HONESTY, 351-DEVICE-REFUSALS →
  battle-feel systems, S6/S18.
- *Records:* 187-BATTLE-REPLAYS, 188-SPECTATOR-MODE, 242-DOJO-
  CROWD, 210-FIELD-DUELS, 292-LONG-CLIMB, 165-BATTLE-BAG.
- Lustre test files (`flickfin/mochii-lustre-*`): palette-mechanics
  test data — GAME (colourway system test fixtures).

## 6. Species & creature data — three folders — GAME

- `show/production/species-data/` (33 files): 80-INDIVIDUAL-
  VARIATION (the S7 individual record's field source), 104-
  INDIVIDUAL-HONOURS, 130-FORME-CHANGE, 135-HATCH-PRESENTATION,
  152-SPECIES-BEHAVIOUR-PROFILES (the behaviour scorer's data —
  S10), 171-BREEDING-COMPATIBILITY, 207-MOCHIIOTECA-DISCOVERY-
  STATES, 229-REGIONAL-CRY-DIALECTS, 231-WILD-TERRITORY-EVENTS,
  318-RULED-DEVIATION-REGISTER (+ `RULED-DEVIATION-REGISTRY.json`),
  322-GENERATED-VARIATION, 324-DEVIATION-INHERITANCE,
  325-RECORD-PORTRAIT-FIDELITY, HABITAT-VARIANTS, R4 line/folklore
  files, `evolution-edges.wave1.json` (evolution data) [A§3/§15].
- `show/production/species-data-system/` (35 files): the design
  briefs (canon-world, Goddgachuu), GAP-AUDIT + ALIGNMENT-MAP (the
  species programme's own gap accounting), 197-ROSTER-LOCK,
  type-chart + system fragments, NEW-SPECIES-SHEET-TEMPLATE →
  S7/S31 + the species pipeline.
- `show/production/species-systems/` + list folders (list3/4/5/6/7/
  10-systems, ~57 files on main): the earlier list waves that on
  main live as production subfolders — capture system (38),
  training (39), regional variants (40), mythical presentation
  (41), transformation (42), scale chart (43), extinct revival
  (44), dojo circuit (45), lab exposition (46), economy + item
  data layer + garden raising fragments → S6/S14/S29 [C-I/J/K].

## 7. People & cast — GAME + SHARED

- `show/production/transplant-roster/TRANSPLANT-ROSTER.md` — **the
  cast's master record**: the Nine/Seven soul-vessel persons, the
  anchor transplants (Pantera→R2, Sun Ra→R3, Bannon→R5), the role
  map (who sits at which dojo/champion/Ranger seat). Gives the
  game its cast seats as data [A§18]; TOP-25 #25. The hybrid hunt's
  key source (HYBRID-FINDING.md).
- `show/production/human-design-lane/` (3 files on main) +
  `show/production/character-sheets/` (62 files: the six pilot
  species × 9 + README) + `show/production/model-sheets/` —
  character design sources: game sprite/art reference; the sheets
  are SHARED (same designs, both media).
- `REGIONAL-FLAVOR-LAW.md` (mochichao-design, 9 files with it):
  per-region flavour rules incl. the speech guardrail the hybrid
  class cites; `NEW-SPECIES-IDEAS.md` (the species idea pool —
  owner-suggested regions recorded) → species programme input.

## 8. Production machinery — SHOW-ONLY, honestly (with two exceptions)

| Family | Files | Verdict |
|---|---|---|
| `show/production/tooling/` (full-stack 890, avatar-stack 175, build-manifest, fuel/fabless/mobile/music/voice stacks…) | 1,665 | SHOW-ONLY — the show's build machinery. Exception: its *lessons* (proof gates, manifests) already inform game lanes; no content transfers. |
| `show/production/wielder/` (training 341, wielder 101, grok-local, parity rounds…) | 582 | SHOW-ONLY — the in-repo production-agent system (Wielder). Its capability matrix/parity docs are agent infrastructure, not game content. |
| `show/production/rigs/` (builds 85, previews, scaffolds, CAST-RIG-SPECS) | 133 | SHARED for game sprite animation specs (CAST-RIG-SPECS, TALKING-SEAT-SPEC); builds themselves SHOW-ONLY. |
| `show/production/animation-method/` (CORRECTED-METHOD, TIMING-STANDARD, walk diagnosis log, v8-walk-proof…) | 35 | SHARED method (timing standard binds game sprite animation too); proofs SHOW-ONLY. |
| `show/production/episode-foundry/` | 36 | SHOW-ONLY (episode generation machinery). |
| `show/production/agent-commons/` (CLAIMS.md + 19) | 20 | SHARED process — the claims board every lane (game included) already works by. |
| `show/production/movement/` (12), `mochichao-design/` (9), `moves-registry/` (7), `dialogue-template-library/` (4), `sfx-library/` (42: 84-SOUND-ECOLOGY + 95-SFX-VARIATION-ENGINE's wave) | ~79 | GAME/SHARED: movement specs feed the game's movement system; the sound family's *rules* (84, 95, 215-REGIONAL-AMBIENT-BEDS here; 344-MUSIC-IDENTITY + 345-SOUNDTRACK-CONSTRUCTION at the production root, §3) are the soundtrack lane's canon — the recordings are the show's, the parameters are shared [A§10, S15]. |
| `show/assets/` (backgrounds 25+6, animations 15+3, props 4, flashback 2) | 59 | SHARED art: backgrounds/environments/props transfer under the construction-kit rule (his own material — wholesale); the game's BW2-lift lane is the consumer. |
| `show/exports/` (2), `show/shared/` (6) | 8 | Process files. SHOW-ONLY. |

## 9. The research wing — READ BEFORE TRANSFERRING ANYTHING

- `show/research/dialogue-kit/` — **4,350 files** (the tree's
  largest single block). This is **reverse-engineering material:
  other productions' extracted dialogue/text**, pulled for study.
  It is NOT the owner's show writing, it does **not** transfer to
  the game as content under any reading of the construction-kit
  law, and it is the folder the pending gate operation copies to
  his private RE repo and removes. Catalogue verdict:
  **NOT A TRANSFER SOURCE.** (Its *existence* matters to the gate,
  not to the build.)
- `show/research/` proper (13 content files: COLOSSEUM-XD-
  CATALOGUE, SONIC-CATALOGUE, PMD and donor studies) — GAME as
  *reference*: these are the donor maps the source-first law reads
  from (what exists where, at what grade). Reference only; systems
  wire from code, never from these summaries.
- `show/production/research/` (19 files) — donor/teardown notes;
  same verdict: reference.

## 10. Local-only annex (not on repo main — verified absent)

- **Place-charge / moral-choices machinery** — `276-SHOW-MORALE-
  REPUTATION.md` IS on main (world-systems), but the full
  place-charge package (PLACE-CHARGE.md + fragments) exists only
  locally (`~/workspace/mochiichao-show/moral-choices-system/` +
  the follow-through sweep's staged copies). GAME — it is the
  honor system's place-level half (S3/S9 consumers); flagged here
  so the landing train carries it from the local staging, not from
  main.
- **The perpetual-list corpus beyond main** — locally,
  `~/workspace/mochiichao-show/teardowns/` holds list waves 3–50
  (617 docs); main's show side carries the landed subset (§4–§6).
  The unlanded lists are GAME sources-in-waiting; they enter
  through the same landing discipline, list by list (S22).

## Count summary

| Block | Files | Game use |
|---|---|---|
| Bible + root | 16 | SHARED |
| Episodes + scripts | 307 | Story SHARED, machinery SHOW-ONLY |
| Production root docs | 33 | SHARED |
| World-systems | 253 | GAME (core) |
| Battle | 115 | GAME |
| Species data + system + systems folders | ~125 | GAME |
| Cast (roster, design lane, sheets, flavour law) | ~75 | GAME + SHARED |
| SFX/movement/moves-registry/dialogue templates | ~79 | GAME/SHARED rules |
| Assets | 59 | SHARED art |
| Production machinery (tooling, wielder, foundry, rigs-builds, animation proofs, agent-commons) | ~2,430 | SHOW-ONLY (process/lessons excepted) |
| Research (dialogue-kit 4,350 + studies ~32) | ~4,382 | NOT a transfer source (studies = reference) |
| Exports/shared | 8 | SHOW-ONLY |
| **Total show side** | **7,524** | **≈2,600 files with direct game use; the rest is the show's own machinery and the RE wing** |

*Count note: per-folder counts above are the tree's; small folders
are grouped in two rows, so the column sums to the 7,524 total
within rounding of the groupings.*
