import { describe, expect, it } from "vitest";
import {
  gardenOutingInbound,
  type GardenOutingInboundInputs,
  type InboundEntry,
} from "./garden-outing-inbound";
import {
  gardenOutingNews,
  type GardenOutingNewsInputs,
  type NewsEntry,
} from "./garden-outing-news";
import {
  gardenOutingDiscovery,
  type DiscoveryEntry,
  type GardenOutingDiscoveryInputs,
} from "./garden-outing-discovery";
import { inboundFromJourney } from "./garden-inbound";
import type { MovementLog } from "./garden-movement";
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
import type { GardenOutingUnlocksInputs } from "./garden-outing-unlocks";
import type { GardenOutingIndividualInputs } from "./garden-outing-individual";
import type { GardenOutingTeachersInputs } from "./garden-outing-teachers";
import type { GardenOutingMovementInputs } from "./garden-outing-movement";
import type { GardenOutingArrivalsInputs } from "./garden-outing-arrivals";
import type { GardenOutingResearchInputs } from "./garden-outing-research";
import type { ResearchEntry } from "./garden-outing-research";

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
  return { log: [], news: { since: null }, autonomous: autonomousBase() };
}

function journeyBase(): GardenJourneyInputs {
  return {
    inbound: {
      movementLog: [],
      gardenHomes: [],
      teacherMapping: {},
      meetings: [],
    },
    snapshot: { checkIn: checkInBase(), records: [] },
  };
}

function outingBase(): GardenOutingInputs {
  return {
    journey: journeyBase(),
    research: { log: [], speciesOfCreature: {}, speciesIds: [] },
  };
}

function minimalOutingTeachers(): GardenOutingTeachersInputs {
  return {
    outingIndividual: {
      outingUnlocks: {
        outingJourney: {
          outingSnapshot: {
            outingCheckin: {
              outingRecord: {
                outingLevel: {
                  outingThanks: {
                    outingComfort: {
                      outingDecay: {
                        outingBonds: {
                          outing: outingBase(),
                          bonds: { ledger: [], creatureIds: [] },
                        } satisfies GardenOutingBondsInputs,
                        decay: { entries: [] },
                      } satisfies GardenOutingDecayInputs,
                      comfort: { entries: [] },
                    } satisfies GardenOutingComfortInputs,
                    thanks: { windows: [] },
                  } satisfies GardenOutingThanksInputs,
                  levels: { entries: [] },
                } satisfies GardenOutingLevelInputs,
                records: { entries: [] },
              } satisfies GardenOutingRecordInputs,
              checkins: { entries: [] },
            } satisfies GardenOutingCheckinInputs,
            snapshots: { entries: [] },
          },
          journeys: { entries: [] },
        } satisfies GardenOutingJourneyInputs,
        unlocks: { entries: [] },
      } satisfies GardenOutingUnlocksInputs,
      individuals: { entries: [] },
    } satisfies GardenOutingIndividualInputs,
    teachers: { entries: [] },
  };
}

function minimalOutingMovement(): GardenOutingMovementInputs {
  return { outingTeachers: minimalOutingTeachers(), movement: { entries: [] } };
}

function minimalOutingArrivals(): GardenOutingArrivalsInputs {
  return { outingMovement: minimalOutingMovement(), arrivals: { entries: [] } };
}

function minimalOutingResearch(): GardenOutingResearchInputs {
  return { outingArrivals: minimalOutingArrivals(), research: { entries: [] } };
}

function researchBase(): ResearchEntry {
  return {
    id: "r-9",
    speciesId: "s-alpha",
    log: [{ id: "o-b", creatureId: "c1", kind: "kind-a", at: 7 }],
    speciesOfCreature: { c1: "s-alpha" },
    requirements: [{ field: "bio-growth", requiredKind: "kind-a" }],
  };
}

function discoveryLogFull(): MovementLog {
  return [
    { id: "dv-1", creatureId: "c-edge", verb: "release", from: null, to: "edge-a", at: 10 },
    { id: "dv-2", creatureId: "c-other", verb: "release", from: null, to: "far-place", at: 11 },
    { id: "dv-3", creatureId: "c-edge2", verb: "release", from: null, to: "edge-b", at: 5 },
    { id: "dv-4", creatureId: "c-gone", verb: "release", from: null, to: "edge-a", at: 2 },
    { id: "dv-5", creatureId: "c-gone", verb: "garden-arrival", from: "edge-a", to: "garden-home", at: 20 },
  ];
}

function discoveryFull(): DiscoveryEntry {
  return { id: "d-1", log: discoveryLogFull(), gardenEdge: ["edge-a", "edge-b"] };
}

