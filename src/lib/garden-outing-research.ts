/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research —
 * one outing plus its doorway movement readings plus its
 * Garden arrival readings plus its per-species research
 * readings, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-movement-plus-arrivals bundle from
 *   garden-outing-arrivals (slice 45: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, and one arrivals
 *   reading per caller-named arrival entry, each exactly as its
 *   own read reports it);
 * - one research reading per caller-named research entry, in
 *   caller order, via garden-research's researchSummaryForSpecies
 *   and bioFillForSpecies, over each entry's OWN observation
 *   log, caller-resolved creature-to-species mapping, and bio
 *   field requirements.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the research section is NOT computed
 * from the outing-arrivals section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, teacher, movement, or arrival values — a
 * caller counts its own observation log and hands this module
 * those inputs, exactly as garden-research requires — and the
 * outing-arrivals section is NOT overwritten by any research
 * reading. A Garden can therefore read one fact in the
 * outing-arrivals section and a different fact in a research
 * reading over a different log, and both facts are reported. A
 * research reading never changes an outing, a bond, a comfort
 * day, a thanks signal, a level summary, a bridge record, a
 * check-in beat, a snapshot lens, a journey visit, an unlock
 * evaluation, an individual summary, a teacher reading, a
 * movement reading, or an arrival reading in this module's
 * hands, and an outing never sets a research entry's log,
 * species mapping, or bio requirements — each is a read at the
 * moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether a research reading changes anything in live play, is
 * a host decision this module does not make (the research-level
 * scale stays the already-flagged owner decision in
 * garden-research's own notes).
 * The bundle itself carries no merged residents field, no
 * total-across-research field, no research level, score,
 * threshold, or ranking on any research reading beyond the
 * reads' own rules, no currency, balance, or spend, and no
 * named rite or bell-equivalent object (the gathering beat
 * stays inside the outing-arrivals section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-arrivals bundle and the research section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the research section's facts are exactly what
 *   researchSummaryForSpecies and bioFillForSpecies report
 *   over each entry's own inputs, and the
 *   outing-arrivals section's facts are exactly what
 *   gardenOutingArrivals reports over its own inputs;
 * - NO research reading computed from an outing-arrivals value:
 *   the log, species mapping, and bio requirements are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement
 *   reading, or an arrivals reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, or research writer: a research reading is a
 *   summary this module never stores or unlocks with in live
 *   play (what a reading then opens is a later
 *   host/presentation decision), and no record is appended to
 *   any log here (appendResearchObservation is the research
 *   writer's job, not this read's);
 * - NO research vocabulary authored (all ids, kinds, species,
 *   and bio fields are opaque caller strings, and the kind
 *   set is inherited from garden-research, never extended
 *   here);
 * - NO research level, score, threshold, or ranking on a
 *   research reading beyond the composed reads' own rules
 *   (inherited: a bio field is filled exactly when its
 *   required kind was observed at least once for the species,
 *   never by default, by a count threshold, or by a level);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from
 *   garden-outing-arrivals and garden-research,
 *   caller-supplied);
 * - NO bio contents authored (inherited: fields and required
 *   kinds are caller-supplied);
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
 * the research readings are copied here (each summary's kind
 * list and tallies, and each bio fill, are fresh copies), so
 * mutating a returned research reading never touches the
 * caller's log or mapping. Loud failures (throw) on a malformed
 * input bundle, a missing outing-arrivals or research section,
 * a bad research entries shape, a bad or duplicate research
 * entry id, a bad species id, a bad log, a malformed
 * observation, a bad species mapping, a bad bio requirement,
 * and on any failure the composed reads themselves raise.
 * Silent defaults are never invented: an outing with no
 * research, no meetings, no news, no records, no observations,
 * no bond entries, no decay entries, no comfort entries, no
 * thanks windows, no level entries, no record entries, no
 * checkin entries, no snapshot entries, no journey entries, no
 * unlock entries, no individual entries, no teacher entries, no
 * movement entries, no arrival entries, and no research entries
 * reads its inputs back unchanged, never a fabricated outing
 * with a research reading.
 */

import {
  gardenOutingArrivals,
  type GardenOutingArrivals,
  type GardenOutingArrivalsInputs,
} from "./garden-outing-arrivals";
import {
  bioFillForSpecies,
  researchSummaryForSpecies,
  validateResearchObservation,
  type BioFieldFill,
  type BioFieldRequirement,
  type ResearchObservationLog,
  type SpeciesOfCreature,
  type SpeciesResearchSummary,
} from "./garden-research";

/** One caller-named research reading, over its own inputs. */
export interface ResearchEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** The species this reading is about (opaque, caller-chosen). */
  speciesId: string;
  /** That reading's own observation log (see garden-research). */
  log: ResearchObservationLog;
  /** That reading's own creature-to-species mapping (see garden-research). */
  speciesOfCreature: SpeciesOfCreature;
  /** That reading's own bio field requirements, in requirement order. */
  requirements: readonly BioFieldRequirement[];
}

