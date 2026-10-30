# Verified 100% Audit — World Builder batches, checked against the actual files

World Builder lane, 2026-10-25, Mars order: look at the
actual Pokemon files, check what we have done so far,
improve it PAST how Pokemon does it, and make sure it
is actually 100% — not guessed, not estimated, not
bullshitted. This audit does that, area by area, with
counts taken from the files themselves on 2026-10-25,
not from a previous report's summary.

Method: read the file, count it, compare it to the
decomp structure (not the decomp text, names, or art),
and mark each claim VERIFIED, PARTIAL, or GUESSED.
A claim that was only in a previous assistant report
and not in a file is marked GUESSED until a file
proves it. No claim in this audit is "100%" unless
its count is in here.

## 1. What was actually verified — with counts

### Trainer teams — VERIFIED data, PARTIAL engine
- Table rows counted in file: 265 = R1 76, R2 53,
  R3 46, R4 43, R5 47. Matches the file's own count.
- JSON appendix parsed back with Python on 2026-10-25:
  265 rows, same region split, species IDs only
  001-046, 147, 148, 331 — 0 bad IDs.
- Level ranges parsed: R1 Lv3-68, R2 Lv10-74,
  R3 Lv60-89, R4 Lv78-100, R5 Lv88-100. Rising in
  play order, capped at 100 — verified, not estimated.
- Dojo leaders: 56 = 40 first-visit (8 x 5 regions)
  + 16 rematches (R1 8, R2 8). Elite Four: 20 = 4 x 5.
  Champion-grade: 7 (Hex, R2 Champion, R2 Frost Peak
  First Champion, R3, R4, R5, Mythar true final).
