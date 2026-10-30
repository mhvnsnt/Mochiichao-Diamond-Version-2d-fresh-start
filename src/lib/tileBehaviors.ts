// Tile-behaviour engine — traversal-build lane (2026-10-30,
// gap-fill S27). Before this module the traversal tiles were paint:
// TILE.LEDGE acted as a plain tile you could walk across in any
// direction, TILE.ICE was walkable floor with no slide, TILE.WARP
// was a coloured square, and spin/conveyor/hole/current/cost tiles
// did not exist at all. This module is the behaviour layer the
// movement path was missing; WorldEngine calls it from move().
//
// PROVENANCE (source-first, per system):
// - The forced-movement model is pret-pokeemerald's, ported at the
//   C→TypeScript seam: src/field_player_avatar.c holds the table
//   sForcedMovementTestFuncs / sForcedMovementFuncs — after every
//   step the engine tests the metatile behaviour of the tile the
//   player STANDS ON and runs the matching forced movement (Slip
//   for ice, Walk* for arrow floors, PushedByCurrent for currents,
//   Slide* for slide tiles, MatSpin for the spin mat, MuddySlope).
//   Our chain loop below is that table, evaluated repeatedly until
//   no forced movement applies or a step is blocked.
// - Ledge jumping is emerald's collision-time rule, not a standing
//   behaviour: PlayerNotOnBikeMoving / DoForcedMovement check
//   CheckForPlayerAvatarCollision, which calls ShouldJumpLedge →
//   GetLedgeJumpDirection (src/event_object_movement.c) — the
//   TARGET tile's jump behaviour must match the travel direction,
//   and the jump lands on the tile BEYOND the ledge. A ledge whose
//   jump direction does not match is simply impassable.
// - Behaviours are keyed by metatile behaviour, per
//   include/constants/metatile_behaviors.h (MB_JUMP_*, MB_ICE,
//   MB_WALK_*, MB_*WARD_CURRENT, MB_CRACKED_FLOOR,
//   MB_CRACKED_FLOOR_HOLE, MB_DEEP_SAND, MB_MUDDY_SLOPE,
//   MB_SECRET_BASE_SPIN_MAT) and src/metatile_behavior.c's Is*
//   predicates.
// - Per-gen differences, NOT averaged (owner rule): Gen 4
//   (pret-pokeheartgold include/constants/metatile_behavior.h)
//   splits the slide family into per-tile TILE_BEHAVIOR_SLIDE_*
//   directions and adds TILE_BEHAVIOR_STOP_SLIDING, and its ledges
//   are likewise per-direction TILE_BEHAVIOR_JUMP_*. Emerald's ice
//   keeps the TRAVEL direction (ForcedMovement_Slip →
//   DoForcedMovementInCurrentDirection). Emerald is the most recent
//   held source whose field-movement code is fully read here, so
//   the slide port follows emerald; our single authored ICE tile
//   carries the travel-direction rule. Our authored LEDGE tile is
//   the south-facing jump ledge (MB_JUMP_SOUTH / HGSS
//   TILE_BEHAVIOR_JUMP_SOUTH) — the only direction our maps author
//   (rows you jump DOWN off, per WORLD-EXPERIENCES §1) — recorded
//   as an authoring fact, not a universal: the engine's ledge rule
//   takes its direction from LEDGE_JUMP_DIR below, one place.
// - Spin: emerald's spin mat (PlayerAvatar_SecretBaseMatSpinStep0–3)
//   rotates the player through four quarter-turn steps in place.
//   Gen 1's spin tiles also translate the player; that translation
//   is a different, older behaviour and is NOT ported — the census
//   records the difference.
// - Cracked floor: emerald's MB_CRACKED_FLOOR breaks under the
//   player into MB_CRACKED_FLOOR_HOLE. Our authored rule, stated
//   here so it is design and not accident: the first stand cracks
//   the tile (effect, no fall), the second stand drops the player
//   through it. (Emerald times the break by bike speed instead;
//   we have no bike yet — census S34.)
// - Movement cost: MB_DEEP_SAND / Gen 4 deep snow slow the player.
//   The source expresses this as speed, our tile-step mover
//   expresses it as steps: standing on cost terrain at the end of
//   a move consumes the player's NEXT voluntary press (half rate).
//
// Seam notes: the source runs per-frame with pixel movement; our
// mover is one tile per press (WorldEngine). The port therefore
// resolves a whole press — first step plus the full forced chain —
// synchronously and returns the path, which WorldEngine applies as
// the step (the follower trail and step cues read the final tile,
// exactly as they read a one-tile step today). NPC and gate
// handling stay in WorldEngine: this module only knows tiles.

