/**
 * B3 §2.8 one doorway — creature movement records, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.8: every creature
 * movement — gift, trade, transfer between keeps, release to the wild,
 * Garden arrival/departure — passes through ONE in-world doorway with ONE
 * verb set and ONE record shape. B3's residency derivation (§2.3) reads
 * that doorway's records; there is no second, quieter path.
 *
 * This module is the record shape and its pure reads only. It is NOT a
 * host: nothing moves a creature in live play by importing this file yet
 * (see the staging locks in garden-movement.test.ts), and no store,
 * view, or save record is changed here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO ending rule (Owner Slot 4, how a kept life ends, stays open;
 *   no record here ends a life, and no ending verb exists in the set).
 * - NO door geography (Owner Slot 5: which areas hold Garden access —
 *   garden homes are a caller-supplied set, never authored here).
 * - NO residency naming (Owner Slot 6: named recurring presence vs
 *   anonymous resident — ids are caller-supplied opaque strings, and
 *   this module never renders a name).
 * - NO endpoint policy: `from`/`to` are caller-supplied opaque ids (a
 *   keeper, a keep, a zone, the wild as the caller encodes it). The
 *   doorway guarantees shape, one verb set, and append-only history;
 *   which endpoints a verb may carry is a later host decision, not
 *   invented here. A release's `to` is whatever the caller recorded.
 * - NO mutation of history: appending never edits, deletes, or rewrites
 *   an existing record; a correction is a new record, appended after.
 * - NO species/zone/recipe vocabulary authored: every id is opaque.
 *
 * Purity: every function is pure — inputs are never mutated, outputs are
 * fresh values. Loud failures (throw) on malformed records, duplicate
 * ids, and unknown verbs; silent defaults are never invented.
 */

/** The one verb set (BRIDGE-SPEC §2.8, in the spec's own order). */
export type MovementVerb =
  | "gift"
  | "trade"
  | "transfer"
  | "release"
  | "garden-arrival"
  | "garden-departure";

export const MOVEMENT_VERBS: readonly MovementVerb[] = [
  "gift",
  "trade",
  "transfer",
  "release",
  "garden-arrival",
  "garden-departure",
] as const;

/**
 * One doorway record: which creature moved, by which verb, from where
 * to where, and when (caller-supplied ordering stamp — the world clock's
 * minutes, a sequence number, or any finite monotonic stamp the host
 * already uses; this module never reads a clock).
 */
export interface MovementRecord {
  /** Unique within the log; duplicates fail loudly on append. */
  id: string;
  /** The moving creature's id (opaque). */
  creatureId: string;
  verb: MovementVerb;
  /** Origin keeper/keep/place id, or null when the caller records none. */
  from: string | null;
  /** Destination keeper/keep/place id, or null when the caller records none. */
  to: string | null;
  /** Caller-supplied ordering stamp; must be finite. */
  at: number;
}

export type MovementLog = readonly MovementRecord[];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isIdOrNull(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

/** Loud validation for one record. Throws on the first defect found. */
export function validateMovement(record: unknown): asserts record is MovementRecord {
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    throw new Error("movement record must be an object");
  }
  const r = record as Record<string, unknown>;
  if (!isNonEmptyString(r.id)) {
    throw new Error("movement record id must be a non-empty string");
  }
  if (!isNonEmptyString(r.creatureId)) {
    throw new Error("movement record creatureId must be a non-empty string");
  }
  if (
    typeof r.verb !== "string" ||
    !(MOVEMENT_VERBS as readonly string[]).includes(r.verb)
  ) {
    throw new Error(`unknown movement verb: ${String(r.verb)}`);
  }
  if (!isIdOrNull(r.from)) {
    throw new Error("movement record from must be a non-empty string or null");
  }
  if (!isIdOrNull(r.to)) {
    throw new Error("movement record to must be a non-empty string or null");
  }
  if (typeof r.at !== "number" || !Number.isFinite(r.at)) {
    throw new Error("movement record at must be a finite number");
  }
}

/**
 * Append one record to the log. Returns a NEW log; the input log and its
 * records are never mutated. A duplicate id or a malformed record fails
 * loudly and appends nothing.
 */
export function appendMovement(
  log: MovementLog,
  record: MovementRecord,
): MovementRecord[] {
  validateMovement(record);
  if (log.some((entry) => entry.id === record.id)) {
    throw new Error(`duplicate movement record id: ${record.id}`);
  }
  return [...log, record];
}

/**
 * Every movement of one creature, in `at` order, stable for equal stamps
 * (insertion order breaks ties). Returns fresh records in a fresh array;
 * the log itself is never reordered.
 */
export function movementsForCreature(
  log: MovementLog,
  creatureId: string,
): MovementRecord[] {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("creatureId must be a non-empty string");
  }
  return log
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.creatureId === creatureId)
    .sort((a, b) => a.entry.at - b.entry.at || a.index - b.index)
    .map(({ entry }) => entry);
}

/** The creature's most recent movement, or null when it never moved. */
export function lastMovementForCreature(
  log: MovementLog,
  creatureId: string,
): MovementRecord | null {
  const movements = movementsForCreature(log, creatureId);
  return movements.length === 0 ? null : movements[movements.length - 1];
}

/**
 * Where the creature is now, per the doorway's own history: the `to` of
 * its most recent movement, or null when it never moved or its last
 * movement recorded no destination. This is a read over records, not a
 * live position — a host that moves creatures outside the log would be
 * the second, quieter path §2.8 forbids.
 */
export function currentHome(
  log: MovementLog,
  creatureId: string,
): string | null {
  const last = lastMovementForCreature(log, creatureId);
  return last === null ? null : last.to;
}

/**
 * The §2.3 residency derivation in its smallest honest form: a creature
 * counts as a Garden resident exactly when its most recent movement's
 * destination is one of the caller-supplied Garden homes. Garden homes
 * are never authored here (Owner Slot 5); the caller supplies the set
 * (as a Set or an array). No movement, a null destination, or a later
 * departure all read false — residency is the last record, not a flag.
 */
export function isGardenResident(
  log: MovementLog,
  creatureId: string,
  gardenHomes: ReadonlySet<string> | readonly string[],
): boolean {
  const home = currentHome(log, creatureId);
  if (home === null) return false;
  if (gardenHomes instanceof Set) return gardenHomes.has(home);
  return (gardenHomes as readonly string[]).includes(home);
}
