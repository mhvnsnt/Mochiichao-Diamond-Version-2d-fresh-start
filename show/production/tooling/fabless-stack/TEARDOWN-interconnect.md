# TEARDOWN — Link 6: Interconnect (NVLink/PCIe) → collective communication in code

Part of the [Fabless Stack](FABLESS-STACK.md) ten-link chain map. In the physical
chain, NVLink and PCIe are how GPUs talk to each other fast enough to act as
one machine. In code, that link is the **collective-communication library**:
all-reduce, all-gather, broadcast — the primitives that let data-parallel
training and tensor-parallel serving move gradients and activations between
GPUs. The interconnect hardware is useless without this layer, and this layer
is (mostly) open.

## NCCL — NVIDIA's collective library (the incumbent)

- **What it is:** NVIDIA's stand-alone library of multi-GPU communication
  primitives (all-reduce, all-gather, reduce, broadcast, reduce-scatter,
  point-to-point), topology-aware (PCIe, NVLink, NVSwitch, InfiniBand Verbs,
  TCP/IP sockets), used by PyTorch, vLLM tensor parallelism, and effectively
  every multi-GPU training run on NVIDIA hardware — including the two-T4
  Kaggle seats' *within-node* communication where applicable.
- **Licence: Apache-2.0 for most of the project, with some parts retaining
  their original BSD licence** — that is the first statement of the repo's own
  `LICENSE.txt` (NVIDIA/nccl), read directly on 2026-10-28. GitHub's licence
  detector reports NOASSERTION for this repo; the file wins. NCCL is genuinely
  open source — one of the pieces people most often mislabel, in both
  directions. **CORRECTION (2026-10-28, same day):** this teardown's first
  landed version labelled NCCL "BSD 3-Clause" from memory of its older
  licensing; re-reading the actual LICENSE.txt showed the Apache-2.0-primary
  text above, and the label was corrected the same day, per the licence
  honesty law. (The irony — a wrong label in a paragraph about mislabelling —
  is noted and kept in the record.)
- **The honest catch:** NCCL is open, but it only speaks NVIDIA. It assumes
  CUDA and NVLink-class topology awareness. Open licence ≠ portable.

## The open alternatives (the portable side of the link)

- **RCCL** (ROCm/rccl) — AMD's fork-compatible equivalent for ROCm/HIP seats:
  **BSD-3-Clause** — its `LICENSE.txt` is the BSD redistribution text carrying
  NVIDIA copyright, AMD's modifications, and some Microsoft-contributed parts
  under MIT. (First landed version said simply "MIT" — corrected 2026-10-28
  after reading the file itself.) Same collective API shape, AMD hardware.
  This is the link-6 piece that pairs with the ROCm door (link 8).
- **Gloo** (facebookincubator/gloo) — Meta's collective library, **BSD
  3-Clause**: CPU and CUDA transports, and — importantly for us — it is
  PyTorch's default backend for CPU/gloo process groups, i.e. the collective
  layer that works on GPU-less and mixed seats.
- **oneCCL** (Intel, UXL Foundation) — the oneAPI collective library for Intel
  hardware; catalogued for completeness, not used by any current seat.
- **MPI (Open MPI / MPICH)** — the elder standard underneath much of this:
  BSD-style licences; relevant as the process-launch layer under multi-node
  training rather than as a GPU collective itself.

## What this link means at our scale

Our seats today are single-GPU (one T4, one phone, one CPU VM): collectives
are *latent*, not load-bearing. The link becomes real the moment a seat has
2+ GPUs working one job — a two-T4 Kaggle session pooling via separate
processes, a future multi-GPU rented seat, tensor-parallel vLLM. The wiring
decision recorded here so that moment needs no research: **NCCL on NVIDIA
seats (Apache-2.0/BSD), RCCL on AMD seats (BSD-3), Gloo for CPU/mixed groups** —
and all three are what PyTorch's `torch.distributed` already selects between,
so the choice lands as configuration, not code.

## Wiring status

- **Catalogued with the selection rule wired into the serving/training
  templates' comments** (`serving/`, `skypilot/`): multi-GPU fields name the
  backend per vendor. Nothing to smoke-test on a GPU-less single-core-count
  VM — a one-process "collective" proves nothing; marked first-run on the
  first multi-GPU seat, honestly.
- **Plugs into programmes:** grok-local's vLLM tensor-parallel option and the
  show pipeline's future multi-GPU training runs consume this link through
  PyTorch/vLLM defaults named here.

## GAPs at this link

- **NVLink/NVSwitch hardware and its firmware:** NVIDIA-only, closed — GAP by
  design; we use it when a seat provides it, through NCCL, never around it.
- **Petals-style WAN collectives** are *not* this link done over the internet —
  see TEARDOWN-petals.md (evaluated-rejected) for why session/WAN data
  movement fails on free seats specifically.
