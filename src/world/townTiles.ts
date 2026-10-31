/**
 * Milestone 1 town + field tiles for the Pixi world canvas.
 * Sheet: Kenney Tiny Town packed tilemap (CC0, see
 * public/assets/tiles/CREDITS.md), 12 columns x 11 rows of 16x16.
 * Every index below was checked by viewing the indexed sheet.
 * Tiles not listed keep the existing drawn fallback in PixiWorldCanvas.
 */
import { Assets, Rectangle, Texture } from 'pixi.js';
import { TILE } from './WorldConstants';

const BASE = (import.meta.env.BASE_URL as string | undefined) || '/';
export const TOWN_SHEET_URL = `${BASE}assets/tiles/kenney-tiny-town/tilemap_packed.png`;
const COLS = 12;
const PX = 16;

/** Sheet cells: ground. */
const GRASS = 0, GRASS_TUFT = 1, GRASS_FLOWER = 2, DIRT = 25;
/** Overlays drawn on top of grass (transparent background). */
const TREE = 16, TREE_ALT = 28, SIGN = 83, FENCE = 81;
/** Houses: red roof, wooden front wall, wooden door. */
const ROOF = 65, WALL_FRONT = 73, DOOR = 86;
/** Interior / paved floor. */
const STONE_FLOOR = 109;

function hash(x: number, y: number): number {
  return ((x * 73856093) ^ (y * 19349663)) >>> 0;
}

/** Layers (bottom first) for one map cell, or null to keep the fallback. */
export function townTileLayers(tiles: number[][], x: number, y: number): number[] | null {
  const t = tiles?.[y]?.[x];
  const below = tiles?.[y + 1]?.[x];
  const h = hash(x, y);
  const grass = h % 11 === 0 ? GRASS_TUFT : GRASS;
  switch (t) {
    case TILE.GRASS: return [grass];
    case TILE.FLOWER: return [GRASS_FLOWER];
    case TILE.PATH: return [DIRT];
    case TILE.WALL: return [GRASS, h % 3 === 0 ? TREE_ALT : TREE];
    case TILE.SIGN: return [GRASS, SIGN];
    case TILE.FENCE: return [GRASS, FENCE];
    case TILE.BUILDING:
      return [below === TILE.BUILDING ? ROOF : WALL_FRONT];
    case TILE.DOOR: return [DOOR];
    case TILE.INDUSTRIAL: return [STONE_FLOOR];
    default: return null;
  }
}

let cache: Texture[] | null = null;
let loading: Promise<Texture[] | null> | null = null;

/** Loads the sheet once; resolves to per-cell textures (or null on failure). */
export function loadTownTiles(): Promise<Texture[] | null> {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = Assets.load(TOWN_SHEET_URL).then((base: Texture) => {
      base.source.scaleMode = 'nearest';
      const out: Texture[] = [];
      for (let i = 0; i < COLS * 11; i++) {
        out.push(new Texture({ source: base.source, frame: new Rectangle((i % COLS) * PX, Math.floor(i / COLS) * PX, PX, PX) }));
      }
      cache = out;
      return out;
    }).catch(() => null);
  }
  return loading;
}

export function townTilesReady(): Texture[] | null { return cache; }
