// S14 slice 112 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway + ring capture + mochi link validation + branch evolution + data revert + apply garden item + garden level summary + level for aggregate bundle (pure library) + one comfort after day, side by side.
// FILENAME NOTE: this file stem carries all seventy-three slice-111 abbreviations/shortenings and, in the stem only, shortens eggsteps (eggst) to eg and cocoon (coc) to co (new in this slice, the further shortenings the ceiling required) and abbreviates comfort after day to cad (new in this slice): with those the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-111 import path keeps slice 111's exact stem.
// The comfort after day section is NOT computed from the bundle's values. It reads only the caller-supplied comfort, habitats, needs, rates, classes function, and factors, exactly as garden-comfort's comfortAfterDay reports it. The comfort section does NOT feed the bundle's sections: reporting a comfort day never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a bundle value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-reads a ring capture chance, never re-validates a mochi link, never re-picks a branch evolution candidate, never reverts a creature, never re-applies a garden item, never re-reads a garden level summary, never re-reads a level for aggregate, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, never evolves, trades, moves, or removes any creature, never changes any roster or any species, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied comfort case is.
// The comfort after day rule is garden-comfort's own (comfortAfterDay): needs are satisfied only by recognised habitats present (place, never chores, by recipe id or by a class the habitat realises); the raw term is the sum of gains for satisfied needs minus the sum of losses for unsatisfied needs, scaled by the caller-supplied context and personality factors (both default 1); the result is clamped at 0 and 100 only, never floored at neutral, so unmet needs can push comfort below neutral. NO need, recipe, class, rate, or factor is authored here: all are caller-supplied, exactly as garden-comfort takes them. It is a reported comfort day only: it is NOT a comfort applied to any record here, NOT a habitat solve (habitats arrive as caller-supplied solved habitats), and it does NOT compute a multi-day trace (comfortAfterDays is a separate read, not composed here). This slice does NOT tick, plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect to a record, does NOT step a daycare countdown, does NOT check rebirth eligibility, does NOT clamp any bundle value, does NOT change any bundle record's form, dominant stat, type, bonus, alignment, or colorway, does NOT re-read a ring capture chance, does NOT re-validate a mochi link, does NOT re-pick a branch evolution candidate, does NOT revert a creature, does NOT apply a garden item, does NOT re-read a garden level summary, does NOT re-read a level for aggregate, and does NOT compute a breeding egg (createBreedingEgg stays out while the species question is HELD per garden-wiring's own comment). No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a comfort-after-day case.
// NEW-READ NOTE (this run, stated plainly): comfortAfterDay is verified new to this bundle chain this run: no gard- module imports it (grep over gard-*.ts, non-test files, 0 hits for comfortAfterDay and for needsSatisfied), and the slice-111 bundle's chain names no comfort section. Slice 110's garden level summary took comforts as caller-supplied W5 numbers; this slice composes the W5 computation itself, from garden-comfort (its own slice-5 module: DQB2 W5 comfort + needs daily term), side by side with the bundle — the comfort section is NOT fed by the bundle's values and does NOT feed the bundle's level summary. garden-outing-level's separate outing chain is NOT imported here.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate,
} from "./gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eggst-hatch-scr-now-crit-reb-coc-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-bw-bh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev-drev-agi-gls-lfa";
import {
  comfortAfterDay,
  type GardenNeedDef,
  type GardenNeedRate,
} from "./garden-comfort";
import type { SolvedHabitat } from "./garden-habitats";
import type { ClassesForRecipe } from "./garden-attraction";

/** The comfort after day section's inputs: exactly comfortAfterDay's parameters, as one object. */
export interface ComfortAfterDayInputs {
  /** Starting comfort, 0..100, as garden-comfort takes it. */
  comfort: number;
  /** Recognised habitats present (solved habitats, or null entries), as garden-comfort takes them. */
  habitats: readonly (SolvedHabitat | null)[];
  /** Caller-supplied needs, as garden-comfort takes them. */
  needs: readonly GardenNeedDef[];
  /** Per-need daily rates, keyed by need id, as garden-comfort takes them. */
  rates: Readonly<Record<string, GardenNeedRate>>;
  /** Classes realised by a recipe id, as garden-comfort takes it. */
  classesForRecipe: ClassesForRecipe;
  /** Caller-supplied context factor (default 1), as garden-comfort takes it. */
  contextFactor?: number;
  /** Caller-supplied personality factor (default 1), as garden-comfort takes it. */
  personalityFactor?: number;
}

