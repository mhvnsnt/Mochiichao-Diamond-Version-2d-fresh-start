// Tests for gap-fill S13 slice 5: the battle-pressure writer —
// stored battle facts (gameStore) + the host read over them.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { useGameStore } from "../store/gameStore";
import {
  pressuresFromPressureEvents,
  type PressureBand,
  type PressureEvent,
} from "./battlePressureTally";

const BANDS: PressureBand[] = [
  { minEvents: 1, level: 1 },
  { minEvents: 3, level: 2 },
];

function events(): PressureEvent[] {
  return [
    { areaId: "route_1", speciesId: "038", dayIndex: 1 },
    { areaId: "route_1", speciesId: "038", dayIndex: 2 },
    { areaId: "route_1", speciesId: "038", dayIndex: 3 },
    { areaId: "route_1", speciesId: "004", dayIndex: 2 },
    { areaId: "route_2", speciesId: "038", dayIndex: 2 },
  ];
}

function reset(): void {
  useGameStore.setState({ pressureEvents: [] });
}

describe("appendPressureEvent (store writer)", () => {
  it("starts empty and grows in append order", () => {
    reset();
    expect(useGameStore.getState().pressureEvents).toEqual([]);
    for (const ev of events()) {
      useGameStore.getState().appendPressureEvent(ev);
    }
    expect(useGameStore.getState().pressureEvents).toEqual(events());
  });

  it("stores a copy: later mutation of the caller's object cannot corrupt the ledger", () => {
    reset();
    const ev: PressureEvent = { areaId: "route_1", speciesId: "038", dayIndex: 4 };
    useGameStore.getState().appendPressureEvent(ev);
    ev.dayIndex = 99;
    expect(useGameStore.getState().pressureEvents).toEqual([
      { areaId: "route_1", speciesId: "038", dayIndex: 4 },
    ]);
  });

  it("refuses invalid facts loudly and leaves the ledger unchanged", () => {
    reset();
    useGameStore.getState().appendPressureEvent({
      areaId: "route_1",
      speciesId: "038",
      dayIndex: 1,
    });
    const before = useGameStore.getState().pressureEvents;
    expect(() =>
      useGameStore.getState().appendPressureEvent({
        areaId: "",
        speciesId: "038",
        dayIndex: 1,
      }),
    ).toThrowError(/empty id/);
    expect(() =>
      useGameStore.getState().appendPressureEvent({
        areaId: "route_1",
        speciesId: "038",
        dayIndex: -1,
      }),
    ).toThrowError(/dayIndex/);
    expect(useGameStore.getState().pressureEvents).toBe(before);
    expect(useGameStore.getState().pressureEvents).toHaveLength(1);
  });

  it("identical facts count twice: the ledger records facts, it does not dedupe them", () => {
    reset();
    const ev: PressureEvent = { areaId: "route_1", speciesId: "038", dayIndex: 5 };
    useGameStore.getState().appendPressureEvent(ev);
    useGameStore.getState().appendPressureEvent({ ...ev });
    expect(
      useGameStore.getState().battlePressures({ startDay: 0, endDay: 10 }, [
        { minEvents: 2, level: 3 },
      ]),
    ).toEqual([{ areaId: "route_1", pressures: { "038": 3 } }]);
  });
});

describe("battlePressures (store host read)", () => {
  it("is the tally through the caller's bands, hand-computed", () => {
    reset();
    useGameStore.setState({ pressureEvents: events() });
    expect(
      useGameStore.getState().battlePressures({ startDay: 0, endDay: 10 }, BANDS),
    ).toEqual([
      { areaId: "route_1", pressures: { "004": 1, "038": 2 } },
      { areaId: "route_2", pressures: { "038": 1 } },
    ]);
  });

  it("respects the window: out-of-window facts produce no record", () => {
    reset();
    useGameStore.setState({ pressureEvents: events() });
    expect(
      useGameStore.getState().battlePressures({ startDay: 0, endDay: 1 }, BANDS),
    ).toEqual([{ areaId: "route_1", pressures: { "038": 1 } }]);
  });

  it("agrees exactly with the pure host composition over the same facts", () => {
    reset();
    useGameStore.setState({ pressureEvents: events() });
    const window = { startDay: 0, endDay: 10 };
    expect(useGameStore.getState().battlePressures(window, BANDS)).toEqual(
      pressuresFromPressureEvents(events(), window, BANDS),
    );
  });

  it("stores nothing and publishes nothing: the read is a derivation", () => {
    reset();
    useGameStore.setState({ pressureEvents: events() });
    const before = useGameStore.getState().pressureEvents;
    useGameStore.getState().battlePressures({ startDay: 0, endDay: 10 }, BANDS);
    expect(useGameStore.getState().pressureEvents).toBe(before);
  });
});

describe("S13 slice-5 staging locks", () => {
  it("the store carries the writer", () => {
    const src = readFileSync(new URL("../store/gameStore.ts", import.meta.url), "utf8");
    expect(src).toContain("pressureEvents");
    expect(src).toContain("appendPressureEvent");
    expect(src).toContain("battlePressures");
  });

  it("the tally carries the one-call host composition", () => {
    const src = readFileSync(new URL("./battlePressureTally.ts", import.meta.url), "utf8");
    expect(src).toContain("pressuresFromPressureEvents");
    expect(src).toContain("assertValidPressureEvent");
  });

  it("no battle-end caller exists yet: WorldEngine does not append pressure events", () => {
    const src = readFileSync(new URL("../world/WorldEngine.tsx", import.meta.url), "utf8");
    expect(src).not.toContain("appendPressureEvent");
  });
});
