import { Move } from "./types";
import { MOCHIICHAO_MOVES_NEW } from "./generated/mochiichao_moves_catalogue";
import { MOCHIICHAO_FULLPOOL_MOVES } from "./generated/fullpool_moves_catalogue";

// Batch 2 (roster-wins, landed on main via PR #205 as staged data):
// 84 catalogue moves merged live 2026-10-27 (wiring lane). Names are
// Mochiichao originals — validated zero key overlap and zero name
// overlap with the 37 live moves. The cast is a type-level narrowing
// only: every entry's fields were validated against the Move interface
// by validate.py at ingest and by moves-batch2.test.ts here (ranges,
// categories, types, effectChance). The generated catalogue file is
// left untouched so its provenance stays clean.
const MOVES_BATCH2: Record<string, Move> =
  MOCHIICHAO_MOVES_NEW as Record<string, Move>;

// Batch 3 (full move pool, owner order 2026-10-29; composed into the
// landing base by the move-completion lane): every Pokemon move not
// already live — 758 catalogue rows keyed by stable pool id (the source
// move constant; ids never renumber), generated from the BW2 decomp
// table + the PokeAPI pull. The full registry (stats provenance,
// machine classes, animation profiles, per-anatomy variance) is
// src/lib/generated/fullMovePool.json (919 rows: the 758 here + the 106
// pool rows a live game row already represents + the 55 variant
// executions, which resolve profiles but stay out of MOVES_DB).
const MOVES_FULLPOOL: Record<string, Move> =
  MOCHIICHAO_FULLPOOL_MOVES as Record<string, Move>;

