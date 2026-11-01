import { describe, expect, it } from "vitest";
import {
  gardenOutingBonds,
  type GardenOutingBondsInputs,
} from "./garden-outing-bonds";
import { gardenOuting, type GardenOutingInputs } from "./garden-outing";
import type { GardenJourneyInputs } from "./garden-journey";
import type { JourneyInboundInputs } from "./garden-inbound";
import type { GardenSnapshotInputs } from "./garden-snapshot";
import {
  bridgeRecordForCreature,
  type BridgeRecordInputs,
} from "./garden-record";
import {
  bondsForCreature,
  type BondLedger,
} from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { MovementRecord } from "./garden-movement";
import type { ResearchObservation } from "./garden-research";
import type { TeacherMeeting } from "./garden-teachers";
import type { AutonomousChangeInputs } from "./garden-autonomous";

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
    { creatureId: "c-2", keeperId: "k-a", value: -3 },
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

function journeyBase(): GardenJourneyInputs {
  return { inbound: inboundBase(), snapshot: snapshotBase() };
}

function researchBase(): GardenOutingInputs["research"] {
  return { log: [], speciesOfCreature: {}, speciesIds: [] };
}

function outingBase(): GardenOutingInputs {
  return { journey: journeyBase(), research: researchBase() };
}

function base(): GardenOutingBondsInputs {
  return { outing: outingBase(), bonds: { ledger: [], creatureIds: [] } };
}

function meet(speciesId: string, at: number): TeacherMeeting {
  return { speciesId, at };
}

