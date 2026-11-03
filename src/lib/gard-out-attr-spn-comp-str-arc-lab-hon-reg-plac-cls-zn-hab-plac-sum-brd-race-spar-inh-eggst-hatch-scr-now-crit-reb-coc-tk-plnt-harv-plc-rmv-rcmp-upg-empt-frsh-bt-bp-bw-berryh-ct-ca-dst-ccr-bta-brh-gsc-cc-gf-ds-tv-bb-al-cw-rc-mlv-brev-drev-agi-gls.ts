// S14 slice 110 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway + ring capture + mochi link validation + branch evolution + data revert + apply garden item bundle (pure library) + one garden level summary, side by side.
// FILENAME NOTE: this file stem carries all sixty-nine slice-109 abbreviations/shortenings and, in the stem only, shortens berry-water (berryw) to bw (new in this slice, the one further shortening the ceiling required) and abbreviates garden level summary to gls (new in this slice): with those the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-109 import path keeps slice 109's exact stem.
// The garden level summary section is NOT computed from the bundle's values. It reads only the caller-supplied comforts, tiers, tier scale, weights, and bands, exactly as garden-level's gardenLevelSummary reports it. The level section does NOT feed the bundle's sections: reporting a level summary never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a bundle value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-reads a ring capture chance, never re-validates a mochi link, never re-picks a branch evolution candidate, never reverts a creature, never re-applies a garden item, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, never evolves, trades, moves, or removes any creature, never changes any roster or any species, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied level case is.
// The garden level summary rule is garden-level's own (gardenLevelSummary): mean comfort and mean tier (tier rescaled to 0..100 via the caller-supplied tierMax), weighted aggregate (each side alone when only it exists, null when neither exists), and the highest caller-supplied band whose min the aggregate reaches (null with no bands or below the first band). NO band, threshold, or unlock is authored here: bands, tierMax, and weights are caller-supplied, exactly as garden-level takes them. It is a reported summary only: it is NOT a level awarded to any record here, NOT a plot/kit/feature unlock, and it does NOT compute comfort itself (comforts arrive as caller-supplied W5 numbers) and does NOT solve any habitat (tiers arrive as caller-supplied solver tiers). This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect to a record, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any bundle value, does NOT change any bundle record's form, dominant stat, type, bonus, alignment, or colorway, does NOT re-read a ring capture chance, does NOT re-validate a mochi link, does NOT re-pick a branch evolution candidate, does NOT revert a creature, does NOT apply a garden item, and does NOT compute a breeding egg (createBreedingEgg stays out while the species question is HELD per garden-wiring's own comment). No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a level case.
// NEW-READ NOTE (this run, stated plainly): gardenLevelSummary is verified new to this bundle chain this run: no gard- module imports it (grep over gard-*.ts, non-test files, 0 hits), and the slice-109 bundle's chain names no level section. garden-comfort's comfort term is NOT composed here (its comforts are inputs, not computed), and garden-outing-level's separate outing chain is NOT imported here.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem,
} from "./gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev-drev-agi";
import {
  gardenLevelSummary,
  type GardenLevelBand,
  type GardenLevelInput,
  type GardenLevelSummary,
} from "./garden-level";

/** The garden level summary section's inputs: exactly garden-level's GardenLevelInput. */
export type GardenLevelSummaryInputs = GardenLevelInput;

/** The garden level summary section's report: the summary, exactly as gardenLevelSummary reports it. */
export interface GardenLevelSummaryReport {
  /** gardenLevelSummary applied to the caller-supplied level case. */
  summary: GardenLevelSummary;
}

/** The inputs one slice-109 bundle plus one garden level summary is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryInputs {
  /** The slice-109 bundle's inputs, as slice 109 takes them. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemInputs;
  /** The garden level summary section's inputs. */
  gardenLevelSummary: GardenLevelSummaryInputs;
}

/** One slice-109 bundle plus one garden level summary, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummary {
  /** The slice-109 bundle, exactly as slice 109 reports it. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem;
  /** The garden level summary, exactly as garden-level's gardenLevelSummary reports it. */
  gardenLevelSummary: GardenLevelSummaryReport;
}

