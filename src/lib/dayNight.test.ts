import { describe, expect, it } from 'vitest';
import {
  DAY_NIGHT_MENU_IDS,
  DAY_NIGHT_MENU_ROWS,
  dayNightMenuHasSky,
  dayNightMenuRow,
  isDayNightExemptMenu,
  resolveDayNightMenu,
} from './dayNight';
import {
  dayNightMenuVariantFor,
  type DayNightMenuVariant,
} from './dayNightMenuVariants';
import { DAY_NIGHT_COLOURWAYS, type MenuCustomSettings } from './menuCustom';

const settings = (
  mode: 'AUTO' | 'CUSTOM' | 'OFF',
  custom: 'MORN' | 'DAY' | 'EVE' | 'NITE' = 'DAY',
  transition = false,
  tint = 100,
): MenuCustomSettings =>
  ({ dayNightMode: mode, dayNightCustom: custom, dayNightTransition: transition, dayNightTint: tint } as unknown as MenuCustomSettings);

const variantAt = (hour: number, minute = 0, s = settings('AUTO')): DayNightMenuVariant =>
  dayNightMenuVariantFor(s, new Date(2000, 0, 1, hour, minute));

describe('dayNight per-menu table mirrors the variants JSON rows', () => {
  it('specifies exactly the 8 spec menus, no roster/party or PC row', () => {
    expect(DAY_NIGHT_MENU_IDS).toEqual([
      'main-menu', 'pause', 'settings', 'save-slots',
      'bag', 'shop', 'battle', 'dialogue',
    ]);
    expect(DAY_NIGHT_MENU_ROWS).toHaveLength(8);
    expect(dayNightMenuRow('battle')?.detail).toMatch(/No sky gradient/);
    expect(dayNightMenuRow('bag')?.detail).toMatch(/category tabs/);
  });
  it('only settings and main-menu rows carry a sky gradient', () => {
    expect(DAY_NIGHT_MENU_IDS.filter(dayNightMenuHasSky).sort()).toEqual([
      'main-menu', 'settings',
    ]);
    expect(dayNightMenuHasSky('battle')).toBe(false);
    expect(dayNightMenuHasSky('dialogue')).toBe(false);
  });
});

describe('dayNight locked-default guard', () => {
  it('main-menu resolves to null unless a preset is active', () => {
    const v = variantAt(10);
    expect(resolveDayNightMenu('main-menu', v)).toBeNull();
    expect(resolveDayNightMenu('main-menu', v, { presetActive: false })).toBeNull();
    expect(isDayNightExemptMenu('main-menu')).toBe(true);
    expect(isDayNightExemptMenu('main-menu', { presetActive: true })).toBe(false);
    const preset = resolveDayNightMenu('main-menu', v, { presetActive: true });
    expect(preset).not.toBeNull();
    expect(preset?.['--menu-daynight-sky-top']).toBe(DAY_NIGHT_COLOURWAYS.DAY.skyTop);
  });
  it('non-main menus are never exempt', () => {
    for (const menu of DAY_NIGHT_MENU_IDS) {
      if (menu === 'main-menu') continue;
      expect(isDayNightExemptMenu(menu)).toBe(false);
      expect(resolveDayNightMenu(menu, variantAt(10))).not.toBeNull();
    }
  });
});

describe('dayNight per-menu filtering', () => {
  it('battle/dialogue get panel+accent+text+muted+tint but no sky', () => {
    const v = variantAt(22, 0, settings('CUSTOM', 'NITE'));
    for (const menu of ['battle', 'dialogue'] as const) {
      const applied = resolveDayNightMenu(menu, v)!;
      expect(applied['--menu-daynight-panel']).toBe(DAY_NIGHT_COLOURWAYS.NITE.panel);
      expect(applied['--menu-daynight-accent']).toBe(DAY_NIGHT_COLOURWAYS.NITE.accent);
      expect(applied['--menu-daynight-text']).toBe(DAY_NIGHT_COLOURWAYS.NITE.text);
      expect(applied['--menu-daynight-muted']).toBe(DAY_NIGHT_COLOURWAYS.NITE.muted);
      expect(applied['--menu-daynight-tint']).toBe('rgba(129, 140, 248, 0.14)');
      expect(applied['--menu-daynight-sky-top']).toBeUndefined();
      expect(applied['--menu-daynight-sky-bottom']).toBeUndefined();
    }
  });
  it('settings gets the sky gradient too', () => {
    const applied = resolveDayNightMenu('settings', variantAt(8, 0, settings('CUSTOM', 'MORN')))!;
    expect(applied['--menu-daynight-sky-top']).toBe(DAY_NIGHT_COLOURWAYS.MORN.skyTop);
    expect(applied['--menu-daynight-sky-bottom']).toBe(DAY_NIGHT_COLOURWAYS.MORN.skyBottom);
  });
  it('OFF = DAY at every hour; midnight shows no visual jump (NITE into LATE)', () => {
    for (const h of [0, 4, 10, 17, 20, 23]) {
      const off = resolveDayNightMenu('pause', variantAt(h, 0, settings('OFF')))!;
      expect(off['--menu-daynight-panel']).toBe(DAY_NIGHT_COLOURWAYS.DAY.panel);
    }
    const at23 = resolveDayNightMenu('pause', variantAt(23, 30))!;
    const at0 = resolveDayNightMenu('pause', variantAt(0, 30))!;
    expect(at23['--menu-daynight-accent']).toBe(at0['--menu-daynight-accent']);
  });
  it('tint strength scales the overlay alpha only, palettes still change', () => {
    const v = variantAt(10, 0, settings('CUSTOM', 'EVE', false, 50));
    const applied = resolveDayNightMenu('pause', v)!;
    expect(applied['--menu-daynight-tint']).toBe('rgba(244, 114, 182, 0.06)');
    expect(applied['--menu-daynight-accent']).toBe(DAY_NIGHT_COLOURWAYS.EVE.accent);
  });
});
