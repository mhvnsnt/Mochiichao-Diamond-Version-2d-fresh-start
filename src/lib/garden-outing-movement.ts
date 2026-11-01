/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement — one outing plus its
 * individual bond summaries plus its journey teachers plus its
 * doorway movement readings, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-individuals-plus-teachers bundle from
 *   garden-outing-teachers (slice 43: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, and one teacher
 *   reading per caller-named teacher entry, each exactly as its
 *   own read reports it);
 * - one movement reading per caller-named movement entry, in
 *   caller order, via garden-movement's movementsForCreature,
 *   currentHome, and isGardenResident, over each entry's OWN
 *   doorway log, creature id, and Garden-home set.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the movement section is NOT computed
 * from the outing-teachers section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, or teacher values — a caller counts its
 * own doorway log and hands this module those inputs, exactly as
 * garden-movement requires — and the outing-teachers section is
 * NOT overwritten by any movement reading. A Garden can therefore
 * read one fact in the outing-teachers section and a different
 * fact in a movement reading over a different log, and both
 * facts are reported. A movement reading never changes an outing,
 * a bond, a comfort day, a thanks signal, a level summary, a
 * bridge record, a check-in beat, a snapshot lens, a journey
 * visit, an unlock evaluation, an individual summary, or a
 * teacher reading in this module's hands, and an outing never
 * sets a movement entry's log, creature id, or Garden homes —
 * each is a read at the moment of the call, and the inputs each
 * read reports are returned unchanged. Which of them a host shows
 * first, and whether a movement reading changes anything in live
 * play, is a host decision this module does not make (the
 * gate-currency question stays the already-flagged owner
 * decision in garden-unlocks' own notes). The bundle itself
 * carries no merged residents field, no total-across-movements
 * field, no band, cap, or scale on any movement reading beyond
 * the reads' own rules, no currency, balance, or spend, and no
 * named rite or bell-equivalent object (the gathering beat stays
 * inside the outing-teachers section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-teachers bundle and the movement section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   movement section's facts are exactly what
 *   movementsForCreature, currentHome, and isGardenResident
 *   report over each entry's own inputs, and the
 *   outing-teachers section's facts are exactly what
 *   gardenOutingTeachers reports over its own inputs;
 * - NO movement reading computed from an outing-teachers value:
 *   the log, creature id, and Garden-home set are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   a journey visit, an unlock evaluation, an individual
 *   summary, or a teacher reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, or movement
 *   writer: a movement reading is a summary this module never
 *   stores or unlocks with in live play (what a reading then
 *   opens is a later host/presentation decision), and no record
 *   is appended to any log here (appendMovement is the doorway
 *   writer's job, not this read's);
 * - NO movement vocabulary authored (all ids, verbs, and homes
 *   are opaque caller strings, and the verb set is inherited
 *   from garden-movement, never extended here);
 * - NO band, threshold, tier, or unlock reading on a movement
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from
 *   garden-outing-teachers and garden-movement,
 *   caller-supplied);
 * - NO research levels, scores, or thresholds (inherited);
 *   NO bio-fill section (inherited);
 * - NO honour or money field (inherited); NO meeting writer
 *   and NO arrival writer (inherited); NO cursor storage and
 *   NO check-in stamp storage (inherited): the caller keeps
 *   the stamp and both cursors (its save record's job, later).
 *   This read takes them as inputs and stores nothing;
 * - NO new record section: a record gains a field only when its
 *   own read gains one (see garden-record's deliberately-NOT
 *   list);
 * - NO Garden geography authored: homes, the edge, and the
 *   heart-place zone are caller-supplied sets inside the
 *   composed inputs (Owner Slot 5), never authored here;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values are
 *   opaque caller strings; the #102 range rule is the host's
 *   filter, not this bundle's);
 * - NO host, NO store/view/save change, NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered. Both composed
 * reads return fresh objects and fresh arrays on every call, and
 * the movement readings are copied here (each movement record
 * is a fresh object in a fresh array), so mutating a returned
 * movement reading never touches the caller's log. Loud failures
 * (throw) on a malformed input bundle, a missing
 * outing-teachers or movement section, a bad movement entries
 * shape, a bad or duplicate movement entry id, a bad creature
 * id, a bad log, a bad Garden-home set, a malformed doorway
 * record, and on any failure the composed reads themselves
 * raise. Silent defaults are never invented: an outing with no
 * arrivals, no meetings, no news, no records, no observations,
 * no bond entries, no decay entries, no comfort entries, no
 * thanks windows, no level entries, no record entries, no
 * checkin entries, no snapshot entries, no journey entries, no
 * unlock entries, no individual entries, no teacher entries,
 * and no movement entries reads its inputs back unchanged,
 * never a fabricated outing with a movement reading.
 */

import {
  gardenOutingTeachers,
  type GardenOutingTeachers,
  type GardenOutingTeachersInputs,
} from "./garden-outing-teachers";
import {
  currentHome,
  isGardenResident,
  movementsForCreature,
  validateMovement,
  type MovementLog,
  type MovementRecord,
} from "./garden-movement";

/** One caller-named movement reading, over its own inputs. */
export interface MovementEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** The creature whose doorway history is read (opaque). */
  creatureId: string;
  /** That reading's own doorway log (see garden-movement). */
  log: MovementLog;
  /**
   * That reading's own Garden homes, as a Set or an array
   * (see garden-movement's isGardenResident; Owner Slot 5).
   */
  gardenHomes: ReadonlySet<string> | readonly string[];
}

/** The inputs one outing-plus-teachers-plus-movement bundle is composed from. */
export interface GardenOutingMovementInputs {
  /** The outing-teachers bundle's inputs, as slice 43 takes them. */
  outingTeachers: GardenOutingTeachersInputs;
  /** The movement section's inputs: one entry per reading, in caller order. */
  movement: {
    entries: readonly MovementEntry[];
  };
}

/** One movement entry's reading, copied fresh. */
export interface MovementReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The entry's creature id, as supplied. */
  creatureId: string;
  /**
   * The creature's movements, in `at` order, exactly as
   * garden-movement reports them, each record copied fresh.
   */
  movements: MovementRecord[];
  /** Where the creature is now, exactly as garden-movement reports it. */
  currentHome: string | null;
  /** Whether the creature counts as a Garden resident, exactly as garden-movement reports it. */
  resident: boolean;
}

