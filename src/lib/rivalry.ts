// Rivalry — the living-world rival layer (teardown-shadow-of-war, N1/N2).
//
// Systems source: the Nemesis structure as documented publicly (hierarchy,
// trait rolls, memory of past encounters, promotion) — re-implemented
// natively in Mochiichao's own form. No Monolith expressive material,
// trait text, names or dialogue are used; trait content lives in
// src/data/core/living-world/rival-traits.json and is canon content.
//
// THE LAW (same as honor, List 28): a rival's memory and standing are
// DERIVED at read time from the deed ledger (gameStore.deedLedger) — this
// module stores nothing, writes nothing to the store, and never touches
// trainer/NPC canon records. A rival is a ledger subject:
// DeedEntry.subject.individualId === rival.id.

import type { DeedEntry } from "./honor";

export interface RivalTraits {
  immunities: string[];
  hates: string[];
  fears: string[];
}

export interface RivalRecord {
  id: string;
  factionClass: string;
  areaId: string;
  /** Derived band 1..5 — a generation output, never a stored standing. */
  levelBand: number;
  traits: RivalTraits;
}

export interface RivalTraitPool {
  immunities: string[];
  hates: string[];
  fears: string[];
}

function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN(rng: () => number, pool: string[], min: number, max: number): string[] {
  if (pool.length === 0) return [];
  const count = Math.min(pool.length, min + Math.floor(rng() * (max - min + 1)));
  const copy = [...pool];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * Deterministically generate a rival from a seed. Same seed + faction +
 * area + pool always yields the same record — generation is a pure
 * derivation, so a rival can be re-derived anywhere and never needs to
 * be stored to stay itself. Trait CONTENT comes from the pool argument
 * (canon data), never from this module.
 */
export function generateRival(
  seed: string,
  factionClass: string,
  areaId: string,
  pool: RivalTraitPool,
): RivalRecord {
  const rng = mulberry32(fnv1a(`${seed}|${factionClass}|${areaId}`));
  return {
    id: `rival-${fnv1a(`id|${seed}|${factionClass}|${areaId}`).toString(36)}`,
    factionClass,
    areaId,
    levelBand: 1 + Math.floor(rng() * 5),
    traits: {
      immunities: pickN(rng, pool.immunities, 0, 2),
      hates: pickN(rng, pool.hates, 1, 2),
      fears: pickN(rng, pool.fears, 1, 2),
    },
  };
}

/** Every ledger entry whose subject is this rival — the rival's memory. */
export function rivalMemory(ledger: DeedEntry[], rivalId: string): DeedEntry[] {
  return ledger.filter((e) => e.subject.individualId === rivalId);
}

export interface RivalStanding {
  encounters: number;
  witnessedEncounters: number;
  lastBeat: number | null;
  deeds: Record<string, number>;
}

/** A pure read-time summary over the rival's memory. Never stored. */
export function rivalStanding(ledger: DeedEntry[], rivalId: string): RivalStanding {
  const mem = rivalMemory(ledger, rivalId);
  const deeds: Record<string, number> = {};
  for (const e of mem) deeds[e.deed] = (deeds[e.deed] ?? 0) + 1;
  return {
    encounters: mem.length,
    witnessedEncounters: mem.filter((e) => e.witnessedBy.length > 0).length,
    lastBeat: mem.length ? Math.max(...mem.map((e) => e.beat)) : null,
    deeds,
  };
}
