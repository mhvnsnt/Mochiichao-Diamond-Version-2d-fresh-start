import { describe, expect, it } from "vitest";
import {
  gardenOutingTeachers,
  type GardenOutingTeachersInputs,
  type TeacherEntry,
} from "./garden-outing-teachers";
import {
  gardenOutingIndividual,
  type GardenOutingIndividualInputs,
  type IndividualEntry,
} from "./garden-outing-individual";
import { gardenOutingUnlocks } from "./garden-outing-unlocks";
import type { GardenOutingUnlocksInputs, UnlockEntry } from "./garden-outing-unlocks";
import { individualBondSummary } from "./garden-individual";
import { taughtAxes, teachersForMeetings } from "./garden-teachers";
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
import type { GardenOutingJourneyInputs } from "./garden-outing-journey";
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

function minimalOutingIndividual(): GardenOutingIndividualInputs {
  return {
    outingUnlocks: minimalOutingUnlocks(),
    individuals: { entries: [] },
  };
}

function fullOutingIndividual(): GardenOutingIndividualInputs {
  return {
    outingUnlocks: {
      outingJourney: minimalOutingJourney(),
      unlocks: { entries: [unlockFull()] },
    },
    individuals: { entries: [individualFull()] },
  };
}

function teacherFull(): TeacherEntry {
  return {
    id: "t-1",
    mapping: {
      "sp-a": ["ax-1", "ax-2"],
      "sp-b": ["ax-2", "ax-3"],
      "sp-empty": [],
    },
    meetings: [
      { speciesId: "sp-b", at: 5 },
      { speciesId: "sp-a", at: 2 },
      { speciesId: "sp-a", at: 9 },
      { speciesId: "sp-unmapped", at: 1 },
      { speciesId: "sp-empty", at: 3 },
    ],
  };
}

function teacherMapForm(): TeacherEntry {
  return {
    id: "t-2",
    mapping: new Map([["sp-m", ["ax-m"]]]),
    meetings: [{ speciesId: "sp-m", at: 4 }],
  };
}

function teacherBase(): TeacherEntry {
  return {
    id: "t-9",
    mapping: { "sp-9": ["ax-9"] },
    meetings: [{ speciesId: "sp-9", at: 7 }],
  };
}

function fullInputs(): GardenOutingTeachersInputs {
  return {
    outingIndividual: fullOutingIndividual(),
    teachers: { entries: [teacherFull(), teacherMapForm()] },
  };
}

