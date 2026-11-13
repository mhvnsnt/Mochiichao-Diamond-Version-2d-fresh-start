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
  sector0_neighbor_house: "town",
  aeon_lab: "town",
  boot_bay: "town",
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
  // Region 2 (PR #423): same classes as Region 1 — towns "town",
  // routes "route", dojos + dojo-theme interiors "dojo", the
  // MochiiPlex "center", water crossings "route" (coral_approach
  // precedent — the water scene is the battle background's job).
  r2_dawnfield: "town",
  r2_mochiiplex_dawnfield: "center",
  r2_route_1: "route",
  r2_cherryport: "town",
  r2_route_2: "route",
  r2_violet: "town",
  r2_tower: "dojo",
  r2_dojo_1: "dojo",
  r2_route_3: "route",
  r2_azalea: "town",
  r2_well: "dojo",
  r2_dojo_2: "dojo",
  r2_route_4: "route",
  r2_ilex_forest: "route",
  r2_shrine: "town",
  r2_route_5: "route",
  r2_goldenrod: "town",
  r2_radio_tower: "dojo",
  r2_garden_branch: "town",
  r2_dojo_3: "dojo",
  r2_route_6: "route",
  r2_ecruteak: "town",
  r2_burned_tower: "dojo",
  r2_dojo_4: "dojo",
  r2_route_7: "route",
  r2_olivine: "town",
  r2_lighthouse: "town",
  r2_dojo_5: "dojo",
  r2_sea_road: "route",
  r2_cianwood: "town",
  r2_dojo_6: "dojo",
  r2_route_8: "route",
  r2_mahogany: "town",
  r2_lake: "route",
  r2_hideout: "dojo",
  r2_dojo_7: "dojo",
  r2_route_9: "route",
  r2_blackthorn: "town",
  r2_den: "dojo",
  r2_dojo_8: "dojo",
  r2_victory_route: "route",
  r2_plateau: "route",
  r2_frost_peak: "route",
  // Regions 3-5 (this PR): same classes as Region 2 — towns "town",
  // routes / open grounds "route", dojos "dojo", MochiiPlex "center",
  // civic interiors "town", dark interiors "dojo", the island "route".
  r3_outpost_2f: "town",
  r3_outpost_1f: "town",
  r3_root_hamlet: "town",
  r3_lab: "town",
  r3_mochiiplex_root_hamlet: "center",
  r3_oldale_road: "route",
  r3_rustboro: "town",
  r3_dojo_1: "dojo",
  r3_route_1: "route",
  r3_dewford: "town",
  r3_cave: "dojo",
  r3_dojo_2: "dojo",
  r3_sea_route: "route",
  r3_mauville: "town",
  r3_arena: "dojo",
  r3_dojo_3: "dojo",
  r3_route_2: "route",
  r3_lavaridge: "town",
  r3_dojo_4: "dojo",
  r3_land_base: "dojo",
  r3_route_3: "route",
  r3_petalburg: "town",
  r3_dojo_5: "dojo",
  r3_route_4: "route",
  r3_fortree: "town",
  r3_weather_institute: "town",
  r3_dojo_6: "dojo",
  r3_route_5: "route",
  r3_lilycove: "town",
  r3_hideout: "dojo",
  r3_route_6: "route",
  r3_mossdeep: "town",
  r3_dojo_7: "dojo",
  r3_route_7: "route",
  r3_crater_city: "town",
  r3_dojo_8: "dojo",
  r3_route_8: "route",
  r3_awakening: "route",
  r3_victory_route: "route",
  r3_plateau: "route",
  r3_frontier_arenas: "route",
  r4_twinleaf: "town",
  r4_mochiiplex_twinleaf: "center",
  r4_route_1: "route",
  r4_sandgem: "town",
  r4_route_2: "route",
  r4_jubilife: "town",
  r4_route_3: "route",
  r4_oreburgh: "town",
  r4_dojo_1: "dojo",
  r4_route_4: "route",
  r4_floaroma: "town",
  r4_route_5: "route",
  r4_eterna: "town",
  r4_dojo_2: "dojo",
  r4_statue: "town",
  r4_route_6: "route",
  r4_hearthome: "town",
  r4_contest_hall: "town",
  r4_dojo_3: "dojo",
  r4_route_7: "route",
  r4_veilstone: "town",
  r4_warehouse: "dojo",
  r4_dojo_4: "dojo",
  r4_route_8: "route",
  r4_pastoria: "town",
  r4_dojo_5: "dojo",
  r4_preserve: "route",
  r4_route_9: "route",
  r4_celestic: "town",
  r4_cave_painting: "town",
  r4_route_10: "route",
  r4_canalave: "town",
  r4_library: "town",
  r4_island: "route",
  r4_dojo_6: "dojo",
  r4_snowpoint: "town",
  r4_temple: "town",
  r4_dojo_7: "dojo",
  r4_sunyshore: "town",
  r4_dojo_8: "dojo",
  r4_victory_route: "route",
  r4_plateau: "route",
  r4_battle_zone: "route",
  r4_rift_dungeon: "dojo",
  r5_start_city: "town",
  r5_mochiiplex_start_city: "center",
  r5_route_1: "route",
  r5_sandgem: "town",
  r5_route_2: "route",
  r5_jubilife: "town",
  r5_route_3: "route",
  r5_oreburgh: "town",
  r5_dojo_1: "dojo",
  r5_route_4: "route",
  r5_floaroma: "town",
  r5_route_5: "route",
  r5_eterna: "town",
  r5_dojo_2: "dojo",
  r5_route_6: "route",
  r5_hearthome: "town",
  r5_contest_hall: "town",
  r5_dojo_3: "dojo",
  r5_route_7: "route",
  r5_veilstone: "town",
  r5_warehouse: "dojo",
  r5_dojo_4: "dojo",
  r5_route_8: "route",
  r5_pastoria: "town",
  r5_dojo_5: "dojo",
  r5_preserve: "route",
  r5_route_9: "route",
  r5_celestic: "town",
  r5_route_10: "route",
  r5_canalave: "town",
  r5_library: "town",
  r5_dojo_6: "dojo",
  r5_snowpoint: "town",
  r5_temple: "town",
  r5_dojo_7: "dojo",
  r5_sunyshore: "town",
  r5_dojo_8: "dojo",
  r5_victory_route: "route",
  r5_plateau: "route",
  r5_grand_tournament: "route",
  r5_mythar_final: "route",
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
