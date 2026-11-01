import { describe, expect, it } from "vitest";
import {
  gardenOutingArrivals,
  type ArrivalEntry,
  type GardenOutingArrivalsInputs,
} from "./garden-outing-arrivals";
import { arrivals } from "./garden-arrivals";
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

function arrivalLogFull(): MovementLog {
  return [
    { id: "av-2", creatureId: "c-9", verb: "transfer", from: "garden-home", to: "home-b", at: 5 },
    { id: "av-1", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 1 },
    { id: "av-3", creatureId: "c-9", verb: "garden-arrival", from: "home-b", to: "garden-home", at: 9 },
    { id: "av-x", creatureId: "c-other", verb: "garden-arrival", from: null, to: "garden-home", at: 2 },
  ];
}

function arrivalFull(): ArrivalEntry {
  return { id: "a-1", log: arrivalLogFull(), gardenHomes: ["garden-home", "home-a"] };
}

function arrivalSetForm(): ArrivalEntry {
  return { id: "a-2", log: arrivalLogFull(), gardenHomes: new Set(["garden-home"]) };
}

function arrivalBase(): ArrivalEntry {
  return {
    id: "a-9",
    log: [{ id: "av-b", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 7 }],
    gardenHomes: ["garden-home"],
  };
}

function minimalOutingMovement(): GardenOutingMovementInputs {
  return { outingTeachers: minimalOutingTeachers(), movement: { entries: [] } };
}

function fullArrivalsInputs(): GardenOutingArrivalsInputs {
  return {
    outingMovement: fullMovementInputs(),
    arrivals: { entries: [arrivalFull(), arrivalSetForm()] },
  };
}

