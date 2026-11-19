// Battle captures via the PROVEN desktop load/nav flow, with CDP
// device-metrics overrides applied mid-battle to get true phone
// layouts of the same live battle (no reload, battle state kept).
// Usage: node cap-battle2.mjs <port> <tag>
import { chromium } from '/home/hatch/workspace/_mochi-ft-shots/harness/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const PORT = process.argv[2] || '4174';
const TAG = process.argv[3] || 'battle2';
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const PROFILE = '/home/hatch/workspace/_mochi-ft-shots/profile';
const OUT = `/home/hatch/workspace/_mochi-ft-shots/cont-${TAG}`;
fs.mkdirSync(OUT, { recursive: true });
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: EXE, headless: true, viewport: { width: 1280, height: 800 },
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio', '--disable-dev-shm-usage', '--renderer-process-limit=1', '--js-flags=--max-old-space-size=256'],
});
const page = ctx.pages()[0] || (await ctx.newPage());
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400)).catch(() => '');
const cdp = await ctx.newCDPSession(page);
async function shot(name) {
  try {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
    console.log('SHOT', name);
  } catch (e) { console.log('shot failed', name, String(e.message).slice(0, 100)); }
}
async function setMetrics(w, h) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true }).catch((e) => console.log('metrics failed', e.message));
  await page.waitForTimeout(1600);
}
const KEYS = { U: 'ArrowUp', D: 'ArrowDown', L: 'ArrowLeft', R: 'ArrowRight' };
async function step(dir, n = 1) { for (let i = 0; i < n; i++) { await page.keyboard.press(KEYS[dir]); await page.waitForTimeout(420); } }
async function advance(n = 1) { for (let i = 0; i < n; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(500); } }
const inBattle = async () => /WILD ENCOUNTER|SYS_BATTLE/.test(await bodyText());
try {
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  for (let i = 0; i < 30; i++) { if (/NEW GAME|CONTINUE/i.test(await bodyText())) break; await page.mouse.click(640, 400); await page.waitForTimeout(1200); }
  await page.getByText('CONTINUE', { exact: false }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.mouse.click(640, 302);
    await page.waitForTimeout(3000);
    let ok = false;
    for (let i = 0; i < 25; i++) { if (/Goal:/.test(await bodyText())) { ok = true; break; } await page.waitForTimeout(1200); }
    if (ok) break;
    console.log('slot attempt', attempt, 'failed');
  }
  await page.waitForTimeout(2000);
  console.log('WORLD:', (await bodyText()).slice(0, 140));
  await shot('01-town-desktop');
  await step('R', 5); await advance(2);
  await step('U', 6); await advance(2);
  await page.waitForTimeout(1200);
  console.log('AFTER GATE:', (await bodyText()).slice(0, 140));
  await shot('02-after-gate');
  await step('L', 1);
  await step('U', 14); await advance(2);
  await page.waitForTimeout(1000);
  await shot('03-route-grass');
  let battled = false;
  for (let i = 0; i < 40 && !battled; i++) {
    await step(i % 2 === 0 ? 'R' : 'L', 2);
    await page.waitForTimeout(600);
    if (await inBattle()) battled = true;
  }
  console.log('BATTLE REACHED:', battled);
  if (battled) {
    await page.waitForTimeout(1500);
    await shot('04-battle-desktop');
    await setMetrics(390, 844);
    await shot('05-battle-phone-portrait');
    await setMetrics(844, 390);
    await shot('06-battle-phone-landscape');
    await cdp.send('Emulation.clearDeviceMetricsOverride').catch(() => {});
    await page.waitForTimeout(1200);
    // Fight it out on desktop metrics.
    for (let turn = 0; turn < 30; turn++) {
      const t = await bodyText();
      if (/VICTORY|DEFEAT/.test(t)) { await shot('07-battle-over'); break; }
      if (!/WILD ENCOUNTER|SYS_BATTLE/.test(t)) { console.log('battle ended turn', turn); break; }
      const btn = page.locator('button', { hasText: 'PWR' }).first();
      try { await btn.click({ timeout: 2500 }); } catch { console.log('move click failed', turn); }
      await page.waitForTimeout(2200);
      if (turn === 0) await shot('07-battle-turn1');
    }
    await advance(3);
    await page.mouse.click(640, 400).catch(() => {});
    await page.waitForTimeout(1500);
    await shot('08-after-battle');
    console.log('AFTER BATTLE:', (await bodyText()).slice(0, 140));
    // North legs toward Silicon Town.
    for (let leg = 0; leg < 4; leg++) {
      await step('U', 10); await advance(2); await page.waitForTimeout(800);
      const t = await bodyText();
      console.log('NORTH LEG', leg, t.slice(0, 120));
      if (/Silicon/i.test(t)) break;
      if (await inBattle()) {
        const flee = page.locator('button', { hasText: 'FLEE' }).first();
        try { await flee.click({ timeout: 2000 }); } catch {}
        await page.waitForTimeout(2000); await advance(2);
      }
    }
    await shot('09-north-end');
  }
  console.log('DONE', OUT);
} finally {
  await ctx.close().catch(() => {});
}
