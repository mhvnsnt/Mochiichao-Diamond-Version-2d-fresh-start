/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay — one outing plus its
 * bonds plus its effective-bond readings, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-bonds bundle from garden-outing-bonds
 *   (slice 32: the outing bundle plus one per-creature bond list
 *   from the per-pair ledger, each exactly as its own read
 *   reports it);
 * - one effective-bond breakdown per caller-named decay entry,
 *   in caller order, via garden-decay's decayBreakdown, over
 *   each entry's OWN accrued value, neglect facts, and profile.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the decay section is NOT computed from
 * the bonds section's ledger values, and the bonds section is NOT
 * overwritten by any effective value. A pair can therefore read
 * one accrued number in the bonds section (over that section's
 * ledger) and a different effective number in the decay section
 * (over the decay entry's own accrued value, facts, and profile),
 * and both facts are reported. Accrued bond never decays in this
 * module's hands — decay is a read at the moment of the call, and
 * the ledger the bonds section reports is returned unchanged.
 * Which of them a host shows first, and whether either changes
 * anything in live play, is a host decision this module does not
 * make. The bundle itself carries no merged residents field, no
 * band, cap, or scale on any bond value, and no departure rule —
 * decay alone never triggers departure (garden-decay's own rule,
 * inherited, not re-decided here).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-bonds bundle and the decay section (above);
 * - NO reconciliation of the two sections' bond pictures
 *   (above): the decay section's facts are exactly what
 *   decayBreakdown reports over each entry's own inputs, and
 *   the bonds section's facts are exactly what gardenOutingBonds
 *   reports over its own inputs — including any bondLedger a
 *   bridge record input carries, which this module never sees
 *   or touches;
 * - NO bond writer: setBond / removeBond are the ledger read's
 *   own writers; a host that wants a changed ledger calls them
 *   itself. This module records nothing and changes no ledger,
 *   and it never writes an effective value back anywhere;
 * - NO band, cap, scale, or effect reading on a bond value
 *   (inherited from garden-bonds and garden-decay: a value is
 *   the caller's finite number, stored unchanged; a missing pair
 *   is simply absent from the bonds list, never a 0);
 * - NO rates, scalars, or floors authored: every number in a
 *   decay profile is caller-supplied (garden-decay's rule,
 *   inherited — this module assigns no number to any context,
 *   type, or shape);
 * - NO trait names, NO tick length, NO effect bands or gates
 *   (all inherited from garden-decay);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing-bonds); NO bio-fill section (inherited);
 * - NO honour or money field (inherited); NO meeting writer
 *   and NO arrival writer (inherited); NO cursor storage and
 *   NO check-in stamp storage (inherited): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section (inherited);
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
 * reads return fresh objects and fresh arrays on every call, and
 * the decay breakdowns' contribution lists are copied here, so
 * mutating a returned breakdown never touches the caller's facts
 * or profile. Loud failures (throw) on a malformed input bundle,
 * a missing outing-bonds or decay section, a bad decay entries
 * shape, a bad or duplicate decay entry id, and on any failure
 * the composed reads themselves raise (malformed logs, duplicate
 * movement ids, malformed mappings or meetings, malformed record
 * entries, unknown cursors, a non-finite check-in stamp,
 * malformed observations, malformed species mappings, malformed
 * ledger entries, duplicate bond pairs, non-finite bond values,
 * non-finite accrued values, unknown decay contexts or neglect
 * types, negative fact units, and missing rates or floors a fact
 * actually needs). Silent defaults are never invented: an outing
 * with no arrivals, no meetings, no news, no records, no
 * observations, no bond entries, and no decay entries reads its
 * inputs back unchanged, never a fabricated outing with bonds
 * and decay.
 */

import {
  gardenOutingBonds,
  type GardenOutingBonds,
  type GardenOutingBondsInputs,
} from "./garden-outing-bonds";
import {
  decayBreakdown,
  type DecayBreakdown,
  type DecayProfile,
  type NeglectFact,
} from "./garden-decay";

/** One caller-named effective-bond reading, over its own inputs. */
export interface DecayEntry {
  /** Opaque id for this reading (caller string, not a creature id). */
  id: string;
  /** The accrued bond value this reading starts from. */
  accrued: number;
  /** The neglect facts this reading applies, in caller order. */
  facts: readonly NeglectFact[];
  /** The rates, scalars, and floors this reading applies. */
  profile: DecayProfile;
}

/** The inputs one outing-plus-bonds-plus-decay bundle is composed from. */
export interface GardenOutingDecayInputs {
  /** The outing-bonds bundle's inputs, as slice 32 takes them. */
  outingBonds: GardenOutingBondsInputs;
  /** The decay section's inputs: one entry per reading, in caller order. */
  decay: {
    entries: readonly DecayEntry[];
  };
}

/** One decay entry's breakdown, copied fresh. */
export interface DecayReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The breakdown exactly as garden-decay reports it. */
  breakdown: DecayBreakdown;
}

/** One outing plus its bonds plus its effective-bond readings. */
export interface GardenOutingDecay {
  /** The outing-plus-bonds bundle, exactly as slice 32 reports it. */
  outingBonds: GardenOutingBonds;
  /** One breakdown per caller-named decay entry, in caller order. */
  decay: DecayReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its bonds plus its effective-bond readings:
 * outing-bonds bundle + per-entry decay breakdowns, each exactly
 * as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their bond pictures.
 */
export function gardenOutingDecay(
  inputs: GardenOutingDecayInputs,
): GardenOutingDecay {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-decay: inputs must be an object");
  }
  if (
    inputs.outingBonds === null ||
    typeof inputs.outingBonds !== "object"
  ) {
    throw new Error(
      "garden-outing-decay: outingBonds inputs must be an object",
    );
  }
  if (inputs.decay === null || typeof inputs.decay !== "object") {
    throw new Error("garden-outing-decay: decay inputs must be an object");
  }
  if (!Array.isArray(inputs.decay.entries)) {
    throw new Error("garden-outing-decay: decay entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.decay.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-decay: decay entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-decay: decay entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-decay: duplicate decay entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
  }
  const outingBonds = gardenOutingBonds(inputs.outingBonds);
  const decay = inputs.decay.entries.map((entry) => {
    const breakdown = decayBreakdown(
      entry.accrued,
      entry.facts,
      entry.profile,
    );
    return {
      id: entry.id,
      breakdown: {
        ...breakdown,
        contributions: breakdown.contributions.map((c) => ({ ...c })),
      },
    };
  });
  return { outingBonds, decay };
}
