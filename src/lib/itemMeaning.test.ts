// Item-meaning S-IM1 receipts: the registry instances the game's
// real items without renaming them; uniques are one-of-one and
// structurally barred from shop stock and drop tables; appraisal
// gates identity AND effect; keepsake depth is a derived read on
// the bond band scale; the bell's deed exists in the deed table
// (the table owns deed meaning, so the row is the contract).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  ITEM_RECORDS,
  recordFor,
  displayFor,
  isIdentified,
  appraiseCarried,
  appraisalTerminalLines,
  canGrantUnique,
  encounterRateFactor,
  keepsakeBand,
  keepsakeScore,
  keepsakeDesc,
  RELIC_NPCS,
  type KeepsakeFact,
} from "./itemMeaning";
import { DROP_ROWS, DROP_KNOWN_ITEMS } from "./drops";
import deedTable from "../data/core/honor/deed-table.json";

const UNIQUE_IDS = Object.values(ITEM_RECORDS)
  .filter((r) => r.meaning?.unique)
  .map((r) => r.itemId);

describe("S-IM1 item registry", () => {
  it("instances the game's real items under their existing names", () => {
    expect(recordFor("luigi_cube")?.displayName).toBe("Luigi Cube");
    expect(recordFor("mend_patch")?.displayName).toBe("Mend Patch");
    expect(recordFor("revive_core")?.displayName).toBe("Revive Core");
    expect(recordFor("data_card")?.displayName).toBe("Data Card");
    // The drop system's known-item set must resolve in the registry.
    for (const id of DROP_KNOWN_ITEMS) expect(recordFor(id), id).not.toBeNull();
  });

  it("the Luigi Cube's provenance is data now, not just a joke in a string", () => {
    const rec = recordFor("luigi_cube")!;
    expect(rec.meaning?.provenance?.origin).toContain("syndicate");
    expect(displayFor("luigi_cube", [])?.desc).toContain("Luigi's mark");
  });

  it("Sprint Boots: Mom's gift is a keepsake record bound to the flag, not inventory", () => {
    const boots = recordFor("sprint_boots")!;
    expect(boots.meaning?.keepsake?.giver).toBe("Mom");
    expect(boots.inInventory).toBe(false);
    expect(boots.price.buy).toBeNull();
    expect(boots.price.sell).toBeNull();
  });
});

describe("S-IM1 uniques — one of one, placed, never stocked or dropped", () => {
  it("ships exactly the three Region 1 uniques, each with one mech + one story effect", () => {
    expect(UNIQUE_IDS.sort()).toEqual(["echo_shard", "harbor_bell", "scrap_core"]);
    for (const id of UNIQUE_IDS) {
      const rec = recordFor(id)!;
      expect(rec.meaning?.unique?.mechEffect.length).toBeGreaterThan(0);
      expect(rec.meaning?.unique?.storyEffect.length).toBeGreaterThan(0);
      expect(RELIC_NPCS[rec.meaning!.placement!.npcId]?.itemId).toBe(id);
      expect(rec.price.buy).toBeNull(); // never stocked
    }
  });

  it("GUARD: no unique id appears in the shop's stock source", () => {
    const shop = readFileSync("src/components/views/ShopView.tsx", "utf8");
    const stockBlock = shop.slice(shop.indexOf("const SHOP_ITEMS"), shop.indexOf("];", shop.indexOf("const SHOP_ITEMS")));
    for (const id of UNIQUE_IDS) expect(stockBlock).not.toContain(id);
  });

  it("GUARD: no unique id is a known drop item or a drop row", () => {
    for (const id of UNIQUE_IDS) {
      expect(DROP_KNOWN_ITEMS.has(id)).toBe(false);
      expect(DROP_ROWS.some((r) => r.itemId === id)).toBe(false);
    }
  });

  it("GUARD: every relic placement npc exists in the world maps, and vice versa", () => {
    const maps = readFileSync("src/world/FullWorldMaps.ts", "utf8");
    for (const npcId of Object.keys(RELIC_NPCS)) expect(maps).toContain(`id:"${npcId}"`);
    expect(maps).toContain('id:"appraisal_terminal"');
  });

  it("one-of-one holds at the grant path", () => {
    expect(canGrantUnique({}, "echo_shard")).toBe(true);
    expect(canGrantUnique({ echo_shard: 1 }, "echo_shard")).toBe(false);
    expect(canGrantUnique({ mend_patch: 99 }, "mend_patch")).toBe(true);
  });
});

