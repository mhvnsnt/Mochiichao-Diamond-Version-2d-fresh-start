# Run Watcher — Kaggle kernel status-change alerts

Kaggle has **no completion webhooks** for kernels. The standard wiring
for that gap is what lives here: a small poller that checks kernel
status on a short interval, remembers the last status it saw, and
speaks **only when a status changes**. Silence means nothing changed.

Built 2026-10-28 after a locked Wan run finished and nobody knew for
the better part of an hour.

## Files

| File | What it is |
|---|---|
| `run_watcher.py` | The watcher. One poll per run; no daemon, no loop — the scheduler provides the interval. |
| `registry.json` | Watched kernels: `ref` (owner/slug), `label`, `programme`. |
| `requirements.txt` | The one dependency (`kaggle` Python package). |
| `state.json` | **Runtime state — local only, never committed.** Last status per kernel, locally-observed timestamps, backoff window, pending-inventory flags. |

## Setup

```bash
cd show/production/tooling/run-watcher   # or wherever this lives locally
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Credentials: the `kaggle` package reads `~/.kaggle/kaggle.json`
(Kaggle → Settings → API → Create New Token). The watcher never
prints, copies, or logs the key. **Never commit a kaggle.json.**

## Run one poll

```bash
./venv/bin/python run_watcher.py            # human-readable alerts
./venv/bin/python run_watcher.py --json     # alerts as JSON lines
./venv/bin/python run_watcher.py --registry R --state S
```

Exit codes: `0` = the poll ran (alerts, silence, or a silent backoff
skip). `2` = the poll itself failed for a non-rate-limit reason
(auth/API) — the failure is printed to stderr so a scheduler can tell
"broken" apart from "nothing changed".

## What a poll does

Steady state is deliberately light: **one `kernels_status` call per
watched kernel** — the lightest call that returns kernel status.
Heavier calls happen only on events:

- **First poll ever** (no `state.json`): prints one `BASELINE` block
  per kernel with its current status, then goes quiet.
- **Status change**: prints one `ALERT` block — kernel, label,
  programme, `OLD -> NEW`, how long the old status was locally
  observed, Kaggle's `lastRunTime` metadata, and the API's
  `failureMessage` on error.
- **Completion**: the alert carries an output inventory from the
  latest-session output listing (bounded: ≤10 pages), classified into
  **artifacts** (media/model/archive files and run/gate report JSONs
  sitting at shallow paths, under `out/`, or under an `output/`
  folder) vs the rest — these kernels dump whole tool trees (e.g. a
  ComfyUI checkout) into their output, so the alert surfaces the
  deliverables and counts the tree noise. If that fetch fails or is
  rate-limited, the completion alert still prints, the inventory is
  marked deferred, and it follows on a later healthy poll as an
  `OUTPUT` block (at most one drain per poll).

Sample alert:

```
[run-watcher ALERT] marsfmmg/mochiichao-path-a-stopgap — Path A stopgap scene run
  programme: Path A / free-seat scene lane
  status: RUNNING -> COMPLETE  (at 2026-10-28T18:25:23Z UTC)
  previous status observed for: 45m 23s (local observation)
  last run (Kaggle lastRunTime): 2026-10-28 17:40:33.177000
  output: 2463 files in latest-session output; 3 artifacts; 2460 other files (tool trees, sources)
  artifacts (names; the list API gives no sizes):
    - job/dorowani_start_tight.png
    - job/wispkin_start_tight.png
    - out/run-report.json
```

## Polling pattern (the part to keep)

- **Interval: 15 minutes** under any scheduler (cron, a scheduled
  agent job). The watcher itself never loops or sleeps-and-retries;
  one invocation = one poll.
- **429s are weather, not news.** The account's API budget is shared
  with bulk downloads and other tooling, so rate limits happen. On an
  HTTP 429 the watcher stops polling, keeps any real status changes
  already observed, and backs off **silently** — nothing about the 429
  is ever printed, exit stays 0. Backoff is exponential and
  self-enforcing through `state.json`: 15 → 30 → 60 minutes (cap);
  a poll that starts inside the backoff window makes **zero** API
  calls, which is what lengthens the effective interval under a
  fixed 15-minute schedule. A fully clean poll resets the backoff.
- **Never burst-poll.** No in-cycle retry loops anywhere. Inventory
  fetches are the only multi-call operation, they are bounded, and
  they happen only on completion events (plus the one-per-poll
  deferred drain).
- Non-429 failures are the opposite of weather: they exit `2` with a
  stderr message, because a broken watcher must not look like a
  quiet one.

## Adding a kernel

Append one entry to `registry.json`:

```json
{ "ref": "marsfmmg/<kernel-slug>", "label": "<short name>", "programme": "<lane it belongs to>" }
```

The slug is the part after `kaggle.com/code/`. The next poll baselines
it silently (unless it is the watcher's first-ever poll).

## What the Kaggle API does and doesn't give (verified 2026-10-28, kaggle 2.2.5)

- `kernels_status` returns **only** `{status, failureMessage}`.
  There is **no runtime/duration field** — durations in alerts are
  *locally observed* (time between this watcher first seeing one
  status and first seeing the next) and are labelled as such.
- `lastRunTime` comes from `kernels_list` metadata (fetched lazily —
  baseline and terminal events only). It can lag the live status;
  the status call is the truth, the timestamp is context.
- The session-output list call returns file **names/paths only**
  (`ApiKernelSessionOutputFile` has no size field), so alerts list
  artifact names and never invent sizes. Sizes live in the Kaggle
  Output UI or in a `kaggle kernels output` download — downloading
  is the harvest lanes' job, deliberately not the watcher's (it
  would burn the same shared API budget this design protects).
- The output inventory reflects the **latest session's** output
  listing. A kernel that is re-run replaces it.
