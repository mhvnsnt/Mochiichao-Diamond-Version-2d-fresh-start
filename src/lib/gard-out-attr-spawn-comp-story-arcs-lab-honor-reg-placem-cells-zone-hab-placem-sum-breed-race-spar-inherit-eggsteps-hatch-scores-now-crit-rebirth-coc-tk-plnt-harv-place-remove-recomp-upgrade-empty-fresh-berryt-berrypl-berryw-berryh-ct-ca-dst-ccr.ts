// S14 slice 94 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick bundle (pure library) + one phase-4 companion-can-rebirth reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND abbreviates, in the stem only, placement to placem, summary to summ, breeding to breed, and habitat to hab (all four carried from slice 88, with summary then shortened, in the stem only, to sum in slice 93 and carried here), AND abbreviates, in the stem only, labour to lab, critter to crit, cocoon to coc, and harvest to harv (all four carried from slice 89), AND abbreviates, in the stem only, garden to gard and outing to out (both carried from slice 90), AND shortens, in the stem only, berrytick to berryt, berryplant to berrypl, berrywater to berryw, and berryharvest to berryh (all four carried from slice 91), AND abbreviates companion tick to comptick (carried from slice 91) and then shortens it, in the stem only, to compt (carried from slice 92) and then to ct (new in this slice), AND shortens, in the stem only, the standalone garden-tick segment tick to tk and plant to plnt (both carried from slice 92), AND abbreviates companion apply to compapp (carried from slice 92) and then shortens it, in the stem only, to capp (carried from slice 93) and then to ca (new in this slice), AND abbreviates daycare step tick to dst (carried from slice 93), AND abbreviates companion can rebirth to ccr (new in this slice): without the two new shortenings plus ccr the test filename would exceed the 255-byte ceiling; with them the module filename is 248 bytes and the test filename is 253 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-93 import path keeps slice 93's exact stem.
// The companionCanRebirth section is NOT computed from the bundle's values. The caller supplies the care record explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, berry-stage section, berry-tick section, berry-plant section, berry-water section, berry-harvest section, companion-tick section, companion-apply section, or daycare-step-tick section. The companionCanRebirth section does NOT feed the bundle's sections: checking rebirth eligibility never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a patch, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, and never writes anything back into any record, care record, or bundle patch.
// The companion-can-rebirth rule is phase-4 garden's own (companionCanRebirth): a companion may rebirth exactly when affection is at least 80 AND energy is at least 30. This slice does NOT rebirth anything, does NOT tick companion care, does NOT apply a care effect, and does NOT step a daycare countdown. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a companionCanRebirth case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick,
} from "./gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upgrade-empty-fresh-berryt-berrypl-berryw-berryh-compt-capp-dst";
import {
  companionCanRebirth,
  type CompanionCare,
} from "./wiring/phase4-garden";

/** The companionCanRebirth section's inputs: a caller-supplied care record. */
export interface CompanionCanRebirthInputs {
  /** The care record to check, as the caller supplies it. */
  care: CompanionCare;
}

/** The companionCanRebirth section's report: whether the companion may rebirth, exactly as phase-4 garden reports it. */
export interface CompanionCanRebirthReport {
  /** Whether the companion may rebirth. */
  canRebirth: boolean;
}

/** The inputs one slice-93 bundle plus one companion-can-rebirth reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthInputs {
  /** The slice-93 bundle's inputs, as slice 93 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickInputs;
  /** The companionCanRebirth section's inputs (a care record). */
  companionCanRebirth: CompanionCanRebirthInputs;
}

/** One slice-93 bundle plus one companion-can-rebirth reading, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth {
  /** The slice-93 bundle, exactly as slice 93 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick;
  /** Whether the companion may rebirth, exactly as phase-4 garden reports it. */
  companionCanRebirth: CompanionCanRebirthReport;
}

/**
 * One slice-93 bundle plus one companion-can-rebirth reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water-berry-harvest-companion-tick-companion-apply-daycare-step-tick bundle + one
 * companion can rebirth, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth {
  const TAG = "gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upgrade-empty-fresh-berryt-berrypl-berryw-berryh-ct-ca-dst-ccr";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick inputs must be an object`);
  }
  if (inputs.companionCanRebirth === null || typeof inputs.companionCanRebirth !== "object" || Array.isArray(inputs.companionCanRebirth)) {
    throw new Error(`${TAG}: companionCanRebirth inputs must be an object`);
  }
  if (inputs.companionCanRebirth.care === null || typeof inputs.companionCanRebirth.care !== "object" || Array.isArray(inputs.companionCanRebirth.care)) {
    throw new Error(`${TAG}: companionCanRebirth care must be an object`);
  }
  for (const key of ["hunger", "mood", "energy", "affection"] as const) {
    if (typeof inputs.companionCanRebirth.care[key] !== "number" || Number.isNaN(inputs.companionCanRebirth.care[key])) {
      throw new Error(`${TAG}: companionCanRebirth care ${key} must be a number`);
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick,
  );
  const canRebirth = companionCanRebirth(inputs.companionCanRebirth.care);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTick,
    companionCanRebirth: {
      canRebirth,
    },
  };
}
