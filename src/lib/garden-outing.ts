/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 — one outing's Garden loop, pure library form.
 *
 * The two bundles already landed are two lenses on the same outing,
 * and this module is their composition for one read — it invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the journey bundle from garden-journey (§2.2 inbound + §2.5
 *   check-in beat + §2.6 bridge records: what the outing brings
 *   home and the Garden's snapshot at the visit);
 * - the §2.3 research output from garden-research: one species
 *   research summary per caller-named species, in the caller's
 *   order, over the caller's own observation log and
 *   creature-to-species mapping.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the caller may hand the journey bundle
 * and the research section the same observation log or two
 * different logs, and this module does not require them to agree.
 * A journey record's observed kinds are NOT fed into a species
 * summary, and a species summary is NOT fed back into a journey
 * record — so a creature can read one set of observed kinds in
 * its own bridge record (over that record's log) and its species
 * can read a different set in the research section (over the
 * research log), and both facts are reported. Which of them a
 * host shows first, and whether either changes anything in live
 * play, is a host decision this module does not make. The outing
 * itself carries no `residents` field and no research level,
 * score, or threshold, so no caller can mistake it for a merged
 * composition or a ranked research result.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   journey bundle and the research section (above);
 * - NO reconciliation of the two sections' logs (above): each
 *   section's arrival, residency, news, and observation facts are
 *   exactly what its own read reports over its own inputs;
 * - NO research levels, scores, thresholds, or rankings
 *   (inherited from garden-research: the per-species level scale
 *   is a flagged owner decision, and no scale is assigned here);
 * - NO bio-fill section (bioFillForSpecies is the research read's
 *   own verdict; a host that wants it calls that read itself);
 * - NO honour or money field (inherited from garden-journey);
 * - NO meeting writer and NO arrival writer (inherited from
 *   garden-journey), NO cursor storage and NO check-in stamp
 *   storage (inherited from garden-journey): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section (inherited from garden-journey);
 * - NO Garden geography authored: homes and the edge are
 *   caller-supplied sets inside the composed inputs (Owner
 *   Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values
 *   are opaque caller strings; the #102 range rule is the
 *   host's filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call
 * (see garden-journey and garden-research), so each outing
 * call's result is fresh too. Loud failures (throw) on a
 * malformed input bundle, a missing journey or research
 * section, a duplicate species id, and on any failure the
 * composed reads themselves raise (malformed logs, duplicate
 * movement ids, malformed mappings or meetings, malformed
 * record entries, unknown cursors, a non-finite check-in
 * stamp, malformed observations, malformed species mappings).
 * Silent defaults are never invented: an outing with no
 * arrivals, no meetings, no news, no records, and no
 * observations reads its inputs back unchanged, never a
 * fabricated outing.
 */

import {
  gardenJourney,
  type GardenJourney,
  type GardenJourneyInputs,
} from "./garden-journey";
import {
  researchSummaryForSpecies,
  type ResearchObservationLog,
  type SpeciesOfCreature,
  type SpeciesResearchSummary,
} from "./garden-research";

/** The inputs one outing's research section is composed from. */
export interface OutingResearchInputs {
  /** The §2.3 observation log, as garden-research takes it. */
  log: ResearchObservationLog;
  /** Caller-resolved creature-to-species mapping. */
  speciesOfCreature: SpeciesOfCreature;
  /** Species to summarise, in the order the caller wants them reported. */
  speciesIds: readonly string[];
}

/** The inputs one outing's loop bundle is composed from. */
export interface GardenOutingInputs {
  /** The journey bundle's inputs, as slice 30 takes them. */
  journey: GardenJourneyInputs;
  /** The §2.3 research section's inputs, as garden-research takes them. */
  research: OutingResearchInputs;
}

/** One outing's Garden loop: journey bundle plus research summaries. */
export interface GardenOuting {
  /** The journey bundle, exactly as slice 30 reports it. */
  journey: GardenJourney;
  /** One species research summary per caller-named species, in caller order. */
  research: SpeciesResearchSummary[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing's Garden loop: journey + species research summaries,
 * each exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their logs.
 */
export function gardenOuting(inputs: GardenOutingInputs): GardenOuting {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing: inputs must be an object");
  }
  if (inputs.journey === null || typeof inputs.journey !== "object") {
    throw new Error("garden-outing: journey inputs must be an object");
  }
  if (inputs.research === null || typeof inputs.research !== "object") {
    throw new Error("garden-outing: research inputs must be an object");
  }
  const research = inputs.research;
  if (!Array.isArray(research.speciesIds)) {
    throw new Error("garden-outing: speciesIds must be an array");
  }
  const seen = new Set<string>();
  for (const speciesId of research.speciesIds) {
    if (!isNonEmptyString(speciesId)) {
      throw new Error(
        "garden-outing: speciesId must be a non-empty string",
      );
    }
    if (seen.has(speciesId)) {
      throw new Error(
        `garden-outing: duplicate species id: ${speciesId}`,
      );
    }
    seen.add(speciesId);
  }
  const journey = gardenJourney(inputs.journey);
  const summaries = research.speciesIds.map((speciesId) =>
    researchSummaryForSpecies(
      research.log,
      speciesId,
      research.speciesOfCreature,
    ),
  );
  return { journey, research: summaries };
}
