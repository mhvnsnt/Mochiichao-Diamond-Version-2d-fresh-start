# PROVENANCE (draft rows) — local browser seat, parity round 2

For the landing lane to fold into the tree's PROVENANCE.md. Licence
labels verified at the source per the honesty law (licence file /
official repo metadata / installed package metadata — never assumed).

| Piece | Source | Licence (verified) | Bucket | Installed | Running-verified |
|---|---|---|---|---|---|
| Playwright (Python) | `microsoft/playwright-python` via PyPI; upstream `microsoft/playwright` | Apache-2.0 — verified 2026-10-28: GitHub repo metadata for microsoft/playwright-python reports license key `apache-2.0` (its LICENSE file), and the installed wheel's package metadata declares `License-Expression: Apache-2.0` | open source | playwright 1.64.1 in the seat venv `~/workspace/wielder-parity2/runtime/seat-venv` (deps: greenlet 3.5.6, pyee 14.0.0) | See browser-seat-proof.md (seat launch smoke + fixture job) |
| Chromium Headless Shell (Chrome for Testing build, via Playwright) | The official CfT zip Playwright itself downloads (`cdn.playwright.dev/builds/cft/156.0.8078.4/linux64/chrome-headless-shell-linux64.zip`), PLAYWRIGHT_BROWSERS_PATH=`~/workspace/wielder-parity2/runtime/browsers` | Chromium is open source under a BSD-style licence (the Chromium project's LICENSE ships inside the build as `LICENSE.headless_shell`, with bundled third-party components under their own notices); NOT Google Chrome — Chrome (free proprietary, used by the old headful seat) is a different distribution and is not what this seat runs | open source | revision 1248, browser version 156.0.8078.4 — measured at launch (`browser.version` returned 156.0.8078.4). Fetched via a resumable parallel range download after Playwright's no-resume downloader died repeatedly on this VM's resetting egress connection; assembled zip verified byte-exact (125,797,539 B = official Content-Length, zip integrity pass, sha256 c3e50596…) and laid out at Playwright's own expected path — full route in browser-seat-proof.md | Launch + fixture job PASS — see browser-seat-proof.md |

Notes:
- The seat venv and browser binaries live in the parity runtime
  (`~/workspace/wielder-parity2/runtime/`), NOT in Wielder's main
  venv: Playwright is not a Wielder package dependency. `wielder/
  browser_seat.py` finds the seat via `WIELDER_BROWSER_SEAT_VENV`
  (env override) or the runtime path above; the landing lane may
  re-point the env var when the seat is staged to its permanent home.
- No paid tier, no account, no API key: Playwright and its Chromium
  build are a local install. (Microsoft's optional managed cloud
  service, Playwright Workspaces, is not used and not needed.)
