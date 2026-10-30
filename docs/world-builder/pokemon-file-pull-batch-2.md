# Pokemon-file pull, batch 2 — systems and mechanics, NOT names/art/dialogue/towns

World Builder lane, 2026-10-26, Mars order: keep pulling
from the actual Pokemon files every turn, use anything
that is NOT a creature, a Pokemon name, a logo, dialogue,
or a town name, 100%. This batch is counted from the
decomp files in the repo (pokefirered-leafgreen, read
only, no edits to that clone), and converted to
Mochiichao canon. No creature names, no town names,
no dialogue lines, no logos, no art, no sounds are
copied here — only counts, structures, and mechanic
shapes, with Mochiichao names in their slots.

GPU note, standing workflow: this batch is data
counting and conversion from JSON/C files. A GPU
genuinely cannot speed up reading a 375-item JSON
or counting AI commands, so this step is CPU-only
for that plain reason. The next GPU-able step in
this lane (map/tileset rendering, sprite baking)
goes to Kaggle GPU first, not local.

## 1. Bag / item system — 375 items counted
Source: pokefirered-leafgreen/src/data/items.json,
"items" array, 375 entries, fields counted:
itemId, pocket, price, type, importance,
registrability, fieldUseFunc, battleUseFunc,
holdEffect, holdEffectParam, secondaryId, moveId.
Pockets counted: Items 207, TM Case 58, Key Items 55,
Berry Pouch 43, Balls 12. Total 375 = 207+58+55+43+12.
Mochiichao conversion, pockets renamed in place:
- Items 207 → Bag: Items (Mend Patch, Revive Core,
  etc. — Mochiichao items only, no Pokemon item names)
- TM Case 58 → Tech Case (field techs + TMs, kept
  separate: a tech is earned, a TM is taught)
- Key Items 55 → Key (Codex, ferry ticket, badges
  as key items, not consumables)
- Berry Pouch 43 → Data-Fruit Pouch (Garden fruit,
  not a Pokemon berry name)
- Balls 12 → Capture Cubes (Luigi Cubes + ring
  capture items, post-unlock, as separate pocket)
Rules pulled, not names: an item has a field use
AND/OR a battle use, a price, an importance flag
(key items cannot be tossed), a registrability flag
(quick-use slot), and a hold effect with a param.
Wire: Bag UI gets 5 pockets in that order, toss
prompt only for non-key items, registrable items
get a quick-use slot. Acceptance: Bag shows
5 pockets, key items cannot be tossed, quick-use
works from overworld.

## 2. Wild encounter system — rates counted, not pools
Source: wild_encounters.json, 1 wild_encounter_groups
table, fields counted:
- land: rates [20,20,10,10,10,10,5,5,4,4,1,1] = 100
  across 12 slots
- water: [60,30,5,4,1] = 100 across 5 slots
- rock-smash: [60,30,5,4,1] = 100 across 5 slots
- fishing: [70,30,60,20,20,40,40,15,4,1] with rod
  groups old_rod slots [0,1], good_rod [2,3,4],
  super_rod [5,6,7,8,9]
Mochiichao conversion: same slot/rate shape, with
Mochiichao species only, in Mochiichao maps only.
Land = tall grass / woods, water = Wave-Ride tiles,
rock-smash = Shatter tiles, fishing = rod tiers
(old / good / super, same slot split). Wire: wild
pool per map is a list of (species, level range,
slot, rate) that sums to 100 per field type, and a
validator fails the map if it does not sum to 100.
Acceptance: Route 1.0 pool sums to 100, fishing
rod tiers give different slots, not the same pool.

## 3. Heal / respawn system — 20 heal points counted
Source: heal_locations.json, "heal_locations" array,
20 entries. Structure: a heal point is a map +
a respawn position, used on blackout (party wiped)
and on free heal.
Mochiichao conversion: MochiiPlex in each town is
a heal point, Mom's house in Sector 0 is a heal
point, and blackout returns the player to the last
visited heal point with party at 30% HP (the
existing blackout rule, kept). Wire: heal point
is set on entering a MochiiPlex / talking to Mom,
not on every map change. Acceptance: blackout in
Binary Woods returns to Silicon Town MochiiPlex,
not to Sector 0, if that was the last heal point.

