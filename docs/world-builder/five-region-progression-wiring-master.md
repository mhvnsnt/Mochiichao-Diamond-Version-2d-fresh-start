# Five-Region Progression Wiring — Master

World Builder lane, 2026-10-25. This is the wiring master for
the whole game, in play order, after the 2026-10-25 start swap:
Region 1 = truck / move-in start, Region 3 = bedroom / lab start.
It does not replace the canon doc, the Region 1 wiring doc, or
the full-start spec — it is the checklist that ties them
together, region by region, system by system, so a builder can
walk the game from NEW GAME to the true ending without a
softlock, a missing door, or a battle that cannot be won with
the creatures available up to that point.

How sources were used: progression structure, counts, and
system shapes only, from the decomp reference data already
in the repo (`src/lib/generated/decomp_*`, pret Gen 1–4 pull
summary, Black 2 / HeartGold / FireRed extractions, and the
PokeAPI Gen 5+ reference). No dialogue text, no town or
character or creature names, no sprites, no music, and no
code from a commercial game were copied into Mochiichao.
Where a system in the reference games is proprietary in
expression — a specific town, a specific script, a specific
sprite — that slot is marked GAP FOR MARS below, for Mars to
fill with Mochiichao writing, open-source art, or his own
canon. That is the part he said he will help write in.

Repo rules: additions only, PRs only, no force-push, no
history rewrite, deletion check on every commit, merge gate
reads the deletion list (fresh-start AGENTS.md). Do not
apply this master by editing the live work clone from this
lane while v5 work is dirty there. Apply in main, in the
order in §9, one region's maps at a time, build + playtest
after each region.

## 1. The whole game, in one line per region

One save, one roster, one Codex, five regions, in order.
A region unlocks only after the previous region's post-game,
by a story link, never by a menu teleport.

- Region 1 — Mainframe. TRUCK START. Sector 0 move-in,
  Aeon rescue, Codex, Sprint Boots, 8 dojos, Elite Four,
  Champion Hex, Hall of Records, Seven Data Isles post-game
  → Data Ferry ticket → Region 2.
- Region 2 — Twin / Return. Data Ferry arrival, Dawnfield,
  8 dojos, burned-tower beasts, Elite Four, Champion,
  Hall of Records, Region 1 rematches, Frost Peak final
  battle → storm sea route → Region 3.
- Region 3 — Sea / Land. BEDROOM / LAB START (chapter
  opening, not a new game). Root Hamlet outpost bedroom,
  lab starter (additional partner), Hex lab battle, Codex
  upgrade + Cubes, 8 dojos, two Syndicate factions,
  legendary awakening, Elite Four, Champion, Hall of
  Records, Frontier Arenas post-game → airship route →
  Region 4.
- Region 4 — Rift. Airship arrival, Twinleaf Hamlet,
  8 dojos, lake guardians, Umbral Rift, Elite Four,
  Champion, Hall of Records, Battle Zone + Rift dungeon
  post-game → portal / train / ship signal → Region 5.
- Region 5 — New Continent. Portal train arrival, Start
  City, 8 dojos, Liberation Front, frozen legendary plot,
  Elite Four, Champion, Hall of Records, Grand Tournament
  + towers + preserve + grottos + Market Avenue + Bond
  Link post-game → Mainframe Plateau final ascent,
  Grand Champion Mythar, true ending, free play.

## 2. Every region, same skeleton — build this skeleton first

For each region, in order, build these in this order.
Do not build a region's Elite Four before its first town
works.

1. Arrival map + first house / outpost (see §3 for the
   two start templates).
2. First route: wild pool, trainers, tall-grass gate.
3. First town: MochiiPlex (heal), shop, signs, first
   dojo door. No town is "done" without heal + shop +
   a sign that names the town.
4. Routes, caves, forests, water routes, in play order,
   each with: wild pool, trainers, items on the ground,
   exits both ways, and the gate that locks the far side.
5. Dojos 1–8, in order: leader, theme (one of the 12
   True Elements), badge name, tech or road unlocked,
   acolytes / trainers inside, boss team built from
   roster species that exist with stats.
6. Antagonist arc: one cell, one hideout map, one defeat
   scene that changes the world (road opens, town frees,
   tech earned). No antagonist without a hideout map.
