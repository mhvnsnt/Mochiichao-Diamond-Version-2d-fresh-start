import { describe, expect, it } from "vitest";
import {
  gardenJourney,
  type GardenJourneyInputs,
} from "./garden-journey";
import {
  inboundFromJourney,
  type JourneyInboundInputs,
} from "./garden-inbound";
import {
  gardenSnapshot,
  type GardenSnapshotInputs,
} from "./garden-snapshot";
import {
  bridgeRecordForCreature,
  type BridgeRecordInputs,
} from "./garden-record";
import type { AutonomousChangeInputs } from "./garden-autonomous";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { MovementRecord } from "./garden-movement";
import type { ResearchObservation } from "./garden-research";
import type { TeacherMeeting } from "./garden-teachers";

function movement(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  from: string | null,
  to: string | null,
  at: number,
): MovementRecord {
  return { id, creatureId, verb, from, to, at };
}

function obs(
  id: string,
  creatureId: string,
  kind: string,
  at: number,
): ResearchObservation {
  return { id, creatureId, kind, at };
}

function profile(): DecayProfile {
  return {
    rates: {
      party: { absence: 2 },
      storage: { absence: 1 },
      garden: { absence: 1 },
    },
    floors: { party: 5, storage: 0, garden: 3 },
  };
}

function ledger(): BondLedger {
  return [
    { creatureId: "c-1", keeperId: "k-a", value: 20 },
    { creatureId: "c-1", keeperId: "k-b", value: 8 },
    { creatureId: "c-other", keeperId: "k-a", value: 99 },
  ];
}

function facts(
  type: NeglectFact["type"],
  context: NeglectFact["context"],
  units: number,
): NeglectFact {
  return { type, context, units };
}

function autonomousBase(): AutonomousChangeInputs {
  return {
    residents: ["c-1", "c-2"],
    worldState: "key-a",
    migrationRules: [],
    storyBeats: [{ id: "b1", arrivals: [], departures: [] }],
    storyThroughBeatId: "b1",
    arcs: [{ residentId: "c-1", arc: "arc-a" }],
    arcBeats: [{ id: "a1", changes: [] }],
    arcThroughBeatId: "a1",
  };
}

function recordBase(): BridgeRecordInputs {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    bondLedger: [],
    decayProfile: profile(),
    factsByKeeper: {},
    observationLog: [],
  };
}

function inboundBase(): JourneyInboundInputs {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    teacherMapping: {},
    meetings: [],
  };
}

function snapshotBase(): GardenSnapshotInputs {
  return {
    checkIn: {
      log: [],
      news: { since: null },
      autonomous: autonomousBase(),
    },
    records: [],
  };
}

function base(): GardenJourneyInputs {
  return { inbound: inboundBase(), snapshot: snapshotBase() };
}

function fullRecordInputs(): BridgeRecordInputs {
  return {
    ...recordBase(),
    movementLog: [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
      movement("m2", "c-1", "transfer", "home-a", "home-b", 9),
    ],
    bondLedger: ledger(),
    factsByKeeper: {
      "k-a": [facts("absence", "party", 3)],
      "k-b": [],
    },
    observationLog: [
      obs("o1", "c-1", "growth", 2),
      obs("o2", "c-1", "behaviour", 4),
      obs("o3", "c-1", "growth", 7),
      obs("o4", "c-other", "growth", 1),
    ],
    gardenEdge: ["edge-x"],
  };
}

function meet(speciesId: string, at: number): TeacherMeeting {
  return { speciesId, at };
}

