import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadStoredSettings } from './lib/gameSettings';
import { restoreSavesFromIndexedDB } from './lib/saveSystem';
import { applyFontRoles } from './lib/fonts';
import { loadMenuCustom, applyMenuCustom } from './lib/menuCustom';
import { applySoundMode } from './lib/audioRouting';

// Apply the saved Settings Font row before first paint, so a
// returning player's font choice is not lost on reload.
applyFontRoles(loadStoredSettings());
// Batch B: same for menu customisation (text / dialogue /
// day-night vars), so a returning player's custom choice is not
// lost on reload before they next visit Settings.
applyMenuCustom(loadMenuCustom());
// Record the saved SOUND mode before first paint, too. This only
// stores the mode — no AudioContext is created until a later user
// gesture plays a sound (browser autoplay rule), at which point
// the graph is built in the stored mode.
applySoundMode(loadStoredSettings().sound);

// GAP-FILL S0 (G-15): give the IndexedDB mirror a reader. Until now
// restoreSavesFromIndexedDB existed with no caller anywhere, so the
// mirror was write-only: a slot whose localStorage was lost never
// came back. This fire-and-forget boot refill runs before first
// paint for all three slots; the function itself is the safety:
// it returns false (and writes nothing) when localStorage already
// has entries for the slot, when IndexedDB is unavailable, or on
// any error — localStorage always wins, nothing is ever deleted.
void Promise.all([1, 2, 3].map((slotId) => restoreSavesFromIndexedDB(slotId)));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// QA hook (2026-10-29): only with ?qa in the URL, expose the store and
// world data so the headless play-through script can read position and
// route itself. Without ?qa nothing is exposed.
if (new URLSearchParams(window.location.search).has('qa')) {
  Promise.all([import('./store/gameStore'), import('./world/FullWorldMaps'), import('./lib/engine')]).then(([s, w, e]) => {
    (window as any).__qa = { store: s.useGameStore, world: w.FULL_WORLD, create: (e as any).createMochii };
  });
}
