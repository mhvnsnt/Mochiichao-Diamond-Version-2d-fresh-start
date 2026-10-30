import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import CheatCodesPanel from '../game/CheatCodesPanel';

/**
 * Cheat console — since the cheat-to-mechanic lane (2026-10-29) this
 * view and Settings > Cheat Codes render the SAME panel
 * (CheatCodesPanel) running the SAME data-driven registry
 * (src/lib/cheatCodes.ts): MOCHII-ALL, MAX-LVL, SHINY-ON / SHINY-OFF,
 * NOCLIP, WARP-SECTOR0, MONEY-1000 (the original native allowlist)
 * plus the owner's built-in cheats — INFINITE MONEY (toggle),
 * 1 MILL CASH (+1,000,000 CR), 99 CUBES (+99 Luigi Cubes, the game's
 * real capture cube; no Master-tier cube exists in live item data).
 * Real Action Replay / GameShark codes cannot run in a web game, so
 * these are Mochiichao-native codes. Every successful code is
 * recorded in the save's cheatLog and sets cheated = true.
 * Save states below are unchanged: 4 local slots in localStorage,
 * never in battle (this screen is not reachable in battle).
 * Fast-forward here is world-only by construction: it only changes
 * the world held-direction repeat rate. Note, kept from the original
 * spec: MAX-LVL raises to 100, the decomp maximum — a cheat, never
 * a balance target; it breaks the early-game level curve by design.
 */
const SAVE_STATE_KEY = (slot: number) => `mochii_savestate_${slot}`;

export default function CheatConsoleView({ onBack }: { onBack: () => void }) {
  const gameState = useGameStore(s => s);
  const [message, setMessage] = useState('');
  const [states, setStates] = useState(() => [1, 2, 3, 4].map(n => {
    try { return localStorage.getItem(SAVE_STATE_KEY(n)) ? JSON.parse(localStorage.getItem(SAVE_STATE_KEY(n))!).timestamp : null; } catch { return null; }
  }));

  const saveState = (slot: number) => {
    localStorage.setItem(SAVE_STATE_KEY(slot), JSON.stringify({ timestamp: Date.now(), data: useGameStore.getState() }));
    setStates(s => s.map((v, i) => (i + 1 === slot ? Date.now() : v)));
    setMessage(`Save state ${slot} saved (local only).`);
  };
  const loadState = (slot: number) => {
    try {
      const raw = localStorage.getItem(SAVE_STATE_KEY(slot));
      if (!raw) { setMessage(`Save state ${slot} is empty.`); return; }
      useGameStore.getState().loadState(JSON.parse(raw).data);
      setMessage(`Save state ${slot} loaded.`);
    } catch { setMessage(`Save state ${slot} could not be loaded.`); }
  };

  return (
    <div className="game-screen flex flex-col p-4 sm:p-6 overflow-y-auto bg-[#0b1526]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="game-title text-2xl">Cheat Console</h2>
        <button onClick={onBack} className="game-button px-4 py-2">Close</button>
      </div>
      <div className="text-sm text-slate-300 mb-3 max-w-2xl w-full mx-auto">
        Lustre: {gameState.shiny ? 'ON' : 'OFF'} · Noclip: {gameState.noclip ? 'ON' : 'OFF'} · Fast-forward: {gameState.fastForward ? 'ON' : 'OFF'}
      </div>
      <CheatCodesPanel />
      <div className="game-panel p-4 max-w-2xl w-full mx-auto mt-4">
        <button
          onClick={() => { gameState.setCheatFlags({ fastForward: !gameState.fastForward }); setMessage(`Fast-forward (world only): ${!gameState.fastForward ? 'ON — world movement repeats faster.' : 'OFF.'}`); }}
          className="game-button px-3 py-2 text-sm"
        >
          Toggle Fast-Forward (world only)
        </button>
        {message && <div className="mt-3 text-sm text-slate-200">{message}</div>}

        <h3 className="text-white font-bold mt-6 mb-2">Save states (4 slots, local only)</h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-black/40 rounded-lg p-3">
              <div className="text-white font-bold text-sm">Slot {n}</div>
              <div className="text-xs text-slate-400 mb-2">{states[n - 1] ? new Date(states[n - 1]!).toLocaleString() : 'Empty'}</div>
              <div className="flex gap-2">
                <button onClick={() => saveState(n)} className="game-button px-2 py-1 text-xs flex-1">Save</button>
                <button onClick={() => loadState(n)} className="game-button px-2 py-1 text-xs flex-1">Load</button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-400 mt-4">This console takes Mochiichao cheat codes only — the same codes as Settings &gt; Cheat Codes.</div>
      </div>
    </div>
  );
}
