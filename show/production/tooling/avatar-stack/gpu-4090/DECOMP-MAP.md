# Decomp map — commercial feature -> our name -> pack file -> status

Clean-room functional equivalents only, per the repo's own header
rule (`platforms/FREE-EQUIVALENTS.md`): "every capability on the
commercial list gets a CLEAN-ROOM functional equivalent built from
free parts, under OUR names, wired into this repo. No paywall
bypass, no cracked/leaked anything, no hosted proprietary models
with the branding stripped."

**There is no decompiled Seedance to map from.** Seedance 2.5 is a
closed, hosted ByteDance model: no weights published, no local file
or binary to decompile, no reverse-engineered copy exists; repos
with Seedance in the name are prompt collections, skills or API
wrappers (extraction §1, OPEN-STUDIOS "Confirmed fact"). What was
reverse-engineered is the **function** — from the providers' own
docs, help centres and terms, verified 2026-10-28 (extraction,
VERIFIED-PLATFORMS header).

## Packs — two different things (owner clarification, 2026-10-28)

This distinction governs every "packs" row below, and it corrects
the earlier reading in extraction §7.1:

- **Reference packs are STILLS.** Per character they hold different
  views, angles and perspectives. They are **not** single-view, and
  they are the **source of truth** for what a character looks like
  from any view.
- **Video packs are MOVING clips.** The "only one view" limitation
  belongs **here, and only here**: the video packs currently hold
  one view per character.
- **Production method:** a video pack gains an extra view **from
  the reference-pack stills** — the still for that view is the
  source the moving version is built from. A new view is **never
  generated from nothing**, and never invented by the video model.

So wherever this map (or the extraction behind it) said "packs are
front-view only / other views are missing", read it as: the
**video** packs hold one view today; the **reference** packs
already hold the views, and the work is deriving the moving
version from those stills — not creating views.

