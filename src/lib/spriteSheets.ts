/**
 * Sprite-sheet loader — "looks 3D, runs 2D".
 *
 * The game ONLY eats 2D sprite sheets. Dorowani (147) and Gabu (148) are
 * Mars's own creatures, and since the Phase 3 pivot (2026-10-26) their
 * game-path art is their LOCKED 2D-sheet atlases
 * (src/assets/sprite-atlases/dorowani + gabu, *.manifest.locked.json) —
 * the Blender bakes of his Tripo models left the game path (the bake PNGs
 * stay in src/assets/sprites/ as history, unreferenced; 0 files deleted).
 * No GLBs are loaded by the game, and no Pokemon sprites are loaded
 * anywhere in this module.
 *
 * Every roster creature with a locked atlas uses its own
 * src/assets/sprite-atlases/<creature>/<creature>_atlas_64_locked.png
 * (Sprite Art lane lock, *.manifest.locked.json). Those defs are
 * GENERATED from the manifests (see gen_locked_atlas_defs.py in the
 * workspace, never hand-typed): battle front/back + portrait side cells
 * plus overworld front/back/side cells, each with explicit atlas (x, y).
 * The manifest atlas_x/atlas_y is the packed tile position (splits and
 * mirrors shift tiles off the source cell index, so cell numbers are
 * never used as atlas positions when atlas_x/y exists).
 *
 * Creatures with no sheet yet are NOT given a Pokemon sprite and NOT an
 * emoji: they get an original coloured silhouette drawn from their own
 * type colour, clearly labelled as a placeholder shape in the UI.
 */
