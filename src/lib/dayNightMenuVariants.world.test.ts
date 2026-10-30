import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  dayNightMenuVariantFor,
  dayNightMenuVariantForWorld,
  getWorldMenuVariant,
  worldDateForState,
} from './dayNightMenuVariants';
import { DAY_NIGHT_COLOURWAYS, type MenuCustomSettings } from './menuCustom';
import {
  deriveWorldState,
  newGameAnchor,
  type WorldClockAnchor,
} from './worldClock';

const root = process.cwd();
const gameShell = readFileSync(join(root, 'src/components/game/GameShell.tsx'), 'utf8');
const dialogueBox = readFileSync(join(root, 'src/components/game/DialogueBox.tsx'), 'utf8');

/** Minimal settings: the resolver reads only these four fields. */
const settings = (
  mode: 'AUTO' | 'CUSTOM' | 'OFF',
  custom: 'MORN' | 'DAY' | 'EVE' | 'NITE' = 'DAY',
  transition = true,
  tint = 100,
): MenuCustomSettings =>
  ({ dayNightMode: mode, dayNightCustom: custom, dayNightTransition: transition, dayNightTint: tint } as unknown as MenuCustomSettings);

/** A real derived state at the given game hour/minute (day 0). */
const stateAt = (hour: number, minute: number) => {
  const anchor: WorldClockAnchor = { anchorRealMs: 0, anchorGameMinutes: hour * 60 + minute, lastSeenDayIndex: 0 };
  return deriveWorldState(anchor, 0);
};

describe('S1 TAIL — worldDateForState carries exactly hour/minute', () => {
  it('maps hour/minute through, on a fixed calendar day', () => {
    for (const [h, m] of [[0, 0], [10, 30], [19, 45], [23, 59]] as const) {
      const d = worldDateForState(stateAt(h, m));
      expect(d.getHours()).toBe(h);
      expect(d.getMinutes()).toBe(m);
      expect(d.getFullYear()).toBe(2000);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(1);
    }
  });
});

describe('S1 TAIL — world variant equals the device variant at the same hour/minute', () => {
  it('AUTO + transition: identical vars for every hour/minute sampled', () => {
    const s = settings('AUTO', 'DAY', true);
    for (const h of [0, 4, 9, 10, 16, 17, 19, 20, 23]) {
      for (const m of [0, 30, 59]) {
        const viaWorld = dayNightMenuVariantForWorld(s, stateAt(h, m));
        const viaDevice = dayNightMenuVariantFor(s, new Date(2000, 0, 1, h, m));
        expect(viaWorld.vars).toEqual(viaDevice.vars);
        expect(viaWorld.visual).toBe(viaDevice.visual);
      }
    }
  });
});

describe('S1 TAIL — world variant named visuals', () => {
  it('AUTO without transition picks the period palette by world hour', () => {
    const s = settings('AUTO', 'DAY', false);
    expect(dayNightMenuVariantForWorld(s, stateAt(10, 0)).visual).toBe('DAY');
    expect(dayNightMenuVariantForWorld(s, stateAt(10, 0)).palette).toEqual(DAY_NIGHT_COLOURWAYS.DAY);
    expect(dayNightMenuVariantForWorld(s, stateAt(22, 0)).visual).toBe('NITE');
    expect(dayNightMenuVariantForWorld(s, stateAt(8, 0)).visual).toBe('MORN');
    expect(dayNightMenuVariantForWorld(s, stateAt(18, 0)).visual).toBe('EVE');
  });
  it('gradual transition blends in the last hour of the period, and only there', () => {
    const on = settings('AUTO', 'DAY', true);
    const off = settings('AUTO', 'DAY', false);
    const blended = dayNightMenuVariantForWorld(on, stateAt(19, 30));
    expect(blended.palette.accent).not.toBe(DAY_NIGHT_COLOURWAYS.EVE.accent);
    expect(blended.palette.accent).not.toBe(DAY_NIGHT_COLOURWAYS.NITE.accent);
    expect(dayNightMenuVariantForWorld(off, stateAt(19, 30)).palette.accent).toBe(DAY_NIGHT_COLOURWAYS.EVE.accent);
  });
  it('CUSTOM and OFF ignore the world clock, as before', () => {
    expect(dayNightMenuVariantForWorld(settings('CUSTOM', 'EVE'), stateAt(10, 0)).palette).toEqual(DAY_NIGHT_COLOURWAYS.EVE);
    expect(dayNightMenuVariantForWorld(settings('OFF'), stateAt(22, 0)).palette).toEqual(DAY_NIGHT_COLOURWAYS.DAY);
  });
});

describe('S1 TAIL — getWorldMenuVariant from the store anchor', () => {
  it('returns null when unanchored (callers fall back to the device clock)', () => {
    expect(getWorldMenuVariant(null)).toBeNull();
  });
  it('reads a new-game anchor at 10:00 as DAY, and 12 game-hours later as NITE', () => {
    const t = 1_000_000;
    const anchor = newGameAnchor(t);
    expect(getWorldMenuVariant(anchor, t)?.visual).toBe('DAY');
    // 180 real seconds x 4 game-minutes/second = 720 game-minutes = 12 hours: 10:00 -> 22:00.
    expect(getWorldMenuVariant(anchor, t + 180_000)?.visual).toBe('NITE');
  });
});

describe('S1 TAIL — both menu call sites read the world clock', () => {
  it('GameShell pause menu and DialogueBox use the anchor with a device fallback', () => {
    for (const src of [gameShell, dialogueBox]) {
      expect(src.includes('getWorldMenuVariant')).toBe(true);
      expect(src.includes('useGameStore(s => s.worldClock)')).toBe(true);
      expect(src.includes('getWorldMenuVariant(worldClockAnchor)')).toBe(true);
      // The old device-only line must be gone: the variant is no longer
      // resolved from the device clock alone at either call site.
      expect(src.includes('const dnVariant = getDayNightMenuVariant();')).toBe(false);
    }
  });
});
