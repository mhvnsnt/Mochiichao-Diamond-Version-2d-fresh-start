/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth + cocoon + tick — one outing plus its Garden
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
 * reads as on entering a cocoon at a caller-supplied now
 * plus what one caller-supplied Garden record reads as when
 * its cocoon is ticked at a caller-supplied now,
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
 *   plus-garden-now-plus-critter-plus-rebirth-plus-cocoon bundle
 *   from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon
 *   (slice 76);
 * - what one caller-supplied Garden record reads as when its
 *   cocoon is ticked via garden-wiring's tickCocoon, exactly
 *   as garden-wiring defines it: when the record carries a
 *   cocoon and the caller-supplied nowMinutes reaches or
 *   passes that cocoon's endsAt, the record reads back with
 *   the cocoon cleared and gardenAge raised by 0.1; otherwise
 *   the record reads back unchanged. No tick threshold and no
 *   gardenAge step is invented here: the endsAt comparison
 *   and the +0.1 are garden-wiring's own rules. The cocoon
 *   tick is a pure reading only: it reports the ticked
 *   record, and whether a host stores that record is a host
 *   decision, not this read's. This section never enters a
 *   cocoon: enterCocoon is a separate read, already composed
 *   in slice 76, not composed here.
 *
 * The tick section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now,
 * critter, rebirth, or cocoon values. In particular it is NOT
 * read off the bundle's summary string, its placement section,
 * its breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, its hatched
 * record, its race or spar scores section, its garden now
 * minutes, its critter record, its rebirth record, or its
 * cocoon record: the caller supplies the record and the now
 * explicitly, and the bundle's records, zones, solves,
 * parents, racers, sparrers, inherited parents, egg records,
 * hatch records, garden now case, critter case, rebirth case,
 * and cocoon case are never used to pick them. And it does
 * NOT feed the bundle's sections: the bundle section still
 * reads its own caller-supplied inputs, never the tick
 * section's record — ticking a cocoon never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a
 * critter, never rebirths a record, never re-enters a cocoon,
 * and never writes anything back into any record — and no
 * tick result is written back anywhere, no record is
 * appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged tick result and NO order invented between
 *   the bundle and the tick section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO tick computed from a bundle value (the record and
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
 *   garden now minutes, critter record, rebirth record, or
 *   cocoon record);
 * - NO tick-to-placements chaining, NO
 *   tick-to-breeding chaining, NO tick-to-race chaining,
 *   NO tick-to-spar chaining, NO tick-to-inherited
 *   chaining, NO tick-to-eggsteps chaining, NO
 *   tick-to-hatch chaining, NO tick-to-garden-now
 *   chaining, NO tick-to-critter chaining, NO
 *   tick-to-rebirth chaining, and NO tick-to-cocoon
 *   chaining (ticking a cocoon never makes a
 *   placements-cache entry, never gates or un-gates
 *   a breeding pair, never re-races or re-spars a pair,
 *   never re-inherits a stat line, never re-steps an egg,
 *   never hatches an egg, never re-reads the Garden's now,
 *   never re-applies a critter, never rebirths a record,
 *   and never re-enters a cocoon — and the bundle's cocoon
 *   record, whose endsAt garden-wiring sets on entry, is
 *   never used to pick this section's record);
 * - NO cocoon entry here: enterCocoon is a separate read,
 *   already composed in slice 76, and ticking a cocoon
 *   never enters one;
 * - NO farm read here: plantPlot and harvestPlot are
 *   separate reads, not composed here;
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and ticking a cocoon does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and ticking a cocoon does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the tick section reports the caller-supplied
 *   record as tickCocoon reports it, and ticking a cocoon
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
 *   scores, garden now, critter, rebirth, cocoon, or tick
 *   writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a cocoon tick, now value, or
 *   cleared cocoon on tiers, richness, weights, stock, or
 *   spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether a cocoon tick is consulted anywhere
 *   is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a cocoon tick is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the tick record is a fresh record when
 * the tick rule passes (a cleared cocoon; the other fields
 * ride through by garden-wiring's own spread, with gardenAge
 * raised by 0.1). The tick-fail edge is tickCocoon's own
 * behaviour, stated plainly: a record with no cocoon, or a
 * record whose cocoon has not yet reached endsAt, returns
 * the caller's record object itself, so the reported record
 * IS the input object in that case — values unchanged,
 * nothing mutated. The cocoon record inside the bundle keeps
 * the purity edge slice 76 states (fresh only when the form
 * gate passes; aliased when the form gate fails — values
 * unchanged, nothing mutated). The rebirth record inside the
 * bundle keeps the purity edge slice 76 states (fresh only
 * when the bond gate passes; aliased when the bond is 50 or
 * below — values unchanged, nothing mutated). The hatch
 * record inside the bundle keeps the purity edge slice 75
 * states (fresh only when the egg was at 0 steps; aliased
 * when the record carries no egg or an egg above 0 steps —
 * values unchanged, nothing mutated). The critter record
 * inside the bundle keeps the purity edge slice 75 states
 * (fresh only for a known critter; aliased for an unknown
 * critter — values unchanged, nothing mutated). Loud
 * failures (throw) on a malformed input bundle and on any
 * failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon";
import {
  tickCocoon,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The tick section's inputs: a caller-supplied Garden record and a caller-supplied now, read through garden-wiring's tickCocoon. */
export interface TickInputs {
  /** The caller-supplied Garden record the cocoon tick is read from; its cocoon is cleared only when garden-wiring's tick rule passes, and its gardenAge rises by 0.1 in that case. */
  record: GardenSaveRecord;
  /** The caller-supplied Garden time in game minutes at which the cocoon tick is read; garden-wiring clears the cocoon only when this value reaches or passes its endsAt. */
  nowMinutes: number;
}

/** The tick section's report: the caller-supplied record as tickCocoon reports it. */
export interface TickReport {
  /** The record as tickCocoon reports it (a fresh record with the cocoon cleared and gardenAge raised by 0.1 when the tick rule passes; the caller's record itself when it does not). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle's inputs, as slice 76 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonInputs;
  /** The cocoon section's inputs. */
  tick: TickInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth plus what one caller-supplied Garden record reads as on entering a cocoon at a caller-supplied now. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle, exactly as slice 76 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon;
  /** The cocoon entry, exactly as garden-wiring reports it. */
  tick: TickReport;
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
 * as on entering a cocoon at a caller-supplied now plus what
 * one caller-supplied Garden record reads as when its cocoon
 * is ticked at a caller-supplied now:
 * outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon bundle + one cocoon tick, each exactly as its own
 * read reports it, side by side, with no merged tick result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon inputs must be an object",
    );
  }
  if (inputs.tick === null || typeof inputs.tick !== "object" || Array.isArray(inputs.tick)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: tick inputs must be an object",
    );
  }
  if (inputs.tick.record === null || typeof inputs.tick.record !== "object" || Array.isArray(inputs.tick.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: tick record must be an object",
    );
  }
  if (
    inputs.tick.record.garden === null ||
    typeof inputs.tick.record.garden !== "object" ||
    Array.isArray(inputs.tick.record.garden) ||
    typeof inputs.tick.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.tick.record.garden.dive) ||
    typeof inputs.tick.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.tick.record.garden.glide) ||
    typeof inputs.tick.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.tick.record.garden.sprint) ||
    typeof inputs.tick.record.garden.might !== "number" ||
    !Number.isFinite(inputs.tick.record.garden.might) ||
    typeof inputs.tick.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.tick.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: tick record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.tick.record.speciesId !== "string" || inputs.tick.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: tick record speciesId must be a non-empty string",
    );
  }
  if (typeof inputs.tick.nowMinutes !== "number" || !Number.isFinite(inputs.tick.nowMinutes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick: tick nowMinutes must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoon,
    tick: {
      record: tickCocoon(
        inputs.tick.record,
        inputs.tick.nowMinutes,
      ),
    },
  };
}
