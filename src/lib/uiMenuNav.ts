/**
 * uiMenuNav — pure list-menu navigation logic for the UI template kit.
 *
 * PROVENANCE (source-first wiring law — behaviour ported, code original):
 * Ported from the held HeartGold decompilation's list menu input model:
 *   pokeheartgold src/list_menu.c — ListMenu_ProcessInput():
 *     A button returns the value at (cursorPos + itemsAbove);
 *     B button returns LIST_CANCEL;
 *     Up/Down move one row (held keys repeat);
 *     Left/Right (LIST_MULTIPLE_SCROLL_DPAD) or L/R
 *     (LIST_MULTIPLE_SCROLL_L_R) move by maxShowed rows (one page).
 *   pokeheartgold src/list_menu.c — ListMenuChangeSelection() /
 *     ListMenuUpdateSelectedRowIndexAndScroll(): rows whose value is
 *     LIST_HEADER are skipped (never landed on); the visible window
 *     scrolls so the cursor rests near the window's middle row; at
 *     the list ends the cursor STOPS (the caller is told via a
 *     boundary flag — used there for the boundary cue).
 * Seam changes for React/TypeScript: the C task/window state becomes
 * pure functions over an index + a scroll offset (itemsAbove), so any
 * component can hold the state in useState and every rule is unit
 * testable. Header rows and disabled rows are both non-selectable
 * here (disabled is the web/menu-skin analogue of LIST_HEADER for
 * entries that render but cannot be chosen).
 *
 * Wrap-around: HGSS list menus do not wrap. Short, fully-visible
 * menus in this kit DO wrap by default (owner-ordered industry
 * standard for game menus, and the behaviour of this game's own
 * start-menu tradition); long scrolling lists default to the HGSS
 * stop-at-the-end behaviour. The choice is an explicit option on
 * every call — never a hidden global.
 */

export interface NavRow {
  /** Renders but can never be landed on (greyed in list components). */
  disabled?: boolean;
  /** Section header row (HGSS LIST_HEADER analogue): never selectable. */
  header?: boolean;
  /** Hosts pass their own item objects as rows; extra fields are ignored. */
  [key: string]: unknown;
}

export function isSelectable(row: NavRow): boolean {
  return !row.disabled && !row.header;
}

/** First selectable index at or after `from`, or -1 when none exists. */
export function firstSelectable(rows: NavRow[], from = 0): number {
  for (let i = Math.max(0, from); i < rows.length; i++) {
    if (isSelectable(rows[i])) return i;
  }
  return -1;
}

/** Last selectable index at or before `from`, or -1 when none exists. */
export function lastSelectable(rows: NavRow[], from?: number): number {
  for (let i = Math.min(from ?? rows.length - 1, rows.length - 1); i >= 0; i--) {
    if (isSelectable(rows[i])) return i;
  }
  return -1;
}

export interface MoveResult {
  index: number;
  /** True when the move hit the list end without wrapping (HGSS boundary flag). */
  atBoundary: boolean;
}

/**
 * Move the cursor one row in `dir` (-1 up, +1 down), skipping
 * disabled/header rows. With wrap, moving past an end continues at
 * the other end (still skipping). Without wrap, the cursor stays and
 * atBoundary is set.
 */
export function moveCursor(rows: NavRow[], current: number, dir: -1 | 1, wrap: boolean): MoveResult {
  if (rows.length === 0) return { index: -1, atBoundary: true };
  let i = current;
  for (let steps = 0; steps < rows.length; steps++) {
    i += dir;
    if (i < 0 || i >= rows.length) {
      if (!wrap) return { index: current, atBoundary: true };
      i = (i + rows.length) % rows.length;
    }
    if (isSelectable(rows[i])) return { index: i, atBoundary: false };
  }
  return { index: current, atBoundary: true };
}

/**
 * Page move: jump by `pageSize` selectable rows in `dir` (HGSS
 * Left/Right / L/R page scroll, count = maxShowed). Clamps at the
 * first/last selectable row; never wraps.
 */
export function pageCursor(rows: NavRow[], current: number, dir: -1 | 1, pageSize: number): MoveResult {
  let index = current;
  let atBoundary = false;
  for (let n = 0; n < Math.max(1, pageSize); n++) {
    const r = moveCursor(rows, index, dir, false);
    index = r.index;
    if (r.atBoundary) { atBoundary = true; break; }
  }
  return { index, atBoundary };
}

/**
 * Scroll-window position (`itemsAbove`: index of the first visible
 * row) that keeps `selected` visible with the cursor resting near
 * the window's middle row once the list scrolls — the HGSS rule
 * (anchor row = maxShowed/2, rounded up for odd windows). Pure
 * function of the previous offset, so components keep their own state.
 */
export function scrollOffsetFor(selected: number, prevOffset: number, maxShowed: number, total: number): number {
  if (total <= maxShowed) return 0;
  const maxOffset = total - maxShowed;
  let offset = prevOffset;
  if (selected < offset) offset = selected;
  if (selected >= offset + maxShowed) offset = selected - maxShowed + 1;
  // HGSS resting rule: when the window can scroll, prefer the cursor
  // near the middle row rather than pinned to an edge.
  const anchor = Math.floor(maxShowed / 2) + (maxShowed % 2);
  const preferred = selected - anchor + 1;
  if (preferred > offset) offset = Math.min(preferred, maxOffset);
  if (selected - offset > anchor) offset = selected - anchor;
  return Math.max(0, Math.min(offset, maxOffset));
}
