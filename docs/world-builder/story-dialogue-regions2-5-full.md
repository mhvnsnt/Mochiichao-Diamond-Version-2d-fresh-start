# Story Dialogue — Regions 2–5, Full Town-by-Town

World Builder lane, 2026-10-25. Original Mochiichao writing
only. Structure template only: town → route → dojo →
antagonist beat → league → post-game link, as in
story-fill-region1.md. No Pokemon dialogue, character
names, sprites, music, or code are copied here, and no
new Pokemon place name is introduced beyond the town
labels given in the task / already used in the prior
Mochiichao outlines (story-fill-regions2-5.md, canon).
Dialogue speakers are role titles (e.g. "Dawnfield
researcher", "tower keeper") unless the speaker is
already Mochiichao canon: Prof. Aeon, Mochiko, Hex,
Master Lin, Master Falk, Mythar. Every other dojo
leader, Elite Four member, and region champion is
marked NAME GAP — the lines are written, the personal
name is not invented. Every trainer team is marked
ROSTER GAP — no stats are invented for a species that
is not already in the Mochiichao roster with stats.
Music slots name CC0 chiptune moods only, never a
commercial tune. Sprite slots name Kenney Tiny Town /
Tiny City / Furniture Kit CC0, restyled to the
Mochiichao palette, or 0x72 DungeonTileset II CC0,
never a commercial sprite. Code slots name new
Mochiichao map keys (r2_, r3_, r4_, r5_ prefixes),
never a commercial map name.

How to read an entry:
- NPC: 2–4 original lines, in dialogue-box order.
- DOJO PRE / POST: leader lines before / after the
  battle, only where the town has a dojo.
- ANTAGONIST: line only where the town has an
  antagonist beat.
- SLOT: music / sprite / code for that town.
- TEAM: ROSTER GAP, always, unless the team is
  already in FullWorldMaps (none of Regions 2–5 is).

---

## REGION 2 — Twin / Return

Theme: a new region that remembers the old one.
Antagonists: Syndicate deeper, Liberation Front first
appearing. Mythic spine: three legendary beasts wake
in a burned tower — you chase them, you do not catch
them all here. Gate: your Region 1 team rejoins badge
by badge; the ferry route only lets registered
Region 2 creatures through at first. Record that gate
in the Region 2 PR; do not wipe the save.

### R2-01 Dawnfield — arrival town, no dojo

NPC — Data Ferry captain:
- "Dawnfield. End of the ferry, start of the chapter."
- "Aeon sent word ahead. Your team is on the list,
  but the list opens badge by badge. Earn them."
- "The MochiiPlex here is small, but the heal is
  free, same as home. Rest before you walk."
NPC — Dawnfield researcher (radio handoff from Aeon):
- "Aeon handed you to me by radio, so I will say
  it plain: this region remembers trainers."
- "Walk the opening road first. Do not skip to the
  tower. The tower notices skippers."
ANATAGONIST: none here — Syndicate first appears at
Azalea / Mahogany in this region.
SLOT — MUSIC: calm arrival loop, CC0 chiptune.
SPRITE: ferry dock + small town, Kenney Tiny City
CC0 restyled. CODE: map r2_dawnfield; flags
r2_arrived, r2_badge_gate_active; heal + shop in
one MochiiPlex; exit to Cherryport road, no gate.
TEAM: ROSTER GAP — no trainer battle required here.

### R2-02 Cherryport — opening road town, no dojo

NPC — Cherryport road keeper:
- "This is the opening road. First wilds, first
  trainers, nothing fancy — and that is the point."
- "If your team feels thin, catch here. The grass
  is kind to new arrivals."
NPC — Cherryport fisher:
- "The water here is shallow. Wave-Ride is not
  needed yet. Walk the bank and watch the data."
- "A trainer who rushes past Cherryport misses
  the whole region. I have seen it happen."
SLOT — MUSIC: bright route loop, CC0 chiptune.
SPRITE: road + shore, Kenney Tiny Town CC0 restyled.
CODE: map r2_cherryport; wild pool early Region 2,
ROSTER GAP; exit to Violet road, no gate.
TEAM: ROSTER GAP — route trainers, levels rising
from the Dawnfield arrival level, not invented here.

### R2-03 Violet Town — Dojo 1, tower puzzle

NPC — Tower guide:
- "The tower is a puzzle, not a wall. Each floor
  teaches you one thing. Do not climb angry."
- "The first beast was seen here. Seen, not caught.
  Remember the difference."
NPC — Violet town elder:
- "Violet is old. The dojo is older. Respect both
  and the badge will not feel heavy."
DOJO PRE — Dojo leader [NAME GAP]:
- "A tower stands because every stone knows its
  place. Show me you know yours."
DOJO POST — Dojo leader [NAME GAP]:
- "You know it. Take the first badge of this
  region. Your old team opens one slot wider now."
- [badge R2-1/8; badge-gate step 1]
SLOT — MUSIC: tower loop, somber, CC0 chiptune;
dojo loop tenser, same key. SPRITE: tower interior,
Kenney Furniture Kit CC0 restyled; town, Tiny Town
CC0 restyled. CODE: map r2_violet, r2_tower,
r2_dojo_1; tower puzzle flag; badge gate step.
TEAM: ROSTER GAP — dojo theme: tower / plant-shape
theme to be set from the roster, not invented here.

### R2-04 Azalea Town — Dojo 2, well / data-spring rescue

NPC — Well keeper:
- "The well is not dry. It is drained. Someone
  is taking the spring, one bucket at a time."
- "Go down. Bring the spring back. The town will
  remember who did it."
ANTAGONIST — Syndicate operative, at the well:
- "The spring flows where we say it flows. You
  are not on the list."
- "Fine. Battle me, then. The list does not
  change, but you can try."
DOJO PRE — Dojo leader [NAME GAP]:
- "You brought the spring back. Now bring a
  steady team. I test steadiness, not speed."
DOJO POST — Dojo leader [NAME GAP]:
- "Steady. Take the second badge. Your old team
  opens another slot."
- [badge R2-2/8; badge-gate step 2; well flag cleared]
SLOT — MUSIC: well loop, low, CC0 chiptune; town
loop calm. SPRITE: well interior, 0x72 CC0; town,
Tiny Town CC0 restyled. CODE: map r2_azalea,
r2_well, r2_dojo_2; well flag; Syndicate cell flag.
TEAM: ROSTER GAP.

### R2-05 Ilex Forest — forest maze, shrine, no dojo

NPC — Forest shrine keeper:
- "The forest is a maze on purpose. The shrine
  is in the middle, and the middle is quiet."
- "The second beast was seen at the shrine. It
  did not stay. Beasts do not stay for crowds."
NPC — Forest wanderer:
- "I got lost here three times. The fourth time,
  I stopped rushing, and the path found me."
- "Cut nothing here unless the path asks you to.
  Data-Cut is a tool, not a shortcut."
SLOT — MUSIC: forest loop, CC0 chiptune.
SPRITE: forest maze, Kenney Tiny Town CC0 restyled.
CODE: map r2_ilex_forest, r2_shrine; maze flags;
exit to Goldenrod road, no badge gate. TEAM: ROSTER
GAP — forest trainers only, no dojo here.

### R2-06 Goldenrod City — Dojo 3, Radio Tower, market

NPC — Radio Tower clerk:
- "The tower talks to the whole region. Right now
  it is talking too much, and listening too little."
- "Come back after the tower story. It will make
  sense then, and not before."
NPC — Market clerk:
- "Big city, big market. The Garden branch here
  sells what Silicon Town cannot stock yet."
- "Do not buy everything. Buy what your team
  actually needs for the next road."
ANTAGONIST — Syndicate operative, tower lobby:
- "The tower is ours on paper. Paper is stronger
  than you think."
DOJO PRE — Dojo leader [NAME GAP]:
- "A big city dojo is not a big dojo. It is a
  dojo that has to be exact, because everyone
  is watching."
DOJO POST — Dojo leader [NAME GAP]:
- "Exact. Take the third badge. Your old team
  opens another slot."
- [badge R2-3/8; badge-gate step 3; tower story flag]
SLOT — MUSIC: big-city loop, busy, CC0 chiptune.
SPRITE: city + tower, Kenney Tiny City CC0 restyled.
CODE: map r2_goldenrod, r2_radio_tower, r2_dojo_3,
r2_garden_branch; tower flag. TEAM: ROSTER GAP.

### R2-07 Ecruteak City — Dojo 4, Burned Tower

NPC — Burned Tower keeper:
- "The tower burned, and the beasts woke in the
  smoke. They are not yours to catch yet."
- "They are yours to follow. Follow, do not chase.
  Chasing scares a beast into the next region."
NPC — Ecruteak elder:
- "This city remembers fire. It also remembers
  the trainers who walked out of the fire calm."
DOJO PRE — Dojo leader [NAME GAP]:
- "Fire teaches, if you let it. Show me what
  the tower taught you."
DOJO POST — Dojo leader [NAME GAP]:
- "You learned. Take the fourth badge. Your old
  team opens another slot."
- [badge R2-4/8; badge-gate step 4; beasts-wake flag]
SLOT — MUSIC: burned-tower loop, somber, CC0
chiptune. SPRITE: burned tower, 0x72 CC0 + Tiny
Town CC0 restyled. CODE: map r2_ecruteak,
r2_burned_tower, r2_dojo_4; beasts-wake flag.
TEAM: ROSTER GAP.

### R2-08 Olivine City — Dojo 5, lighthouse, Wave-Ride gate

NPC — Lighthouse keeper:
- "The light is not for ships. It is for trainers
  who have forgotten where the shore is."
- "Keep the light, and I will keep the sea road
  open for you. That is the deal, and it is fair."
NPC — Olivine harbour keeper:
- "Wave-Ride works here, same as Region 1. Water
  is a road, if you respect it. Do not surf angry."
DOJO PRE — Dojo leader [NAME GAP]:
- "A lighthouse keeper's dojo is a dojo of
  patience. Wait for the right move, then take it."
DOJO POST — Dojo leader [NAME GAP]:
- "Patient. Take the fifth badge. Your old team
  opens another slot."
- [badge R2-5/8; badge-gate step 5; sea-road flag]
SLOT — MUSIC: lighthouse loop, slow, CC0 chiptune.
SPRITE: lighthouse + harbour, Kenney Tiny City
CC0 restyled. CODE: map r2_olivine, r2_lighthouse,
r2_dojo_5; Wave-Ride already earned in Region 1,
no re-teach here. TEAM: ROSTER GAP.

### R2-09 Cianwood City — Dojo 6, across water, medicine beat

NPC — Medicine keeper:
- "The medicine is not magic. It is care, measured
  out, one dose at a time. Bring it to the island
  dojo, and bring it whole."
- "The water crossing is short. The lesson is long.
  Do not mix them up."
DOJO PRE — Dojo leader [NAME GAP]:
- "You crossed water to get here. Now cross the
  gap between a good team and a cared-for team."
DOJO POST — Dojo leader [NAME GAP]:
- "Cared for. Take the sixth badge. Your old team
  opens another slot."
- [badge R2-6/8; badge-gate step 6; medicine flag]
SLOT — MUSIC: island loop, calm, CC0 chiptune.
SPRITE: island town, Tiny Town CC0 restyled.
CODE: map r2_cianwood, r2_dojo_6; water crossing
flag (Wave-Ride); medicine flag. TEAM: ROSTER GAP.

### R2-10 Mahogany Town — Dojo 7, lake, hideout raid

NPC — Lake watcher:
- "The lake is angry. Something red is in it, and
  it is not red by nature. Someone made it red."
- "The hideout is under the town. Raid it, and
  the lake calms. Do not raid it angry — raid it
  steady."
ANTAGONIST — Syndicate hideout leader [NAME GAP
for personal name; role only]:
- "The lake is a battery. We charge it, we use
  it. You are not part of the circuit."
DOJO PRE — Dojo leader [NAME GAP]:
- "You calmed a lake. Now calm a dojo. Same
  skill, smaller water."
DOJO POST — Dojo leader [NAME GAP]:
- "Calm. Take the seventh badge. Your old team
  opens another slot."
- [badge R2-7/8; badge-gate step 7; hideout flag;
  lake flag cleared]
SLOT — MUSIC: lake loop, tense, CC0 chiptune.
SPRITE: lake + hideout, 0x72 CC0 + Tiny Town CC0
restyled. CODE: map r2_mahogany, r2_lake,
r2_hideout, r2_dojo_7. TEAM: ROSTER GAP.

### R2-11 Blackthorn City — Dojo 8, Dragon's Den trial

NPC — Den elder:
- "The den is a trial, not a test. A test asks
  what you know. A trial asks who you are."
- "Walk the den. If you come out, the badge is
  already yours. The battle just confirms it."
DOJO PRE — Dojo leader [NAME GAP]:
- "You walked the den. Now stand in it. Show me
  the trainer the den saw."
DOJO POST — Dojo leader [NAME GAP]:
- "The den saw you. Take the eighth badge. Your
  old team is fully open now."
- [badge R2-8/8; badge-gate complete; Victory
  Route gate opens]
SLOT — MUSIC: den loop, deep, CC0 chiptune.
SPRITE: den + city, 0x72 CC0 + Tiny City CC0
restyled. CODE: map r2_blackthorn, r2_den,
r2_dojo_8; Victory gate badges>=8. TEAM: ROSTER GAP.

### R2-12 Victory Route — Gauntlet, no dojo, no town

NPC — Victory gate keeper:
- "Eight badges. That is the gate, and it is the
  only gate. Walk it. Do not run it — run it and
  you will miss the trainers who teach you."
NPC — Veteran trainer (talk-to-battle, ROSTER GAP team):
- "I have walked this route in Region 1 and here.
  The route remembers. Show me you do too."
- After battle: "You remember. Good. The Plateau
  is next, and it remembers more."
SLOT — MUSIC: victory loop, driving, CC0 chiptune.
SPRITE: mountain road, 0x72 CC0 restyled.
CODE: map r2_victory_route; gate badges>=8;
high-level wild, ROSTER GAP; exit to Plateau.
TEAM: ROSTER GAP — veteran trainers, levels above
Blackthorn, not invented here.

### R2-13 Mainframe Plateau, second ascent — Elite Four + Champion

NPC — Plateau attendant:
- "Second ascent. Same Plateau, different trainer.
  The Hall has a second page for you, if you earn it."
DOJO-style PRE/POST are Elite / Champion lines here:
ELITE 1 [NAME GAP]:
- Pre: "I guard the door. Pass me, and you are no
  longer a visitor."
- Post: "Pass. The stairs are yours."
ELITE 2 [NAME GAP]:
- Pre: "I guard the stairs. Climb, if you can."
- Post: "Climb. The hall is yours."
ELITE 3 [NAME GAP]:
- Pre: "I guard the hall. The hall remembers
  everyone who stood here."
- Post: "It will remember you. The champion's
  door is next."
ELITE 4 [NAME GAP]:
- Pre: "I guard the champion's door. Knock twice,
  and mean it."
- Post: "Knock. Mean it. Go."
CHAMPION [NAME GAP — not Hex, not Mythar]:
- Pre: "You have beaten a region that remembers
  you. Now beat the trainer it remembers most."
- Post: "You have. The Hall remembers you twice
  now. Go back and finish what you started in
  Region 1 — it is waiting, stronger."
- [Hall of Records, second entry; Region 2 post-game
  opens: Region 1 rematches]
SLOT — MUSIC: elite loop, champion loop, hall loop
calm, CC0 chiptune. SPRITE: Plateau + Hall,
Furniture Kit CC0 restyled. CODE: map
r2_plateau, r2_elite_1-4, r2_champion, r2_hall;
no heal between Elite battles unless a heal point
is placed and recorded in the PR. TEAM: ROSTER GAP
for all Elite and Champion teams.

### R2-14 Frost Peak — post-game final battle, link to Region 3

NPC — Frost Peak guide:
- "The top is snow and silence. The First Champion
  waits there. He does not talk. He battles."
FIRST CHAMPION [NAME GAP]:
- Pre: "…"
- Post: "The sea route is open. Storm-locked, but
  open. Region 3 is waiting."
NPC — Aeon, radio, after Frost Peak:
- "You beat the First Champion. The expedition
  signal is clean. Take the storm route. Region 3
  is on the other side of it."
SLOT — MUSIC: snow loop, quiet, CC0 chiptune;
final-battle loop, driving. SPRITE: snow peak,
Tiny Town CC0 restyled + 0x72 CC0. CODE: map
r2_frost_peak; flags r2_rematches_done,
r2_frost_peak_beat, r3_storm_route_open.
TEAM: ROSTER GAP — First Champion team, strongest
so far, not invented here.

---

## REGION 3 — Sea / Land

Theme: widest map, sea routes, diving, a region split
by water. Antagonists: two Syndicate factions, Land
and Sea, each trying to wake a different legendary.
Opening: bedroom / lab start, swapped in 2026-10-25
(Template L in the wiring master). This is a chapter
opening, not a new game: your main team is not wiped,
the Region 3 starter is an additional partner, Sprint
Boots are already earned in Region 1 and are not
re-given here.

### R3-01 Root Hamlet — outpost bedroom + lab start

NPC — Outpost keeper, downstairs:
- "You are awake. Good. The lab is down the road."
- "The researcher is waiting, and Hex is already
  there, looking impatient. Go. Do not keep Hex
  waiting — he keeps score."
NPC — Region 3 researcher (lab):
- "Welcome to Root Hamlet. Pick a partner from
  the table. It will travel with your main team,
  not instead of it."
- "Take the Codex upgrade, and the Capture Cubes.
  The sea is wide, and you will need both."
HEX, lab-exit battle:
- Pre: "You pick first, I pick stronger. That is
  the rule, and the rule has not changed."
- Post: "You win here too. Fine. The sea is bigger
  than both of us. Let's see who crosses it first."
- [Codex upgrade + Cubes; lab starter flag;
  main team under badge gate, same gate as Region 2]
SLOT — MUSIC: outpost loop, calm, CC0 chiptune.
SPRITE: outpost bedroom + lab, Kenney Furniture
Kit CC0 restyled. CODE: maps r3_outpost_2f,
r3_outpost_1f, r3_root_hamlet, r3_lab; flags
r3_lab_starter, r3_codex_upgrade. TEAM: ROSTER GAP
— Hex lab team is the advantage pick, level scaled
to the chapter, not Region 1's level 5; record the
level rule in the Region 3 PR.

### R3-02 Oldale Road — opening road, no dojo

NPC — Oldale road keeper:
- "This is the opening road. First route, first
  wilds, now open after the lab beat."
- "Do not skip the road. The road teaches the
  region's weather, and the weather matters here."
NPC — Oldale fisher:
- "The sea starts here, even on land. You can
  smell it before you see it."
SLOT — MUSIC: bright route loop, CC0 chiptune.
SPRITE: road + shore, Kenney Tiny Town CC0 restyled.
CODE: map r3_oldale_road; wild pool early Region 3,
ROSTER GAP; exit to Rustboro, no gate. TEAM: ROSTER
GAP — route trainers only.

### R3-03 Rustboro City — Dojo 1, stone / rock theme

NPC — Rustboro stone keeper:
- "Stone does not hurry. Stone waits, and then
  it is still there when you are tired."
- "The first faction was seen here. Watch the
  stone, not the people. The stone tells you
  who moved it."
ANTAGONIST — Land faction scout:
- "The land remembers. We are here to help it
  remember louder."
DOJO PRE — Dojo leader [NAME GAP]:
- "Stone is not stubborn. Stone is honest. Show
  me an honest team."
DOJO POST — Dojo leader [NAME GAP]:
- "Honest. Take the first badge of this region."
- [badge R3-1/8]
SLOT — MUSIC: stone-city loop, steady, CC0 chiptune.
SPRITE: stone city, Kenney Tiny City CC0 restyled.
CODE: map r3_rustboro, r3_dojo_1; faction sighting
flag. TEAM: ROSTER GAP.

### R3-04 Dewford Town — Dojo 2, island, cave

NPC — Dewford boat keeper:
- "The island is across the water. Wave-Ride
  works here. Water is a road, if you respect it."
NPC — Cave guide:
- "The cave is dark, but it is not empty. Bring
  Light-Pulse, and bring patience. Both light
  the same way."
DOJO PRE — Dojo leader [NAME GAP]:
- "An island dojo is a dojo with nowhere to run.
  Stand, and fight like you mean to stay."
DOJO POST — Dojo leader [NAME GAP]:
- "You stayed. Take the second badge."
- [badge R3-2/8]
SLOT — MUSIC: island loop, calm, CC0 chiptune.
SPRITE: island + cave, 0x72 CC0 + Tiny Town CC0
restyled. CODE: map r3_dewford, r3_cave,
r3_dojo_2; water crossing flag (Wave-Ride).
TEAM: ROSTER GAP.

### R3-05 Mauville City — Dojo 3, electric city, Arena

NPC — Arena announcer:
- "Welcome to the Arena. First full tournament
  bracket in the story. Win it, and the city
  remembers your name."
NPC — Mauville electric keeper:
- "The city runs bright. Bright is not the same
  as safe. Watch the wires, and watch the people
  who watch the wires."
ANTAGONIST — Sea faction scout:
- "The sea forgets. We are here to help it
  forget faster."
DOJO PRE — Dojo leader [NAME GAP]:
- "Electric is fast, but fast is not first.
  First is the trainer who knows when to wait."
DOJO POST — Dojo leader [NAME GAP]:
- "You waited, then you struck. Take the third
  badge."
- [badge R3-3/8; Arena bracket flag]
SLOT — MUSIC: electric-city loop, driving, CC0
chiptune; Arena loop, driving. SPRITE: electric
city + Arena, Kenney Tiny City CC0 restyled.
CODE: map r3_mauville, r3_arena, r3_dojo_3.
TEAM: ROSTER GAP.

### R3-06 Lavaridge Town — Dojo 4, hot springs, Land base

NPC — Hot-spring keeper:
- "The springs are warm because the mountain is
  awake. Warm is good. Awake is a warning."
- "Soak, rest, heal — the MochiiPlex here is
  warm too, and the heal is free, same as home."
ANTAGONIST — Land faction leader [role only, NAME
GAP for personal name]:
- "The land remembers. Wake it, and it will
  remember us first."
DOJO PRE — Dojo leader [NAME GAP]:
- "Heat does not make a trainer strong. Heat
  shows which trainer is already strong."
DOJO POST — Dojo leader [NAME GAP]:
- "Strong. Take the fourth badge."
- [badge R3-4/8; Land base flag]
SLOT — MUSIC: hot-spring loop, warm, CC0 chiptune.
SPRITE: springs + volcano road, Tiny Town CC0
restyled. CODE: map r3_lavaridge, r3_dojo_4,
r3_land_base. TEAM: ROSTER GAP.

### R3-07 Petalburg City — Dojo 5, return dojo

NPC — Petalburg elder:
- "This dojo waited for you. It was strong when
  you were new, and it is strong now that you
  are not new. That is the point of a return."
NPC — Mochiko, by radio / in person if placed:
- "A dojo leader who knew Aeon is not a test.
  He is a memory, with a team. Treat him like
  both."
DOJO PRE — Dojo leader [NAME GAP — leader who
knew Aeon, personal name not canon]:
- "I knew Aeon when he was still learning. He
  told me you would come. Show me he was right."
DOJO POST — Dojo leader [NAME GAP]:
- "He was right. Take the fifth badge."
- [badge R3-5/8]
SLOT — MUSIC: return-town loop, warm, CC0 chiptune.
SPRITE: city, Kenney Tiny City CC0 restyled.
CODE: map r3_petalburg, r3_dojo_5. TEAM: ROSTER GAP.

### R3-08 Fortree City — Dojo 6, tree city, weather institute

NPC — Weather institute keeper:
- "The weather is not weather here. It is a
  signal, and someone is sending it."
- "The Sea faction moved on the weather. Stop
  them, and the sky goes back to being sky."
NPC — Canopy guide:
- "The city is in the trees. Walk the canopy
  slow. A fast trainer falls, and a fallen
  trainer learns nothing."
ANTAGONIST — Sea faction operative, weather institute:
- "The sea forgets. The sky should forget too.
  We are just helping it along."
DOJO PRE — Dojo leader [NAME GAP]:
- "A tree-city dojo is a dojo of balance. Lean
  too far, and you fall. Lean right, and you win."
DOJO POST — Dojo leader [NAME GAP]:
- "Balanced. Take the sixth badge."
- [badge R3-6/8; weather flag]
SLOT — MUSIC: canopy loop, airy, CC0 chiptune.
SPRITE: tree city, Kenney Tiny Town CC0 restyled.
CODE: map r3_fortree, r3_weather_institute,
r3_dojo_6. TEAM: ROSTER GAP.

### R3-09 Crater City — Dojo 8 in canon order, Deep-Dive gate, awakening

Note on numbering: canon lists Lilycove (port /
hideout) and Mossdeep (island research city, Dojo 7)
before this crater city (Dojo 8). Those two stops are
dialogued as R3-09a / R3-09b below, so the crater
city keeps its canon Dojo 8 place and no town is
skipped. Count them in the Region 3 total.

NPC — Crater city elder:
- "This city is under water and inside a volcano
  at once. That is not a contradiction. That is
  a balance, and balance is hard to hold."
- "Deep-Dive is the gate. Dive, and come back
  with the city, not just with yourself."
DOJO PRE — Dojo leader [NAME GAP]:
- "A crater dojo is a dojo of pressure. Hold
  under pressure, and you hold anywhere."
DOJO POST — Dojo leader [NAME GAP]:
- "You held. Take the eighth badge."
- [badge R3-8/8; Deep-Dive flag; awakening flag
  follows — see below]
SLOT — MUSIC: crater loop, deep, CC0 chiptune.
SPRITE: crater + water, 0x72 CC0 + Tiny Town CC0
restyled. CODE: map r3_crater_city, r3_dojo_8;
Deep-Dive gate. TEAM: ROSTER GAP.

### R3-09a Lilycove — port, hideout under the city, no dojo

NPC — Port keeper:
- "The port is busy, and busy hides things.
  The hideout is under the city. The two factions
  are colliding down there, not up here."
ANTAGONIST — Land faction operative + Sea faction
operative, colliding in the hideout:
- Land: "The land remembers. It will not share
  the memory with the sea."
- Sea: "The sea forgets. It will not share the
  forgetting with the land."
- "You: pick a side, or pick the balance. The
  balance is harder, and it is the only one that
  holds."
SLOT — MUSIC: port loop, busy, CC0 chiptune.
SPRITE: port + hideout, Tiny City CC0 restyled +
0x72 CC0. CODE: map r3_lilycove, r3_hideout;
faction-collision flag. TEAM: ROSTER GAP.

### R3-09b Mossdeep — island research city, Dojo 7

NPC — Research city keeper:
- "The satellite link is not a toy. It talks to
  the Mainframe, and the Mainframe answers."
- "The double-battle dojo is here. Two creatures,
  one trainer, no hiding behind a single star."
DOJO PRE — Dojo leader [NAME GAP]:
- "Two at once is not twice as hard. It is a
  different skill. Show me you have it."
DOJO POST — Dojo leader [NAME GAP]:
- "You have it. Take the seventh badge."
- [badge R3-7/8; double-battle dojo flag — double
  battles are a future system in the wiring master,
  record that, do not claim them as wired]
SLOT — MUSIC: research loop, clean, CC0 chiptune.
SPRITE: research city, Kenney Tiny City CC0
restyled. CODE: map r3_mossdeep, r3_dojo_7.
TEAM: ROSTER GAP.

### R3-10 The Awakening — legendary climax, before the League

NPC — Crater city elder, after the awakening:
- "You stopped both wakes. That is not a victory.
  That is a balance. Keep it."
NPC — Land faction leader [role only]:
- "The land woke, and it saw you. It will
  remember that, even if we do not."
NPC — Sea faction leader [role only]:
- "The sea woke, and it saw you. It will
  forget us, but it will not forget you."
SLOT — MUSIC: awakening loop, storm, CC0 chiptune.
SPRITE: storm + flood + fire, Tiny Town CC0
restyled. CODE: map r3_awakening; flags
r3_land_wake_stopped, r3_sea_wake_stopped,
r3_balance_kept; League gate opens. TEAM: ROSTER
GAP — legendary encounters, not invented stats.

### R3-11 Victory Route — Gauntlet, sea and cave

NPC — Victory gate keeper:
- "Eight badges, sea and cave. That is the gate.
  Walk it. The League is on the other side, and
  it does not wait for late trainers."
NPC — Veteran trainer (talk-to-battle, ROSTER GAP):
- "I crossed this sea in a storm. You can cross
  a route. Show me."
- After battle: "You crossed. Good. The Plateau
  is next."
SLOT — MUSIC: victory loop, driving, CC0 chiptune.
SPRITE: sea + cave road, 0x72 CC0 restyled.
CODE: map r3_victory_route; gate badges>=8.
TEAM: ROSTER GAP.

### R3-12 Mainframe Plateau, third ascent — Elite Four + Champion

NPC — Plateau attendant:
- "Third ascent. The Hall has a third page for
  you, if you earn it."
ELITE 1 [NAME GAP]:
- Pre: "I guard the door. The sea taught me
  patience. Patience teaches back."
- Post: "Pass. The stairs are yours."
ELITE 2 [NAME GAP]:
- Pre: "I guard the stairs. The land taught me
  steadiness. Be steady."
- Post: "Steady. The hall is yours."
ELITE 3 [NAME GAP]:
- Pre: "I guard the hall. The hall remembers
  every region you have walked."
- Post: "It remembers you. The champion's door
  is next."
ELITE 4 [NAME GAP]:
- Pre: "I guard the champion's door. Knock twice,
  and mean it, in storm and in calm."
- Post: "Knock. Mean it. Go."
CHAMPION [NAME GAP — not Hex, not Mythar]:
- Pre: "You balanced a region that was splitting
  in two. Now balance me."
- Post: "Balanced. The Hall remembers you three
  times now. The Frontier Arenas are waiting."
- [Hall of Records, third entry; Frontier Arenas
  post-game opens]
SLOT — MUSIC: elite loop, champion loop, hall loop
calm, CC0 chiptune. SPRITE: Plateau + Hall,
Furniture Kit CC0 restyled. CODE: map r3_plateau,
r3_elite_1-4, r3_champion, r3_hall. TEAM: ROSTER GAP.

### R3-13 Frontier Arenas — post-game, link to Region 4

NPC — Frontier announcer:
- "Welcome to the Frontier. Singles, doubles,
  rental teams, streaks — each Arena has its own
  rule, and the rules do not bend for champions."
NPC — Arena keeper, after the last Arena:
- "You cleared the Frontier. The mountain pass
  is open. The airship route is north, over the
  crater range, to a colder, older region."
NPC — Liberation Front speaker, on the airship route:
- "We are moving creatures for their own good.
  You will see, on the other side. You will see."
SLOT — MUSIC: Arena loop, driving, CC0 chiptune.
SPRITE: Arena brackets, Tiny City CC0 restyled.
CODE: map r3_frontier_arenas; flags
r3_frontier_done, r4_airship_route_open.
TEAM: ROSTER GAP — Arena teams, streak rules to be
recorded in the Region 3 post-game PR.

---

## REGION 4 — Rift

Theme: deepest lore — an old region, a rift underneath
it, a story about what the Mainframe was before
Mochiichao. Antagonists: Syndicate at its most
organised, calling itself a research institute, trying
to open the Rift. Mythic spine: lake guardians, Umbral
Rift, creatures that do not belong in any Codex yet.

### R4-01 Twinleaf Hamlet — airship arrival, no dojo

NPC — Airship captain:
- "Twinleaf Hamlet. Edge of the snow, edge of the
  old story. Step off careful — the ground here
  is older than the map."
NPC — Hamlet elder:
- "The Rift is not a place. It is a wound in a
  place. Walk carefully. The creatures here are
  not wild — they are lost."
SLOT — MUSIC: arrival loop, quiet, CC0 chiptune.
SPRITE: hamlet + snow edge, Kenney Tiny Town CC0
restyled. CODE: map r4_twinleaf; flags r4_arrived,
r4_airship_docked; heal + shop in one MochiiPlex
or a named heal NPC with a recorded reason if no
centre — do not leave a town with no heal and no
note. TEAM: ROSTER GAP — no battle required here.

### R4-02 Sandgem-shape town — researcher's town, first route, no dojo

Note: "Sandgem-shape" is the task's shape label for
this town's role (researcher's town, first route),
not a new personal or place name invented here.
NPC — Town researcher:
- "Three lakes, three guardians, one mystery.
  That is the whole region, in one sentence."