function minimalOutingDiscovery(): GardenOutingDiscoveryInputs {
  return { outingResearch: minimalOutingResearch(), discovery: { entries: [] } };
}

function fullOutingDiscovery(): GardenOutingDiscoveryInputs {
  return {
    outingResearch: {
      outingArrivals: minimalOutingArrivals(),
      research: { entries: [researchBase()] },
    },
    discovery: { entries: [discoveryFull()] },
  };
}

function newsLogFull(): MovementLog {
  return [
    { id: "nw-2", creatureId: "c-9", verb: "transfer", from: "garden-home", to: "home-b", at: 7 },
    { id: "nw-1", creatureId: "c-9", verb: "garden-departure", from: "garden-home", to: "wild-x", at: 3 },
    { id: "nw-3", creatureId: "c-9", verb: "garden-arrival", from: "home-b", to: "garden-home", at: 5 },
    { id: "nw-4", creatureId: "c-9", verb: "release", from: "garden-home", to: "edge-place", at: 10 },
    { id: "nw-5", creatureId: "c-other", verb: "garden-arrival", from: null, to: "far-home", at: 6 },
  ];
}

function newsFull(): NewsEntry {
  return {
    id: "n-1",
    log: newsLogFull(),
    since: null,
    gardenHomes: ["garden-home"],
    gardenEdge: ["edge-place"],
  };
}

function minimalOutingNews(): GardenOutingNewsInputs {
  return { outingDiscovery: minimalOutingDiscovery(), news: { entries: [] } };
}

function fullOutingNews(): GardenOutingNewsInputs {
  return {
    outingDiscovery: fullOutingDiscovery(),
    news: { entries: [newsFull()] },
  };
}

function inboundFull(): InboundEntry {
  return {
    id: "i-1",
    movementLog: [
      { id: "ib-1", creatureId: "c-1", verb: "garden-arrival", from: null, to: "home-a", at: 5 },
      { id: "ib-2", creatureId: "c-1", verb: "garden-departure", from: "home-a", to: null, at: 8 },
    ],
    gardenHomes: ["home-a"],
    teacherMapping: { "sp-a": ["ax-1"] },
    meetings: [{ speciesId: "sp-a", at: 2 }],
  };
}

function inboundBase(): InboundEntry {
  return {
    id: "i-9",
    movementLog: [
      { id: "ib-b", creatureId: "c-2", verb: "garden-arrival", from: null, to: "home-b", at: 4 },
    ],
    gardenHomes: ["home-b"],
    teacherMapping: { "sp-b": ["ax-2", "ax-3"] },
    meetings: [{ speciesId: "sp-b", at: 1 }],
  };
}

function fullInputs(): GardenOutingInboundInputs {
  return {
    outingNews: fullOutingNews(),
    inbound: { entries: [inboundFull(), inboundBase()] },
  };
}

