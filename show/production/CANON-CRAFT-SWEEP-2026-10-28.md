# CANON & CRAFT SWEEP — 2026-10-28

**What this is:** the full-repo audit the owner ordered — everything
usable across his repos, reconciled against what this repo already
has, with what was missing landed and wired. Rule of the sweep:
**audit before building** (real-code wiring law). Anything already
wired is reported as already there, with its path — never rebuilt,
never duplicated. Construction-kit only throughout: systems,
grammar, palettes, pipelines — never another production's
characters, names, or logos.

**Method + counts.** Target repo tree read in full: **25,933
paths**. Source seats read: this repo's bible/production/research
seats, the local pull-in map + transfer manifest + cartoon-repo
inventory, and `mhvnsnt/cape-jones` `docs/lighting/` (6 entries).
The written corpus = **532 system/canon docs** (`show/bible/` +
`show/production/`, excluding the `tooling/` and `wielder/`
software trees, + `docs/FREE-STACK-PRODUCTION-NOTES.md`).
Consumption was tested by named citation across **30 episode/build
files** (EP01's full build set incl. GENERATION-PACKAGE, ledgers,
JSONs, beat map + gag chart; EP02–EP05 beat/cue/storyboard files;
the Flow and Unified pipeline docs) plus 7 wiring docs for the
docs-only layer. Full table: the appendix.

**Landed by this sweep (all merged, all fetch-back verified):**
- **PR #42** (`8cbf58c0`) — `battle/ACTION-SEQUENCE-GRAMMAR.md` +
  pointer in 307.
- **PR #43** (`b4ba19b3`) — `EP01/timing/EP01-ED-PRODUCTION-PATH.md`.
- **PR #45** (`e6e62d99`) — LIGHTING-SYSTEM §11, Flow + Unified
  lighting gate wiring, METHOD-REGISTRY canon-systems entry.

---

## 1. Persona 5 — ALREADY THERE, already wired. Nothing landed.

The Persona material exists exactly the way the rule allows —
systems and grammar, zero Atlus files (the source docs say so
themselves: "HIGH knowledge / ZERO files (by design)"):

- `show/production/research/persona-5.md` — the production
  research (CEDEC 2017 UI talk as primary source).
- `show/production/research/persona-5-ui-principles.md` — the
  distilled, Mochiichao-native principles (one dominant colour
  first; gaze line; lighting = priority; menus as character
  performance; vector UI; per-screen checklist).
- Wired into the game: `src/lib/personaDialogue.ts`,
  `docs/ui-art/persona-dialogue-tier1.md`.
- Wired into the show: SHOW-BIBLE §2 names Persona 5 in the
  stack ("hyper-futuristic Japan graphic pop — one [dominant
  colour]"), §6's episode engine uses the Persona-pop eyecatch;
  IDENTITY-KIT is headed "Persona step: identity before
  episodes"; INTEGRATIONS-MAP S8 routes the keeper-device UI
  grammar from these principles;
  `show/production/world-systems/331-PERSONA-BONDS-CALENDAR.md`
  carries the bonds/calendar system natively.

## 2. JoJo — ALREADY THERE as grammar. Registered by this sweep.

- **Posing/composition grammar:** `show/production/POSING-SYSTEM.md`
  (47 KB) *is* the JoJo document — Part 1 the posing language,
  Part 2 the Stand+user staging grammar (§2.6 battle
  choreography), Part 3 the native application (pose vocabulary
  per creature type, creature + keeper paired composition,
  pose-holds × camera, rig pose-library additions, §3.5 the
  inspired-grammar-vs-traced-pose line). Consumed by EP04's
  beat sheet + storyboard plan and EP01's GENERATION-PACKAGE.
- **Colour/light grammar:** COLOR-SYSTEM §4 (Araki's no-fixed-
  canon doctrine), LIGHTING-SYSTEM §1.1 + §4 (special scene
  colouring staged as light), and `REPAINT-PROTOCOL.md` — the
  owner-ruled "JoJo licence" for per-scene non-canon repaints.
- **Study layer:** `show/production/research/jojo.md` (sources +
  study route; holdings gap stated in its INDEX: no JoJo
  production material held, none invented) and the
  adaptation-library D'Arby staging study.
- **The gap was registration, not content:** none of it was in
  METHOD-REGISTRY. PR #45 registers POSING-SYSTEM as a standing
  reference with its true status (research draft).

## 3. Colour canon, non-colour canon, variants — ALREADY THERE; the most complete seat. Two gaps flagged.

- **Colour canon:** `show/bible/COLOR-SYSTEM.md` (38.6 KB) —
  Part 1 source research (Pokémon shiny/regional colourways,
  Digimon attribute coding, Ed Edd n Eddy rule-breaking, JoJo),
  Part 2 Colour System v2: species colourway spec (Dominant +
  Accent + Ink), **the Lustre Law (§b)**, ensemble harmony,
  location colour scripts, the EP01 colour script, accent-red
  discipline, the **COLOUR GATE**, and the 2026-10-28 addendum
  on where the locked chart physically lives. Consumed by
  EP01-COLOUR-SCRIPT + GAP-FILL-REPORT + GENERATION-PACKAGE.
- **Non-colour canon:** `show/production/CANON-CONSISTENCY.md`
  (the consistency framework: ruled vs pending deviations,
  variant doctrine) — still **DRAFT for owner lock**; that lock
  is the owner's call and stays fenced. REPAINT-PROTOCOL
  governs deliberate non-canon colour events.
- **The variant system, counted:** species-data seats
  `80-INDIVIDUAL-VARIATION`, `318-RULED-DEVIATION-REGISTER` +
  `RULED-DEVIATION-REGISTRY.json`, `322-GENERATED-VARIATION`,
  `324-DEVIATION-INHERITANCE`, `HABITAT-VARIANTS`,
  list5 `40-REGIONAL-VARIANTS`, `130-FORME-CHANGE`; schemas
  `src/data/core/schemas/{habitat,regional}-variant.schema.json`;
  game code `src/lib/variants.ts`; Lustre art **1,494 paths**
  under `public/assets/variants/lustre/` with **49 species
  lustre fronts**; the 2026-10-28 shadow sweep closed (163
  cleaned, cleaned = current). Region-4 Kittember + maskless
  Verdilance are ruled entries in the register.
- **GAP 1 (flagged in LIGHTING §11.2):** garden-form palettes
  (bright/neutral/umbral) exist for 4 species only.
- **GAP 2 (documentation accuracy):** COLOR-SYSTEM's addendum
  homes the locked chart in a project `+palettes` folder —
  no such folder exists in this repo (it is a workstation
  seat). The in-repo physical chart is: garden-form palettes
  (4 species), the lustre palette JSONs in
  `show/production/battle/examples/`, and
  `src/lib/creaturePaletteSheets.ts`. Stated here rather than
  silently "fixed" in the bible doc, which may be describing
  the production machine truthfully.

## 4. Action sequences — WAS the gap. Wired by this sweep; consumption still owed.

Measured: of the battle seat's 63 docs, **62 were cited by no
episode build file** (the exception class: MOVE-ANIM-SCRIPT-
FORMAT reached docs-only). The grammar was complete and
unreachable. Landed:

- **PR #42:** `show/production/battle/ACTION-SEQUENCE-GRAMMAR.md`
  — the build order (spectacle budget → family dialect →
  signatures → posing → smear/timing → intros → animscripts →
  sequence sheet), + a pointer from 307's wiring section.
- **PR #45:** the grammar is registered in METHOD-REGISTRY.

