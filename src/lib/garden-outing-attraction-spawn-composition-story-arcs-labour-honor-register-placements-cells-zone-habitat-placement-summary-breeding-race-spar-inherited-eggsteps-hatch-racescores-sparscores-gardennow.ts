/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
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
 * zone's placements recognise as a habitat plus what that one
 * zone's placements look like in the solver's placement shape
 * plus what one caller-named Garden record reads as in one
 * line plus whether two caller-supplied Garden records pass
 * the breeding gate plus which of two caller-supplied Garden
 * stat lines wins a race plus which of two caller-supplied
 * Garden stat lines wins a spar plus what stat line two
 * caller-supplied Garden stat lines hand down plus what one
 * caller-supplied Garden record's egg steps count down to
 * plus what one caller-supplied Garden record's egg hatches to
 * plus what two caller-supplied Garden stat lines score in a
 * race plus what two caller-supplied Garden stat lines score
 * in a spar plus what the Garden's now reads as in game
 * minutes, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores
 *   bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores
 *   (slice 72);
 * - what the Garden's now reads as in game minutes via
 *   garden-wiring's gardenNowMinutes, exactly as garden-wiring
 *   defines it: an anchored save reads the world clock's
 *   totalGameMinutes at the caller-supplied real time; an
 *   unanchored save (null or undefined anchor) reads back the
 *   caller-supplied fallback minute count exactly. The Garden
 *   now reading is a pure reading only: it does not plant,
 *   harvest, enter, or tick a cocoon, and it does not change
 *   any record.
 *
 * The garden now section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, or spar scores values. In
 * particular it is NOT read off the bundle's summary string,
 * its placement section, its breeding gate, its race winner,
 * its spar winner, its inherited stat line, its stepped egg
 * record, its hatched record, or its race or spar scores
 * section: the caller supplies the anchor, the fallback
 * minutes, and the real time explicitly, and the bundle's
 * records, zones, solves, parents, racers, sparrers,
 * inherited parents, egg records, and hatch records are never
 * used to pick them. And it does NOT feed the bundle's
 * sections: the bundle section still reads its own
 * caller-supplied inputs, never the garden now section's
 * anchor — reading the Garden's now never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an egg,
 * and never writes anything back into any record — and no
 * Garden now result is written back anywhere, no record is
 * appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged Garden now result and NO order invented between
 *   the bundle and the garden now section beyond each
 *   section's own order, and NO reconciliation of the two
 *   sections' pictures;
 * - NO Garden now computed from a bundle value (the anchor,
 *   fallback minutes, and real time are caller-supplied,
 *   never read off a bond list, decay breakdown, comfort day,
 *   thanks intensity, level summary, bridge record, check-in
 *   beat, snapshot lens, journey visit, unlock evaluation,
 *   individual summary, teacher reading, movement reading,
 *   arrival reading, research reading, discovery candidate,
 *   news item, inbound reading, migration, story beat or arc
 *   inside the bundle, attraction reading, spawn annotation,
 *   habitat reading, composition reading, story reading, arc
 *   reading, labour status, honour entry, register entry,
 *   register recognised flag, placements habitat, placements
 *   zone list, cells listing, cells item, zone-habitat solve,
 *   solved habitat, placement cell, placement item, summary
 *   string, breeding gate, race winner, spar winner,
 *   inherited stat line, stepped egg record, hatched record,
 *   hatched species, race scores section, or spar scores
 *   section);
 * - NO garden-now-to-placements chaining, NO
 *   garden-now-to-breeding chaining, NO garden-now-to-race
 *   chaining, NO garden-now-to-spar chaining, NO
 *   garden-now-to-inherited chaining, NO
 *   garden-now-to-eggsteps chaining, and NO
 *   garden-now-to-hatch chaining (a Garden now reading never
 *   makes a placements-cache entry, never gates or un-gates
 *   a breeding pair, never re-races or re-spars a pair, never
 *   re-inherits a stat line, never re-steps an egg, never
 *   hatches an egg);
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and the Garden now reading
 *   does not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and the Garden now reading
 *   does not re-decide it;
 * - NO egg creation and NO species choice: createBreedingEgg
 *   is a separate read, not composed here, and the species
 *   question for creating an egg stays HELD per
 *   garden-wiring's own comment;
 * - NO new creature record built from a Garden now reading
 *   (the caller builds one with newGardenRecord +
 *   inheritedGardenStats when a host wants one; no such build
 *   happens here);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual, teacher,
 *   movement, arrival, research, discovery, news, inbound,
 *   migration, story, arc, habitat, attraction, spawn,
 *   composition, labour, honour, register, placements,
 *   cells, zone-habitat, placement, summary, breeding, race,
 *   spar, inherited, eggsteps, hatch, race scores, spar
 *   scores, or garden now writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a Garden now reading, anchor, or
 *   fallback minute count on tiers, richness, weights, stock,
 *   or spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether a Garden now reading is consulted
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a Garden now reading is applied anywhere is
 *   a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the Garden now minutes are a fresh number
 * on every call. The hatch record inside the bundle keeps the
 * purity edge slice 72 states (fresh only when the egg was at
 * 0 steps; aliased when the record carries no egg or an egg
 * above 0 steps — values unchanged, nothing mutated). Loud
 * failures (throw) on a malformed input bundle and on any
 * failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores";
