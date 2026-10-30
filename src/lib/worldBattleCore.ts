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
 * - DONE in step 2: accuracy and multi-hit go through
 *   battle-math too — one accuracy roll per move (stage-adjusted
 *   threshold from the attacker's acc stage and the defender's eva
 *   stage; a move's MOVES_DB accuracy, or 100 for a GameData-island
 *   move with no MOVES_DB row, which keeps the legacy always-hits
 *   behaviour for island moves), and a 2–5-hit roll for MOVES_DB
 *   moves flagged MULTI_HIT, with one damage roll per hit. A miss
 *   deals nothing and the host logs it; the host's turn flow is
 *   otherwise unchanged (a miss still hands the turn over).
 * - DONE in step 3 (this step): secondary status infliction, on the
 *   same resolver rule the unreachable BattleView path already uses
 *   (battleResolver applyEffectEvents, secondary = true): after the
 *   damage rolls, on a hit, a MOVES_DB move whose effect is BURN /
 *   POISON / PARALYSIS rolls its MOVES_DB effectChance once
 *   (battle-math rollSecondaryEffect); on success the result
 *   carries statusApplied ("burn" / "poison" / "paralysis") and the
 *   host writes it onto the target — but only when the target is
 *   still standing (the host gates on post-damage HP > 0) and only
 *   when the target has no status already (an existing status is
 *   never overwritten). A miss rolls nothing. What infliction does
 *   mechanically TODAY: burn halves the victim's Physical damage
 *   on its next turns, because worldBattleDamage already routes
 *   attacker status through battle-math's burn rule — so a burn
 *   landed here matters from the very next hit. Paralysis and
 *   poison are stored, logged, and cleared by a healer (gameStore
 *   healParty already clears status).
 * - DONE in step 4 (this step): the paralysis can-act gate, on the
 *   same resolver rule the unreachable BattleView path already uses
 *   (battle-math checkCanAct): at the start of a battler's turn,
 *   before its move resolves, the host asks worldCheckCanAct; a
 *   fully-paralyzed battler (25% per turn, battle-math's roll)
 *   does not act and the turn hands over, with a log line. The
 *   gate is the whole checkCanAct rule, not a paralysis-only
 *   duplicate — burn and poison pass through (they act, and tick
 *   separately), and the sleep / freeze / confusion / flinch
 *   branches are carried by the same function, with their updated
 *   counters returned as a patch the host merges onto the battler
 *   (a wake or thaw clears the status). Those branches have NO
 *   live inflictor on main yet (step 3 inflicts only burn /
 *   poison / paralysis), so in live play today the gate fires
 *   only on paralysis; the other branches are the rule carried
 *   forward, not a claim that sleep or freeze occurs in play.
 * - DONE in step 5 (this step): the poison/burn end-turn tick, on
 *   the same resolver rule the unreachable BattleView path already
 *   uses (battleResolver's end-of-turn loop, battle-math
 *   endTurnStatusDamage): at the end of a round — the enemy turn's
 *   return to the menu, including a gated enemy turn, an
 *   unresolved enemy move, and a Ranger-defended hit — each still-
 *   standing battler with a ticking status (poison / burn / toxic)
 *   takes its tick (poison and burn 1/8 max HP, min 1; toxic 1/16
 *   x its counter, min 1, counter rising per the resolver) and the
 *   host logs it. A tick that faints a battler runs that side's
 *   real faint transition, factored out of the inline branches for
 *   exactly this purpose: a fainted foe runs the payoff /
 *   send-out / victory flow, a fainted player runs the blackout /
 *   auto-switch flow. No tick runs on a faint branch itself (a
 *   foe that fainted to a move, or a player that fainted to a
 *   move, ends the round in its own transition, and a mon just
 *   sent out does not tick in the round it arrived).
 * - DONE in step 6 (this step): PP write-back, on the same resolver
 *   rule the unreachable BattleView path already uses (battleResolver
 *   decrements the actor's PP by 1 per move use, and a move at 0 PP
 *   fails instead of firing): the host spends 1 PP from the player's
 *   live move, through worldSpendPp in this module, before the hit
 *   resolves — so a miss still costs PP, a gated battler never
 *   spends (the gate returns before the move branch), and an
 *   unresolved move spends nothing. The spend is written to the
 *   store copy FIRST, before the hit's faint branch runs, so the
 *   payoff's EXP/level commits (which copy the store member) carry
 *   the spent PP forward instead of silently restoring it — the
 *   2026-10-30 architecture rule's payoff-bypass failure, guarded
 *   by a test in worldBattleCore.test.ts. A healer restores PP to
 *   full (gameStore healParty, via worldFullPp in this module), so
 *   write-back does not introduce depletion with no restore — the
 *   exact reason battleWiring.ts left the resolver's PP unwritten.
 *   The evolution hook on the live path is still open.
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
  checkCanAct,
  endTurnStatusDamage,
  rollAccuracy,
  rollMultiHitCount,
  rollSecondaryEffect,
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
  /**
   * Step 3: the status the secondary roll inflicted ("burn" /
   * "poison" / "paralysis"), or null. The host applies it only when
   * the target is still standing (post-damage HP > 0); the core
   * itself never overwrites an existing status (see worldBattleHit).
   */
  statusApplied: string | null;
};

