"""WIELDER multi-file edit transactions — checkpointed, rollbackable.

Patterns (implemented natively here, no vendored code — see
research/provenance-ide.md): Aider's unified-diff edit format
(Apache-2.0) for the per-file edit payload, and Cline's
checkpoint/rollback model (Apache-2.0): snapshot before writing,
restore byte-exact on demand.

A transaction is a named set of file edits against one workspace
root. Each edit is one of:

- ``diff``    — ``diff`` holds a unified diff for the file;
- ``replace`` — ``content`` holds the file's full new text (creates
  the file when it does not exist yet);
- ``delete``  — the file is removed.

Guarantees, stated plainly:

- ``preview`` writes nothing: it returns the per-file unified diff
  the transaction *would* produce (for ``replace``/``delete`` the
  diff is generated with difflib; for ``diff`` edits the supplied
  diff is returned after it is verified to apply cleanly).
- ``apply`` first computes every file's new bytes (a bad diff fails
  the whole transaction before anything is written), then snapshots
  every touched file's preimage — bytes + sha256 — into a checkpoint
  record, then writes. Any failure mid-write rolls the already
  written files back from their preimages and the receipt says so.
- ``rollback`` restores preimages byte-exact (a file the transaction
  created is removed; a deleted file is restored) and verifies the
  sha256 of every restored file after the restore.
- Paths may not escape the workspace root, may not point into the
  checkpoint store itself, and may not touch scorer-owned paths
  (Constitution #3, same check as tools.assert_not_scorer_owned —
  duplicated here so this module does not import the tool layer).

Checkpoints live under ``<workspace>/.wielder-checkpoints/`` — except
when the workspace *is* Wielder itself (the package dir or the tree
holding it), where they live under the package data dir
(``constitution.DATA / "checkpoints"``), following Wielder's own
convention that its runtime state lives in its data dir, not in a
dot-folder inside its source tree.

Every apply/rollback returns — and persists inside the checkpoint
record — a receipt in Wielder's evidence style (evidence.py's shape:
kind / ref / files with before+after sha256 / detail), suitable for
the run packet. Text only: contents are UTF-8; preimages are raw
bytes, so rollback is byte-exact regardless.
"""
from __future__ import annotations

import difflib
import hashlib
import json
import os
import re
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any, Optional

from . import constitution as C

CHECKPOINT_DIRNAME = ".wielder-checkpoints"
EDIT_TYPES = ("diff", "replace", "delete")


class EditTxnError(RuntimeError):
    pass


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ---------- locations ----------

def checkpoint_root(workspace_root: Path) -> Path:
    """Where checkpoints for this workspace live (see module docstring)."""
    root = Path(workspace_root).resolve()
    wielder_home = C.WIELDER_HOME.resolve()
    if root == wielder_home or root == wielder_home.parent:
        return (C.DATA / "checkpoints").resolve()
    return root / CHECKPOINT_DIRNAME


def _is_wielder_workspace(workspace_root: Path) -> bool:
    root = Path(workspace_root).resolve()
    wielder_home = C.WIELDER_HOME.resolve()
    return root in (wielder_home, wielder_home.parent)


# ---------- path safety ----------

def _resolve_target(workspace_root: Path, rel: str) -> Path:
    if not rel or not str(rel).strip():
        raise EditTxnError("edit path is empty")
    p = Path(rel)
    if p.is_absolute():
        raise EditTxnError(f"edit path must be workspace-relative: {rel!r}")
    root = Path(workspace_root).resolve()
    dest = (root / p).resolve()
    if dest != root and root not in dest.parents:
        raise EditTxnError(f"edit path escapes the workspace root: {rel!r}")
    ck = checkpoint_root(root)
    if dest == ck or ck in dest.parents:
        raise EditTxnError(f"edit path is inside the checkpoint store: {rel!r}")
    s = str(dest)
    for prefix in C.SCORER_OWNED_PREFIXES:
        if s == prefix or s.startswith(prefix + "/"):
            raise EditTxnError(f"write denied: {s} is scorer-owned (scorer separation)")
    return dest


# ---------- unified diff: apply (stdlib only) ----------

_HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")


