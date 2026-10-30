/**
 * boulders.ts — the pushable-boulder OBJECT system (traversal part 2).
 *
 * Part 1's honest remainder named this the biggest hole in the
 * traversal scope: the S-3 Mighty Push gate opened the boulder tile,
 * but the push itself was a one-shot override swap with a hard-coded
 * blocked list. This module is the real object system the gate drives.
 *
 * PROVENANCE (ported base)
 * - pret-pokeemerald src/field_player_avatar.c:
 *   - TryPushBoulder(x, y, direction): the push fires only when the
 *     Strength field state is on (FLAG_SYS_USE_STRENGTH — our seam:
 *     the S-3 Mighty Push gate verdict, held flag + living performer,
 *     evaluated by fieldTechniques.ts, not here), the object in front
 *     of the player is a pushable boulder (OBJ_EVENT_GFX_PUSHABLE_
 *     BOULDER), and the tile BEYOND the boulder reports
 *     COLLISION_NONE and is not a non-animated door. The boulder then
 *     moves exactly ONE tile (PushBoulder_Start/Move/End: the player
 *     walk-in-place + the boulder's slow walk, dust effect).
 *   - Blocked cases are therefore the source's collision set: any
 *     solid metatile, an object event (another boulder, an NPC), the
 *     map edge, or a door tile. Water is collision for a boulder —
 *     a boulder never enters water (no COLLISION_NONE there).
 *   - Object events restore to their authored (initial) coordinates
 *     when the map reloads; only script-set flags persist. Our seam:
 *     positions live in WorldEngine's tileOverrides; on map ENTRY
 *     the engine clears the entered map's loose-boulder overrides
 *     (resetBoulderOverrides below decides which keys those are)
 *     while hole-fills persist (a boulder that fell in is gone and
 *     the filled hole stays filled — the FRLG Seafoam Islands
 *     pattern, where dropped boulders stay dropped via flags).
 * - Hole fall: a boulder pushed onto a hole tile falls in and the
 *   hole becomes filled floor (FRLG Seafoam / emerald script-set
 *   boulder holes; the metatile hole is consumed by the object).
 *   Our seam: the boulder is consumed, the hole's override becomes
 *   the map's floor tile, and that override is in the persist set.
 * - Floor switches: a switch reads PRESSED while weight rests on it
 *   (the Sootopolis / Trick House floor-switch pattern reads object
 *   and player occupancy). A boulder resting on a switch holds it;
 *   a linked gate barrier on the map is open exactly while at least
 *   one of the map's switches is held (live read, not latched).
 *
 * ON-TOP EXPANSION (ours, named): none in this module — the switch +
 * gate pairing is the source's own grammar; what is ours is only the
 * TypeScript seam (positions carried in tileOverrides instead of the
 * object-event table).
 */

import { TILE, PASSABLE } from "../world/WorldConstants";

/** Tiles a boulder can never be pushed onto: the source's collision
 *  set at our seam. Water-family tiles are collision (a boulder does
 *  not float); ledges/climb faces/hop rails are faces, not ground;
 *  a switch gate is a barrier whether open or shut for an OBJECT
 *  (the gate opens for the player, the boulder is what holds it). */
export const BOULDER_BLOCKED_TILES: ReadonlySet<number> = new Set([
  TILE.WALL, TILE.BUILDING, TILE.DOOR, TILE.WATER, TILE.SHALLOW,
  TILE.LEDGE, TILE.HM_ROCK, TILE.HM_CUT, TILE.HM_WATERFALL,
  TILE.HM_BOULDER, TILE.LAVA, TILE.FENCE, TILE.TERMINAL,
  TILE.COUNTER, TILE.PLANT, TILE.HEAL_MACHINE, TILE.BENCH, TILE.BED,
  TILE.ROCK_CLIMB, TILE.DIVE_SPOT, TILE.HOP_RAIL, TILE.SWITCH_GATE,
]);

export type TileAt = (x: number, y: number) => number | undefined;

