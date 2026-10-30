// Final proof captures (2026-10-30): water-animation frame pair at
// Boot Harbor spawn + the plaza frame with the lab/houses in view.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
const URL = 'http://127.0.0.1:4399/';

async function loadAt(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const rawSave = localStorage.getItem('mochii_saves_1');
    const v = JSON.parse(rawSave);
    const slot = Array.isArray(v) ? v[0] : v;
    slot.data.currentMap = 'sector0';
    slot.data.playerPos = { x, y };
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
  }, { x, y });
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(4000);
  let slotSeen = false;
  for (let i = 0; i < 25 && !slotSeen; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/SLOT 1/.test(t)) { slotSeen = true; break; }
    if (/ARE YOU A BOY/i.test(t)) throw new Error('new-game flow');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
  const slotEl = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div, button, span')].filter(e => /SLOT 1/.test(e.textContent || ''));
    els.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.width * ra.height - rb.width * rb.height; });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }).catch(() => null);
  if (slotEl) await page.mouse.click(slotEl.x, slotEl.y);
  await page.waitForTimeout(1000);
  for (let i = 0; i < 8; i++) {
    const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
    if (/Goal:/.test(t)) break;
    if (/start over in slot/i.test(t)) {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button, [role="button"], div, span')]
          .filter(e => /load this save/i.test(e.textContent || '') && (e.textContent || '').trim().length < 40);
        btns.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        if (btns.length) btns[0].click();
      });
      await page.waitForTimeout(1500);
      continue;
    }
    if (/ARE YOU A BOY/i.test(t)) throw new Error('new-game flow (2)');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(3000);
  console.log('LOADED AT', x, y);
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE,
    viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const raw = localStorage.getItem('mochiichao_settings_v1');
    const s = raw ? JSON.parse(raw) : {};
    s.visualStyle = 'GEN5';
    localStorage.setItem('mochiichao_settings_v1', JSON.stringify(s));
  });

  await loadAt(page, 15, 18);
  await page.screenshot({ path: `${OUT}/water-a.png`, timeout: 90000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/water-b.png`, timeout: 90000 });
  console.log('SHOT water pair');

  await loadAt(page, 15, 10);
  await page.screenshot({ path: `${OUT}/boot-harbor-3d-plaza.png`, timeout: 90000 });
  console.log('SHOT plaza');
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.log('FAILED:', String(e).slice(0, 200)); process.exit(1); });
