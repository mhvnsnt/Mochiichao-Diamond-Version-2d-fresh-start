/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * — one outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows plus
 * what the composition pass says about a recognised habitat
 * plus what the story beats say about who is present plus
 * what the arc beats say about each resident's arc plus
 * whether each caller-named Garden job runs or idles plus
 * what the caller-supplied honour sources add up to plus what
 * the caller-supplied Garden register lists plus what the
 * caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one
 * zone's placements recognise as a habitat plus what that
 * one zone's placements look like in the solver's placement
 * shape plus what one caller-named Garden record reads as in
 * one line plus whether two caller-supplied Garden records
 * pass the breeding gate plus which of two caller-supplied
 * Garden stat lines wins a race plus which of two
 * caller-supplied Garden stat lines wins a spar plus what
 * stat line two caller-supplied Garden stat lines hand down,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar
 *   (slice 67);
 * - what stat line two caller-supplied Garden stat lines hand
 *   down via garden-wiring's inheritedGardenStats, exactly as
 *   garden-wiring defines it: per stat, seed70 in 0-99 picks
 *   the higher parent stat when seed70 is below 70 and the
 *   lower parent stat otherwise, each picked stat clamped to
 *   0-99. The inherited line is a pure outcome only, as its
 *   own comment states: it does not change either parent
 *   stat line, it does not award anything, it does not rank
 *   a record, and it does not decide a species or an egg.
 *
 * The inherited section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, or spar values. In
 * particular it is NOT read off the bundle's summary string,
 * its placement section, its breeding gate, its race winner,
 * or its spar winner: the caller supplies both parent stat
 * lines and the seed explicitly, and the bundle's records,
 * zones, solves, parents, racers, and sparrers are never used
 * to pick them — stat lines the bundle never names still hand
 * down from their own numbers, and numbers the bundle names
 * still hand down only when the caller hands them over as
 * parents. And it does NOT feed the bundle's sections:
 * the bundle section still reads its own caller-supplied
 * inputs, never the inherited section's stats — inheriting
 * stats never solves, changes, or re-solves a habitat, never
 * places, moves, or removes a cell, never summarises a
 * record, never re-gates a breeding pair, never re-races a
 * pair, never re-spars a pair, and never writes anything
 * back into any record — and no inherited result is written
 * back anywhere, no record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged inherited result and NO order invented between
 *   the bundle and the inherited section beyond each
 *   section's own order, and NO reconciliation of the two
 *   sections' pictures;
 * - NO inherited stats computed from a bundle value (both
 *   parent stat lines and the seed are caller-supplied,
 *   never read off a bond list, decay breakdown, comfort
 *   day, thanks intensity, level summary, bridge record,
 *   check-in beat, snapshot lens, journey visit, unlock
 *   evaluation, individual summary, teacher reading,
 *   movement reading, arrival reading, research reading,
 *   discovery candidate, news item, inbound reading,
 *   migration, story beat or arc inside the bundle,
 *   attraction reading, spawn annotation, habitat reading,
 *   composition reading, story reading, arc reading, labour
 *   status, honour entry, register entry, register
 *   recognised flag, placements habitat, placements zone
 *   list, cells listing, cells item, zone-habitat solve,
 *   solved habitat, placement cell, placement item, summary
 *   string, breeding gate, race winner, or spar winner);
 * - NO inherited-to-placements chaining, NO
 *   inherited-to-breeding chaining, NO inherited-to-race
 *   chaining, and NO inherited-to-spar chaining (an
 *   inherited line never makes a placements-cache entry,
 *   never gates or un-gates a breeding pair, never re-races
 *   or re-spars a pair);
 * - NO egg and NO species choice (createBreedingEgg is a
 *   separate read, not composed here; the species question
 *   stays HELD per garden-wiring's own comment);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual,
 *   teacher, movement, arrival, research, discovery, news,
 *   inbound, migration, story, arc, habitat, attraction,
 *   spawn, composition, labour, honour, register,
 *   placements, cells, zone-habitat, placement, summary,
 *   breeding, race, spar, or inherited writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of an inherited stat, a parent stat,
 *   or a seed value on tiers, richness, weights, stock, or
 *   spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether an inherited line is consulted
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether an inherited line is applied anywhere is
 *   a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the inherited stats are a fresh object
 * on every call. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar";
import {
  inheritedGardenStats,
} from "./garden-wiring";
import type {
  GardenStats,
} from "./mochiichao-systems";

/** The inherited section's inputs: two caller-supplied parent stat lines and the seed. */
export interface InheritedInputs {
  /** The first caller-supplied parent's stat line, as the caller built it. */
  parentA: GardenStats;
  /** The second caller-supplied parent's stat line, as the caller built it. */
  parentB: GardenStats;
  /** The deterministic seed in 0-99: below 70 picks the higher parent stat per stat, otherwise the lower. */
  seed70: number;
}

/** The inherited section's report: the inherited stat line, exactly as garden-wiring reports it. */
export interface InheritedReport {
  /** The inherited Garden stat line, exactly as inheritedGardenStats reports it. */
  stats: GardenStats;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar bundle's inputs, as slice 67 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs;
  /** The inherited section's inputs. */
  inherited: InheritedInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar bundle, exactly as slice 67 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar;
  /** The inherited stat line, exactly as garden-wiring reports it. */
  inherited: InheritedReport;
}

/**
 * One outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows plus
 * what the composition pass says about a recognised habitat
 * plus what the story beats say about who is present plus
 * what the arc beats say about each resident's arc plus
 * whether each caller-named Garden job runs or idles plus
 * what the caller-supplied honour sources add up to plus what
 * the caller-supplied Garden register lists plus what the
 * caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one
 * zone's placements recognise as a habitat plus what that one
 * zone's placements look like in the solver's placement shape
 * plus what one caller-named Garden record reads as in one
 * line plus whether two caller-supplied Garden records pass
 * the breeding gate plus which of two caller-supplied Garden
 * stat lines wins a race plus which of two caller-supplied
 * Garden stat lines wins a spar plus what stat line two
 * caller-supplied Garden stat lines hand down:
 * outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat-placement-
 * summary-breeding-race-spar bundle + one inherited stat
 * line, each exactly as its own read reports it, side by
 * side, with no merged inherited result and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar inputs must be an object",
    );
  }
  if (inputs.inherited === null || typeof inputs.inherited !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: inherited inputs must be an object",
    );
  }
  if (
    inputs.inherited.parentA === null ||
    typeof inputs.inherited.parentA !== "object" ||
    Array.isArray(inputs.inherited.parentA)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: inherited parentA must be an object",
    );
  }
  if (
    inputs.inherited.parentB === null ||
    typeof inputs.inherited.parentB !== "object" ||
    Array.isArray(inputs.inherited.parentB)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: inherited parentB must be an object",
    );
  }
  if (
    typeof inputs.inherited.seed70 !== "number" ||
    !Number.isFinite(inputs.inherited.seed70)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited: inherited seed70 must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar,
    );
  const inherited = inheritedGardenStats(inputs.inherited.parentA, inputs.inherited.parentB, inputs.inherited.seed70);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar,
    inherited: { stats: inherited },
  };
}
