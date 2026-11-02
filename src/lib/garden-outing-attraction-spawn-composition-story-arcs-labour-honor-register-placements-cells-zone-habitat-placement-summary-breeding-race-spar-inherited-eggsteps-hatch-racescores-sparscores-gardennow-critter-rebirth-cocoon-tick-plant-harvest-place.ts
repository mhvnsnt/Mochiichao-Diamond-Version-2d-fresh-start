/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch + race scores + spar scores + garden now
 * + critter + rebirth + cocoon + tick + plant + harvest + place — one outing plus its Garden
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
 * of its plots is harvested at a caller-supplied now plus
 * what one caller-supplied Garden record reads as when one
 * cell is placed in one of its zones, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-
 *   plus-garden-now-plus-critter-plus-rebirth-plus-cocoon-plus-tick-plus-plant-plus-harvest bundle
 *   from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest
 *   (slice 79);
 * - what one caller-supplied Garden record reads as when one
 *   cell is placed in one of its zones via garden-wiring's
 *   setPlacementCell, exactly as garden-wiring defines it:
 *   the named zone's cell map gains (or replaces) the
 *   caller-named cell key with a fresh copy of the
 *   caller-supplied cell (itemId and rotation), every other
 *   zone reads back unchanged, and the derived habitats
 *   cache is cleared to {} — garden-wiring's invalidation,
 *   not a solved value and not a recompute. No coordinate
 *   grid is invented here: the cell key is the caller's
 *   distinct position key, never parsed. No rotation step
 *   is imposed: any finite number is a facing. The place
 *   is a pure reading only: it reports the placed record,
 *   and whether a host stores that record is a host
 *   decision, not this read's. This section never removes
 *   a cell: removePlacementCell is a separate read, not
 *   composed here. It never recomputes a cache:
 *   recomputeHabitats is a separate read, already composed
 *   in the placements slice.
 *
 * The place section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited,
 * eggsteps, hatch, race scores, spar scores, garden now,
 * critter, rebirth, cocoon, tick, plant, or harvest values.
 * In particular it is NOT read off the bundle's summary
 * string, its placement section, its breeding gate, its
 * race winner, its spar winner, its inherited stat line,
 * its stepped egg record, its hatched record, its race or
 * spar scores section, its garden now minutes, its critter
 * record, its rebirth record, its cocoon record, its tick
 * record, its plant record, or its harvest record: the
 * caller supplies the record, the zone id, the cell key,
 * and the cell explicitly, and the bundle's records,
 * zones, solves, parents, racers, sparrers, inherited
 * parents, egg records, hatch records, garden now case,
 * critter case, rebirth case, cocoon case, tick case,
 * plant case, and harvest case are never used to pick
 * them. And it does NOT feed the bundle's sections: the
 * bundle section still reads its own caller-supplied
 * inputs, never the place section's record — placing a
 * cell never solves, changes, or re-solves a habitat,
 * never places, moves, or removes another cell, never
 * summarises a record, never re-gates a breeding pair,
 * never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, never hatches an
 * egg, never re-reads the Garden's now, never re-applies
 * a critter, never rebirths a record, never re-enters or
 * re-ticks a cocoon, never plants a seed, never harvests
 * a plot, and never writes anything back into any
 * record — and no place result is written back anywhere,
 * no record is appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged place result and NO order invented between
 *   the bundle and the place section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO place computed from a bundle value (the record, the
 *   zone id, the cell key, and the cell are caller-supplied,
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
 *   cocoon record, tick record, plant record, or harvest
 *   record);
 * - NO place-to-placements chaining, NO place-to-breeding
 *   chaining, NO place-to-race chaining, NO place-to-spar
 *   chaining, NO place-to-inherited chaining, NO
 *   place-to-eggsteps chaining, NO place-to-hatch chaining,
 *   NO place-to-garden-now chaining, NO place-to-critter
 *   chaining, NO place-to-rebirth chaining, NO
 *   place-to-cocoon chaining, NO place-to-tick chaining,
 *   NO place-to-plant chaining, and NO place-to-harvest
 *   chaining (placing a cell never makes a placements-cache
 *   entry beyond the {} invalidation, never gates or
 *   un-gates a breeding pair, never re-races or re-spars a
 *   pair, never re-inherits a stat line, never re-steps an
 *   egg, never hatches an egg, never re-reads the Garden's
 *   now, never re-applies a critter, never rebirths a
 *   record, never enters or ticks a cocoon, never plants a
 *   seed, never harvests a plot — and the bundle's
 *   placements record, whose zones garden-wiring solves on
 *   a recompute, is never used to pick this section's
 *   record);
 * - NO cell removal here: removePlacementCell is a separate
 *   read, not composed here, and placing a cell never
 *   removes another cell (replacing the same cell key is
 *   garden-wiring's own replace, not a removal);
 * - NO cache recompute here: recomputeHabitats is a
 *   separate read, already composed in the placements
 *   slice, and the {} habitats on the placed record is
 *   invalidation only, never a solved habitat;
 * - NO planting here: plantPlot is a separate read, already
 *   composed in slice 78, and placing a cell never plants
 *   a seed;
 * - NO harvest here: harvestPlot is a separate read, already
 *   composed in slice 79, and placing a cell never yields
 *   fruit;
 * - NO cocoon entry or tick derived here: enterCocoon and
 *   tickCocoon are separate reads, already composed in
 *   slices 76 and 77, and placing a cell never enters or
 *   ticks a cocoon;
 * - NO race winner derived here: runRace is a separate read,
 *   already composed in slice 66, and placing a cell does
 *   not re-decide it;
 * - NO spar winner derived here: runSpar is a separate read,
 *   already composed in slice 67, and placing a cell does
 *   not re-decide it;
 * - NO egg creation for breeding and NO species choice:
 *   createBreedingEgg is a separate read, not composed here,
 *   and the species question for creating an egg stays HELD
 *   per garden-wiring's own comment;
 * - NO new creature record built here (no newGardenRecord
 *   call; the place section reports the caller-supplied
 *   record as setPlacementCell reports it, and placing a
 *   cell never changes the record's speciesId);
 * - NO stored placements writer: this module never stores
 *   a placed record, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual, teacher,
 *   movement, arrival, research, discovery, news, inbound,
 *   migration, story, arc, habitat, attraction, spawn,
 *   composition, labour, honour, register, placements,
 *   cells, zone-habitat, placement, summary, breeding, race,
 *   spar, inherited, eggsteps, hatch, race scores, spar
 *   scores, garden now, critter, rebirth, cocoon, tick,
 *   plant, harvest, or place writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a placement, zone, cell key, or
 *   placed item on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a placement is consulted anywhere is a host
 *   decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a placement is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays, and the place record is a fresh record with
 * a fresh placements map, a fresh zone map, and a fresh
 * placed cell (setPlacementCell's own spread and map),
 * with every other zone map aliased and every other record
 * field aliased — values unchanged except the placed cell
 * and the cleared habitats cache, nothing mutated. The
 * harvest record inside the bundle keeps the purity edge
 * slice 79 states (a fresh record with a fresh farm array
 * when the harvest rule passes; aliased when the harvest
 * rule fails — values unchanged, nothing mutated). The
 * plant record inside the bundle keeps the purity edge
 * slice 78 states (a fresh record with a fresh farm array
 * in every case). The tick record inside the bundle keeps
 * the purity edge slice 77 states (fresh only when the
 * tick rule passes; aliased when the tick rule fails —
 * values unchanged, nothing mutated). The cocoon record
 * inside the bundle keeps the purity edge slice 76 states
 * (fresh only when the form gate passes; aliased when the
 * form gate fails — values unchanged, nothing mutated).
 * The rebirth record inside the bundle keeps the purity
 * edge slice 76 states (fresh only when the bond gate
 * passes; aliased when the bond is 50 or below — values
 * unchanged, nothing mutated). The hatch record inside
 * the bundle keeps the purity edge slice 75 states (fresh
 * only when the egg was at 0 steps; aliased when the
 * record carries no egg or an egg above 0 steps — values
 * unchanged, nothing mutated). The critter record inside
 * the bundle keeps the purity edge slice 75 states (fresh
 * only for a known critter; aliased for an unknown
 * critter — values unchanged, nothing mutated). Loud
 * failures (throw) on a malformed input bundle and on any
 * failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest";
import {
  setPlacementCell,
  type GardenPlacementCell,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The place section's inputs: a caller-supplied Garden record, a caller-named zone, a caller-named cell key, and a caller-supplied cell, read through garden-wiring's setPlacementCell. */
export interface PlaceInputs {
  /** The caller-supplied Garden record the cell is placed in; its placements read back with the named cell placed in the named zone, and its derived habitats cache cleared, exactly as garden-wiring reports it. */
  record: GardenSaveRecord;
  /** The caller-named zone id the cell is placed in; garden-wiring places only in this zone. */
  zoneId: string;
  /** The caller-named cell key (position key within the zone) the cell is placed at; garden-wiring never parses it and never invents a coordinate grid. */
  cellKey: string;
  /** The caller-supplied cell: its item id and its facing, copied fresh by garden-wiring. */
  cell: GardenPlacementCell;
}

/** The place section's report: the caller-supplied record as setPlacementCell reports it (a fresh record with the cell placed and the habitats cache cleared). */
export interface PlaceReport {
  /** The record as setPlacementCell reports it: the named zone's cell map with the placed cell copied in, every other zone unchanged, and habitats cleared to {} (garden-wiring's cache invalidation, not a solved value). */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle's inputs, as slice 79 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestInputs;
  /** The place section's inputs. */
  place: PlaceInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to plus what two caller-supplied Garden stat lines score in a spar plus what the Garden's now reads as in game minutes plus what one caller-supplied Garden record reads as with one caller-supplied critter applied plus what one caller-supplied Garden record reads as after a data rebirth plus what one caller-supplied Garden record reads as when its cocoon is ticked at a caller-supplied now plus what one caller-supplied Garden record reads as when a seed is planted in one of its plots at a caller-supplied now. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlace {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch-plus-race-scores-plus-spar-scores-plus-garden-now-plus-critter-plus-rebirth bundle, exactly as slice 79 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest;
  /** The placed record, exactly as garden-wiring reports it. */
  place: PlaceReport;
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
 * of its plots is harvested at a caller-supplied now plus
 * what one caller-supplied Garden record reads as when one
 * cell is placed in one of its zones:
 * outing-attraction-spawn-composition-story-arcs-
 * labour-honour-register-placements-cells-zone-habitat-
 * placement-summary-breeding-race-spar-inherited-eggsteps-
 * hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest bundle + one placement, each exactly as its own
 * read reports it, side by side, with no merged place result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlace(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlace {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest inputs must be an object",
    );
  }
  if (inputs.place === null || typeof inputs.place !== "object" || Array.isArray(inputs.place)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place inputs must be an object",
    );
  }
  if (inputs.place.record === null || typeof inputs.place.record !== "object" || Array.isArray(inputs.place.record)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place record must be an object",
    );
  }
  if (
    inputs.place.record.garden === null ||
    typeof inputs.place.record.garden !== "object" ||
    Array.isArray(inputs.place.record.garden) ||
    typeof inputs.place.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.place.record.garden.dive) ||
    typeof inputs.place.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.place.record.garden.glide) ||
    typeof inputs.place.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.place.record.garden.sprint) ||
    typeof inputs.place.record.garden.might !== "number" ||
    !Number.isFinite(inputs.place.record.garden.might) ||
    typeof inputs.place.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.place.record.garden.endurance)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place record garden must carry finite dive, glide, sprint, might, and endurance numbers",
    );
  }
  if (typeof inputs.place.record.speciesId !== "string" || inputs.place.record.speciesId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place record speciesId must be a non-empty string",
    );
  }
  if (typeof inputs.place.zoneId !== "string" || inputs.place.zoneId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place zoneId must be a non-empty string",
    );
  }
  if (typeof inputs.place.cellKey !== "string" || inputs.place.cellKey.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place cellKey must be a non-empty string",
    );
  }
  if (inputs.place.cell === null || typeof inputs.place.cell !== "object" || Array.isArray(inputs.place.cell)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place cell must be an object",
    );
  }
  if (typeof inputs.place.cell.itemId !== "string" || inputs.place.cell.itemId.length === 0) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place cell itemId must be a non-empty string",
    );
  }
  if (typeof inputs.place.cell.rotation !== "number" || !Number.isFinite(inputs.place.cell.rotation)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place: place cell rotation must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest,
    );
  const placeRecord = setPlacementCell(
    inputs.place.record,
    inputs.place.zoneId,
    inputs.place.cellKey,
    inputs.place.cell,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvest,
    place: {
      record: placeRecord,
    },
  };
}
