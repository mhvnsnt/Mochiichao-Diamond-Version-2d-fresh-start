// Traversal proof drive, part 2 (traversal-build lane, 2026-10-30).
// Same method as part 1's drive.cjs: the REAL game (this lane's
// built dist, served on 4399) driven with real keyboard input in
// the live scene. The save comes from the env lane's persistent
// profile (the profile part 1 used), injected into this lane's
// own profile; each scene is seeded by editing the save's data
// (map + position + the traversal kit: technique flags held, the
// performer's move list, the bike in the bag, and the game's own
// noEncounters flag so no wild battle can interrupt a capture —
// recorded here so the frames are read honestly: these are
// traversal proofs, not encounter proofs).
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

async function probe(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return {};
    const v = JSON.parse(raw);
    const s = (Array.isArray(v) ? v[0] : v)?.data || {};
    return { map: s.currentMap, pos: s.playerPos };
  }).catch(() => ({}));
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
    d.hasStarter = true;
    d.noEncounters = true;
    d.techniqueFlags = {
      ...(d.techniqueFlags || {}),
      'tech.Mighty Push': true, 'tech.Wave': true, 'tech.Cascade': true,
      'tech.Deep Dive': true, 'tech.Crag Climb': true,
    };
    d.inventory = { ...(d.inventory || {}), bike: 1 };
    // The borrowed save's party is EMPTY (hasStarter is derived
    // from party length, and every technique gate needs a living
    // performer) — seed one complete instance in createMochii's
    // own shape, carrying the five source moves the gates read.
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
  const p = await probe(page);
  console.log('PROBE:', JSON.stringify(p));
  return p;
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

(async () => {
  // Borrow the save from the env lane's profile (part 1's method).
  const src = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const sp = src.pages()[0] || await src.newPage();
  await sp.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await sp.waitForTimeout(3000);
  const rawSave = await sp.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
  console.log('SAVE PRESENT (env profile):', !!rawSave);
  await src.close();
  if (!rawSave) { console.error('NO SAVE AVAILABLE'); process.exit(1); }

  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-2', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), rawSave);
  console.log('SAVE INJECTED');

  // ── (depth) Route 1: the built-up ledge band + climb face ─────
  await seedAt(page, 'route_1', 20, 8);
  await shot(page, 'p2-route-depth.png');
  // Climb: stand below the face at (18,12), climb to the plateau.
  await seedAt(page, 'route_1', 18, 12);
  await shot(page, 'p2-climb-bottom.png');
  await tap(page, 'ArrowUp');
  await page.waitForTimeout(900);
  console.log('CLIMB PROBE (expect route_1 18,10):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-climb-top.png');

  // ── (a1) Cave junction boulder: three pushes fill the hole ────
  await seedAt(page, 'cave_of_echoes', 18, 20);
  await shot(page, 'p2-boulder-before.png');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await tap(page, 'ArrowLeft');
  await page.waitForTimeout(600);
  console.log('BOULDER PROBE (expect cave_of_echoes 15,20):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-boulder-after.png');

  // ── (a2) Junkyard pen: lane boulder in, inner boulder on switch ─
  await seedAt(page, 'scrap_junkyard', 18, 16);
  await shot(page, 'p2-pen-lane.png');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');
  await tap(page, 'ArrowDown');       // third push: boulder falls into the mouth
  await tap(page, 'ArrowDown');       // onto the filled mouth
  await tap(page, 'ArrowDown');       // into the pen at (18,21)
  console.log('PEN PROBE (expect scrap_junkyard 18,21):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-pen-inside.png');
  await tap(page, 'ArrowLeft');       // (17,21)
  await tap(page, 'ArrowDown');       // (17,22), west of the inner boulder
  await tap(page, 'ArrowRight');      // PUSH: boulder onto the switch (19,22)
  await page.waitForTimeout(500);
  await shot(page, 'p2-pen-switch.png');
  await tap(page, 'ArrowUp');         // (17,21)
  await tap(page, 'ArrowRight');      // (18,21)
  await tap(page, 'ArrowRight');      // through the open gate (19,21)
  await tap(page, 'ArrowRight');      // into the nook (20,21)
  console.log('NOOK PROBE (expect scrap_junkyard 20,21):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-pen-nook.png');

  // ── (b) Bike: mount, ride, acro hop over the rail ─────────────
  await seedAt(page, 'route_2', 13, 17);
  await page.keyboard.press('KeyC');  // mount (Mach)
  await page.waitForTimeout(400);
  await page.keyboard.press('KeyC');  // Acro gear
  await page.waitForTimeout(400);
  await shot(page, 'p2-bike-mounted.png');
  await tap(page, 'ArrowUp');         // (13,16)
  await tap(page, 'ArrowUp');         // (13,15) — rail ahead at (13,14)
  await shot(page, 'p2-bike-hop-before.png');
  await tap(page, 'ArrowUp', 30);     // HOP over the rail
  await page.waitForTimeout(120);
  await shot(page, 'p2-bike-hop-mid.png');
  await page.waitForTimeout(900);
  console.log('HOP PROBE (expect route_2 13,13):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-bike-hop-after.png');

  // ── (d) Waterfall: ride the pond falls up to the sand ─────────
  await seedAt(page, 'route_1', 24, 33);
  await tap(page, 'ArrowUp');         // (24,32)
  await tap(page, 'ArrowUp');         // (24,31), falls face ahead
  await shot(page, 'p2-falls-before.png');
  await tap(page, 'ArrowUp', 30);     // Cascade ride up
  await page.waitForTimeout(150);
  await shot(page, 'p2-falls-ride.png');
  await page.waitForTimeout(900);
  console.log('FALLS PROBE (expect route_1 24,29):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-falls-after.png');

  // ── (e) Dive: Boot Bay spot down to the dive area, and back ───
  await seedAt(page, 'boot_bay', 15, 6);
  await tap(page, 'ArrowLeft');       // (14,6)
  await tap(page, 'ArrowLeft');       // (13,6)
  await tap(page, 'ArrowLeft');       // (12,6)
  await tap(page, 'ArrowLeft');       // (11,6)
  await tap(page, 'ArrowLeft');       // current lane (10,6) carries south to (10,13)
  await page.waitForTimeout(500);
  await tap(page, 'ArrowLeft');       // (9,13)
  await tap(page, 'ArrowLeft');       // (8,13)
  await tap(page, 'ArrowUp');         // (8,12)
  await tap(page, 'ArrowUp');         // (8,11)
  await tap(page, 'ArrowUp');         // (8,10)
  await tap(page, 'ArrowUp');         // (8,9) the dive spot
  console.log('SPOT PROBE (expect boot_bay 8,9):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-dive-spot.png');
  await page.keyboard.press('Enter'); // dive
  await page.waitForTimeout(1600);
  console.log('DIVE PROBE (expect boot_bay_deep 6,11):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-underwater.png');
  await tap(page, 'ArrowUp');         // (6,10) the bright column
  await page.keyboard.press('Enter'); // emerge
  await page.waitForTimeout(1600);
  console.log('EMERGE PROBE (expect boot_bay 8,9):', JSON.stringify(await probe(page)));
  await shot(page, 'p2-emerged.png');

  await ctx.close();
  console.log('DRIVE2 DONE');
})().catch(e => { console.error('DRIVE2 FAIL', e); process.exit(1); });
