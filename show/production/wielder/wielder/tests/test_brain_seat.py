"""Brain seat — Ollama local seat wiring (parity round 2).

The unit tests mock the HTTP layer: they prove seat_status() reports
the ollama seat live when the server answers, and that advise() calls
the seat with the verified default model and the capped context.
The real (unmocked) proof against a running Ollama is recorded in
~/workspace/wielder-parity2/research/ollama-seat-proof.md — a unit
test is not that proof.

Model licence (verified 2026-10-28, licence sweep §12): the default
model is qwen2.5-coder:7b, Apache-2.0. qwen2.5-coder:3b is NOT used:
it is the family's lone Qwen Research License (free-but-restricted)
carve-out.

Run: python -m pytest wielder/tests/test_brain_seat.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


class _FakeResponse:
    def __init__(self, status=200):
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


def _ollama_seat(status):
    return next(s for s in status if s["seat"] == "ollama-local")


def test_seat_status_reports_ollama_live_when_server_answers(monkeypatch):
    from wielder import brain
    monkeypatch.setattr(brain.shutil, "which", lambda name: "/fake/bin/ollama")
    seen = {}

    def fake_urlopen(url, timeout=None):
        seen["url"], seen["timeout"] = url, timeout
        return _FakeResponse(200)

    monkeypatch.setattr(brain.urllib.request, "urlopen", fake_urlopen)
    seat = _ollama_seat(brain.seat_status())
    assert seat["installed"] is True
    assert seat["serving"] is True
    assert seat["blocker"] is None
    assert seen["url"] == "http://127.0.0.1:11434/api/tags"


def test_seat_status_not_serving_when_server_silent(monkeypatch):
    from wielder import brain
    monkeypatch.setattr(brain.shutil, "which", lambda name: "/fake/bin/ollama")

    def dead_urlopen(url, timeout=None):
        raise OSError("connection refused")

    monkeypatch.setattr(brain.urllib.request, "urlopen", dead_urlopen)
    seat = _ollama_seat(brain.seat_status())
    assert seat["installed"] is True
    assert seat["serving"] is False
    assert seat["blocker"] and "not answering" in seat["blocker"]


def test_seat_status_not_installed_without_binary(monkeypatch):
    from wielder import brain
    monkeypatch.setattr(brain.shutil, "which", lambda name: None)
    seat = _ollama_seat(brain.seat_status())
    assert seat["installed"] is False and seat["serving"] is False
    assert "not installed" in seat["blocker"]


def test_ollama_default_model_is_the_apache_licensed_7b():
    from wielder import brain
    assert brain.OLLAMA_DEFAULT_MODEL == "qwen2.5-coder:7b"
    # The restricted-licence size must never become the default.
    assert brain._SEAT_CALLS["ollama-local"][2] == "qwen2.5-coder:7b"


def test_advise_ollama_sends_capped_context_and_parses_reply(monkeypatch):
    from wielder import brain
    seen = {}

    def fake_post(url, body, headers, timeout):
        seen["url"], seen["body"] = url, body
        return {"message": {"content": "Finding: clause checked, no defect in material inspected."}}

    monkeypatch.delenv("WIELDER_OLLAMA_MODEL", raising=False)
    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("review this code", seat="ollama-local")
    assert out["ok"] is True and out["seat"] == "ollama-local"
    assert "no defect" in out["text"]
    assert seen["url"] == "http://127.0.0.1:11434/api/chat"
    assert seen["body"]["model"] == "qwen2.5-coder:7b"
    assert seen["body"]["options"]["num_ctx"] == 8192
    assert out["detail"] == "model qwen2.5-coder:7b"


def test_advise_ollama_model_env_override(monkeypatch):
    from wielder import brain
    seen = {}

    def fake_post(url, body, headers, timeout):
        seen["body"] = body
        return {"message": {"content": "ok"}}

    monkeypatch.setenv("WIELDER_OLLAMA_MODEL", "qwen2.5-coder:1.5b")
    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("hi", seat="ollama-local")
    assert out["ok"] is True
    assert seen["body"]["model"] == "qwen2.5-coder:1.5b"


def test_ollama_timeout_floor_and_remote_unchanged(monkeypatch):
    """CPU-local inference is slow (measured ~115 s inference for one
    advisory answer on this VM class); a 30 s caller timeout must not
    make the local seat unusable, and must not leak onto hosted seats."""
    from wielder import brain
    seen = {}

    def fake_call(seat, prompt, timeout):
        seen[seat] = timeout
        return {"seat": seat, "ok": True, "text": "x", "detail": "model m"}

    monkeypatch.setattr(brain, "_call_seat", fake_call)
    brain.advise("q", seat="ollama-local", timeout=30)
    assert seen["ollama-local"] == brain.OLLAMA_MIN_TIMEOUT == 300
    brain.advise("q", seat="ollama-local", timeout=900)
    assert seen["ollama-local"] == 900
    brain.advise("q", seat="groq-free", timeout=30)
    assert seen["groq-free"] == 30


def test_advise_ollama_num_ctx_env_override(monkeypatch):
    from wielder import brain
    monkeypatch.setenv("WIELDER_OLLAMA_NUM_CTX", "4096")
    assert brain._ollama_num_ctx() == 4096
    monkeypatch.setenv("WIELDER_OLLAMA_NUM_CTX", "not-a-number")
    assert brain._ollama_num_ctx() == brain.OLLAMA_DEFAULT_NUM_CTX
