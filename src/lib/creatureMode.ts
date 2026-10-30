/**
 * creatureMode.ts — Creature Mode + Dual Encounters (PMD-mode package,
 * owner orders 2026-10-29 ~20:12–20:17 CDT; spec: MODE-SWAP-SPEC.md and
 * ENCOUNTER-MODEL.md in ~/workspace/pmd-mode/).
 *
 * Three systems, one module, all pure logic (the engine wiring lives in
 * WorldEngine.tsx and only calls in here):
 *
 *  1. MODE SWAP — one button passes control between the Ranger and a
 *     Mochiichao. Who you become follows movement.json's lead selection
 *     (first alive non-egg, else first non-egg) — the same lead the
 *     follower system already walks behind you.
 *
 *  2. COMPANION — whoever you are NOT playing is a companion, not a
 *     prop. Command model (Follow / Wait / Free) comes from the
 *     Fallout/Bethesda companion layer composed with the HGSS follower:
 *     Follow = the existing command-buffer trail; Wait = hold position;
 *     Free = Bethesda-style sandboxing (idle wander near an anchor,
 *     sensible small acts) — the companion lives while you play.
 *     Story overrides are DATA (companionOverrideFor), flagged owner
 *     slots; the undecided rule is never hard-coded.
 *
 *  3. DUAL ENCOUNTERS + ENGAGEMENT — tall-grass random encounters are
 *     untouched (this module never reads or writes the grass path).
 *     Visible roamers are the same population presented in the world,
 *     and the engagement layer lets you act on one before contact.
 *     The BATTLE-STYLE RULE IS DECIDED (owner correction 2026-10-29
 *     ~20:17 CDT; DORO-DESIGNED under his delegation, reversible by
 *     his word) — see battleStyleFor(). Meaning decides:
 *       - Ranger mode: wild contact = classic turn battle, always.
 *         Ranged play is approach play only — lure, distract, a catch
 *         attempt. The Ranger NEVER deals damage personally (canon).
 *       - Creature mode: wild overworld scraps resolve PMD-style in
 *         real time (you ARE the creature). Any fight with stakes —
 *         trainer, boss, dojo-class, story, an Alpha/territory
 *         holder — ESCALATES to the classic turn battle, the formal
 *         duel. The escalation itself is a marked moment.
 *       - Dungeons/caves follow the mode rule; roamers visible in both.
 */

import { calculateDamage, type BattlerInput, type MoveInput } from "./battle-math";
import encounterModes from "../data/core/encounter-modes.json";

// ---------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------

export type ControlMode = "ranger" | "creature";
export type CompanionCommand = "follow" | "wait" | "free";
export type EncounterMix = "grass" | "roamer" | "both";
export type PlaceContext = "open" | "dungeon" | "cave" | "built";
export type StakesClass =
  | "wild"
  | "trainer"
  | "boss"
  | "dojo"
  | "story"
  | "alpha";
export type BattleStyle = "classic" | "pmd-skirmish";

export interface Pos {
  x: number;
  y: number;
}

type Rng = () => number;

// ---------------------------------------------------------------------
// 1. Mode swap
// ---------------------------------------------------------------------

/**
 * Who you become on swap. Mirrors movement.json follower.leadSelection
 * ("first_alive_non_egg_else_first_non_egg"): party records carry no
 * egg state in the live game, so — exactly as WorldEngine's follower
 * computes it — first living member, else the first member.
 */
export function swapTarget(party: any[]): any | null {
  if (!party || party.length === 0) return null;
  return party.find((m: any) => (m.currentHp ?? m.hp) > 0) || party[0] || null;
}

/** The other half of the dyad: in creature mode the companion is the
 * Ranger; in ranger mode the companion is the swap target creature. */
export function companionOf(mode: ControlMode, party: any[]): { kind: "ranger" } | { kind: "creature"; mon: any } | null {
  if (mode === "creature") return { kind: "ranger" };
  const mon = swapTarget(party);
  return mon ? { kind: "creature", mon } : null;
}

// ---------------------------------------------------------------------
// 2. Companion commands (Fallout layer over the HGSS follower)
// ---------------------------------------------------------------------

export const COMPANION_COMMANDS: CompanionCommand[] = ["follow", "wait", "free"];

