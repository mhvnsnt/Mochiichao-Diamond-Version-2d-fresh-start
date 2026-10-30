/**
 * rangerDefense.ts — Ranger Companion Defence + Health
 * (ranger-defense package, owner ruling 2026-10-29 ~21:21 CDT; builds
 * on the PMD-mode package: ~/workspace/pmd-mode/, creatureMode.ts).
 *
 * THE RULING, in the owner's substance: Rangers are too weak to deal
 * real damage to creatures — that canon stands, and rangedAction()'s
 * refusal is untouched. Villain humans are the exception (§5 below).
 * In creature mode the Ranger companion's verbs are harm-free —
 * distract, draw attention, run interference (§4). And the new
 * mechanic: the Ranger can DEFEND the player-creature — step in,
 * take a hit meant for it, on his own HEALTH BAR, with the attack's
 * real damage — go DOWN (never die), and need healing.
 *
 * SOURCE-FIRST, grades written on the wiring:
 *  - Companion body / down / recovery shape: Fallout companions
 *    (wave-2 fallout-3-4 teardown, DOCS grade): a companion who
 *    drops is DOWN, not dead, and needs aid or recovery — never a
 *    death state, never a game over. No Fallout code is held; the
 *    SHAPE is ported, the numbers are ours (below).
 *  - Intercept grammar: Pokémon's attack-drawing family (Follow Me /
 *    Rage Powder) — an ally makes itself the target. In the classic
 *    battle the intercept is a marked, logged beat, not a passive.
 *  - Damage numbers: THIS game's real math only — battle-math.ts
 *    calculateDamage (the same function creature-mode skirmishes
 *    use) and, on the classic path, the damage the battle itself
 *    already computed. No parallel damage scale is invented.
 *  - TYPE CHART DOES NOT APPLY TO A HUMAN BODY (decision, recorded):
 *    type effectiveness is a creature-biology relation (a Flame
 *    move is "super effective" against a Flora creature because of
 *    what the creature IS). A human body has no element; the hit
 *    lands as physical trauma. So the Ranger's damage is computed
 *    with the type product forced to 1 — the exact precedent is
 *    battle-math's own confusionDamage(), which computes a typeless
 *    hit with typeMultipliers: [1]. Attacker-side facts (the move's
 *    power, the attacker's stats and level, STAB — the move being
 *    the attacker's own element is a fact about the MOVE, not the
 *    body it hits) all stay in the number.
 *  - Per-hit CAP (decision, recorded): raw damage is capped at a
 *    data fraction of the Ranger's max HP (default 1/2). Without a
 *    cap, a high-level stray hit deletes the companion in one beat
 *    and the system becomes a random tax; with it, a big attack
 *    still takes "a lot of their health" (the owner's words) — half
 *    the bar — and two big hits put him down. One-shot kills of the
 *    Ranger are a STORY choice (owner-authored beats), never an
 *    accident of arithmetic.
 *
 * DORO-DERIVED parameters (design parameters under the owner's 25%
 * delegation — reversible by his word, NOT canon): the HP pool
 * derivation and the defend-chance table. Both are anchored to real
 * system values and live in data (encounter-modes.json →
 * rangerDefense), so retuning is a data edit, never a code edit.
 */

import { calculateDamage, type BattlerInput, type MoveInput } from "./battle-math";
import { battlerFromMon, REGULAR_ATTACK, type CompanionCommand, type Roamer } from "./creatureMode";
import encounterModes from "../data/core/encounter-modes.json";

// ---------------------------------------------------------------------
// Config (data — encounter-modes.json "rangerDefense")
// ---------------------------------------------------------------------

export interface RangerDefenseConfig {
  poolBase: number;
  poolPerLeadLevel: number;
  capFraction: number;
  defendBaseByCommand: Record<CompanionCommand, number>;
  defendPerBondBand: number;
  maxDefendsPerBattle: number;
  distractRangeTiles: number;
  distractBeats: number;
  exposureChanceByTemperament: Record<string, number>;
}

const cfgRaw: any = (encounterModes as any).rangerDefense || {};

