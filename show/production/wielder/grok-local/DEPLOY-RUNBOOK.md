# DEPLOY-RUNBOOK — grok-local, in plain words

Owner ruling (2026-10-28): **"Build everything first — rent
when I say."** This package is fully built and deploy-ready;
no server has been rented and no money spent. Every route
below can be executed later, on your word.

## The seat ladder — owned first

Your Grok-pattern seat runs in several places. The owned ones
come first, because the system is **yours**, not borrowed:

1. **Phone seat (owned, flagship).** A model that runs on
   your phone's own chip, inside the app. No server, no
   network after one download. Section below.
2. **Your own computers (owned).** The same models on
   machines you own. The sibling piece for this is the
   fabless-stack lane's **llama.cpp seat** (GGUF builds of
   these same Qwen models on your own hardware); this kit's
   app and Wielder seat talk to it the same way, because
   every seat speaks the same OpenAI-shaped API and answers
   to the same name, `grok-local`.
3. **A bought card (owned, if you ever choose).** Buy a
   24 GB card once, run `serving/deploy.sh` on it, done —
   the primary 30B seat at 32K context, always on, no rent.
4. **Free test drives (borrowed fuel).** Kaggle free
   sessions boot the big seat for $0 — for training runs and
   test drives. Step 0 below. Borrowed engine, your stack.
5. **Serverless GPU (rented by the second).** Pay only
   while a request runs; $0 idle. Route 2.
6. **Hourly 4090 (rented by the hour).** Always-on while
   up. Route 3.

**The warehouse statement:** if every free tier and every
rental vanished tomorrow, everything owned still stands —
the weights and trained adapters live in your warehouse
(GitHub for code/configs, TeraBox for big files), the app
is a static site you host, and seats 1–3 run without asking
anyone. Free sessions are a fuel source, never a dependency
and never the product's home.

---

## PHONE SEAT — the flagship owned seat

**What it is.** The app (PWA) carries a second engine:
WebLLM (Apache-2.0) running `mlc-ai/Qwen3-1.7B-q4f16_1-MLC`
on the phone's GPU via WebGPU. Chosen deliberately for your
phones (Motorola moto g stylus 5G - 2023; Motorola edge
2024 — Adreno 710-class, 6–8 GB RAM): the 1.7B is the
largest build that class honestly runs at usable chat
speed. A 4B build (2.27 GB) is in the picker for the 8 GB
edge 2024, labelled slower/heavier. Sizes measured at
source; licences in `MODEL-MANIFEST.md`.

**How the model reaches the phone.** You do nothing with
files. First time you send a message in Phone-seat mode,
the app downloads the model **once** (~0.98 GB, measured)
from Hugging Face into the browser's own storage, showing
progress as it goes. After that it is cached on the phone.

**Storage cost on the phone.** ~1 GB for the 1.7B
(~2.3 GB if you pick the 4B), held as browser site data
for the app. Deleting the app's site data deletes it;
it re-downloads next first use.

**What works with zero network after that.** Everything
in Phone-seat mode: the app shell (service worker), the
model, and the chat itself run entirely on the phone —
airplane mode included. Server-seat mode and the
rendezvous still need network, by definition.

**Speed honesty.** Roughly 8–20 tok/s for the 1.7B on
this GPU class is an **estimate**. The app shows the
engine's own runtime stats after each reply — your first
run is the real measurement.

**First-run proof (the only step that needs your hands)
— PROVEN-ON-FIRST-RUN.** Everything up to this tap is
validated in the kit (30 app checks against mocks,
`validation/pwa-mock-test.txt`). Success looks like this:
1. Host the app (`pwa/HOSTING.md`) and open it on the
   phone; add it to the home screen.
2. Settings → Mode: Phone seat. Send any message. The
   model downloads with a progress readout (~1 GB, use
   Wi-Fi for this one download).
3. You get a streamed reply, and a banner shows the
   engine's runtime stats (its own tok/s numbers).
4. Turn on airplane mode. Send another message. A normal
   reply, fully offline, is the proof the seat is yours.

**Limits of the phone seat, plainly.** A 1.7B brain is a
small brain: quick answers, drafts, summaries, chat. It
is not the 30B seat's depth, it has no tools wired in the
app, and its context is short. That's the trade for
"always in your pocket, costs nothing, answers offline."

---

## Step 0 — the FREE TEST DRIVE (default first move)

