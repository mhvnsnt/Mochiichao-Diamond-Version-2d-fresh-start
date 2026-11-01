import { describe, expect, it } from "vitest";
import {
  gardenOutingResearch,
  type ResearchEntry,
  type GardenOutingResearchInputs,
} from "./garden-outing-research";
import {
  bioFillForSpecies,
  researchSummaryForSpecies,
  type ResearchObservation,
} from "./garden-research";
import {
  gardenOutingArrivals,
  type ArrivalEntry,
  type GardenOutingArrivalsInputs,
} from "./garden-outing-arrivals";
import { arrivals } from "./garden-arrivals";
import {
  gardenOutingMovement,
  type GardenOutingMovementInputs,
  type MovementEntry,
} from "./garden-outing-movement";
import {
  currentHome,
  isGardenResident,
  movementsForCreature,
  type MovementLog,
} from "./garden-movement";
import {
  gardenOutingTeachers,
  type GardenOutingTeachersInputs,
  type TeacherEntry,
} from "./garden-outing-teachers";
import {
  gardenOutingIndividual,
  type GardenOutingIndividualInputs,
  type IndividualEntry,
} from "./garden-outing-individual";
import { gardenOutingUnlocks } from "./garden-outing-unlocks";
import type { GardenOutingUnlocksInputs, UnlockEntry } from "./garden-outing-unlocks";
import { individualBondSummary } from "./garden-individual";
import { taughtAxes, teachersForMeetings } from "./garden-teachers";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";
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
import type { JourneyInboundInputs } from "./garden-inbound";

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

function fact(
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
    },
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

function outingCheckinBase(): GardenOutingCheckinInputs {
  return {
    outingRecord: outingRecordBase(),
    checkins: { entries: [] },
  };
}

function minimalOutingJourney(): GardenOutingJourneyInputs {
  return {
    outingSnapshot: {
      outingCheckin: outingCheckinBase(),
      snapshots: { entries: [] },
    },
    journeys: { entries: [] },
  };
}

function minimalOutingUnlocks(): GardenOutingUnlocksInputs {
  return {
    outingJourney: minimalOutingJourney(),
    unlocks: { entries: [] },
  };
}

function ledgerFull(): BondLedger {
  return [
    { creatureId: "creature-9", keeperId: "keeper-a", value: 20 },
    { creatureId: "creature-9", keeperId: "keeper-b", value: 8 },
    { creatureId: "creature-other", keeperId: "keeper-a", value: 99 },
  ];
}

function individualFull(): IndividualEntry {
  return {
    id: "ind-1",
    ledger: ledgerFull(),
    creatureId: "creature-9",
    profile: profile(),
    factsByKeeper: {
      "keeper-a": [fact("absence", "party", 3)],
      "keeper-b": [fact("absence", "storage", 2)],
    },
  };
}

function unlockFull(): UnlockEntry {
  return {
    id: "un-1",
    milestones: {
      gardenLevel: 2,
      sportTitles: ["title-a"],
      lineageMilestones: ["line-a"],
    },
    catalogue: [
      { id: "u-level", requires: { kind: "gardenLevel", atLeast: 2 } },
      { id: "u-title", requires: { kind: "sportTitle", title: "title-a" } },
      {
        id: "u-missing",
        requires: { kind: "lineageMilestone", milestone: "line-b" },
      },
      {
        id: "u-any",
        requires: {
          kind: "any",
          requirements: [
            { kind: "sportTitle", title: "nope" },
            { kind: "gardenLevel", atLeast: 1 },
          ],
        },
      },
    ],
    previouslyUnlocked: ["u-level"],
  };
}

function minimalOutingIndividual(): GardenOutingIndividualInputs {
  return {
    outingUnlocks: minimalOutingUnlocks(),
    individuals: { entries: [] },
  };
}

function fullOutingIndividual(): GardenOutingIndividualInputs {
  return {
    outingUnlocks: {
      outingJourney: minimalOutingJourney(),
      unlocks: { entries: [unlockFull()] },
    },
    individuals: { entries: [individualFull()] },
  };
}

