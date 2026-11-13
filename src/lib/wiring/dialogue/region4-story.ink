// region4-story.ink — Region 4 "Rift", compiled Ink story.
//
// Source: src/lib/wiring/dialogue/region4-dialogue.json (content-only
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
// src/lib/trainers-region4.ts for the beat's battles (verified ids;
// R5 dojos map positionally by dojo number only — the dialogue's R5
// town labels diverge from the trainer file; see the doc). Gaps are
// labelled GAP, never filled with an invented team.
// Regions 2-5 maps do NOT exist in FULL_WORLD yet — no NPC is wired to
// these knots in this PR; the knots are the scene-level source the map
// wiring will attach to.

VAR r4_arrived = false
VAR r4_airship_docked = false
VAR r4_institute_public_face = false
VAR r4_first_rift_crack = false
VAR r4_statue_theft = false
VAR r4_garden_branch = false
VAR r4_meteorite = false
VAR r4_preserve = false
VAR r4_lore = false
VAR r4_island = false
VAR r4_temple = false
VAR r4_victory_gate_open = false
VAR r4_victory_gate_badges_8 = false
VAR r4_hall_fourth_entry = false
VAR r4_battle_zone_open = false
VAR r4_rift_sealed = false
VAR r5_signal_open = false

-> r4_01_twinleaf

// R4-01 — Twinleaf Hamlet (airship arrival, no dojo)
=== r4_01_twinleaf ===
// trainer GAP: no Twinleaf Hamlet team (nearest: Sandgem Route R4-001/R4-002)
Airship Captain: Twinleaf Hamlet. Edge of the snow, edge of the old story. Step off careful — the ground here is older than the map.
Hamlet Elder: The Rift is not a place. It is a wound in a place. Walk carefully. The creatures here are not wild — they are lost.
~ r4_arrived = true
~ r4_airship_docked = true
-> r4_02_sandgem

// R4-02 — Sandgem-shape town (researcher's town, first route, no dojo (shape label, not a new place name))
=== r4_02_sandgem ===
// trainer: R4-001 (route), R4-002 (route)
Town Researcher: Three lakes, three guardians, one mystery. That is the whole region, in one sentence.
Town Researcher: Walk the first route first. The lakes wait. The Rift does not wait, but the lakes do.
Route Keeper: The first route is kind, for an old region. Kind is not the same as easy. Watch the grass.
-> r4_03_jubilife

// R4-03 — Jubilife-shape city (media city, institute's public face, no dojo (shape label, not a new place name))
=== r4_03_jubilife ===
// trainer GAP: no Jubilife-shape city team
Media Clerk: The institute is on every screen. That is not news. That is advertising, and advertising is not the same as truth.
City Elder: This city talks fast. Walk slow, and you will hear what it is not saying.
Institute Speaker: We are a research institute. We research. The Rift is research. Do not make it a story.
~ r4_institute_public_face = true
-> r4_04_oreburgh

// R4-04 — Oreburgh City (Dojo 1, mining / rock theme)
=== r4_04_oreburgh ===
// trainer: R4-015 (acolyte), R4-016 (acolyte), R4-017 (dojo leader)
Mine Keeper: The mine is deep, and the deep is honest. Coal does not lie. People near coal sometimes do.
Mine Keeper: The dojo is in the mine's shadow. Shadow is not darkness. Shadow is just less light.
Dojo Leader: A mining dojo is a dojo of work. Show me work, not wishes.
-> r4_04_oreburgh_after

// R4-04 — Oreburgh City (Dojo 1, mining / rock theme)
=== r4_04_oreburgh_after ===
Dojo Leader: Work. Take the first badge of this region.
-> r4_05_floaroma

// R4-05 — Floaroma Town (flower town, valley, first Rift crack, no dojo)
=== r4_05_floaroma ===
// trainer: R4-003 (route), R4-004 (route)
Flower Keeper: The valley is beautiful, and the crack in the ground is beautiful too, in a way that worries me.
Flower Keeper: Do not step in the crack. Look at it, note it, and tell the next town. That is the job here.
Valley Wanderer: Flowers grow over cracks. That is not hiding. That is healing, slow and honest.
~ r4_first_rift_crack = true
-> r4_06_eterna

