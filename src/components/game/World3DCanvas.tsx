import React, { useEffect, useRef } from 'react';
import { getSheetDef, worldCell } from '../../lib/spriteSheets';
import { fallbackColorFor } from '../../lib/spriteSheets';
import { playerSlot, slotForNpc } from '../../lib/humanSheets';
import type { HumanView } from '../../lib/humanSheets';
import { creatureWalkFrameUrl } from '../../lib/creatureWalkFrames';
import type { WorldCanvasProps } from './PixiWorldCanvas';
import type { World3DArea } from '../../lib/world3d/areaData';
import { World3DRenderer, type ActorSprite } from '../../lib/world3d/glRenderer';
import { hgssFieldCamera, tileToWorldX, tileToWorldZ, TILE_UNITS } from '../../lib/world3d/camera';

/**
 * 3D world canvas — the Gen 5 (top) presentation of the style
 * switcher for areas with authored 3D data. Draws the held land +
 * building models as real polygons (WebGL2, src/lib/world3d) with
 * the HGSS field camera, and stands the SAME 2D actor sprites in
 * the ground plane as yaw billboards at the same tile positions,
 * sizes, sheet cells and walk-frame rules the Pixi canvas uses.
 * Game logic is untouched: this component only reads the props
 * WorldEngine already computes (positions, directions, anim
 * counters) — movement, gates and encounters run identically.
 *
 * Actor-resolution parity notes (vs PixiWorldCanvas): human slots
 * resolve through playerSlot/slotForNpc with the same view and
 * walk-cell rules; creature actors use creatureWalkFrameUrl on
 * step phases and the sheet world cell otherwise; actors with no
 * sheet draw as a flat colour quad where the 2D path draws its
 * placeholder figure (same slot colour). The 2D path's painted
 * label and day/night overlay are not part of this presentation.
 */

const imgCache = new Map<string, HTMLImageElement | 'loading' | 'error'>();

function getImage(url: string): HTMLImageElement | null {
  const hit = imgCache.get(url);
  if (hit instanceof HTMLImageElement) return hit;
  if (!hit) {
    imgCache.set(url, 'loading');
    const img = new Image();
    img.onload = () => imgCache.set(url, img);
    img.onerror = () => imgCache.set(url, 'error');
    img.src = url;
  }
  return null;
}

interface Resolved {
  img: HTMLImageElement | null;
  crop: { x: number; y: number; w: number; h: number } | null;
  flipX: boolean;
  color?: string;
}

function resolveHuman(slot: any, view: HumanView, stepParity: boolean): Resolved {
  if (!slot || !slot.sheetUrl) {
    return { img: null, crop: null, flipX: false, color: slot?.color ?? '#888888' };
  }
  const distinctLeft = slot.frames.left !== slot.frames.right;
  const showView: HumanView = view === 'left' && !distinctLeft ? 'right' : view;
  const flipX = view === 'left' && !distinctLeft;
  const walkCell = slot.walk
    ? (stepParity ? slot.walk.step[showView] : slot.walk.idle[showView])
    : null;
  const img = getImage(slot.sheetUrl);
  if (walkCell !== null && walkCell !== undefined) {
    return { img, crop: { x: (walkCell % 4) * 64, y: Math.floor(walkCell / 4) * 64, w: 64, h: 64 }, flipX };
  }
  return { img, crop: { x: slot.frames[showView], y: 0, w: 64, h: 64 }, flipX };
}

function resolveCreature(speciesId: string, dir: string, animTick: number): Resolved {
  const frameDir = dir === 'up' ? 'up' : dir === 'left' ? 'left' : dir === 'right' ? 'right' : 'down';
  const frameUrl = creatureWalkFrameUrl(speciesId, frameDir, animTick % 4);
  if (frameUrl) {
    return { img: getImage(frameUrl), crop: null, flipX: false };
  }
  const def = getSheetDef(speciesId);
  const view = dir === 'up' ? 'back' : dir === 'left' || dir === 'right' ? 'side' : 'front';
  const wc = def ? worldCell(def, view) : null;
  if (def && wc) {
    return {
      img: getImage(def.sheetUrl),
      crop: { x: wc.x, y: wc.y, w: def.cellSize, h: def.cellSize },
      flipX: dir === 'left',
    };
  }
  return { img: null, crop: null, flipX: false, color: fallbackColorFor(speciesId) };
}