export const RANGER_DEFENSE: RangerDefenseConfig = {
  // Pool derivation (DORO-DERIVED): 30 + 10 × lead level. Anchored to
  // the lead creature's level band because the dyad journeys together
  // — the Ranger's hardiness is read off the journey's own scale, the
  // way createRoamer reads a wild's HP off its level (20 + 2×level is
  // the wild scale; a person's pool sits deliberately ABOVE a wild
  // creature's of the same band — he has to be able to take the hit
  // he steps into — and far below a trained partner's grown HP).
  poolBase: cfgRaw.poolBase ?? 30,
  poolPerLeadLevel: cfgRaw.poolPerLeadLevel ?? 10,
  capFraction: cfgRaw.capFraction ?? 0.5,
  defendBaseByCommand: cfgRaw.defendBaseByCommand ?? { follow: 0.25, free: 0.35, wait: 0.05 },
  defendPerBondBand: cfgRaw.defendPerBondBand ?? 0.05,
  maxDefendsPerBattle: cfgRaw.maxDefendsPerBattle ?? 3,
  distractRangeTiles: cfgRaw.distractRangeTiles ?? 4,
  distractBeats: cfgRaw.distractBeats ?? 3,
  exposureChanceByTemperament: cfgRaw.exposureChanceByTemperament ?? {
    aggressive: 0.5,
    bold: 0.4,
    curious: 0.15,
    docile: 0.1,
    timid: 0.05,
  },
};

type Rng = () => number;

// ---------------------------------------------------------------------
// 1. The health pool — real state, store-held (gameStore.ts)
// ---------------------------------------------------------------------

export interface RangerHealth {
  hp: number;
  maxHp: number;
}

/** The pool for a journey whose lead creature is `leadLevel`. */
export function deriveRangerMaxHp(leadLevel: number, cfg: RangerDefenseConfig = RANGER_DEFENSE): number {
  const lvl = Math.max(1, Math.floor(leadLevel || 1));
  return cfg.poolBase + cfg.poolPerLeadLevel * lvl;
}

export function freshRangerHealth(leadLevel: number, cfg: RangerDefenseConfig = RANGER_DEFENSE): RangerHealth {
  const maxHp = deriveRangerMaxHp(leadLevel, cfg);
  return { hp: maxHp, maxHp };
}

/** DOWN is a state, never a death (Fallout companion shape). */
export function rangerDown(h: RangerHealth): boolean {
  return h.hp <= 0;
}

/**
 * The swap lock (owner mechanic, stated in-fiction by the engine):
 * control can only pass to a partner who can stand. While the Ranger
 * is down, the swap is locked BOTH ways — you cannot hand him the
 * lead, and he cannot walk with you as companion — with the reason
 * carried on the result so the game speaks it, never silently no-ops.
 */
export function swapLockForRanger(h: RangerHealth): { locked: boolean; reason: string | null } {
  if (!rangerDown(h)) return { locked: false, reason: null };
  return {
    locked: true,
    reason: "He's down — he can't take the lead, and he can't walk with you. Heal him first.",
  };
}

/** Apply damage to the pool. Returns the new state + whether this
 * hit put him DOWN (the moment the engine marks). */
export function applyRangerDamage(
  h: RangerHealth,
  damage: number,
): { health: RangerHealth; dealt: number; downedNow: boolean } {
  const dealt = Math.max(0, Math.min(Math.floor(damage), h.hp));
  const hp = h.hp - dealt;
  return { health: { hp, maxHp: h.maxHp }, dealt, downedNow: hp <= 0 && h.hp > 0 };
}

export function applyRangerHeal(h: RangerHealth, amount: number): RangerHealth {
  return { hp: Math.min(h.maxHp, h.hp + Math.max(0, Math.floor(amount))), maxHp: h.maxHp };
}

export function applyRangerFullHeal(h: RangerHealth): RangerHealth {
  return { hp: h.maxHp, maxHp: h.maxHp };
}

// ---------------------------------------------------------------------
// 2. DEFEND — the intercept decision (data-driven trigger rules)
// ---------------------------------------------------------------------

export interface DefendContext {
  /** Companion command in force — position decides willingness:
   * Free (living beside you, watching) raises it; Wait (left behind
   * at a post, possibly tiles away) nearly zeroes it; Follow is the
   * baseline at your heel. */
  command: CompanionCommand;
  /** Effective bond band 0..5 of the dyad's lead (bond reads, #39) —
   * the same input shape rangedAction() already consumes. A Ranger
   * who barely knows you does not throw himself in front of hits. */
  bondBand?: number;
  health: RangerHealth;
  /** Defends already spent in this beat/battle — the budget that
   * keeps him a person, not a wall: one per skirmish beat (the
   * engine passes its per-beat flag) and a capped count per classic
   * battle (data: maxDefendsPerBattle). */
  defendsSpent: number;
  defendsBudget: number;
}