- "Walk the first route first. The lakes wait.
  The Rift does not wait, but the lakes do."
NPC — Route keeper:
- "The first route is kind, for an old region.
  Kind is not the same as easy. Watch the grass."
SLOT — MUSIC: research-town loop, calm, CC0 chiptune.
SPRITE: research town, Tiny Town CC0 restyled.
CODE: map r4_sandgem; wild pool early Region 4,
ROSTER GAP; exit to Jubilife-shape city, no gate.
TEAM: ROSTER GAP — route trainers only.

### R4-03 Jubilife-shape city — media city, institute's public face, no dojo

Note: "Jubilife-shape" is the task's shape label for
this city's role (media city), not a new name.
NPC — Media clerk:
- "The institute is on every screen. That is not
  news. That is advertising, and advertising is
  not the same as truth."
NPC — City elder:
- "This city talks fast. Walk slow, and you will
  hear what it is not saying."
ANTAGONIST — Institute speaker:
- "We are a research institute. We research.
  The Rift is research. Do not make it a story."
SLOT — MUSIC: media-city loop, busy, CC0 chiptune.
SPRITE: media city, Kenney Tiny City CC0 restyled.
CODE: map r4_jubilife; institute-public-face flag.
TEAM: ROSTER GAP — no dojo here; city trainers only.

