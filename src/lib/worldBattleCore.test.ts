// Gap-fill S6 receipts: the WorldEngine host's damage core adapts
// flat battle mons + resolved moves into battle-math, with the
// Draco-gated chart slot held neutral (never silently filled).
import { describe, it, expect } from "vitest";
import {
  normaliseBattleElement,
  toBattleMathBattler,
  worldBattleDamage,
  worldBattleHit,
  worldCanActGateLine,
  worldCheckCanAct,
  worldEndTurnTick,
  worldStatusTickLine,
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

describe("worldBattleHit (S6 step 2: accuracy + multi-hit)", () => {
  // BUG-type flat mon via the type fallback (no species row needed):
  // elements ["BUG"], so Swarm Strike gets STAB.
  const BUG_FLAT = { level: 5, atk: 10, def: 10, spd: 10, type: "Bug" };
  const ZERO_STAGES = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };

  it("acc 80 misses on roll 91: no hit, no damage", () => {
    const r = worldBattleHit(WATER_FLAT, GRASS_FLAT,
      { power: 120, type: "Water", moveId: "HYDRO_SURGE" },
      { rng: () => 0.9, forceCrit: false });
    expect(r.hit).toBe(false);
    expect(r.hits).toBe(0);
    expect(r.totalDamage).toBe(0);
    expect(r.damages).toEqual([]);
    expect(r.accuracy).toBe(80);
  });
  it("acc 95 hits on roll 95 exactly: base 4 -> +2 = 6 -> STAB 9 -> roll 92% = 8", () => {
    let calls = 0;
    const seq = [0.94, 0.5];
    const rng = () => seq[calls++] ?? 0.5;
    const r = worldBattleHit(GRASS_FLAT, WATER_FLAT,
      { power: 55, type: "Grass", moveId: "RAZOR_LEAF" },
      { rng, forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.hits).toBe(1);
    expect(r.totalDamage).toBe(8);
    expect(r.damages).toEqual([8]);
  });
  it("evasion stage lowers the threshold: 95 -> floor(95*6/8) = 71, roll 73 misses", () => {
    const evasive = { ...WATER_FLAT, stages: { ...ZERO_STAGES, eva: 1 } };
    const r = worldBattleHit(GRASS_FLAT, evasive,
      { power: 55, type: "Grass", moveId: "RAZOR_LEAF" },
      { rng: () => 0.72, forceCrit: false });
    expect(r.hit).toBe(false);
    expect(r.hits).toBe(0);
  });
  it("multi-hit rolls 3 hits on count roll 50: 3 x (2 -> +2 = 4 -> STAB 6 -> roll 92% = 5) = 15", () => {
    const r = worldBattleHit(BUG_FLAT, WATER_FLAT,
      { power: 25, type: "Bug", moveId: "SWARM_STRIKE" },
      { rng: () => 0.5, forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.isMultiHit).toBe(true);
    expect(r.hits).toBe(3);
    expect(r.damages).toEqual([5, 5, 5]);
    expect(r.totalDamage).toBe(15);
  });
  it("multi-hit move can still miss: acc 95, roll 100 misses", () => {
    const r = worldBattleHit(BUG_FLAT, WATER_FLAT,
      { power: 25, type: "Bug", moveId: "SWARM_STRIKE" },
      { rng: () => 0.99, forceCrit: false });
    expect(r.hit).toBe(false);
    expect(r.isMultiHit).toBe(true);
    expect(r.hits).toBe(0);
    expect(r.totalDamage).toBe(0);
  });
  it("GameData-island move keeps legacy always-hits: acc 100, roll 100 hits, STAB 7 -> roll 85% = 5", () => {
    const r = worldBattleHit(WATER_FLAT, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "NO_SUCH_MOVE" },
      { rng: () => 0.99, forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.hits).toBe(1);
    expect(r.accuracy).toBe(100);
    expect(r.totalDamage).toBe(5);
  });
});

describe("worldBattleHit (S6 step 3: secondary status infliction)", () => {
  // Flat attackers via the type fallback (no species row needed):
  // FIRE / POISON / ELECTRIC elements, so each move below gets STAB.
  const FIRE_FLAT = { level: 5, atk: 10, def: 10, spd: 10, type: "Fire" };
  const POISON_FLAT = { level: 5, atk: 10, def: 10, spd: 10, type: "Poison" };
  const ELECTRIC_FLAT = { level: 5, atk: 10, def: 10, spd: 10, type: "Electric" };
  // Sequence rng: [accuracy roll, damage roll, status roll]. Damage
  // math for the 40-power cases: (4*40*10)/10 = 160 -> /50 = 3 ->
  // +2 = 5 -> STAB 7 -> roll 92% = 6 (same shape as the step-2
  // Leaf Blast note, where 55 power gives base 4 -> 8).
  const seqRng = (seq: number[]) => {
    let i = 0;
    return () => seq[i++] ?? 0.5;
  };

  it("EMBER_TOSS burn applies on status roll 5 (< 10): damage 6, status burn", () => {
    const r = worldBattleHit(FIRE_FLAT, GRASS_FLAT,
      { power: 40, type: "Fire", moveId: "EMBER_TOSS" },
      { rng: seqRng([0.5, 0.5, 0.05]), forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.damages).toEqual([6]);
    expect(r.statusApplied).toBe("burn");
  });
  it("EMBER_TOSS burn fails on status roll 50 (not < 10): damage 6, no status", () => {
    const r = worldBattleHit(FIRE_FLAT, GRASS_FLAT,
      { power: 40, type: "Fire", moveId: "EMBER_TOSS" },
      { rng: seqRng([0.5, 0.5, 0.5]), forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.damages).toEqual([6]);
    expect(r.statusApplied).toBeNull();
  });
  it("an already-statused defender keeps its status: would-apply roll ignored", () => {
    const r = worldBattleHit(FIRE_FLAT, { ...GRASS_FLAT, status: "poison" },
      { power: 40, type: "Fire", moveId: "EMBER_TOSS" },
      { rng: seqRng([0.5, 0.5, 0.05]), forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.damages).toEqual([6]);
    expect(r.statusApplied).toBeNull();
  });
  it("a miss rolls no status: INFERNO_WAVE acc 85, roll 100 misses, status null", () => {
    const r = worldBattleHit(FIRE_FLAT, GRASS_FLAT,
      { power: 110, type: "Fire", moveId: "INFERNO_WAVE" },
      { rng: () => 0.99, forceCrit: false });
    expect(r.hit).toBe(false);
    expect(r.hits).toBe(0);
    expect(r.statusApplied).toBeNull();
  });
  it("POISON_JAB poisons on roll 15 (< 20): base 6 -> +2 = 8 -> STAB 12 -> roll 92% = 11", () => {
    const r = worldBattleHit(POISON_FLAT, GRASS_FLAT,
      { power: 80, type: "Poison", moveId: "POISON_JAB" },
      { rng: seqRng([0.5, 0.5, 0.15]), forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.damages).toEqual([11]);
    expect(r.statusApplied).toBe("poison");
  });
  it("SPARK_SHOT paralyzes on roll 5 (< 10): damage 6, status paralysis", () => {
    const r = worldBattleHit(ELECTRIC_FLAT, GRASS_FLAT,
      { power: 40, type: "Electric", moveId: "SPARK_SHOT" },
      { rng: seqRng([0.5, 0.5, 0.05]), forceCrit: false });
    expect(r.hit).toBe(true);
    expect(r.damages).toEqual([6]);
    expect(r.statusApplied).toBe("paralysis");
  });
  it("a burned Physical attacker halves in the core: TACKLE base 3 -> halved 1 -> +2 = 3 -> STAB 4 -> roll 92% = 3", () => {
    const r = worldBattleDamage({ ...WATER_FLAT, status: "burn" }, GRASS_FLAT,
      { power: 40, type: "Water", moveId: "TACKLE" },
      { rng: ROLL_92, forceCrit: false });
    expect(r.damage).toBe(3);
  });
});

describe("worldCheckCanAct (S6 step 4: paralysis can-act gate)", () => {
  // battle-math's paralysis rule: floor(rng * 4) === 0 stops (25%).
  it("paralyzed, rng 0 -> fully paralyzed: cannot act, reason set, battler unchanged", () => {
    const r = worldCheckCanAct({ ...GRASS_FLAT, status: "paralysis" }, () => 0);
    expect(r.canAct).toBe(false);
    expect(r.reason).toBe("fully-paralyzed");
    expect(r.patch).toEqual({});
    expect(worldCanActGateLine("Sproutle", r.reason)).toBe("Sproutle is paralyzed! It can't move!");
  });
  it("paralyzed, rng 0.5 -> floor 2, acts: no patch", () => {
    const r = worldCheckCanAct({ ...GRASS_FLAT, status: "paralysis" }, () => 0.5);
    expect(r.canAct).toBe(true);
    expect(r.reason).toBeNull();
    expect(r.patch).toEqual({});
  });
  it("burn and poison pass the gate: they act, and the tick is separate", () => {
    expect(worldCheckCanAct({ ...GRASS_FLAT, status: "burn" }, () => 0).canAct).toBe(true);
    expect(worldCheckCanAct({ ...GRASS_FLAT, status: "poison" }, () => 0).canAct).toBe(true);
    expect(worldCheckCanAct({ ...GRASS_FLAT, status: null }, () => 0).canAct).toBe(true);
  });
  it("asleep with 3 turns left counts down: cannot act, patch sleepTurns 2", () => {
    const r = worldCheckCanAct({ ...GRASS_FLAT, status: "sleep", sleepTurns: 3 }, () => 0.5);
    expect(r.canAct).toBe(false);
    expect(r.reason).toBe("asleep");
    expect(r.patch).toEqual({ sleepTurns: 2 });
    expect(worldCanActGateLine("Sproutle", r.reason)).toBe("Sproutle is fast asleep!");
  });
  it("asleep with 1 turn left wakes: acts, patch clears status and sleepTurns", () => {
    const r = worldCheckCanAct({ ...GRASS_FLAT, status: "sleep", sleepTurns: 1 }, () => 0.5);
    expect(r.canAct).toBe(true);
    expect(r.patch).toEqual({ status: null, sleepTurns: 0 });
  });
  it("frozen thaws on rng 0 (floor 0 of 5): acts, patch clears status; rng 0.5 stays frozen", () => {
    const thaw = worldCheckCanAct({ ...GRASS_FLAT, status: "freeze" }, () => 0);
    expect(thaw.canAct).toBe(true);
    expect(thaw.patch).toEqual({ status: null });
    const stuck = worldCheckCanAct({ ...GRASS_FLAT, status: "freeze" }, () => 0.5);
    expect(stuck.canAct).toBe(false);
    expect(stuck.reason).toBe("frozen");
    expect(stuck.patch).toEqual({});
  });
});

describe("worldEndTurnTick", () => {
  it("poison ticks 1/8 max HP: 80 -> 10", () => {
    const r = worldEndTurnTick({ ...GRASS_FLAT, maxHp: 80, status: "poison" });
    expect(r).toEqual({ damage: 10, status: "poison", toxicCounter: null });
  });
  it("burn ticks 1/8 max HP: 80 -> 10, and the min-1 floor holds at 7 -> 1", () => {
    expect(worldEndTurnTick({ ...GRASS_FLAT, maxHp: 80, status: "burn" }).damage).toBe(10);
    expect(worldEndTurnTick({ ...GRASS_FLAT, maxHp: 7, status: "burn" }).damage).toBe(1);
  });
  it("a full instance ticks on its own maxHp: burn at 21 -> 2", () => {
    const r = worldEndTurnTick({ ...WATER_INSTANCE, maxHp: 21, status: "burn" });
    expect(r.damage).toBe(2);
    expect(r.status).toBe("burn");
  });
  it("toxic ticks 1/16 x counter and the counter rises: 80, counter 2 -> 10, next 3", () => {
    const r = worldEndTurnTick({ ...GRASS_FLAT, maxHp: 80, status: "toxic", toxicCounter: 2 });
    expect(r).toEqual({ damage: 10, status: "toxic", toxicCounter: 3 });
  });
  it("paralysis and no status do not tick", () => {
    expect(worldEndTurnTick({ ...GRASS_FLAT, maxHp: 80, status: "paralysis" }).damage).toBe(0);
    expect(worldEndTurnTick({ ...GRASS_FLAT, maxHp: 80, status: null }).damage).toBe(0);
  });
  it("the tick log line matches the resolver's wording", () => {
    expect(worldStatusTickLine("Sproutle", "poison", 10)).toBe("Sproutle took 10 damage from poison!");
    expect(worldStatusTickLine("Sproutle", "burn", 2)).toBe("Sproutle took 2 damage from burn!");
  });
});
