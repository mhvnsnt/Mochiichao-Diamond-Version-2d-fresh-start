// region3-story.ink — Region 3 "Sea / Land", compiled Ink story.
//
// Source: src/lib/wiring/dialogue/region3-dialogue.json (content-only
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
// src/lib/trainers-region3.ts for the beat's battles (verified ids;
// R5 dojos map positionally by dojo number only — the dialogue's R5
// town labels diverge from the trainer file; see the doc). Gaps are
// labelled GAP, never filled with an invented team.
// Regions 2-5 maps do NOT exist in FULL_WORLD yet — no NPC is wired to
// these knots in this PR; the knots are the scene-level source the map
// wiring will attach to.

VAR r3_lab_starter = false
VAR r3_codex_upgrade = false
VAR r3_faction_sighting = false
VAR r3_water_crossing = false
VAR r3_arena_bracket = false
VAR r3_land_base = false
VAR r3_weather = false
VAR r3_deep_dive = false
VAR r3_faction_collision = false
VAR r3_double_battle_dojo = false
VAR r3_land_wake_stopped = false
VAR r3_sea_wake_stopped = false
VAR r3_balance_kept = false
VAR r3_league_gate_open = false
VAR r3_victory_gate_badges_8 = false
VAR r3_hall_third_entry = false
VAR r3_frontier_open = false
VAR r3_frontier_done = false
VAR r4_airship_route_open = false

-> r3_01_outpost_2f

// R3-01 — Root Hamlet (outpost bedroom + lab start (chapter opening, not a new game))
=== r3_01_outpost_2f ===
// trainer: R3-001 (Hex lab-exit)
Outpost Keeper: You are awake. Good. The lab is down the road.
Outpost Keeper: The researcher is waiting, and Hex is already there, looking impatient. Go. Do not keep Hex waiting — he keeps score.
Region 3 Researcher: Welcome to Root Hamlet. Pick a partner from the table. It will travel with your main team, not instead of it.
Region 3 Researcher: Take the Codex upgrade, and the Capture Cubes. The sea is wide, and you will need both.
Hex: You pick first, I pick stronger. That is the rule, and the rule has not changed.
~ r3_lab_starter = true
~ r3_codex_upgrade = true
-> r3_01_outpost_2f_after

// R3-01 — Root Hamlet (outpost bedroom + lab start (chapter opening, not a new game))
=== r3_01_outpost_2f_after ===
Hex: You win here too. Fine. The sea is bigger than both of us. Let's see who crosses it first.
-> r3_02_oldale_road

// R3-02 — Oldale Road (opening road, no dojo)
=== r3_02_oldale_road ===
// trainer: R3-002 (route), R3-003 (route)
Oldale Road Keeper: This is the opening road. First route, first wilds, now open after the lab beat.
Oldale Road Keeper: Do not skip the road. The road teaches the region's weather, and the weather matters here.
Oldale Fisher: The sea starts here, even on land. You can smell it before you see it.
-> r3_03_rustboro

// R3-03 — Rustboro City (Dojo 1, stone / rock theme)
=== r3_03_rustboro ===
// trainer: R3-014 (acolyte), R3-015 (acolyte), R3-016 (dojo leader)
// trainer GAP: Land faction scout has no Rustboro team (faction teams are all at Lilycove Hideout)
Rustboro Stone Keeper: Stone does not hurry. Stone waits, and then it is still there when you are tired.
Rustboro Stone Keeper: The first faction was seen here. Watch the stone, not the people. The stone tells you who moved it.
Land Faction Scout: The land remembers. We are here to help it remember louder.
Dojo Leader: Stone is not stubborn. Stone is honest. Show me an honest team.
-> r3_03_rustboro_after

// R3-03 — Rustboro City (Dojo 1, stone / rock theme)
=== r3_03_rustboro_after ===
Dojo Leader: Honest. Take the first badge of this region.
~ r3_faction_sighting = true
-> r3_04_dewford

// R3-04 — Dewford Town (Dojo 2, island, cave)
=== r3_04_dewford ===
// trainer: R3-017 (acolyte), R3-018 (acolyte), R3-019 (dojo leader)
Dewford Boat Keeper: The island is across the water. Wave-Ride works here. Water is a road, if you respect it.
Cave Guide: The cave is dark, but it is not empty. Bring Light-Pulse, and bring patience. Both light the same way.
Dojo Leader: An island dojo is a dojo with nowhere to run. Stand, and fight like you mean to stay.
-> r3_04_dewford_after

// R3-04 — Dewford Town (Dojo 2, island, cave)
=== r3_04_dewford_after ===
Dojo Leader: You stayed. Take the second badge.
~ r3_water_crossing = true
-> r3_05_mauville

