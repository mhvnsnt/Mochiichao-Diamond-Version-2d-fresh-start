import { chromium } from 'playwright';
const tag=process.argv[2];
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({storageState:'cp-grind.json',viewport:{width:960,height:640}});
const p=await ctx.newPage(); await p.goto('http://localhost:8765/?qa'); await p.waitForTimeout(2500);
for(let i=0;i<10 && !(await p.getByText('SLOT 1').count());i++){ const t=await p.innerText('body'); if(/CONTINUE/.test(t)){ await p.getByText(/^\W*CONTINUE\W*$/).first().click(); await p.waitForTimeout(1200); continue;} await p.keyboard.press('Enter'); await p.waitForTimeout(1200);}
await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(600); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(1500);
for(let i=0;i<16;i++){ await p.screenshot({path:`final/flick-${tag}-${String(i).padStart(2,'0')}.png`}); await p.waitForTimeout(150);} await b.close();
