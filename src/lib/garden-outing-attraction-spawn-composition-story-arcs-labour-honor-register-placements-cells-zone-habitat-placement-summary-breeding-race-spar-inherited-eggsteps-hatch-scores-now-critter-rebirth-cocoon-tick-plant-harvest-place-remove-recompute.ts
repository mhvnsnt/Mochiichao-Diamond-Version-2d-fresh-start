/**
 * S14 slice 82 — B3 outing + attraction + spawn + composition + story + arcs
 * + labour + honour + register + placements + cells + zone habitat + placement
 * + summary + breeding + race + spar + inherited + eggsteps + hatch + race
 * scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant
 * + harvest + place + remove + recompute — one outing bundle plus one
 * habitats-cache recompute, pure library form.
 * (Filename note: this file's stem abbreviates racescores-sparscores to
 * scores and gardennow to now — the full chain stem + -recompute would be
 * over the 255-byte filename ceiling, and slice 81's test file was already
 * 247 bytes; exported function/type names keep the full chain name.)
 *
 * This module composes two already-landed reads and invents no new section
 * and no new rule. It calls the existing reads and reports exactly what
 * they return, side by side:
 * - the slice-81 bundle (outing + attraction + spawn + composition + story
 *   + arcs + labour + honour + register + placements + cells + zone habitat
 *   + placement + summary + breeding + race + spar + inherited + eggsteps
 *   + hatch + race scores + spar scores + garden now + critter + rebirth
 *   + cocoon + tick + plant + harvest + place + remove), exactly as slice 81
 *   reports it;
 * - what one caller-supplied Garden record reads as when its derived
 *   habitats cache is recomputed via garden-wiring's recomputeHabitats
 *   over caller-supplied recipes (and optional caller-supplied solve
 *   options), exactly as garden-wiring defines it: every zone that has
 *   placements gains a cache entry — the slice-1 solver's recognised
 *   habitat for that zone, or null when no caller-supplied recipe is
 *   satisfied (or when the caller-supplied cap blocks recognition);
 *   zones with no placements gain no cache entry; every other record
 *   field rides through unchanged; the input record is never mutated.
 *   Recipes are caller-supplied data — no recipe, item, habitat, band,
 *   richness, material, or category content is authored here — and the
 *   solver conversion carries itemId only, reading categories only from
 *   the caller's optional categoriesFor callback (default: none), exactly
 *   as garden-wiring's W3 header states.
 *
 * The recompute section is NOT computed from the bundle's values. In
 * particular it is NOT read off the bundle's summary string, placement
 * section, breeding gate, race winner, spar winner, inherited stat line,
 * stepped egg record, hatched record, race or spar scores section, garden
 * now minutes, critter record, rebirth record, cocoon record, tick record,
 * plant record, harvest record, place record, or remove record: the
 * caller supplies the record, the recipes, and the options explicitly,
 * and the bundle's records, zones, solves, parents, racers, sparrers,
 * inherited parents, egg records, hatch records, garden now case, critter
 * case, rebirth case, cocoon case, tick case, plant case, harvest case,
 * place case, and remove case are never used to pick them. And it does
 * NOT feed the bundle's sections: the bundle section still reads its own
 * caller-supplied inputs, never the recompute section's record — a
 * recompute never solves, changes, or re-solves a bundle habitat, never
 * places, moves, or removes a cell, never summarises a record, never
 * re-gates a breeding pair, never re-races or re-spars a pair, never
 * re-inherits a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a critter, never
 * rebirths a record, never re-enters or re-ticks a cocoon, never plants
 * a seed, never harvests a plot, and never writes anything back into
 * any record — and no recompute result is written back anywhere, no
 * record appended to any log. Whether a host stores the recomputed
 * record is a host decision, not this read's.
 *
 * This section never places or removes a cell: setPlacementCell and
 * removePlacementCell are separate reads, already composed in slices 80
 * and 81. It never plants or harvests: plantPlot and harvestPlot are
 * separate reads, already composed in slices 78 and 79. It never enters
 * or ticks a cocoon: enterCocoon and tickCocoon are separate reads,
 * already composed in slices 76 and 77. It never derives a race or spar
 * winner: runRace and runSpar are separate reads, already composed in
 * slices 66 and 67. It never creates a breeding egg and makes no species
 * choice: createBreedingEgg is a separate read, not composed here; the
 * species question stays HELD per garden-wiring's own comment. The {}
 * habitats on a placed/removed record in the bundle is invalidation
 * only, never a solved value; only this recompute section writes
 * solved values into a cache, and only for its own caller-supplied
 * record.
 *
 * Loud failures (throw) on a malformed input bundle and on any failure
 * propagated from either composed read, including a non-array recipes
 * list, a non-function categoriesFor, and a malformed recipe for a
 * zone that has placements (propagated from the solver).
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place-remove";
import {
  recomputeHabitats,
  type GardenPlacementSolveOptions,
  type GardenSaveRecord,
} from "./garden-wiring";
import type { HabitatRecipe } from "./garden-habitats";

/** The recompute section's inputs: a caller-supplied Garden record, caller-supplied recipes, and optional caller-supplied solve options, read through garden-wiring's recomputeHabitats. */
export interface RecomputeInputs {
  /** The caller-supplied Garden record whose derived habitats cache is recomputed; its placements are read, never mutated, and every other field rides through unchanged. */
  record: GardenSaveRecord;
  /** Caller-supplied recipes for the slice-1 solver; no recipe content is authored here. */
  recipes: readonly HabitatRecipe[];
  /** Optional caller-supplied solve options (cap, alreadyRegistered, categoriesFor); when omitted, the solver's defaults apply. */
  options?: GardenPlacementSolveOptions;
}

