import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { useGameStore } from '../store/gameStore';
import { createMochii } from './engine';
import {
  CHEAT_CODES,
  CHEAT_CUBE_ITEM_ID,
  applyCheatCode,
  findCheatCode,
  normalizeCheatCode,
} from './cheatCodes';

/**
 * Built-in cheat codes (cheat-to-mechanic lane). The contract under
 * test is the owner's, in his words: type the plain code in Settings,
 * get exactly the thing — INFINITE MONEY toggles, 1 MILL CASH gives
 * a million, 99 CUBES gives ninety-nine — every use is recorded in
 * the save, and cheats never touch honor/bond/dex silently.
 */

function resetStore() {
  useGameStore.setState({
    wallet: 1000,
    inventory: { luigi_cube: 10, mend_patch: 5 },
    infiniteMoney: false,
    cheatLog: [],
    cheated: false,
    shiny: false,
    noclip: false,
    deedLedger: [],
    dex: {},
    party: [],
    guaranteedCatch: false,
    noEncounters: false,
    infiniteItems: false,
    expMultiplier: 1,
    fastForward: false,
    guardian: null,
    daycarePartner: null,
    daycareEgg: null,
    daycareSteps: 0,
  });
}

beforeEach(resetStore);

describe('registry shape', () => {
  it('is data-driven: every row has a unique canonical code, a kind, and a plain description', () => {
    const codes = CHEAT_CODES.map(d => d.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const d of CHEAT_CODES) {
      expect(d.code).toBe(d.code.toUpperCase());
      expect(['toggle', 'grant', 'action']).toContain(d.kind);
      expect(d.description.length).toBeGreaterThan(0);
      expect(typeof d.apply).toBe('function');
    }
  });

  it('carries the three owner codes plus the legacy native allowlist', () => {
    for (const c of ['INFINITE MONEY', '1 MILL CASH', '99 CUBES', 'MOCHII-ALL', 'MAX-LVL', 'SHINY-ON', 'SHINY-OFF', 'NOCLIP', 'WARP-SECTOR0', 'MONEY-1000']) {
      expect(findCheatCode(c), c).not.toBeNull();
    }
  });

  it('normalizes plain entry: case-insensitive, hyphens and underscores read as spaces', () => {
    expect(normalizeCheatCode('  infinite-money ')).toBe('INFINITE MONEY');
    expect(normalizeCheatCode('1   mill   cash')).toBe('1 MILL CASH');
    expect(findCheatCode('99_cubes')?.code).toBe('99 CUBES');
  });

  it('99 CUBES points at the real live capture item, not an invented one', () => {
    const row = findCheatCode('99 CUBES')!;
    expect(row.itemId).toBe(CHEAT_CUBE_ITEM_ID);
    expect(CHEAT_CUBE_ITEM_ID).toBe('luigi_cube');
  });
});

