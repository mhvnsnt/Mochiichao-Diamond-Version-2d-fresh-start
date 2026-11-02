/**
 * S14 slice 84 — B3 outing + attraction + spawn + composition + story + arcs
 * + labour + honour + register + placements + cells + zone habitat + placement
 * + summary + breeding + race + spar + inherited + eggsteps + hatch + race
 * scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant
 * + harvest + place + remove + recompute + upgrade + empty — one outing bundle
 * plus one empty placements block, pure library form.
 * (Filename note: this file's stem abbreviates racescores-sparscores to
 * scores, gardennow to now, composition to comp, and attraction to attr —
 * the full chain stem + -empty would be over the 255-byte filename ceiling
 * even with the scores + now + comp abbreviations (253 bytes for the module,
 * 258 for the test); with the attr abbreviation the module is 247 bytes and
 * the test 252 bytes. Exported function/type names keep the full chain name.)
 *
 * This module composes two already-landed reads and invents no new section
 * and no new rule. It calls the existing reads and reports exactly what
 * they return, side by side:
 * - the slice-83 bundle (outing + attraction + spawn + composition + story
 *   + arcs + labour + honour + register + placements + cells + zone habitat
 *   + placement + summary + breeding + race + spar + inherited + eggsteps
 *   + hatch + race scores + spar scores + garden now + critter + rebirth
 *   + cocoon + tick + plant + harvest + place + remove + recompute + upgrade),
 *   exactly as slice 83 reports it;
 * - what garden-wiring's emptyPlacements reports: the empty placements
 *   block {}, exactly as garden-wiring defines it — the value old saves
 *   migrate to. It takes no arguments and authors no zone, cell, item, or
 *   habitat content.
 *
 * The empty section is NOT computed from the bundle's values. In
 * particular it is NOT read off the bundle's summary string, placement
 * section, breeding gate, race winner, spar winner, inherited stat line,
 * stepped egg record, hatched record, race or spar scores section, garden
 * now minutes, critter record, rebirth record, cocoon record, tick record,
 * plant record, harvest record, place record, remove record, recompute
 * record, or upgrade record: the caller supplies the empty section's
 * inputs (an empty object) explicitly, and the bundle's records, zones,
 * solves, parents, racers, sparrers, inherited parents, egg records,
 * hatch records, garden now case, critter case, rebirth case, cocoon
 * case, tick case, plant case, harvest case, place case, remove case,
 * recompute case, and upgrade case are never used to pick them. And it
 * does NOT feed the bundle's sections: the bundle section still reads its
 * own caller-supplied inputs, never the empty section's block — an empty
 * block never solves, changes, or re-solves a bundle habitat, never
 * places, moves, or removes a cell, never summarises a record, never
 * re-gates a breeding pair, never re-races or re-spars a pair, never
 * re-inherits a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a critter, never
 * rebirths a record, never re-enters or re-ticks a cocoon, never plants
 * a seed, never harvests a plot, never recomputes a habitats cache, never
 * upgrades a record, and never writes anything back into any record —
 * and no empty result is written back anywhere, no record appended to any
 * log. Whether a host stores the empty block is a host decision, not
 * this read's.
 *
 * This section never creates a breeding egg and makes no species choice:
 * createBreedingEgg is a separate read, not composed here; the species
 * question stays HELD per garden-wiring's own comment. It never places or
 * removes a cell: setPlacementCell and removePlacementCell are separate
 * reads, already composed in slices 80 and 81. It never recomputes a
 * cache: recomputeHabitats is a separate read, already composed in slice
 * 82. It never upgrades a record: upgradeGardenRecord is a separate read,
 * already composed in slice 83.
 *
 * Loud failures (throw) on a malformed input bundle and on any failure
 * propagated from the composed bundle read, and on a malformed empty
 * section input (null, an array, or a non-object).
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade,
} from "./garden-outing-attraction-spawn-comp-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade";
import {
  emptyPlacements,
  type GardenPlacements,
} from "./garden-wiring";

/** The empty section's inputs: an empty object. emptyPlacements takes no arguments. */
export interface EmptyInputs {
  // No fields: the empty placements block is a constant read, not a function of caller data.
}

/** The empty section's report: the empty placements block, exactly as garden-wiring reports it. */
export interface EmptyReport {
  /** The empty placements block {}. */
  placements: GardenPlacements;
}

/** The inputs one slice-83 bundle plus one empty placements block is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyInputs {
  /** The slice-83 bundle's inputs, as slice 83 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeInputs;
  /** The empty section's inputs (an empty object). */
  empty: EmptyInputs;
}

/** One slice-83 bundle plus one empty placements block, each exactly as its own read reports it, side by side, with no merged empty result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmpty {
  /** The slice-83 bundle, exactly as slice 83 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade;
  /** The empty placements block, exactly as garden-wiring reports it. */
  empty: EmptyReport;
}

/**
 * One slice-83 bundle plus one empty placements block:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute-upgrade bundle + one empty,
 * each exactly as its own read reports it, side by side, with no merged
 * empty result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmpty(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmpty {
  const TAG = "garden-outing-attr-spawn-comp-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade !== "object"
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade inputs must be an object`);
  }
  if (inputs.empty === null || typeof inputs.empty !== "object" || Array.isArray(inputs.empty)) {
    throw new Error(`${TAG}: empty inputs must be an object`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade,
  );
  const emptyPlacementsBlock = emptyPlacements();
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade,
    empty: {
      placements: emptyPlacementsBlock,
    },
  };
}
