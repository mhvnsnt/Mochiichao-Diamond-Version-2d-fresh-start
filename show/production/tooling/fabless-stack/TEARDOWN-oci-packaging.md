# TEARDOWN — Link 7: Board assembly → packaging standards (OCI / Docker images)

Part of the [Fabless Stack](FABLESS-STACK.md) ten-link chain map. In the physical
chain, board assembly is where a bare GPU die becomes a product: ASUS/MSI/
Gigabyte mount the chip, memory and coolers on a board and ship a card that
plugs into anything. In code, **the container image is the board**: a model +
runtime + libraries assembled once into a standard package that runs on any
seat. Our deploy kits are the assembly step; the OCI standard is what makes
the assembled thing plug-compatible everywhere.

## The standard: OCI (Open Container Initiative)

- **What it is:** the industry-standard specifications for container images
  (image-spec) and runtimes (runtime-spec), governed by the Linux Foundation's
  OCI project, originally seeded by Docker's donated formats. Every serious
  platform — Docker, Kubernetes, Podman, containerd, every cloud's registry —
  speaks OCI. An image built anywhere runs anywhere OCI is implemented.
- **Licence: Apache-2.0** (opencontainers/image-spec and runtime-spec).
- **The toolchain pieces (all verified class):**
  - **containerd** — the CNCF runtime under Docker and Kubernetes. Apache-2.0.
  - **Docker Engine / Moby** — the builder+daemon most images are made with.
    Apache-2.0. (**Docker Desktop** is the exception: proprietary, free only
    for personal/small-business use, paid beyond that — bucket:
    free-but-restricted/paid. We don't depend on Desktop anywhere; our seats
    are Linux.)
  - **Podman / Buildah** — daemonless OCI build+run, Red Hat-led. Apache-2.0.
  - **Registries** — GitHub Container Registry (ghcr.io) is where our packages
    live next to the repo; distribution/distribution (the reference registry)
    is Apache-2.0 if self-hosting is ever needed.

## How the assembly step works in our stack

1. A serving or training stack (links 3/5) is frozen into a `Dockerfile` —
   base image + pinned dependencies + our configs from this folder.
2. The built image is the *board*: identical bytes on a free Kaggle session
   (where the platform permits images), a serverless endpoint, or a rented
   seat later. Seat choice stays a variable (link 10) precisely because the
   package doesn't change.
3. GGUF models and other multi-GB payloads do **not** go inside images we push
   to GitHub-adjacent registries — they ride the manifest + pull-on-target
   pattern (staging law): the image carries the pull script, the weights
   arrive from their staged home (TeraBox/dataset) at seat start.

This is exactly how the existing programmes already assemble: the Kaggle job
datasets and the 4090 production pack are board-assembly done with dataset
zips instead of OCI images (Kaggle's platform takes notebooks+datasets, not
arbitrary images — an honest platform constraint, named here rather than
papered over). Where a seat accepts images, the same contents ship as OCI.

## Wiring status

- **Documented + cross-referenced.** Our deliverable at this link is the
  assembly discipline above plus the pull-on-target scripts in `llamacpp/`
  and `skypilot/` (SkyPilot configs can name a Docker image as the seat
  runtime — that field is the literal plug between link 7 and link 3).
- **Plugs into programmes:** Wielder's deploy artefacts, grok-local's serving
  kit, and the show pipeline's Kaggle job packages are all instances of this
  link; naming OCI as the standard is what keeps a future non-Kaggle seat a
  config change instead of a rebuild.

## GAPs at this link

- Kaggle (our current main seat) does not accept arbitrary OCI images for GPU
  notebooks — assembly there stays dataset+notebook shaped. Named platform
  constraint, not a defect in the standard.
- NVIDIA's NGC container catalogue is free-but-restricted (NVIDIA account +
  their terms) — convenient prebuilt boards, not a dependency; our stacks
  build from public base images instead.
