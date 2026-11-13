import { describe, it, expect } from 'vitest';
import { FULL_WORLD } from '../src/world/FullWorldMaps';
import region1 from '../src/lib/wiring/dialogue/region1-dialogue.json';

// Region 1 step (i), 2026-11-13: Route 1.0 rescue + exit gating +
// tech grants. Structural pins on the live world maps — no engine
// behaviour here, only that the maps carry the rescue flow and the
// gate/grant data the engine now consumes. The dialogue lines pinned
// below are the locked spec lines (ink route_rescue knot and
// region1-dialogue.json Beats 5/7); the divergent Jay/Amy lines and
// the Mochiko garden gate are NOT re-litigated here.

// The ink route_rescue knot lines, verbatim (region1-truck-start.ink).
const RESCUE_INTRO = [
  'Help! This wild creature has me cornered!',
  'Quick — take one from my bag and drive it off!',
];

// Lab ball label lines, reused verbatim by Aeon's bag on Route 1.0.
const BAG_LABELS: Record<string, string> = {
  pick_starter_001: 'Mochii! (A bouncy water-type)',
  pick_starter_004: 'Razorgater! (A strong, metallic crocodile)',
  pick_starter_007: 'Tyrage! (An earthy dinosaur)',
  pick_starter_010: 'Kittember! (A fast and fiery feline)',
  pick_starter_038: 'Sproutle! (A grassy plant turtle)',
};

const POINTER_LINE =
  'The bag is out on Route 1.0 with Prof. Aeon — pick your partner there.';

function npcs(mapKey: string): any[] {
  return (FULL_WORLD as any)[mapKey]?.npcs || [];
}

function npc(mapKey: string, id: string): any {
  return npcs(mapKey).find((n: any) => n.id === id);
}

function specLines(entryId: string, speaker: string): string[] {
  const entry = (region1 as any).entries.find((e: any) => e.id === entryId);
  if (speaker === '__antagonist__') return entry.antagonist.lines;
  return entry.npcs.find((n: any) => n.speaker === speaker).lines;
}

describe('region 1 rescue: no new maps, no leftover gate', () => {
  it('FULL_WORLD still has exactly 46 keys', () => {
    expect(Object.keys(FULL_WORLD).length).toBe(46);
  });

  it('sector0 has no block_route_1 step-back events left', () => {
    const events = (FULL_WORLD as any).sector0.events || [];
    expect(events.some((e: any) => e.id === 'block_route_1')).toBe(false);
  });

  it('the ROUTE 1.0 GATE sign points at Route 1.0, not the lab', () => {
    const signs = (FULL_WORLD as any).sector0.signs || [];
    const gate = signs.find((s: any) => (s.text || '').startsWith('ROUTE 1.0 GATE'));
    expect(gate).toBeDefined();
    expect(gate.text).toContain('Prof. Aeon is out on Route 1.0');
    expect(gate.text).not.toContain("Go to Prof. Aeon's Lab first");
  });
});

describe('region 1 rescue: Aeon + his bag on Route 1.0', () => {
  it('Prof. Aeon stands on route_1 with the ink rescue lines', () => {
    const aeon = npc('route_1', 'prof_aeon_route1');
    expect(aeon).toBeDefined();
    expect(aeon.x).toBe(10);
    expect(aeon.y).toBe(35);
    expect(aeon.dialog).toEqual(RESCUE_INTRO);
  });

  it('five bag NPCs reuse the lab pick_starter_XXX choices', () => {
    const bags = npcs('route_1').filter((n: any) => n.id.startsWith('aeon_bag_'));
    expect(bags.length).toBe(5);
    const eventIds = bags.map((b: any) => b.eventId).sort();
    expect(eventIds).toEqual(Object.keys(BAG_LABELS).sort());
    for (const bag of bags) {
      expect(bag.isChoice).toBe(true);
      expect(bag.dialog[0]).toBe(BAG_LABELS[bag.eventId]);
      expect(bag.y).toBe(35);
    }
  });

  it('the lab balls are display-only: no choice, no starter event', () => {
    const balls = npcs('aeon_lab').filter((n: any) => n.id.startsWith('starter_'));
    expect(balls.length).toBe(5);
    for (const ball of balls) {
      expect(ball.isChoice).toBeFalsy();
      expect(ball.eventId).toBeUndefined();
      expect(ball.dialog[1]).toBe(POINTER_LINE);
    }
    expect(npcs('aeon_lab').some((n: any) => (n.eventId || '').startsWith('pick_starter_'))).toBe(false);
  });

  it('lab Aeon no longer offers a partner in the lab', () => {
    const aeon = npc('aeon_lab', 'prof_aeon');
    expect(aeon.dialog.join('\n')).not.toContain('ready for a partner');
    expect(aeon.dialog.join('\n')).not.toContain('Go ahead, pick one');
  });
});

describe('region 1 rescue: gates and grants in the map data', () => {
  it('the victory-route exit carries badges>=8 and the boot-bay exit carries Wave', () => {
    const binaryExits = (FULL_WORLD as any).binary_fields.exits || [];
    expect(
      binaryExits.some((e: any) => e.to === 'victory_route' && e.condition === 'badges>=8'),
    ).toBe(true);
    const sectorExits = (FULL_WORLD as any).sector0.exits || [];
    expect(
      sectorExits.some((e: any) => e.to === 'boot_bay' && e.hmNeeded === 'Wave'),
    ).toBe(true);
  });

  it('Master Lin grants Mighty Push; Master Falk grants no technique', () => {
    expect(npc('dojo_1', 'master_lin').battle.hmReward).toBe('Mighty Push');
    expect('hmReward' in npc('dojo_2', 'master_falk').battle).toBe(false);
  });

  it('the Neon ferry captain stands in Neon City with the Beat 5 spec line', () => {
    const captain = npc('neon_city', 'neon_ferry_captain');
    expect(captain).toBeDefined();
    expect(captain.x).toBe(20);
    expect(captain.y).toBe(30);
    expect(captain.dialog).toEqual(specLines('R1-BEAT5', '__antagonist__'));
  });

  it('the Preserve Keeper dialog is byte-identical to the Beat 7 spec line', () => {
    const keeper = npc('harbor_city', 'harbor_preserve_keeper');
    expect(keeper).toBeDefined();
    expect(keeper.dialog).toEqual(specLines('R1-BEAT7', 'Preserve keeper'));
  });
});
