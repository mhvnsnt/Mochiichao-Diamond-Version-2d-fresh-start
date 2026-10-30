// Traversal part 2 receipts (2026-10-30): the completion systems —
// the boulder object system (boulders.ts), the bike programme
// (bike.ts), climb faces + waterfall rides (tileBehaviors.ts
// part-2 resolvers) — proven on synthetic grids AND on the real
// authored placements (Cave of Echoes junction + pool, the Scrap
// Junkyard cache pen, Dojo 1's training devices, Route 2's bike
// grammar, Route 1's climb faces and pond falls, Coral's reef
// falls, Boot Bay's dive spots and the paired dive area).
import { describe, it, expect } from "vitest";
import {
  resolveClimb, resolveCascade, resolveStandingChain, CHAIN_SOLID_TILES,
} from "./tileBehaviors";
import {
  tryPushBoulder, switchesHeld, mapHasSwitch, isLooseBoulderOverride,
} from "./boulders";
import {
  stepIntervalMs, crossesCrackedClean, canClimbSlope, tryAcroHop,
  MACH_FULL_CHARGE, BIKE_ITEM_ID,
} from "./bike";
import { tableFor } from "./encounters";
import { TILE, PASSABLE } from "../world/WorldConstants";
import { FULL_WORLD } from "../world/FullWorldMaps";

type Grid = number[][];
const tileAtOf = (g: Grid) => (x: number, y: number) => g[y]?.[x];
const applyWrites = (g: Grid, writes: Record<string, number>) => {
  for (const [k, v] of Object.entries(writes)) {
    const [x, y] = k.split(",").map(Number);
    g[y][x] = v;
  }
};
const noNpc = () => false;

describe("boulder object system (boulders.ts)", () => {
  const F = TILE.PATH, B = TILE.HM_BOULDER;
  it("a push moves the boulder exactly one tile and restores its cell", () => {
    const g: Grid = [[F, F, F], [F, B, F], [F, F, F]];
    const under = (x: number, y: number) => g[y][x] === B ? F : g[y][x];
    const r = tryPushBoulder(1, 1, 1, 0, tileAtOf(g), under, noNpc, F);
    expect(r.moved).toBe(true);
    expect(r.writes).toEqual({ "1,1": F, "2,1": B });
  });
  it("pushed into a hole, the boulder falls and the hole fills", () => {
    const g: Grid = [[F, F, F], [F, B, TILE.HOLE], [F, F, F]];
    const under = (x: number, y: number) => g[y][x] === B ? F : g[y][x];
    const r = tryPushBoulder(1, 1, 1, 0, tileAtOf(g), under, noNpc, F);
    expect(r.moved).toBe(true);
    expect(r.fellAt).toEqual({ x: 2, y: 1 });
    expect(r.writes["2,1"]).toBe(F); // filled with the floor
    expect(r.writes["1,1"]).toBe(F); // boulder gone from its cell
  });
  it("pushed onto a floor switch, it rests there and holds it", () => {
    const authored: Grid = [[F, F, F], [F, B, TILE.FLOOR_SWITCH], [F, F, F]];
    const eff: Grid = authored.map((r) => [...r]);
    const r = tryPushBoulder(1, 1, 1, 0, tileAtOf(eff),
      (x, y) => authored[y][x] === B ? F : authored[y][x], noNpc, F);
    expect(r.onSwitch).toEqual({ x: 2, y: 1 });
    applyWrites(eff, r.writes);
    expect(switchesHeld(tileAtOf(authored), tileAtOf(eff), [], 3, 3)).toBe(true);
  });
  it("a person standing on a switch holds it too", () => {
    const g: Grid = [[F, F, F], [F, TILE.FLOOR_SWITCH, F], [F, F, F]];
    expect(switchesHeld(tileAtOf(g), tileAtOf(g), [{ x: 1, y: 1 }], 3, 3)).toBe(true);
    expect(switchesHeld(tileAtOf(g), tileAtOf(g), [{ x: 0, y: 0 }], 3, 3)).toBe(false);
    expect(mapHasSwitch(tileAtOf(g), 3, 3)).toBe(true);
  });
  it("blocked cases match the source's collision set", () => {
    const mk = (beyond: number) => [[TILE.PATH, TILE.PATH, TILE.PATH], [TILE.PATH, B, beyond], [TILE.PATH, TILE.PATH, TILE.PATH]];
    for (const solid of [TILE.WALL, TILE.WATER, TILE.HM_ROCK, TILE.LEDGE, TILE.HM_BOULDER, TILE.ROCK_CLIMB]) {
      const r = tryPushBoulder(1, 1, 1, 0, tileAtOf(mk(solid)), tileAtOf(mk(solid)), noNpc, TILE.PATH);
      expect(r.moved, `beyond=${solid}`).toBe(false);
      expect(r.blockedBy).toBe("solid");
    }
    const door = tryPushBoulder(1, 1, 1, 0, tileAtOf(mk(TILE.DOOR)), tileAtOf(mk(TILE.DOOR)), noNpc, TILE.PATH);
    expect(door.blockedBy).toBe("door");
    const npc = tryPushBoulder(1, 1, 1, 0, tileAtOf(mk(TILE.PATH)), tileAtOf(mk(TILE.PATH)), () => true, TILE.PATH);
    expect(npc.blockedBy).toBe("npc");
    const edge = tryPushBoulder(0, 0, -1, 0, tileAtOf(mk(TILE.PATH)), tileAtOf(mk(TILE.PATH)), noNpc, TILE.PATH);
    expect(edge.blockedBy).toBe("edge");
  });
  it("the reload rule: loose boulders reset, filled holes persist", () => {
    expect(isLooseBoulderOverride(TILE.HM_BOULDER, TILE.PATH)).toBe(true);  // vacated home cell
    expect(isLooseBoulderOverride(TILE.PATH, TILE.HM_BOULDER)).toBe(true);  // pushed-to cell
    expect(isLooseBoulderOverride(TILE.FLOOR_SWITCH, TILE.HM_BOULDER)).toBe(true); // switch releases
    expect(isLooseBoulderOverride(TILE.HOLE, TILE.PATH)).toBe(false);       // a fill stays filled
    expect(isLooseBoulderOverride(TILE.HM_ROCK, TILE.PATH)).toBe(false);    // smashed rock (S-3) unrelated
    expect(isLooseBoulderOverride(TILE.PATH, TILE.PATH)).toBe(false);
  });
});

