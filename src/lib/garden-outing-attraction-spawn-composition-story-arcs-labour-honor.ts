/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour
 * — one outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows
 * plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc
 * plus whether each caller-named Garden job runs or idles
 * plus what the caller-supplied honour sources add up to,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour
 *   (slice 57);
 * - one honour reading via garden-honor's honorAccount, over
 *   caller-supplied honour sources.
 *
 * The honour section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, composition, or labour
 * values. In particular it is NOT read off the bundle's
 * labour statuses (a running job contributes no honour here),
 * NOT read off any thanks intensity or level summary, and
 * NOT read off any story or arc beat: the sources are
 * caller-supplied, never taken from the bundle. No order is
 * invented between the bundle and the honour section beyond
 * each read's own order. An honour reading is a summary this
 * module never stores or registers in live play, and no
 * record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged honour and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour
 *   bundle and the honour section beyond each section's own
 *   order;
 * - NO reconciliation of the two sections' pictures: the
 *   honour section's facts are exactly what garden-honor
 *   reports over the caller-supplied sources, and the
 *   bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabour
 *   reports over its own inputs;
 * - NO honour reading computed from a bundle value (above):
 *   sources are caller-supplied, never read off a bond list,
 *   a decay breakdown, a comfort day, a thanks intensity, a
 *   level summary, a bridge record, a check-in beat, a
 *   snapshot lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement
 *   reading, an arrival reading, a research reading, a
 *   discovery candidate, a news item, an inbound reading, a
 *   migration, a story beat or arc inside the bundle, an
 *   attraction reading, a spawn annotation, a habitat
 *   reading, a composition reading, a story reading, an arc
 *   reading, or a labour status;
 * - NO honour inflow into the Garden, NO spend, NO payment,
 *   and NO balance: the honour section re-reads the caller's
 *   own source list into a total and per-source entries; it
 *   never adds honour to any Garden record, never pays or
 *   charges anything, and never changes comfort, Garden
 *   Level, thanks-emission, or any save record;
 * - NO honour writer: an honour reading is a summary this
 *   module never stores or registers in live play, and no
 *   record is appended to any log here;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, composition,
 *   labour, or honour writer;
 * - NO job, resident, zone, habitat, recipe, stock, or
 *   honour-source data authored for any resident or habitat
 *   (owner slots S1/S5 in the wiring plan, never filled here;
 *   all source ids are caller-supplied);
 * - NO numeric effect of an honour total on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether an honour account is
 *   consulted anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether an honour reading is applied anywhere is a
 *   host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
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
  gardenOutingAttractionSpawnCompositionStoryArcsLabour,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabour,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour";
import {
  honorAccount,
  type HonorAccount,
  type HonorSource,
} from "./garden-honor";

/** The honour section's inputs: caller-supplied honour sources. */
export interface HonorInputs {
  /** The sources whose counts are added up, in caller order, as supplied. */
  sources: HonorSource[];
}

/** The honour section's report: the whole account, exactly as garden-honor reports it, copied fresh. */
export interface HonorReport {
  /** The sum over every source; 0 for an empty account. */
  total: number;
  /** One entry per source, in caller order, copied fresh. */
  entries: { sourceId: string; count: number }[];
  /** Number of sources feeding the account. */
  sourceCount: number;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour bundle's inputs, as slice 57 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabour: GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs;
  /** The honour section's inputs. */
  honor: HonorInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonor {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour bundle, exactly as slice 57 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabour: GardenOutingAttractionSpawnCompositionStoryArcsLabour;
  /** The honour reading, exactly as garden-honor reports it, copied fresh. */
  honor: HonorReport;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat plus what
 * the story beats say about who is present plus what the arc
 * beats say about each resident's arc plus whether each
 * caller-named Garden job runs or idles plus what the
 * caller-supplied honour sources add up to:
 * outing-attraction-spawn-composition-story-arcs-labour bundle
 * + one honour reading, each exactly as its own read reports
 * it, side by side, with no merged honour and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonor {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabour === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabour !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor: outingAttractionSpawnCompositionStoryArcsLabour inputs must be an object",
    );
  }
  if (inputs.honor === null || typeof inputs.honor !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor: honor inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.honor.sources)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor: honor sources must be an array",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabour =
    gardenOutingAttractionSpawnCompositionStoryArcsLabour(
      inputs.outingAttractionSpawnCompositionStoryArcsLabour,
    );
  const account: HonorAccount = honorAccount(inputs.honor.sources);
  return {
    outingAttractionSpawnCompositionStoryArcsLabour,
    honor: {
      total: account.total,
      entries: account.entries.map((entry) => ({ ...entry })),
      sourceCount: account.sourceCount,
    },
  };
}
