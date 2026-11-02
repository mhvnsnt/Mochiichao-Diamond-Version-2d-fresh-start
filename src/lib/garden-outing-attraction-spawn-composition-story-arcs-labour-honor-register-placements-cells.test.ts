 // S14 slice 61 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements bundle (pure library).
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


// S14 slice 59 imports (the bundle this slice composes) + register read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs,
  type RegisterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register";


// S14 slice 60 imports (the bundle this slice composes) + placements read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs,
  type PlacementsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements";
import {
  newGardenRecord,
  recomputeHabitats,
  setPlacementCell,
  type GardenSaveRecord,
} from "./garden-wiring";


// S14 slice 61 imports (the bundle this slice composes) + cells read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
  type CellsInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells";
import { placementCellsInZone } from "./garden-wiring";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells (B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells)", () => {
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

  function pairRecipe(): HabitatRecipe {
    return { id: "hab-a", tier: 1, requires: [{ item: "item-a", count: 2 }] };
  }

  function zonedRecipe(): HabitatRecipe {
    return { id: "hab-z", tier: 2, requires: [{ item: "item-a", count: 1 }], zone: "zone-a" };
  }

  function catRecipe(): HabitatRecipe {
    return { id: "hab-cat", tier: 1, requires: [{ category: "cat-a", count: 1 }] };
  }

  function fullPlacementsRecord(): GardenSaveRecord {
    let rec = newGardenRecord("sp-a", 1);
    rec = setPlacementCell(rec, "zone-a", "0,0", { itemId: "item-a", rotation: 0 });
    rec = setPlacementCell(rec, "zone-a", "0,1", { itemId: "item-a", rotation: 90 });
    rec = setPlacementCell(rec, "zone-b", "9,9", { itemId: "item-b", rotation: 0 });
    return rec;
  }

  function minimalPlacements(): PlacementsInputs {
    return { record: newGardenRecord("sp-a", 1), recipes: [] };
  }

  function fullPlacements(): PlacementsInputs {
    return { record: fullPlacementsRecord(), recipes: [pairRecipe(), zonedRecipe()] };
  }

  function minimalPlacementsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegister: minimalRegisterInputs(),
      placements: minimalPlacements(),
    };
  }

  function fullPlacementsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegister: fullRegisterInputs(),
      placements: fullPlacements(),
    };
  }
  function minimalCells(): CellsInputs {
    return { record: newGardenRecord("sp-a", 1), zoneId: "zone-a" };
  }

  function fullCells(): CellsInputs {
    return { record: fullPlacementsRecord(), zoneId: "zone-a" };
  }

  function minimalCellsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: minimalCells(),
    };
  }

  function fullCellsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: fullCells(),
    };
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(minimalCellsInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements(minimalPlacementsInputs()),
    );
    expect(result.cells).toEqual({ zoneId: "zone-a", cells: [] });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(fullCellsInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements(fullPlacementsInputs()),
    );
    const cellsIn = fullCells();
    expect(result.cells.cells).toEqual(placementCellsInZone(cellsIn.record, cellsIn.zoneId));
    // Hand-checked: zone-a carries two cells in record order — "0,0" item-a
    // rotation 0, then "0,1" item-a rotation 90; zone-b's single cell is not
    // in this zone's listing.
    expect(result.cells).toEqual({
      zoneId: "zone-a",
      cells: [
        { key: "0,0", cell: { itemId: "item-a", rotation: 0 } },
        { key: "0,1", cell: { itemId: "item-a", rotation: 90 } },
      ],
    });
    // Inherited placements numbers from the slice-60 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements).toEqual({
      habitats: {
        "zone-a": { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
        "zone-b": null,
      },
      zones: ["zone-a", "zone-b"],
    });
    // Inherited register numbers from the slice-59 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister.register).toEqual({
      entries: [
        { residentId: "res-a", homeZoneId: "zone-1", homeRecipeId: "recipe-x", preferences: ["band-a"] },
        { residentId: "res-b", homeZoneId: "zone-1", homeRecipeId: "recipe-y", preferences: [] },
        { residentId: "res-c", homeZoneId: null, homeRecipeId: null, preferences: [] },
      ],
      summary: { listed: 3, assigned: 2, unassigned: 1 },
      recognised: { "res-a": true, "res-b": false, "res-c": null },
    });
    // Inherited honour numbers from the slice-58 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister.outingAttractionSpawnCompositionStoryArcsLabourHonor.honor).toEqual({
      total: 10,
      entries: [
        { sourceId: "src-b", count: 3 },
        { sourceId: "src-a", count: 7 },
        { sourceId: "src-c", count: 0 },
      ],
      sourceCount: 3,
    });
  });

  it("bundle-only and cells-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: minimalCells(),
    });
    expect(bundleOnly.cells).toEqual({ zoneId: "zone-a", cells: [] });
    const cellsOnly = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: fullCells(),
    });
    expect(cellsOnly.cells.cells).toEqual([
      { key: "0,0", cell: { itemId: "item-a", rotation: 0 } },
      { key: "0,1", cell: { itemId: "item-a", rotation: 90 } },
    ]);
    expect(cellsOnly.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister.register.summary).toEqual({ listed: 0, assigned: 0, unassigned: 0 });
  });

  it("cells re-read: adding a cell re-reads the whole list, never a stored list", () => {
    let rec = newGardenRecord("sp-a", 1);
    rec = setPlacementCell(rec, "zone-a", "0,0", { itemId: "item-a", rotation: 0 });
    const before = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: rec, zoneId: "zone-a" },
    });
    expect(before.cells).toEqual({ zoneId: "zone-a", cells: [{ key: "0,0", cell: { itemId: "item-a", rotation: 0 } }] });
    const afterRec = setPlacementCell(rec, "zone-a", "0,1", { itemId: "item-a", rotation: 90 });
    const after = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: afterRec, zoneId: "zone-a" },
    });
    expect(after.cells.cells).toEqual([
      { key: "0,0", cell: { itemId: "item-a", rotation: 0 } },
      { key: "0,1", cell: { itemId: "item-a", rotation: 90 } },
    ]);
    // The earlier record is untouched: re-reading it still gives the old list.
    expect(placementCellsInZone(rec, "zone-a")).toEqual([{ key: "0,0", cell: { itemId: "item-a", rotation: 0 } }]);
    expect(Object.keys(rec.placements ?? {})).toEqual(["zone-a"]);
  });

  it("caller-named zone: zone-b, an absent zone, and a zone the bundle never names", () => {
    const rec = fullPlacementsRecord();
    const zoneB = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: rec, zoneId: "zone-b" },
    });
    expect(zoneB.cells).toEqual({ zoneId: "zone-b", cells: [{ key: "9,9", cell: { itemId: "item-b", rotation: 0 } }] });
    const absent = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: rec, zoneId: "zone-none" },
    });
    expect(absent.cells).toEqual({ zoneId: "zone-none", cells: [] });
    // A zone the bundle's placements section never solves still reads its
    // own cells: the caller names it, the bundle's zone list never picks it.
    let rec2 = newGardenRecord("sp-a", 1);
    rec2 = setPlacementCell(rec2, "zone-only-cells", "1,2", { itemId: "item-q", rotation: 45 });
    const onlyCells = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: rec2, zoneId: "zone-only-cells" },
    });
    expect(onlyCells.cells).toEqual({ zoneId: "zone-only-cells", cells: [{ key: "1,2", cell: { itemId: "item-q", rotation: 45 } }] });
    expect(onlyCells.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.zones).toEqual([]);
  });

  it("exact result shape: two sections only, cells exactly zoneId + cells", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(fullCellsInputs());
    expect(Object.keys(result).sort()).toEqual([
      "cells",
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements",
    ]);
    expect(Object.keys(result.cells).sort()).toEqual(["cells", "zoneId"]);
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements).not.toHaveProperty("cells");
    expect(result.cells).not.toHaveProperty("record");
    expect(result.cells.cells[0]).toEqual({ key: "0,0", cell: { itemId: "item-a", rotation: 0 } });
    expect(Object.keys(result.cells.cells[0].cell).sort()).toEqual(["itemId", "rotation"]);
  });

  it("side-by-side-not-merged: same cells input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: fullCells(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: fullCells(),
    });
    expect(withMinimal.cells).toEqual(withFull.cells);
    expect(withMinimal.cells.cells).toEqual([
      { key: "0,0", cell: { itemId: "item-a", rotation: 0 } },
      { key: "0,1", cell: { itemId: "item-a", rotation: 90 } },
    ]);
  });

  it("side-by-side-not-chained: cells never feed placements, and placements never add a cell", () => {
    // Same bundle inputs, cells zone-a vs zone-b: the placements section
    // is identical either way — listing cells never solves or re-solves.
    const zoneA = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: { record: fullPlacementsRecord(), zoneId: "zone-a" },
    });
    const zoneB = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: { record: fullPlacementsRecord(), zoneId: "zone-b" },
    });
    expect(zoneA.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements).toEqual(
      zoneB.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements,
    );
    // The reverse: zone-b's cell lists even though its placements solve
    // reads null — a null solve never hides a placed cell.
    expect(zoneB.cells).toEqual({ zoneId: "zone-b", cells: [{ key: "9,9", cell: { itemId: "item-b", rotation: 0 } }] });
    expect(zoneB.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.habitats["zone-b"]).toBeNull();
    // And an empty cells section still reads the placements normally.
    const emptyCells = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: fullPlacementsInputs(),
      cells: minimalCells(),
    });
    expect(emptyCells.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.habitats["zone-a"]).toEqual({ recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({ cells: fullCells() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
        cells: { record: [] as never, zoneId: "zone-a" },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
        cells: { record: newGardenRecord("sp-a", 1), zoneId: "" },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
        cells: { record: newGardenRecord("sp-a", 1), zoneId: 7 as never },
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: {
          outingAttractionSpawnCompositionStoryArcsLabourHonorRegister: {
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
          },
          placements: fullPlacements(),
        },
        cells: fullCells(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullCellsInputs();
    const beforeRecordJson = JSON.stringify(inputs.cells.record);
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(inputs);
    first.cells.cells[0].cell.itemId = "item-fake";
    first.cells.cells[0].cell.rotation = 999;
    first.cells.cells.push({ key: "fake", cell: { itemId: "item-fake", rotation: 0 } });
    first.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.habitats["zone-a"] = null;
    first.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.zones.push("zone-fake");
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(inputs);
    expect(second.cells).toEqual({
      zoneId: "zone-a",
      cells: [
        { key: "0,0", cell: { itemId: "item-a", rotation: 0 } },
        { key: "0,1", cell: { itemId: "item-a", rotation: 90 } },
      ],
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements).toEqual({
      habitats: {
        "zone-a": { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
        "zone-b": null,
      },
      zones: ["zone-a", "zone-b"],
    });
    expect(JSON.stringify(inputs.cells.record)).toBe(beforeRecordJson);
    expect(inputs.cells.zoneId).toBe("zone-a");
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.recipes.map((r) => r.id)).toEqual(["hab-a", "hab-z"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    let rec = newGardenRecord("sp-Δ", 1);
    rec = setPlacementCell(rec, "zone-Δ", "Δ,Δ", { itemId: "item-Δ", rotation: 33 });
    rec = setPlacementCell(rec, "zone-Δ", "Δ,Ω", { itemId: "item-Ω", rotation: 0 });
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: minimalPlacementsInputs(),
      cells: { record: rec, zoneId: "zone-Δ" },
    });
    expect(result.cells).toEqual({
      zoneId: "zone-Δ",
      cells: [
        { key: "Δ,Δ", cell: { itemId: "item-Δ", rotation: 33 } },
        { key: "Δ,Ω", cell: { itemId: "item-Ω", rotation: 0 } },
      ],
    });
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells");
    }
  });
});
