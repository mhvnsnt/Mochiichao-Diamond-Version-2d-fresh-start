// Honor derivation tests (List 28 wiring, P0).
//
// The centrepiece is the no-stored-standing guard at the bottom: the
// List 28 law says the deed ledger is the ONLY stored honor state and
// every standing is derived at read time. The guard inspects the real
// store — both its serialized shape (what a save file would carry)
// and its GameState interface source — and fails if any standing-ish
// field ever appears outside the deedLedger subtree.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  applyBandPrice,
  bandForValue,
  deriveMorale,
  deriveStanding,
  deriveTallies,
  deriveWantedHeat,
  effectiveStanding,
  recordDeed,
  standingContextForArea,
  wantedLevelForHeat,
  DEED_TABLE,
  type DeedEntry,
  type DeedTable,
  type GroupRecord,
} from "./honor";

let seq = 0;
const entry = (deed: string, over: Partial<DeedEntry> = {}): DeedEntry => ({
  id: `t-${++seq}`,
  deed,
  subject: {},
  areaId: "area-test",
  beat: 0,
  witnessedBy: [],
  ...over,
});

const TOWN: GroupRecord = {
  id: "town-test",
  displayName: "Test Town",
  class: "town",
  valence: "normal",
  thresholds: { range2: 3, range3: 8, range4: 15 },
  homeAreaId: "area-test",
};

describe("deriveMorale — conscience counts every deed, seen or unseen", () => {
  it("sums deed values from the table and reads the band", () => {
    const ledger = [
      entry("return-stolen-mochi"), // +8
      entry("steal-mochi"), // -6
      entry("donation"), // +1
    ];
    const read = deriveMorale(ledger);
    expect(read.value).toBe(3);
    expect(read.band.id).toBe("decent");
  });

  it("ignores deeds outside the closed vocabulary", () => {
    const read = deriveMorale([entry("not-a-real-deed"), entry("donation")]);
    expect(read.value).toBe(1);
  });

  it("clamps at the fifty-step spectrum ends", () => {
    const read = deriveMorale(Array.from({ length: 5 }, () => entry("return-stolen-mochi")));
    expect(read.value).toBe(25);
    expect(read.band.id).toBe("paragon");
  });

  it("ramps consecutive cruelty deeds (a spree is not a slip)", () => {
    const read = deriveMorale([entry("steal-mochi"), entry("steal-mochi"), entry("steal-mochi")]);
    expect(read.value).toBe(-24); // -6, -8, -10
    expect(read.band.id).toBe("black-hearted");
  });

  it("resets the streak when another deed intervenes", () => {
    const read = deriveMorale([entry("steal-mochi"), entry("donation"), entry("steal-mochi")]);
    expect(read.value).toBe(-11); // -6 +1 -6
  });

  it("caps per-individual rows (keep-stolen-mochi-per-day at -10 per life)", () => {
    const ledger = Array.from({ length: 12 }, () =>
      entry("keep-stolen-mochi-per-day", { subject: { individualId: "mochi-1" } }),
    );
    expect(deriveMorale(ledger).value).toBe(-10);
  });

  it("applies the daily good cap only when a day length is supplied", () => {
    const ledger = [
      entry("return-stolen-mochi", { beat: 0 }), // +8, capped to +4 on day 0
      entry("donation", { beat: 1 }), // day 0 budget spent -> +0
      entry("donation", { beat: 150 }), // day 1 -> +1
    ];
    const capped = deriveMorale(ledger, DEED_TABLE, { beatsPerDay: 100 });
    expect(capped.goodCapApplied).toBe(true);
    expect(capped.value).toBe(5);

    const uncapped = deriveMorale(ledger);
    expect(uncapped.goodCapApplied).toBe(false);
    expect(uncapped.value).toBe(10); // derivation never guesses a day length
  });

  it("credits sampling rows only every Nth occurrence", () => {
    const table: DeedTable = {
      schema: "test",
      clamp: [-25, 25],
      pacing: { goodDeedDailyCreditCap: 4 },
      deeds: [{ deed: "ambient-courtesy", value: 1, sampling: { every: 3 } }],
    };
    const ledger = [entry("ambient-courtesy"), entry("ambient-courtesy"), entry("ambient-courtesy")];
    expect(deriveMorale(ledger, table).value).toBe(1);
  });
});

