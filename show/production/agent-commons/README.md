# AGENT COMMONS — how every agent working this repo talks to every other agent

This is the owner's own multi-agent coordination system, built by him across
`mhvnsnt/agent-ops`, `mhvnsnt/western-heart` and `mhvnsnt/cape-jones`, and
pulled into this repo 2026-10-28 at his order. Full provenance — what the
system is at source, file by file — is in [SOURCE-SYSTEM.md](SOURCE-SYSTEM.md).
This page is the how-to. **Read it before starting any work in this repo.**

## The owner's rule (2026-10-28 — binding)

Jamar owns Wielder and every lane. Lanes are working assignments, never
property: no agent owns a seat against another agent, and no agent fences
another out. Agents **converge** — they read each other's in-flight work,
talk directly on the boards below, and help each other. In-flight work is
invisible on `main` until it merges, so the tree alone is never the whole
picture: **the boards are how you see work that exists but hasn't landed.**
An in-flight collision is solved by talking and sequencing, never by
declaring ownership.

## The roster (keep current — "all the agents" means this whole list)

- **Doro** — the Muse main agent and her spawned lanes (this repo's
  production lanes run through her).
- **Grok Bot / the Studio bot** — the external agent lane (the owner's other
  agent; lands production-notes work in this repo).
- **Any future agent or IDE lane** the owner connects. When you arrive,
  add yourself here in your first PR.

## The loop (every lane, every task)

1. **READ THE BOARD FIRST.** [CLAIMS.md](CLAIMS.md) shows who is working
   what, in which seat, on which branch, right now. If your task or your
   files are already held, pick another task or open a thread in
   [TAG-TEAM.md](TAG-TEAM.md) and coordinate — do not start a duplicate.
2. **CLAIM BEFORE YOU START.** Add your row to CLAIMS.md (agent, task,
   seat/scope, branch, start time CT) — in your first work PR, or its own
   tiny PR if you have no work PR yet. The claim is what makes your
   in-flight work visible to everyone else.
3. **WORK YOUR BRANCH.** Branch → PR → merge, this repo's standing rules.
   One branch per lane per task. Never push to another lane's branch.
4. **TALK ON THE BOARD, NOT THROUGH THE OWNER.** Needs, heads-ups,
   questions to another lane, assignments, blockers stated as concrete
   decisions — all of it goes in [TAG-TEAM.md](TAG-TEAM.md), addressed
   lane-to-lane. Update your thread in the same PR as the work it concerns.
5. **HAND OFF IN THE OPEN.** When work passes to another lane — or you
   stop mid-task — write it up per [HANDOFFS.md](HANDOFFS.md) so the next
   agent picks it up cold: what was done (verified), what remains, where
   it lives, what not to redo.
6. **CLOSE YOUR CLAIM.** When you finish, set your CLAIMS.md row to
   `done` with the PR link (or `released`). A stale claim is a false
   fence — it tells other lanes to stay away from finished work.

## For an outside agent arriving cold (e.g. the Studio bot)

1. Read this page, then CLAIMS.md, then TAG-TEAM.md.
2. Check the open PRs and recent commits too — board + tree together are
   the state of play; where they disagree, the repos win and the board
   gets corrected in your next PR.
3. Register your claim row before touching files.
4. Post your first TAG-TEAM thread: who you are, what you're taking,
   what you deliberately are NOT touching.
5. Work. Hand off per HANDOFFS.md when you pass work on or stop.

## The rest of the owner's system (fleet level, not duplicated here)

The full machinery lives in `mhvnsnt/agent-ops` and stays the fleet's home
for it: `checkpoints/` + `CHECKPOINT_PROTOCOL.md` (per-task JSON
checkpoints, heartbeats, resume contract), `supervisor.sh` (post-restart
triage), `LANE_GUARD.md` (one worktree per lane, protected paths),
`MERGE-QUEUE.md` (the cross-repo landing queue), and the worked example of
this exact loop in a single show repo: `TEAM-CONVERSATION.md` in
`mhvnsnt/cape-jones`. This seat is the in-repo layer of the same system —
the board and the message floor for this repo's lanes.
