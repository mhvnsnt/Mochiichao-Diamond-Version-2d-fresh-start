// Trainer-teams wiring lock (PR C, 2026-10-27).
// Locks the resolver's match set, the row->member conversion, and the
// exact gameplay effect of wiring the 265-row trainer table into
// triggerTrainerBattle: 17 of 22 unique map trainer battles resolve
// to a row, 5 keep hand-built boss teams, and only two battles change
// at all (Lin 039->040, Cleff +035 Lv15 -- both documented in
// trainer-teams-resolver.ts). Also locks the one known drift between
// the region files and trainerTeams.ts (R1-035).
import { describe, expect, it } from 'vitest';
import {
  ALL_TRAINER_ROWS,
  resolveTrainerRow,
  rowToMapMembers,
  trainerRowDisplayName,
} from './trainer-teams-resolver';
import { TRAINER_TEAMS } from './trainerTeams';
import { SPECIES_DB } from './species';
import { createMochii } from './engine';
import { FULL_WORLD } from '../world/FullWorldMaps';

describe('trainer-teams resolver', () => {
  it('loads all 265 rows (76+53+46+43+47)', () => {
    expect(ALL_TRAINER_ROWS.length).toBe(265);
    expect(TRAINER_TEAMS.length).toBe(265);
  });

  it('resolves the 16 single-candidate NPC names to the right rows', () => {
    const cases: [string, string][] = [
      ['Youngster Jay', 'R1-001'],
      ['Lass Amy', 'R1-002'],
      ['Hiker Dan', 'R1-003'],
      ['Bug Catcher Rick', 'R1-004'],
      ['Bug Catcher Mira', 'R1-005'],
      ['Woods Walker Tess', 'R1-006'],
      ['Hacker Grunt', 'R1-007'],
      ['Miner Cleff', 'R1-010'],
      ['Cave Runner Pike', 'R1-011'],
      ['Acolyte Ken', 'R1-031'],
      ['Acolyte Ren', 'R1-032'],
      ['Acolyte Shin', 'R1-033'],
      ['Acolyte Ryu', 'R1-034'],
      ['Master Lin', 'R1-035'],
      ['Acolyte Skye', 'R1-037'],
      ['Master Falk', 'R1-038'],
    ];
    for (const [name, id] of cases) {
      expect(resolveTrainerRow(name)?.id).toBe(id);
    }
  });

  it('resolves the ambiguous Acolyte Gale only with tie-break info', () => {
    expect(resolveTrainerRow('Acolyte Gale')).toBeNull();
    expect(
      resolveTrainerRow('Acolyte Gale', [{ speciesId: '019', level: 17 }])?.id,
    ).toBe('R1-036');
    expect(resolveTrainerRow('Acolyte Gale', undefined, 500)?.id).toBe('R1-036');
    expect(
      resolveTrainerRow('Acolyte Gale', [
        { speciesId: '020', level: 75 },
        { speciesId: '019', level: 75 },
      ])?.id,
    ).toBe('R3-030');
    expect(resolveTrainerRow('Acolyte Gale', undefined, 1850)?.id).toBe('R3-030');
  });

  it('never resolves hand-built boss teams or NAME GAP rows', () => {
    for (const name of [
      'Hex',
      'Junk Warlord Krix',
      'Luigi Castagnoli',
      'Luigi',
      'Champion — MYTHAR',
      'Nobody Here',
      'Elite Four 1 — [NAME GAP] Water',
      'HQ Commander — [NAME GAP]',
    ]) {
      expect(resolveTrainerRow(name)).toBeNull();
    }
    // No [NAME GAP] row is reachable by its display name either.
    for (const row of ALL_TRAINER_ROWS) {
      if (row.name.includes('[NAME GAP]')) {
        expect(resolveTrainerRow(trainerRowDisplayName(row))).toBeNull();
      }
    }
  });

  it('converts every row team to buildable map members (trainerBattleMon rebuild condition)', () => {
    for (const row of ALL_TRAINER_ROWS) {
      const members = rowToMapMembers(row);
      expect(members).not.toBeNull();
      expect(members!.length).toBe(row.team.length);
      for (let i = 0; i < row.team.length; i++) {
        const m = members![i];
        const sp: any = (SPECIES_DB as any)[row.team[i].speciesId];
        expect(m.speciesId).toBe(row.team[i].speciesId);
        expect(m.id).toBe(row.team[i].speciesId);
        expect(m.name).toBe(sp.name); // trainerBattleMon rebuilds only on id+name match
        expect(m.level).toBe(row.team[i].level);
        expect(m.type.length).toBeGreaterThan(0);
        // The member must be rebuildable by createMochii (real stats + moves).
        const built = createMochii(row.team[i].speciesId, row.team[i].level);
        expect(built).not.toBeNull();
        expect(built!.moves.length).toBeGreaterThan(0);
      }
    }
  });

  it('region files and trainerTeams.ts agree except the known R1-035 drift', () => {
    const byId = new Map(TRAINER_TEAMS.map((r: any) => [r.id, r]));
    const drift: string[] = [];
    for (const row of ALL_TRAINER_ROWS) {
      const t: any = byId.get(row.id);
      expect(t).toBeDefined();
      const sameTeam =
        JSON.stringify(t.team) ===
        JSON.stringify(row.team.map((s) => ({ speciesId: s.speciesId, level: s.level })));
      if (!sameTeam || t.reward !== row.reward) drift.push(row.id);
    }
    // R1-035 only: region file 040 Dreadtoise (roster-wins override),
    // consolidated file 039 Shellguard. Anything else drifting fails.
    expect(drift).toEqual(['R1-035']);
  });
});

