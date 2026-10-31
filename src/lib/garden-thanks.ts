/**
 * Thanks-emission presentation read — DQB2 TRANSFER-MAP X7 in pure
 * library form (gap-fill S14, slice 10; the W5 gathering-beat half
 * deferred from slice 9).
 *
 * X7's shape, as the transfer map states it: gratitude takes the
 * FORM of DQB2's thanks, not its currency. When a resident uses a
 * habitat happily, the thanks is visible in-world AT THAT SPOT
 * (the Pokopia comfort read gains an emitted, locatable signal
 * the player can read like weather), and Garden Level advancement
 * (Pokopia M5, garden-level.ts) is a GATHERING BEAT — residents
 * assemble at the Garden's heart-place for the level change —
 * instead of a silent number. Per-place scoping is native
 * (Garden Level is per-Garden; signals here are per zone, and
 * per habitat within the zone).
 *
 * What this module builds is ONLY the presentation read, and it
 * authors NOTHING that X7 leaves to content or to a host:
 *
 * - Happy-use events are caller-supplied. This module never
 *   decides that a resident used a habitat, never reads the
 *   comfort term, and never imports garden-comfort: a caller
 *   counts satisfied needs from that term's needsSatisfied
 *   output (or any equivalent caller source) and hands this
 *   module the counts. Zone and habitat ids are caller-supplied
 *   opaque strings; no resident, zone, habitat, or recipe
 *   vocabulary is authored here (owner slots S1/S3 untouched).
 * - A use that satisfied nothing emits NOTHING: thanks is
 *   emitted by happy use only, so satisfiedNeeds === 0 events
 *   are filtered out, not rendered faintly.
 * - Signals are an EPHEMERAL presentation snapshot, recomputed
 *   from the events of one window. This module stores nothing,
 *   keeps no balance, and creates no spendable object: the
 *   spendable thanks-currency with item sinks is REFUSED by
 *   the transfer map, and nothing here may be persisted as a
 *   wallet. Grouping inside one call (same zone + habitat) is
 *   aggregation of that window's events, not a bank.
 * - The gathering beat carries NO fiction: owner slot S4
 *   (whether the beat has a named rite, a keeper's ceremony,
 *   or a bell-equivalent object) is NOT settled here, so the
 *   beat names no rite and no object — it is just
 *   { kind: "gathering", zoneId: heartZoneId, fromLevel, toLevel }.
 *   The heart-place itself is caller-supplied (heartZoneId);
 *   this module never invents where a Garden's heart is.
 * - Intensity is a raw ratio (satisfied / total across the
 *   grouped window), never a band: no intensity threshold,
 *   tier, or unlock is authored here. Rendering bands are a
 *   later GardenView decision.
 *
 * Deliberately NOT here: NO host (garden-wiring.ts, GardenView,
 * phase4-garden.ts do not import this module — staging locks in
 * the test); NO GardenView presentation state (that is the host
 * slice, later); NO currency, balance, spend, or unlock; NO
 * named rite or bell-equivalent; NO resident/zone/recipe data;
 * NO effect in live play.
 */

function fail(message: string): never {
  throw new Error(`garden-thanks: ${message}`);
}

export interface ThanksUseEvent {
  /** Where the good thing happened (caller-supplied, opaque). */
  zoneId: string;
  /**
   * Recognised habitat recipe id at that spot, or null for a
   * zone-level use with no habitat attached.
   */
  habitatId: string | null;
  /**
   * Needs met by this use, counted by the caller from the W5
   * comfort term (or an equivalent caller source). Integer >= 0.
   */
  satisfiedNeeds: number;
  /** Needs checked for this use. Integer >= 0, >= satisfiedNeeds. */
  totalNeeds: number;
}

export interface ThanksSignal {
  zoneId: string;
  habitatId: string | null;
  /** Happy-use events grouped into this signal. */
  uses: number;
  satisfiedNeeds: number;
  totalNeeds: number;
  /** satisfiedNeeds / totalNeeds across the grouped window (0..1). */
  intensity: number;
}