function teacherFull(): TeacherEntry {
  return {
    id: "t-1",
    mapping: {
      "sp-a": ["ax-1", "ax-2"],
      "sp-b": ["ax-2", "ax-3"],
      "sp-empty": [],
    },
    meetings: [
      { speciesId: "sp-b", at: 5 },
      { speciesId: "sp-a", at: 2 },
      { speciesId: "sp-a", at: 9 },
      { speciesId: "sp-unmapped", at: 1 },
      { speciesId: "sp-empty", at: 3 },
    ],
  };
}

function teacherMapForm(): TeacherEntry {
  return {
    id: "t-2",
    mapping: new Map([["sp-m", ["ax-m"]]]),
    meetings: [{ speciesId: "sp-m", at: 4 }],
  };
}

function teacherBase(): TeacherEntry {
  return {
    id: "t-9",
    mapping: { "sp-9": ["ax-9"] },
    meetings: [{ speciesId: "sp-9", at: 7 }],
  };
}

function fullInputs(): GardenOutingTeachersInputs {
  return {
    outingIndividual: fullOutingIndividual(),
    teachers: { entries: [teacherFull(), teacherMapForm()] },
  };
}

function movementLogFull(): MovementLog {
  return [
    { id: "mv-2", creatureId: "c-9", verb: "transfer", from: "home-a", to: "home-b", at: 5 },
    { id: "mv-1", creatureId: "c-9", verb: "gift", from: null, to: "home-a", at: 1 },
    { id: "mv-3", creatureId: "c-9", verb: "garden-arrival", from: "home-b", to: "garden-home", at: 9 },
    { id: "mv-x", creatureId: "c-other", verb: "gift", from: null, to: "home-z", at: 2 },
  ];
}

function movementFull(): MovementEntry {
  return { id: "m-1", creatureId: "c-9", log: movementLogFull(), gardenHomes: ["garden-home", "home-a"] };
}

function movementSetForm(): MovementEntry {
  return { id: "m-2", creatureId: "c-9", log: movementLogFull(), gardenHomes: new Set(["garden-home"]) };
}

function movementBase(): MovementEntry {
  return {
    id: "m-9",
    creatureId: "c-9",
    log: [{ id: "mv-b", creatureId: "c-9", verb: "transfer", from: "home-a", to: "home-b", at: 7 }],
    gardenHomes: ["garden-home"],
  };
}

function minimalOutingTeachers(): GardenOutingTeachersInputs {
  return { outingIndividual: minimalOutingIndividual(), teachers: { entries: [] } };
}

function fullMovementInputs(): GardenOutingMovementInputs {
  return {
    outingTeachers: fullInputs(),
    movement: { entries: [movementFull(), movementSetForm()] },
  };
}

function arrivalLogFull(): MovementLog {
  return [
    { id: "av-2", creatureId: "c-9", verb: "transfer", from: "garden-home", to: "home-b", at: 5 },
    { id: "av-1", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 1 },
    { id: "av-3", creatureId: "c-9", verb: "garden-arrival", from: "home-b", to: "garden-home", at: 9 },
    { id: "av-x", creatureId: "c-other", verb: "garden-arrival", from: null, to: "garden-home", at: 2 },
  ];
}

function arrivalFull(): ArrivalEntry {
  return { id: "a-1", log: arrivalLogFull(), gardenHomes: ["garden-home", "home-a"] };
}

function arrivalSetForm(): ArrivalEntry {
  return { id: "a-2", log: arrivalLogFull(), gardenHomes: new Set(["garden-home"]) };
}

function arrivalBase(): ArrivalEntry {
  return {
    id: "a-9",
    log: [{ id: "av-b", creatureId: "c-9", verb: "garden-arrival", from: null, to: "garden-home", at: 7 }],
    gardenHomes: ["garden-home"],
  };
}

