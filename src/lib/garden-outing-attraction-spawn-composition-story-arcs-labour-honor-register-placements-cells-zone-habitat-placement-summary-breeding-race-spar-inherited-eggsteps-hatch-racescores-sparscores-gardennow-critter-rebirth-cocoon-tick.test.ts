// S14 slice 77 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick bundle (pure library).
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
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs,
  type SparScoresInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores";
import { runRace, raceScore, runSpar, sparScore, inheritedGardenStats, tickEggSteps, hatchEgg } from "./garden-wiring";
// S14 slice 73 imports (the bundle this slice composes is slice 72) + garden now read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs,
  type GardenNowInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow";
import { gardenNowMinutes } from "./garden-wiring";
import type { WorldClockAnchor } from "./worldClock";
// S14 slice 74 imports (the bundle this slice composes is slice 73) + critter read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs,
  type CritterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter";
import { applyCritter } from "./garden-wiring";
// S14 slice 76 imports (the bundle this slice composes is slice 75) + cocoon read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs,
  type CocoonInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon";
import { enterCocoon } from "./garden-wiring";
// S14 slice 77 imports (the bundle this slice composes is slice 76) + tick read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs,
  type TickInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick";
import { tickCocoon } from "./garden-wiring";
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs,
  type RebirthInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth";
