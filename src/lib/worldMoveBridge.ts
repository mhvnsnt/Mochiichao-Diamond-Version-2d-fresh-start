/**
 * WorldEngine move-profile bridge (AUDIT gap G-B, owner order 2026-10-29).
 *
 * WorldEngine's overworld battles never used the move-animation registry:
 * they resolve moves by DISPLAY NAME through `resolveBattleMove`
 * (damage-only) against the GameData island (`src/world/GameData.ts`,
 * 36 name-keyed moves), while the registry is keyed by stable MOVES_DB
 * ids. Worse, most GameData names are not MOVES_DB display names at
 * all — "Punch", "Jab", "Chrome Claw", "Foam Burst", … have NO stable
 * MOVES_DB id to key a profile to.
 *
 * This bridge is the name→id layer for that path:
 *  - a key that is a MOVES_DB id, or a MOVES_DB display name, resolves
 *    to that move's registry profile (the same profile BattleView uses);
 *  - a GameData-island name with no MOVES_DB counterpart resolves to an
 *    EXPLICITLY REGISTERED NATIVE profile below (composed natively from
 *    the move's own GameData power/type/effect and its name semantics —
 *    no Pokémon source is claimed for these, and none is invented);
 *  - anything else resolves to null. There is NO generic fallback:
 *    `validateWorldMoveCoverage()` fails (and the test locks it) if any
 *    move name WorldEngine can reference ever stops resolving, and the
 *    old silent power-40 fallback in the enemy turn is gone.
 *
 * Reachable name set (what "WorldEngine can reference" means, collected
 * at runtime by collectWorldMoveKeys):
 *  - GAME_DATA.moves keys + GAME_DATA starter/mochiichao move lists;
 *  - every `moves: [...]` array in FullWorldMaps (trainer teams, event
 *    teams, encounter pools);
 *  - MOVES_DB ids and display names (party/wild/trainer-row creatures
 *    built by createMochii carry ids, mapped to display names in the
 *    engine; both forms reach the resolver);
 *  - one documented legacy alias: "Quick Attack", the pre-rename
 *    display name the v5.3 resolveBattleMove comment records on caught
 *    creatures' buttons — the same move as QUICK_ATTACK.
 */
import { GAME_DATA } from "../world/GameData";
import { FULL_WORLD } from "../world/FullWorldMaps";
import { MOVES_DB } from "./moves";
import {
  getMoveAnimation,
  type MoveAnimationEntry,
  type MoveAnimationProfile,
  type MoveDelivery,
  type PerformerClass,
} from "./moveAnimation";

// Same display-type mapping resolveBattleMove has always used for the
// MOVES_DB branches (GameData branches keep the GameData type string).
const TYPE_DISPLAY: Record<string, string> = {
  WATER: 'Water', STEEL: 'Chrome', GROUND: 'Earth', FIRE: 'Flame', GRASS: 'Grass',
};

export const LEGACY_WORLD_MOVE_ALIASES: Record<string, string> = {
  "Quick Attack": "QUICK_ATTACK", // pre-rename display name (see header)
};

// ---------------------------------------------------------------------------
// Native profiles for GameData-island names (no MOVES_DB id exists)
// ---------------------------------------------------------------------------

type NativeSpec = {
  delivery: MoveDelivery;
  particleKind: string;
  projectileShape?: string | null;
  trail?: { kind: string; afterimages: number } | null;
  timeline?: [number, number, number, number, number]; // windup/travel/impact/recoil/recover
  amp?: number; // impact amplitude override (default: power band, as in the registry generator)
  note: string; // why this grammar — recorded, never silent
};

