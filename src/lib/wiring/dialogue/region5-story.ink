// region5-story.ink — Region 5 "New Continent", compiled Ink story.
//
// Source: src/lib/wiring/dialogue/region5-dialogue.json (content-only
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
// src/lib/trainers-region5.ts for the beat's battles (verified ids;
// R5 dojos map positionally by dojo number only — the dialogue's R5
// town labels diverge from the trainer file; see the doc). Gaps are
// labelled GAP, never filled with an invented team.
// Regions 2-5 maps do NOT exist in FULL_WORLD yet — no NPC is wired to
// these knots in this PR; the knots are the scene-level source the map
// wiring will attach to.

VAR r5_arrived = false
VAR r5_portal_train_docked = false
VAR r5_front_rally = false
VAR r5_front_pamphlet = false
VAR r5_garden_branch = false
VAR r5_warehouse = false
VAR r5_frozen_plot_1 = false
VAR r5_bond_lore = false
VAR r5_frozen_plot_2 = false
VAR r5_frozen_plot_3 = false
VAR r5_victory_gate_open = false
VAR r5_victory_gate_badges_8 = false
VAR r5_hall_fifth_entry = false
VAR r5_grand_tournament_open = false
VAR r5_grand_tournament_won_opens_mythar_gate = false
VAR r5_grand_tournament_won = false
VAR r5_mythar_beat = false
VAR r5_true_ending = false
VAR r5_free_play = false

-> r5_01_start_city

// R5-01 — Start City (portal-train arrival, no dojo)
=== r5_01_start_city ===
// trainer: R5-001 (route), R5-002 (route)
Portal-train Conductor: Start City. Last continent, first stop. The portal train does not go back on its own. You have to choose to go back, and you have not finished here yet.
Start City Elder: This is the last continent. Not the last story. The Liberation Front is here, in full, and they are not hiding anymore.
~ r5_arrived = true
~ r5_portal_train_docked = true
-> r5_02_sandgem

// R5-02 — Sandgem-shape town (researcher's town, first route, no dojo (shape label, not a new place name))
=== r5_02_sandgem ===
// trainer GAP: no Sandgem-shape town team
Town Researcher: The last continent has its own first route. Walk it like it is your first route ever, and you will see what the other routes hid.
Route Keeper: First wilds, last continent. The grass here is new, but the lesson is old: catch, raise, and do not rush.
-> r5_03_jubilife

// R5-03 — Jubilife-shape city (media city, Front rally, no dojo (shape label, not a new place name))
=== r5_03_jubilife ===
// trainer: R5-003 (front recruit), R5-004 (front recruit)
Media Clerk: The Front is on every screen here. That is not news. That is a rally, and a rally is not the same as a conversation.
Liberation Front Speaker: We do not want to own the Mochiichao. We want to free them. From you. From everyone. Even from the Mainframe itself.
-> r5_03_jubilife_after

// R5-03 — Jubilife-shape city (media city, Front rally, no dojo (shape label, not a new place name))
=== r5_03_jubilife_after ===
City Elder: Listen to them, then listen to your team. Your team has been with you longer than any speech. That matters, and it is not a slogan.
~ r5_front_rally = true
-> r5_04_oreburgh

// R5-04 — Oreburgh City (Dojo 1, mining / rock theme)
=== r5_04_oreburgh ===
// trainer: R5-010 (acolyte), R5-011 (acolyte), R5-012 (Hex dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Mine Keeper: The last continent's mine is the same work, new rock. Work is work, wherever you dig it.
Dojo Leader: A mining dojo is a dojo of work. Show me work, not wishes, on the last continent too.
-> r5_04_oreburgh_after

// R5-04 — Oreburgh City (Dojo 1, mining / rock theme)
=== r5_04_oreburgh_after ===
Dojo Leader: Work. Take the first badge of this region.
-> r5_05_floaroma

// R5-05 — Floaroma Town (flower town, valley, no dojo)
=== r5_05_floaroma ===
// trainer GAP: no Floaroma team
Flower Keeper: The valley here is not the valley in Region 4. Same flowers, different soil. Soil matters.
Flower Keeper: The Front walked through here too. They left pamphlets, not footprints. Pamphlets fade. Footprints do not.
~ r5_front_pamphlet = true
-> r5_06_eterna

// R5-06 — Eterna City (Dojo 2, forest city)
=== r5_06_eterna ===
// trainer: R5-013 (acolyte), R5-014 (acolyte), R5-015 (dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Forest Keeper: The forest here is younger than Region 4's forest, and younger is not weaker. Young trees bend, and bending is a skill.
Dojo Leader: A forest dojo is a dojo of patience. Trees do not hurry, and neither do I, on any continent.
-> r5_06_eterna_after

// R5-06 — Eterna City (Dojo 2, forest city)
=== r5_06_eterna_after ===
Dojo Leader: Patient. Take the second badge.
-> r5_07_hearthome

