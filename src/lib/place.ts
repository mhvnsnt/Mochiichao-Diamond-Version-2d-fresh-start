// Gap-fill S4 — Habitat Landing 4: the recognition module (pure, tested).
//
// Implements RECOGNITION-SPEC §3 (`recognisePlace(state) -> PlaceFact`) over
// the S2 Landing 3 records (region1.ecology.json zones + biomes.json) and the
// S2-bound spawn bundles (garden-complex, dark-forest). It reads the S1 clock
// only through the caller's WorldState — it never reads the store, never
// writes a save, and never invents a place.
//
// What this module honestly is, and is not:
// - It IS the place-fact at runtime for the five region-1 zones, plus an
//   honest unzoned fact (zoneId null) for every other live map. A runtime
//   consumer (S5's selector, S10's roamers, S15's ambient layer) does not
//   exist yet — this module is a complete library awaiting its readers, and
//   no claim beyond that is made here.
// - The map -> zone join covers exactly three live maps, each with its basis
//   written on the row (MAP_ZONE_JOIN). Every other FULL_WORLD key resolves
//   unzoned: no town, dojo, route, or region-2 map gets a zone by guesswork.
//   In particular garden-pond has NO live-map join (no pond map exists in
//   FULL_WORLD; boot_bay is a bay, not the Pond, and is not joined to it),
//   and dark-forest-depths has NO live-map join (binary_woods is the surface
//   map; the depths resolve only by explicit zoneId, as an empty-but-valid
//   fact). The Garden zone itself has no zone record in region1.ecology.json
//   (S2 record), so no map joins to it either.
// - primaryClass is the FIRST class in the zone record's authored order.
//   That order is zone-primary first per the S2 records (meadow
//   small-ground, forest-surface canopy, cave small-ground). Terrain
//   underfoot (RECOGNITION-SPEC §3, HAB-G3) does not exist yet, so
//   playerPos is accepted on the input for forward compatibility but does
//   NOT refine the fact: recognition here is zone grain, and the module
//   says so rather than pretending a tile fact it cannot read.
// - secondaryClass is the primary class of the zone's FIRST listed
//   neighbour (RECOGNITION-SPEC §4 edge band). It is an edge-band
//   CANDIDATE for the roamer/sound readers — no distance-to-border data
//   exists yet, so it is never a proximity proof, and spawn selection
//   must read primaryClass + the current zone's tables only (pools never
//   blend across a boundary).
// - timeBand comes from the caller's WorldState phase (S1 worldClock):
//   late -> night, morn -> morning, day -> day, eve -> dusk, nite -> night.
//   With no WorldState supplied (unanchored save) timeBand is null — an
//   honest unknown, not a device-clock guess. The menu device clock is
//   deliberately NOT consulted: S1 exists so live paths share one clock.
// - weatherKey is the zone's authored environment.weatherKey carried
//   verbatim ('clear', 'mist', or null). weatherId stays null: there is
//   NO verified mapping from those WEATHER_CONFIG keys to fieldWeather's
//   0-14 ids (whose keys are sunny/snowFlakes/rain/..., no 'clear' or
//   'mist'), and this module does not guess one. Landing 6's environment
//   sourcing swap is the step that may author such a mapping.
// - sceneId is the zone's authored environment.sceneId carried verbatim
//   (null on all five S2 zones — an authored slot, not a value).
// - sealed is a zone-level fact for exactly one zone, dark-forest-depths
//   (RECOGNITION-SPEC §2.4, #84's depths absence). Sealed species never
//   appear here: sealed species have no rows anywhere, so no class query
//   can return one — the absence is the wiring.
// - Cave methods/species read from bundles only: cave-route-01 has a seed
//   table in encounters.json but NO bundle file yet (S2 record: the maps
//   lane's call), so the cave zone's methodsHere/speciesHere are honestly
//   empty until that bundle exists. place.ts does not backfill from seed.
// - The cave zone's class stays 'small-ground' exactly as the S2 zone
//   record authors it, with that record's own flag carried: the cave-class
//   question is OPEN (the record calls small-ground its weakest
//   inference). place.ts does not resolve it by inventing 'underground'.
// - The route_1 -> garden-meadow join carries its mismatch on the row:
//   the live route_1 grass pool (encounters.json worldAreas) stocks
//   mochii alongside sproutle/kittember/zephling, while the meadow seed
//   stocks pupbble/squirmite instead of mochii. The join rests on the
//   Greenfield Path through the Green (garden-meadow showLocation "the
//   Green") plus the 3-of-5 seed overlap — stated, not hidden.

