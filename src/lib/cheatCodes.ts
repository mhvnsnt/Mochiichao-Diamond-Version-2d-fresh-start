import { useGameStore } from '../store/gameStore';
import { getExpNeeded, gainExp, calculateStat, evolveInstance } from './engine';
import { SPECIES_DB } from './species';
import { playUiConfirm, playUiBack } from './audioRouting';
import { playCue } from './soundCues';

/**
 * Built-in cheat codes — the data-driven registry (cheat-to-mechanic
 * lane, 2026-10-29; owner order: the things he needed a GameShark
 * for are either mechanics or HONEST built-in cheats, typed in plain
 * words in Settings, and recorded in the save).
 *
 * One row per code: { code, kind, description, apply }. Adding a
 * code is adding a row — the Settings Cheat Codes screen and the
 * Cheat Console both render and run from THIS table, so the two
 * surfaces can never drift apart.
 *
 * Rules the registry enforces centrally (in applyCheatCode, never
 * per-row):
 * - Every successful application is recorded via
 *   store.recordCheatUse (cheated = true + a cheatLog entry with a
 *   timestamp). The log is shown on the cheat screen itself.
 * - Unknown codes change nothing and log nothing.
 * - Effects go through the store's real actions (gainWallet,
 *   addItem, buyItem honours infiniteMoney) — no row reaches into
 *   state it does not own.
 * - No row writes the honor deed ledger or bond state. The single
 *   dex-writing row (MOCHII-ALL) says so in its description and
 *   message, and only ever marks Seen, never Caught.
 *
 * Item fact (verified against live item data — ShopView SHOP_ITEMS,
 * BagView ITEM_DETAILS, the store's default inventory): the game's
 * only live capture device is `luigi_cube`. There is NO Master-tier
 * Luigi Cube item id in live data (capture_capsule / prime_capsule
 * exist only as DERIVED, unwired rows in a generated parity file).
 * 99 CUBES therefore grants the real Luigi Cube; a Master-tier cube
 * is a data gap for the owner to author, never an invented id here.
 *
 * Money fact: the store's real gainWallet applies NO cap, and no
 * other wallet reader clamps — so 1 MILL CASH lands the full
 * +1,000,000. (The legacy MONEY-1000 row keeps its own historical
 * 999,999 clamp, stated on its face; the discrepancy is recorded in
 * the lane's LANDING-RECORD for a balance call, not silently unified.)
 *
 * Expansion (cheat-expansion lane, 2026-10-29): the Gen 7/8/9
 * cheat catalogue (46 functions — lane RESEARCH.md) converted in
 * CONVERSIONS.md: 12 new rows below. Every new toggle writes a
 * store flag the REAL system reads (catch sites, grass roll,
 * useItem, EXP award sites) — a row that only flipped its own
 * private state would be a fake cheat. Refused families (the
 * battle-integrity pins, catch-a-trainer's as a code, the item
 * fountain) and flagged seams (species/level/move pickers, lustre
 * lock, bond pin) are recorded in CONVERSIONS.md with reasons —
 * they are absent here ON THE RECORD, not by omission.
 *
 * Sound: success plays the existing UI confirm cue (audioRouting).
 * Unknown codes play the existing UI back cue as feedback — this
 * base tree does NOT contain the sound-wiring lane's dedicated
 * error-buzz cue registry, so no error cue is claimed here; wiring
 * one is a one-line swap when that registry lands (noted in the
 * lane's LANDING-RECORD).
 */

export interface CheatCodeDef {
  /** Canonical code text, uppercase, single spaces. */
  code: string;
  kind: 'toggle' | 'grant' | 'action';
  description: string;
  /**
   * Panel grouping (cheat-expansion lane, 2026-10-29): the family
   * the code belongs to, rendered as a group header in the panel's
   * list. Families come from the Gen 7/8/9 catalogue's own shape
   * (money & items, growth, catching, daycare, world & debug).
   */
  family: string;
  /** Item-grant rows name the real item id they grant. */
  itemId?: string;
  /** Display name of the granted item (item-grant rows). */
  itemName?: string;
  /** Applies the effect against the live store; returns the player-facing message. */
  apply: () => string;
}

