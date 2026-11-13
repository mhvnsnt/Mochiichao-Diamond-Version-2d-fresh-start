// Story-flag exit gates — Regions 3-5 step, 2026-11-13.
//
// Pins what the story-flag engine wires: an exit may name a `storyFlag`
// that must be set in completedEvents before the exit opens. Flags are
// set by Ink story progress and persist in the save as completedEvents
// entries: WorldEngine.finishInkDialog records every variable a story
// set to true as `ink:<storyId>:<flag>`; a bare flag name counts too.
// Fail-closed throughout: an unset flag seals the exit, exactly like
// a missing badge count or an unheld technique.
//
// The three inter-region exits carry the flags the compiled Ink stories
// set — verified here by PLAYING the knot, not by string search:
//   r3_storm_route_open  <- region2-story knot r2_14_frost_peak_after
//   r4_airship_route_open <- region3-story knot r3_13_frontier_arenas_after
//   r5_signal_open      <- region4-story knot r4_16_battle_zone_after
// No other exit is gated on a story flag in this PR.
import { describe, it, expect } from "vitest";
import { FULL_WORLD } from "../src/world/FullWorldMaps";
import {
  hasStoryFlag,
  isExitOpen,
  exitSealedText,
} from "../src/lib/doorGate";
import { createInkSession } from "../src/lib/inkStory";

type AnyMap = Record<string, any>;
const M = (k: string): AnyMap => (FULL_WORLD as any)[k];

/** Play one knot to its end and return the story variables it set. */
function playKnot(storyId: string, knot: string): Record<string, unknown> {
  const session = createInkSession(storyId, knot);
  expect(session, `${storyId}:${knot} must build a session`).not.toBeNull();
  for (let guard = 0; guard < 50; guard++) {
    if (session!.next() === null) break;
  }
  return session!.variables;
}

describe("hasStoryFlag", () => {
  it("a bare flag name matches a bare completedEvents entry", () => {
    expect(hasStoryFlag(["r3_storm_route_open"], "r3_storm_route_open")).toBe(true);
  });

  it("a bare flag name matches the ink:<story>:<flag> entry the engine records", () => {
    expect(
      hasStoryFlag(["ink:region2-story:r3_storm_route_open"], "r3_storm_route_open"),
    ).toBe(true);
    expect(
      hasStoryFlag(["ink:region3-story:r4_airship_route_open"], "r4_airship_route_open"),
    ).toBe(true);
    expect(
      hasStoryFlag(["ink:region4-story:r5_signal_open"], "r5_signal_open"),
    ).toBe(true);
  });

  it("a different flag, a different story, or an empty list does not match", () => {
    expect(hasStoryFlag(["ink:region2-story:r3_storm_route_open"], "r4_airship_route_open")).toBe(false);
    expect(hasStoryFlag(["ink:region3-story:r4_airship_route_open"], "r3_storm_route_open")).toBe(false);
    expect(hasStoryFlag([], "r3_storm_route_open")).toBe(false);
    expect(hasStoryFlag(null, "r3_storm_route_open")).toBe(false);
    expect(hasStoryFlag(undefined, "r3_storm_route_open")).toBe(false);
  });

  it("no flag named is not a set flag", () => {
    expect(hasStoryFlag(["r3_storm_route_open"], null)).toBe(false);
    expect(hasStoryFlag(["r3_storm_route_open"], undefined)).toBe(false);
    expect(hasStoryFlag(["r3_storm_route_open"], "")).toBe(false);
  });

  it("a suffix-only coincidence does not match (the flag must be a whole segment)", () => {
    expect(hasStoryFlag(["ink:region2-story:xr3_storm_route_open"], "r3_storm_route_open")).toBe(false);
    expect(hasStoryFlag(["r3_storm_route_open_extra"], "r3_storm_route_open")).toBe(false);
  });
});

