import { describe, expect, it } from "vitest";
import {
  gardenOutingMovement,
  type GardenOutingMovementInputs,
  type MovementEntry,
} from "./garden-outing-movement";
import {
  currentHome,
  isGardenResident,
  movementsForCreature,
  type MovementLog,
} from "./garden-movement";
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

function movementLogFull(): MovementLog {
  return [
    { id: "mv-2", creatureId: "c-9", verb: "transfer", from: "home-a", to: "home-b", at: 5 },
    { id: "mv-1", creatureId: "c-9", verb: "gift", from: null, to: "home-a", at: 1 },
    { id: "mv-3", creatureId: "c-9", verb: "garden-arrival", from: "home-b", to: "garden-home", at: 9 },
    { id: "mv-x", creatureId: "c-other", verb: "gift", from: null, to: "home-z", at: 2 },
  ];
}

function movementFull(): MovementEntry {
  return { id: "m-1", creatureId: "c-9", log: movementLogFull(), gardenHomes: ["garden-home", "home-a"] };
}

function movementSetForm(): MovementEntry {
  return { id: "m-2", creatureId: "c-9", log: movementLogFull(), gardenHomes: new Set(["garden-home"]) };
}

function movementBase(): MovementEntry {
  return {
    id: "m-9",
    creatureId: "c-9",
    log: [{ id: "mv-b", creatureId: "c-9", verb: "transfer", from: "home-a", to: "home-b", at: 7 }],
    gardenHomes: ["garden-home"],
  };
}

function minimalOutingTeachers(): GardenOutingTeachersInputs {
  return { outingIndividual: minimalOutingIndividual(), teachers: { entries: [] } };
}

function fullMovementInputs(): GardenOutingMovementInputs {
  return {
    outingTeachers: fullInputs(),
    movement: { entries: [movementFull(), movementSetForm()] },
  };
}

