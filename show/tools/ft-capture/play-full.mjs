// Mochiichao first-town slice — FULL playthrough: intro -> truck -> Boot
// Harbor -> house -> lab/starter -> Hex battle -> route_1 wild battle ->
// Silicon Town -> return -> save/continue proof. CDP screenshots.
import fs from 'node:fs';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/full';
fs.mkdirSync(SHOTS, { recursive: true });
const BASE = 'http://127.0.0.1:4173/';
const log = [];
const note = (m) => { log.push(m); console.log(m); };
const errors = [];

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => { errors.push('PAGEERROR: ' + e.message); note('PAGEERROR: ' + e.message.slice(0, 180)); });
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
const press = async (k, w = 500) => { await page.keyboard.press(k); await page.waitForTimeout(w); };
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
// Movement: hold a direction for `steps` tiles (~150ms/step + margin).
async function hold(dir, steps, msPer = 155) {
  await page.keyboard.down(dir);
  await page.waitForTimeout(steps * msPer + 60);
  await page.keyboard.up(dir);
  await page.waitForTimeout(320);
}
const face = async (dir) => { await page.keyboard.down(dir); await page.waitForTimeout(65); await page.keyboard.up(dir); await page.waitForTimeout(220); };
const inBattle = async () => page.evaluate(() => /FIGHT|POTION|RUN/.test(document.body.innerText) && !!document.querySelector('canvas')).catch(() => false);
async function advance(tries = 12, gap = 620) {
  for (let i = 0; i < tries; i++) { await press('Enter', gap); if (i % 3 === 2) await page.mouse.click(640, 690); }
}
async function waitText(re, timeout = 14000) {
  const ok = await page.waitForFunction((r) => new RegExp(r, 'i').test(document.body.innerText), re.source, { timeout }).then(() => true).catch(() => false);
  note('waitText ' + re + ' -> ' + ok);
  return ok;
}
async function battleLoop(tag, maxRounds = 42) {
  note('battleLoop start: ' + tag);
  for (let r = 0; r < maxRounds; r++) {
    const t = await bodyText();
    if (/got .*experience|you won|won the battle|trainer.*defeated/i.test(t)) { note('battle won banner'); await advance(4); }
    const active = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null);
      return btns.length;
    });
    // click a move: prefer a button that is not RUN/BAG/PARTY/menu chrome
    const clicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && b.textContent.trim().length > 1);
      const bad = /^(RUN|BAG|PARTY|TEAM|MENU|MOCHIIMIND|BACK|SETTINGS|CONTINUE|NEW GAME)$/i;
      const mv = btns.find((b) => !bad.test(b.textContent.trim()) && /[A-Z]{3,}/.test(b.textContent) && b.getBoundingClientRect().top > 380);
      if (mv) { mv.click(); return mv.textContent.trim().slice(0, 40); }
      return null;
    });
    if (clicked) note('move clicked: ' + clicked);
    await page.waitForTimeout(1700);
    const still = await bodyText();
    if (!/FIGHT|RUN/.test(still) || /Goal:/i.test(still)) { note('battle over (world HUD back)'); break; }
    if (r % 4 === 3) await press('Enter', 500);
  }
  await page.waitForTimeout(800);
}

