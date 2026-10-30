/**
 * 3D world area registry — which maps carry authored 3D presentation
 * data, and what that data is. This is the authoring surface the
 * styleProfiles Gen 5 'model3d' renderMode reads: a map renders in
 * 3D only when it has an entry here; every other map keeps the
 * layered 2D presentation under every profile.
 *
 * An area entry is (see docs/WORLD3D-RECIPE.md in the lane record):
 *   - one held land model (converted NSBMD JSON) + its texture set,
 *     placed at a world offset (its authored ground height maps to
 *     world y = 0);
 *   - zero or more held building models placed on tile footprints
 *     (position in tiles, ground row = the footprint's south edge,
 *     a fit scale, optional Y rotation in degrees);
 *   - explicit texture-file maps (model texture name -> PNG file),
 *     because held sets carry name variants (e.g. 'lakep' is stored
 *     as 'lakep.1.png', HGSS 'wk_h01_a' as 'wak_h01_a.png');
 *   - the water texture names, which get the field texture
 *     animation (UV scroll — the web equivalent of the DS field
 *     texture-animation cycles).
 *
 * World units: 1 tile = 16 units (the Diamond land grid). HGSS
 * building models are authored on a 32-unit grid, so their fit
 * scale carries a 0.5 base (recorded per placement).
 *
 * Boot Harbor (sector0) is the first authored area (3D world lane,
 * 2026-10-30): land = held Diamond coastal chunk map03_27c
 * (extracted land narc_0000) whose water sits on its south side,
 * matching Boot Harbor's dock/sand/bay rows; texture set = held
 * Diamond map tex set narc_0053 (the set whose texture names cover
 * the chunk's 14 materials 14/14); buildings = held HGSS field
 * models (wk_labo on the lab block, wk_h01 on the second north
 * block, wk_hhouse / wk_h02 on the two house blocks).
 */

export interface World3DPlacement {
  /** Converted model JSON, relative to the area's base URL. */
  model: string;
  /** Texture directory for this model, relative to the base URL. */
  texDir: string;
  /** Model texture name -> PNG file name inside texDir. */
  texFiles: Record<string, string>;
  /** Footprint centre, in map tiles. */
  tileX: number;
  tileY: number;
  /** Uniform fit scale applied to the model's own units. */
  scale: number;
  /** Y rotation in degrees (0 = as authored, front facing south). */
  rotYDeg?: number;
}

export interface World3DArea {
  mapId: string;
  /** Public URL prefix holding this area's converted data. */
  baseUrl: string;
  land: {
    model: string;
    texDir: string;
    texFiles: Record<string, string>;
    /** World-space offset applied to the land model: its authored
     *  ground plane (y = 16 in the chunk) lands on world y = 0. */
    offset: { x: number; y: number; z: number };
  };
  buildings: World3DPlacement[];
  /** Texture names (as in the land model's materials) that receive
   *  the water texture animation. */
  waterTextures: string[];
}

const BOOT_HARBOR: World3DArea = {
  mapId: 'sector0',
  baseUrl: '/assets/world3d/boot-harbor',
  land: {
    model: 'land.json',
    texDir: 'tex',
    texFiles: {
      conttree_b: 'conttree_b.png',
      conttree_t: 'conttree_t.png',
      hage: 'hage.png',
      imped: 'imped.png',
      lake: 'lake.png',
      lakep: 'lakep.1.png',
      ngrass: 'ngrass.png',
      nhana: 'nhana.png',
      nsand: 'nsand.png',
      nsandp: 'nsandp.png',
      puddle_b: 'puddle_b.png',
      seaside3: 'seaside3.png',
      tree01: 'tree01.png',
      tshadow: 'tshadow.png',
    },
    offset: { x: -32, y: -16, z: 0 },
  },
  buildings: [
    {
      // Prof. Aeon's Lab block: tiles x8-13, door at (10,3).
      model: 'labo.json',
      texDir: 'btex/labo',
      texFiles: {
        h_kage: 'h_kage.png',
        h_mado: 'h_mado.png',
        wk_labo_a: 'wk_labo_a.png',
        wk_labo_b: 'wk_labo_b.png',
        // wk_labo_c has no texture inside the held model file (its
        // sign slab); it binds the lab's trim texture instead.
        wk_labo_c: 'wk_labo_b.png',
      },
      tileX: 10.5, tileY: 2.2, scale: 0.5,
    },
    {
      // Second north building block: tiles x18-23, door tile (19,3).
      model: 'h01.json',
      texDir: 'btex/h01',
      texFiles: {
        h_kage: 'h_kage.png',
        h_mado: 'h_mado.png',
        wk_h01_a: 'wk_h01_a.png',
      },
      tileX: 20.5, tileY: 2.2, scale: 0.5,
    },
    {
      // Your House block: tiles x4-7, door at (6,7).
      model: 'hhouse.json',
      texDir: 'btex/hhouse',
      texFiles: {
        h_kage: 'h_kage.png',
        h_mado: 'h_mado.png',
        wk_hh_a: 'wk_hh_a.png',
        wk_hh_b: 'wk_hh_b.png',
      },
      tileX: 5.5, tileY: 7.6, scale: 0.5,
    },
    {
      // Hex's House block: tiles x24-27, door at (26,7).
      model: 'h02.json',
      texDir: 'btex/h02',
      texFiles: {
        h_kage: 'h_kage.png',
        h_mado: 'h_mado.png',
        // The held model's own texture is spelled 'wak_h01_a'.
        wk_h01_a: 'wak_h01_a.png',
      },
      tileX: 25.5, tileY: 7.6, scale: 0.5,
    },
  ],
  waterTextures: ['lake', 'lakep', 'seaside3'],
};

export const WORLD3D_AREAS: Record<string, World3DArea> = {
  [BOOT_HARBOR.mapId]: BOOT_HARBOR,
};

export function getWorld3DArea(mapId: string | undefined): World3DArea | undefined {
  return mapId ? WORLD3D_AREAS[mapId] : undefined;
}
