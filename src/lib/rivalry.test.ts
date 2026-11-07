import { describe, expect, it } from "vitest";
import type { DeedEntry } from "./honor";
import { generateRival, rivalMemory, rivalStanding } from "./rivalry";

const POOL = {
  immunities: ["frost", "venom"],
  hates: ["chrome", "fire"],
  fears: ["frost", "gale"],
};

function entry(id: string, rivalId: string, deed: string, beat: number, witnessedBy: string[] = []): DeedEntry {
  return { id, deed, subject: { individualId: rivalId }, areaId: "route-topaz", beat, witnessedBy };
}

describe("generateRival", () => {
  it("is deterministic for the same seed, faction, area and pool", () => {
    const a = generateRival("seed-1", "syndicate", "route-topaz", POOL);
    const b = generateRival("seed-1", "syndicate", "route-topaz", POOL);
    expect(a).toEqual(b);
  });

  it("only draws traits from the supplied pool", () => {
    const r = generateRival("seed-2", "dojo", "boot-harbor", POOL);
    for (const t of r.traits.immunities) expect(POOL.immunities).toContain(t);
    for (const t of r.traits.hates) expect(POOL.hates).toContain(t);
    for (const t of r.traits.fears) expect(POOL.fears).toContain(t);
    expect(r.levelBand).toBeGreaterThanOrEqual(1);
    expect(r.levelBand).toBeLessThanOrEqual(5);
  });
});

describe("rival memory and standing", () => {
  const ledger: DeedEntry[] = [
    entry("d1", "rival-x", "defeat-rival", 10, ["npc-a"]),
    entry("d2", "rival-x", "spare-rival", 12),
    entry("d3", "rival-y", "defeat-rival", 13, ["npc-a"]),
    entry("d4", "rival-x", "defeat-rival", 20, ["npc-b"]),
  ];

  it("memory is exactly the entries whose subject is the rival", () => {
    expect(rivalMemory(ledger, "rival-x").map((e) => e.id)).toEqual(["d1", "d2", "d4"]);
    expect(rivalMemory(ledger, "rival-none")).toEqual([]);
  });

  it("standing derives counts, witnesses and last beat at read time", () => {
    const s = rivalStanding(ledger, "rival-x");
    expect(s.encounters).toBe(3);
    expect(s.witnessedEncounters).toBe(2);
    expect(s.lastBeat).toBe(20);
    expect(s.deeds).toEqual({ "defeat-rival": 2, "spare-rival": 1 });
  });
});