describe("bike programme rules (bike.ts)", () => {
  it("step rates extend the walk/sprint ladder", () => {
    expect(stepIntervalMs("foot", 0)).toBe(140);
    expect(stepIntervalMs("acro", 0)).toBe(90);
    expect(stepIntervalMs("mach", 0)).toBe(80);
    expect(stepIntervalMs("mach", MACH_FULL_CHARGE)).toBe(45);
  });
  it("cracked floors cross clean only at Mach full speed", () => {
    expect(crossesCrackedClean("mach", MACH_FULL_CHARGE)).toBe(true);
    expect(crossesCrackedClean("mach", MACH_FULL_CHARGE - 1)).toBe(false);
    expect(crossesCrackedClean("acro", 0)).toBe(false);
    expect(crossesCrackedClean("foot", 99)).toBe(false);
  });
  it("muddy slopes climb at Mach speed or on the Acro wheelie", () => {
    expect(canClimbSlope("mach", MACH_FULL_CHARGE)).toBe(true);
    expect(canClimbSlope("mach", 1)).toBe(false);
    expect(canClimbSlope("acro", 0)).toBe(true);
    expect(canClimbSlope("foot", 0)).toBe(false);
  });
  it("the acro hop clears hop-class obstacles onto standable ground", () => {
    const hop = tryAcroHop("acro", 0, 1, TILE.HOP_RAIL, TILE.PATH, true);
    expect(hop).toEqual({ hop: true, landDx: 0, landDy: 2 });
    expect(tryAcroHop("acro", 1, 0, TILE.LEDGE, TILE.GRASS, true).hop).toBe(true);
    expect(tryAcroHop("acro", 1, 0, TILE.HOLE, TILE.GRASS, true).hop).toBe(true);
    expect(tryAcroHop("mach", 0, 1, TILE.HOP_RAIL, TILE.PATH, true).hop).toBe(false);
    expect(tryAcroHop("foot", 0, 1, TILE.HOP_RAIL, TILE.PATH, true).hop).toBe(false);
    expect(tryAcroHop("acro", 0, 1, TILE.HOP_RAIL, TILE.WATER, false).hop).toBe(false);
    expect(tryAcroHop("acro", 0, 1, TILE.WALL, TILE.PATH, true).hop).toBe(false);
  });
  it("the bike is a neutral key item id", () => {
    expect(BIKE_ITEM_ID).toBe("bike");
  });
});

