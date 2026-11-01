/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats — one
 * outing plus its Garden news plus what its journey brings home
 * plus what the Garden does on its own plus what its zones
 * recognise as habitats, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-inbound-plus-autonomous bundle from
 *   garden-outing-autonomous (slice 50: the outing bundle plus one
 *   per-creature bond list, one effective-bond breakdown, one
 *   comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, one arrivals
 *   reading per caller-named arrival entry, one research
 *   reading per caller-named research entry, one discovery
 *   reading per caller-named discovery entry, one news reading
 *   per caller-named news entry, one inbound reading per
 *   caller-named inbound entry, and one autonomous reading per
 *   caller-named autonomous entry, each exactly as its own read
 *   reports it);
 * - one habitat reading per caller-named habitat entry, in
 *   caller order, via garden-habitats's solveHabitat, over each
 *   entry's OWN placement, caller-supplied recipes, and optional
 *   caller-supplied solver options.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the habitat section is NOT computed
 * from the outing-autonomous section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, teacher, movement, arrival, research,
 * discovery, news, inbound, migration, story, or arc values — a
 * caller counts its own cells and hands this module those inputs,
 * exactly as garden-habitats requires — and the
 * outing-autonomous section is NOT overwritten by any habitat
 * reading. A Garden can therefore read one fact in the
 * outing-autonomous section and a different fact in a habitat
 * reading over a different placement, and both facts are
 * reported. A habitat reading never changes an outing, a bond, a
 * comfort day, a thanks signal, a level summary, a bridge record,
 * a check-in beat, a snapshot lens, a journey visit, an unlock
 * evaluation, an individual summary, a teacher reading, a
 * movement reading, an arrival reading, a research reading, a
 * discovery candidate, a news item, an inbound reading, a
 * migration, a story, or an arc in this module's hands, and an
 * outing never sets a habitat entry's placement, recipes, or
 * solver options — each is a read at the moment of the call, and
 * the inputs each read reports are returned unchanged. Which of
 * them a host shows first, and whether a recognised habitat is
 * registered, is a host decision this module does not make
 * (garden-habitats's own notes: no placement records in the
 * Garden save from the solver alone, and no recipe data authored
 * for any habitat).
 * The bundle itself carries no merged residents field, no
 * total-across-habitats field, no habitat level, score,
 * threshold, or ranking on any reading beyond the reads' own
 * rules, no honour or money inflow field, no currency, balance,
 * or spend, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-autonomous section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-autonomous bundle and the habitat section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   habitat section's facts are exactly what solveHabitat
 *   reports over each entry's own inputs, and the
 *   outing-autonomous section's facts are exactly what
 *   gardenOutingAutonomous reports over its own inputs;
 * - NO habitat reading computed from an outing-autonomous value:
 *   the placement, recipes, and solver options are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   a journey visit, an unlock evaluation, an individual
 *   summary, a teacher reading, a movement reading, an arrival
 *   reading, a research reading, a discovery candidate, a news
 *   item, an inbound reading, a migration, a story, or an arc;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, or habitat writer: a habitat reading is a
 *   summary this module never stores or registers in live play,
 *   and no record is appended to any log here;
 * - NO recipe data authored for any habitat (recipes are
 *   caller-supplied; the Garden's native habitat names and
 *   contents are owner slot S1 in the wiring plan, never filled
 *   here);
 * - NO composition pass (Pokopia context modifiers and
 *   neighbour-habitat combos resolve after base matching and
 *   are a later slice, inherited from garden-habitats);
 * - NO manufactured-booster data (Owner Slot 1, inherited from
 *   garden-inbound, never filled here);
 * - NO honour or money inflow computed here (inherited from
 *   garden-inbound: both arrive as caller-held counts, not as
 *   reads over these inputs);
 * - NO host, NO store/view/save change, NO encounter/spawn/
 *   route behaviour, NO effect in live play: whether a
 *   recognised habitat is registered, and whether a discovery
 *   candidate is actually met on a route, are host decisions,
 *   not this read's;
 * - NO season/festival/weather, story, arc, species, place, or
 *   range vocabulary authored (all ids, keys, and arc values
 *   are opaque caller strings; the #102 range rule is the
 *   host's filter);
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, and both autonomous cursors;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every entry and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure the composed reads themselves raise. Silent
 * defaults are never invented: an outing-autonomous bundle with
 * no habitat entries, and a habitat entry with no satisfied
 * recipe, a zone-mismatched recipe set, or a reached
 * registration cap, read their input composition back
 * unchanged (null for the unsolved entry), never a fabricated
 * habitat.
 */

import {
  gardenOutingAutonomous,
  type GardenOutingAutonomous,
  type GardenOutingAutonomousInputs,
} from "./garden-outing-autonomous";
import {
  solveHabitat,
  type HabitatPlacement,
  type HabitatRecipe,
  type SolveHabitatOptions,
  type SolvedHabitat,
} from "./garden-habitats";

/** One caller-named habitat reading, over its own inputs. */
export interface HabitatEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** The zone placement the solver reads. */
  placement: HabitatPlacement;
  /** The caller-supplied recipes the solver matches against. */
  recipes: readonly HabitatRecipe[];
  /** Optional caller-supplied solver options (cap / alreadyRegistered). */
  options?: SolveHabitatOptions;
}

/** The inputs one outing-plus-autonomous-plus-habitats bundle is composed from. */
export interface GardenOutingHabitatsInputs {
  /** The outing-autonomous bundle's inputs, as slice 50 takes them. */
  outingAutonomous: GardenOutingAutonomousInputs;
  /** The habitat section's inputs: one entry per reading, in caller order. */
  habitats: {
    entries: readonly HabitatEntry[];
  };
}

/** One habitat entry's reading, copied fresh. */
export interface HabitatReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The recognised habitat, exactly as garden-habitats reports it, or null. */
  solved: SolvedHabitat | null;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats. */
export interface GardenOutingHabitats {
  /** The outing-plus-inbound-plus-autonomous bundle, exactly as slice 50 reports it. */
  outingAutonomous: GardenOutingAutonomous;
  /** One habitat reading per caller-named habitat entry, in caller order. */
  habitats: HabitatReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats: outing-autonomous bundle + per-entry
 * habitat readings, each exactly as its own read reports it,
 * side by side, with no merged composition and no reconciliation
 * between their pictures.
 */
export function gardenOutingHabitats(
  inputs: GardenOutingHabitatsInputs,
): GardenOutingHabitats {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-habitats: inputs must be an object");
  }
  if (
    inputs.outingAutonomous === null ||
    typeof inputs.outingAutonomous !== "object"
  ) {
    throw new Error(
      "garden-outing-habitats: outingAutonomous inputs must be an object",
    );
  }
  if (
    inputs.habitats === null ||
    typeof inputs.habitats !== "object"
  ) {
    throw new Error(
      "garden-outing-habitats: habitats inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.habitats.entries)) {
    throw new Error(
      "garden-outing-habitats: habitats entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.habitats.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-habitats: habitat entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-habitats: habitat entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-habitats: duplicate habitat entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
  }
  const outingAutonomous = gardenOutingAutonomous(inputs.outingAutonomous);
  const habitats: HabitatReading[] = inputs.habitats.entries.map((entry) => {
    const solved = solveHabitat(
      entry.placement,
      entry.recipes,
      entry.options ?? {},
    );
    return {
      id: entry.id,
      solved: solved === null ? null : { ...solved },
    };
  });
  return { outingAutonomous, habitats };
}
