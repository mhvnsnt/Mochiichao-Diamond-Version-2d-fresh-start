// S14 slice 4 — DQB2 W4 attraction binding (pure library, no host yet).
//
// Wiring-plan step: solver output resolves spawn-table rows' `habitatClass`
// keys against recognised habitats (Pokopia M4's five axes — habitat x area
// x rarity x time x weather). What this module does, and what it does not:
//
// - DOES: turn recognised habitats (the W2 solver output, as cached per zone
//   by the W3 placement records) into visiting richness per habitat class:
//   how many recognised habitats realise each class. A spawn row whose
//   class is realised is marked attracted with that richness; every other
//   row is marked unattracted with richness 0. Rows keep their species,
//   weight, levels, method, order and every other field byte-for-byte —
//   this binding NEVER adds spawn-table stock (B3's rule: habitats raise
//   visiting richness along declared classes; they never add stock) and
//   NEVER reweights a table. Any future host that maps richness to a
//   weight does so with its own authored bands; no band lives here.
// - DOES NOT: invent a time/weather split. Bundle rows carry
//   timeOfDay/weather null until canon splits them, and this module takes
//   no time or weather input at all, so it cannot invent one — those two
//   M4 axes are inert by construction. Area is class-level only here:
//   Garden zones (the W3 cache keys) and bundle areaIds are different key
//   spaces, and no zone->area join is authored anywhere yet, so this
//   module does not pretend one exists; a host that knows the join passes
//   the zone's habitats for the area it serves.
// - DOES NOT: author any recipe, class mapping, or habitat content. Which
//   classes a recipe realises is caller-supplied data (the recipes
//   themselves are owner slot S1; the recipe->class table rides with
//   them). A recipe with no mapping contributes nothing, loudly tested.
// - DOES NOT: touch any live path yet. Staging locks in the test file
//   assert garden-wiring.ts, GardenView.tsx, encounters.ts and
//   spawnSelector.ts do not import this module. The host slice wires it
//   in once a zone->area join and authored bands exist.
//
// Pure: inputs are only read, never mutated. All outputs are fresh objects.

import type { SolvedHabitat } from "./garden-habitats";

/** A habitat class key, as spawn-table rows carry it (e.g. "small-ground"). */
export type HabitatClass = string;

/**
 * Maps a recognised habitat's recipe id to the habitat classes that recipe
 * realises. Caller-supplied data; an empty array means the recipe realises
 * no class and contributes nothing.
 */
export type ClassesForRecipe = (recipeId: string) => readonly string[];

/** Visiting richness per class: how many recognised habitats realise it. */
export type AttractionRichness = Record<string, number>;

/** The attraction annotation attached to one spawn row. */
export interface RowAttraction {
  /** The row's own habitatClass (null when the row declares none). */
  habitatClass: string | null;
  /** Visiting richness for that class (0 when unrealised or undeclared). */
  richness: number;
  /** True exactly when richness > 0. */
  attracted: boolean;
}

/** A spawn-table row, as far as this module reads it. Other fields ride along untouched. */
export interface SpawnRowLike {
  habitatClass?: string | null;
}

function fail(message: string): never {
  throw new Error(`garden-attraction: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function validateClasses(classes: unknown, recipeId: string): readonly string[] {
  if (!Array.isArray(classes)) fail(`classes for recipe "${recipeId}" must be an array`);
  const seen = new Set<string>();
  for (const cls of classes) {
    nonEmptyString(cls, `class for recipe "${recipeId}"`);
    seen.add(cls as string);
  }
  return [...seen];
}

/**
 * Count, per habitat class, how many recognised habitats realise it.
 * Null solver outputs (zones with no recognised habitat) are skipped.
 * One habitat counts at most once per class, even if its mapping lists
 * the class twice.
 */
export function attractionRichness(
  habitats: readonly (SolvedHabitat | null)[],
  classesForRecipe: ClassesForRecipe,
): AttractionRichness {
  if (!Array.isArray(habitats)) fail("habitats must be an array");
  const richness: AttractionRichness = {};
  for (const habitat of habitats) {
    if (habitat === null) continue;
    if (habitat === undefined || typeof habitat !== "object") fail("habitat must be a solved habitat or null");
    const recipeId = nonEmptyString(
      (habitat as SolvedHabitat).recipeId,
      "habitat recipeId",
    );
    for (const cls of validateClasses(classesForRecipe(recipeId), recipeId)) {
      richness[cls] = (richness[cls] ?? 0) + 1;
    }
  }
  return richness;
}

/**
 * The W3-cache shape (zoneId -> solver output for that zone), read as
 * plain data: this module takes no dependency on garden-wiring, so the
 * host passes its cache straight in.
 */
export type ZoneHabitats = Readonly<Record<string, SolvedHabitat | null>>;

/** Richness per Garden zone, for hosts that serve one zone at a time. */
export function attractionByZone(
  cache: ZoneHabitats,
  classesForRecipe: ClassesForRecipe,
): Record<string, AttractionRichness> {
  if (cache === null || typeof cache !== "object" || Array.isArray(cache)) {
    fail("zone habitats cache must be an object");
  }
  const out: Record<string, AttractionRichness> = {};
  for (const [zoneId, habitat] of Object.entries(cache)) {
    nonEmptyString(zoneId, "zone id");
    out[zoneId] = attractionRichness(habitat === null ? [] : [habitat], classesForRecipe);
  }
  return out;
}

function validateRichness(richness: unknown): AttractionRichness {
  if (richness === null || typeof richness !== "object" || Array.isArray(richness)) {
    fail("richness must be an object");
  }
  for (const [cls, value] of Object.entries(richness as Record<string, unknown>)) {
    nonEmptyString(cls, "richness class");
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      fail(`richness for class "${cls}" must be an integer >= 0`);
    }
  }
  return richness as AttractionRichness;
}

/**
 * Attach an attraction annotation to each spawn row, leaving every stock
 * field untouched: same rows, same order, same weights, same species.
 * A row with no declared class, or whose class has no richness, is
 * unattracted with richness 0. With an empty richness map every row is
 * unattracted — so with no placements, encounter behaviour is identical
 * to today apart from the annotation itself, which no live path reads yet.
 */
export function attractSpawnRows<T extends SpawnRowLike>(
  rows: readonly T[],
  richness: Readonly<AttractionRichness>,
): Array<T & { attraction: RowAttraction }> {
  if (!Array.isArray(rows)) fail("rows must be an array");
  const map = validateRichness(richness);
  return rows.map((row, index) => {
    if (row === null || typeof row !== "object") fail(`row ${index} must be an object`);
    const habitatClass = row.habitatClass ?? null;
    if (habitatClass !== null && typeof habitatClass !== "string") {
      fail(`row ${index} habitatClass must be a string or null`);
    }
    if (habitatClass !== null && habitatClass.length === 0) {
      fail(`row ${index} habitatClass must be a non-empty string or null`);
    }
    const value = habitatClass === null ? 0 : (map[habitatClass] ?? 0);
    return {
      ...row,
      attraction: { habitatClass, richness: value, attracted: value > 0 },
    };
  });
}
