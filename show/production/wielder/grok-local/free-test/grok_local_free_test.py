# %% [markdown]
# # grok-local — FREE TEST DRIVE (Kaggle, $0)
#
# This is a test drive of YOUR OWN stack — the same weights, server
# config and app that run on the seats you own (your phone's GPU in
# the app's mode B; your own computers via the kit's llama.cpp
# seat). Kaggle here is just free fuel: a borrowed engine for an
# afternoon, never the product's home. If every free tier vanished
# tomorrow, everything in the kit still stands and runs on owned
# seats — the weights and adapters live in your warehouse
# (GitHub / TeraBox), not in any session.
#
# One Run All boots your Grok-pattern seat on a free Kaggle GPU:
# install -> pull the model weights (hash-checked, here in the
# session) -> serve with vLLM -> smoke test (one chat + one tool
# call) -> open a Cloudflare quick tunnel -> print the live
# endpoint URL -> publish the address to the rendezvous (if set up)
# so the phone app finds this seat by itself.
#
# THE HONEST LIMITS — read before running:
# - A Kaggle session lives at most ~12 hours and the endpoint DIES
#   when the session ends. This is a test/training seat, not an
#   always-on server. Nothing here rents or charges anything.
# - The account gets ~30 GPU hours per week, SHARED with the
#   Mochiichao show pipeline. Show work has priority — this seat
#   yields. Kaggle allows at most 2 GPU sessions at once, so this
#   notebook queues behind running show work.
# - Kaggle gives 2x T4 16 GB but they are NOT one pooled card for
#   serving. This notebook serves on ONE T4, with the model that
#   fits one card: Qwen3-14B-AWQ (~10 GB). The bigger seats
#   (30B AWQ) need a 24 GB card — see the runbook's other routes.
# - The quick tunnel cannot stream replies (no SSE); the PWA
#   falls back to whole answers automatically. The tunnel URL is
#   new every session — that is what the rendezvous is for.
# - Session key: a fresh API key is minted below each run and
#   printed once. Anyone holding it can use the seat until the
#   session ends.
#
# RENDEZVOUS (optional, one-time): create a PRIVATE Hugging Face
# dataset (e.g. "grok-local-rendezvous"), make an HF token that can
# write it, and add two Kaggle secrets (Add-ons -> Secrets):
#   HF_TOKEN                     the HF write token
#   GROK_LOCAL_RENDEZVOUS_DATASET  the dataset id (owner/name)
# Without them everything still works — you just copy the printed
# URL into the app by hand. The rendezvous file never holds the key.
#
# END OF SESSION: run the LAST cell (save_out) before closing —
# it packs the session record, smoke results and logs into
# /kaggle/working/outputs and (with the HF secret) uploads them to
# the rendezvous dataset. Details: DEPLOY-RUNBOOK.md, "Operating
# model".

# %%
"""Cell 1 — config, secrets, and the rendezvous writer.

Everything testable lives here as small functions. Setting
GROK_LOCAL_DRY_RUN=1 (done only by the kit's local validation)
skips every GPU/download step and points the smoke test at
GROK_LOCAL_MOCK_BASE instead, so the whole script can execute
end-to-end on a plain CPU machine against a mock endpoint.
"""
import hashlib
import json
import os
import secrets as _secrets
import subprocess
import sys
import time
import urllib.request

DRY_RUN = os.environ.get("GROK_LOCAL_DRY_RUN") == "1"
MOCK_BASE = os.environ.get("GROK_LOCAL_MOCK_BASE", "")
WORK = "/tmp/grok-local-dryrun" if DRY_RUN else "/kaggle/working"
os.makedirs(WORK, exist_ok=True)
MODEL_DIR = os.path.join(WORK, "models", "free-seat")
PORT = 8000
SERVED_NAME = "grok-local"

