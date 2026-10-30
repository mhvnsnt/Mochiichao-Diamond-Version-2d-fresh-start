import { describe, it, expect } from 'vitest';
import {
  PHASE_BY_HOUR,
  phaseForHour,
  gamePhaseOf,
  wildPhaseOf,
  isNightPhase,
  deriveWorldState,
  checkRollover,
  freezeStateAt,
  newGameAnchor,
  isDiamondDustKey,
  sunFactsForState,
  DEFAULT_WORLD_CLOCK_CONFIG,
  type WorldClockAnchor,
} from './worldClock';

const anchor = (gameMinutes: number, realMs = 0): WorldClockAnchor => ({
  anchorRealMs: realMs,
  anchorGameMinutes: gameMinutes,
  lastSeenDayIndex: 0,
});

describe('worldClock phase table (Gen 4, CLOCK §1.4.1)', () => {
  it('has 24 entries with the decomp boundaries', () => {
    expect(PHASE_BY_HOUR).toHaveLength(24);
    expect(phaseForHour(0)).toBe('late');
    expect(phaseForHour(3)).toBe('late');
    expect(phaseForHour(4)).toBe('morn');
    expect(phaseForHour(9)).toBe('morn');
    expect(phaseForHour(10)).toBe('day');
    expect(phaseForHour(16)).toBe('day');
    // The boundary menuCustom.ts got wrong by one hour:
    expect(phaseForHour(17)).toBe('eve');
    expect(phaseForHour(19)).toBe('eve');
    expect(phaseForHour(20)).toBe('nite');
    expect(phaseForHour(23)).toBe('nite');
    expect(phaseForHour(24)).toBe('late');
    expect(phaseForHour(-1)).toBe('nite');
  });

  it('folds five phases into the game and wild vocabularies', () => {
    expect(gamePhaseOf('late')).toBe('night');
    expect(gamePhaseOf('morn')).toBe('dawn');
    expect(gamePhaseOf('day')).toBe('day');
    expect(gamePhaseOf('eve')).toBe('dusk');
    expect(gamePhaseOf('nite')).toBe('night');
    expect(wildPhaseOf('morn')).toBe('morn');
    expect(wildPhaseOf('day')).toBe('day');
    expect(wildPhaseOf('eve')).toBe('day');
    expect(wildPhaseOf('nite')).toBe('nite');
    expect(wildPhaseOf('late')).toBe('nite');
    expect(isNightPhase('nite')).toBe(true);
    expect(isNightPhase('late')).toBe(true);
    expect(isNightPhase('eve')).toBe(false);
    expect(isNightPhase('morn')).toBe(false);
  });
});

describe('deriveWorldState', () => {
  it('is pure: same anchor + same nowMs = same state', () => {
    const a = anchor(600, 1000000);
    const s1 = deriveWorldState(a, 1000000 + 15000);
    const s2 = deriveWorldState(a, 1000000 + 15000);
    expect(s1).toEqual(s2);
    expect(s1.format).toBe('mochiichao/world-state/v1');
    expect(s1.hour).toBe(11);
    expect(s1.phase).toBe('day');
    expect(s1.gamePhase).toBe('day');
    expect(s1.wildPhase).toBe('day');
    expect(s1.isNight).toBe(false);
  });

  it('preserves the old start: a new-game anchor reads 10:00 day 0', () => {
    const a = newGameAnchor(5000);
    const s = deriveWorldState(a, 5000);
    expect(s.dayIndex).toBe(0);
    expect(s.hour).toBe(10);
    expect(s.minute).toBe(0);
    expect(s.phase).toBe('day');
    expect(s.weekday).toBe(0);
    expect(s.month).toBe(1);
    expect(s.dayOfMonth).toBe(1);
    expect(s.season).toBe('spring');
  });

  it('advances at the preserved rate: 15 real seconds = 1 game hour', () => {
    const a = anchor(600, 0);
    // 4 game-minutes per real second; 15 s -> +60 game minutes.
    expect(deriveWorldState(a, 15000).hour).toBe(11);
    expect(deriveWorldState(a, 15000).totalGameMinutes).toBe(660);
  });

  it('rolls the day and the weekday after 1440 game minutes', () => {
    const a = anchor(600, 0);
    // 840 more game minutes = day 1, 00:00 (600 + 840 = 1440).
    const s = deriveWorldState(a, 210000);
    expect(s.dayIndex).toBe(1);
    expect(s.hour).toBe(0);
    expect(s.phase).toBe('late');
    expect(s.weekday).toBe(1);
  });

  it('derives the staged BW2 season from the month, never stored', () => {
    // Day 31 of the year = Feb 1 (31 Jan days + 1): (2-1)%4 = summer.
    const a = anchor(31 * 1440, 0);
    const s = deriveWorldState(a, 0);
    expect(s.month).toBe(2);
    expect(s.dayOfMonth).toBe(1);
    expect(s.season).toBe('summer');
    // Day 365 = Dec 31: (12-1)%4 = winter.
    const dec = deriveWorldState(anchor(364 * 1440, 0), 0);
    expect(dec.month).toBe(12);
    expect(dec.dayOfMonth).toBe(31);
    expect(dec.season).toBe('winter');
  });

  it('clamps a backwards device clock to the anchor time', () => {
    const a = anchor(600, 1000000);
    const s = deriveWorldState(a, 500000);
    expect(s.hour).toBe(10);
    expect(s.totalGameMinutes).toBe(600);
  });

  it('never returns weather', () => {
    const s = deriveWorldState(anchor(600, 0), 0);
    expect('weather' in s).toBe(false);
  });
});

