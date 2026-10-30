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
