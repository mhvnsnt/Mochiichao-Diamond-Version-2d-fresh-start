/**
 * Back-sprite regression tests (2026-10-29, owner bug report: in battle
 * the player's creature faced the player instead of showing its back).
 *
 * The audit behind these tests eye-checked every locked atlas cell by
 * cell (back-sprite-fix AUDIT.md). These tests pin the wiring-level
 * guarantees so the defect classes cannot return silently:
 * - the player side always resolves to the BACK view, the opponent to FRONT;
 * - no species' back cell is the same cell as its front cell (the
 *   Mechapion failure mode: no battle_back frame, def fell back to front);
 * - the audited cell corrections stay corrected;
 * - the battle overrides are exactly the intended set.
 */
import { describe, it, expect } from 'vitest';
import { SHEET_DEFS, battleView, battleCell, battleSpriteUrl, getSheetDef } from './spriteSheets';
import { folderForSpecies } from './creatureAnimation';

describe('battle view mapping', () => {
  it('player side is the back view, opponent side is the front view', () => {
    expect(battleView(true)).toBe('back');
    expect(battleView(false)).toBe('front');
  });
});

describe('every sheet def has a distinct back cell', () => {
  it('no def reuses its front cell as its back cell', () => {
    for (const def of Object.values(SHEET_DEFS)) {
      const front = battleCell(def, 'front');
      const back = battleCell(def, 'back');
      expect(
        back.x !== front.x || back.y !== front.y,
        `${def.speciesId} ${def.name}: back cell equals front cell`,
      ).toBe(true);
    }
  });
});

describe('audited battle-cell corrections (2026-10-29)', () => {
  // [speciesId, expected front cell, expected back cell]
  const cases: [string, { x: number; y: number }, { x: number; y: number }][] = [
    // swapped front/back in the source manifests
    ['039', { x: 0, y: 0 }, { x: 64, y: 0 }], // Shellguard
    ['042', { x: 0, y: 0 }, { x: 128, y: 0 }], // Wispkin
    ['043', { x: 64, y: 0 }, { x: 0, y: 0 }], // Duskfiend
    // battle_back cell held front art; repointed at the genuine back cell
    ['004', { x: 256, y: 0 }, { x: 0, y: 0 }], // Razorgater
    ['005', { x: 64, y: 0 }, { x: 128, y: 0 }], // Chromejaww
    ['006', { x: 64, y: 0 }, { x: 320, y: 0 }], // Reaperdile
    ['015', { x: 192, y: 0 }, { x: 64, y: 0 }], // Quakehound
    ['021', { x: 128, y: 0 }, { x: 192, y: 0 }], // Stormtalon
    ['022', { x: 128, y: 0 }, { x: 64, y: 0 }], // Finblade (back-choice correction 2026-10-29: manifest roles were swapped; (64,0) is the true rear, (192,0) is dorsal)
    ['036', { x: 0, y: 0 }, { x: 256, y: 0 }], // Cragarm
    ['038', { x: 0, y: 0 }, { x: 128, y: 0 }], // Sproutle
    ['033', { x: 0, y: 0 }, { x: 320, y: 0 }], // Mechapion (3/4 rear cell; true back is the cut)
    // the reported species: its atlas back cell was always genuine
    ['007', { x: 192, y: 0 }, { x: 0, y: 0 }], // Tyrage
  ];
  for (const [id, front, back] of cases) {
    it(`${id} resolves front ${front.x},${front.y} / back ${back.x},${back.y}`, () => {
      const def = getSheetDef(id);
      expect(def).not.toBeNull();
      expect(battleCell(def!, 'front')).toEqual(front);
      expect(battleCell(def!, 'back')).toEqual(back);
    });
  }
});

describe('battle overrides', () => {
  it('Gearkid and Mechapion player sides use their back cuts', () => {
    expect(battleSpriteUrl('032', true)).toBeTruthy();
    expect(battleSpriteUrl('033', true)).toBeTruthy();
  });
  it('Dorowani player side has no override left (atlas back cell is used)', () => {
    expect(battleSpriteUrl('147', true)).toBeNull();
  });
  it('Gabu opponent cut resolves under both the legacy and canonical ids', () => {
    expect(battleSpriteUrl('148', false)).toBeTruthy();
    expect(battleSpriteUrl('150', false)).toBeTruthy();
  });
  it('species without overrides fall back to cells (null override)', () => {
    expect(battleSpriteUrl('007', true)).toBeNull();
    expect(battleSpriteUrl('007', false)).toBeNull();
  });
});

describe('Gabu canonical id 150', () => {
  it('has a sheet def with the same battle cells as 148', () => {
    const a = getSheetDef('148');
    const b = getSheetDef('150');
    expect(b).not.toBeNull();
    expect(battleCell(b!, 'front')).toEqual(battleCell(a!, 'front'));
    expect(battleCell(b!, 'back')).toEqual(battleCell(a!, 'back'));
  });
  it('resolves to the gabu animation folder', () => {
    expect(folderForSpecies('150')).toBe('gabu');
  });
});
