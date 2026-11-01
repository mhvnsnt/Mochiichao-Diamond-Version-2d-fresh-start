/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual — one outing plus its unlock evaluations plus its
 * individual bond summaries, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-journeys-plus-unlocks bundle from
 *   garden-outing-unlocks (slice 41: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, plus one
 *   bridge record per caller-named record entry, plus one
 *   check-in beat per caller-named checkin entry, plus one Garden
 *   snapshot per caller-named snapshot entry, plus one Garden
 *   journey per caller-named journey entry, plus one Garden
 *   unlock evaluation per caller-named unlock entry, each
 *   exactly as its own read reports it);
 * - one per-creature individual bond summary per caller-named
 *   individual entry, in caller order, via garden-individual's
 *   individualBondSummary, over each entry's OWN ledger,
 *   creature id, decay profile, and facts-by-keeper map.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the individuals section is NOT computed
 * from the outing-unlocks section's outing, bonds, decay, comfort,
 * thanks, level, record, check-in, snapshot, journey, or unlock
 * values — a caller counts its own ledger and facts and hands this
 * module those inputs, exactly as garden-individual requires — and
 * the outing-unlocks section is NOT overwritten by any individual
 * summary. A Garden can therefore read one fact in the
 * outing-unlocks section and a different fact in an individual
 * summary over a different ledger, and both facts are reported. An
 * individual summary never changes an outing, a bond, a comfort
 * day, a thanks signal, a level summary, a bridge record, a
 * check-in beat, a snapshot lens, a journey visit, or an unlock
 * evaluation in this module's hands, and an outing never sets an
 * individual's ledger, creature, profile, or facts — each is a read
 * at the moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether an individual summary changes anything in live play, is
 * a host decision this module does not make (the gate-currency
 * question stays the already-flagged owner decision in
 * garden-unlocks' own notes). The bundle itself carries no merged
 * residents field, no total-across-keepers field, no band, cap, or
 * scale on any individual summary beyond the reads' own rules, no
 * currency, balance, or spend, and no named rite or
 * bell-equivalent object (the gathering beat stays inside the
 * outing-unlocks section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-unlocks bundle and the individuals section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   individuals section's facts are exactly what
 *   individualBondSummary reports over each entry's own inputs,
 *   and the outing-unlocks section's facts are exactly what
 *   gardenOutingUnlocks reports over its own inputs;
 * - NO individual summary computed from an outing-unlocks value:
 *   the ledger, creature id, decay profile, and facts-by-keeper
 *   map are caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level summary,
 *   a bridge record, a check-in beat, a snapshot lens, a journey
 *   visit, or an unlock evaluation;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, or individual writer: an individual
 *   summary is a summary this module never stores or unlocks with
 *   in live play (what a summary then opens is a later
 *   host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on an individual
 *   summary beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-unlocks
 *   and garden-individual, caller-supplied);
 * - NO research levels, scores, or thresholds (inherited);
 *   NO bio-fill section (inherited);
 * - NO honour or money field (inherited); NO meeting writer
 *   and NO arrival writer (inherited); NO cursor storage and
 *   NO check-in stamp storage (inherited): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section: a record gains a field only when its
 *   own read gains one (see garden-record's deliberately-NOT
 *   list);
 * - NO Garden geography authored: homes, the edge, and the
 *   heart-place zone are caller-supplied sets inside the
 *   composed inputs (Owner Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values are
 *   opaque caller strings; the #102 range rule is the host's
 *   filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call, and
 * the individual summaries are copied here (keepers and their
 * decay contributions), so mutating a returned individual summary
 * never touches the caller's ledger, profile, or facts. Loud
 * failures (throw) on a malformed input bundle, a missing
 * outing-unlocks or individuals section, a bad individuals entries
 * shape, a bad or duplicate individual entry id, and on any
 * failure the composed reads themselves raise. Silent defaults are
 * never invented: an outing with no arrivals, no meetings, no
 * news, no records, no observations, no bond entries, no decay
 * entries, no comfort entries, no thanks windows, no level
 * entries, no record entries, no checkin entries, no snapshot
 * entries, no journey entries, no unlock entries, and no
 * individual entries reads its inputs back unchanged, never a
 * fabricated outing with an individual summary.
 */

import {
  gardenOutingUnlocks,
  type GardenOutingUnlocks,
  type GardenOutingUnlocksInputs,
} from "./garden-outing-unlocks";
import {
  individualBondSummary,
  type IndividualBondSummary,
} from "./garden-individual";
import type { BondLedger } from "./garden-bonds";
import type {
  DecayProfile,
  NeglectFact,
} from "./garden-decay";

/** One caller-named per-creature individual bond summary, over its own inputs. */
export interface IndividualEntry {
  /** The summary's id (opaque, caller-chosen). */
  id: string;
  /** That summary's own per-pair bond ledger (see garden-individual). */
  ledger: BondLedger;
  /** The creature the summary is about (see garden-individual). */
  creatureId: string;
  /** That summary's own decay profile (see garden-individual). */
  profile: DecayProfile;
  /** That summary's own facts-by-keeper map (see garden-individual). */
  factsByKeeper: Record<string, readonly NeglectFact[]>;
}

/** The inputs one outing-plus-unlocks-plus-individuals bundle is composed from. */
export interface GardenOutingIndividualInputs {
  /** The outing-unlocks bundle's inputs, as slice 41 takes them. */
  outingUnlocks: GardenOutingUnlocksInputs;
  /** The individuals section's inputs: one entry per summary, in caller order. */
  individuals: {
    entries: readonly IndividualEntry[];
  };
}

/** One individual entry's summary, copied fresh. */
export interface IndividualReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The individual bond summary exactly as garden-individual reports it. */
  summary: IndividualBondSummary;
}

/** One outing plus its unlock evaluations plus its individual bond summaries. */
export interface GardenOutingIndividual {
  /** The outing-plus-journeys-plus-unlocks bundle, exactly as slice 41 reports it. */
  outingUnlocks: GardenOutingUnlocks;
  /** One individual bond summary per caller-named individual entry, in caller order. */
  individuals: IndividualReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its unlock evaluations plus its individual bond
 * summaries: outing-unlocks bundle + per-entry individual bond
 * summaries, each exactly as its own read reports it, side by side,
 * with no merged composition and no reconciliation between their
 * pictures.
 */
export function gardenOutingIndividual(
  inputs: GardenOutingIndividualInputs,
): GardenOutingIndividual {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-individual: inputs must be an object");
  }
  if (inputs.outingUnlocks === null || typeof inputs.outingUnlocks !== "object") {
    throw new Error(
      "garden-outing-individual: outingUnlocks inputs must be an object",
    );
  }
  if (inputs.individuals === null || typeof inputs.individuals !== "object") {
    throw new Error(
      "garden-outing-individual: individuals inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.individuals.entries)) {
    throw new Error(
      "garden-outing-individual: individuals entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.individuals.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-individual: individual entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-individual: individual entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-individual: duplicate individual entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.ledger)) {
      throw new Error(
        "garden-outing-individual: individual entry ledger must be an array",
      );
    }
    if (!isNonEmptyString(entry.creatureId)) {
      throw new Error(
        "garden-outing-individual: individual entry creatureId must be a non-empty string",
      );
    }
    if (entry.profile === null || typeof entry.profile !== "object") {
      throw new Error(
        "garden-outing-individual: individual entry profile must be an object",
      );
    }
    if (
      entry.factsByKeeper === null ||
      typeof entry.factsByKeeper !== "object" ||
      Array.isArray(entry.factsByKeeper)
    ) {
      throw new Error(
        "garden-outing-individual: individual entry factsByKeeper must be an object",
      );
    }
  }
  const outingUnlocks = gardenOutingUnlocks(inputs.outingUnlocks);
  const individuals = inputs.individuals.entries.map((entry) => {
    const summary = individualBondSummary(
      entry.ledger,
      entry.creatureId,
      entry.profile,
      entry.factsByKeeper,
    );
    return {
      id: entry.id,
      summary: {
        creatureId: summary.creatureId,
        keepers: summary.keepers.map((keeper) => ({
          ...keeper,
          contributions: keeper.contributions.map((contribution) => ({
            ...contribution,
          })),
        })),
      },
    };
  });
  return { outingUnlocks, individuals };
}