// R3-05 — Mauville City (Dojo 3, electric city, Arena)
=== r3_05_mauville ===
// trainer: R3-004 (arena), R3-005 (arena), R3-020 (acolyte), R3-021 (acolyte), R3-022 (dojo leader)
// trainer GAP: Sea faction scout has no Mauville team
Arena Announcer: Welcome to the Arena. First full tournament bracket in the story. Win it, and the city remembers your name.
Mauville Electric Keeper: The city runs bright. Bright is not the same as safe. Watch the wires, and watch the people who watch the wires.
Sea Faction Scout: The sea forgets. We are here to help it forget faster.
Dojo Leader: Electric is fast, but fast is not first. First is the trainer who knows when to wait.
-> r3_05_mauville_after

// R3-05 — Mauville City (Dojo 3, electric city, Arena)
=== r3_05_mauville_after ===
Dojo Leader: You waited, then you struck. Take the third badge.
~ r3_arena_bracket = true
-> r3_06_lavaridge

// R3-06 — Lavaridge Town (Dojo 4, hot springs, Land base)
=== r3_06_lavaridge ===
// trainer: R3-023 (acolyte), R3-024 (acolyte), R3-025 (dojo leader)
// trainer GAP: Land faction base has no Lavaridge team
Hot-spring Keeper: The springs are warm because the mountain is awake. Warm is good. Awake is a warning.
Hot-spring Keeper: Soak, rest, heal — the MochiiPlex here is warm too, and the heal is free, same as home.
Land Faction Leader: The land remembers. Wake it, and it will remember us first.
Dojo Leader: Heat does not make a trainer strong. Heat shows which trainer is already strong.
-> r3_06_lavaridge_after

// R3-06 — Lavaridge Town (Dojo 4, hot springs, Land base)
=== r3_06_lavaridge_after ===
Dojo Leader: Strong. Take the fourth badge.
~ r3_land_base = true
-> r3_07_petalburg

// R3-07 — Petalburg City (Dojo 5, return dojo)
=== r3_07_petalburg ===
// trainer: R3-026 (acolyte), R3-027 (acolyte), R3-028 (dojo leader)
Petalburg Elder: This dojo waited for you. It was strong when you were new, and it is strong now that you are not new. That is the point of a return.
Mochiko: A dojo leader who knew Aeon is not a test. He is a memory, with a team. Treat him like both.
Dojo Leader: I knew Aeon when he was still learning. He told me you would come. Show me he was right.
-> r3_07_petalburg_after

// R3-07 — Petalburg City (Dojo 5, return dojo)
=== r3_07_petalburg_after ===
Dojo Leader: He was right. Take the fifth badge.
-> r3_08_fortree

// R3-08 — Fortree City (Dojo 6, tree city, weather institute)
=== r3_08_fortree ===
// trainer: R3-029 (acolyte), R3-030 (acolyte), R3-031 (dojo leader)
// trainer GAP: Sea faction weather-institute operative has no Fortree team
Weather Institute Keeper: The weather is not weather here. It is a signal, and someone is sending it.
Weather Institute Keeper: The Sea faction moved on the weather. Stop them, and the sky goes back to being sky.
Canopy Guide: The city is in the trees. Walk the canopy slow. A fast trainer falls, and a fallen trainer learns nothing.
Sea Faction Operative: The sea forgets. The sky should forget too. We are just helping it along.
Dojo Leader: A tree-city dojo is a dojo of balance. Lean too far, and you fall. Lean right, and you win.
-> r3_08_fortree_after

// R3-08 — Fortree City (Dojo 6, tree city, weather institute)
=== r3_08_fortree_after ===
Dojo Leader: Balanced. Take the sixth badge.
~ r3_weather = true
-> r3_09_crater_city

// R3-09 — Crater City (Dojo 8 in canon order, Deep-Dive gate, awakening (canon order: Lilycove, Mossdeep, then this crater city))
=== r3_09_crater_city ===
// trainer: R3-035 (acolyte), R3-036 (acolyte), R3-037 (dojo leader)
Crater City Elder: This city is under water and inside a volcano at once. That is not a contradiction. That is a balance, and balance is hard to hold.
Crater City Elder: Deep-Dive is the gate. Dive, and come back with the city, not just with yourself.
Dojo Leader: A crater dojo is a dojo of pressure. Hold under pressure, and you hold anywhere.
-> r3_09_crater_city_after

// R3-09 — Crater City (Dojo 8 in canon order, Deep-Dive gate, awakening (canon order: Lilycove, Mossdeep, then this crater city))
=== r3_09_crater_city_after ===
Dojo Leader: You held. Take the eighth badge.
~ r3_deep_dive = true
-> r3_09a_lilycove

