/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records — one outing plus its level summaries plus
 * its bridge records, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-thanks-plus-level bundle from
 *   garden-outing-level (slice 36: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, each
 *   exactly as its own read reports it);
 * - one bridge record per caller-named record entry, in caller
 *   order, via garden-record's bridgeRecordForCreature, over
 *   each entry's OWN movement log, garden homes, bond ledger,
 *   decay profile, facts, observation log, and (when supplied)
 *   edge set.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the records section is NOT computed from
 * the outing-level section's bonds, decay, comfort, thanks, or
 * level values — a caller counts its own doorway log, ledger,
 * facts, and observations and hands this module those inputs,
 * exactly as garden-record requires — and the outing-level section
 * is NOT overwritten by any bridge record. A Garden can therefore
 * read one bond value in the outing-level section and a different
 * bond value in a bridge record over a different ledger, and both
 * facts are reported. A record never changes an outing, a bond, a
 * comfort day, a thanks signal, or a level summary in this
 * module's hands, and an outing never sets a record — each is a
 * read at the moment of the call, and the inputs each read reports
 * are returned unchanged. Which of them a host shows first, and
 * whether either changes anything in live play, is a host decision
 * this module does not make. The bundle itself carries no merged
 * residents field, no band, cap, or scale on any record beyond
 * the reads' own rules (bond decay and level bands are
 * caller-supplied, inherited from garden-record and
 * garden-outing-level), no currency, balance, spend, or unlock,
 * and no named rite or bell-equivalent object (the gathering beat
 * stays inside the outing-level section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-level bundle and the records section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   records section's facts are exactly what
 *   bridgeRecordForCreature reports over each entry's own inputs,
 *   and the outing-level section's facts are exactly what
 *   gardenOutingLevel reports over its own inputs;
 * - NO record computed from an outing-level value: the doorway
 *   log, ledger, facts, and observations are caller-supplied
 *   numbers and lists, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, or a level
 *   summary;
 * - NO outing, bond, comfort, thanks, or level writer: an outing
 *   is a journey read, bonds are the ledger read's own values,
 *   and a record is a summary this module never stores or
 *   unlocks with (what a record unlocks is a later
 *   host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on a record
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-level
 *   and garden-record, caller-supplied);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing-level); NO bio-fill section (inherited);
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
 * the bridge records are copied here (arrival, bonds with their
 * contributions, observations, kinds, and edge entry), so
 * mutating a returned record never touches the caller's movement
 * log, ledger, facts, or observation log. Loud failures (throw)
 * on a malformed input bundle, a missing outing-level or records
 * section, a bad records entries shape, a bad or duplicate record
 * entry creature id, and on any failure the composed reads
 * themselves raise. Silent defaults are never invented: an outing
 * with no arrivals, no meetings, no news, no records, no
 * observations, no bond entries, no decay entries, no comfort
 * entries, no thanks windows, no level entries, and no record
 * entries reads its inputs back unchanged, never a fabricated
 * outing with a record.
 */

import {
  gardenOutingLevel,
  type GardenOutingLevel,
  type GardenOutingLevelInputs,
} from "./garden-outing-level";
import {
  bridgeRecordForCreature,
  type BridgeRecord,
  type BridgeRecordInputs,
} from "./garden-record";

/** One caller-named bridge record, over its own inputs. */
export interface RecordEntry {
  /** The creature the record is about (opaque id). */
  creatureId: string;
  /** That creature's own bridge-record inputs (see garden-record). */
  inputs: BridgeRecordInputs;
}

/** The inputs one outing-plus-level-plus-records bundle is composed from. */
export interface GardenOutingRecordInputs {
  /** The outing-level bundle's inputs, as slice 36 takes them. */
  outingLevel: GardenOutingLevelInputs;
  /** The records section's inputs: one entry per record, in caller order. */
  records: {
    entries: readonly RecordEntry[];
  };
}

/** One record entry's bridge record, copied fresh. */
export interface RecordReading {
  /** The entry's creature id, as supplied. */
  creatureId: string;
  /** The bridge record exactly as garden-record reports it. */
  record: BridgeRecord;
}

/** One outing plus its level summaries plus its bridge records. */
export interface GardenOutingRecord {
  /** The outing-plus-thanks-plus-level bundle, exactly as slice 36 reports it. */
  outingLevel: GardenOutingLevel;
  /** One bridge record per caller-named record entry, in caller order. */
  records: RecordReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function copyRecord(record: BridgeRecord): BridgeRecord {
  return {
    creatureId: record.creatureId,
    currentlyResident: record.currentlyResident,
    currentHome: record.currentHome,
    arrival: record.arrival === null ? null : { ...record.arrival },
    bonds: {
      creatureId: record.bonds.creatureId,
      keepers: record.bonds.keepers.map((keeper) => ({
        ...keeper,
        contributions: keeper.contributions.map((entry) => ({ ...entry })),
      })),
    },
    observations: record.observations.map((entry) => ({ ...entry })),
    observedKinds: [...record.observedKinds],
    edgeDiscovery:
      record.edgeDiscovery === null ? null : { ...record.edgeDiscovery },
  };
}

/**
 * One outing plus its level summaries plus its bridge records:
 * outing-level bundle + per-entry bridge records, each exactly as
 * its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingRecord(
  inputs: GardenOutingRecordInputs,
): GardenOutingRecord {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-record: inputs must be an object");
  }
  if (inputs.outingLevel === null || typeof inputs.outingLevel !== "object") {
    throw new Error(
      "garden-outing-record: outingLevel inputs must be an object",
    );
  }
  if (inputs.records === null || typeof inputs.records !== "object") {
    throw new Error("garden-outing-record: records inputs must be an object");
  }
  if (!Array.isArray(inputs.records.entries)) {
    throw new Error("garden-outing-record: records entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.records.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-record: record entry must be an object");
    }
    if (!isNonEmptyString(entry.creatureId)) {
      throw new Error(
        "garden-outing-record: record entry creatureId must be a non-empty string",
      );
    }
    if (seen.has(entry.creatureId)) {
      throw new Error(
        `garden-outing-record: duplicate record entry creatureId: ${entry.creatureId}`,
      );
    }
    seen.add(entry.creatureId);
    if (entry.inputs === null || typeof entry.inputs !== "object") {
      throw new Error(
        "garden-outing-record: record entry inputs must be an object",
      );
    }
  }
  const outingLevel = gardenOutingLevel(inputs.outingLevel);
  const records = inputs.records.entries.map((entry) => ({
    creatureId: entry.creatureId,
    record: copyRecord(bridgeRecordForCreature(entry.creatureId, entry.inputs)),
  }));
  return { outingLevel, records };
}
