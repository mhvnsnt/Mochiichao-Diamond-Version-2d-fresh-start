// S14 slice 4 tests — DQB2 W4 attraction binding (pure library).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  attractSpawnRows,
  attractionByZone,
  attractionRichness,
  type ClassesForRecipe,
} from "./garden-attraction";
import type { SolvedHabitat } from "./garden-habitats";

function habitat(recipeId: string): SolvedHabitat {
  return { recipeId, tier: 1, extent: 3, finish: 5, character: null };
}

// Recipe -> class table for the fixtures. Mirrors the real bundle classes
// (small-ground, water, canopy) without importing bundle data: the mapping
// is caller data, and these fixtures stand in for it.
const classesFor: ClassesForRecipe = (recipeId) => {
  switch (recipeId) {
    case "meadow-patch":
      return ["small-ground"];
    case "pond-edge":
      return ["water"];
    case "canopy-grove":
      return ["canopy"];
    case "mixed-border":
      return ["small-ground", "canopy"];
    default:
      return [];
  }
};

// Meadow rows shaped like the garden-complex bundle's grass table.
const meadowRows = [
  { speciesId: "sproutle", habitatClass: "small-ground", weight: 30, minLevel: 2, maxLevel: 4 },
  { speciesId: "pupbble", habitatClass: "small-ground", weight: 25, minLevel: 2, maxLevel: 4 },
  { speciesId: "zephling", habitatClass: null, weight: 15, minLevel: 2, maxLevel: 4 },
  { speciesId: "kittember", habitatClass: "small-ground", weight: 10, minLevel: 3, maxLevel: 5 },
];
const pondRow = { speciesId: "squirmite", habitatClass: "water", weight: 20, minLevel: 2, maxLevel: 3 };

describe("attractionRichness", () => {
  it("empty habitats mean empty richness", () => {
    expect(attractionRichness([], classesFor)).toEqual({});
    expect(attractionRichness([null, null], classesFor)).toEqual({});
  });

  it("counts one recognised habitat per class", () => {
    expect(attractionRichness([habitat("meadow-patch")], classesFor)).toEqual({
      "small-ground": 1,
    });
  });

  it("two habitats of one class give richness 2", () => {
    expect(
      attractionRichness([habitat("meadow-patch"), habitat("meadow-patch")], classesFor),
    ).toEqual({ "small-ground": 2 });
  });

  it("one habitat realising two classes counts both, once each", () => {
    expect(attractionRichness([habitat("mixed-border")], classesFor)).toEqual({
      "small-ground": 1,
      canopy: 1,
    });
  });

  it("a recipe with no mapping contributes nothing", () => {
    expect(attractionRichness([habitat("unmapped-recipe")], classesFor)).toEqual({});
  });

  it("dedupes a repeated class inside one recipe's mapping", () => {
    const dup: ClassesForRecipe = () => ["small-ground", "small-ground"];
    expect(attractionRichness([habitat("meadow-patch")], dup)).toEqual({
      "small-ground": 1,
    });
  });

  it("fails loudly on bad input", () => {
    expect(() => attractionRichness([{ recipeId: "" } as SolvedHabitat], classesFor)).toThrow(
      /recipeId/,
    );
    expect(() => attractionRichness([habitat("meadow-patch")], () => "small-ground" as never)).toThrow(
      /must be an array/,
    );
    expect(() => attractionRichness([habitat("meadow-patch")], () => [""])).toThrow(
      /non-empty string/,
    );
  });
});

describe("attractionByZone", () => {
  it("maps the W3 cache shape zone by zone, null zones empty", () => {
    expect(
      attractionByZone(
        { meadow: habitat("meadow-patch"), pond: null, grove: habitat("canopy-grove") },
        classesFor,
      ),
    ).toEqual({ meadow: { "small-ground": 1 }, pond: {}, grove: { canopy: 1 } });
    expect(attractionByZone({}, classesFor)).toEqual({});
  });
});

describe("attractSpawnRows", () => {
  it("with no richness every row is unattracted and stock fields are untouched", () => {
    const before = JSON.stringify(meadowRows);
    const out = attractSpawnRows(meadowRows, {});
    expect(out).toHaveLength(4);
    for (const [i, row] of out.entries()) {
      expect(row.attraction).toEqual({ habitatClass: meadowRows[i].habitatClass, richness: 0, attracted: false });
      expect(row.speciesId).toBe(meadowRows[i].speciesId);
      expect(row.weight).toBe(meadowRows[i].weight);
      expect(row.minLevel).toBe(meadowRows[i].minLevel);
      expect(row.maxLevel).toBe(meadowRows[i].maxLevel);
    }
    expect(JSON.stringify(meadowRows)).toBe(before);
    expect(out.map((r) => r.speciesId)).toEqual(meadowRows.map((r) => r.speciesId));
  });

  it("a recognised small-ground habitat attracts only its declared class", () => {
    const richness = attractionRichness([habitat("meadow-patch")], classesFor);
    const out = attractSpawnRows([...meadowRows, pondRow], richness);
    expect(out[0].attraction).toEqual({ habitatClass: "small-ground", richness: 1, attracted: true });
    expect(out[1].attraction).toEqual({ habitatClass: "small-ground", richness: 1, attracted: true });
    expect(out[2].attraction).toEqual({ habitatClass: null, richness: 0, attracted: false });
    expect(out[3].attraction).toEqual({ habitatClass: "small-ground", richness: 1, attracted: true });
    expect(out[4].attraction).toEqual({ habitatClass: "water", richness: 0, attracted: false });
  });

  it("richness rides through at its counted value; stock never changes", () => {
    const richness = attractionRichness(
      [habitat("meadow-patch"), habitat("mixed-border")],
      classesFor,
    );
    expect(richness).toEqual({ "small-ground": 2, canopy: 1 });
    const out = attractSpawnRows(meadowRows, richness);
    expect(out[0].attraction.richness).toBe(2);
    expect(out.map((r) => r.weight)).toEqual([30, 25, 15, 10]);
  });

  it("never mutates rows or the richness map", () => {
    const richness = { "small-ground": 1 };
    const rowsBefore = JSON.stringify(meadowRows);
    const richnessBefore = JSON.stringify(richness);
    attractSpawnRows(meadowRows, richness);
    expect(JSON.stringify(meadowRows)).toBe(rowsBefore);
    expect(JSON.stringify(richness)).toBe(richnessBefore);
  });

  it("fails loudly on bad rows and bad richness", () => {
    expect(() => attractSpawnRows([null as never], {})).toThrow(/row 0/);
    expect(() =>
      attractSpawnRows([{ habitatClass: 7 } as never], {}),
    ).toThrow(/habitatClass/);
    expect(() => attractSpawnRows([{ habitatClass: "" }], {})).toThrow(/habitatClass/);
    expect(() => attractSpawnRows(meadowRows, { "small-ground": -1 })).toThrow(/integer >= 0/);
    expect(() => attractSpawnRows(meadowRows, { "small-ground": 1.5 })).toThrow(/integer >= 0/);
  });
});

describe("S14 slice-4 staging locks", () => {
  it("no host reads the attraction binding yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    expect(wiring).not.toContain("garden-attraction");
    const view = readFileSync(new URL("../components/views/GardenView.tsx", import.meta.url), "utf8");
    expect(view).not.toContain("garden-attraction");
    const encounters = readFileSync(new URL("./encounters.ts", import.meta.url), "utf8");
    expect(encounters).not.toContain("garden-attraction");
    const selector = readFileSync(new URL("./spawnSelector.ts", import.meta.url), "utf8");
    expect(selector).not.toContain("garden-attraction");
  });
});
