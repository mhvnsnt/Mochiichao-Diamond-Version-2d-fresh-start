import { describe, it, expect } from "vitest";
import { MAP_PLACEMENT, resolveMusic } from "./musicPlacement";
import { FULL_WORLD } from "../world/FullWorldMaps";

describe("music placement coverage", () => {
  it("every world map has an authored placement", () => {
    for (const key of Object.keys(FULL_WORLD)) {
      expect(MAP_PLACEMENT[key], `map ${key} missing placement`).toBeDefined();
      const p = resolveMusic({ screen: "overworld", mapId: key, battleKind: null });
      expect(p).not.toBe("unchanged");
      expect(p).not.toBe("silence"); // no Seq map is silent by itself; silence is SCORE-STATE-authored
    }
  });

  it("opening stretch resolves as authored", () => {
    const at = (mapId: string) => resolveMusic({ screen: "overworld", mapId, battleKind: null });
    expect(at("sector0")).toBe("town"); // Boot Harbor
    expect(at("aeon_lab")).toBe("town");
    expect(at("route_1")).toBe("route");
    expect(at("binary_fields")).toBe("town2");
    expect(at("mochiiplex_1")).toBe("center");
    expect(at("dojo_1")).toBe("dojo");
  });

  it("battles interrupt by kind and the field track returns after", () => {
    expect(resolveMusic({ screen: "battle", mapId: "route_1", battleKind: "wild" })).toBe("wildBattle");
    expect(resolveMusic({ screen: "battle", mapId: "dojo_1", battleKind: "trainer" })).toBe("trainerBattle");
    expect(resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null })).toBe("route");
  });

  it("SCORE-STATE ABSENCE is authored silence and outranks everything", () => {
    expect(resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null, scoreState: "ABSENCE" })).toBe("silence");
    expect(resolveMusic({ screen: "battle", mapId: "route_1", battleKind: "wild", scoreState: "ABSENCE" })).toBe("silence");
  });

  it("menus and dialogue never change the music", () => {
    expect(resolveMusic({ screen: "dialogue", mapId: "sector0", battleKind: null })).toBe("unchanged");
    expect(resolveMusic({ screen: "menu", mapId: "sector0", battleKind: null })).toBe("unchanged");
  });
});

describe("placement walk — PROOF (resolver-level simulation, headless)", () => {
  it("town -> route -> wild battle -> route -> center -> town", () => {
    const walk: Array<[string, ReturnType<typeof resolveMusic>]> = [
      ["Boot Harbor (sector0)", resolveMusic({ screen: "overworld", mapId: "sector0", battleKind: null })],
      ["Route 1 (route_1)", resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null })],
      ["wild battle on Route 1", resolveMusic({ screen: "battle", mapId: "route_1", battleKind: "wild" })],
      ["back to Route 1", resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null })],
      ["Mochi Center (mochiiplex_1)", resolveMusic({ screen: "overworld", mapId: "mochiiplex_1", battleKind: null })],
      ["trainer battle at Dojo 1", resolveMusic({ screen: "battle", mapId: "dojo_1", battleKind: "trainer" })],
      ["back to Boot Harbor", resolveMusic({ screen: "overworld", mapId: "sector0", battleKind: null })],
    ];
    for (const [step, track] of walk) console.log(`WALK ${step} -> ${track}`);
    expect(walk.map((w) => w[1])).toEqual(["town", "route", "wildBattle", "route", "center", "trainerBattle", "town"]);
  });
});