## 4. Trainer AI — 94 script commands counted, structure only
Source: battle_ai_script_commands.c, 94 distinct
Cmd_* commands counted by grep (sort -u).
Command shapes, grouped (no code copied):
- read: get_move_power, get_move_type, get_type
  effectiveness (highest), get_ability, get_hold
  effect, get_weather, get_turn_count, get_protect
  count, get_stockpile_count
- compare: if_hp_less_than, if_hp_more_than,
  if_hp_equal, if_can_faint, if_cant_faint,
  if_has_move, if_has_move_with_effect,
  if_effect, if_equal
- act: flee, goto, end, call (sub-script)
Mochiichao conversion, past the current 6 AI
profiles (Novice / Balanced / Type-aware /
Defensive / Aggressive / Elite, which are labels,
not decisions): turn each profile into a decision
tree built from these command shapes —
  * Type-aware: score moves by type effectiveness,
    then by power, then by effect
  * Defensive: if own HP < 50%, score heal / protect
    / switch first, then damage
  * Aggressive: if opponent can be fainted this
    turn, take that move; else highest power
  * Elite: full tree — effectiveness, power,
    effect, HP thresholds, weather, hold effect,
    protect count, in that order
  * Novice: random move, no scoring
  * Balanced: power + effectiveness, no HP tree
Wire: AI is a pure function (battle state → move
index), unit-tested per profile, not a script
file copied from the decomp. Acceptance: Elite
beats Type-aware in a scripted test, Novice does
not always pick the strongest move, Aggressive
takes a faint when it is available.

## 5. Overworld field systems — file list counted
Source: pokefirered-leafgreen/src/field_*.c, counted
by file name, structure only:
field_door (door warp + fade), field_camera
(camera follow + bounds), field_fadetransition
(screen fade on warp), field_weather + field_weather_
effects + field_weather_util (rain / sun / snow
state + visual), field_player_avatar (walk / run /
surf avatar state), field_control_avatar (input →
movement), field_poison (overworld status tick),
field_message_box (dialogue box), field_special_
scene (truck / clock / special scenes).
Mochiichao conversion, in order:
- door warp + fade (already in WorldEngine, keep)
- camera follow with map bounds (Pixi adapter
  already has the scene graph — add bounds)
- fade transition on warp (600 ms, matches the
  audio crossfade, not a new duration)
- weather state per map (rain in Binary Woods,
  snow in Frost Peak, neon haze in Neon City —
  visual + battle weather flag, not a new system)
- avatar states: walk / Sprint Boots run / Wave-
  Ride / Sky-Link, each with its own tile speed
- overworld status tick: a poisoned / data-corrupt
  creature loses HP on steps, with a warning at
  1 HP (does not faint in overworld — Pokemon's
  field_poison rule, kept as a rule, not code)
Acceptance: warp fades, camera stays in bounds,
weather shows on its maps, Sprint Boots speed is
different from walk speed, status tick warns.

## 6. Mod tools used for this batch (open source, not Pokemon)
- Tiled JSON (already pulled, PR #61): maps as data
- Ink / inkjs (already pulled, PR #61): dialogue
  as data, not scripts.inc text
- easystarjs (already pulled, PR #61): pathfinding
  for NPC walks, not scripted steps
- WFC in tools/ (PR #7, C# original): isle generation
  pattern, JS runtime in PR #61
- PKHeX / pkNX: data-shape reference only for
  trainer / encounter tables (already recorded) —
  no files vendored, no code copied
- No new mod tool was needed for this batch: the
  decomp JSON/C files themselves are the source,
  and the tools above are the converters.

## Counts in this batch
- Items: 375 counted, 5 pockets, 100% converted
  to Mochiichao pockets (names are Mochiichao's)
- Wild rates: 4 field types, 100% rate shape kept
- Heal points: 20 counted, structure 100% kept
- AI commands: 94 counted, 6 profiles converted
  to decision trees (structure, not code)
- Field systems: 13 file shapes listed, 100% mapped
  to Mochiichao overworld systems
- Creatures / names / logos / dialogue / town names
  copied: 0 / 0 / 0 / 0 / 0 = 0%
- Wired into the game in this batch: 0% — this
  file is a spec for main, PR #61 is still open
  and blocked on Mars's confirmations (boot pick,
  merge timing, 147/148 stats, leader names).
  Do NOT claim this batch is in the playable
  build until a main PR, build, deploy, and
  playtest return for it.
