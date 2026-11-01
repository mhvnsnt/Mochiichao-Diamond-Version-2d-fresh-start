import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  bondAfterCare,
  decayBreakdown,
  effectiveBond,
  type DecayProfile,
  type NeglectFact,
} from "./garden-decay";
import { bondForPair, setBond } from "./garden-bonds";

const PROFILE: DecayProfile = {
  rates: {
    party: { absence: 3, "care-starvation": 2, "harsh-use": 5, misplacement: 4 },
    storage: { absence: 1, "care-starvation": 1, "harsh-use": 5, misplacement: 1 },
    daycare: { absence: 2, "care-starvation": 2, "harsh-use": 5, misplacement: 3 },
    garden: { absence: 1, "care-starvation": 2, "harsh-use": 5, misplacement: 2 },
  },
  floors: { storage: 10, party: -20, daycare: 0, garden: 5 },
};

describe("garden-decay (B3 §2.7 / BOND-DECAY-SPEC factored decay read)", () => {
  it("party absence drip: rate x units, no scalar supplied", () => {
    const fact: NeglectFact = { type: "absence", context: "party", units: 3 };
    expect(effectiveBond(50, [fact], PROFILE)).toBe(41);
    expect(decayBreakdown(50, [fact], PROFILE).totalDecay).toBe(9);
  });

  it("the light/heavy ratio is the caller's rates, not the module's", () => {
    const party: NeglectFact = { type: "absence", context: "party", units: 2 };
    const storage: NeglectFact = { type: "absence", context: "storage", units: 2 };
    expect(effectiveBond(50, [party], PROFILE)).toBe(44);
    expect(effectiveBond(50, [storage], PROFILE)).toBe(48);
  });

  it("personality scalar multiplies the base rate; omitted scalar is 1", () => {
    const fact: NeglectFact = { type: "absence", context: "party", units: 2 };
    const scaled: DecayProfile = {
      ...PROFILE,
      scalars: { absence: 2 },
    };
    expect(effectiveBond(50, [fact], scaled)).toBe(38);
    expect(effectiveBond(50, [fact], PROFILE)).toBe(44);
  });

  it("harsh use reads units as event counts", () => {
    const facts: NeglectFact[] = [
      { type: "harsh-use", context: "party", units: 2 },
    ];
    expect(effectiveBond(50, facts, PROFILE)).toBe(40);
  });

  it("released facts decay nothing and never set the floor", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "released", units: 100 },
    ];
    const breakdown = decayBreakdown(50, facts, PROFILE);
    expect(breakdown.totalDecay).toBe(0);
    expect(breakdown.floorApplied).toBeNull();
    expect(breakdown.effective).toBe(50);
    expect(breakdown.contributions).toEqual([
      {
        type: "absence",
        context: "released",
        units: 100,
        rate: 0,
        scalar: 1,
        amount: 0,
      },
    ]);
  });

  it("fall above the floor stands: accrued 50, decay 40, fallen 10 above party floor -20", () => {
    // Fallen 50 - 40 = 10, above the party floor -20, so 10 stands.
    const facts: NeglectFact[] = [
      { type: "absence", context: "party", units: 10 },
      { type: "care-starvation", context: "party", units: 5 },
    ];
    expect(decayBreakdown(50, facts, PROFILE).totalDecay).toBe(40);
    expect(effectiveBond(50, facts, PROFILE)).toBe(10);
  });

  it("floor binds below: decay past the floor stops at the floor", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "storage", units: 100 },
    ];
    // 50 - 100 = -50, storage floor 10 binds.
    expect(effectiveBond(50, facts, PROFILE)).toBe(10);
  });

  it("a floor never raises a value", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "storage", units: 1 },
    ];
    // Accrued 5, decay 1 -> 4, even though the storage floor is 10.
    expect(effectiveBond(5, facts, PROFILE)).toBe(4);
  });

  it("no non-released facts: effective is exactly accrued, floor or not", () => {
    expect(effectiveBond(5, [], PROFILE)).toBe(5);
    expect(decayBreakdown(5, [], PROFILE).floorApplied).toBeNull();
  });

  it("mixed contexts: the lowest supplied floor binds", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "garden", units: 1 },
      { type: "absence", context: "party", units: 100 },
    ];
    // Decay 1 + 300 = 301; fallen -251; lowest floor is party -20.
    const breakdown = decayBreakdown(50, facts, PROFILE);
    expect(breakdown.floorApplied).toBe(-20);
    expect(breakdown.effective).toBe(-20);
  });

  it("breakdown sums contributions in fact order and leaves inputs untouched", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "party", units: 2 },
      { type: "harsh-use", context: "party", units: 1 },
    ];
    const frozen = facts.map((f) => ({ ...f }));
    const breakdown = decayBreakdown(50, facts, PROFILE);
    expect(breakdown.contributions.map((c) => c.amount)).toEqual([6, 5]);
    expect(breakdown.totalDecay).toBe(11);
    expect(breakdown.effective).toBe(39);
    expect(facts).toEqual(frozen);
  });

  it("negative accrued decays further, floor still binds", () => {
    const facts: NeglectFact[] = [
      { type: "absence", context: "party", units: 1 },
    ];
    expect(effectiveBond(-5, facts, PROFILE)).toBe(-8);
  });

  it("the per-pair ledger value feeds the decay read (accrued side composes)", () => {
    const ledger = setBond([], "c1", "k1", 60);
    const accrued = bondForPair(ledger, "c1", "k1");
    expect(accrued).toBe(60);
    const facts: NeglectFact[] = [
      { type: "absence", context: "party", units: 2 },
    ];
    expect(effectiveBond(accrued as number, facts, PROFILE)).toBe(54);
  });

  it("bondAfterCare climbs from effective, scaled by forgiveness", () => {
    expect(bondAfterCare(10, 5)).toBe(15);
    expect(bondAfterCare(10, 5, 2)).toBe(20);
    expect(bondAfterCare(10, 0, 0)).toBe(10);
  });

  it("loud failures: bad numbers, bad facts, missing rate or floor", () => {
    const fact: NeglectFact = { type: "absence", context: "party", units: 1 };
    expect(() => effectiveBond(Number.NaN, [fact], PROFILE)).toThrow();
    expect(() =>
      effectiveBond(50, [{ ...fact, units: -1 }], PROFILE),
    ).toThrow();
    expect(() =>
      effectiveBond(50, [{ ...fact, type: "unknown" } as unknown as NeglectFact], PROFILE),
    ).toThrow();
    expect(() =>
      effectiveBond(50, [{ ...fact, context: "wild" } as unknown as NeglectFact], PROFILE),
    ).toThrow();
    const noRate: DecayProfile = {
      rates: { party: { absence: 3 } },
      floors: { party: -20 },
    };
    expect(() =>
      effectiveBond(50, [{ type: "harsh-use", context: "party", units: 1 }], noRate),
    ).toThrow();
    const noFloor: DecayProfile = {
      rates: { party: { absence: 3 } },
      floors: {},
    };
    expect(() => effectiveBond(50, [fact], noFloor)).toThrow();
    const badScalar: DecayProfile = {
      ...PROFILE,
      scalars: { absence: -1 },
    };
    expect(() => effectiveBond(50, [fact], badScalar)).toThrow();
    expect(() => bondAfterCare(10, -1)).toThrow();
    expect(() => bondAfterCare(10, 5, -1)).toThrow();
    expect(() => bondAfterCare(Number.POSITIVE_INFINITY, 5)).toThrow();
  });

  it("no trait names are encoded: scalars are numbers, never archetypes", () => {
    const moduleText = readFileSync(
      new URL("./garden-decay.ts", import.meta.url),
      "utf8",
    );
    // The header may discuss the placeholder archetypes as excluded;
    // the code itself must carry no archetype-keyed table.
    expect(moduleText).not.toMatch(/Sassy-pattern|Lonely-pattern|Calm-pattern/);
    expect(moduleText).not.toContain("Brave-pattern");
  });

  it("staging locks: no live module imports the decay module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    const register = readFileSync(new URL("./garden-register.ts", import.meta.url), "utf8");
    const bonds = readFileSync(new URL("./garden-bonds.ts", import.meta.url), "utf8");
    expect(wiring).not.toContain("garden-decay");
    expect(view).not.toContain("garden-decay");
    expect(phase4).not.toContain("garden-decay");
    expect(register).not.toContain("garden-decay");
    expect(bonds).not.toContain("garden-decay");
  });
});
