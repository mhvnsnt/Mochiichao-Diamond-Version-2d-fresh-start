/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding — one outing plus its Garden
 * news plus what its journey brings home plus what the Garden
 * does on its own plus what its zones recognise as habitats
 * plus what those habitats attract plus what that attraction
 * means for spawn rows plus what the composition pass says
 * about a recognised habitat plus what the story beats say
 * about who is present plus what the arc beats say about each
 * resident's arc plus whether each caller-named Garden job runs
 * or idles plus what the caller-supplied honour sources add up
 * to plus what the caller-supplied Garden register lists plus
 * what the caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one zone's
 * placements recognise as a habitat plus what that one zone's
 * placements look like in the solver's placement shape plus
 * what one caller-named Garden record reads as in one line
 * plus whether two caller-supplied Garden records pass the
 * breeding gate, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary
 *   (slice 64);
 * - whether two caller-supplied Garden records pass the
 *   breeding gate via garden-wiring's canBreed, exactly as
 *   garden-wiring defines it: neither record Mythic, and both
 *   Bonds strictly above 50 (a Bond of exactly 50 does not
 *   pass). The gate is a pure predicate only, as its own
 *   comment states: it does not create an egg, it does not
 *   decide a species, and it does not change either record.
 *
 * The breeding section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, or summary values. In particular it is NOT read
 * off the bundle's summary string or its placement section:
 * the caller supplies both parents explicitly, and the
 * bundle's records, zones, and solves are never used to pick
 * them — parents the bundle never names still gate from their
 * own fields, and records the bundle names still gate only
 * when the caller hands them over as parents. And it does NOT
 * feed the bundle's sections: the bundle section still reads
 * its own caller-supplied inputs, never the breeding section's
 * boolean — gating two records never solves, changes, or
 * re-solves a habitat, never places, moves, or removes a cell,
 * never summarises a record, and never writes anything back
 * into any record. No order is invented between the bundle
 * and the breeding section beyond each read's own order. A
 * gate result is a reading this module never stores or
 * registers in live play, and no record is appended to any
 * log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged breeding result and NO order invented between
 *   the outing-attraction-spawn-composition-story-arcs-labour-
 *   honour-register-placements-cells-zone-habitat-placement-
 *   summary bundle and the breeding section beyond each
 *   section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   breeding section's fact is exactly what canBreed reports
 *   over the caller-supplied parents, and the bundle's facts
 *   are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary
 *   reports over its own inputs;
 * - NO breeding gate computed from a bundle value (above):
 *   both parents are caller-supplied, never read off a bond
 *   list, a decay breakdown, a comfort day, a thanks
 *   intensity, a level summary, a bridge record, a check-in
 *   beat, a snapshot lens, a journey visit, an unlock
 *   evaluation, an individual summary, a teacher reading, a
 *   movement reading, an arrival reading, a research reading,
 *   a discovery candidate, a news item, an inbound reading, a
 *   migration, a story beat or arc inside the bundle, an
 *   attraction reading, a spawn annotation, a habitat
 *   reading, a composition reading, a story reading, an arc
 *   reading, a labour status, an honour entry, a register
 *   entry, a register recognised flag, a placements habitat,
 *   a placements zone list, a cells listing, a cells item, a
 *   zone-habitat solve, a solved habitat, a placement cell,
 *   a placement item, or a summary string;
 * - NO breeding-to-placements chaining (above): a gate
 *   result never makes a placements-cache entry, and a
 *   placements-cache entry never gates two records;
 * - NO egg, NO species choice, and NO breeding action: the
 *   gate does not create a breeding egg (createBreedingEgg
 *   is a separate garden-wiring read, not composed here),
 *   and it does not pick a species for any egg — the
 *   species question is HELD by garden-wiring's own comment
 *   (the higher-Bond parent's base form by default, with a
 *   player override to either parent's species), and nothing
 *   here settles it;
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record — it only
 *   reads the parents the caller hands it, and no record is
 *   appended to any log here;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual,
 *   teacher, movement, arrival, research, discovery, news,
 *   inbound, migration, story, arc, habitat, attraction,
 *   spawn, composition, labour, honour, register,
 *   placements, cells, zone-habitat, placement, summary, or
 *   breeding writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a gate result, a Bond, or a Mythic
 *   flag on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a gate result is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a gate result is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the gate boolean is a fresh value on
 * every call. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary";
import {
  canBreed,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The breeding section's inputs: two caller-supplied Garden records. */
export interface BreedingInputs {
  /** The first caller-supplied parent record, as the caller built it (opaque ids). */
  parentA: GardenSaveRecord;
  /** The second caller-supplied parent record, as the caller built it (opaque ids). */
  parentB: GardenSaveRecord;
}

/** The breeding section's report: the gate result, exactly as garden-wiring reports it. */
export interface BreedingReport {
  /** Whether both parents pass the breeding gate, exactly as canBreed reports it. */
  canBreed: boolean;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary bundle's inputs, as slice 64 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryInputs;
  /** The breeding section's inputs. */
  breeding: BreedingInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary bundle, exactly as slice 64 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary;
  /** The breeding gate result, exactly as garden-wiring reports it. */
  breeding: BreedingReport;
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
 * line plus whether two caller-supplied Garden records pass
 * the breeding gate: outing-attraction-spawn-composition-
 * story-arcs-labour-honour-register-placements-cells-zone-
 * habitat-placement-summary bundle + one breeding gate, each
 * exactly as its own read reports it, side by side, with no
 * merged breeding result and no reconciliation between their
 * pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreeding {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary inputs must be an object",
    );
  }
  if (inputs.breeding === null || typeof inputs.breeding !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding: breeding inputs must be an object",
    );
  }
  if (
    inputs.breeding.parentA === null ||
    typeof inputs.breeding.parentA !== "object" ||
    Array.isArray(inputs.breeding.parentA)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding: breeding parentA must be an object",
    );
  }
  if (
    inputs.breeding.parentB === null ||
    typeof inputs.breeding.parentB !== "object" ||
    Array.isArray(inputs.breeding.parentB)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding: breeding parentB must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary,
    );
  const breeding = canBreed(inputs.breeding.parentA, inputs.breeding.parentB);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummary,
    breeding: { canBreed: breeding },
  };
}
