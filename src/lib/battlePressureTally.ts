// Battle-pressure tally — gap-fill S13 slice 3 (2026-10-31).
//
// GAP-FILL-PLAN.md S13 (G-4, B2): slice 2's transform takes a
// caller-supplied pressure LEVEL per species, and its header names
// this slice's job: how battle counts become a level, and how
// pressure decays on phase ticks. This module is that tally, as pure
// code, on the S10/S11/S12/S13 library-first pattern. It does NOT
// store anything and it does NOT author any pressure data: every
// rate, threshold, and decay amount is caller-supplied, because
// rates and the pressure floor are balancing data, OPEN per
// GAP-FILL-PLAN (owner slot), and nothing here invents them.
//
// Tally semantics, stated once so no landing drifts:
// - A pressure event is one battle fought or keep made in an area
//   for one species, stamped with the world day it happened on.
//   Battles and keeps count alike here, per TRANSFER-MAP B2 ("battles
//   fought and keeps made in an area within the current window add
//   pressure") — the distinction between them is a later writer's
//   job, not a tally rule invented here.
// - The window is caller-supplied and inclusive at both ends: an
//   event counts exactly when startDay <= dayIndex <= endDay.
//   No window length is authored here.
// - Counts become levels only through caller-supplied bands: a
//   band { minEvents, level } says "at least this many events in
//   the window means this level". A species takes the highest band
//   its count reaches; a count below every band means level 0,
//   which is absent from the record (absent = 0, per slice 2), so
//   such a species produces no pressure entry. A band for a
//   species with no counted events is inert for that tally.
// - Decay is linear in ticks at a caller-supplied per-tick amount:
//   level' = max(0, level - ticks * perTick). A species decayed to
//   zero leaves the record (absent = 0 again). Decay never goes
//   negative and never invents a floor above zero: the floor
//   question the plan leaves open is a weight floor in the
//   transform, not a level floor here — slice 2 already guarantees
//   a pressured weight stays positive (decay-to-rare).
// - Nothing here touches the Dark Forest: the tally counts events
//   wherever the caller reports them, and slice 2's transform
//   refuses a dark-forest table at roll time. The depths table
//   stays empty by canon and is not filled here.
// - This module imports only the BattlePressure TYPE from slice 2
//   so its output is the transform's input shape. It never calls
//   the transform: tally and transform stay separate functions,
//   and a host composes them in two calls (proven by test).
//
// Deliberately NOT here: NO stored battle counts (no store field,
// no writer — the events are caller-supplied facts, as the tally's
// input, not a record this module keeps); NO host call site in
// WorldEngine (the engine still calls the unoverlaid roll);
// S13 slice 4 (2026-10-31) adopts the TRANSFORM in encounters.ts via
// applyRollOverlays, but this tally still has no host feeding it
// events, and no bands are authored — the roll module takes the
// tally's output shape, not the tally itself; NO authored bands,
// window, or decay rate for
// any area or species; NO swarm/positive overlay; NO level-band
// change (tally touches pressure levels only, never slot levels).

import type { BattlePressure } from "./battlePressure";

/** One pressure event: a battle fought or keep made, by day. */
export interface PressureEvent {
  areaId: string;
  speciesId: string;
  /** World day index the event happened on (0-based, integer). */
  dayIndex: number;
}

/** Inclusive day window an event must fall in to count. */
export interface PressureWindow {
  startDay: number;
  endDay: number;
}

/** Counted events for one area/species, from the tally. */
export interface PressureCount {
  areaId: string;
  speciesId: string;
  events: number;
}

/** One caller-supplied counts-to-level band. */
export interface PressureBand {
  /** At least this many events in the window to reach this level. */
  minEvents: number;
  level: number;
}

