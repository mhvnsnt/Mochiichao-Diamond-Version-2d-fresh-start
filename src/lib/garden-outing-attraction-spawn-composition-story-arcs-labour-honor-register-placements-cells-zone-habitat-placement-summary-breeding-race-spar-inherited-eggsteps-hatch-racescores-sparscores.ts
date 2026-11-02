/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores — one outing plus its Garden
 * news plus what its journey brings home plus what the Garden
 * does on its own plus what its zones recognise as habitats
 * plus what those habitats attract plus what that attraction
 * means for spawn rows plus what the composition pass says
 * about a recognised habitat plus what the story beats say
 * about who is present plus what the arc beats say about each
 * resident's arc plus whether each caller-named Garden job
 * runs or idles plus what the caller-supplied honour sources
 * add up to plus what the caller-supplied Garden register
 * lists plus what the caller-supplied placements solve to
 * plus what one caller-named zone has placed in it plus what
 * that one zone's placements recognise as a habitat plus what
 * that one zone's placements look like in the solver's
 * placement shape plus what one caller-named Garden record
 * reads as in one line plus whether two caller-supplied
 * Garden records pass the breeding gate plus which of two
 * caller-supplied Garden stat lines wins a race plus which of
 * two caller-supplied Garden stat lines wins a spar plus what
 * stat line two caller-supplied Garden stat lines hand down
 * plus what one caller-supplied Garden record's egg steps
 * count down to plus what one caller-supplied Garden
 * record's egg hatches to plus what two caller-supplied
 * Garden stat lines score in a race plus what two caller-supplied
 * Garden stat lines score in a spar, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores
 *   (slice 71);
 * - what two caller-supplied Garden stat lines score in a spar
 *   via garden-wiring's sparScore, exactly as garden-wiring
 *   defines it: might * 3 + endurance * 2 + sprint + floor((dive +
 *   glide) / 2). The scores are a pure reading only:
 *   they do not re-spar a pair, they do not pick a winner
 *   (runSpar is a separate read, already composed in slice
 *   67), and they do not change any record.
 *
 * The spar scores section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, or hatch values. In particular it is NOT read off
 * the bundle's summary string, its placement section, its
 * breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, or its hatched
 * record: the caller supplies both stat lines explicitly, and
 * the bundle's records, zones, solves, parents, racers,
 * sparrers, inherited parents, egg records, and hatch records
 * are never used to pick them — stat lines the bundle never
 * names still score from their own numbers, and numbers the
 * bundle names still score only when the caller hands them
 * over as the stat lines. And it does NOT feed the bundle's
 * sections: the bundle section still reads its own
 * caller-supplied inputs, never the spar scores section's
 * stat lines — scoring two stat lines never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an egg,
 * and never writes anything back into any record — and no
 * spar score result is written back anywhere, no record is
 * appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged spar scores result and NO order invented between
 *   the bundle and the spar scores section beyond each
 *   section's own order, and NO reconciliation of the two
 *   sections' pictures;
 * - NO spar scores computed from a bundle value (both stat
 *   lines are caller-supplied, never read off a bond list,
 *   decay breakdown, comfort day, thanks intensity, level
 *   summary, bridge record, check-in beat, snapshot lens,
 *   journey visit, unlock evaluation, individual summary,
 *   teacher reading, movement reading, arrival reading,
 *   research reading, discovery candidate, news item, inbound
 *   reading, migration, story beat or arc inside the bundle,
 *   attraction reading, spawn annotation, habitat reading,
 *   composition reading, story reading, arc reading, labour
 *   status, honour entry, register entry, register recognised
 *   flag, placements habitat, placements zone list, cells
 *   listing, cells item, zone-habitat solve, solved habitat,
 *   placement cell, placement item, summary string, breeding
 *   gate, race winner, spar winner, inherited stat line,
 *   stepped egg record, hatched record, or hatched species);
 * - NO spar-scores-to-placements chaining, NO
 *   spar-scores-to-breeding chaining, NO spar-scores-to-race
 *   chaining, NO spar-scores-to-spar chaining, NO
 *   spar-scores-to-inherited chaining, NO
 *   spar-scores-to-eggsteps chaining, and NO
 *   spar-scores-to-hatch chaining (a scored pair never makes
 *   a placements-cache entry, never gates or un-gates a
 *   breeding pair, never re-races or re-spars a pair, never
 *   re-inherits a stat line, never re-steps an egg, never
 *   hatches an egg);
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and the scores here do not
 *   re-decide it (a caller that wants the winner calls
 *   runRace, or reads the bundle's race section);
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and the scores here do not
 *   re-decide it (a caller that wants the winner calls runSpar,
 *   or reads the bundle's spar section);
 * - NO egg creation and NO species choice: createBreedingEgg
 *   is a separate read, not composed here, and the species
 *   question for creating an egg stays HELD per
 *   garden-wiring's own comment;
 * - NO new creature record built from a score (the caller
 *   builds one with newGardenRecord + inheritedGardenStats
 *   when a host wants one; no such build happens here);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual, teacher,
 *   movement, arrival, research, discovery, news, inbound,
 *   migration, story, arc, habitat, attraction, spawn,
 *   composition, labour, honour, register, placements,
 *   cells, zone-habitat, placement, summary, breeding, race,
 *   spar, inherited, eggsteps, hatch, race scores, or spar scores writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a spar score, might, endurance,
 *   sprint, dive, or glide value on tiers, richness, weights, stock, or
 *   spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether a spar score is consulted anywhere is
 *   a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a spar score is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the spar scores are fresh numbers on
 * every call. The hatch record inside the bundle keeps the
 * purity edge slice 71 states (fresh only when the egg was at
 * 0 steps; aliased when the record carries no egg or an egg
 * above 0 steps — values unchanged, nothing mutated). Loud
 * failures (throw) on a malformed input bundle and on any
 * failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores";
import {
  sparScore,
} from "./garden-wiring";
import type {
  GardenStats,
} from "./mochiichao-systems";

/** The spar scores section's inputs: two caller-supplied Garden stat lines. */
export interface SparScoresInputs {
  /** The first caller-supplied stat line, as the caller built it. */
  statsA: GardenStats;
  /** The second caller-supplied stat line, as the caller built it. */
  statsB: GardenStats;
}

/** The spar scores section's report: each stat line's spar score, exactly as garden-wiring reports it. */
export interface SparScoresReport {
  /** The first stat line's spar score, exactly as sparScore reports it. */
  scoreA: number;
  /** The second stat line's spar score, exactly as sparScore reports it. */
  scoreB: number;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch bundle's inputs, as slice 71 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresInputs;
  /** The spar scores section's inputs. */
  sparScores: SparScoresInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch bundle, exactly as slice 71 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores;
  /** The two spar scores, exactly as garden-wiring reports them. */
  sparScores: SparScoresReport;
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
 * caller-supplied Garden stat lines hand down plus what one
 * caller-supplied Garden record's egg steps count down to
 * plus what one caller-supplied Garden record's egg hatches
 * to plus what two caller-supplied Garden stat lines score in
 * a race: outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat-placement-
 * summary-breeding-race-spar-inherited-eggsteps-hatch bundle +
 * one spar scores reading, each exactly as its own read
 * reports it, side by side, with no merged spar scores result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores inputs must be an object",
    );
  }
  if (inputs.sparScores === null || typeof inputs.sparScores !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores: sparScores inputs must be an object",
    );
  }
  if (
    inputs.sparScores.statsA === null ||
    typeof inputs.sparScores.statsA !== "object" ||
    Array.isArray(inputs.sparScores.statsA)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores: sparScores statsA must be an object",
    );
  }
  if (
    inputs.sparScores.statsB === null ||
    typeof inputs.sparScores.statsB !== "object" ||
    Array.isArray(inputs.sparScores.statsB)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores: sparScores statsB must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScores,
    sparScores: {
      scoreA: sparScore(inputs.sparScores.statsA),
      scoreB: sparScore(inputs.sparScores.statsB),
    },
  };
}
