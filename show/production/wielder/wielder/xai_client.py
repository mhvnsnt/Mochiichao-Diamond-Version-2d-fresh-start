"""xAI (Grok) provider client — the full call path for the `xai-grok`
brain seat registered in brain.py.

brain.py's advisory path (advise()) is a single plain completion. This
module is the seat's complete client, built to xAI's public API
documentation (docs.x.ai, read 2026-10-28; teardown in ../grok/):

- Chat Completions at https://api.x.ai/v1/chat/completions — the
  OpenAI-compatible REST surface (the OpenAI Python SDK works against
  the same base URL; this client stays stdlib-only like brain.py, so
  Wielder gains no new dependency).
- Client function calling: OpenAI-shaped tool specs, parallel tool
  calls on by default, results returned as role="tool" messages —
  run_tool_loop() drives that loop against a local tools_map.
- Server-side tool specs (web_search / x_search / code_execution /
  collections_search) built to the documented shapes; these execute
  on xAI's servers, are billed per invocation, and work in the
  Responses API tool surface — they are passed through verbatim.
- reasoning_effort (low/medium/high/xhigh) for the reasoning models;
  the documented incompatibility with presence_penalty /
  frequency_penalty / stop is enforced here instead of discovered
  from a 400.
- Structured outputs via response_format (json_schema), passed
  through for the caller to validate — Wielder's rule stands: seat
  output is advisory text/data, never a verdict.

Licence bucket: xAI API is a PAID PROPRIETARY service (per-token
pricing, docs.x.ai/developers/pricing). The key is read from the
XAI_API_KEY environment variable, the same pattern as every other
seat; the key value is never logged, returned, or recorded. With no
key held, every entry point raises XAINotConfigured — an honest
NOT CONFIGURED, never a fabricated answer.

Transport is injectable (transport(url, body, headers, timeout) ->
dict) so the whole client is testable without a key or network;
tests/test_xai_client.py exercises it against a mocked transport.
"""
from __future__ import annotations

import json
import os
import urllib.request

BASE_URL = "https://api.x.ai/v1"
CHAT_URL = BASE_URL + "/chat/completions"
MODELS_URL = BASE_URL + "/models"
KEY_ENV = "XAI_API_KEY"
MODEL_ENV = "WIELDER_XAI_MODEL"
# Documented current model with configurable reasoning at the lowest
# flagship-tier price (docs.x.ai pricing page, 2026-10-28); override
# per deployment with WIELDER_XAI_MODEL — never hard-code a seat's
# model where the environment should choose.
DEFAULT_MODEL = "grok-4.3"
REASONING_EFFORTS = ("low", "medium", "high", "xhigh")
# Documented: these sampling fields are rejected on reasoning models
# when reasoning effort is in play (docs.x.ai reasoning guide).
_REASONING_FORBIDDEN = ("presence_penalty", "frequency_penalty", "stop")


class XAINotConfigured(RuntimeError):
    """No XAI_API_KEY held — the seat is not wired. Honest blocker,
    named the same way brain.py names every seat's blocker."""


def configured() -> bool:
    return bool(os.environ.get(KEY_ENV))


def resolve_model(model: str | None = None) -> str:
    return model or os.environ.get(MODEL_ENV) or DEFAULT_MODEL


def _require_key() -> str:
    key = os.environ.get(KEY_ENV)
    if not key:
        raise XAINotConfigured(
            f"NOT CONFIGURED — no {KEY_ENV} held; xai-grok seat not wired "
            "(owner creates a key at console.x.ai and stores it via the "
            "Secure Vault flow; the key never transits chat)")
    return key


def _post_json(url: str, body: dict, headers: dict, timeout: int) -> dict:
    """Default transport — same shape and behaviour as brain._post_json
    so tests can monkeypatch either module's transport identically."""
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


# ---------------------------------------------------------------------------
# Tool specs
# ---------------------------------------------------------------------------

def _check_params_root(parameters: dict) -> None:
    """Documented compile rule: a tool's parameters root must be an
    object, or a oneOf/anyOf whose every branch is an object — anything
    else is rejected by the API with a 400 naming the tool. Catch it
    locally, before the paid call."""
    if not isinstance(parameters, dict):
        raise ValueError("tool parameters must be a JSON Schema object (dict)")
    if parameters.get("type") == "object":
        return
    for union in ("oneOf", "anyOf"):
        branches = parameters.get(union)
        if branches and all(isinstance(b, dict) and b.get("type") == "object"
                            for b in branches):
            return
    raise ValueError(
        "tool parameters root must be {\"type\": \"object\"} (or a oneOf/anyOf "
        "of objects) — the xAI API rejects any other root with a 400")


