"""grok-local seat tests — the Grok-at-home kit (2026-10-28): seat
registration in brain.py and the full local_client call path
(request building, tool loop, streaming) exercised against a
MOCKED transport. No endpoint, no key, no network: the suite must
pass on a machine with no GROK_LOCAL_BASE_URL held, which is
exactly the state the seat ships in (wired, not deployed — the
owner's ruling is build first, deploy on his word).

Run: python -m pytest wielder/tests/test_local_client.py -q
(from the package parent dir)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

BASE = "https://example-pod-8000.proxy.runpod.net/v1"


# ---------- seat registration (brain.py conventions) ----------

def test_local_seat_registered_with_honest_bucket(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("GROK_LOCAL_BASE_URL", raising=False)
    seats = {s["seat"]: s for s in brain.seat_status()}
    assert "grok-local" in seats
    seat = seats["grok-local"]
    # Licence honesty: open weights, self-hosted — never labelled
    # as a provider free tier, never labelled paid proprietary.
    assert "open weights" in seat["bucket"]
    assert "Apache-2.0" in seat["bucket"]
    assert seat["installed"] is False
    assert seat["serving"] is False
    assert "GROK_LOCAL_BASE_URL" in seat["blocker"]
    assert "DEPLOY-RUNBOOK" in seat["blocker"]


def test_local_seat_call_table(monkeypatch):
    from wielder import brain
    kind, url, default_model, model_env, key_env = brain._SEAT_CALLS["grok-local"]
    assert kind == "openai"
    assert url == "env:GROK_LOCAL_BASE_URL"  # resolved in _call_seat
    assert default_model == "grok-local"  # the deployments' served name
    assert model_env == "WIELDER_LOCAL_MODEL"
    assert key_env is None  # endpoint key is optional at protocol level


def test_local_smoke_test_not_configured(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("GROK_LOCAL_BASE_URL", raising=False)
    out = brain.smoke_test("grok-local")
    assert "NOT CONFIGURED" in out["result"]


def test_advise_local_seat_not_configured_is_honest(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("GROK_LOCAL_BASE_URL", raising=False)
    out = brain.advise("anything", seat="grok-local")
    assert out["ok"] is False and out["text"] == ""
    assert "NOT CONFIGURED" in out["detail"]


def test_advise_local_seat_via_mocked_post(monkeypatch):
    # The full advise() path for grok-local, with brain's transport
    # stubbed: proves _call_seat resolves the env URL, omits the
    # Authorization header when no endpoint key is held, and sends
    # the constitution constraints as the system prompt.
    from wielder import brain
    monkeypatch.setenv("GROK_LOCAL_BASE_URL", BASE)
    monkeypatch.delenv("GROK_LOCAL_API_KEY", raising=False)
    seen = {}

    def fake_post(url, body, headers, timeout):
        seen.update(url=url, body=body, headers=headers)
        return {"choices": [{"message": {"content": "local answer"}}]}

    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("ping", seat="grok-local")
    assert out["ok"] is True and out["text"] == "local answer"
    assert seen["url"] == BASE + "/chat/completions"
    assert seen["headers"] == {}
    assert seen["body"]["model"] == "grok-local"
    assert seen["body"]["messages"][0]["role"] == "system"
    assert seen["body"]["messages"][1] == {"role": "user", "content": "ping"}


# ---------- configuration resolution ----------

def test_not_configured_raises_and_makes_no_call(monkeypatch):
    from wielder import local_client as L
    monkeypatch.delenv("GROK_LOCAL_BASE_URL", raising=False)
    assert L.configured() is False
    calls = []
    with pytest.raises(L.GrokLocalNotConfigured):
        L.chat([{"role": "user", "content": "q"}],
               transport=lambda *a: calls.append(a))
    assert calls == []  # no call was attempted


def test_base_url_trailing_slash_normalised(monkeypatch):
    from wielder import local_client as L
    monkeypatch.setenv("GROK_LOCAL_BASE_URL", BASE + "/")
    assert L.base_url() == BASE
    assert L.chat_url() == BASE + "/chat/completions"
    assert L.models_url() == BASE + "/models"


# ---------- request building (pure; no endpoint needed) ----------

def test_build_body_defaults_and_template_kwargs(monkeypatch):
    from wielder import local_client as L
    monkeypatch.setenv("GROK_LOCAL_BASE_URL", BASE)
    body = L.build_chat_body([{"role": "user", "content": "hi"}],
                             chat_template_kwargs={"enable_thinking": False})
    assert body["model"] == "grok-local"
    assert body["stream"] is False
    assert body["chat_template_kwargs"] == {"enable_thinking": False}
    assert body["messages"] == [{"role": "user", "content": "hi"}]


def test_resolve_model_env_override(monkeypatch):
    from wielder import local_client as L
    monkeypatch.setenv("WIELDER_LOCAL_MODEL", "grok-local-tuned")
    assert L.resolve_model() == "grok-local-tuned"
    assert L.resolve_model("explicit") == "explicit"


def test_function_tool_schema_guard():
    from wielder import local_client as L
    spec = L.function_tool("get_weather", "Get weather",
                           {"type": "object",
                            "properties": {"location": {"type": "string"}},
                            "required": ["location"]})
    assert spec["type"] == "function"
    assert spec["function"]["name"] == "get_weather"
    with pytest.raises(ValueError):
        L.function_tool("bad", "bad", {"type": "string"})


# ---------- calls against a mocked transport ----------

class FakeTransport:
    """Records (url, body, headers) and replays queued responses."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def __call__(self, url, body, headers, timeout):
        self.calls.append({"url": url, "body": body, "headers": headers})
        return self.responses.pop(0)


