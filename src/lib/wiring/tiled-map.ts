/**
 * Mochiichao Tiled maps — TMJ (Tiled JSON) loader + validator.
 * Pokemon's maps are data (map.json + scripts.inc + warps + object
 * events). Tiled gives the same structure with an editor: one file
 * per map, layers for ground / objects / triggers / warps, custom
 * properties for gate flag / tech / badge. The validator is the
 * 100% gate: a map that fails it cannot be wired.
 */
export type TmjExit = { to: string; enterAt: [number, number]; gate?: string; oneWay?: boolean };
/**
 * Array-form exit: one entry per exit tile, as derived from
 * FullWorldMaps.ts (edge exits are generated per tile there, e.g.
 * buildEdgeExits(13, 17, 0, "route_1", 38, "up")). The legacy
 * Record form (sector0.json, keyed by target) still loads.
 */
export type TmjExitTile = {
  x: number;
  y: number;
  to: string;
  enterAt: [number, number];
  dir?: string;
  gate?: string;
  hmNeeded?: string;
  /** One-way edge exit: no return exit/door is required (e.g. the
   *  moving-truck door — you step off the truck and cannot go back). */
  oneWay?: boolean;
};
/** Door warp: a door tile that leads to another map (label + optional
 *  condition preserved from FullWorldMaps.ts, e.g. the Neon City ->
 *  Mauveville Arena door gated on ciphers>=10). */
export type TmjDoor = {
  x: number;
  y: number;
  to: string;
  enterAt: [number, number];
  label?: string;
  condition?: string;
  /** One-way door warp: no return exit/door is required. */
  oneWay?: boolean;
};
export type TmjMap = {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  exits: Record<string, TmjExit> | TmjExitTile[];
  npcs: { id: string; x: number; y: number; name: string; role: string }[];
  signs: { x: number; y: number; text: string }[];
  music?: string;
  wildPool?: string[];
  noWild?: boolean;
  /** FullWorldMaps.ts playerStart, as [x, y]. */
  playerStart?: [number, number];
  weather?: string;
  interior?: boolean;
  doors?: TmjDoor[];
  /** Town marker: a town is only a town if it has heal + shop + sign
   *  (see validateTown). A town may name a services map instead of
   *  carrying its own heal/shop NPCs — e.g. Binary Fields names
   *  mochiiplex_1, which holds the healer and the shop. */
  town?: boolean;
  townServices?: string;
};

