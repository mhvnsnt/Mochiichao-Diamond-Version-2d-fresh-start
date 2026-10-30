// Settings flip proof v4 (2026-10-30): keyboard-driven Settings.
// VISUAL STYLE is row index 6 on the main Settings list. Cycle with
// ArrowLeft/Right, confirm the row's value text changes, exit via
// the exact "SAVE + BACK TO MAIN MENU" button, verify localStorage.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
const URL = 'http://127.0.0.1:4399/';

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
}
async function domClick(page, re, label, maxLen = 44) {
  const r = await page.evaluate(({ src, maxLen }) => {
    const rx = new RegExp(src, 'i');
    const els = [...document.querySelectorAll('button, [role="button"], div, span, a')]
      .filter(e => rx.test((e.textContent || '').trim()) && (e.textContent || '').trim().length <= maxLen && e.getBoundingClientRect().width > 0);
    els.sort((a, b) => (a.textContent || '').trim().length - (b.textContent || '').trim().length);
    if (!els.length) return null;
    els[0].click();
    return els[0].textContent.trim();
  }, { src: re.source, maxLen }).catch(() => null);
  console.log('domClick', label, '->', r || 'NOT FOUND');
  return r;
}
async function loadSlotIntoWorld(page) {
  for (let i = 0; i < 25; i++) {
    const t = await bodyText(page);
    if (/SLOT 1/.test(t)) break;
    if (/ARE YOU A BOY/i.test(t)) throw new Error('new-game flow');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
  }
  await domClick(page, /SLOT 1/, 'slot');
  await page.waitForTimeout(1000);
  for (let i = 0; i < 10; i++) {
    const t = await bodyText(page);
    if (/Goal:/.test(t)) break;
    if (/start over in slot/i.test(t)) { await domClick(page, /load this save/i, 'load-save'); await page.waitForTimeout(1500); continue; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(3000);
  console.log('IN WORLD:', /Goal:/.test(await bodyText(page)));
}
async function styleRowValue(page) {
  return page.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const m = t.match(/VISUAL STYLE\s*(.{0,60})/i);
    return m ? m[1].slice(0, 60) : null;
  });
}
async function flipTo(page, key, shotName) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await domClick(page, /quit to title/i, 'quit');
  await page.waitForTimeout(2500);
  for (let i = 0; i < 8; i++) {
    const t = await bodyText(page);
    if (/CONTINUE/.test(t) && /SETTINGS/.test(t)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }
  await domClick(page, /^SETTINGS$/, 'settings-panel', 12);
  await page.waitForTimeout(2000);
  console.log('SETTINGS VISIBLE:', /VISUAL STYLE/i.test(await bodyText(page)));
  console.log('row before:', await styleRowValue(page));
  for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(250); }
  await page.keyboard.press(key);
  await page.waitForTimeout(700);
  console.log('row after', key, ':', await styleRowValue(page));
  await domClick(page, /SAVE \+ BACK/i, 'save-back', 30);
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('mochiichao_settings_v1') || '{}').visualStyle);
  console.log('persisted visualStyle =', s);
  await domClick(page, /^CONTINUE$/, 'continue', 12);
  await page.waitForTimeout(1500);
  await loadSlotIntoWorld(page);
  await page.screenshot({ path: `${OUT}/${shotName}`, timeout: 90000 });
  console.log('SHOT', shotName);
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE, viewport: { width: 1440, height: 1050 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const rawSave = localStorage.getItem('mochii_saves_1');
    const v = JSON.parse(rawSave);
    const slot = Array.isArray(v) ? v[0] : v;
    slot.data.currentMap = 'sector0';
    slot.data.playerPos = { x: 15, y: 18 };
    localStorage.setItem('mochii_saves_1', JSON.stringify(v));
    const raw = localStorage.getItem('mochiichao_settings_v1');
    const s = raw ? JSON.parse(raw) : {};
    s.visualStyle = 'GEN5';
    localStorage.setItem('mochiichao_settings_v1', JSON.stringify(s));
  });
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(4000);
  await loadSlotIntoWorld(page);
  await page.screenshot({ path: `${OUT}/flip-1-gen5-3d.png`, timeout: 90000 });
  console.log('SHOT flip-1 (GEN5 3D)');
  await flipTo(page, 'ArrowLeft', 'flip-2-gen4-2d.png');
  await flipTo(page, 'ArrowRight', 'flip-3-gen5-3d.png');
  await ctx.close();
  console.log('FLIP DONE');
})().catch(e => { console.log('FAILED:', String(e).slice(0, 200)); process.exit(1); });
