"""Self-hosted (grok-local) provider client — the full call path for
the `grok-local` brain seat registered in brain.py.

This is the Grok-at-home seat: the same Grok-pattern behaviour the
`xai-grok` seat buys from xAI's paid API, served instead from OPEN
WEIGHTS (the Qwen3 family, Apache-2.0 — see ../grok-local/
MODEL-MANIFEST.md) by a vLLM endpoint the owner operates himself:
a free Kaggle test seat, a serverless GPU worker, or a rented pod.
The package that deploys that endpoint lives in ../grok-local/
(DEPLOY-RUNBOOK.md is the operator's manual).

The wire protocol is the OpenAI-compatible Chat Completions surface
vLLM serves, so this client deliberately mirrors xai_client.py's
shape — same function_tool() schema guard, same run_tool_loop()
protocol (all tool results returned in ONE follow-up), same
streaming wire format — with three differences that are the whole
point of the seat:

- The base URL is the owner's endpoint, read from
  GROK_LOCAL_BASE_URL (e.g. https://<pod>-8000.proxy.runpod.net/v1
  or a trycloudflare.com tunnel URL + /v1). There is no default:
  until a deployment exists and the variable is set, the seat is
  honestly NOT CONFIGURED and every entry point raises
  GrokLocalNotConfigured instead of fabricating an answer.
- The API key (GROK_LOCAL_API_KEY) is OPTIONAL at the protocol
  level — a localhost endpoint may run keyless — but every
  deployment in ../grok-local/ sets one, because the endpoint is
  reachable from the public internet by design (the PWA talks to
  it). When a key is held it is sent as a Bearer header; the value
  is never logged, returned, or recorded.
- No provider-specific extras: no reasoning_effort field, no
  server-side tools. Reasoning depth on the hybrid fallback model
  is a chat-template switch (chat_template_kwargs
  {"enable_thinking": ...}), passed through when the caller sets
  it; the primary Instruct-2507 model's template ignores it.

Licence bucket: the weights are Apache-2.0 open weights and vLLM
is Apache-2.0; there is no provider and no per-token fee. The
seat's only cost is the GPU seat itself, which is the owner's
choice per deployment (grok-local/DEPLOY-RUNBOOK.md prices all
three routes).

Transport is injectable (transport(url, body, headers, timeout) ->
dict) so the whole client is testable with no endpoint running;
tests/test_local_client.py exercises it against a mocked transport.
"""
from __future__ import annotations

import json
import os
import urllib.request

BASE_ENV = "GROK_LOCAL_BASE_URL"
KEY_ENV = "GROK_LOCAL_API_KEY"
MODEL_ENV = "WIELDER_LOCAL_MODEL"
# Every grok-local deployment serves under this name (the deploy
# scripts pass --served-model-name grok-local), so the seat works
# unchanged across the free test seat, serverless, and a rented pod.
DEFAULT_MODEL = "grok-local"


class GrokLocalNotConfigured(RuntimeError):
    """No GROK_LOCAL_BASE_URL held — no self-hosted endpoint has
    been deployed (or this process hasn't been told where it is).
    Honest blocker, named the same way brain.py names every
    seat's blocker."""


def base_url() -> str | None:
    base = os.environ.get(BASE_ENV)
    return base.rstrip("/") if base else None


def configured() -> bool:
    return bool(base_url())


def api_key() -> str | None:
    return os.environ.get(KEY_ENV) or None


def models_url() -> str:
    return _require_base() + "/models"


def chat_url() -> str:
    return _require_base() + "/chat/completions"


def resolve_model(model: str | None = None) -> str:
    return model or os.environ.get(MODEL_ENV) or DEFAULT_MODEL


def _require_base() -> str:
    base = base_url()
    if not base:
        raise GrokLocalNotConfigured(
            f"NOT CONFIGURED — no {BASE_ENV} held; grok-local seat not "
            "wired (deploy the endpoint per grok-local/DEPLOY-RUNBOOK.md "
            "— free Kaggle test seat, serverless, or rented pod — then "
            f"set {BASE_ENV} to its /v1 address)")
    return base


