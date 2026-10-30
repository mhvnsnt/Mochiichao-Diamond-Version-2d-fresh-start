import { describe, expect, it } from 'vitest';
import { FLDTANIME, cycleLength, tileAnimeFrame, tileAnimeSignature } from './tileAnime';

// The tables below are the extracted fldtanime.narc member-0 values
// (pret-pokeheartgold files/data/fldtanime.narc; extraction receipt
// ~/workspace/env-pullin-hgss-bw2/extracted/hgss/fldtanime-cycles.json).
// These tests lock the port against silent edits: if a table value
// changes, the change must be a deliberate, recorded one.

describe('fldtanime cycle tables (ported verbatim)', () => {
  it('has all 9 source entries', () => {
    expect(Object.keys(FLDTANIME).sort()).toEqual([
      'dsea_on', 'flower01', 'flower02', 'r_sea_rock', 'sea_on',
      'sea_rock', 'sea_rock_m', 'swave_p', 'swave_un',
    ]);
  });

  it('sea_on: 6 frames x 18 ticks, loop 108', () => {
    expect(cycleLength(FLDTANIME.sea_on)).toBe(108);
    expect(tileAnimeFrame('sea_on', 0)).toBe(0);
    expect(tileAnimeFrame('sea_on', 17)).toBe(0);
    expect(tileAnimeFrame('sea_on', 18)).toBe(1);
    expect(tileAnimeFrame('sea_on', 90)).toBe(5);
    expect(tileAnimeFrame('sea_on', 108)).toBe(0); // loops
  });

  it('swave_p: ping-pong with the 38-tick hold on frame 5', () => {
    expect(cycleLength(FLDTANIME.swave_p)).toBe(90);
    expect(tileAnimeFrame('swave_p', 0)).toBe(0);
    expect(tileAnimeFrame('swave_p', 12)).toBe(1);
    expect(tileAnimeFrame('swave_p', 24)).toBe(5); // crest reached
    expect(tileAnimeFrame('swave_p', 61)).toBe(5); // still holding
    expect(tileAnimeFrame('swave_p', 62)).toBe(4); // release
    expect(tileAnimeFrame('swave_p', 89)).toBe(0);
  });

  it('flower01: 0,1,0,2 sway at 18 ticks each', () => {
    expect(FLDTANIME.flower01.map(s => s.frame)).toEqual([0, 1, 0, 2]);
    expect(cycleLength(FLDTANIME.flower01)).toBe(72);
  });

  it('sea_rock: crest frame 5 holds 10 ticks, others 8', () => {
    expect(FLDTANIME.sea_rock[5]).toEqual({ frame: 5, ticks: 10 });
    expect(cycleLength(FLDTANIME.sea_rock)).toBe(90);
  });

  it('phase shifts the cycle (scattered wave marks)', () => {
    expect(tileAnimeFrame('sea_on', 0, 18)).toBe(1);
    expect(tileAnimeFrame('sea_on', 0, 108)).toBe(0);
  });

  it('signature changes as cycles advance', () => {
    expect(tileAnimeSignature(0)).not.toBe(tileAnimeSignature(18));
  });
});
