// S14 slice 107 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway + ring capture + mochi link validation bundle (pure library) + one branch evolution, side by side.
// FILENAME NOTE: this file stem carries all sixty-one slice-106 abbreviations/shortenings and, in the stem only, shortens honour to hon and placements/placement to plac (both occurrences, new in this slice) and abbreviates branch evolution to brev (new in this slice): with those shortenings plus brev the module filename is 247 bytes and the test filename is 252 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-106 import path keeps slice 106's exact stem.
// The branch evolution section is NOT computed from the bundle's values. It reads only the caller-supplied creature and candidates, exactly as mochiichao-systems' branchEvolution reports them. The branch evolution section does NOT feed the bundle's sections: picking a candidate never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-reads a ring capture chance, never re-validates a mochi link, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, never evolves, reverts, trades, moves, or removes any creature, never changes any roster or any species, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied branch case is.
// The branch evolution rule is mochiichao-systems' own (branchEvolution): filter candidates by bond >= minBond, garden stat >= minStatValue when a stat floor is given, and careMistakes <= maxCareMistakes when a cap is given; return null when none is valid, otherwise the valid candidate with the highest minBond (ties shown upstream). It is a reported candidate only: it is NOT an evolution here, NOT a species change and NOT a type change to any record, and it does NOT revert, capture, trade, or hatch anything. This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any bundle value, does NOT change any bundle record's form, dominant stat, type, bonus, alignment, or colorway, does NOT re-read a ring capture chance, does NOT re-validate a mochi link, and does NOT compute a data revert. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a branch case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate,
} from "./gard-out-attr-spn-comp-str-arcs-lab-honor-reg-placem-cls-zone-hab-placem-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-berryp-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv";
import {
  branchEvolution,
  type EvolutionCandidate,
  type GardenCreature,
} from "./mochiichao-systems";

/** The branch evolution section's inputs: the caller-supplied creature and candidates. */
export interface BranchEvolutionInputs {
  /** The creature whose bond, stats, and care mistakes gate the candidates, exactly as mochiichao-systems' branchEvolution takes it. */
  creature: GardenCreature;
  /** The candidates, exactly as mochiichao-systems' branchEvolution takes them. */
  candidates: EvolutionCandidate[];
}

/** The branch evolution section's report: the candidate, exactly as branchEvolution reports it (null = none valid). */
export interface BranchEvolutionReport {
  /** branchEvolution applied to the caller-supplied creature and candidates. */
  candidate: EvolutionCandidate | null;
}

/** The inputs one slice-106 bundle plus one branch evolution is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionInputs {
  /** The slice-106 bundle's inputs, as slice 106 takes them. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateInputs;
  /** The branch evolution section's inputs. */
  branchEvolution: BranchEvolutionInputs;
}

/** One slice-106 bundle plus one branch evolution, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolution {
  /** The slice-106 bundle, exactly as slice 106 reports it. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate;
  /** The branch evolution, exactly as mochiichao-systems' branchEvolution reports it. */
  branchEvolution: BranchEvolutionReport;
}

/**
 * One slice-106 bundle plus one branch evolution, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolution(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolution {
  const TAG = "gard-out-attr-spn-comp-str-arcs-lab-hon-reg-plac-cls-zone-hab-plac-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-berryp-berryw-berryh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate === null ||
    typeof inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate !== "object" ||
    Array.isArray(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate)
  ) {
    throw new Error(`${TAG}: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate inputs must be an object`);
  }
  if (inputs.branchEvolution === null || typeof inputs.branchEvolution !== "object" || Array.isArray(inputs.branchEvolution)) {
    throw new Error(`${TAG}: branchEvolution inputs must be an object`);
  }
  const branch = inputs.branchEvolution;
  if (branch.creature === null || typeof branch.creature !== "object" || Array.isArray(branch.creature)) {
    throw new Error(`${TAG}: branchEvolution creature must be an object`);
  }
  if (typeof branch.creature.speciesId !== "string") {
    throw new Error(`${TAG}: branchEvolution creature speciesId must be a string`);
  }
  if (branch.creature.garden === null || typeof branch.creature.garden !== "object" || Array.isArray(branch.creature.garden)) {
    throw new Error(`${TAG}: branchEvolution creature garden must be an object`);
  }
  for (const key of ["dive", "glide", "sprint", "might", "endurance"] as const) {
    if (typeof branch.creature.garden[key] !== "number" || !Number.isFinite(branch.creature.garden[key])) {
      throw new Error(`${TAG}: branchEvolution creature garden ${key} must be a finite number`);
    }
  }
  for (const key of ["careScore", "bond", "careMistakes", "trainingSessions", "colorwaySeed"] as const) {
    if (typeof branch.creature[key] !== "number" || !Number.isFinite(branch.creature[key])) {
      throw new Error(`${TAG}: branchEvolution creature ${key} must be a finite number`);
    }
  }
  if (!Array.isArray(branch.creature.parts) || branch.creature.parts.some((p) => typeof p !== "string")) {
    throw new Error(`${TAG}: branchEvolution creature parts must be an array of strings`);
  }
  if (!Array.isArray(branch.candidates)) {
    throw new Error(`${TAG}: branchEvolution candidates must be an array`);
  }
  for (const cand of branch.candidates) {
    if (cand === null || typeof cand !== "object" || Array.isArray(cand)) {
      throw new Error(`${TAG}: branchEvolution candidate must be an object`);
    }
    if (typeof cand.targetSpeciesId !== "string") {
      throw new Error(`${TAG}: branchEvolution candidate targetSpeciesId must be a string`);
    }
    if (typeof cand.minBond !== "number" || !Number.isFinite(cand.minBond)) {
      throw new Error(`${TAG}: branchEvolution candidate minBond must be a finite number`);
    }
    if (cand.minStat !== undefined && typeof cand.minStat !== "string") {
      throw new Error(`${TAG}: branchEvolution candidate minStat must be a string`);
    }
    if (cand.minStatValue !== undefined && (typeof cand.minStatValue !== "number" || !Number.isFinite(cand.minStatValue))) {
      throw new Error(`${TAG}: branchEvolution candidate minStatValue must be a finite number`);
    }
    if (cand.maxCareMistakes !== undefined && (typeof cand.maxCareMistakes !== "number" || !Number.isFinite(cand.maxCareMistakes))) {
      throw new Error(`${TAG}: branchEvolution candidate maxCareMistakes must be a finite number`);
    }
  }
  const bundle = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate(
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate,
  );
  return {
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidate: bundle,
    branchEvolution: {
      candidate: branchEvolution(
        branch.creature,
        branch.candidates,
      ),
    },
  };
}
