// Traversal proof drive, part 2b (2026-10-30). Continues drive2
// after its browser context closed mid-run, with two changes:
// a fresh profile dir, and a DIAGNOSTIC scene first — one boulder
// press in the Cave of Echoes with the page's full text dumped, so
// any gate refusal reads in full instead of as a truncated bar.
// Scenes are seeded on non-grass tiles wherever a still frame is
// wanted (wild battles kept interrupting grass frames in drive2;
// the encounter roll itself is another lane's system — the
// noEncounters save flag is not restored by loadState, noted for
// the record).
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/traversal-build/proof';
const MINE = 'http://127.0.0.1:4399/';

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

async function seedAt(page, map, x, y) {
  const set = await page.evaluate(({ m, x, y }) => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return 'no-save';
    const v = JSON.parse(raw);
    const slot = Array.isArray(v) ? v[0] : v;
    if (!slot || !slot.data) return 'bad-shape';
    const d = slot.data;
    d.currentMap = m;
    d.playerPos = { x, y };
    d.techniqueFlags = {
      ...(d.techniqueFlags || {}),
      'tech.Mighty Push': true, 'tech.Wave': true, 'tech.Cascade': true,
      'tech.Deep Dive': true, 'tech.Crag Climb': true,
    };
    d.inventory = { ...(d.inventory || {}), bike: 1 };
    d.party = [{
      id: 'drive2-performer', speciesId: '001', nickname: 'Mochii',
      level: 20, experience: 8000, hp: 90, maxHp: 90,
      stats: { atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
      stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 },
      status: null,
      moves: ['Strength', 'Surf', 'Waterfall', 'Dive', 'Rock Climb', 'Tackle'],
      pp: [10, 10, 10, 10, 10, 10],
    }];
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
  await page.waitForTimeout(1800);
  return world;
}

async function tap(page, key, holdMs = 60) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(320);
}
async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}`, timeout: 90000 });
  console.log('SHOT', name);
}
async function pageText(page) {
  const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
  console.log('PAGE TEXT:', t.slice(0, 400));
}

(async () => {
  const src = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const sp = src.pages()[0] || await src.newPage();
  await sp.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await sp.waitForTimeout(3000);
  const rawSave = await sp.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
  console.log('SAVE PRESENT (env profile):', !!rawSave);
  await src.close();
  if (!rawSave) { console.error('NO SAVE AVAILABLE'); process.exit(1); }

  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-3', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), rawSave);
  console.log('SAVE INJECTED');

  // ── DIAGNOSTIC + (a1) cave boulder ────────────────────────────
  await seedAt(page, 'cave_of_echoes', 18, 20);
  await shot(page, 'p2-boulder-before.png');
  await tap(page, 'ArrowLeft');
  await pageText(page);
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await page.waitForTimeout(500);
  await shot(page, 'p2-boulder-after.png');
  await pageText(page);

  // ── (depth) route_1 ledge band from plain grass ───────────────
  await seedAt(page, 'route_1', 20, 13);
  await shot(page, 'p2-route-depth.png');
  // ── (c) climb retake with a tight post-press frame ────────────
  await seedAt(page, 'route_1', 18, 12);
  await shot(page, 'p2-climb-bottom.png');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(60);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(200);
  await shot(page, 'p2-climb-top.png');
  await pageText(page);

  // ── (a2) junkyard pen ─────────────────────────────────────────
  await seedAt(page, 'scrap_junkyard', 18, 16);
  await shot(page, 'p2-pen-lane.png');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');
  await shot(page, 'p2-pen-inside.png');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowRight');      // push inner boulder onto the switch
  await page.waitForTimeout(500);
  await shot(page, 'p2-pen-switch.png');
  await pageText(page);
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowRight');
  await tap(page, 'ArrowRight');      // through the open gate
  await tap(page, 'ArrowRight');      // the nook
  await page.waitForTimeout(400);
  await shot(page, 'p2-pen-nook.png');
  await pageText(page);

  // ── (b) bike + hop ────────────────────────────────────────────
  await seedAt(page, 'route_2', 13, 17);
  await page.keyboard.press('KeyC');
  await page.waitForTimeout(400);
  await page.keyboard.press('KeyC');  // Acro
  await page.waitForTimeout(400);
  await shot(page, 'p2-bike-mounted.png');
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await shot(page, 'p2-bike-hop-before.png');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(40);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(130);
  await shot(page, 'p2-bike-hop-mid.png');
  await page.waitForTimeout(900);
  await shot(page, 'p2-bike-hop-after.png');
  await pageText(page);

  // ── (d) waterfall ride ────────────────────────────────────────
  await seedAt(page, 'route_1', 24, 33);
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await shot(page, 'p2-falls-before.png');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(40);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(160);
  await shot(page, 'p2-falls-ride.png');
  await page.waitForTimeout(900);
  await shot(page, 'p2-falls-after.png');
  await pageText(page);

  // ── (e) dive round trip ───────────────────────────────────────
  await seedAt(page, 'boot_bay', 15, 6);
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');       // current lane carries to (10,13)
  await page.waitForTimeout(500);
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');
  await tap(page, 'ArrowUp');         // (8,9) the dive spot
  await shot(page, 'p2-dive-spot.png');
  await pageText(page);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1600);
  await shot(page, 'p2-underwater.png');
  await pageText(page);
  await tap(page, 'ArrowUp');         // (6,10) the bright column
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1600);
  await shot(page, 'p2-emerged.png');
  await pageText(page);

  await ctx.close();
  console.log('DRIVE3 DONE');
})().catch(e => { console.error('DRIVE3 FAIL', e); process.exit(1); });