Before any rent decision, drive the big seat for $0.
`free-test/` holds a ready Kaggle kernel
(`marsfmmg/grok-local-free-test`, private) that runs on
your existing account — no new accounts, no trials, no
card. One Run All: installs vLLM → pulls Qwen3-14B-AWQ
with sha256 checks → serves it on ONE T4 → runs the
built-in smoke test (chat + tool call) → opens a
Cloudflare quick tunnel → prints the endpoint URL and the
session key → publishes the address to the rendezvous
(if set up) so the app finds the seat itself.

**Driver script for the first live test drive** (for
whoever drives it in the browser — a Kaggle GPU slot must
be free; both slots busy with show work means it queues):

1. Open the kernel on Kaggle (upload `free-test/` via the
   Kaggle kernel import, or open the existing draft).
2. Confirm the accelerator is GPU T4 ×2 and Internet is
   on. Click **Run All** (Save & Run All for a committed
   version).
3. Watch the cells in order. Success lines, exactly:
   - `[pull] VERIFIED model-00001-of-00002.safetensors sha256=668eb0f1...` (and the second shard, `c3c1625d...`)
   - `[health] OK after ...s — models: ['grok-local']`
   - `[smoke] SMOKE TEST PASSED (chat + tool call)`
   - the `YOUR SEAT IS LIVE` block with an
     `https://....trycloudflare.com/v1` ENDPOINT and an
     API KEY line.
4. In the phone app: Server seat mode → reopen the app
   (rendezvous) or paste endpoint + key → send a message.
   A full (non-streamed) answer is success — quick
   tunnels can't stream; the app falls back by itself.
5. Before closing the session, run the last cell:
   `save_out()`. Success = `[save] DONE` with all four
   checklist items accounted for.

Timing honesty: the weight pull is ~10 GB and the model
load a few minutes; expect roughly 10–20 minutes from
Run All to a live endpoint on a free session (estimate).
Session limits are in the notebook's intro cell:
≤ ~12 h per session, ~30 GPU hrs/week shared (below),
endpoint dies with the session.

The notebook's full logic already ran end-to-end locally
in dry-run mode against a mock seat (health, real smoke
over HTTP, rendezvous write, save-out) —
`validation/kernel-dry-run.txt`. The GPU boot itself is
**PROVEN-ON-FIRST-RUN** with the success lines above.

---

## Free routes — verified at source (2026-10-28)

| Route | What you actually get | Limits | Card/trial? | Serves the PWA? | Verdict |
|---|---|---|---|---|---|
| **Kaggle Notebooks** | 2× T4 16 GB (not pooled), internet on | ~30 GPU hrs/week (Kaggle-published + account-observed), sessions ≤ ~12 h, max 2 GPU sessions at once | **No** — your existing account is already GPU-verified | Yes, via quick tunnel (no streaming) | ✅ **The free test drive** |
| **Google Colab free** | A T4-class GPU, unpublished/fluctuating limits, ≤ 12 h | Colab's own FAQ **prohibits** "file hosting, media serving, or other web service offerings" and "bypassing the notebook UI to interact primarily via a web UI" on the free tier, with termination without warning | No card for free tier | Technically possible, **against the provider's own rules** | ❌ **REJECTED-BY-OWNER-RULE** (needs no card, but building the seat on a use the provider forbids is building on sand) |
| **HF Spaces ZeroGPU (free)** | 5 GPU-minutes/day on a free account; Gradio SDK spaces only; GPU allocated per function call (`@spaces.GPU`) | Cannot hold a persistent server process at all | No card for the free tier | **No** — a vLLM server cannot live inside per-call GPU functions | ❌ **REJECTED for serving** (fine for a demo widget, not a seat) |

Tunnels, verified: **Cloudflare Quick Tunnel** — free,
no account, no domain; the URL changes every run (that's
what the rendezvous solves); ~200 in-flight requests max;
**no SSE streaming** (the app auto-falls-back). cloudflared
is Apache-2.0. ngrok's free tier exists but needs a new
account and its TCP endpoints need a verified card — kept
as a documented alternative, not used.

---

## Route 2 — serverless GPU (pay per use, $0 idle)

Verified at runpod.io/serverless-gpu (2026-10-28):
**RTX 4090 24 GB at $1.15/hr, metered per second**
(≈$0.000319/s), flex workers scale to zero — idle costs
$0. A chat request that keeps the GPU busy 10 seconds
costs roughly a third of a cent in GPU time. Cold starts
are real: the platform advertises sub-200 ms FlashBoot,
but an LLM worker's cold start is dominated by loading
10–18 GB of weights — expect tens of seconds on a cold
worker, then fast replies while it stays warm.

