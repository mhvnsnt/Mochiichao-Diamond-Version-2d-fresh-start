// Gap-fill S12 slice 1 tests. All expected values are hand-computed
// from the rules in calendar.ts and the sources cited there — no value
// here comes from running the code first. Weekday values are INDICES
// only (CLOCK §5.3: fiction day names are canon, not filled here),
// so no test asserts a day name.
import { describe, expect, it } from "vitest";
import {
  announcementsForDay,
  announcementsSince,
  publishAnnouncement,
  scheduleMatches,
  schedulesForState,
  type Announcement,
  type CalendarContext,
  type ScheduleEntry,
} from "./calendar";

const ctx = (over: Partial<CalendarContext> = {}): CalendarContext => ({
  weekday: 2,
  gamePhase: "day",
  season: "spring",
  storyFlags: [],
  weatherKey: null,
  ...over,
});

const entry = (over: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  id: "row-1",
  weekday: null,
  gamePhase: null,
  season: null,
  storyFlag: null,
  weatherKey: null,
  place: "place-a",
  ...over,
});

describe("scheduleMatches (S12 slice 1)", () => {
  it("an all-null row matches any context", () => {
    expect(scheduleMatches(entry(), ctx())).toBe(true);
    expect(
      scheduleMatches(entry(), ctx({ weekday: 6, gamePhase: "night", season: "winter", weatherKey: "mist" })),
    ).toBe(true);
  });
  it("weekday must equal the context weekday", () => {
    expect(scheduleMatches(entry({ weekday: 2 }), ctx())).toBe(true);
    expect(scheduleMatches(entry({ weekday: 3 }), ctx())).toBe(false);
  });
  it("a weekday outside the week never matches", () => {
    expect(scheduleMatches(entry({ weekday: 7 }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ weekday: -1 }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ weekday: 1.5 }), ctx())).toBe(false);
    // A 5-day week (non-default daysPerWeek) narrows the same way.
    expect(scheduleMatches(entry({ weekday: 5 }), ctx({ daysPerWeek: 5 }))).toBe(false);
    expect(scheduleMatches(entry({ weekday: 4 }), ctx({ weekday: 4, daysPerWeek: 5 }))).toBe(true);
  });
  it("gamePhase and season must match when set", () => {
    expect(scheduleMatches(entry({ gamePhase: "day" }), ctx())).toBe(true);
    expect(scheduleMatches(entry({ gamePhase: "dusk" }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ season: "spring" }), ctx())).toBe(true);
    expect(scheduleMatches(entry({ season: "autumn" }), ctx())).toBe(false);
  });
  it("a story flag must be set when demanded, and is ignored when null", () => {
    expect(scheduleMatches(entry({ storyFlag: "dojo-1-done" }), ctx())).toBe(false);
    expect(
      scheduleMatches(entry({ storyFlag: "dojo-1-done" }), ctx({ storyFlags: ["dojo-1-done"] })),
    ).toBe(true);
    expect(
      scheduleMatches(entry({ storyFlag: "dojo-1-done" }), ctx({ storyFlags: new Set(["dojo-1-done"]) })),
    ).toBe(true);
    expect(scheduleMatches(entry({ storyFlag: null }), ctx({ storyFlags: [] }))).toBe(true);
  });
  it("a weather-demanding row needs the caller's weather to equal it", () => {
    expect(scheduleMatches(entry({ weatherKey: "mist" }), ctx({ weatherKey: "mist" }))).toBe(true);
    expect(scheduleMatches(entry({ weatherKey: "mist" }), ctx({ weatherKey: "clear" }))).toBe(false);
    // No caller weather: a demanding row never matches (not "any").
    expect(scheduleMatches(entry({ weatherKey: "mist" }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ weatherKey: "mist" }), ctx({ weatherKey: undefined }))).toBe(false);
    // A null-weather row matches whatever the caller reports, incl. none.
    expect(scheduleMatches(entry({ weatherKey: null }), ctx({ weatherKey: "mist" }))).toBe(true);
    expect(scheduleMatches(entry({ weatherKey: null }), ctx())).toBe(true);
  });
  it("empty id or place never matches", () => {
    expect(scheduleMatches(entry({ id: "" }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ id: "   " }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ place: "" }), ctx())).toBe(false);
    expect(scheduleMatches(entry({ place: "  " }), ctx())).toBe(false);
  });
});

describe("schedulesForState (S12 slice 1)", () => {
  it("returns matching rows in input order, skipping non-matches", () => {
    const rows = [
      entry({ id: "a", weekday: 2 }),
      entry({ id: "b", weekday: 3 }),
      entry({ id: "c", gamePhase: "day" }),
      entry({ id: "d", season: "winter" }),
    ];
    expect(schedulesForState(rows, ctx()).map((r) => r.id)).toEqual(["a", "c"]);
    expect(rows).toHaveLength(4); // input not mutated
  });
});

const ann = (over: Partial<Announcement> = {}): Announcement => ({
  id: "ann-1",
  dayIndex: 5,
  kind: "calendar",
  text: "Something happens.",
  ...over,
});

describe("publishAnnouncement (S12 slice 1)", () => {
  it("appends a valid announcement without mutating the input", () => {
    const list: readonly Announcement[] = [];
    const out = publishAnnouncement(list, ann());
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("ann-1");
    expect(out[0].dayIndex).toBe(5);
    expect(list).toHaveLength(0);
  });
  it("a duplicate id is a no-op returning the same reference", () => {
    const list = [ann()];
    expect(publishAnnouncement(list, ann({ text: "Different text." }))).toBe(list);
    expect(list[0].text).toBe("Something happens."); // first wins
  });
  it("invalid announcements are no-ops returning the same reference", () => {
    const list = [ann()];
    expect(publishAnnouncement(list, ann({ id: "" }))).toBe(list);
    expect(publishAnnouncement(list, ann({ dayIndex: -1 }))).toBe(list);
    expect(publishAnnouncement(list, ann({ dayIndex: 1.5 }))).toBe(list);
    expect(publishAnnouncement(list, ann({ dayIndex: Number.NaN }))).toBe(list);
    expect(publishAnnouncement(list, ann({ text: "   " }))).toBe(list);
    expect(publishAnnouncement(list, ann({ kind: "" }))).toBe(list);
    expect(list).toHaveLength(1);
  });
});

describe("announcement reads (S12 slice 1)", () => {
  const list = [ann({ id: "a", dayIndex: 5 }), ann({ id: "b", dayIndex: 7 }), ann({ id: "c", dayIndex: 5 })];
  it("announcementsForDay reads exactly that day, in order", () => {
    expect(announcementsForDay(list, 5).map((a) => a.id)).toEqual(["a", "c"]);
    expect(announcementsForDay(list, 6)).toEqual([]);
    expect(announcementsForDay(list, -1)).toEqual([]);
  });
  it("announcementsSince is inclusive of the given day", () => {
    expect(announcementsSince(list, 6).map((a) => a.id)).toEqual(["b"]);
    expect(announcementsSince(list, 5).map((a) => a.id)).toEqual(["a", "b", "c"]);
    expect(announcementsSince(list, 8)).toEqual([]);
  });
});
