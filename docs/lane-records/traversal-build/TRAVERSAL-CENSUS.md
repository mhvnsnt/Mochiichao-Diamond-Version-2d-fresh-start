# TRAVERSAL CENSUS — every traversal / terrain / obstacle / elevation / movement-mode type, Gens 1–9

**Lane:** traversal-build (Jamar's order, 2026-10-30 ~09:05 CDT: *"wire up ALL traversal from every Pokémon gen — stairs, doors, gates, hills, jump-off ledges, obstacles, terrains — CODE AND THE ACTUAL VISUAL ASPECT, placed in the world"*; Direction Rule ~09:08 CDT: the enumeration comes from the held code/files themselves, in full).
**Written:** 2026-10-30. **Base tree:** `~/workspace/landing-composition/tree/` (composed landed tree), copied to `~/workspace/traversal-build/tree/`. All "pre-lane state" facts were re-verified against that tree by this lane (grep + tile counts), not copied from older audits.

**Transfer rule applied (Jamar, 2026-10-29):** everything except a Pokémon itself, Pokémon names, logos, cries, and literal word-for-word dialogue wires up 100% — world assets, tiles, code, systems included.

## How this census was enumerated

From the held sources themselves, not from memory of the games:

- **Gen 3 (richest readable field code):** `pret-pokeemerald` — `include/constants/metatile_behaviors.h` (the full MB_ table, ~230 behaviours), `src/metatile_behavior.c` (the Is* predicate family), `src/field_player_avatar.c` (the forced-movement tables `sForcedMovementTestFuncs` / `sForcedMovementFuncs`, `DoForcedMovement`, `ForcedMovement_*`, `CheckForPlayerAvatarCollision`), `src/event_object_movement.c` (`ShouldJumpLedge` / `GetLedgeJumpDirection`).
- **Gen 4 (most recent held C decomp line):** `pret-pokeheartgold` — `include/constants/metatile_behavior.h` (the TILE_BEHAVIOR table: per-direction JUMP_*, LADDER_*, ROCK_CLIMB_*, SLIDE_*, ICE, MUD…); `pret-pokediamond` for the Gen 4 field-move set (Rock Climb = HM08 there).
- **Gen 2:** `pret-pokecrystal` — `constants/collision_constants.asm` (COLL_ICE, COLL_WHIRLPOOL, COLL_CURRENT_*, COLL_WALK_*, COLL_PIT, COLL_WARP_PANEL / COLL_WARP_CARPET_*, COLL_LADDER, COLL_STAIRCASE).
- **Gen 1:** `pret-pokered` — `engine/overworld/ledges.asm` + `home/overworld.asm` (HandleLedges), `engine/overworld/movement.asm` (BIT_SPINNING player state).
- **Gen 5:** `pokeblack` at `~/workspace/pokemon-black-decomp/` — a complete matching **disassembly** whose field code is still raw ASM under placeholder names (per its own MANIFEST). Gen 5 rows are therefore graded **DATA/DESIGN** (named from the disassembly's existence + documented play), never CODE. This is the honest held grade; no finished Gen 5 C decomp exists.
- **Gens 6–9:** no decomp held. Rows graded **DESIGN** (documented behaviour), per the completeness audit's §N rule. Where a Gen 6–9 type has a Gen 1–4 ancestor, the ancestor's code is the port source and the difference is written on the row.
- **Our game:** `src/world/WorldConstants.ts` (TILE ids, PASSABLE, TILE_STYLE), `src/world/WorldEngine.tsx` (the mover), `src/world/FullWorldMaps.ts` + `src/world/Maps.ts` (tile placements, counted by this lane), `src/lib/fieldTechniques.ts` (the stub-kill S-3 gate engine, landed earlier — extended by this lane, never rebuilt), `src/components/PixiWorldCanvas.tsx` (the only live renderer; `WorldRenderer.tsx` is dead code, imported nowhere).

**State words (exactly one per row):** `CODE+VISUAL+PLACED` · `CODE-ONLY` · `VISUAL-ONLY` · `ABSENT`. "State" in this census is the **pre-lane state**; the "Wiring step" column says what this lane does about it. Post-build states live in `LANDING-RECORD.md`.

**Port grades:** CODE = ported from readable held code · DATA = held data/docs only · DESIGN = documented behaviour, no held bytes. A grade is never upgraded in the telling.

---

## A. Elevation and one-way movement

### A1. Ledge jump (one-way drop, south-facing)
- **Held source:** pokered `engine/overworld/ledges.asm` (the original); pokeemerald `src/event_object_movement.c` `ShouldJumpLedge`/`GetLedgeJumpDirection` + `MB_JUMP_SOUTH` family (CODE); pokeheartgold `TILE_BEHAVIOR_JUMP_SOUTH_*` (12 directional variants).
- **Per-gen difference:** Gen 1–3 ledges jump **south only** in practice (Gen 3 defines east/west/north codes but ships south); Gen 4 splits the ledge into per-direction behaviours incl. two-tile-wide variants. We port the Gen 3 rule (the richest *read* field code): a ledge tile is crossable only moving in its jump direction, landing on the tile beyond it; the ledge tile itself is never stood on.
- **Pre-lane state:** VISUAL-ONLY — `TILE.LEDGE = 9` existed, `PASSABLE[9] = false`, drawn through the HGSS cliff textures in the Pixi path (the "flat grass" complaint was the base colour under the texture), placed by only 2 rule references (route_1 south rim, binary_fields) — and the mover had **no ledge code at all**: the player mover never consulted PASSABLE (it blocked only the wall/tree/water tile ids), so a ledge was walkable paint — you strolled straight across it in any direction, no jump, no one-way.
- **Wiring step (this lane):** port the collision-time jump into a new `src/lib/tileBehaviors.ts` + WorldEngine wiring; hop raise on the player sprite while the jump resolves; place a ledge row where an early route's shape already implies elevation (route_1 east grass block, WORLD-EXPERIENCES §1 visible-before-openable grammar).

### A2. Ledges facing east / west / north
- **Held source:** pokeemerald `MB_JUMP_EAST/WEST/NORTH` (+ `*_WITH_EW` wide variants); pokeheartgold `TILE_BEHAVIOR_JUMP_*` full set (CODE held).
- **Pre-lane state:** ABSENT — our TILE table has one ledge id with one facing.
- **Wiring step:** not ported this lane. The engine's ledge rule takes its jump direction from one named constant (`LEDGE_JUMP_DIR`), so per-facing ledge tiles are a tile-id + constant change, not a redesign. Recorded as remainder: no Region 1 map's shape calls for a non-south ledge (routes run south-downhill by the region's geography); inventing one would be decoration, not grammar.

### A3. Stairs up / down (multi-floor)
- **Held source:** every gen; pokeemerald `MB_STAIRS_OUTSIDE/INSIDE` + warp system; pokecrystal `COLL_STAIRCASE`; ours: `TILE.STAIRS_UP/DOWN = 19/20` + the map-exit system.
- **Pre-lane state:** CODE+VISUAL+PLACED — stairs tiles are drawn (HGSS stair textures in the Pixi path) and floor changes run through exits (house 1F↔2F, cave stairs_down ×3 references). Honest note: in our engine stairs are *exit triggers wearing stair tiles*, not a tile-behaviour — the player-visible behaviour (step on stairs → arrive on the other floor) is identical to the source games' warp-backed stairs.
- **Wiring step:** none needed; left as-is.

### A4. Ladders
- **Held source:** pokecrystal `COLL_LADDER`; pokeemerald `MB_LADDER`; pokeheartgold `TILE_BEHAVIOR_LADDER_UP/DOWN/FACE_SOUTH` (CODE held).
- **Pre-lane state:** ABSENT as a tile — no ladder id exists; vertical cave/interior moves use stairs + exits (A3).
- **Wiring step:** none this lane; a ladder is presentationally a stair variant in our exit-trigger model. Remainder, named: if a later cave wants the ladder *read*, add the tile + texture then.

### A5. Hills and slopes
- **Held source:** pokeemerald `MB_MUDDY_SLOPE` (bike-only up, slide down), `MB_SLIDE_DOWN`-family slopes in caves; Gen 4 has no muddy slope (dropped); Gen 5 none.
- **Pre-lane state:** ABSENT — no slope tile, no slide-down slope.
- **Wiring step:** not ported. The muddy slope's rule is welded to the Mach Bike (E3); with no bike in the game it has no mover to attach to. The plain "hill" read in our game is carried by cliff/ledge visuals (A1/A6). Remainder, named with its dependency.

### A6. Cliff faces / elevation edges (pure blockers)
- **Held source:** pokeheartgold cliff tilesets (the env-pullin kit's cliff_a/b/c textures); pokeemerald `MB_IMPASSABLE_*` directional blockers.
- **Pre-lane state:** CODE+VISUAL+PLACED — rock/tree/wall tiles block with drawn cliff and rock faces across maps; directional one-sided impassables (Gen 3's per-side MB_IMPASSABLE_*) are ABSENT as a distinct kind (our blockers block from all sides) — written here so the absence is on record, not hidden inside the row.
- **Wiring step:** none.

### A7. Rock Climb faces
- **Held source:** pokediamond (Rock Climb = HM08, `include/constants/items.h`); pokeheartgold `TILE_BEHAVIOR_ROCK_CLIMB_FACE_*` / `ROCK_CLIMB_WALL_*` (CODE held).
- **Pre-lane state:** CODE-ONLY — the S-3 field-technique set carries the climb-class *verb check* (Ascend class in `fieldTechniques.ts`), but no climbable face tile exists or is placed anywhere.
- **Wiring step:** none this lane — climb faces belong to mountain places (later regions); placing faces in Region 1 would invent the set-piece. Engine note: a face is a gated blocker, which the S-3 gate already expresses; the missing piece is the tile + texture + places, recorded as remainder.

### A8. Waterfall faces
- **Held source:** pokeemerald `MB_WATERFALL`; pokecrystal `COLL_WATERFALL`; ours `TILE.HM_WATERFALL = 17`.
- **Pre-lane state:** CODE-ONLY — the tile is placed (4 references, FullWorldMaps) and the Cascade-class verb check exists in S-3, but riding a waterfall face up/down is not hooked as movement.
- **Wiring step:** none this lane (the faces sit in later-story water country; the verb+gates are the S-3 lane's landed state and are not re-opened here). Remainder named.

---

## B. Forced movement — the standing-tile family

Gen 3's shape, ported as one engine: pokeemerald `field_player_avatar.c` keeps two tables — a *test* table and a *run* table of forced movements keyed by the behaviour of **the tile you are standing on**, re-evaluated after every step until you stand on a tile with no forced movement. Every row in this section is one entry of that table. Our port (`src/lib/tileBehaviors.ts`) keeps the shape exactly: one resolver walks the chain; each behaviour is a small rule inside it.

### B1. Ice slide (slide until blocked)
- **Held source:** pokecrystal `COLL_ICE` (Ice Path); pokeemerald `MB_ICE` + `ForcedMovement_Slip` (CODE — ported); pokeheartgold `TILE_BEHAVIOR_ICE` + `SLIDE_*`/`STOP_SLIDING` (Gen 4 splits "ice" from "slide floor" — noted, not averaged: our port follows Gen 3, where plain ice both starts and continues the slide).
- **Pre-lane state:** ABSENT — `TILE.ICE = 14` existed with a flat colour style and was placed **0 times** on any map (counted).
- **Wiring step (this lane):** engine rule (keep travelling in the step's direction while standing on ice, stop on the last ice tile before a blocker); real ice textures composed from held Diamond tileset bytes (see LANDING-RECORD provenance); an ice **room** placed in the Cave of Echoes (first ice = a room, WORLD-EXPERIENCES §4) with stopper tiles as the puzzle grammar.

### B2. Cracked floor / thin ice (stand twice → fall through)
- **Held source:** pokeemerald `MB_CRACKED_FLOOR` + `MB_CRACKED_FLOOR_HOLE` (and `MB_CRACKED_ICE` for the ice variant) (CODE — the two-state rule ported).
- **Pre-lane state:** ABSENT — no tile id, no state tracking.
- **Wiring step (this lane):** new tile `CRACKED_FLOOR = 27` (a free id), per-map cracked-state set in WorldEngine, second stand fires the drop trigger (B4); one tile placed inside the ice room, on the entry slide path, so the mechanic is met where it is taught.

### B3. Spin tiles
- **Held source:** pokeemerald's spin steps (`PlayerAvatar_SecretBaseMatSpinStep0–3`, behind `MB_SECRET_BASE_SPIN_MAT`) — the closest held *spin* rule in readable code (CODE); pokered `engine/overworld/movement.asm` carries the older `BIT_SPINNING` player state for the Rocket Hideout / gym spin floors.
- **Rule ported:** stepping on a spin tile rotates the traveller four quarter-turns in place and returns them facing the way they came, once per entry (the emerald spin steps). **Difference written, not averaged:** Gen 1's floor spin tiles also *translate* the player while spinning; that translation is not ported.
- **Pre-lane state:** ABSENT.
- **Wiring step (this lane):** engine rule + a drawn motif (two arc arrows) in the Pixi path + tile id `SPIN = 38`. **Not placed in Region 1** — spin floors live in gym/trick-house-class interiors in every gen that has them, and Region 1 has no such interior yet; placing one on a route would break the grammar. State after this lane: CODE-ONLY (renderer included), named as such in the landing record.

### B4. Hole / pit drop (fall to the floor below)
- **Held source:** pokecrystal `COLL_PIT`; pokeemerald cracked-floor falls (B2) and hole warps (CODE shape: a warp whose destination is the map below).
- **Pre-lane state:** ABSENT — no hole tile, no drop concept in map data.
- **Wiring step (this lane):** tile `HOLE = 43` + a `dropTarget` field on map defs (the floor below, named per map, never guessed); stepping on a hole fires the same transition as a warp. One hole placed in the ice room (its fall returns you to the cave's entrance floor — the room's reset valve, the Pokémon pattern for ice rooms).

### B5. Conveyor / arrow floors
- **Held source:** pokecrystal `COLL_WALK_RIGHT/LEFT/UP/DOWN` (defined, mostly unused there); pokeemerald `MB_EAST/WEST/NORTH/SOUTH_ARROW_WARP` family — Gen 3's arrows are *warps*; the push-along-the-belt behaviour is the Gen 1/2 walk-tile rule (CODE shape ported from the crystal constants + emerald's forced-movement table slot `ForcedMovement_Walk*`).
- **Per-gen difference (written, not averaged):** Gen 3 arrow = instant warp to a paired tile; Gen 1/2 walk tile = forced steps in the arrow's direction. We port the **walk** rule (it is the one that reads as a conveyor in play) and say so.
- **Pre-lane state:** ABSENT.
- **Wiring step (this lane):** tiles `CONVEYOR_E/N/W/S = 39–42`, engine rule (the tile's direction governs, not the traveller's), animated chevron motif in the Pixi path. **Not placed in Region 1** — same gym/factory grammar as B3. CODE-ONLY after this lane, named.

### B6. Warp pairs (step-on teleport tiles)
- **Held source:** pokecrystal `COLL_WARP_PANEL` / `COLL_WARP_CARPET_*`; pokeemerald warp events (CODE shape); ours `TILE.WARP = 18` + map `warps[]` data (the field already existed in the map type).
- **Pre-lane state:** VISUAL-ONLY — warp tiles were *painted* (a strip in Neon City, a whole floor in the Mauveville Arena) with **no warp data reading them**; stepping on one did nothing.
- **Wiring step (this lane):** WorldEngine now resolves warp triggers from the traversal engine against the map's `warps[]`; both dead-paint sites got real pairs (Neon City strip corners ↔, Arena floor corners ↔). CODE+VISUAL+PLACED after this lane.

### B7. Currents (water that carries you)
- **Held source:** pokecrystal `COLL_CURRENT_RIGHT/LEFT/UP/DOWN` (defined, unused there); pokeemerald `ForcedMovement_PushedByCurrent` (CODE — ported; Gen 3's sea routes are the canonical use); Gen 4/5 currents are the same rule at DATA/DESIGN grade.
- **Pre-lane state:** ABSENT — no current tile; Boot Bay was one flat water map.
- **Wiring step (this lane):** tiles `CURRENT_E/N/W/S = 46–49`, engine rule (a current pushes only across water-family tiles — it can never push you onto land; the lane ends in open water, the eddy rule), drawn as moving chevrons on the water base; two lanes placed in Boot Bay (southbound out-lane, northbound return lane, entrance column kept still).

### B8. Whirlpools
- **Held source:** pokecrystal `COLL_WHIRLPOOL`; pokeheartgold `TILE_BEHAVIOR_WHIRLPOOL` (CODE held).
- **Pre-lane state:** CODE-ONLY — the crossing *verb* exists in the S-3 set (the Wave-class obstacle list names whirlpool-class water), but there is no whirlpool tile and none is placed.
- **Wiring step:** none this lane — whirlpools are a Gen 2/HGSS sea feature; Region 1's water grammar is currents (B7) + Wave gates. Remainder named; the tile is a one-id addition on top of the S-3 verb when a sea place calls for it.

---

## C. Terrain — cost, surface, and water

### C1. Deep snow (movement cost)
- **Held source:** Gen 4's snow routes (pokediamond/pokeheartgold line; deep snow slows the walk and blocks the run/bike) (DATA/DESIGN grade for the rule — Gen 4's field behaviour table names snow-adjacent behaviours but the readable cost rule is documented play); Gen 8 repeats it.
- **Our rule (stated as ours, built on the Pokémon pattern):** standing on snow at the end of a move makes the *next* step cost an extra press — a two-beat walk. This is a cost model, honestly labelled: it is the simplest faithful expression of "snow is slow" in an engine whose mover is step-based, and it is written here as a design decision, not dressed up as a byte port.
- **Pre-lane state:** ABSENT — no snow tile (one snow *texture* existed in the kit, unused by any tile).
- **Wiring step (this lane):** tile `SNOW = 44`, cost rule in the engine + WorldEngine, Platinum snow texture wired in the Pixi path. **Not placed** — no Region 1 area carries a snow climate (WORLD-EXPERIENCES §4 puts the snow country in Region 4); placing snow in Region 1 would invent a climate. CODE-ONLY (renderer included) after this lane.

### C2. Mud / swamp (movement cost + sink)
- **Held source:** pokeheartgold `TILE_BEHAVIOR_MUD`; Gen 4's marsh (sink to the knees, wiggle free) (CODE held for the behaviour name; the sink-state machine is documented play, DESIGN grade for detail).
- **Our rule:** same cost model as snow (C1) — the sink-and-wiggle state machine is **not** ported and is named as remainder, not faked.
- **Pre-lane state:** ABSENT.
- **Wiring step (this lane):** tile `MUD = 45`, cost rule, drawn motif (sheen pools) on a sand base in the Pixi path. Not placed — Region 1 has no marsh. CODE-ONLY.

### C3. Sand / dunes (deep sand cost)
- **Held source:** pokeemerald `MB_DEEP_SAND` (CODE — sand you sink-walk through slowly); ours `TILE.SAND_DUNE = 24` pre-existed.
- **Pre-lane state:** VISUAL-ONLY — the tile existed (sand texture in the Pixi path) but was walk-speed-neutral and placed 0 times in FullWorldMaps (counted; the beach maps draw sand through other tiles).
- **Wiring step (this lane):** SAND_DUNE joins the cost set (C1's model); its PASSABLE record corrected to steppable-with-cost. Content placement waits on the beach maps' own pass (their sand is currently drawn with path/grass-family tiles — retiling beaches is map work, not traversal work, and is named as such).

### C4. Ash grass (Route 113 soot grass)
- **Held source:** pokeemerald `MB_TALL_GRASS` + the ash-collection system (Route 113) (CODE held).
- **Pre-lane state:** ABSENT — neither the greyed grass visual nor ash collection exists.
- **Wiring step:** none — an ashfall place is a later-region set-piece (and its collection economy is an item system, not traversal). Remainder named.

### C5. Tall grass and its variants
- **Held source:** pokecrystal `COLL_TALL_GRASS` / `COLL_LONG_GRASS`; pokeemerald `MB_TALL_GRASS`; Gen 5 dark grass (double encounters) at DESIGN grade; ours `TILE.TALL_GRASS = 6`.
- **Pre-lane state:** CODE+VISUAL+PLACED for standard tall grass (encounter rolls run on it; HGSS grass textures drawn). **Long/dark grass:** VISUAL-ONLY — a dark-grass texture case exists in the Pixi path, but no distinct tile behaviour (no double-encounter rule) is attached.
- **Wiring step:** none this lane (encounter-table work, not movement); the dark-grass behaviour gap is recorded here so it is not mistaken for wired.

### C6. Shallow water / shore entry
- **Held source:** pokeemerald shallow-water behaviours; ours `TILE.SHALLOW = 13`.
- **Pre-lane state:** CODE+VISUAL+PLACED — shallows are walkable water edges and carry the shore grammar with the Wave gate (S-3): you enter water at the shallows, not by walking off a cliff into deep water. (The east-coast entry lesson from the earlier world pass is already reflected in the maps.)
- **Wiring step:** the traversal engine treats shallows as water-family for currents (B7) — the only change, and it is in the engine's family set, not the maps.

### C7. Deep water and diving
- **Held source:** pokeemerald `MB_DEEP_WATER` + the Dive field move (two-layer maps) (CODE held); Gen 4/5 dropped overworld diving; Gen 6 (ORAS) restored it (DESIGN).
- **Pre-lane state:** CODE-ONLY — deep water is a gated surface (Wave) and the Deep Dive verb *check* exists in S-3, but there is no underwater layer or dive spot.
- **Wiring step:** none this lane — a dive spot needs its underwater map (a place, later water country). Remainder named.

### C8. Tides
- **Held source:** pokeemerald Shoal Cave (tide by the world clock, two map states) (CODE held for the pattern).
- **Pre-lane state:** ABSENT — our world clock exists (gap-fill S1, verified-wired) but no tide place or tide tile-swap exists.
- **Wiring step:** none — no tide place in Region 1. The engine hook a tide needs (clock-driven tile override) already exists in WorldEngine's `tileOverrides`; recorded so the future wiring is a map + schedule, not an engine project.

### C9. Lava
- **Held source:** Gen 3/4 lava tiles (impassable heat terrain); ours `TILE.LAVA = 25`.
- **Pre-lane state:** VISUAL-ONLY — the id exists; it is a blocker with a style entry, placed only by generator rules outside Region 1's story maps.
- **Wiring step:** none — lava country is later-region content; the tile behaving as a wall is the correct Pokémon behaviour for it (you never walk on lava in any gen's overworld).

### C10. Bridges
- **Held source:** pokeemerald `MB_BRIDGE_*` (bridge tiles carry the level-underneath rule); ours bridge tiles 33–37 with HGSS/BW2 textures.
- **Pre-lane state:** CODE+VISUAL+PLACED — bridges draw and walk (the composition tree's bridge pass). Honest note: the walk-*under* a bridge half of the Gen 3 rule (two height levels on one map) is ABSENT — our maps are single-level, and no Region 1 map needs the under-pass.
- **Wiring step:** none.

---

## D. Obstacles and gates (the S-3 family — extended, never rebuilt)

The stub-kill S-3 lane already ported the gate engine (`src/lib/fieldTechniques.ts`, `evaluateTileGate` in WorldEngine): a blocked tile names the technique that clears it, the world gates on party/technique state, and cleared tiles open through `tileOverrides`. This census records those rows for completeness; this lane changed none of them.

### D1. Cut trees — `TILE.HM_CUT = 15`
CODE+VISUAL+PLACED (S-3 gate; Slice-class verb). No change.

### D2. Smashable rocks — `TILE.HM_ROCK = 16`
CODE+VISUAL+PLACED (S-3 gate; Boulder Break-class verb; 9 references in FullWorldMaps, incl. one re-read by this lane as the ice room's slide stopper neighbour). No change.

### D3. Push boulders — `TILE.HM_BOULDER = 26`
- **Held source:** pokeemerald's object-push system (a boulder is an *object* that slides one tile per push, falls into holes, and holds floor switches) (CODE held).
- **Pre-lane state:** CODE+VISUAL+PLACED **as a gate only** — S-3 makes the boulder tile passable with the Mighty Push-class verb, but the boulder does not *move*: no push-slide, no hole-filling, no switch-holding. Placed 0 times in FullWorldMaps (counted).
- **Wiring step:** none this lane — the honest port is object-layer work (a movable object system), a different build from tile behaviour; recorded here in full so the gate is never mistaken for the mechanic. **Remainder, named as the largest single traversal gap left.**

### D4. Floor switches / pressure plates
- **Held source:** pokeemerald switch tiles (Sootopolis-class gym puzzles) (CODE held).
- **Pre-lane state:** ABSENT (story/event triggers exist in the event system, but no stand-on switch tile family).
- **Wiring step:** none; pairs with D3 when the object layer lands.

### D5. Doors, fences, gates
- **Held source:** universal; ours `TILE.DOOR` + exit triggers + story-flag blocks.
- **Pre-lane state:** CODE+VISUAL+PLACED.
- **Wiring step:** none.

### D6. One-way doors and rotating gates
- **Held source:** Gen 2/3 gym interiors (DESIGN/DATA grade).
- **Pre-lane state:** ABSENT.
- **Wiring step:** none — interior-puzzle content for gym-class places that don't exist in Region 1 yet; the warp-pair + conveyor kit (B5/B6) covers the same design space when one does.

---

## E. Movement modes

### E1. Running (Sprint Boots)
CODE+VISUAL+PLACED (pre-lane; the held-key mover). No change.

### E2. Mach Bike (speed mode, muddy slopes, fast cracked-floor crossing)
- **Held source:** pokeemerald bike system (CODE held).
- **Pre-lane state:** ABSENT — no bike item, no bike mover; A5's muddy slope and B2's speed-crossing both depend on it.
- **Wiring step:** none this lane — a bike is a mover + item + map-grammar programme of its own; inventing a half-bike to satisfy two tiles would be the fake-wiring failure. Remainder named with its dependents (A5, B2-speed case).

### E3. Acro Bike (wheelie, bunny hop, side hops over rails)
- **Held source:** pokeemerald (CODE held).
- **Pre-lane state:** ABSENT. Same dependency story as E2; its ledge-*side*-hop is the only traversal verb in the whole census with no non-bike expression.
- **Wiring step:** none. Remainder named.

### E4. Water ride (Wave / surf-class)
CODE+VISUAL+PLACED (pre-lane, S-3): water becomes walkable at gated entries; the traversal engine's current rule (B7) rides on top of it. No change beyond B7's family set.

### E5. Soar / glide seats
- **Held source:** Gen 6 soar, Gen 9 glide (DESIGN — no held code); our canon folds the soar class into fast travel (the completeness audit's B9 ruling).
- **Pre-lane state:** CODE-ONLY — fast travel exists as a system; there is no soar seat or glide verb.
- **Wiring step:** none; canon already routes this class to fast travel.

### E6. Ride / follow creature movement (creature mode)
CODE+VISUAL+PLACED (pre-lane, the creature-mode programme — a different mover family from this census's tile rules; recorded so the mode list is complete).

### E7. Sneak / crouch (ORAS grass sneaking)
ABSENT (DESIGN-grade source only). No wiring step — a stealth-encounter verb, not traversal grammar Region 1 uses. Remainder named.

---

## F. What this lane built (summary; the proof is in LANDING-RECORD.md)

One engine (`src/lib/tileBehaviors.ts`) ported on pokeemerald's forced-movement shape, wired into the real mover, covering: **A1** ledge jump (+ hop visual), **B1** ice slide, **B2** cracked floor, **B3** spin, **B4** hole drop, **B5** conveyor, **B6** warp pairs, **B7** currents, **C1/C2/C3** movement-cost terrain (snow/mud/deep sand). Visuals from held bytes where bytes exist (Diamond ice, Platinum snow) and from the env-pullin kit's grammar otherwise (HGSS cliff ledge, cave-floor cracked, drawn motifs for spin/conveyor/hole/current — motifs are *drawn geometry*, not emoji or flat colour). Placements in Region 1 only, each with its Pokémon-pattern reason, recorded per placement in the landing record.

**Owner slots untouched:** no species, names, set-piece specifics, or story facts were invented anywhere in this lane. Where a traversal type's *place* would require one (a snow climate, a marsh, a gym interior), the type ships as engine + renderer and the content stays absent, named.
