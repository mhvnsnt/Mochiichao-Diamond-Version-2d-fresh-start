// S14 slice 113 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth + berry-tick-all + berry-ready-to-harvest + phase-4 garden self check + clamp care + garden form + dominant stat + type variant + garden battle bonus + alignment + colorway + ring capture + mochi link validation + branch evolution + data revert + apply garden item + garden level summary + level for aggregate + comfort after day bundle (pure library) + one comfort after days trace, side by side.
// FILENAME NOTE: this file stem carries all seventy-five slice-112 abbreviations/shortenings and, in the stem only, shortens hatch to htc, harvest (harv) to hrv, branch-evolution-revert (brev) to brv, and data-revert (drev) to drv (new in this slice, the further shortenings the ceiling required) and abbreviates comfort after days to cads (new in this slice): with those the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-112 import path keeps slice 112's exact stem.
// The comfort after days section is NOT computed from the bundle's values. It reads only the caller-supplied comfort case, days, habitats, needs, rates, classes function, and factors, exactly as garden-comfort's comfortAfterDays reports it. The comfort section does NOT feed the bundle's sections: reporting a comfort trace never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-ticks a berry patch, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks all patches, never re-reads ready-to-harvest patches, never re-runs the phase-4 garden self check, never re-clamps a bundle value, never re-reads a garden form, never re-reads a dominant stat, never re-reads a type variant, never re-reads a garden battle bonus, never re-reads an alignment, never re-reads a colorway, never re-reads a ring capture chance, never re-validates a mochi link, never re-picks a branch evolution candidate, never reverts a creature, never re-applies a garden item, never re-reads a garden level summary, never re-reads a level for aggregate, never re-reads a comfort after day as a separate single day, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, never evolves, trades, moves, or removes any creature, never changes any roster or any species, and never writes anything back into any record, care record, or bundle patch; the bundle's own garden records are never re-read here: only the caller-supplied comfort case and day count are.
// The comfort after days rule is garden-comfort's own (comfortAfterDays): the same daily term as comfortAfterDay (needs satisfied only by recognised habitats present, place never chores, by recipe id or by a class the habitat realises; raw term = gains for satisfied needs minus losses for unsatisfied needs, scaled by caller-supplied context and personality factors, both default 1; clamped at 0 and 100 only, never floored at neutral), applied N times in sequence with each day's result feeding only the next day's starting comfort inside the trace (days must be an integer >= 0; 0 days returns the starting comfort unchanged with an empty trace). NO need, recipe, class, rate, or factor is authored here: all are caller-supplied, exactly as garden-comfort takes them. It is a reported trace only: it is NOT comfort applied to any record here, NOT a habitat solve (habitats arrive as caller-supplied solved habitats), and it does NOT compute a breeding egg (createBreedingEgg stays out while the species question is HELD per garden-wiring's own comment). No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a comfort-after-days case.
// NEW-READ NOTE (this run, stated plainly): comfortAfterDays is verified new to this bundle chain this run: grep over gard-*.ts non-test files returns 0 calls to comfortAfterDays( (the only textual mention is slice 112's comment saying comfortAfterDays is a separate read, not composed there), and the slice-112 bundle's chain names no comfort-after-days section. Slice 112 composed the single day; this slice composes the multi-day trace itself, side by side with the bundle — the trace section is NOT fed by the bundle's values and does NOT feed the bundle's sections, and its days do NOT re-run any bundle section per day.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay,
} from "./gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eg-hatch-scr-now-crit-reb-co-tk-plnt-harv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-bw-bh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brev-drev-agi-gls-lfa-cad";
import {
  comfortAfterDays,
  type ComfortDayResult,
  type GardenNeedDef,
  type GardenNeedRate,
} from "./garden-comfort";
import type { SolvedHabitat } from "./garden-habitats";
import type { ClassesForRecipe } from "./garden-attraction";

/** The comfort after days section's inputs: exactly comfortAfterDays's parameters, as one object plus a day count. */
export interface ComfortAfterDaysInputs {
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
  /** Day count, an integer >= 0, as garden-comfort takes it. */
  days: number;
}

/** The comfort after days section's report: the final comfort and the day-by-day trace, exactly as garden-comfort reports them. */
export interface ComfortAfterDaysReport {
  /** Comfort after all days, clamped 0..100 only, never floored at neutral. */
  comfort: number;
  /** One entry per day, in order, each exactly as garden-comfort's comfortAfterDay reports it for that day. */
  days: ComfortDayResult[];
}

