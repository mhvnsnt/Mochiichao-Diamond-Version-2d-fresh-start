# SOURCE-SYSTEM — what the owner's coordination system actually is, verified at source

Read in full on 2026-10-28, before anything in this seat was written.
The owner pointed at "Cape Jones / Western Heart"; both repos' own
`AGENTS.md` files route coordination to the third repo, **`mhvnsnt/agent-ops`**,
which is the hub. The system is one system in three places:

## 1. `mhvnsnt/agent-ops` — the fleet coordination hub

*“Agent operations: checkpoints, watchdog, Proving Ground.”* The pieces:

| File (size at read) | What it is in the mechanism |
|---|---|
| `CLAIMS.md` (9,774 B) | **The claim board.** Protocol: claim before starting (agent, task, branch, start CT) in your first work PR; check first — a held task/files means pick another or coordinate in TAG-TEAM; close with `done` + PR link or `released`. ~35 lived rows: Grok Bot, Repo Co Dev, Muse lanes claiming side by side, scopes and NOT-touching lists in the open. |
| `TAG-TEAM.md` (8,254 B) | **The agent-to-agent message board.** Roster header; table `# / Workstream / Owner / Status / Links / Next step`; agents assign each other work ("Muse (assigned by owner via Grok Bot)"), write direct heads-ups inside cells ("Heads-up, Repo Co Dev: this adds a scale hook inside your Lab claim, additive only…"), and a "Tasks Muse can claim now" open-claims section. Entry rule: read HOW-GROKBOT-WORKS, add a CLAIMS line, update your row in the same PR as your work. |
| `HOW-GROKBOT-WORKS.md` (3,443 B) | The outside-agent onboarding: lock the owner's method verbatim → claim it → branch + PR → small pushes → proof with every "done" → honest status line first. Written so a *new kind* of agent can join the floor. |
| `HANDOFF-INDEX.md` (4,372 B) | Fleet state in one place: the handoff docs per workstream + `MERGE-QUEUE.md`, and the binding fleet rules — **DONE MEANS VERIFIED ON MAIN · QUEUE-FIRST · PROGRESS = ARTIFACTS, NOT HEARTBEATS · CONFLICTS KEEP BOTH SIDES · BLOCKERS ARE CONCRETE DECISIONS** — plus the 5-step cold pickup (index → handoff doc → queue → verify yourself → branch/PR/merge → verify on main → update queue + handoff in the same PR). |
| `HANDOFF-WESTERN-HEART.md` / `HANDOFF-TEARDOWNS.md` / `HANDOFF-REPOS.md` / `HANDOFF-CANON.md` (5,740 B) | Per-workstream state docs. (HANDOFF-CANON is about where *canon* lives, despite the name — the handoff *format* itself lives in western-heart, below.) |
| `MERGE-QUEUE.md` (1,100,287 B) | The cross-repo landing queue: every built-but-not-landed item with a state (OPEN-PR / BRANCH-ONLY / LOCAL-ONLY / BLOCKED / LANDED-VERIFIED). |
| `CHECKPOINT_PROTOCOL.md` (3,330 B) + `checkpoint.sh` (5,180 B) + `supervisor.sh` (6,252 B) + `RESUME_BRIEF_TEMPLATE.md` (3,782 B) + `IDEMPOTENCY.md` (2,995 B) | Restart resilience: one JSON checkpoint per task (`goal`, `steps_completed` — do not redo, `next_steps`, `key_paths`, `decisions`, `blockers`, `resume_prompt`), heartbeat ~10 min, claim-with-fencing-epoch on resume, supervisor prints re-spawn briefs after a restart; idempotency rules so re-runs can't duplicate work. |
| `LANE_GUARD.md` (7,653 B) + `lane-worktree.sh` (7,784 B) + `lane-ckpt.sh` (3,940 B) + `guard-paths.sh` (5,683 B) + `lanes.json` / `protected-paths.json` | One git worktree + branch per lane with a registry that refuses cross-lane writes; protected-paths registry every cleanup lane must check before touching a path. |
| `docs/ANTI-CLOBBER-LAW.md` (3,107 B) + the law texts in `AGENTS.md` (5,219 B) | The shared laws (anti-clobber, verify-before-claiming, no-data-loss) — canonical copies live here; the project repos carry their own copies. |

## 2. `mhvnsnt/western-heart` — the team protocol, in a game repo

