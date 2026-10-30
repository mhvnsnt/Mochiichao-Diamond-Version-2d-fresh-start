/**
 * battlePayoff.ts — the post-battle payoff sequence (EXP award, level-up
 * stat window, prize money), shared by BOTH battle hosts: BattleView
 * (components/views/BattleView.tsx) and the WorldEngine inline battle
 * (world/WorldEngine.tsx). Before this module the two hosts diverged
 * badly: BattleView granted EXP instantly with two log lines and no
 * presentation at all; WorldEngine wrote wild-battle XP into a dead
 * `xp` field nothing reads (levels never changed) and credited trainer
 * money silently with no text and no XP. Audit: ~/workspace/battle-payoff/AUDIT.md.
 *
 * The sequence and the compute are ported from the held source code
 * (construction-kit: systems come over, presentation is ours):
 *  - Compute: pokeheartgold src/battle/battle_command.c
 *    BtlCmd_CalcExpGain — totalExp = baseExpYield * foeLevel / 7,
 *    split equally among alive participants (floor, min 1);
 *    trainer battles multiply each recipient's award by 150/100.
 *    No Exp. Share branch: our game has no held items at all, so
 *    none is invented.
 *  - Sequence: pokeheartgold Task_GetExp (same file) — per recipient,
 *    per fainted foe: "gained Exp. Points!" -> EXP gauge sweep (active
 *    battler only) -> per level: "grew to Lv." + fanfare -> stat
 *    summary window (+diffs, press, true values, press) -> loop back
 *    to the gauge for the next level. NO summary shortcut: a
 *    multi-level award plays one full beat per level, player-paced.
 *  - Capture pays no EXP (Gen 5 rule — EXP on capture is Gen 6;
 *    pokeblack is the presentation model generation).
 *
 * This module is pure planning + commit math. It never touches the
 * store or the DOM: hosts apply commits through the functions here
 * (commitRecipientExp / commitNextLevel) at the beats the sequence
 * component (components/game/BattlePayoffSequence.tsx) fires, and
 * write the mutated instance back with their own update path — the
 * same pattern BattleView already used with engine.gainExp.
 */
import { MochiiInstance } from './types';
import { SPECIES_DB } from './species';
import { calculateStat, getExpNeeded } from './engine';

/**
 * Sound cues for the payoff, named after the real sequences they
 * recreate (our own synth renditions in lib/audio-system.ts — no
 * source audio or note data is copied; what comes over is the system:
 * an ME fanfare fired by the level-up message, once per level).
 *
 * levelUpFanfare — SEQ_ME_LVUP:
 *   Pokemon Black wb_sound_data.sdat, SYMB SEQ table: SEQ 1301 (0x515).
 *   HeartGold gs_sound_data.sdat: SEQ 1184 (0x4A0); decomp constant
 *   include/constants/sndseq.h:192 `#define SEQ_ME_LVUP 1184`; fired by
 *   PlayFanfare(SEQ_ME_LVUP) from the "grew to Lv." message's control
 *   glyph (pokeheartgold src/battle/battle_system.c). In our audio
 *   system this is the existing 'levelup' SfxName.
 * victoryJingle — the win music that starts WITH the payoff:
 *   wild: HGSS Task_GetExp plays SEQ_GS_WIN2 the moment all enemy HP
 *   are 0, before the first EXP message. Black's bank carries the win
 *   themes as SEQ_BGM_WIN1..WIN6 (SEQ 1148-1152, 1169). Ours is
 *   audio.playVictoryJingle() (SYNTH_PATTERNS.victory).
 * pressSelect — SEQ_SE_DP_SELECT, played by the source on every
 *   button press that advances the stat summary window. Ours is the
 *   'select' SfxName.
 */
export const PAYOFF_SOUND_CUES = {
  levelUpFanfare: { sourceName: 'SEQ_ME_LVUP', blackSeq: 1301, heartGoldSeq: 1184, sfxName: 'levelup' },
  victoryJingle: { sourceName: 'SEQ_GS_WIN2 / SEQ_BGM_WIN*', sfxName: null },
  pressSelect: { sourceName: 'SEQ_SE_DP_SELECT', sfxName: 'select' },
} as const;

