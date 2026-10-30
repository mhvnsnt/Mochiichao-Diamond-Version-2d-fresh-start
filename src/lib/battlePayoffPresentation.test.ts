/**
 * Presentation port locks (PRESENTATION-SPEC.md): the summary
 * window's geometry must stay equal to the source constants from
 * pokeheartgold battle_command.c, Task_GetExp
 * STATE_GET_EXP_LEVEL_UP_SUMMARY_INIT —
 * AddWindowParameterized(bg, GF_BG_LYR_MAIN_2, 0x11, 0x7, 14, 12,
 * 11, 9 + 1) in 8-px tiles on the 256x192 DS main screen — and the
 * diff/true page columns from SUMMARY_PRINT_DIFF / _PRINT_TRUE
 * (names x=0, "+N" x=80 with 2 digits; clear rect (80, 0, 36, 96);
 * values x=72, 3 digits, right-aligned within width 36). If a future
 * edit "designs" the window instead of porting it, these fail.
 */
import { describe, expect, it } from 'vitest';
import { PAYOFF_SUMMARY_WINDOW } from '../components/game/BattlePayoffSequence';

describe('payoff summary window geometry (ported, not designed)', () => {
  it('window rect matches AddWindowParameterized(0x11, 0x7, 14, 12) tiles', () => {
    expect(PAYOFF_SUMMARY_WINDOW.leftPct).toBeCloseTo((17 * 8 / 256) * 100, 6);
    expect(PAYOFF_SUMMARY_WINDOW.topPct).toBeCloseTo((7 * 8 / 192) * 100, 6);
    expect(PAYOFF_SUMMARY_WINDOW.widthPct).toBeCloseTo((14 * 8 / 256) * 100, 6);
    expect(PAYOFF_SUMMARY_WINDOW.heightPct).toBeCloseTo((12 * 8 / 192) * 100, 6);
  });

  it('rows are 16px of the 96px window height (six stats)', () => {
    expect(PAYOFF_SUMMARY_WINDOW.rowHeightPct).toBeCloseTo(100 / 6, 6);
  });

  it('diff column sits at x=80 of the 112px window', () => {
    expect(PAYOFF_SUMMARY_WINDOW.diffColumnLeftPct).toBeCloseTo((80 / 112) * 100, 6);
  });

  it('true values right-align ending at x=72+36 of the window', () => {
    expect(PAYOFF_SUMMARY_WINDOW.trueValueRightPct).toBeCloseTo(((72 + 36) / 112) * 100, 6);
  });

  it('nameplate sits at the source sprite position (176, 8)', () => {
    expect(PAYOFF_SUMMARY_WINDOW.nameplateLeftPct).toBeCloseTo((176 / 256) * 100, 6);
    expect(PAYOFF_SUMMARY_WINDOW.nameplateTopPct).toBeCloseTo((8 / 192) * 100, 6);
  });
});
