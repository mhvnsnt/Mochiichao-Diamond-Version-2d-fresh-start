// Tests for gap-fill S14 slice 1: the habitat solver base (DQB2 W2).
// Fixtures are synthetic ("bed-a", "table-a") — no canon Garden item or
// habitat content is authored here (owner slot S1 in the wiring plan).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  solveHabitat,
  type HabitatCell,
  type HabitatPlacement,
  type HabitatRecipe,
} from "./garden-habitats";

function cell(
  id: string,
  itemId: string,
  opts: Partial<HabitatCell> = {},
): HabitatCell {
  return { id, itemId, ...opts };
}

function placement(cells: HabitatCell[], zoneId?: string): HabitatPlacement {
  return zoneId === undefined ? { cells } : { zoneId, cells };
}

// Two synthetic recipes: a 2-bed rest (tier 1) and a 4-bed + 2-table
// rest (tier 2). Total required counts 2 vs 6.
const REST_SMALL: HabitatRecipe = {
  id: "rest-small",
  tier: 1,
  requires: [{ category: "bed", count: 2 }],
};
const REST_GRAND: HabitatRecipe = {
  id: "rest-grand",
  tier: 2,
  requires: [
    { category: "bed", count: 4 },
    { category: "table", count: 2 },
  ],
};

describe("solveHabitat base matching", () => {
  it("recognises a satisfied recipe with hand-computed axes", () => {
    const out = solveHabitat(
      placement([
        cell("a", "bed-a", { categories: ["bed"], material: "wood", richness: 3 }),
        cell("b", "bed-b", { categories: ["bed"], material: "wood", richness: 2 }),
        cell("c", "table-a", { categories: ["table"], material: "stone", richness: 5 }),
      ]),
      [REST_SMALL],
    );
    // Extent counts all ground-band cells (3), finish sums their
    // richness (3 + 2 + 5 = 10), character is the dominant material.
    expect(out).toEqual({ recipeId: "rest-small", tier: 1, extent: 3, finish: 10, character: "wood" });
  });

  it("returns null when a requirement count is not met", () => {
    expect(
      solveHabitat(
        placement([cell("a", "bed-a", { categories: ["bed"] })]),
        [REST_SMALL],
      ),
    ).toBeNull();
  });

  it("returns null with no recipes", () => {
    expect(solveHabitat(placement([cell("a", "bed-a")]), [])).toBeNull();
  });

  it("a wildcard category matches any item carrying the category", () => {
    const out = solveHabitat(
      placement([
        cell("a", "bed-a", { categories: ["bed"] }),
        cell("b", "bed-b", { categories: ["bed"] }),
      ]),
      [REST_SMALL],
    );
    expect(out?.recipeId).toBe("rest-small");
  });

  it("an item requirement matches only that item id, not its category", () => {
    const recipe: HabitatRecipe = {
      id: "exact",
      tier: 0,
      requires: [{ item: "bed-a", count: 2 }],
    };
    expect(
      solveHabitat(
        placement([
          cell("a", "bed-a", { categories: ["bed"] }),
          cell("b", "bed-b", { categories: ["bed"] }),
        ]),
        [recipe],
      ),
    ).toBeNull();
  });

  it("a cell counts toward at most one requirement, in listed order", () => {
    // One cell carries both the item and the category; the recipe needs
    // two cells, so the single cell cannot satisfy both requirements.
    const recipe: HabitatRecipe = {
      id: "double-claim",
      tier: 0,
      requires: [{ item: "bed-a", count: 1 }, { category: "bed", count: 1 }],
    };
    expect(
      solveHabitat(
        placement([cell("a", "bed-a", { categories: ["bed"] })]),
        [recipe],
      ),
    ).toBeNull();
  });
});

