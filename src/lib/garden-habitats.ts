// Habitat solver — gap-fill S14 slice 1 (2026-10-31).
//
// DQB2 W2 (dqb2-teardown/WIRING-PLAN.md) + TRANSFER-MAP X1 (room solver:
// enclosure + item multiset, category wildcards, count tiers,
// most-specific match) + X3 (three scored axes). This slice is the BASE
// solver only, as pure code on the S10/S11/S12/S13 library-first pattern:
// recipes are caller-supplied data, never authored here — the Garden's
// native item/habitat names and contents are owner slot S1 in the wiring
// plan, so no recipe content is invented in this module or its tests
// (test fixtures are synthetic: "bed-a", "table-a", not canon items).
//
// Rules, all stated here so a later slice can be checked against them:
// - A placement is a multiset of cells. A cell counts toward at most one
//   requirement of a recipe: requirements consume cells in listed order,
//   so a cell matching two requirements counts toward the earlier one.
// - Only cells in a recipe's ground band count toward it (DQB2's 3-level
//   scan rule, our analogue: vertical stacking is presentation, not
//   contents). A recipe's band defaults to 0; a cell's band defaults to 0.
// - A recipe with a zone only matches a placement carrying the same
//   zoneId. A zone-less recipe matches any placement.
// - Most-specific match wins: among satisfied recipes, the greatest
//   total required count wins; ties break by more requirements, then by
//   first in the recipes array (deterministic, documented).
// - The solved axes: extent = the count of distinct cells in the winning
//   recipe's ground band (the habitat's footprint, not just the matched
//   items); finish = the sum of richness over those band cells (material
//   richness of the habitat as built); character = the most frequent
//   non-null material tag among those band cells, ties broken by first
//   seen in placement order, null when no band cell carries a material.
// - Registration cap: options.cap is the per-zone cap as a named
//   parameter (the plan's owner-tunable constant, not a magic number
//   here); when alreadyRegistered reaches it, nothing is recognised.
// - The solver never mutates its inputs and never writes a save.
//
// Deliberately NOT here: NO composition pass — Pokopia M3 context
// modifiers (water/tree/boulder tags) and X2 neighbour-habitat combos
// resolve after base matching and are a later slice; NO placement
// records in the Garden save (W3's job: garden-wiring.ts gains the
// placements block, and only then does this solver get a host); NO
// attraction binding (W4); NO recipe data authored for any habitat
// (owner slot S1); NO preference bands per resident (owner slot S3).
//
// Addendum, S14 slice 3 (2026-10-31): W3 has landed — garden-wiring.ts
// now imports solveHabitat as the placement host, so the slice-1
// staging lock's garden-wiring half is superseded (see the lock test);
// GardenView still does not read the solver.

/** One placed item in a Garden zone, at a distinct position. */
export interface HabitatCell {
  /** Distinct position key within the placement (e.g. "x,y"). */
  id: string;
  itemId: string;
  /** Category tags the item belongs to; wildcard requirements match here. */
  categories?: readonly string[];
  /** Material palette tag; feeds character. Absent/null cells are ignored for character. */
  material?: string | null;
  /** Material richness contribution; feeds finish. Defaults to 0. */
  richness?: number;
  /** Vertical band of the cell. Defaults to 0. */
  band?: number;
}

/** One requirement: exactly one of item / category, plus a count. */
export interface HabitatRequirement {
  item?: string;
  category?: string;
  count: number;
}

/** A habitat recipe: caller-supplied data, never authored in this module. */
export interface HabitatRecipe {
  id: string;
  tier: number;
  requires: readonly HabitatRequirement[];
  /** Ground band this habitat reads. Defaults to 0. */
  band?: number;
  /** Zone this recipe belongs to; when set, only same-zone placements match. */
  zone?: string;
}

/** A zone's placement: the cells the solver reads. */
export interface HabitatPlacement {
  zoneId?: string;
  cells: readonly HabitatCell[];
}

export interface SolveHabitatOptions {
  /** Hard registration cap per zone (named parameter, owner-tunable). */
  cap?: number;
  /** Habitats already registered in the zone. Defaults to 0. */
  alreadyRegistered?: number;
}

/** A recognised habitat: the W2 output shape. */
export interface SolvedHabitat {
  recipeId: string;
  tier: number;
  extent: number;
  finish: number;
  character: string | null;
}

function fail(message: string): never {
  throw new Error(`solveHabitat: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function optionalBand(value: unknown, what: string): number {
  if (value === undefined) return 0;
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${what} must be a finite number`);
  return value;
}

function validateCell(cell: HabitatCell, seen: Set<string>): void {
  nonEmptyString(cell.id, "cell id");
  if (seen.has(cell.id)) fail(`duplicate cell id "${cell.id}"`);
  seen.add(cell.id);
  nonEmptyString(cell.itemId, `cell "${cell.id}" itemId`);
  if (cell.categories !== undefined) {
    if (!Array.isArray(cell.categories)) fail(`cell "${cell.id}" categories must be an array`);
    for (const category of cell.categories) nonEmptyString(category, `cell "${cell.id}" category`);
  }
  if (cell.material !== undefined && cell.material !== null) {
    nonEmptyString(cell.material, `cell "${cell.id}" material`);
  }
  if (cell.richness !== undefined) {
    if (typeof cell.richness !== "number" || !Number.isFinite(cell.richness) || cell.richness < 0) {
      fail(`cell "${cell.id}" richness must be a finite number >= 0`);
    }
  }
  optionalBand(cell.band, `cell "${cell.id}" band`);
}

