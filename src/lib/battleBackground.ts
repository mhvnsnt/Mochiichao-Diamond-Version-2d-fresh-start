// Battle backgrounds — the HGSS scene system (battle-maps lane).
//
// MODEL (CODE grade, read from the held decomp
// ~/workspace/pokemon-code-study/projects/pret-pokeheartgold):
//   - Every MAP HEADER carries a battle background id
//     (src/data/map_headers.h `.battleBg`; src/battle/battle_setup.c
//     `MapHeader_GetBattleBg(mapId)`). Ours: map-battle-bg.json.
//   - The standing TILE refines it into a terrain
//     (`FieldSystem_GetTerrainFromStandingTile` — metatile behaviour
//     first, battleBg table as fallback). Ours: TILE id overrides in
//     TILE_SCENE below, checked before the map binding.
//   - Surfing overrides the background to BATTLE_BG_OCEAN outright;
//     fishing forces TERRAIN_WATER. Ours: water tiles override any
//     map binding.
//   - Time of day is a setup input (`setup->timeOfDay`), and cave
//     backgrounds FORCE night (`forceNite` -> RTC_TIMEOFDAY_NITE).
//     Ours: scene defs carry forceNite; the cave scene forces 'nite'.
//   - The scene itself is ONE composed picture per bg id: far field,
//     mid band, and the ground with the two battler platforms baked
//     in, recoloured per time of day. Ours: per-scene DAY/NITE
//     palettes in battle-scenes.json; MORN/EVE ride the day palette
//     under the clock tint machinery (the same tint values
//     PixiWorldCanvas applies from WorldConstants DAY_TINT), LATE
//     rides the nite palette. When src/lib/worldClock.ts lands (the
//     CLOCK-FROM-POKEMON design), it becomes the phase producer; the
//     resolver already speaks its five-phase vocabulary and takes
//     phase as an input with an honest default ('day') until then —
//     the same pattern honor.ts used for the missing clock.
//
// This module is pure: no React, no Pixi, no store. Renderers
// (BattleSceneBackdrop for DOM, PixiBattleCanvas for the Pixi path)
// draw sceneGeometry() output; palettes can never drift between the
// two battle surfaces because both read this one resolver.
//
// FALLBACK LAW: an unclassifiable context resolves to the route
// scene with `fallback: true` and `via: 'fallback'` ON THE RESULT —
// visible in data, never silent. battleBackground.test.ts asserts
// every real map in FULL_WORLD resolves WITHOUT the fallback.

import scenesJson from "../data/core/battle-scenes.json";
import bindingsJson from "../data/core/map-battle-bg.json";
import { TILE } from "../world/WorldConstants";

/** The Gen 4 five display phases (CLOCK-FROM-POKEMON §1.4.1). */
export type BattlePhase = "late" | "morn" | "day" | "eve" | "nite";

export const BATTLE_PHASES: BattlePhase[] = ["late", "morn", "day", "eve", "nite"];

export interface BattleScenePalette {
  sky: string;
  farBand: string;
  mid: string;
  ground: string;
  groundShade: string;
  platform: string;
  platformRim: string;
  accent: string;
}

export interface BattleSceneDef {
  label: string;
  motif: string;
  forceNite: boolean;
  day: BattleScenePalette;
  nite: BattleScenePalette;
}

interface ScenesFile {
  version: number;
  phaseTint: Record<string, { color: string; alpha: number }>;
  scenes: Record<string, BattleSceneDef>;
}

const SCENES = scenesJson as unknown as ScenesFile;
const BINDINGS = (bindingsJson as unknown as { bindings: Record<string, string> }).bindings;

export const BATTLE_SCENE_IDS = Object.keys(SCENES.scenes);
export const MAP_BATTLE_BG: Record<string, string> = BINDINGS;

/** Scene forced when nothing classifies the context (see FALLBACK LAW). */
export const FALLBACK_SCENE_ID = "route";

/**
 * Standing-tile overrides (HGSS: terrain from the tile you stand on
 * beats the map's background; surfing overrides to OCEAN). Keys are
 * TILE ids from src/world/WorldConstants.ts.
 */
export const TILE_SCENE: Record<number, string> = {
  [TILE.WATER]: "water",
  [TILE.SHALLOW]: "water",
  [TILE.HM_WATERFALL]: "water",
  [TILE.TALL_GRASS]: "route",
  [TILE.CAVE]: "cave",
  [TILE.LAVA]: "cave",
  [TILE.ICE]: "route",
  [TILE.SAND]: "route",
  [TILE.SAND_DUNE]: "route",
};

