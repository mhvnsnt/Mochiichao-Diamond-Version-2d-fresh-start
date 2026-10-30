/**
 * World clock — the ONE producer of world time (#19).
 *
 * Gap-fill S1 (CLOCK-FROM-POKEMON §3). Pure and renderer-free: no
 * React, no Pixi, no store imports. The store holds only the anchor
 * (see WorldClockAnchor); everything else is derived from the anchor
 * plus a real timestamp, so the same anchor + same nowMs always
 * gives the same state, everywhere.
 *
 * Patterns translated from the decomp files read for the audit
 * (structure and tables only — no donor code, art, or text copied):
 *   pret-pokeheartgold src/gf_rtc.c — the 24-entry phase table
 *     (sTimeOfDayByHour), the wild-param fold, IsNighttime;
 *     include/gf_rtc.h enums.
 *   pret-pokeplatinum src/rtc.c + src/unk_020559DC.c — the cached
 *     snapshot, FieldSystem_Get* readers, daysPassed fan-out.
 *   pret-pokeemerald src/rtc.c + src/clock.c — the offset/anchor
 *     model, per-day + per-minute deltas.
 *   pret-pokecrystal home/time.asm + engine/rtc/rtc.asm — the
 *     day-counter weekday (day mod 7), the 140-day wrap lesson.
 * Season formula is DOCS/staged, not code: see BLACK2_SEASON_CLOCK
 * in filled-from-source.ts ("season = (month - 1) % 4"). The season
 * PERIOD and the calendar/week shapes are owner slots, carried here
 * as config, never canonised in code.
 *
 * Weather is deliberately ABSENT from the output: the clock supplies
 * date/time keys; map/weather code resolves weather from map data
 * keyed by those keys (Gen 4 pattern). Consumers join the two.
 *
 * Interior regime (owner rule 2026-10-29 ~19:39 CDT, CLOCK §7):
 * the clock offers NO interior global tint. Interiors read sun
 * facts only (sunFactsForState: angle/colour/intensity per
 * phase + minute-of-day) — the light-ray lane owns apertures and
 * geometry. The canvas global tint is exterior-only, gated by the
 * map's own `interior` flag at the render site.
 */

/** The five Gen 4 phases, Diamond/HGSS names. */
export type Phase = 'late' | 'morn' | 'day' | 'eve' | 'nite';
/** The game's standing 4-bucket vocabulary: the fold of Phase. */
export type GamePhase = 'dawn' | 'day' | 'dusk' | 'night';
/** Encounter buckets (HGSS wild-param fold). */
export type WildPhase = 'morn' | 'day' | 'nite';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Gen 4 phase table, verbatim as data (gf_rtc.c sTimeOfDayByHour —
 * Diamond, Platinum and HGSS agree, CLOCK §1.4.1):
 * LATE 00–03, MORN 04–09, DAY 10–16, EVE 17–19, NITE 20–23.
 * This is the table menuCustom.ts previously transcribed one hour
 * late (DAY 10–17 / EVE 18–20 / NITE 21–23); S1 corrects that file
 * to match this table in the same landing.
 */
export const PHASE_BY_HOUR: readonly Phase[] = [
  'late', 'late', 'late', 'late', // 0-3
  'morn', 'morn', 'morn', 'morn', 'morn', 'morn', // 4-9
  'day', 'day', 'day', 'day', 'day', 'day', 'day', // 10-16
  'eve', 'eve', 'eve', // 17-19
  'nite', 'nite', 'nite', 'nite', // 20-23
];

export function phaseForHour(hour: number): Phase {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  return PHASE_BY_HOUR[h];
}

/** late|nite -> night, morn -> dawn, day -> day, eve -> dusk. */
export function gamePhaseOf(phase: Phase): GamePhase {
  switch (phase) {
    case 'morn': return 'dawn';
    case 'day': return 'day';
    case 'eve': return 'dusk';
    case 'late':
    case 'nite':
    default: return 'night';
  }
}

/** morn -> morn, day|eve -> day, nite|late -> nite (wild-param fold). */
export function wildPhaseOf(phase: Phase): WildPhase {
  switch (phase) {
    case 'morn': return 'morn';
    case 'day':
    case 'eve': return 'day';
    case 'nite':
    case 'late':
    default: return 'nite';
  }
}

/** IsNighttime: nite | late only — morning/evening are not night. */
export function isNightPhase(phase: Phase): boolean {
  return phase === 'nite' || phase === 'late';
}

/**
 * What little is stored. Lives on the game store (one field,
 * `worldClock`), so saveSystem serialises it with the game like
 * every other store field. Everything else in this module is
 * derived from this + the current real timestamp.
 */
export interface WorldClockAnchor {
  /** Real time (Date.now(), ms) at which the anchor was set. */
  anchorRealMs: number;
  /**
   * Total elapsed game minutes at anchorRealMs, counted from the
   * save's game epoch (day 0, 00:00). The ONE running total; day,
   * hour, weekday, season are all arithmetic on this number.
   */
  anchorGameMinutes: number;
  /**
   * Day index last observed by the rollover site. Gen 4's stored
   * day number, kept for exactly the same reason: so daysPassed
   * can be computed once, at one site, after time away.
   */
  lastSeenDayIndex: number;
}

