# MODEL CENSUS — every held 3D world asset (3D World lane, 2026-10-30)

Scope: all Nintendo DS-era 3D world material held on this machine —
models, textures, land/placement data, and the rendering-behaviour
source the port follows. Every count below was enumerated on disk
this session; hashes are spot-verifications (sha256) of the files
named. Where the earlier env-pullin record was wrong or incomplete,
this census corrects it and says so.

## 1. Model sets

### 1.1 Pokémon Diamond — land chunks (the terrain set)

- **Count:** 578 models, each `.nsbmd` + a `.bdhc` companion
  (1,156 files total in the folder).
- **Where:** `~/workspace/env-pullin-hgss-bw2/extracted/diamond/land/`
  (`narc_0000.nsbmd` … `narc_0577.nsbmd`, extracted from the Diamond
  land-data NARC).
- **Format:** NSBMD (BMD0/MDL0), no embedded TEX0 — textures come
  from a separate area texture set (§1.4). One land model = one
  32×32-tile map chunk (576×576 world units incl. overhang at the
  model's own scale; posScale 64.0).
- **BDHC:** per-chunk height/collision companion (578 files).
  Described here, not parsed by this lane: the game we ship runs its
  own tile grid for logic, so BDHC is reference data for how the
  source paired visuals with heights.
- **Spot verification:** `narc_0000.nsbmd` (model name `map03_27c`,
  coastal chunk: sea/sand/road-cross/trees, water on the south side;
  14 shapes, 1,454 triangles as converted by this lane)
  sha256 `9409f3909ae1850452580f62cf18816ee92389bb68b8e689c7bcd49648cadf92`.

### 1.2 Pokémon Diamond — buildings

- **Count:** 535 `.nsbmd` files.
- **Where:** `~/workspace/env-pullin-hgss-bw2/extracted/diamond/buildings/`
  (extracted from pokediamond `files/fielddata/build_model/`).
- **Format:** NSBMD; textures via the area texture sets, like land.
- **Spot verification:** `narc_0000.NSBMD`
  sha256 `8b2aaf318eb94bc2800c286e4ded39c15817626c40b67faa2507d85a5edec4da`;
  `narc_0001…` `6c3b80ec14fa20e9a1b6706417197e9dbebc1afbf33d163901d522de72e9584e`;
  `narc_0002…` `7ff244a72083d33009553c120d600fb44744ed90d3c569edae35ee3442ac2051`.

### 1.3 Pokémon HeartGold/SoulSilver — buildings (the set the proof uses)

- **Count:** 340 `.nsbmd` files (`bm_field_0000.nsbmd` …
  `bm_field_0339.nsbmd`; file numbering is NOT model order —
  e.g. `bm_field_0013` is a small door model).
- **Where:** `~/workspace/env-pullin-hgss-bw2/extracted/hgss/buildings/`,
  extracted from pokeheartgold's field-building NARC; the same
  models remain NARC-packed at source in
  `~/workspace/pokemon-code-study/projects/pret-pokeheartgold/files/`
  (only 2 loose `.nsbmd` sit in that tree; the rest are archive
  members).
- **Format:** NSBMD **with embedded TEX0** — each building is
  self-contained (own textures + palettes inside the file).
  posScale 8.0. Typical sizes: houses ≈117 tris, the lab ≈289 tris.
- **Spot verification:** `bm_field_0021.nsbmd` (model `wk_labo`)
  sha256 `266705bf070de35a43d75adb9af6aa76d1676f7083e92c63e08a29e2653a4600`.
- **`~/workspace/env-pullin-hgss-bw2/extracted/hgss/textures/` is
  EMPTY** (0 files) — correct, not a gap: HGSS field buildings carry
  their textures embedded, so there is no separate HGSS texset to
  extract. This corrects any reading of the env record that implies
  a missing HGSS texture extraction.

### 1.4 Texture sets (Diamond-style, shared by land + buildings)

- **Raw sets:** 58 texture-set files in pret-pokediamond at
  `files/fielddata/areadata/area_map_tex/map_tex_set/` (NSBTX/TEX0
  binaries).
- **Pre-decoded PNGs:** `~/workspace/env-pullin-hgss-bw2/extracted/diamond/texsets/`
  — 58 folders decoded by the env lane's decoder. **Correction the
  env record missed:** the pre-decoded folders are missing the same
  5 textures everywhere (`hage`, `lake`, `lakep`, `puddle_b`,
  `tshadow` — the 4×4-compressed and a3i5 ones its decoder couldn't
  do). This lane's decoder (§4) covers them; e.g. `lake` is a
  translucent blue a3i5 texture (alpha ≈109/255).
- **Land↔texset pairing is by texture-name coverage, not by
  number** (that is what the area data implements): Diamond land
  `narc_0000` pairs with texset `narc_0053` (14/14 texture names
  covered). This pairing is a coverage match, not a claim about
  which Diamond map the chunk came from.

### 1.5 Platinum

- `~/workspace/env-pullin-hgss-bw2/extracted/platinum/` holds
  **texsets only — 0 `.nsbmd` models were extracted.** Platinum
  model material otherwise exists only as study material in the
  decomp corpus. Recorded as an extraction gap, not an absence:
  nobody has pulled Platinum's building/land models out yet.

### 1.6 Gen 1–3 material

- `extracted/gen1|gen2|gen3/` (emerald/firered/ruby trees) is
  Game Boy / GBA material: 2D tile graphics, **no 3D world models**
  (those systems have no 3D engine). Out of class for this census.

### 1.7 BW2 / Gen 5 — NO MODEL BYTES EXIST

- **No Black/White or Black 2/White 2 `.nsbmd` (or any Gen 5 model
  bytes) exist anywhere on this disk** — searched and of record
  before this lane; re-confirmed by this lane's enumeration (no
  bw2/black/white model folders in the extraction tree).
