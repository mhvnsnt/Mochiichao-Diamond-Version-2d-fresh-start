/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound — one outing plus its Garden
 * news plus what its journey brings home, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-discovery-plus-news bundle from
 *   garden-outing-news (slice 48: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, one arrivals
 *   reading per caller-named arrival entry, one research
 *   reading per caller-named research entry, one discovery
 *   reading per caller-named discovery entry, and one news
 *   reading per caller-named news entry, each exactly as its
 *   own read reports it);
 * - one inbound reading per caller-named inbound entry, in
 *   caller order, via garden-inbound's inboundFromJourney, over
 *   each entry's OWN doorway log, caller-supplied Garden homes,
 *   caller-supplied species-to-care-axes mapping, and
 *   caller-supplied meeting list.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the inbound section is NOT computed from
 * the outing-news section's outing, bonds, decay, comfort, thanks,
 * level, record, check-in, snapshot, journey, unlock, individual,
 * teacher, movement, arrival, research, discovery, or news values
 * — a caller counts its own doorway log and hands this module
 * those inputs, exactly as garden-inbound requires — and the
 * outing-news section is NOT overwritten by any inbound reading.
 * A Garden can therefore read one fact in the outing-news section
 * and a different fact in an inbound reading over a different
 * log, and both facts are reported. An inbound reading never
 * changes an outing, a bond, a comfort day, a thanks signal, a
 * level summary, a bridge record, a check-in beat, a snapshot
 * lens, a journey visit, an unlock evaluation, an individual
 * summary, a teacher reading, a movement reading, an arrival
 * reading, a research reading, a discovery candidate, or a news
 * item in this module's hands, and an outing never sets an
 * inbound entry's log, homes, mapping, or meetings — each is a
 * read at the moment of the call, and the inputs each read
 * reports are returned unchanged. Which of them a host shows
 * first, and whether an arrival is housed or a taught axis
 * changes anything, is a host decision this module does not
 * make (garden-inbound's own notes: whether an arrival is
 * housed, and whether a taught axis changes anything, are host
 * decisions, not this read's).
 * The bundle itself carries no merged residents field, no
 * total-across-inbound field, no inbound level, score,
 * threshold, or ranking on any reading beyond the reads' own
 * rules, no honour or money inflow field, no currency, balance,
 * or spend, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-news section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-news bundle and the inbound section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   inbound section's facts are exactly what inboundFromJourney
 *   reports over each entry's own inputs, and the outing-news
 *   section's facts are exactly what gardenOutingNews reports
 *   over its own inputs;
 * - NO inbound reading computed from an outing-news value: the
 *   log, homes, mapping, and meetings are caller-supplied, never
 *   read off a bond list, a decay breakdown, a comfort day, a
 *   thanks intensity, a level summary, a bridge record, a
 *   check-in beat, a snapshot lens, a journey visit, an unlock
 *   evaluation, an individual summary, a teacher reading, a
 *   movement reading, an arrival reading, a research reading,
 *   a discovery candidate, or a news item;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, or inbound writer: an
 *   inbound reading is a summary this module never stores or
 *   unlocks with in live play, and no record is appended to
 *   any log here;
 * - NO manufactured-booster data (Owner Slot 1, inherited from
 *   garden-inbound, never filled here);
 * - NO honour or money inflow computed here (inherited from
 *   garden-inbound: both arrive as caller-held counts, not as
 *   reads over these inputs);
 * - NO host, NO store/view/save change, NO encounter/spawn/
 *   route behaviour, NO effect in live play: whether an arrival
 *   is housed, and whether a discovery candidate is actually
 *   met on a route, are host decisions, not this read's;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values
 *   are opaque caller strings; the #102 range rule is the
 *   host's filter);
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp and both cursors;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every entry and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure the composed reads themselves raise. Silent
 * defaults are never invented: an outing-news bundle with no
 * inbound entries, and an inbound entry with no arrivals and
 * no meetings, read empty lists, never a fabricated outing
 * with an inbound reading.
 */

import {
  gardenOutingNews,
  type GardenOutingNews,
  type GardenOutingNewsInputs,
} from "./garden-outing-news";
import {
  inboundFromJourney,
  type JourneyInbound,
  type JourneyInboundInputs,
} from "./garden-inbound";
import type { MovementLog } from "./garden-movement";

/** One caller-named inbound reading, over its own inputs. */
export interface InboundEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** That reading's own doorway log (see garden-inbound). */
  movementLog: MovementLog;
  /** That reading's own Garden homes (see garden-inbound). */
  gardenHomes: JourneyInboundInputs["gardenHomes"];
  /** That reading's own species-to-care-axes mapping (see garden-inbound). */
  teacherMapping: JourneyInboundInputs["teacherMapping"];
  /** That reading's own meeting list (see garden-inbound). */
  meetings: JourneyInboundInputs["meetings"];
}

