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

/** Level 10 = the entry is Complete. */
export function isResearchComplete(
  defs: ResearchTaskDef[],
  tallies: ResearchTallies,
  speciesId: string,
): boolean {
  return researchLevel(defs, tallies, speciesId) >= RESEARCH_LEVEL_CAP;
}
