/**
 * B3 §2.6 / §2.3 — the per-pair bond ledger, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md: a kept Mochi
 * carries "a bond value per keeper (per-pair, #359's take 1)" (§2.6),
 * and "care writes per-pair bond data on the individual record" (§2.3)
 * — raising is the bond system practised at home, not a second loop's
 * progress. This module is that ledger's shape and its pure reads
 * only: one entry per (creature, keeper) pair, set and read here.
 *
 * This is a DIFFERENT seat from the single `bond` number on the Garden
 * record in garden-wiring.ts (and creatureGardenForm's happiness read
 * of that number). That seat is one number per Garden record; this
 * ledger is one number per creature–keeper pair. Neither replaces the
 * other, and this module never reads or writes the Garden record.
 *
 * This module is NOT a host: no care action writes through it yet
 * (see the staging locks in garden-bonds.test.ts), no store, view, or
 * save record is changed here, and no cast gate reads it yet.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO band, cap, or scale authored: a value is the caller's finite
 *   number, stored unchanged. Bands (and any cap) are the writer's or
 *   host's decision, later — the ledger judges nothing. In
 *   particular a negative value stores: BRIDGE-SPEC §2.7 (corrected
 *   doctrine) says bond can move negative under neglect, so the
 *   ledger must not refuse the decay direction. Rates, floors, and
 *   the decay model itself are NOT here (BOND-DECAY-SPEC's model is
 *   a later slice's work, not smuggled into a ledger).
 * - NO care writer: which actions change a pair's value, and by how
 *   much, is host work. setBond records what a caller decided; it
 *   never invents a delta.
 * - NO keeper/creature vocabulary authored: ids are caller-supplied
 *   opaque strings. Who a keeper is (the player, another keeper, a
 *   keep) is the caller's encoding, never rendered here.
 * - NO host, NO store/view/save change, NO numeric effect in live
 *   play, NO authored species/zone/recipe data.
 *
 * Purity: every function is pure — inputs are never mutated, outputs
 * are fresh arrays (except removeBond's documented no-op, which
 * returns the input ledger unchanged by reference, matching the
 * garden-register no-op convention). Loud failures (throw) on
 * malformed entries, duplicate pairs, and non-finite values; silent
 * defaults are never invented. A missing pair reads null, never 0:
 * "no bond recorded" and "bond zero" are different facts.
 */

/** One per-pair bond entry: one value per (creature, keeper) pair. */
export interface KeeperBond {
  /** The creature the bond is about (opaque id). */
  creatureId: string;
  /** The keeper the bond is with (opaque id). */
  keeperId: string;
  /** The caller's bond number for this pair (finite; no band here). */
  value: number;
}

export type BondLedger = readonly KeeperBond[];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Loud validation for one entry. Throws on the first defect found. */
export function validateBondEntry(entry: unknown): asserts entry is KeeperBond {
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    throw new Error("bond entry must be an object");
  }
  const e = entry as Record<string, unknown>;
  if (!isNonEmptyString(e.creatureId)) {
    throw new Error("bond entry creatureId must be a non-empty string");
  }
  if (!isNonEmptyString(e.keeperId)) {
    throw new Error("bond entry keeperId must be a non-empty string");
  }
  if (typeof e.value !== "number" || !Number.isFinite(e.value)) {
    throw new Error("bond entry value must be a finite number");
  }
}

/**
 * Loud validation for a whole ledger: every entry valid, and no pair
 * twice. A ledger with two entries for one pair is malformed — setBond
 * replaces, it never appends a second entry for the same pair.
 */
export function validateBondLedger(ledger: unknown): asserts ledger is BondLedger {
  if (!Array.isArray(ledger)) {
    throw new Error("bond ledger must be an array");
  }
  const seen = new Set<string>();
  for (const entry of ledger) {
    validateBondEntry(entry);
    const key = JSON.stringify([entry.creatureId, entry.keeperId]);
    if (seen.has(key)) {
      throw new Error(
        `duplicate bond pair: ${entry.creatureId} / ${entry.keeperId}`,
      );
    }
    seen.add(key);
  }
}

