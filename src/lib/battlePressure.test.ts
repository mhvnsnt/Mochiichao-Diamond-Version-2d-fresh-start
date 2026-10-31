// Tests for gap-fill S13 slice 2: the battle-pressure transform.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EncounterTable } from "./encounters";
import {
  applyBattlePressure,
  applyBattlePressureFor,
  battlePressureTableCanRoll,
  pressureForArea,
  type BattlePressure,
} from "./battlePressure";
import { applySeasonOverlay, type SeasonOverlay } from "./seasonOverlay";

function table(): EncounterTable {
  return {
    areaId: "meadow-route-01",
    mapId: "meadow-route-01",
    method: "grass",
    rate: 0.15,
    timeOfDay: null,
    weather: null,
    slots: [
      { speciesId: "038", minLevel: 4, maxLevel: 6, weight: 10 },
      { speciesId: "004", minLevel: 5, maxLevel: 7, weight: 20 },
      { speciesId: "019", minLevel: 3, maxLevel: 5, weight: 30 },
    ],
  };
}

const PRESSURE: BattlePressure = {
  areaId: "meadow-route-01",
  pressures: { "038": 1, "019": 3 },
};

describe("applyBattlePressure", () => {
  it("a null pressure returns an equal-weight copy, never the input objects", () => {
    const input = table();
    const out = applyBattlePressure(input, null);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
    expect(out.slots[0]).not.toBe(input.slots[0]);
    expect(input.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("decays by hand-computed 1/(1+pressure) and leaves others alone", () => {
    const out = applyBattlePressure(table(), PRESSURE);
    // 038: 10 / 2 = 5; 004: untouched 20; 019: 30 / 4 = 7.5.
    expect(out.slots.map((s) => s.weight)).toEqual([5, 20, 7.5]);
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004", "019"]);
  });
  it("pressure 0 is identity, and unpressured species' relative share rises", () => {
    const out = applyBattlePressure(table(), {
      areaId: "meadow-route-01",
      pressures: { "038": 0 },
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
    const pressed = applyBattlePressure(table(), PRESSURE);
    const total = pressed.slots.reduce((sum, s) => sum + s.weight, 0);
    // Unpressured 004: 20/60 before, 20/32.5 after — its share rises.
    expect(20 / total).toBeGreaterThan(20 / 60);
    expect(total).toBe(32.5);
  });
  it("pressure never removes a slot: heavy pressure decays toward rare, not zero", () => {
    const out = applyBattlePressure(table(), {
      areaId: "meadow-route-01",
      pressures: { "038": 100, "004": 100, "019": 100 },
    });
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004", "019"]);
    expect(out.slots.every((s) => s.weight > 0)).toBe(true);
    expect(battlePressureTableCanRoll(out)).toBe(true);
  });
  it("an entry for a species absent from this table is inert, not an error", () => {
    const out = applyBattlePressure(table(), {
      areaId: "meadow-route-01",
      pressures: { "999": 5 },
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("a negative pressure throws loudly naming the species", () => {
    expect(() =>
      applyBattlePressure(table(), {
        areaId: "meadow-route-01",
        pressures: { "004": -1 },
      }),
    ).toThrowError(/004/);
  });
  it("NaN and Infinity pressures throw loudly, never clamp", () => {
    expect(() =>
      applyBattlePressure(table(), {
        areaId: "meadow-route-01",
        pressures: { "038": Number.NaN },
      }),
    ).toThrowError(/038/);
    expect(() =>
      applyBattlePressure(table(), {
        areaId: "meadow-route-01",
        pressures: { "038": Number.POSITIVE_INFINITY },
      }),
    ).toThrowError(/038/);
  });
  it("the input table is never mutated", () => {
    const input = table();
    const before = JSON.stringify(input);
    applyBattlePressure(input, PRESSURE);
    expect(JSON.stringify(input)).toBe(before);
  });
  it("a pressure record for another area throws loudly naming both areas", () => {
    expect(() =>
      applyBattlePressure(table(), {
        areaId: "pond-route-01",
        pressures: { "038": 1 },
      }),
    ).toThrowError(/pond-route-01/);
    expect(() =>
      applyBattlePressure(table(), {
        areaId: "pond-route-01",
        pressures: { "038": 1 },
      }),
    ).toThrowError(/meadow-route-01/);
  });
  it("pressure on a dark-forest table throws, surface and depths alike", () => {
    const forest: EncounterTable = {
      ...table(),
      areaId: "dark-forest",
      mapId: "dark-forest",
      slots: [{ speciesId: "010", minLevel: 4, maxLevel: 6, weight: 10 }],
    };
    expect(() =>
      applyBattlePressure(forest, {
        areaId: "dark-forest",
        pressures: { "010": 1 },
      }),
    ).toThrowError(/dark-forest/);
    const empty: EncounterTable = { ...forest, slots: [] };
    expect(() =>
      applyBattlePressure(empty, {
        areaId: "dark-forest",
        pressures: { "010": 1 },
      }),
    ).toThrowError(/dark-forest/);
  });
  it("table identity fields and the rate ride through unchanged", () => {
    const out = applyBattlePressure(table(), PRESSURE);
    expect(out.areaId).toBe("meadow-route-01");
    expect(out.mapId).toBe("meadow-route-01");
    expect(out.method).toBe("grass");
    expect(out.rate).toBe(0.15);
  });
});

describe("pressureForArea / applyBattlePressureFor", () => {
  it("finds the matching area and returns null when none is supplied", () => {
    expect(pressureForArea([PRESSURE], "meadow-route-01")).toBe(PRESSURE);
    expect(pressureForArea([PRESSURE], "pond-route-01")).toBeNull();
  });
  it("applies the matching area and copies unchanged for another area", () => {
    const applied = applyBattlePressureFor(table(), [PRESSURE]);
    expect(applied.slots.map((s) => s.weight)).toEqual([5, 20, 7.5]);
    const other = applyBattlePressureFor(table(), [
      { areaId: "pond-route-01", pressures: { "038": 9 } },
    ]);
    expect(other.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
    expect(other).not.toBe(table());
  });
});

describe("season + pressure compose (separate transforms, same roll site)", () => {
  it("the two transforms commute: season then pressure equals pressure then season", () => {
    const season: SeasonOverlay = {
      season: "spring",
      multipliers: { "038": 2 },
    };
    const seasonFirst = applyBattlePressure(
      applySeasonOverlay(table(), season),
      PRESSURE,
    );
    const pressureFirst = applySeasonOverlay(
      applyBattlePressure(table(), PRESSURE),
      season,
    );
    expect(seasonFirst.slots.map((s) => s.weight)).toEqual([10, 20, 7.5]);
    expect(pressureFirst.slots.map((s) => s.weight)).toEqual([10, 20, 7.5]);
  });
});

describe("battlePressureTableCanRoll", () => {
  it("a transformed table with live slots can roll", () => {
    expect(battlePressureTableCanRoll(applyBattlePressure(table(), PRESSURE))).toBe(true);
  });
  it("an empty table cannot roll", () => {
    expect(battlePressureTableCanRoll({ ...table(), slots: [] })).toBe(false);
  });
});

describe("S13 slice-4 adoption lock (retires the slice-2 staging lock)", () => {
  it("the roll module adopts the transform: encounters.ts imports it", () => {
    const src = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(src).toContain("battlePressure");
  });
});
