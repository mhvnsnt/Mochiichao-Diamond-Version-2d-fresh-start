// region2-story.ink — Region 2 "Twin / Return", compiled Ink story.
//
// Source: src/lib/wiring/dialogue/region2-dialogue.json (content-only
// beat spec), corrected 2026-11-13 to the locked md source
// story-dialogue-regions2-5-full.md (World Builder lane, 2026-10-25).
// Audit: 31/265 lines reworded + 7 invented names removed in the JSON
// correction (see docs/regions2-5-ink-dialogue-20261113.md); this .ink is
// generated from the CORRECTED json, never from the drifted copy.
// Knot map: one talk knot per entry (<id>_<townslug>), plus an _after
// knot where the entry has post-battle/post-event lines (dojo post,
// elite/champion post, Hex post, "After battle" veteran lines, NPC
// lines whose speaker carries ", after "). Knot-scoped play (the
// InkSession default) plays one knot per talk, like region1-truck-start.
// Flags: VARs below, one per progression flag in the region. Arrival
// flags are set in the talk knot; all other flags in the _after knot
// when one exists, else the talk knot. Badge flags only in _after knots.
// Speaker labels: the JSON keeps the locked md label verbatim; the .ink
// uses the clean display label (base role title, title case; NAME GAP
// leaders/elites/champions show as "Dojo Leader"/"Elite N"/"Champion"/
// "First Champion" — never an invented name).
// No player choices in Regions 2-5 (the md has none); linear to END.
// // trainer: comments on each talk knot name the team ids in
// src/lib/trainers-region2.ts for the beat's battles (verified ids;
// R5 dojos map positionally by dojo number only — the dialogue's R5
// town labels diverge from the trainer file; see the doc). Gaps are
// labelled GAP, never filled with an invented team.
// Regions 2-5 maps do NOT exist in FULL_WORLD yet — no NPC is wired to
// these knots in this PR; the knots are the scene-level source the map
// wiring will attach to.

VAR r2_arrived = false
VAR r2_badge_gate_active = false
VAR r2_tower_puzzle = false
VAR r2_badge_gate_step_1 = false
VAR r2_well_cleared = false
VAR r2_syndicate_cell = false
VAR r2_badge_gate_step_2 = false
VAR r2_shrine_maze = false
VAR r2_tower_story = false
VAR r2_badge_gate_step_3 = false
VAR r2_beasts_wake = false
VAR r2_badge_gate_step_4 = false
VAR r2_sea_road = false
VAR r2_badge_gate_step_5 = false
VAR r2_water_crossing = false
VAR r2_medicine = false
VAR r2_badge_gate_step_6 = false
VAR r2_hideout = false
VAR r2_lake_cleared = false
VAR r2_badge_gate_step_7 = false
VAR r2_badge_gate_complete = false
VAR r2_victory_gate_open = false
VAR r2_victory_gate_badges_8 = false
VAR r2_hall_second_entry = false
VAR r2_rematches_open = false
VAR r2_rematches_done = false
VAR r2_frost_peak_beat = false
VAR r3_storm_route_open = false

-> r2_01_dawnfield

// R2-01 — Dawnfield (arrival town, no dojo)
=== r2_01_dawnfield ===
// trainer: R2-001 (route), R2-002 (route)
Ferry Captain: Dawnfield. End of the ferry, start of the chapter.
Ferry Captain: Aeon sent word ahead. Your team is on the list, but the list opens badge by badge. Earn them.
Ferry Captain: The MochiiPlex here is small, but the heal is free, same as home. Rest before you walk.
Dawnfield Researcher: Aeon handed you to me by radio, so I will say it plain: this region remembers trainers.
Dawnfield Researcher: Walk the opening road first. Do not skip to the tower. The tower notices skippers.
~ r2_arrived = true
~ r2_badge_gate_active = true
-> r2_02_cherryport

