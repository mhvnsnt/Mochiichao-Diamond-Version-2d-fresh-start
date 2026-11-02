/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth + cocoon — one outing plus its Garden
 * news plus what its journey brings home plus what the
 * Garden does on its own plus what its zones recognise as
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
 * Garden stat lines wins a spar plus what stat line two
 * caller-supplied Garden stat lines hand down plus what one
 * caller-supplied Garden record's egg steps count down to
 * plus what one caller-supplied Garden record's egg hatches
 * to plus what two caller-supplied Garden stat lines score
 * in a race plus what two caller-supplied Garden stat lines
 * score in a spar plus what the Garden's now reads as in
 * game minutes plus what one caller-supplied Garden record
 * reads as with one caller-supplied critter applied plus
 * what one caller-supplied Garden record reads as after a
 * data rebirth plus what one caller-supplied Garden record
 * reads as on entering a cocoon at a caller-supplied now,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-
 *   plus-garden-now-plus-critter-plus-rebirth bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth
 *   (slice 75);
 * - what one caller-supplied Garden record reads as on
 *   entering a cocoon via garden-wiring's enterCocoon, exactly
 *   as garden-wiring defines it: when the record's garden
 *   stat total reaches Garden Form I (150) or Garden Form II
 *   (300) and the record carries no cocoon already, the
 *   record reads back with a cocoon set to active, startedAt
 *   equal to the caller-supplied nowMinutes, endsAt equal to
 *   that now plus 10, and targetForm equal to the form the
 *   stats reach; otherwise the record reads back unchanged.
 *   No form threshold and no cocoon duration is invented
 *   here: the 150/300 totals and the +10 endsAt are
 *   garden-wiring's own rules. The cocoon entry is a pure
 *   reading only: it reports the entered record, and whether
 *   a host stores that record is a host decision, not this
 *   read's. This section never ticks a cocoon: tickCocoon is
 *   a separate read, not composed here.
 *
 * The cocoon section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now,
 * critter, or rebirth values. In particular it is NOT read
 * off the bundle's summary string, its placement section,
 * its breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, its hatched
 * record, its race or spar scores section, its garden now
 * minutes, its critter record, or its rebirth record: the
 * caller supplies the record and the now explicitly, and the
 * bundle's records, zones, solves, parents, racers, sparrers,
 * inherited parents, egg records, hatch records, garden now
 * case, critter case, and rebirth case are never used to pick
 * them. And it does NOT feed the bundle's sections: the
 * bundle section still reads its own caller-supplied inputs,
 * never the cocoon section's record — entering a cocoon
 * never solves, changes, or re-solves a habitat, never
 * places, moves, or removes a cell, never summarises a
 * record, never re-gates a breeding pair, never re-races or
 * re-spars a pair, never re-inherits a stat line, never
 * re-steps an egg, never hatches an egg, never re-reads the
 * Garden's now, never re-applies a critter, never rebirths
 * a record, and never writes anything back into any record
 * — and no cocoon result is written back anywhere, no
 * record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged cocoon result and NO order invented between
 *   the bundle and the cocoon section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO cocoon computed from a bundle value (the record and
 *   the now are caller-supplied, never read off a bond list,
 *   decay breakdown, comfort day, thanks intensity, level
 *   summary, bridge record, check-in beat, snapshot lens,
 *   journey visit, unlock evaluation, individual summary,
 *   teacher reading, movement reading, arrival reading,
 *   research reading, discovery candidate, news item,
 *   inbound reading, migration, story beat or arc inside the
 *   bundle, attraction reading, spawn annotation, habitat
 *   reading, composition reading, story reading, arc reading,
 *   labour status, honour entry, register entry, register
 *   recognised flag, placements habitat, placements zone
 *   list, cells listing, cells item, zone-habitat solve,
 *   solved habitat, placement cell, placement item, summary
 *   string, breeding gate, race winner, spar winner,
 *   inherited stat line, stepped egg record, hatched record,
 *   hatched species, race scores section, spar scores section,
 *   garden now minutes, critter record, or rebirth record);
 * - NO cocoon-to-placements chaining, NO
 *   cocoon-to-breeding chaining, NO cocoon-to-race chaining,
 *   NO cocoon-to-spar chaining, NO cocoon-to-inherited
 *   chaining, NO cocoon-to-eggsteps chaining, NO
 *   cocoon-to-hatch chaining, NO cocoon-to-garden-now
 *   chaining, NO cocoon-to-critter chaining, and NO
 *   cocoon-to-rebirth chaining (entering a cocoon never
 *   makes a placements-cache entry, never gates or un-gates
 *   a breeding pair, never re-races or re-spars a pair,
 *   never re-inherits a stat line, never re-steps an egg,
 *   never hatches an egg, never re-reads the Garden's now,
 *   never re-applies a critter, and never rebirths a record
 *   — and the bundle's rebirth record, whose cocoon
 *   garden-wiring clears, is never used to pick this
 *   section's record);
 * - NO cocoon tick here: tickCocoon is a separate read, not
 *   composed here, and entering a cocoon never emerges one;
 * - NO farm read here: plantPlot and harvestPlot are
 *   separate reads, not composed here;
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and entering a cocoon does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and entering a cocoon does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the cocoon section reports the caller-supplied
 *   record as enterCocoon reports it, and entering a cocoon
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
 *   scores, garden now, critter, rebirth, or cocoon writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a cocoon entry, now value, or
 *   target form on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a cocoon entry is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a cocoon entry is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the cocoon record is a fresh record when
 * the form gate passes (a new cocoon object; the other fields
 * ride through by garden-wiring's own spread). The gate-fail
 * edge is enterCocoon's own behaviour, stated plainly: a Base
 * record, or a record already carrying a cocoon, returns the
 * caller's record object itself, so the reported record IS
 * the input object in that case — values unchanged, nothing
 * mutated. The hatch record inside the bundle keeps the
 * purity edge slice 75 states (fresh only when the egg was
 * at 0 steps; aliased when the record carries no egg or an
 * egg above 0 steps — values unchanged, nothing mutated).
 * The critter record inside the bundle keeps the purity edge
 * slice 75 states (fresh only for a known critter; aliased
 * for an unknown critter — values unchanged, nothing
 * mutated). The rebirth record inside the bundle keeps the
 * purity edge slice 75 states (fresh only when the bond gate
 * passes; aliased when the bond is 50 or below — values
 * unchanged, nothing mutated). Loud failures (throw) on a
 * malformed input bundle and on any failure propagated from
 * either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth";
import {
  enterCocoon,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The cocoon section's inputs: a caller-supplied Garden record and a caller-supplied now, read through garden-wiring's enterCocoon. */
export interface CocoonInputs {
  /** The caller-supplied Garden record the cocoon entry is read from; its species, bond, and parts ride through, and its cocoon is set only when garden-wiring's form gate passes. */
  record: GardenSaveRecord;
  /** The caller-supplied Garden time in game minutes at which the cocoon entry is read; garden-wiring sets endsAt to this value plus 10 when the gate passes. */
  nowMinutes: number;
}

/** The cocoon section's report: the caller-supplied record as enterCocoon reports it. */
export interface CocoonReport {
  /** The record as enterCocoon reports it (a fresh record with a cocoon set when the form gate passes; the caller's record itself when it does not). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle's inputs, as slice 75 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthInputs;
  /** The cocoon section's inputs. */
  cocoon: CocoonInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth plus what one caller-supplied Garden record reads as on entering a cocoon at a caller-supplied now. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle, exactly as slice 75 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth;
  /** The cocoon entry, exactly as garden-wiring reports it. */
  cocoon: CocoonReport;
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
 * rebirth plus what one caller-supplied Garden record reads
 * as on entering a cocoon at a caller-supplied now:
 * outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter-rebirth
 * bundle + one cocoon entry, each exactly as its own read
 * reports it, side by side, with no merged cocoon result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth inputs must be an object",
    );
  }
  if (inputs.cocoon === null || typeof inputs.cocoon !== "object" || Array.isArray(inputs.cocoon)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: cocoon inputs must be an object",
    );
  }
  if (inputs.cocoon.record === null || typeof inputs.cocoon.record !== "object" || Array.isArray(inputs.cocoon.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: cocoon record must be an object",
    );
  }
  if (
    inputs.cocoon.record.garden === null ||
    typeof inputs.cocoon.record.garden !== "object" ||
    Array.isArray(inputs.cocoon.record.garden) ||
    typeof inputs.cocoon.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.cocoon.record.garden.dive) ||
    typeof inputs.cocoon.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.cocoon.record.garden.glide) ||
    typeof inputs.cocoon.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.cocoon.record.garden.sprint) ||
    typeof inputs.cocoon.record.garden.might !== "number" ||
    !Number.isFinite(inputs.cocoon.record.garden.might) ||
    typeof inputs.cocoon.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.cocoon.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: cocoon record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.cocoon.record.speciesId !== "string" || inputs.cocoon.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: cocoon record speciesId must be a non-empty string",
    );
  }
  if (typeof inputs.cocoon.nowMinutes !== "number" || !Number.isFinite(inputs.cocoon.nowMinutes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon: cocoon nowMinutes must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirth,
    cocoon: {
      record: enterCocoon(
        inputs.cocoon.record,
        inputs.cocoon.nowMinutes,
      ),
    },
  };
}
