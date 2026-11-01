import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gardenUnlocks,
  requirementMet,
  type GardenMilestones,
  type GardenUnlockEntry,
} from "./garden-unlocks";

const MILESTONES: GardenMilestones = {
  gardenLevel: 2,
  sportTitles: ["title-a"],
  lineageMilestones: ["lineage-a"],
};

const CATALOGUE: GardenUnlockEntry[] = [
  { id: "unlock-level", requires: { kind: "gardenLevel", atLeast: 2 } },
  { id: "unlock-title", requires: { kind: "sportTitle", title: "title-a" } },
  { id: "unlock-lineage", requires: { kind: "lineageMilestone", milestone: "lineage-a" } },
  { id: "unlock-high", requires: { kind: "gardenLevel", atLeast: 3 } },
];

describe("garden-unlocks milestone evaluation (B3 §2.4, pure form)", () => {
  it("level gate: met at the threshold, not above it", () => {
    expect(requirementMet({ kind: "gardenLevel", atLeast: 2 }, MILESTONES)).toBe(true);
    expect(requirementMet({ kind: "gardenLevel", atLeast: 3 }, MILESTONES)).toBe(false);
    expect(requirementMet({ kind: "gardenLevel", atLeast: 0 }, MILESTONES)).toBe(true);
  });

  it("null level meets no level requirement, not even atLeast 0", () => {
    const none: GardenMilestones = { gardenLevel: null, sportTitles: [], lineageMilestones: [] };
    expect(requirementMet({ kind: "gardenLevel", atLeast: 0 }, none)).toBe(false);
    expect(requirementMet({ kind: "gardenLevel", atLeast: 1 }, none)).toBe(false);
  });

  it("sport title and lineage milestone are exact membership checks", () => {
    expect(requirementMet({ kind: "sportTitle", title: "title-a" }, MILESTONES)).toBe(true);
    expect(requirementMet({ kind: "sportTitle", title: "title-b" }, MILESTONES)).toBe(false);
    expect(requirementMet({ kind: "lineageMilestone", milestone: "lineage-a" }, MILESTONES)).toBe(true);
    expect(requirementMet({ kind: "lineageMilestone", milestone: "lineage-b" }, MILESTONES)).toBe(false);
  });

  it("all needs every branch; any needs at least one", () => {
    const all = {
      kind: "all" as const,
      requirements: [
        { kind: "gardenLevel" as const, atLeast: 2 },
        { kind: "sportTitle" as const, title: "title-a" },
      ],
    };
    expect(requirementMet(all, MILESTONES)).toBe(true);
    const allMissing = {
      kind: "all" as const,
      requirements: [
        { kind: "gardenLevel" as const, atLeast: 2 },
        { kind: "sportTitle" as const, title: "title-b" },
      ],
    };
    expect(requirementMet(allMissing, MILESTONES)).toBe(false);
    const any = {
      kind: "any" as const,
      requirements: [
        { kind: "gardenLevel" as const, atLeast: 3 },
        { kind: "sportTitle" as const, title: "title-a" },
      ],
    };
    expect(requirementMet(any, MILESTONES)).toBe(true);
    const anyNone = {
      kind: "any" as const,
      requirements: [
        { kind: "gardenLevel" as const, atLeast: 3 },
        { kind: "sportTitle" as const, title: "title-b" },
      ],
    };
    expect(requirementMet(anyNone, MILESTONES)).toBe(false);
  });

  it("nested composition: all of (any, level)", () => {
    const nested = {
      kind: "all" as const,
      requirements: [
        {
          kind: "any" as const,
          requirements: [
            { kind: "sportTitle" as const, title: "title-b" },
            { kind: "lineageMilestone" as const, milestone: "lineage-a" },
          ],
        },
        { kind: "gardenLevel" as const, atLeast: 2 },
      ],
    };
    expect(requirementMet(nested, MILESTONES)).toBe(true);
    const nestedFail = {
      kind: "all" as const,
      requirements: [
        {
          kind: "any" as const,
          requirements: [
            { kind: "sportTitle" as const, title: "title-b" },
            { kind: "lineageMilestone" as const, milestone: "lineage-b" },
          ],
        },
        { kind: "gardenLevel" as const, atLeast: 2 },
      ],
    };
    expect(requirementMet(nestedFail, MILESTONES)).toBe(false);
  });

  it("catalogue evaluation keeps catalogue order and separates new from already shown", () => {
    const r = gardenUnlocks(MILESTONES, CATALOGUE, ["unlock-title"]);
    expect(r.unlocked).toEqual(["unlock-level", "unlock-title", "unlock-lineage"]);
    expect(r.newlyUnlocked).toEqual(["unlock-level", "unlock-lineage"]);
  });

  it("no previously-unlocked set: newly equals unlocked", () => {
    const r = gardenUnlocks(MILESTONES, CATALOGUE);
    expect(r.newlyUnlocked).toEqual(r.unlocked);
  });

  it("previously-unlocked ids outside the catalogue change nothing", () => {
    const r = gardenUnlocks(MILESTONES, CATALOGUE, ["unlock-gone"]);
    expect(r.unlocked).toEqual(["unlock-level", "unlock-title", "unlock-lineage"]);
    expect(r.newlyUnlocked).toEqual(r.unlocked);
  });

  it("empty catalogue unlocks nothing; empty milestones meet nothing", () => {
    expect(gardenUnlocks(MILESTONES, [])).toEqual({ unlocked: [], newlyUnlocked: [] });
    const none: GardenMilestones = { gardenLevel: null, sportTitles: [], lineageMilestones: [] };
    expect(gardenUnlocks(none, CATALOGUE)).toEqual({ unlocked: [], newlyUnlocked: [] });
  });

  it("loud failures: duplicate ids, empty ids, unknown kinds, empty branches", () => {
    expect(() =>
      gardenUnlocks(MILESTONES, [
        { id: "dup", requires: { kind: "gardenLevel", atLeast: 1 } },
        { id: "dup", requires: { kind: "gardenLevel", atLeast: 1 } },
      ]),
    ).toThrow();
    expect(() =>
      gardenUnlocks(MILESTONES, [{ id: "", requires: { kind: "gardenLevel", atLeast: 1 } }]),
    ).toThrow();
    expect(() =>
      gardenUnlocks(MILESTONES, [
        { id: "bad", requires: { kind: "mystery", atLeast: 1 } as never },
      ]),
    ).toThrow();
    expect(() =>
      gardenUnlocks(MILESTONES, [{ id: "e", requires: { kind: "all", requirements: [] } }]),
    ).toThrow();
    expect(() =>
      gardenUnlocks(MILESTONES, [{ id: "e", requires: { kind: "any", requirements: [] } }]),
    ).toThrow();
  });

  it("loud failures: bad thresholds, empty tokens, bad milestones", () => {
    expect(() =>
      requirementMet({ kind: "gardenLevel", atLeast: 1.5 }, MILESTONES),
    ).toThrow();
    expect(() => requirementMet({ kind: "gardenLevel", atLeast: -1 }, MILESTONES)).toThrow();
    expect(() => requirementMet({ kind: "sportTitle", title: "" }, MILESTONES)).toThrow();
    expect(() =>
      requirementMet({ kind: "lineageMilestone", milestone: "" }, MILESTONES),
    ).toThrow();
    expect(() =>
      gardenUnlocks({ gardenLevel: 1.5, sportTitles: [], lineageMilestones: [] }, CATALOGUE),
    ).toThrow();
    expect(() =>
      gardenUnlocks({ gardenLevel: null, sportTitles: [""], lineageMilestones: [] }, CATALOGUE),
    ).toThrow();
    expect(() => gardenUnlocks(MILESTONES, CATALOGUE, [""])).toThrow();
  });

  it("purity: inputs are not mutated and results are fresh arrays", () => {
    const before = JSON.stringify({ m: MILESTONES, c: CATALOGUE, p: ["unlock-title"] });
    const r = gardenUnlocks(MILESTONES, CATALOGUE, ["unlock-title"]);
    expect(JSON.stringify({ m: MILESTONES, c: CATALOGUE, p: ["unlock-title"] })).toBe(before);
    r.unlocked.push("tampered");
    expect(gardenUnlocks(MILESTONES, CATALOGUE, ["unlock-title"]).unlocked).not.toContain("tampered");
  });

  it("no authored content: ids, titles, and milestones in tests are synthetic only", () => {
    const moduleText = readFileSync(new URL("./garden-unlocks.ts", import.meta.url), "utf8");
    // The module must carry no catalogue of its own: no default entries.
    expect(moduleText).not.toMatch(/unlock-level|unlock-title|unlock-lineage/);
    expect(moduleText).not.toContain("title-a");
    expect(moduleText).not.toContain("lineage-a");
  });

  it("staging locks: no live module imports the unlocks module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    const register = readFileSync(new URL("./garden-register.ts", import.meta.url), "utf8");
    expect(wiring).not.toContain("garden-unlocks");
    expect(view).not.toContain("garden-unlocks");
    expect(phase4).not.toContain("garden-unlocks");
    expect(register).not.toContain("garden-unlocks");
  });
});
