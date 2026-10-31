// S14 slice 5 tests — DQB2 W5 comfort + needs daily term (pure library).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  comfortAfterDay,
  comfortAfterDays,
  needsSatisfied,
  type GardenNeedDef,
  type GardenNeedRate,
} from "./garden-comfort";
import type { ClassesForRecipe } from "./garden-attraction";
import type { SolvedHabitat } from "./garden-habitats";

function habitat(recipeId: string): SolvedHabitat {
  return { recipeId, tier: 1, extent: 3, finish: 5, character: null };
}

// Synthetic fixtures only — no Garden recipe, class, or need content is
// authored here; the mapping and the need table are caller data.
const classesFor: ClassesForRecipe = (recipeId) => {
  switch (recipeId) {
    case "sun-patch":
      return ["sunlit"];
    case "shade-grove":
      return ["shaded"];
    case "pond-edge":
      return ["water"];
    default:
      return [];
  }
};

const needs: GardenNeedDef[] = [
  { id: "sunlight", recipeIds: ["sun-patch"] },
  { id: "shade", classes: ["shaded"] },
  { id: "water", classes: ["water"], recipeIds: ["pond-edge"] },
];

const rates: Record<string, GardenNeedRate> = {
  sunlight: { gain: 10, loss: 6 },
  shade: { gain: 4, loss: 5 },
  water: { gain: 8, loss: 7 },
};

describe("needsSatisfied", () => {
  it("satisfies by recipe id", () => {
    const out = needsSatisfied([habitat("sun-patch")], needs, classesFor);
    expect(out.satisfied).toEqual(["sunlight"]);
    expect(out.unsatisfied).toEqual(["shade", "water"]);
    expect(out.byNeed).toEqual({ sunlight: true, shade: false, water: false });
  });

  it("satisfies by class through the mapping", () => {
    const out = needsSatisfied([habitat("shade-grove")], needs, classesFor);
    expect(out.satisfied).toEqual(["shade"]);
  });

  it("satisfies by either route when a need names both", () => {
    expect(needsSatisfied([habitat("pond-edge")], needs, classesFor).byNeed.water).toBe(true);
    const byClassOnly: GardenNeedDef[] = [{ id: "water", classes: ["water"] }];
    expect(needsSatisfied([habitat("pond-edge")], byClassOnly, classesFor).byNeed.water).toBe(true);
  });

  it("null habitats are skipped and unmapped recipes satisfy nothing", () => {
    const out = needsSatisfied([null, habitat("unmapped-recipe")], needs, classesFor);
    expect(out.satisfied).toEqual([]);
    expect(out.unsatisfied).toEqual(["sunlight", "shade", "water"]);
  });

  it("empty habitats leave every need unmet", () => {
    expect(needsSatisfied([], needs, classesFor).unsatisfied).toEqual([
      "sunlight",
      "shade",
      "water",
    ]);
  });

  it("fails loudly on bad input", () => {
    expect(() => needsSatisfied([habitat("sun-patch")], [{ id: "" }], classesFor)).toThrow(
      /non-empty string/,
    );
    expect(() =>
      needsSatisfied([habitat("sun-patch")], [{ id: "nowhere" }], classesFor),
    ).toThrow(/at least one satisfier/);
    expect(() =>
      needsSatisfied(
        [habitat("sun-patch")],
        [
          { id: "sunlight", recipeIds: ["sun-patch"] },
          { id: "sunlight", recipeIds: ["sun-patch"] },
        ],
        classesFor,
      ),
    ).toThrow(/duplicate need id/);
    expect(() => needsSatisfied([habitat("sun-patch")], needs, (() => [""]) as never)).toThrow(
      /non-empty string/,
    );
  });
});