import type { CSSProperties } from 'react';
import { SPECIES_DB } from './species';
import { TYPES } from './constants';
// Phase 3 pivot: 147/148 game-path art is the locked 2D atlases, not the
// Tripo-model bakes (see header). The bake PNGs are unreferenced history.
import atlas_dorowani from '../assets/sprite-atlases/dorowani/dorowani_atlas_64_locked.png';
import atlas_gabu from '../assets/sprite-atlases/gabu/gabu_atlas_64_locked.png';
// Battle-only cuts. These are CROPS cut straight from the Sprite Art
// lane's 2d-sheets (no new likeness, no AI mock creature):
// - Gabu opponent: angles sheet, 4x2 grid, cell (3,0) —
//   three-quarter, facing left toward the player. Opponent side shows a
//   front-facing view per the battle standard, so this cut stays.
// - Gearkid player + Mechapion player: BACK-view cuts from each
//   species' own main 2D sheet (back-sprite fix, 2026-10-29) — their
//   locked atlases carry no genuine battle back cell (Gearkid's is a
//   three-quarter key pose; Mechapion's manifest has no battle_back
//   frame at all). Provenance: src/assets/sprites/<name>/<name>.manifest.json.
// RETIRED 2026-10-29 (back-sprite fix, owner's explicit battle standard:
// player side = back view): the Dorowani PLAYER three-quarter cut
// (dorowani-player-threequarter-right-cut.png) is no longer wired as the
// player override. The Phase 3 note above it said swapping the cut for
// the locked battle cell was Mars's call; his 2026-10-29 order (player
// side shows the creature's BACK, like Pokemon) is that call. The
// player side now uses Dorowani's locked atlas back cell (the shell
// view — cell (192,0), manifest cell 2, per the 2026-10-29 back-choice
// correction; the (64,0) cell is the labelled 3D sprite back). The cut PNG stays in src/assets/sprites/dorowani/ as history,
// unreferenced, like the bake PNGs.
import gabuBattleOpponent from '../assets/sprites/gabu/gabu-threequarter-left-cut.png';
import gearkidBattleBack from '../assets/sprites/gearkid/gearkid-back-cut.png';
import mechapionBattleBack from '../assets/sprites/mechapion/mechapion-back-cut.png';
// Locked-atlas imports (generated from *.manifest.locked.json).
import atlas_mochii from '../assets/sprite-atlases/mochii/mochii_atlas_64_locked.png';
import atlas_tiidebiite from '../assets/sprite-atlases/tiidebiite/tiidebiite_atlas_64_locked.png';
import atlas_aquariios from '../assets/sprite-atlases/aquariios/aquariios_atlas_64_locked.png';
import atlas_razorgater from '../assets/sprite-atlases/razorgater/razorgater_atlas_64_locked.png';
import atlas_chromejaww from '../assets/sprite-atlases/chromejaww/chromejaww_atlas_64_locked.png';
import atlas_reaperdile from '../assets/sprite-atlases/reaperdile/reaperdile_atlas_64_locked.png';
import atlas_tyrage from '../assets/sprite-atlases/tyrage/tyrage_atlas_64_locked.png';
import atlas_duneclaw from '../assets/sprite-atlases/duneclaw/duneclaw_atlas_64_locked.png';
import atlas_oblivirex from '../assets/sprite-atlases/oblivirex/oblivirex_atlas_64_locked.png';
import atlas_kittember from '../assets/sprite-atlases/kittember/kittember_atlas_64_locked.png';
import atlas_pyropaw from '../assets/sprite-atlases/pyropaw/pyropaw_atlas_64_locked.png';
import atlas_manticlaw from '../assets/sprite-atlases/manticlaw/manticlaw_atlas_64_locked.png';
import atlas_pupbble from '../assets/sprite-atlases/pupbble/pupbble_atlas_64_locked.png';
import atlas_terradog from '../assets/sprite-atlases/terradog/terradog_atlas_64_locked.png';
import atlas_quakehound from '../assets/sprite-atlases/quakehound/quakehound_atlas_64_locked.png';
import atlas_squirmite from '../assets/sprite-atlases/squirmite/squirmite_atlas_64_locked.png';
import atlas_cocoonode from '../assets/sprite-atlases/cocoonode/cocoonode_atlas_64_locked.png';
import atlas_mothrix from '../assets/sprite-atlases/mothrix/mothrix_atlas_64_locked.png';
import atlas_zephling from '../assets/sprite-atlases/zephling/zephling_atlas_64_locked.png';
import atlas_aerobeak from '../assets/sprite-atlases/aerobeak/aerobeak_atlas_64_locked.png';
import atlas_stormtalon from '../assets/sprite-atlases/stormtalon/stormtalon_atlas_64_locked.png';
import atlas_finblade from '../assets/sprite-atlases/finblade/finblade_atlas_64_locked.png';
import atlas_megalochrome from '../assets/sprite-atlases/megalochrome/megalochrome_atlas_64_locked.png';
import atlas_floatcalf from '../assets/sprite-atlases/floatcalf/floatcalf_atlas_64_locked.png';
import atlas_astroleviathan from '../assets/sprite-atlases/astroleviathan/astroleviathan_atlas_64_locked.png';
import atlas_inklet from '../assets/sprite-atlases/inklet/inklet_atlas_64_locked.png';
import atlas_toxitacle from '../assets/sprite-atlases/toxitacle/toxitacle_atlas_64_locked.png';
import atlas_krakenox from '../assets/sprite-atlases/krakenox/krakenox_atlas_64_locked.png';
import atlas_punchkid from '../assets/sprite-atlases/punchkid/punchkid_atlas_64_locked.png';
import atlas_strikechamp from '../assets/sprite-atlases/strikechamp/strikechamp_atlas_64_locked.png';
import atlas_kickmaster from '../assets/sprite-atlases/kickmaster/kickmaster_atlas_64_locked.png';
import atlas_gearkid from '../assets/sprite-atlases/gearkid/gearkid_atlas_64_locked.png';
import atlas_mechapion from '../assets/sprite-atlases/mechapion/mechapion_atlas_64_locked.png';
import atlas_gorokappa from '../assets/sprite-atlases/gorokappa/gorokappa_atlas_64_locked.png';
import atlas_pebblefist from '../assets/sprite-atlases/pebblefist/pebblefist_atlas_64_locked.png';
import atlas_cragarm from '../assets/sprite-atlases/cragarm/cragarm_atlas_64_locked.png';
import atlas_terrapod from '../assets/sprite-atlases/terrapod/terrapod_atlas_64_locked.png';
import atlas_sproutle from '../assets/sprite-atlases/sproutle/sproutle_atlas_64_locked.png';
import atlas_shellguard from '../assets/sprite-atlases/shellguard/shellguard_atlas_64_locked.png';
import atlas_dreadtoise from '../assets/sprite-atlases/dreadtoise/dreadtoise_atlas_64_locked.png';
import atlas_pixilite from '../assets/sprite-atlases/pixilite/pixilite_atlas_64_locked.png';
import atlas_wispkin from '../assets/sprite-atlases/wispkin/wispkin_atlas_64_locked.png';
import atlas_duskfiend from '../assets/sprite-atlases/duskfiend/duskfiend_atlas_64_locked.png';
import atlas_ashemit from '../assets/sprite-atlases/ashemit/ashemit_atlas_64_locked.png';
import atlas_pyromonk from '../assets/sprite-atlases/pyromonk/pyromonk_atlas_64_locked.png';
import atlas_yogiferno from '../assets/sprite-atlases/yogiferno/yogiferno_atlas_64_locked.png';
import atlas_mythar from '../assets/sprite-atlases/mythar/mythar_atlas_64_locked.png';

