import { describe, expect, it } from "vitest";
import {
  appendResearchObservation,
  bioFillForSpecies,
  observationsForCreature,
  observedKindsForCreature,
  observedKindsForSpecies,
  researchSummaryForSpecies,
  type ResearchObservation,
} from "./garden-research";

function obs(
  id: string,
  creatureId: string,
  kind: string,
  at: number,
): ResearchObservation {
  return { id, creatureId, kind, at };
}

const SPECIES = new Map([
  ["c1", "s-alpha"],
  ["c2", "s-alpha"],
  ["c3", "s-beta"],
]);

describe("garden-research (B3 §2.3 research output read)", () => {
  it("returns one creature's observations in stamp order, stable ties", () => {
    const log = [
      obs("o1", "c2", "kind-b", 20),
      obs("o2", "c1", "kind-a", 10),
      obs("o3", "c1", "kind-b", 5),
      obs("o4", "c1", "kind-a", 5),
    ];
    expect(observationsForCreature(log, "c1").map((o) => o.id)).toEqual([
      "o3",
      "o4",
      "o2",
    ]);
    expect(observationsForCreature(log, "nobody")).toEqual([]);
  });

  it("collapses kinds per creature in first-observed order", () => {
    const log = [
      obs("o1", "c1", "kind-b", 10),
      obs("o2", "c1", "kind-a", 20),
      obs("o3", "c1", "kind-b", 30),
    ];
    expect(observedKindsForCreature(log, "c1")).toEqual(["kind-b", "kind-a"]);
    expect(observedKindsForCreature([], "c1")).toEqual([]);
  });

  it("groups a species summary by caller mapping, with counts and stamps", () => {
    const log = [
      obs("o1", "c1", "kind-b", 10),
      obs("o2", "c2", "kind-b", 20),
      obs("o3", "c1", "kind-a", 15),
      obs("o4", "c3", "kind-b", 99),
      obs("o5", "c-unmapped", "kind-b", 1),
    ];
    const summary = researchSummaryForSpecies(log, "s-alpha", SPECIES);
    expect(summary.totalObservations).toBe(3);
    // First-observed order, not alphabetical: kind-b (stamp 10)
    // before kind-a (stamp 15), even though kind-a sorts first.
    expect(summary.observedKinds).toEqual(["kind-b", "kind-a"]);
    expect(summary.kinds).toEqual([
      { kind: "kind-b", count: 2, firstAt: 10, lastAt: 20 },
      { kind: "kind-a", count: 1, firstAt: 15, lastAt: 15 },
    ]);
    expect(observedKindsForSpecies(log, "s-beta", SPECIES)).toEqual(["kind-b"]);
  });

  it("accepts a plain-record species mapping, and excludes unmapped creatures", () => {
    const log = [obs("o1", "c1", "kind-a", 10), obs("o2", "c9", "kind-a", 20)];
    const summary = researchSummaryForSpecies(log, "s-alpha", { c1: "s-alpha" });
    expect(summary.totalObservations).toBe(1);
    expect(summary.observedKinds).toEqual(["kind-a"]);
  });

  it("an empty log or unknown species yields an empty summary, never defaults", () => {
    const summary = researchSummaryForSpecies([], "s-alpha", SPECIES);
    expect(summary).toEqual({
      speciesId: "s-alpha",
      totalObservations: 0,
      observedKinds: [],
      kinds: [],
    });
    expect(
      researchSummaryForSpecies([obs("o1", "c1", "kind-a", 10)], "s-none", SPECIES),
    ).toEqual({
      speciesId: "s-none",
      totalObservations: 0,
      observedKinds: [],
      kinds: [],
    });
  });

  it("bio fill: a field fills exactly when its required kind landed", () => {
    const log = [
      obs("o1", "c1", "kind-a", 10),
      obs("o2", "c2", "kind-a", 20),
      obs("o3", "c1", "kind-b", 30),
    ];
    const requirements = [
      { field: "field-a", requiredKind: "kind-a" },
      { field: "field-b", requiredKind: "kind-b" },
      { field: "field-c", requiredKind: "kind-missing" },
    ];
    expect(bioFillForSpecies(log, "s-alpha", SPECIES, requirements)).toEqual([
      { field: "field-a", requiredKind: "kind-a", filled: true, observedCount: 2 },
      { field: "field-b", requiredKind: "kind-b", filled: true, observedCount: 1 },
      { field: "field-c", requiredKind: "kind-missing", filled: false, observedCount: 0 },
    ]);
  });

  it("bio fill: a species with no observations fills nothing, never by default", () => {
    const requirements = [
      { field: "field-a", requiredKind: "kind-a" },
      { field: "field-b", requiredKind: "kind-b" },
    ];
    expect(bioFillForSpecies([], "s-alpha", SPECIES, requirements)).toEqual([
      { field: "field-a", requiredKind: "kind-a", filled: false, observedCount: 0 },
      { field: "field-b", requiredKind: "kind-b", filled: false, observedCount: 0 },
    ]);
  });

  it("bio fill preserves requirement order and shares kinds across fields", () => {
    const log = [obs("o1", "c1", "kind-a", 10)];
    const requirements = [
      { field: "field-z", requiredKind: "kind-a" },
      { field: "field-y", requiredKind: "kind-a" },
    ];
    expect(
      bioFillForSpecies(log, "s-alpha", SPECIES, requirements).map((f) => f.field),
    ).toEqual(["field-z", "field-y"]);
    expect(
      bioFillForSpecies(log, "s-alpha", SPECIES, requirements).every((f) => f.filled),
    ).toBe(true);
  });

  it("append is pure, rejects duplicate ids, and never mutates the log", () => {
    const log = [obs("o1", "c1", "kind-a", 10)];
    const snapshot = JSON.stringify(log);
    const next = appendResearchObservation(log, obs("o2", "c1", "kind-b", 20));
    expect(next).toHaveLength(2);
    expect(JSON.stringify(log)).toBe(snapshot);
    expect(() => appendResearchObservation(log, obs("o1", "c2", "kind-a", 30))).toThrow();
    expect(JSON.stringify(log)).toBe(snapshot);
  });

  it("inputs are never mutated or reordered", () => {
    const log = [
      obs("o1", "c1", "kind-b", 20),
      obs("o2", "c1", "kind-a", 10),
    ];
    const snapshot = JSON.stringify(log);
    const summary = researchSummaryForSpecies(log, "s-alpha", SPECIES);
    expect(summary.observedKinds).toEqual(["kind-a", "kind-b"]);
    expect(JSON.stringify(log)).toBe(snapshot);
    expect(summary.kinds[0]).not.toBe(log[0]);
  });

  it("fails loudly on malformed observations, mappings, and requirements", () => {
    const bad = [{ id: "x", creatureId: "c1", kind: "", at: 1 }] as unknown as never;
    expect(() => observationsForCreature(bad, "c1")).toThrow();
    expect(() =>
      observationsForCreature([obs("o1", "c1", "kind-a", Number.NaN)], "c1"),
    ).toThrow();
    expect(() => observationsForCreature("not-an-array" as never, "c1")).toThrow();
    expect(() => observationsForCreature([], "")).toThrow();
    expect(() => researchSummaryForSpecies([], "", SPECIES)).toThrow();
    expect(() =>
      researchSummaryForSpecies([obs("o1", "c1", "kind-a", 10)], "s-alpha", {
        c1: "",
      }),
    ).toThrow();
    expect(() =>
      bioFillForSpecies([], "s-alpha", SPECIES, [{ field: "", requiredKind: "kind-a" }]),
    ).toThrow();
    expect(() =>
      bioFillForSpecies([], "s-alpha", SPECIES, [{ field: "f", requiredKind: "" }]),
    ).toThrow();
    expect(() =>
      bioFillForSpecies([], "s-alpha", SPECIES, [
        { field: "f", requiredKind: "kind-a" },
        { field: "f", requiredKind: "kind-b" },
      ]),
    ).toThrow();
  });

  it("no authored content: no species, place, or name vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync(
      new URL("./garden-research.ts", import.meta.url),
      "utf-8",
    );
    for (const word of ["Sproutle", "Mochii", "Kittember", "Route", "Boot Harbor"]) {
      expect(src).not.toContain(word);
    }
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) => {
      try {
        return fs.readFileSync(new URL(p, import.meta.url), "utf-8");
      } catch {
        return "";
      }
    };
    expect(read("./garden-wiring.ts")).not.toContain("garden-research");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-research",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain("garden-research");
    expect(read("./garden-register.ts")).not.toContain("garden-research");
  });
});
