// Traversal-build lane receipts (2026-10-30, gap-fill S27): the
// tile-behaviour engine resolves ledge jumps, ice slides, spin,
// conveyor arrows, currents, cracked floors, holes and cost
// terrain the way the ported source does — proven on synthetic
// grids AND on the real authored maps (route_1's ledge rows, the
// Cave of Echoes ice room, Boot Bay's currents, Neon City's warp
// pair). WorldEngine consumes resolveTraversalStep /
// resolveStandingChain from its move path; these tests pin the
// resolution both sides agree on.
import { describe, it, expect } from "vitest";
import {
  resolveTraversalStep, resolveStandingChain, behaviorOf, CHAIN_SOLID_TILES,
  type DirName,
} from "./tileBehaviors";
import { TILE, PASSABLE } from "../world/WorldConstants";
import { FULL_WORLD } from "../world/FullWorldMaps";

type Grid = number[][];
const tileAtOf = (g: Grid) => (x: number, y: number) => g[y]?.[x];
const solidOf = (g: Grid) => (x: number, y: number) => {
  const t = g[y]?.[x];
  return t === undefined || CHAIN_SOLID_TILES.has(t);
};
const argsOf = (g: Grid) => ({ tileAt: tileAtOf(g), solid: solidOf(g) });
const step = (g: Grid, from: { x: number; y: number }, dir: DirName, cracked?: Set<string>) =>
  resolveTraversalStep({ ...argsOf(g), cracked }, from, dir);

const G = TILE.GRASS, W = TILE.WALL;

describe("tile-behaviour registry", () => {
  it("every traversal tile is steppable in PASSABLE (rules live in the engine)", () => {
    for (const t of [TILE.ICE, TILE.SPIN, TILE.CONVEYOR_E, TILE.CONVEYOR_N,
      TILE.CONVEYOR_W, TILE.CONVEYOR_S, TILE.HOLE, TILE.SNOW, TILE.MUD, TILE.CRACKED_FLOOR,
      TILE.CURRENT_E, TILE.CURRENT_N, TILE.CURRENT_W, TILE.CURRENT_S, TILE.SAND_DUNE]) {
      expect(PASSABLE[t], `tile ${t}`).toBe(true);
    }
    // The ledge is the exception, deliberately: PASSABLE false is
    // the correct record for a tile you may only cross by the
    // jump rule in one direction (tileBehaviors' collision rule).
    expect(PASSABLE[TILE.LEDGE]).toBe(false);
  });
  it("behaviorOf names each family", () => {
    expect(behaviorOf(TILE.LEDGE)).toBe("ledge");
    expect(behaviorOf(TILE.ICE)).toBe("ice");
    expect(behaviorOf(TILE.SPIN)).toBe("spin");
    expect(behaviorOf(TILE.CONVEYOR_S)).toBe("conveyor");
    expect(behaviorOf(TILE.CURRENT_N)).toBe("current");
    expect(behaviorOf(TILE.HOLE)).toBe("hole");
    expect(behaviorOf(TILE.CRACKED_FLOOR)).toBe("cracked");
    expect(behaviorOf(TILE.SNOW)).toBe("cost");
    expect(behaviorOf(TILE.WARP)).toBe("warp");
    expect(behaviorOf(TILE.GRASS)).toBe("none");
  });
});

describe("ledge jumps (emerald collision rule)", () => {
  const g: Grid = [
    [G, G, G, G, G],
    [G, G, G, G, G],
    [G, G, TILE.LEDGE, G, G],
    [G, G, G, G, G],
    [G, G, G, G, G],
  ];
  it("pressing south onto a ledge jumps it, landing one tile beyond", () => {
    const r = step(g, { x: 2, y: 1 }, "down");
    expect(r.blocked).toBe(false);
    expect(r.final).toEqual({ x: 2, y: 3 });
    expect(r.path).toEqual([{ x: 2, y: 3 }]); // the ledge tile itself is passed over, never stood on
    expect(r.effects[0]).toMatchObject({ type: "ledge-jump", over: { x: 2, y: 2 }, to: { x: 2, y: 3 } });
  });
  it("a ledge is a cliff face from below and from the side", () => {
    expect(step(g, { x: 2, y: 3 }, "up").blocked).toBe(true);
    expect(step(g, { x: 1, y: 2 }, "right").blocked).toBe(true);
    expect(step(g, { x: 3, y: 2 }, "left").blocked).toBe(true);
  });
  it("no jump when the landing is blocked", () => {
    const g2: Grid = [[G], [G], [TILE.LEDGE], [W]];
    expect(step(g2, { x: 0, y: 1 }, "down").blocked).toBe(true);
  });
});

