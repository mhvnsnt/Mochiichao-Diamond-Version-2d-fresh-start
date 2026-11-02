// S14 slice 90 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water bundle (pure library) + one phase-4 berry-harvest reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND writes berry+tick as one word "berrytick" (carried from slice 87), AND abbreviates, in the stem only, placement to placem, summary to summ, breeding to breed, and habitat to hab (all four carried from slice 88), AND abbreviates, in the stem only, labour to lab, critter to crit, cocoon to coc, and harvest to harv (all four carried from slice 89), AND abbreviates, in the stem only, garden to gard, outing to out, berrywater to berrywat, and berryharvest to berryharv (all four new in this slice): without the four new abbreviations the module filename would be 259 bytes and the test filename 264 bytes, over the 255-byte ceiling; with them the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-89 import path keeps slice 89's exact stem.
// The berryHarvest section is NOT computed from the bundle's values. The caller supplies the patch explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, berry-stage section, berry-tick section, berry-plant section, or berry-water section. The berryHarvest section does NOT feed the bundle's sections: harvesting a patch never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a patch, never plants a seed, never waters a patch, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, and never writes anything back into any record or into any bundle patch.
// The harvest rule is phase-4 garden's own (berryHarvest): a patch that is not at stage fruit, or whose seedId is null, returns yield 0 with the patch unchanged; a fruit patch with a seed returns yield 2 + round(waterBonus * 2) + 1 if harvested within 120 minutes of reaching fruit (ageMinutes - 480 <= 120), and the patch reset to empty with seedId null, age 0, waterings 0, and water bonus 0. This slice does NOT tick, plant, or water a patch, does NOT apply companion care, does NOT tick daycare steps, and does NOT build any patch state beyond returning berryHarvest's yield and patch. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a berryHarvest case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater,
} from "./garden-outing-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tick-plant-harv-place-remove-recomp-upgrade-empty-fresh-berrytick-berryplant-berrywater";
import {
  berryHarvest,
  type BerryPatch,
} from "./wiring/phase4-garden";

/** The berryHarvest section's inputs: a caller-supplied patch. */
export interface BerryHarvestInputs {
  /** The patch to harvest, as the caller supplies it. */
  patch: BerryPatch;
}

/** The berryHarvest section's report: the yield and the patch after harvest, exactly as phase-4 garden reports them. */
export interface BerryHarvestReport {
  /** The harvested yield (0 unless the patch is a seeded fruit patch). */
  yieldCount: number;
  /** The patch after harvest (unchanged unless it was a seeded fruit patch, which resets to empty). */
  patch: BerryPatch;
}

/** The inputs one slice-89 bundle plus one berry-harvest reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestInputs {
  /** The slice-89 bundle's inputs, as slice 89 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterInputs;
  /** The berryHarvest section's inputs (patch). */
  berryHarvest: BerryHarvestInputs;
}

/** One slice-89 bundle plus one berry-harvest reading, each exactly as its own read reports it, side by side, with no merged berry result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest {
  /** The slice-89 bundle, exactly as slice 89 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater;
  /** The yield and the patch after harvest, exactly as phase-4 garden reports them. */
  berryHarvest: BerryHarvestReport;
}

/**
 * One slice-89 bundle plus one berry-harvest reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water bundle + one
 * berry harvest, each exactly as its own read reports it, side by side, with
 * no merged berry result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest {
  const TAG = "gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tick-plant-harv-place-remove-recomp-upgrade-empty-fresh-berrytick-berryplant-berrywat-berryharv";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater inputs must be an object`);
  }
  if (inputs.berryHarvest === null || typeof inputs.berryHarvest !== "object" || Array.isArray(inputs.berryHarvest)) {
    throw new Error(`${TAG}: berryHarvest inputs must be an object`);
  }
  if (inputs.berryHarvest.patch === null || typeof inputs.berryHarvest.patch !== "object" || Array.isArray(inputs.berryHarvest.patch)) {
    throw new Error(`${TAG}: berryHarvest patch must be an object`);
  }
  if (typeof inputs.berryHarvest.patch.waterBonus !== "number" || Number.isNaN(inputs.berryHarvest.patch.waterBonus)) {
    throw new Error(`${TAG}: berryHarvest patch waterBonus must be a number`);
  }
  if (typeof inputs.berryHarvest.patch.ageMinutes !== "number" || Number.isNaN(inputs.berryHarvest.patch.ageMinutes)) {
    throw new Error(`${TAG}: berryHarvest patch ageMinutes must be a number`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater,
  );
  const harvested = berryHarvest(inputs.berryHarvest.patch);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater,
    berryHarvest: {
      yieldCount: harvested.yieldCount,
      patch: harvested.patch,
    },
  };
}