// R2-02 — Cherryport (opening road town, no dojo)
=== r2_02_cherryport ===
// trainer: R2-003 (route), R2-004 (route)
Cherryport Road Keeper: This is the opening road. First wilds, first trainers, nothing fancy — and that is the point.
Cherryport Road Keeper: If your team feels thin, catch here. The grass is kind to new arrivals.
Cherryport Fisher: The water here is shallow. Wave-Ride is not needed yet. Walk the bank and watch the data.
Cherryport Fisher: A trainer who rushes past Cherryport misses the whole region. I have seen it happen.
-> r2_03_violet

// R2-03 — Violet Town (Dojo 1, tower puzzle)
=== r2_03_violet ===
// trainer: R2-016 (acolyte), R2-017 (acolyte), R2-018 (dojo leader)
Tower Guide: The tower is a puzzle, not a wall. Each floor teaches you one thing. Do not climb angry.
Tower Guide: The first beast was seen here. Seen, not caught. Remember the difference.
Violet Town Elder: Violet is old. The dojo is older. Respect both and the badge will not feel heavy.
Dojo Leader: A tower stands because every stone knows its place. Show me you know yours.
-> r2_03_violet_after

// R2-03 — Violet Town (Dojo 1, tower puzzle)
=== r2_03_violet_after ===
Dojo Leader: You know it. Take the first badge of this region. Your old team opens one slot wider now.
~ r2_tower_puzzle = true
~ r2_badge_gate_step_1 = true
-> r2_04_azalea

// R2-04 — Azalea Town (Dojo 2, well / spring rescue)
=== r2_04_azalea ===
// trainer: R2-019 (acolyte), R2-020 (acolyte), R2-021 (dojo leader)
// trainer GAP: well Syndicate operative has no Azalea team (only Mahogany Hideout Syndicate R2-010/R2-011)
Well Keeper: The well is not dry. It is drained. Someone is taking the spring, one bucket at a time.
Well Keeper: Go down. Bring the spring back. The town will remember who did it.
Syndicate Operative: The spring flows where we say it flows. You are not on the list.
Syndicate Operative: Fine. Battle me, then. The list does not change, but you can try.
Dojo Leader: You brought the spring back. Now bring a steady team. I test steadiness, not speed.
-> r2_04_azalea_after

// R2-04 — Azalea Town (Dojo 2, well / spring rescue)
=== r2_04_azalea_after ===
Dojo Leader: Steady. Take the second badge. Your old team opens another slot.
~ r2_well_cleared = true
~ r2_syndicate_cell = true
~ r2_badge_gate_step_2 = true
-> r2_05_ilex_forest

// R2-05 — Ilex Forest (forest maze, shrine, no dojo)
=== r2_05_ilex_forest ===
// trainer: R2-005 (route), R2-006 (route)
Forest Shrine Keeper: The forest is a maze on purpose. The shrine is in the middle, and the middle is quiet.
Forest Shrine Keeper: The second beast was seen at the shrine. It did not stay. Beasts do not stay for crowds.
Forest Wanderer: I got lost here three times. The fourth time, I stopped rushing, and the path found me.
Forest Wanderer: Cut nothing here unless the path asks you to. Data-Cut is a tool, not a shortcut.
~ r2_shrine_maze = true
-> r2_06_goldenrod

// R2-06 — Goldenrod City (Dojo 3, Radio Tower, market)
=== r2_06_goldenrod ===
// trainer: R2-007 (tower), R2-008 (tower), R2-022 (acolyte), R2-023 (acolyte), R2-024 (dojo leader)
Radio Tower Clerk: The tower talks to the whole region. Right now it is talking too much, and listening too little.
Radio Tower Clerk: Come back after the tower story. It will make sense then, and not before.
Market Clerk: Big city, big market. The Garden branch here sells what Silicon Town cannot stock yet.
Market Clerk: Do not buy everything. Buy what your team actually needs for the next road.
Syndicate Operative: The tower is ours on paper. Paper is stronger than you think.
Dojo Leader: A big city dojo is not a big dojo. It is a dojo that has to be exact, because everyone is watching.
-> r2_06_goldenrod_after

