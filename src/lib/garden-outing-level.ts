/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level — one outing plus its comfort days plus its thanks
 * presentations plus its Garden level summaries, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-comfort-plus-thanks bundle from
 *   garden-outing-thanks (slice 35: the outing bundle plus one
 *   per-creature bond list from the per-pair ledger, plus one
 *   effective-bond breakdown per caller-named decay entry, plus
 *   one comfort day per caller-named comfort entry, plus one
 *   thanks presentation per caller-named thanks window, each
 *   exactly as its own read reports it);
 * - one Garden level summary per caller-named level entry, in
 *   caller order, via garden-level's gardenLevelSummary, over
 *   each entry's OWN comforts, tiers, tierMax, weights, and bands.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the level section is NOT computed from
 * the outing-thanks section's comfort days, bond values,
 * effective values, or thanks intensities — a caller counts
 * comforts and tiers from its own sources and hands this module
 * those numbers, exactly as garden-level requires — and the
 * outing-thanks section is NOT overwritten by any level summary.
 * A Garden can therefore read one comfort number in the
 * outing-thanks section and a level aggregate in the level
 * section that comes from different comforts over a different
 * window, and both facts are reported. A level never changes
 * comfort, a bond, or a thanks signal in this module's hands,
 * and comfort never sets a level — each is a read at the moment
 * of the call, and the inputs each read reports are returned
 * unchanged. Which of them a host shows first, and whether
 * either changes anything in live play, is a host decision this
 * module does not make. The bundle itself carries no merged
 * residents field, no band, cap, or scale on any level beyond
 * the reads' own rules (bands are caller-supplied, inherited
 * from garden-level; an empty band list means "no levels
 * defined", never a default level), no currency, balance, spend,
 * or unlock, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-thanks section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-thanks bundle and the level section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the level section's facts are exactly what
 *   gardenLevelSummary reports over each entry's own inputs,
 *   and the outing-thanks section's facts are exactly what
 *   gardenOutingThanks reports over its own inputs;
 * - NO level computed from a comfort day: the comforts are
 *   caller-supplied numbers, never read off a comfort entry, a
 *   bond, an effective value, or a thanks intensity;
 * - NO comfort, bond, or level writer: comfort is a day's term
 *   read, bonds are the ledger read's own values, and a level
 *   is a summary this module never stores or unlocks with
 *   (what a level unlocks is a later host/presentation decision);
 * - NO band, threshold, tier, or unlock reading on a level
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from garden-outing-thanks
 *   and garden-level, caller-supplied);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing-thanks); NO bio-fill section (inherited);
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
 * the level summaries are copied here, so mutating a returned
 * summary never touches the caller's comforts, tiers, or bands.
 * Loud failures (throw) on a malformed input bundle, a missing
 * outing-thanks or levels section, a bad levels entries shape, a
 * bad or duplicate level entry id, and on any failure the
 * composed reads themselves raise. Silent defaults are never
 * invented: an outing with no arrivals, no meetings, no news, no
 * records, no observations, no bond entries, no decay entries,
 * no comfort entries, no thanks windows, and no level entries
 * reads its inputs back unchanged, never a fabricated outing
 * with a level.
 */

import {
  gardenOutingThanks,
  type GardenOutingThanks,
  type GardenOutingThanksInputs,
} from "./garden-outing-thanks";
import {
  gardenLevelSummary,
  type GardenLevelInput,
  type GardenLevelSummary,
} from "./garden-level";

/** One caller-named level summary, over its own inputs. */
export interface LevelEntry {
  /** Opaque id for this summary (caller string, not a zone id). */
  id: string;
  /** The garden-level inputs this summary runs over. */
  input: GardenLevelInput;
}

/** The inputs one outing-plus-thanks-plus-level bundle is composed from. */
export interface GardenOutingLevelInputs {
  /** The outing-thanks bundle's inputs, as slice 35 takes them. */
  outingThanks: GardenOutingThanksInputs;
  /** The level section's inputs: one entry per summary, in caller order. */
  levels: {
    entries: readonly LevelEntry[];
  };
}

/** One level entry's summary, copied fresh. */
export interface LevelReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The summary exactly as garden-level reports it. */
  summary: GardenLevelSummary;
}

/** One outing plus its thanks presentations plus its level summaries. */
export interface GardenOutingLevel {
  /** The outing-plus-comfort-plus-thanks bundle, exactly as slice 35 reports it. */
  outingThanks: GardenOutingThanks;
  /** One summary per caller-named level entry, in caller order. */
  levels: LevelReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its thanks presentations plus its level
 * summaries: outing-thanks bundle + per-entry level summaries,
 * each exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their pictures.
 */
export function gardenOutingLevel(
  inputs: GardenOutingLevelInputs,
): GardenOutingLevel {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-level: inputs must be an object");
  }
  if (
    inputs.outingThanks === null ||
    typeof inputs.outingThanks !== "object"
  ) {
    throw new Error(
      "garden-outing-level: outingThanks inputs must be an object",
    );
  }
  if (inputs.levels === null || typeof inputs.levels !== "object") {
    throw new Error("garden-outing-level: levels inputs must be an object");
  }
  if (!Array.isArray(inputs.levels.entries)) {
    throw new Error("garden-outing-level: levels entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.levels.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-level: level entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-level: level entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-level: duplicate level entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (entry.input === null || typeof entry.input !== "object") {
      throw new Error(
        "garden-outing-level: level entry input must be an object",
      );
    }
  }
  const outingThanks = gardenOutingThanks(inputs.outingThanks);
  const levels = inputs.levels.entries.map((entry) => {
    const summary = gardenLevelSummary(entry.input);
    return { id: entry.id, summary: { ...summary } };
  });
  return { outingThanks, levels };
}
