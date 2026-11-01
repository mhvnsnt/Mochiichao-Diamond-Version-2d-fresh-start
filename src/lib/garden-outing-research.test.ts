import { describe, expect, it } from "vitest";
import {
  gardenOutingResearch,
  type ResearchEntry,
  type GardenOutingResearchInputs,
} from "./garden-outing-research";
import {
  bioFillForSpecies,
  researchSummaryForSpecies,
  type ResearchObservation,
} from "./garden-research";
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

function obs(
  id: string,
  creatureId: string,
  kind: string,
  at: number,
): ResearchObservation {
  return { id, creatureId, kind, at };
}

function researchLogFull(): ResearchObservation[] {
  return [
    obs("o1", "c1", "kind-b", 10),
    obs("o2", "c2", "kind-b", 20),
    obs("o3", "c1", "kind-a", 15),
    obs("o4", "c3", "kind-b", 99),
    obs("o5", "c-unmapped", "kind-b", 1),
  ];
}

function researchSpeciesMap(): Map<string, string> {
  return new Map([
    ["c1", "s-alpha"],
    ["c2", "s-alpha"],
    ["c3", "s-beta"],
  ]);
}

function researchFull(): ResearchEntry {
  return {
    id: "r-1",
    speciesId: "s-alpha",
    log: researchLogFull(),
    speciesOfCreature: researchSpeciesMap(),
    requirements: [
      { field: "bio-growth", requiredKind: "kind-a" },
      { field: "bio-lineage", requiredKind: "kind-lineage" },
      { field: "bio-behaviour", requiredKind: "kind-b" },
    ],
  };
}

function researchRecordForm(): ResearchEntry {
  return {
    id: "r-2",
    speciesId: "s-beta",
    log: researchLogFull(),
    speciesOfCreature: { c3: "s-beta" },
    requirements: [{ field: "bio-x", requiredKind: "kind-b" }],
  };
}

function researchBase(): ResearchEntry {
  return {
    id: "r-9",
    speciesId: "s-alpha",
    log: [obs("o-b", "c1", "kind-a", 7)],
    speciesOfCreature: { c1: "s-alpha" },
    requirements: [{ field: "bio-growth", requiredKind: "kind-a" }],
  };
}

function minimalOutingArrivals(): GardenOutingArrivalsInputs {
  return { outingMovement: minimalOutingMovement(), arrivals: { entries: [] } };
}

function fullResearchInputs(): GardenOutingResearchInputs {
  return {
    outingArrivals: fullArrivalsInputs(),
    research: { entries: [researchFull(), researchRecordForm()] },
  };
}

