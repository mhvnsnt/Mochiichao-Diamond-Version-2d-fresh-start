import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  enterCocoon,
  gardenNowMinutes,
  harvestPlot,
  newGardenRecord,
  plantPlot,
  tickCocoon,
} from './garden-wiring';
import type { WorldClockAnchor } from './worldClock';

const root = process.cwd();
const gardenView = readFileSync(join(root, 'src/components/views/GardenView.tsx'), 'utf8');

const anchorAt = (anchorGameMinutes: number, anchorRealMs = 1000): WorldClockAnchor => ({
  anchorRealMs,
  anchorGameMinutes,
  lastSeenDayIndex: 0,
});

describe('S1 TAIL part 2 — gardenNowMinutes reads the world clock when anchored', () => {
  it('returns the manual counter exactly when unanchored', () => {
    expect(gardenNowMinutes(null, 42, 999_999)).toBe(42);
    expect(gardenNowMinutes(undefined, 7, 999_999)).toBe(7);
  });
  it('returns totalGameMinutes from the anchor (4 game-minutes per real second)', () => {
    // Anchor 600 at real ms 1000; 15 real seconds later = +60 game minutes.
    expect(gardenNowMinutes(anchorAt(600), 0, 16_000)).toBe(660);
  });
  it('never runs backwards: a backwards real clock reports the anchor time', () => {
    expect(gardenNowMinutes(anchorAt(600), 0, 500)).toBe(600);
  });
  it('crosses midnight correctly: total minutes, not time-of-day', () => {
    // Anchor at day 0, 23:00 (= 1380); 120 real seconds later = +480
    // game minutes = day 1, 07:00 — total 1860, not 420.
    expect(gardenNowMinutes(anchorAt(1380), 0, 121_000)).toBe(1860);
  });
});

describe('S1 TAIL part 2 — durations unchanged, only the driver changes', () => {
  it('plots still ripen at now + 7 under world time', () => {
    const rec = newGardenRecord('004', 1);
    const planted = plantPlot(rec, 'plot-1', 'Aqua Fruit', 660);
    const plot = planted.farm!.find(p => p.id === 'plot-1')!;
    expect(plot.readyAt).toBe(667);
    expect(harvestPlot(planted, 'plot-1', 666).fruit).toBeNull();
    const ripe = harvestPlot(planted, 'plot-1', 667);
    expect(ripe.fruit).toBe('Aqua Fruit');
  });
  it('cocoons still emerge at now + 10 under world time', () => {
    const base = newGardenRecord('004', 1);
    const formed = {
      ...base,
      garden: { dive: 30, glide: 30, sprint: 30, might: 30, endurance: 30 },
    };
    const entered = enterCocoon(formed, 660);
    expect(entered.cocoon!.endsAt).toBe(670);
    expect(tickCocoon(entered, 669).cocoon).not.toBeNull();
    const done = tickCocoon(entered, 670);
    expect(done.cocoon).toBeNull();
    expect(done.gardenAge).toBeCloseTo(0.1);
  });
});

describe('S1 TAIL part 2 — GardenView call sites read the world clock', () => {
  it('GardenView subscribes to the anchor and drives every timer from nowFor()', () => {
    expect(gardenView.includes('gardenNowMinutes')).toBe(true);
    expect(gardenView.includes('useGameStore(s => s.worldClock)')).toBe(true);
    expect(gardenView.includes("plantPlot(rec, p.id, 'Aqua Fruit', nowFor())")).toBe(true);
    expect(gardenView.includes('harvestPlot(rec, p.id, now)')).toBe(true);
    expect(gardenView.includes('enterCocoon(rec, nowFor())')).toBe(true);
    expect(gardenView.includes('tickCocoon(rec, nowFor())')).toBe(true);
    // The old manual-counter call sites must be gone.
    expect(gardenView.includes("plantPlot(rec, p.id, 'Aqua Fruit', gardenMinutes)")).toBe(false);
    expect(gardenView.includes('harvestPlot(rec, p.id, gardenMinutes)')).toBe(false);
    expect(gardenView.includes('enterCocoon(rec, gardenMinutes)')).toBe(false);
    expect(gardenView.includes('tickCocoon(rec, gardenMinutes)')).toBe(false);
  });
  it('the +7 button survives only behind the unanchored branch', () => {
    expect(gardenView.includes('Advance Garden Time +7')).toBe(true);
    // The anchored branch (world-clock note) precedes the +7 button in
    // the file, i.e. the button is the else-branch, not unconditional.
    expect(gardenView.indexOf('Garden time follows the world clock')).toBeLessThan(
      gardenView.indexOf('Advance Garden Time +7'),
    );
  });
});
