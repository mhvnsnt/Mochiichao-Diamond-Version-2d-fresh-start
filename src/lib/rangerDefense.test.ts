/**
 * rangerDefense.test.ts — the Ranger companion defence + health
 * rules, locked as tests (owner ruling 2026-10-29 ~21:21 CDT):
 *  - the pool is real, derived, persistent store state
 *  - DEFEND triggers are data (command × bond × budget), never a wall
 *  - a human body takes the move's real computed damage with NO type
 *    chart, capped per hit (one-shots are story, not arithmetic)
 *  - DOWN is a state with a swap lock and heal paths, never a death
 *  - DISTRACT is harm-free for creatures; only the Ranger can pay
 *  - villain humans: the hostileHuman flag + feeble human-scale hits
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  RANGER_DEFENSE,
  deriveRangerMaxHp,
  freshRangerHealth,
  rangerDown,
  swapLockForRanger,
  applyRangerDamage,
  defendChance,
  rollDefend,
  humanBodyBattler,
  rangerDamageFromHit,
  rangerDamageFromClassicHit,
  distractRoamer,
  isHostileHuman,
  humanStrikeDamage,
  HUMAN_STRIKES,
} from "./rangerDefense";
import { calculateDamage } from "./battle-math";
import { createRoamer, battlerFromMon, REGULAR_ATTACK } from "./creatureMode";
import { useGameStore } from "../store/gameStore";

const seq = (vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};
const mon = (over: any = {}) => ({
  speciesId: "001",
  level: 5,
  hp: 30,
  maxHp: 30,
  currentHp: 30,
  stats: { atk: 12, def: 10, spa: 11, spd: 10, spe: 9 },
  moves: ["AQUA_SHOT"],
  type: "AQUA",
  ...over,
});

describe("the health pool (DORO-DERIVED derivation, recorded)", () => {
  it("derives from the lead creature's level band: 30 + 10/level", () => {
    expect(deriveRangerMaxHp(5)).toBe(80);
    expect(deriveRangerMaxHp(1)).toBe(40);
    expect(freshRangerHealth(5)).toEqual({ hp: 80, maxHp: 80 });
  });
  it("sits above a wild creature's scale of the same band (20 + 2/level)", () => {
    expect(deriveRangerMaxHp(5)).toBeGreaterThan(20 + 2 * 5);
  });
});

describe("DOWN and the swap lock", () => {
  it("0 HP is DOWN, and DOWN locks the swap with a spoken reason", () => {
    expect(rangerDown({ hp: 0, maxHp: 80 })).toBe(true);
    const lock = swapLockForRanger({ hp: 0, maxHp: 80 });
    expect(lock.locked).toBe(true);
    expect(lock.reason).toMatch(/down/i);
    expect(swapLockForRanger({ hp: 1, maxHp: 80 }).locked).toBe(false);
  });
  it("damage applies through the pool and reports the downing hit", () => {
    const out = applyRangerDamage({ hp: 30, maxHp: 80 }, 45);
    expect(out.dealt).toBe(30); // cannot take more than he has
    expect(out.health.hp).toBe(0);
    expect(out.downedNow).toBe(true);
    const again = applyRangerDamage(out.health, 10);
    expect(again.downedNow).toBe(false); // already down is not a new moment
  });
});

describe("DEFEND trigger rules are data (command x bond x budget)", () => {
  const health = { hp: 80, maxHp: 80 };
  const ctx = (over: any = {}) => ({ command: "follow" as const, bondBand: 0, health, defendsSpent: 0, defendsBudget: 1, ...over });
  it("position decides: free > follow > wait", () => {
    expect(defendChance(ctx({ command: "free" }))).toBeGreaterThan(defendChance(ctx({ command: "follow" })));
    expect(defendChance(ctx({ command: "follow" }))).toBeGreaterThan(defendChance(ctx({ command: "wait" })));
  });
  it("bond raises it, band by band", () => {
    expect(defendChance(ctx({ bondBand: 5 }))).toBeCloseTo(defendChance(ctx({ bondBand: 0 })) + 5 * RANGER_DEFENSE.defendPerBondBand);
  });
  it("a down Ranger never defends; a spent budget never defends (not a wall)", () => {
    expect(defendChance(ctx({ health: { hp: 0, maxHp: 80 } }))).toBe(0);
    expect(defendChance(ctx({ defendsSpent: 1, defendsBudget: 1 }))).toBe(0);
    expect(defendChance(ctx({ defendsSpent: 3, defendsBudget: 3 }))).toBe(0);
  });
  it("the roll is the chance, deterministically", () => {
    expect(rollDefend(ctx(), seq([0.1]))).toBe(true); // 0.1 < 0.25 follow base
    expect(rollDefend(ctx(), seq([0.9]))).toBe(false);
    expect(rollDefend(ctx({ command: "wait" }), seq([0.1]))).toBe(false); // 0.1 > 0.05
  });
});

describe("the damage a human body takes — real math, NO type chart, capped", () => {
  const attacker = battlerFromMon(mon({ stats: { atk: 30, def: 10, spa: 30, spd: 10, spe: 9 }, type: "FLAME" }));
  const flameMove = { power: 80, accuracy: 100, category: "Physical" as const, element: "FLAME", priority: 0 };
  it("equals the formula's own output with the type product forced to 1", () => {
    const got = rangerDamageFromHit(attacker, flameMove, 80, seq([0.99, 0.5]));
    const expected = calculateDamage(attacker, humanBodyBattler(attacker.level), flameMove, {
      rng: seq([0.99, 0.5]),
      typeMultipliers: [1],
    }).damage;
    expect(got.rawDamage).toBe(expected);
    expect(got.damage).toBe(expected); // this hit is under the cap
  });
  it("the same hit on a chart-weak creature is BIGGER — the chart bites creatures, not people", () => {
    const got = rangerDamageFromHit(attacker, flameMove, 80, seq([0.99, 0.5]));
    const floraDef = battlerFromMon(mon({ type: "FLORA" }));
    const charted = calculateDamage(attacker, floraDef, flameMove, {
      rng: seq([0.99, 0.5]),
      typeMultipliers: [2], // Flame vs Flora, super effective
    }).damage;
    expect(charted).toBeGreaterThan(got.rawDamage);
  });
  it("the human body carries no element (no STAB artifact, no chart target)", () => {
    expect(humanBodyBattler(5).elements).toEqual([]);
  });
  it("the per-hit cap: a huge hit takes half the bar, never the whole bar", () => {
    const huge = battlerFromMon(mon({ level: 50, stats: { atk: 200, def: 10, spa: 200, spd: 10, spe: 9 } }));
    const got = rangerDamageFromHit(huge, { power: 120, accuracy: 100, category: "Physical" as const, element: "NORMAL", priority: 0 }, 80, seq([0.99, 0.5]));
    expect(got.capped).toBe(true);
    expect(got.damage).toBe(40); // floor(80 * 0.5)
    expect(got.rawDamage).toBeGreaterThan(40);
  });
  it("the classic path redirects its own computed number through the same cap", () => {
    expect(rangerDamageFromClassicHit(17, 80)).toEqual({ rawDamage: 17, damage: 17, capped: false });
    expect(rangerDamageFromClassicHit(300, 80).damage).toBe(40);
  });
});

describe("store integration — the pool persists and heals through real actions", () => {
  beforeEach(() => {
    useGameStore.setState({ rangerHp: 0, rangerMaxHp: 0, party: [], inventory: { mend_patch: 1 } as any });
  });
  it("ensure founds the pool at the lead's band; growth grants only the delta", () => {
    const s = useGameStore.getState();
    s.ensureRangerHealth(5);
    expect(useGameStore.getState().rangerMaxHp).toBe(80);
    expect(useGameStore.getState().rangerHp).toBe(80);
    s.damageRanger(30);
    s.ensureRangerHealth(6); // band rises: +10 max, +10 hp (wounds stay)
    expect(useGameStore.getState().rangerMaxHp).toBe(90);
    expect(useGameStore.getState().rangerHp).toBe(60);
  });
  it("damage -> DOWN -> Mend Patch path (useItem + healRangerBy, the BagView flow)", () => {
    const s = useGameStore.getState();
    s.ensureRangerHealth(5);
    const res = s.damageRanger(999);
    expect(res.downedNow).toBe(true);
    expect(useGameStore.getState().rangerHp).toBe(0);
    expect(s.useItem("mend_patch")).toBe(true);
    s.healRangerBy(50); // Mend Patch's own number (ShopView/BagView)
    expect(useGameStore.getState().rangerHp).toBe(50);
    expect(rangerDown({ hp: useGameStore.getState().rangerHp, maxHp: 80 })).toBe(false);
  });
  it("healParty (the Center/Mom beat) restores the Ranger with the party", () => {
    const s = useGameStore.getState();
    s.ensureRangerHealth(5);
    s.damageRanger(70);
    s.healParty();
    expect(useGameStore.getState().rangerHp).toBe(80);
  });
  it("the pool survives a save round trip (serialize -> loadState)", () => {
    const s = useGameStore.getState();
    s.ensureRangerHealth(5);
    s.damageRanger(25);
    const saved = JSON.parse(JSON.stringify({ rangerHp: useGameStore.getState().rangerHp, rangerMaxHp: useGameStore.getState().rangerMaxHp }));
    useGameStore.setState({ rangerHp: 0, rangerMaxHp: 0 });
    useGameStore.getState().loadState(saved);
    expect(useGameStore.getState().rangerHp).toBe(55);
    expect(useGameStore.getState().rangerMaxHp).toBe(80);
  });
});

describe("DISTRACT — harm-free for creatures, exposure-priced for him", () => {
  const health = { hp: 80, maxHp: 80 };
  it("an aggressive roamer may snap at the Ranger (his HP is the only HP that moves)", () => {
    const r = createRoamer("038", 5, { x: 5, y: 5 }, { temperament: "aggressive" });
    const out = distractRoamer(r, health, seq([0.1, 0.99, 0.5])); // 0.1 < 0.5 exposure
    expect(out.beats).toBe(RANGER_DEFENSE.distractBeats);
    expect(out.exposureHit).toBe(true);
    expect(out.exposureDamage).toBeGreaterThan(0);
  });
  it("a docile roamer just looks at him", () => {
    const r = createRoamer("038", 5, { x: 5, y: 5 }, { temperament: "docile" });
    const out = distractRoamer(r, health, seq([0.99]));
    expect(out.exposureHit).toBe(false);
    expect(out.beats).toBeGreaterThan(0);
  });
  it("a down Ranger distracts nothing", () => {
    const r = createRoamer("038", 5, { x: 5, y: 5 }, { temperament: "aggressive" });
    expect(distractRoamer(r, { hp: 0, maxHp: 80 }, seq([0.1])).beats).toBe(0);
  });
});

describe("villain humans — the owner's exception, flag + feeble numbers", () => {
  // The fixture grunt: a test double, NOT authored story content.
  const grunt = { id: "fixture_grunt", name: "Fixture Grunt", hostileHuman: true, battle: { team: [] } };
  it("the flag is the whole gate: flagged may, unflagged may not", () => {
    expect(isHostileHuman(grunt)).toBe(true);
    expect(isHostileHuman({ id: "mom", name: "Your Mom" })).toBe(false);
    expect(isHostileHuman(null)).toBe(false);
    expect(HUMAN_STRIKES.HUMAN_PUNCH.name).toBe("Punch");
    expect(HUMAN_STRIKES.HUMAN_TACKLE.name).toBe("Tackle");
  });
  it("a human punch is FEEBLE against a creature — a creature's own Strike dwarfs it", () => {
    const target = mon();
    const punch = humanStrikeDamage(5, target, "HUMAN_PUNCH", seq([0.99, 0.5]));
    const creatureAtk = battlerFromMon(mon());
    const creatureHit = calculateDamage(creatureAtk, battlerFromMon(target), REGULAR_ATTACK, { rng: seq([0.99, 0.5]) }).damage;
    expect(punch).toBeGreaterThan(0);
    expect(punch).toBeLessThanOrEqual(6);
    expect(punch).toBeLessThan(creatureHit);
  });
});
