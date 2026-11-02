 // S14 slice 58 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour bundle (pure library).
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


 // Slice 57 imports (the bundle this slice composes) + labour read imports.
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


// S14 slice 58 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour bundle (pure library).
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs,
  type HonorInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor";
import { honorAccount, type HonorSource } from "./garden-honor";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor (B3 outing + attraction + spawn + composition + story + arcs + labour + honour)", () => {
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

  function src(id: string, count: number): HonorSource {
    return { id, count };
  }

  function minimalHonor(): HonorInputs {
    return { sources: [] };
  }

  function fullHonor(): HonorInputs {
    return { sources: [src("src-b", 3), src("src-a", 7), src("src-c", 0)] };
  }

  function minimalHonorInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: minimalHonor(),
    };
  }

  function fullHonorInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabour: fullLabourInputs(),
      honor: fullHonor(),
    };
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(minimalHonorInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabour(minimalLabourInputs()),
    );
    expect(result.honor).toEqual({ total: 0, entries: [], sourceCount: 0 });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(fullHonorInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabour(fullLabourInputs()),
    );
    expect(result.honor).toEqual(honorAccount(fullHonor().sources));
    // Hand-checked: src-b 3 + src-a 7 + src-c 0 = 10 over 3 sources, in caller order.
    expect(result.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "src-b", count: 3 },
        { sourceId: "src-a", count: 7 },
        { sourceId: "src-c", count: 0 },
      ],
      sourceCount: 3,
    });
    // Inherited labour numbers from the slice-57 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour.labour.statuses).toEqual(
      labourStatuses(fullLabour().jobs, fullLabour().context),
    );
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour.labour.summary).toEqual({
      total: 5, running: 3, idle: 2,
      byReason: { "no-workplace": 1, unstocked: 1, "no-partner": 0 },
    });
    // Inherited arcs numbers from the slice-56 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
  });

  it("bundle-only and honour-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: fullLabourInputs(),
      honor: minimalHonor(),
    });
    expect(bundleOnly.honor).toEqual({ total: 0, entries: [], sourceCount: 0 });
    const honorOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: fullHonor(),
    });
    expect(honorOnly.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "src-b", count: 3 },
        { sourceId: "src-a", count: 7 },
        { sourceId: "src-c", count: 0 },
      ],
      sourceCount: 3,
    });
  });

  it("a zero-count source still lists, and changes no total", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: { sources: [src("src-a", 5), src("src-b", 0)] },
    });
    expect(result.honor).toEqual({
      total: 5,
      entries: [
        { sourceId: "src-a", count: 5 },
        { sourceId: "src-b", count: 0 },
      ],
      sourceCount: 2,
    });
  });

  it("honour re-read: adding a source re-reads the whole account, never a stored balance", () => {
    const before = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: { sources: [src("src-a", 5), src("src-b", 5)] },
    });
    expect(before.honor.total).toBe(10);
    const after = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: { sources: [src("src-a", 5), src("src-b", 5), src("src-c", 2)] },
    });
    expect(after.honor).toEqual({
      total: 12,
      entries: [
        { sourceId: "src-a", count: 5 },
        { sourceId: "src-b", count: 5 },
        { sourceId: "src-c", count: 2 },
      ],
      sourceCount: 3,
    });
    // The earlier list is untouched: re-reading it still gives the old total.
    expect(honorAccount([src("src-a", 5), src("src-b", 5)]).total).toBe(10);
  });

  it("exact result shape: two sections only, honour exactly total + entries + sourceCount", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(fullHonorInputs());
    expect(Object.keys(result).sort()).toEqual([
      "honor",
      "outingAttractionSpawnCompositionStoryArcsLabour",
    ]);
    expect(Object.keys(result.honor).sort()).toEqual(["entries", "sourceCount", "total"]);
    expect(result.outingAttractionSpawnCompositionStoryArcsLabour).not.toHaveProperty("honor");
  });

  it("side-by-side-not-merged: same honour input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      honor: fullHonor(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(fullHonorInputs());
    expect(withMinimal.honor).toEqual(withFull.honor);
    // And the bundle's own labour jobs never leak into honour:
    // the honour entries are the caller's src-b/src-a/src-c, nothing else.
    expect(withFull.honor.entries.map((e) => e.sourceId)).toEqual(["src-b", "src-a", "src-c"]);
  });

  it("side-by-side-not-chained: honour comes from the caller, not from the bundle's labour, thanks, or level", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: fullLabourInputs(),
      honor: { sources: [src("h-9", 4), src("h-10", 6)] },
    });
    // The bundle carries running labour jobs and its own thanks/level
    // sections; honour never borrows any of them — h-9 + h-10 = 10
    // on the caller sources alone.
    expect(result.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "h-9", count: 4 },
        { sourceId: "h-10", count: 6 },
      ],
      sourceCount: 2,
    });
    // Counter-proof: the same sources with an empty-source list read
    // as an empty account even though the bundle still carries its
    // running jobs and thanks/level sections.
    const empty = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: fullLabourInputs(),
      honor: minimalHonor(),
    });
    expect(empty.honor).toEqual({ total: 0, entries: [], sourceCount: 0 });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({ honor: fullHonor() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
        honor: { sources: "nope" as never },
      }),
    ).toThrow();
    // Duplicate honour source id: loud failure, never a silent merge.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
        honor: { sources: [src("dup", 1), src("dup", 2)] },
      }),
    ).toThrow(/Duplicate honour source id/);
    // Honour failure propagation: a negative count.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
        honor: { sources: [src("neg", -1)] },
      }),
    ).toThrow();
    // Labour failure propagation: a job with an empty jobId.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: {
          outingAttractionSpawnCompositionStoryArcs: minimalArcsInputs(),
          labour: { jobs: [job({ jobId: "" })], context: labourContext() },
        },
        honor: fullHonor(),
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
        outingAttractionSpawnCompositionStoryArcsLabour: {
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
        },
        honor: fullHonor(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullHonorInputs();
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(inputs);
    first.honor.entries[0].count = 999;
    first.honor.entries.push({ sourceId: "fake", count: 1 });
    first.outingAttractionSpawnCompositionStoryArcsLabour.labour.statuses[0].running = false;
    first.outingAttractionSpawnCompositionStoryArcsLabour.labour.summary.running = 0;
    first.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs.arcs[0].arc = "arc-fake";
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(inputs);
    expect(second.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "src-b", count: 3 },
        { sourceId: "src-a", count: 7 },
        { sourceId: "src-c", count: 0 },
      ],
      sourceCount: 3,
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabour.labour.statuses[0]).toEqual({
      jobId: "j-run", workerId: "worker-a", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", running: true, idleReason: null, waitsAtWorkplace: false,
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs.arcs[0]).toEqual({ residentId: "c-1", arc: "arc-a" });
    expect(inputs.honor.sources.map((s) => s.id)).toEqual(["src-b", "src-a", "src-c"]);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabour.labour.jobs.map((j) => j.jobId)).toEqual(["j-run", "j-stock", "j-social", "j-field", "j-nowork"]);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs.beats.map((b) => b.id)).toEqual(["ar-1", "ar-2", "ar-3"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor({
      outingAttractionSpawnCompositionStoryArcsLabour: {
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
      },
      honor: { sources: [src("hon-Δ", 11), src("hon-Ω", 0)] },
    });
    expect(result.honor).toEqual({
      total: 11,
      entries: [
        { sourceId: "hon-Δ", count: 11 },
        { sourceId: "hon-Ω", count: 0 },
      ],
      sourceCount: 2,
    });
    expect(
      result.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants,
    ).toEqual(["v-Δ"]);
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor");
    }
  });
});
