// S14 slice 54 tests — B3 outing + attraction + spawn + composition bundle (pure library).
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

describe("garden-outing-attraction-spawn-composition (B3 outing + attraction + spawn + composition)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs = minimalCompositionInputs();
    const result = gardenOutingAttractionSpawnComposition(inputs);
    expect(result.outingAttractionSpawn).toEqual(
      gardenOutingAttractionSpawn(inputs.outingAttractionSpawn),
    );
    expect(result.composition).toEqual([]);
  });

  it("full bundle: each section exactly as its own read reports it, with hand-checked numbers", () => {
    const inputs = fullCompositionInputs();
    const result = gardenOutingAttractionSpawnComposition(inputs);
    expect(result.outingAttractionSpawn).toEqual(
      gardenOutingAttractionSpawn(inputs.outingAttractionSpawn),
    );
    const bundle = gardenOutingAttractionSpawn(inputs.outingAttractionSpawn);
    const named = bundle.outingAttraction.outingHabitats.habitats.find(
      (r) => r.id === "h-1",
    )!;
    expect(result.composition).toEqual([
      {
        id: "k-1",
        habitatId: "h-1",
        base: named.solved === null ? null : { ...named.solved },
        variants: ["v-hydrated"],
        combos: ["combo-hotel"],
      },
    ]);
    expect(result.composition[0]).toEqual({
      id: "k-1",
      habitatId: "h-1",
      base: composeHabitat(named.solved, compositionFull()).base,
      variants: composeHabitat(named.solved, compositionFull()).variants,
      combos: composeHabitat(named.solved, compositionFull()).combos,
    });
    // Hand-checked numbers: h-1 solves rec-h1 tier 2 extent 3 finish 6 character wood;
    // water tag fires v-hydrated (tree modifier applies only to rec-other, so no
    // v-shaded; the duplicate v-hydrated row emits once); rec-h1 + neighbour
    // rec-h2 fires combo-hotel once. Composition never changes the base.
    expect(result.composition[0].base).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
    expect(result.composition[0].variants).toEqual(["v-hydrated"]);
    expect(result.composition[0].combos).toEqual(["combo-hotel"]);
    // Inherited spawn numbers from the slice-53 section are untouched.
    expect(result.outingAttractionSpawn.spawn[0].richness).toEqual({
      "small-ground": 2,
      water: 1,
    });
  });

  it("outing-attraction-spawn-only and composition-with-empty-spawn bundles", () => {
    const only = gardenOutingAttractionSpawnComposition({
      outingAttractionSpawn: fullSpawnInputs(),
      composition: { entries: [] },
    });
    expect(only.composition).toEqual([]);
    expect(only.outingAttractionSpawn.spawn).toHaveLength(3);
    const withEmptySpawn = gardenOutingAttractionSpawnComposition({
      outingAttractionSpawn: {
        outingAttraction: fullAttractionInputs(),
        spawn: { entries: [] },
      },
      composition: { entries: [compositionEntryFull()] },
    });
    expect(withEmptySpawn.outingAttractionSpawn.spawn).toEqual([]);
    expect(withEmptySpawn.composition[0].variants).toEqual(["v-hydrated"]);
    expect(withEmptySpawn.composition[0].combos).toEqual(["combo-hotel"]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingAttractionSpawnComposition(
      fullCompositionInputsWithNull(),
    );
    expect(result.composition.map((entry) => entry.id)).toEqual([
      "k-1",
      "k-null",
    ]);
    const reversed = gardenOutingAttractionSpawnComposition({
      outingAttractionSpawn: fullCompositionInputsWithNull().outingAttractionSpawn,
      composition: { entries: [compositionEntryNullBase(), compositionEntryFull()] },
    });
    expect(reversed.composition.map((entry) => entry.id)).toEqual([
      "k-null",
      "k-1",
    ]);
  });

  it("null base: no variants, neighbours-only combo still fires, never a fabricated base", () => {
    const result = gardenOutingAttractionSpawnComposition(
      fullCompositionInputsWithNull(),
    );
    expect(
      result.outingAttractionSpawn.outingAttraction.outingHabitats.habitats[1].solved,
    ).toBeNull();
    expect(result.composition[1]).toEqual({
      id: "k-null",
      habitatId: "h-null",
      base: null,
      variants: [],
      combos: ["combo-hotel"],
    });
    const bare = gardenOutingAttractionSpawnComposition({
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
      composition: { entries: [{ id: "k-bare", habitatId: "h-1" }] },
    });
    expect(bare.composition[0]).toEqual({
      id: "k-bare",
      habitatId: "h-1",
      base: {
        recipeId: "rec-h1",
        tier: 2,
        extent: 3,
        finish: 6,
        character: "wood",
      },
      variants: [],
      combos: [],
    });
  });

  it("exact result shape: two sections only, reading exactly id + habitatId + base + variants + combos", () => {
    const result = gardenOutingAttractionSpawnComposition(fullCompositionInputs());
    expect(Object.keys(result).sort()).toEqual([
      "composition",
      "outingAttractionSpawn",
    ]);
    expect(Object.keys(result.composition[0]).sort()).toEqual([
      "base",
      "combos",
      "habitatId",
      "id",
      "variants",
    ]);
    expect(Object.keys(result.composition[0].base as object).sort()).toEqual([
      "character",
      "extent",
      "finish",
      "recipeId",
      "tier",
    ]);
    expect("composition" in (result.outingAttractionSpawn as object)).toBe(false);
  });

  it("named-reading selection: a composition entry reads only the reading it names", () => {
    const result = gardenOutingAttractionSpawnComposition(
      fullCompositionInputsWithNull(),
    );
    // k-1 named h-1 (rec-h1); k-null named h-null (null). Neither borrows the
    // other's base, and neither reads the attraction entries' recipes.
    expect(result.composition[0].base?.recipeId).toBe("rec-h1");
    expect(result.composition[1].base).toBeNull();
  });

  it("side-by-side-not-merged: same composition input reads identically with a habitats-only and a full bundle", () => {
    const entry = compositionEntryFull();
    const withHabitatsOnly = gardenOutingAttractionSpawnComposition({
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
      composition: { entries: [entry] },
    });
    const withFull = gardenOutingAttractionSpawnComposition(fullCompositionInputs());
    expect(withHabitatsOnly.composition).toEqual(withFull.composition);
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawnComposition(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({ composition: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: minimalSpawnInputs(),
      } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: minimalSpawnInputs(),
        composition: { entries: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: fullSpawnInputs(),
        composition: { entries: [{ ...compositionEntryFull(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: fullSpawnInputs(),
        composition: { entries: [compositionEntryFull(), compositionEntryFull()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: fullSpawnInputs(),
        composition: { entries: [{ ...compositionEntryFull(), habitatId: "" }] },
      }),
    ).toThrow();
    // Unknown habitat reading id: loud failure, never a silent fallback.
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: fullSpawnInputs(),
        composition: { entries: [{ id: "k-bad", habitatId: "h-nope" }] },
      }),
    ).toThrow(/unknown habitat reading id/);
    // Unknown reading with a minimal bundle (no readings at all).
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: minimalSpawnInputs(),
        composition: { entries: [{ id: "k-bad", habitatId: "h-1" }] },
      }),
    ).toThrow(/unknown habitat reading id/);
    // Composition failure propagation: empty context tag.
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: fullSpawnInputs(),
        composition: {
          entries: [
            {
              id: "k-bad",
              habitatId: "h-1",
              composition: { contextTags: [""] },
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-attraction-spawn failure propagation: duplicate spawn entry id.
    expect(() =>
      gardenOutingAttractionSpawnComposition({
        outingAttractionSpawn: {
          outingAttraction: fullAttractionInputs(),
          spawn: { entries: [spawnEntryGround(), spawnEntryGround()] },
        },
        composition: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullCompositionInputs();
    const first = gardenOutingAttractionSpawnComposition(inputs);
    (first.composition[0].base as SolvedHabitat).recipeId = "rec-fake";
    first.composition[0].variants.push("v-fake");
    first.composition[0].combos.push("combo-fake");
    first.composition.push({
      id: "k-fake",
      habitatId: "h-1",
      base: null,
      variants: [],
      combos: [],
    });
    first.outingAttractionSpawn.spawn[0].richness["small-ground"] = 99;
    const second = gardenOutingAttractionSpawnComposition(inputs);
    expect(second.composition[0].base?.recipeId).toBe("rec-h1");
    expect(second.composition[0].variants).toEqual(["v-hydrated"]);
    expect(second.composition[0].combos).toEqual(["combo-hotel"]);
    expect(second.composition).toHaveLength(1);
    expect(second.outingAttractionSpawn.spawn[0].richness).toEqual({
      "small-ground": 2,
      water: 1,
    });
    expect(inputs.composition.entries.map((e) => e.id)).toEqual(["k-1"]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const result = gardenOutingAttractionSpawnComposition({
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
    });
    expect(result.composition[0]).toEqual({
      id: "k-Δ",
      habitatId: "h-1",
      base: {
        recipeId: "rec-h1",
        tier: 2,
        extent: 3,
        finish: 6,
        character: "wood",
      },
      variants: ["v-Δ"],
      combos: [],
    });
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn-composition", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn-composition");
    }
  });
});
