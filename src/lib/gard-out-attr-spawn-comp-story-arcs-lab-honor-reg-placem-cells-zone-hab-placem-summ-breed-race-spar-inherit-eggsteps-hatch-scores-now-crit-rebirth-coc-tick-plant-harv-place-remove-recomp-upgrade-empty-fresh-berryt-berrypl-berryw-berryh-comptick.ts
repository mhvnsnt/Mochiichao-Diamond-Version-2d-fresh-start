// S14 slice 91 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest bundle (pure library) + one phase-4 companion-tick reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND abbreviates, in the stem only, placement to placem, summary to summ, breeding to breed, and habitat to hab (all four carried from slice 88), AND abbreviates, in the stem only, labour to lab, critter to crit, cocoon to coc, and harvest to harv (all four carried from slice 89), AND abbreviates, in the stem only, garden to gard, outing to out (both carried from slice 90), AND shortens, in the stem only, berrytick to berryt, berryplant to berrypl, berrywater to berryw, and berryharvest to berryh (all four new in this slice, replacing slice 90's berrytick/berryplant/berrywat/berryharv spellings), AND abbreviates companion tick to comptick (new in this slice): without the four shortenings plus comptick the test filename would exceed the 255-byte ceiling; with them the module filename is 247 bytes and the test filename is 252 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-90 import path keeps slice 90's exact stem.
// The companionTick section is NOT computed from the bundle's values. The caller supplies the care record and the garden hours explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, berry-stage section, berry-tick section, berry-plant section, berry-water section, or berry-harvest section. The companionTick section does NOT feed the bundle's sections: ticking companion care never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a patch, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, and never writes anything back into any record, care record, or bundle patch.
// The companion-tick rule is phase-4 garden's own (companionTick): hunger rises 8 per garden hour, energy falls 6 per garden hour, mood drifts toward 50 by 2 percent per garden hour, affection is unchanged, every value clamped to 0..100. This slice does NOT apply a care effect (companionApply is a separate phase-4 read, not composed here), does NOT tick daycare steps, and does NOT build any care state beyond returning companionTick's care record. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a companionTick case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest,
} from "./gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tick-plant-harv-place-remove-recomp-upgrade-empty-fresh-berrytick-berryplant-berrywat-berryharv";
import {
  companionTick,
  type CompanionCare,
} from "./wiring/phase4-garden";

/** The companionTick section's inputs: a caller-supplied care record and garden hours. */
export interface CompanionTickInputs {
  /** The care record to tick, as the caller supplies it. */
  care: CompanionCare;
  /** Garden hours elapsed. */
  gardenHours: number;
}

/** The companionTick section's report: the care record after the tick, exactly as phase-4 garden reports it. */
export interface CompanionTickReport {
  /** The care record after the tick. */
  care: CompanionCare;
}

/** The inputs one slice-90 bundle plus one companion-tick reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickInputs {
  /** The slice-90 bundle's inputs, as slice 90 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestInputs;
  /** The companionTick section's inputs (care + garden hours). */
  companionTick: CompanionTickInputs;
}

/** One slice-90 bundle plus one companion-tick reading, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTick {
  /** The slice-90 bundle, exactly as slice 90 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest;
  /** The care record after the tick, exactly as phase-4 garden reports it. */
  companionTick: CompanionTickReport;
}

/**
 * One slice-90 bundle plus one companion-tick reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water-berry-harvest bundle + one
 * companion tick, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTick(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTick {
  const TAG = "gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-summ-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tick-plant-harv-place-remove-recomp-upgrade-empty-fresh-berryt-berrypl-berryw-berryh-comptick";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest inputs must be an object`);
  }
  if (inputs.companionTick === null || typeof inputs.companionTick !== "object" || Array.isArray(inputs.companionTick)) {
    throw new Error(`${TAG}: companionTick inputs must be an object`);
  }
  if (inputs.companionTick.care === null || typeof inputs.companionTick.care !== "object" || Array.isArray(inputs.companionTick.care)) {
    throw new Error(`${TAG}: companionTick care must be an object`);
  }
  for (const key of ["hunger", "mood", "energy", "affection"] as const) {
    if (typeof inputs.companionTick.care[key] !== "number" || Number.isNaN(inputs.companionTick.care[key])) {
      throw new Error(`${TAG}: companionTick care ${key} must be a number`);
    }
  }
  if (typeof inputs.companionTick.gardenHours !== "number" || Number.isNaN(inputs.companionTick.gardenHours)) {
    throw new Error(`${TAG}: companionTick gardenHours must be a number`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest,
  );
  const ticked = companionTick(inputs.companionTick.care, inputs.companionTick.gardenHours);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvest,
    companionTick: {
      care: ticked,
    },
  };
}
