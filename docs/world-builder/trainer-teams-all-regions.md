# Trainer Teams — All 5 Mochiichao Regions

World Builder lane, 2026-10-25. Data ready for main to wire.
No file in `~/workspace/mochiichao-work/fresh-start` was edited.

## Rules applied to every table below

- Species IDs ONLY from the Mochiichao roster: 001–046,
  147 Dorowani, 148 Gabu, 331 Mythar (final only).
  No other ID appears. A script check after writing
  validates this (see Counts, at the end).
- Battle-ready TODAY in `species.ts`: 001, 002, 003, 004,
  005, 006, 007, 008, 009, 010, 038, 039 — 12/49 IDs.
  All other roster IDs are in `global_roster.json`
  (names / elements / base stats, with its known
  parse error at line 14 left untouched) and must be
  promoted to `SPECIES_DB` by main before those teams
  run in-engine. Teams below are data-complete; engine
  promotion is a separate, counted step, not claimed
  as done here.
- 147 / 148 have no stats in either file. They appear
  only from Region 2 onward, as the Gen 2 starters
  (display-only in the Region 1 lab), with level only.
  Main must assign their stats before wiring them.
- Levels rise in play order within each region. No
  trainer requires the player to own a creature from
  a later town — check is by level, not by species:
  a trainer's level is always beatable by a normally
  trained team caught up to that map.
- Dojo teams match the dojo's True Element theme,
  except where marked: Hex (rival, mixed team, canon
  rival rule) and the two KEEP teams below.
- AI profiles are from the wiring master §8:
  Novice, Balanced, Type-aware, Defensive, Aggressive,
  Elite. One profile per trainer. Trigger is
  talk-to-battle throughout (the current engine's
  mode); sight-line is NOT assumed.
- Reward is in CR, following the existing game's
  scale (route ~80–400, dojo acolyte ~300–900,
  dojo leader ~1500–4000, Elite ~5000–8000,
  Champion ~10000, Mythar 20000). Prices / shop
  stock are not in this file.
