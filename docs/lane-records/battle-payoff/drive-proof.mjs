/**
 * Headless proof driver: opens the payoff proof harness in Chromium,
 * lets the REAL sequence run (rAF gauge sweeps, real timers), presses
 * Enter at the press-gated stat windows like a player would, and
 * screenshots the beats. Output: ~/workspace/battle-payoff/proof/*.png
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = '/home/hatch/workspace/battle-payoff/proof';
mkdirSync(OUT, { recursive: true });
const URL = 'http://localhost:5199/payoff-proof.html';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto(URL);

const shot = async name => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };
const text = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ');
const waitFor = async (substr, timeout = 30000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if ((await text()).includes(substr)) return true;
    await page.waitForTimeout(120);
  }
  throw new Error('timeout waiting for: ' + substr + '\nBODY: ' + (await text()));
};

// 1-2: EXP message + gauge filling (first sweep is a full level span).
await waitFor('Exp. Points!');
await page.waitForTimeout(300);
await shot('01-exp-text-bar-early');
await page.waitForTimeout(500);
await shot('02-bar-mid-fill');

// 3: first level-up moment (fanfare beat).
await waitFor('grew to Lv. 6!');
await shot('03-level-up-message');

// 4: stat window, +diffs page.
await waitFor('Max HP');
await page.waitForTimeout(200);
await shot('04-stat-window-diffs');

// 5: press -> true values page.
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
await shot('05-stat-window-values');

// 6: press -> next level's sweep is running (databox now Lv.6).
await page.keyboard.press('Enter');
await page.waitForTimeout(650);
await shot('06-second-level-sweep');

// 7: ride the rest of the chain like a player: press through every
// stat window until the money line lands.
let money = false;
for (let i = 0; i < 60 && !money; i++) {
  const body = await text();
  if (body.includes('You got 240 Credits')) { money = true; break; }
  if (body.includes('Max HP')) await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
}
if (!money) throw new Error('money line never appeared\nBODY: ' + (await text()));
await shot('07-money-line');

// 8: press -> sequence completes; readout shows the final state.
await page.keyboard.press('Enter');
await waitFor('SEQUENCE DONE');
await shot('08-done-final-state');
console.log('FINAL BODY:', await text());
await browser.close();
