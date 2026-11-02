// S14 slice 95 — B3 outing + attraction + spawn + composition + story + arcs + labour + honour + register + placements + cells + zone habitat + placement + summary + breeding + race + spar + inherited + eggsteps + hatch + race scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant + harvest + place + remove + recompute + upgrade + empty + fresh + berry-stage + berry-tick + berry-plant + berry-water + berry-harvest + companion-tick + companion-apply + daycare-step-tick + companion-can-rebirth bundle (pure library) + one phase-4 berry-tick-all reading, side by side.
// FILENAME NOTE: this file stem abbreviates, in the stem only, racescores-sparscores to scores, gardennow to now, composition to comp, attraction to attr, register to reg (all five carried from slice 85), AND placements to placem and recompute to recomp (both carried from slice 86), AND abbreviates, in the stem only, placement to placem, summary to summ, breeding to breed, and habitat to hab (all four carried from slice 88, with summary then shortened, in the stem only, to sum in slice 93 and carried here), AND abbreviates, in the stem only, labour to lab, critter to crit, cocoon to coc, and harvest to harv (all four carried from slice 89), AND abbreviates, in the stem only, garden to gard and outing to out (both carried from slice 90), AND shortens, in the stem only, berrytick to berryt, berryplant to berrypl, berrywater to berryw, and berryharvest to berryh (all four carried from slice 91), AND abbreviates companion tick to comptick (carried from slice 91) and then shortens it, in the stem only, to compt (carried from slice 92) and then to ct (carried from slice 94), AND shortens, in the stem only, the standalone garden-tick segment tick to tk and plant to plnt (both carried from slice 92), AND abbreviates companion apply to compapp (carried from slice 92) and then shortens it, in the stem only, to capp (carried from slice 93) and then to ca (carried from slice 94), AND abbreviates daycare step tick to dst (carried from slice 93), AND abbreviates companion can rebirth to ccr (carried from slice 94), AND shortens, in the stem only, racescores-sparscores (scores) to scr (new in this slice), AND abbreviates berry tick all to bta (new in this slice): without the scr shortening plus bta the test filename would exceed the 255-byte ceiling; with them the module filename is 249 bytes and the test filename is 254 bytes, both under the ceiling. Exported function/type names below keep the full chain name (no abbreviation), and the slice-94 import path keeps slice 94's exact stem.
// The berryTickAll section is NOT computed from the bundle's values. The caller supplies the patches and the elapsed minutes explicitly, never via the bundle's records, zones, solves, parents, racers, sparrers, inherited parents, egg records, hatch records, garden now case, critter case, rebirth case, cocoon case, tick case, plant case, harvest case, place case, remove case, recompute case, upgrade case, empty case, fresh case, berry-stage section, berry-tick section, berry-plant section, berry-water section, berry-harvest section, companion-tick section, companion-apply section, daycare-step-tick section, or companion-can-rebirth section. The berryTickAll section does NOT feed the bundle's sections: ticking patches never solves, changes, or re-solves a bundle habitat, never places, moves, or removes a cell, never summarises a record, never re-gates a breeding pair, never re-races or re-spars a pair, never re-inherits a stat line, never re-steps an egg, never hatches an egg, never re-reads the Garden's now, never re-applies a critter, never rebirths a record, never re-enters or re-ticks a cocoon, never ticks a plot, never plants a seed, never waters a patch, never harvests a plot, never recomputes a habitats cache, never upgrades a record, never empties a placements block, never creates a fresh record, never re-reads a berry stage, never re-plants a patch, never re-waters a patch, never re-harvests a patch, never re-ticks companion care, never re-applies a care effect, never re-steps a daycare countdown, never re-checks rebirth eligibility, and never writes anything back into any record, care record, or bundle patch.
// The berry-tick-all rule is phase-4 garden's own (berryTickAll): every supplied patch is advanced by the same elapsed minutes exactly as berryTick advances one patch (empty patches and patches with no seed stay unchanged; planted-to-fruit thresholds 60/180/360/480 minutes; fruit left unharvested withers at age 720). This slice does NOT plant, water, or harvest anything, does NOT tick companion care, does NOT apply a care effect, does NOT step a daycare countdown, and does NOT check rebirth eligibility. No new data, no host, no store/view/save change, no effect in live play until a host feeds it a bundle and a berryTickAll case.

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth,
} from "./gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inherit-eggsteps-hatch-scores-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upgrade-empty-fresh-berryt-berrypl-berryw-berryh-ct-ca-dst-ccr";
import {
  berryTickAll,
  type BerryPatch,
} from "./wiring/phase4-garden";

