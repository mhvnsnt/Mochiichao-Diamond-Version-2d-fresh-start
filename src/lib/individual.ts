// Individual record (gap-fill S7, slice 1) — the #80 record, as code.
//
// Source of truth for the SHAPE: src/data/core/schemas/individual.schema.json
// ($id mochiichao/individual/v1): personality_seed is a uint32
// (0..4294967295); variance.stats are six integers 0..15; variance.size_class
// is small | standard | large; variance.temperament_read may be null;
// deviations is an array whose entries a generator may only read when RULED.
// This module is the first runtime reader of that shape. It does NOT invent
// canon content:
//  - The derivation below is this module's roll rule, stated plainly, not a
//    claim about any species: the low 24 bits of the seed give the six
//    variance stats, 4 bits each in hp/atk/def/spa/spd/spe order, and the
//    top byte modulo 3 gives the size class. A seed is rolled once at
//    creation and never re-rolled (stable for life); evolution keeps the
//    record because evolveInstance mutates the instance in place.
//  - temperament_read is always null here: no temperament derivation is
//    authored by this slice (that is the personality layer's work, S7/S8),
//    and a null is what the schema allows rather than an invented read.
//  - deviations is always [] here: this generator rules no deviations, and
//    the schema's own rule is that generators may only read RULED ones.
//  - NOT wired here, by design: the variance stats do NOT feed
//    createMochii's stat calculation yet (that function still uses its
//    static IV 15, as before — changing live stats is a balance decision
//    for the S7 follow-up, not smuggled into this slice), and mood is NOT
//    derived here (S8's HGSS-pattern derived read).
//  - Slice 2 (this landing): old saves ARE backfilled on load — see
//    ensureIndividual/backfillIndividuals below and their use in
//    gameStore.loadState, the one funnel every save-load path uses.
//    Backfill fills only ABSENCE: a member that already carries a
//    record keeps it exactly (never re-rolled); a present-but-malformed
//    record is not repaired here, because no writer on main can produce
//    one (slice 1 is the only writer, and it writes valid records).
//  - The open teardown-hgss PR #50 touches ONLY the schema file, not this
//    module or the instance type, so there is no file collision.

import type { IndividualRecord, IndividualVariance, MochiiInstance } from "./types";

export const INDIVIDUAL_SEED_MIN = 0;
export const INDIVIDUAL_SEED_MAX = 4294967295;

const SIZE_CLASSES = ["small", "standard", "large"] as const;

export function validatePersonalitySeed(seed: number): void {
  if (!Number.isInteger(seed) || seed < INDIVIDUAL_SEED_MIN || seed > INDIVIDUAL_SEED_MAX) {
    throw new RangeError(
      `personalitySeed must be an integer ${INDIVIDUAL_SEED_MIN}..${INDIVIDUAL_SEED_MAX}, got ${seed}`,
    );
  }
}

export function rollPersonalitySeed(rng: () => number = Math.random): number {
  // Math.random, matching the codebase's own generateId/createMochii rolls.
  return Math.floor(rng() * (INDIVIDUAL_SEED_MAX + 1));
}

/** Deterministic variance derivation from a seed (rule stated in header). */
export function varianceFromSeed(seed: number): IndividualVariance {
  validatePersonalitySeed(seed);
  const stats = {
    hp: seed & 0xf,
    atk: (seed >>> 4) & 0xf,
    def: (seed >>> 8) & 0xf,
    spa: (seed >>> 12) & 0xf,
    spd: (seed >>> 16) & 0xf,
    spe: (seed >>> 20) & 0xf,
  };
  const sizeClass = SIZE_CLASSES[((seed >>> 24) & 0xff) % 3];
  return { stats, sizeClass, temperamentRead: null };
}

/** A fresh individual record: rolled seed (or the given one), derived variance. */
export function createIndividual(seed: number = rollPersonalitySeed()): IndividualRecord {
  validatePersonalitySeed(seed);
  return {
    personalitySeed: seed,
    variance: varianceFromSeed(seed),
    deviations: [],
  };
}

/**
 * S7 slice 2 — backfill for one instance from an old save: if it already
 * carries an individual record, return it untouched (same object, never
 * re-rolled); otherwise return a copy carrying a freshly rolled record.
 * Pure: the input instance is never mutated, so a save object can be
 * backfilled in memory without rewriting the save file until next save.
 */
export function ensureIndividual(instance: MochiiInstance): MochiiInstance {
  if (!instance || typeof instance !== "object") return instance;
  if (instance.individual) return instance;
  return { ...instance, individual: createIndividual() };
}

/** S7 slice 2 — backfill a whole party/pc array (absence only, per member). */
export function backfillIndividuals(members: MochiiInstance[]): MochiiInstance[] {
  return members.map(ensureIndividual);
}