describe("climb faces (resolveClimb)", () => {
  const G = TILE.GRASS, C = TILE.ROCK_CLIMB;
  const g: Grid = [
    [G, G, G],
    [G, C, G],
    [G, C, G],
    [G, G, G],
  ];
  const standable = (x: number, y: number) => {
    const t = g[y]?.[x];
    return t !== undefined && PASSABLE[t] === true;
  };
  it("from below, you scale the whole run to the ledge above", () => {
    const r = resolveClimb({ x: 1, y: 3 }, "up", tileAtOf(g), standable);
    expect(r.climbed).toBe(true);
    expect(r.to).toEqual({ x: 1, y: 0 });
    expect(r.faceRun).toHaveLength(2);
  });
  it("from the plateau edge, the same scan descends", () => {
    const r = resolveClimb({ x: 1, y: 0 }, "down", tileAtOf(g), standable);
    expect(r.climbed).toBe(true);
    expect(r.to).toEqual({ x: 1, y: 3 });
  });
  it("no face, no climb; a blocked landing refuses", () => {
    expect(resolveClimb({ x: 0, y: 3 }, "up", tileAtOf(g), standable).climbed).toBe(false);
    const g2: Grid = [[TILE.WALL], [C], [G]];
    const r = resolveClimb({ x: 0, y: 2 }, "up", tileAtOf(g2), (x, y) => PASSABLE[g2[y]?.[x]] === true);
    expect(r.climbed).toBe(false);
  });
});

describe("waterfall rides (resolveCascade)", () => {
  const W = TILE.WATER, F = TILE.HM_WATERFALL, S = TILE.SAND;
  const g: Grid = [
    [W, S, W],
    [W, F, W],
    [W, F, W],
    [W, W, W],
  ];
  const enterable = (x: number, y: number) => {
    const t = g[y]?.[x];
    return t === W || t === S;
  };
  it("up the run lands on the bank above", () => {
    const r = resolveCascade({ x: 1, y: 2 }, "up", tileAtOf(g), enterable);
    expect(r).toEqual({ rode: true, to: { x: 1, y: 0 }, dir: "up" });
  });
  it("down the run lands in the pool below", () => {
    const r = resolveCascade({ x: 1, y: 1 }, "down", tileAtOf(g), enterable);
    expect(r).toEqual({ rode: true, to: { x: 1, y: 3 }, dir: "down" });
  });
  it("a non-falls tile and a blocked landing refuse", () => {
    expect(resolveCascade({ x: 0, y: 0 }, "down", tileAtOf(g), enterable).rode).toBe(false);
    expect(resolveCascade({ x: 1, y: 2 }, "up", tileAtOf(g), () => false).rode).toBe(false);
  });
});

describe("real maps — Cave of Echoes junction + pool (part 2)", () => {
  const map = FULL_WORLD.cave_of_echoes;
  const g: Grid = map.tiles;
  it("the junction carries a hole west and a boulder east", () => {
    expect(g[20][14]).toBe(TILE.HOLE);
    expect(g[20][17]).toBe(TILE.HM_BOULDER);
    expect(map.boulderFloor).toBe(TILE.CAVE);
  });
  it("three pushes west fill the hole and open the corridor", () => {
    const eff: Grid = g.map((r) => [...r]);
    const at = tileAtOf(eff);
    const under = (x: number, y: number) => g[y][x] === TILE.HM_BOULDER ? TILE.CAVE : g[y][x];
    let bx = 17;
    for (let i = 0; i < 3; i++) {
      const r = tryPushBoulder(bx, 20, -1, 0, at, under, noNpc, TILE.CAVE);
      expect(r.moved).toBe(true);
      applyWrites(eff, r.writes);
      if (r.fellAt) expect(r.fellAt).toEqual({ x: 14, y: 20 });
      bx -= 1;
    }
    expect(eff[20][14]).toBe(TILE.CAVE); // hole filled
    for (let x = 14; x <= 18; x++) expect(PASSABLE[eff[20][x]], `x=${x}`).toBe(true);
  });
  it("the pool has shores and a dive spot, paired both ways", () => {
    expect(g[24][13]).toBe(TILE.CAVE);       // west shore
    expect(g[21][18]).toBe(TILE.CAVE);       // north shore
    expect(g[24][18]).toBe(TILE.DIVE_SPOT);  // the spot itself
    const link = map.diveLinks.find((l: any) => l.x === 18 && l.y === 24);
    expect(link.to).toBe("boot_bay_deep");
    const deep = FULL_WORLD.boot_bay_deep;
    const back = deep.diveLinks.find((l: any) => l.to === "cave_of_echoes");
    expect(back.enterAt).toEqual({ x: 18, y: 24 });
    expect(deep.tiles[back.y][back.x]).toBe(TILE.DIVE_SPOT);
  });
});

