import { chromium } from 'playwright';
export async function boot(url='http://localhost:8765/?qa', video=null, storage=null){
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ ...(storage?{storageState:storage}:{}), viewport:{width:960,height:640}, ...(video?{recordVideo:{dir:video,size:{width:960,height:640}}}:{}) });
  const p = await ctx.newPage(); p.on('pageerror', e=>console.log('ERR', e.message));
  await p.goto(url); await p.waitForTimeout(2500); return {b,ctx,p};
}
export const st = p => p.evaluate(()=>{const s=window.__qa.store.getState(); return {map:s.currentMap,pos:s.playerPos,view:s.currentView??s.view,party:(s.party||[]).map(m=>(m.name||m.nickname)+':'+m.level+':'+(m.currentHp??m.hp)+'/'+m.maxHp+':'+m.experience),badges:s.badges,money:s.wallet,inv:s.inventory?.luigi_cube}});
export async function newGame(p, name='Kai'){
  for(let r=0;r<8 && !(await p.getByText('SLOT 1').count());r++){await p.keyboard.press('Enter');await p.waitForTimeout(1200)}
  await p.keyboard.press('Enter'); await p.waitForTimeout(1200); if(await p.getByText('SLOT 1').count()) throw new Error('save-slot Enter did not work');
  for(let k=0;k<40;k++){ const t=await p.innerText('body');
    if(/WHAT IS YOUR NAME/.test(t)){ await p.keyboard.type(name); await p.waitForTimeout(300);}
    if(/RIVAL'S NAME/.test(t)){ await p.keyboard.press('Enter'); await p.waitForTimeout(800); continue;}
    if(/BOY OR A GIRL/.test(t)){ await p.getByText('BOY',{exact:true}).click(); await p.waitForTimeout(800); continue;}
    const s=await p.evaluate(()=>window.__qa?.store.getState().introCompleted);
    if(s) break;
    await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  }
  await p.waitForTimeout(1500);
}
const PASS={0:1,3:1,5:1,6:1,7:1,8:1,10:1,11:1,12:1,13:1,14:1,18:1,19:1,20:1,21:1,22:1,25:1};
export const eng = p => p.evaluate(()=>{const w=window.__qaw||{};return {battle:!!w.battleState, dialog:!!w.dialog}});
export async function clearDialog(p,max=30){ for(let i=0;i<max;i++){ const e=await eng(p); if(!e.dialog||e.battle) return e; await p.keyboard.press('Enter'); await p.waitForTimeout(350);} return eng(p); }
const KEY={'0,-1':'ArrowUp','0,1':'ArrowDown','-1,0':'ArrowLeft','1,0':'ArrowRight'};
async function plan(p,tx,ty,adjacent){
  const a=await plan0(p,tx,ty,adjacent,true); return a||plan0(p,tx,ty,adjacent,false);
}
async function plan0(p,tx,ty,adjacent,noGrass){
  return p.evaluate(([tx,ty,adjacent,PASS,noGrass])=>{
    const s=window.__qa.store.getState(); const m=window.__qa.world[s.currentMap]; const w=window.__qaw||{};
    const occ=new Set(); for(const n of (m.npcs||[])){const r=w.npcStates?.[n.id]; occ.add((r?r.x:n.x)+','+(r?r.y:n.y));}
    const ok=(x,y)=>{ if(x<0||y<0||y>=m.tiles.length||x>=m.tiles[0].length) return false; if(occ.has(x+','+y)) return false;
      const isGoal=(x===tx&&y===ty); const exit=(m.exits||[]).some(e=>e.x===x&&e.y===y)||(m.doors||[]).some(e=>e.x===x&&e.y===y);
      if(exit && !isGoal) return false; if(noGrass && m.tiles[y][x]===6 && !isGoal) return false; return isGoal&&exit ? true : !!PASS[m.tiles[y][x]]; };
    const st=[s.playerPos.x,s.playerPos.y]; const prev=new Map([[st.join(','),null]]); const q=[st];
    const goal=(x,y)=> adjacent? Math.abs(x-tx)+Math.abs(y-ty)===1 : (x===tx&&y===ty);
    while(q.length){const [x,y]=q.shift(); if(goal(x,y)){const path=[];let k=x+','+y;while(prev.get(k)){const [a,b]=prev.get(k);const [c,d]=k.split(',').map(Number);path.unshift([c-a,d-b]);k=a+','+b;} return path;}
      for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){const nx=x+dx,ny=y+dy,k=nx+','+ny; if(prev.has(k)||!ok(nx,ny))continue; prev.set(k,[x,y]); q.push([nx,ny]);}}
    return null;},[tx,ty,adjacent,PASS,noGrass]);
}
// walk to (tx,ty) in current map; returns 'ok' | 'battle' | 'map' | 'fail'
export async function walk(p,tx,ty,{adjacent=false,onBattle=null}={}){
  const map0=(await st(p)).map;
  for(let tries=0;tries<60;tries++){
    const s=await st(p); if(s.map!==map0) return 'map';
    const path=await plan(p,tx,ty,adjacent); if(!path) return 'fail'; if(!path.length) return 'ok';
    const [dx,dy]=path[0]; const before=s.pos;
    await p.keyboard.press(KEY[dx+','+dy]); await p.waitForTimeout(260);
    let e=await eng(p); if(process.env.DBG) console.log('step',JSON.stringify(s.pos),JSON.stringify(e),s.party.join(' '));
    if(e.battle){ if(onBattle){ await onBattle(p);} else return 'battle'; }
    if(e.dialog){ await clearDialog(p); e=await eng(p); if(e.battle){ if(onBattle) await onBattle(p); else return 'battle'; } }
    const a=await st(p); if(a.map!==map0) return 'map';
    if(a.pos.x===before.x&&a.pos.y===before.y){ await p.keyboard.press(KEY[dx+','+dy]); await p.waitForTimeout(260); }
  }
  return 'fail';
}
export async function face(p,dx,dy){ await p.keyboard.press(KEY[dx+','+dy]); await p.waitForTimeout(250); }
export const bstate = p => p.evaluate(()=>{const b=window.__qaw?.battleState; if(!b) return null; const e=b.type==='wild'?b.wild:b.trainerTeam[b.trainerTeamIdx]; return {phase:b.phase,type:b.type,e:e.name+':'+e.currentHp, ratio:e.currentHp/e.maxHp,pl:b.player.name+':'+b.player.currentHp,log:b.log.slice(-1)[0]}});
// fight with first move until over; catch=true throws cubes on wild when enemy hp low
export async function fight(p,{catchIt=false,shots=null,run=false}={}){
  await p.waitForTimeout(1900); let n=0;
  for(let i=0;i<80;i++){ const b=await bstate(p); if(!b) return 'done';
    if(shots && n<shots.max){ console.log(JSON.stringify(b)); await p.screenshot({path:`${shots.prefix}-${String(n).padStart(2,'0')}.png`}); n++; }
    if(b.phase==='over'){ await p.waitForTimeout(600); await p.keyboard.press('Enter'); await p.waitForTimeout(900); continue; }
    if(b.phase!=='menu'){ await p.waitForTimeout(500); continue; }
    if(catchIt && b.type==='wild' && b.ratio<0.6){ await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1500); continue; }
    if(run && b.type==='wild' && !catchIt){ await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); continue; }
    const mi=await p.evaluate(()=>{const b=window.__qaw.battleState; const ms=(b.player.moves||[]); let best=0,bp=-1; ms.forEach((m,i)=>{const r=window.__qa.resolve?.(m); const pw=r?.power||0; if(pw>bp){bp=pw;best=i}}); return best;});
    await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    if(mi&1) await p.keyboard.press('ArrowRight'); if(mi&2) await p.keyboard.press('ArrowDown');
    await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  }
  return 'timeout';
}
export async function toRoute(p, shot=null){
  const S=async n=>{ if(shot) await p.screenshot({path:`${shot}/${n}.png`}); };
  await newGame(p); await S('03-truck');
  await walk(p,6,9); await p.waitForTimeout(1000); await S('04-sector0-mom'); await clearDialog(p);
  await walk(p,10,3); await p.waitForTimeout(1500); await clearDialog(p); await S('05-lab');
  await walk(p,6,7); await face(p,0,-1);
  for(let i=0;i<4;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(500); if(i==1) await S('06-starter-yesno'); }
  await clearDialog(p);
  await walk(p,6,12); await p.waitForTimeout(800);
  for(let i=0;i<10;i++){ if((await eng(p)).battle) break; await p.keyboard.press('Enter'); await p.waitForTimeout(500);}
  await fight(p,{shots: shot?{prefix:`${shot}/07-hex`,max:6}:null}); await clearDialog(p); await p.waitForTimeout(1500); await clearDialog(p);
  for(let k=0;k<6;k++){ const s=await st(p); if(s.map!=='aeon_lab')break; await walk(p,6,13); await p.waitForTimeout(1500); await clearDialog(p);}
  await heal(p,'mom'); await S('08-mom-heal');
}
export async function heal(p,id){
  for(let t=0;t<8;t++){
    const pos=await p.evaluate(id=>{const w=window.__qaw; const s=window.__qa.store.getState(); const n=window.__qa.world[s.currentMap].npcs.find(n=>n.id===id); const r=w.npcStates?.[id]; return r?{x:r.x,y:r.y}:{x:n.x,y:n.y}},id);
    await walk(p,pos.x,pos.y,{adjacent:true});
    const me=(await st(p)).pos; const q=await p.evaluate(id=>{const r=window.__qaw.npcStates?.[id]; return r?{x:r.x,y:r.y}:null},id)||pos;
    const dx=q.x-me.x, dy=q.y-me.y; if(Math.abs(dx)+Math.abs(dy)!==1) continue;
    await face(p,dx,dy); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    const e=await eng(p); if(!e.dialog) continue; await clearDialog(p);
    const s=await p.evaluate(()=>window.__qa.store.getState().party.every(m=>(m.currentHp??m.hp)>=m.maxHp)); if(s) return true;
  }
  return false;
}
export async function resume(cp, video=null){
  const r=await boot(undefined, video, cp); const p=r.p;
  for(let i=0;i<10 && !(await p.getByText('SLOT 1').count());i++){
    const t=await p.innerText('body'); if(/CONTINUE/.test(t)){ console.log(t.slice(0,300)); await p.getByText(/^\W*CONTINUE\W*$/).first().click(); await p.waitForTimeout(1200); continue; }
    await p.keyboard.press('Enter'); await p.waitForTimeout(1200); }
  await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  return r;
}
export async function talk(p,id,opts={}){
  for(let t=0;t<8;t++){
    const pos=await p.evaluate(id=>{const w=window.__qaw; const s=window.__qa.store.getState(); const n=window.__qa.world[s.currentMap].npcs.find(n=>n.id===id); const r=w.npcStates?.[id]; return r?{x:r.x,y:r.y}:{x:n.x,y:n.y}},id);
    const wr=await walk(p,pos.x,pos.y,{adjacent:true,onBattle:opts.onBattle});
    const me=(await st(p)).pos; const q=await p.evaluate(id=>{const r=window.__qaw.npcStates?.[id]; return r?{x:r.x,y:r.y}:null},id)||pos;
    const dx=q.x-me.x, dy=q.y-me.y; if(Math.abs(dx)+Math.abs(dy)!==1) continue;
    await face(p,dx,dy); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
    if(opts.shot) await p.screenshot({path:opts.shot});
    const e=await clearDialog(p); if(e.battle){ await fight(p,opts.fight||{}); await p.waitForTimeout(800); await clearDialog(p); return 'battle'; }
    return 'talked';
  }
  return 'fail';
}
export async function grass(p,x0,y0,x1,y1,onBattle,until){
  for(let i=0;i<400;i++){ if(await until()) return true;
    const x=x0+Math.floor(Math.random()*(x1-x0+1)), y=y0+Math.floor(Math.random()*(y1-y0+1));
    await walk(p,x,y,{onBattle}); }
  return false;
}
