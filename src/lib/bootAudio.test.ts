// Boot / press-start audio tests (audit-plan step (g), 2026-11-13).
//
// Settled roles, already wired on main — this test PROVES them, it does
// not wire them (no second play path: duplicating the calls would play
// both sounds twice, see src/lib/music.ts):
// - BOOT = UI Art Option B rising arpeggio
//   (public/audio/mochiichao-boot-ui-art-option-b-rising-arpeggio.wav),
//   played once when the BOOT phase mounts.
// - PRESS-START = M3 Mochii Chirp
//   (public/audio/mochiichao-boot-M3-mochii-chirp.wav), played on the
//   TITLE phase when the player presses start (PRESS ANY KEY).
// Both files are original Mochiichao files already on main. Title/intro
// music is NOT covered here — held pending Title Music v2 approval.
//
// Guards:
// 1. The exported filenames are exactly the settled files (a swap to
//    M1, M2, option-a or option-c fails here, not silently in game).
// 2. playBootSound() constructs an Audio element for the B file and
//    calls play(); playPressStartSound() does the same for M3.
// 3. Boot never plays the M3 file and press-start never plays the B
//    file (anti-swap: the two roles are not interchangeable).
// 4. The live call sites still exist in src/components/IntroSequence.tsx
//    (same read-the-real-file pattern as soundCues.test.ts): the BOOT
//    effect calls playBootSound(), the TITLE advance calls
//    playPressStartSound().

import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  BOOT_SOUND_FILE,
  BOOT_SOUND_URL,
  PRESS_START_SOUND_FILE,
  PRESS_START_SOUND_URL,
  playBootSound,
  playPressStartSound,
} from "./bootAudio";

const BOOT_FILE = "mochiichao-boot-ui-art-option-b-rising-arpeggio.wav";
const PRESS_START_FILE = "mochiichao-boot-M3-mochii-chirp.wav";

// Audio is a browser global; in the vitest node environment it is
// undefined, so bootAudio.ts would silently return null. The mock
// records every constructed URL and play() call instead.
const constructedUrls: string[] = [];
let playCalls = 0;
class MockAudio {
  src: string;
  constructor(src: string) {
    this.src = src;
    constructedUrls.push(src);
  }
  play(): Promise<void> {
    playCalls += 1;
    return Promise.resolve();
  }
}
vi.stubGlobal("Audio", MockAudio);

beforeEach(() => {
  constructedUrls.length = 0;
  playCalls = 0;
});

describe("settled boot / press-start files", () => {
  it("boot is UI Art Option B, press-start is M3", () => {
    expect(BOOT_SOUND_FILE).toBe(BOOT_FILE);
    expect(PRESS_START_SOUND_FILE).toBe(PRESS_START_FILE);
  });

  it("neither settled file is M1, M2, option-a or option-c", () => {
    for (const f of [BOOT_SOUND_FILE, PRESS_START_SOUND_FILE]) {
      expect(f).not.toContain("M1");
      expect(f).not.toContain("M2");
      expect(f).not.toContain("option-a");
      expect(f).not.toContain("option-c");
    }
    expect(BOOT_SOUND_FILE).not.toBe(PRESS_START_SOUND_FILE);
  });

  it("exported URLs point at /audio/<settled file>", () => {
    expect(BOOT_SOUND_URL.endsWith(`audio/${BOOT_FILE}`)).toBe(true);
    expect(PRESS_START_SOUND_URL.endsWith(`audio/${PRESS_START_FILE}`)).toBe(true);
  });
});

describe("playback", () => {
  it("playBootSound() plays the B file once", () => {
    const el = playBootSound();
    expect(el).not.toBeNull();
    expect(constructedUrls).toHaveLength(1);
    expect(constructedUrls[0].endsWith(`audio/${BOOT_FILE}`)).toBe(true);
    expect(playCalls).toBe(1);
  });

  it("playPressStartSound() plays the M3 file once", () => {
    const el = playPressStartSound();
    expect(el).not.toBeNull();
    expect(constructedUrls).toHaveLength(1);
    expect(constructedUrls[0].endsWith(`audio/${PRESS_START_FILE}`)).toBe(true);
    expect(playCalls).toBe(1);
  });

  it("boot never plays M3 and press-start never plays B", () => {
    playBootSound();
    expect(constructedUrls[0]).not.toContain(PRESS_START_FILE);
    constructedUrls.length = 0;
    playCalls = 0;
    playPressStartSound();
    expect(constructedUrls[0]).not.toContain(BOOT_FILE);
  });
});

describe("live call sites in IntroSequence", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const intro = readFileSync(
    resolve(here, "../components/IntroSequence.tsx"),
    "utf8",
  );

  it("imports both play functions from bootAudio", () => {
    expect(intro).toContain('from "../lib/bootAudio"');
    expect(intro).toContain("playBootSound");
    expect(intro).toContain("playPressStartSound");
  });

  it("BOOT effect plays the boot sound", () => {
    expect(intro).toContain('if (phase === "BOOT")');
    expect(intro).toContain("playBootSound();");
  });

  it("TITLE advance plays the press-start sound", () => {
    expect(intro).toContain('phase === "TITLE" && !titleFading');
    expect(intro).toContain("playPressStartSound();");
  });
});
