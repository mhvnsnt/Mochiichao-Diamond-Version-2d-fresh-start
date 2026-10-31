/**
 * Weekly calendar + announcement module — S12 slice 1, pure library.
 *
 * Gap-fill S12 (GAP-FILL-PLAN master sequence: weekly calendar +
 * announcement module + schedules data; G-17). This slice is the
 * library only, on the S10 slice-1 / S11 slice-1 pattern: seat first,
 * host and content next. Deliberately NOT here: NO gameStore section,
 * NO view/menu reader, NO schedules data file, NO ink adoption.
 *
 * Sources, stated so no landing drifts:
 * - The clock it reads is S1's WorldState (src/lib/worldClock.ts):
 *   weekday is a 0-based INDEX (Gen 2 day-counter weekday, day mod 7;
 *   worldClock's default config has daysPerWeek 7, epochWeekday 0),
 *   gamePhase is the S1 four-bucket fold (dawn/day/dusk/night),
 *   season is the S1 derivation. This module takes those values as
 *   given; it does not re-derive time.
 * - The schedule shape is GAP-FILL-PLAN G-17 / CLOCK-FROM-POKEMON
 *   §7 rows 7–8: calendar rows are (weekday, window, place, kind)
 *   authored data, and Persona-pattern availability cells are
 *   (weekday x slot x weather x story-flag) read against the
 *   producer. Here the "window"/"slot" is gamePhase, and "kind" is
 *   carried by the caller, not by this module.
 * - Weather is NOT produced by the world clock (worldClock's header:
 *   "Weather is deliberately ABSENT from the output"), so a schedule
 *   row that demands weather can only match when the CALLER supplies
 *   the current weather key. A demanding row with no caller weather
 *   never matches — it is not silently treated as "any weather".
 *
 * What is NOT authored here, on purpose:
 * - Weekday NAMES. CLOCK-FROM-POKEMON §5.3 records the week shape
 *   (seven days, 0 = Sunday) as the default candidate but states
 *   the fiction's day names are canon and are NOT filled there.
 *   This module therefore keys on the weekday INDEX only and names
 *   no days. A display-name table is owner content for a later slice.
 * - Schedule ROWS. A row's place is a caller-supplied id string and
 *   its storyFlag is a caller-supplied flag string; no place, NPC,
 *   fixture, or story flag is invented here, so there is no data
 *   file in this slice for a host to misread as content.
 * - Announcement TEXT. The announcement type carries text, but this
 *   slice publishes no announcements of its own; publishers (the
 *   calendar, later the ecology branches per G-17) supply them.
 *
 * Cleaning rules (the research.ts pattern): an invalid entry never
 * matches, and an invalid or duplicate announcement is a no-op that
 * returns the SAME list reference, so a caller can tell "nothing
 * happened" from "a new announcement exists" by reference.
 */

import type { GamePhase, Season } from "./worldClock";

/** A weekly-calendar / availability row. Every condition field that
 *  is null means "any" for that dimension; a set field must match. */
export interface ScheduleEntry {
  /** Stable row id. Empty (or whitespace-only) ids never match. */
  id: string;
  /** 0-based weekday index, or null for any day. Must satisfy
   *  0 <= weekday < daysPerWeek (default 7) to ever match. */
  weekday: number | null;
  /** S1 day-part bucket, or null for any part of the day. */
  gamePhase: GamePhase | null;
  /** S1 season, or null for any season. */
  season: Season | null;
  /** Story flag that must be set, or null for any story state. */
  storyFlag: string | null;
  /** Weather key that must equal the caller's weather, or null for
   *  any weather. The clock supplies no weather; see header. */
  weatherKey: string | null;
  /** Caller-supplied place id this row points at. Empty (or
   *  whitespace-only) places never match. No place names are
   *  authored here. */
  place: string;
}

/** Everything scheduleMatches needs, supplied by the host. The host
 *  owns the clock reading and the weather resolution; this module
 *  only compares. */
export interface CalendarContext {
  weekday: number;
  gamePhase: GamePhase;
  season: Season;
  /** Set flags, as a Set or an array — either shape is accepted. */
  storyFlags: ReadonlySet<string> | readonly string[];
  /** Current weather key, or null/undefined when the host has none
   *  to report. A weather-demanding row never matches without one. */
  weatherKey?: string | null;
  /** Week length the weekday index is read against. Defaults to 7
   *  (worldClock's default); a non-integer or non-positive value
   *  falls back to 7 rather than matching nothing everywhere. */
  daysPerWeek?: number;
}

