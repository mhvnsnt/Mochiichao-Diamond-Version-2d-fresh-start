// S14 slice 68 tests — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited bundle (pure library).
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


// S14 slice 62 imports (the bundle this slice composes) + zone-habitat read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs,
  type ZoneHabitatInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat";
import { solveZoneHabitat } from "./garden-wiring";


// S14 slice 63 imports (the bundle this slice composes is slice 62, imported above) + placement read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs,
  type PlacementInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement";
import { zonePlacementToHabitatPlacement } from "./garden-wiring";


// S14 slice 64 imports (the bundle this slice composes is slice 63, imported above) + summary read imports.
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


// S14 slice 65 imports (the bundle this slice composes is slice 64, imported above) + breeding read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs,
  type BreedingInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding";
import { canBreed } from "./garden-wiring";


// S14 slice 66 imports (the bundle this slice composes is slice 65) + race read imports.
import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs,
  type RaceInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race";

// S14 slice 68 imports (the bundle this slice composes is slice 67) + inherited read imports.
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
import { runRace, raceScore, runSpar, sparScore, inheritedGardenStats } from "./garden-wiring";
import type { GardenStats } from "./mochiichao-systems";

describe("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited (B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited)", () => {
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

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(minimalInheritedInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(minimalSparInputs()),
    );
    expect(result.inherited).toEqual({ stats: inheritedGardenStats(parentHighLowA(), parentHighLowB(), 0) });
    expect(result.inherited).toEqual({ stats: { dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 } });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(fullInheritedInputs());
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(fullSparInputs()),
    );
    expect(result.inherited).toEqual({ stats: inheritedGardenStats(parentHighLowA(), parentHighLowB(), 0) });
    expect(result.inherited).toEqual({ stats: { dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 } });
    // Inherited spar winner, hand-checked from slice 67.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar).toEqual({ winner: "A" });
    // Inherited race winner, hand-checked from slice 66.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.race).toEqual({ winner: "A" });
    // Inherited breeding gate, hand-checked from slice 65.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding).toEqual({ canBreed: true });
    // Inherited summary, hand-checked from slice 64.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.summary).toEqual({
      summary: "sp-a — Form Base, dominant sprint, variant Strike, Bond 42, Rebirths 2, Mythic yes",
    });
    // Inherited placement cells, hand-checked from slice 63.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement).toEqual({
      zoneId: "zone-a",
      cells: [
        { id: "0,0", itemId: "item-a", categories: [] },
        { id: "0,1", itemId: "item-a", categories: [] },
      ],
    });
    // Inherited zone-habitat solve, hand-checked from slice 62.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
  });

  it("full and minimal bundles with different inherited pairs", () => {
    const fullBundleLowInherited = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedLo(),
    });
    expect(fullBundleLowInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(fullSparInputs()),
    );
    expect(fullBundleLowInherited.inherited).toEqual({ stats: { dive: 10, glide: 5, sprint: 25, might: 35, endurance: 50 } });
    const minimalBundleHiInherited = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      inherited: inheritedHi(),
    });
    expect(minimalBundleHiInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).toEqual(
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(minimalSparInputs()),
    );
    expect(minimalBundleHiInherited.inherited).toEqual({ stats: { dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 } });
  });

  it("inherited re-read: changing a parent or the seed re-inherits the whole line, never a stored line", () => {
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(fullInheritedInputs());
    expect(first.inherited.stats).toEqual({ dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 });
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedLo(),
    });
    expect(second.inherited.stats).toEqual({ dive: 10, glide: 5, sprint: 25, might: 35, endurance: 50 });
    const boundaryHi = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: { parentA: parentHighLowA(), parentB: parentHighLowB(), seed70: 69 },
    });
    expect(boundaryHi.inherited.stats).toEqual({ dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 });
    const clamp = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedClampHi(),
    });
    expect(clamp.inherited.stats).toEqual({ dive: 99, glide: 20, sprint: 99, might: 99, endurance: 50 });
    const clampLo = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedClampLo(),
    });
    expect(clampLo.inherited.stats).toEqual({ dive: 50, glide: 0, sprint: 0, might: 0, endurance: 0 });
    const fourth = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(fullInheritedInputs());
    expect(fourth.inherited).toEqual(first.inherited);
  });

  it("caller-named parents: stat lines the bundle never names still hand down from their own numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      inherited: { parentA: statsHuge(), parentB: statsWeak(), seed70: 0 },
    });
    expect(result.inherited).toEqual({ stats: { dive: 99, glide: 99, sprint: 99, might: 99, endurance: 99 } });
    expect(inheritedGardenStats(statsHuge(), statsWeak(), 0)).toEqual({ dive: 99, glide: 99, sprint: 99, might: 99, endurance: 99 });
    // The bundle's placements zones stay empty while the inherited section reads its own stat lines.
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.zones).toEqual([]);
  });

  it("exact result shape: two sections only, inherited exactly one stat line", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(fullInheritedInputs());
    expect(Object.keys(result).sort()).toEqual([
      "inherited",
      "outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar",
    ]);
    expect(Object.keys(result.inherited).sort()).toEqual(["stats"]);
    expect(Object.keys(result.inherited.stats).sort()).toEqual(["dive", "endurance", "glide", "might", "sprint"]);
    expect(result.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).not.toHaveProperty("inherited");
    expect(result.inherited).not.toHaveProperty("parentA");
    expect(result.inherited).not.toHaveProperty("parentB");
    expect(result.inherited).not.toHaveProperty("seed70");
    expect(result.inherited).not.toHaveProperty("winner");
  });

  it("side-by-side-not-merged: same inherited input reads identically with a minimal and a full bundle", () => {
    const inheritedIn = inheritedHi();
    const minimal = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      inherited: inheritedIn,
    });
    const full = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedIn,
    });
    expect(minimal.inherited).toEqual(full.inherited);
  });

  it("side-by-side-not-chained: an inherited line never feeds the bundle, and the bundle never inherits stat lines", () => {
    const recordA = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(fullInheritedInputs());
    const recordB = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedLo(),
    });
    expect(recordB.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar).toEqual(recordA.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar);
    expect(recordB.inherited.stats).toEqual({ dive: 10, glide: 5, sprint: 25, might: 35, endurance: 50 });
    const clampInherited = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: fullSparInputs(),
      inherited: inheritedClampHi(),
    });
    expect(clampInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
    // An inherited line never re-gates the bundle's breeding pair.
    expect(clampInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding).toEqual({ canBreed: true });
    // An inherited line never re-spars the bundle's spar pair.
    expect(clampInherited.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar).toEqual({ winner: "A" });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({ inherited: inheritedHi() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
        inherited: { parentA: [] as never, parentB: parentHighLowB(), seed70: 0 },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
        inherited: { parentA: parentHighLowA(), parentB: null as never, seed70: 0 },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
        inherited: { parentA: parentHighLowA(), parentB: parentHighLowB() } as never,
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
        inherited: { parentA: parentHighLowA(), parentB: parentHighLowB(), seed70: "0" as never },
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: { outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding: {
          outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: {
            outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: {
              outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: {
                outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: {
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
                },
                zoneHabitat: fullZoneHabitat(),
              },
              placement: fullPlacement(),
            },
            summary: minimalSummary(),
          },
          breeding: pairBothHigh(),
        },
        race: { racerA: statsStrong(), racerB: statsWeak() },
      },
        spar: sparAWin(),
      },
      inherited: inheritedHi(),
    }),
    ).toThrow();
    // Bundle failure propagation: a zone-habitat recipe with an empty id.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: {
        outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: { outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding: {
          outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: {
            outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: {
              outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: {
                outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: minimalCellsInputs(),
                zoneHabitat: { record: fullPlacementsRecord(), zoneId: "zone-a", recipes: [{ id: "", tier: 1, requires: [{ item: "item-a", count: 1 }] }] },
              },
              placement: fullPlacement(),
            },
            summary: minimalSummary(),
          },
          breeding: pairBothHigh(),
        },
        race: { racerA: statsStrong(), racerB: statsWeak() },
      },
        spar: sparAWin(),
      },
      inherited: inheritedHi(),
    }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullInheritedInputs();
    const beforeParentAJson = JSON.stringify(inputs.inherited.parentA);
    const beforeParentBJson = JSON.stringify(inputs.inherited.parentB);
    const beforeSparrerAJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerA);
    const beforeSparrerBJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerB);
    const beforeParentJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding.parentA);
    const beforeSummaryRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.summary.record);
    const beforePlacementRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement.record);
    const beforeZoneHabitatRecordJson = JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.record);
    const first = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(inputs);
    const bundle = first.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding;
    bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement.cells[0].itemId = "item-fake";
    bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement.cells[0].categories.push("cat-fake");
    if (bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.solved !== null) {
      bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.solved.recipeId = "hab-fake";
    }
    bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells.cells.cells[0].cell.itemId = "item-fake";
    bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.habitats["zone-a"] = null;
    bundle.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements.placements.zones.push("zone-fake");
    first.inherited.stats.dive = 999;
    const second = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(inputs);
    expect(second.inherited).toEqual({ stats: { dive: 90, glide: 20, sprint: 30, might: 40, endurance: 60 } });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar).toEqual({ winner: "A" });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding).toEqual({ canBreed: true });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.summary).toEqual({
      summary: "sp-a — Form Base, dominant sprint, variant Strike, Bond 42, Rebirths 2, Mythic yes",
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement).toEqual({
      zoneId: "zone-a",
      cells: [
        { id: "0,0", itemId: "item-a", categories: [] },
        { id: "0,1", itemId: "item-a", categories: [] },
      ],
    });
    expect(second.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat).toEqual({
      zoneId: "zone-a",
      solved: { recipeId: "hab-a", tier: 1, extent: 2, finish: 0, character: null },
    });
    expect(JSON.stringify(inputs.inherited.parentA)).toBe(beforeParentAJson);
    expect(JSON.stringify(inputs.inherited.parentB)).toBe(beforeParentBJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerA)).toBe(beforeSparrerAJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.spar.sparrerB)).toBe(beforeSparrerBJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.breeding.parentA)).toBe(beforeParentJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.summary.record)).toBe(beforeSummaryRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.placement.record)).toBe(beforePlacementRecordJson);
    expect(JSON.stringify(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.record)).toBe(beforeZoneHabitatRecordJson);
    expect(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat.zoneHabitat.recipes.map((r) => r.id)).toEqual(["hab-a", "hab-z"]);
  });

  it("caller-vocabulary stats pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited({
      outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: minimalSparInputs(),
      inherited: { parentA: { dive: 77, glide: 3, sprint: 41, might: 8, endurance: 66 }, parentB: { dive: 12, glide: 88, sprint: 41, might: 90, endurance: 66 }, seed70: 0 },
    });
    expect(result.inherited).toEqual({ stats: { dive: 77, glide: 88, sprint: 41, might: 90, endurance: 66 } });
    expect(inheritedGardenStats({ dive: 77, glide: 3, sprint: 41, might: 8, endurance: 66 }, { dive: 12, glide: 88, sprint: 41, might: 90, endurance: 66 }, 0)).toEqual({ dive: 77, glide: 88, sprint: 41, might: 90, endurance: 66 });
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited");
    }
  });
});