describe("real maps — the Scrap Junkyard cache pen (part 2)", () => {
  const map = FULL_WORLD.scrap_junkyard;
  const g: Grid = map.tiles;
  it("the pen's pieces are authored as designed", () => {
    expect(g[17][18]).toBe(TILE.HM_BOULDER);   // the lane boulder
    expect(g[20][18]).toBe(TILE.HOLE);         // the mouth
    expect(g[21][16]).toBe(TILE.WARP);         // the service pad
    expect(g[21][19]).toBe(TILE.SWITCH_GATE);  // the gate
    expect(g[22][18]).toBe(TILE.HM_BOULDER);   // the inner boulder
    expect(g[22][19]).toBe(TILE.FLOOR_SWITCH); // the switch
    expect(map.boulderFloor).toBe(TILE.INDUSTRIAL);
    expect(map.warps).toContainEqual({ x: 16, y: 21, to: "scrap_junkyard", enterAt: { x: 29, y: 18 } });
    expect(map.dropTarget.enterAt).toEqual({ x: 29, y: 18 });
  });
  it("the lane boulder falls into the mouth on the third push", () => {
    const eff: Grid = g.map((r) => [...r]);
    const at = tileAtOf(eff);
    const under = (x: number, y: number) => g[y][x] === TILE.HM_BOULDER ? TILE.INDUSTRIAL : g[y][x];
    let by = 17;
    let fell = false;
    for (let i = 0; i < 3; i++) {
      const r = tryPushBoulder(18, by, 0, 1, at, under, noNpc, TILE.INDUSTRIAL);
      expect(r.moved).toBe(true);
      applyWrites(eff, r.writes);
      if (r.fellAt) { fell = true; expect(r.fellAt).toEqual({ x: 18, y: 20 }); }
      by += 1;
    }
    expect(fell).toBe(true);
    expect(eff[20][18]).toBe(TILE.INDUSTRIAL);
  });
  it("the inner boulder holds the switch and the gate's inputs agree", () => {
    const eff: Grid = g.map((r) => [...r]);
    const at = tileAtOf(eff);
    const under = (x: number, y: number) => g[y][x] === TILE.HM_BOULDER ? TILE.INDUSTRIAL : g[y][x];
    expect(switchesHeld(tileAtOf(g), at, [], map.width, map.height)).toBe(false);
    const r = tryPushBoulder(18, 22, 1, 0, at, under, noNpc, TILE.INDUSTRIAL);
    expect(r.onSwitch).toEqual({ x: 19, y: 22 });
    applyWrites(eff, r.writes);
    expect(switchesHeld(tileAtOf(g), tileAtOf(eff), [], map.width, map.height)).toBe(true);
  });
});

describe("real maps — Dojo 1 training devices (part 2)", () => {
  const map = FULL_WORLD.dojo_1;
  const g: Grid = map.tiles;
  it("spin pads flank the approach; the conveyor runs up the aisle", () => {
    expect(g[5][5]).toBe(TILE.SPIN);
    expect(g[5][10]).toBe(TILE.SPIN);
    expect(g[13][7]).toBe(TILE.CONVEYOR_N);
    expect(g[14][7]).toBe(TILE.CONVEYOR_N);
  });
  it("the conveyor carries a step two tiles north (tile-only solids)", () => {
    // In the live engine Acolyte Ken stands at (7,12) and the
    // chain stops against him at (7,13); the tile layer alone
    // carries onto his floor cell. Both readings are the source's:
    // the chain stops at the first solid, NPCs included.
    const r = resolveStandingChain(
      { tileAt: tileAtOf(g), solid: (x, y) => { const t = g[y]?.[x]; return t === undefined || CHAIN_SOLID_TILES.has(t); } },
      { x: 7, y: 14 }, "up");
    expect(r.final).toEqual({ x: 7, y: 12 });
    expect(r.effects).toContainEqual({ type: "conveyor", tiles: 2 });
  });
});

