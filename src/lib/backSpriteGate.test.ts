/**
 * BACK-SPRITE GATE — owner rule, 2026-10-29 ~22:21 CDT (Jamar, on seeing a
 * battle proof frame with the player-side creature front-facing):
 *
 *   "make a gate between when they're on the player side that it has to be
 *    the back facing picture for all of when they're on the player side and
 *    fighting for your team ... I don't want it to mess up the opponent
 *    side facing ones that are facing correctly. ... get it where their
 *    back facing side is the one that's on the player side for all of them."
 *
 * This suite FAILS THE BUILD if any species' player-side battle render
 * resolves to a front-facing asset, or if any opponent-side resolution
 * resolves to a back. It is a gate, not a sample: every one of the 50 dex
 * records is checked, every run.
 *
 * HOW IT KEYS OFF THE REAL RENDER PATH (not a re-implementation):
 * - Both battle surfaces resolve a battler through the SAME exported
 *   functions imported here: PixiBattleCanvas.place() calls
 *   battleSpriteUrl(speciesId, isPlayer) then battleCell(def, view) with
 *   view = isPlayer ? 'back' : 'front'; CreaturePortrait (the component
 *   WorldEngine's inline battle and ArenaBattleView render) uses
 *   battleSpriteUrl(speciesId, true) for a 'back' request and
 *   sheetCellStyle(def, view) -> battleCell(def, view) otherwise.
 *   The gate calls those exact functions, with battleView(isPlayer)
 *   supplying the view, exactly as the hosts do.
 * - The expected front/back cells below are NOT copied from the code
 *   under test: they are the eye-audited ground truth from the
 *   back-sprite-fix lane's cell-by-cell audit (AUDIT.md, 2026-10-29),
 *   independently re-derived in the back-sprite-gate lane from the
 *   pre-fix defs plus the audit's documented corrections, and
 *   cross-checked against the composed tree (50/50 defs matched).
 * - The DOM component's one historical failure mode (its idle cycle
 *   replaced ANY requested view with FRONT frames) lives inside
 *   CreaturePortrait's effects, which this node-env suite cannot drive
 *   live; the gate therefore ALSO renders the real component (SSR) for
 *   the static branch and pins the component's idle-gating invariants
 *   in its actual source, plus the hosts' actual wiring lines. The
 *   live-component behaviour is exercised by the gate lane's Playwright
 *   proof (back-sprite-gate/proof/).
 *
 * KNOWN EXCEPTIONS (owner/art slots — do NOT "fix" by inventing art):
 * - 022 Finblade: CORRECTED 2026-10-29 (art-completion cell re-read,
 *   applied in the back-choice correction): the genuine rear is cell
 *   (64,0) (back of head, red underside, no eyes) and the front is
 *   (128,0) (red eyes) — the locked manifest had the two roles swapped.
 *   (192,0) is the dorsal cell and is NOT the back.
 * - 147 Dorowani / 148+150 Gabu: CORRECTED 2026-10-29 (owner ruling):
 *   the previously gated backs were the species' 3D sprite backs —
 *   Dorowani (64,0), a half-figure split from the merged 3D-bake pair
 *   cell, and Gabu (192,0), the T-pose 3D-bake back. Both cells stay in
 *   their atlases, labelled "3D sprite back" in the manifests, and are
 *   NOT wired. The audited backs below are the sheet backs the owner
 *   named: Dorowani cell 2 at (192,0) (full standing shell back) and
 *   Gabu (64,0) (full standing shell back).
 * - 400 Goddgachuu: NO art exists anywhere. It has no sheet def and
 *   renders the placeholder fallback on both sides. The gate pins that
 *   absence: if a def for 400 ever appears, this gate fails on purpose
 *   until that species' back has been eye-audited and added below.
 * - 047 Mythar: dex id 047 has no def of its own; its def lives under
 *   code id 331 (pre-existing data split). Battles carrying 331 are
 *   gated via the 331 row; the 047 row asserts the split is unchanged.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  SHEET_DEFS, getSheetDef, battleView, battleCell, battleSpriteUrl,
} from './spriteSheets';
import CreaturePortrait from '../components/game/CreaturePortrait';
import speciesJson from '../data/core/species.json';

/** Audited ground truth: the genuine FRONT and BACK battle cells per def. */
const AUDITED: Record<string, { name: string; front: { x: number; y: number }; back: { x: number; y: number } }> = {
  '001': { name: 'Mochii', front: { x: 0, y: 0 }, back: { x: 192, y: 0 } },
  '002': { name: 'Tiidebiite', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '003': { name: 'AquariiOS', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '004': { name: 'Razorgater', front: { x: 256, y: 0 }, back: { x: 0, y: 0 } },
  '005': { name: 'Chromejaww', front: { x: 64, y: 0 }, back: { x: 128, y: 0 } },
  '006': { name: 'Reaperdile', front: { x: 64, y: 0 }, back: { x: 320, y: 0 } },
  '007': { name: 'Tyrage', front: { x: 192, y: 0 }, back: { x: 0, y: 0 } },
  '008': { name: 'Duneclaw', front: { x: 128, y: 0 }, back: { x: 64, y: 0 } },
  '009': { name: 'Oblivirex', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '010': { name: 'Kittember', front: { x: 128, y: 0 }, back: { x: 256, y: 0 } },
  '011': { name: 'Pyropaw', front: { x: 64, y: 0 }, back: { x: 0, y: 0 } },
  '012': { name: 'Manticlaw', front: { x: 0, y: 0 }, back: { x: 192, y: 0 } },
  '013': { name: 'Pupbble', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '014': { name: 'Terradog', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '015': { name: 'Quakehound', front: { x: 192, y: 0 }, back: { x: 64, y: 0 } },
  '016': { name: 'Squirmite', front: { x: 64, y: 0 }, back: { x: 0, y: 0 } },
  '017': { name: 'Cocoonode', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '018': { name: 'Mothrix', front: { x: 0, y: 0 }, back: { x: 192, y: 0 } },
  '019': { name: 'Zephling', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '020': { name: 'Aerobeak', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '021': { name: 'Stormtalon', front: { x: 128, y: 0 }, back: { x: 192, y: 0 } },
  '022': { name: 'Finblade', front: { x: 128, y: 0 }, back: { x: 64, y: 0 } },
  '023': { name: 'Megalochrome', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '024': { name: 'Floatcalf', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '025': { name: 'Astroleviathan', front: { x: 64, y: 0 }, back: { x: 128, y: 0 } },
  '026': { name: 'Inklet', front: { x: 192, y: 0 }, back: { x: 0, y: 0 } },
  '027': { name: 'Toxitacle', front: { x: 320, y: 0 }, back: { x: 256, y: 0 } },
  '028': { name: 'Krakenox', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '029': { name: 'Punchkid', front: { x: 128, y: 0 }, back: { x: 192, y: 0 } },
  '030': { name: 'Strikechamp', front: { x: 256, y: 0 }, back: { x: 320, y: 0 } },
  '031': { name: 'Kickmaster', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '032': { name: 'Gearkid', front: { x: 128, y: 0 }, back: { x: 0, y: 192 } },
  '033': { name: 'Mechapion', front: { x: 0, y: 0 }, back: { x: 320, y: 0 } },
  '034': { name: 'Gorokappa', front: { x: 0, y: 0 }, back: { x: 192, y: 0 } },
  '035': { name: 'Pebblefist', front: { x: 64, y: 0 }, back: { x: 192, y: 0 } },
  '036': { name: 'Cragarm', front: { x: 0, y: 0 }, back: { x: 256, y: 0 } },
  '037': { name: 'Terrapod', front: { x: 64, y: 0 }, back: { x: 0, y: 0 } },
  '038': { name: 'Sproutle', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '039': { name: 'Shellguard', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '040': { name: 'Dreadtoise', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '041': { name: 'Pixilite', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '042': { name: 'Wispkin', front: { x: 0, y: 0 }, back: { x: 128, y: 0 } },
  '043': { name: 'Duskfiend', front: { x: 64, y: 0 }, back: { x: 0, y: 0 } },
  '044': { name: 'Ashemit', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '045': { name: 'Pyromonk', front: { x: 256, y: 0 }, back: { x: 0, y: 0 } },
  '046': { name: 'Yogiferno', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
  '147': { name: 'Dorowani', front: { x: 0, y: 0 }, back: { x: 192, y: 0 } },
  '148': { name: 'Gabu', front: { x: 128, y: 0 }, back: { x: 64, y: 0 } },
  '150': { name: 'Gabu', front: { x: 128, y: 0 }, back: { x: 64, y: 0 } },
  '331': { name: 'Mythar', front: { x: 0, y: 0 }, back: { x: 64, y: 0 } },
};

/** Dex id -> the sheet-def id its battle renders resolve through. */
const DEX_TO_DEF: Record<string, string> = { '047': '331' };
/** Dex ids with NO art at all today (pinned exceptions, see header). */
const NO_ART_DEX = new Set(['400']);
/** Defs whose PLAYER side is a full-image audited BACK cut, not a cell. */
const PLAYER_BACK_CUT_DEFS = new Set(['032', '033']);
/** Defs whose OPPONENT side is a full-image front-facing cut (Gabu). */
const OPPONENT_CUT_DEFS = new Set(['148', '150']);

const DEX = (speciesJson as { species: { id: string; name: string }[] }).species;

describe('BACK-SPRITE GATE — coverage: every dex species is audited', () => {
  it('the dex still holds exactly the 50 audited records', () => {
    expect(
      DEX.length,
      `BACK-SPRITE GATE FAIL — species.json now holds ${DEX.length} records, not the 50 this gate audited. ` +
      'Eye-audit the new/removed species\u2019 back picture and update AUDITED in src/lib/backSpriteGate.test.ts before shipping.',
    ).toBe(50);
  });
  it('every dex species maps to an audited def (or the named no-art exception)', () => {
    for (const sp of DEX) {
      if (NO_ART_DEX.has(sp.id)) continue;
      const defId = DEX_TO_DEF[sp.id] ?? sp.id;
      expect(
        AUDITED[defId],
        `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) resolves through def ${defId}, which has no audited row. ` +
        'Eye-audit its front and back cells and add the row before shipping.',
      ).toBeTruthy();
    }
  });
  it('every sheet def in the game is an audited def', () => {
    for (const defId of Object.keys(SHEET_DEFS)) {
      expect(
        AUDITED[defId],
        `BACK-SPRITE GATE FAIL — sheet def ${defId} exists but is not in the audited table. ` +
        'A def the gate has not audited could put any picture on either battle side.',
      ).toBeTruthy();
    }
  });
});

describe('BACK-SPRITE GATE — side mapping', () => {
  it('battleView maps player -> back and opponent -> front', () => {
    expect(battleView(true), 'BACK-SPRITE GATE FAIL — battleView(true) is not "back": the PLAYER side would not ask for the back picture.').toBe('back');
    expect(battleView(false), 'BACK-SPRITE GATE FAIL — battleView(false) is not "front": the OPPONENT side would not ask for the front picture.').toBe('front');
  });
});

describe('BACK-SPRITE GATE — per-species resolution (the actual host path)', () => {
  for (const sp of DEX) {
    if (NO_ART_DEX.has(sp.id)) continue;
    const defId = DEX_TO_DEF[sp.id] ?? sp.id;
    const audited = AUDITED[defId];
    it(`${sp.id} ${sp.name}: player side = audited BACK, opponent side = audited FRONT`, () => {
      const def = getSheetDef(defId);
      expect(
        def,
        `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) has no sheet def under ${defId}; its battle render cannot be gated.`,
      ).not.toBeNull();

      // PLAYER side, resolved exactly as both hosts resolve it:
      // override first (battleSpriteUrl), else battleCell(def, battleView(true)).
      const playerOverride = battleSpriteUrl(defId, true);
      if (PLAYER_BACK_CUT_DEFS.has(defId)) {
        expect(
          playerOverride && playerOverride.includes('back-cut'),
          `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) PLAYER side: expected its audited back cut ` +
          `(a "back-cut" image), got ${JSON.stringify(playerOverride)}. The player side must show the BACK picture.`,
        ).toBe(true);
      } else {
        expect(
          playerOverride,
          `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) PLAYER side: an override image (${JSON.stringify(playerOverride)}) ` +
          'pre-empts the audited back cell. Overrides for the player side are gated to the audited back cuts only (032 Gearkid, 033 Mechapion).',
        ).toBeNull();
        const playerCell = battleCell(def!, battleView(true));
        expect(
          playerCell,
          `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) PLAYER side resolved to cell (${playerCell.x},${playerCell.y}), ` +
          `but the audited BACK picture is cell (${audited.back.x},${audited.back.y}). The player side must show the BACK picture.`,
        ).toEqual(audited.back);
      }

      // OPPONENT side, same path with isPlayer = false. The owner's rule
      // protects this side too: it must keep resolving to the FRONT.
      const opponentOverride = battleSpriteUrl(defId, false);
      if (OPPONENT_CUT_DEFS.has(defId)) {
        expect(
          opponentOverride,
          `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) OPPONENT side: its front-facing cut no longer resolves. ` +
          'The opponent side must keep showing the FRONT picture.',
        ).toBeTruthy();
      } else {
        expect(
          opponentOverride,
          `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) OPPONENT side: an un-audited override image (${JSON.stringify(opponentOverride)}) ` +
          'pre-empts the audited front cell. The opponent side must keep showing the FRONT picture.',
        ).toBeNull();
      }
      const opponentCell = battleCell(def!, battleView(false));
      expect(
        opponentCell,
        `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}) OPPONENT side resolved to cell (${opponentCell.x},${opponentCell.y}), ` +
        `but the audited FRONT picture is cell (${audited.front.x},${audited.front.y}). The opponent side must show the FRONT picture.`,
      ).toEqual(audited.front);

      // The two sides can never be the same picture.
      expect(
        audited.front.x !== audited.back.x || audited.front.y !== audited.back.y,
        `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}): audited front and back are the same cell; one side would face the wrong way.`,
      ).toBe(true);
      const frontCell = battleCell(def!, 'front');
      const backCell = battleCell(def!, 'back');
      expect(
        frontCell.x !== backCell.x || frontCell.y !== backCell.y,
        `BACK-SPRITE GATE FAIL — ${sp.name} (${sp.id}): front and back resolve to the same cell (${frontCell.x},${frontCell.y}); ` +
        'one side is showing the wrong-facing picture.',
      ).toBe(true);
    });
  }

  it('400 Goddgachuu still has no sheet def (pinned no-art exception)', () => {
    expect(
      getSheetDef('400'),
      'BACK-SPRITE GATE FAIL — 400 Goddgachuu now has a sheet def. Do not weaken this gate: eye-audit its front ' +
      'and back cells, add its AUDITED row, and remove it from NO_ART_DEX in this file first.',
    ).toBeNull();
  });
  it('047 Mythar keeps its data split (no own def; def lives under 331)', () => {
    expect(
      getSheetDef('047'),
      'BACK-SPRITE GATE FAIL — 047 Mythar now has its own sheet def. Re-audit which id its battles resolve through ' +
      'and update DEX_TO_DEF / AUDITED in this file; do not let the split change silently.',
    ).toBeNull();
    expect(getSheetDef('331')).not.toBeNull();
  });
});

describe('BACK-SPRITE GATE — CreaturePortrait (the DOM battle component)', () => {
  const src = readFileSync(new URL('../components/game/CreaturePortrait.tsx', import.meta.url), 'utf8');

  it('the idle cycle can never run for a non-front view (the original bug)', () => {
    expect(
      /if \(view !== 'front'\) return;/.test(src),
      'BACK-SPRITE GATE FAIL — CreaturePortrait\u2019s idle effect no longer refuses non-front views. ' +
      'Idle frames are FRONT-facing art: without that guard, a player-side (back) portrait cycles front frames ' +
      'and the creature faces the player — the exact defect this gate exists to prevent.',
    ).toBe(true);
    expect(
      /showIdle = .*view === 'front'/.test(src),
      'BACK-SPRITE GATE FAIL — CreaturePortrait\u2019s showIdle no longer requires view === "front". ' +
      'A back-view portrait must never render an idle frame (idle frames are front-facing).',
    ).toBe(true);
  });

  it('a back request renders the registered battle-back cut when one exists', () => {
    expect(
      /battleSpriteUrl\(speciesId, true\)/.test(src),
      'BACK-SPRITE GATE FAIL — CreaturePortrait no longer asks battleSpriteUrl(speciesId, true) for a back view, ' +
      'so Gearkid/Mechapion would lose their true back cuts on the DOM battle surfaces.',
    ).toBe(true);
  });

  it('SSR: Dorowani view="back" renders his back cell, view="front" his front cell', () => {
    const back = renderToString(React.createElement(CreaturePortrait, { speciesId: '147', view: 'back', size: 100 }));
    expect(
      back.includes('background-position:-300px -0px'),
      `BACK-SPRITE GATE FAIL — Dorowani (147) PLAYER side: CreaturePortrait view="back" did not render his audited back cell (192,0). Got: ${back.slice(0, 300)}`,
    ).toBe(true);
    const front = renderToString(React.createElement(CreaturePortrait, { speciesId: '147', view: 'front', size: 100 }));
    expect(
      front.includes('background-position:-0px -0px'),
      `BACK-SPRITE GATE FAIL — Dorowani (147) OPPONENT side: CreaturePortrait view="front" did not render his audited front cell (0,0). Got: ${front.slice(0, 300)}`,
    ).toBe(true);
  });

  it('SSR: Gearkid and Mechapion view="back" render their back cuts', () => {
    const gearkid = renderToString(React.createElement(CreaturePortrait, { speciesId: '032', view: 'back', size: 100 }));
    expect(
      gearkid.includes('gearkid-back-cut'),
      'BACK-SPRITE GATE FAIL — Gearkid (032) PLAYER side: CreaturePortrait view="back" did not render gearkid-back-cut.png.',
    ).toBe(true);
    const mechapion = renderToString(React.createElement(CreaturePortrait, { speciesId: '033', view: 'back', size: 100 }));
    expect(
      mechapion.includes('mechapion-back-cut'),
      'BACK-SPRITE GATE FAIL — Mechapion (033) PLAYER side: CreaturePortrait view="back" did not render mechapion-back-cut.png.',
    ).toBe(true);
  });
});

describe('BACK-SPRITE GATE — battle host wiring (the actual hosts)', () => {
  it('WorldEngine inline battle: enemy portrait is view="front", player portrait is view="back"', () => {
    const src = readFileSync(new URL('../world/WorldEngine.tsx', import.meta.url), 'utf8');
    expect(
      /CreaturePortrait speciesId=\{enemy\.speciesId \|\| enemy\.id\} view="front"/.test(src),
      'BACK-SPRITE GATE FAIL — WorldEngine\u2019s battle enemy billboard no longer renders CreaturePortrait view="front". The opponent side must show the FRONT picture.',
    ).toBe(true);
    expect(
      /CreaturePortrait speciesId=\{player\.speciesId \|\| player\.id\} view="back"/.test(src),
      'BACK-SPRITE GATE FAIL — WorldEngine\u2019s battle player billboard no longer renders CreaturePortrait view="back". The player side must show the BACK picture.',
    ).toBe(true);
  });

  it('ArenaBattleView: fighters render view={isPlayer ? back : front}', () => {
    const src = readFileSync(new URL('../components/views/ArenaBattleView.tsx', import.meta.url), 'utf8');
    expect(
      /view=\{f\.isPlayer \? 'back' : 'front'\}/.test(src),
      'BACK-SPRITE GATE FAIL — ArenaBattleView no longer renders fighters with view={f.isPlayer ? \'back\' : \'front\'}. ' +
      'Player-side fighters must show the BACK picture; opponent-side fighters the FRONT.',
    ).toBe(true);
  });

  it('BattleView mounts PixiBattleCanvas, whose place() resolves per side', () => {
    const battleViewSrc = readFileSync(new URL('../components/views/BattleView.tsx', import.meta.url), 'utf8');
    expect(
      /<PixiBattleCanvas/.test(battleViewSrc),
      'BACK-SPRITE GATE FAIL — BattleView no longer mounts PixiBattleCanvas; the Pixi battle host this gate covers is gone or renamed. Re-point the gate at the real host.',
    ).toBe(true);
    const pixiSrc = readFileSync(new URL('../components/game/PixiBattleCanvas.tsx', import.meta.url), 'utf8');
    expect(
      /battleSpriteUrl\(speciesId, isPlayer\)/.test(pixiSrc),
      'BACK-SPRITE GATE FAIL — PixiBattleCanvas.place() no longer resolves battle overrides via battleSpriteUrl(speciesId, isPlayer); the gate\u2019s resolution checks would no longer describe the Pixi host.',
    ).toBe(true);
    expect(
      /isPlayer \? 'back' : 'front'/.test(pixiSrc) || /battleView\(isPlayer\)/.test(pixiSrc),
      'BACK-SPRITE GATE FAIL — PixiBattleCanvas.place() no longer selects the battle cell view by side (player back / opponent front). The player side must show the BACK picture.',
    ).toBe(true);
  });
});
