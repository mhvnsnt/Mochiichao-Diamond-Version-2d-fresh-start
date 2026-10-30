const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const fs = require('fs');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const FIXTURE = fs.readFileSync('/home/hatch/workspace/traversal-build/scratch/save-fixture.json', 'utf8');

async function seedAt(page, map, x, y) {
  await page.evaluate(({ m, x, y, raw }) => {
    const v = JSON.parse(raw);
    const slot = Array.isArray(v) ? v[0] : v;
    const d = slot.data;
    d.currentMap = m; d.playerPos = { x, y };
    d.techniqueFlags = { ...(d.techniqueFlags || {}), 'tech.mighty_push': true, 'tech.wave': true, 'tech.cascade': true, 'tech.deep_dive': true, 'tech.crag_climb': true };
    d.inventory = { ...(d.inventory || {}), bike: 1 };
    d.party = [{ id: 'drive2-performer', speciesId: '001', nickname: 'Mochii', level: 20, experience: 8000, hp: 90, maxHp: 90, stats: { atk: 50, def: 50, spa: 50, spd: 50, spe: 50 }, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, status: null, moves: ['Strength', 'Surf', 'Waterfall', 'Dive', 'Rock Climb', 'Tackle'], pp: [10, 10, 10, 10, 10, 10] }];
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
  }, { m: map, x, y, raw: FIXTURE });
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(3000);
  for (let i = 0; i < 14; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/SELECT A SAVE FILE/.test(t)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
  }
  const loadEl = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, div, span')].filter(e => /^(LOAD|START OVER)/.test((e.textContent || '').trim()));
    els.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }).catch(() => null);
  if (loadEl) await page.mouse.click(loadEl.x, loadEl.y);
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    if (!/start over in slot/i.test(document.body.innerText.replace(/\s+/g, ' '))) return;
    const btns = [...document.querySelectorAll('button, [role="button"], div, span')].filter(e => /load this save/i.test(e.textContent || '') && (e.textContent || '').trim().length < 40);
    if (btns.length) btns[0].click();
  }).catch(() => {});
  for (let i = 0; i < 30; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/MochiiMind|Team Menu/.test(t)) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(700);
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-diag3', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('console', m => { const t = m.text(); if (t.includes('T2DBG')) console.log('CONSOLE:', t.slice(0, 200)); });
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)));
  await page.goto('http://127.0.0.1:4417/', { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), FIXTURE);

  console.log('--- FALLS: seed (24,31), one Up press ---');
  await seedAt(page, 'route_1', 24, 31);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(900);

  console.log('--- CLIMB: seed (18,12), one Up press ---');
  await seedAt(page, 'route_1', 18, 12);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(900);

  console.log('--- BIKE: seed route_2 (13,17), one KeyC ---');
  await seedAt(page, 'route_2', 13, 17);
  await page.keyboard.press('KeyC');
  await page.waitForTimeout(900);

  await ctx.close();
  console.log('DIAG2 DONE');
})().catch(e => { console.error('DIAG2 FAIL', e); process.exit(1); });