export interface GatheringBeat {
  kind: "gathering";
  /** Caller-supplied heart-place zone of the Garden. */
  zoneId: string;
  /** Previous level, or null for a first attainment. */
  fromLevel: number | null;
  toLevel: number;
}

export interface ThanksPresentation {
  signals: ThanksSignal[];
  /** Null when the level did not change (or no new level exists). */
  gathering: GatheringBeat | null;
}

function validateZoneId(zoneId: string, name: string): void {
  if (typeof zoneId !== "string" || zoneId.length === 0) {
    fail(`${name} must be a non-empty string`);
  }
}

function validateCount(value: number, name: string): void {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    fail(`${name} must be an integer >= 0`);
  }
}

function validateEvent(event: ThanksUseEvent): void {
  validateZoneId(event.zoneId, "zoneId");
  if (event.habitatId !== null) validateZoneId(event.habitatId, "habitatId");
  validateCount(event.satisfiedNeeds, "satisfiedNeeds");
  validateCount(event.totalNeeds, "totalNeeds");
  if (event.satisfiedNeeds > event.totalNeeds) {
    fail("satisfiedNeeds cannot exceed totalNeeds");
  }
}

function validateLevel(value: number | null, name: string): void {
  if (value === null) return;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    fail(`${name} must be null or an integer >= 0`);
  }
}

/**
 * Group one window's happy-use events into per-place signals.
 * Zero-satisfaction events emit nothing and are dropped. Output
 * order is deterministic (zoneId, then habitatId with null first)
 * regardless of input order. Inputs are never mutated.
 */
export function thanksEmissions(events: ThanksUseEvent[]): ThanksSignal[] {
  if (!Array.isArray(events)) fail("events must be an array");
  const grouped = new Map<string, ThanksSignal>();
  for (const event of events) {
    validateEvent(event);
    if (event.satisfiedNeeds === 0) continue;
    const key = JSON.stringify([event.zoneId, event.habitatId]);
    const existing = grouped.get(key);
    if (existing) {
      existing.uses += 1;
      existing.satisfiedNeeds += event.satisfiedNeeds;
      existing.totalNeeds += event.totalNeeds;
    } else {
      grouped.set(key, {
        zoneId: event.zoneId,
        habitatId: event.habitatId,
        uses: 1,
        satisfiedNeeds: event.satisfiedNeeds,
        totalNeeds: event.totalNeeds,
        intensity: 0,
      });
    }
  }
  const signals = [...grouped.values()];
  for (const s of signals) {
    s.intensity = s.totalNeeds === 0 ? 0 : s.satisfiedNeeds / s.totalNeeds;
  }
  signals.sort((a, b) => {
    if (a.zoneId !== b.zoneId) return a.zoneId < b.zoneId ? -1 : 1;
    if (a.habitatId === b.habitatId) return 0;
    if (a.habitatId === null) return -1;
    if (b.habitatId === null) return 1;
    return a.habitatId < b.habitatId ? -1 : 1;
  });
  return signals;
}

/**
 * The level-change gathering beat, or null when there is no new
 * level or the level did not change. A first attainment
 * (previousLevel null, new level present) IS a beat, with
 * fromLevel null. No rite or object is named (owner slot S4).
 */
export function gatheringBeat(
  previousLevel: number | null,
  newLevel: number | null,
  heartZoneId: string,
): GatheringBeat | null {
  validateLevel(previousLevel, "previousLevel");
  validateLevel(newLevel, "newLevel");
  validateZoneId(heartZoneId, "heartZoneId");
  if (newLevel === null || previousLevel === newLevel) return null;
  return { kind: "gathering", zoneId: heartZoneId, fromLevel: previousLevel, toLevel: newLevel };
}

/** One presentation pass: signals for the window + the level beat. */
export function thanksPresentation(input: {
  events: ThanksUseEvent[];
  previousLevel: number | null;
  newLevel: number | null;
  heartZoneId: string;
}): ThanksPresentation {
  return {
    signals: thanksEmissions(input.events),
    gathering: gatheringBeat(input.previousLevel, input.newLevel, input.heartZoneId),
  };
}
