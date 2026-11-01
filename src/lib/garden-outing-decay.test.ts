import { describe, expect, it } from "vitest";
import {
  gardenOutingDecay,
  type GardenOutingDecayInputs,
} from "./garden-outing-decay";
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
import {
  decayBreakdown,
  type DecayProfile,
  type NeglectFact,
} from "./garden-decay";
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


function decayBase(): GardenOutingDecayInputs {
  return { outingBonds: base(), decay: { entries: [] } };
}

function decayEntry(
  id: string,
  accrued: number,
  factsList: NeglectFact[],
): GardenOutingDecayInputs["decay"]["entries"][number] {
  return { id, accrued, facts: factsList, profile: profile() };
}

describe("garden-outing-decay (B3 outing + bonds + effective-bond readings)", () => {
  it("minimal inputs read back unchanged, no fabricated outing with bonds and decay", () => {
    const result = gardenOutingDecay(decayBase());
    expect(result.decay).toEqual([]);
    expect(result.outingBonds).toEqual(gardenOutingBonds(base()));
    expect(result.outingBonds.bonds).toEqual([]);
    expect(result.outingBonds.outing.journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(result.outingBonds.outing.research).toEqual([]);
  });

  it("full bundle: outing-bonds plus decay, each exactly as its own read reports it", () => {
    const outingBonds: GardenOutingBondsInputs = {
      outing: {
        journey: {
          inbound: {
            movementLog: [
              movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
            ],
            gardenHomes: ["home-a", "home-b"],
            teacherMapping: { "sp-a": ["ax-1"] },
            meetings: [{ speciesId: "sp-a", at: 2 }],
          },
          snapshot: {
            checkIn: {
              log: [
                movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
              ],
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
      },
      bonds: { ledger: ledger(), creatureIds: ["c-1", "c-2"] },
    };
    const entries = [
      decayEntry("d-1", 50, [facts("absence", "party", 3)]),
      decayEntry("d-2", 8, [facts("absence", "party", 3)]),
      decayEntry("d-3", 30, []),
    ];
    const result = gardenOutingDecay({ outingBonds, decay: { entries } });
    expect(result.outingBonds).toEqual(gardenOutingBonds(outingBonds));
    expect(result.outingBonds.bonds).toEqual([
      { creatureId: "c-1", bonds: bondsForCreature(ledger(), "c-1") },
      { creatureId: "c-2", bonds: bondsForCreature(ledger(), "c-2") },
    ]);
    expect(result.decay).toEqual(
      entries.map((entry) => ({
        id: entry.id,
        breakdown: decayBreakdown(entry.accrued, entry.facts, entry.profile),
      })),
    );
    // Hand-checked decay numbers: 50 - 2*3 = 44 (floor 5 not binding);
    // 8 - 6 = 2, floor 5 binds the fall, so 5; no facts reads accrued back.
    expect(result.decay[0].breakdown.effective).toEqual(44);
    expect(result.decay[0].breakdown.totalDecay).toEqual(6);
    expect(result.decay[0].breakdown.floorApplied).toEqual(5);
    expect(result.decay[1].breakdown.effective).toEqual(5);
    expect(result.decay[2].breakdown.effective).toEqual(30);
    expect(result.decay[2].breakdown.floorApplied).toEqual(null);
  });

  it("decay-only bundle: decay readings need no outing content", () => {
    const entries = [decayEntry("d-1", 50, [facts("absence", "party", 3)])];
    const result = gardenOutingDecay({ outingBonds: base(), decay: { entries } });
    expect(result.decay[0].breakdown.effective).toEqual(44);
    expect(result.outingBonds).toEqual(gardenOutingBonds(base()));
  });

  it("outing-bonds-only bundle: an empty decay list reports no readings", () => {
    const result = gardenOutingDecay({
      outingBonds: {
        outing: outingBase(),
        bonds: { ledger: ledger(), creatureIds: ["c-1"] },
      },
      decay: { entries: [] },
    });
    expect(result.decay).toEqual([]);
    expect(result.outingBonds.bonds).toEqual([
      { creatureId: "c-1", bonds: bondsForCreature(ledger(), "c-1") },
    ]);
  });

  it("caller order wins: decay readings follow entries order, not accrued order", () => {
    const entries = [
      decayEntry("d-b", 10, []),
      decayEntry("d-a", 90, []),
    ];
    const result = gardenOutingDecay({ outingBonds: base(), decay: { entries } });
    expect(result.decay.map((entry) => entry.id)).toEqual(["d-b", "d-a"]);
    expect(result.decay.map((entry) => entry.breakdown.accrued)).toEqual([10, 90]);
  });

  it("released facts contribute zero decay and never set a floor", () => {
    const entries = [
      decayEntry("d-1", 40, [facts("absence", "released", 9)]),
    ];
    const result = gardenOutingDecay({ outingBonds: base(), decay: { entries } });
    expect(result.decay[0].breakdown.effective).toEqual(40);
    expect(result.decay[0].breakdown.totalDecay).toEqual(0);
    expect(result.decay[0].breakdown.floorApplied).toEqual(null);
  });

  it("exact result shape: two sections only; a breakdown carries exactly five fields", () => {
    const entries = [decayEntry("d-1", 50, [facts("absence", "party", 3)])];
    const result = gardenOutingDecay({ outingBonds: base(), decay: { entries } });
    expect(Object.keys(result).sort()).toEqual(["decay", "outingBonds"]);
    expect(Object.keys(result.decay[0]).sort()).toEqual(["breakdown", "id"]);
    expect(Object.keys(result.decay[0].breakdown).sort()).toEqual([
      "accrued",
      "contributions",
      "effective",
      "floorApplied",
      "totalDecay",
    ]);
    expect(result.decay[0].breakdown.contributions).toEqual([
      {
        type: "absence",
        context: "party",
        units: 3,
        rate: 2,
        scalar: 1,
        amount: 6,
      },
    ]);
    expect("decay" in result.outingBonds).toEqual(false);
  });

  it("side-by-side-not-merged: the decay accrued is its own input, never the ledger value", () => {
    // The ledger says c-1/k-a is 20; the decay entry starts from 50.
    // Both are reported; neither overwrites the other.
    const entries = [decayEntry("d-1", 50, [facts("absence", "party", 3)])];
    const result = gardenOutingDecay({
      outingBonds: {
        outing: outingBase(),
        bonds: { ledger: ledger(), creatureIds: ["c-1"] },
      },
      decay: { entries },
    });
    expect(result.outingBonds.bonds[0].bonds).toEqual([
      { creatureId: "c-1", keeperId: "k-a", value: 20 },
      { creatureId: "c-1", keeperId: "k-b", value: 8 },
    ]);
    expect(result.decay[0].breakdown.accrued).toEqual(50);
    expect(result.decay[0].breakdown.effective).toEqual(44);
    // The bridge record's own bondLedger is a third, separate picture:
    // an empty record ledger reads no bond, whatever this bundle says.
    const record = bridgeRecordForCreature("c-1", {
      ...recordBase(),
      bondLedger: [],
    });
    expect(record.bonds.keepers).toEqual([]);
  });

  it("negative accrued passes through unchanged when no facts apply, no floor invented", () => {
    const entries = [decayEntry("d-1", -3, [])];
    const result = gardenOutingDecay({ outingBonds: base(), decay: { entries } });
    expect(result.decay[0].breakdown.effective).toEqual(-3);
    expect(result.decay[0].breakdown.floorApplied).toEqual(null);
  });

  it("loud failures: malformed bundle and missing sections", () => {
    expect(() => gardenOutingDecay(null as never)).toThrow();
    expect(() => gardenOutingDecay({} as never)).toThrow();
    expect(() =>
      gardenOutingDecay({ outingBonds: base() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingDecay({ decay: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: { entries: null as never },
      }),
    ).toThrow();
  });

  it("loud failures: bad or duplicate decay entry ids", () => {
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: { entries: [decayEntry("", 10, [])] },
      }),
    ).toThrow(/decay entry id/);
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: {
          entries: [decayEntry("d-1", 10, []), decayEntry("d-1", 20, [])],
        },
      }),
    ).toThrow(/duplicate decay entry id/);
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: { entries: [null as never] },
      }),
    ).toThrow(/decay entry must be an object/);
  });

  it("loud failures: decay failures propagate (unknown context, missing rate, non-finite accrued)", () => {
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: {
          entries: [
            decayEntry("d-1", 10, [facts("absence", "nope" as never, 1)]),
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: {
          entries: [
            decayEntry("d-1", 10, [facts("harsh-use", "party", 1)]),
          ],
        },
      }),
    ).toThrow(/missing or invalid base rate/);
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: { entries: [decayEntry("d-1", Number.NaN, [])] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDecay({
        outingBonds: base(),
        decay: {
          entries: [
            decayEntry("d-1", 10, [facts("absence", "party", -1)]),
          ],
        },
      }),
    ).toThrow();
  });

  it("loud failures: outing-bonds failures propagate", () => {
    expect(() =>
      gardenOutingDecay({
        outingBonds: {
          outing: outingBase(),
          bonds: { ledger: ledger(), creatureIds: ["c-1", "c-1"] },
        },
        decay: { entries: [] },
      }),
    ).toThrow(/duplicate creature id/);
    expect(() =>
      gardenOutingDecay({
        outingBonds: {
          outing: {
            journey: journeyBase(),
            research: {
              log: [],
              speciesOfCreature: {},
              speciesIds: ["sp-a", "sp-a"],
            },
          },
          bonds: { ledger: [], creatureIds: [] },
        },
        decay: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const entries = [decayEntry("d-1", 50, [facts("absence", "party", 3)])];
    const inputs: GardenOutingDecayInputs = {
      outingBonds: {
        outing: outingBase(),
        bonds: { ledger: ledger(), creatureIds: ["c-1"] },
      },
      decay: { entries },
    };
    const first = gardenOutingDecay(inputs);
    first.decay[0].breakdown.contributions[0].amount = 999;
    first.outingBonds.bonds[0].bonds[0].value = 999;
    const second = gardenOutingDecay(inputs);
    expect(second.decay[0].breakdown.contributions[0].amount).toEqual(6);
    expect(second.decay[0].breakdown.effective).toEqual(44);
    expect(second.outingBonds.bonds[0].bonds[0].value).toEqual(20);
    expect(inputs.decay.entries[0].facts).toEqual([
      facts("absence", "party", 3),
    ]);
    expect(inputs.outingBonds.bonds.ledger).toEqual(ledger());
  });

  it("caller-vocabulary ids: opaque ids pass through untouched", () => {
    const entries = [decayEntry("crt-qq", 12, [])];
    const result = gardenOutingDecay({
      outingBonds: {
        outing: outingBase(),
        bonds: {
          ledger: [
            { creatureId: "crt-qq", keeperId: "kp-zz", value: 7 },
          ],
          creatureIds: ["crt-qq"],
        },
      },
      decay: { entries },
    });
    expect(result.decay[0].id).toEqual("crt-qq");
    expect(result.decay[0].breakdown.accrued).toEqual(12);
    expect(result.outingBonds.bonds[0].bonds).toEqual([
      { creatureId: "crt-qq", keeperId: "kp-zz", value: 7 },
    ]);
  });

  it("staging locks: no host or composed module imports the outing-decay bundle yet", async () => {
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
      "./garden-outing-bonds.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-decay");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-decay.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
