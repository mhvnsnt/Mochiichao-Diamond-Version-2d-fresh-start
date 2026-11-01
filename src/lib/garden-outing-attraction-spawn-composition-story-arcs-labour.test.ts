// S14 slice 57 tests — B3 outing + attraction + spawn + composition + story + arcs + labour bundle (pure library).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gardenOutingAttractionSpawnComposition,
  type CompositionEntry,
  type GardenOutingAttractionSpawnCompositionInputs,
} from "./garden-outing-attraction-spawn-composition";
import {
  gardenOutingAttractionSpawn,
  type GardenOutingAttractionSpawnInputs,
  type SpawnEntry,
} from "./garden-outing-attraction-spawn";
import {
  gardenOutingAttraction,
  type AttractionEntry,
  type GardenOutingAttractionInputs,
} from "./garden-outing-attraction";
import {
  type GardenOutingHabitatsInputs,
  type HabitatEntry,
} from "./garden-outing-habitats";
import {
  type GardenOutingAutonomousInputs,
  type AutonomousEntry,
} from "./garden-outing-autonomous";
import { composeHabitat, type HabitatComposition } from "./garden-composition";
import { attractSpawnRows } from "./garden-attraction";
import {
  type HabitatPlacement,
  type HabitatRecipe,
  type SolvedHabitat,
} from "./garden-habitats";
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

function minimalOutingDiscovery() {
  return { outingResearch: minimalOutingResearch(), discovery: { entries: [] } };
}

function minimalOutingNews() {
  return { outingDiscovery: minimalOutingDiscovery(), news: { entries: [] } };
}

function minimalOutingInbound() {
  return { outingNews: minimalOutingNews(), inbound: { entries: [] } };
}

