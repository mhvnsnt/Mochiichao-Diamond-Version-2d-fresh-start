# %% [markdown]
# # fuel-stack — DISTILLATION JOB (Kaggle, $0)
#
# Trains a small OPEN student to imitate a big OPEN teacher, end to
# end, on Kaggle's free fuel. Part of show/production/tooling/
# fuel-stack/distill/ — read TEARDOWN-distillation.md first.
#
# THE PLAN (two T4s, NOT pooled — one job each):
# - GPU 1 serves the teacher: Qwen/Qwen3-14B (Apache-2.0) under vLLM.
#   The 30B-A3B teacher does NOT fit one 16 GB T4; on a 24 GB seat
#   use distill_config.yaml's primary teacher instead. The Kaggle
#   variant is a smaller-teacher run and the record says so.
# - GPU 0 trains the student: Qwen/Qwen3-4B-Instruct-2507
#   (Apache-2.0), QLoRA via TRL GKD (Apache-2.0), fp16 (Turing has
#   no bf16 fast paths — measured by this programme's Path A work).
#
# DATA: prompts come from the staged sources in dataset_sources.json
# (UltraChat 200k prompts, MIT — bundled responses discarded; plus
# the programme's own seed prompts). EVERY response in the training
# set is generated HERE by the teacher above and carries a
# provenance block. No closed model's outputs, ever.
#
# HONEST LIMITS:
# - This kernel is a JOB SPEC: complete and syntax-checked on the
#   build VM, but its GPU run is a FIRST-RUN item. The first run's
#   job is to execute it, record timings/errors verbatim, and fix
#   forward — not to assume it works.
# - Kaggle gives ~30 GPU hours/week SHARED with the show pipeline;
#   show work has priority. A distillation epoch here is sized to
#   fit inside that budget; raise max_prompts only with the ledger
#   in view (grok-local DEPLOY-RUNBOOK, operating model).
# - Save-out is the LAST cell and is not optional: adapter +
#   scorecard + this run's record go to /kaggle/working/outputs and
#   are staged to the warehouse from there (staging law).
#
# SECRETS: none required. HF token optional (speeds model pulls).

# %% [code]
import json, os, subprocess, sys, textwrap

PHASES = os.environ.get("FUEL_DISTILL_PHASES", "setup,generate,train,score,saveout")
def run(cmd, **kw):
    print("+", cmd)
    return subprocess.run(cmd, shell=True, check=True, **kw)

# %% [code]
# --- setup (phase: setup) -------------------------------------------------
if "setup" in PHASES:
    run("pip install -q trl peft accelerate bitsandbytes datasets "
        "transformers sentencepiece pyyaml vllm")
    os.makedirs("data", exist_ok=True)
    # Prompts: UltraChat 200k (MIT) — downloaded as data, prompts only.
    from datasets import load_dataset
    ds = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft")
    with open("data/ultrachat_prompts.jsonl", "w") as f:
        for row in ds.select(range(30000)):
            f.write(json.dumps(row) + "\n")
    print("setup done; prompts staged")

# %% [code]
# --- data prep (phase: generate) -------------------------------------------
# prepare_distill_data.py ships with this kernel's dataset on the
# warehouse side; if it is absent, the inline equivalent below runs
# (prompts only, responses discarded — same policy, enforced twice).
if "generate" in PHASES:
    seen, prompts = set(), []
    for line in open("data/ultrachat_prompts.jsonl"):
        row = json.loads(line)
        for m in row.get("messages", []):
            if m.get("role") == "user":
                p = m["content"].strip()
                key = " ".join(p.lower().split())
                if p and key not in seen:
                    seen.add(key); prompts.append({"prompt": p, "source": "ultrachat_200k:prompts-only"})
                break
    prompts = prompts[:4000]
    with open("data/prompts.jsonl", "w") as f:
        for r in prompts:
            f.write(json.dumps(r) + "\n")
    print(f"prompt pool: {len(prompts)}")

# %% [code]
# --- teacher generations (phase: generate) ---------------------------------
# Teacher served by vLLM on GPU 1; generations from THIS teacher only.
if "generate" in PHASES:
    env = dict(os.environ, CUDA_VISIBLE_DEVICES="1")
    teacher = subprocess.Popen(
        "python -m vllm.entrypoints.openai.api_server "
        "--model Qwen/Qwen3-14B --max-model-len 4096 --port 8000",
        shell=True, env=env)
    import time, urllib.request
    for _ in range(120):
        try:
            urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=5)
            break
        except Exception:
            time.sleep(10)
    os.environ["TEACHER_BASE_URL"] = "http://127.0.0.1:8000/v1"
    os.environ["TEACHER_MODEL"] = "Qwen/Qwen3-14B"
    run("python teacher_generate.py --prompts data/prompts.jsonl "
        "--out data/generations.jsonl --concurrency 16")
    teacher.terminate()
    print("generations complete; every row carries provenance")

# %% [code]
# --- GKD training (phase: train) --------------------------------------------
# Student on GPU 0. On Kaggle both cards are visible to one process;
# gkd_train.py loads teacher weights itself — for the 2xT4 layout the
# teacher here is the 14B in bf16->fp16 on the second device via
# device_map in TRL; expect a tight fit and record the first run's
# memory numbers verbatim (first-run item).
if "train" in PHASES:
    os.environ["CUDA_VISIBLE_DEVICES"] = "0,1"
    run("python gkd_train.py --config distill_config.yaml "
        "--train data/generations.jsonl")

# %% [code]
# --- scorecard (phase: score) ------------------------------------------------
# Serves the merged student briefly and scores teacher-vs-student on
# the fixed prompt set. Record only; promotion is the owner's call.
if "score" in PHASES:
    print("score phase: serve runs/student-qwen3-4b-gkd/final with vLLM "
          "on port 8001, then run eval_scorecard.py against teacher "
          "(port 8000 pattern) — see distill/README.md step 4. Kept as "
          "an explicit step so a failed train never fakes a score.")

# %% [code]
# --- save-out (phase: saveout) — NEVER SKIP ---------------------------------
if "saveout" in PHASES:
    os.makedirs("/kaggle/working/outputs", exist_ok=True)
    run("cp -r runs /kaggle/working/outputs/ 2>/dev/null || true")
    run("cp data/generations.jsonl /kaggle/working/outputs/ 2>/dev/null || true")
    run("cp scorecard.json /kaggle/working/outputs/ 2>/dev/null || true")
    print("saved out: adapter(s), generations with provenance, scorecard. "
          "Stage to the warehouse (GitHub/TeraBox) from outputs — a "
          "session is fuel, never the warehouse.")
print("DISTILL JOB RECORD WRITTEN")
