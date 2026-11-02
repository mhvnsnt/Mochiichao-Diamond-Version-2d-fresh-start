/**
 * S14 slice 83 — B3 outing + attraction + spawn + composition + story + arcs
 * + labour + honour + register + placements + cells + zone habitat + placement
 * + summary + breeding + race + spar + inherited + eggsteps + hatch + race
 * scores + spar scores + garden now + critter + rebirth + cocoon + tick + plant
 * + harvest + place + remove + recompute + upgrade — one outing bundle plus
 * one record upgrade, pure library form.
 * (Filename note: this file's stem abbreviates racescores-sparscores to
 * scores, gardennow to now, and composition to comp — the full chain stem
 * + -upgrade would be over the 255-byte filename ceiling even with the
 * scores + now abbreviations (254 bytes for the module, 259 for the test);
 * exported function/type names keep the full chain name.)
 *
 * This module composes two already-landed reads and invents no new section
 * and no new rule. It calls the existing reads and reports exactly what
 * they return, side by side:
 * - the slice-82 bundle (outing + attraction + spawn + composition + story
 *   + arcs + labour + honour + register + placements + cells + zone habitat
 *   + placement + summary + breeding + race + spar + inherited + eggsteps
 *   + hatch + race scores + spar scores + garden now + critter + rebirth
 *   + cocoon + tick + plant + harvest + place + remove + recompute), exactly
 *   as slice 82 reports it;
 * - what one caller-supplied pass-3 GardenCreature reads as when it is
 *   upgraded via garden-wiring's upgradeGardenRecord over a
 *   caller-supplied speciesId and seed, exactly as garden-wiring defines
 *   it: a supplied base creature keeps every field it already carries
 *   and gains only the extended fields it lacks, defaulted (gardenAge 0,
 *   rebirths 0, mythic false, personality, favourite fruit, cocoon null,
 *   farm plots, raceWins 0, sparWins 0, egg null, collectedCritters [],
 *   placements {}, habitats {}); an omitted base becomes a fresh
 *   record from newGardenRecord for the caller-supplied speciesId and
 *   seed. The speciesId and seed parameters are used only where
 *   garden-wiring uses them: a supplied base keeps its own speciesId,
 *   and the seed reaches only a fresh record (its colorwaySeed) and a
 *   farm fallback. No personality, fruit, or any other value is authored
 *   here — every default is garden-wiring's own.
 *
 * The upgrade section is NOT computed from the bundle's values. In
 * particular it is NOT read off the bundle's summary string, placement
 * section, breeding gate, race winner, spar winner, inherited stat line,
 * stepped egg record, hatched record, race or spar scores section, garden
 * now minutes, critter record, rebirth record, cocoon record, tick record,
 * plant record, harvest record, place record, remove record, or recompute
 * record: the caller supplies the base creature (or omits it), the
 * speciesId, and the seed explicitly, and the bundle's records, zones,
 * solves, parents, racers, sparrers, inherited parents, egg records,
 * hatch records, garden now case, critter case, rebirth case, cocoon
 * case, tick case, plant case, harvest case, place case, remove case,
 * and recompute case are never used to pick them. And it does NOT feed
 * the bundle's sections: the bundle section still reads its own
 * caller-supplied inputs, never the upgrade section's record — an
 * upgrade never solves, changes, or re-solves a bundle habitat, never
 * places, moves, or removes a cell, never summarises a record, never
 * re-gates a breeding pair, never re-races or re-spars a pair, never
 * re-inherits a stat line, never re-steps an egg, never hatches an egg,
 * never re-reads the Garden's now, never re-applies a critter, never
 * rebirths a record, never re-enters or re-ticks a cocoon, never plants
 * a seed, never harvests a plot, never recomputes a habitats cache, and
 * never writes anything back into any record — and no upgrade result is
 * written back anywhere, no record appended to any log. Whether a host
 * stores the upgraded record is a host decision, not this read's.
 *
 * This section never creates a breeding egg and makes no species choice:
 * createBreedingEgg is a separate read, not composed here; the species
 * question stays HELD per garden-wiring's own comment. A caller-supplied
 * speciesId is an opaque caller string, exactly as in every earlier
 * slice. It never places or removes a cell: setPlacementCell and
 * removePlacementCell are separate reads, already composed in slices 80
 * and 81. It never recomputes a cache: recomputeHabitats is a separate
 * read, already composed in slice 82.
 *
 * Loud failures (throw) on a malformed input bundle and on any failure
 * propagated from either composed read, including a non-string or empty
 * speciesId, a non-finite seed, and a malformed base creature (missing
 * or non-finite garden stats, missing speciesId, non-array parts).
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeInputs,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute";
import {
  upgradeGardenRecord,
  type GardenSaveRecord,
} from "./garden-wiring";
import type { GardenCreature } from "./mochiichao-systems";

/** The upgrade section's inputs: an optional caller-supplied pass-3 creature, a caller-supplied speciesId, and a caller-supplied seed, read through garden-wiring's upgradeGardenRecord. */
export interface UpgradeInputs {
  /** The caller-supplied pass-3 GardenCreature to upgrade; when omitted, upgradeGardenRecord builds a fresh record from the speciesId and seed. Extended fields on a supplied base ride through unchanged. */
  base?: GardenCreature;
  /** Caller-supplied speciesId: the fresh record's species when no base is supplied; a supplied base keeps its own speciesId. An opaque caller string, never a species choice made here. */
  speciesId: string;
  /** Caller-supplied seed: the fresh record's colorwaySeed when no base is supplied (and the farm fallback's seed); otherwise unused by garden-wiring. */
  seed: number;
}

