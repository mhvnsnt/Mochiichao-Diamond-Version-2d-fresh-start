// Season overlays — gap-fill S13 slice 1 (2026-10-31).
//
// GAP-FILL-PLAN.md S13 (G-20, BW2 tail): season encounter overlays as
// roll-time transforms on the S5 selector. This module is the
// transform itself, as pure code, on the S10/S11/S12 library-first
// pattern: it sits at the roll site on EncounterTable (the shape
// pickFromTable / rollEncounterStep in encounters.ts already roll
// from), AFTER tableFor / bundle conversion and BEFORE the pick, so
// the authored tables are never rewritten.
//
// Tables stay byte-identical: the transform returns a NEW table with
// new slot objects and never mutates its input (proven by test). The
// Dark Forest depths table is untouched by construction — an empty
// table transforms to an empty table, and the depths fence (empty by
// canon) is not filled here.
//
// Deliberately NOT here: NO overlay data is authored (no seasonal
// weight for any species — seasonal species sets are ecology /
// data-lane content, not invented here); NO host call site in
// encounters.ts or WorldEngine (the roll site keeps rolling the
// untransformed tables until a host adopts this with authored
// overlays); NO level-band change (multipliers touch weights only);
// NO B2 battle-pressure transform (that is S13's second transform,
// on this same roll site, and lands separately — pressure is derived
// over battle facts, not a seasonal weight table, so the two must
// not be fused into one function).
//
// Overlay semantics, stated once so no landing drifts:
// - An overlay is one season's per-species weight multipliers, keyed
//   by roster id exactly as EncounterTable carries it ("038") — no
//   name resolution happens here, so no id can be invented.
// - A species absent from the multipliers keeps its weight (x1).
// - A multiplier entry for a species absent from this table is
//   inert for this table (one seasonal overlay may span areas;
//   absence from one table is not an error).
// - Multiplier 0 removes the slot for that season (seasonal absence),
//   preserving the order of the slots that remain.
// - A multiplier must be a finite number >= 0; anything else throws
//   loudly naming the species, never silently ignored or clamped —
//   a bad overlay is data corruption, not a rounding choice.

import type { EncounterTable } from "./encounters";
import type { Season } from "./worldClock";

const SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"];

/** One season's roll-time weight transform, caller-supplied data. */
export interface SeasonOverlay {
  season: Season;
  /** Roster id -> weight multiplier. Absent = 1; 0 = slot removed. */
  multipliers: Readonly<Record<string, number>>;
}

/** The overlay for a season, or null when none is supplied. */
export function overlayForSeason(
  overlays: readonly SeasonOverlay[],
  season: Season,
): SeasonOverlay | null {
  return overlays.find((o) => o.season === season) ?? null;
}

/**
 * Apply one season's overlay to a table at roll time. Returns a new
 * table; the input table and its slots are never mutated.
 */
export function applySeasonOverlay(
  table: EncounterTable,
  overlay: SeasonOverlay | null,
): EncounterTable {
  if (overlay === null) {
    return { ...table, slots: table.slots.map((s) => ({ ...s })) };
  }
  if (!SEASONS.includes(overlay.season)) {
    throw new Error(
      `seasonOverlay: unknown season "${String(overlay.season)}" — refusing to transform`,
    );
  }
  const slots: EncounterTable["slots"] = [];
  for (const slot of table.slots) {
    const multiplier = overlay.multipliers[slot.speciesId];
    if (multiplier === undefined) {
      slots.push({ ...slot });
      continue;
    }
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new Error(
        `seasonOverlay: multiplier for species "${slot.speciesId}" must be a finite number >= 0, got ${String(multiplier)}`,
      );
    }
    if (multiplier === 0) continue;
    slots.push({ ...slot, weight: slot.weight * multiplier });
  }
  return { ...table, slots };
}

/** Compose the season lookup with the transform in one roll-site call. */
export function applySeasonOverlayFor(
  table: EncounterTable,
  overlays: readonly SeasonOverlay[],
  season: Season,
): EncounterTable {
  return applySeasonOverlay(table, overlayForSeason(overlays, season));
}

/** A transformed table can drive a roll only with a live slot. */
export function seasonOverlayTableCanRoll(table: EncounterTable): boolean {
  return (
    table.slots.length > 0 &&
    table.slots.every((s) => Number.isFinite(s.weight) && s.weight > 0)
  );
}
