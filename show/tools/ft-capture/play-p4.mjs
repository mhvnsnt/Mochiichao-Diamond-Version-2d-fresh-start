// Mochiichao first-town slice — verified-step playthrough (persistent
// profile). Every move is confirmed against the F5-quicksave position
// oracle before the next step; eaten inputs are re-pressed. Facing rule:
// arrive beside a target moving TOWARD it, then Enter.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';
const require = createRequire(import.meta.url);
const { FULL_WORLD } = require('/tmp/fullworld.cjs');

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/p4';
fs.mkdirSync(SHOTS, { recursive: true });
const BASE = 'http://127.0.0.1:4173/';
const log = [];
const note = (m) => { log.push(m); console.log(m); };
const errors = [];

const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/_mochi-ft-shots/profile', {
  executablePath: '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio'],
  viewport: { width: 1280, height: 800 },
});
const page = ctx.pages()[0] || (await ctx.newPage());
page.on('pageerror', (e) => { errors.push('PAGEERROR: ' + e.message); note('PAGEERROR: ' + e.message.slice(0, 160)); });
page.on('response', (r) => { if (r.status() >= 400 && !/transparenttextures/.test(r.url())) note('HTTP' + r.status() + ': ' + r.url().slice(-80)); });

const cdp = await page.context().newCDPSession(page);
let n = 0;
async function shot(name) {
  n++;
  const f = `${SHOTS}/${String(n).padStart(2, '0')}-${name}.png`;
  try {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
  } catch (e) { note('shot failed ' + name); }
  note('SHOT ' + name);
}
const bodyText = async () => (await page.evaluate(() => document.body.innerText || '')).replace(/\s+/g, ' ');
const press = async (k, w = 420) => { await page.keyboard.press(k); await page.waitForTimeout(w); };
async function clickText(txt) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role="button"], a, div, span')]
      .filter((e) => (e.textContent || '').toUpperCase().includes(t.toUpperCase()))
      .map((e) => { const r = e.getBoundingClientRect(); return { e, a: r.width * r.height }; })
      .filter((x) => x.a > 0).sort((p, q) => p.a - q.a);
    if (els.length) { els[0].e.click(); return true; }
    return false;
  }, txt).catch(() => false);
}

let lastPos = null;
async function probe() {
  await page.keyboard.press('F5').catch(() => {});
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    let best = null;
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith('mochii_saves_')) continue;
      try {
        const arr = JSON.parse(localStorage.getItem(k));
        const latest = arr[arr.length - 1];
        if (!best || latest.timestamp > best.timestamp) best = latest;
      } catch (e) { /* next */ }
    }
    if (!best) return null;
    const d = best.data || {};
    return { map: d.currentMap, x: d.playerPos?.x, y: d.playerPos?.y, party: (d.party || []).map((p) => p.speciesId || p.id), timestamp: best.timestamp };
  }).catch(() => null);
  if (info) lastPos = info;
  return info;
}
const inBattle = async () => {
  const t = await bodyText();
  return !/Goal:/i.test(t) && /RUN/i.test(t) && /Lv/i.test(t);
};
const dialogueOpen = async () => {
  const t = await bodyText();
  return !/Goal:/i.test(t) && /▼/.test(t);
};
async function advance(tries = 14) {
  for (let i = 0; i < tries; i++) {
    if (!(await dialogueOpen()) && /Goal:/i.test(await bodyText())) break;
    await press('Enter', 500);
    if (i % 3 === 2) await page.mouse.click(640, 690);
  }
}
async function battleLoop(tag, maxRounds = 46) {
  note('battleLoop: ' + tag);
  for (let r = 0; r < maxRounds; r++) {
    const t = await bodyText();
    if (/Goal:/i.test(t)) { note('battle over — world HUD back'); return true; }
    const clicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && b.textContent.trim().length > 1);
      const bad = /^(RUN|BAG|PARTY|TEAM|MENU|MOCHIIMIND|BACK|SETTINGS|CONTINUE|NEW GAME)$/i;
      const mv = btns.find((b) => !bad.test(b.textContent.trim()) && b.getBoundingClientRect().top > 340);
      if (mv) { mv.click(); return mv.textContent.trim().slice(0, 40); }
      return null;
    });
    if (clicked) note('move: ' + clicked);
    await page.waitForTimeout(1400);
    if (r % 4 === 3) await press('Enter', 420);
  }
  note('battleLoop maxRounds');
  return false;
}

