import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Sprite, Text, Texture, TilingSprite } from 'pixi.js';
import { getSheetDef, worldCell } from '../../lib/spriteSheets';
import { fallbackColorFor } from '../../lib/spriteSheets';
import { playerSlot, slotForNpc } from '../../lib/humanSheets';
import type { HumanView } from '../../lib/humanSheets';
import { creatureWalkFrameUrl } from '../../lib/creatureWalkFrames';
import { tileAnimeFrame, tileAnimeSignature } from '../../lib/tileAnime';
import { useGameStore } from '../../store/gameStore';
import { getStyleProfile } from '../../lib/styleProfiles';

/**
 * PixiJS world renderer (Phase 2, world canvas only).
 * Draws the existing FullWorldMaps tile maps as PixiJS graphics — drawn
 * tiles, drawn figures, sheet sprites — never emoji, never CSS tiles.
 * React still owns HUD, menus, dialog and controls; this canvas owns
 * only the world picture. Camera follows the player and fills its
 * container (which the shell sizes to the full viewport).
 */

const TILE_COLORS: Record<number, number> = {
  0: 0x3a7a2a, 1: 0x1e4a16, 2: 0x1a5a9e, 3: 0xc8a870, 4: 0x7a5c3a, 5: 0xa07850,
  6: 0x2a6a18, 7: 0xd4b870, 8: 0x3a3028, 9: 0x3a7a2a, 10: 0xb09060, 11: 0x1a1a2e,
  12: 0x4a3820, 13: 0x5a9acc, 14: 0xc8e8f8, 15: 0x8a8a8a, 16: 0x3a7a2a, 17: 0x1a5a9e,
  18: 0x8050d0, 19: 0x806040, 20: 0x806040, 21: 0x4a8a30, 22: 0x7a5a30, 23: 0x8a6a40,
  24: 0xc8b080, 25: 0x8a2a0a,
  32: 0x34404e, 33: 0xccc2ba, 34: 0x4a7a30, 35: 0xc4ccd2, 36: 0x96684a, 37: 0xf0eee8,
};

const DAY_TINT: Record<string, { color: number; alpha: number }> = {
  dawn: { color: 0xffa050, alpha: 0.14 },
  day: { color: 0xffffff, alpha: 0 },
  dusk: { color: 0xb45028, alpha: 0.18 },
  night: { color: 0x001040, alpha: 0.38 },
};

// ── BW2 proof pass (bw2-world-upgrade lane staging; see
// ~/workspace/bw2-world-upgrade/TARGET-SPEC.md) ─────────────────────
// Original tile textures generated for this pass (art/make_tiles.py,
// cel-shaded, palette anchored to TILE_COLORS above). A tile type with
// an entry draws its texture over the flat rect; a type without one
// keeps the exact flat+motif rendering it has today — the fallback is
// deliberate, per-area tilesets are rollout work, not proof work.
// Water is two frames keyed to the engine's animTick (300 ms), which
// WorldEngine already passes — the first animated tile in the world.
const U = (u: string) => () => u;
const BW2_GROUND: Record<number, (x: number, y: number, tick: number) => string> = {
  0: (x, y) => ((x * 7 + y * 13) % 3 === 0 ? '/assets/bw2/grass_b.png' : '/assets/bw2/grass_a.png'),
  1: () => '/assets/bw2/tree_base.png',
  2: (_x, _y, tick) => (tick % 2 === 0 ? '/assets/bw2/water_a.png' : '/assets/bw2/water_b.png'),
  3: () => '/assets/bw2/path.png',
  4: () => '/assets/bw2/wall.png',
  5: () => '/assets/bw2/door.png',
  6: () => '/assets/bw2/tallgrass.png',
  7: () => '/assets/bw2/sand.png',
  9: U('/assets/bw2/ledge.png'),
  10: U('/assets/bw2/sign.png'),
  13: () => '/assets/bw2/shallow.png',
  15: U('/assets/bw2/rock.png'),
  19: U('/assets/bw2/stairs_up.png'),
  20: U('/assets/bw2/stairs_down.png'),
  21: () => '/assets/bw2/flower.png',
  22: () => '/assets/bw2/dock.png',
  // Interior furnishing tiles (WorldConstants 32-37 in this tree —
  // composition remap, world-compose COMPOSE-RECORD: BW2 numbered them
  // 26-31, but 26 is HM_BOULDER here): the pieces that make an
  // interior complete instead of a bare room of blocks.
  32: U('/assets/bw2/terminal.png'),
  33: U('/assets/bw2/counter.png'),
  34: U('/assets/bw2/plant.png'),
  35: U('/assets/bw2/heal_machine.png'),
  36: U('/assets/bw2/bench.png'),
  37: U('/assets/bw2/bed.png'),
};
// Per-map texture sets (tileset scoping): the same tile type wears a
// different material indoors / per place. Consulted before BW2_GROUND.
const BW2_MAP_TILES: Record<string, Record<number, (x: number, y: number, tick: number) => string>> = {
  sector0_house_1f: { 1: U('/assets/bw2/wall_int.png'), 3: U('/assets/bw2/floor_wood.png'), 4: U('/assets/bw2/counter.png') },
  sector0_house_2f: { 1: U('/assets/bw2/wall_int.png'), 3: U('/assets/bw2/floor_wood.png'), 4: U('/assets/bw2/furniture_house.png') },
  sector0_rival_house: { 1: U('/assets/bw2/wall_int.png'), 3: U('/assets/bw2/floor_wood.png'), 4: U('/assets/bw2/furniture_house.png') },
  aeon_lab: { 1: U('/assets/bw2/wall_lab.png'), 3: U('/assets/bw2/floor_lab.png'), 4: U('/assets/bw2/furniture_lab.png') },
  mochiiplex_1: { 1: U('/assets/bw2/wall_lab.png'), 3: U('/assets/bw2/floor_plex.png'), 4: U('/assets/bw2/shelf.png') },
  sector0_truck: { 1: U('/assets/bw2/wall_int.png'), 3: U('/assets/bw2/floor_wood.png'), 4: U('/assets/bw2/crate.png') },
  dojo_1: { 8: U('/assets/bw2/dojo_mat.png'), 3: U('/assets/bw2/dojo_mat.png'), 18: U('/assets/bw2/dojo_mat.png'), 4: U('/assets/bw2/dojo_wall.png'), 1: U('/assets/bw2/dojo_wall.png') },
  dojo_2: { 3: U('/assets/bw2/dojo_mat.png'), 4: U('/assets/bw2/dojo_wall.png') },
  cave_of_echoes: { 4: U('/assets/bw2/cave_rock.png'), 8: U('/assets/hgss/cave_floor.png') },
  // Environment pull-in (Region 1 rollout): interiors that Phase A
  // never reached get their sets here — same mechanism, same light
  // law (interiors are never tinted; windows stay apertures).
  // Dojos 3-8 share Dojo 1's mat/wall family; the mansion wears the
  // house set; the tunnel and cave floors bind the extracted
  // dungeon family (narc_0042) through the kit URLs.
  dojo_3: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  dojo_4: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  dojo_5: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  dojo_6: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  dojo_7: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  dojo_8: { 3: U('/assets/bw2/dojo_mat.png'), 1: U('/assets/bw2/dojo_wall.png'), 4: U('/assets/bw2/dojo_wall.png') },
  luigi_mansion: { 1: U('/assets/bw2/wall_int.png'), 3: U('/assets/bw2/floor_wood.png'), 4: U('/assets/bw2/furniture_house.png') },
  signal_tunnel: { 8: U('/assets/hgss/cave_floor.png'), 1: U('/assets/hgss/cave_strata.png'), 3: U('/assets/hgss/cave_floor_b.png') },
  mauveville_arena: { 18: U('/assets/bw2/dojo_mat.png'), 11: U('/assets/hgss/city_road.png'), 4: U('/assets/bw2/wall.png') },
};
// Window apertures (owner interior light law, 2026-10-29): indoors,
// daylight enters ONLY through declared windows — never a whole-room
// tint. Each entry is a wall tile that wears the window texture (lit
// panes by day, dark panes at night). The light-ray lane binds its
// shafts/patches to these exact coordinates; the machine-readable
// copy lives in ~/workspace/bw2-world-upgrade/windows.json.
const BW2_WINDOWS: Record<string, Array<[number, number]>> = {
  sector0_house_1f: [[3, 0], [9, 0]],
  sector0_house_2f: [[3, 0], [9, 0]],
  sector0_rival_house: [[4, 0], [8, 0]],
  aeon_lab: [[2, 0], [10, 0]],
};
const BW2_CANOPY_URL = '/assets/bw2/canopy.png';
const BW2_ROOF_URL = '/assets/bw2/roof.png';
const BW2_FOAM_URL = '/assets/bw2/foam.png';

