// Settings flip proof v2 (2026-10-30): Settings lives on the title
// main menu in this build. Route per flip: world -> pause -> Quit to
// Title -> main menu -> SETTINGS -> cycle VISUAL STYLE -> Back ->
// CONTINUE -> slot -> world. Persistence read after each cycle.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const EXE = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = '/home/hatch/workspace/world-3d/proof';
const URL = 'http://127.0.0.1:4399/';

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
}
async function clickText(page, re, label, maxLen = 40) {
  const p = await page.evaluate(({ src, maxLen }) => {
    const rx = new RegExp(src, 'i');
    const els = [...document.querySelectorAll('button, [role="button"], div, span, a')]
      .filter(e => rx.test((e.textContent || '').trim()) && (e.textContent || '').trim().length < maxLen);
    els.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return ra.width * ra.height - rb.width * rb.height;
    });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: els[0].textContent.trim() };
  }, { src: re.source, maxLen }).catch(() => null);
  console.log('click', label, '->', p ? p.t : 'NOT FOUND');
  if (p) await page.mouse.click(p.x, p.y);
  return !!p;
}
async function loadSlotIntoWorld(page) {
  for (let i = 0; i < 25; i++) {
    const t = await bodyText(page);
    if (/SLOT 1/.test(t)) break;
    if (/ARE YOU A BOY/i.test(t)) throw new Error('new-game flow');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
  }
  await clickText(page, /SLOT 1/, 'slot');
  await page.waitForTimeout(1000);
  for (let i = 0; i < 10; i++) {
    const t = await bodyText(page);
    if (/Goal:/.test(t)) break;
    if (/start over in slot/i.test(t)) { await clickText(page, /load this save/i, 'load-save'); await page.waitForTimeout(1500); continue; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(3000);
  console.log('IN WORLD:', /Goal:/.test(await bodyText(page)));
}
async function quitToMainMenu(page) {
  await clickText(page, /^menu$/i, 'hud-menu');
  await page.waitForTimeout(1500);
  await clickText(page, /quit to title/i, 'quit');
  await page.waitForTimeout(2500);
  // title phase: advance to main menu
  for (let i = 0; i < 8; i++) {
    const t = await bodyText(page);
    if (/SETTINGS/.test(t) && /CONTINUE|NEW GAME/.test(t)) break;
    await page.keyboard.press('Enter');
    await page.mouse.click(720, 450);
    await page.waitForTimeout(1000);
  }
  const t = await bodyText(page);
  console.log('MAIN MENU:', /SETTINGS/.test(t), '|', t.slice(0, 160));
}
async function openSettingsFromMenu(page) {
  await clickText(page, /^SETTINGS$/, 'settings-panel', 12);
  await page.waitForTimeout(2000);
  console.log('SETTINGS VISIBLE:', /VISUAL STYLE/i.test(await bodyText(page)));
}
async function cycleStyle(page, dir) {
  const done = await page.evaluate((d) => {
    const all = [...document.querySelectorAll('div, span')];
    const label = all.find(e => (e.textContent || '').trim() === 'VISUAL STYLE');
    if (!label) return 'no-label';
    let row = label;
    for (let k = 0; k < 6 && row; k++) {
      row = row.parentElement;
      if (row && row.querySelectorAll('button').length >= 2) break;
    }
    if (!row) return 'no-row';
    const btns = [...row.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0);
    if (btns.length < 2) return 'few-btns:' + btns.length;
    const b = d > 0 ? btns[btns.length - 1] : btns[0];
    b.click();
    return 'clicked:(' + (b.textContent || '').trim() + ')';
  }, dir).catch(e => 'err:' + e);
  console.log('cycle', dir, '->', done);
  await page.waitForTimeout(800);
  const t = await bodyText(page);
  const m = t.match(/GEN\s*[0-9]/i);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('mochiichao_settings_v1') || '{}').visualStyle);
  console.log('row shows:', m && m[0], '| persisted visualStyle =', s);
  return s;
}
async function settingsBack(page) {
  await clickText(page, /back/i, 'settings-back', 24);
  await page.waitForTimeout(1500);
  console.log('BACK AT MENU:', /SETTINGS/.test(await bodyText(page)));
}
async function continueToWorld(page) {
  await clickText(page, /^CONTINUE$/, 'continue', 12);
  await page.waitForTimeout(1500);
  await loadSlotIntoWorld(page);
}

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/env-pullin-hgss-bw2/pw-profile', {
    executablePath: EXE, viewport: { width: 1440, height: 900 },
    args: ['--mute-audio', '--disable-dev-shm-usage', '--use-angle=swiftshader'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 160)));
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  // ensure start state: sector0 spawn + GEN5
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

  await quitToMainMenu(page);
  await openSettingsFromMenu(page);
  await cycleStyle(page, -1);
  await settingsBack(page);
  await continueToWorld(page);
  await page.screenshot({ path: `${OUT}/flip-2-gen4-2d.png`, timeout: 90000 });
  console.log('SHOT flip-2 (GEN4 2D)');

  await quitToMainMenu(page);
  await openSettingsFromMenu(page);
  await cycleStyle(page, +1);
  await settingsBack(page);
  await continueToWorld(page);
  await page.screenshot({ path: `${OUT}/flip-3-gen5-3d.png`, timeout: 90000 });
  console.log('SHOT flip-3 (GEN5 3D again)');
  await ctx.close();
  console.log('FLIP DONE');
})().catch(e => { console.log('FAILED:', String(e).slice(0, 200)); process.exit(1); });