describe("garden-outing-inbound (B3 outing + news + journey inbound)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingInboundInputs = {
      outingNews: minimalOutingNews(),
      inbound: { entries: [] },
    };
    const result = gardenOutingInbound(inputs);
    expect(result).toEqual({
      outingNews: gardenOutingNews(inputs.outingNews),
      inbound: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullInputs();
    const result = gardenOutingInbound(inputs);
    expect(result.outingNews).toEqual(gardenOutingNews(inputs.outingNews));
    expect(result.inbound[0]).toEqual({
      id: "i-1",
      ...inboundFromJourney({
        movementLog: inboundFull().movementLog,
        gardenHomes: inboundFull().gardenHomes,
        teacherMapping: inboundFull().teacherMapping,
        meetings: inboundFull().meetings,
      }),
    });
    // Hand-checked inbound: arrival c-1 at 5, departed at 8 so
    // not currently resident; teacher sp-a met at 2, ax-1.
    expect(result.inbound[0].arrivals).toEqual([
      {
        creatureId: "c-1",
        firstArrivedAt: 5,
        lastArrivedAt: 5,
        arrivalCount: 1,
        lastArrivalRecordId: "ib-1",
        lastArrivalTo: "home-a",
        currentlyResident: false,
      },
    ]);
    expect(result.inbound[0].teachers).toEqual([
      { speciesId: "sp-a", firstMetAt: 2, axes: ["ax-1"] },
    ]);
    expect(result.inbound[0].taughtAxes).toEqual(["ax-1"]);
    expect(result.inbound[1].arrivals[0].creatureId).toBe("c-2");
    expect(result.inbound[1].taughtAxes).toEqual(["ax-2", "ax-3"]);
    // Inherited sections still report their own numbers.
    expect(result.outingNews.news[0].items).toEqual([
      { creatureId: "c-9", kind: "departure", movementId: "nw-1", at: 3, from: "garden-home", to: "wild-x" },
      { creatureId: "c-9", kind: "arrival", movementId: "nw-3", at: 5, from: "home-b", to: "garden-home" },
      { creatureId: "c-9", kind: "edge-sighting", movementId: "nw-4", at: 10, from: "garden-home", to: "edge-place" },
    ]);
    expect(result.outingNews.outingDiscovery.discovery[0].discoveries).toEqual([
      { creatureId: "c-edge2", releaseRecordId: "dv-3", releasedAt: 5, releasedTo: "edge-b" },
      { creatureId: "c-edge", releaseRecordId: "dv-1", releasedAt: 10, releasedTo: "edge-a" },
    ]);
  });

  it("outing-news-only bundle", () => {
    const result = gardenOutingInbound({
      outingNews: fullOutingNews(),
      inbound: { entries: [] },
    });
    expect(result.inbound).toEqual([]);
    expect(result.outingNews.news[0].items.map((i) => i.kind)).toEqual([
      "departure",
      "arrival",
      "edge-sighting",
    ]);
  });

  it("inbound-with-minimal-outing-news bundle", () => {
    const result = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: { entries: [inboundFull()] },
    });
    expect(result.outingNews.news).toEqual([]);
    expect(result.outingNews.outingDiscovery.discovery).toEqual([]);
    expect(result.inbound[0].arrivals[0].creatureId).toBe("c-1");
    expect(result.inbound[0].taughtAxes).toEqual(["ax-1"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: { entries: [inboundBase(), inboundFull()] },
    });
    expect(result.inbound.map((entry) => entry.id)).toEqual(["i-9", "i-1"]);
  });

  it("an entry with an empty log and no meetings, and an entry with no arrivals and no teachers, read empty, never fabricated", () => {
    const result = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: {
        entries: [
          { id: "i-empty", movementLog: [], gardenHomes: ["home-a"], teacherMapping: {}, meetings: [] },
          {
            id: "i-none",
            movementLog: [
              { id: "ib-x", creatureId: "c-1", verb: "gift", from: null, to: "home-a", at: 1 },
              { id: "ib-y", creatureId: "c-2", verb: "release", from: null, to: "edge-x", at: 2 },
            ],
            gardenHomes: ["home-a"],
            teacherMapping: { "sp-a": ["ax-1"] },
            meetings: [{ speciesId: "sp-none", at: 1 }],
          },
        ],
      },
    });
    expect(result.inbound[0]).toEqual({ id: "i-empty", arrivals: [], teachers: [], taughtAxes: [] });
    expect(result.inbound[1]).toEqual({ id: "i-none", arrivals: [], teachers: [], taughtAxes: [] });
  });

  it("exact result shape: two sections only, readings exactly id + arrivals + teachers + taughtAxes, exact arrival and teacher shapes", () => {
    const result = gardenOutingInbound(fullInputs());
    expect(Object.keys(result).sort()).toEqual(["inbound", "outingNews"]);
    expect(Object.keys(result.inbound[0]).sort()).toEqual([
      "arrivals",
      "id",
      "taughtAxes",
      "teachers",
    ]);
    expect(Object.keys(result.inbound[0].arrivals[0]).sort()).toEqual([
      "arrivalCount",
      "creatureId",
      "currentlyResident",
      "firstArrivedAt",
      "lastArrivalRecordId",
      "lastArrivalTo",
      "lastArrivedAt",
    ]);
    expect(Object.keys(result.inbound[0].teachers[0]).sort()).toEqual([
      "axes",
      "firstMetAt",
      "speciesId",
    ]);
    expect("inbound" in result.outingNews).toBe(false);
  });

  it("side-by-side-not-merged: same inbound input reads identically under a minimal and a full outing-news section", () => {
    const minimal = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: { entries: [inboundFull()] },
    });
    const full = gardenOutingInbound({
      outingNews: fullOutingNews(),
      inbound: { entries: [inboundFull()] },
    });
    expect(full.inbound).toEqual(minimal.inbound);
    // A creature in the inbound log but absent from the outing
    // bonds still reports in inbound: c-1, while the minimal
    // outing bonds name no creature at all.
    expect(minimal.inbound[0].arrivals.map((a) => a.creatureId)).toContain("c-1");
    expect(minimal.outingNews.outingDiscovery.outingResearch.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals).toEqual([]);
  });

  it("Set/Map forms read identically to array/record forms", () => {
    const arrayForm = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: { entries: [inboundFull()] },
    });
    const setForm = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: {
        entries: [{
          ...inboundFull(),
          id: "i-set",
          gardenHomes: new Set(["home-a"]),
          teacherMapping: new Map([["sp-a", ["ax-1"]]]),
        }],
      },
    });
    expect(setForm.inbound[0].arrivals).toEqual(arrayForm.inbound[0].arrivals);
    expect(setForm.inbound[0].teachers).toEqual(arrayForm.inbound[0].teachers);
    expect(setForm.inbound[0].taughtAxes).toEqual(arrayForm.inbound[0].taughtAxes);
  });

  it("loud failures", () => {
    const base = (): GardenOutingInboundInputs => ({
      outingNews: minimalOutingNews(),
      inbound: { entries: [inboundBase()] },
    });
    expect(() => gardenOutingInbound(null as never)).toThrow();
    expect(() => gardenOutingInbound({ ...base(), outingNews: null as never })).toThrow();
    expect(() => gardenOutingInbound({ ...base(), inbound: null as never })).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: null as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [null as never] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [{ ...inboundBase(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [inboundBase(), inboundBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [{ ...inboundBase(), movementLog: null as never }] },
      }),
    ).toThrow();
    // Inbound failure propagation: a duplicate movement id
    // fails through the composed read.
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: {
          entries: [{
            ...inboundBase(),
            movementLog: [
              { id: "ib-dup", creatureId: "c-1", verb: "garden-arrival", from: null, to: "home-b", at: 1 },
              { id: "ib-dup", creatureId: "c-2", verb: "garden-arrival", from: null, to: "home-b", at: 2 },
            ],
          }],
        },
      }),
    ).toThrow();
    // Bad mapping and bad meeting propagate from the read.
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [{ ...inboundBase(), teacherMapping: { "sp-b": ["ax-2", "ax-2"] } }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingInbound({
        outingNews: minimalOutingNews(),
        inbound: { entries: [{ ...inboundBase(), meetings: [{ speciesId: "sp-b", at: Number.NaN }] }] },
      }),
    ).toThrow();
    // Outing-news failure propagation: a duplicate news entry
    // id fails through the composed read.
    expect(() =>
      gardenOutingInbound({
        outingNews: {
          outingDiscovery: minimalOutingDiscovery(),
          news: { entries: [newsFull(), newsFull()] },
        },
        inbound: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = fullInputs();
    const logOrder = inputs.inbound.entries[0].movementLog.map((r) => r.id);
    const first = gardenOutingInbound(inputs);
    first.inbound[0].arrivals[0].creatureId = "mutated";
    first.inbound[0].teachers[0].axes.push("mutated");
    first.inbound[0].taughtAxes.push("mutated");
    first.inbound.push({ id: "i-invented", arrivals: [], teachers: [], taughtAxes: [] });
    first.outingNews.news[0].items[0].to = "nowhere";
    const second = gardenOutingInbound(inputs);
    expect(second.inbound[0].arrivals[0].creatureId).toBe("c-1");
    expect(second.inbound[0].teachers[0].axes).toEqual(["ax-1"]);
    expect(second.inbound[0].taughtAxes).toEqual(["ax-1"]);
    expect(second.inbound.map((entry) => entry.id)).toEqual(["i-1", "i-9"]);
    expect(second.outingNews.news[0].items[0].to).toBe("wild-x");
    expect(inputs.inbound.entries[0].movementLog.map((r) => r.id)).toEqual(logOrder);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingInbound({
      outingNews: minimalOutingNews(),
      inbound: {
        entries: [{
          id: "zz-odd",
          movementLog: [
            { id: "ib-odd", creatureId: "cr-odd", verb: "garden-arrival", from: null, to: "home-?!", at: 3 },
          ],
          gardenHomes: ["home-?!"],
          teacherMapping: { "tok-sp": ["tok-axis"] },
          meetings: [{ speciesId: "tok-sp", at: 1 }],
        }],
      },
    });
    expect(result.inbound[0].arrivals).toEqual([
      {
        creatureId: "cr-odd",
        firstArrivedAt: 3,
        lastArrivedAt: 3,
        arrivalCount: 1,
        lastArrivalRecordId: "ib-odd",
        lastArrivalTo: "home-?!",
        currentlyResident: true,
      },
    ]);
    expect(result.inbound[0].teachers).toEqual([
      { speciesId: "tok-sp", firstMetAt: 1, axes: ["tok-axis"] },
    ]);
    expect(result.inbound[0].taughtAxes).toEqual(["tok-axis"]);
  });

  it("staging locks: no host or composed module imports the outing-inbound bundle yet", async () => {
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
      "./garden-news.ts",
      "./garden-inbound.ts",
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
      "./garden-outing-research.ts",
      "./garden-outing-discovery.ts",
      "./garden-outing-news.ts",
      "./garden-bonds.ts",
      "./garden-decay.ts",
      "./garden-comfort.ts",
      "./garden-thanks.ts",
      "./garden-level.ts",
      "./garden-record.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-inbound");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-inbound.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
