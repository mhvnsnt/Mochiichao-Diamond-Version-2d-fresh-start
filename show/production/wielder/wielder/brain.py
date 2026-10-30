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

from . import seatpool as _seatpool

# Seat -> seatpool provider id (parity round 2). Remote advisory seats
# are called through the seat layer: keys come from the vault-injected
# environment only, pools fail over on provider caps, and an exhausted
# pool degrades to the local seat instead of erroring. Key values never
# appear in this module's outputs — fingerprints only (seatpool).
_SEAT_TO_PROVIDER = {p.seat: p.id for p in _seatpool.PROVIDERS.values()}
_POOL_CACHE: dict = {}


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
                  "blocker": None if serving else
                  ("ollama binary present but server not answering on "
                   "127.0.0.1:11434" if binary else
                   "ollama binary not installed on this VM")})
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
    # Self-hosted Grok-pattern seat (grok-local kit, 2026-10-28): OPEN
    # WEIGHTS (Qwen3 family, Apache-2.0) served by a vLLM endpoint the
    # owner operates himself — no provider, no per-token fee; the only
    # cost is the GPU seat (free Kaggle test seat / serverless /
    # rented pod, all priced in ../grok-local/DEPLOY-RUNBOOK.md).
    # Serving is MEASURED with a live probe of the endpoint's /models,
    # the same way the ollama seat is measured. Full call path in
    # local_client.py; package in ../grok-local/.
    local_base = os.environ.get("GROK_LOCAL_BASE_URL")
    local_serving = False
    if local_base:
        try:
            headers = {}
            if os.environ.get("GROK_LOCAL_API_KEY"):
                headers["Authorization"] = f"Bearer {os.environ['GROK_LOCAL_API_KEY']}"
            req = urllib.request.Request(local_base.rstrip("/") + "/models",
                                         headers=headers)
            with urllib.request.urlopen(req, timeout=2) as r:
                local_serving = r.status == 200
        except Exception:
            local_serving = False
    seats.append({"seat": "grok-local",
                  "bucket": "open weights, self-hosted (Apache-2.0; no provider fee)",
                  "installed": bool(local_base), "serving": local_serving,
                  "blocker": None if local_base
                  else "no GROK_LOCAL_BASE_URL held — deploy the endpoint first "
                       "(grok-local/DEPLOY-RUNBOOK.md: free Kaggle test seat, "
                       "serverless, or rented pod), then set GROK_LOCAL_BASE_URL "
                       "to its /v1 address"})
    # Seat pools (parity round 2): attach personal-pool extension data
    # (keys held/active, POOL-OK / POOL-RISK flag, caps, active key
    # fingerprint — never a key value) to each provider seat, and add
    # the two new free-tier seats the sweep verified (Mistral,
    # Cloudflare). A pool sibling key (_2...) also counts as installed.
    pool = {p["seat"]: p for p in _seatpool.personal_status()}
    for entry in seats:
        if entry["seat"] in pool:
            entry["pool"] = pool[entry["seat"]]
            if pool[entry["seat"]]["keys_held"]:
                entry["installed"] = True
                entry["blocker"] = None
    for seat_name in ("mistral-free", "cloudflare-free"):
        prov = next(p for p in _seatpool.PROVIDERS.values() if p.seat == seat_name)
        held = pool[seat_name]["keys_held"]
        seats.append({"seat": seat_name, "bucket": "free proprietary, capped",
                      "installed": held > 0, "serving": False,
                      "blocker": None if held else
                      f"no {prov.key_env} held — key not held; see the seat shortlist",
                      "pool": pool[seat_name]})
    return seats


def pool_status() -> dict:
    """Seat-pool sections (parity round 2): PERSONAL pool (the owner's
    own accounts, POOL-OK / POOL-RISK flagged) and COMPANY pool (real
    distinct employees only; ships empty — the owner's personal
    accounts are not members) as two separate sections."""
    return _seatpool.seat_status()


def company_pool_status() -> dict:
    return _seatpool.company_status()


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
        "mistral-free": ("MISTRAL_API_KEY", "https://api.mistral.ai/v1/models"),
        # cloudflare-free has no account-less smoke URL (every Workers AI
        # route is account-scoped), so it has no entry here on purpose.
        "xai-grok": ("XAI_API_KEY", "https://api.x.ai/v1/models"),
    }
    if seat == "grok-local":
        # The URL is the owner's own endpoint — no fixed address
        # exists to put in the table above.
        base = os.environ.get("GROK_LOCAL_BASE_URL")
        if not base:
            return {"seat": seat,
                    "result": "NOT CONFIGURED — no GROK_LOCAL_BASE_URL held; seat not wired"}
        headers = {}
        if os.environ.get("GROK_LOCAL_API_KEY"):
            headers["Authorization"] = f"Bearer {os.environ['GROK_LOCAL_API_KEY']}"
        req = _u.Request(base.rstrip("/") + "/models", headers=headers)
        try:
            with _u.urlopen(req, timeout=15) as r:
                return {"seat": seat,
                        "result": f"SMOKE OK — self-hosted endpoint answered HTTP {r.status}"}
        except Exception as e:
            return {"seat": seat, "result": f"SMOKE FAILED — {type(e).__name__}: {e}"}
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

