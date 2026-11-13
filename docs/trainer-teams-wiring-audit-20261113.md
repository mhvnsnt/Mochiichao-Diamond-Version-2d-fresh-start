# Trainer-teams wiring audit — 2026-11-13

Worker audit against main `7baafb42` (PR #421 merge). The 2026-10-25 audit premise is stale:
trainer-teams wiring (step f) is already done on main except the five stale status flags
re-marked by this PR. No team, level, reward, name, or stat was invented here.

## What is done (verified this run, counts behind every claim)

- **SPECIES_DB promotion: 49/49 = 100%.** `src/lib/species.ts` holds 001–046 complete
  (0 missing) + 147 Dorowani + 150 Gabu + 331 Mythar. The 2026-10-25 audit counted
  12/49 = 24%; lane f promoted the other 37 on 2026-10-27 from `global_roster.json`
  (47 entries). 148 does not exist — Gabu is 150 by Mars's ruling (locked 2026-10-28).
- **147/150 stats: 2/2 assigned, provisional.** Dorowani 55/55/45/63/45/45 and Gabu
  65/63/45/45/45/45 (total 308 each) are Black 2 first-stage starter-pattern fills,
  NOT Mars-approved numbers. The four rows using them (R2-001..R2-004) stay flagged
  `statsHeld` until Mars gives numbers. Gabu's NORMAL type is an absence-of-type
  default, not a canon claim.
- **Trainer rows: 265/265 = 100%** (R1 76, R2 53, R3 46, R4 43, R5 47). Every row
  species exists in SPECIES_DB (0 missing); distinct species used = 49/49.
  Levels 3–100, cap respected. `trainerTeams.ts` agrees with the region files
  except the locked R1-035 drift (Lin 039→040 Dreadtoise, roster-wins override).
- **Resolver live in the engine.** `WorldEngine.tsx` `triggerTrainerBattle` calls
  `resolveTrainerRow` (`trainer-teams-resolver.ts`). Test locks: 265 rows load,
  16 single-candidate names resolve, Acolyte Gale tie-breaks, bosses and
  `[NAME GAP]` rows never resolve, every row converts to buildable map members,
  17/22 unique map battles wire, 5 keep hand-built boss teams
  (Hex, Junk Warlord Krix, Luigi ×2, Champion MYTHAR).
- **Dialogue mappings: 179/179 resolve.** All distinct team ids referenced by the
  Regions 2–5 `.ink` stories (184 refs) exist in the 265 rows (0 missing).

## What this PR changes

Five Region 1 rows marked NEW whose NPCs are in `FullWorldMaps.ts` live map battles
(locked by the map-parity test's matched-17 list): R1-005 Bug Catcher Mira,
R1-006 Woods Walker Tess, R1-010 Miner Cleff, R1-011 Cave Runner Pike,
R1-037 Acolyte Skye. Status NEW → KEEP, with a note on each row. The resolver
header (2026-10-27) called this status stale and invited the data lane to
re-mark them. Teams and rewards are unchanged, locked by a new test.
After the re-mark: Region 1 KEEP 15/76 = 20%, NEW 60/76 = 79%, REPLACE 1/76 = 1%.

## What remains — labelled, never silently decided

- **16 TRAINER_GAPS, 0/16 fillable from verified data.** R2-04, R3-03, R3-05, R3-06,
  R3-08, R3-10, R4-01, R4-03, R4-06, R4-08, R5-02, R5-05, R5-08, R5-09, R5-10, R5-16
  carry no team id anywhere — only `// trainer GAP:` comments in the `.ink` files
  and `team: "ROSTER GAP"` in the dialogue JSONs. No team data for them exists in the
  265-row table, the goal file, or the dialogue sources. Filling them would invent
  members/levels. Mars must supply teams or approve leaving them.
- **NAME GAP: 89/265 rows = 34%** (R1 17, R2 22, R3 15, R4 17, R5 18). Names, not teams.
  Mars's call; never invented.
- **147/150 stats** provisional (see above); Mars's numbers owed.
- **AI profiles** (Novice/Balanced/Type-aware/Defensive/Aggressive/Elite) are not
  consumed by battle yet — enemy move choice is still random. Separate task.
- **FLYING → "Aero" display gap** (6 members): deferred to a display-name pass by
  the resolver header, not this PR.
- **Regions 2–5 maps/NPC wiring** is a separate owed step — the maps do not exist
  in `FULL_WORLD` yet, so no Region 2–5 status re-mark is possible.
- Slots 047–146 untouched. No Pokémon dialogue/town/character/species names copied.

## Gate

Vitest subset `src/lib/trainer-teams.test.ts` 17/17 + `tsc --noEmit` clean in the
`/tmp/ttgate` closure gate (files fetched from main via Contents API); full
build/lint via CI on this PR (precedent #418).
