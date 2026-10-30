// Honor & reputation — the derivation library (List 28 wiring, P0).
//
// THE LAW (List 28, #269/#270/#271/#272): the deed ledger is the ONLY
// stored honor state (gameStore.deedLedger, append-only). Morale,
// tallies, standings and wanted are DERIVED at read time by the pure
// functions below and are never written to the store or a save — a
// stored standing value anywhere is a landing defect, guarded
// mechanically by honor.test.ts.
//
// The split that organises everything:
//   morale    = conscience — every deed counts, seen or unseen (#269)
//   tallies   = what a group believes — witnessed facts only (#270)
//   wanted    = evidence — the witnessed subset, per area (#272)
//   standing  = a NAMED grid combination of a group's two tallies —
//               fame and infamy never cancel, and no function here
//               ever computes fame - infamy (#270).
//
// Data lives in src/data/core/honor/ (deed-table.json owns deed
// meaning; band-effects.json owns the world's responses; groups.json
// ships classes with zero instances — instances are owner content;
// standing-grid.json owns the 4x4 grid). Values in that data are
// DRAFTED system data from the List 28 fragments; band names are
// DRAFT vocabulary (owner slot — renaming is a data edit).
//
// Every function is pure: no mutation of the ledger, no store access,
// no result written back anywhere.

import deedTableJson from "../data/core/honor/deed-table.json";
import bandEffectsJson from "../data/core/honor/band-effects.json";
import groupsJson from "../data/core/honor/groups.json";
import standingGridJson from "../data/core/honor/standing-grid.json";

// ---------------------------------------------------------------- types

export interface DeedSubject {
  individualId?: string;
  itemId?: string;
  groupId?: string;
  areaId?: string;
}

/** BOND-DECAY-SPEC §2: neglect types N1 absence / N2 care-starvation /
 *  N3 harsh use / N4 misplacement, with the owner's context weights
 *  (party heavy / storage light / daycare moderate). Carried on ledger
 *  entries so the moral register consumes the same tallies (§6). */
export interface NeglectMark {
  type: "N1" | "N2" | "N3" | "N4";
  subjectContext: "party" | "storage" | "daycare" | "garden";
}

export interface DeedContext {
  streakKey?: string;
  storyChapter?: string;
  neglect?: NeglectMark;
}

export interface DeedEntry {
  id: string;
  /** Closed vocabulary — a row id in the deed table. */
  deed: string;
  subject: DeedSubject;
  /** #7 area ref — where it happened. */
  areaId: string;
  /** World-clock stamp (#19 world state). */
  beat: number;
  /** Witness set per #272 — individual and/or group ids, possibly
   *  empty. Mochi are never witnesses (cries are not testimony, #136). */
  witnessedBy: string[];
  context?: DeedContext;
}

export interface TallyCredit {
  reach: "victim" | "witness" | "area";
  pile: "fame" | "infamy" | "repair";
  /** Credit size; defaults to the row's |value|. */
  amount?: number;
}

export interface DeedRow {
  deed: string;
  value: number;
  tallyCredits?: TallyCredit[];
  ramp?: { streakKey: string; step: number; max: number };
  sampling?: { every: number };
  capPerIndividual?: number;
}

export interface DeedTable {
  schema: string;
  clamp: [number, number];
  pacing: { goodDeedDailyCreditCap: number };
  deeds: DeedRow[];
}

export interface BandDef {
  id: string;
  draftName: string;
  steps: [number, number];
}

export interface BandEffects {
  bands: { good: BandDef[]; bad: BandDef[]; zero: BandDef };
  shopTerms: {
    honest: { perStepPct: number; capPctByBand: Record<string, number> };
    fence: { perStepPct: number; capPctByBand: Record<string, number> };
  };
  dropTheme: { bands: Record<string, string> };
  greetingRegister: { bands: Record<string, string> };
  postingGate: { serviceMinBand: string; underworldMaxBand: string };
  lawTemperament: { perBand: Record<string, { mitigation: number; aggravation: number }> };
  wantedHeat: { levels: { min: number; draftName: string }[] };
}

export interface GroupRecord {
  id: string;
  displayName: string;
  class: string;
  valence: "normal" | "swapped";
  thresholds?: { range2: number; range3: number; range4: number };
  homeAreaId?: string;
  hateThreshold?: number;
  seeThrough?: boolean;
  effects?: Record<string, unknown>;
}

