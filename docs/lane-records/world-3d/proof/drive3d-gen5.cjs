// GEN5-only proof drive (2026-10-30, second attempt): single load
// flow (the two-load run's second flow marched into a new game).
// More patient title flow; bails out if new-game text appears.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
const URL = 'http://127.0.0.1:4399/';

async function probe(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return {};
    const v = JSON.parse(raw);
    const s = (Array.isArray(v) ? v[0] : v)?.data || {};
    return { map: s.currentMap, pos: s.playerPos, name: s.playerName, hasParty: !!(s.party && s.party.length) };
  }).catch(() => ({}));
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE,
    viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)));
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(4000);
  console.log('SAVE BEFORE:', JSON.stringify(await probe(page)));

  // Set GEN5 + teleport the save to Boot Harbor spawn.
  await page.evaluate(() => {
    const raw = localStorage.getItem('mochiichao_settings_v1');
    const s = raw ? JSON.parse(raw) : {};
    s.visualStyle = 'GEN5';
    localStorage.setItem('mochiichao_settings_v1', JSON.stringify(s));
    const rawSave = localStorage.getItem('mochii_saves_1');
    const v = JSON.parse(rawSave);
    const slot = Array.isArray(v) ? v[0] : v;
    slot.data.currentMap = 'sector0';
    slot.data.playerPos = { x: 15, y: 18 };
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
  });
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(4000);

  // Patient title flow: wait for SLOT 1 before pressing anything.
  let slotSeen = false;
  for (let i = 0; i < 25 && !slotSeen; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/SLOT 1/.test(t)) { slotSeen = true; break; }
    if (/ARE YOU A BOY/i.test(t)) { console.log('ABORT: new-game flow detected'); await ctx.close(); return; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
  console.log('SLOT SEEN:', slotSeen);
  const slotEl = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div, button, span')].filter(e => /SLOT 1/.test(e.textContent || ''));
    els.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.width * ra.height - rb.width * rb.height; });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }).catch(() => null);
  if (slotEl) await page.mouse.click(slotEl.x, slotEl.y);
  await page.waitForTimeout(1000);
  // Handle the load-confirm dialog if it appears.
  for (let i = 0; i < 6; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/Goal:/.test(t)) break;
    if (/start over in slot/i.test(t)) {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button, [role="button"], div, span')]
          .filter(e => /load this save/i.test(e.textContent || '') && (e.textContent || '').trim().length < 40);
        btns.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        if (btns.length) btns[0].click();
      });
      await page.waitForTimeout(1500);
      continue;
    }
    if (/ARE YOU A BOY/i.test(t)) { console.log('ABORT: new-game flow detected (2)'); await ctx.close(); return; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(3000);
  console.log('PROBE IN WORLD:', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/boot-harbor-after-3d.png`, timeout: 90000 });
  console.log('SHOT after-3d');

  // Walk west 3 steps on the path row (grid movement proof).
  for (let k = 0; k < 3; k++) {
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(90);
    await page.keyboard.up('ArrowLeft');
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  console.log('WALK PROBE (expect 12,18):', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-walked.png`, timeout: 90000 });
  console.log('SHOT walked');

  // Dismiss any event dialog the walk triggered, then walk north.
  for (let k = 0; k < 6; k++) { await page.keyboard.press('Enter'); await page.waitForTimeout(600); }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-dialog.png`, timeout: 90000 });
  console.log('SHOT dialog-dismissed');
  for (let k = 0; k < 2; k++) {
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(90);
    await page.keyboard.up('ArrowUp');
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1000);
  console.log('NORTH PROBE:', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-town.png`, timeout: 90000 });
  console.log('SHOT town');
  await ctx.close();
  console.log('DRIVE DONE');
})().catch(e => { console.log('DRIVE FAILED:', String(e).slice(0, 300)); process.exit(1); });