// R3-09a — Lilycove (port, hideout under the city, no dojo)
=== r3_09a_lilycove ===
// trainer: R3-006 (Land faction), R3-007 (Sea faction), R3-008 (Land faction leader), R3-009 (Sea faction leader)
Port Keeper: The port is busy, and busy hides things. The hideout is under the city. The two factions are colliding down there, not up here.
Land: The land remembers. It will not share the memory with the sea.
Sea: The sea forgets. It will not share the forgetting with the land.
You: pick a side, or pick the balance. The balance is harder, and it is the only one that holds.
~ r3_faction_collision = true
-> r3_09b_mossdeep

// R3-09b — Mossdeep (island research city, Dojo 7)
=== r3_09b_mossdeep ===
// trainer: R3-032 (acolyte), R3-033 (acolyte), R3-034 (dojo leader)
// NOTE: double battles are a future system in the wiring master — record that, do not claim them as wired (md)
Research City Keeper: The satellite link is not a toy. It talks to the Mainframe, and the Mainframe answers.
Research City Keeper: The double-battle dojo is here. Two creatures, one trainer, no hiding behind a single star.
Dojo Leader: Two at once is not twice as hard. It is a different skill. Show me you have it.
-> r3_09b_mossdeep_after

// R3-09b — Mossdeep (island research city, Dojo 7)
=== r3_09b_mossdeep_after ===
Dojo Leader: You have it. Take the seventh badge.
~ r3_double_battle_dojo = true
-> r3_10_awakening

// R3-10 — The Awakening (legendary climax, before the League)
=== r3_10_awakening ===
// trainer GAP: legendary awakening encounters have no teams (ROSTER GAP by design)
Land Faction Leader: The land woke, and it saw you. It will remember that, even if we do not.
Sea Faction Leader: The sea woke, and it saw you. It will forget us, but it will not forget you.
-> r3_10_awakening_after

// R3-10 — The Awakening (legendary climax, before the League)
=== r3_10_awakening_after ===
Crater City Elder: You stopped both wakes. That is not a victory. That is a balance. Keep it.
~ r3_land_wake_stopped = true
~ r3_sea_wake_stopped = true
~ r3_balance_kept = true
~ r3_league_gate_open = true
-> r3_11_victory_route

// R3-11 — Victory Route (Gauntlet, sea and cave)
=== r3_11_victory_route ===
// trainer: R3-010 (veteran), R3-011 (veteran), R3-012 (veteran), R3-013 (veteran)
Victory Gate Keeper: Eight badges, sea and cave. That is the gate. Walk it. The League is on the other side, and it does not wait for late trainers.
Veteran Trainer: I crossed this sea in a storm. You can cross a route. Show me.
Veteran Trainer: You crossed. Good. The Plateau is next.
~ r3_victory_gate_badges_8 = true
-> r3_12_plateau

// R3-12 — Mainframe Plateau, third ascent (Elite Four + Champion)
=== r3_12_plateau ===
// trainer: R3-038 (elite 1), R3-039 (elite 2), R3-040 (elite 3), R3-041 (elite 4), R3-042 (champion)
Plateau Attendant: Third ascent. The Hall has a third page for you, if you earn it.
Elite 1: I guard the door. The sea taught me patience. Patience teaches back.
Elite 2: I guard the stairs. The land taught me steadiness. Be steady.
Elite 3: I guard the hall. The hall remembers every region you have walked.
Elite 4: I guard the champion's door. Knock twice, and mean it, in storm and in calm.
Champion: You balanced a region that was splitting in two. Now balance me.
-> r3_12_plateau_after

// R3-12 — Mainframe Plateau, third ascent (Elite Four + Champion)
=== r3_12_plateau_after ===
Elite 1: Pass. The stairs are yours.
Elite 2: Steady. The hall is yours.
Elite 3: It remembers you. The champion's door is next.
Elite 4: Knock. Mean it. Go.
Champion: Balanced. The Hall remembers you three times now. The Frontier Arenas are waiting.
~ r3_hall_third_entry = true
~ r3_frontier_open = true
-> r3_13_frontier_arenas

// R3-13 — Frontier Arenas (post-game, link to Region 4)
=== r3_13_frontier_arenas ===
// trainer: R3-043 (frontier brain), R3-044 (frontier brain), R3-045 (frontier brain), R3-046 (frontier brain)
Frontier Announcer: Welcome to the Frontier. Singles, doubles, rental teams, streaks — each Arena has its own rule, and the rules do not bend for champions.
Liberation Front Speaker: We are moving creatures for their own good. You will see, on the other side. You will see.
-> r3_13_frontier_arenas_after

// R3-13 — Frontier Arenas (post-game, link to Region 4)
=== r3_13_frontier_arenas_after ===
Arena Keeper: You cleared the Frontier. The mountain pass is open. The airship route is north, over the crater range, to a colder, older region.
~ r3_frontier_done = true
~ r4_airship_route_open = true
-> END