// ── Environment pull-in (env-pullin-hgss-bw2 lane, 2026-10-29) ────
// Literal HGSS/Diamond environment textures, extracted from the held
// decomps and composed the way the source games compose them: a
// terrain type is a SET of authored textures with transition pieces,
// never one stamp. Receipts: ~/workspace/env-pullin-hgss-bw2/
// EXTRACTION-MANIFEST.md + kit/KIT-MANIFEST.json.
// Animation is NOT hand-timed here: src/lib/tileAnime.ts ports the
// cycle tables from pret-pokeheartgold files/data/fldtanime.narc
// (member 0) verbatim, and the frames below are that archive's own
// decoded textures. Variant choice per tile is a stable position
// hash — the source authors variety into its map data; at this seam
// the hash is how our tile grid carries the same authored-set idea.
// Exteriors only: interiors keep the BW2 lane's sets + light law.
const ENV = (n: string) => `/assets/hgss/${n}`;
const ENV_URLS = [
  'grass_a.png', 'grass_b.png', 'grass_c.png', 'grass_d.png', 'grass_flower.png', 'tallgrass_b.png',
  'path_a.png', 'path_b.png', 'path_c.png', 'sand_a.png', 'sand_b.png', 'water.png',
  'shallow.png', 'shore.png', 'cliff.png', 'cliff_b.png', 'cliff_c.png', 'rock.png',
  'rock_water.png', 'waterfall.png', 'tree_base.png', 'canopy_a.png',
  'canopy_b.png', 'dock.png', 'dock_b.png',
  'cave_floor.png', 'cave_floor_b.png', 'cave_strata.png', 'city_road.png',
  'industrial.png', 'lava.png',
  ...[1, 2, 3, 4, 5, 6].map(i => `crest_${i}.png`),
  ...[1, 2, 3, 4, 5, 6].map(i => `shoref_${i}.png`),
  ...[1, 2, 3].map(i => `flower_${i}.png`),
].map(ENV);
// PROFILE PARAMETER profile.material.grassGrade = 0xFFB79B (a Pixi
// multiply tint: R 1.00, G 0.72, B 0.61), applied ONLY to kit grass
// bases. Why it exists: the DS field pipeline presents its textures
// through 3D material diffuse + scene lighting, so the games' grass
// reads far deeper than the stored palette (measured at the byte
// level in EXTRACTION-MANIFEST.md: the grass family's dominant
// stored colours are (82,255,148) / (156,255,156)). A flat 2D
// renderer has no material stage, so the grade lives here at the
// seam — the kit PNGs stay byte-true to the extraction. The factor
// is anchored to the BW2 lane's owner-reviewed Phase-A palette
// register (its grass dominant measures (86,150,66)); graded, the
// kit's dominant lands at (82,184,90), the same register.
// (Restored at landing-train time, 2026-10-30: the composed canvas
// predated the env lane's 2026-10-30 correction of record; this
// constant, the 2x2-cluster grass hashing, the log-half dock crops
// and the lava case were merged back onto the composed canvas
// without disturbing the generation-switcher bindings.)
const GRASS_GRADE_TINT = 0xffb79b;
const envHash = (x: number, y: number): number => {
  let h = (x * 73856093) ^ (y * 19349663);
  h = (h ^ (h >> 13)) >>> 0;
  return h;
};