describe("deriveTallies — reputation is witnessed facts only", () => {
  it("an unseen deed moves morale and nothing else", () => {
    const ledger = [entry("steal-mochi", { subject: { groupId: TOWN.id } })]; // witnessedBy: []
    expect(deriveMorale(ledger).value).toBe(-6);
    const tallies = deriveTallies(ledger, DEED_TABLE, TOWN);
    expect(tallies.rawInfamy).toBe(0);
    expect(tallies.rawFame).toBe(0);
  });

  it("credits the victim group, and witness groups named in the witness set", () => {
    const byVictimOnly = deriveTallies(
      [entry("steal-mochi", { subject: { groupId: TOWN.id }, witnessedBy: ["npc-9"] })],
      DEED_TABLE,
      TOWN,
    );
    expect(byVictimOnly.rawInfamy).toBe(6); // victim reach only

    const byBoth = deriveTallies(
      [entry("steal-mochi", { subject: { groupId: TOWN.id }, witnessedBy: [TOWN.id] })],
      DEED_TABLE,
      TOWN,
    );
    expect(byBoth.rawInfamy).toBe(12); // victim + witness reach
  });

  it("resolves witness membership through the caller-supplied index", () => {
    const tallies = deriveTallies(
      [entry("steal-mochi", { subject: { groupId: "other-group" }, witnessedBy: ["npc-1"] })],
      DEED_TABLE,
      TOWN,
      undefined,
      { witnessGroupIndex: { [TOWN.id]: ["npc-1"] } },
    );
    expect(tallies.rawInfamy).toBe(6);
  });

  it("fame and infamy never cancel — both piles stand", () => {
    const ledger = [
      // donation credits fame to witness + area reach: 2 per entry
      entry("donation", { witnessedBy: [TOWN.id] }),
      entry("donation", { witnessedBy: [TOWN.id] }),
      entry("donation", { witnessedBy: [TOWN.id] }),
      entry("donation", { witnessedBy: [TOWN.id] }), // fame 8
      entry("steal-mochi", { subject: { groupId: TOWN.id }, witnessedBy: [TOWN.id] }), // infamy 6+6
    ];
    const standing = deriveStanding(ledger, DEED_TABLE, TOWN);
    expect(standing.tallies.fame).toBe(8);
    expect(standing.tallies.infamy).toBe(12);
    expect(standing.mixed).toBe(true);
    expect(standing.label).toBe("Contested"); // grid[2][2] — not "Unmarked"
    expect(standing.ladderCoord).toEqual({ fameBand: 2, infamyBand: 2, cell: 10 });
  });

  it("holds the hated floor: once Hated, never Unmarked again", () => {
    const ledger = [
      entry("steal-mochi", { subject: { groupId: TOWN.id }, witnessedBy: [TOWN.id], beat: 0 }), // 12
      entry("steal-attempt", { subject: { groupId: TOWN.id }, witnessedBy: [TOWN.id], beat: 0 }), // 6 -> raw 18
    ];
    const standing = deriveStanding(ledger, DEED_TABLE, TOWN, undefined, {
      nowBeat: 3000,
      beatsPerWeek: 100, // 30 clean weeks: decay would zero it without the floor
    });
    expect(standing.tallies.hasBeenHated).toBe(true);
    expect(standing.tallies.infamy).toBe(1); // the residue
    expect(standing.label).toBe("Doubted"); // never "Unmarked"
  });

  it("witnessed restitution directly repairs infamy (#275)", () => {
    const ledger = [
      entry("steal-item", { subject: { groupId: TOWN.id }, witnessedBy: [TOWN.id] }), // infamy 2+2
      entry("return-stolen-mochi", { subject: { groupId: TOWN.id }, witnessedBy: ["npc-1"] }), // repair 8 (victim reach)
    ];
    const tallies = deriveTallies(ledger, DEED_TABLE, TOWN);
    expect(tallies.rawInfamy).toBe(4);
    expect(tallies.repair).toBe(8);
    expect(tallies.infamy).toBe(0);
  });
});