import { TILE } from "../world/WorldConstants";

export type DirName = "up" | "down" | "left" | "right";
export const DIR_VEC: Record<DirName, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};
const CW: Record<DirName, DirName> = { up: "right", right: "down", down: "left", left: "up" };

export type TileAt = (x: number, y: number) => number | undefined;
/** Hard solids for chain steps: out of bounds, NPC-occupied, and
 *  wall-class tiles. Supplied by the caller (WorldEngine owns NPC
 *  positions and map bounds; tests supply their own). Water is NOT
 *  a hard solid here — the engine's family rules decide water. */
export type SolidAt = (x: number, y: number) => boolean;

/** Tiles a forced chain can never enter (wall-class). WorldEngine
 *  builds its SolidAt from this set + bounds + NPC + exits/doors. */
export const CHAIN_SOLID_TILES: ReadonlySet<number> = new Set([
  TILE.WALL, TILE.BUILDING, TILE.HM_ROCK, TILE.HM_CUT, TILE.HM_WATERFALL,
  TILE.FENCE, TILE.HM_BOULDER,
  TILE.TERMINAL, TILE.COUNTER, TILE.PLANT, TILE.HEAL_MACHINE, TILE.BENCH, TILE.BED,
]);

const WATER_FAMILY: ReadonlySet<number> = new Set([
  TILE.WATER, TILE.SHALLOW, TILE.DIVE_SPOT,
  TILE.CURRENT_E, TILE.CURRENT_N, TILE.CURRENT_W, TILE.CURRENT_S,
]);
const CURRENT_DIR: Record<number, DirName> = {
  [TILE.CURRENT_E]: "right", [TILE.CURRENT_N]: "up",
  [TILE.CURRENT_W]: "left", [TILE.CURRENT_S]: "down",
};
const CONVEYOR_DIR: Record<number, DirName> = {
  [TILE.CONVEYOR_E]: "right", [TILE.CONVEYOR_N]: "up",
  [TILE.CONVEYOR_W]: "left", [TILE.CONVEYOR_S]: "down",
};
/** The authored direction of our single ledge tile. See header. */
export const LEDGE_JUMP_DIR: DirName = "down";
/** Tiles that cost a step to cross (movement-cost terrain). */
export const COST_TILES: ReadonlySet<number> = new Set([TILE.SNOW, TILE.MUD, TILE.SAND_DUNE]);

export type BehaviorKind =
  | "ledge" | "ice" | "spin" | "conveyor" | "hole" | "cracked"
  | "cost" | "current" | "warp" | "none";

export function behaviorOf(tile: number | undefined): BehaviorKind {
  switch (tile) {
    case TILE.LEDGE: return "ledge";
    case TILE.ICE: return "ice";
    case TILE.SPIN: return "spin";
    case TILE.HOLE: return "hole";
    case TILE.CRACKED_FLOOR: return "cracked";
    case TILE.WARP: return "warp";
    default:
      if (tile !== undefined && tile in CONVEYOR_DIR) return "conveyor";
      if (tile !== undefined && tile in CURRENT_DIR) return "current";
      if (tile !== undefined && COST_TILES.has(tile)) return "cost";
      return "none";
  }
}

export type TraversalEffect =
  | { type: "ledge-jump"; over: { x: number; y: number }; to: { x: number; y: number } }
  | { type: "ice-slide"; tiles: number }
  | { type: "conveyor"; tiles: number }
  | { type: "current"; tiles: number }
  | { type: "spin"; at: { x: number; y: number }; turns: DirName[] }
  | { type: "crack"; at: { x: number; y: number } };

