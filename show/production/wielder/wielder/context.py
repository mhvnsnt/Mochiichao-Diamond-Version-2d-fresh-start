"""Context compaction (parity follow-up, 2026-10-28).

The parity matrix named the gap plainly: Grok and Claude both ship
first-class compaction for long agent loops; Wielder's answer was
structural only (top-3 retrieval, bounded state, the ledger as
external memory) with no summariser for a run whose own history grows
past usefulness. This module is that summariser, built to Wielder's
rules rather than the vendors':

- **Deterministic.** The digest is extractive, not generative: entry
  lines carry tool / ok / exit code / a content hash / a bounded
  excerpt. No model seat is required, none is consulted, and the same
  history always compacts to the same digest. (An LLM gloss would be
  advisory text on top of this, never the mechanism — routing never
  reads advisory text, so it never reads a gloss either.)
- **Routing-blind by construction.** Compaction rewrites only the
  state's `tool_results` list. The entries the router actually reads —
  the `read_manifest` / `run_verifier` results for the run's own
  finish-gate target — are pinned verbatim, as is the recent tail.
  `evaluate()` therefore finds the identical manifest object after
  compaction, and every other state field (plan, target, receipts)
  is untouched: the function never receives them.
- **Rulings and authorizations are pinned as data.** A closed
  vocabulary scan (see `reference_vocabulary`) finds every owner
  ruling / standing-authorization reference the history cites, and
  the digest carries each one verbatim in canonical form. The
  vocabulary is Wielder's own: `rules.json` (settled rulings, naming
  laws, canon locks, standing laws) and the Standing Authorization
  Ledger's classes (the never-grantable set, the mirrored grants,
  and the standing classes the package's CLI seeds). That is also how Wielder's own records cite these things —
  `rules.check_text` returns the canonical ruling string, and
  `authz` errors name the class verbatim — so the guarantee covers
  the references as the system itself writes them. A reference
  coined outside that vocabulary is outside the guarantee, and is
  named as such here rather than papered over.
- **Bounded.** The rendered digest is capped (`DIGEST_CAP_CHARS`).
  The pinned-reference section cannot exceed the vocabulary itself
  (history can cite a reference many times; it cannot invent new
  ones), and the per-entry lines shrink, then elide oldest-first,
  until the cap holds. Full fidelity is never destroyed: every tool
  call is already in the ledger and the pre-compaction state is in
  the graph checkpoint — the digest is a continuation aid, not the
  record.
- **On by default** (flipped in the 2026-10-28 reconciliation, on
  the grok lane's PR #44 catch: a safety feature defaulted off is a
  safety feature that does not run). `WIELDER_COMPACTION=0` is the
  off switch. A compaction failure can never break the loop (the
  graph wraps the call exactly as it wraps `brain.advise`); the
  un-compacted history simply continues.
"""
from __future__ import annotations

import hashlib
import json
import os
from functools import lru_cache
from typing import Optional

from . import constitution as C

COMPACTION_ENV = "WIELDER_COMPACTION"

# Defaults; each is overridable from wielder.config `budgets` without
# touching this module (the constitution is read, never edited here).
DEFAULT_THRESHOLD_CHARS = 120_000   # serialized tool_results size
DEFAULT_DIGEST_CAP_CHARS = 12_000   # rendered digest ceiling
DEFAULT_TAIL_ENTRIES = 6            # most-recent entries kept verbatim
_EXCERPT_LADDER = (240, 120, 40, 0)  # excerpt sizes tried against the cap


def compaction_enabled() -> bool:
    """On by default; `WIELDER_COMPACTION=0` disables. (Originally
    opt-in like `brain.advisory_enabled`; flipped 2026-10-28 in the
    PR #44 reconciliation — compaction is a safety mechanism, and a
    safety mechanism defaulted off does not protect long runs.)"""
    return os.environ.get(COMPACTION_ENV) != "0"


def _budget(key: str, default: int) -> int:
    try:
        return int(C.CONFIG.get("budgets", {}).get(key, default))
    except Exception:
        return default


def threshold_chars() -> int:
    return _budget("context_compaction_threshold_chars", DEFAULT_THRESHOLD_CHARS)


