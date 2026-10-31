import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assignHome,
  allResidents,
  emptyRegister,
  homeOf,
  homeRecognised,
  registerResident,
  registerSummary,
  removeResident,
  residentsInHabitat,
  residentsInZone,
  setPreferences,
  unassignHome,
  unassignedResidents,
  type GardenRegister,
} from "./garden-register";
import type { SolvedHabitat } from "./garden-habitats";

function solved(recipeId: string): SolvedHabitat {
  return {
    recipeId,
    tier: 1,
    extent: 3,
    finish: 2,
    character: null,
  };
}

function throwsWith(fn: () => unknown, part: string): void {
  expect(fn).toThrowError(new RegExp(`garden-register: .*${part}`));
}

describe("garden-register (S14 slice 6, DQB2 W6 pure form)", () => {
  it("starts empty and lists a resident unassigned", () => {
    const reg = registerResident(emptyRegister(), "res-a");
    expect(homeOf(reg, "res-a")).toEqual({
      residentId: "res-a",
      homeZoneId: null,
      homeRecipeId: null,
      preferences: [],
    });
    expect(unassignedResidents(reg).map((e) => e.residentId)).toEqual(["res-a"]);
    expect(registerSummary(reg)).toEqual({ listed: 1, assigned: 0, unassigned: 1 });
  });

  it("re-registering a listed resident is a no-op that keeps its home", () => {
    const assigned = assignHome(registerResident(emptyRegister(), "res-a"), "res-a", "zone-1", "recipe-x");
    const again = registerResident(assigned, "res-a");
    expect(again).toBe(assigned);
    expect(homeOf(again, "res-a")?.homeZoneId).toBe("zone-1");
  });

  it("assigns a home zone + habitat, and a zone-only home", () => {
    let reg = registerResident(emptyRegister(), "res-a");
    reg = assignHome(reg, "res-a", "zone-1", "recipe-x");
    expect(homeOf(reg, "res-a")).toMatchObject({ homeZoneId: "zone-1", homeRecipeId: "recipe-x" });
    reg = assignHome(reg, "res-a", "zone-2", null);
    expect(homeOf(reg, "res-a")).toMatchObject({ homeZoneId: "zone-2", homeRecipeId: null });
    expect(registerSummary(reg)).toEqual({ listed: 1, assigned: 1, unassigned: 0 });
  });

  it("assigning the exact home already held is a no-op", () => {
    const assigned = assignHome(registerResident(emptyRegister(), "res-a"), "res-a", "zone-1", "recipe-x");
    expect(assignHome(assigned, "res-a", "zone-1", "recipe-x")).toBe(assigned);
  });

  it("unassign clears the home and keeps the listing; repeat is a no-op", () => {
    const assigned = assignHome(registerResident(emptyRegister(), "res-a"), "res-a", "zone-1", "recipe-x");
    const cleared = unassignHome(assigned, "res-a");
    expect(homeOf(cleared, "res-a")).toMatchObject({ homeZoneId: null, homeRecipeId: null });
    expect(unassignedResidents(cleared).map((e) => e.residentId)).toEqual(["res-a"]);
    expect(unassignHome(cleared, "res-a")).toBe(cleared);
  });

  it("removes a resident; removing an absent resident is a no-op", () => {
    const reg = registerResident(registerResident(emptyRegister(), "res-a"), "res-b");
    expect(removeResident(reg, "res-a")).not.toBe(reg);
    expect(homeOf(removeResident(reg, "res-a"), "res-a")).toBeNull();
    expect(removeResident(reg, "res-ghost")).toBe(reg);
  });

  it("queries by zone and by habitat, in register order", () => {
    let reg = emptyRegister();
    reg = registerResident(reg, "res-a");
    reg = registerResident(reg, "res-b");
    reg = registerResident(reg, "res-c");
    reg = assignHome(reg, "res-a", "zone-1", "recipe-x");
    reg = assignHome(reg, "res-b", "zone-1", "recipe-y");
    reg = assignHome(reg, "res-c", "zone-2", "recipe-x");
    expect(residentsInZone(reg, "zone-1").map((e) => e.residentId)).toEqual(["res-a", "res-b"]);
    expect(residentsInHabitat(reg, "recipe-x").map((e) => e.residentId)).toEqual(["res-a", "res-c"]);
    expect(allResidents(reg).map((e) => e.residentId)).toEqual(["res-a", "res-b", "res-c"]);
  });

  it("homeRecognised: true on a matching solved habitat, false on mismatch or none", () => {
    let reg = assignHome(registerResident(emptyRegister(), "res-a"), "res-a", "zone-1", "recipe-x");
    const cache: Record<string, SolvedHabitat | null> = { "zone-1": solved("recipe-x") };
    expect(homeRecognised(reg, "res-a", cache)).toBe(true);
    expect(homeRecognised(reg, "res-a", { "zone-1": solved("recipe-y") })).toBe(false);
    expect(homeRecognised(reg, "res-a", { "zone-1": null })).toBe(false);
    expect(homeRecognised(reg, "res-a", {})).toBe(false);
  });

  it("homeRecognised: zone-only assignment is recognised by any solved habitat in its zone", () => {
    const reg = assignHome(registerResident(emptyRegister(), "res-a"), "res-a", "zone-1", null);
    expect(homeRecognised(reg, "res-a", { "zone-1": solved("recipe-any") })).toBe(true);
    expect(homeRecognised(reg, "res-a", { "zone-1": null })).toBe(false);
  });

  it("homeRecognised: null for unassigned and unlisted residents, never a failure", () => {
    const reg = registerResident(emptyRegister(), "res-a");
    expect(homeRecognised(reg, "res-a", { "zone-1": solved("recipe-x") })).toBeNull();
    expect(homeRecognised(reg, "res-ghost", {})).toBeNull();
  });

  it("preferences are caller-supplied, stored, replaced, and deduped", () => {
    let reg = registerResident(emptyRegister(), "res-a", ["band-a", "band-b", "band-a"]);
    expect(homeOf(reg, "res-a")?.preferences).toEqual(["band-a", "band-b"]);
    reg = setPreferences(reg, "res-a", ["band-c"]);
    expect(homeOf(reg, "res-a")?.preferences).toEqual(["band-c"]);
    expect(setPreferences(reg, "res-a", ["band-c"])).toBe(reg);
    // Registering again does not reset preferences (see no-op test above).
    expect(homeOf(registerResident(reg, "res-a"), "res-a")?.preferences).toEqual(["band-c"]);
  });

  it("never mutates inputs; outputs are copies", () => {
    const base = registerResident(emptyRegister(), "res-a");
    const snapshot = JSON.stringify(base);
    const assigned = assignHome(base, "res-a", "zone-1", "recipe-x");
    expect(JSON.stringify(base)).toBe(snapshot);
    expect(assigned).not.toBe(base);
    const entry = homeOf(assigned, "res-a")!;
    (entry.preferences as unknown as string[]).push("tampered");
    expect(homeOf(assigned, "res-a")?.preferences).toEqual([]);
  });

  it("fails loudly on bad ids, unlisted residents, and bad preference lists", () => {
    const reg = registerResident(emptyRegister(), "res-a");
    throwsWith(() => registerResident(reg, ""), "residentId");
    throwsWith(() => assignHome(reg, "res-ghost", "zone-1", "recipe-x"), "unlisted");
    throwsWith(() => assignHome(reg, "res-a", "", "recipe-x"), "homeZoneId");
    throwsWith(() => assignHome(reg, "res-a", "zone-1", ""), "homeRecipeId");
    throwsWith(() => unassignHome(reg, "res-ghost"), "unlisted");
    throwsWith(() => setPreferences(reg, "res-ghost", ["band-a"]), "unlisted");
    throwsWith(() => registerResident(reg, "res-b", ["band-a", ""] as never), "preference");
    throwsWith(() => homeOf(reg, ""), "residentId");
  });

  it("staging locks: no live module imports the register yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    expect(wiring).not.toContain("garden-register");
    expect(view).not.toContain("garden-register");
    expect(phase4).not.toContain("garden-register");
  });
});
