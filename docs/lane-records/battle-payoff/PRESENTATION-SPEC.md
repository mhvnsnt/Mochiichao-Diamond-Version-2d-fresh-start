# Battle Payoff — PRESENTATION SPEC (a port, not a design)

Correction lane, 2026-10-29 ~21:15 CDT, under the SOURCE-FIRST WIRING
LAW (AGENTS.md): if it exists in Pokémon, wire it 100% through
Pokémon's code exactly — adapted only at the language/runtime seam.
Every visual element below is cited to the source file + function
that specifies it. Where the source is silent, the spec says so;
nothing here is designed where the code speaks.

**Primary source:** HeartGold decomp, full readable C —
`~/workspace/pokemon-code-study/projects/pret-pokeheartgold/`
(hereafter HGSS). **Gen 5 check:** `~/workspace/pokemon-black-decomp/pokeblack/`
is a matching disassembly; its battle sequencing is NOT decompiled to
readable C in our holdings, so per the law the readable Gen 4 code
governs the presentation and this spec claims nothing for Black's
presentation code that was not read. (Black evidence used so far is
sound-bank data only — see AUDIT.md §2, the SEQ_ME_LVUP record.)

The seam: DS main screen is 256×192 px, tiled at 8 px/tile. Our
battle screens are fluid-size web views. The port therefore carries
the source's *relative* geometry (fractions of the battle scene) and
its lifecycle exactly; absolute pixels exist only in the source
column. That is the language seam, and it is the only adaptation.

---

## 1. The battle message window — payoff text goes in the window the battle already has

- **Source:** `src/battle/battle_system.c:1421`
  `BattleSystem_PrintBattleMessage()` — every battle message,
  including every payoff beat, is printed into
  `BattleSystem_GetWindow(battleSystem, 0)` — the battle's standing
  message window (window index 0, created with the battle UI) — by
  `AddTextPrinterParameterized(window, FONT_MESSAGE, msgBuffer, 0, 0,
  delay, ov12_0223CF14)` after `FillWindowPixelBuffer(window, 0xFF)`.
  There is no payoff screen, no overlay page, no log: the text
  replaces the current text *in that window*, over the live scene.
- **Payoff callers:** `src/battle/battle_command.c`, `Task_GetExp` —
  EXP message `msg_0197_00001` ("{0} gained {1} Exp. Points!", or the
  boosted variant `msg_0197_00002`), printed in
  `STATE_GET_EXP_START`; level-up message `msg_0197_00003`
  ("{0} grew to Lv. {1}!") printed in
  `STATE_GET_EXP_WAIT_LEVEL_UP_EFFECT`. The fanfare rides the
  level-up message itself: the printer callback `ov12_0223CF14`
  glyph 5 fires `PlayFanfare(SEQ_ME_LVUP)` (battle_system.c; see
  AUDIT.md §2).
- **Pacing the code specifies:** `STATE_GET_EXP_WAIT_MESSAGE_PRINT`
  waits for `TextPrinterCheckActive(printerId) == 0` (the text must
  finish printing), then `STATE_GET_EXP_WAIT_MESSAGE_DELAY` counts
  `DATA_GET_EXP_FRAME_COUNTER = 7` frames before the gauge state.
- **Port (our seam):** each host renders the current payoff message in
  *its own existing bottom message window* — BattleView: the framed
  `UiPanel` message box that already carries the battle's current
  message; WorldEngine: the bottom panel's message/log tray, showing
  the payoff line as its current line. During the payoff the command
  grid is not shown (in the source the command selection is gone
  while Task_GetExp runs; the message window is what remains).
  Our text-wait seam: 700 ms for the print+7-frame beat (the DS print
  speed + 7 frames at 60 fps ≈ 117 ms after print; our 700 ms covers
  both at our font size — a pacing constant, not a geometry claim).

## 2. The EXP gauge — inside the player's databox, which never leaves the screen

- **Source:** `Task_GetExp`, `STATE_GET_EXP_GAUGE` — the gauge
  animates **only for the active battler**
  (`slot == selectedMonIndex[expBattler]`); any other recipient's
  award applies silently with no sweep
  (`STATE_GET_EXP_CHECK_LEVEL_UP` directly).
