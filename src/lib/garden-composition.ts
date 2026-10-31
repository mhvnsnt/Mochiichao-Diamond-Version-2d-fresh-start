// Habitat composition pass — gap-fill S14 slice 2 (2026-10-31).
//
// DQB2 W2 (dqb2-teardown/WIRING-PLAN.md) + Pokopia M3 + DQB2 X2
// (dqb2-teardown/TRANSFER-MAP.md): the composition pass resolves AFTER
// slice 1's base matching (garden-habitats.ts solveHabitat) and never
// replaces it. It has two axes, one grammar:
//
// - M3 context modifiers: a base habitat × nearby context tags resolves
//   variant labels (Pokopia's pattern: water -> a hydrated variant,
//   tree -> a shaded variant, boulder -> a boulder-shaded variant).
//   The modifier table is caller-supplied data: each row names the
//   context tag, the variant id it resolves to, and optionally the
//   recipe ids it applies to (absent = any recognised base). No
//   variant content is authored here.
// - X2 neighbour combos: two neighbouring recognised habitats resolve
//   a third, named Garden feature (DQB2's pattern: Bedroom +
//   Reception = Hotel). The combo table is caller-supplied data:
//   each row names the two recipe ids and the combo id it resolves
//   to. The pair table itself is owner slot S5 in the wiring plan,
//   so no pair content is authored here — test fixtures are
//   synthetic, as in slice 1.
//
// Rules, all stated here so a later slice can be checked against them:
// - Composition is classification only: it adds variant and combo
//   labels to a solved base. It never changes the base's recipeId,
//   tier, extent, finish, or character, and it never re-scores.
// - Variants need a base: with no recognised base, no variant fires,
//   however many context tags are present. A modifier fires only when
//   its tag is present and its appliesTo list (when given) contains
//   the base's recipeId. Variants emit in modifier-table order, each
//   variant id at most once (first occurrence wins).
// - Combos read a pool, not a single habitat: the pool is the base
//   (when recognised) plus the caller-supplied neighbouring solved
//   habitats, in that order. A combo row fires when two DISTINCT
//   pool entries carry its two recipe ids, in either order — so a
//   pair of neighbours alone can resolve a combo even when this
//   placement recognises nothing, and a base + one neighbour can
//   too. Combos do not consume habitats: one habitat may take part
//   in several combos, and one pool pair may satisfy several combo
//   rows. A combo id emits at most once (first row wins).
// - Adjacency and context are caller-resolved: slice 1's cells carry
//   no coordinates, so this module cannot scan map geometry. The
//   caller passes the nearby context tags and the neighbouring solved
//   habitats; this module only resolves the tables over them.
// - The registration cap (slice 1) gates only this placement's own
//   recognition: in solveHabitatComposed, a capped placement yields
//   a null base, but neighbours are already-recognised habitats
//   (they passed their own caps when recognised), so a
//   neighbours-only combo may still fire. That behaviour is
//   deliberate and tested, not an accident of the cap path.
// - The module never mutates its inputs and never writes a save.
//
// Deliberately NOT here: NO placement records in the Garden save
// (W3); NO attraction binding (W4); NO recipe, modifier, or combo
// data authored for any habitat (owner slots S1/S5); NO host
// (garden-wiring.ts and GardenView.tsx do not import this module
// yet — see the staging locks in the test file); NO numeric effect
// of a variant or combo on axes, tiers, or spawn behaviour — those
// readings belong to the later host/binding slices.

import {
  solveHabitat,
  type HabitatPlacement,
  type HabitatRecipe,
  type SolveHabitatOptions,
  type SolvedHabitat,
} from "./garden-habitats";

/** One context-modifier row: a nearby context tag resolves a variant id. */
export interface ContextModifier {
  /** Nearby context tag, e.g. "water", "tree", "boulder" (caller-supplied). */
  contextTag: string;
  /** Variant id this modifier resolves to (caller-supplied, never authored here). */
  variantId: string;
  /** Recipe ids this modifier applies to; absent = any recognised base. */
  appliesTo?: readonly string[];
}

/** One neighbour-combo row: two neighbouring recipe ids resolve a combo id. */
export interface NeighbourCombo {
  first: string;
  second: string;
  /** Combo id the pair resolves to (caller-supplied, never authored here). */
  comboId: string;
}

