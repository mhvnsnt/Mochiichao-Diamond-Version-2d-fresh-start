import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gardenLevelSummary,
  levelForAggregate,
  type GardenLevelBand,
} from "./garden-level";

const BANDS: GardenLevelBand[] = [
  { level: 1, min: 0 },
  { level: 2, min: 50 },
  { level: 3, min: 80 },
];

describe("garden-level aggregation (Pokopia M5, pure form)", () => {
  it("comfort-only: aggregate is the mean comfort, level from bands", () => {
    const s = gardenLevelSummary({ comforts: [60, 80], tiers: [], bands: BANDS });
    expect(s.residentCount).toBe(2);
    expect(s.habitatCount).toBe(0);
    expect(s.meanComfort).toBe(70);
    expect(s.meanTier).toBeNull();
    expect(s.tierScore).toBeNull();
    expect(s.aggregate).toBe(70);
    expect(s.level).toBe(2);
  });

  it("tier-only: aggregate is the tier score on the caller scale", () => {
    const s = gardenLevelSummary({ comforts: [], tiers: [2, 2], tierMax: 4, bands: BANDS });
    expect(s.meanTier).toBe(2);
    expect(s.tierScore).toBe(50);
    expect(s.aggregate).toBe(50);
    expect(s.level).toBe(2);
  });

  it("both sides: weighted mean with caller weights (3 comfort / 1 tier)", () => {
    const s = gardenLevelSummary({
      comforts: [80],
      tiers: [2],
      tierMax: 4,
      comfortWeight: 3,
      tierWeight: 1,
      bands: BANDS,
    });
    // comfort 80, tierScore 50 -> (3*80 + 1*50) / 4 = 72.5
    expect(s.aggregate).toBe(72.5);
    expect(s.level).toBe(2);
  });

  it("both sides default to equal weights", () => {
    const s = gardenLevelSummary({ comforts: [80], tiers: [2], tierMax: 4 });
    expect(s.aggregate).toBe(65);
  });

  it("empty Garden: no aggregate and no level, never a default level", () => {
    const s = gardenLevelSummary({ comforts: [], tiers: [], bands: BANDS });
    expect(s.aggregate).toBeNull();
    expect(s.level).toBeNull();
    expect(s.meanComfort).toBeNull();
    expect(s.meanTier).toBeNull();
  });

  it("level band edges: below first min is null, at a min is that level, above top is top", () => {
    // BANDS starts at min 0, so "below first min" needs a list that starts higher.
    const HIGH_BANDS: GardenLevelBand[] = [
      { level: 2, min: 50 },
      { level: 3, min: 80 },
    ];
    expect(levelForAggregate(49.9, HIGH_BANDS)).toBeNull();
    expect(levelForAggregate(50, BANDS)).toBe(2);
    expect(levelForAggregate(80, BANDS)).toBe(3);
    expect(levelForAggregate(100, BANDS)).toBe(3);
  });

  it("no bands supplied: aggregate exists, level stays null (levels are never defaulted)", () => {
    const s = gardenLevelSummary({ comforts: [90], tiers: [] });
    expect(s.aggregate).toBe(90);
    expect(s.level).toBeNull();
    expect(levelForAggregate(90, [])).toBeNull();
    expect(levelForAggregate(null, BANDS)).toBeNull();
  });

  it("single-sided inputs ignore the other side's weight", () => {
    const s = gardenLevelSummary({
      comforts: [40],
      tiers: [],
      comfortWeight: 0,
      tierWeight: 0,
    });
    // No tier side exists, so zero weights are not an error here.
    expect(s.aggregate).toBe(40);
  });

  it("fails loudly on out-of-range comfort", () => {
    expect(() => gardenLevelSummary({ comforts: [101], tiers: [] })).toThrow();
    expect(() => gardenLevelSummary({ comforts: [-1], tiers: [] })).toThrow();
  });

  it("fails loudly on non-integer or negative tiers", () => {
    expect(() =>
      gardenLevelSummary({ comforts: [], tiers: [1.5], tierMax: 4 }),
    ).toThrow();
    expect(() =>
      gardenLevelSummary({ comforts: [], tiers: [-1], tierMax: 4 }),
    ).toThrow();
  });

  it("fails loudly when tiers arrive without a usable tierMax", () => {
    expect(() => gardenLevelSummary({ comforts: [], tiers: [1] })).toThrow();
    expect(() =>
      gardenLevelSummary({ comforts: [], tiers: [1], tierMax: 0 }),
    ).toThrow();
  });

  it("fails loudly when the mean tier exceeds the caller scale", () => {
    expect(() =>
      gardenLevelSummary({ comforts: [], tiers: [5], tierMax: 4 }),
    ).toThrow();
  });

  it("fails loudly when both weights are 0 with both sides present", () => {
    expect(() =>
      gardenLevelSummary({
        comforts: [50],
        tiers: [1],
        tierMax: 4,
        comfortWeight: 0,
        tierWeight: 0,
      }),
    ).toThrow();
  });

  it("fails loudly on bands that do not ascend strictly", () => {
    expect(() =>
      gardenLevelSummary({
        comforts: [50],
        tiers: [],
        bands: [
          { level: 1, min: 50 },
          { level: 2, min: 50 },
        ],
      }),
    ).toThrow();
    expect(() =>
      gardenLevelSummary({
        comforts: [50],
        tiers: [],
        bands: [
          { level: 2, min: 0 },
          { level: 2, min: 50 },
        ],
      }),
    ).toThrow();
    expect(() =>
      gardenLevelSummary({
        comforts: [50],
        tiers: [],
        bands: [{ level: 1, min: 101 }],
      }),
    ).toThrow();
  });

  it("is pure: inputs are not mutated", () => {
    const comforts = [60, 80];
    const tiers = [1, 3];
    const bands: GardenLevelBand[] = [
      { level: 1, min: 0 },
      { level: 2, min: 50 },
    ];
    gardenLevelSummary({ comforts, tiers, tierMax: 4, bands });
    expect(comforts).toEqual([60, 80]);
    expect(tiers).toEqual([1, 3]);
    expect(bands).toEqual([
      { level: 1, min: 0 },
      { level: 2, min: 50 },
    ]);
  });

  it("staging locks: no live module imports the level module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    expect(wiring).not.toContain("garden-level");
    expect(view).not.toContain("garden-level");
    expect(phase4).not.toContain("garden-level");
  });
});