export interface StandingGrid {
  defaultThresholds: { range2: number; range3: number; range4: number };
  /** grid[fameBand][infamyBand] — draft label words. */
  grid: string[][];
  mixed: { minBand: number };
  hatedFloor: { residue: number; floorLabel: string };
}

export interface BandInfo extends BandDef {
  side: "good" | "bad" | "zero";
  /** The morale coordinate this band was read from. */
  value: number;
}

export interface MoraleRead {
  value: number;
  band: BandInfo;
  /** False when no beatsPerDay was supplied: the daily good cap was
   *  NOT applied (derivation never guesses a day length — see the
   *  deed table's capNote). */
  goodCapApplied: boolean;
}

export interface Tallies {
  fame: number;
  infamy: number;
  rawFame: number;
  rawInfamy: number;
  /** Witnessed restitution credited to this group (#275 repair). */
  repair: number;
  hasBeenHated: boolean;
}

export interface Standing {
  label: string;
  /** A pointer at the grid combination — never a difference. */
  ladderCoord: { fameBand: number; infamyBand: number; cell: number };
  mixed: boolean;
  hatedFloor: boolean;
  tallies: Tallies;
}

// ---------------------------------------------------------------- data

export const DEED_TABLE = deedTableJson as unknown as DeedTable;
export const BAND_EFFECTS = bandEffectsJson as unknown as BandEffects;
export const HONOR_GROUPS = (groupsJson as unknown as { groups: GroupRecord[] }).groups;
export const STANDING_GRID = standingGridJson as unknown as StandingGrid;

// ---------------------------------------------------------------- bands

export function bandForValue(value: number, effects: BandEffects = BAND_EFFECTS): BandInfo {
  if (value === 0) return { ...effects.bands.zero, side: "zero", value };
  const side = value > 0 ? "good" : "bad";
  const def = effects.bands[side].find((b) => value >= b.steps[0] && value <= b.steps[1])
    ?? effects.bands[side][effects.bands[side].length - 1];
  return { ...def, side, value };
}

// ---------------------------------------------------------------- morale

export interface MoraleOptions {
  /** Beats per in-game day, for the daily good-deed credit cap.
   *  Supplied by the caller: the #19 world-clock producer is not in
   *  code yet (BW2/HGSS wiring GAP-2), so no default is guessed. */
  beatsPerDay?: number;
}

export function deriveMorale(
  ledger: readonly DeedEntry[],
  table: DeedTable = DEED_TABLE,
  opts: MoraleOptions = {},
): MoraleRead {
  const rows = new Map(table.deeds.map((r) => [r.deed, r]));
  const cap = table.pacing.goodDeedDailyCreditCap;
  const goodCapApplied = typeof opts.beatsPerDay === "number" && opts.beatsPerDay > 0;

  let sum = 0;
  let streakKey: string | null = null;
  let streakLen = 0;
  const occurrences = new Map<string, number>();
  const perIndividual = new Map<string, number>();
  const goodByBucket = new Map<number, number>();

  for (const entry of ledger) {
    const row = rows.get(entry.deed);
    if (!row) continue; // closed vocabulary: unknown deeds are facts for other readers, not morale

    // Sampling rows credit only every Nth occurrence (anti-farming).
    const seen = (occurrences.get(entry.deed) ?? 0) + 1;
    occurrences.set(entry.deed, seen);
    if (row.sampling && seen % row.sampling.every !== 0) continue;

    // Streak ramping over consecutive entries sharing the streak key.
    const key = row.ramp?.streakKey ?? null;
    if (key !== null && key === streakKey) streakLen += 1;
    else { streakKey = key; streakLen = key === null ? 0 : 1; }

    let value = row.value;
    if (row.ramp && streakLen > 1) {
      const deepened = row.value + row.ramp.step * (streakLen - 1);
      value = row.value < 0 ? Math.max(deepened, row.ramp.max) : Math.min(deepened, row.ramp.max);
    }

    // Per-individual caps (keep-stolen-mochi-per-day: -10 per life).
    if (row.capPerIndividual !== undefined && entry.subject.individualId) {
      const k = `${entry.deed}:${entry.subject.individualId}`;
      const cum = perIndividual.get(k) ?? 0;
      const clamped = row.capPerIndividual < 0
        ? Math.max(cum + value, row.capPerIndividual)
        : Math.min(cum + value, row.capPerIndividual);
      value = clamped - cum;
      perIndividual.set(k, clamped);
    }

    // The daily good cap: falling is always available; climbing is
    // capped per in-game day (#269/#275). Applied only when the
    // caller supplies the day length.
    if (value > 0 && goodCapApplied) {
      const bucket = Math.floor(entry.beat / (opts.beatsPerDay as number));
      const credited = goodByBucket.get(bucket) ?? 0;
      const allowed = Math.max(0, Math.min(value, cap - credited));
      goodByBucket.set(bucket, credited + allowed);
      value = allowed;
    }

    sum += value;
  }

  const [lo, hi] = table.clamp;
  const value = Math.max(lo, Math.min(hi, sum));
  return { value, band: bandForValue(value), goodCapApplied };
}

