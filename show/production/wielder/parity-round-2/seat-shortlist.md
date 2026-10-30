# API Seat Shortlist — Wielder parity round 2 (Addenda 2/3/5/6)

Verified 2026-10-28 against each provider's own pages (URLs below).
Bucket for every kept seat: **free proprietary** (never open source).
Seat priority (owner rule): (1) local Ollama seat, (2) free tiers on the
owner's own accounts, (3) paid tiers ONLY as owner-choice fallback lines
— never wired, never the recommendation (Addendum 6). Key values are
never recorded here: seats are "key held / not held" only, and keys are
created in a browser session and deposited via the Secure Vault flow
(each provider shows the full key once at creation).

## Two pool kinds (Addendum 5)

- **PERSONAL POOL** — the owner's own accounts/keys. POOL-OK only when a
  provider's terms genuinely allow one person multiple accounts; every
  swept provider framed its free tier per account / per organization /
  per project with no multi-account allowance found, so **every kept
  provider is POOL-RISK**: pool wired, primary key only by default,
  `WIELDER_POOL_RISK_ACCEPT=1` is the owner's call to flip, flag visible
  in seat status. One person represented as multiple people (personas /
  shells) is declined and not built, ever.
- **COMPANY POOL** — real distinct employees, each with their own
  provider account and key, pooled at org level. Ships EMPTY in
  `wielder/seatpool.py` (enrol/revoke, routing, per-member audit).
  Per provider below, the natural home for a company pool is the
  provider's real organization/team feature, used as what it actually
  is — noted as "Company-pool home".

---

## KEPT