/** Rate and calendar parameters — config, not save state. */
export interface WorldClockConfig {
  /**
   * Game minutes per real second. TODAY'S engine rate (1 game
   * hour / 15 s) = 4. Pokémon's real-RTC rate = 1/60. OWNER SLOT —
   * this default only preserves current behaviour.
   */
  gameMinutesPerRealSecond: number;
  /** Week length. Pokémon default in every generation: 7. OWNER SLOT. */
  daysPerWeek: number;
  /**
   * Weekday index of game day 0. With the Pokémon 7-day default,
   * 0 = Sunday (RTCWeek / Gen 2 SUNDAY = 0). OWNER SLOT.
   */
  epochWeekday: number;
  /**
   * Synthetic calendar for month/day/season derivation: month
   * lengths of the game year. OWNER SLOT — candidate fill below
   * is real-calendar month lengths with the Gen 4 leap rule,
   * recorded, not decided.
   */
  monthLengths: readonly number[];
  /**
   * Season period shape. 'per-month' = the staged BW2 formula
   * (month-1)%4; 'per-days' = a fixed game-days-per-season count.
   * OWNER SLOT — the module accepts either, decides neither.
   */
  seasonMode: 'per-month' | 'per-days';
  seasonDays?: number;
}

export const DEFAULT_WORLD_CLOCK_CONFIG: WorldClockConfig = {
  gameMinutesPerRealSecond: 4,
  daysPerWeek: 7,
  epochWeekday: 0,
  monthLengths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  seasonMode: 'per-month',
};

const SEASONS: readonly Season[] = ['spring', 'summer', 'autumn', 'winter'];

/** The #19 value. Format: mochiichao/world-state/v1. A READING, not
 *  a record: computed from an anchor + a real timestamp, never
 *  stored. Weather is deliberately absent (see header). */
export interface WorldState {
  format: 'mochiichao/world-state/v1';
  /** Days since the save's game epoch. Monotonic within a save. */
  dayIndex: number;
  minuteOfDay: number; // 0..1439
  hour: number;
  minute: number;
  secondsSinceMidnight: number; // GF_RTC_TimeToSec shape
  phase: Phase;
  gamePhase: GamePhase;
  wildPhase: WildPhase;
  isNight: boolean;
  /** 0-based weekday index (0 = first day of the week shape). */
  weekday: number;
  /** Position inside the synthetic calendar. */
  dayOfYear: number; // 1-based, GF_RTC_GetDayOfYear shape
  month: number; // 1-based
  dayOfMonth: number; // 1-based
  season: Season;
  /** Total elapsed game minutes — the per-minute delta source. */
  totalGameMinutes: number;
}

function seasonFor(month: number, dayIndex: number, cfg: WorldClockConfig): Season {
  if (cfg.seasonMode === 'per-days' && cfg.seasonDays && cfg.seasonDays > 0) {
    return SEASONS[Math.floor(dayIndex / cfg.seasonDays) % 4];
  }
  // Staged BW2 formula, as recorded in BLACK2_SEASON_CLOCK.
  return SEASONS[((month - 1) % 4 + 4) % 4];
}

/**
 * The producer. Pure: same anchor + same nowMs + same config =
 * same state, everywhere, every time.
 *
 * Derivation (stated once, so no landing drifts):
 *   totalGameMinutes = anchorGameMinutes + (nowMs - anchorRealMs)
 *     / 1000 * cfg.gameMinutesPerRealSecond;
 *   dayIndex = floor(totalGameMinutes / 1440);
 *   minuteOfDay = totalGameMinutes mod 1440;
 *   weekday = (epochWeekday + dayIndex) mod daysPerWeek (Gen 2's
 *     day mod 7, parameterised);
 *   month/day-of-year/season walk the monthLengths calendar from
 *     dayIndex (Gen 4's cumulative-month table is the same walk).
 * If the real timestamp ever runs BACKWARDS against the anchor
 * (device clock changed), the module reports the anchor time
 * instead of a negative elapsed (Gen 4's stored-wins guard).
 */
