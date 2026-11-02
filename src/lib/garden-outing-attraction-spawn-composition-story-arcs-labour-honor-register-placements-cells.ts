/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells
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
 * plus what one caller-named zone has placed in it,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements
 *   (slice 60);
 * - one placement-cells reading via garden-wiring's
 *   placementCellsInZone over a caller-supplied Garden record
 *   and a caller-named zone: the zone's placed cells, in
 *   zone-map order, each as its position key plus a fresh copy
 *   of its placed item (itemId and rotation). A zone with no
 *   placements reads as an empty list, never an error.
 *
 * The cells section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, or placements values. In
 * particular it is NOT read off the bundle's placements
 * section: the caller names the zone explicitly, and the
 * bundle's zone list is never used to pick it — a zone the
 * bundle's placements list does not name still reads its own
 * cells, and a zone the bundle's placements list names still
 * reads only its own cells. And it does NOT feed the bundle's
 * placements section: the placements section still reads its
 * own caller-supplied record and recipes, never the cells
 * section's listing — listing a zone's cells never solves,
 * changes, or re-solves a habitat on its own. No order is
 * invented between the bundle and the cells section beyond
 * each read's own order. A cells reading is a summary this
 * module never stores or registers in live play, and no
 * record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged cells and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register-placements bundle and the cells section
 *   beyond each section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   cells section's facts are exactly what
 *   placementCellsInZone reports over the caller-supplied
 *   record and zone, and the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements
 *   reports over its own inputs;
 * - NO cells reading computed from a bundle value (above):
 *   the record and the zone are caller-supplied, never read
 *   off a bond list, a decay breakdown, a comfort day, a
 *   thanks intensity, a level summary, a bridge record, a
 *   check-in beat, a snapshot lens, a journey visit, an
 *   unlock evaluation, an individual summary, a teacher
 *   reading, a movement reading, an arrival reading, a
 *   research reading, a discovery candidate, a news item, an
 *   inbound reading, a migration, a story beat or arc inside
 *   the bundle, an attraction reading, a spawn annotation, a
 *   habitat reading, a composition reading, a story reading,
 *   an arc reading, a labour status, an honour entry, a
 *   register entry, a register recognised flag, a placements
 *   habitat, or a placements zone list;
 * - NO cells-to-placements chaining (above): a listed cell
 *   never makes a habitat solved, and a solved habitat never
 *   adds a cell to the listing;
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
 *   placements, or cells writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a cells count, a cell item, or a
 *   rotation on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a cells reading is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a cells reading is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the cells list and every cell inside it
 * are fresh too. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements";
import {
  placementCellsInZone,
  type GardenPlacementCell,
  type GardenSaveRecord,
} from "./garden-wiring";

/** One placed cell, exactly as garden-wiring reports it, copied fresh. */
export interface PlacementCellEntry {
  /** The cell's position key within its zone, as the caller stored it. */
  key: string;
  /** The placed item: its item id and its facing, copied fresh. */
  cell: GardenPlacementCell;
}

/** The cells section's inputs: a caller-supplied record and a caller-named zone. */
export interface CellsInputs {
  /** The Garden record whose zone is read, as the caller built it (opaque ids). */
  record: GardenSaveRecord;
  /** The zone whose placed cells are listed, as the caller names it. */
  zoneId: string;
}

/** The cells section's report: the cells reading, exactly as garden-wiring reports it, copied fresh. */
export interface CellsReport {
  /** The zone that was read, exactly as the caller named it. */
  zoneId: string;
  /** The zone's placed cells, in zone-map order, each copied fresh. */
  cells: PlacementCellEntry[];
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements bundle's inputs, as slice 60 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsInputs;
  /** The cells section's inputs. */
  cells: CellsInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements bundle, exactly as slice 60 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements;
  /** The cells reading, exactly as garden-wiring reports it, copied fresh. */
  cells: CellsReport;
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
 * caller-named zone has placed in it:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-
 * register-placements bundle + one placement-cells reading, each
 * exactly as its own read reports it, side by side, with no
 * merged cells and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCells {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements inputs must be an object",
    );
  }
  if (inputs.cells === null || typeof inputs.cells !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells: cells inputs must be an object",
    );
  }
  if (
    inputs.cells.record === null ||
    typeof inputs.cells.record !== "object" ||
    Array.isArray(inputs.cells.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells: cells record must be an object",
    );
  }
  if (typeof inputs.cells.zoneId !== "string" || inputs.cells.zoneId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells: cells zoneId must be a non-empty string",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements,
    );
  const zoneId: string = inputs.cells.zoneId;
  const cells: PlacementCellEntry[] = placementCellsInZone(
    inputs.cells.record,
    zoneId,
  ).map(({ key, cell }) => ({ key, cell: { ...cell } }));
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacements,
    cells: {
      zoneId,
      cells,
    },
  };
}