describe("ice slide (emerald ForcedMovement_Slip)", () => {
  it("slides in the travel direction until an obstacle", () => {
    const g: Grid = [[G, TILE.ICE, TILE.ICE, TILE.ICE, W]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.final).toEqual({ x: 3, y: 0 });
    expect(r.path).toEqual([{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]);
    expect(r.effects).toContainEqual({ type: "ice-slide", tiles: 2 });
  });
  it("sliding onto plain floor ends the slide on that floor", () => {
    const g: Grid = [[G, TILE.ICE, G, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.final).toEqual({ x: 2, y: 0 });
  });
  it("a slide keeps the direction of travel, not the tile's", () => {
    const g: Grid = [
      [G, G],
      [TILE.ICE, G],
      [TILE.ICE, G],
      [W, G],
    ];
    const r = step(g, { x: 0, y: 0 }, "down");
    expect(r.final).toEqual({ x: 0, y: 2 });
  });
});

describe("spin, conveyor, warp, hole, cracked, cost", () => {
  it("spin tile: stands, spins in place (emerald mat: four quarter turns)", () => {
    const g: Grid = [[G, TILE.SPIN, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.final).toEqual({ x: 1, y: 0 });
    const spin = r.effects.find((e) => e.type === "spin") as any;
    expect(spin.turns).toHaveLength(4);
    expect(r.finalDir).toBe("right"); // a full turn ends facing the entry direction
  });
  it("conveyor arrows carry in the TILE's direction and chain", () => {
    const g: Grid = [[G, TILE.CONVEYOR_E, TILE.CONVEYOR_E, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.final).toEqual({ x: 3, y: 0 });
    expect(r.effects).toContainEqual({ type: "conveyor", tiles: 2 });
  });
  it("conveyor pointing against travel still pushes its own way", () => {
    const g: Grid = [[G, TILE.CONVEYOR_S, G], [G, G, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.final).toEqual({ x: 1, y: 1 });
  });
  it("warp tile fires the warp trigger at the landing tile", () => {
    const g: Grid = [[G, TILE.WARP, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.trigger).toEqual({ type: "warp", at: { x: 1, y: 0 } });
  });
  it("hole fires the drop trigger", () => {
    const g: Grid = [[G, TILE.HOLE, G]];
    const r = step(g, { x: 0, y: 0 }, "right");
    expect(r.trigger).toEqual({ type: "drop", at: { x: 1, y: 0 } });
  });
  it("cracked floor: first stand cracks, second stand drops", () => {
    const g: Grid = [[G, TILE.CRACKED_FLOOR, G]];
    const cracked = new Set<string>();
    const r1 = step(g, { x: 0, y: 0 }, "right", cracked);
    expect(r1.trigger).toBeNull();
    expect(r1.effects).toContainEqual({ type: "crack", at: { x: 1, y: 0 } });
    const r2 = step(g, { x: 0, y: 0 }, "right", cracked);
    expect(r2.trigger).toEqual({ type: "drop", at: { x: 1, y: 0 } });
  });
  it("cost terrain flags the press tax (snow / mud / deep sand)", () => {
    for (const t of [TILE.SNOW, TILE.MUD, TILE.SAND_DUNE]) {
      const g: Grid = [[G, t]];
      expect(step(g, { x: 0, y: 0 }, "right").costTerrain).toBe(true);
    }
    const g: Grid = [[G, G]];
    expect(step(g, { x: 0, y: 0 }, "right").costTerrain).toBe(false);
  });
});

describe("currents (standing chain, the Wave-landing path)", () => {
  const Wtr = TILE.WATER, CS = TILE.CURRENT_S;
  const g: Grid = [
    [Wtr, Wtr, Wtr],
    [Wtr, CS, Wtr],
    [Wtr, CS, Wtr],
    [Wtr, Wtr, Wtr],
  ];
  it("a southward current carries you to open water (the eddy)", () => {
    const r = resolveStandingChain(argsOf(g), { x: 1, y: 1 }, "down");
    expect(r.final).toEqual({ x: 1, y: 3 });
    expect(r.effects).toContainEqual({ type: "current", tiles: 2 });
  });
  it("a current cannot push you onto land", () => {
    const g2: Grid = [[CS], [G]];
    const r = resolveStandingChain(argsOf(g2), { x: 0, y: 0 }, "down");
    expect(r.final).toEqual({ x: 0, y: 0 });
  });
});

describe("real maps — route_1 ledges", () => {
  const map = FULL_WORLD.route_1;
  const g: Grid = map.tiles;
  it("the east grass block's south edge is a ledge row (y=11, x18–24)", () => {
    // Part 2 amendment: (18,11) is a Crag Climb face now (the
    // two-way cell in the band); the rest of the row stays ledges.
    expect(g[11][18]).toBe(TILE.ROCK_CLIMB);
    for (let x = 19; x <= 24; x++) expect(g[11][x]).toBe(TILE.LEDGE);
  });
  it("you jump it southbound out of the grass and cannot climb it back", () => {
    const r = step(g, { x: 20, y: 10 }, "down");
    expect(r.final).toEqual({ x: 20, y: 12 });
    expect(step(g, { x: 20, y: 12 }, "up").blocked).toBe(true);
  });
  it("the y=28 ledge row jumps southbound too", () => {
    const r = step(g, { x: 5, y: 27 }, "down");
    expect(r.effects[0]).toMatchObject({ type: "ledge-jump" });
    expect(r.final).toEqual({ x: 5, y: 29 });
  });
});

describe("real maps — Cave of Echoes ice room", () => {
  const map = FULL_WORLD.cave_of_echoes;
  const g: Grid = map.tiles;
  it("the chamber is ice: 30 ICE tiles with authored stoppers", () => {
    let ice = 0;
    for (const row of g) for (const t of row) if (t === TILE.ICE) ice++;
    expect(ice).toBe(30);
    expect(g[13][11]).toBe(TILE.BUILDING); // stopper rock
    expect(g[15][13]).toBe(TILE.BUILDING); // stopper rock
    expect(g[16][10]).toBe(TILE.HM_ROCK);  // stopper boulder (its own gate)
    expect(g[16][8]).toBe(TILE.HOLE);
    expect(g[12][14]).toBe(TILE.CRACKED_FLOOR);
  });
  it("the room is REACHABLE: a cave-floor passage joins the y=8 gallery", () => {
    expect(g[9][14]).toBe(TILE.CAVE);
    expect(g[10][14]).toBe(TILE.CAVE);
    expect(g[11][14]).toBe(TILE.CAVE);
    expect(g[8][14]).toBe(TILE.CAVE); // the gallery row itself
  });
  it("sliding east across the room stops at the far wall, not through it", () => {
    const r = step(g, { x: 8, y: 14 }, "right");
    expect(r.final).toEqual({ x: 14, y: 14 });
  });
  it("the stopper at (11,13) ends a westward slide on row 13", () => {
    const r = step(g, { x: 14, y: 13 }, "left");
    expect(r.final).toEqual({ x: 12, y: 13 });
  });
  it("the hole drops, and the map names its drop target (the entrance)", () => {
    const r = step(g, { x: 8, y: 15 }, "down");
    expect(r.trigger).toEqual({ type: "drop", at: { x: 8, y: 16 } });
    expect(map.dropTarget).toEqual({ to: "cave_of_echoes", enterAt: { x: 5, y: 2 } });
  });
  it("the cracked passage tile cracks once, then gives way", () => {
    const cracked = new Set<string>();
    const keyOf = (x: number, y: number) => `cave_of_echoes:${x},${y}`;
    const a = { ...argsOf(g), cracked, keyOf };
    const r1 = resolveTraversalStep(a, { x: 14, y: 11 }, "down");
    expect(r1.trigger).toBeNull();
    const r2 = resolveTraversalStep(a, { x: 14, y: 11 }, "down");
    expect(r2.trigger).toEqual({ type: "drop", at: { x: 14, y: 12 } });
  });
});

describe("real maps — warp pairs and currents", () => {
  it("Neon City's warp strip ends are a pair, on WARP tiles", () => {
    const map = FULL_WORLD.neon_city;
    expect(map.warps).toHaveLength(2);
    for (const w of map.warps) {
      expect(map.tiles[w.y][w.x]).toBe(TILE.WARP);
      expect(map.tiles[w.enterAt.y][w.enterAt.x]).toBe(TILE.WARP);
    }
  });
  it("Mauveville Arena's floor corners are a warp pair", () => {
    const map = FULL_WORLD.mauveville_arena;
    expect(map.warps).toHaveLength(2);
    for (const w of map.warps) expect(map.tiles[w.y][w.x]).toBe(TILE.WARP);
  });
  it("Boot Bay: the south lane carries you to the eddy, the north lane back", () => {
    const map = FULL_WORLD.boot_bay;
    const g: Grid = map.tiles;
    expect(g[5][10]).toBe(TILE.CURRENT_S);
    expect(g[10][20]).toBe(TILE.CURRENT_N);
    const south = resolveStandingChain(argsOf(g), { x: 10, y: 2 }, "down");
    expect(south.final).toEqual({ x: 10, y: 13 }); // open water past the lane end
    const north = resolveStandingChain(argsOf(g), { x: 20, y: 17 }, "up");
    expect(north.final).toEqual({ x: 20, y: 6 });
  });
});
