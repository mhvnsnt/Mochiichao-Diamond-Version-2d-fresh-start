/**
 * Full move pool coverage lock (owner order 2026-10-29 ~20:02 CDT).
 * The game carries the FULL Pokemon move pool — 919 moves — wired into
 * MOVES_DB with per-move animation profiles. Fails if: the pool drops
 * below the Gen-5 floor (559) or below the full count (919), any pool
 * row is incomplete, any pool id or live move id resolves to nothing /
 * a generic fallback, any of the 352 rename-registry rows loses its
 * verbatim registry name or machine class, or any learnset/machine
 * reference points outside the pool.
 */
import { describe, expect, it } from "vitest";
import { MOVES_DB } from "./moves";
import { MOCHIICHAO_FULLPOOL_MOVES } from "./generated/fullpool_moves_catalogue";
import poolData from "./generated/fullMovePool.json";
import {
  FULL_MOVE_POOL_COUNT,
  getMoveAnimation,
  validateFullMovePoolCoverage,
} from "./moveAnimation";

interface PoolRow {
  id: string;
  pokeapiId: number | null;
  sourceName: string;
  introducedGeneration: number;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  effect: string | null;
  effectDataStatus: string;
  machineClass: string | null;
  displayNameDraft: string;
  displayNameStatus: string;
  profileBasis: string;
  profile: { delivery: string; signature: string; timelineMs: { total: number } };
}
const POOL = poolData as unknown as { poolCount: number; moves: PoolRow[] };

describe("full move pool (batch 3)", () => {
  it("carries the full pool: 919 rows (864 standard + 55 variant executions), above the Gen-5 floor of 559", () => {
    expect(POOL.poolCount).toBe(919);
    expect(FULL_MOVE_POOL_COUNT).toBe(919);
    expect(POOL.moves.length).toBeGreaterThanOrEqual(559);
    expect(Object.keys(MOVES_DB).length).toBe(122 + Object.keys(MOCHIICHAO_FULLPOOL_MOVES).length);
    // 758 new MOVES_DB rows: 864 standard pool rows minus the 106 whose
    // source move is already represented by a live game row (that row is
    // the move's Mochiichao version; the registry keeps the cross-ref).
    expect(Object.keys(MOCHIICHAO_FULLPOOL_MOVES).length).toBe(758);
  });

  it("variant executions are flagged as variants and stay out of MOVES_DB", () => {
    const variants = (POOL.moves as unknown as { variantClass: string | null; id: string }[])
      .filter((r) => r.variantClass);
    expect(variants).toHaveLength(55);
    for (const v of variants) {
      expect(MOVES_DB[v.id], v.id).toBeUndefined();
      // but they still resolve to a (variant) animation profile
      expect(getMoveAnimation(v.id), v.id).not.toBeNull();
    }
  });

  it("every pool row is complete: stats, effect status, machine fields, profile", () => {
    expect(validateFullMovePoolCoverage()).toEqual([]);
    for (const r of POOL.moves) {
      expect(r.type, r.id).toBeTruthy();
      expect(["Physical", "Special", "Status"], r.id).toContain(r.category);
      expect(r.pp, r.id).toBeGreaterThan(0);
      expect(["decomp-black2", "pokeapi-stats-only"], r.id).toContain(r.effectDataStatus);
      expect(r.profile.delivery, r.id).toBeTruthy();
      expect(r.profile.signature, r.id).toBeTruthy();
      expect(r.profile.timelineMs.total, r.id).toBeGreaterThan(0);
    }
  });

  it("no generic fallback: every pool id and every live move resolves to a per-move profile", () => {
    for (const r of POOL.moves) {
      const entry = getMoveAnimation(r.id);
      expect(entry, r.id).not.toBeNull();
      expect(entry!.profile.delivery, r.id).toBeTruthy();
    }
    for (const id of Object.keys(MOVES_DB)) {
      expect(getMoveAnimation(id), id).not.toBeNull();
    }
    expect(getMoveAnimation("NOT_A_MOVE")).toBeNull();
  });

  it("all 352 rename-registry rows carry their verbatim registry name + machine class", () => {
    const registryNamed = POOL.moves.filter((r) => r.displayNameStatus.startsWith("registry-"));
    expect(registryNamed).toHaveLength(352);
    const machined = POOL.moves.filter((r) => r.machineClass);
    expect(machined).toHaveLength(352);
    for (const r of machined) {
      expect(r.displayNameDraft.length, r.id).toBeGreaterThan(0);
      expect(r.displayNameDraft, r.id).not.toBe(r.sourceName);
    }
  });

  it("display drafts never equal a Pokemon move name and never duplicate", () => {
    const sourceNames = new Set(POOL.moves.map((r) => r.sourceName));
    const drafts = POOL.moves.filter((r) => r.displayNameStatus === "DRAFT");
    // 561 at the fullpool build; the move-completion composition corrected
    // 7 rows whose session-2 owner-approved names had the approval
    // annotation baked into the name field (Match Type, Counter Type,
    // Hand Hold, Verdict, Richter Quake, Combo Strike, Last Gasp) — those
    // rows are owner-locked now, not drafts.
    expect(drafts.length).toBe(554);
    const seen = new Set<string>();
    for (const r of POOL.moves) {
      expect(seen.has(r.displayNameDraft), r.id).toBe(false);
      seen.add(r.displayNameDraft);
    }
    for (const r of drafts) {
      expect(sourceNames.has(r.displayNameDraft), r.id).toBe(false);
    }
  });

  it("script-union rows and composed rows are both present and labelled", () => {
    const script = POOL.moves.filter((r) => r.profileBasis === "script-union");
    const composed = POOL.moves.filter((r) => r.profileBasis === "composed");
    expect(script).toHaveLength(559);
    expect(composed).toHaveLength(360);
  });
});
