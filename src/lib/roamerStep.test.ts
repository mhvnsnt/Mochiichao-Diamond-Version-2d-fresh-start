// Gap-fill S10 slice 2 tests. All expected values are hand-computed
// from the rules in roamerStep.ts / behaviour.ts and the A* wrapper's
// documented contract — no value here comes from running the code first.
import { describe, expect, it } from "vitest";
import { stepRoamerScored, type RoamerStepInput } from "./roamerStep";
import type { BehaviourProfile } from "./behaviour";
import type { PlaceFact } from "./place";

const BLOCKED = new Set([1, 4, 2]);

function grid(w: number, h: number, walls: Array<[number, number]> = []): number[][] {
  const g = Array.from({ length: h }, () => Array(w).fill(0));
  for (const [x, y] of walls) g[y][x] = 1;
  return g;
}

function place(sealed: boolean): PlaceFact {
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
    sealed,
  };
}

const FLEE_WARY: BehaviourProfile = { threatResponse: "flee", curiosity: "wary" };
const CHARGE_BOLD: BehaviourProfile = { threatResponse: "charge", curiosity: "bold" };
const CHARGE_NEUTRAL: BehaviourProfile = { threatResponse: "charge", curiosity: "neutral" };
const FREEZE_WARY: BehaviourProfile = { threatResponse: "freeze", curiosity: "wary" };

function input(overrides: Partial<RoamerStepInput>): RoamerStepInput {
  return {
    from: { x: 1, y: 1 },
    home: { x: 1, y: 1 },
    playerPos: { x: 3, y: 1 },
    tiles: grid(7, 7),
    blocked: BLOCKED,
    profile: FLEE_WARY,
    baseBehaviour: "graze",
    place: place(false),
    ...overrides,
  };
}

