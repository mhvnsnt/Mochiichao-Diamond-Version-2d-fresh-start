import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CHEAT_CODES, applyCheatCode, CHEAT_CUBE_ITEM_ID, CHEAT_CUBE_ITEM_NAME, type CheatCodeDef } from '../../lib/cheatCodes';
import { playUiMove } from '../../lib/audioRouting';

/**
 * Cheat Codes panel — the ONE entry surface for the built-in cheat
 * registry (src/lib/cheatCodes.ts), rendered inside Settings
 * (SettingsScreen's CHEAT_CODES screen) and inside the Cheat
 * Console (CheatConsoleView). Same panel, same registry, both
 * doors — the surfaces cannot drift.
 *
 * PRESENTATION (cheat-presentation lane, 2026-10-29;
 * PRESENTATION-SPEC.md in the lane folder): Pokemon menu grammar
 * (list + one description window; state as words on the row) in the
 * game's own font roles. The previous build rendered every line in
 * the inherited MAIN font role, so a decorative title font made
 * descriptions, counts and the record nearly unreadable (proof:
 * cheat-to-mechanic/proof/03-cheat-codes-after.png). Body text now
 * takes the DialogueBox treatment: --dialogue-font at
 * --menu-text-size / --menu-line-height; row text --menu-font;
 * labels --small-font. Settings' chrome (.game-panel, .game-button,
 * the screen title) is untouched, and NO behaviour changed: same
 * registry, same effects, same cheatLog, typing or tapping a code
 * fills the entry box exactly as the old chips did.
 */

// The game's font-role stacks, mirroring DialogueBox's fallbacks.
const DIALOGUE_FONT = 'var(--dialogue-font, "Trebuchet MS", "Segoe UI", system-ui, sans-serif)';
const MENU_FONT = 'var(--menu-font, "Trebuchet MS", "Segoe UI", system-ui, sans-serif)';
const SMALL_FONT = 'var(--small-font, "Trebuchet MS", sans-serif)';

