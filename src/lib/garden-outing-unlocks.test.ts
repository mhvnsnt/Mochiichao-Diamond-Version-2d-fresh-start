import { describe, expect, it } from "vitest";
import {
  gardenOutingUnlocks,
  type GardenOutingUnlocksInputs,
  type UnlockEntry,
} from "./garden-outing-unlocks";
import {
  gardenOutingJourney,
  type GardenOutingJourneyInputs,
  type JourneyEntry,
} from "./garden-outing-journey";
import {
  gardenOutingSnapshot,
  type GardenOutingSnapshotInputs,
  type SnapshotEntry,
} from "./garden-outing-snapshot";
import { gardenJourney } from "./garden-journey";
import {
  gardenOutingCheckin,
  type CheckinEntry,
  type GardenOutingCheckinInputs,
} from "./garden-outing-checkin";
import {
  gardenOutingRecord,
  type GardenOutingRecordInputs,
  type RecordEntry,
} from "./garden-outing-record";
import {
  gardenSnapshot,
  type GardenSnapshotInputs,
  type SnapshotRecordEntry,
} from "./garden-snapshot";
import {
  gardenCheckIn,
  type CheckInInputs,
} from "./garden-checkin";
import {
  gardenOutingLevel,
  type GardenOutingLevelInputs,
} from "./garden-outing-level";
import type {
  GardenOutingThanksInputs,
  ThanksWindow,
} from "./garden-outing-thanks";
import type { GardenLevelBand } from "./garden-level";
import type {
  ComfortEntry,
  GardenOutingComfortInputs,
} from "./garden-outing-comfort";
import type { GardenOutingDecayInputs, DecayEntry } from "./garden-outing-decay";
import type { GardenOutingBondsInputs } from "./garden-outing-bonds";
import type { GardenOutingInputs } from "./garden-outing";
import type { GardenJourneyInputs } from "./garden-journey";
import type { JourneyInboundInputs } from "./garden-inbound";
import type { AutonomousChangeInputs } from "./garden-autonomous";
import type { MigrationRule } from "./garden-migration";
import type { StoryBeat } from "./garden-story";
import type { ArcBeat } from "./garden-arcs";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { ThanksUseEvent } from "./garden-thanks";
import type { MovementRecord } from "./garden-movement";
import type { ResearchObservation } from "./garden-research";
import {
  gardenUnlocks,
  type GardenMilestones,
  type GardenUnlockEntry,
} from "./garden-unlocks";

const BANDS: GardenLevelBand[] = [
  { level: 1, min: 0 },
  { level: 2, min: 50 },
  { level: 3, min: 80 },
];

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
    } satisfies GardenSnapshotInputs,
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

function recordLedger(): BondLedger {
  return [
    { creatureId: "c-1", keeperId: "k-a", value: 20 },
    { creatureId: "c-1", keeperId: "k-b", value: 8 },
    { creatureId: "c-other", keeperId: "k-a", value: 99 },
  ];
}

function fact(
  type: NeglectFact["type"],
  context: NeglectFact["context"],
  units: number,
): NeglectFact {
  return { type, context, units };
}

function recordBase(): {
  movementLog: MovementRecord[];
  gardenHomes: string[];
  bondLedger: BondLedger;
  decayProfile: DecayProfile;
  factsByKeeper: Record<string, readonly NeglectFact[]>;
  observationLog: ResearchObservation[];
} {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    bondLedger: [],
    decayProfile: profile(),
    factsByKeeper: {},
    observationLog: [],
  };
}

function recordFull(): RecordEntry {
  return {
    creatureId: "c-1",
    inputs: {
      ...recordBase(),
      movementLog: [
        rec("m1", "c-1", "garden-arrival", "home-a", 5),
        rec("m2", "c-1", "transfer", "home-b", 9),
      ],
      bondLedger: recordLedger(),
      factsByKeeper: {
        "k-a": [fact("absence", "party", 3)],
        "k-b": [],
      },
      observationLog: [
        obs("o1", "c-1", "growth", 2),
        obs("o2", "c-1", "behaviour", 4),
        obs("o3", "c-1", "growth", 7),
        obs("o4", "c-other", "growth", 1),
      ],
      gardenEdge: ["edge-x"],
    },
  };
}