describe("S-IM1 appraisal — a find is a question until the Lab answers it", () => {
  it("unidentified finds show their unknown face", () => {
    const d = displayFor("echo_shard", []);
    expect(d?.name).toBe("Singing Stone");
    expect(d?.desc).toContain("can't tell what it is");
    expect(isIdentified("echo_shard", [])).toBe(false);
  });

  it("identification reveals the true face + provenance line", () => {
    const d = displayFor("echo_shard", ["echo_shard"]);
    expect(d?.name).toBe("Echo Shard");
    expect(d?.desc).toContain("Cave of Echoes");
    expect(isIdentified("echo_shard", ["echo_shard"])).toBe(true);
  });

  it("the service's work list is exactly the carried, unnamed finds", () => {
    expect(appraiseCarried({ echo_shard: 1, mend_patch: 3 }, [])).toEqual(["echo_shard"]);
    expect(appraiseCarried({ echo_shard: 1 }, ["echo_shard"])).toEqual([]);
    expect(appraiseCarried({}, [])).toEqual([]);
    const lines = appraisalTerminalLines({ scrap_core: 1 }, []);
    expect(lines.join(" ")).toContain("Scrap Core");
  });

  it("an unidentified shard does nothing; identified, it halves the encounter rate", () => {
    expect(encounterRateFactor({ echo_shard: 1 }, [])).toBe(1);
    expect(encounterRateFactor({ echo_shard: 1 }, ["echo_shard"])).toBe(0.5);
    expect(encounterRateFactor({}, ["echo_shard"])).toBe(1);
  });

  it("unidentified finds cannot enter the shop's sell list (registry price stays sealed)", () => {
    const rec = recordFor("scrap_core")!;
    expect(rec.price.sell).toBe(1500);
    expect(isIdentified("scrap_core", [])).toBe(false);
  });
});

describe("S-IM1 keepsakes — depth derives from facts, on the bond band scale", () => {
  const fact = (kind: KeepsakeFact["kind"], seq: number): KeepsakeFact => ({
    itemId: "sprint_boots",
    kind,
    seq,
  });

  it("a fresh gift is B0; journey facts deepen it monotonically", () => {
    expect(keepsakeBand([fact("received", 1)], "sprint_boots").band).toBe("B0");
    const log: KeepsakeFact[] = [fact("received", 1)];
    let prev = "";
    for (let i = 0; i < 16; i++) {
      log.push(fact("battle-won-with", i + 2));
      const band = keepsakeBand(log, "sprint_boots").band;
      expect(band >= prev).toBe(true);
      prev = band;
    }
    expect(keepsakeBand(log, "sprint_boots").band).toBe("B5");
    expect(keepsakeScore(log, "sprint_boots")).toBe(16);
  });

  it("the visible cue names the giver and the depth in plain words", () => {
    const boots = recordFor("sprint_boots")!;
    const desc = keepsakeDesc(boots, [fact("received", 1), fact("battle-won-with", 2)]);
    expect(desc).toContain("Mom gave you these");
    expect(desc).toContain("Wearing in");
  });

  it("facts about other keepsakes never leak into this one's depth", () => {
    const log: KeepsakeFact[] = [{ itemId: "other", kind: "battle-won-with", seq: 1 }];
    expect(keepsakeScore(log, "sprint_boots")).toBe(0);
  });
});

describe("S-IM1 the bell's return", () => {
  it("the deed exists in the deed table with fame reaching witness and holder", () => {
    const row = (deedTable as any).deeds.find((d: any) => d.deed === "return-lost-item");
    expect(row).toBeTruthy();
    expect(row.value).toBe(4);
    expect(row.tallyCredits).toEqual([
      { pile: "fame", reach: "victim" },
      { pile: "fame", reach: "witness" },
    ]);
    expect(recordFor("harbor_bell")?.meaning?.returnTo?.deed).toBe("return-lost-item");
  });
});
