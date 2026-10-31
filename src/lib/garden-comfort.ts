// S14 slice 5 — DQB2 W5 comfort + needs daily term (pure library, no host yet).
//
// Wiring-plan step: CompanionCare gains the needs daily term (X6) — needs
// are checked against recognised habitats/facilities (the W2 solver
// output), met by residents themselves. What this module does, and what
// it does not:
//
// - DOES: evaluate, for one Garden day, which caller-supplied needs are
//   satisfied by the recognised habitats present, and apply the day's
//   comfort term: each satisfied need adds its caller-supplied gain,
//   each unsatisfied need subtracts its caller-supplied loss, scaled by
//   the caller-supplied context and personality factors (the
//   BOND-DECAY-SPEC context x personality hook — the factors are inputs
//   here, not numbers authored here).
// - DOES (CORRECTED X6): let unmet needs push comfort BELOW neutral.
//   The wiring plan's W5 text still carries the superseded "unmet floors
//   at neutral / no punishment decay" line, which the owner reversed on
//   2026-10-29 (~19:15-19:20 CDT) — GAP-FILL-PLAN G-10 records the
//   correction, and this module is built to it: comfort is clamped only
//   at 0 and 100 (the phase4 clampCare pattern), never at neutral, so a
//   day of unmet needs from 55 with a loss of 10 lands at 45, below
//   neutral, and the test proves it. The surviving hard condition is
//   structural: satisfaction takes ONLY recognised habitats as input —
//   there is no player-action or chore parameter anywhere in this
//   module, so a need can never be met by a player chore, only by place.
// - DOES NOT: author any need, recipe, class, rate, or factor. Needs,
//   their satisfiers, their gains/losses, and both factors are all
//   caller-supplied (recipes themselves are owner slot S1; preference
//   bands per resident are owner slot S3 — no resident data lives here,
//   and no resident is named). Test fixtures are synthetic.
// - DOES NOT: touch any live path yet. This module does NOT edit
//   phase4-garden.ts's CompanionCare loop — the host slice decides how
//   the comfort term lands on the live care record. Staging locks in
//   the test file assert phase4-garden.ts, garden-wiring.ts and
//   GardenView.tsx do not import this module. Garden Level aggregation
//   (Pokopia M5) and thanks-emission (X7) are later W5 slices, not this
//   one.
// - DOES NOT: invent BOND-DECAY numbers. The plan names the contexts
//   (box LIGHT, daycare MODERATE, party HEAVY, personality-moderated)
//   but gives no numeric factors for them, so none are baked in here:
//   a host supplies its factors from its own decay model when it lands.
//
// Pure: inputs are only read, never mutated. All outputs are fresh objects.

import type { SolvedHabitat } from "./garden-habitats";
import type { ClassesForRecipe } from "./garden-attraction";

/** One need, as far as satisfaction reads it. */
export interface GardenNeedDef {
  /** Non-empty need id (caller vocabulary; no need is named here). */
  id: string;
  /** Recipe ids whose recognised habitat satisfies this need. */
  recipeIds?: readonly string[];
  /** Habitat classes (via classesForRecipe) whose recognised habitat satisfies this need. */
  classes?: readonly string[];
}

/** Per-need daily comfort rates. Both are >= 0; the loss is applied on unmet days. */
export interface GardenNeedRate {
  /** Comfort gained on a day this need is satisfied. */
  gain: number;
  /** Comfort lost on a day this need is unsatisfied. */
  loss: number;
}

