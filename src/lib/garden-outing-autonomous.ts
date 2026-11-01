/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous — one outing plus
 * its Garden news plus what its journey brings home plus what
 * the Garden does on its own, pure library form.
 *
 * This module composes two already-landed reads and invents no new
 * section and no new rule. It calls the existing reads and reports
 * exactly what they return, side by side:
 * - the outing-plus-news-plus-inbound bundle from
 *   garden-outing-inbound (slice 49: the outing bundle plus one
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
 *   per caller-named news entry, and one inbound reading per
 *   caller-named inbound entry, each exactly as its own read
 *   reports it);
 * - one autonomous reading per caller-named autonomous entry, in
 *   caller order, via garden-autonomous's autonomousChange, over
 *   each entry's OWN residents, world state, migration rules,
 *   story beats and story cursor, arc state, arc beats, and arc
 *   cursor.
 *
 * The two sections run over their OWN inputs and are never merged,
 * chained, or reconciled: the autonomous section is NOT computed
 * from the outing-inbound section's outing, bonds, decay, comfort,
 * thanks, level, record, check-in, snapshot, journey, unlock,
 * individual, teacher, movement, arrival, research, discovery,
 * news, or inbound values — a caller counts its own residents
 * and hands this module those inputs, exactly as garden-autonomous
 * requires — and the outing-inbound section is NOT overwritten by
 * any autonomous reading. A Garden can therefore read one fact in
 * the outing-inbound section and a different fact in an autonomous
 * reading over different residents, and both facts are reported.
 * An autonomous reading never changes an outing, a bond, a comfort
 * day, a thanks signal, a level summary, a bridge record, a
 * check-in beat, a snapshot lens, a journey visit, an unlock
 * evaluation, an individual summary, a teacher reading, a movement
 * reading, an arrival reading, a research reading, a discovery
 * candidate, a news item, or an inbound reading in this module's
 * hands, and an outing never sets an autonomous entry's residents,
 * world state, rules, beats, cursors, or arc state — each is a
 * read at the moment of the call, and the inputs each read
 * reports are returned unchanged. Which of them a host shows
 * first, and whether a migration or story composition is applied,
 * is a host decision this module does not make (garden-autonomous's
 * own notes: which composition a host applies first, and whether
 * any section's result changes anything, are host decisions, not
 * this read's).
 * The bundle itself carries no merged residents field, no
 * total-across-autonomous field, no autonomous level, score,
 * threshold, or ranking on any reading beyond the reads' own
 * rules, no honour or money inflow field, no currency, balance,
 * or spend, and no named rite or bell-equivalent object (the
 * gathering beat stays inside the outing-inbound section,
 * inherited).
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-inbound bundle and the autonomous section (above);
 * - NO reconciliation of the two sections' pictures (above): the
 *   autonomous section's facts are exactly what autonomousChange
 *   reports over each entry's own inputs, and the outing-inbound
 *   section's facts are exactly what gardenOutingInbound reports
 *   over its own inputs;
 * - NO autonomous reading computed from an outing-inbound value:
 *   the residents, world state, rules, beats, cursors, and arc
 *   state are caller-supplied, never read off a bond list, a
 *   decay breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot lens,
 *   a journey visit, an unlock evaluation, an individual summary,
 *   a teacher reading, a movement reading, an arrival reading, a
 *   research reading, a discovery candidate, a news item, or an
 *   inbound reading;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, or arc writer: an autonomous reading is a summary this
 *   module never stores or unlocks with in live play, and no
 *   record is appended to any log here;
 * - NO manufactured-booster data (Owner Slot 1, inherited from
 *   garden-inbound, never filled here);
 * - NO honour or money inflow computed here (inherited from
 *   garden-inbound: both arrive as caller-held counts, not as
 *   reads over these inputs);
 * - NO host, NO store/view/save change, NO encounter/spawn/
 *   route behaviour, NO effect in live play: whether a migration
 *   or story composition is applied, and whether a discovery
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
 * defaults are never invented: an outing-inbound bundle with no
 * autonomous entries, and an autonomous entry with no firing
 * rule, no applied beat, and no arc beat, read their input
 * composition and arc state back unchanged, never a fabricated
 * change.
 */

import {
  gardenOutingInbound,
  type GardenOutingInbound,
  type GardenOutingInboundInputs,
} from "./garden-outing-inbound";
import {
  autonomousChange,
  type AutonomousChange,
  type AutonomousChangeInputs,
} from "./garden-autonomous";

/** One caller-named autonomous reading, over its own inputs. */
export interface AutonomousEntry extends AutonomousChangeInputs {
  /** The reading's id (opaque, caller-chosen). */
  id: string;
}

/** The inputs one outing-plus-inbound-plus-autonomous bundle is composed from. */
export interface GardenOutingAutonomousInputs {
  /** The outing-inbound bundle's inputs, as slice 49 takes them. */
  outingInbound: GardenOutingInboundInputs;
  /** The autonomous section's inputs: one entry per reading, in caller order. */
  autonomous: {
    entries: readonly AutonomousEntry[];
  };
}

/** One autonomous entry's reading, copied fresh. */
export interface AutonomousReading {
  /** The entry's id, as supplied. */
  id: string;
  /** Migration's composition, exactly as garden-autonomous reports it, copied fresh. */
  migration: AutonomousChange["migration"];
  /** Story's composition, exactly as garden-autonomous reports it, copied fresh. */
  story: AutonomousChange["story"];
  /** Arcs after the applied arc beats, exactly as garden-autonomous reports them, copied fresh. */
  arcs: AutonomousChange["arcs"];
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own. */
export interface GardenOutingAutonomous {
  /** The outing-plus-news-plus-inbound bundle, exactly as slice 49 reports it. */
  outingInbound: GardenOutingInbound;
  /** One autonomous reading per caller-named autonomous entry, in caller order. */
  autonomous: AutonomousReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own: outing-inbound bundle
 * + per-entry autonomous readings, each exactly as its own read
 * reports it, side by side, with no merged composition and no
 * reconciliation between their pictures.
 */
export function gardenOutingAutonomous(
  inputs: GardenOutingAutonomousInputs,
): GardenOutingAutonomous {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-autonomous: inputs must be an object");
  }
  if (
    inputs.outingInbound === null ||
    typeof inputs.outingInbound !== "object"
  ) {
    throw new Error(
      "garden-outing-autonomous: outingInbound inputs must be an object",
    );
  }
  if (
    inputs.autonomous === null ||
    typeof inputs.autonomous !== "object"
  ) {
    throw new Error(
      "garden-outing-autonomous: autonomous inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.autonomous.entries)) {
    throw new Error(
      "garden-outing-autonomous: autonomous entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.autonomous.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-autonomous: autonomous entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-autonomous: autonomous entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-autonomous: duplicate autonomous entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
  }
  const outingInbound = gardenOutingInbound(inputs.outingInbound);
  const autonomous: AutonomousReading[] = inputs.autonomous.entries.map(
    (entry) => {
      const reading = autonomousChange({
        residents: entry.residents,
        worldState: entry.worldState,
        migrationRules: entry.migrationRules,
        storyBeats: entry.storyBeats,
        storyThroughBeatId: entry.storyThroughBeatId,
        arcs: entry.arcs,
        arcBeats: entry.arcBeats,
        arcThroughBeatId: entry.arcThroughBeatId,
      });
      return {
        id: entry.id,
        migration: {
          residents: [...reading.migration.residents],
          arrived: [...reading.migration.arrived],
          departed: [...reading.migration.departed],
          appliedRuleIds: [...reading.migration.appliedRuleIds],
        },
        story: {
          residents: [...reading.story.residents],
          arrived: [...reading.story.arrived],
          departed: [...reading.story.departed],
          appliedBeatIds: [...reading.story.appliedBeatIds],
        },
        arcs: {
          arcs: reading.arcs.arcs.map((arc) => ({ ...arc })),
          changed: [...reading.arcs.changed],
          appliedBeatIds: [...reading.arcs.appliedBeatIds],
        },
      };
    },
  );
  return { outingInbound, autonomous };
}