const ANATOMY: Record<MoveDelivery, Record<PerformerClass, string>> = {
  contact_lunge: { standard: "full-body lunge, contact at target edge", heavy: "shorter lunge, deeper impact hold +1 amplitude band", small: "two quick hops into contact", hover: "diving lunge from hover height", rooted: "lean-and-strike from planted base, no travel" },
  blitz_afterimage: { standard: "3 afterimages on a flat streak line", heavy: "2 afterimages, streaks thicker", small: "4 afterimages, tighter spacing", hover: "streaks arc downward from hover", rooted: "streak burst from base, body blurs in place then snaps forward" },
  projectile: { standard: "single origin at mouth/hand anchor", heavy: "larger projectile, slower", small: "smaller, faster projectile", hover: "projectile drops on a slight arc", rooted: "projectile rises from base anchor" },
  beam: { standard: "sustained beam from mouth/hand anchor", heavy: "thicker beam, longer hold", small: "thinner beam, shorter hold", hover: "beam angles down from hover", rooted: "beam sweeps up from base" },
  spread: { standard: "fan of projectiles across target zone", heavy: "denser fan, ground-level", small: "wider, sparser fan", hover: "fan rains downward", rooted: "fan erupts from ground line" },
  multi_hit: { standard: "beats land at even cadence", heavy: "beats slower, each heavier", small: "beats faster, lighter", hover: "beats alternate height", rooted: "beats from planted stance, reach only" },
  field_impact: { standard: "ground shockwave from performer position", heavy: "double shockwave ring", small: "single fast ring", hover: "shockwave only on landing beat", rooted: "strongest form: rooted performer channels the field" },
  self_aura: { standard: "aura ring rises around performer", heavy: "aura pulses twice, slower", small: "quick single pulse", hover: "aura ring tilts with hover bob", rooted: "aura roots into ground lines" },
  status_gaze: { standard: "wave/ray from eyes toward target", heavy: "slower, wider wave", small: "fast narrow wave", hover: "wave angles down", rooted: "wave travels along ground" },
  status_cloud: { standard: "cloud drifts to target and settles", heavy: "bigger cloud, longer settle", small: "small fast puffs", hover: "cloud sheds downward", rooted: "cloud boils up from base" },
  charge_release: { standard: "charge hold (turn 1) then category release", heavy: "longer charge glow", small: "shorter charge glow", hover: "rises while charging", rooted: "sinks/roots while charging" },
  drain_link: { standard: "link stream target->performer on impact", heavy: "thicker stream", small: "thin fast stream", hover: "stream arcs", rooted: "stream runs along ground" },
  protect_wall: { standard: "wall flashes up in front of performer", heavy: "wider wall", small: "narrow wall, faster flash", hover: "wall tilts to face attacker", rooted: "wall anchored to ground" },
};

const DELIVERY_TIMELINES: Record<string, [number, number, number, number, number]> = {
  blitz_afterimage: [80, 170, 50, 220, 260],
  beam: [300, 380, 120, 260, 430],
  field_impact: [350, 60, 140, 340, 600],
  multi_hit: [200, 300, 90, 420, 480],
  self_aura: [400, 0, 100, 0, 500],
  protect_wall: [400, 0, 100, 0, 500],
  status_gaze: [250, 450, 100, 0, 400],
  status_cloud: [250, 450, 100, 0, 400],
  charge_release: [600, 300, 120, 260, 410],
  contact_lunge: [250, 450, 90, 300, 400],
  projectile: [250, 450, 90, 300, 400],
  spread: [250, 450, 90, 300, 400],
  drain_link: [250, 450, 90, 300, 400],
};

const PARTICLE_COUNT: Record<string, number> = {
  projectile: 1, beam: 1, spread: 5, multi_hit: 3, contact_lunge: 8, blitz_afterimage: 4,
  field_impact: 12, self_aura: 8, status_gaze: 3, status_cloud: 7, charge_release: 6,
  drain_link: 5, protect_wall: 2,
};

const SOUND_BY_DELIVERY: Record<string, string> = {
  contact_lunge: "hit.body", blitz_afterimage: "speed.blitz", projectile: "proj", beam: "beam",
  spread: "spread", multi_hit: "hit.multi", field_impact: "field.quake", self_aura: "buff.rise",
  status_gaze: "status.wave", status_cloud: "status.cloud", charge_release: "charge.release",
  drain_link: "drain.stream", protect_wall: "guard.wall",
};

/**
 * The native register. Keys are GameData display names; power/type/effect
 * are read from GAME_DATA at resolution time (single source), so this
 * table carries only the ANIMATION grammar and its justification.
 */