function fail(message: string): never {
  throw new Error(`garden-comfort: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function finiteNonNegative(value: unknown, what: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(`${what} must be a finite number >= 0`);
  }
  return value as number;
}

function validateNeed(need: GardenNeedDef, index: number): {
  id: string;
  recipeIds: string[];
  classes: string[];
} {
  if (need === null || typeof need !== "object") fail(`need ${index} must be an object`);
  const id = nonEmptyString(need.id, `need ${index} id`);
  const recipeIds: string[] = [];
  if (need.recipeIds !== undefined) {
    if (!Array.isArray(need.recipeIds)) fail(`need "${id}" recipeIds must be an array`);
    for (const r of need.recipeIds) recipeIds.push(nonEmptyString(r, `need "${id}" recipeId`));
  }
  const classes: string[] = [];
  if (need.classes !== undefined) {
    if (!Array.isArray(need.classes)) fail(`need "${id}" classes must be an array`);
    for (const c of need.classes) classes.push(nonEmptyString(c, `need "${id}" class`));
  }
  if (recipeIds.length === 0 && classes.length === 0) {
    fail(`need "${id}" must name at least one satisfier (recipeIds or classes)`);
  }
  return { id, recipeIds: [...new Set(recipeIds)], classes: [...new Set(classes)] };
}

function validateNeeds(needs: readonly GardenNeedDef[]): ReturnType<typeof validateNeed>[] {
  if (!Array.isArray(needs)) fail("needs must be an array");
  const seen = new Set<string>();
  const out: ReturnType<typeof validateNeed>[] = [];
  for (const [i, need] of needs.entries()) {
    const v = validateNeed(need, i);
    if (seen.has(v.id)) fail(`duplicate need id "${v.id}"`);
    seen.add(v.id);
    out.push(v);
  }
  return out;
}

function validateHabitats(
  habitats: readonly (SolvedHabitat | null)[],
): SolvedHabitat[] {
  if (!Array.isArray(habitats)) fail("habitats must be an array");
  const out: SolvedHabitat[] = [];
  for (const habitat of habitats) {
    if (habitat === null) continue;
    if (habitat === undefined || typeof habitat !== "object") {
      fail("habitat must be a solved habitat or null");
    }
    nonEmptyString(habitat.recipeId, "habitat recipeId");
    out.push(habitat);
  }
  return out;
}

function validateClasses(classes: unknown, recipeId: string): readonly string[] {
  if (!Array.isArray(classes)) fail(`classes for recipe "${recipeId}" must be an array`);
  for (const cls of classes) nonEmptyString(cls, `class for recipe "${recipeId}"`);
  return classes as readonly string[];
}

/** Which needs the recognised habitats satisfy, and which they leave unmet. */
export interface NeedsSatisfaction {
  satisfied: string[];
  unsatisfied: string[];
  byNeed: Record<string, boolean>;
}

/**
 * Evaluate needs against recognised habitats only (place, never chores:
 * no other input exists). A need is satisfied when any recognised
 * habitat's recipe id is in its recipeIds, or any class that habitat
 * realises (via classesForRecipe) is in its classes.
 */
export function needsSatisfied(
  habitats: readonly (SolvedHabitat | null)[],
  needs: readonly GardenNeedDef[],
  classesForRecipe: ClassesForRecipe,
): NeedsSatisfaction {
  const present = validateHabitats(habitats);
  const defs = validateNeeds(needs);
  if (typeof classesForRecipe !== "function") fail("classesForRecipe must be a function");
  const byNeed: Record<string, boolean> = {};
  for (const need of defs) {
    let met = false;
    for (const habitat of present) {
      if (need.recipeIds.includes(habitat.recipeId)) {
        met = true;
        break;
      }
      const classes = validateClasses(classesForRecipe(habitat.recipeId), habitat.recipeId);
      if (classes.some((c) => need.classes.includes(c))) {
        met = true;
        break;
      }
    }
    byNeed[need.id] = met;
  }
  return {
    satisfied: defs.filter((d) => byNeed[d.id]).map((d) => d.id),
    unsatisfied: defs.filter((d) => !byNeed[d.id]).map((d) => d.id),
    byNeed,
  };
}

function validateRates(
  rates: Readonly<Record<string, GardenNeedRate>>,
  needIds: readonly string[],
): Record<string, GardenNeedRate> {
  if (rates === null || typeof rates !== "object" || Array.isArray(rates)) {
    fail("rates must be an object");
  }
  const out: Record<string, GardenNeedRate> = {};
  for (const id of needIds) {
    const rate = (rates as Record<string, GardenNeedRate>)[id];
    if (rate === null || typeof rate !== "object") fail(`rate for need "${id}" is missing`);
    out[id] = {
      gain: finiteNonNegative(rate.gain, `gain for need "${id}"`),
      loss: finiteNonNegative(rate.loss, `loss for need "${id}"`),
    };
  }
  return out;
}

function clampComfort(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** One day's comfort term, with its satisfaction breakdown. */
export interface ComfortDayResult {
  /** Comfort after the day, clamped 0..100 only — never floored at neutral. */
  comfort: number;
  /** Signed change this day (after both factors). */
  delta: number;
  satisfied: string[];
  unsatisfied: string[];
}

/**
 * Apply one Garden day's needs term to a comfort value. The raw term is
 * (sum of gains for satisfied needs) minus (sum of losses for
 * unsatisfied needs), scaled by contextFactor x personalityFactor
 * (both default 1, both >= 0). The result is clamped at 0 and 100 only.
 */
export function comfortAfterDay(input: {
  comfort: number;
  habitats: readonly (SolvedHabitat | null)[];
  needs: readonly GardenNeedDef[];
  rates: Readonly<Record<string, GardenNeedRate>>;
  classesForRecipe: ClassesForRecipe;
  contextFactor?: number;
  personalityFactor?: number;
}): ComfortDayResult {
  if (typeof input.comfort !== "number" || !Number.isFinite(input.comfort)) {
    fail("comfort must be a finite number");
  }
  if (input.comfort < 0 || input.comfort > 100) fail("comfort must be within 0..100");
  const contextFactor =
    input.contextFactor === undefined ? 1 : finiteNonNegative(input.contextFactor, "contextFactor");
  const personalityFactor =
    input.personalityFactor === undefined
      ? 1
      : finiteNonNegative(input.personalityFactor, "personalityFactor");
  const satisfaction = needsSatisfied(input.habitats, input.needs, input.classesForRecipe);
  const rates = validateRates(
    input.rates,
    satisfaction.satisfied.concat(satisfaction.unsatisfied),
  );
  let raw = 0;
  for (const id of satisfaction.satisfied) raw += rates[id].gain;
  for (const id of satisfaction.unsatisfied) raw -= rates[id].loss;
  const delta = raw * contextFactor * personalityFactor;
  return {
    comfort: clampComfort(input.comfort + delta),
    delta,
    satisfied: satisfaction.satisfied,
    unsatisfied: satisfaction.unsatisfied,
  };
}

/** N days of the same Garden (same habitats, needs, rates, factors), day by day. */
export interface ComfortDaysResult {
  comfort: number;
  days: ComfortDayResult[];
}

/**
 * Apply the daily term N times (a Garden left alone for N days on the
 * same placements). Days must be an integer >= 0; 0 days returns the
 * starting comfort unchanged with an empty trace.
 */
export function comfortAfterDays(
  input: {
    comfort: number;
    habitats: readonly (SolvedHabitat | null)[];
    needs: readonly GardenNeedDef[];
    rates: Readonly<Record<string, GardenNeedRate>>;
    classesForRecipe: ClassesForRecipe;
    contextFactor?: number;
    personalityFactor?: number;
  },
  days: number,
): ComfortDaysResult {
  if (typeof days !== "number" || !Number.isInteger(days) || days < 0) {
    fail("days must be an integer >= 0");
  }
  const trace: ComfortDayResult[] = [];
  let comfort = input.comfort;
  for (let d = 0; d < days; d++) {
    const result = comfortAfterDay({ ...input, comfort });
    trace.push(result);
    comfort = result.comfort;
  }
  return { comfort, days: trace };
}
