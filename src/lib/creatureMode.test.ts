/**
 * creatureMode.test.ts — the decided rules of the PMD-mode package,
 * locked as tests (owner orders 2026-10-29 ~20:12–20:17 CDT):
 *  - the battle-style rule is DECIDED (meaning decides), not data-TBD
 *  - the Ranger never deals damage personally (canon)
 *  - tall-grass encounters are untouched by the dual-encounter layer
 *  - companion commands + story-override data shape
 *  - roamer temperament behaviour (Arceus T3)
 *  - engagement resolutions incl. PMD recruit flavour
 */
import { describe, it, expect } from "vitest";
import {
  battleStyleFor,
  swapTarget,
  companionOf,
  nextCompanionCommand,
  effectiveCompanionCommand,
  companionFreeStep,
  createRoamer,
  stepRoamer,
  encounterMixFor,
  roamersForMap,
  rangedAction,
  contactResolution,
  overworldMoveset,
  REGULAR_ATTACK,
  type Roamer,
} from "./creatureMode";
import encountersData from "../data/core/encounters.json";
import { FULL_WORLD } from "../world/FullWorldMaps";

const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};
const mon = (over: any = {}) => ({
  speciesId: "001",
  level: 5,
  hp: 20,
  maxHp: 20,
  currentHp: 20,
  stats: { atk: 12, def: 10, spa: 11, spd: 10, spe: 9 },
  moves: ["AQUA_SHOT"],
  type: "WATER",
  ...over,
});

describe("the decided battle-style rule (DORO-DESIGNED, owner delegation 2026-10-29)", () => {
  it("Ranger mode: wild contact is ALWAYS the classic duel, every place", () => {
    for (const place of ["open", "dungeon", "cave", "built"] as const) {
      expect(battleStyleFor("ranger", place, "wild")).toBe("classic");
      expect(battleStyleFor("ranger", place, "alpha")).toBe("classic");
      expect(battleStyleFor("ranger", place, "trainer")).toBe("classic");
    }
  });
  it("Creature mode: wild scraps are PMD real-time; stakes escalate to the duel", () => {
    expect(battleStyleFor("creature", "open", "wild")).toBe("pmd-skirmish");
    expect(battleStyleFor("creature", "cave", "wild")).toBe("pmd-skirmish");
    expect(battleStyleFor("creature", "dungeon", "wild")).toBe("pmd-skirmish");
    for (const stakes of ["trainer", "boss", "dojo", "story", "alpha"] as const) {
      expect(battleStyleFor("creature", "open", stakes)).toBe("classic");
    }
  });
});

describe("mode swap", () => {
  it("becomes the first living party member (movement.json lead rule)", () => {
    const dead = mon({ currentHp: 0, hp: 0, speciesId: "002" });
    const alive = mon({ speciesId: "003" });
    expect(swapTarget([dead, alive])?.speciesId).toBe("003");
    expect(swapTarget([alive, dead])?.speciesId).toBe("003");
    expect(swapTarget([])).toBeNull();
  });
  it("the companion is the other half of the dyad", () => {
    expect(companionOf("creature", [mon()])).toEqual({ kind: "ranger" });
    expect(companionOf("ranger", [mon()])?.kind).toBe("creature");
  });
});

describe("companion commands (Fallout layer)", () => {
  it("cycles follow -> wait -> free", () => {
    expect(nextCompanionCommand("follow")).toBe("wait");
    expect(nextCompanionCommand("wait")).toBe("free");
    expect(nextCompanionCommand("free")).toBe("follow");
  });
  it("no story override is hard-coded (table ships empty = owner slot)", () => {
    expect(effectiveCompanionCommand("follow", ["anything"], "sector0")).toBe("follow");
  });
  it("free sandboxing stays within 3 tiles of the anchor", () => {
    const out = companionFreeStep({ x: 10, y: 10 }, { x: 10, y: 10 }, seq([0.9, 0.1]));
    expect(Math.abs(out.pos.x - 10) + Math.abs(out.pos.y - 10)).toBeLessThanOrEqual(3);
    const held = companionFreeStep({ x: 13, y: 10 }, { x: 10, y: 10 }, seq([0.9, 0.1]));
    expect(held.pos).toEqual({ x: 13, y: 10 });
  });
});

