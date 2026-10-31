// Gap-fill S11 slice 1 tests. All expected values are hand-computed
// from the rules in research.ts and the sources cited there — no value
// here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  isResearchComplete,
  researchLevel,
  researchPoints,
  taskCheckmarks,
  tiersReached,
  type ResearchTallies,
  type ResearchTaskDef,
} from "./research";

function def(
  taskId: string,
  kind: ResearchTaskDef["kind"],
  tiers: number[],
  weight?: 1 | 2,
  speciesId = "038",
): ResearchTaskDef {
  return { taskId, speciesId, kind, tiers, weight };
}

describe("tiersReached (S11 slice 1)", () => {
  it("counts only thresholds met: 3 vs [1,2,4] is 2, 4 is 3", () => {
    expect(tiersReached(0, [1, 2, 4])).toBe(0);
    expect(tiersReached(3, [1, 2, 4])).toBe(2);
    expect(tiersReached(4, [1, 2, 4])).toBe(3);
  });
  it("is order-independent and ignores a 0 threshold", () => {
    expect(tiersReached(2, [4, 1])).toBe(1);
    expect(tiersReached(0, [0, 1])).toBe(0);
    expect(tiersReached(1, [0, 1])).toBe(1);
  });
  it("treats negative counts as 0", () => {
    expect(tiersReached(-5, [1, 2])).toBe(0);
  });
});

describe("taskCheckmarks (S11 slice 1)", () => {
  it("weight 1 pays 1 per tier, weight 2 pays 2 per tier", () => {
    expect(taskCheckmarks(def("o", "observe", [1, 3]), 3)).toBe(2);
    expect(taskCheckmarks(def("f", "feed", [1, 3], 2), 3)).toBe(4);
  });
  it("a kind outside #97's closed vocabulary earns nothing", () => {
    const bad = def("x", "observe", [1]);
    (bad as { kind: string }).kind = "caught";
    expect(taskCheckmarks(bad, 5)).toBe(0);
  });
});

describe("researchLevel / researchPoints / isResearchComplete (S11 slice 1)", () => {
  it("mixed species: 3 + 4 + 2 + 0 + 3 = 12 checkmarks -> level capped 10, points uncapped 120", () => {
    const defs = [
      def("observe", "observe", [1, 3, 6]),
      def("feed", "feed", [1, 2], 2),
      def("witness", "battle-witness", [1, 3, 6, 12]),
      def("track", "track", [1]),
      def("care", "care", [1, 2, 4]),
    ];
    const tallies: ResearchTallies = {
      "038": { observe: 6, feed: 2, witness: 3, track: 0, care: 4 },
    };
    expect(researchLevel(defs, tallies, "038")).toBe(10);
    expect(researchPoints(defs, tallies, "038")).toBe(120);
    expect(isResearchComplete(defs, tallies, "038")).toBe(true);
  });
  it("below the cap: one tier reached is level 1, 10 points, not complete", () => {
    const defs = [def("observe", "observe", [1, 2])];
    const tallies: ResearchTallies = { "038": { observe: 1 } };
    expect(researchLevel(defs, tallies, "038")).toBe(1);
    expect(researchPoints(defs, tallies, "038")).toBe(10);
    expect(isResearchComplete(defs, tallies, "038")).toBe(false);
  });
  it("exactly 10 checkmarks completes; 9 does not", () => {
    const defs = [
      def("a", "observe", [1, 2, 3, 4, 5]),
      def("b", "feed", [1, 2, 3, 4, 5]),
    ];
    expect(researchLevel(defs, { "038": { a: 5, b: 5 } }, "038")).toBe(10);
    expect(isResearchComplete(defs, { "038": { a: 5, b: 5 } }, "038")).toBe(true);
    expect(researchLevel(defs, { "038": { a: 5, b: 4 } }, "038")).toBe(9);
    expect(researchPoints(defs, { "038": { a: 5, b: 4 } }, "038")).toBe(90);
    expect(isResearchComplete(defs, { "038": { a: 5, b: 4 } }, "038")).toBe(false);
  });
  it("unknown species, unknown tally ids, and other species' defs earn nothing", () => {
    const defs = [def("observe", "observe", [1]), def("other", "feed", [1], undefined, "004")];
    const tallies: ResearchTallies = {
      "038": { observe: 1, invented: 99 },
      "999": { observe: 5 },
    };
    expect(researchLevel(defs, tallies, "038")).toBe(1);
    expect(researchLevel(defs, tallies, "999")).toBe(0);
    expect(researchPoints(defs, tallies, "999")).toBe(0);
    expect(isResearchComplete(defs, tallies, "999")).toBe(false);
  });
  it("no defs means level 0 even with tallies banked", () => {
    expect(researchLevel([], { "038": { observe: 9 } }, "038")).toBe(0);
    expect(researchPoints([], { "038": { observe: 9 } }, "038")).toBe(0);
  });
});
