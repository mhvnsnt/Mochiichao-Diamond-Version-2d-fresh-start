# Telemetry live proof — Wielder exporter → real Langfuse server (2026-10-28, coordinator)

The exporter's unit tests stub the POST. This is the unstubbed loop,
run by the coordinator after both halves landed:

- Server: local self-hosted Langfuse **4.71.0** at
  `http://localhost:3000` (health `{"status":"OK"}`), project
  `wielder-telemetry`, keys read from the local keys file into the
  proof process only (values never printed or written here).
- Built a one-run ledger (`W-819b29fab9fc`, 2 tool calls — one ok,
  one deliberately failed verifier) and ran
  `wielder.telemetry.export_runs(...)` with the server configured.
- **POST `/api/public/ingestion` → HTTP 207**; re-POSTed the identical
  batch diagnostically and read the per-event body: **3 successes
  (201 each), 0 errors** (1 trace-create + 2 span-create).
- **Readback: `GET /api/public/traces/W-819b29fab9fc` → HTTP 200**,
  name `wielder run W-819b29fab9fc`, **2 observations**:
  `check_artifact` (DEFAULT) and `run_verifier` (**ERROR** — the
  failed step carries its level through, as designed). The trace also
  appears in `GET /api/public/traces` alongside the server worker's
  own smoke trace.
- Note: the first readback, ~1.5 s after the POST, returned 404 —
  ingestion is asynchronous (web → Redis → worker → ClickHouse);
  after ~20 s the trace was fully queryable. Exporters should not
  treat an immediate 404 as data loss.
- Server-side requirement found by the Langfuse worker and relied on
  here: `LANGFUSE_MIGRATION_V4_WRITE_MODE=dual` (v4's default rejects
  legacy ingestion payloads).

Verdict: **the telemetry mirror is wired end to end** — exporter,
local mirror files, and the real server. Reproduce with
`~/workspace/wielder-parity2/telemetry_live_proof.py`.
