/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot — one outing plus its
 * check-in beats plus its snapshot lenses, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-records-plus-checkins bundle from
 *   garden-outing-checkin (slice 38: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, plus one
 *   bridge record per caller-named record entry, plus one
 *   check-in beat per caller-named checkin entry, each exactly as
 *   its own read reports it);
 * - one Garden snapshot per caller-named snapshot entry, in caller
 *   order, via garden-snapshot's gardenSnapshot, over each entry's
 *   OWN check-in inputs and record entries.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the snapshots section is NOT computed
 * from the outing-checkin section's outing, bonds, decay, comfort,
 * thanks, level, record, or check-in values — a caller counts its
 * own doorway log and record inputs and hands this module those
 * inputs, exactly as garden-snapshot requires — and the
 * outing-checkin section is NOT overwritten by any snapshot. A
 * Garden can therefore read one fact in the outing-checkin
 * section and a different fact in a snapshot lens over a different
 * log, and both facts are reported. A snapshot never changes an
 * outing, a bond, a comfort day, a thanks signal, a level summary,
 * a bridge record, or a check-in beat in this module's hands, and
 * an outing never sets a snapshot's check-in stamp — each is a read
 * at the moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether either changes anything in live play, is a host decision
 * this module does not make. The bundle itself carries no merged
 * residents field, no band, cap, or scale on any snapshot beyond
 * the reads' own rules, no currency, balance, spend, or unlock,
 * and no named rite or bell-equivalent object (the gathering beat
 * stays inside the outing-checkin section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-checkin bundle and the snapshots section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   snapshots section's facts are exactly what gardenSnapshot
 *   reports over each entry's own inputs, and the outing-checkin
 *   section's facts are exactly what gardenOutingCheckin reports
 *   over its own inputs;
 * - NO snapshot computed from an outing-checkin value: the
 *   doorway log, news options, autonomous inputs, and record
 *   inputs are caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level summary,
 *   a bridge record, or a check-in beat;
 * - NO outing, bond, comfort, thanks, level, record, or check-in
 *   writer: a snapshot is a summary this module never stores or
 *   unlocks with (what a snapshot unlocks is a later
 *   host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on a snapshot
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-checkin
 *   and garden-snapshot, caller-supplied);
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
 * the snapshots are copied here (check-in beats and bridge records
 * with their lists), so mutating a returned snapshot never touches
 * the caller's doorway log, autonomous inputs, or record inputs.
 * Loud failures (throw) on a malformed input bundle, a missing
 * outing-checkin or snapshots section, a bad snapshots entries
 * shape, a bad or duplicate snapshot entry id, and on any failure
 * the composed reads themselves raise. Silent defaults are never
 * invented: an outing with no arrivals, no meetings, no news, no
 * records, no observations, no bond entries, no decay entries, no
 * comfort entries, no thanks windows, no level entries, no record
 * entries, no checkin entries, and no snapshot entries reads its
 * inputs back unchanged, never a fabricated outing with a
 * snapshot lens.
 */

import {
  gardenOutingCheckin,
  type GardenOutingCheckin,
  type GardenOutingCheckinInputs,
} from "./garden-outing-checkin";
import {
  gardenSnapshot,
  type GardenSnapshot,
  type GardenSnapshotInputs,
} from "./garden-snapshot";
import type { BridgeRecord } from "./garden-record";
import type { GardenCheckIn } from "./garden-checkin";

/** One caller-named Garden snapshot, over its own inputs. */
export interface SnapshotEntry {
  /** The snapshot's id (opaque, caller-chosen). */
  id: string;
  /** That snapshot's own snapshot inputs (see garden-snapshot). */
  inputs: GardenSnapshotInputs;
}

/** The inputs one outing-plus-checkins-plus-snapshots bundle is composed from. */
export interface GardenOutingSnapshotInputs {
  /** The outing-checkin bundle's inputs, as slice 38 takes them. */
  outingCheckin: GardenOutingCheckinInputs;
  /** The snapshots section's inputs: one entry per snapshot, in caller order. */
  snapshots: {
    entries: readonly SnapshotEntry[];
  };
}

/** One snapshot entry's snapshot, copied fresh. */
export interface SnapshotReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The Garden snapshot exactly as garden-snapshot reports it. */
  snapshot: GardenSnapshot;
}

/** One outing plus its check-in beats plus its snapshot lenses. */
export interface GardenOutingSnapshot {
  /** The outing-plus-records-plus-checkins bundle, exactly as slice 38 reports it. */
  outingCheckin: GardenOutingCheckin;
  /** One Garden snapshot per caller-named snapshot entry, in caller order. */
  snapshots: SnapshotReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function copyCheckin(checkin: GardenCheckIn): GardenCheckIn {
  return {
    news: checkin.news.map((item) => ({ ...item })),
    autonomous: {
      migration: {
        residents: [...checkin.autonomous.migration.residents],
        arrived: [...checkin.autonomous.migration.arrived],
        departed: [...checkin.autonomous.migration.departed],
        appliedRuleIds: [...checkin.autonomous.migration.appliedRuleIds],
      },
      story: {
        residents: [...checkin.autonomous.story.residents],
        arrived: [...checkin.autonomous.story.arrived],
        departed: [...checkin.autonomous.story.departed],
        appliedBeatIds: [...checkin.autonomous.story.appliedBeatIds],
      },
      arcs: {
        arcs: checkin.autonomous.arcs.arcs.map((entry) => ({ ...entry })),
        changed: [...checkin.autonomous.arcs.changed],
        appliedBeatIds: [...checkin.autonomous.arcs.appliedBeatIds],
      },
    },
  };
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

function copySnapshot(snapshot: GardenSnapshot): GardenSnapshot {
  return {
    checkIn: copyCheckin(snapshot.checkIn),
    records: snapshot.records.map((record) => copyRecord(record)),
  };
}

/**
 * One outing plus its check-in beats plus its snapshot lenses:
 * outing-checkin bundle + per-entry Garden snapshots, each exactly as
 * its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingSnapshot(
  inputs: GardenOutingSnapshotInputs,
): GardenOutingSnapshot {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-snapshot: inputs must be an object");
  }
  if (inputs.outingCheckin === null || typeof inputs.outingCheckin !== "object") {
    throw new Error(
      "garden-outing-snapshot: outingCheckin inputs must be an object",
    );
  }
  if (inputs.snapshots === null || typeof inputs.snapshots !== "object") {
    throw new Error(
      "garden-outing-snapshot: snapshots inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.snapshots.entries)) {
    throw new Error("garden-outing-snapshot: snapshots entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.snapshots.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-snapshot: snapshot entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-snapshot: snapshot entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-snapshot: duplicate snapshot entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (entry.inputs === null || typeof entry.inputs !== "object") {
      throw new Error(
        "garden-outing-snapshot: snapshot entry inputs must be an object",
      );
    }
  }
  const outingCheckin = gardenOutingCheckin(inputs.outingCheckin);
  const snapshots = inputs.snapshots.entries.map((entry) => ({
    id: entry.id,
    snapshot: copySnapshot(gardenSnapshot(entry.inputs)),
  }));
  return { outingCheckin, snapshots };
}