import { dataRebirth } from "./garden-wiring";
import type { GardenStats } from "./mochiichao-systems";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick (B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick)", () => {
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


  function sparPairA(): SparScoresInputs {
    return {
      statsA: { dive: 10, glide: 20, sprint: 30, might: 40, endurance: 60 },
      statsB: { dive: 5, glide: 5, sprint: 25, might: 35, endurance: 50 },
    };
  }

  function sparPairDodge(): SparScoresInputs {
    return { statsA: statsDodgeHigh(), statsB: statsDodgeLow() };
  }

  function sparPairTie(): SparScoresInputs {
    return {
      statsA: { dive: 7, glide: 8, sprint: 9, might: 10, endurance: 11 },
      statsB: { dive: 7, glide: 8, sprint: 9, might: 10, endurance: 11 },
    };
  }

  function sparPairHuge(): SparScoresInputs {
    return { statsA: statsHuge(), statsB: { dive: 1, glide: 1, sprint: 1, might: 1, endurance: 1 } };
  }

  function minimalSparScoresInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores: minimalRaceScoresInputs(),
      sparScores: sparPairA(),
    };
  }

  function fullSparScoresInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores: fullRaceScoresInputs(),
      sparScores: sparPairA(),
    };
  }

  function raceScoresInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalRaceScoresInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch: { outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: eggsteps, hatch },
      raceScores: racePairA(),
    };
  }

  function eggstepsOf71(bundle71: ReturnType<typeof gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores>): Bundle69 {
    return bundle71.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps;
  }


  function anchorAt(anchorGameMinutes: number, anchorRealMs = 1000): WorldClockAnchor {
    return { anchorRealMs, anchorGameMinutes, lastSeenDayIndex: 0 };
  }

  function gardenNowUnanchored(): GardenNowInputs {
    return { anchor: null, fallbackMinutes: 42, nowMs: 999_999 };
  }

  function gardenNowAnchored(): GardenNowInputs {
    return { anchor: anchorAt(600), fallbackMinutes: 0, nowMs: 16_000 };
  }

  function gardenNowBackwards(): GardenNowInputs {
    return { anchor: anchorAt(600), fallbackMinutes: 0, nowMs: 500 };
  }

  function gardenNowMidnight(): GardenNowInputs {
    return { anchor: anchorAt(1380), fallbackMinutes: 0, nowMs: 121_000 };
  }

  function gardenNowZeroElapsed(): GardenNowInputs {
    return { anchor: anchorAt(777), fallbackMinutes: 0, nowMs: 1000 };
  }

  function gardenNowNamed(): GardenNowInputs {
    return { anchor: anchorAt(4321), fallbackMinutes: 0, nowMs: 1000 };
  }

  function sparScoresInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalSparScoresInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores: raceScoresInputsFor(eggsteps, hatch),
      sparScores: sparPairA(),
    };
  }

  function eggstepsOf72(bundle72: ReturnType<typeof gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores>): Bundle69 {
    return eggstepsOf71(bundle72.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores);
  }

  function minimalGardenNowInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores: minimalSparScoresInputs(),
      gardenNow: gardenNowUnanchored(),
    };
  }

  function fullGardenNowInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores: fullSparScoresInputs(),
      gardenNow: gardenNowAnchored(),
    };
  }


  function gardenNowInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalGardenNowInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores: sparScoresInputsFor(eggsteps, hatch),
      gardenNow: gardenNowAnchored(),
    };
  }

  function eggstepsOf73(bundle73: ReturnType<typeof gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow>): Bundle69 {
    return eggstepsOf72(bundle73.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores);
  }

  function critterBase(speciesId = "sp-c"): GardenSaveRecord {
    return newGardenRecord(speciesId, 7);
  }

  function critterStats(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 10, glide: 20, sprint: 30, might: 40, endurance: 50 },
    };
  }

  function critterHighDive(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 97, glide: 0, sprint: 0, might: 0, endurance: 0 },
    };
  }

  function critterWithEgg(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      egg: { speciesId: "sp-c", parentA: "sp-c", parentB: "sp-d", stepsRemaining: 40 },
    };
  }

  function critterTidePup(): CritterInputs {
    return { record: critterBase(), critterId: "tide-pup", statGain: 5 };
  }

  function critterForgeBear(): CritterInputs {
    return { record: critterStats(), critterId: "forge-bear", statGain: 3 };
  }

  function critterUnknown(): CritterInputs {
    return { record: critterBase(), critterId: "no-such-critter", statGain: 5 };
  }

  function critterClamp(): CritterInputs {
    return { record: critterHighDive(), critterId: "tide-pup", statGain: 5 };
  }

  function critterZeroGain(): CritterInputs {
    return { record: critterBase(), critterId: "tide-pup", statGain: 0 };
  }

  function critterNamed(): CritterInputs {
    return { record: { ...newGardenRecord("sp-Δ", 7), bond: 61 }, critterId: "bubble-otter", statGain: 4 };
  }

  function critterReportOf(record: GardenSaveRecord, critterId: string, statGain: number) {
    return { record: applyCritter(record, critterId, statGain) };
  }

  function minimalCritterInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow: minimalGardenNowInputs(),
      critter: critterTidePup(),
    };
  }

  function fullCritterInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow: fullGardenNowInputs(),
      critter: critterForgeBear(),
    };
  }


  function critterInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalCritterInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow: gardenNowInputsFor(eggsteps, hatch),
      critter: critterTidePup(),
    };
  }

  function rebirthRecord(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-r", 7),
      garden: { dive: 10, glide: 21, sprint: 31, might: 41, endurance: 51 },
      bond: 61,
      rebirths: 2,
      gardenAge: 5,
      cocoon: { active: true, startedAt: 100, endsAt: 110, targetForm: "Garden Form I" },
      parts: ["Tail"],
      egg: { speciesId: "sp-old", parentA: "sp-x", parentB: "sp-y", stepsRemaining: 40 },
    };
  }

  function rebirthAtFifty(): GardenSaveRecord {
    return { ...newGardenRecord("sp-r", 7), garden: { dive: 10, glide: 21, sprint: 31, might: 41, endurance: 51 }, bond: 50, rebirths: 2 };
  }

  function rebirthLow(): GardenSaveRecord {
    return { ...newGardenRecord("sp-r", 7), garden: { dive: 10, glide: 21, sprint: 31, might: 41, endurance: 51 }, bond: 0, rebirths: 2 };
  }

  function rebirthNamed(): GardenSaveRecord {
    return { ...newGardenRecord("sp-Δ", 7), garden: { dive: 5, glide: 5, sprint: 5, might: 5, endurance: 5 }, bond: 61 };
  }

  function rebirthReportOf(record: GardenSaveRecord) {
    return { record: dataRebirth(record) };
  }

  function minimalRebirthInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter: minimalCritterInputs(),
      rebirth: { record: rebirthRecord() },
    };
  }

  function fullRebirthInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter: fullCritterInputs(),
      rebirth: { record: rebirthRecord() },
    };
  }


  function rebirthInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalRebirthInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter: critterInputsFor(eggsteps, hatch),
      rebirth: { record: rebirthRecord() },
    };
  }

  function cocoonRecord(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 30, glide: 30, sprint: 30, might: 30, endurance: 30 },
      parts: ["Tail"],
    };
  }

  function cocoonFormII(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 60, glide: 60, sprint: 60, might: 60, endurance: 60 },
      parts: ["Tail"],
    };
  }

  function cocoonBase(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 20, glide: 20, sprint: 20, might: 20, endurance: 20 },
    };
  }

  function cocoonAlready(): GardenSaveRecord {
    return {
      ...cocoonRecord(),
      cocoon: { active: true, startedAt: 50, endsAt: 60, targetForm: "Garden Form I" },
    };
  }

  function cocoonNamed(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-Δ", 7),
      garden: { dive: 40, glide: 40, sprint: 40, might: 40, endurance: 40 },
    };
  }

  function cocoonReportOf(record: GardenSaveRecord, nowMinutes: number) {
    return { record: enterCocoon(record, nowMinutes) };
  }

  function minimalCocoonInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth: minimalRebirthInputs(),
      cocoon: { record: cocoonRecord(), nowMinutes: 100 },
    };
  }

  function fullCocoonInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth: fullRebirthInputs(),
      cocoon: { record: cocoonFormII(), nowMinutes: 200 },
    };
  }


  function tickReady(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 30, glide: 30, sprint: 30, might: 30, endurance: 30 },
      parts: ["Tail"],
      gardenAge: 0,
      cocoon: { active: true, startedAt: 50, endsAt: 60, targetForm: "Garden Form I" },
    };
  }

  function tickNotReady(): GardenSaveRecord {
    return {
      ...tickReady(),
      gardenAge: 2,
      cocoon: { active: true, startedAt: 50, endsAt: 100, targetForm: "Garden Form I" },
    };
  }

  function tickNoCocoon(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 30, glide: 30, sprint: 30, might: 30, endurance: 30 },
      gardenAge: 1,
      cocoon: null,
    };
  }

  function tickFull(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-c", 7),
      garden: { dive: 60, glide: 60, sprint: 60, might: 60, endurance: 60 },
      parts: ["Tail"],
      gardenAge: 3,
      cocoon: { active: true, startedAt: 190, endsAt: 200, targetForm: "Garden Form II" },
    };
  }

  function tickNamed(): GardenSaveRecord {
    return {
      ...newGardenRecord("sp-Δ", 7),
      garden: { dive: 40, glide: 40, sprint: 40, might: 40, endurance: 40 },
      gardenAge: 5,
      cocoon: { active: true, startedAt: 50, endsAt: 60, targetForm: "Garden Form I" },
    };
  }

  function tickReportOf(record: GardenSaveRecord, nowMinutes: number) {
    return { record: tickCocoon(record, nowMinutes) };
  }

  function minimalTickInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(),
      tick: { record: tickReady(), nowMinutes: 60 },
    };
  }

  function fullTickInputs(): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: fullCocoonInputs(),
      tick: { record: tickFull(), nowMinutes: 200 },
    };
  }

  function cocoonInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalCocoonInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth: rebirthInputsFor(eggsteps, hatch),
      cocoon: { record: cocoonRecord(), nowMinutes: 100 },
    };
  }

  function tickInputsFor(eggsteps: ReturnType<typeof minimalEggstepsInputs>, hatch: ReturnType<typeof hatchReady>): ReturnType<typeof minimalTickInputs> {
    return {
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: cocoonInputsFor(eggsteps, hatch),
      tick: { record: tickReady(), nowMinutes: 60 },
    };
  }


  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(minimalTickInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(minimalCocoonInputs()));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon).toEqual(cocoonReportOf(cocoonRecord(), 100));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.cocoon).toEqual({ active: true, startedAt: 100, endsAt: 110, targetForm: "Garden Form I" });
    expect(result.tick).toEqual(tickReportOf(tickReady(), 60));
    expect(result.tick.record.cocoon).toBeNull();
    expect(result.tick.record.gardenAge).toBe(0.1);
    expect(result.tick.record.garden).toEqual({ dive: 30, glide: 30, sprint: 30, might: 30, endurance: 30 });
    expect(result.tick.record.parts).toEqual(["Tail"]);
    expect(result.tick.record.speciesId).toBe("sp-c");
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(fullTickInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(fullCocoonInputs()));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon).toEqual(cocoonReportOf(cocoonFormII(), 200));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.cocoon).toEqual({ active: true, startedAt: 200, endsAt: 210, targetForm: "Garden Form II" });
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth).toEqual(rebirthReportOf(rebirthRecord()));
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth.record.garden).toEqual({ dive: 5, glide: 10, sprint: 15, might: 20, endurance: 25 });
    expect(result.tick).toEqual(tickReportOf(tickFull(), 200));
    expect(result.tick.record.cocoon).toBeNull();
    expect(result.tick.record.gardenAge).toBe(3.1);
    expect(result.tick.record.garden).toEqual({ dive: 60, glide: 60, sprint: 60, might: 60, endurance: 60 });
    expect(result.tick.record.speciesId).toBe("sp-c");
  });

  it("full and minimal bundles with different tick cases", () => {
    const read = (record: GardenSaveRecord, nowMinutes: number, bundle: ReturnType<typeof minimalCocoonInputs>) =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: bundle, tick: { record, nowMinutes } }).tick;
    expect(read(tickReady(), 60, minimalCocoonInputs())).toEqual(tickReportOf(tickReady(), 60));
    expect(read(tickReady(), 60, fullCocoonInputs())).toEqual(tickReportOf(tickReady(), 60));
    expect(read(tickReady(), 59, minimalCocoonInputs())).toEqual({ record: tickReady() });
    expect(read(tickNotReady(), 60, minimalCocoonInputs())).toEqual({ record: tickNotReady() });
    expect(read(tickNoCocoon(), 60, minimalCocoonInputs())).toEqual({ record: tickNoCocoon() });
    expect(read(tickNamed(), 60, minimalCocoonInputs()).record.cocoon).toBeNull();
    expect(read(tickNamed(), 60, minimalCocoonInputs()).record.gardenAge).toBe(5.1);
    expect(read(tickNamed(), 60, minimalCocoonInputs()).record.speciesId).toBe("sp-Δ");
  });

  it("tick re-read: same case with minimal and full bundles identical", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickReady(), nowMinutes: 60 } });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: fullCocoonInputs(), tick: { record: tickReady(), nowMinutes: 60 } });
    expect(withMinimal.tick).toEqual(withFull.tick);
    expect(withMinimal.tick).toEqual(tickReportOf(tickReady(), 60));
    const fullCase = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(fullTickInputs());
    expect(fullCase.tick).toEqual(tickReportOf(tickFull(), 200));
  });

  it("caller-named hatch record: an egg the bundle never names still hatches from its own numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: cocoonInputsFor(minimalEggstepsInputs(), hatchReadyNamed()),
      tick: { record: tickNamed(), nowMinutes: 60 },
    });
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(cocoonInputsFor(minimalEggstepsInputs(), hatchReadyNamed())));
    expect(result.tick.record.speciesId).toBe("sp-Δ");
    expect(result.tick.record.cocoon).toBeNull();
    expect(result.tick.record.gardenAge).toBe(5.1);
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.speciesId).toBe("sp-c");
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.cocoon).toEqual({ active: true, startedAt: 100, endsAt: 110, targetForm: "Garden Form I" });
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth.record.speciesId).toBe("sp-r");
  });

  it("exact result shape: two sections only, tick exactly one record", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(minimalTickInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon",
      "tick",
    ]);
    expect(Object.keys(result.tick).sort()).toEqual(["record"]);
    expect("tick" in result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toBe(false);
    expect("outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon" in result.tick).toBe(false);
    expect(Object.keys(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).sort()).toEqual([
      "cocoon",
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth",
    ]);
  });

  it("side-by-side-not-merged: same tick case reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickReady(), nowMinutes: 60 } });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: fullCocoonInputs(), tick: { record: tickReady(), nowMinutes: 60 } });
    expect(withMinimal.tick).toEqual(withFull.tick);
    expect(withMinimal.tick).toEqual(tickReportOf(tickReady(), 60));
  });

  it("side-by-side-not-chained: a tick case never feeds the bundle, and the bundle never reads the tick", () => {
    const base = { outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: fullCocoonInputs() };
    const ticked = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ ...base, tick: { record: tickReady(), nowMinutes: 60 } });
    const unticked = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ ...base, tick: { record: tickNoCocoon(), nowMinutes: 60 } });
    expect(ticked.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(unticked.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon);
    expect(ticked.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(fullCocoonInputs()));
    expect(ticked.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth.record.garden.might).toBe(20);
    expect(ticked.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.cocoon).toEqual({ active: true, startedAt: 200, endsAt: 210, targetForm: "Garden Form II" });
  });

  it("loud failures", () => {
    const fn = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick;
    expect(() => fn(null as never)).toThrow();
    expect(() => fn("bundle" as never)).toThrow();
    expect(() => fn({} as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs() } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: null } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: [] } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: [], nowMinutes: 60 } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: {}, nowMinutes: 60 } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: { garden: { dive: Number.NaN, glide: 0, sprint: 0, might: 0, endurance: 0 }, speciesId: "sp-c" }, nowMinutes: 60 } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: { ...tickReady(), speciesId: "" }, nowMinutes: 60 } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: { ...tickReady(), speciesId: 42 }, nowMinutes: 60 } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickReady(), nowMinutes: Number.NaN } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickReady(), nowMinutes: "60" } } as never)).toThrow();
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: null, tick: { record: tickReady(), nowMinutes: 60 } } as never)).toThrow();
    // Bundle failure propagation: a slice-76 bundle missing its cocoon section, and one with a non-number eggsteps step count.
    const brokenBundle = minimalCocoonInputs() as unknown as Record<string, unknown>;
    delete brokenBundle.cocoon;
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: brokenBundle as never, tick: { record: tickReady(), nowMinutes: 60 } })).toThrow();
    const brokenSteps = minimalCocoonInputs();
    const deepBundle = brokenSteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps as unknown as Record<string, unknown>;
    deepBundle.eggsteps = { record: (deepBundle.eggsteps as { record: unknown }).record, steps: "ten" };
    expect(() => fn({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: brokenSteps, tick: { record: tickReady(), nowMinutes: 60 } })).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullTickInputs();
    const beforeTickRecordJson = JSON.stringify(inputs.tick.record);
    const beforeCocoonRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record);
    const beforeRebirthRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth.record);
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(inputs);
    // Mutate the returned tick record's cocoon slot (fresh when the tick rule passes) — the second call must still clear it.
    first.tick.record.cocoon = { active: true, startedAt: 1, endsAt: 9999, targetForm: "Garden Form I" };
    first.tick.record.gardenAge = 999;
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(inputs);
    expect(second.tick.record.cocoon).toBeNull();
    expect(second.tick.record.gardenAge).toBe(3.1);
    expect(JSON.stringify(inputs.tick.record)).toBe(beforeTickRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record)).toBe(beforeCocoonRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.rebirth.record)).toBe(beforeRebirthRecordJson);
    // The bundle's own zone-habitat recipe order is untouched.
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement).toBeDefined();
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickNamed(), nowMinutes: 60 } });
    expect(result.tick.record.speciesId).toBe("sp-Δ");
    expect(result.tick.record.cocoon).toBeNull();
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon.cocoon.record.speciesId).toBe("sp-c");
  });

  it("tick: hand-checked numbers, tick pass, not yet, no cocoon, exactly at endsAt", () => {
    expect(tickCocoon(tickReady(), 60)).toEqual({ ...tickReady(), cocoon: null, gardenAge: 0.1 });
    const ready59 = tickReady();
    expect(tickCocoon(ready59, 59)).toBe(ready59);
    // Same-object edge: the not-ready call returns the caller's record itself.
    const notReady = tickNotReady();
    expect(tickCocoon(notReady, 60)).toBe(notReady);
    const noCocoon = tickNoCocoon();
    expect(tickCocoon(noCocoon, 60)).toBe(noCocoon);
    expect(tickCocoon(tickReady(), 61).gardenAge).toBe(0.1);
    expect(tickCocoon(tickNamed(), 60).gardenAge).toBe(5.1);
    expect(tickCocoon(tickFull(), 200).cocoon).toBeNull();
    const viaBundle = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick({ outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: minimalCocoonInputs(), tick: { record: tickReady(), nowMinutes: 60 } });
    expect(viaBundle.tick.record.cocoon).toBeNull();
    expect(viaBundle.tick.record.gardenAge).toBe(0.1);
  });

  it("full and minimal bundles with different hatch inputs, including no egg and not ready", () => {
    const ready = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(tickInputsFor(minimalEggstepsInputs(), hatchReady()));
    const notReady = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(tickInputsFor(minimalEggstepsInputs(), hatchNotReady()));
    const noEgg = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(tickInputsFor(minimalEggstepsInputs(), hatchNoEgg()));
    expect(ready.tick.record.cocoon).toBeNull();
    expect(notReady.tick.record.cocoon).toBeNull();
    expect(noEgg.tick.record.cocoon).toBeNull();
    expect(ready.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(cocoonInputsFor(minimalEggstepsInputs(), hatchReady())));
    expect(notReady.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(cocoonInputsFor(minimalEggstepsInputs(), hatchNotReady())));
    expect(noEgg.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon).toEqual(gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(cocoonInputsFor(minimalEggstepsInputs(), hatchNoEgg())));
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick");
    }
  });
});
