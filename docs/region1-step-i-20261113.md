# Region 1 step (i): Route 1.0 rescue + exit gating + tech grants

2026-11-13. Second slice of audit step (i) Region 1 — the first slice
(PR #418) wired live DialogueBox Ink (truck-start story + choices).
This slice wires the truck-start beat the world did not implement
yet, enforces the exit gates the maps already declared, and consumes
the `hmReward` technique grants that were carried but never granted.

Base: main `00bed95a` (PR #418 merged). Branch:
`feature/region1-truck-phaseAB-20261113`.

## 1. Route 1.0 rescue

The ink `route_rescue` knot (`region1-truck-start.ink`) existed; the
world did not implement it. Now it does:

- First entry onto Route 1.0 with no starter plays Aeon's intro
  (ink lines, verbatim) — same one-time pattern as the v4 Mom intro.
- Prof. Aeon stands at (10,35) on Route 1.0, his five bag NPCs on
  the grass beside the path (y=35, x=7–9/11–12). The bags reuse the
  lab balls' `pick_starter_XXX` choices and dialog lines.
- Picking a partner shows the gift dialog, then `finishDialog`
  chains the wild-creature battle: Wild Sproutle Lv 5, placeholder
  stats per Break 4 (trainerBattleMon rebuilds from SPECIES_DB).
  Winning plays Aeon's thanks dialog (ink lab-knot lines, with
  "Route Topaz" re-worded to "Route 1.0" — Topaz vs Greenfield Path
  naming is Mars-to-confirm). A loss blacks out and the flow
  continues (mirrors Hex); the wild creature does not re-trigger.
- The five lab balls are display-only now (no choice, no event) and
  point at Aeon's bag; lab Aeon drops the "pick one" lines. The
  rescue is the only starter source (master Template T).
- `block_route_1` step-back events are REMOVED from Sector 0 — they
  contradicted the rescue flow and would softlock Route 1.0 entry
  pre-starter.
- Re-pointed from the lab to Route 1.0: Mom intro line 1, the
  no-party battle guard line, the ROUTE 1.0 GATE sign, and the
  pre-starter goal HUD line.
- KEPT, not silently decided: the Hex lab-exit battle stays (master
  says it moved to Region 3, but it is verified v4/v5 content).
  Flagged for Mars — see below.

## 2. Exit gating

`WorldEngine.move()` fired every exit unconditionally. Exits now
honour their gate fields via `src/lib/doorGate.ts` (`isExitOpen` +
`exitSealedText`, new alongside the Sequence 3 door gates):

- `condition: "badges>=N"` — same language as doors; anything else
  is CLOSED (fail-closed).
- `hmNeeded: "<Technique>"` — the technique must be HELD
  (`fieldTechniques.ts` tech.* flags); an unknown name is CLOSED.
- A sealed exit answers with its reason in a dialog; noclip still
  bypasses (cheat), as it bypasses doors.
- Live effect: the binary_fields → victory_route exit (`badges>=8`)
  and the sector0 → boot_bay exit (`hmNeeded: "Wave"`) are enforced
  now. The Mauveville Arena door (`ciphers>=10`) stays sealed:
  ciphers exist nowhere in the store/engine (pre-existing).

## 3. Tech grants

`hmReward` was carried in the map data and never consumed. Now:

- Dojo victory grants the leader's `hmReward` technique
  (battle state carries it from `triggerTrainerBattle`; Lin →
  Mighty Push), once, with a log line.
- First talk with the Preserve Keeper grants Wave (Wave-Ride);
  first talk with the NEW Neon ferry captain (20,30; Beat 5 spec
  lines, verbatim) grants Slice (Data-Cut). Same first-talk pattern
  as Mom's Sprint Boots grant. Keeper/captain dialog lines are
  untouched (pinned by the dialogue-attribution test).
- Falk's `hmReward: "Slice"` is REMOVED — Beat 4: Data-Cut is NOT
  at Dojo 2.

## 4. Hex goal dialog

"beat Champion Mythar" → "beat Champion Hex" (Beat 8 canon; Mythar
is the Arena champion placeholder). The win-path comment naming
Mythar is updated to match.

## Tests

- `tests/exitGate.test.ts` — `isExitOpen` / `exitSealedText`
  unit tests (badges, Wave, unknown technique/condition fail-closed,
  combined gates) + door-gate regression pins.
- `tests/region1-rescue.test.ts` — structural pins on `FULL_WORLD`:
  no `block_route_1` events, re-pointed gate sign, Aeon + 5 bag
  NPCs with the right choices, display-only lab balls, Lin/Falk
  `hmReward`, ferry captain + keeper spec lines byte-identical.
- Both files are added to the explicit vitest list in
  `.github/workflows/ci-budgets.yml` and to `package.json`
  `"test:tests"` (step (e) precedent).

## Still owed after this PR (not in scope)

- Dojo 3–8 leader battles + badges (NAME GAP / ROSTER GAP — Mars
  names leaders/teams).
- Elite Four + Champion Hex battles on mainframe_plateau (names/teams
  GAP).
- Hall of Records flag + ferry ticket + isle/region2 gates (need the
  champion first).
- Light-Pulse (Signal Tunnel): Illuminate is context-only, no
  dark-map system yet.
- Ferry-cell battle (Beat 5) — no ferry map.
- Mochiko garden gate line (GardenView, not world maps).
- Route Topaz (ink/JSON) vs Greenfield Path (live map) naming —
  Mars to confirm.
- Hex lab-exit battle: master says it moved to Region 3; kept here
  as verified v4/v5 content — Mars to confirm keep or move.
- Mauveville Arena `ciphers>=10` door: ciphers exist nowhere —
  pre-existing, fail-closed sealed.
- Rescue loss/flee: chained once from the pick; a loss blacks out,
  the wild creature does not re-trigger.
