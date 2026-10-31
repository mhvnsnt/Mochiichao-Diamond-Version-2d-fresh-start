// Tests for gap-fill S13 slice 3: the battle-pressure tally.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EncounterTable } from "./encounters";
import { applyBattlePressure, type BattlePressure } from "./battlePressure";
import {
  decayBattlePressure,
  decayBattlePressures,
  pressureLevelsFromCounts,
  tallyPressureEvents,
  type PressureBand,
  type PressureEvent,
} from "./battlePressureTally";

const BANDS: PressureBand[] = [
  { minEvents: 1, level: 1 },
  { minEvents: 3, level: 2 },
  { minEvents: 6, level: 4 },
];

function events(): PressureEvent[] {
  return [
    { areaId: "meadow-route-01", speciesId: "038", dayIndex: 2 },
    { areaId: "meadow-route-01", speciesId: "038", dayIndex: 3 },
    { areaId: "meadow-route-01", speciesId: "038", dayIndex: 9 },
    { areaId: "meadow-route-01", speciesId: "004", dayIndex: 3 },
    { areaId: "pond-route-01", speciesId: "038", dayIndex: 3 },
  ];
}

describe("tallyPressureEvents", () => {
  it("counts per area and species, sorted by area then species", () => {
    const out = tallyPressureEvents(events(), { startDay: 0, endDay: 10 });
    expect(out).toEqual([
      { areaId: "meadow-route-01", speciesId: "004", events: 1 },
      { areaId: "meadow-route-01", speciesId: "038", events: 3 },
      { areaId: "pond-route-01", speciesId: "038", events: 1 },
    ]);
  });
  it("the window is inclusive at both ends and excludes outside events", () => {
    const out = tallyPressureEvents(events(), { startDay: 3, endDay: 3 });
    expect(out).toEqual([
      { areaId: "meadow-route-01", speciesId: "004", events: 1 },
      { areaId: "meadow-route-01", speciesId: "038", events: 1 },
      { areaId: "pond-route-01", speciesId: "038", events: 1 },
    ]);
  });
  it("empty events tally to an empty array", () => {
    expect(tallyPressureEvents([], { startDay: 0, endDay: 5 })).toEqual([]);
  });
  it("a non-integer or negative dayIndex throws loudly naming the species", () => {
    expect(() =>
      tallyPressureEvents(
        [{ areaId: "meadow-route-01", speciesId: "038", dayIndex: 1.5 }],
        { startDay: 0, endDay: 5 },
      ),
    ).toThrowError(/038/);
    expect(() =>
      tallyPressureEvents(
        [{ areaId: "meadow-route-01", speciesId: "038", dayIndex: -1 }],
        { startDay: 0, endDay: 5 },
      ),
    ).toThrowError(/038/);
  });
  it("an inverted or non-integer window throws loudly", () => {
    expect(() =>
      tallyPressureEvents(events(), { startDay: 5, endDay: 2 }),
    ).toThrowError(/startDay/);
    expect(() =>
      tallyPressureEvents(events(), { startDay: 0, endDay: 2.5 }),
    ).toThrowError(/endDay/);
  });
  it("the input events are never mutated", () => {
    const input = events();
    const before = JSON.stringify(input);
    tallyPressureEvents(input, { startDay: 0, endDay: 10 });
    expect(JSON.stringify(input)).toBe(before);
  });
});

describe("pressureLevelsFromCounts", () => {
  it("bands are thresholds: below, at, between, and above the top band", () => {
    const out = pressureLevelsFromCounts(
      [
        { areaId: "meadow-route-01", speciesId: "000", events: 0 },
        { areaId: "meadow-route-01", speciesId: "004", events: 1 },
        { areaId: "meadow-route-01", speciesId: "038", events: 4 },
        { areaId: "meadow-route-01", speciesId: "019", events: 9 },
      ],
      BANDS,
    );
    // 000: below every band -> omitted; 004: 1 -> 1; 038: 4 -> 2;
    // 019: 9 -> 4 (top band, not beyond it).
    expect(out).toEqual([
      {
        areaId: "meadow-route-01",
        pressures: { "004": 1, "038": 2, "019": 4 },
      },
    ]);
  });
  it("empty bands produce no pressure, and a band for an uncounted species is inert", () => {
    expect(pressureLevelsFromCounts(
      [{ areaId: "meadow-route-01", speciesId: "038", events: 2 }],
      [],
    )).toEqual([]);
    // The bands below mention only species with no counts; nothing
    // is invented for them.
    expect(pressureLevelsFromCounts([], BANDS)).toEqual([]);
  });
  it("bad bands throw loudly: duplicate min, negative min, bad level", () => {
    const counts = [{ areaId: "meadow-route-01", speciesId: "038", events: 2 }];
    expect(() =>
      pressureLevelsFromCounts(counts, [
        { minEvents: 1, level: 1 },
        { minEvents: 1, level: 2 },
      ]),
    ).toThrowError(/duplicate/);
    expect(() =>
      pressureLevelsFromCounts(counts, [{ minEvents: -1, level: 1 }]),
    ).toThrowError(/minEvents/);
    expect(() =>
      pressureLevelsFromCounts(counts, [{ minEvents: 1, level: -1 }]),
    ).toThrowError(/minEvents 1/);
    expect(() =>
      pressureLevelsFromCounts(counts, [{ minEvents: 1, level: Number.NaN }]),
    ).toThrowError(/minEvents 1/);
  });
  it("the inputs are never mutated, bands need not arrive sorted", () => {
    const counts = [{ areaId: "meadow-route-01", speciesId: "038", events: 4 }];
    const bands = [...BANDS].reverse();
    const before = JSON.stringify(bands);
    const out = pressureLevelsFromCounts(counts, bands);
    expect(out).toEqual([{ areaId: "meadow-route-01", pressures: { "038": 2 } }]);
    expect(JSON.stringify(bands)).toBe(before);
  });
});

