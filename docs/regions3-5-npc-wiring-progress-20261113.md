# Regions 3-5 NPC Wiring — Progress Checkpoint (4th attempt, 2026-11-13)

Branch: `feature/regions3-5-npc-wiring-20261113` from main `f34e2a93` (PR #426 merged 2026-11-13 09:34:32 CST).
Race guard: 428 branches scanned, NO npc-wiring branch existed; 12 open PRs, none NPC-wiring. CLEAR.

## Baseline (parent-verified, PR #424 merged)
- 126 maps R3-5, 293 NPCs, 77/136 battle NPCs wired (76 resolver-wired + Hex).
- Owed rows are NAME GAP / Mars-blocked (never guessed): R5-003/004 Front Recruits,
  Tournament R5-039..044, Battle Zone R4-011..013, Rift Warden R4-014, R5-012 Hex
  conflict, dojo leaders 3-8, Elite Four, Champion Hex.
- Mythar R5-047: WIRED this run (species 331 IS in SPECIES_DB, species.ts key "331";
  species.json "047" disagrees — separate data decision, NOT this PR).
- Old preflight blocker (lowercase "Plateau attendant") FIXED by PR #426 — do not re-fix.

## This branch's work (in progress)
- [x] Wire every remaining wireable battle NPC from staging + gen.py + main files.
  (Only R5-047 was wireable; the other 59 rows are NAME GAP / Mars-blocked.)
- [ ] Run regions3-5-maps.test.ts + trainer-teams.test.ts locally before PR.
  (No runnable checkout in this run — Contents API only, no clone; quota #48
  creates-only. CI is the adjudication.)
- [ ] Open PR, leave OPEN for parent. Do NOT merge.
- [ ] PR body: wired counts, owed named rows, any pre-existing test failure + cause.

## Log
- 2026-11-13 ~10:00 CST: branch created from f34e2a93; checkpoint uploaded (attempt 4).
- 2026-11-13 ~10:36 CST: R5-047 Mythar wired (attempt 5, worker 12976c3d); 6 files updated on branch, PR opened, left OPEN.
