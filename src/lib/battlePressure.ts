// Battle-pressure ecology — gap-fill S13 slice 2 (2026-10-31).
//
// GAP-FILL-PLAN.md S13 (G-4, B2) + Buu's Fury TRANSFER-MAP B2: a place
// responds to how hard it is fought. Battles fought and keeps made in
// an area within the current window add pressure; pressure applies a
// NEGATIVE overlay at roll time — the pressured species' roll weight
// decays, and the other species' relative share rises because the
// total falls. Swarm (positive) and pressure (negative) are the two
// hands of one living layer, both transforms over untouched tables.
//
// This module is the transform itself, as pure code, on the
// S10/S11/S12/S13-slice-1 library-first pattern: it sits at the roll
// site on EncounterTable (the shape pickFromTable / rollEncounterStep
// in encounters.ts already roll from), AFTER tableFor / bundle
// conversion and BEFORE the pick, so the authored tables are never
// rewritten. It is deliberately NOT the season overlay fused with a
// sign flip (slice 1's header says the two must not be fused):
// pressure is derived over battle facts, not a seasonal weight table,
// and it carries invariants the season overlay does not.
//
// Transform semantics, stated once so no landing drifts:
// - A BattlePressure is one area's per-species pressure LEVELS, keyed
//   by roster id exactly as EncounterTable carries it ("038") — no
//   name resolution happens here, so no id can be invented. The
//   level is caller-supplied: how battle counts become a level, what
//   rate applies, and how pressure decays on phase ticks are the
//   tally slice's job, not this transform's — rates and the pressure
//   floor are balancing data, OPEN per GAP-FILL-PLAN (owner slot),
//   and nothing here invents them.
// - Decay shape, this module's definition: newWeight =
//   oldWeight / (1 + pressure). Pressure 0 is identity; any positive
//   pressure strictly lowers the weight; the result is never zero
//   from pressure alone (decay-to-rare, per TRANSFER-MAP B2's
//   recommendation): a positive input weight stays positive, and a
//   pressure so large the result underflows to zero throws loudly
//   naming the species instead of silently removing the slot.
// - A species absent from the pressures keeps its weight (x1 in
//   effect). A pressure entry for a species absent from this table
//   is inert for this table (one area's pressure may span tables;
//   absence from one table is not an error).
// - Pressure is negative-only: there is no positive pressure. A
//   negative or non-finite level throws loudly naming the species,
//   never silently ignored or clamped — a bad pressure record is
//   data corruption, not a rounding choice.
// - Pressure applies per area: a pressure record for a different
//   areaId than the table's throws loudly naming both areas. The
//   compose helper looks pressure up by the table's own areaId, so
//   a host using it cannot hit that error by accident.
// - Dark Forest exclusion, by construction (TRANSFER-MAP B2): pressure
//   does not apply there. A pressure applied to a table whose areaId
//   is "dark-forest" — the bundle area id, verified in
//   dark-forest.spawn-tables.json — throws loudly naming the area,
//   for surface and depths alike (the depths table is empty by canon
//   and stays empty; this transform fills nothing).
//
// Deliberately NOT here: NO pressure tally (no stored battle counts,
// no window, no decay-on-tick — that is the next slice); NO host
// call site in encounters.ts or WorldEngine (the roll site keeps
// rolling the untransformed tables until a host adopts this with a
// tally); NO level-band change (pressure touches weights only);
// NO swarm/positive overlay (the other hand of the layer, separate);
// NO pressure data for any area or species.

import type { EncounterTable } from "./encounters";

/** The bundle area id pressure never applies to (B2 exclusion). */
export const DARK_FOREST_AREA_ID = "dark-forest";

/** One area's roll-time pressure transform, caller-supplied data. */
export interface BattlePressure {
  areaId: string;
  /** Roster id -> pressure level. Absent = 0 (no effect). */
  pressures: Readonly<Record<string, number>>;
}

/** The pressure record for an area, or null when none is supplied. */
export function pressureForArea(
  pressures: readonly BattlePressure[],
  areaId: string,
): BattlePressure | null {
  return pressures.find((p) => p.areaId === areaId) ?? null;
}

/**
 * Apply one area's battle pressure to a table at roll time. Returns
 * a new table; the input table and its slots are never mutated.
 */
export function applyBattlePressure(
  table: EncounterTable,
  pressure: BattlePressure | null,
): EncounterTable {
  if (pressure === null) {
    return { ...table, slots: table.slots.map((s) => ({ ...s })) };
  }
  if (pressure.areaId !== table.areaId) {
    throw new Error(
      `battlePressure: pressure for area "${pressure.areaId}" cannot apply to table for area "${table.areaId}" — refusing to transform`,
    );
  }
  if (table.areaId === DARK_FOREST_AREA_ID) {
    throw new Error(
      `battlePressure: pressure does not apply to "${DARK_FOREST_AREA_ID}" — refusing to transform`,
    );
  }
  const slots: EncounterTable["slots"] = [];
  for (const slot of table.slots) {
    const level = pressure.pressures[slot.speciesId];
    if (level === undefined) {
      slots.push({ ...slot });
      continue;
    }
    if (!Number.isFinite(level) || level < 0) {
      throw new Error(
        `battlePressure: pressure for species "${slot.speciesId}" must be a finite number >= 0, got ${String(level)}`,
      );
    }
    if (level === 0) {
      slots.push({ ...slot });
      continue;
    }
    const weight = slot.weight / (1 + level);
    if (slot.weight > 0 && !(weight > 0)) {
      throw new Error(
        `battlePressure: pressure for species "${slot.speciesId}" decayed its weight to zero — refusing to remove a slot by pressure alone`,
      );
    }
    slots.push({ ...slot, weight });
  }
  return { ...table, slots };
}

/** Compose the area lookup with the transform in one roll-site call. */
export function applyBattlePressureFor(
  table: EncounterTable,
  pressures: readonly BattlePressure[],
): EncounterTable {
  return applyBattlePressure(table, pressureForArea(pressures, table.areaId));
}

/** A transformed table can drive a roll only with a live slot. */
export function battlePressureTableCanRoll(table: EncounterTable): boolean {
  return (
    table.slots.length > 0 &&
    table.slots.every((s) => Number.isFinite(s.weight) && s.weight > 0)
  );
}
