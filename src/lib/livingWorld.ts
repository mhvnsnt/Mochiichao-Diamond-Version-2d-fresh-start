/**
 * livingWorld.ts — the world-encounter director.
 *
 * The Red Dead / GTA grammar inside the Pokemon world (living-world
 * law, AGENTS.md 2026-10-29): things HAPPEN near the player —
 * witnessed events with a choice (join / ignore / side wrong),
 * stranger side-stories found in the world (never on a quest board),
 * and ambient life keyed to the clock. Outcomes with witnesses write
 * to the honor ledger through honor.ts `recordDeed` — the witnessed
 * half of the ledger is this system's sink, by design.
 *
 * Laws baked into the machinery, not the content:
 *  - FORBIDDEN PLACES: a place whose class is `dark-forest` can
 *    never fire, host, or resolve an event (Refusal law — absence
 *    there is authored). This is enforced at validation AND at
 *    evaluation, so a bad data row is refused twice.
 *  - CLOSED DEEDS: every deed a placement names must be a row of the
 *    honor deed table. The director validates at load; an unknown
 *    deed makes the placement inert and is reported, never written.
 *  - NO NAGGING: a resolved event cools down in world beats; an
 *    outcome with `cooldownBeats: null` is once-ever. Cooldowns are
 *    compared against the caller-supplied beat (the honor ledger's
 *    beat unit) — until the world-clock module lands (#19 / S0), the
 *    caller owns the beat and the director never invents one.
 *  - CHARGE AND STANDING ARE INPUTS, NEVER STORED HERE: place charge
 *    comes from the caller's area context (UNMARKED until canon
 *    rules one — Game Bible S1); standing is derived from the ledger
 *    at read time via honor's deriveMorale. Nothing in this module
 *    persists reputation of any kind.
 *  - PRESENTATION RESTRAINT: this module produces scenes, choices
 *    and outcomes — it adds no quest log, no dashboard, no markers
 *    (presentation-restraint law). Strangers are found standing in
 *    the world; the game already knows how to talk to people.
 *
 * Phases are the clock design's canonical five (CLOCK-FROM-POKEMON:
 * Gen 4 gf_rtc table LATE 00-03 / MORN 04-09 / DAY 10-16 / EVE 17-19
 * / NITE 20-23). The engine's current `getDayPhase` is one of four
 * competing in-tree tables and is NOT this one; when the world-clock
 * module lands (S0) it becomes the single producer and this table is
 * deleted in its favour. Until then `phaseForHour` is the design
 * table as data, and callers with no clock pass the honest default
 * phase they were given.
 */

import eventsJson from "../data/core/living-world/events.json";
import routinesJson from "../data/core/living-world/routines.json";
import { DEED_TABLE, deriveMorale, recordDeed } from "./honor";
import type { DeedEntry } from "./honor";

// ---------------------------------------------------------------- phases

export type WorldPhase = "LATE" | "MORN" | "DAY" | "EVE" | "NITE";
export const WORLD_PHASES: readonly WorldPhase[] = ["LATE", "MORN", "DAY", "EVE", "NITE"];

/** The clock design's canonical table (gf_rtc), as data. */
export function phaseForHour(hour: number): WorldPhase {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h < 4) return "LATE";
  if (h < 10) return "MORN";
  if (h < 17) return "DAY";
  if (h < 20) return "EVE";
  return "NITE";
}

// ---------------------------------------------------------------- data types

export type PlaceClass = "town" | "route" | "interior" | "dojo" | "garden" | "wilds" | "dark-forest";

/** Place classes where the director is silent by construction. */
export const FORBIDDEN_PLACE_CLASSES: readonly PlaceClass[] = ["dark-forest"];

export interface AreaInfo {
  placeClass: PlaceClass;
  charge: string;
  displayName: string;
}

export interface DeedWrite {
  deed: string;
  subject: { individualId?: string; itemId?: string; groupId?: string; areaId?: string };
  witnessedBy: string[];
}

export interface EventOutcome {
  id: string;
  label: string;
  deed?: DeedWrite;
  setsFlags: string[];
  /** Beats before this event may fire again; null = once ever. */
  cooldownBeats: number | null;
}

