/**
 * B3 §2.2 — what one journey brings home, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.2: every
 * outing reliably produces Garden inputs, so the Garden visit is
 * the natural end of a session's rhythm. The two inbound inputs
 * that already exist as pure reads are composed here, side by
 * side, with no new rule added:
 * - arrivals from garden-arrivals: the creatures the doorway log
 *   records as garden-arrivals, in first-arrival order, each with
 *   its residency per the §2.8 doorway's own last record;
 * - teachers from garden-teachers: the met species that teach
 *   care axes, in first-met order, plus the union of axes those
 *   meetings taught, in first-appearance order.
 *
 * The two reads are independent: an arrival never makes a species
 * a teacher, and a meeting never makes a creature an arrival. This
 * module reports exactly what each read returns, in one bundle,
 * so a caller that needs the inbound half of the bridge does not
 * have to re-derive either half.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO manufactured-booster data (Owner Slot 1: the second,
 *   industrial flavour beside living teachers is data for the
 *   Garden systems, not content invented here).
 * - NO honour or money inflow computed here: §2.2 names honours
 *   and money as flowing into the Garden, but both arrive as
 *   caller-held counts, not as reads over these inputs, so this
 *   bundle carries no honour or money field. A host that wants
 *   the inflow alongside this bundle passes its own counts next
 *   to it; nothing here invents or converts them.
 * - NO meeting writer and NO arrival writer: meetings and doorway
 *   records are inputs, never logs this module appends to.
 * - NO research composition: a meeting paying research is the
 *   §2.3 research read's job (garden-research.ts), not a field
 *   duplicated onto this bundle.
 * - NO host, NO store/view/save change, NO encounter/spawn/route
 *   behaviour, NO effect in live play: whether an arrival is
 *   housed, and whether a taught axis changes anything, are host
 *   decisions, not this read's.
 * - NO Garden geography authored (homes are caller-supplied,
 *   Owner Slot 5); NO residency naming (Owner Slot 6 — ids stay
 *   opaque); NO ending rule (Owner Slot 4 — a departure is a
 *   movement, not an ending); NO species/place/axis vocabulary
 *   authored (every id and axis is caller-supplied).
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every entry and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure the composed reads themselves raise (malformed
 * log, duplicate movement id, malformed mapping, malformed
 * meeting, duplicate axis within one species). Silent defaults
 * are never invented: an outing with no arrivals and no meetings
 * reads empty lists, never a fabricated input.
 */

import {
  arrivals,
  type GardenArrival,
} from "./garden-arrivals";
import {
  taughtAxes,
  teachersForMeetings,
  type SpeciesTeachers,
  type TeacherMapping,
  type TeacherMeetingList,
} from "./garden-teachers";
import type { MovementLog } from "./garden-movement";

/** The inputs one journey's inbound bundle is composed from. */
export interface JourneyInboundInputs {
  /** The §2.8 doorway log. */
  movementLog: MovementLog;
  /** Caller-supplied Garden homes (Owner Slot 5). */
  gardenHomes: ReadonlySet<string> | readonly string[];
  /** Caller-supplied species-to-care-axes mapping. */
  teacherMapping: TeacherMapping;
  /** Caller-supplied list of meetings on the journey. */
  meetings: TeacherMeetingList;
}

/** What one journey brings home, as the two landed reads report it. */
export interface JourneyInbound {
  /** Arrived creatures, in first-arrival order. */
  arrivals: GardenArrival[];
  /** Met species that teach, in first-met order. */
  teachers: SpeciesTeachers[];
  /** Union of taught axes, in first-appearance order. */
  taughtAxes: string[];
}

/**
 * One journey's inbound bundle: arrivals + teachers + taught
 * axes, each exactly as its own read reports it.
 */
export function inboundFromJourney(
  inputs: JourneyInboundInputs,
): JourneyInbound {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-inbound: inputs must be an object");
  }
  const arrived = arrivals(inputs.movementLog, inputs.gardenHomes);
  const teachers = teachersForMeetings(
    inputs.teacherMapping,
    inputs.meetings,
  );
  const axes = taughtAxes(inputs.teacherMapping, inputs.meetings);
  return {
    arrivals: arrived.map((entry) => ({ ...entry })),
    teachers: teachers.map((entry) => ({
      ...entry,
      axes: [...entry.axes],
    })),
    taughtAxes: [...axes],
  };
}