describe('trainer-teams statsHeld lock (step f)', () => {
  // R2-001..R2-004 are the Region 2 opening rows. Their species
  // (147 Dorowani, 150 Gabu) carry PROVISIONAL stats in SPECIES_DB
  // (Black 2 first-stage starter-pattern fills, total 308 each) — NOT
  // Mars-approved numbers. The rows stay flagged statsHeld until Mars
  // gives numbers, and the flags are what keep the provisional stats
  // from being silently treated as canon: the "converts every row"
  // test above passes for these rows only because the provisional
  // stats exist, so this block locks the labelling itself.
  const HELD_IDS = ['R2-001', 'R2-002', 'R2-003', 'R2-004'];

  it('flags exactly the four Region 2 opening rows as statsHeld', () => {
    const held = ALL_TRAINER_ROWS.filter((r) => r.statsHeld);
    expect(held.map((r) => r.id).sort()).toEqual([...HELD_IDS].sort());
  });

  it('held rows use only 147/150 plus already-approved species', () => {
    for (const row of ALL_TRAINER_ROWS) {
      if (!row.statsHeld) continue;
      for (const slot of row.team) {
        expect(['147', '150', '016', '019', '041']).toContain(slot.speciesId);
      }
    }
  });

  it('no row anywhere uses species 148 (Gabu is 150)', () => {
    for (const row of ALL_TRAINER_ROWS) {
      for (const slot of row.team) {
        expect(slot.speciesId).not.toBe('148');
      }
    }
  });

  it('provisional species appear ONLY in statsHeld rows', () => {
    for (const row of ALL_TRAINER_ROWS) {
      if (row.statsHeld) continue;
      for (const slot of row.team) {
        expect(slot.speciesId).not.toBe('147');
        expect(slot.speciesId).not.toBe('150');
      }
    }
  });

  it('held rows resolve by display name for Region 2 map placement', () => {
    expect(resolveTrainerRow('Ferry Walker Nia')?.id).toBe('R2-001');
    expect(resolveTrainerRow('Ferry Walker Pim')?.id).toBe('R2-002');
    expect(resolveTrainerRow('Route Trainer Oda')?.id).toBe('R2-003');
    expect(resolveTrainerRow('Route Trainer Ren')?.id).toBe('R2-004');
  });

  it('147/150 exist in SPECIES_DB (held rows build) — numbers provisional', () => {
    for (const id of ['147', '150']) {
      const sp: any = (SPECIES_DB as any)[id];
      expect(sp).toBeDefined();
      expect(sp.baseStats).toBeDefined();
      expect(sp.learnset.length).toBeGreaterThan(0);
    }
    expect((SPECIES_DB as any)['148']).toBeUndefined();
  });

  it('every row has sane levels (1-100), team size 1-6, reward > 0', () => {
    for (const row of ALL_TRAINER_ROWS) {
      expect(row.team.length).toBeGreaterThan(0);
      expect(row.team.length).toBeLessThanOrEqual(6);
      for (const slot of row.team) {
        expect(slot.level).toBeGreaterThanOrEqual(1);
        expect(slot.level).toBeLessThanOrEqual(100);
      }
      expect(row.reward).toBeGreaterThan(0);
    }
  });
});