function envGroundFor(
  t: number, x: number, y: number, ticks: number,
  at: (nx: number, ny: number) => number,
): { base: string; overlay?: string } | null {
  const h = envHash(x, y);
  switch (t) {
    case 0: { // grass — a SET of four authored textures, hash-weighted.
      // One-texture grass is exactly the stamp this lane exists to
      // remove. Weights (revised 2026-10-30 after the kit's index-0
      // flatten fix): ngrass — the family's workhorse, the only one
      // with real surface speckle — carries the field at 50%;
      // lgreen is near-flat light green, an accent at 30%; hage
      // (worn patches) and lgreenp (mound-shaded, quilts at density)
      // sit at 10% each. Mirrored compositions ring — kit notes.
      // Variant choice hashes on 2x2-tile clusters, not per tile:
      // per-tile alternation of a saturated and a pale texture reads
      // as a checkerboard; the source's patches are multi-tile areas.
      const g = envHash(x >> 1, y >> 1) % 10;
      return { base: ENV(g <= 4 ? 'grass_b.png' : g <= 7 ? 'grass_c.png' : g === 8 ? 'grass_d.png' : 'grass_a.png') };
    }
    case 1: // tree base: trunk + grass ring (conttree_b crop)
      return { base: ENV('tree_base.png') };
    case 2: { // open water: sea base + sea_on crest overlay (ported cycle)
      const out: { base: string; overlay?: string } = { base: ENV('water.png') };
      if (h % 3 === 0) out.overlay = ENV(`crest_${tileAnimeFrame('sea_on', ticks, h % 108) + 1}.png`);
      return out;
    }
    case 3: { // path — nsand set, three compositions in rotation
      const p = h % 3;
      return { base: ENV(p === 0 ? 'path_a.png' : p === 1 ? 'path_b.png' : 'path_c.png') };
    }
    case 6: // tall grass — shana variant joins the BW2 texture
      return h % 4 === 0 ? { base: ENV('tallgrass_b.png') } : null;
    case 7: // sand — nsand set
      return { base: ENV(h % 5 === 0 ? 'sand_b.png' : 'sand_a.png') };
    case 9: { // ledge — cliff faces (wcliff / criff / enccliff) in
      // near-even rotation: the row reads as height, and the first
      // route measurement showed 75/25 weighting leaves long
      // identical runs, so the set rotates by hash thirds.
      const c = h % 3;
      return { base: ENV(c === 0 ? 'cliff.png' : c === 1 ? 'cliff_b.png' : 'cliff_c.png') };
    }
    case 13: { // shallow — at a land edge, the shore-wave cycle (swave_p
      // driving the hamabe frames); open shallow wears asasea
      const n = at(x, y - 1);
      if (n === 7 || n === 22 || n === 3) {
        return { base: ENV(`shoref_${tileAnimeFrame('swave_p', ticks, h % 90) + 1}.png`) };
      }
      return { base: ENV('shallow.png') };
    }
    case 15: { // rock — in/near water it is the sea rock
      const nearWater = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)]
        .some(n => n === 2 || n === 13);
      return { base: ENV(nearWater ? 'rock_water.png' : 'rock.png') };
    }
    case 17: // waterfall face (taki)
      return { base: ENV('waterfall.png') };
    case 21: { // flowers — grass + flower01 sway cycle overlay (ported)
      return {
        base: ENV('grass_b.png'),
        overlay: ENV(`flower_${tileAnimeFrame('flower01', ticks, h % 72) + 1}.png`),
      };
    }
    case 22: { // dock — the bridge texture's log half, two crops in
      // rotation (its rung-ladder half is a different piece entirely)
      return { base: ENV(h % 2 === 0 ? 'dock.png' : 'dock_b.png') };
    }
    case 8: // cave ground on exteriors (cave mouths, the Dark Forest's
      // cave tiles) — interiors bind the same family per-map below
      return { base: ENV(h % 4 === 0 ? 'cave_floor_b.png' : 'cave_floor.png') };
    case 11: // city road (Neon City's ground) — brick-weave set
      return { base: ENV('city_road.png') };
    case 12: // industrial ground (the junkyard) — Underground floor set
      return { base: ENV('industrial.png') };
    case 25: // lava — Platinum's magma texture (Diamond's sets carry none)
      return { base: ENV('lava.png') };
    default:
      return null;
  }
}
// Every BW2 texture, preloaded in the init effect through an Image
// element + Texture.from(img) — the pixiSheet.ts pattern, the only
// loader that works in this build. (Found the hard way, 2026-10-29:
// Texture.from(url) AND Assets.load(urls) both issued zero requests
// for these public-dir files in the live page — performance-entry
// probes showed the page never asked for a single one, and the first
// round of "textured" captures was the flat build. Do not "simplify"
// this back to a URL-based loader.)
const BW2_URLS = [
  '/assets/bw2/grass_a.png', '/assets/bw2/grass_b.png', '/assets/bw2/tree_base.png',
  '/assets/bw2/water_a.png', '/assets/bw2/water_b.png', '/assets/bw2/path.png',
  '/assets/bw2/wall.png', '/assets/bw2/door.png', '/assets/bw2/tallgrass.png',
  '/assets/bw2/sand.png', '/assets/bw2/shallow.png', '/assets/bw2/flower.png',
  '/assets/bw2/dock.png', BW2_CANOPY_URL, BW2_ROOF_URL, BW2_FOAM_URL,
  '/assets/bw2/ledge.png', '/assets/bw2/sign.png', '/assets/bw2/stairs_up.png',
  '/assets/bw2/stairs_down.png', '/assets/bw2/terminal.png', '/assets/bw2/counter.png',
  '/assets/bw2/plant.png', '/assets/bw2/heal_machine.png', '/assets/bw2/bench.png',
  '/assets/bw2/bed.png', '/assets/bw2/floor_wood.png', '/assets/bw2/floor_lab.png',
  '/assets/bw2/floor_plex.png', '/assets/bw2/wall_int.png', '/assets/bw2/wall_lab.png',
  '/assets/bw2/furniture_house.png', '/assets/bw2/furniture_lab.png', '/assets/bw2/shelf.png',
  '/assets/bw2/crate.png', '/assets/bw2/dojo_mat.png', '/assets/bw2/dojo_wall.png',
  '/assets/bw2/cave_rock.png', '/assets/bw2/window_day.png', '/assets/bw2/window_night.png',
  '/assets/bw2/rock.png',
];

function hashColor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const palette = [0xe8b06a, 0x7ab8e8, 0xe87a7a, 0x9ad97a, 0xc89ae8, 0xe8d27a, 0x7ad8c8];
  return palette[h % palette.length];
}

import { sheetCellTexture as sheetTexture, sheetCellTextureXY } from './pixiSheet';

function drawFallbackCreature(g: Graphics, cx: number, cy: number, size: number, colorHex: number, bob: number) {
  const r = size / 2;
  g.ellipse(cx, cy - r * 0.35 + bob, r * 0.9, r * 0.75).fill(colorHex);
  g.circle(cx - r * 0.55, cy - r * 0.9 + bob, r * 0.28).fill(colorHex);
  g.circle(cx + r * 0.55, cy - r * 0.9 + bob, r * 0.28).fill(colorHex);
  g.circle(cx - r * 0.3, cy - r * 0.45 + bob, r * 0.13).fill(0xffffff);
  g.circle(cx + r * 0.3, cy - r * 0.45 + bob, r * 0.13).fill(0xffffff);
  g.circle(cx - r * 0.3, cy - r * 0.45 + bob, r * 0.06).fill(0x111111);
  g.circle(cx + r * 0.3, cy - r * 0.45 + bob, r * 0.06).fill(0x111111);
  g.ellipse(cx, cy + r * 0.45, r * 0.95, r * 0.18).fill({ color: 0x000000, alpha: 0.3 });
}

function drawTrainerFigure(g: Graphics, cx: number, cy: number, size: number, outfit: number) {
  const s = size;
  g.ellipse(cx, cy + s * 0.45, s * 0.42, s * 0.08).fill({ color: 0x000000, alpha: 0.3 });
  g.rect(cx - s * 0.22, cy - s * 0.15, s * 0.44, s * 0.55).fill(outfit);
  g.circle(cx, cy - s * 0.32, s * 0.22).fill(0xe8b890);
  g.rect(cx - s * 0.28, cy - s * 0.42, s * 0.56, s * 0.12).fill(0x2a2a3a);
  g.circle(cx - s * 0.08, cy - s * 0.32, s * 0.03).fill(0x111111);
  g.circle(cx + s * 0.08, cy - s * 0.32, s * 0.03).fill(0x111111);
}

export type WildMarker = { id: string; speciesId: string; x: number; y: number; telegraph?: boolean };

/** Live per-NPC movement state, produced by a future WorldEngine NPC
 *  step — NOT by this canvas, which owns only the world picture.
 *  FireRed shape (pokefirered-leafgreen, src/event_object_movement.c +
 *  include/global.fieldmap.h): each map object event carries a
 *  movement_type plus x_radius/y_radius around its spawn tile, and the
 *  engine runs a per-frame step machine (face -> move one tile ->
 *  random delay -> pick a direction -> collision check -> walk).
 *  Mochiichao today has NONE of that per-NPC data: FullWorldMaps.ts
 *  NPC entries carry only id/x/y/sprite/name/facing/dialog/flags, and
 *  WorldEngine passes no NPC state at all — so no caller passes
 *  npcStates yet, and every NPC below renders exactly as before.
 *  What is still owed before any NPC visibly moves: (1) movement
 *  fields on map NPC entries (type + radii, FireRed template shape),
 *  (2) a WorldEngine step that advances positions/directions and
 *  passes npcStates here, (3) tile/NPC/player collision checks for
 *  the step. Inventing wander routes in this pass would guess all
 *  three, so this seam only consumes the state when a producer
 *  exists. `step` uses the same parity convention as the player's
 *  animWalk (odd = step frame, even = idle frame). */
export interface NpcWalkState {
  x: number;
  y: number;
  dir: HumanView;
  moving: boolean;
  step: number;
}