export type SheetView = 'front' | 'back' | 'side';

export interface SheetCellXY { x: number; y: number; }

export interface SheetDef {
  speciesId: string;
  name: string;
  sheetUrl: string;
  cellSize: number;
  frames: Record<SheetView, number>; // x offset of the 64x64 cell (legacy 147/148 sheets, row 0)
  /** Battle-only override images, per side. Absent side = sheet-cell fallback. */
  battle?: { player?: string; opponent?: string };
  /** Locked-atlas XY cells (battle front/back, portrait side). Absent = legacy sheet. */
  cells?: Partial<Record<SheetView, SheetCellXY>>;
  /** Locked-atlas XY cells for overworld views. Absent view = no world art for it. */
  worldCells?: Partial<Record<SheetView, SheetCellXY>>;
  /** Full locked-atlas pixel dimensions (needed for CSS background-size). */
  atlasWidth?: number;
  atlasHeight?: number;
}

// BACK-SPRITE AUDIT CORRECTIONS (2026-10-29, owner bug report — in
// battle the player's creature faced the player instead of showing its
// back). Every def below was eye-checked cell by cell against its atlas
// (audit of record: AUDIT.md in the back-sprite-fix lane). The generated
// defs are corrected in place for these battle cells ONLY (worldCells
// untouched everywhere):
// - SWAPPED front/back (the manifest's battle_front cell holds the back
//   art and vice versa): 039 Shellguard, 042 Wispkin, 043 Duskfiend.
//   The three manifests' role labels were swapped to match.
// - battle_back cell holds FRONT art; the def now points at the genuine
//   back cell that already exists in the same atlas (the cell the
//   manifest carries as overworld_back / overworld_back_3): 004
//   Razorgater -> (0,0), 005 Chromejaww -> (128,0), 006 Reaperdile ->
//   (320,0), 015 Quakehound -> (64,0), 021 Stormtalon -> (192,0), 022
//   Finblade -> (192,0) (dorsal — SUPERSEDED 2026-10-29 by the
//   back-choice correction: the art lane's cell re-read found the true
//   rear at (64,0) and the front at (128,0); see the 147/148 note),
//   036 Cragarm -> (256,0), 038 Sproutle -> (128,0), 033 Mechapion ->
//   (320,0) (three-quarter rear; its true back is the battle cut).
//   Each atlas manifest carries a battle_back_correction_2026_10_29
//   note; a future regeneration must apply the same corrections.
// - 032 Gearkid / 033 Mechapion player sides use full-image BACK cuts
//   (see the import note at the top of this file).
export const SHEET_DEFS: Record<string, SheetDef> = {
  // Back-choice correction (2026-10-29, owner ruling): Dorowani's battle
  // back is atlas cell (192,0) — locked-manifest cell 2 (role
  // overworld_back), the full standing shell back, the same cell the
  // overworld back already used. The previously wired cell (64,0) is the
  // 3D sprite back (a half-figure split out of the merged 3D-bake pair
  // cell): kept in the atlas and labelled "3D sprite back" in the
  // manifests, NOT wired as the battle back. Gabu: battle back is cell
  // (64,0), the full standing shell back; the previously wired (192,0)
  // is Gabu's T-pose 3D sprite back — likewise kept and labelled, not
  // wired. Finblade (022): front (128,0) / back (64,0) per the
  // art-completion lane's cell re-read (the locked manifest had the two
  // roles swapped); (192,0) is the dorsal cell, no longer the back.
  '147': { speciesId: '147', name: 'Dorowani', sheetUrl: atlas_dorowani, cellSize: 64, frames: { front: 0, back: 192, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 64, y: 64 }, back: { x: 192, y: 0 }, side: { x: 256, y: 0 } } },
  '148': { speciesId: '148', name: 'Gabu', sheetUrl: atlas_gabu, cellSize: 64, frames: { front: 128, back: 64, side: 128 }, cells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 64 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 64 } }, battle: { opponent: gabuBattleOpponent } },
  // Back-sprite fix (2026-10-29): Gabu's canonical dex id is 150
  // (species.json; species.ts SPECIES_DB is also keyed '150'), but the
  // locked-atlas def was only registered under the legacy key '148', so
  // a battle mon carrying speciesId '150' got NO sheet def at all (blob /
  // silhouette fallback on both battle surfaces). This alias registers
  // the same atlas + opponent cut under the canonical id. The '148'
  // entry stays for the data that still carries the legacy key.
  '150': { speciesId: '150', name: 'Gabu', sheetUrl: atlas_gabu, cellSize: 64, frames: { front: 128, back: 64, side: 128 }, cells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 64 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 64 } }, battle: { opponent: gabuBattleOpponent } },
  // Locked-atlas defs below — GENERATED from *.manifest.locked.json, do not hand-edit.
