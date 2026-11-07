/**
 * Day/night menu variants — per-menu table (UI Art lane, 2026-11-03).
 *
 * What this module IS: the TypeScript copy of the per-menu rows in
 * docs/ui-art/day-night-menu-variants.json (companion to
 * docs/ui-art/day-night-menu-spec.md), so a menu component can ask,
 * without a JSON import (this repo's tsconfig does not enable one),
 * which day/night fields apply to it — and get back ONLY those
 * fields, already resolved, from an already-resolved variant.
 *
 * What this module is NOT: it wires nothing. No component imports
 * it yet, no CSS file reads it, no Settings row is added, no
 * storage key is added, and no menu changes appearance by landing
 * this file. Component wiring is a separate, later PR, and that PR
 * must keep the guards below. This follows the menuSkins.ts
 * precedent: definitions first, wiring only where a component
 * opts in.
 *
 * Single sources of truth (nothing re-invented here):
 * - Palettes, hour table, blend rule, modes: src/lib/menuCustom.ts
 *   (Batch B, PR #60) via src/lib/dayNightMenuVariants.ts, which
 *   already resolves a variant once per render from the SAME
 *   Settings storage the Batch B rows write. This module does NOT
 *   duplicate that resolver; it takes a DayNightMenuVariant as its
 *   input and filters it per menu.
 * - Per-menu rows (which fields change, which detail): the
 *   variants JSON above, copied verbatim below.
 *
 * Known spec/code discrepancy, NOT silently resolved: the spec doc
 * and the variants JSON list DAY 10-17 / EVE 18-20 / NITE 21-23,
 * while menuCustom.ts (corrected gap-fill S1 against the HeartGold
 * decomp table) uses DAY 10-16 / EVE 17-19 / NITE 20-23. Periods
 * and palettes here are delegated to menuCustom.ts, so the code
 * table wins wherever this module is used; the JSON hour lists
 * are NOT copied into this module, and fixing the JSON/spec to
 * match the corrected table is a docs-only follow-up, not guessed
 * here.
 *
 * Guards, unchanged from the spec:
 * - Locked default TITLE: NEVER receives a day/night variant, at
 *   any hour, in any mode. Logo is the uploaded logo PNG, never
 *   font text. This module contains no logo value at all.
 * - Locked default MAIN MENU (v32): NEVER receives a day/night
 *   variant. The 'main-menu' row below applies ONLY when a
 *   non-locked preset is active: resolveDayNightMenu() returns
 *   null for 'main-menu' unless the caller passes
 *   presetActive: true. A caller that does not know whether a
 *   preset is active must pass nothing and gets null — the safe
 *   default. Turning day/night on for the locked default needs
 *   Mars's own explicit yes, like every other default change.
 * - Shared rules (spec): only panel, accent, text/muted, backdrop
 *   sky gradient, and tint overlay change. Nothing moves, nothing
 *   resizes, no label text changes, and button colour identity
 *   never changes (a pink CONTINUE stays pink, a yellow NEW GAME
 *   stays yellow). Where a menu sits over game art (battle,
 *   dialogue over the world) there is no sky gradient — only
 *   panel + accent + tint change, so game art is never repainted.
 * - Not specified here (spec, still owed): roster/party and PC
 *   have no day/night rows, because they have no Y2K skin preset
 *   yet; their rows wait for their presets rather than being
 *   guessed. resolveDayNightMenu() returns null for any menu
 *   without a row, so an unspecified menu can never be tinted
 *   by this module.
 */

import type {
  DayNightMenuVariant,
  DayNightMenuVars,
} from './dayNightMenuVariants';

/** The 8 menus the spec specifies (variants JSON "menus"). */
export type DayNightMenuId =
  | 'main-menu'
  | 'pause'
  | 'settings'
  | 'save-slots'
  | 'bag'
  | 'shop'
  | 'battle'
  | 'dialogue';

/** One day/night changeable field, in variants-JSON wording. */
export type DayNightMenuChange =
  | 'panel'
  | 'accent'
  | 'text'
  | 'tint'
  | 'backdropSky';

export interface DayNightMenuRow {
  menu: DayNightMenuId;
  /** Verbatim "applies" wording from the variants JSON. */
  applies: string;
  changes: DayNightMenuChange[];
  detail?: string;
  note?: string;
}

