// Mochiichao first-town slice — counted-step playthrough, one continuous
// NEW GAME session on the persistent profile. Navigation = discrete
// keydown steps (1 keydown = 1 tile) on paths planned from the live
// grids; warp enterAt tiles are exact position resets. Screenshots at
// every waypoint. NO position oracle (save playerPos does not track
// per-step movement — verified empirically).
import fs from 'node:fs';
import { chromium } from '/home/hatch/workspace/_mochi-ft/node_modules/playwright/index.mjs';

const SHOTS = process.env.SHOTS_DIR || '/home/hatch/workspace/_mochi-ft-shots/p5';
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
// Counted discrete steps.
async function steps(dir, count) {
  for (let i = 0; i < count; i++) { await page.keyboard.press(dir); await page.waitForTimeout(300); }
  await page.waitForTimeout(250);
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
    await press('Enter', 480);
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
async function chooseYes() {
  for (let i = 0; i < 12; i++) {
    const has = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.offsetParent !== null && b.textContent.trim().toUpperCase() === 'YES'));
    if (has) { await clickText('YES'); note('choice: clicked YES'); return true; }
    await press('Enter', 550);
  }
  note('choice: YES never appeared');
  return false;
}
async function waitText(re, timeout = 16000) {
  const ok = await page.waitForFunction((r) => new RegExp(r, 'i').test(document.body.innerText), re.source, { timeout }).then(() => true).catch(() => false);
  note('waitText ' + re + ' -> ' + ok);
  return ok;
}