export const WORLD_NATIVE_MOVE_SPECS: Record<string, NativeSpec> = {
  "Aqua Blast":    { delivery: "projectile", particleKind: "orb", projectileShape: "orb", note: "pressurised water shot — the registry's projectile grammar (cf. Aqua Shot), bigger power band." },
  "Aura Burst":    { delivery: "spread", particleKind: "aura_shards", projectileShape: "burst_fan", note: "a burst, not a shot: fan of aura shards across the target zone." },
  "Chrome Claw":   { delivery: "contact_lunge", particleKind: "impact_star", note: "a claw is a contact strike; chrome palette comes from its GameData type. NOT Metal Claw/Iron Claw — no MOVES_DB id claims it." },
  "Chrome Guard":  { delivery: "self_aura", particleKind: "aura_motes", note: "power 0, effect def+2 on the user — the registry's self-aura grammar for self stat raises (cf. Charge Up)." },
  "Chrome Screech":{ delivery: "status_gaze", particleKind: "sound_wave", note: "power 0, foe def-2 delivered as a screech — status wave with sound particles (cf. the registry's screech reading)." },
  "Claw":          { delivery: "contact_lunge", particleKind: "impact_star", timeline: [180, 320, 70, 240, 330], note: "a slash, quicker and lighter than Tackle's full-body charge — its own timeline, not Tackle's." },
  "Crush":         { delivery: "contact_lunge", particleKind: "impact_star", amp: 7, note: "deep-sea crush: contact with a heavy impact band above its power band." },
  "Dark Tide":     { delivery: "spread", particleKind: "tide_wave", projectileShape: "burst_fan", note: "a tide rolls across the zone — spread fan, umbral palette." },
  "Data Rend":     { delivery: "beam", particleKind: "beam_core", note: "rending data beam, sustained — beam grammar." },
  "Draco Tail":    { delivery: "contact_lunge", particleKind: "impact_star", timeline: [280, 420, 90, 300, 400], note: "a tail sweep: slower windup than a body lunge, contact at the tail's arc." },
  "Foam Burst":    { delivery: "projectile", particleKind: "orb", projectileShape: "burst_fan", note: "foam bursts wide — burst-fan projectile (the Pixi burst_fan shape), light power band." },
  "Frost Blast":   { delivery: "projectile", particleKind: "frost_shard", projectileShape: "orb", note: "a blasted frost shard; palette stays its GameData Water colour — the name's frost is in the particle, not a re-typing." },
  "Ink Splash":    { delivery: "projectile", particleKind: "glob", projectileShape: "glob", note: "ink travels as globs (the registry's glob shape), not a clean orb." },
  "Jab":           { delivery: "contact_lunge", particleKind: "impact_star", timeline: [120, 220, 60, 200, 300], note: "a jab is the fast light contact strike — shortest timeline in the bridge; distinct from Punch and from Swift Movement's blitz." },
  "Mosquito Bite": { delivery: "drain_link", particleKind: "drain_stream", note: "a mosquito bite drains — the drain-link grammar family of Leech Bite/Drain Bite, by name semantics." },
  "Mythic Pulse":  { delivery: "beam", particleKind: "beam_core", note: "a pulse at 120 power reads as a sustained beam (the generator's pulse→beam reading for Special moves)." },
  "Night Stealth": { delivery: "blitz_afterimage", particleKind: "streak_spark", trail: { kind: "shadow_streaks", afterimages: 2 }, note: "stealth strike from cover — blitz grammar with a shadow trail and 2 afterimages; Swift Movement is speed_streaks ×3 at a different palette." },
  "Punch":         { delivery: "contact_lunge", particleKind: "impact_star", timeline: [220, 380, 90, 280, 380], note: "the plain fist strike: mid timeline between Jab (fast) and Tackle (full-body, 1490ms)." },
  "Quantum Strike":{ delivery: "contact_lunge", particleKind: "quantum_spark", note: "'Strike' is a contact word; quantum sparks mark it as Mythic, not a plain punch." },
  "Reap Claw":     { delivery: "contact_lunge", particleKind: "impact_star", timeline: [300, 430, 110, 320, 430], amp: 8, note: "the heaviest claw in the island set: 100 power, top impact band, long reap timeline." },
  "Rockfall":      { delivery: "field_impact", particleKind: "ground_ring", note: "rocks fall on the field at the target's feet — field-impact grammar (cf. Stone Slide)." },
  "Rumble":        { delivery: "status_gaze", particleKind: "rumble_wave", note: "power 0, foe atk-1: a ground rumble the target feels — status wave, no damage impact." },
  "Scoop Slam":    { delivery: "contact_lunge", particleKind: "impact_star", timeline: [350, 420, 110, 320, 430], amp: 7, note: "scoop, lift, slam: the longest windup in the set — visibly NOT Body Slam (1490ms, amp 7, different cadence)." },
  "Shell Burst":   { delivery: "spread", particleKind: "shell_shards", projectileShape: "shards", amp: 3, note: "shell fragments burst outward in a fan; power 0 in GameData, so the impact band stays small — presentation only, damage unchanged." },
  "Stare Down":    { delivery: "status_gaze", particleKind: "gaze_ray", note: "power 0, foe def-1 by staring — gaze ray, the registry's leer/glare reading." },
  "Tail Flick":    { delivery: "status_gaze", particleKind: "wave_ring", note: "power 0, foe def-1: a flicking distraction delivered as a status wave — it deals no damage, so it must not lunge." },
  "Water Jet":     { delivery: "beam", particleKind: "beam_core", note: "a jet is a sustained stream, not a projectile — beam grammar at the top power band." },
  "Water Surge":   { delivery: "projectile", particleKind: "orb", projectileShape: "orb", note: "a surging mass of water hurled whole — single large orb (cf. Water Orb's shape, different timeline/palette band)." },
  "Wave":          { delivery: "spread", particleKind: "tide_wave", projectileShape: "burst_fan", note: "a wave breaks across the target zone — spread fan." },
  "Web Blast":     { delivery: "status_gaze", particleKind: "web_strands", note: "power 0, foe spd-2: strands travel and bind — the registry's WEB_SHOT status-gaze grammar." },
};

