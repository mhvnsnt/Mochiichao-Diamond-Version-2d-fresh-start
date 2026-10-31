// Gap-fill S7 slice 1 tests. All expected numbers are hand-computed from
// the derivation rule in individual.ts (low 24 bits = six 4-bit stats in
// hp/atk/def/spa/spd/spe order; top byte mod 3 = size class
// small/standard/large) — no value here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  backfillIndividuals,
  createIndividual,
  ensureIndividual,
  rollPersonalitySeed,
  varianceFromSeed,
  validatePersonalitySeed,
} from "./individual";
import { createMochii } from "./engine";
import { useGameStore } from "../store/gameStore";

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

describe("individual backfill (S7 slice 2, old saves)", () => {
  // An old-save member: a real instance with the optional field removed,
  // exactly as a pre-slice-1 save file stores it.
  function oldMember(speciesId = "001", level = 5) {
    const m = createMochii(speciesId, level)!;
    delete (m as any).individual;
    return m;
  }

  it("rolls a record for a member that has none, leaving everything else intact", () => {
    const m = oldMember();
    const before = { ...m, stats: { ...m.stats }, moves: [...m.moves], pp: [...m.pp] };
    const filled = ensureIndividual(m);
    expect(filled.individual).toBeDefined();
    expect(filled.individual!.personalitySeed).toBeGreaterThanOrEqual(0);
    expect(filled.individual!.personalitySeed).toBeLessThanOrEqual(4294967295);
    expect(filled.individual!.variance).toEqual(varianceFromSeed(filled.individual!.personalitySeed));
    expect(filled.individual!.deviations).toEqual([]);
    expect(filled.individual!.variance.temperamentRead).toBeNull();
    // Nothing else moved: species, level, hp, stats, moves, pp identical.
    expect(filled.speciesId).toBe(before.speciesId);
    expect(filled.level).toBe(before.level);
    expect(filled.hp).toBe(before.hp);
    expect(filled.maxHp).toBe(before.maxHp);
    expect(filled.stats).toEqual(before.stats);
    expect(filled.moves).toEqual(before.moves);
    expect(filled.pp).toEqual(before.pp);
  });

  it("does not mutate the input member and never re-rolls a present record", () => {
    const m = oldMember();
    ensureIndividual(m);
    expect("individual" in m).toBe(false);
    const kept = createMochii("001", 5)!;
    const seed = kept.individual!.personalitySeed;
    expect(ensureIndividual(kept)).toBe(kept);
    expect(kept.individual!.personalitySeed).toBe(seed);
  });

  it("backfills party and pc arrays, is idempotent, and leaves empty arrays empty", () => {
    const party = [oldMember("001", 5), createMochii("004", 5)!];
    const once = backfillIndividuals(party);
    expect(once[0].individual).toBeDefined();
    const keptSeed = once[1].individual!.personalitySeed;
    const twice = backfillIndividuals(once);
    expect(twice[0].individual!.personalitySeed).toBe(once[0].individual!.personalitySeed);
    expect(twice[1].individual!.personalitySeed).toBe(keptSeed);
    expect(backfillIndividuals([])).toEqual([]);
  });
});

describe("individual backfill through loadState (S7 slice 2, the real funnel)", () => {
  it("loadState backfills party + pc and keeps a present record's seed", () => {
    const oldParty = (() => { const m = createMochii("001", 5)!; delete (m as any).individual; return m; })();
    const kept = createMochii("004", 5)!;
    const keptSeed = kept.individual!.personalitySeed;
    const oldPc = (() => { const m = createMochii("010", 5)!; delete (m as any).individual; return m; })();
    useGameStore.getState().loadState({ party: [oldParty, kept], pc: [oldPc] } as never);
    const s = useGameStore.getState();
    expect(s.party[0].individual).toBeDefined();
    expect(s.party[0].individual!.variance).toEqual(varianceFromSeed(s.party[0].individual!.personalitySeed));
    expect(s.party[1].individual!.personalitySeed).toBe(keptSeed);
    expect(s.pc[0].individual).toBeDefined();
  });

  it("a partial loadState carrying no party/pc does not wipe the current arrays", () => {
    useGameStore.getState().loadState({ party: [createMochii("001", 5)!] } as never);
    const before = useGameStore.getState().party;
    expect(before.length).toBe(1);
    useGameStore.getState().loadState({ wallet: 42 } as never);
    expect(useGameStore.getState().party).toBe(before);
    expect(useGameStore.getState().wallet).toBe(42);
  });
});