/** The comfort after day section's report: the day's comfort, exactly as garden-comfort reports it. */
export interface ComfortAfterDayReport {
  /** Comfort after the day, clamped 0..100 only, never floored at neutral. */
  comfort: number;
  /** Signed change this day (after both factors). */
  delta: number;
  /** Need ids satisfied by the recognised habitats present. */
  satisfied: string[];
  /** Need ids left unmet. */
  unsatisfied: string[];
}

/** The inputs one slice-111 bundle plus one comfort after day is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayInputs {
  /** The slice-111 bundle's inputs, as slice 111 takes them. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateInputs;
  /** The comfort after day section's inputs. */
  comfortAfterDay: ComfortAfterDayInputs;
}

/** One slice-111 bundle plus one comfort after day, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay {
  /** The slice-111 bundle, exactly as slice 111 reports it. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate;
  /** The comfort after day, exactly as garden-comfort's comfortAfterDay reports it. */
  comfortAfterDay: ComfortAfterDayReport;
}

/**
 * One slice-111 bundle plus one comfort after day, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay {
  const TAG = "gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eg-hatch-scr-now-crit-reb-co-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-bw-bh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev-drev-agi-gls-lfa-cad";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate === null ||
    typeof inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate !== "object" ||
    Array.isArray(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate)
  ) {
    throw new Error(`${TAG}: gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate inputs must be an object`);
  }
  if (inputs.comfortAfterDay === null || typeof inputs.comfortAfterDay !== "object" || Array.isArray(inputs.comfortAfterDay)) {
    throw new Error(`${TAG}: comfortAfterDay inputs must be an object`);
  }
  const cad = inputs.comfortAfterDay;
  if (typeof cad.comfort !== "number" || !Number.isFinite(cad.comfort) || cad.comfort < 0 || cad.comfort > 100) {
    throw new Error(`${TAG}: comfortAfterDay comfort must be a finite number within 0..100`);
  }
  if (!Array.isArray(cad.habitats)) {
    throw new Error(`${TAG}: comfortAfterDay habitats must be an array`);
  }
  if (!Array.isArray(cad.needs)) {
    throw new Error(`${TAG}: comfortAfterDay needs must be an array`);
  }
  if (cad.rates === null || typeof cad.rates !== "object" || Array.isArray(cad.rates)) {
    throw new Error(`${TAG}: comfortAfterDay rates must be an object`);
  }
  if (typeof cad.classesForRecipe !== "function") {
    throw new Error(`${TAG}: comfortAfterDay classesForRecipe must be a function`);
  }
  if (cad.contextFactor !== undefined && (typeof cad.contextFactor !== "number" || !Number.isFinite(cad.contextFactor) || cad.contextFactor < 0)) {
    throw new Error(`${TAG}: comfortAfterDay contextFactor must be a finite number >= 0`);
  }
  if (cad.personalityFactor !== undefined && (typeof cad.personalityFactor !== "number" || !Number.isFinite(cad.personalityFactor) || cad.personalityFactor < 0)) {
    throw new Error(`${TAG}: comfortAfterDay personalityFactor must be a finite number >= 0`);
  }
  const bundle = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate);
  const day = comfortAfterDay({
    comfort: cad.comfort,
    habitats: cad.habitats,
    needs: cad.needs,
    rates: cad.rates,
    classesForRecipe: cad.classesForRecipe,
    contextFactor: cad.contextFactor,
    personalityFactor: cad.personalityFactor,
  });
  return {
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregate: bundle,
    comfortAfterDay: { comfort: day.comfort, delta: day.delta, satisfied: day.satisfied, unsatisfied: day.unsatisfied },
  };
}
