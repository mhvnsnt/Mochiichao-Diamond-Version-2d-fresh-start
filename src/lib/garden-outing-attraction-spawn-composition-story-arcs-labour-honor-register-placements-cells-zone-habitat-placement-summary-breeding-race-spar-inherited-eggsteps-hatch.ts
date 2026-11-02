/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps + hatch — one outing plus its Garden news plus what its
 * journey brings home plus what the Garden does on its own
 * plus what its zones recognise as habitats plus what those
 * habitats attract plus what that attraction means for spawn
 * rows plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc plus
 * whether each caller-named Garden job runs or idles plus
 * what the caller-supplied honour sources add up to plus what
 * the caller-supplied Garden register lists plus what the
 * caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one
 * zone's placements recognise as a habitat plus what that one
 * zone's placements look like in the solver's placement
 * shape plus what one caller-named Garden record reads as in
 * one line plus whether two caller-supplied Garden records
 * pass the breeding gate plus which of two caller-supplied
 * Garden stat lines wins a race plus which of two
 * caller-supplied Garden stat lines wins a spar plus what
 * stat line two caller-supplied Garden stat lines hand down
 * plus what one caller-supplied Garden record's egg steps
 * count down to plus what one caller-supplied Garden
 * record's egg hatches to, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-
 *   plus-eggsteps bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps
 *   (slice 69);
 * - what one caller-supplied Garden record's egg hatches to
 *   via garden-wiring's hatchEgg, exactly as garden-wiring
 *   defines it: an egg at 0 steps remaining hatches, clearing
 *   the egg and reporting the egg's own recorded speciesId;
 *   an egg above 0 steps, or a record carrying no egg, reads
 *   back unchanged with a null hatched species. The hatched
 *   record is a pure outcome only, as its own comment states:
 *   hatching clears the egg and returns its species, and the
 *   caller builds any new record with newGardenRecord +
 *   inheritedGardenStats (both already on main) — that build
 *   is NOT done here.
 *
 * The hatch section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, inherited, or
 * eggsteps values. In particular it is NOT read off the
 * bundle's summary string, its placement section, its
 * breeding gate, its race winner, its spar winner, its
 * inherited stat line, or its stepped egg record: the caller
 * supplies the record explicitly, and the bundle's records,
 * zones, solves, parents, racers, sparrers, inherited
 * parents, and egg records are never used to pick it — a
 * record the bundle never names still hatches from its own
 * numbers, and numbers the bundle names still hatch only
 * when the caller hands them over as the record. And it does
 * NOT feed the bundle's sections: the bundle section still
 * reads its own caller-supplied inputs, never the hatch
 * section's record — hatching an egg never solves, changes,
 * or re-solves a habitat, never places, moves, or removes a
 * cell, never summarises a record, never re-gates a breeding
 * pair, never re-races or re-spars a pair, never re-inherits
 * a stat line, never re-steps an egg, and never writes
 * anything back into any record — and no hatched result is
 * written back anywhere, no record is appended to any log
 * here.
 *
 * Deliberately NOT here:
 * - NO merged hatch result and NO order invented between
 *   the bundle and the hatch section beyond each section's
 *   own order, and NO reconciliation of the two sections'
 *   pictures;
 * - NO hatch computed from a bundle value (the record is
 *   caller-supplied, never read off a bond list, decay
 *   breakdown, comfort day, thanks intensity, level summary,
 *   bridge record, check-in beat, snapshot lens, journey
 *   visit, unlock evaluation, individual summary, teacher
 *   reading, movement reading, arrival reading, research
 *   reading, discovery candidate, news item, inbound reading,
 *   migration, story beat or arc inside the bundle,
 *   attraction reading, spawn annotation, habitat reading,
 *   composition reading, story reading, arc reading, labour
 *   status, honour entry, register entry, register recognised
 *   flag, placements habitat, placements zone list, cells
 *   listing, cells item, zone-habitat solve, solved habitat,
 *   placement cell, placement item, summary string, breeding
 *   gate, race winner, spar winner, inherited stat line, or
 *   stepped egg record);
 * - NO hatch-to-placements chaining, NO hatch-to-breeding
 *   chaining, NO hatch-to-race chaining, NO hatch-to-spar
 *   chaining, NO hatch-to-inherited chaining, and NO
 *   hatch-to-eggsteps chaining (a hatched egg never makes a
 *   placements-cache entry, never gates or un-gates a
 *   breeding pair, never re-races or re-spars a pair, never
 *   re-inherits a stat line, never re-steps an egg);
 * - NO egg creation and NO species choice: createBreedingEgg
 *   is a separate read, not composed here, and the species
 *   question for creating an egg stays HELD per
 *   garden-wiring's own comment — the hatch section only
 *   reads back the speciesId already recorded on an egg the
 *   caller supplies, it never picks a species, never applies
 *   a default, and never builds a hybrid;
 * - NO new creature record built from a hatch (the caller
 *   builds one with newGardenRecord + inheritedGardenStats
 *   when a host wants one; no such build happens here);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual, teacher,
 *   movement, arrival, research, discovery, news, inbound,
 *   migration, story, arc, habitat, attraction, spawn,
 *   composition, labour, honour, register, placements,
 *   cells, zone-habitat, placement, summary, breeding, race,
 *   spar, inherited, eggsteps, or hatch writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a hatched egg, a hatched speciesId,
 *   or a stepsRemaining value on tiers, richness, weights,
 *   stock, or spawn behaviour, and NO encounter, spawn, or
 *   route decision (whether a hatched egg is consulted
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a hatched egg is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays. The hatch record is fresh whenever the
 * caller-supplied record carries an egg at 0 steps
 * (hatchEgg returns a new record object there, with the egg
 * cleared); when the record carries no egg, or an egg above
 * 0 steps, garden-wiring's hatchEgg returns that very same
 * record object, so the hatch section aliases the input
 * record in exactly those cases — the section's values still
 * read back unchanged, and nothing is ever mutated. Loud
 * failures (throw) on a malformed input bundle and on any
 * failure propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps";
import {
  hatchEgg,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The hatch section's inputs: one caller-supplied Garden record. */
export interface HatchInputs {
  /** The caller-supplied Garden record whose egg may hatch, as the caller built it. */
  record: GardenSaveRecord;
}

/** The hatch section's report: the hatched Garden record plus the hatched species, with the values exactly as garden-wiring reports them. */
export interface HatchReport {
  /** The Garden record with its egg cleared when it hatched — the record value hatchEgg reports under its own `rec` key, named `record` here to match the eggsteps section's naming. */
  record: GardenSaveRecord;
  /** The hatched speciesId when the egg hatched, null when it did not, exactly as hatchEgg reports it. */
  hatchedSpeciesId: string | null;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps-plus-hatch bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited-plus-eggsteps bundle's inputs, as slice 69 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs;
  /** The hatch section's inputs. */
  hatch: HatchInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to plus what one caller-supplied Garden record's egg hatches to. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps bundle, exactly as slice 69 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps;
  /** The hatched Garden record plus the hatched species, exactly as garden-wiring reports them. */
  hatch: HatchReport;
}

/**
 * One outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows plus
 * what the composition pass says about a recognised habitat
 * plus what the story beats say about who is present plus
 * what the arc beats say about each resident's arc plus
 * whether each caller-named Garden job runs or idles plus
 * what the caller-supplied honour sources add up to plus what
 * the caller-supplied Garden register lists plus what the
 * caller-supplied placements solve to plus what one
 * caller-named zone has placed in it plus what that one
 * zone's placements recognise as a habitat plus what that one
 * zone's placements look like in the solver's placement shape
 * plus what one caller-named Garden record reads as in one
 * line plus whether two caller-supplied Garden records pass
 * the breeding gate plus which of two caller-supplied Garden
 * stat lines wins a race plus which of two caller-supplied
 * Garden stat lines wins a spar plus what stat line two
 * caller-supplied Garden stat lines hand down plus what one
 * caller-supplied Garden record's egg steps count down to
 * plus what one caller-supplied Garden record's egg hatches
 * to: outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat-placement-
 * summary-breeding-race-spar-inherited-eggsteps bundle + one
 * hatch reading, each exactly as its own read reports it,
 * side by side, with no merged hatch result and no
 * reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatchInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsHatch {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps inputs must be an object",
    );
  }
  if (inputs.hatch === null || typeof inputs.hatch !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch: hatch inputs must be an object",
    );
  }
  if (
    inputs.hatch.record === null ||
    typeof inputs.hatch.record !== "object" ||
    Array.isArray(inputs.hatch.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps-hatch: hatch record must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
    );
  const hatched = hatchEgg(inputs.hatch.record);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps,
    hatch: { record: hatched.rec, hatchedSpeciesId: hatched.hatchedSpeciesId },
  };
}
