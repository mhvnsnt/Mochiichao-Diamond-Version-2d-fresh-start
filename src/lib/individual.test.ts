// Gap-fill S7 slice 1 tests. All expected numbers are hand-computed from
// the derivation rule in individual.ts (low 24 bits = six 4-bit stats in
// hp/atk/def/spa/spd/spe order; top byte mod 3 = size class
// small/standard/large) — no value here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  MOOD_EVENT_DELTAS,
  applyMoodDelta,
  applyMoodEvent,
  backfillIndividuals,
  driftLeadMood,
  followerLeadId,
  resetLeadMoodOnChange,
  clampMood,
  createIndividual,
  driftMood,
  ensureIndividual,
  readMood,
  rollPersonalitySeed,
  varianceFromSeed,
  validatePersonalitySeed,
  withMoodEvent,
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

describe("follower mood (S8 slice 1, HGSS-pattern state machine)", () => {
  // All expected numbers are hand-computed from the rules in
  // individual.ts (range -127..127; drift one step toward neutral;
  // deltas clamped) — no value here comes from running the code first.
  it("clamps to -127..127, truncates, and reads non-finite as neutral", () => {
    expect(clampMood(127)).toBe(127);
    expect(clampMood(-127)).toBe(-127);
    expect(clampMood(128)).toBe(127);
    expect(clampMood(-128)).toBe(-127);
    expect(clampMood(5.9)).toBe(5);
    expect(clampMood(-5.9)).toBe(-5);
    expect(clampMood(NaN)).toBe(0);
    expect(clampMood(Infinity)).toBe(0);
  });

  it("reads an absent or non-integer mood as neutral, clamps a stored one", () => {
    expect(readMood(undefined)).toBe(0);
    expect(readMood(null)).toBe(0);
    expect(readMood({ personalitySeed: 1, variance: varianceFromSeed(1), deviations: [] })).toBe(0);
    expect(readMood({ personalitySeed: 1, variance: varianceFromSeed(1), deviations: [], mood: 42 })).toBe(42);
    expect(readMood({ personalitySeed: 1, variance: varianceFromSeed(1), deviations: [], mood: 200 })).toBe(127);
    expect(readMood({ personalitySeed: 1, variance: varianceFromSeed(1), deviations: [], mood: "x" } as never)).toBe(0);
  });

  it("drifts one step toward neutral per tick, never past it", () => {
    expect(driftMood(5)).toBe(4);
    expect(driftMood(1)).toBe(0);
    expect(driftMood(0)).toBe(0);
    expect(driftMood(-1)).toBe(0);
    expect(driftMood(-5)).toBe(-4);
    expect(driftMood(127)).toBe(126);
    expect(driftMood(-127)).toBe(-126);
    expect(driftMood(undefined)).toBe(0);
    expect(driftMood(null)).toBe(0);
  });

  it("applies deltas clamped, and ignores a non-finite delta", () => {
    expect(applyMoodDelta(0, 10)).toBe(10);
    expect(applyMoodDelta(120, 10)).toBe(127);
    expect(applyMoodDelta(-120, -10)).toBe(-127);
    expect(applyMoodDelta(undefined, 5)).toBe(5);
    expect(applyMoodDelta(10, -3)).toBe(7);
    expect(applyMoodDelta(5, NaN)).toBe(5);
  });

  it("createIndividual seeds mood 0, and a new creature carries it", () => {
    expect(createIndividual(0x12345678).mood).toBe(0);
    const m = createMochii("001", 5)!;
    expect(m.individual!.mood).toBe(0);
  });

  it("a present record keeps its mood through ensureIndividual; a moodless record reads neutral", () => {
    const kept = createMochii("001", 5)!;
    kept.individual!.mood = 42;
    expect(ensureIndividual(kept)).toBe(kept);
    expect(kept.individual!.mood).toBe(42);
    const old = createMochii("004", 5)!;
    delete (old.individual as any).mood;
    expect(ensureIndividual(old)).toBe(old);
    expect(readMood(old.individual)).toBe(0);
    // A backfilled old member (no record at all) gets a fresh record at mood 0.
    const member = createMochii("010", 5)!;
    delete (member as any).individual;
    expect(ensureIndividual(member).individual!.mood).toBe(0);
  });
});

