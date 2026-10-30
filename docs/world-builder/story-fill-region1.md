# Story Fill — Region 1 Mainframe (original Mochiichao writing)

World Builder lane, 2026-10-25. This fills the dialogue,
town, sprite, music, and code slots for Region 1, in play
order, after the start swap (truck start, see the wiring
master §3 Template T). Template source: the reference
games' progression structure — town → route → dojo →
antagonist beat → next town — not their dialogue, town
names, characters, sprites, music, or code. Every line
below is new Mochiichao writing, in Mochiichao names.
Every sprite / music slot names an open-source pack
(see assets-code-fill-plan.md) or a Mochiichao-original
asset to be made. No commercial game's text, town, or
tune is in here.

How to read a beat: DIALOGUE = exact lines to put in
the dialogue box, in order. SPRITE = art slot. MUSIC =
music slot. CODE = map / event / flag slot to wire.
A trainer team lists only roster species that already
exist in the game (001 Mochii, 004 Razorgater, 007
Tyrage, 010 Kittember, 038 Sproutle, plus the 12-species
game list). Any other team slot is marked ROSTER GAP —
the builder does not invent stats for a species that
does not exist yet.

## Beat 0 — Title, intro, Aeon intro (before the truck)

DIALOGUE — Aeon, intro (original):
- "Welcome. I am Professor Aeon."
- "This world runs on data, and data wakes up.
  When it wakes, it becomes a Mochiichao."
- "Some people keep them. Some raise them. Some
  fight beside them. You will do all three, if
  you stay on the road."
- "Tell me about yourself, first. Are you a boy
  or a girl?"
- [player choice]
- "And your name?"
- [naming screen]
- "And the friend who moved in next door? The
  one who will push you to be better?"
- [rival naming, default Hex]
- "Good. Your truck is already on the road to
  Sector 0. Go. Your new life is unpacking."

SPRITE: title-bg-key-art (already in sprite-art lane,
v1 needs v2 per that lane), Aeon portrait v2-black
(human-characters lane). MUSIC: title loop — CC0
chiptune, calm / dawn, see assets plan. CODE: intro
sequence → title → main menu → Aeon intro → gender →
name → rival name → truck warp. No save = NEW GAME
only; save = CONTINUE + NEW GAME.

## Beat 1 — Sector 0, truck start

Town layout (original, 1 screen, not a copy):
- North edge: road to Route 1.0, blocked until the
  Sprint Boots beat (see below).
- West: your new house (door, 2 floors). East: Hex's
  house (door, 1 floor + bedroom sign). South: town
  sign, truck parking spot (truck object, hides after
  the scene). Centre: Aeon's Lab (door).
- Tiles: Kenney Tiny City / Tiny Town CC0, restyled
  to Mochiichao palette (teal / cream / data-blue),
  not raw Kenney dropped in unstyled.

DIALOGUE — Mom, at the truck:
- "There you are! The truck beat us here."
- "Come inside. Your room is upstairs. The boxes
  can wait. Go set the clock first — a new home
  needs a correct time."
DIALOGUE — Mom, house 1F, after clock:
- "Good. Now go say hello next door. Hex's family
  just moved in too. You two will need each other
  out there."
DIALOGUE — Hex's family, next door:
- "So you're the new neighbour! Hex is already
  outside, looking for trouble. Go with him — but
  come back before dark."
DIALOGUE — Aeon, Route 1.0 rescue (after Hex family):
- "Help! My bag — the wild one got loose!"
- [choose a starter from Aeon's bag: Mochii / Razorgater /
  Tyrage, cursor + confirm, the only starter source]
- [battle the wild creature]
- "You saved me. Thank you. Come to my lab.
  I have something for you, and for your journey."
DIALOGUE — Aeon, lab:
- "This is the Codex. It records every Mochiichao
  you meet. Keep it safe."
- "And these are Capture Cubes. Throw one at a
  wild Mochiichao, and if it stays, it travels
  with you. That is the whole job, really."
DIALOGUE — Mom, in front of the house door, after Codex:
- "Wait. Before you run off — here. Sprint Boots.
  Hold B and you can run. A trainer who cannot
  run will always be late."
- [Sprint Boots flag set, run toggle on]

SPRITE: truck (Kenney Tiny City vehicle, restyled),
house exteriors (Tiny Town), Mom / Aeon / Hex
portraits (human-characters lane, not a copy).
MUSIC: town loop, calm. CODE: maps sector0_truck,
sector0_house_1f, sector0_house_2f, sector0_rival_house,
sector0, aeon_lab; flags: clock_set, met_hex_family,
aeon_rescued, codex_get, sprint_boots_get; gate:
north road locked until sprint_boots_get.

## Beat 2 — Route 1.0, first route

Layout: tall data-grass patches, 2 trainer sight
lines, 1 item on the ground (Capture Cube x2, on the
ground, not in a shop yet).
Wild pool: Mochii, Kittember, Sproutle, plus one
ROSTER GAP slot (early Mainframe wild, to be filled
when the roster expands — do not invent a species here).
Trainers (original, level curve for a starter at Lv 5-8):
- Young trainer Jay, Lv 5-6, team: 1 creature, ROSTER
  GAP slot + Kittember. DIALOGUE: "I just started too!
  Let's see who's faster." / after: "Okay, you're fast."