### R4-04 Oreburgh City — Dojo 1, mining / rock theme

NPC — Mine keeper:
- "The mine is deep, and the deep is honest.
  Coal does not lie. People near coal sometimes do."
- "The dojo is in the mine's shadow. Shadow is
  not darkness. Shadow is just less light."
DOJO PRE — Dojo leader [NAME GAP]:
- "A mining dojo is a dojo of work. Show me
  work, not wishes."
DOJO POST — Dojo leader [NAME GAP]:
- "Work. Take the first badge of this region."
- [badge R4-1/8]
SLOT — MUSIC: mining loop, steady, CC0 chiptune.
SPRITE: mining city, Tiny City CC0 restyled +
0x72 CC0. CODE: map r4_oreburgh, r4_dojo_1.
TEAM: ROSTER GAP.

### R4-05 Floaroma Town — flower town, valley, first Rift crack, no dojo

NPC — Flower keeper:
- "The valley is beautiful, and the crack in the
  ground is beautiful too, in a way that worries me."
- "Do not step in the crack. Look at it, note it,
  and tell the next town. That is the job here."
NPC — Valley wanderer:
- "Flowers grow over cracks. That is not hiding.
  That is healing, slow and honest."
SLOT — MUSIC: valley loop, gentle, CC0 chiptune.
SPRITE: flower valley, Kenney Tiny Town CC0
restyled. CODE: map r4_floaroma; first Rift-crack
flag. TEAM: ROSTER GAP — no dojo here.

