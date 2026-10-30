# Fabless Stack — folder map

The industry chain under a fabless GPU operation, pulled in as open
industry-standard code and wired into this repo. **Start with
[FABLESS-STACK.md](FABLESS-STACK.md)** — the ten-link chain map (each link of
the physical 4090 supply chain → the gettable code equivalent → teardown +
wiring status + where it plugs into Wielder, grok-local, and the show
pipeline).

| Path | What it is |
|---|---|
| `FABLESS-STACK.md` | The catalogue: ten links, licences verified at source, GAP row, proof ledger, wiring-into-programmes matrix |
| `TEARDOWN-open-gpu-designs.md` | Link 1 — Vortex / MIAOW / Nyuzi open GPU designs |
| `TEARDOWN-compiler-toolchain.md` | Link 2 — LLVM / TVM / Triton compiler layer |
| `TEARDOWN-skypilot.md` | Link 3 — SkyPilot (primary) + Ray (evaluated alternative) |
| `TEARDOWN-spirv.md` | Link 4 — SPIR-V open IR, PTX documented-honestly |
| `TEARDOWN-framework-kernels.md` | Links 2/4/8 — PyTorch, Triton, NVIDIA open vs closed split |
| `TEARDOWN-vllm.md` | Link 5 — vLLM / PagedAttention (compact; model side lives in grok-local) |
| `TEARDOWN-interconnect.md` | Link 6 — NCCL / RCCL / Gloo collectives |
| `TEARDOWN-oci-packaging.md` | Link 7 — OCI/Docker packaging standard |
| `TEARDOWN-rocm.md` | Link 8 — ROCm/HIP, the AMD door |
| `TEARDOWN-webllm.md` | Link 8 — WebLLM browser runtime + the PWA integration spec |
| `TEARDOWN-llamacpp.md` | Link 8 — llama.cpp + GGUF, the anywhere/phone engine |
| `TEARDOWN-petals.md` | Link 10 — Petals: EVALUATED-REJECTED for free-session seats |
| `TEARDOWN-tunnel.md` | Link 10 — cloudflared / frp rendezvous transport (compact) |
| `skypilot/` | Link 3 configs: `serve-vllm.yaml`, `train-lora.yaml` (parse-validated) |
| `serving/` | Link 5 seat matrix: one OpenAI-shaped contract, seat as a variable |
| `llamacpp/` | Phone/CPU seat: `build-android.sh`, `PHONE-ENGINE.md`, `wielder-edge-seat.json`, `smoke-cpu.sh` |
| `triton/` | Link 4 runnable kernel: `vector_add_kernel.py` (GPU seats + CPU interpreter) |
| `tunnel/` | Link 10 templates: cloudflared config, frp server/client |
| `smoke/` | Recorded proof: `SMOKE-RESULTS.md` — what actually ran on this VM, with outputs |

Sibling package (not edited from here, cross-referenced only):
`show/production/wielder/grok-local/` — the self-hosted brain stack whose
serving, rotation, and PWA work consumes links 3, 5, 8, and 10.