export const MOVES_DB: Record<string, Move> = {
  // ── WATER ─────────────────────────────────────────────────
  AQUA_SHOT:      { name:"Aqua Shot",       type:"WATER",    cat:"Special",  bp:40,  acc:100, pp:25, pri:0, effect:"NONE",        effectChance:0,      desc:"A small ball of water hurled at the foe." },
  AQUA_CANNON:    { name:"Aqua Cannon",     type:"WATER",    cat:"Special",  bp:90,  acc:100, pp:15, pri:0, effect:"NONE",        effectChance:0,    desc:"A powerful pressurized water blast." },
  HYDRO_SURGE:    { name:"Hydro Surge",     type:"WATER",    cat:"Special",  bp:120, acc:80,  pp:5,  pri:0, effect:"NONE",        effectChance:0,    desc:"An immense rush of water. Powerful but inaccurate." },
  AQUA_JET:       { name:"Hydro Rush",      type:"WATER",    cat:"Physical", bp:40,  acc:100, pp:20, pri:1, effect:"NONE",        effectChance:0,      desc:"Moves first with a coating of water." },
  WATER_ORB:      { name:"Water Orb",       type:"WATER",    cat:"Special",  bp:80,  acc:100, pp:15, pri:0, effect:"SPDEF_DOWN1", effectChance:20,      desc:"Forms an orb of water in both hands and hurls it. Never misses. May lower Sp.Def." },
  // ── FIRE ──────────────────────────────────────────────────
  EMBER_TOSS:     { name:"Ember Toss",      type:"FIRE",     cat:"Special",  bp:40,  acc:100, pp:25, pri:0, effect:"BURN",        effectChance:10,     desc:"A weak fire attack. May cause burn." },
  FIRE_STREAM:    { name:"Fire Stream",     type:"FIRE",     cat:"Special",  bp:90,  acc:100, pp:15, pri:0, effect:"BURN",        effectChance:10,    desc:"A sustained jet of fire. May burn." },
  INFERNO_WAVE:   { name:"Inferno Wave",    type:"FIRE",     cat:"Special",  bp:110, acc:85,  pp:10, pri:0, effect:"BURN",        effectChance:30,   desc:"Engulfs the target in a roaring inferno." },
  FIRE_PUNCH_MOVE:{ name:"Fire Punch",      type:"FIRE",     cat:"Physical", bp:75,  acc:100, pp:15, pri:0, effect:"BURN",        effectChance:10,desc:"A fiery punch. May burn." },
  // ── GRASS ─────────────────────────────────────────────────
  PETAL_BARRAGE:  { name:"Petal Barrage",   type:"GRASS",    cat:"Special",  bp:80,  acc:100, pp:15, pri:0, effect:"NONE",        effectChance:0,  desc:"Pelts the foe with a shower of petals." },
  SOLAR_BLAST:    { name:"Solar Blast",     type:"GRASS",    cat:"Special",  bp:120, acc:100, pp:10, pri:0, effect:"CHARGE_TURN", effectChance:100,    desc:"Charges solar energy then fires a beam." },
  RAZOR_LEAF:     { name:"Leaf Blast",      type:"GRASS",    cat:"Physical", bp:55,  acc:95,  pp:25, pri:0, effect:"HIGH_CRIT",   effectChance:0,  desc:"Launches sharp leaves. High critical-hit rate." },
  VINE_LASH:      { name:"Vine Lash",       type:"GRASS",    cat:"Physical", bp:45,  acc:100, pp:25, pri:0, effect:"NONE",        effectChance:0,      desc:"Lashes the foe with long vines." },
  // ── ELECTRIC ──────────────────────────────────────────────
  SPARK_SHOT:     { name:"Spark Shot",      type:"ELECTRIC", cat:"Special",  bp:40,  acc:100, pp:25, pri:0, effect:"PARALYSIS",   effectChance:10,     desc:"A small electric jolt. May paralyze." },
  THUNDER_BOLT:   { name:"Thunderbolt",     type:"ELECTRIC", cat:"Special",  bp:90,  acc:100, pp:15, pri:0, effect:"PARALYSIS",   effectChance:10,   desc:"A strong electric bolt. May paralyze." },
  WILD_CHARGE:    { name:"Wild Charge",     type:"ELECTRIC", cat:"Physical", bp:90,  acc:100, pp:15, pri:0, effect:"RECOIL_25",   effectChance:100,   desc:"Charges with electric energy. Deals recoil." },
  // ── STEEL ─────────────────────────────────────────────────
  METAL_STRIKE:   { name:"Metal Strike",    type:"STEEL",    cat:"Physical", bp:50,  acc:100, pp:35, pri:0, effect:"NONE",        effectChance:0,   desc:"A basic steel attack." },
  IRON_BARRAGE:   { name:"Iron Barrage",    type:"STEEL",    cat:"Physical", bp:35,  acc:100, pp:15, pri:0, effect:"MULTI_HIT",   effectChance:0,   desc:"Fires 2–5 iron shards." }, // changed to bp 35 standard
  FLASH_CANNON_MOVE:{ name:"Flash Cannon",  type:"STEEL",    cat:"Special",  bp:80,  acc:100, pp:10, pri:0, effect:"SPDEF_DOWN1", effectChance:10,desc:"Fires a flash of steel light. May lower Sp.Def." },
  // ── GROUND ────────────────────────────────────────────────
  EARTH_TREMOR:   { name:"Tremor",          type:"GROUND",   cat:"Physical", bp:100, acc:100, pp:10, pri:0, effect:"NONE",        effectChance:0,   desc:"Shakes the ground to hit all adjacent foes." },
  MUD_BLAST:      { name:"Mud Blast",       type:"GROUND",   cat:"Physical", bp:55,  acc:95,  pp:15, pri:0, effect:"ACC_DOWN1",   effectChance:30,      desc:"Hurls mud at foe. May lower accuracy." },
  EARTH_POWER:    { name:"Earth Power",     type:"GROUND",   cat:"Special",  bp:90,  acc:100, pp:10, pri:0, effect:"SPDEF_DOWN1", effectChance:10,   desc:"Energy bursts from the earth. May lower Sp.Def." },
  BULLDOZE:       { name:"Bulldoze",        type:"GROUND",   cat:"Physical", bp:60,  acc:100, pp:20, pri:0, effect:"SPE_DOWN1",   effectChance:100,   desc:"Stomps on the ground to lower foe's Speed." },
  // ── GHOST / DARK ──────────────────────────────────────────
  SHADOW_PULSE:   { name:"Dark Wave",       type:"GHOST",    cat:"Special",  bp:80,  acc:100, pp:15, pri:0, effect:"FLINCH",      effectChance:20,   desc:"Shadow ball that may cause flinch." },
  DARK_PULSE_MOVE:{ name:"Dark Pulse",      type:"DARK",     cat:"Special",  bp:80,  acc:100, pp:15, pri:0, effect:"FLINCH",      effectChance:20,desc:"Pulse of dark energy. May flinch." },
  NIGHT_SLASH_MOVE:{ name:"Night Slash",    type:"DARK",     cat:"Physical", bp:70,  acc:100, pp:15, pri:0, effect:"HIGH_CRIT",   effectChance:0,desc:"Slashes in darkness. High critical-hit ratio." },
  CRUNCH:         { name:"Munch",           type:"DARK",     cat:"Physical", bp:80,  acc:100, pp:15, pri:0, effect:"DEF_DOWN1",   effectChance:20,desc:"Crunches with fangs." },
  // ── FLYING ────────────────────────────────────────────────
  GUST_WAVE:      { name:"Wind Blast",      type:"FLYING",   cat:"Special",  bp:40,  acc:100, pp:35, pri:0, effect:"NONE",        effectChance:0,      desc:"Whips up gusts of wind with wings." },
  WING_ASSAULT:   { name:"Wing Assault",    type:"FLYING",   cat:"Physical", bp:85,  acc:100, pp:10, pri:0, effect:"NONE",        effectChance:0,   desc:"Strikes foe hard with wings." },
  // ── NORMAL ────────────────────────────────────────────────
  TACKLE:         { name:"Tackle",          type:"NORMAL",   cat:"Physical", bp:40,  acc:100, pp:35, pri:0, effect:"NONE",        effectChance:0, desc:"A physical charge." },
  QUICK_ATTACK:   { name:"Swift Movement",  type:"NORMAL",   cat:"Physical", bp:40,  acc:100, pp:30, pri:1, effect:"NONE",        effectChance:0,    desc:"Extremely speedy blow. Always goes first." },
  BODY_SLAM_MOVE: { name:"Body Slam",       type:"NORMAL",   cat:"Physical", bp:85,  acc:100, pp:15, pri:0, effect:"PARALYSIS",   effectChance:30, desc:"Slams foe with full body. May paralyze." },
  // ── PSYCHIC ───────────────────────────────────────────────
  MIND_BLAST:     { name:"Mind Blast",      type:"PSYCHIC",  cat:"Special",  bp:90,  acc:100, pp:10, pri:0, effect:"SPDEF_DOWN1", effectChance:10,     desc:"Mental blast. May lower Sp.Def." },
  // ── DRAGON ────────────────────────────────────────────────
  DRAGON_CLAW:    { name:"Dragon Claw",     type:"DRAGON",   cat:"Physical", bp:80,  acc:100, pp:15, pri:0, effect:"NONE",        effectChance:0,desc:"Rakes foe with sharp claws." },
  // ── FIGHTING ──────────────────────────────────────────────
  POWER_STRIKE:   { name:"Power Strike",    type:"FIGHTING", cat:"Physical", bp:85,  acc:100, pp:15, pri:0, effect:"NONE",        effectChance:0,   desc:"A mighty strike packed with fighting spirit." },
  // ── BUG ───────────────────────────────────────────────────
  SWARM_STRIKE:   { name:"Swarm Strike",    type:"BUG",      cat:"Physical", bp:25,  acc:95,  pp:10, pri:0, effect:"MULTI_HIT",   effectChance:100,   desc:"Swarm attacks 2–5 times in a row." },
  // ── POISON ────────────────────────────────────────────────
  POISON_JAB:     { name:"Poison Jab",      type:"POISON",   cat:"Physical", bp:80,  acc:100, pp:20, pri:0, effect:"POISON",      effectChance:20,   desc:"Stabs with poison appendage. May poison." },
  // ── MYTHIC ────────────────────────────────────────────────
  ORIGIN_VERDICT: { name:"Origin Verdict",  type:"MYTHIC",   cat:"Special",  bp:100, acc:100, pp:10, pri:0, effect:"FORM_TYPE",   effectChance:0, desc:"Countless shots of prism light. Its light follows the form Mythar stands in." },
  // ── BATCH 2 (roster-wins catalogue, PR #205 data, wired live 2026-10-27) ──
  ...MOVES_BATCH2,
  // ── BATCH 3 (full move pool: 758 catalogue rows, 919-row registry) ──
  ...MOVES_FULLPOOL,
};
