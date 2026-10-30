// Item meaning layer — item-meaning lane S-IM1 (2026-10-29).
//
// The census (~/workspace/item-meaning/ITEM-CENSUS.md) found the
// playable item layer was FOUR items defined as UI constants, with
// the #31 item registry (src/data/core/schemas/item.schema.json) a
// complete schema holding ZERO instanced records, and no item
// carrying provenance, appraisal state, uniqueness, or a place tie
// as data. This module is the instanced registry + the meaning
// systems the framework (MEANING-FRAMEWORK.md) designs:
//
//   (a) PROVENANCE — a meaning block on the record; shown folded
//       into the description, never as a stat wall.
//   (b) APPRAISAL — fossil-service shape (CODE: pret-pokeemerald's
//       fossil handling — a find is a question until a research
//       place answers it), generalised: appraisal-required finds
//       enter the bag UNIDENTIFIED and resolve at a seat. First
//       seat: Aeon's Lab (aeon_lab), the research place that
//       already exists in the world.
//   (c) KEEPSAKES — Hades shape (a gift that remembers its giver),
//       Pokémon engine: depth is a DERIVED READ over append-only
//       facts, expressed on the bond band scale (B0..B5, the band
//       architecture of the bond integration package — the same
//       six bands, not a second scale). First keepsake: the
//       Sprint Boots, Mom's existing gift, previously a boolean.
//   (d) UNIQUES — Skyrim/Fallout shape on key-item discipline:
//       one of one, one mechanical effect + one story effect,
//       hand-placed, never in shop stock or drop tables (guarded
//       by itemMeaning.test.ts, not by intention).
//   (f) CHARGE — provenance records foundAt; the charge mark is a
//       WORD in the appraisal line when the place carries a charge
//       record. The staged charge fragment assigns NO base charge
//       to any canon place as fact, so this layer ships the field
//       and the read path with zero charged instances.
//
// Transfer rule (owner correction 2026-10-29 ~23:13 CDT): the only
// exclusions are a Pokémon itself, Pokémon names, logos, cries,
// and word-for-word dialogue. Item system behaviour and data
// shapes transfer whole; the items are Mochiichao's own. New
// relic names below are DRAFT (draftName: true) until the owner
// rules; their stories use existing places/people/species only.

export type ItemCategory =
  | "consumable"
  | "held"
  | "key"
  | "care"
  | "capture"
  | "material";

export interface ItemMeaning {
  provenance?: {
    /** Existing place id, maker, or person — canon that exists. */
    origin: string;
    /** Where this unit was found (relic finds). */
    foundAt?: string;
    /** ONE line, description voice. Shown at the moments it matters. */
    line: string;
  };
  appraisal?: {
    unknownName: string;
    unknownDesc: string;
    /** Map id of the research seat that can identify this item. */
    seat: string;
  };
  keepsake?: {
    /** The named person who gave it. Part of what the item IS. */
    giver: string;
  };
  unique?: {
    /** The one mechanical effect, in words, riding a live system. */
    mechEffect: string;
    /** The one story effect, in words. */
    storyEffect: string;
  };
  /** Hand placement: world object npc id + the one-time event id. */
  placement?: { npcId: string; eventId: string };
  /** Return adventure: the person it belongs to + the deed it writes. */
  returnTo?: { npcId: string; eventId: string; deed: string };
  /** Passive field effect on the encounter roll (identified only). */
  fieldEffect?: { kind: "encounter-rate"; factor: number };
  /** True while the display name is this lane's draft, unruled. */
  draftName?: boolean;
}

export interface ItemRecord {
  itemId: string;
  displayName: string;
  category: ItemCategory;
  /** The description the player reads once the item is known. */
  desc: string;
  /** Bag pocket label (mirrors BagView's existing labels). */
  pocket: string;
  effect: { system: string; op: string | null; params: Record<string, unknown> };
  price: { buy: number | null; sell: number | null };
  /** False for flag-bound records (Sprint Boots) that live outside inventory. */
  inInventory: boolean;
  meaning?: ItemMeaning;
}