### R4-06 Eterna City — Dojo 2, forest city, institute theft

NPC — Forest keeper:
- "The forest is old. The statue is older. The
  institute took something from the statue, and
  the forest noticed."
ANTAGONIST — Institute operative, at the statue:
- "We are borrowing history. Borrowing is not
  stealing, if you return it. We will return it.
  Later."
DOJO PRE — Dojo leader [NAME GAP]:
- "A forest dojo is a dojo of patience. Trees
  do not hurry, and neither do I."
DOJO POST — Dojo leader [NAME GAP]:
- "Patient. Take the second badge."
- [badge R4-2/8; statue-theft flag]
SLOT — MUSIC: forest loop, CC0 chiptune.
SPRITE: forest city, Tiny Town CC0 restyled.
CODE: map r4_eterna, r4_dojo_2, r4_statue.
TEAM: ROSTER GAP.

### R4-07 Hearthome City — Dojo 3, contest / Garden branch

NPC — Contest hall keeper:
- "The contest is not a battle. It is a showing.
  Show your creature, and show it kindly."
NPC — Mochiko, Garden branch:
- "The Garden branch here is the same Garden,
  new soil. Raise them here, and they will
  remember both gardens."
DOJO PRE — Dojo leader [NAME GAP]:
- "A contest dojo is a dojo of grace. Grace is
  not soft. Grace is exact, under lights."