function validateRecipe(recipe: HabitatRecipe): void {
  nonEmptyString(recipe.id, "recipe id");
  if (typeof recipe.tier !== "number" || !Number.isInteger(recipe.tier) || recipe.tier < 0) {
    fail(`recipe "${recipe.id}" tier must be an integer >= 0`);
  }
  if (!Array.isArray(recipe.requires) || recipe.requires.length === 0) {
    fail(`recipe "${recipe.id}" requires must be a non-empty array`);
  }
  for (const requirement of recipe.requires) {
    const hasItem = requirement.item !== undefined;
    const hasCategory = requirement.category !== undefined;
    if (hasItem === hasCategory) {
      fail(`recipe "${recipe.id}" requirement must carry exactly one of item / category`);
    }
    if (hasItem) nonEmptyString(requirement.item, `recipe "${recipe.id}" requirement item`);
    if (hasCategory) nonEmptyString(requirement.category, `recipe "${recipe.id}" requirement category`);
    if (typeof requirement.count !== "number" || !Number.isInteger(requirement.count) || requirement.count < 1) {
      fail(`recipe "${recipe.id}" requirement count must be an integer >= 1`);
    }
  }
  optionalBand(recipe.band, `recipe "${recipe.id}" band`);
  if (recipe.zone !== undefined) nonEmptyString(recipe.zone, `recipe "${recipe.id}" zone`);
}

function matchesRequirement(cell: HabitatCell, requirement: HabitatRequirement): boolean {
  if (requirement.item !== undefined) return cell.itemId === requirement.item;
  return (cell.categories ?? []).includes(requirement.category as string);
}

/**
 * Recognise the most-specific habitat a placement satisfies, or null.
 * Pure: inputs are only read, never mutated. Recipes and the cap are
 * caller-supplied; no recipe content lives in this module.
 */
export function solveHabitat(
  placement: HabitatPlacement,
  recipes: readonly HabitatRecipe[],
  options: SolveHabitatOptions = {},
): SolvedHabitat | null {
  if (placement === null || typeof placement !== "object" || !Array.isArray(placement.cells)) {
    fail("placement.cells must be an array");
  }
  if (placement.zoneId !== undefined) nonEmptyString(placement.zoneId, "placement zoneId");
  if (!Array.isArray(recipes)) fail("recipes must be an array");
  const seen = new Set<string>();
  for (const cell of placement.cells) validateCell(cell, seen);
  for (const recipe of recipes) validateRecipe(recipe);
  const alreadyRegistered = options.alreadyRegistered ?? 0;
  if (options.cap !== undefined) {
    if (typeof options.cap !== "number" || !Number.isInteger(options.cap) || options.cap < 0) {
      fail("cap must be an integer >= 0");
    }
    if (typeof alreadyRegistered !== "number" || !Number.isInteger(alreadyRegistered) || alreadyRegistered < 0) {
      fail("alreadyRegistered must be an integer >= 0");
    }
    if (alreadyRegistered >= options.cap) return null;
  }

  let winner: { recipe: HabitatRecipe; bandCells: HabitatCell[]; total: number } | null = null;
  for (const recipe of recipes) {
    if (recipe.zone !== undefined && recipe.zone !== placement.zoneId) continue;
    const band = recipe.band ?? 0;
    const bandCells = placement.cells.filter((cell) => (cell.band ?? 0) === band);
    // Multiset consumption: each cell counts toward at most one requirement.
    const available = [...bandCells];
    let satisfied = true;
    for (const requirement of recipe.requires) {
      let needed = requirement.count;
      const rest: HabitatCell[] = [];
      for (const cell of available) {
        if (needed > 0 && matchesRequirement(cell, requirement)) {
          needed -= 1;
        } else {
          rest.push(cell);
        }
      }
      if (needed > 0) {
        satisfied = false;
        break;
      }
      available.length = 0;
      available.push(...rest);
    }
    if (!satisfied) continue;
    const total = recipe.requires.reduce((sum, requirement) => sum + requirement.count, 0);
    if (
      winner === null ||
      total > winner.total ||
      (total === winner.total && recipe.requires.length > winner.recipe.requires.length)
    ) {
      winner = { recipe, bandCells, total };
    }
  }
  if (winner === null) return null;

  const bandCells = winner.bandCells;
  const finish = bandCells.reduce((sum, cell) => sum + (cell.richness ?? 0), 0);
  const materialCounts = new Map<string, number>();
  const firstSeen: string[] = [];
  for (const cell of bandCells) {
    if (cell.material === undefined || cell.material === null) continue;
    if (!materialCounts.has(cell.material)) firstSeen.push(cell.material);
    materialCounts.set(cell.material, (materialCounts.get(cell.material) ?? 0) + 1);
  }
  let character: string | null = null;
  let best = 0;
  for (const material of firstSeen) {
    const count = materialCounts.get(material) as number;
    if (count > best) {
      best = count;
      character = material;
    }
  }
  return {
    recipeId: winner.recipe.id,
    tier: winner.recipe.tier,
    extent: bandCells.length,
    finish,
    character,
  };
}