def apply_unified_diff(old_text: str, diff_text: str, rel: str) -> str:
    """Apply a unified diff to `old_text`. Raises EditTxnError when a
    hunk's context/removed lines do not match the current content —
    a stale diff fails loudly instead of writing something wrong."""
    old_lines = old_text.splitlines(keepends=True)
    diff_lines = diff_text.splitlines(keepends=True)
    out: list[str] = []
    cursor = 0  # index into old_lines
    i = 0
    saw_hunk = False
    while i < len(diff_lines):
        m = _HUNK_RE.match(diff_lines[i])
        if not m:
            i += 1  # ---/+++/diff --git headers and other preamble
            continue
        saw_hunk = True
        old_start = int(m.group(1))
        # unified diff is 1-based; a 0-length old range starts *after* old_start
        pos = old_start - 1 if int(m.group(2) or "1") > 0 else old_start
        if pos < cursor:
            raise EditTxnError(f"{rel}: overlapping/out-of-order hunks in diff")
        out.extend(old_lines[cursor:pos])
        cursor = pos
        i += 1
        while i < len(diff_lines) and not _HUNK_RE.match(diff_lines[i]):
            line = diff_lines[i]
            if line.startswith("\\"):
                i += 1
                continue  # "\ No newline at end of file" — splitlines model holds
            tag, body = (line[:1], line[1:]) if line else (" ", "\n")
            if tag == " ":
                if cursor >= len(old_lines) or old_lines[cursor] != body:
                    raise EditTxnError(f"{rel}: diff context does not match current content")
                out.append(old_lines[cursor]); cursor += 1
            elif tag == "-":
                if cursor >= len(old_lines) or old_lines[cursor] != body:
                    raise EditTxnError(f"{rel}: diff removal does not match current content")
                cursor += 1
            elif tag == "+":
                out.append(body)
            elif line.strip() == "":
                # tolerate a bare empty line as an empty context line
                if cursor < len(old_lines) and old_lines[cursor] in ("\n", ""):
                    out.append(old_lines[cursor]); cursor += 1
                else:
                    out.append("\n")
            else:
                break
            i += 1
    if not saw_hunk:
        raise EditTxnError(f"{rel}: diff contains no hunks")
    out.extend(old_lines[cursor:])
    return "".join(out)


def _unified_diff(old_text: str, new_text: str, rel: str) -> str:
    return "".join(difflib.unified_diff(
        old_text.splitlines(keepends=True), new_text.splitlines(keepends=True),
        fromfile=f"a/{rel}", tofile=f"b/{rel}"))


# ---------- transaction normalisation ----------

def _normalise(txn: dict) -> tuple[str, list[dict]]:
    if not isinstance(txn, dict):
        raise EditTxnError("transaction must be a dict {name, workspace_root, edits}")
    name = str(txn.get("name") or "").strip()
    if not name:
        raise EditTxnError("transaction needs a name")
    edits = txn.get("edits")
    if not isinstance(edits, list) or not edits:
        raise EditTxnError("transaction needs a non-empty edits list")
    seen: set[str] = set()
    out: list[dict] = []
    for e in edits:
        if not isinstance(e, dict):
            raise EditTxnError("each edit must be a dict")
        rel = str(e.get("path") or "")
        kind = str(e.get("type") or ("diff" if e.get("diff") is not None else "replace"))
        if kind not in EDIT_TYPES:
            raise EditTxnError(f"{rel}: unknown edit type {kind!r} (want one of {EDIT_TYPES})")
        if rel in seen:
            raise EditTxnError(f"duplicate edit for {rel!r} in one transaction")
        seen.add(rel)
        if kind == "diff" and not isinstance(e.get("diff"), str):
            raise EditTxnError(f"{rel}: diff edit needs a 'diff' string")
        if kind == "replace" and not isinstance(e.get("content"), str):
            raise EditTxnError(f"{rel}: replace edit needs a 'content' string")
        out.append({"path": rel, "type": kind,
                    "diff": e.get("diff"), "content": e.get("content")})
    return name, out


def _root_of(txn: dict) -> Path:
    root = txn.get("workspace_root") or txn.get("root")
    if not root:
        raise EditTxnError("transaction needs a workspace_root")
    p = Path(str(root)).resolve()
    if not p.is_dir():
        raise EditTxnError(f"workspace root is not a directory: {root}")
    return p


def _plan(root: Path, edits: list[dict]) -> list[dict]:
    """Compute every file's before/after state. Pure: reads, never
    writes. Any error here aborts the transaction before a byte moves."""
    plan: list[dict] = []
    for e in edits:
        dest = _resolve_target(root, e["path"])
        existed = dest.is_file()
        if dest.exists() and not existed:
            raise EditTxnError(f"{e['path']}: target exists and is not a file")
        before: Optional[bytes] = dest.read_bytes() if existed else None
        if e["type"] == "delete":
            if not existed:
                raise EditTxnError(f"{e['path']}: cannot delete a file that does not exist")
            after: Optional[bytes] = None
            diff_text = _unified_diff(before.decode("utf-8", "replace"), "", e["path"])
        elif e["type"] == "replace":
            after = e["content"].encode("utf-8")
            diff_text = _unified_diff(before.decode("utf-8", "replace") if before is not None else "",
                                      e["content"], e["path"])
        else:  # diff
            old_text = before.decode("utf-8", "replace") if before is not None else ""
            after = apply_unified_diff(old_text, e["diff"], e["path"]).encode("utf-8")
            diff_text = e["diff"]
        plan.append({
            "path": e["path"], "type": e["type"], "dest": dest,
            "existed": existed, "before": before, "after": after,
            "before_sha256": _sha256_bytes(before) if before is not None else None,
            "after_sha256": _sha256_bytes(after) if after is not None else None,
            "diff": diff_text})
    return plan


