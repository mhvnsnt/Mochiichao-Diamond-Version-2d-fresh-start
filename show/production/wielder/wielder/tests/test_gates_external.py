"""Attack tests for the external report gates (wielder/gates/).

Adapted from PR #44's tests/test_gates.py (grok lane) during the
2026-10-28 reconciliation: the claims + instruction tests land with the
modules they test. The circle/journal/repoindex tests from PR #44 are
not landed: those mechanisms live in Wielder's core (wielder/circles.py,
wielder/journal.py, wielder/repo_index.py) with their own suites, and
PR #44's ping-pong / error-loop signals were ported into circles.py
instead of landing a second detector.
Run: python -m pytest wielder/tests/test_gates_external.py -q
"""
import hashlib, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import importlib
claims = importlib.import_module("wielder.gates.claims")
instruction = importlib.import_module("wielder.gates.instruction")


def _repo(tmp):
    g = lambda *a: subprocess.run(["git", "-C", str(tmp), *a], check=True, capture_output=True, text=True).stdout.strip()
    g("init", "-q", "-b", "main"); g("config", "user.email", "t@t"); g("config", "user.name", "t")
    (tmp / "clip.mp4").write_bytes(b"real clip bytes")
    (tmp / "mod.py").write_text("class Gate:\n    pass\ndef verify_done():\n    pass\n")
    g("add", "."); g("commit", "-qm", "c1")
    return g, g("rev-parse", "HEAD")


# --- proof gate (claims) ---
def test_fabricated_report_is_rejected(tmp_path):
    g, head = _repo(tmp_path)
    fake = {"commits": ["deadbeefcafe1234"], "prs": [999],
            "files": {"clip.mp4": "0" * 64}}
    v = claims.verify_claim(fake, tmp_path, "main", pr_lookup=lambda n: None)
    assert not v.ok and len(v.failures) == 3


def test_empty_done_claim_is_rejected(tmp_path):
    _repo(tmp_path)
    assert not claims.verify_claim({}, tmp_path).ok


def test_real_claim_passes(tmp_path):
    g, head = _repo(tmp_path)
    real = {"commits": [head[:10]], "files": {"clip.mp4": hashlib.sha256(b"real clip bytes").hexdigest()},
            "prs": [41], "evidence": ["clip.mp4"]}
    v = claims.verify_claim(real, tmp_path, "main", pr_lookup=lambda n: {"state": "MERGED", "mergeCommit": head})
    assert v.ok, v.failures


def test_commit_that_exists_but_is_off_main_fails(tmp_path):
    g, head = _repo(tmp_path)
    g("switch", "-qc", "side"); (tmp_path / "x").write_text("x"); g("add", "x"); g("commit", "-qm", "side")
    side = g("rev-parse", "HEAD"); g("switch", "-q", "main")
    assert not claims.verify_claim({"commits": [side]}, tmp_path, "main").ok


def test_open_pr_claimed_as_merged_fails(tmp_path):
    g, head = _repo(tmp_path)
    v = claims.verify_claim({"prs": [7]}, tmp_path, "main", pr_lookup=lambda n: {"state": "OPEN", "mergeCommit": None})
    assert not v.ok


def test_injection_in_commit_field_is_not_executed(tmp_path):
    _repo(tmp_path)
    assert not claims.verify_claim({"commits": ["HEAD; rm -rf /"]}, tmp_path).ok


# --- report instruction checker ---
def test_method_drift_caught():
    ok, why = instruction.method_matches("Feature branch + PR, no force-push", "Feature branch + PR, force-push once")
    assert not ok and "drift" in why
    assert instruction.method_matches("a  b\nc", "a b c")[0]


def test_banned_ops_caught_even_disguised():
    bad = ["git push -f origin x", "git push origin x --force", "git commit --amend -m x",
           "git reset --hard HEAD~1", "git rebase main", "echo hi && rm -rf build", "git rm a.txt",
           "git commit --no-verify -m x"]
    assert len(instruction.check_commands(bad)) == len(bad)
    assert instruction.check_commands(["git push origin feat", "git commit -m 'rebase notes'"]) == []


def test_out_of_scope_path_and_prefix_trick():
    probs = instruction.check_paths(["show/production/wielder/a.py", "show/production/wielder-evil/b.py", "src/c.ts"],
                                    ["show/production/wielder/"])
    assert len(probs) == 2