// Prices mirror the shop's existing PLACEHOLDER economy (ShopView:
// "placeholder prices, NOT Mars canon"); sell = floor(buy / 2) per
// src/lib/playableWiring sellPrice. Descriptions for the four
// original items are their existing BagView/ShopView strings,
// verbatim — the registry instances them, it does not rewrite them.
export const ITEM_RECORDS: Record<string, ItemRecord> = {
  luigi_cube: {
    itemId: "luigi_cube",
    displayName: "Luigi Cube",
    category: "capture",
    desc: "A sketchy syndicate-brand capture device.",
    pocket: "Capture",
    effect: { system: "event", op: "capture", params: {} },
    price: { buy: 250, sell: 125 },
    inInventory: true,
    meaning: {
      provenance: {
        origin: "luigi-castagnoli-syndicate",
        line: "Luigi's mark is stamped inside the lid.",
      },
    },
  },
  mend_patch: {
    itemId: "mend_patch",
    displayName: "Mend Patch",
    category: "consumable",
    desc: "Restores 50 HP.",
    pocket: "Medicine",
    effect: { system: "heal", op: "heal-hp", params: { amount: 50 } },
    price: { buy: 150, sell: 75 },
    inInventory: true,
  },
  revive_core: {
    itemId: "revive_core",
    displayName: "Revive Core",
    category: "consumable",
    desc: "Reboots a fainted Mochiichao to 50% capacity.",
    pocket: "Medicine",
    // Census note: this effect is promised by the description but
    // was NOT wired through the bag (Use was count-only). The
    // record states the intended effect; wiring it is S-IM4 work,
    // recorded honestly rather than claimed here.
    effect: { system: "heal", op: "revive", params: { fraction: 0.5 } },
    price: { buy: 500, sell: 250 },
    inInventory: true,
  },
  data_card: {
    itemId: "data_card",
    displayName: "Data Card",
    category: "key",
    desc: "Stores a captured creature's data. Swap it at the PC.",
    pocket: "Storage",
    effect: { system: "event", op: "pc-swap", params: {} },
    price: { buy: 300, sell: 150 },
    inInventory: true,
  },

  // ── The first keepsake: Mom's gift, previously a boolean flag. ──
  sprint_boots: {
    itemId: "sprint_boots",
    displayName: "Sprint Boots",
    category: "key",
    desc: "Hold B and you can run.",
    pocket: "Key Items",
    effect: { system: "field", op: "run", params: {} },
    price: { buy: null, sell: null },
    inInventory: false,
    meaning: {
      keepsake: { giver: "Mom" },
      provenance: {
        origin: "sector0_house_1f",
        line: "Mom gave you these the morning everything started.",
      },
    },
  },

  // ── Region 1 uniques (hand-placed; see RELIC_NPCS). ────────────
  echo_shard: {
    itemId: "echo_shard",
    displayName: "Echo Shard",
    category: "held",
    desc: "A piece of the Cave of Echoes that kept its sound. Wild Mochiichao hear it coming and keep their distance.",
    pocket: "Held",
    effect: { system: "field", op: "encounter-rate", params: { factor: 0.5 } },
    price: { buy: null, sell: null },
    inInventory: true,
    meaning: {
      draftName: true,
      provenance: {
        origin: "cave_of_echoes",
        foundAt: "cave_of_echoes",
        line: "It was humming, a little, at the back of the Cave of Echoes.",
      },
      appraisal: {
        unknownName: "Singing Stone",
        unknownDesc:
          "A smooth stone that hums, very faintly, when it is quiet. You can't tell what it is — the Lab could say.",
        seat: "aeon_lab",
      },
      unique: {
        mechEffect:
          "While carried and identified, wild encounter rate on tall grass is halved (the roll reads it at the S-6 encounter site).",
        storyEffect:
          "Appraisal ties the stone to the Cave of Echoes: the cave echoes what you bring into it, and this piece kept an echo.",
      },
      placement: { npcId: "relic_echo_shard", eventId: "relic_echo_shard_found" },
      fieldEffect: { kind: "encounter-rate", factor: 0.5 },
    },
  },
  harbor_bell: {
    itemId: "harbor_bell",
    displayName: "Harbor Bell",
    category: "key",
    desc: "A harbor bell, green with salt. A knot-mark is worked into the rim — the Net Mender's hand, if you know her knots.",
    pocket: "Key Items",
    effect: { system: "event", op: "return", params: {} },
    price: { buy: null, sell: null },
    inInventory: true,
    meaning: {
      draftName: true,
      provenance: {
        origin: "sector0",
        foundAt: "sector0",
        line: "It washed up by the Boot Harbor dock steps, half-buried in the sand.",
      },
      unique: {
        mechEffect:
          "Returning it to the Net Mender writes the witnessed deed return-lost-item into the honor ledger (prices and greetings read the ledger).",
        storyEffect:
          "The Net Mender's dialogue changes while you carry it, and again after it is back in her hands.",
      },
      placement: { npcId: "relic_harbor_bell", eventId: "relic_harbor_bell_found" },
      returnTo: { npcId: "bh_net_mender", eventId: "relic_bell_returned", deed: "return-lost-item" },
    },
  },
  scrap_core: {
    itemId: "scrap_core",
    displayName: "Scrap Core",
    category: "material",
    desc: "The heart of some machine the Junkyard ate, still ticking. Luigi's Kiosk buys curios — this one is worth real money to the right buyer.",
    pocket: "Materials",
    effect: { system: "none", op: null, params: {} },
    // Placeholder economy, like every price in the game (owner
    // sets the CR economy); sell-only: a unique is never stocked.
    price: { buy: null, sell: 1500 },
    inInventory: true,
    meaning: {
      draftName: true,
      provenance: {
        origin: "scrap_junkyard",
        foundAt: "scrap_junkyard",
        line: "It was still ticking when you pulled it out of the Junkyard.",
      },
      appraisal: {
        unknownName: "Ticking Junk",
        unknownDesc:
          "A warm lump of junkyard metal that ticks like a clock with somewhere to be. You can't tell what it is — the Lab could say.",
        seat: "aeon_lab",
      },
      unique: {
        mechEffect:
          "Once identified, the Syndicate Kiosk will buy it for 1500 CR (placeholder economy) — the sell list reads registry prices, not just shop stock.",
        storyEffect:
          "Appraisal names what the Junkyard swallowed; selling it to Luigi's Kiosk is the player's choice, and the bell of the story is that it stays ticking either way.",
      },
      placement: { npcId: "relic_scrap_core", eventId: "relic_scrap_core_found" },
    },
  },
};

