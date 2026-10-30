// Gap-fill S4 (Habitat Landing 4) receipts: recognisePlace over the S2
// records. No runtime consumer is claimed here — the consumers are S5's
// selector, S10's roamers, and S15's ambient layer (later steps).
import { describe, it, expect } from "vitest";
import {
  MAP_ZONE_JOIN,
  REGION1_PLACE_DATA,
  recognisePlace,
  timeBandForPhase,
} from "./place";

describe("recognisePlace — live-map joins", () => {
  it("route_1 resolves to garden-meadow at zone grain", () => {
    const fact = recognisePlace({ mapId: "route_1" });
    expect(fact.zoneId).toBe("garden-meadow");
    expect(fact.areaId).toBe("meadow-route-01");
    expect(fact.biomeId).toBe("garden-complex");
    expect(fact.habitatClasses).toEqual(["small-ground", "sky", "perch"]);
    expect(fact.primaryClass).toBe("small-ground");
    // Edge band: first neighbour is the pond, whose primary class is water.
    expect(fact.secondaryClass).toBe("water");
    expect(fact.methodsHere).toEqual(["grass"]);
    expect(fact.speciesHere).toEqual(["sproutle", "pupbble", "squirmite", "zephling", "kittember"]);
    expect(fact.authoredLife).toBe(true);
    expect(fact.sealed).toBe(false);
    expect(fact.weatherKey).toBe("clear");
    expect(fact.sceneId).toBeNull();
  });
  it("binary_woods resolves to dark-forest-surface, canopy primary", () => {
    const fact = recognisePlace({ mapId: "binary_woods" });
    expect(fact.zoneId).toBe("dark-forest-surface");
    expect(fact.areaId).toBe("dark-forest");
    expect(fact.biomeId).toBe("forest");
    expect(fact.habitatClasses).toEqual(["canopy", "small-ground"]);
    expect(fact.primaryClass).toBe("canopy");
    expect(fact.methodsHere).toEqual(["grass"]);
    expect(fact.speciesHere).toEqual(["kittember"]);
    expect(fact.depthTier).toBe("surface");
    expect(fact.weatherKey).toBe("mist");
    expect(fact.sealed).toBe(false);
  });
  it("cave_of_echoes resolves to cave-of-echoes-side; its bundle is still owed", () => {
    const fact = recognisePlace({ mapId: "cave_of_echoes" });
    expect(fact.zoneId).toBe("cave-of-echoes-side");
    expect(fact.areaId).toBe("cave-route-01");
    expect(fact.biomeId).toBe("cave-of-echoes");
    expect(fact.primaryClass).toBe("small-ground");
    // Honest empty: cave-route-01 has a seed table in encounters.json but
    // NO bundle file yet (S2 record: creating one is the maps lane's
    // call). place.ts reads bundles, so it claims no cave method/species
    // until that bundle exists — it does not backfill from the seed.
    expect(fact.methodsHere).toEqual([]);
    expect(fact.speciesHere).toEqual([]);
    expect(fact.sealed).toBe(false);
  });
  it("garden-pond resolves by areaId (no live map joins to it) with surf+fish", () => {
    const fact = recognisePlace({ mapId: "boot_bay", areaId: "pond-route-01" });
    expect(fact.zoneId).toBe("garden-pond");
    expect(fact.primaryClass).toBe("water");
    expect(fact.methodsHere).toEqual(["surf", "fish"]);
    expect(fact.speciesHere).toEqual(["mochii", "inklet", "finblade", "floatcalf"]);
    // And the join table itself joins no map to the pond.
    expect(Object.values(MAP_ZONE_JOIN).map((j) => j.zoneId)).not.toContain("garden-pond");
  });
});

describe("recognisePlace — depths, unzoned, and clock", () => {
  it("dark-forest-depths resolves only by explicit zoneId, as an empty-but-valid fact", () => {
    const fact = recognisePlace({ mapId: "binary_woods", zoneId: "dark-forest-depths" });
    expect(fact.zoneId).toBe("dark-forest-depths");
    expect(fact.habitatClasses).toEqual(["depths"]);
    expect(fact.primaryClass).toBe("depths");
    expect(fact.speciesHere).toEqual([]);
    expect(fact.depthTier).toBe("depths");
    expect(fact.authoredLife).toBe(false);
    expect(fact.sealed).toBe(true);
  });
  it("an area-only lookup for dark-forest prefers the surface, never silently the depths", () => {
    const fact = recognisePlace({ mapId: "binary_woods", areaId: "dark-forest" });
    expect(fact.zoneId).toBe("dark-forest-surface");
    expect(fact.sealed).toBe(false);
  });
  it("an unzoned map returns an honest null fact, not a guessed zone", () => {
    const fact = recognisePlace({ mapId: "sector0" });
    expect(fact.zoneId).toBeNull();
    expect(fact.areaId).toBeNull();
    expect(fact.biomeId).toBeNull();
    expect(fact.habitatClasses).toEqual([]);
    expect(fact.primaryClass).toBeNull();
    expect(fact.secondaryClass).toBeNull();
    expect(fact.methodsHere).toEqual([]);
    expect(fact.speciesHere).toEqual([]);
    expect(fact.authoredLife).toBe(false);
    expect(fact.sealed).toBe(false);
    expect(fact.weatherKey).toBeNull();
  });
  it("timeBand maps the S1 clock phases and stays null without a clock", () => {
    expect(timeBandForPhase("late")).toBe("night");
    expect(timeBandForPhase("morn")).toBe("morning");
    expect(timeBandForPhase("day")).toBe("day");
    expect(timeBandForPhase("eve")).toBe("dusk");
    expect(timeBandForPhase("nite")).toBe("night");
    expect(timeBandForPhase(undefined)).toBeNull();
    expect(recognisePlace({ mapId: "route_1" }).timeBand).toBeNull();
    expect(
      recognisePlace({ mapId: "route_1", worldState: { phase: "eve" } }).timeBand,
    ).toBe("dusk");
  });
  it("is pure: repeat calls agree and the data is not mutated", () => {
    const input = { mapId: "route_1" };
    const a = recognisePlace(input);
    const b = recognisePlace(input);
    expect(a).toEqual(b);
    expect(REGION1_PLACE_DATA.zones).toHaveLength(5);
  });
  it("every map join names a real zone and carries its basis", () => {
    const zoneIds = new Set(REGION1_PLACE_DATA.zones.map((z) => z.zoneId));
    for (const [mapId, join] of Object.entries(MAP_ZONE_JOIN)) {
      expect(zoneIds.has(join.zoneId)).toBe(true);
      expect(join.basis.length).toBeGreaterThan(0);
      expect(mapId.length).toBeGreaterThan(0);
    }
    // Exactly three joins: no fourth map is quietly claimed.
    expect(Object.keys(MAP_ZONE_JOIN)).toEqual(["route_1", "binary_woods", "cave_of_echoes"]);
  });
});
