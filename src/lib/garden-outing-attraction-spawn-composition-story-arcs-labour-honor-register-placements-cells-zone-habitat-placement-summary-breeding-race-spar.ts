/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar — one outing plus
 * its Garden news plus what its journey brings home plus what
 * the Garden does on its own plus what its zones recognise as
 * habitats plus what those habitats attract plus what that
 * attraction means for spawn rows plus what the composition
 * pass says about a recognised habitat plus what the story
 * beats say about who is present plus what the arc beats say
 * about each resident's arc plus whether each caller-named
 * Garden job runs or idles plus what the caller-supplied
 * honour sources add up to plus what the caller-supplied
 * Garden register lists plus what the caller-supplied
 * placements solve to plus what one caller-named zone has
 * placed in it plus what that one zone's placements
 * recognise as a habitat plus what that one zone's
 * placements look like in the solver's placement shape plus
 * what one caller-named Garden record reads as in one line
 * plus whether two caller-supplied Garden records pass the
 * breeding gate plus which of two caller-supplied Garden
 * stat lines wins a race plus which of two caller-supplied
 * Garden stat lines wins a spar, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race
 *   (slice 66);
 * - which of two caller-supplied Garden stat lines wins a spar
 *   via garden-wiring's runSpar, exactly as garden-wiring
 *   defines it: score = might * 3 + endurance * 2 + sprint
 *   + floor((dive + glide) / 2), higher score wins, equal
 *   scores tie. The spar is a pure outcome only, as its own
 *   comment states: it does not change either stat line, it
 *   does not award anything, it does not rank a record, and
 *   it does not decide a species.
 *
 * The spar section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, composition, labour, honour,
 * register, placements, cells, zone-habitat, placement,
 * summary, or breeding values. In particular it is NOT read
 * off the bundle's summary string, its placement section, or
 * its breeding gate: the caller supplies both stat lines
 * explicitly, and the bundle's records, zones, solves, and
 * parents are never used to pick them — stat lines the bundle
 * never names still spar from their own numbers, and numbers
 * the bundle names still spar only when the caller hands them
 * over as sparrers. And it does NOT feed the bundle's sections:
 * the bundle section still reads its own caller-supplied
 * inputs, never the spar section's winner — sparring two stat
 * lines never solves, changes, or re-solves a habitat, never
 * places, moves, or removes a cell, never summarises a record,
 * never re-gates a breeding pair, and never writes anything
 * back into any record — and no spar result is written back
 * anywhere, no record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged spar result and NO order invented between the
 *   bundle and the spar section beyond each section's own
 *   order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO spar computed from a bundle value (both stat lines are
 *   caller-supplied, never read off a bond list, decay
 *   breakdown, comfort day, thanks intensity, level summary,
 *   bridge record, check-in beat, snapshot lens, journey
 *   visit, unlock evaluation, individual summary, teacher
 *   reading, movement reading, arrival reading, research
 *   reading, discovery candidate, news item, inbound reading,
 *   migration, story beat or arc inside the bundle,
 *   attraction reading, spawn annotation, habitat reading,
 *   composition reading, story reading, arc reading, labour
 *   status, honour entry, register entry, register recognised
 *   flag, placements habitat, placements zone list, cells
 *   listing, cells item, zone-habitat solve, solved habitat,
 *   placement cell, placement item, summary string, or
 *   breeding gate);
 * - NO spar-to-placements chaining and NO spar-to-breeding
 *   chaining (a spar winner never makes a placements-cache
 *   entry and never gates or un-gates a breeding pair);
 * - NO spar-to-race chaining (a spar winner never re-races
 *   a pair and never re-gates a breeding pair);
 * - NO inherited stats (inheritedGardenStats is a separate
 *   read, not composed here);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual,
 *   teacher, movement, arrival, research, discovery, news,
 *   inbound, migration, story, arc, habitat, attraction,
 *   spawn, composition, labour, honour, register,
 *   placements, cells, zone-habitat, placement, summary,
 *   breeding, or spar writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a spar result, a spar score, a
 *   sprint, glide, or endurance value on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether a spar result is
 *   consulted anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a spar result is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the spar winner is a fresh value on
 * every call. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race";
import {
  runSpar,
} from "./garden-wiring";
import type {
  GardenStats,
} from "./mochiichao-systems";

/** The spar section's inputs: two caller-supplied Garden stat lines. */
export interface SparInputs {
  /** The first caller-supplied sparrer's stat line, as the caller built it. */
  sparrerA: GardenStats;
  /** The second caller-supplied sparrer's stat line, as the caller built it. */
  sparrerB: GardenStats;
}

/** The spar section's report: the spar winner, exactly as garden-wiring reports it. */
export interface SparReport {
  /** Which sparrer wins, 'A' or 'B', or 'Tie' on equal scores, exactly as runSpar reports it. */
  winner: "A" | "B" | "Tie";
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-spar bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding bundle's inputs, as slice 66 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceInputs;
  /** The spar section's inputs. */
  spar: SparInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a spar. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding bundle, exactly as slice 66 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace;
  /** The spar winner, exactly as garden-wiring reports it. */
  spar: SparReport;
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
 * the breeding gate plus which of two caller-supplied Garden
 * stat lines wins a spar: outing-attraction-spawn-composition-
 * story-arcs-labour-honour-register-placements-cells-zone-
 * habitat-placement-summary-breeding bundle + one spar
 * winner, each exactly as its own read reports it, side by
 * side, with no merged spar result and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSpar {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace inputs must be an object",
    );
  }
  if (inputs.spar === null || typeof inputs.spar !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar: spar inputs must be an object",
    );
  }
  if (
    inputs.spar.sparrerA === null ||
    typeof inputs.spar.sparrerA !== "object" ||
    Array.isArray(inputs.spar.sparrerA)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar: spar sparrerA must be an object",
    );
  }
  if (
    inputs.spar.sparrerB === null ||
    typeof inputs.spar.sparrerB !== "object" ||
    Array.isArray(inputs.spar.sparrerB)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar: spar sparrerB must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
    );
  const spar = runSpar(inputs.spar.sparrerA, inputs.spar.sparrerB);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRace,
    spar: { winner: spar },
  };
}
