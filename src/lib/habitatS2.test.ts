// Gap-fill S2 (Habitat Landings 1-3) receipts: habitat binding, enum alignment,
// zone records + biome records. Data-only landing; no runtime consumer is claimed here
// (the consumer is S4's place.ts / S5's selector, later steps).
import { describe, it, expect } from "vitest";
import gardenBundle from "../data/core/encounters/garden-complex.spawn-tables.json";
import darkBundle from "../data/core/encounters/dark-forest.spawn-tables.json";
import ecology from "../data/core/ecology/region1.ecology.json";
import biomesFile from "../data/core/ecology/biomes.json";

const garden: any = gardenBundle;
const dark: any = darkBundle;
const eco: any = ecology;
const biomes: any = biomesFile;

function area(bundle: any, areaId: string, depthTier?: string) {
  return bundle.areas.find((a: any) => a.areaId === areaId && (depthTier === undefined || a.depthTier === depthTier));
}
function slots(bundle: any, areaId: string, method: string, depthTier?: string) {
  const a = area(bundle, areaId, depthTier);
  return a.tables.find((t: any) => t.method === method).slots;
}

describe("S2 Landing 1 — habitat binding", () => {
  it("meadow grass slots bind small-ground except zephling, which stays null with its narrowed reason", () => {
    const s = slots(garden, "meadow-route-01", "grass");
    expect(s.map((x: any) => [x.speciesId, x.habitatClass])).toEqual([
      ["sproutle", "small-ground"],
      ["pupbble", "small-ground"],
      ["squirmite", "small-ground"],
      ["zephling", null],
      ["kittember", "small-ground"],
    ]);
    // Numbers untouched by the binding (seed weights/levels verbatim).
    expect(s.map((x: any) => [x.speciesId, x.minLevel, x.maxLevel, x.weight])).toEqual([
      ["sproutle", 2, 4, 30],
      ["pupbble", 2, 4, 25],
      ["squirmite", 2, 3, 20],
      ["zephling", 2, 4, 15],
      ["kittember", 3, 5, 10],
    ]);
    expect(s.find((x: any) => x.speciesId === "zephling").status).toContain("grass proves presence, not class");
    for (const x of s.filter((y: any) => y.habitatClass === "small-ground")) {
      expect(x.status).toContain("small-ground (S2 Landing 1)");
    }
  });
  it("pond slots stay water (verified, unchanged) and dark-forest surface binds canopy without inventing numbers", () => {
    for (const method of ["surf", "fish"]) {
      expect(slots(garden, "pond-route-01", method).every((x: any) => x.habitatClass === "water")).toBe(true);
    }
    const kit = slots(dark, "dark-forest", "grass", "surface")[0];
    expect(kit.speciesId).toBe("kittember");
    expect(kit.habitatClass).toBe("canopy");
    expect(kit.minLevel).toBeNull();
    expect(kit.maxLevel).toBeNull();
    expect(kit.weight).toBeNull();
  });
  it("dark-forest depths stay EMPTY (fence, not a gap)", () => {
    expect(slots(dark, "dark-forest", "grass", "depths")).toEqual([]);
  });
  it("no slot or zone anywhere uses 'night' as a habitat class", () => {
    const allSlots = [
      ...garden.areas.flatMap((a: any) => a.tables.flatMap((t: any) => t.slots)),
      ...dark.areas.flatMap((a: any) => a.tables.flatMap((t: any) => t.slots)),
    ];
    expect(allSlots.some((x: any) => x.habitatClass === "night")).toBe(false);
    expect(eco.zones.flatMap((z: any) => z.habitatClasses)).not.toContain("night");
  });
});

describe("S2 Landing 3 — zone records + biome records", () => {
  it("every zone carries biomeId, environment, authoredLife and neighbours; species content unchanged", () => {
    expect(eco.zones.map((z: any) => z.zoneId)).toEqual([
      "garden-meadow", "garden-pond", "dark-forest-surface", "dark-forest-depths", "cave-of-echoes-side",
    ]);
    expect(eco.zones.map((z: any) => z.residents.length)).toEqual([5, 4, 1, 0, 4]);
    for (const z of eco.zones) {
      expect(typeof z.biomeId).toBe("string");
      expect(z.environment).toHaveProperty("weatherKey");
      expect(z.environment).toHaveProperty("sceneId");
      expect(typeof z.authoredLife).toBe("boolean");
      expect(Array.isArray(z.neighbours)).toBe(true);
    }
    const byId = Object.fromEntries(eco.zones.map((z: any) => [z.zoneId, z]));
    expect(byId["garden-meadow"].biomeId).toBe("garden-complex");
    expect(byId["garden-pond"].biomeId).toBe("garden-complex");
    expect(byId["dark-forest-surface"].environment.weatherKey).toBe("mist");
    expect(byId["dark-forest-depths"].authoredLife).toBe(false);
    expect(byId["dark-forest-depths"].environment.weatherKey).toBeNull();
    expect(byId["cave-of-echoes-side"].neighbours).toEqual(["dark-forest-surface"]);
  });
  it("zone -> biome -> zones round-trips, and biome display names stay null (owner slot)", () => {
    const zoneIds = new Set(eco.zones.map((z: any) => z.zoneId));
    const biomeById = Object.fromEntries(biomes.biomes.map((b: any) => [b.biomeId, b]));
    for (const z of eco.zones) {
      expect(biomeById[z.biomeId].zoneIds).toContain(z.zoneId);
    }
    for (const b of biomes.biomes) {
      expect(b.displayName).toBeNull();
      expect(b.weatherTable).toBeNull();
      for (const zid of b.zoneIds) expect(zoneIds.has(zid)).toBe(true);
    }
    expect(biomes.biomes.map((b: any) => b.biomeId).sort()).toEqual(
      ["cave-of-echoes", "forest", "garden-complex"],
    );
  });
});
