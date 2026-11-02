/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * — one outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows
 * plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc
 * plus whether each caller-named Garden job runs or idles
 * plus what the caller-supplied honour sources add up to
 * plus what the caller-supplied Garden register lists
 * plus what the caller-supplied placements solve to
 * plus what one caller-named zone has placed in it
 * plus what that one zone's placements recognise as a habitat,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells
 *   (slice 61);
 * - one single-zone habitat solve via garden-wiring's
 *   solveZoneHabitat over a caller-supplied Garden record, a
 *   caller-named zone, caller-supplied recipes, and optional
 *   caller-supplied solve options: the habitat that zone's
 *   placements recognise, or null when they recognise none.
 *   A zone with no placements solves to null, never an error.
 *
 * The zone-habitat section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, or cells values. In
 * particular it is NOT read off the bundle's placements
 * section: the caller names the zone explicitly, and the
 * bundle's placements zone list is never used to pick it — a
 * zone the bundle's placements list does not name still
 * solves from its own placements, and a zone the bundle's
 * placements list names still solves only from its own
 * placements. And it does NOT feed the bundle's placements
 * section: the placements section still reads its own
 * caller-supplied record and recipes, never the zone-habitat
 * section's solve — solving one zone's habitat never solves,
 * changes, or re-solves any other zone's habitat, and never
 * writes anything back into any record's habitats cache. No
 * order is invented between the bundle and the zone-habitat
 * section beyond each read's own order. A zone-habitat solve
 * is a summary this module never stores or registers in live
 * play, and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged zone habitat and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register-placements-cells bundle and the
 *   zone-habitat section beyond each section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   zone-habitat section's facts are exactly what
 *   solveZoneHabitat reports over the caller-supplied record,
 *   zone, recipes, and options, and the bundle's facts are
 *   exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells
 *   reports over its own inputs;
 * - NO zone-habitat solve computed from a bundle value
 *   (above): the record, the zone, the recipes, and the solve
 *   options are caller-supplied, never read off a bond list,
 *   a decay breakdown, a comfort day, a thanks intensity, a
 *   level summary, a bridge record, a check-in beat, a
 *   snapshot lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement reading,
 *   an arrival reading, a research reading, a discovery
 *   candidate, a news item, an inbound reading, a migration,
 *   a story beat or arc inside the bundle, an attraction
 *   reading, a spawn annotation, a habitat reading, a
 *   composition reading, a story reading, an arc reading, a
 *   labour status, an honour entry, a register entry, a
 *   register recognised flag, a placements habitat, a
 *   placements zone list, a cells listing, or a cells item;
 * - NO zone-habitat-to-placements chaining (above): a solved
 *   zone habitat never makes a placements-cache entry, and a
 *   placements-cache entry never solves a zone habitat;
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record — it only
 *   reads the record the caller hands it, and no record is
 *   appended to any log here;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual,
 *   teacher, movement, arrival, research, discovery, news,
 *   inbound, migration, story, arc, habitat, attraction,
 *   spawn, composition, labour, honour, register,
 *   placements, cells, or zone-habitat writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a solved zone habitat, a null solve,
 *   a tier, an extent, or a finish on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether a zone-habitat solve is
 *   consulted anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a zone-habitat solve is applied anywhere is
 *   a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the solved habitat, when one is reported,
 * is a fresh copy too. Loud failures (throw) on a malformed
 * input bundle and on any failure propagated from either
 * composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells";
import {
  solveZoneHabitat,
  type GardenPlacementSolveOptions,
  type GardenSaveRecord,
} from "./garden-wiring";
import type { HabitatRecipe, SolvedHabitat } from "./garden-habitats";

/** The zone-habitat section's inputs: a caller-supplied record, zone, recipes, and optional solve options. */
export interface ZoneHabitatInputs {
  /** The Garden record whose zone is solved, as the caller built it (opaque ids). */
  record: GardenSaveRecord;
  /** The zone whose placements are solved, as the caller names it. */
  zoneId: string;
  /** Recipes the zone solves against, as the caller built them (owner slot S1, never authored here). */
  recipes: readonly HabitatRecipe[];
  /** Solve options for the zone solve (cap, categories lookup); omitted means the solver's defaults. */
  options?: GardenPlacementSolveOptions;
}

/** The zone-habitat section's report: the single-zone solve, exactly as garden-wiring reports it, copied fresh. */
export interface ZoneHabitatReport {
  /** The zone that was solved, exactly as the caller named it. */
  zoneId: string;
  /** The habitat that zone's placements recognise, or null when they recognise none, copied fresh. */
  solved: SolvedHabitat | null;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells bundle's inputs, as slice 61 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs;
  /** The zone-habitat section's inputs. */
  zoneHabitat: ZoneHabitatInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells bundle, exactly as slice 61 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells;
  /** The zone-habitat solve, exactly as garden-wiring reports it, copied fresh. */
  zoneHabitat: ZoneHabitatReport;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat plus what
 * the story beats say about who is present plus what the arc
 * beats say about each resident's arc plus whether each
 * caller-named Garden job runs or idles plus what the
 * caller-supplied honour sources add up to plus what the
 * caller-supplied Garden register lists plus what the
 * caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one
 * zone's placements recognise as a habitat:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-
 * register-placements-cells bundle + one single-zone habitat
 * solve, each exactly as its own read reports it, side by
 * side, with no merged habitat and no reconciliation between
 * their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells inputs must be an object",
    );
  }
  if (inputs.zoneHabitat === null || typeof inputs.zoneHabitat !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: zoneHabitat inputs must be an object",
    );
  }
  if (
    inputs.zoneHabitat.record === null ||
    typeof inputs.zoneHabitat.record !== "object" ||
    Array.isArray(inputs.zoneHabitat.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: zoneHabitat record must be an object",
    );
  }
  if (typeof inputs.zoneHabitat.zoneId !== "string" || inputs.zoneHabitat.zoneId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: zoneHabitat zoneId must be a non-empty string",
    );
  }
  if (!Array.isArray(inputs.zoneHabitat.recipes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: zoneHabitat recipes must be an array",
    );
  }
  if (
    inputs.zoneHabitat.options !== undefined &&
    (inputs.zoneHabitat.options === null || typeof inputs.zoneHabitat.options !== "object")
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat: zoneHabitat options must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
    );
  const zoneId: string = inputs.zoneHabitat.zoneId;
  const solvedRaw = solveZoneHabitat(
    inputs.zoneHabitat.record,
    zoneId,
    inputs.zoneHabitat.recipes,
    inputs.zoneHabitat.options ?? {},
  );
  const solved: SolvedHabitat | null = solvedRaw === null ? null : { ...solvedRaw };
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells,
    zoneHabitat: {
      zoneId,
      solved,
    },
  };
}
