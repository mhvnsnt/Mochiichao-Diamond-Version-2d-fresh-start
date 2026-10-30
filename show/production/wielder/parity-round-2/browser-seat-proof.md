# BROWSER SEAT — SMOKE PROOF (parity round 2, Job 1)

Date: 2026-10-28. Seat: `wielder/browser_seat.py` — Playwright 1.64.1
(Apache-2.0) driving Chromium Headless Shell 156.0.8078.4
(revision 1248) from the dedicated seat venv. The old headful Chrome
seat dies with SIGTRAP on this VM; this seat launches clean.

## Install record

- Seat venv: `~/workspace/wielder-parity2/runtime/seat-venv`
  (`pip install playwright` → playwright 1.64.1, greenlet 3.5.6,
  pyee 14.0.0; wheel metadata `License-Expression: Apache-2.0`).
- Browsers path: `~/workspace/wielder-parity2/runtime/browsers`
  (PLAYWRIGHT_BROWSERS_PATH), containing
  `chromium_headless_shell-1248/` (273 MB extracted).
- Download route, honestly: Playwright's own downloader has no
  resume, and this VM's egress connection reset repeatedly mid-file
  (the full-Chromium zip died near ~195 MB three times; the
  headless-shell zip died near ~65 MB once). The same official
  Chrome-for-Testing zip the installer fetches
  (`chrome-headless-shell-linux64.zip`, 156.0.8078.4) was therefore
  fetched with an append-only parallel range downloader
  (`runtime/downloads/fetch_segments.py`, 8 ranges, 206/Content-Range
  verified per chunk) and laid out at the exact path Playwright
  itself names for the executable
  (`chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell`)
  with its `INSTALLATION_COMPLETE` marker.
  Verification: assembled zip = 125,797,539 bytes, exactly the
  official Content-Length; zip integrity test passed (287 entries);
  sha256 `c3e50596aef52c58f8fda3c6b3411c33d34c88b177b3ed1c2243359fd3b8ba20`.
  `playwright install --only-shell --dry-run chromium` afterwards
  confirms the install location is the one Playwright expects.
- Direct launch check (seat venv): browser version **156.0.8078.4**,
  `about:blank` loaded — LAUNCH OK, no SIGTRAP.

## Proof run — local fixture (the proof)

Fixture: `runtime/fixture/browser-seat-fixture.html` — known title
"Wielder Browser Seat Fixture", a `#go` button that changes `#status`
from "before click" to "after click", and a `#name` input whose
`oninput` echoes into `#echo`. Served by `python -m http.server 8931`
over the workspace fixture dir. The job ran from Wielder's MAIN venv
(which has no Playwright) — `run_browser_job` delegated to the seat
venv subprocess and returned the receipt below. Full transcript:
`runtime/fixture/smoke-transcript.json.txt` (driver:
`runtime/fixture/run_smoke.py`).

seat_status (real launch smoke):

```json
{
 "seat": "playwright-chromium",
 "installed": true,
 "serving": true,
 "playwright_version": "1.64.1",
 "chromium": "/home/hatch/workspace/wielder-parity2/runtime/browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell",
 "browsers_path": "/home/hatch/workspace/wielder-parity2/runtime/browsers",
 "seat_python": "/home/hatch/workspace/wielder-parity2/runtime/seat-venv/bin/python",
 "blocker": null
}
```

Fixture job receipt (open → title → click → read changed text →
type → read echo → screenshot):

```json
{
 "seat": "playwright-chromium",
 "ok": true,
 "url": "http://127.0.0.1:8931/browser-seat-fixture.html",
 "title": "Wielder Browser Seat Fixture",
 "text_excerpt": "after click\nGo Name \n\ntyped: Wielder seat",
 "screenshot": "/home/hatch/workspace/wielder-parity2/runtime/fixture/smoke-screenshot.png",
 "steps": [
  {"action": "click", "ok": true, "detail": "clicked #go"},
  {"action": "read_text", "ok": true, "detail": "after click"},
  {"action": "type", "ok": true, "detail": "filled #name with 12 chars"},
  {"action": "read_text", "ok": true, "detail": "typed: Wielder seat"}
 ],
 "error": null
}
```

Screenshot artifact, verified from the file itself:
`runtime/fixture/smoke-screenshot.png` — PNG, 1280×720, 11,350 bytes,
sha256 `f1a72646b3c7eb52ea5440ce0b3b957693fc216439049bcde3749c318ecc029b`.

## Outbound (example.com) — attempted, blocked at the proxy, stated plainly

The fixture above is the proof, per the task's own fallback. An
example.com job was also run and returned a FAILURE receipt (never a
fake success): `net::ERR_TUNNEL_CONNECTION_FAILED`. Diagnosis:
this VM's egress goes through an authenticated proxy
(`hatch-egress-proxy:3128`); curl and Python reach example.com
through it (HTTP 200), but Chromium's CONNECT tunnel through it
fails — tried three ways (env-inherited proxy, explicit
server+credentials launch option, full proxy URL as server). So on
this VM today the seat covers pages reachable without the
authenticated proxy tunnel (localhost / LAN / intranet); WAN pages
remain the manager browser lane's door. This is an environment
boundary, recorded — not a seat defect: launch, navigation, DOM,
interaction and screenshot are all proven locally.

## Tests

`wielder/tests/test_browser_seat.py` — **17 passed** (validation,
failure-receipt shape, doors hook, and real-launch tests; the launch
tests skip cleanly when the seat binaries are absent — verified
earlier in this session: 15 passed + 2 skipped before the browser
landed, 17 passed after).
