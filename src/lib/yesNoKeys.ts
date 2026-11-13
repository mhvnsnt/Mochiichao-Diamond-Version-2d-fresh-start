/**
 * Yes/No keys — one shared translation for every yes/no prompt.
 * No second input system: each screen keeps its own keydown handler
 * and asks this module what a key means (same shape as buttonMode.ts,
 * which owns confirm/cancel translation for the other keys).
 *
 * Structure only, from the FireRed YesNo menu (structure/rules, no
 * Pokemon code copied): YES is the default answer, Y confirms, N
 * cancels — the same Y/N answers DialogueBox, Bag Toss, Shop
 * buy/sell and PC deposit/withdraw/release already used, now read
 * from one place so they cannot drift apart again.
 */
export function isYesKey(e: KeyboardEvent): boolean {
  return e.key === 'y' || e.key === 'Y';
}

export function isNoKey(e: KeyboardEvent): boolean {
  return e.key === 'n' || e.key === 'N';
}
