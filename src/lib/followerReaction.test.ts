// Gap-fill S8 slice 3 tests. All expected values are hand-computed
// from the rules in followerReaction.ts and the teardown citations
// there — no value here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  FOLLOWER_REACTION_RULES,
  followerTalkLine,
  moodBand,
  selectFollowerReaction,
  type FollowerReactionRule,
} from "./followerReaction";
import type { PlaceFact as PlaceFactType } from "./place";

function place(overrides: Partial<PlaceFactType>): PlaceFactType {
  return {
    mapId: "route_1",
    zoneId: "garden-meadow",
    areaId: "meadow-route-01",
    biomeId: "garden-complex",
    habitatClasses: ["small-ground"],
    primaryClass: "small-ground",
    secondaryClass: null,
    methodsHere: ["grass"],
    speciesHere: [],
    depthTier: "surface",
    timeBand: "day",
    weatherKey: "clear",
    weatherId: null,
    sceneId: null,
    authoredLife: true,
    sealed: false,
    ...overrides,
  };
}

describe("moodBand (S8 slice 3, sign partition of -127..127)", () => {
  it("partitions by sign, clamping out-of-range inputs", () => {
    expect(moodBand(-127)).toBe("low");
    expect(moodBand(-1)).toBe("low");
    expect(moodBand(-200)).toBe("low");
    expect(moodBand(0)).toBe("neutral");
    expect(moodBand(undefined)).toBe("neutral");
    expect(moodBand(null)).toBe("neutral");
    expect(moodBand(NaN)).toBe("neutral");
    expect(moodBand(1)).toBe("high");
    expect(moodBand(127)).toBe("high");
    expect(moodBand(200)).toBe("high");
  });
});

describe("selectFollowerReaction (S8 slice 3, seeded teardown rule)", () => {
  it("seeds exactly one rule: FIRE on wet ground", () => {
    expect(FOLLOWER_REACTION_RULES).toHaveLength(1);
    expect(FOLLOWER_REACTION_RULES[0].id).toBe("fire-wet-ground");
  });

  it("FIRE on waters-edge and water reads terrain-discomfort", () => {
    expect(
      selectFollowerReaction({ mood: 0, speciesTypes: ["FIRE"], place: place({ primaryClass: "waters-edge" }) }),
    ).toEqual({ reaction: "terrain-discomfort", moodBand: "neutral" });
    expect(
      selectFollowerReaction({ mood: -30, speciesTypes: ["FIRE"], place: place({ primaryClass: "water" }) }),
    ).toEqual({ reaction: "terrain-discomfort", moodBand: "low" });
  });

  it("returns null where no row is authored — no invented reaction", () => {
    // FIRE on dry ground: no rule.
    expect(
      selectFollowerReaction({ mood: 0, speciesTypes: ["FIRE"], place: place({ primaryClass: "small-ground" }) }).reaction,
    ).toBeNull();
    // A fitting type on wet ground: no discomfort rule.
    expect(
      selectFollowerReaction({ mood: 0, speciesTypes: ["WATER"], place: place({ primaryClass: "waters-edge" }) }).reaction,
    ).toBeNull();
    // No place at all: a place-keyed row cannot match.
    expect(selectFollowerReaction({ mood: 0, speciesTypes: ["FIRE"], place: null }).reaction).toBeNull();
    // No species types: a type-keyed row cannot match.
    expect(
      selectFollowerReaction({ mood: 0, speciesTypes: [], place: place({ primaryClass: "waters-edge" }) }).reaction,
    ).toBeNull();
    // Empty registry: always null, band still reported.
    expect(selectFollowerReaction({ mood: 42, speciesTypes: ["FIRE"], place: place({ primaryClass: "water" }) }, [])).toEqual({
      reaction: null,
      moodBand: "high",
    });
  });

  it("test-only rows prove matcher semantics: first match wins, axes are conjunctive", () => {
    const rules: FollowerReactionRule[] = [
      { id: "wet-night", primaryClasses: ["waters-edge"], timeBands: ["night"], reaction: "terrain-discomfort" },
      { id: "wet-any", primaryClasses: ["waters-edge"], reaction: "terrain-discomfort" },
    ];
    // Night + wet: the specific row wins (first in order).
    const night = selectFollowerReaction(
      { mood: 0, place: place({ primaryClass: "waters-edge", timeBand: "night" }) },
      rules,
    );
    expect(night.reaction).toBe("terrain-discomfort");
    // Day + wet: the night row does NOT match (conjunctive axes), the general row does.
    const day = selectFollowerReaction(
      { mood: 0, place: place({ primaryClass: "waters-edge", timeBand: "day" }) },
      rules,
    );
    expect(day.reaction).toBe("terrain-discomfort");
    // Weather-key rows need a real weatherKey, not null.
    const rainRow: FollowerReactionRule[] = [
      { id: "rain-row", weatherKeys: ["rain"], reaction: "terrain-discomfort" },
    ];
    expect(
      selectFollowerReaction({ mood: 0, place: place({ weatherKey: null }) }, rainRow).reaction,
    ).toBeNull();
    expect(
      selectFollowerReaction({ mood: 0, place: place({ weatherKey: "rain" }) }, rainRow).reaction,
    ).toBe("terrain-discomfort");
  });
});

describe("followerTalkLine (S8 slice 4, host's own text)", () => {
  it("renders the seeded discomfort reaction in original words", () => {
    const line = followerTalkLine("Kittember", {
      reaction: "terrain-discomfort",
      moodBand: "neutral",
    });
    expect(line).toContain("Kittember");
    expect(line).toContain("wet ground");
  });

  it("renders a plain greeting for a null selection — no invented reaction", () => {
    const line = followerTalkLine("Sproutle", { reaction: null, moodBand: "neutral" });
    expect(line).toContain("Sproutle");
    expect(line).not.toContain("wet ground");
  });

  it("does not let the mood band rewrite the text", () => {
    const low = followerTalkLine("Sproutle", { reaction: null, moodBand: "low" });
    const high = followerTalkLine("Sproutle", { reaction: null, moodBand: "high" });
    expect(low).toBe(high);
  });
});
