"""Seat pools — the API seat layer (parity round 2, Addenda 2/3/5/6).

Two DISTINCT pool kinds, always reported as separate sections:

1. PERSONAL POOL — the owner's own free-tier API keys, pooled across
   his own accounts per provider. Providers whose terms frame the free
   tier per person / per organization / per project (no genuine
   multi-account allowance found at source) are POOL-RISK: the pool is
   wired, but ONLY the primary key is active unless the environment
   sets WIELDER_POOL_RISK_ACCEPT=1 (the owner's explicit call).
   POOL-OK is reserved for providers whose terms genuinely allow one
   person to hold multiple accounts/keys — none of the swept providers
   qualified on 2026-10-28 (see research/seat-shortlist.md).

2. COMPANY POOL — an organization pool for ACTUAL DIFFERENT EMPLOYEES:
   real distinct people, each with their own provider account and their
   own key. Members are enrolled with (member id, display name,
   provider, key ENV VAR NAME). The store never holds a key value.
   A revoked member's seat is never selected again. Every company-pool
   call produces an audit record (member id + key fingerprint +
   provider + outcome). The owner's personal accounts are NOT company
   members: this pool ships EMPTY, as capability only.

Hard rules (owner policy, binding):
- Key VALUES never appear in code, config, logs, status, provenance or
  reports. A key's only identity is a short fingerprint: first 8 hex of
  sha256(key). Keys are read from the environment only (the manager
  injects them from the Secure Vault).
- Seat priority: local Ollama seat first (brain.py owns that order);
  this module serves the free-tier seats and, when a pool is exhausted,
  returns a typed FALLBACK_TO_LOCAL result instead of raising — the
  caller falls back to the local seat. Caps are respected: one pass
  over the pool per call, no retry storms.
- Paid tiers are never wired as a dependency here; they exist only as
  owner-choice fallback lines in the shortlist.
- One person represented as multiple people is out of scope, absolute:
  no personas, no shells. Company members are real people only.

Env var naming follows brain.py's existing pattern: brain.py reads
OPENROUTER_API_KEY / GROQ_API_KEY / GEMINI_API_KEY (bare provider
names). Pool siblings append _2, _3, ... New providers follow the same
bare pattern (MISTRAL_API_KEY, CLOUDFLARE_API_KEY). The WIELDER_-
prefixed spelling of every name is also accepted as an alias.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

POOL_RISK_ACCEPT_ENV = "WIELDER_POOL_RISK_ACCEPT"
DEFAULT_COOLDOWN_SECONDS = 60.0

# ---------------------------------------------------------------------------
# Provider registry (swept 2026-10-28; caps verified at provider pages —
# full evidence in ~/workspace/wielder-parity2/research/seat-shortlist.md)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Provider:
    id: str                 # seatpool provider id
    seat: str               # brain.py seat name
    bucket: str
    key_env: str            # primary env var (brain.py-aligned)
    caps: str               # short caps summary for seat_status
    pool_ok: bool           # True only if terms genuinely allow multi-account
    pool_note: str          # the terms line that decides pool_ok
    kind: str = "openai"    # "openai" | "gemini" (header style)
    base_url: str = ""
    default_model: str = ""
    model_env: str = ""
    extra_env: tuple = ()   # e.g. Cloudflare needs an account id (not a key)

PROVIDERS: dict[str, Provider] = {p.id: p for p in [
    Provider(
        id="openrouter", seat="openrouter-free", bucket="free proprietary",
        key_env="OPENROUTER_API_KEY",
        caps="free models (:free): 20 req/min, 50 req/day (1,000/day after a one-time $10 lifetime credit purchase); failed attempts count",
        pool_ok=False,
        pool_note="Caps are per account; terms found silent on multiple accounts — free tier is per-account framed, so POOL-RISK per brief rule.",
        base_url="https://openrouter.ai/api/v1/chat/completions",
        default_model="meta-llama/llama-3.3-70b-instruct:free",
        model_env="WIELDER_OPENROUTER_MODEL"),
    Provider(
        id="groq", seat="groq-free", bucket="free proprietary",
        key_env="GROQ_API_KEY",
        caps="Free plan, per model: gpt-oss-120b/20b & qwen3.8-27b 30 RPM, 1,000 RPD, 8K TPM, 200K TPD; whisper 20 RPM, 2,000 RPD",
        pool_ok=False,
        pool_note="Groq docs: 'Rate limits apply at the organization level, not individual users' — extra keys in one org share one cap; separate orgs are per-person framing, so POOL-RISK.",
        base_url="https://api.groq.com/openai/v1/chat/completions",
        default_model="llama-3.3-70b-versatile",
        model_env="WIELDER_GROQ_MODEL"),
    Provider(
        id="gemini", seat="gemini-free", bucket="free proprietary",
        key_env="GEMINI_API_KEY",
        caps="Free tier: Flash/Flash-Lite models free of charge; exact RPM/TPM/RPD are per-project and shown only in AI Studio (not published centrally); RPD resets midnight Pacific; free-tier content may be used to improve Google products",
        pool_ok=False,
        pool_note="Google docs: 'Rate limits are applied per project, not per API key' — extra keys in one project share one cap; separate projects/accounts are per-person framing, so POOL-RISK.",
        kind="gemini",
        base_url="https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        default_model="gemini-2.0-flash",
        model_env="WIELDER_GEMINI_MODEL"),
    Provider(
        id="mistral", seat="mistral-free", bucket="free proprietary",
        key_env="MISTRAL_API_KEY",
        caps="La Plateforme 'Experiment' free plan: ~1 req/sec, ~500K TPM, ~1B tokens/month per model, all API models; phone verification, no card; free-tier requests may be used for training; exact limits now shown per-workspace in console",
        pool_ok=False,
        pool_note="Experiment plan is per workspace/account and phone-verified per person; no multi-account allowance found, so POOL-RISK.",
        base_url="https://api.mistral.ai/v1/chat/completions",
        default_model="mistral-small-latest",
        model_env="WIELDER_MISTRAL_MODEL"),
    Provider(
        id="cloudflare", seat="cloudflare-free", bucket="free proprietary",
        key_env="CLOUDFLARE_API_KEY",
        caps="Workers AI: 10,000 Neurons/day free per account, resets 00:00 UTC; needs CLOUDFLARE_ACCOUNT_ID alongside the token",
        pool_ok=False,
        pool_note="Free allocation is per Cloudflare account; terms found silent on multiple accounts — per-account framing, so POOL-RISK.",
        base_url="https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions",
        default_model="@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        model_env="WIELDER_CLOUDFLARE_MODEL",
        extra_env=("CLOUDFLARE_ACCOUNT_ID",)),
]}

# Dropped candidates are NOT in the registry (no seat is wired for them):
# cerebras (no permanent free tier — $5 trial only, 30 days, payment
# method required), github-models (service fully retired 2026-07-30),
# huggingface (free-account Inference Providers monthly credits ended —
# listed as 'None' since 2026-10-07; paid credits or PRO required).


def fingerprint(key: str) -> str:
    """A key's only public identity: first 8 hex of its sha256."""
    return hashlib.sha256(key.encode()).hexdigest()[:8]