export interface BattleEncounterContext {
  /** FULL_WORLD map id (gameStore.currentMap), e.g. "route_1". */
  mapId?: string | null;
  /** TILE id of the tile the battle started on, when known. */
  standingTile?: number | null;
  /** The map record's interior flag, when the caller has the record. */
  interior?: boolean | null;
  /** Clock phase. Absent = honest default 'day' (no clock module yet). */
  phase?: BattlePhase | string | null;
}

export type BattleSceneVia = "tile" | "map-binding" | "interior-flag" | "fallback";

export interface ResolvedBattleScene {
  sceneId: string;
  label: string;
  motif: string;
  /** Palette in force for the resolved phase (day or nite base). */
  palette: BattleScenePalette;
  /** Tint overlay from the clock tint machinery, or null. */
  tint: { color: string; alpha: number } | null;
  /** The phase actually rendered (after forceNite). */
  phaseUsed: BattlePhase;
  /** True when the scene forced the phase to 'nite' (HGSS cave rule). */
  forcedNite: boolean;
  via: BattleSceneVia;
  /** True only for the unclassifiable-context route fallback. */
  fallback: boolean;
}

const PHASE_SET = new Set<string>(BATTLE_PHASES);

/** Normalise any phase-ish input to the five-phase vocabulary. */
export function asBattlePhase(phase: BattlePhase | string | null | undefined): BattlePhase {
  if (phase && PHASE_SET.has(phase)) return phase as BattlePhase;
  return "day";
}

/**
 * Adapter for the legacy four-name table the running engine still
 * uses (WorldConstants.getDayPhase: dawn/day/dusk/night, and
 * PixiWorldCanvas's private copy). Retires when worldClock.ts lands
 * and consumers read the five-phase table directly.
 */
export function phaseFromLegacyPhase(legacy: string | null | undefined): BattlePhase {
  switch (legacy) {
    case "dawn": return "morn";
    case "day": return "day";
    case "dusk": return "eve";
    case "night": return "nite";
    default: return asBattlePhase(legacy);
  }
}

export function getBattleSceneDef(sceneId: string): BattleSceneDef | undefined {
  return SCENES.scenes[sceneId];
}

export function resolveBattleScene(ctx: BattleEncounterContext): ResolvedBattleScene {
  let sceneId: string | undefined;
  let via: BattleSceneVia = "fallback";

  if (ctx.standingTile != null && TILE_SCENE[ctx.standingTile]) {
    sceneId = TILE_SCENE[ctx.standingTile];
    via = "tile";
  } else if (ctx.mapId && BINDINGS[ctx.mapId]) {
    sceneId = BINDINGS[ctx.mapId];
    via = "map-binding";
  } else if (ctx.interior) {
    sceneId = "interior";
    via = "interior-flag";
  }

  const fallback = sceneId === undefined || !SCENES.scenes[sceneId];
  if (fallback) {
    sceneId = FALLBACK_SCENE_ID;
    via = "fallback";
  }

  const def = SCENES.scenes[sceneId!];
  const wanted = asBattlePhase(ctx.phase);
  const forcedNite = def.forceNite;
  const phaseUsed: BattlePhase = forcedNite ? "nite" : wanted;

  const base: "day" | "nite" = phaseUsed === "day" || phaseUsed === "morn" || phaseUsed === "eve" ? "day" : "nite";
  const palette = def[base];
  const tint = !forcedNite && (phaseUsed === "morn" || phaseUsed === "eve")
    ? SCENES.phaseTint[phaseUsed] ?? null
    : null;

  return {
    sceneId: sceneId!,
    label: def.label,
    motif: def.motif,
    palette,
    tint,
    phaseUsed,
    forcedNite,
    via,
    fallback,
  };
}

// ---------------------------------------------------------------------------
// Scene geometry — the shared drawing. One coordinate space (800x450,
// the HGSS scene proportions: horizon high, ground plane below) drawn
// by every renderer: far field, motif silhouettes standing on the
// horizon, mid band, ground with a shaded strip under the horizon,
// and the two battler platforms (enemy far/small, player near/large).
// Scene art only: platforms and their contact shading belong to the
// scene/composite — no battler art is touched here, and nothing here
// bakes a shadow INTO a creature sprite (standing no-baked-shadows
// rule: the soft ellipse under a platform is ground art, drawn from
// the scene palette).

export const SCENE_W = 800;
export const SCENE_H = 450;
const HORIZON_Y = 168;

