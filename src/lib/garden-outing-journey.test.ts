import { describe, expect, it } from "vitest";
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

describe("garden-outing-journey (B3 outing + snapshots + journey visits)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingJourneyInputs = {
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: { entries: [] },
    };
    const result = gardenOutingJourney(inputs);
    expect(result).toEqual({
      outingSnapshot: gardenOutingSnapshot(inputs.outingSnapshot),
      journeys: [],
    });
    expect(Object.keys(result).sort()).toEqual([
      "journeys",
      "outingSnapshot",
    ]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullInputsJourney();
    const result = gardenOutingJourney(inputs);
    expect(result.outingSnapshot).toEqual(
      gardenOutingSnapshot(inputs.outingSnapshot),
    );
    expect(result.journeys).toEqual(
      inputs.journeys.entries.map((entry) => ({
        id: entry.id,
        journey: gardenJourney(entry.inputs),
      })),
    );
    // Hand-checked outing-snapshot numbers: decay 50 - 6 = 44;
    // comfort day 50 - 2 = 48; thanks intensity 3 / 4 = 0.75;
    // level mean comfort 70 -> 2; record k-a 20 - 6 = 14;
    // check-in news m1/m2/m3 arrival/departure/edge-sighting;
    // snapshot news s1/s2 arrival/edge-sighting.
    const outingSnapshot = result.outingSnapshot;
    expect(
      outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks
        .outingComfort.outingDecay.decay[0].breakdown.effective,
    ).toBe(44);
    expect(
      outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks
        .outingComfort.comfort[0].result.comfort,
    ).toBe(48);
    expect(
      outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks
        .thanks[0].presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(
      outingSnapshot.outingCheckin.outingRecord.outingLevel.levels[0].summary
        .aggregate,
    ).toBe(70);
    expect(
      outingSnapshot.outingCheckin.outingRecord.outingLevel.levels[0].summary
        .level,
    ).toBe(2);
    expect(
      outingSnapshot.outingCheckin.outingRecord.records[0].record.bonds
        .keepers[0].effective,
    ).toBe(14);
    expect(
      outingSnapshot.outingCheckin.checkins[0].checkin.news.map(
        (item) => item.movementId,
      ),
    ).toEqual(["m1", "m2", "m3"]);
    expect(
      outingSnapshot.snapshots[0].snapshot.checkIn.news.map(
        (item) => item.movementId,
      ),
    ).toEqual(["s1", "s2"]);
    // Hand-checked journey numbers: inbound arrival c-j1 at 5,
    // resident at home-a; teacher sp-a first met at 2, axis ax-1;
    // snapshot news mj1 arrival; journey record resident at
    // home-b, k-a 20 - 6 = 14.
    const journey = result.journeys[0].journey;
    expect(journey.inbound.arrivals).toEqual([
      {
        creatureId: "c-j1",
        firstArrivedAt: 5,
        lastArrivedAt: 5,
        arrivalCount: 1,
        lastArrivalRecordId: "mj1",
        lastArrivalTo: "home-a",
        currentlyResident: true,
      },
    ]);
    expect(journey.inbound.teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 2, axes: ["ax-1"] },
    ]);
    expect(journey.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(journey.snapshot.checkIn.news).toEqual([
      {
        creatureId: "c-j1",
        kind: "arrival",
        movementId: "mj1",
        at: 5,
        from: null,
        to: "home-a",
      },
    ]);
    expect(journey.snapshot.records[0].creatureId).toBe("c-j1");
    expect(journey.snapshot.records[0].currentHome).toBe("home-b");
    expect(journey.snapshot.records[0].bonds.keepers[0].effective).toBe(14);
  });

  it("outing-snapshot-only bundle (no journey entries)", () => {
    const inputs: GardenOutingJourneyInputs = {
      outingSnapshot: fullInputs(),
      journeys: { entries: [] },
    };
    const result = gardenOutingJourney(inputs);
    expect(result.journeys).toEqual([]);
    expect(result.outingSnapshot).toEqual(
      gardenOutingSnapshot(inputs.outingSnapshot),
    );
  });

  it("journeys with a minimal outing-snapshot section", () => {
    const inputs: GardenOutingJourneyInputs = {
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: { entries: [journeyEntryFull()] },
    };
    const result = gardenOutingJourney(inputs);
    expect(result.outingSnapshot).toEqual(
      gardenOutingSnapshot(inputs.outingSnapshot),
    );
    expect(result.journeys[0].journey.inbound.arrivals).toHaveLength(1);
    expect(result.journeys[0].journey.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(result.journeys[0].journey.snapshot.records[0].currentHome).toBe(
      "home-b",
    );
  });

  it("caller order for journey entries, not any other section's order", () => {
    const inputs = fullInputsJourney();
    inputs.journeys.entries = [journeyEntryBase(), journeyEntryFull()];
    const result = gardenOutingJourney(inputs);
    expect(result.journeys.map((reading) => reading.id)).toEqual([
      "jn-9",
      "jn-1",
    ]);
    expect(result.journeys[0].journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(result.journeys[0].journey.snapshot.checkIn.news).toEqual([]);
    expect(result.journeys[0].journey.snapshot.records).toEqual([]);
    expect(result.journeys[1].journey.snapshot.checkIn.news).toHaveLength(1);
  });

  it("journey with no arrivals, meetings, news, or records reads empty, never a fabricated visit", () => {
    const result = gardenOutingJourney({
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: { entries: [journeyEntryBase()] },
    });
    expect(result.journeys[0].journey).toEqual(
      gardenJourney(journeyEntryBase().inputs),
    );
    expect(result.journeys[0].journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(result.journeys[0].journey.snapshot.checkIn.news).toEqual([]);
    expect(result.journeys[0].journey.snapshot.records).toEqual([]);
  });

  it("exact result shape: two sections only, readings exactly id + journey", () => {
    const result = gardenOutingJourney(fullInputsJourney());
    expect(Object.keys(result).sort()).toEqual([
      "journeys",
      "outingSnapshot",
    ]);
    for (const reading of result.journeys) {
      expect(Object.keys(reading).sort()).toEqual(["id", "journey"]);
      expect(Object.keys(reading.journey).sort()).toEqual([
        "inbound",
        "snapshot",
      ]);
    }
    expect("journeys" in result.outingSnapshot).toBe(false);
    expect("outingSnapshot" in result.journeys[0]).toBe(false);
  });

  it("side-by-side-not-merged: a journey visit is never read off the outing-snapshot section", () => {
    const full = gardenOutingJourney(fullInputsJourney());
    // The journey inbound names c-j1 while the outing-snapshot
    // records section names only c-1: different pictures, both
    // reported; the outing-snapshot decay still reads 44.
    expect(full.journeys[0].journey.inbound.arrivals[0].creatureId).toBe(
      "c-j1",
    );
    expect(
      full.outingSnapshot.outingCheckin.outingRecord.records.map(
        (r) => r.creatureId,
      ),
    ).toEqual(["c-1"]);
    expect(
      full.outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks
        .outingComfort.outingDecay.decay[0].breakdown.effective,
    ).toBe(44);
    // The same journey input reads identically with a minimal
    // outing-snapshot section as with the full one.
    const journeysOnly = gardenOutingJourney({
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: { entries: [journeyEntryFull()] },
    });
    expect(journeysOnly.journeys[0].journey).toEqual(
      full.journeys[0].journey,
    );
    // A creature in the journey news but absent from the
    // outing-snapshot records is still reported in journeys.
    expect(
      journeysOnly.journeys[0].journey.snapshot.checkIn.news[0].creatureId,
    ).toBe("c-j1");
  });

  it("loud failures on malformed bundles and journey entries", () => {
    expect(() => gardenOutingJourney(null as never)).toThrow();
    expect(() =>
      gardenOutingJourney({ journeys: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [{ id: "", inputs: journeyEntryBase().inputs }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [journeyEntryBase(), journeyEntryBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [{ id: "bad", inputs: null as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    // Journey read: duplicate movement id inside one journey's
    // inbound log.
    const dupMovement = journeyEntryFull();
    dupMovement.inputs.inbound.movementLog = [
      checkinMovement("mj1", "c-j1", "garden-arrival", null, "home-a", 5),
      checkinMovement("mj1", "c-j1", "garden-arrival", null, "home-a", 6),
    ];
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [dupMovement] },
      }),
    ).toThrow();
    // Journey read: duplicate record creature inside one
    // journey's snapshot.
    const dupRecord = journeyEntryFull();
    dupRecord.inputs.snapshot.records = [
      journeyRecordEntry(),
      journeyRecordEntry(),
    ];
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: {
          outingCheckin: outingCheckinBase(),
          snapshots: { entries: [] },
        },
        journeys: { entries: [dupRecord] },
      }),
    ).toThrow();
    // Outing-snapshot read: duplicate snapshot entry id.
    const dupSnapshot = fullInputs();
    dupSnapshot.snapshots.entries = [snapshotBase(), snapshotBase()];
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: dupSnapshot,
        journeys: { entries: [] },
      }),
    ).toThrow();
    // Outing-snapshot read: duplicate checkin entry id.
    const dupCheckin = fullInputs();
    dupCheckin.outingCheckin.checkins.entries = [
      checkinFull(),
      checkinFull(),
    ];
    expect(() =>
      gardenOutingJourney({
        outingSnapshot: dupCheckin,
        journeys: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputsJourney();
    const first = gardenOutingJourney(inputs);
    first.journeys[0].journey.inbound.taughtAxes.push("ax-z");
    (first.journeys[0].journey.snapshot.checkIn.news[0] as {
      kind: string;
    }).kind = "mutated";
    first.journeys[0].journey.snapshot.records[0].bonds.keepers[0].effective =
      -999;
    (first.outingSnapshot.snapshots[0].snapshot.checkIn.news[0] as {
      kind: string;
    }).kind = "mutated";
    first.outingSnapshot.outingCheckin.outingRecord.outingLevel.levels[0].summary.aggregate =
      -999;
    first.outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity =
      -999;
    const second = gardenOutingJourney(inputs);
    expect(second.journeys[0].journey.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(second.journeys[0].journey.snapshot.checkIn.news[0].kind).toBe(
      "arrival",
    );
    expect(
      second.journeys[0].journey.snapshot.records[0].bonds.keepers[0].effective,
    ).toBe(14);
    expect(second.outingSnapshot.snapshots[0].snapshot.checkIn.news[0].kind).toBe(
      "arrival",
    );
    expect(
      second.outingSnapshot.outingCheckin.outingRecord.outingLevel.levels[0]
        .summary.aggregate,
    ).toBe(70);
    expect(
      second.outingSnapshot.outingCheckin.outingRecord.outingLevel.outingThanks
        .thanks[0].presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(inputs.journeys.entries[0].id).toBe("jn-1");
    expect(inputs.outingSnapshot.snapshots.entries[0].id).toBe("sn-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingJourney({
      outingSnapshot: {
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [] },
      },
      journeys: {
        entries: [{ id: "jn/α-1 :: odd", inputs: journeyEntryBase().inputs }],
      },
    });
    expect(result.journeys[0].id).toBe("jn/α-1 :: odd");
    expect(result.journeys[0].journey.inbound.arrivals).toEqual([]);
  });

  it("staging locks: no host or composed module imports the outing-journey bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-journey");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-journey.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