# Ollama seat model (parity round 2, licence sweep §12, verified
# 2026-10-28): qwen2.5-coder:7b is Apache-2.0. The family's 3B size is
# NOT used — it is the lone Qwen Research License (free-but-restricted)
# carve-out in the family. Fallback size: qwen2.5-coder:1.5b (Apache-2.0).
OLLAMA_DEFAULT_MODEL = "qwen2.5-coder:7b"

# Context cap for the local seat on an 8 GB CPU-only VM: the 7B model's
# native context is 32K, but an uncapped KV cache would blow the RAM
# budget. 8192 keeps the model sole-resident and usable; override with
# WIELDER_OLLAMA_NUM_CTX.
OLLAMA_DEFAULT_NUM_CTX = 8192


def _ollama_num_ctx() -> int:
    try:
        return int(os.environ.get("WIELDER_OLLAMA_NUM_CTX") or OLLAMA_DEFAULT_NUM_CTX)
    except ValueError:
        return OLLAMA_DEFAULT_NUM_CTX


# A 30 s cap makes the local seat unusable on a CPU-only VM: measured
# 2026-10-28 on this VM class, prompt evaluation alone for the 7B seat
# took ~24 s and a full advisory answer ~115 s of inference (plus
# ~95 s cold model load). The local seat therefore gets a floor;
# hosted seats keep the caller's timeout unchanged.
OLLAMA_MIN_TIMEOUT = 300


def _effective_timeout(seat: str, timeout: int) -> int:
    if seat == "ollama-local":
        return max(timeout, OLLAMA_MIN_TIMEOUT)
    return timeout


# seat -> (kind, url template, default model, key env var or None)
_SEAT_CALLS = {
    "ollama-local": ("ollama", "http://127.0.0.1:11434/api/chat",
                     OLLAMA_DEFAULT_MODEL, "WIELDER_OLLAMA_MODEL", None),
    "openrouter-free": ("openai", "https://openrouter.ai/api/v1/chat/completions",
                        "meta-llama/llama-3.3-70b-instruct:free",
                        "WIELDER_OPENROUTER_MODEL", "OPENROUTER_API_KEY"),
    "groq-free": ("openai", "https://api.groq.com/openai/v1/chat/completions",
                  "llama-3.3-70b-versatile", "WIELDER_GROQ_MODEL", "GROQ_API_KEY"),
    "gemini-free": ("gemini",
                    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    "gemini-2.0-flash", "WIELDER_GEMINI_MODEL", "GEMINI_API_KEY"),
    # New free-tier seats (parity round 2 seat sweep). Both are called
    # through the seatpool layer (see _call_seat); these entries exist
    # so advise() iterates them and named-seat validation knows them.
    "mistral-free": ("openai", "https://api.mistral.ai/v1/chat/completions",
                     "mistral-small-latest", "WIELDER_MISTRAL_MODEL", "MISTRAL_API_KEY"),
    "cloudflare-free": ("openai",
                        "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions",
                        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
                        "WIELDER_CLOUDFLARE_MODEL", "CLOUDFLARE_API_KEY"),
    "xai-grok": ("openai", "https://api.x.ai/v1/chat/completions",
                 "grok-4.3", "WIELDER_XAI_MODEL", "XAI_API_KEY"),
    # grok-local: the URL slot names the env var it is resolved from
    # in _call_seat (the owner's endpoint has no fixed address); the
    # key slot is None because the endpoint key is optional at the
    # protocol level — local_client resolves it. Default model is
    # the --served-model-name every grok-local deployment uses.
    "grok-local": ("openai", "env:GROK_LOCAL_BASE_URL",
                   "grok-local", "WIELDER_LOCAL_MODEL", None),
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


def _pool_transport(provider, key: str, prompt: str, system: str,
                    model: str, timeout: int) -> str:
    """brain's HTTP code path, injected into the seat layer as its
    transport (one HTTP implementation for every seat, local or
    pooled). Builds the same request shapes seatpool documents and
    converts an HTTP 429 into seatpool.CapError so pool failover —
    not this function — decides what happens on a cap."""
    import urllib.error as _ue
    if provider.kind == "gemini":
        url = provider.base_url.format(model=model)
        body = {"system_instruction": {"parts": [{"text": system}]},
                "contents": [{"parts": [{"text": prompt}]}]}
        headers = {"x-goog-api-key": key}
    else:
        url = provider.base_url
        if provider.id == "cloudflare":
            url = url.format(account_id=os.environ.get("CLOUDFLARE_ACCOUNT_ID", ""))
        body = {"model": model,
                "messages": [{"role": "system", "content": system},
                             {"role": "user", "content": prompt}]}
        headers = {"Authorization": f"Bearer {key}"}
    try:
        data = _post_json(url, body, headers, timeout)
    except _ue.HTTPError as e:
        if e.code == 429:
            raise _seatpool.CapError(429, "provider returned HTTP 429") from e
        raise
    if provider.kind == "gemini":
        cands = data.get("candidates") or []
        parts = ((cands[0].get("content") or {}).get("parts") if cands else []) or []
        return "".join(p.get("text", "") for p in parts)
    return ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "")


