import { describe, expect, it } from "vitest";
import { gardenOuting, type GardenOutingInputs } from "./garden-outing";
import {
  gardenJourney,
  type GardenJourneyInputs,
} from "./garden-journey";
import {
  inboundFromJourney,
  type JourneyInboundInputs,
} from "./garden-inbound";
import {
  gardenSnapshot,
  type GardenSnapshotInputs,
} from "./garden-snapshot";
import {
  bridgeRecordForCreature,
  type BridgeRecordInputs,
} from "./garden-record";
import {
  researchSummaryForSpecies,
  type ResearchObservation,
} from "./garden-research";
import type { AutonomousChangeInputs } from "./garden-autonomous";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
import type { MovementRecord } from "./garden-movement";
import type { TeacherMeeting } from "./garden-teachers";

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
    { creatureId: "c-other", keeperId: "k-a", value: 99 },
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

function base(): GardenOutingInputs {
  return { journey: journeyBase(), research: researchBase() };
}

function fullRecordInputs(): BridgeRecordInputs {
  return {
    ...recordBase(),
    movementLog: [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
      movement("m2", "c-1", "transfer", "home-a", "home-b", 9),
    ],
    bondLedger: ledger(),
    factsByKeeper: {
      "k-a": [facts("absence", "party", 3)],
      "k-b": [],
    },
    observationLog: [
      obs("o1", "c-1", "growth", 2),
      obs("o2", "c-1", "behaviour", 4),
      obs("o3", "c-1", "growth", 7),
      obs("o4", "c-other", "growth", 1),
    ],
    gardenEdge: ["edge-x"],
  };
}

function meet(speciesId: string, at: number): TeacherMeeting {
  return { speciesId, at };
}