Shape: package `serving/Dockerfile` as the worker image,
weights pulled at worker start by `pull_model.py` (or
baked into a network volume), same `grok-local` name,
same smoke test as the health gate. Endpoint address is
stable (RunPod gives the endpoint a fixed URL) — the
PWA just holds it in Settings; no rendezvous needed.

Modal is the alternative: $0/mo Starter with $30/mo of
free credits and scale-to-zero per-second billing
(verified on modal.com/pricing). Its per-GPU $/s rate
table was **not captured** in this pass — marked
unverified rather than guessed; check before choosing.

## Route 3 — hourly 4090 (always-on while up)

Prices verified 2026-10-28 (programme research file
`VERIFY-4090-HOSTS-AND-MODELS.md`): **RunPod Secure
$0.89/hr, RunPod Community $0.34/hr**; Vast.ai is a
marketplace (no fixed price; ~$0.35–0.60/hr seen,
indicative only). A pod left up 24/7 at $0.34/hr is
~$245/mo — servers bill while they exist, not while
you use them.

Steps, when you say go:
1. Rent the pod (24 GB card, ≥80 GB disk).
2. Copy `serving/` up (or clone this repo on the pod),
   `cp serve.env.example serve.env`, set a real
   `GROK_LOCAL_API_KEY` in it.
3. `./deploy.sh` — checks the card, installs pinned
   vLLM, pulls + hash-verifies the weights **on the
   pod**, launches, waits for health, runs the smoke
   test, prints the endpoint summary (including the
   RunPod proxy URL when applicable).
4. Point the app: Settings → Server seat → paste the
   endpoint + key (or set the rendezvous once and let
   seats publish themselves).
5. **Stop billing: terminate the pod** in the host's
   dashboard (stopping the server process is not
   enough — the pod bills until terminated). Local
   process stop, for a seat you're keeping:
   `pkill -f 'vllm serve'`.

Deploy steps needing a GPU are **PROVEN-ON-FIRST-RUN**;
success = deploy's own `[deploy] health OK` plus the
smoke test's PASS lines and the printed ENDPOINT SUMMARY.

---

## The VIRTUAL SEAT — the layer that manufactures access

NVIDIA designs chips and lets others manufacture them.
This kit does the code equivalent: **the Virtual Seat is
the layer that manufactures GPU *access* out of free
stock.** Plainly: it creates no compute. It makes
scattered, temporary free capacity behave like one
standing seat — the same weights, the same server config,
the same app, wherever the capacity happens to be today.
It is the standing substitute for a rented card until
you say rent.

Its moving parts, all wired in this kit:

- **Session orchestration.** The free-test notebook IS
  the orchestration: one Run All boots a complete seat,
  and at boot the session **registers its live address to
  the rendezvous** so the app finds the current seat
  without you pasting an address each time.
- **The rendezvous.** One small JSON file
  (`rendezvous.json`: endpoint, model, seat, status, key
  fingerprint — **never the key**) in a **private
  Hugging Face dataset** that the session updates and
  the app reads on launch.
  One-time setup, in plain steps:
  1. If you don't have a Hugging Face account, make one
     (free) at huggingface.co — **this kit does not
     invent or hold credentials; without an account the
     manual-paste fallback below is simply the mode.**
  2. Create a **private dataset** named e.g.
     `grok-local-rendezvous`.
  3. Create an HF access token that can **write** to it
     (Settings → Access Tokens; a fine-grained token
     scoped to that dataset is best).
  4. On Kaggle: open the kernel → Add-ons → Secrets →
     add `HF_TOKEN` (the token) and
     `GROK_LOCAL_RENDEZVOUS_DATASET` (the dataset id).
  5. In the app: Settings → Rendezvous dataset (same id)
     + a token that can **read** it. The app stores it
     only on the phone.
  Fallback, always available: the notebook prints the
  URL + key; paste them into the app by hand. The
  rendezvous is a convenience layer, never a dependency.
- **End-of-session automation.** The notebook's last
  cell, `save_out()`, is the save checklist as one
  command — session record, smoke results, logs,
  adapters with a hashed manifest, rendezvous marked
  closed. Item-for-item match with the checklist below.
- **Sharding across sessions — evaluated, rejected.**
  See the verdict box below. No fake wiring.

