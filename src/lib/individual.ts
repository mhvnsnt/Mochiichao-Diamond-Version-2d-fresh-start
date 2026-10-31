// Individual record (gap-fill S7, slice 1) — the #80 record, as code.
//
// Source of truth for the SHAPE: src/data/core/schemas/individual.schema.json
// ($id mochiichao/individual/v1): personality_seed is a uint32
// (0..4294967295); variance.stats are six integers 0..15; variance.size_class
// is small | standard | large; variance.temperament_read may be null;
// deviations is an array whose entries a generator may only read when RULED.
// This module is the first runtime reader of that shape. It does NOT invent
// canon content:
//  - The derivation below is this module's roll rule, stated plainly, not a
//    claim about any species: the low 24 bits of the seed give the six
//    variance stats, 4 bits each in hp/atk/def/spa/spd/spe order, and the
//    top byte modulo 3 gives the size class. A seed is rolled once at
//    creation and never re-rolled (stable for life); evolution keeps the
//    record because evolveInstance mutates the instance in place.
//  - temperament_read is always null here: no temperament derivation is
//    authored by this slice (that is the personality layer's work, S7/S8),
//    and a null is what the schema allows rather than an invented read.
//  - deviations is always [] here: this generator rules no deviations, and
//    the schema's own rule is that generators may only read RULED ones.
//  - NOT wired here, by design: the variance stats do NOT feed
//    createMochii's stat calculation yet (that function still uses its
//    static IV 15, as before — changing live stats is a balance decision
//    for the S7 follow-up, not smuggled into this slice), and mood is NOT
//    derived here (S8's HGSS-pattern derived read).
//  - Slice 2 (this landing): old saves ARE backfilled on load — see
//    ensureIndividual/backfillIndividuals below and their use in
//    gameStore.loadState, the one funnel every save-load path uses.
//    Backfill fills only ABSENCE: a member that already carries a
//    record keeps it exactly (never re-rolled); a present-but-malformed
//    record is not repaired here, because no writer on main can produce
//    one (slice 1 is the only writer, and it writes valid records).
//  - The open teardown-hgss PR #50 touches ONLY the schema file, not this
//    module or the instance type, so there is no file collision.
//  - S8 slice 1 (this slice): follower mood seat + state machine. The
//    record gains an optional mood (-127..127, start 0 per movement.json);
//    the pure functions below are the whole state machine so far — range,
//    drift, delta. NOT wired here, by design: no drift tick runs in any
//    host yet, no lead-change reset, no reaction selection, no find
//    generation (findState stays a later slice with the behaviour-profile
//    seam, as PR #50's own description says). Mood is never shown to the
//    player as a number (PR #50 schema semantics).
//  - S8 slice 2: the two host behaviours that make the seat move.
//    followerLeadId / driftLeadMood / resetLeadMoodOnChange below are
//    pure party-level helpers; the store exposes them as actions and
//    WorldEngine (the follower's host — the only place a follower is
//    rendered) calls them: a lead change resets the INCOMING lead's
//    mood to neutral (PR #50's "resets when the party lead changes",
//    read as the new follower starting neutral — the outgoing lead's
//    stored mood is left untouched at the moment of the switch (it
//    resets only if and when it becomes lead again), and each
//    world-clock hour
//    ticks the lead's mood one step toward neutral (movement.json
//    drift, with the tick defined here as the S1 world-clock hour —
//    one game-hour per 15 real seconds in WorldEngine's useDayNight —
//    because movement.json names no cadence of its own, and a per-hour
//    tick keeps a short-term mood alive across a play session instead
//    of draining it in seconds on a per-second tick or in steps on a
//    per-step tick. That cadence choice is this slice's, stated here,
//    not a canon claim). No reaction selection, no find generation:
//    those still wait on the behaviour-profile seam.
//  - S8 slice 3: the mood event economy (MOOD_EVENT_DELTAS /
//    applyMoodEvent / withMoodEvent below, TEARDOWN-HGSS §1 numbers).
//    Reaction selection itself lives in followerReaction.ts.
//  - S8 slice 6: find generation lives in followerFind.ts (roll +
//    mood-gated handover as pure functions over a caller-supplied
//    table) and the findState seat lives on IndividualRecord in
//    types.ts; what is still open is the walking host (no roll rate
//    is authored anywhere) and the per-area tables themselves (no
//    find rows exist on main — the data lane authors them, this
//    slice authors none).
//  - S8 slice 7: the handover half now has its host —
//    withPendingHandover in followerFind.ts (pure decision) +
//    gameStore.handoverFollowerFind (bag write) called from the
//    slice-4 talk-to-follower branch in WorldEngine, whose dialog
//    pages the handover line before the reaction line. Still open:
//    the walking roll host and the per-area tables (a carried find
//    cannot occur in live play until a roll host sets one).

import type { IndividualRecord, IndividualVariance, MochiiInstance } from "./types";

