// S14 slice 53 tests — B3 outing + attraction + spawn bundle (pure library).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
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

describe("garden-outing-attraction-spawn (B3 outing + attraction + spawn)", () => {
  it("minimal inputs read back unchanged", () => {
    const inputs = minimalSpawnInputs();
    const result = gardenOutingAttractionSpawn(inputs);
    expect(result.outingAttraction).toEqual(gardenOutingAttraction(inputs.outingAttraction));
    expect(result.spawn).toEqual([]);
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = fullSpawnInputs();
    const result = gardenOutingAttractionSpawn(inputs);
    expect(result.outingAttraction).toEqual(gardenOutingAttraction(inputs.outingAttraction));
    const bundle = gardenOutingAttraction(inputs.outingAttraction);
    expect(result.spawn).toEqual(
      inputs.spawn.entries.map((entry) => {
        const reading = bundle.attraction.find((r) => r.id === entry.attractionId)!;
        return {
          id: entry.id,
          attractionId: entry.attractionId,
          richness: { ...reading.richness },
          rows: attractSpawnRows(entry.rows, reading.richness),
        };
      }),
    );
    // Hand-checked numbers: a-1 richness small-ground 2, water 1.
    expect(result.spawn[0].richness).toEqual({ "small-ground": 2, water: 1 });
    expect(result.spawn[0].rows.map((r) => r.attraction)).toEqual([
      { habitatClass: "small-ground", richness: 2, attracted: true },
      { habitatClass: "water", richness: 1, attracted: true },
      { habitatClass: "canopy", richness: 0, attracted: false },
      { habitatClass: null, richness: 0, attracted: false },
      { habitatClass: null, richness: 0, attracted: false },
    ]);
    // Weights, species and order ride along untouched — no reweighting, no stock change.
    expect(result.spawn[0].rows.map((r) => [r.species, r.weight])).toEqual([
      ["sp-a", 10],
      ["sp-b", 5],
      ["sp-c", 7],
      ["sp-d", 3],
      ["sp-e", 9],
    ]);
    // a-2 richness small-ground 1, canopy 1.
    expect(result.spawn[1].richness).toEqual({ "small-ground": 1, canopy: 1 });
    expect(result.spawn[1].rows.map((r) => r.attraction)).toEqual([
      { habitatClass: "small-ground", richness: 1, attracted: true },
      { habitatClass: "canopy", richness: 1, attracted: true },
      { habitatClass: "water", richness: 0, attracted: false },
    ]);
    // a-3 richness {}: every row unattracted.
    expect(result.spawn[2].richness).toEqual({});
    expect(result.spawn[2].rows[0].attraction).toEqual({
      habitatClass: "small-ground",
      richness: 0,
      attracted: false,
    });
    // Inherited habitat numbers from the outing-attraction section.
    expect(result.outingAttraction.outingHabitats.habitats[0].solved).toEqual({
      recipeId: "rec-h1",
      tier: 2,
      extent: 3,
      finish: 6,
      character: "wood",
    });
  });

  it("outing-attraction-only and spawn-with-minimal-outing-attraction bundles", () => {
    const only = gardenOutingAttractionSpawn({
      outingAttraction: {
        outingHabitats: {
          outingAutonomous: minimalOutingAutonomous(),
          habitats: { entries: [habitatEntryFull()] },
        },
        attraction: { entries: [attractionEntryFull()] },
      },
      spawn: { entries: [] },
    });
    expect(only.spawn).toEqual([]);
    expect(only.outingAttraction.attraction[0].richness).toEqual({
      "small-ground": 2,
      water: 1,
    });
    const withMinimal = gardenOutingAttractionSpawn({
      outingAttraction: minimalAttractionInputs(),
      spawn: { entries: [] },
    });
    expect(withMinimal.outingAttraction.attraction).toEqual([]);
    expect(withMinimal.spawn).toEqual([]);
  });

  it("caller order is preserved", () => {
    const result = gardenOutingAttractionSpawn({
      outingAttraction: fullAttractionInputs(),
      spawn: {
        entries: [spawnEntryUnmapped(), spawnEntryGround(), spawnEntryMixed()],
      },
    });
    expect(result.spawn.map((entry) => entry.id)).toEqual(["s-3", "s-1", "s-2"]);
    expect(result.spawn[1].rows.map((r) => r.species)).toEqual([
      "sp-a",
      "sp-b",
      "sp-c",
      "sp-d",
      "sp-e",
    ]);
  });

  it("empty rows and empty richness read unattracted, never a fabricated annotation", () => {
    const result = gardenOutingAttractionSpawn({
      outingAttraction: {
        outingHabitats: minimalHabitatsInputs(),
        attraction: { entries: [attractionEntryUnmapped()] },
      },
      spawn: {
        entries: [
          { id: "s-empty", attractionId: "a-3", rows: [] },
          {
            id: "s-unmapped",
            attractionId: "a-3",
            rows: [{ species: "sp-x", weight: 1, habitatClass: "small-ground" }],
          },
        ],
      },
    });
    expect(result.spawn[0].rows).toEqual([]);
    expect(result.spawn[1].rows[0].attraction).toEqual({
      habitatClass: "small-ground",
      richness: 0,
      attracted: false,
    });
    expect(result.spawn[1].rows[0].weight).toBe(1);
  });

  it("exact result shape: two sections only, reading exactly id + attractionId + richness + rows", () => {
    const result = gardenOutingAttractionSpawn(fullSpawnInputs());
    expect(Object.keys(result).sort()).toEqual(["outingAttraction", "spawn"]);
    expect(Object.keys(result.spawn[0]).sort()).toEqual([
      "attractionId",
      "id",
      "richness",
      "rows",
    ]);
    expect(Object.keys(result.spawn[0].rows[0]).sort()).toEqual([
      "attraction",
      "habitatClass",
      "species",
      "weight",
    ]);
    expect(Object.keys(result.spawn[0].rows[0].attraction).sort()).toEqual([
      "attracted",
      "habitatClass",
      "richness",
    ]);
    expect("spawn" in (result.outingAttraction as object)).toBe(false);
  });

  it("named-reading selection: a spawn entry reads only the reading it names", () => {
    const result = gardenOutingAttractionSpawn({
      outingAttraction: fullAttractionInputs(),
      spawn: {
        entries: [
          {
            id: "s-named",
            attractionId: "a-2",
            rows: [{ species: "sp-y", weight: 1, habitatClass: "small-ground" }],
          },
        ],
      },
    });
    // a-1 would give small-ground 2; a-2 gives 1. The entry named a-2.
    expect(result.spawn[0].richness).toEqual({ "small-ground": 1, canopy: 1 });
    expect(result.spawn[0].rows[0].attraction.richness).toBe(1);
  });

  it("side-by-side-not-merged: same spawn input reads identically with a minimal and a full outing-attraction section", () => {
    const entry = spawnEntryGround();
    const withMinimal = gardenOutingAttractionSpawn({
      outingAttraction: {
        outingHabitats: minimalHabitatsInputs(),
        attraction: { entries: [attractionEntryFull()] },
      },
      spawn: { entries: [entry] },
    });
    const withFull = gardenOutingAttractionSpawn({
      outingAttraction: fullAttractionInputs(),
      spawn: { entries: [entry] },
    });
    expect(withMinimal.spawn).toEqual(withFull.spawn);
    // A reading over habitats absent from the outing habitats
    // section still annotates: the spawn section reads the named
    // reading, not the outing habitats section.
    expect(withMinimal.spawn[0].rows[0].attraction.richness).toBe(2);
  });

  it("loud failures", () => {
    expect(() => gardenOutingAttractionSpawn(null as never)).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({ spawn: { entries: [] } } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({ outingAttraction: minimalAttractionInputs() } as never),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: minimalAttractionInputs(),
        spawn: { entries: "nope" as never },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: { entries: [{ ...spawnEntryGround(), id: "" }] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: { entries: [spawnEntryGround(), spawnEntryGround()] },
      }),
    ).toThrow();
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: { entries: [{ ...spawnEntryGround(), attractionId: "" }] },
      }),
    ).toThrow();
    // Unknown attraction reading id: loud failure, never a silent fallback.
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: {
          entries: [{ id: "s-bad", attractionId: "a-nope", rows: [] }],
        },
      }),
    ).toThrow(/unknown attraction reading id/);
    // Unknown reading with a minimal bundle (no readings at all).
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: minimalAttractionInputs(),
        spawn: {
          entries: [{ id: "s-bad", attractionId: "a-1", rows: [] }],
        },
      }),
    ).toThrow(/unknown attraction reading id/);
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: { entries: [{ id: "s-bad", attractionId: "a-1", rows: "nope" as never }] },
      }),
    ).toThrow();
    // Spawn-row failure propagation: empty-string habitatClass.
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: fullAttractionInputs(),
        spawn: {
          entries: [
            {
              id: "s-bad",
              attractionId: "a-1",
              rows: [{ species: "sp-z", weight: 1, habitatClass: "" }],
            },
          ],
        },
      }),
    ).toThrow();
    // Outing-attraction failure propagation: duplicate attraction entry id.
    expect(() =>
      gardenOutingAttractionSpawn({
        outingAttraction: {
          outingHabitats: minimalHabitatsInputs(),
          attraction: { entries: [attractionEntryFull(), attractionEntryFull()] },
        },
        spawn: { entries: [] },
      }),
    ).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = fullSpawnInputs();
    const first = gardenOutingAttractionSpawn(inputs);
    first.spawn[0].richness["small-ground"] = 99;
    first.spawn[0].rows[0].weight = 99;
    first.spawn[0].rows[0].attraction.richness = 99;
    first.spawn.push({
      id: "s-fake",
      attractionId: "a-1",
      richness: {},
      rows: [],
    });
    first.outingAttraction.outingHabitats.outingAutonomous.autonomous[0].migration.residents.push(
      "c-fake",
    );
    const second = gardenOutingAttractionSpawn(inputs);
    expect(second.spawn[0].richness).toEqual({ "small-ground": 2, water: 1 });
    expect(second.spawn[0].rows[0].weight).toBe(10);
    expect(second.spawn[0].rows[0].attraction.richness).toBe(2);
    expect(second.spawn).toHaveLength(3);
    expect(
      second.outingAttraction.outingHabitats.outingAutonomous.autonomous[0].migration.residents,
    ).toEqual(["c-1", "c-2"]);
    expect(inputs.spawn.entries[0].rows.map((r) => r.species)).toEqual([
      "sp-a",
      "sp-b",
      "sp-c",
      "sp-d",
      "sp-e",
    ]);
    expect(inputs.spawn.entries.map((e) => e.id)).toEqual(["s-1", "s-2", "s-3"]);
  });

  it("caller-vocabulary ids and classes pass through unchanged", () => {
    const result = gardenOutingAttractionSpawn({
      outingAttraction: {
        outingHabitats: minimalHabitatsInputs(),
        attraction: {
          entries: [
            {
              id: "a-Δ",
              habitats: [solved("rec-Δ")],
              classes: { "rec-Δ": ["class-Δ"] },
            },
          ],
        },
      },
      spawn: {
        entries: [
          {
            id: "s-Δ",
            attractionId: "a-Δ",
            rows: [{ species: "sp-Δ", weight: 1, habitatClass: "class-Δ" }],
          },
        ],
      },
    });
    expect(result.spawn[0]).toEqual({
      id: "s-Δ",
      attractionId: "a-Δ",
      richness: { "class-Δ": 1 },
      rows: [
        {
          species: "sp-Δ",
          weight: 1,
          habitatClass: "class-Δ",
          attraction: { habitatClass: "class-Δ", richness: 1, attracted: true },
        },
      ],
    });
  });

  it("staging locks: no host file imports garden-outing-attraction-spawn", () => {
    for (const file of [
      "src/lib/garden-wiring.ts",
      "src/components/views/GardenView.tsx",
      "src/lib/encounters.ts",
      "src/lib/spawnSelector.ts",
    ]) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("garden-outing-attraction-spawn");
    }
  });
});
