/**
 * bike.ts — the bicycle programme (traversal part 2).
 *
 * Absent entirely before this lane (part-1 census: "two avatar
 * states + two item variants"). This module carries the pure rules;
 * WorldEngine owns the mode state and the movement-interval rates.
 *
 * PROVENANCE (ported base)
 * - pret-pokeemerald src/bike.c + src/field_player_avatar.c:
 *   - Two bike variants as two avatar states (PLAYER_AVATAR_FLAG_
 *     MACH_BIKE / PLAYER_AVATAR_FLAG_ACRO_BIKE), switched by item.
 *     Mach Bike: starts slow and ACCELERATES while you keep riding
 *     in a line (its speed tiers are the avatar's movement speeds:
 *     the mach bike's top tier is the fastest field movement in the
 *     game); cracked floors (Sky Pillar) are crossed only at full
 *     speed — a slow crossing breaks the floor under you. Acro Bike:
 *     the trick bike — AcroBikeHandleInputBunnyHop (bike.c) hops the
 *     rider in place or forward; its collision table
 *     (CheckAcroBikeCollision in field_player_avatar.c) turns
 *     ledge-class obstacles into hop targets; wheelies (holding the
 *     trick pose) let it climb the muddy slope.
 *   - MB_MUDDY_SLOPE (include/constants/metatile_behaviors.h): up a
 *     muddy slope needs the Mach Bike's speed or the Acro's wheelie;
 *     on foot you slide back down. Down is always free.
 *   - Indoors / in water the bike does not go: the avatar transition
 *     functions (field_player_avatar.c) swap the bike state out at
 *     doors and at the surf transition. Our seam: door/exit warps
 *     and water entry dismount.
 * - Gear-switch seam: pret-pokegold/pokeemerald swap bikes by item
 *   use; the in-field two-gear switch is the GEN 4 bike's (DPPt/
 *   HGSS bicycle toggles gear with a button). Our one item carries
 *   both RSE behaviour sets as two gears — the DRAFT name below is
 *   owner-slot material (names are the owner's), the internal id
 *   stays neutral.
 *
 * ON-TOP EXPANSION (ours, named): the hop is also allowed over a
 * one-tile hole and over a ledge side-on (the source's acro hop
 * answers ledges only in their jump direction; crossing a rail or a
 * gap sideways on the hop is the same physical trick, widened — this
 * is the Direction-Rule widening, recorded as ours).
 */

import { TILE } from "../world/WorldConstants";

/** Neutral internal id for the key item (rides the store inventory
 *  count map like every other item id). */
export const BIKE_ITEM_ID = "bike";
/** DRAFT display name — flagged: item names are the owner's slot.
 *  Used in the mount notification until the owner rules a name. */
export const BIKE_DRAFT_NAME = "Trail Bike (DRAFT NAME)";

export type RideMode = "foot" | "mach" | "acro";

/** Steps of unbroken riding before the Mach Bike reaches full
 *  speed (its acceleration tiers compressed to our step engine). */
export const MACH_FULL_CHARGE = 3;

/** Movement-interval (ms per step) per mode, extending the engine's
 *  walk 140 / sprint 70 ladder. Mach at full charge is the fastest
 *  field movement the engine has; Acro rides at run pace. */
export function stepIntervalMs(mode: RideMode, machCharge: number): number {
  if (mode === "mach") return machCharge >= MACH_FULL_CHARGE ? 45 : 80;
  if (mode === "acro") return 90;
  return 140;
}

/** Can this mode cross a cracked floor cleanly (no crack, no fall)?
 *  Ported: Mach at full speed only (Sky Pillar rule); the Acro
 *  crossing is by HOP, decided in tryAcroHop — riding over cracked
 *  floor slowly breaks it the same as walking. */
export function crossesCrackedClean(mode: RideMode, machCharge: number): boolean {
  return mode === "mach" && machCharge >= MACH_FULL_CHARGE;
}

/** Can this mover climb a muddy slope (the upward traversal)?
 *  Ported MB_MUDDY_SLOPE rule: Mach at speed, or Acro (wheelie). */
export function canClimbSlope(mode: RideMode, machCharge: number): boolean {
  if (mode === "mach") return machCharge >= MACH_FULL_CHARGE;
  if (mode === "acro") return true;
  return false;
}

/** A slope run under the mover: slope tiles form the incline; the
 *  ascent question is asked when pressing in the slope's up
 *  direction. Our maps author slopes as south-facing inclines (up =
 *  north), the Region 1 grammar (emerald's muddy slopes face the
 *  same way on their maps' approach). */
export const SLOPE_UP = { dx: 0, dy: -1 } as const;

export interface HopDecision {
  hop: boolean;
  /** Landing offset from the player's tile (two tiles in the press
   *  direction: over the obstacle, onto the far side). */
  landDx: number;
  landDy: number;
}

/**
 * The Acro bunny-hop decision for one press: on the Acro gear,
 * pressing toward a hop-class obstacle (hop rail, a ledge from any
 * side, a one-tile hole) hops over it when the far side is standable
 * ground. Everything else rides normally (hop:false). The caller
 * supplies effectiveTile for both reads.
 */
export function tryAcroHop(
  mode: RideMode,
  dx: number, dy: number,
  obstacleTile: number | undefined,
  landingTile: number | undefined,
  landingStandable: boolean,
): HopDecision {
  const no: HopDecision = { hop: false, landDx: 0, landDy: 0 };
  if (mode !== "acro") return no;
  if (obstacleTile === undefined || landingTile === undefined) return no;
  const hopClass =
    obstacleTile === TILE.HOP_RAIL ||
    obstacleTile === TILE.LEDGE ||
    obstacleTile === TILE.HOLE;
  if (!hopClass) return no;
  if (!landingStandable) return no;
  return { hop: true, landDx: dx * 2, landDy: dy * 2 };
}