/** Everything the composition pass reads, all caller-supplied. */
export interface HabitatComposition {
  /** Nearby context tags for the M3 pass. Defaults to no tags. */
  contextTags?: readonly string[];
  /** Modifier table for the M3 pass. Defaults to no modifiers. */
  modifiers?: readonly ContextModifier[];
  /** Neighbouring solved habitats for the X2 pass. Defaults to none. */
  neighbours?: readonly SolvedHabitat[];
  /** Combo table for the X2 pass. Defaults to no combos. */
  combos?: readonly NeighbourCombo[];
}

/** A composed habitat: the slice-1 base plus its composition labels. */
export interface ComposedHabitat {
  base: SolvedHabitat | null;
  variants: string[];
  combos: string[];
}

function fail(message: string): never {
  throw new Error(`composeHabitat: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function validateSolved(habitat: SolvedHabitat, what: string): void {
  if (habitat === null || typeof habitat !== "object") fail(`${what} must be a solved habitat or null`);
  nonEmptyString(habitat.recipeId, `${what} recipeId`);
  if (typeof habitat.tier !== "number" || !Number.isInteger(habitat.tier) || habitat.tier < 0) {
    fail(`${what} tier must be an integer >= 0`);
  }
}

function validateModifier(modifier: ContextModifier): void {
  nonEmptyString(modifier.contextTag, "modifier contextTag");
  nonEmptyString(modifier.variantId, "modifier variantId");
  if (modifier.appliesTo !== undefined) {
    if (!Array.isArray(modifier.appliesTo)) fail("modifier appliesTo must be an array");
    for (const recipeId of modifier.appliesTo) nonEmptyString(recipeId, "modifier appliesTo recipe id");
  }
}

function validateCombo(combo: NeighbourCombo): void {
  nonEmptyString(combo.first, "combo first");
  nonEmptyString(combo.second, "combo second");
  nonEmptyString(combo.comboId, "combo comboId");
}

/**
 * Resolve the composition pass over an already-solved base.
 * Pure: inputs are only read, never mutated.
 */
export function composeHabitat(
  base: SolvedHabitat | null,
  composition: HabitatComposition = {},
): ComposedHabitat {
  if (base !== null) validateSolved(base, "base");
  if (composition === null || typeof composition !== "object") fail("composition must be an object");
  const contextTags = composition.contextTags ?? [];
  if (!Array.isArray(contextTags)) fail("contextTags must be an array");
  for (const tag of contextTags) nonEmptyString(tag, "contextTag");
  const tagSet = new Set<string>(contextTags);
  const modifiers = composition.modifiers ?? [];
  if (!Array.isArray(modifiers)) fail("modifiers must be an array");
  for (const modifier of modifiers) validateModifier(modifier);
  const neighbours = composition.neighbours ?? [];
  if (!Array.isArray(neighbours)) fail("neighbours must be an array");
  for (const neighbour of neighbours) validateSolved(neighbour, "neighbour");
  const combos = composition.combos ?? [];
  if (!Array.isArray(combos)) fail("combos must be an array");
  for (const combo of combos) validateCombo(combo);

  const variants: string[] = [];
  if (base !== null) {
    for (const modifier of modifiers) {
      if (!tagSet.has(modifier.contextTag)) continue;
      if (modifier.appliesTo !== undefined && !modifier.appliesTo.includes(base.recipeId)) continue;
      if (!variants.includes(modifier.variantId)) variants.push(modifier.variantId);
    }
  }

  const pool: SolvedHabitat[] = base !== null ? [base, ...neighbours] : [...neighbours];
  const emitted: string[] = [];
  for (const combo of combos) {
    if (emitted.includes(combo.comboId)) continue;
    let fires = false;
    for (let i = 0; i < pool.length && !fires; i += 1) {
      for (let j = i + 1; j < pool.length; j += 1) {
        const a = pool[i].recipeId;
        const b = pool[j].recipeId;
        if ((a === combo.first && b === combo.second) || (a === combo.second && b === combo.first)) {
          fires = true;
          break;
        }
      }
    }
    if (fires) emitted.push(combo.comboId);
  }

  return { base, variants, combos: emitted };
}

/**
 * One-call host shape: slice-1 base matching, then the composition
 * pass over that base. The composition's neighbours are the
 * caller-resolved neighbouring solved habitats.
 */
export function solveHabitatComposed(
  placement: HabitatPlacement,
  recipes: readonly HabitatRecipe[],
  composition: HabitatComposition = {},
  options: SolveHabitatOptions = {},
): ComposedHabitat {
  const base = solveHabitat(placement, recipes, options);
  return composeHabitat(base, composition);
}
