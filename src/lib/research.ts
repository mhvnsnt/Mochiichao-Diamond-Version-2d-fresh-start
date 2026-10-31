// Gap-fill S11 slice 1 — the research derivation (pure, tested).
//
// GAP-FILL-PLAN G-6 / Arceus WIRING-PLAN W1 (T1 core, derivation half):
// #97's law is "task tallies are stored facts; research levels are
// derived at read time, never stored." This slice is the derivation
// only — no store section, no task data, no host reads it yet (like
// S8 slice 3's selector before its slice-4 host, and S10 slices 1-2
// before their host), so it correctly does not appear in the live
// bundle until a host imports it.
//
// Sources, and what they are NOT:
// - Task kinds are #97's CLOSED vocabulary, verbatim:
//   'observe' | 'feed' | 'battle-witness' | 'track' | 'care'.
//   No sixth verb is added here: capture/defeat outcomes are NOT
//   #97 verbs. The transfer map proposes them as tally CLASSES read
//   from capture records / battle outcomes — that is a flagged
//   spec-extension decision for the data/host slice, not something
//   this derivation assumes. A def carrying any other kind is a
//   caller error answered by ignoring that def (see below), never
//   by silently accepting a new verb.
// - The level function shape is Arceus T1 as adopted by G-6:
//   each task is a counted ladder of goal tiers; each tier reached
//   earns its task's weight in checkmarks (1 normally, 2 for a
//   designated backbone task); research level = sum of weighted
//   checkmarks, CAPPED at 10; level 10 = the entry is Complete.
//   This fills #97's explicitly OPEN level-function slot with the
//   transfer's shape — it does not invent per-species lists.
// - #97's task shape is {taskId, speciesId, kind, target}. A def
//   here carries `tiers` (the ladder) instead of a single target:
//   a one-tier def IS the #97 shape (tiers: [target]). Ladders
//   default to Arceus' band shapes only as caller-supplied numbers
//   — this module authors no per-species task list, target, or
//   weight. No per-species research data exists in canon (#97's own
//   coverage note: "Contents: zero instanced"), so defs arrive as
//   a caller-supplied argument, exactly as behaviour.ts takes its
//   profile and followerFind takes its per-area table. A caller
//   with no defs has level 0, and this module authors none.
// - Research points (W1, for T5 licence standing): 10 points per
//   checkmark, UNCAPPED — "points keep accruing past level 10 —
//   levels cap, the economy doesn't" (Arceus teardown §1.1).
//   researchPoints therefore returns checkmarks * 10 with no cap
//   and NO +100 completion bonus: the bonus is a one-time award
//   paid at the report ceremony, and a pure read-time function
//   cannot know whether it was already paid — adding it here
//   would pay it on every read. The bonus belongs to the report
//   host slice, not to this derivation.
// - No kept-gate in this slice: Arceus banks pre-catch progress
//   and shows level 0 for an uncaught species, but #97's level
//   formula takes tallies vs targets only, with no kept input.
//   Whether the display gates a level on the #14 kept state is a
//   host/display decision for the Dex surface slice (W4); this
//   pure function reads tallies + defs only and states the gap
//   instead of inventing a store read.
// - Defensive reads, stated: a negative or non-finite tally counts
//   as 0; a tier threshold below 1 never counts (a 0 threshold
//   would award a checkmark for doing nothing); a weight other
//   than 2 reads as 1; a tally taskId with no def earns nothing;
//   defs for other species are ignored by the species filter.

export const RESEARCH_LEVEL_CAP = 10;
export const RESEARCH_POINTS_PER_CHECKMARK = 10;

export type ResearchTaskKind =
  | "observe"
  | "feed"
  | "battle-witness"
  | "track"
  | "care";

const RESEARCH_KINDS: ReadonlySet<string> = new Set([
  "observe",
  "feed",
  "battle-witness",
  "track",
  "care",
]);