export default function World3DCanvas(props: WorldCanvasProps & { area: World3DArea }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const areaRef = useRef(props.area);
  areaRef.current = props.area;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = hostRef.current!;
    let renderer: World3DRenderer | null = null;
    let raf = 0;
    let disposed = false;
    try {
      renderer = new World3DRenderer(canvas);
    } catch {
      return;
    }
    const mapW = propsRef.current.mapData.width || 30;
    const mapH = propsRef.current.mapData.height || 30;
    renderer.loadArea(areaRef.current, mapW, mapH).catch(() => {});

    const resize = () => {
      if (!renderer) return;
      const r = host.getBoundingClientRect();
      renderer.resize(Math.max(2, r.width), Math.max(2, r.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const feetOf = (x: number, y: number) => ({
      x: tileToWorldX(x, mapW),
      y: 0,
      z: tileToWorldZ(y, mapH) + TILE_UNITS / 2,
    });

    const frame = (timeMs: number) => {
      raf = requestAnimationFrame(frame);
      if (!renderer || !renderer.ready || disposed) return;
      const p = propsRef.current;
      const actors: ActorSprite[] = [];
      const push = (r: Resolved, x: number, y: number, sizeTiles: number) => {
        actors.push({
          img: r.img,
          crop: r.crop,
          feet: feetOf(x, y),
          w: sizeTiles * TILE_UNITS,
          h: sizeTiles * TILE_UNITS,
          flipX: r.flipX,
          color: r.color,
        });
      };

      (p.mapData.npcs || []).forEach((npc: any) => {
        if (p.defeatedIds.includes(npc.id)) return;
        const st = p.npcStates?.[npc.id];
        const nx = st?.x ?? npc.x;
        const ny = st?.y ?? npc.y;
        const def = npc.creatureId ? getSheetDef(npc.creatureId) : null;
        if (def) {
          const frameDir = npc.facing === 'up' ? 'up' : npc.facing === 'left' ? 'left' : npc.facing === 'right' ? 'right' : 'down';
          const frameUrl = creatureWalkFrameUrl(npc.creatureId, frameDir, p.animTick % 4);
          if (frameUrl) {
            push({ img: getImage(frameUrl), crop: null, flipX: false }, nx, ny, 1.25);
          } else {
            const wc = worldCell(def, 'front');
            if (wc) {
              push({ img: getImage(def.sheetUrl), crop: { x: wc.x, y: wc.y, w: def.cellSize, h: def.cellSize }, flipX: false }, nx, ny, 1.25);
            }
          }
          return;
        }
        const slot = slotForNpc(npc);
        if (st) {
          const view: HumanView = st.dir === 'back' || st.dir === 'left' || st.dir === 'right' ? st.dir : 'front';
          push(resolveHuman(slot, view, st.moving && st.step % 2 === 1), nx, ny, 1.25);
        } else {
          const view: HumanView = npc.facing === 'up' ? 'back' : npc.facing === 'left' ? 'left' : npc.facing === 'right' ? 'right' : 'front';
          // Standing NPCs use the walk-idle cell when the slot has a
          // walk layout (the 2D path's Hex pose rule), else row 0.
          const r = resolveHuman(slot, view, false);
          push(r, nx, ny, 1.25);
        }
      });

      (p.wilds || []).forEach((wild: any) => {
        push(resolveCreature(wild.speciesId, 'down', p.animTick), wild.x, wild.y, 1.1);
      });

      if (p.follower) {
        push(resolveCreature(p.follower.speciesId, p.follower.dir, p.animTick), p.follower.x, p.follower.y, 1.2);
      }

      // Player.
      if (p.playerKind === 'human') {
        const slot = playerSlot(p.playerGender ?? 'boy');
        const view: HumanView = p.playerDir === 'up' ? 'back' : p.playerDir === 'left' ? 'left' : p.playerDir === 'right' ? 'right' : 'front';
        push(resolveHuman(slot, view, p.animWalk % 2 === 1), p.playerPos.x, p.playerPos.y, 1.3);
      } else if (p.playerWalkFrameUrl) {
        push({ img: getImage(p.playerWalkFrameUrl), crop: null, flipX: false }, p.playerPos.x, p.playerPos.y, 1.3);
      } else if (p.playerSpeciesId) {
        push(resolveCreature(p.playerSpeciesId, p.playerDir, p.animTick), p.playerPos.x, p.playerPos.y, 1.3);
      }

      const cam = hgssFieldCamera(feetOf(p.playerPos.x, p.playerPos.y));
      renderer.render(cam, actors, timeMs);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
