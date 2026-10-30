/**
 * Sound cue registry — the one door every interaction surface uses
 * to make a sound (sound-wiring lane, 2026-10-29).
 *
 * Why this exists: the audio manager (audio-system.ts) already had
 * fifteen synthesized SFX voices and a wiring checklist, and ZERO
 * call sites — the game was silent because nothing ever asked it to
 * speak. Surfaces must not call audio.playSfx() directly: they call
 * playCue() with a stable cue ID from the registry below, so the
 * voice for an action class can be re-measured / re-rendered in one
 * place and every surface follows (the source games' own law: one
 * cue per action class, everywhere, always — Gen 3's SE_SELECT has
 * 513 PlaySE call sites in pokeemerald's src; it is the same voice
 * in every menu in the game).
 *
 * Voices are rendered to parameters measured from the Pokemon
 * decomp sound data we hold (see SFX_DEFS in audio-system.ts and
 * ~/workspace/sound-wiring/GRAMMAR.md): exact pitches, durations,
 * velocities and wave classes from Gen 3 SE MIDI + Gen 2 SFX
 * assembly. The parameters come over exactly; recordings do not —
 * every voice is our own oscillator/noise rendition.
 *
 * Boundary: the battle-payoff lane owns the win / level-up jingles
 * and the post-battle sequence sounds. This registry owns UI /
 * interaction cues and world / event feedback cues. 'levelup'
 * stays the payoff lane's (its fanfare fires inside the payoff
 * sequence). Update (sound-exceptions lane, 2026-10-29, owner's
 * exceptions-closure order — "the missing parts need sound of
 * their own"): the level-up fanfare and the EXP gauge-sweep tone
 * are registered HERE now (ritual.levelup / battle.expSweep) and
 * fired at the base hosts' real EXP-award and level-up beats, so
 * the moment sounds in the base build instead of waiting for the
 * payoff package to compose. When the payoff sequence lands, it
 * fires these same cues (PAYOFF_SOUND_CUES.levelUpFanfare already
 * names the 'levelup' voice) — one voice, one binding, no
 * double-fire: the payoff sequence replaces the hosts' award
 * beats, it does not add to them.
 * Update (sound-full-coverage lane, 2026-10-29): the
 * 'evolve', 'faint' and 'badge' voices ARE registered here now
 * (ritual.evolve / battle.faint / ritual.badge) — the owner's
 * 100%-wired order closed the "voice exists but nothing calls it"
 * gap at the surfaces that exist today (evolution prompt, battle
 * faints, dojo badge award); the payoff sequence does not fire
 * those three, so no double-fire is created.
 *
 * Sound on/off: the game's Settings surface has no on/off row (its
 * SOUND row is MONO/STEREO channel layout only — gameSettings.ts),
 * so per the standing note in bootAudio.ts the switch lives in the
 * audio module: cuesOn()/setCuesOn() below read/write the manager's
 * persisted `muted` setting (localStorage mochiichao_audio_v1).
 * playCue() never throws into a click handler: audio failure is
 * silence, never a crash.
 */

import { audio, type SfxName } from './audio-system';

export type CueId =
  | 'ui.cursor'
  | 'ui.confirm'
  | 'ui.cancel'
  | 'ui.error'
  | 'ui.save'
  | 'menu.open'
  | 'menu.close'
  | 'dialog.blip'
  | 'encounter.sting'
  | 'world.step'
  | 'world.bump'
  | 'world.door'
  | 'world.exit'
  | 'plex.heal'
  | 'item.get'
  | 'item.use'
  | 'shop.register'
  | 'capture.throw'
  | 'capture.shake'
  | 'capture.wobble'
  | 'capture.click'
  | 'capture.success'
  | 'capture.fail'
  | 'battle.flee'
  | 'battle.hit'
  | 'battle.hitSuper'
  | 'battle.hitWeak'
  | 'battle.faint'
  | 'battle.switch'
  | 'ritual.badge'
  | 'ritual.evolve'
  | 'ritual.levelup'
  | 'battle.expSweep'
  | 'pc.on'
  | 'pc.off'
  | 'pc.login';

export interface CueDef {
  /** Voice in the audio manager this cue resolves to. */
  voice: SfxName;
  /** Minimum ms between plays (spam guard for held keys / hover). */
  minIntervalMs?: number;
  /** Where the voice's spec comes from (measured source or house). */
  source: string;
}

