import { describe, expect, it } from "vitest";
import {
  gardenOutingThanks,
  type GardenOutingThanksInputs,
  type ThanksWindow,
} from "./garden-outing-thanks";
import {
  gardenOutingComfort,
  type ComfortEntry,
  type GardenOutingComfortInputs,
} from "./garden-outing-comfort";
import {
  gardenOutingDecay,
  type GardenOutingDecayInputs,
} from "./garden-outing-decay";
import {
  gardenOutingBonds,
  type GardenOutingBondsInputs,
} from "./garden-outing-bonds";
import type { GardenOutingInputs } from "./garden-outing";
import type { GardenJourneyInputs } from "./garden-journey";
import type { JourneyInboundInputs } from "./garden-inbound";
import type { GardenSnapshotInputs } from "./garden-snapshot";
import type { BridgeRecordInputs } from "./garden-record";
import {
  bondsForCreature,
  type BondLedger,
} from "./garden-bonds";
import {
  comfortAfterDay,
  type GardenNeedDef,
  type GardenNeedRate,
} from "./garden-comfort";
import type { ClassesForRecipe } from "./garden-attraction";
import type { SolvedHabitat } from "./garden-habitats";
import {
  decayBreakdown,
  type DecayProfile,
  type NeglectFact,
} from "./garden-decay";
import {
  thanksPresentation,
  type ThanksUseEvent,
} from "./garden-thanks";
import type { MovementRecord } from "./garden-movement";
import type { ResearchObservation } from "./garden-research";
import type { AutonomousChangeInputs } from "./garden-autonomous";