/**
 * One slice-109 bundle plus one garden level summary, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummary(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummary {
  const TAG = "gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-bw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev-drev-agi-gls";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem === null ||
    typeof inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem !== "object" ||
    Array.isArray(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem)
  ) {
    throw new Error(`${TAG}: gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem inputs must be an object`);
  }
  if (inputs.gardenLevelSummary === null || typeof inputs.gardenLevelSummary !== "object" || Array.isArray(inputs.gardenLevelSummary)) {
    throw new Error(`${TAG}: gardenLevelSummary inputs must be an object`);
  }
  const level = inputs.gardenLevelSummary;
  if (!Array.isArray(level.comforts)) {
    throw new Error(`${TAG}: gardenLevelSummary comforts must be an array`);
  }
  for (const c of level.comforts) {
    if (typeof c !== "number" || !Number.isFinite(c) || c < 0 || c > 100) {
      throw new Error(`${TAG}: gardenLevelSummary every comfort must be a finite number within 0..100`);
    }
  }
  if (!Array.isArray(level.tiers)) {
    throw new Error(`${TAG}: gardenLevelSummary tiers must be an array`);
  }
  for (const t of level.tiers) {
    if (typeof t !== "number" || !Number.isInteger(t) || t < 0) {
      throw new Error(`${TAG}: gardenLevelSummary every tier must be an integer >= 0`);
    }
  }
  if (level.tiers.length > 0) {
    if (typeof level.tierMax !== "number" || !Number.isFinite(level.tierMax) || level.tierMax <= 0) {
      throw new Error(`${TAG}: gardenLevelSummary tierMax (a finite number > 0) is required whenever tiers are supplied`);
    }
    const meanTier = level.tiers.reduce((a, b) => a + b, 0) / level.tiers.length;
    if (meanTier > level.tierMax) {
      throw new Error(`${TAG}: gardenLevelSummary mean tier exceeds tierMax`);
    }
  } else if (level.tierMax !== undefined && (typeof level.tierMax !== "number" || !Number.isFinite(level.tierMax) || level.tierMax <= 0)) {
    throw new Error(`${TAG}: gardenLevelSummary tierMax must be a finite number > 0`);
  }
  for (const [name, w] of [["comfortWeight", level.comfortWeight], ["tierWeight", level.tierWeight]] as const) {
    if (w !== undefined && (typeof w !== "number" || !Number.isFinite(w) || w < 0)) {
      throw new Error(`${TAG}: gardenLevelSummary ${name} must be a finite number >= 0`);
    }
  }
  if (level.comforts.length > 0 && level.tiers.length > 0 && (level.comfortWeight ?? 1) === 0 && (level.tierWeight ?? 1) === 0) {
    throw new Error(`${TAG}: gardenLevelSummary comfortWeight and tierWeight cannot both be 0 when both sides exist`);
  }
  if (level.bands !== undefined) {
    if (!Array.isArray(level.bands)) {
      throw new Error(`${TAG}: gardenLevelSummary bands must be an array`);
    }
    let prevMin = -Infinity;
    let prevLevel = -Infinity;
    for (const b of level.bands as GardenLevelBand[]) {
      if (
        b === null || typeof b !== "object" || Array.isArray(b) ||
        typeof b.level !== "number" || !Number.isInteger(b.level) ||
        typeof b.min !== "number" || !Number.isFinite(b.min) || b.min < 0 || b.min > 100
      ) {
        throw new Error(`${TAG}: gardenLevelSummary every band needs an integer level and a min within 0..100`);
      }
      if (b.min <= prevMin || b.level <= prevLevel) {
        throw new Error(`${TAG}: gardenLevelSummary bands must ascend strictly by both min and level`);
      }
      prevMin = b.min;
      prevLevel = b.level;
    }
  }
  const bundle = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem(
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem,
  );
  return {
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItem: bundle,
    gardenLevelSummary: {
      summary: gardenLevelSummary(
        level,
      ),
    },
  };
}