/** The recompute section's report: the caller-supplied record as recomputeHabitats reports it (a fresh record whose habitats cache holds one entry per zone that has placements — the recognised habitat or null — and no entry for zones with no placements). */
export interface RecomputeReport {
  /** The record as recomputeHabitats reports it. */
  record: GardenSaveRecord;
}

/** The inputs one slice-81 bundle plus one habitats-cache recompute is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeInputs {
  /** The slice-81 bundle's inputs, as slice 81 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveInputs;
  /** The recompute section's inputs. */
  recompute: RecomputeInputs;
}

/** One slice-81 bundle plus one habitats-cache recompute, each exactly as its own read reports it, side by side, with no merged recompute result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute {
  /** The slice-81 bundle, exactly as slice 81 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove;
  /** The recomputed record, exactly as garden-wiring reports it. */
  recompute: RecomputeReport;
}

/**
 * One slice-81 bundle plus one habitats-cache recompute:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove bundle + one recompute, each exactly
 * as its own read reports it, side by side, with no merged recompute result
 * and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute {
  const TAG =
    "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove !== "object"
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove inputs must be an object`);
  }
  if (inputs.recompute === null || typeof inputs.recompute !== "object" || Array.isArray(inputs.recompute)) {
    throw new Error(`${TAG}: recompute inputs must be an object`);
  }
  if (inputs.recompute.record === null || typeof inputs.recompute.record !== "object" || Array.isArray(inputs.recompute.record)) {
    throw new Error(`${TAG}: recompute record must be an object`);
  }
  if (
    inputs.recompute.record.garden === null ||
    typeof inputs.recompute.record.garden !== "object" ||
    Array.isArray(inputs.recompute.record.garden) ||
    typeof inputs.recompute.record.garden.dive !== "number" ||
    !Number.isFinite(inputs.recompute.record.garden.dive) ||
    typeof inputs.recompute.record.garden.glide !== "number" ||
    !Number.isFinite(inputs.recompute.record.garden.glide) ||
    typeof inputs.recompute.record.garden.sprint !== "number" ||
    !Number.isFinite(inputs.recompute.record.garden.sprint) ||
    typeof inputs.recompute.record.garden.might !== "number" ||
    !Number.isFinite(inputs.recompute.record.garden.might) ||
    typeof inputs.recompute.record.garden.endurance !== "number" ||
    !Number.isFinite(inputs.recompute.record.garden.endurance)
  ) {
    throw new Error(`${TAG}: recompute record garden must carry finite dive, glide, sprint, might, and endurance numbers`);
  }
  if (typeof inputs.recompute.record.speciesId !== "string" || inputs.recompute.record.speciesId.length === 0) {
    throw new Error(`${TAG}: recompute record speciesId must be a non-empty string`);
  }
  if (!Array.isArray(inputs.recompute.recipes)) {
    throw new Error(`${TAG}: recompute recipes must be an array`);
  }
  if (inputs.recompute.options !== undefined) {
    if (inputs.recompute.options === null || typeof inputs.recompute.options !== "object" || Array.isArray(inputs.recompute.options)) {
      throw new Error(`${TAG}: recompute options must be an object`);
    }
    if (inputs.recompute.options.categoriesFor !== undefined && typeof inputs.recompute.options.categoriesFor !== "function") {
      throw new Error(`${TAG}: recompute options categoriesFor must be a function`);
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove,
    );
  const recomputeRecord = recomputeHabitats(
    inputs.recompute.record,
    inputs.recompute.recipes,
    inputs.recompute.options,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemove,
    recompute: {
      record: recomputeRecord,
    },
  };
}