### OpenRouter
- **Bucket:** free proprietary
- **Free terms + caps (verified 2026-10-28, https://openrouter.ai/pricing):**
  Free plan: 25+ free models (`:free` variants) from 4 free providers;
  free models capped at **20 requests/min and 50 requests/day**, rising
  to **1,000/day once the account has bought at least $10 of credits
  (lifetime)**; failed attempts count toward the daily cap; a negative
  balance blocks free models. No card needed for the free plan.
- **Signup route:** email / Google / GitHub at openrouter.ai.
- **Key depositable from browser?** Yes — API key created in Settings →
  API Keys, shown at creation, copyable into the Vault flow.
- **POOL verdict: POOL-RISK** — caps are per account; terms found silent
  on one person holding multiple accounts, and the free tier is
  per-account framed. Deciding line: pricing FAQ states the daily cap
  per account ("once your account has bought at least $10 of credits").
- **Company-pool home:** Workspaces (5 on Free) + organizations — real
  teams share a workspace with per-key credit caps.
- **Owner-choice paid fallback (not a recommendation):** buying $10 of
  credits once lifts the free-model cap 50 → 1,000 req/day and the
  credits remain spendable on paid models; it adds daily volume only —
  local + free already cover the capability, just at 50 req/day.

### Groq
- **Bucket:** free proprietary
- **Free terms + caps (verified 2026-10-28, https://console.groq.com/docs/rate-limits):**
  Free plan, per model: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`,
  `qwen/qwen3.8-27b` — **30 RPM, 1,000 RPD, 8K TPM, 200K TPD**;
  `whisper-large-v3(-turbo)` — 20 RPM, 2,000 RPD. No card required.
  Exact limits per organization shown on the console Limits page.
- **Signup route:** email, or Continue with Google/GitHub, at console.groq.com.
- **Key depositable from browser?** Yes — created at console.groq.com/keys,
  full key shown once at creation.
- **POOL verdict: POOL-RISK** — deciding line, Groq's own docs: **"Rate
  limits apply at the organization level, not individual users."** Extra
  keys in one organization share one cap; separate organizations are
  per-person framing.
- **Company-pool home:** a real Groq **organization** with real members —
  the org-level cap is shared by design, which is exactly what the
  company pool's audit/routing models.
- **Owner-choice paid fallback (not a recommendation):** Developer plan
  (add a payment method, pay-as-you-go token pricing from
  $0.075/$0.30 per M tokens on gpt-oss-20b) raises limits ~10x. Adds
  headroom only; no capability the free/local setup lacks.

### Google AI Studio — Gemini API
- **Bucket:** free proprietary
- **Free terms + caps (verified 2026-10-28, https://ai.google.dev/gemini-api/docs/rate-limits
  and the Gemini API pricing page):** Free tier exists with an active
  project, no billing required: Flash and Flash-Lite models (Gemini 3.x
  Flash family, 3.5/3.1 Flash-Lite, Gemini Embedding, Gemma 4) are free
  of charge. **Google no longer publishes the per-model free RPM/TPM/RPD
  centrally** — limits are per project and visible only in AI Studio's
  rate-limit page; RPD resets at midnight Pacific. Free-tier content
  may be used to improve Google's products (paid tier: not used).
- **Signup route:** Google account sign-in at aistudio.google.com.
- **Key depositable from browser?** Yes — "Get API key" in AI Studio,
  key shown at creation, depositable via the Vault flow.
- **POOL verdict: POOL-RISK** — deciding line, Google's own docs:
  **"Rate limits are applied per project, not per API key."** Extra keys
  in one project share one cap.
- **Company-pool home:** a real Google Cloud **organization/project**
  structure with real members — per-project quotas are the provider's
  own team mechanism.
- **Owner-choice paid fallback (not a recommendation):** Tier 1 (link a
  billing account; $250/mo spend cap; per-token pricing from
  $0.25/$1.50 per M tokens on Flash-Lite class models) raises quotas and
  stops free-tier data use for training. Adds quota + data terms only.

### Mistral — La Plateforme (Experiment plan)
- **Bucket:** free proprietary
- **Free terms + caps (verified 2026-10-28, https://mistral.ai pricing /
  La Plateforme):** Free **Experiment** plan: access to all API models
  (Mistral Large, Small, Codestral, embeddings, OCR), roughly
  **1 req/sec, ~500K TPM, ~1B tokens/month per model**; requires a
  verified phone number, no credit card. Mistral no longer publishes
  exact free numbers publicly — exact limits are shown per workspace in
  the Admin Console. Free-tier requests may be used to help train
  future models; the plan is for evaluation, not production.
- **Signup route:** email signup at console.mistral.ai + SMS phone verification.
- **Key depositable from browser?** Yes — API key created in La
  Plateforme console, shown at creation.
- **POOL verdict: POOL-RISK** — the Experiment plan is per
  workspace/account and gated by per-person phone verification; no
  multi-account allowance found in terms.
- **Company-pool home:** a real Mistral **workspace** / Team plan
  workspace with real members.
- **Owner-choice paid fallback (not a recommendation):** pay-as-you-go
  API billing (per-token, from $0.10/$0.10 per M tokens on Ministral 3)
  removes the Experiment caps and the training-use term. Adds volume +
  data terms only.

### Cloudflare Workers AI
- **Bucket:** free proprietary
- **Free terms + caps (verified 2026-10-28,
  https://developers.cloudflare.com/workers-ai/platform/pricing/):**
  Workers AI is included in the Workers Free plan: **10,000 Neurons/day
  free per account**, resetting 00:00 UTC; per-model Neuron rates are
  published (e.g. Llama 3.3 70B fp8-fast: 26,668 Neurons per M input
  tokens / 204,805 per M output). Beyond the free allocation requires
  Workers Paid. Calls need an API token **plus** the account ID.
- **Signup route:** email / Google / GitHub / Apple at dash.cloudflare.com.
- **Key depositable from browser?** Yes — API token created in the
  dashboard (My Profile → API Tokens / Workers AI token), shown once at
  creation; the account ID is visible in the dashboard (not a secret).
- **POOL verdict: POOL-RISK** — deciding line: the free allocation is
  stated per account ("10,000 Neurons per day" on the account's plan);
  terms found silent on multiple accounts — per-account framing.
- **Company-pool home:** a real Cloudflare **account with members/roles**
  — account-level allocation shared by real team members by design.
- **Owner-choice paid fallback (not a recommendation):** Workers Paid
  ($5/mo minimum) bills $0.011 per 1,000 Neurons beyond the free 10,000
  /day. Adds volume only; the free allocation already covers advisory
  seat volume.

---

## DROPPED (no real free tier — evidence, 2026-10-28)

### Cerebras — DROPPED
No permanent free tier. Cerebras's own FAQ answers "Is there a
permanently free tier?" with no: new accounts get **$5 in trial credits
only after adding a verified payment method, expiring 30 days** after
grant (trial limits: 5 RPM, 1M tokens/day on gpt-oss-120b /
qwen-3.8-27b). A one-time, card-gated trial is not a free-tier seat.
Revisit only if Cerebras launches a real recurring free tier, or as an
owner-choice paid seat.

### GitHub Models — DROPPED
Service **fully retired on 2026-07-30** (GitHub's own docs): playground,
model catalog, inference API and BYOK all removed. There is no key to
create. GitHub points users to Azure AI Foundry / Copilot instead.

### Hugging Face Inference Providers — DROPPED (as a free seat)
The free-account monthly Inference Providers credit has ended: HF's
pricing table lists free users' monthly credits as **"None" since
2026-10-07**; free users must purchase credits or upgrade to PRO
($9/mo, includes $2.00 credits) to route calls. $0.10/mo was the earlier
figure and no longer applies. A token can still be created in the
browser, but there is no free allowance behind it, so no seat is wired.
Revisit if a recurring free credit returns.
