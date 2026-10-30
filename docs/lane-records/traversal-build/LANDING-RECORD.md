# LANDING RECORD — traversal build lane (2026-10-30)

**Order:** Jamar, 2026-10-30 ~09:05 CDT — wire up ALL traversal (code + visual + placed in the world), HGSS/BW2 visuals, Pokémon code from the most recent held sources; plus the Direction Rule (~09:08 CDT): enumerate from the held corpus in full.
**Tree:** `~/workspace/traversal-build/tree/` (copied from `~/workspace/landing-composition/tree/`; no other lane's tree was edited; nothing pushed — the landing train composes lane trees).
**Census:** `~/workspace/traversal-build/TRAVERSAL-CENSUS.md` (per-type held source, per-gen differences, pre-lane states).

## Receipts (run, not claimed)

- `npx tsc --noEmit` — **clean**, exit 0, no output.
- `npx vitest run src/lib` — **35 test files, 492 tests, all passed** (baseline 463; **+29 new** in `src/lib/tileBehaviors.test.ts`, covering the engine rules and the real placed maps).
- `npx vite build` — **clean** (one pre-existing chunk-size warning, unrelated). The four new textures are present in `dist/assets/hgss/`.
- Live proof drive (`proof/drive.cjs` against the built dist, real title flow, real keyboard input): captures in `proof/` — see §4.

## 1. What was built

### The engine — `src/lib/tileBehaviors.ts` (new)
One resolver on pokeemerald's forced-movement shape: after a step, the behaviour of the tile you **stand on** is re-evaluated in a chain until nothing forces movement (chain cap 64); ledges resolve at collision time. Exports `resolveTraversalStep` (a pressed step, incl. the ledge case), `resolveStandingChain` (the standing-tile chain), `behaviorOf`, `CHAIN_SOLID_TILES`, `COST_TILES`. Full per-system provenance + per-gen differences are in the file header and the census.

Rules live now: **ledge jump** (south-facing; jump direction must match travel; lands one tile beyond; the ledge is never stood on), **ice slide** (keeps travel direction until blocked; stepping off ice ends the slide), **spin** (four quarter-turns in place, once per entry), **conveyor** (the tile's direction governs, chains), **currents** (push only across water-family tiles — never onto land), **hole drop** (immediate drop trigger), **cracked floor** (first stand cracks, second stand drops), **warp trigger** (fires on the final tile of a move), **movement cost** (snow/mud/deep sand: standing on cost terrain at a move's end makes the next step cost an extra press).

### Wiring — `src/world/WorldEngine.tsx`
`move()` now: consumes a pending cost press first; resolves steps through the engine inside the existing gate order (exits/doors → S-3 field-technique gates → traversal — S-3 was extended, not rebuilt); fires warp pairs from map `warps[]` and drops from map `dropTarget`; sets a `traversalFx` raise for the ledge hop; post-step events/encounters/living-world all read the **final** tile of a chain, so a slide that ends in grass rolls encounters on the grass you actually stopped on. NPCs block chain steps (a slide stops before a person, it does not pass through them).

### Tiles — `src/world/WorldConstants.ts`
New ids on free slots: `CRACKED_FLOOR 27`, `SPIN 38`, `CONVEYOR_E/N/W/S 39–42`, `HOLE 43`, `SNOW 44`, `MUD 45`, `CURRENT_E/N/W/S 46–49`. `SAND_DUNE` corrected from wall to cost terrain (`PASSABLE` + the `src/lib/tilesets/metatiles.ts` mirror updated to match). New tiles carry empty TILE_STYLE labels — no emoji, no flat-colour stand-ins for the new pieces in the live renderer.

### Visuals — `src/components/PixiWorldCanvas.tsx` (the only live renderer)
- **Ledge:** already drew through the kit's HGSS cliff textures; with the new placement row it now reads in play as a brown rocky cliff lip (see proof frames) instead of an oddity in grass.
- **Ice:** three real textures composed by the env-pullin kit's own rule (16×16 sources as 2×2 plain, 32×32 whole) from held Diamond tileset bytes (`fice_a/b/c`, map_tex_set `narc_0054` in `~/workspace/env-pullin-hgss-bw2/extracted/diamond/texsets/`): `ice.png` sha256 `7a0d2bcdd5bb8f9e11c454f40847227292a50daddafd7ae4cc21d8f9633f710e` (365 B), `ice_b.png` `ac695ef46c5cd7ed9cc2ea6e98c59aae0d14c225be7df7eba5c2be9f5a8f9037` (589 B), `ice_c.png` `9f920ee87f6262049166bb84b3961543dace0b1f95c3a6096a7a3590c20e527f` (440 B). Wired exteriors (hash-rotated set) and the Cave of Echoes interior table.
- **Snow:** Platinum `s_snow02` (from `extracted/platinum/texsets/map_texture_set_006.nsbtx/`): `snow.png` sha256 `b94e6151ca454ceb11762fe364593fdcd9f7098a6cf71b4d21d4828d8da946ff` (306 B). (A 32×16 half-tile composition was made, rejected, and deleted rather than shipped wrong.)
- **Drawn motifs** (vector geometry in the canvas, animated where the source animates): spin = two arc arrows; conveyor = chevrons that scroll with the animation tick; hole = dark pit with a rim; cracked floor = crack lines over the cave floor; currents = chevrons on the water base; mud = sheen pools.
- **Hop:** while a ledge jump resolves, the player sprite renders raised (−0.55 tile) for 420 ms; the ground shadow stays planted (no baked shadows anywhere in this lane — the raise is a render offset, the shadow is the canvas's own).

## 2. Placements (Region 1, story order) — `src/world/FullWorldMaps.ts`

| Map | Placement | Why (the Pokémon pattern) |
|---|---|---|
| Route 1 (`route_1`) | Ledge row at y=11, x=18–24 — the south edge of the east tall-grass block | §1 visible-before-openable: walking north up the main path you *see* the grass block and its cliff lip long before you can use the drop; the jump turns the return trip into a one-step shortcut. The block's north side stays open — a ledge is one-way, not a wall with paint. |
| Cave of Echoes (`cave_of_echoes`) | A passage cut at x=14, y=9–11 joining the gallery to the previously unreachable chamber; the chamber floored as an **ice room**: 30 ICE tiles, two rock stoppers (11,13)/(13,15), the pre-existing smash rock kept at (10,16), a HOLE at (8,16), one CRACKED_FLOOR at (14,12); `dropTarget` returns drops to the cave entrance floor (5,2) | §4 first ice = a room. The stoppers are the puzzle grammar (every slide has a designed end); the hole is the room's reset valve; the cracked tile sits on the entry slide path so the break rule is met where it's taught. Miner Cleff's chamber is now reachable for the first time. |
| Neon City (`neon_city`) | Warp pair on the painted warp strip's true warp tiles: (17,2) ↔ (19,6) | The strip was dead paint; a warp pair is the emerald/crystal grammar for it. (The strip's other columns are claimed by building blocks earlier in the map builder — the pair sits on tiles that actually are WARP.) |
| Mauveville Arena (`mauveville_arena`) | Warp pair across the warp-painted floor: (3,20) ↔ (16,4) | Same dead-paint fix: the arena floor's corners now actually carry you across it. |
| Boot Bay (`boot_bay`) | Current lanes: `CURRENT_S` down x=10 (y2–12), `CURRENT_N` up x=20 (y7–17); the x=15 entrance column kept still | The emerald sea-route pattern: a lane out and a lane back, both ending on open water (a current never pushes you onto land — engine rule, not map luck). Boot Bay was one flat all-water map; it now has a readable flow. |

Engine-ready but **deliberately unplaced** (see §5): spin, conveyor (gym/factory-class interiors — none exist in Region 1), snow (no Region 1 snow climate), mud (no Region 1 marsh).

## 3. Post-build state table (per type)

| Type | State after this lane |
|---|---|
| Ledge jump (south) | **CODE+VISUAL+PLACED** |
| Ledges E/W/N | ABSENT (engine takes direction from one constant; no R1 map calls for one) |
| Stairs / multi-floor | CODE+VISUAL+PLACED (pre-existing, exit-trigger model) |
| Ladders | ABSENT as a tile (function covered by stairs/exits) |
| Hills / muddy slopes | ABSENT (Mach Bike dependent — E2) |
| Cliff faces / elevation blockers | CODE+VISUAL+PLACED (pre-existing; per-side impassables ABSENT) |
| Rock Climb faces | CODE-ONLY (S-3 verb check; no face tile/places) |
| Waterfall faces | CODE-ONLY (tile placed; ride not hooked) |
| Ice slide | **CODE+VISUAL+PLACED** |
| Cracked floor | **CODE+VISUAL+PLACED** |
| Spin tiles | CODE-ONLY (engine + drawn motif; no R1 interior for it) |
| Conveyor / arrow floors | CODE-ONLY (engine + animated motif; same reason) |
| Warp pairs | **CODE+VISUAL+PLACED** |
| Hole drop | **CODE+VISUAL+PLACED** |
| Currents | **CODE+VISUAL+PLACED** |
| Whirlpools | CODE-ONLY (S-3 verb; no tile) |
| Deep snow | CODE-ONLY (engine + real texture; R4's climate, not R1's) |
| Mud / swamp | CODE-ONLY (cost rule + motif; the sink state machine is NOT ported) |
| Deep sand | CODE+VISUAL (cost rule live; beach retiling is map work, unplaced as its own tile) |
| Ash grass | ABSENT |
| Tall grass | CODE+VISUAL+PLACED (pre-existing) |
| Dark/long grass behaviour | VISUAL-ONLY (texture case exists; no double-encounter rule) |
| Shallow water / shore entry | CODE+VISUAL+PLACED (pre-existing; currents now treat it as water-family) |
| Deep water / diving | CODE-ONLY (verb check; no underwater layer) |
| Tides | ABSENT as content (clock + tile-override hooks exist) |
| Lava | VISUAL-ONLY (blocker behaviour is the correct one) |
| Bridges | CODE+VISUAL+PLACED (walk-under half ABSENT — single-level maps) |
| Cut trees / smash rocks | CODE+VISUAL+PLACED (S-3, unchanged) |
| Push boulders | Gate only (S-3) — **push-slide/hole-fill/switch mechanics ABSENT** |
| Floor switches | ABSENT |
| Doors / fences / gates | CODE+VISUAL+PLACED (pre-existing) |
| One-way doors / rotating gates | ABSENT (interior-puzzle content) |
| Running | CODE+VISUAL+PLACED (pre-existing) |
| Mach Bike / Acro Bike | ABSENT (whole mover programme; blocks slopes + bike-speed cracked crossing) |
| Water ride (Wave) | CODE+VISUAL+PLACED (pre-existing) |
| Soar / glide | CODE-ONLY (canon folds the class into fast travel) |
| Creature-mode movement | CODE+VISUAL+PLACED (pre-existing, separate programme) |
| Sneak / crouch | ABSENT |

## 4. Proof — real in-game captures (`proof/`, this lane's built dist, real save, real keys)

- **`route-before.png`** — the BASE build at route_1 (20,8): the east grass block ends into plain grass; no ledge, no elevation read.
- **`route-after.png`** — this build, same camera: the cliff-textured ledge row runs along the block's south edge.
- **`ledge-before.png`** — player standing on the grass directly above the ledge row at (20,10).
- **`ledge-after.png`** — one ArrowDown press later: the player stands *below* the ledge strip at (20,12), camera scrolled with him. He crossed a tile that cannot be walked up — the jump, working in the live scene.
- **`ledge-hop.png`** — taken ~190 ms after the press, inside the hop window. Honest note: the still does not visibly catch the sprite's raise (the move resolves instantly and the capture latency eats the 420 ms window) — it is kept for the record, not headlined as hop proof. The raise is wired in the canvas (traversalFx) and the before/after pair is the functional proof.
- **`ice-before.png`** — the Cave of Echoes ice room: Diamond-ice floor, rock stoppers, the hole (dark pit, lower left), the smash rock, Miner Cleff inside; player at the west edge (8,15).
- **`ice-after.png`** — one ArrowRight press later: the player has slid four tiles east and stopped against the (13,15) stopper — slide-until-blocked, in the live scene.
- Method note: position probes read from the save are **not** used as evidence — the game only persists position on transitions, so the probes lag steps. The frames themselves (player position relative to fixed map features, camera centred on the player) are the position evidence. No harness frames are presented; there are none in this folder.

## 5. Honest remainder

- **Push boulders (D3)** are the biggest single gap: the S-3 gate opens the tile, but the boulder-as-object system (slide per push, fall in holes, hold switches) is unported object-layer work.
- **Bikes (E2/E3)** are absent as a whole mover programme; muddy slopes (A5) and bike-speed cracked-floor crossing wait on it. No half-bike was faked.
- **Spin/conveyor** ship as engine + renderer with zero placements: their places are gym/factory-class interiors Region 1 doesn't have. When one is authored, placement is map data only.
- **Snow/mud** ship as engine + visuals with zero placements (climates belong to later regions per the world plan); mud's sink-and-wiggle state machine is not ported — only the cost.
- **Rock climb faces, waterfall rides, whirlpool tiles, dive spots, tides** remain at their pre-lane states (verb checks / tiles without movement hooks or places), each for the place-based reason in the census.
- **Per-direction ledges** are one constant + tile ids away in the engine, unbuilt because no Region 1 map's shape asks for one.
- The ledge **hop raise** is a render offset on an instant move; a tweened jump arc would need the mover itself to gain step timing — a presentation upgrade, recorded, not smuggled in as done.
