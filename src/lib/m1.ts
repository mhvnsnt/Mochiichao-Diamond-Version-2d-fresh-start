// Milestone 1 (2026-10-29): playable-first build.
// Unfinished modes are HIDDEN, not deleted. Add ?all to the URL
// to bring back every hidden button, the GAP intro scenes and
// the MochiiMind panel exactly as they were.
export const M1_SHOW_ALL: boolean = (() => {
  try { return new URLSearchParams(window.location.search).has('all'); } catch { return false; }
})();

// Pause-menu rows hidden in Milestone 1 (views still exist).
export const M1_HIDDEN_PAUSE_KEYS = new Set(['garden', 'ring', 'arena', 'creature', 'cheats']);

export const m1PauseVisible = (key: string): boolean => M1_SHOW_ALL || !M1_HIDDEN_PAUSE_KEYS.has(key);