'001': { speciesId: '001', name: "Mochii", sheetUrl: atlas_mochii, cellSize: 64, frames: { front: 0, back: 192, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } } },
  '002': { speciesId: '002', name: "Tiidebiite", sheetUrl: atlas_tiidebiite, cellSize: 64, frames: { front: 0, back: 64, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 256, y: 0 }, side: { x: 192, y: 0 } } },
  '003': { speciesId: '003', name: "AquariiOS", sheetUrl: atlas_aquariios, cellSize: 64, frames: { front: 0, back: 128, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 192, y: 0 }, back: { x: 192, y: 0 }, side: { x: 192, y: 0 } } },
  '004': { speciesId: '004', name: "Razorgater", sheetUrl: atlas_razorgater, cellSize: 64, frames: { front: 256, back: 0, side: 128 }, cells: { front: { x: 256, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 0 } } },
  '005': { speciesId: '005', name: "Chromejaww", sheetUrl: atlas_chromejaww, cellSize: 64, frames: { front: 64, back: 128, side: 256 }, cells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } } },
  '006': { speciesId: '006', name: "Reaperdile", sheetUrl: atlas_reaperdile, cellSize: 64, frames: { front: 64, back: 320, side: 0 }, cells: { front: { x: 64, y: 0 }, back: { x: 320, y: 0 }, side: { x: 0, y: 64 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 192, y: 0 }, back: { x: 0, y: 0 }, side: { x: 0, y: 64 } } },
  '007': { speciesId: '007', name: "Tyrage", sheetUrl: atlas_tyrage, cellSize: 64, frames: { front: 192, back: 0, side: 64 }, cells: { front: { x: 192, y: 0 }, back: { x: 0, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 64, y: 0 } } },
  '008': { speciesId: '008', name: "Duneclaw", sheetUrl: atlas_duneclaw, cellSize: 64, frames: { front: 128, back: 64, side: 0 }, cells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 0, y: 0 } } },
  '009': { speciesId: '009', name: "Oblivirex", sheetUrl: atlas_oblivirex, cellSize: 64, frames: { front: 0, back: 128, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 192, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } } },
  '010': { speciesId: '010', name: "Kittember", sheetUrl: atlas_kittember, cellSize: 64, frames: { front: 128, back: 256, side: 0 }, cells: { front: { x: 128, y: 0 }, back: { x: 256, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } } },
  '011': { speciesId: '011', name: "Pyropaw", sheetUrl: atlas_pyropaw, cellSize: 64, frames: { front: 64, back: 0, side: 128 }, cells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 0 } } },
  '012': { speciesId: '012', name: "Manticlaw", sheetUrl: atlas_manticlaw, cellSize: 64, frames: { front: 0, back: 192, side: 64 }, cells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 64, y: 0 }, back: { x: 64, y: 0 }, side: { x: 64, y: 0 } } },
  '013': { speciesId: '013', name: "Pupbble", sheetUrl: atlas_pupbble, cellSize: 64, frames: { front: 0, back: 64, side: 0 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 128 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 0, y: 128 } } },
  '014': { speciesId: '014', name: "Terradog", sheetUrl: atlas_terradog, cellSize: 64, frames: { front: 0, back: 64, side: 128 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 0 } } },
  '015': { speciesId: '015', name: "Quakehound", sheetUrl: atlas_quakehound, cellSize: 64, frames: { front: 192, back: 64, side: 0 }, cells: { front: { x: 192, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } } },
  '016': { speciesId: '016', name: "Squirmite", sheetUrl: atlas_squirmite, cellSize: 64, frames: { front: 64, back: 0, side: 0 }, cells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 0, y: 64 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 0, y: 64 } } },
  '017': { speciesId: '017', name: "Cocoonode", sheetUrl: atlas_cocoonode, cellSize: 64, frames: { front: 0, back: 64, side: 128 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 0 } } },
  '018': { speciesId: '018', name: "Mothrix", sheetUrl: atlas_mothrix, cellSize: 64, frames: { front: 0, back: 192, side: 320 }, cells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 320, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 320, y: 0 } } },
  '019': { speciesId: '019', name: "Zephling", sheetUrl: atlas_zephling, cellSize: 64, frames: { front: 0, back: 64, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 128, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } } },
  '020': { speciesId: '020', name: "Aerobeak", sheetUrl: atlas_aerobeak, cellSize: 64, frames: { front: 0, back: 64, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } } },
  '021': { speciesId: '021', name: "Stormtalon", sheetUrl: atlas_stormtalon, cellSize: 64, frames: { front: 128, back: 192, side: 128 }, cells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 64 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 64, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 64 } } },
  '022': { speciesId: '022', name: "Finblade", sheetUrl: atlas_finblade, cellSize: 64, frames: { front: 128, back: 64, side: 256 }, cells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 256, y: 0 } } },
  '023': { speciesId: '023', name: "Megalochrome", sheetUrl: atlas_megalochrome, cellSize: 64, frames: { front: 0, back: 64, side: 0 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 64 },
  '024': { speciesId: '024', name: "Floatcalf", sheetUrl: atlas_floatcalf, cellSize: 64, frames: { front: 0, back: 64, side: 128 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 128, y: 0 } } },
  '025': { speciesId: '025', name: "Astroleviathan", sheetUrl: atlas_astroleviathan, cellSize: 64, frames: { front: 64, back: 128, side: 256 }, cells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 192, y: 0 }, back: { x: 0, y: 0 }, side: { x: 256, y: 0 } } },
  '026': { speciesId: '026', name: "Inklet", sheetUrl: atlas_inklet, cellSize: 64, frames: { front: 192, back: 0, side: 64 }, cells: { front: { x: 192, y: 0 }, back: { x: 0, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 64, y: 0 } } },
  '027': { speciesId: '027', name: "Toxitacle", sheetUrl: atlas_toxitacle, cellSize: 64, frames: { front: 320, back: 256, side: 0 }, cells: { front: { x: 320, y: 0 }, back: { x: 256, y: 0 }, side: { x: 0, y: 64 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 0, y: 64 } } },
  '028': { speciesId: '028', name: "Krakenox", sheetUrl: atlas_krakenox, cellSize: 64, frames: { front: 0, back: 64, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 64 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 64 } } },
  '029': { speciesId: '029', name: "Punchkid", sheetUrl: atlas_punchkid, cellSize: 64, frames: { front: 128, back: 192, side: 0 }, cells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 0, y: 64 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 64 } } },
  '030': { speciesId: '030', name: "Strikechamp", sheetUrl: atlas_strikechamp, cellSize: 64, frames: { front: 256, back: 320, side: 320 }, cells: { front: { x: 256, y: 0 }, back: { x: 320, y: 0 }, side: { x: 320, y: 128 } }, atlasWidth: 384, atlasHeight: 320, worldCells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 320, y: 128 } } },
  '031': { speciesId: '031', name: "Kickmaster", sheetUrl: atlas_kickmaster, cellSize: 64, frames: { front: 0, back: 64, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } } },
  '032': { speciesId: '032', name: "Gearkid", sheetUrl: atlas_gearkid, cellSize: 64, frames: { front: 128, back: 0, side: 256 }, cells: { front: { x: 128, y: 0 }, back: { x: 0, y: 192 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 0 } }, battle: { player: gearkidBattleBack } },
  '033': { speciesId: '033', name: "Mechapion", sheetUrl: atlas_mechapion, cellSize: 64, frames: { front: 0, back: 320, side: 128 }, cells: { front: { x: 0, y: 0 }, back: { x: 320, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 128, y: 0 } }, battle: { player: mechapionBattleBack } },
  '034': { speciesId: '034', name: "Gorokappa", sheetUrl: atlas_gorokappa, cellSize: 64, frames: { front: 0, back: 192, side: 320 }, cells: { front: { x: 0, y: 0 }, back: { x: 192, y: 0 }, side: { x: 320, y: 64 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 128, y: 0 }, back: { x: 64, y: 0 }, side: { x: 320, y: 64 } } },
  '035': { speciesId: '035', name: "Pebblefist", sheetUrl: atlas_pebblefist, cellSize: 64, frames: { front: 64, back: 192, side: 0 }, cells: { front: { x: 64, y: 0 }, back: { x: 192, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 0, y: 0 } } },
  '036': { speciesId: '036', name: "Cragarm", sheetUrl: atlas_cragarm, cellSize: 64, frames: { front: 0, back: 256, side: 128 }, cells: { front: { x: 0, y: 0 }, back: { x: 256, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 128, y: 0 }, back: { x: 256, y: 0 }, side: { x: 128, y: 0 } } },
  '037': { speciesId: '037', name: "Terrapod", sheetUrl: atlas_terrapod, cellSize: 64, frames: { front: 64, back: 0, side: 256 }, cells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 128, y: 0 }, back: { x: 192, y: 0 }, side: { x: 256, y: 0 } } },
  '038': { speciesId: '038', name: "Sproutle", sheetUrl: atlas_sproutle, cellSize: 64, frames: { front: 0, back: 128, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 256, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } } },
  '039': { speciesId: '039', name: "Shellguard", sheetUrl: atlas_shellguard, cellSize: 64, frames: { front: 0, back: 64, side: 192 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 192, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 192, y: 0 } } },
  '040': { speciesId: '040', name: "Dreadtoise", sheetUrl: atlas_dreadtoise, cellSize: 64, frames: { front: 0, back: 128, side: 64 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 64, y: 0 }, back: { x: 192, y: 0 }, side: { x: 64, y: 0 } } },
  '041': { speciesId: '041', name: "Pixilite", sheetUrl: atlas_pixilite, cellSize: 64, frames: { front: 0, back: 128, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 256, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 0 } } },
  '042': { speciesId: '042', name: "Wispkin", sheetUrl: atlas_wispkin, cellSize: 64, frames: { front: 0, back: 128, side: 64 }, cells: { front: { x: 0, y: 0 }, back: { x: 128, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 64, y: 0 }, back: { x: 192, y: 0 }, side: { x: 64, y: 0 } } },
  '043': { speciesId: '043', name: "Duskfiend", sheetUrl: atlas_duskfiend, cellSize: 64, frames: { front: 64, back: 0, side: 128 }, cells: { front: { x: 64, y: 0 }, back: { x: 0, y: 0 }, side: { x: 128, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 128, y: 0 }, back: { x: 256, y: 0 }, side: { x: 128, y: 0 } } },
  '044': { speciesId: '044', name: "Ashemit", sheetUrl: atlas_ashemit, cellSize: 64, frames: { front: 0, back: 64, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 128, worldCells: { front: { x: 192, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } } },
  '045': { speciesId: '045', name: "Pyromonk", sheetUrl: atlas_pyromonk, cellSize: 64, frames: { front: 256, back: 0, side: 64 }, cells: { front: { x: 256, y: 0 }, back: { x: 0, y: 0 }, side: { x: 64, y: 0 } }, atlasWidth: 384, atlasHeight: 320, worldCells: { front: { x: 64, y: 0 }, back: { x: 128, y: 0 }, side: { x: 64, y: 0 } } },
  '046': { speciesId: '046', name: "Yogiferno", sheetUrl: atlas_yogiferno, cellSize: 64, frames: { front: 0, back: 64, side: 0 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 0, y: 0 } }, atlasWidth: 384, atlasHeight: 192, worldCells: { front: { x: 0, y: 0 }, back: { x: 0, y: 0 }, side: { x: 0, y: 0 } } },
  '331': { speciesId: '331', name: "Mythar", sheetUrl: atlas_mythar, cellSize: 64, frames: { front: 0, back: 64, side: 256 }, cells: { front: { x: 0, y: 0 }, back: { x: 64, y: 0 }, side: { x: 256, y: 0 } }, atlasWidth: 384, atlasHeight: 256, worldCells: { front: { x: 256, y: 0 }, back: { x: 128, y: 0 }, side: { x: 256, y: 0 } } },
};

