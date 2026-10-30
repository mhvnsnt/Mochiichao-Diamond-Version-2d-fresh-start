# grok-local — your own Grok-pattern seat, owned end to end

A self-hosted, open-weights alternative to the paid xAI API,
targeting the same profile as the `grok/` kit (direct answers,
tool calling, no fake live access) — built from Apache-2.0 models,
served by your own stack, and driven from your own phone app.
Nothing here needs an xAI key, and nothing here is rented:
**build everything first — rent only when the owner says**
(owner ruling, 2026-10-28).

## The seat ladder (owned first)

| # | Seat | Yours how | Cost |
|---|------|-----------|------|
| 1 | **Phone seat** — a model running on your phone's own chip, inside the app | owned hardware, owned app | $0 |
| 2 | **Your computers** — the kit's models on machines you own (the fabless-stack lane's llama.cpp seat is the sibling piece for this) | owned hardware | $0 |
| 3 | **A bought card**, if you ever choose one — `serving/deploy.sh` on your own 24 GB card | owned hardware | card only |
| 4 | **Free test drives** — Kaggle free sessions: free fuel for training and trying the big seats | borrowed engine, your stack | $0 |
| 5 | **Serverless GPU** — pay per second of use, $0 idle (RunPod Serverless verified) | rented by the second | per use |
| 6 | **Hourly 4090** — always-on while up | rented by the hour | $0.34–0.89/hr |

Free tiers are fuel, never the product's home: **if every free
tier vanished tomorrow, everything owned still stands** — the
weights and adapters live in your warehouse (GitHub / TeraBox),
the stack and app are in this repo, and the owned seats run
without asking anyone.

## What's in the kit

- `MODEL-MANIFEST.md` — every model, verified at source: repo
  ids, exact sizes, pinned hashes, licences.
- `serving/` — the vLLM serving kit: hash-verified weight pull
  (on the seat, never to your machine), launch config per
  variant, one-command `deploy.sh`, AWQ quantization for the
  abliterated weights, smoke test, Docker twins.
- `training/` — the "train them well" kit: openly licensed data
  only (never xAI/Grok output), converters, pattern seeds, and
  LLaMA-Factory QLoRA configs for the 24 GB card and the free T4.
- `pwa/` — the phone app: one static site, two modes (phone seat
  on-device; server seat via any endpoint), rendezvous seat
  discovery, hosting steps in `pwa/HOSTING.md`.
- `free-test/` — the ready-to-run Kaggle test-drive notebook
  (kernel + metadata): Run All boots the big seat on a free T4,
  smoke-tests it, tunnels it, and publishes its address.
- `DEPLOY-RUNBOOK.md` — the owner-facing runbook: seat ladder,
  phone seat section, free routes verdicts, operating model
  (session rotation, budget ledger, portability), the Virtual
  Seat, the sharding verdict, and honest limits vs real Grok.
- `../wielder/local_client.py` + `brain.py` — Wielder's
  `grok-local` seat: same interface shape as the xAI seat,
  configured by env var (`GROK_LOCAL_BASE_URL`, optional
  `GROK_LOCAL_API_KEY`, `WIELDER_LOCAL_MODEL`).

## Status (verify-then-state)

- Wielder seat: code + 16 mocked-transport tests, all passing
  (33/33 with the xAI seat's tests) — `validation/wielder-tests.txt`.
- PWA logic: 30 checks against a live local mock endpoint,
  including streaming, a tool-call round, the rendezvous read
  path, and the phone-seat engine against a stubbed WebLLM —
  `validation/pwa-mock-test.txt`.
- Free-test notebook: structure-checked and executed end-to-end
  in dry-run mode against the mock seat (health, real smoke,
  rendezvous write, `save_out()`), with the app's own parser
  verifying the rendezvous file — `validation/kernel-dry-run.txt`.
- Deploy script: syntax/config/path validated —
  `validation/deploy-dry-run.txt`.
- Everything that needs a real GPU or a real phone is marked
  **PROVEN-ON-FIRST-RUN** in the runbook with the exact check
  that proves it. Nothing is deployed and nothing is rented.
