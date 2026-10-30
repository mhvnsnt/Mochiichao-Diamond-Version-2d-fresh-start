"""Edit-transaction tests — preview writes nothing, apply touches
exactly the target files, rollback is byte-exact (created file
removed, deleted file restored), mid-apply failure rolls back.
Hermetic: fixture workspace in tmp_path.
Run: python -m pytest wielder/tests/test_edit_txn.py -q
"""
import difflib
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import edit_txn as et


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


@pytest.fixture()
def ws(tmp_path):
    root = tmp_path / "ws"
    root.mkdir()
    (root / "a.txt").write_bytes(b"alpha\nbeta\n")
    (root / "keep.txt").write_bytes(b"untouched\x00bytes\xff\n")
    (root / "gone.txt").write_bytes(b"to be deleted\nsecond line\n")
    return root


def txn(root, edits, name="test-txn"):
    return {"name": name, "workspace_root": str(root), "edits": edits}


def test_preview_writes_nothing(ws):
    before = {p.name: sha(p.read_bytes()) for p in ws.iterdir() if p.is_file()}
    rep = et.preview(txn(ws, [
        {"path": "a.txt", "type": "replace", "content": "alpha\nCHANGED\n"},
        {"path": "new.txt", "type": "replace", "content": "fresh\n"},
    ]))
    assert rep["writes"] is False
    assert {f["path"] for f in rep["files"]} == {"a.txt", "new.txt"}
    assert "-beta" in rep["files"][0]["diff"] and "+CHANGED" in rep["files"][0]["diff"]
    after = {p.name: sha(p.read_bytes()) for p in ws.iterdir() if p.is_file()}
    assert before == after
    assert not (ws / ".wielder-checkpoints").exists()  # no checkpoint, no writes at all
    assert not (ws / "new.txt").exists()


def test_apply_changes_exactly_the_target_files(ws):
    keep_before = sha((ws / "keep.txt").read_bytes())
    rep = et.apply(txn(ws, [
        {"path": "a.txt", "type": "replace", "content": "alpha\nCHANGED\n"},
        {"path": "sub/b.txt", "type": "replace", "content": "brand new\n"},
    ]))
    assert rep["ok"] is True and rep["kind"] == "edit_txn_apply"
    assert (ws / "a.txt").read_text() == "alpha\nCHANGED\n"
    assert (ws / "sub/b.txt").read_text() == "brand new\n"
    assert sha((ws / "keep.txt").read_bytes()) == keep_before  # untouched, byte-exact
    by_path = {f["path"]: f for f in rep["files"]}
    assert by_path["a.txt"]["after_sha256"] == sha(b"alpha\nCHANGED\n")
    assert by_path["a.txt"]["before_sha256"] == sha(b"alpha\nbeta\n")
    # checkpoint + persisted receipt exist and list/status see them
    cps = et.list_checkpoints(ws)
    assert len(cps) == 1 and cps[0]["checkpoint_id"] == rep["checkpoint_id"]
    assert cps[0]["status"] == "applied"
    cdir = ws / ".wielder-checkpoints" / rep["checkpoint_id"]
    assert (cdir / "manifest.json").exists() and (cdir / "receipt-apply.json").exists()
    assert et.checkpoint_status(ws, rep["checkpoint_id"])["txn_name"] == "test-txn"


def test_diff_edit_applies(ws):
    old = (ws / "a.txt").read_text()
    new = "alpha\nbeta\ngamma\n"
    diff = "".join(difflib.unified_diff(
        old.splitlines(keepends=True), new.splitlines(keepends=True),
        fromfile="a/a.txt", tofile="b/a.txt"))
    rep = et.apply(txn(ws, [{"path": "a.txt", "type": "diff", "diff": diff}]))
    assert rep["ok"] is True
    assert (ws / "a.txt").read_text() == new


def test_stale_diff_fails_before_any_write(ws):
    diff = ("--- a/a.txt\n+++ b/a.txt\n@@ -1,2 +1,2 @@\n"
            " WRONG\n-beta\n+CHANGED\n")
    with pytest.raises(et.EditTxnError):
        et.apply(txn(ws, [
            {"path": "keep.txt", "type": "replace", "content": "x"},
            {"path": "a.txt", "type": "diff", "diff": diff},
        ]))
    assert (ws / "keep.txt").read_bytes() == b"untouched\x00bytes\xff\n"  # nothing written
    assert not (ws / ".wielder-checkpoints").exists()


