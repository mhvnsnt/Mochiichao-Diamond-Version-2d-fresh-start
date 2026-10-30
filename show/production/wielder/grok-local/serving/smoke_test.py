#!/usr/bin/env python3
"""Smoke test for a live grok-local endpoint.

Proves the three things the seat exists for, against the REAL
server (nothing here is mocked):
  1. /v1/models answers and lists the served model (auth checked).
  2. A plain chat completion returns text.
  3. A function-calling round works end to end: the model emits a
     valid tool call for the mock tool below, this script executes
     the mock locally, returns the result, and the model answers
     from it.

Exit code 0 only if every step passes; each step prints PASS/FAIL
with the evidence, and a JSON summary is printed last. A failed
step is a failed seat — the runbook's rule is that this output,
not the server log's "started" line, is what counts as serving.

Usage:
  python3 smoke_test.py --base http://127.0.0.1:8000/v1 \
      --key "$GROK_LOCAL_API_KEY" --model grok-local
Stdlib only.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request

MOCK_TOOL = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location.",
        "parameters": {
            "type": "object",
            "properties": {"location": {"type": "string"}},
            "required": ["location"],
        },
    },
}


def mock_get_weather(location: str) -> dict:
    """The mock tool: fixed data, marked as mock in the payload so a
    transcript can never be mistaken for a real weather reading."""
    return {"location": location, "temp": "73", "condition": "sunny",
            "source": "MOCK — smoke test fixture, not a real reading"}


def call(base: str, key: str | None, path: str, body: dict | None,
         timeout: int = 180) -> dict:
    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base.rstrip("/") + path, data=data,
                                 headers=headers,
                                 method="POST" if body is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--base", required=True, help="endpoint /v1 base URL")
    ap.add_argument("--key", default=None, help="endpoint API key, if set")
    ap.add_argument("--model", default="grok-local")
    args = ap.parse_args()

    results = {}

    # 1. models
    try:
        models = call(args.base, args.key, "/models", None, timeout=30)
        ids = [m.get("id") for m in models.get("data", [])]
        ok = args.model in ids
        results["models"] = {"pass": ok, "evidence": f"served ids: {ids}"}
    except Exception as e:
        results["models"] = {"pass": False,
                             "evidence": f"{type(e).__name__}: {e}"}

    # 2. plain chat
    try:
        resp = call(args.base, args.key, "/chat/completions", {
            "model": args.model,
            "messages": [{"role": "user",
                          "content": "Reply with exactly: SEAT OK"}],
            "temperature": 0, "max_tokens": 32})
        text = (resp["choices"][0]["message"].get("content") or "").strip()
        results["chat"] = {"pass": bool(text),
                           "evidence": f"answer: {text[:120]!r}"}
    except Exception as e:
        results["chat"] = {"pass": False,
                           "evidence": f"{type(e).__name__}: {e}"}

    # 3. tool round
    try:
        messages = [{"role": "user",
                     "content": "Use the get_weather tool to check the "
                                "weather in Nashville, Tennessee."}]
        resp = call(args.base, args.key, "/chat/completions", {
            "model": args.model, "messages": messages,
            "tools": [MOCK_TOOL], "tool_choice": "auto",
            "temperature": 0, "max_tokens": 256})
        message = resp["choices"][0]["message"]
        calls = message.get("tool_calls") or []
        if not calls:
            results["tool_call"] = {
                "pass": False,
                "evidence": "model answered without a tool call: "
                            f"{(message.get('content') or '')[:120]!r}"}
        else:
            fn = calls[0]["function"]
            tool_args = json.loads(fn["arguments"])
            assert fn["name"] == "get_weather", f"wrong tool: {fn['name']}"
            result = mock_get_weather(**tool_args)
            messages.append(message)
            messages.append({"role": "tool",
                             "tool_call_id": calls[0]["id"],
                             "content": json.dumps(result)})
            resp2 = call(args.base, args.key, "/chat/completions", {
                "model": args.model, "messages": messages,
                "temperature": 0, "max_tokens": 256})
            text2 = (resp2["choices"][0]["message"].get("content")
                     or "").strip()
            results["tool_call"] = {
                "pass": bool(text2),
                "evidence": f"call: get_weather({tool_args}) -> "
                            f"final answer: {text2[:120]!r}"}
    except Exception as e:
        results["tool_call"] = {"pass": False,
                                "evidence": f"{type(e).__name__}: {e}"}

    for name, r in results.items():
        print(f"{'PASS' if r['pass'] else 'FAIL'}  {name}: {r['evidence']}")
    all_pass = all(r["pass"] for r in results.values()) and len(results) == 3
    print(json.dumps({"smoke": "PASS" if all_pass else "FAIL",
                      "model": args.model, "base": args.base,
                      "steps": results}, indent=2))
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