export function defendChance(ctx: DefendContext, cfg: RangerDefenseConfig = RANGER_DEFENSE): number {
  if (rangerDown(ctx.health)) return 0;
  if (ctx.defendsSpent >= ctx.defendsBudget) return 0;
  const base = cfg.defendBaseByCommand[ctx.command] ?? 0.25;
  const bond = (ctx.bondBand ?? 0) * cfg.defendPerBondBand;
  return Math.min(0.95, Math.max(0, base + bond));
}

/** Roll the intercept. Deterministic under the injected rng. */
export function rollDefend(ctx: DefendContext, rng: Rng, cfg: RangerDefenseConfig = RANGER_DEFENSE): boolean {
  const chance = defendChance(ctx, cfg);
  if (chance <= 0) return false;
  return rng() < chance;
}

// ---------------------------------------------------------------------
// 3. The damage a human body takes
// ---------------------------------------------------------------------

/** The human body as a battler: flat baseline stats (the same flat-10
 * block creatureMode uses for pool roamers' skirmish bodies — a
 * person is not a trained creature and carries no stat growth), NO
 * elements (see the header: the type chart has nothing to bite on). */
export function humanBodyBattler(level: number): BattlerInput {
  const body = battlerFromMon({
    level,
    hp: 1,
    maxHp: 1,
    stats: { atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
  });
  // battlerFromMon defaults a missing element to "NORMAL" — a human
  // body has NO element (an element would hand a villain's punch
  // STAB it never earned, and give the type chart a fake target on
  // the receiving side). The empty list is the honest body.
  return { ...body, elements: [] };
}

export function rangerHitCap(maxHp: number, cfg: RangerDefenseConfig = RANGER_DEFENSE): number {
  return Math.max(1, Math.floor(maxHp * cfg.capFraction));
}

export interface RangerHitResult {
  /** Damage as the move computes it against a human body (no chart). */
  rawDamage: number;
  /** What actually lands, after the per-hit cap. */
  damage: number;
  capped: boolean;
}

/**
 * Damage from a creature's move landing on the Ranger: the game's
 * real formula (battle-math), attacker's real stats/move, human
 * body as defender, type product forced to 1 (confusionDamage
 * precedent), then the per-hit cap.
 */
export function rangerDamageFromHit(
  attacker: BattlerInput,
  move: MoveInput,
  rangerMaxHp: number,
  rng: Rng = Math.random,
  cfg: RangerDefenseConfig = RANGER_DEFENSE,
): RangerHitResult {
  const defender = humanBodyBattler(attacker.level);
  const res = calculateDamage(attacker, defender, move, { rng, typeMultipliers: [1] });
  const rawDamage = Math.max(0, res.damage);
  const cap = rangerHitCap(rangerMaxHp, cfg);
  return { rawDamage, damage: Math.min(rawDamage, cap), capped: rawDamage > cap };
}

/**
 * The classic-battle path: that battle's own engine (GameData
 * calcDamage) has already produced the hit's damage number against
 * the creature — a formula with no type term in it, so redirecting
 * the number wholesale honours the no-chart rule on that path too.
 * Only the cap is applied here, by the same rule as the skirmish
 * path, so a hit costs the Ranger the same on both presentations.
 */
export function rangerDamageFromClassicHit(
  computedDamage: number,
  rangerMaxHp: number,
  cfg: RangerDefenseConfig = RANGER_DEFENSE,
): RangerHitResult {
  const rawDamage = Math.max(0, Math.floor(computedDamage));
  const cap = rangerHitCap(rangerMaxHp, cfg);
  return { rawDamage, damage: Math.min(rawDamage, cap), capped: rawDamage > cap };
}

// ---------------------------------------------------------------------
// 4. DISTRACT — the Ranger's harm-free active verb (creature mode)
// ---------------------------------------------------------------------

export interface DistractResult {
  targetId: string;
  /** World beats the roamer's attention is on the Ranger. */
  beats: number;
  /** The cost of being the loudest thing in the field: a bold or
   * aggressive creature may snap at HIM instead. */
  exposureHit: boolean;
  exposureDamage: number;
  note: string;
}

/**
 * The Ranger draws a roamer's attention onto himself for a few
 * beats — it turns toward him, steps toward him, and its contact
 * threat leaves the player-creature while the beats last (the
 * engine honours `distractedBeats` on the roamer record). He deals
 * no damage, ever (canon): the only HP that moves in this function
 * is his own, when the distracted creature snaps at the noise.
 */
export function distractRoamer(
  target: Roamer,
  rangerHealth: RangerHealth,
  rng: Rng,
  cfg: RangerDefenseConfig = RANGER_DEFENSE,
): DistractResult {
  const base: DistractResult = {
    targetId: target.id,
    beats: cfg.distractBeats,
    exposureHit: false,
    exposureDamage: 0,
    note: "",
  };
  if (target.state === "down") return { ...base, beats: 0, note: "It is already down." };
  if (rangerDown(rangerHealth)) return { ...base, beats: 0, note: "He's down — he can't draw anything." };
  const chance = cfg.exposureChanceByTemperament[target.temperament] ?? 0.1;
  if (rng() < chance) {
    const atk = battlerFromMon({
      level: target.level,
      hp: target.hp,
      maxHp: target.maxHp,
      stats: { atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
    });
    const hit = rangerDamageFromHit(atk, REGULAR_ATTACK, rangerHealth.maxHp, rng, cfg);
    return {
      ...base,
      exposureHit: true,
      exposureDamage: hit.damage,
      note: `The Ranger makes himself the loudest thing here — and the ${target.speciesId} snaps at HIM for ${hit.damage}!`,
    };
  }
  return {
    ...base,
    note: `The Ranger waves and shouts — the ${target.speciesId}'s attention is on him now.`,
  };
}

// ---------------------------------------------------------------------
// 5. VILLAIN HUMANS — the owner's exception (spec + data flag)
// ---------------------------------------------------------------------

/**
 * The data flag: an NPC record carrying `hostileHuman: true` may
 * target creatures DIRECTLY with weak physical attacks. Ordinary
 * Rangers and townsfolk never carry it (the Ranger's no-damage rule
 * is the default of the species, not a per-NPC courtesy). Villain
 * beats that BREAK the feebleness (a grunt whose punch actually
 * matters) are narrative authoring — OWNER SLOTS, flagged in the
 * spec; this module ships the flag, the targeting rule, and the
 * feeble human-scale numbers only.
 */
export const HOSTILE_HUMAN_FLAG = "hostileHuman" as const;

export function isHostileHuman(npc: any): boolean {
  return !!npc && npc[HOSTILE_HUMAN_FLAG] === true;
}

/** Human-scale strikes (owner's words: punch, tackle — "some evil
 * ass shit" that is still a PERSON hitting a creature). Power sits
 * far below creature moves of the same name on purpose: the same
 * math that makes a creature's Tackle-class hit real makes a
 * human's version a bruise. */
export const HUMAN_STRIKES: Record<string, MoveInput & { id: string; name: string }> = {
  HUMAN_PUNCH: { id: "HUMAN_PUNCH", name: "Punch", power: 20, accuracy: 95, category: "Physical", element: "NORMAL" as any, priority: 0 },
  HUMAN_TACKLE: { id: "HUMAN_TACKLE", name: "Tackle", power: 25, accuracy: 95, category: "Physical", element: "NORMAL" as any, priority: 0 },
};

/** A flagged villain's strike against a creature, through the same
 * real math: human attacker (flat-10 body, the human's own level),
 * creature defender with its real stats AND its real type chart —
 * the chart protects creatures from people exactly as it should. */
export function humanStrikeDamage(
  humanLevel: number,
  targetMon: any,
  strikeId: keyof typeof HUMAN_STRIKES = "HUMAN_PUNCH",
  rng: Rng = Math.random,
): number {
  const move = HUMAN_STRIKES[strikeId] || HUMAN_STRIKES.HUMAN_PUNCH;
  const atk = humanBodyBattler(Math.max(1, humanLevel || 1));
  const def = battlerFromMon(targetMon);
  // The same battle-math pipeline the creature-mode skirmish path
  // uses (rangedAction): the creature defends with its real stats;
  // type multipliers ride the caller's contract exactly as they do
  // there today — no second chart is founded in this module.
  const res = calculateDamage(atk, def, move as MoveInput, { rng });
  return Math.max(0, res.damage);
}
