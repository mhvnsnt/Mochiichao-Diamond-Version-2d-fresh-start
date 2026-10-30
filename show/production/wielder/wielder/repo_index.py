"""WIELDER repo index — a run may only cite what actually exists.

The failure this kills (owner's words): deliverables and plans
citing invented file paths and invented APIs — "wired" claims for
connections to systems that do not exist (the real-code wiring
law, enforced mechanically). This module builds a generated,
refreshable index of the real repo:

- **paths** — every file in the repo (walk, VCS/vendor dirs
  skipped, cap recorded honestly if hit);
- **registries** — JSON registries/manifests/indexes with their
  top-level keys;
- **schemas** — JSON schema files, plus Pydantic model classes
  found by AST in the focus tree;
- **public APIs** — public functions/classes/methods of Python
  modules in the focus tree, as dotted names.

A citation check extracts path citations and API citations from a
deliverable (card text, plan payloads) and fails any citation
absent from the index. API citations match an index entry exactly
or as a dot-boundary suffix (a deliverable may write
`wielder.tools.call_tool` for the indexed
`show.production.wielder.wielder.tools.call_tool`). Absolute paths
outside the indexed root are outside this index's jurisdiction —
they are skipped, not blessed (the instruction checker and the
read receipts govern those). The graph's preflight node runs this
check, so a run citing a fake path fails before any expensive step.

Bounds, stated: registry/schema/API extraction is bounded to the
focus prefixes (default `show/production`) — path coverage is
repo-wide. Refresh is explicit (`wielder repo-index build`, or the
first preflight that finds no index yet).
"""
from __future__ import annotations

import ast
import json
import os
import re
import time
from pathlib import Path
from typing import Any, Optional

from . import constitution as C

INDEX_VERSION = 1
MAX_PATHS = 200_000
MAX_JSON_BYTES = 1 << 20
MAX_REGISTRIES = 2_000
MAX_PY_FILES = 5_000
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", ".venv", "venv"}
DEFAULT_FOCUS = ("show/production",)
_PATH_TOKEN = re.compile(r"[A-Za-z0-9_.\-]+(?:/[A-Za-z0-9_.\-]+)+")
_API_TOKEN = re.compile(r"\b[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*){2,}\b")


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def find_repo_root(start: Optional[Path] = None) -> Path:
    """The repo root for indexing: WIELDER_REPO_ROOT if set, else the
    nearest ancestor holding .git, else the seat layout's root
    (…/show/production/wielder/wielder -> 4 ancestors up when that
    ancestor holds a show/ dir), else the package dir itself."""
    env = os.environ.get("WIELDER_REPO_ROOT")
    if env:
        return Path(env)
    here = (start or C.WIELDER_HOME).resolve()
    for anc in (here, *here.parents):
        if (anc / ".git").exists():
            return anc
    seat_root = here.parents[3] if len(here.parents) > 3 else here
    if (seat_root / "show").is_dir():
        return seat_root
    return here


def index_path() -> Path:
    return C.DATA / "repo-index.json"


def _json_registry_keys(p: Path) -> Optional[list[str]]:
    try:
        if p.stat().st_size > MAX_JSON_BYTES:
            return None
        data = json.loads(p.read_text())
    except Exception:
        return None
    if isinstance(data, dict):
        return sorted(str(k) for k in data.keys())
    if isinstance(data, list):
        return [f"<list of {len(data)}>"]
    return None


def _py_surface(p: Path) -> tuple[list[str], list[str]]:
    """(api dotted suffixes, schema class names) for one .py file."""
    try:
        tree = ast.parse(p.read_text(errors="replace"))
    except Exception:
        return [], []
    apis: list[str] = []
    schemas: list[str] = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not node.name.startswith("_"):
                apis.append(node.name)
        elif isinstance(node, ast.ClassDef):
            if node.name.startswith("_"):
                continue
            apis.append(node.name)
            bases = {getattr(b, "id", getattr(b, "attr", "")) for b in node.bases}
            if "BaseModel" in bases:
                schemas.append(node.name)
            for sub in node.body:
                if isinstance(sub, (ast.FunctionDef, ast.AsyncFunctionDef)) \
                        and not sub.name.startswith("_"):
                    apis.append(f"{node.name}.{sub.name}")
    return apis, schemas