def function_tool(name: str, description: str, parameters: dict) -> dict:
    """One client function tool, Chat Completions shape."""
    _check_params_root(parameters)
    return {"type": "function",
            "function": {"name": name, "description": description,
                         "parameters": parameters}}


def web_search_tool(allowed_domains: list[str] | None = None,
                    excluded_domains: list[str] | None = None,
                    enable_image_understanding: bool = False,
                    enable_image_search: bool = False) -> dict:
    """Server-side Web Search spec (Responses API shape). Domain
    filters are capped at 5 and are mutually exclusive — documented."""
    if allowed_domains and excluded_domains:
        raise ValueError("allowed_domains and excluded_domains cannot be "
                         "set in the same request (documented xAI rule)")
    for label, domains in (("allowed_domains", allowed_domains),
                           ("excluded_domains", excluded_domains)):
        if domains and len(domains) > 5:
            raise ValueError(f"{label}: at most 5 domains per request (documented)")
    spec: dict = {"type": "web_search"}
    filters = {}
    if allowed_domains:
        filters["allowed_domains"] = list(allowed_domains)
    if excluded_domains:
        filters["excluded_domains"] = list(excluded_domains)
    if filters:
        spec["filters"] = filters
    if enable_image_understanding:
        spec["enable_image_understanding"] = True
    if enable_image_search:
        spec["enable_image_search"] = True
    return spec


def x_search_tool(allowed_x_handles: list[str] | None = None,
                  from_date: str | None = None, to_date: str | None = None,
                  enable_image_understanding: bool = False) -> dict:
    """Server-side X Search spec: live X posts, optionally scoped to
    handles and a date range (documented parameters)."""
    spec: dict = {"type": "x_search"}
    if allowed_x_handles:
        spec["allowed_x_handles"] = list(allowed_x_handles)
    if from_date:
        spec["from_date"] = from_date
    if to_date:
        spec["to_date"] = to_date
    if enable_image_understanding:
        spec["enable_image_understanding"] = True
    return spec


def code_execution_tool() -> dict:
    """Server-side sandboxed Python execution spec."""
    return {"type": "code_execution"}


def collections_search_tool(collection_ids: list[str]) -> dict:
    """Server-side Collections Search (RAG over uploaded document
    collections) spec."""
    if not collection_ids:
        raise ValueError("collections_search needs at least one collection id")
    return {"type": "collections_search", "collection_ids": list(collection_ids)}


# ---------------------------------------------------------------------------
# Request building
# ---------------------------------------------------------------------------

def build_chat_body(messages: list[dict], *, model: str | None = None,
                    tools: list[dict] | None = None,
                    tool_choice=None, parallel_tool_calls: bool | None = None,
                    reasoning_effort: str | None = None,
                    response_format: dict | None = None,
                    stream: bool = False, **sampling) -> dict:
    """Assemble a Chat Completions request body. Pure function — the
    request-building half of the client, fully testable with no key."""
    if reasoning_effort is not None:
        if reasoning_effort not in REASONING_EFFORTS:
            raise ValueError(
                f"reasoning_effort must be one of {REASONING_EFFORTS}, "
                f"got {reasoning_effort!r} (docs.x.ai reasoning guide)")
        bad = [k for k in _REASONING_FORBIDDEN if k in sampling]
        if bad:
            raise ValueError(
                f"{bad} cannot be used with reasoning models — the API "
                "returns an error (docs.x.ai reasoning guide)")
    body: dict = {"model": resolve_model(model),
                  "messages": list(messages), "stream": bool(stream)}
    if tools is not None:
        body["tools"] = tools
    if tool_choice is not None:
        body["tool_choice"] = tool_choice
    if parallel_tool_calls is not None:
        body["parallel_tool_calls"] = bool(parallel_tool_calls)
    if reasoning_effort is not None:
        body["reasoning_effort"] = reasoning_effort
    if response_format is not None:
        body["response_format"] = response_format
    body.update(sampling)
    return body


# ---------------------------------------------------------------------------
# Calls
# ---------------------------------------------------------------------------

def chat(messages: list[dict], *, transport=None, timeout: int = 120,
         **kwargs) -> dict:
    """One Chat Completions call. Returns the provider's parsed
    response dict verbatim (choices / usage / citations as sent)."""
    key = _require_key()
    body = build_chat_body(messages, **kwargs)
    post = transport or _post_json
    return post(CHAT_URL, body, {"Authorization": f"Bearer {key}"}, timeout)


