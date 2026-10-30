/**
 * Visual generation switcher — PRESENTATION FLATNESS ONLY.
 *
 * Owner correction, 2026-10-29 ~22:04-22:05 CDT: switching generation
 * does not reduce colour, quality, lighting, colourways, content, or
 * animation content. The one dial is how dimensional the pixels read:
 * Gen 5 keeps the master build's layered 2.5D staging; each lower
 * profile presents the same pixels with less vertical projection and
 * less overhead/depth separation, until Gen 1 is a flat top-down tile
 * presentation.
 *
 * The world is built once. These profiles never select another map,
 * tileset, palette, texture, sprite, light pass, or animation set.
 * They only change geometry already present in the renderers:
 *   - the size and draw layer of the existing canopy/roof overlays;
 *   - how far those overlays lead the depth sort;
 *   - the vertical separation and platform height in battle.
 *
 * Gen 5 is the no-op profile: its world values are the exact values
 * the BW2 Phase A renderer used before this module existed
 * (canopy 1.5 x 1.375 tiles at row -0.4; roof 1 x 1.5 tiles at
 * row -0.4), and its battle values reproduce the exact base
 * positions and platform heights in PixiBattleCanvas.
 */

export type VisualStyleId = 'GEN5' | 'GEN4' | 'GEN3' | 'GEN2' | 'GEN1';

export type ForegroundLayer = 'depth-sorted' | 'ground';

export interface StyleProfile {
  id: VisualStyleId;
  generation: 5 | 4 | 3 | 2 | 1;
  /** Short value shown in Settings. */
  label: string;
  /** Plain-language name used in records and tests. */
  presentation: string;
  /** 0 = master 2.5D read; 4 = fully flat top-down read. */
  flatnessStep: 0 | 1 | 2 | 3 | 4;
  world: {
    /** Whether canopy/roof overlays join the actor depth sort or are
     *  folded into the ground pass beneath every actor. */
    foregroundLayer: ForegroundLayer;
    canopy: {
      widthTiles: number;
      heightTiles: number;
      /** Rows the overlay leads its ground tile in the depth sort. */
      depthLeadTiles: number;
    };
    roof: {
      /** Width is deliberately not a profile parameter: the current
       *  renderer stamps one tile at a time, while the env master
       *  composes one object per building run. Height and depth lead
       *  apply identically to either construction. */
      heightTiles: number;
      depthLeadTiles: number;
    };
    /** Vertical scale applied to relief tiles (ledge, waterfall,
     *  stairs) inside their own ground cell, anchored to the cell's
     *  top edge. The same texture pixels are drawn flatter; the
     *  cell's existing flat base colour shows below them. Exteriors
     *  only — interiors carry no relief staging to flatten. */
    reliefHeightScale: number;
  };
  battle: {
    /** Multiplier on the master scene's vertical separation between
     *  the two battler ground lines, measured around the floor line. */
    verticalDepthScale: number;
    /** Multiplier on the master platform ellipse heights. Width,
     *  colour, alpha, sprites, and floor colours do not change. */
    platformHeightScale: number;
    /** The WorldEngine inline arena draws its floor as a CSS grid
     *  plane tilted rotateX(60deg) under a 1000px perspective. This
     *  is that plane's tilt: the single strongest depth cue on that
     *  surface. Gen 5 = the exact master 60deg; Gen 1 = 0deg, a flat
     *  top-down grid. The grid's colours, spacing, and scale (1.5)
     *  never change. */
    gridTiltDeg: number;
  };
}

export const VISUAL_STYLE_ORDER: VisualStyleId[] = ['GEN5', 'GEN4', 'GEN3', 'GEN2', 'GEN1'];