describe("solveHabitat most-specific match", () => {
  it("the higher-count recipe wins when both are satisfied", () => {
    const cells = [
      cell("a", "bed-a", { categories: ["bed"] }),
      cell("b", "bed-b", { categories: ["bed"] }),
      cell("c", "bed-c", { categories: ["bed"] }),
      cell("d", "bed-d", { categories: ["bed"] }),
      cell("e", "table-a", { categories: ["table"] }),
      cell("f", "table-b", { categories: ["table"] }),
    ];
    expect(solveHabitat(placement(cells), [REST_SMALL, REST_GRAND])?.recipeId).toBe("rest-grand");
    expect(solveHabitat(placement(cells), [REST_GRAND, REST_SMALL])?.recipeId).toBe("rest-grand");
  });

  it("on equal total count, more requirements wins; then first in order", () => {
    const twoReq: HabitatRecipe = {
      id: "two-req",
      tier: 1,
      requires: [
        { category: "bed", count: 1 },
        { category: "table", count: 1 },
      ],
    };
    const oneReq: HabitatRecipe = {
      id: "one-req",
      tier: 1,
      requires: [{ category: "bed", count: 2 }],
    };
    const cells = [
      cell("a", "bed-a", { categories: ["bed"] }),
      cell("b", "table-a", { categories: ["table"] }),
      cell("c", "bed-b", { categories: ["bed"] }),
    ];
    // Both totals are 2; two-req has more requirements, so it wins
    // regardless of order.
    expect(solveHabitat(placement(cells), [oneReq, twoReq])?.recipeId).toBe("two-req");
    const twin: HabitatRecipe = { ...twoReq, id: "two-req-twin" };
    expect(solveHabitat(placement(cells), [twoReq, twin])?.recipeId).toBe("two-req");
    expect(solveHabitat(placement(cells), [twin, twoReq])?.recipeId).toBe("two-req-twin");
  });
});

describe("solveHabitat ground band", () => {
  it("cells above the ground band do not count toward a ground recipe", () => {
    expect(
      solveHabitat(
        placement([
          cell("a", "bed-a", { categories: ["bed"], band: 0 }),
          cell("b", "bed-b", { categories: ["bed"], band: 1 }),
        ]),
        [REST_SMALL],
      ),
    ).toBeNull();
  });

  it("a banded recipe reads only its own band for match and axes", () => {
    const recipe: HabitatRecipe = { ...REST_SMALL, id: "rest-high", band: 1 };
    const out = solveHabitat(
      placement([
        cell("a", "bed-a", { categories: ["bed"], band: 0, material: "stone", richness: 9 }),
        cell("b", "bed-b", { categories: ["bed"], band: 1, material: "wood", richness: 2 }),
        cell("c", "bed-c", { categories: ["bed"], band: 1, material: "wood", richness: 3 }),
      ]),
      [recipe],
    );
    // The band-0 stone cell (richness 9) is not in the habitat's band:
    // extent 2, finish 5, character wood.
    expect(out).toEqual({ recipeId: "rest-high", tier: 1, extent: 2, finish: 5, character: "wood" });
  });
});

describe("solveHabitat axes", () => {
  it("character ties break by first seen in placement order", () => {
    const out = solveHabitat(
      placement([
        cell("a", "bed-a", { categories: ["bed"], material: "stone" }),
        cell("b", "bed-b", { categories: ["bed"], material: "wood" }),
      ]),
      [REST_SMALL],
    );
    expect(out?.character).toBe("stone");
  });

  it("character is null when no band cell carries a material", () => {
    const out = solveHabitat(
      placement([
        cell("a", "bed-a", { categories: ["bed"] }),
        cell("b", "bed-b", { categories: ["bed"] }),
      ]),
      [REST_SMALL],
    );
    expect(out?.character).toBeNull();
    expect(out?.finish).toBe(0);
  });
});