describe("stepRoamerScored", () => {
  it("chase steps directly toward the player on open ground", () => {
    // Distance 2 -> alerted; charge + flagged -> chase; A* first step east.
    const out = stepRoamerScored(
      input({ profile: CHARGE_BOLD, chaseFlagged: true }),
    );
    expect(out?.score).toEqual({
      awareness: "alerted",
      behaviour: "chase",
      threatPresentation: "charge",
    });
    expect(out?.next).toEqual({ x: 2, y: 1 });
    expect(out?.moved).toBe(true);
  });

  it("chase routes around a wall instead of stepping into it", () => {
    // Wall at (3,2) is not on this path; the telling case: roamer (2,2),
    // player (4,2), wall directly between at (3,2). Greedy east would
    // hit the wall; A* must go north or south first.
    const out = stepRoamerScored(
      input({
        from: { x: 2, y: 2 },
        home: { x: 2, y: 2 },
        playerPos: { x: 4, y: 2 },
        tiles: grid(7, 7, [[3, 2]]),
        profile: CHARGE_BOLD,
        chaseFlagged: true,
      }),
    );
    expect(out?.score.behaviour).toBe("chase");
    expect(out?.next).toEqual(expect.anything());
    expect([JSON.stringify({ x: 2, y: 1 }), JSON.stringify({ x: 2, y: 3 })]).toContain(
      JSON.stringify(out?.next),
    );
    expect(out?.moved).toBe(true);
  });

  it("flee steps away via the flee anchor on open ground", () => {
    // Roamer (3,3), player south at (3,4): distance 1 -> alerted, flee;
    // anchor (3,1); A* first step north to (3,2).
    const out = stepRoamerScored(
      input({
        from: { x: 3, y: 3 },
        home: { x: 3, y: 3 },
        playerPos: { x: 3, y: 4 },
        profile: FLEE_WARY,
      }),
    );
    expect(out?.score.behaviour).toBe("flee");
    expect(out?.next).toEqual({ x: 3, y: 2 });
    expect(out?.moved).toBe(true);
  });

  it("flee falls back to the farthest walkable neighbour when the anchor is out of bounds", () => {
    // Roamer (1,2), player east at (2,2): anchor (-1,2) is out of bounds.
    // Neighbours in dir order east(2,2) d0, west(0,2) d2, south(1,3) d2,
    // north(1,1) d2 — first-max wins, west.
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 2 },
        home: { x: 1, y: 2 },
        playerPos: { x: 2, y: 2 },
        profile: FLEE_WARY,
      }),
    );
    expect(out?.score.behaviour).toBe("flee");
    expect(out?.next).toEqual({ x: 0, y: 2 });
  });

  it("flee never steps onto a blocked tile or the player's tile", () => {
    // Roamer (2,2), player west at (1,2), walls east/north/south: the
    // A* route to the (4,2) anchor loops around through the player's
    // tile, so its first step IS the player — rejected by the flee
    // fence — and the fallback has no walkable neighbour but the
    // player, so the roamer holds.
    const out = stepRoamerScored(
      input({
        from: { x: 2, y: 2 },
        home: { x: 2, y: 2 },
        playerPos: { x: 1, y: 2 },
        tiles: grid(7, 7, [
          [3, 2],
          [2, 1],
          [2, 3],
        ]),
        profile: FLEE_WARY,
      }),
    );
    // See the test's comment above: A* first step rejected (player
    // tile), fallback empty, so the roamer holds.
    expect(out?.next).toEqual({ x: 2, y: 2 });
    expect(out?.moved).toBe(false);
  });

  it("a fleeing roamer on the player's tile holds for contact resolution", () => {
    const out = stepRoamerScored(
      input({
        from: { x: 2, y: 2 },
        home: { x: 2, y: 2 },
        playerPos: { x: 2, y: 2 },
        profile: FLEE_WARY,
      }),
    );
    expect(out?.score.behaviour).toBe("flee");
    expect(out?.next).toEqual({ x: 2, y: 2 });
    expect(out?.moved).toBe(false);
  });

  it("curious approaches the player at suspicious distance", () => {
    // Bold at distance 4 -> suspicious -> curious; A* first step east.
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 1 },
        home: { x: 1, y: 1 },
        playerPos: { x: 5, y: 1 },
        profile: CHARGE_BOLD,
      }),
    );
    expect(out?.score).toEqual({
      awareness: "suspicious",
      behaviour: "curious",
      threatPresentation: null,
    });
    expect(out?.next).toEqual({ x: 2, y: 1 });
  });

  it("graze at unaware distance does not move", () => {
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 1 },
        home: { x: 1, y: 1 },
        playerPos: { x: 6, y: 6 },
        baseBehaviour: "graze",
      }),
    );
    expect(out?.score.behaviour).toBe("graze");
    expect(out?.next).toEqual({ x: 1, y: 1 });
    expect(out?.moved).toBe(false);
  });

  it("still at alerted distance does not move", () => {
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 1 },
        home: { x: 1, y: 1 },
        playerPos: { x: 2, y: 1 },
        profile: FREEZE_WARY,
      }),
    );
    expect(out?.score.behaviour).toBe("still");
    expect(out?.next).toEqual({ x: 1, y: 1 });
    expect(out?.moved).toBe(false);
  });

  it("unflagged charge holds ground instead of chasing", () => {
    const out = stepRoamerScored(
      input({ profile: CHARGE_BOLD, chaseFlagged: false }),
    );
    expect(out?.score.behaviour).toBe("still");
    expect(out?.next).toEqual({ x: 1, y: 1 });
    expect(out?.moved).toBe(false);
  });

  it("inactive-phase cap turns an alerted charge into a grazing stay", () => {
    // Distance 1 would be alerted chase; inactive caps to suspicious,
    // and neutral curiosity at suspicious keeps the base behaviour.
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 1 },
        home: { x: 1, y: 1 },
        playerPos: { x: 2, y: 1 },
        profile: CHARGE_NEUTRAL,
        chaseFlagged: true,
        activeInPhase: false,
        baseBehaviour: "graze",
      }),
    );
    expect(out?.score.awareness).toBe("suspicious");
    expect(out?.score.behaviour).toBe("graze");
    expect(out?.moved).toBe(false);
  });

  it("sealed places step null", () => {
    const out = stepRoamerScored(input({ place: place(true) }));
    expect(out).toBeNull();
  });

  it("wander takes the rng-chosen walkable neighbour within home radius", () => {
    // rng 0 -> first candidate in dir order: east (2,1).
    const out = stepRoamerScored(
      input({
        from: { x: 1, y: 1 },
        home: { x: 1, y: 1 },
        playerPos: { x: 6, y: 6 },
        baseBehaviour: "wander",
        rng: () => 0,
      }),
    );
    expect(out?.score.behaviour).toBe("wander");
    expect(out?.next).toEqual({ x: 2, y: 1 });
  });

  it("wander with no walkable neighbour within home radius holds", () => {
    const out = stepRoamerScored(
      input({
        from: { x: 2, y: 2 },
        home: { x: 2, y: 2 },
        playerPos: { x: 6, y: 6 },
        tiles: grid(7, 7, [
          [3, 2],
          [1, 2],
          [2, 3],
          [2, 1],
        ]),
        baseBehaviour: "wander",
        rng: () => 0,
      }),
    );
    expect(out?.score.behaviour).toBe("wander");
    expect(out?.next).toEqual({ x: 2, y: 2 });
    expect(out?.moved).toBe(false);
  });
});
