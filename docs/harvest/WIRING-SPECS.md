# WIRING SPECS — Top 10 transfers, execution-ready

*Show-side harvest lane (register item 38), 2026-10-29. For the
region1-completion coordinator and the 100-programme to execute
without re-researching. Targets verified against repo main's tree
(fresh read 2026-10-29). Where a spec's arithmetic must come from
held donor code (source-first law), the spec says so — the show
doc supplies canon, shape, and presentation; the decomp supplies
the numbers; the two are reconciled at the seam and the
reconciliation is what the test proves.*

---

## Spec 1 — Battle damage formula (TOP-25 #1)

- **Source:** `show/production/battle/248-BATTLE-DAMAGE-FORMULA.md`
  + `damage-fragment.json` (`mochiichao/damage-formula/v1`: STAB
  3/2 declared, weather as a data row, critical as a declared
  event, "Math.floor floormath"; the doc's own named delta from
  Pokémon: escape from 85–100 variance is a *form* decision, not
  a tuning one).
- **Target:** `src/lib/battle-math.ts` (exists) — the live battle
  path's only damage function; `battleResolver.ts` consumes it.
- **Shape:** fragment fields land as a constants module beside
  battle-math (`DAMAGE_FORMULA_V1`); every modifier is a named
  constant, no inline literals.
- **Tests:** (a) golden vectors — a fixed attacker/defender/move
  triple computed three ways (fragment spec, held decomp
  arithmetic, live function) agree to the floor; (b) variance
  range test asserts rolls stay inside the declared band;
  (c) STAB on/off pair differs by exactly the declared factor
  before flooring.