describe("effectiveStanding — disguise is a read lens, never a write", () => {
  it("returns the presented standing unless the reader sees through", () => {
    const truth = deriveStanding([], DEED_TABLE, TOWN);
    const presented = { ...truth, label: "Renowned" };
    expect(effectiveStanding(truth, { presentedStanding: presented }).label).toBe("Renowned");
    expect(effectiveStanding(truth, { presentedStanding: presented, readerSeesThrough: true }).label).toBe("Unmarked");
  });
});

describe("deriveWantedHeat — the law reads the witnessed subset only", () => {
  it("sums witnessed bad deeds in the area", () => {
    const ledger = [
      entry("steal-mochi", { witnessedBy: ["npc-1"] }), // 6
      entry("steal-item", { witnessedBy: ["npc-2"] }), // 2
      entry("steal-mochi"), // unwitnessed — never evidence
      entry("steal-mochi", { witnessedBy: ["npc-1"], areaId: "elsewhere" }), // wrong area
      entry("donation", { witnessedBy: ["npc-1"] }), // good deed — no heat
    ];
    const heat = deriveWantedHeat(ledger, DEED_TABLE, "area-test");
    expect(heat).toBe(8);
    expect(wantedLevelForHeat(heat)).toBe("questioned");
    expect(wantedLevelForHeat(0)).toBeNull();
  });
});

describe("standingContextForArea — B1's scorer input shape", () => {
  it("reports the aura always and the population standing only when a wild group exists", () => {
    const ledger = [entry("steal-mochi", { witnessedBy: ["npc-1"] })];
    const noGroup = standingContextForArea(ledger, DEED_TABLE, "area-test", []);
    expect(noGroup.auraBand.id).toBe("shady"); // -6 on the spectrum (Rough is -1..-5)
    expect(noGroup.areaStanding).toBeNull();
    expect(noGroup.wildGroupRulingPending).toBe(true);
    expect(noGroup.witnessedHeat).toBe(6);

    const wild: GroupRecord = {
      id: "wild-test",
      displayName: "Test Wilds",
      class: "wild-area",
      valence: "normal",
      homeAreaId: "area-test",
    };
    const withGroup = standingContextForArea(ledger, DEED_TABLE, "area-test", [wild]);
    expect(withGroup.areaStanding).not.toBeNull();
    expect(withGroup.wildGroupRulingPending).toBe(false);
  });
});

describe("applyBandPrice — the band tables' one arithmetic consumer", () => {
  it("discounts honest prices up the good bands, capped by band", () => {
    expect(applyBandPrice(100, bandForValue(3), "honest")).toBe(97); // decent: 3 steps x 1%
    expect(applyBandPrice(200, bandForValue(25), "honest")).toBe(150); // paragon: capped 25%
  });

  it("surcharges honest prices in the bad bands", () => {
    expect(applyBandPrice(100, bandForValue(-8), "honest")).toBe(108); // shady: 8 steps
  });

  it("fences mirror on the bad side only", () => {
    expect(applyBandPrice(100, bandForValue(-8), "fence")).toBe(108);
    expect(applyBandPrice(100, bandForValue(3), "fence")).toBe(100);
    expect(applyBandPrice(100, bandForValue(0), "honest")).toBe(100);
  });
});