# ---------------------------------------------------------------------------
# Personal pool
# ---------------------------------------------------------------------------

@dataclass
class PoolKey:
    provider: str
    env_name: str           # env var the value came from (never the value in logs beyond this)
    value: str              # in-memory only; never serialised by this module
    index: int              # 0 = primary
    cooldown_until: float = 0.0

    @property
    def fp(self) -> str:
        return fingerprint(self.value)

    def describe(self) -> dict:
        return {"env": self.env_name, "fingerprint": self.fp, "index": self.index,
                "cooling_down": self.cooldown_until > time.time()}


def _candidate_env_names(provider: Provider) -> list[str]:
    """Primary + _2.._9 siblings, in both brain.py's bare spelling and
    the WIELDER_-prefixed spelling."""
    names: list[str] = []
    for base in (provider.key_env, f"WIELDER_{provider.key_env}"):
        names.append(base)
        names.extend(f"{base}_{i}" for i in range(2, 10))
    return names


def load_personal_pool(provider_id: str, environ: dict | None = None) -> list[PoolKey]:
    """Load a provider's personal pool from the environment only.
    Deduplicates identical values (same key under two spellings counts once)."""
    env = os.environ if environ is None else environ
    prov = PROVIDERS[provider_id]
    out: list[PoolKey] = []
    seen: set[str] = set()
    for name in _candidate_env_names(prov):
        val = env.get(name)
        if val and val not in seen:
            seen.add(val)
            out.append(PoolKey(provider=provider_id, env_name=name, value=val, index=len(out)))
    return out


