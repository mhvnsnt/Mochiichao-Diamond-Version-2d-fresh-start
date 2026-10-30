// Encounter binding — stub-kill S-6 (2026-10-29), gap-fill S5 (2026-10-30).
//
// Before this module, the core encounter tables in
// src/data/core/encounters.json had NO reader anywhere in src, and
// live spawns ran off inline zone arrays inside
// src/world/FullWorldMaps.ts (WorldEngine read only zone[0], ignored
// the zone's own rate, and picked uniformly). Now the core tables are
// the single source: WorldEngine rolls through rollEncounterStep
// below, FullWorldMaps derives its per-map mirror from these tables
// at module load, and creature mode reads its roamer seeds from the
// sector0 "placed" table. No dual truth.
//
// S5: the meadow-route-01 and pond-route-01 tables no longer come
// from encounters.json at all — their duplicate seed rows were
// retired in the same step, and the tables are built here from
// src/lib/spawnSelector.ts over the garden-complex bundle (the
// bundle is the single source; the conversion below is mechanical:
// bundle name -> roster id, levels and weights verbatim, no rate,
// because the bundles author none). encounters.json keeps only the
// cave-route-01 seed table, which has no bundle file yet, plus the
// live worldAreas tables, which are a separate set (live map ids,
// not bundle area ids) and are untouched by S5.
//
// PROVENANCE (source-first): the roll shape is Pokémon's own —
// per-step rate roll: pret-pokeheartgold
// src/field/encounter_check.c FieldSystem_EncounterRateRoll; slot
// pick by cumulative weight: pret-pokeemerald src/wild_encounter.c
// ChooseWildMonIndex_Land (land slots carry explicit rarity weights
// there; ours carry the authored `weight` per slot, normalised at
// roll); level rolled uniformly inside the slot's min..max band, the
// same band shape both decomps store per slot. Adapted only at the
// language seam (C -> TypeScript, RNG injected for tests).
//
// Table filters: a table may carry timeOfDay / weather (null = any).
// The engine does not pass a weather value yet (no weather system
// reads into encounters in this tree), so weather-filtered tables —
// none are authored — would be skipped loudly by tableFor's callers
// rather than silently matched.

import encountersJson from "../data/core/encounters.json";
import { BUNDLE_POOLS, bundlePoolCanRoll } from "./spawnSelector";

export type EncounterMethod = "grass" | "surf" | "fish" | "cave" | "placed";

export interface EncounterSlot {
  speciesId: string;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

export interface EncounterTable {
  areaId: string;
  mapId: string;
  method: EncounterMethod;
  /** Per-step encounter probability; absent on bundle-only tables. */
  rate?: number;
  timeOfDay?: string | null;
  weather?: string | null;
  slots: EncounterSlot[];
}

interface RawTable {
  areaId?: string;
  mapId: string;
  method: string;
  rate?: number;
  timeOfDay?: string | null;
  weather?: string | null;
  slots: EncounterSlot[];
}

function normalise(raw: RawTable): EncounterTable {
  return {
    areaId: raw.areaId ?? `${raw.mapId}-${raw.method}`,
    mapId: raw.mapId,
    method: raw.method as EncounterMethod,
    rate: raw.rate,
    timeOfDay: raw.timeOfDay ?? null,
    weather: raw.weather ?? null,
    slots: raw.slots,
  };
}

const data = encountersJson as unknown as {
  encounters: RawTable[];
  worldAreas?: RawTable[];
};

/** S5: rollable bundle pools converted to encounter tables, verbatim. */
export const BUNDLE_ENCOUNTER_TABLES: EncounterTable[] = BUNDLE_POOLS.filter(
  bundlePoolCanRoll,
).map((pool) => ({
  areaId: pool.areaId,
  mapId: pool.areaId,
  method: pool.method,
  rate: undefined,
  timeOfDay: null,
  weather: null,
  slots: pool.slots.map((s) => ({
    speciesId: s.speciesId,
    minLevel: s.minLevel as number,
    maxLevel: s.maxLevel as number,
    weight: s.weight as number,
  })),
}));

export const ENCOUNTER_TABLES: EncounterTable[] = [
  ...BUNDLE_ENCOUNTER_TABLES,
  ...data.encounters.map(normalise),
  ...(data.worldAreas ?? []).map(normalise),
];

export function tableFor(
  mapId: string,
  method: EncounterMethod,
  opts: { timeOfDay?: string | null } = {},
): EncounterTable | null {
  return (
    ENCOUNTER_TABLES.find(
      (t) =>
        t.mapId === mapId &&
        t.method === method &&
        (t.timeOfDay == null || opts.timeOfDay == null || t.timeOfDay === opts.timeOfDay) &&
        t.weather == null,
    ) ?? null
  );
}

export interface EncounterPick {
  speciesId: string;
  level: number;
  slotIndex: number;
}

/** Weighted slot pick + level roll inside the slot band (pret shape). */
export function pickFromTable(table: EncounterTable, rng: () => number): EncounterPick {
  const total = table.slots.reduce((sum, s) => sum + s.weight, 0);
  let roll = rng() * total;
  let slotIndex = table.slots.length - 1;
  for (let i = 0; i < table.slots.length; i++) {
    roll -= table.slots[i].weight;
    if (roll < 0) {
      slotIndex = i;
      break;
    }
  }
  const slot = table.slots[slotIndex];
  const level = slot.minLevel + Math.floor(rng() * (slot.maxLevel - slot.minLevel + 1));
  return { speciesId: slot.speciesId, level, slotIndex };
}

/**
 * One step in encounter terrain: rate roll first (the zone's own
 * rate, finally read), then the slot pick. Returns null when the
 * step produces no encounter or the table has no authored rate.
 */
export function rollEncounterStep(
  table: EncounterTable,
  rng: () => number,
): EncounterPick | null {
  if (table.rate == null) return null;
  if (rng() >= table.rate) return null;
  return pickFromTable(table, rng);
}

/** Placed roamer seeds (creature mode): the table's slots, in order. */
export function placedSeeds(mapId: string): EncounterSlot[] {
  return tableFor(mapId, "placed")?.slots ?? [];
}