export interface WitnessedEvent {
  id: string;
  kind: "witnessed";
  eventClass: string;
  title: string;
  mapId: string;
  anchor: { x: number; y: number };
  radiusTiles: number;
  phases: WorldPhase[];
  scene: string[];
  requiresFlags: string[];
  forbidsFlags: string[];
  outcomes: EventOutcome[];
  /** Optional charge gate: fires only when the area's charge is one of these. */
  chargeAnyOf?: string[];
}

export type ArcTrigger =
  | { type: "talk"; npcId: string }
  | { type: "return"; npcId: string }
  | { type: "tile"; mapId: string; x: number; y: number; phases?: WorldPhase[] }
  | { type: "battle-win"; eventId: string };

export interface ArcStage {
  stage: number;
  summary: string;
  trigger: ArcTrigger;
  lines?: string[];
  completionDeeds?: DeedWrite[];
}

export interface StrangerArc {
  id: string;
  kind: "stranger-arc";
  title: string;
  mapId: string;
  giverNpcId: string;
  alreadyResolvedFlag?: string;
  alreadyResolvedNote?: string;
  stages: ArcStage[];
}

export interface RoutineEntry {
  npcId: string;
  mapId: string;
  phases: WorldPhase[];
  present: boolean;
  x?: number;
  y?: number;
  facing?: string;
  movement?: string;
  /** Lines for this phase; absent = the NPC's own authored map dialog. */
  lines?: string[];
  /** Lines used instead when the player's derived morale band is good-side. */
  standingGoodLines?: string[];
  requiresFlags?: string[];
  forbidsFlags?: string[];
}

interface EventsFile {
  schema: string;
  areas: Record<string, AreaInfo>;
  events: WitnessedEvent[];
  arcs: StrangerArc[];
}

interface RoutinesFile {
  schema: string;
  routines: RoutineEntry[];
}

const EVENTS = eventsJson as unknown as EventsFile;
const ROUTINES = routinesJson as unknown as RoutinesFile;

export const LIVING_WORLD_AREAS: Readonly<Record<string, AreaInfo>> = EVENTS.areas;
export const WITNESSED_EVENTS: readonly WitnessedEvent[] = EVENTS.events;
export const STRANGER_ARCS: readonly StrangerArc[] = EVENTS.arcs;
export const AMBIENT_ROUTINES: readonly RoutineEntry[] = ROUTINES.routines;

// ---------------------------------------------------------------- state

/**
 * The director's world state. Story/world facts only — resolutions,
 * arc progress, flags. It is NOT reputation: no standing, tally, or
 * charge value ever lives here (those are derived elsewhere).
 * Persisted by the caller's save path alongside other world state.
 */
export interface LivingWorldState {
  /** eventId -> the resolution that last closed it. */
  resolved: Record<string, { outcome: string; beat: number }>;
  /** arcId -> current stage index. */
  arcStage: Record<string, number>;
  /** Completed arc ids. */
  arcDone: string[];
  /** World flags set by outcomes (event ids, arc completions). */
  flags: string[];
}

export function emptyLivingWorldState(): LivingWorldState {
  return { resolved: {}, arcStage: {}, arcDone: [], flags: [] };
}

// ---------------------------------------------------------------- context

export interface DirectorContext {
  mapId: string;
  phase: WorldPhase;
  /** World beat (honor's beat unit), caller-supplied. */
  beat: number;
  /** Player tile, when the caller knows it — enables radius gating. */
  playerPos?: { x: number; y: number };
  /** The honor ledger, for standing reads (derived, never stored). */
  ledger: readonly DeedEntry[];
  state: LivingWorldState;
  /** Area overrides (charge rulings, future areas). Merged over data. */
  areas?: Record<string, AreaInfo>;
}

export function areaInfo(ctx: DirectorContext, mapId: string): AreaInfo | null {
  return ctx.areas?.[mapId] ?? EVENTS.areas[mapId] ?? null;
}

function isForbidden(ctx: DirectorContext, mapId: string): boolean {
  const area = areaInfo(ctx, mapId);
  return area !== null && FORBIDDEN_PLACE_CLASSES.includes(area.placeClass);
}