export interface TraversalResolution {
  /** True when the press produced any movement. */
  moved: boolean;
  /** True when the press produced no movement (bump). */
  blocked: boolean;
  /** Every tile entered, in order, excluding the start tile. */
  path: { x: number; y: number }[];
  final: { x: number; y: number };
  finalDir: DirName;
  effects: TraversalEffect[];
  /** Standing trigger at the final tile, resolved by the caller
   *  against map data (warps list / drop target). */
  trigger: { type: "warp" | "drop"; at: { x: number; y: number } } | null;
  /** Final tile is movement-cost terrain: the caller consumes the
   *  player's next voluntary press (the ported cost rule). */
  costTerrain: boolean;
}

export interface ChainArgs {
  tileAt: TileAt;
  solid: SolidAt;
  /** Tiles already cracked once, keyed by keyOf. Mutated: a first
   *  stand adds its key (the crack is a world fact for the visit). */
  cracked?: Set<string>;
  keyOf?: (x: number, y: number) => string;
}

const MAX_CHAIN = 64;

function enterableOnFoot(a: ChainArgs, x: number, y: number): boolean {
  const t = a.tileAt(x, y);
  if (t === undefined) return false;
  if (a.solid(x, y)) return false;
  if (WATER_FAMILY.has(t)) return false;
  return true;
}
function enterableOnWater(a: ChainArgs, x: number, y: number): boolean {
  const t = a.tileAt(x, y);
  if (t === undefined) return false;
  if (a.solid(x, y)) return false;
  return WATER_FAMILY.has(t);
}

/**
 * The forced-movement chain (emerald's sForcedMovement table):
 * starting from a tile the player already stands on, apply the
 * standing tile's forced movement until none applies, a step is
 * blocked, or a standing trigger (warp/drop) fires.
 */
export function resolveStandingChain(
  a: ChainArgs,
  start: { x: number; y: number },
  travelDir: DirName,
): TraversalResolution {
  const path: { x: number; y: number }[] = [];
  const effects: TraversalEffect[] = [];
  let trigger: TraversalResolution["trigger"] = null;
  let pos = { ...start };
  let dir = travelDir;
  let slideTiles = 0, conveyorTiles = 0, currentTiles = 0;
  const spunOn = new Set<string>();
  const keyOf = a.keyOf ?? ((x: number, y: number) => `${x},${y}`);

  const flushCounts = () => {
    if (slideTiles > 0) effects.push({ type: "ice-slide", tiles: slideTiles });
    if (conveyorTiles > 0) effects.push({ type: "conveyor", tiles: conveyorTiles });
    if (currentTiles > 0) effects.push({ type: "current", tiles: currentTiles });
    slideTiles = conveyorTiles = currentTiles = 0;
  };

  for (let i = 0; i < MAX_CHAIN; i++) {
    const t = a.tileAt(pos.x, pos.y);
    const b = behaviorOf(t);
    if (b === "warp") { trigger = { type: "warp", at: { ...pos } }; break; }
    if (b === "hole") { trigger = { type: "drop", at: { ...pos } }; break; }
    if (b === "cracked") {
      const key = keyOf(pos.x, pos.y);
      if (a.cracked?.has(key)) { trigger = { type: "drop", at: { ...pos } }; break; }
      a.cracked?.add(key);
      effects.push({ type: "crack", at: { ...pos } });
      break; // cracking is a stand event; the chain ends on it
    }
    if (b === "spin") {
      const key = keyOf(pos.x, pos.y);
      if (!spunOn.has(key)) {
        spunOn.add(key);
        const turns: DirName[] = [];
        let d = dir;
        for (let k = 0; k < 4; k++) { d = CW[d]; turns.push(d); }
        effects.push({ type: "spin", at: { ...pos }, turns });
      }
      break; // spin is in place (emerald mat) — no translation
    }

    // Forced translation: pick the step this standing tile forces.
    let stepDir: DirName | null = null;
    let onWater = false;
    if (b === "ice") stepDir = dir;                       // Slip: current direction
    else if (b === "conveyor") stepDir = CONVEYOR_DIR[t as number]; // Walk*: the tile's direction
    else if (b === "current") { stepDir = CURRENT_DIR[t as number]; onWater = true; }
    if (stepDir === null) break;

    const v = DIR_VEC[stepDir];
    const nx = pos.x + v.dx, ny = pos.y + v.dy;
    // Ledge inside a chain (emerald: DoForcedMovement also honours
    // COLLISION_LEDGE_JUMP): sliding/conveyed south over a ledge
    // jumps it, landing beyond — if the landing is enterable.
    if (a.tileAt(nx, ny) === TILE.LEDGE) {
      if (stepDir !== LEDGE_JUMP_DIR) break;
      const lx = nx + v.dx, ly = ny + v.dy;
      if (!(onWater ? enterableOnWater(a, lx, ly) : enterableOnFoot(a, lx, ly))) break;
      effects.push({ type: "ledge-jump", over: { x: nx, y: ny }, to: { x: lx, y: ly } });
      pos = { x: lx, y: ly };
      path.push({ ...pos });
      dir = stepDir;
      continue;
    }
    const ok = onWater ? enterableOnWater(a, nx, ny) : enterableOnFoot(a, nx, ny);
    if (!ok) break; // blocked: the forced movement ends on this tile
    pos = { x: nx, y: ny };
    path.push({ ...pos });
    dir = stepDir;
    if (b === "ice") slideTiles++;
    else if (b === "conveyor") conveyorTiles++;
    else currentTiles++;
  }
  flushCounts();

  const finalTile = a.tileAt(pos.x, pos.y);
  return {
    moved: path.length > 0,
    blocked: false,
    path,
    final: pos,
    finalDir: dir,
    effects,
    trigger,
    costTerrain: finalTile !== undefined && COST_TILES.has(finalTile),
  };
}

