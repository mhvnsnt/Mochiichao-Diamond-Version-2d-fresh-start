import { describe, expect, it } from "vitest";
import {
  bridgeRecordForCreature,
  type BridgeRecordInputs,
} from "./garden-record";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { MovementRecord } from "./garden-movement";
import type { ResearchObservation } from "./garden-research";

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

function base(): BridgeRecordInputs {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    bondLedger: [],
    decayProfile: profile(),
    factsByKeeper: {},
    observationLog: [],
  };
}

describe("garden-record (B3 §2.6 bridge record composition)", () => {
  it("empty inputs read as nulls and empty lists, not fabricated sections", () => {
    const record = bridgeRecordForCreature("c-1", base());
    expect(record).toEqual({
      creatureId: "c-1",
      currentlyResident: false,
      currentHome: null,
      arrival: null,
      bonds: { creatureId: "c-1", keepers: [] },
      observations: [],
      observedKinds: [],
      edgeDiscovery: null,
    });
  });

  it("full resident composition: arrival, bonds, observations, kinds, no edge entry", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [
        rec("m1", "c-1", "garden-arrival", "home-a", 5),
        rec("m2", "c-1", "transfer", "home-b", 9),
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
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.currentlyResident).toBe(true);
    expect(record.currentHome).toBe("home-b");
    expect(record.arrival).toMatchObject({
      creatureId: "c-1",
      firstArrivedAt: 5,
      lastArrivedAt: 5,
      arrivalCount: 1,
      lastArrivalRecordId: "m1",
      lastArrivalTo: "home-a",
      currentlyResident: true,
    });
    expect(record.bonds.keepers.map((k) => k.keeperId)).toEqual([
      "k-a",
      "k-b",
    ]);
    // k-a: 20 - 2*1*3 = 14; k-b: no facts, effective is accrued.
    expect(record.bonds.keepers[0]).toMatchObject({
      accrued: 20,
      totalDecay: 6,
      effective: 14,
    });
    expect(record.bonds.keepers[1]).toMatchObject({
      accrued: 8,
      totalDecay: 0,
      effective: 8,
    });
    expect(record.observations.map((o) => o.id)).toEqual([
      "o1",
      "o2",
      "o3",
    ]);
    expect(record.observedKinds).toEqual(["growth", "behaviour"]);
    // Last movement is a transfer to a Garden home, not a release.
    expect(record.edgeDiscovery).toBeNull();
  });

  it("gift-resident with no arrival: arrival null, residency true", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "gift", "home-b", 3)],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.arrival).toBeNull();
    expect(record.currentlyResident).toBe(true);
    expect(record.currentHome).toBe("home-b");
  });

  it("departure ends residency but not the arrival record; home is elsewhere", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [
        rec("m1", "c-1", "garden-arrival", "home-a", 1),
        rec("m2", "c-1", "garden-departure", "elsewhere", 2),
      ],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.arrival).toMatchObject({ arrivalCount: 1 });
    expect(record.currentlyResident).toBe(false);
    expect(record.currentHome).toBe("elsewhere");
  });

  it("edge release reads as an edge discovery, not a residency", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "release", "edge-x", 6)],
      gardenEdge: ["edge-x"],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.edgeDiscovery).toEqual({
      creatureId: "c-1",
      releaseRecordId: "m1",
      releasedAt: 6,
      releasedTo: "edge-x",
    });
    expect(record.currentlyResident).toBe(false);
    expect(record.arrival).toBeNull();
  });

  it("edge discovery is not assessed without an edge set", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "release", "edge-x", 6)],
    };
    expect(bridgeRecordForCreature("c-1", inputs).edgeDiscovery).toBeNull();
  });

  it("edge discovery respects the caller-resolved eligible set", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "release", "edge-x", 6)],
      gardenEdge: ["edge-x"],
      eligibleCreatures: ["c-other"],
    };
    expect(bridgeRecordForCreature("c-1", inputs).edgeDiscovery).toBeNull();
    const eligible: BridgeRecordInputs = {
      ...inputs,
      eligibleCreatures: ["c-1"],
    };
    expect(
      bridgeRecordForCreature("c-1", eligible).edgeDiscovery,
    ).toMatchObject({ releaseRecordId: "m1" });
  });

  it("later release elsewhere ends an earlier edge candidacy", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [
        rec("m1", "c-1", "release", "edge-x", 1),
        rec("m2", "c-1", "release", "far-away", 2),
      ],
      gardenEdge: ["edge-x"],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.edgeDiscovery).toBeNull();
    expect(record.currentHome).toBe("far-away");
  });

  it("observations arrive in stamp order even when the log lists them out of order", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      observationLog: [
        obs("o-late", "c-1", "growth", 9),
        obs("o-early", "c-1", "behaviour", 2),
        obs("o-mid", "c-1", "growth", 5),
      ],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.observations.map((o) => o.id)).toEqual([
      "o-early",
      "o-mid",
      "o-late",
    ]);
    expect(record.observedKinds).toEqual(["behaviour", "growth"]);
  });

  it("arrival order follows earliest stamp, not log order, inside the record", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [
        rec("a2", "c-1", "garden-arrival", "home-b", 10),
        rec("a1", "c-1", "garden-arrival", "home-a", 4),
      ],
    };
    const record = bridgeRecordForCreature("c-1", inputs);
    expect(record.arrival).toMatchObject({
      firstArrivedAt: 4,
      lastArrivedAt: 10,
      arrivalCount: 2,
      lastArrivalRecordId: "a2",
    });
  });

  it("garden homes accept a Set as well as an array", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "garden-arrival", "home-a", 1)],
      gardenHomes: new Set(["home-a"]),
    };
    expect(bridgeRecordForCreature("c-1", inputs).currentlyResident).toBe(
      true,
    );
  });

  it("loud failures: bad creature, bad bundle, duplicate movement, bad homes, bad observation, unknown-keeper facts", () => {
    const good: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "garden-arrival", "home-a", 1)],
    };
    expect(() => bridgeRecordForCreature("", good)).toThrow();
    expect(() =>
      bridgeRecordForCreature("c-1", null as never),
    ).toThrow();
    expect(() =>
      bridgeRecordForCreature("c-1", {
        ...good,
        movementLog: [good.movementLog[0]!, { ...good.movementLog[0]!, at: 2 }],
      }),
    ).toThrow(/duplicate/);
    expect(() =>
      bridgeRecordForCreature("c-1", { ...good, gardenHomes: [""] }),
    ).toThrow();
    expect(() =>
      bridgeRecordForCreature("c-1", {
        ...good,
        observationLog: [{ ...obs("o1", "c-1", "growth", 1), kind: "" }],
      }),
    ).toThrow();
    expect(() =>
      bridgeRecordForCreature("c-1", {
        ...good,
        bondLedger: ledger(),
        factsByKeeper: { "k-ghost": [] },
      }),
    ).toThrow();
    expect(() =>
      bridgeRecordForCreature("c-1", {
        ...good,
        gardenEdge: [""],
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("m1", "c-1", "garden-arrival", "home-a", 1)],
      bondLedger: ledger(),
      factsByKeeper: {},
      observationLog: [obs("o1", "c-1", "growth", 1)],
    };
    const before = JSON.stringify(inputs);
    const first = bridgeRecordForCreature("c-1", inputs);
    first.bonds.keepers[0]!.effective = -999;
    first.observations[0]!.kind = "mutated";
    first.arrival!.arrivalCount = 999;
    expect(JSON.stringify(inputs)).toBe(before);
    const second = bridgeRecordForCreature("c-1", inputs);
    expect(second.bonds.keepers[0]?.effective).toBe(20);
    expect(second.observations[0]?.kind).toBe("growth");
    expect(second.arrival?.arrivalCount).toBe(1);
    expect(second).not.toBe(first);
    expect(second.bonds).not.toBe(first.bonds);
    expect(second.observations).not.toBe(first.observations);
  });

  it("exact result shape: no extra fields", () => {
    const record = bridgeRecordForCreature("c-1", base());
    expect(Object.keys(record).sort()).toEqual(
      [
        "arrival",
        "bonds",
        "creatureId",
        "currentHome",
        "currentlyResident",
        "edgeDiscovery",
        "observations",
        "observedKinds",
      ].sort(),
    );
  });

  it("caller-vocabulary ids: opaque tokens work unchanged", () => {
    const inputs: BridgeRecordInputs = {
      ...base(),
      movementLog: [rec("tok-m1", "tok-77", "garden-arrival", "tok-home", 1)],
      gardenHomes: ["tok-home"],
      observationLog: [obs("tok-o1", "tok-77", "tok-kind", 2)],
    };
    const record = bridgeRecordForCreature("tok-77", inputs);
    expect(record.currentlyResident).toBe(true);
    expect(record.arrival?.lastArrivalTo).toBe("tok-home");
    expect(record.observedKinds).toEqual(["tok-kind"]);
  });

  it("staging locks: no host or composed module imports the record yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-record");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("./garden-record.ts", import.meta.url),
      "utf-8",
    );
    for (const token of ["Mochii", "Sproutle", "player", "ranger"]) {
      expect(source.toLowerCase()).not.toContain(token);
    }
  });
});