/** One outing plus its teachers plus its doorway movement readings. */
export interface GardenOutingMovement {
  /** The outing-plus-individuals-plus-teachers bundle, exactly as slice 43 reports it. */
  outingTeachers: GardenOutingTeachers;
  /** One movement reading per caller-named movement entry, in caller order. */
  movement: MovementReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isGardenHomes(
  value: unknown,
): value is ReadonlySet<string> | readonly string[] {
  if (value instanceof Set) {
    for (const home of value) {
      if (!isNonEmptyString(home)) return false;
    }
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((home) => isNonEmptyString(home));
  }
  return false;
}

/**
 * One outing plus its teachers plus its doorway movement
 * readings: outing-teachers bundle + per-entry movement
 * readings, each exactly as its own read reports it, side by
 * side, with no merged composition and no reconciliation
 * between their pictures.
 */
export function gardenOutingMovement(
  inputs: GardenOutingMovementInputs,
): GardenOutingMovement {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-movement: inputs must be an object");
  }
  if (
    inputs.outingTeachers === null ||
    typeof inputs.outingTeachers !== "object"
  ) {
    throw new Error(
      "garden-outing-movement: outingTeachers inputs must be an object",
    );
  }
  if (inputs.movement === null || typeof inputs.movement !== "object") {
    throw new Error(
      "garden-outing-movement: movement inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.movement.entries)) {
    throw new Error(
      "garden-outing-movement: movement entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.movement.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-movement: movement entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-movement: movement entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-movement: duplicate movement entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!isNonEmptyString(entry.creatureId)) {
      throw new Error(
        "garden-outing-movement: movement entry creatureId must be a non-empty string",
      );
    }
    if (!Array.isArray(entry.log)) {
      throw new Error(
        "garden-outing-movement: movement entry log must be an array",
      );
    }
    for (const record of entry.log) {
      validateMovement(record);
    }
    if (!isGardenHomes(entry.gardenHomes)) {
      throw new Error(
        "garden-outing-movement: movement entry gardenHomes must be a Set or an array of non-empty strings",
      );
    }
  }
  const outingTeachers = gardenOutingTeachers(inputs.outingTeachers);
  const movement = inputs.movement.entries.map((entry) => ({
    id: entry.id,
    creatureId: entry.creatureId,
    movements: movementsForCreature(entry.log, entry.creatureId).map(
      (record) => ({ ...record }),
    ),
    currentHome: currentHome(entry.log, entry.creatureId),
    resident: isGardenResident(entry.log, entry.creatureId, entry.gardenHomes),
  }));
  return { outingTeachers, movement };
}
