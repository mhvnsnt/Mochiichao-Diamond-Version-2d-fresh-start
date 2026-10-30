# Full Start Spec — Mochiichao, built from the FireRed / LeafGreen flow

World Builder lane, 2026-10-25. This is the start Mars asked for:
not a random spawn, not an open world with everything unlocked —
the exact beat order FireRed / LeafGreen uses after NEW GAME,
rebuilt with Mochiichao people, places, and dialogue.

How the source was used: structure and event order only, from
the decomp files in the work clone. No dialogue text, no town
names, no character names, no sprites, no music, and no code
were copied into Mochiichao. The Mochiichao scenes below are
written fresh, in Mochiichao canon, to hit the same beats.

Source files checked, in the work clone
`pokefirered-leafgreen/`:
- `src/intro.c` — cinematic task chain, then exit to title
- `src/title_screen.c` — title screen
- `src/main_menu.c` — main menu windows, CONTINUE stats
- `src/oak_speech.c` — Professor speech task chain, gender,
  naming, rival naming, exit animation
- `src/new_game.c` — NewGameInitData, WarpToPlayersRoom
- `data/maps/PalletTown*/map.json` and `scripts.inc` —
  house 2F / house 1F / town / lab / rival house, warps,
  triggers, and the lab starter / rival battle / Dex scene

Repo rules that apply to applying this spec (from
`fresh-start/AGENTS.md`): PRs only, no force-push, no history
rewrite, no deletions outside the task's scope, deletion
check on every commit (read git status + diff stat, every
deleted file must be intended), merge gate reads the
deletion list. This spec adds maps and events only. It
deletes nothing. Do not apply it by editing the live work
clone from this lane while v5 Sector 0 / Lab / WorldEngine
work is dirty there — apply it in main, in one PR, after
v5 lands.

## 1. The FireRed / LeafGreen flow, beat by beat (structure only)

### 1a. Boot → cinematic → title → main menu
1. Intro cinematic, in task order: logo / star reveal,
   then Scene 1 (grass scrolling, background zoom), Scene 2
   (forest pan, creature sprites), Scene 3 (battle entrance,
   attack, recoil, zoom), then exit to title screen.
2. Title screen, press start.
3. Main menu, as separate framed windows, not one list:
   - No save: NEW GAME only, one window.
   - Save exists: CONTINUE (tall window, with player name,
     play time, Dex count, badge count inside it) + NEW GAME
     (short window below it).
   - Mystery Gift window only if that feature is enabled.
     Mochiichao has no equivalent — do not invent one.
4. NEW GAME, with an existing save, asks overwrite confirm
   before erasing anything. That confirm is before the
   Professor speech, not after it.

### 1b. Professor speech — the task chain, in order
From `oak_speech.c`, task by task:
Welcome to the world → This world is inhabited far and wide
(creature released from its ball on screen) → I study these
creatures as a profession (creature returned to its ball) →
Tell me a little about yourself → Fade the Professor out →
Ask: are you a boy or a girl? (Boy / Girl menu) → Load the
player picture → Your name, what is it? (naming screen) →
Confirm name → Fade the player picture out → Fade the rival
picture in → Ask: what is your rival's name? (naming screen) →
Confirm rival name → Reshow the player picture → Let's go →
Fade out the music → Shrink the player picture → Destroy
the platform sprites → Fade the player picture white, then
black → Free resources.
Then `NewGameInitData` runs: party cleared, Dex flags
cleared, play time reset, money set, bag cleared, PC items
set, trainer ID generated, and then the warp.

### 1c. The warp — this is the "do not start in a random area" rule
`WarpToPlayersRoom` in `new_game.c` warps to exactly one
place: the player's house, 2nd floor, at tile (6,6).
Not the town. Not a route. Not the lab. The bedroom.

### 1d. House 2F → House 1F → Town, in order
House 2F (`map.json`):
- Warp: stairs at (10,2) → House 1F.
- Interactables: PC at (1,1), a console / NES sign at (6,5),
  a poster sign at (11,1). No NPCs, no battles, no exits
  except the stairs.
