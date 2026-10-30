import React from 'react';
import { playCue } from '../../lib/soundCues';
import '../../lib/uiTokens';
import { scrollOffsetFor } from '../../lib/uiMenuNav';
import { useMenuNavigation } from '../../lib/useMenuNavigation';

/**
 * UiListMenu — the kit's list menu: MenuList's shipped row pattern
 * (game-button rows, ► cursor, selected ring) extended with the
 * parts MenuList never had, ported from the HGSS list menu
 * (pokeheartgold src/list_menu.c):
 *  - disabled and header rows that render but can never be chosen
 *    (LIST_HEADER skip; disabled = greyed, the web analogue),
 *  - a scrolling window of `maxShowed` rows with ▲ / ▼ scroll
 *    indicators when more rows exist above/below (the source draws
 *    the same affordance at the window edges),
 *  - full keyboard control through useMenuNavigation (arrows, page
 *    keys, Home/End, confirm, cancel — HGSS: A chooses, B cancels).
 * A bottom help line describing the selected row is rendered when
 * any row carries help text (MenuHelpLine's pattern).
 *
 * Mouse/touch behaviour matches MenuList exactly: hover/focus moves
 * the cursor with the cursor cue, click confirms with the confirm
 * cue. Rows are real buttons; disabled rows are real disabled
 * buttons, so screen readers and keyboards agree with the pointer.
 *
 * Focus discipline: rows are tabIndex={-1} — keyboard input runs
 * solely through useMenuNavigation, so an Enter press can never
 * fire BOTH the hook's confirm and a focused row's native click
 * (which would run the row's action twice). The cursor ring is
 * the focus indicator, as on MenuList's selected row.
 */
export interface UiListMenuItem {
  label: string;
  help?: string;
  disabled?: boolean;
  header?: boolean;
  action?: () => void;
  [key: string]: unknown;
}

export function UiListMenu({ items, selected, onSelect, onCancel, maxShowed, wrap = true, gapPx, autoFocus = true }: {
  items: UiListMenuItem[];
  selected: number;
  onSelect: (index: number) => void;
  /** B / Escape — every list menu can be left. */
  onCancel?: () => void;
  /** Visible rows before the window scrolls (HGSS maxShowed). */
  maxShowed?: number;
  wrap?: boolean;
  gapPx?: number;
  autoFocus?: boolean;
}) {
  const showed = maxShowed ?? items.length;
  const [offset, setOffset] = React.useState(0);
  React.useEffect(() => {
    setOffset(prev => scrollOffsetFor(selected, prev, showed, items.length));
  }, [selected, showed, items.length]);

  useMenuNavigation({
    rows: items,
    selected,
    onSelect,
    onConfirm: (i) => { const it = items[i]; if (it && !it.disabled && !it.header) it.action?.(); },
    onCancel,
    wrap,
    pageSize: showed,
    enabled: autoFocus,
  });

  const visible = items.slice(offset, offset + showed);
  const canScrollUp = offset > 0;
  const canScrollDown = offset + showed < items.length;
  const selectedItem = items[selected];

  return (
    <div className="flex flex-col" style={{ gap: `${gapPx ?? 15}px` }}>
      {canScrollUp && <div aria-hidden="true" className="ui-list-scroll">▲</div>}
      {visible.map((item, vi) => {
        const i = offset + vi;
        if (item.header) {
          return (
            <div key={`h-${i}`} className="ui-list-header" aria-hidden="true">{item.label}</div>
          );
        }
        const isSel = i === selected;
        return (
          <button
            key={item.label + i}
            type="button"
            tabIndex={-1}
            disabled={item.disabled}
            aria-current={isSel || undefined}
            onClick={() => { if (!item.disabled) { playCue('ui.confirm'); item.action?.(); } }}
            onMouseEnter={() => { if (!item.disabled && i !== selected) { playCue('ui.cursor'); onSelect(i); } }}
            onFocus={() => { if (!item.disabled && i !== selected) { playCue('ui.cursor'); onSelect(i); } }}
            className={`game-button px-4 py-2.5 font-bold text-left flex items-center gap-2 ${
              isSel ? 'ring-2 ring-yellow-300 brightness-125' : 'opacity-90'
            } ${item.disabled ? 'ui-list-disabled' : ''}`}
          >
            <span aria-hidden="true">{isSel ? '►' : '·'}</span>
            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
      {canScrollDown && <div aria-hidden="true" className="ui-list-scroll">▼</div>}
      {selectedItem?.help && (
        <div className="game-panel px-3 py-2 text-sm text-slate-200 shrink-0" role="note">
          {selectedItem.help}
        </div>
      )}
    </div>
  );
}