**Honest status: WIRED, not CONSUMED.** EP01 performs zero
named battle moves (owner's script), so no episode could have
consumed this yet. First consumption = the first episode build
that files a sequence sheet under §8 of the grammar.

## 5. Pokémon base + the show Bible — ALREADY THERE, heavily built on.

- `show/bible/SHOW-BIBLE.md` — the stack (§2: Pokémon base,
  Persona 5, JoJo, Fallout/Skyrim/GTA/RDR/Buu's Fury kinship),
  locked laws (§5), the episode engine (§6), open items (§9,
  fenced). Consumed by EP01's shooting script + GENERATION-
  PACKAGE.
- The Pokémon-base systems library is the numbered production
  corpus itself (battle mechanics 248/250/251/252/182/183/184,
  species data, moves registry with its name map) +
  `docs/all-sources-wiring/` mappings (battle-core, data-
  systems, overworld, menus) + INTEGRATIONS-MAP's game items.
- **Honest note on the table:** most numbered systems are
  teardown-derived specs aimed at the game/data build. This
  sweep's citation test covered episode + show build files —
  the owner's stated standard for this corpus — so they read
  GAP in the table even where a game-side consumer may exist.
  That distinction is recorded, not smoothed over.

## 6. Lighting — spine ALREADY THERE; the last two pieces landed by this sweep.

Already there: `show/bible/LIGHTING-SYSTEM.md` (36.9 KB) — §0
carries the owner's seven laws from cape-jones `COLOR-GRADES.md`,
`DYNAMIC-RIM-BLASTER-LIGHTING.md`, `LED-CONTROLLER.md` +
`LIGHTING-RIG.md`; §3 named keys per location × time; §4
colour-shift protocol; §5 takeover sources; §6 Lustre under
light; §7 the EP01 lighting plot; §8 the lighting sheet + gate;
§9 wiring map; §10 open items (all owner-fenced: FOREST-NIGHT
sign-off, Keeper-device design, Mochiko human-lighting
addendum, grade hex anchors). Consumed by GENERATION-PACKAGE,
EP02's beat sheet, EP05's storyboard plan.

Landed (PR #45):
- **§11.1 Real-world source looks** — the one cape-jones
  lighting file §0 never carried: `docs/lighting/REAL-LIGHTING-RESEARCH.md`
  (14,823 B). Translated into five named Mochiichao setups —
  Delaminated Streetlamp, Blacklight Room, Coloured Bulb Wash,
  Disco Spill, Driven Room Light — each with physical source,
  behaviour under LS-2, and when-used. (Translation note: the
  cape-jones bulb wash tints everything; the garden version
  protects fills per LS-2.) The cape-jones `previews/` +
  `references/` folders are renders/images of that show's
  character: **pointers only, never copied**.
- **§11.2 Character-sheet lighting layer** — LS-1's "model
  sheets of the cast" wired to the physical sheets:
  `src/assets/sprites-2d/<species>/angles-lighting.webp`,
  counted **52 of 53** sprite folders (only
  `manticlaw-special-variant` lacks one); rim-direction
  reference at composite, §8.2-enforced. Form-palette gap
  (4 species) flagged in the doc.
- **Gate wiring** — the lighting system was cited by episodes
  but consumed by *neither* pipeline's gate. Now: the Flow
  Composite Pipeline names the key + §8.1 sheet per segment
  and runs §8.2 at its clip gate; the Unified Pipeline takes
  the sheet as a composite-stage manifest input and runs
  §8.2 at its per-scene gate.

## 7. THE WRITTEN CORPUS — written vs wired (owner's priority category)

**The finding, in one line:** of 532 written system docs,
**71 are consumed by an episode build, 6 are docs-only, and
455 are named by no episode build file at all** — the failure
mode the owner named, measured. The bright spot is real:
EP01's GENERATION-PACKAGE works as a consumption engine (it
alone carries most consumed citations — every bible doc and
the whole animation-method seat), and EP02–EP05's sheets cite
systems individually (LIGHTING-SYSTEM in EP02 + EP05,
REPAINT-PROTOCOL in EP03, POSING-SYSTEM in EP04, WRITING-
STANDARD in EP02, IDENTITY-KIT in EP05). The bulk of the
corpus — world-systems (161), the numbered teardown systems,
the battle library — was written, landed, cross-cited, and
never consumed.

**The ED machinery, wired into EP01's build (PR #43):** the
ending stack existed in pieces — the registry's ED-CREDITS
STANDARD, the YYH ending study §5, TIMING-STANDARD §7, the
beat map (144 BPM, bell at gag frame 96), the above-floor gag
chart (12.07 drawings/sec), gap 13's unanswered assembly
questions. `show/episodes/EP01/timing/EP01-ED-PRODUCTION-PATH.md`
now assembles them: the slot from the episode JSON (ED 75 s
in the 24:00 build), the assembled picture (credit card +
inset + bottom idles), the no-duplication GATE, eight ordered
build steps ending in chart conformance + the assembly gate
(owner views the assembled ED), and §5's OWNER-OWED list —
inset vs full-frame, credits clearing in the window, the
Gate-8 verdict, the profile call, a credit-layout standard,
any ED content beyond slot/beat map/gag chart. Machinery
wired; content untouched.

**The standing countermeasure (PR #45):** the consumption
rule is registered in METHOD-REGISTRY — a written system
counts as done only when an episode build consumes it, and
episode build packages name their governing systems (the
GENERATION-PACKAGE pattern). The next episode package that
ships without a system manifest repeats the failure in the
open, where the registry can catch it.

**What remains open, plainly:** 455 docs still have no
episode consumer. This sweep wired the paths for the named
priorities (action, ED, lighting, posing/colour registration);
it did not manufacture consumption for the rest. The bulk
seats (world-systems, species-data-system, list-systems) are
game/data-facing specs whose show-side consumption model is
itself an open design question for the owner — flagged, not
filled.

---
## Appendix — the full coverage table (532 docs)

Status key: **CONSUMED** = named in an episode build file · **DOCS-ONLY** = named only in other system docs · **GAP** = named in neither. Consumer column shows up to 3 consuming files from the check.

### show/bible — 11 docs (10 consumed / 0 docs-only / 1 gap)

- `show/bible/COLOR-SYSTEM.md` — **CONSUMED** — EP01-COLOUR-SCRIPT.md, GAP-FILL-REPORT.md, GENERATION-PACKAGE.md
- `show/bible/DESIGN-PRINCIPLES.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/bible/DESIGN-THEORY.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/bible/EP-COLOUR-SCRIPT-FORMAT.md` — **CONSUMED** — EP01-COLOUR-SCRIPT.md, GENERATION-PACKAGE.md
- `show/bible/IDENTITY-KIT.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP05_STORYBOARD-PLAN.md
- `show/bible/LIGHTING-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP02_BEAT-SHEET.md, EP05_STORYBOARD-PLAN.md — sweep: §11 added (real-world looks + character-sheet layer); gate wiring into both pipelines (PR #45)
- `show/bible/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/bible/REPAINT-PROTOCOL.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP03_BEAT-SHEET.md
- `show/bible/SHOW-BIBLE.md` — **CONSUMED** — EP01-SHOOTING-SCRIPT-v3.md, GENERATION-PACKAGE.md
- `show/bible/TOY-READ-TEST.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/bible/WRITING-STANDARD.md` — **CONSUMED** — BEAT-SHEET.md, GENERATION-PACKAGE.md, EP02_BEAT-SHEET.md

### docs — 1 docs (1 consumed / 0 docs-only / 0 gap)

- `docs/FREE-STACK-PRODUCTION-NOTES.md` — **CONSUMED** — UNIFIED-PIPELINE.md

### show/production (top level) — 111 docs (27 consumed / 2 docs-only / 82 gap)

- `show/production/120-CUTSCENE-STAGING.md` — **GAP** — —
- `show/production/128-BATTLE-PLATES.md` — **GAP** — —
- `show/production/136-CRY-COMPREHENSION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/149-MOCHIIOTECA-ON-SCREEN.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/155-BATTLE-VOCAL-LAYERING.md` — **GAP** — —
- `show/production/156-TRAILER-AND-PROMO-SYSTEM.md` — **GAP** — —
- `show/production/200-LUSTRE-PRESENTATION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/211-RELEASE-FAREWELL.md` — **GAP** — —
- `show/production/218-SHOW-TRADE-STORY-GRAMMAR.md` — **GAP** — —
- `show/production/227-PROVENANCE-STORYTELLING.md` — **GAP** — —
- `show/production/234-PERFORMANCE-TROUPES.md` — **GAP** — —
- `show/production/247-BASE-COMPLETENESS-AUDIT.md` — **GAP** — —
- `show/production/266-FLOWER-SYMBOLISM.md` — **GAP** — —
- `show/production/276-SHOW-MORALE-REPUTATION.md` — **GAP** — —
- `show/production/277-GENERATIONAL-ROTATION.md` — **GAP** — —
- `show/production/278-ANTI-HERO-ROUTE.md` — **GAP** — —
- `show/production/279-DUAL-SELF-PORTRAYAL.md` — **GAP** — —
- `show/production/280-FALSE-FRIENDSHIP.md` — **GAP** — —
- `show/production/281-DOUBLE-LIFE.md` — **GAP** — —
- `show/production/282-SECTOR-ENSEMBLE-ROTATION.md` — **GAP** — —
- `show/production/283-RETURNING-CAST.md` — **GAP** — —
- `show/production/284-THIEFS-PARTNERS.md` — **GAP** — —
- `show/production/285-PART-TONE-SHIFTS.md` — **GAP** — —
- `show/production/286-PART-TRANSITIONS.md` — **GAP** — —
- `show/production/296-SONIC-GRAMMAR.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/320-FACE-EXPRESSION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/321-COVERED-FACE-STORY.md` — **GAP** — —
- `show/production/326-RECORD-TO-CAST.md` — **GAP** — —
- `show/production/327-PULL-IN-REGISTER.md` — **GAP** — —
- `show/production/336-MOD-COMMUNITY-STANDARD.md` — **GAP** — —
- `show/production/344-MUSIC-IDENTITY.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/345-SOUNDTRACK-CONSTRUCTION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/72-INSTRUMENT-BANK.md` — **GAP** — —
- `show/production/73-WEATHER-FX.md` — **GAP** — —
- `show/production/75-DELIVERY-SPEC.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/76-WEB-EXPORT.md` — **GAP** — —
- `show/production/82-SHOW-ARC-PLANNING.md` — **GAP** — —
- `show/production/95-SFX-VARIATION-ENGINE.md` — **GAP** — —
- `show/production/ADAPTIVE-MUSIC.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/ANIMATION-TOOLS.md` — **GAP** — —
- `show/production/BOARD-PIPELINE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/BOSS-INTRO-FORMAT.md` — **GAP** — —
- `show/production/CANON-CONSISTENCY.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/CANON-SIGNATURE-ATTACKS.md` — **DOCS-ONLY** — docs: show_production_CANON-CONSISTENCY.md
- `show/production/CHIBI-CARD-SYSTEM.md` — **CONSUMED** — EP01-V3-staging.json, GENERATION-PACKAGE.md
- `show/production/DIALOGUE-WIRING-R1-MANIFEST.md` — **GAP** — —
- `show/production/DONOR-PULLINS.md` — **GAP** — —
- `show/production/ENVIRONMENT-AND-CAMERA.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP03_STORYBOARD-PLAN.md
- `show/production/EPISODE-PLANNING-METHOD.md` — **CONSUMED** — GENERATION-PACKAGE.md, STORYBOARD-PLAN.md, animatic_README.md
- `show/production/FIRST-START.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/FLOW-COMPOSITE-PIPELINE.md` — **DOCS-ONLY** — docs: show_production_tooling_avatar-stack_platforms_PRODUCTION-PATTERN.md, METHOD-REGISTRY.md — sweep: lighting key + §8.2 checks added to the per-clip gate (PR #45)
- `show/production/FULLSTACK-WIRING.md` — **GAP** — —
- `show/production/FUTURE-CONSIDERED-IDEAS-NAME-GAPS.md` — **GAP** — —
- `show/production/GAMEDATA-ISLAND-RENAME.md` — **GAP** — —
- `show/production/INTEGRATIONS-MAP.md` — **GAP** — —
- `show/production/KIT-AUDIT.md` — **GAP** — —
- `show/production/LIVING-WORLD.md` — **CONSUMED** — GENERATION-PACKAGE.md, timing_XSHEET-EP01-SCENE-04.md, EP03_BEAT-SHEET.md
- `show/production/LUSTRE-SHADOW-SWEEP-20261028.md` — **GAP** — —
- `show/production/MOCHIIOTECA-ENTRY-STYLE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/NAME-LOCALIZATION.md` — **GAP** — —
- `show/production/NEW-SPECIES-IDEAS.md` — **GAP** — —
- `show/production/PACKAGING-SPEC.md` — **GAP** — —
- `show/production/POSING-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP04_BEAT-SHEET.md, EP04_STORYBOARD-PLAN.md
- `show/production/PRODUCTION-LOG-2026-10-27.md` — **CONSUMED** — EP01-V3-staging.json
- `show/production/PROSODY-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/REGIONAL-FLAVOR-LAW.md` — **GAP** — —
- `show/production/RESEARCH-DIRECTIVE.md` — **GAP** — —
- `show/production/SEASON-ARC-NOTE-EP01-EP10.md` — **GAP** — —
- `show/production/SEASON-CANON-MAP.md` — **CONSUMED** — EP01-SHOOTING-SCRIPT-v3.md
- `show/production/SEASON-MAP-EP06-EP10.md` — **GAP** — —
- `show/production/SFX-LIBRARY.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/SMEAR-FRAME-GRAMMAR.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/STAGING-list22-2026-10-27.md` — **GAP** — —
- `show/production/STAGING-list24-2026-10-27.md` — **GAP** — —
- `show/production/STAGING-list29-2026-10-27.md` — **GAP** — —
- `show/production/STAGING-list8-2026-10-27.md` — **GAP** — —
- `show/production/TIMING-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md, timing_XSHEET-EP01-SCENE-04.md
- `show/production/UNIFIED-PIPELINE.md` — **CONSUMED** — GENERATION-PACKAGE.md, animatic_README.md — sweep: lighting sheet as composite input; §8.2 check joined the per-scene gate (PR #45)
- `show/production/VOICE-DESIGN.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/WORKING-RULES.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list11-systems-INDEX.md` — **GAP** — —
- `show/production/list12-systems-INDEX.md` — **GAP** — —
- `show/production/list13-systems-INDEX.md` — **GAP** — —
- `show/production/list14-systems-INDEX.md` — **GAP** — —
- `show/production/list15-systems-INDEX.md` — **GAP** — —
- `show/production/list16-systems-INDEX.md` — **GAP** — —
- `show/production/list17-systems-INDEX.md` — **GAP** — —
- `show/production/list18-systems-INDEX.md` — **GAP** — —
- `show/production/list19-systems-INDEX.md` — **GAP** — —
- `show/production/list20-systems-INDEX.md` — **GAP** — —
- `show/production/list21-systems-INDEX.md` — **GAP** — —
- `show/production/list22-systems-INDEX.md` — **GAP** — —
- `show/production/list23-systems-INDEX.md` — **GAP** — —
- `show/production/list24-systems-INDEX.md` — **GAP** — —
- `show/production/list25-systems-INDEX.md` — **GAP** — —
- `show/production/list26-systems-INDEX.md` — **GAP** — —
- `show/production/list27-systems-INDEX.md` — **GAP** — —
- `show/production/list28-RESEARCH-SOURCES.md` — **GAP** — —
- `show/production/list28-systems-INDEX.md` — **GAP** — —
- `show/production/list29-systems-INDEX.md` — **GAP** — —
- `show/production/list30-systems-INDEX.md` — **GAP** — —
- `show/production/list31-systems-INDEX.md` — **GAP** — —
- `show/production/list32-systems-INDEX.md` — **GAP** — —
- `show/production/list33-systems-INDEX.md` — **GAP** — —
- `show/production/list34-systems-INDEX.md` — **GAP** — —
- `show/production/list35-systems-INDEX.md` — **GAP** — —
- `show/production/list36-systems-INDEX.md` — **GAP** — —
- `show/production/list7-systems-README.md` — **GAP** — —
- `show/production/list8-systems-INDEX.md` — **GAP** — —
- `show/production/list9-systems-INDEX.md` — **GAP** — —
- `show/production/show-trailers-RETROSPECTIVE-RECORD.md` — **GAP** — —

### show/production/adaptation-library — 23 docs (1 consumed / 1 docs-only / 21 gap)

- `show/production/adaptation-library/DO-NOT-ADAPT.md` — **GAP** — —
- `show/production/adaptation-library/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/adaptation-library/SOURCE-CATALOGUE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/adaptation-library/pilots/PILOT-ADAPTATIONS.md` — **GAP** — —
- `show/production/adaptation-library/sources/anime-mystery/SOURCE.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/adaptation-library/sources/anime-mystery/digimon-adventure-ep16-skullgreymon.md` — **GAP** — —
- `show/production/adaptation-library/sources/anime-mystery/jojo-stardust-crusaders-ep34-35-darby-gambler.md` — **GAP** — —
- `show/production/adaptation-library/sources/anime-mystery/scooby-doo-mi-s01e01-beware-the-beast-from-below.md` — **GAP** — —
- `show/production/adaptation-library/sources/gag-engines/SOURCE.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/adaptation-library/sources/gag-engines/regular-show-high-score-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/gag-engines/regular-show-just-set-up-the-chairs-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/gag-engines/spongebob-fry-cook-games-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/gag-engines/spongebob-pizza-delivery-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/mystery-serialized/SOURCE.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/adaptation-library/sources/mystery-serialized/atla-bitter-work-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/mystery-serialized/atla-zuko-alone-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/mystery-serialized/gf-headhunters-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/mystery-serialized/gf-into-the-bunker-notes.md` — **GAP** — —
- `show/production/adaptation-library/sources/pokemon-anime/SOURCE.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/adaptation-library/sources/pokemon-anime/ep001-i-choose-you-structure.md` — **GAP** — —
- `show/production/adaptation-library/sources/pokemon-anime/ep039-pikachus-goodbye-structure.md` — **GAP** — —
- `show/production/adaptation-library/sources/pokemon-anime/ep058-riddle-me-this-structure.md` — **GAP** — —
- `show/production/adaptation-library/templates/TEMPLATES.md` — **DOCS-ONLY** — docs: show_bible_COLOR-SYSTEM.md

### show/production/animation-method — 14 docs (11 consumed / 0 docs-only / 3 gap)

- `show/production/animation-method/ABOVE-THE-FLOOR-RESEARCH.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/CORRECTED-METHOD.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/GENERATED-TURNAROUND-PIPELINE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/METHOD-REGISTRY.md` — **CONSUMED** — GENERATION-PACKAGE.md, FLOW-COMPOSITE-PIPELINE.md — sweep: canon-systems reference entry + consumption rule registered (PR #45)
- `show/production/animation-method/PULL-IN-LIST.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/TIMING-STANDARD.md` — **CONSUMED** — GENERATION-PACKAGE.md, EP01-ED-BEAT-MAP.md — sweep: additionally consumed by EP01-ED-PRODUCTION-PATH (PR #43)
- `show/production/animation-method/WALK-DIAGNOSIS-LOG.md` — **CONSUMED** — GENERATION-PACKAGE.md — sweep: additionally consumed by EP01-ED-PRODUCTION-PATH (PR #43)
- `show/production/animation-method/WHAT-WE-DO-WRONG-ADDENDUM-2.md` — **CONSUMED** — GENERATION-PACKAGE.md — sweep: gaps 13/14 answered by EP01-ED-PRODUCTION-PATH (PR #43)
- `show/production/animation-method/WHAT-WE-DO-WRONG-ADDENDUM.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/WHAT-WE-DO-WRONG.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/animation-method/YU-YU-HAKUSHO-ENDING-STUDY.md` — **CONSUMED** — GENERATION-PACKAGE.md — sweep: additionally consumed by EP01-ED-PRODUCTION-PATH (PR #43)
- `show/production/animation-method/v8-walk-proof/BUILD-NOTES.md` — **GAP** — — — sweep: proof-package record — part of the v8 walk-proof build artefact set
- `show/production/animation-method/v8-walk-proof/GATES.md` — **GAP** — — — sweep: proof-package record — part of the v8 walk-proof build artefact set
- `show/production/animation-method/v8-walk-proof/SHEET-NOTES.md` — **GAP** — — — sweep: proof-package record — part of the v8 walk-proof build artefact set

### show/production/battle — 63 docs (0 consumed / 1 docs-only / 62 gap)

- `show/production/battle/147-MOVE-ANIM-COVERAGE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/148-BATTLE-INTRO-TRANSITIONS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/157-MULTI-BATTLE-FORMATS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/158-HORDE-BATTLES.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/159-RENTAL-BATTLES.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/165-BATTLE-BAG.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/173-REMATCH-SYSTEM.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/175-WEATHER-FORMES.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/177-EXPERIENCE-GAIN.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/179-TRAINING-VALUES.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/180-BOND-EFFECTS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/182-STATUS-CONDITIONS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/183-HELD-ITEM-EFFECTS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/184-ABILITY-TRIGGER-RESOLUTION.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/185-PEAK-TRANSFORMATION.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/186-FACILITY-LADDER.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/187-BATTLE-REPLAYS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/188-SPECTATOR-MODE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/210-FIELD-DUELS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/228-EVOLUTION-SEQUENCE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/242-DOJO-CROWD.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/248-BATTLE-DAMAGE-FORMULA.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/250-STAT-STAGES-ACCURACY.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/251-PRIORITY-TURN-ORDER.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/252-WEATHER-BATTLE-EFFECTS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/254-ESCAPE-FLEEING.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/260-CONTACT-DEFENCE-ANATOMY.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/268-SNAG-SYSTEM.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/273-STOLEN-MOCHI.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/289-FRENZY.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/290-SHADOW-MOVES.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/292-LONG-CLIMB.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/307-SPECTACLE-DOCTRINE.md` — **GAP** — — — sweep: pointer line to the action grammar added (PR #42)
- `show/production/battle/308-LIGHTNING-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/309-WATER-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/310-STRENGTH-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/311-EARTH-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/312-AERIAL-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/313-GHOST-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/316-SIGNATURE-SPECTACLE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/347-CONSCIENCE-PROMPTS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/348-ATTEMPT-DEEDS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/349-RESCUE-CONFIRMATION.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/350-INPUT-HONESTY.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/351-DEVICE-REFUSALS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/352-OPPONENT-VOICE.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/353-SURRENDER-MERCY.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/354-GUARDING.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/355-THEFT-THROW-STAGED.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/356-AFTER-A-STEAL-LANDS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/83-BATTLE-SPRITE-PRESENTATION.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/BATTLE-FIELD.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/BATTLE-UI-FLOW.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/MOVE-ANIM-SCRIPT-FORMAT.md` — **DOCS-ONLY** — docs: show_production_CANON-CONSISTENCY.md — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list17-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list19-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list26-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list30-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list32-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/STAGING-list36-2026-10-27.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/examples/SHADOW-SWEEP-20261028.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet
- `show/production/battle/examples/TEST-RESULTS.md` — **GAP** — — — sweep: build path wired via ACTION-SEQUENCE-GRAMMAR (PR #42); consumption awaits a first sequence sheet

### show/production/canon-cutouts — 1 docs (0 consumed / 0 docs-only / 1 gap)

- `show/production/canon-cutouts/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc

### show/production/character-sheets — 1 docs (0 consumed / 0 docs-only / 1 gap)

- `show/production/character-sheets/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc

### show/production/dialogue-template-library — 4 docs (0 consumed / 0 docs-only / 4 gap)

- `show/production/dialogue-template-library/GAP-MAP.md` — **GAP** — —
- `show/production/dialogue-template-library/PILOT-BATCH.md` — **GAP** — —
- `show/production/dialogue-template-library/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/dialogue-template-library/TAXONOMY.md` — **GAP** — —

### show/production/fonts — 1 docs (1 consumed / 0 docs-only / 0 gap)

- `show/production/fonts/FONTS.md` — **CONSUMED** — EP01-V3-DELIVERY-LEDGER.md, GENERATION-PACKAGE.md

### show/production/human-design-lane — 3 docs (1 consumed / 0 docs-only / 2 gap)

- `show/production/human-design-lane/CAST-QUEUE.md` — **GAP** — —
- `show/production/human-design-lane/LANE.md` — **GAP** — —
- `show/production/human-design-lane/SOURCES.md` — **CONSUMED** — CUE-SHEET.md, EP01-SHOOTING-SCRIPT-v3.md, EP01-V3-staging.json

### show/production/list10-systems — 1 docs (0 consumed / 0 docs-only / 1 gap)

- `show/production/list10-systems/STAGING-2026-10-27.md` — **GAP** — —

### show/production/list3-systems — 13 docs (5 consumed / 0 docs-only / 8 gap)

- `show/production/list3-systems/249-TYPE-EFFECTIVENESS-CHART.md` — **GAP** — —
- `show/production/list3-systems/253-PRIZE-MONEY-REWARDS.md` — **GAP** — —
- `show/production/list3-systems/CAMERA-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list3-systems/CREDITS-FORMAT.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list3-systems/ECONOMY.md` — **CONSUMED** — GENERATION-PACKAGE.md, STORYBOARD-PLAN.md
- `show/production/list3-systems/ENVIRONMENTAL-SOUND.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list3-systems/OPENING-TITLES.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list3-systems/OPPONENT-AI.md` — **GAP** — —
- `show/production/list3-systems/PLUSH-SPEC.md` — **GAP** — —
- `show/production/list3-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/list3-systems/TEXT-ENGINE.md` — **GAP** — —
- `show/production/list3-systems/TIME-WEATHER-STATES.md` — **GAP** — —
- `show/production/list3-systems/TYPE-SYSTEM.md` — **GAP** — —

### show/production/list4-systems — 10 docs (1 consumed / 0 docs-only / 9 gap)

- `show/production/list4-systems/DOJO-ENCOUNTERS.md` — **GAP** — —
- `show/production/list4-systems/ECOLOGY-TABLES.md` — **GAP** — —
- `show/production/list4-systems/EYECATCH-FORMAT.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list4-systems/GARDEN-RAISING-SYSTEM.md` — **GAP** — —
- `show/production/list4-systems/ITEM-DATA-LAYER.md` — **GAP** — —
- `show/production/list4-systems/MOCHI-CARDS-SPEC.md` — **GAP** — —
- `show/production/list4-systems/MOCHIIOTECA-MAP-MODULE.md` — **GAP** — —
- `show/production/list4-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/list4-systems/STAGING-2026-10-27.md` — **GAP** — —
- `show/production/list4-systems/STATUS-SYSTEM.md` — **GAP** — —

### show/production/list5-systems — 12 docs (1 consumed / 0 docs-only / 11 gap)

- `show/production/list5-systems/37-RIVAL-TEAM-CONSTRUCTION.md` — **GAP** — —
- `show/production/list5-systems/38-CAPTURE-SYSTEM.md` — **GAP** — —
- `show/production/list5-systems/39-TRAINING-SYSTEM.md` — **GAP** — —
- `show/production/list5-systems/40-REGIONAL-VARIANTS.md` — **GAP** — —
- `show/production/list5-systems/41-MYTHICAL-PRESENTATION.md` — **GAP** — —
- `show/production/list5-systems/42-TRANSFORMATION-SEQUENCES.md` — **GAP** — —
- `show/production/list5-systems/43-SCALE-CHART-SYSTEM.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/list5-systems/44-EXTINCT-REVIVAL.md` — **GAP** — —
- `show/production/list5-systems/45-DOJO-CIRCUIT.md` — **GAP** — —
- `show/production/list5-systems/46-LAB-EXPOSITION.md` — **GAP** — —
- `show/production/list5-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/list5-systems/STAGING-2026-10-27.md` — **GAP** — —

### show/production/list6-systems — 2 docs (0 consumed / 0 docs-only / 2 gap)

- `show/production/list6-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/list6-systems/STAGING-2026-10-27.md` — **GAP** — —

### show/production/list7-systems — 1 docs (0 consumed / 0 docs-only / 1 gap)

- `show/production/list7-systems/STAGING-2026-10-27.md` — **GAP** — —

### show/production/mochichao-design — 8 docs (0 consumed / 0 docs-only / 8 gap)

- `show/production/mochichao-design/COVERAGE-AND-ROADMAP.md` — **GAP** — —
- `show/production/mochichao-design/LANE.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R2.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R3.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R4-ANIMALS.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R4-CRYPTID-FOLKLORE.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R4-SMALL-AND-SPIRIT.md` — **GAP** — —
- `show/production/mochichao-design/SPECIES-DATA-R4-TOYBATTLE.md` — **GAP** — —

### show/production/model-sheets — 2 docs (1 consumed / 0 docs-only / 1 gap)

- `show/production/model-sheets/116-RANGER-WARDROBE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/model-sheets/humans/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc

### show/production/moves-registry — 6 docs (2 consumed / 0 docs-only / 4 gap)

- `show/production/moves-registry/ANIMATION-SOURCE-CATALOGUE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/moves-registry/INDEX.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/moves-registry/MOCHIICHAO-NAME-MAP.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/moves-registry/RARE-FIELD-EFFECTS.md` — **GAP** — —
- `show/production/moves-registry/REGISTRY-COMPLETION-AUDIT.md` — **GAP** — —
- `show/production/moves-registry/RENAME-WORKSHEET-BATCH-1.md` — **GAP** — —

### show/production/pipeline — 2 docs (0 consumed / 1 docs-only / 1 gap)

- `show/production/pipeline/GRANTS-ARCHITECTURE.md` — **GAP** — —
- `show/production/pipeline/ORCHESTRATOR.md` — **DOCS-ONLY** — docs: show_production_CANON-CONSISTENCY.md

### show/production/region4-kit — 11 docs (0 consumed / 0 docs-only / 11 gap)

- `show/production/region4-kit/AIRSHIP-AND-MILITARY.md` — **GAP** — —
- `show/production/region4-kit/BAKUGAN-DEEP-USE-MAP.md` — **GAP** — —
- `show/production/region4-kit/HOLDINGS-CHECK.md` — **GAP** — —
- `show/production/region4-kit/LANDING-STEPS.md` — **GAP** — —
- `show/production/region4-kit/R4-FLAVOR-LAW.md` — **GAP** — —
- `show/production/region4-kit/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/region4-kit/REGION-BUILDING-SOURCE-MAP.md` — **GAP** — —
- `show/production/region4-kit/sources/bakugan-structure.md` — **GAP** — —
- `show/production/region4-kit/sources/beyblade-structure.md` — **GAP** — —
- `show/production/region4-kit/sources/bionicle-structure.md` — **GAP** — —
- `show/production/region4-kit/sources/transformers-gundam-evangelion-structure.md` — **GAP** — —

### show/production/research — 8 docs (0 consumed / 1 docs-only / 7 gap)

- `show/production/research/INDEX.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/research/acquisition-checklist.md` — **GAP** — —
- `show/production/research/dragon-ball.md` — **GAP** — —
- `show/production/research/jojo.md` — **GAP** — —
- `show/production/research/naruto.md` — **GAP** — —
- `show/production/research/persona-5-ui-principles.md` — **GAP** — —
- `show/production/research/persona-5.md` — **GAP** — —
- `show/production/research/spongebob.md` — **DOCS-ONLY** — docs: show_bible_COLOR-SYSTEM.md

### show/production/rigs — 22 docs (0 consumed / 0 docs-only / 22 gap)

- `show/production/rigs/CAST-RIG-SPECS.md` — **GAP** — —
- `show/production/rigs/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/rigs/RIG-TEARDOWN-STAGING.md` — **GAP** — —
- `show/production/rigs/RIG-TEARDOWN-open-movies.md` — **GAP** — —
- `show/production/rigs/TALKING-SEAT-SPEC.md` — **GAP** — —
- `show/production/rigs/builds/aeon/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/aeon/TALKING-SET.md` — **GAP** — —
- `show/production/rigs/builds/dorowani/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/rigs/builds/dorowani/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/gabu/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/hex/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/hex/TALKING-SET.md` — **GAP** — —
- `show/production/rigs/builds/kittember/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/mochii/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/mochiko/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/mochiko/TALKING-SET.md` — **GAP** — —
- `show/production/rigs/builds/sproutle/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/builds/wispkin/BODY-SPEC-OWNER-DIRECTION.md` — **GAP** — —
- `show/production/rigs/builds/wispkin/RIG-NOTES.md` — **GAP** — —
- `show/production/rigs/previews/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/rigs/templates/biped-rig-spec.md` — **GAP** — —
- `show/production/rigs/templates/quadruped-rig-spec.md` — **GAP** — —

### show/production/sfx-library — 3 docs (1 consumed / 0 docs-only / 2 gap)

- `show/production/sfx-library/PACKS.md` — **CONSUMED** — GAP-FILL-REPORT.md, GENERATION-PACKAGE.md, FLOW-COMPOSITE-PIPELINE.md
- `show/production/sfx-library/SEED-CATALOGUE-KENNEY.md` — **GAP** — —
- `show/production/sfx-library/SOUNDFONT.md` — **GAP** — —

### show/production/species-data — 17 docs (6 consumed / 0 docs-only / 11 gap)

- `show/production/species-data/104-INDIVIDUAL-HONOURS.md` — **GAP** — —
- `show/production/species-data/130-FORME-CHANGE.md` — **GAP** — —
- `show/production/species-data/135-HATCH-PRESENTATION.md` — **GAP** — —
- `show/production/species-data/152-SPECIES-BEHAVIOUR-PROFILES.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/171-BREEDING-COMPATIBILITY.md` — **GAP** — —
- `show/production/species-data/207-MOCHIIOTECA-DISCOVERY-STATES.md` — **GAP** — —
- `show/production/species-data/229-REGIONAL-CRY-DIALECTS.md` — **GAP** — —
- `show/production/species-data/231-WILD-TERRITORY-EVENTS.md` — **GAP** — —
- `show/production/species-data/318-RULED-DEVIATION-REGISTER.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/322-GENERATED-VARIATION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/324-DEVIATION-INHERITANCE.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/325-RECORD-PORTRAIT-FIDELITY.md` — **GAP** — —
- `show/production/species-data/80-INDIVIDUAL-VARIATION.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/EVOLUTION-EDGES-VERIFICATION-NOTE.md` — **GAP** — —
- `show/production/species-data/HABITAT-VARIANTS.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data/R4-BUG-LINE.md` — **GAP** — —
- `show/production/species-data/R4-FOLKLORE-METHOD.md` — **GAP** — —

### show/production/species-data-system — 12 docs (1 consumed / 0 docs-only / 11 gap)

- `show/production/species-data-system/197-ROSTER-LOCK.md` — **GAP** — —
- `show/production/species-data-system/204-EGG-MOVE-INHERITANCE.md` — **GAP** — —
- `show/production/species-data-system/206-FOSSIL-REVIVAL-SERVICE.md` — **GAP** — —
- `show/production/species-data-system/208-ROSTER-AUDIT-RUN-2026-10-27.md` — **GAP** — —
- `show/production/species-data-system/ALIGNMENT-MAP.md` — **GAP** — —
- `show/production/species-data-system/AUDIT-WHAT-EXISTS.md` — **GAP** — —
- `show/production/species-data-system/DESIGN-BRIEF-canon-world.md` — **CONSUMED** — GENERATION-PACKAGE.md
- `show/production/species-data-system/GAP-AUDIT.md` — **GAP** — —
- `show/production/species-data-system/NEW-SPECIES-SHEET-TEMPLATE.md` — **GAP** — —
- `show/production/species-data-system/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/species-data-system/TBD-REGISTER.md` — **GAP** — —
- `show/production/species-data-system/gap-fills/DRAFT-NOT-APPLIED.md` — **GAP** — —

### show/production/species-systems — 7 docs (1 consumed / 0 docs-only / 6 gap)

- `show/production/species-systems/258-GROWN-WEAPON-GROWTH.md` — **GAP** — —
- `show/production/species-systems/259-GROWN-ARMOUR-ANATOMY.md` — **GAP** — —
- `show/production/species-systems/CRY-SYNTH.md` — **CONSUMED** — EP01-V3-DELIVERY-LEDGER.md, GENERATION-PACKAGE.md
- `show/production/species-systems/MOCHIIOTECA-FORMATS.md` — **GAP** — —
- `show/production/species-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/species-systems/SILHOUETTE-DISCOVERY.md` — **GAP** — —
- `show/production/species-systems/species-sheet-schema-patch-cry.md` — **GAP** — —

### show/production/transplant-roster — 1 docs (0 consumed / 0 docs-only / 1 gap)

- `show/production/transplant-roster/TRANSPLANT-ROSTER.md` — **GAP** — —

### show/production/world-systems — 161 docs (0 consumed / 0 docs-only / 161 gap)

- `show/production/world-systems/100-CHAMPION-GAUNTLET.md` — **GAP** — —
- `show/production/world-systems/102-HABITAT-RANGE-MAPS.md` — **GAP** — —
- `show/production/world-systems/105-FESTIVAL-CALENDAR.md` — **GAP** — —
- `show/production/world-systems/110-SANCTUARY-ZONE.md` — **GAP** — —
- `show/production/world-systems/111-ANGLING-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/112-ENCOUNTER-MODIFIERS.md` — **GAP** — —
- `show/production/world-systems/113-SWARM-EVENTS.md` — **GAP** — —
- `show/production/world-systems/114-ROAMING-ENCOUNTERS.md` — **GAP** — —
- `show/production/world-systems/115-EXCAVATION-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/117-FIELD-TECHNIQUES.md` — **GAP** — —
- `show/production/world-systems/119-INTERIOR-AREAS.md` — **GAP** — —
- `show/production/world-systems/123-MOUNT-TRAVERSAL.md` — **GAP** — —
- `show/production/world-systems/124-EVENT-ROTATION.md` — **GAP** — —
- `show/production/world-systems/125-FAST-TRAVEL.md` — **GAP** — —
- `show/production/world-systems/126-HALL-OF-FAME.md` — **GAP** — —
- `show/production/world-systems/127-REGION-TRANSITION.md` — **GAP** — —
- `show/production/world-systems/132-CARE-CENTRES.md` — **GAP** — —
- `show/production/world-systems/133-LICENCE-TRIALS.md` — **GAP** — —
- `show/production/world-systems/134-FIELD-CAMP.md` — **GAP** — —
- `show/production/world-systems/137-WORLD-ATLAS.md` — **GAP** — —
- `show/production/world-systems/138-SIDE-STORIES.md` — **GAP** — —
- `show/production/world-systems/140-BORDER-ZONES.md` — **GAP** — —
- `show/production/world-systems/141-FERRY-NETWORK.md` — **GAP** — —
- `show/production/world-systems/142-REGIONAL-CLIMATE.md` — **GAP** — —
- `show/production/world-systems/143-REGIONAL-LEAGUE-VARIANCE.md` — **GAP** — —
- `show/production/world-systems/144-CROSS-REGION-SPECIES.md` — **GAP** — —
- `show/production/world-systems/145-TRAVELLING-NPCS.md` — **GAP** — —
- `show/production/world-systems/151-TOURNAMENT-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/153-RARE-WEATHER-PHENOMENA.md` — **GAP** — —
- `show/production/world-systems/154-RUINS-AND-ANCIENT-SITES.md` — **GAP** — —
- `show/production/world-systems/160-FIELD-PARTNER-AI.md` — **GAP** — —
- `show/production/world-systems/162-GROOMING-SPA.md` — **GAP** — —
- `show/production/world-systems/163-MYTHICAL-HABITAT-SEALING.md` — **GAP** — —
- `show/production/world-systems/164-MISSION-BOARD.md` — **GAP** — —
- `show/production/world-systems/167-PERFORMANCE-CONTESTS.md` — **GAP** — —
- `show/production/world-systems/169-RANGER-HIDEOUTS.md` — **GAP** — —
- `show/production/world-systems/170-SAFARI-ZONES.md` — **GAP** — —
- `show/production/world-systems/172-BROADCAST-MEDIA.md` — **GAP** — —
- `show/production/world-systems/176-TOWN-ARCADE.md` — **GAP** — —
- `show/production/world-systems/191-PLAYER-JOURNAL.md` — **GAP** — —
- `show/production/world-systems/192-WATER-TRAVERSAL-AND-DIVE.md` — **GAP** — —
- `show/production/world-systems/193-DAYCARE-SERVICES.md` — **GAP** — —
- `show/production/world-systems/194-WEATHER-FORECASTING.md` — **GAP** — —
- `show/production/world-systems/195-SEASONAL-WORLD-EVENTS.md` — **GAP** — —
- `show/production/world-systems/196-PORTRAIT-PHOTO-STUDIO.md` — **GAP** — —
- `show/production/world-systems/198-REGIONAL-DEX.md` — **GAP** — —
- `show/production/world-systems/199-EVOLUTION-METHODS.md` — **GAP** — —
- `show/production/world-systems/201-RANGER-REPUTATION.md` — **GAP** — —
- `show/production/world-systems/202-MOOD-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/203-NESTS-AND-DENS.md` — **GAP** — —
- `show/production/world-systems/205-REGIONAL-EVOLUTION-SPLITS.md` — **GAP** — —
- `show/production/world-systems/209-AMBUSH-ENCOUNTERS.md` — **GAP** — —
- `show/production/world-systems/212-GARDEN-VISITORS.md` — **GAP** — —
- `show/production/world-systems/213-FRAGMENT-CASE-PRESENTATION.md` — **GAP** — —
- `show/production/world-systems/214-WILD-SIZE-DERIVATION.md` — **GAP** — —
- `show/production/world-systems/215-REGIONAL-AMBIENT-BEDS.md` — **GAP** — —
- `show/production/world-systems/216-COMPLETION-CEREMONY.md` — **GAP** — —
- `show/production/world-systems/220-SHELTER-AND-STRAY.md` — **GAP** — —
- `show/production/world-systems/221-RANGER-MENTORSHIP.md` — **GAP** — —
- `show/production/world-systems/223-WORLD-VISITING.md` — **GAP** — —
- `show/production/world-systems/224-INWORLD-NEWSPAPER-CHRONICLE.md` — **GAP** — —
- `show/production/world-systems/225-MEMORIAL-SITES.md` — **GAP** — —
- `show/production/world-systems/226-MIGRATION-SPECTACLES.md` — **GAP** — —
- `show/production/world-systems/230-LICENCE-DISCIPLINE.md` — **GAP** — —
- `show/production/world-systems/232-WORKING-PROFESSIONS.md` — **GAP** — —
- `show/production/world-systems/233-INTERREGIONAL-EXCHANGE.md` — **GAP** — —
- `show/production/world-systems/235-INSCRIPTIONS.md` — **GAP** — —
- `show/production/world-systems/236-MOCHI-SPORTS.md` — **GAP** — —
- `show/production/world-systems/237-INDIVIDUAL-IDLE-QUIRKS.md` — **GAP** — —
- `show/production/world-systems/241-FOLLOWER-TOWN-RULES.md` — **GAP** — —
- `show/production/world-systems/243-LIFE-STAGES.md` — **GAP** — —
- `show/production/world-systems/244-RANGER-ETIQUETTE.md` — **GAP** — —
- `show/production/world-systems/245-FIELD-RESCUE.md` — **GAP** — —
- `show/production/world-systems/246-NIGHT-SKY.md` — **GAP** — —
- `show/production/world-systems/255-ENCOUNTER-RATE-PACING.md` — **GAP** — —
- `show/production/world-systems/256-CENTRE-SERVICES-FLOW.md` — **GAP** — —
- `show/production/world-systems/257-BLOOM-STATES.md` — **GAP** — —
- `show/production/world-systems/261-POLLEN-SCENT.md` — **GAP** — —
- `show/production/world-systems/262-SUNLIGHT-REST.md` — **GAP** — —
- `show/production/world-systems/263-ROOTING-MODE.md` — **GAP** — —
- `show/production/world-systems/264-GARDEN-PLANTING-SPOTS.md` — **GAP** — —
- `show/production/world-systems/265-WILD-DUEL-ETIQUETTE.md` — **GAP** — —
- `show/production/world-systems/272-WITNESSES-WANTED.md` — **GAP** — —
- `show/production/world-systems/274-UNDERWORLD-FENCES.md` — **GAP** — —
- `show/production/world-systems/288-PURIFICATION.md` — **GAP** — —
- `show/production/world-systems/291-LURE-SPOTS.md` — **GAP** — —
- `show/production/world-systems/293-RAISING-DEPTH.md` — **GAP** — —
- `show/production/world-systems/294-CARE-SPORTS.md` — **GAP** — —
- `show/production/world-systems/298-AMBIENT-WORLD-EVENTS.md` — **GAP** — —
- `show/production/world-systems/300-CHOICE-CONSEQUENCE-STANDARD.md` — **GAP** — —
- `show/production/world-systems/306-LIVING-OVERWORLD-PRESENCE.md` — **GAP** — —
- `show/production/world-systems/314-YOKAI-SPECTACLE.md` — **GAP** — —
- `show/production/world-systems/315-EXPLORATION-SPECTACLE.md` — **GAP** — —
- `show/production/world-systems/317-FACE-SHIELDS.md` — **GAP** — —
- `show/production/world-systems/319-INDIVIDUAL-RECOGNITION.md` — **GAP** — —
- `show/production/world-systems/323-STANDOUT-ENCOUNTERS.md` — **GAP** — —
- `show/production/world-systems/328-RANCHER-ARRIVAL.md` — **GAP** — —
- `show/production/world-systems/329-CARE-BRANCH-EVOLUTION.md` — **GAP** — —
- `show/production/world-systems/331-PERSONA-BONDS-CALENDAR.md` — **GAP** — —
- `show/production/world-systems/332-WORKING-PROPERTIES.md` — **GAP** — —
- `show/production/world-systems/333-COMPANION-JUDGEMENT.md` — **GAP** — —
- `show/production/world-systems/334-HOME-CAMP.md` — **GAP** — —
- `show/production/world-systems/335-TOURNAMENT-FORM.md` — **GAP** — —
- `show/production/world-systems/339-BOND-SHAPED-VARIATION.md` — **GAP** — —
- `show/production/world-systems/340-MOVE-SHAPED-VARIATION.md` — **GAP** — —
- `show/production/world-systems/346-RAISING-SHOWN.md` — **GAP** — —
- `show/production/world-systems/67-WEATHER-BEHAVIOUR.md` — **GAP** — —
- `show/production/world-systems/68-TRADE-PROTOCOL.md` — **GAP** — —
- `show/production/world-systems/69-ACHIEVEMENTS.md` — **GAP** — —
- `show/production/world-systems/70-DIFFICULTY.md` — **GAP** — —
- `show/production/world-systems/71-ONBOARDING.md` — **GAP** — —
- `show/production/world-systems/77-EGG-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/78-GARDEN-SHOWCASE.md` — **GAP** — —
- `show/production/world-systems/79-MOCHI-FRUIT-FARM.md` — **GAP** — —
- `show/production/world-systems/81-MOCHIIOTECA-DEVICE-BEHAVIOUR.md` — **GAP** — —
- `show/production/world-systems/84-SOUND-ECOLOGY.md` — **GAP** — —
- `show/production/world-systems/85-IRIDESCENCE-WAYFINDING.md` — **GAP** — —
- `show/production/world-systems/86-POSTGAME-FACILITIES.md` — **GAP** — —
- `show/production/world-systems/87-RANGER-REMATCH.md` — **GAP** — —
- `show/production/world-systems/88-GARDEN-ATTRACTIONS.md` — **GAP** — —
- `show/production/world-systems/89-TRACKING-MECHANIC.md` — **GAP** — —
- `show/production/world-systems/90-IRIDESCENCE-MEDIA.md` — **GAP** — —
- `show/production/world-systems/91-EVOLUTION-ITEMS.md` — **GAP** — —
- `show/production/world-systems/93-NPC-SCHEDULES.md` — **GAP** — —
- `show/production/world-systems/97-RESEARCH-TASKS.md` — **GAP** — —
- `show/production/world-systems/98-RANGER-LICENCE.md` — **GAP** — —
- `show/production/world-systems/99-SYNDICATE-ENCOUNTERS.md` — **GAP** — —
- `show/production/world-systems/ENCOUNTER-BALANCE.md` — **GAP** — —
- `show/production/world-systems/EVENT-FLAG-ARCHITECTURE.md` — **GAP** — —
- `show/production/world-systems/EVOLUTION-DATA-MODEL.md` — **GAP** — —
- `show/production/world-systems/GAP-FILL-ADDENDUM-list23.md` — **GAP** — —
- `show/production/world-systems/GARDEN-CARE-LOOP.md` — **GAP** — —
- `show/production/world-systems/GARDEN-FOLLOWER-SYSTEM.md` — **GAP** — —
- `show/production/world-systems/GARDEN-MINIGAME.md` — **GAP** — —
- `show/production/world-systems/MOCHIIOTECA-COMPLETION.md` — **GAP** — —
- `show/production/world-systems/PUZZLE-GATES.md` — **GAP** — —
- `show/production/world-systems/README.md` — **GAP** — — — sweep: generic filename — citation test is blind to it; index/pointer doc
- `show/production/world-systems/REGION1-ROUTE-GRAPH.md` — **GAP** — —
- `show/production/world-systems/SEVEN-ISLES-POSTGAME.md` — **GAP** — —
- `show/production/world-systems/SNAPSHOT-MODE.md` — **GAP** — —
- `show/production/world-systems/SPAWN-TABLES.md` — **GAP** — —
- `show/production/world-systems/STAGING-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list11-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list12-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list13-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list14-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list15-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list16-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list18-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list20-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list21-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list23-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list25-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list27-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list28-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list31-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list33-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list34-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list35-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/STAGING-list9-2026-10-27.md` — **GAP** — —
- `show/production/world-systems/WEATHER-SYSTEM.md` — **GAP** — —
---

## Owner's answer (2026-10-28) — the open question in §7 is closed

The sweep closed §7 by flagging the show-side consumption model
for the 455 game/data-facing specs as "an open design question
for the owner — flagged, not filled." The owner has answered:
**it was never open.** His standing instruction, given in the
development conversations before this sweep ran, is that **the
game-side specs write the show-side specs.**

In plain words:

- He laid out the generations and the regions himself, and
  filled in the gaps he cared about.
- Everything he did not fill in, he directed to be filled from
  the games and the other files, and from the inspirations and
  show bibles he named — the same Pokémon-base +
  construction-kit pattern the rest of the project runs on.
- So the 455 docs counted GAP in the appendix are **the source
  library the show specs are derived from** — consumed by
  derivation (game spec → show spec), not a backlog waiting on
  a decision about whether the show may use them. The method,
  for any lane: when a show spec is needed, derive it from the
  governing game spec first; fill what remains the Pokémon way
  and from the owner's named inspirations.

One instrument note, for the record: this sweep's test counted
citations in episode build files. A derivation does not leave a
citation behind it — a show spec written from a game spec does
not have to name it — so the appendix's GAP rows mean "not
cited," not "unused." The appendix stands exactly as measured;
what changes is the reading of it. The 455 are source material
under a standing method, not an open question.

Owner's answer recorded 2026-10-28. The §7 item ("flagged, not
filled") is filled — by the owner's ruling.