export function nextCompanionCommand(c: CompanionCommand): CompanionCommand {
  const i = COMPANION_COMMANDS.indexOf(c);
  return COMPANION_COMMANDS[(i + 1) % COMPANION_COMMANDS.length];
}

/**
 * Story overrides are data, flagged owner slots: a story beat may force
 * a command (e.g. the Ranger waits at the gate while the creature
 * scouts). The table ships EMPTY — no story fact is invented here.
 * Shape when the owner authors one:
 *   { eventId, mapId?, command, reason }
 */
export interface CompanionOverride {
  eventId: string;
  mapId?: string;
  command: CompanionCommand;
  reason: string;
}
export const COMPANION_OVERRIDES: CompanionOverride[] = [];

export function companionOverrideFor(completedEvents: string[], mapId: string): CompanionOverride | null {
  return (
    COMPANION_OVERRIDES.find(
      (o) => completedEvents.includes(o.eventId) && (!o.mapId || o.mapId === mapId),
    ) || null
  );
}

export function effectiveCompanionCommand(
  playerCommand: CompanionCommand,
  completedEvents: string[],
  mapId: string,
): CompanionCommand {
  return companionOverrideFor(completedEvents, mapId)?.command || playerCommand;
}

/**
 * One sandboxing step for a companion on `free` (Bethesda idle life):
 * mostly hold and look around; sometimes step to a neighbouring tile
 * near the anchor. Deterministic under the injected rng; the engine
 * supplies collision checks by accepting/rejecting the proposal.
 */
export function companionFreeStep(
  pos: Pos,
  anchor: Pos,
  rng: Rng,
): { pos: Pos; act: "idle" | "look" | "step" } {
  const roll = rng();
  if (roll < 0.55) return { pos, act: "idle" };
  if (roll < 0.75) return { pos, act: "look" };
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  const d = dirs[Math.floor(rng() * dirs.length)];
  const next = { x: pos.x + d.x, y: pos.y + d.y };
  // Sandbox radius: a companion on free stays within 3 tiles of anchor.
  if (Math.abs(next.x - anchor.x) + Math.abs(next.y - anchor.y) > 3) {
    return { pos, act: "idle" };
  }
  return { pos: next, act: "step" };
}

// ---------------------------------------------------------------------
// 3a. The decided battle-style rule
// ---------------------------------------------------------------------

/**
 * THE RULE (decided, not parked — owner correction 2026-10-29 ~20:17
 * CDT; designed by Doro under his delegation: "when he says 'I don't
 * know how we'll decide', Doro designs the remaining part the way he
 * would want it"; reversible by his word).
 *
 * Meaning decides — the same law as his moment grammar (a shift is
 * earned when the meaning changes state):
 *   - Ranger mode: the Ranger's grammar is the formal duel. Wild
 *     contact is ALWAYS the classic turn battle.
 *   - Creature mode: you ARE the creature; wild scraps in the world
 *     are PMD real-time. But a fight with stakes — trainer, boss,
 *     dojo-class, story, an Alpha/territory holder — changes the
 *     meaning of the fight, so it ESCALATES to the classic battle.
 *   - Place never overrides mode: dungeons and caves follow the mode
 *     rule above (the parameter is accepted so per-place data can be
 *     recorded, and deliberately does not change the outcome).
 */
export function battleStyleFor(
  mode: ControlMode,
  _place: PlaceContext,
  stakes: StakesClass,
): BattleStyle {
  if (mode === "ranger") return "classic";
  return stakes === "wild" ? "pmd-skirmish" : "classic";
}

/** Stakes classes that escalate a creature-mode scrap into the duel. */
export const ESCALATING_STAKES: StakesClass[] = ["trainer", "boss", "dojo", "story", "alpha"];

// ---------------------------------------------------------------------
// 3b. Roamers — the visible half of the dual encounter model
// ---------------------------------------------------------------------

/** Arceus T3 temperaments: species-level, legible, acted out. */
export type Temperament = "timid" | "docile" | "curious" | "bold" | "aggressive";

export type RoamerState = "wander" | "graze" | "flee" | "approach" | "chase" | "down";