function validatePairIds(creatureId: string, keeperId: string): void {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("creatureId must be a non-empty string");
  }
  if (!isNonEmptyString(keeperId)) {
    throw new Error("keeperId must be a non-empty string");
  }
}

/**
 * Set one pair's bond value. Returns a NEW ledger: an existing pair's
 * entry is replaced in place (position preserved, value updated); a
 * new pair is appended. The input ledger and its entries are never
 * mutated. A malformed ledger, bad ids, or a non-finite value fails
 * loudly and writes nothing.
 */
export function setBond(
  ledger: BondLedger,
  creatureId: string,
  keeperId: string,
  value: number,
): KeeperBond[] {
  validateBondLedger(ledger);
  validatePairIds(creatureId, keeperId);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("bond value must be a finite number");
  }
  const index = ledger.findIndex(
    (entry) => entry.creatureId === creatureId && entry.keeperId === keeperId,
  );
  if (index === -1) {
    return [...ledger, { creatureId, keeperId, value }];
  }
  return ledger.map((entry, i) =>
    i === index ? { creatureId, keeperId, value } : entry,
  );
}

/**
 * Remove one pair's entry. Returns a NEW ledger without it — except
 * the no-op case: when the pair has no entry, the input ledger is
 * returned unchanged BY REFERENCE (the caller can tell nothing was
 * done, matching the garden-register no-op convention).
 */
export function removeBond(
  ledger: BondLedger,
  creatureId: string,
  keeperId: string,
): BondLedger {
  validateBondLedger(ledger);
  validatePairIds(creatureId, keeperId);
  const index = ledger.findIndex(
    (entry) => entry.creatureId === creatureId && entry.keeperId === keeperId,
  );
  if (index === -1) return ledger;
  return ledger.filter((_, i) => i !== index);
}

/**
 * One pair's bond value, or null when no entry exists for the pair.
 * Null is not zero: an absent bond and a zero bond are different
 * facts, and a host that conflated them would invent a bond.
 */
export function bondForPair(
  ledger: BondLedger,
  creatureId: string,
  keeperId: string,
): number | null {
  validateBondLedger(ledger);
  validatePairIds(creatureId, keeperId);
  const entry = ledger.find(
    (e) => e.creatureId === creatureId && e.keeperId === keeperId,
  );
  return entry === undefined ? null : entry.value;
}

/** Every entry for one creature, in ledger order, in a fresh array. */
export function bondsForCreature(
  ledger: BondLedger,
  creatureId: string,
): KeeperBond[] {
  validateBondLedger(ledger);
  if (!isNonEmptyString(creatureId)) {
    throw new Error("creatureId must be a non-empty string");
  }
  return ledger.filter((entry) => entry.creatureId === creatureId);
}

/** Every entry for one keeper, in ledger order, in a fresh array. */
export function bondsForKeeper(
  ledger: BondLedger,
  keeperId: string,
): KeeperBond[] {
  validateBondLedger(ledger);
  if (!isNonEmptyString(keeperId)) {
    throw new Error("keeperId must be a non-empty string");
  }
  return ledger.filter((entry) => entry.keeperId === keeperId);
}

/** The keepers one creature has a bond entry with, in ledger order. */
export function keepersForCreature(
  ledger: BondLedger,
  creatureId: string,
): string[] {
  return bondsForCreature(ledger, creatureId).map((entry) => entry.keeperId);
}

/** The creatures one keeper has a bond entry with, in ledger order. */
export function creaturesForKeeper(
  ledger: BondLedger,
  keeperId: string,
): string[] {
  return bondsForKeeper(ledger, keeperId).map((entry) => entry.creatureId);
}