def pool_risk_accepted(environ: dict | None = None) -> bool:
    env = os.environ if environ is None else environ
    return env.get(POOL_RISK_ACCEPT_ENV) == "1"


def active_keys(provider_id: str, environ: dict | None = None) -> list[PoolKey]:
    """Keys the router may use right now. POOL-RISK providers: primary
    only, unless WIELDER_POOL_RISK_ACCEPT=1."""
    keys = load_personal_pool(provider_id, environ)
    prov = PROVIDERS[provider_id]
    if not prov.pool_ok and not pool_risk_accepted(environ):
        return keys[:1]
    return keys


# ---------------------------------------------------------------------------
# Call result + failover wrapper
# ---------------------------------------------------------------------------

@dataclass
class SeatResult:
    ok: bool
    provider: str
    text: str = ""
    detail: str = ""
    fingerprint: str | None = None     # key/member key that served, fingerprint only
    member_id: str | None = None       # company pool only
    fallback_to_local: bool = False    # True => caller must use the local seat
    attempts: list = field(default_factory=list)  # fingerprint-only attempt trail


class CapError(Exception):
    """Provider cap / rate-limit error (HTTP 429 or a cap-coded body)."""
    def __init__(self, status: int = 429, message: str = "rate limited"):
        super().__init__(message)
        self.status = status


def _is_cap_error(exc: Exception) -> bool:
    if isinstance(exc, CapError):
        return True
    code = getattr(exc, "code", None)  # urllib.error.HTTPError
    if code == 429:
        return True
    msg = str(exc).lower()
    return any(s in msg for s in ("429", "resource_exhausted", "rate_limit",
                                  "rate limit", "quota exceeded", "too many requests"))


def _default_transport(provider: Provider, key: str, prompt: str,
                       system: str, model: str, timeout: int) -> str:
    """One real HTTP call (stdlib urllib only, matching brain.py)."""
    if provider.kind == "gemini":
        url = provider.base_url.format(model=model)
        body = {"system_instruction": {"parts": [{"text": system}]},
                "contents": [{"parts": [{"text": prompt}]}]}
        headers = {"x-goog-api-key": key}
    else:
        url = provider.base_url
        if provider.id == "cloudflare":
            account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
            url = url.format(account_id=account)
        body = {"model": model,
                "messages": [{"role": "system", "content": system},
                             {"role": "user", "content": prompt}]}
        headers = {"Authorization": f"Bearer {key}"}
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        if e.code == 429:
            raise CapError(429, "provider returned HTTP 429") from e
        raise
    if provider.kind == "gemini":
        cands = data.get("candidates") or []
        parts = ((cands[0].get("content") or {}).get("parts") if cands else []) or []
        return "".join(p.get("text", "") for p in parts)
    return ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "")


def _run_over_keys(provider_id: str, keys: list[PoolKey], prompt: str, *,
                   transport=None, system: str = "", timeout: int = 30,
                   cooldown_seconds: float = DEFAULT_COOLDOWN_SECONDS,
                   member_ids: list[str | None] | None = None) -> SeatResult:
    """One pass over `keys`, in order. Cap error => cool that key down
    and try the next. Pool exhausted => typed FALLBACK_TO_LOCAL result.
    Non-cap errors are returned, not retried across the pool."""
    prov = PROVIDERS[provider_id]
    call = transport or _default_transport
    attempts: list[dict] = []
    now = time.time()
    for i, pk in enumerate(keys):
        member_id = member_ids[i] if member_ids else None
        if pk.cooldown_until > now:
            attempts.append({"fingerprint": pk.fp, "member_id": member_id,
                             "outcome": "skipped-cooldown"})
            continue
        model = os.environ.get(prov.model_env) or prov.default_model
        try:
            text = call(prov, pk.value, prompt, system, model, timeout)
        except Exception as e:  # noqa: BLE001 — classified below
            if _is_cap_error(e):
                pk.cooldown_until = time.time() + cooldown_seconds
                attempts.append({"fingerprint": pk.fp, "member_id": member_id,
                                 "outcome": "cap-429-cooling-down"})
                continue
            attempts.append({"fingerprint": pk.fp, "member_id": member_id,
                             "outcome": f"error-{type(e).__name__}"})
            return SeatResult(ok=False, provider=provider_id,
                              detail=f"seat call failed — {type(e).__name__}",
                              fingerprint=pk.fp, member_id=member_id, attempts=attempts)
        if not text:
            attempts.append({"fingerprint": pk.fp, "member_id": member_id,
                             "outcome": "empty-response"})
            continue
        attempts.append({"fingerprint": pk.fp, "member_id": member_id, "outcome": "ok"})
        return SeatResult(ok=True, provider=provider_id, text=text,
                          detail=f"model {model}", fingerprint=pk.fp,
                          member_id=member_id, attempts=attempts)
    return SeatResult(ok=False, provider=provider_id, fallback_to_local=True,
                      detail="pool exhausted — fall back to the local seat",
                      attempts=attempts)


