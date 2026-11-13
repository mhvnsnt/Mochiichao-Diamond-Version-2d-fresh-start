import { describe, it, expect } from 'vitest';
import {
  isExitOpen,
  exitSealedText,
  isDoorOpen,
  sealedDoorText,
} from '../src/lib/doorGate';

// Region 1 step (i), 2026-11-13: exit gates. Doors honoured their
// condition since Sequence 3, but WorldEngine's walk-into path fired
// every EXIT unconditionally — the binary_fields -> victory_route
// exit carried `condition: "badges>=8"` and the sector0 -> boot_bay
// exit carried `hmNeeded: "Wave"` as unenforced metadata. These
// unit tests pin the gate module WorldEngine.move() now calls.
// Fail-closed throughout: an unrecognised condition or technique
// name must never silently open a gated exit.

const EIGHT_BADGES = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];

describe('isExitOpen', () => {
  it('an exit with no gate fields is open', () => {
    expect(isExitOpen({ to: 'route_1' }, [], {})).toBe(true);
    expect(isExitOpen(null, [], {})).toBe(true);
    expect(isExitOpen(undefined, [], {})).toBe(true);
  });

  it('badges>=8 opens at 8 badges and seals below', () => {
    const exit = { to: 'victory_route', condition: 'badges>=8' };
    expect(isExitOpen(exit, EIGHT_BADGES, {})).toBe(true);
    expect(isExitOpen(exit, EIGHT_BADGES.slice(0, 7), {})).toBe(false);
    expect(isExitOpen(exit, [], {})).toBe(false);
  });

  it('hmNeeded Wave opens only when the Wave technique is held', () => {
    const exit = { to: 'boot_bay', hmNeeded: 'Wave' };
    expect(isExitOpen(exit, [], { 'tech.wave': true })).toBe(true);
    expect(isExitOpen(exit, [], {})).toBe(false);
    expect(isExitOpen(exit, [], { 'tech.wave': false })).toBe(false);
    // A different technique does not stand in for Wave.
    expect(isExitOpen(exit, [], { 'tech.slice': true })).toBe(false);
  });

  it('an unknown technique name is closed (fail-closed)', () => {
    expect(isExitOpen({ hmNeeded: 'Nope' }, EIGHT_BADGES, {})).toBe(false);
  });

  it('an unrecognised condition is closed (fail-closed)', () => {
    // The Mauveville Arena 'ciphers>=10' precedent: ciphers exist
    // nowhere in the store/engine, so this door stays sealed.
    expect(isExitOpen({ condition: 'ciphers>=10' }, EIGHT_BADGES, {})).toBe(false);
  });

  it('condition AND hmNeeded must both pass', () => {
    const exit = { condition: 'badges>=8', hmNeeded: 'Wave' };
    expect(isExitOpen(exit, EIGHT_BADGES, { 'tech.wave': true })).toBe(true);
    expect(isExitOpen(exit, EIGHT_BADGES, {})).toBe(false);
    expect(isExitOpen(exit, [], { 'tech.wave': true })).toBe(false);
  });
});

describe('exitSealedText', () => {
  it('names the badge requirement for a condition gate', () => {
    const text = exitSealedText(
      { to: 'victory_route', condition: 'badges>=8' },
      'Victory Route — the Gauntlet',
    );
    expect(text).toContain('Victory Route — the Gauntlet');
    expect(text).toContain('8 badges');
  });

  it('names the technique for an hmNeeded gate', () => {
    const text = exitSealedText({ to: 'boot_bay', hmNeeded: 'Wave' }, 'Boot Bay');
    expect(text).toContain('Boot Bay');
    expect(text).toContain('Wave');
  });

  it('falls back to the exit target key when no display name is given', () => {
    expect(exitSealedText({ to: 'boot_bay', hmNeeded: 'Wave' })).toContain('boot_bay');
  });

  it('an ungated exit still answers sealed, never crashes', () => {
    expect(exitSealedText({ to: 'route_1' })).toContain('is sealed.');
    expect(exitSealedText(null)).toContain('is sealed.');
  });
});

describe('door gates still work after the exit-gate addition', () => {
  it('isDoorOpen / sealedDoorText are unchanged', () => {
    expect(isDoorOpen(undefined, [])).toBe(true);
    expect(isDoorOpen('badges>=7', EIGHT_BADGES.slice(0, 7))).toBe(true);
    expect(isDoorOpen('badges>=8', EIGHT_BADGES.slice(0, 7))).toBe(false);
    expect(isDoorOpen('ciphers>=10', EIGHT_BADGES)).toBe(false);
    expect(sealedDoorText('Return Dojo — Dojo 8', 'badges>=7')).toContain('7 badges');
  });
});
