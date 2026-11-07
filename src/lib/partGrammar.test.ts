import { describe, expect, it } from "vitest";
import { buildTotals, validateBuild, type PartGrammar } from "./partGrammar";

const GRAMMAR: PartGrammar = {
  budget: { complexityMax: 10, costMax: 100 },
  catalogue: [
    { partId: "jaw-basic", category: "mouth", cost: 10, complexity: 1, grants: ["bite"], dietClass: "carnivore-lean" },
    { partId: "paw-basic", category: "foot", cost: 5, complexity: 1, grants: [], movementClass: "grounded" },
  ],
};

describe("validateBuild", () => {
  it("accepts a build inside budget using only catalogue parts", () => {
    const build = {
      spine: { lengthClass: "short", postureClass: "quadruped" },
      parts: [
        { partId: "jaw-basic", slot: "head" },
        { partId: "paw-basic", slot: "leg-fl" },
      ],
    };
    expect(validateBuild(build, GRAMMAR)).toEqual([]);
    expect(buildTotals(build, GRAMMAR)).toEqual({ cost: 15, complexity: 2 });
  });

  it("flags unknown parts and a missing spine", () => {
    const problems = validateBuild(
      { spine: { lengthClass: "", postureClass: "" }, parts: [{ partId: "nope", slot: "head" }] },
      GRAMMAR,
    );
    expect(problems.some((p) => p.includes("spine"))).toBe(true);
    expect(problems.some((p) => p.includes("unknown part: nope"))).toBe(true);
  });

  it("flags budget overflow", () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ partId: "paw-basic", slot: `leg-${i}` }));
    const problems = validateBuild(
      { spine: { lengthClass: "long", postureClass: "multi" }, parts: many },
      GRAMMAR,
    );
    expect(problems.some((p) => p.includes("complexity"))).toBe(true);
  });
});
