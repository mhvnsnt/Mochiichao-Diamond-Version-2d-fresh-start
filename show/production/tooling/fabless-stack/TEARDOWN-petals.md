# TEARDOWN — Petals (distributed inference) — EVALUATED-REJECTED for free-session seats

*Verified at source 2026-10-28: github.com/bigscience-workshop/petals —
licence read from the repo: **MIT**. Built on Hivemind (learning-at-home,
MIT). Repo state the same day: 522 commits, 11 releases, not archived;
public swarm health page at health.petals.dev. Release cadence is slow —
the last tagged release line is v2.0.0.post1 (2023-era) with the project in
low-maintenance mode since; the README's headline models are Llama 3.1
(up to 405B), Mixtral 8x22B, Falcon 40B+, BLOOM 176B.*

## What it is

Petals splits one big model across many small machines, BitTorrent-style:
each volunteer server hosts a slice of the model's transformer blocks; a
client chains the slices into a pipeline over the internet (a DHT, via
Hivemind, handles discovery and load balancing). Its own measured headline:
single-batch generation at up to **~6 tokens/sec for Llama 2 70B** and
**~4 tokens/sec for Falcon 180B** across the public swarm — chatbot-usable,
nowhere near local speed. It also supports fine-tuning (prompt tuning /
adapters) through the same swarm. For private data there is a private-swarm
mode among machines you control.

## Why it was the candidate

It is the only serious open-source answer to "the model is bigger than any
seat we can get" — the squeeze problem from the owner's ground-floor list.
If free T4 sessions could each hold a slice of a 70B brain, the free fleet
would manufacture one big virtual seat. That is exactly the claim this
teardown tests.

## The verdict, with measured reasons

**EVALUATED-REJECTED for our free-session seats.** Not because the idea is
wrong — because the free seat's physics fight it at four points:

1. **Session lifetime vs swarm stability.** A Petals server earns its place
   in the DHT by staying up and announcing blocks. Kaggle sessions are
   capped (~12 h max, recycled without negotiation) and the free quota is
   ~30 GPU-hours/week shared with the show pipeline. A swarm member that
   vanishes mid-pipeline forces re-routing for every in-flight request;
   with sessions dying on a schedule, the swarm spends its life healing.
2. **Networking shape.** Petals servers need peers to reach them (the
   public swarm works because home/cloud machines accept connections or
   relay through the DHT's circuit relays, at a latency cost). Kaggle
   notebook kernels sit behind NAT with no inbound port control; the only
   public path in/out is an outbound tunnel (our cloudflared phone line) —
   one tunnel per session, HTTP-shaped, not the raw peer transport
   Hivemind wants. Nobody publishes a working Kaggle-Petals recipe;
   absence of evidence here is evidence of friction.
3. **Latency arithmetic.** Pipeline-parallel over the internet pays a
   network round trip per block-group per token. The project's own public
   numbers (~4–6 tok/s on 70B-class models over a *mature* swarm of
   always-on volunteers) are the ceiling a dying-and-reborn 2-session
   private swarm would start far below. Our chat use would feel broken;
   the show's batch jobs don't need interactive tokens but do need
   throughput, which pipeline-over-WAN also doesn't give.
4. **Maintenance reality.** 11 releases total, last release line from
   2023, model support centred on Llama 3.1/Mixtral/Falcon/BLOOM
   generations. Pinning the flagship phone/brain seat to a quiet upstream
   is how stacks rot; the licence (MIT) means we *could* fork it — and
   forking a distributed-systems project is a bigger build than the seat
   problem it solves.

## What would change the verdict (revisit triggers)

- We control **two or more always-on machines** (bought seats, a standing
  rented box): a *private* Petals swarm across our own hardware becomes
  rational for models bigger than one card — re-run this evaluation then.
- A maintained fork or successor (watch: Hivemind-based successors,
  exo-style LAN clustering for owned devices) reaches release health.
- A published, reproducible free-notebook Petals deployment appears —
  proof beats this analysis, and the standing rule is to re-check the
  checker when evidence changes.

## What we use instead for the same need

- **Compression first** (GGUF/AWQ squeezing): the models we actually run
  are chosen to fit one free card whole (grok-local model manifest).
- **Split by job, not by layer**: the fleet parallelises across *tasks*
  (one session per character/job), which ephemeral sessions are good at.
- If a future model genuinely exceeds one card, the honest options are a
  rented multi-GPU seat via SkyPilot or vLLM tensor parallelism across
  one node's cards — both wired in this folder's configs.

*No Petals code is vendored and no configs are landed, deliberately: a
config for a rejected design would be fake wiring. This document is the
deliverable for item 5.*
