"""Instruction checker: compare what the owner asked with what was done."""
# Origin: PR #44 (grok lane, grok/wielder-gates-20261028), landed via the
# 2026-10-28 reconciliation (see HANDOFF-CLAUDE-TO-GROK-2026-10-28.md).
from __future__ import annotations
import re

BANNED = [
    (re.compile(r"git\s+push\b.*(--force\b|-f\b|--force-with-lease)"), "force-push"),
    (re.compile(r"git\s+rebase\b"), "rebase"),
    (re.compile(r"git\s+commit\b.*--amend"), "amend"),
    (re.compile(r"git\s+reset\b.*--hard"), "reset --hard"),
    (re.compile(r"(^|[;&|]\s*)(rm\s+-[a-z]*r|git\s+rm\b)"), "deleting files"),
    (re.compile(r"--no-verify"), "skipping hooks"),
]

def _norm(s: str) -> str:
    return " ".join(str(s).split())

def method_matches(specified: str, used: str) -> tuple:
    """Word-for-word rule: only whitespace differences are tolerated."""
    a, b = _norm(specified), _norm(used)
    if a == b:
        return True, "exact match"
    aw, bw = a.split(), b.split()
    i = next((k for k in range(min(len(aw), len(bw))) if aw[k] != bw[k]), min(len(aw), len(bw)))
    return False, f"drift at word {i + 1}: specified {aw[i:i+4]!r} vs used {bw[i:i+4]!r}"

def check_commands(cmds: list) -> list:
    out = []
    for c in cmds:
        for rx, name in BANNED:
            if rx.search(c):
                out.append(f"banned op '{name}': {c}")
    return out

def check_paths(touched: list, allowed_prefixes: list) -> list:
    return [f"out-of-scope path: {p}" for p in touched
            if not any(p == a.rstrip("/") or p.startswith(a.rstrip("/") + "/") for a in allowed_prefixes)]

def check_step(ask: dict, step: dict) -> list:
    """ask = {method, allowed_paths}; step = {method_used, commands, paths}."""
    problems = []
    if "method" in ask:
        ok, why = method_matches(ask["method"], step.get("method_used", ""))
        if not ok:
            problems.append("method " + why)
    problems += check_commands(step.get("commands", []))
    if ask.get("allowed_paths"):
        problems += check_paths(step.get("paths", []), ask["allowed_paths"])
    return problems
