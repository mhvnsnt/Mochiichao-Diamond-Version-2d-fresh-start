// Follower finds (gap-fill S8, slice 6) — the find half of G-9, as pure
// functions over tables the data lane has not authored yet.
//
// Sources, and what they do and do NOT authorise here:
// - TEARDOWN-HGSS §1, "Finds — walking as a discovery engine": the
//   follower periodically picks up location-flavoured accessories
//   (cosmetic hold-display items themed to the terrain — the find
//   table is per-area). Rarer: the Shiny Leaf — found only in tall
//   grass, only in a good mood, and only on specific routes determined
//   by the follower's nature.
// - TRANSFER-MAP T-H1: "Finds: per-area find tables (small flavour
//   objects, Garden-useful bits) rolled on walking; mood gates
//   handover (a sulking partner keeps its find — behaviour, not
//   theft)." And, on the Leaf-Crown pattern: it "transfers as a
//   shape, not a leaf: a five-piece collectible found only by a
//   contented follower, only in authored places keyed to the
//   individual's own traits... What the five pieces are is an owner
//   slot — the shape is specced, the fiction is his."
// - #152 (SPECIES BEHAVIOUR PROFILES): profiles exist as a spec with
//   closed vocabularies but NO per-species contents (its own
//   open-slots section: distilling profiles from sheets is a
//   data-lane pass, species by species, not invented). So this
//   engine reads NO profile: it takes a find table as input, and
//   profile-weighted rows join later without changing these
//   functions.
//
// What this slice deliberately does NOT do (stated, not smuggled):
// - It authors NO find table and NO find row: on main, the only
//   table-shaped data nearby (wild-drop-tables.json) has ZERO rows
//   and is drop data, not find data — the two are not conflated.
//   With an empty table this engine returns null, honestly.
// - It wires NO walking host: TRANSFER-MAP says finds are "rolled
//   on walking" but names no roll rate or cadence, and inventing a
//   per-step probability would be invented design. The host (and
//   its rate) is a later slice, once a rate is authored.
// - It implements NO leaf / five-piece collectible: the pieces'
//   fiction is an owner slot, and the leaf's tall-grass +
//   nature-route conditions are leaf-specific, not general find
//   rules. The general rule taken from the teardown is only this:
//   a follower in a good mood can find the rarest finds.
// - It hands NOTHING to the player: handover into an inventory is
//   the host's job (it owns item ids and the bag). This module
//   decides what was found and whether the follower hands it over;
//   a withheld find is carried on the record (findState) until a
//   later handover attempt, never silently dropped. S8 slice 7 adds
//   the host side of that sentence (withPendingHandover below + the
//   gameStore handoverFollowerFind action, called from the slice-4
//   talk site): the decision stays here, the bag write stays there.
//
// Mood gating, stated as this slice's reading (the teardown gives
// "good mood" / "bad mood" language, no numeric cutoffs): the
// good/bad partition is followerReaction's moodBand sign partition
// (negative = low, 0 = neutral, positive = high), the same partition
// slice 3 used. Two gates follow from the sources:
//   (1) rare rows are eligible only at high mood ("only a follower
//       in a good mood can find the rarest collectible");
//   (2) handover withholds at low mood ("a follower in a bad mood
//       may refuse to hand over an item it picked up and sulk").
// Gate (2) is read deterministically here — low band withholds —
// because no refusal chance is authored anywhere; a future host
// may roll a chance, but none is invented in this slice.

import { moodBand } from "./followerReaction";
import { readMood } from "./individual";
import type { FollowerFindState, IndividualRecord, MochiiInstance } from "./types";

/** One row of a per-area find table. `weight` defaults to 1; `rare` defaults to false. */
export interface FollowerFindRow {
  itemId: string;
  weight?: number;
  rare?: boolean;
}

/** A per-area find table, as the data lane will author it beside the ecology files. */
export interface FollowerFindTable {
  areaKey: string;
  rows: readonly FollowerFindRow[];
}

/** A find the follower just picked up. */
export interface FollowerFind {
  itemId: string;
  rare: boolean;
}

export const EMPTY_FIND_STATE: FollowerFindState = {
  pendingItemId: null,
  withheldCount: 0,
};

/**
 * Read a record's find state: absent, malformed, or partial state
 * reads as empty — a present record without a findState field (every
 * record written before this slice) is valid, not a defect to fix.
 * Never throws, never repairs the record.
 */
export function readFindState(
  record: IndividualRecord | undefined | null,
): FollowerFindState {
  const state = record?.findState;
  if (!state || typeof state !== "object") return { ...EMPTY_FIND_STATE };
  const pendingItemId =
    typeof state.pendingItemId === "string" ? state.pendingItemId : null;
  const withheldCount =
    typeof state.withheldCount === "number" && Number.isFinite(state.withheldCount)
      ? Math.max(0, Math.trunc(state.withheldCount))
      : 0;
  return { pendingItemId, withheldCount };
}

