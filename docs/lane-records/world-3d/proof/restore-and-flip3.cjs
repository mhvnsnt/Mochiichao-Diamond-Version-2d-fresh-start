// Final captures + save restore (2026-10-30): (1) fresh flip-3 frame
// (GEN5 world at spawn — the flip4 return leg's screenshot died on a
// font-load timeout after IN WORLD + persisted GEN5 were logged);
// (2) restore the shared profile save to the traversal lane's
// original position: currentMap route_1, playerPos {x:20,y:8}.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
async function bodyText(page){ return page.evaluate(() => document.body.innerText.replace(/\s+/g,' ')).catch(()=> ''); }
(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE, viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem('mochii_saves_1'));
    const slot = Array.isArray(v) ? v[0] : v;
    const s = JSON.parse(localStorage.getItem('mochiichao_settings_v1') || '{}');
    return { map: slot.data.currentMap, pos: slot.data.playerPos, style: s.visualStyle };
  });
  console.log('STATE BEFORE:', JSON.stringify(before));
  // slot flow into the world (save is at sector0 15,18, style GEN5)
  for (let i=0;i<25;i++){ const t=await bodyText(page); if(/SLOT 1/.test(t)) break; await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
  await page.evaluate(() => { const els=[...document.querySelectorAll('div,button,span')].filter(e=>/SLOT 1/.test(e.textContent||'')); els.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return ra.width*ra.height-rb.width*rb.height;}); if(els.length) els[0].click(); });
  await page.waitForTimeout(1000);
  for (let i=0;i<10;i++){ const t=await bodyText(page); if(/Goal:/.test(t)) break; if(/start over in slot/i.test(t)){ await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,div,span')].filter(e=>/load this save/i.test(e.textContent||'')&&(e.textContent||'').trim().length<40); if(b.length) b[0].click(); }); await page.waitForTimeout(1500); continue; } await page.keyboard.press('Enter'); await page.waitForTimeout(800); }
  await page.waitForTimeout(3000);
  console.log('IN WORLD:', /Goal:/.test(await bodyText(page)));
  await page.screenshot({ path: `${OUT}/flip-3-gen5-3d.png`, timeout: 90000 });
  console.log('SHOT flip-3');
  // restore the save position for the traversal lane
  await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem('mochii_saves_1'));
    const slot = Array.isArray(v) ? v[0] : v;
    slot.data.currentMap = 'route_1';
    slot.data.playerPos = { x: 20, y: 8 };
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
  });
  const after = await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem('mochii_saves_1'));
    const slot = Array.isArray(v) ? v[0] : v;
    return { map: slot.data.currentMap, pos: slot.data.playerPos };
  });
  console.log('RESTORED SAVE:', JSON.stringify(after));
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.log('FAILED', String(e).slice(0,200)); process.exit(1); });
