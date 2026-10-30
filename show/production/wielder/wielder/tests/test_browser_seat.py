"""Browser seat (parity round 2): spec validation, receipt shape, and
a real launch test that SKIPS cleanly when the seat is not installed
on this machine (no Playwright package / no Chromium binary), so the
suite stays green on machines without the seat."""
from __future__ import annotations

import json

import pytest

from wielder import browser_seat


# ---------- job-spec validation (pure; no browser touched) ----------

def test_minimal_valid_spec():
    assert browser_seat.validate_job({"url": "https://example.com"}) == []


def test_full_valid_spec():
    job = {"url": "http://127.0.0.1:8000/fixture.html",
           "steps": [{"action": "click", "selector": "#go"},
                     {"action": "type", "selector": "#name", "text": "Wielder"},
                     {"action": "read_text", "selector": "#status"},
                     {"action": "screenshot", "path": "/tmp/x.png"}],
           "screenshot": "/tmp/final.png", "timeout_ms": 5000}
    assert browser_seat.validate_job(job) == []


def test_non_dict_spec_rejected():
    assert browser_seat.validate_job("open a page") != []


def test_missing_url_rejected():
    assert any("url" in e for e in browser_seat.validate_job({"steps": []}))


def test_non_http_url_rejected():
    errors = browser_seat.validate_job({"url": "ftp://example.com/x"})
    assert any("http" in e for e in errors)


def test_unknown_step_action_rejected():
    errors = browser_seat.validate_job(
        {"url": "https://example.com", "steps": [{"action": "hover", "selector": "#a"}]})
    assert any("action" in e for e in errors)


def test_click_requires_selector():
    errors = browser_seat.validate_job(
        {"url": "https://example.com", "steps": [{"action": "click"}]})
    assert any("selector" in e for e in errors)


def test_type_requires_text():
    errors = browser_seat.validate_job(
        {"url": "https://example.com", "steps": [{"action": "type", "selector": "#i"}]})
    assert any("text" in e for e in errors)


def test_screenshot_step_requires_path():
    errors = browser_seat.validate_job(
        {"url": "https://example.com", "steps": [{"action": "screenshot"}]})
    assert any("path" in e for e in errors)


def test_timeout_bounds():
    assert browser_seat.validate_job({"url": "https://example.com", "timeout_ms": 5}) != []
    assert browser_seat.validate_job({"url": "https://example.com", "timeout_ms": 5000}) == []


# ---------- receipt shape: failures are receipts, never exceptions ----------

RECEIPT_KEYS = {"seat", "ok", "url", "title", "text_excerpt", "screenshot", "steps", "error"}


def test_invalid_job_returns_failure_receipt():
    receipt = browser_seat.run_browser_job({"steps": []})
    assert set(receipt) == RECEIPT_KEYS
    assert receipt["ok"] is False
    assert receipt["seat"] == "playwright-chromium"
    assert "invalid job spec" in receipt["error"]


def test_missing_seat_returns_failure_receipt(monkeypatch):
    monkeypatch.setattr(browser_seat, "_playwright_python", lambda: None)
    receipt = browser_seat.run_browser_job({"url": "https://example.com"})
    assert set(receipt) == RECEIPT_KEYS
    assert receipt["ok"] is False
    assert "not wired" in receipt["error"]


def test_missing_browser_returns_failure_receipt(monkeypatch):
    monkeypatch.setattr(browser_seat, "chromium_executable", lambda: None)
    receipt = browser_seat.run_browser_job({"url": "https://example.com"})
    assert receipt["ok"] is False
    assert "no Chromium binary" in receipt["error"]


def test_seat_status_shape_when_not_installed(monkeypatch):
    monkeypatch.setattr(browser_seat, "_playwright_python", lambda: None)
    monkeypatch.setattr(browser_seat, "chromium_executable", lambda: None)
    status = browser_seat.seat_status(smoke=False)
    assert status["installed"] is False
    assert status["serving"] is False  # never counted wired without a launch
    assert status["blocker"]


def test_doors_hook_declares_local_seat():
    from wielder import doors
    declared = doors.browser_job_doors({"url": "not-a-url"})
    assert [name for name, _ in declared] == ["playwright-chromium-local"]
    ok, detail = declared[0][1]()
    assert ok is False  # invalid spec -> failure receipt, not a fake success
    assert json.loads(detail)["ok"] is False


# ---------- real launch (skips cleanly without the seat) ----------

def _seat_installed() -> bool:
    return (browser_seat._playwright_python() is not None
            and browser_seat.chromium_executable() is not None)


@pytest.mark.skipif(not _seat_installed(), reason="playwright/chromium seat not installed here")
def test_launch_and_read_about_blank():
    receipt = browser_seat.run_browser_job({"url": "about:blank", "steps": []})
    assert receipt["ok"] is True, receipt
    assert receipt["title"] in ("", None)
    assert receipt["error"] is None


@pytest.mark.skipif(not _seat_installed(), reason="playwright/chromium seat not installed here")
def test_seat_status_counts_wired_only_after_launch():
    status = browser_seat.seat_status(smoke=True)
    assert status["installed"] is True
    assert status["serving"] is True, status
    assert status["playwright_version"]
    assert status["blocker"] is None
