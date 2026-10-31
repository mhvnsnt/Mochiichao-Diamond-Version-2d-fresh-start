// Gap-fill S10 slice 1 tests. All expected values are hand-computed
// from the rules in behaviour.ts and the sources cited there — no value
// here comes from running the code first.
import { describe, expect, it } from "vitest";
import {
  deriveAwareness,
  scoreBehaviour,
  type BehaviourInput,
  type BehaviourProfile,
} from "./behaviour";
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

const FLEE_WARY: BehaviourProfile = { threatResponse: "flee", curiosity: "wary" };
const BOLD_GRAZER: BehaviourProfile = { threatResponse: "flee", curiosity: "bold" };

function input(overrides: Partial<BehaviourInput>): BehaviourInput {
  return {
    profile: FLEE_WARY,
    baseBehaviour: "graze",
    place: place({}),
    distanceTiles: 10,
    ...overrides,
  };
}

describe("deriveAwareness (S10 slice 1, BW2 §6 2-tile anchor)", () => {
  it("bands by distance: <=2 alerted, 3..6 suspicious, beyond unaware", () => {
    expect(deriveAwareness(0)).toBe("alerted");
    expect(deriveAwareness(2)).toBe("alerted");
    expect(deriveAwareness(3)).toBe("suspicious");
    expect(deriveAwareness(6)).toBe("suspicious");
    expect(deriveAwareness(7)).toBe("unaware");
    expect(deriveAwareness(24)).toBe("unaware");
  });

  it("unknown distance reads unaware; negative clamps to alerted", () => {
    expect(deriveAwareness(null)).toBe("unaware");
    expect(deriveAwareness(NaN)).toBe("unaware");
    expect(deriveAwareness(-3)).toBe("alerted");
  });
});

describe("scoreBehaviour unaware (S10 slice 1)", () => {
  it("unaware roamers keep their table behaviour, no presentation", () => {
    expect(scoreBehaviour(input({ baseBehaviour: "graze" }))).toEqual({
      awareness: "unaware",
      behaviour: "graze",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(input({ baseBehaviour: "wander", distanceTiles: 100 })),
    ).toEqual({
      awareness: "unaware",
      behaviour: "wander",
      threatPresentation: null,
    });
  });

  it("sealed places score null — the depths fence", () => {
    expect(
      scoreBehaviour(input({ place: place({ sealed: true }), distanceTiles: 1 })),
    ).toBeNull();
  });

  it("unzoned places still score (sealed false, zoneId null)", () => {
    expect(
      scoreBehaviour(
        input({ place: place({ zoneId: null, areaId: null }), distanceTiles: 1 }),
      ),
    ).toEqual({
      awareness: "alerted",
      behaviour: "flee",
      threatPresentation: "flee",
    });
  });

  it("null place still scores (no fence to apply)", () => {
    expect(scoreBehaviour(input({ place: null, distanceTiles: 1 }))).toEqual({
      awareness: "alerted",
      behaviour: "flee",
      threatPresentation: "flee",
    });
  });
});

describe("scoreBehaviour suspicious (S10 slice 1)", () => {
  it("bold curiosity turns suspicious into curious", () => {
    expect(
      scoreBehaviour(input({ profile: BOLD_GRAZER, distanceTiles: 5 })),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "curious",
      threatPresentation: null,
    });
  });

  it("wary + flee/vanish flees early; wary + freeze stills; wary + display/charge holds", () => {
    expect(scoreBehaviour(input({ distanceTiles: 4 }))).toEqual({
      awareness: "suspicious",
      behaviour: "flee",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "vanish", curiosity: "wary" },
          distanceTiles: 4,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "flee",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "freeze", curiosity: "wary" },
          distanceTiles: 4,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "still",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "display", curiosity: "wary" },
          distanceTiles: 4,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "graze",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "charge", curiosity: "wary" },
          distanceTiles: 4,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "graze",
      threatPresentation: null,
    });
  });

  it("neutral curiosity keeps the base behaviour at suspicious", () => {
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "charge", curiosity: "neutral" },
          distanceTiles: 6,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "graze",
      threatPresentation: null,
    });
  });
});

describe("scoreBehaviour alerted (S10 slice 1)", () => {
  it("flee and vanish leave; freeze and display still; presentation echoes the threat", () => {
    expect(scoreBehaviour(input({ distanceTiles: 2 }))).toEqual({
      awareness: "alerted",
      behaviour: "flee",
      threatPresentation: "flee",
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "vanish", curiosity: "neutral" },
          distanceTiles: 1,
        }),
      ),
    ).toEqual({
      awareness: "alerted",
      behaviour: "flee",
      threatPresentation: "vanish",
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "freeze", curiosity: "neutral" },
          distanceTiles: 1,
        }),
      ),
    ).toEqual({
      awareness: "alerted",
      behaviour: "still",
      threatPresentation: "freeze",
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "display", curiosity: "neutral" },
          distanceTiles: 1,
        }),
      ),
    ).toEqual({
      awareness: "alerted",
      behaviour: "still",
      threatPresentation: "display",
    });
  });

  it("charge chases ONLY when flagged; unflagged it holds ground and threatens", () => {
    const charged: BehaviourProfile = { threatResponse: "charge", curiosity: "neutral" };
    expect(
      scoreBehaviour(input({ profile: charged, distanceTiles: 1 })),
    ).toEqual({
      awareness: "alerted",
      behaviour: "still",
      threatPresentation: "charge",
    });
    expect(
      scoreBehaviour(
        input({ profile: charged, distanceTiles: 1, chaseFlagged: true }),
      ),
    ).toEqual({
      awareness: "alerted",
      behaviour: "chase",
      threatPresentation: "charge",
    });
  });
});

describe("scoreBehaviour composition slot + activity cap (S10 slice 1)", () => {
  it("awarenessShift steps one level each way, clamped at the ends", () => {
    expect(
      scoreBehaviour(input({ distanceTiles: 10, awarenessShift: 1 })),
    ).toMatchObject({ awareness: "suspicious", behaviour: "flee" });
    expect(
      scoreBehaviour(input({ distanceTiles: 2, awarenessShift: -1 })),
    ).toMatchObject({ awareness: "suspicious", behaviour: "flee" });
    expect(
      scoreBehaviour(input({ distanceTiles: 1, awarenessShift: 1 })),
    ).toMatchObject({ awareness: "alerted" });
    expect(
      scoreBehaviour(input({ distanceTiles: 10, awarenessShift: -1 })),
    ).toMatchObject({ awareness: "unaware" });
  });

  it("inactive-phase roamers cap at suspicious and never act", () => {
    expect(
      scoreBehaviour(input({ distanceTiles: 1, activeInPhase: false })),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "flee",
      threatPresentation: null,
    });
    expect(
      scoreBehaviour(
        input({
          profile: { threatResponse: "charge", curiosity: "neutral" },
          distanceTiles: 1,
          activeInPhase: false,
          chaseFlagged: true,
        }),
      ),
    ).toEqual({
      awareness: "suspicious",
      behaviour: "graze",
      threatPresentation: null,
    });
  });

  it("activeInPhase null applies no cap", () => {
    expect(
      scoreBehaviour(
        input({ distanceTiles: 1, activeInPhase: null, awarenessShift: 1 }),
      ),
    ).toMatchObject({ awareness: "alerted" });
  });
});
