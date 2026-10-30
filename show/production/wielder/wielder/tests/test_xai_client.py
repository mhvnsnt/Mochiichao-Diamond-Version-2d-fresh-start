"""xAI (Grok) seat tests — the Grok kit (2026-10-28): seat
registration in brain.py, the persona constant, and the full
xai_client call path (request building, tool loop, streaming)
exercised against a MOCKED transport. No key, no network: the suite
must pass on a machine with no XAI_API_KEY held, which is exactly
the state the seat ships in (wired, not configured).

Run: python -m pytest wielder/tests/test_xai_client.py -q
(from the package parent dir)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest


# ---------- seat registration (brain.py conventions) ----------

def test_xai_seat_registered_with_honest_bucket(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    seats = {s["seat"]: s for s in brain.seat_status()}
    assert "xai-grok" in seats
    seat = seats["xai-grok"]
    # Licence honesty: the xAI API is paid — never labelled free.
    assert seat["bucket"] == "paid proprietary"
    assert seat["installed"] is False
    assert "XAI_API_KEY" in seat["blocker"]
    assert "Secure Vault" in seat["blocker"]


def test_xai_seat_call_table_points_at_xai(monkeypatch):
    from wielder import brain
    kind, url, default_model, model_env, key_env = brain._SEAT_CALLS["xai-grok"]
    assert kind == "openai"
    assert url == "https://api.x.ai/v1/chat/completions"
    assert default_model == "grok-4.3"
    assert model_env == "WIELDER_XAI_MODEL"
    assert key_env == "XAI_API_KEY"


def test_xai_smoke_test_not_configured(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    out = brain.smoke_test("xai-grok")
    assert "NOT CONFIGURED" in out["result"]


def test_advise_xai_seat_not_configured_is_honest(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    out = brain.advise("anything", seat="xai-grok")
    assert out["ok"] is False and out["text"] == ""
    assert "NOT CONFIGURED" in out["detail"]


# ---------- persona (constitution.py conventions) ----------

def test_grok_pattern_persona_constant():
    from wielder import constitution as C
    persona = C.GROK_PATTERN_PERSONA
    assert isinstance(persona, str) and len(persona) > 100
    # The traits the profile spec (grok/PROFILE.md) promises.
    assert "cite the sources" in persona
    assert "first principles" in persona
    assert "Never present a guess as a measurement" in persona


# ---------- request building (pure; no key needed) ----------

def test_build_body_defaults_and_reasoning():
    from wielder import xai_client as X
    body = X.build_chat_body([{"role": "user", "content": "hi"}],
                             reasoning_effort="low")
    assert body["model"] == "grok-4.3"
    assert body["reasoning_effort"] == "low"
    assert body["stream"] is False
    assert body["messages"] == [{"role": "user", "content": "hi"}]


def test_build_body_rejects_bad_effort():
    from wielder import xai_client as X
    with pytest.raises(ValueError):
        X.build_chat_body([], reasoning_effort="extreme")


def test_build_body_rejects_reasoning_forbidden_sampling():
    from wielder import xai_client as X
    with pytest.raises(ValueError):
        X.build_chat_body([], reasoning_effort="high", stop=["x"])
    # Without reasoning effort the same field is the caller's business.
    body = X.build_chat_body([], stop=["x"])
    assert body["stop"] == ["x"]


def test_function_tool_schema_guard():
    from wielder import xai_client as X
    spec = X.function_tool("get_weather", "Get weather",
                           {"type": "object",
                            "properties": {"location": {"type": "string"}},
                            "required": ["location"]})
    assert spec == {"type": "function",
                    "function": {"name": "get_weather",
                                 "description": "Get weather",
                                 "parameters": {"type": "object",
                                                "properties": {"location": {"type": "string"}},
                                                "required": ["location"]}}}
    with pytest.raises(ValueError):
        X.function_tool("bad", "bad", {"type": "string"})
    ok_union = X.function_tool("either", "either",
                               {"oneOf": [{"type": "object", "properties": {}},
                                          {"type": "object", "properties": {}}]})
    assert ok_union["type"] == "function"


def test_server_tool_specs():
    from wielder import xai_client as X
    spec = X.web_search_tool(allowed_domains=["docs.x.ai"])
    assert spec["type"] == "web_search"
    assert spec["filters"] == {"allowed_domains": ["docs.x.ai"]}
    with pytest.raises(ValueError):
        X.web_search_tool(allowed_domains=["a"], excluded_domains=["b"])
    with pytest.raises(ValueError):
        X.web_search_tool(allowed_domains=["a", "b", "c", "d", "e", "f"])
    xs = X.x_search_tool(allowed_x_handles=["xai"], from_date="2026-10-01")
    assert xs == {"type": "x_search", "allowed_x_handles": ["xai"],
                  "from_date": "2026-10-01"}
    assert X.code_execution_tool() == {"type": "code_execution"}
    cs = X.collections_search_tool(["col-1"])
    assert cs == {"type": "collections_search", "collection_ids": ["col-1"]}
    with pytest.raises(ValueError):
        X.collections_search_tool([])


# ---------- calls against a mocked transport ----------

class FakeTransport:
    """Records (url, body, headers) and replays queued responses."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def __call__(self, url, body, headers, timeout):
        self.calls.append({"url": url, "body": body, "headers": headers})
        return self.responses.pop(0)