export interface Roamer {
  id: string;
  speciesId: string;
  level: number;
  temperament: Temperament;
  /** Alpha / territory holder: a stakes-bearing individual (escalates). */
  isAlpha: boolean;
  pos: Pos;
  home: Pos;
  state: RoamerState;
  hp: number;
  maxHp: number;
  /** Ranger-defense extension (2026-10-29): world beats remaining
   * where this roamer's attention is on the companion Ranger
   * (distract). Set by lib/rangerDefense.distractRoamer via the
   * engine; the heartbeat spends it. Absent = not distracted. */
  distractedBeats?: number;
}

let roamerSeq = 0;
export function createRoamer(
  speciesId: string,
  level: number,
  home: Pos,
  opts: { temperament?: Temperament; isAlpha?: boolean; hp?: number } = {},
): Roamer {
  const hp = opts.hp ?? 20 + level * 2;
  return {
    id: `roamer_${++roamerSeq}_${speciesId}`,
    speciesId,
    level,
    temperament: opts.temperament ?? "docile",
    isAlpha: !!opts.isAlpha,
    pos: { ...home },
    home: { ...home },
    state: "wander",
    hp,
    maxHp: hp,
  };
}

const dist = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function stepToward(from: Pos, to: Pos): Pos {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  if (dx !== 0 && Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)) {
    return { x: from.x + dx, y: from.y };
  }
  if (dy !== 0) return { x: from.x, y: from.y + dy };
  if (dx !== 0) return { x: from.x + dx, y: from.y };
  return from;
}

function stepAway(from: Pos, threat: Pos): Pos {
  const dx = Math.sign(from.x - threat.x);
  const dy = Math.sign(from.y - threat.y);
  if (Math.abs(from.x - threat.x) >= Math.abs(from.y - threat.y) && dx !== 0) {
    return { x: from.x + dx, y: from.y };
  }
  if (dy !== 0) return { x: from.x, y: from.y + dy };
  if (dx !== 0) return { x: from.x + dx, y: from.y };
  return from;
}

/**
 * One roamer heartbeat (the engine ticks roamers on the same step
 * rhythm as the world; PMD's step-synchrony without its grid combat).
 * Behaviour is temperament acted out (Arceus T3): timid flees early,
 * docile grazes, curious approaches slowly, bold approaches, and
 * aggressive gives chase inside its territory radius. An Alpha holds
 * territory: it approaches/chases sooner and never flees.
 */
export function stepRoamer(r: Roamer, playerPos: Pos, rng: Rng): Roamer {
  if (r.state === "down") return r;
  const d = dist(r.pos, playerPos);
  const sight = r.isAlpha ? 6 : 5;
  let state: RoamerState = r.state;
  let pos = r.pos;

  const fleeAt = r.temperament === "timid" ? 4 : r.temperament === "docile" ? 1 : 0;
  const chaseAt =
    r.temperament === "aggressive" || r.isAlpha ? sight : r.temperament === "bold" ? 3 : r.temperament === "curious" ? 4 : 0;

  if (!r.isAlpha && fleeAt > 0 && d <= fleeAt) {
    state = "flee";
    pos = stepAway(r.pos, playerPos);
  } else if (chaseAt > 0 && d <= chaseAt && d > 0) {
    state = r.temperament === "curious" ? "approach" : "chase";
    if (state === "approach" && rng() < 0.5) {
      // Curious things hesitate: half the heartbeats they just watch.
    } else {
      pos = stepToward(r.pos, playerPos);
    }
  } else if (d > 10) {
    // Drift home when the player is far: territory is a place.
    state = "wander";
    if (rng() < 0.4) pos = stepToward(r.pos, r.home);
  } else {
    state = rng() < 0.3 ? "graze" : "wander";
    if (state === "wander" && rng() < 0.5) {
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      const dd = dirs[Math.floor(rng() * dirs.length)];
      const next = { x: r.pos.x + dd.x, y: r.pos.y + dd.y };
      if (dist(next, r.home) <= 4) pos = next;
    }
  }
  return { ...r, state, pos };
}

/** Roamer population for a map: drawn from the map's OWN encounter
 * pool (weighted head), so grass and roamers are one ecology with two
 * presentations. Returns [] when the mix is grass-only. */
