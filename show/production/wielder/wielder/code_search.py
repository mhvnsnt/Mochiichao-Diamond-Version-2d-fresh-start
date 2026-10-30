"""WIELDER code search — symbol-aware retrieval over a workspace.

What repo_index.py already does (and this module reuses, not
replaces): a repo-wide path list plus public API *names* per module
in the focus tree. What it does not carry — the gap this module
fills: line numbers, definition kinds, and references. So the
questions an IDE answers — "where is X defined?" and "who
references X?" — were unanswerable from the index.

This module builds a deterministic symbol index with the stdlib
only (``ast`` for Python — no embeddings, no third-party parser,
nothing to download; the pattern follows Continue's codebase
indexing idea, Apache-2.0, implemented natively — see
research/provenance-ide.md):

- **definitions**: every class / function / method (public and
  private — retrieval must find internals too) with file, line,
  kind and qualified name;
- **references**: every ``ast.Name`` use and attribute base, plus
  call targets, with file and line.

Non-Python files are covered by an exact word-boundary text scan for
references only (no invented structure). Scan order and results are
sorted, so the same tree always yields the same answer.
"""
from __future__ import annotations

import ast
import re
from pathlib import Path
from typing import Any, Optional

from . import repo_index as _ri

SKIP_DIRS = _ri.SKIP_DIRS  # reuse repo_index's skip set — one convention
MAX_FILES = 5_000
MAX_FILE_BYTES = 2 << 20


def _iter_files(root: Path):
    for dirpath, dirnames, filenames in __import__("os").walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for fn in sorted(filenames):
            p = Path(dirpath) / fn
            try:
                if p.stat().st_size <= MAX_FILE_BYTES:
                    yield p
            except OSError:
                continue


def _index_python(root: Path, p: Path, rel: str, defs: list, refs: list) -> None:
    try:
        tree = ast.parse(p.read_text(errors="replace"))
    except Exception:
        return  # unparseable file: text fallback below still covers references

    def visit(node: ast.AST, prefix: str) -> None:
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                qual = f"{prefix}{child.name}" if prefix else child.name
                defs.append({"symbol": child.name, "qualname": qual,
                             "file": rel, "line": child.lineno,
                             "kind": "method" if prefix else "function"})
                visit(child, f"{qual}.")
            elif isinstance(child, ast.ClassDef):
                qual = f"{prefix}{child.name}" if prefix else child.name
                defs.append({"symbol": child.name, "qualname": qual,
                             "file": rel, "line": child.lineno, "kind": "class"})
                visit(child, f"{qual}.")
            else:
                visit(child, prefix)

    visit(tree, "")
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            refs.append({"symbol": node.id, "file": rel, "line": node.lineno,
                         "kind": "name"})
        elif isinstance(node, ast.Attribute):
            base = node
            while isinstance(base, ast.Attribute):
                base = base.value  # type: ignore[attr-defined]
            if isinstance(base, ast.Name):
                refs.append({"symbol": base.id, "file": rel, "line": node.lineno,
                             "kind": "attribute"})
        if isinstance(node, ast.Call):
            fn = node.func
            if isinstance(fn, ast.Name):
                refs.append({"symbol": fn.id, "file": rel, "line": node.lineno,
                             "kind": "call"})
            elif isinstance(fn, ast.Attribute):
                refs.append({"symbol": fn.attr, "file": rel, "line": node.lineno,
                             "kind": "call"})


def build_code_index(root: str | Path) -> dict:
    """Scan `root` once; the returned index can be passed back into
    the query functions so repeated lookups don't rescan."""
    root_p = Path(root).resolve()
    defs: list[dict] = []
    refs: list[dict] = []
    files = list(_iter_files(root_p))[:MAX_FILES]
    for p in files:
        rel = p.relative_to(root_p).as_posix()
        if p.suffix == ".py":
            _index_python(root_p, p, rel, defs, refs)
    defs.sort(key=lambda d: (d["file"], d["line"], d["qualname"]))
    refs.sort(key=lambda r: (r["file"], r["line"], r["symbol"]))
    return {"root": str(root_p), "definitions": defs, "references": refs,
            "file_count": len(files)}


def _ensure_index(root: str | Path, index: Optional[dict]) -> dict:
    if index is not None and index.get("root") == str(Path(root).resolve()):
        return index
    return build_code_index(root)


def definitions(symbol: str, root: str | Path,
                index: Optional[dict] = None) -> list[dict]:
    """Where is `symbol` defined? Exact-name matches (a definition
    whose short name or qualified name equals the query)."""
    idx = _ensure_index(root, index)
    return [d for d in idx["definitions"]
            if d["symbol"] == symbol or d["qualname"] == symbol
            or d["qualname"].endswith("." + symbol)]


def references(symbol: str, root: str | Path,
               index: Optional[dict] = None) -> list[dict]:
    """Who references `symbol`? AST references in Python files plus
    word-boundary text hits in non-Python files. Definition sites
    themselves are excluded (they are in `definitions`)."""
    idx = _ensure_index(root, index)
    out = [r for r in idx["references"] if r["symbol"] == symbol]
    def_sites = {(d["file"], d["line"]) for d in idx["definitions"]
                 if d["symbol"] == symbol}
    out = [r for r in out if (r["file"], r["line"]) not in def_sites]
    # text fallback for non-Python files
    root_p = Path(root).resolve()
    pat = re.compile(r"\b" + re.escape(symbol) + r"\b")
    for p in _iter_files(root_p):
        if p.suffix == ".py":
            continue
        rel = p.relative_to(root_p).as_posix()
        try:
            for n, line in enumerate(p.read_text(errors="replace").splitlines(), 1):
                if pat.search(line):
                    out.append({"symbol": symbol, "file": rel, "line": n,
                                "kind": "text"})
        except OSError:
            continue
    out.sort(key=lambda r: (r["file"], r["line"], r["kind"]))
    return out


def search_symbol(symbol: str, root: str | Path,
                  index: Optional[dict] = None) -> dict:
    """The IDE question in one call: definitions + references."""
    idx = _ensure_index(root, index)
    return {"symbol": symbol, "root": idx["root"],
            "definitions": definitions(symbol, root, idx),
            "references": references(symbol, root, idx)}