def call_personal(provider_id: str, prompt: str, *, environ: dict | None = None,
                  transport=None, system: str = "", timeout: int = 30,
                  cooldown_seconds: float = DEFAULT_COOLDOWN_SECONDS,
                  _pool_cache: dict | None = None) -> SeatResult:
    """Call a provider through the PERSONAL pool with cap failover.
    Cooldown state lives on the PoolKey objects; pass _pool_cache (a
    dict kept by the caller) to preserve cooldowns across calls."""
    cache = _pool_cache if _pool_cache is not None else {}
    if provider_id not in cache:
        cache[provider_id] = active_keys(provider_id, environ)
    keys = cache[provider_id]
    if not keys:
        return SeatResult(ok=False, provider=provider_id, fallback_to_local=True,
                          detail=f"NOT CONFIGURED — no {PROVIDERS[provider_id].key_env} held; seat not wired")
    return _run_over_keys(provider_id, keys, prompt, transport=transport,
                          system=system, timeout=timeout,
                          cooldown_seconds=cooldown_seconds)


# ---------------------------------------------------------------------------
# Company pool — real distinct employees only; ships EMPTY
# ---------------------------------------------------------------------------

def company_store_path() -> Path:
    """JSON member store, following the package pattern (constitution.DATA
    + a read/write JSON file, cf. circles.py stall-watch.json). Path is
    overridable via WIELDER_COMPANY_POOL_FILE for tests/ops."""
    override = os.environ.get("WIELDER_COMPANY_POOL_FILE")
    if override:
        return Path(override)
    from . import constitution as _C
    return _C.DATA / "company-pool.json"


@dataclass
class Member:
    member_id: str
    display_name: str
    provider: str
    key_env: str            # ENV VAR NAME only — never a key value
    status: str = "active"  # "active" | "revoked"
    enrolled_at: str = ""

    def to_dict(self) -> dict:
        return {"member_id": self.member_id, "display_name": self.display_name,
                "provider": self.provider, "key_env": self.key_env,
                "status": self.status, "enrolled_at": self.enrolled_at}


