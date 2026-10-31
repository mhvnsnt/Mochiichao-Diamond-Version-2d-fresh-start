// Tests for gap-fill S13 slice 4: roll-site adoption of the S13
// transforms in encounters.ts (season overlay, then battle
// pressure, in that fixed order). All weights below are
// hand-computed; no overlay, band, window, or decay value is
// authored here — every transform input is caller-supplied.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { EncounterTable } from "./encounters";
import {
  applyRollOverlays,
  pickFromTableWithOverlays,
  rollEncounterStepWithOverlays,
  rollOverlaysTableCanRoll,
} from "./encounters";
import type { BattlePressure } from "./battlePressure";
import {
  pressureLevelsFromCounts,
  tallyPressureEvents,
} from "./battlePressureTally";
import type { SeasonOverlay } from "./seasonOverlay";

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

const MEADOW_PRESSURE: BattlePressure = {
  areaId: "meadow-route-01",
  pressures: { "038": 2, "004": 1 },
};

/** RNG that returns the given values in order, then repeats the last. */
function seqRng(values: number[]): () => number {
  let i = 0;
  let calls = 0;
  const fn = () => {
    calls += 1;
    const value = values[Math.min(i, values.length - 1)];
    i += 1;
    return value;
  };
  (fn as unknown as { calls: () => number }).calls = () => calls;
  return fn;
}

function callCount(fn: () => number): number {
  return (fn as unknown as { calls: () => number }).calls();
}