- **The animation's parameters:** `src/battle/battle_controller.c:833`
  `BattleController_EmitUpdateExpGauge(battleSystem, ctx, battler,
  curExp)` builds `ExpGaugeUpdateMessage { command, curExp,
  gainedExp, expToNextLevel }` where `curExp` is the recipient's
  progress into its current level **captured before the award**
  (`DATA_GET_EXP_PREV_PROGRESS_TO_NEXT_LEVEL`, set in
  `STATE_GET_EXP_START` from the pre-award EXP), `gainedExp` is
  progress-into-level **after** the award
  (`battleMons[battler].exp - GetMonExpBySpeciesAndLevel(species,
  level)`), and `expToNextLevel` is the level's span. The databox
  animates its own gauge between those two progress values.
- **Delivery:** `src/battle/battle_io_command.c:356`
  `BattleIOCmd_UpdateExpGauge` → `ov12_0225AA6C` (databox gauge
  update; the databox is a standing battle-UI element — name, Lv,
  HP gauge, EXP gauge — rendered for the whole battle, not a payoff
  invention). After a level commits, `STATE_GET_EXP_WAIT_LEVEL_UP_EFFECT`
  also fires `BattleController_EmitRefreshHPGauge` — the same
  databox's HP gauge refreshes with the new max HP.
- **Port:** BattleView's player databox already carries an EXP gauge
  under its HP bar (added by the original payoff build, Gen 5
  databox grammar); the rebuild drives *that* gauge's width from the
  sequence's animated fraction (from = pre-award progress, to =
  post-award progress, per segment) instead of rendering a second
  databox at the bottom of a covering layer. WorldEngine's player
  databox gains the same gauge row (it had none) and, during the
  payoff, shows the sequence's display level/HP — the battle copy in
  that host is refreshed from the committed state when the battle
  resumes (existing behaviour), so the databox must read the
  sequence's display values *during* the beats, exactly as the
  source databox reads the battler's live data.

## 3. The level-up summary (stat) window — geometry, content, lifecycle

All from `Task_GetExp` in `src/battle/battle_command.c`.

- **Creation** (`STATE_GET_EXP_LEVEL_UP_SUMMARY_INIT`, window index 1):
  `AddWindowParameterized(bgConfig, window, GF_BG_LYR_MAIN_2, 0x11,
  0x7, 14, 12, 11, 9 + 1)` — AddWindowParameterized's parameters are
  (bg, x, y, width, height, palette, charBase) in 8-px tiles:
  **x = 17 tiles = 136 px, y = 7 tiles = 56 px, width = 14 tiles =
  112 px, height = 12 tiles = 96 px**, palette 11, on
  `GF_BG_LYR_MAIN_2`. Then `FillWindowPixelBuffer(window, 0xFF)` and
  `DrawFrameAndWindow1(window, FALSE, 1, 8)` — a framed window.
  Before adding it, the state sets `G2_SetBG0Priority(2)`,
  `SetBgPriority(GF_BG_LYR_MAIN_1, 1)`, `SetBgPriority(GF_BG_LYR_MAIN_2,
  0)`: **the window's layer is raised above the battler layer — the
  scene stays drawn underneath; nothing is hidden or replaced.**
  Relative geometry on the 256×192 scene: left edge 136/256 =
  53.125%, top edge 56/192 = 29.167%, width 112/256 = 43.75%,
  height 96/192 = 50%. (Exported in code as
  `PAYOFF_SUMMARY_WINDOW` in BattlePayoffSequence.tsx.)
- **Nameplate** (`STATE_GET_EXP_LEVEL_UP_SUMMARY_LOAD_ICON`, before
  INIT): if the recipient is **not** the active battler,
  `BattleSystem_LoadLevelUpNameplate` (battle_command.c:7956) draws
  "{name} ♂/♀ Lv. {level}" (msg_0197_00944/945/946) as a sprite text
  at **(176, 8)** — above the summary window — so the player knows
  whose stats these are. Active-battler recipients need none: their
  databox is on screen. Port: the summary window carries the same
  nameplate line when the recipient is not the databox's battler.