describe('trainer-teams stale-NEW re-mark lock (2026-11-13 audit)', () => {
  // Five Region 1 rows were marked NEW when written, but their NPCs were
  // placed in FullWorldMaps.ts afterwards, so the status was stale — the
  // resolver header (2026-10-27) invited the data lane to re-mark them
  // KEEP. This locks the re-mark AND the teams/rewards, so a future edit
  // cannot silently change a live map battle's team while re-marking.
  const REMARKED: [string, [string, number][], number][] = [
    ['R1-005', [['016', 10], ['017', 11]], 220],
    ['R1-006', [['038', 11], ['041', 11]], 280],
    ['R1-010', [['035', 15], ['007', 16]], 340],
    ['R1-011', [['013', 16], ['036', 17]], 380],
    ['R1-037', [['019', 18], ['020', 18]], 600],
  ];

  it('marks exactly the five map-placed rows KEEP with unchanged teams/rewards', () => {
    const byId = new Map(ALL_TRAINER_ROWS.map((r) => [r.id, r]));
    for (const [id, team, reward] of REMARKED) {
      const row = byId.get(id);
      expect(row).toBeDefined();
      expect(row!.status).toBe('KEEP');
      expect(row!.team.map((s) => [s.speciesId, s.level])).toEqual(team);
      expect(row!.reward).toBe(reward);
    }
    // No other Region 1 row changed status in this re-mark: KEEP is now
    // 15 of 76 (10 original + these 5), REPLACE stays 1 (R1-038).
    const r1 = ALL_TRAINER_ROWS.filter((r) => r.id.startsWith('R1-'));
    expect(r1.filter((r) => r.status === 'KEEP').length).toBe(15);
    expect(r1.filter((r) => r.status === 'REPLACE').map((r) => r.id)).toEqual(['R1-038']);
  });

  it('the five re-marked rows still resolve from their live map battles', () => {
    for (const name of [
      'Bug Catcher Mira',
      'Woods Walker Tess',
      'Miner Cleff',
      'Cave Runner Pike',
      'Acolyte Skye',
    ]) {
      expect(resolveTrainerRow(name)).not.toBeNull();
    }
  });
});