export const STYLE_PROFILES: Record<VisualStyleId, StyleProfile> = {
  GEN5: {
    id: 'GEN5',
    generation: 5,
    label: 'GEN 5 · BW2',
    presentation: 'Full layered 2.5D master presentation',
    flatnessStep: 0,
    world: {
      foregroundLayer: 'depth-sorted',
      canopy: { widthTiles: 1.5, heightTiles: 1.375, depthLeadTiles: 0.4 },
      roof: { heightTiles: 1.5, depthLeadTiles: 0.4 },
      reliefHeightScale: 1,
    },
    battle: { verticalDepthScale: 1, platformHeightScale: 1, gridTiltDeg: 60 },
  },
  GEN4: {
    id: 'GEN4',
    generation: 4,
    label: 'GEN 4',
    presentation: 'One step flatter: raised foreground remains, with less projection',
    flatnessStep: 1,
    world: {
      foregroundLayer: 'depth-sorted',
      canopy: { widthTiles: 1.4, heightTiles: 1.24, depthLeadTiles: 0.3 },
      roof: { heightTiles: 1.32, depthLeadTiles: 0.3 },
      reliefHeightScale: 0.88,
    },
    battle: { verticalDepthScale: 0.82, platformHeightScale: 0.88, gridTiltDeg: 46 },
  },
  GEN3: {
    id: 'GEN3',
    generation: 3,
    label: 'GEN 3',
    presentation: 'Low overhead layer: foreground still covers, but barely rises from the tile',
    flatnessStep: 2,
    world: {
      foregroundLayer: 'depth-sorted',
      canopy: { widthTiles: 1.28, heightTiles: 1.12, depthLeadTiles: 0.18 },
      roof: { heightTiles: 1.18, depthLeadTiles: 0.18 },
      reliefHeightScale: 0.76,
    },
    battle: { verticalDepthScale: 0.62, platformHeightScale: 0.74, gridTiltDeg: 32 },
  },
  GEN2: {
    id: 'GEN2',
    generation: 2,
    label: 'GEN 2',
    presentation: 'Tile-layer presentation: canopy and roof sit in the ground plane',
    flatnessStep: 3,
    world: {
      foregroundLayer: 'ground',
      canopy: { widthTiles: 1.12, heightTiles: 1.03, depthLeadTiles: 0 },
      roof: { heightTiles: 1.04, depthLeadTiles: 0 },
      reliefHeightScale: 0.64,
    },
    battle: { verticalDepthScale: 0.4, platformHeightScale: 0.58, gridTiltDeg: 16 },
  },
  GEN1: {
    id: 'GEN1',
    generation: 1,
    label: 'GEN 1',
    presentation: 'Fully flat top-down tile presentation',
    flatnessStep: 4,
    world: {
      foregroundLayer: 'ground',
      canopy: { widthTiles: 1, heightTiles: 1, depthLeadTiles: 0 },
      roof: { heightTiles: 1, depthLeadTiles: 0 },
      reliefHeightScale: 0.52,
    },
    battle: { verticalDepthScale: 0.2, platformHeightScale: 0.42, gridTiltDeg: 0 },
  },
};

export const DEFAULT_VISUAL_STYLE: VisualStyleId = 'GEN5';

export function isVisualStyleId(value: unknown): value is VisualStyleId {
  return typeof value === 'string' && value in STYLE_PROFILES;
}

/** Unknown or legacy values resolve to the master profile. A bad
 *  settings value must never make the world disappear or fork it. */
export function getStyleProfile(value: unknown): StyleProfile {
  return isVisualStyleId(value) ? STYLE_PROFILES[value] : STYLE_PROFILES.GEN5;
}

/** Master battle geometry, copied from PixiBattleCanvas's original
 *  literals. Keeping the constants here lets the tests prove Gen 5
 *  resolves to exactly the old positions. */
export const BATTLE_MASTER_GEOMETRY = {
  floorY: 0.55,
  playerBaseY: 0.78,
  enemyBaseY: 0.42,
  playerPlatformHeight: 0.07,
  enemyPlatformHeight: 0.06,
} as const;

export function battleBaseY(side: 'player' | 'enemy', profile: StyleProfile): number {
  const master = side === 'player'
    ? BATTLE_MASTER_GEOMETRY.playerBaseY
    : BATTLE_MASTER_GEOMETRY.enemyBaseY;
  return BATTLE_MASTER_GEOMETRY.floorY
    + (master - BATTLE_MASTER_GEOMETRY.floorY) * profile.battle.verticalDepthScale;
}

export function battlePlatformHeight(side: 'player' | 'enemy', profile: StyleProfile): number {
  const master = side === 'player'
    ? BATTLE_MASTER_GEOMETRY.playerPlatformHeight
    : BATTLE_MASTER_GEOMETRY.enemyPlatformHeight;
  return master * profile.battle.platformHeightScale;
}

/** WorldEngine inline arena anchors. The master positions the enemy
 *  billboard at top:10% and the player billboard at bottom:20% of the
 *  arena. Flattening interpolates both toward a shared central band
 *  (38%) by the profile's verticalDepthScale: Gen 5 returns the exact
 *  master anchors; Gen 1 lands both billboards on nearly the same
 *  line (enemy top 32.4%, player bottom 34.4%). */
export function battleEnemyTopPct(profile: StyleProfile): number {
  return 38 + (10 - 38) * profile.battle.verticalDepthScale;
}

export function battlePlayerBottomPct(profile: StyleProfile): number {
  return 38 + (20 - 38) * profile.battle.verticalDepthScale;
}