describe("garden-journey (B3 §2.2 + §2.5 + §2.6 visit bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated visit", () => {
    expect(gardenJourney(base())).toEqual({
      inbound: { arrivals: [], teachers: [], taughtAxes: [] },
      snapshot: {
        checkIn: {
          news: [],
          autonomous: {
            migration: {
              residents: ["c-1", "c-2"],
              arrived: [],
              departed: [],
              appliedRuleIds: [],
            },
            story: {
              residents: ["c-1", "c-2"],
              arrived: [],
              departed: [],
              appliedBeatIds: ["b1"],
            },
            arcs: {
              arcs: [{ residentId: "c-1", arc: "arc-a" }],
              changed: [],
              appliedBeatIds: ["a1"],
            },
          },
        },
        records: [],
      },
    });
  });

  it("full bundle: inbound plus snapshot, each exactly as its own read reports it", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a", "home-b"],
        teacherMapping: { "sp-a": ["ax-1"] },
        meetings: [meet("sp-a", 2)],
      },
      snapshot: {
        checkIn: {
          log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
          news: { since: null },
          autonomous: autonomousBase(),
        },
        records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
      },
    };
    const journey = gardenJourney(inputs);
    expect(journey.inbound).toEqual(inboundFromJourney(inputs.inbound));
    expect(journey.inbound.arrivals).toEqual([
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
    expect(journey.inbound.teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 2, axes: ["ax-1"] },
    ]);
    expect(journey.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(journey.snapshot).toEqual(gardenSnapshot(inputs.snapshot));
    expect(journey.snapshot.checkIn.news).toEqual([
      {
        creatureId: "c-1",
        kind: "arrival",
        movementId: "m1",
        at: 5,
        from: null,
        to: "home-a",
      },
    ]);
    expect(journey.snapshot.records[0]).toEqual(
      bridgeRecordForCreature("c-1", fullRecordInputs()),
    );
    expect(journey.snapshot.records[0].currentlyResident).toBe(true);
    expect(journey.snapshot.records[0].currentHome).toBe("home-b");
  });

  it("inbound-only journey: snapshot sections stay empty", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a"],
        teacherMapping: { "sp-a": ["ax-1", "ax-2"] },
        meetings: [meet("sp-a", 1)],
      },
      snapshot: snapshotBase(),
    };
    const journey = gardenJourney(inputs);
    expect(journey.inbound.arrivals).toHaveLength(1);
    expect(journey.inbound.taughtAxes).toEqual(["ax-1", "ax-2"]);
    expect(journey.snapshot.checkIn.news).toEqual([]);
    expect(journey.snapshot.records).toEqual([]);
  });

  it("snapshot-only journey: inbound sections stay empty", () => {
    const inputs: GardenJourneyInputs = {
      inbound: inboundBase(),
      snapshot: {
        checkIn: {
          log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
          news: { since: null },
          autonomous: autonomousBase(),
        },
        records: [{ creatureId: "c-1", inputs: recordBase() }],
      },
    };
    const journey = gardenJourney(inputs);
    expect(journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(journey.snapshot.checkIn.news).toHaveLength(1);
    expect(journey.snapshot.records).toHaveLength(1);
  });

  it("exact result shape: two sections only, no merged residents field", () => {
    const journey = gardenJourney(base());
    expect(Object.keys(journey).sort()).toEqual(["inbound", "snapshot"]);
    expect("residents" in journey).toBe(false);
    expect(Object.keys(journey.inbound).sort()).toEqual([
      "arrivals",
      "taughtAxes",
      "teachers",
    ]);
    expect(Object.keys(journey.snapshot).sort()).toEqual([
      "checkIn",
      "records",
    ]);
  });

  it("side-by-side-not-reconciled: inbound resident while the snapshot record reads departed", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a"],
        teacherMapping: {},
        meetings: [],
      },
      snapshot: {
        checkIn: {
          log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
          news: { since: null },
          autonomous: {
            ...autonomousBase(),
            storyBeats: [{ id: "b1", arrivals: [], departures: ["c-1"] }],
          },
        },
        records: [
          {
            creatureId: "c-1",
            inputs: {
              ...recordBase(),
              movementLog: [
                movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
                movement("m2", "c-1", "garden-departure", "home-a", null, 8),
              ],
            },
          },
        ],
      },
    };
    const journey = gardenJourney(inputs);
    // The journey's log says c-1 arrived and never left.
    expect(journey.inbound.arrivals[0].currentlyResident).toBe(true);
    // The snapshot's own log says c-1 departed, and its story
    // schedule departs c-1 too — neither fact rewrites the other.
    expect(journey.snapshot.records[0].currentlyResident).toBe(false);
    expect(journey.snapshot.checkIn.autonomous.story.departed).toEqual([
      "c-1",
    ]);
    expect("residents" in journey).toBe(false);
  });

  it("a meeting never makes a snapshot record, and an arrival never makes a teacher", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a"],
        teacherMapping: { "sp-a": ["ax-1"] },
        meetings: [meet("sp-a", 2)],
      },
      snapshot: {
        ...snapshotBase(),
        records: [{ creatureId: "c-9", inputs: recordBase() }],
      },
    };
    const journey = gardenJourney(inputs);
    expect(journey.inbound.teachers.map((t) => t.speciesId)).toEqual([
      "sp-a",
    ]);
    expect(journey.inbound.arrivals.map((a) => a.creatureId)).toEqual([
      "c-1",
    ]);
    // c-9's record comes from its own inputs, not from the
    // journey's meetings or arrivals.
    expect(journey.snapshot.records[0]).toEqual({
      creatureId: "c-9",
      currentlyResident: false,
      currentHome: null,
      arrival: null,
      bonds: { creatureId: "c-9", keepers: [] },
      observations: [],
      observedKinds: [],
      edgeDiscovery: null,
    });
  });

  it("loud failures: malformed journey bundle", () => {
    expect(() => gardenJourney(null as never)).toThrow();
    expect(() => gardenJourney("x" as never)).toThrow();
    expect(() =>
      gardenJourney({ snapshot: snapshotBase() } as never),
    ).toThrow(/inbound/);
    expect(() =>
      gardenJourney({ inbound: inboundBase() } as never),
    ).toThrow(/snapshot/);
    expect(() =>
      gardenJourney({
        inbound: null as never,
        snapshot: snapshotBase(),
      }),
    ).toThrow(/inbound/);
    expect(() =>
      gardenJourney({
        inbound: inboundBase(),
        snapshot: null as never,
      }),
    ).toThrow(/snapshot/);
  });

  it("loud failures propagate from the inbound bundle", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        ...inboundBase(),
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          movement("m1", "c-1", "garden-arrival", null, "home-a", 6),
        ],
      },
      snapshot: snapshotBase(),
    };
    expect(() => gardenJourney(inputs)).toThrow();
  });

  it("loud failures propagate from the snapshot bundle", () => {
    const inputs: GardenJourneyInputs = {
      inbound: inboundBase(),
      snapshot: {
        ...snapshotBase(),
        records: [
          { creatureId: "c-1", inputs: recordBase() },
          { creatureId: "c-1", inputs: recordBase() },
        ],
      },
    };
    expect(() => gardenJourney(inputs)).toThrow(/duplicate record entry/);
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a", "home-b"],
        teacherMapping: { "sp-a": ["ax-1"] },
        meetings: [meet("sp-a", 2)],
      },
      snapshot: {
        checkIn: {
          log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
          news: { since: null },
          autonomous: autonomousBase(),
        },
        records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
      },
    };
    const before = JSON.stringify(inputs);
    const first = gardenJourney(inputs);
    const second = gardenJourney(inputs);
    expect(JSON.stringify(inputs)).toBe(before);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.inbound).not.toBe(second.inbound);
    expect(first.inbound.arrivals).not.toBe(second.inbound.arrivals);
    expect(first.snapshot).not.toBe(second.snapshot);
    expect(first.snapshot.records[0]).not.toBe(second.snapshot.records[0]);
    expect(first.snapshot.checkIn.news).not.toBe(second.snapshot.checkIn.news);
    // Mutating one result never touches the next call's result.
    first.inbound.taughtAxes.push("ax-z");
    first.snapshot.records[0].observedKinds.push("kind-z");
    const third = gardenJourney(inputs);
    expect(third.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(third.snapshot.records[0].observedKinds).toEqual([
      "growth",
      "behaviour",
    ]);
  });

  it("caller-vocabulary ids flow through unchanged", () => {
    const inputs: GardenJourneyInputs = {
      inbound: {
        movementLog: [
          movement("tok-m", "tok-creature", "garden-arrival", null, "tok-home", 3),
        ],
        gardenHomes: ["tok-home"],
        teacherMapping: { "tok-species": ["tok-axis"] },
        meetings: [meet("tok-species", 1)],
      },
      snapshot: {
        checkIn: {
          log: [
            movement(
              "tok-m",
              "tok-creature",
              "garden-arrival",
              null,
              "tok-home",
              3,
            ),
          ],
          news: { since: null },
          autonomous: {
            ...autonomousBase(),
            residents: ["tok-creature"],
            storyBeats: [{ id: "tok-beat", arrivals: [], departures: [] }],
            storyThroughBeatId: "tok-beat",
            arcs: [{ residentId: "tok-creature", arc: "tok-arc" }],
            arcBeats: [{ id: "tok-arc-beat", changes: [] }],
            arcThroughBeatId: "tok-arc-beat",
          },
        },
        records: [
          {
            creatureId: "tok-creature",
            inputs: {
              ...recordBase(),
              gardenHomes: ["tok-home"],
              movementLog: [
                movement(
                  "tok-m",
                  "tok-creature",
                  "garden-arrival",
                  null,
                  "tok-home",
                  3,
                ),
              ],
              observationLog: [obs("tok-o", "tok-creature", "tok-kind", 4)],
            },
          },
        ],
      },
    };
    const journey = gardenJourney(inputs);
    expect(journey.inbound.arrivals[0].creatureId).toBe("tok-creature");
    expect(journey.inbound.teachers[0].speciesId).toBe("tok-species");
    expect(journey.inbound.taughtAxes).toEqual(["tok-axis"]);
    expect(journey.snapshot.checkIn.news[0].creatureId).toBe("tok-creature");
    expect(journey.snapshot.records[0].creatureId).toBe("tok-creature");
    expect(journey.snapshot.records[0].observedKinds).toEqual(["tok-kind"]);
  });

  it("staging locks: no host or composed module imports the journey bundle yet", async () => {
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
      "./garden-inbound.ts",
      "./garden-news.ts",
      "./garden-autonomous.ts",
      "./garden-checkin.ts",
      "./garden-snapshot.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-journey");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-journey.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
