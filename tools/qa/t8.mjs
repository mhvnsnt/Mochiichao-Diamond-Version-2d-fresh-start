import {resume,st,walk,clearDialog,fight,talk,grass,heal} from './lib.mjs';
const D='shots'; 
const {b,ctx,p}=await resume('cp-town.json');
await walk(p,14,34); await p.waitForTimeout(1500); console.log((await st(p)).map);
for(const id of ['trainer_youngster','trainer_bugcatcher','trainer_lass']){ console.log(id, await talk(p,id,{shot:'dbg/talk-'+id+'.png',fight:{shots:{prefix:'dbg/'+id,max:40}}}), JSON.stringify(await st(p)), (await st(p)).party.join(' ')); }
let caught=false;
const ob=async p=>{ const s=await st(p); await fight(p,{catchIt:!caught && s.party.length<2}); caught=(await st(p)).party.length>1; console.log('wild',(await st(p)).party.join(' ')); };
await grass(p,18,5,24,10,ob,async()=>caught || (await st(p)).party[0].split(':')[2].split('/')[0]<8);
console.log('after grass', await st(p));
await ctx.storageState({path:'cp-r1.json'}); await b.close();
