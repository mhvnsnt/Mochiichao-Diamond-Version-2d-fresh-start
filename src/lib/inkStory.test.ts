import { describe, expect, it } from "vitest";
import {
  INK_STORIES,
  InkSession,
  createInkSession,
  splitSpeaker,
} from "./inkStory";
import truckStartJson from "./wiring/dialogue/region1-truck-start.json";

describe("splitSpeaker", () => {
  it("splits 'Name: text' into speaker + text", () => {
    expect(splitSpeaker("Mom: There you are!")).toEqual({
      speaker: "Mom",
      text: "There you are!",
    });
    expect(splitSpeaker("Prof. Aeon: Quick — take one!")).toEqual({
      speaker: "Prof. Aeon",
      text: "Quick — take one!",
    });
    expect(splitSpeaker("You: Home. For real this time.")).toEqual({
      speaker: "You",
      text: "Home. For real this time.",
    });
  });

  it("leaves bare lines as narration (speaker null)", () => {
    expect(
      splitSpeaker("You set the clock on the wall. It ticks, once."),
    ).toEqual({
      speaker: null,
      text: "You set the clock on the wall. It ticks, once.",
    });
  });
});

describe("createInkSession", () => {
  it("returns null for an unknown story id", () => {
    expect(createInkSession("no-such-story")).toBeNull();
  });

  it("returns null for a bad knot", () => {
    expect(
      createInkSession("region1-truck-start", "no_such_knot"),
    ).toBeNull();
  });

  it("returns null for JSON that is not a compiled Ink story", () => {
    expect(() => new InkSession({})).toThrow(/compiled Ink JSON/);
    expect(() => new InkSession(null)).toThrow(/compiled Ink JSON/);
  });

  it("registers the truck-start story", () => {
    expect(INK_STORIES["region1-truck-start"]).toEqual(truckStartJson);
  });
});

describe("region1-truck-start, knot-scoped (mom_truck)", () => {
  it("plays Mom's two lines, then ends at the house_1f divert", () => {
    const s = createInkSession("region1-truck-start", "mom_truck");
    expect(s).not.toBeNull();
    expect(s!.next()).toEqual({
      speaker: "Mom",
      text: "There you are! The truck beat us here.",
    });
    expect(s!.next()).toEqual({
      speaker: "Mom",
      text: "Our new house is just up the road. Go on in and set the clock upstairs — movers hate waiting.",
    });
    // The next knot (house_1f) is a different beat: scoped mode
    // discards its first line and ends here.
    expect(s!.next()).toBeNull();
    expect(s!.choices).toEqual([]);
    expect(s!.done).toBe(true);
    // No flag is set inside mom_truck.
    expect(s!.variables.clock_set).toBe(false);
  });

  it("plays house_2f_clock and sets clock_set", () => {
    const s = createInkSession("region1-truck-start", "house_2f_clock");
    expect(s).not.toBeNull();
    expect(s!.next()).toEqual({
      speaker: null,
      text: "You set the clock on the wall. It ticks, once, and keeps going.",
    });
    expect(s!.next()).toEqual({
      speaker: "You",
      text: "Home. For real this time.",
    });
    expect(s!.next()).toBeNull();
    expect(s!.done).toBe(true);
    expect(s!.variables.clock_set).toBe(true);
  });
});

describe("region1-truck-start, full story (followDiverts)", () => {
  it("walks every knot to END with the starter choice", () => {
    const s = new InkSession(truckStartJson, undefined, true);
    const seen: string[] = [];
    let chose = false;
    for (let guard = 0; guard < 100 && !s.done; guard++) {
      const line = s.next();
      if (line) {
        seen.push(line.text);
        continue;
      }
      const ch = s.choices;
      if (ch.length > 0) {
        expect(ch.map((c) => c.text)).toEqual([
          "Take Mochii",
          "Take Razorgater",
          "Take Tyrage",
          "Take Kittember",
          "Take Sproutle",
        ]);
        s.choose(2);
        chose = true;
        continue;
      }
      break;
    }
    expect(chose).toBe(true);
    expect(s.done).toBe(true);
    expect(seen).toContain("There you are! The truck beat us here.");
    expect(seen).toContain(
      "Help! This wild creature has me cornered!",
    );
    expect(seen).toContain(
      "This is your Mochiioteca. It records every Mochiichao you meet.",
    );
    expect(seen).toContain(
      "Off already? Here — Sprint Boots. They'll get you there twice as fast.",
    );
    expect(s.variables.clock_set).toBe(true);
    expect(s.variables.codex_get).toBe(true);
    expect(s.variables.sprint_boots).toBe(true);
  });
});
