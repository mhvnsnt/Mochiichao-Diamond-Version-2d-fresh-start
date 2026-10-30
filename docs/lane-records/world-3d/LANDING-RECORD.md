# LANDING RECORD — 3D World lane (2026-10-30)

Owner order (Jamar, 2026-10-30 ~09:54 CDT): "Well we need to do
that, and leave our 2d world we are progressing from as options to
revert back to in setting, to switch between all gens graphics.
But get the 3d world assets wired up 100%"

This lane built, in its own tree (`~/workspace/world-3d/tree/`,
copied from `~/workspace/landing-composition/tree/`): a working
NSBMD/NSBTX port, one Region 1 area (Boot Harbor) rendering as
real 3D polygons in the game's own web stack, wired as the top
(Gen 5) value of the EXISTING style-profile registry — plus the
census (MODEL-CENSUS.md) and the authoring recipe (§5) so the
remaining areas follow by data, not by new code.

## 1. What was built (real files, real changes)

- `tools/nsbmd_convert.py` + `tools/nsbtx_decode.py`
  (`~/workspace/world-3d/tools/`) — the format port. No NSBMD
  parser existed in the held corpus; both tools were written from
  the format as held and validated on held files (census §4).
- `src/lib/styleProfiles.ts` — one additive field on the existing
  registry: `world.renderMode: 'model3d' | 'layered'`. GEN5 =
  'model3d'; GEN4–GEN1 = 'layered'. No existing value, label, or
  string changed. The switcher stays exactly one axis (flatness vs
  3D read); no colour/lighting/quality value exists in the 3D path
  to change (see §4, tensions).
- `src/lib/world3d/areaData.ts` — the area registry
  (`WORLD3D_AREAS`, `getWorld3DArea(mapId)`), mirroring the
  source's own area-data shape (census §2): land chunk + land
  offset, texture-set bindings, water texture list, building
  placements. Boot Harbor (`sector0`) is the one authored area.
- `src/lib/world3d/camera.ts` — tile↔world mapping (1 tile = 16
  world units, map centred at origin) and `hgssFieldCamera`:
  pitch 52°, FOV 42°, distance 195 — the HGSS field-camera shape
  (distance/pitch/perspective, target on the player; census §3),
  distance tuned on real captures.
- `src/lib/world3d/glRenderer.ts` — a raw WebGL2 renderer (the
  shipped stack has no 3D library; adding one was unnecessary).
  Textured triangle draws with the DS wrap/flip rules per
  material, texture-only flat shading (no lighting pass — the
  held textures carry their authored shading), alpha-tested
  cutouts, water materials blended with a UV scroll (the web
  equivalent of the field texture-cycle animation, census §1.8),
  render-time blob shadows under actors (no baked shadows
  anywhere), camera-facing actor billboards sorted far-to-near.
- `src/components/game/World3DCanvas.tsx` — the 3D presentation
  component. Same props contract as the 2D canvas; actor
  resolution mirrors the 2D path exactly (same slots, sheet
  cells, walk/idle rules, creature walk frames, fallback colour
  figure where the 2D path draws its placeholder).
- `src/components/game/PixiWorldCanvas.tsx` — the ONLY shared
  file touched: the props type was extracted and exported, the
  original component kept intact as the internal 2D renderer,
  and the default export is now a thin wrapper that reads the
  persisted style profile: profile 'model3d' AND an authored
  area for the current map → World3DCanvas; anything else → the
  untouched 2D component. WorldEngine and CreatureModeView
  imports unchanged. Maps with no authored area (incl. all of
  Creature Mode) render 2D under every profile.
- Assets staged in-tree at `public/assets/world3d/boot-harbor/`
  (340K): converted land + 4 building JSONs and their PNG
  textures, produced by the tools above from the held files.

## 2. The proof (real game scene captures — `~/workspace/world-3d/proof/`)

All captures are the real game (this tree's build, served
locally), driven through its own title/load flow. Every capture
was eye-checked by this lane before being kept.

- `boot-harbor-before-2d.png` — Boot Harbor at spawn (15,18)
  under a down-profile (2D path): dock, path row, Mochii on the
  dock, water south.
