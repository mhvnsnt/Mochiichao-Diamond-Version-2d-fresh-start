// Gap-fill S6 receipts: the WorldEngine host's damage core adapts
// flat battle mons + resolved moves into battle-math, with the
// Draco-gated chart slot held neutral (never silently filled).
import { describe, it, expect } from "vitest";
import {
  normaliseBattleElement,
  toBattleMathBattler,
  worldBattleDamage,
} from "./worldBattleCore";

// Flat battle mons, as WorldEngine builds them: atk/def/spd where
// spd means SPEED. Species 001 = WATER, 038 = GRASS (species.ts).
const WATER_FLAT = { level: 5, atk: 10, def: 10, spd: 10, speciesId: "001" };
const GRASS_FLAT = { level: 5, atk: 10, def: 10, spd: 10, speciesId: "038" };
// A full player-side instance: stats.* + stages + status survive.
const WATER_INSTANCE = {
  level: 5,
  speciesId: "001",
  stats: { atk: 10, def: 11, spa: 13, spd: 9, spe: 14 },
  stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
  status: null,
};

// rng 0.5 -> damage roll 100 - floor(0.5*16) = 92. forceCrit false
// means the crit roll consumes no rng, so the single rng call is the
// damage roll. Hand-computed per battle-math's documented step order:
// base -> +2 -> crit -> STAB -> type -> roll.
const ROLL_92 = () => 0.5;

describe("normaliseBattleElement", () => {
  it("maps display spellings to the legacy element vocabulary", () => {
    expect(normaliseBattleElement("Water")).toBe("WATER");
    expect(normaliseBattleElement("Chrome")).toBe("STEEL");
    expect(normaliseBattleElement("Earth")).toBe("GROUND");
    expect(normaliseBattleElement("Flame")).toBe("FIRE");
    expect(normaliseBattleElement("Grass")).toBe("GRASS");
    expect(normaliseBattleElement("WATER")).toBe("WATER");
    expect(normaliseBattleElement("Umbral")).toBe("UMBRAL");
  });
});

describe("toBattleMathBattler", () => {
  it("maps a flat mon: sp split falls back to atk/def, spd is speed", () => {
    const b = toBattleMathBattler(WATER_FLAT);
    expect(b.attack).toBe(10);
    expect(b.defense).toBe(10);
    expect(b.spAttack).toBe(10);
    expect(b.spDefense).toBe(10);
    expect(b.speed).toBe(10);
    expect(b.elements).toEqual(["WATER"]);
    expect(b.stages).toEqual({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 });
    expect(b.status).toBeNull();
  });
  it("keeps an instance's real spa/spd/spe, stages, and status", () => {
    const b = toBattleMathBattler({
      ...WATER_INSTANCE,
      stages: { atk: 1, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
      status: "burn",
    });
    expect(b.spAttack).toBe(13);
    // stats.spd (special defence), NOT a top-level spd (speed).
    expect(b.spDefense).toBe(9);
    expect(b.speed).toBe(14);
    expect(b.stages.atk).toBe(1);
    expect(b.status).toBe("burn");
  });
  it("falls back to the mon's own type when the species does not resolve", () => {
    const b = toBattleMathBattler({ level: 5, atk: 10, def: 10, spd: 10, type: "Earth" });
    expect(b.elements).toEqual(["GROUND"]);
  });
});

describe("worldBattleDamage", () => {
  it("STAB Physical: base 5 -> STAB 7 -> roll 92% = 6", () => {
    const r = worldBattleDamage(WATER_FLAT, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.isStab).toBe(true);
    expect(r.isCrit).toBe(false);
    expect(r.rollPercent).toBe(92);
    expect(r.damage).toBe(6);
  });
  it("no STAB: base 5 -> roll 92% = 4", () => {
    const r = worldBattleDamage(WATER_FLAT, GRASS_FLAT,
      { power: 40, type: "Normal", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.isStab).toBe(false);
    expect(r.damage).toBe(4);
  });
  it("Special uses spa/spd: base 8 -> +2 = 10 -> STAB 15 -> roll 92% = 13", () => {
    const r = worldBattleDamage(WATER_INSTANCE, GRASS_FLAT,
      { power: 80, type: "Water", moveId: "WATER_ORB" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.damage).toBe(13);
    expect(r.isStab).toBe(true);
  });
  it("forced crit doubles before STAB: 5 -> 10 -> 15 -> roll 92% = 13", () => {
    const r = worldBattleDamage(WATER_FLAT, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: true });
    expect(r.isCrit).toBe(true);
    expect(r.damage).toBe(13);
  });
  it("attack stages apply: atk +2 doubles atk 10 -> 20, damage 11", () => {
    const staged = {
      ...WATER_FLAT,
      stages: { atk: 2, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
    };
    const r = worldBattleDamage(staged, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.damage).toBe(11);
  });
  it("power-0 island move scores 0 (Status path)", () => {
    const r = worldBattleDamage(WATER_FLAT, GRASS_FLAT,
      { power: 0, type: "Normal", moveId: "NO_SUCH_MOVE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.damage).toBe(0);
  });
  it("type multiplier stays neutral by gate, even where a chart would differ", () => {
    // Draco-gated placeholder (F-4): Water vs Grass reads 1 here,
    // NOT a canon matchup claim. The chart lands in this slot.
    const r = worldBattleDamage(WATER_FLAT, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.typeMultiplier).toBe(1);
  });
});
