# Story-flag engine audit — 2026-11-13

Follow-on to the Regions 3-5 maps step (PR #424, main `60bccfa4`).
Closes the owed item in `docs/regions3-5-maps-audit-20261113.md` §6:
"Story flags live in the compiled Ink stories; WorldEngine exit
conditions only understand badges>=N and techniques, so no exit is
gated on a story flag in this PR. A story-flag engine is a separate,
owed task."

## 1. The engine

An exit may name a story flag: `storyFlag: "r3_storm_route_open"`.
The exit is traversable only once that flag is set. Three pieces,
all in the existing shapes — no new save format, no new flag store:

- `src/lib/doorGate.ts` — `hasStoryFlag(completedEvents, flag)`:
  true when a completedEvents entry equals the flag, or ends with
  `:<flag>` (the `ink:<storyId>:<flag>` entry
  `WorldEngine.finishInkDialog` records for every variable a story
  set to true). `isExitOpen()` takes `completedEvents` as an optional
  4th argument (default `[]`, so existing 3-arg callers are unchanged)
  and closes the exit when a named flag is not set. Fail-closed, like
  `condition` and `hmNeeded`. `exitSealedText()` answers a flagged
  exit with "The way has not opened yet."
- `src/world/WorldEngine.tsx` — the walk-into path passes the
  `completedEvents` it already subscribes (the noclip path still
  bypasses gates, as it bypasses doors).
- Flags persist with the save: `gameStore.completedEvents` is
  serialized whole by SaveMenu, like every other store field.

## 2. Flags verified — setting beat exists in the compiled Ink stories

Each flag is written by a `~ flag = true` assignment in an `_after`
knot of the compiled story on main, verified by PLAYING the knot
through `createInkSession` (see `tests/storyFlagGate.test.ts`) — not
by string search. The `_after` knots play when their beat's
post-event lines run (battle wiring owns that trigger).

| Flag | Story | Knot | CompletedEvents entry |
| --- | --- | --- | --- |
| `r3_storm_route_open` | `region2-story` | `r2_14_frost_peak_after` | `ink:region2-story:r3_storm_route_open` |
| `r4_airship_route_open` | `region3-story` | `r3_13_frontier_arenas_after` | `ink:region3-story:r4_airship_route_open` |
| `r5_signal_open` | `region4-story` | `r4_16_battle_zone_after` | `ink:region4-story:r5_signal_open` |

All three beats exist. Nothing was left ungated, nothing invented.

## 3. Exits wired (only these three)

| Exit | `storyFlag` |
| --- | --- |
| `r2_frost_peak` north (12,0) -> `r3_outpost_2f` | `r3_storm_route_open` |
| `r3_frontier_arenas` north (14,0) -> `r4_twinleaf` | `r4_airship_route_open` |
| `r4_rift_dungeon` north (9,0) -> `r5_start_city` | `r5_signal_open` |

These are the only entries to Regions 3/4/5 from the previous region:
the MochiiPlex "Exit" doors back to the arrival towns sit INSIDE
Regions 4/5, reachable only after arrival, so they do not bypass
the gates. The inter-region links stay one-way by design (audit §6).
No other exit in `FULL_WORLD` names a `storyFlag` — pinned by test.

## 4. What is NOT gated

- `badges>=N` and `hmNeeded` behaviour is unchanged.
- Doors do not read story flags (doors only understand `condition`).
- No other flag is gated: `r3_hall_third_entry` and the other
  `rN_*` story variables stay story-only until a step wires them.
- No new flags, names, dialogue, or story content invented.

## 5. Tests

`tests/storyFlagGate.test.ts` (in `test:tests`): `hasStoryFlag`
matching (bare, `ink:`-prefixed, non-matches, suffix traps),
`isExitOpen` flag unset -> blocked / set -> open, flag AND
badges/hmNeeded, sealed text, the three wired exits from
`FULL_WORLD`, the no-other-flagged-exit sweep, and the three
Ink-knot playbacks. Existing `exitGate` / regions2 / regions3-5
tests are untouched and still pass (their `links()` helpers only
read `condition` / `hmNeeded`).

## 6. Owed (not this PR)

- The `_after` knots set their flags when their beats' post-event
  lines play; the battle wiring that triggers those knots (First
  Champion, Frontier clear, Rift seal) is the NPC/battle step's work.
  Until a knot plays, its exit stays sealed — which is the gate
  working as designed, not a bug.
- `validate:dialogue` does not yet check that a `storyFlag` named in
  a map is written by some compiled story; the test file pins the
  three current flags instead.
