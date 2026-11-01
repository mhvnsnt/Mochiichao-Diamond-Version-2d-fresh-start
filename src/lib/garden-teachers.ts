/**
 * B3 §2.2 — journey teachers, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.2: creatures
 * met in the wild teach care axes by kind — the native form is the
 * species behaviour/care grammar. A journey home carries knowledge of
 * who teaches what, earned by meeting them where they live. One
 * meeting pays in both directions: it is also research (the §2.3
 * research read, garden-research.ts, is a separate module).
 *
 * This module is that teacher read's shape and pure reads only: given
 * a caller-supplied mapping from species to the care axes that
 * species teaches, and a caller-supplied list of meetings, it reports
 * which met species are teachers, what each teaches, and the union
 * of axes the meetings taught. It is NOT a host: no meeting is
 * recorded here, no store, view, or save record is changed here,
 * and no encounter, spawn, or route behaviour is decided here.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - A species teaches exactly the axes its mapping entry lists, in
 *   mapping order. Axes are caller vocabulary, never authored here:
 *   no axis name, species name, or behaviour name is enumerated.
 * - Only met species appear as teachers. A met species with no
 *   mapping entry is not a teacher and does not appear — a partial
 *   mapping is legitimate, not malformed. A mapped species with an
 *   empty axis list appears with an empty list: it is recorded as
 *   teaching nothing, which is a different fact from unmapped.
 * - Teacher order is first-met order: meetings sort by stamp, with
 *   log order breaking ties, and a species takes the position of
 *   its earliest meeting. A species met twice still yields one
 *   entry, with the earliest stamp as firstMetAt.
 * - The union read lists each taught axis once, in first-appearance
 *   order: teacher order, then mapping order within a teacher.
 * - The single-species read returns a copy of the axis list for a
 *   mapped species, or null for an unmapped species — so a caller
 *   can tell "teaches nothing" apart from "no teacher record".
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO axis vocabulary authored (axes are caller-supplied opaque
 *   strings; this module never names a care axis).
 * - NO species vocabulary authored (species ids are caller-supplied
 *   opaque strings).
 * - NO meeting writer: which meetings happened, and what a meeting
 *   means for encounters or research, is host work. Meetings here
 *   are an input list, never a log this module appends to.
 * - NO manufactured-booster data (Owner Slot 1: the second,
 *   industrial flavour beside living teachers is data for the
 *   Garden systems, not content invented here).
 * - NO host, NO store/view/save change, NO numeric effect in live
 *   play, NO authored place/zone data.
 *
 * Purity: inputs are never mutated; outputs are fresh objects and
 * fresh arrays. Loud failures (throw) on malformed mappings,
 * malformed meetings, duplicate axes within one species, and bad
 * ids or stamps; silent defaults are never invented.
 */

/** One meeting with a wild species: which kind, and when. */
export interface TeacherMeeting {
  /** The met species' id (opaque, caller-supplied). */
  speciesId: string;
  /** Caller-supplied ordering stamp; must be finite. */
  at: number;
}

export type TeacherMeetingList = readonly TeacherMeeting[];

/**
 * Species id -> care axes taught, caller-supplied. A Map or a plain
 * record; either way the caller names every species and every axis.
 */
export type TeacherMapping =
  | ReadonlyMap<string, readonly string[]>
  | Readonly<Record<string, readonly string[]>>;