7. Victory Route (Gauntlet): high-level wild, veteran
   trainers, badge gate (8 badges).
8. League: Elite Four (4 separate battles, in order,
   no healing between them except the game's own heal
   point if one is placed there — record it, do not
   assume it) + Champion.
9. Hall of Records flag: set on Champion defeat, unlocks
   that region's post-game, not the next region directly.
10. Post-game checklist: the exact tasks that gate the
    next region (see §1). A region's post-game is not
    "more stuff" — it is the key to the next region.

## 3. The two start templates — swapped, in full

### Template T — Truck / Move-in — NOW Region 1, new game only
Maps, in order: truck interior → Sector 0 town →
house 1F → house 2F → house 1F again → town →
Route 1.0 (rescue) → Aeon Lab → town (Sprint Boots).
- Truck interior: inside view, boxes, exit light, step
  off. No battle, no wild, no shop. One exit: town.
- Town (Sector 0): Mom at the truck, walks player
  inside. Truck object hides after the scene.
- House 1F: movers, Mom, stairs. Mom line: go set the
  clock. No battle, no gift yet.
- House 2F: bedroom, clock (set clock UI — time set,
  no new system, reuse the game's clock if one exists,
  otherwise a simple confirm), PC, poster. Stairs down.
- Town again: go meet Hex's family, then north.
- Route 1.0 rescue: Aeon cornered by a wild creature,
  choose a starter from Aeon's bag (cursor + confirm,
  the only starter source in Region 1), battle the wild
  creature, Aeon safe, Aeon takes player to lab.
- Lab: Aeon gives Codex. No rival battle here in
  Region 1 — that beat moved to Region 3.
- Town, Sprint Boots beat: Mom stands in front of
  the house door, gives Sprint Boots, run toggle on
  (B to run, or the game's run button — record which
  input, do not invent a second run system).
- Then: Route 1.0 in full, Silicon Town, Dojo 1, etc.
  (see Region 1 wiring doc).
- New map keys for this template, add to FULL_WORLD:
  `sector0_truck`, `sector0_house_1f`,
  `sector0_house_2f`, `sector0_rival_house`.
  The old `sector0` town map stays, with a truck door
  / truck object added, not replaced.

### Template L — Bedroom / Professor / Lab — NOW Region 3 chapter opening
Maps, in order: outpost bedroom → outpost 1F →
town → lab → town.
- Bedroom: wake up in the outpost bedroom (not a new
  game, not a new player). PC, poster, stairs down.
  This is a chapter bedroom, not a reset.
- Outpost 1F: keeper NPC, line pointing at the lab.
  No battle, no gift yet.
- Town (Root Hamlet): signs, rival house door, lab door.
  No truck, no move-in, no clock.
