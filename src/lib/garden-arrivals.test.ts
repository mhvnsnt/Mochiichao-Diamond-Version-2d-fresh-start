import { describe, expect, it } from "vitest";
import { arrivals, arrivalForCreature } from "./garden-arrivals";
import type { MovementRecord } from "./garden-movement";

function rec(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  to: string | null,
  at: number,
  from: string | null = null,
): MovementRecord {
  return { id, creatureId, verb, from, to, at };
}

const HOMES = ["home-a", "home-b"];

describe("garden-arrivals (B3 §2.2 Garden arrivals)", () => {
  it("empty log reads as no arrivals", () => {
    expect(arrivals([], HOMES)).toEqual([]);
    expect(arrivalForCreature([], "c-1", HOMES)).toBeNull();
  });

  it("non-arrival verbs never count as arrivals", () => {
    const log = [
      rec("m1", "c-1", "gift", "home-a", 1),
      rec("m2", "c-2", "transfer", "home-b", 2),
      rec("m3", "c-3", "release", "edge-x", 3),
    ];
    expect(arrivals(log, HOMES)).toEqual([]);
    expect(arrivalForCreature(log, "c-1", HOMES)).toBeNull();
  });

  it("single arrival: exact shape, resident at its Garden home", () => {
    const log = [rec("m1", "c-1", "garden-arrival", "home-a", 5)];
    expect(arrivals(log, HOMES)).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 5,
        lastArrivedAt: 5,
        arrivalCount: 1,
        lastArrivalRecordId: "m1",
        lastArrivalTo: "home-a",
        currentlyResident: true,
      },
    ]);
    expect(arrivalForCreature(log, "c-1", HOMES)).toEqual(
      arrivals(log, HOMES)[0],
    );
  });

  it("multiple arrivals: count, earliest first, latest last, stamp ties by log order", () => {
    const log = [
      rec("a1", "c-1", "garden-arrival", "home-x", 10),
      rec("a2", "c-1", "garden-arrival", "home-y", 4),
      rec("a3", "c-1", "garden-arrival", "home-b", 10),
    ];
    expect(arrivals(log, HOMES)).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 4,
        lastArrivedAt: 10,
        arrivalCount: 3,
        lastArrivalRecordId: "a3",
        lastArrivalTo: "home-b",
        currentlyResident: true,
      },
    ]);
  });

  it("order is first-arrival stamp order, log position breaking ties", () => {
    const log = [
      rec("b1", "c-b", "garden-arrival", "home-a", 5),
      rec("a1", "c-a", "garden-arrival", "home-a", 5),
      rec("c1", "c-c", "garden-arrival", "home-a", 3),
    ];
    expect(arrivals(log, HOMES).map((e) => e.creatureId)).toEqual([
      "c-c",
      "c-b",
      "c-a",
    ]);
  });

  it("departure after arrival ends residency but not the arrival record", () => {
    const log = [
      rec("m1", "c-1", "garden-arrival", "home-a", 1),
      rec("m2", "c-1", "garden-departure", "elsewhere", 2),
    ];
    expect(arrivals(log, HOMES)).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 1,
        lastArrivedAt: 1,
        arrivalCount: 1,
        lastArrivalRecordId: "m1",
        lastArrivalTo: "home-a",
        currentlyResident: false,
      },
    ]);
  });

  it("transfer to another Garden home keeps residency", () => {
    const log = [
      rec("m1", "c-1", "garden-arrival", "home-a", 1),
      rec("m2", "c-1", "transfer", "home-b", 2),
    ];
    expect(arrivals(log, HOMES)[0]?.currentlyResident).toBe(true);
  });

  it("arrival with no destination still lists, but is not resident", () => {
    const log = [rec("m1", "c-1", "garden-arrival", null, 1)];
    expect(arrivals(log, HOMES)).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 1,
        lastArrivedAt: 1,
        arrivalCount: 1,
        lastArrivalRecordId: "m1",
        lastArrivalTo: null,
        currentlyResident: false,
      },
    ]);
  });

  it("single read: null for never-arrived, even a resident by another verb", () => {
    const log = [rec("m1", "c-1", "gift", "home-a", 1)];
    expect(arrivalForCreature(log, "c-1", HOMES)).toBeNull();
    expect(arrivalForCreature(log, "c-absent", HOMES)).toBeNull();
  });

  it("garden homes accept a Set as well as an array", () => {
    const log = [rec("m1", "c-1", "garden-arrival", "home-a", 1)];
    expect(arrivals(log, new Set(["home-a"]))[0]?.currentlyResident).toBe(
      true,
    );
    expect(arrivals(log, ["home-a"])[0]?.currentlyResident).toBe(true);
  });

  it("loud failures: bad log, malformed record, duplicate id, bad homes, bad creature", () => {
    const good = [rec("m1", "c-1", "garden-arrival", "home-a", 1)];
    expect(() => arrivals("nope" as never, HOMES)).toThrow();
    expect(() =>
      arrivals([{ ...good[0], verb: "dance" } as never], HOMES),
    ).toThrow();
    expect(() =>
      arrivals([good[0], { ...good[0], at: 2 }], HOMES),
    ).toThrow(/duplicate/);
    expect(() => arrivals(good, [""])).toThrow();
    expect(() => arrivals(good, "home-a" as never)).toThrow();
    expect(() => arrivalForCreature(good, "", HOMES)).toThrow();
  });

  it("inputs untouched and outputs fresh", () => {
    const log = [
      rec("m1", "c-1", "garden-arrival", "home-a", 1),
      rec("m2", "c-1", "garden-arrival", "home-b", 2),
    ];
    const homes = ["home-a", "home-b"];
    const beforeLog = JSON.stringify(log);
    const beforeHomes = JSON.stringify(homes);
    const first = arrivals(log, homes);
    first[0]!.creatureId = "mutated";
    expect(JSON.stringify(log)).toBe(beforeLog);
    expect(JSON.stringify(homes)).toBe(beforeHomes);
    const second = arrivals(log, homes);
    expect(second[0]?.creatureId).toBe("c-1");
    expect(second[0]).not.toBe(first[0]);
  });

  it("exact result shape: no extra fields", () => {
    const log = [rec("m1", "c-1", "garden-arrival", "home-a", 1)];
    const entry = arrivals(log, HOMES)[0]!;
    expect(Object.keys(entry).sort()).toEqual(
      [
        "arrivalCount",
        "creatureId",
        "currentlyResident",
        "firstArrivedAt",
        "lastArrivalRecordId",
        "lastArrivalTo",
        "lastArrivedAt",
      ].sort(),
    );
  });

  it("caller-vocabulary ids: opaque tokens work unchanged", () => {
    const log = [rec("tok-m1", "tok-77", "garden-arrival", "tok-home", 1)];
    expect(arrivals(log, ["tok-home"])).toEqual([
      {
        creatureId: "tok-77",
        firstArrivedAt: 1,
        lastArrivedAt: 1,
        arrivalCount: 1,
        lastArrivalRecordId: "tok-m1",
        lastArrivalTo: "tok-home",
        currentlyResident: true,
      },
    ]);
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) =>
      fs.readFileSync(new URL(p, import.meta.url), "utf-8");
    const hosts = [
      "./garden-wiring.ts",
      "../components/views/GardenView.tsx",
      "./wiring/phase4-garden.ts",
      "./garden-register.ts",
      "./garden-story.ts",
      "./garden-arcs.ts",
      "./garden-migration.ts",
      "./garden-individual.ts",
      "./garden-teachers.ts",
      "./garden-movement.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-arrivals");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("./garden-arrivals.ts", import.meta.url),
      "utf-8",
    );
    for (const token of ["Mochii", "Sproutle", "player", "ranger"]) {
      expect(source.toLowerCase()).not.toContain(token);
    }
  });
});