export const CUE_REGISTRY: Record<CueId, CueDef> = {
  'ui.cursor': { voice: 'select', minIntervalMs: 45, source: 'MEASURED Gen 3 SE_SELECT' },
  'ui.confirm': { voice: 'confirm', source: 'CONSTRUCTED from SE_PIN pitches (Gen 4 DECIDE class, name-grade)' },
  'ui.cancel': { voice: 'cancel', source: 'CONSTRUCTED on SE_BOO direction law' },
  'ui.error': { voice: 'error', source: 'MEASURED Gen 3 SE_BOO' },
  'ui.save': { voice: 'save', source: 'MEASURED Gen 3 SE_SAVE' },
  'menu.open': { voice: 'win_open', source: 'MEASURED Gen 3 SE_WIN_OPEN' },
  'menu.close': { voice: 'win_close', source: 'CONSTRUCTED inverse of SE_WIN_OPEN (Gen 4 OPEN2/CLOSE2 pair, name-grade)' },
  'dialog.blip': { voice: 'blip', minIntervalMs: 30, source: 'MEASURED Gen 2 SFX_READ_TEXT pitch/duty (Gen 4 TALK2 class)' },
  'encounter.sting': { voice: 'sting', source: 'MEASURED Gen 3 SE_PIN (the "!" sound)' },
  'world.step': { voice: 'step', source: 'HOUSE (engine throttles at 180 ms)' },
  'world.bump': { voice: 'bump', minIntervalMs: 150, source: 'MEASURED Gen 3 SE_WALL_HIT' },
  'world.door': { voice: 'door', source: 'MEASURED Gen 3 SE_DOOR' },
  'world.exit': { voice: 'exit', source: 'MEASURED Gen 3 SE_EXIT' },
  'plex.heal': { voice: 'heal', source: 'MEASURED Gen 2 SFX_FULL_HEAL (pitch/duty/pattern; unit scale disclosed)' },
  'item.get': { voice: 'item', source: 'HOUSE short form (source pickup is a jingle-class ME)' },
  'item.use': { voice: 'use_item', source: 'MEASURED Gen 3 SE_USE_ITEM' },
  'shop.register': { voice: 'register', source: 'MEASURED Gen 3 SE_SHOP' },
  'capture.throw': { voice: 'throw', source: 'MEASURED pitches, Gen 3 SE_BALL_THROW (sampled snare in source, square render)' },
  'capture.shake': { voice: 'shake', source: 'MEASURED Gen 3 SE_BALL' },
  'capture.wobble': { voice: 'wobble', source: 'MEASURED Gen 2 SFX_BALL_WOBBLE (pitch/duty; sweep stepped)' },
  'capture.click': { voice: 'click', source: 'MEASURED Gen 3 SE_CLICK' },
  'capture.success': { voice: 'catch', source: 'HOUSE ritual jingle (click is the measured lock sound)' },
  'capture.fail': { voice: 'catch_fail', source: 'MEASURED Gen 3 SE_FAILURE' },
  'battle.flee': { voice: 'flee', source: 'MEASURED Gen 3 SE_FLEE' },
  // Battle-domain classes added by the sound-full-coverage lane
  // (2026-10-29): in the source these fire from
  // battle_script_commands.c on every damaging hit / faint / switch.
  'battle.hit': { voice: 'hit', source: 'MEASURED Gen 3 SE_EFFECTIVE' },
  'battle.hitSuper': { voice: 'hit_super', source: 'MEASURED Gen 3 SE_SUPER_EFFECTIVE' },
  'battle.hitWeak': { voice: 'hit_weak', source: 'MEASURED Gen 3 SE_NOT_EFFECTIVE' },
  'battle.faint': { voice: 'faint', source: 'MEASURED Gen 3 SE_FAINT' },
  'battle.switch': { voice: 'switch', source: 'MEASURED Gen 3 SE_SWITCH' },
  'ritual.badge': { voice: 'badge', source: 'HOUSE voice (source class: MUS_OBTAIN_BADGE jingle)' },
  'ritual.evolve': { voice: 'evolve', source: 'HOUSE voice (source class: MUS_EVOLUTION / MUS_EVOLVED)' },
  // Sound-exceptions lane (2026-10-29): the two payoff-family
  // sounds the coverage audit left as a named gap, closed in the
  // base under the owner's exceptions-closure order.
  'ritual.levelup': { voice: 'levelup', source: 'HOUSE voice (source class: SEQ_ME_LVUP — Black SEQ 1301 / HGSS SEQ 1184; payoff package PAYOFF_SOUND_CUES provenance)' },
  'battle.expSweep': { voice: 'exp', source: 'MEASURED Gen 3 SE_EXP (F4 349.2 Hz held 1.625 s, pokeemerald se_exp.mid via sound-full-coverage DECISIONS.md)' },
  'pc.on': { voice: 'pc_on', source: 'MEASURED Gen 3 SE_PC_ON' },
  'pc.off': { voice: 'pc_off', source: 'MEASURED Gen 3 SE_PC_OFF' },
  'pc.login': { voice: 'pc_login', source: 'MEASURED Gen 3 SE_PC_LOGIN' },
};