House 1F:
- NPC: Mom at (8,4), facing left.
- Interactable: TV sign at (6,1).
- Warps: door at (5,8) and (4,8) → Town; stairs at (10,2)
  → House 2F.
- Mom's script branches on state: first visit, she says
  the Professor is looking for you and to go to the lab;
  after the rival battle in the lab, talking to Mom heals
  the party.
Town:
- Warps: player house door at (6,7) → House 1F; rival
  house door at (15,7) → Rival House; lab door at (16,13)
  → Lab.
- Connections: north → Route 1; south → Route 21 (later).
- NPCs: a sign-lady wandering near the town sign, a
  wandering townsman, and the Professor — hidden in town
  until the trigger below fires.
- The route trigger: if the player steps onto the north
  route tiles with no starter, the Professor trigger fires
  (left trigger and right trigger both lead to the same
  script): lock the player, Professor music, player walks
  in place, exclamation, Professor walks to the player,
  leads the player to the lab, both enter the lab, hide
  the Professor in town, show him in the lab, do not
  transition the music. The player does not get to walk
  into tall grass and meet wild creatures first. The
  Professor intercepts them first.

### 1e. Lab — starter, rival battle, Dex + balls, in order
Lab, on transition: set "visited lab" flag. On warp, set
up the starter scene.
Choose-starter scene:
- Professor enters, player enters, rival reacts.
- Three balls on the lab table. Interacting with a ball
  shows that creature and asks confirm. This is the only
  starter source in the game.
- The player picks one. The rival picks the ball that is
  strong against the player's pick.
- Leaving the lab: rival battle triggers on the exit
  tiles (left, middle, and right triggers all lead to the
  same battle, with the rival's approach movement depending
  on which exit tile and which starter the player picked).
  Rival team: one creature, level 5, the advantage pick.
- End of rival battle scene, in order: set "beat rival in
  lab" flag, fanfare, give the Dex (Dex-get flag set,
  Dex unlocked), give 5 capture balls, explain catching,
  rival leaves the lab (exit music, remove rival object),
  set the scene variables that open the next beats
  (lab scene, next town's mart scene, old-man scene,
  rival house scene, Route 22 scene). Only then is the
  player free to leave town.
- Note on win / lose: FireRed's first rival battle is a
  normal trainer battle. Mochiichao's current code already
  made a deliberate change here — win OR lose, the flow
  continues and the goal is stated either way. Keep that
  change, and say so in the PR, do not silently claim it
  is FireRed's rule.

### 1f. Route 1 → first town
- Route 1, north of town: wild creatures only in FireRed,
  no trainers. Tall grass is the first wild encounter
  area, and it only opens after the Dex + balls beat.
- First town after Route 1: heal centre, shop, first
  trainers on the road, and the road onward. In Mochiichao
  terms that town is Silicon Town, and the heal / shop
  are already in the MochiiPlex map.

## 2. What Mochiichao already has — and what is wrong with the start

Verified in the work clone, `src/components/IntroSequence.tsx`,
`src/store/gameStore.ts`, `src/world/FullWorldMaps.ts`,
`src/world/WorldEngine.tsx`:

What already matches FireRed's shape:
- IntroSequence phases, in order: CINEMATIC → TITLE →
  MAIN_MENU → SAVE_SLOTS → PROF_INTRO_1 → GENDER_SELECT →
  NAME_ENTRY → RIVAL_NAME → PROF_INTRO_2 → world.
- Prof intro text is Mochiichao canon (Aeon, Mainframe
  Region, Mochiichao), with a dialogue box, portrait, and
  continue arrow — not a scrolling log.
- Gender, player name, and rival name (default Hex) are
  separate phases, with confirm, in the same order as
  the Oak speech chain.
