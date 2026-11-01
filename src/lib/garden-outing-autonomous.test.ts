import { describe, expect, it } from "vitest";
import {
  gardenOutingAutonomous,
  type AutonomousEntry,
  type GardenOutingAutonomousInputs,
} from "./garden-outing-autonomous";
import { autonomousChange } from "./garden-autonomous";
import type { MigrationRule } from "./garden-migration";
import type { StoryBeat } from "./garden-story";
import type { ArcBeat } from "./garden-arcs";
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

function minimalOutingInbound(): GardenOutingInboundInputs {
  return { outingNews: minimalOutingNews(), inbound: { entries: [] } };
}

function fullOutingInbound(): GardenOutingInboundInputs {
  return fullInputs();
}

function autoEntryBase(): AutonomousEntry {
  return {
    id: "au-9",
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

function autoEntryFull(): AutonomousEntry {
  return {
    id: "au-1",
    residents: ["c-1", "c-2"],
    worldState: "key-a",
    migrationRules: [
      { id: "r1", worldStates: ["key-a"], arrivals: ["c-3"], departures: ["c-2"] } as MigrationRule,
    ],
    storyBeats: [{ id: "b1", arrivals: ["c-4"], departures: ["c-1"] } as StoryBeat],
    storyThroughBeatId: "b1",
    arcs: [{ residentId: "c-1", arc: "arc-a" }],
    arcBeats: [
      { id: "a1", changes: [{ residentId: "c-1", arc: "arc-b" }, { residentId: "c-3", arc: "arc-c" }] } as ArcBeat,
    ],
    arcThroughBeatId: "a1",
  };
}

function fullAutonomousInputs(): GardenOutingAutonomousInputs {
  return {
    outingInbound: fullOutingInbound(),
    autonomous: { entries: [autoEntryFull(), autoEntryBase()] },
  };
}

describe("garden-outing-autonomous (B3 outing + inbound + autonomous)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingAutonomousInputs = {
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [] },
    };
    const result = gardenOutingAutonomous(inputs);
    expect(result).toEqual({
      outingInbound: gardenOutingInbound(inputs.outingInbound),
      autonomous: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullAutonomousInputs();
    const result = gardenOutingAutonomous(inputs);
    expect(result.outingInbound).toEqual(gardenOutingInbound(inputs.outingInbound));
    expect(result.autonomous[0]).toEqual({
      id: "au-1",
      ...autonomousChange({
        residents: autoEntryFull().residents,
        worldState: autoEntryFull().worldState,
        migrationRules: autoEntryFull().migrationRules,
        storyBeats: autoEntryFull().storyBeats,
        storyThroughBeatId: autoEntryFull().storyThroughBeatId,
        arcs: autoEntryFull().arcs,
        arcBeats: autoEntryFull().arcBeats,
        arcThroughBeatId: autoEntryFull().arcThroughBeatId,
      }),
    });
    // Hand-checked autonomous: migration c-1 stays, c-3 arrives,
    // c-2 departs; story c-2 stays, c-4 arrives, c-1 departs;
    // arcs c-1 -> arc-b, c-3 -> arc-c.
    expect(result.autonomous[0].migration).toEqual({
      residents: ["c-1", "c-3"],
      arrived: ["c-3"],
      departed: ["c-2"],
      appliedRuleIds: ["r1"],
    });
    expect(result.autonomous[0].story).toEqual({
      residents: ["c-2", "c-4"],
      arrived: ["c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1"],
    });
    expect(result.autonomous[0].arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-b" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-1", "c-3"],
      appliedBeatIds: ["a1"],
    });
    expect(result.autonomous[1].migration.residents).toEqual(["c-1", "c-2"]);
    expect(result.autonomous[1].story.appliedBeatIds).toEqual(["b1"]);
    // Inherited sections still report their own numbers.
    expect(result.outingInbound.inbound[0].arrivals).toEqual([
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
    expect(result.outingInbound.inbound[0].taughtAxes).toEqual(["ax-1"]);
    expect(result.outingInbound.outingNews.news[0].items.map((i) => i.kind)).toEqual([
      "departure",
      "arrival",
      "edge-sighting",
    ]);
  });

  it("outing-inbound-only bundle", () => {
    const result = gardenOutingAutonomous({
      outingInbound: fullOutingInbound(),
      autonomous: { entries: [] },
    });
    expect(result.autonomous).toEqual([]);
    expect(result.outingInbound.inbound[0].arrivals[0].creatureId).toBe("c-1");
  });

  it("autonomous-with-minimal-outing-inbound bundle", () => {
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [autoEntryFull()] },
    });
    expect(result.outingInbound.inbound).toEqual([]);
    expect(result.outingInbound.outingNews.news).toEqual([]);
    expect(result.autonomous[0].migration.residents).toEqual(["c-1", "c-3"]);
    expect(result.autonomous[0].arcs.changed).toEqual(["c-1", "c-3"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [autoEntryBase(), autoEntryFull()] },
    });
    expect(result.autonomous.map((entry) => entry.id)).toEqual(["au-9", "au-1"]);
  });

  it("an entry with no firing rule and no arc change, and an entry with a non-firing rule, read unchanged, never fabricated", () => {
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: {
        entries: [
          autoEntryBase(),
          {
            ...autoEntryBase(),
            id: "au-none",
            residents: [],
            arcs: [],
            worldState: "key-b",
            migrationRules: [
              { id: "r-x", worldStates: ["key-a"], arrivals: ["c-9"], departures: [] } as MigrationRule,
            ],
          },
        ],
      },
    });
    expect(result.autonomous[0]).toEqual({
      id: "au-9",
      migration: { residents: ["c-1", "c-2"], arrived: [], departed: [], appliedRuleIds: [] },
      story: { residents: ["c-1", "c-2"], arrived: [], departed: [], appliedBeatIds: ["b1"] },
      arcs: { arcs: [{ residentId: "c-1", arc: "arc-a" }], changed: [], appliedBeatIds: ["a1"] },
    });
    expect(result.autonomous[1].migration).toEqual({
      residents: [],
      arrived: [],
      departed: [],
      appliedRuleIds: [],
    });
    expect(result.autonomous[1].arcs).toEqual({ arcs: [], changed: [], appliedBeatIds: ["a1"] });
  });

  it("story cursor gates later beats; migration and arcs are unaffected", () => {
    const entry: AutonomousEntry = {
      ...autoEntryBase(),
      id: "au-cursor",
      storyBeats: [
        { id: "b1", arrivals: ["c-3"], departures: [] },
        { id: "b2", arrivals: ["c-4"], departures: [] },
      ],
      storyThroughBeatId: "b1",
      migrationRules: [
        { id: "r1", worldStates: ["key-a"], arrivals: ["c-5"], departures: [] } as MigrationRule,
      ],
    };
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [entry] },
    });
    expect(result.autonomous[0].story).toEqual({
      residents: ["c-1", "c-2", "c-3"],
      arrived: ["c-3"],
      departed: [],
      appliedBeatIds: ["b1"],
    });
    expect(result.autonomous[0].migration.arrived).toEqual(["c-5"]);
  });

  it("exact result shape: two sections only, readings exactly id + migration + story + arcs, exact section shapes", () => {
    const result = gardenOutingAutonomous(fullAutonomousInputs());
    expect(Object.keys(result).sort()).toEqual(["autonomous", "outingInbound"]);
    expect(Object.keys(result.autonomous[0]).sort()).toEqual([
      "arcs",
      "id",
      "migration",
      "story",
    ]);
    expect(Object.keys(result.autonomous[0].migration).sort()).toEqual([
      "appliedRuleIds",
      "arrived",
      "departed",
      "residents",
    ]);
    expect(Object.keys(result.autonomous[0].story).sort()).toEqual([
      "appliedBeatIds",
      "arrived",
      "departed",
      "residents",
    ]);
    expect(Object.keys(result.autonomous[0].arcs).sort()).toEqual([
      "appliedBeatIds",
      "arcs",
      "changed",
    ]);
    expect("autonomous" in result.outingInbound).toBe(false);
  });

  it("side-by-side-not-merged: same autonomous input reads identically under a minimal and a full outing-inbound section", () => {
    const minimal = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [autoEntryFull()] },
    });
    const full = gardenOutingAutonomous({
      outingInbound: fullOutingInbound(),
      autonomous: { entries: [autoEntryFull()] },
    });
    expect(full.autonomous).toEqual(minimal.autonomous);
    // A resident in the autonomous entry but absent from the
    // outing bonds still reports in autonomous: c-3 arrives by
    // migration, while the minimal outing bonds name no creature.
    expect(minimal.autonomous[0].migration.residents).toContain("c-3");
    expect(minimal.outingInbound.outingNews.outingDiscovery.outingResearch.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals).toEqual([]);
  });

  it("caller-vocabulary ids read back unchanged", () => {
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [{ ...autoEntryBase(), id: "au-garden-Δ" }] },
    });
    expect(result.autonomous[0].id).toBe("au-garden-Δ");
  });

  it("loud failures", () => {
    const base = (): GardenOutingAutonomousInputs => ({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [autoEntryBase()] },
    });
    expect(() => gardenOutingAutonomous(null as never)).toThrow();
    expect(() => gardenOutingAutonomous({ ...base(), outingInbound: null as never })).toThrow();
    expect(() => gardenOutingAutonomous({ ...base(), autonomous: null as never })).toThrow();
    expect(() =>
      gardenOutingAutonomous({
        outingInbound: minimalOutingInbound(),
        autonomous: { entries: null as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAutonomous({
        outingInbound: minimalOutingInbound(),
        autonomous: { entries: [{ ...autoEntryBase(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAutonomous({
        outingInbound: minimalOutingInbound(),
        autonomous: { entries: [autoEntryBase(), autoEntryBase()] },
      }),
    ).toThrow();
    // Autonomous failure propagation: duplicate story beat id.
    expect(() =>
      gardenOutingAutonomous({
        outingInbound: minimalOutingInbound(),
        autonomous: {
          entries: [{
            ...autoEntryBase(),
            storyBeats: [
              { id: "b1", arrivals: [], departures: [] },
              { id: "b1", arrivals: [], departures: [] },
            ],
          }],
        },
      }),
    ).toThrow();
    // Outing-inbound failure propagation: duplicate inbound entry id.
    expect(() =>
      gardenOutingAutonomous({
        outingInbound: {
          outingNews: minimalOutingNews(),
          inbound: { entries: [inboundBase(), inboundBase()] },
        },
        autonomous: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullAutonomousInputs();
    const first = gardenOutingAutonomous(inputs);
    first.autonomous[0].migration.residents.push("c-fake");
    first.autonomous[0].story.arrived.push("c-fake");
    first.autonomous[0].arcs.arcs[0].arc = "arc-fake";
    first.autonomous[0].arcs.changed.push("c-fake");
    first.autonomous.push({ id: "au-fake", migration: first.autonomous[0].migration, story: first.autonomous[0].story, arcs: first.autonomous[0].arcs });
    first.outingInbound.inbound[0].arrivals[0].creatureId = "c-fake";
    const second = gardenOutingAutonomous(inputs);
    expect(second.autonomous[0].migration.residents).toEqual(["c-1", "c-3"]);
    expect(second.autonomous[0].story.arrived).toEqual(["c-4"]);
    expect(second.autonomous[0].arcs.arcs[0].arc).toBe("arc-b");
    expect(second.autonomous[0].arcs.changed).toEqual(["c-1", "c-3"]);
    expect(second.autonomous).toHaveLength(2);
    expect(second.outingInbound.inbound[0].arrivals[0].creatureId).toBe("c-1");
    expect(inputs.autonomous.entries[0].residents).toEqual(["c-1", "c-2"]);
    expect(inputs.outingInbound.inbound.entries[0].movementLog.map((m) => m.id)).toEqual(["ib-1", "ib-2"]);
  });

  it("side-by-side-not-chained: migration and story both start from the entry residents", () => {
    const entry: AutonomousEntry = {
      ...autoEntryBase(),
      id: "au-chain",
      migrationRules: [
        { id: "r1", worldStates: ["key-a"], arrivals: [], departures: ["c-1"] } as MigrationRule,
      ],
      storyBeats: [{ id: "b1", arrivals: ["c-9"], departures: [] }],
    };
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [entry] },
    });
    expect(result.autonomous[0].migration.residents).toEqual(["c-2"]);
    expect(result.autonomous[0].story.residents).toEqual(["c-1", "c-2", "c-9"]);
  });

  it("no authored vocabulary: arc and world-state values pass through unchanged", () => {
    const entry: AutonomousEntry = {
      ...autoEntryBase(),
      id: "au-vocab",
      worldState: "key-Δ",
      arcs: [{ residentId: "c-1", arc: "arc-Δ" }],
    };
    const result = gardenOutingAutonomous({
      outingInbound: minimalOutingInbound(),
      autonomous: { entries: [entry] },
    });
    expect(result.autonomous[0].arcs.arcs).toEqual([{ residentId: "c-1", arc: "arc-Δ" }]);
    expect(result.autonomous[0].migration.residents).toEqual(["c-1", "c-2"]);
  });
});
