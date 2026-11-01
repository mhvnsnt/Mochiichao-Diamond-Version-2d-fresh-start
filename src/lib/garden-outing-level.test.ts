import { describe, expect, it } from "vitest";
import {
  gardenOutingLevel,
  type GardenOutingLevelInputs,
} from "./garden-outing-level";
import {
  gardenOutingThanks,
  type GardenOutingThanksInputs,
  type ThanksWindow,
} from "./garden-outing-thanks";
import {
  gardenLevelSummary,
  type GardenLevelBand,
} from "./garden-level";
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

function fullInputs(): GardenOutingLevelInputs {
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
  };
}

describe("garden-outing-level (B3 outing + thanks + level)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingLevelInputs = {
      outingThanks: outingThanksBase(),
      levels: { entries: [] },
    };
    const result = gardenOutingLevel(inputs);
    expect(result).toEqual({
      outingThanks: gardenOutingThanks(outingThanksBase()),
      levels: [],
    });
    expect(Object.keys(result).sort()).toEqual(["levels", "outingThanks"]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullInputs();
    const result = gardenOutingLevel(inputs);
    expect(result.outingThanks).toEqual(
      gardenOutingThanks(inputs.outingThanks),
    );
    expect(result.levels).toEqual(
      inputs.levels.entries.map((entry) => ({
        id: entry.id,
        summary: gardenLevelSummary(entry.input),
      })),
    );
    // Hand-checked: decay 50 - 6 = 44; comfort day 50 - 2 = 48.
    const decaySection =
      result.outingThanks.outingComfort.outingDecay.decay;
    expect(decaySection[0].breakdown.effective).toBe(44);
    const comfortSection = result.outingThanks.outingComfort.comfort;
    expect(comfortSection[0].result.comfort).toBe(48);
    // Hand-checked: thanks intensity 3 / 4 = 0.75, gathering to level 2.
    const thanksSection = result.outingThanks.thanks;
    expect(thanksSection[0].presentation.signals[0].intensity).toBe(0.75);
    expect(thanksSection[0].presentation.gathering).toEqual({
      kind: "gathering",
      zoneId: "heart-1",
      fromLevel: null,
      toLevel: 2,
    });
    // Hand-checked levels: mean comfort 70 -> level 2; tier score 50 -> level 2.
    expect(result.levels[0].summary).toEqual({
      residentCount: 2,
      habitatCount: 0,
      meanComfort: 70,
      meanTier: null,
      tierScore: null,
      aggregate: 70,
      level: 2,
    });
    expect(result.levels[1].summary.aggregate).toBe(50);
    expect(result.levels[1].summary.level).toBe(2);
    expect(result.levels[2].summary.aggregate).toBeNull();
    expect(result.levels[2].summary.level).toBeNull();
  });

  it("outing-thanks-only bundle (no level entries)", () => {
    const inputs: GardenOutingLevelInputs = {
      outingThanks: fullInputs().outingThanks,
      levels: { entries: [] },
    };
    const result = gardenOutingLevel(inputs);
    expect(result.levels).toEqual([]);
    expect(result.outingThanks).toEqual(
      gardenOutingThanks(inputs.outingThanks),
    );
  });

  it("levels with a minimal outing-thanks section", () => {
    const inputs: GardenOutingLevelInputs = {
      outingThanks: outingThanksBase(),
      levels: {
        entries: [
          {
            id: "lv-1",
            input: { comforts: [60, 80], tiers: [], bands: BANDS },
          },
        ],
      },
    };
    const result = gardenOutingLevel(inputs);
    expect(result.outingThanks).toEqual(
      gardenOutingThanks(outingThanksBase()),
    );
    expect(result.levels[0].summary.aggregate).toBe(70);
    expect(result.levels[0].summary.level).toBe(2);
  });

  it("caller order for level entries, not input order of any other section", () => {
    const inputs = fullInputs();
    inputs.levels.entries = [
      { id: "lv-z", input: { comforts: [90], tiers: [], bands: BANDS } },
      { id: "lv-a", input: { comforts: [10], tiers: [], bands: BANDS } },
    ];
    const result = gardenOutingLevel(inputs);
    expect(result.levels.map((reading) => reading.id)).toEqual([
      "lv-z",
      "lv-a",
    ]);
    expect(result.levels[0].summary.aggregate).toBe(90);
    expect(result.levels[1].summary.aggregate).toBe(10);
  });

  it("empty level entry reads null aggregate and null level, never 0 or 1", () => {
    const result = gardenOutingLevel({
      outingThanks: outingThanksBase(),
      levels: { entries: [{ id: "lv-0", input: { comforts: [], tiers: [] } }] },
    });
    expect(result.levels[0].summary).toEqual({
      residentCount: 0,
      habitatCount: 0,
      meanComfort: null,
      meanTier: null,
      tierScore: null,
      aggregate: null,
      level: null,
    });
  });

  it("no bands means no level even with a real aggregate", () => {
    const result = gardenOutingLevel({
      outingThanks: outingThanksBase(),
      levels: {
        entries: [
          { id: "lv-nb", input: { comforts: [60, 80], tiers: [] } },
        ],
      },
    });
    expect(result.levels[0].summary.aggregate).toBe(70);
    expect(result.levels[0].summary.level).toBeNull();
  });

  it("weights blend the comfort and tier sides", () => {
    const result = gardenOutingLevel({
      outingThanks: outingThanksBase(),
      levels: {
        entries: [
          {
            id: "lv-w",
            input: {
              comforts: [80],
              tiers: [2],
              tierMax: 4,
              comfortWeight: 3,
              tierWeight: 1,
              bands: BANDS,
            },
          },
        ],
      },
    });
    expect(result.levels[0].summary.tierScore).toBe(50);
    expect(result.levels[0].summary.aggregate).toBe(72.5);
    expect(result.levels[0].summary.level).toBe(2);
  });

  it("exact result shape: two sections only, readings exactly id + summary", () => {
    const result = gardenOutingLevel(fullInputs());
    expect(Object.keys(result).sort()).toEqual(["levels", "outingThanks"]);
    for (const reading of result.levels) {
      expect(Object.keys(reading).sort()).toEqual(["id", "summary"]);
      expect(Object.keys(reading.summary).sort()).toEqual([
        "aggregate",
        "habitatCount",
        "level",
        "meanComfort",
        "meanTier",
        "residentCount",
        "tierScore",
      ]);
    }
    expect("levels" in result.outingThanks).toBe(false);
    expect("outingThanks" in result.levels[0]).toBe(false);
  });

  it("side-by-side-not-merged: level is never read off the outing-thanks section", () => {
    const full = gardenOutingLevel(fullInputs());
    // The comfort day reads 48 while the level entry over its OWN
    // comforts [60, 80] reads 70: different numbers, both reported.
    expect(full.outingThanks.outingComfort.comfort[0].result.comfort).toBe(48);
    expect(full.levels[0].summary.aggregate).toBe(70);
    // The same level input reads the same aggregate with an empty
    // outing-thanks section present as with the full one.
    const levelsOnly = gardenOutingLevel({
      outingThanks: outingThanksBase(),
      levels: {
        entries: [
          {
            id: "lv-comfort",
            input: { comforts: [60, 80], tiers: [], bands: BANDS },
          },
        ],
      },
    });
    expect(levelsOnly.levels[0].summary).toEqual(full.levels[0].summary);
    // And the thanks intensity is the same with and without levels.
    expect(full.outingThanks.thanks[0].presentation.signals[0].intensity).toBe(
      gardenOutingLevel({
        outingThanks: fullInputs().outingThanks,
        levels: { entries: [] },
      }).outingThanks.thanks[0].presentation.signals[0].intensity,
    );
  });

  it("loud failures on malformed bundles and level entries", () => {
    expect(() => gardenOutingLevel(null as never)).toThrow();
    expect(() =>
      gardenOutingLevel({ levels: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: { entries: "nope" },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: {
          entries: [{ id: "", input: { comforts: [], tiers: [] } }],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: {
          entries: [
            { id: "dup", input: { comforts: [], tiers: [] } },
            { id: "dup", input: { comforts: [], tiers: [] } },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: { entries: [{ id: "bad", input: null as never }] },
      }),
    ).toThrow();
  });

  it("loud failures propagate from both composed reads", () => {
    // Level read: comfort out of range, and tiers without tierMax.
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: {
          entries: [{ id: "lv-bad", input: { comforts: [101], tiers: [] } }],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingLevel({
        outingThanks: outingThanksBase(),
        levels: {
          entries: [{ id: "lv-bad", input: { comforts: [], tiers: [1] } }],
        },
      }),
    ).toThrow();
    // Outing-thanks read: duplicate thanks window id.
    const dupWindow = fullInputs();
    dupWindow.outingThanks.thanks.windows = [
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
    expect(() => gardenOutingLevel(dupWindow)).toThrow();
    // Outing-thanks read: duplicate comfort entry id.
    const dupComfort = fullInputs();
    const entry = dupComfort.outingThanks.outingComfort.comfort.entries[0];
    dupComfort.outingThanks.outingComfort.comfort.entries = [entry, entry];
    expect(() => gardenOutingLevel(dupComfort)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInputs();
    const comforts = inputs.levels.entries[0].input.comforts;
    const first = gardenOutingLevel(inputs);
    first.levels[0].summary.aggregate = -999;
    first.outingThanks.thanks[0].presentation.signals[0].intensity = -999;
    const second = gardenOutingLevel(inputs);
    expect(second.levels[0].summary.aggregate).toBe(70);
    expect(
      second.outingThanks.thanks[0].presentation.signals[0].intensity,
    ).toBe(0.75);
    expect(comforts).toEqual([60, 80]);
    expect(inputs.levels.entries[0].id).toBe("lv-comfort");
  });

  it("caller-vocabulary ids pass through untouched", () => {
    const result = gardenOutingLevel({
      outingThanks: outingThanksBase(),
      levels: {
        entries: [
          {
            id: "lv/α-1 :: odd",
            input: { comforts: [50], tiers: [], bands: BANDS },
          },
        ],
      },
    });
    expect(result.levels[0].id).toBe("lv/α-1 :: odd");
    expect(result.levels[0].summary.aggregate).toBe(50);
  });

  it("staging locks: no host or composed module imports the outing-level bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-level");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-level.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
