import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Cheat panel presentation guards (cheat-presentation lane,
 * PRESENTATION-SPEC.md). Source-scan tests in the same pattern as
 * the sound lane's AUDITED_SURFACES: they fail the build if the
 * panel ever falls back to the unreadable shape — body text with no
 * font role, the all-descriptions wall, or NOCLIP shown without its
 * DEBUG TOOL tag.
 */
const here = dirname(fileURLToPath(import.meta.url));
const panel = readFileSync(join(here, '../components/game/CheatCodesPanel.tsx'), 'utf8');

describe('cheat panel presentation', () => {
  it('body text takes the dialogue font role (readable body treatment)', () => {
    expect(panel).toContain('var(--dialogue-font');
    expect(panel).toContain('var(--menu-text-size');
    expect(panel).toContain('var(--menu-line-height');
  });

  it('list rows take the menu font role and labels the small font role', () => {
    expect(panel).toContain('var(--menu-font');
    expect(panel).toContain('var(--small-font');
  });

  it('renders ONE description region for the selected code (no all-descriptions wall)', () => {
    expect(panel).toContain('{selected.description}');
    expect(panel).not.toContain('{d.description}');
  });

  it('NOCLIP carries the DEBUG TOOL tag on its row', () => {
    expect(panel).toContain('DEBUG TOOL');
  });

  it('toggle states render as words on the row (ON/OFF)', () => {
    expect(panel).toContain('rowState');
    expect(panel).toContain("'ON'");
    expect(panel).toContain("'OFF'");
  });

  it('body copy never uses text-xs (the old unreadable 12px wall size)', () => {
    expect(panel).not.toContain('text-xs');
  });
});
