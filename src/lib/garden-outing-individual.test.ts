import { describe, expect, it } from "vitest";
import {
  gardenOutingIndividual,
  type GardenOutingIndividualInputs,
  type IndividualEntry,
} from "./garden-outing-individual";
import {
  gardenOutingUnlocks,
  type GardenOutingUnlocksInputs,
  type UnlockEntry,
} from "./garden-outing-unlocks";
import type { GardenOutingJourneyInputs } from "./garden-outing-journey";
import { individualBondSummary } from "./garden-individual";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { AutonomousChangeInputs } from "./garden-autonomous";
import type { CheckInInputs } from "./garden-checkin";
import type { GardenJourneyInputs } from "./garden-journey";
import type { GardenOutingInputs } from "./garden-outing";
import type { GardenOutingBondsInputs } from "./garden-outing-bonds";
import type { GardenOutingDecayInputs } from "./garden-outing-decay";
import type { GardenOutingComfortInputs } from "./garden-outing-comfort";
import type { GardenOutingThanksInputs } from "./garden-outing-thanks";
import type { GardenOutingLevelInputs } from "./garden-outing-level";
import type { GardenOutingRecordInputs } from "./garden-outing-record";
import type { GardenOutingCheckinInputs } from "./garden-outing-checkin";
import type { JourneyInboundInputs } from "./garden-inbound";

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

function fact(
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

function checkInBase(): CheckInInputs {
  return {
    log: [],
    news: { since: null },
    autonomous: autonomousBase(),
  };
}

function journeyBase(): GardenJourneyInputs {
  return {
    inbound: {
      movementLog: [],
      gardenHomes: [],
      teacherMapping: {},
      meetings: [],
    } satisfies JourneyInboundInputs,
    snapshot: {
      checkIn: checkInBase(),
      records: [],
    },
  };
}

function outingBase(): GardenOutingInputs {
  return {
    journey: journeyBase(),
    research: { log: [], speciesOfCreature: {}, speciesIds: [] },
  };
}

function outingThanksBase(): GardenOutingThanksInputs {
  return {
    outingComfort: {
      outingDecay: {
        outingBonds: {
          outing: outingBase(),
          bonds: {
            ledger: [
              { creatureId: "c-1", keeperId: "k-a", value: 20 },
            ] satisfies BondLedger,
            creatureIds: ["c-1"],
          },
        } satisfies GardenOutingBondsInputs,
        decay: { entries: [] },
      } satisfies GardenOutingDecayInputs,
      comfort: { entries: [] },
    } satisfies GardenOutingComfortInputs,
    thanks: { windows: [] },
  };
}

function outingLevelBase(): GardenOutingLevelInputs {
  return {
    outingThanks: outingThanksBase(),
    levels: { entries: [] },
  };
}

function outingRecordBase(): GardenOutingRecordInputs {
  return {
    outingLevel: outingLevelBase(),
    records: { entries: [] },
  };
}

function outingCheckinBase(): GardenOutingCheckinInputs {
  return {
    outingRecord: outingRecordBase(),
    checkins: { entries: [] },
  };
}

function minimalOutingJourney(): GardenOutingJourneyInputs {
  return {
    outingSnapshot: {
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [] },
    },
    journeys: { entries: [] },
  };
}

function minimalOutingUnlocks(): GardenOutingUnlocksInputs {
  return {
    outingJourney: minimalOutingJourney(),
    unlocks: { entries: [] },
  };
}

function ledgerFull(): BondLedger {
  return [
    { creatureId: "creature-9", keeperId: "keeper-a", value: 20 },
    { creatureId: "creature-9", keeperId: "keeper-b", value: 8 },
    { creatureId: "creature-other", keeperId: "keeper-a", value: 99 },
  ];
}

function individualFull(): IndividualEntry {
  return {
    id: "ind-1",
    ledger: ledgerFull(),
    creatureId: "creature-9",
    profile: profile(),
    factsByKeeper: {
      "keeper-a": [fact("absence", "party", 3)],
      "keeper-b": [fact("absence", "storage", 2)],
    },
  };
}

