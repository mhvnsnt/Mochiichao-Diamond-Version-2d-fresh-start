// Traversal proof drive, part 2c (2026-10-30). One scene per
// invocation: node drive4.cjs <scene>. Fixes the earlier drives'
// two failure modes: (1) world detection now matches the HUD text
// this save actually shows ("MochiiMind") and STOPS pressing keys
// the moment the world is up — the old "Goal:" probe never matched,
// leaving ~28 s of stray Enter presses per scene while roamers
// engaged the player; (2) position evidence comes from the game's
// OWN save: after each scene's moves the drive presses F5 (the
// game's save key) and reads playerPos back out of localStorage.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/traversal-build/proof';
const MINE = 'http://127.0.0.1:4417/';
const SCENE = process.argv[2];

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

async function inWorld(page) {
  const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
  return /MochiiMind/.test(t);
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
      'tech.mighty_push': true, 'tech.wave': true, 'tech.cascade': true,
      'tech.deep_dive': true, 'tech.crag_climb': true,
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
  await page.waitForTimeout(3000);
  // This build's real flow (walked and logged 2026-10-30): a
  // 4-scene intro movie (any key steps it), the title, a CONTINUE
  // menu, then a save-select screen whose LOAD button is a CLICK,
  // not an Enter. Step with Enter until the save list shows.
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
  console.log('LOAD BUTTON:', loadEl ? 'found' : 'MISSING');
  if (loadEl) await page.mouse.click(loadEl.x, loadEl.y);
  await page.waitForTimeout(900);
  console.log('LOAD CLICK:', await clickLoad(page));
  let world = false;
  for (let i = 0; i < 30 && !world; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/MochiiMind|Team Menu/.test(t)) { world = true; break; }
    if (/start over in slot/i.test(t)) { await clickLoad(page); await page.waitForTimeout(1000); continue; }
    await page.waitForTimeout(500);
  }
  console.log('IN WORLD:', world);
  await page.waitForTimeout(700);
}

async function tap(page, key, holdMs = 60) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(300);
}
async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}`, timeout: 90000 });
  console.log('SHOT', name);
}
async function saveProbe(page, label) {
  await page.keyboard.press('F5');
  await page.waitForTimeout(700);
  const s = await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem('mochii_saves_1') || 'null');
    const slot = Array.isArray(v) ? v[0] : v;
    return slot && slot.data ? { map: slot.data.currentMap, pos: slot.data.playerPos } : null;
  }).catch(() => null);
  console.log('SAVEPROBE', label, JSON.stringify(s));
  // F5's save toast may linger; a confirm tap clears dialogs.
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

(async () => {
  // Save fixture (borrowed once by proof/borrow-save.cjs; the
  // per-scene live borrow proved flaky). Falls back to the borrow
  // if the fixture is missing.
  let rawSave = null;
  try { rawSave = require('fs').readFileSync('/home/hatch/workspace/traversal-build/scratch/save-fixture.json', 'utf8'); } catch {}
  if (!rawSave) {
    const src = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
    const sp = src.pages()[0] || await src.newPage();
    await sp.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await sp.waitForTimeout(2500);
    rawSave = await sp.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
    await src.close();
  }
  if (!rawSave) { console.error('NO SAVE AVAILABLE'); process.exit(1); }

  // BUILD IDENTITY: the port war of 2026-10-30 (another lane's
  // server held 4399) means no scene runs unless the served app
  // is THIS tree's current dist.
  {
    const served = await (await fetch(MINE)).text();
    const distHtml = require('fs').readFileSync('/home/hatch/workspace/traversal-build/tree/dist/index.html', 'utf8');
    const chunkOf = (h) => (h.match(/assets\/index-[A-Za-z0-9_-]+\.js/) || [null])[0];
    console.log('BUILD IDENTITY: served', chunkOf(served), '| dist', chunkOf(distHtml));
    if (!chunkOf(served) || chunkOf(served) !== chunkOf(distHtml)) { console.error('WRONG BUILD SERVED — ABORT'); process.exit(2); }
  }
  const ctx = await chromium.launchPersistentContext(`/home/hatch/workspace/traversal-build/pw-profile-d7-${SCENE}`, { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(MINE, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), rawSave);

  if (SCENE === 'slopefull') {
    await seedAt(page, 'route_2', 13, 12);
    await page.keyboard.press('KeyC');  // Mach
    await page.waitForTimeout(400);
    await tap(page, 'ArrowUp');
    await tap(page, 'ArrowUp');
    await tap(page, 'ArrowUp');
    await shot(page, 'p2-slope-before.png');
    await tap(page, 'ArrowUp');         // onto the slope at full charge
    await shot(page, 'p2-slope-after.png');
    await saveProbe(page, 'slope full (expect route_2 13,8)');
  } else if (SCENE === 'slopelow') {
    await seedAt(page, 'route_2', 13, 9);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(400);
    await tap(page, 'ArrowUp');         // slope refuses at charge 0
    await saveProbe(page, 'slope low (expect route_2 13,9)');
  } else if (SCENE === 'crackedfull') {
    await seedAt(page, 'route_2', 13, 28);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(400);
    await tap(page, 'ArrowUp');
    await tap(page, 'ArrowUp');
    await tap(page, 'ArrowUp');
    await tap(page, 'ArrowUp');         // cracked tile crossed at full charge
    await shot(page, 'p2-cracked-full.png');
    await saveProbe(page, 'cracked full (expect route_2 13,24)');
  } else if (SCENE === 'crackedlow') {
    await seedAt(page, 'route_2', 13, 25);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(400);
    await tap(page, 'ArrowUp');         // onto the cracked tile (cracks it)
    await tap(page, 'ArrowDown');       // step off
    await tap(page, 'ArrowUp');         // re-enter: it breaks -> drop
    await page.waitForTimeout(600);
    await shot(page, 'p2-cracked-low.png');
    await saveProbe(page, 'cracked low (expect route_2 14,38)');
  } else if (SCENE === 'conveyor') {
    await seedAt(page, 'dojo_1', 7, 15);
    await shot(page, 'p2-conveyor-before.png');
    await tap(page, 'ArrowUp');         // onto the conveyor; chain carries north
    await page.waitForTimeout(500);
    await shot(page, 'p2-conveyor-after.png');
    await saveProbe(page, 'conveyor (expect dojo_1 7,13)');
  } else {
    console.error('unknown scene', SCENE);
  }
  await ctx.close();
  console.log('DRIVE4 DONE', SCENE);
})().catch(e => { console.error('DRIVE4 FAIL', SCENE, e); process.exit(1); });