function minimalOutingMovement(): GardenOutingMovementInputs {
  return { outingTeachers: minimalOutingTeachers(), movement: { entries: [] } };
}

function fullArrivalsInputs(): GardenOutingArrivalsInputs {
  return {
    outingMovement: fullMovementInputs(),
    arrivals: { entries: [arrivalFull(), arrivalSetForm()] },
  };
}

function obs(
  id: string,
  creatureId: string,
  kind: string,
  at: number,
): ResearchObservation {
  return { id, creatureId, kind, at };
}

function researchLogFull(): ResearchObservation[] {
  return [
    obs("o1", "c1", "kind-b", 10),
    obs("o2", "c2", "kind-b", 20),
    obs("o3", "c1", "kind-a", 15),
    obs("o4", "c3", "kind-b", 99),
    obs("o5", "c-unmapped", "kind-b", 1),
  ];
}

function researchSpeciesMap(): Map<string, string> {
  return new Map([
    ["c1", "s-alpha"],
    ["c2", "s-alpha"],
    ["c3", "s-beta"],
  ]);
}

function researchFull(): ResearchEntry {
  return {
    id: "r-1",
    speciesId: "s-alpha",
    log: researchLogFull(),
    speciesOfCreature: researchSpeciesMap(),
    requirements: [
      { field: "bio-growth", requiredKind: "kind-a" },
      { field: "bio-lineage", requiredKind: "kind-lineage" },
      { field: "bio-behaviour", requiredKind: "kind-b" },
    ],
  };
}

function researchRecordForm(): ResearchEntry {
  return {
    id: "r-2",
    speciesId: "s-beta",
    log: researchLogFull(),
    speciesOfCreature: { c3: "s-beta" },
    requirements: [{ field: "bio-x", requiredKind: "kind-b" }],
  };
}

function researchBase(): ResearchEntry {
  return {
    id: "r-9",
    speciesId: "s-alpha",
    log: [obs("o-b", "c1", "kind-a", 7)],
    speciesOfCreature: { c1: "s-alpha" },
    requirements: [{ field: "bio-growth", requiredKind: "kind-a" }],
  };
}

function minimalOutingArrivals(): GardenOutingArrivalsInputs {
  return { outingMovement: minimalOutingMovement(), arrivals: { entries: [] } };
}

function fullResearchInputs(): GardenOutingResearchInputs {
  return {
    outingArrivals: fullArrivalsInputs(),
    research: { entries: [researchFull(), researchRecordForm()] },
  };
}

import { gardenOutingDiscovery, type DiscoveryEntry, type GardenOutingDiscoveryInputs } from "./garden-outing-discovery";
import { edgeDiscoveries } from "./garden-discovery";

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

function discoverySetForm(): DiscoveryEntry {
  return { id: "d-2", log: discoveryLogFull(), gardenEdge: new Set(["edge-a"]), eligibleCreatures: new Set(["c-edge"]) };
}

function discoveryBase(): DiscoveryEntry {
  return { id: "d-9", log: [{ id: "dv-b", creatureId: "c-9", verb: "release", from: null, to: "edge-a", at: 7 }], gardenEdge: ["edge-a"] };
}

function minimalOutingResearch(): GardenOutingResearchInputs {
  return { outingArrivals: minimalOutingArrivals(), research: { entries: [] } };
}

function fullDiscoveryInputs(): GardenOutingDiscoveryInputs {
  return {
    outingResearch: fullResearchInputs(),
    discovery: { entries: [discoveryFull(), discoverySetForm()] },
  };
}

