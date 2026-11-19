// Flicker frame-sequence capture (resilient version): load the ACE
// save to the world, then capture N frames at 300ms intervals (the
// animTick period). Per-shot errors are logged, not fatal; if the
// renderer target dies, the browser is relaunched once and the world
// reloaded. Usage: node cap-frames.mjs <port> <tag> [frames]
import { chromium } from '/home/hatch/workspace/_mochi-ft-shots/harness/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const PORT = process.argv[2] || '4173';
const TAG = process.argv[3] || 'frames';
const N = parseInt(process.argv[4] || '10', 10);
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const PROFILE = '/home/hatch/workspace/_mochi-ft-shots/profile';
const OUT = `/home/hatch/workspace/_mochi-ft-shots/cont-${TAG}`;
fs.mkdirSync(OUT, { recursive: true });

async function launch() {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: EXE, headless: true, viewport: { width: 1024, height: 640 },
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--mute-audio', '--disable-dev-shm-usage', '--renderer-process-limit=1', '--js-flags=--max-old-space-size=256'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  return { ctx, page };
}
async function toWorld(page) {
  const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)).catch(() => '');
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  for (let i = 0; i < 30; i++) { if (/NEW GAME|CONTINUE/i.test(await bodyText())) break; await page.mouse.click(512, 320); await page.waitForTimeout(1200); }
  await page.getByText('CONTINUE', { exact: false }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.mouse.click(512, 241);
    await page.waitForTimeout(3000);
    let ok = false;
    for (let i = 0; i < 25; i++) { if (/Goal:/.test(await bodyText())) { ok = true; break; } await page.waitForTimeout(1200); }
    if (ok) return true;
  }
  return false;
}
let { ctx, page } = await launch();
console.log('world reached:', await toWorld(page));
await page.waitForTimeout(2000);
let got = 0;
for (let i = 0; i < N; i++) {
  const name = `f${String(i).padStart(2, '0')}.png`;
  try {
    await page.screenshot({ path: `${OUT}/${name}`, timeout: 20000 });
    got++;
    console.log('SHOT', name);
  } catch (e) {
    console.log('shot failed', name, String(e.message).slice(0, 120));
    try { await ctx.close(); } catch {}
    if (i < N - 1) {
      try {
        ({ ctx, page } = await launch());
        console.log('relaunched; world reached:', await toWorld(page));
        await page.waitForTimeout(1500);
      } catch (e2) { console.log('relaunch failed:', String(e2.message).slice(0, 120)); break; }
    }
  }
  await page.waitForTimeout(300).catch(() => {});
}
console.log('frames captured', got, '/', N, '->', OUT);
await ctx.close().catch(() => {});
