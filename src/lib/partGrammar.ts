// Part grammar — species construction layer (teardown-spore, T1).
//
// Systems source: Spore's documented creature construction (sculptable
// spine + seven functional part categories + cost/complexity budgets),
// re-implemented natively. No Maxis part names, art or data are used —
// category ids are functional vocabulary and the catalogue is Mochiichao
// canon content (src/data/core/part-grammar.json, shipped empty).
//
// A species' build record DESCRIBES its canon design in grammar terms;
// evolution stages are part deltas on one spine profile. Validation is
// an authoring constraint check — it never rewrites a build.

export const PART_CATEGORIES = [
  "mouth",
  "sense",
  "grasper",
  "foot",
  "weapon",
  "movement",
  "detail",
] as const;

export type PartCategory = (typeof PART_CATEGORIES)[number];

export interface CataloguePart {
  partId: string;
  category: PartCategory;
  cost: number;
  complexity: number;
  grants: string[];
  movementClass?: string;
  dietClass?: string;
}

export interface PartGrammar {
  budget: { complexityMax: number | null; costMax: number | null };
  catalogue: CataloguePart[];
}

export interface SpineProfile {
  lengthClass: string;
  postureClass: string;
}

export interface PlacedPart {
  partId: string;
  slot: string;
}

export interface BuildRecord {
  spine: SpineProfile;
  parts: PlacedPart[];
}

export function catalogueIndex(grammar: PartGrammar): Map<string, CataloguePart> {
  return new Map(grammar.catalogue.map((p) => [p.partId, p]));
}

/**
 * Validate a build against the grammar: spine present, every placed
 * part exists in the catalogue, and budget totals hold where budgets
 * are set. Returns a list of problems (empty = valid).
 */
export function validateBuild(build: BuildRecord, grammar: PartGrammar): string[] {
  const problems: string[] = [];
  if (!build.spine || !build.spine.lengthClass || !build.spine.postureClass) {
    problems.push("build has no spine profile");
  }
  const index = catalogueIndex(grammar);
  let cost = 0;
  let complexity = 0;
  for (const placed of build.parts) {
    const part = index.get(placed.partId);
    if (!part) {
      problems.push(`unknown part: ${placed.partId}`);
      continue;
    }
    cost += part.cost;
    complexity += part.complexity;
  }
  if (grammar.budget.complexityMax !== null && complexity > grammar.budget.complexityMax) {
    problems.push(`complexity ${complexity} exceeds budget ${grammar.budget.complexityMax}`);
  }
  if (grammar.budget.costMax !== null && cost > grammar.budget.costMax) {
    problems.push(`cost ${cost} exceeds budget ${grammar.budget.costMax}`);
  }
  return problems;
}

export function buildTotals(build: BuildRecord, grammar: PartGrammar): { cost: number; complexity: number } {
  const index = catalogueIndex(grammar);
  let cost = 0;
  let complexity = 0;
  for (const placed of build.parts) {
    const part = index.get(placed.partId);
    if (part) {
      cost += part.cost;
      complexity += part.complexity;
    }
  }
  return { cost, complexity };
}
