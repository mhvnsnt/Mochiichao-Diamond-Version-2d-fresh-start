// drive-ingame.cjs — IN-GAME proof for the rebuilt payoff presentation.
// Drives the REAL game (this tree's production build, served on
// 127.0.0.1:4319 — the origin the shared Playwright profile's save
// belongs to) through a real wild battle in WorldEngine, using the
// game's own save file (mochii_saves_1, the format saveSystem.ts
// writes) edited the way the sequence-build drivers edit it: plant
// the player on Route 1 and set the lead mon's EXP a few points
// below its next level boundary (engine curve: total for level L is
// L^3 — lib/engine.ts getExpNeeded / lib/battlePayoff.ts
// expTotalForLevel), so the first faint plays the full ritual:
// EXP text -> databox gauge sweep -> level-up -> stat window ->
// resume. Screenshots are captures of the real battle screen.
const { chromium } = require('/home/hatch/workspace/menu-parity-work/tree/node_modules/playwright');
const fs = require('fs');
const OUT = '/home/hatch/workspace/battle-payoff/proof-ingame-run6';
const LOGF = OUT + '/drive.log';
fs.mkdirSync(OUT, { recursive: true });
const LOG = [];
const log = (...a) => { const s = a.join(' '); LOG.push(s); console.log(s); fs.writeFileSync(LOGF, LOG.join('\n')); };

