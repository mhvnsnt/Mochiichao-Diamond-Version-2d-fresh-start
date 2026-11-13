# Regions 2–5 Maps Audit — Region 2 Skeleton Shipped, Regions 3–5 Owed

2026-11-13, regions2-5-maps PR (branch `feature/regions2-5-maps-npc-20261113`,
base main `d453c7cb`). Audit source: `src/lib/wiring/dialogue/regionN-dialogue.json`
(merged in PR #421) + `src/lib/trainers-regionN.ts` + `FULL_WORLD` on main
(`src/world/FullWorldMaps.ts`, 46 maps, all Region 1).

## 1. What the dialogue references vs what exists

| Region | Entries | Dialogue mapKeys | Keys with a map on main | Keys wired by this PR |
|---|---|---|---|---|
| 2 — Twin / Return | 14 | 38 | 0/38 = 0% | 38/38 = 100% (32 direct + 6 folded into `r2_plateau`) |
| 3 — Sea / Land | 15 | 36 | 0/36 = 0% | 0/36 = 0% — owed |
| 4 — Rift | 16 | 39 | 0/39 = 0% | 0/39 = 0% — owed |
| 5 — New Continent | 17 | 36 | 0/36 = 0% | 0/36 = 0% — owed |
| **Total** | **62** | **149** | **0/149 = 0%** | **38/149 = 26%** |

Region 2's 38 keys resolve to 43 physical maps: 32 keys map 1:1, the 6
Plateau keys (`r2_elite_1..4`, `r2_champion`, `r2_hall`) fold into one
`r2_plateau` map (R1 `mainframe_plateau` precedent: one map, 5 battle
slots, Hall of Records as a flag, not a map), and 11 new keys are added
that the dialogue does not name but the skeleton requires — 9 route maps
(`r2_route_1..9`, one per town-to-town link, R1 `route_1/2/3` pattern),
`r2_sea_road` (Olivine–Cianwood Wave-Ride crossing), and
`r2_mochiiplex_dawnfield` (Dawnfield interior). `region2_arrival` (the
R1 stub) gains its north exit to `r2_dawnfield`.

## 2. Region 2 slice shipped (43 maps)

Play order: `region2_arrival` → `r2_dawnfield` → `r2_route_1` →
`r2_cherryport` → `r2_route_2` → `r2_violet` (+ `r2_tower`, `r2_dojo_1`) →
`r2_route_3` → `r2_azalea` (+ `r2_well`, `r2_dojo_2`) → `r2_route_4` →
`r2_ilex_forest` (+ `r2_shrine`) → `r2_route_5` → `r2_goldenrod` (+
`r2_radio_tower`, `r2_garden_branch`, `r2_dojo_3`) → `r2_route_6` →
`r2_ecruteak` (+ `r2_burned_tower`, `r2_dojo_4`) → `r2_route_7` →
`r2_olivine` (+ `r2_lighthouse`, `r2_dojo_5`) → `r2_sea_road` →
`r2_cianwood` (+ `r2_dojo_6`) → `r2_route_8` → `r2_mahogany` (+
`r2_lake`, `r2_hideout`, `r2_dojo_7`) → `r2_route_9` → `r2_blackthorn`
(+ `r2_den`, `r2_dojo_8`) → `r2_victory_route` → `r2_plateau` →
`r2_frost_peak`.

Per-map check (all 43): entry + exit, every exit/door target exists,
every gate names its requirement, no dead door — pinned by
`tests/regions2-maps.test.ts`.

## 3. Towns — heal + shop + sign + NPC

| Town | Heal | Shop | Sign | Non-battle NPC | Dojo door |
|---|---|---|---|---|---|
| Dawnfield (R2-01) | MochiiPlex interior | MochiiPlex interior | yes | Ferry Captain, Researcher | — (arrival, no dojo) |
| Cherryport (R2-02) | inline nurse | inline clerk | yes | Road Keeper, Fisher | — |
| Dojo 1 town (R2-03) | inline nurse | inline clerk | yes (GAP name) | Town Elder | Dojo 1 |
| Dojo 2 town (R2-04) | inline nurse | inline clerk | yes (GAP name) | Well Keeper is in the well | Dojo 2 |
| Forest (R2-05) | — (not a town) | — | yes | Shrine Keeper, Wanderer | — |
| Dojo 3 city (R2-06) | inline nurse | inline clerk | yes (GAP name) | Market Clerk | Dojo 3 |
| Dojo 4 town (R2-07) | inline nurse | inline clerk | yes (GAP name) | Town Elder | Dojo 4 |
| Dojo 5 town (R2-08) | inline nurse | inline clerk | yes (GAP name) | Harbour Keeper | Dojo 5 |
| Dojo 6 town (R2-09) | inline nurse | inline clerk | yes (GAP name) | Medicine Keeper | Dojo 6 |
| Dojo 7 town (R2-10) | inline nurse | inline clerk | yes (GAP name) | Lake Watcher is at the lake | Dojo 7 |
| Dojo 8 town (R2-11) | inline nurse | inline clerk | yes (GAP name) | Den Elder is in the den | Dojo 8 |

10/10 towns have heal + shop + sign + a non-battle NPC. Inline
nurse/clerk follow the Stoneport precedent (`Nurse Faye`, inline
`isHeal`); only Dawnfield gets a full MochiiPlex interior
(`MOCHIIPLEX_1` pattern). A per-town interior pass can replace the
inline NPCs later without changing exits — the doors would be new,
the maps already exist.

## 4. Trainers wired from rows (nothing invented)

`trainers-region2.ts` has 53 rows (R2-001..053). This PR wires 31/53 =
58% as battle NPCs; the rest are dialogue-only slots (see §5).

- Route / area trainers, 15/15: R2-001/002 (Dawnfield Route), R2-003/004
  (Cherryport Route), R2-005/006 (Ilex Forest), R2-007/008 (Radio Tower),
  R2-009 (Lake), R2-010/011 (Hideout), R2-012..015 (Victory Route).
- Dojo acolytes, 16/16: 2 per dojo, R2-016/017 (Flora), R2-019/020 (Bug),
  R2-022/023 (Chrome), R2-025/026 (Umbral), R2-028/029 (Water),
  R2-031/032 (Strike), R2-034/035 (Flame), R2-037/038 (Mythic).
- Inline teams mirror the row (species + levels); the resolver swaps in
  the row team at battle time (`trainer-teams-resolver.ts`). Inline stats
  are the species' `SPECIES_DB` base stats, moves are `BASIC_MOVES`
  (Tackle + Swift Movement). Trainer dialog lines are NOT in the trainer
  file: each battle NPC carries one labelled placeholder line
  (`PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-xxx)`).
  Exception: Victory Taro carries the R2-12 beats veteran lines, because
  the beats entry's "ROSTER GAP team" note is stale — the trainer file
  HAS the four Veterans (see §7).
- Dojo themes + badge names come from the rows: Flora / Bug / Chrome /
  Umbral / Water / Strike / Flame / Mythic; Flora Fragment, Bug
  Fragment, Chrome Fragment, Umbral Fragment, Water Fragment, Strike
  Fragment, Flame Fragment, Mythic Fragment.

## 5. Dialogue-only slots (owed, not silently filled)

- 8/8 dojo leaders: NAME GAP, present + dialogued (dojo pre lines +
  `inkKnot` for the entry's main knot), no battle, no badge award.
  Badge names are recorded in the map comments from the rows.
  Post-battle `_after` knots exist in the compiled stories and trigger
  with the leader battles when they land.
- 4/4 Elite Four + 1/1 Champion (R2-13): NAME GAP, dialogue-only,
  pre lines as dialog, post lines as `postBattleDialog`.
- 1/1 First Champion (R2-14): R2-053 row exists but its name is
  `[NAME GAP: Frost Peak]`, so the resolver never matches it — dialogue-only.
- 3/3 Syndicate antagonists (well, tower lobby, hideout leader): lines
  exist, no trainer row — dialogue-only, battles owed.
- 147/150 (Dorowani/Gabu): provisional Black 2 starter-pattern stats
  (total 308 each) already in `SPECIES_DB`; rows R2-001..004 stay flagged
  `statsHeld` until Mars gives numbers. No new numbers invented here.

## 6. Gates and story transport

- Data Ferry R1→R2: `data_isle_7` → `region2_arrival` (exists) →
  `r2_dawnfield` (new exit in this PR).
- Victory Route: `r2_blackthorn` north exit `condition: "badges>=16"`
  (8 Region 1 + 8 Region 2; the count is global, so the region's 8 is 16
  — R1 precedent: `binary_fields` → `victory_route` is `badges>=8`).
  No badge-count conditions on dojo doors: the player already holds 8
  R1 badges on arrival, so a count gate would be vacuous; progression
  is the route order itself.
- Sea road R2→R3 link: `r2_sea_road` exits are `hmNeeded: "Wave"` on
  both shores (boot_bay precedent). The lake has a causeway and no Wave
  gate — the Wave crossing is the sea road, not the lake shore.
- Storm sea R2→R3: `r2_frost_peak` has no onward exit — no Region 3
  map exists yet. Flag `r3_storm_route_open` is recorded on the Frost
  Peak sign; the link is owed by the Region 3 pass.
- Story flags (`r2_arrived`, `r2_badge_gate_step_N`, `r2_hall_second_entry`,
  etc.) live in the compiled Ink stories; WorldEngine exit conditions
  only understand `badges>=N` and techniques, so no exit is gated on a
  story flag in this PR. A story-flag engine is a separate, owed task.

## 7. Stale notes found while wiring (not silently fixed)

- R2-12 beats: "Veteran trainer (talk-to-battle, ROSTER GAP team)" —
  stale. The trainer file has R2-012..015 (Taro, Iska, Ruel, Miri) with
  teams, levels, rewards. All four wire here; Taro carries the beats lines.
- R2-03 elder fallback: the beats line "Violet is old. …" contains the
  town name (see §8). The live ink knot plays the full line; the NPC's
  plain-dialog fallback uses only the second sentence, so the map file
  adds no new copy of the name.

## 8. TOWN-NAME CONFLICT — flagged for Mars, 0 new copies added

The merged Region 2–5 dialogue files (PR #421) use verbatim Pokemon
town/location names as their town names. This PR uses the dialogue
`mapKeys` as the wiring contract (they are structural identifiers already
on main) but does NOT repeat those names as display names: affected
towns carry a labelled `name GAP FOR MARS` placeholder + the dialogue
entry id, and Mars renames them in one pass (dialogue + maps together).

Counts of verbatim Pokemon town/location names in the merged dialogue
files (town field per entry; R4/R5 reuse the same Sinnoh set):

| Region | Names in dialogue | Display names added by this PR |
|---|---|---|
| 2 | 9 (8 towns + Ilex Forest) | 0 — Dawnfield + Cherryport only (Mochiichao-original) |
| 3 | 9 (8 towns + Oldale) | 0 — owed with the R3 pass |
| 4 | 13 (Sinnoh set) | 0 — owed with the R4 pass |
| 5 | 13 (same Sinnoh set) | 0 — owed with the R5 pass |
| **Total** | **44 references, 31 distinct** | **0** |

Only 3/62 dialogue entries have an NPC line containing a town name
(R2-01 Dawnfield, R2-02 Cherryport — both original — and R2-03, handled
in §7). The `mapKeys` themselves (`r2_violet`, `r3_rustboro`, …) are
kept verbatim because the compiled Ink stories and the dialogue JSONs
already reference them; renaming a key means renaming it in the dialogue
JSONs, the `.ink`, the compiled `.json`, and the maps together.

## 9. Wild pools

Grounded in trainer-row species + levels, added to
`src/data/core/encounters.json` `worldAreas` (the single source;
`FullWorldMaps` mirrors them at load): 5 tables — `r2_route_1`
(147/150/016 @10–11), `r2_route_2` (041/147/019/150 @12–13),
`r2_ilex_forest` (017/041/042/018 @20–21), `r2_lake` surf (028/024 @44),
`r2_victory_route` (8 species @56–59). All other R2 maps keep
`encounters: []` in the literal (ROUTE_2 precedent: pool owed, not
invented). Owed pools: routes R2-3..R2-9 (7) + sea road (1) = 8.

## 10. What remains — Regions 3–5 (exact counts)

| Region | Dialogue keys owed | Trainer rows (for scale) | Physical maps owed (est.) |
|---|---|---|---|
| 3 — Sea / Land | 36/36 = 100% | 46 rows (R3-001..046), 31 NAME GAP | ~41 (36 keys, 6 fold into plateau, +9 routes, +1 sea route, +1 MochiiPlex) |
| 4 — Rift | 39/39 = 100% | 43 rows (R4-001..043), 35 NAME GAP | ~44 (39 keys, 6 fold, +10 routes, +1 MochiiPlex) |
| 5 — New Continent | 36/36 = 100% | 47 rows (R5-001..047), 37 NAME GAP | ~41 (36 keys, 6 fold, +10 routes, +1 MochiiPlex) |
| **Total owed** | **111/149 = 74%** | **136 rows** | **~126 maps** |

Region 3 notes for the next pass: Template L chapter opening
(`r3_outpost_2f`, `r3_outpost_1f`, `r3_root_hamlet`, `r3_lab` — main
team NOT wiped, additional partner starter, Hex lab battle); canon
dojo order is R3-09b Mossdeep (Dojo 7) before R3-09 Crater City (Dojo 8);
R3-09a Lilycove hideout has no dojo; the airship link to Region 4 is
`r3_frontier_arenas` (flag `r4_airship_route_open`). Region 4: airship
arrival `r4_twinleaf`; Region 5: portal-train arrival `r5_start_city`
+ Grand Tournament + Mythar final (`r5_mythar_final`).

## 11. Verification

- `tests/regions2-maps.test.ts` (new, added to `test:tests` in
  `package.json`): 14 tests — key resolution, reachability, gates,
  towns, dead doors, dojo shape, 31 wired rows, 5 pools, 14 Ink knots,
  plateau fold. Local checks run before upload (no runnable checkout
  exists — the work clone is at Oct 2026 HEAD and has no node_modules,
  so a full local vitest run was not possible): (a) `tsc --noEmit
  --noResolve` syntax check on both TS files — clean except expected
  module-resolution errors (files are not in repo layout here; CI
  resolves them); one real type error was found and fixed this way
  (the `byDisplay` Map needed an explicit `[string, TrainerTeam]`
  tuple type). (b) Python pre-flight: all 43 maps' exits/doors resolve
  to `FULL_WORLD` keys, all `enterAt` coordinates are inside the target
  map's bounds, all battle species exist in `SPECIES_DB`, all 22
  referenced Ink knots exist in `region2-story.ink`, all 38 dialogue
  keys resolve, `encounters.json` parses, no file deleted. CI is the
  verifier for the actual vitest run — the test counts above are from
  the pre-flight, not from a test run.
- Pre-flight (Python, before upload): all 43 maps' exits/doors resolve
  to `FULL_WORLD` keys, all `enterAt` coordinates are inside the target
  map's bounds, all battle species exist in `SPECIES_DB`, all 22
  referenced Ink knots exist in `region2-story.ink`, all 38 dialogue
  keys resolve, `encounters.json` parses, no file deleted (5 files:
  2 modified, 3 new — see the PR).
