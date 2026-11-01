/**
 * B3 §2.6 — one creature's individual bond record, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.6: a kept
 * Mochi carries "a bond value per keeper (per-pair, #359's take 1)".
 * Two earlier slices already carry the two halves of that fact as
 * pure reads: garden-bonds.ts (slice 13) is the per-pair ledger, and
 * garden-decay.ts (slice 14) is the neglect decay read (accrued
 * never decays; effective does). This module is the composition of
 * those two reads for ONE creature: every keeper that creature has
 * a ledger entry with, in ledger order, with both the accrued value
 * and the effective value after that keeper's neglect facts.
 *
 * This module invents no new bond rule. It calls bondsForCreature
 * for the entries and decayBreakdown for each keeper's effective
 * value, and reports exactly what those two reads return. A keeper
 * with no facts entry in factsByKeeper has no neglect facts
 * recorded for that keeper: the decay read runs over an empty fact
 * list, so effective is exactly accrued and no floor applies. That
 * is "no facts", not a default rate — no rate, scalar, or floor is
 * assigned here.
 *
 * This is a DIFFERENT seat from the single `bond` number on the
 * Garden record in garden-wiring.ts (one number per Garden record).
 * It is also not a host: no care action writes through it, no
 * store, view, or save record is changed here, and no cast gate
 * reads it yet.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO total across keepers: summing per-keeper bonds into one
 *   "bond" number would invent a single-bond fact the spec never
 *   states (the record is per-pair by definition). The summary
 *   carries no total field.
 * - NO band, cap, or scale: accrued and effective are the caller's
 *   numbers, reported unchanged apart from the decay read's own
 *   arithmetic. No band, threshold, or "cold" label is authored.
 * - NO care writer and NO decay writer: which actions change a
 *   pair's value, and which facts a keeper accumulates, is host
 *   work. This read only composes what its inputs already say.
 * - NO facts-only keepers: a keeper named in factsByKeeper with
 *   no ledger entry for this creature fails loudly. A neglect
 *   fact cannot invent a bond entry, and silently dropping the
 *   facts would hide a record mismatch.
 * - NO keeper/creature vocabulary authored: ids are caller-
 *   supplied opaque strings. Who a keeper is (one keeper, another
 *   keeper, a keep) is the caller's encoding, never rendered here.
 * - NO host, NO store/view/save change, NO numeric effect in live
 *   play, NO authored species/zone/recipe data.
 *
 * Purity: inputs are never mutated; the summary and every entry
 * and contribution list are fresh objects. Loud failures (throw)
 * on a malformed ledger, a bad creature id, a malformed
 * factsByKeeper map, facts for a keeper with no bond entry, and
 * any failure the ledger or decay reads themselves raise (bad
 * profile, missing rate or floor a fact needs, unknown context
 * or neglect type). Silent defaults are never invented.
 */

import {
  bondsForCreature,
  type BondLedger,
} from "./garden-bonds";
import {
  decayBreakdown,
  type DecayContribution,
  type DecayProfile,
  type NeglectFact,
} from "./garden-decay";

/** One keeper's bond for one creature: accrued and effective. */
export interface KeeperBondSummary {
  /** The keeper the bond is with (opaque id). */
  keeperId: string;
  /** The ledger value for this pair (slice 13; never decays). */
  accrued: number;
  /** Total decay over this keeper's facts (slice 14 arithmetic). */
  totalDecay: number;
  /** The floor that bound the fall, or null when no fact applied. */
  floorApplied: number | null;
  /** The living bond value the gates read (slice 14 arithmetic). */
  effective: number;
  /** The decay read's per-fact contributions, in fact order. */
  contributions: DecayContribution[];
}

/** One creature's per-keeper bond summary, in ledger order. */
export interface IndividualBondSummary {
  /** The creature the summary is about (opaque id). */
  creatureId: string;
  /** One entry per ledger entry for this creature, ledger order. */
  keepers: KeeperBondSummary[];
}

/**
 * Compose the per-pair ledger and the decay read for one creature.
 * `factsByKeeper` maps each keeper id to that keeper's neglect
 * facts for this creature; a keeper absent from the map has no
 * facts. A keeper present in the map with no ledger entry for this
 * creature fails loudly rather than inventing or dropping a bond.
 */
export function individualBondSummary(
  ledger: BondLedger,
  creatureId: string,
  profile: DecayProfile,
  factsByKeeper: Record<string, readonly NeglectFact[]>,
): IndividualBondSummary {
  const entries = bondsForCreature(ledger, creatureId);
  if (
    factsByKeeper === null ||
    typeof factsByKeeper !== "object" ||
    Array.isArray(factsByKeeper)
  ) {
    throw new Error("factsByKeeper must be an object");
  }
  const keeperIds = new Set(entries.map((entry) => entry.keeperId));
  for (const keeperId of Object.keys(factsByKeeper)) {
    if (!keeperIds.has(keeperId)) {
      throw new Error(
        `neglect facts supplied for keeper ${keeperId} with no bond entry for creature ${creatureId}`,
      );
    }
  }
  const keepers: KeeperBondSummary[] = entries.map((entry) => {
    const facts = factsByKeeper[entry.keeperId] ?? [];
    if (!Array.isArray(facts)) {
      throw new Error(
        `neglect facts for keeper ${entry.keeperId} must be an array`,
      );
    }
    const breakdown = decayBreakdown(entry.value, facts, profile);
    return {
      keeperId: entry.keeperId,
      accrued: breakdown.accrued,
      totalDecay: breakdown.totalDecay,
      floorApplied: breakdown.floorApplied,
      effective: breakdown.effective,
      contributions: breakdown.contributions,
    };
  });
  return { creatureId, keepers };
}
