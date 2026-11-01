/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort — one outing
 * plus its bonds plus its effective-bond readings plus one comfort
 * day per caller-named comfort entry, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-bonds-plus-decay bundle from garden-outing-decay
 *   (slice 33: the outing bundle plus one per-creature bond list
 *   from the per-pair ledger, plus one effective-bond breakdown
 *   per caller-named decay entry, each exactly as its own read
 *   reports it);
 * - one comfort day per caller-named comfort entry, in caller
 *   order, via garden-comfort's comfortAfterDay, over each
 *   entry's OWN starting comfort, recognised habitats, needs,
 *   rates, class mapping, and factors.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the comfort section is NOT computed
 * from the outing-decay section's bond or effective values, and
 * the outing-decay section is NOT overwritten by any comfort
 * value. A creature can therefore read one bond number in the
 * outing-decay section and a comfort number in the comfort
 * section that comes from a different starting comfort over
 * different habitats, and both facts are reported. Comfort never
 * changes a bond in this module's hands, and decay never changes
 * comfort — each is a read at the moment of the call, and the
 * inputs each read reports are returned unchanged. Which of them
 * a host shows first, and whether either changes anything in
 * live play, is a host decision this module does not make. The
 * bundle itself carries no merged residents field, no band, cap,
 * or scale on any bond or comfort value beyond the reads' own
 * rules (comfort clamped 0..100 only, inherited from
 * garden-comfort; a missing bond pair is simply absent,
 * inherited from garden-bonds), and no departure rule.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-decay bundle and the comfort section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the comfort section's facts are exactly what comfortAfterDay
 *   reports over each entry's own inputs, and the outing-decay
 *   section's facts are exactly what gardenOutingDecay reports
 *   over its own inputs;
 * - NO bond writer and NO comfort writer: setBond / removeBond
 *   are the ledger read's own writers, and comfort is a day's
 *   term read, not a stored value written back anywhere. This
 *   module records nothing and changes no ledger, record, store,
 *   or view;
 * - NO band, cap, scale, or effect reading on a bond value
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, or floors authored: every number in a
 *   decay profile, a need rate, and a comfort factor is
 *   caller-supplied (inherited from garden-decay and
 *   garden-comfort — this module assigns no number to any
 *   context, type, shape, need, or habitat);
 * - NO need, recipe, class, or habitat authored: needs, their
 *   satisfiers, their gains/losses, and both factors are all
 *   caller-supplied (inherited from garden-comfort);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing-decay); NO bio-fill section (inherited);
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
 * the comfort results' satisfied/unsatisfied lists are copied
 * here, so mutating a returned comfort result never touches the
 * caller's habitats, needs, or rates. Loud failures (throw) on a
 * malformed input bundle, a missing outing-decay or comfort
 * section, a bad comfort entries shape, a bad or duplicate
 * comfort entry id, and on any failure the composed reads
 * themselves raise. Silent defaults are never invented: an
 * outing with no arrivals, no meetings, no news, no records, no
 * observations, no bond entries, no decay entries, and no
 * comfort entries reads its inputs back unchanged, never a
 * fabricated outing with comfort.
 */

import {
  gardenOutingDecay,
  type GardenOutingDecay,
  type GardenOutingDecayInputs,
} from "./garden-outing-decay";
import {
  comfortAfterDay,
  type ComfortDayResult,
  type GardenNeedDef,
  type GardenNeedRate,
} from "./garden-comfort";
import type { ClassesForRecipe } from "./garden-attraction";
import type { SolvedHabitat } from "./garden-habitats";

/** One caller-named comfort day, over its own inputs. */
export interface ComfortEntry {
  /** Opaque id for this reading (caller string, not a creature id). */
  id: string;
  /** The single day garden-comfort evaluates, over its own inputs. */
  day: {
    comfort: number;
    habitats: readonly (SolvedHabitat | null)[];
    needs: readonly GardenNeedDef[];
    rates: Readonly<Record<string, GardenNeedRate>>;
    classesForRecipe: ClassesForRecipe;
    contextFactor?: number;
    personalityFactor?: number;
  };
}

/** The inputs one outing-plus-decay-plus-comfort bundle is composed from. */
export interface GardenOutingComfortInputs {
  /** The outing-decay bundle's inputs, as slice 33 takes them. */
  outingDecay: GardenOutingDecayInputs;
  /** The comfort section's inputs: one entry per day, in caller order. */
  comfort: {
    entries: readonly ComfortEntry[];
  };
}

/** One comfort entry's day result, copied fresh. */
export interface ComfortReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The day result exactly as garden-comfort reports it. */
  result: ComfortDayResult;
}

/** One outing plus its decay readings plus its comfort days. */
export interface GardenOutingComfort {
  /** The outing-plus-bonds-plus-decay bundle, exactly as slice 33 reports it. */
  outingDecay: GardenOutingDecay;
  /** One day result per caller-named comfort entry, in caller order. */
  comfort: ComfortReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its decay readings plus its comfort days:
 * outing-decay bundle + per-entry comfort days, each exactly
 * as its own read reports it, side by side, with no merged
 * composition and no reconciliation between their pictures.
 */
export function gardenOutingComfort(
  inputs: GardenOutingComfortInputs,
): GardenOutingComfort {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-comfort: inputs must be an object");
  }
  if (
    inputs.outingDecay === null ||
    typeof inputs.outingDecay !== "object"
  ) {
    throw new Error(
      "garden-outing-comfort: outingDecay inputs must be an object",
    );
  }
  if (inputs.comfort === null || typeof inputs.comfort !== "object") {
    throw new Error(
      "garden-outing-comfort: comfort inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.comfort.entries)) {
    throw new Error("garden-outing-comfort: comfort entries must be an array");
  }
  const seen = new Set<string>();
  for (const entry of inputs.comfort.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error("garden-outing-comfort: comfort entry must be an object");
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-comfort: comfort entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-comfort: duplicate comfort entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
  }
  const outingDecay = gardenOutingDecay(inputs.outingDecay);
  const comfort = inputs.comfort.entries.map((entry) => {
    const result = comfortAfterDay(entry.day);
    return {
      id: entry.id,
      result: {
        ...result,
        satisfied: [...result.satisfied],
        unsatisfied: [...result.unsatisfied],
      },
    };
  });
  return { outingDecay, comfort };
}