| Their feature (verified function) | Our name | Implemented by (this pack / repo) | Status |
|---|---|---|---|
| **Elements** — Higgsfield/Kling reusable saved reference assets, called into prompts (Kling: built from a video or 2-4 images; library caps by tier) | **Reference Packs** | Per-character canon packs (repo `reference-packs/`): **stills holding different views, angles and perspectives per character**; consumed in this pack as the `reference_image` / start image + `reference_sha256` per character in `jobs/scene_job.4090.example.json`, hash-checked by repo `parity/preflight.py` logic in `run_scene.py` | Reference packs are **multi-view stills and the source of truth for any view**. The single-view limitation is in the **video packs only**. Extra views in motion are derived **from these reference stills, never generated from nothing** (owner clarification 2026-10-28, section above — this supersedes extraction §7.1's "packs are front-view only" wording) |
| **Soul ID** — Higgsfield persistent trained identity (~20+ photos; marketed for photoreal faces; flat-2D performance NOT evidenced on their pages) | **Cast Lock** | Reference pack (**stills, multi-view** — see Packs section above; the still matching the shot's view is the one fed to the lock) + VACE reference control + per-character LoRA as one system: `workflows/workflow-i2v-locked.json` (reference wire ENGAGED, `TrimVideoLatent` connected) + `run_scene.py` preflight/gates | Components wired, preflight-tested 14/14 in repo; **locked end-to-end run PENDING / UNPROVEN** (extraction §7.3). LoRA half is **blocked by the base mismatch** — existing LoRAs are Wan2.1-1.3B and do not load in the 5B scene (extraction §7.2) |
| **Hosted multi-shot in one generation** — Kling Multi-Shot / Seedance multi-shot (ByteDance itself flags multi-subject stability limits) | **Shot Groups** (+ per-character generation as the production answer) | `jobs/scene_job.4090.example.json`: `multi_shot_group` per scene + one generation job **per character per segment**; chaining by repo `freedom/chain_segments.py` via `run_scene.py`. MultiShotMaster (Apache-2.0) kept as the single-pass eval slot in MODELS-MANIFEST | Wired as job format + chaining. **The owner-locked method deliberately does not ask one generation to hold multiple characters.** MultiShotMaster: eval slot, not yet run |
| **Hosted speed** — minutes-per-clip hosted turnaround (no provider publishes a generation-time figure; both speed claims UNVERIFIED at source, extraction §§1-2) | **Fast Lane** | `workflows/workflow-turbo-fixed.json` (Turbo LoRA, 4 steps, cfg 1.0, torch.compile settings node, offload flags on) | Measured short test only: **78.5 s vs 1,787.6 s native (22.8x)** on the Kaggle seat. **Scene-scale and 4090-scale: UNPROVEN.** Turbo LoRA licence: RECHECK before commercial ship |
| **Reference-to-video fidelity** — Seedance/Kling reference modes | **VACE reference lock** now; **Phantom-Wan** eval slot | Locked workflow (above); Phantom-Wan 1.3B (Apache-2.0, 1-4 refs) in MODELS-MANIFEST as the fallback slot if VACE underperforms | VACE: wired, run pending. Phantom: **eval slot, not yet run; VRAM UNVERIFIED** |
| **Native audio inside generation** — Seedance/Kling synced audio in the same pass | **Voice & Music Lanes** | NOT in this pack's graphs: Chatterbox (MIT) / Kokoro (Apache-2.0) voices + ACE-Step music are laid in at composite in the repo's audio lanes; creatures = cries, humans = speech. HuMo (Apache-2.0) is the repo's eval slot for audio-driven HUMAN dialogue only | Repo lanes staged (prior rounds, extraction §5); **outside this pack's scope — no audio step is claimed by run_scene.py** |
| **Platform character-sheet generators** | **Sheet Assembly** | The views already live in the **reference packs (stills: different views, angles, perspectives per character)** — they are not generated here. Sheet Assembly in this stack means: pick the reference-pack still for the view a shot needs, and build the video pack's moving version **from that still** | **Method (owner, 2026-10-28): video packs gain extra views FROM the reference-pack stills; a view is never generated from nothing.** Any edit to a still is made from an existing reference still, not invented — and the earlier "missing views GAP-flagged / generate the views" framing (extraction §§5, 7.1) is superseded by this clarification |
| **Higgsfield studio UI** — hosted studio surface | **Job Desk pattern** | This pack's form of it: ComfyUI headless (8188) + declarative job files (`jobs/`) + `run_scene.py`. Pattern after wide-trace/open-higgsfield — **pattern only: both open-studio repos carry NO licence file, so no code was adopted from either** (extraction §5) | Pattern implemented as job/runner files in this pack |
| **Seedance prompt engineering** — the prompt math the hosted model expects | **Prompt Compiler patterns** | Repo `platforms/PROMPT-PATTERNS.md` (reference role map, timestamp beats, failure-diagnosis rewrite loop), adapted from allenGKC/Seedance-2.5 (MIT) and ZeroLu/awesome-seedance-2.5 (MIT), with attribution; the per-segment `action` text + style-lock wording in `jobs/scene_job.4090.example.json` follows that spine and the prompt text already inside the two repo workflows | Patterns landed in repo; **prompt-extension model (Qwen2.5-VL-7B) wired but not yet exercised in a run** (extraction §7.7) |
| **Hosted fast iteration (LTX-class)** | **Fast Iteration (eval)** | Profile only in the repo (`ltx-fast-iteration`); in this pack: **listed in MODELS-MANIFEST as eval/refused, never downloaded, never shipped** | LTX code Apache-2.0 / **weights free-but-restricted** (LTX community licence); LTX-2 needs 32 GB+ VRAM at official spec — not a 4090 production engine |
| **API wrappers for the hosted models** (SamurAIGPT/Seedance-2.5-API MIT, higgsfield-ai/cli MIT, ai-models-lab/seedance-2.5 no licence file) | *(none — adapter specs only)* | Repo `platforms/` job profiles only. Backends are paid (MuAPI / Volcano Ark / Fal / Replicate / a Higgsfield account). **No accounts, no keys, nothing in this pack calls them** | Bucket: **paid**. Deliberately not wired as engines |
| **Multi-character in one scene** (the weak point every hosted model flags) | **Owner-locked per-character method** | `jobs/` + `run_scene.py`: generate each character separately (same scene prompt + timing map) -> gate -> cut out background (`white_matte.py` primary / BiRefNet backup) -> overlay on the **living** background plate -> post (shadows at composite, then grade) | Method locked 2026-10-28 (extraction §4). Composite wiring proven locally in repo on a still test (Gate v2-living md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31`); **generated composite pending a proven generation run** (extraction §7.5) |

## Refused, by name (from the repo's own refused lists)

Leaked/cracked copies of Seedance, Kling, Veo or Higgsfield
internals (none sought, found or used); watermark strippers; the
"bypass IP/copyright filters" tutorial class; Qwen-Image-2.1
(Qwen Research License, non-commercial); MiniMax H3 (region
exclusions); SkyReels-V3 (free-but-restricted, eval only);
ElevenLabs as a Seedance route (hosting true, free-tier usability
not true as claimed — the working free Seedance *test* route in the
repo is Dreamina, scratch only). See MODELS-MANIFEST for the
licence-bucket treatment of LTX-2, LTX-0.9.x and Hunyuan.