def digest_cap_chars() -> int:
    return _budget("context_digest_cap_chars", DEFAULT_DIGEST_CAP_CHARS)


def tail_entries() -> int:
    return _budget("context_compaction_tail_entries", DEFAULT_TAIL_ENTRIES)


def _serialize(entry: dict) -> str:
    return json.dumps(entry, default=str, sort_keys=True)


def measure(entries: list) -> int:
    """The size compaction reasons about: the serialized history."""
    return len(json.dumps(entries, default=str))


# ---------------------------------------------------------------------------
# The pinned vocabulary — owner rulings + standing-authorization classes,
# from Wielder's own data of record.
# ---------------------------------------------------------------------------

def _ruling_keys(text: str) -> set[str]:
    """Match keys for a ruling, mirroring rules.py's own citation
    convention: the full string, plus the key segment before the
    first ';' or '—' (how settled rulings are cited in run text)."""
    keys = {text}
    key = text.split(";")[0].split("—")[0].strip()
    if key:
        keys.add(key)
    return keys


@lru_cache(maxsize=1)
def reference_vocabulary() -> tuple:
    """(canonical_reference, kind, match_keys) triples, built once
    from rules.json + the Standing Authorization Ledger's classes."""
    from . import authz as _authz
    from . import rules as _rules

    vocab: list[tuple[str, str, frozenset]] = []
    R = _rules.RULES
    for ruling in R.get("settled_rulings_never_relitigated", []):
        vocab.append((ruling, "owner-ruling", frozenset(_ruling_keys(ruling))))
    for term, ruling in R.get("naming_laws", {}).get("banned_terms", {}).items():
        canonical = f"{term} — {ruling}"
        vocab.append((canonical, "owner-ruling (naming law)",
                      frozenset({term, ruling, canonical})))
    for value in R.get("canon_locks", {}).values():
        vocab.append((value, "canon-lock", frozenset({value})))
    for law_key in ("staging_law", "construction_kit_filter"):
        law = R.get(law_key)
        if law:
            vocab.append((law, "owner-ruling (standing law)",
                          frozenset(_ruling_keys(law))))
    classes = set(_authz.NEVER_GRANTABLE)
    try:  # the mirrored grants are data of record; absence is not an error
        mirror = json.loads((C.WIELDER_HOME / "standing-authorizations.json").read_text())
        classes |= {g["action_class"] for g in mirror.get("grants", [])}
    except Exception:
        pass
    try:  # plus the standing classes the package's own CLI seeds
        from .cli import OWNER_STANDING_CLASSES
        classes |= set(OWNER_STANDING_CLASSES)
    except Exception:
        pass
    for cls in sorted(classes):
        vocab.append((cls, "standing-authorization class", frozenset({cls})))
    return tuple(vocab)


def find_references(entries: list) -> list[dict]:
    """Every vocabulary reference cited anywhere in the history, in
    canonical form, with the indices of the entries citing it.
    Pure set intersection over the closed vocabulary — no model, no
    sampling — so a cited reference cannot be dropped silently."""
    lowered = [_serialize(e).lower() for e in entries]
    found = []
    for canonical, kind, keys in reference_vocabulary():
        cited = [i for i, text in enumerate(lowered)
                 if any(k.lower() in text for k in keys)]
        if cited:
            found.append({"reference": canonical, "kind": kind, "cited_in": cited})
    return found


# ---------------------------------------------------------------------------
# Compaction proper.
# ---------------------------------------------------------------------------

def _excerpt(entry: dict, cap: int) -> str:
    if cap <= 0:
        return ""
    raw = (entry.get("raw_output") or "").strip()
    if not raw:
        raw = json.dumps(entry.get("result", {}), default=str)
    line = next((ln.strip() for ln in raw.splitlines() if ln.strip()), "")
    return line[:cap]


