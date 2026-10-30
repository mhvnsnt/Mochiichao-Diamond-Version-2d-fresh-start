// One-scene diagnostic: seed route_2, press KeyC once, dump text.
process.argv[2] = 'bike';
const fs = require('fs');
let src = fs.readFileSync('/home/hatch/workspace/traversal-build/proof/drive5.cjs', 'utf8');
// Replace the bike scene body with a diagnostic one.
src = src.replace(/if \(SCENE === 'cave2'\) \{[\s\S]*?\n  \} else \{/, `if (SCENE === 'bike') {
    await seedAt(page, 'route_2', 13, 17);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(600);
    const t1 = await page.evaluate(() => document.body.innerText.replace(/\\s+/g, ' ')).catch(() => '');
    console.log('AFTER C1:', t1.slice(0, 350));
    await shot(page, 'p2-diag-bike1.png');
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(600);
    const t2 = await page.evaluate(() => document.body.innerText.replace(/\\s+/g, ' ')).catch(() => '');
    console.log('AFTER C2:', t2.slice(0, 350));
  } else {`);
fs.writeFileSync('/home/hatch/workspace/traversal-build/proof/diag-bike-run.cjs', src);
require('/home/hatch/workspace/traversal-build/proof/diag-bike-run.cjs');
