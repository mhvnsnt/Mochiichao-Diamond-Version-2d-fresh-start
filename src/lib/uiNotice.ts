/**
 * uiNotice — the UI template kit's HUD notification channel: a tiny
 * publish/subscribe bus so any screen can post a transient feedback
 * line ("Saved!", "Bought Mend Patch!") to the one host mounted in
 * App (UiNotice). Base register only — a plain StdWindow toast in
 * the game's own frame; it is a UI feedback channel, not a story /
 * announcement system, and it carries no data display of its own.
 *
 * Why a bus: the screens that produce feedback (pause menu, bag,
 * shop) are deep children with no shared parent below App, and the
 * game already uses this exact shape for menu skins (a module-level
 * store + a change event in menuSkins.ts). One notice at a time;
 * a new notice replaces the current one and restarts its timer.
 *
 * Originality note (honest grade): the held decomp corpus has NO
 * general toast system — its notification layer is purpose-built
 * elements (place-name banner, money box, waiting icon; see
 * docs/ui-art/UI-TEMPLATE-KIT-2026-10-30.md), and WorldEngine
 * already has its own internal notify() for the world screen.
 * This channel is the App-level equivalent for the view screens,
 * built new in the game's own frame — labelled ORIGINAL, not a
 * port.
 */
type Listener = (text: string | null) => void;

let current: string | null = null;
const listeners = new Set<Listener>();

/** Post a transient notice. Empty text clears the current notice. */
export function postNotice(text: string): void {
  current = text || null;
  listeners.forEach(fn => fn(current));
}

export function getNotice(): string | null {
  return current;
}

export function subscribeNotice(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
