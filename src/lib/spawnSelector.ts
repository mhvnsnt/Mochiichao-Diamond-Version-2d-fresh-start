// Encounter binding — gap-fill S5 (2026-10-30).
//
// The selector GAP-FILL-PLAN.md F-2 asks for: it reads (area x method x
// timeBand x weather) from the core spawn bundles, not from a second
// copy of the same tables. Before this module, the meadow and pond
// pools existed twice — once as seed rows in
// src/data/core/encounters.json and once as slots in the
// garden-complex spawn bundle — and src/lib/encounters.ts served the
// encounters.json copy. S5 retires the duplicate: the bundle is the
// single source for meadow-route-01 and pond-route-01, encounters.ts
// builds its tables from this selector, and encounters.json keeps
// only the cave-route-01 seed table, which has no bundle file yet
// (the maps lane's call, per S2; deliberately not re-homed into the
// Garden bundle). Cave is a method label here only: this module makes
// no claim about any cave's light, which is per cave / per floor in
// the map's own record, not a blanket rule.
//
// PROVENANCE (source-first): the selector shape is Pokemon's own —
// in every decomp generation the field engine consumes ONE authored
// encounter source per map (Gen 3: src/data/wild_encounters.json
// read by the field engine; Gen 2: data/wild/* read by the
// overworld). Adapted only at the language seam (C -> TypeScript)
// and at the vocabulary seam: bundles name species
// ("sproutle"), the engine keys numeric ids ("038"), so the
// resolution goes through src/data/core/species.json, the roster
// source, and fails LOUDLY at module load on any name it cannot
// resolve — never silently, never with an invented id.
//
// Live-map join deliberately NOT made here: the live route_1 pool
// (encounters.json worldAreas) and the meadow bundle pool differ
// (place.ts carries that mismatch on its join row: live stocks
// mochii, lacks pupbble/squirmite). Joining a live map to a bundle
// pool would silently change what spawns on Route 1. The selector
// is keyed by bundle areaId; the live-map join is a later step's
// explicit decision, with that mismatch resolved first.
//
// Filter semantics: a slot's timeOfDay / weather of null means "any"
// (canon has not split these tables by time or weather, and no split
// is invented). A requested band/weather of null likewise means any.
// A pool exists when its area + method exists, even if filtering
// empties its slots — callers that need a rollable pool use
// bundlePoolCanRoll, which requires at least one slot and numeric
// levels + weight on every slot (the dark-forest surface kittember
// row, with null numbers, and the empty depths table are therefore
// present-but-unrollable, honestly, not dropped and not filled).

import gardenComplexBundle from "../data/core/encounters/garden-complex.spawn-tables.json";
import darkForestBundle from "../data/core/encounters/dark-forest.spawn-tables.json";
import speciesData from "../data/core/species.json";
import type { EncounterMethod } from "./encounters";

export interface BundleSlot {
  /** Species name as authored in the bundle ("sproutle"). */
  speciesName: string;
  /** Numeric roster id resolved via species.json ("038"). */
  speciesId: string;
  minLevel: number | null;
  maxLevel: number | null;
  weight: number | null;
  habitatClass: string | null;
  timeOfDay: string | null;
  weather: string | null;
}

export interface BundlePool {
  areaId: string;
  bundle: string;
  /** Null for garden areas; "surface" | "depths" for the dark forest. */
  depthTier: string | null;
  method: EncounterMethod;
  slots: BundleSlot[];
}

/** A pool can drive a roll only when every slot carries numbers. */
export function bundlePoolCanRoll(pool: BundlePool): boolean {
  return (
    pool.slots.length > 0 &&
    pool.slots.every(
      (s) => s.minLevel !== null && s.maxLevel !== null && s.weight !== null,
    )
  );
}

const speciesIdByName: Record<string, string> = {};
for (const entry of (speciesData as any).species as { id: string; name: string }[]) {
  speciesIdByName[String(entry.name).toLowerCase()] = String(entry.id);
}

function asPool(bundleName: string, area: any, table: any): BundlePool {
  return {
    areaId: String(area.areaId),
    bundle: bundleName,
    depthTier: area.depthTier ?? null,
    method: String(table.method) as EncounterMethod,
    slots: (Array.isArray(table.slots) ? table.slots : []).map((s: any) => {
      const name = String(s.speciesId);
      const resolved = speciesIdByName[name.toLowerCase()];
      if (resolved === undefined) {
        throw new Error(
          `spawnSelector: bundle species "${name}" has no id in species.json — refusing to invent one`,
        );
      }
      return {
        speciesName: name,
        speciesId: resolved,
        minLevel: s.minLevel ?? null,
        maxLevel: s.maxLevel ?? null,
        weight: s.weight ?? null,
        habitatClass: s.habitatClass ?? null,
        timeOfDay: s.timeOfDay ?? null,
        weather: s.weather ?? null,
      };
    }),
  };
}

function asBundlePools(bundleName: string, bundle: any): BundlePool[] {
  const pools: BundlePool[] = [];
  for (const area of (bundle as any).areas ?? []) {
    for (const table of area.tables ?? []) {
      pools.push(asPool(bundleName, area, table));
    }
  }
  return pools;
}

/** Every authored bundle pool, unfiltered, in bundle order. */
export const BUNDLE_POOLS: BundlePool[] = [
  ...asBundlePools("garden-complex", gardenComplexBundle),
  ...asBundlePools("dark-forest", darkForestBundle),
];

export interface BundlePoolQuery {
  timeOfDay?: string | null;
  weather?: string | null;
  /**
   * Required when area + method matches more than one pool (the dark
   * forest surface/depths pair); without it an ambiguous query
   * returns null rather than silently picking one.
   */
  depthTier?: string | null;
}

function slotMatches(slot: BundleSlot, query: BundlePoolQuery): boolean {
  const timeOk =
    query.timeOfDay == null || slot.timeOfDay == null || slot.timeOfDay === query.timeOfDay;
  const weatherOk =
    query.weather == null || slot.weather == null || slot.weather === query.weather;
  return timeOk && weatherOk;
}

/**
 * The S5 selector: (area x method x timeBand x weather) -> pool.
 * Returns null when no pool exists for the area + method, or when
 * the query is ambiguous (see depthTier above). Filtering never
 * invents slots; it only removes slots whose authored band/weather
 * excludes the query.
 */
export function bundlePoolFor(
  areaId: string,
  method: EncounterMethod,
  query: BundlePoolQuery = {},
): BundlePool | null {
  let matches = BUNDLE_POOLS.filter((p) => p.areaId === areaId && p.method === method);
  if (query.depthTier != null) {
    matches = matches.filter((p) => p.depthTier === query.depthTier);
  }
  if (matches.length === 0) return null;
  if (matches.length > 1) return null;
  const pool = matches[0];
  return { ...pool, slots: pool.slots.filter((s) => slotMatches(s, query)) };
}
