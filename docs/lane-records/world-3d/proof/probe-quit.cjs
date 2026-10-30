const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
async function bodyText(page){ return page.evaluate(() => document.body.innerText.replace(/\s+/g,' ')).catch(()=> ''); }
(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE, viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(3500);
  for (let i=0;i<25;i++){ const t=await bodyText(page); if(/SLOT 1/.test(t)) break; await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
  await page.evaluate(() => { const els=[...document.querySelectorAll('div,button,span')].filter(e=>/SLOT 1/.test(e.textContent||'')); els.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return ra.width*ra.height-rb.width*rb.height;}); if(els.length){const r=els[0].getBoundingClientRect(); window.__xy={x:r.x+r.width/2,y:r.y+r.height/2};} });
  const xy = await page.evaluate(() => window.__xy); if (xy) await page.mouse.click(xy.x, xy.y);
  await page.waitForTimeout(1000);
  for (let i=0;i<10;i++){ const t=await bodyText(page); if(/Goal:/.test(t)) break; if(/start over in slot/i.test(t)){ await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,div,span')].filter(e=>/load this save/i.test(e.textContent||'')&&(e.textContent||'').trim().length<40); if(b.length) b[0].click(); }); await page.waitForTimeout(1500); continue; } await page.keyboard.press('Enter'); await page.waitForTimeout(800); }
  await page.waitForTimeout(2500);
  console.log('IN WORLD:', /Goal:/.test(await bodyText(page)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  let t = await bodyText(page);
  console.log('AFTER ESC:', /PAUSED/.test(t), t.slice(0,200));
  if (!/PAUSED/.test(t)) {
    // try clicking the HUD Menu label (title case, smallest element)
    const mp = await page.evaluate(() => { const els=[...document.querySelectorAll('div,button,span')].filter(e=>/^\s*menu\s*$/i.test(e.textContent||'')); els.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return ra.width*ra.height-rb.width*rb.height;}); if(!els.length) return null; const r=els[0].getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}; });
    console.log('menu el:', JSON.stringify(mp));
    if (mp) await page.mouse.click(mp.x, mp.y);
    await page.waitForTimeout(1500);
    t = await bodyText(page);
    console.log('AFTER CLICK:', /PAUSED/.test(t), t.slice(0,200));
  }
  await page.screenshot({ path: 'proof/pause-state.png', timeout: 90000 });
  // dump clickable elements with rects while paused
  const items = await page.evaluate(() => [...document.querySelectorAll('div,button,span')]
    .filter(e => /quit to title|back to game/i.test(e.textContent||'') && (e.textContent||'').trim().length < 30)
    .map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vis: r.width>0 }; }));
  console.log('QUIT/BACK ELEMENTS:', JSON.stringify(items));
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.log('FAILED', String(e).slice(0,200)); process.exit(1); });