// ------------------------------------------------------------------
// Uniqueness table (the "sacred" map, decided from the source code —
// DECISIONS.md in ~/workspace/sound-full-coverage/): in Pokemon a
// sound is either SHARED (one voice for an action class, everywhere:
// cursor / confirm / cancel / blip / hit) or BOUND to exactly one
// function and never reused (save jingle only saves, heal jingle
// only heals, badge jingle only awards a badge...). Bound cues are
// listed here with the files allowed to call them — one function may
// live in both battle hosts. soundCoverage.test.ts fails the build
// if a bound cue is ever called from anywhere else. The owner's own
// additions to this table come after he hears the sounds in the
// playable build (open slot, DECISIONS.md §d) — none are invented.
// ------------------------------------------------------------------

export interface UniqueCueBinding {
  /** The one function this sound belongs to. */
  boundTo: string;
  /** Files allowed to fire it (both battle hosts may host one function). */
  allowedFiles: string[];
}

export const UNIQUE_CUES: Partial<Record<CueId, UniqueCueBinding>> = {
  'ui.save': { boundTo: 'saving the game', allowedFiles: ['components/game/GameShell.tsx', 'components/SaveMenu.tsx', 'world/WorldEngine.tsx'] },
  'plex.heal': { boundTo: 'the Center/Plex heal', allowedFiles: ['world/WorldEngine.tsx'] },
  'capture.success': { boundTo: 'a successful capture', allowedFiles: ['world/WorldEngine.tsx', 'components/views/BattleView.tsx'] },
  'shop.register': { boundTo: 'a completed sale', allowedFiles: ['components/views/ShopView.tsx'] },
  'ritual.badge': { boundTo: 'receiving a dojo badge', allowedFiles: ['world/WorldEngine.tsx'] },
  'ritual.evolve': { boundTo: 'a creature evolving', allowedFiles: ['components/views/BattleView.tsx'] },
  // Sound-exceptions lane: the fanfare belongs to the level-up
  // moment and nothing else. BattleView is the base's real
  // level-up site today; when the payoff sequence composes, its
  // component (components/game/BattlePayoffSequence.tsx) becomes
  // the firing site and this list is amended in that composition
  // — the binding moves with the function, it never widens.
  // Landing composition (2026-10-29): the payoff sequence is the
  // firing site for both award-beat cues (sound-exceptions lane's
  // composition note 1) — the hosts' award-beat calls were removed
  // in the same composition, so the sequence is the only site.
  'ritual.levelup': { boundTo: 'a creature leveling up', allowedFiles: ['components/game/BattlePayoffSequence.tsx'] },
  'battle.expSweep': { boundTo: 'the EXP award / gauge beat after a won battle', allowedFiles: ['components/game/BattlePayoffSequence.tsx'] },
  'pc.login': { boundTo: 'logging in to the PC', allowedFiles: ['components/views/PcView.tsx'] },
};

export const CUE_IDS = Object.keys(CUE_REGISTRY) as CueId[];

// ------------------------------------------------------------------
// Gate: pure, testable. A cue fires at most once per minIntervalMs.
// ------------------------------------------------------------------

const lastFiredAt = new Map<CueId, number>();

export function cueShouldFire(id: CueId, nowMs: number): boolean {
  const min = CUE_REGISTRY[id]?.minIntervalMs ?? 0;
  if (min <= 0) return true;
  const last = lastFiredAt.get(id);
  return last === undefined || nowMs - last >= min;
}

export function cueMarkFired(id: CueId, nowMs: number): void {
  lastFiredAt.set(id, nowMs);
}

/** Test/demo helper: forget all gate state. */
export function resetCueGate(): void {
  lastFiredAt.clear();
}

/**
 * Fire a cue. Returns true when the cue passed the gate and was
 * handed to the audio manager. Never throws: before the first user
 * gesture the browser may hold the AudioContext suspended, and in
 * non-browser contexts there is no audio at all — both are silence,
 * not errors.
 */
export function playCue(id: CueId): boolean {
  const def = CUE_REGISTRY[id];
  if (!def) return false;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (!cueShouldFire(id, now)) return false;
  cueMarkFired(id, now);
  try {
    audio.playSfx(def.voice);
  } catch {
    // No audio available (SSR/tests/autoplay hold): stay silent.
  }
  return true;
}

