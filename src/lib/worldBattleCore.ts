/**
 * Gap-fill S6 (battle convergence, steps 1–2): the WorldEngine host's
 * damage core.
 *
 * AUDIT gap F-3: the battle a player actually fights lives in
 * src/world/WorldEngine.tsx with its own GameData.calcDamage, while the
 * resolver stack's battle-math (src/lib/battle-math.ts) — damage,
 * stages, status, multi-hit — is wired only into the unreachable
 * BattleView path. Two damage maths may not survive. This module is
 * the convergence seam: it adapts the WorldEngine host's flat battle
 * mons + its resolved moves (resolveBattleMove / worldMoveBridge)
 * into battle-math inputs, and WorldEngine's two hit call sites
 * (player move, enemy move) now call it instead of calcDamage.
 *
 * What this step does and does NOT do, stated plainly:
 * - DONE in step 1: damage goes through battle-math's calculateDamage —
 *   stage-adjusted attack/defence, crit (x2, 1/16 at crit stage 0),
 *   STAB (x1.5 when the move's element is one of the attacker's
 *   species elements), burn halving for Physical, and the 85–100
 *   damage roll.
 * - DONE in step 2 (this step): accuracy and multi-hit go through
 *   battle-math too — one accuracy roll per move (stage-adjusted
 *   threshold from the attacker's acc stage and the defender's eva
 *   stage; a move's MOVES_DB accuracy, or 100 for a GameData-island
 *   move with no MOVES_DB row, which keeps the legacy always-hits
 *   behaviour for island moves), and a 2–5-hit roll for MOVES_DB
 *   moves flagged MULTI_HIT, with one damage roll per hit. A miss
 *   deals nothing and the host logs it; the host's turn flow is
 *   otherwise unchanged (a miss still hands the turn over).
 *   Status end-turn damage, PP write-back, and the evolution hook
 *   on the live path are SEPARATE S6 sub-steps and are NOT claimed
 *   here.
 * - TYPE CHART, NOT WIRED HERE: calculateDamage takes its type
 *   multipliers from the caller, and this module passes NEUTRAL (1)
 *   for every defending element. That is a placeholder, not a canon
 *   claim that all types are neutral: the chart's content is the
 *   owner-gated Draco decision (GAP-FILL-PLAN F-4), and unruled
 *   cells are shipped neutral-with-a-flag, never silently filled.
 *   The multiplier slot is exactly where the chart lands once Draco
 *   is ruled; nothing in this module hard-codes a type matchup.
 * - STAT MAPPING, no new stats invented: the flat battle mon carries
 *   atk/def/spd only, while battle-math also wants spAttack /
 *   spDefense. A flat mon's spAttack falls back to its atk and its
 *   spDefense to its def — the legacy GameData behaviour (which
 *   always used atk/def) preserved as the documented fallback, not
 *   a new stat. A full MochiiInstance (the player side carries one)
 *   keeps its real spa/spd, stages, and status through this adapter.
 * - MOVE CATEGORY: MOVES_DB moves carry their real cat
 *   (Physical/Special/Status). GameData-island moves carry no
 *   category; a damaging island move defaults to Physical (the
 *   legacy path, which always used atk/def), and a power-0 island
 *   move resolves to Status, which battle-math scores 0 — the same
 *   result GameData.calcDamage gave for power 0.
 * - GameData.calcDamage itself is NOT deleted in this step: it
 *   simply has no live importer left after this swap (verified by
 *   grep in the landing record). Deleting it is a separate,
 *   explicitly-recorded decision, not smuggled into a damage swap.
 */

import {
  accuracyThreshold,
  calculateDamage,
  rollAccuracy,
  rollMultiHitCount,
  type BattlerInput,
  type DamageResult,
  type MoveCategory,
  type Rng,
} from "./battle-math";
import { MOVES_DB } from "./moves";
import { SPECIES_DB } from "./species";