describe("decayBattlePressure", () => {
  const PRESSURE: BattlePressure = {
    areaId: "meadow-route-01",
    pressures: { "038": 4, "004": 1 },
  };
  it("zero ticks and zero perTick are identity copies, never the input", () => {
    const a = decayBattlePressure(PRESSURE, 0, 1);
    const b = decayBattlePressure(PRESSURE, 3, 0);
    expect(a).toEqual(PRESSURE);
    expect(b).toEqual(PRESSURE);
    expect(a).not.toBe(PRESSURE);
    expect(a.pressures).not.toBe(PRESSURE.pressures);
  });
  it("decay is linear and a species decayed to zero leaves the record", () => {
    // 038: 4 - 2*1 = 2; 004: 1 - 2*1 = -1 -> floored out.
    const out = decayBattlePressure(PRESSURE, 2, 1);
    expect(out).toEqual({ areaId: "meadow-route-01", pressures: { "038": 2 } });
    // Exact-to-zero also leaves: 004: 1 - 1*1 = 0.
    const exact = decayBattlePressure(PRESSURE, 1, 1);
    expect(exact).toEqual({ areaId: "meadow-route-01", pressures: { "038": 3 } });
  });
  it("bad decay inputs throw loudly, and the input is never mutated", () => {
    expect(() => decayBattlePressure(PRESSURE, -1, 1)).toThrowError(/ticks/);
    expect(() => decayBattlePressure(PRESSURE, 1.5, 1)).toThrowError(/ticks/);
    expect(() => decayBattlePressure(PRESSURE, 1, -1)).toThrowError(/perTick/);
    expect(() => decayBattlePressure(PRESSURE, 1, Number.NaN)).toThrowError(/perTick/);
    const before = JSON.stringify(PRESSURE);
    decayBattlePressure(PRESSURE, 1, 1);
    expect(JSON.stringify(PRESSURE)).toBe(before);
  });
  it("decayBattlePressures decays every area with the same ticks", () => {
    const out = decayBattlePressures(
      [PRESSURE, { areaId: "pond-route-01", pressures: { "019": 3 } }],
      1,
      1,
    );
    expect(out).toEqual([
      { areaId: "meadow-route-01", pressures: { "038": 3 } },
      { areaId: "pond-route-01", pressures: { "019": 2 } },
    ]);
  });
});

describe("tally -> transform, in two separate calls", () => {
  it("a tallied pressure feeds slice 2's transform and decays the weight", () => {
    const table: EncounterTable = {
      areaId: "meadow-route-01",
      mapId: "meadow-route-01",
      method: "grass",
      rate: 0.15,
      timeOfDay: null,
      weather: null,
      slots: [
        { speciesId: "038", minLevel: 4, maxLevel: 6, weight: 10 },
        { speciesId: "004", minLevel: 5, maxLevel: 7, weight: 20 },
      ],
    };
    const counts = tallyPressureEvents(events(), { startDay: 0, endDay: 10 });
    const pressures = pressureLevelsFromCounts(counts, BANDS);
    // Meadow 038: 3 events -> level 2; 004: 1 event -> level 1.
    expect(pressures).toEqual([
      {
        areaId: "meadow-route-01",
        pressures: { "004": 1, "038": 2 },
      },
      { areaId: "pond-route-01", pressures: { "038": 1 } },
    ]);
    const out = applyBattlePressure(table, pressures[0]);
    // 038: 10 / (1+2) = 10/3; 004: 20 / (1+1) = 10.
    expect(out.slots.map((s) => s.weight)).toEqual([10 / 3, 10]);
  });
});

describe("S13 slice-3 staging locks", () => {
  it("no host adopts the tally yet: encounters.ts does not import it", () => {
    const src = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(src).not.toContain("battlePressureTally");
  });
  it("tally and transform stay separate: the tally module never calls the transform", () => {
    const src = readFileSync(
      new URL("./battlePressureTally.ts", import.meta.url),
      "utf8",
    );
    expect(src).not.toContain("applyBattlePressure");
  });
});
