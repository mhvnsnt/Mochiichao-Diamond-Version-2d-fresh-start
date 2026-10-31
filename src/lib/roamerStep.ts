// Gap-fill S10 slice 2 — the scorer-driven roamer step (pure, tested).
//
// GAP-FILL-PLAN G-5: visible roamers behave per G-3's scorer and move on
// the existing A* engine (src/lib/creaturePathfinding.ts, the easystarjs
// wrapper Creature Mode already uses). This slice is the step engine
// only — no host reads it yet (like S8 slice 3's selector before its
// slice-4 host, and S10 slice 1's scorer before this step). It correctly
// does not appear in the live bundle until a host imports it.
//
// What it does, and what it does NOT do:
// - It scores one roamer for one heartbeat with scoreBehaviour (slice 1),
//   from the live Manhattan distance between the roamer and the player,
//   then turns the scored behaviour into exactly one tile step.
// - Directed behaviours ride the real A*: 'chase' and 'curious' take
//   findNextStep toward the player; 'flee' takes findNextStep toward a
//   flee anchor two tiles past the roamer away from the player, with a
//   walkable-neighbour fallback (the neighbour farthest from the player)
//   when the anchor is out of bounds, blocked, or unreachable. A greedy
//   step toward/away would walk into walls; the A* step routes around
//   them, and the fallback never steps onto a blocked tile.
// - 'wander' takes one random walkable neighbour within 4 tiles of home
//   — the home radius the existing stepRoamer in creatureMode.ts already
//   uses (dist(next, home) <= 4), carried verbatim, not re-derived.
//   A flee step never lands on the player's tile (that would be contact,
//   not flight): an A* first step onto the player, or a fallback with
//   no neighbour but the player, both hold the roamer instead.
//   'graze' and 'still' do not move. Contact is NOT resolved here: a
//   chase/curious step that would land on the player returns the
//   roamer's own tile (findNextStep returns null at zero distance), so
//   the host still owns contact/battle triggering, exactly as the
//   existing WorldEngine heartbeat does after stepRoamer.
// - No roamer spawn table, no per-species profile, and no host is
//   authored here. The profile stays a caller-supplied argument, as in
//   slice 1: no per-species #152 profile contents exist on main (the
//   #152 spec's own open slots — distilling profiles from sheets is a
//   data-lane pass, species by species, never invented here), and the
//   #108 temperament on the existing Roamer record is an individual
//   modifier the profile's ranges are read through (per the #152 spec),
//   not a profile itself — so mapping temperament onto threatResponse /
//   curiosity here would be invented design, and is deliberately NOT
//   done. The WorldEngine host step is slice 3, gated on that
//   distillation (or on a ruling for a temperament bridge).
// - Despawn/respawn timers are NOT here: encounter-modes.json authors a
//   despawnTiles of 14 but no host reads it, and this step does not
//   invent the timer's semantics. Touch-encounter wiring is the host's.

import {
  scoreBehaviour,
  type BehaviourProfile,
  type CalmBehaviour,
  type RoamerScore,
} from "./behaviour";
import type { PlaceFact } from "./place";
import { findNextStep, type TilePos } from "./creaturePathfinding";

export interface RoamerStepInput {
  /** The roamer's current tile. */
  from: TilePos;
  /** The roamer's home tile; wander stays within 4 tiles of it. */
  home: TilePos;
  /** The player's current tile. */
  playerPos: TilePos;
  /** The map grid in stored (row-major) order, as creaturePathfinding takes it. */
  tiles: number[][];
  /** Blocked tile values; the WorldEngine / CreatureMode set is {1, 4, 2}. */
  blocked: Set<number>;
  /** #152 wild view, caller-supplied — no row is authored here. */
  profile: BehaviourProfile;
  /** The roamer table's at-rest behaviour for this species on this map. */
  baseBehaviour: CalmBehaviour;
  /** S4 PlaceFact for the roamer's map; null on unzoned maps. Sealed steps null. */
  place: PlaceFact | null;
  /** Whether the S1 clock phase is one this species is active in; null = unknown, no cap. */
  activeInPhase?: boolean | null;
  /** Caller-computed B1/B2 composition step; absent = 0. */
  awarenessShift?: -1 | 0 | 1;
  /** BW2 §6 chase-flagged-only law: false (default) never chases. */
  chaseFlagged?: boolean;
  /** Wander RNG; defaults to Math.random. Tests inject a sequence. */
  rng?: () => number;
}