// ---------------------------------------------------------------- tallies

export interface TallyOptions {
  nowBeat?: number;
  beatsPerWeek?: number;
  /** groupId -> ids of its members, for 'witness'-reach credits when
   *  the ledger names individuals rather than the group itself.
   *  World data supplied by the caller; zero groups are instanced in
   *  P0, so this is normally absent. */
  witnessGroupIndex?: Record<string, string[]>;
  /** #275 draft rates: infamy weight -1 per full clean week; fame at
   *  half that rate. Data slots, overridable by the caller. */
  decayRates?: { infamyPerCleanWeek: number; famePerCleanWeek: number };
}

function creditReachesGroup(
  credit: TallyCredit,
  entry: DeedEntry,
  group: GroupRecord,
  opts: TallyOptions,
): boolean {
  switch (credit.reach) {
    case "victim":
      return entry.subject.groupId === group.id;
    case "area":
      return group.homeAreaId !== undefined && entry.areaId === group.homeAreaId;
    case "witness": {
      if (entry.witnessedBy.includes(group.id)) return true;
      const members = opts.witnessGroupIndex?.[group.id] ?? [];
      return members.some((id) => entry.witnessedBy.includes(id));
    }
  }
}

export function deriveTallies(
  ledger: readonly DeedEntry[],
  table: DeedTable,
  group: GroupRecord,
  grid: StandingGrid = STANDING_GRID,
  opts: TallyOptions = {},
): Tallies {
  const rows = new Map(table.deeds.map((r) => [r.deed, r]));
  let rawFame = 0;
  let rawInfamy = 0;
  let repair = 0;
  let lastBadBeat: number | null = null;
  let lastGoodBeat: number | null = null;

  for (const entry of ledger) {
    if (entry.witnessedBy.length === 0) continue; // reputation is news, never secrets
    const row = rows.get(entry.deed);
    if (!row) continue;
    for (const credit of row.tallyCredits ?? []) {
      if (!creditReachesGroup(credit, entry, group, opts)) continue;
      const amount = credit.amount ?? Math.abs(row.value);
      if (credit.pile === "fame") {
        rawFame += amount;
        lastGoodBeat = lastGoodBeat === null ? entry.beat : Math.max(lastGoodBeat, entry.beat);
      } else if (credit.pile === "infamy") {
        rawInfamy += amount;
        lastBadBeat = lastBadBeat === null ? entry.beat : Math.max(lastBadBeat, entry.beat);
      } else {
        repair += amount;
      }
    }
  }

  const thresholds = group.thresholds ?? grid.defaultThresholds;
  const hateThreshold = group.hateThreshold ?? thresholds.range4;
  const hasBeenHated = rawInfamy >= hateThreshold;

  // #275 decay: a read-time weighting, never a deletion. Clean weeks
  // are counted from the group's last witnessed deed of that pile.
  let fame = rawFame;
  let infamy = rawInfamy;
  if (typeof opts.nowBeat === "number" && typeof opts.beatsPerWeek === "number" && opts.beatsPerWeek > 0) {
    const rates = opts.decayRates ?? { infamyPerCleanWeek: 1, famePerCleanWeek: 0.5 };
    if (lastBadBeat !== null) {
      const cleanWeeks = Math.max(0, Math.floor((opts.nowBeat - lastBadBeat) / opts.beatsPerWeek));
      infamy -= cleanWeeks * rates.infamyPerCleanWeek;
    }
    if (lastGoodBeat !== null) {
      const cleanWeeks = Math.max(0, Math.floor((opts.nowBeat - lastGoodBeat) / opts.beatsPerWeek));
      fame -= Math.floor(cleanWeeks * rates.famePerCleanWeek);
    }
  }

  // Restitution is the one direct repair (#275): witnessed returns
  // reduce the group's infamy read — floored by the hated residue.
  infamy -= repair;
  infamy = hasBeenHated ? Math.max(infamy, grid.hatedFloor.residue) : Math.max(infamy, 0);
  fame = Math.max(fame, 0);

  return { fame, infamy, rawFame, rawInfamy, repair, hasBeenHated };
}

