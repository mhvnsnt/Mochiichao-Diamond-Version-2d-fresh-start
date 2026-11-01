/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds — one outing plus its bonds, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing bundle from garden-outing (slice 31: the §2.2 +
 *   §2.5 + §2.6 journey bundle plus the §2.3 species research
 *   summaries, each exactly as its own read reports it);
 * - the per-pair bond ledger from garden-bonds (§2.6 / §2.3):
 *   one entry list per caller-named creature, in the caller's
 *   order, via bondsForCreature, in ledger order within a creature.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the bonds section is NOT the bond ledger
 * a bridge record reads (garden-record takes its own bondLedger
 * per record input), and the outing section is NOT fed any bond
 * value from this module's ledger. A creature can therefore read
 * one bond picture in its own bridge record (over that record's
 * ledger) and a different one in the bonds section (over this
 * module's ledger), and both facts are reported. Which of them a
 * host shows first, and whether either changes anything in live
 * play, is a host decision this module does not make. The bundle
 * itself carries no merged residents field, no band, cap, or scale
 * on a bond value, and no effective-bond (decay) reading — a value
 * here is exactly the ledger's number, stored unchanged.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the outing
 *   bundle and the bonds section (above);
 * - NO reconciliation of the two sections' ledgers (above): the
 *   bonds section's facts are exactly what bondsForCreature
 *   reports over this module's ledger, and the outing section's
 *   facts are exactly what gardenOuting reports over its own
 *   inputs — including any bondLedger a bridge record input
 *   carries, which this module never sees or touches;
 * - NO bond writer: setBond / removeBond are the ledger read's own
 *   writers; a host that wants a changed ledger calls them itself.
 *   This module records nothing and changes no ledger;
 * - NO band, cap, scale, or effect reading on a bond value
 *   (inherited from garden-bonds: a value is the caller's finite
 *   number, stored unchanged; a missing pair is simply absent
 *   from the list, never a 0 — "no bond recorded" and "bond zero"
 *   stay different facts, and a creature with no entries reads
 *   an empty list, never a default bond);
 * - NO effective-bond / decay reading (garden-decay's read is a
 *   separate call a host makes itself; decay never enters here);
 * - NO research levels, scores, or thresholds (inherited from
 *   garden-outing); NO bio-fill section (inherited from
 *   garden-outing: bioFillForSpecies is the research read's own
 *   verdict for a host to call);
 * - NO honour or money field (inherited from garden-outing);
 * - NO meeting writer and NO arrival writer (inherited from
 *   garden-outing), NO cursor storage and NO check-in stamp
 *   storage (inherited from garden-outing): the caller keeps the
 *   stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section (inherited from garden-outing);
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
 * the bond entries themselves are copied here, so mutating a
 * returned entry never touches the caller's ledger. Loud failures
 * (throw) on a malformed input bundle, a missing outing or bonds
 * section, a bad creatureIds shape, a bad creature id, a
 * duplicate creature id, and on any failure the composed reads
 * themselves raise (malformed logs, duplicate movement ids,
 * malformed mappings or meetings, malformed record entries,
 * unknown cursors, a non-finite check-in stamp, malformed
 * observations, malformed species mappings, malformed ledger
 * entries, duplicate bond pairs, non-finite bond values).
 * Silent defaults are never invented: an outing with no arrivals,
 * no meetings, no news, no records, no observations, and no bond
 * entries reads its inputs back unchanged, never a fabricated
 * outing with bonds.
 */

import {
  gardenOuting,
  type GardenOuting,
  type GardenOutingInputs,
} from "./garden-outing";
import {
  bondsForCreature,
  type BondLedger,
  type KeeperBond,
} from "./garden-bonds";

/** The inputs one outing's bonds section is composed from. */
export interface OutingBondsInputs {
  /** The per-pair bond ledger, as garden-bonds takes it. */
  ledger: BondLedger;
  /** Creatures to report bonds for, in the order the caller wants them reported. */
  creatureIds: readonly string[];
}

/** The inputs one outing-plus-bonds bundle is composed from. */
export interface GardenOutingBondsInputs {
  /** The outing bundle's inputs, as slice 31 takes them. */
  outing: GardenOutingInputs;
  /** The bonds section's inputs, as garden-bonds takes them. */
  bonds: OutingBondsInputs;
}

/** One creature's bond entries, in ledger order, copied fresh. */
export interface CreatureBonds {
  /** The creature these entries are about (opaque id). */
  creatureId: string;
  /** That creature's bond entries, in ledger order (empty when none recorded). */
  bonds: KeeperBond[];
}

/** One outing plus its bonds: outing bundle plus per-creature bond lists. */
export interface GardenOutingBonds {
  /** The outing bundle, exactly as slice 31 reports it. */
  outing: GardenOuting;
  /** One bond list per caller-named creature, in caller order. */
  bonds: CreatureBonds[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its bonds: outing + per-creature bond lists,
 * each exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their ledgers.
 */
export function gardenOutingBonds(
  inputs: GardenOutingBondsInputs,
): GardenOutingBonds {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-bonds: inputs must be an object");
  }
  if (inputs.outing === null || typeof inputs.outing !== "object") {
    throw new Error("garden-outing-bonds: outing inputs must be an object");
  }
  if (inputs.bonds === null || typeof inputs.bonds !== "object") {
    throw new Error("garden-outing-bonds: bonds inputs must be an object");
  }
  const bonds = inputs.bonds;
  if (!Array.isArray(bonds.creatureIds)) {
    throw new Error("garden-outing-bonds: creatureIds must be an array");
  }
  const seen = new Set<string>();
  for (const creatureId of bonds.creatureIds) {
    if (!isNonEmptyString(creatureId)) {
      throw new Error(
        "garden-outing-bonds: creatureId must be a non-empty string",
      );
    }
    if (seen.has(creatureId)) {
      throw new Error(
        `garden-outing-bonds: duplicate creature id: ${creatureId}`,
      );
    }
    seen.add(creatureId);
  }
  const outing = gardenOuting(inputs.outing);
  const lists = bonds.creatureIds.map((creatureId) => ({
    creatureId,
    bonds: bondsForCreature(bonds.ledger, creatureId).map((entry) => ({
      ...entry,
    })),
  }));
  return { outing, bonds: lists };
}
