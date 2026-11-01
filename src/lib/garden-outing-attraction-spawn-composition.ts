/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition — one outing plus its
 * Garden news plus what its journey brings home plus what the
 * Garden does on its own plus what its zones recognise as
 * habitats plus what those habitats attract plus what that
 * attraction means for spawn rows plus what the composition
 * pass says about a recognised habitat, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn bundle from
 *   garden-outing-attraction-spawn (slice 53);
 * - one composition reading per caller-named composition entry,
 *   in caller order, via garden-composition's composeHabitat,
 *   over the solved habitat of the habitat reading that entry
 *   NAMES (by id) from the bundle's
 *   outingAttraction.outingHabitats.habitats section, with the
 *   entry's own caller-supplied composition tables (nearby
 *   context tags, modifier table, neighbouring solved habitats,
 *   combo table).
 *
 * The composition section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, or spawn values, and it
 * is NOT a re-solve of any placement — it reads only the
 * named reading's already-reported solved habitat, exactly as
 * the bundle reports it. Which reading a composition entry
 * names is the caller's decision, encoded in the input; a name
 * with no matching reading is a loud failure, never a silent
 * fallback to another reading or to an empty base. A null
 * solved habitat composes exactly as garden-composition
 * reports it: no variants (variants need a base), with
 * neighbours-only combos still able to fire. Composition is
 * classification only, inherited from garden-composition: it
 * never changes the base's recipeId, tier, extent, finish, or
 * character, and it never re-scores, reweights, or restocks
 * anything. Any future host that applies a variant or combo
 * does so with its own rules; no numeric effect lives here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-attraction-spawn bundle and the composition
 *   section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the composition section's facts are exactly what
 *   composeHabitat reports over the named reading's solved
 *   habitat and the entry's own tables, and the bundle's
 *   facts are exactly what gardenOutingAttractionSpawn
 *   reports over its own inputs;
 * - NO composition reading computed from a bundle value other
 *   than the named reading's solved habitat: the context
 *   tags, modifier table, neighbours, and combo table are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement
 *   reading, an arrival reading, a research reading, a
 *   discovery candidate, a news item, an inbound reading, a
 *   migration, a story, an arc, an attraction reading, a
 *   spawn annotation, or a habitat reading the entry did
 *   not name;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, or composition
 *   writer: a composition reading is a summary this module
 *   never stores or registers in live play, and no record is
 *   appended to any log here;
 * - NO recipe, modifier, or combo data authored for any
 *   habitat (owner slots S1/S5 in the wiring plan, never
 *   filled here; all tables are caller-supplied);
 * - NO numeric effect of a variant or combo on tiers,
 *   richness, weights, stock, or spawn behaviour (inherited
 *   from garden-composition);
 * - NO reweighting, NO stock added, NO weight band, and NO
 *   encounter/spawn/route decision (inherited from the
 *   slice-53 bundle);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a composed habitat is applied anywhere is
 *   a host decision, not this read's;
 * - NO season/festival/weather, story, arc, species, place,
 *   or range vocabulary authored (all ids, keys, and arc
 *   values are opaque caller strings; the #102 range rule is
 *   the host's filter);
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, and both autonomous cursors;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawn,
  type GardenOutingAttractionSpawn,
  type GardenOutingAttractionSpawnInputs,
} from "./garden-outing-attraction-spawn";
import {
  composeHabitat,
  type ComposedHabitat,
  type HabitatComposition,
} from "./garden-composition";
import type { SolvedHabitat } from "./garden-habitats";

/** One caller-named composition reading, over a named habitat reading's solved habitat. */
export interface CompositionEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** The id of the habitat reading whose solved habitat this entry composes. */
  habitatId: string;
  /** The entry's own composition tables; absent = no tags, modifiers, neighbours, or combos. */
  composition?: HabitatComposition;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionInputs {
  /** The outing-attraction-spawn bundle's inputs, as slice 53 takes them. */
  outingAttractionSpawn: GardenOutingAttractionSpawnInputs;
  /** The composition section's inputs: one entry per reading, in caller order. */
  composition: {
    entries: readonly CompositionEntry[];
  };
}

/** One composition entry's reading, copied fresh. */
export interface CompositionReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The habitat reading id the entry named, as supplied. */
  habitatId: string;
  /** The named reading's solved habitat, copied fresh, or null. */
  base: SolvedHabitat | null;
  /** Variant ids, exactly as garden-composition reports them, copied fresh. */
  variants: string[];
  /** Combo ids, exactly as garden-composition reports them, copied fresh. */
  combos: string[];
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat. */
export interface GardenOutingAttractionSpawnComposition {
  /** The outing-plus-attraction-plus-spawn bundle, exactly as slice 53 reports it. */
  outingAttractionSpawn: GardenOutingAttractionSpawn;
  /** One composition reading per caller-named composition entry, in caller order. */
  composition: CompositionReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat:
 * outing-attraction-spawn bundle + per-entry composition
 * readings, each exactly as its own read reports it, side by
 * side, with no merged composition and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnComposition(
  inputs: GardenOutingAttractionSpawnCompositionInputs,
): GardenOutingAttractionSpawnComposition {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawn === null ||
    typeof inputs.outingAttractionSpawn !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition: outingAttractionSpawn inputs must be an object",
    );
  }
  if (inputs.composition === null || typeof inputs.composition !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition: composition inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.composition.entries)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition: composition entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.composition.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-attraction-spawn-composition: composition entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-attraction-spawn-composition: composition entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-attraction-spawn-composition: duplicate composition entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!isNonEmptyString(entry.habitatId)) {
      throw new Error(
        "garden-outing-attraction-spawn-composition: composition entry habitatId must be a non-empty string",
      );
    }
  }
  const outingAttractionSpawn = gardenOutingAttractionSpawn(
    inputs.outingAttractionSpawn,
  );
  const byId = new Map(
    outingAttractionSpawn.outingAttraction.outingHabitats.habitats.map(
      (reading) => [reading.id, reading],
    ),
  );
  const composition: CompositionReading[] = inputs.composition.entries.map(
    (entry) => {
      const reading = byId.get(entry.habitatId);
      if (reading === undefined) {
        throw new Error(
          `garden-outing-attraction-spawn-composition: unknown habitat reading id: ${entry.habitatId}`,
        );
      }
      const composed: ComposedHabitat = composeHabitat(
        reading.solved,
        entry.composition ?? {},
      );
      return {
        id: entry.id,
        habitatId: entry.habitatId,
        base: composed.base === null ? null : { ...composed.base },
        variants: [...composed.variants],
        combos: [...composed.combos],
      };
    },
  );
  return { outingAttractionSpawn, composition };
}