- `boot-harbor-after-3d.png` — the SAME position under GEN5:
  the held Diamond coastal chunk as textured polygons, HGSS
  camera, player sprite standing in the 3D ground plane on the
  model's plank bridge at the right scale, dock Mochii billboard
  at the water's edge, HUD identical.
- `boot-harbor-3d-walked.png` + `boot-harbor-3d-town.png` —
  grid movement under 3D: the player walked west along the path
  row and the living-world witnessed scene fired (dialog, then
  its choice menu: STEP IN AND FIGHT! / KEEP WALKING / BLOCK THE
  FISHER'S PATH) — movement, events, and choices run unchanged
  on the 3D presentation. `boot-harbor-3d-dialog.png` is the
  same sequence after dismissal.
- `boot-harbor-3d-lab.png` — at (10,5): HGSS buildings in the
  world, textured (house front with windows in the foreground,
  a second roof behind), the lab Mochii beside the player.
- `boot-harbor-3d-plaza.png` — at (15,10): the plaza frame;
  Hex's billboard overlaps the player's (see §4.3).
- `water-a.png` / `water-b.png` — same position 2.2s apart:
  8.9% of sampled pixels in the water region changed (the water
  UV scroll animating); whole-frame change 3.2% (water + idle
  animation only).
- THE FLIP, through the real Settings UI (`flip-1/2/3`): world
  at GEN5 (3D) → pause → Quit to Title → main-menu SETTINGS →
  VISUAL STYLE row cycled (row value read on screen: "GEN 5 ·
  BW2" → "GEN 1") → SAVE + BACK → persisted
  `mochiichao_settings_v1`.visualStyle = GEN1 (read back) →
  CONTINUE → same save, same spawn → `flip-2-gen1-2d.png` is
  the flat 2D presentation of the identical spot. Cycled back
  the same way (row "GEN 1" → "GEN 5 · BW2", persisted GEN5) →
  `flip-3-gen5-3d.png` is the 3D presentation again. One
  Settings note: a single arrow press on that row moves GEN5→
  GEN1 — the row's cycle order/wrap is the shipped screen's own
  behaviour, not this lane's.
  Settings in this build lives on the title main menu, not the
  pause menu — that is the game's existing navigation; the
  profile applies on return to the world with no map reload,
  exactly as the screen's own note promises.

## 3. Receipts (run on this tree, 2026-10-30)

- `tsc --noEmit` — clean (exit 0).
- `vitest run` — 463/463 passed, 34 files, including the
  switcher's own `styleProfiles.test.ts` (8 tests) — the
  registry extension kept every existing profile test green.
- `vite build` — OK; the world3d assets are in `dist/`.
- The proof drives ran against that build.

## 4. Provenance and the honest state of each piece

Per-set provenance is in MODEL-CENSUS.md (§1, §5). In short:
land = Diamond `narc_0000` (sha256 in census), textures = its
coverage-paired texset `narc_0053` decoded by this lane
(including the 5 textures the env lane's decoder couldn't do);
buildings = HGSS `bm_field_0020/0021/0022/0023` with embedded
textures. Conversion grades: land material binding = dictionary
order, UV-verified; building binding = the recorded `fit`
heuristic (the SBC stream that binds shapes to materials in the
source is not held — census §4.3); `wk_labo_c`'s texture is the
area-data substitution `wk_labo_b.png`, recorded in the area
registry. Two HGSS files (`en_yake`, `en_suzu`) convert to 0
triangles — a converter path not yet emitted; they are not used
by the proof area.

Composition seams, stated plainly (these are properties of the
proof pairing, not hidden defects):

1. Boot Harbor's LOGIC (tiles, gates, NPCs, events) is the
   game's own 32×28 map; the 3D VISUAL is one held Diamond
   chunk (36×36 incl. overhang) placed under it. Where the
   chunk's terrain (its river, its cliffs) doesn't match the
   map's tile story, actors stand at logic height (feet on the
   map plane) while the model relief varies around them. A
   per-area authored chunk (recipe §5) is how a finished area
   removes this seam; the proof's job was to prove the pipeline
   end-to-end on real models, which it does.
2. Buildings sit at HGSS-authored scale ×0.5 (their grid reads
   32 units/tile; ours is 16) so footprints match the map's
   building blocks. From some southern viewpoints the chunk's
   own cliff/tree geometry partly occludes the northern
   buildings' walls (their roofs and shadow planes stay
   visible) — again, a property of this chunk pairing.
