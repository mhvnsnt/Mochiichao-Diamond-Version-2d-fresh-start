// Tests for gap-fill S13 slice 1: the season overlay transform.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EncounterTable } from "./encounters";
import {
  applySeasonOverlay,
  applySeasonOverlayFor,
  overlayForSeason,
  seasonOverlayTableCanRoll,
  type SeasonOverlay,
} from "./seasonOverlay";

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

const SPRING: SeasonOverlay = {
  season: "spring",
  multipliers: { "038": 2, "019": 0 },
};

describe("applySeasonOverlay", () => {
  it("a null overlay returns an equal-weight copy, never the input objects", () => {
    const input = table();
    const out = applySeasonOverlay(input, null);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
    expect(out.slots[0]).not.toBe(input.slots[0]);
    expect(input.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("scales weights by hand-computed multipliers and leaves others alone", () => {
    const out = applySeasonOverlay(table(), SPRING);
    expect(out.slots.map((s) => s.weight)).toEqual([20, 20]);
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004"]);
  });
  it("a fractional multiplier scales down exactly", () => {
    const out = applySeasonOverlay(table(), {
      season: "summer",
      multipliers: { "004": 0.5 },
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 10, 30]);
  });
  it("multiplier 0 removes the slot and preserves the order of the rest", () => {
    const out = applySeasonOverlay(table(), SPRING);
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004"]);
  });
  it("an entry for a species absent from this table is inert, not an error", () => {
    const out = applySeasonOverlay(table(), {
      season: "autumn",
      multipliers: { "999": 3 },
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("a negative multiplier throws loudly naming the species", () => {
    expect(() =>
      applySeasonOverlay(table(), {
        season: "winter",
        multipliers: { "004": -1 },
      }),
    ).toThrowError(/004/);
  });
  it("NaN and Infinity multipliers throw loudly, never clamp", () => {
    expect(() =>
      applySeasonOverlay(table(), {
        season: "winter",
        multipliers: { "038": Number.NaN },
      }),
    ).toThrowError(/038/);
    expect(() =>
      applySeasonOverlay(table(), {
        season: "winter",
        multipliers: { "038": Number.POSITIVE_INFINITY },
      }),
    ).toThrowError(/038/);
  });
  it("the input table is never mutated, even when slots are dropped", () => {
    const input = table();
    const before = JSON.stringify(input);
    applySeasonOverlay(input, SPRING);
    expect(JSON.stringify(input)).toBe(before);
  });
  it("dropping every slot yields an empty, unrollable table", () => {
    const out = applySeasonOverlay(table(), {
      season: "winter",
      multipliers: { "038": 0, "004": 0, "019": 0 },
    });
    expect(out.slots).toEqual([]);
    expect(seasonOverlayTableCanRoll(out)).toBe(false);
  });
  it("table identity fields and the rate ride through unchanged", () => {
    const out = applySeasonOverlay(table(), SPRING);
    expect(out.areaId).toBe("meadow-route-01");
    expect(out.mapId).toBe("meadow-route-01");
    expect(out.method).toBe("grass");
    expect(out.rate).toBe(0.15);
  });
});

describe("overlayForSeason / applySeasonOverlayFor", () => {
  it("finds the matching season and returns null when none is supplied", () => {
    expect(overlayForSeason([SPRING], "spring")).toBe(SPRING);
    expect(overlayForSeason([SPRING], "winter")).toBeNull();
  });
  it("applies the matching season and copies unchanged for another season", () => {
    const applied = applySeasonOverlayFor(table(), [SPRING], "spring");
    expect(applied.slots.map((s) => s.weight)).toEqual([20, 20]);
    const other = applySeasonOverlayFor(table(), [SPRING], "winter");
    expect(other.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
    expect(other).not.toBe(table());
  });
});

describe("seasonOverlayTableCanRoll", () => {
  it("a transformed table with live slots can roll", () => {
    expect(seasonOverlayTableCanRoll(applySeasonOverlay(table(), SPRING))).toBe(true);
  });
  it("an empty table cannot roll", () => {
    expect(seasonOverlayTableCanRoll({ ...table(), slots: [] })).toBe(false);
  });
});

describe("S13 slice-4 adoption lock (retires the slice-1 staging lock)", () => {
  it("the roll module adopts the transform: encounters.ts imports it", () => {
    const src = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(src).toContain("seasonOverlay");
  });
});