/** The upgrade section's report: the caller-supplied creature as upgradeGardenRecord reports it (a full GardenSaveRecord). */
export interface UpgradeReport {
  /** The record as upgradeGardenRecord reports it. */
  record: GardenSaveRecord;
}

/** The inputs one slice-82 bundle plus one record upgrade is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeInputs {
  /** The slice-82 bundle's inputs, as slice 82 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeInputs;
  /** The upgrade section's inputs. */
  upgrade: UpgradeInputs;
}

/** One slice-82 bundle plus one record upgrade, each exactly as its own read reports it, side by side, with no merged upgrade result and no reconciliation between their pictures. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade {
  /** The slice-82 bundle, exactly as slice 82 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute;
  /** The upgraded record, exactly as garden-wiring reports it. */
  upgrade: UpgradeReport;
}

/**
 * One slice-82 bundle plus one record upgrade:
 * outing-attraction-spawn-composition-story-arcs-labour-honour-register-
 * placements-cells-zone-habitat-placement-summary-breeding-race-spar-
 * inherited-eggsteps-hatch-racescores-sparscores-gardennow-critter-rebirth-
 * cocoon-tick-plant-harvest-place-remove-recompute bundle + one upgrade,
 * each exactly as its own read reports it, side by side, with no merged
 * upgrade result and no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgradeInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecomputeUpgrade {
  const TAG = "garden-outing-attraction-spawn-comp-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch-scores-now-critter-rebirth-cocoon-tick-plant-harvest-place-remove-recompute-upgrade";
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(`${TAG}: inputs must be an object`);
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute !== "object"
  ) {
    throw new Error(`${TAG}: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute inputs must be an object`);
  }
  if (inputs.upgrade === null || typeof inputs.upgrade !== "object" || Array.isArray(inputs.upgrade)) {
    throw new Error(`${TAG}: upgrade inputs must be an object`);
  }
  if (typeof inputs.upgrade.speciesId !== "string" || inputs.upgrade.speciesId.length === 0) {
    throw new Error(`${TAG}: upgrade speciesId must be a non-empty string`);
  }
  if (typeof inputs.upgrade.seed !== "number" || !Number.isFinite(inputs.upgrade.seed)) {
    throw new Error(`${TAG}: upgrade seed must be a finite number`);
  }
  if (inputs.upgrade.base !== undefined) {
    const base = inputs.upgrade.base;
    if (base === null || typeof base !== "object" || Array.isArray(base)) {
      throw new Error(`${TAG}: upgrade base must be an object`);
    }
    if (typeof base.speciesId !== "string" || base.speciesId.length === 0) {
      throw new Error(`${TAG}: upgrade base speciesId must be a non-empty string`);
    }
    if (
      base.garden === null ||
      typeof base.garden !== "object" ||
      Array.isArray(base.garden) ||
      typeof base.garden.dive !== "number" ||
      !Number.isFinite(base.garden.dive) ||
      typeof base.garden.glide !== "number" ||
      !Number.isFinite(base.garden.glide) ||
      typeof base.garden.sprint !== "number" ||
      !Number.isFinite(base.garden.sprint) ||
      typeof base.garden.might !== "number" ||
      !Number.isFinite(base.garden.might) ||
      typeof base.garden.endurance !== "number" ||
      !Number.isFinite(base.garden.endurance)
    ) {
      throw new Error(`${TAG}: upgrade base garden must carry finite dive, glide, sprint, might, and endurance numbers`);
    }
    for (const field of ["careScore", "bond", "careMistakes", "trainingSessions", "colorwaySeed"] as const) {
      if (typeof base[field] !== "number" || !Number.isFinite(base[field])) {
        throw new Error(`${TAG}: upgrade base ${field} must be a finite number`);
      }
    }
    if (!Array.isArray(base.parts)) {
      throw new Error(`${TAG}: upgrade base parts must be an array`);
    }
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute = gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute(
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute,
  );
  const upgradeRecord = upgradeGardenRecord(
    inputs.upgrade.base,
    inputs.upgrade.speciesId,
    inputs.upgrade.seed,
  );
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchRaceScoresSparScoresGardenNowCritterRebirthCocoonTickPlantHarvestPlaceRemoveRecompute,
    upgrade: {
      record: upgradeRecord,
    },
  };
}
