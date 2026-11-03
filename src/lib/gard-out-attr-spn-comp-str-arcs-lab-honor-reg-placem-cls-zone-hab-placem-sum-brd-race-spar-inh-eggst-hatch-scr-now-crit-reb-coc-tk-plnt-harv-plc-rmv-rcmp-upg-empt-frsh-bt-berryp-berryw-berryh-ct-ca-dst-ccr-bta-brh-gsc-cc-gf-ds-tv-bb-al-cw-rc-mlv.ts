// S14 slice 106 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway + ring capture bundle (pure library) + one mochi link validation, side by side.
// FILENAME NOTE: this file stem carries all fifty-seven slice-105 abbreviations/shortenings and, in the stem only, shortens breeding to brd, fresh to frsh, and berry-stage to berryp (new in this slice) and abbreviates mochi link validation to mlv (new in this slice): with those shortenings plus mlv the module filename is 248 bytes and the test filename is 253 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-105 import path keeps slice 105's exact stem.
// The mochi link section is NOT computed from the bundle's values. It reads only the caller-supplied offered species ids, receiver roster ids, and offered id, exactly as mochiichao-systems' mochiLinkValidate reports them. The mochi link section does NOT feed the bundle's sections: validating a link never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-reads a ring capture chance, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, never trades, moves, or removes any creature, never changes any roster, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied link case is.
// The mochi link rule is mochiichao-systems' own (mochiLinkValidate): errors = []; if either offered species id is empty, push "Both sides must offer a creature."; if the receiver roster already includes the offered id, push "Receiver already owns that creature ID."; return errors, empty = valid. It is a reported validation only: it is NOT a trade here, NOT a roster change, NOT a species change and NOT a type change to any record, and it does NOT capture, evolve, or revert anything. This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any bundle value, does NOT change any bundle record's form, dominant stat, type, bonus, alignment, or colorway, does NOT re-read a ring capture chance, and does NOT compute a branch evolution or a data revert. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a mochi link case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture,
} from "./gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cls-zone-hab-placem-sum-breed-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-fresh-bt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc";
import {
  mochiLinkValidate,
} from "./mochiichao-systems";

/** The mochi link section's inputs: the caller-supplied link case. */
export interface MochiLinkInputs {
  /** First side's offered species id, exactly as mochiichao-systems' mochiLinkValidate takes it. */
  aSpeciesId: string;
  /** Second side's offered species id, exactly as mochiichao-systems' mochiLinkValidate takes it. */
  bSpeciesId: string;
  /** Receiver's roster ids, exactly as mochiichao-systems' mochiLinkValidate takes them. */
  receiverRosterIds: string[];
  /** Offered creature id, exactly as mochiichao-systems' mochiLinkValidate takes it. */
  offeredId: string;
}

/** The mochi link section's report: the errors, exactly as mochiLinkValidate reports them (empty = valid). */
export interface MochiLinkReport {
  /** mochiLinkValidate applied to the caller-supplied link case. */
  errors: string[];
}

/** The inputs one slice-105 bundle plus one mochi link validation is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateInputs {
  /** The slice-105 bundle's inputs, as slice 105 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureInputs;
  /** The mochi link section's inputs. */
  mochiLink: MochiLinkInputs;
}

/** One slice-105 bundle plus one mochi link validation, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate {
  /** The slice-105 bundle, exactly as slice 105 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture;
  /** The mochi link validation, exactly as mochiichao-systems' mochiLinkValidate reports it. */
  mochiLink: MochiLinkReport;
}

/**
 * One slice-105 bundle plus one mochi link validation, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate {
  const TAG = "gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cls-zone-hab-placem-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-berryp-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture inputs must be an object`);
  }
  if (inputs.mochiLink === null || typeof inputs.mochiLink !== "object" || Array.isArray(inputs.mochiLink)) {
    throw new Error(`${TAG}: mochiLink inputs must be an object`);
  }
  for (const key of ["aSpeciesId", "bSpeciesId", "offeredId"] as const) {
    if (typeof inputs.mochiLink[key] !== "string") {
      throw new Error(`${TAG}: mochiLink ${key} must be a string`);
    }
  }
  if (!Array.isArray(inputs.mochiLink.receiverRosterIds) || inputs.mochiLink.receiverRosterIds.some((id) => typeof id !== "string")) {
    throw new Error(`${TAG}: mochiLink receiverRosterIds must be an array of strings`);
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture,
    mochiLink: {
      errors: mochiLinkValidate(
        inputs.mochiLink.aSpeciesId,
        inputs.mochiLink.bSpeciesId,
        inputs.mochiLink.receiverRosterIds,
        inputs.mochiLink.offeredId,
      ),
    },
  };
}