import type { WorldState } from "./worldClock";
import region1Ecology from "../data/core/ecology/region1.ecology.json";
import biomesFile from "../data/core/ecology/biomes.json";
import gardenComplexBundle from "../data/core/encounters/garden-complex.spawn-tables.json";
import darkForestBundle from "../data/core/encounters/dark-forest.spawn-tables.json";

// Axis 1 — habitatClass, post-S2 enum (RECOGNITION-SPEC §1.1; S2 Landing 2
// removed 'night', a time band, and added waters-edge/underground/built).
export type HabitatClass =
  | "small-ground"
  | "canopy"
  | "depths"
  | "water"
  | "waters-edge"
  | "underground"
  | "sky"
  | "perch"
  | "built";

// Axis 2 — method, live vocabulary only (RECOGNITION-SPEC §1.2). Reserved
// methods (dark-grass, phenomena variants) are not in this union until a
// canon source authors terrain for them.
export type Method = "grass" | "surf" | "fish" | "cave";

export type TimeBand = "morning" | "day" | "dusk" | "night";
export type DepthTier = "surface" | "depths";

export interface ZoneRecord {
  zoneId: string;
  areaId: string | null;
  habitatClasses: HabitatClass[];
  biomeId: string | null;
  environment: { weatherKey: string | null; sceneId: string | null };
  authoredLife: boolean;
  neighbours: string[];
  residents: { speciesId: string }[];
}

export interface BiomeRecord {
  biomeId: string;
  zoneIds: string[];
}

export interface SpawnSlot {
  speciesId: string;
  habitatClass: HabitatClass | null;
  timeOfDay: string | null;
}

export interface SpawnTable {
  method: Method;
  slots: SpawnSlot[];
}

export interface SpawnArea {
  areaId: string;
  depthTier?: string;
  tables: SpawnTable[];
}

export interface PlaceData {
  zones: ZoneRecord[];
  biomes: BiomeRecord[];
  bundles: SpawnArea[][];
}

function asZone(raw: any): ZoneRecord {
  return {
    zoneId: String(raw.zoneId),
    areaId: raw.areaId ?? null,
    habitatClasses: Array.isArray(raw.habitatClasses) ? [...raw.habitatClasses] : [],
    biomeId: raw.biomeId ?? null,
    environment: {
      weatherKey: raw.environment?.weatherKey ?? null,
      sceneId: raw.environment?.sceneId ?? null,
    },
    authoredLife: raw.authoredLife === true,
    neighbours: Array.isArray(raw.neighbours) ? [...raw.neighbours] : [],
    residents: Array.isArray(raw.residents)
      ? raw.residents.map((r: any) => ({ speciesId: String(r.speciesId) }))
      : [],
  };
}

function asBiome(raw: any): BiomeRecord {
  return {
    biomeId: String(raw.biomeId),
    zoneIds: Array.isArray(raw.zoneIds) ? [...raw.zoneIds] : [],
  };
}

function asBundle(raw: any): SpawnArea[] {
  if (!Array.isArray(raw.areas)) return [];
  return raw.areas.map((a: any) => ({
    areaId: String(a.areaId),
    depthTier: a.depthTier ?? undefined,
    tables: Array.isArray(a.tables)
      ? a.tables.map((t: any) => ({
          method: String(t.method) as Method,
          slots: Array.isArray(t.slots)
            ? t.slots.map((s: any) => ({
                speciesId: String(s.speciesId),
                habitatClass: (s.habitatClass ?? null) as HabitatClass | null,
                timeOfDay: s.timeOfDay ?? null,
              }))
            : [],
        }))
      : [],
  }));
}