export interface PushResult {
  /** true when the boulder moved (or fell). */
  moved: boolean;
  /** Override writes the engine applies (key suffix "x,y" -> tile). */
  writes: Record<string, number>;
  /** Set when the boulder fell into a hole at this position. */
  fellAt?: { x: number; y: number };
  /** Set when the boulder came to rest on a floor switch. */
  onSwitch?: { x: number; y: number };
  /** Why a push was refused (source collision vocabulary). */
  blockedBy?: "edge" | "solid" | "npc" | "door";
}

/**
 * Attempt one push of the boulder at (bx, by) in direction (dx, dy).
 * Pure: reads effective tiles through tileAt (overrides applied by
 * the caller) and NPC occupancy through a callback. The caller (the
 * engine's Mighty Push seam) has already passed the S-3 gate.
 *
 * The boulder's old tile restores to whatever lies UNDER a boulder:
 * a floor switch shows again when the boulder leaves it; anything
 * else is the map's floor for that spot — the caller passes
 * underTile(bx, by) (the authored tile with boulder-independent
 * overrides applied).
 */
export function tryPushBoulder(
  bx: number, by: number, dx: number, dy: number,
  tileAt: TileAt,
  underTile: (x: number, y: number) => number,
  npcAt: (x: number, y: number) => boolean,
  floorForHole: number,
): PushResult {
  const tx = bx + dx, ty = by + dy;
  const target = tileAt(tx, ty);
  if (target === undefined) return { moved: false, writes: {}, blockedBy: "edge" };
  if (target === TILE.DOOR) return { moved: false, writes: {}, blockedBy: "door" };
  if (npcAt(tx, ty)) return { moved: false, writes: {}, blockedBy: "npc" };
  const key = (x: number, y: number) => `${x},${y}`;
  const restore = underTile(bx, by);
  // Hole: the boulder falls in; the hole becomes filled floor.
  if (target === TILE.HOLE) {
    return {
      moved: true,
      fellAt: { x: tx, y: ty },
      writes: { [key(bx, by)]: restore, [key(tx, ty)]: floorForHole },
    };
  }
  if (BOULDER_BLOCKED_TILES.has(target) || !PASSABLE[target]) {
    return { moved: false, writes: {}, blockedBy: "solid" };
  }
  return {
    moved: true,
    onSwitch: target === TILE.FLOOR_SWITCH ? { x: tx, y: ty } : undefined,
    writes: { [key(bx, by)]: restore, [key(tx, ty)]: TILE.HM_BOULDER },
  };
}

/** True when the tile under an occupant is a floor switch showing —
 *  i.e. the switch is held by whoever stands there. A boulder ON a
 *  switch hides it (effective tile reads HM_BOULDER) but the AUTHORED
 *  tile still says switch: switchesHeld reads both layers. */
export function switchesHeld(
  authoredAt: TileAt,
  effectiveAt: TileAt,
  occupants: Array<{ x: number; y: number }>,
  width: number, height: number,
): boolean {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (authoredAt(x, y) !== TILE.FLOOR_SWITCH) continue;
      // Boulder resting on it (authored switch, effective boulder).
      if (effectiveAt(x, y) === TILE.HM_BOULDER) return true;
      // A person standing on it.
      if (occupants.some((o) => o.x === x && o.y === y)) return true;
    }
  }
  return false;
}

/** Map has at least one authored floor switch (gates read this). */
export function mapHasSwitch(authoredAt: TileAt, width: number, height: number): boolean {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (authoredAt(x, y) === TILE.FLOOR_SWITCH) return true;
    }
  }
  return false;
}

/**
 * The emerald reload rule: which of a map's tileOverrides are
 * loose-boulder state (cleared on entry) vs persistent state (kept).
 * Kept: hole-fills (the authored tile is a HOLE) and every override
 * unrelated to boulders. Cleared: overrides standing on an authored
 * boulder tile (the vacated spot) and overrides whose value IS a
 * boulder (where it was pushed to) — except a boulder resting on an
 * authored switch... no: the source resets those too (the gate
 * closes again behind you; re-pushing is the puzzle). Cleared.
 */
export function isLooseBoulderOverride(
  authoredTile: number | undefined,
  overrideTile: number,
): boolean {
  if (authoredTile === TILE.HOLE) return false; // a fill persists
  if (authoredTile === TILE.HM_BOULDER) return true;
  if (overrideTile === TILE.HM_BOULDER) return true;
  return false;
}
