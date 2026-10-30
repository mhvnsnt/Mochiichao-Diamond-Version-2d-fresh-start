import { describe, it, expect } from 'vitest';
import { createMochii, gainExp } from './engine';
import { SPECIES_DB } from './species';
import {
  calcExpPool,
  commitNextLevel,
  commitRecipientExp,
  expProgressInLevel,
  isPayoffEligibleMember,
  moneyBeatFor,
  planExpAward,
  planForOutcome,
  statBlockOf,
} from './battlePayoff';

// A real species with a known yield for arithmetic checks.
const FOE_ID = Object.keys(SPECIES_DB)[0];
const FOE_YIELD = SPECIES_DB[FOE_ID].baseExpYield;

function member(level: number, hpPct = 1) {
  const m = createMochii(FOE_ID, level)!;
  m.hp = Math.max(1, Math.floor(m.maxHp * hpPct));
  return m;
}

describe('calcExpPool — source compute (HGSS BtlCmd_CalcExpGain)', () => {
  it('is baseExpYield * level / 7, floored', () => {
    expect(calcExpPool(64, 7)).toBe(64);
    expect(calcExpPool(64, 5)).toBe(Math.floor((64 * 5) / 7));
    expect(calcExpPool(FOE_YIELD, 10)).toBe(Math.floor((FOE_YIELD * 10) / 7));
  });
});

