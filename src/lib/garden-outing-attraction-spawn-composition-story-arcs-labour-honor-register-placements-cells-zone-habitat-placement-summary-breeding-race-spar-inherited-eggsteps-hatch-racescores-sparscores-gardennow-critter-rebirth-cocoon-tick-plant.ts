/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth + cocoon + tick + plant — one outing plus its Garden
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
 * planted in one of its plots at a caller-supplied now,
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
 *   plus-garden-now-plus-critter-plus-rebirth-plus-cocoon-plus-tick bundle
 *   from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick
 *   (slice 77);
 * - what one caller-supplied Garden record reads as when a
 *   seed is planted in one of its plots via garden-wiring's
 *   plantPlot, exactly as garden-wiring defines it: when the
 *   caller-named plot exists and carries no seed yet, the
 *   record reads back with that plot carrying the seed,
 *   plantedAt set to the caller-supplied nowMinutes, readyAt
 *   set to nowMinutes plus 7, and harvested false; otherwise
 *   the record reads back with every plot unchanged in value.
 *   No plant threshold and no ready delay is invented here:
 *   the empty-plot gate and the plus-7 are garden-wiring's
 *   own rules. The planting is a pure reading only: it
 *   reports the planted record, and whether a host stores
 *   that record is a host decision, not this read's. This
 *   section never harvests a plot: harvestPlot is a separate
 *   read, not composed here.
 *
 * The plant section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now,
 * critter, rebirth, cocoon, or tick values. In particular it is NOT
 * read off the bundle's summary string, its placement section,
 * its breeding gate, its race winner, its spar winner, its
 * inherited stat line, its stepped egg record, its hatched
 * record, its race or spar scores section, its garden now
 * minutes, its critter record, its rebirth record, its
 * cocoon record, or its tick record: the caller supplies the
 * record, the plot id, the seed, and the now explicitly, and
 * the bundle's records, zones, solves, parents, racers,
 * sparrers, inherited parents, egg records, hatch records,
 * garden now case, critter case, rebirth case, cocoon case,
 * and tick case are never used to pick them. And it does
 * NOT feed the bundle's sections: the bundle section still
 * reads its own caller-supplied inputs, never the plant
 * section's record — planting a seed never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a
 * critter, never rebirths a record, never re-enters or
 * re-ticks a cocoon, and never writes anything back into any
 * record — and no plant result is written back anywhere, no
 * record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged plant result and NO order invented between
 *   the bundle and the plant section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO plant computed from a bundle value (the record, the
 *   plot id, the seed, and the now are caller-supplied,
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
 *   cocoon record, or tick record);
 * - NO plant-to-placements chaining, NO
 *   plant-to-breeding chaining, NO plant-to-race chaining,
 *   NO plant-to-spar chaining, NO plant-to-inherited
 *   chaining, NO plant-to-eggsteps chaining, NO
 *   plant-to-hatch chaining, NO plant-to-garden-now
 *   chaining, NO plant-to-critter chaining, NO
 *   plant-to-rebirth chaining, NO plant-to-cocoon chaining,
 *   and NO plant-to-tick chaining (planting a seed never
 *   makes a placements-cache entry, never gates or un-gates
 *   a breeding pair, never re-races or re-spars a pair,
 *   never re-inherits a stat line, never re-steps an egg,
 *   never hatches an egg, never re-reads the Garden's now,
 *   never re-applies a critter, never rebirths a record,
 *   never enters or ticks a cocoon — and the bundle's tick
 *   record, whose gardenAge garden-wiring raises on a tick,
 *   is never used to pick this section's record);
 * - NO harvest here: harvestPlot is a separate read, not
 *   composed here, and planting a seed never yields fruit;
 * - NO cocoon entry or tick derived here: enterCocoon and
 *   tickCocoon are separate reads, already composed in
 *   slices 76 and 77, and planting a seed never enters or
 *   ticks a cocoon;
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and planting a seed does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and planting a seed does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the plant section reports the caller-supplied
 *   record as plantPlot reports it, and planting a seed
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
 *   scores, garden now, critter, rebirth, cocoon, tick, or
 *   plant writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a planting, now value, or planted
 *   seed on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a planting is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a planting is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the plant record is a fresh record with
 * a fresh farm array in every case (plantPlot's own spread
 * and map), with the named plot fresh only when the plant
 * rule passes and every other plot aliased — values
 * unchanged except the planted plot, nothing mutated. The
 * plant-fail edge is plantPlot's own behaviour, stated
 * plainly: a record whose named plot already carries a seed,
 * or which names no such plot, or which carries no farm at
 * all, reads back with a fresh record object and a fresh
 * farm array whose plot objects are the caller's own — values
 * unchanged, nothing mutated. The garden object inside the
 * plant record keeps plantPlot's own spread edge (aliased,
 * values unchanged, nothing mutated). The tick record inside
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
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick";
import {
  plantPlot,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The plant section's inputs: a caller-supplied Garden record, a caller-named plot, a caller-supplied seed, and a caller-supplied now, read through garden-wiring's plantPlot. */
export interface PlantInputs {
  /** The caller-supplied Garden record the planting is read from; its farm plots read back with the named plot planted only when garden-wiring's plant rule passes. */
  record: GardenSaveRecord;
  /** The caller-named plot id the seed is planted in; garden-wiring plants only when a plot with this id carries no seed yet. */
  plotId: string;
  /** The caller-supplied seed planted in the named plot; garden-wiring stores it verbatim and derives no fruit from it here. */
  seed: string;
  /** The caller-supplied Garden time in game minutes at which the planting is read; garden-wiring sets plantedAt to this value and readyAt to this value plus 7. */
  nowMinutes: number;
}

/** The plant section's report: the caller-supplied record as plantPlot reports it. */
export interface PlantReport {
  /** The record as plantPlot reports it (a fresh record with a fresh farm array; the named plot fresh with the seed, plantedAt, and readyAt set when the plant rule passes; every plot unchanged in value when it does not). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle's inputs, as slice 77 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickInputs;
  /** The plant section's inputs. */
  plant: PlantInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth plus what one caller-supplied Garden record reads as when its cocoon is ticked at a caller-supplied now plus what one caller-supplied Garden record reads as when a seed is planted in one of its plots at a caller-supplied now. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle, exactly as slice 77 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick;
  /** The planted record, exactly as garden-wiring reports it. */
  plant: PlantReport;
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
 * planted in one of its plots at a caller-supplied now:
 * outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick bundle + one farm planting, each exactly as its own
 * read reports it, side by side, with no merged plant result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlant {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick inputs must be an object",
    );
  }
  if (inputs.plant === null || typeof inputs.plant !== "object" || Array.isArray(inputs.plant)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant inputs must be an object",
    );
  }
  if (inputs.plant.record === null || typeof inputs.plant.record !== "object" || Array.isArray(inputs.plant.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant record must be an object",
    );
  }
  if (
    inputs.plant.record.garden === null ||
    typeof inputs.plant.record.garden !== "object" ||
    Array.isArray(inputs.plant.record.garden) ||
    typeof inputs.plant.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.plant.record.garden.dive) ||
    typeof inputs.plant.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.plant.record.garden.glide) ||
    typeof inputs.plant.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.plant.record.garden.sprint) ||
    typeof inputs.plant.record.garden.might !== "number" ||
    !Number.isFinite(inputs.plant.record.garden.might) ||
    typeof inputs.plant.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.plant.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.plant.record.speciesId !== "string" || inputs.plant.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant record speciesId must be a non-empty string",
    );
  }
  if (typeof inputs.plant.plotId !== "string" || inputs.plant.plotId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant plotId must be a non-empty string",
    );
  }
  if (typeof inputs.plant.seed !== "string" || inputs.plant.seed.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant seed must be a non-empty string",
    );
  }
  if (typeof inputs.plant.nowMinutes !== "number" || !Number.isFinite(inputs.plant.nowMinutes)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant: plant nowMinutes must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick,
    );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTick,
    plant: {
      record: plantPlot(
        inputs.plant.record,
        inputs.plant.plotId,
        inputs.plant.seed,
        inputs.plant.nowMinutes,
      ),
    },
  };
}