describe('trainer-teams map parity (wiring effect lock)', () => {
  type Battle = { name: string; team: [string, number][]; reward: number };
  function uniqueMapBattles(): Battle[] {
    const seen = new Map<string, Battle>();
    for (const map of Object.values(FULL_WORLD) as any[]) {
      const entries: any[] = [...(map.npcs || []), ...(map.events || [])];
      for (const e of entries) {
        const npc = e.npc ?? e;
        const team = e.battle?.team;
        if (!team?.length || !npc?.name) continue;
        const b: Battle = {
          name: npc.name,
          team: team.map((m: any) => [m.speciesId || m.id, m.level] as [string, number]),
          reward: e.battle.reward,
        };
        seen.set(JSON.stringify([b.name, b.team, b.reward]), b);
      }
    }
    return [...seen.values()];
  }

  it('wires 123 of 129 unique map trainer battles; 6 keep hand-built teams', () => {
    const battles = uniqueMapBattles();
    expect(battles.length).toBe(129);
    const matched: string[] = [];
    const unmatched: string[] = [];
    for (const b of battles) {
      const row = resolveTrainerRow(b.name, b.team.map(([s, l]) => ({ speciesId: s, level: l })), b.reward);
      if (row) matched.push(b.name);
      else unmatched.push(b.name);
    }
    expect(matched.sort()).toEqual(
      [
        // Region 1 (17, as before).
        'Acolyte Gale',
        'Acolyte Ken',
        'Acolyte Ren',
        'Acolyte Ryu',
        'Acolyte Shin',
        'Acolyte Skye',
        'Bug Catcher Mira',
        'Bug Catcher Rick',
        'Cave Runner Pike',
        'Hacker Grunt',
        'Hiker Dan',
        'Lass Amy',
        'Master Falk',
        'Master Lin',
        'Miner Cleff',
        'Woods Walker Tess',
        'Youngster Jay',
        // Region 2 (31, PR #423): 15 route/area + 16 dojo acolytes.
        'Acolyte Bolt',
        'Acolyte Ember',
        'Acolyte Fist',
        'Acolyte Flare',
        'Acolyte Foam',
        'Acolyte Kindling',
        'Acolyte Leaf',
        'Acolyte Legend',
        'Acolyte Moss',
        'Acolyte Myth',
        'Acolyte Night',
        'Acolyte Silk',
        'Acolyte Spar',
        'Acolyte Wave',
        'Acolyte Web',
        'Acolyte Wire',
        'Ferry Walker Nia',
        'Ferry Walker Pim',
        'Forest Walker Faye',
        'Lake Watcher Bryn',
        'Radio Runner Dex',
        'Radio Runner Vee',
        'Route Trainer Oda',
        'Route Trainer Ren',
        'Shrine Keeper Lorn',
        'Syndicate Operative Kest',
        'Syndicate Operative Nyx',
        'Veteran Iska',
        'Veteran Miri',
        'Veteran Ruel',
        'Veteran Taro',
        // Regions 3-5 (75, this PR): 26 Region 3 + 26 Region 4 + 23 Region 5.
        'Acolyte Ash',
        'Acolyte Bloom',
        'Acolyte Boulder',
        'Acolyte Brook',
        'Acolyte Chill',
        'Acolyte Circuit',
        'Acolyte Cloud',
        'Acolyte Coal',
        'Acolyte Comet',
        'Acolyte Cross',
        'Acolyte Cub',
        'Acolyte Deep',
        'Acolyte Dynamo',
        'Acolyte Feather',
        'Acolyte Frost',
        'Acolyte Frost',
        'Acolyte Gale',
        'Acolyte Gear',
        'Acolyte Glace',
        'Acolyte Gloom',
        'Acolyte Grapple',
        'Acolyte Howl',
        'Acolyte Jab',
        'Acolyte Marsh',
        'Acolyte Mesh',
        'Acolyte Ore',
        'Acolyte Pick',
        'Acolyte Plate',
        'Acolyte Pup',
        'Acolyte Pup',
        'Acolyte Reel',
        'Acolyte Rune',
        'Acolyte Saga',
        'Acolyte Shaft',
        'Acolyte Solar',
        'Acolyte Spark',
        'Acolyte Sprint',
        'Acolyte Star',
        'Acolyte Stone',
        'Acolyte Tide',
        'Acolyte Tumble',
        'Acolyte Vault',
        'Acolyte Veil',
        'Acolyte Vein',
        'Acolyte Vine',
        'Acolyte Volt',
        'Acolyte Wind',
        'Acolyte Wire',
        'Arena Runner Lux',
        'Arena Runner Pax',
        'Cave Painter Rune',
        'Flower Walker Petal',
        'Land Faction Terra',
        'Lore Keeper Ora',
        'Rift Watcher Crag',
        'Route Trainer Corin',
        'Route Trainer Holt',
        'Route Trainer Noa',
        'Route Trainer Sela',
        'Route Trainer Vale',
        'Route Trainer Wren',
        'Sea Faction Marina',
        'Veteran Ash',
        'Veteran Elara',
        'Veteran Fable',
        'Veteran Joss',
        'Veteran Kira',
        'Veteran Myth',
        'Veteran Onyx',
        'Veteran Rook',
        'Veteran Slate',
        'Veteran Storm',
        'Veteran Tempest',
        'Veteran Terra',
        'Veteran Voss',
      ].sort(),
    );
    expect(unmatched.sort()).toEqual(
      ['Champion — MYTHAR', 'Hex', 'Hex', 'Junk Warlord Krix', 'Luigi', 'Luigi Castagnoli'].sort(),
    );
  });

  it('row teams equal inline map teams except Lin and Cleff; rewards always equal', () => {
    const battles = uniqueMapBattles();
    const diffs: string[] = [];
    for (const b of battles) {
      const row = resolveTrainerRow(b.name, b.team.map(([s, l]) => ({ speciesId: s, level: l })), b.reward);
      if (!row) continue;
      expect(row.reward).toBe(b.reward);
      const rowTeam = row.team.map((s) => [s.speciesId, s.level]);
      if (JSON.stringify(rowTeam) !== JSON.stringify(b.team)) diffs.push(b.name);
    }
    // Lin: 039 Shellguard -> 040 Dreadtoise (roster-wins override).
    // Cleff: row adds 035 Pebblefist Lv15 ahead of the map's lone Tyrage.
    expect(diffs.sort()).toEqual(['Master Lin', 'Miner Cleff']);
  });
});