export default function CheatCodesPanel() {
  const wallet = useGameStore(s => s.wallet);
  const cubeCount = useGameStore(s => s.inventory[CHEAT_CUBE_ITEM_ID] || 0);
  const inventory = useGameStore(s => s.inventory);
  const infiniteMoney = useGameStore(s => s.infiniteMoney);
  const infiniteItems = useGameStore(s => s.infiniteItems);
  const guaranteedCatch = useGameStore(s => s.guaranteedCatch);
  const noEncounters = useGameStore(s => s.noEncounters);
  const expMultiplier = useGameStore(s => s.expMultiplier);
  const fastForward = useGameStore(s => s.fastForward);
  const noclip = useGameStore(s => s.noclip);
  const shiny = useGameStore(s => s.shiny);
  const cheated = useGameStore(s => s.cheated);
  const cheatLog = useGameStore(s => s.cheatLog);
  const [code, setCode] = useState('');
  const [selected, setSelected] = useState<CheatCodeDef>(CHEAT_CODES[0]);
  const [message, setMessage] = useState('Enter a cheat code. Every use is recorded in your save.');
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  const run = () => {
    const result = applyCheatCode(code);
    setMessage(result.message);
    setLastOk(result.ok);
    if (result.ok) {
      setCode('');
      const applied = CHEAT_CODES.find(d => d.code === result.code);
      if (applied) setSelected(applied);
    }
  };

  const pick = (def: CheatCodeDef) => {
    // Cursor-move tick: Pokemon list menus sound SE_SELECT when the
    // cursor moves (list_menu moveCursorFunc); ours is the existing
    // audioRouting cursor cue the main menu already uses.
    playUiMove();
    setSelected(def);
    setCode(def.code);
  };

  // Toggle state as a word ON the row (Emerald options-menu rule:
  // you never open a row to learn its state).
  const rowState = (def: CheatCodeDef): string | null => {
    if (def.code === 'INFINITE MONEY') return infiniteMoney ? 'ON' : 'OFF';
    if (def.code === 'INFINITE ITEMS') return infiniteItems ? 'ON' : 'OFF';
    if (def.code === 'PERFECT CATCH') return guaranteedCatch ? 'ON' : 'OFF';
    if (def.code === 'NO ENCOUNTERS') return noEncounters ? 'ON' : 'OFF';
    if (def.code === 'DOUBLE EXP') return expMultiplier > 1 ? 'ON' : 'OFF';
    if (def.code === 'FAST FORWARD') return fastForward ? 'ON' : 'OFF';
    if (def.code === 'SHINY-ON' || def.code === 'SHINY-OFF') return shiny ? 'ON' : 'OFF';
    if (def.code === 'NOCLIP') return noclip ? 'ON' : 'OFF';
    return null;
  };

  // Family groups (cheat-expansion lane): the registry grew past a
  // flat list's honest size, so the cursor list renders in family
  // sections — group header, then that family's rows. Order is the
  // registry's own order (families in first-appearance order, rows
  // in registry order inside each). Same list, same selection, same
  // single description window — only the list is sectioned.
  const families: { name: string; rows: CheatCodeDef[] }[] = [];
  for (const d of CHEAT_CODES) {
    const g = families.find(f => f.name === d.family);
    if (g) g.rows.push(d); else families.push({ name: d.family, rows: [d] });
  }

  const recent = [...cheatLog].slice(-8).reverse();
  const selectedState = rowState(selected);

  const statLabel = 'text-[11px] uppercase tracking-widest text-slate-400';
  const statValue = 'text-lg font-bold tabular-nums';

  return (
    <div className="game-panel p-4 max-w-2xl w-full mx-auto">
      {/* Status strip — the state of the room, legible at a glance. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" style={{ fontFamily: DIALOGUE_FONT }}>
        <div>
          <div className={statLabel} style={{ fontFamily: SMALL_FONT }}>Wallet</div>
          <div className={`${statValue} text-yellow-300`}>{wallet} CR</div>
        </div>
        <div>
          <div className={statLabel} style={{ fontFamily: SMALL_FONT }}>{CHEAT_CUBE_ITEM_NAME}s</div>
          <div className={`${statValue} text-teal-300`}>{cubeCount}</div>
        </div>
        <div>
          <div className={statLabel} style={{ fontFamily: SMALL_FONT }}>Infinite Money</div>
          <div className={`${statValue} ${infiniteMoney ? 'text-red-300' : 'text-teal-300'}`}>{infiniteMoney ? 'ON' : 'OFF'}</div>
        </div>
        <div>
          <div className={statLabel} style={{ fontFamily: SMALL_FONT }}>Cheats Used</div>
          <div className={`${statValue} ${cheated ? 'text-red-300' : 'text-teal-300'}`}>{cheated ? 'YES' : 'NO'}</div>
        </div>
      </div>

      {/* Entry row — typed code + Run (Enter runs, as before). */}
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') run(); }}
          placeholder="INFINITE MONEY"
          aria-label="Cheat code"
          className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white outline-none"
          style={{ fontFamily: DIALOGUE_FONT, fontSize: '16px' }}
        />
        <button onClick={run} className="game-button px-4 py-2 font-bold">Run</button>
      </div>

      {/* Feedback — the screen's message box, dialogue treatment. */}
      <div
        role="status"
        className={`mt-3 min-h-[3rem] ${lastOk === false ? 'text-red-300' : 'text-slate-100'}`}
        style={{ fontFamily: DIALOGUE_FONT, fontSize: 'var(--menu-text-size, 16px)', lineHeight: 'var(--menu-line-height, 1.625)' }}
      >
        {message}
      </div>

      {/* Code list + description — the Pokemon split: cursor list on
          one side, ONE description window for the selected row. */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <div className="flex sm:flex-col flex-wrap gap-2 sm:w-56 shrink-0" role="listbox" aria-label="Cheat codes">
          {families.map(g => (
            <div key={g.name} className="contents sm:flex sm:flex-col sm:gap-2">
              <div
                className="w-full text-[11px] uppercase tracking-widest text-slate-400 pt-1"
                style={{ fontFamily: SMALL_FONT }}
                aria-hidden="true"
              >
                {g.name}
              </div>
              {g.rows.map(d => {
                const isSel = d.code === selected.code;
                const state = rowState(d);
                return (
                  <button
                    key={d.code}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => pick(d)}
                    className="game-button px-3 py-2 text-left flex items-center gap-2"
                    style={{
                      fontFamily: MENU_FONT,
                      fontSize: '15px',
                      borderColor: isSel ? '#fbbf24' : undefined,
                      boxShadow: isSel ? '0 0 0 2px rgba(251, 191, 36, 0.6)' : undefined,
                    }}
                  >
                    <span aria-hidden="true" className="w-3 shrink-0 text-yellow-300">{isSel ? '▶' : ''}</span>
                    <span className="flex-1">{d.code}</span>
                    {d.code === 'NOCLIP' && (
                      <span className="text-[11px] font-bold tracking-wider text-amber-300 border border-amber-300/60 rounded px-1 py-0.5" style={{ fontFamily: DIALOGUE_FONT }}>DEBUG TOOL</span>
                    )}
                    {state && <span className={state === 'ON' ? 'text-red-300 font-bold' : 'text-teal-300 font-bold'}>{state}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex-1 bg-black/40 rounded-lg px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-slate-400" style={{ fontFamily: SMALL_FONT }}>Selected code</div>
          <div className="text-white font-bold text-lg" style={{ fontFamily: DIALOGUE_FONT }}>{selected.code}</div>
          <div
            className="text-slate-100 mt-1"
            style={{ fontFamily: DIALOGUE_FONT, fontSize: 'var(--menu-text-size, 16px)', lineHeight: 'var(--menu-line-height, 1.625)' }}
          >
            {selected.description}
          </div>
          {selectedState && (
            <div className="mt-2 text-slate-300" style={{ fontFamily: DIALOGUE_FONT, fontSize: '15px' }}>
              Now: <span className={`font-bold ${selectedState === 'ON' ? 'text-red-300' : 'text-teal-300'}`}>{selectedState}</span>
            </div>
          )}
          {selected.itemId && (
            <div className="mt-2 text-slate-300" style={{ fontFamily: DIALOGUE_FONT, fontSize: '15px' }}>
              Grants: <span className="font-bold text-teal-300">{selected.itemName ?? CHEAT_CUBE_ITEM_NAME}</span> — you hold {inventory[selected.itemId] || 0}.
            </div>
          )}
        </div>
      </div>

      {/* Cheat record — honest, in the save, readable. */}
      <h3 className="text-slate-200 font-bold mt-6 mb-2 uppercase tracking-widest text-[13px]" style={{ fontFamily: SMALL_FONT }}>Cheat record (saved with your game)</h3>
      {recent.length === 0 ? (
        <div className="text-slate-300" style={{ fontFamily: DIALOGUE_FONT, fontSize: '15px' }}>No cheats used yet on this save.</div>
      ) : (
        <div className="space-y-1">
          {recent.map((entry, i) => (
            <div key={`${entry.at}-${i}`} className="flex justify-between bg-black/40 rounded px-2 py-1" style={{ fontFamily: DIALOGUE_FONT }}>
              <span className="font-bold text-slate-100 text-[15px]">{entry.code}</span>
              <span className="text-slate-400 text-[13px]" style={{ fontFamily: SMALL_FONT }}>{new Date(entry.at).toLocaleString()}</span>
            </div>
          ))}
          {cheatLog.length > recent.length && (
            <div className="text-slate-400 text-[13px]" style={{ fontFamily: SMALL_FONT }}>…and {cheatLog.length - recent.length} earlier use{cheatLog.length - recent.length === 1 ? '' : 's'}.</div>
          )}
        </div>
      )}
    </div>
  );
}
