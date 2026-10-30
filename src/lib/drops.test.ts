// Stub-kill S-7 receipts: the drop SYSTEM is complete and honor's
// favouredDropHalf has a live consumer; the species table itself is
// honestly empty (content owed, locked here so nobody "fixes" it by
// inventing rows).
import { describe, it, expect } from "vitest";
import { DROP_ROWS, validateDropRows, rollWildHeldItem, resolveBattleEndDrop, type DropRow } from "./drops";
import { favouredDropHalf } from "./honor";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIXTURE: DropRow[] = [
  { speciesId: "001", itemId: "mend_patch", weight: 1, channels: ["defeat", "kept"], theme: "wholesome" },
  { speciesId: "001", itemId: "luigi_cube", weight: 1, channels: ["defeat"], theme: "underworld" },
];

describe("S-7 drop system", () => {
  it("the shipped species table is valid and honestly EMPTY (content owed)", () => {
    expect(validateDropRows(DROP_ROWS)).toEqual([]);
    expect(DROP_ROWS).toHaveLength(0);
    // With no rows, generation honestly yields nothing to carry.
    expect(rollWildHeldItem("001", "paragon", mulberry32(1))).toBeNull();
  });

  it("validation enforces the fragment's rules", () => {
    expect(validateDropRows([{ speciesId: "001", itemId: "nope", weight: 1, channels: ["defeat"] }])[0]).toContain("does not resolve");
    expect(validateDropRows([{ speciesId: "001", itemId: "data_card", weight: 1, channels: ["defeat"] }])[0]).toContain("key-category");
    expect(validateDropRows([{ speciesId: "001", itemId: "mend_patch", weight: 0, channels: ["defeat"] }])[0]).toContain("weight");
    expect(validateDropRows([{ speciesId: "001", itemId: "mend_patch", weight: 1, channels: [] }])[0]).toContain("channel");
  });

  it("honor's loot flip is a live consumer: the favoured half weighs double", () => {
    expect(favouredDropHalf("paragon")).toBe("wholesome");
    expect(favouredDropHalf("black-hearted")).toBe("underworld");
    const carryRate = (band: string, item: string) => {
      const rng = mulberry32(99);
      let n = 0;
      const N = 20000;
      for (let i = 0; i < N; i++) if (rollWildHeldItem("001", band, rng, FIXTURE) === item) n++;
      return n / N;
    };
    // Same rows, same seed: the ONLY difference is the band's
    // favoured half — wholesome carries more under a paragon band,
    // underworld carries more under a black-hearted band.
    expect(carryRate("paragon", "mend_patch")).toBeGreaterThan(carryRate("black-hearted", "mend_patch"));
    expect(carryRate("black-hearted", "luigi_cube")).toBeGreaterThan(carryRate("paragon", "luigi_cube"));
  });

  it("battle-end channels: defeat transfers once; kept and fled transfer nothing", () => {
    expect(resolveBattleEndDrop("mend_patch", "defeat", "001", FIXTURE)).toBe("mend_patch");
    expect(resolveBattleEndDrop("mend_patch", "kept", "001", FIXTURE)).toBeNull();
    expect(resolveBattleEndDrop("mend_patch", "fled", "001", FIXTURE)).toBeNull();
    expect(resolveBattleEndDrop("mend_patch", "wild-fled", "001", FIXTURE)).toBeNull();
    expect(resolveBattleEndDrop(null, "defeat", "001", FIXTURE)).toBeNull();
    // An item with no defeat channel (kept-only) never moves on defeat.
    const keptOnly: DropRow[] = [{ speciesId: "001", itemId: "revive_core", weight: 1, channels: ["kept"] }];
    expect(resolveBattleEndDrop("revive_core", "defeat", "001", keptOnly)).toBeNull();
    // An item the species has no row for never transfers.
    expect(resolveBattleEndDrop("revive_core", "defeat", "001", FIXTURE)).toBeNull();
  });
});