describe("garden-outing (B3 §2.2 + §2.3 + §2.5 + §2.6 outing bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated outing", () => {
    expect(gardenOuting(base())).toEqual({
      journey: {
        inbound: { arrivals: [], teachers: [], taughtAxes: [] },
        snapshot: {
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
        },
      },
      research: [],
    });
  });

  it("full bundle: journey plus research, each exactly as its own read reports it", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: {
          movementLog: [
            movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          ],
          gardenHomes: ["home-a", "home-b"],
          teacherMapping: { "sp-a": ["ax-1"] },
          meetings: [meet("sp-a", 2)],
        },
        snapshot: {
          checkIn: {
            log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
            news: { since: null },
            autonomous: autonomousBase(),
          },
          records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
        },
      },
      research: {
        log: [
          obs("r1", "c-1", "growth", 2),
          obs("r2", "c-1", "behaviour", 4),
          obs("r3", "c-2", "growth", 3),
          obs("r4", "c-9", "growth", 1),
        ],
        speciesOfCreature: { "c-1": "sp-a", "c-2": "sp-b" },
        speciesIds: ["sp-b", "sp-a"],
      },
    };
    const outing = gardenOuting(inputs);
    expect(outing.journey).toEqual(gardenJourney(inputs.journey));
    expect(outing.journey.inbound).toEqual(
      inboundFromJourney(inputs.journey.inbound),
    );
    expect(outing.journey.snapshot).toEqual(
      gardenSnapshot(inputs.journey.snapshot),
    );
    expect(outing.journey.snapshot.records[0]).toEqual(
      bridgeRecordForCreature("c-1", fullRecordInputs()),
    );
    // Caller order, not sorted and not log order.
    expect(outing.research.map((s) => s.speciesId)).toEqual([
      "sp-b",
      "sp-a",
    ]);
    expect(outing.research[0]).toEqual(
      researchSummaryForSpecies(
        inputs.research.log,
        "sp-b",
        inputs.research.speciesOfCreature,
      ),
    );
    expect(outing.research[1]).toEqual(
      researchSummaryForSpecies(
        inputs.research.log,
        "sp-a",
        inputs.research.speciesOfCreature,
      ),
    );
    expect(outing.research[1]).toEqual({
      speciesId: "sp-a",
      totalObservations: 2,
      observedKinds: ["growth", "behaviour"],
      kinds: [
        { kind: "growth", count: 1, firstAt: 2, lastAt: 2 },
        { kind: "behaviour", count: 1, firstAt: 4, lastAt: 4 },
      ],
    });
    // The unmapped creature counts nowhere in a species summary.
    expect(outing.research[0].totalObservations).toBe(1);
  });

  it("journey-only outing: research stays empty", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: {
          movementLog: [
            movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          ],
          gardenHomes: ["home-a"],
          teacherMapping: { "sp-a": ["ax-1", "ax-2"] },
          meetings: [meet("sp-a", 1)],
        },
        snapshot: snapshotBase(),
      },
      research: researchBase(),
    };
    const outing = gardenOuting(inputs);
    expect(outing.journey.inbound.arrivals).toHaveLength(1);
    expect(outing.journey.inbound.taughtAxes).toEqual(["ax-1", "ax-2"]);
    expect(outing.research).toEqual([]);
  });

  it("research-only outing: journey sections stay empty", () => {
    const inputs: GardenOutingInputs = {
      journey: journeyBase(),
      research: {
        log: [obs("r1", "c-1", "growth", 2)],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a"],
      },
    };
    const outing = gardenOuting(inputs);
    expect(outing.journey.inbound).toEqual({
      arrivals: [],
      teachers: [],
      taughtAxes: [],
    });
    expect(outing.journey.snapshot.records).toEqual([]);
    expect(outing.research).toEqual([
      {
        speciesId: "sp-a",
        totalObservations: 1,
        observedKinds: ["growth"],
        kinds: [{ kind: "growth", count: 1, firstAt: 2, lastAt: 2 }],
      },
    ]);
  });

  it("species with no observations reads an empty kind list, never a default kind", () => {
    const inputs: GardenOutingInputs = {
      journey: journeyBase(),
      research: {
        log: [obs("r1", "c-1", "growth", 2)],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a", "sp-empty"],
      },
    };
    const outing = gardenOuting(inputs);
    expect(outing.research[1]).toEqual({
      speciesId: "sp-empty",
      totalObservations: 0,
      observedKinds: [],
      kinds: [],
    });
  });

  it("exact result shape: two sections only, no merged residents, no level or score", () => {
    const outing = gardenOuting(base());
    expect(Object.keys(outing).sort()).toEqual(["journey", "research"]);
    expect("residents" in outing).toBe(false);
    expect(Object.keys(outing.journey).sort()).toEqual([
      "inbound",
      "snapshot",
    ]);
    const researched = gardenOuting({
      journey: journeyBase(),
      research: {
        log: [obs("r1", "c-1", "growth", 2)],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a"],
      },
    }).research[0];
    expect(Object.keys(researched).sort()).toEqual([
      "kinds",
      "observedKinds",
      "speciesId",
      "totalObservations",
    ]);
    expect("level" in researched).toBe(false);
    expect("score" in researched).toBe(false);
    expect("threshold" in researched).toBe(false);
  });

  it("side-by-side-not-reconciled: record kinds and species kinds come from different logs", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: inboundBase(),
        snapshot: {
          ...snapshotBase(),
          records: [
            {
              creatureId: "c-1",
              inputs: {
                ...recordBase(),
                observationLog: [obs("o1", "c-1", "growth", 2)],
              },
            },
          ],
        },
      },
      research: {
        log: [obs("r1", "c-1", "behaviour", 9)],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a"],
      },
    };
    const outing = gardenOuting(inputs);
    // The record's own log knows growth only.
    expect(outing.journey.snapshot.records[0].observedKinds).toEqual([
      "growth",
    ]);
    // The research log knows behaviour only — neither rewrites the other.
    expect(outing.research[0].observedKinds).toEqual(["behaviour"]);
    expect("residents" in outing).toBe(false);
  });

  it("a research observation never makes a journey record, and an arrival never makes a species summary", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: {
          movementLog: [
            movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          ],
          gardenHomes: ["home-a"],
          teacherMapping: {},
          meetings: [],
        },
        snapshot: snapshotBase(),
      },
      research: {
        log: [obs("r1", "c-9", "growth", 2)],
        speciesOfCreature: { "c-9": "sp-z" },
        speciesIds: ["sp-z"],
      },
    };
    const outing = gardenOuting(inputs);
    expect(outing.journey.snapshot.records).toEqual([]);
    expect(outing.journey.inbound.arrivals.map((a) => a.creatureId)).toEqual(
      ["c-1"],
    );
    expect(outing.research[0].speciesId).toBe("sp-z");
    expect(outing.research[0].totalObservations).toBe(1);
  });

  it("loud failures: malformed outing bundle", () => {
    expect(() => gardenOuting(null as never)).toThrow();
    expect(() => gardenOuting("x" as never)).toThrow();
    expect(() => gardenOuting({ research: researchBase() } as never)).toThrow(
      /journey/,
    );
    expect(() => gardenOuting({ journey: journeyBase() } as never)).toThrow(
      /research/,
    );
    expect(() =>
      gardenOuting({ journey: null as never, research: researchBase() }),
    ).toThrow(/journey/);
    expect(() =>
      gardenOuting({ journey: journeyBase(), research: null as never }),
    ).toThrow(/research/);
  });

  it("loud failures: duplicate species id, bad speciesIds shape, bad species id", () => {
    expect(() =>
      gardenOuting({
        journey: journeyBase(),
        research: {
          log: [],
          speciesOfCreature: {},
          speciesIds: ["sp-a", "sp-a"],
        },
      }),
    ).toThrow(/duplicate species id/);
    expect(() =>
      gardenOuting({
        journey: journeyBase(),
        research: {
          log: [],
          speciesOfCreature: {},
          speciesIds: "sp-a" as never,
        },
      }),
    ).toThrow(/speciesIds must be an array/);
    expect(() =>
      gardenOuting({
        journey: journeyBase(),
        research: {
          log: [],
          speciesOfCreature: {},
          speciesIds: [""],
        },
      }),
    ).toThrow(/speciesId must be a non-empty string/);
  });

  it("loud failures propagate from the journey bundle", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: inboundBase(),
        snapshot: {
          ...snapshotBase(),
          records: [
            { creatureId: "c-1", inputs: recordBase() },
            { creatureId: "c-1", inputs: recordBase() },
          ],
        },
      },
      research: researchBase(),
    };
    expect(() => gardenOuting(inputs)).toThrow(/duplicate record entry/);
  });

  it("loud failures propagate from the research section", () => {
    const inputs: GardenOutingInputs = {
      journey: journeyBase(),
      research: {
        log: [obs("r1", "c-1", "growth", 2), { id: "r1" } as never],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a"],
      },
    };
    expect(() => gardenOuting(inputs)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: {
          movementLog: [
            movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
          ],
          gardenHomes: ["home-a", "home-b"],
          teacherMapping: { "sp-a": ["ax-1"] },
          meetings: [meet("sp-a", 2)],
        },
        snapshot: {
          checkIn: {
            log: [movement("m1", "c-1", "garden-arrival", null, "home-a", 5)],
            news: { since: null },
            autonomous: autonomousBase(),
          },
          records: [{ creatureId: "c-1", inputs: fullRecordInputs() }],
        },
      },
      research: {
        log: [
          obs("r1", "c-1", "growth", 2),
          obs("r2", "c-1", "behaviour", 4),
        ],
        speciesOfCreature: { "c-1": "sp-a" },
        speciesIds: ["sp-a"],
      },
    };
    const before = JSON.stringify(inputs);
    const first = gardenOuting(inputs);
    const second = gardenOuting(inputs);
    expect(JSON.stringify(inputs)).toBe(before);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.journey).not.toBe(second.journey);
    expect(first.journey.snapshot.records[0]).not.toBe(
      second.journey.snapshot.records[0],
    );
    expect(first.research).not.toBe(second.research);
    expect(first.research[0]).not.toBe(second.research[0]);
    expect(first.research[0].kinds).not.toBe(second.research[0].kinds);
    // Mutating one result never touches the next call's result.
    first.journey.inbound.taughtAxes.push("ax-z");
    first.research[0].observedKinds.push("kind-z");
    const third = gardenOuting(inputs);
    expect(third.journey.inbound.taughtAxes).toEqual(["ax-1"]);
    expect(third.research[0].observedKinds).toEqual([
      "growth",
      "behaviour",
    ]);
  });

  it("caller-vocabulary ids flow through unchanged", () => {
    const inputs: GardenOutingInputs = {
      journey: {
        inbound: {
          movementLog: [
            movement(
              "tok-m",
              "tok-creature",
              "garden-arrival",
              null,
              "tok-home",
              3,
            ),
          ],
          gardenHomes: ["tok-home"],
          teacherMapping: { "tok-species": ["tok-axis"] },
          meetings: [meet("tok-species", 1)],
        },
        snapshot: {
          checkIn: {
            log: [
              movement(
                "tok-m",
                "tok-creature",
                "garden-arrival",
                null,
                "tok-home",
                3,
              ),
            ],
            news: { since: null },
            autonomous: {
              ...autonomousBase(),
              residents: ["tok-creature"],
              storyBeats: [
                { id: "tok-beat", arrivals: [], departures: [] },
              ],
              storyThroughBeatId: "tok-beat",
              arcs: [{ residentId: "tok-creature", arc: "tok-arc" }],
              arcBeats: [{ id: "tok-arc-beat", changes: [] }],
              arcThroughBeatId: "tok-arc-beat",
            },
          },
          records: [
            {
              creatureId: "tok-creature",
              inputs: {
                ...recordBase(),
                gardenHomes: ["tok-home"],
                movementLog: [
                  movement(
                    "tok-m",
                    "tok-creature",
                    "garden-arrival",
                    null,
                    "tok-home",
                    3,
                  ),
                ],
                observationLog: [
                  obs("tok-o", "tok-creature", "tok-kind", 4),
                ],
              },
            },
          ],
        },
      },
      research: {
        log: [obs("tok-r", "tok-creature", "tok-kind", 5)],
        speciesOfCreature: { "tok-creature": "tok-species" },
        speciesIds: ["tok-species"],
      },
    };
    const outing = gardenOuting(inputs);
    expect(outing.journey.inbound.arrivals[0].creatureId).toBe(
      "tok-creature",
    );
    expect(outing.journey.inbound.teachers[0].speciesId).toBe("tok-species");
    expect(outing.research[0].speciesId).toBe("tok-species");
    expect(outing.research[0].observedKinds).toEqual(["tok-kind"]);
  });

  it("staging locks: no host or composed module imports the outing bundle yet", async () => {
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
      "./garden-record.ts",
      "./garden-inbound.ts",
      "./garden-news.ts",
      "./garden-autonomous.ts",
      "./garden-checkin.ts",
      "./garden-snapshot.ts",
      "./garden-journey.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
