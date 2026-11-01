/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction — one outing plus its Garden news plus what its
 * journey brings home plus what the Garden does on its own plus
 * what its zones recognise as habitats plus what those habitats
 * attract, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-autonomous-plus-habitats bundle from
 *   garden-outing-habitats (slice 51: the outing bundle plus one
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
 *   caller-named inbound entry, one autonomous reading per
 *   caller-named autonomous entry, and one habitat reading per
 *   caller-named habitat entry, each exactly as its own read
 *   reports it);
 * - one attraction reading per caller-named attraction entry,
 *   in caller order, via garden-attraction's attractionRichness,
 *   over that entry's OWN solved habitats and its OWN
 *   caller-supplied recipe->class table.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the attraction section is NOT computed
 * from the outing-habitats section's outing, bonds, decay,
 * comfort, thanks, level, record, check-in, snapshot, journey,
 * unlock, individual, teacher, movement, arrival, research,
 * discovery, news, inbound, migration, story, arc, or habitat
 * values — a caller counts its own recognised habitats and hands
 * this module those inputs, exactly as garden-attraction requires
 * — and the outing-habitats section is NOT overwritten by any
 * attraction reading. A Garden can therefore read one fact in the
 * outing-habitats section and a different fact in an attraction
 * reading over different habitats, and both facts are reported.
 * An attraction reading never changes an outing, a bond, a
 * comfort day, a thanks signal, a level summary, a bridge record,
 * a check-in beat, a snapshot lens, a journey visit, an unlock
 * evaluation, an individual summary, a teacher reading, a
 * movement reading, an arrival reading, a research reading, a
 * discovery candidate, a news item, an inbound reading, a
 * migration, a story, an arc, or a habitat in this module's
 * hands, and an outing never sets an attraction entry's habitats
 * or recipe->class table — each is a read at the moment of the
 * call, and the inputs each read reports are returned unchanged.
 * Which of them a host shows first, and whether a recognised
 * habitat's richness is applied to a spawn table, is a host
 * decision this module does not make (garden-attraction's own
 * notes: habitats raise visiting richness along declared classes;
 * they never add stock and never reweight a table; no band lives
 * here).
 * The bundle itself carries no merged residents field, no
 * total-across-attractions field, no attraction level, score,
 * threshold, or ranking on any reading beyond the reads' own
 * rules, no honour or money inflow field, no currency, balance,
 * or spend, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-habitats section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-habitats bundle and the attraction section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   attraction section's facts are exactly what attractionRichness
 *   reports over each entry's own inputs, and the
 *   outing-habitats section's facts are exactly what
 *   gardenOutingHabitats reports over its own inputs;
 * - NO attraction reading computed from an outing-habitats value:
 *   the solved habitats and the recipe->class table are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   a journey visit, an unlock evaluation, an individual
 *   summary, a teacher reading, a movement reading, an arrival
 *   reading, a research reading, a discovery candidate, a news
 *   item, an inbound reading, a migration, a story, an arc, or
 *   a habitat reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, or attraction writer: an attraction
 *   reading is a summary this module never stores or registers
 *   in live play, and no record is appended to any log here;
 * - NO recipe data authored for any habitat and NO recipe->class
 *   table authored here (both are caller-supplied; the Garden's
 *   native habitat names and contents are owner slot S1 in the
 *   wiring plan, never filled here);
 * - NO composition pass (Pokopia context modifiers and
 *   neighbour-habitat combos resolve after base matching and
 *   are a later slice, inherited from garden-habitats);
 * - NO manufactured-booster data (Owner Slot 1, inherited from
 *   garden-inbound, never filled here);
 * - NO honour or money inflow computed here (inherited from
 *   garden-inbound: both arrive as caller-held counts, not as
 *   reads over these inputs);
 * - NO spawn-row annotation here (attractSpawnRows over a
 *   reading's richness is a later slice; this slice reports
 *   richness only, and no row's weight, species, or stock
 *   changes anywhere in it);
 * - NO host, NO store/view/save change, NO encounter/spawn/
 *   route behaviour, NO effect in live play: whether a
 *   recognised habitat's richness is applied to a spawn table,
 *   and whether a discovery candidate is actually met on a
 *   route, are host decisions, not this read's;
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
 * on any failure propagated from either composed read.
 */

import {
  gardenOutingHabitats,
  type GardenOutingHabitats,
  type GardenOutingHabitatsInputs,
} from "./garden-outing-habitats";
import {
  attractionRichness,
  type AttractionRichness,
} from "./garden-attraction";
import type { SolvedHabitat } from "./garden-habitats";

/** One caller-named attraction reading, over its own inputs. */
export interface AttractionEntry {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
  /** The recognised habitats this reading counts, as solved or null. */
  habitats: readonly (SolvedHabitat | null)[];
  /**
   * The caller-supplied recipe->class table: recipe id to the
   * habitat classes that recipe realises. A recipe absent from
   * the table realises no class and contributes nothing.
   */
  classes: Readonly<Record<string, readonly string[]>>;
}

/** The inputs one outing-plus-habitats-plus-attraction bundle is composed from. */
export interface GardenOutingAttractionInputs {
  /** The outing-habitats bundle's inputs, as slice 51 takes them. */
  outingHabitats: GardenOutingHabitatsInputs;
  /** The attraction section's inputs: one entry per reading, in caller order. */
  attraction: {
    entries: readonly AttractionEntry[];
  };
}

/** One attraction entry's reading, copied fresh. */
export interface AttractionReading {
  /** The entry's id, as supplied. */
  id: string;
  /** Visiting richness per class, exactly as garden-attraction reports it. */
  richness: AttractionRichness;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract. */
export interface GardenOutingAttraction {
  /** The outing-plus-autonomous-plus-habitats bundle, exactly as slice 51 reports it. */
  outingHabitats: GardenOutingHabitats;
  /** One attraction reading per caller-named attraction entry, in caller order. */
  attraction: AttractionReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract:
 * outing-habitats bundle + per-entry attraction readings, each
 * exactly as its own read reports it, side by side, with no
 * merged composition and no reconciliation between their
 * pictures.
 */
export function gardenOutingAttraction(
  inputs: GardenOutingAttractionInputs,
): GardenOutingAttraction {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-attraction: inputs must be an object");
  }
  if (
    inputs.outingHabitats === null ||
    typeof inputs.outingHabitats !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction: outingHabitats inputs must be an object",
    );
  }
  if (
    inputs.attraction === null ||
    typeof inputs.attraction !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction: attraction inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.attraction.entries)) {
    throw new Error(
      "garden-outing-attraction: attraction entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.attraction.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-attraction: attraction entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-attraction: attraction entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-attraction: duplicate attraction entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!Array.isArray(entry.habitats)) {
      throw new Error(
        "garden-outing-attraction: attraction entry habitats must be an array",
      );
    }
    if (
      entry.classes === null ||
      typeof entry.classes !== "object" ||
      Array.isArray(entry.classes)
    ) {
      throw new Error(
        "garden-outing-attraction: attraction entry classes must be an object",
      );
    }
  }
  const outingHabitats = gardenOutingHabitats(inputs.outingHabitats);
  const attraction: AttractionReading[] = inputs.attraction.entries.map(
    (entry) => {
      const richness = attractionRichness(
        entry.habitats,
        (recipeId: string) => entry.classes[recipeId] ?? [],
      );
      return { id: entry.id, richness: { ...richness } };
    },
  );
  return { outingHabitats, attraction };
}