- Lab starter balls exist (5 in Mochiichao: Mochii 001,
  Razorgater 004, Tyrage 007, Kittember 010, Sproutle 038;
  Dorowani 147 / Gabu 148 are display-only, Gen 2, not
  choosable — keep that).
- Lab-exit Hex battle event exists (`hex_battle_event`,
  condition `hasStarter`, at lab (6,12)), with a dynamic
  table-order-next starter for Hex, not a fixed team.
- Route 1.0 gate exists: `block_route_1` events at
  Sector 0 y=1, condition `noStarter`, with the "dangerous
  without a partner, go see Prof. Aeon" message.
- Mom-first dialogue exists in WorldEngine: on first
  Sector 0 entry with no partner, Mom speaks first and
  points at the lab. It fires once.
- After the Hex battle, win or lose, the goal dialogue
  exists (`v4_hex_goal`): dojos, Champion Mythar, Hackers
  / Syndicate, Route 1.0 open, first town Silicon Town.

What is wrong, numbered, in play order:
- G1 — Spawn is the town, not the house. IntroSequence
  PROF_INTRO_2 ends with `setMapState('sector0', {x:15, y:18})`,
  which is Sector 0's town playerStart. The store default
  is even further from the flow: `sector0` at (21,14).
  Neither is a bedroom. Fix: spawn = new house 2F map,
  see §3.
- G2 — There is no house. No `sector0_house_1f` or
  `sector0_house_2f` map exists in FULL_WORLD. Mom is a
  town NPC at Sector 0 (5,7), not inside a house. There
  is no PC, no console sign, no poster, no TV, no stairs.
  The live playtest already found this symptom: entering
  buildings opened nothing.
- G3 — There is no Professor lead-to-lab trigger. The
  current gate is a block message at y=1. The player can
  walk to the lab on their own, which is fine, but the
  scripted "Aeon stops you at the route and walks you
  to the lab" scene from FireRed does not exist. Add it
  as an event, do not replace the block gate with it —
  both should exist: block if no starter, lead-to-lab
  if the player tries the route edge with no starter.
- G4 — Gift order is reversed, and the cube count is
  wrong. In the current code, picking a starter gives
  5 Luigi Cubes at the pick beat, and the wallet already
  starts with 10, so the player holds 15 and the "gifted
  you 5" line does not match the total. FireRed gives
  0 balls at the pick and 5 balls + Dex after the rival
  battle. Fix: wallet starts with 0 Luigi Cubes, pick
  gives the starter only, after the Hex battle Aeon
  gives the MochiDex + 5 Luigi Cubes, total 5, then the
  goal. Do not change the 1000 CR start money in this
  spec — that is a Mochiichao decision, not a FireRed
  number (FireRed starts at 3000 money, which is not
  the same currency).
- G5 — Duplicate Hex battle. Sector 0 has a `rival_hex`
  NPC at (15,10) with its own battle team (fixed
  Razorgater), and the lab has `hex_battle_event`.
  Talking to town Hex before the lab would battle out
  of order, with the wrong team. Fix: town Hex is
  dialogue-only until after the lab battle, then his
  town dialogue changes. The lab exit battle is the
  only first battle.
- G6 — SAVE_SLOTS is an extra screen FireRed does not
  have. FireRed goes Main Menu → NEW GAME → Professor
  speech directly. Mochiichao goes Main Menu → NEW GAME
  → overwrite confirm → SAVE_SLOTS → Professor speech.
  Keep the slots — they are Mochiichao's web save
  system, and choosing a slot before the intro is sane —
  but record it as an intentional deviation, not as
  "the FireRed flow". Do not remove the save system to
  chase exactness.
- G7 — Sector 0 buildings have no doors except the lab.
  Sector 0's north buildings are tiles, with only one
  door in the file: (10,3) → aeon_lab. The player house
  and rival house have no door, no interior, and no
  sign telling the player which building is which.
  Fix: add the two doors in §3, plus a town sign and
  house signs.