function flagsAllow(flags: readonly string[], requires: readonly string[] = [], forbids: readonly string[] = []): boolean {
  return requires.every((f) => flags.includes(f)) && !forbids.some((f) => flags.includes(f));
}

// ---------------------------------------------------------------- validation

export interface DataProblem {
  where: string;
  problem: string;
}

/**
 * Load-time audit of the placement data against the laws: closed deed
 * vocabulary, no placements in forbidden places, arc shape sanity,
 * outcome ids unique per event. The director refuses to fire any
 * placement named here (see `inertEventIds`) — a data error degrades
 * to silence for that row, never to a bad write.
 */
export function validateLivingWorldData(
  events: readonly WitnessedEvent[] = WITNESSED_EVENTS,
  arcs: readonly StrangerArc[] = STRANGER_ARCS,
  areas: Readonly<Record<string, AreaInfo>> = EVENTS.areas,
): DataProblem[] {
  const problems: DataProblem[] = [];
  const deedIds = new Set(DEED_TABLE.deeds.map((d) => d.deed));
  const checkDeed = (where: string, w: DeedWrite) => {
    if (!deedIds.has(w.deed)) problems.push({ where, problem: `unknown deed "${w.deed}" (closed vocabulary)` });
  };
  for (const ev of events) {
    const area = areas[ev.mapId];
    if (!area) problems.push({ where: ev.id, problem: `unknown map "${ev.mapId}"` });
    else if (FORBIDDEN_PLACE_CLASSES.includes(area.placeClass))
      problems.push({ where: ev.id, problem: `placed in forbidden place class "${area.placeClass}" — Refusal law` });
    const seen = new Set<string>();
    for (const o of ev.outcomes) {
      if (seen.has(o.id)) problems.push({ where: ev.id, problem: `duplicate outcome id "${o.id}"` });
      seen.add(o.id);
      if (o.deed) checkDeed(`${ev.id}/${o.id}`, o.deed);
    }
    if (ev.outcomes.length === 0) problems.push({ where: ev.id, problem: "no outcomes" });
  }
  for (const arc of arcs) {
    const area = areas[arc.mapId];
    if (!area) problems.push({ where: arc.id, problem: `unknown map "${arc.mapId}"` });
    else if (FORBIDDEN_PLACE_CLASSES.includes(area.placeClass))
      problems.push({ where: arc.id, problem: `placed in forbidden place class "${area.placeClass}" — Refusal law` });
    if (arc.stages.length === 0) problems.push({ where: arc.id, problem: "no stages" });
    arc.stages.forEach((s, i) => {
      if (s.stage !== i) problems.push({ where: arc.id, problem: `stage index ${s.stage} out of order at position ${i}` });
      s.completionDeeds?.forEach((d) => checkDeed(`${arc.id}/stage-${s.stage}`, d));
    });
  }
  return problems;
}

const INERT_EVENT_IDS: ReadonlySet<string> = new Set(
  validateLivingWorldData().map((p) => p.where.split("/")[0]),
);

// ---------------------------------------------------------------- witnessed events

/**
 * The witnessed events that may fire for this context — right place,
 * right phase, flags allow, inside radius (when the caller knows
 * where the player stands), off cooldown, charge gate satisfied,
 * data-valid. The Dark Forest returns [] by construction.
 */
export function eligibleEvents(ctx: DirectorContext): WitnessedEvent[] {
  if (isForbidden(ctx, ctx.mapId)) return [];
  const area = areaInfo(ctx, ctx.mapId);
  if (!area) return [];
  return WITNESSED_EVENTS.filter((ev) => {
    if (ev.mapId !== ctx.mapId) return false;
    if (INERT_EVENT_IDS.has(ev.id)) return false;
    if (!ev.phases.includes(ctx.phase)) return false;
    if (ev.chargeAnyOf && !ev.chargeAnyOf.includes(area.charge)) return false;
    if (!flagsAllow(ctx.state.flags, ev.requiresFlags, ev.forbidsFlags)) return false;
    const last = ctx.state.resolved[ev.id];
    if (last) {
      const outcome = ev.outcomes.find((o) => o.id === last.outcome);
      if (!outcome) return false;
      if (outcome.cooldownBeats === null) return false; // once ever
      if (ctx.beat - last.beat < outcome.cooldownBeats) return false; // the world doesn't nag
    }
    if (ctx.playerPos) {
      const d = Math.max(Math.abs(ctx.playerPos.x - ev.anchor.x), Math.abs(ctx.playerPos.y - ev.anchor.y));
      if (d > ev.radiusTiles) return false;
    }
    return true;
  });
}

