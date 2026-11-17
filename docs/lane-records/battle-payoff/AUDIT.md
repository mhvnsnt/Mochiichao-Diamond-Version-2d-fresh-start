# Post-Battle Payoff — Audit & Source Model

Owner playtest report (Jamar, 2026-10-29 ~20:28 CDT): after winning, the game
grants experience and money but shows none of it — no EXP bar filling, no
level-up stat gains, no money-won moment; the battle just ends.
Presentation authority: the presentation-restraint law (AGENTS.md, 2026-10-29)
+ fan-loved build law — show exactly the beats the source games show, in the
source's order, paced by the player's own button presses. Nothing invented.

## 1. What our battle does today (receipts)

### Host A — BattleView (`tree/src/components/views/BattleView.tsx`)
Launched from HubView's random-battle button via App's `BATTLE` view; wild
battles only (enemy built by `createMochii(enemyId, level)`).

- **XP**: `finishTurnQueue` (foe-fainted branch) computes
  `floor(SPECIES_DB[foe].baseExpYield × foeLevel / 5)` and calls
  `engine.gainExp` on the **active member only**, instantly. Presentation =
  two lines in the scrolling log: `"{name} gained {N} EXP!"`,
  `"{name} grew to Level {N}!"`. A multi-level jump collapses into the
  single second line. Stat gains are applied (`gainExp` recalculates) but
  **never shown**. No EXP bar exists anywhere in the UI (the player
  healthbox shows HP only).
- **Money**: `finishVictory` calls `gainWallet(50)` — a flat 50 Credits on
  every win — with the log line `"You found 50 Credits."`, then `VICTORY`
  state auto-exits after 3 s. No player pacing.
- **Capture**: no XP (matches the Gen 5 rule, §2). **Flee / loss**: no XP,
  no money (correct). **Active member also fainted** (recoil): XP skipped,
  documented in the code; kept.
- **Level-up move learning**: `gainExp` never teaches learnset moves;
  moves are only set at creation/evolution. Pre-existing gap, adjacent to
  this sequence in the source (see §2, learn-move states) — flagged in
  LANDING-RECORD as a follow-on, not built here.

### Host B — WorldEngine inline battle (`tree/src/world/WorldEngine.tsx`)
The overworld game: wild battles (`triggerWildBattle`) and trainer battles
(`triggerTrainerBattle`), flat battle state, `doBattleAction` win branches.

- **Wild win**: `xp = (rand 20–49) × foeLevel` is added to the member's
  **`xp` field — a field nothing reads** (store instances track
  `experience`; `gainExp` is never called). Levels and stats therefore
  **never change from overworld play**. Presentation: one log line
  `"Gained {xp} XP!"`, then the VICTORY banner waits for Continue.
- **Trainer win**: `setCredits(c => c + bs.reward)` — money credited
  **silently, no text anywhere**. Per-mon faints grant **no XP at all**;
  the final win grants none either. (Dojo badge line does appear in log.)
- **Catch**: no XP (Gen 5 rule ✓). **Run**: none ✓. **Loss**: blackout,
  wallet halved (pre-existing decomp-derived rule; untouched).
- Party members on the canon path are real store `MochiiInstance`s
  (`initializeStarter` → `createMochii`); WorldEngine spreads them into
  battle copies carrying both `hp` and `currentHp`.

### Shared facts
- Currency: **Credits** (store `wallet`; ShopView "Not enough Credits";
  BattleView "You found 50 Credits."; WorldEngine header shows `{n} CR`).
  No currency symbol is in use anywhere in the game.
- XP curve (engine.ts): medium-fast cubic — total EXP for level L is L³;
  `gainExp` adds EXP, loops levels, recalculates max HP (current HP += the
  max-HP difference) and all five stats via `calculateStat` (IV 15, EV 0).
- Audio (`lib/audio-system.ts`): singleton `audio` with `playSfx(name)`
  (a `'levelup'` synth SFX already exists) and `playVictoryJingle()`
  (SYNTH_PATTERNS.victory). Neither battle host called them at payoff time.

## 2. The source model (held code, read this session)

Primary presentation model = Gen 5 (Pokémon Black — `pokeblack`,
complete matching disassembly, `~/workspace/pokemon-black-decomp/pokeblack/`);
the readable sequencing/compute on disk is Gen 4 C — HeartGold decomp
(`pokemon-code-study/projects/pret-pokeheartgold/`, present in the corpus
with full `src/battle/` C; the task brief said it was never fetched — the
holdings say otherwise, receipts: `src/battle/battle_command.c`,
`include/constants/sndseq.h`). Black's battle sequencing is not decompiled
to readable form in our holdings; where Gen 5 differs from Gen 4 it is
noted from the sound-bank evidence below, and nothing is claimed for Black
code that was not read.

### Compute — `BtlCmd_CalcExpGain` (HGSS `src/battle/battle_command.c:1222`)
- `totalExp = baseExpYield × faintedLevel / 7` (integer division).
- Recipients ("participants") = party members who entered battle against
  that foe (per-foe flag mask), alive (HP > 0), species present.
  Split equally, floor, minimum 1.
- Exp. Share (held item): half the pool split among participants, half
  among holders. **Our game has no held items at all** (`MochiiInstance`
  carries no held-item field) — no Exp. Share is invented; the split is
  participants-only.
- Trainer battles: each recipient's award × 150/100 (applied per mon in
  `Task_GetExp`, START state). Traded/foreign bonuses (×1.5/×1.7, with a
  "boosted" message variant) do not apply — no trading exists in our game.
