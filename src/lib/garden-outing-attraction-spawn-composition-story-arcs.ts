/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs — one
 * outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its
 * zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows
 * plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story bundle from
 *   garden-outing-attraction-spawn-composition-story
 *   (slice 55);
 * - one arcs reading via garden-arcs' applyArcBeats, over the
 *   caller-supplied arc state, arc-beat schedule, and
 *   through-beat cursor.
 *
 * The arcs section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, or composition values. In
 * particular it is NOT read off the autonomous section's own
 * story beats or arcs, it is NOT read off the story section's
 * residents, arrivals, departures, or applied beats, and it is
 * NOT read off any outing resident list: the arc state, the
 * beat schedule, and the cursor are caller-supplied, never
 * taken from the bundle. The story cursor and the arc cursor
 * are independent caller-supplied cursors; no order is
 * invented between the story beats and the arc beats beyond
 * each schedule's own order. Beats after the arc cursor are
 * not applied, exactly as garden-arcs reports them. An arcs
 * reading is a summary this module never stores or registers
 * in live play, and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged arcs and NO order invented between the
 *   outing-attraction-spawn-composition-story bundle and the
 *   arcs section beyond each section's own caller-supplied
 *   schedule and cursor;
 * - NO reconciliation of the two sections' pictures: the
 *   arcs section's facts are exactly what applyArcBeats
 *   reports over the caller-supplied arc state, schedule, and
 *   cursor, and the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStory reports over
 *   its own inputs;
 * - NO arcs reading computed from a bundle value (above):
 *   arc state, beats, and cursor are caller-supplied, never
 *   read off a bond list, a decay breakdown, a comfort day, a
 *   thanks intensity, a level summary, a bridge record, a
 *   check-in beat, a snapshot lens, a journey visit, an
 *   unlock evaluation, an individual summary, a teacher
 *   reading, a movement reading, an arrival reading, a
 *   research reading, a discovery candidate, a news item, an
 *   inbound reading, a migration, a story beat or arc inside
 *   the bundle, an attraction reading, a spawn annotation, a
 *   habitat reading, a composition reading, or a story
 *   reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, or composition
 *   writer: an arcs reading is a summary this module never
 *   stores or registers in live play, and no record is
 *   appended to any log here;
 * - NO story, arc, recipe, modifier, or combo data authored
 *   for any resident or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all beats, residents,
 *   arcs, and cursor values are caller-supplied);
 * - NO numeric effect of an arc beat on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether an arc change is met
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids and arc values are opaque
 *   caller strings; the #102 range rule is the host's
 *   filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether an arcs reading is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and this arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStory,
  type GardenOutingAttractionSpawnCompositionStory,
  type GardenOutingAttractionSpawnCompositionStoryInputs,
} from "./garden-outing-attraction-spawn-composition-story";
import {
  applyArcBeats,
  type ArcBeat,
  type ArcBeatResult,
  type ResidentArc,
} from "./garden-arcs";

/** The arcs section's inputs: one caller-supplied arc state plus its schedule and cursor. */
export interface ArcsInputs {
  /** The arc state the schedule starts from, as supplied. */
  arcs: ResidentArc[];
  /** The arc-beat schedule, in schedule order, as supplied. */
  beats: ArcBeat[];
  /** The beat through which the schedule is applied, as supplied. */
  throughBeatId: string;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsInputs {
  /** The outing-attraction-spawn-composition-story bundle's inputs, as slice 55 takes them. */
  outingAttractionSpawnCompositionStory: GardenOutingAttractionSpawnCompositionStoryInputs;
  /** The arcs section's inputs. */
  arcs: ArcsInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc. */
export interface GardenOutingAttractionSpawnCompositionStoryArcs {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story bundle, exactly as slice 55 reports it. */
  outingAttractionSpawnCompositionStory: GardenOutingAttractionSpawnCompositionStory;
  /** The arcs reading, exactly as garden-arcs reports it, copied fresh. */
  arcs: ArcBeatResult;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat plus what
 * the story beats say about who is present plus what the arc
 * beats say about each resident's arc:
 * outing-attraction-spawn-composition-story bundle + one arcs
 * reading, each exactly as its own read reports it, side by
 * side, with no merged arcs and no reconciliation between
 * their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcs(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsInputs,
): GardenOutingAttractionSpawnCompositionStoryArcs {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStory === null ||
    typeof inputs.outingAttractionSpawnCompositionStory !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: outingAttractionSpawnCompositionStory inputs must be an object",
    );
  }
  if (inputs.arcs === null || typeof inputs.arcs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: arcs inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.arcs.arcs)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: arcs state must be an array",
    );
  }
  if (!Array.isArray(inputs.arcs.beats)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: arcs beats must be an array",
    );
  }
  if (!isNonEmptyString(inputs.arcs.throughBeatId)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs: arcs throughBeatId must be a non-empty string",
    );
  }
  const outingAttractionSpawnCompositionStory =
    gardenOutingAttractionSpawnCompositionStory(
      inputs.outingAttractionSpawnCompositionStory,
    );
  const arcsResult = applyArcBeats(
    inputs.arcs.arcs,
    inputs.arcs.beats,
    inputs.arcs.throughBeatId,
  );
  return {
    outingAttractionSpawnCompositionStory,
    arcs: {
      arcs: arcsResult.arcs.map((entry) => ({ ...entry })),
      changed: [...arcsResult.changed],
      appliedBeatIds: [...arcsResult.appliedBeatIds],
    },
  };
}
