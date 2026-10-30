const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE, viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(e => console.log('goto err', String(e).slice(0,100)));
  await page.waitForTimeout(5000);
  console.log('TEXT:', (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => 'EVAL FAIL')).slice(0, 400));
  await page.screenshot({ path: 'proof/debug-state.png', timeout: 30000 }).catch(e => console.log('shot err'));
  console.log('DONE');
  await ctx.close();
})().catch(e => { console.log('FAILED', String(e).slice(0, 200)); process.exit(1); });
