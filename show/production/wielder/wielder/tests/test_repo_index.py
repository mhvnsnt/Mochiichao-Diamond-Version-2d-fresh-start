"""Repo-index tests (owner expansion, card 4) — a deliverable may
cite only paths and APIs that exist in the index. Hermetic: a
fixture repo tree in tmp_path.
Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import repo_index as ri

TOOLS_PY = '''from pydantic import BaseModel


class ToolResult(BaseModel):
    ok: bool


def call_tool(name, payload):
    return None


def _hidden_helper():
    pass
'''


@pytest.fixture()
def repo(tmp_path):
    root = tmp_path / "repo"
    pkg = root / "show/production/wielder/wielder"
    pkg.mkdir(parents=True)
    (pkg / "tools.py").write_text(TOOLS_PY)
    (pkg / "rules.json").write_text('{"settled_rulings": [], "canon_locks": {}}')
    (root / "show/assets").mkdir(parents=True)
    (root / "show/assets/bg.png").write_bytes(b"\x89PNG")
    (root / "docs").mkdir()
    (root / "docs/guide.md").write_text("# guide\n")
    return root


@pytest.fixture()
def idx(repo):
    return ri.build_index(repo)


def test_index_covers_paths_registries_schemas_apis(idx):
    paths = set(idx["paths"])
    assert "show/assets/bg.png" in paths  # paths are repo-wide
    assert "docs/guide.md" in paths
    reg = idx["registries"]["show/production/wielder/wielder/rules.json"]
    assert "settled_rulings" in reg["keys"] and "canon_locks" in reg["keys"]
    sch = idx["schemas"]["show/production/wielder/wielder/tools.py"]
    assert sch["kind"] == "pydantic" and "ToolResult" in sch["models"]
    assert any(a.endswith("wielder.tools.call_tool") for a in idx["apis"])
    assert any(a.endswith("wielder.tools.ToolResult") for a in idx["apis"])
    assert not any("_hidden_helper" in a for a in idx["apis"])  # public surface only


def test_real_citations_pass(idx):
    rep = ri.check_citations(
        idx, "Composite over show/assets/bg.png, call `wielder.tools.call_tool`, "
             "per docs/guide.md.")
    assert rep["ok"] is True
    assert rep["missing_paths"] == [] and rep["missing_apis"] == []


def test_fake_path_is_rejected(idx):
    """The card's test: a synthetic deliverable citing a fake path."""
    rep = ri.check_citations(idx, "The deliverable lands at show/assets/missing_plate.png")
    assert rep["ok"] is False
    assert rep["missing_paths"] == ["show/assets/missing_plate.png"]


def test_fake_api_is_rejected(idx):
    rep = ri.check_citations(idx, "Wire it via `wielder.tools.invented_fn` at runtime")
    assert rep["ok"] is False
    assert rep["missing_apis"] == ["wielder.tools.invented_fn"]


def test_absolute_path_jurisdiction(idx, repo):
    assert ri.path_status(idx, str(repo / "show/assets/bg.png")) == "known"
    assert ri.path_status(idx, str(repo / "show/assets/nope.png")) == "missing"
    assert ri.path_status(idx, "/etc/passwd") == "outside"
    assert ri.path_status(
        idx, "/home/user/workspace/ep01-rebuild/finish-gate/targets/x.json") == "outside"


def test_prose_and_urls_are_not_citations(idx):
    rep = ri.check_citations(
        idx, "Boards at 24fps, e.g. the gate scene; sources at docs.x.ai/models "
             "and finish-gate target demo-target.")
    assert rep["ok"] is True


def test_wiring_preflight_and_cli():
    import wielder.graph as g
    src = Path(g.__file__).read_text()
    pre = src[src.index("def preflight("):src.index("def diagnosis(")]
    assert "repo_index" in pre and "load_or_build" in pre
    import wielder.cli as cli
    cli_src = Path(cli.__file__).read_text()
    assert "repo-index" in cli_src and "cmd_repo_index" in cli_src
