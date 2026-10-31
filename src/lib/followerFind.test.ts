// Gap-fill S8 slice 6 tests. All expected values are hand-computed
// from the rules in followerFind.ts and the teardown citations
// there — no value here comes from running the code first.
// Fixture item ids are test-only strings, never shipped find rows:
// no find table exists on main, and this slice authors none.
import { describe, expect, it } from "vitest";
import {
  applyFindToState,
  eligibleFindRows,
  findHandover,
  readFindState,
  rollFind,
  withFind,
  withPendingHandover,
  type FollowerFindTable,
} from "./followerFind";
import { createMochii } from "./engine";

const WEIGHTED: FollowerFindTable = {
  areaKey: "test-area",
  rows: [
    { itemId: "a", weight: 1 },
    { itemId: "b", weight: 3 },
  ],
};

const RARE_MIX: FollowerFindTable = {
  areaKey: "test-area",
  rows: [{ itemId: "common" }, { itemId: "rare", rare: true }],
};

describe("rollFind (S8 slice 6, weighted pick over mood-eligible rows)", () => {
  it("returns null for no table, empty rows, or rare-only rows at non-high mood", () => {
    expect(rollFind(null, 0)).toBeNull();
    expect(rollFind({ areaKey: "x", rows: [] }, 10)).toBeNull();
    expect(
      rollFind({ areaKey: "x", rows: [{ itemId: "rare", rare: true }] }, 0),
    ).toBeNull();
    expect(
      rollFind({ areaKey: "x", rows: [{ itemId: "rare", rare: true }] }, -50),
    ).toBeNull();
  });

  it("picks by weight with hand-computed draws (total weight 4)", () => {
    // draw = rng * 4: 0 -> 0 < 1 -> a; 0.24 -> 0.96 < 1 -> a;
    // 0.25 -> 1.0, not < 1 -> b; 0.99 -> 3.96 -> b.
    expect(rollFind(WEIGHTED, 0, () => 0)).toEqual({ itemId: "a", rare: false });
    expect(rollFind(WEIGHTED, 0, () => 0.24)).toEqual({ itemId: "a", rare: false });
    expect(rollFind(WEIGHTED, 0, () => 0.25)).toEqual({ itemId: "b", rare: false });
    expect(rollFind(WEIGHTED, 0, () => 0.99)).toEqual({ itemId: "b", rare: false });
  });

  it("treats missing, non-positive, and non-finite weights as 1", () => {
    const table: FollowerFindTable = {
      areaKey: "x",
      rows: [
        { itemId: "a", weight: 0 },
        { itemId: "b", weight: -5 },
        { itemId: "c" },
      ],
    };
    // Total weight 3: draw 0.99 * 3 = 2.97 -> c (cumulative a=1, b=2, c=3).
    expect(rollFind(table, 0, () => 0.99)).toEqual({ itemId: "c", rare: false });
  });
});

describe("eligibleFindRows + rare gating (S8 slice 6, good mood only for rarest)", () => {
  it("excludes rare rows at low and neutral mood, includes them at high mood", () => {
    expect(eligibleFindRows(RARE_MIX, -5).map((r) => r.itemId)).toEqual(["common"]);
    expect(eligibleFindRows(RARE_MIX, 0).map((r) => r.itemId)).toEqual(["common"]);
    expect(eligibleFindRows(RARE_MIX, 5).map((r) => r.itemId)).toEqual([
      "common",
      "rare",
    ]);
    expect(eligibleFindRows(null, 5)).toEqual([]);
  });

  it("rolls only the common row when rare is gated out, even at a high draw", () => {
    // Eligible total is 1 (common only): 0.99 * 1 = 0.99 -> common.
    expect(rollFind(RARE_MIX, 0, () => 0.99)).toEqual({
      itemId: "common",
      rare: false,
    });
    // At high mood both are eligible (total 2): 0.99 * 2 = 1.98 -> rare.
    expect(rollFind(RARE_MIX, 5, () => 0.99)).toEqual({
      itemId: "rare",
      rare: true,
    });
    expect(rollFind(RARE_MIX, 5, () => 0.1)).toEqual({
      itemId: "common",
      rare: false,
    });
  });
});

describe("findHandover (S8 slice 6, mood gates handover)", () => {
  it("withholds at low mood and hands over at neutral and high mood", () => {
    expect(findHandover(-127)).toBe("withheld");
    expect(findHandover(-1)).toBe("withheld");
    expect(findHandover(0)).toBe("handed");
    expect(findHandover(127)).toBe("handed");
    expect(findHandover(null)).toBe("handed");
  });
});

