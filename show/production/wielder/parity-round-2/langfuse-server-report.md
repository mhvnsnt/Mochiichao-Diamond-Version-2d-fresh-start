# Langfuse server — self-host attempt report

**Date:** 2026-10-28 (work ran 20:28 UTC → 00:00 UTC, across one VM replacement)
**Worker:** Wielder parity round 2, Langfuse server lane
**Runtime dir:** `~/workspace/wielder-parity2/runtime/langfuse/` (all state lives here)
**Evidence dir:** `~/workspace/wielder-parity2/runtime/langfuse/evidence/`

## VERDICT: RUNNING — with proof

The real Langfuse server (upstream `langfuse/langfuse`, current v4 line,
**version 4.71.0** as reported by its own health endpoint) is self-hosted
on this VM and serving. All six services of the upstream stack are up:
langfuse-web, langfuse-worker, postgres, clickhouse, redis, minio.
Core only — no `ee/` features exist in, or were enabled by, this
deployment (compose has no ee switches; licence split per Wielder's
PROVENANCE: everything outside `ee/` is MIT, `ee/` is enterprise-licensed
and unused).

Proof (captured 2026-10-29T00:00Z in `evidence/health-20261029T000000Z.txt`
and `evidence/api-proof*.txt`):

- `GET http://localhost:3000/` → **200**, 8,693 B of real Langfuse UI HTML
  (saved as `evidence/web-ui.html`)
- `GET http://localhost:3000/api/public/health` → **200**
  `{"status":"OK","version":"4.71.0"}`
- `GET http://127.0.0.1:8123/ping` (ClickHouse) → **200** `Ok.`
- `GET http://127.0.0.1:9090/minio/health/live` (Minio) → **200**
- Authenticated API with the seeded project keys:
  `GET /api/public/projects` → **200**, returns project
  `wielder-telemetry` (`wielder-local-project`) in org `Wielder Local`
  (`wielder-local-org`)
- **End-to-end ingestion proof:** `POST /api/public/ingestion` with a
  legacy `trace-create` event → `207` with `successes[0].status = 201`,
  zero errors; the trace was then read back via
  `GET /api/public/traces/<id>` → **200** with the exact trace
  (id in `evidence/smoke-trace-id.txt`: a `wielder-smoke-*` trace,
  name `wielder-smoke-test`, correct project). That path exercises
  web → Redis queue → worker → Minio event upload → ClickHouse → API
  read — the same path Wielder's exporter will use.
- Web logs show the full ClickHouse migration set (53 migrations) and
  Postgres migrations completing, then Next.js ready; worker logs show
  its job runners executing.

**Left running** (see footprint below — it is modest). Stop/start
commands are at the end of this report.

---

## 1. Recon (exact outputs in `evidence/recon.txt`)

- No container runtime existed: `docker version`, `docker compose
  version`, `podman --version` → all `command not found` (exit 127).
  Also absent: nerdctl, ctr, containerd, buildah, kubectl, docker-compose.
  No docker/podman sockets.
- VM: Ubuntu 24.04.5, kernel 7.0.0-39, **2 CPU, 7.7 GiB RAM, 0 swap**.
  RAM available fluctuated 0.6–5.2 GiB with other tenants' load
  (measured repeatedly; 2.9–3.3 GiB available with the stack running).
- Disk: `/home` = 150 G device (btrfs, zstd), 48–61 G free during the
  run; root overlay is only 7.5 G, so all container storage was placed
  under the workspace. **Critical:** `~/workspace` totals **126 GB
  logical** across all tenants — the btrfs volume runs against a shared
  quota (see §3).
- We are root; apt works through the mandatory egress proxy
  (direct egress is blocked — TLS fails without the proxy, exit 35).
- Ports 3000/3030/5432/6379/8123/9000/9090/9091 were all free.
  Wielder's 8897/8899 were never touched; nothing under
  `~/workspace/wielder-home` was touched.
- Upstream compose fetched from
  `raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml`
  → saved as `docker-compose.upstream.yml`. **Note:** upstream main is
  now the **v4** line (`langfuse:4` / `langfuse-worker:4` images), not
  v3 as the task brief said; the service architecture is identical
  (web + worker + postgres + clickhouse + redis + minio).
  `docker.langfuse.com` is a Docker Hub front (its auth realm is
  `auth.docker.io`, repos `langfuse/langfuse{,-worker}`).

## 2. Getting a runtime to work in this cell

Installed from Ubuntu noble (logs in evidence/):
`podman 4.9.3` (crun 1.14.1, conmon 2.1.10, netavark 1.4.0),
`podman-compose 1.0.6`, later `skopeo 1.13.3`, `btrfs-progs`.