describe('the owner codes', () => {
  it('1 MILL CASH applies exactly +1,000,000, once per entry, repeatable per entry', () => {
    const r1 = applyCheatCode('1 MILL CASH');
    expect(r1.ok).toBe(true);
    expect(useGameStore.getState().wallet).toBe(1000 + 1_000_000);
    const r2 = applyCheatCode('1 mill cash');
    expect(r2.ok).toBe(true);
    expect(useGameStore.getState().wallet).toBe(1000 + 2_000_000);
    expect(useGameStore.getState().cheatLog.map(e => e.code)).toEqual(['1 MILL CASH', '1 MILL CASH']);
  });

  it('99 CUBES applies exactly +99 of the cube, once per entry', () => {
    expect(applyCheatCode('99 CUBES').ok).toBe(true);
    expect(useGameStore.getState().inventory[CHEAT_CUBE_ITEM_ID]).toBe(10 + 99);
    expect(applyCheatCode('99 CUBES').ok).toBe(true);
    expect(useGameStore.getState().inventory[CHEAT_CUBE_ITEM_ID]).toBe(10 + 198);
  });

  it('INFINITE MONEY is an idempotent toggle pair: on, then off restores deduction', () => {
    expect(useGameStore.getState().infiniteMoney).toBe(false);
    applyCheatCode('INFINITE MONEY');
    expect(useGameStore.getState().infiniteMoney).toBe(true);
    applyCheatCode('INFINITE MONEY');
    expect(useGameStore.getState().infiniteMoney).toBe(false);
    // A third entry returns to ON — toggle state is a pure function of entry count parity.
    applyCheatCode('infinite money');
    expect(useGameStore.getState().infiniteMoney).toBe(true);
  });

  it('while INFINITE MONEY is on, buyItem grants without deducting; off, it deducts', () => {
    applyCheatCode('INFINITE MONEY');
    const before = useGameStore.getState().wallet;
    expect(useGameStore.getState().buyItem('mend_patch', 150)).toBe(true);
    expect(useGameStore.getState().wallet).toBe(before);
    expect(useGameStore.getState().inventory['mend_patch']).toBe(6);
    applyCheatCode('INFINITE MONEY'); // off
    expect(useGameStore.getState().buyItem('mend_patch', 150)).toBe(true);
    expect(useGameStore.getState().wallet).toBe(before - 150);
  });

  it('while INFINITE MONEY is off, buyItem still refuses what the wallet cannot pay', () => {
    useGameStore.setState({ wallet: 100 });
    expect(useGameStore.getState().buyItem('revive_core', 500)).toBe(false);
    expect(useGameStore.getState().inventory['revive_core'] || 0).toBe(0);
  });
});

describe('the honest record', () => {
  it('every successful use is logged with its canonical code and a timestamp, and sets cheated', () => {
    expect(useGameStore.getState().cheated).toBe(false);
    applyCheatCode('99 cubes');
    const s = useGameStore.getState();
    expect(s.cheated).toBe(true);
    expect(s.cheatLog).toHaveLength(1);
    expect(s.cheatLog[0].code).toBe('99 CUBES');
    expect(typeof s.cheatLog[0].at).toBe('number');
  });

  it('unknown codes apply nothing, log nothing, and answer with the standard error message', () => {
    const r = applyCheatCode('GIMME EVERYTHING');
    expect(r.ok).toBe(false);
    expect(r.code).toBeNull();
    expect(r.message).toContain('Unknown code');
    const s = useGameStore.getState();
    expect(s.wallet).toBe(1000);
    expect(s.cheatLog).toHaveLength(0);
    expect(s.cheated).toBe(false);
  });

  it('cheats never write the honor ledger or the dex silently', () => {
    applyCheatCode('1 MILL CASH');
    applyCheatCode('99 CUBES');
    applyCheatCode('INFINITE MONEY');
    const s = useGameStore.getState();
    expect(s.deedLedger).toEqual([]);
    expect(s.dex).toEqual({});
  });

  it('the record + toggle persist through a save round-trip (loadState of the serialized state)', () => {
    applyCheatCode('INFINITE MONEY');
    applyCheatCode('1 MILL CASH');
    const s = useGameStore.getState();
    const serialized = JSON.parse(JSON.stringify({
      wallet: s.wallet,
      inventory: s.inventory,
      infiniteMoney: s.infiniteMoney,
      cheatLog: s.cheatLog,
      cheated: s.cheated,
    }));
    resetStore();
    expect(useGameStore.getState().cheatLog).toHaveLength(0);
    useGameStore.getState().loadState(serialized);
    const loaded = useGameStore.getState();
    expect(loaded.infiniteMoney).toBe(true);
    expect(loaded.wallet).toBe(1000 + 1_000_000);
    expect(loaded.cheatLog.map(e => e.code)).toEqual(['INFINITE MONEY', '1 MILL CASH']);
    expect(loaded.cheated).toBe(true);
  });

  it('an old save with no cheat fields loads with the honest defaults', () => {
    useGameStore.getState().loadState({ wallet: 42 } as never);
    const s = useGameStore.getState();
    expect(s.infiniteMoney).toBe(false);
    expect(Array.isArray(s.cheatLog)).toBe(true);
  });
});

