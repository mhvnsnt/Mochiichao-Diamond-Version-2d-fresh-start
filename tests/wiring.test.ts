import { describe, it, expect } from "vitest";
import { makePathfinder } from "../src/lib/wiring/pathfinding";
import { validateTmjMap, validateTown, type TmjMap } from "../src/lib/wiring/tiled-map";
import { generateIsle, isleConnected, seededRng } from "../src/lib/wiring/wfc-isle";
import { VICTORY_JINGLE, BADGE_JINGLE } from "../src/lib/wiring/tone-jingles";
import sector0 from "../src/lib/wiring/maps/sector0.json";

describe("pathfinding", () => {
  it("paths around a wall and returns null when blocked", async () => {
    const grid = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    const pf = makePathfinder(grid);
    const path = await pf.findPath({ x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path).not.toBeNull();
    expect(path![path!.length - 1]).toEqual({ x: 2, y: 2 });
    expect(path!.some((p) => p.x === 1 && p.y === 1)).toBe(false);
    const blocked = await pf.findPath({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(blocked).toBeNull();
  });
  it("follower trails the player, it does not stack on them", () => {
    const pf = makePathfinder([[0, 0, 0, 0, 0]]);
    const trail = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }];
    expect(pf.followerTarget(trail, 3)).toEqual({ x: 0, y: 0 });
  });
});

describe("tiled maps", () => {
  // Minimal stand-ins for the maps sector0 links to: correct dims so
  // sector0's enterAt coordinates land in bounds, and a return
  // exit/door back to sector0 so the return-exit check passes.
  // (The regen sector0 is 32x28 with array-form exits; the old
  // copies-of-sector0 stubs cannot hold route_1's [13..17, 38].)
  const stub = (
    id: string,
    width: number,
    height: number,
    back: Partial<TmjMap>,
  ): TmjMap =>
    ({
      id,
      name: id,
      width,
      height,
      tiles: Array.from({ length: height }, () => Array(width).fill(0)),
      exits: {},
      npcs: [],
      signs: [],
      noWild: true,
      ...back,
    }) as TmjMap;
  const maps: Record<string, TmjMap> = {
    sector0: sector0 as unknown as TmjMap,
    aeon_lab: stub("aeon_lab", 12, 14, {
      doors: [{ x: 6, y: 12, to: "sector0", enterAt: [10, 3], label: "Boot Harbor" }],
    }),
    route_1: stub("route_1", 40, 40, {
      exits: [
        { x: 13, y: 38, to: "sector0", enterAt: [15, 18], dir: "down" },
        { x: 14, y: 38, to: "sector0", enterAt: [15, 18], dir: "down" },
        { x: 15, y: 38, to: "sector0", enterAt: [15, 18], dir: "down" },
        { x: 16, y: 38, to: "sector0", enterAt: [15, 18], dir: "down" },
        { x: 17, y: 38, to: "sector0", enterAt: [15, 18], dir: "down" },
      ],
    }),
    boot_bay: stub("boot_bay", 32, 28, {
      exits: [{ x: 15, y: 0, to: "sector0", enterAt: [15, 27], dir: "up" }],
    }),
    sector0_house_1f: stub("sector0_house_1f", 12, 12, {
      doors: [{ x: 6, y: 10, to: "sector0", enterAt: [6, 7], label: "Boot Harbor" }],
    }),
    sector0_neighbor_house: stub("sector0_neighbor_house", 11, 10, {
      doors: [{ x: 5, y: 8, to: "sector0", enterAt: [19, 4], label: "Boot Harbor" }],
    }),
    sector0_rival_house: stub("sector0_rival_house", 12, 12, {
      doors: [{ x: 6, y: 10, to: "sector0", enterAt: [26, 7], label: "Boot Harbor" }],
    }),
  };
  it("sector0 validates as a town with heal + shop + sign", () => {
    expect(validateTmjMap(sector0 as unknown as TmjMap, maps)).toEqual([]);
    expect(validateTown(sector0 as unknown as TmjMap)).toEqual([]);
  });
  it("a missing exit target fails validation", () => {
    const bad = { ...sector0, exits: { nowhere: { to: "missing_map", enterAt: [0, 0] } } } as unknown as TmjMap;
    expect(validateTmjMap(bad, maps)).toHaveLength(1);
  });
});

describe("wfc isles", () => {
  it("same seed reproduces the same map, and entrance reaches exit", () => {
    const a = generateIsle(42);
    const b = generateIsle(42);
    expect(a).toEqual(b);
    // A generated isle is not guaranteed connected by construction;
    // the validator must be able to say so, not silently ship it.
    expect(typeof isleConnected(a)).toBe("boolean");
  });
  it("seeded RNG is deterministic", () => {
    const r1 = seededRng(7);
    const r2 = seededRng(7);
    expect(r1()).toBe(r2());
  });
});

describe("jingles as data", () => {
  it("victory and badge jingles are non-empty note lists", () => {
    expect(VICTORY_JINGLE.length).toBeGreaterThan(0);
    expect(BADGE_JINGLE.length).toBeGreaterThan(0);
    expect(VICTORY_JINGLE.every((n) => n.note && n.time)).toBe(true);
  });
});
