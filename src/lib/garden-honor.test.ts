import { describe, expect, it } from "vitest";
import {
  appendHonorSource,
  honorAccount,
  honorAccountWith,
  validateHonorSource,
  type HonorSource,
} from "./garden-honor";

function src(id: string, count: number): HonorSource {
  return { id, count };
}

describe("garden-honor (B3 §2.3 one honour account read)", () => {
  it("totals every source, entries in caller order, with the source count", () => {
    const account = honorAccount([src("src-b", 3), src("src-a", 7), src("src-c", 0)]);
    expect(account.total).toBe(10);
    expect(account.sourceCount).toBe(3);
    expect(account.entries).toEqual([
      { sourceId: "src-b", count: 3 },
      { sourceId: "src-a", count: 7 },
      { sourceId: "src-c", count: 0 },
    ]);
  });

  it("an empty source list is an empty account, never a default honour", () => {
    const account = honorAccount([]);
    expect(account.total).toBe(0);
    expect(account.entries).toEqual([]);
    expect(account.sourceCount).toBe(0);
  });

  it("a zero-count source still lists, and changes no total", () => {
    const account = honorAccount([src("src-a", 5), src("src-b", 0)]);
    expect(account.total).toBe(5);
    expect(account.sourceCount).toBe(2);
    expect(account.entries[1]).toEqual({ sourceId: "src-b", count: 0 });
  });

  it("honorAccountWith re-reads the whole account from the full list", () => {
    const before = [src("src-a", 4), src("src-b", 6)];
    const account = honorAccountWith(before, src("src-c", 2));
    expect(account.total).toBe(12);
    expect(account.entries.map((entry) => entry.sourceId)).toEqual([
      "src-a",
      "src-b",
      "src-c",
    ]);
    // The input list is untouched: a later re-read of it gives the old total.
    expect(honorAccount(before).total).toBe(10);
    expect(before).toEqual([src("src-a", 4), src("src-b", 6)]);
  });

  it("source ids are caller vocabulary, not a module-enumerated list", () => {
    // The spec's example source kinds work only because the caller
    // names them; the module itself enumerates no source kind.
    const account = honorAccount([
      src("sport", 2),
      src("dojo", 3),
      src("discovery", 1),
      src("journey-feat", 4),
    ]);
    expect(account.total).toBe(10);
    expect(account.sourceCount).toBe(4);
  });

  it("append is pure and rejects a duplicate id loudly", () => {
    const before = [src("src-a", 1)];
    const after = appendHonorSource(before, src("src-b", 2));
    expect(after).toEqual([src("src-a", 1), src("src-b", 2)]);
    expect(before).toEqual([src("src-a", 1)]);
    expect(() => appendHonorSource(before, src("src-a", 9))).toThrow();
    expect(() => appendHonorSource(after, src("src-b", 0))).toThrow();
  });

  it("honorAccount rejects a duplicate id in its input loudly", () => {
    expect(() => honorAccount([src("src-a", 1), src("src-a", 2)])).toThrow();
  });

  it("fails loudly on malformed sources", () => {
    expect(() => validateHonorSource({ id: "", count: 1 })).toThrow();
    expect(() => validateHonorSource({ id: 7, count: 1 })).toThrow();
    expect(() => validateHonorSource({ id: "src-a" })).toThrow();
    expect(() => validateHonorSource(src("src-a", -1))).toThrow();
    expect(() => validateHonorSource(src("src-a", 1.5))).toThrow();
    expect(() => validateHonorSource(src("src-a", Number.NaN))).toThrow();
    expect(() => validateHonorSource(src("src-a", Number.POSITIVE_INFINITY))).toThrow();
    expect(() => validateHonorSource("src-a")).toThrow();
    expect(() => validateHonorSource(null)).toThrow();
    expect(() => honorAccount("not-an-array" as never)).toThrow();
  });

  it("inputs are never mutated or reordered", () => {
    const sources = [src("src-b", 3), src("src-a", 7)];
    const snapshot = JSON.stringify(sources);
    const account = honorAccount(sources);
    expect(JSON.stringify(sources)).toBe(snapshot);
    expect(account.entries).not.toBe(sources);
    account.entries[0].count = 999;
    expect(honorAccount(sources).total).toBe(10);
  });

  it("the account shape carries no gate, band, or level field", () => {
    const account = honorAccount([src("src-a", 5)]);
    expect(Object.keys(account).sort()).toEqual([
      "entries",
      "sourceCount",
      "total",
    ]);
  });

  it("no spend or deduct operation exists in the module", async () => {
    const fs = await import("node:fs");
    const moduleSource = fs.readFileSync(
      new URL("./garden-honor.ts", import.meta.url),
      "utf-8",
    );
    expect(moduleSource).not.toContain("export function spend");
    expect(moduleSource).not.toContain("export function deduct");
    expect(moduleSource).not.toContain("export const spend");
    expect(moduleSource).not.toContain("export const deduct");
  });

  it("no authored content: no species, place, or name vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const moduleSource = fs.readFileSync(
      new URL("./garden-honor.ts", import.meta.url),
      "utf-8",
    );
    for (const word of ["Sproutle", "Mochii", "Kittember", "Route", "Boot Harbor"]) {
      expect(moduleSource).not.toContain(word);
    }
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) => {
      try {
        return fs.readFileSync(new URL(p, import.meta.url), "utf-8");
      } catch {
        return "";
      }
    };
    expect(read("./garden-wiring.ts")).not.toContain("garden-honor");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-honor",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain("garden-honor");
    expect(read("./garden-register.ts")).not.toContain("garden-honor");
  });
});