function individualFloor(): IndividualEntry {
  return {
    id: "ind-2",
    ledger: [{ creatureId: "c", keeperId: "k", value: 10 }],
    creatureId: "c",
    profile: profile(),
    factsByKeeper: { k: [fact("absence", "party", 10)] },
  };
}

function individualBase(): IndividualEntry {
  return {
    id: "ind-9",
    ledger: [{ creatureId: "c-9", keeperId: "k-9", value: 7 }],
    creatureId: "c-9",
    profile: profile(),
    factsByKeeper: {},
  };
}

function unlockFull(): UnlockEntry {
  return {
    id: "un-1",
    milestones: {
      gardenLevel: 2,
      sportTitles: ["title-a"],
      lineageMilestones: ["line-a"],
    },
    catalogue: [
      { id: "u-level", requires: { kind: "gardenLevel", atLeast: 2 } },
      { id: "u-title", requires: { kind: "sportTitle", title: "title-a" } },
      {
        id: "u-missing",
        requires: { kind: "lineageMilestone", milestone: "line-b" },
      },
      {
        id: "u-any",
        requires: {
          kind: "any",
          requirements: [
            { kind: "sportTitle", title: "nope" },
            { kind: "gardenLevel", atLeast: 1 },
          ],
        },
      },
    ],
    previouslyUnlocked: ["u-level"],
  };
}

function fullInputs(): GardenOutingIndividualInputs {
  return {
    outingUnlocks: {
      outingJourney: minimalOutingJourney(),
      unlocks: { entries: [unlockFull()] },
    },
    individuals: { entries: [individualFull(), individualFloor()] },
  };
}

