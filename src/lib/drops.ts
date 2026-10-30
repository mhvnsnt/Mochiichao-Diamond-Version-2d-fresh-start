// Wild drop system — stub-kill S-7 (2026-10-29).
//
// Before this module, src/data/core/wild-drop-tables.json held ZERO
// rows and nothing read it, and honor's drop read
// (favouredDropHalf in src/lib/honor.ts — which half of the drop
// table the player's band favours, the "loot flip") had no consumer
// anywhere. This module is the system both were waiting for:
//
//   encounter generation rolls a species' drop rows to fill the wild
//   individual's held slot -> battle end reads the slot: a DEFEAT
//   transfers the carried item to the Ranger's bag (once, through
//   one channel only); a KEPT individual keeps its item; every other
//   ending transfers nothing. (Row shape and channel rules are our
//   own design: src/data/core/docs/drop-tables-fragment.json.)
//
// PROVENANCE (source-first): the held-item-at-generation shape is
// Pokémon's — pret-pokeemerald src/pokemon.c (the wild-mon held-item
// assignment off gSpeciesInfo itemCommon/itemRare) and the
// Thief-class battle behaviour (a carried item changes hands exactly
// once, in battle, never duplicated) from the same decomp's battle
// move effects. Adapted at the language seam: our rows carry weights
// and channels instead of common/rare item pairs, and the honor loot
// flip biases the roll — rows themed for the band's favoured half
// (honor's dropTheme: wholesome / underworld / neutral) weigh double.
// That bias is the live consumer of favouredDropHalf.
//
// CONTENT STATE, stated plainly: the shipped table still holds ZERO
// rows. Per-species drop entries are content — they must make sense
// against each species' sheet and ecology (the fragment's own
// standard) — and inventing drop tables for canon species is not
// done here. The SYSTEM is complete and tested with fixture rows;
// the species drop table is flagged CONTENT OWED in the KILL-LEDGER.

import dropTablesJson from "../data/core/wild-drop-tables.json";
import { favouredDropHalf } from "./honor";

export type DropChannel = "defeat" | "kept";
export type DropTheme = "wholesome" | "underworld" | "neutral";

export interface DropRow {
  speciesId: string;
  itemId: string;
  weight: number;
  channels: DropChannel[];
  /** Which half of the table this row belongs to (loot flip). */
  theme?: DropTheme;
}

/** Item ids that resolve in the game's item layer (BagView
 *  ITEM_DETAILS + ShopView stock — the registries that exist). */
export const DROP_KNOWN_ITEMS: ReadonlySet<string> = new Set([
  "luigi_cube",
  "mend_patch",
  "revive_core",
  "data_card",
]);

/** Key-category items are authored placements, never drops
 *  (drop-tables fragment validation rule). */
export const DROP_KEY_ITEMS: ReadonlySet<string> = new Set(["data_card"]);

export const DROP_ROWS: DropRow[] = (
  dropTablesJson as unknown as { rows: DropRow[] }
).rows;

/** Display names for dropped items (the item layer's own names). */
export const DROP_ITEM_NAMES: Record<string, string> = {
  luigi_cube: "Luigi Cube",
  mend_patch: "Mend Patch",
  revive_core: "Revive Core",
  data_card: "Data Card",
};

/** The fragment's validation rules, as a runnable check. */
export function validateDropRows(rows: readonly DropRow[]): string[] {
  const errors: string[] = [];
  for (const row of rows) {
    if (!DROP_KNOWN_ITEMS.has(row.itemId)) {
      errors.push(`${row.speciesId}: itemId "${row.itemId}" does not resolve in the item registry`);
    }
    if (DROP_KEY_ITEMS.has(row.itemId)) {
      errors.push(`${row.speciesId}: key-category item "${row.itemId}" may not appear in a drop row`);
    }
    if (!(row.weight > 0)) {
      errors.push(`${row.speciesId}/${row.itemId}: weight must be positive`);
    }
    if (row.channels.length === 0) {
      errors.push(`${row.speciesId}/${row.itemId}: at least one channel is required`);
    }
  }
  return errors;
}

/**
 * Encounter-generation read: roll the species' rows to fill the wild
 * individual's held slot. Fresh roll per encounter; no pity counter,
 * no stored luck (fragment roll discipline). The band's favoured
 * half weighs double — honor's loot flip, live. Returns the held
 * item id, or null when the individual carries nothing (always, with
 * today's zero-row table).
 */
export function rollWildHeldItem(
  speciesId: string,
  bandId: string,
  rng: () => number,
  rows: readonly DropRow[] = DROP_ROWS,
): string | null {
  const set = rows.filter((r) => r.speciesId === speciesId);
  if (set.length === 0) return null;
  const favoured = favouredDropHalf(bandId);
  const weighted = set.map((row) => ({
    row,
    w: row.weight * ((row.theme ?? "neutral") === favoured && favoured !== "neutral" ? 2 : 1),
  }));
  const total = weighted.reduce((sum, e) => sum + e.w, 0);
  // A held slot is not guaranteed: the roll competes against an
  // equal-weight "carries nothing" outcome per row set — with one
  // row of weight w, the carry chance is w / (w + total).
  let roll = rng() * (total + total);
  for (const e of weighted) {
    roll -= e.w;
    if (roll < 0) return e.row.itemId;
  }
  return null;
}

/**
 * Battle-end read: what transfers to the bag for a given ending.
 * Defeat moves the carried item through the defeat channel; keeping
 * the individual moves nothing (the item stays in its held slot);
 * fleeing (either side) moves nothing. Single-object rule: an item
 * transfers once, through one channel, never both.
 */
export function resolveBattleEndDrop(
  heldItem: string | null,
  ending: "defeat" | "kept" | "fled" | "wild-fled",
  speciesId: string,
  rows: readonly DropRow[] = DROP_ROWS,
): string | null {
  if (!heldItem || ending === "fled" || ending === "wild-fled") return null;
  if (ending === "kept") return null; // stays in the kept individual's held slot
  const row = rows.find((r) => r.speciesId === speciesId && r.itemId === heldItem);
  if (!row) return null;
  return row.channels.includes("defeat") ? heldItem : null;
}
