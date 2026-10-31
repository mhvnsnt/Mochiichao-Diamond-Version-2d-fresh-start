import {resume,st,walk,clearDialog,fight,talk,heal} from './lib.mjs';
const {b,ctx,p}=await resume('cp-grind.json','final/video');
const W=async(x,y)=>{await walk(p,x,y); await p.waitForTimeout(1300); await clearDialog(p);};
const S=n=>p.screenshot({path:'final/'+n+'.png'});
console.log(await st(p));
if((await st(p)).map==='route_1') { await W(15,0); }
// QA BOOST (stands in for ~40 min of Route 1 grinding): raise lead to Lv12 with proportional stats
await p.evaluate(()=>{const s=window.__qa.store; const pt=s.getState().party.map((m,i)=>{ if(i) return m; const c=window.__qa.create(m.speciesId,14); return {...m,level:14,experience:2744,stats:c.stats,maxHp:c.maxHp,hp:c.maxHp,currentHp:c.maxHp,moves:c.moves,pp:c.pp??m.pp};}); s.setState({party:pt});});
console.log('boosted',await st(p)); await S('10-town');
const done=[];
for(let att=0;att<4 && !(await st(p)).badges.length;att++){ console.log('ATT',att,JSON.stringify(await st(p)));
if((await st(p)).map==='binary_fields') await W(24,6); await S('11-mochiiplex'); console.log('HEAL',await heal(p,'healer_1')); await S('12-nurse-heal'); for(let i=0;i<5&&(await st(p)).map==='mochiiplex_1';i++){ await clearDialog(p); await walk(p,7,10); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(1500);} for(let i=0;i<2;i++){await p.keyboard.press('ArrowDown'); await p.waitForTimeout(400);} await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400); console.log('out',JSON.stringify(await st(p)));
await W(14,9); for(let i=0;i<3&&(await st(p)).map!=='dojo_1';i++){await p.keyboard.press('ArrowUp'); await p.waitForTimeout(1500);} await clearDialog(p); await S('13-dojo1'); console.log('DOOR',JSON.stringify(await st(p)), (await p.innerText('body')).slice(0,200));
const ids=['dojo_acolyte_1','dojo_acolyte_2','dojo_acolyte_3','dojo_acolyte_4','master_lin'];
for(const id of ids.filter(i=>!done.includes(i))) {
    const r=await talk(p,id,{onBattle:async p=>{await fight(p,{}); await p.waitForTimeout(800); await clearDialog(p);},fight:{shots:{prefix:'final/14-'+id,max:4}}}); if((await st(p)).map==='dojo_1'&&r==='battle') done.push(id); else break; console.log(id,r,JSON.stringify(await st(p)));
  if((await st(p)).map!=='dojo_1') break;
}
}
await p.waitForTimeout(1500); await clearDialog(p); await S('20-after-lin'); console.log('END',await st(p));
await ctx.storageState({path:'cp-dojo.json'}); await ctx.close(); await b.close();
