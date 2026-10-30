# distill/ — the runnable distillation kit

Train a small open student to imitate a big open teacher.
Teardown and reasoning: `../TEARDOWN-distillation.md`.
Licence audit of every data source: `dataset_sources.json`.
**Hard rule: the teacher is an open model we serve ourselves. No
closed model's outputs are training data, anywhere, ever.**

## Run order

1. **Prepare prompts** (any machine, stdlib only):
   ```
   python3 prepare_distill_data.py \
     --ultrachat ultrachat_train_sft.jsonl \
     --seeds <grok-local>/training/grok_pattern_seeds.jsonl \
     --outdir data
   ```
   Produces `data/prompts.jsonl` + `data/eval.jsonl`, prompts only.
2. **Generate teacher answers** (needs the teacher seat up — the
   grok-local vLLM seat serving Qwen3-30B-A3B on a 24 GB seat, or
   Qwen3-14B on a free T4 seat):
   ```
   TEACHER_BASE_URL=http://127.0.0.1:8000/v1 TEACHER_MODEL=<served-name> \
   python3 teacher_generate.py --prompts data/prompts.jsonl \
     --out data/generations.jsonl
   ```
   Resumable; every row provenance-stamped with the teacher's id.
3. **Validate, then train** (GPU seat):
   ```
   python3 gkd_train.py --config distill_config.yaml \
     --train data/generations.jsonl --check     # no GPU; must pass
   python3 gkd_train.py --config distill_config.yaml \
     --train data/generations.jsonl             # the GKD run
   ```
4. **Score** teacher vs student on the fixed set (both served):
   ```
   python3 eval_scorecard.py --teacher-url ... --teacher-model ... \
     --student-url ... --student-model ... --out scorecard.json
   ```
   The scorecard is a record for the owner's promotion call — it
   never promotes anything by itself.
5. **Stage the result** per the staging law and register the adapter
   in `../moe/ROUTER-SPEC.md`'s specialist roster.

## Kaggle route

`kaggle/distill_kernel.py` + `kernel-metadata.json` run the whole
pipeline on the free 2×T4 seat (teacher 14B on GPU 1, student on
GPU 0). It is a complete job spec in the programme's kernel pattern;
its GPU execution is a **first-run item** — the kernel header says
so, and the first run's record (timings, memory, errors verbatim)
belongs in `../smoke/SMOKE-RESULTS.md`.

## Knobs that matter (distill_config.yaml)

- `gkd.lmbda` — 0 trains only on teacher text (off-policy), 1 trains
  only on the student's own generations scored by the teacher
  (on-policy). 0.5 is the shipped starting mix.
- `gkd.beta` — 0 = forward KL (student covers all teacher modes),
  1 = reverse KL (student picks the teacher's best mode), 0.5 = JSD.
- `peft.load_in_4bit` — on for T4-class seats, off when there's room.
- T4 seats: `bf16: false, fp16: true` (Turing has no bf16 fast
  paths — this programme measured that the hard way).
