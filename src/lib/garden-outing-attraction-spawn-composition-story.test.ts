// S14 slice 55 tests — B3 outing + attraction + spawn + composition + story bundle (pure library).
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

describe("garden-outing-attraction-spawn-composition-story (B3 outing + attraction + spawn + composition + story)", () => {
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

  function minimalStoryInputs(): GardenOutingAttractionSpawnCompositionStoryInputs {
    return {
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: minimalStory(),
    };
  }

  function fullStoryInputs(): GardenOutingAttractionSpawnCompositionStoryInputs {
    return {
      outingAttractionSpawnComposition: fullCompositionInputs(),
      story: fullStory(),
    };
  }

  it("minimal inputs read back unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStory(minimalStoryInputs());
    expect(result.outingAttractionSpawnComposition).toEqual(
      gardenOutingAttractionSpawnComposition(minimalCompositionInputs()),
    );
    expect(result.story).toEqual({
      residents: [],
      arrived: [],
      departed: [],
      appliedBeatIds: ["b1"],
    });
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const result = gardenOutingAttractionSpawnCompositionStory(fullStoryInputs());
    expect(result.outingAttractionSpawnComposition).toEqual(
      gardenOutingAttractionSpawnComposition(fullCompositionInputs()),
    );
    expect(result.story).toEqual(
      applyStoryBeats(fullStory().residents, fullStory().beats, fullStory().throughBeatId),
    );
    // Hand-checked: b1 arrives c-3, b2 departs c-1 and arrives c-4; b3 is past the cursor.
    expect(result.story).toEqual({
      residents: ["c-2", "c-3", "c-4"],
      arrived: ["c-3", "c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1", "b2"],
    });
    // Inherited composition numbers from the slice-54 bundle, unchanged.
    expect(result.outingAttractionSpawnComposition.composition[0].variants).toEqual(["v-hydrated"]);
    expect(result.outingAttractionSpawnComposition.composition[0].combos).toEqual(["combo-hotel"]);
    expect(result.outingAttractionSpawnComposition.composition[0].base).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
    // Inherited spawn numbers from the slice-53 bundle, unchanged.
    expect(result.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness).toEqual({
      "small-ground": 2,
      water: 1,
    });
  });

  it("composition-bundle-only and story-with-minimal-bundle bundles", () => {
    const bundleOnly = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: fullCompositionInputs(),
      story: minimalStory(),
    });
    expect(bundleOnly.story).toEqual({
      residents: [],
      arrived: [],
      departed: [],
      appliedBeatIds: ["b1"],
    });
    expect(bundleOnly.outingAttractionSpawnComposition).toEqual(
      gardenOutingAttractionSpawnComposition(fullCompositionInputs()),
    );
    const storyOnly = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: fullStory(),
    });
    expect(storyOnly.story).toEqual({
      residents: ["c-2", "c-3", "c-4"],
      arrived: ["c-3", "c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1", "b2"],
    });
    expect(storyOnly.outingAttractionSpawnComposition).toEqual(
      gardenOutingAttractionSpawnComposition(minimalCompositionInputs()),
    );
  });

  it("cursor: beats after throughBeatId are not applied", () => {
    const result = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: fullStory(),
    });
    expect(result.story.residents).not.toContain("c-5");
    expect(result.story.appliedBeatIds).toEqual(["b1", "b2"]);
    const throughLast = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: { ...fullStory(), throughBeatId: "b3" },
    });
    expect(throughLast.story).toEqual({
      residents: ["c-3", "c-4", "c-5"],
      arrived: ["c-3", "c-4", "c-5"],
      departed: ["c-1", "c-2"],
      appliedBeatIds: ["b1", "b2", "b3"],
    });
  });

  it("departures of absent residents and duplicate arrivals never fabricate residents", () => {
    const result = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: {
        residents: ["r-1"],
        beats: [
          { id: "b1", arrivals: ["r-2"], departures: ["r-ghost"] },
          { id: "b2", arrivals: ["r-2"], departures: [] },
        ],
        throughBeatId: "b2",
      },
    });
    // r-ghost was never present, so it never departs; r-2 arrives once, not twice.
    expect(result.story).toEqual({
      residents: ["r-1", "r-2"],
      arrived: ["r-2"],
      departed: [],
      appliedBeatIds: ["b1", "b2"],
    });
  });

  it("exact result shape: two sections only, story exactly residents + arrived + departed + appliedBeatIds", () => {
    const result = gardenOutingAttractionSpawnCompositionStory(fullStoryInputs());
    expect(Object.keys(result).sort()).toEqual([
      "outingAttractionSpawnComposition",
      "story",
    ]);
    expect(Object.keys(result.story).sort()).toEqual([
      "appliedBeatIds",
      "arrived",
      "departed",
      "residents",
    ]);
    expect(result.outingAttractionSpawnComposition).not.toHaveProperty("story");
  });

  it("side-by-side-not-merged: same story input reads identically with a minimal and a full bundle", () => {
    const withMinimal = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: minimalCompositionInputs(),
      story: fullStory(),
    });
    const withFull = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: fullCompositionInputs(),
      story: fullStory(),
    });
    expect(withMinimal.story).toEqual(withFull.story);
    // And the bundle's own autonomous story beats (b1, empty) never leak into the story section.
    expect(withFull.story.appliedBeatIds).toEqual(["b1", "b2"]);
    expect(withFull.story.residents).toEqual(["c-2", "c-3", "c-4"]);
  });

  it("side-by-side-not-chained: story residents come from the caller, not from the bundle's outing residents", () => {
    const result = gardenOutingAttractionSpawnCompositionStory({
      outingAttractionSpawnComposition: fullCompositionInputs(),
      story: {
        residents: ["r-9"],
        beats: [{ id: "b1", arrivals: ["r-10"], departures: [] }],
        throughBeatId: "b1",
      },
    });
    // The bundle's outing residents are c-1/c-2; the story section never borrows them.
    expect(result.story).toEqual({
      residents: ["r-9", "r-10"],
      arrived: ["r-10"],
      departed: [],
      appliedBeatIds: ["b1"],
    });
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnCompositionStory(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({ story: minimalStory() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: { ...minimalStory(), residents: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: { ...minimalStory(), beats: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: { ...minimalStory(), throughBeatId: "" },
      }),
    ).toThrow();
    // Duplicate beat id: loud failure, never a silent merge.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: {
          residents: [],
          beats: [
            { id: "b1", arrivals: [], departures: [] },
            { id: "b1", arrivals: [], departures: [] },
          ],
          throughBeatId: "b1",
        },
      }),
    ).toThrow();
    // Unknown cursor: loud failure, never a silent fallback to the last beat.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: { ...minimalStory(), throughBeatId: "b-nope" },
      }),
    ).toThrow(/throughBeatId names no beat/);
    // Story failure propagation: a beat that both arrives and departs the same resident.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: minimalCompositionInputs(),
        story: {
          residents: [],
          beats: [{ id: "b1", arrivals: ["x-1"], departures: ["x-1"] }],
          throughBeatId: "b1",
        },
      }),
    ).toThrow();
    // Bundle failure propagation: duplicate composition entry id in the slice-54 bundle.
    expect(() =>
      gardenOutingAttractionSpawnCompositionStory({
        outingAttractionSpawnComposition: {
          outingAttractionSpawn: fullSpawnInputs(),
          composition: { entries: [compositionEntryFull(), compositionEntryFull()] },
        },
        story: minimalStory(),
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullStoryInputs();
    const first = gardenOutingAttractionSpawnCompositionStory(inputs);
    first.story.residents.push("r-fake");
    first.story.appliedBeatIds.push("b-fake");
    first.story.arrived.push("r-fake");
    first.outingAttractionSpawnComposition.composition[0].variants.push("v-fake");
    first.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness["small-ground"] = 99;
    const second = gardenOutingAttractionSpawnCompositionStory(inputs);
    expect(second.story).toEqual({
      residents: ["c-2", "c-3", "c-4"],
      arrived: ["c-3", "c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1", "b2"],
    });
    expect(second.outingAttractionSpawnComposition.composition[0].variants).toEqual(["v-hydrated"]);
    expect(second.outingAttractionSpawnComposition.outingAttractionSpawn.spawn[0].richness).toEqual({
      "small-ground": 2,
      water: 1,
    });
    expect(inputs.story.beats.map((b) => b.id)).toEqual(["b1", "b2", "b3"]);
    expect(inputs.outingAttractionSpawnComposition.composition.entries.map((e) => e.id)).toEqual(["k-1"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnCompositionStory({
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
    });
    expect(result.story).toEqual({
      residents: ["res-Ω"],
      arrived: ["res-Ω"],
      departed: ["res-Δ"],
      appliedBeatIds: ["beat-Ω"],
    });
    expect(result.outingAttractionSpawnComposition.composition[0].variants).toEqual(["v-Δ"]);
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition-story", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition-story");
    }
  });
});