import {
  gardenNowMinutes,
} from "./garden-wiring";
import type {
  WorldClockAnchor,
} from "./worldClock";

/** The garden now section's inputs: a caller-supplied world-clock anchor (or none), a caller-supplied fallback minute count, and a caller-supplied real time in milliseconds. */
export interface GardenNowInputs {
  /** The caller-supplied world-clock anchor, or null/undefined for an unanchored save. */
  anchor: WorldClockAnchor | null | undefined;
  /** The caller-supplied fallback minute count, read back exactly when no anchor is supplied. */
  fallbackMinutes: number;
  /** The caller-supplied real time in milliseconds, as Date.now() reports it. */
  nowMs: number;
}

/** The garden now section's report: the Garden "now" in game minutes, exactly as garden-wiring reports it. */
export interface GardenNowReport {
  /** The Garden "now" in game minutes, exactly as gardenNowMinutes reports it. */
  minutes: number;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores bundle's inputs, as slice 72 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresInputs;
  /** The garden now section's inputs. */
  gardenNow: GardenNowInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores bundle, exactly as slice 72 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores;
  /** The Garden now reading, exactly as garden-wiring reports it. */
  gardenNow: GardenNowReport;
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
 * a race plus what two caller-supplied Garden stat lines score
 * in a spar: outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores bundle + one Garden now reading, each
 * exactly as its own read reports it, side by side, with no
 * merged Garden now result and no reconciliation between
 * their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores inputs must be an object",
    );
  }
  if (inputs.gardenNow === null || typeof inputs.gardenNow !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: gardenNow inputs must be an object",
    );
  }
  if (
    inputs.gardenNow.anchor !== null &&
    inputs.gardenNow.anchor !== undefined &&
    (typeof inputs.gardenNow.anchor !== "object" || Array.isArray(inputs.gardenNow.anchor))
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: gardenNow anchor must be an object, null, or undefined",
    );
  }
  if (
    inputs.gardenNow.anchor !== null &&
    inputs.gardenNow.anchor !== undefined &&
    (typeof inputs.gardenNow.anchor.anchorRealMs !== "number" ||
      !Number.isFinite(inputs.gardenNow.anchor.anchorRealMs) ||
      typeof inputs.gardenNow.anchor.anchorGameMinutes !== "number" ||
      !Number.isFinite(inputs.gardenNow.anchor.anchorGameMinutes) ||
      typeof inputs.gardenNow.anchor.lastSeenDayIndex !== "number" ||
      !Number.isFinite(inputs.gardenNow.anchor.lastSeenDayIndex))
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: gardenNow anchor must carry finite anchorRealMs, anchorGameMinutes, and lastSeenDayIndex numbers",
    );
  }
  if (
    typeof inputs.gardenNow.fallbackMinutes !== "number" ||
    !Number.isFinite(inputs.gardenNow.fallbackMinutes)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: gardenNow fallbackMinutes must be a finite number",
    );
  }
  if (
    typeof inputs.gardenNow.nowMs !== "number" ||
    !Number.isFinite(inputs.gardenNow.nowMs)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow: gardenNow nowMs must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScores,
    gardenNow: {
      minutes: gardenNowMinutes(
        inputs.gardenNow.anchor,
        inputs.gardenNow.fallbackMinutes,
        inputs.gardenNow.nowMs,
      ),
    },
  };
}
