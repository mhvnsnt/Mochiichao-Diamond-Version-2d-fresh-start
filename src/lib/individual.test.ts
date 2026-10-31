// Gap-fill S7 slice 1 tests. All expected numbers are hand-computed from
// the derivation rule in individual.ts (low 24 bits = six 4-bit stats in
// hp/atk/def/spa/spd/spe order; top byte mod 3 = size class
// small/standard/large) — no value here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  createIndividual,
  rollPersonalitySeed,
  varianceFromSeed,
  validatePersonalitySeed,
} from "./individual";
import { createMochii } from "./engine";

describe("individual record (S7 slice 1, #80 shape)", () => {
  it("derives variance from seed 0x12345678 by hand", () => {
    // 0x12345678: nibbles low->high 8,7,6,5,4,3; top byte 0x12 = 18, 18 % 3 = 0 -> small.
    expect(varianceFromSeed(0x12345678)).toEqual({
      stats: { hp: 8, atk: 7, def: 6, spa: 5, spd: 4, spe: 3 },
      sizeClass: "small",
      temperamentRead: null,
    });
  });

  it("derives size classes standard and large from the top byte", () => {
    // Top byte 19 -> 19 % 3 = 1 -> standard; top byte 20 -> 2 -> large.
    expect(varianceFromSeed(19 * 16777216).sizeClass).toBe("standard");
    expect(varianceFromSeed(20 * 16777216).sizeClass).toBe("large");
    expect(varianceFromSeed(0).stats).toEqual({
      hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0,
    });
    expect(varianceFromSeed(4294967295).stats).toEqual({
      hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15,
    });
  });

  it("is deterministic for a seed and stays in schema ranges", () => {
    const a = varianceFromSeed(987654321);
    const b = varianceFromSeed(987654321);
    expect(a).toEqual(b);
    for (const v of Object.values(a.stats)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(15);
    }
  });

  it("rejects seeds outside the schema uint32 range", () => {
    expect(() => validatePersonalitySeed(-1)).toThrow(RangeError);
    expect(() => validatePersonalitySeed(4294967296)).toThrow(RangeError);
    expect(() => validatePersonalitySeed(1.5)).toThrow(RangeError);
    expect(() => validatePersonalitySeed(0)).not.toThrow();
    expect(() => validatePersonalitySeed(4294967295)).not.toThrow();
    expect(() => createIndividual(-1)).toThrow(RangeError);
  });

  it("rolls a seed through the injected rng", () => {
    expect(rollPersonalitySeed(() => 0)).toBe(0);
    // floor(0.5 * 4294967296) = 2147483648.
    expect(rollPersonalitySeed(() => 0.5)).toBe(2147483648);
  });

  it("createIndividual carries the seed, derived variance, no deviations", () => {
    const rec = createIndividual(0x12345678);
    expect(rec.personalitySeed).toBe(0x12345678);
    expect(rec.variance.stats).toEqual({
      hp: 8, atk: 7, def: 6, spa: 5, spd: 4, spe: 3,
    });
    expect(rec.variance.sizeClass).toBe("small");
    expect(rec.variance.temperamentRead).toBeNull();
    expect(rec.deviations).toEqual([]);
  });

  it("createMochii attaches a fresh individual record at creation", () => {
    const m = createMochii("001", 5)!;
    expect(m.individual).toBeDefined();
    expect(m.individual!.personalitySeed).toBeGreaterThanOrEqual(0);
    expect(m.individual!.personalitySeed).toBeLessThanOrEqual(4294967295);
    expect(m.individual!.deviations).toEqual([]);
    // Two creations roll independently (records differ as objects; seeds
    // may in principle collide, so only the shape + presence is asserted
    // for the second one).
    const m2 = createMochii("001", 5)!;
    expect(m2.individual).toBeDefined();
    expect(m2.individual!.variance.stats.hp).toBeGreaterThanOrEqual(0);
  });

  it("an instance without the field is still a valid old-save shape", () => {
    // Optional field: deleting it must typecheck and leave the rest intact.
    const m = createMochii("001", 5)!;
    const { individual: _dropped, ...rest } = m;
    expect(rest.speciesId).toBe("001");
    expect(rest.level).toBe(5);
    expect("individual" in rest).toBe(false);
  });
});