describe("garden-outing-individual (B3 outing + unlocks + individual summaries)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingIndividualInputs = {
      outingUnlocks: minimalOutingUnlocks(),
      individuals: { entries: [] },
    };
    const result = gardenOutingIndividual(inputs);
    expect(result).toEqual({
      outingUnlocks: gardenOutingUnlocks(inputs.outingUnlocks),
      individuals: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullInputs();
    const result = gardenOutingIndividual(inputs);
    expect(result.outingUnlocks).toEqual(
      gardenOutingUnlocks(inputs.outingUnlocks),
    );
    expect(result.individuals[0].summary).toEqual(
      individualBondSummary(
        individualFull().ledger,
        "creature-9",
        profile(),
        individualFull().factsByKeeper,
      ),
    );
    expect(result.individuals[1].summary).toEqual(
      individualBondSummary(
        individualFloor().ledger,
        "c",
        profile(),
        individualFloor().factsByKeeper,
      ),
    );
    // keeper-a: 20 - 2*1*3 = 14, above the party floor 5.
    // keeper-b: 8 - 1*1*2 = 6, above the storage floor 0.
    expect(result.individuals[0].summary.keepers[0]).toMatchObject({
      keeperId: "keeper-a",
      accrued: 20,
      totalDecay: 6,
      floorApplied: 5,
      effective: 14,
    });
    expect(result.individuals[0].summary.keepers[1]).toMatchObject({
      keeperId: "keeper-b",
      accrued: 8,
      totalDecay: 2,
      floorApplied: 0,
      effective: 6,
    });
    // Floor case: 10 - 20 = -10, floored back up to the party floor 5.
    expect(result.individuals[1].summary.keepers[0]).toMatchObject({
      accrued: 10,
      totalDecay: 20,
      floorApplied: 5,
      effective: 5,
    });
    expect(result.outingUnlocks.unlocks[0].result).toEqual({
      unlocked: ["u-level", "u-title", "u-any"],
      newlyUnlocked: ["u-title", "u-any"],
    });
  });

  it("outing-unlocks-only bundle", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: {
        outingJourney: minimalOutingJourney(),
        unlocks: { entries: [unlockFull()] },
      },
      individuals: { entries: [] },
    });
    expect(result.individuals).toEqual([]);
    expect(result.outingUnlocks.unlocks[0].result.unlocked).toEqual([
      "u-level",
      "u-title",
      "u-any",
    ]);
  });

  it("individuals with a minimal outing-unlocks section", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: { entries: [individualFull()] },
    });
    expect(result.outingUnlocks.unlocks).toEqual([]);
    expect(result.individuals[0].summary.keepers[0].effective).toBe(14);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: { entries: [individualFloor(), individualBase(), individualFull()] },
    });
    expect(result.individuals.map((entry) => entry.id)).toEqual([
      "ind-2",
      "ind-9",
      "ind-1",
    ]);
  });

  it("an individual with no ledger entries reads empty, never fabricated", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: {
        entries: [
          {
            id: "ind-none",
            ledger: ledgerFull(),
            creatureId: "creature-none",
            profile: profile(),
            factsByKeeper: {},
          },
        ],
      },
    });
    expect(result.individuals[0].summary).toEqual({
      creatureId: "creature-none",
      keepers: [],
    });
  });

  it("exact result shape: two sections only, no total-across-keepers field", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: { entries: [individualBase()] },
    });
    expect(Object.keys(result).sort()).toEqual([
      "individuals",
      "outingUnlocks",
    ]);
    expect(Object.keys(result.individuals[0]).sort()).toEqual([
      "id",
      "summary",
    ]);
    expect(Object.keys(result.individuals[0].summary).sort()).toEqual([
      "creatureId",
      "keepers",
    ]);
    expect(Object.keys(result.individuals[0].summary.keepers[0]).sort()).toEqual([
      "accrued",
      "contributions",
      "effective",
      "floorApplied",
      "keeperId",
      "totalDecay",
    ]);
    expect(result.outingUnlocks).not.toHaveProperty("individuals");
  });

  it("side-by-side-not-merged: individual facts are not read off the outing-unlocks section", () => {
    // The outing-unlocks bonds name only c-1; the individual names
    // creature-9 / keeper-a and still reports effective 14.
    const withUnlocks = gardenOutingIndividual({
      outingUnlocks: {
        outingJourney: minimalOutingJourney(),
        unlocks: { entries: [unlockFull()] },
      },
      individuals: { entries: [individualFull()] },
    });
    const minimal = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: { entries: [individualFull()] },
    });
    expect(withUnlocks.individuals[0].summary).toEqual(
      minimal.individuals[0].summary,
    );
    expect(withUnlocks.individuals[0].summary.keepers[0].effective).toBe(14);
    // A creature in individuals but absent from the outing-unlocks
    // records is still reported in individuals.
    expect(minimal.individuals[0].summary.creatureId).toBe("creature-9");
    // And an unlock level of 2 does not change the individual decay.
    expect(withUnlocks.outingUnlocks.unlocks[0].result.unlocked).toContain(
      "u-level",
    );
  });

  it("loud failures on malformed bundles and entries", () => {
    expect(() =>
      gardenOutingIndividual(null as unknown as GardenOutingIndividualInputs),
    ).toThrow();
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
      } as unknown as GardenOutingIndividualInputs),
    ).toThrow(/individuals inputs must be an object/);
    expect(() =>
      gardenOutingIndividual({
        individuals: { entries: [] },
      } as unknown as GardenOutingIndividualInputs),
    ).toThrow(/outingUnlocks inputs must be an object/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: { entries: "nope" as unknown as IndividualEntry[] },
      }),
    ).toThrow(/entries must be an array/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [{ ...individualBase(), id: "" }],
        },
      }),
    ).toThrow(/id must be a non-empty string/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [individualBase(), individualBase()],
        },
      }),
    ).toThrow(/duplicate individual entry id/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [{ ...individualBase(), ledger: "nope" as never }],
        },
      }),
    ).toThrow(/ledger must be an array/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [{ ...individualBase(), profile: null as never }],
        },
      }),
    ).toThrow(/profile must be an object/);
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [{ ...individualBase(), factsByKeeper: [] as never }],
        },
      }),
    ).toThrow(/factsByKeeper must be an object/);
  });

  it("loud failures propagate from both composed reads", () => {
    // Individual read: duplicate bond pair.
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [
            {
              id: "ind-dup",
              ledger: [
                { creatureId: "c", keeperId: "k", value: 1 },
                { creatureId: "c", keeperId: "k", value: 2 },
              ],
              creatureId: "c",
              profile: profile(),
              factsByKeeper: {},
            },
          ],
        },
      }),
    ).toThrow(/duplicate bond pair/);
    // Individual read: facts for a keeper with no bond entry.
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [
            {
              id: "ind-ghost",
              ledger: ledgerFull(),
              creatureId: "creature-9",
              profile: profile(),
              factsByKeeper: {
                "keeper-ghost": [fact("absence", "party", 1)],
              },
            },
          ],
        },
      }),
    ).toThrow(/no bond entry/);
    // Individual read: bad profile.
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: minimalOutingUnlocks(),
        individuals: {
          entries: [
            {
              ...individualBase(),
              profile: {} as unknown as DecayProfile,
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-unlocks read: duplicate unlock entry id propagates.
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: {
          outingJourney: minimalOutingJourney(),
          unlocks: { entries: [unlockFull(), unlockFull()] },
        },
        individuals: { entries: [] },
      }),
    ).toThrow(/duplicate unlock entry id/);
    // Outing-unlocks read: duplicate journey entry id propagates
    // through this bundle too.
    expect(() =>
      gardenOutingIndividual({
        outingUnlocks: {
          outingJourney: {
            outingSnapshot: {
              outingCheckin: outingCheckinBase(),
              snapshots: { entries: [] },
            },
            journeys: {
              entries: [
                { id: "jn-9", inputs: journeyBase() },
                { id: "jn-9", inputs: journeyBase() },
              ],
            },
          } satisfies GardenOutingJourneyInputs,
          unlocks: { entries: [] },
        },
        individuals: { entries: [] },
      }),
    ).toThrow(/duplicate journey entry id/);
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const first = gardenOutingIndividual(inputs);
    first.individuals[0].summary.keepers[0].contributions[0].amount = -999;
    first.individuals[0].summary.keepers[0].effective = -999;
    first.outingUnlocks.unlocks[0].result.unlocked.push("u-mutated");
    const second = gardenOutingIndividual(inputs);
    expect(second.individuals[0].summary.keepers[0].contributions[0].amount).toBe(6);
    expect(second.individuals[0].summary.keepers[0].effective).toBe(14);
    expect(second.outingUnlocks.unlocks[0].result.unlocked).toEqual([
      "u-level",
      "u-title",
      "u-any",
    ]);
    expect(inputs.individuals.entries[0].id).toBe("ind-1");
    expect(inputs.outingUnlocks.unlocks.entries[0].id).toBe("un-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingIndividual({
      outingUnlocks: minimalOutingUnlocks(),
      individuals: {
        entries: [
          {
            id: "ind/α-1 :: odd",
            ledger: [{ creatureId: "tok-77", keeperId: "tok-12", value: 3 }],
            creatureId: "tok-77",
            profile: profile(),
            factsByKeeper: {},
          },
        ],
      },
    });
    expect(result.individuals[0].id).toBe("ind/α-1 :: odd");
    expect(result.individuals[0].summary.keepers[0]).toMatchObject({
      keeperId: "tok-12",
      accrued: 3,
      effective: 3,
    });
  });

  it("staging locks: no host or composed module imports the outing-individual bundle yet", async () => {
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
      "./garden-comfort.ts",
      "./garden-thanks.ts",
      "./garden-level.ts",
      "./garden-record.ts",
      "./garden-inbound.ts",
      "./garden-news.ts",
      "./garden-autonomous.ts",
      "./garden-checkin.ts",
      "./garden-snapshot.ts",
      "./garden-journey.ts",
      "./garden-outing.ts",
      "./garden-outing-bonds.ts",
      "./garden-outing-decay.ts",
      "./garden-outing-comfort.ts",
      "./garden-outing-thanks.ts",
      "./garden-outing-level.ts",
      "./garden-outing-record.ts",
      "./garden-outing-checkin.ts",
      "./garden-outing-snapshot.ts",
      "./garden-outing-journey.ts",
      "./garden-outing-unlocks.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-individual");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-individual.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