try {
  // ===== STAGE A (fast path) =====
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100); // title -> menu
  await page.mouse.click(640, 508); await page.waitForTimeout(900); // NEW GAME
  if (!/SELECT A SAVE FILE/i.test(await bodyText())) { await clickText('NEW GAME'); await page.waitForTimeout(800); }
  await clickText('EMPTY'); await page.waitForTimeout(800);
  for (let i = 0; i < 26; i++) { if (/ARE YOU A BOY OR A GIRL/i.test(await bodyText())) break; await press('Enter', 480); if (i % 3 === 2) await page.mouse.click(640, 690); }
  await clickText('BOY'); await page.waitForTimeout(700);
  await shot('name-entry');
  await page.keyboard.type('ACE', { delay: 140 });
  await page.waitForTimeout(300); await press('Enter', 900);
  await page.waitForFunction(() => /RIVAL/i.test(document.body.innerText), null, { timeout: 12000 }).catch(() => {});
  // rival pad is prefilled "Hex": clear then type
  for (let i = 0; i < 4; i++) await press('Backspace', 120);
  await page.keyboard.type('HEX', { delay: 140 });
  await page.waitForTimeout(300); await press('Enter', 900);
  for (let i = 0; i < 26; i++) { if (await page.evaluate(() => !!document.querySelector('canvas'))) break; await press('Enter', 480); if (i % 3 === 2) await page.mouse.click(640, 690); }
  await page.waitForTimeout(1600);
  note('A-DONE text: ' + (await bodyText()).slice(0, 140));

  // ===== TRUCK =====
  await shot('truck-spawn');
  await hold('ArrowRight', 1); await hold('ArrowUp', 4); await face('ArrowUp');
  await press('Enter', 900); await shot('truck-mom-talk');
  await advance(10);
  note('after mom: ' + (await bodyText()).slice(0, 120));
  await hold('ArrowLeft', 1); await hold('ArrowDown', 5);
  await waitText(/Boot Harbor/, 12000);
  await page.waitForTimeout(700);
  // ===== BOOT HARBOR =====
  await shot('town-spawn');
  note('TOWN: ' + (await bodyText()).slice(0, 160));
  // sign at (12,10): walk left into it, face left, read
  await hold('ArrowLeft', 3); await face('ArrowLeft'); await press('Enter', 900);
  await shot('sign-read');
  await advance(6);
  // techie at (20,14): from ~(13,10) right 7, down 3, face down
  await hold('ArrowRight', 7); await hold('ArrowDown', 3); await face('ArrowDown');
  await press('Enter', 900); await shot('npc-techie-talk');
  await advance(8);
  // house door (6,7): up 3 to path row, left 14, up 3
  await hold('ArrowUp', 3); await hold('ArrowLeft', 14); await hold('ArrowUp', 3);
  await waitText(/Your House|House 1F|1F/, 10000);
  await page.waitForTimeout(600);
  await shot('house-1f');
  note('HOUSE: ' + (await bodyText()).slice(0, 140));
  // Mom inside (4,2): left 1, up 4ish, face up
  await hold('ArrowLeft', 1); await hold('ArrowUp', 4); await face('ArrowUp');
  await press('Enter', 900); await shot('house-mom-heal');
  await advance(10);
  // stairs (9,1): right 5, up 2
  await hold('ArrowRight', 5); await hold('ArrowUp', 2);
  await page.waitForTimeout(700); await shot('house-2f');
  note('2F: ' + (await bodyText()).slice(0, 120));
  // back down (9,7), exit (5,8)
  await hold('ArrowDown', 1); await page.waitForTimeout(600);
  await hold('ArrowLeft', 4); await hold('ArrowDown', 6);
  await waitText(/Boot Harbor/, 10000);
  note('back in town: ' + (await bodyText()).slice(0, 100));
  // ===== LAB + STARTER =====
  await hold('ArrowRight', 4); await hold('ArrowUp', 5); // (6,8)->(10,8)-> door (10,3) via up x5 (may enter at 3)
  await waitText(/Lab/, 10000);
  await page.waitForTimeout(700);
  await shot('lab-interior');
  note('LAB: ' + (await bodyText()).slice(0, 140));
  // Tyrage ball (6,6): from (9,10) up 4, left 2, face left
  await hold('ArrowUp', 4); await hold('ArrowLeft', 2); await face('ArrowLeft');
  await press('Enter', 1000); await shot('starter-choice');
  note('CHOICE: ' + (await bodyText()).slice(0, 220));
  if (!(await clickText('YES'))) { await press('Enter', 800); }
  await page.waitForTimeout(800); await shot('starter-taken');
  await advance(10);
  note('after starter: ' + (await bodyText()).slice(0, 160));
  // exit lab -> Hex battle at door (9,11)
  await hold('ArrowRight', 2); await hold('ArrowDown', 5);
  await page.waitForTimeout(1200);
  await shot('hex-battle-start');
  note('HEX?: ' + (await bodyText()).slice(0, 200));
  await battleLoop('hex');
  await shot('hex-battle-end');
  note('after hex: ' + (await bodyText()).slice(0, 140));
  // If battle returned us inside the lab, exit again
  if (/Lab/i.test(await bodyText()) && !/Boot Harbor/i.test(await bodyText())) { await hold('ArrowDown', 3); await page.waitForTimeout(800); }
  await waitText(/Boot Harbor/, 8000);
  // ===== NORTH GATE -> ROUTE 1 =====
  // position ~ (10,4): down 1, right 5, up 5
  await hold('ArrowDown', 1); await hold('ArrowRight', 5); await hold('ArrowUp', 6);
  await waitText(/Route 1/, 10000);
  await page.waitForTimeout(700);
  await shot('route1-arrival');
  note('ROUTE: ' + (await bodyText()).slice(0, 140));
  // wild battle hunt: up to grass (8,24), pace
  await hold('ArrowUp', 13);
  let wild = false;
  for (let i = 0; i < 40 && !wild; i++) {
    await hold(i % 2 ? 'ArrowLeft' : 'ArrowRight', 3, 130);
    const t = await bodyText();
    if (/wild|appeared|Lv\.?\s*\d/i.test(t) && !/Goal:/i.test(t)) wild = true;
    if (await inBattle()) wild = true;
  }
  note('wild battle triggered: ' + wild);
  await shot('wild-battle');
  if (wild) { await battleLoop('wild'); await shot('wild-battle-end'); }
  note('after wild: ' + (await bodyText()).slice(0, 140));
  // ===== NORTH -> SILICON TOWN =====
  await hold('ArrowRight', 6); await hold('ArrowUp', 24); // aim x14, far north (door 14,0)
  await waitText(/Silicon Town|Binary Fields/, 12000);
  await page.waitForTimeout(700);
  // a trainer may intercept on the way: if in battle, finish it then continue north
  if (await inBattle()) { await battleLoop('route-trainer'); await hold('ArrowUp', 10); await waitText(/Silicon Town|Binary Fields/, 8000); }
  await shot('silicon-town');
  note('TOWN2: ' + (await bodyText()).slice(0, 140));
  // MochiiPlex door (24,6): right 10, up 2 (from ~(14,36ish) go up first)
  await hold('ArrowUp', 28); await hold('ArrowRight', 10); await hold('ArrowUp', 3);
  await waitText(/MochiiPlex|Plex/, 10000);
  await page.waitForTimeout(600);
  await shot('plex-interior');
  note('PLEX: ' + (await bodyText()).slice(0, 140));
  // nurse (3,2): left 2, up 4, face up
  await hold('ArrowLeft', 2); await hold('ArrowUp', 4); await face('ArrowUp');
  await press('Enter', 900); await shot('plex-nurse-heal');
  await advance(10);
  // exit plex (5,8)
  await hold('ArrowRight', 2); await hold('ArrowDown', 5);
  await waitText(/Silicon Town|Binary Fields/, 10000);
  // ===== RETURN =====
  await hold('ArrowLeft', 10); await hold('ArrowDown', 32); // to south door (14,39)
  await waitText(/Route 1/, 10000);
  await hold('ArrowDown', 30); await hold('ArrowLeft', 6); await hold('ArrowDown', 2); // (8,39) door
  await waitText(/Boot Harbor/, 12000);
  await page.waitForTimeout(900);
  await shot('return-to-town');
  note('RETURNED: ' + (await bodyText()).slice(0, 160));
  // ===== SAVE / CONTINUE =====
  await page.waitForTimeout(3500); // let autosave land
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) { const t = await bodyText(); if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break; await page.mouse.click(640, 400); await page.waitForTimeout(1000); }
  await page.waitForTimeout(1200);
  await press('Enter', 1100); // -> menu (CONTINUE expected)
  await shot('menu-after-reload');
  note('MENU2: ' + (await bodyText()).slice(0, 140));
  if (await clickText('CONTINUE')) note('clicked CONTINUE');
  await page.waitForTimeout(900);
  await shot('slots-after-reload');
  note('SLOTS2: ' + (await bodyText()).slice(0, 200));
  await clickText('ACE'); await page.waitForTimeout(1500);
  for (let i = 0; i < 10; i++) { if (await page.evaluate(() => !!document.querySelector('canvas'))) break; await page.waitForTimeout(700); }
  await page.waitForTimeout(1200);
  await shot('continue-proof');
  note('CONTINUE RESULT: ' + (await bodyText()).slice(0, 180));
  fs.writeFileSync(SHOTS + '/full-log.json', JSON.stringify({ log, errors }, null, 2));
  note('FULL-DONE');
} catch (e) {
  note('FULL-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/full-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await browser.close();
}