@pytest.fixture(autouse=True)
def _configured(monkeypatch):
    monkeypatch.setenv("GROK_LOCAL_BASE_URL", BASE)
    monkeypatch.delenv("GROK_LOCAL_API_KEY", raising=False)


def test_chat_posts_to_configured_base_without_key():
    from wielder import local_client as L
    fake = FakeTransport([{"model": "grok-local",
                           "choices": [{"message": {"content": "answer"}}],
                           "usage": {"total_tokens": 9}}])
    out = L.chat([{"role": "user", "content": "q"}], transport=fake)
    assert out["choices"][0]["message"]["content"] == "answer"
    call = fake.calls[0]
    assert call["url"] == BASE + "/chat/completions"
    assert call["headers"] == {}  # keyless endpoint: no header at all
    assert call["body"]["model"] == "grok-local"


def test_chat_sends_bearer_when_key_held(monkeypatch):
    from wielder import local_client as L
    monkeypatch.setenv("GROK_LOCAL_API_KEY", "test-key")
    fake = FakeTransport([{"choices": [{"message": {"content": "ok"}}]}])
    L.chat([{"role": "user", "content": "q"}], transport=fake)
    assert fake.calls[0]["headers"] == {"Authorization": "Bearer test-key"}


def _tool_call_msg(name, args, call_id="call_1"):
    return {"choices": [{"message": {
        "role": "assistant", "content": None,
        "tool_calls": [{"id": call_id, "type": "function",
                        "function": {"name": name,
                                     "arguments": json.dumps(args)}}]}}],
        "usage": {"total_tokens": 5}}


def test_tool_loop_executes_and_returns_text():
    from wielder import local_client as L
    fake = FakeTransport([
        _tool_call_msg("get_weather", {"location": "Palo Alto"}),
        {"choices": [{"message": {"role": "assistant",
                                  "content": "It is 73 and sunny."}}],
         "usage": {"total_tokens": 7}},
    ])
    seen = {}

    def get_weather(location):
        """Get weather for a location."""
        seen["location"] = location
        return {"temp": "73", "condition": "sunny"}

    out = L.run_tool_loop([{"role": "user", "content": "Warm in Palo Alto?"}],
                          {"get_weather": get_weather}, transport=fake)
    assert out["ok"] is True and out["text"] == "It is 73 and sunny."
    assert out["rounds"] == 2 and out["usage"]["total_tokens"] == 12
    assert seen["location"] == "Palo Alto"
    follow_up = fake.calls[1]["body"]["messages"]
    tool_msgs = [m for m in follow_up if m.get("role") == "tool"]
    assert len(tool_msgs) == 1
    assert tool_msgs[0]["tool_call_id"] == "call_1"
    assert json.loads(tool_msgs[0]["content"]) == {"temp": "73",
                                                   "condition": "sunny"}
    assert fake.calls[0]["body"]["tools"][0]["function"]["name"] == "get_weather"


def test_tool_loop_unknown_function_reported_not_raised():
    from wielder import local_client as L
    fake = FakeTransport([
        _tool_call_msg("nope", {}),
        {"choices": [{"message": {"content": "I cannot do that."}}]},
    ])
    out = L.run_tool_loop([{"role": "user", "content": "x"}], {},
                          transport=fake)
    assert out["ok"] is True
    tool_msgs = [m for m in fake.calls[1]["body"]["messages"]
                 if m.get("role") == "tool"]
    assert "Unknown function: nope" in tool_msgs[0]["content"]


def test_tool_loop_round_cap_is_honest():
    from wielder import local_client as L
    fake = FakeTransport([_tool_call_msg("spin", {})] * 3)
    out = L.run_tool_loop([{"role": "user", "content": "x"}],
                          {"spin": lambda: {}}, transport=fake, max_rounds=3)
    assert out["ok"] is False and out["text"] == ""
    assert "did not settle" in out["detail"]


# ---------- streaming wire format ----------

def test_iter_stream_deltas():
    from wielder import local_client as L
    lines = [
        'data: {"choices": [{"delta": {"content": "Hel"}}]}',
        'data: {"choices": [{"delta": {"content": "lo"}}]}',
        'data: {"choices": [{"delta": {}}]}',
        "data: [DONE]",
        'data: {"choices": [{"delta": {"content": "ignored"}}]}',
    ]
    assert "".join(L.iter_stream_deltas(lines)) == "Hello"
    assert "".join(L.iter_stream_deltas(
        [b'data: {"choices": [{"delta": {"content": "x"}}]}'])) == "x"
