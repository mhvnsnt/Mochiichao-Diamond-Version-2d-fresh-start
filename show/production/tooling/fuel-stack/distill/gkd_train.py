"""gkd_train.py — Phase B: on-policy distillation with TRL GKD.

Wraps trl.experimental.gkd.GKDTrainer (TRL, Apache-2.0) exactly as
its documented API specifies: GKDTrainer(model=, teacher_model=,
args=GKDConfig(...), processing_class=, train_dataset=, eval_dataset=).
The loss is the generalised Jensen-Shannon divergence between student
and teacher distributions; `lmbda` mixes on-policy student samples
into training, `beta` interpolates forward/reverse KL.

Seat notes (see TEARDOWN-distillation.md for the full picture):
- 24 GB seat: teacher bf16/AWQ + QLoRA student fits with care; the
  teacher-server variant (TRL's newer DistillationTrainer, teacher
  behind a vLLM server) is the roomier route — same config, set
  gkd.teacher_server_url.
- Kaggle 2xT4: teacher Qwen3-14B on GPU 1 (config kaggle_teacher_id),
  student on GPU 0, fp16 (Turing: no bf16 fast paths), 4-bit student.

--check validates the config + dataset WITHOUT importing torch/trl,
so the kit can be verified on a CPU box (that is how this file was
smoke-checked on the build VM). A real run is a GPU first-run item.

Usage:
  python3 gkd_train.py --config distill_config.yaml --check
  python3 gkd_train.py --config distill_config.yaml \
      --train data/generations.jsonl --eval data/eval_prompts.jsonl
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def load_config(path: str) -> dict:
    try:
        import yaml
    except ImportError:
        print("REFUSED — PyYAML is required to read the config "
              "(pip install pyyaml).", file=sys.stderr)
        sys.exit(2)
    return yaml.safe_load(Path(path).read_text(encoding="utf-8"))


def check(cfg: dict, train_path: str | None) -> int:
    problems: list[str] = []
    teacher, student = cfg.get("teacher", {}), cfg.get("student", {})
    for who, block in (("teacher", teacher), ("student", student)):
        if block.get("licence") != "Apache-2.0":
            problems.append(f"{who} licence is {block.get('licence')!r} — this kit "
                            "only distils between models verified Apache-2.0")
        if not block.get("id"):
            problems.append(f"{who}.id missing")
    gkd = cfg.get("gkd", {})
    for key in ("lmbda", "beta", "temperature"):
        v = gkd.get(key)
        if v is None or not (0.0 <= float(v) <= 2.0):
            problems.append(f"gkd.{key}={v!r} out of sane range")
    if train_path:
        p = Path(train_path)
        if not p.exists():
            problems.append(f"training file not found: {p}")
        else:
            rows = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
            no_prov = [r for r in rows if "provenance" not in r]
            if no_prov:
                problems.append(f"{len(no_prov)}/{len(rows)} training rows lack "
                                "provenance — every response must trace to the "
                                "open teacher (teacher_generate.py writes it)")
            print(f"dataset: {len(rows)} rows, all provenance-checked")
    print(f"teacher: {teacher.get('id')} ({teacher.get('licence')})")
    print(f"student: {student.get('id')} ({student.get('licence')})")
    print(f"gkd: lmbda={gkd.get('lmbda')} beta={gkd.get('beta')} "
          f"temperature={gkd.get('temperature')} epochs={gkd.get('num_train_epochs')}")
    if problems:
        for p in problems:
            print("PROBLEM:", p)
        return 1
    print("CHECK PASSED — config, licences and dataset provenance are in order. "
          "The GPU run itself is a first-run item (see distill/README.md).")
    return 0


def run(cfg: dict, train_path: str, eval_path: str | None) -> int:
    # Imported lazily so --check works on a bare CPU box.
    from datasets import Dataset
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from trl.experimental.gkd import GKDConfig, GKDTrainer

    g = cfg["gkd"]
    peft_cfg = None
    if cfg.get("peft", {}).get("use_peft"):
        from peft import LoraConfig
        p = cfg["peft"]
        peft_cfg = LoraConfig(r=p["r"], lora_alpha=p["lora_alpha"],
                              lora_dropout=p["lora_dropout"],
                              target_modules=p["target_modules"],
                              task_type="CAUSAL_LM")

    def load_rows(path: str) -> Dataset:
        rows = [json.loads(l) for l in Path(path).read_text(encoding="utf-8").splitlines() if l.strip()]
        # GKD consumes prompt/completion-style rows; our generations
        # files are chat rows — flatten to prompt + completion.
        flat = []
        for r in rows:
            if "messages" in r:
                flat.append({"prompt": r["messages"][0]["content"],
                             "completion": r["messages"][1]["content"]})
            else:
                flat.append({"prompt": r["prompt"], "completion": r.get("completion", "")})
        return Dataset.from_list(flat)

    student_id = cfg["student"]["id"]
    teacher_id = cfg["teacher"]["id"]
    args = GKDConfig(
        output_dir=cfg["output"]["dir"],
        lmbda=g["lmbda"], beta=g["beta"], temperature=g["temperature"],
        max_prompt_length=g["max_prompt_length"],
        max_completion_length=g["max_completion_length"],
        per_device_train_batch_size=g["per_device_train_batch_size"],
        gradient_accumulation_steps=g["gradient_accumulation_steps"],
        learning_rate=g["learning_rate"],
        num_train_epochs=g["num_train_epochs"],
        bf16=g["bf16"], fp16=g["fp16"],
        logging_steps=10, save_strategy="epoch", report_to=[],
    )
    trainer = GKDTrainer(
        model=student_id,
        teacher_model=teacher_id,
        args=args,
        processing_class=AutoTokenizer.from_pretrained(student_id),
        train_dataset=load_rows(train_path),
        eval_dataset=load_rows(eval_path) if eval_path else None,
        peft_config=peft_cfg,
    )
    trainer.train()
    trainer.save_model(cfg["output"]["dir"] + "/final")
    print(f"student saved -> {cfg['output']['dir']}/final "
          f"(teacher was {teacher_id}; verify with eval_scorecard.py before staging)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--config", default=str(Path(__file__).with_name("distill_config.yaml")))
    ap.add_argument("--train", default="data/generations.jsonl")
    ap.add_argument("--eval", default=None)
    ap.add_argument("--check", action="store_true",
                    help="validate config + dataset only; no GPU work")
    args = ap.parse_args()
    cfg = load_config(args.config)
    if args.check:
        return check(cfg, args.train if Path(args.train).exists() else None)
    return run(cfg, args.train, args.eval)


if __name__ == "__main__":
    sys.exit(main())