- Excluded battle types: link / safari / frontier / pal park.
- Prize money (Gen 4 `CalcPrizeMoney`, battle_command.c:2159):
  `level × 4 × prizeMoneyValue × classMultiplier`. Our game already
  carries explicit amounts as data (trainer rows' `reward`;
  BattleView's flat 50) — amounts stay the game's own; only the missing
  **text beat** is ported.

### Sequence — `Task_GetExp` (HGSS battle_command.c:5990), per recipient,
in party order, **per fainted foe** (so trainer battles pay out after
every foe mon, mid-battle, exactly as the source does):
1. `STATE_GET_EXP_START` — if a wild battle and all enemy HP are 0,
   `PlayBGM(SEQ_GS_WIN2)`: the victory music starts *with* the payoff.
   EXP total is committed to the mon's data first; the message prints:
   **"{0} gained {1} Exp. Points!"** (msg_0197_00001). Fainted or Lv.100
   recipients get 0 and are skipped silently — no text.
2. Message-print wait, then a 7-frame beat.
3. `STATE_GET_EXP_GAUGE` — **only the active battler's** EXP gauge
   animates (`BattleController_EmitUpdateExpGauge`); benched recipients'
   awards apply without a gauge sweep.
4. `STATE_GET_EXP_CHECK_LEVEL_UP` — `Pokemon_TryLevelUp` (one level).
   For the active battler: level-up animation + status effect.
5. "{0} grew to Lv. {1}!" (msg_0197_00003) — the message text itself
   carries the control glyph that fires the fanfare:
   `ov12_0223CF14` glyph 5 → `PlayFanfare(SEQ_ME_LVUP)`
   (`src/battle/battle_system.c`, message-printer callback).
   Previous-level stats are cached (`prevLevelStats`) **before**
   `CalcMonStats` runs; HP gauge refreshes.
6. **Level-up summary window**: stat names with **"+N" diffs** (2-digit);
   waits for A/B/X/Y or touch (`PlaySE(SEQ_SE_DP_SELECT)` on press);
   press again → diffs clear, **true values** print (3-digit); press
   again → window closes.
7. Learn-move check (`MonTryLearnMoveOnLevelUp`) — the full
   wants-to-learn / forget flow lives here in the source. (Our engine
   has no level-up move learning at all; flagged, not built — §1.)
8. **Loop back to the GAUGE state** — a multi-level award repeats
   gauge → level-up → summary **once per level**, however many levels
   it takes. No summary shortcut exists in the source. The player
   pressing the button is the tempo (owner's ruling, 2026-10-29 ~20:30
   CDT: the ritual pacing is the feature).
9. After the last recipient: battle-end flow — trainer defeat message,
   then the prize-money line ("got {money} for winning"), then exit.
   Capture ends the battle with **no EXP** (Gen 5 rule; EXP on capture
   arrived in Gen 6 — we model Gen 5, so capture pays nothing).

### The jingle — located, not placeholdered
- **Pokémon Black** (primary model): `files/wb_sound_data.sdat`, SYMB
  block, SEQ record table — **SEQ 1301 (0x515) = `SEQ_ME_LVUP`**.
  (Parsed from the binary this session; parser:
  `~/workspace/battle-payoff/sdat_symb.py`.)
  Same bank: `SEQ_SE_LVUP` = SEQ 1766 (0x6E6); victory BGMs
  `SEQ_BGM_WIN1..WIN6` = SEQ 1148–1152, 1169.
- **HeartGold**: `files/data/sound/gs_sound_data.sdat` SYMB —
  **SEQ 1184 (0x4A0) = `SEQ_ME_LVUP`**, matching the decomp constant
  `include/constants/sndseq.h:192: #define SEQ_ME_LVUP 1184` and the
  call `PlayFanfare(SEQ_ME_LVUP)` (`src/battle/battle_system.c:1952`,
  plus the message-glyph path above). Wild victory: `SEQ_GS_WIN2`.
- The module's cue slot therefore names the real fanfare it recreates:
  our own synth rendition (the existing `'levelup'` SFX in
  `audio-system.ts`) stands in for SEQ_ME_LVUP; no source audio,
  samples, or note data are copied — the *system* (an ME fanfare fired
  by the level-up message, per level) is what comes over.

## 3. What was built

- `src/lib/battlePayoff.ts` — pure planner + committer (see
  LANDING-RECORD). One calculator for both hosts:
  `floor(baseExpYield × foeLevel / 7)`, participants split (floor,
  min 1), trainer ×1.5 per recipient — the HGSS compute above.
  This **supersedes** BattleView's ad-hoc `/5` and WorldEngine's
  random stub + dead `xp` field (amounts change; documented here as a
  direct consequence of the owner's "fill it from the actual code"
  order). The planner simulates on a clone using the same commit
  functions the hosts run live, so the shown plan and the applied
  result cannot drift.
- `src/components/game/BattlePayoffSequence.tsx` — the beat machine:
  EXP text → gauge sweep per level segment → fanfare + "grew to Lv."
  → stat window (+diffs → press → true values → press) → next level /
  next recipient → money line → done. Player-paced; no auto-skip;
  BATTLE SCENE OFF applies the plan instantly (the game's existing
  no-animation philosophy: same results, no presentation).
- Wiring: BattleView victory tail (payoff → existing evolution prompt →
  money beat → VICTORY) and WorldEngine wild + trainer win branches
  (payoff per faint; trainer money beat at the final win; the v5.1
  Continue banner still gates the exit, unchanged).