- KEEP = trainer already in `FullWorldMaps.ts`,
  listed here so main does NOT duplicate it.
  REPLACE = existing placeholder team replaced,
  per the Region 1 wiring Break 2 (Falk's Sproutle).
- Route trainer personal names are original
  placeholders, not canon — main may rename them
  without changing the team. Dojo leader, Elite,
  and Champion names that are not canon are
  [NAME GAP], not invented canon.
- Element mapping used for theme matching:
  roster Aqua = Water, Flora = plant / Earth,
  Beast = Strike-adjacent (used only for the
  Beast dojo and Hex), Silk = Bug, Wind = Aero.
  This mapping is recorded here, not hidden in
  the teams; main's 12-True-Element remap may
  reassign a species' theme without changing
  its ID or level.

## REGION 1 — Mainframe

Dojos: 1 Core (Lin), 2 Aero (Falk), 3 Chrome (Neon),
4 Strike (Market), 5 Umbral (Central HQ),
6 Water (Harbor), 7 Flame (Ember),
8 Mythic (Silicon return, Syndicate boss).

### R1 — Routes, caves, towns, antagonist

| ID | Trainer | Location | AI | Team | Reward |
| R1-001 | Youngster — Jay (KEEP) | Route 1.0 | Novice | 038 Lv5 | 120 |
| R1-002 | Lass — Amy (KEEP) | Route 1.0 | Novice | 001 Lv4 | 100 |
| R1-003 | Hiker — Dan (KEEP) | Route 1.0 | Novice | 007 Lv6 | 180 |
| R1-004 | Bug Catcher — Rick (KEEP) | Route 1.0 | Novice | 016 Lv3 | 80 |
| R1-005 | Bug Catcher — Mira | Binary Woods | Novice | 016 Lv10, 017 Lv11 | 220 |
| R1-006 | Woods Walker — Tess | Binary Woods | Balanced | 038 Lv11, 041 Lv11 | 280 |
| R1-007 | Hacker Grunt (KEEP) | Binary Woods | Balanced | 010 Lv12 | 350 |
| R1-008 | Dockhand — Juno | Stoneport City | Balanced | 022 Lv16, 001 Lv16 | 360 |
| R1-009 | Hacker Grunt — Vex | Stoneport Docks | Balanced | 032 Lv17, 010 Lv17 | 400 |
| R1-010 | Miner — Cleff | Cave of Echoes | Balanced | 035 Lv15, 007 Lv16 | 340 |
| R1-011 | Cave Runner — Pike | Cave of Echoes | Balanced | 013 Lv16, 036 Lv17 | 380 |
| R1-012 | Tunnel Guard — Mara | Signal Tunnel | Balanced | 032 Lv20, 035 Lv21 | 440 |
| R1-013 | Tunnel Runner — Sol | Signal Tunnel | Balanced | 019 Lv20, 013 Lv21 | 440 |
| R1-014 | Tower Keeper — Ivo | Pale Town Tower | Type-aware | 042 Lv24, 043 Lv25 | 560 |
| R1-015 | Syndicate Operative — Rook | Pale Town Tower | Type-aware | 027 Lv25, 008 Lv25 | 600 |
| R1-016 | Market Vendor — Bex | Market City | Balanced | 029 Lv27, 013 Lv27 | 580 |
| R1-017 | Arcade Runner — Kit | Market City | Balanced | 010 Lv28, 030 Lv28 | 620 |
| R1-018 | Syndicate Operative — Slate | Market Hideout | Type-aware | 032 Lv29, 027 Lv29 | 700 |
| R1-019 | Syndicate Operative — Onyx | Market Hideout | Type-aware | 005 Lv30, 042 Lv30 | 720 |
| R1-020 | HQ Guard — Ferrin | Central HQ Floor 1 | Type-aware | 033 Lv31, 026 Lv31 | 740 |
| R1-021 | HQ Guard — Vanna | Central HQ Floor 2 | Type-aware | 043 Lv32, 005 Lv32 | 780 |
| R1-022 | HQ Commander — [NAME GAP] | Central HQ Top | Aggressive | 006 Lv34, 043 Lv34, 027 Lv34 | 1200 |
| R1-023 | Preserve Ranger — Wren | Harbor Preserve | Balanced | 024 Lv35, 038 Lv35 | 800 |
| R1-024 | Preserve Ranger — Ash | Harbor Preserve | Balanced | 022 Lv36, 041 Lv36 | 820 |
| R1-025 | Lab Guard — Ember | Ember Island Ruins | Type-aware | 044 Lv39, 010 Lv39 | 900 |
| R1-026 | Ruins Runner — Cade | Ember Island Ruins | Type-aware | 011 Lv40, 045 Lv40 | 940 |
| R1-027 | Veteran — Hana | Victory Route | Aggressive | 009 Lv46, 006 Lv46 | 1100 |
| R1-028 | Veteran — Doru | Victory Route | Aggressive | 003 Lv47, 012 Lv47 | 1150 |
| R1-029 | Veteran — Sable | Victory Route | Aggressive | 015 Lv48, 028 Lv48 | 1200 |
| R1-030 | Veteran — Quinn | Victory Route | Aggressive | 021 Lv49, 046 Lv49 | 1250 |

### R1 — Dojos (2 acolytes + leader each)

| ID | Trainer | Location | AI | Team | Reward |
| R1-031 | Acolyte — Ken (KEEP) | Dojo 1 Core | Type-aware | 007 Lv8 | 300 |
| R1-032 | Acolyte — Ren (KEEP) | Dojo 1 Core | Type-aware | 004 Lv9 | 350 |
| R1-033 | Acolyte — Shin (KEEP) | Dojo 1 Core | Type-aware | 001 Lv10 | 400 |
| R1-034 | Acolyte — Ryu (KEEP) | Dojo 1 Core | Type-aware | 038 Lv11 | 450 |
| R1-035 | Master Lin (KEEP) | Dojo 1 Core, badge Core Fragment, tech Heavy-Lift | Defensive | 039 Lv14 | 1500 |
| R1-036 | Acolyte — Gale | Dojo 2 Aero | Type-aware | 019 Lv17 | 500 |
| R1-037 | Acolyte — Skye | Dojo 2 Aero | Type-aware | 019 Lv18, 020 Lv18 | 600 |
| R1-038 | Master Falk (REPLACE placeholder) | Dojo 2 Aero, badge Wind Fragment, tech Data-Cut NOT here (ferry beat) | Type-aware | 019 Lv18, 020 Lv19, 021 Lv20 | 1500 |
| R1-039 | Acolyte — Volt | Dojo 3 Chrome | Type-aware | 004 Lv21, 032 Lv21 | 650 |
| R1-040 | Acolyte — Alloy | Dojo 3 Chrome | Type-aware | 033 Lv22, 005 Lv22 | 700 |
| R1-041 | Dojo Leader — [NAME GAP: Neon] | Dojo 3 Chrome, badge Neon Fragment | Defensive | 005 Lv23, 033 Lv23, 034 Lv24 | 2000 |
| R1-042 | Acolyte — Jab | Dojo 4 Strike | Type-aware | 029 Lv27, 030 Lv27 | 750 |
| R1-043 | Acolyte — Kick | Dojo 4 Strike | Type-aware | 030 Lv28, 031 Lv28 | 800 |
| R1-044 | Dojo Leader — [NAME GAP: Market] | Dojo 4 Strike, badge Strike Fragment | Aggressive | 029 Lv29, 030 Lv30, 031 Lv30 | 2200 |
| R1-045 | Acolyte — Shade | Dojo 5 Umbral | Type-aware | 042 Lv31, 008 Lv31 | 850 |
| R1-046 | Acolyte — Dusk | Dojo 5 Umbral | Type-aware | 043 Lv32, 027 Lv32 | 900 |
| R1-047 | Dojo Leader — [NAME GAP: Central] | Dojo 5 Umbral, badge Umbral Fragment | Defensive | 043 Lv33, 028 Lv33, 009 Lv34 | 2400 |
| R1-048 | Acolyte — Tide | Dojo 6 Water | Type-aware | 001 Lv35, 022 Lv35 | 950 |
| R1-049 | Acolyte — Surf | Dojo 6 Water | Type-aware | 023 Lv36, 024 Lv36 | 1000 |
| R1-050 | Dojo Leader — [NAME GAP: Harbor] | Dojo 6 Water, badge Water Fragment, tech Wave-Ride | Defensive | 023 Lv37, 025 Lv37, 003 Lv38 | 2600 |
| R1-051 | Acolyte — Cinder | Dojo 7 Flame | Type-aware | 010 Lv39, 011 Lv39 | 1050 |
| R1-052 | Acolyte — Blaze | Dojo 7 Flame | Type-aware | 044 Lv40, 011 Lv40 | 1100 |
| R1-053 | Dojo Leader — [NAME GAP: Ember] | Dojo 7 Flame, badge Flame Fragment | Aggressive | 012 Lv41, 045 Lv41, 046 Lv42 | 2800 |
| R1-054 | Acolyte — Cipher | Dojo 8 Mythic | Type-aware | 044 Lv43, 002 Lv43 | 1150 |
| R1-055 | Acolyte — Rune | Dojo 8 Mythic | Type-aware | 045 Lv44, 003 Lv44 | 1200 |
| R1-056 | Syndicate Boss — [NAME GAP: Silicon return] | Dojo 8 Mythic, badge Final Fragment, opens Victory Route | Aggressive | 046 Lv45, 003 Lv46, 002 Lv46, 028 Lv47 | 4000 |

### R1 — Elite Four, Champion, post-game

| ID | Trainer | Location | AI | Team | Reward |
| R1-057 | Elite Four 1 — [NAME GAP] Water | Mainframe Plateau | Elite | 003 Lv50, 025 Lv50, 028 Lv51 | 5000 |
| R1-058 | Elite Four 2 — [NAME GAP] Chrome | Mainframe Plateau | Elite | 006 Lv51, 034 Lv51, 023 Lv52 | 5500 |
| R1-059 | Elite Four 3 — [NAME GAP] Flame | Mainframe Plateau | Elite | 012 Lv52, 046 Lv52, 045 Lv53 | 6000 |
| R1-060 | Elite Four 4 — [NAME GAP] Umbral | Mainframe Plateau | Elite | 009 Lv53, 043 Lv53, 028 Lv54 | 6500 |
| R1-061 | Champion Hex | Mainframe Plateau | Elite | 006 Lv55, 009 Lv55, 003 Lv56, 012 Lv56, 021 Lv57, 046 Lv57 | 10000 |
| R1-062 | Syndicate Remnant — Isle 1 | Data Isle 1 | Aggressive | 027 Lv55, 005 Lv55 | 1300 |
| R1-063 | Syndicate Remnant — Isle 2 | Data Isle 2 | Aggressive | 033 Lv56, 043 Lv56 | 1350 |
| R1-064 | Syndicate Remnant — Isle 3 | Data Isle 3 | Aggressive | 015 Lv57, 023 Lv57 | 1400 |
| R1-065 | Syndicate Remnant — Isle 4 | Data Isle 4 | Aggressive | 021 Lv58, 046 Lv58 | 1450 |
| R1-066 | Syndicate Remnant — Isle 5 | Data Isle 5 | Aggressive | 034 Lv59, 003 Lv59 | 1500 |
| R1-067 | Syndicate Remnant — Isle 6 | Data Isle 6 | Aggressive | 009 Lv60, 028 Lv60 | 1550 |
| R1-068 | Syndicate Remnant — Isle 7 | Data Isle 7 | Aggressive | 006 Lv61, 012 Lv61, 046 Lv61 | 2000 |
| R1-069 | Dojo 1 Rematch — Master Lin | Silicon Town, post-game | Elite | 035 Lv60, 037 Lv60, 040 Lv61 | 3000 |
| R1-070 | Dojo 2 Rematch — Master Falk | Stoneport, post-game | Elite | 020 Lv61, 021 Lv61, 003 Lv62 | 3200 |
| R1-071 | Dojo 3 Rematch — [NAME GAP: Neon] | Neon City, post-game | Elite | 006 Lv62, 034 Lv62, 023 Lv63 | 3400 |
| R1-072 | Dojo 4 Rematch — [NAME GAP: Market] | Market City, post-game | Elite | 031 Lv63, 015 Lv63, 030 Lv64 | 3600 |
| R1-073 | Dojo 5 Rematch — [NAME GAP: Central] | Central City, post-game | Elite | 043 Lv64, 028 Lv64, 009 Lv65 | 3800 |
| R1-074 | Dojo 6 Rematch — [NAME GAP: Harbor] | Harbor City, post-game | Elite | 025 Lv65, 003 Lv65, 028 Lv66 | 4000 |
| R1-075 | Dojo 7 Rematch — [NAME GAP: Ember] | Ember Island, post-game | Elite | 046 Lv66, 012 Lv66, 045 Lv67 | 4200 |
| R1-076 | Dojo 8 Rematch — [NAME GAP: Silicon return] | Silicon Town, post-game | Elite | 003 Lv67, 046 Lv67, 002 Lv68 | 4500 |

## REGION 2 — Twin / Return

Gate note: the ferry lets only Region 2-registered
creatures through at first, so opening trainers are
low level and use new / Gen 2 creatures (147, 148).
The player's main team rejoins badge by badge, and
levels climb steeply to Dojo 8. This is intentional,
not a level regression.
Dojos: 1 Flora (Violet), 2 Bug (Azalea), 3 Chrome
(Goldenrod), 4 Umbral (Ecruteak), 5 Water (Olivine),
6 Strike (Cianwood), 7 Flame (Mahogany),
8 Mythic (Blackthorn).

### R2 — Routes, tower, hideout

| ID | Trainer | Location | AI | Team | Reward |
| R2-001 | Ferry Walker — Nia | Dawnfield Route | Novice | 147 Lv10 | 200 |
| R2-002 | Ferry Walker — Pim | Dawnfield Route | Novice | 148 Lv10, 016 Lv11 | 220 |
| R2-003 | Route Trainer — Oda | Cherryport Route | Novice | 041 Lv12, 147 Lv12 | 260 |
| R2-004 | Route Trainer — Ren | Cherryport Route | Balanced | 019 Lv13, 148 Lv13 | 280 |
| R2-005 | Forest Walker — Faye | Ilex Forest | Balanced | 017 Lv20, 041 Lv20 | 480 |
| R2-006 | Shrine Keeper — Lorn | Ilex Forest | Balanced | 042 Lv21, 018 Lv21 | 500 |
| R2-007 | Radio Runner — Dex | Goldenrod Radio Tower | Type-aware | 032 Lv28, 026 Lv28 | 700 |
| R2-008 | Radio Runner — Vee | Goldenrod Radio Tower | Type-aware | 033 Lv29, 019 Lv29 | 720 |
| R2-009 | Lake Watcher — Bryn | Mahogany Lake | Type-aware | 028 Lv44, 024 Lv44 | 1100 |
| R2-010 | Syndicate Operative — Kest | Mahogany Hideout | Type-aware | 027 Lv45, 008 Lv45 | 1150 |
| R2-011 | Syndicate Operative — Nyx | Mahogany Hideout | Aggressive | 043 Lv46, 006 Lv46 | 1200 |
| R2-012 | Veteran — Taro | Victory Route R2 | Aggressive | 009 Lv56, 015 Lv56 | 1400 |
| R2-013 | Veteran — Iska | Victory Route R2 | Aggressive | 021 Lv57, 046 Lv57 | 1450 |
| R2-014 | Veteran — Ruel | Victory Route R2 | Aggressive | 003 Lv58, 034 Lv58 | 1500 |
| R2-015 | Veteran — Miri | Victory Route R2 | Aggressive | 012 Lv59, 028 Lv59 | 1550 |

### R2 — Dojos

| ID | Trainer | Location | AI | Team | Reward |
| R2-016 | Acolyte — Leaf | Dojo 1 Flora, Violet | Type-aware | 038 Lv14 | 400 |
| R2-017 | Acolyte — Moss | Dojo 1 Flora, Violet | Type-aware | 041 Lv15, 038 Lv15 | 450 |
| R2-018 | Dojo Leader — [NAME GAP: Violet] | Dojo 1 Flora, badge Flora Fragment | Defensive | 039 Lv16, 040 Lv16, 041 Lv17 | 1800 |
| R2-019 | Acolyte — Web | Dojo 2 Bug, Azalea | Type-aware | 016 Lv18 | 500 |
| R2-020 | Acolyte — Silk | Dojo 2 Bug, Azalea | Type-aware | 017 Lv19, 016 Lv19 | 550 |
| R2-021 | Dojo Leader — [NAME GAP: Azalea] | Dojo 2 Bug, badge Bug Fragment | Type-aware | 017 Lv20, 018 Lv20, 017 Lv21 | 2000 |
| R2-022 | Acolyte — Wire | Dojo 3 Chrome, Goldenrod | Type-aware | 032 Lv25 | 650 |
| R2-023 | Acolyte — Bolt | Dojo 3 Chrome, Goldenrod | Type-aware | 033 Lv26, 004 Lv26 | 700 |
| R2-024 | Dojo Leader — [NAME GAP: Goldenrod] | Dojo 3 Chrome, badge Chrome Fragment | Defensive | 034 Lv27, 005 Lv27, 033 Lv28 | 2300 |
| R2-025 | Acolyte — Ember | Dojo 4 Umbral, Ecruteak | Type-aware | 042 Lv31 | 800 |
| R2-026 | Acolyte — Night | Dojo 4 Umbral, Ecruteak | Type-aware | 043 Lv32, 026 Lv32 | 850 |
| R2-027 | Dojo Leader — [NAME GAP: Ecruteak] | Dojo 4 Umbral, badge Umbral Fragment | Defensive | 043 Lv33, 028 Lv33, 009 Lv34 | 2500 |
| R2-028 | Acolyte — Foam | Dojo 5 Water, Olivine | Type-aware | 022 Lv37 | 950 |
| R2-029 | Acolyte — Wave | Dojo 5 Water, Olivine | Type-aware | 023 Lv38, 001 Lv38 | 1000 |
| R2-030 | Dojo Leader — [NAME GAP: Olivine] | Dojo 5 Water, badge Water Fragment | Defensive | 025 Lv39, 003 Lv39, 023 Lv40 | 2700 |
| R2-031 | Acolyte — Fist | Dojo 6 Strike, Cianwood | Type-aware | 029 Lv41 | 1050 |
| R2-032 | Acolyte — Spar | Dojo 6 Strike, Cianwood | Type-aware | 030 Lv42, 029 Lv42 | 1100 |
| R2-033 | Dojo Leader — [NAME GAP: Cianwood] | Dojo 6 Strike, badge Strike Fragment | Aggressive | 031 Lv43, 015 Lv43, 030 Lv44 | 2900 |
| R2-034 | Acolyte — Kindling | Dojo 7 Flame, Mahogany | Type-aware | 011 Lv46 | 1150 |
| R2-035 | Acolyte — Flare | Dojo 7 Flame, Mahogany | Type-aware | 044 Lv47, 011 Lv47 | 1200 |
| R2-036 | Dojo Leader — [NAME GAP: Mahogany] | Dojo 7 Flame, badge Flame Fragment | Aggressive | 012 Lv48, 045 Lv48, 046 Lv49 | 3100 |
| R2-037 | Acolyte — Myth | Dojo 8 Mythic, Blackthorn | Type-aware | 002 Lv52 | 1250 |
| R2-038 | Acolyte — Legend | Dojo 8 Mythic, Blackthorn | Type-aware | 044 Lv53, 002 Lv53 | 1300 |
| R2-039 | Dojo Leader — [NAME GAP: Blackthorn] | Dojo 8 Mythic, badge Mythic Fragment | Elite | 003 Lv54, 046 Lv54, 002 Lv55 | 4200 |

### R2 — Elite, Champion, post-game

| ID | Trainer | Location | AI | Team | Reward |
| R2-040 | Elite Four 1 — [NAME GAP] Flora | Plateau, 2nd ascent | Elite | 040 Lv58, 041 Lv58, 039 Lv59 | 5500 |
| R2-041 | Elite Four 2 — [NAME GAP] Aero | Plateau, 2nd ascent | Elite | 021 Lv59, 020 Lv59, 003 Lv60 | 6000 |
| R2-042 | Elite Four 3 — [NAME GAP] Strike | Plateau, 2nd ascent | Elite | 031 Lv60, 015 Lv60, 006 Lv61 | 6500 |
| R2-043 | Elite Four 4 — [NAME GAP] Mythic | Plateau, 2nd ascent | Elite | 046 Lv61, 002 Lv61, 043 Lv62 | 7000 |
| R2-044 | Champion — [NAME GAP: Region 2] | Plateau, 2nd ascent | Elite | 003 Lv63, 006 Lv63, 012 Lv64, 009 Lv64, 021 Lv65, 046 Lv65 | 11000 |
| R2-045 | Dojo 1 Rematch — [NAME GAP: Violet] | Violet, post-game | Elite | 040 Lv64, 039 Lv64, 041 Lv65 | 3400 |
| R2-046 | Dojo 2 Rematch — [NAME GAP: Azalea] | Azalea, post-game | Elite | 018 Lv65, 017 Lv65, 042 Lv66 | 3600 |
| R2-047 | Dojo 3 Rematch — [NAME GAP: Goldenrod] | Goldenrod, post-game | Elite | 034 Lv66, 006 Lv66, 023 Lv67 | 3800 |
| R2-048 | Dojo 4 Rematch — [NAME GAP: Ecruteak] | Ecruteak, post-game | Elite | 043 Lv67, 028 Lv67, 009 Lv68 | 4000 |
| R2-049 | Dojo 5 Rematch — [NAME GAP: Olivine] | Olivine, post-game | Elite | 025 Lv68, 003 Lv68, 028 Lv69 | 4200 |
| R2-050 | Dojo 6 Rematch — [NAME GAP: Cianwood] | Cianwood, post-game | Elite | 031 Lv69, 015 Lv69, 030 Lv70 | 4400 |
| R2-051 | Dojo 7 Rematch — [NAME GAP: Mahogany] | Mahogany, post-game | Elite | 046 Lv70, 012 Lv70, 045 Lv71 | 4600 |
| R2-052 | Dojo 8 Rematch — [NAME GAP: Blackthorn] | Blackthorn, post-game | Elite | 003 Lv71, 046 Lv71, 002 Lv72 | 4800 |
| R2-053 | First Champion — [NAME GAP: Frost Peak] | Frost Peak, post-game final | Elite | 006 Lv72, 009 Lv72, 003 Lv73, 012 Lv73, 021 Lv74, 046 Lv74 | 15000 |

## REGION 3 — Sea / Land

Opening: bedroom / lab start, Root Hamlet. Hex lab-exit
battle is scaled to the chapter (see R3-001 note in the
wiring master), not Region 1's Lv5.
Dojos: 1 Core (Rustboro), 2 Strike (Dewford),
3 Chrome (Mauville), 4 Flame (Lavaridge),
5 Beast (Petalburg), 6 Aero (Fortree),
7 Mythic (Mossdeep), 8 Water (Sootopolis).

### R3 — Routes, arena, hideout, awakening

| ID | Trainer | Location | AI | Team | Reward |
| R3-001 | Hex — lab-exit battle | Root Hamlet Lab | Aggressive | 006 Lv62, 009 Lv62, 003 Lv63 | 2000 |
| R3-002 | Route Trainer — Sela | Oldale Road | Balanced | 013 Lv60, 038 Lv60 | 1300 |
| R3-003 | Route Trainer — Corin | Oldale Road | Balanced | 019 Lv61, 022 Lv61 | 1350 |
| R3-004 | Arena Runner — Pax | Mauville Arena | Type-aware | 030 Lv66, 005 Lv66 | 1500 |
| R3-005 | Arena Runner — Lux | Mauville Arena | Type-aware | 033 Lv67, 011 Lv67 | 1550 |
| R3-006 | Land Faction — Terra | Lilycove Hideout | Type-aware | 035 Lv70, 015 Lv70 | 1700 |
| R3-007 | Sea Faction — Marina | Lilycove Hideout | Type-aware | 027 Lv70, 025 Lv70 | 1700 |
| R3-008 | Land Faction Leader — [NAME GAP: Land] | Lilycove Hideout | Aggressive | 036 Lv71, 009 Lv71, 015 Lv72 | 3000 |
| R3-009 | Sea Faction Leader — [NAME GAP: Sea] | Lilycove Hideout | Aggressive | 028 Lv71, 003 Lv71, 025 Lv72 | 3000 |
| R3-010 | Veteran — Joss | Victory Route R3 | Aggressive | 021 Lv74, 046 Lv74 | 1800 |
| R3-011 | Veteran — Kira | Victory Route R3 | Aggressive | 006 Lv75, 003 Lv75 | 1850 |
| R3-012 | Veteran — Voss | Victory Route R3 | Aggressive | 012 Lv76, 028 Lv76 | 1900 |
| R3-013 | Veteran — Elara | Victory Route R3 | Aggressive | 009 Lv77, 046 Lv77 | 1950 |

### R3 — Dojos

| ID | Trainer | Location | AI | Team | Reward |
| R3-014 | Acolyte — Stone | Dojo 1 Core, Rustboro | Type-aware | 007 Lv62 | 1300 |
| R3-015 | Acolyte — Boulder | Dojo 1 Core, Rustboro | Type-aware | 035 Lv63, 013 Lv63 | 1350 |
| R3-016 | Dojo Leader — [NAME GAP: Rustboro] | Dojo 1 Core, badge Core Fragment | Defensive | 036 Lv64, 015 Lv64, 009 Lv65 | 2800 |
| R3-017 | Acolyte — Grapple | Dojo 2 Strike, Dewford | Type-aware | 029 Lv65 | 1400 |
| R3-018 | Acolyte — Tumble | Dojo 2 Strike, Dewford | Type-aware | 030 Lv66, 029 Lv66 | 1450 |
| R3-019 | Dojo Leader — [NAME GAP: Dewford] | Dojo 2 Strike, badge Strike Fragment | Aggressive | 031 Lv67, 015 Lv67, 030 Lv68 | 3000 |
| R3-020 | Acolyte — Circuit | Dojo 3 Chrome, Mauville | Type-aware | 032 Lv68 | 1500 |
| R3-021 | Acolyte — Dynamo | Dojo 3 Chrome, Mauville | Type-aware | 033 Lv69, 005 Lv69 | 1550 |
| R3-022 | Dojo Leader — [NAME GAP: Mauville] | Dojo 3 Chrome, badge Chrome Fragment | Defensive | 034 Lv70, 006 Lv70, 023 Lv71 | 3200 |
| R3-023 | Acolyte — Ash | Dojo 4 Flame, Lavaridge | Type-aware | 011 Lv70 | 1600 |
| R3-024 | Acolyte — Coal | Dojo 4 Flame, Lavaridge | Type-aware | 044 Lv71, 010 Lv71 | 1650 |
| R3-025 | Dojo Leader — [NAME GAP: Lavaridge] | Dojo 4 Flame, badge Flame Fragment | Aggressive | 012 Lv72, 045 Lv72, 046 Lv73 | 3400 |
| R3-026 | Acolyte — Pup | Dojo 5 Beast, Petalburg | Type-aware | 013 Lv72 | 1700 |
| R3-027 | Acolyte — Howl | Dojo 5 Beast, Petalburg | Type-aware | 014 Lv73, 010 Lv73 | 1750 |
| R3-028 | Dojo Leader — [NAME GAP: Petalburg] | Dojo 5 Beast, badge Beast Fragment | Balanced | 015 Lv74, 012 Lv74, 011 Lv75 | 3600 |
| R3-029 | Acolyte — Feather | Dojo 6 Aero, Fortree | Type-aware | 019 Lv74 | 1800 |
| R3-030 | Acolyte — Gale | Dojo 6 Aero, Fortree | Type-aware | 020 Lv75, 019 Lv75 | 1850 |
| R3-031 | Dojo Leader — [NAME GAP: Fortree] | Dojo 6 Aero, badge Aero Fragment | Type-aware | 021 Lv76, 020 Lv76, 003 Lv77 | 3800 |
| R3-032 | Acolyte — Star | Dojo 7 Mythic, Mossdeep | Type-aware | 002 Lv76 | 1900 |
| R3-033 | Acolyte — Comet | Dojo 7 Mythic, Mossdeep | Type-aware | 044 Lv77, 002 Lv77 | 1950 |
| R3-034 | Dojo Leader — [NAME GAP: Mossdeep] | Dojo 7 Mythic, badge Mythic Fragment | Elite | 003 Lv78, 046 Lv78, 002 Lv79 | 4500 |
| R3-035 | Acolyte — Deep | Dojo 8 Water, Sootopolis | Type-aware | 022 Lv78 | 2000 |
| R3-036 | Acolyte — Tide | Dojo 8 Water, Sootopolis | Type-aware | 023 Lv79, 026 Lv79 | 2050 |
| R3-037 | Dojo Leader — [NAME GAP: Sootopolis] | Dojo 8 Water, badge Water Fragment, tech Deep-Dive | Defensive | 025 Lv80, 028 Lv80, 003 Lv81 | 4700 |

### R3 — Elite, Champion, post-game

| ID | Trainer | Location | AI | Team | Reward |
| R3-038 | Elite Four 1 — [NAME GAP] Water | League R3 | Elite | 025 Lv81, 028 Lv81, 003 Lv82 | 6000 |
| R3-039 | Elite Four 2 — [NAME GAP] Core | League R3 | Elite | 009 Lv82, 036 Lv82, 015 Lv83 | 6500 |
| R3-040 | Elite Four 3 — [NAME GAP] Flame | League R3 | Elite | 046 Lv83, 012 Lv83, 045 Lv84 | 7000 |
| R3-041 | Elite Four 4 — [NAME GAP] Umbral | League R3 | Elite | 043 Lv84, 028 Lv84, 009 Lv85 | 7500 |
| R3-042 | Champion — [NAME GAP: Region 3] | League R3 | Elite | 003 Lv86, 006 Lv86, 012 Lv86, 009 Lv87, 021 Lv87, 046 Lv87 | 12000 |
| R3-043 | Frontier Brain — Singles | Frontier Arena 1 | Elite | 006 Lv85, 003 Lv85, 012 Lv86 | 4000 |
| R3-044 | Frontier Brain — Doubles | Frontier Arena 2 | Elite | 021 Lv86, 028 Lv86, 015 Lv87 | 4200 |
| R3-045 | Frontier Brain — Rental | Frontier Arena 3 | Elite | 009 Lv87, 046 Lv87, 002 Lv88 | 4400 |
| R3-046 | Frontier Brain — Streak | Frontier Arena 4 | Elite | 003 Lv88, 006 Lv88, 012 Lv89 | 4600 |

## REGION 4 — Rift

Dojos: 1 Core (Oreburgh), 2 Flora (Eterna),
3 Umbral (Hearthome), 4 Strike (Veilstone),
5 Water (Pastoria), 6 Chrome (Canalave),
7 Water-ice (Snowpoint, Water theme — no Ice
True Element, Water is the recorded stand-in),
8 Chrome (Sunyshore).

### R4 — Routes, lore, Battle Zone, Rift

| ID | Trainer | Location | AI | Team | Reward |
| R4-001 | Route Trainer — Wren | Sandgem Route | Balanced | 041 Lv78, 019 Lv78 | 1900 |
| R4-002 | Route Trainer — Holt | Sandgem Route | Balanced | 013 Lv79, 022 Lv79 | 1950 |
| R4-003 | Flower Walker — Petal | Floaroma Valley | Balanced | 038 Lv80, 041 Lv80 | 2000 |
| R4-004 | Rift Watcher — Crag | Floaroma Valley | Type-aware | 042 Lv81, 035 Lv81 | 2050 |
| R4-005 | Lore Keeper — Ora | Celestic Town | Type-aware | 043 Lv84, 002 Lv84 | 2200 |
| R4-006 | Cave Painter — Rune | Celestic Town | Type-aware | 009 Lv85, 042 Lv85 | 2250 |
| R4-007 | Veteran — Slate | Victory Route R4 | Aggressive | 006 Lv88, 015 Lv88 | 2300 |
| R4-008 | Veteran — Tempest | Victory Route R4 | Aggressive | 021 Lv89, 028 Lv89 | 2350 |
| R4-009 | Veteran — Onyx | Victory Route R4 | Aggressive | 003 Lv90, 046 Lv90 | 2400 |
| R4-010 | Veteran — Fable | Victory Route R4 | Aggressive | 012 Lv91, 009 Lv91 | 2450 |
| R4-011 | Battle Zone — [NAME GAP] | Battle Zone 1 | Elite | 015 Lv98, 006 Lv98, 003 Lv99 | 4500 |
| R4-012 | Battle Zone — [NAME GAP] | Battle Zone 2 | Elite | 028 Lv99, 046 Lv99, 021 Lv100 | 4700 |
| R4-013 | Battle Zone — [NAME GAP] | Battle Zone 3 | Elite | 009 Lv100, 012 Lv100, 002 Lv100 | 4900 |
| R4-014 | Rift Warden — [NAME GAP] | Umbral Rift Dungeon | Elite | 043 Lv100, 028 Lv100, 009 Lv100, 042 Lv100 | 6000 |

### R4 — Dojos

| ID | Trainer | Location | AI | Team | Reward |
| R4-015 | Acolyte — Pick | Dojo 1 Core, Oreburgh | Type-aware | 007 Lv80 | 2000 |
| R4-016 | Acolyte — Shaft | Dojo 1 Core, Oreburgh | Type-aware | 035 Lv81, 013 Lv81 | 2050 |
| R4-017 | Dojo Leader — [NAME GAP: Oreburgh] | Dojo 1 Core, badge Core Fragment | Defensive | 036 Lv82, 015 Lv82, 009 Lv83 | 3500 |
| R4-018 | Acolyte — Bloom | Dojo 2 Flora, Eterna | Type-aware | 038 Lv82 | 2100 |
| R4-019 | Acolyte — Vine | Dojo 2 Flora, Eterna | Type-aware | 041 Lv83, 039 Lv83 | 2150 |
| R4-020 | Dojo Leader — [NAME GAP: Eterna] | Dojo 2 Flora, badge Flora Fragment | Defensive | 040 Lv84, 039 Lv84, 041 Lv85 | 3700 |
| R4-021 | Acolyte — Veil | Dojo 3 Umbral, Hearthome | Type-aware | 042 Lv84 | 2200 |
| R4-022 | Acolyte — Gloom | Dojo 3 Umbral, Hearthome | Type-aware | 043 Lv85, 026 Lv85 | 2250 |
| R4-023 | Dojo Leader — [NAME GAP: Hearthome] | Dojo 3 Umbral, badge Umbral Fragment | Defensive | 043 Lv86, 028 Lv86, 009 Lv87 | 3900 |
| R4-024 | Acolyte — Jab | Dojo 4 Strike, Veilstone | Type-aware | 029 Lv86 | 2300 |
| R4-025 | Acolyte — Cross | Dojo 4 Strike, Veilstone | Type-aware | 030 Lv87, 029 Lv87 | 2350 |
| R4-026 | Dojo Leader — [NAME GAP: Veilstone] | Dojo 4 Strike, badge Strike Fragment | Aggressive | 031 Lv88, 015 Lv88, 030 Lv89 | 4100 |
| R4-027 | Acolyte — Brook | Dojo 5 Water, Pastoria | Type-aware | 022 Lv88 | 2400 |
| R4-028 | Acolyte — Marsh | Dojo 5 Water, Pastoria | Type-aware | 023 Lv89, 024 Lv89 | 2450 |
| R4-029 | Dojo Leader — [NAME GAP: Pastoria] | Dojo 5 Water, badge Water Fragment | Defensive | 025 Lv90, 003 Lv90, 028 Lv91 | 4300 |
| R4-030 | Acolyte — Gear | Dojo 6 Chrome, Canalave | Type-aware | 032 Lv90 | 2500 |
| R4-031 | Acolyte — Plate | Dojo 6 Chrome, Canalave | Type-aware | 033 Lv91, 005 Lv91 | 2550 |
| R4-032 | Dojo Leader — [NAME GAP: Canalave] | Dojo 6 Chrome, badge Chrome Fragment | Defensive | 034 Lv92, 006 Lv92, 023 Lv93 | 4500 |
| R4-033 | Acolyte — Frost | Dojo 7 Water-ice, Snowpoint | Type-aware | 024 Lv92 | 2600 |
| R4-034 | Acolyte — Glace | Dojo 7 Water-ice, Snowpoint | Type-aware | 025 Lv93, 022 Lv93 | 2650 |
| R4-035 | Dojo Leader — [NAME GAP: Snowpoint] | Dojo 7 Water-ice, badge Ice Fragment (Water theme) | Defensive | 025 Lv94, 003 Lv94, 028 Lv95 | 4700 |
| R4-036 | Acolyte — Solar | Dojo 8 Chrome, Sunyshore | Type-aware | 033 Lv94 | 2700 |
| R4-037 | Acolyte — Volt | Dojo 8 Chrome, Sunyshore | Type-aware | 034 Lv95, 006 Lv95 | 2750 |
| R4-038 | Dojo Leader — [NAME GAP: Sunyshore] | Dojo 8 Chrome, badge Solar Fragment | Aggressive | 034 Lv96, 006 Lv96, 023 Lv97 | 4900 |

### R4 — Elite, Champion

| ID | Trainer | Location | AI | Team | Reward |
| R4-039 | Elite Four 1 — [NAME GAP] Chrome | League R4 | Elite | 006 Lv96, 034 Lv96, 023 Lv97 | 7000 |
| R4-040 | Elite Four 2 — [NAME GAP] Water | League R4 | Elite | 025 Lv97, 028 Lv97, 003 Lv98 | 7500 |
| R4-041 | Elite Four 3 — [NAME GAP] Umbral | League R4 | Elite | 043 Lv98, 028 Lv98, 009 Lv99 | 8000 |
| R4-042 | Elite Four 4 — [NAME GAP] Mythic | League R4 | Elite | 046 Lv99, 002 Lv99, 003 Lv99 | 8500 |
| R4-043 | Champion — [NAME GAP: Region 4] | League R4 | Elite | 003 Lv99, 006 Lv99, 012 Lv99, 009 Lv100, 021 Lv100, 046 Lv100 | 13000 |

## REGION 5 — New Continent

Level cap note: levels are capped at 100. Region 5
differentiation is team size (6 for leaders late,
Elite, Champion, Tournament, Mythar), AI Elite,
and Mythic species — not levels above 100.
Dojos: 1 Beast (Floccesy, Hex), 2 Flame (Virbank),
3 Chrome (Castelia), 4 Strike (Nimbasa),
5 Core (Driftveil), 6 Aero (Mistralton),
7 Water-ice (Icirrus), 8 Mythic (Opelucid).

### R5 — Routes, rally, Victory

| ID | Trainer | Location | AI | Team | Reward |
| R5-001 | Route Trainer — Vale | Start City Route | Balanced | 013 Lv88, 038 Lv88 | 2200 |
| R5-002 | Route Trainer — Noa | Start City Route | Balanced | 019 Lv89, 022 Lv89 | 2250 |
| R5-003 | Front Recruit — Lumen | Castelia Rally | Type-aware | 042 Lv92, 010 Lv92 | 2400 |
| R5-004 | Front Recruit — Shade | Castelia Rally | Type-aware | 043 Lv93, 026 Lv93 | 2450 |
| R5-005 | Veteran — Rook | Victory Route R5 | Aggressive | 006 Lv96, 015 Lv96 | 2600 |
| R5-006 | Veteran — Storm | Victory Route R5 | Aggressive | 021 Lv97, 028 Lv97 | 2650 |
| R5-007 | Veteran — Ash | Victory Route R5 | Aggressive | 012 Lv97, 046 Lv97 | 2700 |
| R5-008 | Veteran — Terra | Victory Route R5 | Aggressive | 009 Lv98, 003 Lv98 | 2750 |
| R5-009 | Veteran — Myth | Victory Route R5 | Aggressive | 002 Lv98, 043 Lv98 | 2800 |

### R5 — Dojos

| ID | Trainer | Location | AI | Team | Reward |
| R5-010 | Acolyte — Pup | Dojo 1 Beast, Floccesy | Type-aware | 013 Lv89 | 2300 |
| R5-011 | Acolyte — Cub | Dojo 1 Beast, Floccesy | Type-aware | 014 Lv90, 010 Lv90 | 2350 |
| R5-012 | Hex — Dojo Leader | Dojo 1 Beast, Floccesy, badge Beast Fragment | Elite | 006 Lv91, 009 Lv91, 012 Lv91, 015 Lv92 | 5000 |
| R5-013 | Acolyte — Spark | Dojo 2 Flame, Virbank | Type-aware | 010 Lv91 | 2400 |
| R5-014 | Acolyte — Reel | Dojo 2 Flame, Virbank | Type-aware | 011 Lv92, 044 Lv92 | 2450 |
| R5-015 | Dojo Leader — [NAME GAP: Virbank] | Dojo 2 Flame, badge Flame Fragment | Aggressive | 012 Lv93, 045 Lv93, 046 Lv94 | 5200 |
| R5-016 | Acolyte — Wire | Dojo 3 Chrome, Castelia | Type-aware | 032 Lv93 | 2500 |
| R5-017 | Acolyte — Mesh | Dojo 3 Chrome, Castelia | Type-aware | 033 Lv94, 005 Lv94 | 2550 |
| R5-018 | Dojo Leader — [NAME GAP: Castelia] | Dojo 3 Chrome, badge Chrome Fragment | Defensive | 034 Lv95, 006 Lv95, 023 Lv96 | 5400 |
| R5-019 | Acolyte — Sprint | Dojo 4 Strike, Nimbasa | Type-aware | 029 Lv95 | 2600 |
| R5-020 | Acolyte — Vault | Dojo 4 Strike, Nimbasa | Type-aware | 030 Lv96, 029 Lv96 | 2650 |
| R5-021 | Dojo Leader — [NAME GAP: Nimbasa] | Dojo 4 Strike, badge Strike Fragment | Aggressive | 031 Lv97, 015 Lv97, 030 Lv98 | 5600 |
| R5-022 | Acolyte — Ore | Dojo 5 Core, Driftveil | Type-aware | 007 Lv96 | 2700 |
| R5-023 | Acolyte — Vein | Dojo 5 Core, Driftveil | Type-aware | 035 Lv97, 013 Lv97 | 2750 |
| R5-024 | Dojo Leader — [NAME GAP: Driftveil] | Dojo 5 Core, badge Core Fragment | Defensive | 036 Lv98, 015 Lv98, 009 Lv99 | 5800 |
| R5-025 | Acolyte — Wind | Dojo 6 Aero, Mistralton | Type-aware | 019 Lv97 | 2800 |
| R5-026 | Acolyte — Cloud | Dojo 6 Aero, Mistralton | Type-aware | 020 Lv98, 019 Lv98 | 2850 |
| R5-027 | Dojo Leader — [NAME GAP: Mistralton] | Dojo 6 Aero, badge Aero Fragment | Type-aware | 021 Lv99, 020 Lv99, 003 Lv100 | 6000 |
| R5-028 | Acolyte — Chill | Dojo 7 Water-ice, Icirrus | Type-aware | 024 Lv98 | 2900 |
| R5-029 | Acolyte — Frost | Dojo 7 Water-ice, Icirrus | Type-aware | 025 Lv99, 022 Lv99 | 2950 |
| R5-030 | Dojo Leader — [NAME GAP: Icirrus] | Dojo 7 Water-ice, badge Ice Fragment (Water theme) | Defensive | 025 Lv100, 003 Lv100, 028 Lv100 | 6200 |
| R5-031 | Acolyte — Rune | Dojo 8 Mythic, Opelucid | Type-aware | 002 Lv99 | 3000 |
| R5-032 | Acolyte — Saga | Dojo 8 Mythic, Opelucid | Type-aware | 044 Lv100, 002 Lv100 | 3050 |
| R5-033 | Dojo Leader — [NAME GAP: Opelucid] | Dojo 8 Mythic, badge Mythic Fragment | Elite | 003 Lv100, 046 Lv100, 002 Lv100, 043 Lv100 | 6500 |

### R5 — Elite, Champion, Tournament, Mythar

| ID | Trainer | Location | AI | Team | Reward |
| R5-034 | Elite Four 1 — [NAME GAP] Aero | League R5 | Elite | 021 Lv100, 020 Lv100, 003 Lv100 | 8000 |
| R5-035 | Elite Four 2 — [NAME GAP] Core | League R5 | Elite | 009 Lv100, 036 Lv100, 015 Lv100 | 8500 |
| R5-036 | Elite Four 3 — [NAME GAP] Flame | League R5 | Elite | 046 Lv100, 012 Lv100, 045 Lv100 | 9000 |
| R5-037 | Elite Four 4 — [NAME GAP] Mythic | League R5 | Elite | 003 Lv100, 002 Lv100, 043 Lv100 | 9500 |
| R5-038 | Champion — [NAME GAP: Region 5] | League R5 | Elite | 003 Lv100, 006 Lv100, 012 Lv100, 009 Lv100, 021 Lv100, 046 Lv100 | 14000 |
| R5-039 | Tournament Round 1 — [NAME GAP] | Grand Tournament | Elite | 006 Lv100, 021 Lv100, 003 Lv100 | 5000 |
| R5-040 | Tournament Round 2 — [NAME GAP] | Grand Tournament | Elite | 009 Lv100, 012 Lv100, 028 Lv100 | 5500 |
| R5-041 | Tournament Round 3 — [NAME GAP] | Grand Tournament | Elite | 003 Lv100, 046 Lv100, 015 Lv100 | 6000 |
| R5-042 | Tournament Quarter — [NAME GAP] | Grand Tournament | Elite | 006 Lv100, 003 Lv100, 012 Lv100, 021 Lv100 | 6500 |
| R5-043 | Tournament Semi — [NAME GAP] | Grand Tournament | Elite | 009 Lv100, 046 Lv100, 002 Lv100, 043 Lv100 | 7000 |
| R5-044 | Tournament Final — [NAME GAP] | Grand Tournament | Elite | 003 Lv100, 006 Lv100, 012 Lv100, 009 Lv100, 021 Lv100, 046 Lv100 | 8000 |
| R5-045 | Tower Climber — Bright Tower | Bright Tower, post-game | Elite | 002 Lv100, 044 Lv100, 003 Lv100 | 5000 |
| R5-046 | Tower Climber — Umbral Tower | Umbral Tower, post-game | Elite | 043 Lv100, 028 Lv100, 009 Lv100 | 5000 |
| R5-047 | Grand Champion Mythar | Mainframe Plateau, final ascent | Elite | 331 Lv100, 003 Lv100, 046 Lv100, 043 Lv100, 028 Lv100, 021 Lv100 | 20000 |

## Side trainers already in the game — NOT counted here

- Junk Warlord Krix (Scrap Junkyard), Luigi Castagnoli
  (Castagnoli Island / Luigi's Mansion), and the
  Mauveville Arena Mythar placeholder are already in
  `FullWorldMaps.ts`. They are side content, not
  mainline region trainers, and are not duplicated
  in the tables above. The Mauveville placeholder
  Mythar team is superseded by R5-047 as the true
  final; main should not keep both as "the final".

## Wiring notes for main

- Convert each table row to the existing battle
  format: `{ id, name, hp/maxHp, atk/def/spd, moves,
  type, level }` per team member, deriving stats
  from `SPECIES_DB` / roster at that level — do not
  hand-copy base stats into the map file.
- Moves per team member: use the species' learnset
  at that level from `species.ts` where it exists;
  for roster-only species, main must add the learnset
  when promoting that species to `SPECIES_DB`.
  No move was invented in this file.
- Dojo badge names above are Fragment names
  following the existing game's pattern (Core
  Fragment, Wind Fragment). Where a badge name
  was not canon, it follows the dojo theme — main
  may rename it without changing the team.
- Rematches are separate rows, not overwrites.
  Post-game rows must not replace first-visit rows.
- Region 2's low opening levels and Region 5's
  Lv100 cap are intentional, see the gate / cap
  notes at the head of those regions.

## Counts — script-checked, 2026-10-25

- Total trainers in tables: 265 = Region 1: 76, Region 2: 53, Region 3: 46, Region 4: 43, Region 5: 47.
- Dojo leader battles: 40 first-visit (8 per region x 5) + 16 rematches (Region 1: 8, Region 2: 8) = 56.
- Elite Four: 20 = 4 per region x 5, in order.
- Champion-grade battles: 7 = Region 1 Hex, Region 2 Champion, Region 2 Frost Peak First Champion, Region 3 Champion, Region 4 Champion, Region 5 Champion, Region 5 Grand Champion Mythar.
- Species ID check: 0 bad IDs. Allowed set only: 001-046, 147, 148, 331.
- 331 Mythar used: 1 time only, R5-047, the true final. No other 331 team.
- 147 / 148 used: 4 rows only, all Region 2 opening (R2-001 to R2-004). Stats GAP — main must assign stats before wiring those rows.
- Battle-ready in species.ts today: 12/49 IDs = 24%. Promotion to SPECIES_DB needed for the other 37/49 IDs = 76% before those teams run in-engine. Data completeness here is 265/265 rows = 100%; engine promotion is NOT claimed as done.
- KEEP rows (already in FullWorldMaps.ts, do not duplicate): 10 = R1-001 to R1-004, R1-007, R1-031 to R1-035.
- REPLACE row: 1 = R1-038 Falk, replacing the Sproutle Lv20 placeholder with an Aero team (019/020/021), per Region 1 wiring Break 2.
- NAME GAP rows: all dojo leaders except Lin, Falk, and Hex, all Elite Four members, and all champions except Hex and Mythar. Their teams are complete; their personal names are not canon and are not invented here.
- Level caps: Region 5 is capped at Lv100 by design. Region 4 post-game (Battle Zone / Rift) was raised to Lv98-100 in the check pass so play order never steps down from its Champion.

## JSON appendix — same rows, machine-readable

```json
[{"id":"R1-001","trainer":"Youngster \u2014 Jay (KEEP)","location":"Route 1.0","ai":"Novice","team":[{"speciesId":"038","level":5}],"reward":120},{"id":"R1-002","trainer":"Lass \u2014 Amy (KEEP)","location":"Route 1.0","ai":"Novice","team":[{"speciesId":"001","level":4}],"reward":100},{"id":"R1-003","trainer":"Hiker \u2014 Dan (KEEP)","location":"Route 1.0","ai":"Novice","team":[{"speciesId":"007","level":6}],"reward":180},{"id":"R1-004","trainer":"Bug Catcher \u2014 Rick (KEEP)","location":"Route 1.0","ai":"Novice","team":[{"speciesId":"016","level":3}],"reward":80},{"id":"R1-005","trainer":"Bug Catcher \u2014 Mira","location":"Binary Woods","ai":"Novice","team":[{"speciesId":"016","level":10},{"speciesId":"017","level":11}],"reward":220},{"id":"R1-006","trainer":"Woods Walker \u2014 Tess","location":"Binary Woods","ai":"Balanced","team":[{"speciesId":"038","level":11},{"speciesId":"041","level":11}],"reward":280},{"id":"R1-007","trainer":"Hacker Grunt (KEEP)","location":"Binary Woods","ai":"Balanced","team":[{"speciesId":"010","level":12}],"reward":350},{"id":"R1-008","trainer":"Dockhand \u2014 Juno","location":"Stoneport City","ai":"Balanced","team":[{"speciesId":"022","level":16},{"speciesId":"001","level":16}],"reward":360},{"id":"R1-009","trainer":"Hacker Grunt \u2014 Vex","location":"Stoneport Docks","ai":"Balanced","team":[{"speciesId":"032","level":17},{"speciesId":"010","level":17}],"reward":400},{"id":"R1-010","trainer":"Miner \u2014 Cleff","location":"Cave of Echoes","ai":"Balanced","team":[{"speciesId":"035","level":15},{"speciesId":"007","level":16}],"reward":340},{"id":"R1-011","trainer":"Cave Runner \u2014 Pike","location":"Cave of Echoes","ai":"Balanced","team":[{"speciesId":"013","level":16},{"speciesId":"036","level":17}],"reward":380},{"id":"R1-012","trainer":"Tunnel Guard \u2014 Mara","location":"Signal Tunnel","ai":"Balanced","team":[{"speciesId":"032","level":20},{"speciesId":"035","level":21}],"reward":440},{"id":"R1-013","trainer":"Tunnel Runner \u2014 Sol","location":"Signal Tunnel","ai":"Balanced","team":[{"speciesId":"019","level":20},{"speciesId":"013","level":21}],"reward":440},{"id":"R1-014","trainer":"Tower Keeper \u2014 Ivo","location":"Pale Town Tower","ai":"Type-aware","team":[{"speciesId":"042","level":24},{"speciesId":"043","level":25}],"reward":560},{"id":"R1-015","trainer":"Syndicate Operative \u2014 Rook","location":"Pale Town Tower","ai":"Type-aware","team":[{"speciesId":"027","level":25},{"speciesId":"008","level":25}],"reward":600},{"id":"R1-016","trainer":"Market Vendor \u2014 Bex","location":"Market City","ai":"Balanced","team":[{"speciesId":"029","level":27},{"speciesId":"013","level":27}],"reward":580},{"id":"R1-017","trainer":"Arcade Runner \u2014 Kit","location":"Market City","ai":"Balanced","team":[{"speciesId":"010","level":28},{"speciesId":"030","level":28}],"reward":620},{"id":"R1-018","trainer":"Syndicate Operative \u2014 Slate","location":"Market Hideout","ai":"Type-aware","team":[{"speciesId":"032","level":29},{"speciesId":"027","level":29}],"reward":700},{"id":"R1-019","trainer":"Syndicate Operative \u2014 Onyx","location":"Market Hideout","ai":"Type-aware","team":[{"speciesId":"005","level":30},{"speciesId":"042","level":30}],"reward":720},{"id":"R1-020","trainer":"HQ Guard \u2014 Ferrin","location":"Central HQ Floor 1","ai":"Type-aware","team":[{"speciesId":"033","level":31},{"speciesId":"026","level":31}],"reward":740},{"id":"R1-021","trainer":"HQ Guard \u2014 Vanna","location":"Central HQ Floor 2","ai":"Type-aware","team":[{"speciesId":"043","level":32},{"speciesId":"005","level":32}],"reward":780},{"id":"R1-022","trainer":"HQ Commander \u2014 [NAME GAP]","location":"Central HQ Top","ai":"Aggressive","team":[{"speciesId":"006","level":34},{"speciesId":"043","level":34},{"speciesId":"027","level":34}],"reward":1200},{"id":"R1-023","trainer":"Preserve Ranger \u2014 Wren","location":"Harbor Preserve","ai":"Balanced","team":[{"speciesId":"024","level":35},{"speciesId":"038","level":35}],"reward":800},{"id":"R1-024","trainer":"Preserve Ranger \u2014 Ash","location":"Harbor Preserve","ai":"Balanced","team":[{"speciesId":"022","level":36},{"speciesId":"041","level":36}],"reward":820},{"id":"R1-025","trainer":"Lab Guard \u2014 Ember","location":"Ember Island Ruins","ai":"Type-aware","team":[{"speciesId":"044","level":39},{"speciesId":"010","level":39}],"reward":900},{"id":"R1-026","trainer":"Ruins Runner \u2014 Cade","location":"Ember Island Ruins","ai":"Type-aware","team":[{"speciesId":"011","level":40},{"speciesId":"045","level":40}],"reward":940},{"id":"R1-027","trainer":"Veteran \u2014 Hana","location":"Victory Route","ai":"Aggressive","team":[{"speciesId":"009","level":46},{"speciesId":"006","level":46}],"reward":1100},{"id":"R1-028","trainer":"Veteran \u2014 Doru","location":"Victory Route","ai":"Aggressive","team":[{"speciesId":"003","level":47},{"speciesId":"012","level":47}],"reward":1150},{"id":"R1-029","trainer":"Veteran \u2014 Sable","location":"Victory Route","ai":"Aggressive","team":[{"speciesId":"015","level":48},{"speciesId":"028","level":48}],"reward":1200},{"id":"R1-030","trainer":"Veteran \u2014 Quinn","location":"Victory Route","ai":"Aggressive","team":[{"speciesId":"021","level":49},{"speciesId":"046","level":49}],"reward":1250},{"id":"R1-031","trainer":"Acolyte \u2014 Ken (KEEP)","location":"Dojo 1 Core","ai":"Type-aware","team":[{"speciesId":"007","level":8}],"reward":300},{"id":"R1-032","trainer":"Acolyte \u2014 Ren (KEEP)","location":"Dojo 1 Core","ai":"Type-aware","team":[{"speciesId":"004","level":9}],"reward":350},{"id":"R1-033","trainer":"Acolyte \u2014 Shin (KEEP)","location":"Dojo 1 Core","ai":"Type-aware","team":[{"speciesId":"001","level":10}],"reward":400},{"id":"R1-034","trainer":"Acolyte \u2014 Ryu (KEEP)","location":"Dojo 1 Core","ai":"Type-aware","team":[{"speciesId":"038","level":11}],"reward":450},{"id":"R1-035","trainer":"Master Lin (KEEP)","location":"Dojo 1 Core, badge Core Fragment, tech Heavy-Lift","ai":"Defensive","team":[{"speciesId":"039","level":14}],"reward":1500},{"id":"R1-036","trainer":"Acolyte \u2014 Gale","location":"Dojo 2 Aero","ai":"Type-aware","team":[{"speciesId":"019","level":17}],"reward":500},{"id":"R1-037","trainer":"Acolyte \u2014 Skye","location":"Dojo 2 Aero","ai":"Type-aware","team":[{"speciesId":"019","level":18},{"speciesId":"020","level":18}],"reward":600},{"id":"R1-038","trainer":"Master Falk (REPLACE placeholder)","location":"Dojo 2 Aero, badge Wind Fragment, tech Data-Cut NOT here (ferry beat)","ai":"Type-aware","team":[{"speciesId":"019","level":18},{"speciesId":"020","level":19},{"speciesId":"021","level":20}],"reward":1500},{"id":"R1-039","trainer":"Acolyte \u2014 Volt","location":"Dojo 3 Chrome","ai":"Type-aware","team":[{"speciesId":"004","level":21},{"speciesId":"032","level":21}],"reward":650},{"id":"R1-040","trainer":"Acolyte \u2014 Alloy","location":"Dojo 3 Chrome","ai":"Type-aware","team":[{"speciesId":"033","level":22},{"speciesId":"005","level":22}],"reward":700},{"id":"R1-041","trainer":"Dojo Leader \u2014 [NAME GAP: Neon]","location":"Dojo 3 Chrome, badge Neon Fragment","ai":"Defensive","team":[{"speciesId":"005","level":23},{"speciesId":"033","level":23},{"speciesId":"034","level":24}],"reward":2000},{"id":"R1-042","trainer":"Acolyte \u2014 Jab","location":"Dojo 4 Strike","ai":"Type-aware","team":[{"speciesId":"029","level":27},{"speciesId":"030","level":27}],"reward":750},{"id":"R1-043","trainer":"Acolyte \u2014 Kick","location":"Dojo 4 Strike","ai":"Type-aware","team":[{"speciesId":"030","level":28},{"speciesId":"031","level":28}],"reward":800},{"id":"R1-044","trainer":"Dojo Leader \u2014 [NAME GAP: Market]","location":"Dojo 4 Strike, badge Strike Fragment","ai":"Aggressive","team":[{"speciesId":"029","level":29},{"speciesId":"030","level":30},{"speciesId":"031","level":30}],"reward":2200},{"id":"R1-045","trainer":"Acolyte \u2014 Shade","location":"Dojo 5 Umbral","ai":"Type-aware","team":[{"speciesId":"042","level":31},{"speciesId":"008","level":31}],"reward":850},{"id":"R1-046","trainer":"Acolyte \u2014 Dusk","location":"Dojo 5 Umbral","ai":"Type-aware","team":[{"speciesId":"043","level":32},{"speciesId":"027","level":32}],"reward":900},{"id":"R1-047","trainer":"Dojo Leader \u2014 [NAME GAP: Central]","location":"Dojo 5 Umbral, badge Umbral Fragment","ai":"Defensive","team":[{"speciesId":"043","level":33},{"speciesId":"028","level":33},{"speciesId":"009","level":34}],"reward":2400},{"id":"R1-048","trainer":"Acolyte \u2014 Tide","location":"Dojo 6 Water","ai":"Type-aware","team":[{"speciesId":"001","level":35},{"speciesId":"022","level":35}],"reward":950},{"id":"R1-049","trainer":"Acolyte \u2014 Surf","location":"Dojo 6 Water","ai":"Type-aware","team":[{"speciesId":"023","level":36},{"speciesId":"024","level":36}],"reward":1000},{"id":"R1-050","trainer":"Dojo Leader \u2014 [NAME GAP: Harbor]","location":"Dojo 6 Water, badge Water Fragment, tech Wave-Ride","ai":"Defensive","team":[{"speciesId":"023","level":37},{"speciesId":"025","level":37},{"speciesId":"003","level":38}],"reward":2600},{"id":"R1-051","trainer":"Acolyte \u2014 Cinder","location":"Dojo 7 Flame","ai":"Type-aware","team":[{"speciesId":"010","level":39},{"speciesId":"011","level":39}],"reward":1050},{"id":"R1-052","trainer":"Acolyte \u2014 Blaze","location":"Dojo 7 Flame","ai":"Type-aware","team":[{"speciesId":"044","level":40},{"speciesId":"011","level":40}],"reward":1100},{"id":"R1-053","trainer":"Dojo Leader \u2014 [NAME GAP: Ember]","location":"Dojo 7 Flame, badge Flame Fragment","ai":"Aggressive","team":[{"speciesId":"012","level":41},{"speciesId":"045","level":41},{"speciesId":"046","level":42}],"reward":2800},{"id":"R1-054","trainer":"Acolyte \u2014 Cipher","location":"Dojo 8 Mythic","ai":"Type-aware","team":[{"speciesId":"044","level":43},{"speciesId":"002","level":43}],"reward":1150},{"id":"R1-055","trainer":"Acolyte \u2014 Rune","location":"Dojo 8 Mythic","ai":"Type-aware","team":[{"speciesId":"045","level":44},{"speciesId":"003","level":44}],"reward":1200},{"id":"R1-056","trainer":"Syndicate Boss \u2014 [NAME GAP: Silicon return]","location":"Dojo 8 Mythic, badge Final Fragment, opens Victory Route","ai":"Aggressive","team":[{"speciesId":"046","level":45},{"speciesId":"003","level":46},{"speciesId":"002","level":46},{"speciesId":"028","level":47}],"reward":4000},{"id":"R1-057","trainer":"Elite Four 1 \u2014 [NAME GAP] Water","location":"Mainframe Plateau","ai":"Elite","team":[{"speciesId":"003","level":50},{"speciesId":"025","level":50},{"speciesId":"028","level":51}],"reward":5000},{"id":"R1-058","trainer":"Elite Four 2 \u2014 [NAME GAP] Chrome","location":"Mainframe Plateau","ai":"Elite","team":[{"speciesId":"006","level":51},{"speciesId":"034","level":51},{"speciesId":"023","level":52}],"reward":5500},{"id":"R1-059","trainer":"Elite Four 3 \u2014 [NAME GAP] Flame","location":"Mainframe Plateau","ai":"Elite","team":[{"speciesId":"012","level":52},{"speciesId":"046","level":52},{"speciesId":"045","level":53}],"reward":6000},{"id":"R1-060","trainer":"Elite Four 4 \u2014 [NAME GAP] Umbral","location":"Mainframe Plateau","ai":"Elite","team":[{"speciesId":"009","level":53},{"speciesId":"043","level":53},{"speciesId":"028","level":54}],"reward":6500},{"id":"R1-061","trainer":"Champion Hex","location":"Mainframe Plateau","ai":"Elite","team":[{"speciesId":"006","level":55},{"speciesId":"009","level":55},{"speciesId":"003","level":56},{"speciesId":"012","level":56},{"speciesId":"021","level":57},{"speciesId":"046","level":57}],"reward":10000},{"id":"R1-062","trainer":"Syndicate Remnant \u2014 Isle 1","location":"Data Isle 1","ai":"Aggressive","team":[{"speciesId":"027","level":55},{"speciesId":"005","level":55}],"reward":1300},{"id":"R1-063","trainer":"Syndicate Remnant \u2014 Isle 2","location":"Data Isle 2","ai":"Aggressive","team":[{"speciesId":"033","level":56},{"speciesId":"043","level":56}],"reward":1350},{"id":"R1-064","trainer":"Syndicate Remnant \u2014 Isle 3","location":"Data Isle 3","ai":"Aggressive","team":[{"speciesId":"015","level":57},{"speciesId":"023","level":57}],"reward":1400},{"id":"R1-065","trainer":"Syndicate Remnant \u2014 Isle 4","location":"Data Isle 4","ai":"Aggressive","team":[{"speciesId":"021","level":58},{"speciesId":"046","level":58}],"reward":1450},{"id":"R1-066","trainer":"Syndicate Remnant \u2014 Isle 5","location":"Data Isle 5","ai":"Aggressive","team":[{"speciesId":"034","level":59},{"speciesId":"003","level":59}],"reward":1500},{"id":"R1-067","trainer":"Syndicate Remnant \u2014 Isle 6","location":"Data Isle 6","ai":"Aggressive","team":[{"speciesId":"009","level":60},{"speciesId":"028","level":60}],"reward":1550},{"id":"R1-068","trainer":"Syndicate Remnant \u2014 Isle 7","location":"Data Isle 7","ai":"Aggressive","team":[{"speciesId":"006","level":61},{"speciesId":"012","level":61},{"speciesId":"046","level":61}],"reward":2000},{"id":"R1-069","trainer":"Dojo 1 Rematch \u2014 Master Lin","location":"Silicon Town, post-game","ai":"Elite","team":[{"speciesId":"035","level":60},{"speciesId":"037","level":60},{"speciesId":"040","level":61}],"reward":3000},{"id":"R1-070","trainer":"Dojo 2 Rematch \u2014 Master Falk","location":"Stoneport, post-game","ai":"Elite","team":[{"speciesId":"020","level":61},{"speciesId":"021","level":61},{"speciesId":"003","level":62}],"reward":3200},{"id":"R1-071","trainer":"Dojo 3 Rematch \u2014 [NAME GAP: Neon]","location":"Neon City, post-game","ai":"Elite","team":[{"speciesId":"006","level":62},{"speciesId":"034","level":62},{"speciesId":"023","level":63}],"reward":3400},{"id":"R1-072","trainer":"Dojo 4 Rematch \u2014 [NAME GAP: Market]","location":"Market City, post-game","ai":"Elite","team":[{"speciesId":"031","level":63},{"speciesId":"015","level":63},{"speciesId":"030","level":64}],"reward":3600},{"id":"R1-073","trainer":"Dojo 5 Rematch \u2014 [NAME GAP: Central]","location":"Central City, post-game","ai":"Elite","team":[{"speciesId":"043","level":64},{"speciesId":"028","level":64},{"speciesId":"009","level":65}],"reward":3800},{"id":"R1-074","trainer":"Dojo 6 Rematch \u2014 [NAME GAP: Harbor]","location":"Harbor City, post-game","ai":"Elite","team":[{"speciesId":"025","level":65},{"speciesId":"003","level":65},{"speciesId":"028","level":66}],"reward":4000},{"id":"R1-075","trainer":"Dojo 7 Rematch \u2014 [NAME GAP: Ember]","location":"Ember Island, post-game","ai":"Elite","team":[{"speciesId":"046","level":66},{"speciesId":"012","level":66},{"speciesId":"045","level":67}],"reward":4200},{"id":"R1-076","trainer":"Dojo 8 Rematch \u2014 [NAME GAP: Silicon return]","location":"Silicon Town, post-game","ai":"Elite","team":[{"speciesId":"003","level":67},{"speciesId":"046","level":67},{"speciesId":"002","level":68}],"reward":4500},{"id":"R2-001","trainer":"Ferry Walker \u2014 Nia","location":"Dawnfield Route","ai":"Novice","team":[{"speciesId":"147","level":10}],"reward":200},{"id":"R2-002","trainer":"Ferry Walker \u2014 Pim","location":"Dawnfield Route","ai":"Novice","team":[{"speciesId":"148","level":10},{"speciesId":"016","level":11}],"reward":220},{"id":"R2-003","trainer":"Route Trainer \u2014 Oda","location":"Cherryport Route","ai":"Novice","team":[{"speciesId":"041","level":12},{"speciesId":"147","level":12}],"reward":260},{"id":"R2-004","trainer":"Route Trainer \u2014 Ren","location":"Cherryport Route","ai":"Balanced","team":[{"speciesId":"019","level":13},{"speciesId":"148","level":13}],"reward":280},{"id":"R2-005","trainer":"Forest Walker \u2014 Faye","location":"Ilex Forest","ai":"Balanced","team":[{"speciesId":"017","level":20},{"speciesId":"041","level":20}],"reward":480},{"id":"R2-006","trainer":"Shrine Keeper \u2014 Lorn","location":"Ilex Forest","ai":"Balanced","team":[{"speciesId":"042","level":21},{"speciesId":"018","level":21}],"reward":500},{"id":"R2-007","trainer":"Radio Runner \u2014 Dex","location":"Goldenrod Radio Tower","ai":"Type-aware","team":[{"speciesId":"032","level":28},{"speciesId":"026","level":28}],"reward":700},{"id":"R2-008","trainer":"Radio Runner \u2014 Vee","location":"Goldenrod Radio Tower","ai":"Type-aware","team":[{"speciesId":"033","level":29},{"speciesId":"019","level":29}],"reward":720},{"id":"R2-009","trainer":"Lake Watcher \u2014 Bryn","location":"Mahogany Lake","ai":"Type-aware","team":[{"speciesId":"028","level":44},{"speciesId":"024","level":44}],"reward":1100},{"id":"R2-010","trainer":"Syndicate Operative \u2014 Kest","location":"Mahogany Hideout","ai":"Type-aware","team":[{"speciesId":"027","level":45},{"speciesId":"008","level":45}],"reward":1150},{"id":"R2-011","trainer":"Syndicate Operative \u2014 Nyx","location":"Mahogany Hideout","ai":"Aggressive","team":[{"speciesId":"043","level":46},{"speciesId":"006","level":46}],"reward":1200},{"id":"R2-012","trainer":"Veteran \u2014 Taro","location":"Victory Route R2","ai":"Aggressive","team":[{"speciesId":"009","level":56},{"speciesId":"015","level":56}],"reward":1400},{"id":"R2-013","trainer":"Veteran \u2014 Iska","location":"Victory Route R2","ai":"Aggressive","team":[{"speciesId":"021","level":57},{"speciesId":"046","level":57}],"reward":1450},{"id":"R2-014","trainer":"Veteran \u2014 Ruel","location":"Victory Route R2","ai":"Aggressive","team":[{"speciesId":"003","level":58},{"speciesId":"034","level":58}],"reward":1500},{"id":"R2-015","trainer":"Veteran \u2014 Miri","location":"Victory Route R2","ai":"Aggressive","team":[{"speciesId":"012","level":59},{"speciesId":"028","level":59}],"reward":1550},{"id":"R2-016","trainer":"Acolyte \u2014 Leaf","location":"Dojo 1 Flora, Violet","ai":"Type-aware","team":[{"speciesId":"038","level":14}],"reward":400},{"id":"R2-017","trainer":"Acolyte \u2014 Moss","location":"Dojo 1 Flora, Violet","ai":"Type-aware","team":[{"speciesId":"041","level":15},{"speciesId":"038","level":15}],"reward":450},{"id":"R2-018","trainer":"Dojo Leader \u2014 [NAME GAP: Violet]","location":"Dojo 1 Flora, badge Flora Fragment","ai":"Defensive","team":[{"speciesId":"039","level":16},{"speciesId":"040","level":16},{"speciesId":"041","level":17}],"reward":1800},{"id":"R2-019","trainer":"Acolyte \u2014 Web","location":"Dojo 2 Bug, Azalea","ai":"Type-aware","team":[{"speciesId":"016","level":18}],"reward":500},{"id":"R2-020","trainer":"Acolyte \u2014 Silk","location":"Dojo 2 Bug, Azalea","ai":"Type-aware","team":[{"speciesId":"017","level":19},{"speciesId":"016","level":19}],"reward":550},{"id":"R2-021","trainer":"Dojo Leader \u2014 [NAME GAP: Azalea]","location":"Dojo 2 Bug, badge Bug Fragment","ai":"Type-aware","team":[{"speciesId":"017","level":20},{"speciesId":"018","level":20},{"speciesId":"017","level":21}],"reward":2000},{"id":"R2-022","trainer":"Acolyte \u2014 Wire","location":"Dojo 3 Chrome, Goldenrod","ai":"Type-aware","team":[{"speciesId":"032","level":25}],"reward":650},{"id":"R2-023","trainer":"Acolyte \u2014 Bolt","location":"Dojo 3 Chrome, Goldenrod","ai":"Type-aware","team":[{"speciesId":"033","level":26},{"speciesId":"004","level":26}],"reward":700},{"id":"R2-024","trainer":"Dojo Leader \u2014 [NAME GAP: Goldenrod]","location":"Dojo 3 Chrome, badge Chrome Fragment","ai":"Defensive","team":[{"speciesId":"034","level":27},{"speciesId":"005","level":27},{"speciesId":"033","level":28}],"reward":2300},{"id":"R2-025","trainer":"Acolyte \u2014 Ember","location":"Dojo 4 Umbral, Ecruteak","ai":"Type-aware","team":[{"speciesId":"042","level":31}],"reward":800},{"id":"R2-026","trainer":"Acolyte \u2014 Night","location":"Dojo 4 Umbral, Ecruteak","ai":"Type-aware","team":[{"speciesId":"043","level":32},{"speciesId":"026","level":32}],"reward":850},{"id":"R2-027","trainer":"Dojo Leader \u2014 [NAME GAP: Ecruteak]","location":"Dojo 4 Umbral, badge Umbral Fragment","ai":"Defensive","team":[{"speciesId":"043","level":33},{"speciesId":"028","level":33},{"speciesId":"009","level":34}],"reward":2500},{"id":"R2-028","trainer":"Acolyte \u2014 Foam","location":"Dojo 5 Water, Olivine","ai":"Type-aware","team":[{"speciesId":"022","level":37}],"reward":950},{"id":"R2-029","trainer":"Acolyte \u2014 Wave","location":"Dojo 5 Water, Olivine","ai":"Type-aware","team":[{"speciesId":"023","level":38},{"speciesId":"001","level":38}],"reward":1000},{"id":"R2-030","trainer":"Dojo Leader \u2014 [NAME GAP: Olivine]","location":"Dojo 5 Water, badge Water Fragment","ai":"Defensive","team":[{"speciesId":"025","level":39},{"speciesId":"003","level":39},{"speciesId":"023","level":40}],"reward":2700},{"id":"R2-031","trainer":"Acolyte \u2014 Fist","location":"Dojo 6 Strike, Cianwood","ai":"Type-aware","team":[{"speciesId":"029","level":41}],"reward":1050},{"id":"R2-032","trainer":"Acolyte \u2014 Spar","location":"Dojo 6 Strike, Cianwood","ai":"Type-aware","team":[{"speciesId":"030","level":42},{"speciesId":"029","level":42}],"reward":1100},{"id":"R2-033","trainer":"Dojo Leader \u2014 [NAME GAP: Cianwood]","location":"Dojo 6 Strike, badge Strike Fragment","ai":"Aggressive","team":[{"speciesId":"031","level":43},{"speciesId":"015","level":43},{"speciesId":"030","level":44}],"reward":2900},{"id":"R2-034","trainer":"Acolyte \u2014 Kindling","location":"Dojo 7 Flame, Mahogany","ai":"Type-aware","team":[{"speciesId":"011","level":46}],"reward":1150},{"id":"R2-035","trainer":"Acolyte \u2014 Flare","location":"Dojo 7 Flame, Mahogany","ai":"Type-aware","team":[{"speciesId":"044","level":47},{"speciesId":"011","level":47}],"reward":1200},{"id":"R2-036","trainer":"Dojo Leader \u2014 [NAME GAP: Mahogany]","location":"Dojo 7 Flame, badge Flame Fragment","ai":"Aggressive","team":[{"speciesId":"012","level":48},{"speciesId":"045","level":48},{"speciesId":"046","level":49}],"reward":3100},{"id":"R2-037","trainer":"Acolyte \u2014 Myth","location":"Dojo 8 Mythic, Blackthorn","ai":"Type-aware","team":[{"speciesId":"002","level":52}],"reward":1250},{"id":"R2-038","trainer":"Acolyte \u2014 Legend","location":"Dojo 8 Mythic, Blackthorn","ai":"Type-aware","team":[{"speciesId":"044","level":53},{"speciesId":"002","level":53}],"reward":1300},{"id":"R2-039","trainer":"Dojo Leader \u2014 [NAME GAP: Blackthorn]","location":"Dojo 8 Mythic, badge Mythic Fragment","ai":"Elite","team":[{"speciesId":"003","level":54},{"speciesId":"046","level":54},{"speciesId":"002","level":55}],"reward":4200},{"id":"R2-040","trainer":"Elite Four 1 \u2014 [NAME GAP] Flora","location":"Plateau, 2nd ascent","ai":"Elite","team":[{"speciesId":"040","level":58},{"speciesId":"041","level":58},{"speciesId":"039","level":59}],"reward":5500},{"id":"R2-041","trainer":"Elite Four 2 \u2014 [NAME GAP] Aero","location":"Plateau, 2nd ascent","ai":"Elite","team":[{"speciesId":"021","level":59},{"speciesId":"020","level":59},{"speciesId":"003","level":60}],"reward":6000},{"id":"R2-042","trainer":"Elite Four 3 \u2014 [NAME GAP] Strike","location":"Plateau, 2nd ascent","ai":"Elite","team":[{"speciesId":"031","level":60},{"speciesId":"015","level":60},{"speciesId":"006","level":61}],"reward":6500},{"id":"R2-043","trainer":"Elite Four 4 \u2014 [NAME GAP] Mythic","location":"Plateau, 2nd ascent","ai":"Elite","team":[{"speciesId":"046","level":61},{"speciesId":"002","level":61},{"speciesId":"043","level":62}],"reward":7000},{"id":"R2-044","trainer":"Champion \u2014 [NAME GAP: Region 2]","location":"Plateau, 2nd ascent","ai":"Elite","team":[{"speciesId":"003","level":63},{"speciesId":"006","level":63},{"speciesId":"012","level":64},{"speciesId":"009","level":64},{"speciesId":"021","level":65},{"speciesId":"046","level":65}],"reward":11000},{"id":"R2-045","trainer":"Dojo 1 Rematch \u2014 [NAME GAP: Violet]","location":"Violet, post-game","ai":"Elite","team":[{"speciesId":"040","level":64},{"speciesId":"039","level":64},{"speciesId":"041","level":65}],"reward":3400},{"id":"R2-046","trainer":"Dojo 2 Rematch \u2014 [NAME GAP: Azalea]","location":"Azalea, post-game","ai":"Elite","team":[{"speciesId":"018","level":65},{"speciesId":"017","level":65},{"speciesId":"042","level":66}],"reward":3600},{"id":"R2-047","trainer":"Dojo 3 Rematch \u2014 [NAME GAP: Goldenrod]","location":"Goldenrod, post-game","ai":"Elite","team":[{"speciesId":"034","level":66},{"speciesId":"006","level":66},{"speciesId":"023","level":67}],"reward":3800},{"id":"R2-048","trainer":"Dojo 4 Rematch \u2014 [NAME GAP: Ecruteak]","location":"Ecruteak, post-game","ai":"Elite","team":[{"speciesId":"043","level":67},{"speciesId":"028","level":67},{"speciesId":"009","level":68}],"reward":4000},{"id":"R2-049","trainer":"Dojo 5 Rematch \u2014 [NAME GAP: Olivine]","location":"Olivine, post-game","ai":"Elite","team":[{"speciesId":"025","level":68},{"speciesId":"003","level":68},{"speciesId":"028","level":69}],"reward":4200},{"id":"R2-050","trainer":"Dojo 6 Rematch \u2014 [NAME GAP: Cianwood]","location":"Cianwood, post-game","ai":"Elite","team":[{"speciesId":"031","level":69},{"speciesId":"015","level":69},{"speciesId":"030","level":70}],"reward":4400},{"id":"R2-051","trainer":"Dojo 7 Rematch \u2014 [NAME GAP: Mahogany]","location":"Mahogany, post-game","ai":"Elite","team":[{"speciesId":"046","level":70},{"speciesId":"012","level":70},{"speciesId":"045","level":71}],"reward":4600},{"id":"R2-052","trainer":"Dojo 8 Rematch \u2014 [NAME GAP: Blackthorn]","location":"Blackthorn, post-game","ai":"Elite","team":[{"speciesId":"003","level":71},{"speciesId":"046","level":71},{"speciesId":"002","level":72}],"reward":4800},{"id":"R2-053","trainer":"First Champion \u2014 [NAME GAP: Frost Peak]","location":"Frost Peak, post-game final","ai":"Elite","team":[{"speciesId":"006","level":72},{"speciesId":"009","level":72},{"speciesId":"003","level":73},{"speciesId":"012","level":73},{"speciesId":"021","level":74},{"speciesId":"046","level":74}],"reward":15000},{"id":"R3-001","trainer":"Hex \u2014 lab-exit battle","location":"Root Hamlet Lab","ai":"Aggressive","team":[{"speciesId":"006","level":62},{"speciesId":"009","level":62},{"speciesId":"003","level":63}],"reward":2000},{"id":"R3-002","trainer":"Route Trainer \u2014 Sela","location":"Oldale Road","ai":"Balanced","team":[{"speciesId":"013","level":60},{"speciesId":"038","level":60}],"reward":1300},{"id":"R3-003","trainer":"Route Trainer \u2014 Corin","location":"Oldale Road","ai":"Balanced","team":[{"speciesId":"019","level":61},{"speciesId":"022","level":61}],"reward":1350},{"id":"R3-004","trainer":"Arena Runner \u2014 Pax","location":"Mauville Arena","ai":"Type-aware","team":[{"speciesId":"030","level":66},{"speciesId":"005","level":66}],"reward":1500},{"id":"R3-005","trainer":"Arena Runner \u2014 Lux","location":"Mauville Arena","ai":"Type-aware","team":[{"speciesId":"033","level":67},{"speciesId":"011","level":67}],"reward":1550},{"id":"R3-006","trainer":"Land Faction \u2014 Terra","location":"Lilycove Hideout","ai":"Type-aware","team":[{"speciesId":"035","level":70},{"speciesId":"015","level":70}],"reward":1700},{"id":"R3-007","trainer":"Sea Faction \u2014 Marina","location":"Lilycove Hideout","ai":"Type-aware","team":[{"speciesId":"027","level":70},{"speciesId":"025","level":70}],"reward":1700},{"id":"R3-008","trainer":"Land Faction Leader \u2014 [NAME GAP: Land]","location":"Lilycove Hideout","ai":"Aggressive","team":[{"speciesId":"036","level":71},{"speciesId":"009","level":71},{"speciesId":"015","level":72}],"reward":3000},{"id":"R3-009","trainer":"Sea Faction Leader \u2014 [NAME GAP: Sea]","location":"Lilycove Hideout","ai":"Aggressive","team":[{"speciesId":"028","level":71},{"speciesId":"003","level":71},{"speciesId":"025","level":72}],"reward":3000},{"id":"R3-010","trainer":"Veteran \u2014 Joss","location":"Victory Route R3","ai":"Aggressive","team":[{"speciesId":"021","level":74},{"speciesId":"046","level":74}],"reward":1800},{"id":"R3-011","trainer":"Veteran \u2014 Kira","location":"Victory Route R3","ai":"Aggressive","team":[{"speciesId":"006","level":75},{"speciesId":"003","level":75}],"reward":1850},{"id":"R3-012","trainer":"Veteran \u2014 Voss","location":"Victory Route R3","ai":"Aggressive","team":[{"speciesId":"012","level":76},{"speciesId":"028","level":76}],"reward":1900},{"id":"R3-013","trainer":"Veteran \u2014 Elara","location":"Victory Route R3","ai":"Aggressive","team":[{"speciesId":"009","level":77},{"speciesId":"046","level":77}],"reward":1950},{"id":"R3-014","trainer":"Acolyte \u2014 Stone","location":"Dojo 1 Core, Rustboro","ai":"Type-aware","team":[{"speciesId":"007","level":62}],"reward":1300},{"id":"R3-015","trainer":"Acolyte \u2014 Boulder","location":"Dojo 1 Core, Rustboro","ai":"Type-aware","team":[{"speciesId":"035","level":63},{"speciesId":"013","level":63}],"reward":1350},{"id":"R3-016","trainer":"Dojo Leader \u2014 [NAME GAP: Rustboro]","location":"Dojo 1 Core, badge Core Fragment","ai":"Defensive","team":[{"speciesId":"036","level":64},{"speciesId":"015","level":64},{"speciesId":"009","level":65}],"reward":2800},{"id":"R3-017","trainer":"Acolyte \u2014 Grapple","location":"Dojo 2 Strike, Dewford","ai":"Type-aware","team":[{"speciesId":"029","level":65}],"reward":1400},{"id":"R3-018","trainer":"Acolyte \u2014 Tumble","location":"Dojo 2 Strike, Dewford","ai":"Type-aware","team":[{"speciesId":"030","level":66},{"speciesId":"029","level":66}],"reward":1450},{"id":"R3-019","trainer":"Dojo Leader \u2014 [NAME GAP: Dewford]","location":"Dojo 2 Strike, badge Strike Fragment","ai":"Aggressive","team":[{"speciesId":"031","level":67},{"speciesId":"015","level":67},{"speciesId":"030","level":68}],"reward":3000},{"id":"R3-020","trainer":"Acolyte \u2014 Circuit","location":"Dojo 3 Chrome, Mauville","ai":"Type-aware","team":[{"speciesId":"032","level":68}],"reward":1500},{"id":"R3-021","trainer":"Acolyte \u2014 Dynamo","location":"Dojo 3 Chrome, Mauville","ai":"Type-aware","team":[{"speciesId":"033","level":69},{"speciesId":"005","level":69}],"reward":1550},{"id":"R3-022","trainer":"Dojo Leader \u2014 [NAME GAP: Mauville]","location":"Dojo 3 Chrome, badge Chrome Fragment","ai":"Defensive","team":[{"speciesId":"034","level":70},{"speciesId":"006","level":70},{"speciesId":"023","level":71}],"reward":3200},{"id":"R3-023","trainer":"Acolyte \u2014 Ash","location":"Dojo 4 Flame, Lavaridge","ai":"Type-aware","team":[{"speciesId":"011","level":70}],"reward":1600},{"id":"R3-024","trainer":"Acolyte \u2014 Coal","location":"Dojo 4 Flame, Lavaridge","ai":"Type-aware","team":[{"speciesId":"044","level":71},{"speciesId":"010","level":71}],"reward":1650},{"id":"R3-025","trainer":"Dojo Leader \u2014 [NAME GAP: Lavaridge]","location":"Dojo 4 Flame, badge Flame Fragment","ai":"Aggressive","team":[{"speciesId":"012","level":72},{"speciesId":"045","level":72},{"speciesId":"046","level":73}],"reward":3400},{"id":"R3-026","trainer":"Acolyte \u2014 Pup","location":"Dojo 5 Beast, Petalburg","ai":"Type-aware","team":[{"speciesId":"013","level":72}],"reward":1700},{"id":"R3-027","trainer":"Acolyte \u2014 Howl","location":"Dojo 5 Beast, Petalburg","ai":"Type-aware","team":[{"speciesId":"014","level":73},{"speciesId":"010","level":73}],"reward":1750},{"id":"R3-028","trainer":"Dojo Leader \u2014 [NAME GAP: Petalburg]","location":"Dojo 5 Beast, badge Beast Fragment","ai":"Balanced","team":[{"speciesId":"015","level":74},{"speciesId":"012","level":74},{"speciesId":"011","level":75}],"reward":3600},{"id":"R3-029","trainer":"Acolyte \u2014 Feather","location":"Dojo 6 Aero, Fortree","ai":"Type-aware","team":[{"speciesId":"019","level":74}],"reward":1800},{"id":"R3-030","trainer":"Acolyte \u2014 Gale","location":"Dojo 6 Aero, Fortree","ai":"Type-aware","team":[{"speciesId":"020","level":75},{"speciesId":"019","level":75}],"reward":1850},{"id":"R3-031","trainer":"Dojo Leader \u2014 [NAME GAP: Fortree]","location":"Dojo 6 Aero, badge Aero Fragment","ai":"Type-aware","team":[{"speciesId":"021","level":76},{"speciesId":"020","level":76},{"speciesId":"003","level":77}],"reward":3800},{"id":"R3-032","trainer":"Acolyte \u2014 Star","location":"Dojo 7 Mythic, Mossdeep","ai":"Type-aware","team":[{"speciesId":"002","level":76}],"reward":1900},{"id":"R3-033","trainer":"Acolyte \u2014 Comet","location":"Dojo 7 Mythic, Mossdeep","ai":"Type-aware","team":[{"speciesId":"044","level":77},{"speciesId":"002","level":77}],"reward":1950},{"id":"R3-034","trainer":"Dojo Leader \u2014 [NAME GAP: Mossdeep]","location":"Dojo 7 Mythic, badge Mythic Fragment","ai":"Elite","team":[{"speciesId":"003","level":78},{"speciesId":"046","level":78},{"speciesId":"002","level":79}],"reward":4500},{"id":"R3-035","trainer":"Acolyte \u2014 Deep","location":"Dojo 8 Water, Sootopolis","ai":"Type-aware","team":[{"speciesId":"022","level":78}],"reward":2000},{"id":"R3-036","trainer":"Acolyte \u2014 Tide","location":"Dojo 8 Water, Sootopolis","ai":"Type-aware","team":[{"speciesId":"023","level":79},{"speciesId":"026","level":79}],"reward":2050},{"id":"R3-037","trainer":"Dojo Leader \u2014 [NAME GAP: Sootopolis]","location":"Dojo 8 Water, badge Water Fragment, tech Deep-Dive","ai":"Defensive","team":[{"speciesId":"025","level":80},{"speciesId":"028","level":80},{"speciesId":"003","level":81}],"reward":4700},{"id":"R3-038","trainer":"Elite Four 1 \u2014 [NAME GAP] Water","location":"League R3","ai":"Elite","team":[{"speciesId":"025","level":81},{"speciesId":"028","level":81},{"speciesId":"003","level":82}],"reward":6000},{"id":"R3-039","trainer":"Elite Four 2 \u2014 [NAME GAP] Core","location":"League R3","ai":"Elite","team":[{"speciesId":"009","level":82},{"speciesId":"036","level":82},{"speciesId":"015","level":83}],"reward":6500},{"id":"R3-040","trainer":"Elite Four 3 \u2014 [NAME GAP] Flame","location":"League R3","ai":"Elite","team":[{"speciesId":"046","level":83},{"speciesId":"012","level":83},{"speciesId":"045","level":84}],"reward":7000},{"id":"R3-041","trainer":"Elite Four 4 \u2014 [NAME GAP] Umbral","location":"League R3","ai":"Elite","team":[{"speciesId":"043","level":84},{"speciesId":"028","level":84},{"speciesId":"009","level":85}],"reward":7500},{"id":"R3-042","trainer":"Champion \u2014 [NAME GAP: Region 3]","location":"League R3","ai":"Elite","team":[{"speciesId":"003","level":86},{"speciesId":"006","level":86},{"speciesId":"012","level":86},{"speciesId":"009","level":87},{"speciesId":"021","level":87},{"speciesId":"046","level":87}],"reward":12000},{"id":"R3-043","trainer":"Frontier Brain \u2014 Singles","location":"Frontier Arena 1","ai":"Elite","team":[{"speciesId":"006","level":85},{"speciesId":"003","level":85},{"speciesId":"012","level":86}],"reward":4000},{"id":"R3-044","trainer":"Frontier Brain \u2014 Doubles","location":"Frontier Arena 2","ai":"Elite","team":[{"speciesId":"021","level":86},{"speciesId":"028","level":86},{"speciesId":"015","level":87}],"reward":4200},{"id":"R3-045","trainer":"Frontier Brain \u2014 Rental","location":"Frontier Arena 3","ai":"Elite","team":[{"speciesId":"009","level":87},{"speciesId":"046","level":87},{"speciesId":"002","level":88}],"reward":4400},{"id":"R3-046","trainer":"Frontier Brain \u2014 Streak","location":"Frontier Arena 4","ai":"Elite","team":[{"speciesId":"003","level":88},{"speciesId":"006","level":88},{"speciesId":"012","level":89}],"reward":4600},{"id":"R4-001","trainer":"Route Trainer \u2014 Wren","location":"Sandgem Route","ai":"Balanced","team":[{"speciesId":"041","level":78},{"speciesId":"019","level":78}],"reward":1900},{"id":"R4-002","trainer":"Route Trainer \u2014 Holt","location":"Sandgem Route","ai":"Balanced","team":[{"speciesId":"013","level":79},{"speciesId":"022","level":79}],"reward":1950},{"id":"R4-003","trainer":"Flower Walker \u2014 Petal","location":"Floaroma Valley","ai":"Balanced","team":[{"speciesId":"038","level":80},{"speciesId":"041","level":80}],"reward":2000},{"id":"R4-004","trainer":"Rift Watcher \u2014 Crag","location":"Floaroma Valley","ai":"Type-aware","team":[{"speciesId":"042","level":81},{"speciesId":"035","level":81}],"reward":2050},{"id":"R4-005","trainer":"Lore Keeper \u2014 Ora","location":"Celestic Town","ai":"Type-aware","team":[{"speciesId":"043","level":84},{"speciesId":"002","level":84}],"reward":2200},{"id":"R4-006","trainer":"Cave Painter \u2014 Rune","location":"Celestic Town","ai":"Type-aware","team":[{"speciesId":"009","level":85},{"speciesId":"042","level":85}],"reward":2250},{"id":"R4-007","trainer":"Veteran \u2014 Slate","location":"Victory Route R4","ai":"Aggressive","team":[{"speciesId":"006","level":88},{"speciesId":"015","level":88}],"reward":2300},{"id":"R4-008","trainer":"Veteran \u2014 Tempest","location":"Victory Route R4","ai":"Aggressive","team":[{"speciesId":"021","level":89},{"speciesId":"028","level":89}],"reward":2350},{"id":"R4-009","trainer":"Veteran \u2014 Onyx","location":"Victory Route R4","ai":"Aggressive","team":[{"speciesId":"003","level":90},{"speciesId":"046","level":90}],"reward":2400},{"id":"R4-010","trainer":"Veteran \u2014 Fable","location":"Victory Route R4","ai":"Aggressive","team":[{"speciesId":"012","level":91},{"speciesId":"009","level":91}],"reward":2450},{"id":"R4-011","trainer":"Battle Zone \u2014 [NAME GAP]","location":"Battle Zone 1","ai":"Elite","team":[{"speciesId":"015","level":98},{"speciesId":"006","level":98},{"speciesId":"003","level":99}],"reward":4500},{"id":"R4-012","trainer":"Battle Zone \u2014 [NAME GAP]","location":"Battle Zone 2","ai":"Elite","team":[{"speciesId":"028","level":99},{"speciesId":"046","level":99},{"speciesId":"021","level":100}],"reward":4700},{"id":"R4-013","trainer":"Battle Zone \u2014 [NAME GAP]","location":"Battle Zone 3","ai":"Elite","team":[{"speciesId":"009","level":100},{"speciesId":"012","level":100},{"speciesId":"002","level":100}],"reward":4900},{"id":"R4-014","trainer":"Rift Warden \u2014 [NAME GAP]","location":"Umbral Rift Dungeon","ai":"Elite","team":[{"speciesId":"043","level":100},{"speciesId":"028","level":100},{"speciesId":"009","level":100},{"speciesId":"042","level":100}],"reward":6000},{"id":"R4-015","trainer":"Acolyte \u2014 Pick","location":"Dojo 1 Core, Oreburgh","ai":"Type-aware","team":[{"speciesId":"007","level":80}],"reward":2000},{"id":"R4-016","trainer":"Acolyte \u2014 Shaft","location":"Dojo 1 Core, Oreburgh","ai":"Type-aware","team":[{"speciesId":"035","level":81},{"speciesId":"013","level":81}],"reward":2050},{"id":"R4-017","trainer":"Dojo Leader \u2014 [NAME GAP: Oreburgh]","location":"Dojo 1 Core, badge Core Fragment","ai":"Defensive","team":[{"speciesId":"036","level":82},{"speciesId":"015","level":82},{"speciesId":"009","level":83}],"reward":3500},{"id":"R4-018","trainer":"Acolyte \u2014 Bloom","location":"Dojo 2 Flora, Eterna","ai":"Type-aware","team":[{"speciesId":"038","level":82}],"reward":2100},{"id":"R4-019","trainer":"Acolyte \u2014 Vine","location":"Dojo 2 Flora, Eterna","ai":"Type-aware","team":[{"speciesId":"041","level":83},{"speciesId":"039","level":83}],"reward":2150},{"id":"R4-020","trainer":"Dojo Leader \u2014 [NAME GAP: Eterna]","location":"Dojo 2 Flora, badge Flora Fragment","ai":"Defensive","team":[{"speciesId":"040","level":84},{"speciesId":"039","level":84},{"speciesId":"041","level":85}],"reward":3700},{"id":"R4-021","trainer":"Acolyte \u2014 Veil","location":"Dojo 3 Umbral, Hearthome","ai":"Type-aware","team":[{"speciesId":"042","level":84}],"reward":2200},{"id":"R4-022","trainer":"Acolyte \u2014 Gloom","location":"Dojo 3 Umbral, Hearthome","ai":"Type-aware","team":[{"speciesId":"043","level":85},{"speciesId":"026","level":85}],"reward":2250},{"id":"R4-023","trainer":"Dojo Leader \u2014 [NAME GAP: Hearthome]","location":"Dojo 3 Umbral, badge Umbral Fragment","ai":"Defensive","team":[{"speciesId":"043","level":86},{"speciesId":"028","level":86},{"speciesId":"009","level":87}],"reward":3900},{"id":"R4-024","trainer":"Acolyte \u2014 Jab","location":"Dojo 4 Strike, Veilstone","ai":"Type-aware","team":[{"speciesId":"029","level":86}],"reward":2300},{"id":"R4-025","trainer":"Acolyte \u2014 Cross","location":"Dojo 4 Strike, Veilstone","ai":"Type-aware","team":[{"speciesId":"030","level":87},{"speciesId":"029","level":87}],"reward":2350},{"id":"R4-026","trainer":"Dojo Leader \u2014 [NAME GAP: Veilstone]","location":"Dojo 4 Strike, badge Strike Fragment","ai":"Aggressive","team":[{"speciesId":"031","level":88},{"speciesId":"015","level":88},{"speciesId":"030","level":89}],"reward":4100},{"id":"R4-027","trainer":"Acolyte \u2014 Brook","location":"Dojo 5 Water, Pastoria","ai":"Type-aware","team":[{"speciesId":"022","level":88}],"reward":2400},{"id":"R4-028","trainer":"Acolyte \u2014 Marsh","location":"Dojo 5 Water, Pastoria","ai":"Type-aware","team":[{"speciesId":"023","level":89},{"speciesId":"024","level":89}],"reward":2450},{"id":"R4-029","trainer":"Dojo Leader \u2014 [NAME GAP: Pastoria]","location":"Dojo 5 Water, badge Water Fragment","ai":"Defensive","team":[{"speciesId":"025","level":90},{"speciesId":"003","level":90},{"speciesId":"028","level":91}],"reward":4300},{"id":"R4-030","trainer":"Acolyte \u2014 Gear","location":"Dojo 6 Chrome, Canalave","ai":"Type-aware","team":[{"speciesId":"032","level":90}],"reward":2500},{"id":"R4-031","trainer":"Acolyte \u2014 Plate","location":"Dojo 6 Chrome, Canalave","ai":"Type-aware","team":[{"speciesId":"033","level":91},{"speciesId":"005","level":91}],"reward":2550},{"id":"R4-032","trainer":"Dojo Leader \u2014 [NAME GAP: Canalave]","location":"Dojo 6 Chrome, badge Chrome Fragment","ai":"Defensive","team":[{"speciesId":"034","level":92},{"speciesId":"006","level":92},{"speciesId":"023","level":93}],"reward":4500},{"id":"R4-033","trainer":"Acolyte \u2014 Frost","location":"Dojo 7 Water-ice, Snowpoint","ai":"Type-aware","team":[{"speciesId":"024","level":92}],"reward":2600},{"id":"R4-034","trainer":"Acolyte \u2014 Glace","location":"Dojo 7 Water-ice, Snowpoint","ai":"Type-aware","team":[{"speciesId":"025","level":93},{"speciesId":"022","level":93}],"reward":2650},{"id":"R4-035","trainer":"Dojo Leader \u2014 [NAME GAP: Snowpoint]","location":"Dojo 7 Water-ice, badge Ice Fragment (Water theme)","ai":"Defensive","team":[{"speciesId":"025","level":94},{"speciesId":"003","level":94},{"speciesId":"028","level":95}],"reward":4700},{"id":"R4-036","trainer":"Acolyte \u2014 Solar","location":"Dojo 8 Chrome, Sunyshore","ai":"Type-aware","team":[{"speciesId":"033","level":94}],"reward":2700},{"id":"R4-037","trainer":"Acolyte \u2014 Volt","location":"Dojo 8 Chrome, Sunyshore","ai":"Type-aware","team":[{"speciesId":"034","level":95},{"speciesId":"006","level":95}],"reward":2750},{"id":"R4-038","trainer":"Dojo Leader \u2014 [NAME GAP: Sunyshore]","location":"Dojo 8 Chrome, badge Solar Fragment","ai":"Aggressive","team":[{"speciesId":"034","level":96},{"speciesId":"006","level":96},{"speciesId":"023","level":97}],"reward":4900},{"id":"R4-039","trainer":"Elite Four 1 \u2014 [NAME GAP] Chrome","location":"League R4","ai":"Elite","team":[{"speciesId":"006","level":96},{"speciesId":"034","level":96},{"speciesId":"023","level":97}],"reward":7000},{"id":"R4-040","trainer":"Elite Four 2 \u2014 [NAME GAP] Water","location":"League R4","ai":"Elite","team":[{"speciesId":"025","level":97},{"speciesId":"028","level":97},{"speciesId":"003","level":98}],"reward":7500},{"id":"R4-041","trainer":"Elite Four 3 \u2014 [NAME GAP] Umbral","location":"League R4","ai":"Elite","team":[{"speciesId":"043","level":98},{"speciesId":"028","level":98},{"speciesId":"009","level":99}],"reward":8000},{"id":"R4-042","trainer":"Elite Four 4 \u2014 [NAME GAP] Mythic","location":"League R4","ai":"Elite","team":[{"speciesId":"046","level":99},{"speciesId":"002","level":99},{"speciesId":"003","level":99}],"reward":8500},{"id":"R4-043","trainer":"Champion \u2014 [NAME GAP: Region 4]","location":"League R4","ai":"Elite","team":[{"speciesId":"003","level":99},{"speciesId":"006","level":99},{"speciesId":"012","level":99},{"speciesId":"009","level":100},{"speciesId":"021","level":100},{"speciesId":"046","level":100}],"reward":13000},{"id":"R5-001","trainer":"Route Trainer \u2014 Vale","location":"Start City Route","ai":"Balanced","team":[{"speciesId":"013","level":88},{"speciesId":"038","level":88}],"reward":2200},{"id":"R5-002","trainer":"Route Trainer \u2014 Noa","location":"Start City Route","ai":"Balanced","team":[{"speciesId":"019","level":89},{"speciesId":"022","level":89}],"reward":2250},{"id":"R5-003","trainer":"Front Recruit \u2014 Lumen","location":"Castelia Rally","ai":"Type-aware","team":[{"speciesId":"042","level":92},{"speciesId":"010","level":92}],"reward":2400},{"id":"R5-004","trainer":"Front Recruit \u2014 Shade","location":"Castelia Rally","ai":"Type-aware","team":[{"speciesId":"043","level":93},{"speciesId":"026","level":93}],"reward":2450},{"id":"R5-005","trainer":"Veteran \u2014 Rook","location":"Victory Route R5","ai":"Aggressive","team":[{"speciesId":"006","level":96},{"speciesId":"015","level":96}],"reward":2600},{"id":"R5-006","trainer":"Veteran \u2014 Storm","location":"Victory Route R5","ai":"Aggressive","team":[{"speciesId":"021","level":97},{"speciesId":"028","level":97}],"reward":2650},{"id":"R5-007","trainer":"Veteran \u2014 Ash","location":"Victory Route R5","ai":"Aggressive","team":[{"speciesId":"012","level":97},{"speciesId":"046","level":97}],"reward":2700},{"id":"R5-008","trainer":"Veteran \u2014 Terra","location":"Victory Route R5","ai":"Aggressive","team":[{"speciesId":"009","level":98},{"speciesId":"003","level":98}],"reward":2750},{"id":"R5-009","trainer":"Veteran \u2014 Myth","location":"Victory Route R5","ai":"Aggressive","team":[{"speciesId":"002","level":98},{"speciesId":"043","level":98}],"reward":2800},{"id":"R5-010","trainer":"Acolyte \u2014 Pup","location":"Dojo 1 Beast, Floccesy","ai":"Type-aware","team":[{"speciesId":"013","level":89}],"reward":2300},{"id":"R5-011","trainer":"Acolyte \u2014 Cub","location":"Dojo 1 Beast, Floccesy","ai":"Type-aware","team":[{"speciesId":"014","level":90},{"speciesId":"010","level":90}],"reward":2350},{"id":"R5-012","trainer":"Hex \u2014 Dojo Leader","location":"Dojo 1 Beast, Floccesy, badge Beast Fragment","ai":"Elite","team":[{"speciesId":"006","level":91},{"speciesId":"009","level":91},{"speciesId":"012","level":91},{"speciesId":"015","level":92}],"reward":5000},{"id":"R5-013","trainer":"Acolyte \u2014 Spark","location":"Dojo 2 Flame, Virbank","ai":"Type-aware","team":[{"speciesId":"010","level":91}],"reward":2400},{"id":"R5-014","trainer":"Acolyte \u2014 Reel","location":"Dojo 2 Flame, Virbank","ai":"Type-aware","team":[{"speciesId":"011","level":92},{"speciesId":"044","level":92}],"reward":2450},{"id":"R5-015","trainer":"Dojo Leader \u2014 [NAME GAP: Virbank]","location":"Dojo 2 Flame, badge Flame Fragment","ai":"Aggressive","team":[{"speciesId":"012","level":93},{"speciesId":"045","level":93},{"speciesId":"046","level":94}],"reward":5200},{"id":"R5-016","trainer":"Acolyte \u2014 Wire","location":"Dojo 3 Chrome, Castelia","ai":"Type-aware","team":[{"speciesId":"032","level":93}],"reward":2500},{"id":"R5-017","trainer":"Acolyte \u2014 Mesh","location":"Dojo 3 Chrome, Castelia","ai":"Type-aware","team":[{"speciesId":"033","level":94},{"speciesId":"005","level":94}],"reward":2550},{"id":"R5-018","trainer":"Dojo Leader \u2014 [NAME GAP: Castelia]","location":"Dojo 3 Chrome, badge Chrome Fragment","ai":"Defensive","team":[{"speciesId":"034","level":95},{"speciesId":"006","level":95},{"speciesId":"023","level":96}],"reward":5400},{"id":"R5-019","trainer":"Acolyte \u2014 Sprint","location":"Dojo 4 Strike, Nimbasa","ai":"Type-aware","team":[{"speciesId":"029","level":95}],"reward":2600},{"id":"R5-020","trainer":"Acolyte \u2014 Vault","location":"Dojo 4 Strike, Nimbasa","ai":"Type-aware","team":[{"speciesId":"030","level":96},{"speciesId":"029","level":96}],"reward":2650},{"id":"R5-021","trainer":"Dojo Leader \u2014 [NAME GAP: Nimbasa]","location":"Dojo 4 Strike, badge Strike Fragment","ai":"Aggressive","team":[{"speciesId":"031","level":97},{"speciesId":"015","level":97},{"speciesId":"030","level":98}],"reward":5600},{"id":"R5-022","trainer":"Acolyte \u2014 Ore","location":"Dojo 5 Core, Driftveil","ai":"Type-aware","team":[{"speciesId":"007","level":96}],"reward":2700},{"id":"R5-023","trainer":"Acolyte \u2014 Vein","location":"Dojo 5 Core, Driftveil","ai":"Type-aware","team":[{"speciesId":"035","level":97},{"speciesId":"013","level":97}],"reward":2750},{"id":"R5-024","trainer":"Dojo Leader \u2014 [NAME GAP: Driftveil]","location":"Dojo 5 Core, badge Core Fragment","ai":"Defensive","team":[{"speciesId":"036","level":98},{"speciesId":"015","level":98},{"speciesId":"009","level":99}],"reward":5800},{"id":"R5-025","trainer":"Acolyte \u2014 Wind","location":"Dojo 6 Aero, Mistralton","ai":"Type-aware","team":[{"speciesId":"019","level":97}],"reward":2800},{"id":"R5-026","trainer":"Acolyte \u2014 Cloud","location":"Dojo 6 Aero, Mistralton","ai":"Type-aware","team":[{"speciesId":"020","level":98},{"speciesId":"019","level":98}],"reward":2850},{"id":"R5-027","trainer":"Dojo Leader \u2014 [NAME GAP: Mistralton]","location":"Dojo 6 Aero, badge Aero Fragment","ai":"Type-aware","team":[{"speciesId":"021","level":99},{"speciesId":"020","level":99},{"speciesId":"003","level":100}],"reward":6000},{"id":"R5-028","trainer":"Acolyte \u2014 Chill","location":"Dojo 7 Water-ice, Icirrus","ai":"Type-aware","team":[{"speciesId":"024","level":98}],"reward":2900},{"id":"R5-029","trainer":"Acolyte \u2014 Frost","location":"Dojo 7 Water-ice, Icirrus","ai":"Type-aware","team":[{"speciesId":"025","level":99},{"speciesId":"022","level":99}],"reward":2950},{"id":"R5-030","trainer":"Dojo Leader \u2014 [NAME GAP: Icirrus]","location":"Dojo 7 Water-ice, badge Ice Fragment (Water theme)","ai":"Defensive","team":[{"speciesId":"025","level":100},{"speciesId":"003","level":100},{"speciesId":"028","level":100}],"reward":6200},{"id":"R5-031","trainer":"Acolyte \u2014 Rune","location":"Dojo 8 Mythic, Opelucid","ai":"Type-aware","team":[{"speciesId":"002","level":99}],"reward":3000},{"id":"R5-032","trainer":"Acolyte \u2014 Saga","location":"Dojo 8 Mythic, Opelucid","ai":"Type-aware","team":[{"speciesId":"044","level":100},{"speciesId":"002","level":100}],"reward":3050},{"id":"R5-033","trainer":"Dojo Leader \u2014 [NAME GAP: Opelucid]","location":"Dojo 8 Mythic, badge Mythic Fragment","ai":"Elite","team":[{"speciesId":"003","level":100},{"speciesId":"046","level":100},{"speciesId":"002","level":100},{"speciesId":"043","level":100}],"reward":6500},{"id":"R5-034","trainer":"Elite Four 1 \u2014 [NAME GAP] Aero","location":"League R5","ai":"Elite","team":[{"speciesId":"021","level":100},{"speciesId":"020","level":100},{"speciesId":"003","level":100}],"reward":8000},{"id":"R5-035","trainer":"Elite Four 2 \u2014 [NAME GAP] Core","location":"League R5","ai":"Elite","team":[{"speciesId":"009","level":100},{"speciesId":"036","level":100},{"speciesId":"015","level":100}],"reward":8500},{"id":"R5-036","trainer":"Elite Four 3 \u2014 [NAME GAP] Flame","location":"League R5","ai":"Elite","team":[{"speciesId":"046","level":100},{"speciesId":"012","level":100},{"speciesId":"045","level":100}],"reward":9000},{"id":"R5-037","trainer":"Elite Four 4 \u2014 [NAME GAP] Mythic","location":"League R5","ai":"Elite","team":[{"speciesId":"003","level":100},{"speciesId":"002","level":100},{"speciesId":"043","level":100}],"reward":9500},{"id":"R5-038","trainer":"Champion \u2014 [NAME GAP: Region 5]","location":"League R5","ai":"Elite","team":[{"speciesId":"003","level":100},{"speciesId":"006","level":100},{"speciesId":"012","level":100},{"speciesId":"009","level":100},{"speciesId":"021","level":100},{"speciesId":"046","level":100}],"reward":14000},{"id":"R5-039","trainer":"Tournament Round 1 \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"006","level":100},{"speciesId":"021","level":100},{"speciesId":"003","level":100}],"reward":5000},{"id":"R5-040","trainer":"Tournament Round 2 \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"009","level":100},{"speciesId":"012","level":100},{"speciesId":"028","level":100}],"reward":5500},{"id":"R5-041","trainer":"Tournament Round 3 \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"003","level":100},{"speciesId":"046","level":100},{"speciesId":"015","level":100}],"reward":6000},{"id":"R5-042","trainer":"Tournament Quarter \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"006","level":100},{"speciesId":"003","level":100},{"speciesId":"012","level":100},{"speciesId":"021","level":100}],"reward":6500},{"id":"R5-043","trainer":"Tournament Semi \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"009","level":100},{"speciesId":"046","level":100},{"speciesId":"002","level":100},{"speciesId":"043","level":100}],"reward":7000},{"id":"R5-044","trainer":"Tournament Final \u2014 [NAME GAP]","location":"Grand Tournament","ai":"Elite","team":[{"speciesId":"003","level":100},{"speciesId":"006","level":100},{"speciesId":"012","level":100},{"speciesId":"009","level":100},{"speciesId":"021","level":100},{"speciesId":"046","level":100}],"reward":8000},{"id":"R5-045","trainer":"Tower Climber \u2014 Bright Tower","location":"Bright Tower, post-game","ai":"Elite","team":[{"speciesId":"002","level":100},{"speciesId":"044","level":100},{"speciesId":"003","level":100}],"reward":5000},{"id":"R5-046","trainer":"Tower Climber \u2014 Umbral Tower","location":"Umbral Tower, post-game","ai":"Elite","team":[{"speciesId":"043","level":100},{"speciesId":"028","level":100},{"speciesId":"009","level":100}],"reward":5000},{"id":"R5-047","trainer":"Grand Champion Mythar","location":"Mainframe Plateau, final ascent","ai":"Elite","team":[{"speciesId":"331","level":100},{"speciesId":"003","level":100},{"speciesId":"046","level":100},{"speciesId":"043","level":100},{"speciesId":"028","level":100},{"speciesId":"021","level":100}],"reward":20000}]
```

End of file. Main: parse the JSON block above, or parse the
tables — they are the same 265 rows, checked by script.