> **SHARDING VERDICT — Petals: EVALUATED-REJECTED.**
> Petals (MIT licence) splits a model across volunteers'
> machines, BitTorrent-style. Measured reasons it does
> not fit this kit: (1) Its own README's supported
> models are Llama 3.1, Mixtral, Falcon and BLOOM —
> **Qwen3/Qwen3-MoE is not supported**, and adding an
> architecture is building new infrastructure, not
> wiring. (2) Petals servers join a public DHT swarm and
> must **accept peer connections** (its Docker example
> publishes port 31330); Kaggle sessions offer no
> inbound reachability. (3) A swarm member must stay
> alive for every request that touches its blocks —
> free sessions die at ≤ ~12 h, the account runs at
> most 2 at once, and those 2 are shared with the show
> pipeline. (4) Upstream is dormant: the repo's last
> push was 2024-09-07 (GitHub API, checked 2026-10-28).
> One honest seat per session beats a pretend cluster.

---

## Operating model — test drives forever, save everything

Your pattern, written down: **keep doing test drives
forever and save everything from them.** A free session
is a disposable computer. The product is what survives
it.

**Start-of-session checklist** (the notebook does most
of it on Run All):
- [ ] GPU slot free (show work has priority — if both
      slots are busy, the test drive queues)
- [ ] Run All on the free-test kernel
- [ ] `[pull] VERIFIED` on both shards
- [ ] `[smoke] SMOKE TEST PASSED`
- [ ] Endpoint printed / rendezvous published

**End-of-session SAVE CHECKLIST** — run `save_out()`;
nothing of value may exist only inside a session:
- [ ] Code + configs → **GitHub** (they already live in
      this repo; anything you changed in-session gets
      committed or it didn't happen)
- [ ] Trained LoRA adapters + eval results → **versioned
      Kaggle dataset and/or TeraBox**, with a hashed
      manifest (`save_out()` writes the manifest; the
      notebook prints the exact Output-panel steps)
- [ ] Session record + smoke results + logs → the
      rendezvous dataset (`sessions/<date>/`) when the
      HF secret is set, else downloaded from the Output
      panel into the warehouse
- [ ] Chat/app config notes → this repo (a line in the
      session record counts)
- [ ] Rendezvous marked **closed**, so the app stops
      offering a dead seat

**Budget ledger, honestly:**
- ~30 Kaggle GPU hours/week, total, for the account.
- The **show pipeline has priority**. This seat yields:
  if show work needs the hours or the slots, test
  drives wait. A single test drive (boot + chat +
  save) costs well under an hour; a 14B training run
  is the expensive item and should be scheduled like
  show work, not squeezed in.
- At most **2 GPU sessions at once** (Kaggle's cap) —
  one show run + one test drive is the realistic max.
- A session lives **≤ ~12 hours**; anything not saved
  out by then is gone. That's not fine print, it's the
  design constraint the save checklist exists for.

**Portability statement.** The free rotation is the
product on a borrowed seat, not a throwaway demo. The
**same** weights, server config, app, Wielder seat and
training kit move unchanged to a serverless or rented
seat later. What changes per seat, precisely:
- the **endpoint address**, and how the app learns it
  (rendezvous on free seats; a fixed URL typed once for
  serverless/rented; nothing at all for the phone seat).
What never changes: the model weights and their hashes,
the served name `grok-local`, the launch flags, the
smoke test, the app, the training data and configs.

---

## Honest limits vs real Grok

- **Size.** These are 14B–30B-class open models. Real
  Grok is a frontier system, far larger. Expect strong
  chat and tool use, not frontier reasoning.
- **No built-in live X/web search.** The seat has no
  live feed. When **Wielder** drives the seat, search
  arrives through Wielder's own tools (that's the
  search-then-answer pattern the tune teaches). The
  phone app chat is the model alone — it will tell you
  it can't check live things, because the profile
  forbids faking it.
- **Context.** Served context is 32K (primary) / 16K
  (free seat) / 8K (fallback) — plenty for chat and
  agent turns, less than Grok's window.
- **The abliterated option** removes refusals —
  including safety refusals. That's exactly what the
  owner asked to have available; it's the owner's
  responsibility how it's used, and the base (non-
  abliterated) quant stays the default everywhere.
- **Free seats are temporary** and tunnels can't
  stream. Owned seats don't have those limits.
- **The xAI API seat also still exists** in Wielder
  (PR #52's kit) for the day a key is worth it — the
  seats are alternatives behind one interface, not a
  bet on one provider.
