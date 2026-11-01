import { describe, expect, it } from "vitest";
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
import { checkInNews } from "./garden-news";
import { edgeDiscoveries } from "./garden-discovery";
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
import type { JourneyInboundInputs } from "./garden-inbound";

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
    } satisfies JourneyInboundInputs,
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

function newsSinceForm(): NewsEntry {
  return {
    id: "n-2",
    log: newsLogFull(),
    since: 6,
    gardenHomes: new Set(["garden-home"]),
    gardenEdge: new Set(["edge-place"]),
  };
}

function newsBase(): NewsEntry {
  return {
    id: "n-9",
    log: [{ id: "nw-b", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 7 }],
    since: null,
    gardenHomes: ["garden-home"],
  };
}

function fullInputs(): GardenOutingNewsInputs {
  return {
    outingDiscovery: fullOutingDiscovery(),
    news: { entries: [newsFull(), newsSinceForm()] },
  };
}

describe("garden-outing-news (B3 outing + discovery + Garden news)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingNewsInputs = {
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [] },
    };
    const result = gardenOutingNews(inputs);
    expect(result).toEqual({
      outingDiscovery: gardenOutingDiscovery(inputs.outingDiscovery),
      news: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullInputs();
    const result = gardenOutingNews(inputs);
    expect(result.outingDiscovery).toEqual(
      gardenOutingDiscovery(inputs.outingDiscovery),
    );
    expect(result.news[0].items).toEqual(
      checkInNews(newsFull().log, {
        since: newsFull().since,
        gardenHomes: newsFull().gardenHomes,
        gardenEdge: newsFull().gardenEdge,
      }),
    );
    // Hand-checked news: stamp order departure (3), arrival (5),
    // edge-sighting (10); the transfer at 7 is not news, and the
    // arrival to far-home at 6 is not a Garden-home arrival.
    expect(result.news[0].items).toEqual([
      { creatureId: "c-9", kind: "departure", movementId: "nw-1", at: 3, from: "garden-home", to: "wild-x" },
      { creatureId: "c-9", kind: "arrival", movementId: "nw-3", at: 5, from: "home-b", to: "garden-home" },
      { creatureId: "c-9", kind: "edge-sighting", movementId: "nw-4", at: 10, from: "garden-home", to: "edge-place" },
    ]);
    // Since form: only movements strictly after 6 count.
    expect(result.news[1].items).toEqual([
      { creatureId: "c-9", kind: "edge-sighting", movementId: "nw-4", at: 10, from: "garden-home", to: "edge-place" },
    ]);
    // Inherited sections still report their own numbers.
    expect(result.outingDiscovery.discovery[0].discoveries).toEqual([
      { creatureId: "c-edge2", releaseRecordId: "dv-3", releasedAt: 5, releasedTo: "edge-b" },
      { creatureId: "c-edge", releaseRecordId: "dv-1", releasedAt: 10, releasedTo: "edge-a" },
    ]);
    expect(result.outingDiscovery.outingResearch.research[0].summary.totalObservations).toBe(1);
    expect(
      result.outingDiscovery.discovery[0].discoveries,
    ).toEqual(edgeDiscoveries(discoveryFull().log, { gardenEdge: discoveryFull().gardenEdge }));
  });

  it("outing-discovery-only bundle", () => {
    const result = gardenOutingNews({
      outingDiscovery: fullOutingDiscovery(),
      news: { entries: [] },
    });
    expect(result.news).toEqual([]);
    expect(result.outingDiscovery.discovery[0].discoveries.map((d) => d.creatureId)).toEqual(["c-edge2", "c-edge"]);
  });

  it("news-with-minimal-outing-discovery bundle", () => {
    const result = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [newsFull()] },
    });
    expect(result.outingDiscovery.discovery).toEqual([]);
    expect(result.news[0].items.map((i) => i.kind)).toEqual(["departure", "arrival", "edge-sighting"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [newsSinceForm(), newsBase(), newsFull()] },
    });
    expect(result.news.map((entry) => entry.id)).toEqual(["n-2", "n-9", "n-1"]);
  });

  it("an entry with an empty log, an entry with no qualifying movements, and an entry without an edge set read empty or edge-free, never fabricated", () => {
    const result = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: {
        entries: [
          { id: "n-empty", log: [], since: null, gardenHomes: ["garden-home"], gardenEdge: ["edge-place"] },
          { id: "n-none", log: [{ id: "nw-x", creatureId: "c-1", verb: "gift", from: null, to: "edge-place", at: 1 }], since: null, gardenHomes: ["garden-home"], gardenEdge: ["edge-place"] },
          { id: "n-noedge", log: newsLogFull(), since: null, gardenHomes: ["garden-home"] },
        ],
      },
    });
    expect(result.news[0].items).toEqual([]);
    expect(result.news[1].items).toEqual([]);
    // Without an edge set, releases produce no sighting: only
    // departure + arrival remain.
    expect(result.news[2].items.map((i) => i.kind)).toEqual(["departure", "arrival"]);
  });

  it("exact result shape: two sections only, readings exactly id + items, items exactly the news fields", () => {
    const result = gardenOutingNews(fullInputs());
    expect(Object.keys(result).sort()).toEqual(["news", "outingDiscovery"]);
    expect(Object.keys(result.news[0]).sort()).toEqual(["id", "items"]);
    expect(Object.keys(result.news[0].items[0]).sort()).toEqual([
      "at",
      "creatureId",
      "from",
      "kind",
      "movementId",
      "to",
    ]);
    expect("news" in result.outingDiscovery).toBe(false);
  });

  it("side-by-side-not-merged: same news input reads identically under a minimal and a full outing-discovery section", () => {
    const minimal = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [newsFull()] },
    });
    const full = gardenOutingNews({
      outingDiscovery: fullOutingDiscovery(),
      news: { entries: [newsFull()] },
    });
    expect(full.news).toEqual(minimal.news);
    // A creature in the news log but absent from the outing
    // bonds still reports in news: c-9, while the minimal
    // outing bonds name no creature at all.
    expect(minimal.news[0].items.map((i) => i.creatureId)).toContain("c-9");
    expect(minimal.outingDiscovery.outingResearch.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals).toEqual([]);
  });

  it("since boundary: a movement at the stamp itself is already seen, not news", () => {
    const result = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: {
        entries: [
          { id: "n-bound", log: newsLogFull(), since: 5, gardenHomes: ["garden-home"], gardenEdge: ["edge-place"] },
        ],
      },
    });
    // Arrival at 5 is excluded; only the edge-sighting at 10
    // remains (departure at 3 and transfer at 7 also excluded).
    expect(result.news[0].items).toEqual([
      { creatureId: "c-9", kind: "edge-sighting", movementId: "nw-4", at: 10, from: "garden-home", to: "edge-place" },
    ]);
  });

  it("Set-form homes and edge read identically to array form", () => {
    const arrayForm = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [newsFull()] },
    });
    const setForm = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [{ ...newsFull(), id: "n-set", gardenHomes: new Set(["garden-home"]), gardenEdge: new Set(["edge-place"]) }] },
    });
    expect(setForm.news[0].items).toEqual(arrayForm.news[0].items);
  });

  it("loud failures", () => {
    const base = (): GardenOutingNewsInputs => ({
      outingDiscovery: minimalOutingDiscovery(),
      news: { entries: [newsBase()] },
    });
    expect(() => gardenOutingNews(null as never)).toThrow();
    expect(() => gardenOutingNews({ ...base(), outingDiscovery: null as never })).toThrow();
    expect(() => gardenOutingNews({ ...base(), news: null as never })).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: null as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [null as never] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [{ ...newsBase(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [newsBase(), newsBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [{ ...newsBase(), log: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [{ ...newsBase(), since: Number.NaN as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [{ ...newsBase(), gardenHomes: [""] }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingNews({
        outingDiscovery: minimalOutingDiscovery(),
        news: { entries: [{ ...newsBase(), log: [{ id: "nw-bad", creatureId: "c-9", verb: "teleport", from: null, to: "garden-home", at: 1 } as never] }] },
      }),
    ).toThrow();
    // Outing-discovery failure propagation: a duplicate
    // discovery entry id fails through the composed read.
    expect(() =>
      gardenOutingNews({
        outingDiscovery: {
          outingResearch: minimalOutingResearch(),
          discovery: { entries: [discoveryFull(), discoveryFull()] },
        },
        news: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = fullInputs();
    const logOrder = inputs.news.entries[0].log.map((r) => r.id);
    const first = gardenOutingNews(inputs);
    first.news[0].items[0].to = "nowhere";
    first.news.push({ id: "n-invented", items: [] });
    first.outingDiscovery.discovery[0].discoveries[0].releasedTo = "nowhere";
    const second = gardenOutingNews(inputs);
    expect(second.news[0].items[0].to).toBe("wild-x");
    expect(second.news.map((entry) => entry.id)).toEqual(["n-1", "n-2"]);
    expect(second.outingDiscovery.discovery[0].discoveries[0].releasedTo).toBe("edge-b");
    expect(inputs.news.entries[0].log.map((r) => r.id)).toEqual(logOrder);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingNews({
      outingDiscovery: minimalOutingDiscovery(),
      news: {
        entries: [
          {
            id: "zz-odd",
            log: [{ id: "nw-odd", creatureId: "cr-odd", verb: "garden-arrival", from: null, to: "home-?!", at: 3 }],
            since: null,
            gardenHomes: ["home-?!"],
          },
        ],
      },
    });
    expect(result.news[0].items).toEqual([
      { creatureId: "cr-odd", kind: "arrival", movementId: "nw-odd", at: 3, from: null, to: "home-?!" },
    ]);
  });

  it("staging locks: no host or composed module imports the outing-news bundle yet", async () => {
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
      "./garden-bonds.ts",
      "./garden-decay.ts",
      "./garden-comfort.ts",
      "./garden-thanks.ts",
      "./garden-level.ts",
      "./garden-record.ts",
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
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-news");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-news.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