- G8 — Route 1.0 has trainers before the first town.
  FireRed Route 1 has wild only. Mochiichao Route 1.0
  has 4 trainers (Jay, Amy, Dan, Rick) at levels 3–6.
  Keep them — they are an expansion, not a bug — but
  they must not block the road to Silicon Town, and
  their levels must stay below Dojo 1's levels.
- G9 — Silicon Town has no first-visit beat. MochiiPlex
  heal + shop already exist, Dojo 1 already exists,
  but there is no "you arrived in your first town"
  sign or NPC line that tells a new player they are
  in the first town. Add one sign and one town NPC
  line, in §3, not a new system.

## 3. The build — full town and full start, in order

Apply in main, in this order, additions only, one PR.
Each step must be playable before the next step starts.

### Step 1 — House maps (new keys, add to FULL_WORLD)
Use the same map shape as the existing interiors
(`buildMap`, `npcs`, `signs`, `exits`, `doors`, `events`,
`encounters: []`, `interior: true`).

- `sector0_house_2f` — "Sector 0 — Your Room"
  Size 12x10, interior, no encounters, no battles.
  Tiles: bedroom floor, bed, desk, PC tile, console tile,
  poster tile, stairs tile at the south edge.
  NPCs: none.
  Signs / interactables, in FireRed positions translated
  to this grid: PC (interact → PC / storage note, no new
  system), console (interact → a short Mochiichao line,
  no game), poster (interact → a short Mochiichao line).
  Exits: stairs door at the south edge → sector0_house_1f,
  enterAt at the stairs top in 1F.
  PlayerStart: (6,6) — the FireRed warp tile, translated
  to this grid. This is the new-game spawn. No other
  spawn is used for a new game.

- `sector0_house_1f` — "Sector 0 — Home"
  Size 12x10, interior, no encounters.
  NPCs: Mom, at the kitchen side, facing the player.
  Mom script, in order, by state:
  * First visit, no starter: "Aeon is looking for you.
    Go to his lab, just north of here." — then the player
    is free to leave. This replaces the current town
    Mom-first auto-dialogue. The auto-dialogue in
    WorldEngine (`v4_mom_intro`) must be removed when
    this map lands, or Mom will speak twice.
  * After the lab rival battle: talking to Mom heals
    the party (the existing heal logic, not a new system).
  * Any other time: a short home line, no battle, no gift.
  Signs: TV sign, interact → a short Mochiichao line.
  Doors / exits: front door → sector0, enterAt at the
  house door tile in town; stairs → sector0_house_2f,
  enterAt at the 2F stairs tile.

- `sector0_rival_house` — "Sector 0 — Hex's House"
  Size 10x8, interior, no encounters, no battle.
  NPCs: one family NPC, short line, no gift, no battle.
  This map exists so the rival house door in town is
  not a dead tile. It is not a story map. Do not put a
  starter, a Dex, or a battle in it.

### Step 2 — Sector 0 town doors, signs, and the route trigger
In the existing `sector0` map, additions only:
- Door: player house door tile → sector0_house_1f,
  enterAt at the 1F front door. Place it on the north
  building that is NOT the lab. Record the exact tile
  in the PR — do not guess it from the old tile grid,
  read the grid at apply time.
- Door: rival house door tile → sector0_rival_house,
  enterAt at its front door.
- Signs: town sign ("Sector 0 — Boot Harbor"), house
  sign ("Your House"), lab sign (already exists as a
  sign tile, keep it), route sign (already exists at
  (15,5), keep it).
- Town Hex: remove the `battle` field from the
  `rival_hex` NPC in sector0. Keep his dialogue, change
  it to dialogue-only until after the lab battle, then
  a short post-lab line. The lab exit battle stays the
  only first battle.
- Route trigger: add an event at the north route edge,
  condition `noStarter`, that fires the Aeon lead-to-lab
  scene: lock player, Aeon appears at the player's
  side, Aeon dialogue (Mochiichao words: tall grass is
  dangerous without a partner, come to my lab), Aeon
  and player walk to the lab door, both enter aeon_lab.
  This is a scripted walk, not a teleport — use the
  existing movement / door system, do not add a new
  cutscene engine. Keep the existing `block_route_1`
  events as the fallback if the trigger is bypassed.

