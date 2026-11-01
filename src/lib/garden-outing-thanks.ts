/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks — one
 * outing plus its comfort days plus its thanks presentation, pure
 * library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-decay-plus-comfort bundle from
 *   garden-outing-comfort (slice 34: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, each exactly
 *   as its own read reports it);
 * - one thanks presentation per caller-named thanks window, in
 *   caller order, via garden-thanks' thanksPresentation, over
 *   each window's OWN happy-use events, previous and new level,
 *   and heart-place zone.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the thanks section is NOT computed
 * from the outing-comfort section's comfort values, bond values,
 * or effective values — a caller counts satisfied needs from the
 * comfort term (or any equivalent caller source) and hands this
 * module the counts as events, exactly as garden-thanks requires
 * — and the outing-comfort section is NOT overwritten by any
 * thanks signal or gathering beat. A Garden can therefore read
 * one comfort number in the outing-comfort section and a thanks
 * intensity in the thanks section that comes from different
 * events over a different window, and both facts are reported.
 * Thanks never changes comfort, a bond, or a level in this
 * module's hands, and comfort never emits a signal — each is a
 * read at the moment of the call, and the inputs each read
 * reports are returned unchanged. Which of them a host shows
 * first, and whether either changes anything in live play, is a
 * host decision this module does not make. The bundle itself
 * carries no merged residents field, no band, cap, or scale on
 * any thanks intensity beyond the reads' own rules (intensity is
 * the raw satisfied / total ratio, inherited from garden-thanks;
 * a zero-satisfaction event emits nothing, inherited), no
 * currency, balance, spend, or unlock, and no named rite or
 * bell-equivalent object (the gathering beat is just
 * { kind: "gathering", zoneId, fromLevel, toLevel }, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-comfort bundle and the thanks section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the thanks section's facts are exactly what
 *   thanksPresentation reports over each window's own inputs,
 *   and the outing-comfort section's facts are exactly what
 *   gardenOutingComfort reports over its own inputs;
 * - NO thanks computed from a comfort value: the events are
 *   caller-supplied counts, never derived here from a comfort
 *   day, a bond, or an effective value;
 * - NO comfort, bond, or level writer: comfort is a day's term
 *   read, bonds are the ledger read's own values, and a level
 *   is a caller-supplied number this module never aggregates
 *   (garden-level is a separate read for a host to call);
 * - NO band, threshold, tier, or unlock reading on a thanks
 *   intensity or a level beyond the composed reads' own rules
 *   (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-comfort
 *   and garden-thanks, caller-supplied);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing-comfort); NO bio-fill section (inherited);
 * - NO honour or money field (inherited); NO meeting writer
 *   and NO arrival writer (inherited); NO cursor storage and
 *   NO check-in stamp storage (inherited): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section (inherited);
 * - NO Garden geography authored: homes, the edge, and the
 *   heart-place zone are caller-supplied sets inside the
 *   composed inputs (Owner Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values
 *   are opaque caller strings; the #102 range rule is the
 *   host's filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call, and
 * the thanks signals and gathering beats are copied here, so
 * mutating a returned signal or beat never touches the caller's
 * events or levels. Loud failures (throw) on a malformed input
 * bundle, a missing outing-comfort or thanks section, a bad
 * thanks windows shape, a bad or duplicate thanks window id,
 * and on any failure the composed reads themselves raise. Silent
 * defaults are never invented: an outing with no arrivals, no
 * meetings, no news, no records, no observations, no bond
 * entries, no decay entries, no comfort entries, and no thanks
 * windows reads its inputs back unchanged, never a fabricated
 * outing with thanks.
 */

import {
  gardenOutingComfort,
  type GardenOutingComfort,
  type GardenOutingComfortInputs,
} from "./garden-outing-comfort";
import {
  thanksPresentation,
  type ThanksPresentation,
  type ThanksUseEvent,
} from "./garden-thanks";

/** One caller-named thanks window, over its own inputs. */
export interface ThanksWindow {
  /** Opaque id for this window (caller string, not a zone id). */
  id: string;
  /** The happy-use events of this window, caller-counted. */
  events: readonly ThanksUseEvent[];
  /** Previous level, or null for a first attainment. */
  previousLevel: number | null;
  /** New level, or null when there is no new level. */
  newLevel: number | null;
  /** Caller-supplied heart-place zone of the Garden. */
  heartZoneId: string;
}

/** The inputs one outing-plus-comfort-plus-thanks bundle is composed from. */
export interface GardenOutingThanksInputs {
  /** The outing-comfort bundle's inputs, as slice 34 takes them. */
  outingComfort: GardenOutingComfortInputs;
  /** The thanks section's inputs: one window per presentation, in caller order. */
  thanks: {
    windows: readonly ThanksWindow[];
  };
}

/** One thanks window's presentation, copied fresh. */
export interface ThanksReading {
  /** The window's id, as supplied. */
  id: string;
  /** The presentation exactly as garden-thanks reports it. */
  presentation: ThanksPresentation;
}

/** One outing plus its comfort days plus its thanks presentations. */
export interface GardenOutingThanks {
  /** The outing-plus-decay-plus-comfort bundle, exactly as slice 34 reports it. */
  outingComfort: GardenOutingComfort;
  /** One presentation per caller-named thanks window, in caller order. */
  thanks: ThanksReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its comfort days plus its thanks presentations:
 * outing-comfort bundle + per-window thanks presentations, each
 * exactly as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingThanks(
  inputs: GardenOutingThanksInputs,
): GardenOutingThanks {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-thanks: inputs must be an object");
  }
  if (
    inputs.outingComfort === null ||
    typeof inputs.outingComfort !== "object"
  ) {
    throw new Error(
      "garden-outing-thanks: outingComfort inputs must be an object",
    );
  }
  if (inputs.thanks === null || typeof inputs.thanks !== "object") {
    throw new Error(
      "garden-outing-thanks: thanks inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.thanks.windows)) {
    throw new Error("garden-outing-thanks: thanks windows must be an array");
  }
  const seen = new Set<string>();
  for (const window of inputs.thanks.windows) {
    if (window === null || typeof window !== "object") {
      throw new Error("garden-outing-thanks: thanks window must be an object");
    }
    if (!isNonEmptyString(window.id)) {
      throw new Error(
        "garden-outing-thanks: thanks window id must be a non-empty string",
      );
    }
    if (seen.has(window.id)) {
      throw new Error(
        `garden-outing-thanks: duplicate thanks window id: ${window.id}`,
      );
    }
    seen.add(window.id);
  }
  const outingComfort = gardenOutingComfort(inputs.outingComfort);
  const thanks = inputs.thanks.windows.map((window) => {
    const presentation = thanksPresentation({
      events: [...window.events],
      previousLevel: window.previousLevel,
      newLevel: window.newLevel,
      heartZoneId: window.heartZoneId,
    });
    return {
      id: window.id,
      presentation: {
        signals: presentation.signals.map((signal) => ({ ...signal })),
        gathering:
          presentation.gathering === null
            ? null
            : { ...presentation.gathering },
      },
    };
  });
  return { outingComfort, thanks };
}