/**
 * Per-menu rows, copied verbatim from
 * docs/ui-art/day-night-menu-variants.json "menus" (values only;
 * the JSON's period/hour/palette blocks are deliberately NOT
 * copied — see the header note on the hour-table discrepancy).
 */
export const DAY_NIGHT_MENU_ROWS: DayNightMenuRow[] = [
  {
    menu: 'main-menu',
    applies: "Preset menus ONLY. NEVER the locked v32 default without Mars's explicit yes.",
    changes: ['panel', 'accent', 'text', 'backdropSky', 'tint'],
  },
  {
    menu: 'pause',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    note: 'Day/night tint while pausing is still a Batch B NEED (PauseMenu has no Settings entry yet); this row specs the target, it does not claim it works today.',
  },
  {
    menu: 'settings',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'backdropSky', 'tint'],
    note: 'The one menu Batch B already tints today.',
  },
  {
    menu: 'save-slots',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    detail: 'Accent applies to slot frames.',
  },
  {
    menu: 'bag',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    detail: 'Accent applies to category tabs.',
  },
  {
    menu: 'shop',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    detail: 'Accent applies to price/buy accents.',
  },
  {
    menu: 'battle',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    detail: 'No sky gradient: battle sits over game art.',
  },
  {
    menu: 'dialogue',
    applies: 'Always, per resolved period.',
    changes: ['panel', 'accent', 'text', 'tint'],
    detail: 'Dialogue box already reads Batch B CSS vars today; no sky gradient over the world.',
  },
];

export const DAY_NIGHT_MENU_IDS: DayNightMenuId[] = DAY_NIGHT_MENU_ROWS.map(
  (row) => row.menu,
);

export function dayNightMenuRow(menu: DayNightMenuId): DayNightMenuRow | null {
  return DAY_NIGHT_MENU_ROWS.find((row) => row.menu === menu) ?? null;
}

/** True only for the two menus whose row includes a sky gradient. */
export function dayNightMenuHasSky(menu: DayNightMenuId): boolean {
  return dayNightMenuRow(menu)?.changes.includes('backdropSky') ?? false;
}

/**
 * The subset of a resolved variant a menu may actually use, keyed
 * by the CSS variables dayNightMenuVariants.ts already defines.
 * 'text' covers both the text and muted vars (the spec's
 * text/muted pair); 'tint' is the strength-scaled tint, never the
 * raw palette tint. A menu with no row, or the locked main menu
 * without an active preset, gets null — never a partial palette.
 */
export type DayNightMenuAppliedVars = Partial<DayNightMenuVars>;

export interface ResolveDayNightMenuOptions {
  /**
   * Required for 'main-menu': true only when a non-locked preset
   * is active. Defaults to false, so the locked v32 default is
   * exempt unless a caller positively proves a preset is active.
   */
  presetActive?: boolean;
}

export function resolveDayNightMenu(
  menu: DayNightMenuId,
  variant: DayNightMenuVariant,
  options: ResolveDayNightMenuOptions = {},
): DayNightMenuAppliedVars | null {
  const row = dayNightMenuRow(menu);
  if (!row) return null;
  if (menu === 'main-menu' && !options.presetActive) return null;
  const vars: DayNightMenuAppliedVars = {};
  for (const change of row.changes) {
    if (change === 'panel') vars['--menu-daynight-panel'] = variant.vars['--menu-daynight-panel'];
    if (change === 'accent') vars['--menu-daynight-accent'] = variant.vars['--menu-daynight-accent'];
    if (change === 'text') {
      vars['--menu-daynight-text'] = variant.vars['--menu-daynight-text'];
      vars['--menu-daynight-muted'] = variant.vars['--menu-daynight-muted'];
    }
    if (change === 'tint') vars['--menu-daynight-tint'] = variant.vars['--menu-daynight-tint'];
    if (change === 'backdropSky') {
      vars['--menu-daynight-sky-top'] = variant.vars['--menu-daynight-sky-top'];
      vars['--menu-daynight-sky-bottom'] = variant.vars['--menu-daynight-sky-bottom'];
    }
  }
  return vars;
}

/** Convenience: the locked-default guard, stated as a function. */
export function isDayNightExemptMenu(
  menu: DayNightMenuId,
  options: ResolveDayNightMenuOptions = {},
): boolean {
  return menu === 'main-menu' && !options.presetActive;
}
