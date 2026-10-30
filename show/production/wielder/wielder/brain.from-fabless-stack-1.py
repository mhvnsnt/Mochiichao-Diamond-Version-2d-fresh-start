"""Brain seats. The load-bearing seat is deterministic: a registered
method names its steps and the graph executes them — no model call is
required for the loop to run end-to-end. LLM seats are optional,
advisory/planning only, and their availability is MEASURED, never
assumed (seat_status below). Labels follow the honesty law.
"""
from __future__ import annotations

import os
import shutil
import urllib.request


def seat_status() -> list[dict]:
    seats = []
    # Ollama local seat (MIT runner; per-model licences apply to weights)
    binary = shutil.which("ollama")
    serving = False
    if binary:
        try:
            with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=2) as r:
                serving = r.status == 200
        except Exception:
            serving = False
    seats.append({"seat": "ollama-local", "bucket": "open source (runner, MIT)",
                  "installed": bool(binary), "serving": serving,
                  "blocker": None if serving else "ollama binary not installed on this VM"})
    # OpenRouter free tier (free proprietary, capped: 20 req/min;
    # 50 req/day without any credit purchase, 1,000/day after a one-time
    # $10 lifetime purchase — verified 2026-10-28, STACK.md §3)
    seats.append({"seat": "openrouter-free", "bucket": "free proprietary, capped",
                  "installed": bool(os.environ.get("OPENROUTER_API_KEY")), "serving": False,
                  "blocker": None if os.environ.get("OPENROUTER_API_KEY")
                  else "no OPENROUTER_API_KEY held — key creation is the owner's account action"})
    seats.append({"seat": "deterministic-method-executor", "bucket": "owner system",
                  "installed": True, "serving": True, "blocker": None})
    # Free-tier API seats (Addendum 9B): free proprietary, caps labelled.
    # A seat counts as wired only after a real smoke-test call (smoke_test
    # below); configured-but-untested = not wired.
    seats.append({"seat": "gemini-free", "bucket": "free proprietary, capped",
                  "installed": bool(os.environ.get("GEMINI_API_KEY")), "serving": False,
                  "blocker": None if os.environ.get("GEMINI_API_KEY")
                  else "no GEMINI_API_KEY held — one-step ask: owner creates a key in "
                       "Google AI Studio (aistudio.google.com/apikey) and stores it via "
                       "the Secure Vault flow; the key never transits chat"})
    seats.append({"seat": "groq-free", "bucket": "free proprietary, capped",
                  "installed": bool(os.environ.get("GROQ_API_KEY")), "serving": False,
                  "blocker": None if os.environ.get("GROQ_API_KEY")
                  else "no GROQ_API_KEY held — one-step ask: owner creates a key at "
                       "console.groq.com/keys and stores it via the Secure Vault flow"})
    # xAI Grok seat (Grok kit, 2026-10-28): PAID PROPRIETARY API —
    # per-token pricing, no free tier (docs.x.ai/developers/pricing).
    # Full call path (chat + tool loop + server-side tool specs) lives
    # in xai_client.py; the teardown is ../grok/TEARDOWN.md.
    seats.append({"seat": "xai-grok", "bucket": "paid proprietary",
                  "installed": bool(os.environ.get("XAI_API_KEY")), "serving": False,
                  "blocker": None if os.environ.get("XAI_API_KEY")
                  else "no XAI_API_KEY held — one-step ask: owner creates a key at "
                       "console.x.ai and stores it via the Secure Vault flow; "
                       "the API is paid per token, so the seat also needs the "
                       "owner's spend go-ahead before any live call"})
    return seats


def smoke_test(seat: str) -> dict:
    """One real call per seat, or an honest not-configured result. The
    manifest records THAT a key is configured + this result — never the
    key value."""
    import json as _json
    import urllib.request as _u
    tests = {
        "openrouter-free": ("OPENROUTER_API_KEY", "https://openrouter.ai/api/v1/auth/key"),
        "groq-free": ("GROQ_API_KEY", "https://api.groq.com/openai/v1/models"),
        "gemini-free": ("GEMINI_API_KEY", "https://generativelanguage.googleapis.com/v1beta/models"),
        "xai-grok": ("XAI_API_KEY", "https://api.x.ai/v1/models"),
    }
    if seat not in tests:
        return {"seat": seat, "result": "no remote smoke test for this seat"}
    env, url = tests[seat]
    key = os.environ.get(env)
    if not key:
        return {"seat": seat, "result": "NOT CONFIGURED — no key held; seat not wired"}
    req = _u.Request(url, headers={"Authorization": f"Bearer {key}"} if seat != "gemini-free"
                     else {"x-goog-api-key": key})
    try:
        with _u.urlopen(req, timeout=15) as r:
            return {"seat": seat, "result": f"SMOKE OK — provider answered HTTP {r.status}"}
    except Exception as e:
        return {"seat": seat, "result": f"SMOKE FAILED — {type(e).__name__}: {e}"}


