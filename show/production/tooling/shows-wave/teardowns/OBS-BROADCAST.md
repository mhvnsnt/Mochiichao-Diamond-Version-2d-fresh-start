# TEARDOWN — OBS Studio: the broadcast/delivery layer

**What it is:** OBS Studio (OBS Project) — the open-source
compositor the streaming world runs on: scenes made of sources
(media files, images, text, captures), arranged on a canvas,
switched live or recorded, with profiles holding the output
settings. **Licence (verified at source 2026-10-28): GNU GPL-2.0.**
Free for any use including commercial; no watermarks, no feature
limits.

**Why it belongs in this pipeline:** the show's last mile has two
shapes — file delivery (the episode master + web copy, gated by
loudness and now VMAF) and *presentation*: premieres, review
sessions, festival/online screenings, and the "broadcast" furniture
the show already designs on paper — title cards, eyecatches,
intertitles, next-time cards, credits. OBS is the industry-default
machine for that second shape, and — the part that makes it wireable
rather than just installable — **its entire configuration is data**:
profiles are INI/JSON settings, and a scene collection is a single
JSON document listing every scene, source, transform, and
transition. A house broadcast profile can therefore live in this
repo as reviewed, versioned data, exactly like the OCIO config in
the lighting cluster.

**What this package wires:**

- `../obs/obs-house-scene-collection.json` — a scene collection in
  OBS's own JSON format: one scene per piece of house furniture
  (see OBS-PROFILE.md for the mapping), media sources pointing at
  the episode export paths by convention, card scenes driven by
  image sources so a card swap is a file swap, and the episode
  playback scene on an ffmpeg media source.
- `../obs/obs-house-profile.json` — the profile-side settings as
  data (canvas/output 1280×720 @ 24 fps to match the house master
  format, recording in MKV→MP4 remux discipline, streaming fields
  left as named blanks — no service or key is invented).
- `../obs/OBS-PROFILE.md` — how the scenes map to the show's card
  systems, and the operating notes.

**Honest status:** OBS is **not installed on this VM** (no display
seat; a headless install proves nothing about the broadcast use),
so the profile is *authored data, JSON-validated*, not an exported-
from-a-running-OBS artifact. First-run proof owed: import both
files on a machine with OBS (owner's machine), confirm every scene
resolves its sources, and record the OBS version used. Until then
this row is PARTIAL by design, and the map says so.

**Format facts relied on (from OBS's own formats):** a scene
collection JSON carries `name`, `sources[]` (each with `name`,
`id` — e.g. `ffmpeg_source`, `image_source`, `text_ft2_source`,
`scene` — `settings`, `flags`, `volume`, `enabled`), `scene_order`,
`groups[]`, `transitions[]`, and bookkeeping keys
(`current_scene`, `current_program_scene`, `name`). Tools that read
or write these JSON files are not derivative works of OBS (the
project's own forum states this plainly), so house tooling may
generate collections without GPL entanglement; OBS itself, when
run, is GPL-2.0 software used unmodified.

## Sources

- OBS Project (GPL-2.0; features/formats): https://obsproject.com
- OBS scene-collection JSON in the wild (migration/verification
  tooling reading the format): https://obsproject.com/forum/threads/obs-migration-tool.142542/
- House card systems the scenes map to: `show/production/`
  (intertitle-craft format, eyecatch records — see OBS-PROFILE.md)
