"""Proof gate for completion claims. Trust nothing; recompute everything."""
# Origin: PR #44 (grok lane, grok/wielder-gates-20261028), landed via the
# 2026-10-28 reconciliation (see HANDOFF-CLAUDE-TO-GROK-2026-10-28.md).
from __future__ import annotations
import hashlib, json, re, subprocess
from dataclasses import dataclass, field
from pathlib import Path

@dataclass
class Verdict:
    ok: bool
    checked: list = field(default_factory=list)
    failures: list = field(default_factory=list)

def _git(repo, *args):
    r = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True)
    return r.returncode, r.stdout.strip()

def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()

HEX = re.compile(r"^[0-9a-f]{7,40}$")

def verify_claim(claim: dict, repo: Path, ref: str = "HEAD", pr_lookup=None) -> Verdict:
    """claim = {"commits":[sha], "files":{path: sha256}, "prs":[n], "evidence":[paths]}.
    A claim with nothing checkable fails: 'done' with no proof is not done."""
    v = Verdict(ok=True)
    checkable = 0
    for c in claim.get("commits", []):
        checkable += 1
        if not HEX.match(str(c)):
            v.failures.append(f"commit {c!r}: not a hash"); continue
        rc, full = _git(repo, "rev-parse", "--verify", "--quiet", f"{c}^{{commit}}")
        if rc != 0:
            v.failures.append(f"commit {c}: does not exist"); continue
        rc, _ = _git(repo, "merge-base", "--is-ancestor", full, ref)
        (v.checked if rc == 0 else v.failures).append(f"commit {c}: {'on' if rc == 0 else 'NOT on'} {ref}")
    for path, want in (claim.get("files") or {}).items():
        checkable += 1
        rc, blob = _git(repo, "rev-parse", "--verify", "--quiet", f"{ref}:{path}")
        if rc != 0:
            v.failures.append(f"file {path}: absent on {ref}"); continue
        data = subprocess.run(["git", "-C", str(repo), "cat-file", "blob", blob], capture_output=True).stdout
        got = hashlib.sha256(data).hexdigest()
        (v.checked if got == str(want).lower() else v.failures).append(
            f"file {path}: sha256 {'match' if got == str(want).lower() else 'MISMATCH got ' + got[:12]}")
    for n in claim.get("prs", []):
        checkable += 1
        if pr_lookup is None:
            v.failures.append(f"PR #{n}: no verifier available"); continue
        info = pr_lookup(n) or {}
        if info.get("state") != "MERGED":
            v.failures.append(f"PR #{n}: state {info.get('state')!r}, not MERGED"); continue
        mc = info.get("mergeCommit")
        rc, _ = _git(repo, "merge-base", "--is-ancestor", mc or "x", ref) if mc else (1, "")
        (v.checked if rc == 0 else v.failures).append(f"PR #{n}: merged, merge commit {'on' if rc == 0 else 'NOT on'} {ref}")
    for e in claim.get("evidence", []):
        checkable += 1
        p = Path(repo) / e
        (v.checked if p.is_file() and p.stat().st_size > 0 else v.failures).append(f"evidence {e}")
    if checkable == 0:
        v.failures.append("claim cites no checkable proof")
    v.ok = not v.failures
    return v

def gh_pr_lookup(repo_slug: str):
    def look(n):
        r = subprocess.run(["gh", "pr", "view", str(n), "-R", repo_slug, "--json", "state,mergeCommit"],
                           capture_output=True, text=True)
        if r.returncode != 0:
            return None
        d = json.loads(r.stdout)
        return {"state": d.get("state"), "mergeCommit": (d.get("mergeCommit") or {}).get("oid")}
    return look