// R5-07 — Hearthome City (Dojo 3, contest / Garden branch)
=== r5_07_hearthome ===
// trainer: R5-016 (acolyte), R5-017 (acolyte), R5-018 (dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Contest Hall Keeper: The contest here is the same showing, new lights. Show your creature, and show it kindly.
Mochiko: The Garden branch here is the same Garden, newest soil. Raise them here, and they will remember every garden before this one.
Dojo Leader: A contest dojo is a dojo of grace. Grace is not soft. Grace is exact, under lights, on the last continent too.
-> r5_07_hearthome_after

// R5-07 — Hearthome City (Dojo 3, contest / Garden branch)
=== r5_07_hearthome_after ===
Dojo Leader: Graceful. Take the third badge.
~ r5_garden_branch = true
-> r5_08_veilstone

// R5-08 — Veilstone City (Dojo 4, Front warehouse city)
=== r5_08_veilstone ===
// trainer: R5-019 (acolyte), R5-020 (acolyte), R5-021 (dojo leader)
// trainer GAP: Liberation Front warehouse operative has no team
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Warehouse Keeper: The warehouses here are full of Front supplies. Supplies are not arguments. Arguments are what you say after you open the warehouse.
Liberation Front Operative: We are freeing creatures, not stealing them. If you cannot tell the difference, you are part of the problem we are solving.
Dojo Leader: A warehouse dojo is a dojo of strength with nowhere to hide. Stand in the open, even when the Front is watching.
-> r5_08_veilstone_after

// R5-08 — Veilstone City (Dojo 4, Front warehouse city)
=== r5_08_veilstone_after ===
Dojo Leader: Open. Take the fourth badge.
~ r5_warehouse = true
-> r5_09_pastoria

// R5-09 — Pastoria City (Dojo 5, marsh city, preserve, frozen plot start)
=== r5_09_pastoria ===
// trainer: R5-022 (acolyte), R5-023 (acolyte), R5-024 (dojo leader)
// trainer GAP: frozen-plot Front operative has no team
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Marsh Keeper: The marsh here is a preserve, same rule: look, learn, do not take more than the marsh offers.
Preserve Guide: Something frozen is in the marsh's cold corner, and the Front is interested in it. Cold is not the same as dead. Remember that.
Liberation Front Operative: The frozen one does not want a trainer. It wants to be free, and free means cold, and cold means alone. We are helping it be alone.
Dojo Leader: A marsh dojo is a dojo of patience in wet boots. Wade, and do not complain about wet, even when the water is cold.
-> r5_09_pastoria_after

// R5-09 — Pastoria City (Dojo 5, marsh city, preserve, frozen plot start)
=== r5_09_pastoria_after ===
Dojo Leader: You waded. Take the fifth badge.
~ r5_frozen_plot_1 = true
-> r5_10_celestic

// R5-10 — Celestic Town (old town, lore, no dojo)
=== r5_10_celestic ===
// trainer GAP: no Celestic team
Lore Keeper: This town is old on the last continent, which means it is older than the continent's story admits. Old towns do not lie. New stories do.
Celestic Elder: The bond is the story here. Not the battle, not the badge. The bond. Ask your team what it wants, and listen to the answer.
~ r5_bond_lore = true
-> r5_11_canalave

// R5-11 — Canalave City (Dojo 6, port, library, frozen plot escalates)
=== r5_11_canalave ===
// trainer: R5-025 (acolyte), R5-026 (acolyte), R5-027 (dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Library Keeper: The library here has a book about the frozen one. It does not say what the Front says it says. Read it yourself. That is the whole job.
Liberation Front Speaker: The book is old. Old books are not truth. They are just old. We are new, and new is better, because new has not failed yet.
Dojo Leader: A port dojo is a dojo of steel and salt. Rust is honest. Be honest, and be steel, even when the story gets cold.
-> r5_11_canalave_after

// R5-11 — Canalave City (Dojo 6, port, library, frozen plot escalates)
=== r5_11_canalave_after ===
Dojo Leader: Steel. Take the sixth badge.
~ r5_frozen_plot_2 = true
-> r5_12_snowpoint

// R5-12 — Snowpoint City (Dojo 7, snow city, temple, frozen plot)
=== r5_12_snowpoint ===
// trainer: R5-028 (acolyte), R5-029 (acolyte), R5-030 (dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Temple Keeper: The temple is cold, and the frozen one is colder. Cold is not evil. Cold is just cold. The Front is making cold into a story, and stories can freeze people too.
Dojo Leader: Snow does not hurry. Snow waits, and then it is everywhere. Be snow, even in a frozen plot.
-> r5_12_snowpoint_after

// R5-12 — Snowpoint City (Dojo 7, snow city, temple, frozen plot)
=== r5_12_snowpoint_after ===
Dojo Leader: You waited. Take the seventh badge.
~ r5_frozen_plot_3 = true
-> r5_13_sunyshore

