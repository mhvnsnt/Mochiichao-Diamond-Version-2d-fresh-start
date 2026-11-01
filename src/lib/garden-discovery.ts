/**
 * B3 §2.3 discovery output — Garden-edge re-meeting, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.3: released
 * and rescue-released individuals are met again on routes — the
 * outward flow that makes "the world remembers" real — and
 * Garden-edge residency derives from the release/rescue record
 * itself. This module is that output's read half only: given the
 * §2.8 doorway log (garden-movement), it returns the creatures
 * currently discoverable at the Garden edge, i.e. the creatures
 * whose most recent doorway movement is a release to a
 * caller-supplied Garden-edge place.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - A creature qualifies exactly when its LAST movement (in stamp
 *   order, stable ties, per garden-movement) is a `release` whose
 *   destination is one of the caller-supplied edge places. A later
 *   movement of any verb — a garden-arrival, a gift, a trade, a
 *   transfer, another release elsewhere — ends the candidacy,
 *   because the creature is no longer at the edge per the record.
 *   A creature with no movement, or whose last movement has no
 *   destination, never qualifies.
 * - One entry per creature: the release record itself (its id,
 *   its stamp, its edge destination). A creature released twice
 *   to the edge with nothing between still yields one entry —
 *   the later release — never a duplicate.
 * - Order is release-stamp order, stable for equal stamps
 *   (log insertion order breaks ties), so a host presenting the
 *   list sees the oldest re-meetable first.
 * - Range provenance (#102: only species whose range reaches the
 *   Garden can visit it) is caller-resolved, not authored here:
 *   the caller may pass an eligible-creature set; creatures
 *   outside it are excluded. The doorway log carries creature
 *   ids only, no species, so this module cannot and does not
 *   decide range itself — without a set, no range filter applies
 *   and the edge rule alone qualifies.
 * - Rescue-released individuals are releases: the doorway's verb
 *   set has one release verb, and no second verb is invented
 *   here for rescue. A host that records rescue-releases records
 *   them as releases, and they qualify on the same rule.
 *
 * Deliberately NOT here: NO host (garden-wiring.ts, GardenView,
 * wiring/phase4-garden.ts, garden-register.ts do not import this
 * module — staging locks in the test); NO encounter, spawn, or
 * route behaviour (whether a candidate is actually met on a
 * route, and where, is the journey host's decision — this read
 * only says who is at the edge per the record); NO residency
 * naming (Owner Slot 6 — ids stay opaque, no recurring-presence
 * name is assigned); NO Garden geography authored (edge places
 * are caller-supplied, Owner Slot 5); NO research or honour
 * effect (the §2.3 research and honour outputs are separate
 * reads, later); NO names, NO reward; NO effect in live play.
 *
 * Purity: the log is never mutated or reordered; outputs are
 * fresh values. Loud failures (throw) on malformed records and
 * malformed caller sets; silent defaults are never invented.
 */

import {
  lastMovementForCreature,
  validateMovement,
  type MovementLog,
} from "./garden-movement";

/** One edge-discovery candidate: a creature met again at the edge. */
export interface GardenEdgeDiscovery {
  /** The creature's id (opaque). */
  creatureId: string;
  /** The release record's id. */
  releaseRecordId: string;
  /** The release record's ordering stamp. */
  releasedAt: number;
  /** The edge place the creature was released to. */
  releasedTo: string;
}

export interface GardenEdgeDiscoveryOptions {
  /** Caller-supplied Garden-edge places (Owner Slot 5). Required. */
  gardenEdge: ReadonlySet<string> | readonly string[];
  /**
   * Optional caller-resolved range-eligible creature ids (#102):
   * only creatures in this set qualify. Omitted means no range
   * filter — the edge rule alone qualifies.
   */
  eligibleCreatures?: ReadonlySet<string> | readonly string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function toSet(
  value: ReadonlySet<string> | readonly string[],
  field: string,
): Set<string> {
  const list = value instanceof Set ? [...value] : value;
  if (!Array.isArray(list)) {
    throw new Error(`garden-discovery: ${field} must be a set or an array`);
  }
  for (const entry of list) {
    if (!isNonEmptyString(entry)) {
      throw new Error(
        `garden-discovery: ${field} entries must be non-empty strings`,
      );
    }
  }
  return new Set(list);
}

/**
 * Whether one creature is currently discoverable at the Garden edge:
 * its last doorway movement is a release to an edge place (and, when
 * an eligible set is supplied, it is in that set).
 */
export function isEdgeDiscoverable(
  log: MovementLog,
  creatureId: string,
  options: GardenEdgeDiscoveryOptions,
): boolean {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("garden-discovery: creatureId must be a non-empty string");
  }
  if (typeof options !== "object" || options === null) {
    throw new Error("garden-discovery: options must be an object");
  }
  const edge = toSet(options.gardenEdge, "gardenEdge");
  const last = lastMovementForCreature(validatedLog(log), creatureId);
  if (last === null || last.verb !== "release" || last.to === null) {
    return false;
  }
  if (!edge.has(last.to)) return false;
  if (options.eligibleCreatures !== undefined) {
    return toSet(options.eligibleCreatures, "eligibleCreatures").has(creatureId);
  }
  return true;
}

function validatedLog(log: MovementLog): MovementLog {
  if (!Array.isArray(log)) {
    throw new Error("garden-discovery: log must be an array");
  }
  for (const record of log) validateMovement(record);
  return log;
}

/**
 * Every creature currently discoverable at the Garden edge, in
 * release-stamp order (stable ties). One entry per creature.
 */
export function edgeDiscoveries(
  log: MovementLog,
  options: GardenEdgeDiscoveryOptions,
): GardenEdgeDiscovery[] {
  const checked = validatedLog(log);
  if (typeof options !== "object" || options === null) {
    throw new Error("garden-discovery: options must be an object");
  }
  const edge = toSet(options.gardenEdge, "gardenEdge");
  const eligible =
    options.eligibleCreatures === undefined
      ? null
      : toSet(options.eligibleCreatures, "eligibleCreatures");
  const creatureIds: string[] = [];
  const seen = new Set<string>();
  for (const record of checked) {
    if (!seen.has(record.creatureId)) {
      seen.add(record.creatureId);
      creatureIds.push(record.creatureId);
    }
  }
  const withIndex: { item: GardenEdgeDiscovery; logIndex: number }[] = [];
  for (const creatureId of creatureIds) {
    const last = lastMovementForCreature(checked, creatureId);
    if (last === null || last.verb !== "release" || last.to === null) continue;
    if (!edge.has(last.to)) continue;
    if (eligible !== null && !eligible.has(creatureId)) continue;
    withIndex.push({
      item: {
        creatureId,
        releaseRecordId: last.id,
        releasedAt: last.at,
        releasedTo: last.to,
      },
      // The release record's own position in the log — the tie
      // breaker for equal stamps, not first appearance.
      logIndex: checked.indexOf(last),
    });
  }
  withIndex.sort(
    (a, b) =>
      a.item.releasedAt - b.item.releasedAt || a.logIndex - b.logIndex,
  );
  return withIndex.map(({ item }) => item);
}
