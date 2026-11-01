/**
 * Garden milestone unlocks — B3 BRIDGE-SPEC §2.4 in pure library form
 * (gap-fill S14 slice 15).
 *
 * §2.4's shape, as the spec states it: Garden milestones (Garden
 * Level thresholds from the Pokopia M5 spine, sport titles, lineage
 * milestones) unlock VISITATION content — places from the world's
 * own past made visitable, Garden areas themed by what has been
 * raised there, and the grey market's deeper stock. This module
 * builds ONLY the milestone -> unlock evaluation, and it authors
 * NOTHING that §2.4 leaves to content:
 *
 * - Milestones are caller-supplied facts: a Garden Level number
 *   (the garden-level.ts read's output, fed in by the caller —
 *   this module never imports garden-level and never computes a
 *   level), a set of sport titles, and a set of lineage
 *   milestones. Titles and milestones arrive as opaque strings;
 *   no title, lineage, place, or stock content is named here.
 * - The catalogue is caller-supplied in full: every unlock entry
 *   carries its own requirement, and every threshold, title, and
 *   milestone in a requirement is catalogue data, not a rule of
 *   this module. There is no default catalogue and no built-in
 *   unlock: an empty catalogue unlocks nothing.
 * - Requirements compose with `all` (every sub-requirement met)
 *   and `any` (at least one met), nestable. An empty `all` or
 *   `any` fails loudly: an entry with no requirement is a
 *   catalogue error, never an auto-unlock.
 * - A null Garden Level means "no level yet" (the garden-level
 *   read's empty-Garden null, never a default): no level
 *   requirement is met while it is null, including atLeast 0.
 * - `unlocked` is the full current set in catalogue order;
 *   `newlyUnlocked` is that set minus the caller-supplied
 *   previously-unlocked set, so a host can tell a fresh unlock
 *   from one already shown without this module storing anything.
 *   Nothing is stored here: no cursor, no history, no balance.
 *
 * Deliberately NOT here: NO host (garden-wiring.ts, GardenView,
 * wiring/phase4-garden.ts, garden-register.ts do not import this
 * module — staging locks in the test); NO unlock contents
 * (places, quarters, stock rows are catalogue ids only, never
 * described); NO Garden Level bands or thresholds; NO sport or
 * lineage vocabulary; NO spend, gate, or visitation behaviour
 * (whether an unlocked entry is then visitable is the host's
 * decision, and the gate-currency question — honour count vs
 * bond vs research level — stays the already-flagged owner
 * decision in §2.3); NO effect in live play.
 */

function fail(message: string): never {
  throw new Error(`garden-unlocks: ${message}`);
}

export type GardenUnlockRequirement =
  | { kind: "gardenLevel"; atLeast: number }
  | { kind: "sportTitle"; title: string }
  | { kind: "lineageMilestone"; milestone: string }
  | { kind: "all"; requirements: GardenUnlockRequirement[] }
  | { kind: "any"; requirements: GardenUnlockRequirement[] };

export interface GardenUnlockEntry {
  /** Catalogue id (opaque to this module; never interpreted). */
  id: string;
  requires: GardenUnlockRequirement;
}

export interface GardenMilestones {
  /** Current Garden Level, or null when the Garden has no level yet. */
  gardenLevel: number | null;
  /** Sport titles currently held (opaque strings). */
  sportTitles: string[];
  /** Lineage milestones currently reached (opaque strings). */
  lineageMilestones: string[];
}

export interface GardenUnlockResult {
  /** Every catalogue entry whose requirement is met, catalogue order. */
  unlocked: string[];
  /** The unlocked entries not in the previously-unlocked set. */
  newlyUnlocked: string[];
}

function validateId(id: unknown): string {
  if (typeof id !== "string" || id.length === 0) {
    fail("every catalogue entry needs a non-empty string id");
  }
  return id;
}