export function recordFor(itemId: string): ItemRecord | null {
  return ITEM_RECORDS[itemId] ?? null;
}

export function needsAppraisal(rec: ItemRecord): boolean {
  return !!rec.meaning?.appraisal;
}

export function isIdentified(itemId: string, identifiedItems: readonly string[]): boolean {
  const rec = recordFor(itemId);
  if (!rec || !needsAppraisal(rec)) return true;
  return identifiedItems.includes(itemId);
}

/** What the player sees for an item right now: name + description.
 *  Unidentified finds show their unknown face; identified items
 *  show their true face with the provenance line folded in — the
 *  Pokémon way: in the description, not in a lore tab. */
export function displayFor(
  itemId: string,
  identifiedItems: readonly string[],
): { name: string; desc: string; pocket: string } | null {
  const rec = recordFor(itemId);
  if (!rec) return null;
  if (!isIdentified(itemId, identifiedItems)) {
    const a = rec.meaning!.appraisal!;
    return { name: a.unknownName, desc: a.unknownDesc, pocket: rec.pocket };
  }
  const prov = rec.meaning?.provenance;
  return {
    name: rec.displayName,
    desc: prov ? `${rec.desc} ${prov.line}` : rec.desc,
    pocket: rec.pocket,
  };
}

/** The appraisal service's work list: carried, appraisal-required,
 *  not yet identified. Order = registry order, deterministic. */
export function appraiseCarried(
  inventory: Readonly<Record<string, number>>,
  identifiedItems: readonly string[],
): string[] {
  return Object.values(ITEM_RECORDS)
    .filter(
      (rec) =>
        needsAppraisal(rec) &&
        (inventory[rec.itemId] ?? 0) > 0 &&
        !identifiedItems.includes(rec.itemId),
    )
    .map((rec) => rec.itemId);
}

/** The research seat for the appraisal service (first seat). */
export const APPRAISAL_TERMINAL_NPC_ID = "appraisal_terminal";
export const APPRAISAL_SEAT_MAP = "aeon_lab";

/** Dialogue for the lab's research terminal, computed from what
 *  the player actually carries — the service answers the bag, not
 *  a script. */
export function appraisalTerminalLines(
  inventory: Readonly<Record<string, number>>,
  identifiedItems: readonly string[],
): string[] {
  const pending = appraiseCarried(inventory, identifiedItems);
  if (pending.length === 0) {
    return [
      "LAB RESEARCH TERMINAL",
      "Bring me anything you can't name. Fossils, finds, things that hum — the Lab will tell you what they are.",
      "(Nothing you carry needs identifying right now.)",
    ];
  }
  const lines = ["LAB RESEARCH TERMINAL", "Let's see what you've brought me…"];
  for (const id of pending) {
    const rec = recordFor(id)!;
    lines.push(`…${rec.displayName}. ${rec.desc}`);
    if (rec.meaning?.provenance) lines.push(rec.meaning.provenance.line);
  }
  lines.push("Knowing what a thing is changes what it's for. Take care of them.");
  return lines;
}

/** Find / claimed dialogue for a placed relic object. */
export const RELIC_NPCS: Record<
  string,
  { itemId: string; findLines: string[]; emptyLines: string[] }