// ---------------------------------------------------------------- standing

export function bandIndexFor(tally: number, thresholds: { range2: number; range3: number; range4: number }): number {
  if (tally >= thresholds.range4) return 3;
  if (tally >= thresholds.range3) return 2;
  if (tally >= thresholds.range2) return 1;
  return 0;
}

export function deriveStanding(
  ledger: readonly DeedEntry[],
  table: DeedTable,
  group: GroupRecord,
  grid: StandingGrid = STANDING_GRID,
  opts: TallyOptions = {},
): Standing {
  const tallies = deriveTallies(ledger, table, group, grid, opts);
  const thresholds = group.thresholds ?? grid.defaultThresholds;
  const fameBand = bandIndexFor(tallies.fame, thresholds);
  const infamyBand = bandIndexFor(tallies.infamy, thresholds);
  let label = grid.grid[fameBand][infamyBand];
  // The hated floor: once Hated, never Unmarked again (#270).
  if (tallies.hasBeenHated && fameBand === 0 && infamyBand === 0) {
    label = grid.hatedFloor.floorLabel;
  }
  return {
    label,
    ladderCoord: { fameBand, infamyBand, cell: fameBand * 4 + infamyBand },
    mixed: fameBand >= grid.mixed.minBand && infamyBand >= grid.mixed.minBand,
    hatedFloor: tallies.hasBeenHated,
    tallies,
  };
}

/** Disguise as a read-time lens (TRANSFER-MAP §2.5): standing attaches
 *  to the identity believed. Returns the presented standing unless
 *  the reader sees through the presentation. The ledger always
 *  records the TRUE Ranger — only the reputation read is fooled. */
export function effectiveStanding(
  standing: Standing,
  opts: { presentedStanding?: Standing | null; readerSeesThrough?: boolean } = {},
): Standing {
  if (opts.presentedStanding && !opts.readerSeesThrough) return opts.presentedStanding;
  return standing;
}

// ---------------------------------------------------------------- wanted

/** #272 wanted heat for one area: the witnessed BAD deeds inside the
 *  window. The law reads only the witnessed subset of the ledger,
 *  ever. Wanted DECAYS on a schedule (per-level rates are a P2 data
 *  addition); P0's read is window-based — pass windowBeats/nowBeat
 *  from the world clock when it exists. */
export function deriveWantedHeat(
  ledger: readonly DeedEntry[],
  table: DeedTable,
  areaId: string,
  windowBeats?: number,
  nowBeat?: number,
): number {
  const rows = new Map(table.deeds.map((r) => [r.deed, r]));
  let heat = 0;
  for (const entry of ledger) {
    if (entry.areaId !== areaId) continue;
    if (entry.witnessedBy.length === 0) continue;
    const row = rows.get(entry.deed);
    if (!row || row.value >= 0) continue;
    if (typeof windowBeats === "number" && typeof nowBeat === "number" && entry.beat < nowBeat - windowBeats) continue;
    heat += Math.abs(row.value);
  }
  return heat;
}

export function wantedLevelForHeat(heat: number, effects: BandEffects = BAND_EFFECTS): string | null {
  let level: string | null = null;
  for (const l of effects.wantedHeat.levels) {
    if (heat >= l.min) level = l.draftName;
  }
  return level;
}

// ------------------------------------------------------- ecology-facing

