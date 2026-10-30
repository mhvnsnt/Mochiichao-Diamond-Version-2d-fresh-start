"""Brain <-> seatpool integration (parity round 2, coordinator wiring).

Proves: seat_status carries the pool extension data + the two new
free-tier seats; advise() routes remote seats through the seat layer
(cap failover lives in seatpool's own tests); an exhausted remote pool
degrades to the local seat per the seat priority rule; and no key
value ever appears in any status surface.
"""
import json

import pytest

from wielder import brain, seatpool


@pytest.fixture(autouse=True)
def _fresh_pool_cache():
    brain._POOL_CACHE.clear()
    yield
    brain._POOL_CACHE.clear()


def _seat(status, name):
    return next(s for s in status if s["seat"] == name)


def test_seat_status_carries_pool_data_and_new_seats(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-or-testvalue-0001")
    status = brain.seat_status()
    entry = _seat(status, "openrouter-free")
    assert entry["installed"] is True
    assert entry["pool"]["keys_held"] == 1
    assert entry["pool"]["pool_flag"].startswith("POOL-RISK")
    assert entry["pool"]["active_key_fingerprint"] == seatpool.fingerprint(
        "sk-or-testvalue-0001")
    for name in ("mistral-free", "cloudflare-free"):
        e = _seat(status, name)
        assert e["bucket"] == "free proprietary, capped"
        assert e["pool"]["provider"] in ("mistral", "cloudflare")


def test_pool_status_sections_personal_and_company(monkeypatch):
    monkeypatch.delenv("WIELDER_COMPANY_POOL_FILE", raising=False)
    pool = brain.pool_status()
    assert [p["provider"] for p in pool["personal_pool"]] == [
        "openrouter", "groq", "gemini", "mistral", "cloudflare"]
    assert pool["company_pool"]["members_total"] == 0
    assert brain.company_pool_status()["members_active"] == 0


def test_advise_remote_seat_goes_through_pool(monkeypatch):
    # brain injects its own _post_json as the seat layer's transport:
    # the pool picks the key, brain's HTTP path carries it.
    monkeypatch.setenv("GROQ_API_KEY", "gsk-testvalue-0002")
    seen = {}

    def fake_post(url, body, headers, timeout):
        seen.update(url=url, headers=headers, body=body)
        return {"choices": [{"message": {"content": "pooled answer"}}]}

    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("hello", seat="groq-free")
    assert out["ok"] is True and out["seat"] == "groq-free"
    assert out["text"] == "pooled answer"
    assert seen["url"] == "https://api.groq.com/openai/v1/chat/completions"
    assert seen["headers"]["Authorization"] == "Bearer gsk-testvalue-0002"
    assert seen["body"]["model"] == "llama-3.3-70b-versatile"


def test_advise_exhausted_pool_degrades_to_local(monkeypatch):
    # POOL-RISK discipline at the brain boundary: two Groq keys held,
    # primary only is tried; its HTTP 429 (converted to CapError by
    # brain's transport) exhausts the pool, and advise() degrades to
    # the local seat instead of erroring.
    import urllib.error
    monkeypatch.setenv("GROQ_API_KEY", "gsk-testvalue-0003")
    monkeypatch.setenv("GROQ_API_KEY_2", "gsk-testvalue-0004")
    tried = []

    def fake_post(url, body, headers, timeout):
        tried.append(headers.get("Authorization"))
        if "groq" in url:
            raise urllib.error.HTTPError(url, 429, "capped", None, None)
        return {"message": {"content": "local answer"}}

    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("hello", seat="groq-free")
    assert out["ok"] is True and out["seat"] == "ollama-local"
    assert out["text"] == "local answer"
    assert "fell back to the local seat" in out["detail"]
    assert tried[0] == "Bearer gsk-testvalue-0003"
    assert "Bearer gsk-testvalue-0004" not in tried  # POOL-RISK: primary only


def test_no_key_values_in_any_status_surface(monkeypatch):
    values = {"OPENROUTER_API_KEY": "sk-or-secret-aaaa",
              "GROQ_API_KEY": "gsk-secret-bbbb",
              "GEMINI_API_KEY": "gm-secret-cccc",
              "MISTRAL_API_KEY": "ms-secret-dddd",
              "CLOUDFLARE_API_KEY": "cf-secret-eeee"}
    for k, v in values.items():
        monkeypatch.setenv(k, v)
    blob = json.dumps(brain.seat_status()) + json.dumps(brain.pool_status())
    for v in values.values():
        assert v not in blob
    # fingerprints are the only key identity allowed, and they do appear
    assert seatpool.fingerprint("sk-or-secret-aaaa") in blob