/**
 * Step 3: MOVES_DB secondary-status effect -> the battle-math status
 * string the host stores on the target. Only the three damaging-move
 * secondaries exist on main (BURN / POISON / PARALYSIS, all with a
 * power > 0); every other effect maps to null and rolls nothing.
 * The strings match battle-math ("paralysis", not "paralyzed") and
 * battleResolver's status vocabulary exactly.
 */
const STATUS_EFFECTS: Record<string, string> = {
  BURN: "burn",
  POISON: "poison",
  PARALYSIS: "paralysis",
};

/**
 * The converged hit roll for one WorldEngine battle move: one
 * accuracy roll, then (on a hit) one damage roll per hit — 1 hit
 * normally, 2–5 for a MOVES_DB move flagged MULTI_HIT — then (step 3)
 * one secondary-status roll for BURN / POISON / PARALYSIS moves.
 * Accuracy is
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
      statusApplied: null,
    };
  }
  const count = isMultiHit ? rollMultiHitCount(rng) : 1;
  const results: DamageResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(worldBattleDamage(attacker, defender, move, opts));
  }
  const damages = results.map((r) => r.damage);
  // Step 3: one secondary-status roll, after the damage rolls (the
  // resolver's order), and only for a damaging move. A target that
  // already carries a status keeps it — no overwrite, no re-roll.
  // The host still gates on the target standing (HP > 0 after the
  // damage is subtracted); the core cannot know that HP yet, so a
  // statusApplied on a fainting hit is returned and then dropped
  // by the host, never stored on a fainted mon.
  let statusApplied: string | null = null;
  const statusName = move.power > 0 ? STATUS_EFFECTS[db?.effect as string] : undefined;
  if (statusName && !defenderInput.status) {
    statusApplied = rollSecondaryEffect(db?.effectChance ?? 0, rng)
      ? statusName
      : null;
  }
  return {
    hit: true,
    hits: count,
    damages,
    totalDamage: damages.reduce((a, b) => a + b, 0),
    isCrit: results.some((r) => r.isCrit),
    isMultiHit,
    accuracy,
    results,
    statusApplied,
  };
}

export type WorldCanActResult = {
  /** False when the battler is stopped this turn (paralysis, sleep,
   * freeze, flinch, or a confusion self-hit). */
  canAct: boolean;
  /** checkCanAct's reason when stopped, else null. */
  reason: string | null;
  /**
   * Fields the host merges onto the battler copy (battle copy, and
   * the store copy for the player side) after the check: a wake or
   * thaw clears status, a still-asleep turn counts sleepTurns
   * down, a flinch clears. Empty for paralysis (the battler is
   * unchanged — only its action is stopped) and for burn / poison
   * (they act; their tick is a separate sub-step).
   */
  patch: Record<string, any>;
};