def test_chat_posts_to_xai_with_bearer(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.setenv("XAI_API_KEY", "test-key")
    fake = FakeTransport([{"model": "grok-4.3",
                           "choices": [{"message": {"content": "answer"}}],
                           "usage": {"total_tokens": 9}}])
    out = X.chat([{"role": "user", "content": "q"}], transport=fake)
    assert out["choices"][0]["message"]["content"] == "answer"
    call = fake.calls[0]
    assert call["url"] == "https://api.x.ai/v1/chat/completions"
    assert call["headers"]["Authorization"] == "Bearer test-key"
    assert call["body"]["model"] == "grok-4.3"


def test_chat_without_key_raises_not_configured(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    fake = FakeTransport([])
    with pytest.raises(X.XAINotConfigured):
        X.chat([{"role": "user", "content": "q"}], transport=fake)
    assert fake.calls == []  # no paid call was attempted


def _tool_call_msg(name, args, call_id="call_1"):
    return {"choices": [{"message": {
        "role": "assistant", "content": None,
        "tool_calls": [{"id": call_id, "type": "function",
                        "function": {"name": name,
                                     "arguments": json.dumps(args)}}]}}],
        "usage": {"total_tokens": 5}}


def test_tool_loop_executes_and_returns_text(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.setenv("XAI_API_KEY", "test-key")
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

    out = X.run_tool_loop([{"role": "user", "content": "Warm in Palo Alto?"}],
                          {"get_weather": get_weather}, transport=fake)
    assert out["ok"] is True and out["text"] == "It is 73 and sunny."
    assert out["rounds"] == 2 and out["usage"]["total_tokens"] == 12
    assert seen["location"] == "Palo Alto"
    # Second request carries the tool result in ONE follow-up, keyed
    # by the call id (the documented protocol).
    follow_up = fake.calls[1]["body"]["messages"]
    tool_msgs = [m for m in follow_up if m.get("role") == "tool"]
    assert len(tool_msgs) == 1
    assert tool_msgs[0]["tool_call_id"] == "call_1"
    assert json.loads(tool_msgs[0]["content"]) == {"temp": "73",
                                                   "condition": "sunny"}
    # The generated tool spec went out on the first call.
    assert fake.calls[0]["body"]["tools"][0]["function"]["name"] == "get_weather"


def test_tool_loop_unknown_function_reported_not_raised(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.setenv("XAI_API_KEY", "test-key")
    fake = FakeTransport([
        _tool_call_msg("nope", {}),
        {"choices": [{"message": {"content": "I cannot do that."}}]},
    ])
    out = X.run_tool_loop([{"role": "user", "content": "x"}], {},
                          transport=fake)
    assert out["ok"] is True
    tool_msgs = [m for m in fake.calls[1]["body"]["messages"]
                 if m.get("role") == "tool"]
    assert "Unknown function: nope" in tool_msgs[0]["content"]


def test_tool_loop_round_cap_is_honest(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.setenv("XAI_API_KEY", "test-key")
    fake = FakeTransport([_tool_call_msg("spin", {})] * 3)
    out = X.run_tool_loop([{"role": "user", "content": "x"}],
                          {"spin": lambda: {}}, transport=fake, max_rounds=3)
    assert out["ok"] is False and out["text"] == ""
    assert "did not settle" in out["detail"]


def test_tool_exception_becomes_tool_result(monkeypatch):
    from wielder import xai_client as X
    monkeypatch.setenv("XAI_API_KEY", "test-key")
    fake = FakeTransport([
        _tool_call_msg("boom", {}),
        {"choices": [{"message": {"content": "It failed."}}]},
    ])

    def boom():
        raise RuntimeError("kaput")

    out = X.run_tool_loop([{"role": "user", "content": "x"}],
                          {"boom": boom}, transport=fake)
    assert out["ok"] is True
    tool_msgs = [m for m in fake.calls[1]["body"]["messages"]
                 if m.get("role") == "tool"]
    assert "kaput" in tool_msgs[0]["content"]


# ---------- streaming wire format ----------

def test_iter_stream_deltas():
    from wielder import xai_client as X
    lines = [
        'data: {"choices": [{"delta": {"content": "Hel"}}]}',
        'data: {"choices": [{"delta": {"content": "lo"}}]}',
        'data: {"choices": [{"delta": {}}]}',
        "data: [DONE]",
        'data: {"choices": [{"delta": {"content": "ignored"}}]}',
    ]
    assert "".join(X.iter_stream_deltas(lines)) == "Hello"
    # Bytes lines (what urllib actually yields) work too.
    assert "".join(X.iter_stream_deltas([b'data: {"choices": [{"delta": {"content": "x"}}]}'])) == "x"
