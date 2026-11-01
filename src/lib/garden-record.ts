/**
 * B3 §2.6 — one creature's bridge record, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.6: a kept
 * creature carries a wide record, not a stat block. The bridge
 * slices already landed carry the bridge-facing parts of that
 * record as separate pure reads, and this module is their
 * composition for ONE creature — it invents no new section and
 * no new rule. It calls the existing reads and reports exactly
 * what they return:
 * - arrival and residency from the §2.8 doorway log
 *   (garden-arrivals + garden-movement): the creature's arrival
 *   entry, or null when it never arrived, and its residency and
 *   current home per the doorway's own last record — so a
 *   creature resident by another verb still reads resident here
 *   even though its arrival entry is null;
 * - per-keeper bonds from garden-individual (the per-pair ledger
 *   composed with the neglect decay read);
 * - documented development from garden-research: the creature's
 *   observations in stamp order, and its observed kinds in
 *   first-observed order;
 * - Garden-edge discovery from garden-discovery, only when the
 *   caller supplies an edge set: the creature's edge-discovery
 *   entry, or null when it is not at the edge. Without an edge
 *   set the edge cannot be assessed, so the field is null —
 *   never a guessed verdict.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO care-stat, development-direction, born-talent, personality,
 *   memory, or career section: §2.6 names those parts of the wide
 *   record, but no pure read for any of them exists yet, and this
 *   composition does not fake one by echoing caller-supplied
 *   sections as if they were reads. When a read for a section
 *   lands, it composes here in its own slice — the result shape
 *   gains a field then, not now.
 * - NO total across keepers, NO band, cap, or scale: the bonds
 *   section is exactly garden-individual's summary, per-pair
 *   by definition.
 * - NO research level, threshold, or score: the observations
 *   section is exactly garden-research's read, kinds and stamps
 *   only.
 * - NO host, NO store/view/save change, NO encounter/spawn/route
 *   behaviour, NO effect in live play: whether a candidate at
 *   the edge is actually met, and whether a bond or observation
 *   changes anything, are host decisions, not this read's.
 * - NO residency naming (Owner Slot 6 — ids stay opaque);
 *   NO Garden geography authored (homes and edge places are
 *   caller-supplied, Owner Slot 5); NO range decision of its
 *   own (the eligible-creature set, when supplied, is the
 *   caller's #102 resolution, as in the edge read); NO ending
 *   rule (Owner Slot 4 — a departure is a movement, not an
 *   ending); NO species/place vocabulary authored.
 *
 * Purity: inputs are never mutated or reordered; the record and
 * every section inside it are fresh objects and fresh arrays.
 * Loud failures (throw) on a malformed input bundle, a bad
 * creature id, and any failure the composed reads themselves
 * raise (malformed log, duplicate movement id, malformed ledger,
 * facts for a keeper with no bond entry, malformed observation
 * log, malformed caller sets). Silent defaults are never
 * invented: a creature with no arrival, no bonds, no
 * observations, and no edge entry reads nulls and empty lists,
 * never a fabricated section.
 */

import {
  arrivalForCreature,
  type GardenArrival,
} from "./garden-arrivals";
import {
  edgeDiscoveries,
  type GardenEdgeDiscovery,
} from "./garden-discovery";
import {
  individualBondSummary,
  type IndividualBondSummary,
} from "./garden-individual";
import {
  currentHome,
  isGardenResident,
  type MovementLog,
} from "./garden-movement";
import {
  observationsForCreature,
  observedKindsForCreature,
  type ResearchObservation,
  type ResearchObservationLog,
} from "./garden-research";
import type { BondLedger } from "./garden-bonds";
import type {
  DecayProfile,
  NeglectFact,
} from "./garden-decay";

/** The inputs one bridge record is composed from. */
export interface BridgeRecordInputs {
  /** The §2.8 doorway log. */
  movementLog: MovementLog;
  /** Caller-supplied Garden homes (Owner Slot 5). */
  gardenHomes: ReadonlySet<string> | readonly string[];
  /** The per-pair bond ledger. */
  bondLedger: BondLedger;
  /** The neglect decay profile the bond read runs under. */
  decayProfile: DecayProfile;
  /** Neglect facts per keeper, for this creature. */
  factsByKeeper: Record<string, readonly NeglectFact[]>;
  /** The documented-development observation log. */
  observationLog: ResearchObservationLog;
  /**
   * Caller-supplied Garden-edge places (Owner Slot 5). When
   * omitted, edge discovery is not assessed and the field
   * reads null.
   */
  gardenEdge?: ReadonlySet<string> | readonly string[];
  /**
   * Optional caller-resolved range-eligible creature ids (#102),
   * as in the edge read. Only used when gardenEdge is supplied.
   */
  eligibleCreatures?: ReadonlySet<string> | readonly string[];
}

/** One creature's bridge-facing record, composed from existing reads. */
export interface BridgeRecord {
  /** The creature the record is about (opaque id). */
  creatureId: string;
  /** Whether its most recent movement ends at a Garden home. */
  currentlyResident: boolean;
  /** Destination of its most recent movement, or null. */
  currentHome: string | null;
  /** Its arrival entry, or null when it never arrived. */
  arrival: GardenArrival | null;
  /** Its per-keeper bond summary, in ledger order. */
  bonds: IndividualBondSummary;
  /** Its observations, in stamp order. */
  observations: ResearchObservation[];
  /** Its observed kinds, in first-observed order. */
  observedKinds: string[];
  /**
   * Its Garden-edge discovery entry, or null when it is not at
   * the edge — or when no edge set was supplied to assess it.
   */
  edgeDiscovery: GardenEdgeDiscovery | null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One creature's bridge record: arrival + residency + bonds +
 * observations + (when an edge set is supplied) edge discovery,
 * each exactly as its own read reports it.
 */
export function bridgeRecordForCreature(
  creatureId: string,
  inputs: BridgeRecordInputs,
): BridgeRecord {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("garden-record: creatureId must be a non-empty string");
  }
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-record: inputs must be an object");
  }
  const arrival = arrivalForCreature(
    inputs.movementLog,
    creatureId,
    inputs.gardenHomes,
  );
  const bonds = individualBondSummary(
    inputs.bondLedger,
    creatureId,
    inputs.decayProfile,
    inputs.factsByKeeper,
  );
  const observations = observationsForCreature(
    inputs.observationLog,
    creatureId,
  ).map((entry) => ({ ...entry }));
  const observedKinds = observedKindsForCreature(
    inputs.observationLog,
    creatureId,
  );
  let edgeDiscovery: GardenEdgeDiscovery | null = null;
  if (inputs.gardenEdge !== undefined) {
    const found = edgeDiscoveries(inputs.movementLog, {
      gardenEdge: inputs.gardenEdge,
      eligibleCreatures: inputs.eligibleCreatures,
    }).find((entry) => entry.creatureId === creatureId);
    edgeDiscovery = found === undefined ? null : { ...found };
  }
  return {
    creatureId,
    currentlyResident: isGardenResident(
      inputs.movementLog,
      creatureId,
      inputs.gardenHomes,
    ),
    currentHome: currentHome(inputs.movementLog, creatureId),
    arrival,
    bonds,
    observations,
    observedKinds,
    edgeDiscovery,
  };
}
