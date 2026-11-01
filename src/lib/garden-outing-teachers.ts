/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers — one outing plus its individual bond
 * summaries plus its journey teachers, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-unlocks-plus-individuals bundle from
 *   garden-outing-individual (slice 42: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   and one per-creature individual bond summary, each exactly
 *   as its own read reports it);
 * - one teacher reading per caller-named teacher entry, in caller
 *   order, via garden-teachers' teachersForMeetings and
 *   taughtAxes, over each entry's OWN species-to-axes mapping
 *   and meeting list.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the teachers section is NOT computed
 * from the outing-individual section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, or individual values — a caller counts its own mapping
 * and meetings and hands this module those inputs, exactly as
 * garden-teachers requires — and the outing-individual section is
 * NOT overwritten by any teacher reading. A Garden can therefore
 * read one fact in the outing-individual section and a different
 * fact in a teacher reading over a different mapping, and both
 * facts are reported. A teacher reading never changes an outing,
 * a bond, a comfort day, a thanks signal, a level summary, a
 * bridge record, a check-in beat, a snapshot lens, a journey
 * visit, an unlock evaluation, or an individual summary in this
 * module's hands, and an outing never sets a teacher's mapping or
 * meetings — each is a read at the moment of the call, and the
 * inputs each read reports are returned unchanged. Which of them
 * a host shows first, and whether a teacher reading changes
 * anything in live play, is a host decision this module does not
 * make (the gate-currency question stays the already-flagged
 * owner decision in garden-unlocks' own notes). The bundle
 * itself carries no merged residents field, no total-across-
 * teachers field, no band, cap, or scale on any teacher reading
 * beyond the reads' own rules, no currency, balance, or spend,
 * and no named rite or bell-equivalent object (the gathering beat
 * stays inside the outing-individual section, inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-individual bundle and the teachers section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   teachers section's facts are exactly what teachersForMeetings
 *   and taughtAxes report over each entry's own inputs, and the
 *   outing-individual section's facts are exactly what
 *   gardenOutingIndividual reports over its own inputs;
 * - NO teacher reading computed from an outing-individual value:
 *   the mapping and meetings are caller-supplied, never read off
 *   a bond list, a decay breakdown, a comfort day, a thanks
 *   intensity, a level summary, a bridge record, a check-in beat,
 *   a snapshot lens, a journey visit, an unlock evaluation, or
 *   an individual summary;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, or teacher writer: a
 *   teacher reading is a summary this module never stores or
 *   unlocks with in live play (what a reading then opens is a
 *   later host/presentation decision);
 * - NO axis or species vocabulary authored (all ids and axes are
 *   opaque caller strings; a met species with no mapping entry
 *   is not a teacher, exactly as garden-teachers reports it);
 * - NO band, threshold, tier, or unlock reading on a teacher
 *   beyond the composed reads' own rules (inherited);
 * - NO rates, scalars, floors, needs, recipes, classes, or
 *   habitats authored (all inherited from
 *   garden-outing-individual and garden-teachers,
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
 * the teacher readings are copied here (teacher axis lists and
 * taught-axes lists), so mutating a returned teacher reading
 * never touches the caller's mapping or meetings. Loud failures
 * (throw) on a malformed input bundle, a missing
 * outing-individual or teachers section, a bad teachers entries
 * shape, a bad or duplicate teacher entry id, and on any failure
 * the composed reads themselves raise. Silent defaults are never
 * invented: an outing with no arrivals, no meetings, no news, no
 * records, no observations, no bond entries, no decay entries,
 * no comfort entries, no thanks windows, no level entries, no
 * record entries, no checkin entries, no snapshot entries, no
 * journey entries, no unlock entries, no individual entries, and
 * no teacher entries reads its inputs back unchanged, never a
 * fabricated outing with a teacher reading.
 */

import {
  gardenOutingIndividual,
  type GardenOutingIndividual,
  type GardenOutingIndividualInputs,
} from "./garden-outing-individual";
import {
  taughtAxes,
  teachersForMeetings,
  type SpeciesTeachers,
  type TeacherMapping,
  type TeacherMeetingList,
} from "./garden-teachers";

/** One caller-named teacher reading, over its own inputs. */
export interface TeacherEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** That reading's own species-to-axes mapping (see garden-teachers). */
  mapping: TeacherMapping;
  /** That reading's own meeting list (see garden-teachers). */
  meetings: TeacherMeetingList;
}

/** The inputs one outing-plus-individuals-plus-teachers bundle is composed from. */
export interface GardenOutingTeachersInputs {
  /** The outing-individual bundle's inputs, as slice 42 takes them. */
  outingIndividual: GardenOutingIndividualInputs;
  /** The teachers section's inputs: one entry per reading, in caller order. */
  teachers: {
    entries: readonly TeacherEntry[];
  };
}

/** One teacher entry's reading, copied fresh. */
export interface TeacherReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The met teachers, in first-met order, exactly as garden-teachers reports them. */
  teachers: SpeciesTeachers[];
  /** The union of taught axes, in first-appearance order, exactly as garden-teachers reports it. */
  taughtAxes: string[];
}

/** One outing plus its individual bond summaries plus its journey teachers. */
export interface GardenOutingTeachers {
  /** The outing-plus-unlocks-plus-individuals bundle, exactly as slice 42 reports it. */
  outingIndividual: GardenOutingIndividual;
  /** One teacher reading per caller-named teacher entry, in caller order. */
  teachers: TeacherReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its individual bond summaries plus its journey
 * teachers: outing-individual bundle + per-entry teacher readings,
 * each exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their pictures.
 */
export function gardenOutingTeachers(
  inputs: GardenOutingTeachersInputs,
): GardenOutingTeachers {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-teachers: inputs must be an object");
  }
  if (
    inputs.outingIndividual === null ||
    typeof inputs.outingIndividual !== "object"
  ) {
    throw new Error(
      "garden-outing-teachers: outingIndividual inputs must be an object",
    );
  }
  if (inputs.teachers === null || typeof inputs.teachers !== "object") {
    throw new Error(
      "garden-outing-teachers: teachers inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.teachers.entries)) {
    throw new Error(
      "garden-outing-teachers: teachers entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.teachers.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-teachers: teacher entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-teachers: teacher entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-teachers: duplicate teacher entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (
      entry.mapping === null ||
      typeof entry.mapping !== "object" ||
      Array.isArray(entry.mapping)
    ) {
      throw new Error(
        "garden-outing-teachers: teacher entry mapping must be a Map or a plain record",
      );
    }
    if (!Array.isArray(entry.meetings)) {
      throw new Error(
        "garden-outing-teachers: teacher entry meetings must be an array",
      );
    }
  }
  const outingIndividual = gardenOutingIndividual(inputs.outingIndividual);
  const teachers = inputs.teachers.entries.map((entry) => ({
    id: entry.id,
    teachers: teachersForMeetings(entry.mapping, entry.meetings).map(
      (teacher) => ({
        speciesId: teacher.speciesId,
        firstMetAt: teacher.firstMetAt,
        axes: [...teacher.axes],
      }),
    ),
    taughtAxes: [...taughtAxes(entry.mapping, entry.meetings)],
  }));
  return { outingIndividual, teachers };
}
