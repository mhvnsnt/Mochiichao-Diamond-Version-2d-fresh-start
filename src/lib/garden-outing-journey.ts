/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey — one outing
 * plus its snapshot lenses plus its journey visits, pure library
 * form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-checkins-plus-snapshots bundle from
 *   garden-outing-snapshot (slice 39: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, plus one
 *   bridge record per caller-named record entry, plus one
 *   check-in beat per caller-named checkin entry, plus one Garden
 *   snapshot per caller-named snapshot entry, each exactly as
 *   its own read reports it);
 * - one Garden journey per caller-named journey entry, in caller
 *   order, via garden-journey's gardenJourney, over each entry's
 *   OWN inbound inputs and snapshot inputs.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the journeys section is NOT computed
 * from the outing-snapshot section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, or snapshot values
 * — a caller counts its own doorway log and record inputs and
 * hands this module those inputs, exactly as garden-journey
 * requires — and the outing-snapshot section is NOT overwritten
 * by any journey. A Garden can therefore read one fact in the
 * outing-snapshot section and a different fact in a journey visit
 * over a different log, and both facts are reported. A journey
 * never changes an outing, a bond, a comfort day, a thanks
 * signal, a level summary, a bridge record, a check-in beat, or
 * a snapshot lens in this module's hands, and an outing never
 * sets a journey's arrival or teacher — each is a read at the
 * moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether either changes anything in live play, is a host decision
 * this module does not make. The bundle itself carries no merged
 * residents field, no band, cap, or scale on any journey beyond
 * the reads' own rules, no currency, balance, spend, or unlock,
 * and no named rite or bell-equivalent object (the gathering beat
 * stays inside the outing-snapshot section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-snapshot bundle and the journeys section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   journeys section's facts are exactly what gardenJourney
 *   reports over each entry's own inputs, and the
 *   outing-snapshot section's facts are exactly what
 *   gardenOutingSnapshot reports over its own inputs;
 * - NO journey computed from an outing-snapshot value: the
 *   doorway log, teacher mapping, meetings, news options,
 *   autonomous inputs, and record inputs are caller-supplied,
 *   never read off a bond list, a decay breakdown, a comfort day,
 *   a thanks intensity, a level summary, a bridge record, a
 *   check-in beat, or a snapshot lens;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, or journey writer: a journey is a summary this
 *   module never stores or unlocks with (what a journey unlocks
 *   is a later host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on a journey
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-snapshot
 *   and garden-journey, caller-supplied);
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
 * the journeys are copied here (inbound arrivals, teachers, and
 * taught axes; snapshot check-in beats and bridge records with
 * their lists), so mutating a returned journey never touches the
 * caller's doorway log, teacher mapping, meetings, autonomous
 * inputs, or record inputs. Loud failures (throw) on a malformed
 * input bundle, a missing outing-snapshot or journeys section, a
 * bad journeys entries shape, a bad or duplicate journey entry
 * id, and on any failure the composed reads themselves raise.
 * Silent defaults are never invented: an outing with no arrivals,
 * no meetings, no news, no records, no observations, no bond
 * entries, no decay entries, no comfort entries, no thanks
 * windows, no level entries, no record entries, no checkin
 * entries, no snapshot entries, and no journey entries reads its
 * inputs back unchanged, never a fabricated outing with a
 * journey visit.
 */

import {
  gardenOutingSnapshot,
  type GardenOutingSnapshot,
  type GardenOutingSnapshotInputs,
} from "./garden-outing-snapshot";
import {
  gardenJourney,
  type GardenJourney,
  type GardenJourneyInputs,
} from "./garden-journey";
import type { BridgeRecord } from "./garden-record";
import type { GardenCheckIn } from "./garden-checkin";

/** One caller-named Garden journey, over its own inputs. */
export interface JourneyEntry {
  /** The journey's id (opaque, caller-chosen). */
  id: string;
  /** That journey's own journey inputs (see garden-journey). */
  inputs: GardenJourneyInputs;
}

/** The inputs one outing-plus-snapshots-plus-journeys bundle is composed from. */
export interface GardenOutingJourneyInputs {
  /** The outing-snapshot bundle's inputs, as slice 39 takes them. */
  outingSnapshot: GardenOutingSnapshotInputs;
  /** The journeys section's inputs: one entry per journey, in caller order. */
  journeys: {
    entries: readonly JourneyEntry[];
  };
}

/** One journey entry's journey, copied fresh. */
export interface JourneyReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The Garden journey exactly as garden-journey reports it. */
  journey: GardenJourney;
}

/** One outing plus its snapshot lenses plus its journey visits. */
export interface GardenOutingJourney {
  /** The outing-plus-checkins-plus-snapshots bundle, exactly as slice 39 reports it. */
  outingSnapshot: GardenOutingSnapshot;
  /** One Garden journey per caller-named journey entry, in caller order. */
  journeys: JourneyReading[];
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

function copyJourney(journey: GardenJourney): GardenJourney {
  return {
    inbound: {
      arrivals: journey.inbound.arrivals.map((entry) => ({ ...entry })),
      teachers: journey.inbound.teachers.map((entry) => ({
        ...entry,
        axes: [...entry.axes],
      })),
      taughtAxes: [...journey.inbound.taughtAxes],
    },
    snapshot: {
      checkIn: copyCheckin(journey.snapshot.checkIn),
      records: journey.snapshot.records.map((record) => copyRecord(record)),
    },
  };
}

/**
 * One outing plus its snapshot lenses plus its journey visits:
 * outing-snapshot bundle + per-entry Garden journeys, each exactly
 * as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingJourney(
  inputs: GardenOutingJourneyInputs,
): GardenOutingJourney {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-journey: inputs must be an object");
  }
  if (inputs.outingSnapshot === null || typeof inputs.outingSnapshot !== "object") {
    throw new Error(
      "garden-outing-journey: outingSnapshot inputs must be an object",
    );
  }
  if (inputs.journeys === null || typeof inputs.journeys !== "object") {
    throw new Error(
      "garden-outing-journey: journeys inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.journeys.entries)) {
    throw new Error("garden-outing-journey: journeys entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.journeys.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-journey: journey entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-journey: journey entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-journey: duplicate journey entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (entry.inputs === null || typeof entry.inputs !== "object") {
      throw new Error(
        "garden-outing-journey: journey entry inputs must be an object",
      );
    }
  }
  const outingSnapshot = gardenOutingSnapshot(inputs.outingSnapshot);
  const journeys = inputs.journeys.entries.map((entry) => ({
    id: entry.id,
    journey: copyJourney(gardenJourney(entry.inputs)),
  }));
  return { outingSnapshot, journeys };
}