def build_index(root: Optional[Path] = None,
                focus_prefixes: tuple[str, ...] = DEFAULT_FOCUS) -> dict:
    root = Path(root) if root else find_repo_root()
    paths: list[str] = []
    truncated = False
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            rel = (Path(dirpath) / fn).relative_to(root).as_posix()
            if len(paths) >= MAX_PATHS:
                truncated = True
                break
            paths.append(rel)
        if truncated:
            break
    paths.sort()
    path_set = set(paths)
    registries: dict[str, Any] = {}
    schemas: dict[str, Any] = {}
    apis: list[str] = []
    py_seen = 0
    for rel in paths:
        in_focus = any(rel == fp or rel.startswith(fp + "/") for fp in focus_prefixes)
        p = root / rel
        if rel.endswith(".json") and (in_focus or Path(rel).name in
                                      ("INDEX.json", "manifest.json")):
            if len(registries) < MAX_REGISTRIES:
                keys = _json_registry_keys(p)
                if keys is not None:
                    registries[rel] = {"keys": keys}
                    if "$schema" in keys or "schema" in Path(rel).name.lower():
                        schemas[rel] = {"kind": "json", "keys": keys}
        elif rel.endswith(".py") and in_focus and py_seen < MAX_PY_FILES:
            py_seen += 1
            dotted = rel[:-3].replace("/", ".")
            fns, models = _py_surface(p)
            apis.extend(f"{dotted}.{name}" for name in fns)
            if models:
                schemas[rel] = {"kind": "pydantic", "models": models}
    return {"version": INDEX_VERSION, "root": str(root), "generated_at": _now(),
            "path_count": len(paths), "truncated": truncated,
            "focus_prefixes": list(focus_prefixes), "paths": paths,
            "registries": registries, "schemas": schemas,
            "apis": sorted(set(apis)), "_path_set": path_set}


def _public(idx: dict) -> dict:
    return {k: v for k, v in idx.items() if not k.startswith("_")}


def save_index(idx: dict) -> Path:
    out = index_path()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(_public(idx), indent=1))
    return out


def load_index() -> Optional[dict]:
    p = index_path()
    if not p.exists():
        return None
    idx = json.loads(p.read_text())
    idx["_path_set"] = set(idx.get("paths", []))
    return idx


def load_or_build(root: Optional[Path] = None) -> dict:
    idx = load_index()
    if idx is not None and (root is None or idx.get("root") == str(Path(root))):
        return idx
    idx = build_index(root)
    save_index(idx)
    return idx


# ---------- citation checking ----------

def path_status(idx: dict, cited: str) -> str:
    """known | missing | outside — 'outside' = an absolute path not
    under the indexed root: not this index's jurisdiction."""
    path_set = idx.get("_path_set") or set(idx.get("paths", []))
    s = cited.strip().strip("`'\"")
    if s.startswith("/"):
        root = idx.get("root", "")
        if root and (s == root or s.startswith(root + "/")):
            rel = s[len(root) + 1:]
            return "known" if rel in path_set else "missing"
        return "outside"
    rel = s[2:] if s.startswith("./") else s
    if rel in path_set:
        return "known"
    # Seat-relative citations (wielder/... for show/production/wielder/wielder/...)
    # resolve against the seat's own prefix inside the root.
    root = idx.get("root", "")
    if root:
        try:
            seat_rel = (C.WIELDER_HOME.parent).resolve() \
                .relative_to(Path(root).resolve()).as_posix()
            if f"{seat_rel}/{rel}" in path_set:
                return "known"
        except Exception:
            pass
    return "missing"


def cite_paths(text: str) -> list[str]:
    out = []
    for m in _PATH_TOKEN.finditer(text or ""):
        tok = m.group(0).rstrip(".,;:)")
        last = tok.rsplit("/", 1)[-1]
        if "." in last and "://" not in tok:
            out.append(tok)
    return sorted(set(out))


def cite_apis(text: str) -> list[str]:
    """API citations: dotted names in backticks, or bare dotted names
    rooted at a repo namespace (wielder./show.)."""
    out = set()
    for chunk in re.findall(r"`([^`]+)`", text or ""):
        out.update(_API_TOKEN.findall(chunk))
    for tok in _API_TOKEN.findall(text or ""):
        if tok.startswith(("wielder.", "show.")):
            out.add(tok)
    return sorted(out)


def _api_known(idx: dict, cited: str) -> bool:
    for api in idx.get("apis", []):
        if api == cited or api.endswith("." + cited):
            return True
    return False


def payload_paths(payload: dict) -> list[str]:
    """Path-like strings inside a tool payload (same extraction
    rules as the instruction checker, kept local to stay decoupled)."""
    out: list[str] = []

    def walk(v: Any) -> None:
        if isinstance(v, str):
            s = v.strip()
            if "://" in s or " " in s or "\n" in s:
                return
            if s.startswith("/") and len(s) > 1:
                out.append(s)
            elif "/" in s and "." in s.rsplit("/", 1)[-1]:
                out.append(s)
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)

    walk(payload or {})
    return out


def check_citations(idx: dict, text: str) -> dict:
    missing_paths = [p for p in cite_paths(text)
                     if path_status(idx, p) == "missing"]
    missing_apis = [a for a in cite_apis(text) if not _api_known(idx, a)]
    return {"cited_paths": cite_paths(text), "cited_apis": cite_apis(text),
            "missing_paths": missing_paths, "missing_apis": missing_apis,
            "ok": not missing_paths and not missing_apis}
