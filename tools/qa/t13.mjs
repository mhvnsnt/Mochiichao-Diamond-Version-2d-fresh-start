import { chromium } from 'playwright';
import {st,walk,eng,clearDialog} from './lib.mjs';
const [w,h,tag]=[+process.argv[2],+process.argv[3],process.argv[4]];
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({storageState:'cp-grind.json',viewport:{width:w,height:h},...(tag==='phone'?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
const p=await ctx.newPage(); await p.goto('http://localhost:8765/?qa'); await p.waitForTimeout(2500);
for(let i=0;i<10 && !(await p.getByText('SLOT 1').count());i++){ const t=await p.innerText('body'); if(/CONTINUE/.test(t)){ await p.getByText(/^\W*CONTINUE\W*$/).first().click(); await p.waitForTimeout(1200); continue;} await p.keyboard.press('Enter'); await p.waitForTimeout(1200);}
await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
await p.screenshot({path:`final/vp-${tag}-overworld.png`});
for(let i=0;i<60 && !(await eng(p)).battle;i++){ await walk(p,18+(i%7),5+(i%2)); }
await p.waitForTimeout(3500); await p.screenshot({path:`final/vp-${tag}-battle.png`}); await b.close();