export interface CheatApplyResult {
  ok: boolean;
  /** Canonical code when resolved, null when unknown. */
  code: string | null;
  message: string;
}

/** The capture item 99 CUBES grants — the real top of the live cube line. */
export const CHEAT_CUBE_ITEM_ID = 'luigi_cube';
export const CHEAT_CUBE_ITEM_NAME = 'Luigi Cube';

const WALLET_CAP_LEGACY = 999999;

export const CHEAT_CODES: CheatCodeDef[] = [
  {
    code: 'INFINITE MONEY',
    kind: 'toggle',
    family: 'Money & Items',
    description: 'Toggle: while ON, buying never deducts your wallet.',
    apply: () => {
      const next = !useGameStore.getState().infiniteMoney;
      useGameStore.getState().setInfiniteMoney(next);
      return next
        ? 'INFINITE MONEY: ON — purchases no longer deduct your wallet.'
        : 'INFINITE MONEY: OFF — purchases deduct your wallet again.';
    },
  },
  {
    code: '1 MILL CASH',
    kind: 'grant',
    family: 'Money & Items',
    description: '+1,000,000 CR, every time you enter it.',
    apply: () => {
      useGameStore.getState().gainWallet(1_000_000);
      return `1 MILL CASH: +1,000,000 CR. Wallet is now ${useGameStore.getState().wallet} CR.`;
    },
  },
  {
    code: '99 CUBES',
    kind: 'grant',
    family: 'Money & Items',
    description: `+99 ${CHEAT_CUBE_ITEM_NAME}s (the game's capture cube).`,
    itemId: CHEAT_CUBE_ITEM_ID,
    itemName: CHEAT_CUBE_ITEM_NAME,
    apply: () => {
      useGameStore.getState().addItem(CHEAT_CUBE_ITEM_ID, 99);
      return `99 CUBES: +99 ${CHEAT_CUBE_ITEM_NAME}s. You now hold ${useGameStore.getState().inventory[CHEAT_CUBE_ITEM_ID] || 0}.`;
    },
  },
  // ---- Legacy native codes (carried from the original console) ----
  {
    code: 'MOCHII-ALL',
    kind: 'action',
    family: 'Wild & Catching',
    description: 'Marks every species Seen in the Dex (never Caught).',
    apply: () => {
      const dex: Record<string, string> = {};
      for (const id of Object.keys(SPECIES_DB)) dex[id] = 'seen';
      useGameStore.setState({ dex });
      return 'MOCHII-ALL: every species marked Seen in the Dex.';
    },
  },
  {
    code: 'MAX-LVL',
    kind: 'action',
    family: 'Party & Growth',
    description: 'Raises the whole party to level 100.',
    apply: () => {
      const party = useGameStore.getState().party.map(m => {
        const copy = { ...m };
        const needed = Math.max(0, getExpNeeded(100, 'Medium Slow') - copy.experience);
        gainExp(copy, needed);
        copy.level = Math.min(100, copy.level);
        return copy;
      });
      useGameStore.setState({ party });
      return 'MAX-LVL: party raised to level 100.';
    },
  },
  {
    code: 'SHINY-ON',
    kind: 'toggle',
    family: 'World & Debug',
    description: 'Lustre display on.',
    apply: () => {
      useGameStore.getState().setCheatFlags({ shiny: true });
      return 'SHINY-ON: Lustre display on.';
    },
  },
  {
    code: 'SHINY-OFF',
    kind: 'toggle',
    family: 'World & Debug',
    description: 'Lustre display off.',
    apply: () => {
      useGameStore.getState().setCheatFlags({ shiny: false });
      return 'SHINY-OFF: Lustre display off.';
    },
  },
  {
    code: 'NOCLIP',
    kind: 'toggle',
    family: 'World & Debug',
    description: 'Toggle: walk through solid tiles (debug tool — can soft-lock a run; the save keeps the flag).',
    apply: () => {
      const next = !useGameStore.getState().noclip;
      useGameStore.getState().setCheatFlags({ noclip: next });
      return `NOCLIP: ${next ? 'ON — walk through solid tiles.' : 'OFF.'}`;
    },
  },
  {
    code: 'WARP-SECTOR0',
    kind: 'action',
    family: 'World & Debug',
    description: 'Warp to Boot Harbor.',
    apply: () => {
      useGameStore.getState().setMapState('sector0', { x: 15, y: 18 });
      return 'WARP-SECTOR0: warped to Boot Harbor.';
    },
  },
  {
    code: 'MONEY-1000',
    kind: 'grant',
    family: 'Money & Items',
    description: '+1000 CR (legacy amount; wallet clamped at 999,999 as this code has always done).',
    apply: () => {
      useGameStore.setState(s => ({ wallet: Math.min(WALLET_CAP_LEGACY, s.wallet + 1000) }));
      return 'MONEY-1000: +1000 CR.';
    },
  },
  // ---- Cheat expansion (2026-10-29): the Gen 7/8/9 catalogue's
  // functions, our versions. RESEARCH.md + CONVERSIONS.md in the
  // lane folder carry the per-family sources and the bucket for
  // every function NOT built here (refusals and flagged seams are
  // on the record there, never silent). ----
  {
    code: '99 MEND',
    kind: 'grant',
    family: 'Money & Items',
    description: '+99 Mend Patches (restores 50 HP).',
    itemId: 'mend_patch',
    itemName: 'Mend Patch',
    apply: () => {
      useGameStore.getState().addItem('mend_patch', 99);
      return `99 MEND: +99 Mend Patches. You now hold ${useGameStore.getState().inventory['mend_patch'] || 0}.`;
    },
  },
  {
    code: '99 REVIVE',
    kind: 'grant',
    family: 'Money & Items',
    description: '+99 Revive Cores (reboots a fainted Mochiichao to 50%).',
    itemId: 'revive_core',
    itemName: 'Revive Core',
    apply: () => {
      useGameStore.getState().addItem('revive_core', 99);
      return `99 REVIVE: +99 Revive Cores. You now hold ${useGameStore.getState().inventory['revive_core'] || 0}.`;
    },
  },
  {
    code: 'INFINITE ITEMS',
    kind: 'toggle',
    family: 'Money & Items',
    description: 'Toggle: while ON, using an item never reduces its count.',
    apply: () => {
      const next = !useGameStore.getState().infiniteItems;
      useGameStore.getState().setInfiniteItems(next);
      return next
        ? 'INFINITE ITEMS: ON — items are no longer used up.'
        : 'INFINITE ITEMS: OFF — items are used up again.';
    },
  },
  {
    code: 'LEVEL UP',
    kind: 'action',
    family: 'Party & Growth',
    description: 'The whole party gains exactly one level. Repeatable — the level-up candy, without a candy item.',
    apply: () => {
      const st = useGameStore.getState();
      if (st.party.length === 0) return 'LEVEL UP: your party is empty — nothing to raise.';
      let raised = 0;
      const party = st.party.map(m => {
        if (m.level >= 100) return m;
        const copy = { ...m };
        const needed = Math.max(0, getExpNeeded(copy.level + 1, 'Medium Slow') - copy.experience);
        gainExp(copy, needed);
        if (copy.level > m.level) raised++;
        return copy;
      });
      useGameStore.setState({ party });
      return raised > 0
        ? `LEVEL UP: ${raised} party member${raised === 1 ? '' : 's'} gained a level.`
        : 'LEVEL UP: everyone is already at level 100.';
    },
  },
  {
    code: 'DOUBLE EXP',
    kind: 'toggle',
    family: 'Party & Growth',
    description: 'Toggle: while ON, battle EXP awards are doubled.',
    apply: () => {
      const next = useGameStore.getState().expMultiplier === 1 ? 2 : 1;
      useGameStore.getState().setExpMultiplier(next);
      return next === 2
        ? 'DOUBLE EXP: ON — battles award double EXP.'
        : 'DOUBLE EXP: OFF — battles award normal EXP.';
    },
  },
  {
    code: 'PERFECT STATS',
    kind: 'action',
    family: 'Party & Growth',
    description: 'Recomputes the party\u2019s stats as if perfectly raised (best nature-less inputs in the game\u2019s own formula). Lasts until each member\u2019s next level-up, which recomputes stats the normal way.',
    apply: () => {
      const st = useGameStore.getState();
      if (st.party.length === 0) return 'PERFECT STATS: your party is empty — nothing to recompute.';
      const party = st.party.map(m => {
        const sp = SPECIES_DB[m.speciesId];
        if (!sp) return m;
        const maxHp = calculateStat(sp.baseStats.hp, 31, 252, m.level, true);
        const hpPct = m.maxHp > 0 ? (m as { currentHp?: number }).currentHp ?? m.hp : 1;
        const ratio = m.maxHp > 0 ? Math.min(1, Math.max(0, hpPct / m.maxHp)) : 1;
        const hp = Math.max(1, Math.round(maxHp * ratio));
        return {
          ...m,
          maxHp,
          hp,
          currentHp: hp,
          stats: {
            atk: calculateStat(sp.baseStats.atk, 31, 252, m.level, false),
            def: calculateStat(sp.baseStats.def, 31, 252, m.level, false),
            spa: calculateStat(sp.baseStats.spa, 31, 252, m.level, false),
            spd: calculateStat(sp.baseStats.spd, 31, 252, m.level, false),
            spe: calculateStat(sp.baseStats.spe, 31, 252, m.level, false),
          },
        } as typeof m;
      });
      useGameStore.setState({ party });
      return 'PERFECT STATS: party stats recomputed at perfect inputs for their levels.';
    },
  },
  {
    code: 'FORCE EVOLVE',
    kind: 'action',
    family: 'Party & Growth',
    description: 'Every party member whose species can evolve, evolves now — whatever its level. Uses the game\u2019s real evolution, so stats and moves are recomputed properly.',
    apply: () => {
      const st = useGameStore.getState();
      if (st.party.length === 0) return 'FORCE EVOLVE: your party is empty — nothing to evolve.';
      let evolved = 0;
      const names: string[] = [];
      const party = st.party.map(m => {
        const sp = SPECIES_DB[m.speciesId];
        if (!sp?.evolution) return m;
        const copy = { ...m, stats: { ...m.stats }, stages: { ...m.stages }, moves: [...m.moves], pp: [...m.pp] };
        if (evolveInstance(copy, sp.evolution.targetId)) {
          evolved++;
          names.push(copy.nickname);
          return copy;
        }
        return m;
      });
      useGameStore.setState({ party });
      return evolved > 0
        ? `FORCE EVOLVE: ${evolved} evolved — ${names.join(', ')}.`
        : 'FORCE EVOLVE: no party member has an evolution.';
    },
  },
  {
    code: 'PERFECT CATCH',
    kind: 'toggle',
    family: 'Wild & Catching',
    description: 'Toggle: while ON, every Luigi Cube throw catches.',
    apply: () => {
      const next = !useGameStore.getState().guaranteedCatch;
      useGameStore.getState().setGuaranteedCatch(next);
      return next
        ? 'PERFECT CATCH: ON — every throw catches.'
        : 'PERFECT CATCH: OFF — throws can fail again.';
    },
  },
  {
    code: 'NO ENCOUNTERS',
    kind: 'toggle',
    family: 'Wild & Catching',
    description: 'Toggle: while ON, walking in tall grass never starts a wild battle.',
    apply: () => {
      const next = !useGameStore.getState().noEncounters;
      useGameStore.getState().setNoEncounters(next);
      return next
        ? 'NO ENCOUNTERS: ON — the grass stays quiet.'
        : 'NO ENCOUNTERS: OFF — wild battles can start again.';
    },
  },
  {
    code: 'FORCE EGG',
    kind: 'action',
    family: 'Daycare',
    description: 'The deposited Guardian + Partner pair produces an egg right now — no luck roll. The egg is the daycare\u2019s own; hatch it in Creature Mode.',
    apply: () => {
      const st = useGameStore.getState();
      if (st.daycareEgg) return 'FORCE EGG: an egg is already waiting at the daycare.';
      if (!st.guardian || !st.daycarePartner) return 'FORCE EGG: the daycare needs a Guardian and a Partner deposited first (Creature Mode).';
      const g = st.party.find(p => p.id === st.guardian!.creatureId);
      const q = st.party.find(p => p.id === st.daycarePartner!.creatureId);
      if (!g || !q) return 'FORCE EGG: the deposited pair is not in your party — nothing was faked.';
      st.setDaycareEgg({ speciesId: g.speciesId, parentA: g.nickname, parentB: q.nickname, createdAtSteps: st.daycareSteps });
      return `FORCE EGG: an egg appeared — ${g.nickname} + ${q.nickname}. Hatch it in Creature Mode.`;
    },
  },
  {
    code: 'INSTANT HATCH',
    kind: 'action',
    family: 'Daycare',
    description: 'A waiting daycare egg finishes its steps on the spot — hatch it in Creature Mode.',
    apply: () => {
      const st = useGameStore.getState();
      if (!st.daycareEgg) return 'INSTANT HATCH: there is no egg at the daycare right now.';
      st.setDaycareSteps(st.daycareEgg.createdAtSteps + 256);
      return 'INSTANT HATCH: the egg is ready — hatch it in Creature Mode.';
    },
  },
  {
    code: 'FAST FORWARD',
    kind: 'toggle',
    family: 'World & Debug',
    description: 'Toggle: world movement runs at the fast rate. (The same flag the Cheat Console\u2019s fast-forward button flips — one flag, both doors.)',
    apply: () => {
      const next = !useGameStore.getState().fastForward;
      useGameStore.getState().setCheatFlags({ fastForward: next });
      return next
        ? 'FAST FORWARD: ON — world movement at the fast rate.'
        : 'FAST FORWARD: OFF — world movement at the normal rate.';
    },
  },
];

