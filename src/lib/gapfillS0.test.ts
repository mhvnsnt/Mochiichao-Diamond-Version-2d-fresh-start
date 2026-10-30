import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { restoreSavesFromIndexedDB } from "./saveSystem";

const root = process.cwd();
const worldEngine = readFileSync(join(root, "src/world/WorldEngine.tsx"), "utf8");
const mainEntry = readFileSync(join(root, "src/main.tsx"), "utf8");

describe("GAP-FILL S0 — capture dex-key fix (G-8)", () => {
  it("no dex write is keyed by a battle-mon instance id", () => {
    // The bug: createMochii assigns id via generateId() (a random
    // instance id), while DexView.statusOf reads dex[speciesId].
    // Either of these patterns reintroduces orphaned dex keys.
    expect(worldEngine).not.toMatch(/setDex\(d => \(\{\.\.\.d, \[caught\.id\]/);
    expect(worldEngine).not.toMatch(/setDex\(d => \(\{\.\.\.d, \[enemyMon\.id\]/);
  });
  it("the catch write and the wild-defeat write are keyed by speciesId", () => {
    expect(worldEngine.includes('[caught.speciesId]: "caught"')).toBe(true);
    expect(worldEngine.includes('[enemyMon.speciesId]: d[enemyMon.speciesId] === "caught" ? "caught" : "seen"')).toBe(true);
  });
});

describe("GAP-FILL S0 — IndexedDB restore call (G-15)", () => {
  it("the boot entry imports and calls the restore for all three slots", () => {
    expect(mainEntry.includes("import { restoreSavesFromIndexedDB } from './lib/saveSystem'")).toBe(true);
    expect(mainEntry.includes("[1, 2, 3].map((slotId) => restoreSavesFromIndexedDB(slotId))")).toBe(true);
  });
  it("restore reports false (never throws) where IndexedDB does not exist", async () => {
    // Node test env has no indexedDB: the function must return false
    // before touching localStorage, not throw.
    await expect(restoreSavesFromIndexedDB(1)).resolves.toBe(false);
  });
});