/** One met species' teaching, in first-met order. */
export interface SpeciesTeachers {
  /** The met species' id (opaque). */
  speciesId: string;
  /** The stamp of its earliest meeting. */
  firstMetAt: number;
  /** The axes it teaches, in mapping order (fresh copy). */
  axes: string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function validateMeeting(meeting: unknown): asserts meeting is TeacherMeeting {
  if (
    typeof meeting !== "object" ||
    meeting === null ||
    Array.isArray(meeting)
  ) {
    throw new Error("teacher meeting must be an object");
  }
  const m = meeting as Record<string, unknown>;
  if (!isNonEmptyString(m.speciesId)) {
    throw new Error("teacher meeting speciesId must be a non-empty string");
  }
  if (typeof m.at !== "number" || !Number.isFinite(m.at)) {
    throw new Error("teacher meeting at must be a finite number");
  }
}

function validateMeetings(
  meetings: unknown,
): asserts meetings is TeacherMeetingList {
  if (!Array.isArray(meetings)) {
    throw new Error("teacher meetings must be an array");
  }
  for (const meeting of meetings) {
    validateMeeting(meeting);
  }
}

/**
 * Normalise a caller mapping into a fresh Map of fresh axis arrays.
 * Throws on a bad mapping shape, an empty species id, a non-array
 * axis list, an empty axis string, or a duplicate axis within one
 * species. A mapped species with an empty list is valid: it teaches
 * nothing, explicitly.
 */
function toTeacherMap(mapping: TeacherMapping): Map<string, string[]> {
  if (mapping instanceof Map) {
    const out = new Map<string, string[]>();
    for (const [speciesId, axes] of mapping.entries()) {
      if (!isNonEmptyString(speciesId)) {
        throw new Error("teacher mapping species id must be a non-empty string");
      }
      if (!Array.isArray(axes)) {
        throw new Error(
          `teacher mapping axes for species ${speciesId} must be an array`,
        );
      }
      const seen = new Set<string>();
      for (const axis of axes) {
        if (!isNonEmptyString(axis)) {
          throw new Error(
            `teacher mapping axis for species ${speciesId} must be a non-empty string`,
          );
        }
        if (seen.has(axis)) {
          throw new Error(
            `teacher mapping for species ${speciesId} repeats axis ${axis}`,
          );
        }
        seen.add(axis);
      }
      out.set(speciesId, [...axes]);
    }
    return out;
  }
  if (typeof mapping !== "object" || mapping === null || Array.isArray(mapping)) {
    throw new Error("teacher mapping must be a Map or a plain record");
  }
  const out = new Map<string, string[]>();
  for (const [speciesId, axes] of Object.entries(mapping)) {
    if (!isNonEmptyString(speciesId)) {
      throw new Error("teacher mapping species id must be a non-empty string");
    }
    if (!Array.isArray(axes)) {
      throw new Error(
        `teacher mapping axes for species ${speciesId} must be an array`,
      );
    }
    const seen = new Set<string>();
    for (const axis of axes) {
      if (!isNonEmptyString(axis)) {
        throw new Error(
          `teacher mapping axis for species ${speciesId} must be a non-empty string`,
        );
      }
      if (seen.has(axis)) {
        throw new Error(
          `teacher mapping for species ${speciesId} repeats axis ${axis}`,
        );
      }
      seen.add(axis);
    }
    out.set(speciesId, [...axes]);
  }
  return out;
}

/** Loud validation for a whole mapping, without returning a read. */
export function validateTeacherMapping(mapping: unknown): void {
  toTeacherMap(mapping as TeacherMapping);
}

/**
 * Which met species are teachers, in first-met order (stamp order,
 * log order breaking ties). Each entry carries its earliest meeting
 * stamp and a fresh copy of its mapping-order axis list. Met species
 * with no mapping entry do not appear; mapped species with an empty
 * list appear with an empty list.
 */
export function teachersForMeetings(
  mapping: TeacherMapping,
  meetings: TeacherMeetingList,
): SpeciesTeachers[] {
  const teacherMap = toTeacherMap(mapping);
  validateMeetings(meetings);
  const order = meetings
    .map((meeting, index) => ({ meeting, index }))
    .sort((a, b) => {
      if (a.meeting.at !== b.meeting.at) return a.meeting.at - b.meeting.at;
      return a.index - b.index;
    });
  const seen = new Set<string>();
  const result: SpeciesTeachers[] = [];
  for (const { meeting } of order) {
    if (seen.has(meeting.speciesId)) continue;
    seen.add(meeting.speciesId);
    const axes = teacherMap.get(meeting.speciesId);
    if (axes === undefined) continue;
    result.push({
      speciesId: meeting.speciesId,
      firstMetAt: meeting.at,
      axes: [...axes],
    });
  }
  return result;
}

/**
 * The union of axes the meetings taught: each axis once, in
 * first-appearance order (teacher order, then mapping order within
 * a teacher). A fresh array; an empty meeting list teaches nothing.
 */
export function taughtAxes(
  mapping: TeacherMapping,
  meetings: TeacherMeetingList,
): string[] {
  const teachers = teachersForMeetings(mapping, meetings);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const teacher of teachers) {
    for (const axis of teacher.axes) {
      if (!seen.has(axis)) {
        seen.add(axis);
        result.push(axis);
      }
    }
  }
  return result;
}

/**
 * What one species teaches: a fresh copy of its axis list, or null
 * when the species has no mapping entry. Empty list means mapped
 * and teaching nothing; null means no teacher record at all.
 */
export function axesTaughtBy(
  mapping: TeacherMapping,
  speciesId: string,
): string[] | null {
  const teacherMap = toTeacherMap(mapping);
  if (!isNonEmptyString(speciesId)) {
    throw new Error("speciesId must be a non-empty string");
  }
  const axes = teacherMap.get(speciesId);
  return axes === undefined ? null : [...axes];
}
