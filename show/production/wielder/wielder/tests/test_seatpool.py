"""Seatpool tests — personal pool failover, POOL-RISK discipline,
company pool lifecycle/audit, and key-value redaction.
Run: python -m pytest wielder/tests/test_seatpool.py -q
Uses a fake transport only; no network, no real keys (all key strings
below are synthetic test fixtures, not credentials)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import seatpool as S

K1 = "test-key-alpha-0001"
K2 = "test-key-bravo-0002"
K3 = "test-key-charlie-0003"


def ok_transport(prov, key, prompt, system, model, timeout):
    return f"answer via {S.fingerprint(key)}"


def make_cap_transport(fail_fps):
    def t(prov, key, prompt, system, model, timeout):
        if S.fingerprint(key) in fail_fps:
            raise S.CapError(429, "rate limited")
        return f"answer via {S.fingerprint(key)}"
    return t


# -- personal pool: loading / fingerprints -----------------------------------

def test_pool_loading_counts_and_fingerprints():
    env = {"GROQ_API_KEY": K1, "GROQ_API_KEY_2": K2, "GROQ_API_KEY_3": K3}
    keys = S.load_personal_pool("groq", env)
    assert len(keys) == 3
    assert keys[0].fp == S.fingerprint(K1) and len(keys[0].fp) == 8
    # duplicate value under the WIELDER_ spelling counts once
    env2 = {"GROQ_API_KEY": K1, "WIELDER_GROQ_API_KEY": K1}
    assert len(S.load_personal_pool("groq", env2)) == 1
    assert S.load_personal_pool("groq", {}) == []


# -- personal pool: POOL-RISK discipline --------------------------------------

def test_pool_risk_primary_only_by_default():
    env = {"GROQ_API_KEY": K1, "GROQ_API_KEY_2": K2}
    active = S.active_keys("groq", env)
    assert len(active) == 1 and active[0].value == K1
    st = {e["provider"]: e for e in S.personal_status(env)}
    assert st["groq"]["pool_flag"] == "POOL-RISK: primary key only"
    assert st["groq"]["keys_held"] == 2 and st["groq"]["keys_active"] == 1


def test_pool_risk_accept_flag_unlocks_pool():
    env = {"GROQ_API_KEY": K1, "GROQ_API_KEY_2": K2, S.POOL_RISK_ACCEPT_ENV: "1"}
    assert len(S.active_keys("groq", env)) == 2
    st = {e["provider"]: e for e in S.personal_status(env)}
    assert st["groq"]["pool_flag"] == "POOL-RISK"
    assert st["groq"]["keys_active"] == 2


# -- personal pool: rotation / cooldown / exhaustion ---------------------------

def test_rotation_on_429():
    env = {"OPENROUTER_API_KEY": K1, "OPENROUTER_API_KEY_2": K2,
           S.POOL_RISK_ACCEPT_ENV: "1"}
    t = make_cap_transport({S.fingerprint(K1)})
    res = S.call_personal("openrouter", "hi", environ=env, transport=t)
    assert res.ok and res.fingerprint == S.fingerprint(K2)
    assert res.attempts[0]["outcome"] == "cap-429-cooling-down"


def test_cooldown_respected_across_calls():
    env = {"OPENROUTER_API_KEY": K1, "OPENROUTER_API_KEY_2": K2,
           S.POOL_RISK_ACCEPT_ENV: "1"}
    cache: dict = {}
    t = make_cap_transport({S.fingerprint(K1)})
    S.call_personal("openrouter", "hi", environ=env, transport=t, _pool_cache=cache)
    seen = []
    def t2(prov, key, prompt, system, model, timeout):
        seen.append(S.fingerprint(key))
        return "ok"
    res = S.call_personal("openrouter", "hi", environ=env, transport=t2, _pool_cache=cache)
    assert res.ok and seen == [S.fingerprint(K2)]  # K1 skipped while cooling down


def test_pool_exhaustion_returns_local_fallback_signal():
    env = {"OPENROUTER_API_KEY": K1, "OPENROUTER_API_KEY_2": K2,
           S.POOL_RISK_ACCEPT_ENV: "1"}
    t = make_cap_transport({S.fingerprint(K1), S.fingerprint(K2)})
    res = S.call_personal("openrouter", "hi", environ=env, transport=t)
    assert not res.ok and res.fallback_to_local is True
    # one pass only: exactly 2 attempts, no retry storm
    assert len([a for a in res.attempts if a["outcome"] == "cap-429-cooling-down"]) == 2


def test_no_keys_returns_fallback_not_exception():
    res = S.call_personal("groq", "hi", environ={}, transport=ok_transport)
    assert not res.ok and res.fallback_to_local is True
    assert "NOT CONFIGURED" in res.detail


def test_non_cap_error_does_not_rotate():
    env = {"OPENROUTER_API_KEY": K1, "OPENROUTER_API_KEY_2": K2,
           S.POOL_RISK_ACCEPT_ENV: "1"}
    calls = []
    def boom(prov, key, prompt, system, model, timeout):
        calls.append(key)
        raise RuntimeError("connection reset")
    res = S.call_personal("openrouter", "hi", environ=env, transport=boom)
    assert not res.ok and not res.fallback_to_local and len(calls) == 1


# -- company pool ---------------------------------------------------------------

def _company(tmp_path, env):
    return S.CompanyPool(store_path=tmp_path / "company-pool.json", environ=env)


def test_company_pool_empty_by_default(tmp_path):
    pool = _company(tmp_path, {})
    assert pool.members() == []
    st = S.company_status(pool)
    assert st["members_total"] == 0 and st["members_active"] == 0
    res = pool.call("groq", "hi", transport=ok_transport)
    assert not res.ok and res.fallback_to_local is True


def test_company_enrol_revoke_lifecycle(tmp_path):
    env = {"EMP_A_GROQ_KEY": K1, "EMP_B_GROQ_KEY": K2}
    pool = _company(tmp_path, env)
    pool.enrol("emp-a", "Employee A", "groq", "EMP_A_GROQ_KEY")
    pool.enrol("emp-b", "Employee B", "groq", "EMP_B_GROQ_KEY")
    assert len(pool.members(active_only=True)) == 2
    # store holds env var NAMES only — never values
    raw = (tmp_path / "company-pool.json").read_text()
    assert "EMP_A_GROQ_KEY" in raw and K1 not in raw and K2 not in raw
    # persisted across instances
    pool2 = _company(tmp_path, env)
    assert len(pool2.members()) == 2
    assert pool.revoke("emp-a", "groq") == 1
    assert [m.member_id for m in pool.members(active_only=True)] == ["emp-b"]
    with pytest.raises(ValueError):
        pool.enrol("emp-b", "Employee B", "groq", "EMP_B_GROQ_KEY")


def test_company_revoked_member_never_selected(tmp_path):
    env = {"EMP_A_GROQ_KEY": K1, "EMP_B_GROQ_KEY": K2}
    pool = _company(tmp_path, env)
    pool.enrol("emp-a", "Employee A", "groq", "EMP_A_GROQ_KEY")
    pool.enrol("emp-b", "Employee B", "groq", "EMP_B_GROQ_KEY")
    pool.revoke("emp-a")
    # emp-a's key would fail; emp-b serves. Revoked seat must not be tried.
    t = make_cap_transport({S.fingerprint(K1)})
    res = pool.call("groq", "hi", transport=t)
    assert res.ok and res.member_id == "emp-b"
    assert all(a["member_id"] != "emp-a" for a in res.attempts)


def test_company_failover_and_attribution_shape(tmp_path):
    env = {"EMP_A_GROQ_KEY": K1, "EMP_B_GROQ_KEY": K2}
    pool = _company(tmp_path, env)
    pool.enrol("emp-a", "Employee A", "groq", "EMP_A_GROQ_KEY")
    pool.enrol("emp-b", "Employee B", "groq", "EMP_B_GROQ_KEY")
    t = make_cap_transport({S.fingerprint(K1)})
    res = pool.call("groq", "hi", transport=t)
    assert res.ok and res.member_id == "emp-b"
    assert pool.audit, "every company call must produce audit records"
    for rec in pool.audit:
        assert set(rec) == {"ts", "pool", "provider", "member_id",
                            "key_fingerprint", "outcome"}
        assert rec["pool"] == "company" and rec["provider"] == "groq"
    outcomes = {(r["member_id"], r["outcome"]) for r in pool.audit}
    assert ("emp-a", "cap-429-cooling-down") in outcomes
    assert ("emp-b", "ok") in outcomes
    assert pool.audit[0]["key_fingerprint"] in (S.fingerprint(K1), S.fingerprint(K2))


# -- status separation + redaction ----------------------------------------------

def test_status_sections_are_separate(tmp_path):
    env = {"GROQ_API_KEY": K1}
    pool = _company(tmp_path, env)
    st = S.seat_status(env, pool)
    assert "personal_pool" in st and "company_pool" in st
    personal = {e["provider"]: e for e in st["personal_pool"]}
    assert personal["groq"]["keys_held"] == 1
    assert st["company_pool"]["members_total"] == 0


def test_no_key_value_leaks_anywhere(tmp_path):
    env = {"GROQ_API_KEY": K1, "GROQ_API_KEY_2": K2, "EMP_A_GROQ_KEY": K3,
           S.POOL_RISK_ACCEPT_ENV: "1"}
    pool = _company(tmp_path, env)
    pool.enrol("emp-a", "Employee A", "groq", "EMP_A_GROQ_KEY")
    res_p = S.call_personal("groq", "hi", environ=env, transport=ok_transport)
    res_c = pool.call("groq", "hi", transport=ok_transport)
    blob = repr(S.seat_status(env, pool)) + repr(res_p) + repr(res_c) \
        + repr(pool.audit) + (tmp_path / "company-pool.json").read_text()
    for secret in (K1, K2, K3):
        assert secret not in blob