DOJO POST — Dojo leader [NAME GAP]:
- "Graceful. Take the third badge."
- [badge R4-3/8; Garden branch flag]
SLOT — MUSIC: contest loop, bright, CC0 chiptune.
SPRITE: contest hall, Kenney Furniture Kit CC0
restyled. CODE: map r4_hearthome, r4_contest_hall,
r4_dojo_3. TEAM: ROSTER GAP.

### R4-08 Veilstone City — Dojo 4, institute city, warehouses

NPC — Warehouse keeper:
- "The warehouses are full of things that are
  not labelled. Unlabelled things are not lost.
  They are hidden, and hidden is a choice."
ANTAGONIST — Institute operative, warehouse:
- "The meteorite is research. Research is not
  yours to touch. Touch it, and you are research
  too."
DOJO PRE — Dojo leader [NAME GAP]:
- "A warehouse dojo is a dojo of strength with
  nowhere to hide. Stand in the open."
DOJO POST — Dojo leader [NAME GAP]:
- "Open. Take the fourth badge."
- [badge R4-4/8; meteorite flag]
SLOT — MUSIC: warehouse loop, tense, CC0 chiptune.
SPRITE: warehouses, Tiny City CC0 restyled.
CODE: map r4_veilstone, r4_warehouse, r4_dojo_4.
TEAM: ROSTER GAP.

### R4-09 Pastoria City — Dojo 5, marsh city, preserve

NPC — Marsh keeper:
- "The marsh is not a swamp. It is a preserve.
  Preserve means: look, learn, do not take more
  than the marsh offers."
NPC — Preserve guide:
- "Wave-Ride works here, same as before. Water
  is a road, if you respect it. The marsh
  respects you back, if you do."
DOJO PRE — Dojo leader [NAME GAP]:
- "A marsh dojo is a dojo of patience in wet
  boots. Wade, and do not complain about wet."
DOJO POST — Dojo leader [NAME GAP]:
- "You waded. Take the fifth badge."
- [badge R4-5/8; preserve flag]
SLOT — MUSIC: marsh loop, slow, CC0 chiptune.
SPRITE: marsh + preserve, Tiny Town CC0 restyled.
CODE: map r4_pastoria, r4_preserve, r4_dojo_5.
TEAM: ROSTER GAP.

### R4-10 Celestic Town — old town, cave painting, lore, no dojo

NPC — Cave painting keeper:
- "The painting is old. It shows the Mainframe
  before any region. Before Mochiichao, even."
- "The Rift is a scar in that Mainframe. A scar
  is not a wound, if it has healed. This one
  has not healed."
NPC — Celestic elder:
- "Regions 1–3 were chapters. This town is the
  footnote that reframes the whole book. Read
  it slow."
SLOT — MUSIC: lore loop, quiet, CC0 chiptune.
SPRITE: old town + cave painting, 0x72 CC0 +
Tiny Town CC0 restyled. CODE: map r4_celestic,
r4_cave_painting; lore flag. TEAM: ROSTER GAP —
no dojo here.

### R4-11 Canalave City — Dojo 6, port, library, island