export interface RoamerStepOutput {
  score: RoamerScore;
  /** The tile the roamer steps to; equal to `from` when it does not move. */
  next: TilePos;
  moved: boolean;
}

const manhattan = (a: TilePos, b: TilePos): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function isWalkable(
  tiles: number[][],
  blocked: Set<number>,
  x: number,
  y: number,
): boolean {
  if (y < 0 || y >= tiles.length) return false;
  const row = tiles[y];
  if (!row || x < 0 || x >= row.length) return false;
  return !blocked.has(row[x]);
}

const DIRS: readonly TilePos[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/**
 * Farthest walkable neighbour from the player; first-max wins ties.
 * The player's own tile is never a flee destination — stepping onto
 * it would be contact, not flight.
 */
function fleeFallback(
  tiles: number[][],
  blocked: Set<number>,
  from: TilePos,
  playerPos: TilePos,
): TilePos {
  let best: TilePos = from;
  let bestDist = -1;
  for (const d of DIRS) {
    const next = { x: from.x + d.x, y: from.y + d.y };
    if (next.x === playerPos.x && next.y === playerPos.y) continue;
    if (!isWalkable(tiles, blocked, next.x, next.y)) continue;
    const dist = manhattan(next, playerPos);
    if (dist > bestDist) {
      bestDist = dist;
      best = next;
    }
  }
  return best;
}

function fleeStep(
  tiles: number[][],
  blocked: Set<number>,
  from: TilePos,
  playerPos: TilePos,
): TilePos {
  // On the player's own tile the roamer holds: contact resolution is
  // the host's job, and a flee step here would dodge it.
  if (from.x === playerPos.x && from.y === playerPos.y) return from;
  const anchor: TilePos = {
    x: from.x + 2 * Math.sign(from.x - playerPos.x),
    y: from.y + 2 * Math.sign(from.y - playerPos.y),
  };
  if (anchor.x === from.x && anchor.y === from.y) {
    return fleeFallback(tiles, blocked, from, playerPos);
  }
  if (isWalkable(tiles, blocked, anchor.x, anchor.y)) {
    const step = findNextStep(tiles, blocked, from, anchor);
    if (
      step &&
      isWalkable(tiles, blocked, step.x, step.y) &&
      !(step.x === playerPos.x && step.y === playerPos.y)
    ) {
      return step;
    }
  }
  return fleeFallback(tiles, blocked, from, playerPos);
}

function wanderStep(
  tiles: number[][],
  blocked: Set<number>,
  from: TilePos,
  home: TilePos,
  rng: () => number,
): TilePos {
  const candidates: TilePos[] = [];
  for (const d of DIRS) {
    const next = { x: from.x + d.x, y: from.y + d.y };
    if (!isWalkable(tiles, blocked, next.x, next.y)) continue;
    if (manhattan(next, home) > 4) continue;
    candidates.push(next);
  }
  if (candidates.length === 0) return from;
  const roll = rng();
  const idx = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(roll * candidates.length)),
  );
  return candidates[idx];
}

/**
 * Score one roamer heartbeat and turn it into one tile step.
 * Pure and non-mutating. Returns null only for a sealed place (the
 * depths fence, inherited from scoreBehaviour).
 */
export function stepRoamerScored(
  input: RoamerStepInput,
): RoamerStepOutput | null {
  const score = scoreBehaviour({
    profile: input.profile,
    baseBehaviour: input.baseBehaviour,
    place: input.place,
    distanceTiles: manhattan(input.from, input.playerPos),
    activeInPhase: input.activeInPhase,
    awarenessShift: input.awarenessShift,
    chaseFlagged: input.chaseFlagged,
  });
  if (score === null) return null;

  let next: TilePos = input.from;
  switch (score.behaviour) {
    case "flee":
      next = fleeStep(input.tiles, input.blocked, input.from, input.playerPos);
      break;
    case "chase":
    case "curious": {
      const step = findNextStep(
        input.tiles,
        input.blocked,
        input.from,
        input.playerPos,
      );
      if (step && isWalkable(input.tiles, input.blocked, step.x, step.y)) {
        next = step;
      }
      break;
    }
    case "wander":
      next = wanderStep(
        input.tiles,
        input.blocked,
        input.from,
        input.home,
        input.rng ?? Math.random,
      );
      break;
    case "graze":
    case "still":
      next = input.from;
      break;
  }
  return {
    score,
    next,
    moved: next.x !== input.from.x || next.y !== input.from.y,
  };
}
