// S14 slice 105 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway bundle (pure library) + one ring capture chance, side by side.
// FILENAME NOTE: this file stem carries all fifty-five slice-104 abbreviations/shortenings and, in the stem only, shortens eggsteps to eggst (new in this slice) and abbreviates ring capture to rc (new in this slice): with the eggst shortening plus rc the module filename is 248 bytes and the test filename is 253 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-104 import path keeps slice 104's exact stem.
// The ring capture section is NOT computed from the bundle's values. It reads only the caller-supplied loops, breaks, bond, and catch-rate shape, exactly as mochiichao-systems' ringCaptureChance reports it. The ring capture section does NOT feed the bundle's sections: reading a ring capture chance never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied ring capture numbers are.
// The ring capture rule is mochiichao-systems' own (ringCaptureChance): base = loops * 10 - breaks * 15 + bond * 0.3; rate = clamp(catchRateShape, 3, 255) / 255; return clamp(base * rate / 100, 0, 0.95). It is a reported chance only: it is NOT applied to any capture here, NOT a species change and NOT a type change to any record, and it does NOT capture, trade, evolve, or revert anything. This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any bundle value, does NOT change any bundle record's form, dominant stat, type, bonus, alignment, or colorway, and does NOT compute a link validation, a branch evolution, or a data revert. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a ring capture case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway,
} from "./gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cls-zone-hab-placem-sum-breed-race-spar-inh-eggsteps-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-fresh-bt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw";
import {
  ringCaptureChance,
} from "./mochiichao-systems";

/** The ring capture section's inputs: the caller-supplied ring capture numbers. */
export interface RingCaptureInputs {
  /** Loops drawn, exactly as mochiichao-systems' ringCaptureChance takes them. */
  loops: number;
  /** Breaks, exactly as mochiichao-systems' ringCaptureChance takes them. */
  breaks: number;
  /** Bond, exactly as mochiichao-systems' ringCaptureChance takes it. */
  bond: number;
  /** Catch-rate shape (3-255, clamped by the source), exactly as mochiichao-systems' ringCaptureChance takes it. */
  catchRateShape: number;
}

/** The ring capture section's report: the chance, exactly as ringCaptureChance reports it. */
export interface RingCaptureReport {
  /** ringCaptureChance applied to the caller-supplied numbers. */
  ringCaptureChance: number;
}

/** The inputs one slice-104 bundle plus one ring capture chance is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureInputs {
  /** The slice-104 bundle's inputs, as slice 104 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayInputs;
  /** The ring capture section's inputs. */
  ringCapture: RingCaptureInputs;
}

/** One slice-104 bundle plus one ring capture chance, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture {
  /** The slice-104 bundle, exactly as slice 104 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway;
  /** The ring capture chance, exactly as mochiichao-systems' ringCaptureChance reports it. */
  ringCapture: RingCaptureReport;
}

/**
 * One slice-104 bundle plus one ring capture chance:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water-berry-harvest-companion-tick-companion-apply-daycare-step-tick-companion-can-rebirth-berry-tick-all-berry-ready-to-harvest-phase-4-garden-self-check-clamp-care-garden-form-dominant-stat-type-variant-garden-battle-bonus-alignment-colorway bundle + one
 * ring capture chance, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCapture {
  const TAG = "gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cls-zone-hab-placem-sum-breed-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-fresh-bt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway inputs must be an object`);
  }
  if (inputs.ringCapture === null || typeof inputs.ringCapture !== "object" || Array.isArray(inputs.ringCapture)) {
    throw new Error(`${TAG}: ringCapture inputs must be an object`);
  }
  for (const key of ["loops", "breaks", "bond", "catchRateShape"] as const) {
    if (typeof inputs.ringCapture[key] !== "number" || !Number.isFinite(inputs.ringCapture[key])) {
      throw new Error(`${TAG}: ringCapture ${key} must be a finite number`);
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorway,
    ringCapture: {
      ringCaptureChance: ringCaptureChance(
        inputs.ringCapture.loops,
        inputs.ringCapture.breaks,
        inputs.ringCapture.bond,
        inputs.ringCapture.catchRateShape,
      ),
    },
  };
}
