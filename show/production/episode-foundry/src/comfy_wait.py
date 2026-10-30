"""Queue-aware ComfyUI completion wait — the fix for the TIMEOUT_NO_HISTORY /
'locked: timed out' defect class (Episode Foundry step 2).

Diagnosis this module replaces (see tests/test_comfy_wait.py for the
regression proof, and the run records for the full evidence):

* VACE attempt 3 — ``likeness-stack/kaggle/vace-flf/mochiichao-vace-likeness.py``
  lines 422-427: history-only polling on a fixed 3300 s wall-clock deadline,
  ``assert hist, 'TIMEOUT_NO_HISTORY'``.  ``/queue`` was never consulted and
  nothing was logged during the wait, so a job the server was still running
  was indistinguishable from a job that had vanished.
* Locked run v1 — ``locked_run_kernel.py`` (parity) ``run_graph``, lines
  103-116: same class, 2400 s wall-clock deadline, history-only polling,
  ``RuntimeError(f'{label}: timed out')``.  The v2 kernel header records
  that v1 hit exactly that limit with no clip produced.
* Both: the per-poll ``get()`` had no error handling, so one transient
  HTTP error during the wait killed the whole kernel instead of retrying.

Contract of :func:`wait_for_completion`:

* Polls BOTH ``/queue`` and ``/history/<prompt_id>`` every ``poll_s``.
* A job the server reports as queued or running is NEVER a timeout,
  no matter how much wall-clock time has passed, as long as the server
  answers.  ``deadline_s`` is therefore an *unaccounted-for* deadline:
  it only counts time in which the job is neither complete, nor reported
  running/queued, nor (transiently) reachable — i.e. the job has actually
  been lost, not merely slow.  Video renders (VACE/Wan) routinely take
  tens of minutes, so callers should scale ``deadline_s`` to the job;
  the default is one hour.
* Progress (queue position / running state / history status) is reported
  through ``log()`` on every poll.
* A history entry whose status is an execution error raises
  ``RuntimeError`` carrying the server's status payload.
* Transient HTTP errors are retried with poll-scaled backoff; they do
  not fail the wait (their time counts toward the unaccounted-for
  deadline, so a server that never comes back still times out).

Stdlib only.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request

__all__ = ["wait_for_completion"]

_DEFAULT_TIMEOUT_S = 30  # per-request HTTP timeout, as in the old kernels


def _get_json(base_url, path, timeout_s=_DEFAULT_TIMEOUT_S):
    with urllib.request.urlopen(f"{base_url}{path}", timeout=timeout_s) as r:
        return json.loads(r.read().decode("utf-8"))


def _queue_state_for(queue_payload, prompt_id):
    """Return ('running'|'pending'|None, position_or_None, raw_item).

    ComfyUI ``/queue`` shape:
    ``{"queue_running": [[num, prompt_id, prompt, extra, outputs], ...],
       "queue_pending": [[num, prompt_id, prompt, extra, outputs], ...]}``
    """
    if not isinstance(queue_payload, dict):
        return None, None, None
    for item in queue_payload.get("queue_running") or []:
        if len(item) > 1 and item[1] == prompt_id:
            return "running", None, item
    for idx, item in enumerate(queue_payload.get("queue_pending") or []):
        if len(item) > 1 and item[1] == prompt_id:
            return "pending", idx, item
    return None, None, None


def _error_payload(entry):
    """Return the server's execution-error payload for a history entry,
    or None if the entry does not report an error."""
    status = entry.get("status") or {}
    if status.get("status_str") == "error":
        return status
    for msg in status.get("messages") or []:
        if isinstance(msg, (list, tuple)) and len(msg) >= 2 and msg[0] == "execution_error":
            return status
    return None


def _is_completed(entry):
    status = entry.get("status") or {}
    if status.get("completed"):
        return True
    # Older/newer servers sometimes omit 'completed' on success entries.
    return status.get("status_str") == "success"


def wait_for_completion(base_url, prompt_id, *, deadline_s=3600.0, poll_s=5.0, log=print):
    """Wait for a queued ComfyUI prompt to finish; return its history entry.

    Parameters
    ----------
    base_url : e.g. ``"http://127.0.0.1:8188"`` (trailing slash ok).
    prompt_id : the ``prompt_id`` returned by ``POST /prompt``.
    deadline_s : maximum seconds the job may be *unaccounted for* —
        neither complete, nor reported running/queued by ``/queue``, with
        the server unreachable counting as unaccounted.  Time spent
        reported running/queued NEVER counts against this deadline.
        Default 3600 (one hour); scale it to the job.
    poll_s : seconds between polls (also the transient-error backoff unit).
    log : callable taking one string, called once per poll with progress.

    Returns the history entry dict for ``prompt_id`` once complete.

    Raises
    ------
    TimeoutError : ``deadline_s`` passed with the job neither complete
        nor reported running/queued.
    RuntimeError : the history entry reports an execution error; the
        message carries the server's status payload as JSON.
    """
    base = base_url.rstrip("/")
    start = time.monotonic()
    # Last moment the job was accounted for (seen in /queue, or the wait
    # just started).  The deadline is measured from here, NOT from start:
    # that is the whole fix — a running job cannot time out.
    last_accounted = start
    consecutive_errors = 0
    poll_no = 0

    while True:
        poll_no += 1
        now = time.monotonic()
        elapsed = now - start
        unaccounted = now - last_accounted

        queue_state = None
        queue_pos = None
        entry = None
        fetch_error = None

        try:
            queue_payload = _get_json(base, "/queue")
            queue_state, queue_pos, _item = _queue_state_for(queue_payload, prompt_id)
        except Exception as e:  # transient: noted below, retried next poll
            fetch_error = e

        if fetch_error is None:
            try:
                hist = _get_json(base, f"/history/{prompt_id}")
                if isinstance(hist, dict):
                    entry = hist.get(prompt_id)
            except Exception as e:
                fetch_error = e

        if fetch_error is not None:
            consecutive_errors += 1
            log(
                f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
                f"prompt_id={prompt_id} transient error "
                f"({type(fetch_error).__name__}: {fetch_error}); "
                f"retry {consecutive_errors}, unaccounted={unaccounted:.1f}s"
            )
            if unaccounted > deadline_s:
                raise TimeoutError(
                    f"comfy_wait: prompt {prompt_id} unaccounted for "
                    f"{unaccounted:.1f}s (> deadline_s={deadline_s}) and the "
                    f"server is unreachable; last error: "
                    f"{type(fetch_error).__name__}: {fetch_error}"
                )
            backoff = min(poll_s * (2 ** min(consecutive_errors, 4)), poll_s * 16)
            time.sleep(backoff)
            continue
        consecutive_errors = 0

        # --- completion / error, from history ---
        if entry is not None:
            last_accounted = time.monotonic()
            err = _error_payload(entry)
            if err is not None:
                raise RuntimeError(
                    f"comfy_wait: prompt {prompt_id} execution error: "
                    f"{json.dumps(err, default=str)[:2000]}"
                )
            if _is_completed(entry):
                log(
                    f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
                    f"prompt_id={prompt_id} COMPLETE"
                )
                return entry
            status = entry.get("status") or {}
            log(
                f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
                f"prompt_id={prompt_id} history status_str="
                f"{status.get('status_str')} completed={status.get('completed')}"
            )
            time.sleep(poll_s)
            continue

        # --- still in the queue system: accounted for, never a timeout ---
        if queue_state == "running":
            last_accounted = time.monotonic()
            log(
                f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
                f"prompt_id={prompt_id} state=running"
            )
            time.sleep(poll_s)
            continue
        if queue_state == "pending":
            last_accounted = time.monotonic()
            log(
                f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
                f"prompt_id={prompt_id} state=queued position={queue_pos}"
            )
            time.sleep(poll_s)
            continue

        # --- nowhere: not in history, not in queue, server answered ---
        log(
            f"[comfy_wait] poll {poll_no} elapsed={elapsed:.1f}s "
            f"prompt_id={prompt_id} state=not_found "
            f"unaccounted={unaccounted:.1f}s deadline_s={deadline_s}"
        )
        if unaccounted > deadline_s:
            raise TimeoutError(
                f"comfy_wait: prompt {prompt_id} neither complete nor "
                f"reported running/queued for {unaccounted:.1f}s "
                f"(> deadline_s={deadline_s}); elapsed={elapsed:.1f}s, "
                f"polls={poll_no}"
            )
        time.sleep(poll_s)
