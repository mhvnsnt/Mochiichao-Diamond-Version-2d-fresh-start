/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news — one outing plus its per-species research
 * readings plus its Garden-edge discovery candidates plus its
 * Garden news since a check-in, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-research-plus-discovery bundle from
 *   garden-outing-discovery (slice 47: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, one arrivals
 *   reading per caller-named arrival entry, one research
 *   reading per caller-named research entry, and one discovery
 *   reading per caller-named discovery entry, each exactly as its
 *   own read reports it);
 * - one news reading per caller-named news entry, in caller
 *   order, via garden-news's checkInNews, over each entry's OWN
 *   doorway log, caller-supplied last check-in stamp, and
 *   optional caller-supplied Garden homes and Garden-edge
 *   places.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the news section is NOT computed from
 * the outing-discovery section's outing, bonds, decay, comfort,
 * thanks, level, record, check-in, snapshot, journey, unlock,
 * individual, teacher, movement, arrival, research, or discovery
 * values — a caller counts its own doorway log and hands this
 * module those inputs, exactly as garden-news requires — and the
 * outing-discovery section is NOT overwritten by any news item.
 * A Garden can therefore read one fact in the outing-discovery
 * section and a different fact in a news reading over a different
 * log, and both facts are reported. A news item never changes an
 * outing, a bond, a comfort day, a thanks signal, a level
 * summary, a bridge record, a check-in beat, a snapshot lens, a
 * journey visit, an unlock evaluation, an individual summary, a
 * teacher reading, a movement reading, an arrival reading, a
 * research reading, or a discovery candidate in this module's
 * hands, and an outing never sets a news entry's log, stamp,
 * homes, or edge — each is a read at the moment of the call, and
 * the inputs each read reports are returned unchanged. Which of
 * them a host shows first, and whether a news item becomes a
 * chore, a task, or a payout, is a host decision this module
 * does not make (garden-news's own notes: a news item is a fact,
 * never a task or a payout).
 * The bundle itself carries no merged residents field, no
 * total-across-news field, no news level, score, threshold, or
 * ranking on any item beyond the reads' own rules, no currency,
 * balance, or spend, and no named rite or bell-equivalent object
 * (the gathering beat stays inside the outing-discovery section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-discovery bundle and the news section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   news section's facts are exactly what checkInNews reports
 *   over each entry's own inputs, and the outing-discovery
 *   section's facts are exactly what gardenOutingDiscovery
 *   reports over its own inputs;
 * - NO news item computed from an outing-discovery value: the
 *   log, stamp, homes, and edge are caller-supplied, never read
 *   off a bond list, a decay breakdown, a comfort day, a thanks
 *   intensity, a level summary, a bridge record, a check-in
 *   beat, a snapshot lens, a journey visit, an unlock
 *   evaluation, an individual summary, a teacher reading, a
 *   movement reading, an arrival reading, a research reading,
 *   or a discovery candidate;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, or news writer: a news item
 *   is a summary this module never stores or unlocks with in
 *   live play, and no record is appended to any log here;
 * - NO "fell out" news and NO keeper-to-keeper news: the kind
 *   set is inherited from garden-news, never extended (a gift,
 *   trade, or transfer movement is not Garden news);
 * - NO host, NO store/view/save change, NO encounter/spawn/
 *   route behaviour, NO effect in live play: whether a news
 *   item is shown, and whether a discovery candidate is
 *   actually met on a route, are host decisions, not this
 *   read's;
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
 * defaults are never invented: an outing-discovery bundle with
 * no discovery entries, and a news entry with no qualifying
 * movements, read empty lists, never a fabricated outing with
 * a news item.
 */

import {
  gardenOutingDiscovery,
  type GardenOutingDiscovery,
  type GardenOutingDiscoveryInputs,
} from "./garden-outing-discovery";
import {
  checkInNews,
  type CheckInNewsItem,
  type CheckInNewsOptions,
} from "./garden-news";
import type { MovementLog } from "./garden-movement";

/** One caller-named news reading, over its own inputs. */
export interface NewsEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** That reading's own doorway log (see garden-news). */
  log: MovementLog;
  /** That reading's own last check-in stamp (see garden-news). */
  since: CheckInNewsOptions["since"];
  /** That reading's own optional Garden homes (see garden-news). */
  gardenHomes?: CheckInNewsOptions["gardenHomes"];
  /** That reading's own optional Garden-edge places (see garden-news). */
  gardenEdge?: CheckInNewsOptions["gardenEdge"];
}

/** The inputs one outing-plus-discovery-plus-news bundle is composed from. */
export interface GardenOutingNewsInputs {
  /** The outing-discovery bundle's inputs, as slice 47 takes them. */
  outingDiscovery: GardenOutingDiscoveryInputs;
  /** The news section's inputs: one entry per reading, in caller order. */
  news: {
    entries: readonly NewsEntry[];
  };
}

/** One news entry's reading, copied fresh. */
export interface NewsReading {
  /** The entry's id, as supplied. */
  id: string;
  /**
   * The Garden-composition changes since the entry's check-in
   * stamp, exactly as garden-news reports them, copied fresh,
   * in stamp order.
   */
  items: CheckInNewsItem[];
}

/** One outing plus its discovery candidates plus its Garden news. */
export interface GardenOutingNews {
  /** The outing-plus-research-plus-discovery bundle, exactly as slice 47 reports it. */
  outingDiscovery: GardenOutingDiscovery;
  /** One news reading per caller-named news entry, in caller order. */
  news: NewsReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its discovery candidates plus its Garden news:
 * outing-discovery bundle + per-entry news readings, each exactly
 * as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingNews(
  inputs: GardenOutingNewsInputs,
): GardenOutingNews {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-news: inputs must be an object");
  }
  if (
    inputs.outingDiscovery === null ||
    typeof inputs.outingDiscovery !== "object"
  ) {
    throw new Error(
      "garden-outing-news: outingDiscovery inputs must be an object",
    );
  }
  if (inputs.news === null || typeof inputs.news !== "object") {
    throw new Error("garden-outing-news: news inputs must be an object");
  }
  if (!Array.isArray(inputs.news.entries)) {
    throw new Error("garden-outing-news: news entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.news.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-news: news entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-news: news entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-news: duplicate news entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.log)) {
      throw new Error("garden-outing-news: news entry log must be an array");
    }
  }
  const outingDiscovery = gardenOutingDiscovery(inputs.outingDiscovery);
  const news: NewsReading[] = inputs.news.entries.map((entry) => ({
    id: entry.id,
    items: checkInNews(entry.log, {
      since: entry.since,
      gardenHomes: entry.gardenHomes,
      gardenEdge: entry.gardenEdge,
    }).map((item) => ({ ...item })),
  }));
  return { outingDiscovery, news };
}
