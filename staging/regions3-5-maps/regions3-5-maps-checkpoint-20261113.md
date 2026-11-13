# Regions 3-5 Maps + NPC Wiring — Checkpoint 2026-11-13

Branch: feature/regions3-5-maps-20261113 (to be created from main cd4088f1).
Base main: cd4088f15bb22d5207b817121a4e4c7e4fa7af4c (PR #423 merged 05:52:38 CST).
Quota: HOME CREATES BLOCKED since ~06:00 CST (QUOTA #46, creates fail, appends OK, /tmp OK).
Staging lives in /tmp/r35/ (generator + fetched main files); the GitHub branch is the
durable checkpoint — upload early, do not rely on /tmp surviving.

## Scope (following PR #423 Region 2 pattern, audit docs/regions2-5-maps-audit-20261113.md)
- 126 new maps: R3 41 + R4 44 + R5 41. FULL_WORLD 89 -> 215.
- Dialogue keys: R3 37, R4 39, R5 36 = 112 keys; 18 fold into the 3 plateaus (6 each).
  Physical from keys: R3 31, R4 33, R5 30 = 94; + routes R3 8 / R4 10 / R5 10 = 28;
  + sea route R3 1; + mochiiplex R3/R4/R5 1 each = 3. Total 94+28+1+3 = 126.
- Wired battle NPCs: 76 (R3 27, R4 26, R5 23). Trainer-teams battles 53 -> 129.
- Grounded wild pools: 7 new tables in encounters.json.
- Files: FullWorldMaps.ts (mod), encounters.json (mod), map-battle-bg.json (mod),
  musicPlacement.ts (mod), battleBackground.test.ts (mod, GOLDEN +126),
  trainer-teams.test.ts (mod, 53->129, matched +75, unmatched gains 2nd 'Hex'),
  dexAreas.test.ts (mod, 038 gains 3 new areas), region1-rescue.test.ts (mod, 89->215),
  package.json (mod, add tests/regions3-5-maps.test.ts to test:tests),
  tests/regions3-5-maps.test.ts (new), docs/regions3-5-maps-audit-20261113.md (new).

## Decisions (recorded, not silently made)
- Dojo leaders / Elite / Champion: dialogue-only (NAME GAP), R2 precedent — even
  though rows exist. R5-012 Hex-as-Dojo-1-leader row CONFLICTS with R5-04 dialogue
  NAME GAP: left dialogue-only, flagged for Mars.
- R3-001 Hex lab battle: wired as battle NPC named "Hex" (not "Hex lab-exit battle");
  inline team mirrors the row exactly, so the resolver non-match is cosmetic.
  trainer-teams.test.ts unmatched gains a second 'Hex' (R1 hand-built + R3 row mirror).
- R5-003/004 Front Recruits ("Castelia Rally"): NO dialogue mapKey — left unwired, owed.
- R5-039..044 Tournament rounds + R4-011..013 Battle Zone + R4-014 Rift Warden:
  NAME GAP rows -> dialogue-only NPCs with PLACEHOLDER lines, battles owed.
- R5-047 Mythar: species 331 not in SPECIES_DB -> no battle NPC; attendant + Aeon only.
- R3-09a hideout: 2 wired (Terra/Marina) + 2 leaders dialogue-only + 2 operatives dialogue.
- Victory gates: R3 badges>=24 (on awakening->victory_route), R4 badges>=32,
  R5 badges>=40 (on sunyshore->victory_route).
- Links: r2_frost_peak north -> r3_outpost_2f (storm route, flag r3_storm_route_open);
  r3_frontier_arenas north -> r4_twinleaf (airship, flag r4_airship_route_open);
  r4_rift_dungeon north -> r5_start_city (signal, flag r5_signal_open).
- R3 sea route: dewford east edge <-> mauville west edge, Wave-gated both shores.
- R4/R5 canalave->snowpoint and snowpoint->sunyshore are direct town exits (no route map).
- R3 oldale road, R4 floaroma, R5 route 1 pools include species 038 -> dexAreas.test.ts
  038 expectation updated (R2 precedent for 147 in PR #423).
- root_hamlet gets a placeholder town NPC (no town-map NPC in R3-01 dialogue; the
  town test needs a non-battle NPC in the map; heal/shop are in the mochiiplex).
- Town display names: reference (Pokemon) town names are NOT repeated (GAP placeholder
  + entry id, R2 audit §8 rule); original names used: Root Hamlet, The Awakening,
  Frontier Arenas, Battle Zone, Rift Dungeon, Start City, Grand Tournament, Mythar.
- Encounters: minLevel=maxLevel=row level; multi-level species span min-max
  (046 in R3 victory: 74-77). R2 route_1's 10-11 range is an unexplained #423 quirk,
  not copied.

## Generator
/tmp/r35/gen.py — reads dialogue JSONs + trainer files + species.ts + ink knots from
/tmp/r35 (fetched from main), emits all file contents to /tmp/r35/out/, runs pre-flight
(exits/doors resolve, enterAt in bounds, battle species in SPECIES_DB, knots resolve,
trainer-teams dedupe simulation = 129, FULL_WORLD = 215, encounters.json parses).

## Resume
1. python3 /tmp/r35/gen.py (regenerates /tmp/r35/out/ + pre-flight report).
2. Upload via Contents API to branch feature/regions3-5-maps-20261113 (see
   /tmp/r35/upload.py, modelled on r25-pr/upload.py), verify blob SHAs.
3. Open PR (leave OPEN), wait for CI guard+playwright+budgets, fix only
   test-expectation drift in own files, report back. Do NOT merge.
4. If quota cleared: cp /tmp/r35/regions3-5-maps-checkpoint-20261113.md to
   ~/workspace/goals/mochiichao-fresh-start-repo/hidden_files/ and stage the
   generator there too.