// ---------- BFS ----------
const SOLID = new Set([1, 2, 4]);
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
function mapStatics(mapId) {
  const m = FULL_WORLD[mapId];
  const warp = new Set();
  for (const d of m.doors || []) warp.add(d.x + ',' + d.y);
  for (const e of m.exits || []) warp.add(e.x + ',' + e.y);
  const npcHome = new Set((m.npcs || []).map((p) => p.x + ',' + p.y));
  return { m, warp, npcHome };
}
function bfs(mapId, sx, sy, tx, ty, dynBlocked, allowWarpTarget) {
  const { m, warp, npcHome } = mapStatics(mapId);
  const blocked = (x, y) => {
    if (x < 0 || y < 0 || x >= m.width || y >= m.height) return true;
    if (SOLID.has(m.tiles[y][x])) return true;
    const k = x + ',' + y;
    if (dynBlocked.has(k)) return true;
    if (npcHome.has(k) && !(x === tx && y === ty)) return true;
    if (warp.has(k) && !(allowWarpTarget && x === tx && y === ty)) return true;
    return false;
  };
  if (blocked(tx, ty) && !(tx === sx && ty === sy)) return null;
  const q = [[sx, sy]];
  const prev = new Map([[sx + ',' + sy, null]]);
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (const [key, [dx, dy]] of Object.entries(DIRS)) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (prev.has(k) || blocked(nx, ny)) continue;
      prev.set(k, { from: x + ',' + y, dir: key });
      q.push([nx, ny]);
    }
  }
  const tk = tx + ',' + ty;
  if (!prev.has(tk)) return null;
  const path = [];
  let cur = tk;
  while (cur && cur !== sx + ',' + sy) { const p = prev.get(cur); path.unshift(p.dir); cur = p.from; }
  return path;
}

// One verified step. Returns: moved | warp | blocked | battle | dialogue
async function stepVerified(dir) {
  const [dx, dy] = DIRS[dir];
  for (let p = 0; p < 4; p++) {
    const before = lastPos;
    if (!before) { await probe(); return stepVerified(dir); }
    await page.keyboard.press(dir);
    const deadline = Date.now() + 7000;
    while (Date.now() < deadline) {
      await page.waitForTimeout(600);
      const st = await probe();
      if (!st) continue;
      if (st.map !== before.map) return 'warp';
      if (st.x === before.x + dx && st.y === before.y + dy) return 'moved';
      if (st.x !== before.x || st.y !== before.y) return 'moved';
      if (await inBattle()) return 'battle';
      if (await dialogueOpen()) return 'dialogue';
    }
    note('stepVerified: re-press ' + dir);
  }
  return 'blocked';
}