export const INDIVIDUAL_SEED_MIN = 0;
export const INDIVIDUAL_SEED_MAX = 4294967295;

const SIZE_CLASSES = ["small", "standard", "large"] as const;

export function validatePersonalitySeed(seed: number): void {
  if (!Number.isInteger(seed) || seed < INDIVIDUAL_SEED_MIN || seed > INDIVIDUAL_SEED_MAX) {
    throw new RangeError(
      `personalitySeed must be an integer ${INDIVIDUAL_SEED_MIN}..${INDIVIDUAL_SEED_MAX}, got ${seed}`,
    );
  }
}

export function rollPersonalitySeed(rng: () => number = Math.random): number {
  // Math.random, matching the codebase's own generateId/createMochii rolls.
  return Math.floor(rng() * (INDIVIDUAL_SEED_MAX + 1));
}

/** Deterministic variance derivation from a seed (rule stated in header). */
export function varianceFromSeed(seed: number): IndividualVariance {
  validatePersonalitySeed(seed);
  const stats = {
    hp: seed & 0xf,
    atk: (seed >>> 4) & 0xf,
    def: (seed >>> 8) & 0xf,
    spa: (seed >>> 12) & 0xf,
    spd: (seed >>> 16) & 0xf,
    spe: (seed >>> 20) & 0xf,
  };
  const sizeClass = SIZE_CLASSES[((seed >>> 24) & 0xff) % 3];
  return { stats, sizeClass, temperamentRead: null };
}

/** A fresh individual record: rolled seed (or the given one), derived variance. */
export function createIndividual(seed: number = rollPersonalitySeed()): IndividualRecord {
  validatePersonalitySeed(seed);
  return {
    personalitySeed: seed,
    variance: varianceFromSeed(seed),
    deviations: [],
    // S8 slice 1: movement.json follower.mood.startValue.
    mood: FOLLOWER_MOOD_NEUTRAL,
  };
}

export const FOLLOWER_MOOD_MIN = -127;
export const FOLLOWER_MOOD_MAX = 127;
export const FOLLOWER_MOOD_NEUTRAL = 0;

/**
 * Writer-side normaliser: truncate to integer, clamp to -127..127.
 * A non-finite input reads as neutral rather than throwing, so a bad
 * delta can never poison a stored mood.
 */
export function clampMood(value: number): number {
  if (!Number.isFinite(value)) return FOLLOWER_MOOD_NEUTRAL;
  return Math.max(FOLLOWER_MOOD_MIN, Math.min(FOLLOWER_MOOD_MAX, Math.trunc(value)));
}

/**
 * Read a record's mood: a stored integer clamped into range; an absent
 * or non-integer mood reads neutral. Never throws and never repairs the
 * record — a present record without a mood field (S7 slices 1–2 output)
 * is a valid neutral, not a defect to fix.
 */
export function readMood(record: IndividualRecord | undefined | null): number {
  if (!record || typeof record.mood !== "number") return FOLLOWER_MOOD_NEUTRAL;
  return clampMood(record.mood);
}

/**
 * movement.json follower.mood.drift, verbatim: one step toward neutral
 * per tick. An absent mood drifts as neutral (stays 0).
 */
export function driftMood(mood: number | undefined | null): number {
  const m = typeof mood === "number" ? clampMood(mood) : FOLLOWER_MOOD_NEUTRAL;
  if (m > 0) return m - 1;
  if (m < 0) return m + 1;
  return FOLLOWER_MOOD_NEUTRAL;
}

/**
 * Apply an event delta to a mood and clamp. Deltas are caller-supplied:
 * the named events below (slice 3) carry teardown deltas; any other
 * writer passes its own delta here, never a guessed table.
 */
export function applyMoodDelta(mood: number | undefined | null, delta: number): number {
  const base = typeof mood === "number" ? clampMood(mood) : FOLLOWER_MOOD_NEUTRAL;
  return clampMood(base + (Number.isFinite(delta) ? Math.trunc(delta) : 0));
}

/**
 * S8 slice 3 — mood event deltas, TEARDOWN-HGSS §1
 * (~/workspace/bw2-hgss-teardown/TEARDOWN-HGSS.md, "Mood — the hidden
 * engine"): level-up +40, battle items +10, vitamins +8, recovering
 * from poison at 1 HP -50. Bitter medicine is -20..-40 by strength on
 * that page with no tier table, so it has NO event entry here:
 * callers pass the strength's delta through applyMoodDelta directly,
 * never a guessed tier. Host wiring: level-up in WorldEngine's
 * payoffCommitLevel (slice 3, one +40 per level beat actually
 * committed); battle-item in WorldEngine's battle Mend Patch branch
 * and poison-recovery-1hp in gameStore's healParty (slice 5). Vitamin
 * has no item or host in this build and stays unwired, never invented.
 */
export const MOOD_EVENT_DELTAS = {
  "level-up": 40,
  "battle-item": 10,
  vitamin: 8,
  "poison-recovery-1hp": -50,
} as const;

