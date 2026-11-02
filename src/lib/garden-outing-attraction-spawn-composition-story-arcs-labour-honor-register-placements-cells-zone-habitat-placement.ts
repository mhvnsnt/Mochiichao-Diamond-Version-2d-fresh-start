/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement — one outing plus its Garden news plus what its
 * journey brings home plus what the Garden does on its own
 * plus what its zones recognise as habitats plus what those
 * habitats attract plus what that attraction means for spawn
 * rows plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc
 * plus whether each caller-named Garden job runs or idles
 * plus what the caller-supplied honour sources add up to
 * plus what the caller-supplied Garden register lists
 * plus what the caller-supplied placements solve to
 * plus what one caller-named zone has placed in it
 * plus what that one zone's placements recognise as a habitat
 * plus what that one zone's placements look like in the
 * solver's placement shape, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat
 *   (slice 62);
 * - one zone's placements converted to the slice-1 solver's
 *   placement shape via garden-wiring's
 *   zonePlacementToHabitatPlacement over a caller-supplied
 *   Garden record, a caller-named zone, and an optional
 *   caller-supplied categories lookup: the zone id plus its
 *   placed cells in zone-map order, each as its position key,
 *   its item id, and its categories (empty when no lookup is
 *   supplied). Rotation is NOT carried into the solver shape:
 *   the conversion is itemId only, exactly as garden-wiring
 *   defines it. A zone with no placements converts to an
 *   empty cells list, never an error.
 *
 * The placement section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, or zone-habitat
 * values. In particular it is NOT read off the bundle's
 * placements section: the caller names the zone explicitly,
 * and the bundle's placements zone list is never used to pick
 * it — a zone the bundle's placements list does not name
 * still converts from its own placements, and a zone the
 * bundle's placements list names still converts only from its
 * own placements. And it does NOT feed the bundle's placements
 * section: the placements section still reads its own
 * caller-supplied record and recipes, never the placement
 * section's conversion — converting a zone's placements never
 * solves, changes, or re-solves a habitat on its own, and
 * never writes anything back into any record's habitats cache.
 * No order is invented between the bundle and the placement
 * section beyond each read's own order. A placement conversion
 * is a summary this module never stores or registers in live
 * play, and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged placement and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register-placements-cells-zone-habitat bundle and
 *   the placement section beyond each section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   placement section's facts are exactly what
 *   zonePlacementToHabitatPlacement reports over the
 *   caller-supplied record, zone, and categories lookup, and
 *   the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat
 *   reports over its own inputs;
 * - NO placement conversion computed from a bundle value
 *   (above): the record, the zone, and the categories lookup
 *   are caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement reading,
 *   an arrival reading, a research reading, a discovery
 *   candidate, a news item, an inbound reading, a migration,
 *   a story beat or arc inside the bundle, an attraction
 *   reading, a spawn annotation, a habitat reading, a
 *   composition reading, a story reading, an arc reading, a
 *   labour status, an honour entry, a register entry, a
 *   register recognised flag, a placements habitat, a
 *   placements zone list, a cells listing, a cells item, a
 *   zone-habitat solve, or a solved habitat;
 * - NO placement-to-placements chaining (above): a converted
 *   placement never makes a placements-cache entry, and a
 *   placements-cache entry never converts a placement;
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
 *   placements, cells, zone-habitat, or placement writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a converted placement, a cells count,
 *   a cell item, or a category list on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether a placement conversion
 *   is consulted anywhere is a host decision, not this
 *   read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a placement conversion is applied anywhere
 *   is a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the placement cells are fresh copies too.
 * Loud failures (throw) on a malformed input bundle and on
 * any failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat";
import {
  zonePlacementToHabitatPlacement,
  type GardenSaveRecord,
} from "./garden-wiring";

/** One converted placement cell: its position key, its item id, and its categories, copied fresh. */
export interface PlacementCellReport {
  /** The position key of the placed cell, exactly as the record keys it. */
  id: string;
  /** The placed item's id, exactly as the record stores it. */
  itemId: string;
  /** Category tags for the item, from the caller's lookup, or an empty list when no lookup is supplied. */
  categories: string[];
}

/** The placement section's inputs: a caller-supplied record, zone, and optional categories lookup. */
export interface PlacementInputs {
  /** The Garden record whose zone is converted, as the caller built it (opaque ids). */
  record: GardenSaveRecord;
  /** The zone whose placements are converted, as the caller names it. */
  zoneId: string;
  /** Categories lookup for the conversion; omitted means every cell converts with no categories. */
  categoriesFor?: (itemId: string) => readonly string[];
}

/** The placement section's report: the solver-shape conversion, exactly as garden-wiring reports it, copied fresh. */
export interface PlacementReport {
  /** The zone that was converted, exactly as the caller named it. */
  zoneId: string;
  /** The zone's placed cells in zone-map order, each as its position key plus its item id plus its categories. */
  cells: PlacementCellReport[];
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat bundle's inputs, as slice 62 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatInputs;
  /** The placement section's inputs. */
  placement: PlacementInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat bundle, exactly as slice 62 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat;
  /** The placement conversion, exactly as garden-wiring reports it, copied fresh. */
  placement: PlacementReport;
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
 * zone's placements recognise as a habitat plus what that
 * one zone's placements look like in the solver's placement
 * shape: outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat bundle + one
 * zone-placement conversion, each exactly as its own read
 * reports it, side by side, with no merged placement and no
 * reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat inputs must be an object",
    );
  }
  if (inputs.placement === null || typeof inputs.placement !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: placement inputs must be an object",
    );
  }
  if (
    inputs.placement.record === null ||
    typeof inputs.placement.record !== "object" ||
    Array.isArray(inputs.placement.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: placement record must be an object",
    );
  }
  if (typeof inputs.placement.zoneId !== "string" || inputs.placement.zoneId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: placement zoneId must be a non-empty string",
    );
  }
  if (
    inputs.placement.categoriesFor !== undefined &&
    typeof inputs.placement.categoriesFor !== "function"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement: placement categoriesFor must be a function",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
    );
  const zoneId: string = inputs.placement.zoneId;
  const raw = zonePlacementToHabitatPlacement(
    inputs.placement.record,
    zoneId,
    inputs.placement.categoriesFor,
  );
  const cells: PlacementCellReport[] = raw.cells.map((cell) => ({
    id: cell.id,
    itemId: cell.itemId,
    categories: cell.categories ? [...cell.categories] : [],
  }));
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitat,
    placement: {
      zoneId: raw.zoneId ?? zoneId,
      cells,
    },
  };
}
