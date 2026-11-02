// S14 slice 89 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant bundle (pure library) + one phase-4 berry-water reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND writes berry+tick as one word "berrytick" (carried from slice 87), AND abbreviates, in the stem only, placement to placem, summary to summ, breeding to breed, and habitat to hab (all four carried from slice 88), AND abbreviates, in the stem only, labour to lab, critter to crit, cocoon to coc, and harvest to harv (all four new in this slice): without the four new abbreviations the module filename would be 258 bytes and the test filename 263 bytes, over the 255-byte ceiling; with them the module filename is 246 bytes and the test filename is 251 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-88 import path keeps slice 88's exact stem.
// The berryWater section is NOT computed from the bundle's values. The caller supplies the patch explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, berry-stage section, berry-tick section, or berry-plant section. The berryWater section does NOT feed the bundle's sections: watering a patch never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a patch, never plants a seed, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, and never writes anything back into any record or into any bundle patch.
// The water rule is phase-4 garden's own (berryWater): a patch at stage empty, fruit, or withered is returned unchanged; any other stage returns the same patch with waterings + 1 and water bonus + 0.25 capped at 1. This slice does NOT tick, plant, or harvest a patch, does NOT apply companion care, does NOT tick daycare steps, and does NOT build any patch state beyond returning berryWater's patch object. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a berryWater case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant,
} from "./garden-outing-attr-spawn-comp-story-arcs-labour-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recomp-upgrade-empty-fresh-berrytick-berryplant";
import {
  berryWater,
  type BerryPatch,
} from "./wiring/phase4-garden";

/** The berryWater section's inputs: a caller-supplied patch. */
export interface BerryWaterInputs {
  /** The patch to water, as the caller supplies it. */
  patch: BerryPatch;
}

/** The berryWater section's report: the watered patch, exactly as phase-4 garden reports it. */
export interface BerryWaterReport {
  /** The patch after watering (unchanged at empty, fruit, or withered; otherwise waterings + 1, water bonus + 0.25 capped at 1). */
  patch: BerryPatch;
}

/** The inputs one slice-88 bundle plus one berry-water reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterInputs {
  /** The slice-88 bundle's inputs, as slice 88 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantInputs;
  /** The berryWater section's inputs (patch). */
  berryWater: BerryWaterInputs;
}

/** One slice-88 bundle plus one berry-water reading, each exactly as its own read reports it, side by side, with no merged berry result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater {
  /** The slice-88 bundle, exactly as slice 88 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant;
  /** The watered patch, exactly as phase-4 garden reports it. */
  berryWater: BerryWaterReport;
}

/**
 * One slice-88 bundle plus one berry-water reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant bundle + one
 * berry water, each exactly as its own read reports it, side by side, with
 * no merged berry result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWater {
  const TAG = "garden-outing-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tick-plant-harv-place-remove-recomp-upgrade-empty-fresh-berrytick-berryplant-berrywater";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant inputs must be an object`);
  }
  if (inputs.berryWater === null || typeof inputs.berryWater !== "object" || Array.isArray(inputs.berryWater)) {
    throw new Error(`${TAG}: berryWater inputs must be an object`);
  }
  if (inputs.berryWater.patch === null || typeof inputs.berryWater.patch !== "object" || Array.isArray(inputs.berryWater.patch)) {
    throw new Error(`${TAG}: berryWater patch must be an object`);
  }
  if (typeof inputs.berryWater.patch.waterings !== "number" || Number.isNaN(inputs.berryWater.patch.waterings)) {
    throw new Error(`${TAG}: berryWater patch waterings must be a number`);
  }
  if (typeof inputs.berryWater.patch.waterBonus !== "number" || Number.isNaN(inputs.berryWater.patch.waterBonus)) {
    throw new Error(`${TAG}: berryWater patch waterBonus must be a number`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant,
  );
  const patch = berryWater(inputs.berryWater.patch);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlant,
    berryWater: {
      patch,
    },
  };
}
