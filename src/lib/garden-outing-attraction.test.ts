// S14 slice 52 tests — B3 outing + habitats + attraction bundle (pure library).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gardenOutingAttraction,
  type AttractionEntry,
  type GardenOutingAttractionInputs,
} from "./garden-outing-attraction";
import {
  gardenOutingHabitats,
  type GardenOutingHabitatsInputs,
  type HabitatEntry,
} from "./garden-outing-habitats";
import {
  gardenOutingAutonomous,
  type AutonomousEntry,
  type GardenOutingAutonomousInputs,
} from "./garden-outing-autonomous";
import { attractionRichness } from "./garden-attraction";
import {
  solveHabitat,
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

describe("garden-outing-attraction (B3 outing + habitats + attraction)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs = minimalAttractionInputs();
    const result = gardenOutingAttraction(inputs);
    expect(result.outingHabitats).toEqual(gardenOutingHabitats(inputs.outingHabitats));
    expect(result.attraction).toEqual([]);
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullAttractionInputs();
    const result = gardenOutingAttraction(inputs);
    expect(result.outingHabitats).toEqual(gardenOutingHabitats(inputs.outingHabitats));
    expect(result.attraction).toEqual(
      inputs.attraction.entries.map((entry) => ({
        id: entry.id,
        richness: attractionRichness(
          entry.habitats,
          (recipeId: string) => entry.classes[recipeId] ?? [],
        ),
      })),
    );
    // Hand-checked numbers.
    expect(result.attraction[0].richness).toEqual({ "small-ground": 2, water: 1 });
    expect(result.attraction[1].richness).toEqual({ "small-ground": 1, canopy: 1 });
    expect(result.attraction[2].richness).toEqual({});
    // Inherited habitat numbers from the outing-habitats section.
    expect(result.outingHabitats.habitats[0].solved).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
    expect(result.outingHabitats.habitats[0].solved).toEqual(
      solveHabitat(habitatEntryFull().placement, habitatRecipes()),
    );
  });

  it("outing-habitats-only and attraction-with-minimal-outing-habitats bundles", () => {
    const only = gardenOutingAttraction({
      outingHabitats: {
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: [habitatEntryFull()] },
      },
      attraction: { entries: [] },
    });
    expect(only.attraction).toEqual([]);
    expect(only.outingHabitats.habitats[0].solved?.recipeId).toBe("rec-h1");
    const withMinimal = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: { entries: [attractionEntryFull()] },
    });
    expect(withMinimal.outingHabitats.habitats).toEqual([]);
    expect(withMinimal.attraction[0].richness).toEqual({ "small-ground": 2, water: 1 });
  });

  it("caller order is preserved", () => {
    const result = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: {
        entries: [attractionEntryUnmapped(), attractionEntryFull(), attractionEntryMixed()],
      },
    });
    expect(result.attraction.map((entry) => entry.id)).toEqual(["a-3", "a-1", "a-2"]);
  });

  it("null and empty habitats read empty, never a fabricated richness", () => {
    const result = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: {
        entries: [
          { id: "a-nulls", habitats: [null, null], classes: classesTable() },
          { id: "a-empty", habitats: [], classes: classesTable() },
          { id: "a-unmapped", habitats: [solved("no-such-recipe")], classes: classesTable() },
        ],
      },
    });
    expect(result.attraction.map((entry) => entry.richness)).toEqual([{}, {}, {}]);
  });

  it("exact result shape: two sections only, reading exactly id + richness", () => {
    const result = gardenOutingAttraction(fullAttractionInputs());
    expect(Object.keys(result).sort()).toEqual(["attraction", "outingHabitats"]);
    expect(Object.keys(result.attraction[0]).sort()).toEqual(["id", "richness"]);
    expect("attraction" in (result.outingHabitats as object)).toBe(false);
  });

  it("side-by-side-not-merged: same attraction input reads identically with a minimal and a full outing-habitats section", () => {
    const entry = attractionEntryFull();
    const withMinimal = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: { entries: [entry] },
    });
    const withFull = gardenOutingAttraction({
      outingHabitats: {
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: [habitatEntryFull()] },
      },
      attraction: { entries: [entry] },
    });
    expect(withMinimal.attraction).toEqual(withFull.attraction);
    // A solved habitat in the attraction entry but absent from the
    // outing habitats section is still counted.
    const unrelated = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: {
        entries: [
          { id: "a-unrelated", habitats: [solved("pond-edge")], classes: classesTable() },
        ],
      },
    });
    expect(unrelated.attraction[0].richness).toEqual({ water: 1 });
  });

  it("side-by-side-not-chained: attraction richness comes from its own habitats, not the outing habitats section", () => {
    const result = gardenOutingAttraction({
      outingHabitats: {
        outingAutonomous: minimalOutingAutonomous(),
        habitats: { entries: [habitatEntryFull()] },
      },
      attraction: {
        entries: [
          { id: "a-own", habitats: [solved("meadow-patch")], classes: classesTable() },
          { id: "a-none", habitats: [], classes: classesTable() },
        ],
      },
    });
    // The outing habitats section solved rec-h1; the attraction
    // section does not inherit it — its counts come from its own
    // solved habitats alone.
    expect(result.attraction[0].richness).toEqual({ "small-ground": 1 });
    expect(result.attraction[1].richness).toEqual({});
    expect(result.outingHabitats.habitats[0].solved?.recipeId).toBe("rec-h1");
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttraction(null as never)).toThrow();
    expect(() =>
      gardenOutingAttraction({ attraction: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({ outingHabitats: minimalHabitatsInputs() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: { entries: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: { entries: [{ ...attractionEntryFull(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: { entries: [attractionEntryFull(), attractionEntryFull()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: {
          entries: [{ id: "a-bad", habitats: "nope" as never, classes: classesTable() }],
        },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: {
          entries: [{ id: "a-bad", habitats: [], classes: null as never }],
        },
      }),
    ).toThrow();
    // Attraction failure propagation: solved habitat with an empty recipe id.
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: minimalHabitatsInputs(),
        attraction: {
          entries: [
            {
              id: "a-bad",
              habitats: [{ recipeId: "", tier: 1, extent: 1, finish: 1, character: null }],
              classes: classesTable(),
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-habitats failure propagation: duplicate habitat entry id.
    expect(() =>
      gardenOutingAttraction({
        outingHabitats: {
          outingAutonomous: minimalOutingAutonomous(),
          habitats: { entries: [habitatEntryFull(), habitatEntryFull()] },
        },
        attraction: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullAttractionInputs();
    const first = gardenOutingAttraction(inputs);
    first.attraction[0].richness["small-ground"] = 99;
    first.attraction.push({ id: "a-fake", richness: {} });
    first.outingHabitats.outingAutonomous.autonomous[0].migration.residents.push("c-fake");
    const second = gardenOutingAttraction(inputs);
    expect(second.attraction[0].richness).toEqual({ "small-ground": 2, water: 1 });
    expect(second.attraction).toHaveLength(3);
    expect(second.outingHabitats.outingAutonomous.autonomous[0].migration.residents).toEqual([
      "c-1",
      "c-2",
    ]);
    expect(inputs.attraction.entries[0].habitats.map((h) => h?.recipeId)).toEqual([
      "meadow-patch",
      "meadow-patch",
      "pond-edge",
    ]);
    expect(Object.keys(inputs.attraction.entries[0].classes).sort()).toEqual([
      "meadow-patch",
      "mixed-border",
      "pond-edge",
    ]);
  });

  it("caller-vocabulary ids and classes pass through unchanged", () => {
    const result = gardenOutingAttraction({
      outingHabitats: minimalHabitatsInputs(),
      attraction: {
        entries: [
          {
            id: "a-Δ",
            habitats: [solved("rec-Δ")],
            classes: { "rec-Δ": ["class-Δ", "class-Ω"] },
          },
        ],
      },
    });
    expect(result.attraction[0]).toEqual({
      id: "a-Δ",
      richness: { "class-Δ": 1, "class-Ω": 1 },
    });
  });

  it("staging locks: no host file imports garden-outing-attraction", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction");
    }
  });
});