async function goTo(tx, ty, opts = {}) {
  const dyn = new Set(opts.extraBlocked || []);
  for (let attempt = 0; attempt < 110; attempt++) {
    const st = await probe();
    if (!st) { note('goTo: no probe'); return null; }
    if (st.x === tx && st.y === ty) { note(`goTo arrived ${st.map} (${tx},${ty}) party=${JSON.stringify(st.party)}`); return st; }
    if (await inBattle()) { await shot('battle-interrupt'); await battleLoop('interrupt'); continue; }
    if (await dialogueOpen()) { await advance(10); continue; }
    const path = bfs(st.map, st.x, st.y, tx, ty, dyn, opts.allowWarpTarget);
    if (!path || !path.length) { note(`goTo: no path ${st.map} (${st.x},${st.y}) -> (${tx},${ty})`); return st; }
    const dir = path[0];
    const [dx, dy] = DIRS[dir];
    const r = await stepVerified(dir);
    if (r === 'blocked') { dyn.add((st.x + dx) + ',' + (st.y + dy)); note('goTo: dyn-block ' + (st.x + dx) + ',' + (st.y + dy)); }
    if (r === 'battle') { await shot('battle-midpath'); await battleLoop('midpath'); }
    if (r === 'dialogue') { await advance(10); }
    if (r === 'warp') { note('goTo: warped mid-path'); return probe(); }
  }
  note('goTo: attempts exhausted -> ' + tx + ',' + ty);
  return probe();
}
async function stepOnto(tx, ty) {
  const st = await goTo(tx, ty, { allowWarpTarget: true });
  await page.waitForTimeout(800);
  const st2 = await probe();
  note(`stepOnto (${tx},${ty}) -> ${JSON.stringify(st2)}`);
  return st2;
}
async function faceInteract(tx, ty, label) {
  const st0 = await probe();
  const { m } = mapStatics(st0.map);
  const sides = [
    { ax: tx, ay: ty + 1, dir: 'ArrowUp' },
    { ax: tx, ay: ty - 1, dir: 'ArrowDown' },
    { ax: tx + 1, ay: ty, dir: 'ArrowLeft' },
    { ax: tx - 1, ay: ty, dir: 'ArrowRight' },
  ];
  for (const s of sides) {
    if (s.ax < 0 || s.ay < 0 || s.ax >= m.width || s.ay >= m.height) continue;
    if (SOLID.has(m.tiles[s.ay][s.ax])) continue;
    const [dx, dy] = DIRS[s.dir];
    const px = s.ax - dx, py = s.ay - dy;
    const stp = await goTo(px, py);
    if (!stp || stp.map !== st0.map) continue;
    const r = await stepVerified(s.dir); // step into side tile, facing target (or blocked = turned)
    note(`faceInteract ${label}: step=${r} at ${lastPos?.x},${lastPos?.y} facing ${s.dir} toward (${tx},${ty})`);
    await press('Enter', 800);
    await page.waitForTimeout(600);
    const t = await bodyText();
    note(`faceInteract ${label} text: ` + t.slice(0, 200));
    return lastPos;
  }
  note('faceInteract: no side worked for ' + label);
  return null;
}
// Choice dialogue: advance pages until YES renders, then click it.
async function chooseYes() {
  for (let i = 0; i < 10; i++) {
    const has = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.offsetParent !== null && b.textContent.trim().toUpperCase() === 'YES'));
    if (has) { await clickText('YES'); note('choice: clicked YES'); return true; }
    await press('Enter', 600);
  }
  note('choice: YES never appeared');
  return false;
}