/** The inputs one outing-plus-news-plus-inbound bundle is composed from. */
export interface GardenOutingInboundInputs {
  /** The outing-news bundle's inputs, as slice 48 takes them. */
  outingNews: GardenOutingNewsInputs;
  /** The inbound section's inputs: one entry per reading, in caller order. */
  inbound: {
    entries: readonly InboundEntry[];
  };
}

/** One inbound entry's reading, copied fresh. */
export interface InboundReading {
  /** The entry's id, as supplied. */
  id: string;
  /**
   * The arrived creatures, exactly as garden-inbound reports
   * them, copied fresh, in first-arrival order.
   */
  arrivals: JourneyInbound["arrivals"];
  /**
   * The met species that teach, exactly as garden-inbound
   * reports them, copied fresh, in first-met order.
   */
  teachers: JourneyInbound["teachers"];
  /**
   * The union of taught axes, exactly as garden-inbound
   * reports it, copied fresh, in first-appearance order.
   */
  taughtAxes: JourneyInbound["taughtAxes"];
}

/** One outing plus its Garden news plus what its journey brings home. */
export interface GardenOutingInbound {
  /** The outing-plus-discovery-plus-news bundle, exactly as slice 48 reports it. */
  outingNews: GardenOutingNews;
  /** One inbound reading per caller-named inbound entry, in caller order. */
  inbound: InboundReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home: outing-news bundle + per-entry inbound readings, each
 * exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their
 * pictures.
 */
export function gardenOutingInbound(
  inputs: GardenOutingInboundInputs,
): GardenOutingInbound {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-inbound: inputs must be an object");
  }
  if (
    inputs.outingNews === null ||
    typeof inputs.outingNews !== "object"
  ) {
    throw new Error(
      "garden-outing-inbound: outingNews inputs must be an object",
    );
  }
  if (inputs.inbound === null || typeof inputs.inbound !== "object") {
    throw new Error("garden-outing-inbound: inbound inputs must be an object");
  }
  if (!Array.isArray(inputs.inbound.entries)) {
    throw new Error("garden-outing-inbound: inbound entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.inbound.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-inbound: inbound entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-inbound: inbound entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-inbound: duplicate inbound entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.movementLog)) {
      throw new Error(
        "garden-outing-inbound: inbound entry movementLog must be an array",
      );
    }
  }
  const outingNews = gardenOutingNews(inputs.outingNews);
  const inbound: InboundReading[] = inputs.inbound.entries.map((entry) => {
    const reading = inboundFromJourney({
      movementLog: entry.movementLog,
      gardenHomes: entry.gardenHomes,
      teacherMapping: entry.teacherMapping,
      meetings: entry.meetings,
    });
    return {
      id: entry.id,
      arrivals: reading.arrivals.map((arrival) => ({ ...arrival })),
      teachers: reading.teachers.map((teacher) => ({
        ...teacher,
        axes: [...teacher.axes],
      })),
      taughtAxes: [...reading.taughtAxes],
    };
  });
  return { outingNews, inbound };
}