describe('planExpAward — distribution', () => {
  it('splits the pool equally among alive participants, floor, min 1', () => {
    const party = [member(5), member(5), member(5)];
    const plan = planExpAward(party, { speciesId: FOE_ID, level: 5 }, {
      participants: [0, 1], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    const pool = calcExpPool(FOE_YIELD, 5);
    expect(plan.expPool).toBe(pool);
    expect(plan.recipients.map(r => r.partyIndex)).toEqual([0, 1]);
    for (const r of plan.recipients) expect(r.expAwarded).toBe(Math.max(1, Math.floor(pool / 2)));
    // Non-participant gets nothing.
    expect(plan.recipients.find(r => r.partyIndex === 2)).toBeUndefined();
  });

  it('trainer battles scale each award by 150/100', () => {
    const party = [member(5)];
    const wild = planExpAward(party, { speciesId: FOE_ID, level: 20 }, {
      participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    const trainer = planExpAward(party, { speciesId: FOE_ID, level: 20 }, {
      participants: [0], activeIndex: 0, trainerBattle: true, endsBattle: true,
    });
    expect(trainer.recipients[0].expAwarded).toBe(Math.floor((wild.recipients[0].expAwarded * 150) / 100));
    expect(trainer.victoryCueAt).toBe('beforeMoney');
    expect(wild.victoryCueAt).toBe('start');
  });

  it('a fainted participant gains nothing and is skipped silently', () => {
    const dead = member(5);
    dead.hp = 0;
    const party = [member(5), dead];
    const plan = planExpAward(party, { speciesId: FOE_ID, level: 5 }, {
      participants: [0, 1], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    expect(plan.recipients.map(r => r.partyIndex)).toEqual([0]);
    // The whole pool goes to the only eligible recipient (split among eligible).
    expect(plan.recipients[0].expAwarded).toBe(Math.max(1, plan.expPool));
  });

  it('level 100 members are excluded', () => {
    const party = [member(100)];
    const plan = planExpAward(party, { speciesId: FOE_ID, level: 50 }, {
      participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    expect(plan.recipients).toEqual([]);
  });

  it('only the active battler animates the gauge', () => {
    const party = [member(5), member(5)];
    const plan = planExpAward(party, { speciesId: FOE_ID, level: 5 }, {
      participants: [0, 1], activeIndex: 1, trainerBattle: false, endsBattle: false,
    });
    expect(plan.recipients[0].animateGauge).toBe(false);
    expect(plan.recipients[1].animateGauge).toBe(true);
    expect(plan.victoryCueAt).toBeNull();
  });
});

describe('multi-level awards — one full beat per level, no summary', () => {
  it('splits a 3-level award into boundary segments + per-level steps', () => {
    const m = member(5);
    // Pool big enough for exactly ~3 levels: foe level 100 of a rich species.
    const rich = Object.values(SPECIES_DB).sort((a, b) => b.baseExpYield - a.baseExpYield)[0];
    const plan = planExpAward([m], { speciesId: rich.id, level: 100 }, {
      participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    const r = plan.recipients[0];
    expect(r.levelUps.length).toBeGreaterThanOrEqual(3);
    // Segments: one crossing segment per level-up, then one final partial.
    expect(r.segments.filter(s => s.crossesLevel).length).toBe(r.levelUps.length);
    expect(r.segments[r.segments.length - 1].crossesLevel).toBe(false);
    // Levels are consecutive, one at a time.
    r.levelUps.forEach((s, i) => expect(s.toLevel).toBe(6 + i));
    expect(r.endLevel).toBe(5 + r.levelUps.length);
  });

  it('committing the plan stepwise lands exactly where engine.gainExp lands', () => {
    const a = member(5);
    const b = member(5);
    const rich = Object.values(SPECIES_DB).sort((x, y) => y.baseExpYield - x.baseExpYield)[0];
    const plan = planExpAward([a], { speciesId: rich.id, level: 100 }, {
      participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    const r = plan.recipients[0];
    // Live-commit path the hosts run: exp first, then one level per beat.
    commitRecipientExp(a, r.expAwarded);
    let step = commitNextLevel(a);
    let count = 0;
    while (step) { count++; step = commitNextLevel(a); }
    gainExp(b, r.expAwarded);
    expect(count).toBe(r.levelUps.length);
    expect(a.level).toBe(b.level);
    expect(a.experience).toBe(b.experience);
    expect(a.maxHp).toBe(b.maxHp);
    expect(a.hp).toBe(b.hp);
    expect(statBlockOf(a)).toEqual(statBlockOf(b));
    // And the plan's recorded after-state matches the committed state.
    expect(r.levelUps[r.levelUps.length - 1].after).toEqual(statBlockOf(a));
    expect(r.endExp).toBe(a.experience);
  });

  it('stat window data: before/after deltas are the real gains, HP rises by the max-HP diff', () => {
    const m = member(5);
    const plan = planExpAward([m], { speciesId: FOE_ID, level: 90 }, {
      participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true,
    });
    const r = plan.recipients[0];
    expect(r.levelUps.length).toBeGreaterThanOrEqual(1);
    const s = r.levelUps[0];
    for (const k of ['maxHp', 'atk', 'def', 'spa', 'spd', 'spe'] as const) {
      expect(s.after[k]).toBeGreaterThanOrEqual(s.before[k]);
    }
    expect(s.hpGain).toBe(s.after.maxHp - s.before.maxHp);
  });
});

describe('outcomes that pay nothing (Gen 5 rules)', () => {
  const party = [member(5)];
  const foe = { speciesId: FOE_ID, level: 10 };
  const opts = { participants: [0], activeIndex: 0, trainerBattle: false, endsBattle: true };
  it('capture pays no EXP', () => {
    expect(planForOutcome('caught', party, foe, opts).recipients).toEqual([]);
  });
  it('fleeing pays nothing', () => {
    expect(planForOutcome('fled', party, foe, opts).recipients).toEqual([]);
  });
  it('losing pays nothing', () => {
    expect(planForOutcome('lost', party, foe, opts).recipients).toEqual([]);
  });
  it('a faint pays out', () => {
    expect(planForOutcome('foeFainted', party, foe, opts).recipients.length).toBe(1);
  });
});

describe('money beat grammar', () => {
  it('exists only for trainer victories, amount untouched', () => {
    expect(moneyBeatFor('trainer', 240)).toEqual({ amount: 240 });
    expect(moneyBeatFor('wild', 240)).toBeNull();
    expect(moneyBeatFor('trainer', 0)).toBeNull();
  });
});

describe('eligibility — WorldEngine flat shapes stay silent', () => {
  it('real instances are eligible; makeBattleMon-style flat shapes are not', () => {
    expect(isPayoffEligibleMember(member(5))).toBe(true);
    expect(isPayoffEligibleMember({ id: 3, name: 'Tyrage', level: 5, maxHp: 40, currentHp: 40, atk: 69 })).toBe(false);
    expect(isPayoffEligibleMember(null)).toBe(false);
  });
});

describe('expProgressInLevel', () => {
  it('tracks the cubic curve', () => {
    const rate = SPECIES_DB[FOE_ID].growthRate;
    expect(expProgressInLevel(125, 5, rate).frac).toBe(0);
    expect(expProgressInLevel(216, 6, rate).frac).toBe(0);
    const mid = expProgressInLevel(125 + 45, 5, rate);
    expect(mid.into).toBe(45);
    expect(mid.span).toBe(216 - 125);
    expect(expProgressInLevel(999999, 100, rate).frac).toBe(1);
  });
});