# Free-seat model, pinned by the kit's manifest
# (grok-local/serving/model_hashes.json — variant "free-seat",
# Qwen/Qwen3-14B-AWQ, Apache-2.0). The two big shards carry the
# sha256 checks below; the small files are size-checked through
# the manifest on the pod route — here the shards are the proof
# that matters (they ARE the weights).
MODEL_REPO = "Qwen/Qwen3-14B-AWQ"
MODEL_SHARDS = {
    "model-00001-of-00002.safetensors": (
        4988339832,
        "668eb0f1cd7b6e07ba9ba4f91b5a3067d40a6a94eb0b0d1d76d40d38f2e0265"),
    "model-00002-of-00002.safetensors": (
        4988350408,
        "c3c1625d0ad6f0c19ee320b028b40b663283700df959db795a2bc22726f2e57d"),
}
MODEL_SMALL_FILES = [
    "config.json", "generation_config.json", "tokenizer.json",
    "tokenizer_config.json", "vocab.json", "merges.txt",
    "model.safetensors.index.json",
]


def get_secret(name):
    """Kaggle secret by name; None anywhere else (or unset)."""
    try:
        from kaggle_secrets import UserSecretsClient
        return UserSecretsClient().get_secret(name)
    except Exception:
        return os.environ.get(name)


HF_TOKEN = get_secret("HF_TOKEN")
RENDEZVOUS_DATASET = get_secret("GROK_LOCAL_RENDEZVOUS_DATASET")


def key_fingerprint(key: str) -> str:
    """FNV-1a 32-bit — identical algorithm to pwa/api.js. A change
    detector for the app ('the seat key changed'), NOT a security
    hash; it never replaces or reveals the key."""
    h = 0x811C9DC5
    for ch in key or "":
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def build_rendezvous(endpoint, key, status="live"):
    return {
        "endpoint": endpoint,
        "model": SERVED_NAME,
        "seat": "kaggle-free-test",
        "status": status,
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ",
                                    time.gmtime()),
        "key_fingerprint": key_fingerprint(key),
    }


def publish_rendezvous(payload):
    """Upload rendezvous.json to the private HF dataset. Returns a
    plain-language outcome line (never raises — a missing token is
    a documented fallback, not a failure)."""
    local = os.path.join(WORK, "rendezvous.json")
    with open(local, "w") as f:
        json.dump(payload, f, indent=2)
    if DRY_RUN:
        return f"[rendezvous] dry-run: wrote {local} (no upload)"
    if not HF_TOKEN or not RENDEZVOUS_DATASET:
        return ("[rendezvous] skipped — no HF_TOKEN / "
                "GROK_LOCAL_RENDEZVOUS_DATASET secret. Manual "
                "fallback: paste the printed URL into the app.")
    try:
        from huggingface_hub import HfApi
        HfApi().upload_file(
            path_or_fileobj=local, path_in_repo="rendezvous.json",
            repo_id=RENDEZVOUS_DATASET, repo_type="dataset",
            token=HF_TOKEN)
        return (f"[rendezvous] published to {RENDEZVOUS_DATASET} — "
                "the app will find this seat on its next open.")
    except Exception as e:  # keep the session alive; say it plainly
        return f"[rendezvous] upload FAILED ({e}) — use manual paste."


print(f"[setup] dry_run={DRY_RUN} work={WORK} "
      f"rendezvous_dataset={RENDEZVOUS_DATASET or '(not set)'}")

# %%
"""Cell 2 — install the serving stack (pinned) + the tunnel tool.

vLLM is Apache-2.0; cloudflared is Apache-2.0. The Quick Tunnel is
free, needs no Cloudflare account and no domain — its limits (URL
changes every run, ~200 in-flight requests, NO SSE streaming) are
stated in the intro cell and the runbook.
"""
if DRY_RUN:
    print("[install] dry-run: skipped (vllm==0.8.5, cloudflared)")
else:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q",
                    "vllm==0.8.5", "huggingface_hub"],
                   check=True)
    if not os.path.exists("/usr/local/bin/cloudflared"):
        url = ("https://github.com/cloudflare/cloudflared/releases/"
               "latest/download/cloudflared-linux-amd64")
        urllib.request.urlretrieve(url, "/usr/local/bin/cloudflared")
        os.chmod("/usr/local/bin/cloudflared", 0o755)
    print("[install] vllm==0.8.5 + cloudflared ready")

# %%
"""Cell 3 — pull the weights HERE (in the session), sha256-checked.

Staging law: weights are never downloaded to the owner's machine;
they land on the seat that serves them. A shard that fails its
hash stops the run — a partially verified model is never served.
"""


def _sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def pull_weights():
    if DRY_RUN:
        print("[pull] dry-run: skipped (mock seat instead)")
        return
    os.makedirs(MODEL_DIR, exist_ok=True)
    base = f"https://huggingface.co/{MODEL_REPO}/resolve/main/"
    for name in MODEL_SMALL_FILES + list(MODEL_SHARDS):
        dest = os.path.join(MODEL_DIR, name)
        if os.path.exists(dest):
            continue
        part = dest + ".part"
        urllib.request.urlretrieve(base + name, part)
        os.rename(part, dest)
        print(f"[pull] {name} ({os.path.getsize(dest)} bytes)")
    for name, (size, sha) in MODEL_SHARDS.items():
        dest = os.path.join(MODEL_DIR, name)
        assert os.path.getsize(dest) == size, f"size mismatch: {name}"
        got = _sha256(dest)
        assert got == sha, f"sha256 mismatch: {name}: {got}"
        print(f"[pull] VERIFIED {name} sha256={sha[:16]}...")
    print("[pull] all shards verified")


pull_weights()

# %%
"""Cell 4 — mint the session key and launch vLLM on ONE T4.

Flags mirror serving/launch.sh's free-seat variant exactly:
fp16 (T4/SM75 has no bf16 datapath), --enforce-eager, hermes tool
parser, 16K context, CORS open (the key is the lock).
"""
SESSION_KEY = _secrets.token_urlsafe(32)
BASE = MOCK_BASE if DRY_RUN else f"http://127.0.0.1:{PORT}/v1"
server_proc = None

if DRY_RUN:
    print(f"[serve] dry-run: using mock seat at {BASE}")
else:
    env = dict(os.environ, CUDA_VISIBLE_DEVICES="0")
    cmd = [sys.executable, "-m", "vllm.entrypoints.openai.api_server",
           "--model", MODEL_DIR, "--served-model-name", SERVED_NAME,
           "--host", "0.0.0.0", "--port", str(PORT),
           "--max-model-len", "16384",
           "--gpu-memory-utilization", "0.92",
           "--dtype", "float16", "--enforce-eager",
           "--enable-auto-tool-choice",
           "--tool-call-parser", "hermes",
           "--allowed-origins", "*", "--allowed-methods", "*",
           "--allowed-headers", "*",
           "--api-key", SESSION_KEY]
    log = open(os.path.join(WORK, "server.log"), "w")
    server_proc = subprocess.Popen(cmd, env=env, stdout=log,
                                   stderr=subprocess.STDOUT)
    print(f"[serve] vLLM starting (pid {server_proc.pid}), "
          "log: server.log")

# %%
"""Cell 5 — wait for health, then the built-in smoke test.

Same three proofs as serving/smoke_test.py: the model lists, a
plain chat answers, and a full tool round completes against a
MOCK get_weather (labelled mock in the payload — it proves the
tool-calling machinery, not real weather data).
"""