- `docs/AGENT-TEAM-PROTOCOL.md` (3,521 B) — the pattern stated plainly:
  one agent finds the root cause, others build on top (no second version
  of the fix); **claim before you start**; work alongside, don't step on
  each other; check the landing. And the lanes clause the owner's
  2026-10-28 ruling restates: *"Lanes (soft, not hard… The user
  explicitly revoked lane-guarding.)"* Also the **handoff format**:
  handoff docs in `docs/handoffs/`, named like
  `CLAUDE_TO_CREW_2026-10-23.md` — what broke, the commit, the fix, how
  to do it right, evidence not vibes. And the attribution note: all
  agents merge through the single `mhvnsnt` login, so who-did-what is
  read from branch prefixes + PR bodies, not the merger.
- `docs/team/TASKBOARD.md` (2,255 B) — a claimable backlog: pick the top
  unowned item, set `owner` + `branch` (that *is* the claim), push
  early, link the PR. Statuses: open · claimed · paused (limit) ·
  in review · done.
- `docs/team/HANDOFF.md` (1,953 B) — limit/resume discipline: push early
  and often, draft PR at first commit, on limit-hit mark the board
  `paused (limit, resets <time CT>)`; picking up someone else's work =
  branch **off their branch**, never a parallel re-creation; parallel
  branches reconcile by landing order, conflicts keep both sides.
- `AGENTS.md` (14,065 B) routes merges through it all: "reconcile with
  other agents' branches via agent-ops `CLAIMS.md`", "Claim the work in
  agent-ops `CLAIMS.md` first" (merge rule).

## 3. `mhvnsnt/cape-jones` — the same floor, inside a show repo

- `TEAM-CONVERSATION.md` (10,107 B) — a per-wave coordination log: each
  lane posts a dated entry — **Touched / Verified, not relayed / Needed
  from other lanes / Deliberately NOT touched** — including a
  shared-checkout collision and its resolution, recorded in the open,
  with the lesson (one worktree per lane) written into the log.
- `AGENTS.md` (14,507 B) — the laws (verify-before-claiming, own-eyes,
  check-research-wire-do, anti-clobber) + the ALL-AGENTS roster rule
  (keep the roster current so "all the agents" always resolves).
- `.clinerules` (3,692 B) — *"CHECK-BEFORE-STARTING: git log, open PRs,
  checkpoints — no duplicate lanes."*

## What was ported here, and what was not

**Ported (this seat, his shapes, minimally adapted):**
- The claim board → `CLAIMS.md` (one added column, *Seat / scope*, so a
  row names the files it covers — the fleet board spreads scope across
  its Task text instead).
- The message board → `TAG-TEAM.md` (his table shape; threads addressed
  From → To).
- The handoff format + cold pickup + limit discipline → `HANDOFFS.md`,
  with handoffs living in `handoffs/` under the fleet
  `<FROM>_TO_<TO>_<DATE>.md` naming.
- The how-to/roster → `README.md`.

**Referenced, deliberately NOT copied:**
- The checkpoint + lane-guard **scripts** (`checkpoint.sh`,
  `supervisor.sh`, `lane-worktree.sh`, `lane-ckpt.sh`, `guard-paths.sh`)
  and `checkpoints/` data — machine-local tooling written against a
  local agent-ops checkout. Their protocol (schema, heartbeat, resume
  contract) is digested into `HANDOFFS.md` with the pointer home; the
  fleet keeps one copy of the machinery, in agent-ops.
- `MERGE-QUEUE.md` — cross-repo by nature and 1.1 MB of live fleet
  history; this repo's local queue role is the CLAIMS board itself.
- The law texts (anti-clobber etc.) — this repo already carries its own
  law copies (root `AGENTS.md`, `show/production/WORKING-RULES.md`);
  duplicating them a third time here would fork them.

**Gaps, named plainly:**
- The fleet roster doc (`TEAM-BRIEFING.md`, referenced by cape-jones'
  AGENTS.md) lives in `mhvnsnt/money-machine-hq`, outside the three
  repos audited for this landing; the roster function here is carried
  by `README.md` + the TAG-TEAM header instead.
- Nothing in the three repos gives an *outside* agent a machine-readable
  (API/JSON) board — the whole system is markdown-on-git, read by eyes
  and agents alike. This seat keeps that shape; it is the owner's
  design, not an oversight to fix in a port.
- Western Heart yielded its material (the protocol trio above) and Cape
  Jones yielded the conversation log — neither repo was empty; the
  *hub* is agent-ops, which both repos' own docs point to.
