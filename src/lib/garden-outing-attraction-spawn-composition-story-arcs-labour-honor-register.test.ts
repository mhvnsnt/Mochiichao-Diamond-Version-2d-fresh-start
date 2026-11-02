 // S14 slice 59 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register bundle (pure library).
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


// Slice 58 imports (the bundle this slice composes) + register read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs,
  type HonorInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor";
import { honorAccount, type HonorSource } from "./garden-honor";
import {
  allResidents,
  assignHome,
  emptyRegister,
  homeRecognised,
  registerResident,
  registerSummary,
  type GardenRegister,
} from "./garden-register";


// S14 slice 59 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register bundle (pure library).
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs,
  type RegisterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register (B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register)", () => {
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

  function fullCache(): Record<string, ReturnType<typeof solved> | null> {
    return { "zone-1": solved("recipe-x"), "zone-2": solved("recipe-z") };
  }

  function minimalRegister(): RegisterInputs {
    return { register: {}, zoneHabitats: {} };
  }

  function fullRegister(): RegisterInputs {
    let reg: GardenRegister = emptyRegister();
    reg = registerResident(reg, "res-a", ["band-a"]);
    reg = registerResident(reg, "res-b");
    reg = registerResident(reg, "res-c");
    reg = assignHome(reg, "res-a", "zone-1", "recipe-x");
    reg = assignHome(reg, "res-b", "zone-1", "recipe-y");
    return { register: reg, zoneHabitats: fullCache() };
  }

  function minimalRegisterInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: minimalRegister(),
    };
  }

  function fullRegisterInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonor: fullHonorInputs(),
      register: fullRegister(),
    };
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(minimalRegisterInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(minimalHonorInputs()),
    );
    expect(result.register).toEqual({ entries: [], summary: { listed: 0, assigned: 0, unassigned: 0 }, recognised: {} });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(fullRegisterInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(fullHonorInputs()),
    );
    const reg = fullRegister();
    expect(result.register.entries).toEqual(allResidents(reg.register));
    expect(result.register.summary).toEqual(registerSummary(reg.register));
    expect(result.register.recognised).toEqual({
      "res-a": homeRecognised(reg.register, "res-a", reg.zoneHabitats),
      "res-b": homeRecognised(reg.register, "res-b", reg.zoneHabitats),
      "res-c": homeRecognised(reg.register, "res-c", reg.zoneHabitats),
    });
    // Hand-checked: res-a zone-1/recipe-x matches cache recipe-x -> true;
    // res-b zone-1/recipe-y against cache recipe-x -> false;
    // res-c unassigned -> null; listed 3, assigned 2, unassigned 1.
    expect(result.register).toEqual({
      entries: [
        { residentId: "res-a", homeZoneId: "zone-1", homeRecipeId: "recipe-x", preferences: ["band-a"] },
        { residentId: "res-b", homeZoneId: "zone-1", homeRecipeId: "recipe-y", preferences: [] },
        { residentId: "res-c", homeZoneId: null, homeRecipeId: null, preferences: [] },
      ],
      summary: { listed: 3, assigned: 2, unassigned: 1 },
      recognised: { "res-a": true, "res-b": false, "res-c": null },
    });
    // Inherited honour numbers from the slice-58 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "src-b", count: 3 },
        { sourceId: "src-a", count: 7 },
        { sourceId: "src-c", count: 0 },
      ],
      sourceCount: 3,
    });
    // Inherited labour numbers from the slice-57 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor.outingAttractionSpawnCompositionStoryArcsLabour.labour.summary).toEqual({
      total: 5, running: 3, idle: 2,
      byReason: { "no-workplace": 1, unstocked: 1, "no-partner": 0 },
    });
    // Inherited arcs numbers from the slice-56 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
  });

  it("bundle-only and register-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: fullHonorInputs(),
      register: minimalRegister(),
    });
    expect(bundleOnly.register).toEqual({ entries: [], summary: { listed: 0, assigned: 0, unassigned: 0 }, recognised: {} });
    const registerOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: fullRegister(),
    });
    expect(registerOnly.register.summary).toEqual({ listed: 3, assigned: 2, unassigned: 1 });
    expect(registerOnly.register.recognised).toEqual({ "res-a": true, "res-b": false, "res-c": null });
  });

  it("an unassigned resident still lists, reads null, and changes no assigned count; a zone-only home is recognised by any solved habitat in its zone", () => {
    let reg: GardenRegister = emptyRegister();
    reg = registerResident(reg, "res-a");
    reg = assignHome(reg, "res-a", "zone-1", "recipe-x");
    reg = registerResident(reg, "res-u");
    reg = registerResident(reg, "res-z");
    reg = assignHome(reg, "res-z", "zone-2", null);
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: { register: reg, zoneHabitats: fullCache() },
    });
    expect(result.register.entries.map((e) => e.residentId)).toEqual(["res-a", "res-u", "res-z"]);
    expect(result.register.summary).toEqual({ listed: 3, assigned: 2, unassigned: 1 });
    expect(result.register.recognised).toEqual({ "res-a": true, "res-u": null, "res-z": true });
  });

  it("register re-read: adding a resident re-reads the whole register, never a stored listing", () => {
    const beforeReg = fullRegister().register;
    const before = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: { register: beforeReg, zoneHabitats: fullCache() },
    });
    expect(before.register.summary).toEqual({ listed: 3, assigned: 2, unassigned: 1 });
    const afterReg = registerResident(beforeReg, "res-d");
    const after = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: { register: afterReg, zoneHabitats: fullCache() },
    });
    expect(after.register.summary).toEqual({ listed: 4, assigned: 2, unassigned: 2 });
    expect(after.register.recognised["res-d"]).toBeNull();
    // The earlier register object is untouched: re-reading it still gives the old counts.
    expect(allResidents(beforeReg).map((e) => e.residentId)).toEqual(["res-a", "res-b", "res-c"]);
    expect(registerSummary(beforeReg)).toEqual({ listed: 3, assigned: 2, unassigned: 1 });
  });

  it("exact result shape: two sections only, register exactly entries + summary + recognised", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(fullRegisterInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingAttractionSpawnCompositionStoryArcsLabourHonor",
      "register",
    ]);
    expect(Object.keys(result.register).sort()).toEqual(["entries", "recognised", "summary"]);
    expect(Object.keys(result.register.summary).sort()).toEqual(["assigned", "listed", "unassigned"]);
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonor).not.toHaveProperty("register");
  });

  it("side-by-side-not-merged: same register input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: fullRegister(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(fullRegisterInputs());
    expect(withMinimal.register).toEqual(withFull.register);
    // And the bundle's own habitats never leak into recognition:
    // the register's zone-9 home reads false from the caller cache
    // alone, even though the full bundle carries solved habitats.
    let reg: GardenRegister = emptyRegister();
    reg = registerResident(reg, "res-q");
    reg = assignHome(reg, "res-q", "zone-9", "recipe-q");
    const zoned = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: fullHonorInputs(),
      register: { register: reg, zoneHabitats: fullCache() },
    });
    expect(zoned.register.recognised).toEqual({ "res-q": false });
  });

  it("side-by-side-not-chained: register comes from the caller, not from the bundle's story, arc, or labour residents", () => {
    let reg: GardenRegister = emptyRegister();
    reg = registerResident(reg, "r-9");
    reg = registerResident(reg, "r-10");
    reg = assignHome(reg, "r-10", "zone-1", "recipe-x");
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: fullHonorInputs(),
      register: { register: reg, zoneHabitats: fullCache() },
    });
    // The bundle carries story residents c-2/c-3/c-4, arc residents
    // c-1/c-2/c-3, and labour workers — the register never borrows
    // any of them: r-9/r-10 only, on the caller register alone.
    expect(result.register.entries.map((e) => e.residentId)).toEqual(["r-9", "r-10"]);
    expect(result.register.recognised).toEqual({ "r-9": null, "r-10": true });
    // Counter-proof: an empty register reads empty even though the
    // bundle still carries its story, arc, and labour residents.
    const empty = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: fullHonorInputs(),
      register: minimalRegister(),
    });
    expect(empty.register).toEqual({ entries: [], summary: { listed: 0, assigned: 0, unassigned: 0 }, recognised: {} });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({ register: fullRegister() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
        register: { register: [] as never, zoneHabitats: {} },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
        register: { register: {}, zoneHabitats: [] as never },
      }),
    ).toThrow();
    // Register failure propagation: an entry with an empty residentId.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
        register: {
          register: { "x-1": { residentId: "", homeZoneId: "zone-1", homeRecipeId: "recipe-x", preferences: [] } } as never,
          zoneHabitats: fullCache(),
        },
      }),
    ).toThrow();
    // Honour failure propagation through the slice-58 bundle: a duplicate honour source id.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: {
          outingAttractionSpawnCompositionStoryArcsLabour: minimalLabourInputs(),
          honor: { sources: [src("dup", 1), src("dup", 2)] },
        },
        register: minimalRegister(),
      }),
    ).toThrow(/Duplicate honour source id/);
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
        outingAttractionSpawnCompositionStoryArcsLabourHonor: {
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
        },
        register: minimalRegister(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullRegisterInputs();
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(inputs);
    first.register.entries[0].homeZoneId = "zone-fake";
    (first.register.entries[0].preferences as string[]).push("band-fake");
    first.register.entries.push({ residentId: "fake", homeZoneId: null, homeRecipeId: null, preferences: [] });
    first.register.summary.listed = 0;
    first.register.recognised["res-a"] = false;
    first.outingAttractionSpawnCompositionStoryArcsLabourHonor.honor.entries[0].count = 999;
    first.outingAttractionSpawnCompositionStoryArcsLabourHonor.outingAttractionSpawnCompositionStoryArcsLabour.labour.statuses[0].running = false;
    first.outingAttractionSpawnCompositionStoryArcsLabourHonor.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs.arcs[0].arc = "arc-fake";
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(inputs);
    expect(second.register).toEqual({
      entries: [
        { residentId: "res-a", homeZoneId: "zone-1", homeRecipeId: "recipe-x", preferences: ["band-a"] },
        { residentId: "res-b", homeZoneId: "zone-1", homeRecipeId: "recipe-y", preferences: [] },
        { residentId: "res-c", homeZoneId: null, homeRecipeId: null, preferences: [] },
      ],
      summary: { listed: 3, assigned: 2, unassigned: 1 },
      recognised: { "res-a": true, "res-b": false, "res-c": null },
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonor.honor.entries[0]).toEqual({ sourceId: "src-b", count: 3 });
    expect(inputs.register.register ? Object.keys(inputs.register.register) : []).toEqual(["res-a", "res-b", "res-c"]);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonor.honor.sources.map((s) => s.id)).toEqual(["src-b", "src-a", "src-c"]);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonor.outingAttractionSpawnCompositionStoryArcsLabour.outingAttractionSpawnCompositionStoryArcs.arcs.beats.map((b) => b.id)).toEqual(["ar-1", "ar-2", "ar-3"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    let reg: GardenRegister = emptyRegister();
    reg = registerResident(reg, "res-Δ", ["band-Ω"]);
    reg = assignHome(reg, "res-Δ", "zone-Δ", "recipe-Δ");
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister({
      outingAttractionSpawnCompositionStoryArcsLabourHonor: minimalHonorInputs(),
      register: { register: reg, zoneHabitats: { "zone-Δ": solved("recipe-Δ") } },
    });
    expect(result.register).toEqual({
      entries: [{ residentId: "res-Δ", homeZoneId: "zone-Δ", homeRecipeId: "recipe-Δ", preferences: ["band-Ω"] }],
      summary: { listed: 1, assigned: 1, unassigned: 0 },
      recognised: { "res-Δ": true },
    });
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register");
    }
  });
});