// R4-06 — Eterna City (Dojo 2, forest city, institute theft)
=== r4_06_eterna ===
// trainer: R4-018 (acolyte), R4-019 (acolyte), R4-020 (dojo leader)
// trainer GAP: Institute statue operative has no Eterna team
Forest Keeper: The forest is old. The statue is older. The institute took something from the statue, and the forest noticed.
Institute Operative: We are borrowing history. Borrowing is not stealing, if you return it. We will return it. Later.
Dojo Leader: A forest dojo is a dojo of patience. Trees do not hurry, and neither do I.
-> r4_06_eterna_after

// R4-06 — Eterna City (Dojo 2, forest city, institute theft)
=== r4_06_eterna_after ===
Dojo Leader: Patient. Take the second badge.
~ r4_statue_theft = true
-> r4_07_hearthome

// R4-07 — Hearthome City (Dojo 3, contest / Garden branch)
=== r4_07_hearthome ===
// trainer: R4-021 (acolyte), R4-022 (acolyte), R4-023 (dojo leader)
Contest Hall Keeper: The contest is not a battle. It is a showing. Show your creature, and show it kindly.
Mochiko: The Garden branch here is the same Garden, new soil. Raise them here, and they will remember both gardens.
Dojo Leader: A contest dojo is a dojo of grace. Grace is not soft. Grace is exact, under lights.
-> r4_07_hearthome_after

// R4-07 — Hearthome City (Dojo 3, contest / Garden branch)
=== r4_07_hearthome_after ===
Dojo Leader: Graceful. Take the third badge.
~ r4_garden_branch = true
-> r4_08_veilstone

// R4-08 — Veilstone City (Dojo 4, institute city, warehouses)
=== r4_08_veilstone ===
// trainer: R4-024 (acolyte), R4-025 (acolyte), R4-026 (dojo leader)
// trainer GAP: Institute warehouse operative has no Veilstone team
Warehouse Keeper: The warehouses are full of things that are not labelled. Unlabelled things are not lost. They are hidden, and hidden is a choice.
Institute Operative: The meteorite is research. Research is not yours to touch. Touch it, and you are research too.
Dojo Leader: A warehouse dojo is a dojo of strength with nowhere to hide. Stand in the open.
-> r4_08_veilstone_after

// R4-08 — Veilstone City (Dojo 4, institute city, warehouses)
=== r4_08_veilstone_after ===
Dojo Leader: Open. Take the fourth badge.
~ r4_meteorite = true
-> r4_09_pastoria

// R4-09 — Pastoria City (Dojo 5, marsh city, preserve)
=== r4_09_pastoria ===
// trainer: R4-027 (acolyte), R4-028 (acolyte), R4-029 (dojo leader)
Marsh Keeper: The marsh is not a swamp. It is a preserve. Preserve means: look, learn, do not take more than the marsh offers.
Preserve Guide: Wave-Ride works here, same as before. Water is a road, if you respect it. The marsh respects you back, if you do.
Dojo Leader: A marsh dojo is a dojo of patience in wet boots. Wade, and do not complain about wet.
-> r4_09_pastoria_after

// R4-09 — Pastoria City (Dojo 5, marsh city, preserve)
=== r4_09_pastoria_after ===
Dojo Leader: You waded. Take the fifth badge.
~ r4_preserve = true
-> r4_10_celestic

// R4-10 — Celestic Town (old town, cave painting, lore, no dojo)
=== r4_10_celestic ===
// trainer: R4-005 (route), R4-006 (route)
Cave Painting Keeper: The painting is old. It shows the Mainframe before any region. Before Mochiichao, even.
Cave Painting Keeper: The Rift is a scar in that Mainframe. A scar is not a wound, if it has healed. This one has not healed.
Celestic Elder: Regions 1–3 were chapters. This town is the footnote that reframes the whole book. Read it slow.
~ r4_lore = true
-> r4_11_canalave

// R4-11 — Canalave City (Dojo 6, port, library, island)
=== r4_11_canalave ===
// trainer: R4-030 (acolyte), R4-031 (acolyte), R4-032 (dojo leader)
Library Keeper: The library has every book except the one you need. That book is on the island, and the island does not lend books.
Port Keeper: The island is across the water. The creature there is not wild. It is a nightmare, and nightmares do not follow Codex rules.
Dojo Leader: A port dojo is a dojo of steel and salt. Rust is honest. Be honest, and be steel.
-> r4_11_canalave_after

// R4-11 — Canalave City (Dojo 6, port, library, island)
=== r4_11_canalave_after ===
Dojo Leader: Steel. Take the sixth badge.
~ r4_island = true
-> r4_12_snowpoint

