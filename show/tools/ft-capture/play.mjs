// Mochiichao first-town slice — STAGE A: boot -> title -> menu -> slots ->
// prof intro -> gender -> name -> rival -> world(truck). Screenshots via CDP
// (page.screenshot hangs on a font URL in this build).
import fs from 'node:fs';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/final-a';
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
page.on('pageerror', (e) => { errors.push('PAGEERROR: ' + e.message); note('PAGEERROR: ' + e.message.slice(0, 200)); });
page.on('response', (r) => { if (r.status() >= 400) note('HTTP' + r.status() + ': ' + r.url().slice(-90)); });

const cdp = await page.context().newCDPSession(page);
let n = 0;
async function shot(name) {
  n++;
  const f = `${SHOTS}/${String(n).padStart(2, '0')}-${name}.png`;
  try {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
  } catch (e) { note('shot failed ' + name + ': ' + e.message); }
  note('SHOT ' + f);
}
const bodyText = async () => (await page.evaluate(() => document.body.innerText || '')).replace(/\s+/g, ' ');
const press = async (k, w = 600) => { await page.keyboard.press(k); await page.waitForTimeout(w); };
async function clickText(txt) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role="button"], a, div, span')]
      .filter((e) => (e.textContent || '').toUpperCase().includes(t.toUpperCase()))
      .map((e) => { const r = e.getBoundingClientRect(); return { e, a: r.width * r.height }; })
      .filter((x) => x.a > 0)
      .sort((p, q) => p.a - q.a);
    if (els.length) { els[0].e.click(); return true; }
    return false;
  }, txt).catch(() => false);
}
// Advance dialogue (Enter, falling back to clicking the dialogue area)
// until pred(text) is true or tries run out.
async function advanceUntil(pred, tries = 24, label = '') {
  for (let i = 0; i < tries; i++) {
    const t = await bodyText();
    if (pred(t)) return true;
    await press('Enter', 500);
    if (i % 3 === 2) await page.mouse.click(640, 690);
    await page.waitForTimeout(250);
  }
  note('advanceUntil timeout: ' + label);
  return pred(await bodyText());
}

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await shot('boot');
  note('BOOT: ' + (await bodyText()).slice(0, 120));
  // INTRO scenes: click through (4 scenes), then title.
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1100);
  }
  await page.waitForTimeout(1500);
  await shot('title');
  note('TITLE: ' + (await bodyText()).slice(0, 120));
  // Title -> MAIN_MENU
  await press('Enter', 1200);
  await shot('main-menu');
  // Menu panels are DOM over a scaled stage: NEW GAME centre = (640,508).
  await page.mouse.click(640, 508);
  await page.waitForTimeout(900);
  if (!/SELECT A SAVE FILE/i.test(await bodyText())) { await clickText('NEW GAME'); await page.waitForTimeout(900); }
  await shot('save-slots');
  note('SLOTS: ' + (await bodyText()).slice(0, 160));
  const slotOk = (await clickText('EMPTY')) || (await clickText('NEW GAME ►'));
  note('slot click: ' + slotOk);
  if (!slotOk) { await page.mouse.click(640, 300); }
  await page.waitForTimeout(900);
  await shot('prof-intro-1');
  const gotGender = await advanceUntil((t) => /ARE YOU A BOY OR A GIRL/i.test(t), 26, 'gender');
  note('gender reached: ' + gotGender);
  await shot('gender-select');
  if (!(await clickText('BOY'))) { note('BOY clickText failed'); }
  await page.waitForTimeout(800);
  await shot('name-entry');
  note('NAME: ' + (await bodyText()).slice(0, 160));
  await page.keyboard.type('ACE', { delay: 150 });
  await page.waitForTimeout(400);
  await shot('name-typed');
  await press('Enter', 1000);
  await shot('rival-name');
  note('RIVAL: ' + (await bodyText()).slice(0, 160));
  await page.keyboard.type('HEX', { delay: 150 });
  await page.waitForTimeout(300);
  await press('Enter', 1000);
  // PROF_INTRO_2 -> world
  let inWorld = false;
  for (let i = 0; i < 26; i++) {
    inWorld = await page.evaluate(() => !!document.querySelector('canvas'));
    if (inWorld) break;
    await press('Enter', 500);
    if (i % 3 === 2) await page.mouse.click(640, 690);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1800);
  await shot('world-first');
  note('WORLD canvas: ' + inWorld + ' text: ' + (await bodyText()).slice(0, 160));
  fs.writeFileSync(SHOTS + '/stage-a-log.json', JSON.stringify({ log, errors }, null, 2));
  note('STAGE-A-DONE');
} catch (e) {
  note('STAGE-A-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/stage-a-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await browser.close();
}
