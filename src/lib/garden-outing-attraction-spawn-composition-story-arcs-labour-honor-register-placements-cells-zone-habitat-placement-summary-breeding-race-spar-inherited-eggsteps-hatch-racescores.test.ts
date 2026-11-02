// S14 slice 71 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores bundle (pure library).
 // S14 slice 66 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + spar bundle (pure library).
 // S14 slice 67 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + spar + spar bundle (pure library).
 // S14 slice 65 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding bundle (pure library).
 // S14 slice 62 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone-habitat bundle (pure library).
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


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs,
  type RegisterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register";


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


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
  type CellsInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells";
import { placementCellsInZone } from "./garden-wiring";


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs,
  type ZoneHabitatInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat";
import { solveZoneHabitat } from "./garden-wiring";


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs,
  type PlacementInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement";
import { zonePlacementToHabitatPlacement } from "./garden-wiring";


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs,
  type SummaryInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary";
import { gardenSummary } from "./garden-wiring";


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


function minimalZoneHabitat(): ZoneHabitatInputs {
  return { record: newGardenRecord("sp-a", 1), zoneId: "zone-a", recipes: [] };
}

function fullZoneHabitat(): ZoneHabitatInputs {
  return { record: fullPlacementsRecord(), zoneId: "zone-a", recipes: [pairRecipe(), zonedRecipe()] };
}

function minimalZoneHabitatInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs {
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: minimalCellsInputs(),
    zoneHabitat: minimalZoneHabitat(),
  };
}

function fullZoneHabitatInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs {
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: fullCellsInputs(),
    zoneHabitat: fullZoneHabitat(),
  };
}

function minimalPlacement(): PlacementInputs {
  return { record: newGardenRecord("sp-a", 1), zoneId: "zone-a" };
}

function fullPlacement(): PlacementInputs {
  return { record: fullPlacementsRecord(), zoneId: "zone-a" };
}

function categoriesFor(itemId: string): readonly string[] {
  if (itemId === "item-a") return ["cat-a"];
  if (itemId === "item-b") return ["cat-b"];
  return [];
}

function fullPlacementWithCategories(): PlacementInputs {
  return { record: fullPlacementsRecord(), zoneId: "zone-a", categoriesFor };
}

function minimalPlacementInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs {
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: minimalZoneHabitatInputs(),
    placement: minimalPlacement(),
  };
}

function fullPlacementInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs {
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: fullZoneHabitatInputs(),
    placement: fullPlacement(),
  };
}


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs,
  type BreedingInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding";
import { canBreed } from "./garden-wiring";


import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs,
  type RaceInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race";

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs,
  type SparInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar";
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs,
  type InheritedInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited";
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs,
  type EggstepsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps";
// S14 slice 71 imports (the bundle this slice composes is slice 70) + race scores read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchInputs,
  type HatchInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch";
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresInputs,
  type RaceScoresInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores";