NPC — Library keeper:
- "The library has every book except the one
  you need. That book is on the island, and the
  island does not lend books."
NPC — Port keeper:
- "The island is across the water. The creature
  there is not wild. It is a nightmare, and
  nightmares do not follow Codex rules."
DOJO PRE — Dojo leader [NAME GAP]:
- "A port dojo is a dojo of steel and salt.
  Rust is honest. Be honest, and be steel."
DOJO POST — Dojo leader [NAME GAP]:
- "Steel. Take the sixth badge."
- [badge R4-6/8; island flag]
SLOT — MUSIC: port loop, steady, CC0 chiptune.
SPRITE: port + library, Tiny City CC0 restyled.
CODE: map r4_canalave, r4_library, r4_island,
r4_dojo_6. TEAM: ROSTER GAP.

### R4-12 Snowpoint City — Dojo 7, snow city, temple

NPC — Temple keeper:
- "The temple is cold because the truth is cold.
  Warm up inside, then go back out and face it."
- "The ice dojo is not about ice. It is about
  standing still when everything says run."
DOJO PRE — Dojo leader [NAME GAP]:
- "Snow does not hurry. Snow waits, and then
  it is everywhere. Be snow."
DOJO POST — Dojo leader [NAME GAP]:
- "You waited. Take the seventh badge."
- [badge R4-7/8; temple flag]
SLOT — MUSIC: snow loop, quiet, CC0 chiptune.
SPRITE: snow city + temple, Tiny Town CC0 restyled.
CODE: map r4_snowpoint, r4_temple, r4_dojo_7.
TEAM: ROSTER GAP.

### R4-13 Sunyshore City — Dojo 8, solar city, lighthouse road

NPC — Solar keeper:
- "The city runs on sun. Sun is free, and free
  is not the same as easy. Keep the panels clean."
NPC — Lighthouse road keeper:
- "The road to the lighthouse is the last road
  in the region. Walk it, and the League is next."
DOJO PRE — Dojo leader [NAME GAP]:
- "A solar dojo is a dojo of light with no
  shadows to hide in. Stand in the light."
DOJO POST — Dojo leader [NAME GAP]:
- "You stood. Take the eighth badge."
- [badge R4-8/8; Victory Route gate opens]
SLOT — MUSIC: solar loop, bright, CC0 chiptune.
SPRITE: solar city, Kenney Tiny City CC0 restyled.
CODE: map r4_sunyshore, r4_dojo_8; Victory gate
badges>=8. TEAM: ROSTER GAP.

### R4-14 Victory Route — Gauntlet, mountain, snow, Rift cracks

NPC — Victory gate keeper:
- "Eight badges, mountain, snow, and cracks.
  That is the gate. Walk it. The cracks are
  not shortcuts. They are warnings."
NPC — Veteran trainer (talk-to-battle, ROSTER GAP):
- "I walked this route when the Rift was just
  a crack. Now it is a story. Show me you
  read it."
- After battle: "You read it. Good. The Plateau
  is next, and it reads back."
SLOT — MUSIC: victory loop, driving, CC0 chiptune.
SPRITE: mountain + snow + cracks, 0x72 CC0
restyled. CODE: map r4_victory_route; gate
badges>=8. TEAM: ROSTER GAP.

### R4-15 Mainframe Plateau, fourth ascent — Elite Four + Champion

NPC — Plateau attendant:
- "Fourth ascent. The Hall has a fourth page
  for you, if you earn it."
ELITE 1 [NAME GAP]:
- Pre: "I guard the door. The Rift taught me
  that doors are not always where you left them."
- Post: "Pass. The stairs are yours."
ELITE 2 [NAME GAP]:
- Pre: "I guard the stairs. The lakes taught me
  that still water is deep water."
- Post: "Deep. The hall is yours."
ELITE 3 [NAME GAP]:
- Pre: "I guard the hall. The hall remembers
  every region, and the Rift between them."
- Post: "It remembers you. The champion's door
  is next."
ELITE 4 [NAME GAP]:
- Pre: "I guard the champion's door. Knock twice,
  and mean it, in snow and in Rift-light."
- Post: "Knock. Mean it. Go."
CHAMPION [NAME GAP — not Hex, not Mythar]:
- Pre: "You walked the oldest region and did
  not get lost in it. Now walk past me."
- Post: "Past. The Hall remembers you four
  times now. The Battle Zone is waiting."
- [Hall of Records, fourth entry; Battle Zone
  post-game opens]
SLOT — MUSIC: elite loop, champion loop, hall loop
calm, CC0 chiptune. SPRITE: Plateau + Hall,
Furniture Kit CC0 restyled. CODE: map r4_plateau,
r4_elite_1-4, r4_champion, r4_hall. TEAM: ROSTER GAP.

### R4-16 Battle Zone + Rift Dungeon — post-game, link to Region 5

NPC — Battle Zone keeper:
- "The Battle Zone is an island with a volcano
  in it, and a legendary creature in the volcano.
  That is not a warning. That is an invitation,
  if you are ready."
NPC — Rift keeper, before the Rift dungeon:
- "Down there, the Mainframe shows its bones.
  Do not touch the bones. Just close the wound."
- "The dungeon does not obey normal map rules.
  Gravity and exits shift as you walk it. Walk
  it anyway, and walk it steady."
NPC — Rift keeper, after sealing:
- "The Rift is sealed. The signal is clean.
  Region 5 is on the other side of the signal."
- "A train line, a ship line, and a signal all
  point the same way. The Liberation Front is
  already there. That is the link, and it is
  not a coincidence."
SLOT — MUSIC: volcano loop, tense, CC0 chiptune;
Rift loop, dissonant slow, CC0 chiptune.
SPRITE: volcano + Rift dungeon, 0x72 CC0 restyled.
CODE: map r4_battle_zone, r4_rift_dungeon; flags
r4_rift_sealed, r5_signal_open. TEAM: ROSTER GAP
— Battle Zone teams and Rift encounters, not
invented here.

---

## REGION 5 — New Continent

Theme: last continent, fullest story. Antagonists:
Liberation Front in full. Mythic spine: frozen
legendary plot, Grand Tournament, Bond Link. Note on
town labels: this region's town list follows the task
list for this file (Start City, Sandgem-shape,
Jubilife-shape, Oreburgh, Floaroma, Eterna, Hearthome,
Veilstone, Pastoria, Celestic, Canalave, Snowpoint,
Sunyshore). The canon doc's Region 5 city names are
a separate, later chapter list and are not conflated
here; no new personal name is invented in either list.

### R5-01 Start City — portal-train arrival, no dojo

NPC — Portal-train conductor:
- "Start City. Last continent, first stop. The
  portal train does not go back on its own. You
  have to choose to go back, and you have not
  finished here yet."
NPC — Start City elder:
- "This is the last continent. Not the last story.
  The Liberation Front is here, in full, and they
  are not hiding anymore."
SLOT — MUSIC: arrival loop, full, CC0 chiptune.
SPRITE: portal station + city, Kenney Tiny City
CC0 restyled. CODE: map r5_start_city; flags
r5_arrived, r5_portal_train_docked; heal + shop
in one MochiiPlex. TEAM: ROSTER GAP — no battle
required here.

### R5-02 Sandgem-shape town — researcher's town, first route, no dojo

Note: "Sandgem-shape" is the task's shape label for
this town's role (researcher's town, first route).
NPC — Town researcher:
- "The last continent has its own first route.
  Walk it like it is your first route ever, and
  you will see what the other routes hid."
NPC — Route keeper:
- "First wilds, last continent. The grass here
  is new, but the lesson is old: catch, raise,
  and do not rush."
SLOT — MUSIC: research-town loop, calm, CC0 chiptune.
SPRITE: research town, Tiny Town CC0 restyled.
CODE: map r5_sandgem; wild pool early Region 5,
ROSTER GAP; exit to Jubilife-shape city, no gate.
TEAM: ROSTER GAP — route trainers only.

### R5-03 Jubilife-shape city — media city, Front rally, no dojo

Note: "Jubilife-shape" is the task's shape label for
this city's role (media city).
NPC — Media clerk:
- "The Front is on every screen here. That is not
  news. That is a rally, and a rally is not the
  same as a conversation."
