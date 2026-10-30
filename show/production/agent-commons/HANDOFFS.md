# HANDOFFS — how work passes between agents in this repo

The owner's handoff discipline, from `mhvnsnt/western-heart`
(`docs/AGENT-TEAM-PROTOCOL.md` + `docs/team/HANDOFF.md`) and
`mhvnsnt/agent-ops` (`HANDOFF-INDEX.md`). A handoff is a document, not a
chat message: the next agent picks the work up **cold**, from the repo,
without asking anyone where things stand.

## The handoff doc

- **Where:** `show/production/agent-commons/handoffs/`
- **Name:** `<FROM>_TO_<TO>_<YYYY-MM-DD>.md` — the fleet pattern
  (e.g. `CLAUDE_TO_CREW_2026-10-23.md` in western-heart).
- **Contents** (the fleet shape — what broke / what was done / what
  remains, with evidence):
  1. **What this is** — the workstream, the repo seats it touches, the
     branch(es) and PR(s) involved.
  2. **Done — verified** — what actually landed, and how it was verified
     (on main: file present + size/sha, PR state MERGED). A lane report
     is a claim; verified-on-main is done. Nothing unverified is listed
     as done.
  3. **Not done / in flight** — what remains, in order, with the exact
     next step for each.
  4. **Do not redo** — finished pieces a resume must not rebuild.
  5. **Decisions in force** — rulings and constraints the next agent
     must honor (owner's calls stay flagged as owner's calls).
  6. **Blockers** — each stated as the concrete decision needed, never
     a bare "needs owner".
- **Same PR rule:** when you finish or stall a workstream, the handoff
  doc, your [CLAIMS.md](CLAIMS.md) row and your [TAG-TEAM.md](TAG-TEAM.md)
  thread are updated in the same PR as the final work. The next agent
  should never have to ask where things stand.

## Picking up any workstream cold (fleet steps, from HANDOFF-INDEX.md)

1. Read [README.md](README.md), then CLAIMS.md, then the handoff doc
   for your workstream.
2. Verify current state yourself before acting: open PRs, recent
   commits, file presence on main. Handoff docs are a map, not proof;
   the repos win any disagreement.
3. Claim your row on CLAIMS.md, then work branch → PR → merge.
4. Verify the payload on main after merge; mark the claim `done` with
   the PR link.
5. If the work isn't on GitHub, **don't re-create it in parallel** —
   post in TAG-TEAM.md so the holding lane pushes, or take a clearly
   different item. If you continue someone's branch, branch **off their
   branch**, not a fresh copy, and note it on the board.

## Hitting a limit mid-task

- Stop new work, push what you have, open/update the PR with its
  checklist current (done / in progress / next step / exact commands).
- Mark your CLAIMS.md row `paused (limit, resets <time CT>)` with the
  PR link, and post the state in your TAG-TEAM thread.
- Nothing may live only on one machine.

## Restart resilience (fleet machinery — referenced, not duplicated)

Long fleet tasks also checkpoint outside this repo, in
`mhvnsnt/agent-ops`: one JSON per task under `checkpoints/`
(`task_id`, `agent_id`, `repo`, `branch`, `goal`, `status`,
`steps_completed` — **do not redo these**, `next_steps`, `key_paths`,
`decisions`, `blockers`, `resume_prompt`), a heartbeat at least every
~10 minutes, and a resume contract: a re-spawned worker reads its
checkpoint + `RESUME_BRIEF_TEMPLATE.md` + `IDEMPOTENCY.md`, verifies
the checkpoint's claims against the repo, claims the task (fencing
epoch), then continues. The full protocol is `CHECKPOINT_PROTOCOL.md`
and `LANE_GUARD.md` in agent-ops — read them there; this seat
deliberately keeps one copy of that machinery, at fleet level.
