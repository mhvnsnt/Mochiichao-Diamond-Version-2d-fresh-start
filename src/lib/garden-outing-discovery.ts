/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery — one outing plus its per-species research
 * readings plus its Garden-edge discovery candidates, pure
 * library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-arrivals-plus-research bundle from
 *   garden-outing-research (slice 46: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, one arrivals
 *   reading per caller-named arrival entry, and one research
 *   reading per caller-named research entry, each exactly as its
 *   own read reports it);
 * - one discovery reading per caller-named discovery entry, in
 *   caller order, via garden-discovery's edgeDiscoveries, over
 *   each entry's OWN doorway log, caller-supplied Garden-edge
 *   places, and optional caller-resolved range-eligible
 *   creature set.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the discovery section is NOT computed
 * from the outing-research section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, teacher, movement, arrival, or research
 * values — a caller counts its own doorway log and hands this
 * module those inputs, exactly as garden-discovery requires — and
 * the outing-research section is NOT overwritten by any discovery
 * candidate. A Garden can therefore read one fact in the
 * outing-research section and a different fact in a discovery
 * reading over a different log, and both facts are reported. A
 * discovery candidate never changes an outing, a bond, a comfort
 * day, a thanks signal, a level summary, a bridge record, a
 * check-in beat, a snapshot lens, a journey visit, an unlock
 * evaluation, an individual summary, a teacher reading, a
 * movement reading, an arrival reading, or a research reading in
 * this module's hands, and an outing never sets a discovery
 * entry's log, edge places, or eligible set — each is a read at
 * the moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether a discovery candidate is actually met on a route, is
 * a host decision this module does not make (garden-discovery's
 * own notes: encounter, spawn, and route behaviour stay with
 * the journey host).
 * The bundle itself carries no merged residents field, no
 * total-across-discovery field, no discovery level, score,
 * threshold, or ranking on any candidate beyond the reads' own
 * rules, no currency, balance, or spend, and no named rite or
 * bell-equivalent object (the gathering beat stays inside the
 * outing-research section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-research bundle and the discovery section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the discovery section's facts are exactly what
 *   edgeDiscoveries reports over each entry's own inputs, and
 *   the outing-research section's facts are exactly what
 *   gardenOutingResearch reports over its own inputs;
 * - NO discovery candidate computed from an outing-research value:
 *   the log, edge places, and eligible set are caller-supplied,
 *   never read off a bond list, a decay breakdown, a comfort day,
 *   a thanks intensity, a level summary, a bridge record, a
 *   check-in beat, a snapshot lens, a journey visit, an unlock
 *   evaluation, an individual summary, a teacher reading, a
 *   movement reading, an arrival reading, or a research reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, or discovery writer: a discovery candidate
 *   is a summary this module never stores or unlocks with in live
 *   play, and no record is appended to any log here;
 * - NO discovery vocabulary authored (all ids, edge places, and
 *   creature ids are opaque caller strings, and the verb set is
 *   inherited from garden-discovery, never extended here);
 * - NO discovery level, score, threshold, or ranking on a
 *   candidate beyond the composed reads' own rules (inherited:
 *   a creature qualifies exactly when its last movement is a
 *   release to a caller-supplied edge place, and an optional
 *   caller-resolved eligible set applies the range rule);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from
 *   garden-outing-research and garden-discovery,
 *   caller-supplied);
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
 * the discovery candidates are copied here, so mutating a
 * returned candidate never touches the caller's log or edge set.
 * Loud failures (throw) on a malformed input bundle, a missing
 * outing-research or discovery section, a bad discovery entries
 * shape, a bad or duplicate discovery entry id, a bad log, a
 * bad edge set, and on any failure the composed reads
 * themselves raise. Silent defaults are never invented: an
 * outing with no discovery, no meetings, no news, no records,
 * no observations, no bond entries, no decay entries, no
 * comfort entries, no thanks windows, no level entries, no
 * record entries, no checkin entries, no snapshot entries, no
 * journey entries, no unlock entries, no individual entries, no
 * teacher entries, no movement entries, no arrival entries, no
 * research entries, and no discovery entries reads its inputs
 * back unchanged, never a fabricated outing with a discovery
 * candidate.
 */

