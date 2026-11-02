/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth — one outing plus its Garden news plus
 * what its journey brings home plus what the Garden does on
 * its own plus what its zones recognise as habitats plus
 * what those habitats attract plus what that attraction means
 * for spawn rows plus what the composition pass says about a
 * recognised habitat plus what the story beats say about who
 * is present plus what the arc beats say about each resident's
 * arc plus whether each caller-named Garden job runs or idles
 * plus what the caller-supplied honour sources add up to plus
 * what the caller-supplied Garden register lists plus what
 * the caller-supplied placements solve to plus what one
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
 * as with one caller-supplied critter applied plus what one
 * caller-supplied Garden record reads as after a data
 * rebirth, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-
 *   plus-garden-now-plus-critter bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter
 *   (slice 74);
 * - what one caller-supplied Garden record reads as after a
 *   data rebirth via garden-wiring's dataRebirth, exactly as
 *   garden-wiring defines it: when the record's bond is above
 *   50, every garden stat is halved (floored), rebirths rises
 *   by one, garden age resets to 0, any cocoon is cleared,
 *   and the egg is replaced by a rebirth egg carrying the
 *   record's own species id for both parents at 100 steps;
 *   parts are kept and the species id, bond, and other fields
 *   ride through unchanged. When the bond is 50 or below,
 *   the record reads back unchanged. No bond threshold is
 *   invented here: the above-50 gate is garden-wiring's own
 *   rule, and the rebirth egg's species is the record's own
 *   species, never a choice between parents — the breeding
 *   species question for createBreedingEgg stays HELD, and
 *   this section never creates a breeding egg. The data
 *   rebirth is a pure reading only: it reports the rebirthed
 *   record, and whether a host stores that record is a host
 *   decision, not this read's.
 *
 * The rebirth section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now, or
 * critter values. In particular it is NOT read off the
 * bundle's summary string, its placement section, its
 * breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, its hatched
 * record, its race or spar scores section, its garden now
 * minutes, or its critter record: the caller supplies the
 * record explicitly, and the bundle's records, zones, solves,
 * parents, racers, sparrers, inherited parents, egg records,
 * hatch records, garden now case, and critter case are never
 * used to pick it. And it does NOT feed the bundle's
 * sections: the bundle section still reads its own
 * caller-supplied inputs, never the rebirth section's record
 * — a data rebirth never solves, changes, or re-solves a
 * habitat, never places, moves, or removes a cell, never
 * summarises a record, never re-gates a breeding pair, never
 * re-races or re-spars a pair, never re-inherits a stat line,
 * never re-steps an egg, never hatches an egg, never
 * re-reads the Garden's now, never re-applies a critter, and
 * never writes anything back into any record — and no
 * rebirth result is written back anywhere, no record is
 * appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged rebirth result and NO order invented between
 *   the bundle and the rebirth section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO rebirth computed from a bundle value (the record is
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
 *   placement cell, placement item, summary string, breeding
 *   gate, race winner, spar winner, inherited stat line,
 *   stepped egg record, hatched record, hatched species, race
 *   scores section, spar scores section, garden now minutes,
 *   or critter record);
 * - NO rebirth-to-placements chaining, NO
 *   rebirth-to-breeding chaining, NO rebirth-to-race chaining,
 *   NO rebirth-to-spar chaining, NO rebirth-to-inherited
 *   chaining, NO rebirth-to-eggsteps chaining, NO
 *   rebirth-to-hatch chaining, NO rebirth-to-garden-now
 *   chaining, and NO rebirth-to-critter chaining (a data
 *   rebirth never makes a placements-cache entry, never gates
 *   or un-gates a breeding pair, never re-races or re-spars a
 *   pair, never re-inherits a stat line, never re-steps an
 *   egg, never hatches an egg, never re-reads the Garden's
 *   now, and never re-applies a critter);
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and the data rebirth does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and the data rebirth does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment; the rebirth egg here is
 *   dataRebirth's own rule (the record's own species for
 *   both parents), not a breeding choice;
 * - NO new creature record built here (no newGardenRecord
 *   call; the rebirth section reports the caller-supplied
 *   record as dataRebirth reports it, and a data rebirth
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
 *   scores, garden now, critter, or rebirth writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a data rebirth, bond value, or
 *   halved stat on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a data rebirth is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a data rebirth is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the rebirth record is a fresh record when
 * the bond gate passes (new stats and a new egg object; the
 * parts list is kept by garden-wiring's own spread, so it is
 * the caller's list, never mutated here). The below-gate edge
 * is dataRebirth's own behaviour, stated plainly: a bond of
 * 50 or below returns the caller's record object itself, so
 * the reported record IS the input object in that case —
 * values unchanged, nothing mutated. The hatch record inside
 * the bundle keeps the purity edge slice 74 states (fresh
 * only when the egg was at 0 steps; aliased when the record
 * carries no egg or an egg above 0 steps — values unchanged,
 * nothing mutated). The critter record inside the bundle
 * keeps the purity edge slice 74 states (fresh only for a
 * known critter; aliased for an unknown critter — values
 * unchanged, nothing mutated). Loud failures (throw) on a
 * malformed input bundle and on any failure propagated from
 * either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter";
import {
  dataRebirth,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The rebirth section's inputs: a caller-supplied Garden record, read through garden-wiring's dataRebirth. */
export interface RebirthInputs {
  /** The caller-supplied Garden record the rebirth is read from; its species, bond, and parts ride through, and its egg is replaced by the rebirth egg only when the bond gate passes. */
  record: GardenSaveRecord;
}

/** The rebirth section's report: the caller-supplied record as dataRebirth reports it. */
export interface RebirthReport {
  /** The record as dataRebirth reports it (a fresh record when the bond gate passes; the caller's record itself when it does not). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter bundle's inputs, as slice 74 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterInputs;
  /** The rebirth section's inputs. */
  rebirth: RebirthInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter bundle, exactly as slice 74 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter;
  /** The data rebirth, exactly as garden-wiring reports it. */
  rebirth: RebirthReport;
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
 * as with one caller-supplied critter applied plus what one
 * caller-supplied Garden record reads as after a data
 * rebirth: outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter bundle + one
 * data rebirth, each exactly as its own read reports it,
 * side by side, with no merged rebirth result and no
 * reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter inputs must be an object",
    );
  }
  if (inputs.rebirth === null || typeof inputs.rebirth !== "object" || Array.isArray(inputs.rebirth)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: rebirth inputs must be an object",
    );
  }
  if (inputs.rebirth.record === null || typeof inputs.rebirth.record !== "object" || Array.isArray(inputs.rebirth.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: rebirth record must be an object",
    );
  }
  if (
    inputs.rebirth.record.garden === null ||
    typeof inputs.rebirth.record.garden !== "object" ||
    Array.isArray(inputs.rebirth.record.garden) ||
    typeof inputs.rebirth.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.rebirth.record.garden.dive) ||
    typeof inputs.rebirth.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.rebirth.record.garden.glide) ||
    typeof inputs.rebirth.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.rebirth.record.garden.sprint) ||
    typeof inputs.rebirth.record.garden.might !== "number" ||
    !Number.isFinite(inputs.rebirth.record.garden.might) ||
    typeof inputs.rebirth.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.rebirth.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: rebirth record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.rebirth.record.bond !== "number" || !Number.isFinite(inputs.rebirth.record.bond)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: rebirth record bond must be a finite number",
    );
  }
  if (typeof inputs.rebirth.record.speciesId !== "string" || inputs.rebirth.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth: rebirth record speciesId must be a non-empty string",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritter,
    rebirth: {
      record: dataRebirth(
        inputs.rebirth.record,
      ),
    },
  };
}
