#!/usr/bin/env python3
"""Regression tests for the ComfyUI wait/timeout defect (stdlib only).

Run:  python3 tests/test_comfy_wait.py

The defect, from the actual run code:

* VACE attempt 3 — likeness-stack/kaggle/vace-flf/mochiichao-vace-likeness.py
  L422:  pid = resp['prompt_id']; deadline = time.time() + 3300; hist = None
  L423:  while time.time() < deadline:
  L424:      time.sleep(20)
  L425:      hst = get(f'/history/{pid}')
  L426:      if pid in hst: hist = hst[pid]; break
  L427:  assert hist, 'TIMEOUT_NO_HISTORY'
  History-only polling, fixed wall-clock deadline, /queue never consulted,
  nothing logged while waiting.  Its RUN-LOG ends QUEUED -> that assert.

* Locked run v1 — parity/locked_run_kernel.py, run_graph L103-116:
  L108:  while time.time() - t0 < 2400:
  L109:      hist = get(f'/history/{pid}')
  L111:      if entry and entry.get('status', {}).get('completed'): return ...
  L113:      if entry and entry.get('status', {}).get('status_str') == 'error': raise ...
  L115:      time.sleep(5)
  L116:  raise RuntimeError(f'{label}: timed out')
  Same class (history-only, fixed 2400 s deadline, no /queue check); it
  differs from attempt 3 only in checking status.completed/status_str and
  in polling every 5 s instead of 20 s.  The v2 kernel header records v1
  died as RuntimeError 'locked: timed out'.

The stub below models what ComfyUI actually does during a long render:
the prompt sits in /queue as running, /history/<id> stays EMPTY, and the
history entry only appears when execution finishes.

Test A reproduces the failure class with faithful re-implementations of
BOTH old waits.  Test B runs the fixed wait_for_completion against the
same stub scenario with the SAME small deadline the old code died on —
the job is reported running, so it must not time out.  Test C checks the
execution_error path.  Test D checks transient HTTP 500s are retried.
"""

import json
import sys
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from comfy_wait import wait_for_completion  # noqa: E402

PID = "test-prompt-0001"
SUCCESS_ENTRY = {
    "prompt": [0, PID, {"1": {"class_type": "StubNode"}}],
    "outputs": {"9": {"images": [{"filename": "stub_00001_.png"}]}},
    "status": {"status_str": "success", "completed": True, "messages": []},
}
ERROR_PAYLOAD = {
    "node_id": "7",
    "node_type": "WanVaceToVideo",
    "exception_type": "RuntimeError",
    "exception_message": "stub execution boom",
}
ERROR_ENTRY = {
    "prompt": [0, PID, {"1": {"class_type": "StubNode"}}],
    "outputs": {},
    "status": {
        "status_str": "error",
        "completed": False,
        "messages": [
            ["execution_started", {"prompt_id": PID}],
            ["execution_error", ERROR_PAYLOAD],
        ],
    },
}


class StubState:
    """complete_after: history poll number on which the entry appears.
    While incomplete, /queue reports the prompt as running."""

    def __init__(self, complete_after, entry, flaky_500s=0):
        self.complete_after = complete_after
        self.entry = entry
        self.flaky_500s = flaky_500s
        self.history_polls = 0
        self.queue_polls = 0
        self.lock = threading.Lock()

    def done(self):
        return self.history_polls >= self.complete_after


def make_handler(state):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *a):  # keep test output clean
            pass

        def _send(self, code, obj):
            body = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            with state.lock:
                if self.path == "/queue":
                    state.queue_polls += 1
                    if state.queue_polls <= state.flaky_500s:
                        self._send(500, {"error": "stub flaky"})
                        return
                    if state.done():
                        self._send(200, {"queue_running": [], "queue_pending": []})
                    else:
                        self._send(200, {
                            "queue_running": [[0, PID, {}, {}, []]],
                            "queue_pending": [],
                        })
                    return
                if self.path == f"/history/{PID}":
                    state.history_polls += 1
                    if state.done():
                        self._send(200, {PID: state.entry})
                    else:
                        self._send(200, {})
                    return
            self._send(404, {})

    return Handler


def start_stub(state):
    srv = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(state))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}"


def get_json(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read())


# ---------------------------------------------------------------- old waits
def old_wait_attempt3(base_url, prompt_id, deadline_s, poll_s):
    """Faithful semantics of mochiichao-vace-likeness.py L422-427, with the
    3300 s / 20 s constants scaled down proportionally for the test."""
    deadline = time.time() + deadline_s
    hist = None
    polls = 0
    while time.time() < deadline:
        time.sleep(poll_s)
        polls += 1
        hst = get_json(f"{base_url}/history/{prompt_id}")
        if prompt_id in hst:
            hist = hst[prompt_id]
            break
    assert hist, "TIMEOUT_NO_HISTORY"
    return hist, polls


def old_wait_locked(base_url, prompt_id, label, deadline_s, poll_s):
    """Faithful semantics of locked_run_kernel.py run_graph L103-116,
    2400 s / 5 s constants scaled down for the test."""
    t0 = time.time()
    while time.time() - t0 < deadline_s:
        hist = get_json(f"{base_url}/history/{prompt_id}")
        entry = hist.get(prompt_id)
        if entry and entry.get("status", {}).get("completed"):
            return prompt_id, time.time() - t0, entry
        if entry and entry.get("status", {}).get("status_str") == "error":
            raise RuntimeError(f"{label}: execution error: {json.dumps(entry.get('status'))[:600]}")
        time.sleep(poll_s)
    raise RuntimeError(f"{label}: timed out")