export interface ResearchTaskDef {
  taskId: string;
  speciesId: string;
  kind: ResearchTaskKind;
  /** Ascending goal tiers; a single tier is #97's {target}. */
  tiers: number[];
  /** 1 normally; 2 for a designated backbone task. Absent = 1. */
  weight?: 1 | 2;
}

/** #97's save shape: {speciesId: {taskId: count}} — facts only. */
export type ResearchTallies = Record<string, Record<string, number>>;

function cleanCount(count: number | undefined): number {
  if (typeof count !== "number" || !Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

/** How many of a task's tiers a tally count has reached. */
export function tiersReached(count: number, tiers: number[]): number {
  const clean = cleanCount(count);
  let reached = 0;
  for (const tier of tiers) {
    if (tier >= 1 && clean >= tier) reached += 1;
  }
  return reached;
}

/** Weighted checkmarks one task contributes at a tally count. */
export function taskCheckmarks(def: ResearchTaskDef, count: number): number {
  if (!RESEARCH_KINDS.has(def.kind)) return 0;
  const weight = def.weight === 2 ? 2 : 1;
  return tiersReached(count, def.tiers) * weight;
}

function speciesCheckmarks(
  defs: ResearchTaskDef[],
  tallies: ResearchTallies,
  speciesId: string,
): number {
  const speciesTallies = tallies[speciesId] ?? {};
  let total = 0;
  for (const def of defs) {
    if (def.speciesId !== speciesId) continue;
    total += taskCheckmarks(def, speciesTallies[def.taskId]);
  }
  return total;
}

/** Research level: sum of weighted checkmarks, capped at 10. */
export function researchLevel(
  defs: ResearchTaskDef[],
  tallies: ResearchTallies,
  speciesId: string,
): number {
  return Math.min(RESEARCH_LEVEL_CAP, speciesCheckmarks(defs, tallies, speciesId));
}

/** Research points: checkmarks * 10, uncapped (no completion bonus). */
export function researchPoints(
  defs: ResearchTaskDef[],
  tallies: ResearchTallies,
  speciesId: string,
): number {
  return speciesCheckmarks(defs, tallies, speciesId) * RESEARCH_POINTS_PER_CHECKMARK;
}

// Gap-fill S11 slice 2 — the tally writer core (pure, tested).
//
// W1's store half: tallies are stored facts, levels are derived at
// read time (slice 1). This helper is the ONE way a tally count
// changes: it returns a new ResearchTallies with exactly one count
// raised, and the SAME reference when nothing changes, so a store
// action can skip its set on a no-op (the S8 slice-2/7 pattern:
// a no-change tick never churns the store, saves, or re-renders).
// - `by` defaults to 1 and is floored; 0, negative, NaN, or infinite
//   `by` is a no-op, never a decrement — tallies only ever grow.
// - An empty speciesId or taskId is a no-op: a tally with no owner
//   or no task is not a fact.
// - A stored count that is negative or non-finite is cleaned to 0
//   before adding (the same cleanCount slice 1 reads through), so a
//   corrupted save cannot drag a tally below zero.
// - This helper does NOT validate the taskId against any def list:
//   kind lives in the def, not in the tally, and slice 1 already
//   answers a tally taskId with no def by earning nothing. A writer
//   that invents a taskId therefore cannot inflate a level — it
//   earns zero until authored defs name that id.
// - Deliberately NOT here: no live writer calls this yet. Writers
//   (observe / feed / care / battle-witness / track) are slice 3,
//   and they need authored task defs to know WHICH taskId to raise:
//   no per-species research task data exists in canon (#97's own
//   coverage note: "Contents: zero instanced"), so no taskId is
//   authored or guessed in this slice. The store action below is
//   the seat those writers will call.
export function withResearchTally(
  tallies: ResearchTallies,
  speciesId: string,
  taskId: string,
  by = 1,
): ResearchTallies {
  if (!speciesId || !taskId) return tallies;
  if (typeof by !== "number" || !Number.isFinite(by)) return tallies;
  const delta = Math.floor(by);
  if (delta <= 0) return tallies;
  const speciesTallies = tallies[speciesId] ?? {};
  const prev = cleanCount(speciesTallies[taskId]);
  return {
    ...tallies,
    [speciesId]: { ...speciesTallies, [taskId]: prev + delta },
  };
}

// Gap-fill S11 slice 3 — the W2 writer contract: one tally per kind.
//
// Slice 2 left writers gated on "authored task defs to know WHICH
// taskId to raise". That gate is now closed by a system contract,
// not by per-species data, so no species content is invented here:
// a writer records under taskId === the kind string itself
// ('observe' | 'feed' | 'battle-witness' | 'track' | 'care').
// One task per kind per species; the tier ladder (slice 1) carries
// multiple goals for that kind, so no second task per kind is ever
// needed. Def authors therefore write exactly one def per kind per
// species with taskId = kind — that is the meeting point where a
// writer's tally and a def's checkmarks meet. A def carrying any
// other taskId reads a tally no writer writes and earns nothing
// until something writes that id, exactly as slice 1's rule says.
// This contract authors no per-species target, weight, or list;
// those stay data-lane work. What it fixes is only the namespace,
// so writers can land now and defs can meet them later without a
// migration. If the data lane ever authors a different taskId
// scheme, the migration is mechanical: rename the kind keys in
// stored tallies to the new ids, one key per kind.
// - Writers landing under this contract: feed (slice 3, GardenView
//   Data-Fruit feed). Still gated, NOT invented here: observe (its
//   host is the S10 roamer path, itself gated on #152 profiles);
//   battle-witness (its event semantics — which battle outcomes
//   count as witnessing — are not stated in any held source, so no
//   battle-end site claims the verb yet); track (the #89 path has
//   no held call site); care (no Garden care action exists — the
//   phase-4 care loop is unimported library, not a player action).
export function researchTaskIdForKind(kind: ResearchTaskKind): string {
  return kind;
}

/** Level 10 = the entry is Complete. */
export function isResearchComplete(
  defs: ResearchTaskDef[],
  tallies: ResearchTallies,
  speciesId: string,
): boolean {
  return researchLevel(defs, tallies, speciesId) >= RESEARCH_LEVEL_CAP;
}

// Gap-fill S11 slice 4 — the W4 Dex display read (pure, tested).
//
// The Dex surface shows recorded FACTS only, never a derived level:
// no per-species defs exist yet (slice 1's rule — defs are
// caller-supplied, and #97's coverage note is "zero instanced"), so
// a level computed over an empty def list would read 0 for every
// species by default, not by measurement. Levels, points, and
// checkmarks therefore stay off the surface until defs land; what
// the surface shows is the tally count per kind, which is a stored
// fact the writers already write. A tally under a taskId outside
// #97's closed kind vocabulary is ignored here, exactly as slice 1
// ignores a def outside it — only kind-keyed tallies are facts
// this vocabulary can display. The kept-gate decision slice 1 left
// to this slice: the Dex component shows this section for caught
// species only, matching the footprint/cry gating already in
// DexView (seen and undiscovered entries show no research block).
/** #97's kind vocabulary in display order. */
export const RESEARCH_KIND_ORDER: readonly ResearchTaskKind[] = [
  "observe",
  "feed",
  "battle-witness",
  "track",
  "care",
];

/** Recorded tally count per kind for one species; absent = 0. */
export function researchKindCounts(
  tallies: ResearchTallies,
  speciesId: string,
): Record<ResearchTaskKind, number> {
  const speciesTallies = tallies[speciesId] ?? {};
  const counts = {} as Record<ResearchTaskKind, number>;
  for (const kind of RESEARCH_KIND_ORDER) {
    counts[kind] = cleanCount(speciesTallies[kind]);
  }
  return counts;
}