describe('checkRollover / freezeStateAt / date keys', () => {
  it('reports daysPassed once and advances lastSeenDayIndex', () => {
    const a = anchor(600, 0);
    const s = deriveWorldState(a, 210000); // day 1
    const r = checkRollover(a, s);
    expect(r.daysPassed).toBe(1);
    expect(r.nextAnchor.lastSeenDayIndex).toBe(1);
    // A second read against the advanced anchor reports zero.
    expect(checkRollover(r.nextAnchor, s).daysPassed).toBe(0);
  });

  it('freezeStateAt pins hour/minute and leaves the anchor untouched', () => {
    const a = anchor(600, 0);
    const s = deriveWorldState(a, 0);
    const f = freezeStateAt(s, 21, 30);
    expect(f.hour).toBe(21);
    expect(f.minute).toBe(30);
    expect(f.phase).toBe('nite');
    expect(f.gamePhase).toBe('night');
    expect(deriveWorldState(a, 0).hour).toBe(10);
  });

  it('recognises exactly the eight HGSS diamond-dust dates', () => {
    const base = anchor(0, 0);
    const at = (dayIndex: number) => deriveWorldState({ ...base, anchorGameMinutes: dayIndex * 1440 }, 0);
    expect(isDiamondDustKey(at(0))).toBe(true); // Jan 1
    expect(isDiamondDustKey(at(30))).toBe(true); // Jan 31
    expect(isDiamondDustKey(at(31))).toBe(true); // Feb 1
    // Feb 29 is NOT reachable under the default synthetic calendar
    // (Feb has 28 days; a leap-aware calendar config is the owner
    // calendar slot that would make it fire) — so it is not asserted.
    expect(isDiamondDustKey(at(73))).toBe(true); // Mar 15
    expect(isDiamondDustKey(at(1))).toBe(false);
    expect(isDiamondDustKey(at(100))).toBe(false);
  });

  it('sun facts are up by day, down at night, with no interior tint on offer', () => {
    const day = deriveWorldState(anchor(12 * 60, 0), 0);
    const night = deriveWorldState(anchor(0, 0), 0);
    expect(sunFactsForState(day).isUp).toBe(true);
    expect(sunFactsForState(day).elevationDeg).toBeGreaterThan(0);
    expect(sunFactsForState(night).isUp).toBe(false);
    expect(sunFactsForState(night).elevationDeg).toBeLessThan(0);
  });
});

describe('worldClock config', () => {
  it('defaults preserve current behaviour and the 7-day week', () => {
    expect(DEFAULT_WORLD_CLOCK_CONFIG.gameMinutesPerRealSecond).toBe(4);
    expect(DEFAULT_WORLD_CLOCK_CONFIG.daysPerWeek).toBe(7);
    expect(DEFAULT_WORLD_CLOCK_CONFIG.seasonMode).toBe('per-month');
  });
});