def _headers() -> dict:
    key = api_key()
    return {"Authorization": f"Bearer {key}"} if key else {}


def _post_json(url: str, body: dict, headers: dict, timeout: int) -> dict:
    """Default transport — same shape and behaviour as
    brain._post_json / xai_client._post_json so tests can
    monkeypatch either module's transport identically."""
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


# ---------------------------------------------------------------------------
# Tool specs (same documented compile rule as xai_client.function_tool)
# ---------------------------------------------------------------------------

def _check_params_root(parameters: dict) -> None:
    """A tool's parameters root must be an object, or a oneOf/anyOf
    whose every branch is an object — anything else is rejected by
    OpenAI-compatible servers with a 400 naming the tool. Catch it
    locally, before the call."""
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
        "of objects) — OpenAI-compatible servers reject any other root")


def function_tool(name: str, description: str, parameters: dict) -> dict:
    """One client function tool, Chat Completions shape."""
    _check_params_root(parameters)
    return {"type": "function",
            "function": {"name": name, "description": description,
                         "parameters": parameters}}


# ---------------------------------------------------------------------------
# Request building
# ---------------------------------------------------------------------------

def build_chat_body(messages: list[dict], *, model: str | None = None,
                    tools: list[dict] | None = None,
                    tool_choice=None, parallel_tool_calls: bool | None = None,
                    response_format: dict | None = None,
                    chat_template_kwargs: dict | None = None,
                    stream: bool = False, **sampling) -> dict:
    """Assemble a Chat Completions request body for the self-hosted
    endpoint. Pure function — the request-building half of the
    client, fully testable with no endpoint running."""
    body: dict = {"model": resolve_model(model),
                  "messages": list(messages), "stream": bool(stream)}
    if tools is not None:
        body["tools"] = tools
    if tool_choice is not None:
        body["tool_choice"] = tool_choice
    if parallel_tool_calls is not None:
        body["parallel_tool_calls"] = bool(parallel_tool_calls)
    if response_format is not None:
        body["response_format"] = response_format
    if chat_template_kwargs is not None:
        body["chat_template_kwargs"] = chat_template_kwargs
    body.update(sampling)
    return body


# ---------------------------------------------------------------------------
# Calls
# ---------------------------------------------------------------------------

def chat(messages: list[dict], *, transport=None, timeout: int = 120,
         **kwargs) -> dict:
    """One Chat Completions call to the self-hosted endpoint.
    Returns the server's parsed response dict verbatim."""
    url = chat_url()  # raises GrokLocalNotConfigured when unconfigured
    body = build_chat_body(messages, **kwargs)
    post = transport or _post_json
    return post(url, body, _headers(), timeout)


def parse_tool_calls(message: dict) -> list[dict]:
    """Normalise a response message's tool_calls to
    [{id, name, arguments(dict)}]. Malformed arguments surface as an
    _arguments_error entry instead of raising — the loop reports them
    back to the model, which is the standard recovery path."""
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
    protocol every OpenAI-compatible server expects — one follow-up
    per tool call is a protocol violation), repeat until the model
    answers in text or max_rounds is hit. tools_map: name ->
    callable(**arguments) -> JSON-able. Returns {ok, text, messages,
    rounds, usage, detail} — a loop that exhausts its rounds says so
    in detail; it never invents an answer."""
    if tool_specs is None:
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
                    "detail": "endpoint answered with no choices"}
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
    """Stream a Chat Completions call from the self-hosted endpoint,
    yielding text deltas. Note: Cloudflare Quick Tunnels (the free
    test seat's tunnel) do NOT pass SSE — on that seat use chat()
    with stream off; the PWA already falls back automatically."""
    url = chat_url()  # raises GrokLocalNotConfigured when unconfigured
    body = build_chat_body(messages, stream=True, **kwargs)
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", **_headers()})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        yield from iter_stream_deltas(r)