describe("garden-outing-bonds (B3 outing + per-pair bonds bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated outing with bonds", () => {
    const result = gardenOutingBonds(base());
    expect(result.bonds).toEqual([]);
    expect(result.outing).toEqual(gardenOuting(outingBase()));
    expect(result.outing.journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(result.outing.journey.snapshot.records).toEqual([]);
    expect(result.outing.research).toEqual([]);
  });

  it("full bundle: outing plus bonds, each exactly as its own read reports it", () => {
    const outing: GardenOutingInputs = {
      journey: {
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
          records: [
            {
              creatureId: "c-1",
              inputs: {
                ...recordBase(),
                movementLog: [
                  movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
                ],
                observationLog: [obs("o1", "c-1", "growth", 2)],
              },
            },
          ],
        },
      },
      research: {
        log: [obs("r1", "c-1", "growth", 2), obs("r2", "c-2", "growth", 3)],
        speciesOfCreature: { "c-1": "sp-a", "c-2": "sp-b" },
        speciesIds: ["sp-a", "sp-b"],
      },
    };
    const bonds: GardenOutingBondsInputs["bonds"] = {
      ledger: ledger(),
      creatureIds: ["c-1", "c-2"],
    };
    const result = gardenOutingBonds({ outing, bonds });
    expect(result.outing).toEqual(gardenOuting(outing));
    expect(result.bonds).toEqual([
      { creatureId: "c-1", bonds: bondsForCreature(ledger(), "c-1") },
      { creatureId: "c-2", bonds: bondsForCreature(ledger(), "c-2") },
    ]);
    expect(result.bonds[0].bonds).toEqual([
      { creatureId: "c-1", keeperId: "k-a", value: 20 },
      { creatureId: "c-1", keeperId: "k-b", value: 8 },
    ]);
    expect(result.bonds[1].bonds).toEqual([
      { creatureId: "c-2", keeperId: "k-a", value: -3 },
    ]);
  });

  it("outing-only bundle: a non-empty ledger with no named creatures reports no bonds", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: [] },
    });
    expect(result.bonds).toEqual([]);
    expect(result.outing).toEqual(gardenOuting(outingBase()));
  });

  it("bonds with a minimal outing: the bonds section needs no outing content", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-1"] },
    });
    expect(result.bonds).toEqual([
      {
        creatureId: "c-1",
        bonds: [
          { creatureId: "c-1", keeperId: "k-a", value: 20 },
          { creatureId: "c-1", keeperId: "k-b", value: 8 },
        ],
      },
    ]);
  });

  it("a creature with no bond entries reads an empty list, never null or a default bond", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-nobody"] },
    });
    expect(result.bonds).toEqual([{ creatureId: "c-nobody", bonds: [] }]);
  });

  it("caller order wins: bond lists follow creatureIds, not ledger order", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-2", "c-1"] },
    });
    expect(result.bonds.map((entry) => entry.creatureId)).toEqual([
      "c-2",
      "c-1",
    ]);
  });

  it("ledger order within a creature is preserved", () => {
    const shuffled: BondLedger = [
      { creatureId: "c-1", keeperId: "k-b", value: 8 },
      { creatureId: "c-1", keeperId: "k-a", value: 20 },
    ];
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: shuffled, creatureIds: ["c-1"] },
    });
    expect(result.bonds[0].bonds).toEqual(shuffled);
  });

  it("exact result shape: two sections only, bond entries carry exactly three fields", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-1"] },
    });
    expect(Object.keys(result).sort()).toEqual(["bonds", "outing"]);
    expect(Object.keys(result.bonds[0]).sort()).toEqual([
      "bonds",
      "creatureId",
    ]);
    expect(Object.keys(result.bonds[0].bonds[0]).sort()).toEqual([
      "creatureId",
      "keeperId",
      "value",
    ]);
    expect(result.outing).not.toHaveProperty("bonds");
  });

  it("side-by-side-not-merged: a record's own ledger is not this bundle's ledger", () => {
    const outing: GardenOutingInputs = {
      journey: {
        inbound: inboundBase(),
        snapshot: {
          checkIn: {
            log: [],
            news: { since: null },
            autonomous: autonomousBase(),
          },
          records: [{ creatureId: "c-1", inputs: recordBase() }],
        },
      },
      research: researchBase(),
    };
    const result = gardenOutingBonds({
      outing,
      bonds: { ledger: ledger(), creatureIds: ["c-1", "c-absent"] },
    });
    // The record's bondLedger is empty, yet the bonds section still
    // reports c-1's ledger entries — and c-absent, which appears
    // nowhere in the outing, is reported too, with an empty list.
    expect(result.outing).toEqual(gardenOuting(outing));
    expect(result.bonds).toEqual([
      {
        creatureId: "c-1",
        bonds: [
          { creatureId: "c-1", keeperId: "k-a", value: 20 },
          { creatureId: "c-1", keeperId: "k-b", value: 8 },
        ],
      },
      { creatureId: "c-absent", bonds: [] },
    ]);
    // No bond value leaked into the outing section: the record's own
    // bonds summary is exactly what its own read reports over its
    // own (empty) ledger, not this bundle's ledger.
    expect(result.outing.journey.snapshot.records[0]).toEqual(
      bridgeRecordForCreature("c-1", recordBase()),
    );
  });

  it("a negative bond value passes through unchanged: no band or floor is applied", () => {
    const result = gardenOutingBonds({
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-2"] },
    });
    expect(result.bonds[0].bonds).toEqual([
      { creatureId: "c-2", keeperId: "k-a", value: -3 },
    ]);
  });

  it("loud failures: malformed bundle, missing outing, missing bonds", () => {
    expect(() =>
      gardenOutingBonds(null as unknown as GardenOutingBondsInputs),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({} as unknown as GardenOutingBondsInputs),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        bonds: { ledger: [], creatureIds: [] },
      } as unknown as GardenOutingBondsInputs),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
      } as unknown as GardenOutingBondsInputs),
    ).toThrow();
  });

  it("loud failures: bad creatureIds shape, bad creature id, duplicate creature id", () => {
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: { ledger: [], creatureIds: "c-1" },
      } as unknown as GardenOutingBondsInputs),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: { ledger: [], creatureIds: [""] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: { ledger: [], creatureIds: ["c-1", "c-1"] },
      }),
    ).toThrow();
  });

  it("loud failures: malformed ledger entries and duplicate bond pairs", () => {
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: {
          ledger: [{ creatureId: "c-1", keeperId: "k-a", value: NaN }],
          creatureIds: ["c-1"],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: {
          ledger: [
            { creatureId: "c-1", keeperId: "k-a", value: 1 },
            { creatureId: "c-1", keeperId: "k-a", value: 2 },
          ],
          creatureIds: ["c-1"],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: outingBase(),
        bonds: { ledger: "nope", creatureIds: ["c-1"] },
      } as unknown as GardenOutingBondsInputs),
    ).toThrow();
  });

  it("loud failures propagate from the outing bundle", () => {
    const badJourney = {
      inbound: { ...inboundBase(), movementLog: "nope" },
      snapshot: snapshotBase(),
    } as unknown as GardenJourneyInputs;
    expect(() =>
      gardenOutingBonds({
        outing: { journey: badJourney, research: researchBase() },
        bonds: { ledger: [], creatureIds: [] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingBonds({
        outing: {
          journey: journeyBase(),
          research: {
            log: [],
            speciesOfCreature: {},
            speciesIds: ["sp-a", "sp-a"],
          },
        },
        bonds: { ledger: [], creatureIds: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs: GardenOutingBondsInputs = {
      outing: outingBase(),
      bonds: { ledger: ledger(), creatureIds: ["c-1"] },
    };
    const before = JSON.stringify(inputs);
    const first = gardenOutingBonds(inputs);
    expect(JSON.stringify(inputs)).toEqual(before);
    first.bonds[0].bonds[0].value = 9999;
    first.outing.journey.inbound.arrivals.push(
      "tampered" as never,
    );
    const second = gardenOutingBonds(inputs);
    expect(JSON.stringify(inputs)).toEqual(before);
    expect(second.bonds[0].bonds[0].value).toEqual(20);
    expect(second.outing.journey.inbound.arrivals).toEqual([]);
    expect(second).not.toBe(first);
    expect(second.bonds[0].bonds).not.toBe(first.bonds[0].bonds);
  });

  it("caller-vocabulary ids flow through unchanged", () => {
    const inputs: GardenOutingBondsInputs = {
      outing: {
        journey: {
          inbound: {
            movementLog: [
              movement(
                "mv-zz",
                "crt-qq",
                "garden-arrival",
                null,
                "hm-ww",
                3,
              ),
            ],
            gardenHomes: ["hm-ww"],
            teacherMapping: { "sp-qq": ["ax-zz"] },
            meetings: [meet("sp-qq", 1)],
          },
          snapshot: snapshotBase(),
        },
        research: {
          log: [obs("ob-zz", "crt-qq", "kind-zz", 1)],
          speciesOfCreature: { "crt-qq": "sp-qq" },
          speciesIds: ["sp-qq"],
        },
      },
      bonds: {
        ledger: [{ creatureId: "crt-qq", keeperId: "kp-zz", value: 7 }],
        creatureIds: ["crt-qq"],
      },
    };
    const result = gardenOutingBonds(inputs);
    expect(result.bonds).toEqual([
      {
        creatureId: "crt-qq",
        bonds: [{ creatureId: "crt-qq", keeperId: "kp-zz", value: 7 }],
      },
    ]);
    expect(result.outing.research[0].speciesId).toEqual("sp-qq");
  });

  it("staging locks: no host or composed module imports the outing-bonds bundle yet", async () => {
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
      "./garden-journey.ts",
      "./garden-outing.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-bonds");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-bonds.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
