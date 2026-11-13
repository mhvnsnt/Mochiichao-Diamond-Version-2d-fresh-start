# Regions 3-5 NPC Wiring — Progress Checkpoint (4th attempt, 2026-11-13)

Branch: `feature/regions3-5-npc-wiring-20261113` from main `f34e2a93` (PR #426 merged 2026-11-13 09:34:32 CST).
Race guard: 428 branches scanned, NO npc-wiring branch existed; 12 open PRs, none NPC-wiring. CLEAR.

## Baseline (parent-verified, PR #424 merged)
- 126 maps R3-5, 293 NPCs, 76/136 battle NPCs wired.
- Owed rows are NAME GAP / Mars-blocked (never guessed): R5-003/004 Front Recruits,
  Tournament R5-039..044, Battle Zone R4-011..013, Rift Warden R4-014, Mythar R5-047
  (species 331 not in SPECIES_DB), R5-012 Hex conflict, dojo leaders 3-8, Elite Four,
  Champion Hex.
- Old preflight blocker (lowercase "Plateau attendant") FIXED by PR #426 — do not re-fix.

## This branch's work (in progress)
- [ ] Wire every remaining wireable battle NPC from staging + gen.py + main files.
- [ ] Run regions3-5-maps.test.ts + trainer-teams.test.ts locally before PR.
- [ ] Open PR, leave OPEN for parent. Do NOT merge.
- [ ] PR body: wired counts, owed named rows, any pre-existing test failure + cause.

## Log
- 2026-11-13 ~10:00 CST: branch created from f34e2a93; checkpoint uploaded (attempt 4).