export interface SceneShape {
  kind: "rect" | "circle" | "ellipse" | "polygon";
  fill: string;
  x?: number; y?: number; w?: number; h?: number;
  cx?: number; cy?: number; r?: number;
  rx?: number; ry?: number;
  points?: [number, number][];
}

export interface BattleSceneGeometry {
  width: number;
  height: number;
  horizonY: number;
  /** Back-to-front shapes, excluding platforms and tint. */
  shapes: SceneShape[];
  platforms: { enemy: SceneShape; player: SceneShape; enemyShade: SceneShape; playerShade: SceneShape };
  tint: { color: string; alpha: number } | null;
}

export interface PlatformAnchors {
  enemy: { x: number; y: number };
  player: { x: number; y: number };
}

/** Anchors in scene space matching PixiBattleCanvas battler bases. */
export const DEFAULT_ANCHORS: PlatformAnchors = {
  enemy: { x: 0.78 * SCENE_W, y: 0.42 * SCENE_H },
  player: { x: 0.22 * SCENE_W, y: 0.78 * SCENE_H },
};

function motifShapes(motif: string, p: BattleScenePalette): SceneShape[] {
  const shapes: SceneShape[] = [];
  const base = HORIZON_Y;
  switch (motif) {
    case "trees": {
      // Tree line: canopy circles on trunks, standing on the horizon.
      const trees: [number, number][] = [[40, 46], [130, 34], [215, 52], [330, 30], [455, 44], [560, 32], [655, 50], [745, 36]];
      for (const [x, r] of trees) {
        shapes.push({ kind: "rect", fill: p.accent, x: x - 4, y: base - r - 14, w: 8, h: 16 });
        shapes.push({ kind: "circle", fill: p.farBand, cx: x, cy: base - r, r });
      }
      break;
    }
    case "buildings": {
      const blocks: [number, number, number][] = [[10, 90, 74], [110, 64, 104], [185, 120, 58], [315, 78, 88], [405, 140, 66], [555, 70, 96], [635, 110, 62], [755, 44, 80]];
      for (const [x, w, h] of blocks) {
        shapes.push({ kind: "rect", fill: p.farBand, x, y: base - h, w, h });
      }
      // Lit windows at night (accent) / shutters by day: a sparse grid.
      for (const [x, w, h] of blocks) {
        for (let wy = base - h + 10; wy < base - 12; wy += 18) {
          for (let wx = x + 8; wx < x + w - 10; wx += 16) {
            if ((wx * 7 + wy * 13) % 3 === 0) {
              shapes.push({ kind: "rect", fill: p.accent, x: wx, y: wy, w: 7, h: 9 });
            }
          }
        }
      }
      break;
    }
    case "waves": {
      // Distant isle + foam arcs on the water plane.
      shapes.push({ kind: "polygon", fill: p.farBand, points: [[300, base], [380, base - 34], [470, base]] });
      shapes.push({ kind: "circle", fill: p.farBand, cx: 385, cy: base - 30, r: 12 });
      for (let i = 0; i < 9; i++) {
        const y = base + 42 + i * 26;
        const x = ((i * 173) % 700) + 30;
        shapes.push({ kind: "ellipse", fill: p.accent, cx: x, cy: y, rx: 26, ry: 4 });
      }
      break;
    }
    case "crystals": {
      const rocks: [number, number, number][] = [[30, 120, 44], [180, 90, 30], [520, 140, 52], [690, 100, 36]];
      for (const [x, w, h] of rocks) {
        shapes.push({ kind: "polygon", fill: p.farBand, points: [[x, base], [x + w * 0.4, base - h], [x + w, base]] });
      }
      // Glowing crystals (accent) — the cave's authored light points.
      const shards: [number, number][] = [[150, 30], [420, 40], [640, 26], [735, 34]];
      for (const [x, h] of shards) {
        shapes.push({ kind: "polygon", fill: p.accent, points: [[x - 8, base], [x, base - h], [x + 8, base]] });
      }
      break;
    }
    case "panels": {
      // Wall panelling: vertical seams + a picture rail, floor boards below.
      for (let x = 60; x < SCENE_W; x += 92) {
        shapes.push({ kind: "rect", fill: p.farBand, x, y: 18, w: 3, h: base - 30 });
      }
      shapes.push({ kind: "rect", fill: p.accent, x: 0, y: base - 26, w: SCENE_W, h: 5 });
      for (let i = 0; i < 7; i++) {
        shapes.push({ kind: "polygon", fill: p.groundShade, points: [[60 + i * 110, SCENE_H], [150 + i * 110, HORIZON_Y + 34], [162 + i * 110, HORIZON_Y + 34], [84 + i * 110, SCENE_H]] });
      }
      break;
    }
    case "banners": {
      // Dojo: hanging banners in the far band colour's accent trim.
      for (let x = 70; x < SCENE_W; x += 150) {
        shapes.push({ kind: "rect", fill: p.farBand, x, y: 12, w: 54, h: 96 });
        shapes.push({ kind: "rect", fill: p.accent, x: x + 6, y: 18, w: 42, h: 4 });
        shapes.push({ kind: "circle", fill: p.accent, cx: x + 27, cy: 58, r: 11 });
      }
      for (let x = 40; x < SCENE_W; x += 110) {
        shapes.push({ kind: "rect", fill: p.farBand, x, y: base - 8, w: 3, h: 10 });
      }
      break;
    }
    case "hedge": {
      // Hedge line: overlapping bumps; flower dots on the ground plane.
      for (let x = 20; x < SCENE_W; x += 64) {
        shapes.push({ kind: "circle", fill: p.farBand, cx: x, cy: base - 16, r: 30 });
      }
      for (let i = 0; i < 14; i++) {
        const x = ((i * 211) % 760) + 20;
        const y = base + 50 + ((i * 67) % 200);
        shapes.push({ kind: "circle", fill: p.accent, cx: x, cy: y, r: 4 });
      }
      break;
    }
    default:
      break;
  }
  return shapes;
}

