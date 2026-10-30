const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const src = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const sp = src.pages()[0] || await src.newPage();
  await sp.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await sp.waitForTimeout(2500);
  const rawSave = await sp.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
  await src.close();
  console.log('SAVE:', !!rawSave);
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-flow', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)));
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.evaluate((raw) => localStorage.setItem('mochii_saves_1', raw), rawSave);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(3000);
  for (let i = 0; i < 22; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 160)).catch(() => '');
    console.log(`STEP ${i}:`, t);
    if (/MochiiMind|MOCHIIMIND/i.test(t)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: '/home/hatch/workspace/traversal-build/proof/probe-flow.png' });
  await ctx.close();
})().catch(e => { console.error('FLOW FAIL', e); process.exit(1); });