function validateToken(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${name} must be a non-empty string`);
  }
  return value;
}

function validateRequirement(req: unknown): GardenUnlockRequirement {
  if (typeof req !== "object" || req === null || Array.isArray(req)) {
    fail("every requirement must be an object with a kind");
  }
  const r = req as Record<string, unknown>;
  switch (r.kind) {
    case "gardenLevel": {
      const atLeast = r.atLeast;
      if (
        typeof atLeast !== "number" ||
        !Number.isInteger(atLeast) ||
        atLeast < 0
      ) {
        fail("a gardenLevel requirement needs an integer atLeast >= 0");
      }
      return { kind: "gardenLevel", atLeast };
    }
    case "sportTitle":
      return { kind: "sportTitle", title: validateToken(r.title, "a sportTitle requirement needs a title") };
    case "lineageMilestone":
      return {
        kind: "lineageMilestone",
        milestone: validateToken(r.milestone, "a lineageMilestone requirement needs a milestone"),
      };
    case "all":
    case "any": {
      if (!Array.isArray(r.requirements) || r.requirements.length === 0) {
        fail(`an ${r.kind} requirement needs a non-empty requirements array`);
      }
      const inner = r.requirements.map(validateRequirement);
      return r.kind === "all"
        ? { kind: "all", requirements: inner }
        : { kind: "any", requirements: inner };
    }
    default:
      fail(`unknown requirement kind: ${String(r.kind)}`);
  }
}

function validateMilestones(m: GardenMilestones): void {
  if (m === null || typeof m !== "object" || Array.isArray(m)) {
    fail("milestones must be an object");
  }
  if (
    m.gardenLevel !== null &&
    (typeof m.gardenLevel !== "number" ||
      !Number.isInteger(m.gardenLevel) ||
      m.gardenLevel < 0)
  ) {
    fail("gardenLevel must be null or an integer >= 0");
  }
  if (!Array.isArray(m.sportTitles) || !Array.isArray(m.lineageMilestones)) {
    fail("sportTitles and lineageMilestones must be arrays");
  }
  for (const t of m.sportTitles) validateToken(t, "every sport title must be a non-empty string");
  for (const t of m.lineageMilestones) validateToken(t, "every lineage milestone must be a non-empty string");
}

function validateCatalogue(catalogue: unknown): GardenUnlockEntry[] {
  if (!Array.isArray(catalogue)) fail("catalogue must be an array");
  const seen = new Set<string>();
  return catalogue.map((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      fail("every catalogue entry must be an object with id and requires");
    }
    const id = validateId((entry as Record<string, unknown>).id);
    if (seen.has(id)) fail(`duplicate catalogue id: ${id}`);
    seen.add(id);
    return { id, requires: validateRequirement((entry as Record<string, unknown>).requires) };
  });
}

/**
 * Whether one requirement is met by the caller's milestones.
 * A null gardenLevel meets no level requirement. Leaf checks are
 * exact string membership; `all` needs every branch, `any` needs
 * at least one.
 */
export function requirementMet(
  req: GardenUnlockRequirement,
  milestones: GardenMilestones,
): boolean {
  const checked = validateRequirement(req);
  validateMilestones(milestones);
  switch (checked.kind) {
    case "gardenLevel":
      return milestones.gardenLevel !== null && milestones.gardenLevel >= checked.atLeast;
    case "sportTitle":
      return milestones.sportTitles.includes(checked.title);
    case "lineageMilestone":
      return milestones.lineageMilestones.includes(checked.milestone);
    case "all":
      return checked.requirements.every((inner) => requirementMet(inner, milestones));
    case "any":
      return checked.requirements.some((inner) => requirementMet(inner, milestones));
  }
}

/**
 * Evaluate a whole catalogue against the caller's milestones.
 * `previouslyUnlocked` (default []) is the host's record of
 * entries already shown; it never adds to `unlocked`, it only
 * filters `newlyUnlocked`. Inputs are never mutated.
 */
export function gardenUnlocks(
  milestones: GardenMilestones,
  catalogue: GardenUnlockEntry[],
  previouslyUnlocked: string[] = [],
): GardenUnlockResult {
  validateMilestones(milestones);
  const entries = validateCatalogue(catalogue);
  if (!Array.isArray(previouslyUnlocked)) {
    fail("previouslyUnlocked must be an array");
  }
  for (const id of previouslyUnlocked) validateId(id);
  const seen = new Set(previouslyUnlocked);
  const unlocked: string[] = [];
  const newlyUnlocked: string[] = [];
  for (const entry of entries) {
    if (requirementMet(entry.requires, milestones)) {
      unlocked.push(entry.id);
      if (!seen.has(entry.id)) newlyUnlocked.push(entry.id);
    }
  }
  return { unlocked, newlyUnlocked };
}