export function getSheetDef(speciesId: string | undefined | null): SheetDef | null {
  if (!speciesId) return null;
  return SHEET_DEFS[speciesId] ?? null;
}

/** Battle cell for a def: locked-atlas XY when present, else the legacy row-0 x offset. */
export function battleCell(def: SheetDef, view: SheetView): SheetCellXY {
  return def.cells?.[view] ?? { x: def.frames[view], y: 0 };
}

/**
 * Overworld cell for a def, or null when that view has no world art.
 * Locked defs: only the views their manifest actually carries (a missing
 * view stays a fallback figure — never a guessed cell). Defs without
 * worldCells: the same front/back/side cells as battle.
 */
export function worldCell(def: SheetDef, view: SheetView): SheetCellXY | null {
  if (def.worldCells) return def.worldCells[view] ?? null;
  return { x: def.frames[view], y: 0 };
}

/** CSS background-position/size for showing one cell of a sheet in an <img>-free div. */
export function sheetCellStyle(def: SheetDef, view: SheetView, sizePx: number): CSSProperties {
  if (def.cells && def.atlasWidth && def.atlasHeight) {
    const c = battleCell(def, view);
    return {
      width: sizePx,
      height: sizePx,
      backgroundImage: `url(${def.sheetUrl})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${sizePx * (def.atlasWidth / 64)}px ${sizePx * (def.atlasHeight / 64)}px`,
      backgroundPosition: `-${(c.x / 64) * sizePx}px -${(c.y / 64) * sizePx}px`,
      imageRendering: 'pixelated',
    };
  }
  const x = def.frames[view];
  return {
    width: sizePx,
    height: sizePx,
    backgroundImage: `url(${def.sheetUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${sizePx * 3}px ${sizePx}px`,
    backgroundPosition: `-${(x / 64) * sizePx}px 0px`,
    imageRendering: 'pixelated',
  };
}