export interface OutcomeResult {
  event: WitnessedEvent;
  outcome: EventOutcome;
  /** The ledger entry written, if the outcome carries a deed. */
  entry: DeedEntry | null;
  /** The new director state (the input state is not mutated). */
  state: LivingWorldState;
}

/** The structural store `recordDeed` writes to (the real game store
 *  satisfies this; tests pass its live state through a getter). */
export type HonorSink = {
  deedLedger: readonly DeedEntry[];
  appendDeed: (entry: DeedEntry) => void;
};

function writeDeed(
  sink: HonorSink,
  ctx: DirectorContext,
  w: DeedWrite,
  areaId: string,
): DeedEntry {
  return recordDeed(sink, {
    deed: w.deed,
    subject: w.subject,
    areaId,
    beat: ctx.beat,
    witnessedBy: [...w.witnessedBy],
  });
}

function withResolution(
  state: LivingWorldState,
  eventId: string,
  outcome: EventOutcome,
  beat: number,
): LivingWorldState {
  const flags = [...state.flags];
  for (const f of outcome.setsFlags) if (!flags.includes(f)) flags.push(f);
  return {
    ...state,
    resolved: { ...state.resolved, [eventId]: { outcome: outcome.id, beat } },
    flags,
  };
}

/**
 * Resolve a witnessed event with the player's chosen outcome. Writes
 * the outcome's deed (witnessed — this is the ledger's witnessed
 * half) and returns the advanced state. Throws on unknown ids: a
 * caller asking for a resolution that doesn't exist is a bug, and
 * bugs should be loud, never silently absorbed.
 */
export function resolveOutcome(
  sink: HonorSink,
  ctx: DirectorContext,
  eventId: string,
  outcomeId: string,
): OutcomeResult {
  const event = WITNESSED_EVENTS.find((e) => e.id === eventId);
  if (!event) throw new Error(`livingWorld: unknown event "${eventId}"`);
  if (isForbidden(ctx, event.mapId)) throw new Error(`livingWorld: event "${eventId}" sits in a forbidden place class`);
  if (INERT_EVENT_IDS.has(eventId)) throw new Error(`livingWorld: event "${eventId}" is inert (invalid data)`);
  const outcome = event.outcomes.find((o) => o.id === outcomeId);
  if (!outcome) throw new Error(`livingWorld: event "${eventId}" has no outcome "${outcomeId}"`);
  const entry = outcome.deed ? writeDeed(sink, ctx, outcome.deed, event.mapId) : null;
  return { event, outcome, entry, state: withResolution(ctx.state, eventId, outcome, ctx.beat) };
}

// ---------------------------------------------------------------- stranger arcs

export type ArcAvailability = "available" | "in-progress" | "done" | "already-resolved" | "unavailable";

/**
 * Where an arc stands for this context. `already-resolved` is the
 * interlock case (arc_fishers_empty_lead): the world event already
 * did the arc's work — the giver's thanks are the whole of it, and
 * no second deed is ever written for the same act.
 */
export function arcAvailability(ctx: DirectorContext, arcId: string): ArcAvailability {
  const arc = STRANGER_ARCS.find((a) => a.id === arcId);
  if (!arc) return "unavailable";
  if (isForbidden(ctx, arc.mapId)) return "unavailable";
  if (ctx.state.arcDone.includes(arcId)) return "done";
  if (arc.alreadyResolvedFlag && ctx.state.flags.includes(arc.alreadyResolvedFlag)) return "already-resolved";
  if ((ctx.state.arcStage[arcId] ?? 0) > 0) return "in-progress";
  return "available";
}