/** Display-type spellings (what resolveBattleMove returns) -> the
 * legacy element vocabulary battle-math and SPECIES_DB use. Already-
 * uppercase spellings pass through unchanged. */
const DISPLAY_TO_ELEMENT: Record<string, string> = {
  Water: "WATER",
  Chrome: "STEEL",
  Earth: "GROUND",
  Flame: "FIRE",
  Grass: "GRASS",
};

export function normaliseBattleElement(type: string | null | undefined): string {
  if (!type) return "";
  const t = String(type);
  return DISPLAY_TO_ELEMENT[t] ?? t.toUpperCase();
}

const ZERO_STAGES = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 };

/**
 * One battle-math battler from a WorldEngine battle mon. The mon may
 * be a flat battle shape (wild / trainer-team: atk/def/spd, single
 * type, speciesId) or a full MochiiInstance (player side: stats.*,
 * stages, status, speciesId). Species elements come from SPECIES_DB
 * when the species resolves; otherwise the mon's own type field,
 * normalised, is the single element; otherwise no elements (no STAB,
 * neutral multipliers — never an invented type).
 */
export function toBattleMathBattler(mon: any): BattlerInput {
  const atk = mon?.atk ?? mon?.stats?.atk ?? 50;
  const def = mon?.def ?? mon?.stats?.def ?? 50;
  const sp = mon?.speciesId ? (SPECIES_DB as any)[mon.speciesId] : null;
  const elements: string[] = sp?.types
    ? [...sp.types]
    : mon?.type
      ? [normaliseBattleElement(mon.type)].filter(Boolean)
      : [];
  return {
    level: mon?.level ?? 5,
    attack: atk,
    defense: def,
    // Flat fallback, documented above: a flat mon has no sp split.
    // NOTE the spd trap, kept explicit: on a flat battle mon `spd`
    // means SPEED (wildMon / trainerBattleMon set spd = stats.spe),
    // while on a MochiiInstance `stats.spd` means special defence.
    // So spDefense reads ONLY stats.spd (never a top-level spd),
    // and speed reads stats.spe first, then a flat mon's spd.
    spAttack: mon?.stats?.spa ?? atk,
    spDefense: mon?.stats?.spd ?? def,
    speed: mon?.stats?.spe ?? mon?.spd ?? 50,
    maxHp: mon?.maxHp ?? mon?.hp ?? 1,
    elements,
    stages: mon?.stages ? { ...ZERO_STAGES, ...mon.stages } : { ...ZERO_STAGES },
    status: mon?.status ?? null,
  };
}

export type WorldBattleMove = {
  power: number;
  type: string;
  moveId: string;
};

export type WorldBattleDamageOptions = {
  rng?: Rng;
  /** Test / determinism hook only; live play never forces crits. */
  forceCrit?: boolean;
};

/** Shared move resolution for the damage and hit entry points: the
 * MOVES_DB row (null for a GameData-island move) and the category
 * battle-math needs. Behaviour is step 1's, unchanged: a damaging
 * island move defaults to Physical (the legacy path, which always
 * used atk/def); a power-0 island move resolves to Status. */
function resolveWorldBattleMove(move: WorldBattleMove): {
  db: any;
  category: MoveCategory;
} {
  const db: any = move.moveId ? (MOVES_DB as any)[move.moveId] : null;
  const rawCat = db?.cat as string | undefined;
  const category: MoveCategory =
    rawCat === "Physical" || rawCat === "Special" || rawCat === "Status"
      ? rawCat
      : move.power <= 0
        ? "Status"
        : "Physical";
  return { db, category };
}

/**
 * The converged damage roll for one WorldEngine battle hit. Returns
 * battle-math's full DamageResult (damage, isCrit, typeMultiplier,
 * isStab, rollPercent) so the host can log crits honestly.
 * typeMultipliers are NEUTRAL (see header: Draco-gated chart slot).
 */