- Young trainer Amy, Lv 6-7, team: Sproutle + ROSTER GAP.
  DIALOGUE: "My Sproutle loves this grass." / after:
  "It likes you too, I think."
No trainer here blocks the road. Both are talk-to-battle.
SPRITE: grass tiles (Kenney Tiny Town / 0x72 CC0),
trainer sprites (human-characters lane). MUSIC: route
loop, bright. CODE: wild encounters, trainer events,
item event, exit north to Silicon Town (no gate).

## Beat 3 — Silicon Town, Dojo 1, Mochi Garden opens

Town layout: MochiiPlex (heal + shop + PC, one building),
Dojo 1 (door, interior, 2 acolytes + leader), town
sign, garden gate (locked until Dojo 1, then opens).
DIALOGUE — MochiiPlex nurse:
- "Welcome to the MochiiPlex. Your team is tired?
  Rest here. It is free, and it is always free."
DIALOGUE — MochiiPlex clerk:
- "Capture Cubes, Mend Patches, and a few Data Cards.
  Come back when you have more CR — the good stock
  comes with the badges."
DIALOGUE — Dojo 1 acolyte 1 (Core theme):
- "Master Lin does not shout. He builds. Watch how
  his creatures stand."
DIALOGUE — Master Lin, before battle:
- "A dojo is a machine. Every part has a place.
  Show me where you fit."
- [battle: Core theme, team = ROSTER GAP Core creatures
  + Sproutle placeholder to be replaced when a Core
  roster species exists — record that placeholder in
  the PR, do not ship it as final]
DIALOGUE — Master Lin, after battle:
- "You fit. Take the Core Fragment. It opens roads
  that only a steady trainer can open."
- [badge: Core Fragment, Heavy-Lift tech taught here,
  garden gate opens]
DIALOGUE — Mochiko, garden gate:
- "The Mochi Garden is open now. Raise them here,
  feed them, race them, breed them. A creature you
  raise is stronger than a creature you only catch."

SPRITE: dojo interior (Kenney Furniture Kit CC0,
restyled), Lin portrait (human-characters lane).
MUSIC: town loop, dojo loop (tenser, same key).
CODE: dojo_1, mochiiplex_1, garden gate flag
dojo1_beat, badge count 1/8, Heavy-Lift flag.

## Beat 4 — Binary Woods, Route 2.0, Stoneport Dojo 2

Forest layout: tall grass maze, 3 trainers, 1 Hacker
cell at the far end (dialogue only here, battle later
in Stoneport — record that, do not battle the same
cell twice).
DIALOGUE — Woods trainer, bug theme:
- "The woods hum. Listen, and you will hear where
  the wild ones are."
Stoneport layout: harbour, docks, Dojo 2 (Aero theme,
Master Falk — already in the game as Dojo 2, keep
that leader, fix the team: Aero creatures, not a
Sproutle placeholder — ROSTER GAP until Aero species
exist, record it).
DIALOGUE — Hacker, docks:
- "The docks are ours now. The data here flows
  where we say it flows."
DIALOGUE — Master Falk, before battle:
- "Wind does not ask permission. Neither do I."
DIALOGUE — Master Falk, after battle:
- "Take the Wind Fragment. The sky is a road too,
  once you learn to read it."
- [badge 2/8, Data-Cut tech is NOT here — Data-Cut
  is earned on the Data Ferry in Neon City, see
  Beat 6, do not give it here by accident]

SPRITE: forest tiles (Kenney Tiny Town + 0x72 CC0),
harbour tiles (Tiny City). MUSIC: forest loop,
harbour loop. CODE: binary_woods, stoneport_city,
dojo_2 (fix team), hacker flag docks_cell_seen.

## Beat 5 — Cave of Echoes, Signal Tunnel, Neon City Dojo 3

Cave layout: dark rooms, Light-Pulse gate later
(record: Light-Pulse is earned in Signal Tunnel, not
before the cave — the first cave visit is lit rooms
only, the deep rooms wait for Light-Pulse).
DIALOGUE — Cave guide:
- "The cave echoes what you bring into it. Bring
  a steady team, and it echoes back steady."
Neon City layout: big bright city, Data Ferry dock,
Dojo 3, Syndicate sighting (first in force).
DIALOGUE — Ferry captain:
- "The ferry runs on data, not diesel. Help me
  clear the Hacker cell on the ferry, and I will
  teach you Data-Cut. It cuts vines, and it cuts
  lies, if you use it right."
- [ferry story beat → Data-Cut flag]
DIALOGUE — Dojo 3 leader (ROSTER GAP leader name —
Mars to name, do not invent a leader name here):
- "Neon is bright because we keep it bright.
  Show me you can stand in the light."
- [badge 3/8]

SPRITE: cave tiles (0x72 DungeonTileset II CC0),
neon signs (Mochiichao-original, Y2K palette).
MUSIC: cave loop (low, echo), neon loop (bright,
synth). CODE: cave_of_echoes exit to neon_city
(Phase A patch), signal_tunnel Light-Pulse gate,
neon_city, dojo_3, Data-Cut flag.

