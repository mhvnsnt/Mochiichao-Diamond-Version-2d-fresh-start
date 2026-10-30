const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/traversal-build/pw-profile-probe', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), ':', m.text().slice(0, 200)); });
  page.on('requestfailed', r => console.log('REQFAIL:', r.url().slice(-80), r.failure()?.errorText));
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(e => console.log('GOTO ERR', String(e).slice(0, 120)));
  await page.waitForTimeout(6000);
  const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)).catch(() => 'eval-fail');
  console.log('TEXT:', t);
  await page.screenshot({ path: '/home/hatch/workspace/traversal-build/proof/probe-page.png' });
  await ctx.close();
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