ANTAGONIST — Liberation Front speaker, rally:
- "We do not want to own the Mochiichao. We want
  to free them. From you. From everyone. Even
  from the Mainframe itself."
NPC — City elder, after the rally:
- "Listen to them, then listen to your team.
  Your team has been with you longer than any
  speech. That matters, and it is not a slogan."
SLOT — MUSIC: media-city loop, busy, CC0 chiptune.
SPRITE: media city, Kenney Tiny City CC0 restyled.
CODE: map r5_jubilife; Front-rally flag. TEAM:
ROSTER GAP — no dojo here; city trainers only.

### R5-04 Oreburgh City — Dojo 1, mining / rock theme

NPC — Mine keeper:
- "The last continent's mine is the same work,
  new rock. Work is work, wherever you dig it."
DOJO PRE — Dojo leader [NAME GAP]:
- "A mining dojo is a dojo of work. Show me
  work, not wishes, on the last continent too."
DOJO POST — Dojo leader [NAME GAP]:
- "Work. Take the first badge of this region."
- [badge R5-1/8]
SLOT — MUSIC: mining loop, steady, CC0 chiptune.
SPRITE: mining city, Tiny City CC0 restyled +
0x72 CC0. CODE: map r5_oreburgh, r5_dojo_1.
TEAM: ROSTER GAP.

### R5-05 Floaroma Town — flower town, valley, no dojo

NPC — Flower keeper:
- "The valley here is not the valley in Region 4.
  Same flowers, different soil. Soil matters."
- "The Front walked through here too. They left
  pamphlets, not footprints. Pamphlets fade.
  Footprints do not."
SLOT — MUSIC: valley loop, gentle, CC0 chiptune.
SPRITE: flower valley, Kenney Tiny Town CC0
restyled. CODE: map r5_floaroma; Front-pamphlet
flag. TEAM: ROSTER GAP — no dojo here.

### R5-06 Eterna City — Dojo 2, forest city

NPC — Forest keeper:
- "The forest here is younger than Region 4's
  forest, and younger is not weaker. Young trees
  bend, and bending is a skill."
DOJO PRE — Dojo leader [NAME GAP]:
- "A forest dojo is a dojo of patience. Trees
  do not hurry, and neither do I, on any continent."
DOJO POST — Dojo leader [NAME GAP]:
- "Patient. Take the second badge."
- [badge R5-2/8]
SLOT — MUSIC: forest loop, CC0 chiptune.
SPRITE: forest city, Tiny Town CC0 restyled.
CODE: map r5_eterna, r5_dojo_2. TEAM: ROSTER GAP.

### R5-07 Hearthome City — Dojo 3, contest / Garden branch

NPC — Contest hall keeper:
- "The contest here is the same showing, new
  lights. Show your creature, and show it kindly."
NPC — Mochiko, Garden branch:
- "The Garden branch here is the same Garden,
  newest soil. Raise them here, and they will
  remember every garden before this one."
DOJO PRE — Dojo leader [NAME GAP]:
- "A contest dojo is a dojo of grace. Grace is
  not soft. Grace is exact, under lights, on
  the last continent too."
DOJO POST — Dojo leader [NAME GAP]:
- "Graceful. Take the third badge."
- [badge R5-3/8; Garden branch flag]
SLOT — MUSIC: contest loop, bright, CC0 chiptune.
SPRITE: contest hall, Kenney Furniture Kit CC0
restyled. CODE: map r5_hearthome, r5_contest_hall,
r5_dojo_3. TEAM: ROSTER GAP.

### R5-08 Veilstone City — Dojo 4, Front warehouse city

NPC — Warehouse keeper:
- "The warehouses here are full of Front supplies.
  Supplies are not arguments. Arguments are
  what you say after you open the warehouse."
ANTAGONIST — Liberation Front operative, warehouse:
- "We are freeing creatures, not stealing them.
  If you cannot tell the difference, you are
  part of the problem we are solving."
DOJO PRE — Dojo leader [NAME GAP]:
- "A warehouse dojo is a dojo of strength with
  nowhere to hide. Stand in the open, even when
  the Front is watching."
DOJO POST — Dojo leader [NAME GAP]:
- "Open. Take the fourth badge."
- [badge R5-4/8; warehouse flag]
SLOT — MUSIC: warehouse loop, tense, CC0 chiptune.
SPRITE: warehouses, Tiny City CC0 restyled.
CODE: map r5_veilstone, r5_warehouse, r5_dojo_4.
TEAM: ROSTER GAP.

### R5-09 Pastoria City — Dojo 5, marsh city, preserve, frozen plot start

NPC — Marsh keeper:
- "The marsh here is a preserve, same rule:
  look, learn, do not take more than the marsh
  offers."
NPC — Preserve guide, frozen plot:
- "Something frozen is in the marsh's cold
  corner, and the Front is interested in it.
  Cold is not the same as dead. Remember that."
ANTAGONIST — Liberation Front operative, cold corner:
- "The frozen one does not want a trainer. It
  wants to be free, and free means cold, and
  cold means alone. We are helping it be alone."
DOJO PRE — Dojo leader [NAME GAP]:
- "A marsh dojo is a dojo of patience in wet
  boots. Wade, and do not complain about wet,
  even when the water is cold."
DOJO POST — Dojo leader [NAME GAP]:
- "You waded. Take the fifth badge."
- [badge R5-5/8; frozen-plot flag, stage 1]
SLOT — MUSIC: marsh loop, slow, CC0 chiptune.
SPRITE: marsh + preserve, Tiny Town CC0 restyled.
CODE: map r5_pastoria, r5_preserve, r5_dojo_5.
TEAM: ROSTER GAP.

### R5-10 Celestic Town — old town, lore, no dojo

NPC — Lore keeper:
- "This town is old on the last continent, which
  means it is older than the continent's story
  admits. Old towns do not lie. New stories do."
NPC — Celestic elder:
- "The bond is the story here. Not the battle,
  not the badge. The bond. Ask your team what
  it wants, and listen to the answer."
SLOT — MUSIC: lore loop, quiet, CC0 chiptune.
SPRITE: old town, Tiny Town CC0 restyled.
CODE: map r5_celestic; bond-lore flag. TEAM:
ROSTER GAP — no dojo here.

### R5-11 Canalave City — Dojo 6, port, library, frozen plot escalates

NPC — Library keeper:
- "The library here has a book about the frozen
  one. It does not say what the Front says it
  says. Read it yourself. That is the whole job."
ANTAGONIST — Liberation Front speaker, library steps:
- "The book is old. Old books are not truth.
  They are just old. We are new, and new is
  better, because new has not failed yet."
DOJO PRE — Dojo leader [NAME GAP]:
- "A port dojo is a dojo of steel and salt.
  Rust is honest. Be honest, and be steel, even
  when the story gets cold."
DOJO POST — Dojo leader [NAME GAP]:
- "Steel. Take the sixth badge."
- [badge R5-6/8; frozen-plot flag, stage 2]
SLOT — MUSIC: port loop, steady, CC0 chiptune.
SPRITE: port + library, Tiny City CC0 restyled.
CODE: map r5_canalave, r5_library, r5_dojo_6.
TEAM: ROSTER GAP.

### R5-12 Snowpoint City — Dojo 7, snow city, temple, frozen plot

NPC — Temple keeper:
- "The temple is cold, and the frozen one is
  colder. Cold is not evil. Cold is just cold.
  The Front is making cold into a story, and
  stories can freeze people too."
DOJO PRE — Dojo leader [NAME GAP]:
- "Snow does not hurry. Snow waits, and then
  it is everywhere. Be snow, even in a frozen
  plot."
DOJO POST — Dojo leader [NAME GAP]:
- "You waited. Take the seventh badge."
- [badge R5-7/8; frozen-plot flag, stage 3]
SLOT — MUSIC: snow loop, quiet, CC0 chiptune.
SPRITE: snow city + temple, Tiny Town CC0 restyled.
CODE: map r5_snowpoint, r5_temple, r5_dojo_7.
TEAM: ROSTER GAP.

