// Gap-fill S12 slice 1 tests. All expected values are hand-computed
// from the rules in calendar.ts and the sources cited there — no value
// here comes from running the code first. Weekday values are INDICES
// only (CLOCK §5.3: fiction day names are canon, not filled here),
// so no test asserts a day name.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { useGameStore } from "../store/gameStore";
import { deriveWorldState, newGameAnchor } from "./worldClock";
import {
  announcementsBefore,
  announcementsForDay,
  announcementsSince,
  calendarContextFromWorldState,
  publishAnnouncement,
  publishScheduleAnnouncements,
  publishSchedulesForWorldState,
  scheduleAnnouncementId,
  scheduleMatches,
  schedulesForState,
  schedulesForWorldState,
  type Announcement,
  type CalendarContext,
  type ScheduleEntry,
  type WorldClockReading,
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
  it("announcementsBefore (S12 slice 5) reads strictly earlier days, in order, excluding today", () => {
    expect(announcementsBefore(list, 6).map((a) => a.id)).toEqual(["a", "c"]);
    expect(announcementsBefore(list, 5)).toEqual([]);
    expect(announcementsBefore(list, 8).map((a) => a.id)).toEqual(["a", "b", "c"]);
    expect(announcementsBefore(list, 0)).toEqual([]);
  });
  it("announcementsBefore reads nothing on an invalid day", () => {
    expect(announcementsBefore(list, -1)).toEqual([]);
    expect(announcementsBefore(list, 5.5)).toEqual([]);
    expect(announcementsBefore(list, Number.NaN)).toEqual([]);
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

describe("PauseMenu history reader source lock (S12 slice 5)", () => {
  it("the section reads earlier announcements through announcementsBefore under an Earlier heading", () => {
    const src = readFileSync(
      new URL("../components/game/GameShell.tsx", import.meta.url),
      "utf8",
    );
    expect(src).toContain("announcementsBefore");
    expect(src).toContain("Earlier");
    // Earlier renders only when earlier announcements exist.
    expect(src).toContain("earlier.length > 0");
    // Today's section is untouched by the history addition.
    expect(src).toContain("announcementsForDay");
    expect(src).toContain("No announcements today.");
  });
  it("history is the strict before-read, not the since-read", () => {
    const list: readonly Announcement[] = [
      { id: "old", dayIndex: 9, kind: "calendar", text: "Yesterday's row." },
      { id: "today", dayIndex: 10, kind: "calendar", text: "Today's row." },
      { id: "future", dayIndex: 11, kind: "calendar", text: "Tomorrow's row." },
    ];
    expect(announcementsBefore(list, 10).map((a) => a.text)).toEqual(["Yesterday's row."]);
    expect(announcementsSince(list, 10).map((a) => a.text)).toEqual(["Today's row.", "Tomorrow's row."]);
  });
});

describe("calendar host context (S12 slice 7, pure adapter)", () => {
  const reading = (over: Partial<WorldClockReading> = {}): WorldClockReading => ({
    weekday: 3,
    gamePhase: "dusk",
    season: "autumn",
    ...over,
  });
  it("carries weekday, gamePhase and season straight from the clock reading, with empty flags, no weather, and a 7-day week by default", () => {
    expect(calendarContextFromWorldState(reading())).toEqual({
      weekday: 3,
      gamePhase: "dusk",
      season: "autumn",
      storyFlags: [],
      weatherKey: null,
      daysPerWeek: 7,
    });
  });
  it("passes caller story flags (Set or array), weather, and week length through unchanged", () => {
    expect(
      calendarContextFromWorldState(reading(), {
        storyFlags: new Set(["flag-x"]),
        weatherKey: "rain",
        daysPerWeek: 5,
      }),
    ).toEqual({
      weekday: 3,
      gamePhase: "dusk",
      season: "autumn",
      storyFlags: new Set(["flag-x"]),
      weatherKey: "rain",
      daysPerWeek: 5,
    });
    expect(
      calendarContextFromWorldState(reading(), { storyFlags: ["flag-y"] }).storyFlags,
    ).toEqual(["flag-y"]);
  });
  it("does not re-derive time: a different reading gives a different context, field for field", () => {
    expect(calendarContextFromWorldState(reading({ weekday: 0, gamePhase: "night", season: "winter" }))).toEqual({
      weekday: 0,
      gamePhase: "night",
      season: "winter",
      storyFlags: [],
      weatherKey: null,
      daysPerWeek: 7,
    });
  });
});

describe("schedulesForWorldState (S12 slice 7, host one-call shape)", () => {
  const reading: WorldClockReading = { weekday: 3, gamePhase: "dusk", season: "autumn" };
  it("matches rows against the derived context in input order, with caller flags deciding flag-demanding rows", () => {
    const rows = [
      entry({ id: "a", weekday: 3, season: "autumn", gamePhase: "dusk" }),
      entry({ id: "b", weekday: 3, season: "summer" }),
      entry({ id: "c", weekday: 4 }),
      entry({ id: "d", gamePhase: "dusk", storyFlag: "flag-x" }),
    ];
    expect(schedulesForWorldState(rows, reading).map((r) => r.id)).toEqual(["a"]);
    expect(schedulesForWorldState(rows, reading, { storyFlags: ["flag-x"] }).map((r) => r.id)).toEqual(["a", "d"]);
    // The same rows through slice 1's schedulesForState on the adapted context agree exactly.
    expect(schedulesForState(rows, calendarContextFromWorldState(reading, { storyFlags: ["flag-x"] })).map((r) => r.id)).toEqual(["a", "d"]);
  });
});

describe("currentCalendarContext store method (S12 slice 7, through the real store)", () => {
  it("is null when unanchored, and matches deriveWorldState over the store anchor when anchored", () => {
    useGameStore.setState({ worldClock: null });
    expect(useGameStore.getState().currentCalendarContext()).toBeNull();
    const anchor = newGameAnchor(Date.now());
    useGameStore.setState({ worldClock: anchor });
    const expected = deriveWorldState(anchor, Date.now());
    const got = useGameStore.getState().currentCalendarContext();
    expect(got?.weekday).toBe(expected.weekday);
    expect(got?.gamePhase).toBe(expected.gamePhase);
    expect(got?.season).toBe(expected.season);
    expect(got?.storyFlags).toEqual([]);
    expect(got?.weatherKey).toBeNull();
    expect(got?.daysPerWeek).toBe(7);
    const withOpts = useGameStore.getState().currentCalendarContext({
      storyFlags: new Set(["flag-x"]),
      weatherKey: "rain",
      daysPerWeek: 5,
    });
    expect(withOpts?.storyFlags).toEqual(new Set(["flag-x"]));
    expect(withOpts?.weatherKey).toBe("rain");
    expect(withOpts?.daysPerWeek).toBe(5);
    useGameStore.setState({ worldClock: null });
  });
  it("the store method derives from the anchor through deriveWorldState and the slice-7 adapter", () => {
    const src = readFileSync(
      new URL("../store/gameStore.ts", import.meta.url),
      "utf8",
    );
    expect(src).toContain("currentCalendarContext");
    expect(src).toContain("deriveWorldState");
    expect(src).toContain("calendarContextFromWorldState");
  });
});

describe("PauseMenu upcoming reader source lock (S12 slice 6)", () => {
  it("the section reads future announcements through announcementsSince from today + 1 under an Upcoming heading", () => {
    const src = readFileSync(
      new URL("../components/game/GameShell.tsx", import.meta.url),
      "utf8",
    );
    expect(src).toContain("announcementsSince");
    expect(src).toContain("Upcoming");
    // Upcoming renders only when upcoming announcements exist.
    expect(src).toContain("upcoming.length > 0");
    // The since-read starts after today, so today is never repeated.
    expect(src).toContain("today + 1");
    // Today's and history sections are untouched by the upcoming addition.
    expect(src).toContain("announcementsForDay");
    expect(src).toContain("announcementsBefore");
    expect(src).toContain("Earlier");
  });
  it("upcoming is the since-read from the day after today, never today itself", () => {
    const list: readonly Announcement[] = [
      { id: "old", dayIndex: 9, kind: "calendar", text: "Yesterday's row." },
      { id: "today", dayIndex: 10, kind: "calendar", text: "Today's row." },
      { id: "future", dayIndex: 11, kind: "calendar", text: "Tomorrow's row." },
      { id: "later", dayIndex: 13, kind: "calendar", text: "Later row." },
    ];
    expect(announcementsSince(list, 11).map((a) => a.text)).toEqual(["Tomorrow's row.", "Later row."]);
    // Reading from today would repeat today under a second heading.
    expect(announcementsSince(list, 10).map((a) => a.text)).toEqual(["Today's row.", "Tomorrow's row.", "Later row."]);
  });
});

describe("publishSchedulesForWorldState (S12 slice 8, host publish, pure)", () => {
  const reading = { weekday: 3, gamePhase: "dusk" as const, season: "autumn" as const, dayIndex: 10 };
  const rows = [
    entry({ id: "a", weekday: 3, season: "autumn", gamePhase: "dusk" }),
    entry({ id: "b", weekday: 3, season: "summer" }),
    entry({ id: "c", weekday: 4 }),
    entry({ id: "d", gamePhase: "dusk", storyFlag: "flag-x" }),
  ];
  const textFor = (e: ScheduleEntry) => `Notice for ${e.id}.`;
  it("publishes only the matching row, with the mechanical schedule id for the reading's day", () => {
    const out = publishSchedulesForWorldState([], rows, reading, textFor);
    expect(out).toEqual([{ id: "schedule:a:10", dayIndex: 10, kind: "calendar", text: "Notice for a." }]);
  });
  it("is a same-reference no-op on a same-day rerun and publishes again on a new day", () => {
    const first = publishSchedulesForWorldState([], rows, reading, textFor);
    expect(publishSchedulesForWorldState(first, rows, reading, textFor)).toBe(first);
    const nextDay = publishSchedulesForWorldState(first, rows, { ...reading, dayIndex: 11 }, textFor);
    expect(nextDay.map((a) => a.id)).toEqual(["schedule:a:10", "schedule:a:11"]);
    expect(nextDay[1]?.dayIndex).toBe(11);
  });
  it("publishes nothing for a no-text row or a weather-demanding row with no caller weather, and publishes it once weather is supplied", () => {
    const noText = publishSchedulesForWorldState([], rows, reading, () => null);
    expect(noText).toEqual([]);
    const weatherRow = [entry({ id: "w", weatherKey: "rain" })];
    expect(publishSchedulesForWorldState([], weatherRow, reading, textFor)).toEqual([]);
    expect(publishSchedulesForWorldState([], weatherRow, reading, textFor, { weatherKey: "rain" })).toEqual([
      { id: "schedule:w:10", dayIndex: 10, kind: "calendar", text: "Notice for w." },
    ]);
  });
  it("agrees exactly with slice 3's publisher on the slice-7 adapted context, and passes caller flags through", () => {
    const opts = { storyFlags: ["flag-x"] };
    const viaSlice8 = publishSchedulesForWorldState([], rows, reading, textFor, opts);
    const viaSlice3 = publishScheduleAnnouncements(
      [],
      rows,
      calendarContextFromWorldState(reading, opts),
      10,
      textFor,
    );
    expect(viaSlice8).toEqual(viaSlice3);
    expect(viaSlice8.map((a) => a.id)).toEqual(["schedule:a:10", "schedule:d:10"]);
    // Without the flag, the flag-demanding row stays unpublished.
    expect(
      publishSchedulesForWorldState([], rows, reading, textFor).map((a) => a.id),
    ).toEqual(["schedule:a:10"]);
  });
});

describe("publishSchedulesForCurrentDay store method (S12 slice 8, through the real store)", () => {
  it("is a no-op when unanchored", () => {
    useGameStore.setState({ worldClock: null, announcements: [] });
    useGameStore
      .getState()
      .publishSchedulesForCurrentDay([entry({ id: "host-row" })], () => "Host notice.");
    expect(useGameStore.getState().announcements).toEqual([]);
  });
  it("publishes the matching row for the store's own reading, once, with the reading's dayIndex", () => {
    const anchor = newGameAnchor(Date.now());
    useGameStore.setState({ worldClock: anchor, announcements: [] });
    const expected = deriveWorldState(anchor, Date.now());
    const row = entry({
      id: "host-row",
      weekday: expected.weekday,
      gamePhase: expected.gamePhase,
      season: expected.season,
    });
    const store = useGameStore.getState();
    store.publishSchedulesForCurrentDay([row], () => "Host notice.");
    const after = useGameStore.getState().announcements;
    expect(after).toEqual([
      { id: `schedule:host-row:${expected.dayIndex}`, dayIndex: expected.dayIndex, kind: "calendar", text: "Host notice." },
    ]);
    // A second call on the same day adds nothing.
    useGameStore.getState().publishSchedulesForCurrentDay([row], () => "Host notice.");
    expect(useGameStore.getState().announcements).toEqual(after);
    useGameStore.setState({ worldClock: null, announcements: [] });
  });
  it("the store method derives from the anchor through deriveWorldState and the slice-8 pure publish", () => {
    const src = readFileSync(
      new URL("../store/gameStore.ts", import.meta.url),
      "utf8",
    );
    expect(src).toContain("publishSchedulesForCurrentDay");
    expect(src).toContain("deriveWorldState");
    expect(src).toContain("publishSchedulesForWorldState");
  });
});
