// Mochiichao first-town slice — BFS-navigated playthrough (persistent
// profile, continues ACE's save). Position truth = F5 quicksave probes.
// Facing rule: arrive at the tile beside a target moving TOWARD it, then
// Enter with no extra direction press.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';
const require = createRequire(import.meta.url);
const { FULL_WORLD } = require('/tmp/fullworld.cjs');

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/p3';
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

async function probe() {
  await page.keyboard.press('F5').catch(() => {});
  await page.waitForTimeout(450);
  const info = await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith('mochii_saves_')) continue;
      try {
        const arr = JSON.parse(localStorage.getItem(k));
        const latest = arr[arr.length - 1];
        const d = latest.data || {};
        return { map: d.currentMap, x: d.playerPos?.x, y: d.playerPos?.y, party: (d.party || []).map((p) => p.speciesId || p.id), type: latest.type };
      } catch (e) { /* next */ }
    }
    return null;
  }).catch(() => null);
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
async function advance(tries = 12) {
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
  const warp = new Set(); // stepping here warps away — never route through
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

let curMap = null;
async function goTo(tx, ty, opts = {}) {
  const dyn = new Set(opts.extraBlocked || []);
  let stuckTile = null, stuckCount = 0;
  for (let attempt = 0; attempt < 70; attempt++) {
    const st = await probe();
    if (!st) { note('goTo: probe failed'); return null; }
    if (curMap && st.map !== curMap) { note(`goTo: map changed ${curMap} -> ${st.map} @ ${st.x},${st.y}`); curMap = st.map; return st; }
    curMap = st.map;
    if (st.x === tx && st.y === ty) { note(`goTo arrived ${curMap} (${tx},${ty}) party=${JSON.stringify(st.party)}`); return st; }
    if (await inBattle()) { note('goTo: battle interrupt'); await shot('battle-interrupt'); await battleLoop('interrupt'); continue; }
    if (await dialogueOpen()) { await advance(10); continue; }
    const path = bfs(st.map, st.x, st.y, tx, ty, dyn, opts.allowWarpTarget);
    if (!path || !path.length) { note(`goTo: no path ${st.map} (${st.x},${st.y}) -> (${tx},${ty})`); return st; }
    const dir = path[0];
    const [dx, dy] = DIRS[dir];
    const wantTile = (st.x + dx) + ',' + (st.y + dy);
    await page.keyboard.press(dir);
    await page.waitForTimeout(330);
    const st2 = await probe();
    if (st2 && st2.map === st.map && st2.x === st.x && st2.y === st.y) {
      if (wantTile === stuckTile) { stuckCount++; if (stuckCount >= 2) { dyn.add(wantTile); note('goTo: dyn-block ' + wantTile); stuckCount = 0; } }
      else { stuckTile = wantTile; stuckCount = 1; }
    }
  }
  note('goTo: attempts exhausted');
  return probe();
}
// Step onto a door/exit tile (warp) — end state is the new map.
async function stepOnto(tx, ty) {
  const st = await goTo(tx, ty, { allowWarpTarget: true });
  await page.waitForTimeout(900);
  const st2 = await probe();
  note(`stepOnto (${tx},${ty}) -> ${JSON.stringify(st2)}`);
  if (st2) curMap = st2.map;
  return st2;
}
// Stand beside (tx,ty) facing it, then Enter.
async function faceInteract(tx, ty, label) {
  const st0 = await probe();
  const { m } = mapStatics(st0.map);
  const sides = [
    { ax: tx, ay: ty + 1, dir: 'ArrowUp' },   // stand south, face up
    { ax: tx, ay: ty - 1, dir: 'ArrowDown' },
    { ax: tx + 1, ay: ty, dir: 'ArrowLeft' },
    { ax: tx - 1, ay: ty, dir: 'ArrowRight' },
  ];
  for (const s of sides) {
    if (s.ax < 0 || s.ay < 0 || s.ax >= m.width || s.ay >= m.height) continue;
    if (SOLID.has(m.tiles[s.ay][s.ax])) continue;
    const [dx, dy] = DIRS[s.dir];
    const px = s.ax - dx, py = s.ay - dy; // tile we step FROM into the side tile
    const stp = await goTo(px, py);
    if (!stp || stp.map !== st0.map) continue;
    await page.keyboard.press(s.dir); // final step into side tile, facing target
    await page.waitForTimeout(330);
    const st1 = await probe();
    note(`faceInteract ${label}: at ${st1?.x},${st1?.y} facing ${s.dir} toward (${tx},${ty})`);
    await press('Enter', 800);
    await page.waitForTimeout(500);
    const t = await bodyText();
    note(`faceInteract ${label} text: ` + t.slice(0, 180));
    return st1;
  }
  note('faceInteract: no side worked for ' + label);
  return null;
}

try {
  // ===== CONTINUE from the persistent save =====
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100);
  await shot('menu-continue');
  note('MENU: ' + (await bodyText()).slice(0, 140));
  if (await clickText('CONTINUE')) note('clicked CONTINUE');
  await page.waitForTimeout(900);
  await shot('slots-continue');
  note('SLOTS: ' + (await bodyText()).slice(0, 200));
  await clickText('ACE');
  await page.waitForTimeout(1600);
  await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  let st = await probe();
  note('LOADED: ' + JSON.stringify(st));
  curMap = st?.map;
  await shot('continue-loaded');

  // ===== TOWN: sign (11,11), techie (9,13), mom (5,9) =====
  await faceInteract(11, 11, 'sign-tallgrass');
  await shot('sign-read');
  await advance(8);
  await faceInteract(9, 13, 'techie');
  await shot('npc-techie-talk');
  note('TECHIE: ' + (await bodyText()).slice(0, 200));
  await advance(10);
  await faceInteract(5, 9, 'mom-town');
  await shot('npc-mom-town');
  note('MOM: ' + (await bodyText()).slice(0, 200));
  await advance(12);

  // ===== HOUSE: door (6,7) -> 1F; mom heal; stairs; clock; out =====
  await goTo(6, 8);
  await stepOnto(6, 7);
  await shot('house-1f');
  await faceInteract(5, 8, 'mom-house');
  await shot('house-mom-heal');
  await advance(12);
  await goTo(6, 2);
  await stepOnto(6, 1); // stairs exit tile
  await shot('house-2f');
  await goTo(6, 5); // clock step event
  await page.waitForTimeout(600);
  await shot('house-2f-clock');
  note('CLOCK: ' + (await bodyText()).slice(0, 180));
  await advance(8);
  await stepOnto(6, 11); // stairs down
  await goTo(6, 10);
  await stepOnto(6, 11); // front door
  st = await probe(); note('back in town: ' + JSON.stringify(st));

  // ===== LAB: door (10,3); Tyrage (6,6); Hex battle; out =====
  await goTo(10, 4);
  await stepOnto(10, 3);
  await shot('lab-interior');
  await faceInteract(6, 4, 'prof'); // prof wanders near (6,4)
  await shot('lab-prof-talk');
  await advance(12);
  await faceInteract(6, 6, 'tyrage-ball');
  await shot('starter-choice');
  note('CHOICE: ' + (await bodyText()).slice(0, 220));
  if (await clickText('YES')) note('clicked YES');
  else { await press('Enter', 700); }
  await page.waitForTimeout(900);
  await shot('starter-taken');
  await advance(10);
  st = await probe(); note('AFTER STARTER: ' + JSON.stringify(st));
  // exit: step onto battle event tile (6,12) then door (6,13)
  await goTo(6, 11);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600); // onto (6,12): hex event dialog
  await page.waitForTimeout(700);
  await shot('hex-event-dialog');
  await advance(6);
  if (await inBattle()) { await shot('hex-battle'); await battleLoop('hex'); }
  else note('hex battle did not trigger after event dialog');
  await advance(6);
  await shot('hex-battle-end');
  st = await probe(); note('AFTER HEX: ' + JSON.stringify(st));
  await stepOnto(6, 13);
  st = await probe(); note('out of lab: ' + JSON.stringify(st));

  // ===== GATE -> ROUTE 1 =====
  await goTo(15, 2);
  await stepOnto(15, 0); // north edge exit row
  await shot('route1-arrival');
  st = await probe(); note('ROUTE: ' + JSON.stringify(st));
  // wild battle hunt in grass (13,24)/(12,24)
  await goTo(14, 24);
  let wild = false;
  for (let i = 0; i < 46 && !wild; i++) {
    await page.keyboard.press(i % 2 ? 'ArrowRight' : 'ArrowLeft');
    await page.waitForTimeout(430);
    if (await inBattle()) wild = true;
  }
  note('wild triggered: ' + wild);
  if (wild) { await shot('wild-battle'); await battleLoop('wild'); await shot('wild-battle-end'); }
  st = await probe(); note('AFTER WILD: ' + JSON.stringify(st));

  // ===== NORTH -> SILICON TOWN -> PLEX =====
  await goTo(14, 1);
  await stepOnto(14, 0);
  await shot('silicon-town');
  st = await probe(); note('TOWN2: ' + JSON.stringify(st));
  await goTo(24, 9);
  await goTo(24, 7);
  await stepOnto(24, 6); // plex door
  await shot('plex-interior');
  await faceInteract(7, 3, 'nurse');
  await shot('plex-nurse-heal');
  note('NURSE: ' + (await bodyText()).slice(0, 200));
  await advance(10);
  await goTo(7, 10);
  await stepOnto(7, 11); // plex exit door
  st = await probe(); note('out of plex: ' + JSON.stringify(st));

  // ===== RETURN: south exit -> route -> sector0 =====
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
  await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await shot('continue-proof');
  st = await probe(); note('CONTINUE PROOF: ' + JSON.stringify(st));
  fs.writeFileSync(SHOTS + '/p3-log.json', JSON.stringify({ log, errors }, null, 2));
  note('P3-DONE');
} catch (e) {
  note('P3-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/p3-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await ctx.close();
}
