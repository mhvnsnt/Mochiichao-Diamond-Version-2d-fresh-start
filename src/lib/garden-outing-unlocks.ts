/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks —
 * one outing plus its journey visits plus its unlock evaluations,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-snapshots-plus-journeys bundle from
 *   garden-outing-journey (slice 40: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, plus one
 *   bridge record per caller-named record entry, plus one
 *   check-in beat per caller-named checkin entry, plus one Garden
 *   snapshot per caller-named snapshot entry, plus one Garden
 *   journey per caller-named journey entry, each exactly as its
 *   own read reports it);
 * - one Garden unlock evaluation per caller-named unlock entry,
 *   in caller order, via garden-unlocks' gardenUnlocks, over each
 *   entry's OWN milestones, catalogue, and previously-unlocked
 *   set.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the unlocks section is NOT computed
 * from the outing-journey section's outing, bonds, decay, comfort,
 * thanks, level, record, check-in, snapshot, or journey values —
 * a caller counts its own milestones and hands this module those
 * milestones, exactly as garden-unlocks requires — and the
 * outing-journey section is NOT overwritten by any unlock. A
 * Garden can therefore read a level summary of 2 in the
 * outing-journey section and an unlock evaluation over a
 * caller-supplied Garden Level of 5 in the unlocks section, and
 * both facts are reported. An unlock never changes an outing, a
 * bond, a comfort day, a thanks signal, a level summary, a bridge
 * record, a check-in beat, a snapshot lens, or a journey visit in
 * this module's hands, and an outing never sets an unlock's
 * milestones or catalogue — each is a read at the moment of the
 * call, and the inputs each read reports are returned unchanged.
 * Which of them a host shows first, and whether an unlocked entry
 * is then visitable or what it costs, is a host decision this
 * module does not make (the gate-currency question stays the
 * already-flagged owner decision in garden-unlocks' own notes).
 * The bundle itself carries no merged residents field, no band,
 * cap, or scale on any unlock beyond the reads' own rules, no
 * currency, balance, or spend, and no named rite or
 * bell-equivalent object (the gathering beat stays inside the
 * outing-journey section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-journey bundle and the unlocks section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   unlocks section's facts are exactly what gardenUnlocks
 *   reports over each entry's own inputs, and the outing-journey
 *   section's facts are exactly what gardenOutingJourney reports
 *   over its own inputs;
 * - NO unlock computed from an outing-journey value: the
 *   milestones, catalogue, and previously-unlocked set are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   or a journey visit;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, or unlock writer: an unlock evaluation is
 *   a summary this module never stores or unlocks with in live
 *   play (what an unlocked entry then opens is a later
 *   host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on an unlock
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-journey
 *   and garden-unlocks, caller-supplied);
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
 * - NO unlock catalogue authored here: every unlock entry
 *   carries its own caller-supplied requirement, and an empty
 *   catalogue unlocks nothing — there is no built-in unlock;
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call, and
 * the unlock results are copied here (unlocked and
 * newlyUnlocked arrays), so mutating a returned unlock result
 * never touches the caller's milestones, catalogue, or
 * previously-unlocked set. Loud failures (throw) on a malformed
 * input bundle, a missing outing-journey or unlocks section, a
 * bad unlocks entries shape, a bad or duplicate unlock entry
 * id, and on any failure the composed reads themselves raise.
 * Silent defaults are never invented: an outing with no arrivals,
 * no meetings, no news, no records, no observations, no bond
 * entries, no decay entries, no comfort entries, no thanks
 * windows, no level entries, no record entries, no checkin
 * entries, no snapshot entries, no journey entries, and no
 * unlock entries reads its inputs back unchanged, never a
 * fabricated outing with an unlock evaluation.
 */

import {
  gardenOutingJourney,
  type GardenOutingJourney,
  type GardenOutingJourneyInputs,
} from "./garden-outing-journey";
import {
  gardenUnlocks,
  type GardenMilestones,
  type GardenUnlockEntry,
  type GardenUnlockResult,
} from "./garden-unlocks";

/** One caller-named Garden unlock evaluation, over its own inputs. */
export interface UnlockEntry {
  /** The unlock evaluation's id (opaque, caller-chosen). */
  id: string;
  /** That evaluation's own milestones (see garden-unlocks). */
  milestones: GardenMilestones;
  /** That evaluation's own catalogue (see garden-unlocks). */
  catalogue: GardenUnlockEntry[];
  /** Entries already shown, as garden-unlocks takes them. */
  previouslyUnlocked?: string[];
}

/** The inputs one outing-plus-journeys-plus-unlocks bundle is composed from. */
export interface GardenOutingUnlocksInputs {
  /** The outing-journey bundle's inputs, as slice 40 takes them. */
  outingJourney: GardenOutingJourneyInputs;
  /** The unlocks section's inputs: one entry per evaluation, in caller order. */
  unlocks: {
    entries: readonly UnlockEntry[];
  };
}

/** One unlock entry's evaluation, copied fresh. */
export interface UnlockReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The Garden unlock evaluation exactly as garden-unlocks reports it. */
  result: GardenUnlockResult;
}

/** One outing plus its journey visits plus its unlock evaluations. */
export interface GardenOutingUnlocks {
  /** The outing-plus-snapshots-plus-journeys bundle, exactly as slice 40 reports it. */
  outingJourney: GardenOutingJourney;
  /** One Garden unlock evaluation per caller-named unlock entry, in caller order. */
  unlocks: UnlockReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its journey visits plus its unlock evaluations:
 * outing-journey bundle + per-entry Garden unlock evaluations, each
 * exactly as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingUnlocks(
  inputs: GardenOutingUnlocksInputs,
): GardenOutingUnlocks {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-unlocks: inputs must be an object");
  }
  if (inputs.outingJourney === null || typeof inputs.outingJourney !== "object") {
    throw new Error(
      "garden-outing-unlocks: outingJourney inputs must be an object",
    );
  }
  if (inputs.unlocks === null || typeof inputs.unlocks !== "object") {
    throw new Error("garden-outing-unlocks: unlocks inputs must be an object");
  }
  if (!Array.isArray(inputs.unlocks.entries)) {
    throw new Error("garden-outing-unlocks: unlocks entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.unlocks.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-unlocks: unlock entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-unlocks: unlock entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-unlocks: duplicate unlock entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (entry.milestones === null || typeof entry.milestones !== "object") {
      throw new Error(
        "garden-outing-unlocks: unlock entry milestones must be an object",
      );
    }
    if (!Array.isArray(entry.catalogue)) {
      throw new Error(
        "garden-outing-unlocks: unlock entry catalogue must be an array",
      );
    }
    if (
      entry.previouslyUnlocked !== undefined &&
      !Array.isArray(entry.previouslyUnlocked)
    ) {
      throw new Error(
        "garden-outing-unlocks: unlock entry previouslyUnlocked must be an array",
      );
    }
  }
  const outingJourney = gardenOutingJourney(inputs.outingJourney);
  const unlocks = inputs.unlocks.entries.map((entry) => {
    const result = gardenUnlocks(
      entry.milestones,
      entry.catalogue,
      entry.previouslyUnlocked ?? [],
    );
    return {
      id: entry.id,
      result: {
        unlocked: [...result.unlocked],
        newlyUnlocked: [...result.newlyUnlocked],
      },
    };
  });
  return { outingJourney, unlocks };
}
