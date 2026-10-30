"""Code-search tests — symbol definitions and references with exact
file/line assertions on a fixture tree.
Run: python -m pytest wielder/tests/test_code_search.py -q
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import code_search as cs

ALPHA = '''"""fixture module"""


def target_fn(x):
    return helper(x) + 1


def helper(x):
    return x * 2


class Widget:
    def render(self):
        return target_fn(3)
'''

BETA = '''from alpha import target_fn

VALUE = target_fn(10)


def caller():
    return target_fn(VALUE)
'''


@pytest.fixture()
def tree(tmp_path):
    root = tmp_path / "src"
    root.mkdir()
    (root / "alpha.py").write_text(ALPHA)
    (root / "beta.py").write_text(BETA)
    (root / "notes.md").write_text("see target_fn for details\n")
    return root


def test_definition_exact_file_and_line(tree):
    defs = cs.definitions("target_fn", tree)
    assert defs == [{"symbol": "target_fn", "qualname": "target_fn",
                     "file": "alpha.py", "line": 4, "kind": "function"}]


def test_method_and_class_definitions(tree):
    assert cs.definitions("Widget", tree) == [
        {"symbol": "Widget", "qualname": "Widget",
         "file": "alpha.py", "line": 12, "kind": "class"}]
    assert cs.definitions("render", tree) == [
        {"symbol": "render", "qualname": "Widget.render",
         "file": "alpha.py", "line": 13, "kind": "method"}]
    # qualified query also resolves
    assert cs.definitions("Widget.render", tree)[0]["line"] == 13


def test_references_exact_lines(tree):
    refs = cs.references("target_fn", tree)
    got = {(r["file"], r["line"]) for r in refs}
    assert ("alpha.py", 14) in got   # Widget.render calls target_fn(3)
    assert ("beta.py", 1) not in got  # `from alpha import target_fn`: ast.ImportFrom
    # carries no Name node, so the import line is honestly not an AST reference.
    assert ("beta.py", 3) in got     # VALUE = target_fn(10)
    assert ("beta.py", 7) in got     # caller() returns target_fn(VALUE)
    assert ("notes.md", 1) in got    # text fallback for non-Python files
    assert ("alpha.py", 4) not in got  # the definition site itself is excluded


def test_search_symbol_combines(tree):
    rep = cs.search_symbol("helper", tree)
    assert rep["definitions"][0]["line"] == 8
    assert {(r["file"], r["line"]) for r in rep["references"]} >= {("alpha.py", 5)}


def test_unknown_symbol_is_empty(tree):
    rep = cs.search_symbol("no_such_symbol", tree)
    assert rep["definitions"] == [] and rep["references"] == []
