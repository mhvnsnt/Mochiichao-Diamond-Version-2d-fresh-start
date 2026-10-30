/**
 * WorldEngine bridge coverage lock (AUDIT gap G-B, owner order 2026-10-29).
 * Mirrors moveAnimation.test.ts for the overworld battle path: every move
 * name WorldEngine can reference must resolve — to a MOVES_DB registry
 * profile or an explicitly registered native profile — with NO silent
 * generic fallback, and the bridge profiles for MOVES_DB moves must be
 * the BattleView registry profiles themselves.
 */
import { describe, expect, it } from "vitest";
import { GAME_DATA } from "../world/GameData";
import { FULL_WORLD } from "../world/FullWorldMaps";
import { MOVES_DB } from "./moves";
import { getMoveAnimationProfile } from "./moveAnimation";
import {
  WORLD_NATIVE_MOVE_SPECS,
  buildWorldAttackPresentation,
  collectWorldMoveKeys,
  resolveWorldMove,
  validateWorldMoveCoverage,
} from "./worldMoveBridge";

function fullWorldMoveNames(): string[] {
  const names = new Set<string>();
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    for (const [k, val] of Object.entries(v)) {
      if (k === "moves" && Array.isArray(val)) for (const m of val) names.add(m as string);
      else walk(val);
    }
  };
  walk(FULL_WORLD);
  return [...names];
}

