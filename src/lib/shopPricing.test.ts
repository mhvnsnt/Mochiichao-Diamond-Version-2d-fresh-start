// P1 consumer tests (full-wiring-staging-sweep lane, 2026-10-29).
//
// These tests exist because the honor package's first completion
// report claimed P1 shop pricing was built when no consumer existed.
// They lock the consumer in three ways: behaviour (prices move the
// way band-effects.json says), restraint (an untouched ledger changes
// nothing), and a source-scan guard that ShopView actually renders
// and charges through the consumer — the exact failure mode that was
// missed last time cannot recur silently.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fencePayout, shopBuyPrice } from "./shopPricing";
import type { DeedEntry } from "./honor";

let seq = 0;
const entry = (deed: string): DeedEntry => ({
  id: `p1-${++seq}`,
  deed,
  subject: {},
  areaId: "area-test",
  beat: 0,
  witnessedBy: [],
});

const CATALOGUE = [250, 150, 500]; // ShopView's Luigi Cube / Mend Patch / Revive Core

describe("shopBuyPrice — the P1 consumer", () => {
  it("empty ledger = catalogue prices, untouched", () => {
    for (const base of CATALOGUE) expect(shopBuyPrice(base, [])).toBe(base);
  });

  it("a good ledger discounts honest-shop prices (decent band: 3 steps x 1%)", () => {
    const ledger = [entry("return-stolen-mochi"), entry("steal-mochi"), entry("donation")]; // morale +3
    expect(shopBuyPrice(250, ledger)).toBe(243); // round(250 * 0.97)
    expect(shopBuyPrice(100, ledger)).toBe(97);
  });

  it("a bad ledger surcharges honest-shop prices (shady band: 8 steps x 1%)", () => {
    const ledger = [entry("steal-mochi"), entry("steal-item")]; // morale -8
    expect(shopBuyPrice(100, ledger)).toBe(108);
    expect(shopBuyPrice(250, ledger)).toBe(270);
  });

  it("the band cap binds at the top (paragon: capped 25%, not 25 steps)", () => {
    const ledger = Array.from({ length: 5 }, () => entry("return-stolen-mochi")); // morale +25
    expect(shopBuyPrice(200, ledger)).toBe(150);
  });
});

describe("fencePayout — the fence half of the shop terms", () => {
  it("good standing does not move a fence payout", () => {
    const ledger = [entry("return-stolen-mochi"), entry("donation")]; // morale +9, good side
    expect(fencePayout(100, ledger)).toBe(100);
  });

  it("bad standing improves a fence payout", () => {
    const ledger = [entry("steal-mochi"), entry("steal-item")]; // morale -8
    expect(fencePayout(100, ledger)).toBe(108);
  });

  it("empty ledger = base value at a fence too", () => {
    expect(fencePayout(500, [])).toBe(500);
  });
});

describe("ShopView wiring guard — the consumer is actually consumed", () => {
  const src = readFileSync(
    new URL("../components/views/ShopView.tsx", import.meta.url),
    "utf8",
  );

  it("ShopView imports the pricing consumer and reads the deed ledger", () => {
    expect(src).toContain("shopBuyPrice");
    expect(src).toContain("deedLedger");
  });

  it("ShopView never charges or gates on a raw catalogue cost in the buy path", () => {
    expect(src).not.toContain("price: buySelected.cost");
    expect(src).not.toContain("wallet < buySelected.cost");
    expect(src).not.toContain("{buySelected.cost} CR");
  });

  it("ShopView surfaces no band name or morale value (presentation restraint)", () => {
    expect(src).not.toMatch(/band\.id|morale|deriveMorale/);
  });
});