> = {
  relic_echo_shard: {
    itemId: "echo_shard",
    findLines: [
      "Something at the back of the chamber is humming — a smooth stone, warm from the cave's own sound.",
      "You found the Singing Stone!",
      "(You can't tell what it is. The Lab in Boot Harbor could say.)",
    ],
    emptyLines: ["The chamber hums quietly, the way it always has. The stone is gone — it's with you."],
  },
  relic_harbor_bell: {
    itemId: "harbor_bell",
    findLines: [
      "Something green with salt is half-buried by the dock steps…",
      "You dug out the Harbor Bell!",
      "(A knot-mark is worked into the rim. Someone at this harbor works knots like that.)",
    ],
    emptyLines: ["Just sand and shells by the dock steps now."],
  },
  relic_scrap_core: {
    itemId: "scrap_core",
    findLines: [
      "Buried in the scrap: something warm, ticking like a clock with somewhere to be.",
      "You dug out the Ticking Junk!",
      "(You can't tell what it is. The Lab in Boot Harbor could say.)",
    ],
    emptyLines: ["The scrap here is just scrap now. Whatever ticked here ticks in your bag."],
  },
};

/** One-of-one discipline at the grant path: a unique record may
 *  never exist in the inventory more than once. */
export function canGrantUnique(
  inventory: Readonly<Record<string, number>>,
  itemId: string,
): boolean {
  const rec = recordFor(itemId);
  if (!rec?.meaning?.unique) return true;
  return (inventory[itemId] ?? 0) < 1;
}

/** Passive field effects, read at the engine's encounter site:
 *  identified, carried items only — you have to know what a thing
 *  is before it can work for you (the appraisal loop's payoff). */
export function encounterRateFactor(
  inventory: Readonly<Record<string, number>>,
  identifiedItems: readonly string[],
): number {
  let factor = 1;
  for (const rec of Object.values(ITEM_RECORDS)) {
    const fe = rec.meaning?.fieldEffect;
    if (!fe || fe.kind !== "encounter-rate") continue;
    if ((inventory[rec.itemId] ?? 0) > 0 && isIdentified(rec.itemId, identifiedItems)) {
      factor *= fe.factor;
    }
  }
  return factor;
}

// ── Keepsakes ────────────────────────────────────────────────────

export type KeepsakeFactKind = "received" | "battle-won-with" | "event-completed-with";

export interface KeepsakeFact {
  itemId: string;
  kind: KeepsakeFactKind;
  /** Store-assigned sequence number (append order is the truth). */
  seq: number;
}

/** Depth weights — DRAFT balance data, labelled as such. The band
 *  COUNT and ORDER are the transferred design (bond architecture);
 *  these thresholds sit on this lane's own fact scale. */
const KEEPSAKE_FACT_WEIGHT: Record<KeepsakeFactKind, number> = {
  received: 0,
  "battle-won-with": 1,
  "event-completed-with": 2,
};

export const KEEPSAKE_BANDS = [
  { band: "B0", min: 0, word: "New to you." },
  { band: "B1", min: 1, word: "Wearing in." },
  { band: "B2", min: 3, word: "Steady under you." },
  { band: "B3", min: 6, word: "Part of your stride." },
  { band: "B4", min: 10, word: "Second skin." },
  { band: "B5", min: 15, word: "Like they were always yours." },
] as const;

export function keepsakeScore(log: readonly KeepsakeFact[], itemId: string): number {
  return log
    .filter((f) => f.itemId === itemId)
    .reduce((sum, f) => sum + (KEEPSAKE_FACT_WEIGHT[f.kind] ?? 0), 0);
}

/** The depth read: band + the visible cue word (#180 declaration
 *  law — a keepsake's depth exists where the player can see it:
 *  in its bag description, and in the band-up toast). */
export function keepsakeBand(
  log: readonly KeepsakeFact[],
  itemId: string,
): { band: string; word: string; score: number } {
  const score = keepsakeScore(log, itemId);
  let current: (typeof KEEPSAKE_BANDS)[number] = KEEPSAKE_BANDS[0];
  for (const b of KEEPSAKE_BANDS) if (score >= b.min) current = b;
  return { band: current.band, word: current.word, score };
}

/** The keepsake's bag description: giver first (who gave it is
 *  part of what it is), then the depth, in plain words. */
export function keepsakeDesc(rec: ItemRecord, log: readonly KeepsakeFact[]): string {
  const giver = rec.meaning?.keepsake?.giver;
  const depth = keepsakeBand(log, rec.itemId);
  const head = giver ? `${giver} gave you these. ` : "";
  return `${head}${rec.desc} ${depth.word}`;
}