export function currentArcStage(ctx: DirectorContext, arcId: string): ArcStage | null {
  const arc = STRANGER_ARCS.find((a) => a.id === arcId);
  if (!arc) return null;
  const idx = ctx.state.arcStage[arcId] ?? 0;
  return arc.stages[idx] ?? null;
}

export interface ArcAdvanceResult {
  arc: StrangerArc;
  /** The stage that was completed by this call. */
  stage: ArcStage;
  /** Ledger entries written by the stage's completion deeds. */
  entries: DeedEntry[];
  completed: boolean;
  state: LivingWorldState;
}

/**
 * Mark the arc's current stage complete (the caller — engine seam —
 * establishes that the stage's trigger actually happened: a talk, a
 * tile reached, a battle won). Writes the stage's completion deeds,
 * advances the stage machine, and on the final stage closes the arc:
 * `arc-done:<id>` joins the flags and the id joins arcDone.
 */
export function completeArcStage(
  sink: HonorSink,
  ctx: DirectorContext,
  arcId: string,
): ArcAdvanceResult {
  const arc = STRANGER_ARCS.find((a) => a.id === arcId);
  if (!arc) throw new Error(`livingWorld: unknown arc "${arcId}"`);
  if (isForbidden(ctx, arc.mapId)) throw new Error(`livingWorld: arc "${arcId}" sits in a forbidden place class`);
  const idx = ctx.state.arcStage[arcId] ?? 0;
  const stage = arc.stages[idx];
  if (!stage) throw new Error(`livingWorld: arc "${arcId}" has no stage ${idx} (already complete?)`);
  const entries = (stage.completionDeeds ?? []).map((d) => writeDeed(sink, ctx, d, arc.mapId));
  const isLast = idx >= arc.stages.length - 1;
  const flags = [...ctx.state.flags];
  let arcDone = ctx.state.arcDone;
  if (isLast) {
    const doneFlag = `arc-done:${arcId}`;
    if (!flags.includes(doneFlag)) flags.push(doneFlag);
    if (!arcDone.includes(arcId)) arcDone = [...arcDone, arcId];
  }
  return {
    arc,
    stage,
    entries,
    completed: isLast,
    state: {
      ...ctx.state,
      arcStage: { ...ctx.state.arcStage, [arcId]: idx + 1 },
      arcDone,
      flags,
    },
  };
}

// ---------------------------------------------------------------- ambient routines

export interface RoutineRead {
  entry: RoutineEntry;
  /** The lines to speak: standing variant when earned, else the
   *  entry's lines — or null when the NPC's own authored map dialog
   *  should be used (the routine placed them; it doesn't rewrite
   *  what canon gave them to say). */
  lines: string[] | null;
  present: boolean;
}

/**
 * Resolve one NPC's routine for a phase: first entry (file order)
 * whose phase and flag gates match. `standingGoodLines` are returned
 * when the player's derived morale band is good-side — people who
 * have heard of you talk to you differently, and nobody ever shows
 * you a number (presentation-restraint + honor's derived law).
 */
export function routineFor(
  npcId: string,
  ctx: Pick<DirectorContext, "phase" | "state" | "ledger">,
  routines: readonly RoutineEntry[] = AMBIENT_ROUTINES,
): RoutineRead | null {
  const entry = routines.find(
    (r) =>
      r.npcId === npcId &&
      r.phases.includes(ctx.phase) &&
      flagsAllow(ctx.state.flags, r.requiresFlags, r.forbidsFlags),
  );
  if (!entry) return null;
  let lines: string[] | null = entry.lines ?? null;
  if (entry.standingGoodLines && ctx.ledger.length > 0) {
    if (deriveMorale(ctx.ledger).band.side === "good") lines = entry.standingGoodLines;
  }
  return { entry, lines, present: entry.present };
}

/** Every placed person's routine on one map at one phase — the
 *  town's schedule as data, for the engine seam to apply. */
export function routinesForMap(
  mapId: string,
  ctx: Pick<DirectorContext, "phase" | "state" | "ledger">,
): RoutineRead[] {
  const ids = [...new Set(AMBIENT_ROUTINES.filter((r) => r.mapId === mapId).map((r) => r.npcId))];
  return ids
    .map((id) => routineFor(id, ctx))
    .filter((r): r is RoutineRead => r !== null);
}
