/**
 * B3 §2.2 — Garden arrivals, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.2: rescued
 * and found individuals are Garden arrivals — an individual the
 * journey found is a Garden resident with a record, not an
 * inventory event. Arrivals are what a trip is for, in part, and
 * this module is that arrival read's shape and pure reads only:
 * given the §2.8 doorway log (garden-movement), it reports which
 * creatures arrived at the Garden, when, and how often, and
 * whether each is still a resident per the doorway's own last
 * record.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - An arrival is a doorway record whose verb is `garden-arrival`.
 *   No other verb counts as an arrival, and no second arrival
 *   verb is invented here: a gift, trade, or transfer that ends
 *   at a Garden home makes a creature a resident per the
 *   residency rule below, but it is not an arrival record.
 * - One entry per creature that has at least one garden-arrival
 *   record. A creature with no garden-arrival record does not
 *   appear, even if it is currently a resident by another verb.
 * - Arrival order is first-arrival order: the earliest
 *   garden-arrival stamp, with the arrival record's log position
 *   breaking ties. Within a creature, firstArrivedAt is its
 *   earliest garden-arrival stamp and lastArrivedAt its latest,
 *   each by stamp with log position breaking ties — so a log
 *   that lists a later arrival before an earlier one still
 *   reads the earlier stamp as first.
 * - arrivalCount counts garden-arrival records only. Other
 *   movements never change the count, though a later movement
 *   of any verb can change residency.
 * - currentlyResident is exactly the §2.8 residency rule from
 *   garden-movement: the creature's most recent movement of any
 *   verb (stamp order, log order breaking ties) ends at one of
 *   the caller-supplied Garden homes. An arrival followed by a
 *   departure to elsewhere reads false; an arrival followed by
 *   a transfer to another Garden home reads true. Garden homes
 *   are never authored here (Owner Slot 5); the caller supplies
 *   the set, as a Set or an array.
 * - lastArrivalTo is the destination of the creature's latest
 *   garden-arrival record, or null when that record recorded no
 *   destination. It is arrival history, not current position:
 *   a later departure does not rewrite it.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO host, NO store/view/save change, NO numeric effect in
 *   live play, NO encounter/spawn/route behaviour (whether an
 *   arrival is found, rescued, or sheltered is the journey
 *   host's record, not this read's decision).
 * - NO residency naming (Owner Slot 6 — ids stay opaque, no
 *   recurring-presence name is assigned).
 * - NO Garden geography authored (Garden homes are
 *   caller-supplied, Owner Slot 5).
 * - NO range filter: the doorway log carries creature ids only,
 *   no species, so this read cannot and does not decide range
 *   provenance (#102) — that is a caller-side filter, as in
 *   the edge-discovery read.
 * - NO ending rule (Owner Slot 4): no record here ends a life,
 *   and a departure is a movement, not an ending.
 * - NO species/place vocabulary authored: every id is opaque.
 *
 * Purity: the log is never mutated or reordered; outputs are
 * fresh objects and fresh arrays. Loud failures (throw) on
 * malformed logs, duplicate movement record ids, and malformed
 * caller sets; silent defaults are never invented.
 */

import {
  isGardenResident,
  validateMovement,
  type MovementLog,
} from "./garden-movement";

/** One creature's Garden arrival record, as read from the log. */
export interface GardenArrival {
  /** The arrived creature's id (opaque). */
  creatureId: string;
  /** Stamp of its earliest garden-arrival record. */
  firstArrivedAt: number;
  /** Stamp of its latest garden-arrival record. */
  lastArrivedAt: number;
  /** How many garden-arrival records the log holds for it. */
  arrivalCount: number;
  /** Id of its latest garden-arrival record. */
  lastArrivalRecordId: string;
  /** Destination of its latest garden-arrival record, or null. */
  lastArrivalTo: string | null;
  /** Whether its most recent movement ends at a Garden home. */
  currentlyResident: boolean;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function toGardenHomes(
  value: ReadonlySet<string> | readonly string[],
): Set<string> {
  const list = value instanceof Set ? [...value] : value;
  if (!Array.isArray(list)) {
    throw new Error("garden-arrivals: gardenHomes must be a set or an array");
  }
  for (const entry of list) {
    if (!isNonEmptyString(entry)) {
      throw new Error(
        "garden-arrivals: gardenHomes entries must be non-empty strings",
      );
    }
  }
  return new Set(list);
}

function validatedLog(log: MovementLog): MovementLog {
  if (!Array.isArray(log)) {
    throw new Error("garden-arrivals: log must be an array");
  }
  const seen = new Set<string>();
  for (const record of log) {
    validateMovement(record);
    if (seen.has(record.id)) {
      throw new Error(
        `garden-arrivals: duplicate movement record id: ${record.id}`,
      );
    }
    seen.add(record.id);
  }
  return log;
}

/**
 * Every creature that arrived at the Garden, in first-arrival
 * order (earliest garden-arrival stamp, log position breaking
 * ties). One entry per arrived creature.
 */
export function arrivals(
  log: MovementLog,
  gardenHomes: ReadonlySet<string> | readonly string[],
): GardenArrival[] {
  const checked = validatedLog(log);
  const homes = toGardenHomes(gardenHomes);
  type ArrivalGroup = {
    creatureId: string;
    firstAt: number;
    firstIndex: number;
    lastAt: number;
    lastIndex: number;
    count: number;
    lastRecordId: string;
    lastTo: string | null;
  };
  const groups = new Map<string, ArrivalGroup>();
  checked.forEach((record, index) => {
    if (record.verb !== "garden-arrival") return;
    const group = groups.get(record.creatureId);
    if (group === undefined) {
      groups.set(record.creatureId, {
        creatureId: record.creatureId,
        firstAt: record.at,
        firstIndex: index,
        lastAt: record.at,
        lastIndex: index,
        count: 1,
        lastRecordId: record.id,
        lastTo: record.to,
      });
      return;
    }
    group.count += 1;
    if (
      record.at < group.firstAt ||
      (record.at === group.firstAt && index < group.firstIndex)
    ) {
      group.firstAt = record.at;
      group.firstIndex = index;
    }
    if (
      record.at > group.lastAt ||
      (record.at === group.lastAt && index > group.lastIndex)
    ) {
      group.lastAt = record.at;
      group.lastIndex = index;
      group.lastRecordId = record.id;
      group.lastTo = record.to;
    }
  });
  const ordered = [...groups.values()].sort(
    (a, b) => a.firstAt - b.firstAt || a.firstIndex - b.firstIndex,
  );
  return ordered.map((group) => ({
    creatureId: group.creatureId,
    firstArrivedAt: group.firstAt,
    lastArrivedAt: group.lastAt,
    arrivalCount: group.count,
    lastArrivalRecordId: group.lastRecordId,
    lastArrivalTo: group.lastTo,
    currentlyResident: isGardenResident(checked, group.creatureId, homes),
  }));
}

/**
 * One creature's Garden arrival entry, or null when the log holds
 * no garden-arrival record for it. A creature that is a resident
 * by another verb but never arrived reads null here.
 */
export function arrivalForCreature(
  log: MovementLog,
  creatureId: string,
  gardenHomes: ReadonlySet<string> | readonly string[],
): GardenArrival | null {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("garden-arrivals: creatureId must be a non-empty string");
  }
  const all = arrivals(log, gardenHomes);
  return all.find((entry) => entry.creatureId === creatureId) ?? null;
}