describe("garden-outing-discovery (B3 outing + research + edge-discovery candidates)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs: GardenOutingDiscoveryInputs = {
      outingResearch: minimalOutingResearch(),
      discovery: { entries: [] },
    };
    const result = gardenOutingDiscovery(inputs);
    expect(result).toEqual({
      outingResearch: gardenOutingResearch(inputs.outingResearch),
      discovery: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullDiscoveryInputs();
    const result = gardenOutingDiscovery(inputs);
    expect(result.outingResearch).toEqual(
      gardenOutingResearch(inputs.outingResearch),
    );
    expect(result.discovery[0].discoveries).toEqual(
      edgeDiscoveries(discoveryFull().log, { gardenEdge: discoveryFull().gardenEdge }),
    );
    // Hand-checked numbers: release-stamp order c-edge2 (5) then
    // c-edge (10); c-other released to a non-edge place and c-gone
    // (later garden-arrival) never qualify.
    expect(result.discovery[0].discoveries).toEqual([
      { creatureId: "c-edge2", releaseRecordId: "dv-3", releasedAt: 5, releasedTo: "edge-b" },
      { creatureId: "c-edge", releaseRecordId: "dv-1", releasedAt: 10, releasedTo: "edge-a" },
    ]);
    // Set-form edge + eligible set: only c-edge qualifies.
    expect(result.discovery[1].discoveries).toEqual([
      { creatureId: "c-edge", releaseRecordId: "dv-1", releasedAt: 10, releasedTo: "edge-a" },
    ]);
    // Inherited sections still report their own numbers.
    expect(result.outingResearch.research[0].summary.totalObservations).toBe(3);
    expect(result.outingResearch.outingArrivals.arrivals[0].arrivals[0]).toMatchObject({
      creatureId: "c-9",
      arrivalCount: 2,
    });
    expect(
      result.outingResearch.outingArrivals.outingMovement.outingTeachers.teachers[0].taughtAxes,
    ).toEqual(["ax-1", "ax-2", "ax-3"]);
  });

  it("outing-research-only bundle", () => {
    const result = gardenOutingDiscovery({
      outingResearch: fullResearchInputs(),
      discovery: { entries: [] },
    });
    expect(result.discovery).toEqual([]);
    expect(result.outingResearch.research[0].summary.totalObservations).toBe(3);
  });

  it("discovery-with-minimal-outing-research bundle", () => {
    const result = gardenOutingDiscovery({
      outingResearch: minimalOutingResearch(),
      discovery: { entries: [discoveryFull()] },
    });
    expect(result.outingResearch.research).toEqual([]);
    expect(result.discovery[0].discoveries.map((d) => d.creatureId)).toEqual(["c-edge2", "c-edge"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingDiscovery({
      outingResearch: minimalOutingResearch(),
      discovery: { entries: [discoverySetForm(), discoveryBase(), discoveryFull()] },
    });
    expect(result.discovery.map((entry) => entry.id)).toEqual(["d-2", "d-9", "d-1"]);
  });

  it("an entry with an empty log and an entry with no candidates read empty, never fabricated", () => {
    const result = gardenOutingDiscovery({
      outingResearch: minimalOutingResearch(),
      discovery: {
        entries: [
          { id: "d-empty", log: [], gardenEdge: ["edge-a"] },
          { id: "d-none", log: [{ id: "dv-x", creatureId: "c-1", verb: "gift", from: null, to: "edge-a", at: 1 }], gardenEdge: ["edge-a"] },
        ],
      },
    });
    expect(result.discovery[0].discoveries).toEqual([]);
    expect(result.discovery[1].discoveries).toEqual([]);
  });

  it("exact result shape: two sections only, readings exactly id + discoveries", () => {
    const result = gardenOutingDiscovery(fullDiscoveryInputs());
    expect(Object.keys(result).sort()).toEqual(["discovery", "outingResearch"]);
    expect(Object.keys(result.discovery[0]).sort()).toEqual(["discoveries", "id"]);
    expect(Object.keys(result.discovery[0].discoveries[0]).sort()).toEqual([
      "creatureId",
      "releaseRecordId",
      "releasedAt",
      "releasedTo",
    ]);
    expect("discovery" in result.outingResearch).toBe(false);
  });

  it("side-by-side-not-merged: same discovery input reads identically under a minimal and a full outing-research section", () => {
    const minimal = gardenOutingDiscovery({
      outingResearch: minimalOutingResearch(),
      discovery: { entries: [discoveryFull()] },
    });
    const full = gardenOutingDiscovery({
      outingResearch: fullResearchInputs(),
      discovery: { entries: [discoveryFull()] },
    });
    expect(full.discovery).toEqual(minimal.discovery);
    // A creature in the discovery log but absent from the outing
    // bonds still reports in discovery: c-edge2, while the outing
    // bonds name only c-1.
    expect(minimal.discovery[0].discoveries.map((d) => d.creatureId)).toContain("c-edge2");
    expect(minimal.outingResearch.outingArrivals.outingMovement.outingTeachers.outingIndividual.individuals).toEqual([]);
  });

  it("loud failures", () => {
    const base = (): GardenOutingDiscoveryInputs => ({
      outingResearch: minimalOutingResearch(),
      discovery: { entries: [discoveryBase()] },
    });
    expect(() => gardenOutingDiscovery(null as never)).toThrow();
    expect(() =>
      gardenOutingDiscovery({ ...base(), outingResearch: null as never }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({ ...base(), discovery: null as never }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: null as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [null as never] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [{ ...discoveryBase(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [discoveryBase(), discoveryBase()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [{ ...discoveryBase(), log: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [{ ...discoveryBase(), gardenEdge: null as never }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: { entries: [{ ...discoveryBase(), gardenEdge: [""] }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: {
          entries: [{ ...discoveryBase(), log: [{ id: "dv-bad", creatureId: "c-9", verb: "teleport", from: null, to: "edge-a", at: 1 } as never] }],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: minimalOutingResearch(),
        discovery: {
          entries: [{ ...discoveryBase(), eligibleCreatures: [""] }],
        },
      }),
    ).toThrow();
    // Outing-research failure propagation: a duplicate research
    // entry id fails through the composed read.
    expect(() =>
      gardenOutingDiscovery({
        outingResearch: {
          outingArrivals: minimalOutingArrivals(),
          research: { entries: [researchBase(), researchBase()] },
        },
        discovery: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = fullDiscoveryInputs();
    const logOrder = inputs.discovery.entries[0].log.map((r) => r.id);
    const first = gardenOutingDiscovery(inputs);
    first.discovery[0].discoveries[0].releasedTo = "nowhere";
    first.discovery.push({ id: "d-invented", discoveries: [] });
    first.outingResearch.research[0].summary.observedKinds.push("kind-invented");
    const second = gardenOutingDiscovery(inputs);
    expect(second.discovery[0].discoveries[0].releasedTo).toBe("edge-b");
    expect(second.discovery.map((entry) => entry.id)).toEqual(["d-1", "d-2"]);
    expect(second.outingResearch.research[0].summary.observedKinds).toEqual(["kind-b", "kind-a"]);
    expect(inputs.discovery.entries[0].log.map((r) => r.id)).toEqual(logOrder);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingDiscovery({
      outingResearch: minimalOutingResearch(),
      discovery: {
        entries: [
          {
            id: "zz-odd",
            log: [{ id: "dv-odd", creatureId: "cr-odd", verb: "release", from: null, to: "edge-?!", at: 3 }],
            gardenEdge: ["edge-?!"],
          },
        ],
      },
    });
    expect(result.discovery[0].discoveries).toEqual([
      { creatureId: "cr-odd", releaseRecordId: "dv-odd", releasedAt: 3, releasedTo: "edge-?!" },
    ]);
  });

  it("staging locks: no host or composed module imports the outing-discovery bundle yet", async () => {
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
      "./garden-outing-snapshot.ts",
      "./garden-outing-journey.ts",
      "./garden-outing-unlocks.ts",
      "./garden-outing-individual.ts",
      "./garden-outing-teachers.ts",
      "./garden-outing-movement.ts",
      "./garden-outing-arrivals.ts",
      "./garden-outing-research.ts",
      "./garden-unlocks.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-outing-discovery");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-outing-discovery.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
