import { describe, expect, it } from "vitest";
import {
  individualBondSummary,
  type IndividualBondSummary,
} from "./garden-individual";
import type { BondLedger } from "./garden-bonds";
import type { DecayProfile, NeglectFact } from "./garden-decay";

function ledger(): BondLedger {
  return [
    { creatureId: "creature-9", keeperId: "keeper-a", value: 20 },
    { creatureId: "creature-9", keeperId: "keeper-b", value: 8 },
    { creatureId: "creature-other", keeperId: "keeper-a", value: 99 },
  ];
}

function profile(): DecayProfile {
  return {
    rates: {
      party: { absence: 2 },
      storage: { absence: 1 },
      garden: { absence: 1 },
    },
    floors: { party: 5, storage: 0, garden: 3 },
  };
}

function facts(
  type: NeglectFact["type"],
  context: NeglectFact["context"],
  units: number,
): NeglectFact {
  return { type, context, units };
}

describe("garden-individual (B3 §2.6 per-creature bond summary)", () => {
  it("lists one creature's keepers in ledger order with accrued and effective", () => {
    const result = individualBondSummary(
      ledger(),
      "creature-9",
      profile(),
      {
        "keeper-a": [facts("absence", "party", 3)],
        "keeper-b": [facts("absence", "storage", 2)],
      },
    );
    // keeper-a: 20 - 2*1*3 = 14, above the party floor 5.
    // keeper-b: 8 - 1*1*2 = 6, above the storage floor 0.
    expect(result.creatureId).toBe("creature-9");
    expect(result.keepers.map((k) => k.keeperId)).toEqual([
      "keeper-a",
      "keeper-b",
    ]);
    expect(result.keepers[0]).toMatchObject({
      accrued: 20,
      totalDecay: 6,
      floorApplied: 5,
      effective: 14,
    });
    expect(result.keepers[1]).toMatchObject({
      accrued: 8,
      totalDecay: 2,
      floorApplied: 0,
      effective: 6,
    });
    expect(result.keepers[0].contributions).toEqual([
      {
        type: "absence",
        context: "party",
        units: 3,
        rate: 2,
        scalar: 1,
        amount: 6,
      },
    ]);
  });

  it("a keeper absent from factsByKeeper has no decay: effective is accrued", () => {
    const result = individualBondSummary(ledger(), "creature-9", profile(), {
      "keeper-a": [facts("absence", "party", 1)],
    });
    const b = result.keepers[1];
    expect(b).toMatchObject({
      accrued: 8,
      totalDecay: 0,
      floorApplied: null,
      effective: 8,
    });
    expect(b.contributions).toEqual([]);
  });

  it("a floor binds a fall from above", () => {
    const result = individualBondSummary(
      [{ creatureId: "c", keeperId: "k", value: 10 }],
      "c",
      profile(),
      { k: [facts("absence", "party", 10)] },
    );
    // 10 - 20 = -10, floored back up to the party floor 5.
    expect(result.keepers[0]).toMatchObject({
      accrued: 10,
      totalDecay: 20,
      floorApplied: 5,
      effective: 5,
    });
  });

  it("accrued at or below the floor decays unclamped, never lifted", () => {
    const result = individualBondSummary(
      [{ creatureId: "c", keeperId: "k", value: 4 }],
      "c",
      profile(),
      { k: [facts("absence", "party", 1)] },
    );
    // 4 is below the party floor 5: 4 - 2 = 2, not lifted to 5.
    expect(result.keepers[0]).toMatchObject({
      accrued: 4,
      totalDecay: 2,
      floorApplied: 5,
      effective: 2,
    });
  });

  it("released facts contribute 0 decay and never set the floor", () => {
    const result = individualBondSummary(
      [{ creatureId: "c", keeperId: "k", value: 12 }],
      "c",
      profile(),
      { k: [facts("absence", "released", 9)] },
    );
    expect(result.keepers[0]).toMatchObject({
      accrued: 12,
      totalDecay: 0,
      floorApplied: null,
      effective: 12,
    });
  });

  it("a creature with no ledger entries reads as an empty keeper list", () => {
    const result = individualBondSummary(ledger(), "creature-none", profile(), {});
    expect(result).toEqual({ creatureId: "creature-none", keepers: [] });
  });

  it("facts for a keeper with no bond entry fail loudly", () => {
    expect(() =>
      individualBondSummary(ledger(), "creature-9", profile(), {
        "keeper-ghost": [facts("absence", "party", 1)],
      }),
    ).toThrow(/no bond entry/);
  });

  it("a malformed factsByKeeper map fails loudly", () => {
    expect(() =>
      individualBondSummary(
        ledger(),
        "creature-9",
        profile(),
        null as unknown as Record<string, readonly NeglectFact[]>,
      ),
    ).toThrow(/must be an object/);
    expect(() =>
      individualBondSummary(ledger(), "creature-9", profile(), {
        "keeper-a": "not-an-array" as unknown as readonly NeglectFact[],
      }),
    ).toThrow(/must be an array/);
  });

  it("a malformed ledger, bad creature id, and bad profile fail loudly", () => {
    expect(() =>
      individualBondSummary(
        [
          { creatureId: "c", keeperId: "k", value: 1 },
          { creatureId: "c", keeperId: "k", value: 2 },
        ],
        "c",
        profile(),
        {},
      ),
    ).toThrow(/duplicate bond pair/);
    expect(() =>
      individualBondSummary(ledger(), "", profile(), {}),
    ).toThrow(/non-empty string/);
    // The decay read validates the profile even with no facts.
    expect(() =>
      individualBondSummary(
        ledger(),
        "creature-9",
        {} as unknown as DecayProfile,
        {},
      ),
    ).toThrow(/rates must be an object/);
  });

  it("a fact needing a missing rate or floor fails loudly through the decay read", () => {
    expect(() =>
      individualBondSummary(
        [{ creatureId: "c", keeperId: "k", value: 10 }],
        "c",
        { rates: { party: {} }, floors: { party: 5 } },
        { k: [facts("absence", "party", 1)] },
      ),
    ).toThrow(/missing or invalid base rate/);
  });

  it("inputs are untouched and outputs are fresh objects", () => {
    const inputLedger = ledger();
    const inputFacts = {
      "keeper-a": [facts("absence", "party", 2)],
    };
    const inputProfile = profile();
    const beforeLedger = JSON.stringify(inputLedger);
    const beforeFacts = JSON.stringify(inputFacts);
    const beforeProfile = JSON.stringify(inputProfile);
    const result = individualBondSummary(
      inputLedger,
      "creature-9",
      inputProfile,
      inputFacts,
    );
    expect(JSON.stringify(inputLedger)).toBe(beforeLedger);
    expect(JSON.stringify(inputFacts)).toBe(beforeFacts);
    expect(JSON.stringify(inputProfile)).toBe(beforeProfile);
    expect(result.keepers[0]).not.toBe(inputLedger[0]);
    expect(result.keepers[0].contributions).not.toBe(inputFacts["keeper-a"]);
    const again = individualBondSummary(
      inputLedger,
      "creature-9",
      inputProfile,
      inputFacts,
    );
    expect(again).toEqual(result);
    expect(again.keepers[0]).not.toBe(result.keepers[0]);
  });

  it("exact result shape: no total-across-keepers field, no band field", () => {
    const result: IndividualBondSummary = individualBondSummary(
      [{ creatureId: "c", keeperId: "k", value: 7 }],
      "c",
      profile(),
      {},
    );
    expect(Object.keys(result).sort()).toEqual(["creatureId", "keepers"]);
    expect(Object.keys(result.keepers[0]).sort()).toEqual([
      "accrued",
      "contributions",
      "effective",
      "floorApplied",
      "keeperId",
      "totalDecay",
    ]);
  });

  it("caller-vocabulary ids work: no keeper or creature kind is enumerated", () => {
    const result = individualBondSummary(
      [{ creatureId: "tok-77", keeperId: "tok-12", value: 3 }],
      "tok-77",
      profile(),
      {},
    );
    expect(result.keepers[0]).toMatchObject({
      keeperId: "tok-12",
      accrued: 3,
      effective: 3,
    });
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) =>
      fs.readFileSync(new URL(p, import.meta.url), "utf-8");
    const hosts = [
      "./garden-wiring.ts",
      "../components/views/GardenView.tsx",
      "./wiring/phase4-garden.ts",
      "./garden-register.ts",
      "./garden-story.ts",
      "./garden-arcs.ts",
      "./garden-migration.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-individual");
    }
    // No cycle: the two reads this module composes do not import it back.
    expect(read("./garden-bonds.ts")).not.toContain("garden-individual");
    expect(read("./garden-decay.ts")).not.toContain("garden-individual");
  });

  it("no-authored-content: the module source names no keeper or creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("./garden-individual.ts", import.meta.url),
      "utf-8",
    );
    for (const token of ["Mochii", "Sproutle", "player", "ranger"]) {
      expect(source.toLowerCase()).not.toContain(token);
    }
  });
});