describe("consumer reads — drop theme and greeting register", () => {
  it("favours the drop-table half by band sign (the loot flip)", async () => {
    const { favouredDropHalf } = await import("./honor");
    expect(favouredDropHalf("decent")).toBe("wholesome");
    expect(favouredDropHalf("paragon")).toBe("wholesome");
    expect(favouredDropHalf("shady")).toBe("underworld");
    expect(favouredDropHalf("unmarked")).toBe("neutral");
  });

  it("reads the greeting tier per band", async () => {
    const { greetingTierForBand } = await import("./honor");
    expect(greetingTierForBand("paragon")).toBe("reverent");
    expect(greetingTierForBand("rough")).toBe("wary");
    expect(greetingTierForBand("unmarked")).toBe("neutral");
  });
});

describe("recordDeed — the one write helper", () => {
  it("appends exactly one entry with a generated id", () => {
    const appended: DeedEntry[] = [];
    const store = { deedLedger: appended as readonly DeedEntry[], appendDeed: (e: DeedEntry) => { appended.push(e); } };
    const made = recordDeed(store, {
      deed: "donation",
      subject: {},
      areaId: "area-test",
      beat: 42,
      witnessedBy: [],
    });
    expect(appended).toHaveLength(1);
    expect(made.id).toBe("deed-42-1");
    expect(appended[0]).toBe(made);
  });
});

// ------------------------------------------------------- THE GUARD TEST
//
// Standing is derived, never stored. If anyone ever adds a morale /
// standing / fame / infamy / band / wanted field to the store (or a
// save object) outside the deedLedger subtree, this test fails and
// the landing is a defect — that is List 28 law, enforced here.

const FORBIDDEN_KEY = /^(morale|honou?r|standing|fame|infamy|band|wanted|reputation|tallies)$/i;

function findStoredStanding(value: unknown, path: string, insideLedger: boolean, hits: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((v, i) => findStoredStanding(v, `${path}[${i}]`, insideLedger, hits));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      const childPath = path ? `${path}.${key}` : key;
      const inLedger = insideLedger || key === "deedLedger";
      if (!inLedger && FORBIDDEN_KEY.test(key)) hits.push(childPath);
      findStoredStanding(v, childPath, inLedger, hits);
    }
  }
}

describe("GUARD: no standing value is ever stored outside the ledger", () => {
  it("the detector itself works (planted violations are caught)", () => {
    const planted: string[] = [];
    findStoredStanding({ wallet: 100, morale: 5, nested: { standing: "Good" } }, "", false, planted);
    expect(planted).toEqual(["morale", "nested.standing"]);

    const clean: string[] = [];
    findStoredStanding({ wallet: 100, deedLedger: [{ id: "x", deed: "donation" }] }, "", false, clean);
    expect(clean).toEqual([]);
  });

  it("the serialized game state carries no standing outside deedLedger", async () => {
    const { useGameStore } = await import("../store/gameStore");
    const state = useGameStore.getState() as unknown as Record<string, unknown>;
    // Serialize the way the save system does (functions drop out).
    const serialized = JSON.parse(
      JSON.stringify(state, (_k, v) => (typeof v === "function" ? undefined : v)),
    ) as Record<string, unknown>;
    expect(Array.isArray(serialized.deedLedger)).toBe(true);
    const hits: string[] = [];
    findStoredStanding(serialized, "", false, hits);
    expect(hits).toEqual([]);
  });

  it("the GameState interface declares no standing field outside deedLedger", () => {
    const source = readFileSync(new URL("../store/gameStore.ts", import.meta.url), "utf8");
    const start = source.indexOf("interface GameState");
    expect(start).toBeGreaterThan(-1);
    // The interface ends at the first closing brace in column 0.
    const end = source.indexOf("\n}", start);
    const block = source.slice(start, end);
    const fieldNames = [...block.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\??:/gm)].map((m) => m[1]);
    expect(fieldNames).toContain("deedLedger");
    const violations = fieldNames.filter((f) => FORBIDDEN_KEY.test(f));
    expect(violations).toEqual([]);
  });
});
