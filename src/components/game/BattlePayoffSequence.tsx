import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { isConfirmKey } from '../../lib/buttonMode';
import { audio } from '../../lib/audio-system';
import { playCue } from '../../lib/soundCues';
import {
  PAYOFF_STAT_ROWS,
  type ExpSegment,
  type LevelUpStep,
  type PayoffPlan,
  type RecipientPlan,
} from '../../lib/battlePayoff';

/**
 * BattlePayoffSequence — the presentation of a PayoffPlan
 * (lib/battlePayoff.ts), PORTED from the source game's own
 * presentation (pokeheartgold Task_GetExp; full citations in
 * ~/workspace/battle-payoff/PRESENTATION-SPEC.md). This module owns
 * pacing and display state ONLY. It renders no screen of its own:
 *
 *   - The payoff text goes in the HOST battle's standing bottom
 *     message window (source: BattleSystem_PrintBattleMessage into
 *     window 0, battle_system.c:1421). Hosts read `message` from the
 *     hook and show it in the window they already have.
 *   - The EXP gauge sweeps inside the HOST's player databox, which
 *     never leaves the scene (source: BattleController_
 *     EmitUpdateExpGauge, battle_controller.c:833 — the databox
 *     animates between pre-award and post-award progress; active
 *     battler only). Hosts read `expFrac` from the hook and drive
 *     their own databox gauge with it.
 *   - The ONLY element this module renders is the level-up summary
 *     window (PayoffStatWindow), at the source's geometry, over the
 *     arena: AddWindowParameterized(..., 0x11, 0x7, 14, 12, ...)
 *     tiles on the 256x192 DS scene (battle_command.c,
 *     STATE_GET_EXP_LEVEL_UP_SUMMARY_INIT), its layer raised above
 *     the battlers while the scene stays drawn underneath. +diffs,
 *     press (A/B/X/Y or touch, SEQ_SE_DP_SELECT), true values,
 *     press, window removed — once per level, however many levels
 *     the award spans. No batching, no auto-skip, no summary
 *     shortcut: the player pressing the button is the tempo.
 *   - Prize-money line last (trainer victories), in the same
 *     message window, then done.
 *
 * Commits fire back to the host at the source's own moments: the
 * EXP total lands when its message prints (onCommitExp), each level
 * lands as its fanfare plays (onCommitLevel), money lands as its
 * line prints (onCommitMoney). The host owns the store writes.
 *
 * `instant` (BATTLE SCENE OFF) applies the whole plan with no
 * presentation — the game's existing philosophy for that setting:
 * same results, no animation.
 *
 * History: the first version of this component rendered its own
 * databox copy + message panel inside a covering layer and was
 * rejected by the owner (2026-10-29 ~21:11 CDT) — Pokémon does not
 * cover the battle to pay out EXP. See PRESENTATION-SPEC.md §5.
 */

// Pacing (within the source grammar; the source's own waits are a
// printed message + a 7-frame beat before the gauge, and open-ended
// button waits at the stat window — those waits are NOT timed here).
const EXP_TEXT_MS = 700; // message print + beat before the gauge moves
const LEVEL_MSG_MS = 1150; // the fanfare gets its moment before the window
const FULL_SWEEP_MS = 1400; // one full level-span of gauge travel
const MIN_SEGMENT_MS = 160;
const BENCHED_SEGMENT_MS = 150; // non-active recipient: no sweep, brief hold

/**
 * The summary window's geometry, ported from the source constants
 * (PRESENTATION-SPEC.md §3): AddWindowParameterized tiles
 * (x=0x11, y=0x7, w=14, h=12) of 8 px on the 256x192 DS main screen,
 * expressed as fractions of the battle scene — the language seam is
 * relative geometry, the lifecycle and layout are the source's.
 */
export const PAYOFF_SUMMARY_WINDOW = {
  leftPct: (136 / 256) * 100, // 53.125
  topPct: (56 / 192) * 100, // 29.167
  widthPct: (112 / 256) * 100, // 43.75
  heightPct: (96 / 192) * 100, // 50
  rowHeightPct: 100 / 6, // six stat rows, 16 px of 96
  diffColumnLeftPct: (80 / 112) * 100, // "+N" column x=80, 2-digit
  trueValueRightPct: ((72 + 36) / 112) * 100, // values right-aligned to x=72+36
  nameplateLeftPct: (176 / 256) * 100, // nameplate sprite x=176
  nameplateTopPct: (8 / 192) * 100, // nameplate sprite y=8
} as const;

