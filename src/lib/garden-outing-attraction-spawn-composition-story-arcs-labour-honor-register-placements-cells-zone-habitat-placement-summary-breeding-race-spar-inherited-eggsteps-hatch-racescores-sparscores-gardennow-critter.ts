/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter — one outing plus its Garden news plus what its
 * journey brings home plus what the Garden does on its own
 * plus what its zones recognise as habitats plus what those
 * habitats attract plus what that attraction means for spawn
 * rows plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc plus
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
 * minutes plus what one caller-supplied Garden record reads
 * as with one caller-supplied critter applied, pure library
 * form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-
 *   plus-garden-now bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow
 *   (slice 73);
 * - what one caller-supplied Garden record reads as with one
 *   caller-supplied critter applied via garden-wiring's
 *   applyCritter, exactly as garden-wiring defines it: a known
 *   critter id raises that critter's stat by the caller-supplied
 *   gain (clamped 0-99 through applyGardenItem), adds the
 *   critter's part when the record does not already carry it,
 *   and adds the critter's id to the record's collected
 *   critters when it is not already there; an unknown critter
 *   id reads the record back unchanged. The stat, part, and
 *   behaviour of a critter come from garden-data's existing
 *   GARDEN_CRITTERS table, not from this module, and the gain
 *   is a required caller parameter because no Mars-approved
 *   critter gain value exists yet, so none is invented here.
 *   The critter application is a pure reading only: it reports
 *   the applied record, and whether a host stores that record
 *   is a host decision, not this read's.
 *
 * The critter section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, or garden now
 * values. In particular it is NOT read off the bundle's
 * summary string, its placement section, its breeding gate,
 * its race winner, its spar winner, its inherited stat line,
 * its stepped egg record, its hatched record, its race or spar
 * scores section, or its garden now minutes: the caller
 * supplies the record, the critter id, and the stat gain
 * explicitly, and the bundle's records, zones, solves,
 * parents, racers, sparrers, inherited parents, egg records,
 * hatch records, and garden now case are never used to pick
 * them. And it does NOT feed the bundle's sections: the bundle
 * section still reads its own caller-supplied inputs, never
 * the critter section's record — applying a critter never
 * solves, changes, or re-solves a habitat, never places,
 * moves, or removes a cell, never summarises a record, never
 * re-gates a breeding pair, never re-races or re-spars a pair,
 * never re-inherits a stat line, never re-steps an egg, never
 * hatches an egg, never re-reads the Garden's now, and never
 * writes anything back into any record — and no critter
 * result is written back anywhere, no record is appended to
 * any log here.
 *
 * Deliberately NOT here:
 * - NO merged critter result and NO order invented between
 *   the bundle and the critter section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO critter computed from a bundle value (the record, the
 *   critter id, and the stat gain are caller-supplied, never
 *   read off a bond list, decay breakdown, comfort day, thanks
 *   intensity, level summary, bridge record, check-in beat,
 *   snapshot lens, journey visit, unlock evaluation,
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
 *   hatched species, race scores section, spar scores section,
 *   or garden now minutes);
 * - NO critter-to-placements chaining, NO
 *   critter-to-breeding chaining, NO critter-to-race chaining,
 *   NO critter-to-spar chaining, NO critter-to-inherited
 *   chaining, NO critter-to-eggsteps chaining, NO
 *   critter-to-hatch chaining, and NO critter-to-garden-now
 *   chaining (a critter application never makes a
 *   placements-cache entry, never gates or un-gates a breeding
 *   pair, never re-races or re-spars a pair, never re-inherits
 *   a stat line, never re-steps an egg, never hatches an egg,
 *   never re-reads the Garden's now);
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and the critter application
 *   does not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and the critter application
 *   does not re-decide it;
 * - NO egg creation and NO species choice: createBreedingEgg
 *   is a separate read, not composed here, and the species
 *   question for creating an egg stays HELD per
 *   garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the critter section reports the caller-supplied
 *   record with the critter applied, and a critter application
 *   never changes the record's speciesId);
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
 *   scores, garden now, or critter writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied; critter stat/part data lives in
 *   garden-data's existing table, not here);
 * - NO numeric effect of a critter application, critter id,
 *   or stat gain on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a critter application is consulted anywhere is a
 *   host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a critter application is applied anywhere is
 *   a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the critter record is a fresh record when
 * the critter is known (new stats, parts, and collected lists).
 * The unknown-critter edge is applyCritter's own behaviour,
 * stated plainly: an unknown critter id returns the caller's
 * record object itself, so the reported record IS the input
 * object in that case — values unchanged, nothing mutated.
 * The hatch record inside the bundle keeps the purity edge
 * slice 73 states (fresh only when the egg was at 0 steps;
 * aliased when the record carries no egg or an egg above 0
 * steps — values unchanged, nothing mutated). Loud failures
 * (throw) on a malformed input bundle and on any failure
 * propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow";
import {
  applyCritter,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The critter section's inputs: a caller-supplied Garden record, a caller-supplied critter id from garden-data's GARDEN_CRITTERS, and a caller-supplied stat gain. */
export interface CritterInputs {
  /** The caller-supplied Garden record the critter is applied to; its species, bond, and egg ride through unchanged. */
  record: GardenSaveRecord;
  /** The caller-supplied critter id; an unknown id reads the record back unchanged. */
  critterId: string;
  /** The caller-supplied stat gain; garden-wiring invents no gain value, so the caller supplies it. */
  statGain: number;
}

/** The critter section's report: the caller-supplied record with the critter applied, exactly as garden-wiring reports it. */
export interface CritterReport {
  /** The record with the critter applied, exactly as applyCritter reports it (a fresh record for a known critter; the caller's record itself for an unknown critter). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now bundle's inputs, as slice 73 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowInputs;
  /** The critter section's inputs. */
  critter: CritterInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now bundle, exactly as slice 73 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow;
  /** The critter application, exactly as garden-wiring reports it. */
  critter: CritterReport;
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
 * plus what one caller-supplied Garden record's egg hatches to
 * plus what two caller-supplied Garden stat lines score in a
 * race plus what two caller-supplied Garden stat lines score
 * in a spar plus what the Garden's now reads as in game
 * minutes plus what one caller-supplied Garden record reads
 * as with one caller-supplied critter applied: outing-
 * attraction-spawn-composition-story-arcs-labour-honour-
 * register-placements-cells-zone-habitat-placement-summary-
 * breeding-race-spar-inherited-eggsteps-hatch-racescores-
 * sparscores-gardennow bundle + one critter application, each
 * exactly as its own read reports it, side by side, with no
 * merged critter result and no reconciliation between
 * their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow inputs must be an object",
    );
  }
  if (inputs.critter === null || typeof inputs.critter !== "object" || Array.isArray(inputs.critter)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: critter inputs must be an object",
    );
  }
  if (inputs.critter.record === null || typeof inputs.critter.record !== "object" || Array.isArray(inputs.critter.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: critter record must be an object",
    );
  }
  if (
    inputs.critter.record.garden === null ||
    typeof inputs.critter.record.garden !== "object" ||
    Array.isArray(inputs.critter.record.garden) ||
    typeof inputs.critter.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.critter.record.garden.dive) ||
    typeof inputs.critter.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.critter.record.garden.glide) ||
    typeof inputs.critter.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.critter.record.garden.sprint) ||
    typeof inputs.critter.record.garden.might !== "number" ||
    !Number.isFinite(inputs.critter.record.garden.might) ||
    typeof inputs.critter.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.critter.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: critter record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.critter.critterId !== "string" || inputs.critter.critterId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: critter critterId must be a non-empty string",
    );
  }
  if (typeof inputs.critter.statGain !== "number" || !Number.isFinite(inputs.critter.statGain)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter: critter statGain must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNow,
    critter: {
      record: applyCritter(
        inputs.critter.record,
        inputs.critter.critterId,
        inputs.critter.statGain,
      ),
    },
  };
}
