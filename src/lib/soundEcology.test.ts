// Gap-fill S4 (Habitat Landing 5) receipts: the #84 binding law checked
// mechanically against the game tables. Source rows: the #84 starter
// tables only (see soundEcology.ts header for grain + window honesty).
import { describe, it, expect } from "vitest";
import { SOUND_ECOLOGY_ROWS, checkSoundEcology } from "./soundEcology";
import { REGION1_PLACE_DATA } from "./place";

describe("Landing 5 — #84 binding law", () => {
  it("every authored resident row names a species its place stocks", () => {
    const report = checkSoundEcology();
    expect(report.allResidentRowsStocked).toBe(true);
    const residents = report.rows.filter((r) => r.row.layer === "resident");
    expect(residents.map((r) => [r.row.place, r.row.species, r.stocked])).toEqual([
      ["Garden", "mochii", true],
      ["Garden", "sproutle", true],
      ["Dark Forest — surface", "kittember", true],
    ]);
    // Garden rows were checked at biome grain (meadow + pond together).
    expect(residents.filter((r) => r.row.place === "Garden").every((r) => r.grain === "biome")).toBe(true);
    expect(residents.find((r) => r.row.species === "kittember")?.grain).toBe("zone");
  });
  it("the depths fence holds three ways: no rows, no residents, no slots", () => {
    const report = checkSoundEcology();
    expect(report.depthsResidentRows).toBe(0);
    expect(report.depthsEcologyResidents).toBe(0);
    expect(report.depthsBundleSlots).toBe(0);
    expect(report.depthsFenceHolds).toBe(true);
    expect(
      SOUND_ECOLOGY_ROWS.filter(
        (r) => r.place === "Dark Forest — depths" && r.layer === "resident",
      ),
    ).toEqual([]);
  });
  it("windows are reported unverified, not passed off as verified (HAB-G5)", () => {
    // Every bundle slot carries timeOfDay null today, so no window can
    // be proven active from data. The check must say so, not fake it.
    const report = checkSoundEcology();
    for (const r of report.rows.filter((x) => x.row.layer === "resident")) {
      expect(r.window).toBe("unverified-null");
    }
    // Corroboration from the data itself, not the module's word alone:
    const slots = REGION1_PLACE_DATA.bundles.flatMap((areas) =>
      areas.flatMap((a) => a.tables.flatMap((t) => t.slots)),
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => s.timeOfDay === null)).toBe(true);
  });
  it("a future edit seating an unstocked resident fails loudly", () => {
    const report = checkSoundEcology([
      ...SOUND_ECOLOGY_ROWS,
      {
        place: "Dark Forest — surface",
        layer: "resident",
        species: "mochii",
        window: "always",
        note: "Deliberately unstocked probe row: mochii does not live in the Forest.",
      },
    ]);
    expect(report.allResidentRowsStocked).toBe(false);
  });
});
