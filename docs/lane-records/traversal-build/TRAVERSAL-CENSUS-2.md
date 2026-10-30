# TRAVERSAL CENSUS 2 — part 2 of the traversal build (2026-10-30)

**Order:** Jamar, 2026-10-30 ~09:49 CDT — every remaining traversal item
from part 1's remainder goes to FULLY WIRED: push boulders (into holes
and onto switches), bikes, rock climb, waterfall rides, diving, surf
end-to-end, and part 1's engine-only leftovers placed where Region 1
can honestly carry them.
**Eye-verdict binding the visuals:** 2026-10-30 ~09:51 CDT — part 1's
ledge read flat ("more like Minecraft"); no traversal piece lands as a
single flat texture: top surface + front face with its own shading +
height offset + a soft shadow under the lip drawn at render (never
baked). Part 1's ledge was re-drawn to this standard first.
**Expansion order binding the build:** 2026-10-30 ~09:52 CDT — the
complete port from Pokémon BW and the other held games FIRST, per
system; the Mochiichao expansion ON TOP of the finished port, the two
layers kept separate below and in LANDING-RECORD-2.
**Tree:** `~/workspace/traversal-build/tree/` (part 1's tree, continued;
no other lane's tree edited; nothing pushed).

## Scope note — what this lane's 2.5D is, and is not

True BW2 polygon rendering (the extracted NSBMD models, rendered as
polygons) belongs to the 3D world programme under the owner's 3D world
order (2026-10-30 ~09:54 CDT): the 3D-model world is the top of the
Settings switcher's flatness axis, and the 2D builds are its steps
down. This lane's work is the built-up-face 2.5D of that axis's 2D
step — the HGSS way (which BW2's models also obey visually): composed
tile faces inside this tile engine. No polygon claim is made anywhere
in these records.

## 1. Push boulders (the part-1 "biggest hole")

- **Ported base (pokeemerald):** `src/field_player_avatar.c`
  `TryPushBoulder` + `src/field_script/fldeff_strength.c` setup
  (OBJ_EVENT_GFX_PUSHABLE_BOULDER). The behaviour taken whole: push
  exactly one tile in the press direction; the target cell must be
  free floor (COLLISION_NONE — never water, never a door, never
  another object/NPC); a boulder pushed into a hole falls in and the
  hole becomes floor; a boulder resting on a floor switch holds it
  pressed; loose boulder positions reset when the area reloads, while
  a filled hole stays filled (the source's split: object positions
  are per-visit, the filled hole is terrain). The gate that allows a
  push at all is the existing S-3 Mighty Push verdict (held flag +
  living performer carrying the source move) — extended, not rebuilt.
- **Our seam:** `src/lib/boulders.ts` (`tryPushBoulder`,
  `switchesHeld`, `isLooseBoulderOverride`) works on the engine's
  existing tile-override store, so a push is data the renderer, the
  collision, and the chains all read the same way. The WorldEngine
  Mighty Push branch calls it; the player follows into the vacated
  cell. Pushing is silent per-push (no dialog per shove — the gate
  dialog still speaks when the verb is refused).
- **On-top expansion (ours):** the switch side is generalised — a
  floor switch is held by a boulder, by the player, or by any NPC
  standing on it (`switchesHeld` reads live occupants), and any number
  of switch gates on a map read the same held state. Emerald's
  switch-gates are single-puzzle wiring; ours is a map-level rule.
- **Placed:** Cave of Echoes junction (hole path) and the Scrap
  Junkyard cache pen (lane boulder → hole mouth, inner boulder →
  switch → gate). Reasons in LANDING-RECORD-2 §3. **Live-proved**
  (probes + frames, LANDING-RECORD-2 §5).

## 2. Bikes (absent before this lane)

- **Ported base (pokeemerald):** `src/bike.c` +
  `src/field_player_avatar.c` (avatar flags, `CheckAcroBikeCollision`,
  bunny hop) + `include/constants/metatile_behaviors.h`
  (MB_MUDDY_SLOPE). Two behaviour sets: **Mach** — speed builds over
  consecutive same-direction steps; cracked floors cross clean only
  at full build-up; muddy slopes climb only at full build-up; a
  collision kills the build-up. **Acro** — slower top speed, bunny
  hop over hop-class obstacles, wheelie climb of the same slopes.
  Gear behaviour follows the Gen 4 pattern (one bike, gears switched
  in the field), because RSE's two separate bikes cannot be carried
  by one key-item slot; the two behaviour sets themselves are RSE's,
  whole. Mode rules: no riding indoors, under water, in Creature
  Mode, or standing in water; doors and water entry dismount (the
  source's avatar transitions).
- **Our seam:** `src/lib/bike.ts` — ride mode beside walk/Sprint
  Boots in the movement engine; the held-direction step interval is
  mode-driven (Mach full 45 ms / building 80 ms / Acro 90 ms / foot
  140 ms). The charge bookkeeping lives in WorldEngine's move (build
  on consecutive same-direction steps, shed to first tier on a turn,
  shed to zero on any press that does not move the player — the
  wrapper reads the store's synchronous position field, so the
  verdict is exact, not timed). Key item id is the neutral `bike`;
  the display name is a **DRAFT — "Trail Bike (DRAFT NAME)"** — the
  real name is the owner's slot.
- **Control:** KeyC cycles foot → Mach → Acro → foot (with refusal
  notices where riding is not allowed).
- **On-top expansion (ours):** the Acro hop is widened past the
  source's rail-only grammar: side-on ledges and one-tile holes are
  hop-class too (`tryAcroHop`), because our ledge/hole tiles are the
  same obstacle family the rails belong to. Named as ours in the
  module header.
- **Placed:** Route 2 (Harbour Road) carries the full grammar on one
  road: slope band at the road's north stretch, a hop-rail row with a
  centre gap, and a cracked-floor stretch with a sound centre tile.
  **Live-proved** all ways: hop (probe), slope climb at full charge,
  slope refusal at zero charge, cracked crossing at full charge,
  cracked break-and-drop at low speed.

## 3. Crag Climb (rock climb faces)

- **Ported base (pokeheartgold):** `src/field_move.c`
  `FieldMove_CheckRockClimb` / `Task_UseRockClimbInField`, gated by
  `MetatileBehavior_IsRockClimbInDirection`
  (`src/metatile_behavior.c`) — approach the face, the verb check
  (held + performer, the S-3 context-verdict seam), then climb the
  whole face run to the ground beyond; the same path serves up and
  down.
- **Our seam:** tile `ROCK_CLIMB 50`; `tileBehaviors.resolveClimb`
  scans the face run along the press direction and lands on the
  first standable tile beyond it. Faces are drawn built-up like the
  ledges (rock crest lip + cliff face + foot shading + lip shadow).
- **On-top expansion (ours):** the resolver is direction-general —
  any face orientation climbs (the source's north–south / east–west
  behaviour tiles are one rule here). Faces double as two-way
  shortcuts in the ledge bands instead of gating new areas.
- **Placed:** one face inside each of Route 1's two ledge bands
  ((18,11) and (20,28)), each converting a one-way ledge drop into a
  two-way shortcut, visible from below before it is openable.
  **Live-proved** (probe (18,10) after one press; frames).

## 4. Cascade (waterfall rides)

- **Ported base (pokeemerald):** the waterfall avatar path in
  `src/field_player_avatar.c` — riding UP a falls needs the verb
  (our Cascade gate on the S-3 table); riding DOWN is free while on
  the water. The ride crosses the whole falls run, not one tile.
- **Our seam:** `tileBehaviors.resolveCascade` rides the full run
  along the press axis (vertical or horizontal); WorldEngine's gate
  branch requires the Wave state (standing on water-family) for any
  falls entry, the down-ride pre-check bypasses the verb exactly as
  the source does. Falls are drawn as a scrolling texture
  (TilingSprite, the source's own animation method for falls — the
  kit's fldtanime port has no falls cycle because the source scrolls
  the texture) with a composed crest at the top and foam at the base.
- **Placed:** Route 1's pond falls (24,30) — surf in, ride up to the
  sand shore, which is the pond's ledge-band level. Coral Approach's
  channel falls (12,20) rides horizontally by the same rule; a latent
  authoring bug there (the falls claim shadowed by the shallows rule)
  was fixed in passing. **Live-proved** on Route 1 (probe (24,29)).

## 5. Deep Dive (the underwater layer)

- **Ported base (pokeemerald):** `src/field_control_avatar.c`
  (`TrySetDiveWarp` / `TryDoDiveWarp` / `SetDiveWarpDive` /
  `SetDiveWarpEmerge`) — a dive spot is a two-way door: confirm on a
  deep patch to go down, confirm on a bright spot to come up; the
  verb verdict (Deep Dive, S-3 context seam) is required both ways.
  Underwater movement is ordinary movement on a paired map;
  seaweed is the encounter ground (RSE's dive grass). The DS-era
  palette rule: blue-shift + light falloff with depth.
- **Our seam:** tile `DIVE_SPOT 52` + a per-map `diveLinks` pairing;
  `interact()` on a spot performs the warp. The paired map
  `boot_bay_deep` ("Boot Bay — Dive Area") carries `underwater:
  true`, which routes it out of the day/night tint into the depth
  palette (overlay 0x0a4a72 at 0.34 over a shallow-water seabed), per
  the interior light law's own logic. Seaweed `SEAWEED 51` is a drawn
  ground type (dark bed + strand clusters) and the encounter ground
  for the selector's new `dive` method (see §6).
  Registry rows landed with the map: music placement ("town", the
  surface bay's own row) and battle background ("water").
- **The seat, stated with its source:** Boot Bay is Region 1's only
  authored open-water map (32×20, all water, with authored current
  lanes) — the dive grammar needs a real surface to pair with, and
  the Garden/pond waters are enclosed set-pieces whose records do
  not carry a dive area. The Sootopolis pattern (one dive area
  serving several surfaces) is followed: Boot Bay Deep also receives
  the Cave of Echoes pool (§7's air pocket).
- **On-top expansion (ours):** the dive area is one shared layer for
  the whole region's dive spots (Boot Bay's two patches + the cave
  pool), where the source pairs each dive map 1:1 with its surface.
- **Live-proved:** the full round trip — current-lane ride to the
  spot, dive to (6,11) in the deep, emerge back to (8,9) — probes
  exact at all three points, frames at all three states.

## 6. Wave (surf), end-to-end — the dependency of §4 and §5

State of the truth, plainly: water traversal WAS already a working
movement mode in this tree before part 2 (the S-3 Wave gate lets the
step onto water; the standing chain carries currents; the falls and
dive work above all stand on it — and the dive proof's route crosses
Boot Bay's authored south current lane, which carried the player as
the source's chain says). What part 2 added: (a) the bike's
dismount-on-entry avatar transition; (b) the encounter consumers —
stepping in deep water-family tiles rolls the selector's `surf`
method, stepping on seaweed rolls its new `dive` method
(`src/lib/encounters.ts` method union extended), both through the
one single-sourced selector, no second table read; shallows never
roll (the source's rule); underwater maps are excluded from the surf
roll (seaweed is their ground). The consumers are wired and
exercised in the live proofs (the surf rolls run on every pond/bay
step). What they roll AGAINST is the game's data state, recorded in
LANDING-RECORD-2 §7: the only surf/fish tables in the game's data
are keyed to a zone id that is not a map, with `rate: null` — so no
surf or dive battle can fire until the encounter-binding work binds
a table to a real map. That binding is species-content placement,
which this lane was ordered not to invent; the traversal side is
complete and empty-table-safe (unit-tested as null, not assumed).

## 7. Part-1 engine-only leftovers, placed

- **Spin + conveyor — Dojo 1 (the Core Gate):** two spin tiles on
  the mat ((5,5), (10,5)) and a north conveyor pair ((7,13), (7,14))
  feeding the lane in front of Acolyte Ken. A dojo is the grammar's
  home (emerald's gym interiors carry the same devices).
  **Live-proved** for the conveyor: one press onto the belt carries
  the player to (7,13), face-to-face with Ken — his dialog opens,
  and dismissing it advances into his trainer battle, which only
  triggers from that tile (frames in LANDING-RECORD-2 §5; the save
  probe read the stale seed value under the open dialog, as the
  record there explains).
  The spin tiles run on the same chain code the conveyor proved live
  and are unit-proved on the real map (traversal2.test).
- **The cave pool air pocket:** the Cave of Echoes deep pool
  (x14–22, y22–26) was sealed inside rock in the authored map; its
  shores are opened (north row + west column) and it carries a dive
  spot (18,24) linked into Boot Bay Deep — surfacing from the deep
  into a cave is the §5 seat's second door, placed because the
  geography carries it (an enclosed underground water table is the
  region's one honest air pocket).
- **Snow — no Region 1 seat exists, and none was faked.** Region 1's
  authored climate is temperate coast (Boot Harbor, routes, garden);
  no map's record supports snow terrain. Engine + renderer state it
  ships at: part 1's complete state — the cost rule in
  tileBehaviors, the Platinum s_snow02 texture wired in the canvas,
  unit-proved. It lands placed the first time a snowfield map is
  authored; there is no traversal work left for it.
- **Mud — engine-complete, cost class live, no new placement
  claimed.** Mud is part 1's cost terrain (same rule as snow/deep
  sand); Region 1's authored wet places are the bay, the pond, and
  the cave pool — all water, not mud banks — so no mud tile was
  painted onto a map that does not describe one. The bike's muddy
  slope (the mud family's other member) IS placed and proved
  (Route 2, §2).

## 8. The depth standard, applied (the eye-verdict's work)

- **Ledges (part 1's rejected strip, re-drawn first):** the flat
  full-tile cliff stamp is gone. A ledge/cliff cell now composes:
  the plateau texture's crest as a lip sprite overlapping the row
  above's foot, the kit cliff texture re-seated as a FACE (bottom
  band, 0.74 tile at Gen-5 relief, foot on the tile's bottom edge),
  shading bands across the face's foot, and a three-band shadow
  under the lip on the ground below — all drawn at render from the
  kit's textures; the art itself carries no baked shadow.
- **Climb faces** wear the same composition with a rock crest
  (`climb_lip.png`). **Falls** get the crest + scroll + foam
  composition (`falls_crest.png`). **Boulders/rocks** draw as world
  objects (1.20× wide, 1.24× tall, foot on the tile's bottom,
  rising into the row above) with a render-time contact shadow.
  **Dive edges:** the surface spot reads as a dark deep patch with a
  pulsing light ring; under water the same spot is the bright column.
  Layer order: canopies/roofs and the falls crest join the actor
  depth sort, so the player reads as IN the height.
- **Composed art** (all pixels from held kit textures, value
  multiplies only; method + hashes in LANDING-RECORD-2 §4):
  `ledge_lip.png`, `climb_lip.png`, `falls_crest.png`.
- **A renderer bug this standard exposed, fixed:** device motifs
  drawn in the ground-graphics pass are buried under any tile that
  carries a texture sprite. The part-2 motifs (currents, spin,
  seaweed, dive spots, rails, slopes, switches, gates) now draw in
  the foreground pass that lands above the ground sprites and below
  the actors. The seaweed and the dive column were invisible until
  this was fixed; the final underwater frame is the receipt.

## 9. Names and owner slots touched by this lane

None decided. The bike's display name ships as the flagged DRAFT
"Trail Bike (DRAFT NAME)" (internal id `bike`, neutral). Technique
acquisition (which event grants which verb) is untouched — the S-3
flags are the seam, and they are grantable today by
`setTechniqueFlag`; writing the fiction that grants them is story
content for the owner/other lanes, not traversal work.
