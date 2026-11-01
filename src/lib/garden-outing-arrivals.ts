/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals — one outing
 * plus its doorway movement readings plus its Garden arrival
 * readings, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-teachers-plus-movement bundle from
 *   garden-outing-movement (slice 44: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, and one movement
 *   reading per caller-named movement entry, each exactly as its
 *   own read reports it);
 * - one arrivals reading per caller-named arrival entry, in
 *   caller order, via garden-arrivals' arrivals, over each
 *   entry's OWN doorway log and Garden-home set.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the arrivals section is NOT computed
 * from the outing-movement section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, teacher, or movement values — a caller
 * counts its own doorway log and hands this module those inputs,
 * exactly as garden-arrivals requires — and the outing-movement
 * section is NOT overwritten by any arrivals reading. A Garden
 * can therefore read one fact in the outing-movement section
 * and a different fact in an arrivals reading over a different
 * log, and both facts are reported. An arrivals reading never
 * changes an outing, a bond, a comfort day, a thanks signal, a
 * level summary, a bridge record, a check-in beat, a snapshot
 * lens, a journey visit, an unlock evaluation, an individual
 * summary, a teacher reading, or a movement reading in this
 * module's hands, and an outing never sets an arrival entry's
 * log or Garden homes — each is a read at the moment of the
 * call, and the inputs each read reports are returned unchanged.
 * Which of them a host shows first, and whether an arrivals
 * reading changes anything in live play, is a host decision this
 * module does not make (the gate-currency question stays the
 * already-flagged owner decision in garden-unlocks' own notes).
 * The bundle itself carries no merged residents field, no
 * total-across-arrivals field, no band, cap, or scale on any
 * arrivals reading beyond the reads' own rules, no currency,
 * balance, or spend, and no named rite or bell-equivalent
 * object (the gathering beat stays inside the outing-movement
 * section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-movement bundle and the arrivals section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the arrivals section's facts are exactly what arrivals
 *   reports over each entry's own inputs, and the
 *   outing-movement section's facts are exactly what
 *   gardenOutingMovement reports over its own inputs;
 * - NO arrivals reading computed from an outing-movement value:
 *   the log and Garden-home set are caller-supplied, never read
 *   off a bond list, a decay breakdown, a comfort day, a thanks
 *   intensity, a level summary, a bridge record, a check-in
 *   beat, a snapshot lens, a journey visit, an unlock
 *   evaluation, an individual summary, a teacher reading, or a
 *   movement reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   or arrival writer: an arrivals reading is a summary this
 *   module never stores or unlocks with in live play (what a
 *   reading then opens is a later host/presentation decision),
 *   and no record is appended to any log here (appendMovement
 *   is the doorway writer's job, not this read's);
 * - NO arrival vocabulary authored (all ids, verbs, and homes
 *   are opaque caller strings, and the verb set is inherited
 *   from garden-movement, never extended here);
 * - NO band, threshold, tier, or unlock reading on an arrival
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from
 *   garden-outing-movement and garden-arrivals,
 *   caller-supplied);
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
 * the arrivals readings are copied here (each arrival record
 * is a fresh object in a fresh array), so mutating a returned
 * arrivals reading never touches the caller's log. Loud failures
 * (throw) on a malformed input bundle, a missing
 * outing-movement or arrivals section, a bad arrivals entries
 * shape, a bad or duplicate arrival entry id, a bad log, a bad
 * Garden-home set, a malformed doorway record, and on any
 * failure the composed reads themselves raise. Silent defaults
 * are never invented: an outing with no arrivals, no meetings,
 * no news, no records, no observations, no bond entries, no
 * decay entries, no comfort entries, no thanks windows, no
 * level entries, no record entries, no checkin entries, no
 * snapshot entries, no journey entries, no unlock entries, no
 * individual entries, no teacher entries, no movement entries,
 * and no arrival entries reads its inputs back unchanged,
 * never a fabricated outing with an arrivals reading.
 */

import {
  gardenOutingMovement,
  type GardenOutingMovement,
  type GardenOutingMovementInputs,
} from "./garden-outing-movement";
import {
  arrivals,
  type GardenArrival,
} from "./garden-arrivals";
import {
  validateMovement,
  type MovementLog,
} from "./garden-movement";

/** One caller-named arrivals reading, over its own inputs. */
export interface ArrivalEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** That reading's own doorway log (see garden-movement). */
  log: MovementLog;
  /**
   * That reading's own Garden homes, as a Set or an array
   * (see garden-arrivals; Owner Slot 5).
   */
  gardenHomes: ReadonlySet<string> | readonly string[];
}

/** The inputs one outing-plus-movement-plus-arrivals bundle is composed from. */
export interface GardenOutingArrivalsInputs {
  /** The outing-movement bundle's inputs, as slice 44 takes them. */
  outingMovement: GardenOutingMovementInputs;
  /** The arrivals section's inputs: one entry per reading, in caller order. */
  arrivals: {
    entries: readonly ArrivalEntry[];
  };
}

/** One arrival entry's reading, copied fresh. */
export interface ArrivalReading {
  /** The entry's id, as supplied. */
  id: string;
  /**
   * Every creature that arrived at the Garden, in first-arrival
   * order, exactly as garden-arrivals reports them, each record
   * copied fresh.
   */
  arrivals: GardenArrival[];
}

/** One outing plus its movement readings plus its Garden arrival readings. */
export interface GardenOutingArrivals {
  /** The outing-plus-teachers-plus-movement bundle, exactly as slice 44 reports it. */
  outingMovement: GardenOutingMovement;
  /** One arrivals reading per caller-named arrival entry, in caller order. */
  arrivals: ArrivalReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isGardenHomes(
  value: unknown,
): value is ReadonlySet<string> | readonly string[] {
  if (value instanceof Set) {
    for (const home of value) {
      if (!isNonEmptyString(home)) return false;
    }
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((home) => isNonEmptyString(home));
  }
  return false;
}

/**
 * One outing plus its movement readings plus its Garden arrival
 * readings: outing-movement bundle + per-entry arrivals
 * readings, each exactly as its own read reports it, side by
 * side, with no merged composition and no reconciliation
 * between their pictures.
 */
export function gardenOutingArrivals(
  inputs: GardenOutingArrivalsInputs,
): GardenOutingArrivals {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-arrivals: inputs must be an object");
  }
  if (
    inputs.outingMovement === null ||
    typeof inputs.outingMovement !== "object"
  ) {
    throw new Error(
      "garden-outing-arrivals: outingMovement inputs must be an object",
    );
  }
  if (inputs.arrivals === null || typeof inputs.arrivals !== "object") {
    throw new Error(
      "garden-outing-arrivals: arrivals inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.arrivals.entries)) {
    throw new Error(
      "garden-outing-arrivals: arrivals entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.arrivals.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-arrivals: arrival entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-arrivals: arrival entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-arrivals: duplicate arrival entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.log)) {
      throw new Error(
        "garden-outing-arrivals: arrival entry log must be an array",
      );
    }
    for (const record of entry.log) {
      validateMovement(record);
    }
    if (!isGardenHomes(entry.gardenHomes)) {
      throw new Error(
        "garden-outing-arrivals: arrival entry gardenHomes must be a Set or an array of non-empty strings",
      );
    }
  }
  const outingMovement = gardenOutingMovement(inputs.outingMovement);
  const arrivalReadings = inputs.arrivals.entries.map((entry) => ({
    id: entry.id,
    arrivals: arrivals(entry.log, entry.gardenHomes).map((record) => ({
      ...record,
    })),
  }));
  return { outingMovement, arrivals: arrivalReadings };
}
