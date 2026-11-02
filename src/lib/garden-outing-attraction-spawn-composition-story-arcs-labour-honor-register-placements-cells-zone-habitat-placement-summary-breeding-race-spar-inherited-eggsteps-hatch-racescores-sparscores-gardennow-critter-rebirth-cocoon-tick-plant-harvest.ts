/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth + cocoon + tick + plant + harvest — one outing plus its Garden
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
 * its cocoon is ticked at a caller-supplied now plus what
 * one caller-supplied Garden record reads as when a seed is
 * planted in one of its plots at a caller-supplied now plus
 * what one caller-supplied Garden record reads as when one
 * of its plots is harvested at a caller-supplied now,
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
 *   plus-garden-now-plus-critter-plus-rebirth-plus-cocoon-plus-tick-plus-plant bundle
 *   from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant
 *   (slice 78);
 * - what one caller-supplied Garden record reads as when one
 *   of its plots is harvested via garden-wiring's
 *   harvestPlot, exactly as garden-wiring defines it: when the
 *   caller-named plot exists, carries a seed, and the
 *   caller-supplied nowMinutes reaches or passes its readyAt,
 *   the record reads back with that plot's seed cleared to
 *   null and harvested true (plantedAt and readyAt
 *   unchanged), and the fruit is the plot's own seed;
 *   otherwise the record reads back unchanged in value and
 *   the fruit is null. No harvest threshold and no ready
 *   delay is invented here: the seeded-plot gate and the
 *   readyAt comparison are garden-wiring's own rules. The
 *   harvest is a pure reading only: it reports the harvested
 *   record and its fruit, and whether a host stores that
 *   record is a host decision, not this read's. This
 *   section never plants a seed: plantPlot is a separate
 *   read, already composed in slice 78.
 *
 * The harvest section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now,
 * critter, rebirth, cocoon, tick, or plant values. In particular it is NOT
 * read off the bundle's summary string, its placement section,
 * its breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, its hatched
 * record, its race or spar scores section, its garden now
 * minutes, its critter record, its rebirth record, its
 * cocoon record, its tick record, or its plant record: the caller supplies the
 * record, the plot id, and the now explicitly, and
 * the bundle's records, zones, solves, parents, racers,
 * sparrers, inherited parents, egg records, hatch records,
 * garden now case, critter case, rebirth case, cocoon case,
 * tick case, and plant case are never used to pick them. And it does
 * NOT feed the bundle's sections: the bundle section still
 * reads its own caller-supplied inputs, never the harvest
 * section's record — harvesting a plot never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a
 * critter, never rebirths a record, never re-enters or
 * re-ticks a cocoon, never plants a seed, and never writes anything back into any
 * record — and no harvest result is written back anywhere, no
 * record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged harvest result and NO order invented between
 *   the bundle and the harvest section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO harvest computed from a bundle value (the record, the
 *   plot id, and the now are caller-supplied,
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
 *   hatched species, race scores section, spar scores section,
 *   garden now minutes, critter record, rebirth record,
 *   cocoon record, tick record, or plant record);
 * - NO harvest-to-placements chaining, NO
 *   harvest-to-breeding chaining, NO harvest-to-race chaining,
 *   NO harvest-to-spar chaining, NO harvest-to-inherited
 *   chaining, NO harvest-to-eggsteps chaining, NO
 *   harvest-to-hatch chaining, NO harvest-to-garden-now
 *   chaining, NO harvest-to-critter chaining, NO
 *   harvest-to-rebirth chaining, NO harvest-to-cocoon chaining,
 *   NO harvest-to-tick chaining, and NO harvest-to-plant
 *   chaining (harvesting a plot never makes a
 *   placements-cache entry, never gates or un-gates
 *   a breeding pair, never re-races or re-spars a pair,
 *   never re-inherits a stat line, never re-steps an egg,
 *   never hatches an egg, never re-reads the Garden's now,
 *   never re-applies a critter, never rebirths a record,
 *   never enters or ticks a cocoon, never plants a seed — and the bundle's plant
 *   record, whose plots garden-wiring plants on a planting,
 *   is never used to pick this section's record);
 * - NO planting here: plantPlot is a separate read, already
 *   composed in slice 78, and harvesting a plot never plants
 *   a seed;
 * - NO cocoon entry or tick derived here: enterCocoon and
 *   tickCocoon are separate reads, already composed in
 *   slices 76 and 77, and harvesting a plot never enters or
 *   ticks a cocoon;
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and harvesting a plot does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and harvesting a plot does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the harvest section reports the caller-supplied
 *   record as harvestPlot reports it, and harvesting a plot
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
 *   scores, garden now, critter, rebirth, cocoon, tick,
 *   plant, or harvest writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a harvest, now value, or harvested
 *   seed on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a harvest is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a harvest is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the harvest record is a fresh record with
 * a fresh farm array when the harvest rule passes (harvestPlot's own spread
 * and map), with the named plot fresh and every other plot aliased — values
 * unchanged except the harvested plot, nothing mutated. The
 * harvest-fail edge is harvestPlot's own behaviour, stated
 * plainly: a record whose named plot carries no seed, or
 * which names no such plot, or whose named plot is not yet
 * ready, or which carries no farm at all, reads back as the
 * caller's own record object with fruit null — values
 * unchanged, nothing mutated. The garden object inside the
 * harvest record keeps harvestPlot's own spread edge (aliased,
 * values unchanged, nothing mutated). The plant record inside
 * the bundle keeps the purity edge slice 78 states (a fresh
 * record with a fresh farm array in every case). The tick record inside
 * the bundle keeps the purity edge slice 77 states (fresh
 * only when the tick rule passes; aliased when the tick
 * rule fails — values unchanged, nothing mutated). The
 * cocoon record inside the bundle keeps the purity edge
 * slice 76 states (fresh only when the form gate passes;
 * aliased when the form gate fails — values unchanged,
 * nothing mutated). The rebirth record inside the bundle
 * keeps the purity edge slice 76 states (fresh only when
 * the bond gate passes; aliased when the bond is 50 or
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
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant";
import {
  harvestPlot,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The harvest section's inputs: a caller-supplied Garden record, a caller-named plot, and a caller-supplied now, read through garden-wiring's harvestPlot. */
export interface HarvestInputs {
  /** The caller-supplied Garden record the harvest is read from; its farm plots read back with the named plot harvested only when garden-wiring's harvest rule passes. */
  record: GardenSaveRecord;
  /** The caller-named plot id the fruit is harvested from; garden-wiring harvests only when a plot with this id carries a seed and its readyAt has been reached. */
  plotId: string;
  /** The caller-supplied Garden time in game minutes at which the harvest is read; garden-wiring harvests only when this value reaches or passes the named plot's readyAt. */
  nowMinutes: number;
}

/** The harvest section's report: the caller-supplied record as harvestPlot reports it, plus the fruit it yields (the plot's own seed, or null when the harvest rule does not pass). */
export interface HarvestReport {
  /** The record as harvestPlot reports it (a fresh record with a fresh farm array when the harvest rule passes, the caller's own record object when it does not). */
  record: GardenSaveRecord;
  /** The fruit harvestPlot yields: the named plot's seed when the harvest rule passes, null otherwise. */
  fruit: string | null;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle's inputs, as slice 78 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantInputs;
  /** The harvest section's inputs. */
  harvest: HarvestInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth plus what one caller-supplied Garden record reads as when its cocoon is ticked at a caller-supplied now plus what one caller-supplied Garden record reads as when a seed is planted in one of its plots at a caller-supplied now. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle, exactly as slice 78 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant;
  /** The harvested record and its fruit, exactly as garden-wiring reports it. */
  harvest: HarvestReport;
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
 * is ticked at a caller-supplied now plus what one
 * caller-supplied Garden record reads as when a seed is
 * planted in one of its plots at a caller-supplied now plus
 * what one caller-supplied Garden record reads as when one
 * of its plots is harvested at a caller-supplied now:
 * outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant bundle + one farm harvest, each exactly as its own
 * read reports it, side by side, with no merged harvest result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant inputs must be an object",
    );
  }
  if (inputs.harvest === null || typeof inputs.harvest !== "object" || Array.isArray(inputs.harvest)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest inputs must be an object",
    );
  }
  if (inputs.harvest.record === null || typeof inputs.harvest.record !== "object" || Array.isArray(inputs.harvest.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest record must be an object",
    );
  }
  if (
    inputs.harvest.record.garden === null ||
    typeof inputs.harvest.record.garden !== "object" ||
    Array.isArray(inputs.harvest.record.garden) ||
    typeof inputs.harvest.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.harvest.record.garden.dive) ||
    typeof inputs.harvest.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.harvest.record.garden.glide) ||
    typeof inputs.harvest.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.harvest.record.garden.sprint) ||
    typeof inputs.harvest.record.garden.might !== "number" ||
    !Number.isFinite(inputs.harvest.record.garden.might) ||
    typeof inputs.harvest.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.harvest.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.harvest.record.speciesId !== "string" || inputs.harvest.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest record speciesId must be a non-empty string",
    );
  }
  if (typeof inputs.harvest.plotId !== "string" || inputs.harvest.plotId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest plotId must be a non-empty string",
    );
  }
  if (typeof inputs.harvest.nowMinutes !== "number" || !Number.isFinite(inputs.harvest.nowMinutes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest: harvest nowMinutes must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant,
    );
  const harvestResult = harvestPlot(
    inputs.harvest.record,
    inputs.harvest.plotId,
    inputs.harvest.nowMinutes,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant,
    harvest: {
      record: harvestResult.rec,
      fruit: harvestResult.fruit,
    },
  };
}