def parse_tool_calls(message: dict) -> list[dict]:
    """Normalise a response message's tool_calls to
    [{id, name, arguments(dict)}]. Malformed arguments surface as an
    _arguments_error entry instead of raising — the loop reports them
    back to the model, which is the documented recovery path."""
    out = []
    for call in message.get("tool_calls") or []:
        fn = call.get("function") or {}
        raw = fn.get("arguments") or "{}"
        try:
            args = json.loads(raw) if isinstance(raw, str) else dict(raw)
            err = None
        except (ValueError, TypeError) as e:
            args, err = {}, f"unparseable arguments: {e}"
        entry = {"id": call.get("id"), "name": fn.get("name"), "arguments": args}
        if err:
            entry["_arguments_error"] = err
        out.append(entry)
    return out


def tool_result_message(call_id: str, output) -> dict:
    if not isinstance(output, str):
        output = json.dumps(output)
    return {"role": "tool", "tool_call_id": call_id, "content": output}


_EMPTY_PARAMS = {"type": "object", "properties": {}}


def run_tool_loop(messages: list[dict], tools_map: dict, *,
                  tool_specs: list[dict] | None = None,
                  max_rounds: int = 8, transport=None, timeout: int = 120,
                  **kwargs) -> dict:
    """The function-calling loop: call, execute every requested tool
    locally, return all results in one follow-up request (the
    documented protocol — one follow-up per tool call is a protocol
    violation), repeat until the model answers in text or max_rounds
    is hit. tools_map: name -> callable(**arguments) -> JSON-able.
    Returns {ok, text, messages, rounds, usage, detail} — a loop that
    exhausts its rounds says so in detail; it never invents an answer.
    """
    if tool_specs is None:
        # Minimal specs from the map itself (docstring = description,
        # permissive object schema). Callers who care about tight
        # schemas pass tool_specs built with function_tool().
        tool_specs = [function_tool(name, (fn.__doc__ or "").strip().splitlines()[0]
                                     if (fn.__doc__ or "").strip() else name,
                                    _EMPTY_PARAMS)
                      for name, fn in tools_map.items()]
    history = list(messages)
    usage: dict = {}
    for round_no in range(1, max_rounds + 1):
        resp = chat(history, tools=tool_specs, transport=transport,
                    timeout=timeout, **kwargs)
        for k, v in (resp.get("usage") or {}).items():
            if isinstance(v, (int, float)):
                usage[k] = usage.get(k, 0) + v
        choices = resp.get("choices") or []
        if not choices:
            return {"ok": False, "text": "", "messages": history,
                    "rounds": round_no, "usage": usage,
                    "detail": "provider answered with no choices"}
        message = (choices[0].get("message") or {})
        history.append(message)
        calls = parse_tool_calls(message)
        if not calls:
            return {"ok": True, "text": message.get("content") or "",
                    "messages": history, "rounds": round_no, "usage": usage,
                    "detail": f"model {resp.get('model', resolve_model())}"}
        for call in calls:
            fn = tools_map.get(call["name"])
            if "_arguments_error" in call:
                result = {"error": call["_arguments_error"]}
            elif fn is None:
                # Documented pattern: report the unknown function back
                # as a tool result instead of crashing the loop.
                result = {"error": f"Unknown function: {call['name']}"}
            else:
                try:
                    result = fn(**call["arguments"])
                except Exception as e:  # tool failure is data for the model
                    result = {"error": f"{type(e).__name__}: {e}"}
            history.append(tool_result_message(call["id"], result))
    return {"ok": False, "text": "", "messages": history,
            "rounds": max_rounds, "usage": usage,
            "detail": f"tool loop did not settle within {max_rounds} rounds"}


def iter_stream_deltas(lines):
    """Yield text deltas from an SSE line iterable (the Chat
    Completions streaming wire format: `data: {json}` lines and a
    terminal `data: [DONE]`). Split out so the stream format is
    testable without a network; chat_stream wires it to urllib."""
    for line in lines:
        if isinstance(line, bytes):
            line = line.decode("utf-8", errors="replace")
        line = line.strip()
        if not line.startswith("data:"):
            continue
        payload = line[len("data:"):].strip()
        if payload == "[DONE]":
            return
        try:
            chunk = json.loads(payload)
        except ValueError:
            continue
        for choice in chunk.get("choices") or []:
            delta = (choice.get("delta") or {}).get("content")
            if delta:
                yield delta


def chat_stream(messages: list[dict], *, timeout: int = 120, **kwargs):
    """Stream a Chat Completions call, yielding text deltas. Note the
    documented xAI behaviour: a function call arrives whole in a
    single chunk, never split across chunks."""
    key = _require_key()
    body = build_chat_body(messages, stream=True, **kwargs)
    req = urllib.request.Request(
        CHAT_URL, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        yield from iter_stream_deltas(r)