### Step 3 — IntroSequence spawn fix
In `src/components/IntroSequence.tsx`, PROF_INTRO_2
`onComplete`:
- Before: `setMapState('sector0', {x:15, y:18})`.
- After: `setMapState('sector0_house_2f', {x:6, y:6})`.
- Loaded saves are untouched — this only runs at the
  end of a new-game intro.
- Store default in `gameStore.ts` (`sector0` at (21,14))
  must also change to the house 2F spawn, or a fresh
  load before the intro completes will still land in
  a random town tile. Change the default, do not leave
  two spawns in the code.
- Prof intro text stays Mochiichao canon. The last
  Prof line must change from "Go home first — your Mom
  is waiting" to "Wake up at home — your Mom is waiting
  downstairs" if the spawn is now the bedroom, or the
  line will contradict the spawn. That is a one-line
  text change, not a new scene.

### Step 4 — Lab gift order fix
In `src/world/WorldEngine.tsx`, in this order:
- Wallet / inventory start: Luigi Cubes start at 0,
  not 10. Record the exact start inventory in the PR.
- `handleChoice` (pick starter): give the starter
  only. Remove the "gifted you 5 Luigi Cubes" lines
  from the pick dialogue. The pick dialogue is: you
  chose your partner, Aeon approves, good luck.
- After the Hex battle (`hex_battle_event`, win or
  lose, via the existing `v4_hex_goal` path): Aeon
  gives the MochiDex + 5 Luigi Cubes, in that order,
  then states the goal (dojos, Champion Mythar,
  Hackers / Syndicate, Route 1.0 open, first town
  Silicon Town). The Dex gift must set a flag the
  game can check — use the existing Dex / save state,
  do not invent a new Dex system in this PR.
- Total after this beat: 1 starter, 1 MochiDex,
  5 Luigi Cubes, 1000 CR. No other items. Verify the
  total in the playtest, do not trust the dialogue
  wording alone.

### Step 5 — Route 1.0 → Silicon Town, first-town beat
No new maps in this step. Route 1.0 and Silicon Town
already exist and already connect.
- Route 1.0: keep the 4 trainers, keep the wild pool
  (Sproutle / Mochii / Kittember / Zephling), keep
  the tall-grass gate (encounters only after starter
  + cubes — the engine already gates tall grass on
  having a starter; extend that gate to also require
  the post-battle Dex + cubes flag, or a player who
  somehow has a starter without the battle could
  catch before the goal is stated).
