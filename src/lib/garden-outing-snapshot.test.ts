import { describe, expect, it } from "vitest";
import {
  gardenOutingSnapshot,
  type GardenOutingSnapshotInputs,
  type SnapshotEntry,
} from "./garden-outing-snapshot";
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

function fullInputs(): GardenOutingSnapshotInputs {
  return {
    outingCheckin: outingCheckinFull(),
    snapshots: { entries: [snapshotFull()] },
  };
}

describe("garden-outing-snapshot (B3 outing + check-ins + snapshot lenses)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingSnapshotInputs = {
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [] },
    };
    const result = gardenOutingSnapshot(inputs);
    expect(result).toEqual({
      outingCheckin: gardenOutingCheckin(outingCheckinBase()),
      snapshots: [],
    });
    expect(Object.keys(result).sort()).toEqual([
      "outingCheckin",
      "snapshots",
    ]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullInputs();
    const result = gardenOutingSnapshot(inputs);
    expect(result.outingCheckin).toEqual(
      gardenOutingCheckin(inputs.outingCheckin),
    );
    expect(result.snapshots).toEqual(
      inputs.snapshots.entries.map((entry) => ({
        id: entry.id,
        snapshot: gardenSnapshot(entry.inputs),
      })),
    );
    // Hand-checked outing-checkin numbers: decay 50 - 6 = 44;
    // comfort day 50 - 2 = 48; thanks intensity 3 / 4 = 0.75;
    // level mean comfort 70 -> 2; record k-a 20 - 6 = 14;
    // check-in news m1/m2/m3 arrival/departure/edge-sighting.
    const outingCheckin = result.outingCheckin;
    expect(
      outingCheckin.outingRecord.outingLevel.outingThanks.outingComfort
        .outingDecay.decay[0].breakdown.effective,
    ).toBe(44);
    expect(
      outingCheckin.outingRecord.outingLevel.outingThanks.outingComfort
        .comfort[0].result.comfort,
    ).toBe(48);
    expect(
      outingCheckin.outingRecord.outingLevel.outingThanks.thanks[0]
        .presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(outingCheckin.outingRecord.outingLevel.levels[0].summary.aggregate).toBe(70);
    expect(outingCheckin.outingRecord.outingLevel.levels[0].summary.level).toBe(2);
    expect(outingCheckin.outingRecord.records[0].record.bonds.keepers[0].effective).toBe(14);
    expect(outingCheckin.checkins[0].checkin.news.map((item) => item.movementId)).toEqual([
      "m1",
      "m2",
      "m3",
    ]);
    // Hand-checked snapshot numbers: news s1/s2
    // arrival/edge-sighting; migration arrived c-6 / departed c-2;
    // story arrived c-7 / departed c-1; arc changed to arc-c for
    // c-1; snapshot record resident at home-b, k-a 20 - 6 = 14.
    const snapshot = result.snapshots[0].snapshot;
    expect(snapshot.checkIn.news.map((item) => item.movementId)).toEqual([
      "s1",
      "s2",
    ]);
    expect(snapshot.checkIn.news.map((item) => item.kind)).toEqual([
      "arrival",
      "edge-sighting",
    ]);
    expect(snapshot.checkIn.autonomous.migration).toMatchObject({
      residents: ["c-1", "c-6"],
      arrived: ["c-6"],
      departed: ["c-2"],
      appliedRuleIds: ["r-sn"],
    });
    expect(snapshot.checkIn.autonomous.story).toMatchObject({
      residents: ["c-2", "c-7"],
      arrived: ["c-7"],
      departed: ["c-1"],
    });
    expect(snapshot.checkIn.autonomous.arcs).toEqual({
      arcs: [{ residentId: "c-1", arc: "arc-c" }],
      changed: ["c-1"],
      appliedBeatIds: ["a1"],
    });
    expect(snapshot.records[0].creatureId).toBe("c-1");
    expect(snapshot.records[0].currentHome).toBe("home-b");
    expect(snapshot.records[0].bonds.keepers[0].effective).toBe(14);
  });

  it("outing-checkin-only bundle (no snapshot entries)", () => {
    const inputs: GardenOutingSnapshotInputs = {
      outingCheckin: outingCheckinFull(),
      snapshots: { entries: [] },
    };
    const result = gardenOutingSnapshot(inputs);
    expect(result.snapshots).toEqual([]);
    expect(result.outingCheckin).toEqual(
      gardenOutingCheckin(inputs.outingCheckin),
    );
  });

  it("snapshots with a minimal outing-checkin section", () => {
    const inputs: GardenOutingSnapshotInputs = {
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [snapshotFull()] },
    };
    const result = gardenOutingSnapshot(inputs);
    expect(result.outingCheckin).toEqual(
      gardenOutingCheckin(outingCheckinBase()),
    );
    expect(result.snapshots[0].snapshot.checkIn.news).toHaveLength(2);
    expect(result.snapshots[0].snapshot.checkIn.autonomous.migration.arrived).toEqual([
      "c-6",
    ]);
    expect(result.snapshots[0].snapshot.records[0].currentHome).toBe("home-b");
  });

  it("caller order for snapshot entries, not any other section's order", () => {
    const inputs = fullInputs();
    inputs.snapshots.entries = [snapshotBase(), snapshotFull()];
    const result = gardenOutingSnapshot(inputs);
    expect(result.snapshots.map((reading) => reading.id)).toEqual([
      "sn-9",
      "sn-1",
    ]);
    expect(result.snapshots[0].snapshot.checkIn.news).toEqual([]);
    expect(result.snapshots[0].snapshot.records).toEqual([]);
    expect(result.snapshots[1].snapshot.checkIn.news).toHaveLength(2);
  });

  it("snapshot with no news and no records reads empty, never a fabricated lens", () => {
    const result = gardenOutingSnapshot({
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [snapshotBase()] },
    });
    expect(result.snapshots[0].snapshot).toEqual({
      checkIn: {
        news: [],
        autonomous: {
          migration: {
            residents: ["c-1", "c-2"],
            arrived: [],
            departed: [],
            appliedRuleIds: [],
          },
          story: {
            residents: ["c-1", "c-2"],
            arrived: [],
            departed: [],
            appliedBeatIds: ["b1"],
          },
          arcs: {
            arcs: [{ residentId: "c-1", arc: "arc-a" }],
            changed: [],
            appliedBeatIds: ["a1"],
          },
        },
      },
      records: [],
    });
  });

  it("exact result shape: two sections only, readings exactly id + snapshot", () => {
    const result = gardenOutingSnapshot(fullInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingCheckin",
      "snapshots",
    ]);
    for (const reading of result.snapshots) {
      expect(Object.keys(reading).sort()).toEqual(["id", "snapshot"]);
      expect(Object.keys(reading.snapshot).sort()).toEqual([
        "checkIn",
        "records",
      ]);
    }
    expect("snapshots" in result.outingCheckin).toBe(false);
    expect("outingCheckin" in result.snapshots[0]).toBe(false);
  });

  it("side-by-side-not-merged: a snapshot lens is never read off the outing-checkin section", () => {
    const full = gardenOutingSnapshot(fullInputs());
    // The snapshot news names c-5/c-6 while the outing-checkin
    // records section names only c-1: different pictures, both
    // reported; the outing-checkin decay still reads 44.
    expect(full.snapshots[0].snapshot.checkIn.news.map((i) => i.creatureId)).toEqual([
      "c-5",
      "c-6",
    ]);
    expect(full.outingCheckin.outingRecord.records.map((r) => r.creatureId)).toEqual([
      "c-1",
    ]);
    expect(
      full.outingCheckin.outingRecord.outingLevel.outingThanks.outingComfort
        .outingDecay.decay[0].breakdown.effective,
    ).toBe(44);
    // The same snapshot input reads identically with a minimal
    // outing-checkin section as with the full one.
    const snapshotsOnly = gardenOutingSnapshot({
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [snapshotFull()] },
    });
    expect(snapshotsOnly.snapshots[0].snapshot).toEqual(
      full.snapshots[0].snapshot,
    );
    // A creature in the snapshot news but absent from the
    // outing-checkin records is still reported in snapshots.
    expect(
      snapshotsOnly.snapshots[0].snapshot.checkIn.news[0].creatureId,
    ).toBe("c-5");
  });

  it("loud failures on malformed bundles and snapshot entries", () => {
    expect(() => gardenOutingSnapshot(null as never)).toThrow();
    expect(() =>
      gardenOutingSnapshot({ snapshots: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingSnapshot({ outingCheckin: outingCheckinBase() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [{ id: "", inputs: snapshotBase().inputs }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: {
          entries: [snapshotBase(), snapshotBase()],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [{ id: "bad", inputs: null as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    // Snapshot read: duplicate record creature inside one snapshot.
    const dupRecord = snapshotFull();
    dupRecord.inputs.records = [snapshotRecordEntry(), snapshotRecordEntry()];
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [dupRecord] },
      }),
    ).toThrow();
    // Snapshot read: non-finite check-in stamp.
    const badStamp = snapshotFull();
    badStamp.inputs.checkIn.news = { since: Number.NaN };
    expect(() =>
      gardenOutingSnapshot({
        outingCheckin: outingCheckinBase(),
        snapshots: { entries: [badStamp] },
      }),
    ).toThrow();
    // Outing-checkin read: duplicate checkin entry id.
    const dupCheckin = fullInputs();
    dupCheckin.outingCheckin.checkins.entries = [
      checkinFull(),
      checkinFull(),
    ];
    expect(() => gardenOutingSnapshot(dupCheckin)).toThrow();
    // Outing-checkin read: duplicate level entry id.
    const dupLevel = fullInputs();
    dupLevel.outingCheckin.outingRecord.outingLevel.levels.entries = [
      { id: "dup", input: { comforts: [], tiers: [] } },
      { id: "dup", input: { comforts: [], tiers: [] } },
    ];
    expect(() => gardenOutingSnapshot(dupLevel)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const comforts =
      inputs.outingCheckin.outingRecord.outingLevel.levels.entries[0].input.comforts;
    const first = gardenOutingSnapshot(inputs);
    (first.snapshots[0].snapshot.checkIn.news[0] as { kind: string }).kind =
      "mutated";
    first.snapshots[0].snapshot.checkIn.autonomous.migration.arrived[0] = "mutated";
    first.snapshots[0].snapshot.checkIn.autonomous.arcs.arcs[0].arc = "mutated";
    first.snapshots[0].snapshot.records[0].bonds.keepers[0].effective = -999;
    (first.outingCheckin.checkins[0].checkin.news[0] as { kind: string }).kind =
      "mutated";
    first.outingCheckin.outingRecord.outingLevel.levels[0].summary.aggregate = -999;
    first.outingCheckin.outingRecord.outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity =
      -999;
    const second = gardenOutingSnapshot(inputs);
    expect(second.snapshots[0].snapshot.checkIn.news[0].kind).toBe("arrival");
    expect(second.snapshots[0].snapshot.checkIn.autonomous.migration.arrived).toEqual([
      "c-6",
    ]);
    expect(second.snapshots[0].snapshot.checkIn.autonomous.arcs.arcs[0].arc).toBe(
      "arc-c",
    );
    expect(second.snapshots[0].snapshot.records[0].bonds.keepers[0].effective).toBe(
      14,
    );
    expect(second.outingCheckin.checkins[0].checkin.news[0].kind).toBe("arrival");
    expect(second.outingCheckin.outingRecord.outingLevel.levels[0].summary.aggregate).toBe(
      70,
    );
    expect(
      second.outingCheckin.outingRecord.outingLevel.outingThanks.thanks[0].presentation
        .signals[0].intensity,
    ).toBe(0.75);
    expect(comforts).toEqual([60, 80]);
    expect(inputs.snapshots.entries[0].id).toBe("sn-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingSnapshot({
      outingCheckin: outingCheckinBase(),
      snapshots: {
        entries: [{ id: "sn/α-1 :: odd", inputs: snapshotBase().inputs }],
      },
    });
    expect(result.snapshots[0].id).toBe("sn/α-1 :: odd");
    expect(result.snapshots[0].snapshot.checkIn.news).toEqual([]);
  });

  it("staging locks: no host or composed module imports the outing-snapshot bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-snapshot");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-snapshot.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