type Step =
  | { kind: 'expText'; r: RecipientPlan }
  | { kind: 'gauge'; r: RecipientPlan; seg: ExpSegment }
  | { kind: 'levelMsg'; r: RecipientPlan; lu: LevelUpStep }
  | { kind: 'statDiff'; r: RecipientPlan; lu: LevelUpStep }
  | { kind: 'statTrue'; r: RecipientPlan; lu: LevelUpStep }
  | { kind: 'money' };

function buildSteps(plan: PayoffPlan, hasMoney: boolean): Step[] {
  const steps: Step[] = [];
  for (const r of plan.recipients) {
    steps.push({ kind: 'expText', r });
    let luIdx = 0;
    for (const seg of r.segments) {
      steps.push({ kind: 'gauge', r, seg });
      if (seg.crossesLevel && luIdx < r.levelUps.length) {
        const lu = r.levelUps[luIdx++];
        steps.push({ kind: 'levelMsg', r, lu });
        steps.push({ kind: 'statDiff', r, lu });
        steps.push({ kind: 'statTrue', r, lu });
      }
    }
  }
  if (hasMoney) steps.push({ kind: 'money' });
  return steps;
}

export interface BattlePayoffSequenceProps {
  plan: PayoffPlan;
  /** The money line, phrased by the host in the game's own voice; null = no money beat. */
  moneyText?: string | null;
  instant?: boolean;
  onCommitExp: (partyIndex: number, amount: number) => void;
  onCommitLevel: (partyIndex: number) => void;
  onCommitMoney?: () => void;
  onDone: () => void;
}

export interface PayoffDisplayState {
  /** True while a plan is mounted (hosts gate their payoff rendering on this). */
  active: boolean;
  stepKind: Step['kind'] | null;
  /** Current beat's text, for the host's standing message window. */
  message: string;
  /** The recipient the current beat belongs to (null on the money beat). */
  recipient: RecipientPlan | null;
  /** Animated EXP-gauge fraction for the current recipient's databox. */
  expFrac: number;
  /** Display values for the recipient's databox during the beats
   *  (the source databox reads the battler's live data; hosts whose
   *  battle copy lags the commits show these instead). */
  dispLevel: number;
  dispHp: number;
  dispMaxHp: number;
  /** The summary window to render, or null. `mode` is the source's
   *  two pages: 'diff' (+gains) then 'true' (values). */
  statWindow: { lu: LevelUpStep; mode: 'diff' | 'true'; recipient: RecipientPlan } | null;
  /** Player press: advances the press-gated steps (summary pages,
   *  money line). Auto steps ignore it, as the source does. */
  advance: () => void;
}

const IDLE_DISPLAY: Omit<PayoffDisplayState, 'advance'> = {
  active: false,
  stepKind: null,
  message: '',
  recipient: null,
  expFrac: 0,
  dispLevel: 0,
  dispHp: 0,
  dispMaxHp: 1,
  statWindow: null,
};

/**
 * The payoff beat machine as a hook: hosts call it unconditionally
 * with `plan = null` when no payoff is running and render the
 * returned display state inside their own battle scene.
 */