function daysPerWeekOf(ctx: CalendarContext): number {
  const d = ctx.daysPerWeek;
  return Number.isInteger(d) && (d as number) > 0 ? (d as number) : 7;
}

function hasFlag(
  flags: ReadonlySet<string> | readonly string[],
  flag: string,
): boolean {
  // Dispatch on the method, not Array.isArray: a ReadonlySet is not
  // narrowed out of the union by the array check under tsc.
  const candidate = flags as { has?: unknown };
  if (typeof candidate.has === "function") {
    return (flags as ReadonlySet<string>).has(flag);
  }
  return (flags as readonly string[]).includes(flag);
}

/** True when every set condition on the entry matches the context.
 *  Invalid entries (empty id/place, weekday outside the week) are
 *  never a match, however the rest of the row reads. */
export function scheduleMatches(
  entry: ScheduleEntry,
  ctx: CalendarContext,
): boolean {
  if (entry.id.trim() === "" || entry.place.trim() === "") return false;
  if (entry.weekday !== null) {
    const w = entry.weekday;
    if (!Number.isInteger(w) || w < 0 || w >= daysPerWeekOf(ctx)) return false;
    if (w !== ctx.weekday) return false;
  }
  if (entry.gamePhase !== null && entry.gamePhase !== ctx.gamePhase) {
    return false;
  }
  if (entry.season !== null && entry.season !== ctx.season) return false;
  if (entry.storyFlag !== null && !hasFlag(ctx.storyFlags, entry.storyFlag)) {
    return false;
  }
  if (entry.weatherKey !== null && entry.weatherKey !== ctx.weatherKey) {
    return false;
  }
  return true;
}

/** All matching rows, in input order. The input list is not mutated
 *  and no row is reordered: ordering is the data author's job. */
export function schedulesForState(
  entries: readonly ScheduleEntry[],
  ctx: CalendarContext,
): ScheduleEntry[] {
  return entries.filter((entry) => scheduleMatches(entry, ctx));
}

/** One published announcement. `dayIndex` is the S1 clock's day
 *  count (days since the save's game epoch); `kind` lets readers
 *  group announcements (calendar, ecology, town word) without this
 *  module owning any kind vocabulary. */
export interface Announcement {
  /** Stable id; publishing a second announcement with an id already
   *  in the list is a no-op (first wins, as in the S6 evolution
   *  queue's queue-once rule). */
  id: string;
  /** Day the announcement was published on. Negative or
   *  non-integer day counts are invalid. */
  dayIndex: number;
  kind: string;
  text: string;
}

function isValidAnnouncement(ann: Announcement): boolean {
  return (
    ann.id.trim() !== "" &&
    ann.kind.trim() !== "" &&
    ann.text.trim() !== "" &&
    Number.isInteger(ann.dayIndex) &&
    ann.dayIndex >= 0
  );
}

/**
 * Publish one announcement. Returns a NEW list with the announcement
 * appended, or the SAME list reference when nothing was published:
 * an invalid announcement, or an id already present. The input list
 * is never mutated.
 */
export function publishAnnouncement(
  list: readonly Announcement[],
  ann: Announcement,
): readonly Announcement[] {
  if (!isValidAnnouncement(ann)) return list;
  if (list.some((existing) => existing.id === ann.id)) return list;
  return [...list, ann];
}

/** Announcements published on exactly this day, in input order. An
 *  invalid day argument reads nothing. */
export function announcementsForDay(
  list: readonly Announcement[],
  dayIndex: number,
): Announcement[] {
  if (!Number.isInteger(dayIndex) || dayIndex < 0) return [];
  return list.filter((ann) => ann.dayIndex === dayIndex);
}

/** Announcements published on or after this day, in input order. An
 *  invalid day argument reads nothing. */
export function announcementsSince(
  list: readonly Announcement[],
  dayIndex: number,
): Announcement[] {
  if (!Number.isInteger(dayIndex) || dayIndex < 0) return [];
  return list.filter((ann) => ann.dayIndex >= dayIndex);
}