Three cell constraints, each proven by a failing then passing run:

1. **Bridge networking is impossible here.** Default run:
   `Error: netavark: setns: IO error: Operation not permitted`.
   Pasta is rootless-only. → The stack uses **host networking**;
   inter-service URLs are rewired to `127.0.0.1` (see §4).
2. **The systemd cgroup manager is impossible** (no D-Bus socket):
   `crun: cannot open sd-bus`. → `--cgroup-manager=cgroupfs`
   (set in `/etc/containers/containers.conf`, written for this stack).
   But cgroup v2 controllers are **not delegated**
   (`podman info`: `cgroupControllers: []`), which also means:
   - any memory limit fails container start:
     `crun: opening file 'memory.max' … No such file or directory`
     (first launch attempt, 23:42 UTC — caps were tried first, then
     removed; the compose file records this);
   - `podman exec` fails (`cgroup.freeze … No such file or directory`),
     so **podman healthchecks (exec-based) all report "unhealthy" with
     empty output while the services verifiably serve**. Health in this
     report is therefore proven by direct HTTP/process probes, not by
     the healthcheck status field;
   - `podman stats` returns 0B (cgroup stat files absent) — footprint
     below is measured from host `ps` RSS instead.
3. **Storage paths:** the deep workspace path exceeds podman's 50-char
   runroot limit. `/etc/containers/storage.conf` points graphroot at
   `…/runtime/langfuse/store` and runroot at `~/lf/run`
   (`~/lf` is a symlink to the runtime dir). Both config files also
   exist at `~/.config/containers/` (those copies survived the VM
   replacement; the `/etc` copies did not and were restored from them).

With those three settings, `podman run --network=host hello-world`
passed (exit 0) and image pulls worked.

## 3. The two environmental walls (and how they were beaten)

**(a) Egress bandwidth is a small shared cap.** Measured: apt ~112 kB/s;
a single registry stream ~263 kB/s alongside other traffic; four
parallel streams ~38 kB/s **each** (~152 kB/s aggregate — parallelism
does not scale it). Podman pulls of postgres (461 MB), redis (116 MB)
and clickhouse (872 MB) succeeded in a fast window (20:36–21:03 UTC);
later pulls crawled at 30–150 kB/s.

**(b) btrfs quota (EDQUOT).** From ~21:56 UTC, writes began failing
with `disk quota exceeded` inside podman pulls — while `df` showed
48 G free. `/home` is btrfs; with `~/workspace` at 126 GB logical
across tenants, the shared subvolume quota is effectively full and
headroom **fluctuates** as tenants write and delete (200 MB test
writes succeeded minutes after podman EDQUOTs; `btrfs qgroup show`
itself is not permitted in this cell). All three remaining podman
pulls (worker, web, minio) died on EDQUOT in pull round 2
(`evidence/pull2.log`).

**Countermeasure that worked — resumable OCI fetch + local assembly**
(scripts kept in the runtime dir: `fetch-oci.sh`, `fetch-web2.sh`,
`fetch-minio.sh`, `oci-convert.py`):

- Blobs were downloaded with `curl -C -` (byte-resume) straight from
  the registries (Docker Hub for langfuse images, cgr.dev for minio),
  each blob verified by sha256 against its manifest digest. Quota
  closures and bandwidth collapses only paused progress — never lost
  it. The worker's 298.6 MB blob alone took 17 attempts.
- One blob was even salvaged mid-flight: the 60.7 MB worker layer
  copied out of podman's dying staging dir hash-verified exactly
  against the manifest, and 128 MB of the big blob was banked as a
  resumable prefix.
- Images were assembled as OCI layouts and imported locally.
  Podman/skopeo's OCI source refuses docker-schema2 manifests
  (`matches unsupported manifest MIME types`), so `oci-convert.py`
  rewrites only the manifest JSON's media types to OCI types (blob
  bytes untouched; converted worker manifest verified — its pre-
  conversion digest matched the registry index digest exactly).
- Result: worker imported ~22:57 UTC (1.36 GB), web 23:39 (1.14 GB),
  minio 23:41 (170 MB) — all tagged with their canonical upstream
  names, so the compose file uses the exact upstream image references.

**VM replacement (23:13 UTC).** Mid-web-download the VM was replaced
(uptime reset; root overlay wiped: podman binaries and `/etc/containers`
gone; all processes killed). **Everything on `/home` survived**: image
store (2.8 GB), OCI layouts, compose, `.env`, evidence. Recovery took
~25 minutes: `apt-get update && apt-get install -y podman
podman-compose skopeo`, restore the two `/etc/containers` files from
`~/.config/containers/`, and `podman images` listed all previously
imported images again. The exact recovery commands are in §6 —
**they will be needed after every VM replacement.**