export function sceneGeometry(
  resolved: ResolvedBattleScene,
  anchors: PlatformAnchors = DEFAULT_ANCHORS,
  depth: { verticalDepthScale: number; platformHeightScale: number } = { verticalDepthScale: 1, platformHeightScale: 1 },
): BattleSceneGeometry {
  const p = resolved.palette;
  const shapes: SceneShape[] = [
    { kind: "rect", fill: p.sky, x: 0, y: 0, w: SCENE_W, h: HORIZON_Y },
    { kind: "rect", fill: p.mid, x: 0, y: HORIZON_Y, w: SCENE_W, h: 16 },
    { kind: "rect", fill: p.ground, x: 0, y: HORIZON_Y + 16, w: SCENE_W, h: SCENE_H - HORIZON_Y - 16 },
    { kind: "rect", fill: p.groundShade, x: 0, y: HORIZON_Y + 16, w: SCENE_W, h: 14 },
    { kind: "rect", fill: p.farBand, x: 0, y: HORIZON_Y - 6, w: SCENE_W, h: 10 },
    // Motifs draw LAST among the bands: horizon silhouettes extend UP
    // from the horizon line, and ground-plane details (foam arcs,
    // flowers, floor boards) extend DOWN onto the ground — both must
    // sit on top of the band rects or the ground plane erases them.
    ...motifShapes(resolved.motif, p),
  ];

  // Visual generation switcher (landing composition, 2026-10-29):
  // platform staging flattens toward the horizon by the active
  // profile's battle scales — centre depth interpolates from the
  // horizon line, ellipse height scales. The default (Gen 5) scales
  // are exactly 1, so the master geometry is byte-identical; scene
  // art (bands, motifs, palettes) is never scaled — profiles change
  // staging geometry only (the switcher's one-dial rule).
  const platform = (a: { x: number; y: number }, rx: number, ry: number) => {
    const flatY = HORIZON_Y + (a.y - HORIZON_Y) * depth.verticalDepthScale;
    const flatRy = ry * depth.platformHeightScale;
    return {
      fill: p.platform,
      rim: p.platformRim,
      cx: a.x, cy: flatY + flatRy * 0.55, rx, ry: flatRy,
    };
  };
  const ep = platform(anchors.enemy, 148, 25);
  const pp = platform(anchors.player, 168, 30);
  const plat = (q: typeof ep): SceneShape => ({ kind: "ellipse", fill: q.fill, cx: q.cx, cy: q.cy, rx: q.rx, ry: q.ry });
  const shade = (q: typeof ep): SceneShape => ({ kind: "ellipse", fill: q.rim, cx: q.cx, cy: q.cy + 5, rx: q.rx + 7, ry: q.ry + 4 });

  return {
    width: SCENE_W,
    height: SCENE_H,
    horizonY: HORIZON_Y,
    shapes,
    platforms: {
      enemy: plat(ep),
      player: plat(pp),
      enemyShade: shade(ep),
      playerShade: shade(pp),
    },
    tint: resolved.tint,
  };
}