// ------------------------------------------------------------------
// Sound on/off — carried by the audio module (see header note).
// ------------------------------------------------------------------

export function cuesOn(): boolean {
  try {
    return !audio.getSettings().muted;
  } catch {
    return true;
  }
}

export function setCuesOn(on: boolean): void {
  try {
    audio.setMuted(!on);
  } catch {
    // Settings persistence is best-effort; silence is acceptable.
  }
}

// ------------------------------------------------------------------
// Coverage contract: every audited interaction surface and the cue
// call that must exist in its file. soundCues.test.ts reads the
// real files and fails if any marker disappears — a surface that
// loses its cue fails the build, like the source games' law that
// no menu is allowed to go quiet.
// ------------------------------------------------------------------

export interface AuditedSurface {
  surface: string;
  file: string;
  markers: string[];
}

export const AUDITED_SURFACES: AuditedSurface[] = [
  { surface: 'Shared menu list (pause menu rows)', file: 'src/components/game/MenuList.tsx', markers: ["playCue('ui.cursor')", "playCue('ui.confirm')"] },
  { surface: 'Pause menu open/close + save row', file: 'src/components/game/GameShell.tsx', markers: ["playCue('menu.open')", "playCue('menu.close')", "playCue('ui.save')"] },
  { surface: 'Dialogue typewriter blip + YES/NO choice', file: 'src/components/game/DialogueBox.tsx', markers: ["playCue('dialog.blip')", "playCue(yes ? 'ui.confirm' : 'ui.cancel')"] },
  { surface: 'Overworld: step, bump, door, exit, sting, heal, grants, battle actions, capture, flee, submenu back, sealed door, quicksave', file: 'src/world/WorldEngine.tsx', markers: ["playCue('world.step')", "playCue('world.bump')", "playCue('world.door')", "playCue('world.exit')", "playCue('encounter.sting')", "playCue('plex.heal')", "playCue('item.get')", "playCue('ui.confirm')", "playCue('ui.cancel')", "playCue('ui.error')", "playCue('ui.save')", "playCue('capture.throw')", "playCue('capture.wobble')", "playCue('capture.click')", "playCue('capture.success')", "playCue('capture.fail')", "playCue('battle.flee')", "playCue('battle.hit')", "playCue('battle.faint')", "playCue('battle.switch')", "playCue('ritual.badge')"] },
  { surface: 'Shop: mode, cursor, confirm, register, not-enough-credits', file: 'src/components/views/ShopView.tsx', markers: ["playCue('ui.cursor')", "playCue('ui.confirm')", "playCue('ui.cancel')", "playCue('ui.error')", "playCue('shop.register')"] },
  { surface: 'Save menu: save, load, cancel, select', file: 'src/components/SaveMenu.tsx', markers: ["playCue('ui.save')", "playCue('ui.confirm')", "playCue('ui.cancel')", "playCue('ui.cursor')"] },
  { surface: 'PC storage: power on/off, login, cursor, confirm', file: 'src/components/views/PcView.tsx', markers: ["playCue('pc.on')", "playCue('pc.off')", "playCue('pc.login')", "playCue('ui.cursor')", "playCue('ui.confirm')"] },
  { surface: 'Bag: use item, errors, toss, pockets', file: 'src/components/views/BagView.tsx', markers: ["playCue('item.use')", "playCue('ui.error')", "playCue('ui.confirm')", "playCue('ui.cancel')", "playCue('ui.cursor')"] },
  { surface: 'Battle view: move cursor/confirm, capture throw/shake/click/success/fail, flee, no-cubes error, hit/effectiveness at impact, faint, evolution', file: 'src/components/views/BattleView.tsx', markers: ["playCue('ui.cursor')", "playCue('ui.confirm')", "playCue('ui.error')", "playCue('capture.throw')", "playCue('capture.shake')", "playCue('capture.click')", "playCue('capture.success')", "playCue('capture.fail')", "playCue('battle.flee')", "playCue('battle.hit')", "playCue('battle.hitSuper')", "playCue('battle.hitWeak')", "playCue('battle.faint')", "playCue('battle.switch')", "playCue('ritual.evolve')"] },
  { surface: 'Battle payoff sequence: EXP gauge sweep + level-up fanfare (the award beats; hosts fire neither)', file: 'src/components/game/BattlePayoffSequence.tsx', markers: ["playCue('battle.expSweep')", "playCue('ritual.levelup')"] },
];
