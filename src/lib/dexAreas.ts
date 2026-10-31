// Gap-fill S11 slice 5 — Dex area pages, habitat Landing 8 (pure, tested).
//
// The Dex AREA side/button used to say area data was not in the
// roster data yet — and that was true of the ROSTER. But the
// encounter layer already authors where creatures are found on
// LIVE maps, so this slice reads that authored data instead of
// inventing roster areas:
//
// SOURCE (the only one): src/data/core/encounters.json `worldAreas`
// — live-map rows (mapId + method + slots). Five areas at landing:
// route-1-grass, binary-woods-grass, cave-of-echoes-cave,
// scrap-junkyard-grass, sector0-placed.
//
// Deliberately NOT sources, stated so a later reader does not
// "complete" this by merging them in:
// - The seed `encounters` table (cave-route-01): encounters.json's
//   own header says its map definitions are owed by the maps/world
//   lane — cave-route-01 is not a walkable live map, so it is not
//   a place the Dex can send the player.
// - The spawn bundles (garden-complex, dark-forest) and their
//   S5 conversion (BUNDLE_ENCOUNTER_TABLES): bundle areaIds
//   (meadow-route-01, pond-route-01, dark-forest) are spawn-table
//   areas, not walkable maps, and place.ts carries the route_1 /
//   garden-meadow pool mismatch on its join row. A bundle pool is
//   never presented as a Dex area until a live-map join authors it.
// - No map display-name table is authored here: the areaId itself
//   (route-1-grass, sector0-placed) is the label, with the method
//   beside it. Inventing a pretty name for a mapId would be the
//   roster invention this slice refuses.
//
// Gating lives in the Dex host, not here (like researchKindCounts):
// this module returns rows for any speciesId and [] for unknown
// ones; DexView shows the section for seen/caught entries only,
// so undiscovered entries leak no area.
//
// Shape: caller-supplied rows for the pure function (the
// behaviour.ts / followerFind pattern — the profile/table is an
// argument, never invented inside); WORLD_AREAS + the
// worldAreasForSpecies convenience read the real JSON for hosts.

import encountersJson from "../data/core/encounters.json";

export interface DexWorldAreaRow {
  areaId?: string;
  mapId: string;
  method: string;
  slots?: readonly { speciesId: string }[] | null;
}

export interface DexArea {
  areaId: string;
  mapId: string;
  method: string;
}

/** Label shown in the Dex: the authored area id + its method. */
export function dexAreaLabel(area: DexArea): string {
  return `${area.areaId} (${area.method})`;
}

function asDexArea(row: DexWorldAreaRow): DexArea | null {
  if (!row || typeof row.mapId !== "string" || !row.mapId) return null;
  if (typeof row.method !== "string" || !row.method) return null;
  if (!Array.isArray(row.slots)) return null;
  return {
    areaId:
      typeof row.areaId === "string" && row.areaId
        ? row.areaId
        : `${row.mapId}-${row.method}`,
    mapId: row.mapId,
    method: row.method,
  };
}

/**
 * Live-map areas where a species is an authored encounter slot, in
 * input order, one row per areaId + method (a species listed twice
 * in one area's slots still reads as one area).
 */
export function areasForSpecies(
  speciesId: string,
  areas: readonly DexWorldAreaRow[],
): DexArea[] {
  if (!speciesId || !Array.isArray(areas)) return [];
  const seen = new Set<string>();
  const out: DexArea[] = [];
  for (const row of areas) {
    const area = asDexArea(row);
    if (!area) continue;
    const hit = (row.slots ?? []).some(
      (slot) =>
        slot && String(slot.speciesId) === String(speciesId),
    );
    if (!hit) continue;
    const key = `${area.areaId}::${area.method}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(area);
  }
  return out;
}

const data = encountersJson as unknown as {
  worldAreas?: DexWorldAreaRow[];
};

/** The real worldAreas rows from encounters.json, in file order. */
export const WORLD_AREAS: DexWorldAreaRow[] = data.worldAreas ?? [];

/** Host convenience: areas for one species from the real JSON. */
export function worldAreasForSpecies(speciesId: string): DexArea[] {
  return areasForSpecies(speciesId, WORLD_AREAS);
}

/**
 * One-line area message for the Gen 2 AREA button (which reports
 * through the message line, not a panel). Undiscovered entries get
 * no area information at all.
 */
export function dexAreaMessage(
  speciesId: string,
  status: "caught" | "seen" | "undiscovered",
): string {
  if (!speciesId || status === "undiscovered") return "Undiscovered.";
  const areas = worldAreasForSpecies(speciesId);
  if (areas.length === 0) return "No recorded area yet.";
  return `Found in: ${areas.map(dexAreaLabel).join(", ")}`;
}