def _render(digest: dict, excerpt_cap: int) -> str:
    out = ["[context digest — deterministic extract; the ledger + checkpoint "
           "remain the record]"]
    out.append(f"target: {digest.get('target_id')} · entries compacted: "
               f"{digest['original_entries']} ({digest['original_chars']} chars)")
    refs = digest.get("pinned_references", [])
    if refs:
        out.append("pinned references (verbatim, canonical form):")
        for r in refs:
            out.append(f"- [{r['kind']}] {r['reference']} "
                       f"(cited in entries {r['cited_in']})")
    if digest.get("elided_extra"):
        out.append(f"({digest['elided_extra']} oldest digested entries elided "
                   "to hold the digest bound; hashes in the ledger record)")
    for ln in digest["lines"]:
        seg = f"#{ln['index']} {ln['tool']} ok={ln['ok']} exit={ln['exit_code']} " \
              f"sha:{ln['sha256']}"
        if excerpt_cap:
            seg += f" :: {ln['excerpt']}"
        out.append(seg)
    return "\n".join(out)


def compact_history(entries: list, target_id: Optional[str] = None,
                    threshold: Optional[int] = None, cap: Optional[int] = None,
                    tail: Optional[int] = None) -> dict:
    """Compact an over-threshold run history into a bounded digest.

    Returns a wrapper dict. When the history is below threshold the
    wrapper is {"fired": False, ...} and the SAME list object comes
    back — compaction below threshold is a no-op by identity, not by
    resemblance. When it fires, wrapper["entries"] is the replacement
    tool_results: one digest entry + the pinned entries verbatim
    (router inputs for `target_id`, plus the recent tail)."""
    threshold = threshold_chars() if threshold is None else threshold
    cap = digest_cap_chars() if cap is None else cap
    tail = tail_entries() if tail is None else tail
    size = measure(entries)
    if size < threshold:
        return {"fired": False, "reason": f"below threshold ({size} < {threshold} chars)",
                "entries": entries, "digest": None, "rendered": "",
                "original_chars": size, "compacted_chars": size}

    n = len(entries)
    pinned: set[int] = set(range(max(0, n - tail), n))  # recent tail, verbatim
    for i, e in enumerate(entries):
        if e.get("tool") in ("read_manifest", "run_verifier") and target_id is not None \
                and (e.get("payload") or {}).get("target_id") == target_id:
            pinned.add(i)  # the router's inputs are never digested

    refs = find_references(entries)
    lines = []
    for i, e in enumerate(entries):
        if i in pinned:
            continue
        lines.append({"index": i, "tool": e.get("tool"), "ok": e.get("ok"),
                      "exit_code": e.get("exit_code"),
                      "sha256": hashlib.sha256(_serialize(e).encode()).hexdigest()[:16],
                      "excerpt": _excerpt(e, _EXCERPT_LADDER[0])})
    digest = {"kind": "context_digest", "version": 1, "target_id": target_id,
              "original_entries": n, "original_chars": size,
              "pinned_references": refs, "pinned_entries": sorted(pinned),
              "lines": lines, "elided_extra": 0}

    rendered = ""
    for excerpt_cap in _EXCERPT_LADDER:  # shrink excerpts until the cap holds
        for ln in lines:
            ln["excerpt"] = _excerpt(entries[ln["index"]], excerpt_cap) \
                if excerpt_cap else ""
        rendered = _render(digest, excerpt_cap)
        if len(rendered) <= cap:
            break
    while len(rendered) > cap and digest["lines"]:  # then elide oldest-first
        digest["lines"].pop(0)
        digest["elided_extra"] += 1
        rendered = _render(digest, 0)

    digest_entry = {"tool": "context_digest", "ok": True, "exit_code": None,
                    "result": digest, "raw_output": rendered,
                    "payload": {"target_id": target_id, "compacted_from": n}}
    new_entries = [digest_entry] + [entries[i] for i in sorted(pinned)]
    return {"fired": True, "reason": f"compacted {size} chars over threshold {threshold}",
            "entries": new_entries, "digest": digest, "rendered": rendered,
            "original_chars": size, "compacted_chars": measure(new_entries)}


def maybe_compact(entries: list, target_id: Optional[str] = None) -> tuple:
    """The graph's entry point, mirroring brain.advise's contract:
    returns (entries, wrapper-or-None). When compaction is disabled
    or below threshold, the original list comes back with None.
    Callers must treat any exception as 'keep the original history'."""
    if not compaction_enabled():
        return entries, None
    out = compact_history(entries, target_id=target_id)
    if not out["fired"]:
        return entries, None
    return out["entries"], out
