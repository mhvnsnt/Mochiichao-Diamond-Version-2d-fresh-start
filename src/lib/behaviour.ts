// Gap-fill S10 slice 1 — the behaviour scorer (pure, tested).
//
// GAP-FILL-PLAN G-3/G-5: one pure scorer library reading #152 axes x
// PlaceFact x clock state x B2 pressure x B1 standing, emitting behaviour
// + awareness states; its first consumers are the roamers of S10 and the
// follower reactions of S8. This slice is the scorer only — no host reads
// it yet (like S8 slice 3's selector before its slice-4 host), so it
// correctly does not appear in the live bundle until a host imports it.
//
// Source axes, and what they are NOT:
// - The #152 wild view is exactly threatResponse + curiosity + activity
//   (per #19 phase). The spec's closed vocabularies are used verbatim:
//   threatResponse in {flee, freeze, display, charge, vanish},
//   curiosity in {wary, neutral, bold}. Sociality, careBehaviours,
//   idleLoops and displayBehaviours are the Garden / show views, not
//   scorer inputs — this module does not take them.
// - NO per-species #152 profile contents exist on main (the spec's own
//   open slots: distilling profiles from sheets is a data-lane pass,
//   species by species, never invented here). The scorer therefore takes
//   the profile as a caller-supplied argument, exactly as followerFind
//   takes its per-area table — a caller with no profile has no score,
//   and this module authors none.
// - PlaceFact (S4) enters through exactly ONE rule in v1: the sealed
//   fence. A sealed place (dark-forest-depths, the depths absence)
//   scores null — no roamer can exist there, so a call for one is a
//   host error answered honestly, not a behaviour. No weather, time,
//   or habitat rule is seeded: PlaceFact carries weatherKey
//   'clear' | 'mist' | null only with no verified mapping to
//   fieldWeather ids (place.ts records this), and the #67 fragment is
//   ambient population behaviour, not roamer rules — a row for either
//   would be a guess, so both wait on their authoring lanes.
// - Clock state enters as activeInPhase, resolved by the CALLER from
//   the S1 clock phase + the profile's activity map. The scorer never
//   reads a clock itself: an inactive-phase roamer is capped at
//   suspicious (it stirs but does not act), stated here as this
//   slice's reading — the spec gives activity per phase but no
//   inactive-phase behaviour rule.
// - B2 pressure and B1 standing enter as ONE composition slot,
//   awarenessShift (-1 | 0 | 1, absent = 0). Neither system has landed
//   its own step computation (pressure lands with S13, standing reads
//   with honor P3), so this module applies the caller's step and
//   computes none — a seam, not a fabricated system.
// - Distance bands are this slice's stated reading, anchored on one
//   authored number: BW2 TARGET-SPEC §6's "flee = path away when the
//   player closes within 2 tiles". Alerted <= 2 tiles, suspicious
//   3..6 tiles, unaware beyond 6; unknown distance (null / NaN) reads
//   unaware — an honest unknown, not a guess. Curiosity does NOT shift
//   the bands; it shapes what the roamer DOES at each band.
// - Behaviour vocabulary is BW2 TARGET-SPEC §6's five
//   (graze | wander | flee | chase | curious) PLUS 'still', added for
//   the freeze / display threat responses, which stop the roamer
//   without moving it — §6 has no word for standing still, and
//   mapping freeze onto graze or wander would be false motion.
// - Chase obeys §6's flagged-only law: charge-threat at alerted
//   becomes 'chase' ONLY when the caller passes chaseFlagged true.
//   Unflagged, it holds ground ('still') and threatens — the branded
//   Kittember beat stays scripted, never a roamer.
// - Output is a derived read, never stored state (Arceus T2/W3): the
//   host recomputes it each tick from the live distance and profile.
//   threatPresentation echoes the profile's threatResponse at alerted
//   only; below alerted it is null — a wary roamer at suspicious has
//   not committed to its threat display yet.
//
// What this slice deliberately does NOT do: no roamer spawn table
// (BW2 §6's Route Topaz rows are the data lane's / host's job — the
// species in them already exist in route_1's pool, nothing new is
// authored here), no WorldEngine host step, no despawn/respawn timers,
// no touch-encounter wiring. Those are slice 2's host work.

import type { PlaceFact } from "./place";

/** #152 closed vocabulary, verbatim from the spec. */
export type ThreatResponse = "flee" | "freeze" | "display" | "charge" | "vanish";

/** #152 closed vocabulary, verbatim from the spec. */
export type Curiosity = "wary" | "neutral" | "bold";

/** Arceus T2 awareness states, as a derived read. */
export type AwarenessState = "unaware" | "suspicious" | "alerted";

