# Landing fuel-stack-1 onto restored main

Source branch tip: ae694d442. Own commits: bfd91cc27..ae694d442 (2).
Main's history was rebuilt from an orphan restore, so the branch shares no merge base with main; its own commits were applied onto main three-way instead of a plain merge. Main's restored files are kept.

## Decisions
- show/production/tooling/fuel-stack/FUEL-STACK.md: added
- show/production/tooling/fuel-stack/README.md: added
- show/production/tooling/fuel-stack/TEARDOWN-bitnet.md: added
- show/production/tooling/fuel-stack/TEARDOWN-caching-and-retrieval.md: added
- show/production/tooling/fuel-stack/TEARDOWN-distillation.md: added
- show/production/tooling/fuel-stack/TEARDOWN-sparse-by-design.md: added
- show/production/tooling/fuel-stack/TEARDOWN-speculative-decoding.md: added
- show/production/tooling/fuel-stack/distill/README.md: added
- show/production/tooling/fuel-stack/distill/dataset_sources.json: added
- show/production/tooling/fuel-stack/distill/distill_config.yaml: added
- show/production/tooling/fuel-stack/distill/eval_prompts.jsonl: added
- show/production/tooling/fuel-stack/distill/eval_scorecard.py: added
- show/production/tooling/fuel-stack/distill/gkd_train.py: added
- show/production/tooling/fuel-stack/distill/kaggle/distill_kernel.py: added
- show/production/tooling/fuel-stack/distill/kaggle/kernel-metadata.json: added
- show/production/tooling/fuel-stack/distill/prepare_distill_data.py: added
- show/production/tooling/fuel-stack/distill/teacher_generate.py: added
- show/production/tooling/fuel-stack/moe/ROUTER-SPEC.md: added
- show/production/tooling/fuel-stack/rag/README.md: added
- show/production/tooling/fuel-stack/rag/fuel_rag.py: added
- show/production/tooling/fuel-stack/rag/sample_docs/dorowani.md: added
- show/production/tooling/fuel-stack/rag/sample_docs/kaggle-budget.md: added
- show/production/tooling/fuel-stack/rag/sample_docs/phone-seat.md: added
- show/production/tooling/fuel-stack/rag/sample_docs/staging.md: added
- show/production/tooling/fuel-stack/rag/sample_docs/terabox-music.md: added
- show/production/tooling/fuel-stack/rag/sample_docs/wielder-rules.md: added
- show/production/tooling/fuel-stack/rag/test_fuel_rag.py: added
- show/production/tooling/fuel-stack/smoke/SMOKE-RESULTS.md: added
- show/production/tooling/fuel-stack/speculative/README.md: added
- show/production/tooling/fuel-stack/speculative/llamacpp-speculative-serve.sh: added
- show/production/tooling/fuel-stack/speculative/vllm-draft-model.json: added
- show/production/tooling/fuel-stack/speculative/vllm-eagle3.json: added
- show/production/tooling/fuel-stack/speculative/vllm-ngram.json: added
