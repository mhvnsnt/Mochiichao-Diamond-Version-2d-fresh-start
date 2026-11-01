/**
 * B3 §2.5 — what the Garden does on its own, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: the
 * Garden is an ecology instance, and ecologies in this programme
 * move — visiting/resident composition shifts with the world
 * state, sequence beats change the Garden on the story's
 * schedule, and a resident's arc changes on that same schedule —
 * whether or not anyone visits, breeds, or builds anything. The
 * three effects already exist as separate pure reads, and this
 * module is their composition for one check of the Garden's own
 * motion. It invents no new rule and no new ordering:
 * - migration from garden-migration: the composition one
 *   world-state key produces, from the input residents;
 * - story from garden-story: the composition the story beats
 *   produce, from the SAME input residents, up to the caller's
 *   story cursor;
 * - arcs from garden-arcs: the resident arcs the arc beats
 *   produce, from the input arc state, up to the caller's arc
 *   cursor.
 *
 * The three sections are reported side by side, each exactly as
 * its own read reports it. That side-by-side shape is deliberate:
 * migration and story both transform a composition, and which
 * of them a host applies first — migration-then-story, or
 * story-then-migration — is a host rule this module does not
 * decide, because the spec names no order between them. Chaining
 * them here would smuggle that decision in as if the spec had
 * made it. A host that wants one merged composition applies the
 * two reads in its own chosen order and says so; this bundle
 * never presents a merged composition, and it carries no
 * `residents` field of its own, so no caller can mistake it for
 * one. The story and arc cursors are likewise separate inputs:
 * the story schedule and the arc schedule are different lists,
 * and nothing here couples their cursors.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition (above); NO visit input of any kind —
 *   none of the three reads takes one, so the bundle's result
 *   depends only on residents, world state, rules, beats, and
 *   cursors, visited or not;
 * - NO check-in news: garden-news.ts already reads news from
 *   the doorway log, and this bundle does not re-derive it;
 * - NO season/festival/weather vocabulary authored (the
 *   world-state key is opaque, as in the migration read);
 * - NO story or arc vocabulary authored (beat ids and arc
 *   values are opaque caller strings); NO species, place, or
 *   range data authored (resident ids are opaque; the #102
 *   range rule is the host's filter, not this bundle's);
 * - NO cursor advancement (the caller moves both cursors);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether any section's result changes anything is a
 *   host decision, not this read's.
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every section and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure the composed reads themselves raise (malformed
 * rules, duplicate rule ids, malformed beats, duplicate beat
 * ids, an unknown cursor, a beat naming one resident twice,
 * malformed arc state). Silent defaults are never invented: a
 * Garden with no firing rule, no applied beat, and no arc beat
 * reads its input composition and arc state back unchanged,
 * never a fabricated change.
 */

import {
  migrateComposition,
  type MigratedComposition,
  type MigrationRuleList,
} from "./garden-migration";
import {
  applyStoryBeats,
  type StoryBeat,
  type StoryCompositionResult,
} from "./garden-story";
import {
  applyArcBeats,
  type ArcBeat,
  type ArcBeatResult,
  type ResidentArc,
} from "./garden-arcs";

/** The inputs one autonomous-change bundle is composed from. */
export interface AutonomousChangeInputs {
  /** The resident composition before any autonomous change. */
  residents: string[];
  /** The world-state key the migration read runs under. */
  worldState: string;
  /** Caller-supplied migration rules. */
  migrationRules: MigrationRuleList;
  /** Caller-supplied story-beat schedule. */
  storyBeats: StoryBeat[];
  /** How far the story has reached (story cursor). */
  storyThroughBeatId: string;
  /** The resident arc state before any arc beat. */
  arcs: ResidentArc[];
  /** Caller-supplied arc-beat schedule. */
  arcBeats: ArcBeat[];
  /** How far the arc schedule has reached (arc cursor). */
  arcThroughBeatId: string;
}

/** The Garden's own motion, as its three reads report it. */
export interface AutonomousChange {
  /** Migration's composition, from the input residents. */
  migration: MigratedComposition;
  /** Story's composition, from the SAME input residents. */
  story: StoryCompositionResult;
  /** Arcs after the applied arc beats. */
  arcs: ArcBeatResult;
}

/**
 * One autonomous-change bundle: migration + story + arcs, each
 * exactly as its own read reports it, side by side, with no
 * merged composition and no order invented between them.
 */
export function autonomousChange(
  inputs: AutonomousChangeInputs,
): AutonomousChange {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-autonomous: inputs must be an object");
  }
  const migration = migrateComposition(
    inputs.residents,
    inputs.worldState,
    inputs.migrationRules,
  );
  const story = applyStoryBeats(
    inputs.residents,
    inputs.storyBeats,
    inputs.storyThroughBeatId,
  );
  const arcs = applyArcBeats(
    inputs.arcs,
    inputs.arcBeats,
    inputs.arcThroughBeatId,
  );
  return {
    migration: {
      residents: [...migration.residents],
      arrived: [...migration.arrived],
      departed: [...migration.departed],
      appliedRuleIds: [...migration.appliedRuleIds],
    },
    story: {
      residents: [...story.residents],
      arrived: [...story.arrived],
      departed: [...story.departed],
      appliedBeatIds: [...story.appliedBeatIds],
    },
    arcs: {
      arcs: arcs.arcs.map((entry) => ({ ...entry })),
      changed: [...arcs.changed],
      appliedBeatIds: [...arcs.appliedBeatIds],
    },
  };
}
