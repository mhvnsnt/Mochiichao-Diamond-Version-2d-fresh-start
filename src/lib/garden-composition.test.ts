// Tests for gap-fill S14 slice 2: the habitat composition pass
// (Pokopia M3 context modifiers + DQB2 X2 neighbour combos).
// Fixtures are synthetic ("rest-small", "rest-grand", variant/combo
// ids invented for the test only) — no canon Garden item, habitat,
// variant, or combo content is authored here (owner slots S1/S5 in
// the wiring plan); the tables are caller-supplied in every test.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  composeHabitat,
  solveHabitatComposed,
  type ContextModifier,
  type NeighbourCombo,
} from "./garden-composition";
import {
  solveHabitat,
  type HabitatCell,
  type HabitatPlacement,
  type HabitatRecipe,
  type SolvedHabitat,
} from "./garden-habitats";

function cell(id: string, itemId: string, opts: Partial<HabitatCell> = {}): HabitatCell {
  return { id, itemId, ...opts };
}

function placement(cells: HabitatCell[], zoneId?: string): HabitatPlacement {
  return zoneId === undefined ? { cells } : { zoneId, cells };
}

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

function restSmallCells(): HabitatCell[] {
  return [
    cell("a", "bed-a", { categories: ["bed"], material: "wood", richness: 3 }),
    cell("b", "bed-b", { categories: ["bed"], material: "wood", richness: 2 }),
  ];
}

function baseSmall(): SolvedHabitat {
  return { recipeId: "rest-small", tier: 1, extent: 2, finish: 5, character: "wood" };
}

function baseGrand(): SolvedHabitat {
  return { recipeId: "rest-grand", tier: 2, extent: 6, finish: 20, character: "stone" };
}

const WATER: ContextModifier = { contextTag: "water", variantId: "rest-small-hydrated" };
const TREE: ContextModifier = { contextTag: "tree", variantId: "rest-small-shaded" };
const BOULDER: ContextModifier = { contextTag: "boulder", variantId: "rest-small-boulder-shaded" };
const PAIR: NeighbourCombo = { first: "rest-small", second: "rest-grand", comboId: "combo-rest-pair" };

describe("composeHabitat M3 context modifiers", () => {
  it("a present tag resolves its variant and leaves the base untouched", () => {
    const out = composeHabitat(baseSmall(), { contextTags: ["water"], modifiers: [WATER] });
    expect(out.base).toEqual(baseSmall());
    expect(out.variants).toEqual(["rest-small-hydrated"]);
    expect(out.combos).toEqual([]);
  });

  it("an absent tag resolves nothing", () => {
    expect(
      composeHabitat(baseSmall(), { contextTags: ["tree"], modifiers: [WATER] }).variants,
    ).toEqual([]);
  });

  it("several tags resolve in modifier-table order, not tag order", () => {
    const out = composeHabitat(baseSmall(), {
      contextTags: ["boulder", "tree", "water"],
      modifiers: [WATER, TREE, BOULDER],
    });
    expect(out.variants).toEqual([
      "rest-small-hydrated",
      "rest-small-shaded",
      "rest-small-boulder-shaded",
    ]);
  });

  it("a scoped modifier fires only for its listed recipes", () => {
    const scoped: ContextModifier = { ...WATER, appliesTo: ["rest-grand"] };
    expect(
      composeHabitat(baseSmall(), { contextTags: ["water"], modifiers: [scoped] }).variants,
    ).toEqual([]);
    expect(
      composeHabitat(baseGrand(), { contextTags: ["water"], modifiers: [scoped] }).variants,
    ).toEqual(["rest-small-hydrated"]);
    const listed: ContextModifier = { ...WATER, appliesTo: ["rest-small"] };
    expect(
      composeHabitat(baseSmall(), { contextTags: ["water"], modifiers: [listed] }).variants,
    ).toEqual(["rest-small-hydrated"]);
  });

  it("an empty appliesTo list matches no recipe", () => {
    const scoped: ContextModifier = { ...WATER, appliesTo: [] };
    expect(
      composeHabitat(baseSmall(), { contextTags: ["water"], modifiers: [scoped] }).variants,
    ).toEqual([]);
  });

  it("the same variant id from two modifiers emits once", () => {
    const out = composeHabitat(baseSmall(), {
      contextTags: ["water", "tree"],
      modifiers: [WATER, { contextTag: "tree", variantId: "rest-small-hydrated" }],
    });
    expect(out.variants).toEqual(["rest-small-hydrated"]);
  });

  it("with no base, no variant fires however many tags are present", () => {
    expect(
      composeHabitat(null, { contextTags: ["water", "tree"], modifiers: [WATER, TREE] }),
    ).toEqual({ base: null, variants: [], combos: [] });
  });
});