# ---------------------------------------------------------------- tests
OLD_DEADLINE_S = 1.0
OLD_POLL_S = 0.2          # old code allows ~5 polls inside its deadline
COMPLETE_AFTER = 30       # stub finishes only on history poll #30


def test_a_old_behaviour_reproduces():
    # attempt-3 semantics
    state = StubState(complete_after=COMPLETE_AFTER, entry=SUCCESS_ENTRY)
    srv, base = start_stub(state)
    try:
        try:
            old_wait_attempt3(base, PID, OLD_DEADLINE_S, OLD_POLL_S)
            raise SystemExit("FAIL A1: old attempt-3 wait did NOT time out")
        except AssertionError as e:
            assert str(e) == "TIMEOUT_NO_HISTORY", e
            print(f"PASS A1 old attempt-3 wait raised AssertionError: TIMEOUT_NO_HISTORY "
                  f"(history polls used: {state.history_polls}, stub needed {COMPLETE_AFTER})")
    finally:
        srv.shutdown()

    # locked-v1 semantics
    state = StubState(complete_after=COMPLETE_AFTER, entry=SUCCESS_ENTRY)
    srv, base = start_stub(state)
    try:
        try:
            old_wait_locked(base, PID, "locked", OLD_DEADLINE_S, OLD_POLL_S)
            raise SystemExit("FAIL A2: old locked wait did NOT time out")
        except RuntimeError as e:
            assert str(e) == "locked: timed out", e
            print(f"PASS A2 old locked wait raised RuntimeError: locked: timed out "
                  f"(history polls used: {state.history_polls}, stub needed {COMPLETE_AFTER})")
    finally:
        srv.shutdown()


def test_b_new_wait_survives_while_running():
    state = StubState(complete_after=COMPLETE_AFTER, entry=SUCCESS_ENTRY)
    srv, base = start_stub(state)
    logs = []
    try:
        t0 = time.monotonic()
        # SAME small deadline the old code died on.  Under the fix it is an
        # unaccounted-for deadline: the stub reports the job running on
        # every poll, so it must never fire.
        entry = wait_for_completion(base, PID, deadline_s=OLD_DEADLINE_S,
                                    poll_s=0.05, log=logs.append)
        elapsed = time.monotonic() - t0
    finally:
        srv.shutdown()
    assert entry == SUCCESS_ENTRY, entry
    old_allowed_polls = int(OLD_DEADLINE_S / OLD_POLL_S)
    assert state.history_polls > old_allowed_polls, (state.history_polls, old_allowed_polls)
    assert elapsed > OLD_DEADLINE_S, elapsed
    assert any("state=running" in line for line in logs), logs[:3]
    print(f"PASS B new wait returned completed entry after {state.history_polls} history polls "
          f"/ {state.queue_polls} queue polls, elapsed={elapsed:.2f}s "
          f"(old deadline was {OLD_DEADLINE_S}s / ~{old_allowed_polls} polls)")


def test_c_execution_error():
    state = StubState(complete_after=3, entry=ERROR_ENTRY)
    srv, base = start_stub(state)
    try:
        try:
            wait_for_completion(base, PID, deadline_s=60.0, poll_s=0.05,
                                log=lambda *a: None)
            raise SystemExit("FAIL C: new wait did NOT raise on execution_error")
        except RuntimeError as e:
            msg = str(e)
            assert "execution error" in msg and "stub execution boom" in msg \
                and "WanVaceToVideo" in msg, msg
            print(f"PASS C new wait raised RuntimeError carrying server payload: {msg[:140]}...")
    finally:
        srv.shutdown()


def test_d_transient_http_errors_retried():
    state = StubState(complete_after=6, entry=SUCCESS_ENTRY, flaky_500s=2)
    srv, base = start_stub(state)
    try:
        entry = wait_for_completion(base, PID, deadline_s=60.0, poll_s=0.05,
                                    log=lambda *a: None)
    finally:
        srv.shutdown()
    assert entry == SUCCESS_ENTRY, entry
    print(f"PASS D new wait survived 2 transient HTTP 500s from /queue "
          f"(queue polls: {state.queue_polls}) and completed")


def test_e_genuinely_lost_job_times_out():
    # Job in neither /queue nor /history: the deadline must still fire.
    # Dedicated tiny server that reports the job nowhere.
    import http.server

    class LostHandler(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_GET(self):
            body = b"{}" if self.path.startswith("/history") else \
                json.dumps({"queue_running": [], "queue_pending": []}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), LostHandler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    try:
        t0 = time.monotonic()
        try:
            wait_for_completion(base, PID, deadline_s=0.4, poll_s=0.05,
                                log=lambda *a: None)
            raise SystemExit("FAIL E: lost job did NOT time out")
        except TimeoutError as e:
            elapsed = time.monotonic() - t0
            print(f"PASS E lost job raised TimeoutError after {elapsed:.2f}s: {str(e)[:120]}")
    finally:
        srv.shutdown()


if __name__ == "__main__":
    test_a_old_behaviour_reproduces()
    test_b_new_wait_survives_while_running()
    test_c_execution_error()
    test_d_transient_http_errors_retried()
    test_e_genuinely_lost_job_times_out()
    print("ALL TESTS PASSED")