def _call_seat(seat: str, prompt: str, timeout: int) -> dict:
    # Remote seats route through the seat layer (parity round 2): pool
    # loading from the vault-injected environment, cap failover across
    # the owner's own keys, POOL-RISK primary-only discipline, and a
    # typed fallback_to_local signal instead of an error. The local
    # Ollama seat below is unchanged and never goes through a pool.
    provider_id = _SEAT_TO_PROVIDER.get(seat)
    if provider_id is not None:
        from . import constitution as _C
        system = " ".join(_C.NODE_PROMPT_CONSTRAINTS)
        res = _seatpool.call_personal(provider_id, prompt, system=system,
                                      timeout=timeout, _pool_cache=_POOL_CACHE,
                                      transport=_pool_transport)
        if res.ok:
            return {"seat": seat, "ok": True, "text": res.text,
                    "detail": res.detail or f"model via pool key {res.fingerprint}"}
        return {"seat": seat, "ok": False, "text": "", "detail": res.detail,
                "fallback_to_local": res.fallback_to_local}
    kind, url_t, default_model, model_env, key_env = _SEAT_CALLS[seat]
    model = os.environ.get(model_env) or default_model
    key = os.environ.get(key_env) if key_env else None
    if key_env and not key:
        return {"seat": seat, "ok": False, "text": "",
                "detail": f"NOT CONFIGURED — no {key_env} held; seat not wired"}
    if seat == "grok-local":
        from . import local_client as _LC
        if not _LC.configured():
            return {"seat": seat, "ok": False, "text": "",
                    "detail": "NOT CONFIGURED — no GROK_LOCAL_BASE_URL held; "
                              "seat not wired"}
        url_t = _LC.chat_url()
        key = _LC.api_key()
    from . import constitution as _C
    system = " ".join(_C.NODE_PROMPT_CONSTRAINTS)
    if kind == "ollama":
        data = _post_json(url_t, {"model": model, "stream": False,
                                  "options": {"num_ctx": _ollama_num_ctx()},
                                  "messages": [{"role": "system", "content": system},
                                               {"role": "user", "content": prompt}]}, {}, timeout)
        text = (data.get("message") or {}).get("content", "")
    elif kind == "openai":
        # grok-local may legitimately run keyless on a private
        # address; every other openai seat has a key by this point
        # (checked above), so the header is only omitted there.
        headers = {"Authorization": f"Bearer {key}"} if key else {}
        data = _post_json(url_t, {"model": model,
                                  "messages": [{"role": "system", "content": system},
                                               {"role": "user", "content": prompt}]},
                          headers, timeout)
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
            out = _call_seat(seat, prompt, _effective_timeout(seat, timeout))
        except Exception as e:
            return {"seat": seat, "ok": False, "text": "",
                    "detail": f"seat call failed — {type(e).__name__}: {e}"}
        if out.get("ok") or not out.get("fallback_to_local") or seat == "ollama-local":
            return out
        # Seat priority rule: an exhausted remote pool degrades to the
        # local seat instead of erroring (parity round 2, Addendum 2).
        try:
            local = _call_seat("ollama-local", prompt,
                               _effective_timeout("ollama-local", timeout))
        except Exception as e:
            local = {"seat": "ollama-local", "ok": False, "text": "",
                     "detail": f"seat call failed — {type(e).__name__}: {e}"}
        if local.get("ok"):
            local["detail"] = (f"{local['detail']} (fell back to the local seat "
                               f"after {seat}: {out['detail']})")
            return local
        return {"seat": seat, "ok": False, "text": "",
                "detail": f"{out['detail']}; local fallback also unavailable ({local['detail']})"}
    status = {s["seat"]: s for s in seat_status()}
    attempts = []
    for name in _SEAT_CALLS:
        st = status.get(name, {})
        if name == "ollama-local" and not st.get("serving"):
            attempts.append(f"{name}: not serving")
            continue
        if name != "ollama-local" and not (st.get("installed")
                                           or (st.get("pool") or {}).get("keys_held")):
            attempts.append(f"{name}: not configured")
            continue
        try:
            out = _call_seat(name, prompt, _effective_timeout(name, timeout))
        except Exception as e:
            attempts.append(f"{name}: {type(e).__name__}: {e}")
            continue
        if out["ok"]:
            return out
        attempts.append(f"{name}: {out['detail']}")
    return {"seat": None, "ok": False, "text": "",
            "detail": "NOT CONFIGURED — no advisory seat answered (" + "; ".join(attempts) + ")"}
