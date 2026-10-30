// Traversal proof drive (traversal-build lane, 2026-10-30).
// Drives the REAL game (the built dist of this lane's tree, served
// locally) with keyboard input in the live scene — no harness:
// teleport via the save (the method the bw2/env lanes' capture
// scripts use), load the slot through the real title flow, press
// real arrow keys, read the position back from the save the game
// itself writes, and screenshot the canvas.
// Captures: route before (BASE build, port 4398) / after (this
// build, 4399) at the same camera; a ledge jump on route_1; an ice
// slide in the Cave of Echoes ice room.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/traversal-build/proof';
const MINE = 'http://127.0.0.1:4399/';
const BASE = 'http://127.0.0.1:4398/';

async function clickLoad(page) {
  return page.evaluate(() => {
    if (!/start over in slot/i.test(document.body.innerText.replace(/\s+/g, ' '))) return 'no-dialog';
    const btns = [...document.querySelectorAll('button, [role="button"], div, span')]
      .filter(e => /load this save/i.test(e.textContent || '') && (e.textContent || '').trim().length < 40);
    if (!btns.length) return 'no-button';
    btns.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
    btns[0].click();
    return 'clicked';
  }).catch(() => 'eval-err');
}

async function probe(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return {};
    const v = JSON.parse(raw);
    const s = (Array.isArray(v) ? v[0] : v)?.data || {};
    return { map: s.currentMap, pos: s.playerPos };
  }).catch(() => ({}));
}

// Edit the save to (map,x,y), reload, and walk the real title flow
// into the world. Returns the in-world probe.
async function loadAt(page, map, x, y) {
  const set = await page.evaluate(({ m, x, y }) => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return 'no-save';
    const v = JSON.parse(raw);
    const slot = Array.isArray(v) ? v[0] : v;
    if (!slot || !slot.data) return 'bad-shape';
    slot.data.currentMap = m;
    slot.data.playerPos = { x, y };
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
    return 'set';
  }, { m: map, x, y }).catch(e => 'eval-err ' + String(e).slice(0, 80));
  console.log('SAVE-SET:', set, map, x, y);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(3500);
  for (let i = 0; i < 10; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/SLOT 1/.test(t)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
  }
  const slotEl = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div, button, span')].filter(e => /SLOT 1/.test(e.textContent || ''));
    els.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.width * ra.height - rb.width * rb.height; });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }).catch(() => null);
  if (slotEl) await page.mouse.click(slotEl.x, slotEl.y);
  await page.waitForTimeout(900);
  console.log('LOAD CLICK:', await clickLoad(page));
  await page.waitForTimeout(1200);
  let world = false;
  for (let i = 0; i < 40 && !world; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/Goal:/.test(t)) { world = true; break; }
    if (/start over in slot/i.test(t)) { console.log('LOAD CLICK (loop):', await clickLoad(page)); await page.waitForTimeout(1200); continue; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
  }
  console.log('IN WORLD:', world);
  await page.waitForTimeout(2000);
  const p = await probe(page);
  console.log('PROBE:', JSON.stringify(p));
  return p;
}

async function tap(page, key) {
  await page.keyboard.down(key);
  await page.waitForTimeout(60);
  await page.keyboard.up(key);
}

(async () => {
  // ── This lane's build ──────────────────────────────────────────
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const rawSave = await page.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
  console.log('SAVE PRESENT:', !!rawSave);

  // Route frame (after): stand in the east grass block, ledge row south.
  await loadAt(page, 'route_1', 20, 8);
  await page.screenshot({ path: `${OUT}/route-after.png`, timeout: 90000 });
  console.log('SHOT route-after');

  // Ledge jump: stand directly above the new ledge row at (20,10).
  await loadAt(page, 'route_1', 20, 10);
  await page.screenshot({ path: `${OUT}/ledge-before.png`, timeout: 90000 });
  console.log('SHOT ledge-before');
  await tap(page, 'ArrowDown');
  await page.waitForTimeout(130);
  await page.screenshot({ path: `${OUT}/ledge-hop.png`, timeout: 90000 });
  console.log('SHOT ledge-hop');
  await page.waitForTimeout(1500);
  console.log('LEDGE PROBE (expect route_1 20,12):', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/ledge-after.png`, timeout: 90000 });
  console.log('SHOT ledge-after');

  // Ice slide: west edge of the Cave of Echoes ice room, row 15.
  await loadAt(page, 'cave_of_echoes', 8, 15);
  await page.screenshot({ path: `${OUT}/ice-before.png`, timeout: 90000 });
  console.log('SHOT ice-before');
  await tap(page, 'ArrowRight');
  await page.waitForTimeout(1500);
  console.log('ICE PROBE (expect cave_of_echoes 12,15):', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/ice-after.png`, timeout: 90000 });
  console.log('SHOT ice-after');
  await ctx.close();

  // ── Base build (before frame, same camera) ─────────────────────
  const ctx2 = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-base', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page2 = ctx2.pages()[0] || await ctx2.newPage();
  page2.on('pageerror', e => console.log('PAGEERROR(base):', String(e).slice(0, 160)));
  await page2.goto(BASE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page2.waitForTimeout(3000);
  if (rawSave) {
    await page2.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), rawSave).catch(() => {});
    console.log('BASE SAVE INJECTED');
  }
  await loadAt(page2, 'route_1', 20, 8);
  await page2.screenshot({ path: `${OUT}/route-before.png`, timeout: 90000 });
  console.log('SHOT route-before');
  await ctx2.close();
  console.log('DRIVE DONE');
})().catch(e => { console.error('DRIVE FAIL', e); process.exit(1); });
