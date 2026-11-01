import { describe, expect, it } from "vitest";
import {
  gardenOutingHabitats,
  type GardenOutingHabitatsInputs,
  type HabitatEntry,
} from "./garden-outing-habitats";
import {
  gardenOutingAutonomous,
  type AutonomousEntry,
  type GardenOutingAutonomousInputs,
} from "./garden-outing-autonomous";
import {
  solveHabitat,
  type HabitatPlacement,
  type HabitatRecipe,
} from "./garden-habitats";
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


function minimalOutingAutonomous(): GardenOutingAutonomousInputs {
  return {
    outingInbound: minimalOutingInbound(),
    autonomous: { entries: [] },
  };
}

function habitatRecipes(): HabitatRecipe[] {
  return [
    {
      id: "rec-h1",
      tier: 2,
      requires: [{ item: "bed-a", count: 2 }, { category: "cat-x", count: 1 }],
    },
    { id: "rec-h2", tier: 1, requires: [{ item: "bed-a", count: 1 }] },
  ];
}

function habitatPlacementFull(): HabitatPlacement {
  return {
    zoneId: "zone-a",
    cells: [
      { id: "p1", itemId: "bed-a", richness: 2, material: "wood" },
      { id: "p2", itemId: "bed-a", richness: 3, material: "wood" },
      { id: "p3", itemId: "tbl-a", categories: ["cat-x"], richness: 1, material: "stone" },
      { id: "p4", itemId: "bed-a", richness: 10, material: "wood", band: 1 },
    ],
  };
}

function habitatEntryFull(): HabitatEntry {
  return { id: "h-1", placement: habitatPlacementFull(), recipes: habitatRecipes() };
}

function habitatEntryBedsOnly(): HabitatEntry {
  return {
    id: "h-2",
    placement: {
      zoneId: "zone-a",
      cells: [{ id: "q1", itemId: "bed-a", richness: 1, material: "wood" }],
    },
    recipes: habitatRecipes(),
  };
}

function fullHabitatsInputs(): GardenOutingHabitatsInputs {
  return {
    outingAutonomous: fullAutonomousInputs(),
    habitats: { entries: [habitatEntryFull(), habitatEntryBedsOnly()] },
  };
}

