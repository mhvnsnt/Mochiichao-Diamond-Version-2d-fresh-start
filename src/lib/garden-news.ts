/**
 * B3 §2.5 check-in beat — Garden news, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: the Garden
 * changes without the player (migration, season, story), and returning
 * to it delivers *news* — never a chore list. This module is the read
 * half of that beat only: given the §2.8 doorway log (garden-movement)
 * and the stamp of the last check-in, it returns the Garden-composition
 * changes since that stamp, in stamp order.
 *
 * News kinds, derived ONLY from doorway records:
 * - "arrival": a garden-arrival movement (a migration arrived).
 * - "departure": a garden-departure movement (a resident left).
 * - "edge-sighting": a release whose destination is in the
 *   caller-supplied Garden-edge set (a released partner seen at the
 *   edge). Without an edge set the module cannot know where the edge
 *   is, so releases produce no sighting — it never guesses.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO "fell out" news: the spec's third example (two residents fell
 *   out) is a social fact, and no social record exists on main for
 *   this read to derive it from. Inventing it from movements would
 *   be fiction, so the kind set is exactly the three kinds above.
 * - NO keeper-to-keeper news: gift / trade / transfer movements move
 *   a creature between keeps, not into or out of the Garden, so they
 *   are not Garden news and never appear here.
 * - NO host, NO cursor storage: the caller keeps the last check-in
 *   stamp (its save record's job, later). This read takes the stamp
 *   as an input and stores nothing.
 * - NO Garden geography authored: garden homes and the Garden edge
 *   are caller-supplied sets (Owner Slot 5), never authored here;
 *   when a set is not supplied, the verb alone qualifies.
 * - NO names, NO chore list, NO reward: ids are caller-supplied
 *   opaque strings, and an item is a fact (who, what, when, where),
 *   never a task or a payout.
 *
 * Purity: the log is never mutated or reordered; outputs are fresh
 * values. Loud failures (throw) on malformed records, a non-finite
 * `since`, and malformed caller sets; silent defaults are never
 * invented.
 */

import {
  validateMovement,
  type MovementLog,
} from "./garden-movement";

/** The exact news-kind set (BRIDGE-SPEC §2.5, movement-derivable only). */
export type CheckInNewsKind = "arrival" | "departure" | "edge-sighting";

export const CHECK_IN_NEWS_KINDS: readonly CheckInNewsKind[] = [
  "arrival",
  "departure",
  "edge-sighting",
] as const;

/** One check-in news item: a Garden-composition fact, not a task. */
export interface CheckInNewsItem {
  /** The creature the news is about (opaque id). */
  creatureId: string;
  kind: CheckInNewsKind;
  /** The doorway record this item derives from (opaque id). */
  movementId: string;
  /** The movement's ordering stamp. */
  at: number;
  /** Origin id from the doorway record, or null as recorded. */
  from: string | null;
  /** Destination id from the doorway record, or null as recorded. */
  to: string | null;
}

export interface CheckInNewsOptions {
  /**
   * Stamp of the last check-in. Only movements strictly AFTER this
   * stamp are news (a movement at the stamp itself was already seen
   * at that check-in). Null means "never checked in": the whole log
   * is unseen, so every qualifying movement is news.
   */
  since: number | null;
  /**
   * Caller-supplied Garden homes (Owner Slot 5). When supplied, an
   * arrival counts only when its destination is a Garden home, and a
   * departure counts only when its origin is a Garden home. When
   * omitted, the verb alone qualifies.
   */
  gardenHomes?: ReadonlySet<string> | readonly string[];
  /**
   * Caller-supplied Garden-edge places. A release counts as an
   * edge-sighting only when its destination is in this set. When
   * omitted, releases produce no sighting (the edge is unknown).
   */
  gardenEdge?: ReadonlySet<string> | readonly string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function assertIdSet(
  value: ReadonlySet<string> | readonly string[] | undefined,
  name: string,
): void {
  if (value === undefined) return;
  const entries =
    value instanceof Set ? [...value] : (value as readonly string[]);
  if (!Array.isArray(entries)) {
    throw new Error(`${name} must be a Set or an array of ids`);
  }
  for (const entry of entries) {
    if (!isNonEmptyString(entry)) {
      throw new Error(`${name} must contain only non-empty string ids`);
    }
  }
}

function inSet(
  value: ReadonlySet<string> | readonly string[] | undefined,
  id: string | null,
): boolean {
  if (id === null) return false;
  if (value instanceof Set) return value.has(id);
  return (value as readonly string[]).includes(id);
}

/**
 * The Garden news since the last check-in: every qualifying doorway
 * movement strictly after `since`, in stamp order (stable for equal
 * stamps). Returns fresh items in a fresh array; the log is never
 * mutated or reordered.
 */
export function checkInNews(
  log: MovementLog,
  options: CheckInNewsOptions,
): CheckInNewsItem[] {
  if (options === null || typeof options !== "object") {
    throw new Error("check-in news options must be an object");
  }
  if (
    options.since !== null &&
    (typeof options.since !== "number" || !Number.isFinite(options.since))
  ) {
    throw new Error("check-in news since must be null or a finite number");
  }
  assertIdSet(options.gardenHomes, "gardenHomes");
  assertIdSet(options.gardenEdge, "gardenEdge");

  return log
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      validateMovement(entry);
      return options.since === null || entry.at > options.since;
    })
    .sort((a, b) => a.entry.at - b.entry.at || a.index - b.index)
    .flatMap(({ entry }) => {
      let kind: CheckInNewsKind | null = null;
      if (entry.verb === "garden-arrival") {
        if (
          options.gardenHomes === undefined ||
          inSet(options.gardenHomes, entry.to)
        ) {
          kind = "arrival";
        }
      } else if (entry.verb === "garden-departure") {
        if (
          options.gardenHomes === undefined ||
          inSet(options.gardenHomes, entry.from)
        ) {
          kind = "departure";
        }
      } else if (entry.verb === "release") {
        if (
          options.gardenEdge !== undefined &&
          inSet(options.gardenEdge, entry.to)
        ) {
          kind = "edge-sighting";
        }
      }
      // gift / trade / transfer: keeper-to-keeper, never Garden news.
      if (kind === null) return [];
      const item: CheckInNewsItem = {
        creatureId: entry.creatureId,
        kind,
        movementId: entry.id,
        at: entry.at,
        from: entry.from,
        to: entry.to,
      };
      return [item];
    });
}
