# Hosting the grok-local PWA

The app is a static folder (`pwa/`) — no build step, no server code.
Host it anywhere static; the chat traffic goes from the phone's
browser straight to the seat endpoint.

## Option 1 — Netlify (drag and drop)

1. Go to app.netlify.com → Sites → "Add new site" → "Deploy manually".
2. Drag the `pwa/` folder onto the page. Done — you get an
   `https://<name>.netlify.app` address.
3. Open it on the phone → browser menu → "Add to Home screen".

## Option 2 — GitHub Pages (from this repo)

1. In the repo: Settings → Pages → deploy from branch, pick the PR
   branch (or main once merged) and the `/show/production/wielder/
   grok-local/pwa` folder is NOT directly selectable — Pages serves a
   branch root or `/docs`. Practical route: copy `pwa/` into a small
   separate public repo (e.g. `grok-local-app`) and enable Pages on
   it. The app holds no secrets, so a public app repo is fine.
2. Open the Pages URL on the phone → "Add to Home screen".

## The rules that make this work

- **HTTPS is required.** Installability, the service worker and
  WebGPU (mode B) all need a secure context — both hosts above give
  HTTPS by default. A LAN `http://` address will load the page but
  will not install and mode B will refuse.
- **CORS is already open on the seat.** `launch.sh` starts vLLM with
  `--allowed-origins "*"` (all three seat kinds), so the browser may
  call it cross-origin. That is deliberate: the API key, not the
  origin, is the lock.
- **The endpoint key lives on the phone.** The key typed in Settings
  sits in the phone browser's localStorage and is sent as a Bearer
  token. Anyone who obtains the key can use the seat until the seat
  restarts with a new one — treat it like a password, and remember a
  free seat mints a fresh key every session anyway.
- **The rendezvous token is read-only in effect.** Use an HF token
  that can read the private rendezvous dataset. Ideally create a
  dedicated fine-grained token scoped to that dataset. It also sits
  in localStorage on the phone.
- **Quick-tunnel seats cannot stream.** The Cloudflare quick tunnel
  does not support SSE, so the app automatically falls back to
  whole-answer replies on free seats (it tries streaming first, then
  retries non-streamed). Serverless/rented seats with a direct HTTPS
  endpoint stream normally.