import {
  gardenOutingResearch,
  type GardenOutingResearch,
  type GardenOutingResearchInputs,
} from "./garden-outing-research";
import {
  edgeDiscoveries,
  type GardenEdgeDiscovery,
  type GardenEdgeDiscoveryOptions,
} from "./garden-discovery";
import type { MovementLog } from "./garden-movement";

/** One caller-named discovery reading, over its own inputs. */
export interface DiscoveryEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** That reading's own doorway log (see garden-discovery). */
  log: MovementLog;
  /** That reading's own Garden-edge places (see garden-discovery). */
  gardenEdge: GardenEdgeDiscoveryOptions["gardenEdge"];
  /** That reading's own optional caller-resolved eligible set. */
  eligibleCreatures?: GardenEdgeDiscoveryOptions["eligibleCreatures"];
}

/** The inputs one outing-plus-research-plus-discovery bundle is composed from. */
export interface GardenOutingDiscoveryInputs {
  /** The outing-research bundle's inputs, as slice 46 takes them. */
  outingResearch: GardenOutingResearchInputs;
  /** The discovery section's inputs: one entry per reading, in caller order. */
  discovery: {
    entries: readonly DiscoveryEntry[];
  };
}

/** One discovery entry's reading, copied fresh. */
export interface DiscoveryReading {
  /** The entry's id, as supplied. */
  id: string;
  /**
   * The creatures currently discoverable at the Garden edge for
   * this entry, exactly as garden-discovery reports them, copied
   * fresh, in release-stamp order.
   */
  discoveries: GardenEdgeDiscovery[];
}

/** One outing plus its research readings plus its edge-discovery candidates. */
export interface GardenOutingDiscovery {
  /** The outing-plus-arrivals-plus-research bundle, exactly as slice 46 reports it. */
  outingResearch: GardenOutingResearch;
  /** One discovery reading per caller-named discovery entry, in caller order. */
  discovery: DiscoveryReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its research readings plus its edge-discovery
 * candidates: outing-research bundle + per-entry discovery
 * readings, each exactly as its own read reports it, side by
 * side, with no merged composition and no reconciliation
 * between their pictures.
 */
export function gardenOutingDiscovery(
  inputs: GardenOutingDiscoveryInputs,
): GardenOutingDiscovery {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-discovery: inputs must be an object");
  }
  if (
    inputs.outingResearch === null ||
    typeof inputs.outingResearch !== "object"
  ) {
    throw new Error(
      "garden-outing-discovery: outingResearch inputs must be an object",
    );
  }
  if (inputs.discovery === null || typeof inputs.discovery !== "object") {
    throw new Error(
      "garden-outing-discovery: discovery inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.discovery.entries)) {
    throw new Error(
      "garden-outing-discovery: discovery entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.discovery.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-discovery: discovery entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-discovery: discovery entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-discovery: duplicate discovery entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.log)) {
      throw new Error(
        "garden-outing-discovery: discovery entry log must be an array",
      );
    }
    if (entry.gardenEdge === undefined || entry.gardenEdge === null) {
      throw new Error(
        "garden-outing-discovery: discovery entry gardenEdge must be a set or an array",
      );
    }
  }
  const outingResearch = gardenOutingResearch(inputs.outingResearch);
  const discoveryReadings = inputs.discovery.entries.map((entry) => {
    const discoveries = edgeDiscoveries(entry.log, {
      gardenEdge: entry.gardenEdge,
      ...(entry.eligibleCreatures !== undefined
        ? { eligibleCreatures: entry.eligibleCreatures }
        : {}),
    });
    return {
      id: entry.id,
      discoveries: discoveries.map((candidate) => ({ ...candidate })),
    };
  });
  return { outingResearch, discovery: discoveryReadings };
}