describe("garden-outing-teachers (B3 outing + individuals + teacher readings)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingTeachersInputs = {
      outingIndividual: minimalOutingIndividual(),
      teachers: { entries: [] },
    };
    const result = gardenOutingTeachers(inputs);
    expect(result).toEqual({
      outingIndividual: gardenOutingIndividual(inputs.outingIndividual),
      teachers: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullInputs();
    const result = gardenOutingTeachers(inputs);
    expect(result.outingIndividual).toEqual(
      gardenOutingIndividual(inputs.outingIndividual),
    );
    expect(result.teachers[0].teachers).toEqual(
      teachersForMeetings(teacherFull().mapping, teacherFull().meetings),
    );
    expect(result.teachers[0].taughtAxes).toEqual(
      taughtAxes(teacherFull().mapping, teacherFull().meetings),
    );
    expect(result.teachers[1].teachers).toEqual(
      teachersForMeetings(teacherMapForm().mapping, teacherMapForm().meetings),
    );
    // First-met order: sp-a at 2, sp-empty at 3, sp-b at 5;
    // unmapped sp-unmapped excluded, second sp-a meeting ignored.
    expect(result.teachers[0].teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 2, axes: ["ax-1", "ax-2"] },
      { speciesId: "sp-empty", firstMetAt: 3, axes: [] },
      { speciesId: "sp-b", firstMetAt: 5, axes: ["ax-2", "ax-3"] },
    ]);
    // Union in first-appearance order: ax-1, ax-2, then ax-3.
    expect(result.teachers[0].taughtAxes).toEqual(["ax-1", "ax-2", "ax-3"]);
    expect(result.teachers[1].teachers).toEqual([
      { speciesId: "sp-m", firstMetAt: 4, axes: ["ax-m"] },
    ]);
    expect(result.teachers[1].taughtAxes).toEqual(["ax-m"]);
    // Inherited sections still report their own numbers.
    expect(result.outingIndividual.individuals[0].summary.keepers[0]).toMatchObject({
      keeperId: "keeper-a",
      accrued: 20,
      totalDecay: 6,
      effective: 14,
    });
    expect(result.outingIndividual.outingUnlocks.unlocks[0].result).toEqual({
      unlocked: ["u-level", "u-title", "u-any"],
      newlyUnlocked: ["u-title", "u-any"],
    });
    expect(result.outingIndividual).toEqual(
      gardenOutingIndividual(fullOutingIndividual()),
    );
    expect(result.teachers[0].teachers).not.toContainEqual(
      expect.objectContaining({ speciesId: "sp-unmapped" }),
    );
  });

  it("outing-individual-only bundle", () => {
    const result = gardenOutingTeachers({
      outingIndividual: fullOutingIndividual(),
      teachers: { entries: [] },
    });
    expect(result.teachers).toEqual([]);
    expect(result.outingIndividual.individuals[0].summary.keepers[0].effective).toBe(14);
  });

  it("teachers with a minimal outing-individual section", () => {
    const result = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: { entries: [teacherFull()] },
    });
    expect(result.outingIndividual.individuals).toEqual([]);
    expect(result.teachers[0].taughtAxes).toEqual(["ax-1", "ax-2", "ax-3"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: { entries: [teacherMapForm(), teacherBase(), teacherFull()] },
    });
    expect(result.teachers.map((entry) => entry.id)).toEqual(["t-2", "t-9", "t-1"]);
  });

  it("a teacher entry with no teachers reads empty, never fabricated", () => {
    const result = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: {
        entries: [
          { id: "t-none", mapping: {}, meetings: [] },
          {
            id: "t-unmapped",
            mapping: { "sp-a": ["ax-1"] },
            meetings: [{ speciesId: "sp-x", at: 1 }],
          },
        ],
      },
    });
    expect(result.teachers).toEqual([
      { id: "t-none", teachers: [], taughtAxes: [] },
      { id: "t-unmapped", teachers: [], taughtAxes: [] },
    ]);
  });

  it("exact result shape: two sections only, no total-across-teachers field", () => {
    const result = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: { entries: [teacherBase()] },
    });
    expect(Object.keys(result).sort()).toEqual([
      "outingIndividual",
      "teachers",
    ]);
    expect(Object.keys(result.teachers[0]).sort()).toEqual([
      "id",
      "taughtAxes",
      "teachers",
    ]);
    expect(Object.keys(result.teachers[0].teachers[0]).sort()).toEqual([
      "axes",
      "firstMetAt",
      "speciesId",
    ]);
    expect(result.outingIndividual).not.toHaveProperty("teachers");
  });

  it("side-by-side-not-merged: teacher facts are not read off the outing-individual section", () => {
    const withIndividuals = gardenOutingTeachers({
      outingIndividual: fullOutingIndividual(),
      teachers: { entries: [teacherFull()] },
    });
    const minimal = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: { entries: [teacherFull()] },
    });
    expect(withIndividuals.teachers[0]).toEqual(minimal.teachers[0]);
    expect(withIndividuals.teachers[0].taughtAxes).toEqual(["ax-1", "ax-2", "ax-3"]);
    // A species in teachers but absent from the outing bonds (c-1)
    // is still reported in teachers.
    expect(minimal.teachers[0].teachers[0].speciesId).toBe("sp-a");
    // And an unlock level of 2 does not change the teacher union.
    expect(withIndividuals.outingIndividual.outingUnlocks.unlocks[0].result.unlocked).toContain(
      "u-level",
    );
  });

  it("loud failures on malformed bundles and entries", () => {
    expect(() =>
      gardenOutingTeachers(null as unknown as GardenOutingTeachersInputs),
    ).toThrow();
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
      } as unknown as GardenOutingTeachersInputs),
    ).toThrow(/teachers inputs must be an object/);
    expect(() =>
      gardenOutingTeachers({
        teachers: { entries: [] },
      } as unknown as GardenOutingTeachersInputs),
    ).toThrow(/outingIndividual inputs must be an object/);
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: { entries: "nope" as unknown as TeacherEntry[] },
      }),
    ).toThrow(/entries must be an array/);
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [{ ...teacherBase(), id: "" }],
        },
      }),
    ).toThrow(/id must be a non-empty string/);
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [teacherBase(), teacherBase()],
        },
      }),
    ).toThrow(/duplicate teacher entry id/);
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [{ ...teacherBase(), mapping: "nope" as never }],
        },
      }),
    ).toThrow(/mapping must be a Map or a plain record/);
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [{ ...teacherBase(), meetings: "nope" as never }],
        },
      }),
    ).toThrow(/meetings must be an array/);
  });

  it("loud failures propagate from both composed reads", () => {
    // Teachers read: duplicate axis within one species.
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [
            {
              id: "t-dupaxis",
              mapping: { "sp-a": ["ax-1", "ax-1"] },
              meetings: [{ speciesId: "sp-a", at: 1 }],
            },
          ],
        },
      }),
    ).toThrow(/repeats axis/);
    // Teachers read: non-finite meeting stamp.
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: minimalOutingIndividual(),
        teachers: {
          entries: [
            {
              id: "t-badstamp",
              mapping: { "sp-a": ["ax-1"] },
              meetings: [{ speciesId: "sp-a", at: Number.NaN }],
            },
          ],
        },
      }),
    ).toThrow(/at must be a finite number/);
    // Outing-individual read: duplicate individual entry id propagates.
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: {
          outingUnlocks: minimalOutingUnlocks(),
          individuals: {
            entries: [
              {
                id: "ind-9",
                ledger: [{ creatureId: "c-9", keeperId: "k-9", value: 7 }],
                creatureId: "c-9",
                profile: profile(),
                factsByKeeper: {},
              },
              {
                id: "ind-9",
                ledger: [{ creatureId: "c-9", keeperId: "k-9", value: 7 }],
                creatureId: "c-9",
                profile: profile(),
                factsByKeeper: {},
              },
            ],
          },
        },
        teachers: { entries: [] },
      }),
    ).toThrow(/duplicate individual entry id/);
    // Outing-unlocks read: duplicate unlock entry id propagates.
    expect(() =>
      gardenOutingTeachers({
        outingIndividual: {
          outingUnlocks: {
            outingJourney: minimalOutingJourney(),
            unlocks: { entries: [unlockFull(), unlockFull()] },
          },
          individuals: { entries: [] },
        },
        teachers: { entries: [] },
      }),
    ).toThrow(/duplicate unlock entry id/);
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const first = gardenOutingTeachers(inputs);
    first.teachers[0].teachers[0].axes.push("ax-mutated");
    first.teachers[0].taughtAxes.push("ax-mutated");
    first.outingIndividual.individuals[0].summary.keepers[0].effective = -999;
    first.outingIndividual.outingUnlocks.unlocks[0].result.unlocked.push("u-mutated");
    const second = gardenOutingTeachers(inputs);
    expect(second.teachers[0].teachers[0].axes).toEqual(["ax-1", "ax-2"]);
    expect(second.teachers[0].taughtAxes).toEqual(["ax-1", "ax-2", "ax-3"]);
    expect(second.outingIndividual.individuals[0].summary.keepers[0].effective).toBe(14);
    expect(second.outingIndividual.outingUnlocks.unlocks[0].result.unlocked).toEqual([
      "u-level",
      "u-title",
      "u-any",
    ]);
    expect(inputs.teachers.entries[0].id).toBe("t-1");
    expect(inputs.outingIndividual.outingUnlocks.unlocks.entries[0].id).toBe("un-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingTeachers({
      outingIndividual: minimalOutingIndividual(),
      teachers: {
        entries: [
          {
            id: "t/α-1 :: odd",
            mapping: { "tok-77": ["tok-axis"] },
            meetings: [{ speciesId: "tok-77", at: 3 }],
          },
        ],
      },
    });
    expect(result.teachers[0].id).toBe("t/α-1 :: odd");
    expect(result.teachers[0].teachers[0]).toEqual({
      speciesId: "tok-77",
      firstMetAt: 3,
      axes: ["tok-axis"],
    });
  });

  it("staging locks: no host or composed module imports the outing-teachers bundle yet", async () => {
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
      "./garden-outing-individual.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-teachers");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-teachers.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
