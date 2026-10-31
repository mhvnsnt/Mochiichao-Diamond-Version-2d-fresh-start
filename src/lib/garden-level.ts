/**
 * Garden Level aggregation — Pokopia M5 in pure library form
 * (gap-fill S14, W5 aggregation half; the W5 comfort term itself
 * landed as garden-comfort.ts).
 *
 * M5's shape, as the transfer map states it: per-resident comfort
 * aggregates into an area Garden Level (1–10 in Pokopia) that
 * unlocks new plots, kits, and features. This module builds ONLY
 * the aggregation arithmetic, and it authors NOTHING that M5
 * leaves to content:
 *
 * - Comfort values are the caller-supplied W5 comfort numbers
 *   (0..100, the garden-comfort.ts scale). This module never
 *   computes comfort itself and never imports garden-comfort.
 * - Habitat tiers are the caller-supplied solver tiers
 *   (garden-habitats.ts SolvedHabitat.tier: an integer >= 0).
 *   This module never solves a habitat and never imports
 *   garden-habitats.
 * - The tier scale is caller-supplied (tierMax): solver tiers
 *   have no authored maximum anywhere, so a tier mean cannot be
 *   put on the 0..100 comfort scale without a caller scale.
 *   A tier above tierMax fails loudly rather than clamping
 *   silently — a scale that a real tier exceeds is a caller
 *   error, not a rounding choice.
 * - Level bands are caller-supplied ({ level, min } rows). NO
 *   band, threshold, or unlock is authored here: Pokopia's
 *   1–10 range is the source's range, not our bands, and what
 *   a level unlocks is a later host/presentation decision
 *   (the X7 gathering beat is a GardenView presentation state,
 *   not a number in this module).
 * - Weights are caller-supplied. When only one side exists
 *   (comforts with no habitats, or habitats with no residents),
 *   the aggregate is that side alone — documented fallback,
 *   not a guessed weight. When neither side exists there is
 *   no aggregate and no level (null, never 0 or 1 by default:
 *   an empty Garden has no level yet).
 *
 * Deliberately NOT here: NO host (garden-wiring.ts, GardenView,
 * phase4-garden.ts do not import this module — staging locks in
 * the test); NO thresholds, unlocks, or gathering beat; NO
 * thanks-emission (X7); NO resident/zone/recipe vocabulary
 * (ids are never taken here at all — comforts and tiers arrive
 * as bare numbers, so no kept-life record is read or written);
 * NO effect in live play.
 */

function fail(message: string): never {
  throw new Error(`garden-level: ${message}`);
}

export interface GardenLevelBand {
  /** Level number (an integer; Pokopia's source range is 1–10). */
  level: number;
  /** Minimum aggregate (0..100) at which this level is reached. */
  min: number;
}

export interface GardenLevelInput {
  /** Per-resident comfort values, 0..100 each (W5 comfort scale). */
  comforts: number[];
  /** Per-habitat solver tiers, integers >= 0. */
  tiers: number[];
  /**
   * Scale that puts a tier mean on the 0..100 comfort scale.
   * Required whenever tiers is non-empty; unused when it is empty.
   */
  tierMax?: number;
  /** Weight of the comfort side; must be finite and >= 0. Default 1. */
  comfortWeight?: number;
  /** Weight of the tier side; must be finite and >= 0. Default 1. */
  tierWeight?: number;
  /** Caller-supplied level bands, ascending by min. May be empty. */
  bands?: GardenLevelBand[];
}

