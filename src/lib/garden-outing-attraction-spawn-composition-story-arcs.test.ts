// S14 slice 56 tests — B3 outing + attraction + spawn + composition + story + arcs bundle (pure library).
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

describe("garden-outing-attraction-spawn-composition-story-arcs (B3 outing + attraction + spawn + composition + story + arcs)", () => {
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

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs(minimalArcsInputs());
    expect(result.outingAttractionSpawnCompositionStory).toEqual(
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      }),
    );
    expect(result.arcs).toEqual({ arcs: [], changed: [], appliedBeatIds: ["ar-1"] });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs(fullArcsInputs());
    expect(result.outingAttractionSpawnCompositionStory).toEqual(
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: fullCompositionInputs(),
        story: fullStory(),
      }),
    );
    expect(result.arcs).toEqual(
      applyArcBeats(fullArcs().arcs, fullArcs().beats, fullArcs().throughBeatId),
    );
    // Hand-checked: ar-1 moves c-1 to arc-a2 and appends c-3; ar-2 moves
    // c-2 to arc-b2 and moves c-1 back to arc-a, so c-1 is net unchanged;
    // ar-3 is past the cursor.
    expect(result.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
    // Inherited story numbers from the slice-55 bundle, unchanged.
    expect(result.outingAttractionSpawnCompositionStory.story).toEqual({
      residents: ["c-2", "c-3", "c-4"],
      arrived: ["c-3", "c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1", "b2"],
    });
    // Inherited composition numbers from the slice-54 bundle, unchanged.
    expect(
      result.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants,
    ).toEqual(["v-hydrated"]);
    expect(
      result.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].combos,
    ).toEqual(["combo-hotel"]);
    expect(
      result.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].base,
    ).toEqual({ recipeId: "rec-h1", tier: 2, extent: 3, finish: 6, character: "wood" });
    // Inherited spawn numbers from the slice-53 bundle, unchanged.
    expect(
      result.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness,
    ).toEqual({ "small-ground": 2, water: 1 });
  });

  it("bundle-only and arcs-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: fullCompositionInputs(),
        story: fullStory(),
      },
      arcs: minimalArcs(),
    });
    expect(bundleOnly.arcs).toEqual({ arcs: [], changed: [], appliedBeatIds: ["ar-1"] });
    const arcsOnly = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      },
      arcs: fullArcs(),
    });
    expect(arcsOnly.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
  });

  it("cursor: beats after throughBeatId are not applied", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      },
      arcs: fullArcs(),
    });
    expect(result.arcs.arcs).toEqual([
      { residentId: "c-1", arc: "arc-a" },
      { residentId: "c-2", arc: "arc-b2" },
      { residentId: "c-3", arc: "arc-c" },
    ]);
    expect(result.arcs.appliedBeatIds).toEqual(["ar-1", "ar-2"]);
    const throughLast = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      },
      arcs: { ...fullArcs(), throughBeatId: "ar-3" },
    });
    expect(throughLast.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b3" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2", "ar-3"],
    });
  });

  it("change-back is not changed, a no-op assignment is not changed, a new resident appends", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      },
      arcs: {
        arcs: [
          { residentId: "r-1", arc: "arc-x" },
          { residentId: "r-2", arc: "arc-y" },
        ],
        beats: [
          { id: "ar-1", changes: [{ residentId: "r-1", arc: "arc-z" }] },
          {
            id: "ar-2",
            changes: [
              { residentId: "r-1", arc: "arc-x" },
              { residentId: "r-2", arc: "arc-y" },
              { residentId: "r-3", arc: "arc-new" },
            ],
          },
        ],
        throughBeatId: "ar-2",
      },
    });
    // r-1 changed away and back: net unchanged. r-2 assigned its own arc:
    // unchanged. r-3 is new: changed, appended at the end.
    expect(result.arcs).toEqual({
      arcs: [
        { residentId: "r-1", arc: "arc-x" },
        { residentId: "r-2", arc: "arc-y" },
        { residentId: "r-3", arc: "arc-new" },
      ],
      changed: ["r-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
  });

  it("exact result shape: two sections only, arcs exactly arcs + changed + appliedBeatIds", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs(fullArcsInputs());
    expect(Object.keys(result).sort()).toEqual([
      "arcs",
      "outingAttractionSpawnCompositionStory",
    ]);
    expect(Object.keys(result.arcs).sort()).toEqual([
      "appliedBeatIds",
      "arcs",
      "changed",
    ]);
    expect(result.outingAttractionSpawnCompositionStory).not.toHaveProperty("arcs");
  });

  it("side-by-side-not-merged: same arcs input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: minimalStory(),
      },
      arcs: fullArcs(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStoryArcs(fullArcsInputs());
    expect(withMinimal.arcs).toEqual(withFull.arcs);
    // And the bundle's own autonomous arcs (c-1 arc-a, empty beat a1)
    // never leak into the arcs section: applied beats are the caller's ar-1/ar-2.
    expect(withFull.arcs.appliedBeatIds).toEqual(["ar-1", "ar-2"]);
    expect(withFull.arcs.arcs).toEqual([
      { residentId: "c-1", arc: "arc-a" },
      { residentId: "c-2", arc: "arc-b2" },
      { residentId: "c-3", arc: "arc-c" },
    ]);
  });

  it("side-by-side-not-chained: arcs come from the caller, not from the bundle's residents or story", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs({
      outingAttractionSpawnCompositionStory: {
        outingAttractionSpawnComposition: fullCompositionInputs(),
        story: fullStory(),
      },
      arcs: {
        arcs: [{ residentId: "r-9", arc: "arc-p" }],
        beats: [
          {
            id: "ar-1",
            changes: [
              { residentId: "r-9", arc: "arc-q" },
              { residentId: "r-10", arc: "arc-r" },
            ],
          },
        ],
        throughBeatId: "ar-1",
      },
    });
    // The bundle's story residents are c-2/c-3/c-4 and its autonomous
    // arc is c-1 arc-a; the arcs section never borrows either.
    expect(result.arcs).toEqual({
      arcs: [
        { residentId: "r-9", arc: "arc-q" },
        { residentId: "r-10", arc: "arc-r" },
      ],
      changed: ["r-9", "r-10"],
      appliedBeatIds: ["ar-1"],
    });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStoryArcs(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({ arcs: minimalArcs() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: { ...minimalArcs(), arcs: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: { ...minimalArcs(), beats: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: { ...minimalArcs(), throughBeatId: "" },
      }),
    ).toThrow();
    // Duplicate beat id: loud failure, never a silent merge.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: {
          arcs: [],
          beats: [
            { id: "ar-1", changes: [] },
            { id: "ar-1", changes: [] },
          ],
          throughBeatId: "ar-1",
        },
      }),
    ).toThrow();
    // Unknown cursor: loud failure, never a silent fallback to the last beat.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: { ...minimalArcs(), throughBeatId: "ar-nope" },
      }),
    ).toThrow(/throughBeatId names no beat/);
    // Arcs failure propagation: a beat that changes the same resident twice.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: minimalStory(),
        },
        arcs: {
          arcs: [],
          beats: [
            {
              id: "ar-1",
              changes: [
                { residentId: "x-1", arc: "arc-a" },
                { residentId: "x-1", arc: "arc-b" },
              ],
            },
          ],
          throughBeatId: "ar-1",
        },
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: {
            outingAttractionSpawn: fullSpawnInputs(),
            composition: { entries: [compositionEntryFull(), compositionEntryFull()] },
          },
          story: minimalStory(),
        },
        arcs: minimalArcs(),
      }),
    ).toThrow();
    // Bundle failure propagation, story half: duplicate story beat id in the slice-55 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStoryArcs({
        outingAttractionSpawnCompositionStory: {
          outingAttractionSpawnComposition: minimalCompositionInputs(),
          story: {
            residents: [],
            beats: [
              { id: "b1", arrivals: [], departures: [] },
              { id: "b1", arrivals: [], departures: [] },
            ],
            throughBeatId: "b1",
          },
        },
        arcs: minimalArcs(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullArcsInputs();
    const first = gardenOutingAttractionSpawnCompositionStoryArcs(inputs);
    first.arcs.arcs[0].arc = "arc-fake";
    first.arcs.changed.push("r-fake");
    first.arcs.appliedBeatIds.push("ar-fake");
    first.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants.push("v-fake");
    first.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness["small-ground"] = 99;
    const second = gardenOutingAttractionSpawnCompositionStoryArcs(inputs);
    expect(second.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-a" },
        { residentId: "c-2", arc: "arc-b2" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-2", "c-3"],
      appliedBeatIds: ["ar-1", "ar-2"],
    });
    expect(
      second.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants,
    ).toEqual(["v-hydrated"]);
    expect(
      second.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness,
    ).toEqual({ "small-ground": 2, water: 1 });
    expect(inputs.arcs.beats.map((b) => b.id)).toEqual(["ar-1", "ar-2", "ar-3"]);
    expect(inputs.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition.entries.map((e) => e.id)).toEqual(["k-1"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStoryArcs({
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
        beats: [
          {
            id: "beat-Ω",
            changes: [
              { residentId: "res-Δ", arc: "arc-Ω" },
              { residentId: "res-Ω", arc: "arc-Ω2" },
            ],
          },
        ],
        throughBeatId: "beat-Ω",
      },
    });
    expect(result.arcs).toEqual({
      arcs: [
        { residentId: "res-Δ", arc: "arc-Ω" },
        { residentId: "res-Ω", arc: "arc-Ω2" },
      ],
      changed: ["res-Δ", "res-Ω"],
      appliedBeatIds: ["beat-Ω"],
    });
    expect(
      result.outingAttractionSpawnCompositionStory.outingAttractionSpawnComposition.composition[0].variants,
    ).toEqual(["v-Δ"]);
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story-arcs", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story-arcs");
    }
  });
});