export function worldBattleDamage(
  attacker: any,
  defender: any,
  move: WorldBattleMove,
  opts: WorldBattleDamageOptions = {},
): DamageResult {
  const { db, category } = resolveWorldBattleMove(move);
  const attackerInput = toBattleMathBattler(attacker);
  const defenderInput = toBattleMathBattler(defender);
  return calculateDamage(
    attackerInput,
    defenderInput,
    {
      power: move.power,
      accuracy: db?.acc ?? 100,
      category,
      element: normaliseBattleElement(move.type),
      priority: db?.pri ?? 0,
    },
    {
      // Draco-gated: neutral until the chart lands (header).
      typeMultipliers: defenderInput.elements.map(() => 1),
      rng: opts.rng,
      forceCrit: opts.forceCrit,
    },
  );
}

/** The damage number for the host's two call sites. */
export function worldBattleDamageNumber(
  attacker: any,
  defender: any,
  move: WorldBattleMove,
  opts: WorldBattleDamageOptions = {},
): number {
  return worldBattleDamage(attacker, defender, move, opts).damage;
}

export type WorldBattleHitResult = {
  /** False when the accuracy roll missed: no hit, no damage. */
  hit: boolean;
  /** Number of hits landed (0 on a miss, 1 normally, 2–5 multi-hit). */
  hits: number;
  /** Per-hit damage numbers, in hit order. */
  damages: number[];
  /** Total damage across all hits (what the host subtracts). */
  totalDamage: number;
  /** True when any hit crit. */
  isCrit: boolean;
  /** True when the move is a MULTI_HIT move (even on a miss). */
  isMultiHit: boolean;
  /** The accuracy the roll used (MOVES_DB acc, or 100 island). */
  accuracy: number;
  /** Per-hit battle-math results, in hit order. */
  results: DamageResult[];
};

/**
 * The converged hit roll for one WorldEngine battle move: one
 * accuracy roll, then (on a hit) one damage roll per hit — 1 hit
 * normally, 2–5 for a MOVES_DB move flagged MULTI_HIT. Accuracy is
 * stage-adjusted (attacker's acc stage vs defender's eva stage) via
 * battle-math; the accuracy value is the move's MOVES_DB acc, or 100
 * for a GameData-island move (no row, so no accuracy to miss on —
 * the legacy always-hits behaviour, preserved, not a new claim).
 * A MOVES_DB accuracy of 0 is battle-math's always-hit convention
 * (threshold Infinity), so such a move never misses either.
 * The host calls this — not worldBattleDamage — for both live hit
 * sites, so a miss and a multi-hit are real in play, not just in
 * the resolver path.
 */
export function worldBattleHit(
  attacker: any,
  defender: any,
  move: WorldBattleMove,
  opts: WorldBattleDamageOptions = {},
): WorldBattleHitResult {
  const { db, category } = resolveWorldBattleMove(move);
  const attackerInput = toBattleMathBattler(attacker);
  const defenderInput = toBattleMathBattler(defender);
  const accuracy: number = db?.acc ?? 100;
  const isMultiHit = db?.effect === "MULTI_HIT" && move.power > 0;
  const rng = opts.rng ?? Math.random;
  const threshold = accuracyThreshold(
    {
      power: move.power,
      accuracy,
      category,
      element: normaliseBattleElement(move.type),
      priority: db?.pri ?? 0,
    },
    attackerInput,
    defenderInput,
  );
  if (!rollAccuracy(threshold, rng)) {
    return {
      hit: false,
      hits: 0,
      damages: [],
      totalDamage: 0,
      isCrit: false,
      isMultiHit,
      accuracy,
      results: [],
    };
  }
  const count = isMultiHit ? rollMultiHitCount(rng) : 1;
  const results: DamageResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(worldBattleDamage(attacker, defender, move, opts));
  }
  const damages = results.map((r) => r.damage);
  return {
    hit: true,
    hits: count,
    damages,
    totalDamage: damages.reduce((a, b) => a + b, 0),
    isCrit: results.some((r) => r.isCrit),
    isMultiHit,
    accuracy,
    results,
  };
}
