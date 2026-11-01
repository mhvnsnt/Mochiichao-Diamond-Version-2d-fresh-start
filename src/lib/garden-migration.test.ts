import { describe, expect, it } from "vitest";
import {
  migrateComposition,
  validateMigrationRule,
  type MigrationRule,
} from "./garden-migration";

function rule(
  id: string,
  worldStates: string[],
  arrivals: string[] = [],
  departures: string[] = [],
): MigrationRule {
  return { id, worldStates, arrivals, departures };
}

describe("garden-migration (B3 §2.5 migration/season composition read)", () => {
  it("applies a firing rule's arrivals and departures, in composition order", () => {
    const result = migrateComposition(
      ["res-a", "res-b", "res-c"],
      "ws-1",
      [rule("r-1", ["ws-1"], ["new-a"], ["res-b"])],
    );
    expect(result.residents).toEqual(["res-a", "res-c", "new-a"]);
    expect(result.arrived).toEqual(["new-a"]);
    expect(result.departed).toEqual(["res-b"]);
    expect(result.appliedRuleIds).toEqual(["r-1"]);
  });

  it("a rule that does not match the world-state key fires nothing", () => {
    const result = migrateComposition(
      ["res-a"],
      "ws-1",
      [rule("r-1", ["ws-2"], ["new-a"], ["res-a"])],
    );
    expect(result.residents).toEqual(["res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
    expect(result.appliedRuleIds).toEqual([]);
  });

  it("rules apply in caller order, and a later rule can undo an earlier one", () => {
    const result = migrateComposition(
      ["res-a"],
      "ws-1",
      [
        rule("r-1", ["ws-1"], ["new-a"]),
        rule("r-2", ["ws-1"], [], ["new-a"]),
      ],
    );
    // Net change: new-a arrived and then left, so it is neither.
    expect(result.residents).toEqual(["res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
    expect(result.appliedRuleIds).toEqual(["r-1", "r-2"]);
  });

  it("a later rule can re-arrive a resident departed by an earlier rule", () => {
    const result = migrateComposition(
      ["res-a", "res-b"],
      "ws-1",
      [
        rule("r-1", ["ws-1"], [], ["res-a"]),
        rule("r-2", ["ws-1"], ["res-a"]),
      ],
    );
    // Present before and after: neither a net arrival nor a departure,
    // but it moved to the end (arrivals append).
    expect(result.residents).toEqual(["res-b", "res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
  });

  it("an arrival already resident is not duplicated, and a firing rule still counts as applied", () => {
    const result = migrateComposition(
      ["res-a"],
      "ws-1",
      [rule("r-1", ["ws-1"], ["res-a"], ["ghost"])],
    );
    expect(result.residents).toEqual(["res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
    expect(result.appliedRuleIds).toEqual(["r-1"]);
  });

  it("an empty rule list leaves the composition untouched", () => {
    const result = migrateComposition(["res-a", "res-b"], "ws-1", []);
    expect(result).toEqual({
      residents: ["res-a", "res-b"],
      arrived: [],
      departed: [],
      appliedRuleIds: [],
    });
  });

  it("an empty resident list migrates to arrivals only", () => {
    const result = migrateComposition([], "ws-1", [
      rule("r-1", ["ws-1"], ["new-a", "new-b"]),
    ]);
    expect(result.residents).toEqual(["new-a", "new-b"]);
    expect(result.arrived).toEqual(["new-a", "new-b"]);
    expect(result.departed).toEqual([]);
  });

  it("world-state keys are caller vocabulary, not a module-enumerated list", () => {
    // The spec's season / festival / weather drivers work only
    // because the caller names the key; the module enumerates none.
    const result = migrateComposition([], "festival-x", [
      rule("r-1", ["festival-x"], ["visitor-a"]),
    ]);
    expect(result.residents).toEqual(["visitor-a"]);
    expect(result.appliedRuleIds).toEqual(["r-1"]);
  });

  it("the read is visit-independent: same inputs always give the same composition", () => {
    const residents = ["res-a"];
    const rules = [rule("r-1", ["ws-1"], ["new-a"])];
    // There is no visit parameter to vary: two identical reads agree.
    expect(migrateComposition(residents, "ws-1", rules)).toEqual(
      migrateComposition(residents, "ws-1", rules),
    );
    expect(residents).toEqual(["res-a"]);
    expect(rules).toEqual([rule("r-1", ["ws-1"], ["new-a"])]);
  });

  it("inputs are never mutated", () => {
    const residents = ["res-a", "res-b"];
    const rules = [rule("r-1", ["ws-1"], ["new-a"], ["res-b"])];
    migrateComposition(residents, "ws-1", rules);
    expect(residents).toEqual(["res-a", "res-b"]);
    expect(rules[0].arrivals).toEqual(["new-a"]);
    expect(rules[0].departures).toEqual(["res-b"]);
  });

  it("duplicate rule ids fail loudly", () => {
    expect(() =>
      migrateComposition([], "ws-1", [
        rule("r-1", ["ws-1"], ["new-a"]),
        rule("r-1", ["ws-1"], ["new-b"]),
      ]),
    ).toThrow();
  });

  it("a rule that both arrives and departs the same creature fails loudly", () => {
    expect(() =>
      validateMigrationRule(rule("r-1", ["ws-1"], ["x"], ["x"])),
    ).toThrow();
  });

  it("malformed rules fail loudly: empty id, empty worldStates, empty rule, duplicate keys", () => {
    expect(() => validateMigrationRule(rule("", ["ws-1"], ["x"]))).toThrow();
    expect(() => validateMigrationRule(rule("r-1", [], ["x"]))).toThrow();
    expect(() => validateMigrationRule(rule("r-1", ["ws-1"]))).toThrow();
    expect(() =>
      validateMigrationRule(rule("r-1", ["ws-1", "ws-1"], ["x"])),
    ).toThrow();
    expect(() =>
      validateMigrationRule(rule("r-1", ["ws-1"], ["x", "x"])),
    ).toThrow();
    expect(() =>
      migrateComposition(["res-a", "res-a"], "ws-1", []),
    ).toThrow();
    expect(() => migrateComposition(["res-a"], "", [])).toThrow();
    expect(() => migrateComposition(["res-a"], "ws-1", "nope" as never)).toThrow();
  });

  it("the result shape carries exactly residents, arrived, departed, appliedRuleIds", () => {
    const result = migrateComposition(["res-a"], "ws-1", [
      rule("r-1", ["ws-1"], ["new-a"]),
    ]);
    expect(Object.keys(result).sort()).toEqual([
      "appliedRuleIds",
      "arrived",
      "departed",
      "residents",
    ]);
  });

  it("no authored content: no species, place, season, or festival vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const moduleSource = fs.readFileSync(
      new URL("./garden-migration.ts", import.meta.url),
      "utf-8",
    );
    for (const word of [
      "Sproutle",
      "Mochii",
      "Kittember",
      "Boot Harbor",
      "spring",
      "summer",
      "autumn",
      "winter",
    ]) {
      expect(moduleSource).not.toContain(word);
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
    expect(read("./garden-wiring.ts")).not.toContain("garden-migration");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-migration",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain(
      "garden-migration",
    );
    expect(read("./garden-register.ts")).not.toContain("garden-migration");
  });
});
