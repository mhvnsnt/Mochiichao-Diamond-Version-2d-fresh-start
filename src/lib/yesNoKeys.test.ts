import { describe, it, expect } from 'vitest';
import { isYesKey, isNoKey } from './yesNoKeys';

/**
 * Yes/No keys (audit-plan Y/N unification): one shared translation
 * for every yes/no prompt. Y confirms, N cancels, nothing else
 * answers — the same answers every prompt already used.
 */
describe('yesNoKeys', () => {
  const key = (k: string) => ({ key: k }) as KeyboardEvent;
  it('answers YES on y/Y only', () => {
    expect(isYesKey(key('y'))).toBe(true);
    expect(isYesKey(key('Y'))).toBe(true);
    expect(isYesKey(key('n'))).toBe(false);
    expect(isYesKey(key('Enter'))).toBe(false);
  });
  it('answers NO on n/N only', () => {
    expect(isNoKey(key('n'))).toBe(true);
    expect(isNoKey(key('N'))).toBe(true);
    expect(isNoKey(key('y'))).toBe(false);
    expect(isNoKey(key('Escape'))).toBe(false);
  });
});
