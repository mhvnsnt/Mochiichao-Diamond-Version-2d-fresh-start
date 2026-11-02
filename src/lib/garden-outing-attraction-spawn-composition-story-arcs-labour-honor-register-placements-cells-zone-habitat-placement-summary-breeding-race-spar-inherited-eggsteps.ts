/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register + placements + cells + zone habitat
 * + placement + summary + breeding + race + spar + inherited
 * + eggsteps — one outing plus its Garden news plus what its
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
 * count down to, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour-plus-register-
 *   plus-placements-plus-cells-plus-zone-habitat-plus-placement-
 *   plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited
 *   bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited
 *   (slice 68);
 * - what one caller-supplied Garden record's egg steps count
 *   down to via garden-wiring's tickEggSteps, exactly as
 *   garden-wiring defines it: the record's egg stepsRemaining
 *   counts down by the caller-supplied step count, floored at
 *   0; a record carrying no egg reads back unchanged. The
 *   stepped record is a pure outcome only, as its own comment
 *   states: it does not hatch anything, it does not create an
 *   egg, and it does not decide a species.
 *
 * The eggsteps section is NOT computed from the bundle's
 * outing, bond, decay, comfort, thanks, level, record,
 * check-in, snapshot, journey, unlock, individual, teacher,
 * movement, arrival, research, discovery, news, inbound,
 * migration, story, arc, attraction, spawn, composition,
 * labour, honour, register, placements, cells, zone-habitat,
 * placement, summary, breeding, race, spar, or inherited
 * values. In particular it is NOT read off the bundle's
 * summary string, its placement section, its breeding gate,
 * its race winner, its spar winner, or its inherited stat
 * line: the caller supplies the record and the step count
 * explicitly, and the bundle's records, zones, solves,
 * parents, racers, sparrers, and inherited parents are never
 * used to pick them — a record the bundle never names still
 * steps down from its own numbers, and numbers the bundle
 * names still step down only when the caller hands them over
 * as the record. And it does NOT feed the bundle's sections:
 * the bundle section still reads its own caller-supplied
 * inputs, never the eggsteps section's record — stepping an
 * egg never solves, changes, or re-solves a habitat, never
 * places, moves, or removes a cell, never summarises a
 * record, never re-gates a breeding pair, never re-races a
 * pair, never re-spars a pair, never re-inherits a stat line,
 * and never writes anything back into any record — and no
 * stepped result is written back anywhere, no record is
 * appended to any log here.
 *
 * Deliberately NOT here:
 * - NO merged eggsteps result and NO order invented between
 *   the bundle and the eggsteps section beyond each
 *   section's own order, and NO reconciliation of the two
 *   sections' pictures;
 * - NO egg steps computed from a bundle value (the record and
 *   the step count are caller-supplied, never read off a bond
 *   list, decay breakdown, comfort day, thanks intensity,
 *   level summary, bridge record, check-in beat, snapshot
 *   lens, journey visit, unlock evaluation, individual
 *   summary, teacher reading, movement reading, arrival
 *   reading, research reading, discovery candidate, news
 *   item, inbound reading, migration, story beat or arc
 *   inside the bundle, attraction reading, spawn annotation,
 *   habitat reading, composition reading, story reading, arc
 *   reading, labour status, honour entry, register entry,
 *   register recognised flag, placements habitat, placements
 *   zone list, cells listing, cells item, zone-habitat solve,
 *   solved habitat, placement cell, placement item, summary
 *   string, breeding gate, race winner, spar winner, or
 *   inherited stat line);
 * - NO eggsteps-to-placements chaining, NO
 *   eggsteps-to-breeding chaining, NO eggsteps-to-race
 *   chaining, NO eggsteps-to-spar chaining, and NO
 *   eggsteps-to-inherited chaining (a stepped egg never makes
 *   a placements-cache entry, never gates or un-gates a
 *   breeding pair, never re-races or re-spars a pair, never
 *   re-inherits a stat line);
 * - NO egg creation and NO hatching and NO species choice
 *   (createBreedingEgg and hatchEgg are separate reads, not
 *   composed here; the species question stays HELD per
 *   garden-wiring's own comment — the eggsteps section only
 *   counts down the steps of an egg the caller already
 *   supplies on a record);
 * - NO placements writer: this module never places, moves,
 *   or removes a cell, never recomputes a stored cache, and
 *   never writes anything back into any record;
 * - NO outing, bond, comfort, thanks, level, record,
 *   check-in, snapshot, journey, unlock, individual,
 *   teacher, movement, arrival, research, discovery, news,
 *   inbound, migration, story, arc, habitat, attraction,
 *   spawn, composition, labour, honour, register,
 *   placements, cells, zone-habitat, placement, summary,
 *   breeding, race, spar, inherited, or eggsteps writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   honour-source, placement, or item data authored for any
 *   resident, zone, or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all ids are
 *   caller-supplied);
 * - NO numeric effect of a stepped egg, a step count, or a
 *   stepsRemaining value on tiers, richness, weights, stock,
 *   or spawn behaviour, and NO encounter, spawn, or route
 *   decision (whether a stepped egg is consulted anywhere is
 *   a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a stepped egg is applied anywhere is a host
 *   decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays. The eggsteps record is fresh whenever the
 * caller-supplied record carries an egg (tickEggSteps returns
 * a new record object there); when the record carries no egg,
 * garden-wiring's tickEggSteps returns that very same record
 * object, so the eggsteps section aliases the input record in
 * exactly that case — the section's values still read back
 * unchanged, and nothing is ever mutated. Loud failures
 * (throw) on a malformed input bundle and on any failure
 * propagated from either composed read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited";
import {
  tickEggSteps,
  type GardenSaveRecord,
} from "./garden-wiring";

/** The eggsteps section's inputs: one caller-supplied Garden record and the step count. */
export interface EggstepsInputs {
  /** The caller-supplied Garden record whose egg steps count down, as the caller built it. */
  record: GardenSaveRecord;
  /** The caller-supplied step count to count the egg down by, floored at 0 remaining. */
  steps: number;
}

/** The eggsteps section's report: the stepped Garden record, exactly as garden-wiring reports it. */
export interface EggstepsReport {
  /** The Garden record with its egg steps counted down, exactly as tickEggSteps reports it. */
  record: GardenSaveRecord;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited-plus-eggsteps bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-plus-inherited bundle's inputs, as slice 68 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedInputs;
  /** The eggsteps section's inputs. */
  eggsteps: EggstepsInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists plus what the caller-supplied placements solve to plus what one caller-named zone has placed in it plus what that one zone's placements recognise as a habitat plus what that one zone's placements look like in the solver's placement shape plus what one caller-named Garden record reads as in one line plus whether two caller-supplied Garden records pass the breeding gate plus which of two caller-supplied Garden stat lines wins a race plus which of two caller-supplied Garden stat lines wins a spar plus what stat line two caller-supplied Garden stat lines hand down plus what one caller-supplied Garden record's egg steps count down to. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register-plus-placements-plus-cells-plus-zone-habitat-plus-placement-plus-summary-plus-breeding-plus-race-plus-spar-plus-inherited bundle, exactly as slice 68 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited;
  /** The stepped Garden record, exactly as garden-wiring reports it. */
  eggsteps: EggstepsReport;
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
 * caller-supplied Garden record's egg steps count down to:
 * outing-attraction-spawn-composition-story-arcs-labour-
 * honour-register-placements-cells-zone-habitat-placement-
 * summary-breeding-race-spar-inherited bundle + one stepped
 * egg record, each exactly as its own read reports it, side by
 * side, with no merged eggsteps result and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggstepsInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInheritedEggsteps {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps: outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited inputs must be an object",
    );
  }
  if (inputs.eggsteps === null || typeof inputs.eggsteps !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps: eggsteps inputs must be an object",
    );
  }
  if (
    inputs.eggsteps.record === null ||
    typeof inputs.eggsteps.record !== "object" ||
    Array.isArray(inputs.eggsteps.record)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps: eggsteps record must be an object",
    );
  }
  if (
    typeof inputs.eggsteps.steps !== "number" ||
    !Number.isFinite(inputs.eggsteps.steps)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register-placements-cells-zone-habitat-placement-summary-breeding-race-spar-inherited-eggsteps: eggsteps steps must be a finite number",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited,
    );
  const eggsteps = tickEggSteps(inputs.eggsteps.record, inputs.eggsteps.steps);
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonorRegisterPlacementsCellsZoneHabitatPlacementSummaryBreedingRaceSparInherited,
    eggsteps: { record: eggsteps },
  };
}
