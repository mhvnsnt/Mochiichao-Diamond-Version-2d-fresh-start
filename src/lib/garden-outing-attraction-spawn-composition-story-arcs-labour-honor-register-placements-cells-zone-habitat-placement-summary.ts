/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary — one outing plus its Garden news plus
 * what its journey brings home plus what the Garden does on its
 * own plus what its zones recognise as habitats plus what those
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
 * solver's placement shape plus what one caller-named Garden
 * record reads as in one line, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement
 *   bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement
 *   (slice 63);
 * - one Garden record's one-line summary via garden-wiring's
 *   gardenSummary over a caller-supplied Garden record: the
 *   species id, the Garden form, the dominant stat, the type
 *   variant or "none", the Bond, the Rebirths, and whether the
 *   record is Mythic — exactly as gardenSummary reports it,
 *   copied fresh as a string. A summary is a reading, never a
 *   stored value: it is recomputed from the record the caller
 *   hands it on every call, and nothing here writes it back
 *   into any record.
 *
 * The summary section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * or placement values. In particular it is NOT read off the
 * bundle's placement section or its zone-habitat solve: the
 * caller supplies the record explicitly, and the bundle's
 * records, zones, and solves are never used to pick it — a
 * record the bundle never names still summarises from its own
 * fields, and a record the bundle names still summarises only
 * from the caller-supplied copy. And it does NOT feed the
 * bundle's sections: the bundle section still reads its own
 * caller-supplied inputs, never the summary section's string
 * — summarising a record never solves, changes, or re-solves
 * a habitat, never places, moves, or removes a cell, and
 * never writes anything back into any record's habitats cache
 * or any other field. No order is invented between the bundle
 * and the summary section beyond each read's own order. A
 * summary is a summary this module never stores or registers
 * in live play, and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged summary and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register-placements-cells-zone-habitat-placement
 *   bundle and the summary section beyond each section's own
 *   order;
 * - NO reconciliation of the two sections' pictures: the
 *   summary section's facts are exactly what gardenSummary
 *   reports over the caller-supplied record, and the bundle's
 *   facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement
 *   reports over its own inputs;
 * - NO summary computed from a bundle value (above): the
 *   record is caller-supplied, never read off a bond list, a
 *   decay breakdown, a comfort day, a thanks intensity, a
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
 *   placements zone list, a cells listing, a cells item, a
 *   zone-habitat solve, a solved habitat, a placement cell,
 *   or a placement item;
 * - NO summary-to-placements chaining (above): a summary
 *   never makes a placements-cache entry, and a
 *   placements-cache entry never summarises a record;
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
 *   placements, cells, zone-habitat, placement, or summary
 *   writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a summary, a form, a dominant stat,
 *   a variant, a Bond, a Rebirths count, or a Mythic flag on
 *   tiers, richness, weights, stock, or spawn behaviour, and
 *   NO encounter, spawn, or route decision (whether a
 *   summary is consulted anywhere is a host decision, not
 *   this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a summary is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the summary string is a fresh value on
 * every call. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement";
import {
  gardenSummary,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The summary section's inputs: one caller-supplied Garden record. */
export interface SummaryInputs {
  /** The Garden record to summarise, as the caller built it (opaque ids). */
  record: GardenSaveRecord;
}

/** The summary section's report: the one-line summary, exactly as garden-wiring reports it. */
export interface SummaryReport {
  /** The one-line summary string, exactly as gardenSummary reports it. */
  summary: string;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement bundle's inputs, as slice 63 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementInputs;
  /** The summary section's inputs. */
  summary: SummaryInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement bundle, exactly as slice 63 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement;
  /** The summary, exactly as garden-wiring reports it. */
  summary: SummaryReport;
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
 * zone's placements recognise as a habitat plus what that one
 * zone's placements look like in the solver's placement shape
 * plus what one caller-named Garden record reads as in one
 * line: outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat-placement
 * bundle + one Garden record summary, each exactly as its own
 * read reports it, side by side, with no merged summary and no
 * reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement inputs must be an object",
    );
  }
  if (inputs.summary === null || typeof inputs.summary !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary: summary inputs must be an object",
    );
  }
  if (
    inputs.summary.record === null ||
    typeof inputs.summary.record !== "object" ||
    Array.isArray(inputs.summary.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary: summary record must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
    );
  const summary = gardenSummary(inputs.summary.record);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacement,
    summary: { summary },
  };
}
