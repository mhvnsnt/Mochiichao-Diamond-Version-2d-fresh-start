# Serving seat matrix — one endpoint contract, seat as a variable

Fabless Stack link 5 (memory systems / PagedAttention serving) delivered as
templates. Every seat below exposes the **same OpenAI-compatible HTTP API**
(`/v1/chat/completions`), so Wielder and every client treat seat choice as
configuration. Only two things change per seat: the endpoint URL (which comes
from the rendezvous, never hardcoded) and the model that fits.

| Seat class | Engine | Fits (honest class) | When it's used |
|---|---|---|---|
| Free session (Kaggle T4 16 GB ×1) | vLLM | small instruct models, AWQ/GPTQ 4-bit up to ~7–8B class | grok-local rotation seats; run by the grok-local notebook, not SkyPilot |
| Serverless GPU endpoint | vLLM (provider-hosted) | provider-dependent | burst/overflow; only providers whose terms the owner accepts |
| Rented 4090 24 GB (owner-gated) | vLLM | 7–14B comfortably at fp16/AWQ; 32B-class at 4-bit | only when the owner says rent |
| CPU / edge (this VM class) | llama.cpp `llama-server` | tiny–1B models, smoke + fallback | development, offline fallback (`../llamacpp/`) |
| Owner's phone (arm64) | llama.cpp native | 1–3B at Q4 (see PHONE-ENGINE.md) | flagship on-device seat (`../llamacpp/PHONE-ENGINE.md`) |
| Browser tab (WebGPU) | WebLLM | sub-1B–3B compiled models | PWA mode B (grok-local PWA consumes `../TEARDOWN-webllm.md`) |

Rules that keep the matrix honest:

- **Endpoint from rendezvous.** Clients read the current endpoint from the
  rendezvous record (tunnel layer, `../tunnel/`); a seat rotation is a
  rendezvous update, not a client release.
- **No silent downgrades.** If a seat can only run a smaller model, the seat
  record says which model it is actually serving; a request routed to a
  smaller brain is a visible fact, not a surprise.
- **Collectives follow the vendor** on multi-GPU seats: NCCL (NVIDIA) /
  RCCL (AMD) / Gloo (CPU) — see `../TEARDOWN-interconnect.md`.