export function deriveWorldState(
  anchor: WorldClockAnchor,
  nowMs: number,
  cfg: WorldClockConfig = DEFAULT_WORLD_CLOCK_CONFIG,
): WorldState {
  const elapsedGameMinutes = Math.max(
    0,
    ((nowMs - anchor.anchorRealMs) / 1000) * cfg.gameMinutesPerRealSecond,
  );
  const totalGameMinutes = Math.floor(anchor.anchorGameMinutes + elapsedGameMinutes);
  const dayIndex = Math.floor(totalGameMinutes / 1440);
  const minuteOfDay = ((totalGameMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const phase = phaseForHour(hour);

  const daysPerYear = cfg.monthLengths.reduce((a, b) => a + b, 0);
  const dayOfYear = (dayIndex % daysPerYear) + 1;
  let remaining = dayOfYear;
  let month = 1;
  for (let i = 0; i < cfg.monthLengths.length; i++) {
    if (remaining <= cfg.monthLengths[i]) {
      month = i + 1;
      break;
    }
    remaining -= cfg.monthLengths[i];
  }
  const dayOfMonth = remaining;

  return {
    format: 'mochiichao/world-state/v1',
    dayIndex,
    minuteOfDay,
    hour,
    minute,
    secondsSinceMidnight: minuteOfDay * 60,
    phase,
    gamePhase: gamePhaseOf(phase),
    wildPhase: wildPhaseOf(phase),
    isNight: isNightPhase(phase),
    weekday: ((cfg.epochWeekday + dayIndex) % cfg.daysPerWeek + cfg.daysPerWeek) % cfg.daysPerWeek,
    dayOfYear,
    month,
    dayOfMonth,
    season: seasonFor(month, dayIndex, cfg),
    totalGameMinutes,
  };
}

/**
 * Rollover: compare a fresh reading against the anchor's
 * lastSeenDayIndex. The ENGINE calls this once per read and fans
 * daysPassed out (Gen 4 HandleDailyEvents shape); consumers never
 * call it. Returns the anchor to persist. There are no daily
 * consumers wired yet — the fan-out site exists, the handlers
 * land with their own steps — so this function moves the
 * last-seen marker and reports the delta, and owns no daily logic.
 */
export function checkRollover(
  anchor: WorldClockAnchor,
  state: WorldState,
): { daysPassed: number; nextAnchor: WorldClockAnchor } {
  const daysPassed = Math.max(0, state.dayIndex - anchor.lastSeenDayIndex);
  return {
    daysPassed,
    nextAnchor: { ...anchor, lastSeenDayIndex: state.dayIndex },
  };
}

/**
 * Presentation seam (HGSS frozen time): a state pinned to a fixed
 * hour/minute for photo-mode-style presentation. Returns a
 * derived copy; the anchor — and therefore the real clock — is
 * untouched.
 */
export function freezeStateAt(state: WorldState, hour: number, minute: number): WorldState {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  const m = ((Math.floor(minute) % 60) + 60) % 60;
  const minuteOfDay = h * 60 + m;
  const phase = phaseForHour(h);
  return {
    ...state,
    minuteOfDay,
    hour: h,
    minute: m,
    secondsSinceMidnight: minuteOfDay * 60,
    phase,
    gamePhase: gamePhaseOf(phase),
    wildPhase: wildPhaseOf(phase),
    isNight: isNightPhase(phase),
  };
}

/** Default anchor for a new save: day 0 at 10:00 — preserving
 *  today's hard-coded start hour until the owner rules otherwise. */
export function newGameAnchor(nowMs: number): WorldClockAnchor {
  return { anchorRealMs: nowMs, anchorGameMinutes: 600, lastSeenDayIndex: 0 };
}

/**
 * Date-key helper for weather variants (HGSS diamond-dust shape,
 * CLOCK §1.4.4): the eight month/day pairs on which a special
 * weather may replace the map weather. The clock supplies the key;
 * the consumer decides the use (and the penalty gate, if any).
 * Note: Feb 29 fires only under a leap-aware monthLengths config;
 * the default synthetic calendar (Feb = 28) never produces it.
 */
export function isDiamondDustKey(state: WorldState): boolean {
  const key = `${state.month}-${state.dayOfMonth}`;
  return (
    key === '1-1' || key === '1-31' || key === '2-1' || key === '2-29' ||
    key === '3-15' || key === '10-10' || key === '12-3' || key === '12-31'
  );
}

/**
 * Interior-regime sun facts (CLOCK §7). PRESENTATION derivation,
 * not a donor table: a smooth daylight curve over the game day
 * plus per-gamePhase colour/intensity in the existing
 * DAY_AMBIENT vocabulary. The clock knows the sun; it does not
 * know windows exist — apertures, shaft/patch geometry and
 * mullion masks are the light-ray lane's whole property.
 * There is deliberately NO interiorTint() in this module.
 */
export interface SunFacts {
  /** Sun elevation in degrees: +65 at game noon, 0 at 06:00/18:00, negative at night. */
  elevationDeg: number;
  /** Sun colour for the phase (Mochiichao presentation choice). */
  colour: string;
  /** Sun intensity 0..1 for the phase (Mochiichao presentation choice). */
  intensity: number;
  /** True while the sun is above the horizon (06:00–18:00 game time). */
  isUp: boolean;
}

const SUN_BY_GAME_PHASE: Record<GamePhase, { colour: string; intensity: number }> = {
  dawn: { colour: '#e8c090', intensity: 0.55 },
  day: { colour: '#ffffff', intensity: 1.0 },
  dusk: { colour: '#e08060', intensity: 0.5 },
  night: { colour: '#5080c0', intensity: 0.15 },
};

export function sunFactsForState(state: WorldState): SunFacts {
  const elevationDeg = 65 * Math.sin((2 * Math.PI * (state.minuteOfDay - 360)) / 1440);
  const sun = SUN_BY_GAME_PHASE[state.gamePhase];
  return {
    elevationDeg,
    colour: sun.colour,
    intensity: sun.intensity,
    isUp: elevationDeg > 0,
  };
}
