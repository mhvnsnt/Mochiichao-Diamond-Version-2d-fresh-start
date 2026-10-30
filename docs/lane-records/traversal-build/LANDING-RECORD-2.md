# LANDING RECORD 2 — traversal completion, part 2 (2026-10-30)

**Order:** Jamar, 2026-10-30 ~09:49 CDT — get every remaining
traversal item fully wired (code + visuals + placed + proven),
"boulders into holes and onto switches," bikes, climbing, waterfall
rides, diving; plus the eye-verdict steer (~09:51 CDT, the built-up
2.5D standard), the expansion order (~09:52 CDT, ported base first,
expansion on top, layers kept separate), and the fill-gaps broadcast
(~11:22 CDT).
**Tree:** `~/workspace/traversal-build/tree/` (part 1's tree,
continued; no other lane's tree edited; nothing pushed — the landing
train composes this tree).
**Census:** `~/workspace/traversal-build/TRAVERSAL-CENSUS-2.md`.

## Receipts (run, not claimed)

- `npx tsc --noEmit` — **clean**, exit 0 (run at every stage; final
  tree included).
- `npx vitest run` (full suite) — **527 tests passed, 527**;
  36 of 37 test files pass. Baseline entering part 2: 492 green
  (part 1). **+35 new** in `src/lib/traversal2.test.ts` (boulder
  rules, bike rules, climb/cascade resolvers, and full simulations
  on the real authored maps); one part-1 test amended (Route 1
  (18,11) is a climb face now, not a ledge — the test asserts the
  new truth). **The one failing file is pre-existing and not this
  lane's:** `src/assets/sprite-atlases/animation/treatments/battleTreatments.test.js`
  is a CommonJS file (`require`/`module.exports`) inside a
  `"type": "module"` package; it fails collection under vitest and
  under plain node identically. It is a battle-treatments asset
  test; nothing in this lane touches it.
- `npx vite build` — **clean** (the usual >500 kB chunk warning
  only). Final proof build chunk: `assets/index-BJftaqV1.js`
  (dive + climb re-proved on it); the movement scenes ran on
  `assets/index-BkV62VyG.js`, identical source except the canvas
  motif-layer fix (see §4), with the full unit suite green on the
  final source.
- Live proof: Playwright drives with real keys into the built dist;
  position evidence read from the game's own save (F5 → the
  `mochii_saves_1` slot). Every drive carries a **build-identity
  guard** (served chunk must equal `dist/index.html`'s chunk; abort
  otherwise). See §5 for every scene's probe result and frames, §6
  for the port incident that made the guard necessary.

## 1. What was built (files)