// R5-13 — Sunyshore City (Dojo 8, solar city, lighthouse road)
=== r5_13_sunyshore ===
// trainer: R5-031 (acolyte), R5-032 (acolyte), R5-033 (dojo leader)
// trainer NOTE (R5): dojo mapped positionally by dojo number; dialogue town label diverges from the trainer file — Mars to resolve the R5 town list
Solar Keeper: The city runs on sun, even on the last continent. Sun is free, and free is not the same as easy. Keep the panels clean, and keep your team cleaner.
Dojo Leader: A solar dojo is a dojo of light with no shadows to hide in. Stand in the light, after all the cold and all the marsh.
-> r5_13_sunyshore_after

// R5-13 — Sunyshore City (Dojo 8, solar city, lighthouse road)
=== r5_13_sunyshore_after ===
Dojo Leader: You stood. Take the eighth badge.
~ r5_victory_gate_open = true
-> r5_14_victory_route

// R5-14 — Victory Route (Gauntlet, all five regions mixed)
=== r5_14_victory_route ===
// trainer: R5-005 (veteran), R5-006 (veteran), R5-007 (veteran), R5-008 (veteran), R5-009 (veteran)
Victory Gate Keeper: Eight badges, all five regions in one route. That is the gate. Walk it. Trainers from every region you have walked are here, and they remember you.
Veteran Trainer: I walked with you in Region 1, and I walked against you in Region 4. Now I walk here. Show me the whole journey, not just the last town.
Veteran Trainer: Whole. Good. The Plateau is next, and it is the whole journey too.
~ r5_victory_gate_badges_8 = true
-> r5_15_plateau

// R5-15 — Mainframe Plateau, fifth ascent (Elite Four + Champion)
=== r5_15_plateau ===
// trainer: R5-034 (elite 1), R5-035 (elite 2), R5-036 (elite 3), R5-037 (elite 4), R5-038 (champion)
Plateau Attendant: Fifth ascent. The Hall has a fifth page for you, if you earn it. After that, the Hall has a final page, and it is not yours yet.
Elite 1: I guard the door. The bond taught me that a door is not a wall, if you knock right.
Elite 2: I guard the stairs. The frozen plot taught me that cold is not the same as closed.
Elite 3: I guard the hall. The hall remembers every region, every bond, every battle.
Elite 4: I guard the champion's door. Knock twice, and mean it, for all five regions at once.
Champion: You beat the continent. Now beat the trainer the continent remembers most.
-> r5_15_plateau_after

// R5-15 — Mainframe Plateau, fifth ascent (Elite Four + Champion)
=== r5_15_plateau_after ===
Elite 1: Pass. The stairs are yours.
Elite 2: Open. The hall is yours.
Elite 3: It remembers you. The champion's door is next.
Elite 4: Knock. Mean it. Go.
Champion: You beat the continent. Now beat the game. The Grand Tournament is waiting, and Mythar is waiting after it.
~ r5_hall_fifth_entry = true
~ r5_grand_tournament_open = true
-> r5_16_grand_tournament

// R5-16 — Grand Tournament (post-game bracket, all regions)
=== r5_16_grand_tournament ===
// trainer: R5-039 (tournament r1), R5-040 (tournament r2), R5-041 (tournament r3), R5-042 (tournament qf), R5-043 (tournament sf), R5-044 (tournament final)
// trainer GAP: Hex tournament rematch has no dedicated team (R5-012 is the Dojo 1 Hex, not a tournament team)
Tournament Announcer: Welcome to the Grand Tournament. Every champion, every region, one bracket. Win it, and you face Mythar.
Tournament Keeper: Leaders and champions from all five regions. Bracketed, seasonal. No easy round. That is the point of a grand tournament.
Hex: I am here too. Not as your rival this time. As a champion, in a bracket. Beat me here, and the bracket means more.
-> r5_16_grand_tournament_after

// R5-16 — Grand Tournament (post-game bracket, all regions)
=== r5_16_grand_tournament_after ===
Hex: You beat me here too. Good. Mythar is next. Do not let the bracket fool you — Mythar is not a bracket. Mythar is a final.
~ r5_grand_tournament_won_opens_mythar_gate = true
-> r5_17_mythar_final

// R5-17 — Mythar — true final (true final, Mainframe Plateau final ascent)
=== r5_17_mythar_final ===
// trainer: R5-047 (Grand Champion Mythar)
Plateau Attendant: Final ascent. This is not a region champion. This is the champion of the whole Mainframe. Walk it like it is the last walk, because it is.
Mythar: I am not a region champion. I am the champion of the whole Mainframe. Show me why you belong in the Hall with me.
-> r5_17_mythar_final_after

// R5-17 — Mythar — true final (true final, Mainframe Plateau final ascent)
=== r5_17_mythar_final_after ===
Mythar: You belong. The Hall is yours, all five times over. Now go play. The world is open.
Prof. Aeon: Five regions, five Halls, one trainer. The Mainframe remembers you now, the way it remembers Mythar. That is the true ending, and it is not an ending. It is an opening.
~ r5_grand_tournament_won = true
~ r5_mythar_beat = true
~ r5_true_ending = true
~ r5_free_play = true
-> END