export default function PixiWorldCanvas({
  mapData, playerPos, playerDir, playerSpeciesId, defeatedIds, phase, animWalk,
  playerKind = 'human', playerGender = 'boy', wilds = [], npcStates, playerAuraColor = null, playerWalkFrameUrl = null,
  animTick = 0, follower = null, mapId,
}: {
  mapData: any;
  /** BW2 lane: the map's registry id, for per-map texture sets and
   *  window apertures (BW2_MAP_TILES / BW2_WINDOWS). Callers that
   *  pass nothing get the global exterior set, exactly as before. */
  mapId?: string;
  playerPos: { x: number; y: number };
  playerDir: string;
  playerSpeciesId: string | null;
  defeatedIds: string[];
  phase: string;
  animWalk: number;
  /** 'human' = world player avatar via the human loader (default).
      'creature' = Creature Mode only, where you play as the creature. */
  playerKind?: 'human' | 'creature';
  playerGender?: 'boy' | 'girl';
  /** Creature Mode only: wild creatures drawn in-world with the same
      camera/tile math as the player. Empty everywhere else. */
  wilds?: WildMarker[];
  /** NPC movement seam (see NpcWalkState): live per-NPC state from a
      future WorldEngine NPC step. Absent today — WorldEngine passes
      nothing — so NPCs render exactly as before. */
  npcStates?: Record<string, NpcWalkState>;
  /** Creature Mode only, pass 5: Garden Form aura colour (hex string,
      e.g. '#ffd700') for the player creature. Null = no aura (Base
      form, or any non-Creature Mode caller). Drawn as a ring under
      the player sprite only; Trainer Mode passes nothing, so it
      renders exactly as before. */
  playerAuraColor?: string | null;
  /** Creature Mode only, pass 8: wired walk-frame PNG URL for the
      player creature (direction + step phase, from
      creatureWalkFrames). Null = old sheet-cell path, exactly as
      before. Trainer Mode passes nothing. */
  playerWalkFrameUrl?: string | null;
  /** Sequence build (2026-10-28): free-running animation tick from
      WorldEngine (300 ms). Drives creature idle/walk-frame cycling
      for creature NPCs and the follower. Callers that pass nothing
      get tick 0 — the first frame of the cycle, i.e. no regression. */
  animTick?: number;
  /** Sequence build: the follower creature (movement.json command-
      buffer replay, computed in WorldEngine). Null = no follower
      (no party yet, or Creature Mode, which passes nothing). */
  follower?: { speciesId: string; x: number; y: number; dir: string; moving: boolean } | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  // Environment pull-in: the ported fldtanime clock. The source
  // field runs its cycle tables at 60 ticks/sec; this interval
  // samples the same tables at 30 fps (2 ticks per sample) and only
  // repaints when a bound cycle's displayed frame actually changes
  // (see src/lib/tileAnime.ts for the provenance + seam note).
  const animeTicksRef = useRef(0);
  const animeSigRef = useRef('');
  const [, setAnimeSig] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      animeTicksRef.current += 2;
      const sig = tileAnimeSignature(animeTicksRef.current);
      if (sig !== animeSigRef.current) {
        animeSigRef.current = sig;
        setAnimeSig(s => s + 1);
      }
    }, 33);
    return () => window.clearInterval(id);
  }, []);
  const sheetSpritesRef = useRef<Map<string, Sprite>>(new Map());
  const tileSpritesRef = useRef<Map<string, Sprite>>(new Map());
  const bw2TexRef = useRef<Map<string, Texture>>(new Map());
  const overlayRef = useRef<Graphics | null>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current!;
    const app = new Application();
    app.init({ resizeTo: host, background: '#0a1a0a', antialias: false, resolution: Math.min(2, window.devicePixelRatio || 1) }).then(() => {
      if (cancelled) { app.destroy(true); return; }
      host.appendChild(app.canvas);
      app.canvas.style.display = 'block';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      const world = new Container();
      app.stage.addChild(world);
      worldRef.current = world;
      appRef.current = app;
      draw();
      // BW2 pass: preload the tile textures through an Image element
      // + Texture.from(img) — the exact pattern this codebase's own
      // pixiSheet.ts loader uses, because it is the one that works
      // here: Texture.from(url) never fetched public-dir files, and
      // Assets.load(urls) also issued zero requests in the live page
      // (both verified by performance-entry probes, 2026-10-29).
      // Each texture repaints the world as it lands.
      [...BW2_URLS, ...ENV_URLS].forEach(u => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          const tex = Texture.from(img);
          tex.source.scaleMode = 'nearest';
          bw2TexRef.current.set(u, tex);
          draw();
        };
        img.src = u;
      });
    });
    return () => {
      cancelled = true;
      sheetSpritesRef.current.forEach(s => s.destroy());
      sheetSpritesRef.current.clear();
      tileSpritesRef.current.forEach(s => s.destroy());
      tileSpritesRef.current.clear();
      overlayRef.current = null;
      app.destroy(true);
      appRef.current = null;
      worldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visual generation switcher: the active presentation-flatness
  // profile. This subscription only changes canopy/roof geometry and
  // draw layer below. Texture choice, tile colours, the day/night
  // overlay, sprite art, and animation inputs are deliberately not
  // read from the profile. (Composed onto the env-pullin canvas per
  // the switcher lane's landing order: env master first, profile
  // parameters binding to its roof-run/canopy draws unchanged.)
  const visualStyle = useGameStore(s => s.settings.visualStyle);
  const styleProfile = getStyleProfile(visualStyle);

  const draw = () => {
    const app = appRef.current;
    const world = worldRef.current;
    if (!app || !world) return;
    const vw = app.screen.width;
    const vh = app.screen.height;
    if (vw < 10 || vh < 10) return;

    const colsVisible = vw < 640 ? 13 : 19;
    const tile = Math.max(20, Math.min(64, vw / colsVisible, vh / 12));
    const mapW = mapData.width || 30;
    const mapH = mapData.height || 30;

    // Camera: centre the player, clamp so the map fills the view.
    let camX = (playerPos.x + 0.5) * tile - vw / 2;
    let camY = (playerPos.y + 0.5) * tile - vh / 2;
    camX = mapW * tile <= vw ? -(vw - mapW * tile) / 2 : Math.max(0, Math.min(camX, mapW * tile - vw));
    camY = mapH * tile <= vh ? -(vh - mapH * tile) / 2 : Math.max(0, Math.min(camY, mapH * tile - vh));
    world.position.set(-camX, -camY);

    // Remove last frame's drawables; cached sheet sprites are reused, not destroyed.
    const removed = world.removeChildren();
    removed.forEach(child => {
      if (child instanceof Sprite && [...sheetSpritesRef.current.values()].includes(child)) return;
      if (child instanceof Sprite && [...tileSpritesRef.current.values()].includes(child)) return;
      child.destroy();
    });
    const g = new Graphics();
    world.addChild(g);

    // BW2 proof pass: cached tile sprites (ground textures, foam,
    // canopies, roofs) + a foreground Graphics for painted contact
    // shadows. Sprites are created once per key and reused across
    // draws, exactly like the sheet sprites above; the removeChildren
    // keep-check at the top of draw() preserves them.
    const usedTileKeys = new Set<string>();
    const placeTileSprite = (key: string, url: string, sx: number, sy: number, w: number, h: number, anchorX = 0, anchorY = 0) => {
      const tex = bw2TexRef.current.get(url);
      if (!tex) return null; // not loaded yet — flat rect underneath shows
      usedTileKeys.add(key);
      let sp = tileSpritesRef.current.get(key);
      if (!sp) {
        sp = new Sprite(tex);
        tileSpritesRef.current.set(key, sp);
      }
      sp.anchor.set(anchorX, anchorY);
      sp.position.set(sx, sy);
      sp.width = w;
      sp.height = h;
      world.addChild(sp);
      return sp;
    };
    const gFg = new Graphics();

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const t = mapData.tiles?.[y]?.[x] ?? 1;
        const base = TILE_COLORS[t] ?? TILE_COLORS[0];
        const px = x * tile;
        const py = y * tile;
        g.rect(px, py, tile, tile).fill(base);
        // Environment pull-in: exterior tiles resolve through the
        // HGSS/Diamond kit first (tile SETS + ported cycle frames);
        // anything the kit does not cover falls through to the BW2
        // lane's textures, then to the flat rendering, exactly as
        // before. Interiors never enter the kit (light law).
        const env = !(mapData as any)?.interior
          ? envGroundFor(t, x, y, animeTicksRef.current, (nx, ny) => mapData.tiles?.[ny]?.[nx] ?? 1)
          : null;
        const bw2url = env?.base ?? ((mapId ? BW2_MAP_TILES[mapId]?.[t] : undefined)?.(x, y, animTick) ?? BW2_GROUND[t]?.(x, y, animTick) ?? null);
        if (!bw2url && (x + y) % 2 === 0 && (t === 0 || t === 6)) g.rect(px, py, tile, tile).fill({ color: 0xffffff, alpha: 0.04 });
        if (bw2url) {
          // BW2 proof pass: texture over the flat rect; a painted
          // contact shadow (the 2D approximation of the Katana soft-
          // shadow look, TRANSFER-MAP D3) collected into gFg, which is
          // added after the ground sprites; a foam strip where open
          // water meets land to its north (shore transition).
          // (Exteriors only — indoors this painted scalloped shadow
          // ovals down both walls; caught on the house captures.)
          if (!(mapData as any)?.interior && (t === 1 || t === 4)) {
            gFg.ellipse(px + tile * 0.55, py + tile * 1.02, tile * 0.52, tile * 0.13).fill({ color: 0x000000, alpha: 0.20 });
          }
          // Switcher relief flattening: ledge / waterfall / stairs
          // textures are drawn with the profile's vertical scale
          // inside their own cell (Gen 5 = 1, the exact master draw).
          // Same texture, same colours; only its height in the cell
          // changes. Exteriors only, like the contact shadows above.
          const relief = !(mapData as any)?.interior && (t === 9 || t === 17 || t === 19 || t === 20)
            ? styleProfile.world.reliefHeightScale
            : 1;
          const baseSp = placeTileSprite(`g:${x}:${y}:${bw2url}`, bw2url, px, py, tile, tile * relief);
          // Grass material grade (profile.material.grassGrade — see
          // the constant's note): kit grass bases only, never the
          // BW2 lane's own textures or any other family. Case 6 is
          // included: when the kit's tallgrass_b covers a tile it is
          // the same grass family and must sit in the same register
          // (ungraded it popped neon against the BW2 lane's darker
          // tall grass on the Route 2 capture, 2026-10-30).
          // (Landing-train merge: applied to the switcher-relief
          // draw above; relief tiles are 9/17/19/20, never grass,
          // so the two transforms never interact.)
          if (baseSp && env && (t === 0 || t === 21 || t === 6)) baseSp.tint = GRASS_GRADE_TINT;
          // Ported-cycle overlay (sea_on crests on water, flower01
          // sway on flower tiles) — a second sprite above the base,
          // keyed by URL so each cycle frame caches separately.
          if (env?.overlay) placeTileSprite(`ov:${x}:${y}:${env.overlay}`, env.overlay, px, py, tile, tile);
          if (t === 2 && !env) {
            const north = mapData.tiles?.[y - 1]?.[x] ?? 1;
            if (north !== 2 && north !== 13) placeTileSprite(`foam:${x}:${y}`, BW2_FOAM_URL, px, py, tile, tile);
          }
        }
        // Window apertures (interior light law): a declared wall
        // tile wears the window texture — daylight panes by day,
        // dark panes at night. The room itself is never tinted.
        if (mapId && t === 1 && BW2_WINDOWS[mapId]?.some(([wx, wy]) => wx === x && wy === y)) {
          const wurl = phase === 'night' ? '/assets/bw2/window_night.png' : '/assets/bw2/window_day.png';
          placeTileSprite(`win:${mapId}:${x}:${y}:${wurl}`, wurl, px, py, tile, tile);
        }
        if (!bw2url && t === 1) {
          // Border tree: drawn trunk + canopy, not an emoji.
          g.rect(px + tile * 0.44, py + tile * 0.55, tile * 0.12, tile * 0.35).fill(0x5d4037);
          g.circle(px + tile * 0.5, py + tile * 0.38, tile * 0.38).fill(0x2e7d32);
          g.circle(px + tile * 0.5, py + tile * 0.38, tile * 0.22).fill(0x388e3c);
        } else if (t === 4) {
          g.rect(px + tile * 0.08, py + tile * 0.08, tile * 0.84, tile * 0.6).fill(0x8a6a4a);
          g.rect(px + tile * 0.38, py + tile * 0.55, tile * 0.24, tile * 0.45).fill(0x2a1f18);
        } else if (t === 5) {
          g.rect(px + tile * 0.32, py + tile * 0.2, tile * 0.36, tile * 0.8).fill(0x2a1f18);
        } else if (t === 6) {
          for (let i = 0; i < 4; i++) {
            g.rect(px + tile * (0.15 + i * 0.22), py + tile * 0.25, tile * 0.06, tile * 0.55).fill(0x1e5a10);
          }
        } else if (t === 10) {
          g.rect(px + tile * 0.45, py + tile * 0.4, tile * 0.1, tile * 0.6).fill(0x5d4037);
          g.rect(px + tile * 0.15, py + tile * 0.1, tile * 0.7, tile * 0.4).fill(0x8a6a40);
        } else if (t === 21) {
          g.circle(px + tile * 0.3, py + tile * 0.3, tile * 0.08).fill(0xf48fb1);
          g.circle(px + tile * 0.7, py + tile * 0.65, tile * 0.08).fill(0xf48fb1);
        } else if (t === 19 || t === 20) {
          g.poly([px + tile * 0.5, py + tile * (t === 19 ? 0.2 : 0.8), px + tile * 0.2, py + tile * (t === 19 ? 0.8 : 0.2), px + tile * 0.8, py + tile * (t === 19 ? 0.8 : 0.2)]).fill(0x3a2a1a);
        }
      }
    }

    // BW2 proof pass: painted shadows land above ground textures,
    // below everything that walks.
    world.addChild(gFg);

    // v5.1 door labels: the v5 playtest never saw which building
    // was the lab before entering it — the interact prompt only
    // shows while facing an adjacent door tile, and walking up
    // steps straight onto the door, so it is easy to miss. A
    // persistent label drawn in the world itself (same camera
    // transform as the tiles, so it sits above its door tile)
    // identifies the building before entry. Walk-into entry is
    // unchanged. Labels are recreated each draw like the tile
    // graphics (draw() clears non-sprite children each frame).
    // (BW2 pass: labels are now added after the tile pass so the
    // ground textures can never cover them.)
    (mapData.doors || []).forEach((door: any) => {
      if (!door.label) return;
      const label = new Text({
        text: door.label,
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: Math.max(12, tile * 0.32),
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: { color: 0x000000, width: 4 },
        },
      });
      label.anchor.set(0.5, 1);
      label.position.set((door.x + 0.5) * tile, door.y * tile - 2);
      world.addChild(label);
    });

    // Depth-sorted drawables: NPCs and player, sorted by tile row.
    const bob = animWalk % 2 === 1 ? -tile * 0.05 : 0;
    type Drawable = { y: number; build: (parent: Container) => void };
    const drawables: Drawable[] = [];

    // Visual generation switcher (owner correction, 2026-10-29):
    // the profile changes ONLY this layer's dimensional geometry.
    // Gen 5 uses the exact sizes and row -0.4 lead below. Lower
    // profiles shrink the same canopy/roof textures toward their
    // ground tiles and reduce the depth lead; Gen 2 and Gen 1 place
    // them in the ground pass, beneath every actor, so nothing can
    // pass behind them. The textures themselves never change.
    const worldProfile = styleProfile.world;

    // BW2 proof pass — the foreground layer this renderer never had:
    // tree canopies and building roofs join the SAME depth sort as the
    // entities, at row-0.4, so a character north of a tree or house is
    // drawn behind its canopy/roof and one south of it in front —
    // the staging that lets the player walk "behind" things.
    // EXTERIORS ONLY: indoors, WALL tiles are walls and BUILDING
    // tiles are furniture — the first interior captures wore tree
    // canopies as wallpaper and roof gables on the lab benches
    // (caught by inspecting the artifact, 2026-10-29).
    for (let y = 0; y < mapH && !(mapData as any)?.interior; y++) {
      for (let x = 0; x < mapW; x++) {
        const t = mapData.tiles?.[y]?.[x] ?? 1;
        if (t === 1) {
          const cx = (x + 0.5) * tile, by = (y + 1) * tile;
          // Environment pull-in: the canopy is one of two authored
          // source canopies (conttree_t crop / tree01 crop), chosen
          // per position — Phase A stamped a single canopy everywhere.
          const curl = ENV(envHash(x, y) % 4 === 0 ? 'canopy_b.png' : 'canopy_a.png');
          const buildCanopy = (parent: Container) => {
            const sp = placeTileSprite(`canopy:${x}:${y}:${curl}`, curl, cx, by, tile * worldProfile.canopy.widthTiles, tile * worldProfile.canopy.heightTiles, 0.5, 1);
            if (sp && sp.parent !== parent) parent.addChild(sp);
          };
          if (worldProfile.foregroundLayer === 'ground') buildCanopy(world);
          else drawables.push({ y: y - worldProfile.canopy.depthLeadTiles, build: buildCanopy });
        } else if (t === 4 && (mapData.tiles?.[y - 1]?.[x] ?? 1) !== 4) {
          // Environment pull-in: a building's roof is ONE composed
          // object spanning its whole top row (a TilingSprite whose
          // texture repeats per tile inside it), pushed once at the
          // run's first tile — Phase A stamped an identical roof
          // sprite on every top-row tile. Buildings in the source
          // games are single multi-tile models; this is the sprite-
          // seam equivalent (see LANDING-RECORD for the NSBMD note).
          const west = mapData.tiles?.[y]?.[x - 1] ?? 1;
          const westNorth = mapData.tiles?.[y - 1]?.[x - 1] ?? 1;
          if (west === 4 && westNorth !== 4) continue;
          let run = 1;
          while ((mapData.tiles?.[y]?.[x + run] ?? 1) === 4 && (mapData.tiles?.[y - 1]?.[x + run] ?? 1) !== 4) run++;
          const bx = x * tile, by = (y + 1) * tile;
          const buildRoof = (parent: Container) => {
            const tex = bw2TexRef.current.get(BW2_ROOF_URL);
            if (!tex) return;
            // NOT cached in tileSpritesRef: in Pixi v8 a
            // TilingSprite is a ViewContainer, not a Sprite, so
            // draw()'s sprite keep-check would destroy a cached
            // one and the dead reference throws on the next build
            // (caught on this lane's first capture — black frame).
            // Roofs are few per screen; build fresh like Graphics.
            // Switcher: the run's height is the profile's roof
            // height (Gen 5 = 1.5 tiles, the exact master draw).
            const sp = new TilingSprite({ texture: tex, width: tile * run, height: tile * worldProfile.roof.heightTiles });
            sp.anchor.set(0, 1);
            sp.position.set(bx, by);
            sp.tileScale.set(tile / tex.width, (tile * worldProfile.roof.heightTiles) / tex.height);
            parent.addChild(sp);
          };
          if (worldProfile.foregroundLayer === 'ground') buildRoof(world);
          else drawables.push({ y: y - worldProfile.roof.depthLeadTiles, build: buildRoof });
        }
      }
    }

    (mapData.npcs || []).forEach((npc: any) => {
      if (defeatedIds.includes(npc.id)) return;
      // NPC movement seam: a live state, when a future WorldEngine
      // NPC step passes one, also drives the depth-sort row. No
      // state exists today, so the sort row and the sprite below
      // are exactly the standing-still rendering as before.
      const npcState = npcStates?.[npc.id];
      drawables.push({
        y: npcState?.y ?? npc.y,
        build: (parent) => {
          const cx = ((npcState?.x ?? npc.x) + 0.5) * tile;
          const cy = ((npcState?.y ?? npc.y) + 0.5) * tile;
          const def = npc.creatureId ? getSheetDef(npc.creatureId) : null;
          const human = !def ? slotForNpc(npc) : null;
          if (human && human.sheetUrl) {
            if (!npcState) {
              // No movement state: standing rendering, now facing
              // the direction the map entry states (npc.facing),
              // using the walk-idle cell when the slot has a walk
              // layout, else the row-0 direction frame — the same
              // distinct-left / mirror-right rule as the player
              // branch and the movement seam above. Unknown or
              // missing facing falls back to front, exactly as
              // before. Null-sheet slots never reach this branch
              // (fallback figure below, unchanged), and the
              // movement seam branch below is untouched.
              const facingView: HumanView = npc.facing === 'up' ? 'back' : npc.facing === 'left' ? 'left' : npc.facing === 'right' ? 'right' : 'front';
              const distinctLeft = human.frames.left !== human.frames.right;
              const showView = facingView === 'left' && !distinctLeft ? 'right' : facingView;
              // Hex pose fix (SEQUENCE-PLAN Seq 1 gap): a slot that
              // carries a walk layout stands in its walk-idle cell,
              // not its row-0 frame. Row 0 of the core100 atlases
              // holds full-size battle-proportion figures, so Hex
              // standing on row 0 read as a large dark-purple mass;
              // his chibi walk-idle row is the standing figure the
              // moving render already uses. Slots with no walk layout
              // keep the row-0 frame exactly as before.
              const standCell = human.walk ? human.walk.idle[showView] : null;
              const key = standCell !== null
                ? `npc-human-${npc.id}-${showView}-walk${standCell}`
                : `npc-human-${npc.id}-${showView}`;
              let sp = sheetSpritesRef.current.get(key);
              if (!sp) {
                sp = new Sprite();
                sheetSpritesRef.current.set(key, sp);
                if (standCell !== null) {
                  sheetCellTextureXY(human.sheetUrl, (standCell % 4) * 64, Math.floor(standCell / 4) * 64).then(tex => { sp!.texture = tex; }).catch(() => {});
                } else {
                  sheetTexture(human.sheetUrl, human.frames[showView]).then(tex => { sp!.texture = tex; }).catch(() => {});
                }
              }
              sp.anchor.set(0.5, 1);
              sp.position.set(cx, cy + tile * 0.5);
              sp.width = tile * 1.25; sp.height = tile * 1.25;
              sp.scale.x = Math.abs(sp.scale.x) * (facingView === 'left' && !distinctLeft ? -1 : 1);
              parent.addChild(sp);
            } else {
              // Live movement state: face the state's direction and,
              // while moving, alternate idle/step from the slot's own
              // walk layout (ROWS_WALK for PR #100 slots, PAIRS_WALK
              // for Player A — taken from the slot, never assumed),
              // with the same odd = step parity as the player's
              // animWalk. Standing state renders the walk-idle cell
              // when the slot has a walk layout (Hex pose fix — same
              // rule as the no-movement branch above), else the row-0
              // view.
              // Distinct left cell when the slot has one; otherwise
              // mirror right, exactly like the player branch.
              const view: HumanView = npcState.dir === 'back' || npcState.dir === 'left' || npcState.dir === 'right' ? npcState.dir : 'front';
              const distinctLeft = human.frames.left !== human.frames.right;
              const showView = view === 'left' && !distinctLeft ? 'right' : view;
              const walkCell = human.walk
                ? (npcState.moving && npcState.step % 2 === 1 ? human.walk.step[showView] : human.walk.idle[showView])
                : null;
              const key = walkCell !== null
                ? `npc-human-${npc.id}-${showView}-walk${walkCell}`
                : `npc-human-${npc.id}-${showView}`;
              let sp = sheetSpritesRef.current.get(key);
              if (!sp) {
                sp = new Sprite();
                sheetSpritesRef.current.set(key, sp);
                if (walkCell !== null) {
                  sheetCellTextureXY(human.sheetUrl, (walkCell % 4) * 64, Math.floor(walkCell / 4) * 64).then(tex => { sp!.texture = tex; }).catch(() => {});
                } else {
                  sheetTexture(human.sheetUrl, human.frames[showView]).then(tex => { sp!.texture = tex; }).catch(() => {});
                }
              }
              sp.anchor.set(0.5, 1);
              sp.position.set(cx, cy + tile * 0.5);
              sp.width = tile * 1.25; sp.height = tile * 1.25;
              sp.scale.x = Math.abs(sp.scale.x) * (view === 'left' && !distinctLeft ? -1 : 1);
              parent.addChild(sp);
            }
          } else if (def && worldCell(def, 'front')) {
            // Sequence build (2026-10-28) — the owner's named defect,
            // removed: creature NPCs (the lab's Dorowani + Gabu, the
            // starter creatures) rendered ONE frozen front sheet cell
            // forever — static cutouts, no animation. Frames-dir
            // species now cycle their real walk frames in place on
            // the engine's animTick, Black-2 rhythm: step phases show
            // a frames-dir walk frame (creatureWalkFrames), stand
            // phases show the sheet cell (the standing authority —
            // the same convention Creature Mode already used). The
            // whole-sprite bob/tilt trick is NOT used. Species with
            // sheet-only walk sets keep the sheet cell — named as a
            // gap in docs/SEQUENCE-PLAN.md, never faked.
            const frameDir = npc.facing === 'up' ? 'up' : npc.facing === 'left' ? 'left' : npc.facing === 'right' ? 'right' : 'down';
            const frameUrl = npc.creatureId ? creatureWalkFrameUrl(npc.creatureId, frameDir, animTick % 4) : null;
            if (frameUrl) {
              const key = `npc-${npc.id}-walk-${frameUrl}`;
              let sp = sheetSpritesRef.current.get(key);
              if (!sp) {
                sp = new Sprite();
                sheetSpritesRef.current.set(key, sp);
                sp.texture = Texture.from(frameUrl);
              }
              sp.anchor.set(0.5, 1);
              sp.position.set(cx, cy + tile * 0.5);
              sp.width = tile * 1.25; sp.height = tile * 1.25;
              parent.addChild(sp);
            } else {
              const wc = worldCell(def, 'front')!;
              const key = `npc-${npc.id}`;
              let sp = sheetSpritesRef.current.get(key);
              if (!sp) {
                sp = new Sprite();
                sheetSpritesRef.current.set(key, sp);
                sheetCellTextureXY(def.sheetUrl, wc.x, wc.y).then(tex => { sp!.texture = tex; }).catch(() => {});
              }
              sp.anchor.set(0.5, 1);
              sp.position.set(cx, cy + tile * 0.5);
              sp.width = tile * 1.25; sp.height = tile * 1.25;
              parent.addChild(sp);
            }
          } else {
            // Human loader placeholder figure (slot colour, original shape).
            const fg = new Graphics();
            const slotColor = human ? parseInt(human.color.replace('#', ''), 16) : hashColor(npc.id);
            drawTrainerFigure(fg, cx, cy, tile * 0.9, slotColor);
            parent.addChild(fg);
          }
        },
      });
    });

    // Creature Mode wilds: same sheet/fallback drawing as the player
    // creature, plus a red ring when an attack is telegraphed.
    (wilds || []).forEach((wild) => {
      drawables.push({
        y: wild.y,
        build: (parent) => {
          const cx = (wild.x + 0.5) * tile;
          const cy = (wild.y + 0.5) * tile;
          const def = getSheetDef(wild.speciesId);
          if (def && worldCell(def, 'front')) {
            const wc = worldCell(def, 'front')!;
            const key = `wild-${wild.id}`;
            let sp = sheetSpritesRef.current.get(key);
            if (!sp) {
              sp = new Sprite();
              sheetSpritesRef.current.set(key, sp);
              sheetCellTextureXY(def.sheetUrl, wc.x, wc.y).then(tex => { sp!.texture = tex; }).catch(() => {});
            }
            sp.anchor.set(0.5, 1);
            sp.position.set(cx, cy + tile * 0.5);
            sp.width = tile * 1.1; sp.height = tile * 1.1;
            parent.addChild(sp);
          } else {
            const fg = new Graphics();
            const colorHex = parseInt(fallbackColorFor(wild.speciesId).replace('#', ''), 16);
            drawFallbackCreature(fg, cx, cy, tile * 0.9, colorHex, 0);
            parent.addChild(fg);
          }
          if (wild.telegraph) {
            const ring = new Graphics();
            ring.circle(cx, cy, tile * 0.65).stroke({ color: 0xff2222, width: 3 });
            parent.addChild(ring);
          }
        },
      });
    });

    // Follower creature (sequence build): the party lead, one step
    // behind the player (position computed in WorldEngine from the
    // movement.json command buffer). Rendered with the same real
    // walk-frame cycle as creature NPCs: step phases show the
    // frames-dir frame for its travel direction, stand phases the
    // sheet cell. Depth-sorted with everything else by tile row.
    if (follower) {
      drawables.push({
        y: follower.y,
        build: (parent) => {
          const cx = (follower.x + 0.5) * tile;
          const cy = (follower.y + 0.5) * tile;
          const frameUrl = creatureWalkFrameUrl(follower.speciesId, follower.dir, animTick % 4);
          if (frameUrl) {
            const key = `follower-walk-${frameUrl}`;
            let sp = sheetSpritesRef.current.get(key);
            if (!sp) {
              sp = new Sprite();
              sheetSpritesRef.current.set(key, sp);
              sp.texture = Texture.from(frameUrl);
            }
            sp.anchor.set(0.5, 1);
            sp.position.set(cx, cy + tile * 0.5);
            sp.width = tile * 1.2; sp.height = tile * 1.2;
            parent.addChild(sp);
            return;
          }
          const def = getSheetDef(follower.speciesId);
          const view = follower.dir === 'up' ? 'back' : follower.dir === 'left' || follower.dir === 'right' ? 'side' : 'front';
          if (def && worldCell(def, view)) {
            const wc = worldCell(def, view)!;
            const key = `follower-${def.speciesId}-${view}`;
            let sp = sheetSpritesRef.current.get(key);
            if (!sp) {
              sp = new Sprite();
              sheetSpritesRef.current.set(key, sp);
              sheetCellTextureXY(def.sheetUrl, wc.x, wc.y).then(tex => { sp!.texture = tex; }).catch(() => {});
            }
            sp.anchor.set(0.5, 1);
            sp.position.set(cx, cy + tile * 0.5);
            sp.width = tile * 1.2; sp.height = tile * 1.2;
            sp.scale.x = Math.abs(sp.scale.x) * (follower.dir === 'left' ? -1 : 1);
            parent.addChild(sp);
          } else {
            const fg = new Graphics();
            const colorHex = parseInt(fallbackColorFor(follower.speciesId).replace('#', ''), 16);
            drawFallbackCreature(fg, cx, cy, tile * 0.9, colorHex, 0);
            parent.addChild(fg);
          }
        },
      });
    }

    drawables.push({
      y: playerPos.y,
      build: (parent) => {
        const cx = (playerPos.x + 0.5) * tile;
        const cy = (playerPos.y + 0.5) * tile;
        // Pass 5 Garden aura: ring under the player creature only,
        // before the sprite, so it never covers the creature.
        if (playerKind === 'creature' && playerAuraColor) {
          const auraHex = parseInt(playerAuraColor.replace('#', ''), 16);
          const aura = new Graphics();
          aura.circle(cx, cy, tile * 0.65).fill({ color: auraHex, alpha: 0.18 });
          aura.circle(cx, cy, tile * 0.65).stroke({ color: auraHex, width: 3 });
          parent.addChild(aura);
        }
        const humanPlayer = playerKind === 'human' ? playerSlot(playerGender) : null;
        if (humanPlayer && humanPlayer.sheetUrl) {
          // Distinct left cell when the slot has one (Player A atlas:
          // left 128, right 192); otherwise fall back to mirrored right
          // (old strips where left === right).
          const distinctLeft = humanPlayer.frames.left !== humanPlayer.frames.right;
          const view = playerDir === 'up' ? 'back' : playerDir === 'left' && distinctLeft ? 'left' : playerDir === 'left' || playerDir === 'right' ? 'right' : 'front';
          // Human walk animation (walk wiring): when the slot carries
          // walk frames (humanSheets.ts, per-atlas manifest layout),
          // the moving player alternates idle/step with animWalk
          // parity — the same parity the bob below already uses.
          // Standing still keeps the last frame, exactly like the
          // existing bob freeze; there is no step tween in this
          // tile-step mover to return to idle on. Slots without walk
          // data (old strips, null sheets) render exactly as before.
          // NPCs are untouched here: they stand still in current maps,
          // so their walk cells have no movement to animate yet.
          const walkCell = humanPlayer.walk
            ? (animWalk % 2 === 1 ? humanPlayer.walk.step[view] : humanPlayer.walk.idle[view])
            : null;
          const key = walkCell !== null
            ? `player-human-${humanPlayer.slotId}-${view}-walk${walkCell}`
            : `player-human-${humanPlayer.slotId}-${view}`;
          let sp = sheetSpritesRef.current.get(key);
          if (!sp) {
            sp = new Sprite();
            sheetSpritesRef.current.set(key, sp);
            if (walkCell !== null) {
              sheetCellTextureXY(humanPlayer.sheetUrl, (walkCell % 4) * 64, Math.floor(walkCell / 4) * 64).then(tex => { sp!.texture = tex; }).catch(() => {});
            } else {
              sheetTexture(humanPlayer.sheetUrl, humanPlayer.frames[view]).then(tex => { sp!.texture = tex; }).catch(() => {});
            }
          }
          sp.anchor.set(0.5, 1);
          sp.position.set(cx, cy + tile * 0.5 + bob);
          sp.width = tile * 1.3; sp.height = tile * 1.3;
          sp.scale.x = Math.abs(sp.scale.x) * (playerDir === 'left' && !distinctLeft ? -1 : 1);
          parent.addChild(sp);
          return;
        }
        if (humanPlayer) {
          const fg = new Graphics();
          drawTrainerFigure(fg, cx, cy + bob, tile * 1.0, parseInt(humanPlayer.color.replace('#', ''), 16));
          parent.addChild(fg);
          return;
        }
        // Pass 8: wired walk frame wins over the static sheet cell
        // when Creature Mode passes one; otherwise the old path runs.
        if (playerWalkFrameUrl) {
          const key = `player-walk-${playerWalkFrameUrl}`;
          let sp = sheetSpritesRef.current.get(key);
          if (!sp) {
            sp = new Sprite();
            sheetSpritesRef.current.set(key, sp);
            sp.texture = Texture.from(playerWalkFrameUrl);
          }
          sp.anchor.set(0.5, 1);
          sp.position.set(cx, cy + tile * 0.5 + bob);
          sp.width = tile * 1.3; sp.height = tile * 1.3;
          parent.addChild(sp);
          return;
        }
        const def = getSheetDef(playerSpeciesId);
        const view = playerDir === 'up' ? 'back' : playerDir === 'left' || playerDir === 'right' ? 'side' : 'front';
        if (def && worldCell(def, view)) {
          const wc = worldCell(def, view)!;
          const key = `player-${def.speciesId}-${view}`;
          let sp = sheetSpritesRef.current.get(key);
          if (!sp) {
            sp = new Sprite();
            sheetSpritesRef.current.set(key, sp);
            sheetCellTextureXY(def.sheetUrl, wc.x, wc.y).then(tex => { sp!.texture = tex; }).catch(() => {});
          }
          sp.anchor.set(0.5, 1);
          sp.position.set(cx, cy + tile * 0.5 + bob);
          sp.width = tile * 1.3; sp.height = tile * 1.3;
          sp.scale.x = Math.abs(sp.scale.x) * (playerDir === 'left' ? -1 : 1);
          parent.addChild(sp);
        } else {
          const fg = new Graphics();
          const colorHex = parseInt(fallbackColorFor(playerSpeciesId).replace('#', ''), 16);
          drawFallbackCreature(fg, cx, cy, tile * 1.1, colorHex, bob);
          parent.addChild(fg);
        }
      },
    });

    drawables.sort((a, b) => a.y - b.y);
    drawables.forEach(d => d.build(world));

    // Day/night tint overlay (screen space, one persistent Graphics).
    // OWNER RULE 2026-10-29 ~19:39 CDT (CLOCK §7): the global tint
    // applies OUTDOORS ONLY. Inside buildings there is no
    // whole-interior tint — daylight enters through windows via
    // the light-ray lane, which reads sun facts from the world
    // clock, not this overlay. The map's own `interior` flag is
    // the regime data; windowless interiors therefore also skip
    // the tint rather than getting a wash. The overlay Graphics
    // is still created (so a map change back outdoors reuses it),
    // but it is cleared and left empty for interior maps.
    const tint = DAY_TINT[phase] || DAY_TINT.day;
    let overlay = overlayRef.current;
    if (!overlay) {
      overlay = new Graphics();
      overlayRef.current = overlay;
      app.stage.addChild(overlay);
    }
    overlay.clear();
    // Interior light law (owner, 2026-10-29): the day/night tint is
    // OUTDOORS-ONLY. A map flagged `interior: true` never gets the
    // whole-screen tint — indoors, daylight comes through the
    // declared window apertures (BW2_WINDOWS) and authored local
    // sources, or the room is dark by design (caves).
    if (tint.alpha > 0 && !(mapData as any)?.interior) overlay.rect(0, 0, vw, vh).fill({ color: tint.color, alpha: tint.alpha });

    // BW2 proof pass: prune tile sprites this draw did not place
    // (previous map, or the other water frame) so nothing stale can
    // bleed through a flat-rendered tile after a map change.
    tileSpritesRef.current.forEach((sp, key) => {
      if (!usedTileKeys.has(key)) {
        if (sp.parent) sp.parent.removeChild(sp);
        sp.destroy();
        tileSpritesRef.current.delete(key);
      }
    });
  };

  useEffect(() => { draw(); });
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return <div ref={hostRef} className="absolute inset-0 overflow-hidden" style={{ touchAction: 'none' }} />;
}