function outingRecordFull(): GardenOutingRecordInputs {
  const outingThanks = outingThanksBase();
  const decayEntry: DecayEntry = {
    id: "d-1",
    accrued: 50,
    facts: [
      { type: "absence", context: "party", units: 3 },
    ] satisfies readonly NeglectFact[],
    profile: profile(),
  };
  const comfortEntry: ComfortEntry = {
    id: "cf-1",
    day: {
      comfort: 50,
      habitats: [],
      needs: [{ id: "n-1", recipeIds: ["r-1"] }],
      rates: { "n-1": { gain: 0, loss: 2 } },
      classesForRecipe: () => [],
    },
  };
  const window: ThanksWindow = {
    id: "w-1",
    events: [
      {
        zoneId: "z-1",
        habitatId: null,
        satisfiedNeeds: 3,
        totalNeeds: 4,
      },
    ] satisfies readonly ThanksUseEvent[],
    previousLevel: null,
    newLevel: 2,
    heartZoneId: "heart-1",
  };
  outingThanks.outingComfort.outingDecay.decay.entries = [decayEntry];
  outingThanks.outingComfort.comfort.entries = [comfortEntry];
  outingThanks.thanks.windows = [window];
  return {
    outingLevel: {
      outingThanks,
      levels: {
        entries: [
          {
            id: "lv-comfort",
            input: { comforts: [60, 80], tiers: [], bands: BANDS },
          },
          {
            id: "lv-tier",
            input: { comforts: [], tiers: [2, 2], tierMax: 4, bands: BANDS },
          },
          { id: "lv-empty", input: { comforts: [], tiers: [] } },
        ],
      },
    },
    records: { entries: [recordFull()] },
  };
}

function checkinMovement(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  from: string | null,
  to: string | null,
  at: number,
): MovementRecord {
  return { id, creatureId, verb, from, to, at };
}

function checkinFull(): CheckinEntry {
  const inputs = checkInBase();
  inputs.log = [
    checkinMovement("m1", "c-9", "garden-arrival", "wild-y", "home-a", 10),
    checkinMovement("m2", "c-8", "garden-departure", "home-a", "wild-y", 20),
    checkinMovement("m3", "c-7", "release", "home-a", "edge-x", 30),
  ];
  inputs.news = { since: null, gardenEdge: ["edge-x"] };
  inputs.autonomous.migrationRules = [
    {
      id: "r1",
      worldStates: ["key-a"],
      arrivals: ["c-3"],
      departures: ["c-2"],
    } as MigrationRule,
  ];
  inputs.autonomous.storyBeats = [
    { id: "b1", arrivals: ["c-4"], departures: ["c-1"] } as StoryBeat,
  ];
  inputs.autonomous.arcBeats = [
    {
      id: "a1",
      changes: [{ residentId: "c-1", arc: "arc-b" }],
    } as ArcBeat,
  ];
  return { id: "ck-1", inputs };
}

function outingCheckinBase(): GardenOutingCheckinInputs {
  return {
    outingRecord: outingRecordBase(),
    checkins: { entries: [] },
  };
}

function outingCheckinFull(): GardenOutingCheckinInputs {
  return {
    outingRecord: outingRecordFull(),
    checkins: { entries: [checkinFull()] },
  };
}

function snapshotRecordEntry(): SnapshotRecordEntry {
  const full = recordFull();
  return { creatureId: full.creatureId, inputs: full.inputs };
}

function snapshotFull(): SnapshotEntry {
  const inputs = checkInBase();
  inputs.log = [
    checkinMovement("s1", "c-5", "garden-arrival", "wild-y", "home-a", 10),
    checkinMovement("s2", "c-6", "release", "home-a", "edge-x", 30),
  ];
  inputs.news = { since: null, gardenEdge: ["edge-x"] };
  inputs.autonomous.migrationRules = [
    {
      id: "r-sn",
      worldStates: ["key-a"],
      arrivals: ["c-6"],
      departures: ["c-2"],
    } as MigrationRule,
  ];
  inputs.autonomous.storyBeats = [
    { id: "b1", arrivals: ["c-7"], departures: ["c-1"] } as StoryBeat,
  ];
  inputs.autonomous.arcBeats = [
    {
      id: "a1",
      changes: [{ residentId: "c-1", arc: "arc-c" }],
    } as ArcBeat,
  ];
  return {
    id: "sn-1",
    inputs: {
      checkIn: inputs,
      records: [snapshotRecordEntry()],
    } satisfies GardenSnapshotInputs,
  };
}

function snapshotBase(): SnapshotEntry {
  return {
    id: "sn-9",
    inputs: {
      checkIn: checkInBase(),
      records: [],
    } satisfies GardenSnapshotInputs,
  };
}

function journeyInboundBase(): GardenJourneyInputs["inbound"] {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    teacherMapping: {},
    meetings: [],
  };
}