3. NPCs whose atlases are the RGB "core100" sheets (e.g. Hex)
   carry an opaque light-grey cell background in the SOURCE
   art; their billboards show it as a light box. The 2D path
   draws the identical cell with no keying (verified in
   `pixiSheet.ts` and visible at the top edge of
   `flip-2-gen1-2d.png`), so this is parity with the shipped
   game, not a 3D regression — fixing the atlas art itself is
   game-art work outside this lane.
4. Not carried into the 3D presentation: the 2D canvas's
   painted world label and its day/night overlay. The HUD
   (which carries the location/time text) is DOM and identical.
5. **Owner tension — BW2:** there are no Gen 5 model bytes on
   disk (census §1.7). GEN5-as-top-of-the-axis is therefore
   honoured as presentation (the 3D read lives at the Gen 5
   end of the dial, per the owner's order), built from held
   Diamond/HGSS models; BW2's own contribution remains
   camera/staging direction from the disassembly. If the owner
   wants literal BW2 models, they have to be pulled in first —
   none exist locally to wire.
6. **Protected axis:** not crossed. The 3D renderer applies no
   lighting model, no colour shift, no quality scaling — flat
   texture colour exactly as authored, same clear colour as
   the 2D canvas. The only axis the profile moves is the one
   the registry already owns: flat ↔ 3D.

## 5. The authoring recipe (how any other map gets its 3D)

Mirroring the source's area-data shape (census §2). For a map
to render in 3D under GEN5 it needs ONE registry entry in
`src/lib/world3d/areaData.ts`:

1. **Land:** pick the held chunk whose shape best matches the
   map (census §1.1; convert with
   `tools/nsbmd_convert.py <chunk.nsbmd> land.json`) and set
   `landUrl` + `landOffset` so the chunk's ground plane (raw
   y=16) sits at world y=0 and the chunk covers the map's tile
   rectangle (1 tile = 16 units, map centred at origin —
   `camera.ts` does the maths).
2. **Textures:** pick the texset by texture-name coverage
   against the chunk's texture list (the source's own rule);
   decode with `tools/nsbtx_decode.py` into the area's `tex/`
   folder; list any name→file exceptions in `texFiles`.
3. **Water:** list the material texture names that are water
   in `waterTextures` (they get the scroll + blend).
4. **Buildings:** convert each wanted HGSS building with
   `--bind fit`, decode its embedded textures into `btex/<id>/`,
   and add placements `{ model, tile, scale }` — tile = the
   building's anchor tile on OUR map, scale 0.5 for HGSS
   buildings on a 16-unit grid.
5. Stage the folder under `public/assets/world3d/<area>/` and
   add the entry keyed by the map's id. No code changes: the
   wrapper picks the area up by map id, and every other profile
   keeps rendering the map in 2D.

## 6. How this tree composes with the traversal lane's tree

Both lanes forked from the same `landing-composition` base.
The only shared file is `src/components/game/PixiWorldCanvas.tsx`:

- Traversal lane's version: the 2D component with its
  built-up-face 2.5D presentation work (the GEN4-and-down
  steps of the same dial).
- This lane's version: the same 2D component, body untouched,
  renamed internal, plus the wrapper + the world3d modules.

At landing, take this lane's wrapper file and the traversal
lane's component body together: the wrapper dispatches GEN5+
authored-area → World3DCanvas, everything else → the 2D
component (theirs). `src/lib/styleProfiles.ts` likewise
composes additively: this lane added only the `world.renderMode`
field; any traversal-side profile fields land beside it. No
other file overlaps: this lane's remaining work is new files
(`src/lib/world3d/*`, `World3DCanvas.tsx`,
`public/assets/world3d/*`) that cannot conflict.

## 7. Shared-state note

Proof drives ran in the shared Playwright profile
(`~/workspace/env-pullin-hgss-bw2/pw-profile`). When all
captures were finished, the save was restored to the traversal
lane's original position — read back and confirmed:
`currentMap = route_1`, `playerPos = {x: 20, y: 8}` (the
persisted visualStyle was left at GEN5, the game's own default).
The proof folder was cleaned to the captures listed in §2.