// R2-06 — Goldenrod City (Dojo 3, Radio Tower, market)
=== r2_06_goldenrod_after ===
Dojo Leader: Exact. Take the third badge. Your old team opens another slot.
~ r2_tower_story = true
~ r2_badge_gate_step_3 = true
-> r2_07_ecruteak

// R2-07 — Ecruteak City (Dojo 4, Burned Tower)
=== r2_07_ecruteak ===
// trainer: R2-025 (acolyte), R2-026 (acolyte), R2-027 (dojo leader)
Burned Tower Keeper: The tower burned, and the beasts woke in the smoke. They are not yours to catch yet.
Burned Tower Keeper: They are yours to follow. Follow, do not chase. Chasing scares a beast into the next region.
Ecruteak Elder: This city remembers fire. It also remembers the trainers who walked out of the fire calm.
Dojo Leader: Fire teaches, if you let it. Show me what the tower taught you.
-> r2_07_ecruteak_after

// R2-07 — Ecruteak City (Dojo 4, Burned Tower)
=== r2_07_ecruteak_after ===
Dojo Leader: You learned. Take the fourth badge. Your old team opens another slot.
~ r2_beasts_wake = true
~ r2_badge_gate_step_4 = true
-> r2_08_olivine

// R2-08 — Olivine City (Dojo 5, lighthouse, Wave-Ride gate)
=== r2_08_olivine ===
// trainer: R2-028 (acolyte), R2-029 (acolyte), R2-030 (dojo leader)
Lighthouse Keeper: The light is not for ships. It is for trainers who have forgotten where the shore is.
Lighthouse Keeper: Keep the light, and I will keep the sea road open for you. That is the deal, and it is fair.
Olivine Harbour Keeper: Wave-Ride works here, same as Region 1. Water is a road, if you respect it. Do not surf angry.
Dojo Leader: A lighthouse keeper's dojo is a dojo of patience. Wait for the right move, then take it.
-> r2_08_olivine_after

// R2-08 — Olivine City (Dojo 5, lighthouse, Wave-Ride gate)
=== r2_08_olivine_after ===
Dojo Leader: Patient. Take the fifth badge. Your old team opens another slot.
~ r2_sea_road = true
~ r2_badge_gate_step_5 = true
-> r2_09_cianwood

// R2-09 — Cianwood City (Dojo 6, across water, medicine beat)
=== r2_09_cianwood ===
// trainer: R2-031 (acolyte), R2-032 (acolyte), R2-033 (dojo leader)
Medicine Keeper: The medicine is not magic. It is care, measured out, one dose at a time. Bring it to the island dojo, and bring it whole.
Medicine Keeper: The water crossing is short. The lesson is long. Do not mix them up.
Dojo Leader: You crossed water to get here. Now cross the gap between a good team and a cared-for team.
-> r2_09_cianwood_after

// R2-09 — Cianwood City (Dojo 6, across water, medicine beat)
=== r2_09_cianwood_after ===
Dojo Leader: Cared for. Take the sixth badge. Your old team opens another slot.
~ r2_water_crossing = true
~ r2_medicine = true
~ r2_badge_gate_step_6 = true
-> r2_10_mahogany

// R2-10 — Mahogany Town (Dojo 7, lake, hideout raid)
=== r2_10_mahogany ===
// trainer: R2-009 (lake), R2-010 (hideout), R2-011 (hideout), R2-034 (acolyte), R2-035 (acolyte), R2-036 (dojo leader)
Lake Watcher: The lake is angry. Something red is in it, and it is not red by nature. Someone made it red.
Lake Watcher: The hideout is under the town. Raid it, and the lake calms. Do not raid it angry — raid it steady.
Syndicate Hideout Leader: The lake is a battery. We charge it, we use it. You are not part of the circuit.
Dojo Leader: You calmed a lake. Now calm a dojo. Same skill, smaller water.
-> r2_10_mahogany_after