- What IS held for Gen 5: the pokeblack disassembly + design/docs
  material in the study corpus. Gen 5's grade in this programme is
  therefore **staging/camera/design only** (moving-camera set
  pieces, presentation direction) — never a held-model claim.

### 1.8 Field texture-animation data (HGSS)

- `extracted/hgss/fldtanime-cycles.json` + `fldtanime-member*.nsbtx`
  (from pokeheartgold `files/data/fldtanime.narc`, sha256s in
  `extracted/manifest.json`): the field's texture-cycle tables —
  9 named entries of (frame, ticks) pairs, the source mechanism
  behind animated field textures (water and friends). This is the
  held behavioural source for water animation; the proof area's
  web-side equivalent is a UV scroll (§4 of the landing record).

## 2. Placement / land data (where models go in a map), as held

From pret-pokediamond `files/fielddata/` (the Diamond layout;
pokeheartgold's fielddata follows the same architecture):

- `land_data/land_data_release/` — per-map land data (NARC members):
  which land chunk a map uses.
- `build_model/` — the 535 building models (§1.2's source).
- `build_model_matshp.dat` — building material/shape data paired
  with the building models.
- `mapmatrix/` — the map matrix: how chunks tile into the region
  grid (which chunk sits at which matrix cell).
- `areadata/` — per-area data: `area_map_tex/` (which texture set
  an area binds — the coverage pairing of §1.4), `area_build_model/`
  (which buildings an area places), `area_data` (area properties).

So in the source, a rendered map = land chunk (land data) +
building placements (area build model) + one texture set (area map
tex), positioned by the map matrix. The authoring recipe in the
landing record mirrors exactly this shape for our maps.

## 3. Rendering-behaviour source (what the port follows)

Held in full: `~/workspace/pokemon-code-study/projects/pret-pokeheartgold/`.

- `include/gf_3d_loader.h` — the 3D resource manager
  (`GF_3DGfxRawResMan_*`): loads raw NSBMD/NSBTX resources and hands
  out texture/palette VRAM keys. Behaviour the port follows: models
  and textures are managed as separate resources; a model binds
  textures by name at draw time.
- `include/gf_3d_render.h` — the renderer entry points:
  `GF3dRender_DrawModel(obj, translation, rotation, scale)`,
  model-set binding, `LoadTexture`/`LoadPalette`. Behaviour the
  port follows: a model is drawn as one unit under a
  translation/rotation/scale transform — our per-building model
  matrix is exactly this call shape (compose T·R·S).
- `include/camera.h` + `src/camera.c` — `CameraParam { distance,
  CameraAngle, perspective }`,
  `Camera_Init_FromTargetDistanceAndAngle`; the field camera
  (`FieldCamera_Create` in the field overlay headers) is an angled
  top-down camera at a fixed pitch looking at the player. Behaviour
  the port follows: distance + pitch + perspective FOV, target on
  the player — our `hgssFieldCamera` (pitch 52°, FOV 42°, distance
  tuned on real captures; see landing record).
- The SBC (node-animation) byte stream is NOT in the decomp (it is
  SDK-side); see §4.3 for what that means for material binding.

## 4. The format as cracked by this lane (port notes)

No NSBMD parser existed anywhere in the held corpus (searched:
env-lane tools, decomp tools, pkZukan/abcboy101/opendpr/Hexlith/
skytemple). This lane wrote one from the format as held:
`~/workspace/world-3d/tools/nsbmd_convert.py` (NSBMD→JSON) and
`~/workspace/world-3d/tools/nsbtx_decode.py` (NSBTX/TEX0→PNG,
extending the env lane's format notes with 4×4 decompression).
Everything below was validated empirically on held files.

### 4.1 NSBMD layout

- BMD0 header, block table at +16; MDL0 (+ optional TEX0).
- Model dictionary → ModelInfo. In ModelInfo: materials-section
  offset at +0x08, shapes-dict offset at +0x0C, fx32 posScale
  (20.12 fixed point) at +0x1C — Diamond land 64.0, HGSS buildings
  8.0.
- Materials are 44-byte records (diff/amb, spec/emi, polygon
  attributes, texImageParam with repeat/flip bits, palette base,
  tex transform). Material→texture binding rule: material name
  minus a trailing `_lm<digits>` = texture name (the model's own
  texture dict may carry variant suffixes, e.g. `lakep.1`).
- **Each shape has its OWN GX display list.** The shape header's
  dlOffset is relative to that shape's own header position, so
  DL *i* starts at `headersBase + dlOffset_i + 16·i` and runs
  `dlSize_i − 16` bytes. An earlier continuous-stream reading of
  this layout parses without errors but silently scrambles
  geometry across shape boundaries — caught by this lane's offline
  render check (a shape that should be a flat ground grid came out
  shredded); with the per-shape reading, every shape of every
  converted model parses standalone with coherent bounds.
- GX display list: packed FIFO (one u32 = 4 command bytes, then
  parameter words). Vertex commands: VTX_16 (s16, /4096), VTX_10
  (3×s10, /64), VTX_XY / VTX_XZ (s16 pairs, untouched component
  persists), VTX_DIFF (3×s10 offsets). **VTX_DIFF scale is
  empirically /512 × posScale, not the textbook /64** — on 312 land
  samples /64 gives impossible 300+ unit steps; /512 gives a
  median step of 42 units, the chunk's coarse terrain grid.
- Primitives: triangles, quads, tri-strips, quad-strips (BEGIN
  prims 0–3).

### 4.2 NSBTX/TEX0 decode

- Texture/palette dictionaries located from the TEX0 header; the
  palette region must be sliced **to EOF** (the +0x20 size word is
  0 in held files — size-limiting it produces all-transparent
  PNGs).
- Formats covered: direct colour, a3i5/a5i3 alpha-indexed, 4-colour,
  16-colour, 256-colour paletted, and **4×4 texel compression**
  (2-bit indices + per-block mode word; modes 0–3 incl. the two
  interpolation modes, per GBATEK). Palette binding is by name
  with an override table for the sets whose palette names differ
  from texture names (`ngrass→grass`, `nsand→sandset`,
  `conttree_b/t→conttree`, …).
- Verification: this decoder's `conttree_b` output matches the env
  lane's decode exactly (same 12 colours, same top colours).

### 4.3 Shape→material binding — honest grade

The DS binds shapes to materials through the SBC stream, which is
not held (§3). Two working rules, both recorded per model in the
converted JSON (`bindingConfidence`):

- **Land: dictionary order is CORRECT** — verified by UV fit
  (e.g. polygon0's UVs land exactly on its 64×64 tree texture;
  repeating grass UVs fit their texture grid).
- **Buildings: dictionary order is WRONG** (it binds a house's
  main shell to its 16×16 shadow texture). The converter's
  `--bind fit` heuristic instead: (1) the shadow-named material
  (kage/shadow) goes to the flattest, lowest shape (the ground
  shadow plane); (2) remaining shapes by triangle count,
  descending, take the model's own primary materials in name
  order; (3) leftovers in order. UV-fit checks pass under this
  rule (the h01 shell's UVs span exactly its 64×64 wall texture).
  This is a heuristic port of the binding, NOT a decode of the
  SBC — flagged as such wherever the converted data is used.
- Known seam: `wk_labo_c` has no texture inside its own file;
  the area data maps it to `wk_labo_b.png`. Recorded in the area
  registry; the converted lab carries the substitution openly.

### 4.4 Conversion gaps

- HGSS models `en_yake` and `en_suzu` convert to 0 triangles
  (their display lists use a path the converter doesn't emit yet).
  Two files out of 340; named here so the gap is on record.
- BDHC (§1.1) is described, not parsed.

## 5. What the proof area uses (provenance summary)

Boot Harbor (our `sector0`) renders in 3D from: Diamond land chunk
`narc_0000` (§1.1) + its coverage-paired texset `narc_0053` (§1.4,
textures decoded by §4.2 — including the 5 the env decode missed) +
four HGSS buildings (§1.3): the lab `bm_field_0021` (`wk_labo`),
houses `bm_field_0020` (`wk_hhouse`), `bm_field_0022` (`wk_h01`),
`bm_field_0023` (`wk_h02`). Full per-file provenance and the
composition decisions are in LANDING-RECORD.md.