function minimalOutingAutonomous(): GardenOutingAutonomousInputs {
  return {
    outingInbound: minimalOutingInbound(),
    autonomous: { entries: [] },
  };
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

function minimalHabitatsInputs(): GardenOutingHabitatsInputs {
  return {
    outingAutonomous: minimalOutingAutonomous(),
    habitats: { entries: [] },
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

function habitatEntryFull(): HabitatEntry {
  return {
    id: "h-1",
    placement: {
      zoneId: "zone-a",
      cells: [
        { id: "p1", itemId: "bed-a", richness: 2, material: "wood" },
        { id: "p2", itemId: "bed-a", richness: 3, material: "wood" },
        { id: "p3", itemId: "tbl-a", categories: ["cat-x"], richness: 1, material: "stone" },
        { id: "p4", itemId: "bed-a", richness: 10, material: "wood", band: 1 },
      ],
    } as HabitatPlacement,
    recipes: habitatRecipes(),
  };
}

function solved(recipeId: string): SolvedHabitat {
  return { recipeId, tier: 1, extent: 3, finish: 5, character: null };
}

function classesTable(): Record<string, readonly string[]> {
  return {
    "meadow-patch": ["small-ground"],
    "pond-edge": ["water"],
    "mixed-border": ["small-ground", "canopy"],
  };
}

function attractionEntryFull(): AttractionEntry {
  return {
    id: "a-1",
    habitats: [solved("meadow-patch"), solved("meadow-patch"), solved("pond-edge")],
    classes: classesTable(),
  };
}

function attractionEntryMixed(): AttractionEntry {
  return {
    id: "a-2",
    habitats: [solved("mixed-border"), null],
    classes: classesTable(),
  };
}

function attractionEntryUnmapped(): AttractionEntry {
  return {
    id: "a-3",
    habitats: [solved("unmapped-recipe")],
    classes: classesTable(),
  };
}

function fullAttractionInputs(): GardenOutingAttractionInputs {
  return {
    outingHabitats: {
      outingAutonomous: {
        outingInbound: minimalOutingInbound(),
        autonomous: { entries: [autoEntryBase()] },
      },
      habitats: { entries: [habitatEntryFull()] },
    },
    attraction: {
      entries: [attractionEntryFull(), attractionEntryMixed(), attractionEntryUnmapped()],
    },
  };
}

function minimalAttractionInputs(): GardenOutingAttractionInputs {
  return {
    outingHabitats: minimalHabitatsInputs(),
    attraction: { entries: [] },
  };
}

function spawnEntryGround(): SpawnEntry {
  return {
    id: "s-1",
    attractionId: "a-1",
    rows: [
      { species: "sp-a", weight: 10, habitatClass: "small-ground" },
      { species: "sp-b", weight: 5, habitatClass: "water" },
      { species: "sp-c", weight: 7, habitatClass: "canopy" },
      { species: "sp-d", weight: 3 },
      { species: "sp-e", weight: 9, habitatClass: null },
    ],
  };
}

function spawnEntryMixed(): SpawnEntry {
  return {
    id: "s-2",
    attractionId: "a-2",
    rows: [
      { species: "sp-f", weight: 4, habitatClass: "small-ground" },
      { species: "sp-g", weight: 6, habitatClass: "canopy" },
      { species: "sp-h", weight: 8, habitatClass: "water" },
    ],
  };
}

function spawnEntryUnmapped(): SpawnEntry {
  return {
    id: "s-3",
    attractionId: "a-3",
    rows: [{ species: "sp-i", weight: 2, habitatClass: "small-ground" }],
  };
}

function fullSpawnInputs(): GardenOutingAttractionSpawnInputs {
  return {
    outingAttraction: fullAttractionInputs(),
    spawn: {
      entries: [spawnEntryGround(), spawnEntryMixed(), spawnEntryUnmapped()],
    },
  };
}

function minimalSpawnInputs(): GardenOutingAttractionSpawnInputs {
  return {
    outingAttraction: minimalAttractionInputs(),
    spawn: { entries: [] },
  };
}

function neighbourSolved(): SolvedHabitat {
  return { recipeId: "rec-h2", tier: 1, extent: 1, finish: 1, character: "wood" };
}

function compositionFull(): HabitatComposition {
  return {
    contextTags: ["water", "tree"],
    modifiers: [
      { contextTag: "water", variantId: "v-hydrated" },
      { contextTag: "tree", variantId: "v-shaded", appliesTo: ["rec-other"] },
      { contextTag: "water", variantId: "v-hydrated" },
    ],
    neighbours: [neighbourSolved()],
    combos: [
      { first: "rec-h1", second: "rec-h2", comboId: "combo-hotel" },
      { first: "rec-h1", second: "rec-h2", comboId: "combo-hotel" },
    ],
  };
}

function compositionEntryFull(): CompositionEntry {
  return { id: "k-1", habitatId: "h-1", composition: compositionFull() };
}

function habitatEntryUnmatched(): HabitatEntry {
  return {
    id: "h-null",
    placement: {
      zoneId: "zone-b",
      cells: [{ id: "q1", itemId: "nope", richness: 1, material: "stone" }],
    } as HabitatPlacement,
    recipes: habitatRecipes(),
  };
}

function compositionEntryNullBase(): CompositionEntry {
  return {
    id: "k-null",
    habitatId: "h-null",
    composition: {
      neighbours: [neighbourSolved(), solved("rec-h1")],
      combos: [{ first: "rec-h1", second: "rec-h2", comboId: "combo-hotel" }],
    },
  };
}

function fullCompositionInputs(): GardenOutingAttractionSpawnCompositionInputs {
  return {
    outingAttractionSpawn: fullSpawnInputs(),
    composition: { entries: [compositionEntryFull()] },
  };
}

function fullCompositionInputsWithNull(): GardenOutingAttractionSpawnCompositionInputs {
  return {
    outingAttractionSpawn: {
      outingAttraction: {
        outingHabitats: {
          outingAutonomous: minimalOutingAutonomous(),
          habitats: { entries: [habitatEntryFull(), habitatEntryUnmatched()] },
        },
        attraction: { entries: [] },
      },
      spawn: { entries: [] },
    },
    composition: { entries: [compositionEntryFull(), compositionEntryNullBase()] },
  };
}

function minimalCompositionInputs(): GardenOutingAttractionSpawnCompositionInputs {
  return {
    outingAttractionSpawn: minimalSpawnInputs(),
    composition: { entries: [] },
  };
}

import {
  gardenOutingAttractionSpawnCompositionStory,
  type GardenOutingAttractionSpawnCompositionStoryInputs,
  type StoryInputs,
} from "./garden-outing-attraction-spawn-composition-story";
import { applyStoryBeats } from "./garden-story";

function minimalStory(): StoryInputs {
  return {
    residents: [],
    beats: [{ id: "b1", arrivals: [], departures: [] }],
    throughBeatId: "b1",
  };
}

function fullStory(): StoryInputs {
  return {
    residents: ["c-1", "c-2"],
    beats: [
      { id: "b1", arrivals: ["c-3"], departures: [] },
      { id: "b2", arrivals: ["c-4"], departures: ["c-1"] },
      { id: "b3", arrivals: ["c-5"], departures: ["c-2"] },
    ],
    throughBeatId: "b2",
  };
}

import {
  gardenOutingAttractionSpawnCompositionStoryArcs,
  type ArcsInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs";
import { applyArcBeats } from "./garden-arcs";

function minimalArcs(): ArcsInputs {
  return {
    arcs: [],
    beats: [{ id: "ar-1", changes: [] }],
    throughBeatId: "ar-1",
  };
}

function fullArcs(): ArcsInputs {
  return {
    arcs: [
      { residentId: "c-1", arc: "arc-a" },
      { residentId: "c-2", arc: "arc-b" },
    ],
    beats: [
      {
        id: "ar-1",
        changes: [
          { residentId: "c-1", arc: "arc-a2" },
          { residentId: "c-3", arc: "arc-c" },
        ],
      },
      {
        id: "ar-2",
        changes: [
          { residentId: "c-2", arc: "arc-b2" },
          { residentId: "c-1", arc: "arc-a" },
        ],
      },
      { id: "ar-3", changes: [{ residentId: "c-2", arc: "arc-b3" }] },
    ],
    throughBeatId: "ar-2",
  };
}

function minimalArcsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsInputs {
  return {
    outingAttractionSpawnCompositionStory: {
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: minimalStory(),
    },
    arcs: minimalArcs(),
  };
}

function fullArcsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsInputs {
  return {
    outingAttractionSpawnCompositionStory: {
      outingAttractionSpawnComposition: fullCompositionInputs(),
      story: fullStory(),
    },
    arcs: fullArcs(),
  };
}


// S14 slice 57 tests — B3 outing + attraction + spawn + composition + story + arcs + labour bundle (pure library).
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabour,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs,
  type LabourInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour";
import {
  labourStatuses,
  type GardenLabourJob,
  type LabourContext,
} from "./garden-labour";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour (B3 outing + attraction + spawn + composition + story + arcs + labour)", () => {
  function solved(recipeId: string): SolvedHabitat {
    return { recipeId, tier: 1, extent: 3, finish: 5, character: null };
  }

  function job(partial: Partial<GardenLabourJob> & { jobId: string }): GardenLabourJob {
    return {
      workerId: "worker-a",
      zoneId: "zone-1",
      workplaceRecipeId: "recipe-kitchen",
      requiresStock: false,
      social: false,
      ...partial,
    };
  }

  function labourContext(partial: Partial<LabourContext> = {}): LabourContext {
    return {
      zoneHabitats: { "zone-1": solved("recipe-kitchen"), "zone-2": solved("recipe-field") },
      residentsPresent: { "zone-1": ["worker-a"], "zone-2": ["worker-b"] },
      stockedZones: new Set<string>(),
      ...partial,
    };
  }

  function minimalLabour(): LabourInputs {
    return { jobs: [], context: labourContext() };
  }

  function fullLabour(): LabourInputs {
    return {
      jobs: [
        job({ jobId: "j-run" }),
        job({ jobId: "j-stock", requiresStock: true }),
        job({ jobId: "j-social", social: true }),
        job({ jobId: "j-field", workerId: "worker-b", zoneId: "zone-2", workplaceRecipeId: "recipe-field" }),
        job({ jobId: "j-nowork", workerId: "worker-c", zoneId: "zone-9", workplaceRecipeId: "recipe-none" }),
      ],
      context: labourContext({
        residentsPresent: { "zone-1": ["worker-a", "res-b"], "zone-2": ["worker-b"] },
        stockedZones: new Set<string>(["zone-2"]),
      }),
    };
  }

  function minimalLabourInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs {
    return {
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: minimalLabour(),
    };
  }

  function fullLabourInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs {
    return {
      outingAttractionSpawnCompositionStoryArcs: fullArcsInputs(),
      labour: fullLabour(),
    };
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour(minimalLabourInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcs).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcs(minimalArcsInputs()),
    );
    expect(result.labour).toEqual({
      statuses: [],
      summary: { total: 0, running: 0, idle: 0, byReason: { "no-workplace": 0, unstocked: 0, "no-partner": 0 } },
    });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour(fullLabourInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcs).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcs(fullArcsInputs()),
    );
    expect(result.labour.statuses).toEqual(labourStatuses(fullLabour().jobs, fullLabour().context));
    // Hand-checked: j-run runs (kitchen recognised, no stock/partner needed);
    // j-stock idles unstocked (zone-1 not stocked); j-social runs (res-b
    // present in zone-1 besides worker-a); j-field runs (field recognised
    // in zone-2); j-nowork idles no-workplace (zone-9 has no solved habitat).
    expect(result.labour.statuses).toEqual([
      { jobId: "j-run", workerId: "worker-a", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", running: true, idleReason: null, waitsAtWorkplace: false },
      { jobId: "j-stock", workerId: "worker-a", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", running: false, idleReason: "unstocked", waitsAtWorkplace: true },
      { jobId: "j-social", workerId: "worker-a", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", running: true, idleReason: null, waitsAtWorkplace: false },
      { jobId: "j-field", workerId: "worker-b", zoneId: "zone-2", workplaceRecipeId: "recipe-field", running: true, idleReason: null, waitsAtWorkplace: false },
      { jobId: "j-nowork", workerId: "worker-c", zoneId: "zone-9", workplaceRecipeId: "recipe-none", running: false, idleReason: "no-workplace", waitsAtWorkplace: true },
    ]);
    expect(result.labour.summary).toEqual({
      total: 5, running: 3, idle: 2,
      byReason: { "no-workplace": 1, unstocked: 1, "no-partner": 0 },
    });
    // Inherited arcs numbers from the slice-56 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcs.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
    // Inherited story numbers from the slice-55 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcs.outingAttractionSpawnCompositionStory.story).toEqual({
      residents: ["c-2", "c-3", "c-4"],
      arrived: ["c-3", "c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1", "b2"],
    });
  });

  it("bundle-only and labour-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: fullArcsInputs(),
      labour: minimalLabour(),
    });
    expect(bundleOnly.labour).toEqual({
      statuses: [],
      summary: { total: 0, running: 0, idle: 0, byReason: { "no-workplace": 0, unstocked: 0, "no-partner": 0 } },
    });
    const labourOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: fullLabour(),
    });
    expect(labourOnly.labour.statuses.map((s) => [s.jobId, s.running, s.idleReason])).toEqual([
      ["j-run", true, null],
      ["j-stock", false, "unstocked"],
      ["j-social", true, null],
      ["j-field", true, null],
      ["j-nowork", false, "no-workplace"],
    ]);
  });

  it("idle reasons in check order: workplace beats stock beats partner", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: {
        jobs: [
          job({ jobId: "o1", requiresStock: true, social: true, zoneId: "zone-9", workplaceRecipeId: "recipe-none", workerId: "w-9" }),
          job({ jobId: "o2", requiresStock: true, social: true }),
          job({ jobId: "o3", social: true }),
        ],
        context: labourContext(),
      },
    });
    expect(result.labour.statuses.map((s) => [s.jobId, s.idleReason])).toEqual([
      ["o1", "no-workplace"],
      ["o2", "unstocked"],
      ["o3", "no-partner"],
    ]);
    expect(result.labour.summary.byReason).toEqual({ "no-workplace": 1, unstocked: 1, "no-partner": 1 });
  });

  it("exit test: nulling one zone's workplace idles exactly its jobs and no others", () => {
    const jobs = [
      job({ jobId: "za", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen" }),
      job({ jobId: "zb", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", workerId: "worker-c" }),
      job({ jobId: "zc", zoneId: "zone-2", workplaceRecipeId: "recipe-field", workerId: "worker-b" }),
    ];
    const before = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: { jobs, context: labourContext() },
    });
    expect(before.labour.statuses.map((s) => s.running)).toEqual([true, true, true]);
    const after = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: {
        jobs,
        context: labourContext({ zoneHabitats: { "zone-1": null, "zone-2": solved("recipe-field") } }),
      },
    });
    expect(after.labour.statuses.map((s) => [s.jobId, s.running, s.idleReason])).toEqual([
      ["za", false, "no-workplace"],
      ["zb", false, "no-workplace"],
      ["zc", true, null],
    ]);
  });

  it("exact result shape: two sections only, labour exactly statuses + summary", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour(fullLabourInputs());
    expect(Object.keys(result).sort()).toEqual([
      "labour",
      "outingAttractionSpawnCompositionStoryArcs",
    ]);
    expect(Object.keys(result.labour).sort()).toEqual(["statuses", "summary"]);
    expect(Object.keys(result.labour.summary).sort()).toEqual(["byReason", "idle", "running", "total"]);
    expect(result.outingAttractionSpawnCompositionStoryArcs).not.toHaveProperty("labour");
  });

  it("side-by-side-not-merged: same labour input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      labour: fullLabour(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabour(fullLabourInputs());
    expect(withMinimal.labour).toEqual(withFull.labour);
    // And the bundle's own autonomous arcs never leak into labour:
    // labour jobs are the caller's j-run/j-stock/j-social/j-field/j-nowork.
    expect(withFull.labour.statuses.map((s) => s.jobId)).toEqual(["j-run", "j-stock", "j-social", "j-field", "j-nowork"]);
  });

  it("side-by-side-not-chained: labour comes from the caller, not from the bundle's habitats or residents", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: fullArcsInputs(),
      labour: {
        jobs: [
          job({ jobId: "q-1", workerId: "r-9", zoneId: "zone-q", workplaceRecipeId: "recipe-q" }),
          job({ jobId: "q-2", workerId: "r-10", zoneId: "zone-q", workplaceRecipeId: "recipe-q", social: true }),
        ],
        context: {
          zoneHabitats: { "zone-q": solved("recipe-q") },
          residentsPresent: { "zone-q": ["r-9", "r-10"] },
          stockedZones: new Set<string>(),
        },
      },
    });
    // The bundle's habitat recipe is rec-h1 in zone-a and its story
    // residents are c-2/c-3/c-4; labour never borrows either — both
    // jobs run on the caller context alone (q-2 has r-9 as partner).
    expect(result.labour.statuses).toEqual([
      { jobId: "q-1", workerId: "r-9", zoneId: "zone-q", workplaceRecipeId: "recipe-q", running: true, idleReason: null, waitsAtWorkplace: false },
      { jobId: "q-2", workerId: "r-10", zoneId: "zone-q", workplaceRecipeId: "recipe-q", running: true, idleReason: null, waitsAtWorkplace: false },
    ]);
    // Counter-proof: the same jobs with an empty caller context idle,
    // even though the bundle still carries its rec-h1 habitat.
    const empty = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: fullArcsInputs(),
      labour: {
        jobs: [job({ jobId: "q-1", workerId: "r-9", zoneId: "zone-q", workplaceRecipeId: "recipe-q" })],
        context: { zoneHabitats: {}, residentsPresent: {}, stockedZones: new Set<string>() },
      },
    });
    expect(empty.labour.statuses[0]).toMatchObject({ running: false, idleReason: "no-workplace" });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcsLabour(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({ labour: minimalLabour() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
        labour: { ...minimalLabour(), jobs: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
        labour: { jobs: [], context: { zoneHabitats: {}, residentsPresent: {}, stockedZones: ["zone-1"] as never } },
      }),
    ).toThrow();
    // Duplicate job id: loud failure, never a silent merge.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
        labour: {
          jobs: [job({ jobId: "d" }), job({ jobId: "d" })],
          context: labourContext(),
        },
      }),
    ).toThrow(/duplicate jobId/);
    // Labour failure propagation: a job with an empty jobId.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
        labour: {
          jobs: [job({ jobId: "" })],
          context: labourContext(),
        },
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabour({
        outingAttractionSpawnCompositionStoryArcs: {
          outingAttractionSpawnCompositionStory: {
            outingAttractionSpawnComposition: {
              outingAttractionSpawn: fullSpawnInputs(),
              composition: { entries: [compositionEntryFull(), compositionEntryFull()] },
            },
            story: minimalStory(),
          },
          arcs: minimalArcs(),
        },
        labour: minimalLabour(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullLabourInputs();
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabour(inputs);
    first.labour.statuses[0].running = false;
    first.labour.statuses[0].idleReason = "no-workplace";
    first.labour.summary.running = 0;
    first.labour.summary.byReason["no-workplace"] = 99;
    first.outingAttractionSpawnCompositionStoryArcs.arcs.arcs[0].arc = "arc-fake";
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabour(inputs);
    expect(second.labour.statuses[0]).toEqual({
      jobId: "j-run", workerId: "worker-a", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", running: true, idleReason: null, waitsAtWorkplace: false,
    });
    expect(second.labour.summary).toEqual({
      total: 5, running: 3, idle: 2,
      byReason: { "no-workplace": 1, unstocked: 1, "no-partner": 0 },
    });
    expect(second.outingAttractionSpawnCompositionStoryArcs.arcs.arcs[0]).toEqual({ residentId: "c-1", arc: "arc-a" });
    expect(inputs.labour.jobs.map((j) => j.jobId)).toEqual(["j-run", "j-stock", "j-social", "j-field", "j-nowork"]);
    expect(inputs.outingAttractionSpawnCompositionStoryArcs.arcs.beats.map((b) => b.id)).toEqual(["ar-1", "ar-2", "ar-3"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabour({
      outingAttractionSpawnCompositionStoryArcs: {
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: {
            outingAttractionSpawn: {
              outingAttraction: {
                outingHabitats: {
                  outingAutonomous: minimalOutingAutonomous(),
                  habitats: { entries: [habitatEntryFull()] },
                },
                attraction: { entries: [] },
              },
              spawn: { entries: [] },
            },
            composition: {
              entries: [
                {
                  id: "k-Δ",
                  habitatId: "h-1",
                  composition: {
                    contextTags: ["tag-Δ"],
                    modifiers: [{ contextTag: "tag-Δ", variantId: "v-Δ" }],
                  },
                },
              ],
            },
          },
          story: {
            residents: ["res-Δ"],
            beats: [{ id: "beat-Ω", arrivals: ["res-Ω"], departures: ["res-Δ"] }],
            throughBeatId: "beat-Ω",
          },
        },
        arcs: {
          arcs: [{ residentId: "res-Δ", arc: "arc-Δ" }],
          beats: [{ id: "beat-Ω", changes: [{ residentId: "res-Δ", arc: "arc-Ω" }] }],
          throughBeatId: "beat-Ω",
        },
      },
      labour: {
        jobs: [job({ jobId: "job-Δ", workerId: "res-Δ", zoneId: "zone-Δ", workplaceRecipeId: "recipe-Δ" })],
        context: {
          zoneHabitats: { "zone-Δ": solved("recipe-Δ") },
          residentsPresent: { "zone-Δ": ["res-Δ"] },
          stockedZones: new Set<string>(),
        },
      },
    });
    expect(result.labour.statuses).toEqual([
      { jobId: "job-Δ", workerId: "res-Δ", zoneId: "zone-Δ", workplaceRecipeId: "recipe-Δ", running: true, idleReason: null, waitsAtWorkplace: false },
    ]);
    expect(
      result.outingAttractionSpawnCompositionStoryArcs.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants,
    ).toEqual(["v-Δ"]);
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour");
    }
  });
});