function isIntegerAtLeastZero(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Count pressure events inside the window, grouped by area and
 * species. Returns a new array, sorted by area then species, so
 * the same events always tally the same way. The input is never
 * mutated.
 */
export function tallyPressureEvents(
  events: readonly PressureEvent[],
  window: PressureWindow,
): PressureCount[] {
  if (
    !isIntegerAtLeastZero(window.startDay) ||
    !isIntegerAtLeastZero(window.endDay)
  ) {
    throw new Error(
      `pressureTally: window days must be integers >= 0, got startDay ${String(window.startDay)} endDay ${String(window.endDay)}`,
    );
  }
  if (window.startDay > window.endDay) {
    throw new Error(
      `pressureTally: window startDay ${window.startDay} is after endDay ${window.endDay} — refusing to tally`,
    );
  }
  const counts = new Map<string, PressureCount>();
  for (const event of events) {
    if (!event.areaId || !event.speciesId) {
      throw new Error(
        `pressureTally: event for area "${event.areaId}" species "${event.speciesId}" has an empty id — refusing to tally`,
      );
    }
    if (!isIntegerAtLeastZero(event.dayIndex)) {
      throw new Error(
        `pressureTally: event for species "${event.speciesId}" has dayIndex ${String(event.dayIndex)}, which must be an integer >= 0`,
      );
    }
    if (event.dayIndex < window.startDay || event.dayIndex > window.endDay) {
      continue;
    }
    const key = `${event.areaId}\0${event.speciesId}`;
    const existing = counts.get(key);
    if (existing) {
      existing.events += 1;
    } else {
      counts.set(key, {
        areaId: event.areaId,
        speciesId: event.speciesId,
        events: 1,
      });
    }
  }
  return [...counts.values()].sort(
    (a, b) =>
      a.areaId.localeCompare(b.areaId) ||
      a.speciesId.localeCompare(b.speciesId),
  );
}

function validatedBands(bands: readonly PressureBand[]): PressureBand[] {
  const seen = new Set<number>();
  for (const band of bands) {
    if (!isIntegerAtLeastZero(band.minEvents)) {
      throw new Error(
        `pressureTally: band minEvents ${String(band.minEvents)} must be an integer >= 0`,
      );
    }
    if (!Number.isFinite(band.level) || band.level < 0) {
      throw new Error(
        `pressureTally: band level for minEvents ${band.minEvents} must be a finite number >= 0, got ${String(band.level)}`,
      );
    }
    if (seen.has(band.minEvents)) {
      throw new Error(
        `pressureTally: duplicate band minEvents ${band.minEvents} — refusing to band`,
      );
    }
    seen.add(band.minEvents);
  }
  return [...bands].sort((a, b) => a.minEvents - b.minEvents);
}

/**
 * Turn counted events into pressure records through the caller's
 * bands. One BattlePressure per area that has at least one species
 * at a level above zero; areas whose counts all fall below every
 * band produce no record. The inputs are never mutated.
 */
export function pressureLevelsFromCounts(
  counts: readonly PressureCount[],
  bands: readonly PressureBand[],
): BattlePressure[] {
  const ordered = validatedBands(bands);
  const byArea = new Map<string, Record<string, number>>();
  for (const count of counts) {
    if (!isIntegerAtLeastZero(count.events)) {
      throw new Error(
        `pressureTally: count for species "${count.speciesId}" has events ${String(count.events)}, which must be an integer >= 0`,
      );
    }
    let level = 0;
    for (const band of ordered) {
      if (count.events >= band.minEvents) {
        level = band.level;
      } else {
        break;
      }
    }
    if (level === 0) continue;
    let pressures = byArea.get(count.areaId);
    if (!pressures) {
      pressures = {};
      byArea.set(count.areaId, pressures);
    }
    pressures[count.speciesId] = level;
  }
  return [...byArea.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([areaId, pressures]) => ({ areaId, pressures }));
}

/**
 * Decay one area's pressure levels linearly over ticks:
 * level' = max(0, level - ticks * perTick). Species decayed to
 * zero leave the record. Returns a new record; the input is
 * never mutated.
 */
export function decayBattlePressure(
  pressure: BattlePressure,
  ticks: number,
  perTick: number,
): BattlePressure {
  if (!isIntegerAtLeastZero(ticks)) {
    throw new Error(
      `pressureTally: decay ticks ${String(ticks)} must be an integer >= 0`,
    );
  }
  if (!Number.isFinite(perTick) || perTick < 0) {
    throw new Error(
      `pressureTally: decay perTick ${String(perTick)} must be a finite number >= 0`,
    );
  }
  const pressures: Record<string, number> = {};
  for (const [speciesId, level] of Object.entries(pressure.pressures)) {
    if (!Number.isFinite(level) || level < 0) {
      throw new Error(
        `pressureTally: pressure for species "${speciesId}" must be a finite number >= 0, got ${String(level)}`,
      );
    }
    const decayed = level - ticks * perTick;
    if (decayed > 0) {
      pressures[speciesId] = decayed;
    }
  }
  return { areaId: pressure.areaId, pressures };
}

/** Decay every supplied area's pressure by the same tick count. */
export function decayBattlePressures(
  pressures: readonly BattlePressure[],
  ticks: number,
  perTick: number,
): BattlePressure[] {
  return pressures.map((p) => decayBattlePressure(p, ticks, perTick));
}