- Silicon Town (`binary_fields`): add a first-visit
  sign at the town entrance ("Silicon Town — First
  Town of the Mainframe Region") and one town NPC
  line pointing at the MochiiPlex (heal / shop) and
  Dojo 1. The MochiiPlex heal + shop and Dojo 1
  already exist — do not rebuild them.
- Dojo 1 stays as the first dojo. No other dojo
  changes in this PR.

## 4. Playtest gate — the start is done when this passes

Fresh save, no cheats, no skipped steps, in order:
1. Cinematic → Title → Main Menu → NEW GAME →
   overwrite confirm (if a save exists) → Prof Aeon
   intro → Boy / Girl → Name → Rival name (Hex
   default) → Prof closing.
2. Spawn in your bedroom, House 2F. PC, console, and
   poster all respond. Stairs down work.
3. House 1F: Mom speaks first, points at the lab.
   Front door out to Sector 0 works. Rival house
   door works, no battle inside.
4. Sector 0: town sign, house sign, lab sign all
   respond. Town Hex is dialogue-only, no battle.
5. Try Route 1.0 with no starter: Aeon lead-to-lab
   scene fires, or the block message fires — either
   way, you do not reach tall grass with no partner.
6. Lab: 5 starter balls, pick one, confirm, Hex
   battle on lab exit (Hex with the advantage pick),
   win or lose the flow continues.
7. After the battle: Aeon gives MochiDex + 5 Luigi
   Cubes, total 5, then states the goal. Inventory
   shows exactly that.
8. Route 1.0: wild encounters work, trainers work,
   road north to Silicon Town works.
9. Silicon Town: first-town sign responds, MochiiPlex
   heal + shop work, Dojo 1 is reachable.
10. Save, Continue, load: you return to the map you
    saved on, not to a random town tile, and not to
    the bedroom unless that is where you saved.

If any step fails, report the failing step by name —
"Spawn is still sector0 town", "House door opens
nothing", "Cubes total is 15, not 5", "Town Hex
battles before the lab" — not "the start is broken".

## Swap appendix — 2026-10-25, Mars's decision

The truck start is now Region 1's start, and the
bedroom / lab start is now Region 3's chapter opening.
The correction appendix below is still true about which
game each start came from — only the assignment to
Mochiichao regions has swapped. Region 1's new opening
is fully specified in
`five-region-progression-wiring-master.md` §3 Template T.
Region 3's new opening is §3 Template L in the same file.
Everything else in this spec (house maps, gift timing,
lab-exit battle rule, playtest gate) still applies, with
the region labels swapped as above: the lab-exit Hex
battle is now a Region 3 beat, not a Region 1 beat, and
the Sprint Boots beat is now a Region 1 beat, after
the Codex, not a Region 3 beat.

## Correction appendix — the moving-truck start is NOT LeafGreen

Added 2026-10-25, after Mars asked to be corrected if wrong.
He was remembering the right beats, but the wrong game.

The moving-truck start is Ruby / Sapphire / Emerald
(Hoenn, Gen 3), verified in `pokeemerald/` in the work clone,
not FireRed / LeafGreen (Kanto, Gen 1 remake).

Hoenn start, in file order, structure only:
- `new_game.c`: WarpToTruck, not WarpToPlayersRoom.
- Truck interior sequence (`field_special_scene.c`:
  Task_Truck1 / Truck2 / Truck3, ExecuteTruckSequence),
  then step off the truck in Littleroot Town.
- Mom meets the player at the truck, walks the player
  inside the house (`GoInsideWithMom`, intro state 3).
- House 1F: movers, Mom tells the player to go set the
  clock, upstairs to 2F, set the clock (`wallclock.c`
  Task_SetClock chain), back downstairs.
- Go meet the rival (rival's house, rival's mom),
  then north to Route 101.
- Route 101: Professor Birch chased by a wild creature,
  choose a starter from Birch's bag, battle it, Birch
  takes the player to his lab.
- Lab: Birch gives the Dex (town state becomes 3,
  "Received Pokedex").
- Back in Littleroot Town, with town state 3, Mom
  standing in front of the house door fires the
  Running Shoes trigger (coord events at town tiles,
  `GiveRunningShoesTrigger`, sets FLAG_SYS_B_DASH and
  town state 4, "Received Running Shoes").
- Only then leave town for good: Oldale, Route 102,
  and the rival battle later — not a lab-exit rival
  battle like LeafGreen, and not "fight rival, then
  get running shoes". In Hoenn the order is Dex,
  then running shoes from Mom, then leave.

LeafGreen start, for contrast, has no truck, no
move-in, no clock, and no running-shoes beat at the
start: Oak speech, bedroom in the town you already
live in, Mom downstairs, Oak stops you at Route 1,
lab starter, rival battle on lab exit, Dex + 5 balls
after that battle, then Route 1.

For Mochiichao: Region 1 in the five-region canon is
the LeafGreen shape (Sector 0, Aeon, Hex lab battle),
so the truck / move-in / clock / running-shoes
sequence belongs to Region 3, the Hoenn-shape region,
if it is used at all — not to Region 1's start.
Do not swap Region 1's start to the truck sequence
without Mars explicitly saying so.