/**
 * Roamer movement behaviour. BW2 TARGET-SPEC §6's five, plus 'still'
 * for the freeze / display threat responses (see header).
 */
export type RoamerBehaviour =
  | "graze"
  | "wander"
  | "flee"
  | "chase"
  | "curious"
  | "still";

/** The #152 wild view, as the caller supplies it. No per-species row is authored here. */
export interface BehaviourProfile {
  threatResponse: ThreatResponse;
  curiosity: Curiosity;
}

/** What a roamer does at rest, from its map's roamer table (BW2 §6). */
export type CalmBehaviour = "graze" | "wander";

export interface BehaviourInput {
  profile: BehaviourProfile;
  /** The roamer table's at-rest behaviour for this species on this map. */
  baseBehaviour: CalmBehaviour;
  /** S4 PlaceFact for the roamer's map; null on unzoned maps. Sealed scores null. */
  place: PlaceFact | null;
  /** Player distance in tiles; null / NaN = unknown, reads unaware. */
  distanceTiles: number | null;
  /** Whether the S1 clock phase is one this species is active in; null = unknown, no cap. */
  activeInPhase?: boolean | null;
  /** Caller-computed B1/B2 composition step; absent = 0. */
  awarenessShift?: -1 | 0 | 1;
  /** BW2 §6 chase-flagged-only law: false (default) never chases. */
  chaseFlagged?: boolean;
}

export interface RoamerScore {
  awareness: AwarenessState;
  behaviour: RoamerBehaviour;
  /** The profile's threatResponse, at alerted only; null below alerted. */
  threatPresentation: ThreatResponse | null;
}

const AWARENESS_ORDER: readonly AwarenessState[] = [
  "unaware",
  "suspicious",
  "alerted",
];

function stepAwareness(
  awareness: AwarenessState,
  shift: -1 | 0 | 1,
): AwarenessState {
  const idx = AWARENESS_ORDER.indexOf(awareness) + shift;
  if (idx <= 0) return "unaware";
  if (idx >= AWARENESS_ORDER.length - 1) return "alerted";
  return AWARENESS_ORDER[idx];
}

/**
 * The distance band, before any composition shift or activity cap.
 * Unknown distance reads unaware; negative distance clamps to 0 (alerted).
 */
export function deriveAwareness(
  distanceTiles: number | null,
): AwarenessState {
  if (distanceTiles === null || Number.isNaN(distanceTiles)) {
    return "unaware";
  }
  const d = Math.max(0, distanceTiles);
  if (d <= 2) return "alerted";
  if (d <= 6) return "suspicious";
  return "unaware";
}

/**
 * Score one roamer's behaviour + awareness from its profile and context.
 * Pure and non-mutating. Returns null only for a sealed place (the depths
 * fence — no roamer can exist there); every other context scores.
 */
export function scoreBehaviour(input: BehaviourInput): RoamerScore | null {
  if (input.place !== null && input.place.sealed) return null;

  let awareness = deriveAwareness(input.distanceTiles);
  awareness = stepAwareness(awareness, input.awarenessShift ?? 0);
  // Inactive-phase cap, applied last: an inactive roamer never acts.
  if (input.activeInPhase === false && awareness === "alerted") {
    awareness = "suspicious";
  }

  const { threatResponse, curiosity } = input.profile;
  const threatPresentation: ThreatResponse | null =
    awareness === "alerted" ? threatResponse : null;

  if (awareness === "unaware") {
    return { awareness, behaviour: input.baseBehaviour, threatPresentation };
  }

  if (awareness === "suspicious") {
    if (curiosity === "bold") {
      return { awareness, behaviour: "curious", threatPresentation };
    }
    if (curiosity === "wary") {
      if (threatResponse === "flee" || threatResponse === "vanish") {
        return { awareness, behaviour: "flee", threatPresentation };
      }
      if (threatResponse === "freeze") {
        return { awareness, behaviour: "still", threatPresentation };
      }
      // display / charge at suspicious: holds ground, watches.
      return { awareness, behaviour: input.baseBehaviour, threatPresentation };
    }
    return { awareness, behaviour: input.baseBehaviour, threatPresentation };
  }

  // Alerted.
  switch (threatResponse) {
    case "flee":
    case "vanish":
      return { awareness, behaviour: "flee", threatPresentation };
    case "freeze":
    case "display":
      return { awareness, behaviour: "still", threatPresentation };
    case "charge":
      return {
        awareness,
        behaviour: input.chaseFlagged === true ? "chase" : "still",
        threatPresentation,
      };
  }
}