def test_rollback_restores_byte_exact_created_removed_deleted_restored(ws):
    a_before = (ws / "a.txt").read_bytes()
    gone_before = (ws / "gone.txt").read_bytes()
    rep = et.apply(txn(ws, [
        {"path": "a.txt", "type": "replace", "content": "totally different\n"},
        {"path": "made.txt", "type": "replace", "content": "created by the txn\n"},
        {"path": "gone.txt", "type": "delete"},
    ]))
    assert rep["ok"] is True
    assert (ws / "made.txt").exists() and not (ws / "gone.txt").exists()
    rb = et.rollback(ws, rep["checkpoint_id"])
    assert rb["ok"] is True and rb["kind"] == "edit_txn_rollback"
    assert (ws / "a.txt").read_bytes() == a_before
    assert sha((ws / "a.txt").read_bytes()) == sha(a_before)
    assert not (ws / "made.txt").exists()               # created file removed
    assert (ws / "gone.txt").read_bytes() == gone_before  # deleted file restored
    assert all(f["verified"] for f in rb["files"])
    assert et.checkpoint_status(ws, rep["checkpoint_id"])["status"] == "rolled_back"


def test_mid_apply_failure_rolls_back(ws):
    (ws / "blocker").write_text("I am a file, not a directory\n")
    rep = et.apply(txn(ws, [
        {"path": "a.txt", "type": "replace", "content": "written first\n"},
        {"path": "blocker/child.txt", "type": "replace", "content": "cannot land\n"},
    ]))
    assert rep["ok"] is False
    assert rep["rolled_back"] == ["a.txt"]
    assert (ws / "a.txt").read_bytes() == b"alpha\nbeta\n"  # restored from preimage
    status = et.checkpoint_status(ws, rep["checkpoint_id"])["status"]
    assert status == "apply_failed_rolled_back"


def test_path_escape_and_scorer_paths_rejected(ws):
    with pytest.raises(et.EditTxnError):
        et.preview(txn(ws, [{"path": "../outside.txt", "type": "replace", "content": "x"}]))
    with pytest.raises(et.EditTxnError):
        et.preview(txn(ws, [{"path": "/etc/passwd", "type": "replace", "content": "x"}]))


def test_tools_registration_and_authz_gate(tmp_path, monkeypatch):
    from wielder import authz, tools
    for name in ("edit_txn_preview", "edit_txn_apply", "edit_txn_rollback",
                 "edit_txn_list", "code_search"):
        assert name in tools.REGISTRY
    root = tmp_path / "ws2"
    root.mkdir()
    (root / "x.txt").write_text("one\n")
    # preview is read-only: no grant needed, following hash_file/read_manifest
    res = tools.call_tool("edit_txn_preview", {
        "workspace_root": str(root), "name": "t",
        "edits": [{"path": "x.txt", "type": "replace", "content": "two\n"}]})
    assert res.ok and res.result["writes"] is False
    # apply is a write tool: same gate as run_verifier — no grant, no write
    monkeypatch.setattr(authz.C, "DATA", tmp_path / "data")
    with pytest.raises(authz.NotAuthorized):
        tools.call_tool("edit_txn_apply", {
            "workspace_root": str(root), "name": "t",
            "edits": [{"path": "x.txt", "type": "replace", "content": "two\n"}]})
    assert (root / "x.txt").read_text() == "one\n"
    authz.grant("local-builds-renders", "*")
    res = tools.call_tool("edit_txn_apply", {
        "workspace_root": str(root), "name": "t",
        "edits": [{"path": "x.txt", "type": "replace", "content": "two\n"}]})
    assert res.ok and (root / "x.txt").read_text() == "two\n"
    res = tools.call_tool("edit_txn_rollback", {
        "workspace_root": str(root), "checkpoint_id": res.result["checkpoint_id"]})
    assert res.ok and (root / "x.txt").read_text() == "one\n"
