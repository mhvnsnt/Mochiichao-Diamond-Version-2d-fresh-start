# Battle Payoff — Landing Record

# CORRECTION — presentation rebuilt from the source (2026-10-29, later the same evening)

**Owner verdict that opened this correction** (Jamar, 2026-10-29
~21:11 CDT, replying to the delivered proof frames, in substance):
"that's covering up a lot of the battle — Pokémon doesn't cover up
the battle when you gain experience points like that. It doesn't make
that big log screen / terminal screen like that. You gotta actually
do this stuff from the Pokémon code, bro. Don't hand-tool it."

**He was right, and it is recorded here as this package's failure,
not softened.** Verified by opening the delivered frames directly:
`proof/02` and `proof/04` were a harness page — a mostly-empty dark
screen, monospace debug/commit log lines across the top, and NO
battle scene anywhere in the frame. The sequence LOGIC (HGSS formula
and Task_GetExp state machine, the SEQ_ME_LVUP jingle) was modelled
on held code and stands. The PRESENTATION was hand-tooled: a
standalone component that drew its own databox copy and message
panel inside a full-screen covering layer, and it was only ever
"proven" on that terminal-looking harness page. Both the
presentation and its proof failed the bar. Those 8 frames now live
in `proof/HARNESS-NOT-PROOF/` with a README stating they are the
rejected harness renders, kept only as the record of what was
wrong; they must never be presented as visual proof (presentation-
proof law, AGENTS.md 2026-10-29).