### R5-13 Sunyshore City — Dojo 8, solar city, lighthouse road

NPC — Solar keeper:
- "The city runs on sun, even on the last
  continent. Sun is free, and free is not the
  same as easy. Keep the panels clean, and
  keep your team cleaner."
DOJO PRE — Dojo leader [NAME GAP]:
- "A solar dojo is a dojo of light with no
  shadows to hide in. Stand in the light, after
  all the cold and all the marsh."
DOJO POST — Dojo leader [NAME GAP]:
- "You stood. Take the eighth badge."
- [badge R5-8/8; Victory Route gate opens]
SLOT — MUSIC: solar loop, bright, CC0 chiptune.
SPRITE: solar city, Kenney Tiny City CC0 restyled.
CODE: map r5_sunyshore, r5_dojo_8; Victory gate
badges>=8. TEAM: ROSTER GAP.

### R5-14 Victory Route — Gauntlet, all five regions mixed

NPC — Victory gate keeper:
- "Eight badges, all five regions in one route.
  That is the gate. Walk it. Trainers from
  every region you have walked are here, and
  they remember you."
NPC — Veteran trainer, mixed-region team (ROSTER GAP):
- "I walked with you in Region 1, and I walked
  against you in Region 4. Now I walk here.
  Show me the whole journey, not just the last
  town."
- After battle: "Whole. Good. The Plateau is
  next, and it is the whole journey too."
SLOT — MUSIC: victory loop, driving, CC0 chiptune.
SPRITE: mountain road, 0x72 CC0 restyled.
CODE: map r5_victory_route; gate badges>=8.
TEAM: ROSTER GAP — mixed-region veteran teams.

### R5-15 Mainframe Plateau, fifth ascent — Elite Four + Champion

NPC — Plateau attendant:
- "Fifth ascent. The Hall has a fifth page for
  you, if you earn it. After that, the Hall has
  a final page, and it is not yours yet."
ELITE 1 [NAME GAP]:
- Pre: "I guard the door. The bond taught me
  that a door is not a wall, if you knock right."
- Post: "Pass. The stairs are yours."
ELITE 2 [NAME GAP]:
- Pre: "I guard the stairs. The frozen plot taught
  me that cold is not the same as closed."
- Post: "Open. The hall is yours."
ELITE 3 [NAME GAP]:
- Pre: "I guard the hall. The hall remembers
  every region, every bond, every battle."
- Post: "It remembers you. The champion's door
  is next."
ELITE 4 [NAME GAP]:
- Pre: "I guard the champion's door. Knock twice,
  and mean it, for all five regions at once."
- Post: "Knock. Mean it. Go."
CHAMPION [NAME GAP — not Hex, not Mythar]:
- Pre: "You beat the continent. Now beat the
  trainer the continent remembers most."
- Post: "You beat the continent. Now beat the
  game. The Grand Tournament is waiting, and
  Mythar is waiting after it."
- [Hall of Records, fifth entry; Grand Tournament
  post-game opens]
SLOT — MUSIC: elite loop, champion loop, hall loop
calm, CC0 chiptune. SPRITE: Plateau + Hall,
Furniture Kit CC0 restyled. CODE: map r5_plateau,
r5_elite_1-4, r5_champion, r5_hall. TEAM: ROSTER GAP.

### R5-16 Grand Tournament — post-game bracket, all regions

NPC — Tournament announcer:
- "Welcome to the Grand Tournament. Every champion,
  every region, one bracket. Win it, and you face
  Mythar."
NPC — Tournament keeper, between rounds:
- "Leaders and champions from all five regions.
  Bracketed, seasonal. No easy round. That is
  the point of a grand tournament."
NPC — Hex, tournament rematch:
- "I am here too. Not as your rival this time.
  As a champion, in a bracket. Beat me here,
  and the bracket means more."
- After battle: "You beat me here too. Good.
  Mythar is next. Do not let the bracket fool
  you — Mythar is not a bracket. Mythar is a
  final."
SLOT — MUSIC: tournament loop, driving, CC0
chiptune. SPRITE: tournament arena, Tiny City
CC0 restyled. CODE: map r5_grand_tournament;
bracket flags; Grand Tournament win flag opens
Mythar gate. TEAM: ROSTER GAP — tournament teams
for every leader / champion, not invented here.

### R5-17 Mythar — true final, Mainframe Plateau final ascent

NPC — Plateau attendant, final ascent:
- "Final ascent. This is not a region champion.
  This is the champion of the whole Mainframe.
  Walk it like it is the last walk, because it is."
MYTHAR (canon name, #331):
- Pre: "I am not a region champion. I am the
  champion of the whole Mainframe. Show me why
  you belong in the Hall with me."
- Post: "You belong. The Hall is yours, all five
  times over. Now go play. The world is open."
NPC — Prof. Aeon, after Mythar:
- "Five regions, five Halls, one trainer. The
  Mainframe remembers you now, the way it
  remembers Mythar. That is the true ending,
  and it is not an ending. It is an opening."
- [true ending flag, final credits, free play
  across all five regions, Garden, Arena,
  Creature Mode, tournament seasons continue]
SLOT — MUSIC: final loop, full, CC0 chiptune;
ending loop, calm, CC0 chiptune. SPRITE: final
Plateau, Furniture Kit CC0 restyled + Tiny City
CC0 restyled. CODE: map r5_mythar_final; flags
r5_grand_tournament_won, r5_mythar_beat,
r5_true_ending, r5_free_play. TEAM: ROSTER GAP
— Mythar's team is not invented here; Mythar is
roster #331 in the Mochiichao roster, team to be
set from roster stats when they are final, not
from a commercial champion's team.

---

## Count — towns dialogued, per region

Count rule: one entry = one town / place with
2-4 NPC lines, dojo lines where a dojo exists,
antagonist line where relevant, and a slot note.
Sub-entries R3-09a / R3-09b are counted separately,
because they are separate towns with separate dialogue.

- Region 2: 14 / 14 = 100%
  Dawnfield, Cherryport, Violet, Azalea, Ilex,
  Goldenrod, Ecruteak, Olivine, Cianwood, Mahogany,
  Blackthorn, Victory, Plateau, Frost Peak.
- Region 3: 15 file entries, task core 12 / 12 = 100%
  Task core: Root Hamlet, Oldale Road, Rustboro,
  Dewford, Mauville, Lavaridge, Petalburg, Fortree,
  Crater City, Victory, Plateau, Frontier Arenas.
  Extra file entries, so no canon town is skipped:
  Lilycove, Mossdeep, Awakening.
- Region 4: 16 file entries, task core 15 / 15 = 100%
  Task core: Twinleaf Hamlet, Jubilife-shape city,
  Oreburgh, Floaroma, Eterna, Hearthome, Veilstone,
  Pastoria, Celestic, Canalave, Snowpoint,
  Sunyshore, Victory, Plateau, Battle Zone / Rift.
  Extra file entry: Sandgem-shape town (canon
  researcher's town, first route).
- Region 5: 17 / 17 = 100%
  Start City, Sandgem-shape town, Jubilife-shape
  city, Oreburgh, Floaroma, Eterna, Hearthome,
  Veilstone, Pastoria, Celestic, Canalave,
  Snowpoint, Sunyshore, Victory, Plateau, Grand
  Tournament, Mythar.
- TOTAL file entries: 14 + 15 + 16 + 17 = 62
- TOTAL task-list towns dialogued: 14 + 12 + 15 + 17
  = 58 / 58 = 100%

## What is NOT done by this file, on purpose

- Trainer teams: ROSTER GAP in every entry. No
  stats, levels beyond the wiring-master level
  rules, or move lists are invented here.
- Leader / champion personal names: NAME GAP in
  every entry except canon Aeon, Mochiko, Hex,
  Master Lin, Master Falk, Mythar. No new personal
  name is invented here.
- Game-code wiring, sprites, music files, and
  playtesting: slot notes only. This file is not
  edited into ~/workspace/mochiichao-work/fresh-start,
  per task, and is not a claim that the game is
  playable at 100% — integration, main PR, build,
  and playtest are still owed by the parent lane.
