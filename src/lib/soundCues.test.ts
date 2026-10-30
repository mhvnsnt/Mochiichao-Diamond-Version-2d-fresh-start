// Sound cue tests (sound-wiring lane, 2026-10-29).
//
// Three guards, mirroring the source games' law that no surface is
// allowed to go quiet:
// 1. Every registered cue resolves to a voice that actually exists
//    in the audio manager (a cue pointing at nothing fails here,
//    not silently in the game).
// 2. Every audited surface still carries its cue call sites — the
//    coverage contract in soundCues.ts (AUDITED_SURFACES) is read
//    against the real files; delete a playCue call and this fails.
// 3. The spam gate: a throttled cue cannot re-fire inside its
//    minimum interval (held keys and hover storms stay one voice).

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SFX_VOICE_NAMES, sfxVoiceSpec } from "./audio-system";
import {
  AUDITED_SURFACES,
  CUE_IDS,
  CUE_REGISTRY,
  cueMarkFired,
  cueShouldFire,
  resetCueGate,
} from "./soundCues";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "..");

describe("cue registry resolves", () => {
  it("every cue id maps to an existing voice", () => {
    for (const id of CUE_IDS) {
      const def = CUE_REGISTRY[id];
      expect(def, `cue ${id} has no registry entry`).toBeDefined();
      expect(SFX_VOICE_NAMES, `cue ${id} -> voice '${def.voice}' is not in the audio manager`).toContain(def.voice);
    }
  });

  it("every voice spec is well-formed (positive durations, gains in range)", () => {
    for (const name of SFX_VOICE_NAMES) {
      const spec = sfxVoiceSpec(name);
      expect(spec.length, `voice ${name} is empty`).toBeGreaterThan(0);
      for (const [freq, dur, wave, gain] of spec) {
        expect(dur, `voice ${name} has a non-positive duration`).toBeGreaterThan(0);
        expect(freq, `voice ${name} has a negative frequency`).toBeGreaterThanOrEqual(0);
        expect(['square', 'sine', 'triangle', 'sawtooth', 'noise']).toContain(wave);
        if (gain !== undefined) {
          expect(gain).toBeGreaterThanOrEqual(0);
          expect(gain).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("the payoff-family voices ARE registered as cues (exceptions closure)", () => {
    // Boundary history: the sound-wiring lane kept 'levelup' out
    // of the registry (payoff-owned); sound-full-coverage amended
    // the boundary for evolve/faint/badge but left levelup as a
    // named gap. The sound-exceptions lane (2026-10-29) closes it
    // under the owner's exceptions-closure order: 'levelup' is
    // registered as ritual.levelup, bound by UNIQUE_CUES to the
    // base's real level-up site, and the measured SE_EXP voice
    // 'exp' is registered as battle.expSweep, bound to the EXP
    // award beats. The payoff sequence, when it composes, fires
    // these same cues — one voice, one binding.
    const voices = new Set(CUE_IDS.map((id) => CUE_REGISTRY[id].voice));
    expect(voices.has("levelup"), "voice levelup is registered as ritual.levelup").toBe(true);
    expect(voices.has("exp"), "voice exp is registered as battle.expSweep").toBe(true);
    expect(CUE_REGISTRY["ritual.levelup"].voice).toBe("levelup");
    expect(CUE_REGISTRY["battle.expSweep"].voice).toBe("exp");
    for (const covered of ["evolve", "faint", "badge"] as const) {
      expect(voices.has(covered), `voice ${covered} is registered by the coverage lane`).toBe(true);
    }
  });
});

describe("audited surfaces keep their cues", () => {
  for (const surface of AUDITED_SURFACES) {
    it(surface.surface, () => {
      const text = readFileSync(resolve(srcRoot, surface.file.replace(/^src\//, "")), "utf8");
      for (const marker of surface.markers) {
        expect(text, `${surface.file} lost its cue call ${marker}`).toContain(marker);
      }
    });
  }
});

describe("cue gate", () => {
  it("throttled cues cannot re-fire inside their interval", () => {
    resetCueGate();
    expect(cueShouldFire("ui.cursor", 1000)).toBe(true);
    cueMarkFired("ui.cursor", 1000);
    expect(cueShouldFire("ui.cursor", 1010)).toBe(false);
    expect(cueShouldFire("ui.cursor", 1044)).toBe(false);
    expect(cueShouldFire("ui.cursor", 1045)).toBe(true);
  });

  it("unthrottled cues always fire", () => {
    resetCueGate();
    cueMarkFired("ui.confirm", 500);
    expect(cueShouldFire("ui.confirm", 500)).toBe(true);
    expect(cueShouldFire("ui.confirm", 501)).toBe(true);
  });

  it("gates are per-cue, not global", () => {
    resetCueGate();
    cueMarkFired("dialog.blip", 2000);
    expect(cueShouldFire("dialog.blip", 2010)).toBe(false);
    expect(cueShouldFire("ui.cursor", 2010)).toBe(true);
  });
});
