import React, { useEffect, useRef, useState } from 'react';
import CreaturePortrait from './CreaturePortrait';
import HumanPortrait from './HumanPortrait';
import { useGameStore } from '../../store/gameStore';
import type { HumanSlot } from '../../lib/humanSheets';

/**
 * M1 (2026-10-29, owner t348u): Gen-3-layout battle scene, replacing
 * the "SYS_BATTLE" grid prototype. Layout follows the pokeemerald /
 * pokefirered battle screen conventions (studied from the decomp
 * source, no assets copied): enemy on a far platform top-right with
 * its info box top-left; player's back sprite on a near platform
 * bottom-left with its info box (HP numbers + EXP bar) bottom-right;
 * a message window bottom-left and a FIGHT / BAG / MOCHII / RUN
 * command box bottom-right with a ► cursor; FIGHT opens a 2x2 move
 * list with a type/power panel. Keyboard: arrows/WASD move, Enter/
 * Space/Z = A, Escape/X/Backspace = B. Mouse/touch click the same.
 * Animations: trainer send-out, enemy slide-in, mon pop-in, attack
 * lunge, hit blink, HP drain, faint drop. All drawing is CSS — the
 * platforms and backdrops are original, the creatures and humans are
 * the project's own sprites.
 */
export type BattleAction = { type: 'move'; move: string } | { type: 'catch' } | { type: 'run' };

type Props = {
  bs: any;
  enemy: any;
  player: any;
  credits: number;
  battleAnim: 'player' | 'enemy' | null;
  terrain: 'grass' | 'indoor' | 'dojo';
  playerSlot: HumanSlot;
  trainerSlot?: HumanSlot | null;
  cubes: number;
  resolveMove: (m: string) => { display: string; type: string; power: number } | null;
  typeColors: Record<string, string>;
  onAction: (a: BattleAction) => void;
  onFinish: () => void;
};

const BG: Record<string, { sky: string; ground: string; far: string; near: string; rim: string }> = {
  grass: { sky: 'linear-gradient(#a8e0f8 0%, #d8f4ff 46%, #b8e890 46%, #98d070 100%)', ground: '', far: 'radial-gradient(ellipse at 50% 45%, #c8f0a0 0%, #a0d878 55%, #78b850 72%, transparent 74%)', near: 'radial-gradient(ellipse at 50% 45%, #c8f0a0 0%, #a0d878 55%, #78b850 72%, transparent 74%)', rim: '#4c8a30' },
  indoor: { sky: 'linear-gradient(#e8dcc8 0%, #f4ecdc 40%, #d8c4a0 40%, #c8b088 100%)', ground: '', far: 'radial-gradient(ellipse at 50% 45%, #fff6e0 0%, #e8d4b0 55%, #c8a878 72%, transparent 74%)', near: 'radial-gradient(ellipse at 50% 45%, #fff6e0 0%, #e8d4b0 55%, #c8a878 72%, transparent 74%)', rim: '#9a7a50' },
  dojo: { sky: 'linear-gradient(#3a2a40 0%, #5a3a50 40%, #b08858 40%, #8a6438 100%)', ground: '', far: 'radial-gradient(ellipse at 50% 45%, #f0d8a0 0%, #d8b070 55%, #a87840 72%, transparent 74%)', near: 'radial-gradient(ellipse at 50% 45%, #f0d8a0 0%, #d8b070 55%, #a87840 72%, transparent 74%)', rim: '#6a4420' },
};

