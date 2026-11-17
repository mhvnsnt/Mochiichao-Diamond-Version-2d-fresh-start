# IN-GAME PROOF — battle payoff presentation (correction lane)

These frames are captures of the REAL game (WorldEngine host) driven by
`../../drive-ingame.cjs` against the tree's production build, run 6
(full log: `../proof-ingame-drive-run6.log`). A real wild battle on
Route 1 (Razorgater Lv.6 vs Kittember Lv.7), seeded only through the
game's own save data (lead placed 5 EXP below the level boundary, so
the first faint crosses exactly one level — the same beats a normal
faint near a boundary produces).

| Frame | Beat |
|---|---|
| `01-foe-faint-before.png` | battle in progress, before the faint |
| `02-exp-text-battle-visible.png` | "{name} gained {n} Exp. Points!" in the host's standing bottom message window; full battle visible (both creatures, both databoxes). EXP gauge in the player databox measured at 130/135 px of track (the sweep's start). |
| `03-gauge-sweep-burst-0..6.png` | 120 ms burst after the EXP text: the databox gauge is at 135/135 (boundary reached — this award's first segment is ~160 ms, so the burst caught it completed; start and end states are frames 02 and 03-0). The stat window is already up by burst-2 (it follows the sweep per the source). |
| `04-level-up-message.png` | "{name} grew to Lv. {n}!" in the message window, battle fully visible. |
| `05-stat-window-diffs-over-battle.png` | stat summary window over the arena at the source geometry (right side, 43.75% x 50% of the scene), diffs page (+N column). |
| `06-stat-window-values-over-battle.png` | same window after a press: names stay, true values right-aligned. |
| `07-gauge-final-sweep-burst-0.png` | final gauge segment just after the values press: fill measured at 9 px — the new level's gauge growing from empty (later burst frames are the host's pre-existing victory banner, which dims the scene). |
| `08-victory-banner.png` / `10-final-state.png` | the host's own victory banner after the sequence ends. |
| `09-world-resumed.png` | back in the overworld — flow fully returned. |

Gauge widths were measured by pixel scan of the sky-blue fill in the
player databox (y=257 row), not eyeballed.

## What is NOT in these frames, stated plainly

- **The money line.** This proof battle was wild; the source pays no
  money for wild faints (and neither does the game). The money beat
  ("You got {n} Credits for winning!" in WorldEngine trainer battles;
  "You found 50 Credits." in BattleView) runs through the same hook +
  message window and is covered by the unit tests, but it was NOT
  captured in-game in this lane.
- **BattleView in-game.** BattleView's payoff wiring uses the same
  hook and stat window and compiles/tests green, but BattleView is
  not reachable from the shipped App entry in this tree (nothing
  mounts HubView; WorldEngine never routes to the BATTLE view — a
  pre-existing fact, not a correction-lane change), so only the
  WorldEngine host was drive-proven.

## Drive history (honest log of the attempts)

- Run 1: driver strolled the path, never stepped on grass — no battle.
- Run 2: first successful full capture (Kittember faint; level-up,
  diffs, values, world-resumed frames) — kept in git history of this
  folder as `drive-run2.log`; superseded by run 6's fuller set.
- Run 3: driver regex bug (`\\.` double-escape) — payoff never
  detected; no frames claimed.
- Run 4: lead entered at 3/22 HP (the save-entry heal missed the
  entry the game loaded) and was defeated — DEFEAT banner.
- Run 5: slot click opened the start-over dialog; driver stalled.
- Run 6: all beats captured (seed patches every save entry; the
  driver takes LOAD THIS SAVE INSTEAD when the dialog appears).
