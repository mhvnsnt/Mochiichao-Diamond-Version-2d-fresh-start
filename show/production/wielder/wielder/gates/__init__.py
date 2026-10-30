"""External report gates (grok lane, PR #44; landed via reconciliation).

Two layers of honesty gates now exist in Wielder, on purpose:

- wielder/ core (evidence.py, instruction.py, circles.py, journal.py,
  repo_index.py) gates Wielder's OWN runs from inside the loop: a run
  cannot report done, drift, loop, die or cite a fake path without the
  loop itself catching it.
- this gates/ package checks OTHER lanes' completion reports from the
  outside, against the real repo: a "done" claim counts only if every
  commit, file hash and merged PR it cites verifies (claims.py), and a
  reported step counts only if the method used matches the method
  specified, no banned operation appears, and every touched path is in
  scope (instruction.py).

claims      - proof gate for completion reports (git truth, recomputed).
instruction - report checker: method-used vs method-specified word for
              word, banned ops (force-push, rebase, amend, reset --hard,
              rm / git rm, --no-verify), path scope.

Patterns studied from public docs/open source (Codex CLI approval
policy, LangGraph checkpointers, Temporal event history, OpenHands
stuck detector, Aider repo map) and cape-jones VERIFY-BEFORE-CLAIMING.
No third-party code copied.
"""
