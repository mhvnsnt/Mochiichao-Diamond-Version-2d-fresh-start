# TEARDOWN (compact) — The phone line: cloudflared + frp (rendezvous transport)

Part of the [Fabless Stack](FABLESS-STACK.md). A seat behind NAT (a Kaggle
session, a home box, a phone hotspot) has no public address. The tunnel is
what gives it one: the seat dials *out* to a rendezvous point, and clients
reach it there. This is the transport the whole Virtual Seat rotation
(grok-local) and our endpoint rendezvous stand on.

## cloudflared — the managed option

- **What it is:** Cloudflare's tunnel client: `cloudflared` on the seat opens
  outbound connections to Cloudflare's edge; a public hostname routes back
  through them. No inbound ports, no public IP needed.
- **Licence/terms, honestly bucketed:** the client is **Apache-2.0**
  (cloudflare/cloudflared). The tunnel *network* is **free proprietary**:
  Quick Tunnels (`trycloudflare.com`) are documented by Cloudflare as
  testing/dev only — no SLA, ~200 concurrent in-flight requests, no SSE
  support; named tunnels are free with a Cloudflare account and a domain on
  Cloudflare DNS; Zero Trust free tier covers ≤50 users. Good enough for our
  rotation seats; the limits above are the real ones and they're written in
  the config template's comments.
- Templates in `tunnel/cloudflared/`.

## frp — the fully open option

- **What it is:** `fatedier/frp`, a fast reverse proxy: `frps` runs on any
  small public-IP box we control, `frpc` on the seat dials out to it; TCP/
  HTTP(S)/UDP forwarding, token auth, dashboards.
- **Licence: Apache-2.0**, v0.71.1 current (verified at source 2026-10-28),
  actively maintained.
- **The trade:** no third-party network or terms at all — but the relay box
  is ours to run (a seat with a public IP). If a future always-on box exists,
  frp removes the Cloudflare dependency entirely; until then cloudflared's
  free edge is the rendezvous.
- Templates in `tunnel/frp/`.

## Wiring status

- Templates landed in `tunnel/`; both are config-validated (parsed), neither
  can be end-to-end proven from this VM (no seat + client pair to connect).
  First-run proof = the grok-local Kaggle notebook's tunnel step, which uses
  exactly this pattern.
- **Plugs into programmes:** Wielder's seat endpoints and the grok-local PWA
  both consume rendezvous URLs produced by this layer; the show pipeline's
  remote seats would use the same templates.