describe("isExitOpen with storyFlag", () => {
  it("flag unset -> blocked; flag set -> open", () => {
    const exit = { to: "r3_outpost_2f", storyFlag: "r3_storm_route_open" };
    expect(isExitOpen(exit, [], {})).toBe(false);
    expect(isExitOpen(exit, [], {}, [])).toBe(false);
    expect(isExitOpen(exit, [], {}, ["r3_storm_route_open"])).toBe(true);
    expect(
      isExitOpen(exit, [], {}, ["ink:region2-story:r3_storm_route_open"]),
    ).toBe(true);
  });

  it("storyFlag AND badges>=N must both pass", () => {
    const exit = { to: "r3_outpost_2f", condition: "badges>=8", storyFlag: "r3_storm_route_open" };
    const eight = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"];
    expect(isExitOpen(exit, eight, {}, ["r3_storm_route_open"])).toBe(true);
    expect(isExitOpen(exit, eight, {}, [])).toBe(false);
    expect(isExitOpen(exit, eight.slice(0, 7), {}, ["r3_storm_route_open"])).toBe(false);
  });

  it("storyFlag AND hmNeeded must both pass", () => {
    const exit = { to: "r3_outpost_2f", hmNeeded: "Wave", storyFlag: "r3_storm_route_open" };
    expect(isExitOpen(exit, [], { "tech.wave": true }, ["r3_storm_route_open"])).toBe(true);
    expect(isExitOpen(exit, [], { "tech.wave": true }, [])).toBe(false);
    expect(isExitOpen(exit, [], {}, ["r3_storm_route_open"])).toBe(false);
  });

  it("an exit with no storyFlag is unaffected by completedEvents", () => {
    expect(isExitOpen({ to: "route_1" }, [], {}, ["r3_storm_route_open"])).toBe(true);
    expect(isExitOpen({ to: "route_1" }, [], {})).toBe(true);
  });
});

describe("exitSealedText with storyFlag", () => {
  it("names the destination and says the way has not opened yet", () => {
    const text = exitSealedText(
      { to: "r3_outpost_2f", storyFlag: "r3_storm_route_open" },
      "Root Hamlet Outpost — Bedroom",
    );
    expect(text).toContain("Root Hamlet Outpost — Bedroom");
    expect(text).toContain("has not opened yet");
  });

  it("a badge gate still names its badge count, not the story text", () => {
    const text = exitSealedText(
      { to: "victory_route", condition: "badges>=8", storyFlag: "r3_storm_route_open" },
      "Victory Route",
    );
    expect(text).toContain("8 badges");
  });
});

describe("the three inter-region exits", () => {
  it("Frost Peak north -> Root Hamlet outpost is storm-flag gated", () => {
    const exit = M("r2_frost_peak").exits.find((e: any) => e.to === "r3_outpost_2f");
    expect(exit).toBeDefined();
    expect(exit.storyFlag).toBe("r3_storm_route_open");
    expect(isExitOpen(exit, [], {}, [])).toBe(false);
    expect(
      isExitOpen(exit, [], {}, ["ink:region2-story:r3_storm_route_open"]),
    ).toBe(true);
  });

  it("Frontier Arenas north -> Twinleaf is airship-flag gated", () => {
    const exit = M("r3_frontier_arenas").exits.find((e: any) => e.to === "r4_twinleaf");
    expect(exit).toBeDefined();
    expect(exit.storyFlag).toBe("r4_airship_route_open");
    expect(isExitOpen(exit, [], {}, [])).toBe(false);
    expect(
      isExitOpen(exit, [], {}, ["ink:region3-story:r4_airship_route_open"]),
    ).toBe(true);
  });

  it("Rift Dungeon north -> Start City is signal-flag gated", () => {
    const exit = M("r4_rift_dungeon").exits.find((e: any) => e.to === "r5_start_city");
    expect(exit).toBeDefined();
    expect(exit.storyFlag).toBe("r5_signal_open");
    expect(isExitOpen(exit, [], {}, [])).toBe(false);
    expect(
      isExitOpen(exit, [], {}, ["ink:region4-story:r5_signal_open"]),
    ).toBe(true);
  });

  it("no other exit in the world names a storyFlag", () => {
    const flagged: string[] = [];
    for (const [k, m] of Object.entries(FULL_WORLD as Record<string, AnyMap>)) {
      for (const e of (m as AnyMap).exits ?? []) {
        if (e.storyFlag) flagged.push(`${k} -> ${e.to} (${e.storyFlag})`);
      }
    }
    expect(flagged.sort()).toEqual([
      "r2_frost_peak -> r3_outpost_2f (r3_storm_route_open)",
      "r3_frontier_arenas -> r4_twinleaf (r4_airship_route_open)",
      "r4_rift_dungeon -> r5_start_city (r5_signal_open)",
    ]);
  });
});

describe("the flags are set by playing their Ink knots", () => {
  it("r2_14_frost_peak_after sets r3_storm_route_open", () => {
    const vars = playKnot("region2-story", "r2_14_frost_peak_after");
    expect(vars["r3_storm_route_open"]).toBe(true);
  });

  it("r3_13_frontier_arenas_after sets r4_airship_route_open", () => {
    const vars = playKnot("region3-story", "r3_13_frontier_arenas_after");
    expect(vars["r4_airship_route_open"]).toBe(true);
  });

  it("r4_16_battle_zone_after sets r5_signal_open", () => {
    const vars = playKnot("region4-story", "r4_16_battle_zone_after");
    expect(vars["r5_signal_open"]).toBe(true);
  });
});