class CompanyPool:
    """Member registry + routing + audit for the company pool.

    Invariants:
    - The store holds member id / display name / provider / key ENV VAR
      NAME / status — never a key value.
    - A revoked member's seat is never selected again.
    - Every routed call appends an audit record: member id, key
      fingerprint (first-8 sha256), provider, outcome, timestamp.
    - Ships empty: no members exist until real employees enrol.
    """

    def __init__(self, store_path: Path | None = None, environ: dict | None = None):
        self._path = Path(store_path) if store_path else company_store_path()
        self._environ = environ  # None => read os.environ at call time
        self._members: list[Member] = []
        self._cooldowns: dict[str, float] = {}  # member_id -> cooldown_until
        self.audit: list[dict] = []
        self.load()

    # -- store -------------------------------------------------------------
    def load(self) -> None:
        if self._path.exists():
            data = json.loads(self._path.read_text())
            self._members = [Member(**m) for m in data.get("members", [])]
        else:
            self._members = []

    def save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(
            {"members": [m.to_dict() for m in self._members]}, indent=1))

    # -- enrolment / revocation ---------------------------------------------
    def enrol(self, member_id: str, display_name: str, provider: str,
              key_env: str) -> Member:
        if provider not in PROVIDERS:
            raise ValueError(f"unknown provider {provider!r}")
        if any(m.member_id == member_id and m.provider == provider
               and m.status == "active" for m in self._members):
            raise ValueError(f"member {member_id!r} already actively enrolled for {provider}")
        member = Member(member_id=member_id, display_name=display_name,
                        provider=provider, key_env=key_env, status="active",
                        enrolled_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        self._members.append(member)
        self.save()
        return member

    def revoke(self, member_id: str, provider: str | None = None) -> int:
        n = 0
        for m in self._members:
            if m.member_id == member_id and (provider is None or m.provider == provider):
                if m.status != "revoked":
                    m.status = "revoked"
                    n += 1
        if n:
            self.save()
        return n

    def members(self, provider: str | None = None, active_only: bool = False) -> list[Member]:
        out = self._members
        if provider is not None:
            out = [m for m in out if m.provider == provider]
        if active_only:
            out = [m for m in out if m.status == "active"]
        return list(out)

    # -- routing -------------------------------------------------------------
    def _env(self) -> dict:
        return os.environ if self._environ is None else self._environ

    def _member_keys(self, provider: str) -> tuple[list[PoolKey], list[str]]:
        keys: list[PoolKey] = []
        ids: list[str] = []
        env = self._env()
        for m in self.members(provider, active_only=True):
            val = env.get(m.key_env) or env.get(f"WIELDER_{m.key_env}")
            if not val:
                continue  # member enrolled but their key is not vault-injected right now
            pk = PoolKey(provider=provider, env_name=m.key_env, value=val,
                         index=len(keys),
                         cooldown_until=self._cooldowns.get(m.member_id, 0.0))
            keys.append(pk)
            ids.append(m.member_id)
        return keys, ids

    def call(self, provider_id: str, prompt: str, *, transport=None,
             system: str = "", timeout: int = 30,
             cooldown_seconds: float = DEFAULT_COOLDOWN_SECONDS) -> SeatResult:
        keys, ids = self._member_keys(provider_id)
        if not keys:
            result = SeatResult(ok=False, provider=provider_id, fallback_to_local=True,
                                detail="company pool empty for this provider — fall back to the local seat")
            self._audit(provider_id, None, None, "no-active-member-seats")
            return result
        result = _run_over_keys(provider_id, keys, prompt, transport=transport,
                                system=system, timeout=timeout,
                                cooldown_seconds=cooldown_seconds, member_ids=ids)
        for pk, mid in zip(keys, ids):
            if pk.cooldown_until:
                self._cooldowns[mid] = pk.cooldown_until
        for a in result.attempts:
            self._audit(provider_id, a.get("member_id"), a.get("fingerprint"),
                        a.get("outcome", ""))
        return result

    def _audit(self, provider: str, member_id: str | None,
               fp: str | None, outcome: str) -> dict:
        rec = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "pool": "company", "provider": provider,
               "member_id": member_id, "key_fingerprint": fp, "outcome": outcome}
        self.audit.append(rec)
        return rec


# ---------------------------------------------------------------------------
# Status — personal and company sections, always separate
# ---------------------------------------------------------------------------

def personal_status(environ: dict | None = None) -> list[dict]:
    env = os.environ if environ is None else environ
    out = []
    for prov in PROVIDERS.values():
        keys = load_personal_pool(prov.id, env)
        active = active_keys(prov.id, env)
        entry = {
            "provider": prov.id, "seat": prov.seat, "bucket": prov.bucket,
            "caps": prov.caps, "keys_held": len(keys),
            "keys_active": len(active),
            "pool_flag": "POOL-OK" if prov.pool_ok else "POOL-RISK",
            "pool_note": prov.pool_note,
            "active_key_fingerprint": active[0].fp if active else None,
            "keys": [k.describe() for k in keys],
        }
        if not prov.pool_ok and len(keys) > 1 and not pool_risk_accepted(env):
            entry["pool_flag"] = "POOL-RISK: primary key only"
            entry["detail"] = (f"{len(keys)} keys held, primary only until "
                               f"{POOL_RISK_ACCEPT_ENV}=1 (owner's call)")
        elif not keys:
            entry["detail"] = f"no {prov.key_env} held — key not held"
        else:
            entry["detail"] = f"{len(keys)} key(s) held"
        out.append(entry)
    return out


def company_status(pool: CompanyPool | None = None) -> dict:
    pool = pool or CompanyPool()
    members = pool.members()
    return {
        "pool": "company",
        "members_total": len(members),
        "members_active": len([m for m in members if m.status == "active"]),
        "members": [m.to_dict() for m in members],
        "note": ("Company pool = real distinct employees, each with their own "
                 "provider account and key (env var name only stored). Ships "
                 "empty; the owner's personal accounts are not members."),
    }


def seat_status(environ: dict | None = None,
                company_pool: CompanyPool | None = None) -> dict:
    """Extension data for brain.seat_status(): two separate sections."""
    return {"personal_pool": personal_status(environ),
            "company_pool": company_status(company_pool)}