function minimalHabitatsInputs(): GardenOutingHabitatsInputs {
  return {
    outingAutonomous: minimalOutingAutonomous(),
    habitats: { entries: [] },
  };
}
describe("garden-outing-habitats (B3 outing + autonomous + habitats)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs = minimalHabitatsInputs();
    const result = gardenOutingHabitats(inputs);
    expect(result).toEqual({
      outingAutonomous: gardenOutingAutonomous(inputs.outingAutonomous),
      habitats: [],
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullHabitatsInputs();
    const result = gardenOutingHabitats(inputs);
    expect(result.outingAutonomous).toEqual(
      gardenOutingAutonomous(inputs.outingAutonomous),
    );
    expect(result.habitats[0]).toEqual({
      id: "h-1",
      solved: solveHabitat(habitatEntryFull().placement, habitatEntryFull().recipes),
    });
    expect(result.habitats[1]).toEqual({
      id: "h-2",
      solved: solveHabitat(habitatEntryBedsOnly().placement, habitatEntryBedsOnly().recipes),
    });
    // Hand-checked habitats: most-specific recipe wins; the band-1
    // cell never counts toward a band-0 recipe's extent or finish.
    expect(result.habitats[0].solved).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
    // Beds only: rec-h1 is unsatisfied (no cat-x cell), rec-h2 wins.
    expect(result.habitats[1].solved).toEqual({
      recipeId: "rec-h2",
      tier: 1,
      extent: 1,
      finish: 1,
      character: "wood",
    });
    // Inherited sections still report their own numbers.
    expect(result.outingAutonomous.autonomous[0].migration).toEqual({
      residents: ["c-1", "c-3"],
      arrived: ["c-3"],
      departed: ["c-2"],
      appliedRuleIds: ["r1"],
    });
    expect(result.outingAutonomous.outingInbound.inbound[0].taughtAxes).toEqual(["ax-1"]);
  });

  it("outing-autonomous-only bundle", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: fullAutonomousInputs(),
      habitats: { entries: [] },
    });
    expect(result.habitats).toEqual([]);
    expect(result.outingAutonomous.autonomous[0].migration.residents).toEqual(["c-1", "c-3"]);
  });

  it("habitats-with-minimal-outing-autonomous bundle", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: { entries: [habitatEntryFull()] },
    });
    expect(result.outingAutonomous.autonomous).toEqual([]);
    expect(result.outingAutonomous.outingInbound.inbound).toEqual([]);
    expect(result.habitats[0].solved).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
  });

  it("caller order is preserved", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: { entries: [habitatEntryBedsOnly(), habitatEntryFull()] },
    });
    expect(result.habitats.map((entry) => entry.id)).toEqual(["h-2", "h-1"]);
  });

  it("empty, unmatched, zone-mismatched, and cap-reached entries read null, never fabricated", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: {
        entries: [
          { id: "h-empty", placement: { zoneId: "zone-a", cells: [] }, recipes: habitatRecipes() },
          {
            id: "h-nomatch",
            placement: { zoneId: "zone-a", cells: [{ id: "n1", itemId: "other-a" }] },
            recipes: habitatRecipes(),
          },
          {
            id: "h-zone",
            placement: habitatPlacementFull(),
            recipes: [{ id: "rec-z", tier: 1, requires: [{ item: "bed-a", count: 1 }], zone: "zone-b" }],
          },
          {
            id: "h-cap",
            placement: habitatPlacementFull(),
            recipes: habitatRecipes(),
            options: { cap: 1, alreadyRegistered: 1 },
          },
        ],
      },
    });
    expect(result.habitats.map((entry) => entry.solved)).toEqual([null, null, null, null]);
  });

  it("exact result shape: two sections only, reading exactly id + solved", () => {
    const result = gardenOutingHabitats(fullHabitatsInputs());
    expect(Object.keys(result).sort()).toEqual(["habitats", "outingAutonomous"]);
    expect(Object.keys(result.habitats[0]).sort()).toEqual(["id", "solved"]);
    expect(Object.keys(result.habitats[0].solved as object).sort()).toEqual([
      "character",
      "extent",
      "finish",
      "recipeId",
      "tier",
    ]);
    expect("habitats" in (result.outingAutonomous as object)).toBe(false);
  });

  it("side-by-side-not-merged: same habitat input reads identically with a minimal and a full outing-autonomous section", () => {
    const entry = habitatEntryFull();
    const withMinimal = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: { entries: [entry] },
    });
    const withFull = gardenOutingHabitats({
      outingAutonomous: fullAutonomousInputs(),
      habitats: { entries: [entry] },
    });
    expect(withMinimal.habitats).toEqual(withFull.habitats);
    // A habitat entry over cells no outing resident touches is still reported.
    const unrelated = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: {
        entries: [
          {
            id: "h-unrelated",
            placement: {
              zoneId: "zone-a",
              cells: [{ id: "u1", itemId: "bed-a", richness: 0, material: "wood" }],
            },
            recipes: habitatRecipes(),
          },
        ],
      },
    });
    expect(unrelated.habitats[0].solved?.recipeId).toBe("rec-h2");
  });

  it("side-by-side-not-chained: habitat solved from its own placement, not from outing residents", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: fullAutonomousInputs(),
      habitats: { entries: [habitatEntryFull()] },
    });
    // The outing's residents are c-1/c-2/c-3; the habitat reads cells,
    // not residents — its extent/finish come from the placement alone.
    expect(result.habitats[0].solved?.extent).toBe(3);
    expect(result.habitats[0].solved?.finish).toBe(6);
    expect(result.outingAutonomous.autonomous[0].migration.residents).toEqual(["c-1", "c-3"]);
  });

  it("loud failures", () => {
    expect(() => gardenOutingHabitats(null as never)).toThrow();
    expect(() =>
      gardenOutingHabitats({ habitats: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingHabitats({ outingAutonomous: minimalOutingAutonomous() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingHabitats({
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingHabitats({
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: [{ ...habitatEntryFull(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingHabitats({
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: [habitatEntryFull(), habitatEntryFull()] },
      }),
    ).toThrow();
    // Habitat failure propagation: duplicate cell id.
    expect(() =>
      gardenOutingHabitats({
        outingAutonomous: minimalOutingAutonomous(),
        habitats: {
          entries: [
            {
              id: "h-bad",
              placement: {
                zoneId: "zone-a",
                cells: [
                  { id: "d1", itemId: "bed-a" },
                  { id: "d1", itemId: "bed-a" },
                ],
              },
              recipes: habitatRecipes(),
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-autonomous failure propagation: duplicate autonomous entry id.
    expect(() =>
      gardenOutingHabitats({
        outingAutonomous: {
          outingInbound: minimalOutingInbound(),
          autonomous: { entries: [autoEntryBase(), autoEntryBase()] },
        },
        habitats: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullHabitatsInputs();
    const first = gardenOutingHabitats(inputs);
    (first.habitats[0].solved as { recipeId: string }).recipeId = "rec-fake";
    first.habitats.push({ id: "h-fake", solved: null });
    first.outingAutonomous.autonomous[0].migration.residents.push("c-fake");
    const second = gardenOutingHabitats(inputs);
    expect(second.habitats[0].solved?.recipeId).toBe("rec-h1");
    expect(second.habitats).toHaveLength(2);
    expect(second.outingAutonomous.autonomous[0].migration.residents).toEqual(["c-1", "c-3"]);
    expect(inputs.habitats.entries[0].placement.cells.map((c) => c.id)).toEqual([
      "p1",
      "p2",
      "p3",
      "p4",
    ]);
    expect(inputs.habitats.entries[0].recipes.map((r) => r.id)).toEqual(["rec-h1", "rec-h2"]);
  });

  it("no authored vocabulary: recipe, item, and category ids pass through unchanged", () => {
    const result = gardenOutingHabitats({
      outingAutonomous: minimalOutingAutonomous(),
      habitats: {
        entries: [
          {
            id: "h-Δ",
            placement: {
              zoneId: "zone-Δ",
              cells: [{ id: "cΔ", itemId: "item-Δ", categories: ["cat-Δ"], richness: 4, material: "mat-Δ" }],
            },
            recipes: [{ id: "rec-Δ", tier: 3, requires: [{ category: "cat-Δ", count: 1 }] }],
          },
        ],
      },
    });
    expect(result.habitats[0]).toEqual({
      id: "h-Δ",
      solved: { recipeId: "rec-Δ", tier: 3, extent: 1, finish: 4, character: "mat-Δ" },
    });
  });
});
