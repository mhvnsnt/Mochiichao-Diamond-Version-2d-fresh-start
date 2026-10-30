// Gap-fill S5 receipts: the bundle selector reads the core bundles,
// and its pools are exactly the seed tables retired in the same step.
import { describe, it, expect } from "vitest";
import {
  BUNDLE_POOLS,
  bundlePoolFor,
  bundlePoolCanRoll,
} from "./spawnSelector";
import { tableFor, pickFromTable } from "./encounters";

// Retired seed values, copied from src/data/core/encounters.json as
// it stood before S5 (verified against the pre-S5 file this run, not
// from memory): [speciesId, minLevel, maxLevel, weight], in order.
const RETIRED: Record<string, [string, number, number, number][]> = {
  "meadow-route-01|grass": [
    ["038", 2, 4, 30],
    ["013", 2, 4, 25],
    ["016", 2, 3, 20],
    ["019", 2, 4, 15],
    ["010", 3, 5, 10],
  ],
  "pond-route-01|surf": [
    ["001", 3, 5, 40],
    ["026", 3, 5, 30],
    ["022", 4, 6, 20],
    ["024", 5, 7, 10],
  ],
  "pond-route-01|fish": [
    ["001", 3, 5, 40],
    ["022", 4, 6, 35],
    ["026", 3, 5, 25],
  ],
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("S5 bundle selector", () => {
  it("exit test: bundle pools equal the retired seed tables exactly (order, levels, weights)", () => {
    for (const [key, expected] of Object.entries(RETIRED)) {
      const [areaId, method] = key.split("|") as [string, "grass" | "surf" | "fish"];
      const pool = bundlePoolFor(areaId, method);
      expect(pool).not.toBeNull();
      expect(pool!.slots.map((s) => [s.speciesId, s.minLevel, s.maxLevel, s.weight])).toEqual(expected);
      expect(bundlePoolCanRoll(pool!)).toBe(true);
    }
  });

  it("bundle species names resolve through species.json (no invented ids)", () => {
    const meadow = bundlePoolFor("meadow-route-01", "grass")!;
    expect(meadow.slots.map((s) => [s.speciesName, s.speciesId])).toEqual([
      ["sproutle", "038"],
      ["pupbble", "013"],
      ["squirmite", "016"],
      ["zephling", "019"],
      ["kittember", "010"],
    ]);
    expect(bundlePoolFor("pond-route-01", "surf")!.slots[3]).toEqual(
      expect.objectContaining({ speciesName: "floatcalf", speciesId: "024" }),
    );
  });

  it("S2 habitat binding rides through the selector unchanged", () => {
    const meadow = bundlePoolFor("meadow-route-01", "grass")!;
    expect(meadow.slots.find((s) => s.speciesName === "sproutle")!.habitatClass).toBe("small-ground");
    expect(meadow.slots.find((s) => s.speciesName === "zephling")!.habitatClass).toBeNull();
    const pond = bundlePoolFor("pond-route-01", "surf")!;
    expect(pond.slots.every((s) => s.habitatClass === "water")).toBe(true);
  });

  it("encounters.ts now serves the bundle tables (single source, no duplicate)", () => {
    for (const [key, expected] of Object.entries(RETIRED)) {
      const [areaId, method] = key.split("|") as [string, "grass" | "surf" | "fish"];
      const table = tableFor(areaId, method);
      expect(table).not.toBeNull();
      expect(table!.slots.map((s) => [s.speciesId, s.minLevel, s.maxLevel, s.weight])).toEqual(expected);
      // Bundle tables author no rate, same as the retired seed rows.
      expect(table!.rate).toBeUndefined();
    }
    // The cave seed table stays JSON-sourced: it has no bundle file.
    expect(tableFor("cave-route-01", "cave")!.slots.map((s) => s.speciesId)).toEqual([
      "032", "035", "029", "041",
    ]);
  });

  it("driven rolls from a bundle table stay inside the pool", () => {
    const table = tableFor("meadow-route-01", "grass")!;
    const rng = mulberry32(20261030);
    const seen = new Set<string>();
    for (let i = 0; i < 4000; i++) {
      const pick = pickFromTable(table, rng);
      seen.add(pick.speciesId);
      const slot = table.slots[pick.slotIndex];
      expect(pick.level).toBeGreaterThanOrEqual(slot.minLevel);
      expect(pick.level).toBeLessThanOrEqual(slot.maxLevel);
    }
    expect([...seen].sort()).toEqual(["010", "013", "016", "019", "038"]);
  });

  it("dark-forest pools are present but honestly unrollable, and ambiguity refuses to pick", () => {
    const surface = bundlePoolFor("dark-forest", "grass", { depthTier: "surface" })!;
    expect(surface.slots).toHaveLength(1);
    expect(surface.slots[0]).toEqual(
      expect.objectContaining({ speciesName: "kittember", speciesId: "010", minLevel: null, weight: null }),
    );
    expect(bundlePoolCanRoll(surface)).toBe(false);
    const depths = bundlePoolFor("dark-forest", "grass", { depthTier: "depths" })!;
    expect(depths.slots).toEqual([]);
    expect(bundlePoolCanRoll(depths)).toBe(false);
    // No depthTier on a two-pool area: null, not a silent first pick.
    expect(bundlePoolFor("dark-forest", "grass")).toBeNull();
    expect(tableFor("dark-forest", "grass")).toBeNull();
  });

  it("null band/weather means any (slots author no split); unknown area/method is null", () => {
    const pool = bundlePoolFor("meadow-route-01", "grass", { timeOfDay: "day", weather: "clear" })!;
    expect(pool.slots).toHaveLength(5);
    expect(bundlePoolFor("meadow-route-01", "surf")).toBeNull();
    expect(bundlePoolFor("nowhere-01", "grass")).toBeNull();
    expect(BUNDLE_POOLS.map((p) => `${p.areaId}|${p.method}|${p.depthTier ?? "-"}`)).toEqual([
      "meadow-route-01|grass|-",
      "pond-route-01|surf|-",
      "pond-route-01|fish|-",
      "dark-forest|grass|surface",
      "dark-forest|grass|depths",
    ]);
  });
});