export function validateTmjMap(map: TmjMap, allMaps: Record<string, TmjMap>): string[] {
  const errors: string[] = [];
  if (!map.id) errors.push("map has no id");
  if (map.tiles.length !== map.height) errors.push(`${map.id}: tile rows ${map.tiles.length} != height ${map.height}`);
  for (const row of map.tiles) {
    if (row.length !== map.width) errors.push(`${map.id}: tile row length ${row.length} != width ${map.width}`);
  }
  if (map.playerStart) {
    const [px, py] = map.playerStart;
    if (px < 0 || py < 0 || px >= map.width || py >= map.height) {
      errors.push(`${map.id}: playerStart (${px},${py}) is outside the map`);
    }
  }
  const checkTarget = (kind: string, label: string, to: string, enterAt: [number, number]) => {
    const target = allMaps[to];
    if (!target) {
      errors.push(`${map.id}: ${kind} ${label} points to missing map ${to}`);
      return;
    }
    const [ex, ey] = enterAt;
    if (ex < 0 || ey < 0 || ex >= target.width || ey >= target.height) {
      errors.push(`${map.id}: ${kind} ${label} enterAt (${ex},${ey}) is outside ${to}`);
    }
  };
  if (Array.isArray(map.exits)) {
    for (const exit of map.exits) {
      if (exit.x < 0 || exit.y < 0 || exit.x >= map.width || exit.y >= map.height) {
        errors.push(`${map.id}: exit at (${exit.x},${exit.y}) is outside the map`);
      }
      if (exit.gate && !/^[a-z0-9_]+$/.test(exit.gate)) {
        errors.push(`${map.id}: exit gate ${exit.gate} is not a flag name`);
      }
      checkTarget("exit", `(${exit.x},${exit.y})`, exit.to, exit.enterAt);
    }
  } else {
    for (const [key, exit] of Object.entries(map.exits)) {
      const target = allMaps[exit.to];
      if (!target) {
        errors.push(`${map.id}: exit ${key} points to missing map ${exit.to}`);
        continue;
      }
      const [ex, ey] = exit.enterAt;
      if (ex < 0 || ey < 0 || ex >= target.width || ey >= target.height) {
        errors.push(`${map.id}: exit ${key} enterAt (${ex},${ey}) is outside ${exit.to}`);
      }
      if (exit.gate && !/^[a-z0-9_]+$/.test(exit.gate)) {
        errors.push(`${map.id}: exit ${key} gate ${exit.gate} is not a flag name`);
      }
    }
  }
  for (const door of map.doors ?? []) {
    if (door.x < 0 || door.y < 0 || door.x >= map.width || door.y >= map.height) {
      errors.push(`${map.id}: door at (${door.x},${door.y}) is outside the map`);
    }
    checkTarget("door", `(${door.x},${door.y})`, door.to, door.enterAt);
  }
  if (map.townServices && !allMaps[map.townServices]) {
    errors.push(`${map.id}: townServices points to missing map ${map.townServices}`);
  }
  // Return-exit check: every exit/door must have a way back, or the
  // player can be stranded. A link whose target map is missing is
  // already an error above and is skipped here so it is reported once.
  // oneWay links (the moving-truck door) are exempt by design.
  const links: { kind: string; label: string; to: string; oneWay?: boolean }[] = [];
  if (Array.isArray(map.exits)) {
    for (const exit of map.exits) {
      links.push({ kind: "exit", label: `(${exit.x},${exit.y})`, to: exit.to, oneWay: exit.oneWay });
    }
  } else {
    for (const [key, exit] of Object.entries(map.exits)) {
      links.push({ kind: "exit", label: key, to: exit.to, oneWay: exit.oneWay });
    }
  }
  for (const door of map.doors ?? []) {
    links.push({ kind: "door", label: `(${door.x},${door.y})`, to: door.to, oneWay: door.oneWay });
  }
  for (const link of links) {
    if (link.oneWay) continue;
    const target = allMaps[link.to];
    if (!target) continue;
    const back = (t: TmjMap): boolean => {
      const tExits = Array.isArray(t.exits)
        ? t.exits.map((e) => e.to)
        : Object.values(t.exits).map((e) => e.to);
      const tDoors = (t.doors ?? []).map((d) => d.to);
      return [...tExits, ...tDoors].includes(map.id);
    };
    if (!back(target)) {
      errors.push(`${map.id}: ${link.kind} ${link.label} to ${link.to} has no return exit/door back to ${map.id}`);
    }
  }
  if (!map.wildPool && !map.noWild) errors.push(`${map.id}: no wildPool and no noWild note`);
  return errors;
}

/** A town is only a town if it has heal + shop + sign. Returns the
 *  missing pieces, so a town that is only a map is never counted.
 *  Heal/shop may live on the town's townServices map instead of the
 *  town itself (Binary Fields -> mochiiplex_1); signs must be on the
 *  town map. allMaps defaults to {} so single-map callers keep the
 *  old behaviour: a town with no services map must carry both NPCs. */
export function validateTown(map: TmjMap, allMaps: Record<string, TmjMap> = {}): string[] {
  const errors: string[] = [];
  const services = map.townServices ? allMaps[map.townServices] : undefined;
  const hasRole = (role: string) =>
    map.npcs.some((n) => n.role === role) ||
    (services?.npcs.some((n) => n.role === role) ?? false);
  if (!hasRole("heal")) errors.push(`${map.id}: town has no heal NPC`);
  if (!hasRole("shop")) errors.push(`${map.id}: town has no shop NPC`);
  if (map.signs.length === 0) errors.push(`${map.id}: town has no sign`);
  return errors;
}