## 4. Compose configuration summary

File: `runtime/langfuse/docker-compose.yml` (derived from upstream's,
saved alongside as `docker-compose.upstream.yml`). Services and images
(identical to upstream): langfuse-web `docker.langfuse.com/langfuse/
langfuse:4`, langfuse-worker `…/langfuse-worker:4`, postgres:17,
clickhouse/clickhouse-server:25.12, redis:7, cgr.dev/chainguard/minio.

Honest deltas from upstream, all recorded in the file's header:

- `network_mode: host` on every service (bridge is blocked, §2.1);
  service-name URLs rewired to `127.0.0.1` ports. Minio API/console
  moved to **9090/9091** so it cannot collide with ClickHouse's
  native port 9000 on the shared host namespace.
- Named volumes → bind mounts under `runtime/langfuse/data/`
  (postgres / clickhouse / clickhouse-logs / minio / redis), with
  ownership set for the non-root services (clickhouse 101:101,
  minio 65532:65532, redis 999:999).
- No `mem_limit` (proven unenforceable in this cell, §2.2 — tried
  first, removed with the reason written in the file).
- `restart` left unset/"no" by podman-compose default handling here —
  good-citizen choice on a shared VM; start is one command (§6).
- `TELEMETRY_ENABLED=false` (the local instance phones nothing home).
- Secrets are **locally generated dummy values** in
  `runtime/langfuse/.env` (mode 600) — random per-service passwords,
  SALT, ENCRYPTION_KEY, NEXTAUTH_SECRET. They are not real credentials
  for anything else. Evidence logs were scrubbed of these values.
- **`LANGFUSE_MIGRATION_V4_WRITE_MODE=dual`** on web+worker. v4's
  default (`events_only`) rejects legacy `trace-create` ingestion
  (verified live: 400 "Event type not accepted"). `dual` is upstream's
  own documented bridge: legacy ingestion payloads (what Wielder's
  exporter produces) **and** the OTEL endpoint are both accepted.
  Verified end-to-end after setting it (see verdict).

## 5. Connection recipe (for the exporter worker)

- **Base URL:** `http://localhost:3000`
  - ⚠️ Use `localhost`, **not** `127.0.0.1`: the web process binds to
    the machine hostname, which resolves to IPv6 loopback only —
    `127.0.0.1:3000` is refused; `localhost:3000` and `[::1]:3000`
    work (verified).
  - ⚠️ From inside this VM's shell tooling, bypass the egress proxy
    for local calls (`curl --noproxy '*'`); the proxy env otherwise
    hijacks even local requests.
- **Organisation / project (already created):** org `Wielder Local`
  (`wielder-local-org`), project `wielder-telemetry`
  (`wielder-local-project`), admin user `wielder@langfuse.local`.
  They were seeded at first boot via upstream's `LANGFUSE_INIT_*`
  mechanism from `.env` — no UI clicks were needed. More projects/keys
  can be created in the UI after signing in as that admin, or via
  `POST /api/public/projects` with an admin session.
- **Project API keys:** the public/secret key pair for
  `wielder-telemetry` is recorded **only** in
  `runtime/langfuse/LOCAL-KEYS.txt` (mode 600) — **that file, `.env`,
  and this whole runtime dir are EXCLUDE from any landing package.**
  Auth is HTTP Basic: public key as username, secret key as password
  (e.g. `GET /api/public/projects` → 200, verified).
- **Ingestion:** `POST /api/public/ingestion` (legacy batch payloads)
  works because of dual write mode (§4); expect HTTP 207 with
  per-event 201s, and ~15–60 s before a trace is readable via
  `GET /api/public/traces/<id>` (async worker → ClickHouse path).
  OTEL traces can alternatively go to `POST /api/public/otel/v1/traces`.
- Worker service port 3030 (health/metrics) listens on `[::1]:3030`;
  ClickHouse 8123/9000, Postgres 5432, Redis 6379, Minio 9090/9091
  are all on the host loopback/LAN addresses via host networking —
  **do not expose them beyond this VM**; only port 3000 is the
  intended surface, matching upstream's own guidance.

## 6. Start / stop / recover commands

All commands assume the toolchain is installed (it currently is;
after a VM replacement it will not be — run the recovery block first).