// R4-12 — Snowpoint City (Dojo 7, snow city, temple)
=== r4_12_snowpoint ===
// trainer: R4-033 (acolyte), R4-034 (acolyte), R4-035 (dojo leader)
Temple Keeper: The temple is cold because the truth is cold. Warm up inside, then go back out and face it.
Temple Keeper: The ice dojo is not about ice. It is about standing still when everything says run.
Dojo Leader: Snow does not hurry. Snow waits, and then it is everywhere. Be snow.
-> r4_12_snowpoint_after

// R4-12 — Snowpoint City (Dojo 7, snow city, temple)
=== r4_12_snowpoint_after ===
Dojo Leader: You waited. Take the seventh badge.
~ r4_temple = true
-> r4_13_sunyshore

// R4-13 — Sunyshore City (Dojo 8, solar city, lighthouse road)
=== r4_13_sunyshore ===
// trainer: R4-036 (acolyte), R4-037 (acolyte), R4-038 (dojo leader)
Solar Keeper: The city runs on sun. Sun is free, and free is not the same as easy. Keep the panels clean.
Lighthouse Road Keeper: The road to the lighthouse is the last road in the region. Walk it, and the League is next.
Dojo Leader: A solar dojo is a dojo of light with no shadows to hide in. Stand in the light.
-> r4_13_sunyshore_after

// R4-13 — Sunyshore City (Dojo 8, solar city, lighthouse road)
=== r4_13_sunyshore_after ===
Dojo Leader: You stood. Take the eighth badge.
~ r4_victory_gate_open = true
-> r4_14_victory_route

// R4-14 — Victory Route (Gauntlet, mountain, snow, Rift cracks)
=== r4_14_victory_route ===
// trainer: R4-007 (veteran), R4-008 (veteran), R4-009 (veteran), R4-010 (veteran)
Victory Gate Keeper: Eight badges, mountain, snow, and cracks. That is the gate. Walk it. The cracks are not shortcuts. They are warnings.
Veteran Trainer: I walked this route when the Rift was just a crack. Now it is a story. Show me you read it.
Veteran Trainer: You read it. Good. The Plateau is next, and it reads back.
~ r4_victory_gate_badges_8 = true
-> r4_15_plateau

// R4-15 — Mainframe Plateau, fourth ascent (Elite Four + Champion)
=== r4_15_plateau ===
// trainer: R4-039 (elite 1), R4-040 (elite 2), R4-041 (elite 3), R4-042 (elite 4), R4-043 (champion)
Plateau Attendant: Fourth ascent. The Hall has a fourth page for you, if you earn it.
Elite 1: I guard the door. The Rift taught me that doors are not always where you left them.
Elite 2: I guard the stairs. The lakes taught me that still water is deep water.
Elite 3: I guard the hall. The hall remembers every region, and the Rift between them.
Elite 4: I guard the champion's door. Knock twice, and mean it, in snow and in Rift-light.
Champion: You walked the oldest region and did not get lost in it. Now walk past me.
-> r4_15_plateau_after

// R4-15 — Mainframe Plateau, fourth ascent (Elite Four + Champion)
=== r4_15_plateau_after ===
Elite 1: Pass. The stairs are yours.
Elite 2: Deep. The hall is yours.
Elite 3: It remembers you. The champion's door is next.
Elite 4: Knock. Mean it. Go.
Champion: Past. The Hall remembers you four times now. The Battle Zone is waiting.
~ r4_hall_fourth_entry = true
~ r4_battle_zone_open = true
-> r4_16_battle_zone

// R4-16 — Battle Zone + Rift Dungeon (post-game, link to Region 5)
=== r4_16_battle_zone ===
// trainer: R4-011 (battle zone), R4-012 (battle zone), R4-013 (battle zone), R4-014 (rift warden)
Battle Zone Keeper: The Battle Zone is an island with a volcano in it, and a legendary creature in the volcano. That is not a warning. That is an invitation, if you are ready.
Rift Keeper: Down there, the Mainframe shows its bones. Do not touch the bones. Just close the wound.
Rift Keeper: The dungeon does not obey normal map rules. Gravity and exits shift as you walk it. Walk it anyway, and walk it steady.
-> r4_16_battle_zone_after

// R4-16 — Battle Zone + Rift Dungeon (post-game, link to Region 5)
=== r4_16_battle_zone_after ===
Rift Keeper: The Rift is sealed. The signal is clean. Region 5 is on the other side of the signal.
Rift Keeper: A train line, a ship line, and a signal all point the same way. The Liberation Front is already there. That is the link, and it is not a coincidence.
~ r4_rift_sealed = true
~ r5_signal_open = true
-> END
