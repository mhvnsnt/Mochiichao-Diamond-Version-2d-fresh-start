import { describe, it, expect } from 'vitest';
import {
  isSelectable, firstSelectable, lastSelectable,
  moveCursor, pageCursor, scrollOffsetFor,
} from './uiMenuNav';
import type { NavRow } from './uiMenuNav';

const rows = (n: number): NavRow[] => Array.from({ length: n }, () => ({}));

describe('uiMenuNav — HGSS list-menu input model, ported', () => {
  it('moves one row up/down (ListMenu_ProcessInput Up/Down)', () => {
    expect(moveCursor(rows(5), 2, 1, false)).toEqual({ index: 3, atBoundary: false });
    expect(moveCursor(rows(5), 2, -1, false)).toEqual({ index: 1, atBoundary: false });
  });

  it('stops at the ends without wrap and flags the boundary (HGSS behaviour)', () => {
    expect(moveCursor(rows(5), 4, 1, false)).toEqual({ index: 4, atBoundary: true });
    expect(moveCursor(rows(5), 0, -1, false)).toEqual({ index: 0, atBoundary: true });
  });

  it('wraps past the ends when wrap is on (short fully-visible menus)', () => {
    expect(moveCursor(rows(5), 4, 1, true)).toEqual({ index: 0, atBoundary: false });
    expect(moveCursor(rows(5), 0, -1, true)).toEqual({ index: 4, atBoundary: false });
  });

  it('skips header and disabled rows (LIST_HEADER skip)', () => {
    const r: NavRow[] = [{}, { header: true }, {}, { disabled: true }, {}];
    expect(isSelectable(r[1])).toBe(false);
    expect(isSelectable(r[3])).toBe(false);
    expect(moveCursor(r, 0, 1, false).index).toBe(2);
    expect(moveCursor(r, 2, 1, false).index).toBe(4);
    expect(moveCursor(r, 2, -1, false).index).toBe(0);
    // Wrap keeps skipping across the seam.
    expect(moveCursor(r, 4, 1, true).index).toBe(0);
  });

  it('first/last selectable respect headers and disabled rows', () => {
    const r: NavRow[] = [{ header: true }, {}, {}, { disabled: true }];
    expect(firstSelectable(r)).toBe(1);
    expect(lastSelectable(r)).toBe(2);
    expect(firstSelectable([{ header: true }])).toBe(-1);
  });

  it('pages by maxShowed and clamps at the last selectable row (Left/Right page scroll)', () => {
    expect(pageCursor(rows(12), 0, 1, 5)).toEqual({ index: 5, atBoundary: false });
    expect(pageCursor(rows(12), 10, 1, 5)).toEqual({ index: 11, atBoundary: true });
    expect(pageCursor(rows(12), 11, -1, 5)).toEqual({ index: 6, atBoundary: false });
  });

  it('handles an empty list without landing anywhere', () => {
    expect(moveCursor([], 0, 1, true)).toEqual({ index: -1, atBoundary: true });
  });
});

describe('scrollOffsetFor — the visible window (itemsAbove)', () => {
  it('is 0 while the whole list fits', () => {
    expect(scrollOffsetFor(4, 0, 5, 5)).toBe(0);
    expect(scrollOffsetFor(2, 0, 6, 4)).toBe(0);
  });

  it('keeps the selected row visible and clamps to the list', () => {
    // Walking to the bottom of a 12-row list shown 5 at a time:
    // the final window starts at 7 and the cursor is its last row.
    let off = 0;
    for (let sel = 0; sel < 12; sel++) off = scrollOffsetFor(sel, off, 5, 12);
    expect(off).toBe(7);
    // And walking back to the top returns the window to 0.
    for (let sel = 11; sel >= 0; sel--) off = scrollOffsetFor(sel, off, 5, 12);
    expect(off).toBe(0);
  });

  it('never hides the selected row mid-list', () => {
    let off = 0;
    for (let sel = 0; sel < 20; sel++) {
      off = scrollOffsetFor(sel, off, 6, 20);
      expect(sel).toBeGreaterThanOrEqual(off);
      expect(sel).toBeLessThan(off + 6);
    }
  });
});