## Beat 6 — Pale Town Tower, Market City Dojo 4, Central City Dojo 5

Pale Town: memorial tower, Syndicate occupying it.
DIALOGUE — Tower keeper:
- "This tower remembers the first trainers. The
  Syndicate is trying to rewrite what it remembers.
  Do not let them."
Market City: market, arcade, Syndicate hideout
underneath. Clear the hideout to open the road.
DIALOGUE — Hideout leader:
- "The market sells everything, even the truth.
  We bought the truth first."
Central City: Syndicate HQ tower, floor by floor,
free the city, then Dojo 5.
DIALOGUE — Central citizen, after freeing:
- "The tower is ours again. Thank you. The dojo
  is open — go, before they regroup."

SPRITE: tower interior (Furniture Kit CC0),
market stalls (Tiny Town). MUSIC: tower loop
(somber), market loop (busy), HQ loop (tense).
CODE: pale_town, market_city, dojo_4, central_city,
dojo_5, hideout flag, HQ flag, badges 4/8 and 5/8.

## Beat 7 — Harbor City Dojo 6, Ember Island Dojo 7, Silicon Town Dojo 8

Harbor City: preserve / safari area, Wave-Ride beat.
DIALOGUE — Preserve keeper:
- "The preserve is not a zoo. It is a promise.
  Keep the promise, and I will teach you Wave-Ride.
  Water is a road, if you respect it."
- [Wave-Ride flag, water routes open]
Ember Island: island lab ruins, mansion logs.
DIALOGUE — Mansion log (readable, not spoken):
- "Log 7: The Mythic data is not a weapon. It is
  a memory. Whoever holds the memory holds the
  Mainframe. We buried it here so no one would
  hold it alone."
Silicon Town, Dojo 8: Syndicate boss as dojo leader.
DIALOGUE — Syndicate boss, before battle:
- "You have followed us across the whole Mainframe.
  Good. Now you will stop, here, in the town
  where you started."
DIALOGUE — after battle:
- "Take the last badge. Victory Route is open.
  The Plateau is waiting. Hex is already there."

SPRITE: preserve tiles (Tiny Town farm / water),
mansion interior (Furniture Kit). MUSIC: harbour
loop, island loop, dojo 8 loop (boss). CODE:
harbor_city, dojo_6, ember_island, dojo_7, dojo_8,
Wave-Ride flag, badges 6/8, 7/8, 8/8.

## Beat 8 — Victory Route, Mainframe Plateau, Hall of Records

Victory Route: Gauntlet, high-level wild, veteran
trainers, 8-badge gate at the entrance (record: gate
is badges>=8, not a tech).
Plateau: Elite Four, in order, then Champion Hex.
DIALOGUE — Elite Four, in order (original, names are
ROSTER GAP except Hex — Mars to name the four, do
not invent them here):
- Elite 1: "I guard the door. Pass me, and you
  are no longer a visitor."
- Elite 2: "I guard the stairs. Climb, if you can."
- Elite 3: "I guard the hall. The hall remembers
  everyone who stood here."
- Elite 4: "I guard the champion's door. Knock
  twice, and mean it."
DIALOGUE — Champion Hex, before battle:
- "I got here first. That is not a boast. It is
  a fact, and facts are all I have left to beat
  you with."
DIALOGUE — Hex, after battle:
- "You beat me. Good. Now the Hall is yours.
  Write your name in it, and do not let anyone
  erase it."
- [Hall of Records flag, credits for Region 1]

SPRITE: plateau tiles (Tiny City / 0x72 CC0),
Hall interior (Furniture Kit). MUSIC: victory loop,
elite loop, champion loop, hall loop (calm).
CODE: victory_route (gate badges>=8), mainframe_plateau,
elite_1-4, champion_hex, hall_of_records flag.

## Beat 9 — Region 1 post-game, Seven Data Isles

Seven isles, one by one, Syndicate remnants, altered
creatures, National Codex upgrade.
DIALOGUE — Aeon, on the last isle:
- "There. A second signal. A second Mainframe shard.
  The ferry can reach it, now that you cleared the
  isles. Take the ticket. Region 2 is waiting."
- [ferry ticket item, region2_arrival stub opens]

SPRITE: isle tiles (Tiny Town water / beach).
MUSIC: isle loop, post-game loop. CODE: data_isle_1-7,
national_codex flag, ferry_ticket item, region2 gate.

## Region 1 fill count

Dialogue beats written here: 9/9 main beats = 100%.
Towns laid out: Sector 0, Silicon Town, Stoneport,
Neon City, Pale Town, Market City, Central City,
Harbor City, Ember Island, Victory Route, Plateau,
Data Isles = 12/12 town / route groups = 100% laid out.
Trainer teams fully filled: 2/12 groups (Route 1.0
trainers, Dojo 1 acolytes in outline) — the rest are
ROSTER GAP slots, not invented teams. That is honest,
not complete, and it is why the master still lists
trainer teams as a gap for Mars / roster expansion.
