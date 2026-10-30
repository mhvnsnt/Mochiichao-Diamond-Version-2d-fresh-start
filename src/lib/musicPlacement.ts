/**
 * Music placement — the placement half of the soundtrack lane
 * (2026-10-29). The composed tracks live in music.ts's TRACKS table;
 * this module decides WHICH track a place/state gets, the way the
 * sequenced games do it: every map header carries a music id
 * (Emerald's data/maps/<Map>/map.json has a literal "music" field —
 * placement is data, not code branches), battles interrupt the field
 * track and the field track returns when the battle ends, and silence
 * is an authored placement, not a missing file.
 *
 * Adaptive layer honoured (List-2 ADAPTIVE-MUSIC.md): the SCORE-STATE
 * global can force ABSENCE — the Dark Forest rule, engineered absence.
 * ABSENCE always wins over the map's track.
 *
 * Merge point with the sound-wiring lane's cue module: UI/interaction
 * cues are theirs; this module and music.ts own music + music-class
 * stingers (playStinger below). Both ride audioRouting's buses —
 * music on 'music', stingers/cries on 'sfx'.
 */

import { playMusic, stopMusic, setMusicVolume as setPlayerVolume, type MusicTrack } from "./music";
import { playAudioUrl, duckMusicBus } from "./audioRouting";

export type ScoreState = "SETTLE" | "PLAY" | "TENSION" | "DREAD" | "ABSENCE";
export type BattleKind = "wild" | "trainer" | "dojo" | null;

/**
 * Explicit resolution constants (sound-full-coverage lane,
 * 2026-10-29 — the MUS_DUMMY / MUS_NONE lesson, verified in
 * pret-pokeemerald: MUS_DUMMY = 0 is the cleared/no-music sentinel
 * (Overworld_ClearSavedMusic writes it; WaitFanfare(stop) starts
 * it), MUS_NONE = 0xFFFF is the unspecified sentinel TransitionMap-
 * Music skips. Silence and keep-playing are NAMED resolutions here,
 * never null/undefined — the coverage guard rejects any resolution
 * that is not a track, SILENCE, or INHERIT).
 */
export const SILENCE = "silence" as const;
export const INHERIT = "unchanged" as const;
export type Placement = MusicTrack | typeof SILENCE | typeof INHERIT;

/**
 * Per-map authored placement. Every FULL_WORLD key is listed —
 * the coverage test fails if a map is missing, so a new map can
 * never silently inherit whatever played before it.
 * Classes: town cluster / wilds (route class) / service (center) /
 * authored silence is expressed via SCORE-STATE ABSENCE, not here,
 * because no Seq 1–3 map is silent by itself in canon.
 * Coverage update (2026-10-29): the classes below now resolve to
 * composed tracks of their own — town2 (Silicon Town is not Boot
 * Harbor), dojo (dojo interiors; MUS_GYM's slot), cave (caves and
 * tunnels; MUS_CAVE_OF_ORIGIN's class). The Dark Forest's silence
 * is NOT a row here: it is authored by SCORE-STATE ABSENCE in play
 * (canon Refusal), exactly as the soundtrack lane left it.
 */
export const MAP_PLACEMENT: Record<string, Placement> = {
  sector0: "town",
  sector0_truck: "town",
  sector0_house_1f: "town",
  sector0_house_2f: "town",
  sector0_rival_house: "town",
  aeon_lab: "town",
  boot_bay: "town",
  // Traversal part 2: the dive area is the bay's own underwater
  // half — same placement class as its surface.
  boot_bay_deep: "town",
  mochiiplex_1: "center",
  route_1: "route",
  binary_fields: "town2",
  dojo_1: "dojo",
  binary_woods: "route",
  cave_of_echoes: "cave",
  neon_city: "town",
  scrap_junkyard: "route",
  coral_approach: "route",
  castagnoli_island: "town",
  mauveville_arena: "dojo",
  luigi_mansion: "cave",
  route_2: "route",
  stoneport_city: "town",
  dojo_2: "dojo",
  dojo_3: "dojo",
  dojo_4: "dojo",
  dojo_5: "dojo",
  dojo_6: "dojo",
  dojo_7: "dojo",
  dojo_8: "dojo",
  route_3: "route",
  signal_tunnel: "cave",
  pale_town: "town",
  market_city: "town",
  central_city: "town",
  harbor_city: "town",
  ember_island: "town",
  victory_route: "route",
  mainframe_plateau: "route",
  data_isle_1: "town",
  data_isle_2: "town",
  data_isle_3: "town",
  data_isle_4: "town",
  data_isle_5: "town",
  data_isle_6: "town",
  data_isle_7: "town",
  region2_arrival: "town",
};

export interface MusicContext {
  screen: string;
  mapId: string;
  battleKind: BattleKind;
  scoreState?: ScoreState;
  /** Clock phase from WorldConstants.getDayPhase (dawn/day/dusk/night). */
  phase?: string;
}