- **Diff page** (`STATE_GET_EXP_LEVEL_UP_SUMMARY_PRINT_DIFF`): six
  rows, `NUM_STATS`, one per stat in source order (HP, Attack,
  Defense, Sp. Atk, Sp. Def, Speed). Row *i* prints at **y = 16·i
  px** (rows are 16 px of the 96 px height). Stat name at **x = 0**
  (msg_0197_00947, TAG_STAT); the gain as **"+{0}" at x = 80**,
  `numDigits = 2` (msg_0197_00948) — the gain is
  `current − prevLevelStats`, the previous level's stats having been
  cached **before** `CalcMonStats` ran
  (`STATE_GET_EXP_WAIT_LEVEL_UP_EFFECT`).
- **The press** (`STATE_GET_EXP_LEVEL_UP_SUMMARY_PRINT_DIFF_WAIT` /
  `_PRINT_TRUE_WAIT` — one shared wait for both pages): advance iff
  `(gSystem.newKeys & (PAD_BUTTON_A | PAD_BUTTON_B | PAD_BUTTON_X |
  PAD_BUTTON_Y)) || System_GetTouchNew()`, playing
  `PlaySE(SEQ_SE_DP_SELECT)` on the press. No timer exists in either
  wait: the window stays until the player presses.
- **True-values page** (`STATE_GET_EXP_LEVEL_UP_SUMMARY_PRINT_TRUE`):
  `FillWindowPixelRect(window, 0xF, 80, 0, 36, 96)` clears **only the
  diff column** (x 80, width 36, full height) — the stat names stay.
  Values print at **x = 72**, `numDigits = 3`, right-aligned within
  width 36 (flag 0x2 in the `ov12_0223C4E8` call; msg_0197_00949).
- **Close** (`STATE_GET_EXP_LEVEL_UP_CLEAR`):
  `ClearWindowPixelBuffer(window, 0)`, `RemoveWindow(window)`, BG
  priorities restored (`G2_SetBG0Priority(1)`, MAIN_1 → 0,
  MAIN_2 → 1), nameplate unloaded, `prevLevelStats` freed. Then
  `STATE_GET_EXP_CHECK_LEARN_MOVE` → back to `STATE_GET_EXP_GAUGE`:
  **the whole summary lifecycle repeats once per level**, inside the
  gauge loop. (The learn-move flow itself remains a named follow-on
  gap — our engine has no level-up move learning; see
  LANDING-RECORD.)
- **Port:** `PayoffStatWindow` renders at the relative geometry
  above, inside the host's arena element (the scene element — the
  window is positioned over the arena, never over the whole app).
  Rows are 1/6 of the window height; the values column sits at
  x = 80/112 = 71.4% (diff page, "+N", 2-digit grammar) and
  right-aligns ending at (72+36)/112 = 96.4% (true page, 3-digit
  grammar). The window is the press target (the source's touch
  input); keyboard presses are handled globally by the sequence
  (the source's A/B/X/Y). No other element appears.

## 4. Money beat

- **Source:** battle-end flow after the last recipient — the trainer
  defeat message and the prize-money line print through the same
  battle message window (window 0, §1); amounts come from trainer
  data (`CalcPrizeMoney`, battle_command.c:2159 — our game carries
  its own amounts as data, unchanged; see AUDIT.md §2).
- **Port:** the money text is a message-window beat like any other,
  committed as its line prints, dismissed by the same press grammar,
  after which the host's own end-of-battle flow (banner / victory
  state) resumes — those host flows are pre-existing game UI, not
  payoff elements.

## 5. What the first presentation got wrong (for the record)

The original `BattlePayoffSequence` rendered its own databox copy
and its own message panel inside an `absolute inset-0` layer, and
its only proof was a harness page (dark empty screen, monospace
debug/commit log lines, no battle). Against this spec: the source
has no second databox (§2 — the gauge lives in the standing one),
no covering layer (§§1–3 — text in window 0, gauge in the databox,
one small framed window over a scene that stays drawn), and a proof
that shows none of the scene proves none of this. The rebuild keeps
the planner, formula, commit timing and sound cues (AUDIT.md §2 —
those were already ports) and replaces only the presentation and
its proof.
