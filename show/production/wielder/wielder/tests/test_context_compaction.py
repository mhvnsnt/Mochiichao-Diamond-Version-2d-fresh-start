"""WIELDER context-compaction tests (parity follow-up, 2026-10-28).

The three properties the card was built against, each as a test:
(a) a synthetic long run compacts and continues with its finish-gate
    target intact — the manifest evaluate() routes on is the identical
    object after compaction;
(b) the digest preserves every owner ruling / standing-authorization
    reference the history cites (closed-vocabulary scan — dropping one
    is a failure here, by construction in context.py);
(c) compaction never fires below its threshold.

Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


def _entry(tool, raw="", result=None, payload=None, ok=True, exit_code=0):
    return {"tool": tool, "ok": ok, "exit_code": exit_code,
            "result": result or {}, "raw_output": raw, "payload": payload or {}}


def _manifest_entry(target, failed=("AC-03",)):
    clauses = [{"id": "AC-01", "status": "PASS", "measured": "spec ok"},
               {"id": "AC-03", "status": "FAIL" if "AC-03" in failed else "PASS",
                "measured": "MAD 50.96"}]
    manifest = {"exists": True, "target_id": target, "clauses": clauses,
                "owner_gate": {"status": "PENDING"},
                "manifest_path": "/finish-gate/evidence/demo.json",
                "sha256": "ab" * 32}
    return _entry("read_manifest", result=manifest, payload={"target_id": target})


def _manifest_of(entries, target):
    """graph.evaluate's lookup, replicated: the reversed search for the
    run target's read_manifest result."""
    man = next((r for r in reversed(entries)
                if r["tool"] == "read_manifest"
                and r.get("payload", {}).get("target_id") == target), None)
    return (man or {}).get("result", {})


def _fat_history(n=60, size=4000, target="demo-target"):
    entries = [_entry("check_artifact", raw="x" * size) for _ in range(n)]
    entries.insert(2, _entry("run_verifier", raw="verifier log " + "y" * size,
                             payload={"target_id": target}))
    entries.insert(3, _manifest_entry(target))
    return entries


# ---------- (c) never below threshold ----------

def test_compaction_never_fires_below_threshold():
    from wielder import context
    entries = [_entry("check_artifact", raw="small")]
    out = context.compact_history(entries, target_id="demo-target")
    assert out["fired"] is False
    assert out["entries"] is entries  # no-op by identity, not resemblance
    assert out["digest"] is None


def test_maybe_compact_env_gate(monkeypatch):
    from wielder import context
    entries = _fat_history()
    # default (no env var): ON — fires on the fat history
    monkeypatch.delenv("WIELDER_COMPACTION", raising=False)
    new, wrapper = context.maybe_compact(entries, target_id="demo-target")
    assert wrapper is not None and wrapper["fired"] is True
    assert new is not entries
    # WIELDER_COMPACTION=1: still on
    monkeypatch.setenv("WIELDER_COMPACTION", "1")
    new, wrapper = context.maybe_compact(entries, target_id="demo-target")
    assert wrapper is not None and wrapper["fired"] is True
    # WIELDER_COMPACTION=0 is the off switch: untouched even when huge
    monkeypatch.setenv("WIELDER_COMPACTION", "0")
    same, wrapper = context.maybe_compact(entries, target_id="demo-target")
    assert same is entries and wrapper is None


# ---------- (a) long run compacts, gate target intact ----------

def test_long_run_compacts_with_gate_target_intact():
    from wielder import context
    entries = _fat_history()
    assert context.measure(entries) > 200_000
    out = context.compact_history(entries, target_id="demo-target", threshold=50_000)
    assert out["fired"] is True
    assert out["digest"]["target_id"] == "demo-target"
    # The router's input survives as the identical object (pinned verbatim).
    assert _manifest_of(out["entries"], "demo-target") is _manifest_of(entries, "demo-target")
    # ...so the routing decision inputs are unchanged: same failed clauses.
    failed_before = [c["id"] for c in _manifest_of(entries, "demo-target")["clauses"]
                     if c["status"] != "PASS"]
    failed_after = [c["id"] for c in _manifest_of(out["entries"], "demo-target")["clauses"]
                    if c["status"] != "PASS"]
    assert failed_before == failed_after == ["AC-03"]
    # And the history actually shrank.
    assert out["compacted_chars"] < out["original_chars"] // 2
    assert out["entries"][0]["tool"] == "context_digest"


# ---------- (b) rulings / authorizations preserved ----------

def test_digest_preserves_every_cited_ruling_and_authz_reference():
    from wielder import context, rules
    rulings = rules.RULES["settled_rulings_never_relitigated"]
    cited_full = rulings[0]
    cited_by_key = rulings[1].split(";")[0].split("—")[0].strip()  # rules.py's key form
    entries = [
        _entry("check_artifact", raw=f"plan note — settled law applies: {cited_full}"),
        _entry("run_registered_script", raw=f"applied per registry: {cited_by_key}"),
        _entry("run_verifier", raw="preflight needs class local-builds-renders granted"),
        _entry("check_artifact", raw="never ask for payment-approval in a run note"),
        _entry("check_artifact", raw="plate is set in The Dark Forest at dawn"),
        _entry("check_artifact", raw="filler " + "z" * 3000),
    ]
    out = context.compact_history(entries, target_id="demo-target", threshold=1)
    assert out["fired"] is True
    pinned = {r["reference"] for r in out["digest"]["pinned_references"]}
    # Full-form cite and key-form cite both preserve the canonical ruling.
    assert rulings[0] in pinned and rulings[1] in pinned
    # Standing-authorization classes survive verbatim.
    assert "local-builds-renders" in pinned and "payment-approval" in pinned
    # Canon lock survives verbatim.
    assert "The Dark Forest" in pinned
    # Everything pinned is also in the rendered digest the loop continues from.
    for ref in pinned:
        assert ref in out["rendered"]
    # Negative control: an uncited ruling is not invented into the digest.
    assert rulings[2] not in pinned and rulings[3] not in pinned


def test_digest_stays_bounded_and_keeps_references_under_pressure():
    from wielder import context, rules
    ruling = rules.RULES["settled_rulings_never_relitigated"][0]
    entries = [_entry("check_artifact", raw=(ruling + " ") * 5 + "q" * 30_000)
               for _ in range(30)]
    out = context.compact_history(entries, target_id="demo-target", threshold=1)
    assert out["fired"] is True
    assert len(out["rendered"]) <= context.digest_cap_chars()
    assert ruling in out["rendered"]  # pinned section is never elided
    assert out["compacted_chars"] < out["original_chars"] // 4


# ---------- wiring pins ----------

def test_graph_wiring_is_present_and_state_carries_digest():
    import inspect

    from wielder import context, graph
    assert graph.context_mod is context
    assert "context_digest" in graph.WielderState.__annotations__
    src = inspect.getsource(graph)
    assert "context_compact" in src and "WIELDER_COMPACTION" in context.COMPACTION_ENV


def test_vocabulary_is_wielders_own_data():
    from wielder import context
    vocab = context.reference_vocabulary()
    kinds = {k for _, k, _ in vocab}
    assert "owner-ruling" in kinds and "standing-authorization class" in kinds
    refs = {r for r, _, _ in vocab}
    assert "payment-approval" in refs  # never-grantable set is in the vocabulary
    assert len(vocab) >= 12