/** The inputs one slice-112 bundle plus one comfort after days trace is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayComfortAfterDaysInputs {
  /** The slice-112 bundle's inputs, as slice 112 takes them. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayInputs;
  /** The comfort after days section's inputs. */
  comfortAfterDays: ComfortAfterDaysInputs;
}

/** One slice-112 bundle plus one comfort after days trace, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayComfortAfterDays {
  /** The slice-112 bundle, exactly as slice 112 reports it. */
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay;
  /** The comfort after days trace, exactly as garden-comfort's comfortAfterDays reports it. */
  comfortAfterDays: ComfortAfterDaysReport;
}

/**
 * One slice-112 bundle plus one comfort after days trace, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayComfortAfterDays(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayComfortAfterDaysInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDayComfortAfterDays {
  const TAG = "gard-out-attr-spn-comp-str-arc-lab-hon-reg-plac-cls-zn-hab-plac-sum-brd-race-spar-inh-eg-htc-scr-now-crit-reb-co-tk-plnt-hrv-plc-rmv-rcmp-upg-empt-frsh-bt-bp-bw-bh-ct-ca-dst-ccr-bta-brh-gsc-cc-gf-ds-tv-bb-al-cw-rc-mlv-brv-drv-agi-gls-lfa-cad-cads";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay === null ||
    typeof inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay !== "object" ||
    Array.isArray(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay)
  ) {
    throw new Error(`${TAG}: gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay inputs must be an object`);
  }
  if (inputs.comfortAfterDays === null || typeof inputs.comfortAfterDays !== "object" || Array.isArray(inputs.comfortAfterDays)) {
    throw new Error(`${TAG}: comfortAfterDays inputs must be an object`);
  }
  const cads = inputs.comfortAfterDays;
  if (typeof cads.comfort !== "number" || !Number.isFinite(cads.comfort) || cads.comfort < 0 || cads.comfort > 100) {
    throw new Error(`${TAG}: comfortAfterDays comfort must be a finite number within 0..100`);
  }
  if (!Array.isArray(cads.habitats)) {
    throw new Error(`${TAG}: comfortAfterDays habitats must be an array`);
  }
  if (!Array.isArray(cads.needs)) {
    throw new Error(`${TAG}: comfortAfterDays needs must be an array`);
  }
  if (cads.rates === null || typeof cads.rates !== "object" || Array.isArray(cads.rates)) {
    throw new Error(`${TAG}: comfortAfterDays rates must be an object`);
  }
  if (typeof cads.classesForRecipe !== "function") {
    throw new Error(`${TAG}: comfortAfterDays classesForRecipe must be a function`);
  }
  if (cads.contextFactor !== undefined && (typeof cads.contextFactor !== "number" || !Number.isFinite(cads.contextFactor) || cads.contextFactor < 0)) {
    throw new Error(`${TAG}: comfortAfterDays contextFactor must be a finite number >= 0`);
  }
  if (cads.personalityFactor !== undefined && (typeof cads.personalityFactor !== "number" || !Number.isFinite(cads.personalityFactor) || cads.personalityFactor < 0)) {
    throw new Error(`${TAG}: comfortAfterDays personalityFactor must be a finite number >= 0`);
  }
  if (typeof cads.days !== "number" || !Number.isInteger(cads.days) || cads.days < 0) {
    throw new Error(`${TAG}: comfortAfterDays days must be an integer >= 0`);
  }
  const bundle = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay(inputs.gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay);
  const trace = comfortAfterDays({
    comfort: cads.comfort,
    habitats: cads.habitats,
    needs: cads.needs,
    rates: cads.rates,
    classesForRecipe: cads.classesForRecipe,
    contextFactor: cads.contextFactor,
    personalityFactor: cads.personalityFactor,
  }, cads.days);
  return {
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllBerryReadyToHarvestPhase4GardenSelfCheckClampCareGardenFormDominantStatTypeVariantGardenBattleBonusAlignmentColorwayRingCaptureMochiLinkValidateBranchEvolutionDataRevertApplyGardenItemGardenLevelSummaryLevelForAggregateComfortAfterDay: bundle,
    comfortAfterDays: { comfort: trace.comfort, days: trace.days },
  };
}