// The region-1 data as landed (S2). Imported once; recognisePlace takes its
// data as an argument so tests and later regions can pass fixtures.
export const REGION1_PLACE_DATA: PlaceData = {
  zones: ((region1Ecology as any).zones ?? []).map(asZone),
  biomes: ((biomesFile as any).biomes ?? []).map(asBiome),
  bundles: [asBundle(gardenComplexBundle), asBundle(darkForestBundle)],
};

// Zones whose withholding is a canon fact, not a data gap (SPEC §2.4).
export const SEALED_ZONES: readonly string[] = ["dark-forest-depths"];

export interface MapZoneJoin {
  zoneId: string;
  basis: string;
  note?: string;
}

// Live-map -> zone joins. Exactly three rows: anything not listed here
// resolves unzoned, honestly, until a canon source authors its join.
export const MAP_ZONE_JOIN: Record<string, MapZoneJoin> = {
  route_1: {
    zoneId: "garden-meadow",
    basis:
      "Route 1.0 — Greenfield Path through the Green (garden-meadow " +
      "showLocation 'the Green'); live grass pool shares sproutle, " +
      "kittember, zephling with the meadow seed.",
    note:
      "Mismatch on the record: the live route_1 pool also stocks mochii " +
      "(a pond species) and lacks the meadow seed's pupbble/squirmite. " +
      "The join is a mapping claim with that mismatch, not a pool proof.",
  },
  binary_woods: {
    zoneId: "dark-forest-surface",
    basis:
      "Map name 'The Dark Forest' matches the surface zone; live grass " +
      "pool is kittember alone, the surface zone's sole resident.",
  },
  cave_of_echoes: {
    zoneId: "cave-of-echoes-side",
    basis:
      "Map name 'Cave of Echoes — B1F' matches the cave zone; cave is " +
      "the zone's only seed method (cave-route-01).",
    note:
      "The zone's class stays 'small-ground' per its record; the " +
      "cave-class question is OPEN (see module header).",
  },
};

export interface RecognisePlaceInput {
  mapId: string;
  // Explicit overrides for data-side readers and tests. zoneId wins over
  // areaId, which wins over the map join.
  zoneId?: string | null;
  areaId?: string | null;
  // Accepted for forward compatibility; NOT a grain input yet — see header.
  playerPos?: { x: number; y: number } | null;
  // S1 clock state; null/omitted = unanchored, timeBand unknown.
  worldState?: Pick<WorldState, "phase"> | null;
}

export interface PlaceFact {
  mapId: string;
  zoneId: string | null;
  areaId: string | null;
  biomeId: string | null;
  habitatClasses: HabitatClass[];
  primaryClass: HabitatClass | null;
  secondaryClass: HabitatClass | null;
  methodsHere: Method[];
  speciesHere: string[];
  depthTier: DepthTier | null;
  timeBand: TimeBand | null;
  weatherKey: string | null;
  weatherId: number | null;
  sceneId: string | null;
  authoredLife: boolean;
  sealed: boolean;
}

export function timeBandForPhase(phase: string | null | undefined): TimeBand | null {
  switch (phase) {
    case "morn":
      return "morning";
    case "day":
      return "day";
    case "eve":
      return "dusk";
    case "late":
    case "nite":
      return "night";
    default:
      return null;
  }
}

function findZone(data: PlaceData, zoneId: string): ZoneRecord | undefined {
  return data.zones.find((z) => z.zoneId === zoneId);
}

function zonesForArea(data: PlaceData, areaId: string): ZoneRecord[] {
  return data.zones.filter((z) => z.areaId === areaId);
}