/**
 * Step 4: the start-of-turn can-act gate, on battle-math's
 * checkCanAct (the resolver's rule). The flat / instance mon is
 * adapted the same way as for damage; the can-act counters
 * battle-math defines (sleepTurns, confusionTurns, flinched) pass
 * through from the mon when present, because toBattleMathBattler
 * does not carry them (no live mon carries them yet — no live
 * inflictor writes them). A stopped battler's move never resolves:
 * the host logs the gate line and hands the turn over.
 */
export function worldCheckCanAct(
  mon: any,
  rng?: Rng,
): WorldCanActResult {
  const input = toBattleMathBattler(mon);
  if (mon?.sleepTurns != null) input.sleepTurns = mon.sleepTurns;
  if (mon?.confusionTurns != null) input.confusionTurns = mon.confusionTurns;
  if (mon?.flinched != null) input.flinched = mon.flinched;
  const result = checkCanAct(input, rng ?? Math.random);
  const patch: Record<string, any> = {};
  if (result.battler.status !== input.status) patch.status = result.battler.status;
  if (result.battler.sleepTurns !== input.sleepTurns) patch.sleepTurns = result.battler.sleepTurns;
  if (result.battler.confusionTurns !== input.confusionTurns) patch.confusionTurns = result.battler.confusionTurns;
  if (result.battler.flinched !== input.flinched) patch.flinched = result.battler.flinched;
  return {
    canAct: result.canAct,
    reason: result.canAct ? null : (result as { reason: string }).reason,
    patch,
  };
}

export type WorldEndTurnTickResult = {
  /** The tick damage (0 when the status does not tick). */
  damage: number;
  /** The status that ticked ("poison" / "burn" / "toxic"), or null. */
  status: string | null;
  /**
   * The toxic counter after this tick (resolver rule: it rises by 1
   * per ticking turn), or null when the status is not toxic. The
   * host merges it onto the battler copy so the next tick grows.
   */
  toxicCounter: number | null;
};

/**
 * Step 5: one battler's end-of-turn status tick, on battle-math's
 * endTurnStatusDamage (the resolver's rule). Poison and burn tick
 * 1/8 max HP (min 1); toxic ticks 1/16 x its counter (min 1). The
 * flat / instance mon is adapted the same way as for damage, so a
 * flat mon's maxHp and a full instance's maxHp both read correctly.
 * Paralysis, sleep, freeze, and no status tick 0 — they are gated
 * or pass at the start of the turn, not ticked at its end.
 */
export function worldEndTurnTick(mon: any): WorldEndTurnTickResult {
  const input = toBattleMathBattler(mon);
  if (mon?.toxicCounter != null) input.toxicCounter = mon.toxicCounter;
  const damage = endTurnStatusDamage(input);
  if (damage <= 0) return { damage: 0, status: null, toxicCounter: null };
  return {
    damage,
    status: mon?.status ?? input.status,
    toxicCounter:
      input.status === "toxic"
        ? Math.max(1, input.toxicCounter ?? 1) + 1
        : null,
  };
}

/** The battle-log line for a tick, in the resolver's own wording
 * ("took N damage from poison!" — battleResolver's end-of-turn
 * event text, status word as stored). */
export function worldStatusTickLine(
  name: string,
  status: string | null,
  damage: number,
): string {
  return `${name} took ${damage} damage from ${status}!`;
}

