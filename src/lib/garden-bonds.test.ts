import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  bondForPair,
  bondsForCreature,
  bondsForKeeper,
  creaturesForKeeper,
  keepersForCreature,
  removeBond,
  setBond,
  validateBondLedger,
  type BondLedger,
  type KeeperBond,
} from "./garden-bonds";

const A: KeeperBond = { creatureId: "c1", keeperId: "k1", value: 10 };
const B: KeeperBond = { creatureId: "c1", keeperId: "k2", value: 40 };
const C: KeeperBond = { creatureId: "c2", keeperId: "k1", value: 7 };

describe("garden-bonds (B3 §2.6 / §2.3 per-pair bond ledger)", () => {
  it("setBond appends a new pair", () => {
    expect(setBond([], "c1", "k1", 10)).toEqual([A]);
    expect(setBond([A], "c1", "k2", 40)).toEqual([A, B]);
  });

  it("setBond replaces an existing pair in place, length unchanged", () => {
    const ledger = [A, B, C];
    const next = setBond(ledger, "c1", "k2", 55);
    expect(next).toEqual([A, { ...B, value: 55 }, C]);
    expect(next).toHaveLength(3);
    expect(bondForPair(next, "c1", "k2")).toBe(55);
  });

  it("bondForPair: value, null when absent, and 0 distinct from null", () => {
    const ledger = [A, B];
    expect(bondForPair(ledger, "c1", "k1")).toBe(10);
    expect(bondForPair(ledger, "c2", "k1")).toBeNull();
    const zeroed = setBond(ledger, "c1", "k1", 0);
    expect(bondForPair(zeroed, "c1", "k1")).toBe(0);
    expect(bondForPair(zeroed, "c1", "k1")).not.toBeNull();
  });

  it("pairs are independent: two keepers, one creature, separate values", () => {
    const ledger = setBond(setBond([], "c1", "k1", 10), "c1", "k2", 40);
    expect(bondForPair(ledger, "c1", "k1")).toBe(10);
    expect(bondForPair(ledger, "c1", "k2")).toBe(40);
    // Changing one pair leaves the other untouched.
    const changed = setBond(ledger, "c1", "k1", 11);
    expect(bondForPair(changed, "c1", "k2")).toBe(40);
  });

  it("bondsForCreature / bondsForKeeper return only their entries, in ledger order", () => {
    const ledger = [C, A, B];
    expect(bondsForCreature(ledger, "c1")).toEqual([A, B]);
    expect(bondsForKeeper(ledger, "k1")).toEqual([C, A]);
    expect(bondsForCreature(ledger, "nope")).toEqual([]);
    expect(bondsForKeeper(ledger, "nope")).toEqual([]);
  });

  it("keepersForCreature / creaturesForKeeper list ids in ledger order", () => {
    const ledger = [C, A, B];
    expect(keepersForCreature(ledger, "c1")).toEqual(["k1", "k2"]);
    expect(creaturesForKeeper(ledger, "k1")).toEqual(["c2", "c1"]);
    expect(keepersForCreature(ledger, "nope")).toEqual([]);
  });

  it("removeBond removes the pair; absent pair returns the input by reference", () => {
    const ledger = [A, B, C];
    expect(removeBond(ledger, "c1", "k2")).toEqual([A, C]);
    expect(removeBond(ledger, "c2", "k2")).toBe(ledger);
    expect(removeBond([], "c1", "k1")).toEqual([]);
  });

  it("no band is authored: the caller's number stores unchanged, including the decay direction", () => {
    // §2.7 (corrected doctrine): bond can move negative under neglect,
    // so the ledger must not refuse negative values; and no cap is set
    // here either — bands and caps are a later writer/host decision.
    const ledger = setBond(setBond([], "c1", "k1", -12), "c1", "k2", 250);
    expect(bondForPair(ledger, "c1", "k1")).toBe(-12);
    expect(bondForPair(ledger, "c1", "k2")).toBe(250);
  });

  it("purity: inputs are never mutated; set returns a fresh array", () => {
    const ledger = [A, B];
    const before = JSON.stringify(ledger);
    const next = setBond(ledger, "c1", "k1", 99);
    expect(next).not.toBe(ledger);
    expect(JSON.stringify(ledger)).toBe(before);
    const removed = removeBond(ledger, "c1", "k1");
    expect(JSON.stringify(ledger)).toBe(before);
    expect(removed).toEqual([B]);
    bondsForCreature(ledger, "c1");
    bondsForKeeper(ledger, "k1");
    expect(JSON.stringify(ledger)).toBe(before);
  });

  it("loud failures: bad ids, non-finite value, malformed entry, duplicate pair", () => {
    expect(() => setBond([], "", "k1", 1)).toThrow();
    expect(() => setBond([], "c1", "", 1)).toThrow();
    expect(() => setBond([], "c1", "k1", Number.NaN)).toThrow();
    expect(() => setBond([], "c1", "k1", Number.POSITIVE_INFINITY)).toThrow();
    expect(() => bondForPair([], "", "k1")).toThrow();
    expect(() => removeBond([], "c1", "")).toThrow();
    const badEntry = { creatureId: "c1", keeperId: "k1" } as unknown as KeeperBond;
    expect(() => validateBondLedger([badEntry])).toThrow();
    const dup: BondLedger = [A, { ...A, value: 20 }];
    expect(() => validateBondLedger(dup)).toThrow();
    expect(() => setBond(dup, "c1", "k1", 5)).toThrow();
    expect(() => bondForPair(dup, "c1", "k1")).toThrow();
  });

  it("staging locks: no live module imports the bonds module yet", () => {
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
    expect(wiring).not.toContain("garden-bonds");
    expect(view).not.toContain("garden-bonds");
    expect(phase4).not.toContain("garden-bonds");
    expect(register).not.toContain("garden-bonds");
  });
});