describe("real maps — Route 2 bike grammar (part 2)", () => {
  const map = FULL_WORLD.route_2;
  const g: Grid = map.tiles;
  it("the slope band spans the road at y=8, below the route sign", () => {
    for (let x = 12; x <= 16; x++) expect(g[8][x]).toBe(TILE.SLOPE);
    expect(g[10][14]).toBe(TILE.PATH); // the sign's cell stays path
  });
  it("hop rails flank a centre gap at y=14", () => {
    for (const x of [12, 13, 15, 16]) expect(g[14][x]).toBe(TILE.HOP_RAIL);
    expect(g[14][14]).toBe(TILE.PATH);
  });
  it("the cracked stretch leaves its centre cell sound; drops land at the Neon end", () => {
    for (const x of [12, 13, 15, 16]) expect(g[24][x]).toBe(TILE.CRACKED_FLOOR);
    expect(g[24][14]).toBe(TILE.PATH);
    expect(map.dropTarget).toEqual({ to: "route_2", enterAt: { x: 14, y: 38 } });
  });
});

describe("real maps — Route 1 climb faces + pond falls (part 2)", () => {
  const map = FULL_WORLD.route_1;
  const g: Grid = map.tiles;
  const standable = (x: number, y: number) => {
    const t = g[y]?.[x];
    return t !== undefined && PASSABLE[t] === true && !CHAIN_SOLID_TILES.has(t);
  };
  it("the faces sit in the ledge bands", () => {
    expect(g[11][18]).toBe(TILE.ROCK_CLIMB);
    expect(g[28][20]).toBe(TILE.ROCK_CLIMB);
  });
  it("the east face climbs both ways between (18,12) and (18,10)", () => {
    expect(resolveClimb({ x: 18, y: 12 }, "up", tileAtOf(g), standable).to).toEqual({ x: 18, y: 10 });
    expect(resolveClimb({ x: 18, y: 10 }, "down", tileAtOf(g), standable).to).toEqual({ x: 18, y: 12 });
  });
  it("the south face returns you from the pond shore to the mid-route", () => {
    expect(resolveClimb({ x: 20, y: 29 }, "up", tileAtOf(g), standable).to).toEqual({ x: 20, y: 27 });
  });
  it("the pond falls ride up to the sand and down to the pond", () => {
    const enterable = (x: number, y: number) => {
      const t = g[y]?.[x];
      return t === TILE.WATER || (t !== undefined && PASSABLE[t] === true);
    };
    expect(g[30][24]).toBe(TILE.HM_WATERFALL);
    expect(resolveCascade({ x: 24, y: 30 }, "up", tileAtOf(g), enterable).to).toEqual({ x: 24, y: 29 });
    expect(resolveCascade({ x: 24, y: 30 }, "down", tileAtOf(g), enterable).to).toEqual({ x: 24, y: 31 });
  });
});

describe("real maps — Coral reef falls + Boot Bay dive (part 2)", () => {
  it("Coral's falls is authored at (12,20) and rides across the channel", () => {
    const g: Grid = FULL_WORLD.coral_approach.tiles;
    expect(g[20][12]).toBe(TILE.HM_WATERFALL);
    const enterable = (x: number, y: number) => {
      const t = g[y]?.[x];
      return t === TILE.WATER || t === TILE.SHALLOW || t === TILE.DOCK;
    };
    const r = resolveCascade({ x: 12, y: 20 }, "left", tileAtOf(g), enterable);
    expect(r.rode).toBe(true);
    expect(r.to).toEqual({ x: 11, y: 20 });
    expect(r.dir).toBe("across");
  });
  it("Boot Bay's spots pair into one dive area, and back", () => {
    const bay = FULL_WORLD.boot_bay;
    expect(bay.tiles[9][8]).toBe(TILE.DIVE_SPOT);
    expect(bay.tiles[14][24]).toBe(TILE.DIVE_SPOT);
    expect(bay.diveLinks).toHaveLength(2);
    const deep = FULL_WORLD.boot_bay_deep;
    expect(deep.underwater).toBe(true);
    expect(deep.diveLinks).toHaveLength(3);
    for (const l of bay.diveLinks) {
      expect(deep.tiles[l.enterAt.y][l.enterAt.x]).not.toBe(TILE.WALL);
    }
  });
  it("the dive area has seaweed ground and no invented encounter tables", () => {
    const deep = FULL_WORLD.boot_bay_deep;
    let seaweed = 0;
    for (const row of deep.tiles) for (const t of row) if (t === TILE.SEAWEED) seaweed++;
    expect(seaweed).toBeGreaterThan(0);
    // The selector has no dive table and no surf table binds a
    // real map: the consumers are wired, the grounds honestly
    // empty (TRAVERSAL-CENSUS-2 records this in words).
    expect(tableFor("boot_bay_deep", "dive")).toBeNull();
    expect(tableFor("boot_bay", "surf")).toBeNull();
  });
});
