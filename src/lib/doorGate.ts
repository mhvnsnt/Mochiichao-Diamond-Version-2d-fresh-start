import { techniqueByName, techniqueHeld } from "./fieldTechniques";

// Door gate conditions — Sequence 3 (Dojo 8 early-access wart).
//
// Before this, WorldEngine entered every door unconditionally: a
// door's `condition` field (the binary_fields victory_route exit
// already carried "badges>=8" as unenforced metadata) was never
// evaluated. Doors now honour their condition in the walk-into
// path, the interact path, and the interact prompt.
//
// A door with no condition is open. Supported conditions:
//   "badges>=N" — open once the player holds at least N badges
//     (badges are the fragment names in gameStore.badges).
// Anything else is CLOSED (fail-closed): an unrecognised
// condition must never silently open a gated door.

export function isDoorOpen(
  condition: string | undefined | null,
  badges: readonly string[],
): boolean {
  if (!condition) return true;
  const m = /^badges>=(\d+)$/.exec(condition.trim());
  if (!m) return false;
  return badges.length >= Number(m[1]);
}

// What the player hears when they try a sealed door.
export function sealedDoorText(
  label: string | undefined,
  condition: string | undefined | null,
): string {
  const name = label || "This door";
  const m = condition ? /^badges>=(\d+)$/.exec(condition.trim()) : null;
  if (m) {
    return `${name} is sealed. It opens only to a trainer holding at least ${m[1]} badges.`;
  }
  return `${name} is sealed.`;
}

// ---------------------------------------------------------------------------
// Exit gates — Region 1 step (i), 2026-11-13.
//
// Doors honour their condition (above), but WorldEngine's walk-into path
// fired every EXIT unconditionally: the binary_fields -> victory_route
// exit already carried `condition: "badges>=8"` as unenforced metadata,
// and the sector0 -> boot_bay exit carried `hmNeeded: "Wave"` the same
// way. The five-region master (§3 #26) requires the Victory Route gate
// (badges >= 8) in WorldEngine's exit check, not just in the map, and
// Boot Bay is the Wave-Ride gate test. Exits now honour both fields:
//   `condition: "badges>=N"` — same language as doors (anything else is
//     CLOSED, fail-closed, like doors);
//   `hmNeeded: "<Technique>"` — the technique must be HELD
//     (fieldTechniques.ts, tech.* flag namespace); an unknown technique
//     name is CLOSED.
// Noclip (the cheat) bypasses exits in WorldEngine, as it bypasses
// doors — this module is the gate, not the cheat.
// ---------------------------------------------------------------------------

export function isExitOpen(
  exit: { condition?: string | null; hmNeeded?: string | null } | null | undefined,
  badges: readonly string[],
  techniqueFlags: Record<string, boolean>,
): boolean {
  if (!exit) return true;
  if (exit.condition && !isDoorOpen(exit.condition, badges)) return false;
  if (exit.hmNeeded) {
    const tech = techniqueByName(exit.hmNeeded);
    if (!tech || !techniqueHeld(tech, techniqueFlags)) return false;
  }
  return true;
}

// What the player hears when they try a sealed exit.
export function exitSealedText(
  exit: { condition?: string | null; hmNeeded?: string | null; to?: string } | null | undefined,
  destName?: string,
): string {
  const name = destName || exit?.to || "The way";
  if (exit?.condition) {
    const m = /^badges>=(\d+)$/.exec(exit.condition.trim());
    if (m) {
      return `${name} is sealed. It opens only to a trainer holding at least ${m[1]} badges.`;
    }
  }
  if (exit?.hmNeeded) {
    const tech = techniqueByName(exit.hmNeeded);
    if (tech) {
      return `${name} is sealed. It needs the ${exit.hmNeeded} technique.`;
    }
  }
  return `${name} is sealed.`;
}
