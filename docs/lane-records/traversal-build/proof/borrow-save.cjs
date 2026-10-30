const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const fs = require('fs');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const src = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', { executablePath: EXE, viewport: { width: 1440, height: 900 }, args: ['--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'] });
      const sp = src.pages()[0] || await src.newPage();
      await sp.goto('http://127.0.0.1:4399/', { waitUntil: 'load', timeout: 60000 }).catch(() => {});
      await sp.waitForTimeout(3000);
      const rawSave = await sp.evaluate(() => localStorage.getItem('mochii_saves_1')).catch(() => null);
      await src.close();
      if (rawSave) {
        fs.writeFileSync('/home/hatch/workspace/traversal-build/scratch/save-fixture.json', rawSave);
        console.log('FIXTURE WRITTEN', rawSave.length, 'bytes, attempt', attempt);
        return;
      }
      console.log('attempt', attempt, ': save null');
    } catch (e) { console.log('attempt', attempt, 'err', String(e).slice(0, 120)); }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.error('BORROW FAILED');
  process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