function movement(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  from: string | null,
  to: string | null,
  at: number,
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

function ledger(): BondLedger {
  return [
    { creatureId: "c-1", keeperId: "k-a", value: 20 },
    { creatureId: "c-1", keeperId: "k-b", value: 8 },
    { creatureId: "c-2", keeperId: "k-a", value: -3 },
  ];
}

function facts(
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

function inboundBase(): JourneyInboundInputs {
  return {
    movementLog: [],
    gardenHomes: ["home-a", "home-b"],
    teacherMapping: {},
    meetings: [],
  };
}

function snapshotBase(): GardenSnapshotInputs {
  return {
    checkIn: {
      log: [],
      news: { since: null },
      autonomous: autonomousBase(),
    },
    records: [],
  };
}

function journeyBase(): GardenJourneyInputs {
  return { inbound: inboundBase(), snapshot: snapshotBase() };
}

function researchBase(): GardenOutingInputs["research"] {
  return { log: [], speciesOfCreature: {}, speciesIds: [] };
}

function outingBase(): GardenOutingInputs {
  return { journey: journeyBase(), research: researchBase() };
}

function outingBondsBase(): GardenOutingBondsInputs {
  return { outing: outingBase(), bonds: { ledger: [], creatureIds: [] } };
}

function outingDecayBase(): GardenOutingDecayInputs {
  return { outingBonds: outingBondsBase(), decay: { entries: [] } };
}

function outingComfortBase(): GardenOutingComfortInputs {
  return { outingDecay: outingDecayBase(), comfort: { entries: [] } };
}

function decayEntry(
  id: string,
  accrued: number,
  factsList: NeglectFact[],
): GardenOutingDecayInputs["decay"]["entries"][number] {
  return { id, accrued, facts: factsList, profile: profile() };
}

function habitat(recipeId: string): SolvedHabitat {
  return { recipeId, tier: 1, extent: 3, finish: 5, character: null };
}

const classesFor: ClassesForRecipe = (recipeId) => {
  switch (recipeId) {
    case "sun-patch":
      return ["sunlit"];
    case "shade-grove":
      return ["shaded"];
    case "pond-edge":
      return ["water"];
    default:
      return [];
  }
};

const needs: GardenNeedDef[] = [
  { id: "sunlight", recipeIds: ["sun-patch"] },
  { id: "shade", classes: ["shaded"] },
  { id: "water", classes: ["water"], recipeIds: ["pond-edge"] },
];

const rates: Record<string, GardenNeedRate> = {
  sunlight: { gain: 10, loss: 6 },
  shade: { gain: 4, loss: 5 },
  water: { gain: 8, loss: 7 },
};

function comfortEntry(
  id: string,
  comfort: number,
  habitats: (SolvedHabitat | null)[],
): ComfortEntry {
  return {
    id,
    day: {
      comfort,
      habitats,
      needs,
      rates,
      classesForRecipe: classesFor,
    },
  };
}

function event(
  zoneId: string,
  habitatId: string | null,
  satisfiedNeeds: number,
  totalNeeds: number,
): ThanksUseEvent {
  return { zoneId, habitatId, satisfiedNeeds, totalNeeds };
}

function window(
  id: string,
  events: ThanksUseEvent[],
  previousLevel: number | null = null,
  newLevel: number | null = null,
  heartZoneId = "zone-h",
): ThanksWindow {
  return { id, events, previousLevel, newLevel, heartZoneId };
}

function base(): GardenOutingThanksInputs {
  return { outingComfort: outingComfortBase(), thanks: { windows: [] } };
}

describe("garden-outing-thanks (B3 outing + comfort + thanks)", () => {
  it("minimal inputs read back unchanged, no fabricated outing with thanks", () => {
    const result = gardenOutingThanks(base());
    expect(result.thanks).toEqual([]);
    expect(result.outingComfort).toEqual(
      gardenOutingComfort(outingComfortBase()),
    );
    expect(result.outingComfort.comfort).toEqual([]);
    expect(result.outingComfort.outingDecay.decay).toEqual([]);
  });

  it("full bundle: outing-comfort plus thanks, each exactly as its own read reports it", () => {
    const outingBonds: GardenOutingBondsInputs = {
      outing: {
        journey: {
          inbound: {
            movementLog: [
              movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
            ],
            gardenHomes: ["home-a", "home-b"],
            teacherMapping: { "sp-a": ["ax-1"] },
            meetings: [{ speciesId: "sp-a", at: 2 }],
          },
          snapshot: {
            checkIn: {
              log: [
                movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
              ],
              news: { since: null },
              autonomous: autonomousBase(),
            },
            records: [
              {
                creatureId: "c-1",
                inputs: {
                  ...recordBase(),
                  movementLog: [
                    movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
                  ],
                  observationLog: [obs("o1", "c-1", "growth", 2)],
                },
              },
            ],
          },
        },
        research: {
          log: [obs("r1", "c-1", "growth", 2), obs("r2", "c-2", "growth", 3)],
          speciesOfCreature: { "c-1": "sp-a", "c-2": "sp-b" },
          speciesIds: ["sp-a", "sp-b"],
        },
      },
      bonds: { ledger: ledger(), creatureIds: ["c-1", "c-2"] },
    };
    const decayEntries = [decayEntry("d-1", 50, [facts("absence", "party", 3)])];
    const comfortEntries = [
      comfortEntry("cf-1", 50, [habitat("sun-patch")]),
      comfortEntry("cf-2", 40, [
        habitat("sun-patch"),
        habitat("shade-grove"),
        habitat("pond-edge"),
      ]),
    ];
    const outingComfort: GardenOutingComfortInputs = {
      outingDecay: { outingBonds, decay: { entries: decayEntries } },
      comfort: { entries: comfortEntries },
    };
    const windows = [
      window(
        "w-1",
        [
          event("zone-a", "hab-a", 2, 3),
          event("zone-a", "hab-a", 1, 1),
          event("zone-a", null, 0, 2),
        ],
        null,
        2,
      ),
      window("w-2", [event("zone-b", "hab-b", 1, 2)], 2, 2),
    ];
    const result = gardenOutingThanks({ outingComfort, thanks: { windows } });
    expect(result.outingComfort).toEqual(gardenOutingComfort(outingComfort));
    expect(result.outingComfort.outingDecay.outingBonds.bonds).toEqual([
      { creatureId: "c-1", bonds: bondsForCreature(ledger(), "c-1") },
      { creatureId: "c-2", bonds: bondsForCreature(ledger(), "c-2") },
    ]);
    expect(result.outingComfort.outingDecay.decay[0].breakdown).toEqual(
      decayBreakdown(50, [facts("absence", "party", 3)], profile()),
    );
    expect(result.outingComfort.comfort).toEqual(
      comfortEntries.map((entry) => ({
        id: entry.id,
        result: comfortAfterDay(entry.day),
      })),
    );
    expect(result.thanks).toEqual(
      windows.map((w) => ({
        id: w.id,
        presentation: thanksPresentation({
          events: [...w.events],
          previousLevel: w.previousLevel,
          newLevel: w.newLevel,
          heartZoneId: w.heartZoneId,
        }),
      })),
    );
    // Hand-checked: decay 50 - 2*3 = 44; comfort cf-1 50 -> 48, cf-2 40 -> 62;
    // thanks w-1: hab-a grouped uses 2, satisfied 3, total 4, intensity 0.75,
    // zero-satisfaction zone-level event emits nothing; gathering from null to 2.
    expect(result.outingComfort.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(result.outingComfort.comfort[0].result.comfort).toEqual(48);
    expect(result.outingComfort.comfort[1].result.comfort).toEqual(62);
    expect(result.thanks[0].presentation.signals).toEqual([
      {
        zoneId: "zone-a",
        habitatId: "hab-a",
        uses: 2,
        satisfiedNeeds: 3,
        totalNeeds: 4,
        intensity: 0.75,
      },
    ]);
    expect(result.thanks[0].presentation.gathering).toEqual({
      kind: "gathering",
      zoneId: "zone-h",
      fromLevel: null,
      toLevel: 2,
    });
    expect(result.thanks[1].presentation.gathering).toBeNull();
  });

  it("thanks-only bundle: thanks windows need no outing content", () => {
    const windows = [
      window("w-1", [event("zone-a", "hab-a", 1, 1)], null, 1),
    ];
    const result = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: { windows },
    });
    expect(result.thanks[0].presentation.signals[0].intensity).toEqual(1);
    expect(result.thanks[0].presentation.gathering?.toLevel).toEqual(1);
    expect(result.outingComfort).toEqual(
      gardenOutingComfort(outingComfortBase()),
    );
  });

  it("outing-comfort-only bundle: an empty windows list reports no presentations", () => {
    const result = gardenOutingThanks({
      outingComfort: {
        outingDecay: outingDecayBase(),
        comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
      },
      thanks: { windows: [] },
    });
    expect(result.thanks).toEqual([]);
    expect(result.outingComfort.comfort[0].result.comfort).toEqual(48);
  });

  it("caller order: windows report in caller order, not sorted order", () => {
    const result = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: {
        windows: [
          window("w-2", [event("zone-b", null, 1, 1)]),
          window("w-1", [event("zone-a", null, 1, 1)]),
        ],
      },
    });
    expect(result.thanks.map((t) => t.id)).toEqual(["w-2", "w-1"]);
  });

  it("gathering null: no new level, or no level change, reads no beat", () => {
    const result = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: {
        windows: [
          window("w-same", [], 2, 2),
          window("w-none", [], 1, null),
        ],
      },
    });
    expect(result.thanks[0].presentation.gathering).toBeNull();
    expect(result.thanks[1].presentation.gathering).toBeNull();
    expect(result.thanks[0].presentation.signals).toEqual([]);
  });

  it("zero-satisfaction events emit nothing, inherited from garden-thanks", () => {
    const result = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: {
        windows: [window("w-1", [event("zone-a", "hab-a", 0, 3)])],
      },
    });
    expect(result.thanks[0].presentation.signals).toEqual([]);
  });

  it("exact result shape: two sections only; readings carry id + presentation only", () => {
    const result = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: {
        windows: [window("w-1", [event("zone-a", "hab-a", 1, 2)], null, 3)],
      },
    });
    expect(Object.keys(result).sort()).toEqual(["outingComfort", "thanks"]);
    expect(Object.keys(result.thanks[0]).sort()).toEqual([
      "id",
      "presentation",
    ]);
    expect(Object.keys(result.thanks[0].presentation).sort()).toEqual([
      "gathering",
      "signals",
    ]);
    expect(Object.keys(result.thanks[0].presentation.signals[0]).sort()).toEqual([
      "habitatId",
      "intensity",
      "satisfiedNeeds",
      "totalNeeds",
      "uses",
      "zoneId",
    ]);
    expect(result.outingComfort).not.toHaveProperty("thanks");
    expect(result.thanks[0].presentation).not.toHaveProperty("comfort");
  });

  it("side-by-side-not-merged: thanks is not computed from the comfort section", () => {
    const windows = [window("w-1", [event("zone-a", "hab-a", 2, 2)], null, 1)];
    const withComfort = gardenOutingThanks({
      outingComfort: {
        outingDecay: outingDecayBase(),
        comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
      },
      thanks: { windows },
    });
    const withoutComfort = gardenOutingThanks({
      outingComfort: outingComfortBase(),
      thanks: { windows },
    });
    // Comfort reads 48 in the first bundle; the thanks signal reads
    // intensity 1 in both, unchanged by the comfort section's presence.
    expect(withComfort.outingComfort.comfort[0].result.comfort).toEqual(48);
    expect(withComfort.thanks).toEqual(withoutComfort.thanks);
    expect(withComfort.thanks[0].presentation.signals[0].intensity).toEqual(1);
  });

  it("loud failures: malformed bundle and missing sections", () => {
    expect(() => gardenOutingThanks(null as never)).toThrow();
    expect(() =>
      gardenOutingThanks({ thanks: { windows: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingThanks({ outingComfort: outingComfortBase() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingThanks({
        outingComfort: outingComfortBase(),
        thanks: { windows: {} } as never,
      }),
    ).toThrow();
  });

  it("loud failures: bad or duplicate thanks window id, malformed window", () => {
    expect(() =>
      gardenOutingThanks({
        outingComfort: outingComfortBase(),
        thanks: { windows: [window("", [])] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingThanks({
        outingComfort: outingComfortBase(),
        thanks: { windows: [window("w-1", []), window("w-1", [])] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingThanks({
        outingComfort: outingComfortBase(),
        thanks: { windows: [null as never] },
      }),
    ).toThrow();
  });

  it("loud failures: thanks failure propagation from a bad event", () => {
    expect(() =>
      gardenOutingThanks({
        outingComfort: outingComfortBase(),
        thanks: {
          windows: [window("w-1", [event("zone-a", "hab-a", 3, 2)])],
        },
      }),
    ).toThrow();
  });

  it("loud failures: outing-comfort failure propagation", () => {
    expect(() =>
      gardenOutingThanks({
        outingComfort: {
          outingDecay: outingDecayBase(),
          comfort: {
            entries: [
              comfortEntry("cf-1", 50, [habitat("sun-patch")]),
              comfortEntry("cf-1", 50, [habitat("sun-patch")]),
            ],
          },
        },
        thanks: { windows: [] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingThanks({
        outingComfort: {
          outingDecay: {
            outingBonds: outingBondsBase(),
            decay: {
              entries: [
                decayEntry("d-1", 50, []),
                decayEntry("d-1", 40, []),
              ],
            },
          },
          comfort: { entries: [] },
        },
        thanks: { windows: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = {
      outingComfort: {
        outingDecay: {
          outingBonds: {
            outing: outingBase(),
            bonds: { ledger: ledger(), creatureIds: ["c-1"] },
          },
          decay: { entries: [decayEntry("d-1", 50, [facts("absence", "party", 3)])] },
        },
        comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
      },
      thanks: {
        windows: [
          window("w-1", [event("zone-a", "hab-a", 2, 4)], null, 2),
        ],
      },
    };
    const first = gardenOutingThanks(inputs);
    first.thanks[0].presentation.signals[0].uses = 99;
    first.thanks[0].presentation.signals[0].intensity = 0;
    if (first.thanks[0].presentation.gathering !== null) {
      first.thanks[0].presentation.gathering.toLevel = 99;
    }
    first.outingComfort.comfort[0].result.comfort = 0;
    first.outingComfort.outingDecay.decay[0].breakdown.contributions[0].amount = 99;
    first.outingComfort.outingDecay.outingBonds.bonds[0].bonds[0].value = 99;
    const second = gardenOutingThanks(inputs);
    expect(second.thanks[0].presentation.signals[0].uses).toEqual(1);
    expect(second.thanks[0].presentation.signals[0].intensity).toEqual(0.5);
    expect(second.thanks[0].presentation.gathering?.toLevel).toEqual(2);
    expect(second.outingComfort.comfort[0].result.comfort).toEqual(48);
    expect(second.outingComfort.outingDecay.decay[0].breakdown.contributions[0].amount).toEqual(6);
    expect(second.outingComfort.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(second.outingComfort.outingDecay.outingBonds.bonds[0].bonds[0].value).toEqual(20);
    expect(inputs.thanks.windows[0].events[0].satisfiedNeeds).toEqual(2);
    expect(inputs.outingComfort.comfort.entries[0].day.comfort).toEqual(50);
    expect(inputs.outingComfort.outingDecay.outingBonds.bonds.ledger).toEqual(ledger());
  });

  it("caller-vocabulary ids: opaque ids pass through untouched", () => {
    const result = gardenOutingThanks({
      outingComfort: {
        outingDecay: {
          outingBonds: {
            outing: outingBase(),
            bonds: {
              ledger: [
                { creatureId: "crt-qq", keeperId: "kp-zz", value: 7 },
              ],
              creatureIds: ["crt-qq"],
            },
          },
          decay: { entries: [decayEntry("crt-qq", 12, [])] },
        },
        comfort: { entries: [comfortEntry("cf-qq", 50, [habitat("sun-patch")])] },
      },
      thanks: {
        windows: [
          window("win-qq", [event("zone-qq", "hab-qq", 1, 1)], null, 1, "heart-qq"),
        ],
      },
    });
    expect(result.thanks[0].id).toEqual("win-qq");
    expect(result.thanks[0].presentation.signals[0].zoneId).toEqual("zone-qq");
    expect(result.thanks[0].presentation.gathering?.zoneId).toEqual("heart-qq");
    expect(result.outingComfort.comfort[0].id).toEqual("cf-qq");
    expect(result.outingComfort.outingDecay.decay[0].id).toEqual("crt-qq");
  });

  it("staging locks: no host or composed module imports the outing-thanks bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-thanks");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-thanks.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