// R2-10 — Mahogany Town (Dojo 7, lake, hideout raid)
=== r2_10_mahogany_after ===
Dojo Leader: Calm. Take the seventh badge. Your old team opens another slot.
~ r2_hideout = true
~ r2_lake_cleared = true
~ r2_badge_gate_step_7 = true
-> r2_11_blackthorn

// R2-11 — Blackthorn City (Dojo 8, Dragon's Den trial)
=== r2_11_blackthorn ===
// trainer: R2-037 (acolyte), R2-038 (acolyte), R2-039 (dojo leader)
Den Elder: The den is a trial, not a test. A test asks what you know. A trial asks who you are.
Den Elder: Walk the den. If you come out, the badge is already yours. The battle just confirms it.
Dojo Leader: You walked the den. Now stand in it. Show me the trainer the den saw.
-> r2_11_blackthorn_after

// R2-11 — Blackthorn City (Dojo 8, Dragon's Den trial)
=== r2_11_blackthorn_after ===
Dojo Leader: The den saw you. Take the eighth badge. Your old team is fully open now.
~ r2_badge_gate_complete = true
~ r2_victory_gate_open = true
-> r2_12_victory_route

// R2-12 — Victory Route (Gauntlet, no dojo, no town)
=== r2_12_victory_route ===
// trainer: R2-012 (veteran), R2-013 (veteran), R2-014 (veteran), R2-015 (veteran)
Victory Gate Keeper: Eight badges. That is the gate, and it is the only gate. Walk it. Do not run it — run it and you will miss the trainers who teach you.
Veteran Trainer: I have walked this route in Region 1 and here. The route remembers. Show me you do too.
Veteran Trainer: You remember. Good. The Plateau is next, and it remembers more.
~ r2_victory_gate_badges_8 = true
-> r2_13_plateau

// R2-13 — Mainframe Plateau, second ascent (Elite Four + Champion)
=== r2_13_plateau ===
// trainer: R2-040 (elite 1), R2-041 (elite 2), R2-042 (elite 3), R2-043 (elite 4), R2-044 (champion)
Plateau Attendant: Second ascent. Same Plateau, different trainer. The Hall has a second page for you, if you earn it.
Elite 1: I guard the door. Pass me, and you are no longer a visitor.
Elite 2: I guard the stairs. Climb, if you can.
Elite 3: I guard the hall. The hall remembers everyone who stood here.
Elite 4: I guard the champion's door. Knock twice, and mean it.
Champion: You have beaten a region that remembers you. Now beat the trainer it remembers most.
-> r2_13_plateau_after

// R2-13 — Mainframe Plateau, second ascent (Elite Four + Champion)
=== r2_13_plateau_after ===
Elite 1: Pass. The stairs are yours.
Elite 2: Climb. The hall is yours.
Elite 3: It will remember you. The champion's door is next.
Elite 4: Knock. Mean it. Go.
Champion: You have. The Hall remembers you twice now. Go back and finish what you started in Region 1 — it is waiting, stronger.
~ r2_hall_second_entry = true
~ r2_rematches_open = true
-> r2_14_frost_peak

// R2-14 — Frost Peak (post-game final battle, link to Region 3)
=== r2_14_frost_peak ===
// trainer: R2-053 (first champion)
Frost Peak Guide: The top is snow and silence. The First Champion waits there. He does not talk. He battles.
First Champion: …
-> r2_14_frost_peak_after

// R2-14 — Frost Peak (post-game final battle, link to Region 3)
=== r2_14_frost_peak_after ===
First Champion: The sea route is open. Storm-locked, but open. Region 3 is waiting.
Prof. Aeon: You beat the First Champion. The expedition signal is clean. Take the storm route. Region 3 is on the other side of it.
~ r2_rematches_done = true
~ r2_frost_peak_beat = true
~ r3_storm_route_open = true
-> END