- Lab: lab table with Region 3 starter balls, cursor +
  confirm, Hex lab-exit battle (advantage pick, level
  scaled to the chapter, not level 5 — record the level
  rule in the PR, do not reuse Region 1's level 5),
  researcher gives Codex upgrade + Capture Cubes,
  goal stated for Region 3.
- Then: Oldale Road, Rustboro Dojo 1, etc.
- New map keys for this template, add to FULL_WORLD:
  `root_hamlet_outpost_2f`, `root_hamlet_outpost_1f`,
  `root_hamlet`, `region3_lab`.
  Your main team is NOT wiped. The Region 3 starter
  is an additional partner. Main team rejoins under
  the badge gate (same gate as Region 2: ferry / badge
  scaling, recorded in the canon doc, not a reset).

### What did NOT swap
- Region 1's dojos, towns after Sector 0, Elite Four,
  Champion Hex, and Seven Data Isles did not move.
- Region 3's dojos, towns after Root Hamlet, factions,
  legendary awakening, and Frontier Arenas did not move.
- Only the opening template swapped. If a builder
  moves a dojo or a town because of the swap, that is
  a mistake — revert it.

## 4. Towns and places — every town must have these

A town is not a name on a map. A town, in this game, is:
- A town map, with exits both ways to its routes.
- A sign, interactable, naming the town.
- A MochiiPlex (heal centre) — interior map, nurse
  NPC (isHeal), or, in a hamlet with no centre, a
  named heal NPC and a recorded reason why there is
  no centre. Do not leave a town with no heal and no
  note.
- A shop — interior or clerk NPC (isShop), with a
  buy / sell list that matches the game's ShopView
  slots. No shop with no list.
- A dojo door, if the town has a dojo, or a recorded
  "no dojo in this town" note. Do not put a dojo door
  that opens nothing.
- At least one non-battle NPC with a line that tells
  the player something true about the town (where the
  dojo is, where the road goes, what the antagonist
  did here). No town of only battle NPCs.
- A route out, with the gate that locks it, if any
  (badge, tech, story flag, or none — record "none").

Existing Mochiichao towns that already meet most of
this: Sector 0 (town, lab door, Mom, signs — missing
house doors, see full-start spec), Silicon Town
(MochiiPlex heal + shop, Dojo 1, signs), Neon City
(signs, NPCs, side doors — missing a mainline dojo
door until Phase B). All other towns in §1 are new
maps, to be built in §2 order.

## 5. Centres, shops, and healing — the system, not just the rooms

- MochiiPlex = heal centre + shop in one building in
  the current game (`mochiiplex_1`). Keep that shape:
  one interior, nurse + clerk, doors back to town.
  Do not build a separate heal building and a separate
  shop building for every town unless the town's story
  needs it — one building per town is the template.
- Heal: full party heal, free, no limit, no new
  currency. Record it as free in the PR — do not
  invent a heal fee.
- Shop: buy / sell, confirmation before money changes
  (already in ShopView, keep it). Shop stock by town
  tier: early towns sell Capture Cubes, Mend Patch,
  and basic healing; later towns add Revive Core, Data
  Card, and tech items. Stock lists are GAP FOR MARS
  where a town's list is not in the current ShopView —
  Mars fills the list, the builder does not invent
  prices.
- PC / storage: Box 1, Party 0–6, already in PcView.
  Every MochiiPlex should have a PC access point, or
  a recorded reason why not. Do not build a second
  storage system.
- Save: SaveMenu, slots, overwrite confirm. Save
  anywhere in the overworld, load to the saved map —
  not to a random town tile, not to the bedroom unless
  that is where the player saved. That is a playtest
  gate, see §9.

## 6. HM / TM — field techs and battle moves, separated

Do not confuse the two. A field tech is a traversal
gate. A TM is a battle move taught by an item. The
reference games use the same words for both in some
cases — Mochiichao separates them, and this master
keeps them separate.

### Field techs (traversal, one per gate, stays forever)
From the canon doc, with the Mochiichao names:
- Data-Cut — cut data-vines / barriers. Earned: Region 1,
  Data Ferry beat (Phase B, not Dojo 2's old Cut reward
  — see Region 1 wiring Break 3, rename together).
- Wave-Ride — cross water. Earned: Region 1, Harbor City
  Preserve beat. Already gated in code as Surf to Boot Bay
  — rename Surf → Wave-Ride in engine + maps + tiles together.
- Sky-Link — fast travel to visited towns. Earned:
  Region 2 or later, record the exact town / NPC in the
  Region 2 PR, do not give it in Region 1.
- Heavy-Lift — push blocks. Earned: Region 1, Dojo 1
  (old Strength reward, rename together).
- Light-Pulse — light dark caves. Earned: Region 1,
  Signal Tunnel beat / cave gate, record the exact NPC.
- Cascade-Climb — climb waterfalls. Earned: Region 4
  or later, record the exact gate.
- Shatter — break cracked rock. Earned: Region 2 or 3,
  record the exact gate.
- Deep-Dive — dive under water. Earned: Region 3,
  Sootopolis-shape crater city beat.
- Sprint Boots — run toggle. Earned: Region 1, Mom
  in front of the house door, after Codex (truck start).
  This is not an HM, it is a movement toggle. Do not
  gate it behind a dojo.

Field tech rules: a tech is earned once, in a story
beat, with a dialogue line naming it, and then it works
in every later region. A tech must never be required
before it is earned, and a map must never require two
techs at once unless both are earned before that map
in play order. Check that in the PR, map by map.

### TMs / battle moves (items, teachable, not gates)
Reference counts, for scale only, from the pret pull
summary (not Mochiichao counts — Mochiichao's move
list is 36 in species.ts / MOVES_DB, and that is the
game's current list):
- Emerald / Ruby: 354 moves, TM/HM tables 372 species /
  8,927 entries, tutor 372 / 5,309 (Emerald only).
- Crystal: 251 moves, TM/HM 242 / 6,592, egg 105 / 480.
- Yellow: 165 moves, TM/HM 145 / 725, no egg (no breeding
  in Gen 1).
- Diamond: 470 moves, TM/HM 500 / 17,812, no per-species
  egg table in the JSON, tutors are NPC scripts.
- Black 2: 560 moves, learnsets 652 species, level 9,604,
  TM/HM 20,604, tutor 7,117, egg 2,773.
Use those counts to size the system, not to copy the
lists. Mochiichao TM list is GAP FOR MARS: Mars fills
TM names, types (12 True Elements only), power,
accuracy, PP, and which species can learn each, from
the Mochiichao roster — the builder does not invent
TMs from the reference lists, and does not paste the
reference TM tables into the game.

TM rules: a TM is an item, single-use or reusable —
record which, in the PR, do not assume it. A TM teaches
a battle move, it does not open a road. A move tutor
is an NPC who teaches a move for a cost or a condition
— record the cost, do not invent one.

## 7. Trainers, wild encounters, and battles — placement rules

### Trainer placement
Reference counts, for scale only:
- Emerald trainers 854 / 1,825 party members.
- Ruby trainers 693 / 1,486.
- Crystal trainers 541 / 1,254.
- Yellow trainers 47 class groups / 364 rows / 112 distinct.
- Diamond trainers 849 / 1,585, 0 unresolved.
- Black 2 trainers 814 / 1,808 party members, 0 unresolved
  (plus battle-facility trainers, separate, not yet extracted).
- HeartGold trainers 738 / 1,776 party members.
Mochiichao trainer counts are not those counts. Those
counts tell a builder: a full region has hundreds of
trainers, not dozens, and a route has a handful, not
one. Build to that scale, in play order, not all at once.

Placement rules, for every trainer, in every region:
- Class + name + team + level + reward + location.
  A trainer without a team is a dialogue NPC, not a
  trainer — do not label it as a trainer.
- Sight range / trigger: talk-to-battle, or sight-line
  battle if the engine supports it — record which, per
  trainer, do not assume sight-line works in the current
  engine (current engine battles on talk / event, see
  WorldEngine).
- Team level rule: a trainer's team must be beatable
  with the creatures available up to that map, at the
  levels a player who caught and trained normally would
  have. No trainer should require a creature from a
  later town. Check this in the PR, trainer by trainer,
  for the first route of each region especially.
- Dojo acolytes: inside the dojo, in order, levels
  rising to the boss. Boss level > acolyte levels.
  Boss team: theme = dojo's True Element, not a random
  mix, unless the dojo's story says otherwise.
- Elite Four: 4 battles, in order, levels rising, no
  heal between battles unless a heal point is placed
  and recorded. Champion: level > Elite Four, team
  built from the region's roster, not from a later region.
- Rematches: post-game rematches are stronger teams,
  same trainer, new team — record the rematch team
  separately, do not overwrite the first team.
- GAP FOR MARS: every trainer's team, level, and
  dialogue, except the ones already in FullWorldMaps
  (Sector 0, Route 1.0, Dojo 1, Binary Woods, etc.),
  is a gap for Mars to fill with Mochiichao writing
  and roster species. The builder builds the slots,
  the triggers, and the level curve — Mars fills the
  teams.

### Wild encounters
- Every route, cave, forest, water route, and preserve
  has a wild pool, a rate, and a level range. No map
  with tall grass / cave / water tiles and no pool.
- Pool rule: early maps use early creatures, later
  maps use later creatures, rare creatures are rare
  (record the rate, do not make a rare creature common
  by accident).
- Time of day: if a region uses day / night pools,
  record both pools, do not use one pool for both.
- Reference encounter counts, for scale: Emerald
  3 groups / 135 maps / 2,107 entries / 143 distinct;
  Crystal 153 blocks / 2,097 entries / 130 distinct;
  Yellow 632 entries (lower bound) / 75 distinct.
  Mochiichao's current wild pools are in FullWorldMaps
  (Route 1.0, Binary Woods, Cave of Echoes) — use those
  as the template, not the reference counts as the pool.

### Battle system — what is already wired, what is not
Already wired in the current game (BattleView, WorldEngine):
turn-based battles, wild + trainer, 2x2 move grid, PP +
TYPE, healthbox, Luigi Cube catch, flee (wild only,
not trainer), dojo badge award on boss defeat, blackout
heal on loss (30% HP, return to map start — record that
rule, do not change it silently).
Not wired as a full system in this master: double
battles (record as a future system, do not claim it),
Arena Mode presentation (separate view, not the main
battle), Creature Mode real-time combat (separate view),
Ring Capture (separate view, not a replacement for
Cubes). Those modes share the roster and save, they
do not replace Trainer Mode battles.

## 8. Trainer AI and NPC logic — the logic, not just the teams

Trainer AI, in this game, is a set of rules a trainer
follows in battle, not a copy of a reference game's AI
code. Build these AI profiles, in order, and assign
one profile per trainer class. Do not give every trainer
the same AI, and do not give a route trainer the Elite
Four AI.

- Novice (early route trainers, youngster / lass /
  bug catcher shape): pick a random move, or the first
  move that does damage. No switching, no item use,
  no type thinking. This is the default for Route 1.0.
- Balanced (town trainers, hikers, etc.): pick the
  highest-power move that is not obviously useless
  (e.g. do not use a status move on a fainted target),
  switch only if the active creature is at very low HP
  and a better type is in the party. No item use.
- Type-aware (dojo acolytes, gym-shape trainers):
  pick a move that is super-effective if one exists,
  otherwise the highest-power move; switch to a
  super-effective party member if the active one is
  weak to the player's active creature. No item use
  unless the dojo's story says the acolyte carries one.
- Defensive (tanks, healers, dojo bosses with a
  defensive theme): use a defensive / healing move
  when HP is below half, otherwise attack; switch to
  preserve a low-HP creature. Item use: one healing
  item per battle, maximum, recorded per boss.
- Aggressive (rival, champion, elite): pick the
  highest-damage move every turn, switch to keep
  type advantage, use an item only to avoid a loss
  (one per battle, recorded). Rival Hex uses Aggressive
  from the lab battle onward, not Novice.
- Elite / Champion: Aggressive + switching + one item,
  plus a recorded "signature" rule per Elite member
  (e.g. one Elite always leads with a status move, one
  always switches on a super-effective hit) — GAP FOR
  MARS: Mars writes the signature rule, the builder
  does not invent it.
- Wild creatures: no AI profile, just a move list.
  Wild creatures do not switch, do not use items, do
  not heal. Record that, do not give wild creatures
  trainer AI by accident.

NPC logic, outside battle:
- Talk NPC: face player, dialogue, no battle, no gift
  unless recorded.
- Heal NPC: nurse, full heal, no battle.
- Shop NPC: clerk, shop UI, no battle.
- Gate NPC: blocks a road until a flag / badge / tech,
  with a dialogue line naming the requirement. No gate
  NPC without a line naming the requirement.
- Sign NPC / sign object: interactable, text, no battle.
- Wandering NPC: moves in a pattern, faces player on
  talk. Do not give a wandering NPC a battle trigger
  unless the trigger is recorded.
- Antagonist NPC: battle on talk, or on trigger, with
  a defeat scene that changes a flag. No antagonist
  without a defeat flag.
- All NPC logic must be in map data (npcs / events /
  doors / exits), not in a second, hidden system.
  If a builder needs a new NPC behaviour, add it to
  WorldEngine's event handling and record it in the PR,
  do not hack it into a single map.

## 9. Traversal — how you get from one place to the next, all of it

Traversal is not "walk north". Traversal is: walk, run
(Sprint Boots, Region 1), cut (Data-Cut), surf / wave-ride
(Wave-Ride), push (Heavy-Lift), light (Light-Pulse),
climb (Cascade-Climb), break (Shatter), dive (Deep-Dive),
fly / fast travel (Sky-Link), ferry / ship / train /
airship / portal (story transport, not a tech), and
doors / stairs / warps (interiors).

For every map, record: how you enter, how you leave,
what gate locks the far side, and what transport, if
any, is used. A map with only one way in and no way
out is a bug, not a design — except a dead-end cave
with a recorded return exit, which is still two ways
(in and out, same door).

Story transport, by region link:
- Region 1 → 2: Data Ferry, after Seven Data Isles,
  ferry ticket item.
- Region 2 → 3: storm sea route, after Frost Peak,
  expedition signal.
- Region 3 → 4: airship, after Frontier Arenas,
  mountain pass route.
- Region 4 → 5: portal / train / ship signal, after
  Rift sealed, all three point the same way.
- Region 5 → true ending: Mainframe Plateau final
  ascent, after Grand Tournament, no transport item
  needed, just the gate flag.

No transport should be a menu teleport. Every link
is a map, a door, a ticket, or a flag, recorded in
the PR.

## 10. Playtest gates — the game is playable when these pass

Not "when the files exist". When these pass, in order,
fresh save, no cheats:

1. NEW GAME → truck start (Region 1) → house → clock →
   Hex family → Route 1.0 rescue → Lab Codex →
   Sprint Boots → Route 1.0 in full → Silicon Town.
2. Silicon Town → Dojo 1 → Binary Woods → Cave →
   Neon → Phase B towns → Dojo 8 → Victory Route
   (8 badges gate) → Plateau → Elite Four → Champion
   Hex → Hall of Records → Seven Data Isles → Region 2.
3. Region 2 arrival → 8 dojos → Elite → Champion →
   Hall → rematches → Frost Peak → Region 3.
4. Region 3 chapter opening (bedroom / lab) → 8 dojos →
   legendary awakening → Elite → Champion → Hall →
   Frontier Arenas → Region 4.
5. Region 4 → 8 dojos → Rift → Elite → Champion →
   Hall → Battle Zone + Rift dungeon → Region 5.
6. Region 5 → 8 dojos → Elite → Champion → Hall →
   Grand Tournament → towers / preserve / grottos /
   Market Avenue / Bond Link → Mythar → true ending
   → free play, save / load to the saved map.
7. Every town: heal works, shop works, signs respond,
   doors open, no dead door, no softlock, no trainer
   that cannot be beaten with the available roster.
8. Every tech: earned in order, works in every later
   region, never required before it is earned.
9. Save / Continue / Load: return to the saved map,
   not a random tile, not the bedroom unless saved there.
10. No commercial game's dialogue, town, character,
    creature, sprite, music, or code in the build.
    If a builder finds one, remove it and report it —
    do not rename it and keep it.

## 11. GAPS FOR MARS — the parts Mars said he will fill

Mars, 2026-10-25: parts that are too proprietary or
too copyright to wire up, he will help write in and
fill with other stuff, open source, and writing from
him and from canon. Those gaps, in order, are:

1. Every trainer team, level, and dialogue not already
   in FullWorldMaps. Slots and level curve are built
   by the builder; teams and lines are Mars's.
2. Every TM name, type, power, accuracy, PP, and
   learnset not in species.ts / MOVES_DB. The system
   is built; the list is Mars's.
3. Every dojo leader name, theme, badge name, and
   signature AI rule not already in the game (Lin,
   Falk, etc. are already in, keep them).
4. Every Elite Four / Champion team and signature rule,
   except Hex in Region 1 (already a rival, team
   built from the starter advantage rule).
5. Every town shop stock list and price not in ShopView.
6. Every story script's dialogue lines, in Mochiichao
   words, for every beat in the canon doc. The beat
   list is built; the lines are Mars's.
7. Every building interior's props and layout not
   already in an existing interior map. The interior
   shape is built; the props are Mars's / open-source.
8. Every creature, move, and item name that would
   otherwise be a commercial game's name. The roster
   IDs are Mochiichao's (001–047, 147–148, etc.), the
   names must be Mochiichao's.
9. Open-source art choices where a licence needs a
   decision (LPC CC-BY-SA / GPL, game-icons CC BY
   attribution, etc.). Mars decides, the builder
   does not vendor without that decision.

When Mars fills a gap, the builder wires it in, in
the same PR order as §9, and the gap is removed from
this list in the next version of this master. A gap
is not "done" because a placeholder was written —
a placeholder is labelled placeholder, in the file,
until Mars fills it.
