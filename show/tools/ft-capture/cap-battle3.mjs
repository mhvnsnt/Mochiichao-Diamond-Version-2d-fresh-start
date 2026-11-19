// Micro-navigation: CONTINUE, probe position via F5 save, run a short action list, screenshot.
// Usage: node play-nav.mjs "U,U,L,E,W:1200,S:tag" [outdir-tag]
import { chromium } from '/home/hatch/workspace/_mochi-ft-shots/harness/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const PROFILE = '/home/hatch/workspace/_mochi-ft-shots/profile';
const OUT = '/home/hatch/workspace/_mochi-ft-shots/nav';
fs.mkdirSync(OUT, { recursive: true });
const actions = (process.argv[2] || '').split(',').filter(Boolean);
const tag = process.argv[3] || 'nav';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: EXE, headless: true, viewport: { width: 1280, height: 800 },
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio', '--disable-dev-shm-usage', '--js-flags=--max-old-space-size=256'],
});
const page = ctx.pages()[0] || (await ctx.newPage());
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
let shotN = 0;
async function shot(name) {
  try {
    const cdp = await ctx.newCDPSession(page);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(`${OUT}/${tag}-${name}.png`, Buffer.from(data, 'base64'));
    await cdp.detach().catch(() => {});
    console.log('SHOT', name);
  } catch (e) { console.log('shot failed', name, e.message); }
}
const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)).catch(() => '');
async function clickText(txt) {
  const loc = page.getByText(txt, { exact: false }).first();
  try { await loc.click({ timeout: 6000 }); console.log('clicked', JSON.stringify(txt)); return true; }
  catch { return false; }
}
async function probe(label) {
  await page.keyboard.press('F5'); await page.waitForTimeout(1200);
  const pos = await page.evaluate(() => {
    for (let s = 1; s <= 3; s++) {
      try {
        const raw = localStorage.getItem('mochii_saves_' + s);
        if (!raw) continue;
        const arr = JSON.parse(raw);
        const last = arr[arr.length - 1];
        if (last?.data) return { slot: s, map: last.data.currentMap, pos: last.data.playerPos, type: last.type, ts: last.timestamp, party: (last.data.party || []).length };
      } catch {}
    }
    return null;
  }).catch(() => null);
  console.log('PROBE', label, JSON.stringify(pos));
  return pos;
}
try {
  await page.goto(`http://127.0.0.1:${process.env.PORT || '4173'}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  for (let i = 0; i < 30; i++) { if (/NEW GAME|CONTINUE/i.test(await bodyText())) break; await page.mouse.click(640, 400); await page.waitForTimeout(1200); }
  for (let attempt = 0; attempt < 3; attempt++) {
    await clickText('CONTINUE');
    await page.waitForTimeout(1500);
    let ok = false;
    for (let i = 0; i < 10; i++) { if (/SELECT A SAVE FILE/.test(await bodyText())) { ok = true; break; } await page.waitForTimeout(1000); }
    if (ok) break;
    console.log('CONTINUE attempt', attempt, 'did not reach slots');
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.mouse.click(640, 302); // SLOT 1 row (LOAD)
    await page.waitForTimeout(3000);
    let ok = false;
    for (let i = 0; i < 25; i++) {
      if (/Goal:/.test(await bodyText())) { ok = true; break; }
      if (i === 10 && /SELECT A SAVE FILE/.test(await bodyText())) { await page.keyboard.press('Enter'); console.log('enter assist on slots'); }
      await page.waitForTimeout(1200);
    }
    if (ok) break;
    console.log('slot-load attempt', attempt, 'did not reach world');
    if (!/SELECT A SAVE FILE/.test(await bodyText())) break;
  }
  await page.waitForTimeout(2500);
  await shot('start');
  await probe('start');
  const KEYS = { U: 'ArrowUp', D: 'ArrowDown', L: 'ArrowLeft', R: 'ArrowRight' };
  for (const a of actions) {
    if (KEYS[a]) { await page.keyboard.press(KEYS[a]); await page.waitForTimeout(700); }
    else if (a === 'E') { await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
    else if (a === 'YES') { await clickText('YES'); await page.waitForTimeout(900); }
    else if (a.startsWith('W:')) { await page.waitForTimeout(parseInt(a.slice(2), 10) || 1000); }
    else if (a.startsWith('A:')) { const n = parseInt(a.slice(2), 10) || 1; for (let i = 0; i < n; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(800); } }
    else if (a.startsWith('S:')) { await shot(a.slice(2)); }
    else if (a.startsWith('C:')) { const [cx, cy] = a.slice(2).split(':').map(Number); await page.mouse.click(cx, cy); console.log('clicked at', cx, cy); await page.waitForTimeout(700); }
    else if (a === 'BATTLECAP') {
      // phone-aspect captures of the live battle via CDP metrics override
      const cdp2 = await ctx.newCDPSession(page);
      const snap = async (name) => { const { data } = await cdp2.send('Page.captureScreenshot', { format: 'png', fromSurface: true }); fs.writeFileSync(`${OUT}/${tag}-${name}.png`, Buffer.from(data, 'base64')); console.log('SHOT', name); };
      await snap('battle-desktop');
      await cdp2.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true }); await page.waitForTimeout(1600); await snap('battle-phone-portrait');
      await cdp2.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true }); await page.waitForTimeout(1600); await snap('battle-phone-landscape');
      await cdp2.send('Emulation.clearDeviceMetricsOverride'); await page.waitForTimeout(1200);
      await cdp2.detach().catch(() => {});
    }
    else if (a === 'FIGHT2') {
      for (let t = 0; t < 30; t++) {
        const bt = await bodyText();
        if (/VICTORY|DEFEAT/.test(bt)) break;
        if (!/WILD ENCOUNTER|SYS_BATTLE/.test(bt) && t > 1) break;
        const btn = page.locator('button', { hasText: 'PWR' }).first();
        try { await btn.click({ timeout: 2500 }); } catch { console.log('FIGHT2 click failed', t); }
        await page.waitForTimeout(2200);
      }
    }
    else if (a === 'PACE') {
      // pace grass L/R until a wild battle starts (max ~40 paces)
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press(i % 2 === 0 ? 'ArrowRight' : 'ArrowLeft'); await page.waitForTimeout(700);
        await page.keyboard.press(i % 2 === 0 ? 'ArrowRight' : 'ArrowLeft'); await page.waitForTimeout(700);
        if (/WILD ENCOUNTER|SYS_BATTLE/.test(await bodyText())) { console.log('PACE battle at', i); break; }
      }
    }
    else if (a === 'FIGHT') {
      // battle loop: click FIGHT then first move, repeat until battle UI gone
      for (let t = 0; t < 40; t++) {
        const bt = await bodyText();
        if (/got away|fainted|won|victory|blacked out/i.test(bt)) { await page.keyboard.press('Enter'); await page.waitForTimeout(1000); }
        const inB = await page.evaluate(() => /FIGHT|BAG|RUN/.test(document.body.innerText) && !!document.querySelector('canvas')).catch(() => false);
        if (!inB && t > 2) break;
        await clickText('FIGHT'); await page.waitForTimeout(700);
        // first move button: click any button containing 'Lv' move-ish text fallback: press Enter
        await page.keyboard.press('Enter'); await page.waitForTimeout(1600);
      }
    }
  }
  await shot('end');
  await probe('end');
  console.log('END-TEXT', (await bodyText()).slice(0, 220));
} catch (e) { console.log('NAV-EXCEPTION:', e.message); await shot('exception'); }
await ctx.close().catch(() => {});
process.exit(0);