export function roamersForMap(
  mapId: string,
  pool: Array<{ id?: string; speciesId?: string }> | undefined,
  mix: EncounterMix,
  rng: Rng,
): Roamer[] {
  if (mix === "grass" || !pool || pool.length === 0) return [];
  const cfg: any = encounterModes as any;
  const max = cfg.roamers?.maxPerMap ?? 3;
  const out: Roamer[] = [];
  const n = Math.min(max, pool.length);
  for (let i = 0; i < n; i++) {
    const entry: any = pool[i];
    const speciesId = entry.id || entry.speciesId;
    if (!speciesId) continue;
    out.push(
      createRoamer(speciesId, 2 + Math.floor(rng() * 3), {
        x: 5 + Math.floor(rng() * 8),
        y: 5 + Math.floor(rng() * 8),
      }),
    );
  }
  void mapId;
  return out;
}

export function encounterMixFor(
  mapId: string,
  hasPool: boolean,
  interior: boolean,
): EncounterMix {
  const cfg: any = encounterModes as any;
  const byMap = cfg.areaMix?.byMap || {};
  if (byMap[mapId]) return byMap[mapId];
  if (!hasPool || interior) return "grass";
  return (cfg.areaMix?.default as EncounterMix) || "both";
}

// ---------------------------------------------------------------------
// 3c. Engagement — acting on a roamer before contact
// ---------------------------------------------------------------------

export type RangedKind =
  | "lure" // ranger: draw it closer without harm
  | "distract" // ranger: turn its attention; it stops chasing
  | "catchAttempt" // ranger: a cube thrown from range
  | "strike"; // creature: a real move (or the regular attack) used in the field

export interface EngagementOutcome {
  kind: RangedKind;
  /** damage dealt (always 0 in ranger mode — the Ranger never deals
   * damage personally, canon) */
  damage: number;
  targetHp: number;
  /** ko | caught | recruited | angered | distracted | lured | missed | refused */
  result: "ko" | "caught" | "recruited" | "angered" | "distracted" | "lured" | "missed" | "refused";
  /** When true the encounter escalates to a battle on contact —
   * style from battleStyleFor(). */
  escalates: boolean;
  note: string;
}

/** The PMD regular attack: every creature can always do this in the
 * field, costing nothing — PMD's cross-series constant #2. */
export const REGULAR_ATTACK: MoveInput & { id: string; name: string } = {
  id: "REGULAR_ATTACK",
  name: "Strike",
  power: 40,
  accuracy: 100,
  category: "Physical",
  element: "NORMAL" as any,
  priority: 0,
};

const ZERO_STAGES = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 } as any;

export function battlerFromMon(mon: any): BattlerInput {
  const stats = mon.stats || {};
  return {
    level: mon.level ?? 5,
    attack: stats.atk ?? mon.atk ?? 10,
    defense: stats.def ?? mon.def ?? 10,
    spAttack: stats.spa ?? stats.atk ?? mon.atk ?? 10,
    spDefense: stats.spd ?? stats.def ?? mon.def ?? 10,
    speed: stats.spe ?? mon.spd ?? 10,
    maxHp: mon.maxHp ?? mon.hp ?? 20,
    elements: [mon.type || mon.types?.[0] || "NORMAL"] as any,
    stages: { ...ZERO_STAGES },
    status: null,
  } as BattlerInput;
}

export function moveInputFromDb(moveId: string, movesDb: Record<string, any>): (MoveInput & { id: string; name: string }) | null {
  const m = movesDb[moveId];
  if (!m) return null;
  return {
    id: moveId,
    name: m.name || moveId,
    power: m.power ?? 0,
    accuracy: m.accuracy ?? 100,
    category: (m.category || "Physical") as any,
    element: (m.type || "NORMAL") as any,
    priority: m.priority ?? 0,
  };
}

/** The creature-mode field moveset: the creature's known moves, plus
 * the regular attack — PMD's field contract. */
export function overworldMoveset(mon: any, movesDb: Record<string, any>): Array<MoveInput & { id: string; name: string }> {
  const known = (mon.moves || [])
    .map((mid: string) => moveInputFromDb(mid, movesDb))
    .filter(Boolean) as Array<MoveInput & { id: string; name: string }>;
  return [...known, REGULAR_ATTACK];
}