describe("follower mood host behaviours (S8 slice 2, lead + tick)", () => {
  // Party members are real createMochii instances; fainting is set by
  // hand (hp + currentHp to 0), because no live path faints a member
  // outside a battle. Expected numbers are hand-computed from the
  // rules in individual.ts — no value here comes from running the code.
  const faint = (m: any) => { m.hp = 0; m.currentHp = 0; return m; };
  const moodOf = (m: any) => m.individual.mood;

  it("picks the first living member, else the first, else null", () => {
    const a = createMochii("001", 5)!;
    const b = createMochii("004", 5)!;
    const c = createMochii("010", 5)!;
    expect(followerLeadId([a, b, c])).toBe(a.id);
    faint(a);
    expect(followerLeadId([a, b, c])).toBe(b.id);
    faint(b); faint(c);
    expect(followerLeadId([a, b, c])).toBe(a.id);
    expect(followerLeadId([])).toBeNull();
  });

  it("drifts ONLY the lead, one step toward neutral, and no-ops as-is", () => {
    const lead = createMochii("001", 5)!;
    const second = createMochii("004", 5)!;
    lead.individual!.mood = 5;
    second.individual!.mood = -20;
    const party = [lead, second];
    const ticked = driftLeadMood(party);
    expect(ticked).not.toBe(party);
    expect(moodOf(ticked[0])).toBe(4);
    expect(moodOf(ticked[1])).toBe(-20);
    // Negative lead drifts upward; a neutral lead returns the same array.
    lead.individual!.mood = -3;
    expect(moodOf(driftLeadMood([lead, second])[0])).toBe(-2);
    lead.individual!.mood = 0;
    expect(driftLeadMood(party)).toBe(party);
    // A lead with no record gains none from a tick.
    const bare = createMochii("010", 5)!;
    delete (bare as any).individual;
    expect(driftLeadMood([bare])).toEqual([bare]);
  });

  it("resets the INCOMING lead on change, and only on a real change", () => {
    const a = createMochii("001", 5)!;
    const b = createMochii("004", 5)!;
    a.individual!.mood = 10;
    b.individual!.mood = 42;
    const party = [a, b];
    // First observation: no reset, whatever the lead is.
    expect(resetLeadMoodOnChange(party, null)).toBe(party);
    expect(resetLeadMoodOnChange(party, undefined)).toBe(party);
    // Same lead: no reset.
    expect(resetLeadMoodOnChange(party, a.id)).toBe(party);
    // Lead changes to b (a fainted): b resets, a untouched.
    faint(a);
    const reset = resetLeadMoodOnChange(party, a.id);
    expect(resetLeadMoodOnChange(party, a.id)).not.toBe(party);
    expect(moodOf(reset[1])).toBe(0);
    expect(moodOf(reset[0])).toBe(10);
    expect(party[1].individual!.mood).toBe(42);
    // Incoming lead already neutral: no-op as-is.
    b.individual!.mood = 0;
    expect(resetLeadMoodOnChange(party, a.id)).toBe(party);
  });

  it("drives the real store actions without touching other members", () => {
    const a = createMochii("001", 5)!;
    const b = createMochii("004", 5)!;
    a.individual!.mood = 7;
    b.individual!.mood = -9;
    const store = useGameStore.getState();
    store.loadState({ party: [a, b] } as never);
    useGameStore.getState().driftFollowerMood();
    let s = useGameStore.getState();
    expect(s.party[0].individual!.mood).toBe(6);
    expect(s.party[1].individual!.mood).toBe(-9);
    // Lead change to b resets b only; the store's own lead id is the
    // previous frame's lead, so the action takes it explicitly. The
    // faint goes through updatePartyMember, never a direct mutation.
    const fainted = { ...s.party[0], hp: 0, currentHp: 0 } as never;
    useGameStore.getState().updatePartyMember(0, fainted);
    useGameStore.getState().resetFollowerMoodOnLeadChange(a.id);
    s = useGameStore.getState();
    expect(s.party[1].individual!.mood).toBe(0);
    expect(s.party[0].individual!.mood).toBe(6);
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

describe("mood event economy (S8 slice 3, TEARDOWN-HGSS §1 deltas)", () => {
  it("carries the teardown's exact event deltas", () => {
    expect(MOOD_EVENT_DELTAS).toEqual({
      "level-up": 40,
      "battle-item": 10,
      vitamin: 8,
      "poison-recovery-1hp": -50,
    });
  });

  it("applies each event delta, clamped at the range ends", () => {
    expect(applyMoodEvent(0, "level-up")).toBe(40);
    expect(applyMoodEvent(100, "level-up")).toBe(127);
    expect(applyMoodEvent(-90, "level-up")).toBe(-50);
    expect(applyMoodEvent(0, "battle-item")).toBe(10);
    expect(applyMoodEvent(0, "vitamin")).toBe(8);
    expect(applyMoodEvent(0, "poison-recovery-1hp")).toBe(-50);
    expect(applyMoodEvent(-100, "poison-recovery-1hp")).toBe(-127);
    expect(applyMoodEvent(undefined, "level-up")).toBe(40);
    expect(() => applyMoodEvent(0, "bitter-medicine" as never)).toThrow(RangeError);
  });

  it("withMoodEvent is non-mutating, and a no-op where there is no seat or no movement", () => {
    const m = createMochii("001", 5)!;
    m.individual!.mood = 10;
    const levelled = withMoodEvent(m, "level-up");
    expect(levelled).not.toBe(m);
    expect(levelled.individual!.mood).toBe(50);
    expect(m.individual!.mood).toBe(10);
    // No individual record: same object back.
    const bare = createMochii("001", 5)!;
    delete (bare as any).individual;
    expect(withMoodEvent(bare, "level-up")).toBe(bare);
    // Already at the clamp: same object back (host can skip the set).
    const capped = createMochii("001", 5)!;
    capped.individual!.mood = 127;
    expect(withMoodEvent(capped, "level-up")).toBe(capped);
  });
});