describe("comfortAfterDay", () => {
  it("adds gains for met needs and subtracts losses for unmet ones", () => {
    // Sunlight met (+10), shade unmet (-5), water unmet (-7): 50 + (-2) = 48.
    const out = comfortAfterDay({
      comfort: 50,
      habitats: [habitat("sun-patch")],
      needs,
      rates,
      classesForRecipe: classesFor,
    });
    expect(out.satisfied).toEqual(["sunlight"]);
    expect(out.unsatisfied).toEqual(["shade", "water"]);
    expect(out.delta).toBe(-2);
    expect(out.comfort).toBe(48);
  });

  it("all needs met gives the full gain sum", () => {
    const out = comfortAfterDay({
      comfort: 40,
      habitats: [habitat("sun-patch"), habitat("shade-grove"), habitat("pond-edge")],
      needs,
      rates,
      classesForRecipe: classesFor,
    });
    expect(out.delta).toBe(22);
    expect(out.comfort).toBe(62);
  });

  it("CORRECTED X6: unmet needs push comfort below neutral — no neutral floor", () => {
    // The superseded W5 text would floor this at 50; the corrected rule
    // lands at 45, below neutral, and only the 0 floor applies.
    const out = comfortAfterDay({
      comfort: 55,
      habitats: [],
      needs: [{ id: "sunlight", recipeIds: ["sun-patch"] }],
      rates: { sunlight: { gain: 10, loss: 10 } },
      classesForRecipe: classesFor,
    });
    expect(out.comfort).toBe(45);
    expect(out.comfort).toBeLessThan(50);
  });

  it("clamps only at 0 and 100", () => {
    const top = comfortAfterDay({
      comfort: 98,
      habitats: [habitat("sun-patch"), habitat("shade-grove"), habitat("pond-edge")],
      needs,
      rates,
      classesForRecipe: classesFor,
    });
    expect(top.comfort).toBe(100);
    const bottom = comfortAfterDay({
      comfort: 5,
      habitats: [],
      needs,
      rates,
      classesForRecipe: classesFor,
    });
    expect(bottom.comfort).toBe(0);
  });

  it("scales the term by context and personality factors", () => {
    const out = comfortAfterDay({
      comfort: 50,
      habitats: [habitat("sun-patch")],
      needs,
      rates,
      classesForRecipe: classesFor,
      contextFactor: 0.5,
      personalityFactor: 1,
    });
    // Raw -2, halved by context: delta -1, comfort 49.
    expect(out.delta).toBe(-1);
    expect(out.comfort).toBe(49);
  });

  it("does not mutate its inputs", () => {
    const habitats = [habitat("sun-patch")];
    const beforeH = JSON.stringify(habitats);
    const beforeN = JSON.stringify(needs);
    comfortAfterDay({ comfort: 50, habitats, needs, rates, classesForRecipe: classesFor });
    expect(JSON.stringify(habitats)).toBe(beforeH);
    expect(JSON.stringify(needs)).toBe(beforeN);
  });

  it("fails loudly on bad input", () => {
    const base = {
      comfort: 50,
      habitats: [habitat("sun-patch")],
      needs,
      rates,
      classesForRecipe: classesFor,
    };
    expect(() => comfortAfterDay({ ...base, comfort: 101 })).toThrow(/within 0..100/);
    expect(() => comfortAfterDay({ ...base, comfort: Number.NaN })).toThrow(/finite/);
    expect(() => comfortAfterDay({ ...base, rates: { sunlight: { gain: 10, loss: 6 } } })).toThrow(
      /rate for need "shade" is missing/,
    );
    expect(() =>
      comfortAfterDay({
        ...base,
        rates: { ...rates, shade: { gain: -1, loss: 5 } },
      }),
    ).toThrow(/gain for need "shade"/);
    expect(() => comfortAfterDay({ ...base, contextFactor: -0.5 })).toThrow(/contextFactor/);
  });
});

describe("comfortAfterDays", () => {
  it("repeats the same day and traces each day", () => {
    const out = comfortAfterDays(
      {
        comfort: 60,
        habitats: [],
        needs: [{ id: "sunlight", recipeIds: ["sun-patch"] }],
        rates: { sunlight: { gain: 10, loss: 5 } },
        classesForRecipe: classesFor,
      },
      3,
    );
    expect(out.days.map((d) => d.comfort)).toEqual([55, 50, 45]);
    expect(out.comfort).toBe(45);
  });

  it("zero days returns the starting comfort unchanged", () => {
    const out = comfortAfterDays(
      {
        comfort: 60,
        habitats: [],
        needs,
        rates,
        classesForRecipe: classesFor,
      },
      0,
    );
    expect(out).toEqual({ comfort: 60, days: [] });
  });

  it("fails loudly on a non-integer or negative day count", () => {
    const input = {
      comfort: 60,
      habitats: [],
      needs,
      rates,
      classesForRecipe: classesFor,
    };
    expect(() => comfortAfterDays(input, -1)).toThrow(/integer >= 0/);
    expect(() => comfortAfterDays(input, 1.5)).toThrow(/integer >= 0/);
  });
});

describe("S14 slice-5 staging locks", () => {
  it("no live path imports garden-comfort yet", () => {
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    expect(phase4).not.toContain("garden-comfort");
    expect(wiring).not.toContain("garden-comfort");
    expect(view).not.toContain("garden-comfort");
  });
});
