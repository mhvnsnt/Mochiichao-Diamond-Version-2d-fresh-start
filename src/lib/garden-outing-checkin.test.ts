import { describe, expect, it } from "vitest";
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
import type { GardenSnapshotInputs } from "./garden-snapshot";
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

function fullInputs(): GardenOutingCheckinInputs {
  return {
    outingRecord: outingRecordFull(),
    checkins: { entries: [checkinFull()] },
  };
}

describe("garden-outing-checkin (B3 outing + records + check-in beats)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingCheckinInputs = {
      outingRecord: outingRecordBase(),
      checkins: { entries: [] },
    };
    const result = gardenOutingCheckin(inputs);
    expect(result).toEqual({
      outingRecord: gardenOutingRecord(outingRecordBase()),
      checkins: [],
    });
    expect(Object.keys(result).sort()).toEqual([
      "checkins",
      "outingRecord",
    ]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullInputs();
    const result = gardenOutingCheckin(inputs);
    expect(result.outingRecord).toEqual(
      gardenOutingRecord(inputs.outingRecord),
    );
    expect(result.checkins).toEqual(
      inputs.checkins.entries.map((entry) => ({
        id: entry.id,
        checkin: gardenCheckIn(entry.inputs),
      })),
    );
    // Hand-checked outing-record numbers: decay 50 - 6 = 44;
    // comfort day 50 - 2 = 48; thanks intensity 3 / 4 = 0.75;
    // level mean comfort 70 -> 2; record k-a 20 - 6 = 14.
    const outingRecord = result.outingRecord;
    expect(
      outingRecord.outingLevel.outingThanks.outingComfort.outingDecay.decay[0]
        .breakdown.effective,
    ).toBe(44);
    expect(
      outingRecord.outingLevel.outingThanks.outingComfort.comfort[0].result
        .comfort,
    ).toBe(48);
    expect(
      outingRecord.outingLevel.outingThanks.thanks[0].presentation.signals[0]
        .intensity,
    ).toBe(0.75);
    expect(outingRecord.outingLevel.levels[0].summary.aggregate).toBe(70);
    expect(outingRecord.outingLevel.levels[0].summary.level).toBe(2);
    expect(outingRecord.records[0].record.bonds.keepers[0].effective).toBe(14);
    expect(outingRecord.records[0].record.currentHome).toBe("home-b");
    // Hand-checked check-in numbers: three news items in stamp
    // order (arrival, departure, edge-sighting); migration
    // arrived c-3 / departed c-2; story arrived c-4 / departed
    // c-1; arc changed to arc-b for c-1.
    const checkin = result.checkins[0].checkin;
    expect(checkin.news.map((item) => item.movementId)).toEqual([
      "m1",
      "m2",
      "m3",
    ]);
    expect(checkin.news.map((item) => item.kind)).toEqual([
      "arrival",
      "departure",
      "edge-sighting",
    ]);
    expect(checkin.autonomous.migration).toMatchObject({
      residents: ["c-1", "c-3"],
      arrived: ["c-3"],
      departed: ["c-2"],
      appliedRuleIds: ["r1"],
    });
    expect(checkin.autonomous.story).toMatchObject({
      residents: ["c-2", "c-4"],
      arrived: ["c-4"],
      departed: ["c-1"],
    });
    expect(checkin.autonomous.arcs).toEqual({
      arcs: [{ residentId: "c-1", arc: "arc-b" }],
      changed: ["c-1"],
      appliedBeatIds: ["a1"],
    });
  });

  it("outing-record-only bundle (no checkin entries)", () => {
    const inputs: GardenOutingCheckinInputs = {
      outingRecord: outingRecordFull(),
      checkins: { entries: [] },
    };
    const result = gardenOutingCheckin(inputs);
    expect(result.checkins).toEqual([]);
    expect(result.outingRecord).toEqual(
      gardenOutingRecord(inputs.outingRecord),
    );
  });

  it("checkins with a minimal outing-record section", () => {
    const inputs: GardenOutingCheckinInputs = {
      outingRecord: outingRecordBase(),
      checkins: { entries: [checkinFull()] },
    };
    const result = gardenOutingCheckin(inputs);
    expect(result.outingRecord).toEqual(
      gardenOutingRecord(outingRecordBase()),
    );
    expect(result.checkins[0].checkin.news).toHaveLength(3);
    expect(result.checkins[0].checkin.autonomous.migration.arrived).toEqual([
      "c-3",
    ]);
  });

  it("caller order for checkin entries, not any other section's order", () => {
    const inputs = fullInputs();
    inputs.checkins.entries = [
      { id: "ck-9", inputs: checkInBase() },
      checkinFull(),
    ];
    const result = gardenOutingCheckin(inputs);
    expect(result.checkins.map((reading) => reading.id)).toEqual([
      "ck-9",
      "ck-1",
    ]);
    expect(result.checkins[0].checkin.news).toEqual([]);
    expect(result.checkins[1].checkin.news).toHaveLength(3);
  });

  it("beat with no news reads empty news, never a fabricated beat", () => {
    const result = gardenOutingCheckin({
      outingRecord: outingRecordBase(),
      checkins: { entries: [{ id: "ck-9", inputs: checkInBase() }] },
    });
    expect(result.checkins[0].checkin).toEqual({
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
    });
  });

  it("exact result shape: two sections only, readings exactly id + checkin", () => {
    const result = gardenOutingCheckin(fullInputs());
    expect(Object.keys(result).sort()).toEqual([
      "checkins",
      "outingRecord",
    ]);
    for (const reading of result.checkins) {
      expect(Object.keys(reading).sort()).toEqual(["checkin", "id"]);
      expect(Object.keys(reading.checkin).sort()).toEqual([
        "autonomous",
        "news",
      ]);
    }
    expect("checkins" in result.outingRecord).toBe(false);
    expect("outingRecord" in result.checkins[0]).toBe(false);
  });

  it("side-by-side-not-merged: a check-in beat is never read off the outing-record section", () => {
    const full = gardenOutingCheckin(fullInputs());
    // The check-in news names c-9/c-8/c-7 while the outing-record
    // records section names only c-1: different pictures, both
    // reported; the outing-record decay still reads 44.
    expect(full.checkins[0].checkin.news.map((i) => i.creatureId)).toEqual([
      "c-9",
      "c-8",
      "c-7",
    ]);
    expect(full.outingRecord.records.map((r) => r.creatureId)).toEqual([
      "c-1",
    ]);
    expect(
      full.outingRecord.outingLevel.outingThanks.outingComfort.outingDecay
        .decay[0].breakdown.effective,
    ).toBe(44);
    // The same checkin input reads identically with a minimal
    // outing-record section as with the full one.
    const checkinsOnly = gardenOutingCheckin({
      outingRecord: outingRecordBase(),
      checkins: { entries: [checkinFull()] },
    });
    expect(checkinsOnly.checkins[0].checkin).toEqual(
      full.checkins[0].checkin,
    );
    // A creature in the check-in news but absent from the
    // outing-record records is still reported in checkins.
    expect(
      checkinsOnly.checkins[0].checkin.news[0].creatureId,
    ).toBe("c-9");
  });

  it("loud failures on malformed bundles and checkin entries", () => {
    expect(() => gardenOutingCheckin(null as never)).toThrow();
    expect(() =>
      gardenOutingCheckin({ checkins: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingCheckin({ outingRecord: outingRecordBase() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: { entries: [{ id: "", inputs: checkInBase() }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: {
          entries: [
            { id: "dup", inputs: checkInBase() },
            { id: "dup", inputs: checkInBase() },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: { entries: [{ id: "bad", inputs: null as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    // Check-in read: non-finite check-in stamp.
    const badStamp = checkinFull();
    badStamp.inputs.news = { since: Number.NaN };
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: { entries: [badStamp] },
      }),
    ).toThrow();
    // Check-in read: unknown story cursor.
    const badCursor = checkinFull();
    badCursor.inputs.autonomous.storyThroughBeatId = "no-such-beat";
    expect(() =>
      gardenOutingCheckin({
        outingRecord: outingRecordBase(),
        checkins: { entries: [badCursor] },
      }),
    ).toThrow();
    // Outing-record read: duplicate level entry id.
    const dupLevel = fullInputs();
    dupLevel.outingRecord.outingLevel.levels.entries = [
      { id: "dup", input: { comforts: [], tiers: [] } },
      { id: "dup", input: { comforts: [], tiers: [] } },
    ];
    expect(() => gardenOutingCheckin(dupLevel)).toThrow();
    // Outing-record read: duplicate record creature id.
    const dupRecord = fullInputs();
    dupRecord.outingRecord.records.entries = [
      recordFull(),
      recordFull(),
    ];
    expect(() => gardenOutingCheckin(dupRecord)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const comforts =
      inputs.outingRecord.outingLevel.levels.entries[0].input.comforts;
    const first = gardenOutingCheckin(inputs);
    (first.checkins[0].checkin.news[0] as { kind: string }).kind =
      "mutated";
    first.checkins[0].checkin.autonomous.migration.arrived[0] = "mutated";
    first.checkins[0].checkin.autonomous.arcs.arcs[0].arc = "mutated";
    first.outingRecord.records[0].record.bonds.keepers[0].effective = -999;
    first.outingRecord.outingLevel.levels[0].summary.aggregate = -999;
    first.outingRecord.outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity =
      -999;
    const second = gardenOutingCheckin(inputs);
    expect(second.checkins[0].checkin.news[0].kind).toBe("arrival");
    expect(second.checkins[0].checkin.autonomous.migration.arrived).toEqual([
      "c-3",
    ]);
    expect(second.checkins[0].checkin.autonomous.arcs.arcs[0].arc).toBe(
      "arc-b",
    );
    expect(second.outingRecord.records[0].record.bonds.keepers[0].effective).toBe(
      14,
    );
    expect(second.outingRecord.outingLevel.levels[0].summary.aggregate).toBe(
      70,
    );
    expect(
      second.outingRecord.outingLevel.outingThanks.thanks[0].presentation
        .signals[0].intensity,
    ).toBe(0.75);
    expect(comforts).toEqual([60, 80]);
    expect(inputs.checkins.entries[0].id).toBe("ck-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingCheckin({
      outingRecord: outingRecordBase(),
      checkins: {
        entries: [{ id: "ck/α-1 :: odd", inputs: checkInBase() }],
      },
    });
    expect(result.checkins[0].id).toBe("ck/α-1 :: odd");
    expect(result.checkins[0].checkin.news).toEqual([]);
  });

  it("staging locks: no host or composed module imports the outing-checkin bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-checkin");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-checkin.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