def http_json(url, body=None, key=None, timeout=120):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method="POST"
                                 if data else "GET")
    req.add_header("Content-Type", "application/json")
    if key:
        req.add_header("Authorization", f"Bearer {key}")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def wait_healthy(deadline_s=600):
    t0 = time.time()
    while time.time() - t0 < deadline_s:
        try:
            models = http_json(BASE + "/models", key=SESSION_KEY,
                               timeout=10)
            ids = [m["id"] for m in models.get("data", [])]
            if SERVED_NAME in ids:
                print(f"[health] OK after {time.time()-t0:.0f}s — "
                      f"models: {ids}")
                return True
        except Exception:
            pass
        time.sleep(5)
    print("[health] FAILED — see server.log")
    return False


def smoke():
    results = {}
    chat = http_json(BASE + "/chat/completions", {
        "model": SERVED_NAME,
        "messages": [{"role": "user",
                      "content": "Reply with exactly: SEAT OK"}],
    }, key=SESSION_KEY)
    text = chat["choices"][0]["message"]["content"]
    results["chat"] = text
    print(f"[smoke] chat -> {text!r}")

    tools = [{"type": "function", "function": {
        "name": "get_weather",
        "description": "Get weather for a place (SMOKE MOCK).",
        "parameters": {"type": "object",
                       "properties": {"location": {"type": "string"}},
                       "required": ["location"]}}}]
    msgs = [{"role": "user",
             "content": "Use the tool: weather in Testville?"}]
    r1 = http_json(BASE + "/chat/completions", {
        "model": SERVED_NAME, "messages": msgs, "tools": tools,
        "tool_choice": "auto"}, key=SESSION_KEY)
    call = r1["choices"][0]["message"]["tool_calls"][0]
    assert call["function"]["name"] == "get_weather", call
    args = json.loads(call["function"]["arguments"])
    print(f"[smoke] tool call -> get_weather({args})")
    msgs.append(r1["choices"][0]["message"])
    msgs.append({"role": "tool", "tool_call_id": call["id"],
                 "content": json.dumps(
                     {"location": args.get("location", "Testville"),
                      "conditions": "sunny", "mock": True})})
    r2 = http_json(BASE + "/chat/completions", {
        "model": SERVED_NAME, "messages": msgs, "tools": tools},
        key=SESSION_KEY)
    final = r2["choices"][0]["message"]["content"]
    results["tool_round"] = final
    print(f"[smoke] tool round -> {final!r}")
    print("[smoke] SMOKE TEST PASSED (chat + tool call)")
    return results


assert wait_healthy()
SMOKE_RESULTS = smoke()

# %%
"""Cell 6 — open the tunnel, print the endpoint, publish the
rendezvous. THIS is the moment the seat becomes reachable from
the phone."""
PUBLIC_BASE = BASE
if DRY_RUN:
    print("[tunnel] dry-run: skipped (endpoint stays the mock base)")
else:
    tunnel_log = os.path.join(WORK, "tunnel.log")
    with open(tunnel_log, "w") as log:
        proc = subprocess.Popen(
            ["cloudflared", "tunnel", "--url",
             f"http://127.0.0.1:{PORT}", "--no-autoupdate"],
            stdout=log, stderr=subprocess.STDOUT)
    import re as _re
    for _ in range(60):
        time.sleep(2)
        try:
            text = open(tunnel_log).read()
        except FileNotFoundError:
            continue
        m = _re.search(r"https://[a-z0-9-]+\.trycloudflare\.com",
                       text)
        if m:
            PUBLIC_BASE = m.group(0) + "/v1"
            break
    else:
        raise SystemExit("[tunnel] no trycloudflare URL in 120s — "
                         "see tunnel.log")

print()
print("================= YOUR SEAT IS LIVE =================")
print(f"ENDPOINT:  {PUBLIC_BASE}")
print(f"API KEY:   {SESSION_KEY}")
print("MODEL:     grok-local")
print("In the app: Settings -> paste endpoint + key — or, with the")
print("rendezvous set up, just reopen the app and it finds this seat.")
print("Reminder: this endpoint DIES when the session ends.")
print("======================================================")
print(publish_rendezvous(build_rendezvous(PUBLIC_BASE,
                                          SESSION_KEY)))