describe("WorldEngine move-profile bridge (G-B)", () => {
  it("covers every move name WorldEngine can reference, with no generic fallback", () => {
    expect(validateWorldMoveCoverage()).toEqual([]);
    const keys = collectWorldMoveKeys();
    expect(keys.length).toBeGreaterThan(150); // 122 ids + display names + island names + alias
    for (const key of keys) {
      const r = resolveWorldMove(key);
      expect(r, key).not.toBeNull();
      expect(r!.profile.delivery, key).toBeTruthy();
      expect(r!.profile.signature, key).toBeTruthy();
      expect(r!.profile.timelineMs.total, key).toBeGreaterThan(0);
    }
  });

  it("covers the GameData island and every FullWorldMaps team/pool name (independently collected)", () => {
    for (const name of Object.keys((GAME_DATA as any).moves)) {
      expect(resolveWorldMove(name), `GameData: ${name}`).not.toBeNull();
    }
    const mapNames = fullWorldMoveNames();
    expect(mapNames.length).toBeGreaterThan(15);
    for (const name of mapNames) {
      expect(resolveWorldMove(name), `FullWorldMaps: ${name}`).not.toBeNull();
    }
  });

  it("island names with no MOVES_DB id get registered native profiles — not another move's", () => {
    for (const name of ["Punch", "Jab", "Chrome Claw"]) {
      const r = resolveWorldMove(name)!;
      expect(r.kind, name).toBe("native");
      expect(r.moveId, name).toBe(`WORLD_${name.toUpperCase().replace(/ /g, "_")}`);
      expect(r.entry.sourcePokemonMove, name).toBeNull();
      expect(r.entry.sourceBasis, name).toContain("native-registered");
    }
    // Chrome Claw must not borrow Iron Claw / Metal Strike's animation:
    expect(resolveWorldMove("Chrome Claw")!.profile.signature).not.toBe(getMoveAnimationProfile("IRON_CLAW")!.signature);
    expect(resolveWorldMove("Chrome Claw")!.profile.signature).not.toBe(getMoveAnimationProfile("METAL_STRIKE")!.signature);
    // Every native spec is registered and resolves:
    expect(Object.keys(WORLD_NATIVE_MOVE_SPECS).length).toBe(30);
  });

  it("batch-3 display-name collisions resolve to the island native; the pool moves keep their ids", () => {
    // Four registry-locked pool display names collide with island
    // natives (move-completion census, 2026-10-29). Name-keyed lookup
    // is an island reference and keeps the native; id-keyed lookup —
    // how party creatures carry moves — reaches the pool move itself.
    for (const name of ["Chrome Screech", "Draco Tail", "Frost Blast", "Mosquito Bite"]) {
      expect(resolveWorldMove(name)!.kind, name).toBe("native");
    }
    expect(resolveWorldMove("ICE_BEAM")!.moveId).toBe("ICE_BEAM");
    expect(resolveWorldMove("DRAGON_TAIL")!.moveId).toBe("DRAGON_TAIL");
    expect(resolveWorldMove("BUG_BITE")!.moveId).toBe("BUG_BITE");
    expect(resolveWorldMove("METAL_SOUND")!.moveId).toBe("METAL_SOUND");
  });

  it("Punch, Jab, Claw and Tackle are four different contact animations", () => {
    const punch = resolveWorldMove("Punch")!;
    const jab = resolveWorldMove("Jab")!;
    const claw = resolveWorldMove("Claw")!;
    const tackle = resolveWorldMove("Tackle")!;
    for (const r of [punch, jab, claw, tackle]) expect(r.profile.delivery).toBe("contact_lunge");
    const sigs = new Set([punch, jab, claw, tackle].map((r) => r.profile.signature));
    expect(sigs.size).toBe(4);
    expect(jab.profile.timelineMs.total).toBeLessThan(punch.profile.timelineMs.total);
    expect(punch.profile.timelineMs.total).toBeLessThan(tackle.profile.timelineMs.total);
  });

  it("names that ARE MOVES_DB moves resolve to the BattleView registry profile itself", () => {
    const cases: Record<string, string> = {
      "Tackle": "TACKLE",
      "Swift Movement": "QUICK_ATTACK",
      "Water Orb": "WATER_ORB",
      "Wind Blast": "GUST_WAVE",
      "Vine Lash": "VINE_LASH",
      "Tremor": "EARTH_TREMOR",
      "Munch": "CRUNCH",
      "Hydro Rush": "AQUA_JET",
    };
    for (const [name, id] of Object.entries(cases)) {
      const r = resolveWorldMove(name)!;
      expect(r.kind, name).toBe("moves_db");
      expect(r.moveId, name).toBe(id);
      expect(r.profile.signature, name).toBe(getMoveAnimationProfile(id)!.signature);
    }
    // ids themselves resolve too (party/wild creatures carry ids):
    expect(resolveWorldMove("QUICK_ATTACK")!.moveId).toBe("QUICK_ATTACK");
    // the documented pre-rename display name still lands on the same move:
    expect(resolveWorldMove("Quick Attack")!.moveId).toBe("QUICK_ATTACK");
  });

  it("damage resolution matches the pre-bridge values (GameData first, then MOVES_DB)", () => {
    expect(resolveWorldMove("Tackle")).toMatchObject({ power: 40, type: "Normal" });
    expect(resolveWorldMove("Punch")).toMatchObject({ power: 40, type: "Normal" });
    expect(resolveWorldMove("Chrome Claw")).toMatchObject({ power: 50, type: "Chrome" });
    expect(resolveWorldMove("Vine Lash")).toMatchObject({ power: 45, type: "Earth" });
    expect(resolveWorldMove("QUICK_ATTACK")).toMatchObject({ power: 40, display: "Swift Movement" });
    expect(resolveWorldMove("Leaf Blast")).toMatchObject({ power: 55, display: "Leaf Blast" });
  });

  it("unknown names resolve to null — never a generic fallback", () => {
    expect(resolveWorldMove("Definitely Not A Move")).toBeNull();
    expect(resolveWorldMove("")).toBeNull();
    expect(resolveWorldMove(null)).toBeNull();
    expect(resolveWorldMove(undefined)).toBeNull();
  });

  it("DOM presentation consumes the profile: Tackle and Swift Movement differ in duration, cadence and FX", () => {
    const tackle = resolveWorldMove("Tackle")!;
    const swift = resolveWorldMove("Swift Movement")!;
    const tp = buildWorldAttackPresentation("player", tackle.profile, tackle.power, 101);
    const sp = buildWorldAttackPresentation("player", swift.profile, swift.power, 102);
    expect(tp.durationMs).toBe(1490);
    expect(sp.durationMs).toBe(780);
    expect(tp.fxKind).toBe("none"); // heavy lunge, no trail
    expect(sp.fxKind).toBe("ghosts"); // blitz afterimages
    expect(sp.fxCount).toBe(3);
    expect(tp.cssText).not.toBe(sp.cssText);
    // status/self moves act on the right subject:
    const guard = resolveWorldMove("Chrome Guard")!;
    const gp = buildWorldAttackPresentation("enemy", guard.profile, guard.power, 103);
    expect(gp.fxKind).toBe("self");
    expect(gp.targetAnimation).toBe("none");
    // a native projectile travels:
    const aqua = resolveWorldMove("Aqua Blast")!;
    const ap = buildWorldAttackPresentation("player", aqua.profile, aqua.power, 104);
    expect(ap.fxKind).toBe("travel");
    expect(ap.fxCount).toBe(1);
  });
});
