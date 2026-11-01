import { describe, expect, it } from "vitest";
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

function base(): GardenSnapshotInputs {
  return {
    checkIn: {
      log: [],
      news: { since: null },
      autonomous: autonomousBase(),
    },
    records: [],
  };
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

describe("garden-snapshot (B3 §2.5 + §2.6 snapshot bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated change", () => {
    expect(gardenSnapshot(base())).toEqual({
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
    });
  });

  it("full bundle: check-in beat plus one record, each exactly as its own read reports it", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
        news: { since: null },
        autonomous: autonomousBase(),
      },
      records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.checkIn.news).toEqual([
      {
        creatureId: "c-1",
        kind: "arrival",
        movementId: "m1",
        at: 5,
        from: null,
        to: "home-a",
      },
    ]);
    expect(snap.records).toHaveLength(1);
    expect(snap.records[0]).toEqual(
      bridgeRecordForCreature("c-1", fullRecordInputs()),
    );
    expect(snap.records[0].currentlyResident).toBe(true);
    expect(snap.records[0].currentHome).toBe("home-b");
    expect(snap.records[0].arrival).toMatchObject({
      creatureId: "c-1",
      firstArrivedAt: 5,
      arrivalCount: 1,
    });
    // k-a: 20 - 2*1*3 = 14; k-b: no facts, effective is accrued.
    expect(snap.records[0].bonds.keepers[0]).toMatchObject({
      accrued: 20,
      totalDecay: 6,
      effective: 14,
    });
    expect(snap.records[0].bonds.keepers[1]).toMatchObject({
      accrued: 8,
      totalDecay: 0,
      effective: 8,
    });
    expect(snap.records[0].observations.map((o) => o.id)).toEqual([
      "o1",
      "o2",
      "o3",
    ]);
    expect(snap.records[0].observedKinds).toEqual(["growth", "behaviour"]);
    expect(snap.records[0].edgeDiscovery).toBeNull();
  });

  it("records report in caller order, not sorted or log order", () => {
    const inputs: GardenSnapshotInputs = {
      ...base(),
      records: [
        { creatureId: "c-2", inputs: recordBase() },
        { creatureId: "c-1", inputs: recordBase() },
      ],
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.records.map((r) => r.creatureId)).toEqual(["c-2", "c-1"]);
    expect(snap.records[1]).toEqual(
      bridgeRecordForCreature("c-1", recordBase()),
    );
  });

  it("empty record list with a non-empty check-in beat", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
        news: { since: null },
        autonomous: autonomousBase(),
      },
      records: [],
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.records).toEqual([]);
    expect(snap.checkIn.news).toHaveLength(1);
  });

  it("exact result shape: two sections only, no merged residents field", () => {
    const snap = gardenSnapshot(base());
    expect(Object.keys(snap).sort()).toEqual(["checkIn", "records"]);
    expect("residents" in snap).toBe(false);
    const record = gardenSnapshot({
      ...base(),
      records: [{ creatureId: "c-1", inputs: recordBase() }],
    }).records[0];
    expect(Object.keys(record).sort()).toEqual([
      "arrival",
      "bonds",
      "creatureId",
      "currentHome",
      "currentlyResident",
      "edgeDiscovery",
      "observations",
      "observedKinds",
    ]);
  });

  it("side-by-side-not-chained: story departs a creature whose own record still reads resident", () => {
    const autonomous: AutonomousChangeInputs = {
      ...autonomousBase(),
      storyBeats: [{ id: "b1", arrivals: [], departures: ["c-1"] }],
    };
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
        news: { since: null },
        autonomous,
      },
      records: [
        {
          creatureId: "c-1",
          inputs: {
            ...recordBase(),
            movementLog: [
              movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
            ],
          },
        },
      ],
    };
    const snap = gardenSnapshot(inputs);
    // News, autonomous story, and the record all name c-1 at once.
    expect(snap.checkIn.news).toHaveLength(1);
    expect(snap.checkIn.news[0].creatureId).toBe("c-1");
    expect(snap.checkIn.autonomous.story.departed).toEqual(["c-1"]);
    expect(snap.checkIn.autonomous.story.residents).toEqual(["c-2"]);
    // The autonomous departure was NOT applied to the record.
    expect(snap.records[0].currentlyResident).toBe(true);
    expect(snap.records[0].currentHome).toBe("home-a");
    expect("residents" in snap).toBe(false);
  });

  it("check-in stamp gating flows through: a movement at the stamp is already seen", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [
          movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          movement("m2", "c-2", "garden-arrival", null, "home-a", 6),
        ],
        news: { since: 5 },
        autonomous: autonomousBase(),
      },
      records: [],
    };
    expect(gardenSnapshot(inputs).checkIn.news.map((n) => n.movementId)).toEqual([
      "m2",
    ]);
  });

  it("edge discovery only with an edge set, per record entry", () => {
    const inputs: GardenSnapshotInputs = {
      ...base(),
      records: [
        {
          creatureId: "c-1",
          inputs: {
            ...recordBase(),
            movementLog: [
              movement("r1", "c-1", "release", "home-a", "edge-x", 8),
            ],
            gardenEdge: ["edge-x"],
          },
        },
        {
          creatureId: "c-2",
          inputs: {
            ...recordBase(),
            movementLog: [
              movement("r2", "c-2", "release", "home-a", "edge-x", 9),
            ],
          },
        },
      ],
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.records[0].edgeDiscovery).toMatchObject({
      creatureId: "c-1",
      releaseRecordId: "r1",
      releasedTo: "edge-x",
    });
    expect(snap.records[1].edgeDiscovery).toBeNull();
  });

  it("each entry keeps its own record inputs: one creature's facts never leak into another's record", () => {
    const inputs: GardenSnapshotInputs = {
      ...base(),
      records: [
        {
          creatureId: "c-1",
          inputs: {
            ...recordBase(),
            bondLedger: ledger(),
            factsByKeeper: { "k-a": [facts("absence", "party", 3)] },
          },
        },
        { creatureId: "c-2", inputs: recordBase() },
      ],
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.records[0].bonds.keepers).toHaveLength(2);
    expect(snap.records[0].bonds.keepers[0].effective).toBe(14);
    expect(snap.records[1].bonds).toEqual({
      creatureId: "c-2",
      keepers: [],
    });
  });

  it("loud failures: malformed snapshot bundle", () => {
    expect(() => gardenSnapshot(null as never)).toThrow();
    expect(() => gardenSnapshot("x" as never)).toThrow();
    expect(() => gardenSnapshot({ checkIn: base().checkIn } as never)).toThrow();
    expect(() =>
      gardenSnapshot({ ...base(), records: "x" as never }),
    ).toThrow();
  });

  it("loud failures: malformed record entries", () => {
    expect(() =>
      gardenSnapshot({ ...base(), records: [null as never] }),
    ).toThrow();
    expect(() =>
      gardenSnapshot({
        ...base(),
        records: [{ creatureId: "", inputs: recordBase() }],
      }),
    ).toThrow();
    expect(() =>
      gardenSnapshot({
        ...base(),
        records: [{ creatureId: "c-1", inputs: null as never }],
      }),
    ).toThrow();
  });

  it("loud failure: duplicate record entry for one creature", () => {
    expect(() =>
      gardenSnapshot({
        ...base(),
        records: [
          { creatureId: "c-1", inputs: recordBase() },
          { creatureId: "c-1", inputs: recordBase() },
        ],
      }),
    ).toThrow(/duplicate record entry/);
  });

  it("loud failures propagate from the check-in beat", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [
          {
            id: "bad",
            creatureId: "c-1",
            verb: "no-such-verb",
            from: null,
            to: null,
            at: 1,
          } as never,
        ],
        news: { since: null },
        autonomous: autonomousBase(),
      },
      records: [],
    };
    expect(() => gardenSnapshot(inputs)).toThrow();
  });

  it("loud failures propagate from a record read", () => {
    const inputs: GardenSnapshotInputs = {
      ...base(),
      records: [
        {
          creatureId: "c-1",
          inputs: {
            ...recordBase(),
            movementLog: [
              movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
              movement("m1", "c-1", "garden-arrival", null, "home-a", 6),
            ],
          },
        },
      ],
    };
    expect(() => gardenSnapshot(inputs)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
        news: { since: null },
        autonomous: autonomousBase(),
      },
      records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
    };
    const before = JSON.stringify(inputs);
    const first = gardenSnapshot(inputs);
    const second = gardenSnapshot(inputs);
    expect(JSON.stringify(inputs)).toBe(before);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.records[0]).not.toBe(second.records[0]);
    expect(first.records[0].bonds.keepers).not.toBe(
      second.records[0].bonds.keepers,
    );
    expect(first.checkIn.news).not.toBe(second.checkIn.news);
    expect(first.checkIn.autonomous.story.residents).not.toBe(
      second.checkIn.autonomous.story.residents,
    );
    // Mutating one result never touches the next call's result.
    first.records[0].bonds.keepers.push({
      keeperId: "k-z",
      accrued: 0,
      totalDecay: 0,
      floorApplied: null,
      effective: 0,
      contributions: [],
    });
    expect(gardenSnapshot(inputs).records[0].bonds.keepers).toHaveLength(2);
  });

  it("caller-vocabulary ids flow through unchanged", () => {
    const inputs: GardenSnapshotInputs = {
      checkIn: {
        log: [
          movement("tok-m", "tok-creature", "garden-arrival", null, "tok-home", 3),
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
    };
    const snap = gardenSnapshot(inputs);
    expect(snap.checkIn.news[0].creatureId).toBe("tok-creature");
    expect(snap.records[0].creatureId).toBe("tok-creature");
    expect(snap.records[0].observedKinds).toEqual(["tok-kind"]);
    expect(snap.checkIn.autonomous.arcs.arcs[0].arc).toBe("tok-arc");
  });

  it("staging locks: no host or composed module imports the snapshot bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-snapshot");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-snapshot.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
