import { describe, expect, it } from "vitest";
import {
  inboundFromJourney,
  type JourneyInboundInputs,
} from "./garden-inbound";
import type { MovementRecord } from "./garden-movement";
import type { TeacherMeeting } from "./garden-teachers";

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

function meet(speciesId: string, at: number): TeacherMeeting {
  return { speciesId, at };
}

function base(): JourneyInboundInputs {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    teacherMapping: {},
    meetings: [],
  };
}

describe("garden-inbound (B3 §2.2 inbound bundle)", () => {
  it("empty inputs read as empty lists, not fabricated inputs", () => {
    expect(inboundFromJourney(base())).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
  });

  it("arrivals only: exact arrival shape, meetings empty", () => {
    const inputs = base();
    inputs.movementLog = [
      rec("m1", "c-1", "garden-arrival", "home-a", 5),
      rec("m2", "c-2", "garden-arrival", "home-b", 3),
    ];
    expect(inboundFromJourney(inputs)).toEqual({
      arrivals: [
        {
          creatureId: "c-2",
          firstArrivedAt: 3,
          lastArrivedAt: 3,
          arrivalCount: 1,
          lastArrivalRecordId: "m2",
          lastArrivalTo: "home-b",
          currentlyResident: true,
        },
        {
          creatureId: "c-1",
          firstArrivedAt: 5,
          lastArrivedAt: 5,
          arrivalCount: 1,
          lastArrivalRecordId: "m1",
          lastArrivalTo: "home-a",
          currentlyResident: true,
        },
      ],
      teachers: [],
      taughtAxes: [],
    });
  });

  it("teachers only: first-met order, union axes in first-appearance order", () => {
    const inputs = base();
    inputs.teacherMapping = {
      "sp-b": ["ax-2", "ax-1"],
      "sp-a": ["ax-1", "ax-3"],
    };
    inputs.meetings = [
      meet("sp-b", 9),
      meet("sp-a", 4),
      meet("sp-b", 12),
    ];
    expect(inboundFromJourney(inputs)).toEqual({
      arrivals: [],
      teachers: [
        { speciesId: "sp-a", firstMetAt: 4, axes: ["ax-1", "ax-3"] },
        { speciesId: "sp-b", firstMetAt: 9, axes: ["ax-2", "ax-1"] },
      ],
      taughtAxes: ["ax-1", "ax-3", "ax-2"],
    });
  });

  it("full bundle: arrivals and teachers side by side, neither derives the other", () => {
    const inputs = base();
    inputs.movementLog = [
      rec("m1", "c-1", "garden-arrival", "home-a", 5),
      rec("m2", "c-1", "garden-departure", null, 8),
    ];
    inputs.teacherMapping = { "sp-a": ["ax-1"] };
    inputs.meetings = [meet("sp-a", 2)];
    const result = inboundFromJourney(inputs);
    expect(result.arrivals).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 5,
        lastArrivedAt: 5,
        arrivalCount: 1,
        lastArrivalRecordId: "m1",
        lastArrivalTo: "home-a",
        currentlyResident: false,
      },
    ]);
    expect(result.teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 2, axes: ["ax-1"] },
    ]);
    expect(result.taughtAxes).toEqual(["ax-1"]);
    expect(Object.keys(result).sort()).toEqual([
      "arrivals",
      "taughtAxes",
      "teachers",
    ]);
  });

  it("non-arrival verbs never count, and a meeting never makes an arrival", () => {
    const inputs = base();
    inputs.movementLog = [
      rec("m1", "c-1", "gift", "home-a", 1),
      rec("m2", "c-2", "release", "edge-x", 2),
    ];
    inputs.teacherMapping = { "sp-a": ["ax-1"] };
    inputs.meetings = [meet("sp-a", 1)];
    const result = inboundFromJourney(inputs);
    expect(result.arrivals).toEqual([]);
    expect(result.teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 1, axes: ["ax-1"] },
    ]);
  });

  it("mapped-empty species appears with an empty list; unmapped species does not appear", () => {
    const inputs = base();
    inputs.teacherMapping = { "sp-empty": [] };
    inputs.meetings = [meet("sp-empty", 1), meet("sp-none", 2)];
    const result = inboundFromJourney(inputs);
    expect(result.teachers).toEqual([
      { speciesId: "sp-empty", firstMetAt: 1, axes: [] },
    ]);
    expect(result.taughtAxes).toEqual([]);
  });

  it("out-of-order meetings sort by stamp with log order breaking ties", () => {
    const inputs = base();
    inputs.teacherMapping = {
      "sp-a": ["ax-a"],
      "sp-b": ["ax-b"],
    };
    inputs.meetings = [
      meet("sp-b", 5),
      meet("sp-a", 5),
      meet("sp-a", 1),
    ];
    expect(inboundFromJourney(inputs).teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 1, axes: ["ax-a"] },
      { speciesId: "sp-b", firstMetAt: 5, axes: ["ax-b"] },
    ]);
  });

  it("Set/array homes parity and Map/record mapping parity", () => {
    const log = [rec("m1", "c-1", "garden-arrival", "home-a", 5)];
    const meetings = [meet("sp-a", 1)];
    const byArray = inboundFromJourney({
      movementLog: log,
      gardenHomes: ["home-a"],
      teacherMapping: { "sp-a": ["ax-1"] },
      meetings,
    });
    const bySet = inboundFromJourney({
      movementLog: log,
      gardenHomes: new Set(["home-a"]),
      teacherMapping: new Map([["sp-a", ["ax-1"]]]),
      meetings,
    });
    expect(bySet).toEqual(byArray);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const inputs = base();
    inputs.movementLog = [
      rec("tok-m1", "tok-77", "garden-arrival", "tok-home", 2),
    ];
    inputs.gardenHomes = ["tok-home"];
    inputs.teacherMapping = { "tok-sp": ["tok-axis"] };
    inputs.meetings = [meet("tok-sp", 1)];
    const result = inboundFromJourney(inputs);
    expect(result.arrivals[0]?.creatureId).toBe("tok-77");
    expect(result.arrivals[0]?.lastArrivalTo).toBe("tok-home");
    expect(result.teachers[0]?.speciesId).toBe("tok-sp");
    expect(result.taughtAxes).toEqual(["tok-axis"]);
  });

  it("loud failures: bad bundle, bad log, duplicate movement id", () => {
    expect(() => inboundFromJourney(null as never)).toThrow();
    expect(() =>
      inboundFromJourney({
        ...base(),
        movementLog: [
          { id: "m1", creatureId: "c-1", verb: "garden-arrival", from: null, to: "home-a", at: Number.NaN },
        ] as never,
      }),
    ).toThrow();
    expect(() =>
      inboundFromJourney({
        ...base(),
        movementLog: [
          rec("m1", "c-1", "garden-arrival", "home-a", 1),
          rec("m1", "c-2", "garden-arrival", "home-a", 2),
        ],
      }),
    ).toThrow();
  });

  it("loud failures: bad mapping, duplicate axis, bad meeting", () => {
    expect(() =>
      inboundFromJourney({
        ...base(),
        teacherMapping: { "sp-a": ["ax-1", "ax-1"] },
        meetings: [meet("sp-a", 1)],
      }),
    ).toThrow();
    expect(() =>
      inboundFromJourney({
        ...base(),
        teacherMapping: { "sp-a": ["ax-1"] },
        meetings: [{ speciesId: "sp-a", at: Number.NaN }],
      }),
    ).toThrow();
    expect(() =>
      inboundFromJourney({ ...base(), meetings: "nope" as never }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = base();
    inputs.movementLog = [
      rec("m1", "c-1", "garden-arrival", "home-a", 5),
    ];
    inputs.teacherMapping = { "sp-a": ["ax-1"] };
    inputs.meetings = [meet("sp-a", 1)];
    const before = JSON.stringify(inputs);
    const first = inboundFromJourney(inputs);
    first.arrivals[0]!.creatureId = "mutated";
    first.teachers[0]!.axes.push("mutated");
    first.taughtAxes.push("mutated");
    const second = inboundFromJourney(inputs);
    expect(second.arrivals[0]?.creatureId).toBe("c-1");
    expect(second.teachers[0]?.axes).toEqual(["ax-1"]);
    expect(second.taughtAxes).toEqual(["ax-1"]);
    expect(JSON.stringify(inputs)).toBe(before);
  });

  it("staging locks: no host or composed module imports the inbound bundle yet", async () => {
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
      "./garden-arrivals.ts",
      "./garden-research.ts",
      "./garden-discovery.ts",
      "./garden-bonds.ts",
      "./garden-decay.ts",
      "./garden-record.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-inbound");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("./garden-inbound.ts", import.meta.url),
      "utf-8",
    );
    for (const token of ["Mochii", "Sproutle", "player", "ranger"]) {
      expect(source.toLowerCase()).not.toContain(token);
    }
  });
});