describe('cheat expansion — the Gen 7/8/9 catalogue, our versions', () => {
  const NEW_CODES = [
    '99 MEND', '99 REVIVE', 'INFINITE ITEMS', 'LEVEL UP', 'DOUBLE EXP',
    'PERFECT STATS', 'FORCE EVOLVE', 'PERFECT CATCH', 'NO ENCOUNTERS',
    'FORCE EGG', 'INSTANT HATCH', 'FAST FORWARD',
  ];

  it('all 12 expansion codes are registered, each with a family for the panel groups', () => {
    for (const c of NEW_CODES) expect(findCheatCode(c), c).not.toBeNull();
    for (const d of CHEAT_CODES) {
      expect(d.family, d.code).toBeTruthy();
      expect(d.family.length).toBeGreaterThan(0);
    }
    expect(CHEAT_CODES).toHaveLength(22);
  });

  it('99 MEND and 99 REVIVE grant exactly +99 of the real live items', () => {
    expect(applyCheatCode('99 MEND').ok).toBe(true);
    expect(useGameStore.getState().inventory['mend_patch']).toBe(5 + 99);
    expect(applyCheatCode('99 REVIVE').ok).toBe(true);
    expect(useGameStore.getState().inventory['revive_core']).toBe(99);
    expect(findCheatCode('99 MEND')!.itemId).toBe('mend_patch');
    expect(findCheatCode('99 REVIVE')!.itemId).toBe('revive_core');
  });

  it('INFINITE ITEMS: while ON, useItem succeeds without decreasing; OFF, it decreases', () => {
    applyCheatCode('INFINITE ITEMS');
    expect(useGameStore.getState().infiniteItems).toBe(true);
    expect(useGameStore.getState().useItem('mend_patch')).toBe(true);
    expect(useGameStore.getState().inventory['mend_patch']).toBe(5);
    applyCheatCode('INFINITE ITEMS'); // off
    expect(useGameStore.getState().useItem('mend_patch')).toBe(true);
    expect(useGameStore.getState().inventory['mend_patch']).toBe(4);
  });

  it('LEVEL UP raises every party member by exactly one level, repeatable', () => {
    const m = createMochii('001', 5)!;
    useGameStore.setState({ party: [m] });
    expect(applyCheatCode('LEVEL UP').ok).toBe(true);
    expect(useGameStore.getState().party[0].level).toBe(6);
    expect(applyCheatCode('LEVEL UP').ok).toBe(true);
    expect(useGameStore.getState().party[0].level).toBe(7);
  });

  it('DOUBLE EXP toggles the store multiplier the award sites read (1 <-> 2)', () => {
    expect(useGameStore.getState().expMultiplier).toBe(1);
    applyCheatCode('DOUBLE EXP');
    expect(useGameStore.getState().expMultiplier).toBe(2);
    applyCheatCode('DOUBLE EXP');
    expect(useGameStore.getState().expMultiplier).toBe(1);
  });

  it('PERFECT STATS recomputes party stats upward at perfect inputs, HP proportion kept', () => {
    const m = createMochii('001', 20)!;
    const hurt = { ...m, hp: Math.floor(m.maxHp / 2), currentHp: Math.floor(m.maxHp / 2) };
    useGameStore.setState({ party: [hurt as never] });
    const before = useGameStore.getState().party[0];
    expect(applyCheatCode('PERFECT STATS').ok).toBe(true);
    const after = useGameStore.getState().party[0];
    expect(after.stats.atk).toBeGreaterThan(before.stats.atk);
    expect(after.stats.spe).toBeGreaterThan(before.stats.spe);
    expect(after.maxHp).toBeGreaterThan(before.maxHp);
    expect(after.hp).toBeGreaterThan(0);
    expect(after.hp).toBeLessThan(after.maxHp); // was at half — proportion kept, not a heal
    expect(after.level).toBe(20); // a stat pin, not a level change
  });

  it('FORCE EVOLVE evolves members whose species has an evolution, ignoring level', () => {
    const m = createMochii('001', 5)!; // Mochii -> Tiidebiite at 16 normally
    useGameStore.setState({ party: [m] });
    const r = applyCheatCode('FORCE EVOLVE');
    expect(r.ok).toBe(true);
    expect(useGameStore.getState().party[0].speciesId).toBe('002');
    expect(useGameStore.getState().party[0].level).toBe(5);
  });

  it('PERFECT CATCH and NO ENCOUNTERS toggle their store flags', () => {
    applyCheatCode('PERFECT CATCH');
    expect(useGameStore.getState().guaranteedCatch).toBe(true);
    applyCheatCode('PERFECT CATCH');
    expect(useGameStore.getState().guaranteedCatch).toBe(false);
    applyCheatCode('NO ENCOUNTERS');
    expect(useGameStore.getState().noEncounters).toBe(true);
    applyCheatCode('NO ENCOUNTERS');
    expect(useGameStore.getState().noEncounters).toBe(false);
  });

  it('FAST FORWARD flips the same fastForward flag the Cheat Console button uses', () => {
    applyCheatCode('FAST FORWARD');
    expect(useGameStore.getState().fastForward).toBe(true);
    applyCheatCode('FAST FORWARD');
    expect(useGameStore.getState().fastForward).toBe(false);
  });

  it('FORCE EGG writes the daycare\u2019s own egg record for a deposited pair; INSTANT HATCH completes its steps', () => {
    const g = createMochii('001', 10)!;
    const q = createMochii('004', 10)!;
    useGameStore.setState({
      party: [g, q],
      guardian: { creatureId: g.id, nickname: g.nickname, garden: 'Test' },
      daycarePartner: { creatureId: q.id, nickname: q.nickname, garden: 'Test' },
      daycareSteps: 40,
    });
    expect(applyCheatCode('FORCE EGG').ok).toBe(true);
    const egg = useGameStore.getState().daycareEgg;
    expect(egg).not.toBeNull();
    expect(egg!.speciesId).toBe(g.speciesId);
    expect(egg!.parentA).toBe(g.nickname);
    expect(egg!.createdAtSteps).toBe(40);
    expect(applyCheatCode('INSTANT HATCH').ok).toBe(true);
    const s = useGameStore.getState();
    expect(s.daycareSteps - s.daycareEgg!.createdAtSteps).toBeGreaterThanOrEqual(256);
  });

  it('FORCE EGG with no pair deposited fakes nothing', () => {
    const r = applyCheatCode('FORCE EGG');
    expect(r.message).toContain('needs a Guardian and a Partner');
    expect(useGameStore.getState().daycareEgg).toBeNull();
  });

  it('the expansion codes never write the honor ledger, and only MOCHII-ALL ever touches the dex', () => {
    const m = createMochii('001', 5)!;
    useGameStore.setState({ party: [m] });
    for (const c of NEW_CODES) applyCheatCode(c);
    const s = useGameStore.getState();
    expect(s.deedLedger).toEqual([]);
    expect(s.dex).toEqual({});
    expect(s.cheatLog.map(e => e.code)).toEqual(expect.arrayContaining(NEW_CODES));
  });

  it('the new toggles are wired at the REAL systems, not just in the registry (source scan)', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const world = readFileSync(join(here, '../world/WorldEngine.tsx'), 'utf8');
    const battle = readFileSync(join(here, '../components/views/BattleView.tsx'), 'utf8');
    const creature = readFileSync(join(here, '../components/views/CreatureModeView.tsx'), 'utf8');
    const store = readFileSync(join(here, '../store/gameStore.ts'), 'utf8');
    expect(world).toContain('noEncounters');       // grass roll reads it
    expect(world).toContain('guaranteedCatch');    // wild catch site reads it
    expect(battle).toContain('guaranteedCatch');   // BattleView catch site reads it
    expect(battle).toContain('expMultiplier');     // BattleView EXP award reads it
    expect(creature).toContain('expMultiplier');   // Creature Mode EXP award reads it
    expect(store).toContain('infiniteItems');      // useItem honours it
  });
});
