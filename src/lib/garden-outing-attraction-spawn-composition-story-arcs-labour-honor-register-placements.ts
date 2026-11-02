/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements
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
 * plus what the caller-supplied placements solve to,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register
 *   bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register
 *   (slice 59);
 * - one placements reading via garden-wiring's recomputeHabitats
 *   over a caller-supplied Garden record and caller-supplied
 *   recipes: the derived habitats cache the record's placements
 *   solve to, plus the zones that carry placements, in record
 *   order. The recomputed record itself is NOT reported here
 *   and NOT stored anywhere: the caller keeps its record, and
 *   this read only reports the cache and the zone list.
 *
 * The placements section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, or register values. In particular it is NOT
 * read off the bundle's habitats section, story residents,
 * arc residents, labour statuses, honour entries, or register
 * entries, and it does NOT feed the bundle's register section:
 * the register section still reads its own caller-supplied
 * register and habitats cache, never the placements section's
 * recomputed cache — a zone the placements solve and a zone
 * the register cache names are two separate caller inputs,
 * and a solved placement never makes a register home
 * recognised on its own. No order is invented between the
 * bundle and the placements section beyond each read's own
 * order. A placements reading is a summary this module never
 * stores or registers in live play, and no record is appended
 * to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged placements and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register bundle and the placements section beyond
 *   each section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   placements section's facts are exactly what
 *   recomputeHabitats reports over the caller-supplied record
 *   and recipes, and the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister
 *   reports over its own inputs;
 * - NO placements reading computed from a bundle value (above):
 *   the record, the recipes, and the solve options are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement
 *   reading, an arrival reading, a research reading, a
 *   discovery candidate, a news item, an inbound reading, a
 *   migration, a story beat or arc inside the bundle, an
 *   attraction reading, a spawn annotation, a habitat
 *   reading, a composition reading, a story reading, an arc
 *   reading, a labour status, an honour entry, a register
 *   entry, or a register recognised flag;
 * - NO placements writer: this module never places, moves, or
 *   removes a cell, never recomputes a stored cache, and
 *   never writes the recomputed cache back into any record
 *   — it only reads the record the caller hands it, and no
 *   record is appended to any log here;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, composition,
 *   labour, honour, register, or placements writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a placements count, a solved habitat,
 *   or a zone list on tiers, richness, weights, stock, or
 *   spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether a placements reading is consulted
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a placements reading is applied anywhere
 *   is a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the placements cache and zone list are
 * fresh too. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register";
import {
  recomputeHabitats,
  type GardenPlacementSolveOptions,
  type GardenSaveRecord,
  type GardenZoneHabitats,
} from "./garden-wiring";
import type { HabitatRecipe } from "./garden-habitats";

/** The placements section's inputs: a caller-supplied record, recipes, and solve options. */
export interface PlacementsInputs {
  /** The Garden record whose placements are read, as the caller built it (opaque ids). */
  record: GardenSaveRecord;
  /** Recipes the placements solve against, as the caller built them (owner slot S1, never authored here). */
  recipes: readonly HabitatRecipe[];
  /** Solve options for the placements read (cap, categories lookup); omitted means the solver's defaults. */
  options?: GardenPlacementSolveOptions;
}

/** The placements section's report: the placements read, exactly as garden-wiring reports it, copied fresh. */
export interface PlacementsReport {
  /** The derived habitats cache the record's placements solve to, zoneId -> solved habitat or null, copied fresh. */
  habitats: GardenZoneHabitats;
  /** Zones that carry placements, in record order. Zones with no placements get no cache entry and no zone-list entry. */
  zones: string[];
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register bundle's inputs, as slice 59 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegister: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs;
  /** The placements section's inputs. */
  placements: PlacementsInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register bundle, exactly as slice 59 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegister: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister;
  /** The placements reading, exactly as garden-wiring reports it, copied fresh. */
  placements: PlacementsReport;
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
 * caller-supplied placements solve to:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-
 * register bundle + one placements reading, each exactly as its
 * own read reports it, side by side, with no merged placements
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: outingAttractionSpawnCompositionStoryArcsLabourHonorRegister inputs must be an object",
    );
  }
  if (inputs.placements === null || typeof inputs.placements !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: placements inputs must be an object",
    );
  }
  if (
    inputs.placements.record === null ||
    typeof inputs.placements.record !== "object" ||
    Array.isArray(inputs.placements.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: placements record must be an object",
    );
  }
  if (!Array.isArray(inputs.placements.recipes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: placements recipes must be an array",
    );
  }
  if (
    inputs.placements.options !== undefined &&
    (inputs.placements.options === null || typeof inputs.placements.options !== "object")
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements: placements options must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegister =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
    );
  const record: GardenSaveRecord = inputs.placements.record;
  const recomputed = recomputeHabitats(
    record,
    inputs.placements.recipes,
    inputs.placements.options ?? {},
  );
  const habitats: GardenZoneHabitats = {};
  for (const [zoneId, solved] of Object.entries(recomputed.habitats)) {
    habitats[zoneId] = solved === null ? null : { ...solved };
  }
  const zones: string[] = Object.keys(record.placements ?? {});
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegister,
    placements: {
      habitats,
      zones,
    },
  };
}