describe("solveHabitat zone and cap", () => {
  it("a zoned recipe matches only same-zone placements", () => {
    const recipe: HabitatRecipe = { ...REST_SMALL, id: "rest-zoned", zone: "garden" };
    const cells = [
      cell("a", "bed-a", { categories: ["bed"] }),
      cell("b", "bed-b", { categories: ["bed"] }),
    ];
    expect(solveHabitat(placement(cells, "garden"), [recipe])?.recipeId).toBe("rest-zoned");
    expect(solveHabitat(placement(cells, "town"), [recipe])).toBeNull();
    expect(solveHabitat(placement(cells), [recipe])).toBeNull();
  });

  it("the registration cap recognises nothing once reached", () => {
    const cells = [
      cell("a", "bed-a", { categories: ["bed"] }),
      cell("b", "bed-b", { categories: ["bed"] }),
    ];
    expect(solveHabitat(placement(cells), [REST_SMALL], { cap: 1, alreadyRegistered: 1 })).toBeNull();
    expect(solveHabitat(placement(cells), [REST_SMALL], { cap: 0 })).toBeNull();
    expect(solveHabitat(placement(cells), [REST_SMALL], { cap: 1, alreadyRegistered: 0 })?.recipeId).toBe(
      "rest-small",
    );
  });
});

describe("solveHabitat purity and loud failures", () => {
  it("never mutates its inputs and repeats identically", () => {
    const cells = [
      cell("a", "bed-a", { categories: ["bed"], material: "wood", richness: 1 }),
      cell("b", "bed-b", { categories: ["bed"], material: "wood", richness: 1 }),
    ];
    const input = placement(cells);
    const recipes = [REST_SMALL];
    const before = JSON.stringify({ input, recipes });
    const first = solveHabitat(input, recipes);
    const second = solveHabitat(input, recipes);
    expect(first).toEqual(second);
    expect(JSON.stringify({ input, recipes })).toBe(before);
  });

  it("throws loudly on malformed recipes and placements", () => {
    const cells = [cell("a", "bed-a", { categories: ["bed"] })];
    expect(() =>
      solveHabitat(placement(cells), [{ id: "x", tier: 0, requires: [{ count: 1 }] }]),
    ).toThrow("exactly one of item / category");
    expect(() =>
      solveHabitat(placement(cells), [
        { id: "x", tier: 0, requires: [{ item: "bed-a", category: "bed", count: 1 }] },
      ]),
    ).toThrow("exactly one of item / category");
    expect(() =>
      solveHabitat(placement(cells), [{ id: "x", tier: 0, requires: [{ category: "bed", count: 0 }] }]),
    ).toThrow("count must be an integer >= 1");
    expect(() =>
      solveHabitat(placement(cells), [{ id: "x", tier: 0, requires: [] }]),
    ).toThrow("non-empty array");
    expect(() =>
      solveHabitat(placement(cells), [{ id: "x", tier: -1, requires: [{ category: "bed", count: 1 }] }]),
    ).toThrow("tier must be an integer >= 0");
    expect(() =>
      solveHabitat(
        placement([
          cell("a", "bed-a", { categories: ["bed"] }),
          cell("a", "bed-b", { categories: ["bed"] }),
        ]),
        [REST_SMALL],
      ),
    ).toThrow('duplicate cell id "a"');
    expect(() =>
      solveHabitat(
        placement([cell("a", "bed-a", { categories: ["bed"], richness: -1 })]),
        [REST_SMALL],
      ),
    ).toThrow("richness must be a finite number >= 0");
    expect(() =>
      solveHabitat(placement(cells), [REST_SMALL], { cap: -1 }),
    ).toThrow("cap must be an integer >= 0");
  });
});

describe("S14 slice-1 staging locks", () => {
  // Superseded in part by S14 slice 3 (W3, 2026-10-31): garden-wiring.ts
  // is now the placement host and imports solveHabitat by design — the
  // slice-1 header named exactly this as W3's job. Only the GardenView
  // half of this lock still stands: no screen reads the solver yet.
  it("slice-3 supersession: garden-wiring hosts the solver; GardenView still does not read it", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    expect(wiring).toContain("garden-habitats");
    expect(wiring).toContain("solveHabitat");
    const view = readFileSync(new URL("../components/views/GardenView.tsx", import.meta.url), "utf8");
    expect(view).not.toContain("garden-habitats");
    expect(view).not.toContain("solveHabitat");
  });
});