export type WorldSpendPpResult = {
  /** False when the battler carries no trackable PP (no moves array,
   * no pp array, or the move is not in its moves): the host spends
   * nothing and blocks nothing — legacy / flat shapes keep their
   * old behaviour instead of gaining a invented PP count. */
  tracked: boolean;
  /** True only when the move is tracked and its PP is already 0. */
  blocked: boolean;
  /** Index into moves / pp, or -1 when untracked. */
  moveIdx: number;
  /**
   * The new pp array after the spend, when tracked and not blocked;
   * null otherwise (the host stores nothing on a blocked or
   * untracked use). The input array is never mutated.
   */
  pp: number[] | null;
  /** PP left for the move after the spend, or null when untracked. */
  ppLeft: number | null;
};

/**
 * Step 6: one PP spend, on the resolver's rule (battleResolver: a
 * move at 0 PP fails instead of firing; otherwise the actor's PP
 * for that move falls by 1). The move is found by its canonical
 * moveId first, then by the caller's fallback key (the raw action
 * key — party moves are moveIds, but a legacy display-name entry
 * must still find its slot). The spend is pure: it returns the new
 * array and the host writes it (battle copy + store copy) — this
 * module never touches the store, so the spend cannot bypass the
 * host's payoff / send-out refreshes by writing behind them.
 * A foe is deliberately untracked here: wild / trainer-team battle
 * shapes carry no pp array, wild foes are discarded at battle end,
 * and trainer teams are rebuilt from map data each battle, so a
 * foe PP write-back would have nowhere to persist.
 */
export function worldSpendPp(
  mon: any,
  moveId: string | null | undefined,
  fallbackKey?: string | null,
): WorldSpendPpResult {
  const untracked: WorldSpendPpResult = {
    tracked: false, blocked: false, moveIdx: -1, pp: null, ppLeft: null,
  };
  const moves = mon?.moves;
  if (!Array.isArray(moves)) return untracked;
  let idx = moveId ? moves.indexOf(moveId) : -1;
  if (idx < 0 && fallbackKey && fallbackKey !== moveId) idx = moves.indexOf(fallbackKey);
  if (idx < 0) return untracked;
  const pp = mon?.pp;
  if (!Array.isArray(pp) || pp[idx] == null) return untracked;
  if (pp[idx] <= 0) {
    return { tracked: true, blocked: true, moveIdx: idx, pp: null, ppLeft: 0 };
  }
  const next = [...pp];
  next[idx] = pp[idx] - 1;
  return { tracked: true, blocked: false, moveIdx: idx, pp: next, ppLeft: next[idx] };
}

/** The battle-log line for a move with no PP left, in the resolver's
 * own wording ("has no PP left for X!" — battleResolver's PP-fail
 * event text). */
export function worldNoPpLine(name: string, moveDisplay: string): string {
  return `${name} has no PP left for ${moveDisplay}!`;
}

/**
 * Step 6, the restore half: full PP for a move list, exactly as
 * createMochii / evolveInstance initialise it (MOVES_DB pp, or 10
 * when the move has no MOVES_DB row — the same fallback, not a new
 * number). gameStore healParty uses this, so a healer restores PP
 * alongside HP and status; a Mend Patch (HP only) does not.
 */
export function worldFullPp(moves: string[] | null | undefined): number[] {
  if (!Array.isArray(moves)) return [];
  return moves.map((m) => (MOVES_DB as any)[m]?.pp ?? 10);
}

/** The battle-log line for a stopped battler, by checkCanAct reason.
 * Confusion self-hit damage is NOT rolled here — checkCanAct's own
 * contract leaves confusionDamage to the caller, and no live move
 * inflicts confusion, so that branch is carried, not claimed. */
export function worldCanActGateLine(name: string, reason: string | null): string {
  switch (reason) {
    case "fully-paralyzed":
      return `${name} is paralyzed! It can't move!`;
    case "asleep":
      return `${name} is fast asleep!`;
    case "frozen":
      return `${name} is frozen solid!`;
    case "flinched":
      return `${name} flinched and couldn't move!`;
    case "confusion-self-hit":
      return `${name} hurt itself in its confusion!`;
    default:
      return `${name} can't move!`;
  }
}
