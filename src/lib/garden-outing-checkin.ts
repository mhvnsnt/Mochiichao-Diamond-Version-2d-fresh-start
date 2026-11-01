/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in — one outing plus its bridge
 * records plus its check-in beats, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-level-plus-records bundle from
 *   garden-outing-record (slice 37: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, plus one
 *   Garden level summary per caller-named level entry, plus one
 *   bridge record per caller-named record entry, each exactly as
 *   its own read reports it);
 * - one check-in beat per caller-named checkin entry, in caller
 *   order, via garden-checkin's gardenCheckIn, over each entry's
 *   OWN doorway log, news options, and autonomous-change inputs.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the checkins section is NOT computed
 * from the outing-record section's outing, bonds, decay, comfort,
 * thanks, level, or record values — a caller counts its own
 * doorway log and autonomous inputs and hands this module those
 * inputs, exactly as garden-checkin requires — and the
 * outing-record section is NOT overwritten by any check-in beat.
 * A Garden can therefore read one fact in the outing-record
 * section and a different fact in a check-in beat over a different
 * log, and both facts are reported. A check-in beat never changes
 * an outing, a bond, a comfort day, a thanks signal, a level
 * summary, or a bridge record in this module's hands, and an
 * outing never sets a check-in stamp — each is a read at the
 * moment of the call, and the inputs each read reports are
 * returned unchanged. Which of them a host shows first, and
 * whether either changes anything in live play, is a host decision
 * this module does not make. The bundle itself carries no merged
 * residents field, no band, cap, or scale on any check-in beat
 * beyond the reads' own rules, no currency, balance, spend, or
 * unlock, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-record section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-record bundle and the checkins section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   checkins section's facts are exactly what gardenCheckIn
 *   reports over each entry's own inputs, and the outing-record
 *   section's facts are exactly what gardenOutingRecord reports
 *   over its own inputs;
 * - NO check-in beat computed from an outing-record value: the
 *   doorway log, news options, and autonomous inputs are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, or a bridge record;
 * - NO outing, bond, comfort, thanks, level, or record writer:
 *   a check-in beat is a summary this module never stores or
 *   unlocks with (what a check-in unlocks is a later
 *   host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on a check-in
 *   beat beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-record
 *   and garden-checkin, caller-supplied);
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
 * the check-in beats are copied here (news items, migration,
 * story, and arcs with their entries), so mutating a returned
 * beat never touches the caller's doorway log or autonomous
 * inputs. Loud failures (throw) on a malformed input bundle, a
 * missing outing-record or checkins section, a bad checkins
 * entries shape, a bad or duplicate checkin entry id, and on any
 * failure the composed reads themselves raise. Silent defaults
 * are never invented: an outing with no arrivals, no meetings, no
 * news, no records, no observations, no bond entries, no decay
 * entries, no comfort entries, no thanks windows, no level
 * entries, no record entries, and no checkin entries reads its
 * inputs back unchanged, never a fabricated outing with a
 * check-in beat.
 */

import {
  gardenOutingRecord,
  type GardenOutingRecord,
  type GardenOutingRecordInputs,
} from "./garden-outing-record";
import {
  gardenCheckIn,
  type CheckInInputs,
  type GardenCheckIn,
} from "./garden-checkin";

/** One caller-named check-in beat, over its own inputs. */
export interface CheckinEntry {
  /** The check-in beat's id (opaque, caller-chosen). */
  id: string;
  /** That beat's own check-in inputs (see garden-checkin). */
  inputs: CheckInInputs;
}

/** The inputs one outing-plus-records-plus-checkins bundle is composed from. */
export interface GardenOutingCheckinInputs {
  /** The outing-record bundle's inputs, as slice 37 takes them. */
  outingRecord: GardenOutingRecordInputs;
  /** The checkins section's inputs: one entry per beat, in caller order. */
  checkins: {
    entries: readonly CheckinEntry[];
  };
}

/** One checkin entry's beat, copied fresh. */
export interface CheckinReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The check-in beat exactly as garden-checkin reports it. */
  checkin: GardenCheckIn;
}

/** One outing plus its bridge records plus its check-in beats. */
export interface GardenOutingCheckin {
  /** The outing-plus-level-plus-records bundle, exactly as slice 37 reports it. */
  outingRecord: GardenOutingRecord;
  /** One check-in beat per caller-named checkin entry, in caller order. */
  checkins: CheckinReading[];
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

/**
 * One outing plus its bridge records plus its check-in beats:
 * outing-record bundle + per-entry check-in beats, each exactly as
 * its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingCheckin(
  inputs: GardenOutingCheckinInputs,
): GardenOutingCheckin {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-checkin: inputs must be an object");
  }
  if (inputs.outingRecord === null || typeof inputs.outingRecord !== "object") {
    throw new Error(
      "garden-outing-checkin: outingRecord inputs must be an object",
    );
  }
  if (inputs.checkins === null || typeof inputs.checkins !== "object") {
    throw new Error(
      "garden-outing-checkin: checkins inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.checkins.entries)) {
    throw new Error("garden-outing-checkin: checkins entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.checkins.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-checkin: checkin entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-checkin: checkin entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-checkin: duplicate checkin entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (entry.inputs === null || typeof entry.inputs !== "object") {
      throw new Error(
        "garden-outing-checkin: checkin entry inputs must be an object",
      );
    }
  }
  const outingRecord = gardenOutingRecord(inputs.outingRecord);
  const checkins = inputs.checkins.entries.map((entry) => ({
    id: entry.id,
    checkin: copyCheckin(gardenCheckIn(entry.inputs)),
  }));
  return { outingRecord, checkins };
}