export function useBattlePayoffSequence(
  plan: PayoffPlan | null,
  opts: Omit<BattlePayoffSequenceProps, 'plan'>,
): PayoffDisplayState {
  const { moneyText, instant } = opts;
  const buttonMode = useGameStore(s => s.settings.buttonMode);
  const steps = useMemo(
    () => (plan ? buildSteps(plan, !!moneyText) : []),
    [plan, moneyText],
  );
  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx] as Step | undefined;

  // Databox display state (what the player sees; commits trail it by
  // design — level/HP change exactly when the fanfare beat lands).
  const [dispLevel, setDispLevel] = useState(0);
  const [dispHp, setDispHp] = useState(0);
  const [dispMaxHp, setDispMaxHp] = useState(1);
  const [frac, setFrac] = useState(0);

  const committedRef = useRef<Set<string>>(new Set());
  const doneRef = useRef(false);
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;

  // A new plan restarts the machine. Render-phase adjustment (not an
  // effect) so the step-entry effect below never runs with a stale
  // step index against a fresh plan.
  const [mountedPlan, setMountedPlan] = useState(plan);
  if (mountedPlan !== plan) {
    setMountedPlan(plan);
    committedRef.current = new Set();
    doneRef.current = false;
    setStepIdx(0);
  }

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    callbacksRef.current.onDone();
  };

  // Instant mode: apply everything, show nothing.
  useEffect(() => {
    if (!instant || !plan) return;
    for (const r of plan.recipients) {
      callbacksRef.current.onCommitExp(r.partyIndex, r.expAwarded);
      for (let i = 0; i < r.levelUps.length; i++) callbacksRef.current.onCommitLevel(r.partyIndex);
    }
    if (moneyText) callbacksRef.current.onCommitMoney?.();
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant, plan]);

  // Step entry: commits, cues, timers, gauge animation.
  useEffect(() => {
    if (instant || !plan) return;
    if (!step) { finish(); return; }
    const key = (k: string) => `${stepIdx}:${k}`;
    const once = (k: string, fn: () => void) => {
      if (committedRef.current.has(key(k))) return;
      committedRef.current.add(key(k));
      fn();
    };

    if (stepIdx === 0) {
      once('victoryCue', () => {
        if (plan.victoryCueAt === 'start') {
          try { audio.playVictoryJingle(); } catch { /* audio is garnish; the sequence never blocks on it */ }
        }
      });
    }

    switch (step.kind) {
      case 'expText': {
        once('exp', () => callbacksRef.current.onCommitExp(step.r.partyIndex, step.r.expAwarded));
        setDispLevel(step.r.startLevel);
        setDispHp(step.r.startHp);
        setDispMaxHp(step.r.startMaxHp);
        setFrac(step.r.segments[0]?.from ?? 0);
        const t = window.setTimeout(() => setStepIdx(i => i + 1), EXP_TEXT_MS);
        return () => window.clearTimeout(t);
      }
      case 'gauge': {
        const { seg } = step;
        if (!step.r.animateGauge) {
          setFrac(seg.to);
          const t = window.setTimeout(() => setStepIdx(i => i + 1), BENCHED_SEGMENT_MS);
          return () => window.clearTimeout(t);
        }
        // Sound composition (2026-10-29, per the sound-exceptions
        // lane's composition note): the measured SE_EXP held tone
        // sounds with the gauge sweep — this sequence is the firing
        // site for battle.expSweep; the hosts' award-beat calls were
        // removed in the same composition (no double-fire).
        once('sweep', () => { try { playCue('battle.expSweep'); } catch { /* garnish */ } });
        const duration = Math.max(MIN_SEGMENT_MS, Math.abs(seg.to - seg.from) * FULL_SWEEP_MS);
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          setFrac(seg.from + (seg.to - seg.from) * p);
          if (p < 1) raf = requestAnimationFrame(tick);
          else setStepIdx(i => i + 1);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      }
      case 'levelMsg': {
        once('level', () => {
          callbacksRef.current.onCommitLevel(step.r.partyIndex);
          // SEQ_ME_LVUP, recreated by our synth 'levelup' (see
          // PAYOFF_SOUND_CUES in lib/battlePayoff.ts for provenance).
          // Sound composition (2026-10-29): fired through the cue
          // registry as ritual.levelup — same voice, one binding
          // (sound-exceptions lane's composition note).
          try { playCue('ritual.levelup'); } catch { /* garnish */ }
        });
        setDispLevel(step.lu.toLevel);
        setDispMaxHp(step.lu.after.maxHp);
        setDispHp(h => h + step.lu.hpGain);
        const t = window.setTimeout(() => setStepIdx(i => i + 1), LEVEL_MSG_MS);
        return () => window.clearTimeout(t);
      }
      case 'statDiff':
      case 'statTrue':
        return; // player-paced: advance() only.
      case 'money': {
        once('money', () => {
          if (plan.victoryCueAt === 'beforeMoney') {
            try { audio.playVictoryJingle(); } catch { /* garnish */ }
          }
          callbacksRef.current.onCommitMoney?.();
        });
        return; // player-paced.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, instant, plan]);

  // Press handling: the game's confirm keys (source: A/B/X/Y or
  // touch). Only press-gated steps listen (stat window pages and the
  // money line) — auto steps ignore presses, as the source does.
  // Touch/click presses land on the summary window and on the host's
  // message window, both of which call advance().
  const advance = () => {
    if (!step) return;
    if (step.kind === 'statDiff' || step.kind === 'statTrue' || step.kind === 'money') {
      try { audio.playSfx('select'); } catch { /* garnish */ } // SEQ_SE_DP_SELECT in the source
      if (stepIdx + 1 >= steps.length) finish();
      else setStepIdx(i => i + 1);
    }
  };
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  useEffect(() => {
    if (instant || !plan) return;
    const handler = (e: KeyboardEvent) => {
      if (isConfirmKey(e, buttonMode)) {
        e.preventDefault();
        advanceRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [instant, plan, buttonMode]);

  if (!plan || (!step && !instant)) {
    return { ...IDLE_DISPLAY, active: !!plan && !step, advance: () => advanceRef.current() };
  }
  if (instant || !step) {
    return { ...IDLE_DISPLAY, active: false, advance: () => undefined };
  }

  const message =
    step.kind === 'expText' || step.kind === 'gauge'
      ? `${step.r.nickname} gained ${step.r.expAwarded} Exp. Points!`
      : step.kind === 'money'
        ? (moneyText ?? '')
        : `${step.r.nickname} grew to Lv. ${step.lu.toLevel}!`;

  return {
    active: true,
    stepKind: step.kind,
    message,
    recipient: step.kind === 'money' ? null : step.r,
    expFrac: frac,
    dispLevel,
    dispHp,
    dispMaxHp,
    statWindow:
      step.kind === 'statDiff' || step.kind === 'statTrue'
        ? { lu: step.lu, mode: step.kind === 'statDiff' ? 'diff' : 'true', recipient: step.r }
        : null,
    advance: () => advanceRef.current(),
  };
}

/**
 * The level-up summary window — the one element the payoff adds to
 * the scene, at the source's geometry (PAYOFF_SUMMARY_WINDOW),
 * rendered inside the host's arena element. Diff page: stat names +
 * "+N" gains (2-digit grammar, source msg_0197_00947/00948); press;
 * true page: only the gains column is cleared and the values print
 * right-aligned (3-digit grammar, msg_0197_00949) — the names stay,
 * as the source's FillWindowPixelRect(80, 0, 36, 96) leaves them.
 * For a recipient who is not the databox's battler, the source first
 * loads a nameplate ("{name} Lv. {level}", sprite at (176, 8)); the
 * window carries the same line in that case.
 */
export function PayoffStatWindow({
  lu,
  mode,
  recipient,
  onAdvance,
}: {
  lu: LevelUpStep;
  mode: 'diff' | 'true';
  recipient: RecipientPlan;
  onAdvance: () => void;
}) {
  const g = PAYOFF_SUMMARY_WINDOW;
  return (
    <>
      {!recipient.animateGauge && (
        <div
          className="absolute z-30 game-panel px-2 py-1 text-xs font-bold text-white pointer-events-none"
          style={{ left: `${g.nameplateLeftPct}%`, top: `${g.nameplateTopPct}%`, fontFamily: 'var(--battle-font, "Trebuchet MS", sans-serif)' }}
          data-payoff-nameplate
        >
          {recipient.nickname} Lv. {lu.toLevel}
        </div>
      )}
      <div
        className="absolute z-30 game-panel px-3 py-2 cursor-pointer pointer-events-auto"
        style={{
          left: `${g.leftPct}%`,
          top: `${g.topPct}%`,
          width: `${g.widthPct}%`,
          height: `${g.heightPct}%`,
          fontFamily: 'var(--battle-font, "Trebuchet MS", sans-serif)',
        }}
        onClick={onAdvance}
        data-payoff-stat-window
        data-payoff-stat-mode={mode}
      >
        <div className="flex flex-col h-full">
          {PAYOFF_STAT_ROWS.map(row => {
            const before = lu.before[row.key];
            const after = lu.after[row.key];
            return (
              <div key={row.key} className="relative flex items-center" style={{ height: `${g.rowHeightPct}%` }}>
                <span className="text-slate-300 font-bold text-sm">{row.label}</span>
                {mode === 'diff' ? (
                  <span
                    className="absolute text-emerald-300 font-bold text-sm"
                    style={{ left: `${g.diffColumnLeftPct}%` }}
                  >
                    +{after - before}
                  </span>
                ) : (
                  <span
                    className="absolute text-white font-bold text-sm text-right"
                    style={{ right: `${100 - g.trueValueRightPct}%`, width: `${g.trueValueRightPct - g.diffColumnLeftPct + 10}%` }}
                  >
                    {after}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * Compatibility mount for hosts that cannot use the hook: runs the
 * beat machine and renders ONLY the summary window (positioned
 * within the nearest positioned ancestor). It deliberately renders
 * no databox and no message window — hosts using this mount must
 * drive those from useBattlePayoffSequence themselves; the two
 * shipped hosts use the hook directly.
 */
export default function BattlePayoffSequence(props: BattlePayoffSequenceProps) {
  const display = useBattlePayoffSequence(props.plan, props);
  if (!display.statWindow) return null;
  return (
    <div className="absolute inset-0 pointer-events-none" data-payoff-sequence>
      <PayoffStatWindow
        lu={display.statWindow.lu}
        mode={display.statWindow.mode}
        recipient={display.statWindow.recipient}
        onAdvance={display.advance}
      />
    </div>
  );
}