```bash
# --- recovery after a VM replacement (root overlay is wiped each time;
#     /home, including the image store, survives) ---
apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  podman podman-compose skopeo
mkdir -p /etc/containers
cp ~/.config/containers/storage.conf   /etc/containers/storage.conf
cp ~/.config/containers/containers.conf /etc/containers/containers.conf

# --- normal start / stop ---
cd ~/workspace/wielder-parity2/runtime/langfuse
export TMPDIR=$PWD/tmp
podman-compose up -d        # start (waits for infra, then web+worker)
podman ps                   # status (ignore the "unhealthy" labels — §2.2)
./check-health.sh           # real health proof (HTTP probes + ps)
podman-compose down         # stop (data/ bind mounts persist)

# --- if the images are ever lost but the OCI layouts remain ---
python3 oci-convert.py oci-worker 7a96801ecb291758785d68bb388b628d6cdff3ee67553c432b63244b008d4a47 4
podman pull oci:$PWD/oci-worker:4   # then tag to docker.langfuse.com/langfuse/langfuse-worker:4
# (web: manifest digest 5338ee88d4ec07028836f6af9d98a9b411f8eeda0ad9fae66502d849b04da724;
#  minio is OCI-native — podman pull oci:$PWD/oci-minio:latest, tag cgr.dev/chainguard/minio:latest)
```

## 7. Resource footprint (measured with the stack running, 2026-10-29 ~00:00 UTC)

Per-service RSS from host `ps` (podman stats is unavailable in this
cell, §2.2):

| Service | RSS |
|---|---|
| langfuse-web (next-server) | ~703 MB |
| clickhouse-server | ~482 MB |
| langfuse-worker (node) | ~337 MB |
| postgres (main + backends + helpers) | ~156 MB |
| minio | ~83 MB |
| redis | ~9 MB |
| **Total stack** | **≈ 1.8 GB RSS** |

VM totals with the stack up: 7.7 GiB RAM, ~2.9–3.3 GiB still
available; load is dominated by other tenants. Disk: image store
4.1 GB + data 109 MB + OCI layouts 703 MB ≈ **4.9 GB** under
`runtime/langfuse/` (device: 50 G free, but the shared btrfs quota —
not device space — is the binding constraint, §3b).

**Decision: stack left RUNNING.** ~1.8 GB RSS on an 8 GB VM with
~3 GB headroom is modest, and a telemetry mirror that is down mirrors
nothing. If the VM gets tight, `podman-compose down` (§6) — data
persists in `data/`.

## 8. Honest limitations / notes for the parent lane

- Healthcheck status fields and `podman exec` do not work in this
  cell (cgroup delegation absent). Any future automation must probe
  HTTP/processes, not `podman ps` health labels.
- The worker logged transient Redis "Socket timeout" queue errors
  during the post-restart window (23:57 UTC); the ingestion job itself
  then succeeded and the trace landed. Worth the exporter treating
  Langfuse writes as retryable — consistent with a mirror whose system
  of record remains Wielder's SQLite ledger.
- `docker.io/library/4:latest` and `docker.io/library/latest:latest`
  tags in `podman images` are podman's OCI-import naming artefacts
  for the web and minio images; the canonical tags
  (`docker.langfuse.com/langfuse/langfuse:4`,
  `cgr.dev/chainguard/minio:latest`) point at the same image IDs and
  are what compose uses.
- The stack does **not** survive a VM replacement on its own:
  containers and the podman install die with the overlay; images,
  data, and config sources survive on `/home` and §6 restores service
  in ~5 commands. Making it replacement-proof (e.g. a systemd unit
  that reinstalls + relaunches) was out of scope for this task.
- Nothing was pushed anywhere; no GitHub changes; `wielder-home` and
  ports 8897/8899 untouched throughout.

## 9. Evidence index (`runtime/langfuse/evidence/`)

- `recon.txt` — full recon notes (runtimes, caps, cgroups, bandwidth
  and quota measurements)
- `pull.log`, `pull2.log` — podman pull rounds (3 OK; EDQUOT failures)
- `fetch-oci.log`, `fetch-web2.log`, `fetch-minio.log` — resumable
  blob fetch + assembly + import records (sha256-verified per blob)
- `apt-*.log` — package installs incl. post-VM-replacement reinstall
- `compose-up*.log` — launches (first: mem_limit failure; second: up;
  third: dual-mode recreate) — secret values scrubbed
- `health-20261029T000000Z.txt` — final health proof (all probes 200)
- `api-proof.txt`, `api-proof2.txt` — projects-by-key, ingestion 201,
  trace readback 200; `smoke-trace-id.txt`, `web-ui.html`
