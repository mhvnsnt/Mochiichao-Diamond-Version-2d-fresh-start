/**
 * B3 §2.2 + §2.5 + §2.6 — one journey's Garden visit, pure library form.
 *
 * The two bridge bundles already landed are two lenses on the same
 * visit, and this module is their composition for one read — it
 * invents no new section and no new rule. It calls the existing
 * reads and reports exactly what they return, side by side:
 * - what the journey brings home from garden-inbound (§2.2:
 *   arrivals from the doorway log, teachers from the journey's
 *   meetings, taught axes in first-appearance order);
 * - the Garden snapshot from garden-snapshot (§2.5 + §2.6: the
 *   check-in beat plus one bridge record per caller-named
 *   creature, in the caller's order).
 *
 * The two sections run over their OWN inputs and are never
 * merged, chained, or reconciled: the caller may hand the
 * inbound bundle and the snapshot bundle the same doorway log
 * or two different logs, and this module does not require them
 * to agree. An inbound arrival is NOT fed into a snapshot
 * record, and a snapshot record is NOT fed back into the
 * inbound bundle — so a creature can read resident in the
 * inbound arrivals (over the journey's log) and not resident
 * in its own snapshot record (over that record's log), and both
 * facts are reported. Which of them a host shows first, and
 * whether either changes anything in live play, is a host
 * decision this module does not make. The journey itself
 * carries no `residents` field, so no caller can mistake it
 * for a merged composition.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   inbound bundle and the snapshot (above);
 * - NO reconciliation of the two bundles' logs (above): each
 *   section's residency, arrival, and news facts are exactly
 *   what its own read reports over its own inputs;
 * - NO honour or money field (inherited from garden-inbound:
 *   both arrive as caller-held counts, not reads over these
 *   inputs);
 * - NO meeting writer and NO arrival writer (inherited from
 *   garden-inbound), NO cursor storage and NO check-in stamp
 *   storage (inherited from garden-snapshot): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section (inherited from garden-snapshot:
 *   a record gains a field only when its own read gains one);
 * - NO Garden geography authored: homes and the edge are
 *   caller-supplied sets inside the composed inputs (Owner
 *   Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values
 *   are opaque caller strings; the #102 range rule is the
 *   host's filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call
 * (see garden-inbound and garden-snapshot), so each journey
 * call's result is fresh too. Loud failures (throw) on a
 * malformed input bundle, a missing inbound or snapshot
 * section, and on any failure the composed reads themselves
 * raise (malformed logs, duplicate movement ids, malformed
 * mappings or meetings, malformed record entries, unknown
 * cursors, a non-finite check-in stamp). Silent defaults are
 * never invented: a journey with no arrivals, no meetings, no
 * news, and no records reads its inputs back unchanged, never
 * a fabricated visit.
 */

import {
  inboundFromJourney,
  type JourneyInbound,
  type JourneyInboundInputs,
} from "./garden-inbound";
import {
  gardenSnapshot,
  type GardenSnapshot,
  type GardenSnapshotInputs,
} from "./garden-snapshot";

/** The inputs one journey's visit bundle is composed from. */
export interface GardenJourneyInputs {
  /** The §2.2 inbound bundle's inputs, as slice 26 takes them. */
  inbound: JourneyInboundInputs;
  /** The §2.5 + §2.6 snapshot bundle's inputs, as slice 29 takes them. */
  snapshot: GardenSnapshotInputs;
}

/** One journey's Garden visit: inbound bundle plus snapshot. */
export interface GardenJourney {
  /** What the journey brings home, exactly as slice 26 reports it. */
  inbound: JourneyInbound;
  /** The Garden snapshot, exactly as slice 29 reports it. */
  snapshot: GardenSnapshot;
}

/**
 * One journey's Garden visit: inbound + snapshot, each exactly
 * as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their logs.
 */
export function gardenJourney(inputs: GardenJourneyInputs): GardenJourney {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-journey: inputs must be an object");
  }
  if (inputs.inbound === null || typeof inputs.inbound !== "object") {
    throw new Error("garden-journey: inbound inputs must be an object");
  }
  if (inputs.snapshot === null || typeof inputs.snapshot !== "object") {
    throw new Error("garden-journey: snapshot inputs must be an object");
  }
  const inbound = inboundFromJourney(inputs.inbound);
  const snapshot = gardenSnapshot(inputs.snapshot);
  return { inbound, snapshot };
}
