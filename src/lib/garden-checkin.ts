/**
 * B3 §2.5 — the check-in beat, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: returning
 * to the Garden delivers *news* — a migration arrived, a released
 * partner was seen at the edge — never a chore list. Slice 27 already
 * gave the Garden's own motion as a bundle (garden-autonomous: the
 * migration, story, and arc reads side by side). This module is the
 * check-in beat itself: what a returning visitor learns in one read —
 * the news since the last check-in (garden-news, from the §2.8
 * doorway log) reported side by side with the Garden's autonomous
 * change (garden-autonomous), each exactly as its own read reports
 * it. It composes the two reads; it re-derives neither.
 *
 * The two sections are different lenses, not two halves of one
 * composition, and they are never merged or deduplicated: a creature
 * can appear in the news (a doorway fact since the last check-in)
 * and in the autonomous sections (a schedule/world-state effect) at
 * once, and both facts are reported. Which of them a host shows
 * first, and whether either changes anything in live play, is a
 * host decision this module does not make.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO ordering invented between news
 *   and autonomous change (above);
 * - NO "fell out" news: the news read's kind set is exactly the
 *   three movement-derivable kinds, inherited here, not extended;
 * - NO chore list, NO reward, NO names: news items are facts
 *   (who, what, when, where) with opaque caller ids, as the news
 *   read reports them;
 * - NO cursor storage: the caller keeps the last check-in stamp
 *   and the story/arc cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO Garden geography authored: homes and the edge are
 *   caller-supplied sets inside the news options (Owner Slot 5),
 *   never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values are
 *   opaque caller strings; the #102 range rule is the host's
 *   filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every section and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure the composed reads themselves raise (malformed
 * doorway records, a non-finite check-in stamp, malformed rules
 * or beats, duplicate rule/beat ids, an unknown cursor, a beat
 * naming one resident twice). Silent defaults are never invented:
 * a Garden with no news since the last check-in and no firing
 * rule or applied beat reads its inputs back unchanged, never a
 * fabricated change.
 */

import {
  autonomousChange,
  type AutonomousChange,
  type AutonomousChangeInputs,
} from "./garden-autonomous";
import {
  checkInNews,
  type CheckInNewsItem,
  type CheckInNewsOptions,
} from "./garden-news";
import type { MovementLog } from "./garden-movement";

/** The inputs one check-in bundle is composed from. */
export interface CheckInInputs {
  /** The §2.8 doorway log the news read runs over. */
  log: MovementLog;
  /** The news read's options: last check-in stamp, homes, edge. */
  news: CheckInNewsOptions;
  /** The autonomous-change bundle's inputs, as slice 27 takes them. */
  autonomous: AutonomousChangeInputs;
}

/** What a returning visitor learns, as its two reads report it. */
export interface GardenCheckIn {
  /** News since the last check-in, in stamp order. */
  news: CheckInNewsItem[];
  /** The Garden's own motion, as slice 27 reports it. */
  autonomous: AutonomousChange;
}

/**
 * One check-in bundle: news + autonomous change, each exactly as
 * its own read reports it, side by side, with no merged
 * composition and no order invented between them.
 */
export function gardenCheckIn(inputs: CheckInInputs): GardenCheckIn {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-checkin: inputs must be an object");
  }
  const news = checkInNews(inputs.log, inputs.news);
  const autonomous = autonomousChange(inputs.autonomous);
  return {
    news: news.map((item) => ({ ...item })),
    autonomous: {
      migration: {
        residents: [...autonomous.migration.residents],
        arrived: [...autonomous.migration.arrived],
        departed: [...autonomous.migration.departed],
        appliedRuleIds: [...autonomous.migration.appliedRuleIds],
      },
      story: {
        residents: [...autonomous.story.residents],
        arrived: [...autonomous.story.arrived],
        departed: [...autonomous.story.departed],
        appliedBeatIds: [...autonomous.story.appliedBeatIds],
      },
      arcs: {
        arcs: autonomous.arcs.arcs.map((entry) => ({ ...entry })),
        changed: [...autonomous.arcs.changed],
        appliedBeatIds: [...autonomous.arcs.appliedBeatIds],
      },
    },
  };
}