/**
 * One full press on foot: the first step (with the ledge
 * collision rule) plus the forced chain from the landing tile.
 * The caller validates gates/NPC-vs-first-step concerns it owns;
 * this function validates the first step against solid/water and
 * everything after it.
 */
export function resolveTraversalStep(
  a: ChainArgs,
  from: { x: number; y: number },
  dir: DirName,
): TraversalResolution {
  const v = DIR_VEC[dir];
  const tx = from.x + v.dx, ty = from.y + v.dy;
  const target = a.tileAt(tx, ty);
  const none: TraversalResolution = {
    moved: false, blocked: true, path: [], final: { ...from },
    finalDir: dir, effects: [], trigger: null, costTerrain: false,
  };
  if (target === undefined || a.solid(tx, ty)) return none;

  // Ledge (collision-time, emerald's ShouldJumpLedge): the jump
  // direction must match and the tile beyond must be enterable.
  if (target === TILE.LEDGE) {
    if (dir !== LEDGE_JUMP_DIR) return none;
    const lx = tx + v.dx, ly = ty + v.dy;
    if (!enterableOnFoot(a, lx, ly)) return none;
    const chain = resolveStandingChain(a, { x: lx, y: ly }, dir);
    return {
      moved: true,
      blocked: false,
      path: [{ x: lx, y: ly }, ...chain.path],
      final: chain.final,
      finalDir: chain.finalDir,
      effects: [{ type: "ledge-jump", over: { x: tx, y: ty }, to: { x: lx, y: ly } }, ...chain.effects],
      trigger: chain.trigger,
      costTerrain: chain.costTerrain,
    };
  }
  if (WATER_FAMILY.has(target)) return none; // on foot: water needs the Wave gate (WorldEngine/S-3)

  const chain = resolveStandingChain(a, { x: tx, y: ty }, dir);
  return {
    moved: true,
    blocked: false,
    path: [{ x: tx, y: ty }, ...chain.path],
    final: chain.final,
    finalDir: chain.finalDir,
    effects: chain.effects,
    trigger: chain.trigger,
    costTerrain: chain.costTerrain,
  };
}

