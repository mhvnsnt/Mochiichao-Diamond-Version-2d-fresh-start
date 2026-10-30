import React from 'react';
import { playCue } from '../../lib/soundCues';
import { useMenuNavigation } from '../../lib/useMenuNavigation';

/**
 * UiChoiceMenu — the kit's choice menu (YES / NO and short option
 * lists), ported from the HGSS yes/no systems: src/list_menu_2d.c's
 * CreateYesNoMenu / Std_CreateYesNoMenu (the 2-item menu as a
 * factory of the general choice menu — first item value 0, second
 * LIST_CANCEL, B is the cancel key) and src/yes_no_prompt.c (a
 * template with an initial cursor position, a highlighted selected
 * button, B always means No, pad + touch treated identically).
 * On a two-option menu the source moves by toggling (cursorPos
 * ^= 1), which is exactly wrap-around on two rows; this component
 * wraps on longer option lists too, following Emerald's simple
 * menu processor (pret-pokeemerald src/menu.c Menu_MoveCursor,
 * which wraps, vs its Menu_MoveCursorNoWrapAround sibling — the
 * corpus keeps both, chosen per menu).
 *
 * Renders as real buttons in a row (the DialogueBox YES/NO seat):
 * the cursor starts on `initial` (default 0 = the affirmative),
 * arrows move it with wrap, confirm chooses the highlighted option,
 * Escape/B chooses the cancel option (the last one — NO on a
 * yes/no menu) instead of trapping the player, and clicking a
 * button chooses it directly.
 *
 * Cue discipline: this component plays ONLY the cursor cue. The
 * decision cue (ui.confirm for an affirmative, ui.cancel for the
 * cancel option) is the caller's — DialogueBox's choose() is the
 * game's one choke point for YES/NO answers, and a press must
 * never speak twice.
 *
 * Focus discipline: the buttons are tabIndex={-1} — keyboard input
 * runs solely through useMenuNavigation, so an Enter press can
 * never fire BOTH the hook's confirm and a focused button's
 * native click (which would answer the choice twice). The cursor
 * ring is the focus indicator, as on MenuList's selected row.
 */
export function UiChoiceMenu({ options, onChoose, initial = 0, cancelIndex }: {
  options: string[];
  onChoose: (index: number) => void;
  initial?: number;
  /** Option chosen by B / Escape. Default: the last option. */
  cancelIndex?: number;
}) {
  const [selected, setSelected] = React.useState(initial);
  const cancel = cancelIndex ?? options.length - 1;

  useMenuNavigation({
    rows: options.map(() => ({})),
    selected,
    onSelect: (i) => { playCue('ui.cursor'); setSelected(i); },
    onConfirm: (i) => onChoose(i),
    onCancel: () => onChoose(cancel),
    wrap: true,
    cues: false,
  });

  return (
    <div className="flex gap-3 justify-end" role="group" aria-label="Choice">
      {options.map((label, i) => (
        <button
          key={label + i}
          type="button"
          tabIndex={-1}
          aria-current={i === selected || undefined}
          onClick={(e) => { e.stopPropagation(); onChoose(i); }}
          onMouseEnter={() => { if (i !== selected) { playCue('ui.cursor'); setSelected(i); } }}
          onFocus={() => { if (i !== selected) { playCue('ui.cursor'); setSelected(i); } }}
          className={`game-button px-6 py-2 font-bold min-h-[48px] ${
            i === selected ? 'ring-2 ring-yellow-300 brightness-125' : 'opacity-90'
          }`}
        >
          <span aria-hidden="true">{i === selected ? '► ' : ''}</span>{label}
        </button>
      ))}
    </div>
  );
}
