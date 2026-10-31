// Follower reactions (gap-fill S8, slice 3) — mood made legible, as a
// pure selector over axes that already exist at runtime.
//
// Source axes, and what they are NOT:
// - Mood band: the sign partition of the -127..127 mood value
//   (negative = low, 0 = neutral, positive = high). This partition is
//   THIS slice's reading of TEARDOWN-HGSS §1's "bad mood / good mood"
//   gate language — the teardown page gives no numeric band cutoffs,
//   so none are asserted here.
// - Species type + terrain: TEARDOWN-HGSS §1, "Environment responses
//   by type and terrain" — Fire-types miserable wading on a beach or
//   standing in rain. That rule is seeded below as data, mapped onto
//   OUR habitat classes: beach/wading reads as primaryClass
//   "waters-edge" (shore) or "water" (standing in water). Rain is NOT
//   seeded: PlaceFact carries weatherKey 'clear' | 'mist' | null only,
//   and place.ts records that NO verified mapping exists from those
//   keys to fieldWeather's rain id — a rain row would be a guess, so
//   it waits on the environment-sourcing mapping, not on this slice.
// - Place: S4 PlaceFact (primaryClass / timeBand / weatherKey).
//   Time band arrives inside PlaceFact (place.ts derives it from the
//   S1 WorldState phase), so this module takes no separate clock
//   input in v1; season/phase rows join when content authors them.
// - The #152 behaviour profile (TRANSFER-MAP T-H1: threatResponse /
//   curiosity deciding how an individual reads the world) is the
//   profile system this selector is the seam for: it is NOT on main
//   as data (no #152 doc in src/data/core/docs, and the #67
//   behaviour-table fragment is ambient population behaviour, not
//   follower profiles), so the registry below seeds exactly the one
//   teardown rule that maps onto landed axes, and nothing else.
//   Later content lanes append rows; they never change this matcher.
//
// Output: a reaction id, or null when no authored row matches this
// context. Null is the honest answer for unmapped contexts — the host
// shows nothing special, and no dialogue, animation, or number is
// invented to fill the gap. Reaction ids are abstract keys: the host
// (a future talk-to-follower interaction) maps them onto our own
// animation bank and original reaction text, never HGSS text.

import { clampMood } from "./individual";
import type { ElementType } from "./types";
import type { HabitatClass, PlaceFact, TimeBand } from "./place";

export type MoodBand = "low" | "neutral" | "high";

export function moodBand(mood: number | undefined | null): MoodBand {
  const m = typeof mood === "number" ? clampMood(mood) : 0;
  if (m < 0) return "low";
  if (m > 0) return "high";
  return "neutral";
}

export type FollowerReactionId = "terrain-discomfort";

export interface FollowerReactionRule {
  id: string;
  /** Species types this row applies to; absent = any type. */
  speciesTypes?: readonly ElementType[];
  /** PlaceFact primary classes this row applies to; absent = any. */
  primaryClasses?: readonly HabitatClass[];
  /** PlaceFact time bands this row applies to; absent = any. */
  timeBands?: readonly TimeBand[];
  /** PlaceFact weather keys this row applies to; absent = any. */
  weatherKeys?: readonly string[];
  reaction: FollowerReactionId;
}

/**
 * The seeded registry, in precedence order: the FIRST matching row
 * wins, so authors put specific rows before general ones. Exactly
 * one teardown rule maps onto landed axes today (see header).
 */
export const FOLLOWER_REACTION_RULES: readonly FollowerReactionRule[] = [
  {
    id: "fire-wet-ground",
    speciesTypes: ["FIRE"],
    primaryClasses: ["water", "waters-edge"],
    reaction: "terrain-discomfort",
  },
];

export interface FollowerReactionContext {
  mood?: number | null;
  speciesTypes?: readonly ElementType[];
  place?: PlaceFact | null;
}

export interface FollowerReactionSelection {
  reaction: FollowerReactionId | null;
  moodBand: MoodBand;
}

function ruleMatches(rule: FollowerReactionRule, ctx: FollowerReactionContext): boolean {
  if (rule.speciesTypes && rule.speciesTypes.length > 0) {
    const types = ctx.speciesTypes ?? [];
    if (!rule.speciesTypes.some((t) => types.includes(t))) return false;
  }
  const place = ctx.place ?? null;
  if (rule.primaryClasses && rule.primaryClasses.length > 0) {
    if (!place || !place.primaryClass || !rule.primaryClasses.includes(place.primaryClass)) return false;
  }
  if (rule.timeBands && rule.timeBands.length > 0) {
    if (!place || !place.timeBand || !rule.timeBands.includes(place.timeBand)) return false;
  }
  if (rule.weatherKeys && rule.weatherKeys.length > 0) {
    if (!place || !place.weatherKey || !rule.weatherKeys.includes(place.weatherKey)) return false;
  }
  return true;
}

export function selectFollowerReaction(
  ctx: FollowerReactionContext,
  rules: readonly FollowerReactionRule[] = FOLLOWER_REACTION_RULES,
): FollowerReactionSelection {
  const band = moodBand(ctx.mood);
  for (const rule of rules) {
    if (ruleMatches(rule, ctx)) return { reaction: rule.reaction, moodBand: band };
  }
  return { reaction: null, moodBand: band };
}

// ── S8 slice 4 — talk-to-follower host text ─────────────────────────
// The host (WorldEngine's talk-to-follower branch) maps a selection
// onto ONE line of dialogue. Both lines below are this host's OWN
// original text — never HGSS text, never a quote from the teardown.
// The discomfort line is the original rendering of the seeded
// FIRE-on-wet-ground rule only; the default line is the talk
// interaction's plain greeting, NOT a reaction claim: a null
// selection means "no authored reaction for this context", and the
// host still answers the talk instead of silently doing nothing.
// moodBand deliberately does NOT change the text: the teardown
// gates finds (and, in HGSS, a mood icon) on mood, not these lines,
// so no band->text mapping is invented here. The band stays on the
// selection for the future animation / find-gating readers.
export function followerTalkLine(
  name: string,
  selection: FollowerReactionSelection,
): string {
  if (selection.reaction === "terrain-discomfort") {
    return `${name} shuffles uneasily here, keeping clear of the wet ground.`;
  }
  return `${name} looks up at you, ready to keep going.`;
}
