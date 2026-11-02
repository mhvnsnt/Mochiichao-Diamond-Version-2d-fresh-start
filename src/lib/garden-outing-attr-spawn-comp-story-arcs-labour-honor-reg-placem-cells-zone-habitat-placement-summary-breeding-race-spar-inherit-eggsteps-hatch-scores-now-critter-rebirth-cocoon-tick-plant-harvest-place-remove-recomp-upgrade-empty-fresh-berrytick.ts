// S14 slice 87 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage bundle (pure library) + one phase-4 berry-tick reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND writes berry+tick as one word "berrytick": appending "-tick" to the slice-86 stem would make the test filename exactly 255, the ceiling, while the joined spelling keeps the module filename at 249 bytes and the test filename at 254 bytes, both under the 255-byte ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-86 import path keeps slice 86's exact stem.
// The berryTick section is NOT computed from the bundle's values. The caller supplies the patch and the elapsed minutes explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, or berry-stage section. The berryTick section does NOT feed the bundle's sections: a patch tick never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never plants a seed, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, and never writes anything back into any record or into the caller's patch.
// The tick rule is phase-4 garden's own (berryTick): age advances by the elapsed minutes, the stage follows berryStageForAge, and fruit left unharvested withers at age >= 720 — the wither rule IS part of this read, exactly as berryTick reports it. This slice does NOT plant, water, or harvest a patch, does NOT apply companion care, does NOT tick daycare steps, and does NOT build any patch state beyond returning berryTick's new patch object. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a berryTick case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage,
} from "./garden-outing-attr-spawn-comp-story-arcs-labour-honor-reg-placem-cells-zone-habitat-placement-summary-breeding-race-spar-inherit-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recomp-upgrade-empty-fresh-berry";
import {
  berryTick,
  type BerryPatch,
} from "./wiring/phase4-garden";

/** The berryTick section's inputs: a caller-supplied patch and elapsed minutes. */
export interface BerryTickInputs {
  /** The patch to tick, as the caller supplies it. */
  patch: BerryPatch;
  /** The elapsed minutes in Garden time, as the caller supplies them. */
  elapsedMinutes: number;
}

/** The berryTick section's report: the ticked patch, exactly as phase-4 garden reports it. */
export interface BerryTickReport {
  /** The patch after the tick (a new object; the caller's patch is untouched). */
  patch: BerryPatch;
}

/** The inputs one slice-86 bundle plus one berry-tick reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickInputs {
  /** The slice-86 bundle's inputs, as slice 86 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageInputs;
  /** The berryTick section's inputs (patch + elapsed minutes). */
  berryTick: BerryTickInputs;
}

/** One slice-86 bundle plus one berry-tick reading, each exactly as its own read reports it, side by side, with no merged berry result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTick {
  /** The slice-86 bundle, exactly as slice 86 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage;
  /** The ticked patch, exactly as phase-4 garden reports it. */
  berryTick: BerryTickReport;
}

/**
 * One slice-86 bundle plus one berry-tick reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage bundle + one
 * berry tick, each exactly as its own read reports it, side by side, with
 * no merged berry result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTick(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTick {
  const TAG = "garden-outing-attr-spawn-comp-story-arcs-labour-honor-reg-placem-cells-zone-habitat-placement-summary-breeding-race-spar-inherit-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recomp-upgrade-empty-fresh-berrytick";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage inputs must be an object`);
  }
  if (inputs.berryTick === null || typeof inputs.berryTick !== "object" || Array.isArray(inputs.berryTick)) {
    throw new Error(`${TAG}: berryTick inputs must be an object`);
  }
  if (inputs.berryTick.patch === null || typeof inputs.berryTick.patch !== "object" || Array.isArray(inputs.berryTick.patch)) {
    throw new Error(`${TAG}: berryTick patch must be an object`);
  }
  if (typeof inputs.berryTick.patch.ageMinutes !== "number" || Number.isNaN(inputs.berryTick.patch.ageMinutes)) {
    throw new Error(`${TAG}: berryTick patch ageMinutes must be a number`);
  }
  if (typeof inputs.berryTick.elapsedMinutes !== "number" || Number.isNaN(inputs.berryTick.elapsedMinutes)) {
    throw new Error(`${TAG}: berryTick elapsedMinutes must be a number`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage,
  );
  const patch = berryTick(inputs.berryTick.patch, inputs.berryTick.elapsedMinutes);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStage,
    berryTick: {
      patch,
    },
  };
}