/** The berryTickAll section's inputs: caller-supplied patches and elapsed minutes. */
export interface BerryTickAllInputs {
  /** The patches to tick, as the caller supplies them. */
  patches: BerryPatch[];
  /** Elapsed in-game minutes applied to every patch. */
  elapsedMinutes: number;
}

/** The berryTickAll section's report: the ticked patches, exactly as phase-4 garden reports them. */
export interface BerryTickAllReport {
  /** The patches after ticking. */
  patches: BerryPatch[];
}

/** The inputs one slice-94 bundle plus one berry-tick-all reading is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllInputs {
  /** The slice-94 bundle's inputs, as slice 94 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthInputs;
  /** The berryTickAll section's inputs (patches + elapsed minutes). */
  berryTickAll: BerryTickAllInputs;
}

/** One slice-94 bundle plus one berry-tick-all reading, each exactly as its own read reports it, side by side, with no merged result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAll {
  /** The slice-94 bundle, exactly as slice 94 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth;
  /** The ticked patches, exactly as phase-4 garden reports them. */
  berryTickAll: BerryTickAllReport;
}

/**
 * One slice-94 bundle plus one berry-tick-all reading:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade-empty-fresh-berry-stage-berry-tick-berry-plant-berry-water-berry-harvest-companion-tick-companion-apply-daycare-step-tick-companion-can-rebirth bundle + one
 * berry tick all, each exactly as its own read reports it, side by side, with
 * no merged result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAll(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAllInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirthBerryTickAll {
  const TAG = "gard-out-attr-spawn-comp-story-arcs-lab-honor-reg-placem-cells-zone-hab-placem-sum-breed-race-spar-inherit-eggsteps-hatch-scr-now-crit-rebirth-coc-tk-plnt-harv-place-remove-recomp-upgrade-empty-fresh-berryt-berrypl-berryw-berryh-ct-ca-dst-ccr-bta";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth !== "object" ||
    Array.isArray(inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth)
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth inputs must be an object`);
  }
  if (inputs.berryTickAll === null || typeof inputs.berryTickAll !== "object" || Array.isArray(inputs.berryTickAll)) {
    throw new Error(`${TAG}: berryTickAll inputs must be an object`);
  }
  if (!Array.isArray(inputs.berryTickAll.patches)) {
    throw new Error(`${TAG}: berryTickAll patches must be an array`);
  }
  if (typeof inputs.berryTickAll.elapsedMinutes !== "number" || Number.isNaN(inputs.berryTickAll.elapsedMinutes)) {
    throw new Error(`${TAG}: berryTickAll elapsedMinutes must be a number`);
  }
  for (const patch of inputs.berryTickAll.patches) {
    if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
      throw new Error(`${TAG}: berryTickAll patch must be an object`);
    }
    if (typeof patch.id !== "string") {
      throw new Error(`${TAG}: berryTickAll patch id must be a string`);
    }
    if (patch.seedId !== null && typeof patch.seedId !== "string") {
      throw new Error(`${TAG}: berryTickAll patch seedId must be a string or null`);
    }
    if (!["empty", "planted", "sprout", "growing", "bloom", "fruit", "withered"].includes(patch.stage)) {
      throw new Error(`${TAG}: berryTickAll patch stage must be a berry stage`);
    }
    for (const key of ["ageMinutes", "waterings", "waterBonus"] as const) {
      if (typeof patch[key] !== "number" || Number.isNaN(patch[key])) {
        throw new Error(`${TAG}: berryTickAll patch ${key} must be a number`);
      }
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth,
  );
  const patches = berryTickAll(inputs.berryTickAll.patches, inputs.berryTickAll.elapsedMinutes);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeEmptyFreshBerryStageBerryTickBerryPlantBerryWaterBerryHarvestCompanionTickCompanionApplyDaycareStepTickCompanionCanRebirth,
    berryTickAll: {
      patches,
    },
  };
}