/**
 * Lookup key: case-insensitive, and hyphens / underscores / spaces
 * are the same separator — so the legacy hyphenated codes
 * (MOCHII-ALL, MAX-LVL) and the owner's spaced codes (INFINITE
 * MONEY, 1 MILL CASH) both resolve from either spelling.
 */
function registryKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[-_\s]+/g, ' ');
}

const REGISTRY = new Map(CHEAT_CODES.map(d => [registryKey(d.code), d]));

/** The canonical lookup form of an entered code. */
export function normalizeCheatCode(raw: string): string {
  return registryKey(raw);
}

export function findCheatCode(raw: string): CheatCodeDef | null {
  return REGISTRY.get(registryKey(raw)) ?? null;
}

/**
 * The one entry point both cheat surfaces call. Resolves, applies
 * exactly once, records the use, and plays the surface's feedback
 * cues. Unknown codes apply nothing, record nothing.
 */
export function applyCheatCode(raw: string): CheatApplyResult {
  const def = findCheatCode(raw);
  if (!def) {
    // Landing swap A3 (cheat-presentation RESEARCH-ADDITIONS, applied
    // in the unified tree where the cue registry lives): unknown
    // codes speak the measured error voice, not the UI back tone.
    playCue('ui.error');
    return {
      ok: false,
      code: null,
      message: `Unknown code. Codes that work here: ${CHEAT_CODES.map(d => d.code).join(', ')}.`,
    };
  }
  const message = def.apply();
  useGameStore.getState().recordCheatUse(def.code);
  // Landing swap A2 (same record): a GRANT lands with the obtain
  // class (Pokémon's playfanfare obtaining grammar) through the cue
  // registry; toggles/actions keep the plain UI confirm.
  if (def.kind === 'grant') playCue('item.get');
  else playUiConfirm();
  return { ok: true, code: def.code, message };
}