describe("garden-outing-movement (B3 outing + teachers + doorway movement readings)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingMovementInputs = {
      outingTeachers: minimalOutingTeachers(),
      movement: { entries: [] },
    };
    const result = gardenOutingMovement(inputs);
    expect(result).toEqual({
      outingTeachers: gardenOutingTeachers(inputs.outingTeachers),
      movement: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullMovementInputs();
    const result = gardenOutingMovement(inputs);
    expect(result.outingTeachers).toEqual(
      gardenOutingTeachers(inputs.outingTeachers),
    );
    expect(result.movement[0].movements).toEqual(
      movementsForCreature(movementFull().log, "c-9"),
    );
    // Sorted by stamp, not insertion order: gift at 1, transfer at 5, arrival at 9;
    // the other creature's record is excluded.
    expect(result.movement[0].movements.map((record) => record.id)).toEqual([
      "mv-1",
      "mv-2",
      "mv-3",
    ]);
    expect(result.movement[0].currentHome).toBe("garden-home");
    expect(result.movement[0].currentHome).toBe(
      currentHome(movementFull().log, "c-9"),
    );
    expect(result.movement[0].resident).toBe(true);
    expect(result.movement[0].resident).toBe(
      isGardenResident(movementFull().log, "c-9", ["garden-home", "home-a"]),
    );
    // Set form of the Garden homes reads the same.
    expect(result.movement[1].movements).toEqual(result.movement[0].movements);
    expect(result.movement[1].currentHome).toBe("garden-home");
    expect(result.movement[1].resident).toBe(true);
    // Inherited sections still report their own numbers.
    expect(result.outingTeachers.teachers[0].taughtAxes).toEqual([
      "ax-1",
      "ax-2",
      "ax-3",
    ]);
    expect(
      result.outingTeachers.outingIndividual.individuals[0].summary.keepers[0],
    ).toMatchObject({ keeperId: "keeper-a", accrued: 20, totalDecay: 6, effective: 14 });
    expect(result.outingTeachers).toEqual(
      gardenOutingTeachers(fullInputs()),
    );
  });

  it("outing-teachers-only bundle", () => {
    const result = gardenOutingMovement({
      outingTeachers: fullInputs(),
      movement: { entries: [] },
    });
    expect(result.movement).toEqual([]);
    expect(result.outingTeachers.teachers[0].taughtAxes).toEqual([
      "ax-1",
      "ax-2",
      "ax-3",
    ]);
  });

  it("movement with a minimal outing-teachers section", () => {
    const result = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: { entries: [movementFull()] },
    });
    expect(result.outingTeachers).not.toHaveProperty("movement");
    expect(result.outingTeachers.teachers).toEqual([]);
    expect(result.movement[0].currentHome).toBe("garden-home");
    expect(result.movement[0].resident).toBe(true);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: { entries: [movementSetForm(), movementBase(), movementFull()] },
    });
    expect(result.movement.map((entry) => entry.id)).toEqual(["m-2", "m-9", "m-1"]);
  });

  it("an entry with no movements, and a departed entry, read honestly, never fabricated", () => {
    const result = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: {
        entries: [
          { id: "m-none", creatureId: "c-none", log: [], gardenHomes: ["garden-home"] },
          {
            id: "m-left",
            creatureId: "c-9",
            log: [
              { id: "mv-in", creatureId: "c-9", verb: "garden-arrival", from: "home-a", to: "garden-home", at: 1 },
              { id: "mv-out", creatureId: "c-9", verb: "garden-departure", from: "garden-home", to: "wild-x", at: 2 },
            ],
            gardenHomes: ["garden-home"],
          },
        ],
      },
    });
    expect(result.movement).toEqual([
      { id: "m-none", creatureId: "c-none", movements: [], currentHome: null, resident: false },
      {
        id: "m-left",
        creatureId: "c-9",
        movements: [
          { id: "mv-in", creatureId: "c-9", verb: "garden-arrival", from: "home-a", to: "garden-home", at: 1 },
          { id: "mv-out", creatureId: "c-9", verb: "garden-departure", from: "garden-home", to: "wild-x", at: 2 },
        ],
        currentHome: "wild-x",
        resident: false,
      },
    ]);
  });

  it("exact result shape: two sections only, no merged residents field", () => {
    const result = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: { entries: [movementBase()] },
    });
    expect(Object.keys(result).sort()).toEqual(["movement", "outingTeachers"]);
    expect(Object.keys(result.movement[0]).sort()).toEqual([
      "creatureId",
      "currentHome",
      "id",
      "movements",
      "resident",
    ]);
    expect(Object.keys(result.movement[0].movements[0]).sort()).toEqual([
      "at",
      "creatureId",
      "from",
      "id",
      "to",
      "verb",
    ]);
    expect(result.outingTeachers).not.toHaveProperty("movement");
    expect(result).not.toHaveProperty("residents");
  });

  it("side-by-side-not-merged: movement facts are not read off the outing-teachers section", () => {
    const withTeachers = gardenOutingMovement({
      outingTeachers: fullInputs(),
      movement: { entries: [movementFull()] },
    });
    const minimal = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: { entries: [movementFull()] },
    });
    expect(withTeachers.movement[0]).toEqual(minimal.movement[0]);
    expect(withTeachers.movement[0].currentHome).toBe("garden-home");
    // A creature in the movement log but absent from the outing bonds (c-1)
    // is still reported in movement.
    expect(minimal.movement[0].creatureId).toBe("c-9");
    // And an unlock level of 2 does not change the doorway reading.
    expect(
      withTeachers.outingTeachers.outingIndividual.outingUnlocks.unlocks[0].result.unlocked,
    ).toContain("u-level");
  });

  it("loud failures on malformed bundles and entries", () => {
    expect(() =>
      gardenOutingMovement(null as unknown as GardenOutingMovementInputs),
    ).toThrow();
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
      } as unknown as GardenOutingMovementInputs),
    ).toThrow(/movement inputs must be an object/);
    expect(() =>
      gardenOutingMovement({
        movement: { entries: [] },
      } as unknown as GardenOutingMovementInputs),
    ).toThrow(/outingTeachers inputs must be an object/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: "nope" as unknown as MovementEntry[] },
      }),
    ).toThrow(/entries must be an array/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: [{ ...movementBase(), id: "" }] },
      }),
    ).toThrow(/id must be a non-empty string/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: [movementBase(), movementBase()] },
      }),
    ).toThrow(/duplicate movement entry id/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: [{ ...movementBase(), creatureId: "" }] },
      }),
    ).toThrow(/creatureId must be a non-empty string/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: [{ ...movementBase(), log: "nope" as never }] },
      }),
    ).toThrow(/log must be an array/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: { entries: [{ ...movementBase(), gardenHomes: "garden-home" as never }] },
      }),
    ).toThrow(/gardenHomes must be a Set or an array/);
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: {
          entries: [
            {
              ...movementBase(),
              log: [{ id: "mv-bad", creatureId: "c-9", verb: "teleport", from: null, to: "home-a", at: 1 }] as never,
            },
          ],
        },
      }),
    ).toThrow(/unknown movement verb/);
  });

  it("loud failures propagate from both composed reads", () => {
    // Movement read: non-finite doorway stamp.
    expect(() =>
      gardenOutingMovement({
        outingTeachers: minimalOutingTeachers(),
        movement: {
          entries: [
            {
              ...movementBase(),
              log: [{ id: "mv-nan", creatureId: "c-9", verb: "gift", from: null, to: "home-a", at: Number.NaN }],
            },
          ],
        },
      }),
    ).toThrow(/at must be a finite number/);
    // Outing-teachers read: duplicate teacher entry id propagates.
    expect(() =>
      gardenOutingMovement({
        outingTeachers: {
          outingIndividual: minimalOutingIndividual(),
          teachers: { entries: [teacherBase(), teacherBase()] },
        },
        movement: { entries: [] },
      }),
    ).toThrow(/duplicate teacher entry id/);
    // Outing-individual read: duplicate individual entry id propagates.
    expect(() =>
      gardenOutingMovement({
        outingTeachers: {
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
        },
        movement: { entries: [] },
      }),
    ).toThrow(/duplicate individual entry id/);
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullMovementInputs();
    const first = gardenOutingMovement(inputs);
    first.movement[0].movements[0].to = "mutated-home";
    first.movement[0].movements.push({
      id: "mv-mutated", creatureId: "c-9", verb: "gift", from: null, to: "home-a", at: 99,
    });
    first.outingTeachers.teachers[0].teachers[0].axes.push("ax-mutated");
    first.outingTeachers.outingIndividual.individuals[0].summary.keepers[0].effective = -999;
    const second = gardenOutingMovement(inputs);
    expect(second.movement[0].movements.map((record) => record.id)).toEqual([
      "mv-1",
      "mv-2",
      "mv-3",
    ]);
    expect(second.movement[0].movements[0].to).toBe("home-a");
    expect(second.movement[0].currentHome).toBe("garden-home");
    expect(second.outingTeachers.teachers[0].teachers[0].axes).toEqual(["ax-1", "ax-2"]);
    expect(second.outingTeachers.outingIndividual.individuals[0].summary.keepers[0].effective).toBe(14);
    expect(inputs.movement.entries[0].id).toBe("m-1");
    expect(inputs.movement.entries[0].log[0].id).toBe("mv-2");
    expect(inputs.outingTeachers.teachers.entries[0].id).toBe("t-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingMovement({
      outingTeachers: minimalOutingTeachers(),
      movement: {
        entries: [
          {
            id: "m/α-1 :: odd",
            creatureId: "tok-77",
            log: [{ id: "mv-77", creatureId: "tok-77", verb: "gift", from: null, to: "tok-home", at: 3 }],
            gardenHomes: ["tok-home"],
          },
        ],
      },
    });
    expect(result.movement[0].id).toBe("m/α-1 :: odd");
    expect(result.movement[0]).toEqual({
      id: "m/α-1 :: odd",
      creatureId: "tok-77",
      movements: [{ id: "mv-77", creatureId: "tok-77", verb: "gift", from: null, to: "tok-home", at: 3 }],
      currentHome: "tok-home",
      resident: true,
    });
  });

  it("staging locks: no host or composed module imports the outing-movement bundle yet", async () => {
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
      "./garden-outing-teachers.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-movement");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-movement.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