/** Night arrangements: Gen 4/5 ship distinct night variants for the
 * town/route classes. Only the classes we ship get one, and only
 * the deep-night phase switches — dawn/dusk keep the day track. */
const NIGHT_VARIANTS: Partial<Record<MusicTrack, MusicTrack>> = {
  town: "townNight",
  town2: "town2Night",
  route: "routeNight",
};

/** Pure resolver — the unit tests exercise this, never the player. */
export function resolveMusic(ctx: MusicContext): Placement {
  if (ctx.scoreState === "ABSENCE") return SILENCE;
  if (ctx.screen === "battle") {
    if (ctx.battleKind === "dojo") return "dojoBattle";
    return ctx.battleKind === "trainer" ? "trainerBattle" : "wildBattle";
  }
  // App-level views that ARE places (they unmount the world engine,
  // so they carry their own placement — the source switches to
  // MUS_POKE_MART inside a Mart the same way).
  if (ctx.screen === "shop") return "shop";
  // Sound-exceptions lane (2026-10-29): the Garden resolves to its
  // OWN track — the SA2/Chao Garden class is a place-class of its
  // own (sound-full-coverage DECISIONS.md, Sonic check). This was
  // COVERAGE.md slot 21's one-row change; the row is now filled.
  if (ctx.screen === "garden") return "garden";
  if (ctx.screen === "overworld") {
    const base = MAP_PLACEMENT[ctx.mapId] ?? "town";
    if (ctx.phase === "night" && base !== SILENCE && base !== INHERIT) {
      return NIGHT_VARIANTS[base] ?? base;
    }
    return base;
  }
  // Menus/dialogue never change the music (music.ts rule).
  return INHERIT;
}

/** Apply a resolved placement, honouring the music-enabled setting. */
export function applyMusic(ctx: MusicContext): void {
  if (!musicEnabled()) {
    stopMusic(200);
    return;
  }
  const p = resolveMusic(ctx);
  if (p === "unchanged") return;
  if (p === "silence") {
    stopMusic();
    return;
  }
  playMusic(p);
}

// ------------------------------------------------------------------
// Settings (module-level, named per the lane brief: the Settings
// screen's SOUND row owns stereo/mono routing; music enable/volume
// live here until a settings row is authored for them).
// ------------------------------------------------------------------

const LS_ENABLED = "mochiichao.music.enabled";
const LS_VOLUME = "mochiichao.music.volume";

export function musicEnabled(): boolean {
  try {
    return localStorage.getItem(LS_ENABLED) !== "0";
  } catch {
    return true;
  }
}

export function setMusicEnabled(on: boolean): void {
  try {
    localStorage.setItem(LS_ENABLED, on ? "1" : "0");
  } catch {
    /* storage unavailable — setting stays session-only */
  }
  if (!on) stopMusic(200);
}

export function musicVolume(): number {
  try {
    const v = parseFloat(localStorage.getItem(LS_VOLUME) ?? "0.8");
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8;
  } catch {
    return 0.8;
  }
}

export function setMusicVolume(v: number): void {
  const clamped = Math.min(1, Math.max(0, v));
  try {
    localStorage.setItem(LS_VOLUME, String(clamped));
  } catch {
    /* see above */
  }
  setPlayerVolume(clamped);
}

// ------------------------------------------------------------------
// Stingers — music-adjacent one-shots claimed by this lane. The heal
// jingle is the Plex's: in the source games the heal is a short
// composed sting over (then back to) the Center theme. The battle
// payoff lane owns win / level-up jingles; this lane does not
// duplicate them.
// ------------------------------------------------------------------

const STINGERS: Record<string, string> = {
  heal: "heal-jingle.wav",
  victoryWild: "victory-wild.wav",
  victoryTrainer: "victory-trainer.wav",
};

/** Fanfare-class playback: the music bus ducks for the stinger's
 * length and restores (Emerald's PlayFanfare stops BGM and
 * WaitFanfare resumes it — see audioRouting.duckMusicBus). The
 * durations match the composed files, rounded up. */
const STINGER_DUCK_MS: Record<string, number> = {
  heal: 2600,
  victoryWild: 7300,
  victoryTrainer: 8700,
};

export function playStinger(id: keyof typeof STINGERS): void {
  const base = import.meta.env.BASE_URL ?? "/";
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  duckMusicBus(STINGER_DUCK_MS[id] ?? 2000);
  void playAudioUrl(`${withSlash}audio/tracks/${STINGERS[id]}`, "sfx");
}

export function playHealJingle(): void {
  playStinger("heal");
}

/** The win music (MUS_VICTORY_WILD / MUS_VICTORY_TRAINER slots).
 * When the battle-payoff sequence lands it becomes the firing
 * site for these same files — see the coverage lane's note to
 * that lane; hosts must then stop firing it directly. */
export function playVictoryJingle(kind: "wild" | "trainer"): void {
  playStinger(kind === "trainer" ? "victoryTrainer" : "victoryWild");
}
