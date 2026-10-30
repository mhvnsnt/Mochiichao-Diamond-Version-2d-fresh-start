// Stub-kill S-4 + S-5 receipts: the two corpses stay dead.
//  - src/data/core/moves.json (37 rows, zero readers) is REMOVED
//    from the landing set; superseded by MOVES_DB in code
//    (src/lib/moves.ts + the batch-2 catalogue) and, at landing, by
//    the 919-row move pool in the move train — LANDED in this base by
//    the move-completion composition (2026-10-29): MOVES_DB is now
//    122 + the 758-row batch-3 catalogue.
//  - Move.anim (authored on all 122 moves, read by nothing) is
//    REMOVED from the type and from every entry; a move's animation
//    is DERIVED from its stable id through the profile registry
//    (src/lib/moveAnimation.ts) — locked by the derivation test.
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { MOVES_DB } from "./moves";
import { MOCHIICHAO_FULLPOOL_MOVES } from "./generated/fullpool_moves_catalogue";
import { getMoveAnimationProfile, validateMoveAnimationCoverage } from "./moveAnimation";

const SRC = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

describe("S-4/S-5 dead move data retirement", () => {
  it("moves.json and its schema are gone from the tree", () => {
    expect(fs.existsSync(path.join(SRC, "data/core/moves.json"))).toBe(false);
    expect(fs.existsSync(path.join(SRC, "data/core/schemas/moves.schema.json"))).toBe(false);
  });

  it("nothing in src references the retired data file", () => {
    const self = path.resolve(__dirname, "deadMoveData.test.ts");
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      if (file === self) continue;
      const text = fs.readFileSync(file, "utf8");
      if (text.includes("data/core/moves")) offenders.push(path.relative(SRC, file));
    }
    expect(offenders).toEqual([]);
  });

  it("no MOVES_DB entry carries a stored anim field", () => {
    for (const [id, m] of Object.entries(MOVES_DB)) {
      expect(Object.prototype.hasOwnProperty.call(m, "anim"), id).toBe(false);
    }
  });

  it("every move's animation DERIVES from its stable id via the profile registry", () => {
    expect(Object.keys(MOVES_DB)).toHaveLength(122 + Object.keys(MOCHIICHAO_FULLPOOL_MOVES).length);
    for (const id of Object.keys(MOVES_DB)) {
      expect(getMoveAnimationProfile(id), id).not.toBeNull();
    }
    expect(validateMoveAnimationCoverage()).toEqual([]);
  });
});
