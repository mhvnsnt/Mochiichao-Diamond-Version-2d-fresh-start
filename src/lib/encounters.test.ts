// Stub-kill S-6 receipts: the core encounter tables are the single
// source for wild spawns, and driven rolls match the tables.
import { describe, it, expect } from "vitest";
import { tableFor, rollEncounterStep, pickFromTable, placedSeeds, ENCOUNTER_TABLES } from "./encounters";
import { FULL_WORLD } from "../world/FullWorldMaps";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("S-6 encounter binding", () => {
  it("the four live world tables migrated verbatim from the retired inline zones", () => {
    const route1 = tableFor("route_1", "grass");
    expect(route1?.rate).toBe(0.15);
    expect(route1?.slots.map((s) => [s.speciesId, s.minLevel, s.maxLevel])).toEqual([
      ["038", 3, 3], ["001", 3, 3], ["010", 4, 4], ["019", 4, 4],
    ]);
    expect(tableFor("binary_woods", "grass")?.slots.map((s) => [s.speciesId, s.minLevel])).toEqual([["010", 10]]);
    expect(tableFor("binary_woods", "grass")?.rate).toBe(0.22);
    expect(tableFor("cave_of_echoes", "cave")?.slots.map((s) => [s.speciesId, s.minLevel])).toEqual([["004", 15]]);
    expect(tableFor("cave_of_echoes", "cave")?.rate).toBe(0.25);
    expect(tableFor("scrap_junkyard", "grass")?.slots.map((s) => [s.speciesId, s.minLevel])).toEqual([["005", 20]]);
  });

  it("FullWorldMaps' per-map encounters are a generated mirror of the tables (no dual truth)", () => {
    for (const mapId of ["route_1", "binary_woods", "cave_of_echoes", "scrap_junkyard"]) {
      const table = ENCOUNTER_TABLES.find((t) => t.mapId === mapId && t.method !== "placed");
      const mirror = FULL_WORLD[mapId].encounters;
      expect(mirror).toHaveLength(1);
      expect(mirror[0].mirrorOfCoreTable).toBe(table?.areaId);
      expect(mirror[0].rate).toBe(table?.rate);
      expect(mirror[0].pool.map((p: any) => [p.id, p.level]))
        .toEqual(table?.slots.map((s) => [s.speciesId, s.minLevel]));
    }
  });

  it("driven grass steps match the table rate and uniform slots (20,000 steps, seeded)", () => {
    const table = tableFor("route_1", "grass")!;
    const rng = mulberry32(20261029);
    const N = 20000;
    let hits = 0;
    const species = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      const pick = rollEncounterStep(table, rng);
      if (pick) {
        hits++;
        species.set(pick.speciesId, (species.get(pick.speciesId) ?? 0) + 1);
        const slot = table.slots[pick.slotIndex];
        expect(pick.level).toBeGreaterThanOrEqual(slot.minLevel);
        expect(pick.level).toBeLessThanOrEqual(slot.maxLevel);
      }
    }
    // Rate 0.15, binomial sd at N=20000 is ~0.0025 — assert within 0.02.
    expect(hits / N).toBeGreaterThan(0.13);
    expect(hits / N).toBeLessThan(0.17);
    // Equal weights: each species within 20% of a quarter share.
    for (const id of ["038", "001", "010", "019"]) {
      const share = (species.get(id) ?? 0) / hits;
      expect(share).toBeGreaterThan(0.2);
      expect(share).toBeLessThan(0.3);
    }
  });

  it("S5 exit test: the selector reproduces the garden bundle pools exactly", () => {
    for (const [mapId, method] of [["meadow-route-01", "grass"], ["pond-route-01", "surf"]] as const) {
      const table = tableFor(mapId, method)!;
      expect(table).not.toBeNull();
      const rng = mulberry32(7);
      const seen = new Set<string>();
      for (let i = 0; i < 4000; i++) seen.add(pickFromTable(table, rng).speciesId);
      expect([...seen].sort()).toEqual(table.slots.map((s) => s.speciesId).sort());
    }
  });

  it("creature-mode roamers draw from the same tables (sector0 placed seeds)", () => {
    expect(placedSeeds("sector0").map((s) => [s.speciesId, s.minLevel])).toEqual([
      ["001", 5], ["004", 6], ["007", 5], ["007", 5], ["010", 5],
    ]);
  });

  it("a table without an authored rate never fires a step roll", () => {
    const table = tableFor("meadow-route-01", "grass")!;
    expect(table.rate).toBeUndefined();
    expect(rollEncounterStep(table, () => 0)).toBeNull();
  });
});