describe("garden-outing-arrivals (B3 outing + movement + Garden arrival readings)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingArrivalsInputs = {
      outingMovement: minimalOutingMovement(),
      arrivals: { entries: [] },
    };
    const result = gardenOutingArrivals(inputs);
    expect(result).toEqual({
      outingMovement: gardenOutingMovement(inputs.outingMovement),
      arrivals: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullArrivalsInputs();
    const result = gardenOutingArrivals(inputs);
    expect(result.outingMovement).toEqual(
      gardenOutingMovement(inputs.outingMovement),
    );
    expect(result.arrivals[0].arrivals).toEqual(
      arrivals(arrivalFull().log, arrivalFull().gardenHomes),
    );
    // First-arrival order: c-9 first at 1, c-other at 2; the transfer
    // record at 5 never counts as an arrival.
    expect(result.arrivals[0].arrivals.map((entry) => entry.creatureId)).toEqual([
      "c-9",
      "c-other",
    ]);
    expect(result.arrivals[0].arrivals[0]).toEqual({
      creatureId: "c-9",
      firstArrivedAt: 1,
      lastArrivedAt: 9,
      arrivalCount: 2,
      lastArrivalRecordId: "av-3",
      lastArrivalTo: "garden-home",
      currentlyResident: true,
    });
    expect(result.arrivals[0].arrivals[1]).toEqual({
      creatureId: "c-other",
      firstArrivedAt: 2,
      lastArrivedAt: 2,
      arrivalCount: 1,
      lastArrivalRecordId: "av-x",
      lastArrivalTo: "garden-home",
      currentlyResident: true,
    });
    // Set form of the Garden homes reads the same.
    expect(result.arrivals[1].arrivals).toEqual(result.arrivals[0].arrivals);
    // Inherited sections still report their own numbers.
    expect(result.outingMovement.outingTeachers.teachers[0].taughtAxes).toEqual([
      "ax-1",
      "ax-2",
      "ax-3",
    ]);
    expect(
      result.outingMovement.outingTeachers.outingIndividual.individuals[0].summary.keepers[0],
    ).toMatchObject({ keeperId: "keeper-a", accrued: 20, totalDecay: 6, effective: 14 });
    expect(result.outingMovement).toEqual(
      gardenOutingMovement(fullMovementInputs()),
    );
  });

  it("outing-movement-only bundle", () => {
    const result = gardenOutingArrivals({
      outingMovement: fullMovementInputs(),
      arrivals: { entries: [] },
    });
    expect(result.arrivals).toEqual([]);
    expect(result.outingMovement.outingTeachers.teachers[0].taughtAxes).toEqual([
      "ax-1",
      "ax-2",
      "ax-3",
    ]);
  });

  it("arrivals with a minimal outing-movement section", () => {
    const result = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: { entries: [arrivalFull()] },
    });
    expect(result.outingMovement).not.toHaveProperty("arrivals");
    expect(result.outingMovement.outingTeachers.teachers).toEqual([]);
    expect(result.arrivals[0].arrivals[0].arrivalCount).toBe(2);
    expect(result.arrivals[0].arrivals[0].currentlyResident).toBe(true);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: { entries: [arrivalSetForm(), arrivalBase(), arrivalFull()] },
    });
    expect(result.arrivals.map((entry) => entry.id)).toEqual(["a-2", "a-9", "a-1"]);
  });

  it("an entry with no arrivals, and a departed entry, read honestly, never fabricated", () => {
    const result = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: {
        entries: [
          { id: "a-none", log: [], gardenHomes: ["garden-home"] },
          {
            id: "a-left",
            log: [
              { id: "av-in", creatureId: "c-9", verb: "garden-arrival", from: "home-a", to: "garden-home", at: 1 },
              { id: "av-out", creatureId: "c-9", verb: "garden-departure", from: "garden-home", to: "wild-x", at: 2 },
            ],
            gardenHomes: ["garden-home"],
          },
        ],
      },
    });
    expect(result.arrivals).toEqual([
      { id: "a-none", arrivals: [] },
      {
        id: "a-left",
        arrivals: [
          {
            creatureId: "c-9",
            firstArrivedAt: 1,
            lastArrivedAt: 1,
            arrivalCount: 1,
            lastArrivalRecordId: "av-in",
            lastArrivalTo: "garden-home",
            currentlyResident: false,
          },
        ],
      },
    ]);
  });

  it("exact result shape: two sections only, no merged residents field", () => {
    const result = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: { entries: [arrivalBase()] },
    });
    expect(Object.keys(result).sort()).toEqual(["arrivals", "outingMovement"]);
    expect(Object.keys(result.arrivals[0]).sort()).toEqual(["arrivals", "id"]);
    expect(Object.keys(result.arrivals[0].arrivals[0]).sort()).toEqual([
      "arrivalCount",
      "creatureId",
      "currentlyResident",
      "firstArrivedAt",
      "lastArrivalRecordId",
      "lastArrivalTo",
      "lastArrivedAt",
    ]);
    expect(result.outingMovement).not.toHaveProperty("arrivals");
    expect(result).not.toHaveProperty("residents");
  });

  it("side-by-side-not-merged: arrival facts are not read off the outing-movement section", () => {
    const withMovement = gardenOutingArrivals({
      outingMovement: fullMovementInputs(),
      arrivals: { entries: [arrivalFull()] },
    });
    const minimal = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: { entries: [arrivalFull()] },
    });
    expect(withMovement.arrivals[0]).toEqual(minimal.arrivals[0]);
    expect(withMovement.arrivals[0].arrivals[0].arrivalCount).toBe(2);
    // A creature in the arrivals log but absent from the outing bonds (c-1)
    // is still reported in arrivals.
    expect(minimal.arrivals[0].arrivals[0].creatureId).toBe("c-9");
    // And an unlock level of 2 does not change the arrivals reading.
    expect(
      withMovement.outingMovement.outingTeachers.outingIndividual.outingUnlocks.unlocks[0].result.unlocked,
    ).toContain("u-level");
  });

  it("loud failures on malformed bundles and entries", () => {
    expect(() =>
      gardenOutingArrivals(null as unknown as GardenOutingArrivalsInputs),
    ).toThrow();
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
      } as unknown as GardenOutingArrivalsInputs),
    ).toThrow(/arrivals inputs must be an object/);
    expect(() =>
      gardenOutingArrivals({
        arrivals: { entries: [] },
      } as unknown as GardenOutingArrivalsInputs),
    ).toThrow(/outingMovement inputs must be an object/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: { entries: "nope" as unknown as ArrivalEntry[] },
      }),
    ).toThrow(/entries must be an array/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: { entries: [{ ...arrivalBase(), id: "" }] },
      }),
    ).toThrow(/id must be a non-empty string/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: { entries: [arrivalBase(), arrivalBase()] },
      }),
    ).toThrow(/duplicate arrival entry id/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: { entries: [{ ...arrivalBase(), log: "nope" as never }] },
      }),
    ).toThrow(/log must be an array/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: { entries: [{ ...arrivalBase(), gardenHomes: "garden-home" as never }] },
      }),
    ).toThrow(/gardenHomes must be a Set or an array/);
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: {
          entries: [
            {
              ...arrivalBase(),
              log: [{ id: "av-bad", creatureId: "c-9", verb: "teleport", from: null, to: "home-a", at: 1 }] as never,
            },
          ],
        },
      }),
    ).toThrow(/unknown movement verb/);
  });

  it("loud failures propagate from both composed reads", () => {
    // Arrivals read: duplicate movement record id.
    expect(() =>
      gardenOutingArrivals({
        outingMovement: minimalOutingMovement(),
        arrivals: {
          entries: [
            {
              ...arrivalBase(),
              log: [
                { id: "av-dup", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 1 },
                { id: "av-dup", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 2 },
              ],
            },
          ],
        },
      }),
    ).toThrow(/duplicate movement record id/);
    // Outing-movement read: duplicate movement entry id propagates.
    expect(() =>
      gardenOutingArrivals({
        outingMovement: {
          outingTeachers: minimalOutingTeachers(),
          movement: { entries: [movementBase(), movementBase()] },
        },
        arrivals: { entries: [] },
      }),
    ).toThrow(/duplicate movement entry id/);
    // Outing-teachers read: duplicate teacher entry id propagates.
    expect(() =>
      gardenOutingArrivals({
        outingMovement: {
          outingTeachers: {
            outingIndividual: minimalOutingIndividual(),
            teachers: { entries: [teacherBase(), teacherBase()] },
          },
          movement: { entries: [] },
        },
        arrivals: { entries: [] },
      }),
    ).toThrow(/duplicate teacher entry id/);
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullArrivalsInputs();
    const first = gardenOutingArrivals(inputs);
    first.arrivals[0].arrivals[0].lastArrivalTo = "mutated-home";
    first.arrivals[0].arrivals.push({
      creatureId: "mutated",
      firstArrivedAt: 99,
      lastArrivedAt: 99,
      arrivalCount: 99,
      lastArrivalRecordId: "mutated",
      lastArrivalTo: null,
      currentlyResident: false,
    });
    first.outingMovement.movement[0].movements[0].to = "mutated-home";
    first.outingMovement.outingTeachers.teachers[0].teachers[0].axes.push("ax-mutated");
    const second = gardenOutingArrivals(inputs);
    expect(second.arrivals[0].arrivals.map((entry) => entry.creatureId)).toEqual([
      "c-9",
      "c-other",
    ]);
    expect(second.arrivals[0].arrivals[0].lastArrivalTo).toBe("garden-home");
    expect(second.arrivals[0].arrivals[0].arrivalCount).toBe(2);
    expect(second.outingMovement.movement[0].movements[0].to).toBe("home-a");
    expect(second.outingMovement.outingTeachers.teachers[0].teachers[0].axes).toEqual(["ax-1", "ax-2"]);
    expect(inputs.arrivals.entries[0].id).toBe("a-1");
    expect(inputs.arrivals.entries[0].log[0].id).toBe("av-2");
    expect(inputs.outingMovement.movement.entries[0].id).toBe("m-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingArrivals({
      outingMovement: minimalOutingMovement(),
      arrivals: {
        entries: [
          {
            id: "a/α-1 :: odd",
            log: [{ id: "av-77", creatureId: "tok-77", verb: "garden-arrival", from: null, to: "tok-home", at: 3 }],
            gardenHomes: ["tok-home"],
          },
        ],
      },
    });
    expect(result.arrivals[0].id).toBe("a/α-1 :: odd");
    expect(result.arrivals[0]).toEqual({
      id: "a/α-1 :: odd",
      arrivals: [
        {
          creatureId: "tok-77",
          firstArrivedAt: 3,
          lastArrivedAt: 3,
          arrivalCount: 1,
          lastArrivalRecordId: "av-77",
          lastArrivalTo: "tok-home",
          currentlyResident: true,
        },
      ],
    });
  });

  it("staging locks: no host or composed module imports the outing-arrivals bundle yet", async () => {
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
      "./garden-outing-movement.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-arrivals");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-arrivals.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
