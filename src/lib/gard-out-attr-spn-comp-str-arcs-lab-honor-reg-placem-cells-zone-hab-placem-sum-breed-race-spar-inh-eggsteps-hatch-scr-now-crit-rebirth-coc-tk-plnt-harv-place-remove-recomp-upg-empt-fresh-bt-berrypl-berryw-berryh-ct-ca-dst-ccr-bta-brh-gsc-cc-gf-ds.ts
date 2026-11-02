// S14 slice 100 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form bundle (pure library) + one dominant stat, side by side.
// FILENAME NOTE: this file stem carries all forty-four slice-99 abbreviations/shortenings and, in the stem only, shortens empty to empt (new in this slice) and abbreviates dominant stat to ds (new in this slice): without the empt shortening plus ds the test filename would exceed the 255-byte ceiling; with them the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-99 import path keeps slice 99's exact stem.
// The dominantStat section is NOT computed from the bundle's values. It reads only the caller-supplied GardenStats, exactly as mochiichao-systems' dominantStat reports it. The dominant-stat section does NOT feed the bundle's sections: reading a dominant stat never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a value, never re-reads a garden form, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, and never writes anything back into any record, care record, or bundle patch. The bundle's own garden records are never re-read here: only the caller-supplied dominantStat garden is.
// The dominant-stat rule is mochiichao-systems' own (dominantStat): the GardenStats key with the highest value — dive, glide, sprint, might, or endurance — with the first key in GardenStats order winning a tie (dive before glide before sprint before might before endurance), exactly as Object.entries + reduce reports it. It is a display read for type-variant and drift display, NOT a species change and NOT a type change. This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any value, does NOT change any bundle record's form or dominant stat, and does NOT compute a type variant. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a dominantStat case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm,
} from "./gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inh-eggsteps-hatch-scr-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upg-empty-fresh-bt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf";
import {
  dominantStat,
  type GardenStats,
} from "./mochiichao-systems";

/** The dominantStat section's inputs: the caller-supplied GardenStats to read. */
export interface DominantStatInputs {
  /** GardenStats to read, exactly as mochiichao-systems' dominantStat reports it. */
  garden: GardenStats;
}

/** The dominantStat section's report: the dominant key, exactly as dominantStat reports it. */
export interface DominantStatReport {
  /** dominantStat applied to the caller-supplied GardenStats. */
  dominant: keyof GardenStats;
}

/** The inputs one slice-99 bundle plus one dominant stat is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatInputs {
  /** The slice-99 bundle's inputs, as slice 99 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormInputs;
  /** The dominantStat section's inputs. */
  dominantStat: DominantStatInputs;
}

/** One slice-99 bundle plus one dominant stat, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStat {
  /** The slice-99 bundle, exactly as slice 99 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm;
  /** The dominant stat, exactly as mochiichao-systems' dominantStat reports it. */
  dominantStat: DominantStatReport;
}

/**
 * One slice-99 bundle plus one dominant stat:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water-berry-harvest-companion-tick-companion-apply-daycare-step-tick-companion-can-rebirth-berry-tick-all-berry-ready-to-harvest-phase-4-garden-self-check-clamp-care-garden-form bundle + one
 * dominant stat, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStat(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStat {
  const TAG = "gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inh-eggsteps-hatch-scr-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upg-empt-fresh-bt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm inputs must be an object`);
  }
  if (inputs.dominantStat === null || typeof inputs.dominantStat !== "object" || Array.isArray(inputs.dominantStat)) {
    throw new Error(`${TAG}: dominantStat inputs must be an object`);
  }
  if (inputs.dominantStat.garden === null || typeof inputs.dominantStat.garden !== "object" || Array.isArray(inputs.dominantStat.garden)) {
    throw new Error(`${TAG}: dominantStat garden must be an object`);
  }
  for (const key of ["dive", "glide", "sprint", "might", "endurance"] as const) {
    const v = inputs.dominantStat.garden[key];
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new Error(`${TAG}: dominantStat garden ${key} must be a finite number`);
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenForm,
    dominantStat: {
      dominant: dominantStat(inputs.dominantStat.garden),
    },
  };
}