function slugify(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function cyrb53(str: string, seed = 7): string {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")).slice(0, 12);
}

const GAME_TYPE_COLORS: Record<string, string> = {
  Water: "#4fc3f7", Chrome: "#90a4ae", Earth: "#81c784", Bug: "#aed581",
  Umbral: "#9575cd", Aero: "#80deea", Core: "#ffb74d", Strike: "#ef9a9a",
  Deep: "#283593", Flame: "#ff7043", Mythic: "#ffd700", Normal: "#bcaaa4",
};

function buildNativeProfile(name: string, gd: { power: number; type: string; effect?: string }): MoveAnimationProfile {
  const spec = WORLD_NATIVE_MOVE_SPECS[name];
  const bp = gd.power ?? 0;
  const amp = spec.amp ?? (bp < 50 ? 3 : bp < 90 ? 5 : bp < 120 ? 7 : 8);
  const tl = spec.timeline ?? DELIVERY_TIMELINES[spec.delivery];
  const total = tl.reduce((a, b) => a + b, 0);
  const profile: MoveAnimationProfile = {
    delivery: spec.delivery,
    timelineMs: { windup: tl[0], travel: tl[1], impactHold: tl[2], recoil: tl[3], recover: tl[4], total },
    phaseFractions: {
      travelComplete: tl[1] === 0 ? +(tl[0] / total).toFixed(3) : +((tl[0] + tl[1]) / total).toFixed(3),
      impactAt: +((tl[0] + tl[1] + tl[2]) / total).toFixed(3),
    },
    impact: {
      amplitudePx: amp,
      shake: spec.delivery === "field_impact" ? "quake" : amp >= 7 ? "heavy" : amp >= 4 ? "light" : "soft",
      flash: "type",
      particleKind: spec.particleKind,
      particleCount: spec.delivery === "self_aura" && (gd.effect || "").endsWith("+2") ? 12 : PARTICLE_COUNT[spec.delivery],
      burstCount: 4 + amp,
      statusPuff: null,
      beats: spec.delivery === "multi_hit" ? 3 : 0,
      hitCount: null,
    },
    trail: spec.trail ?? null,
    projectileShape: spec.projectileShape ?? null,
    camera: spec.delivery === "field_impact" ? "quake_shake" : spec.delivery === "blitz_afterimage" ? "snap_zoom" : spec.delivery === "beam" ? "push_in" : "none",
    soundCue: `${SOUND_BY_DELIVERY[spec.delivery]}.world_${slugify(name).toLowerCase()}`,
    targetReaction: amp >= 7 ? "recoil_heavy" : "recoil_standard",
    palette: GAME_TYPE_COLORS[gd.type] || "#ffffff",
    anatomyVariance: ANATOMY[spec.delivery],
    signature: "",
  };
  profile.signature = "w" + cyrb53(JSON.stringify({ ...profile, signature: undefined }));
  return profile;
}

function nativeEntry(name: string, gd: { power: number; type: string; effect?: string }): MoveAnimationEntry {
  const spec = WORLD_NATIVE_MOVE_SPECS[name];
  return {
    id: `WORLD_${slugify(name)}`,
    displayName: name,
    sourcePokemonMove: null,
    sourceBasis: "native-registered (WorldEngine bridge 2026-10-30: GameData-island move with no MOVES_DB id; profile composed natively from its GameData power/type/effect and name semantics — no Pokémon source claimed)",
    legacyAnimField: "none — the GameData island has no anim field; presentation was the shared attack CSS for every move",
    type: gd.type,
    category: (gd.power ?? 0) === 0 ? "Status" : (spec.delivery === "contact_lunge" || spec.delivery === "blitz_afterimage" || spec.delivery === "multi_hit") ? "Physical" : "Special",
    power: gd.power ?? 0,
    effect: gd.effect || "NONE",
    categoryAdaptation: "GameData carries no category; the category above is inferred from the delivery grammar for presentation only — damage/type resolution is unchanged.",
    profile: buildNativeProfile(name, gd),
  };
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

export interface WorldMoveResolution {
  key: string;
  /** Stable id the profile is keyed by: a MOVES_DB id, or WORLD_<NAME> for native island moves. */
  moveId: string;
  display: string;
  /** Damage power/type exactly as the pre-bridge resolveBattleMove returned them. */
  power: number;
  type: string;
  kind: "moves_db" | "native";
  entry: MoveAnimationEntry;
  profile: MoveAnimationProfile;
}

const MOVES_BY_DISPLAY = new Map<string, string>();
for (const [id, m] of Object.entries(MOVES_DB as Record<string, { name: string }>)) {
  const k = m.name.toLowerCase();
  if (!MOVES_BY_DISPLAY.has(k)) MOVES_BY_DISPLAY.set(k, id);
}

export function resolveWorldMove(moveKey: string | undefined | null): WorldMoveResolution | null {
  if (!moveKey) return null;
  const key = String(moveKey);
  const gdMoves: Record<string, any> = (GAME_DATA as any).moves || {};
  const gd = gdMoves[key];

  // 1) MOVES_DB by stable id (party/wild creatures carry ids).
  const dbById: any = (MOVES_DB as any)[key];
  if (dbById) {
    const entry = getMoveAnimation(key);
    if (!entry) return null;
    return {
      key, moveId: key, display: dbById.name,
      power: gd ? gd.power : dbById.bp,
      type: gd ? gd.type : (TYPE_DISPLAY[dbById.type] || dbById.type),
      kind: "moves_db", entry, profile: entry.profile,
    };
  }
  // 2) Documented legacy alias (pre-rename display name).
  const aliasId = LEGACY_WORLD_MOVE_ALIASES[key];
  if (aliasId) {
    const entry = getMoveAnimation(aliasId);
    const db: any = (MOVES_DB as any)[aliasId];
    if (entry && db) {
      return { key, moveId: aliasId, display: db.name, power: db.bp, type: TYPE_DISPLAY[db.type] || db.type, kind: "moves_db", entry, profile: entry.profile };
    }
  }
  // 3) GameData island name with a registered native profile. This runs
  // BEFORE the display-name branch (move-completion composition,
  // 2026-10-29): four batch-3 registry-locked display names — Chrome
  // Screech (METAL_SOUND), Draco Tail (DRAGON_TAIL), Frost Blast
  // (ICE_BEAM), Mosquito Bite (BUG_BITE) — collide with island natives
  // of the same name. Name-keyed lookups in WorldEngine are island
  // references (map teams, GameData lists), and before the pool landed
  // the native was the only resolution for them; it keeps precedence so
  // an island move can never silently borrow a different move's
  // animation. The pool moves stay reachable by their stable ids
  // (branch 1), which is how party creatures carry them. Renaming
  // either side of the collision is the owner's naming pass, not this
  // bridge's call — the collision is recorded in the move-completion
  // census.
  if (gd && WORLD_NATIVE_MOVE_SPECS[key]) {
    const entry = nativeEntry(key, gd);
    return { key, moveId: entry.id, display: key, power: gd.power, type: gd.type, kind: "native", entry, profile: entry.profile };
  }
  // 4) MOVES_DB by display name (caught/wild/map-mapped creatures carry names).
  const byDisplay = MOVES_BY_DISPLAY.get(key.toLowerCase());
  if (byDisplay) {
    const entry = getMoveAnimation(byDisplay);
    const db: any = (MOVES_DB as any)[byDisplay];
    if (entry && db) {
      return {
        key, moveId: byDisplay, display: db.name,
        power: gd ? gd.power : db.bp,
        type: gd ? gd.type : (TYPE_DISPLAY[db.type] || db.type),
        kind: "moves_db", entry, profile: entry.profile,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Reachable name set + coverage validation
// ---------------------------------------------------------------------------

export function collectWorldMoveKeys(): string[] {
  const keys = new Set<string>();
  const gd: any = GAME_DATA as any;
  for (const k of Object.keys(gd.moves || {})) keys.add(k);
  for (const mon of [...(gd.starters || []), ...(gd.mochiichao || [])]) {
    for (const m of mon.moves || []) keys.add(m);
  }
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    for (const [k, val] of Object.entries(v)) {
      if (k === "moves" && Array.isArray(val)) {
        for (const m of val) if (typeof m === "string") keys.add(m);
      } else walk(val);
    }
  };
  walk(FULL_WORLD);
  for (const [id, m] of Object.entries(MOVES_DB as Record<string, { name: string }>)) {
    keys.add(id);
    keys.add(m.name);
  }
  for (const alias of Object.keys(LEGACY_WORLD_MOVE_ALIASES)) keys.add(alias);
  return [...keys].sort();
}

const DELIVERIES = new Set<string>([
  "contact_lunge", "blitz_afterimage", "projectile", "beam", "spread", "multi_hit",
  "field_impact", "self_aura", "status_gaze", "status_cloud", "charge_release",
  "drain_link", "protect_wall",
]);

export function validateWorldMoveCoverage(): string[] {
  const problems: string[] = [];
  const keys = collectWorldMoveKeys();
  const nativeSigs = new Map<string, string>();
  const registrySigs = new Set<string>();
  for (const id of Object.keys(MOVES_DB)) {
    const e = getMoveAnimation(id);
    if (e) registrySigs.add(e.profile.signature);
  }
  for (const key of keys) {
    const r = resolveWorldMove(key);
    if (!r) { problems.push(`${key}: WorldEngine move name does not resolve — no profile, no fallback allowed`); continue; }
    const p = r.profile;
    if (!p || !DELIVERIES.has(p.delivery) || !p.signature || p.timelineMs.total <= 0) {
      problems.push(`${key}: resolved profile is a generic fallback or empty`);
    }
    if (r.kind === "moves_db") {
      const reg = getMoveAnimation(r.moveId);
      if (!reg || reg.profile.signature !== p.signature) problems.push(`${key}: bridge profile differs from the BattleView registry profile for ${r.moveId}`);
    } else {
      if (registrySigs.has(p.signature)) problems.push(`${key}: native profile signature collides with a registry profile`);
      const prev = nativeSigs.get(p.signature);
      if (prev) problems.push(`${key}: native profile signature shared with ${prev} (each island move needs its own animation)`);
      nativeSigs.set(p.signature, key);
    }
  }
  // Every native spec must be backed by a real GameData move (no orphan specs).
  for (const name of Object.keys(WORLD_NATIVE_MOVE_SPECS)) {
    if (!(GAME_DATA as any).moves?.[name]) problems.push(`${name}: native spec has no GameData move behind it`);
  }
  return problems;
}

// ---------------------------------------------------------------------------
// DOM presentation for WorldEngine's billboard battle (the Pixi canvas is
// BattleView's renderer; WorldEngine battles render as DOM billboards, so
// the same profile fields drive CSS keyframes here: delivery, canonical
// timeline + phase fractions, impact amplitude, palette, trail/particle
// counts and projectile shape — the same inputs PixiBattleCanvas reads).
// ---------------------------------------------------------------------------

export type WorldFxKind = "none" | "travel" | "beam" | "field" | "self" | "beats" | "ghosts";

export interface WorldAttackPresentation {
  durationMs: number;
  delivery: MoveDelivery;
  palette: string;
  cssText: string;
  attackerAnimation: string;
  targetAnimation: string;
  fxKind: WorldFxKind;
  fxCount: number;
  fxSpanStyle: (i: number) => Record<string, string | number>;
}

const ANCHOR = {
  player: { x: 20, y: 58 },
  enemy: { x: 76, y: 24 },
};

export function buildWorldAttackPresentation(
  side: "player" | "enemy",
  profile: MoveAnimationProfile,
  power: number,
  nonce: number,
): WorldAttackPresentation {
  const dur = profile.timelineMs.total;
  const travelPct = Math.round(profile.phaseFractions.travelComplete * 100);
  const impactPct = Math.round(profile.phaseFractions.impactAt * 100);
  const windupPct = Math.round((profile.timelineMs.windup / dur) * 100);
  const impactMs = Math.round(profile.phaseFractions.impactAt * dur);
  const a = ANCHOR[side];
  const t = ANCHOR[side === "player" ? "enemy" : "player"];
  const dx = side === "player" ? 110 : -110;
  const dy = side === "player" ? -50 : 50;
  const amp = Math.max(2, profile.impact.amplitudePx);
  const palette = profile.palette || "#ffffff";
  const d = profile.delivery;

  const stays = d === "projectile" || d === "beam" || d === "spread" || d === "multi_hit" ||
    d === "field_impact" || d === "drain_link" || d === "status_gaze" || d === "status_cloud";
  const selfKind = d === "self_aura" || d === "protect_wall";

  let attackerKf: string;
  if (selfKind) {
    attackerKf = `@keyframes weAtk${nonce}{0%{transform:scale(1)}${Math.max(10, windupPct)}%{transform:scale(1.05)}55%{transform:scale(1.13)}100%{transform:scale(1)}}`;
  } else if (!stays) {
    // contact_lunge / blitz_afterimage / charge_release: travel to contact
    // by the profile's own travelComplete fraction (Swift Movement's blitz
    // profile completes at ~32%, Tackle's lunge at ~47% — different cadence).
    attackerKf = `@keyframes weAtk${nonce}{0%{transform:translate(0,0) scale(1)}${travelPct}%{transform:translate(${dx}px,${dy}px) scale(1.03)}${impactPct}%{transform:translate(${dx}px,${dy}px) scale(1.06)}${Math.min(98, impactPct + 9)}%{transform:translate(${Math.round(dx * 0.85)}px,${Math.round(dy * 0.85)}px) scale(1.01)}100%{transform:translate(0,0) scale(1)}}`;
  } else {
    attackerKf = `@keyframes weAtk${nonce}{0%{transform:scale(1)}${Math.max(10, windupPct)}%{transform:scale(1.07)}${impactPct}%{transform:scale(1.02)}100%{transform:scale(1)}}`;
  }

  let targetKf = "";
  let targetAnimation = "none";
  if (!selfKind) {
    if (power > 0) {
      targetKf = `@keyframes weHit${nonce}{0%,${impactPct}%{transform:translate(0,0);filter:brightness(1)}${Math.min(97, impactPct + 4)}%{transform:translate(${side === "player" ? amp : -amp}px,0);filter:brightness(1.9)}${Math.min(99, impactPct + 10)}%{transform:translate(${side === "player" ? -Math.round(amp / 2) : Math.round(amp / 2)}px,0);filter:brightness(1.2)}100%{transform:translate(0,0);filter:brightness(1)}}`;
    } else {
      targetKf = `@keyframes weHit${nonce}{0%,${impactPct}%{transform:scale(1);opacity:1}${Math.min(97, impactPct + 6)}%{transform:scale(0.94);opacity:0.72}100%{transform:scale(1);opacity:1}}`;
    }
    targetAnimation = `weHit${nonce} ${dur}ms ease-out both`;
  }

  let fxKind: WorldFxKind = "none";
  let fxCount = 0;
  let fxKf = "";
  let fxBase: Record<string, string | number> = {};
  let fxDelay: (i: number) => number = () => 0;

  if (d === "blitz_afterimage") {
    fxKind = "ghosts";
    fxCount = profile.trail?.afterimages ?? 3;
    fxKf = `@keyframes weFx${nonce}{0%{opacity:0}25%{opacity:0.45}100%{opacity:0}}`;
    fxBase = { width: 54, height: 64, borderRadius: "50%", background: palette };
    fxDelay = (i) => Math.round(profile.timelineMs.travel * [0.3, 0.55, 0.8, 0.9][i] || 0);
  } else if (d === "beam") {
    fxKind = "beam";
    fxCount = 1;
    fxKf = `@keyframes weFx${nonce}{0%{width:0;opacity:0}${windupPct}%{width:0;opacity:1}${travelPct}%{width:52%;opacity:1}${Math.min(99, impactPct + 8)}%{width:52%;opacity:0}100%{width:52%;opacity:0}}`;
    fxBase = {
      height: 10, borderRadius: 5, background: palette, boxShadow: `0 0 12px ${palette}`,
      transformOrigin: "left center", transform: side === "player" ? "rotate(-13deg)" : "rotate(167deg)",
    };
  } else if (d === "field_impact") {
    fxKind = "field";
    fxCount = 1;
    fxKf = `@keyframes weFx${nonce}{0%,${impactPct}%{transform:scale(0.3);opacity:0}${Math.min(96, impactPct + 6)}%{opacity:0.95}${Math.min(99, impactPct + 30)}%{transform:scale(1.7);opacity:0}100%{transform:scale(1.7);opacity:0}}`;
    fxBase = { width: 132, height: 38, borderRadius: "50%", border: `4px solid ${palette}`, background: "transparent" };
  } else if (selfKind) {
    fxKind = "self";
    fxCount = 1;
    fxKf = `@keyframes weFx${nonce}{0%{transform:scale(0.6);opacity:0}35%{opacity:0.9}100%{transform:scale(1.35);opacity:0}}`;
    fxBase = d === "protect_wall"
      ? { width: 16, height: 132, borderRadius: 6, background: palette, boxShadow: `0 0 14px ${palette}` }
      : { width: 124, height: 124, borderRadius: "50%", border: `3px solid ${palette}`, background: "transparent" };
  } else if (d === "multi_hit") {
    fxKind = "beats";
    fxCount = Math.max(2, profile.impact.beats || 3);
    fxKf = `@keyframes weFx${nonce}{0%{opacity:0;transform:scale(0.6)}30%{opacity:0.95}100%{opacity:0;transform:scale(1.25)}}`;
    fxBase = { width: 48, height: 48, borderRadius: "50%", background: "#ffffff", boxShadow: `0 0 16px ${palette}` };
    const spacing = Math.round((dur * 0.26) / fxCount);
    fxDelay = (i) => impactMs + i * spacing;
  } else if (stays) {
    fxKind = "travel";
    const shape = profile.projectileShape;
    fxCount = d === "spread" ? 5 : d === "status_cloud" ? 5 : d === "status_gaze" ? 3 : d === "drain_link" ? 5
      : shape === "burst_fan" ? 3 : shape === "glob" ? 2 : 1;
    const from = d === "drain_link" ? t : a;
    const to = d === "drain_link" ? a : t;
    fxKf = `@keyframes weFx${nonce}{0%{left:${from.x}%;top:${from.y}%;opacity:0}${Math.max(4, windupPct)}%{opacity:1}${travelPct}%{left:${to.x}%;top:${to.y}%;opacity:1}${Math.min(99, travelPct + 10)}%{left:${to.x}%;top:${to.y}%;opacity:0}100%{left:${to.x}%;top:${to.y}%;opacity:0}}`;
    const size = d === "status_cloud" ? 22 : d === "status_gaze" ? 26 : shape === "pellet" ? 24 : shape === "glob" ? 22 : 16;
    fxBase = {
      width: size, height: size, borderRadius: "50%",
      background: d === "status_gaze" ? "transparent" : palette,
      border: d === "status_gaze" ? `2px solid ${palette}` : undefined,
      boxShadow: `0 0 10px ${palette}`,
    };
    fxDelay = (i) => i * (d === "status_cloud" || d === "drain_link" ? 60 : 45);
  }

  const fxSpanStyle = (i: number): Record<string, string | number> => {
    if (fxKind === "none") return { display: "none" };
    const style: Record<string, string | number> = {
      position: "absolute", pointerEvents: "none", ...fxBase,
    };
    if (fxKind === "travel" || fxKind === "beam") {
      style.left = `${a.x}%`; style.top = `${a.y}%`;
      style.animation = `weFx${nonce} ${dur}ms linear ${fxDelay(i)}ms both`;
    } else if (fxKind === "field" || fxKind === "beats") {
      style.left = `calc(${t.x}% - 24px)`; style.top = `calc(${t.y}% - 10px)`;
      if (fxKind === "field") { style.left = `calc(${t.x}% - 66px)`; style.top = `calc(${t.y}% + 12px)`; }
      style.animation = fxKind === "field"
        ? `weFx${nonce} ${dur}ms ease-out both`
        : `weFx${nonce} 160ms ease-out ${fxDelay(i)}ms both`;
      style.opacity = 0;
    } else if (fxKind === "self") {
      style.left = `calc(${a.x}% - ${d === "protect_wall" ? 8 : 62}px)`;
      style.top = `calc(${a.y}% - ${d === "protect_wall" ? 66 : 62}px)`;
      style.animation = `weFx${nonce} ${dur}ms ease-out both`;
      style.opacity = 0;
    } else if (fxKind === "ghosts") {
      const f = [0.3, 0.55, 0.8, 0.9][i] ?? 0.5;
      style.left = `${a.x + (t.x - a.x) * f}%`;
      style.top = `${a.y + (t.y - a.y) * f}%`;
      style.animation = `weFx${nonce} 300ms ease-out ${fxDelay(i)}ms both`;
      style.opacity = 0;
    }
    return style;
  };

  return {
    durationMs: dur,
    delivery: d,
    palette,
    cssText: attackerKf + targetKf + fxKf,
    attackerAnimation: `weAtk${nonce} ${dur}ms ease-out both`,
    targetAnimation,
    fxKind,
    fxCount,
    fxSpanStyle,
  };
}
