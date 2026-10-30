import React from 'react';
import { useGameStore } from '../store/gameStore';
import { isConfirmKey, isTypingTarget, shoulderKey } from './buttonMode';
import { playCue } from './soundCues';
import { moveCursor, pageCursor, firstSelectable, lastSelectable } from './uiMenuNav';
import type { NavRow } from './uiMenuNav';

/**
 * useMenuNavigation — keyboard control for kit menus, binding the
 * game's existing input translation (buttonMode.ts: isConfirmKey /
 * shoulderKey / isTypingTarget) to the ported list-menu logic
 * (uiMenuNav.ts). No second input system: this hook only asks
 * buttonMode what a key means, exactly like DialogueBox does.
 *
 * Keys: ArrowUp/ArrowDown move (wrap per option), ArrowLeft/
 * ArrowRight and — in BUTTON MODE = LR — Q/E page by `pageSize`
 * rows, Home/End jump to first/last selectable row, confirm =
 * buttonMode A (Enter/Space, + L in L_EQUALS_A mode), cancel =
 * Escape (screens may add their own cancel keys via `cancelKeys` —
 * cancel stays per-screen, per buttonMode's own rule).
 * Boundary hits (no-wrap lists) play the cancel cue softly as the
 * boundary signal; selection moves play 'ui.cursor', confirm plays
 * 'ui.confirm', cancel plays 'ui.cancel' — the cue names MenuList
 * and DialogueBox already use.
 */
export function useMenuNavigation(opts: {
  rows: NavRow[];
  selected: number;
  onSelect: (index: number) => void;
  onConfirm?: (index: number) => void;
  onCancel?: () => void;
  /** Wrap past the ends (short fully-visible menus). Default true. */
  wrap?: boolean;
  /** Rows per page for Left/Right / Q / E. Default: all rows. */
  pageSize?: number;
  /** Extra cancel keys beyond Escape (per-screen, e.g. 'x'). */
  cancelKeys?: string[];
  /**
   * Play the cursor/confirm/cancel cues from this hook (default
   * true). Set false when the host owns a single cue choke point
   * (DialogueBox's choose()) so a press never speaks twice.
   */
  cues?: boolean;
  enabled?: boolean;
}) {
  const buttonMode = useGameStore(s => s.settings.buttonMode);
  const ref = React.useRef(opts);
  ref.current = opts;

  React.useEffect(() => {
    if (opts.enabled === false) return;
    const handler = (e: KeyboardEvent) => {
      const o = ref.current;
      if (o.enabled === false) return;
      if (isTypingTarget(e)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const rows = o.rows;
      if (rows.length === 0) return;
      const wrap = o.wrap !== false;
      const pageSize = o.pageSize ?? rows.length;
      const cur = Math.min(Math.max(o.selected, 0), rows.length - 1);

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const r = moveCursor(rows, cur, e.key === 'ArrowDown' ? 1 : -1, wrap);
        if (r.index !== cur) { if (o.cues !== false) playCue('ui.cursor'); o.onSelect(r.index); }
        else if (r.atBoundary && o.cues !== false) playCue('ui.cancel');
        return;
      }
      const shoulder = shoulderKey(e, buttonMode);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || shoulder) {
        const dir = (e.key === 'ArrowRight' || shoulder === 'R') ? 1 : -1;
        e.preventDefault();
        const r = pageCursor(rows, cur, dir as 1 | -1, pageSize);
        if (r.index !== cur) { if (o.cues !== false) playCue('ui.cursor'); o.onSelect(r.index); }
        else if (r.atBoundary && o.cues !== false) playCue('ui.cancel');
        return;
      }
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const target = e.key === 'Home' ? firstSelectable(rows) : lastSelectable(rows);
        if (target >= 0 && target !== cur) { if (o.cues !== false) playCue('ui.cursor'); o.onSelect(target); }
        return;
      }
      if (o.onConfirm && isConfirmKey(e, buttonMode)) {
        e.preventDefault();
        if (o.cues !== false) playCue('ui.confirm');
        o.onConfirm(cur);
        return;
      }
      if (o.onCancel && (e.key === 'Escape' || (o.cancelKeys ?? []).includes(e.key.toLowerCase()))) {
        e.preventDefault();
        if (o.cues !== false) playCue('ui.cancel');
        o.onCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [buttonMode, opts.enabled]);
}