try {
  // ===== CONTINUE =====
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100);
  if (await clickText('CONTINUE')) note('clicked CONTINUE');
  await page.waitForTimeout(900);
  await shot('slots-continue');
  note('SLOTS: ' + (await bodyText()).slice(0, 180));
  await clickText('ACE');
  await page.waitForTimeout(1800);
  await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1000);
  let st = await probe();
  note('LOADED: ' + JSON.stringify(st));
  await shot('continue-loaded');
  if (await dialogueOpen()) await advance(10);

  // ===== TOWN interactions =====
  await faceInteract(11, 11, 'sign-tallgrass');
  await shot('sign-read');
  note('SIGN: ' + (await bodyText()).slice(0, 220));
  await advance(8);
  await faceInteract(9, 13, 'techie');
  await shot('npc-techie-talk');
  note('TECHIE: ' + (await bodyText()).slice(0, 220));
  await advance(10);
  await faceInteract(5, 9, 'mom-town');
  await shot('npc-mom-town');
  note('MOM: ' + (await bodyText()).slice(0, 220));
  await advance(12);

  // ===== HOUSE =====
  await goTo(6, 8);
  await stepOnto(6, 7);
  await shot('house-1f');
  await faceInteract(5, 8, 'mom-house');
  await shot('house-mom-heal');
  await advance(12);
  await goTo(6, 2);
  await stepOnto(6, 1);
  await shot('house-2f');
  await goTo(6, 5);
  await page.waitForTimeout(600);
  await shot('house-2f-clock');
  note('CLOCK: ' + (await bodyText()).slice(0, 200));
  await advance(8);
  await stepOnto(6, 11);
  await goTo(6, 10);
  await stepOnto(6, 11);
  st = await probe(); note('back in town: ' + JSON.stringify(st));

  // ===== LAB + STARTER + HEX =====
  await goTo(10, 4);
  await stepOnto(10, 3);
  await shot('lab-interior');
  await faceInteract(6, 6, 'tyrage-ball');
  await shot('starter-choice');
  note('CHOICE: ' + (await bodyText()).slice(0, 240));
  await chooseYes();
  await page.waitForTimeout(900);
  await shot('starter-taken');
  await advance(10);
  st = await probe(); note('AFTER STARTER: ' + JSON.stringify(st));
  await goTo(6, 11);
  const rHex = await stepVerified('ArrowDown'); // onto (6,12): hex event
  note('hex step: ' + rHex);
  await page.waitForTimeout(700);
  await shot('hex-event-dialog');
  await advance(6);
  if (await inBattle()) { await shot('hex-battle'); await battleLoop('hex'); }
  else note('hex battle not detected');
  await advance(6);
  await shot('hex-battle-end');
  st = await probe(); note('AFTER HEX: ' + JSON.stringify(st));
  await stepOnto(6, 13);
  st = await probe(); note('out of lab: ' + JSON.stringify(st));

  // ===== GATE -> ROUTE 1 -> WILD =====
  await goTo(15, 2);
  await stepOnto(15, 0);
  await shot('route1-arrival');
  st = await probe(); note('ROUTE: ' + JSON.stringify(st));
  await goTo(14, 24);
  let wild = false;
  for (let i = 0; i < 40 && !wild; i++) {
    const r = await stepVerified(i % 2 ? 'ArrowRight' : 'ArrowLeft');
    if (r === 'battle' || (await inBattle())) wild = true;
    if (r === 'dialogue') await advance(6);
  }
  note('wild triggered: ' + wild);
  if (wild) { await shot('wild-battle'); await battleLoop('wild'); await shot('wild-battle-end'); }
  st = await probe(); note('AFTER WILD: ' + JSON.stringify(st));

  // ===== SILICON TOWN + PLEX =====
  await goTo(14, 1);
  await stepOnto(14, 0);
  await shot('silicon-town');
  st = await probe(); note('TOWN2: ' + JSON.stringify(st));
  await goTo(24, 9);
  await goTo(24, 7);
  await stepOnto(24, 6);
  await shot('plex-interior');
  await faceInteract(7, 3, 'nurse');
  await shot('plex-nurse-heal');
  note('NURSE: ' + (await bodyText()).slice(0, 220));
  await advance(10);
  await goTo(7, 10);
  await stepOnto(7, 11);
  st = await probe(); note('out of plex: ' + JSON.stringify(st));

  // ===== RETURN =====
  await goTo(15, 33);
  await stepOnto(15, 34);
  await goTo(14, 38);
  await stepOnto(14, 39);
  await goTo(15, 10);
  await shot('return-to-town');
  st = await probe(); note('RETURNED: ' + JSON.stringify(st));

  // ===== RELOAD -> CONTINUE proof =====
  await page.waitForTimeout(2500);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100);
  await shot('menu-after-reload');
  if (await clickText('CONTINUE')) note('clicked CONTINUE (reload)');
  await page.waitForTimeout(900);
  await shot('slots-after-reload');
  note('SLOTS2: ' + (await bodyText()).slice(0, 200));
  await clickText('ACE');
  await page.waitForTimeout(1800);
  await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await shot('continue-proof');
  st = await probe(); note('CONTINUE PROOF: ' + JSON.stringify(st));
  fs.writeFileSync(SHOTS + '/p4-log.json', JSON.stringify({ log, errors }, null, 2));
  note('P4-DONE');
} catch (e) {
  note('P4-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/p4-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await ctx.close();
}
