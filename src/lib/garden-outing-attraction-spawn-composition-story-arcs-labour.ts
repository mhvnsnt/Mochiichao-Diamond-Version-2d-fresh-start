/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * — one outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows
 * plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc
 * plus whether each caller-named Garden job runs or idles,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs
 *   (slice 56);
 * - one labour reading via garden-labour's labourStatuses plus
 *   its labourSummary, over caller-supplied jobs and a
 *   caller-supplied labour context (zone habitats, residents
 *   present, stocked zones).
 *
 * The labour section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, or composition values. In
 * particular it is NOT read off the bundle's habitats section
 * (a job's workplace is recognised only against the caller
 * context's zone habitats, never against a bundle habitat
 * reading), it is NOT read off the story or arcs sections'
 * residents (presence is the caller context's residentsPresent,
 * never a story resident list or an arc resident list), and it
 * is NOT read off any outing resident list: the jobs and the
 * context are caller-supplied, never taken from the bundle.
 * No order is invented between the bundle and the labour
 * section beyond each read's own order. A labour reading is a
 * summary this module never stores or registers in live play,
 * and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged labour and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs bundle and
 *   the labour section beyond each section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   labour section's facts are exactly what garden-labour
 *   reports over the caller-supplied jobs and context, and the
 *   bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcs reports
 *   over its own inputs;
 * - NO labour reading computed from a bundle value (above):
 *   jobs, zone habitats, residents present, and stocked zones
 *   are caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   a journey visit, an unlock evaluation, an individual
 *   summary, a teacher reading, a movement reading, an arrival
 *   reading, a research reading, a discovery candidate, a news
 *   item, an inbound reading, a migration, a story beat or arc
 *   inside the bundle, an attraction reading, a spawn
 *   annotation, a habitat reading, a composition reading, a
 *   story reading, or an arc reading;
 * - NO job tick, start, stop, or completion: a labour status
 *   says whether a job's conditions are met, it never runs a
 *   job, produces or consumes stock or output, or changes
 *   comfort, Garden Level, thanks-emission, or any save record;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, composition, or
 *   labour writer: a labour reading is a summary this module
 *   never stores or registers in live play, and no record is
 *   appended to any log here;
 * - NO job, resident, zone, habitat, recipe, or stock data
 *   authored for any resident or habitat (owner slots S1/S5 in
 *   the wiring plan, never filled here; all job ids, worker
 *   ids, zone ids, and recipe ids are caller-supplied);
 * - NO numeric effect of a labour status on tiers, richness,
 *   weights, stock, or spawn behaviour, and NO encounter,
 *   spawn, or route decision (whether a running job is ticked
 *   anywhere is a host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a labour reading is applied anywhere is a
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
  gardenOutingAttractionSpawnCompositionStoryArcs,
  type GardenOutingAttractionSpawnCompositionStoryArcs,
  type GardenOutingAttractionSpawnCompositionStoryArcsInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs";
import {
  labourStatuses,
  labourSummary,
  type GardenLabourJob,
  type GardenLabourStatus,
  type LabourContext,
  type LabourIdleReason,
} from "./garden-labour";

/** The labour section's inputs: caller-supplied jobs plus their caller-supplied context. */
export interface LabourInputs {
  /** The jobs whose conditions are read, in caller order, as supplied. */
  jobs: GardenLabourJob[];
  /** The labour context, as supplied: zone habitats, residents present, stocked zones. */
  context: LabourContext;
}

/** The labour section's report: every job's status plus its counts. */
export interface LabourReport {
  /** One status per job, in job order, exactly as garden-labour reports them, copied fresh. */
  statuses: GardenLabourStatus[];
  /** Counts for the status list: total, running, idle, and idle by reason. */
  summary: {
    total: number;
    running: number;
    idle: number;
    byReason: Record<LabourIdleReason, number>;
  };
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs {
  /** The outing-attraction-spawn-composition-story-arcs bundle's inputs, as slice 56 takes them. */
  outingAttractionSpawnCompositionStoryArcs: GardenOutingAttractionSpawnCompositionStoryArcsInputs;
  /** The labour section's inputs. */
  labour: LabourInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabour {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs bundle, exactly as slice 56 reports it. */
  outingAttractionSpawnCompositionStoryArcs: GardenOutingAttractionSpawnCompositionStoryArcs;
  /** The labour reading, exactly as garden-labour reports it, copied fresh. */
  labour: LabourReport;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat plus what
 * the story beats say about who is present plus what the arc
 * beats say about each resident's arc plus whether each
 * caller-named Garden job runs or idles:
 * outing-attraction-spawn-composition-story-arcs bundle + one
 * labour reading, each exactly as its own read reports it,
 * side by side, with no merged labour and no reconciliation
 * between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabour(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabour {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcs === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcs !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour: outingAttractionSpawnCompositionStoryArcs inputs must be an object",
    );
  }
  if (inputs.labour === null || typeof inputs.labour !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour: labour inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.labour.jobs)) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour: labour jobs must be an array",
    );
  }
  if (inputs.labour.context === null || typeof inputs.labour.context !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour: labour context must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcs =
    gardenOutingAttractionSpawnCompositionStoryArcs(
      inputs.outingAttractionSpawnCompositionStoryArcs,
    );
  const statuses = labourStatuses(inputs.labour.jobs, inputs.labour.context);
  const summary = labourSummary(statuses);
  return {
    outingAttractionSpawnCompositionStoryArcs,
    labour: {
      statuses: statuses.map((entry) => ({ ...entry })),
      summary: {
        total: summary.total,
        running: summary.running,
        idle: summary.idle,
        byReason: { ...summary.byReason },
      },
    },
  };
}