describe("garden-outing-research (B3 outing + arrivals + per-species research readings)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingResearchInputs = {
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [] },
    };
    const result = gardenOutingResearch(inputs);
    expect(result).toEqual({
      outingArrivals: gardenOutingArrivals(inputs.outingArrivals),
      research: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullResearchInputs();
    const result = gardenOutingResearch(inputs);
    expect(result.outingArrivals).toEqual(
      gardenOutingArrivals(inputs.outingArrivals),
    );
    expect(result.research[0].summary).toEqual(
      researchSummaryForSpecies(
        researchFull().log,
        researchFull().speciesId,
        researchFull().speciesOfCreature,
      ),
    );
    expect(result.research[0].bioFill).toEqual(
      bioFillForSpecies(
        researchFull().log,
        researchFull().speciesId,
        researchFull().speciesOfCreature,
        researchFull().requirements,
      ),
    );
    // Hand-checked numbers: s-alpha totals 3 (c1 + c2 only; c3 is
    // s-beta and c-unmapped is unmapped); first-observed order
    // kind-b (stamp 10) before kind-a (stamp 15).
    expect(result.research[0].summary).toEqual({
      speciesId: "s-alpha",
      totalObservations: 3,
      observedKinds: ["kind-b", "kind-a"],
      kinds: [
        { kind: "kind-b", count: 2, firstAt: 10, lastAt: 20 },
        { kind: "kind-a", count: 1, firstAt: 15, lastAt: 15 },
      ],
    });
    expect(result.research[0].bioFill).toEqual([
      { field: "bio-growth", requiredKind: "kind-a", filled: true, observedCount: 1 },
      { field: "bio-lineage", requiredKind: "kind-lineage", filled: false, observedCount: 0 },
      { field: "bio-behaviour", requiredKind: "kind-b", filled: true, observedCount: 2 },
    ]);
    // Record-form mapping reads the same species facts: s-beta
    // totals 1 (c3 kind-b at 99 only).
    expect(result.research[1].summary).toEqual({
      speciesId: "s-beta",
      totalObservations: 1,
      observedKinds: ["kind-b"],
      kinds: [{ kind: "kind-b", count: 1, firstAt: 99, lastAt: 99 }],
    });
    expect(result.research[1].bioFill).toEqual([
      { field: "bio-x", requiredKind: "kind-b", filled: true, observedCount: 1 },
    ]);
    // Inherited sections still report their own numbers.
    expect(result.outingArrivals.arrivals[0].arrivals[0]).toMatchObject({
      creatureId: "c-9",
      firstArrivedAt: 1,
      arrivalCount: 2,
    });
    expect(
      result.outingArrivals.outingMovement.outingTeachers.teachers[0].taughtAxes,
    ).toEqual(["ax-1", "ax-2", "ax-3"]);
    expect(
      result.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals[0].summary.keepers[0],
    ).toMatchObject({ keeperId: "keeper-a", accrued: 20, totalDecay: 6, effective: 14 });
    expect(result.outingArrivals).toEqual(
      gardenOutingArrivals(fullArrivalsInputs()),
    );
  });

  it("outing-arrivals-only bundle", () => {
    const result = gardenOutingResearch({
      outingArrivals: fullArrivalsInputs(),
      research: { entries: [] },
    });
    expect(result.research).toEqual([]);
    expect(result.outingArrivals.arrivals[0].arrivals[0]).toMatchObject({
      creatureId: "c-9",
      arrivalCount: 2,
    });
  });

  it("research-with-minimal-outing-arrivals bundle", () => {
    const result = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchFull()] },
    });
    expect(result.outingArrivals.arrivals).toEqual([]);
    expect(result.research[0].summary.totalObservations).toBe(3);
    expect(result.research[0].bioFill[0]).toEqual({
      field: "bio-growth",
      requiredKind: "kind-a",
      filled: true,
      observedCount: 1,
    });
  });

  it("caller order is preserved", () => {
    const result = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchRecordForm(), researchBase(), researchFull()] },
    });
    expect(result.research.map((entry) => entry.id)).toEqual(["r-2", "r-9", "r-1"]);
    expect(result.research.map((entry) => entry.summary.speciesId)).toEqual([
      "s-beta",
      "s-alpha",
      "s-alpha",
    ]);
  });

  it("an entry with no observations and an unknown species read empty, never fabricated", () => {
    const result = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: {
        entries: [
          {
            id: "r-empty",
            speciesId: "s-alpha",
            log: [],
            speciesOfCreature: researchSpeciesMap(),
            requirements: [{ field: "bio-growth", requiredKind: "kind-a" }],
          },
          {
            id: "r-unknown",
            speciesId: "s-nobody",
            log: researchLogFull(),
            speciesOfCreature: researchSpeciesMap(),
            requirements: [{ field: "bio-growth", requiredKind: "kind-a" }],
          },
        ],
      },
    });
    expect(result.research[0].summary).toEqual({
      speciesId: "s-alpha",
      totalObservations: 0,
      observedKinds: [],
      kinds: [],
    });
    expect(result.research[0].bioFill).toEqual([
      { field: "bio-growth", requiredKind: "kind-a", filled: false, observedCount: 0 },
    ]);
    expect(result.research[1].summary.totalObservations).toBe(0);
    expect(result.research[1].bioFill[0].filled).toBe(false);
  });

  it("exact result shape: two sections only, readings exactly id + summary + bioFill", () => {
    const result = gardenOutingResearch(fullResearchInputs());
    expect(Object.keys(result).sort()).toEqual(["outingArrivals", "research"]);
    expect(Object.keys(result.research[0]).sort()).toEqual([
      "bioFill",
      "id",
      "summary",
    ]);
    expect(Object.keys(result.research[0].summary).sort()).toEqual([
      "kinds",
      "observedKinds",
      "speciesId",
      "totalObservations",
    ]);
    expect(Object.keys(result.research[0].summary.kinds[0]).sort()).toEqual([
      "count",
      "firstAt",
      "kind",
      "lastAt",
    ]);
    expect(Object.keys(result.research[0].bioFill[0]).sort()).toEqual([
      "field",
      "filled",
      "observedCount",
      "requiredKind",
    ]);
    expect("research" in result.outingArrivals).toBe(false);
  });

  it("side-by-side-not-merged: same research input reads identically under a minimal and a full outing-arrivals section", () => {
    const minimal = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchFull()] },
    });
    const full = gardenOutingResearch({
      outingArrivals: fullArrivalsInputs(),
      research: { entries: [researchFull()] },
    });
    expect(full.research).toEqual(minimal.research);
    // A species in the research log but absent from the outing
    // bonds still reports in research: s-beta via c3, while the
    // outing bonds name only c-1.
    const beta = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchRecordForm()] },
    });
    expect(beta.research[0].summary.totalObservations).toBe(1);
    expect(beta.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals).toEqual([]);
  });

  it("loud failures", () => {
    const base = (): GardenOutingResearchInputs => ({
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchBase()] },
    });
    expect(() => gardenOutingResearch(null as never)).toThrow();
    expect(() =>
      gardenOutingResearch({ ...base(), outingArrivals: null as never }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({ ...base(), research: null as never }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: null as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [null as never] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [{ ...researchBase(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [researchBase(), researchBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [{ ...researchBase(), speciesId: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [{ ...researchBase(), log: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: {
          entries: [
            { ...researchBase(), log: [obs("o-bad", "c1", "kind-a", Number.NaN)] },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: {
          entries: [{ ...researchBase(), log: [{ id: "o-x", creatureId: "c1", kind: "", at: 1 }] }],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [{ ...researchBase(), speciesOfCreature: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: { entries: [{ ...researchBase(), requirements: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: {
          entries: [
            {
              ...researchBase(),
              requirements: [
                { field: "bio-growth", requiredKind: "kind-a" },
                { field: "bio-growth", requiredKind: "kind-b" },
              ],
            },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: {
          entries: [
            { ...researchBase(), requirements: [{ field: "", requiredKind: "kind-a" }] },
          ],
        },
      }),
    ).toThrow();
    // Research failure propagation: a mapping value that is not
    // a non-empty string fails through the composed read.
    expect(() =>
      gardenOutingResearch({
        outingArrivals: minimalOutingArrivals(),
        research: {
          entries: [{ ...researchBase(), speciesOfCreature: { c1: "" } }],
        },
      }),
    ).toThrow();
    // Outing-arrivals failure propagation: a duplicate arrival
    // entry id fails through the composed read.
    expect(() =>
      gardenOutingResearch({
        outingArrivals: {
          outingMovement: minimalOutingMovement(),
          arrivals: { entries: [arrivalBase(), arrivalBase()] },
        },
        research: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = fullResearchInputs();
    const logOrder = inputs.research.entries[0].log.map((o) => o.id);
    const first = gardenOutingResearch(inputs);
    first.research[0].summary.observedKinds.push("kind-invented");
    first.research[0].summary.kinds[0].count = 999;
    first.research[0].bioFill[0].filled = false;
    first.research.push({ id: "r-invented", summary: first.research[0].summary, bioFill: [] });
    first.outingArrivals.arrivals[0].arrivals[0].lastArrivalTo = "nowhere";
    const second = gardenOutingResearch(inputs);
    expect(second.research[0].summary.observedKinds).toEqual(["kind-b", "kind-a"]);
    expect(second.research[0].summary.kinds[0].count).toBe(2);
    expect(second.research[0].bioFill[0].filled).toBe(true);
    expect(second.research.map((entry) => entry.id)).toEqual(["r-1", "r-2"]);
    expect(second.outingArrivals.arrivals[0].arrivals[0].lastArrivalTo).toBe("garden-home");
    expect(inputs.research.entries[0].log.map((o) => o.id)).toEqual(logOrder);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingResearch({
      outingArrivals: minimalOutingArrivals(),
      research: {
        entries: [
          {
            id: "zz-odd",
            speciesId: "sp-?!",
            log: [obs("o-odd", "cr-odd", "kind-odd", 3)],
            speciesOfCreature: { "cr-odd": "sp-?!" },
            requirements: [{ field: "f-odd", requiredKind: "kind-odd" }],
          },
        ],
      },
    });
    expect(result.research[0].summary.speciesId).toBe("sp-?!");
    expect(result.research[0].summary.observedKinds).toEqual(["kind-odd"]);
    expect(result.research[0].bioFill[0].filled).toBe(true);
  });

  it("staging locks: no host or composed module imports the outing-research bundle yet", async () => {
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
      "./garden-outing-arrivals.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-research");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-research.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