- **`src/lib/boulders.ts` (new)** — the push-boulder object system:
  `tryPushBoulder` (one-tile push; hole → falls in and fills with
  the map's authored `boulderFloor`; switch-rest detection), blocked
  set (map edge, solids, water family, doors, NPC cells, another
  boulder), `switchesHeld` (boulder/player/NPC occupants),
  `isLooseBoulderOverride` (emerald's reload rule: loose positions
  reset on map entry; hole-fills persist).
- **`src/lib/bike.ts` (new)** — ride modes and rules: `BIKE_ITEM_ID
  "bike"`, `BIKE_DRAFT_NAME "Trail Bike (DRAFT NAME)"` (flagged in
  code), `MACH_FULL_CHARGE 3`, `stepIntervalMs`, `crossesCrackedClean`
  (Mach at full charge only), `canClimbSlope` (Mach full or Acro),
  `tryAcroHop`.
- **`src/lib/tileBehaviors.ts`** — added `resolveClimb`,
  `resolveCascade`; DIVE_SPOT joins the water family (current chains
  and water rules treat a dive spot as the water it is drawn on).
- **`src/world/WorldConstants.ts`** — tiles ROCK_CLIMB 50, SEAWEED
  51, DIVE_SPOT 52, HOP_RAIL 53, SLOPE 54, FLOOR_SWITCH 55,
  SWITCH_GATE 56 (+ the `metatiles.ts` PASSABLE mirror; gate 56 is
  conditionally passable through `switchesHeld`).
- **`src/world/maps/FullWorldMaps.ts`** — all placements (§3) and
  the new `BOOT_BAY_DEEP` map; map fields `boulderFloor`,
  `diveLinks`, `underwater`.
- **`src/world/WorldEngine.tsx`** — ride state + KeyC cycling with
  refusal notices; move() part-2 branches (Crag Climb ride,
  Cascade up-gate with the on-water precondition, falls down-ride
  bypass, switch-gate bump, Acro hop, slope refusal, Mach cracked
  rule, Mighty Push via boulders.ts, auto-dismounts on doors and
  water entry); map-entry effect clearing loose-boulder overrides;
  Mach charge bookkeeping in a position-watching move wrapper
  (build on same-direction consecutive steps, shed to tier 1 on a
  turn, shed to 0 on any press that moves nothing — a bump);
  surf/dive encounter consumers after the grass roll; interact()
  dive/emerge; canvas props (rideMode, switchesPressed).
- **`src/components/game/PixiWorldCanvas.tsx`** — the built-up
  composition for ledge/cliff (9) and climb (50); the scrolling
  falls with crest and foam (17); boulders/rocks (15/26) drawn as
  raised objects with render-time contact shadow; motifs for 51–56
  drawn in the foreground pass (see §4); the player-on-bike figure
  (spoked wheels, frame, Mach red / Acro blue, rider lifted, contact
  shadow, no baked shadow anywhere); the underwater depth overlay;
  fx raise heights for hop/climb/cascade/dive/emerge.
- **Art composed** (method + hashes in §4): `public/assets/hgss/`
  `ledge_lip.png`, `climb_lip.png`, `falls_crest.png`.
- **Registry:** `src/lib/musicPlacement.ts` + `src/data/core/
  map-battle-bg.json` rows for `boot_bay_deep`.
- **Tests:** `src/lib/traversal2.test.ts` (35 tests).

## 2. Provenance — ported base vs on-top expansion, per system

| System | Ported base (source → seam) | On-top expansion (ours) |
|---|---|---|
| Push boulders | pokeemerald `field_player_avatar.c` TryPushBoulder + `fldeff_strength.c` → `src/lib/boulders.ts`, gated by the existing S-3 Mighty Push verdict | Switches held by ANY occupant (boulder/player/NPC) as a map-level rule feeding any number of gates |
| Bikes | pokeemerald `bike.c` + avatar bike transitions (Mach charge/cracked/muddy-slope, Acro hop) → `src/lib/bike.ts` + WorldEngine ride state; gear-switch follows the Gen 4 one-bike pattern carrying both RSE behaviour sets | Acro hop widened to side-on ledges and one-tile holes |
| Crag Climb | pokeheartgold `field_move.c` FieldMove_CheckRockClimb + `metatile_behavior.c` climb behaviours → `tileBehaviors.resolveClimb` + tile 50 | Direction-general faces (one rule, any orientation); faces as two-way shortcuts inside ledge bands |
| Cascade | pokeemerald waterfall avatar path (up = verb, down = free on water) → `resolveCascade` + the Cascade gate branch | Horizontal falls rides (Coral's channel falls) on the same rule |
| Deep Dive | pokeemerald `field_control_avatar.c` dive/emerge warps → `diveLinks` + tile 52 + `boot_bay_deep` | One shared regional dive layer serving Boot Bay AND the cave pool (the Sootopolis pattern generalised) |
| Wave encounters | emerald surf-roll on deep water → WorldEngine consumers via the single-sourced selector; `dive` method added to the union on RSE's seaweed rule | — (no expansion claimed) |
| Depth visuals | HGSS built-up cliff set composition (lip + face + foot shading) from the kit's textures → PixiWorldCanvas | Render-time three-band lip shadow, object-ified boulders, crest/foam falls composition, drawn motifs for the new device tiles |

## 3. Placements, with the Pokémon pattern each follows

| Placement | Where | Pattern |
|---|---|---|
| Boulder-into-hole path | Cave of Echoes junction: hole (14,20), boulder (17,20), `boulderFloor` = cave floor | Emerald's Strength rooms (Granite Cave / Seafloor Cavern): three pushes along a corridor, the hole fills, the filled cell becomes the two-way floor; from the shaft side an unfilled hole is the drop back to the entrance (5,2) — no soft-lock: Neon City is reachable without the cave at all |
| Boulder-on-switch gate | Scrap Junkyard cache pen: lane boulder (18,17) → mouth hole (18,20) → pen interior; inner boulder (18,22) onto floor switch (19,22) holds gate (19,21) open into the cache nook | The switch-gate pen: the source's floor-switch doors (emerald's Trick House / gym switch rooms) — the puzzle is two-stage: earth first (fill the mouth), then weight (hold the switch) |
| Climb faces | Route 1 ledge bands at (18,11) and (20,28) | HGSS: a face placed inside existing elevation reads as a shortcut home, visible from below before the verb opens it |
| Falls | Route 1 pond (24,30); Coral Approach channel (12,20), pre-authored | Emerald's pond falls: the falls sits at the water's head; riding it reaches the shore at the upper level (the pond's ledge-band sand) |
| Bike grammar road | Route 2 (Harbour Road): slope band y8 x12–16, hop-rail row y14 (gap at x14), cracked stretch y24 (sound centre x14), `dropTarget` (14,38) | RSE's cycling-road grammar compressed onto one route: climb (slope) → hop line (rails) → speed test (cracked floor with a fall beneath). The signpost at (14,10) stands at the slope's foot, where the source puts its warnings |
| Dive spots | Boot Bay (8,9) and (24,14); Boot Bay Deep return spots (6,10)/(24,10) + cave door (15,4); Cave of Echoes pool (18,24) | RSE dive grammar: dark deep patches in open water; the deep map's spots sit offset from arrival exactly as the source pairs them; the cave pool is the Sootopolis-style second surface |
| Spin + conveyor | Dojo 1: spin (5,5), (10,5); conveyor N (7,13), (7,14) | Gym-interior devices (part 1 census): the belt feeds the student lane in front of the acolyte |
| Snow / mud | **Not placed** — census-2 §7 states per type why (no honest Region 1 seat for snow; mud's seat maps are water, not banks) and the engine/renderer state each ships at | — |

## 4. The depth work (eye-verdict standard) and the motif-layer fix

**Composition method** (`scratch/compose_art.py`, PIL): every output
pixel comes from a held kit texture; the only operations are crops,
scaling, and value multiplies (lighting), so no colour enters that
the kit does not have. Inputs (sha256 prefixes): HGSS grass cliff
`b50eaa9965391145`, cliff `41837da91ba537ea`, cliff_b
`65c3979de391cc8b`, rock `1b9f2b1b44033c0e`, water
`5c5b9273ea23a918`, BW2 falls foam `83b877cce9aecb11`.
Outputs: `ledge_lip.png` sha256
`8f149aca2e55636420610510c9b326c7e718111c35c87a018a5ee0e593f2dc5c`;
`climb_lip.png` `ebe7ab20b0f562de626714c1bc60f3e96e37615723e2d6e27c851ecda985d89a`;
`falls_crest.png` `0a4dcfc44d40c6a7612d475514bf3ebe36b985c473e2d6beda51d6c02e6865df`.
Renderer composition per piece is described in census-2 §8. No
shadow is baked into any art; every shadow (lip bands, boulder
contact, bike contact, gate plate) is drawn by the renderer.

**The motif-layer fix (found by eye-verifying my own proof):** the
first underwater frame showed no seaweed and no dive column. Cause:
the device-motif ladder drew into the ground graphics pass, which
renders UNDER the tile texture sprites — any tile carrying a texture
(51 seaweed and 52 dive spot ride the shallow-water texture) buried
its motif. The hole (43), the surface dive ring, and the rails
showed only because their tiles have no texture sprite. Fix: the
part-2 motif branches (currents 46–49, spin 45, seaweed 51, dive
spot 52, rail 53, slope 54, switch 55, gate 56 — 30 drawing calls)
moved to the foreground pass, which lands above the ground sprites
and below the actors. The same fix also re-bound the deep map's
rock cells (tile 1) from the green `rock_water.png` to
`/assets/hgss/rock.png`, so reef reads as reef. The re-shot
underwater frame is the receipt (§5).

**Honest read of the depth frames:** the depth layering works —
plateau surface, patterned face row, foot shadow, and actors on
different levels read in one frame (`p2-route-depth.png`,
`p2-climb-mid.png`). The face texture still reads somewhat regular
at full-map zoom; the owner's eye is the final judge of the 2.5D
bar, and the polygon step above this one is the 3D programme's
(census-2 scope note).

## 5. Proof inventory (real keys, real scene, save-probe positions)

All drives: `proof/drive5.cjs` / `drive7.cjs` / `drive8.cjs`;
logs `proof/drive6-*.log`, `proof/drive7-*.log`, `proof/drive8-*.log`.
Zero page errors across every scene. The harness grants the S-3
flags and a performer by editing the save slot (the same store
fields any acquisition fiction will write — §7), seeds each scene's
start, then drives with keyboard only.

| Scene | Probe result (expected → got) | Frames |
|---|---|---|
| Cave boulder | start (14,20) → 3 pushes → boulder in the hole at (14,20), hole filled, player standing on the filled cell | `p2-boulder-before.png`, `p2-boulder-after.png` |
| Junkyard pen | lane → `scrap_junkyard (18,21)` inside the pen; nook `scrap_junkyard (20,21)` through the held-open gate | `p2-pen-lane.png`, `p2-pen-switch.png`, `p2-pen-inside.png`, `p2-pen-nook.png` |
| Bike hop | mounted on Route 2, Acro gear → `route_2 (13,13)`, north of the rail row | `p2-bike-mounted.png`, `p2-bike-hop-before/mid/after.png` |
| Slope, full charge | (13,12) → rode north building charge → `route_2 (13,8)` on the upper level | `p2-slope-before.png`, `p2-slope-after.png` |
| Slope, no charge | (13,9) → one press north → stayed `route_2 (13,9)` (refused) | (probe is the proof) |
| Cracked, full charge | (13,28) → `route_2 (13,24)`, standing on the crack unbroken | `p2-cracked-full.png` |
| Cracked, low speed | crossed, stepped off, re-entered → floor broke → dropped to `route_2 (14,38)` | `p2-cracked-low.png` |
| Climb | (18,12) → one press → `route_1 (18,10)` on the plateau | `p2-climb-bottom.png`, `p2-climb-mid.png`, `p2-climb-top.png` (top caught a wild battle on the plateau grass — itself the arrival's corroboration) |
| Falls | surfed the pond → rode up → `route_1 (24,29)` on the sand | `p2-falls-before.png`, `p2-falls-ride.png`, `p2-falls-after.png` |
| Dive round trip | Boot Bay spot `boot_bay (8,9)` → deep `boot_bay_deep (6,11)` → emerge `boot_bay (8,9)`; the route crosses the authored south current lane, which carried the player per the chain rule | `p2-dive-spot.png`, `p2-underwater.png`, `p2-emerged.png` |
| Conveyor (part-1 placement) | (7,15) → one press → carried to the belt's north tile `dojo_1 (7,13)`, stopped by Acolyte Ken — proved by the frames (player at the belt's top with Ken's dialog open; a re-run's dismissal taps advanced Ken into his trainer battle, which can only trigger face-to-face). **Probe caveat:** the save probe read the seed value (7,15) in both runs — Ken's dialog/battle screen was open when the probe ran, so the quick-save read came back stale. This is the one scene whose probe is not position evidence; the frames are. | `p2-conveyor-before.png`, `p2-conveyor-after.png`, `p2-conveyor2-carried.png`, `p2-conveyor2-dismissed.png` (battle) |
| Depth standard | static Route 1 view | `p2-route-depth.png` |

**Frame eye-verdicts (mine, before the owner's):** boulder-before
PASS (hole, object-boulder with contact shadow, pool ring). Bike
PASS (rider on the drawn bike; rails and cracks read). Falls GOOD
(arrival on the sand; the falls strip reads between shore and pond).
Underwater PASS after the §4 fix (seaweed meadow patches, reef
rock, the dive column's light ring at the arrival spot). Pen frames:
function proved; the pen's authored wall scatter is the map's
pre-existing art (green bush rows) and the warp pad reads as a flat
purple square — that art predates this lane and was not re-authored
here; stated so the frames are not mistaken for this lane's visual
standard. Route-depth MIXED (see §4's honest read).

## 6. Process findings worth keeping

- **The port war.** Port 4399 was held by another lane's preview
  server (rooted at that lane's tree). Drives ran "successfully"
  against the wrong build for three rounds — sibling S-3 gates
  existed there, part-2 branches did not, and the gate dialogs were
  the only tell. All frames from those rounds were discarded. Every
  drive now carries the build-identity guard (§Receipts) and the
  lane's server runs on port 4417 rooted at this tree's dist. The
  finding is also in WORKPLAN-2.md.
- **Flag keys are slugs.** The S-3 technique flags key as
  `tech.<slug>` (`tech.mighty_push`, `tech.wave`, `tech.cascade`,
  `tech.deep_dive`, `tech.crag_climb`) — `fieldTechniques.ts`'s `T()`
  slugifies the display name. Early drives seeded display-name keys
  and every gate correctly refused. Any acquisition fiction must
  write the slug keys (via `setTechniqueFlag`, which does).
- **The real load flow of this build** (for future drives): intro
  movie (any key steps it) → title → CONTINUE → SELECT A SAVE FILE;
  an occupied slot's button is **START OVER ►** → confirm dialog →
  **Load this save**. A full-drive save must carry a complete party
  instance (`hasStarter` derives from `party.length > 0`).
- **Charge-shed approximation, stated exactly:** the bump rule is
  exact for presses resolved inside `move()`. Map-edge EXIT
  transitions apply their landing position by a 400 ms timer in the
  existing exit code, outside the wrapper's before/after read — so
  riding Mach across a map exit sheds the charge at the border.
  Doors apply synchronously and keep it. This is the one place the
  port's charge is conservative rather than exact.

## 7. What is not this lane's, routed with its owner

- **Surf/dive encounter TABLES.** The traversal consumers are wired
  and live (§census-2 §6). The game's data (
  `src/data/core/encounters.json`) holds its only surf (4 slots) and
  fish (3 slots) tables under mapId `pond-route-01` with
  `rate: null`; no data maps that zone id to a real map, and the
  world-map mirror skips non-map ids — so `tableFor("boot_bay",
  "surf")` and `tableFor("boot_bay_deep", "dive")` return null today
  (unit-asserted). Binding a table to a real map is species-content
  placement: owned by the encounter-binding work; this lane was
  ordered not to invent species tables, and inventing a rate would
  be the same invention. The grounds are complete, and honestly
  empty until that binding lands.
- **Technique acquisition fiction.** `hmReward` has no consumer in
  this tree (pre-existing S-3 state, not part 2's build): nothing
  yet grants the verbs in play. The grant seam (`setTechniqueFlag`)
  exists and is what the proof harness writes. Who grants Mighty
  Push / Wave / Cascade / Deep Dive / Crag Climb, and where, is
  story content — the owner's fiction, another lane's wiring.
- **Acro rail-RIDING** (travelling along a rail) is not built: in
  emerald, rails are object paths walked by the avatar object, and
  this tile engine has no rail-path objects. Our rails are the
  hop-obstacle grammar the placements use, and the hop is proved.
  If the owner wants along-rail travel, it is an object-system
  build, not a tile rule.
- **The bike's real name** — DRAFT ships ("Trail Bike (DRAFT
  NAME)"); internal id `bike` needs no change when he names it.
- **BW2 polygon rendering** — the 3D world programme owns it
  (census-2 scope note); this lane claims the built-up-face 2.5D
  step only.

## 8. Post-build state table — the WHOLE census (parts 1 + 2)

Every traversal type either lane has touched, at its post-build
state. "Live-proved" = driven in the built game with real keys and
a save-probe position (part 1's drives for part-1 rows, §5 for
part-2 rows); "unit-proved" = covered by the test suite on the
real authored maps.

| Type | Engine | Renderer | Placed in Region 1 | Proof |
|---|---|---|---|---|
| Ledge jump (part 1) | ✓ chain resolver | ✓ built-up face composition (part-2 re-draw) | ✓ Route 1 bands + others (part 1) | Live-proved part 1; depth frames part 2 |
| Ice slide (part 1) | ✓ | ✓ Diamond ice textures | ✓ Cave of Echoes ice room | Live-proved part 1 |
| Spin (part 1) | ✓ | ✓ motif (foreground pass, part-2 fix) | ✓ **Dojo 1 (part 2)** | Unit-proved on the real map; runs on the chain code the conveyor proved live |
| Conveyor (part 1) | ✓ | ✓ | ✓ Dojo 1 (part 1 warp-room use + **part-2 mat pair**) | **Live-proved part 2** by frames (player carried to the belt's north tile; Ken's dialog + trainer battle trigger only from there — the save probe read stale under the open dialog, §5) |
| Currents (part 1) | ✓ water-family chain | ✓ arrows (foreground pass) | ✓ Boot Bay lanes (pre-authored) | Exercised live in the part-2 dive route |
| Hole drop (part 1) | ✓ drop trigger | ✓ | ✓ Cave junction + junkyard pen mouth + Route 2 cracked drop (part 2) | Live-proved part 2 (cave, pen, cracked) |
| Cracked floor (part 1 engine) | ✓ crack-on-stand / drop-on-restand | ✓ | ✓ **Route 2 stretch (part 2)** — gains its bike consumer | **Live-proved part 2 both ways** |
| Warp trigger (part 1) | ✓ | ✓ | ✓ authored pairs + pen door (part 2) | Live-proved part 2 (pen entry) |
| Cost terrain — deep sand (part 1) | ✓ extra-press rule | ✓ kit texture | ✓ authored maps (part 1) | Unit-proved part 1 |
| Cost terrain — snow (part 1) | ✓ same rule | ✓ Platinum snow texture | ✗ **no honest Region 1 seat** (census-2 §7) | Unit-proved; placement waits on a snowfield map being authored |
| Cost terrain — mud (part 1) | ✓ same rule | ✓ | ✗ no new placement claimed (seat maps are water, census-2 §7); its system pair, the muddy slope, is placed + proved | Unit-proved |
| Push boulders (part 2) | ✓ boulders.ts on the S-3 Mighty Push gate | ✓ object-drawn boulder + hole + switch + gate | ✓ Cave of Echoes + Scrap Junkyard pen | **Live-proved** (hole fill + switch gate) |
| Floor switch + switch gate (part 2) | ✓ switchesHeld (any occupant) | ✓ plate + barrier motifs | ✓ Junkyard pen | **Live-proved** |
| Bike — Mach (part 2) | ✓ charge/speed/cracked/slope rules | ✓ drawn bike (red) | ✓ Route 2 grammar road | **Live-proved** (slope both charges, cracked both speeds) |
| Bike — Acro (part 2) | ✓ hop rules | ✓ drawn bike (blue) | ✓ Route 2 rail row | **Live-proved** (hop probe (13,13)) |
| Slope / muddy slope (part 2) | ✓ bike-gated ascent | ✓ chevron motif | ✓ Route 2 y8 band | **Live-proved both ways** |
| Hop rail (part 2) | ✓ Acro hop obstacle | ✓ rail motif | ✓ Route 2 y14 row | **Live-proved** |
| Crag Climb (part 2) | ✓ resolveClimb, S-3 verdict | ✓ built-up rock face | ✓ Route 1 ×2 faces | **Live-proved** (probe (18,10)) |
| Cascade falls ride (part 2) | ✓ resolveCascade, Wave-gated | ✓ scrolling falls + crest + foam | ✓ Route 1 pond + Coral channel | **Live-proved** (probe (24,29)) |
| Wave / surf movement (S-3 + part 1) | ✓ gate + current chains | ✓ water family | ✓ all authored water | Exercised live in falls + dive proofs |
| Surf encounters (part 2 consumer) | ✓ selector `surf` roll on deep water | — | data state: no table bound to a real map (§7) | Unit-asserted null; consumer code runs live |
| Deep Dive + dive spots (part 2) | ✓ two-way diveLinks, S-3 verdict both ways | ✓ surface ring / underwater column | ✓ Boot Bay ×2, cave pool ×1, deep returns ×3 | **Live-proved round trip** |
| Underwater layer (part 2) | ✓ paired map, surf-roll excluded | ✓ depth palette + seaweed ground | ✓ `boot_bay_deep` (new map) | **Live-proved** + frame |
| Seaweed encounter ground (part 2) | ✓ selector `dive` roll | ✓ strand-bed ground type | ✓ 36 cells in Boot Bay Deep | Unit-proved; table honestly empty (§7) |