function journeySnapshotBase(): GardenSnapshotInputs {
  return {
    checkIn: checkInBase(),
    records: [],
  };
}

function journeyBaseInputs(): GardenJourneyInputs {
  return {
    inbound: journeyInboundBase(),
    snapshot: journeySnapshotBase(),
  };
}

function journeyRecordEntry(): SnapshotRecordEntry {
  const full = recordFull();
  return {
    creatureId: "c-j1",
    inputs: {
      ...full.inputs,
      movementLog: [
        rec("mj1", "c-j1", "garden-arrival", "home-a", 5),
        rec("mj2", "c-j1", "transfer", "home-b", 9),
      ],
      bondLedger: [
        { creatureId: "c-j1", keeperId: "k-a", value: 20 },
        { creatureId: "c-j1", keeperId: "k-b", value: 8 },
      ],
      factsByKeeper: {
        "k-a": [fact("absence", "party", 3)],
        "k-b": [],
      },
      observationLog: [
        obs("oj1", "c-j1", "growth", 2),
        obs("oj2", "c-j1", "behaviour", 4),
        obs("oj3", "c-j1", "growth", 7),
      ],
    },
  };
}

function journeyEntryFull(): JourneyEntry {
  const checkin = checkInBase();
  checkin.log = [
    checkinMovement("mj1", "c-j1", "garden-arrival", null, "home-a", 5),
  ];
  return {
    id: "jn-1",
    inputs: {
      inbound: {
        movementLog: [
          checkinMovement("mj1", "c-j1", "garden-arrival", null, "home-a", 5),
        ],
        gardenHomes: ["home-a", "home-b"],
        teacherMapping: { "sp-a": ["ax-1"] },
        meetings: [{ speciesId: "sp-a", at: 2 }],
      },
      snapshot: {
        checkIn: checkin,
        records: [journeyRecordEntry()],
      },
    } satisfies GardenJourneyInputs,
  };
}

function journeyEntryBase(): JourneyEntry {
  return {
    id: "jn-9",
    inputs: journeyBaseInputs(),
  };
}

function fullInputsJourney(): GardenOutingJourneyInputs {
  return {
    outingSnapshot: fullInputs(),
    journeys: { entries: [journeyEntryFull()] },
  };
}