describe("applyRollOverlays", () => {
  it("no opts returns an equal-weight copy, never the input objects", () => {
    const input = table();
    const out = applyRollOverlays(input);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
    expect(out.slots[0]).not.toBe(input.slots[0]);
    expect(input.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("season only: hand-computed multipliers, zeroed slot removed", () => {
    const out = applyRollOverlays(table(), {
      overlays: [SPRING],
      season: "spring",
    });
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004"]);
    expect(out.slots.map((s) => s.weight)).toEqual([20, 20]);
  });
  it("pressure only: hand-computed decay 10/(1+2) and 20/(1+1)", () => {
    const out = applyRollOverlays(table(), { pressures: [MEADOW_PRESSURE] });
    expect(out.slots.map((s) => s.weight)).toEqual([10 / 3, 10, 30]);
  });
  it("both, season then pressure: 038 is 10*2/(1+2), 004 is 20/(1+1), 019 gone", () => {
    const out = applyRollOverlays(table(), {
      overlays: [SPRING],
      season: "spring",
      pressures: [MEADOW_PRESSURE],
    });
    expect(out.slots.map((s) => s.speciesId)).toEqual(["038", "004"]);
    expect(out.slots.map((s) => s.weight)).toEqual([20 / 3, 10]);
  });
  it("overlays supplied without a season are ignored, not applied", () => {
    const out = applyRollOverlays(table(), { overlays: [SPRING] });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("a season with no matching overlay copies unchanged", () => {
    const out = applyRollOverlays(table(), {
      overlays: [SPRING],
      season: "winter",
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("a pressure entry for a species absent from the table is inert", () => {
    const out = applyRollOverlays(table(), {
      pressures: [{ areaId: "meadow-route-01", pressures: { "999": 5 } }],
    });
    expect(out.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
  });
  it("a pressure record for another area is inert through the area lookup", () => {
    // applyBattlePressureFor looks pressure up by the table's own
    // areaId, so a foreign record never reaches the transform's
    // mismatch throw (that throw is proven in slice 2's own tests).
    // With a matching record beside it, only the matching one applies.
    const foreignOnly = applyRollOverlays(table(), {
      pressures: [{ areaId: "pond-route-01", pressures: { "038": 9 } }],
    });
    expect(foreignOnly.slots.map((s) => s.weight)).toEqual([10, 20, 30]);
    const mixed = applyRollOverlays(table(), {
      pressures: [
        { areaId: "pond-route-01", pressures: { "038": 9 } },
        MEADOW_PRESSURE,
      ],
    });
    expect(mixed.slots.map((s) => s.weight)).toEqual([10 / 3, 10, 30]);
  });
  it("pressure on a dark-forest table throws loudly naming the area", () => {
    const dark: EncounterTable = {
      ...table(),
      areaId: "dark-forest",
      mapId: "dark-forest",
      slots: [{ speciesId: "038", minLevel: 4, maxLevel: 6, weight: 10 }],
    };
    expect(() =>
      applyRollOverlays(dark, {
        pressures: [{ areaId: "dark-forest", pressures: { "038": 1 } }],
      }),
    ).toThrowError(/dark-forest/);
  });
  it("the input table is never mutated through the composed path", () => {
    const input = table();
    const before = JSON.stringify(input);
    applyRollOverlays(input, {
      overlays: [SPRING],
      season: "spring",
      pressures: [MEADOW_PRESSURE],
    });
    expect(JSON.stringify(input)).toBe(before);
  });
  it("table identity fields and the rate ride through unchanged", () => {
    const out = applyRollOverlays(table(), {
      overlays: [SPRING],
      season: "spring",
      pressures: [MEADOW_PRESSURE],
    });
    expect(out.areaId).toBe("meadow-route-01");
    expect(out.mapId).toBe("meadow-route-01");
    expect(out.method).toBe("grass");
    expect(out.rate).toBe(0.15);
  });
  it("tally -> bands -> roll composition, hand-computed (slice-3 numbers)", () => {
    const events = [
      { areaId: "meadow-route-01", speciesId: "038", dayIndex: 1 },
      { areaId: "meadow-route-01", speciesId: "038", dayIndex: 1 },
      { areaId: "meadow-route-01", speciesId: "038", dayIndex: 2 },
      { areaId: "meadow-route-01", speciesId: "004", dayIndex: 3 },
    ];
    const counts = tallyPressureEvents(events, { startDay: 0, endDay: 3 });
    const pressures = pressureLevelsFromCounts(counts, [
      { minEvents: 1, level: 1 },
      { minEvents: 3, level: 2 },
    ]);
    // 038: 3 events -> level 2 -> 10/3; 004: 1 event -> level 1 -> 10.
    const out = applyRollOverlays(table(), { pressures });
    expect(out.slots.map((s) => s.weight)).toEqual([10 / 3, 10, 30]);
  });
});

describe("pickFromTableWithOverlays", () => {
  it("picks the first slot on a zero roll, level from the slot band", () => {
    const pick = pickFromTableWithOverlays(table(), {}, seqRng([0, 0]));
    expect(pick).toEqual({ speciesId: "038", level: 4, slotIndex: 0 });
  });
  it("picks over overlaid weights: near-1 roll lands on the last live slot", () => {
    const pick = pickFromTableWithOverlays(
      table(),
      { overlays: [SPRING], season: "spring", pressures: [MEADOW_PRESSURE] },
      seqRng([0.999, 0]),
    );
    expect(pick.speciesId).toBe("004");
    expect(pick.slotIndex).toBe(1);
    expect(pick.level).toBe(5);
  });
  it("throws loudly naming the area when overlays leave no live slot", () => {
    expect(() =>
      pickFromTableWithOverlays(
        table(),
        {
          overlays: [
            {
              season: "winter",
              multipliers: { "038": 0, "004": 0, "019": 0 },
            },
          ],
          season: "winter",
        },
        seqRng([0, 0]),
      ),
    ).toThrowError(/meadow-route-01/);
  });
  it("an empty table cannot roll through the overlaid pick", () => {
    expect(rollOverlaysTableCanRoll({ ...table(), slots: [] })).toBe(false);
    expect(() =>
      pickFromTableWithOverlays({ ...table(), slots: [] }, {}, seqRng([0, 0])),
    ).toThrowError(/meadow-route-01/);
  });
});

describe("rollEncounterStepWithOverlays", () => {
  it("a table without an authored rate never fires, consuming no RNG", () => {
    const rateless = { ...table(), rate: undefined };
    const rng = seqRng([0, 0, 0]);
    expect(rollEncounterStepWithOverlays(rateless, {}, rng)).toBeNull();
    expect(callCount(rng)).toBe(0);
  });
  it("a failed rate roll returns null after exactly one RNG call", () => {
    const rng = seqRng([0.5, 0, 0]);
    expect(rollEncounterStepWithOverlays(table(), {}, rng)).toBeNull();
    expect(callCount(rng)).toBe(1);
  });
  it("a passed rate roll picks over the overlaid table", () => {
    const rng = seqRng([0, 0, 0]);
    const pick = rollEncounterStepWithOverlays(
      table(),
      { overlays: [SPRING], season: "spring" },
      rng,
    );
    expect(pick).toEqual({ speciesId: "038", level: 4, slotIndex: 0 });
  });
  it("a passed rate roll with no live slot throws before further RNG", () => {
    const rng = seqRng([0, 0, 0]);
    expect(() =>
      rollEncounterStepWithOverlays(
        table(),
        {
          overlays: [
            {
              season: "winter",
              multipliers: { "038": 0, "004": 0, "019": 0 },
            },
          ],
          season: "winter",
        },
        rng,
      ),
    ).toThrowError(/meadow-route-01/);
    expect(callCount(rng)).toBe(1);
  });
});

describe("S13 slice-4 adoption locks", () => {
  it("the roll module adopts both transforms: encounters.ts imports them", () => {
    const src = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(src).toContain("seasonOverlay");
    expect(src).toContain("battlePressure");
  });
  it("the tally stays caller-side: encounters.ts does not import it", () => {
    const src = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(src).not.toContain("battlePressureTally");
  });
});