export type MoodEvent = keyof typeof MOOD_EVENT_DELTAS;

export function applyMoodEvent(mood: number | undefined | null, event: MoodEvent): number {
  const delta: number | undefined = (MOOD_EVENT_DELTAS as Record<string, number | undefined>)[event];
  if (delta === undefined) throw new RangeError(`unknown mood event: ${String(event)}`);
  return applyMoodDelta(mood, delta);
}

/**
 * S8 slice 3 — apply a mood event to one member, non-mutating. A
 * member with no individual record is returned AS-IS (mood has no
 * seat; backfill is loadState's job, not a battle/item writer's).
 * A member whose mood does not move (already at the clamp) is also
 * returned AS-IS, so a host can skip its set on a no-op.
 */
export function withMoodEvent(member: MochiiInstance, event: MoodEvent): MochiiInstance {
  if (!member || !member.individual) return member;
  const mood = applyMoodEvent(member.individual.mood, event);
  if (mood === readMood(member.individual)) return member;
  return { ...member, individual: { ...member.individual, mood } };
}

/**
 * S8 slice 2 — the follower lead, as WorldEngine derives it (its
 * followerLead line, verbatim in rule): the first party member with
 * (currentHp ?? hp) > 0, else the first member, else null. Party
 * records carry no egg state today, so the config's
 * "first_alive_non_egg_else_first_non_egg" collapses to exactly this
 * (WorldEngine's own comment). The (currentHp ?? hp) read mirrors the
 * host, which carries both fields on battle copies while the type
 * declares hp only — hence the any-cast, not a type change.
 */
export function followerLeadId(members: readonly MochiiInstance[]): string | null {
  if (!Array.isArray(members) || members.length === 0) return null;
  const lead = members.find((m: any) => (m?.currentHp ?? m?.hp) > 0) ?? members[0];
  return lead?.id ?? null;
}

/**
 * S8 slice 2 — one drift tick for the lead only: the lead's mood moves
 * one step toward neutral (driftMood); every other member is returned
 * untouched. Pure and non-mutating: when the lead has no individual
 * record (a member the load backfill never saw — load/create cover
 * every normal path, so this is a guard, not a writer) or its mood
 * already reads neutral, the input array is returned AS-IS (same
 * reference), so a store action can skip the set entirely and a
 * no-op tick never churns saves or re-renders.
 */
export function driftLeadMood(members: MochiiInstance[]): MochiiInstance[] {
  const leadId = followerLeadId(members);
  if (!leadId) return members;
  const idx = members.findIndex((m) => m.id === leadId);
  if (idx < 0) return members;
  const lead = members[idx];
  if (!lead.individual) return members;
  const drifted = driftMood(lead.individual.mood);
  if (drifted === readMood(lead.individual)) return members;
  const next = [...members];
  next[idx] = { ...lead, individual: { ...lead.individual, mood: drifted } };
  return next;
}

/**
 * S8 slice 2 — lead-change reset: when the party lead changes, the
 * INCOMING lead's mood resets to neutral (0). prevLeadId null means
 * "first observation" — no change event has been seen yet, so nothing
 * resets (otherwise the first frame of every session would wipe the
 * lead's mood). Same lead, no lead, a lead with no individual record,
 * or a lead already neutral: the input array is returned AS-IS.
 * Pure and non-mutating, same store-set-skip contract as driftLeadMood.
 */
export function resetLeadMoodOnChange(
  members: MochiiInstance[],
  prevLeadId: string | null | undefined,
): MochiiInstance[] {
  if (prevLeadId == null) return members;
  const leadId = followerLeadId(members);
  if (!leadId || leadId === prevLeadId) return members;
  const idx = members.findIndex((m) => m.id === leadId);
  if (idx < 0) return members;
  const lead = members[idx];
  if (!lead.individual) return members;
  if (readMood(lead.individual) === FOLLOWER_MOOD_NEUTRAL) return members;
  const next = [...members];
  next[idx] = { ...lead, individual: { ...lead.individual, mood: FOLLOWER_MOOD_NEUTRAL } };
  return next;
}

/**
 * S7 slice 2 — backfill for one instance from an old save: if it already
 * carries an individual record, return it untouched (same object, never
 * re-rolled); otherwise return a copy carrying a freshly rolled record.
 * Pure: the input instance is never mutated, so a save object can be
 * backfilled in memory without rewriting the save file until next save.
 */
export function ensureIndividual(instance: MochiiInstance): MochiiInstance {
  if (!instance || typeof instance !== "object") return instance;
  if (instance.individual) return instance;
  return { ...instance, individual: createIndividual() };
}

/** S7 slice 2 — backfill a whole party/pc array (absence only, per member). */
export function backfillIndividuals(members: MochiiInstance[]): MochiiInstance[] {
  return members.map(ensureIndividual);
}