/** The inputs one outing-plus-arrivals-plus-research bundle is composed from. */
export interface GardenOutingResearchInputs {
  /** The outing-arrivals bundle's inputs, as slice 45 takes them. */
  outingArrivals: GardenOutingArrivalsInputs;
  /** The research section's inputs: one entry per reading, in caller order. */
  research: {
    entries: readonly ResearchEntry[];
  };
}

/** One research entry's reading, copied fresh. */
export interface ResearchReading {
  /** The entry's id, as supplied. */
  id: string;
  /**
   * What has actually been observed for the entry's species,
   * exactly as garden-research reports it, copied fresh.
   */
  summary: SpeciesResearchSummary;
  /**
   * The discovery-honesty verdict per bio field, in requirement
   * order, exactly as garden-research reports it, copied fresh.
   */
  bioFill: BioFieldFill[];
}

/** One outing plus its arrival readings plus its per-species research readings. */
export interface GardenOutingResearch {
  /** The outing-plus-movement-plus-arrivals bundle, exactly as slice 45 reports it. */
  outingArrivals: GardenOutingArrivals;
  /** One research reading per caller-named research entry, in caller order. */
  research: ResearchReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its arrival readings plus its per-species
 * research readings: outing-arrivals bundle + per-entry
 * research readings, each exactly as its own read reports it,
 * side by side, with no merged composition and no
 * reconciliation between their pictures.
 */
export function gardenOutingResearch(
  inputs: GardenOutingResearchInputs,
): GardenOutingResearch {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-research: inputs must be an object");
  }
  if (
    inputs.outingArrivals === null ||
    typeof inputs.outingArrivals !== "object"
  ) {
    throw new Error(
      "garden-outing-research: outingArrivals inputs must be an object",
    );
  }
  if (inputs.research === null || typeof inputs.research !== "object") {
    throw new Error(
      "garden-outing-research: research inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.research.entries)) {
    throw new Error(
      "garden-outing-research: research entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.research.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-research: research entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-research: research entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-research: duplicate research entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!isNonEmptyString(entry.speciesId)) {
      throw new Error(
        "garden-outing-research: research entry speciesId must be a non-empty string",
      );
    }
    if (!Array.isArray(entry.log)) {
      throw new Error(
        "garden-outing-research: research entry log must be an array",
      );
    }
    for (const observation of entry.log) {
      validateResearchObservation(observation);
    }
    if (
      entry.speciesOfCreature === null ||
      typeof entry.speciesOfCreature !== "object"
    ) {
      throw new Error(
        "garden-outing-research: research entry speciesOfCreature must be a Map or a plain record",
      );
    }
    if (!Array.isArray(entry.requirements)) {
      throw new Error(
        "garden-outing-research: research entry requirements must be an array",
      );
    }
    const seenFields = new Set<string>();
    for (const requirement of entry.requirements) {
      if (requirement === null || typeof requirement !== "object") {
        throw new Error(
          "garden-outing-research: research entry bio requirement must be an object",
        );
      }
      if (!isNonEmptyString(requirement.field)) {
        throw new Error(
          "garden-outing-research: research entry bio field must be a non-empty string",
        );
      }
      if (!isNonEmptyString(requirement.requiredKind)) {
        throw new Error(
          "garden-outing-research: research entry bio requiredKind must be a non-empty string",
        );
      }
      if (seenFields.has(requirement.field)) {
        throw new Error(
          `garden-outing-research: duplicate bio field: ${requirement.field}`,
        );
      }
      seenFields.add(requirement.field);
    }
  }
  const outingArrivals = gardenOutingArrivals(inputs.outingArrivals);
  const researchReadings = inputs.research.entries.map((entry) => {
    const summary = researchSummaryForSpecies(
      entry.log,
      entry.speciesId,
      entry.speciesOfCreature,
    );
    const bioFill = bioFillForSpecies(
      entry.log,
      entry.speciesId,
      entry.speciesOfCreature,
      entry.requirements,
    );
    return {
      id: entry.id,
      summary: {
        ...summary,
        observedKinds: [...summary.observedKinds],
        kinds: summary.kinds.map((tally) => ({ ...tally })),
      },
      bioFill: bioFill.map((fill) => ({ ...fill })),
    };
  });
  return { outingArrivals, research: researchReadings };
}
