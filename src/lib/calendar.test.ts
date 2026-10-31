// Gap-fill S12 slice 1 tests. All expected values are hand-computed
// from the rules in calendar.ts and the sources cited there — no value
// here comes from running the code first. Weekday values are INDICES
// only (CLOCK §5.3: fiction day names are canon, not filled here),
// so no test asserts a day name.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { useGameStore } from "../store/gameStore";
import {
  announcementsForDay,
  announcementsSince,
  publishAnnouncement,
  publishScheduleAnnouncements,
  scheduleAnnouncementId,
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

describe("announcement store section (S12 slice 2, through the real store)", () => {
  it("publishes through the store in order and skips the set on a no-op", () => {
    useGameStore.setState({ announcements: [] });
    const store = useGameStore.getState();
    store.publishAnnouncement(ann({ id: "a", dayIndex: 5 }));
    store.publishAnnouncement(ann({ id: "b", dayIndex: 7, kind: "town" }));
    expect(useGameStore.getState().announcements.map((a) => a.id)).toEqual(["a", "b"]);
    const before = useGameStore.getState().announcements;
    // Duplicate id: first wins, same reference, no set.
    useGameStore.getState().publishAnnouncement(ann({ id: "a", text: "Different text." }));
    expect(useGameStore.getState().announcements).toBe(before);
    expect(useGameStore.getState().announcements[0].text).toBe("Something happens.");
    // Invalid: same reference, no set.
    useGameStore.getState().publishAnnouncement(ann({ id: "", dayIndex: 9 }));
    useGameStore.getState().publishAnnouncement(ann({ id: "c", dayIndex: -1 }));
    expect(useGameStore.getState().announcements).toBe(before);
    expect(useGameStore.getState().announcements).toHaveLength(2);
  });
  it("the stored list feeds slice 1's reads with no stored derivation anywhere", () => {
    useGameStore.setState({ announcements: [] });
    const store = useGameStore.getState();
    store.publishAnnouncement(ann({ id: "a", dayIndex: 5 }));
    store.publishAnnouncement(ann({ id: "b", dayIndex: 7 }));
    store.publishAnnouncement(ann({ id: "c", dayIndex: 5 }));
    const list = useGameStore.getState().announcements;
    expect(announcementsForDay(list, 5).map((a) => a.id)).toEqual(["a", "c"]);
    expect(announcementsSince(list, 6).map((a) => a.id)).toEqual(["b"]);
    expect("announcementsForDay" in useGameStore.getState()).toBe(false);
  });
  it("announcements survive a save round-trip, and a partial load without them does not wipe them", () => {
    useGameStore.setState({ announcements: [] });
    useGameStore.getState().publishAnnouncement(ann({ id: "a", dayIndex: 5 }));
    const saved = JSON.parse(
      JSON.stringify({ announcements: useGameStore.getState().announcements }),
    );
    useGameStore.setState({ announcements: [] });
    useGameStore.getState().loadState(saved as never);
    expect(useGameStore.getState().announcements.map((a) => a.id)).toEqual(["a"]);
    useGameStore.getState().loadState({ wallet: 42 } as never);
    expect(useGameStore.getState().announcements.map((a) => a.id)).toEqual(["a"]);
  });
  it("an old save with no announcements field loads with the empty default", () => {
    useGameStore.setState({ announcements: [] });
    useGameStore.getState().loadState({ wallet: 42 } as never);
    expect(useGameStore.getState().announcements).toEqual([]);
  });
});

describe("publishScheduleAnnouncements (S12 slice 3, pure publisher)", () => {
  const textFor = (entry: ScheduleEntry) => `Happening at ${entry.place}.`;
  it("publishes matching rows in input order with derived ids and kind calendar", () => {
    const rows = [
      entry({ id: "a", weekday: 2 }),
      entry({ id: "b", weekday: 3 }),
      entry({ id: "c", gamePhase: "day" }),
    ];
    const out = publishScheduleAnnouncements([], rows, ctx(), 9, textFor);
    expect(out.map((a) => a.id)).toEqual(["schedule:a:9", "schedule:c:9"]);
    expect(out.map((a) => a.kind)).toEqual(["calendar", "calendar"]);
    expect(out.map((a) => a.dayIndex)).toEqual([9, 9]);
    expect(out[0].text).toBe("Happening at place-a.");
    expect(scheduleAnnouncementId(rows[0], 9)).toBe("schedule:a:9");
  });
  it("skips rows with no text, and a weather-demanding row with no caller weather", () => {
    const rows = [
      entry({ id: "notext", place: "place-b" }),
      entry({ id: "blank", place: "place-c" }),
      entry({ id: "misty", weatherKey: "mist", place: "place-d" }),
    ];
    const out = publishScheduleAnnouncements(
      [],
      rows,
      ctx(),
      9,
      (e) => (e.id === "notext" ? null : e.id === "blank" ? "   " : `At ${e.place}.`),
    );
    expect(out).toEqual([]);
  });
  it("re-running the same day is a same-reference no-op; a new day publishes again", () => {
    const rows = [entry({ id: "a", weekday: 2 })];
    const first = publishScheduleAnnouncements([], rows, ctx(), 9, textFor);
    expect(first).toHaveLength(1);
    expect(publishScheduleAnnouncements(first, rows, ctx(), 9, () => "Different text.")).toBe(first);
    expect(first[0].text).toBe("Happening at place-a."); // first wins
    const next = publishScheduleAnnouncements(first, rows, ctx(), 10, textFor);
    expect(next.map((a) => a.id)).toEqual(["schedule:a:9", "schedule:a:10"]);
  });
  it("a row matching only later in the day publishes on first match, not twice", () => {
    const rows = [entry({ id: "dusk-row", gamePhase: "dusk" })];
    const none = publishScheduleAnnouncements([], rows, ctx(), 9, textFor);
    expect(none).toEqual([]);
    const once = publishScheduleAnnouncements(none, rows, ctx({ gamePhase: "dusk" }), 9, textFor);
    expect(once.map((a) => a.id)).toEqual(["schedule:dusk-row:9"]);
    expect(publishScheduleAnnouncements(once, rows, ctx({ gamePhase: "dusk" }), 9, textFor)).toBe(once);
  });
  it("an invalid dayIndex publishes nothing and returns the same reference, without mutating the input", () => {
    const list: readonly Announcement[] = [ann()];
    const rows = [entry({ id: "a" })];
    expect(publishScheduleAnnouncements(list, rows, ctx(), -1, textFor)).toBe(list);
    expect(publishScheduleAnnouncements(list, rows, ctx(), 1.5, textFor)).toBe(list);
    expect(list).toHaveLength(1);
  });
});

describe("publishScheduleAnnouncements store method (S12 slice 3, through the real store)", () => {
  it("publishes through the store, skips the set on a same-day rerun, and publishes again the next day", () => {
    useGameStore.setState({ announcements: [] });
    const rows = [entry({ id: "a", weekday: 2 }), entry({ id: "b", weekday: 3 })];
    const textFor = (e: ScheduleEntry) => `Happening at ${e.place}.`;
    useGameStore.getState().publishScheduleAnnouncements(rows, ctx(), 9, textFor);
    expect(useGameStore.getState().announcements.map((a) => a.id)).toEqual(["schedule:a:9"]);
    const before = useGameStore.getState().announcements;
    useGameStore.getState().publishScheduleAnnouncements(rows, ctx(), 9, textFor);
    expect(useGameStore.getState().announcements).toBe(before);
    useGameStore.getState().publishScheduleAnnouncements(rows, ctx(), 10, textFor);
    expect(useGameStore.getState().announcements.map((a) => a.id)).toEqual([
      "schedule:a:9",
      "schedule:a:10",
    ]);
  });
});

describe("PauseMenu announcements section source lock (S12 slice 4)", () => {
  it("the section reads the store list through announcementsForDay and renders inside the pause panel, without adding a menu row", () => {
    const src = readFileSync(
      new URL("../components/game/GameShell.tsx", import.meta.url),
      "utf8",
    );
    expect(src).toContain("announcementsForDay");
    expect(src).toContain("deriveWorldState");
    expect(src).toContain("Announcements");
    expect(src).toContain("No announcements today.");
    expect(src).toContain("No announcements yet.");
    expect(src).toContain("<AnnouncementsSection />");
    // No new row: the pause rows record gains no announcements key.
    expect(src).not.toMatch(/announcements:\s*\{ label/);
    // The section reads the store list, not a new data file.
    expect(src).toContain("useGameStore(s => s.announcements)");
  });
  it("today-filtering is exactly announcementsForDay: other days never appear today", () => {
    const list: readonly Announcement[] = [
      { id: "schedule:a:9", dayIndex: 9, kind: "calendar", text: "Yesterday's row." },
      { id: "schedule:a:10", dayIndex: 10, kind: "calendar", text: "Today's row." },
    ];
    expect(announcementsForDay(list, 10).map((a) => a.text)).toEqual(["Today's row."]);
    expect(announcementsForDay(list, 11)).toEqual([]);
  });
});