import { runRace, raceScore, runSpar, sparScore, inheritedGardenStats, tickEggSteps, hatchEgg } from "./garden-wiring";
import type { GardenStats } from "./mochiichao-systems";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores (B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores)", () => {
  function minimalSummary(): SummaryInputs {
    return { record: newGardenRecord("sp-a", 1) };
  }

  function fullSummary(): SummaryInputs {
    return {
      record: {
        ...fullPlacementsRecord(),
        garden: { dive: 10, glide: 0, sprint: 50, might: 0, endurance: 0 },
        bond: 42,
        rebirths: 2,
        mythic: true,
      },
    };
  }

  function minimalSummaryInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: minimalPlacementInputs(),
      summary: minimalSummary(),
    };
  }

  function fullSummaryInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: fullPlacementInputs(),
      summary: fullSummary(),
    };
  }

  function pairBothHigh(): BreedingInputs {
    return {
      parentA: { ...newGardenRecord("sp-a", 1), bond: 60 },
      parentB: { ...newGardenRecord("sp-b", 1), bond: 75 },
    };
  }

  function pairOneAtFifty(): BreedingInputs {
    return {
      parentA: { ...newGardenRecord("sp-a", 1), bond: 60 },
      parentB: { ...newGardenRecord("sp-b", 1), bond: 50 },
    };
  }

  function pairMythic(): BreedingInputs {
    return {
      parentA: { ...newGardenRecord("sp-a", 1), bond: 90, mythic: true },
      parentB: { ...newGardenRecord("sp-b", 1), bond: 90 },
    };
  }

  function pairBothLow(): BreedingInputs {
    return {
      parentA: newGardenRecord("sp-a", 1),
      parentB: newGardenRecord("sp-b", 1),
    };
  }

  function pairDelta(): BreedingInputs {
    return {
      parentA: { ...newGardenRecord("sp-Δ", 1), bond: 61 },
      parentB: { ...newGardenRecord("sp-Ω", 1), bond: 99 },
    };
  }

  function minimalBreedingInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: minimalSummaryInputs(),
      breeding: pairBothLow(),
    };
  }

  function fullBreedingInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: fullSummaryInputs(),
      breeding: pairBothHigh(),
    };
  }

  function racePairAWin(): RaceInputs {
    return { racerA: statsStrong(), racerB: statsWeak() };
  }

  function minimalRaceInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding: minimalBreedingInputs(),
      race: racePairAWin(),
    };
  }

  function fullRaceInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding: fullBreedingInputs(),
      race: racePairAWin(),
    };
  }

  function statsStrong(): GardenStats {
    return { dive: 10, glide: 10, sprint: 10, might: 20, endurance: 30 };
  }

  function statsWeak(): GardenStats {
    return { dive: 0, glide: 0, sprint: 5, might: 10, endurance: 10 };
  }

  function statsTieSpar(): GardenStats {
    return { dive: 4, glide: 6, sprint: 7, might: 10, endurance: 10 };
  }

  function statsDodgeHigh(): GardenStats {
    return { dive: 20, glide: 20, sprint: 5, might: 5, endurance: 5 };
  }

  function statsDodgeLow(): GardenStats {
    return { dive: 0, glide: 0, sprint: 5, might: 5, endurance: 5 };
  }

  function statsHuge(): GardenStats {
    return { dive: 99, glide: 99, sprint: 99, might: 99, endurance: 99 };
  }

  function sparAWin(): SparInputs {
    return { sparrerA: statsStrong(), sparrerB: statsWeak() };
  }

  function sparBWin(): SparInputs {
    return { sparrerA: statsWeak(), sparrerB: statsStrong() };
  }

  function sparTie(): SparInputs {
    return { sparrerA: statsTieSpar(), sparrerB: statsTieSpar() };
  }

  function sparDodge(): SparInputs {
    return { sparrerA: statsDodgeHigh(), sparrerB: statsDodgeLow() };
  }

  function minimalSparInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: minimalRaceInputs(),
      spar: sparAWin(),
    };
  }

  function fullSparInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: fullRaceInputs(),
      spar: sparAWin(),
    };
  }

  function parentHighLowA(): GardenStats {
    return { dive: 10, glide: 20, sprint: 30, might: 40, endurance: 50 };
  }

  function parentHighLowB(): GardenStats {
    return { dive: 90, glide: 5, sprint: 25, might: 35, endurance: 60 };
  }

  function parentClampA(): GardenStats {
    return { dive: 120, glide: -10, sprint: 99, might: 0, endurance: 50 };
  }

  function parentClampB(): GardenStats {
    return { dive: 50, glide: 20, sprint: 0, might: 99, endurance: -5 };
  }

  function inheritedHi(): InheritedInputs {
    return { parentA: parentHighLowA(), parentB: parentHighLowB(), seed70: 0 };
  }

  function inheritedLo(): InheritedInputs {
    return { parentA: parentHighLowA(), parentB: parentHighLowB(), seed70: 70 };
  }

  function inheritedClampHi(): InheritedInputs {
    return { parentA: parentClampA(), parentB: parentClampB(), seed70: 0 };
  }

  function inheritedClampLo(): InheritedInputs {
    return { parentA: parentClampA(), parentB: parentClampB(), seed70: 99 };
  }

  function minimalInheritedInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      inherited: inheritedHi(),
    };
  }

  function fullInheritedInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedHi(),
    };
  }

  function eggRecord(stepsRemaining: number): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-a", 1),
      egg: { speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining },
    };
  }

  function eggRecordNamed(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-Δ", 1),
      egg: { speciesId: "sp-Ω", parentA: "sp-Δ", parentB: "sp-Ω", stepsRemaining: 100 },
    };
  }

  function eggstepsTen(): EggstepsInputs {
    return { record: eggRecord(100), steps: 10 };
  }

  function minimalEggstepsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited: minimalInheritedInputs(),
      eggsteps: eggstepsTen(),
    };
  }

  function fullEggstepsInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited: fullInheritedInputs(),
      eggsteps: eggstepsTen(),
    };
  }

  function hatchReady(): HatchInputs {
    return { record: eggRecord(0) };
  }

  function hatchNotReady(): HatchInputs {
    return { record: eggRecord(40) };
  }

  function hatchNoEgg(): HatchInputs {
    return { record: newGardenRecord("sp-a", 1) };
  }

  function hatchReadyNamed(): HatchInputs {
    const named = eggRecordNamed();
    return {
      record: {
        ...named,
        egg: named.egg === null ? null : { ...named.egg, stepsRemaining: 0 },
      },
    };
  }


  function hatchReportOf(record: GardenSaveRecord) {
    const hatched = hatchEgg(record);
    return { record: hatched.rec, hatchedSpeciesId: hatched.hatchedSpeciesId };
  }

  function minimalHatchInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
      hatch: hatchReady(),
    };
  }

  function fullHatchInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: fullEggstepsInputs(),
      hatch: hatchReady(),
    };
  }

  function racePairA(): RaceScoresInputs {
    return {
      statsA: { dive: 10, glide: 20, sprint: 30, might: 40, endurance: 60 },
      statsB: { dive: 5, glide: 5, sprint: 25, might: 35, endurance: 50 },
    };
  }

  function racePairFade(): RaceScoresInputs {
    return {
      statsA: { dive: 0, glide: 0, sprint: 10, might: 0, endurance: 10 },
      statsB: { dive: 0, glide: 0, sprint: 0, might: 0, endurance: 50 },
    };
  }

  function racePairTie(): RaceScoresInputs {
    return {
      statsA: { dive: 7, glide: 8, sprint: 9, might: 10, endurance: 11 },
      statsB: { dive: 7, glide: 8, sprint: 9, might: 10, endurance: 11 },
    };
  }

  function racePairHuge(): RaceScoresInputs {
    return {
      statsA: { dive: 99, glide: 99, sprint: 99, might: 99, endurance: 99 },
      statsB: { dive: 1, glide: 1, sprint: 1, might: 1, endurance: 1 },
    };
  }

  function minimalRaceScoresInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(),
      raceScores: racePairA(),
    };
  }

  function fullRaceScoresInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: fullHatchInputs(),
      raceScores: racePairA(),
    };
  }

  type Bundle69 = ReturnType<typeof gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps>;
  function sparOf(bundle: Bundle69) {
    return bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar;
  }
  function breedingOf(bundle: Bundle69) {
    return bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding;
  }
  function zoneHabitatOf(bundle: Bundle69) {
    return bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat;
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(minimalRaceScoresInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(minimalEggstepsInputs()),
    );
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(hatchReportOf(eggRecord(0)));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-a");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toBeNull();
    expect(result.raceScores).toEqual({ scoreA: 100, scoreB: 60 });
    expect(result.raceScores).toEqual({ scoreA: raceScore(racePairA().statsA), scoreB: raceScore(racePairA().statsB) });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(fullRaceScoresInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(fullEggstepsInputs()),
    );
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(hatchReportOf(eggRecord(0)));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-a");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toBeNull();
    expect(result.raceScores).toEqual({ scoreA: 100, scoreB: 60 });
    // Inherited eggsteps section, hand-checked from slice 69: 100 steps counted down by 10.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.eggsteps.record.egg).toEqual({ speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining: 90 });
    // Inherited spar winner, race winner, breeding gate, summary, placement cells, zone-habitat solve, hand-checked from slices 67/66/65/64/63/62.
    expect(sparOf(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ winner: "A" });
    expect(breedingOf(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ canBreed: true });
    expect(zoneHabitatOf(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
  });

  it("full and minimal bundles with different hatch inputs, including no egg and not ready", () => {
    const fullReady = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: fullEggstepsInputs(),
        hatch: hatchReady(),
      },
      raceScores: racePairA(),
    });
    expect(fullReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-a");
    expect(fullReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toBeNull();
    expect(fullReady.raceScores).toEqual({ scoreA: 100, scoreB: 60 });
    const minimalNotReady = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
        hatch: hatchNotReady(),
      },
      raceScores: racePairA(),
    });
    expect(minimalNotReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(hatchReportOf(eggRecord(40)));
    expect(minimalNotReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBeNull();
    expect(minimalNotReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toEqual({ speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining: 40 });
    const noEgg = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
        hatch: hatchNoEgg(),
      },
      raceScores: racePairA(),
    });
    expect(noEgg.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record).toEqual(newGardenRecord("sp-a", 1));
    expect(noEgg.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toBeNull();
    expect(noEgg.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBeNull();
  });

  it("hatch re-read: changing the record re-hatches the whole egg, never a stored hatch", () => {
    const hatched = (record: GardenSaveRecord) =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
          outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
          hatch: { record },
        },
        raceScores: racePairA(),
      }).outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch;
    expect(hatched(eggRecord(0)).hatchedSpeciesId).toBe("sp-a");
    expect(hatched(eggRecord(40)).hatchedSpeciesId).toBeNull();
    expect(hatched(newGardenRecord("sp-a", 1)).hatchedSpeciesId).toBeNull();
    expect(hatched(eggRecord(0)).hatchedSpeciesId).toBe("sp-a");
    expect(hatched(eggRecord(0)).record.egg).toBeNull();
    expect(hatched(eggRecord(40)).record.egg).toEqual({ speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining: 40 });
  });

  it("caller-named hatch record: an egg the bundle never names still hatches from its own numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
        hatch: hatchReadyNamed(),
      },
      raceScores: racePairA(),
    });
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-Ω");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.egg).toBeNull();
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.speciesId).toBe("sp-Δ");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(minimalEggstepsInputs()),
    );
    // The named hatch never picks a species from the bundle: the bundle's own egg is still sp-a at 90 steps.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.eggsteps.record.egg).toEqual({ speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining: 90 });
  });

  it("exact result shape: two sections only, race scores exactly two numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(minimalRaceScoresInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch",
      "raceScores",
    ]);
    expect(Object.keys(result.raceScores).sort()).toEqual(["scoreA", "scoreB"]);
    expect("raceScores" in result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch).toBe(false);
    expect("outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch" in result.raceScores).toBe(false);
    expect(Object.keys(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch).sort()).toEqual([
      "hatch",
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps",
    ]);
  });

  it("side-by-side-not-merged: same hatch input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
        hatch: hatchReady(),
      },
      raceScores: racePairA(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: fullEggstepsInputs(),
        hatch: hatchReady(),
      },
      raceScores: racePairA(),
    });
    expect(withMinimal.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(withFull.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch);
    expect(withMinimal.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(hatchReportOf(eggRecord(0)));
  });

  it("side-by-side-not-chained: a hatched egg never feeds the bundle, and the bundle never hatches an egg", () => {
    const base = {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: fullEggstepsInputs(),
    };
    const ready = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: { ...base, hatch: hatchReady() }, raceScores: racePairA() });
    const notReady = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: { ...base, hatch: hatchNotReady() }, raceScores: racePairA() });
    expect(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps).toEqual(
      notReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
    );
    expect(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(fullEggstepsInputs()),
    );
    // A hatched egg still reads the bundle zone-habitat solve normally, never re-gates the breeding pair, and never re-spars the pair.
    expect(zoneHabitatOf(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
    expect(breedingOf(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ canBreed: true });
    expect(sparOf(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ winner: "A" });
  });

  it("loud failures", () => {
    const fn = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores;
    expect(() => fn(null as never)).toThrow();
    expect(() => fn("bundle" as never)).toThrow();
    expect(() => fn({} as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs() } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(), raceScores: null } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(), raceScores: { statsA: null, statsB: racePairA().statsB } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(), raceScores: { statsA: racePairA().statsA, statsB: [] } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: null, raceScores: racePairA() } as never)).toThrow();
    // Bundle failure propagation: a slice-70 bundle missing its hatch section, and one with a non-number eggsteps step count.
    const brokenBundle = minimalHatchInputs() as unknown as Record<string, unknown>;
    delete brokenBundle.hatch;
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: brokenBundle as never, raceScores: racePairA() })).toThrow();
    const brokenSteps = minimalHatchInputs();
    (brokenSteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps as unknown as Record<string, unknown>).eggsteps = { record: (brokenSteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps as unknown as { eggsteps: { record: unknown } }).eggsteps.record, steps: "ten" };
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: brokenSteps, raceScores: racePairA() })).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullRaceScoresInputs();
    const beforeHatchRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record);
    const beforeEggstepsRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.eggsteps.record);
    const beforeSparrerAJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerA);
    const beforeRaceStatsAJson = JSON.stringify(inputs.raceScores.statsA);
    const beforeRaceStatsBJson = JSON.stringify(inputs.raceScores.statsB);
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(inputs);
    // Mutate the returned outputs: the ready hatch record is fresh (egg already null), and the bundle placement cells are fresh.
    first.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.bond = 999;
    const bundle = first.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps;
    const breeding = bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding;
    breeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement.cells[0].itemId = "item-fake";
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(inputs);
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch).toEqual(hatchReportOf(eggRecord(0)));
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.bond).not.toBe(999);
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.eggsteps.record.egg).toEqual({ speciesId: "sp-a", parentA: "sp-a", parentB: "sp-b", stepsRemaining: 90 });
    expect(sparOf(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ winner: "A" });
    expect(breedingOf(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ canBreed: true });
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record)).toBe(beforeHatchRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.eggsteps.record)).toBe(beforeEggstepsRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerA)).toBe(beforeSparrerAJson);
    expect(JSON.stringify(inputs.raceScores.statsA)).toBe(beforeRaceStatsAJson);
    expect(JSON.stringify(inputs.raceScores.statsB)).toBe(beforeRaceStatsBJson);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.recipes.map((r) => r.id)).toEqual(["hab-a", "hab-z"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: minimalEggstepsInputs(),
        hatch: hatchReadyNamed(),
      },
      raceScores: racePairA(),
    });
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-Ω");
    expect(hatchEgg(hatchReadyNamed().record).hatchedSpeciesId).toBe("sp-Ω");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.record.speciesId).toBe("sp-Δ");
  });

  it("race scores: hand-checked numbers, fade, tie, huge", () => {
    const scored = (pair: RaceScoresInputs) =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(), raceScores: pair }).raceScores;
    expect(scored(racePairA())).toEqual({ scoreA: 100, scoreB: 60 });
    expect(scored(racePairA())).toEqual({ scoreA: raceScore(racePairA().statsA), scoreB: raceScore(racePairA().statsB) });
    // Fade: sprint 10 + glide 0 = speed 10, endurance 10 falls 40 short of 50, so 20 - 40 = -20; endurance 50 fades 0, speed 0, so 0.
    expect(scored(racePairFade())).toEqual({ scoreA: -20, scoreB: 0 });
    // Tie: identical stat lines score identically (sprint 9 + glide 8 = 17, endurance 11 fades 39, so 34 - 39 = -5 each).
    expect(scored(racePairTie())).toEqual({ scoreA: -5, scoreB: -5 });
    // Huge: 99 + 99 = 198 speed, no fade, so 396; 1 + 1 = 2 speed, endurance 1 fades 49, so 4 - 49 = -45.
    expect(scored(racePairHuge())).toEqual({ scoreA: 396, scoreB: -45 });
  });

  it("race scores re-read and side-by-side-not-chained: scores never feed the bundle, the bundle never scores", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: minimalHatchInputs(), raceScores: racePairFade() });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: fullHatchInputs(), raceScores: racePairFade() });
    expect(withMinimal.raceScores).toEqual(withFull.raceScores);
    expect(withMinimal.raceScores).toEqual({ scoreA: -20, scoreB: 0 });
    const base = {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: fullHatchInputs(),
    };
    const faded = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ ...base, raceScores: racePairFade() });
    const huge = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores({ ...base, raceScores: racePairHuge() });
    expect(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch).toEqual(huge.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch);
    expect(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch(fullHatchInputs()));
    expect(zoneHabitatOf(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
    expect(breedingOf(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ canBreed: true });
    expect(sparOf(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps)).toEqual({ winner: "A" });
    expect(faded.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.hatch.hatchedSpeciesId).toBe("sp-a");
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores");
    }
  });
});