/** Deterministic fallback colour for a creature with no sheet: its first type colour. */
export function fallbackColorFor(speciesId: string | undefined | null): string {
  const sp = speciesId ? SPECIES_DB[speciesId] : undefined;
  const t = sp?.types?.[0];
  return (t && TYPES[t]?.color) || '#4fc3f7';
}

export function creatureDisplayName(speciesId: string | undefined | null, fallback?: string): string {
  const sp = speciesId ? SPECIES_DB[speciesId] : undefined;
  if (sp) return sp.name;
  // Dorowani / Gabu are not in species.ts yet (Gen 2 starters, 147/148).
  if (speciesId === '147') return 'Dorowani';
  if (speciesId === '148') return 'Gabu';
  return fallback || 'Unknown';
}

/** Battle view mapping (Arena spec): opponent shows front, player shows back. */
export function battleView(isPlayer: boolean): SheetView {
  return isPlayer ? 'back' : 'front';
}

/**
 * Battle-only override image for a species on a side, or null to fall back
 * to the atlas cell from battleView(). Current overrides:
 * - Gabu (148 / 150) as OPPONENT: three-quarter-left cut, facing the player.
 * - Gearkid (032) / Mechapion (033) as PLAYER: true BACK cuts from their
 *   own 2D sheets (their atlases carry no genuine battle back cell).
 * The former Dorowani (147) player three-quarter cut was retired on
 * 2026-10-29 — the player side shows his atlas back cell (see the import
 * note at the top of this file). No side ever reuses a front cut for both
 * sides. No stats, moves, types, or HP are set here — sprite selection only.
 */
export function battleSpriteUrl(speciesId: string | undefined | null, isPlayer: boolean): string | null {
  const def = getSheetDef(speciesId);
  if (!def?.battle) return null;
  return isPlayer ? (def.battle.player ?? null) : (def.battle.opponent ?? null);
}