- AI profiles assigned: 265/265 = 100% in data
  (Type-aware 107, Elite 63, Aggressive 44, Balanced
  23, Defensive 20, Novice 8, per the file's count).
- KEEP rows: 10, REPLACE row: 1 (Falk Sproutle
  placeholder → Aero 019/020/021). Verified against
  FullWorldMaps in the stale work clone.
- ENGINE GAP, NOT DATA GAP: battle-ready in
  species.ts today = 12 species (001-010, 038, 039
  counted in file, 12 entries). 37/49 roster IDs
  = 76% need SPECIES_DB promotion before those
  teams run. 147/148 stats = 0/2 = 0% assigned.
  So: trainer DATA 265/265 = 100%, trainer
  ENGINE 12/49 = 24%. Anyone who says "trainer
  teams 100% done" without that split is bullshitting.
- NAME GAP counted in file: 180 "NAME GAP"
  strings in the trainer file. Teams are done,
  personal names for most dojo leaders, Elite,
  and champions are NOT done. That is a name gap,
  not a team gap — do not hide it in a team %.

### Dialogue — VERIFIED counts, PARTIAL wiring
- Region 1 story file: 339 lines, 8 ROSTER GAP
  slots, 0 NAME GAP strings (leaders Lin/Falk
  already canon there).
- Regions 2-5 dialogue file: 1,489 lines, 62
  entries, 58/58 task towns dialogued = 100% of
  the task list, BUT 88 NAME GAP strings and
  71 ROSTER GAP strings counted in that file.
  So: dialogue LINES 100% of towns, dialogue
  NAMES 0% for non-canon leaders, dialogue
  WIRING 0% — lines are in a goal file, not in
  FULL_WORLD, not in a PR, not playtested.
- Pokemon method, for comparison: dialogue in
  the decomps is not a text list. It is an event
  script: lock, faceplayer, msgbox, flag set,
  warp, battle trigger, in order, with a flag
  that stops it repeating. Our dialogue files
  have lines + a "code slot" note, not the flag
  / trigger / repeat rule per line. That is the
  gap to close — see §3, Ink / event-script
  improvement, which goes PAST Pokemon's
  hand-written scripts.

### Battle engine — VERIFIED in code, with 3 real bugs
Checked in the stale work clone BattleView.tsx,
lines 118-135, not from a report:
- Damage formula IS Pokemon's structure:
  floor(floor(floor(2*Level/5+2)*Power*Atk/Def)/50)+2,
  then type multiplier, STAB 1.5, crit, random
  85-100%. That part is verified, not guessed.
- Crit is 1.5x (modern, Gen 6+), not Gen 3's 2x.
  That is a deliberate modernisation, not a bug.
  Record it, do not "fix" it back to 2x silently.
- Type multiplier: calcTypeMultiplier in
  constants.ts multiplies defender type 1 x type 2,
  with a stage multiplier table -6 to +6 already
  in code (0.25 to 4.0). Verified present.
- Moves: MOVES_DB = 36 moves counted (name:
  count 36), species = 12 counted. NOT ~900,
  NOT 354 (Emerald) — those are reference counts,
  not Mochiichao counts. Anyone quoting 354 as
  Mochiichao's move count is bullshitting.
- BUGS VERIFIED BY v5.2 PLAYTEST (Pages build
  a084b5ff, 2026-10-25, 1h45m, desktop, not phone):
  (1) Wild Mochii damage: player dealt 1, enemy
  dealt 15-18, expected roughly 3-6 — wild
  createMochii path not covered by the v5.2 fix.
  (2) Sproutle PWR- moves (Quick Attack, Vine Lash
  in the playtest UI) produced NO log, NO damage,
  NO HP change — Status moves return damage 0
  in executeDamage, and PWR- display suggests
  those moves are misclassified or unmapped.
  (3) Team panel black screen on Sproutle entry,
  Escape did not restore, reload required.
  (4) Y/N keys fail on Bag prompts (DialogueBox
  handler covers choice dialogues, not Bag prompts).
  (5) Mom heal NOT locatable in Sector 0 in the
  playtest, despite Mom isHeal NPC at (5,7) in
  the stale FullWorldMaps — map / prompt /
  intro-state mismatch, not a dialogue gap.
  (6) Trainer win vs Hex NOT achieved in v5.2.
  These 6 are the real playable % — they are
  0% fixed until v5.3 lands and re-playtests.
- MISSING vs Pokemon, verified by grep in
  BattleView: NO accuracy check (moves have acc
  100/80/85 in MOVES_DB, unused in executeDamage),
  NO speed / turn-order check, NO priority check
  (moves have pri 0/1, unused), NO evasion,
  NO status-effect application (effects like BURN
  10-30% are in MOVES_DB, unused in executeDamage),
  NO PP decrement check in the damage path.
  Pokemon's battle (decomp battle_util, Emerald)
  checks accuracy, priority, speed, and effects
  as separate steps. Our battle is a damage-only
  subset. That is PARTIAL, not 100% — see §3.

### Maps / world — VERIFIED partial
- FullWorldMaps in stale clone: 16 maps counted
  in the earlier audit, 61 "id:" matches (includes
  NPC / event IDs, not just maps — do not quote
  61 as maps). Mainline chain Sector 0 → Lab →
  Route 1.0 → Silicon → Dojo 1 → Binary Woods →
  Dojo 2 → Cave works in file, then Cave is a
  dead end and Neon has no inbound mainline exit
  (Phase A patch, still not applied in a PR).
- Dojos 3-8, Stoneport, Pale, Market, Central,
  Harbor, Ember, Victory, Plateau, Data Isles:
  0/12 groups in FullWorldMaps = 0% in code.
  They are 12/12 laid out in the story file,
  0/12 in the game. Layout % ≠ game %.
- Pokemon method: maps are data (map.json +
  scripts.inc + warps + coord events + object
  events), not a single TS file with hard-coded
  NPCs. Our FULL_WORLD is one TS file — that
  works for 16 maps, it will not scale cleanly
  to 5 regions x ~15 towns each. Improvement
  in §3: Tiled JSON maps-as-data, one file per
  map, validated by script.

### Audio — VERIFIED file, 0% wired
- audio-system.ts: 609 lines counted, functions
  playScene, startBattle, endBattle, playVictoryJingle,
  setMaster/Music/Sfx, toggleMute, registerFile
  all present by grep. Type-checked clean by
  the subagent with repo tsc — that check was
  reported, not re-run here (stale clone tsc
  would not prove main's build).
- Track registry: 49 scene slots, all file:null
  until download. 0/49 loops downloaded = 0%
  music in game. Synth fallback = 100% of the
  code path, 0% of the licensed loops.
- Settings gap: PR #28 (main 011abaf9, per
  background record) may have created a real
  Settings screen — VERIFY in main code before
  claiming audio Settings sliders still blocked.
  Do not repeat the old "no Settings screen"
  claim without that check.

### 2026 research — VERIFIED research, 0% wired
- state-of-art-2026-research.md: 813 lines,
  12/12 areas, 24/24 checklist steps written,
  0/24 wired. Top 5: PixiJS v8, Zustand +
  IndexedDB, Web Audio, atlas + CI budgets,
  Vitest/Playwright/Lighthouse. That split is
  honest and stays: research 100%, wiring 0%.

## 2. What was GUESSED or ESTIMATED before — now corrected

- "Trainer teams 100% done" → corrected to:
  data 265/265 = 100%, engine 12/49 = 24%,
  names 180 NAME GAP strings still open.
- "Dialogue 100% done" → corrected to:
  towns dialogued 58/58 = 100%, names
  88 NAME GAP, teams 71 ROSTER GAP, wiring 0%.
- "Audio 100% done" → corrected to:
  code 11/11 functions = 100%, loops 0/49 = 0%,
  wiring 0/6 steps = 0%.
- "Playable 100%" → corrected to: v5.2
  playtest WIN was wild only, trainer win
  NOT achieved, 6 bugs above open, phone
  portrait NOT tested. Playable = NOT 100%.
- "Moves ~900 / 354" → corrected to:
  Mochiichao MOVES_DB = 36, species = 12.
  Reference counts are not game counts.
- "61 maps" → corrected to: 16 maps in
  FULL_WORLD, 61 id: matches include NPCs.

## 3. Improvements PAST Pokemon — open source, wired in order

These are not "do Pokemon again". They are
Pokemon's method, then one step better, with
an open-source tool that does it cleaner.

1. BATTLE — accuracy / speed / priority / effects,
   PAST Pokemon's hand-rolled battle_util.
   - Pokemon: accuracy roll, priority bracket,
     speed order, effect chance, all in C, per
     move, hard to test in isolation.
   - Improvement: extract executeDamage into a
     pure, tested battle-math module (no React,
     no random in the core — inject a seedable
     RNG), with unit tests per case: accuracy
     miss, priority win, speed tie, STAB, type
     0x/0.5x/2x, crit, status effect chance.
     Open-source pattern: Pokemon Showdown's
     battle engine is the reference for how a
     tested, data-driven battle works — use its
     STRUCTURE (move data + battle state machine),
     not its data or code. Test with Vitest
     (already in the 2026 checklist).
   - Fix first, in this order: (a) wild Mochii
     damage path, (b) Sproutle PWR- moves
     (classify every move: Physical / Special /
     Status, with a power or a status effect —
     no move with PWR- and no effect), (c)
     accuracy + priority + speed order, (d)
     status effects (BURN etc. from MOVES_DB).
   - Acceptance: wild Mochii damage 3-6 in
     re-playtest, Sproutle moves all act, Hex
     trainer win achievable at Lv5-6 with a
     normally trained team.

2. DIALOGUE — Ink / inkjs, PAST Pokemon's
   scripts.inc.
   - Pokemon: linear scripts, flags, msgbox,
     hard to author at 5-region scale.
   - Improvement: Inkle Ink, MIT, inkjs for
     web (search-verified: Ink MIT, inkjs JS
     engine, Inky editor, used by 80 Days /
     Heaven's Vault). Convert each dialogue
     file's lines into Ink knots with variables
     (flags, badges, items), choices, and
     conditions — then a script check that
     every knot has an exit, every flag set
     is read somewhere, and no line repeats
     after its flag. That check is what makes
     dialogue "100%" — not a line count.
   - Do NOT convert by hand-editing FULL_WORLD
     dialogue arrays in place; convert to
     .ink files, compile to JSON, load at runtime.

3. MAPS — Tiled JSON, PAST Pokemon's map.json
   + scripts.inc split.
   - Pokemon: map data + script data in
     separate files, warps + coord events
     as tables — good structure, bad tooling
     for a web team.
   - Improvement: Tiled Map Editor, open source,
     JSON export (TMJ), one file per map, with
     layers (ground, objects, triggers, warps),
     custom properties (gate flag, tech, badge),
     and a script validator: every exit has a
     return exit, every gate names its flag,
     every town has heal + shop + sign, every
     map has a wild pool or a "no wild" note.
     That validator is the 100% gate for maps.
   - Kenney Tiny Town / Tiny City CC0 + 0x72
     CC0 tiles stay as the tile source, restyled.

4. AUDIO — sequenced music + Web Audio manager,
   PAST Pokemon's loop-only playback.
   - Pokemon: sequenced tunes, per-scene, with
     battle override and victory jingle.
   - Improvement: keep the delivered
     audio-system.ts (loops + crossfade +
     battle override), ADD a Tone.js-style
     step sequencer for victory / badge /
     level-up jingles as DATA (notes + timing),
     not as audio files — so jingles work
     with zero downloads and are testable.
     Loops stay CC0-first (hyperpixel,
     Tallbeard), credit-required only with
     credits added and licences re-checked.
   - Acceptance: 8-point audio checklist
     from the track map, plus Settings screen
     check (PR #28) before claiming sliders.

5. SAVE / STATE — IndexedDB + Zustand, PAST
   Pokemon's cartridge save.
   - Pokemon: one save, fixed slots, no export.
   - Improvement: IndexedDB versioned save
     (already in 2026 checklist #2), with
     backup slot, export/import, migration
     tests — so a five-region save cannot be
     eaten by a bad PR. That is the improvement
     that makes "100% playable" survivable.

6. QA — Playwright + Vitest gates, PAST
   Pokemon's manual playtest.
   - v5.2 playtest was manual, desktop only,
     phone NOT tested, 6 bugs found by hand.
   - Improvement: Playwright E2E gates for
     NEW GAME → Dojo 1, save/load, battle
     win/loss, Mom heal, Team panel, Bag Y/N
     keys — phone 390x844 + desktop, in CI.
     A gate that fails blocks the PR. That is
     how "100%" stops being a claim and
     becomes a test result.

## 4. What is NOT done — with real %

- Maps in game: 16/16 existing = 100% of old,
  0/12 new mainline groups = 0% of Phase B.
- Dojos in game: 2/40 first-visit = 5%
  (Lin, Falk — Falk team still placeholder
  in stale clone, REPLACE row pending).
- Elite / Champion in game: 0/27 = 0%
  (20 Elite + 7 champion-grade, all data only).
- Species battle-ready: 12/49 = 24%.
- Moves: 36/36 in MOVES_DB = 100% of that
  file, 36/~900 if the target is Pokemon-scale
  = 4% — do NOT quote 4% as a failure, quote
  it as "36 moves, target to be set by Mars".
- Audio loops: 0/49 = 0%. Audio code: 11/11
  functions = 100% in file, 0/6 wiring steps.
- Dialogue wiring: 0/58 towns in FULL_WORLD
  from the new dialogue files = 0%.
- Trainer wiring: 10/265 KEEP already in game
  = 4%, 255/265 new rows = 0% wired.
- v5.2 bugs fixed: 0/6 = 0% until v5.3
  lands and re-playtests (wild Mochii, PWR-,
  Team black screen, Bag Y/N, Mom heal,
  Hex trainer win).
- Research wiring: 0/24 checklist = 0%.
- Playable deployable: NOT 100%. Build
  + Pages deploy + playtest gates must pass
  from latest main 011abaf9 (per background
  record), NOT from the stale a084b5ff build,
  NOT from this lane's stale clone.

## 5. Next wiring order — no guessing, in this order

1. v5.3 bug fixes (wild Mochii, PWR-, Team
   panel, Bag Y/N, Mom heal findability,
   Mend Patch fainted spec/code reconcile).
2. Battle-math extraction + accuracy / priority /
   speed / effects + Vitest tests.
3. Truck start + Phase A + Phase B maps, as
   Tiled JSON, validated by script.
4. Dialogue Ink conversion, validated by script.
5. Trainer teams wiring, after SPECIES_DB
   promotion + 147/148 stats.
6. Audio wiring + Settings screen check.
7. 2026 checklist in impact order.
8. Playwright gates + Pages rebuild from
   latest main + phone + desktop re-playtest.
   Only then: "playable" — with PR numbers,
   build result, deploy URL, and pass/fail
   by named step.
