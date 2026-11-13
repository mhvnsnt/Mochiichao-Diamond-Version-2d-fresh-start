# Regions 3–5 Maps Audit — Regions 3–5 Skeleton Shipped

2026-11-13, regions3-5-maps PR (branch `feature/regions3-5-maps-20261113`,
base main `cd4088f1`, PR #423 merge). Audit source:
`src/lib/wiring/dialogue/regionN-dialogue.json` (merged in PR #421) +
`src/lib/trainers-regionN.ts` + `FULL_WORLD` on main
(`src/world/FullWorldMaps.ts`, 89 maps: 46 Region 1 + 43 Region 2).
Follows the Region 2 audit (`docs/regions2-5-maps-audit-20261113.md`).

## 1. What the dialogue references vs what exists

| Region | Entries | Dialogue mapKeys | Keys wired before | Keys wired by this PR |
|---|---|---|---|---|
| 3 — Sea / Land | 15 | 37 | 0/37 = 0% | 37/37 = 100% (31 direct + 6 folded into `r3_plateau`) |
| 4 — Rift | 16 | 39 | 0/39 = 0% | 39/39 = 100% (33 direct + 6 folded into `r4_plateau`) |
| 5 — New Continent | 17 | 36 | 0/36 = 0% | 36/36 = 100% (30 direct + 6 folded into `r5_plateau`) |
| **Total** | **48** | **112** | **0/112 = 0%** | **112/112 = 100%** |

All 150 dialogue keys (38 Region 2 + 112 here) are now wired: 38/150 = 25%
was Region 2, 150/150 = 100% after this PR.

Region 3's 37 keys resolve to 41 physical maps: 31 keys map 1:1, the 6
Plateau keys (`r3_elite_1..4`, `r3_champion`, `r3_hall`) fold into one
`r3_plateau` map, and 10 new keys are added that the dialogue does not
name but the skeleton requires — 8 route maps (`r3_route_1..8`, one per
town-to-town link, R1 `route_1/2/3` pattern), `r3_sea_route` (Dewford–
Mauville Wave-Ride crossing), and `r3_mochiiplex_root_hamlet`. (The
Template L chapter opening — `r3_outpost_2f`, `r3_outpost_1f`,
`r3_root_hamlet`, `r3_lab` — IS named: all four are R3-01 keys.) Region 4's 39 keys resolve to 44 physical
maps: 33 keys 1:1, 6 fold into `r4_plateau`, 10 route maps
(`r4_route_1..10`) + `r4_mochiiplex_twinleaf`. Region 5's 36 keys
resolve to 41 physical maps: 30 keys 1:1, 6 fold into `r5_plateau`,
10 route maps (`r5_route_1..10`) + `r5_mochiiplex_start_city`.

## 2. Slices shipped (126 maps)

Play order R3: `r2_frost_peak` → `r3_outpost_2f` → `r3_outpost_1f` →
`r3_root_hamlet` (+ `r3_lab`, `r3_mochiiplex_root_hamlet`) →
`r3_oldale_road` → `r3_rustboro` (+ `r3_dojo_1`) → `r3_route_1` →
`r3_dewford` (+ `r3_cave`, `r3_dojo_2`) → `r3_sea_route` →
`r3_mauville` (+ `r3_arena`, `r3_dojo_3`) → `r3_route_2` →
`r3_lavaridge` (+ `r3_land_base`, `r3_dojo_4`) → `r3_route_3` →
`r3_petalburg` (+ `r3_dojo_5`) → `r3_route_4` → `r3_fortree` (+
`r3_weather_institute`, `r3_dojo_6`) → `r3_route_5` → `r3_lilycove`
(+ `r3_hideout`) → `r3_route_6` → `r3_mossdeep` (+ `r3_dojo_7`) →
`r3_route_7` → `r3_crater_city` (+ `r3_dojo_8`) → `r3_route_8` →
`r3_awakening` → `r3_victory_route` → `r3_plateau` →
`r3_frontier_arenas`.

Play order R4: `r3_frontier_arenas` → `r4_twinleaf` (+
`r4_mochiiplex_twinleaf`) → `r4_route_1` → `r4_sandgem` →
`r4_route_2` → `r4_jubilife` → `r4_route_3` → `r4_oreburgh` (+
`r4_dojo_1`) → `r4_route_4` → `r4_floaroma` → `r4_route_5` →
`r4_eterna` (+ `r4_statue`, `r4_dojo_2`) → `r4_route_6` →
`r4_hearthome` (+ `r4_contest_hall`, `r4_dojo_3`) → `r4_route_7` →
`r4_veilstone` (+ `r4_warehouse`, `r4_dojo_4`) → `r4_route_8` →
`r4_pastoria` (+ `r4_dojo_5`) → `r4_preserve` → `r4_route_9` →
`r4_celestic` (+ `r4_cave_painting`) → `r4_route_10` → `r4_canalave`
(+ `r4_library`, `r4_island`, `r4_dojo_6`) → `r4_snowpoint` (+
`r4_temple`, `r4_dojo_7`) → `r4_sunyshore` (+ `r4_dojo_8`) →
`r4_victory_route` → `r4_plateau` → `r4_battle_zone` →
`r4_rift_dungeon`.

Play order R5: `r4_rift_dungeon` → `r5_start_city` (+
`r5_mochiiplex_start_city`) → `r5_route_1` → `r5_sandgem` →
`r5_route_2` → `r5_jubilife` → `r5_route_3` → `r5_oreburgh` (+
`r5_dojo_1`) → `r5_route_4` → `r5_floaroma` → `r5_route_5` →
`r5_eterna` (+ `r5_dojo_2`) → `r5_route_6` → `r5_hearthome` (+
`r5_contest_hall`, `r5_dojo_3`) → `r5_route_7` → `r5_veilstone` (+
`r5_warehouse`, `r5_dojo_4`) → `r5_route_8` → `r5_pastoria` (+
`r5_dojo_5`) → `r5_preserve` → `r5_route_9` → `r5_celestic` →
`r5_route_10` → `r5_canalave` (+ `r5_library`, `r5_dojo_6`) →
`r5_snowpoint` (+ `r5_temple`, `r5_dojo_7`) → `r5_sunyshore` (+
`r5_dojo_8`) → `r5_victory_route` → `r5_plateau` →
`r5_grand_tournament` → `r5_mythar_final`.

Per-map check (all 126): entry + exit, every exit/door target exists,
every gate names its requirement, no dead door — pinned by
`tests/regions3-5-maps.test.ts`.

## 3. Towns — heal + shop + sign + NPC

36/36 towns have heal + shop + sign + a non-battle NPC. Inline
nurse/clerk follow the Stoneport precedent; only the three arrival
towns get a full MochiiPlex interior (`MOCHIIPLEX_1` pattern):
Root Hamlet, Twinleaf, Start City. R3 Root Hamlet's town NPC is a
labelled placeholder resident (R3-01 names no town-map NPC; the keeper
is downstairs, the researcher is in the lab). R5 Canalave and
Snowpoint carry no dialogue NPC in the town itself (their keepers are
in the library / temple subs); the inline nurse + clerk are the
non-battle NPCs there.

## 4. Trainers wired from rows (nothing invented)

`trainers-region3.ts` has 46 rows, `trainers-region4.ts` 43 rows,
`trainers-region5.ts` 47 rows (136 rows). This PR wires 76/136 = 56%
as battle NPCs; the rest are dialogue-only slots (see §5).

- Region 3, 27/46: R3-001 Hex lab battle (named "Hex"), R3-002/003
  (Oldale Road), R3-004/005 (Mauville Arena), R3-006/007 (Lilycove
  Hideout), R3-010..013 (Victory Route), 16 dojo acolytes (2 per dojo).
- Region 4, 26/43: R4-001/002 (Sandgem Route), R4-003/004 (Floaroma
  Valley, wired on the town map), R4-005/006 (Celestic), R4-007..010
  (Victory Route), 16 dojo acolytes.
- Region 5, 23/47: R5-001/002 (Start City Route), R5-005..009 (Victory
  Route — five veterans, not four), 16 dojo acolytes.
- Inline teams mirror the row (species + levels); the resolver swaps
  in the row team at battle time (`trainer-teams-resolver.ts`). Inline
  stats are the species' `SPECIES_DB` base stats, moves are
  `BASIC_MOVES` (Tackle + Swift Movement). Trainer dialog lines are
  NOT in the trainer file: each battle NPC carries one labelled
  placeholder line. Exceptions: the first Veteran on each victory route
  carries the entry's beats veteran lines (R3-11 / R4-14 / R5-14), and
  the Hex lab battle carries the R3-01 hex pre/post lines.
- Dojo themes + badge names come from the rows (R3: Core / Strike /
  Chrome / Flame / Beast / Aero / Mythic / Water; R4: Core / Flora /
  Umbral / Strike / Water / Chrome / Water-ice / Chrome; R5: Beast /
  Flame / Chrome / Strike / Core / Aero / Water-ice / Mythic).

## 5. Dialogue-only slots (owed, not silently filled)

- 24/24 dojo leaders: NAME GAP, present + dialogued (dojo pre lines +
  `inkKnot` for the entry's main knot), no battle, no badge award.
  Badge names are recorded in the map comments from the rows.
  Post-battle `_after` knots exist in the compiled stories and trigger
  with the leader battles when they land.
- 12/12 Elite Four + 3/3 Champions (R3-12 / R4-15 / R5-15): NAME GAP,
  dialogue-only, pre lines as dialog, post lines as `postBattleDialog`.
  The plateau NPCs use each entry's OWN elite/champion lines — R2-13's
  blocks are the generic lines, but R3/R4/R5 have region-specific ones
  (fixed while finishing this generator: the draft hardcoded R2's words).
- R5-012 / R5-04 CONFLICT (flagged for Mars): row R5-012 names Hex as
  the Dojo 1 leader, but R5-04 dialogue says the leader is NAME GAP.
  Leader stays dialogue-only; the dojo comment records the conflict.
- R5-003/004 Front Recruits ("Castelia Rally"): no dialogue mapKey —
  left unwired, owed.
- R5-039..044 Tournament rounds + R4-011..013 Battle Zone + R4-014
  Rift Warden: NAME GAP rows → dialogue-only NPCs with PLACEHOLDER
  lines, battles owed.
- R5-047 Mythar: species 331 not in `SPECIES_DB` → no battle NPC;
  the Mythar final map holds the attendant + Prof. Aeon only. The
  R5-17 champion block is Mythar's battle lines, owed with the battle.
- R5-045/046 Tower Climbers (Bright / Umbral Tower, post-game): no
  tower maps exist — left unwired, owed.
- R3-043..046 Frontier Brains: no Frontier Arena battle maps yet —
  left unwired, owed.
- 147/150 (Dorowani/Gabu): provisional Black 2 starter-pattern stats
  (total 308 each) already in `SPECIES_DB`; no new numbers invented here.

## 6. Gates and story transport

- Storm route R2→R3: `r2_frost_peak` gains its north exit to
  `r3_outpost_2f` (plain exit — story flags are not engine gates, R2
  audit §6; the flag `r3_storm_route_open` stays on the Frost Peak
  sign, now reading "open"). The outpost has no south exit back to
  Frost Peak: inter-region links are one-way by design, same as the
  airship and the signal.
- Airship R3→R4: `r3_frontier_arenas` north → `r4_twinleaf` (flag
  `r4_airship_route_open` recorded on the Frontier sign).
- Signal R4→R5: `r4_rift_dungeon` north → `r5_start_city` (flag
  `r5_signal_open` is the story flag; the exit is plain, R2 audit §6).
- Victory Routes: `r3_awakening` → `r3_victory_route` is
  `badges>=24`; `r4_sunyshore` → `r4_victory_route` is `badges>=32`;
  `r5_sunyshore` → `r5_victory_route` is `badges>=40` (8 per region,
  cumulative — R2 precedent: `badges>=16`).
- Sea road R3: `r3_dewford` / `r3_mauville` exits to `r3_sea_route`
  are `hmNeeded: "Wave"` on both shores (R2 sea road precedent).
  Canalave → Snowpoint and Snowpoint → Sunyshore (R4/R5) are direct
  town exits, no route map (R4 audit note, carried to R5).
- Story flags (`r3_storm_route_open`, `r4_airship_route_open`,
  `r5_signal_open`, `r3_hall_third_entry`, etc.) live in the compiled
  Ink stories; WorldEngine exit conditions only understand `badges>=N`
  and techniques, so no exit is gated on a story flag in this PR. A
  story-flag engine is a separate, owed task.

## 7. Stale notes found while wiring (not silently fixed)

- R3-11 / R4-14 / R5-14 beats: "Veteran trainer (talk-to-battle,
  ROSTER GAP team)" — stale. The trainer files HAVE the Veterans
  (R3-010..013, R4-007..010, R5-005..009) with teams, levels, rewards.
  All wire here; the first Veteran on each route carries the beats lines.
- R5-14 has FIVE veterans (R5-005..009); the fifth stands on the route
  centre path at (14, 30), south of the gate keeper.

## 8. TOWN-NAME RULE — 0 new copies added (R2 audit §8, carried over)

The merged Region 3–5 dialogue files (PR #421) use verbatim reference
town/location names as their town names. This PR uses the dialogue
`mapKeys` as the wiring contract (structural identifiers already on
main) but does NOT repeat those names as display names: affected towns
carry a labelled `name GAP FOR MARS` placeholder + the dialogue entry
id, and Mars renames them in one pass (dialogue + maps together).
Mochiichao-original names ARE used as display names: Root Hamlet, The
Awakening, Frontier Arenas, Battle Zone, Rift Dungeon, Start City,
Grand Tournament, Mythar.

## 9. Wild pools

Grounded in trainer-row species + levels, added to
`src/data/core/encounters.json` `worldAreas` (the single source;
`FullWorldMaps` mirrors them at load): 7 tables — `r3-oldale-road`
(013/038/019/022 @60–61), `r3-victory-route` (8 species @74–77, 046
spanning 74–77), `r4-route-1` (041/019/013/022 @78–79),
`r4-floaroma` (038/041/042/035 @80–81), `r4-victory-route` (8 species
@88–91), `r5-route-1` (013/038/019/022 @88–89), `r5-victory-route`
(10 species @96–98). All other R3–R5 maps keep `encounters: []` in
the literal. 038 now reads 4 areas (route-1-grass + the three opening
pools) — `dexAreas.test.ts` updated from the R2 precedent for 147.
Owed pools: all other routes (R3 routes 1–8, R4 routes 2–10, R5 routes
2–10), the sea road, and the preserves — no trainer-row species for
those stretches.

## 10. Verification

- `tests/regions3-5-maps.test.ts` (new, added to `test:tests` in
  `package.json`): 15 tests — key resolution, reachability, gates,
  towns, dead doors, dojo shape, 75 wired rows + Hex mirror, 7 pools,
  48 Ink knots, plateau fold, Grand Tournament, Mythar final. Local
  checks run before upload (no runnable checkout exists — same
  constraint as the R2 audit §11): Python pre-flight below. CI is the
  verifier for the actual vitest run — the test counts above are from
  the pre-flight, not from a test run.
- Pre-flight (Python, before upload):

<function preflight at 0x7a64a84334c0>

## 11. Files in this PR (11: 9 modified, 2 new, 0 deleted)

- `src/world/FullWorldMaps.ts` (modified): 126 map consts + FULL_WORLD
  89 → 215 + `r2_frost_peak` north exit to `r3_outpost_2f` + Frost Peak
  sign updated (storm route now open).
- `src/data/core/encounters.json` (modified): 7 new wild-pool tables.
- `src/data/core/map-battle-bg.json` (modified): 126 new bindings.
- `src/lib/musicPlacement.ts` (modified): 126 new placement rows.
- `src/lib/battleBackground.test.ts` (modified): GOLDEN +126.
- `src/lib/trainer-teams.test.ts` (modified): map parity 53 → 129
  battles, 48 → 123 matched, 5 → 6 unmatched (second 'Hex').
- `src/lib/dexAreas.test.ts` (modified): 038 reads 4 areas.
- `tests/region1-rescue.test.ts` (modified): FULL_WORLD 89 → 215.
- `package.json` (modified): `test:tests` gains
  `tests/regions3-5-maps.test.ts`.
- `tests/regions3-5-maps.test.ts` (new).
- `docs/regions3-5-maps-audit-20261113.md` (new, this file).