describe("readFindState (S8 slice 6, absent reads empty)", () => {
  it("returns empty for absent records and absent or malformed state", () => {
    expect(readFindState(null)).toEqual({ pendingItemId: null, withheldCount: 0 });
    expect(readFindState(undefined)).toEqual({
      pendingItemId: null,
      withheldCount: 0,
    });
    const noState = createMochii("001", 5)!;
    expect(readFindState(noState.individual)).toEqual({
      pendingItemId: null,
      withheldCount: 0,
    });
    expect(
      readFindState({
        personalitySeed: 1,
        variance: { stats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, sizeClass: "standard", temperamentRead: null },
        deviations: [],
        findState: { pendingItemId: 42 as unknown as string, withheldCount: -3 },
      }),
    ).toEqual({ pendingItemId: null, withheldCount: 0 });
  });

  it("keeps a valid state and truncates a non-integer count", () => {
    expect(
      readFindState({
        personalitySeed: 1,
        variance: { stats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, sizeClass: "standard", temperamentRead: null },
        deviations: [],
        findState: { pendingItemId: "x", withheldCount: 2.7 },
      }),
    ).toEqual({ pendingItemId: "x", withheldCount: 2 });
  });
});

describe("applyFindToState + withFind (S8 slice 6, carried finds)", () => {
  it("handing over empties the state; withholding carries and counts", () => {
    expect(
      applyFindToState(
        { pendingItemId: "old", withheldCount: 2 },
        { itemId: "x", rare: false },
        "handed",
      ),
    ).toEqual({ pendingItemId: null, withheldCount: 0 });
    expect(
      applyFindToState(null, { itemId: "x", rare: false }, "withheld"),
    ).toEqual({ pendingItemId: "x", withheldCount: 1 });
    expect(
      applyFindToState(
        { pendingItemId: "old", withheldCount: 2 },
        { itemId: "x", rare: false },
        "withheld",
      ),
    ).toEqual({ pendingItemId: "x", withheldCount: 3 });
  });

  it("withFind returns the member as-is without a record or on a no-op", () => {
    const bare = createMochii("001", 5)!;
    const { individual: _dropped, ...rest } = bare as typeof bare & {
      individual?: unknown;
    };
    const recordless = rest as typeof bare;
    const find = { itemId: "x", rare: false };
    expect(withFind(recordless, find, "withheld")).toBe(recordless);
    const member = createMochii("001", 5)!;
    // Handed with nothing carried: state already empty -> same object.
    expect(withFind(member, find, "handed")).toBe(member);
  });

  it("withFind carries a withheld find and clears it on a later handover", () => {
    const member = createMochii("001", 5)!;
    const find = { itemId: "x", rare: false };
    const carried = withFind(member, find, "withheld");
    expect(carried).not.toBe(member);
    expect(member.individual!.findState).toBeUndefined();
    expect(carried.individual!.findState).toEqual({
      pendingItemId: "x",
      withheldCount: 1,
    });
    const handed = withFind(carried, find, "handed");
    expect(handed.individual!.findState).toEqual({
      pendingItemId: null,
      withheldCount: 0,
    });
  });
});

describe("withPendingHandover (S8 slice 7, carried find resolved at talk)", () => {
  const carrying = (mood: number, pending: unknown, count: number) => {
    const m = createMochii("001", 5)!;
    m.individual!.mood = mood;
    (m.individual as any).findState = { pendingItemId: pending, withheldCount: count };
    return m;
  };

  it("returns none and the member as-is with no record, no pending item, or malformed pending", () => {
    const bare = createMochii("001", 5)!;
    delete (bare as any).individual;
    expect(withPendingHandover(bare)).toEqual({
      member: bare,
      handover: { outcome: "none", itemId: null },
    });
    const fresh = createMochii("001", 5)!;
    expect(withPendingHandover(fresh).handover).toEqual({ outcome: "none", itemId: null });
    expect(withPendingHandover(fresh).member).toBe(fresh);
    const malformed = carrying(0, 42, 1);
    expect(withPendingHandover(malformed).handover).toEqual({ outcome: "none", itemId: null });
    expect(withPendingHandover(malformed).member).toBe(malformed);
  });

  it("hands over at neutral/high mood, emptying the state without mutating the input", () => {
    const member = carrying(0, "test-pebble", 2);
    const { member: next, handover } = withPendingHandover(member);
    expect(handover).toEqual({ outcome: "handed", itemId: "test-pebble" });
    expect(next).not.toBe(member);
    expect(next.individual!.findState).toEqual({ pendingItemId: null, withheldCount: 0 });
    expect(member.individual!.findState).toEqual({ pendingItemId: "test-pebble", withheldCount: 2 });
    const high = carrying(30, "test-pebble", 0);
    expect(withPendingHandover(high).handover.outcome).toBe("handed");
  });

  it("withholds at low mood, keeping the item and raising the count by one", () => {
    const member = carrying(-10, "test-pebble", 2);
    const { member: next, handover } = withPendingHandover(member);
    expect(handover).toEqual({ outcome: "withheld", itemId: "test-pebble" });
    expect(next).not.toBe(member);
    expect(next.individual!.findState).toEqual({ pendingItemId: "test-pebble", withheldCount: 3 });
    expect(member.individual!.findState).toEqual({ pendingItemId: "test-pebble", withheldCount: 2 });
    expect(next.individual!.mood).toBe(-10);
  });
});
