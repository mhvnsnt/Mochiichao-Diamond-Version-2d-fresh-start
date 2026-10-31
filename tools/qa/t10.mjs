import {resume,st,walk,clearDialog,fight,talk,grass,heal} from './lib.mjs';
const {b,ctx,p}=await resume(process.argv[2]||'cp-grind.json');
const W=async(x,y)=>{await walk(p,x,y); await p.waitForTimeout(1300); await clearDialog(p);};
const lv=async()=>(await st(p)).party.map(s=>+s.split(':')[1]);
const hpr=async()=>{const s=(await st(p)).party[0].split(':')[2].split('/'); return s[0]/s[1];};
const toTown=async()=>{ for(let k=0;k<10 && (await st(p)).map==='route_1';k++){ if((await import('./lib.mjs')).eng && (await (await import('./lib.mjs')).eng(p)).battle) await fight(p,{run:true}); await walk(p,15,0,{onBattle:async p=>fight(p,{run:true})}); await p.waitForTimeout(1300); await clearDialog(p);}  };
const nurse=async()=>{ await W(24,6); console.log('heal',await heal(p,'healer_1')); await W(7,11); };
const ob=async p=>{ await fight(p,{}); };
for(let r=0;r<40;r++){
  const s=await st(p); console.log(r,s.map,s.party.join(' '));
  if(s.map==='route_1') await toTown();
  if((await st(p)).map==='mochiiplex_1'){ console.log('heal',await heal(p,'healer_1')); await W(7,11);} else if((await st(p)).map==='binary_fields') await nurse(); else { console.log('lost?',await st(p)); break; }
  const L=await lv(); if(L[0]>=12 && (L[1]??0)>=9) break;
  await W(15,34);
  if((await lv())[0]>=8) for(const id of ['trainer_lass','trainer_hiker']) console.log(id, await talk(p,id,{fight:{run:false}}), (await st(p)).party.join(' '));
  await grass(p,18,5,24,10,ob,async()=> (await hpr())<0.4 || (await st(p)).map!=='route_1');
}
console.log('end', await st(p)); await ctx.storageState({path:'cp-grind.json'}); await b.close();