export interface EngagementContext {
  mode: ControlMode;
  /** effective bond band 0..5 of the acting lead (bond reads, #39) */
  bondBand?: number;
  /** habitat fit of the target species for the player's Garden/home:
   * 'home' | 'near' | 'far' — drives recruit (joins) vs catch (cube) */
  habitatFit?: "home" | "near" | "far";
}

export function rangedAction(
  actor: any,
  target: Roamer,
  kind: RangedKind,
  move: (MoveInput & { id: string; name: string }) | null,
  ctx: EngagementContext,
  rng: Rng,
): EngagementOutcome {
  const base: EngagementOutcome = {
    kind,
    damage: 0,
    targetHp: target.hp,
    result: "missed",
    escalates: false,
    note: "",
  };
  if (target.state === "down") return { ...base, result: "refused", note: "It is already down." };

  // --- Ranger mode: approach play only. The Ranger NEVER deals
  // damage personally (canon) — a strike request is refused, not
  // softened.
  if (ctx.mode === "ranger") {
    if (kind === "strike") {
      return { ...base, result: "refused", note: "The Ranger does not strike creatures. Your partner does the fighting — or you throw a cube." };
    }
    if (kind === "lure") return { ...base, result: "lured", note: "It notices you and comes closer, curious." };
    if (kind === "distract") return { ...base, result: "distracted", note: "Its attention turns away from you." };
    // catchAttempt
    const cfg: any = encounterModes as any;
    const chance = cfg.engagement?.catchBaseChance ?? 0.3;
    if (rng() < chance) return { ...base, result: "caught", note: "Caught from range, before it ever reached you." };
    return { ...base, result: "angered", escalates: true, note: "The cube missed its mark — and now it is coming at you." };
  }

  // --- Creature mode: you ARE the creature; your moves are real here.
  if (kind === "catchAttempt") {
    return { ...base, result: "refused", note: "Creatures do not throw cubes. Win it over, or knock it out and see if it joins." };
  }
  if (kind === "lure") return { ...base, result: "lured", note: "You call out; it comes to see what you are." };
  if (kind === "distract") return { ...base, result: "distracted", note: "You feint; its attention slips." };

  // strike
  const mv = move || REGULAR_ATTACK;
  const atk = battlerFromMon(actor);
  const def = battlerFromMon({
    level: target.level,
    hp: target.hp,
    maxHp: target.maxHp,
    stats: { atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
  });
  const res = calculateDamage(atk, def, mv as MoveInput, { rng });
  const damage = Math.max(0, res.damage);
  const hp = Math.max(0, target.hp - damage);
  if (hp > 0) {
    return {
      ...base,
      damage,
      targetHp: hp,
      result: "angered",
      escalates: true,
      note: `Your ${mv.name} lands for ${damage}. It is hurt — and coming at you.`,
    };
  }
  // KO at range: catch-or-recruit resolution (PMD flavour). A creature
  // whose habitat fits your home may JOIN (walks home, T11 housing)
  // instead of being cubed; the roll reads bond band + habitat fit.
  const cfg: any = encounterModes as any;
  const recruitBase = cfg.engagement?.recruitBaseChance ?? 0.18;
  const fitBonus = ctx.habitatFit === "home" ? 0.25 : ctx.habitatFit === "near" ? 0.1 : 0;
  const bondBonus = (ctx.bondBand ?? 0) * 0.04;
  if (rng() < recruitBase + fitBonus + bondBonus) {
    return {
      ...base,
      damage,
      targetHp: 0,
      result: "recruited",
      note: "Knocked out cold — and when it wakes, it follows you home. It joins the Garden.",
    };
  }
  return {
    ...base,
    damage,
    targetHp: 0,
    result: "ko",
    note: "Knocked out before it ever reached you.",
  };
}

/**
 * Contact resolution: a roamer reaches you (or you walk into it).
 * Returns the battle style by the decided rule; the engine starts the
 * classic battle for 'classic', and runs a real-time exchange tick for
 * 'pmd-skirmish'.
 */
export function contactResolution(
  mode: ControlMode,
  place: PlaceContext,
  target: Roamer,
): { style: BattleStyle; stakes: StakesClass } {
  const stakes: StakesClass = target.isAlpha ? "alpha" : "wild";
  return { style: battleStyleFor(mode, place, stakes), stakes };
}
