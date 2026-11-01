import { describe, expect, it } from "vitest";
import {
  gardenOutingRecord,
  type GardenOutingRecordInputs,
  type RecordEntry,
} from "./garden-outing-record";
import {
  gardenOutingLevel,
  type GardenOutingLevelInputs,
} from "./garden-outing-level";
import {
  bridgeRecordForCreature,
  type BridgeRecordInputs,
} from "./garden-record";
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
import type { CheckInInputs } from "./garden-checkin";
import type { AutonomousChangeInputs } from "./garden-autonomous";
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

function fullInputs(): GardenOutingRecordInputs {
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

describe("garden-outing-record (B3 outing + level + records)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingRecordInputs = {
      outingLevel: outingLevelBase(),
      records: { entries: [] },
    };
    const result = gardenOutingRecord(inputs);
    expect(result).toEqual({
      outingLevel: gardenOutingLevel(outingLevelBase()),
      records: [],
    });
    expect(Object.keys(result).sort()).toEqual([
      "outingLevel",
      "records",
    ]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullInputs();
    const result = gardenOutingRecord(inputs);
    expect(result.outingLevel).toEqual(
      gardenOutingLevel(inputs.outingLevel),
    );
    expect(result.records).toEqual(
      inputs.records.entries.map((entry) => ({
        creatureId: entry.creatureId,
        record: bridgeRecordForCreature(entry.creatureId, entry.inputs),
      })),
    );
    // Hand-checked outing-level numbers: decay 50 - 6 = 44;
    // comfort day 50 - 2 = 48; thanks intensity 3 / 4 = 0.75
    // with gathering to level 2; level mean comfort 70 -> 2.
    const outingLevel = result.outingLevel;
    expect(
      outingLevel.outingThanks.outingComfort.outingDecay.decay[0].breakdown
        .effective,
    ).toBe(44);
    expect(
      outingLevel.outingThanks.outingComfort.comfort[0].result.comfort,
    ).toBe(48);
    expect(
      outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(outingLevel.outingThanks.thanks[0].presentation.gathering).toEqual({
      kind: "gathering",
      zoneId: "heart-1",
      fromLevel: null,
      toLevel: 2,
    });
    expect(outingLevel.levels[0].summary.aggregate).toBe(70);
    expect(outingLevel.levels[0].summary.level).toBe(2);
    expect(outingLevel.levels[1].summary.aggregate).toBe(50);
    expect(outingLevel.levels[2].summary.level).toBeNull();
    // Hand-checked record numbers: resident at home-b, arrival at 5,
    // k-a 20 - 2*1*3 = 14, k-b 8 untouched, three observations.
    const record = result.records[0].record;
    expect(record.creatureId).toBe("c-1");
    expect(record.currentlyResident).toBe(true);
    expect(record.currentHome).toBe("home-b");
    expect(record.arrival).toMatchObject({
      creatureId: "c-1",
      firstArrivedAt: 5,
      lastArrivedAt: 5,
      arrivalCount: 1,
      lastArrivalRecordId: "m1",
      lastArrivalTo: "home-a",
      currentlyResident: true,
    });
    expect(record.bonds.keepers.map((k) => k.keeperId)).toEqual([
      "k-a",
      "k-b",
    ]);
    expect(record.bonds.keepers[0]).toMatchObject({
      accrued: 20,
      totalDecay: 6,
      effective: 14,
    });
    expect(record.bonds.keepers[1]).toMatchObject({
      accrued: 8,
      totalDecay: 0,
      effective: 8,
    });
    expect(record.observations.map((o) => o.id)).toEqual([
      "o1",
      "o2",
      "o3",
    ]);
    expect(record.observedKinds).toEqual(["growth", "behaviour"]);
    expect(record.edgeDiscovery).toBeNull();
  });

  it("outing-level-only bundle (no record entries)", () => {
    const inputs: GardenOutingRecordInputs = {
      outingLevel: fullInputs().outingLevel,
      records: { entries: [] },
    };
    const result = gardenOutingRecord(inputs);
    expect(result.records).toEqual([]);
    expect(result.outingLevel).toEqual(
      gardenOutingLevel(inputs.outingLevel),
    );
  });

  it("records with a minimal outing-level section", () => {
    const inputs: GardenOutingRecordInputs = {
      outingLevel: outingLevelBase(),
      records: { entries: [recordFull()] },
    };
    const result = gardenOutingRecord(inputs);
    expect(result.outingLevel).toEqual(
      gardenOutingLevel(outingLevelBase()),
    );
    expect(result.records[0].record.currentHome).toBe("home-b");
    expect(result.records[0].record.bonds.keepers[0].effective).toBe(14);
  });

  it("caller order for record entries, not any other section's order", () => {
    const inputs = fullInputs();
    inputs.records.entries = [
      { creatureId: "c-9", inputs: recordBase() },
      recordFull(),
    ];
    const result = gardenOutingRecord(inputs);
    expect(result.records.map((reading) => reading.creatureId)).toEqual([
      "c-9",
      "c-1",
    ]);
    expect(result.records[0].record.currentlyResident).toBe(false);
    expect(result.records[0].record.currentHome).toBeNull();
    expect(result.records[1].record.currentHome).toBe("home-b");
  });

  it("creature with no entries reads nulls and empty lists, never a fabricated record", () => {
    const result = gardenOutingRecord({
      outingLevel: outingLevelBase(),
      records: { entries: [{ creatureId: "c-9", inputs: recordBase() }] },
    });
    expect(result.records[0].record).toEqual({
      creatureId: "c-9",
      currentlyResident: false,
      currentHome: null,
      arrival: null,
      bonds: { creatureId: "c-9", keepers: [] },
      observations: [],
      observedKinds: [],
      edgeDiscovery: null,
    });
  });

  it("exact result shape: two sections only, readings exactly creatureId + record", () => {
    const result = gardenOutingRecord(fullInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingLevel",
      "records",
    ]);
    for (const reading of result.records) {
      expect(Object.keys(reading).sort()).toEqual([
        "creatureId",
        "record",
      ]);
      expect(Object.keys(reading.record).sort()).toEqual([
        "arrival",
        "bonds",
        "creatureId",
        "currentHome",
        "currentlyResident",
        "edgeDiscovery",
        "observations",
        "observedKinds",
      ]);
    }
    expect("records" in result.outingLevel).toBe(false);
    expect("outingLevel" in result.records[0]).toBe(false);
  });

  it("side-by-side-not-merged: a record is never read off the outing-level section", () => {
    const full = gardenOutingRecord(fullInputs());
    // The record's k-a bond reads effective 14 over its OWN ledger
    // and facts, while the outing-level decay breakdown reads
    // effective 44 over its own accrued 50: different numbers,
    // both reported.
    expect(full.records[0].record.bonds.keepers[0].effective).toBe(14);
    expect(
      full.outingLevel.outingThanks.outingComfort.outingDecay.decay[0]
        .breakdown.effective,
    ).toBe(44);
    // The same record input reads identically with a minimal
    // outing-level section as with the full one.
    const recordsOnly = gardenOutingRecord({
      outingLevel: outingLevelBase(),
      records: { entries: [recordFull()] },
    });
    expect(recordsOnly.records[0].record).toEqual(
      full.records[0].record,
    );
    // A creature absent from the outing-level bonds creature list
    // is still reported in the records section.
    const outsider = gardenOutingRecord({
      outingLevel: outingLevelBase(),
      records: { entries: [{ creatureId: "c-9", inputs: recordBase() }] },
    });
    expect(outsider.records[0].creatureId).toBe("c-9");
    expect(outsider.records[0].record.bonds.creatureId).toBe("c-9");
  });

  it("loud failures on malformed bundles and record entries", () => {
    expect(() => gardenOutingRecord(null as never)).toThrow();
    expect(() =>
      gardenOutingRecord({ records: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingRecord({ outingLevel: outingLevelBase() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: { entries: [{ creatureId: "", inputs: recordBase() }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: {
          entries: [
            { creatureId: "dup", inputs: recordBase() },
            { creatureId: "dup", inputs: recordBase() },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: { entries: [{ creatureId: "bad", inputs: null as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    // Record read: facts for a keeper with no bond entry.
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: {
          entries: [
            {
              creatureId: "c-1",
              inputs: {
                ...recordBase(),
                bondLedger: [
                  { creatureId: "c-1", keeperId: "k-a", value: 20 },
                ],
                factsByKeeper: {
                  "k-z": [fact("absence", "party", 1)],
                },
              },
            },
          ],
        },
      }),
    ).toThrow();
    // Record read: duplicate movement record id.
    expect(() =>
      gardenOutingRecord({
        outingLevel: outingLevelBase(),
        records: {
          entries: [
            {
              creatureId: "c-1",
              inputs: {
                ...recordBase(),
                movementLog: [
                  rec("m1", "c-1", "garden-arrival", "home-a", 1),
                  rec("m1", "c-1", "transfer", "home-b", 2),
                ],
              },
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-level read: duplicate level entry id.
    const dupLevel = fullInputs();
    dupLevel.outingLevel.levels.entries = [
      { id: "dup", input: { comforts: [], tiers: [] } },
      { id: "dup", input: { comforts: [], tiers: [] } },
    ];
    expect(() => gardenOutingRecord(dupLevel)).toThrow();
    // Outing-level read: duplicate thanks window id.
    const dupWindow = fullInputs();
    dupWindow.outingLevel.outingThanks.thanks.windows = [
      {
        id: "w-dup",
        events: [],
        previousLevel: null,
        newLevel: null,
        heartZoneId: "heart-1",
      },
      {
        id: "w-dup",
        events: [],
        previousLevel: null,
        newLevel: null,
        heartZoneId: "heart-1",
      },
    ];
    expect(() => gardenOutingRecord(dupWindow)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const comforts = inputs.outingLevel.levels.entries[0].input.comforts;
    const first = gardenOutingRecord(inputs);
    first.records[0].record.bonds.keepers[0].effective = -999;
    first.records[0].record.observations[0].kind = "mutated";
    first.records[0].record.observedKinds[0] = "mutated";
    first.outingLevel.levels[0].summary.aggregate = -999;
    first.outingLevel.outingThanks.thanks[0].presentation.signals[0].intensity =
      -999;
    const second = gardenOutingRecord(inputs);
    expect(second.records[0].record.bonds.keepers[0].effective).toBe(14);
    expect(second.records[0].record.observations[0].kind).toBe("growth");
    expect(second.records[0].record.observedKinds[0]).toBe("growth");
    expect(second.outingLevel.levels[0].summary.aggregate).toBe(70);
    expect(
      second.outingLevel.outingThanks.thanks[0].presentation.signals[0]
        .intensity,
    ).toBe(0.75);
    expect(comforts).toEqual([60, 80]);
    expect(inputs.records.entries[0].creatureId).toBe("c-1");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingRecord({
      outingLevel: outingLevelBase(),
      records: {
        entries: [
          { creatureId: "c/α-1 :: odd", inputs: recordBase() },
        ],
      },
    });
    expect(result.records[0].creatureId).toBe("c/α-1 :: odd");
    expect(result.records[0].record.creatureId).toBe("c/α-1 :: odd");
    expect(result.records[0].record.bonds.creatureId).toBe("c/α-1 :: odd");
  });

  it("staging locks: no host or composed module imports the outing-record bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-record");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-record.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