# %%
"""Cell 7 — END OF SESSION: save_out().

Run save_out() as the LAST thing before closing the session. It
matches the runbook's save checklist item for item:
  [1] session record + smoke results -> outputs/ (+ HF upload)
  [2] server + tunnel logs           -> outputs/ (+ HF upload)
  [3] trained LoRA adapters, if any training output exists in
      the workspace -> packaged with a hashed manifest, plus the
      exact steps to turn the package into a versioned Kaggle
      dataset (or it rides the HF upload when the secret exists)
  [4] rendezvous marked "closed" so the app stops offering a
      dead seat.
Code/configs already live in GitHub (the kit) — nothing of value
may exist only inside this session.
"""


def _hash_tree(root):
    out = {}
    for dirpath, _dirs, files in os.walk(root):
        for fn in files:
            p = os.path.join(dirpath, fn)
            out[os.path.relpath(p, root)] = {
                "bytes": os.path.getsize(p), "sha256": _sha256(p)}
    return out


def save_out():
    stamp = time.strftime("%Y%m%d-%H%M%S", time.gmtime())
    out_dir = os.path.join(WORK, "outputs", f"session-{stamp}")
    os.makedirs(out_dir, exist_ok=True)
    record = {
        "kind": "grok-local-free-test-session",
        "stamp": stamp, "seat": "kaggle-free-test",
        "endpoint": PUBLIC_BASE, "model": SERVED_NAME,
        "smoke": SMOKE_RESULTS,
        "key_fingerprint": key_fingerprint(SESSION_KEY),
    }
    with open(os.path.join(out_dir, "session_record.json"),
              "w") as f:
        json.dump(record, f, indent=2)
    print("[save] [1] session_record.json written")

    for name in ("server.log", "tunnel.log"):
        src = os.path.join(WORK, name)
        if os.path.exists(src):
            import shutil
            shutil.copy(src, os.path.join(out_dir, name))
    print("[save] [2] logs copied (those that exist)")

    adapters = []
    for cand in ("training-out", "out"):
        p = os.path.join(WORK, cand)
        if os.path.isdir(p):
            adapters.append(p)
    if adapters:
        manifest = {p: _hash_tree(p) for p in adapters}
        with open(os.path.join(out_dir, "ADAPTERS-MANIFEST.json"),
                  "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"[save] [3] adapters found at {adapters} — hashed "
              "manifest written. To version them as a Kaggle "
              "dataset: open this notebook's Output panel -> the "
              "outputs folder -> 'New Dataset', name it "
              "grok-local-adapters, note the version. (Or rely on "
              "the HF upload below / a TeraBox copy — runbook.)")
    else:
        print("[save] [3] no training output in this session — "
              "nothing to package (normal for a pure test drive)")

    if not DRY_RUN and HF_TOKEN and RENDEZVOUS_DATASET:
        from huggingface_hub import HfApi
        api = HfApi()
        for fn in os.listdir(out_dir):
            api.upload_file(
                path_or_fileobj=os.path.join(out_dir, fn),
                path_in_repo=f"sessions/{stamp}/{fn}",
                repo_id=RENDEZVOUS_DATASET, repo_type="dataset",
                token=HF_TOKEN)
        print(f"[save] uploaded session files to "
              f"{RENDEZVOUS_DATASET}/sessions/{stamp}/")

    print(publish_rendezvous(build_rendezvous(
        PUBLIC_BASE, SESSION_KEY, status="closed")))
    print("[save] [4] rendezvous marked closed")
    print(f"[save] DONE — durable copy in {out_dir} "
          "(download it from the Output panel if the HF upload "
          "did not run). Nothing of value remains only in-session.")
    return out_dir


print("[save] save_out() is defined. Run it as your last cell "
      "before closing the session:")
print("       save_out()")