function HpBar({ cur, max }: { cur: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100));
  const col = pct > 50 ? '#58d858' : pct > 20 ? '#f8c800' : '#f84040';
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-black px-1 rounded-sm" style={{ background: '#404040', color: '#f8b000', lineHeight: '12px' }}>HP</span>
      <div className="flex-1 h-[8px] rounded-sm" style={{ background: '#484848', border: '2px solid #303030' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: col, transition: 'width 700ms linear, background 300ms', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

function InfoBox({ mon, showNumbers, side }: { mon: any; showNumbers: boolean; side: 'enemy' | 'player' }) {
  const cur = Math.max(0, mon.currentHp ?? mon.hp ?? 0);
  const max = mon.maxHp ?? 1;
  const xp = mon.xp ?? 0;
  const xpPct = Math.min(100, (xp % 1000) / 10);
  return (
    <div className="gba-box px-3 py-2" style={{ width: 'min(280px, 46vw)', borderRadius: side === 'enemy' ? '4px 18px 4px 4px' : '18px 4px 4px 4px' }}>
      <div className="flex justify-between items-baseline">
        <span className="gba-text font-black text-[17px] tracking-wide uppercase">{mon.nickname || mon.name}</span>
        <span className="gba-text font-black text-[14px]">Lv{mon.level ?? 5}</span>
      </div>
      <HpBar cur={cur} max={max} />
      {showNumbers && <div className="gba-text text-right font-black text-[15px] leading-tight mt-0.5">{cur}/ {max}</div>}
      {showNumbers && (
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-black" style={{ color: '#4060c0' }}>EXP</span>
          <div className="flex-1 h-[4px]" style={{ background: '#303030' }}><div className="h-full" style={{ width: `${xpPct}%`, background: '#40c8f8', transition: 'width 600ms' }} /></div>
        </div>
      )}
    </div>
  );
}

export default function GbaBattleScene(props: Props) {
  const { bs, enemy, player, battleAnim, terrain, playerSlot, trainerSlot, cubes, resolveMove, typeColors, onAction, onFinish } = props;
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => { const f = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const portrait = vp.h > vp.w;
  // sprite scale: 1 at a 960x640 stage, shrinks/grows with the viewport
  const vs = Math.max(0.6, Math.min(1.6, portrait ? vp.w / 520 : Math.min(vp.w / 960, vp.h / 640)));
  const [menu, setMenu] = useState<'cmd' | 'fight' | 'bag'>('cmd');
  const [cur, setCur] = useState(0);
  const [moveCur, setMoveCur] = useState(0);
  const [bagCur, setBagCur] = useState(0);
  const patches = useGameStore((st: any) => st.inventory?.mend_patch || 0);
  const [intro, setIntro] = useState(0); // 0 slide-in, 1 trainer send-out, 2 ready
  const [hitFlash, setHitFlash] = useState<'enemy' | 'player' | null>(null);
  const t = BG[terrain] || BG.grass;
  const moves: string[] = (player.moves || []).slice(0, 4);
  const enemyHp = enemy.currentHp ?? enemy.hp ?? 0;
  const playerHp = player.currentHp ?? player.hp ?? 0;

  useEffect(() => { const a = setTimeout(() => setIntro(1), 900); const b = setTimeout(() => setIntro(2), 1700); return () => { clearTimeout(a); clearTimeout(b); }; }, []);
  useEffect(() => { if (bs.phase === 'menu') setMenu(m => (m === 'fight' || m === 'bag') ? m : 'cmd'); }, [bs.phase]);
  // hit blink lands after the lunge
  useEffect(() => {
    if (!battleAnim) return;
    const target = battleAnim === 'player' ? 'enemy' : 'player';
    const a = setTimeout(() => setHitFlash(target), 220);
    const b = setTimeout(() => setHitFlash(null), 700);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [battleAnim]);

  const cmds = ['FIGHT', 'BAG', 'MOCHII', 'RUN'];
  const pickCmd = (i: number) => {
    if (i === 0) { setMenu('fight'); }
    else if (i === 1) { setMenu('bag'); }
    else if (i === 2) { /* single active party view: no switching mid-battle in M1 */ }
    else onAction({ type: 'run' });
  };
  const ref = useRef<any>({});
  ref.current = { menu, cur, moveCur, moves, bs, intro, bagCur };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const s = ref.current;
      const k = e.key;
      const A = k === 'Enter' || k === ' ' || k === 'z' || k === 'Z';
      const B = k === 'Escape' || k === 'x' || k === 'X' || k === 'Backspace';
      if (s.bs.phase === 'over') return; // engine handles Continue
      if (s.bs.phase !== 'menu' || s.intro < 2) return;
      const dir = (k === 'ArrowLeft' || k === 'a') ? [-1, 0] : (k === 'ArrowRight' || k === 'd') ? [1, 0] : (k === 'ArrowUp' || k === 'w') ? [0, -1] : (k === 'ArrowDown' || k === 's') ? [0, 1] : null;
      if (dir || A || B) { e.preventDefault(); e.stopPropagation(); }
      const grid = (i: number, n: number) => { const x = i % 2, y = Math.floor(i / 2); const nx = Math.max(0, Math.min(1, x + dir![0])), ny = Math.max(0, Math.min(1, y + dir![1])); const j = ny * 2 + nx; return j < n ? j : i; };
      if (s.menu === 'cmd') {
        if (dir) setCur(grid(s.cur, 4));
        else if (A) pickCmd(s.cur);
        else if (B) setCur(0);
      } else if (s.menu === 'fight') {
        if (dir) setMoveCur(grid(s.moveCur, s.moves.length));
        else if (A && s.moves[s.moveCur]) { onAction({ type: 'move', move: s.moves[s.moveCur] }); setMenu('cmd'); }
        else if (B) setMenu('cmd');
      } else if (s.menu === 'bag') {
        if (dir && dir[1]) setBagCur((c: number) => Math.max(0, Math.min(2, c + dir[1])));
        else if (A) { if (s.bagCur === 0) { if (s.bs.canCatch) onAction({ type: 'catch' }); setMenu('cmd'); } else if (s.bagCur === 1) { onAction({ type: 'item', item: 'mend_patch' }); setMenu('cmd'); } else setMenu('cmd'); setBagCur(0); }
        else if (B) { setMenu('cmd'); setBagCur(0); }
      }
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [onAction]);

  const lastLines: string[] = bs.log.slice(-2);
  const showCommands = bs.phase === 'menu' && intro >= 2;
  const isTrainer = bs.type === 'trainer';
  const introMsg = intro < 2 ? (isTrainer ? `${bs.trainerName} wants to battle!` : `A wild ${enemy.name} appeared!`) : null;
  const sel = moves[moveCur] ? resolveMove(moves[moveCur]) : null;
  const enemyFainted = enemyHp <= 0;
  const playerFainted = playerHp <= 0;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black select-none">
      <style>{`
        .gba-box{background:#f8f8e0;border:3px solid #384850;box-shadow:inset 0 0 0 2px #a8b8a0, 0 3px 0 rgba(0,0,0,.35)}
        .gba-text{color:#383838;text-shadow:2px 2px 0 #d0d0c0;font-family:var(--dialogue-font,"Trebuchet MS",system-ui,sans-serif)}
        .gba-msg{background:#283850;border:4px solid #c8a848;border-radius:6px;box-shadow:inset 0 0 0 3px #384868}
        .gba-msg-inner{background:#f8f8f8;border-radius:4px}
        @keyframes gbaEnemyIn{from{transform:translateX(-620px)}to{transform:translateX(0)}}
        @keyframes gbaPlayerIn{from{transform:translateX(620px)}to{transform:translateX(0)}}
        @keyframes gbaTrainerOut{0%{transform:translateX(0);opacity:1}100%{transform:translateX(-260px);opacity:0}}
        @keyframes gbaPop{0%{transform:scale(0.1);filter:brightness(4)}60%{transform:scale(1.08);filter:brightness(1.6)}100%{transform:scale(1);filter:none}}
        @keyframes gbaLungeP{0%{transform:translate(0,0)}40%{transform:translate(46px,-22px)}100%{transform:translate(0,0)}}
        @keyframes gbaLungeE{0%{transform:translate(0,0)}40%{transform:translate(-46px,22px)}100%{transform:translate(0,0)}}
        @keyframes gbaBlink{0%,100%{opacity:1}25%,75%{opacity:0}50%{opacity:1}}
        @keyframes gbaFaint{to{transform:translateY(120px);opacity:0}}
        @keyframes gbaBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes gbaBoxIn{from{transform:translateX(var(--from))}to{transform:translateX(0)}}
      `}</style>
      <div className="relative overflow-hidden" style={{ width: '100vw', height: '100dvh', background: t.sky, imageRendering: 'pixelated' }}>
        {/* far platform + enemy */}
        <div className="absolute" style={{ right: '4%', top: portrait ? '30%' : '30%', width: portrait ? '56%' : '40%', height: '12%', background: t.far, animation: 'gbaEnemyIn 900ms ease-out' }} />
        <div className="absolute flex items-end justify-center" style={{ right: portrait ? '6%' : '13%', top: portrait ? '12%' : '4%', width: portrait ? '50%' : '28%', height: portrait ? '26%' : '36%', animation: 'gbaEnemyIn 900ms ease-out' }}>
          {isTrainer && trainerSlot && intro < 2 && (
            <div className="absolute" style={{ right: '-6%', bottom: 0, mixBlendMode: 'multiply', animation: intro === 1 ? 'gbaTrainerOut 700ms forwards reverse' : undefined }}>
              <HumanPortrait slot={trainerSlot} view="front" size={Math.round(150*vs)} />
            </div>
          )}
          <div style={{ animation: enemyFainted ? 'gbaFaint 600ms forwards' : battleAnim === 'enemy' ? 'gbaLungeE 420ms ease-out' : hitFlash === 'enemy' ? 'gbaBlink 480ms linear' : (isTrainer && intro < 2) ? undefined : 'gbaPop 450ms ease-out, gbaBob 1.6s ease-in-out 500ms infinite', opacity: isTrainer && intro < 2 ? 0 : 1 }}>
            <CreaturePortrait speciesId={enemy.speciesId || enemy.id} view="front" size={Math.round(170*vs)} />
          </div>
        </div>
        {/* near platform + player */}
        <div className="absolute" style={{ left: '-4%', top: portrait ? '56%' : '64%', width: portrait ? '70%' : '50%', height: portrait ? '10%' : '18%', background: t.near, animation: 'gbaPlayerIn 900ms ease-out' }} />
        <div className="absolute flex items-end justify-center" style={{ left: portrait ? '2%' : '6%', top: portrait ? '36%' : '30%', width: portrait ? '60%' : '32%', height: portrait ? '28%' : '44%', animation: 'gbaPlayerIn 900ms ease-out' }}>
          {intro < 2 && (
            <div className="absolute bottom-0" style={{ animation: intro === 1 ? 'gbaTrainerOut 700ms forwards' : undefined }}>
              <HumanPortrait slot={playerSlot} view="back" cell={playerSlot.battleCell != null ? { col: playerSlot.battleCell % (playerSlot.sheetCols ?? 4), row: Math.floor(playerSlot.battleCell / (playerSlot.sheetCols ?? 4)) } : undefined} size={Math.round(200*vs)} />
            </div>
          )}
          {intro >= 1 && (
            <div style={{ animation: playerFainted ? 'gbaFaint 600ms forwards' : battleAnim === 'player' ? 'gbaLungeP 420ms ease-out' : hitFlash === 'player' ? 'gbaBlink 480ms linear' : 'gbaPop 450ms ease-out' }}>
              <CreaturePortrait speciesId={player.speciesId || player.id} view="back" size={Math.round(200*vs)} />
            </div>
          )}
        </div>
        {/* info boxes */}
        <div className="absolute" style={{ left: '4%', top: '6%', ['--from' as any]: '-400px', animation: 'gbaBoxIn 500ms ease-out 700ms both' }}>
          <InfoBox mon={enemy} showNumbers={false} side="enemy" />
        </div>
        {intro >= 2 && (
          <div className="absolute" style={{ right: '3%', top: portrait ? '44%' : '50%', ['--from' as any]: '400px', animation: 'gbaBoxIn 400ms ease-out both' }}>
            <InfoBox mon={player} showNumbers={true} side="player" />
          </div>
        )}
        {/* bottom UI */}
        <div className={`absolute left-0 right-0 bottom-0 flex overflow-hidden ${portrait ? 'flex-col' : ''}`} style={{ height: portrait ? '36%' : '27%', maxHeight: '100dvh', boxSizing: 'border-box', paddingBottom: 'env(safe-area-inset-bottom)', background: '#283850' }}>
          <div className="gba-msg flex-1 m-1 p-1.5 min-h-0 min-w-0 overflow-hidden">
            <div className="gba-msg-inner h-full px-4 py-2 flex flex-col justify-center">
              {(introMsg ? [introMsg] : (menu === 'fight' && showCommands ? [] : (showCommands ? [`What will ${player.nickname || player.name} do?`] : lastLines))).map((l, i) => (
                <div key={i + l} className="gba-text font-bold leading-snug" style={{ fontSize: 'clamp(13px,2.5vh,20px)' }}>{l}</div>
              ))}
              {menu === 'fight' && showCommands && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {moves.map((m, i) => { const r = resolveMove(m); return (
                    <button key={m} onMouseEnter={() => setMoveCur(i)} onClick={() => { onAction({ type: 'move', move: m }); setMenu('cmd'); }} className="gba-text text-left font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: 'clamp(13px,2.4vh,19px)' }}>{moveCur === i ? '► ' : '\u00a0\u00a0 '}{r?.display || m}</button>
                  ); })}
                </div>
              )}
              {bs.phase === 'over' && (
                <button onClick={onFinish} className="gba-text text-right text-[16px] font-black animate-pulse">▼</button>
              )}
            </div>
          </div>
          {showCommands && menu === 'cmd' && (
            <div className="gba-box m-1 p-2 grid grid-cols-2 gap-x-4 content-center min-h-0 min-w-0 shrink-0" style={{ width: portrait ? 'auto' : '38%' }}>
              {cmds.map((c, i) => (
                <button key={c} onMouseEnter={() => setCur(i)} onClick={() => pickCmd(i)} className="gba-text text-left font-black py-0.5 whitespace-nowrap" style={{ fontSize: 'clamp(14px,2.6vh,20px)' }}>{cur === i ? '► ' : '\u00a0\u00a0 '}{c}</button>
              ))}
            </div>
          )}
          {showCommands && menu === 'fight' && (
            <div className="gba-box m-1 p-2 flex flex-col justify-center min-h-0 shrink-0" style={{ width: portrait ? 'auto' : '30%' }}>
              <div className="gba-text text-[16px] font-black">POWER/{sel?.power ?? '--'}</div>
              <div className="text-[16px] font-black mt-1" style={{ color: typeColors[sel?.type || ''] || '#383838' }}>TYPE/{(sel?.type || '---').toUpperCase()}</div>
              <div className="mt-2"><BackBtn onClick={() => setMenu('cmd')} /></div>
            </div>
          )}
          {showCommands && menu === 'bag' && (
            <div className="gba-box m-1 p-2 flex flex-col justify-center gap-1 min-h-0 overflow-hidden" style={{ width: portrait ? 'auto' : '38%' }}>
              <button onMouseEnter={() => setBagCur(0)} className="gba-text text-left font-black" style={{ fontSize: 'clamp(13px,2.2vh,18px)', opacity: bs.canCatch ? 1 : 0.45 }} onClick={() => { if (bs.canCatch) onAction({ type: 'catch' }); setMenu('cmd'); }}>{bagCur === 0 ? '► ' : '\u00a0\u00a0 '}LUIGI CUBE ×{cubes}</button>
              <button onMouseEnter={() => setBagCur(1)} className="gba-text text-left font-black" style={{ fontSize: 'clamp(13px,2.2vh,18px)' }} onClick={() => { onAction({ type: 'item', item: 'mend_patch' }); setMenu('cmd'); setBagCur(0); }}>{bagCur === 1 ? '► ' : '\u00a0\u00a0 '}MEND PATCH ×{patches}</button>
              <div className="flex items-center justify-between gap-2">
                <div className="gba-text opacity-70" style={{ fontSize: 'clamp(10px,1.6vh,12px)' }}>{bs.canCatch ? 'A: use' : "Can't catch a trainer's Mochiichao!"}</div>
                <BackBtn active={bagCur === 2} onClick={() => { setMenu('cmd'); setBagCur(0); }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Pokemon B2-style on-screen Back button (Esc / X / Backspace do the same). */
function BackBtn({ onClick, active }: { onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} aria-label="Back" className="font-black rounded-full px-3 py-1 shrink-0"
      style={{ fontSize: 'clamp(11px,1.8vh,14px)', color: '#fff', background: active ? '#d03c3c' : '#5a6478', border: '2px solid #fff', boxShadow: '0 2px 0 #0006' }}>
      ◄ BACK (X)
    </button>
  );
}