/** Rows a follower at this mood may find: rare rows only at high mood. */
export function eligibleFindRows(
  table: FollowerFindTable | undefined | null,
  mood: number | undefined | null,
): FollowerFindRow[] {
  if (!table || !Array.isArray(table.rows)) return [];
  const band = moodBand(mood);
  return table.rows.filter((row) => row && typeof row.itemId === "string" && (!row.rare || band === "high"));
}

function rowWeight(row: FollowerFindRow): number {
  return typeof row.weight === "number" && Number.isFinite(row.weight) && row.weight > 0
    ? row.weight
    : 1;
}

/**
 * Roll one find from a table at this mood, or null when nothing is
 * findable (no table, no rows, or only rare rows at a non-high mood).
 * Weighted by row weight (default 1); the rng is injected so tests
 * can drive it exactly (Math.random by default, as elsewhere).
 * A non-finite rng draw reads as 0 rather than poisoning the roll.
 */
export function rollFind(
  table: FollowerFindTable | undefined | null,
  mood: number | undefined | null,
  rng: () => number = Math.random,
): FollowerFind | null {
  const rows = eligibleFindRows(table, mood);
  if (rows.length === 0) return null;
  const total = rows.reduce((sum, row) => sum + rowWeight(row), 0);
  const drawRaw = rng();
  const draw = (Number.isFinite(drawRaw) ? drawRaw : 0) * total;
  let acc = 0;
  for (const row of rows) {
    acc += rowWeight(row);
    if (draw < acc) return { itemId: row.itemId, rare: row.rare === true };
  }
  const last = rows[rows.length - 1];
  return { itemId: last.itemId, rare: last.rare === true };
}

export type FindHandover = "handed" | "withheld";

/** Whether the follower hands a find over at this mood: low band withholds, else hands over. */
export function findHandover(mood: number | undefined | null): FindHandover {
  return moodBand(mood) === "low" ? "withheld" : "handed";
}

/**
 * Apply a found item to a find state, pure and non-mutating.
 * Handed: nothing is carried (state empties). Withheld: the item is
 * carried as pending and the withheld count rises by one.
 */
export function applyFindToState(
  state: FollowerFindState | undefined | null,
  find: FollowerFind,
  handover: FindHandover,
): FollowerFindState {
  if (handover === "handed") return { ...EMPTY_FIND_STATE };
  const base = state ?? EMPTY_FIND_STATE;
  const count =
    typeof base.withheldCount === "number" && Number.isFinite(base.withheldCount)
      ? Math.max(0, Math.trunc(base.withheldCount))
      : 0;
  return { pendingItemId: find.itemId, withheldCount: count + 1 };
}

/**
 * Carry a find on one member, non-mutating, mirroring withMoodEvent's
 * contract: a member with no individual record is returned AS-IS
 * (findState has no seat; backfill is loadState's job, not a find
 * writer's), and a member whose state does not move is also returned
 * AS-IS, so a host can skip its set on a no-op.
 */
export function withFind(
  member: MochiiInstance,
  find: FollowerFind,
  handover: FindHandover,
): MochiiInstance {
  if (!member || !member.individual) return member;
  const next = applyFindToState(member.individual.findState, find, handover);
  const current = readFindState(member.individual);
  if (next.pendingItemId === current.pendingItemId && next.withheldCount === current.withheldCount) {
    return member;
  }
  return { ...member, individual: { ...member.individual, findState: next } };
}

// ── S8 slice 7 — handover of a carried find ─────────────────────────
// The other half of the find loop: a find a follower is CARRYING
// (findState.pendingItemId, set only by a roll host — none exists yet,
// so no live path can carry a find today) is resolved when the player
// talks to the follower (the slice-4 talk site; the store action in
// gameStore.ts is the host, this function is the pure decision).
// The mood gate is the same one as slice 6's findHandover: a low-band
// follower withholds (the carried item stays pending and the withheld
// count rises by one); neutral/high hands it over (the state empties
// and the host adds the item id to the bag — the bag write is the
// host's job, not this function's, because this module owns no
// inventory). No item display name is produced here: no find row or
// display-name table exists on main, so the host's line names no item
// (see followerHandoverLine in followerReaction.ts) rather than
// leaking a data id into dialogue. Pure and non-mutating, same
// as-is contract as withFind: no record, no pending item, or a state
// that does not move returns the member unchanged.
/** The outcome of attempting to take a carried find from a member. */
export interface PendingFindHandover {
  outcome: "none" | "handed" | "withheld";
  itemId: string | null;
}

export function withPendingHandover(member: MochiiInstance): {
  member: MochiiInstance;
  handover: PendingFindHandover;
} {
  const none: PendingFindHandover = { outcome: "none", itemId: null };
  if (!member || !member.individual) return { member, handover: none };
  const current = readFindState(member.individual);
  if (!current.pendingItemId) return { member, handover: none };
  const handover = findHandover(readMood(member.individual));
  const next = applyFindToState(
    current,
    { itemId: current.pendingItemId, rare: false },
    handover,
  );
  if (next.pendingItemId === current.pendingItemId && next.withheldCount === current.withheldCount) {
    return { member, handover: none };
  }
  return {
    member: { ...member, individual: { ...member.individual, findState: next } },
    handover: { outcome: handover, itemId: current.pendingItemId },
  };
}
