// Mochiichao first-town slice — definitive playthrough on a PERSISTENT
// profile (saves survive; CONTINUE is real). Discrete keydown steps
// (engine moves once per keydown) + F5-quicksave position probes.
import fs from 'node:fs';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/p2';
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
// Discrete steps: one keydown == one tile.
async function step(dir, count = 1) {
  for (let i = 0; i < count; i++) { await page.keyboard.press(dir); await page.waitForTimeout(235); }
  await page.waitForTimeout(120);
}
// F5 quicksave then read newest save entry's map/pos from localStorage.
async function probe(tag) {
  await page.keyboard.press('F5');
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const out = { keys: Object.keys(localStorage) };
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith('mochii_saves_')) continue;
      try {
        const arr = JSON.parse(localStorage.getItem(k));
        const latest = arr[arr.length - 1];
        const d = latest.data || {};
        out.slot = k; out.type = latest.type;
        out.map = d.currentMap;
        out.pos = d.playerPos || d.position || d.player || null;
        out.dataKeys = Object.keys(d).slice(0, 40);
      } catch (e) { /* ignore */ }
    }
    return out;
  }).catch((e) => ({ err: e.message }));
  note('PROBE ' + tag + ': ' + JSON.stringify(info).slice(0, 320));
  return info;
}
const dialogueOpen = async () => page.evaluate(() => {
  const t = document.body.innerText;
  return /▼|MOM|MOTHER|PROF|AEON|HEX/i.test(t) && !!document.querySelector('canvas');
}).catch(() => false);
async function advance(tries = 14) {
  for (let i = 0; i < tries; i++) {
    await press('Enter', 550);
    if (i % 3 === 2) await page.mouse.click(640, 690);
  }
  await page.waitForTimeout(300);
}
async function waitText(re, timeout = 14000) {
  const ok = await page.waitForFunction((r) => new RegExp(r, 'i').test(document.body.innerText), re.source, { timeout }).then(() => true).catch(() => false);
  note('waitText ' + re + ' -> ' + ok);
  return ok;
}
async function battleLoop(tag, maxRounds = 46) {
  note('battleLoop: ' + tag);
  for (let r = 0; r < maxRounds; r++) {
    const t = await bodyText();
    if (/Goal:/i.test(t)) { note('battle over — world HUD back'); return true; }
    const clicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && b.textContent.trim().length > 1);
      const bad = /^(RUN|BAG|PARTY|TEAM|MENU|MOCHIIMIND|BACK|SETTINGS|CONTINUE|NEW GAME)$/i;
      const mv = btns.find((b) => !bad.test(b.textContent.trim()) && b.getBoundingClientRect().top > 360);
      if (mv) { mv.click(); return mv.textContent.trim().slice(0, 40); }
      return null;
    });
    if (clicked) note('move: ' + clicked);
    await page.waitForTimeout(1500);
    if (r % 4 === 3) await press('Enter', 450);
  }
  note('battleLoop maxRounds reached');
  return false;
}

try {
  // ===== INTRO (fresh profile) =====
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const hasSave = /CONTINUE/i.test(await bodyText());
  note('menu hasSave precheck (intro not done yet): ' + hasSave);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100);
  await shot('main-menu');
  await page.mouse.click(640, 508); await page.waitForTimeout(900);
  if (!/SELECT A SAVE FILE/i.test(await bodyText())) { await clickText('NEW GAME'); await page.waitForTimeout(800); }
  await clickText('EMPTY'); await page.waitForTimeout(800);
  for (let i = 0; i < 26; i++) { if (/ARE YOU A BOY OR A GIRL/i.test(await bodyText())) break; await press('Enter', 460); if (i % 3 === 2) await page.mouse.click(640, 690); }
  await clickText('BOY'); await page.waitForTimeout(700);
  await shot('name-entry');
  await page.keyboard.type('ACE', { delay: 140 });
  await page.waitForTimeout(300); await press('Enter', 900);
  await page.waitForFunction(() => /RIVAL/i.test(document.body.innerText), null, { timeout: 12000 }).catch(() => {});
  await shot('rival-name');
  await press('Enter', 900); // confirm rival "Hex" as-is
  // World detect by HUD text, not canvas (intro scenes may use canvas too)
  await waitText(/Moving Truck/, 16000);
  await page.waitForTimeout(1200);
  await shot('truck-spawn');
  await probe('truck-spawn');
  // ===== TRUCK: Mom at (7,3), spawn (6,8) =====
  await step('ArrowRight', 1); await step('ArrowUp', 4);
  await probe('truck-at-mom');
  await press('Enter', 900);
  await shot('truck-mom-talk');
  await advance(12);
  await step('ArrowLeft', 1); await step('ArrowDown', 5);
  await waitText(/Boot Harbor/, 12000);
  await page.waitForTimeout(800);
  // Town arrival may auto-open Mom's greeting — advance it closed.
  await advance(6);
  await shot('town-spawn');
  await probe('town-spawn');
  note('TOWN: ' + (await bodyText()).slice(0, 150));
  // ===== Sign (12,10): from (15,10) left x2, face left, read =====
  await step('ArrowLeft', 2);
  await press('ArrowLeft', 400); // face into sign (blocked move = turn)
  await press('Enter', 900);
  await shot('sign-read');
  note('SIGN: ' + (await bodyText()).slice(0, 200));
  await advance(6);
  // ===== Techie (20,14): right 7, down 3, face down =====
  await step('ArrowRight', 7); await step('ArrowDown', 3);
  await probe('at-techie');
  await press('ArrowDown', 400);
  await press('Enter', 900);
  await shot('npc-techie-talk');
  note('TECHIE: ' + (await bodyText()).slice(0, 200));
  await advance(8);
  await probe('after-techie');
  fs.writeFileSync(SHOTS + '/p2-log.json', JSON.stringify({ log, errors }, null, 2));
  note('P2-PART1-DONE');
} catch (e) {
  note('P2-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/p2-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await ctx.close();
}
