/**
 * B3 §2.5 + §2.6 — one Garden snapshot, pure library form.
 *
 * The two bridge bundles already landed are two lenses on the same
 * Garden, and this module is their composition for one read — it
 * invents no new section and no new rule. It calls the existing
 * reads and reports exactly what they return, side by side:
 * - the check-in beat from garden-checkin (§2.5: news since the
 *   last check-in, plus the Garden's autonomous change);
 * - one bridge record per caller-named creature from
 *   garden-record (§2.6: arrival + residency + bonds +
 *   observations + edge discovery), in the caller's order.
 *
 * Each record entry carries its OWN record inputs: the bond
 * ledger, decay profile, facts, and observation log are
 * per-creature inputs in the record read (factsByKeeper maps
 * keepers to facts for that one creature), so a snapshot over
 * several creatures cannot share one record bundle across them
 * without smuggling one creature's facts into another's record.
 * The caller supplies one entry per creature, and the snapshot
 * reports them in entry order, unchanged.
 *
 * The two sections are different lenses, not two halves of one
 * composition, and they are never merged or chained: the
 * autonomous change is NOT applied to the records, and the
 * records are NOT fed back into the check-in beat. A creature
 * can be departed by the story schedule in the check-in section
 * and still read resident in its own record (its record runs
 * over its own doorway log), and both facts are reported. Which
 * of them a host shows first, and whether either changes
 * anything in live play, is a host decision this module does
 * not make. The snapshot itself carries no `residents` field,
 * so no caller can mistake it for a merged composition.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   check-in beat and the records (above);
 * - NO record sharing across creatures (above): one entry, one
 *   creature, its own inputs;
 * - NO cursor storage and NO check-in stamp storage: the caller
 *   keeps the stamp and both cursors (its save record's job,
 *   later). This read takes them as inputs and stores nothing;
 * - NO new section: a record gains a field only when its own
 *   read gains one (see garden-record's deliberately-NOT list);
 * - NO Garden geography authored: homes and the edge are
 *   caller-supplied sets inside the composed inputs (Owner
 *   Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values are
 *   opaque caller strings; the #102 range rule is the host's
 *   filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered; the snapshot
 * and every section and list inside it are fresh objects and
 * fresh arrays. Loud failures (throw) on a malformed input
 * bundle, a non-array record list, a malformed or duplicate
 * record entry, and on any failure the composed reads
 * themselves raise (malformed doorway records, a non-finite
 * check-in stamp, malformed rules or beats, duplicate rule/beat
 * ids, an unknown cursor, a beat naming one resident twice,
 * malformed ledgers, facts for a keeper with no bond entry,
 * malformed observation logs). Silent defaults are never
 * invented: a Garden with no news, no firing rule, no applied
 * beat, and no records reads its inputs back unchanged, never
 * a fabricated change.
 */

import {
  gardenCheckIn,
  type CheckInInputs,
  type GardenCheckIn,
} from "./garden-checkin";
import {
  bridgeRecordForCreature,
  type BridgeRecord,
  type BridgeRecordInputs,
} from "./garden-record";

/** One creature's entry in a snapshot: its id plus its own record inputs. */
export interface SnapshotRecordEntry {
  /** The creature the record is about (opaque id). */
  creatureId: string;
  /** That creature's own bridge-record inputs (see garden-record). */
  inputs: BridgeRecordInputs;
}

/** The inputs one Garden snapshot is composed from. */
export interface GardenSnapshotInputs {
  /** The check-in beat's inputs, as slice 28 takes them. */
  checkIn: CheckInInputs;
  /** One entry per creature, in the order the caller wants them reported. */
  records: SnapshotRecordEntry[];
}

/** One Garden snapshot: the check-in beat plus per-creature records. */
export interface GardenSnapshot {
  /** The check-in beat, exactly as slice 28 reports it. */
  checkIn: GardenCheckIn;
  /** One bridge record per entry, in entry order. */
  records: BridgeRecord[];
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
 * One Garden snapshot: the check-in beat + one bridge record per
 * caller-named creature, each exactly as its own read reports
 * it, side by side, with no merged composition and no order
 * invented between them.
 */
export function gardenSnapshot(inputs: GardenSnapshotInputs): GardenSnapshot {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-snapshot: inputs must be an object");
  }
  if (!Array.isArray(inputs.records)) {
    throw new Error("garden-snapshot: records must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.records) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-snapshot: each record entry must be an object");
    }
    if (!isNonEmptyString(entry.creatureId)) {
      throw new Error(
        "garden-snapshot: each record entry needs a non-empty creatureId",
      );
    }
    if (entry.inputs === null || typeof entry.inputs !== "object") {
      throw new Error(
        "garden-snapshot: each record entry needs a record inputs object",
      );
    }
    if (seen.has(entry.creatureId)) {
      throw new Error(
        `garden-snapshot: duplicate record entry for creature ${entry.creatureId}`,
      );
    }
    seen.add(entry.creatureId);
  }
  const checkIn = gardenCheckIn(inputs.checkIn);
  const records = inputs.records.map((entry) =>
    copyRecord(bridgeRecordForCreature(entry.creatureId, entry.inputs)),
  );
  return {
    checkIn: {
      news: checkIn.news.map((item) => ({ ...item })),
      autonomous: {
        migration: {
          residents: [...checkIn.autonomous.migration.residents],
          arrived: [...checkIn.autonomous.migration.arrived],
          departed: [...checkIn.autonomous.migration.departed],
          appliedRuleIds: [...checkIn.autonomous.migration.appliedRuleIds],
        },
        story: {
          residents: [...checkIn.autonomous.story.residents],
          arrived: [...checkIn.autonomous.story.arrived],
          departed: [...checkIn.autonomous.story.departed],
          appliedBeatIds: [...checkIn.autonomous.story.appliedBeatIds],
        },
        arcs: {
          arcs: checkIn.autonomous.arcs.arcs.map((entry) => ({ ...entry })),
          changed: [...checkIn.autonomous.arcs.changed],
          appliedBeatIds: [...checkIn.autonomous.arcs.appliedBeatIds],
        },
      },
    },
    records,
  };
}
