import { describe, expect, it } from "vitest";
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

function base(): GardenOutingComfortInputs {
  return { outingDecay: outingDecayBase(), comfort: { entries: [] } };
}

describe("garden-outing-comfort (B3 outing + decay + comfort days)", () => {
  it("minimal inputs read back unchanged, no fabricated outing with comfort", () => {
    const result = gardenOutingComfort(base());
    expect(result.comfort).toEqual([]);
    expect(result.outingDecay).toEqual(gardenOutingDecay(outingDecayBase()));
    expect(result.outingDecay.outingBonds.bonds).toEqual([]);
    expect(result.outingDecay.decay).toEqual([]);
  });

  it("full bundle: outing-decay plus comfort, each exactly as its own read reports it", () => {
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
    const decayEntries = [
      decayEntry("d-1", 50, [facts("absence", "party", 3)]),
    ];
    const comfortEntries = [
      comfortEntry("cf-1", 50, [habitat("sun-patch")]),
      comfortEntry("cf-2", 40, [
        habitat("sun-patch"),
        habitat("shade-grove"),
        habitat("pond-edge"),
      ]),
    ];
    const result = gardenOutingComfort({
      outingDecay: { outingBonds, decay: { entries: decayEntries } },
      comfort: { entries: comfortEntries },
    });
    expect(result.outingDecay).toEqual(
      gardenOutingDecay({ outingBonds, decay: { entries: decayEntries } }),
    );
    expect(result.outingDecay.outingBonds.bonds).toEqual([
      { creatureId: "c-1", bonds: bondsForCreature(ledger(), "c-1") },
      { creatureId: "c-2", bonds: bondsForCreature(ledger(), "c-2") },
    ]);
    expect(result.comfort).toEqual(
      comfortEntries.map((entry) => ({
        id: entry.id,
        result: comfortAfterDay(entry.day),
      })),
    );
    // Hand-checked: decay 50 - 2*3 = 44; comfort cf-1: +10 -5 -7 = -2, 50 -> 48;
    // cf-2: all needs met +10 +4 +8 = +22, 40 -> 62.
    expect(result.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(result.comfort[0].result.comfort).toEqual(48);
    expect(result.comfort[0].result.delta).toEqual(-2);
    expect(result.comfort[1].result.comfort).toEqual(62);
    expect(result.comfort[1].result.delta).toEqual(22);
  });

  it("comfort-only bundle: comfort days need no outing content", () => {
    const entries = [comfortEntry("cf-1", 50, [habitat("sun-patch")])];
    const result = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: { entries },
    });
    expect(result.comfort[0].result.comfort).toEqual(48);
    expect(result.outingDecay).toEqual(gardenOutingDecay(outingDecayBase()));
  });

  it("outing-decay-only bundle: an empty comfort list reports no days", () => {
    const result = gardenOutingComfort({
      outingDecay: {
        outingBonds: {
          outing: outingBase(),
          bonds: { ledger: ledger(), creatureIds: ["c-1"] },
        },
        decay: {
          entries: [decayEntry("d-1", 50, [facts("absence", "party", 3)])],
        },
      },
      comfort: { entries: [] },
    });
    expect(result.comfort).toEqual([]);
    expect(result.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(result.outingDecay.outingBonds.bonds[0].bonds).toEqual(
      bondsForCreature(ledger(), "c-1"),
    );
  });

  it("caller order wins: comfort days follow entries order, not comfort order", () => {
    const entries = [
      comfortEntry("cf-b", 10, []),
      comfortEntry("cf-a", 90, []),
    ];
    const result = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: { entries },
    });
    expect(result.comfort.map((entry) => entry.id)).toEqual(["cf-b", "cf-a"]);
    expect(result.comfort.map((entry) => entry.result.comfort)).toEqual([
      0, 72,
    ]);
    // cf-b: 10 - (6+5+7) = -8, clamped at 0; cf-a: 90 - 18 = 72.
  });

  it("exact result shape: two sections only; a comfort result carries exactly four fields", () => {
    const entries = [comfortEntry("cf-1", 50, [habitat("sun-patch")])];
    const result = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: { entries },
    });
    expect(Object.keys(result).sort()).toEqual(["comfort", "outingDecay"]);
    expect(Object.keys(result.comfort[0]).sort()).toEqual(["id", "result"]);
    expect(Object.keys(result.comfort[0].result).sort()).toEqual([
      "comfort",
      "delta",
      "satisfied",
      "unsatisfied",
    ]);
    expect("comfort" in result.outingDecay).toEqual(false);
    expect(result.comfort[0].result.satisfied).toEqual(["sunlight"]);
    expect(result.comfort[0].result.unsatisfied).toEqual(["shade", "water"]);
  });

  it("side-by-side-not-merged: bond, effective, and comfort numbers stay distinct", () => {
    // Ledger c-1/k-a is 20; decay starts from 50 and reads 44;
    // comfort starts from 50 over sun-patch only and reads 48.
    // None overwrites another, and no section feeds another.
    const result = gardenOutingComfort({
      outingDecay: {
        outingBonds: {
          outing: outingBase(),
          bonds: { ledger: ledger(), creatureIds: ["c-1"] },
        },
        decay: {
          entries: [decayEntry("d-1", 50, [facts("absence", "party", 3)])],
        },
      },
      comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
    });
    expect(result.outingDecay.outingBonds.bonds[0].bonds[0].value).toEqual(20);
    expect(result.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(result.comfort[0].result.comfort).toEqual(48);
    // Comfort does not read the bond: the same comfort input with an
    // empty ledger still reads 48.
    const alone = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
    });
    expect(alone.comfort[0].result.comfort).toEqual(48);
  });

  it("comfort clamps only at 0 and 100, inherited from garden-comfort", () => {
    const result = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: {
        entries: [
          comfortEntry("cf-top", 98, [
            habitat("sun-patch"),
            habitat("shade-grove"),
            habitat("pond-edge"),
          ]),
          comfortEntry("cf-bottom", 5, []),
        ],
      },
    });
    expect(result.comfort[0].result.comfort).toEqual(100);
    expect(result.comfort[1].result.comfort).toEqual(0);
  });

  it("comfort factors scale the term, inherited from garden-comfort", () => {
    const entry: ComfortEntry = {
      id: "cf-1",
      day: {
        comfort: 50,
        habitats: [habitat("sun-patch")],
        needs,
        rates,
        classesForRecipe: classesFor,
        contextFactor: 0.5,
        personalityFactor: 1,
      },
    };
    const result = gardenOutingComfort({
      outingDecay: outingDecayBase(),
      comfort: { entries: [entry] },
    });
    expect(result.comfort[0].result.delta).toEqual(-1);
    expect(result.comfort[0].result.comfort).toEqual(49);
  });

  it("loud failures: malformed bundle and missing sections", () => {
    expect(() => gardenOutingComfort(null as never)).toThrow();
    expect(() => gardenOutingComfort({} as never)).toThrow();
    expect(() =>
      gardenOutingComfort({ outingDecay: outingDecayBase() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingComfort({ comfort: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: { entries: null as never },
      }),
    ).toThrow();
  });

  it("loud failures: bad or duplicate comfort entry ids", () => {
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: { entries: [comfortEntry("", 50, [])] },
      }),
    ).toThrow(/comfort entry id/);
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: {
          entries: [
            comfortEntry("cf-1", 50, []),
            comfortEntry("cf-1", 60, []),
          ],
        },
      }),
    ).toThrow(/duplicate comfort entry id/);
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: { entries: [null as never] },
      }),
    ).toThrow(/comfort entry must be an object/);
  });

  it("loud failures: comfort failures propagate", () => {
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: { entries: [comfortEntry("cf-1", 101, [])] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingComfort({
        outingDecay: outingDecayBase(),
        comfort: {
          entries: [
            {
              id: "cf-1",
              day: {
                comfort: 50,
                habitats: [],
                needs,
                rates: {},
                classesForRecipe: classesFor,
              },
            } as never,
          ],
        },
      }),
    ).toThrow();
  });

  it("loud failures: outing-decay failures propagate", () => {
    expect(() =>
      gardenOutingComfort({
        outingDecay: {
          outingBonds: {
            outing: outingBase(),
            bonds: { ledger: ledger(), creatureIds: ["c-1", "c-1"] },
          },
          decay: { entries: [] },
        },
        comfort: { entries: [] },
      }),
    ).toThrow(/duplicate creature id/);
    expect(() =>
      gardenOutingComfort({
        outingDecay: {
          outingBonds: outingBondsBase(),
          decay: {
            entries: [
              decayEntry("d-1", 10, []),
              decayEntry("d-1", 20, []),
            ],
          },
        },
        comfort: { entries: [] },
      }),
    ).toThrow(/duplicate decay entry id/);
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs: GardenOutingComfortInputs = {
      outingDecay: {
        outingBonds: {
          outing: outingBase(),
          bonds: { ledger: ledger(), creatureIds: ["c-1"] },
        },
        decay: {
          entries: [decayEntry("d-1", 50, [facts("absence", "party", 3)])],
        },
      },
      comfort: { entries: [comfortEntry("cf-1", 50, [habitat("sun-patch")])] },
    };
    const first = gardenOutingComfort(inputs);
    first.comfort[0].result.satisfied.push("invented");
    first.comfort[0].result.comfort = 999;
    first.outingDecay.decay[0].breakdown.contributions[0].amount = 999;
    first.outingDecay.outingBonds.bonds[0].bonds[0].value = 999;
    const second = gardenOutingComfort(inputs);
    expect(second.comfort[0].result.satisfied).toEqual(["sunlight"]);
    expect(second.comfort[0].result.comfort).toEqual(48);
    expect(second.outingDecay.decay[0].breakdown.contributions[0].amount).toEqual(6);
    expect(second.outingDecay.decay[0].breakdown.effective).toEqual(44);
    expect(second.outingDecay.outingBonds.bonds[0].bonds[0].value).toEqual(20);
    expect(inputs.comfort.entries[0].day.comfort).toEqual(50);
    expect(inputs.outingDecay.outingBonds.bonds.ledger).toEqual(ledger());
  });

  it("caller-vocabulary ids: opaque ids pass through untouched", () => {
    const result = gardenOutingComfort({
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
    });
    expect(result.comfort[0].id).toEqual("cf-qq");
    expect(result.outingDecay.decay[0].id).toEqual("crt-qq");
    expect(result.outingDecay.outingBonds.bonds[0].bonds).toEqual([
      { creatureId: "crt-qq", keeperId: "kp-zz", value: 7 },
    ]);
  });

  it("staging locks: no host or composed module imports the outing-comfort bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-comfort");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-comfort.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
