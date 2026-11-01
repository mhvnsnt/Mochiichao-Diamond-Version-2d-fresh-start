/**
 * B3 §2.5 resident-arc read — the Garden changes on the story's
 * schedule, pure library form: the third story effect.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: "Story:
 * sequence beats change the Garden (arrivals, departures, a resident's
 * arc) on the story's schedule, not the player's." The composition
 * half of that beat is garden-story.ts (arrivals/departures); this
 * module is the arc half, kept deliberately separate, as slice 20
 * promised: a resident's arc is per-resident state with its own
 * input, not a field smuggled onto a composition beat.
 *
 * Arc semantics, exactly as the spec shapes them and no further:
 * - Arc state is a list of { residentId, arc } entries, one per
 *   resident, in caller order. Arc values are opaque caller strings;
 *   this module enumerates no arc stage, no arc name, and no
 *   resident — the caller names every arc it assigns.
 * - An arc beat is { id, changes }: a list of { residentId, arc }
 *   assignments that take effect at that beat. Beats apply in caller
 *   (schedule) order, up to and including the caller-supplied
 *   throughBeatId cursor — the same cursor rule as garden-story.ts:
 *   the caller states how far the story has reached, and this read
 *   never advances the story itself. A cursor naming no beat in the
 *   schedule fails loudly — silently applying all beats, or none,
 *   would invent a story position.
 * - Within one beat, changes apply in list order, and a beat naming
 *   the same resident twice fails loudly: two arc values for one
 *   resident in one beat is ambiguous, not a last-wins rule.
 * - A change for a resident already in state replaces that resident's
 *   arc in place (state order preserved). A change for a resident
 *   not in state appends a new entry at the end, in change order.
 * - `changed` is the NET arc change: residents in the result whose
 *   arc differs from the input, plus residents newly assigned, in
 *   result order. A resident changed by one beat and changed back
 *   by a later applied beat is not changed: its arc is what it was.
 *   A resident assigned the arc it already had is not changed.
 *   `appliedBeatIds` lists every applied beat in schedule order,
 *   whether or not it changed any arc.
 *
 * Deliberately NOT here: NO arc vocabulary authored (arc values are
 * opaque; no stages, names, or thresholds are enumerated); NO
 * composition change (arrivals/departures are garden-story.ts's
 * read, not this one — an arc beat never adds or removes a
 * resident from the Garden, it only records an arc for one); NO
 * species, place, or range data authored (resident ids are opaque;
 * the #102 range rule is the host's filter, not this read's); NO
 * host (garden-wiring.ts, GardenView, wiring/phase4-garden.ts,
 * garden-register.ts do not import this module — staging locks in
 * the test); NO store/view/save change; NO cursor advancement (the
 * caller moves the cursor; this read only reads up to it); NO
 * numeric effect in live play.
 *
 * Purity: inputs are never mutated or reordered, and input entry
 * objects are never written to; outputs are fresh values. Loud
 * failures (throw) on malformed beats, duplicate beat ids, a beat
 * naming one resident twice, duplicate input residents, an unknown
 * cursor, and non-array beats or state.
 */

export interface ResidentArc {
  residentId: string;
  arc: string;
}

export interface ArcChange {
  residentId: string;
  arc: string;
}

export interface ArcBeat {
  id: string;
  changes: ArcChange[];
}

export interface ArcBeatResult {
  arcs: ResidentArc[];
  changed: string[];
  appliedBeatIds: string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function validateResidentArc(entry: ResidentArc): void {
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error("ResidentArc must be an object");
  }
  if (!isNonEmptyString(entry.residentId)) {
    throw new Error("ResidentArc residentId must be a non-empty string");
  }
  if (!isNonEmptyString(entry.arc)) {
    throw new Error("ResidentArc arc must be a non-empty string");
  }
}

export function validateArcBeat(beat: ArcBeat): void {
  if (beat === null || typeof beat !== "object" || Array.isArray(beat)) {
    throw new Error("ArcBeat must be an object");
  }
  if (!isNonEmptyString(beat.id)) {
    throw new Error("ArcBeat id must be a non-empty string");
  }
  if (!Array.isArray(beat.changes)) {
    throw new Error("ArcBeat changes must be an array");
  }
  const seen = new Set<string>();
  for (const change of beat.changes) {
    if (change === null || typeof change !== "object" || Array.isArray(change)) {
      throw new Error("ArcChange must be an object");
    }
    if (!isNonEmptyString(change.residentId)) {
      throw new Error("ArcChange residentId must be a non-empty string");
    }
    if (!isNonEmptyString(change.arc)) {
      throw new Error("ArcChange arc must be a non-empty string");
    }
    if (seen.has(change.residentId)) {
      throw new Error(
        `ArcBeat ${beat.id} changes the same resident twice: ${change.residentId}`,
      );
    }
    seen.add(change.residentId);
  }
}

function validateArcs(arcs: ResidentArc[]): void {
  if (!Array.isArray(arcs)) {
    throw new Error("ResidentArc state must be an array");
  }
  const seen = new Set<string>();
  for (const entry of arcs) {
    validateResidentArc(entry);
    if (seen.has(entry.residentId)) {
      throw new Error(
        `ResidentArc state contains duplicate resident: ${entry.residentId}`,
      );
    }
    seen.add(entry.residentId);
  }
}

/**
 * Apply arc beats in schedule order up to and including the beat
 * named by throughBeatId. Beats after the cursor are not applied.
 */
export function applyArcBeats(
  arcs: ResidentArc[],
  beats: ArcBeat[],
  throughBeatId: string,
): ArcBeatResult {
  validateArcs(arcs);
  if (!isNonEmptyString(throughBeatId)) {
    throw new Error("throughBeatId must be a non-empty string");
  }
  if (!Array.isArray(beats)) {
    throw new Error("ArcBeat schedule must be an array");
  }
  const seenBeatIds = new Set<string>();
  for (const beat of beats) {
    validateArcBeat(beat);
    if (seenBeatIds.has(beat.id)) {
      throw new Error(`ArcBeat schedule contains duplicate id: ${beat.id}`);
    }
    seenBeatIds.add(beat.id);
  }
  const cursorIndex = beats.findIndex((beat) => beat.id === throughBeatId);
  if (cursorIndex === -1) {
    throw new Error(
      `throughBeatId names no beat in the schedule: ${throughBeatId}`,
    );
  }

  // Fresh entries throughout: input objects are never written to.
  const current: ResidentArc[] = arcs.map((entry) => ({ ...entry }));
  const appliedBeatIds: string[] = [];
  for (let i = 0; i <= cursorIndex; i++) {
    const beat = beats[i];
    appliedBeatIds.push(beat.id);
    for (const change of beat.changes) {
      const at = current.findIndex(
        (entry) => entry.residentId === change.residentId,
      );
      if (at !== -1) {
        current[at] = { residentId: change.residentId, arc: change.arc };
      } else {
        current.push({ residentId: change.residentId, arc: change.arc });
      }
    }
  }

  const before = new Map(arcs.map((entry) => [entry.residentId, entry.arc]));
  const changed = current
    .filter((entry) => before.get(entry.residentId) !== entry.arc)
    .map((entry) => entry.residentId);
  return { arcs: current, changed, appliedBeatIds };
}
