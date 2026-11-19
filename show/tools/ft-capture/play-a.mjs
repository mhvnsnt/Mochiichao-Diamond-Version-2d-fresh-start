import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS_DIR;
fs.mkdirSync(SHOTS, { recursive: true });
const log = [];
const errors = [];
function note(s) { log.push(s); console.log(s); }

const browser = await chromium.launch({ executablePath: '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => { errors.push('PAGEERROR: ' + e.message); note('PAGEERROR: ' + e.message); });
page.on('console', m => { if (m.type() === 'error') { errors.push('CONSOLE: ' + m.text()); note('CONSOLE-ERR: ' + m.text().slice(0, 200)); } });
page.on('response', r => { if (r.status() >= 400) note('HTTP ' + r.status() + ' ' + r.url().slice(-80)); });

let n = 0;
const cdp = await page.context().newCDPSession(page);
async function shot(name) {
  n++;
  const f = `${SHOTS}/${String(n).padStart(2, '0')}-${name}.png`;
  try {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
  } catch (e) { note('shot failed ' + name + ': ' + e.message); }
  note('SHOT ' + f);
  return f;
}
async function bodyText() { return (await page.evaluate(() => document.body.innerText || '')).replace(/\s+/g, ' ').trim(); }
async function hasCanvas() { return await page.evaluate(() => !!document.querySelector('canvas')); }
async function press(key, wait = 350) { await page.keyboard.press(key); await page.waitForTimeout(wait); }
async function hold(key, ms) { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); await page.waitForTimeout(120); }
// one tile step ~= 140ms hold (interval cadence); first step fires on keydown
async function walk(key, steps) { for (let i = 0; i < steps; i++) { await page.keyboard.press(key, { delay: 30 }); await page.waitForTimeout(165); } }
async function clickText(txt, opts = {}) {
  const loc = page.getByText(txt, { exact: false }).first();
  try { await loc.click({ timeout: 2500 }); await page.waitForTimeout(400); return true; }
  catch { return false; }
}
async function dialogueVisible() {
  const t = await bodyText();
  return /Prof\. Aeon|Mom|Hex|Mover|▼/.test(t) && t.length > 5;
}
// Advance dialogue with Space until it disappears (max 30 presses)
async function clearDialogue(tag) {
  for (let i = 0; i < 30; i++) {
    const t = await bodyText();
    const dlg = await page.evaluate(() => !!document.querySelector('[class*=dialogue], [class*=Dialogue]'));
    const looksDlg = dlg || /▼/.test(t);
    if (!looksDlg) { note(`dialogue cleared (${tag}) after ${i}`); return true; }
    await press('Space', 300);
  }
  note(`dialogue NOT cleared (${tag})`);
  return false;
}

try {
  // ---------- STAGE 1: boot -> title -> menu ----------
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => note('goto networkidle timeout, continuing'));
  await page.waitForTimeout(2500);
  await shot('boot');
  note('BOOT text: ' + (await bodyText()).slice(0, 200));
  // BOOT + INTRO are click-advance screens
  for (let i = 0; i < 4; i++) {
    const t = await bodyText();
    if (/NEW GAME|CONTINUE|SETTINGS/i.test(t) && /SLOT|GAME/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1200);
    const t2 = await bodyText();
    note(`after click ${i}: ` + t2.slice(0, 150));
    if (/PRESS|START/i.test(t2) && !/NEW GAME/i.test(t2)) { await press('Enter', 800); }
  }
  await shot('title-or-menu');
  let t = await bodyText();
  if (!/NEW GAME/i.test(t)) { await press('Enter', 1000); await shot('after-enter'); t = await bodyText(); }
  note('MENU text: ' + t.slice(0, 300));

  // ---------- STAGE 2: new game -> slots -> prof intro ----------
  await shot('main-menu');
  // Menu is keyboard-driven: cursor starts on NEW GAME, Enter selects.
  await press('Enter', 900);
  t = await bodyText();
  if (/NEW GAME/i.test(t) && !/SLOT/i.test(t)) { await clickText('NEW GAME'); await page.waitForTimeout(600); }
  await page.waitForTimeout(800);
  await shot('save-slots');
  t = await bodyText(); note('SLOTS text: ' + t.slice(0, 300));
  // click first slot area / any "SLOT" or "EMPTY" or "NEW" element
  let slotOk = await clickText('SLOT 1') || await clickText('Slot 1') || await clickText('EMPTY') || await clickText('NEW');
  if (!slotOk) { await page.mouse.click(640, 300); await page.waitForTimeout(600); }
  await shot('after-slot');
  t = await bodyText(); note('AFTER SLOT: ' + t.slice(0, 250));

  // ---------- STAGE 3: prof intro 1 dialogue ----------
  await clearDialogue('prof-intro-1');
  await shot('gender-select');
  t = await bodyText(); note('GENDER text: ' + t.slice(0, 200));
  if (!(await clickText('BOY'))) { await page.mouse.click(480, 400); await page.waitForTimeout(500); }
  await page.waitForTimeout(600);
  await shot('name-entry');
  t = await bodyText(); note('NAME text: ' + t.slice(0, 200));

  // ---------- STAGE 4: name entry ----------
  await page.keyboard.type('Mars', { delay: 80 });
  await page.waitForTimeout(300);
  await shot('name-typed');
  if (!(await clickText('OK'))) { await press('Enter', 600); }
  await page.waitForTimeout(700);
  await shot('rival-name');
  t = await bodyText(); note('RIVAL text: ' + t.slice(0, 200));
  if (!(await clickText('CONFIRM'))) { await press('Enter', 600); }
  await page.waitForTimeout(700);

  // ---------- STAGE 5: prof intro 2 -> truck ----------
  await clearDialogue('prof-intro-2');
  await page.waitForTimeout(1200);
  await shot('world-first');
  note('WORLD canvas: ' + (await hasCanvas()) + ' text: ' + (await bodyText()).slice(0, 200));
  fs.writeFileSync(SHOTS + '/stage-a-log.json', JSON.stringify({ log, errors }, null, 2));
  note('STAGE-A-DONE');
} catch (e) {
  note('STAGE-A-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/stage-a-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await browser.close();
}