/* ════════════════════════════════════════════════════════════════
 * PART 2 — climb faces and waterfall rides (2026-10-30).
 *
 * Crag Climb faces — PROVENANCE: pret-pokeheartgold
 * src/field_move.c: FieldMove_CheckRockClimb reads the FACING tile
 * through MetatileBehavior_IsRockClimbInDirection (src/
 * metatile_behavior.c; TILE_BEHAVIOR_ROCK_CLIMB_NORTH_SOUTH /
 * EAST_WEST are climbable faces, not walls), and
 * Task_UseRockClimbInField runs the climb — the player scales the
 * face along its run and arrives on the ledge it belongs to.
 * Seam: one authored face family (TILE.ROCK_CLIMB); pressing into
 * it (the engine's Crag Climb context verdict already passed)
 * scans the face run along the press direction and lands on the
 * first standable tile beyond — from below you arrive on the
 * plateau; from the plateau edge the same scan descends you.
 *
 * Cascade rides — PROVENANCE: pret-pokeemerald's waterfall avatar
 * path (src/field_player_avatar.c) + metatile behaviour: while
 * SURFING, entering a waterfall tile against the flow rides it UP
 * (the Waterfall field move — our Cascade gate verdict, checked by
 * the engine first); entering with the flow rides DOWN with no
 * move required. On foot a waterfall is never enterable (the
 * engine holds the tile solid off the water). The ride carries
 * across the whole falls run to the first enterable tile beyond
 * (upper pool, bank, or lower pool).
 * ════════════════════════════════════════════════════════════════ */

export interface ClimbResult {
  climbed: boolean;
  /** Landing tile (the ledge above / the ground below). */
  to?: { x: number; y: number };
  /** Face tiles crossed, ordered from the pressed face tile. */
  faceRun: { x: number; y: number }[];
}

export function resolveClimb(
  from: { x: number; y: number },
  dir: DirName,
  tileAt: TileAt,
  standableAt: (x: number, y: number) => boolean,
): ClimbResult {
  const v = DIR_VEC[dir];
  const first = { x: from.x + v.dx, y: from.y + v.dy };
  if (tileAt(first.x, first.y) !== TILE.ROCK_CLIMB) {
    return { climbed: false, faceRun: [] };
  }
  const run: { x: number; y: number }[] = [];
  let cx = first.x, cy = first.y;
  while (tileAt(cx, cy) === TILE.ROCK_CLIMB) {
    run.push({ x: cx, y: cy });
    cx += v.dx; cy += v.dy;
  }
  // (cx, cy) is the first tile beyond the face run.
  if (!standableAt(cx, cy)) return { climbed: false, faceRun: run };
  return { climbed: true, to: { x: cx, y: cy }, faceRun: run };
}

export interface CascadeResult {
  rode: boolean;
  /** Landing tile beyond the falls run. */
  to?: { x: number; y: number };
  /** 'up' rode against the flow (Cascade), 'down' rode with it,
   *  'across' crossed a reef-edge falls (Coral Approach's channel
   *  falls) — the ride follows the press axis either way; which
   *  directions need the verb is the caller's gate business
   *  (vertical down = free, everything else rides the gate). */
  dir?: "up" | "down" | "across";
}

export function resolveCascade(
  fallsTile: { x: number; y: number },
  dir: DirName,
  tileAt: TileAt,
  enterableAt: (x: number, y: number) => boolean,
): CascadeResult {
  if (tileAt(fallsTile.x, fallsTile.y) !== TILE.HM_WATERFALL) return { rode: false };
  const v = DIR_VEC[dir];
  let cx = fallsTile.x, cy = fallsTile.y;
  while (tileAt(cx, cy) === TILE.HM_WATERFALL) { cx += v.dx; cy += v.dy; }
  if (!enterableAt(cx, cy)) return { rode: false };
  return {
    rode: true,
    to: { x: cx, y: cy },
    dir: dir === "up" ? "up" : dir === "down" ? "down" : "across",
  };
}
