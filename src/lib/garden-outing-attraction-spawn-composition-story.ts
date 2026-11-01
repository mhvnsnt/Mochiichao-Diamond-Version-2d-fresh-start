/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story — one outing plus
 * its Garden news plus what its journey brings home plus what
 * the Garden does on its own plus what its zones recognise as
 * habitats plus what those habitats attract plus what that
 * attraction means for spawn rows plus what the composition
 * pass says about a recognised habitat plus what the story
 * beats say about who is present, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition
 *   bundle from garden-outing-attraction-spawn-composition
 *   (slice 54);
 * - one story reading via garden-story's applyStoryBeats, over
 *   the caller-supplied residents, story-beat schedule, and
 *   through-beat cursor.
 *
 * The story section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, or composition values. In
 * particular it is NOT read off the autonomous section's own
 * story beats or arcs, and it is NOT read off any outing
 * resident list: the residents, the beat schedule, and the
 * cursor are caller-supplied, never taken from the bundle.
 * Beats after the cursor are not applied, exactly as
 * garden-story reports them. A story reading is a summary
 * this module never stores or registers in live play, and no
 * record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged story and NO order invented between the
 *   outing-attraction-spawn-composition bundle and the story
 *   section;
 * - NO reconciliation of the two sections' pictures: the
 *   story section's facts are exactly what applyStoryBeats
 *   reports over the caller-supplied residents, schedule, and
 *   cursor, and the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnComposition reports over its
 *   own inputs;
 * - NO story reading computed from a bundle value (above):
 *   residents, beats, and cursor are caller-supplied, never
 *   read off a bond list, a decay breakdown, a comfort day, a
 *   thanks intensity, a level summary, a bridge record, a
 *   check-in beat, a snapshot lens, a journey visit, an
 *   unlock evaluation, an individual summary, a teacher
 *   reading, a movement reading, an arrival reading, a
 *   research reading, a discovery candidate, a news item, an
 *   inbound reading, a migration, a story beat or arc inside
 *   the bundle, an attraction reading, a spawn annotation, a
 *   habitat reading, or a composition reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, or composition
 *   writer: a story reading is a summary this module never
 *   stores or registers in live play, and no record is
 *   appended to any log here;
 * - NO story, arc, recipe, modifier, or combo data authored
 *   for any resident or habitat (owner slots S1/S5 in the
 *   wiring plan, never filled here; all beats, residents,
 *   and cursor values are caller-supplied);
 * - NO numeric effect of a story beat on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether a story arrival is met
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids and arc values are opaque
 *   caller strings; the #102 range rule is the host's
 *   filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a story reading is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   and this story cursor;
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
  gardenOutingAttractionSpawnComposition,
  type GardenOutingAttractionSpawnComposition,
  type GardenOutingAttractionSpawnCompositionInputs,
} from "./garden-outing-attraction-spawn-composition";
import {
  applyStoryBeats,
  type StoryBeat,
  type StoryCompositionResult,
} from "./garden-story";

/** The story section's inputs: one caller-supplied schedule plus its cursor. */
export interface StoryInputs {
  /** The residents the schedule starts from, as supplied. */
  residents: string[];
  /** The story-beat schedule, in schedule order, as supplied. */
  beats: StoryBeat[];
  /** The beat through which the schedule is applied, as supplied. */
  throughBeatId: string;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryInputs {
  /** The outing-attraction-spawn-composition bundle's inputs, as slice 54 takes them. */
  outingAttractionSpawnComposition: GardenOutingAttractionSpawnCompositionInputs;
  /** The story section's inputs. */
  story: StoryInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present. */
export interface GardenOutingAttractionSpawnCompositionStory {
  /** The outing-plus-attraction-plus-spawn-plus-composition bundle, exactly as slice 54 reports it. */
  outingAttractionSpawnComposition: GardenOutingAttractionSpawnComposition;
  /** The story reading, exactly as garden-story reports it, copied fresh. */
  story: StoryCompositionResult;
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
 * the story beats say about who is present:
 * outing-attraction-spawn-composition bundle + one story
 * reading, each exactly as its own read reports it, side by
 * side, with no merged story and no reconciliation between
 * their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStory(
  inputs: GardenOutingAttractionSpawnCompositionStoryInputs,
): GardenOutingAttractionSpawnCompositionStory {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnComposition === null ||
    typeof inputs.outingAttractionSpawnComposition !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: outingAttractionSpawnComposition inputs must be an object",
    );
  }
  if (inputs.story === null || typeof inputs.story !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: story inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.story.residents)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: story residents must be an array",
    );
  }
  if (!Array.isArray(inputs.story.beats)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: story beats must be an array",
    );
  }
  if (!isNonEmptyString(inputs.story.throughBeatId)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story: story throughBeatId must be a non-empty string",
    );
  }
  const outingAttractionSpawnComposition =
    gardenOutingAttractionSpawnComposition(
      inputs.outingAttractionSpawnComposition,
    );
  const storyResult = applyStoryBeats(
    inputs.story.residents,
    inputs.story.beats,
    inputs.story.throughBeatId,
  );
  return {
    outingAttractionSpawnComposition,
    story: {
      residents: [...storyResult.residents],
      arrived: [...storyResult.arrived],
      departed: [...storyResult.departed],
      appliedBeatIds: [...storyResult.appliedBeatIds],
    },
  };
}