try {
  // ===== NEW GAME (overwrite slot 1 if a save exists) =====
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 6; i++) {
    const t = await bodyText();
    if (/DIAMOND VERSION/i.test(t) && !/INTRO MOVIE/i.test(t)) break;
    await page.mouse.click(640, 400); await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1200);
  await press('Enter', 1100); // -> menu
  await shot('menu');
  if (!(await clickText('NEW GAME'))) { await page.mouse.click(640, 508); await page.waitForTimeout(800); }
  await page.waitForTimeout(900);
  // overwrite confirm if saves exist
  if (/overwrite|start over/i.test(await bodyText())) { await clickText('Yes, continue'); await page.waitForTimeout(800); }
  if (!/SELECT A SAVE FILE/i.test(await bodyText())) { await clickText('NEW GAME'); await page.waitForTimeout(800); }
  await shot('slots');
  await clickText('SLOT 1'); await page.waitForTimeout(700);
  if (/Start over in SLOT/i.test(await bodyText())) { await clickText('Start new game here'); await page.waitForTimeout(800); }
  else if (/--- EMPTY ---/i.test(await bodyText())) { await clickText('EMPTY'); await page.waitForTimeout(800); }
  for (let i = 0; i < 26; i++) { if (/ARE YOU A BOY OR A GIRL/i.test(await bodyText())) break; await press('Enter', 460); if (i % 3 === 2) await page.mouse.click(640, 690); }
  await clickText('BOY'); await page.waitForTimeout(700);
  await shot('name-entry');
  await page.keyboard.type('ACE', { delay: 140 });
  await page.waitForTimeout(300); await press('Enter', 900);
  await page.waitForFunction(() => /RIVAL/i.test(document.body.innerText), null, { timeout: 14000 }).catch(() => {});
  await shot('rival-name');
  await press('Enter', 900); // rival Hex as-is
  await waitText(/Moving Truck/, 20000);
  await page.waitForTimeout(1200);

  // ===== TRUCK (spawn (6,8) exact): Mom (6,4); door (6,9) =====
  await shot('truck-spawn');
  await steps('ArrowUp', 3); // -> (6,5) facing up; Mom at (6,4)
  await press('Enter', 900);
  await shot('truck-mom-talk');
  note('TRUCK MOM: ' + (await bodyText()).slice(0, 220));
  await advance(10);
  await steps('ArrowDown', 4); // -> (6,9) door -> town (15,10)
  await waitText(/Boot Harbor/, 14000);
  await page.waitForTimeout(900);
  await advance(6); // town Mom greeting may auto-open... (event is in house; town arrival is clean) — harmless if none
  await shot('town-spawn');

  // ===== TOWN: sign (11,11) via (11,9)->(11,10) facing down =====
  await steps('ArrowUp', 1); await steps('ArrowLeft', 4); await steps('ArrowDown', 1);
  await press('Enter', 900);
  await shot('sign-read');
  note('SIGN: ' + (await bodyText()).slice(0, 240));
  await advance(6);
  // ===== Techie (9,13): stand (9,12) facing down =====
  await steps('ArrowLeft', 2); await steps('ArrowDown', 2);
  await press('Enter', 900);
  await shot('npc-techie-talk');
  note('TECHIE: ' + (await bodyText()).slice(0, 240));
  if (!/Technology|incredible/i.test(await bodyText())) { await page.waitForTimeout(1200); await press('Enter', 800); await shot('npc-techie-retry'); }
  await advance(10);
  // ===== Mom town (5,9): stand (5,10), press up (blocked=turn), Enter =====
  await steps('ArrowUp', 2); await steps('ArrowLeft', 4); // -> (5,10) facing left
  await page.keyboard.press('ArrowUp'); await page.waitForTimeout(350); // turn/step to face Mom
  await press('Enter', 900);
  await shot('npc-mom-town');
  note('MOM: ' + (await bodyText()).slice(0, 240));
  await advance(14);

  // ===== HOUSE: from ~(5,10): (6,10)->(6,8)->door (6,7) =====
  await steps('ArrowRight', 1); await steps('ArrowUp', 2); await steps('ArrowUp', 1);
  await waitText(/Your House/, 12000);
  await page.waitForTimeout(800);
  await shot('house-1f');
  // Mom house (5,8): (6,10)->(5,10)->(5,9)->blocked facing up
  await steps('ArrowLeft', 1); await steps('ArrowUp', 2);
  await press('Enter', 900);
  await shot('house-mom-heal');
  note('HOUSE MOM: ' + (await bodyText()).slice(0, 240));
  await advance(14);
  // stairs: (5,9)->(6,9)-> up x7 -> (6,2) -> up onto (6,1) exit
  await steps('ArrowRight', 1); await steps('ArrowUp', 7); await steps('ArrowUp', 1);
  await page.waitForTimeout(900);
  await shot('house-2f');
  await steps('ArrowUp', 5); // -> (6,5) clock event
  await page.waitForTimeout(700);
  await shot('house-2f-clock');
  note('CLOCK: ' + (await bodyText()).slice(0, 240));
  await advance(8);
  await steps('ArrowDown', 6); // -> (6,11) stairs down -> 1F (6,2)
  await page.waitForTimeout(800);
  await steps('ArrowDown', 8); // -> (6,10)
  await steps('ArrowDown', 1); // door (6,11) -> town (6,9)
  await waitText(/Boot Harbor/, 12000);
  await page.waitForTimeout(700);

  // ===== LAB: (6,9)->(10,9)->(10,4)->door (10,3) =====
  await steps('ArrowRight', 4); await steps('ArrowUp', 5); await steps('ArrowUp', 1);
  await waitText(/Lab/, 12000);
  await page.waitForTimeout(800);
  await shot('lab-interior');
  // Tyrage ball (6,6): enter (6,12) -> up x5 -> (6,7) facing up
  await steps('ArrowUp', 5);
  await press('Enter', 1000);
  await shot('starter-choice');
  note('CHOICE: ' + (await bodyText()).slice(0, 260));
  await chooseYes();
  await page.waitForTimeout(900);
  await shot('starter-taken');
  note('TAKEN: ' + (await bodyText()).slice(0, 220));
  await advance(10);
  // exit: down x5 -> (6,12) hex event -> battle; then down -> door
  await steps('ArrowDown', 5);
  await page.waitForTimeout(800);
  await shot('hex-event');
  await advance(6);
  if (await inBattle()) { await shot('hex-battle'); await battleLoop('hex'); }
  else note('hex battle not detected after event');
  await advance(6);
  await shot('hex-battle-end');
  await steps('ArrowDown', 1); // door (6,13) -> town (10,4)
  await waitText(/Boot Harbor/, 12000);
  await page.waitForTimeout(700);

  // ===== GATE -> ROUTE 1: (10,4)->(10,5)->(15,5)->(15,1)->exit (15,0) =====
  await steps('ArrowDown', 1); await steps('ArrowRight', 5); await steps('ArrowUp', 4); await steps('ArrowUp', 1);
  await waitText(/Route 1/, 12000);
  await page.waitForTimeout(800);
  await shot('route1-arrival');
  // wild hunt: (15,38)->(14,38)-> up x14 -> (14,24); pace L/R in grass (13,24)
  await steps('ArrowLeft', 1); await steps('ArrowUp', 14);
  let wild = false;
  for (let i = 0; i < 42 && !wild; i++) {
    await steps(i % 2 ? 'ArrowRight' : 'ArrowLeft', 1);
    if (await inBattle()) wild = true;
  }
  note('wild triggered: ' + wild);
  if (wild) { await shot('wild-battle'); await battleLoop('wild'); await shot('wild-battle-end'); }
  await advance(4);
  // after a wild battle we stand on the grass tile (13,24); if none, we are at (14,24) or (13,24)
  await shot('route-after-wild');
  // north: right -> (14,24); up x23 -> (14,1); up -> exit -> fields (14,33)
  await steps('ArrowRight', 1); await steps('ArrowUp', 23); await steps('ArrowUp', 1);
  await waitText(/Silicon Town/, 12000);
  await page.waitForTimeout(800);
  await shot('silicon-town');

  // ===== PLEX: (14,33)->(14,9)->(24,9)->(24,7)->door (24,6) =====
  await steps('ArrowUp', 24); await steps('ArrowRight', 10); await steps('ArrowUp', 2); await steps('ArrowUp', 1);
  await waitText(/MochiiPlex/, 12000);
  await page.waitForTimeout(800);
  await shot('plex-interior');
  // nurse (7,3): enter (7,10) -> up x6 -> (7,4) facing up
  await steps('ArrowUp', 6);
  await press('Enter', 900);
  await shot('plex-nurse-heal');
  note('NURSE: ' + (await bodyText()).slice(0, 240));
  if (!/MochiiPlex|tired|Rest/i.test(await bodyText())) { await page.waitForTimeout(1200); await press('Enter', 800); await shot('plex-nurse-retry'); }
  await advance(10);
  await steps('ArrowDown', 6); await steps('ArrowDown', 1); // door (7,11) -> fields (24,7)
  await waitText(/Silicon Town/, 12000);
  await page.waitForTimeout(700);

  // ===== RETURN: (24,7)->(15,7)->(15,33)->exit (15,34)->route (15,1)->(14,1)->down w/ hiker detour->exit (14,39)->town (14,1)->(15,10) =====
  await steps('ArrowLeft', 9); await steps('ArrowDown', 26); await steps('ArrowDown', 1);
  await waitText(/Route 1/, 12000);
  await page.waitForTimeout(700);
  await steps('ArrowLeft', 1); await steps('ArrowDown', 27); // -> (14,28)
  await steps('ArrowLeft', 1); await steps('ArrowDown', 3); await steps('ArrowRight', 1); // detour around Hiker (14,30) via x13
  await steps('ArrowDown', 7); await steps('ArrowDown', 1); // -> (14,38) -> exit (14,39) -> town (14,1)
  await waitText(/Boot Harbor/, 14000);
  await page.waitForTimeout(800);
  await steps('ArrowRight', 1); await steps('ArrowDown', 9); // -> (15,10)
  await shot('return-to-town');
  note('RETURNED text: ' + (await bodyText()).slice(0, 200));

  // ===== RELOAD -> CONTINUE =====
  await page.waitForTimeout(3000);
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
  note('MENU2: ' + (await bodyText()).slice(0, 200));
  if (await clickText('CONTINUE')) note('clicked CONTINUE (reload)');
  await page.waitForTimeout(900);
  await shot('slots-after-reload');
  note('SLOTS2: ' + (await bodyText()).slice(0, 220));
  await clickText('ACE');
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await shot('continue-proof');
  note('CONTINUE PROOF text: ' + (await bodyText()).slice(0, 220));
  fs.writeFileSync(SHOTS + '/p5-log.json', JSON.stringify({ log, errors }, null, 2));
  note('P5-DONE');
} catch (e) {
  note('P5-EXCEPTION: ' + e.message);
  await shot('exception');
  fs.writeFileSync(SHOTS + '/p5-log.json', JSON.stringify({ log, errors }, null, 2));
} finally {
  await ctx.close();
}
