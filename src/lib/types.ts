export type ElementType = 
  | "NORMAL" | "FIRE" | "WATER" | "GRASS" | "ELECTRIC" | "ICE" 
  | "FIGHTING" | "POISON" | "GROUND" | "FLYING" | "PSYCHIC" 
  | "BUG" | "ROCK" | "GHOST" | "DRAGON" | "DARK" | "STEEL" | "FAIRY" | "MYTHIC";

export type MoveCategory = "Physical" | "Special" | "Status";

export interface Move {
  name: string;
  type: ElementType;
  cat: MoveCategory;
  bp: number;
  acc: number;
  pp: number;
  pri: number;
  effect: string;
  effectChance: number;
  // Stub-kill S-5 (2026-10-29): the old optional `anim` field is
  // retired. It was write-only data — authored on all 122 moves,
  // read by nothing but a type assertion in a test. Animation now
  // derives from the move's stable id via
  // src/lib/moveAnimation.ts (getMoveAnimationProfile); do not
  // re-add a stored animation field here.
  desc: string;
}

export type GrowthRate = "Fast" | "Medium Fast" | "Medium Slow" | "Slow";

export interface SpeciesData {
  id: string; // e.g. "001"
  name: string;
  types: ElementType[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  catchRate: number;
  baseExpYield: number;
  growthRate: GrowthRate;
  learnset: { level: number; moveId: string }[];
  evolution?: { targetId: string; level: number };
  description: string;
  pokeApiId?: number; // Fetches sprite + enhanced dex description from PokeAPI
  apiSearchTags?: string[];
}

// Individual record, gap-fill S7 slice 1 — the #80 shape
// (src/data/core/schemas/individual.schema.json, mochiichao/individual/v1),
// as a TypeScript type. Optional on the instance so old saves load
// unchanged; rolled at creation by createIndividual (src/lib/individual.ts).
export interface IndividualVariance {
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  sizeClass: "small" | "standard" | "large";
  temperamentRead: string | null;
}

export interface IndividualDeviation {
  trait: string;
  speciesPattern: string;
  individualValue: string;
  status: "RULED" | "PROPOSED" | "SPECIES-TYPICAL";
  ruledBy?: string | null;
  ruledOn?: string | null;
  source?: string | null;
}

export interface IndividualRecord {
  personalitySeed: number; // uint32, 0..4294967295
  variance: IndividualVariance;
  deviations: IndividualDeviation[];
  // S8 slice 1: follower mood, HGSS-pattern short-term value, -127..127.
  // Optional: absent reads as neutral (0) via readMood in individual.ts.
  // The schema slot for this field lands with the teardown-hgss lane's
  // open PR #50 (schema file only); this slice does not touch that file.
  mood?: number;
  // S8 slice 6: follower find state — what the follower is currently
  // carrying after picking up a find it has not handed over (see
  // followerFind.ts). Optional: absent reads as empty (no pending
  // item, zero withholdings) via readFindState there. The schema file
  // is the teardown-hgss lane's PR #50, which this slice does not touch.
  findState?: FollowerFindState;
}

/** S8 slice 6 — a find carried by the follower, pending handover. */
export interface FollowerFindState {
  pendingItemId: string | null;
  withheldCount: number;
}

export interface MochiiInstance {
  id: string; // unique uuid
  speciesId: string;
  nickname: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  stats: { atk: number; def: number; spa: number; spd: number; spe: number };
  stages: { atk: number; def: number; spa: number; spd: number; spe: number; acc: number; eva: number };
  status: string | null;
  moves: string[]; // move IDs
  pp: number[]; // current PP
  individual?: IndividualRecord; // S7: rolled at creation; absent in old save files, backfilled by gameStore.loadState on load (slice 2)
}