def _public_plan(plan: list[dict]) -> list[dict]:
    return [{"path": p["path"], "type": p["type"], "existed": p["existed"],
             "before_sha256": p["before_sha256"], "after_sha256": p["after_sha256"],
             "before_bytes": len(p["before"]) if p["before"] is not None else None,
             "after_bytes": len(p["after"]) if p["after"] is not None else None,
             "diff": p["diff"]} for p in plan]


# ---------- writes ----------

def _write_bytes_atomic(dest: Path, data: bytes) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(dest.parent), prefix=".wielder-txn-")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        os.replace(tmp, dest)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def _restore_entry(entry: dict, preimage: Optional[bytes], dest: Path) -> None:
    if entry["existed"]:
        assert preimage is not None
        _write_bytes_atomic(dest, preimage)
    else:
        if dest.exists():
            dest.unlink()


# ---------- checkpoints ----------

def _new_checkpoint_id(name: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")[:40] or "txn"
    return f"{time.strftime('%Y%m%d%H%M%S')}-{slug}-{uuid.uuid4().hex[:8]}"


def _checkpoint_dir(root: Path, checkpoint_id: str) -> Path:
    if "/" in checkpoint_id or "\\" in checkpoint_id or checkpoint_id in ("", ".", ".."):
        raise EditTxnError(f"bad checkpoint id: {checkpoint_id!r}")
    return checkpoint_root(root) / checkpoint_id


def _load_manifest(root: Path, checkpoint_id: str) -> tuple[Path, dict]:
    cdir = _checkpoint_dir(root, checkpoint_id)
    mp = cdir / "manifest.json"
    if not mp.exists():
        raise EditTxnError(f"no such checkpoint: {checkpoint_id}")
    return cdir, json.loads(mp.read_text())


def _save_manifest(cdir: Path, manifest: dict) -> None:
    (cdir / "manifest.json").write_text(json.dumps(manifest, indent=1))


def _receipt(kind: str, checkpoint_id: str, name: str, files: list[dict],
             ok: bool, detail: str) -> dict:
    return {"kind": kind, "ref": f"checkpoint:{checkpoint_id}",
            "checkpoint_id": checkpoint_id, "txn_name": name,
            "ok": ok, "ts": _now(), "files": files, "detail": detail}


# ---------- public API ----------

def preview(txn: dict) -> dict:
    """Per-file unified diffs for the transaction. Writes nothing."""
    root = _root_of(txn)
    name, edits = _normalise(txn)
    plan = _plan(root, edits)
    return {"txn_name": name, "workspace_root": str(root),
            "files": _public_plan(plan), "writes": False}


def apply(txn: dict) -> dict:
    """Snapshot preimages into a checkpoint, then write. On any
    mid-apply failure, already-written files are rolled back from
    their preimages and the receipt reports the rollback."""
    root = _root_of(txn)
    name, edits = _normalise(txn)
    plan = _plan(root, edits)  # all-or-nothing precompute: errors write nothing
    checkpoint_id = _new_checkpoint_id(name)
    cdir = _checkpoint_dir(root, checkpoint_id)
    pre_dir = cdir / "preimages"
    pre_dir.mkdir(parents=True, exist_ok=False)
    manifest: dict[str, Any] = {
        "checkpoint_id": checkpoint_id, "txn_name": name,
        "workspace_root": str(root), "created_at": _now(), "status": "applying",
        "files": []}
    for idx, p in enumerate(plan):
        entry = {"path": p["path"], "type": p["type"], "existed": p["existed"],
                 "before_sha256": p["before_sha256"],
                 "before_bytes": len(p["before"]) if p["before"] is not None else None,
                 "after_sha256": p["after_sha256"],
                 "preimage": None}
        if p["before"] is not None:
            pf = pre_dir / f"{idx:04d}.bin"
            pf.write_bytes(p["before"])
            entry["preimage"] = pf.name
        manifest["files"].append(entry)
    _save_manifest(cdir, manifest)

    written: list[dict] = []
    try:
        for p in plan:
            if p["after"] is None:
                p["dest"].unlink()
            else:
                _write_bytes_atomic(p["dest"], p["after"])
            written.append(p)
    except Exception as exc:
        rolled: list[str] = []
        rb_errors: list[str] = []
        by_path = {m["path"]: m for m in manifest["files"]}
        for p in reversed(written):
            entry = by_path[p["path"]]
            try:
                _restore_entry(entry, p["before"], p["dest"])
                rolled.append(p["path"])
            except Exception as rb_exc:  # pragma: no cover - double failure
                rb_errors.append(f"{p['path']}: {rb_exc}")
        manifest["status"] = "apply_failed_rolled_back" if not rb_errors else "apply_failed_rollback_incomplete"
        _save_manifest(cdir, manifest)
        receipt = _receipt(
            "edit_txn_apply", checkpoint_id, name, _public_plan(plan), False,
            f"apply failed ({exc}); rolled back {len(rolled)} file(s) from preimages"
            + (f"; rollback errors: {rb_errors}" if rb_errors else ""))
        receipt["rolled_back"] = rolled
        receipt["error"] = str(exc)
        (cdir / "receipt-apply.json").write_text(json.dumps(receipt, indent=1))
        return receipt

    manifest["status"] = "applied"
    manifest["applied_at"] = _now()
    _save_manifest(cdir, manifest)
    receipt = _receipt("edit_txn_apply", checkpoint_id, name, _public_plan(plan), True,
                       f"{len(plan)} file(s) written; preimages in checkpoint {checkpoint_id}")
    (cdir / "receipt-apply.json").write_text(json.dumps(receipt, indent=1))
    return receipt


def rollback(workspace_root: str | Path, checkpoint_id: str) -> dict:
    """Restore a checkpoint's preimages byte-exact; verify sha256 of
    every restored file after the restore."""
    root = Path(workspace_root).resolve()
    if not root.is_dir():
        raise EditTxnError(f"workspace root is not a directory: {workspace_root}")
    cdir, manifest = _load_manifest(root, checkpoint_id)
    if manifest.get("workspace_root") != str(root):
        raise EditTxnError("checkpoint belongs to a different workspace root")
    files: list[dict] = []
    problems: list[str] = []
    for entry in manifest["files"]:
        dest = _resolve_target(root, entry["path"])
        preimage: Optional[bytes] = None
        if entry["existed"]:
            preimage = (cdir / "preimages" / entry["preimage"]).read_bytes()
            if _sha256_bytes(preimage) != entry["before_sha256"]:
                problems.append(f"{entry['path']}: preimage hash mismatch — refusing to restore corrupt bytes")
                continue
        _restore_entry(entry, preimage, dest)
        # verify after restore
        if entry["existed"]:
            now_sha = _sha256_bytes(dest.read_bytes()) if dest.is_file() else None
            verified = now_sha == entry["before_sha256"]
            if not verified:
                problems.append(f"{entry['path']}: post-restore sha256 mismatch")
            files.append({"path": entry["path"], "type": entry["type"],
                          "existed": True, "before_sha256": entry["before_sha256"],
                          "after_sha256": now_sha, "verified": verified})
        else:
            verified = not dest.exists()
            if not verified:
                problems.append(f"{entry['path']}: created file still present after rollback")
            files.append({"path": entry["path"], "type": entry["type"],
                          "existed": False, "before_sha256": None,
                          "after_sha256": None, "verified": verified})
    ok = not problems
    manifest["status"] = "rolled_back" if ok else "rollback_failed"
    manifest["rolled_back_at"] = _now()
    _save_manifest(cdir, manifest)
    receipt = _receipt("edit_txn_rollback", checkpoint_id, manifest["txn_name"], files, ok,
                       "preimages restored byte-exact, sha256 verified"
                       if ok else f"rollback problems: {problems}")
    if problems:
        receipt["problems"] = problems
    (cdir / "receipt-rollback.json").write_text(json.dumps(receipt, indent=1))
    return receipt


def list_checkpoints(workspace_root: str | Path) -> list[dict]:
    root = Path(workspace_root).resolve()
    base = checkpoint_root(root)
    if not base.is_dir():
        return []
    out: list[dict] = []
    for cdir in sorted(base.iterdir()):
        mp = cdir / "manifest.json"
        if not mp.is_file():
            continue
        try:
            m = json.loads(mp.read_text())
        except Exception:
            continue
        out.append({"checkpoint_id": m.get("checkpoint_id"), "txn_name": m.get("txn_name"),
                    "status": m.get("status"), "created_at": m.get("created_at"),
                    "files": [f["path"] for f in m.get("files", [])]})
    return out


def checkpoint_status(workspace_root: str | Path, checkpoint_id: str) -> dict:
    root = Path(workspace_root).resolve()
    _, manifest = _load_manifest(root, checkpoint_id)
    return manifest
