/**
 * B3 §2.5 story-beat composition read — the Garden changes on the
 * story's schedule, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: "Story:
 * sequence beats change the Garden (arrivals, departures, a resident's
 * arc) on the story's schedule, not the player's." This module is the
 * composition half of that beat only: given the current resident
 * composition and a caller-supplied beat schedule, it returns the
 * composition the story has produced. It is the schedule-driven
 * sibling of garden-migration.ts (which reads world-state keys); the
 * two reads share composition semantics and differ only in what
 * selects the change — a world-state key there, a story cursor here.
 *
 * Schedule semantics, exactly as the spec shapes them and no further:
 * - A beat is { id, arrivals, departures }: creatures that join the
 *   composition at that beat and creatures that leave at it. Beat
 *   ids and creature ids are opaque caller strings; this module
 *   enumerates no story point, no beat, and no creature.
 * - Beats apply in caller (schedule) order; within one beat,
 *   departures apply before arrivals, so a beat can replace a
 *   resident and a later beat can undo an earlier one.
 * - The story cursor is the caller's `throughBeatId`: beats apply up
 *   to and including that beat, and beats after it do not apply yet.
 *   The cursor is how "on the story's schedule, not the player's"
 *   is structural: the caller states how far the story has reached,
 *   and this read never advances the story itself. A cursor naming
 *   no beat in the schedule fails loudly — silently applying all
 *   beats, or none, would invent a story position.
 * - Composition order is stable: surviving original residents keep
 *   caller order, and new arrivals append in beat order, each at
 *   most once (first arrival wins). A creature already resident is
 *   not re-added, and a departure for a creature not resident
 *   changes nothing — but an applied beat still counts as applied.
 * - `arrived` and `departed` are the NET composition change: a
 *   creature in the result but not in the input, and a creature in
 *   the input but not in the result. A resident departed by one
 *   beat and re-arrived by a later applied beat is neither: it was
 *   present before and after, so the composition did not change
 *   for it. `appliedBeatIds` lists every applied beat in schedule
 *   order, whether or not it changed the composition.
 *
 * Deliberately NOT here: NO resident-arc change (the spec's third
 * story effect — a resident's arc — needs per-resident arc state
 * vocabulary this read does not carry; arcs are a later slice with
 * their own input, not a field smuggled onto a beat); NO story
 * vocabulary authored (beat ids are opaque; no sequence, chapter,
 * or event names are enumerated); NO species, place, or range data
 * authored (creature ids are opaque; the #102 range rule is the
 * host's filter, not this read's); NO host (garden-wiring.ts,
 * GardenView, wiring/phase4-garden.ts, garden-register.ts do not
 * import this module — staging locks in the test); NO store/view/
 * save change; NO cursor advancement (the caller moves the cursor;
 * this read only reads up to it); NO numeric effect in live play.
 *
 * Purity: inputs are never mutated or reordered; outputs are fresh
 * values. Loud failures (throw) on malformed beats, duplicate beat
 * ids, duplicate residents, an unknown cursor, and non-array beats.
 */

export interface StoryBeat {
  id: string;
  arrivals: string[];
  departures: string[];
}

export interface StoryCompositionResult {
  residents: string[];
  arrived: string[];
  departed: string[];
  appliedBeatIds: string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function checkIdList(
  list: unknown,
  label: string,
): asserts list is string[] {
  if (!Array.isArray(list)) {
    throw new Error(`StoryBeat ${label} must be an array`);
  }
  const seen = new Set<string>();
  for (const entry of list) {
    if (!isNonEmptyString(entry)) {
      throw new Error(`StoryBeat ${label} entries must be non-empty strings`);
    }
    if (seen.has(entry)) {
      throw new Error(`StoryBeat ${label} contains duplicate id: ${entry}`);
    }
    seen.add(entry);
  }
}

export function validateStoryBeat(beat: StoryBeat): void {
  if (beat === null || typeof beat !== "object" || Array.isArray(beat)) {
    throw new Error("StoryBeat must be an object");
  }
  if (!isNonEmptyString(beat.id)) {
    throw new Error("StoryBeat id must be a non-empty string");
  }
  checkIdList(beat.arrivals, "arrivals");
  checkIdList(beat.departures, "departures");
  const overlap = beat.arrivals.filter((id) => beat.departures.includes(id));
  if (overlap.length > 0) {
    throw new Error(
      `StoryBeat ${beat.id} both arrives and departs: ${overlap.join(", ")}`,
    );
  }
}

function validateResidents(residents: string[]): void {
  checkIdList(residents, "residents");
}

/**
 * Apply story beats in schedule order up to and including the beat
 * named by throughBeatId. Beats after the cursor are not applied.
 */
export function applyStoryBeats(
  residents: string[],
  beats: StoryBeat[],
  throughBeatId: string,
): StoryCompositionResult {
  validateResidents(residents);
  if (!isNonEmptyString(throughBeatId)) {
    throw new Error("throughBeatId must be a non-empty string");
  }
  if (!Array.isArray(beats)) {
    throw new Error("StoryBeat schedule must be an array");
  }
  const seenBeatIds = new Set<string>();
  for (const beat of beats) {
    validateStoryBeat(beat);
    if (seenBeatIds.has(beat.id)) {
      throw new Error(`StoryBeat schedule contains duplicate id: ${beat.id}`);
    }
    seenBeatIds.add(beat.id);
  }
  const cursorIndex = beats.findIndex((beat) => beat.id === throughBeatId);
  if (cursorIndex === -1) {
    throw new Error(
      `throughBeatId names no beat in the schedule: ${throughBeatId}`,
    );
  }

  const current: string[] = [...residents];
  const appliedBeatIds: string[] = [];
  for (let i = 0; i <= cursorIndex; i++) {
    const beat = beats[i];
    appliedBeatIds.push(beat.id);
    for (const id of beat.departures) {
      const at = current.indexOf(id);
      if (at !== -1) {
        current.splice(at, 1);
      }
    }
    for (const id of beat.arrivals) {
      if (!current.includes(id)) {
        current.push(id);
      }
    }
  }

  const before = new Set(residents);
  const after = new Set(current);
  return {
    residents: current,
    arrived: current.filter((id) => !before.has(id)),
    departed: residents.filter((id) => !after.has(id)),
    appliedBeatIds,
  };
}