export interface StandingContext {
  /** Conscience — first impressions on individuals (B1's aura half). */
  auraBand: BandInfo;
  moraleValue: number;
  /** The area's wild-area group standing (witnessed facts only), or
   *  null when no wild-area group is instanced for the area — B1's
   *  group ruling is an owner slot (§5.3); the aura half never waits
   *  for it, the population half honestly reports null. */
  areaStanding: Standing | null;
  wildGroupRulingPending: boolean;
  /** Recent witnessed-cruelty heat in the area (B1/B5 read). */
  witnessedHeat: number;
}

/** B1's declared scorer input (TRANSFER-MAP §3.1): a place's
 *  population reacts only to areaStanding / witnessedHeat — a forest
 *  cannot spook at a secret it never saw. Individuals may read the
 *  aura. There is no behaviour scorer in code yet (BW2-lane roamers);
 *  this is the input it will consume. */
export function standingContextForArea(
  ledger: readonly DeedEntry[],
  table: DeedTable,
  areaId: string,
  groups: readonly GroupRecord[] = HONOR_GROUPS,
  grid: StandingGrid = STANDING_GRID,
  opts: TallyOptions & MoraleOptions & { windowBeats?: number } = {},
): StandingContext {
  const morale = deriveMorale(ledger, table, opts);
  const wildGroup = groups.find((g) => g.class === "wild-area" && g.homeAreaId === areaId) ?? null;
  return {
    auraBand: morale.band,
    moraleValue: morale.value,
    areaStanding: wildGroup ? deriveStanding(ledger, table, wildGroup, grid, opts) : null,
    wildGroupRulingPending: wildGroup === null,
    witnessedHeat: deriveWantedHeat(ledger, table, areaId, opts.windowBeats, opts.nowBeat),
  };
}

// ------------------------------------------------------------- consumers

/** The only arithmetic consumer of the band tables (#269/#271 shop
 *  terms): honest shops discount up the good bands and surcharge the
 *  deep bad; fences mirror it on the bad side only (payout improves).
 *  Adjustment accrues per step of the morale coordinate, capped by
 *  band (band-effects.json shopTerms, draft data). */
export function applyBandPrice(
  basePrice: number,
  band: BandInfo,
  shopClass: "honest" | "fence",
  effects: BandEffects = BAND_EFFECTS,
): number {
  if (band.side === "zero") return basePrice;
  const terms = shopClass === "honest" ? effects.shopTerms.honest : effects.shopTerms.fence;
  if (shopClass === "fence" && band.side !== "bad") return basePrice;
  const cap = terms.capPctByBand[band.id] ?? 0;
  const pct = Math.min(Math.abs(band.value) * terms.perStepPct, cap);
  if (shopClass === "fence") return Math.round(basePrice * (1 + pct / 100));
  return band.side === "good"
    ? Math.round(basePrice * (1 - pct / 100))
    : Math.round(basePrice * (1 + pct / 100));
}

/** Which half of the wild drop table a band favours (the loot flip).
 *  Consumer: src/lib/drops.ts (stub-kill S-7) — the encounter-
 *  generation roll biases toward the favoured half. */
export function favouredDropHalf(bandId: string, effects: BandEffects = BAND_EFFECTS): string {
  return effects.dropTheme.bands[bandId] ?? "neutral";
}

export function greetingTierForBand(bandId: string, effects: BandEffects = BAND_EFFECTS): string {
  return effects.greetingRegister.bands[bandId] ?? "neutral";
}

// ------------------------------------------------------------ write site

/** The one write helper (wiring plan §4). Callers supply the witness
 *  set hook for now — #272's presence-based computation is its own
 *  phase. Appends exactly one entry; nothing anywhere edits or
 *  removes ledger entries. */
export function recordDeed(
  store: { deedLedger: readonly DeedEntry[]; appendDeed: (entry: DeedEntry) => void },
  input: Omit<DeedEntry, "id"> & { id?: string },
): DeedEntry {
  const entry: DeedEntry = {
    ...input,
    id: input.id ?? `deed-${input.beat}-${store.deedLedger.length + 1}`,
    subject: input.subject ?? {},
    witnessedBy: input.witnessedBy ?? [],
  };
  store.appendDeed(entry);
  return entry;
}