(async () => {
  const ctx = await chromium.launchPersistentContext('/home/hatch/workspace/battle-payoff/pw-profile-proof', {
    executablePath: '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
    viewport: { width: 1280, height: 800 },
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => log('PAGEERROR:', String(e).slice(0, 200)));
  const text = async () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')).catch(() => '');
  const press = async (k, w = 500) => { await page.keyboard.press(k); await page.waitForTimeout(w); };
  const shot = async name => { await page.screenshot({ path: `${OUT}/${name}.png` }); log('shot', name); };
  const waitFor = async (re, timeout = 45000, tag = '') => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (re.test(await text())) return true;
      await page.waitForTimeout(200);
    }
    log('TIMEOUT waiting', tag, re);
    return false;
  };

  await page.goto('http://127.0.0.1:4319/', { waitUntil: 'load', timeout: 60000 }).catch(e => log('goto err', String(e).slice(0, 120)));
  await page.waitForTimeout(3500);

  // Seed via the game's own save slot (same edit pattern as the
  // sequence-build drivers): Route 1, healed party, lead mon EXP set
  // to (level+1)^3 - 5 so any real award crosses exactly one level
  // boundary during the first faint's payoff.
  const seeded = await page.evaluate(() => {
    const raw = localStorage.getItem('mochii_saves_1');
    if (!raw) return { ok: false, why: 'no save' };
    const saves = JSON.parse(raw);
    const entries = Array.isArray(saves) ? saves : [saves];
    const s = entries[0];
    if (!s || !s.data) return { ok: false, why: 'bad shape' };
    // Patch EVERY save entry: which entry the slot menu loads is
    // its own choice (run 5 clicked into the start-over dialog for
    // one entry while another carried the damaged party).
    for (const e of entries) {
      if (!e || !e.data) continue;
      e.data.currentMap = 'route_1';
      e.data.playerPos = { x: 13, y: 25 };
      if (Array.isArray(e.data.completedEvents) && !e.data.completedEvents.includes('hex_battle_event')) e.data.completedEvents.push('hex_battle_event');
      (e.data.party || []).forEach(p => { p.hp = p.maxHp; if (typeof p.currentHp === 'number') p.currentHp = p.maxHp; });
      const l0 = (e.data.party || [])[0];
      if (l0) l0.experience = Math.pow(l0.level + 1, 3) - 5;
    }
    s.data.party.forEach(p => { p.hp = p.maxHp; if (typeof p.currentHp === 'number') p.currentHp = p.maxHp; });
    const lead = s.data.party[0];
    const nextTotal = Math.pow(lead.level + 1, 3);
    lead.experience = nextTotal - 5;
    localStorage.setItem('mochii_saves_1', JSON.stringify(saves));
    // The battle copy's HP does NOT come from the save slot alone:
    // runs 3-4 started at 3/22 HP because another storage copy kept
    // the damaged party. Heal + set the lead's EXP in EVERY
    // localStorage value that carries party-shaped data.
    const patchedKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === 'mochii_saves_1') continue;
      try {
        const v = JSON.parse(localStorage.getItem(k));
        let touched = false;
        const walk = (o) => {
          if (!o || typeof o !== 'object') return;
          if (Array.isArray(o)) { o.forEach(walk); return; }
          if (typeof o.speciesId === 'string' && typeof o.maxHp === 'number' && typeof o.hp === 'number') {
            o.hp = o.maxHp; if (typeof o.currentHp === 'number') o.currentHp = o.maxHp; touched = true;
            if (o.speciesId === lead.speciesId && typeof o.experience === 'number' && typeof o.level === 'number') {
              o.experience = Math.pow(o.level + 1, 3) - 5;
            }
          }
          Object.values(o).forEach(walk);
        };
        walk(v);
        if (touched) { localStorage.setItem(k, JSON.stringify(v)); patchedKeys.push(k); }
      } catch { /* non-JSON value: not game state */ }
    }
    return { ok: true, lead: `${lead.speciesId} Lv.${lead.level} exp ${lead.experience}/${nextTotal}`, party: s.data.party.length, patchedKeys, allKeys: Object.keys(localStorage) };
  });
  log('SEED:', JSON.stringify(seeded));
  if (!seeded.ok) { await ctx.close(); process.exit(2); }

  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(4500);
  // Title/load flow: advance to the SLOT 1 entry and click it.
  for (let i = 0; i < 10; i++) { if (/SLOT 1/.test(await text())) break; await press('Enter', 1000); }
  const slot = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div, button, span')].filter(e => /SLOT 1/.test(e.textContent || ''));
    els.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.width * ra.height - rb.width * rb.height; });
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (slot) await page.mouse.click(slot.x, slot.y);
  await page.waitForTimeout(1000);
  // The slot menu may answer with a start-over dialog (run 5):
  // always take LOAD THIS SAVE INSTEAD when it appears.
  for (let i = 0; i < 6; i++) {
    const t = await text();
    if (/LOAD THIS SAVE INSTEAD/i.test(t)) {
      const c = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /LOAD THIS SAVE INSTEAD/i.test(e.textContent || '')); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      if (c) { await page.mouse.click(c.x, c.y); log('clicked LOAD THIS SAVE INSTEAD'); }
      break;
    }
    if (/CR Team/.test(t)) break;
    await page.waitForTimeout(600);
  }
  for (let i = 0; i < 14; i++) { if (/CR Team/.test(await text())) break; await press('Enter', 900); }
  log('IN WORLD HUD:', /CR Team/.test(await text()));

  // Walk into the tall-grass patch and pace inside it until a wild
  // battle fires (the game's own step encounter check: tile === 6
  // && Math.random() < 0.15 per grass step, WorldEngine ~line 837).
  // Route 1's tile-6 patch sits at y=18-20, x=8-19 (map data); the
  // plant point (13,25) is on the path south of it. Run 1 of this
  // driver cycled four directions on the path and never landed on a
  // grass tile — BATTLE FIRED: false; this entry is the fix.
  const inBattle = async () => /WILD ENCOUNTER/.test(await text());
  let battle = false;
  for (let i = 0; i < 6 && !battle; i++) { await press('ArrowUp', 380); battle = await inBattle(); }
  await shot('00b-in-grass');
  const pace = ['ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowLeft'];
  for (let step = 0; step < 320 && !battle; step++) {
    await press(pace[step % 4], 300);
    battle = await inBattle();
  }
  log('BATTLE FIRED:', battle);
  if (!battle) { await shot('00-no-battle'); await ctx.close(); process.exit(3); }
  await page.waitForTimeout(1200);
  await shot('01-foe-faint-before'); // battle in progress (pre-faint scene state)

  // Fight: click the first move whenever the command menu is up;
  // watch for the payoff beats and capture them in situ.
  const moveButtons = async () => page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(t => t && !/FLEE|CUBE|BAG|PARTY|BACK|Mend/i.test(t)));
  const gaugePct = async () => page.evaluate(() => {
    // The player databox EXP gauge: the sky-blue fill in the
    // databox row labelled EXP (WorldEngine player billboard).
    const spans = [...document.querySelectorAll('span')].filter(e => (e.textContent || '').trim() === 'EXP');
    if (!spans.length) return null;
    const row = spans[0].parentElement;
    const fill = row ? row.querySelector('div > div') : null;
    return fill ? fill.style.width : null;
  });
  let payoffSeen = false, gaugeShot = false, levelShot = false, diffShot = false, trueShot = false;
  // Fast watch: poll the page text every ~120 ms so the short beats
  // (EXP text 700 ms, first sweep ~160 ms, second sweep ~200-400 ms)
  // are actually caught — run 2's 1 s loop missed both.
  const burst = async (tag, n = 7, gap = 120) => { for (let i = 0; i < n; i++) { await shot(`${tag}${i}`); await page.waitForTimeout(gap); } };
  const t0 = Date.now();
  let burstDone = false;
  while (Date.now() - t0 < 240000) {
    const body = await text();
    const statMode = await page.evaluate(() => { const el = document.querySelector('[data-payoff-stat-window]'); return el ? el.getAttribute('data-payoff-stat-mode') : null; }).catch(() => null);
    if (body.includes('Exp. Points!') && !payoffSeen) {
      payoffSeen = true; log('PAYOFF TEXT at', Date.now() - t0, 'ms; gauge:', await gaugePct());
      await shot('02-exp-text-battle-visible');
      // The sweep is running right now: burst-capture the databox.
      await burst('03-gauge-sweep-burst-');
      gaugeShot = true;
    }
    if (body.includes('grew to Lv.') && !levelShot) { await shot('04-level-up-message'); levelShot = true; }
    if (statMode === 'diff' && !diffShot) { await page.waitForTimeout(200); await shot('05-stat-window-diffs-over-battle'); diffShot = true; await press('Enter', 600); continue; }
    if (statMode === 'true' && diffShot && !trueShot) {
      await page.waitForTimeout(200); await shot('06-stat-window-values-over-battle'); trueShot = true;
      // The final gauge segment starts the moment this press lands:
      // burst to catch it mid-sweep in the databox.
      await press('Enter', 60);
      if (!burstDone) { burstDone = true; await burst('07-gauge-final-sweep-burst-'); }
      continue;
    }
    if (payoffSeen && trueShot && /VICTORY!/.test(body)) { await shot('08-victory-banner'); break; }
    if (payoffSeen && trueShot && !/WILD ENCOUNTER/.test(body) && statMode === null) { await shot('08-victory-banner'); break; }
    if ((Date.now() - t0) % 15000 < 200) log('STATUS:', body.slice(0, 160));
    if (body.includes('DEFEAT!')) { log('DEFEAT banner - clicking Continue and ending attempt'); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /Continue/.test(e.textContent || '')); if (b) b.click(); }).catch(() => {}); await page.waitForTimeout(1200); break; }
    const moves = await moveButtons();
    const moveBtn = moves.find(t => /PWR/.test(t));
    if (moveBtn) {
      const clicked = await page.evaluate(want => {
        const els = [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null && (e.textContent || '').replace(/\\s+/g, ' ').trim() === want);
        if (!els.length) return null;
        const r = els[0].getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, moveBtn).catch(() => null);
      if (clicked) { await page.mouse.click(clicked.x, clicked.y); log('clicked move:', moveBtn.slice(0, 40)); await page.waitForTimeout(350); continue; }
    }
    await page.waitForTimeout(140);
  }
  await shot('10-final-state');
  log('FINAL BODY:', (await text()).slice(0, 300));
  log('BEATS:', JSON.stringify({ payoffSeen, gaugeShot, levelShot, diffShot, trueShot }));
  // Resume to the world if the victory banner is up.
  if (/VICTORY!/.test(await text())) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /Continue/.test(e.textContent || '')); if (b) b.click(); }).catch(() => {});
    await page.waitForTimeout(1800);
    await shot('09-world-resumed');
    log('WORLD RESUMED:', /CR Team/.test(await text()));
  }
  await ctx.close();
  log('DONE');
})().catch(e => { console.error('FAIL', String(e).slice(0, 400)); process.exit(1); });
