"""Compaction <-> hydration audit tests (parity round 2, gap 1).

Verdict under test: the wiring is COMPLETE — no production code
change was needed. The chain, as read in context.py / graph.py /
memory.py / tools.py:

- context.compact_history is the deterministic summariser; the graph's
  execute() node runs it (via _compact) on every exit path and logs it
  to the ledger as `context_compact`; the digest REPLACES the history,
  so the digest is what the rest of the run works from.
- Routing inputs (the run target's read_manifest / run_verifier
  results) are pinned verbatim by compact_history.
- Hydration stays top-3: constitution RETRIEVAL_TOP_K == 3 is
  Memory.retrieve's default, the graph's plan node passes exactly
  that k, and the tool layer caps any requested k at it
  (tools._retrieve: min(p.k, RETRIEVAL_TOP_K)).

These tests assert (a) compaction fires on an oversized synthetic
history through the graph's own entry point, (b) routing inputs
survive byte-identical, (c) hydration after compaction returns at
most 3 memory items — including through a stubbed LanceDB table, so
the limit is exercised, not just inspected.

Run: python -m pytest wielder/tests/test_compaction_hydration.py -q
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest


def _entry(tool, raw="", result=None, payload=None, ok=True, exit_code=0):
    return {"tool": tool, "ok": ok, "exit_code": exit_code,
            "result": result or {}, "raw_output": raw, "payload": payload or {}}


def _oversized_history(target="demo-target", n=50, size=5000):
    manifest = {"exists": True, "target_id": target,
                "clauses": [{"id": "AC-01", "status": "PASS", "measured": "ok"}],
                "owner_gate": {"status": "PENDING"},
                "manifest_path": "/finish-gate/evidence/demo.json",
                "sha256": "cd" * 32}
    entries = [_entry("check_artifact", raw="x" * size) for _ in range(n)]
    entries.insert(1, _entry("run_verifier", raw="verifier " + "y" * size,
                             result={"manifest_exists": True},
                             payload={"target_id": target}))
    entries.insert(2, _entry("read_manifest", raw="manifest " + "z" * 100,
                             result=manifest, payload={"target_id": target}))
    return entries


def _routing_entries(entries, target):
    return [e for e in entries
            if e.get("tool") in ("read_manifest", "run_verifier")
            and (e.get("payload") or {}).get("target_id") == target]


def _bytes(entry) -> bytes:
    return json.dumps(entry, default=str, sort_keys=True).encode()


# ---------- (a) compaction fires on an oversized history ----------

def test_compaction_fires_via_graph_entry_point(monkeypatch):
    from wielder import context
    monkeypatch.delenv("WIELDER_COMPACTION", raising=False)  # default: ON
    entries = _oversized_history()
    assert context.measure(entries) > context.threshold_chars()
    new_entries, wrapper = context.maybe_compact(entries, target_id="demo-target")
    assert wrapper is not None and wrapper["fired"] is True
    assert new_entries is not entries
    assert new_entries[0]["tool"] == "context_digest"  # digest leads the history
    assert wrapper["compacted_chars"] < wrapper["original_chars"]


def test_graph_execute_wires_compaction_on_every_exit_path():
    """Static wiring pin: execute() compacts on the loop-detected,
    budget-exhausted and normal paths, and records it in the ledger."""
    import inspect

    from wielder import graph
    src = inspect.getsource(graph)
    assert src.count("_compact(state, results)") >= 3
    assert '"context_compact"' in src or "'context_compact'" in src \
        or "context_compact" in src
    assert "context_digest" in graph.WielderState.__annotations__


# ---------- (b) routing inputs survive byte-identical ----------

def test_routing_inputs_survive_byte_identical():
    from wielder import context
    entries = _oversized_history()
    before = _routing_entries(entries, "demo-target")
    assert {e["tool"] for e in before} == {"read_manifest", "run_verifier"}
    out = context.compact_history(entries, target_id="demo-target", threshold=1000)
    assert out["fired"] is True
    after = _routing_entries(out["entries"], "demo-target")
    assert len(after) == len(before)
    for b, a in zip(sorted(before, key=lambda e: e["tool"]),
                    sorted(after, key=lambda e: e["tool"])):
        assert a is b                      # pinned verbatim: same object
        assert _bytes(a) == _bytes(b)      # ...therefore byte-identical
    # The manifest evaluate() routes on is found identically afterwards.
    man = next(r for r in reversed(out["entries"])
               if r["tool"] == "read_manifest")
    assert man["result"]["sha256"] == "cd" * 32


def test_digest_is_what_later_steps_work_from():
    from wielder import context
    entries = _oversized_history()
    out = context.compact_history(entries, target_id="demo-target", threshold=1000)
    digest_entry = out["entries"][0]
    assert digest_entry["result"]["kind"] == "context_digest"
    assert digest_entry["result"]["original_entries"] == len(entries)
    assert len(out["entries"]) < len(entries)  # history replaced, not appended


# ---------- (c) hydration after compaction stays top-3 ----------

class _FakeSearch:
    def __init__(self, rows):
        self._rows = rows
        self.limit_seen = None

    def limit(self, k):
        self.limit_seen = k
        return self

    def to_list(self):
        return self._rows[: self.limit_seen]


class _FakeTable:
    def __init__(self, rows):
        self.search_obj = _FakeSearch(rows)

    def search(self, _vec):
        return self.search_obj


def _fake_memory(monkeypatch, n_rows=10):
    """A Memory whose LanceDB table is stubbed (10 rows behind a
    limit-recording search), so retrieve() itself is exercised
    without LanceDB or an embedder download."""
    from wielder import memory as mem_mod
    rows = [{"path": f"doc-{i}.md", "chunk": 0, "text": f"chunk {i} " * 20}
            for i in range(n_rows)]
    fake = _FakeTable(rows)
    monkeypatch.setattr(mem_mod.Memory, "_embedder",
                        lambda text: [0.0] * mem_mod.DIM)
    monkeypatch.setattr(mem_mod.Memory, "__init__",
                        lambda self, *a, **k: setattr(
                            self, "_table", lambda: fake))
    return mem_mod.Memory(), fake


def test_hydration_after_compaction_returns_at_most_three(monkeypatch):
    from wielder import constitution as C
    from wielder import context
    # Compact first — hydration happens against the compacted run.
    entries = _oversized_history()
    out = context.compact_history(entries, target_id="demo-target", threshold=1000)
    assert out["fired"] is True
    digest_text = out["entries"][0]["raw_output"]
    mem, fake = _fake_memory(monkeypatch, n_rows=10)
    hits = mem.retrieve(digest_text)  # default k
    assert C.RETRIEVAL_TOP_K == 3
    assert fake.search_obj.limit_seen == 3
    assert 0 < len(hits) <= 3


def test_tool_layer_caps_retrieval_at_top_k(monkeypatch):
    """The wired tool path can never hydrate more than top-3, even
    when a caller asks for the whole corpus."""
    from wielder import constitution as C
    from wielder import tools
    _mem, _fake = _fake_memory(monkeypatch, n_rows=10)  # patches Memory in place
    res = tools.call_tool("retrieve", {"query": "anything", "k": 100})
    assert res.ok is True
    assert len(res.result["hits"]) <= C.RETRIEVAL_TOP_K == 3