describe("composeHabitat X2 neighbour combos", () => {
  it("base + neighbour resolve a combo, in either table order", () => {
    expect(
      composeHabitat(baseSmall(), { neighbours: [baseGrand()], combos: [PAIR] }).combos,
    ).toEqual(["combo-rest-pair"]);
    const reversed: NeighbourCombo = { first: "rest-grand", second: "rest-small", comboId: "combo-rest-pair" };
    expect(
      composeHabitat(baseSmall(), { neighbours: [baseGrand()], combos: [reversed] }).combos,
    ).toEqual(["combo-rest-pair"]);
  });

  it("two neighbours alone resolve a combo with no base", () => {
    const out = composeHabitat(null, { neighbours: [baseSmall(), baseGrand()], combos: [PAIR] });
    expect(out).toEqual({ base: null, variants: [], combos: ["combo-rest-pair"] });
  });

  it("a pair needs two distinct pool entries: one entry cannot pair with itself", () => {
    const samePair: NeighbourCombo = { first: "rest-small", second: "rest-small", comboId: "combo-twin" };
    expect(composeHabitat(baseSmall(), { combos: [samePair] }).combos).toEqual([]);
    expect(
      composeHabitat(baseSmall(), {
        neighbours: [{ ...baseSmall(), extent: 3 }],
        combos: [samePair],
      }).combos,
    ).toEqual(["combo-twin"]);
  });

  it("combos do not consume: one pair satisfies several combo rows", () => {
    const out = composeHabitat(baseSmall(), {
      neighbours: [baseGrand()],
      combos: [PAIR, { first: "rest-small", second: "rest-grand", comboId: "combo-second-read" }],
    });
    expect(out.combos).toEqual(["combo-rest-pair", "combo-second-read"]);
  });

  it("a duplicate combo id emits once, first row wins", () => {
    const out = composeHabitat(baseSmall(), {
      neighbours: [baseGrand()],
      combos: [PAIR, { ...PAIR }],
    });
    expect(out.combos).toEqual(["combo-rest-pair"]);
  });

  it("a combo with no matching pair does not fire", () => {
    expect(composeHabitat(baseSmall(), { neighbours: [baseSmall()], combos: [PAIR] }).combos).toEqual([]);
  });
});

describe("solveHabitatComposed one-call shape", () => {
  it("base matching then composition, with slice-1 axes unchanged", () => {
    const out = solveHabitatComposed(
      placement(restSmallCells()),
      [REST_SMALL, REST_GRAND],
      { contextTags: ["water"], modifiers: [WATER], neighbours: [baseGrand()], combos: [PAIR] },
    );
    // Slice-1 axes for the two wood beds: extent 2, finish 5, wood.
    expect(out.base).toEqual({ recipeId: "rest-small", tier: 1, extent: 2, finish: 5, character: "wood" });
    expect(out.variants).toEqual(["rest-small-hydrated"]);
    expect(out.combos).toEqual(["combo-rest-pair"]);
    // Agrees with the two-step composition over the slice-1 result.
    expect(out).toEqual(
      composeHabitat(solveHabitat(placement(restSmallCells()), [REST_SMALL, REST_GRAND]), {
        contextTags: ["water"],
        modifiers: [WATER],
        neighbours: [baseGrand()],
        combos: [PAIR],
      }),
    );
  });

  it("a capped placement yields no base, but a neighbours-only combo still fires", () => {
    const out = solveHabitatComposed(
      placement(restSmallCells()),
      [REST_SMALL],
      { neighbours: [baseSmall(), baseGrand()], combos: [PAIR] },
      { cap: 1, alreadyRegistered: 1 },
    );
    expect(out.base).toBeNull();
    expect(out.variants).toEqual([]);
    expect(out.combos).toEqual(["combo-rest-pair"]);
  });
});

describe("composeHabitat purity and loud failures", () => {
  it("never mutates its inputs and repeats identically", () => {
    const base = baseSmall();
    const composition = {
      contextTags: ["water"],
      modifiers: [WATER],
      neighbours: [baseGrand()],
      combos: [PAIR],
    };
    const before = JSON.stringify({ base, composition });
    const first = composeHabitat(base, composition);
    const second = composeHabitat(base, composition);
    expect(first).toEqual(second);
    expect(JSON.stringify({ base, composition })).toBe(before);
  });

  it("throws loudly on malformed tables and neighbours", () => {
    expect(() =>
      composeHabitat(baseSmall(), { contextTags: [""] }),
    ).toThrow("contextTag");
    expect(() =>
      composeHabitat(baseSmall(), { modifiers: [{ contextTag: "water", variantId: "" }] }),
    ).toThrow("variantId");
    expect(() =>
      composeHabitat(baseSmall(), { modifiers: [{ contextTag: "", variantId: "v" }] }),
    ).toThrow("contextTag");
    expect(() =>
      composeHabitat(baseSmall(), { neighbours: [{ recipeId: "", tier: 1, extent: 0, finish: 0, character: null }] }),
    ).toThrow("recipeId");
    expect(() =>
      composeHabitat(baseSmall(), { combos: [{ first: "a", second: "b", comboId: "" }] }),
    ).toThrow("comboId");
    expect(() =>
      composeHabitat(baseSmall(), { contextTags: "water" as unknown as string[] }),
    ).toThrow("contextTags must be an array");
  });
});

describe("S14 slice-2 staging locks", () => {
  it("no host reads the composition pass yet, and the base solver stays independent", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    expect(wiring).not.toContain("garden-composition");
    expect(wiring).not.toContain("composeHabitat");
    expect(wiring).not.toContain("solveHabitatComposed");
    const view = readFileSync(new URL("../components/views/GardenView.tsx", import.meta.url), "utf8");
    expect(view).not.toContain("garden-composition");
    expect(view).not.toContain("composeHabitat");
    expect(view).not.toContain("solveHabitatComposed");
    const base = readFileSync(new URL("./garden-habitats.ts", import.meta.url), "utf8");
    expect(base).not.toContain("garden-composition");
  });
});