- **Closes:** [A§2]; S6 input. **Owner slots:** none (the form
  choice is already the doc's, owner-programme-ruled).

## Spec 2 — Type effectiveness chart (TOP-25 #2)

- **Source:** `show/production/list3-systems/249-TYPE-EFFECTIVENESS-CHART.md`
  — format `mochiichao/type-chart/v1`: sparse (attacking,
  defending, multiplier) triples, `mult ∈ {0, 0.5, 2}`, unlisted
  pairs ×1, dual-type products computed never stored; contents
  filled by transposition from the nearest analogue profiles;
  Core/Silk/Wind carry authored balanced profiles (stated in-doc).
- **Target:** `src/lib/battleTypeChart.ts` (exists, unwired) —
  load the fragment triples as the chart data; wire the resolver
  call in `battleResolver.ts` (S6's collision order).
- **⚠ Data conflict the executor must surface, not resolve:** the
  doc fills the chart for **fifteen** types; current canon is the
  True 19 (incl. Deep with 37 TBD cells, Clairvoyant confirmed).
  The fifteen land as-is; the remaining types' cells stay unlisted
  (= ×1) and flagged — filling them is an owner/balance slot, and
  the Draco question (S6's flag) is untouched by this transfer.
- **Tests:** (a) every triple in the fragment exists in the loaded
  chart (count + spot vectors); (b) dual-type product test;
  (c) unlisted pair returns exactly 1; (d) chart is read by the
  live resolver path (integration test through a real battle).

## Spec 3 — Priority & turn order (TOP-25 #3)

- **Source:** `show/production/battle/251-PRIORITY-TURN-ORDER.md`
  — native spec `mochiichao/turn-order/v1`: switch commands first,
  bag second, then moves by **priority bracket → effective Speed →
  seeded draw**; order computed from declared data only (#70's
  no-rubber-banding law binds).
- **Target:** `src/lib/battleResolver.ts` turn queue; the seeded
  draw uses the battle's existing RNG seam (no new entropy source).
- **Tests:** (a) bracket beats speed (slow high-priority move acts
  before fast neutral move); (b) switch-first: incoming individual
  takes the hit; (c) same bracket+speed resolves by the seeded
  draw deterministically across replays with the same seed;
  (d) bag-before-moves ordering.

## Spec 4 — Status conditions (TOP-25 #4)

- **Source:** `show/production/battle/182-STATUS-CONDITIONS.md` —
  the battle layer over the condition record's two classes:
  `persistent` (one at a time, survives battle) and `volatile`
  (stacking, battle-scoped, cleared on switch); application with
  immunity checks, exclusivity enforced **at application**,
  end-of-turn residual ticks in fixed order, cure routes.
- **Target:** battle state model in `battleResolver.ts` /
  `battleIntegration.ts`; condition records ride the S7 individual
  record (persistent class only).
- **⚠ Owner slot inside the source:** the doc deliberately names
  **no conditions** — the roster/names are an owner canon pass.
  The layer wires with zero instanced conditions; the mechanics
  land, the names wait. Do not invent a roster to make tests
  prettier — tests use fixture conditions marked TESTONLY.
- **Tests:** (a) second persistent application is refused at
  application time; (b) volatile clears on switch, persistent
  doesn't; (c) tick order is the doc's fixed order (order-recording
  fixture); (d) cure route clears exactly its class.

## Spec 5 — Ability trigger resolution (TOP-25 #5)

- **Source:** `show/production/battle/184-ABILITY-TRIGGER-RESOLUTION.md`
  — firing order over the registry's closed trigger vocabulary
  (`entry`, `on-dealt`/`on-taken`, `turn-end`, `weather-react`,
  `standing`, `field-only`), one firing seat per class inside the
  turn pipeline; suppression defined; instances nothing.
- **Target:** `src/data/core/ability-registry.json` (exists) gains
  no new fields — the resolution layer is code: trigger dispatch
  in `battleResolver.ts` at the pipeline stages #107's hooks name.
- **Tests:** (a) entry fires before any command resolves;
  (b) on-taken rides the causing hit (same resolution step);
  (c) turn-end tail order shared with residual ticks (Spec 4's
  order test extends here); (d) a suppressed ability produces no
  event and no presentation cue.

## Spec 6 — Experience gain (TOP-25 #6)

- **Source:** `show/production/battle/177-EXPERIENCE-GAIN.md` +
  `gain-fragment.json` — the yield pool: per-species yield × level,
  divided among participants (participation is the earning
  criterion; division conserves the pool — nothing created,
  nothing lost); **captured opponents yield nothing; versus/PvP
  yields nothing**; the interface is one battle-end learning event
  per Ranger-side participant (consumed by #129's flow).
- **Target:** the payoff lane's HGSS port (battle payoff package)
  — this spec is the reconciliation contract between the show doc
  and the decomp arithmetic (pool = yield×level/7, trainer ×1.5,
  per the payoff lane's verified port): where they differ, the
  decomp's arithmetic governs the numbers and the doc governs the
  exclusions and the event interface; the difference, if any, is
  written into the payoff lane's provenance record.
- **Tests:** (a) pool conservation across 1–3 participants;
  (b) capture ends battle → zero gain events; (c) participant who
  fainted mid-battle handled per the port's rule, asserted
  explicitly; (d) exactly one learning event per participant id.

## Spec 7 — Bond effects (TOP-25 #7)

- **Source:** `show/production/battle/180-BOND-EFFECTS.md` — the
  honesty law: bond's battle effects are **presentation-first**;
  any mechanical edge must be a **declared data row with a visible
  cue** — or it does not exist (#70's no-hidden-modifiers refusal
  binds the whole system).
- **Target:** `src/data/core/bond-effects-table.json` (exists) as
  the declared-rows table; consumer = battle presentation +
  resolver, reading bond from the bond lane's band model (B0–B5
  over append-only care history — no stored friendship byte).
- **Shape:** each row `{band, effect, cue}` — effect names a
  resolver hook, cue names the presentation beat; rows without a
  cue are invalid data and fail validation.
- **Tests:** (a) validation rejects any row lacking a cue;
  (b) at B0–B2 no mechanical row fires (presentation rows may);
  (c) a fired mechanical row always emits its cue event in the
  same resolution step; (d) no code path applies an undeclared
  bond modifier (grep-level guard: bond reads occur only via the
  table consumer).

## Spec 8 — The individual record (TOP-25 #8)

- **Source:** `show/production/species-data/80-INDIVIDUAL-VARIATION.md`
  — per-individual variance (bounded per-stat integers rolled at
  creation), a personality seed from which visible traits derive
  (one roll, many reads), bounded inheritance from parents; the
  Individual Variation Doctrine (owner, 2026-10-27): a deviation
  on a named individual is character, not error.
- **Target:** S7 builds the record — one instance model consumed
  by garden, battle, follower, and (per HYBRID-CLASS-CANON) the
  person-flag for hybrid-class individuals. Lands in `src/lib/`
  beside `species.ts`; species data stays in
  `src/data/core/species.json` untouched (individuals reference,
  never copy, species rows).
- **Shape (from the doc):** `{instanceId, speciesId, variance{…},
  personalitySeed, derivedTraits (computed, never stored),
  careHistoryRef, personFlag?: 'mochi-ranger' | undefined}`.
- **Tests:** (a) two instances of one species differ in derived
  reads but share the species row; (b) derived traits recompute
  identically from the seed (no stored drift); (c) offspring
  variance stays inside the doc's bounded inheritance slice;
  (d) save round-trip preserves the record exactly (rides S0's
  IndexedDB restore).

## Spec 9 — Species behaviour profiles (TOP-25 #9)

- **Source:** `show/production/species-data/152-SPECIES-BEHAVIOUR-PROFILES.md`
  (+ behaviour-profile-fragment.json) — one profile per species:
  field behaviour (approach/flee/ignore/display), idle and care
  behaviours; the governing law: *a place may only behave of
  species its spawn table stocks*.
- **Target:** data file beside `src/data/core/species.json`
  (profiles keyed by species id); consumers = S10's behaviour
  scorer (visible roamers on Route Topaz first) and the
  living-world director (Spec 11's content half).
- **Tests:** (a) every species in a landed spawn table has a
  profile or an explicit default-profile row (no silent blanks);
  (b) a place's ambient behaviour set ⊆ its spawn table's species
  (the doc's law, as a validation test over map data);
  (c) scorer determinism: same profile + same stimulus → same
  behaviour state.

## Spec 10 — Spawn tables + encounter modifiers (TOP-25 #10)

- **Source:** `show/production/world-systems/SPAWN-TABLES.md` —
  which itself documents the game's existing seed:
  `src/data/core/encounters.json` today holds **3 maps, 4 tables,
  13 species**, rows `{mapId, method, minLevel, maxLevel, weight}`
  with `timeOfDay`/`weather` present but null. The doc's roll:
  pick table by method × time, weighted pick among slots. Plus
  `112-ENCOUNTER-MODIFIERS.md` — modifiers are a **transform layer
  between the table and the roll**, expressed as ordinary records
  in the item layer (closed effect vocabulary), never as table
  edits; `113-SWARM-EVENTS.md` overlays; `255-ENCOUNTER-RATE-PACING.md`
  rates.
- **Target:** `src/data/core/encounters.json` extended map-by-map
  (Region 1 first: all 45 maps' tables authored from FullWorldMaps
  data + the doc's method split); the S5 selector reads it —
  retiring the inline arrays map-by-map and killing stub S-6.
- **Tests:** (a) every Region 1 map resolves a table for each
  method its tiles support; (b) weighted-pick distribution test
  (seeded, tolerance-banded); (c) timeOfDay/weather non-null rows
  select correctly at band edges (rides S1's world clock);
  (d) modifier transform test: table data unchanged after a
  modifier expires (the layer law); (e) sealing guard: no table
  may contain a sealed species (cross-check Spec — sealing
  records, TOP-25 #15) — this test is the Goddgachuu guarantee.

---

## Hand-off notes for the executing programmes

- Order inside Region 1: Spec 10 → Spec 9 → Specs 1–6 (battle
  convergence rides S6's collision order) → Spec 7 → Spec 8.
- Every spec above names its owner slots where they exist
  (Spec 2's extra-type cells, Spec 4's condition names). The
  slots stay open and flagged; none of the ten is blocked by one.
- Provenance: each landed spec writes its source line
  (show file → game file) into its package record, per the
  source-first wiring law.