function fullInputs(): GardenOutingSnapshotInputs {
  return {
    outingCheckin: outingCheckinFull(),
    snapshots: { entries: [snapshotFull()] },
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

function unlockBase(): UnlockEntry {
  return {
    id: "un-9",
    milestones: { gardenLevel: null, sportTitles: [], lineageMilestones: [] },
    catalogue: [],
  };
}

function fullInputsUnlocks(): GardenOutingUnlocksInputs {
  return {
    outingJourney: fullInputsJourney(),
    unlocks: { entries: [unlockFull()] },
  };
}

describe("garden-outing-unlocks (B3 outing + journeys + unlock evaluations)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingUnlocksInputs = {
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: { entries: [] },
    };
    const result = gardenOutingUnlocks(inputs);
    expect(result).toEqual({
      outingJourney: gardenOutingJourney(inputs.outingJourney),
      unlocks: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullInputsUnlocks();
    const result = gardenOutingUnlocks(inputs);
    expect(result.outingJourney).toEqual(
      gardenOutingJourney(inputs.outingJourney),
    );
    expect(result.unlocks).toEqual([
      {
        id: "un-1",
        result: gardenUnlocks(
          unlockFull().milestones,
          unlockFull().catalogue,
          unlockFull().previouslyUnlocked,
        ),
      },
    ]);
    // Hand-checked numbers from the outing-journey section.
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.outingThanks.outingComfort.outingDecay.decay[0]
        .breakdown.effective,
    ).toBe(44);
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.outingThanks.outingComfort.comfort[0].result.comfort,
    ).toBe(48);
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.levels[0].summary.level,
    ).toBe(2);
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .records[0].record.bonds.keepers[0].effective,
    ).toBe(14);
    expect(
      result.outingJourney.outingSnapshot.outingCheckin.checkins[0].checkin
        .news.map((n) => n.creatureId),
    ).toEqual(["c-9", "c-8", "c-7"]);
    expect(
      result.outingJourney.outingSnapshot.snapshots[0].snapshot.checkIn
        .news.map((n) => n.creatureId),
    ).toEqual(["c-5", "c-6"]);
    expect(
      result.outingJourney.journeys[0].journey.inbound.arrivals[0].creatureId,
    ).toBe("c-j1");
    expect(
      result.outingJourney.journeys[0].journey.inbound.teachers[0].axes,
    ).toEqual(["ax-1"]);
    // Hand-checked unlock evaluation: level 2 + title-a met, line-b
    // not met, the any-branch met via gardenLevel >= 1; u-level was
    // already shown, so it is unlocked but not newly unlocked.
    expect(result.unlocks[0].result).toEqual({
      unlocked: ["u-level", "u-title", "u-any"],
      newlyUnlocked: ["u-title", "u-any"],
    });
  });

  it("outing-journey-only bundle", () => {
    const inputs: GardenOutingUnlocksInputs = {
      outingJourney: fullInputsJourney(),
      unlocks: { entries: [] },
    };
    const result = gardenOutingUnlocks(inputs);
    expect(result.outingJourney).toEqual(
      gardenOutingJourney(inputs.outingJourney),
    );
    expect(result.unlocks).toEqual([]);
  });

  it("unlocks with a minimal outing-journey section", () => {
    const inputs: GardenOutingUnlocksInputs = {
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: { entries: [unlockFull()] },
    };
    const result = gardenOutingUnlocks(inputs);
    expect(result.unlocks[0].result).toEqual({
      unlocked: ["u-level", "u-title", "u-any"],
      newlyUnlocked: ["u-title", "u-any"],
    });
    expect(result.outingJourney.journeys).toEqual([]);
  });

  it("caller order is preserved across unlock entries", () => {
    const second: UnlockEntry = {
      id: "un-2",
      milestones: { gardenLevel: 0, sportTitles: [], lineageMilestones: [] },
      catalogue: [
        { id: "u-zero", requires: { kind: "gardenLevel", atLeast: 0 } },
      ],
    };
    const result = gardenOutingUnlocks({
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: { entries: [second, unlockBase(), unlockFull()] },
    });
    expect(result.unlocks.map((u) => u.id)).toEqual([
      "un-2",
      "un-9",
      "un-1",
    ]);
    expect(result.unlocks[0].result).toEqual({
      unlocked: ["u-zero"],
      newlyUnlocked: ["u-zero"],
    });
  });

  it("an unlock entry with no milestones and no catalogue reads empty, never fabricated", () => {
    const result = gardenOutingUnlocks({
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: { entries: [unlockBase()] },
    });
    expect(result.unlocks).toEqual([
      { id: "un-9", result: { unlocked: [], newlyUnlocked: [] } },
    ]);
  });

  it("exact result shape: two sections only, readings exactly id + result", () => {
    const result = gardenOutingUnlocks(fullInputsUnlocks());
    expect(Object.keys(result).sort()).toEqual([
      "outingJourney",
      "unlocks",
    ]);
    expect(Object.keys(result.unlocks[0]).sort()).toEqual(["id", "result"]);
    expect(Object.keys(result.unlocks[0].result).sort()).toEqual([
      "newlyUnlocked",
      "unlocked",
    ]);
    expect("unlocks" in result.outingJourney).toBe(false);
    expect("outingJourney" in result.unlocks[0]).toBe(false);
  });

  it("side-by-side-not-merged: an unlock is never read off the outing-journey section", () => {
    const full = gardenOutingUnlocks(fullInputsUnlocks());
    // The outing-journey level summary reads 2, while this unlock
    // entry evaluates over a caller-supplied Garden Level of 5:
    // different pictures, both reported.
    const high: UnlockEntry = {
      id: "un-high",
      milestones: { gardenLevel: 5, sportTitles: [], lineageMilestones: [] },
      catalogue: [
        { id: "u-five", requires: { kind: "gardenLevel", atLeast: 5 } },
      ],
    };
    const withHigh = gardenOutingUnlocks({
      outingJourney: fullInputsJourney(),
      unlocks: { entries: [high] },
    });
    expect(
      full.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.levels[0].summary.level,
    ).toBe(2);
    expect(withHigh.unlocks[0].result).toEqual({
      unlocked: ["u-five"],
      newlyUnlocked: ["u-five"],
    });
    // The same unlock input reads identically with a minimal
    // outing-journey section as with the full one.
    const minimal = gardenOutingUnlocks({
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: { entries: [high] },
    });
    expect(minimal.unlocks[0].result).toEqual(withHigh.unlocks[0].result);
    // A catalogue id present only in the unlocks section is still
    // reported there, even though the outing-journey section
    // names no such id anywhere.
    expect(full.unlocks[0].result.unlocked).toContain("u-title");
  });

  it("loud failures on malformed bundles and unlock entries", () => {
    expect(() => gardenOutingUnlocks(null as never)).toThrow();
    expect(() =>
      gardenOutingUnlocks({ unlocks: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
        unlocks: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
        unlocks: { entries: [{ id: "", milestones: unlockBase().milestones, catalogue: [] }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
        unlocks: { entries: [unlockBase(), unlockBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
        unlocks: { entries: [{ id: "bad", milestones: null as never, catalogue: [] }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        },
        unlocks: { entries: [{ id: "bad", milestones: unlockBase().milestones, catalogue: "nope" as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    const minimalJourney = {
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: { entries: [] },
    } as GardenOutingJourneyInputs;
    // Unlock read: duplicate catalogue id.
    const dupCatalogue: UnlockEntry = {
      id: "un-dup",
      milestones: unlockFull().milestones,
      catalogue: [
        { id: "u-x", requires: { kind: "gardenLevel", atLeast: 1 } },
        { id: "u-x", requires: { kind: "gardenLevel", atLeast: 1 } },
      ],
    };
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: minimalJourney,
        unlocks: { entries: [dupCatalogue] },
      }),
    ).toThrow();
    // Unlock read: an empty all-requirement is a catalogue error.
    const emptyAll: UnlockEntry = {
      id: "un-all",
      milestones: unlockFull().milestones,
      catalogue: [
        { id: "u-a", requires: { kind: "all", requirements: [] } },
      ],
    };
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: minimalJourney,
        unlocks: { entries: [emptyAll] },
      }),
    ).toThrow();
    // Unlock read: a bad previously-unlocked id.
    const badPrev: UnlockEntry = {
      id: "un-prev",
      milestones: unlockFull().milestones,
      catalogue: [],
      previouslyUnlocked: [""],
    };
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: minimalJourney,
        unlocks: { entries: [badPrev] },
      }),
    ).toThrow();
    // Outing-journey read: duplicate journey entry id.
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: {
            outingCheckin: outingCheckinBase(),
            snapshots: { entries: [] },
          },
          journeys: { entries: [journeyEntryBase(), journeyEntryBase()] },
        },
        unlocks: { entries: [] },
      }),
    ).toThrow();
    // Outing-journey read: duplicate snapshot entry id.
    const dupSnapshot = fullInputs();
    dupSnapshot.snapshots.entries = [snapshotBase(), snapshotBase()];
    expect(() =>
      gardenOutingUnlocks({
        outingJourney: {
          outingSnapshot: dupSnapshot,
          journeys: { entries: [] },
        },
        unlocks: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputsUnlocks();
    const first = gardenOutingUnlocks(inputs);
    first.unlocks[0].result.unlocked.push("u-mutated");
    first.unlocks[0].result.newlyUnlocked.push("u-mutated");
    first.outingJourney.journeys[0].journey.inbound.taughtAxes.push("ax-z");
    (first.outingJourney.outingSnapshot.snapshots[0].snapshot.checkIn.news[0] as {
      kind: string;
    }).kind = "mutated";
    first.outingJourney.outingSnapshot.outingCheckin.outingRecord.outingLevel.levels[0].summary.aggregate =
      -999;
    const second = gardenOutingUnlocks(inputs);
    expect(second.unlocks[0].result).toEqual({
      unlocked: ["u-level", "u-title", "u-any"],
      newlyUnlocked: ["u-title", "u-any"],
    });
    expect(second.outingJourney.journeys[0].journey.inbound.taughtAxes).toEqual([
      "ax-1",
    ]);
    expect(
      second.outingJourney.outingSnapshot.snapshots[0].snapshot.checkIn
        .news[0].kind,
    ).toBe("arrival");
    expect(
      second.outingJourney.outingSnapshot.outingCheckin.outingRecord
        .outingLevel.levels[0].summary.aggregate,
    ).toBe(70);
    expect(inputs.unlocks.entries[0].id).toBe("un-1");
    expect(inputs.outingJourney.journeys.entries[0].id).toBe("jn-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingUnlocks({
      outingJourney: {
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [] },
      },
      unlocks: {
        entries: [{ id: "un/α-1 :: odd", milestones: unlockBase().milestones, catalogue: [] }],
      },
    });
    expect(result.unlocks[0].id).toBe("un/α-1 :: odd");
    expect(result.unlocks[0].result).toEqual({
      unlocked: [],
      newlyUnlocked: [],
    });
  });

  it("staging locks: no host or composed module imports the outing-unlocks bundle yet", async () => {
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
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-unlocks");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-unlocks.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