**What the source code actually specifies** — extracted as a PORT,
every visual element cited to source file + function, only the
language seam changed (DS 256×192 / 8-px tiles → relative geometry
of the battle scene): [PRESENTATION-SPEC.md](sandbox://workspace/battle-payoff/PRESENTATION-SPEC.md).
In short, from pokeheartgold: the payoff prints into the battle's
standing message window (window 0,
`BattleSystem_PrintBattleMessage`, `battle_system.c:1421`); the EXP
gauge animates ONLY inside the active battler's own databox, and
only for the active battler (`BattleController_EmitUpdateExpGauge`,
`battle_controller.c:833`; the message carries the pre-award and
post-award progress into the level); the stat summary is a small
framed window created on window 1 at x 136 px, y 56 px, 14×12 tiles
→ left 53.125%, top 29.167%, width 43.75%, height 50% of the scene,
with the battler layer's BG priority lowered beneath it — the scene
stays drawn; diffs page: "+{n}" at x=80, 2 digits; press switches to
true values at x=72, 3 digits, clearing ONLY the diff column; close
removes the window and restores priorities, once per level; a
non-active recipient gets a nameplate sprite text at (176, 8), never
a second gauge. Gen 5's battle sequencing is NOT readable C in our
holdings (pokeblack = disassembly + sound-bank data), so Gen 4's
readable code governs the presentation, and the record says so.

**What changed (the correction's file deltas, on top of §"Files"):**

- `src/components/game/BattlePayoffSequence.tsx` REWRITTEN — it is
  now the `useBattlePayoffSequence` hook (pacing/display state only;
  renders NO screen) plus `PayoffStatWindow`, the only element it
  renders, at the source geometry (exported as
  `PAYOFF_SUMMARY_WINDOW`, locked by tests). No databox copy, no
  message panel, no full-screen overlay, no log/terminal chrome
  remains anywhere in the shipped component. Commits, cues and the
  plan are the logic build's, unchanged.
- `src/components/views/BattleView.tsx` — payoff text renders in the
  host's standing `UiPanel` message window; the player databox's own
  EXP gauge is driven by the sequence; the stat window renders
  INSIDE the arena; the log-tray/move-grid row is hidden during the
  payoff, as command selection is gone while Task_GetExp runs in the
  source.
- `src/world/WorldEngine.tsx` — same wiring; the covering-overlay
  mount was REMOVED; the player databox gained the EXP gauge row it
  never had, driven by the sequence during the payoff; the bottom
  panel's message line carries the payoff text (click = press).
- NEW `src/lib/battlePayoffPresentation.test.ts` — 5 tests locking
  the summary-window geometry to the source constants.
- `src/lib/battlePayoff.ts` — UNCHANGED by the correction.

Landing set is now **6 files** (the §"Files" list below plus the new
presentation test; the BattlePayoffSequence entry there should be
read as the hook + window described here).

**New proof — real in-game captures** (`proof-ingame/`, index +
method + honest gaps in its PROOF-README.md): the tree's production
build was driven through a real wild battle in WorldEngine on
Route 1 (Razorgater Lv.6 vs Kittember Lv.7; the save was seeded
through the game's own save data to sit 5 EXP below the boundary).
Captured in situ: the EXP text in the host's message window with
the full battle visible; the databox gauge measured by pixel scan
at 130/135 px of track at the text beat, 135/135 at the boundary,
and 9 px growing from empty on the final segment after the level;
the "grew to Lv." message; the stat window over the live arena on
the diffs page and, after a real Enter press, the true-values page;
the host's victory banner; and the overworld resumed. The drive
took six runs — runs 1/3/4/5 failed for driver reasons (no grass
stepped on; a regex double-escape; a low-HP defeat; the slot menu's
start-over dialog) and are logged as failures in PROOF-README.md,
not hidden. **Two honest limits:** the money line was NOT captured
in-game (this proof battle was wild — the source pays no money for
wild faints; the money beat runs through the same hook and window
and is covered by the unit tests only), and BattleView's identical
wiring was compile/test-verified but not separately driven, because
BattleView is not reachable from the shipped App entry in this tree
(nothing mounts HubView; WorldEngine never routes to the BATTLE
view — pre-existing, not a correction-lane change).

**Re-verification after the rebuild (receipts):** `npx tsc --noEmit`
— 0 errors. Payoff tests 21/21 (16 logic + 5 geometry). Full
`vitest run src/lib` — 146 passed / 2 failed, the 2 being the known
pre-existing honor guard failures on this snapshot tree (see the
snapshot note below; not this package's files). `npm run build` —
clean (Vite chunk advisory only); that build is the one the proof
drive ran against.

---

**Status: READY-TO-LAND, staged. Gate CLOSED (repo public operation in
flight) — nothing pushed, nothing force-pushed.**
Tree: `~/workspace/battle-payoff/tree/` · Audit + source model:
[AUDIT.md](sandbox://workspace/battle-payoff/AUDIT.md) · Proof:
`~/workspace/battle-payoff/proof-ingame/` (in-game captures — see the
CORRECTION section above; the original harness frames are quarantined
in `proof/HARNESS-NOT-PROOF/` and are NOT proof)

Presentation authority: the presentation-restraint law + fan-loved
build law (AGENTS.md, 2026-10-29) — exactly the source's beats, in the
source's order, player-paced; nothing invented beyond them.

## Files (the complete landing set — 6 files; see the CORRECTION
section at the top for the presentation deltas)

NEW:
- `src/lib/battlePayoff.ts` — pure planner + committer shared by both
  battle hosts. HGSS compute (pool = baseExpYield × foeLevel / 7,
  equal split among alive participants, floor, min 1; trainer ×1.5
  per recipient), per-level segments + stat steps, commit functions
  that reuse the engine's own `calculateStat` (stepwise commits are
  test-proven identical to `engine.gainExp`'s end state). Carries
  `PAYOFF_SOUND_CUES` with the jingle provenance (below).
- `src/lib/battlePayoff.test.ts` — 16 tests (see Verification).
- `src/lib/battlePayoffPresentation.test.ts` — 5 tests locking the
  stat summary window's geometry to the pokeheartgold constants
  (added by the correction).
- `src/components/game/BattlePayoffSequence.tsx` — CORRECTED: the
  `useBattlePayoffSequence` pacing hook + `PayoffStatWindow` at the
  source geometry; renders no screen of its own (see CORRECTION).

EDITED:
- `src/components/views/BattleView.tsx` — foe-faint now plans the
  payoff and enters the PAYOFF state; the existing evolution prompt
  runs after it on the granted levels; `finishVictory` keeps only the
  VICTORY state + exit (the flat 50 Credits moved into the sequence as
  its money beat, host canon text kept: "You found 50 Credits.").
  Player databox gains the persistent EXP gauge (Gen 5 databox
  grammar). Supersedes the old instant `gainExp` + `/5` formula.
- `src/world/WorldEngine.tsx` — wild wins: the random-XP stub writing
  into the dead `xp` field is replaced by the planned payoff
  (banner flow unchanged after it). Trainer battles: payoff per
  fainted foe mon (mid-battle too, as the source runs it); the final
  win's reward — previously credited silently with no text — is now
  the sequence's closing money beat ("You got {reward} Credits for
  winning!"); when the battle continues, the player's battle copy is
  refreshed from the store so the rest of the fight uses the levelled
  stats/HP. Catch / run / loss paths untouched (Gen 5: capture pays
  no EXP).

## The jingle — provenance (located in held code, per owner ruling)

- Pokémon Black `files/wb_sound_data.sdat`, SYMB block, SEQ record
  table: **SEQ 1301 (0x515) = SEQ_ME_LVUP** (parsed from the binary
  this session; parser kept at `~/workspace/battle-payoff/sdat_symb.py`).
  Same bank: SEQ_SE_LVUP = 1766; win themes SEQ_BGM_WIN1..6 = 1148–1152, 1169.
- HeartGold `files/data/sound/gs_sound_data.sdat`: SEQ 1184 (0x4A0) =
  SEQ_ME_LVUP — matching decomp constant
  `include/constants/sndseq.h:192` and the call
  `PlayFanfare(SEQ_ME_LVUP)` in `src/battle/battle_system.c` (fired by
  the "grew to Lv." message's own control glyph). Wild victory music
  SEQ_GS_WIN2 starts inside Task_GetExp itself.
- The module's cue slot names SEQ_ME_LVUP and fires our own synth
  rendition (the pre-existing `'levelup'` SFX in
  `src/lib/audio-system.ts`); no source audio/note data copied.
  Correction to the task brief: pokeheartgold WAS in the corpus
  (full `src/battle/` C) — the readable sequence/compute above is
  from it; pokeblack supplied the sound-bank IDs + Gen 5 grammar.

## Verification (receipts, this tree)

- `npx tsc --noEmit` — **0 errors**.
- Tests: mine **16/16 pass**. Full suite: **141 passed / 2 failed** vs
  pristine-baseline **125 passed / 2 failed** — the delta is exactly
  my 16, zero regressions. The 2 failures are the honor lane's guard
  tests (`honor.test.ts`), failing identically on the untouched
  honor-wiring tree; see the snapshot note below. Not this package's
  files; flagged for the honor lane / sweep, not fixed here.
- `npm run build` — **clean** (only Vite's standard >500 kB chunk
  advisory).
- **Headless proof** — SUPERSEDED by the CORRECTION section at the
  top of this record. The original Playwright drive ran the shipped
  component on a harness page (real component, real module,
  GameShark-scale award, ten full level beats) and its 8 frames were
  delivered as proof; the owner rejected them — a harness render is
  not a battle. Those frames are quarantined in
  `proof/HARNESS-NOT-PROOF/` and are NOT proof of anything visual.
  The proof of record is now the in-game capture set in
  `proof-ingame/` (see CORRECTION + its PROOF-README.md).

## Snapshot note (read before landing)

The tree was copied from `~/workspace/honor-wiring/tree/` while that
lane was landing its final writes: honor's NEW files are present, but
its two EDITED files arrived after the snapshot — this tree's
`src/store/gameStore.ts` (no `deedLedger`) and
`src/components/views/ShopView.tsx` (no band pricing) are the
pre-honor versions. This package touches neither file. **Land only
the 6 files above**, onto a main that already carries the honor PR;
never carry this tree's gameStore.ts / ShopView.tsx anywhere.

## Landing steps (when the gate opens)

1. Agent Commons board claim for the payoff package.
2. Fresh-fetch main; confirm it carries honor's store + ShopView
   changes; drop the 6 files in; re-run `npx tsc --noEmit`,
   `npx vitest run src/lib`, `npm run build` on the merged tree.
3. One PR, squash merge, fetch-back verification (blob-compare the 6
   files on main).

## Named follow-on gaps (not built here, per scope)

- **Level-up move learning**: the source runs a full learn/forget
  flow inside this sequence (Task_GetExp learn-move states); our
  engine never teaches learnset moves on level-up at all. The
  sequence has the natural seat for it; needs its own lane.
- **Participation breadth**: both hosts currently record only the
  finishing/active member as participant (their battles are
  single-active with voluntary switches). The planner already splits
  among any participant set — if a host starts tracking who else
  entered against a foe, passing those indices is the whole change.
- **Gen 5 EXP formula**: Black's level-difference-scaled formula is
  not decompiled to readable form in our holdings; the ported compute
  is Gen 4's verified formula. Revisit only if Black's battle code
  becomes readable.
