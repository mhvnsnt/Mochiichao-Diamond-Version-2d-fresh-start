// 3D world lane proof drive (2026-10-30). Drives the REAL game (this
// lane's built dist, served locally) through the real title flow into
// Boot Harbor (sector0), captures the SAME camera position under the
// GEN4 (layered 2D) and GEN5 (model3d) style profiles, then walks on
// the grid under GEN5 and reads the position back from the game's own
// save. Method mirrors the traversal lane's proof drive.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
const URL = 'http://127.0.0.1:4399/';

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

async function setStyle(page, style) {
  return page.evaluate((style) => {
    const raw = localStorage.getItem('mochiichao_settings_v1');
    const s = raw ? JSON.parse(raw) : {};
    s.visualStyle = style;
    localStorage.setItem('mochiichao_settings_v1', JSON.stringify(s));
    return s.visualStyle;
  }, style).catch(() => 'eval-err');
}

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
  await page.waitForTimeout(2500);
  const p = await probe(page);
  console.log('PROBE:', JSON.stringify(p));
  return p;
}

async function tap(page, key, holdMs = 90) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(450);
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE,
    viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE-ERR:', m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  console.log('WEBGL2:', await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2')).catch(() => 'eval-err'));
  console.log('SAVE PRESENT:', !!(await page.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null)));

  // ── BEFORE: GEN4 layered 2D at Boot Harbor spawn (15,18) ──
  console.log('STYLE SET ->', await setStyle(page, 'GEN4'));
  await loadAt(page, 'sector0', 15, 18);
  await page.screenshot({ path: `${OUT}/boot-harbor-before-2d.png`, timeout: 90000 });
  console.log('SHOT before-2d');

  // ── AFTER: GEN5 model3d, same tile, same camera target ──
  console.log('STYLE SET ->', await setStyle(page, 'GEN5'));
  await loadAt(page, 'sector0', 15, 18);
  await page.screenshot({ path: `${OUT}/boot-harbor-after-3d.png`, timeout: 90000 });
  console.log('SHOT after-3d');

  // ── Grid movement on the 3D presentation: walk west along the path ──
  await tap(page, 'ArrowLeft');
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-walk1.png`, timeout: 90000 });
  console.log('SHOT walk1');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await page.waitForTimeout(1200);
  console.log('WALK PROBE (expect sector0 12,18):', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-walked.png`, timeout: 90000 });
  console.log('SHOT walked');

  // ── Face north toward the town: buildings in frame ──
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await page.waitForTimeout(1000);
  console.log('NORTH PROBE:', JSON.stringify(await probe(page)));
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-town.png`, timeout: 90000 });
  console.log('SHOT town');

  await ctx.close();
  console.log('DRIVE DONE');
})().catch(e => { console.log('DRIVE FAILED:', String(e).slice(0, 300)); process.exit(1); });