function bundleAreasForZone(data: PlaceData, zone: ZoneRecord): SpawnArea[] {
  if (zone.areaId === null) return [];
  const all = data.bundles.flat();
  const byArea = all.filter((a) => a.areaId === zone.areaId);
  if (byArea.length <= 1) return byArea;
  // Two zones share one areaId (dark-forest surface + depths): the
  // depthTier on the bundle area disambiguates. A zone with no matching
  // tier falls back to the area match rather than vanishing.
  if (zone.zoneId === "dark-forest-depths") {
    return byArea.filter((a) => a.depthTier === "depths");
  }
  if (zone.zoneId === "dark-forest-surface") {
    return byArea.filter((a) => a.depthTier === "surface");
  }
  return byArea;
}

export function recognisePlaceForZone(
  mapId: string,
  zone: ZoneRecord | undefined,
  data: PlaceData,
  input: RecognisePlaceInput,
): PlaceFact {
  const unzoned: PlaceFact = {
    mapId,
    zoneId: null,
    areaId: null,
    biomeId: null,
    habitatClasses: [],
    primaryClass: null,
    secondaryClass: null,
    methodsHere: [],
    speciesHere: [],
    depthTier: null,
    timeBand: timeBandForPhase(input.worldState?.phase),
    weatherKey: null,
    weatherId: null,
    sceneId: null,
    authoredLife: false,
    sealed: false,
  };
  if (!zone) return unzoned;
  const areas = bundleAreasForZone(data, zone);
  const methodsHere: Method[] = [];
  const speciesHere: string[] = [];
  for (const area of areas) {
    for (const table of area.tables) {
      if (!methodsHere.includes(table.method)) methodsHere.push(table.method);
      for (const slot of table.slots) {
        if (!speciesHere.includes(slot.speciesId)) speciesHere.push(slot.speciesId);
      }
    }
  }
  const depthTier =
    areas.length === 1 && (areas[0].depthTier === "surface" || areas[0].depthTier === "depths")
      ? (areas[0].depthTier as DepthTier)
      : null;
  const neighbour = zone.neighbours.length > 0 ? findZone(data, zone.neighbours[0]) : undefined;
  return {
    mapId,
    zoneId: zone.zoneId,
    areaId: zone.areaId,
    biomeId: zone.biomeId,
    habitatClasses: [...zone.habitatClasses],
    primaryClass: zone.habitatClasses[0] ?? null,
    secondaryClass: neighbour?.habitatClasses[0] ?? null,
    methodsHere,
    speciesHere,
    depthTier,
    timeBand: timeBandForPhase(input.worldState?.phase),
    weatherKey: zone.environment.weatherKey,
    // No verified WEATHER_CONFIG-key -> fieldWeather-id mapping exists;
    // null is the honest value until Landing 6 authors one.
    weatherId: null,
    sceneId: zone.environment.sceneId,
    authoredLife: zone.authoredLife,
    sealed: SEALED_ZONES.includes(zone.zoneId),
  };
}

export function recognisePlace(
  input: RecognisePlaceInput,
  data: PlaceData = REGION1_PLACE_DATA,
): PlaceFact {
  let zone: ZoneRecord | undefined;
  if (input.zoneId) {
    zone = findZone(data, input.zoneId);
  } else if (input.areaId) {
    const matches = zonesForArea(data, input.areaId);
    if (matches.length === 1) {
      zone = matches[0];
    } else if (matches.length > 1) {
      // Ambiguous area (dark-forest: surface + depths). Prefer the zone a
      // live map joins to — the surface — so an area-only lookup never
      // silently returns the withheld depths fact. Depths need zoneId.
      const joined = Object.values(MAP_ZONE_JOIN).map((j) => j.zoneId);
      zone = matches.find((z) => joined.includes(z.zoneId)) ?? matches[0];
    }
  } else {
    const join = MAP_ZONE_JOIN[input.mapId];
    if (join) zone = findZone(data, join.zoneId);
  }
  return recognisePlaceForZone(input.mapId, zone, data, input);
}