describe("roamers act out their temperament (Arceus T3)", () => {
  it("a timid roamer flees a near player", () => {
    const r = createRoamer("038", 3, { x: 10, y: 10 }, { temperament: "timid" });
    const before = Math.abs(r.pos.x - 12) + Math.abs(r.pos.y - 10);
    const next = stepRoamer(r, { x: 12, y: 10 }, seq([0.5]));
    expect(next.state).toBe("flee");
    const after = Math.abs(next.pos.x - 12) + Math.abs(next.pos.y - 10);
    expect(after).toBeGreaterThan(before);
  });
  it("an aggressive roamer chases; an Alpha never flees", () => {
    const agg = createRoamer("038", 3, { x: 10, y: 10 }, { temperament: "aggressive" });
    const chased = stepRoamer(agg, { x: 13, y: 10 }, seq([0.5]));
    expect(chased.state).toBe("chase");
    expect(chased.pos.x).toBe(11);
    const alpha = createRoamer("038", 6, { x: 10, y: 10 }, { temperament: "timid", isAlpha: true });
    const held = stepRoamer(alpha, { x: 12, y: 10 }, seq([0.5]));
    expect(held.state).not.toBe("flee");
  });
  it("roamers are drawn from the map's own grass pool (one ecology)", () => {
    const pool = [{ id: "038" }, { id: "013" }];
    expect(roamersForMap("meadow-route-01", pool, "both", seq([0.2])).length).toBe(2);
    expect(roamersForMap("meadow-route-01", pool, "grass", seq([0.2]))).toEqual([]);
  });
  it("mix defaults: pool maps are 'both'; interiors stay grass-model", () => {
    expect(encounterMixFor("route_1", true, false)).toBe("both");
    expect(encounterMixFor("sector0_house_1f", false, true)).toBe("grass");
  });
});

describe("engagement layer", () => {
  const target = (): Roamer => createRoamer("038", 3, { x: 8, y: 8 }, { hp: 30 });
  it("CANON: the Ranger never deals damage personally — a strike is refused", () => {
    const out = rangedAction(mon(), target(), "strike", REGULAR_ATTACK, { mode: "ranger" }, seq([0.5]));
    expect(out.result).toBe("refused");
    expect(out.damage).toBe(0);
  });
  it("Ranger ranged play is approach play: lure, distract, a catch attempt", () => {
    expect(rangedAction(mon(), target(), "lure", null, { mode: "ranger" }, seq([0.5])).result).toBe("lured");
    const caught = rangedAction(mon(), target(), "catchAttempt", null, { mode: "ranger" }, seq([0.1]));
    expect(caught.result).toBe("caught");
    const missed = rangedAction(mon(), target(), "catchAttempt", null, { mode: "ranger" }, seq([0.99]));
    expect(missed.result).toBe("angered");
    expect(missed.escalates).toBe(true);
  });
  it("Creature mode: a strike is a real move and can knock out at range", () => {
    const weak = createRoamer("038", 1, { x: 8, y: 8 }, { hp: 4 });
    const out = rangedAction(mon({ level: 30, stats: { atk: 90, def: 50, spa: 90, spd: 50, spe: 50 } }), weak, "strike", REGULAR_ATTACK, { mode: "creature", habitatFit: "far" }, seq([0.5, 0.5, 0.99]));
    expect(out.damage).toBeGreaterThan(0);
    expect(out.targetHp).toBe(0);
    expect(["ko", "recruited"]).toContain(out.result);
  });
  it("PMD recruit flavour: a KO where habitat fits can end in JOINING, not a cube", () => {
    const weak = createRoamer("038", 1, { x: 8, y: 8 }, { hp: 4 });
    const out = rangedAction(
      mon({ level: 30, stats: { atk: 90, def: 50, spa: 90, spd: 50, spe: 50 } }),
      weak, "strike", REGULAR_ATTACK,
      { mode: "creature", habitatFit: "home", bondBand: 5 },
      seq([0.5, 0.5, 0.01]),
    );
    expect(out.result).toBe("recruited");
  });
  it("creatures do not throw cubes", () => {
    const out = rangedAction(mon(), target(), "catchAttempt", null, { mode: "creature" }, seq([0.1]));
    expect(out.result).toBe("refused");
  });
  it("the field moveset is known moves + the regular attack (PMD contract)", () => {
    const db = { AQUA_SHOT: { name: "Aqua Shot", type: "WATER", category: "Special", power: 40, accuracy: 100 } };
    const set = overworldMoveset(mon(), db as any);
    expect(set.map((m) => m.id)).toContain("AQUA_SHOT");
    expect(set[set.length - 1].id).toBe("REGULAR_ATTACK");
  });
  it("contact resolution follows the decided rule, Alphas escalate", () => {
    expect(contactResolution("ranger", "open", target()).style).toBe("classic");
    expect(contactResolution("creature", "open", target()).style).toBe("pmd-skirmish");
    const alpha = createRoamer("038", 8, { x: 8, y: 8 }, { isAlpha: true });
    expect(contactResolution("creature", "open", alpha)).toEqual({ style: "classic", stakes: "alpha" });
  });
});

describe("the classic grass path is untouched by this layer", () => {
  it("the seed encounter tables still carry their grass method + pools", () => {
    const grass = (encountersData as any).encounters.filter((e: any) => e.method === "grass");
    expect(grass.length).toBeGreaterThan(0);
    expect(grass[0].slots.length).toBeGreaterThan(0);
  });
  it("live maps still carry encounter pools for the grass roll", () => {
    const withPools = Object.values(FULL_WORLD as any).filter(
      (m: any) => Array.isArray(m.encounters) && m.encounters.length > 0 && m.encounters[0].pool?.length > 0,
    );
    expect(withPools.length).toBeGreaterThan(0);
  });
});