# ---------------------------------------------------------------------------
# Advisory inference (parity build, 2026-10-28).
#
# Until now the seats above were only MEASURED (seat_status / smoke_test);
# nothing in Wielder could actually call one. advise() is that call path.
# It is advisory in the constitution's strict sense: the graph's routing
# reads verifier manifests and exit codes only, so advisory text can be
# recorded on a run but can never change an outcome, issue a pass, or
# unblock a park. The graph consults it only when WIELDER_ADVISORY=1;
# the CLI (`wielder advise`) calls it directly. A seat with no key / no
# server returns an honest NOT CONFIGURED result — never a fabricated
# answer. Network is stdlib urllib only; no new dependency.
# ---------------------------------------------------------------------------

ADVISORY_ENV = "WIELDER_ADVISORY"

# seat -> (kind, url template, default model, key env var or None)
_SEAT_CALLS = {
    "ollama-local": ("ollama", "http://127.0.0.1:11434/api/chat",
                     "llama3.1", "WIELDER_OLLAMA_MODEL", None),
    "openrouter-free": ("openai", "https://openrouter.ai/api/v1/chat/completions",
                        "meta-llama/llama-3.3-70b-instruct:free",
                        "WIELDER_OPENROUTER_MODEL", "OPENROUTER_API_KEY"),
    "groq-free": ("openai", "https://api.groq.com/openai/v1/chat/completions",
                  "llama-3.3-70b-versatile", "WIELDER_GROQ_MODEL", "GROQ_API_KEY"),
    "gemini-free": ("gemini",
                    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    "gemini-2.0-flash", "WIELDER_GEMINI_MODEL", "GEMINI_API_KEY"),
    "xai-grok": ("openai", "https://api.x.ai/v1/chat/completions",
                 "grok-4.3", "WIELDER_XAI_MODEL", "XAI_API_KEY"),
}


def advisory_enabled() -> bool:
    """The graph's advisory seat is opt-in per environment — the
    deterministic seat stays the default and the loop runs end-to-end
    with no model configured at all."""
    return os.environ.get(ADVISORY_ENV) == "1"


def _post_json(url: str, body: dict, headers: dict, timeout: int) -> dict:
    import json as _json
    req = urllib.request.Request(url, data=_json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return _json.loads(r.read())


def _call_seat(seat: str, prompt: str, timeout: int) -> dict:
    kind, url_t, default_model, model_env, key_env = _SEAT_CALLS[seat]
    model = os.environ.get(model_env) or default_model
    key = os.environ.get(key_env) if key_env else None
    if key_env and not key:
        return {"seat": seat, "ok": False, "text": "",
                "detail": f"NOT CONFIGURED — no {key_env} held; seat not wired"}
    from . import constitution as _C
    system = " ".join(_C.NODE_PROMPT_CONSTRAINTS)
    if kind == "ollama":
        data = _post_json(url_t, {"model": model, "stream": False,
                                  "messages": [{"role": "system", "content": system},
                                               {"role": "user", "content": prompt}]}, {}, timeout)
        text = (data.get("message") or {}).get("content", "")
    elif kind == "openai":
        data = _post_json(url_t, {"model": model,
                                  "messages": [{"role": "system", "content": system},
                                               {"role": "user", "content": prompt}]},
                          {"Authorization": f"Bearer {key}"}, timeout)
        text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "")
    else:  # gemini
        data = _post_json(url_t.format(model=model),
                          {"system_instruction": {"parts": [{"text": system}]},
                           "contents": [{"parts": [{"text": prompt}]}]},
                          {"x-goog-api-key": key}, timeout)
        cands = data.get("candidates") or []
        parts = ((cands[0].get("content") or {}).get("parts") if cands else []) or []
        text = "".join(p.get("text", "") for p in parts)
    if not text:
        return {"seat": seat, "ok": False, "text": "", "detail": "seat answered with no text"}
    return {"seat": seat, "ok": True, "text": text, "detail": f"model {model}"}


def advise(prompt: str, seat: str | None = None, timeout: int = 30) -> dict:
    """One advisory completion from the first available seat (or the
    named seat). Returns {seat, ok, text, detail}. Advisory only — see
    the header above; callers must never route on this text."""
    if seat is not None:
        if seat not in _SEAT_CALLS:
            return {"seat": seat, "ok": False, "text": "",
                    "detail": f"unknown seat {seat!r} — no such advisory seat"}
        try:
            return _call_seat(seat, prompt, timeout)
        except Exception as e:
            return {"seat": seat, "ok": False, "text": "",
                    "detail": f"seat call failed — {type(e).__name__}: {e}"}
    status = {s["seat"]: s for s in seat_status()}
    attempts = []
    for name in _SEAT_CALLS:
        st = status.get(name, {})
        if name == "ollama-local" and not st.get("serving"):
            attempts.append(f"{name}: not serving")
            continue
        if name != "ollama-local" and not st.get("installed"):
            attempts.append(f"{name}: not configured")
            continue
        try:
            out = _call_seat(name, prompt, timeout)
        except Exception as e:
            attempts.append(f"{name}: {type(e).__name__}: {e}")
            continue
        if out["ok"]:
            return out
        attempts.append(f"{name}: {out['detail']}")
    return {"seat": None, "ok": False, "text": "",
            "detail": "NOT CONFIGURED — no advisory seat answered (" + "; ".join(attempts) + ")"}