/** The six stats the level-up summary window shows, in source order. */
export const PAYOFF_STAT_ROWS = [
  { key: 'maxHp', label: 'Max HP' },
  { key: 'atk', label: 'Attack' },
  { key: 'def', label: 'Defense' },
  { key: 'spa', label: 'Sp. Atk' },
  { key: 'spd', label: 'Sp. Def' },
  { key: 'spe', label: 'Speed' },
] as const;

export type PayoffStatKey = (typeof PAYOFF_STAT_ROWS)[number]['key'];

export interface StatBlock {
  maxHp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export function statBlockOf(m: MochiiInstance): StatBlock {
  return {
    maxHp: m.maxHp,
    atk: m.stats.atk,
    def: m.stats.def,
    spa: m.stats.spa,
    spd: m.stats.spd,
    spe: m.stats.spe,
  };
}

/** Cumulative total EXP required to BE `level` (engine curve: level^3). */
export function expTotalForLevel(level: number, growthRate: string): number {
  return getExpNeeded(level, growthRate);
}

/** Progress of `exp` inside `level`: into / span / fraction (0..1). */
export function expProgressInLevel(
  exp: number,
  level: number,
  growthRate: string,
): { into: number; span: number; frac: number } {
  if (level >= 100) return { into: 0, span: 1, frac: 1 };
  const start = expTotalForLevel(level, growthRate);
  const span = Math.max(1, expTotalForLevel(level + 1, growthRate) - start);
  const into = Math.min(span, Math.max(0, exp - start));
  return { into, span, frac: into / span };
}

/**
 * Total EXP a fainted foe yields, before splitting — the source
 * compute (BtlCmd_CalcExpGain): baseExpYield * level / 7.
 */
export function calcExpPool(baseExpYield: number, foeLevel: number): number {
  return Math.floor((baseExpYield * foeLevel) / 7);
}

/** One gauge segment: the bar sweeps `from` -> `to` (fractions of the
 *  then-current level's span). `crossesLevel` segments end exactly on
 *  a level boundary and are followed by that level's full beat. */
export interface ExpSegment {
  from: number;
  to: number;
  crossesLevel: boolean;
  /** Level this segment's sweep belongs to (the level being filled). */
  forLevel: number;
}

export interface LevelUpStep {
  toLevel: number;
  before: StatBlock;
  after: StatBlock;
  /** Current HP rises by the Max HP difference at level-up (the
   *  source rule, and what engine.gainExp already does). */
  hpGain: number;
}

export interface RecipientPlan {
  partyIndex: number;
  nickname: string;
  /** This recipient's share of the pool (post-split, post-trainer-x1.5). */
  expAwarded: number;
  startLevel: number;
  startExp: number;
  startHp: number;
  startMaxHp: number;
  /** Gauge segments in play order; a level-up beat follows every
   *  segment with crossesLevel = true. */
  segments: ExpSegment[];
  /** One entry per level gained, in order. */
  levelUps: LevelUpStep[];
  endLevel: number;
  endExp: number;
  /** Only the active battler's gauge animates in the source; benched
   *  recipients' awards land without a sweep. */
  animateGauge: boolean;
}

export interface PayoffPlan {
  /** The unsplit pool for the fainted foe (0 when nothing is owed). */
  expPool: number;
  recipients: RecipientPlan[];
  /** Where the victory jingle fires: 'start' = with the first EXP
   *  beat (wild battle over, per HGSS Task_GetExp), 'beforeMoney' =
   *  after the last recipient, as the money line lands (trainer
   *  victory), null = this faint does not end the battle. */
  victoryCueAt: 'start' | 'beforeMoney' | null;
}

export interface PayoffFoe {
  speciesId: string;
  level: number;
}

export interface PayoffOptions {
  /** Party indices that participated against this foe (source:
   *  entered battle against it). Fainted / Lv.100 / ineligible
   *  members are filtered out here, never by the caller. */
  participants: number[];
  /** The party index currently on screen as the active battler. */
  activeIndex: number;
  trainerBattle: boolean;
  /** True when this faint ends the whole battle. */
  endsBattle: boolean;
  /** Composition seat (landing-composition, 2026-10-29) for the
   * DOUBLE EXP cheat (cheat-expansion): hosts pass the store's
   * expMultiplier (1 normally, 2 while the code is on). Absent or 1
   * = the source behaviour exactly; the planner stays pure and the
   * cheat flag stays store-owned, like every other cheat read. */
  expMultiplier?: number;
}

const EMPTY_PLAN: PayoffPlan = { expPool: 0, recipients: [], victoryCueAt: null };

/**
 * Could this party member take a payoff at all? Real store instances
 * (speciesId + stats + experience) can; WorldEngine's legacy flat
 * battle shapes (makeBattleMon templates: no speciesId-keyed stats,
 * no experience field) cannot — the host keeps its old behaviour for
 * those and this module stays silent, rather than inventing stats.
 */
export function isPayoffEligibleMember(m: unknown): m is MochiiInstance {
  if (!m || typeof m !== 'object') return false;
  const o = m as Record<string, unknown>;
  return (
    typeof o.speciesId === 'string' &&
    typeof o.experience === 'number' &&
    typeof o.level === 'number' &&
    typeof o.hp === 'number' &&
    !!o.stats &&
    typeof o.stats === 'object' &&
    typeof (o.stats as Record<string, unknown>).atk === 'number'
  );
}

function cloneInstance(m: MochiiInstance): MochiiInstance {
  return { ...m, stats: { ...m.stats }, stages: { ...m.stages }, moves: [...m.moves], pp: [...m.pp] };
}

/** Commit beat 1: the EXP total lands on the instance (source commits
 *  the new EXP total before the message prints). Levels do NOT move
 *  here — each level commits separately at its own beat. */
export function commitRecipientExp(m: MochiiInstance, amount: number): void {
  m.experience += amount;
}

/**
 * Commit exactly ONE level-up, using the engine's own stat math
 * (calculateStat with the same IV 15 / EV 0 constants gainExp and
 * createMochii use), so a level committed through the payoff is
 * identical to one committed by engine.gainExp. Returns the step
 * (before/after) or null when no level is owed / already Lv.100 /
 * EXP has not crossed the boundary yet.
 */
export function commitNextLevel(m: MochiiInstance): LevelUpStep | null {
  const species = SPECIES_DB[m.speciesId];
  if (!species || m.level >= 100) return null;
  if (m.experience < getExpNeeded(m.level + 1, species.growthRate)) return null;
  const before = statBlockOf(m);
  const hpBefore = m.hp;
  m.level += 1;
  const calcHp = calculateStat(species.baseStats.hp, 15, 0, m.level, true);
  const hpDiff = calcHp - m.maxHp;
  m.maxHp = calcHp;
  m.hp += hpDiff;
  m.stats.atk = calculateStat(species.baseStats.atk, 15, 0, m.level, false);
  m.stats.def = calculateStat(species.baseStats.def, 15, 0, m.level, false);
  m.stats.spa = calculateStat(species.baseStats.spa, 15, 0, m.level, false);
  m.stats.spd = calculateStat(species.baseStats.spd, 15, 0, m.level, false);
  m.stats.spe = calculateStat(species.baseStats.spe, 15, 0, m.level, false);
  return { toLevel: m.level, before, after: statBlockOf(m), hpGain: m.hp - hpBefore };
}

/**
 * Plan one fainted foe's payoff. Pure: the party is not mutated — the
 * simulation runs the real commit functions on clones, so the plan
 * the player watches and the state the host commits cannot drift.
 */
export function planExpAward(
  party: readonly unknown[],
  foe: PayoffFoe,
  opts: PayoffOptions,
): PayoffPlan {
  const foeSpecies = SPECIES_DB[foe.speciesId];
  if (!foeSpecies) return EMPTY_PLAN;

  const pool = Math.floor(
    calcExpPool(foeSpecies.baseExpYield, foe.level) * (opts.expMultiplier ?? 1),
  );
  if (pool <= 0) return { ...EMPTY_PLAN, expPool: 0 };

  const eligible = opts.participants.filter(idx => {
    const m = party[idx];
    return isPayoffEligibleMember(m) && m.hp > 0 && m.level < 100;
  });
  if (eligible.length === 0) return { expPool: pool, recipients: [], victoryCueAt: null };

  // Source split: equal shares, floor, minimum 1 (BtlCmd_CalcExpGain);
  // trainer battles then scale each recipient's award by 150/100
  // (Task_GetExp START state).
  let share = Math.floor(pool / eligible.length);
  if (share === 0) share = 1;
  if (opts.trainerBattle) share = Math.floor((share * 150) / 100);

  const recipients: RecipientPlan[] = eligible.map(idx => {
    const src = party[idx] as MochiiInstance;
    const sim = cloneInstance(src);
    const startLevel = sim.level;
    const startExp = sim.experience;
    commitRecipientExp(sim, share);

    const segments: ExpSegment[] = [];
    const levelUps: LevelUpStep[] = [];
    // Walk the level boundaries exactly as the live commit will:
    // fill to the boundary, level, continue with the remainder.
    for (;;) {
      const rate = SPECIES_DB[sim.speciesId]?.growthRate ?? 'Medium Fast';
      const prog = expProgressInLevel(sim.experience, sim.level, rate);
      const owed = commitNextLevel(sim);
      if (!owed) {
        segments.push({ from: segments.length ? 0 : expProgressInLevel(startExp, startLevel, rate).frac, to: prog.frac, crossesLevel: false, forLevel: sim.level });
        break;
      }
      segments.push({
        from: segments.length ? 0 : expProgressInLevel(startExp, startLevel, rate).frac,
        to: 1,
        crossesLevel: true,
        forLevel: owed.toLevel - 1,
      });
      levelUps.push(owed);
      if (sim.level >= 100) break;
    }
    // A recipient whose award does not move the bar at all (already
    // counted) still gets their text beat; a zero-length final segment
    // is fine — the component renders it as a held bar.
    return {
      partyIndex: idx,
      nickname: src.nickname,
      expAwarded: share,
      startLevel,
      startExp,
      startHp: src.hp,
      startMaxHp: src.maxHp,
      segments,
      levelUps,
      endLevel: sim.level,
      endExp: sim.experience,
      animateGauge: idx === opts.activeIndex,
    };
  });

  return {
    expPool: pool,
    recipients,
    victoryCueAt: opts.endsBattle ? (opts.trainerBattle ? 'beforeMoney' : 'start') : null,
  };
}

/**
 * Battle outcomes that never produce a payoff. Capture is the Gen 5
 * rule (no EXP for a caught foe — EXP on capture arrived in Gen 6,
 * and Gen 5 is the model generation); flee and loss pay nothing in
 * every generation on disk. Hosts call planExpAward only for 'won'
 * faints; this guard exists so the rule is testable, not folklore.
 */
export type BattleOutcome = 'foeFainted' | 'caught' | 'fled' | 'lost';
export function planForOutcome(
  outcome: BattleOutcome,
  party: readonly unknown[],
  foe: PayoffFoe,
  opts: PayoffOptions,
): PayoffPlan {
  if (outcome !== 'foeFainted') return EMPTY_PLAN;
  return planExpAward(party, foe, opts);
}

/**
 * The money beat's grammar: prize money exists only when a trainer
 * was beaten (source: CalcPrizeMoney runs off trainer data; wild
 * faints pay nothing). The AMOUNT is the game's own data (trainer
 * row reward / host rule) — this function decides only whether the
 * beat exists, never the number. A host with a standing canon reward
 * of its own (BattleView's flat 50) passes its amount explicitly and
 * owns that exception; hosts following the source grammar pass
 * kind 'trainer' | 'wild' here.
 */
export function moneyBeatFor(
  kind: 'trainer' | 'wild',
  amount: number,
): { amount: number } | null {
  if (kind !== 'trainer' || amount <= 0) return null;
  return { amount };
}
