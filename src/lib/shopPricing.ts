// Shop pricing consumer for the honor system (List 28, P1).
//
// Built by the full-wiring-staging-sweep lane (2026-10-29) to close the
// gap the honor repair lane recorded: honor.ts shipped applyBandPrice
// and deriveMorale with NO consumer outside lib/honor itself, so shop
// prices never actually read the deed ledger. This module is that
// consumer. ShopView renders and charges through it.
//
// Law honoured (presentation-restraint, AGENTS.md 2026-10-29): the
// player sees only the adjusted price number — exactly the RDR2
// grammar, where standing is felt through prices and never surfaced
// as a band name or a number of its own. Nothing in this module or in
// ShopView displays a band, a morale value, or an adjustment reason.
//
// Data law honoured: standing is DERIVED from the append-only deed
// ledger at read time (deriveMorale), never stored. An empty ledger
// derives the zero band and applyBandPrice returns the base price
// unchanged, so a player who has done nothing pays catalogue prices.
//
// Shop classes (band-effects.json shopTerms, honor P0 data):
// - "honest" — the buy-side table: good bands discount per step
//   (band-capped), deep bad bands surcharge. This is the class
//   ShopView uses: the in-game shops are ordinary shops.
// - "fence" — payout table: only the bad side moves (a fence pays
//   worse-standing sellers better). No fence shop surface exists in
//   the game yet, so no view consumes the fence class today; it is
//   exposed here, tested, and ready for the first fence surface
//   rather than re-derived later.
// Sell side: the honor data defines no honest-shop sell adjustment,
// so ordinary sell payouts stay on the existing sellPrice() rule in
// lib/playableWiring — this module deliberately does not invent one.

import { applyBandPrice, deriveMorale, type DeedEntry } from "./honor";

export type ShopClass = "honest" | "fence";

/** The price an ordinary ("honest"-class) shop charges for a base
 *  catalogue price, given the player's deed ledger. Derived fresh on
 *  every call; the ledger is the only input state. */
export function shopBuyPrice(
  basePrice: number,
  ledger: readonly DeedEntry[],
  shopClass: ShopClass = "honest",
): number {
  return applyBandPrice(basePrice, deriveMorale(ledger).band, shopClass);
}

/** The payout a fence-class buyer offers for an item's base value,
 *  given the player's deed ledger. Unused by any view until a fence
 *  surface exists; kept beside the buy consumer so both halves of
 *  the honor shop terms have exactly one consumer home. */
export function fencePayout(
  baseValue: number,
  ledger: readonly DeedEntry[],
): number {
  return applyBandPrice(baseValue, deriveMorale(ledger).band, "fence");
}
