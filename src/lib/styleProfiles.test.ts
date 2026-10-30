import { describe, expect, it } from 'vitest';
import {
  BATTLE_MASTER_GEOMETRY,
  STYLE_PROFILES,
  VISUAL_STYLE_ORDER,
  battleBaseY,
  battleEnemyTopPct,
  battlePlatformHeight,
  battlePlayerBottomPct,
  getStyleProfile,
} from './styleProfiles';

const ordered = VISUAL_STYLE_ORDER.map(id => STYLE_PROFILES[id]);

describe('visual style profiles — one flatness dial only', () => {
  it('contains exactly Gen 5 down to Gen 1, in build order', () => {
    expect(VISUAL_STYLE_ORDER).toEqual(['GEN5', 'GEN4', 'GEN3', 'GEN2', 'GEN1']);
    expect(ordered.map(p => p.generation)).toEqual([5, 4, 3, 2, 1]);
    expect(ordered.map(p => p.flatnessStep)).toEqual([0, 1, 2, 3, 4]);
  });

  it('Gen 5 is an exact no-op against the pre-switcher renderer', () => {
    const gen5 = STYLE_PROFILES.GEN5;
    expect(gen5.world.foregroundLayer).toBe('depth-sorted');
    expect(gen5.world.canopy).toEqual({ widthTiles: 1.5, heightTiles: 1.375, depthLeadTiles: 0.4 });
    expect(gen5.world.roof).toEqual({ heightTiles: 1.5, depthLeadTiles: 0.4 });
    expect(gen5.world.reliefHeightScale).toBe(1);
    expect(battleBaseY('player', gen5)).toBeCloseTo(BATTLE_MASTER_GEOMETRY.playerBaseY);
    expect(battleBaseY('enemy', gen5)).toBeCloseTo(BATTLE_MASTER_GEOMETRY.enemyBaseY);
    expect(battlePlatformHeight('player', gen5)).toBeCloseTo(BATTLE_MASTER_GEOMETRY.playerPlatformHeight);
    expect(battlePlatformHeight('enemy', gen5)).toBeCloseTo(BATTLE_MASTER_GEOMETRY.enemyPlatformHeight);
    // Inline arena: exact master tilt + billboard anchors.
    expect(gen5.battle.gridTiltDeg).toBe(60);
    expect(battleEnemyTopPct(gen5)).toBeCloseTo(10);
    expect(battlePlayerBottomPct(gen5)).toBeCloseTo(20);
  });

  it('the inline arena flattens: grid tilt reaches 0 and billboards converge', () => {
    const tilts = ordered.map(p => p.battle.gridTiltDeg);
    expect(tilts).toEqual([60, 46, 32, 16, 0]);
    const enemyTops = ordered.map(p => battleEnemyTopPct(p));
    const playerBottoms = ordered.map(p => battlePlayerBottomPct(p));
    for (let i = 1; i < ordered.length; i++) {
      expect(enemyTops[i]).toBeGreaterThan(enemyTops[i - 1]);
      expect(playerBottoms[i]).toBeGreaterThan(playerBottoms[i - 1]);
    }
    expect(battleEnemyTopPct(STYLE_PROFILES.GEN1)).toBeCloseTo(32.4);
    expect(battlePlayerBottomPct(STYLE_PROFILES.GEN1)).toBeCloseTo(34.4);
  });

  it('every step down is monotonically flatter in world geometry', () => {
    for (let i = 1; i < ordered.length; i++) {
      const above = ordered[i - 1];
      const below = ordered[i];
      expect(below.world.canopy.widthTiles).toBeLessThan(above.world.canopy.widthTiles);
      expect(below.world.canopy.heightTiles).toBeLessThan(above.world.canopy.heightTiles);
      expect(below.world.canopy.depthLeadTiles).toBeLessThanOrEqual(above.world.canopy.depthLeadTiles);
      expect(below.world.roof.heightTiles).toBeLessThan(above.world.roof.heightTiles);
      expect(below.world.roof.depthLeadTiles).toBeLessThanOrEqual(above.world.roof.depthLeadTiles);
      expect(below.world.reliefHeightScale).toBeLessThan(above.world.reliefHeightScale);
    }
  });

  it('Gen 2 and Gen 1 fold the foreground into the ground plane', () => {
    expect(STYLE_PROFILES.GEN4.world.foregroundLayer).toBe('depth-sorted');
    expect(STYLE_PROFILES.GEN3.world.foregroundLayer).toBe('depth-sorted');
    expect(STYLE_PROFILES.GEN2.world.foregroundLayer).toBe('ground');
    expect(STYLE_PROFILES.GEN1.world.foregroundLayer).toBe('ground');
    expect(STYLE_PROFILES.GEN1.world.canopy).toEqual({ widthTiles: 1, heightTiles: 1, depthLeadTiles: 0 });
    expect(STYLE_PROFILES.GEN1.world.roof.heightTiles).toBe(1);
  });

  it('battle staging flattens toward one shared ground line', () => {
    const separations = ordered.map(p => battleBaseY('player', p) - battleBaseY('enemy', p));
    for (let i = 1; i < separations.length; i++) {
      expect(separations[i]).toBeLessThan(separations[i - 1]);
    }
    expect(separations[0]).toBeCloseTo(0.36);
    expect(separations[4]).toBeCloseTo(0.072);
    const platformHeights = ordered.map(p => battlePlatformHeight('player', p));
    for (let i = 1; i < platformHeights.length; i++) {
      expect(platformHeights[i]).toBeLessThan(platformHeights[i - 1]);
    }
  });

  it('the registry carries no palette, colour, lighting, quality, or asset-selection parameter', () => {
    const serialised = JSON.stringify(STYLE_PROFILES).toLowerCase();
    for (const forbidden of ['palette', 'color', 'colour', 'tint', 'brightness', 'saturation', 'textureurl', 'tileset', 'asset']) {
      expect(serialised).not.toContain(forbidden);
    }
  });

  it('unknown values fall back to the Gen 5 master profile', () => {
    expect(getStyleProfile(undefined).id).toBe('GEN5');
    expect(getStyleProfile('GEN9').id).toBe('GEN5');
    expect(getStyleProfile('GEN1').id).toBe('GEN1');
  });
});