export interface GardenLevelSummary {
  residentCount: number;
  habitatCount: number;
  meanComfort: number | null;
  meanTier: number | null;
  /** Mean tier rescaled to 0..100 via tierMax, or null with no tiers. */
  tierScore: number | null;
  /** Weighted aggregate on 0..100, or null with neither side. */
  aggregate: number | null;
  /** Highest band whose min the aggregate reaches, or null. */
  level: number | null;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

function validateComforts(comforts: number[]): void {
  if (!Array.isArray(comforts)) fail("comforts must be an array");
  for (const c of comforts) {
    if (typeof c !== "number" || !Number.isFinite(c) || c < 0 || c > 100) {
      fail("every comfort must be a finite number within 0..100");
    }
  }
}

function validateTiers(tiers: number[]): void {
  if (!Array.isArray(tiers)) fail("tiers must be an array");
  for (const t of tiers) {
    if (typeof t !== "number" || !Number.isInteger(t) || t < 0) {
      fail("every tier must be an integer >= 0 (the solver tier shape)");
    }
  }
}

function validateWeight(value: number | undefined, name: string): number {
  if (value === undefined) return 1;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(`${name} must be a finite number >= 0`);
  }
  return value;
}

function validateBands(bands: GardenLevelBand[] | undefined): GardenLevelBand[] {
  if (bands === undefined) return [];
  if (!Array.isArray(bands)) fail("bands must be an array");
  let prevMin = -Infinity;
  let prevLevel = -Infinity;
  for (const b of bands) {
    if (
      typeof b.level !== "number" ||
      !Number.isInteger(b.level) ||
      typeof b.min !== "number" ||
      !Number.isFinite(b.min) ||
      b.min < 0 ||
      b.min > 100
    ) {
      fail("every band needs an integer level and a min within 0..100");
    }
    if (b.min <= prevMin || b.level <= prevLevel) {
      fail("bands must ascend strictly by both min and level");
    }
    prevMin = b.min;
    prevLevel = b.level;
  }
  return bands;
}

/**
 * Highest band level whose min the aggregate reaches, or null when
 * the aggregate is null, no bands are supplied, or the aggregate
 * sits below the first band's min. Bands are never defaulted:
 * an empty band list means "no levels defined", not level 1.
 */
export function levelForAggregate(
  aggregate: number | null,
  bands: GardenLevelBand[],
): number | null {
  if (aggregate === null) return null;
  const checked = validateBands(bands);
  let level: number | null = null;
  for (const b of checked) {
    if (aggregate >= b.min) level = b.level;
  }
  return level;
}

export function gardenLevelSummary(input: GardenLevelInput): GardenLevelSummary {
  validateComforts(input.comforts);
  validateTiers(input.tiers);
  const comfortWeight = validateWeight(input.comfortWeight, "comfortWeight");
  const tierWeight = validateWeight(input.tierWeight, "tierWeight");
  const bands = validateBands(input.bands);

  const meanComfort = mean(input.comforts);
  const meanTier = mean(input.tiers);

  let tierScore: number | null = null;
  if (meanTier !== null) {
    if (
      input.tierMax === undefined ||
      typeof input.tierMax !== "number" ||
      !Number.isFinite(input.tierMax) ||
      input.tierMax <= 0
    ) {
      fail("tierMax (a finite number > 0) is required whenever tiers are supplied");
    }
    if (meanTier > input.tierMax) {
      fail("mean tier exceeds tierMax — the caller scale does not cover the tiers");
    }
    tierScore = (meanTier / input.tierMax) * 100;
  }

  let aggregate: number | null = null;
  if (meanComfort !== null && tierScore !== null) {
    if (comfortWeight === 0 && tierWeight === 0) {
      fail("comfortWeight and tierWeight cannot both be 0 when both sides exist");
    }
    aggregate =
      (comfortWeight * meanComfort + tierWeight * tierScore) /
      (comfortWeight + tierWeight);
  } else if (meanComfort !== null) {
    aggregate = meanComfort;
  } else if (tierScore !== null) {
    aggregate = tierScore;
  }

  return {
    residentCount: input.comforts.length,
    habitatCount: input.tiers.length,
    meanComfort,
    meanTier,
    tierScore,
    aggregate,
    level: levelForAggregate(aggregate, bands),
  };
}
