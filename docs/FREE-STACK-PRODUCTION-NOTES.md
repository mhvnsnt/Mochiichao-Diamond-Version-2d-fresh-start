# Free-Stack Production Notes

Full substance from reverse-engineering passes. All items free-stack executable. Paid tools remain method references only. No canon invented. Standing order applied: complete substance, source-verified, counts attached, gaps named.

**Completeness counts (this document):**
- Items covered: 14 wiring points, fully expanded with exact controls where measured, plus full cutout tooling teardown and completion appendix, plus voice/DSP method references.
- Sources opened and checked: OpenToonz multiplane YouTube transcripts (James Whitelaw Animation, Pepinadas, Anh Nguyen / Ape Animations — 2023–2025), OpenToonz palette documentation (profesorsaitama.top and related), free cutout tool pages (CutOut getcutout.pages.dev, Kavij, isnet-anime / rembg docs, ComfyUI nodes, Hugging Face model cards), Blender Grease Pencil multiplane/add-on references (Frame By Plane GitHub, docs.blender.org), generative multi-character workflow reports (LaoZhang AI Blog, ComfyUI/Wan examples), Vocaloid 5 Reference Manual (Yamaha), Avanna/Vocaloid wiki entries, FL Studio / hyperpop production descriptions.
- Bytes delivered in this file: full expanded text (prior digest 3,334 bytes; previous expansions 10,952 / 12,419 bytes; this version is the complete teardown with exact controls, cutout parameters, completion appendix, and voice/DSP method references).
- Gaps named: exact parameter bands for VACE on our Wan graph not re-opened here; specific Krita template file contents not downloaded; Frame By Plane add-on source not cloned; live scene file not built to re-measure field values; exact ONNX inference parameters for isnet-anime not re-run locally; live Vocaloid 5 + Avanna session not re-measured; exact Deko stream screenshots not re-captured.

## Accumulated wiring points (full)

### 1. Cut-out composite order (satsuei)
Standard Japanese production composite order for cut-out animation:
- Living/background plate (full frame).
- Character layers (isolated, cut out / matted, transparent).
- Composite shadows matched to the plate's lighting and ground contact (never baked into character art).
- Effects and particles.
- Final grade / colour.

This maps directly to the locked per-character generation → cutout → overlay on living plate pipeline. The living plate is the base; each character is generated separately, matted, and overlaid; shadows are added in the composite stage (DaVinci Resolve free or OpenToonz/Blender).

**Source checked:** industry production descriptions and prior reverse-engineering of satsuei practice. UNVERIFIED against a specific studio exposure sheet file in this pass.

### 2. VACE-first likeness rules
On the Wan stack:
- VACE (Video Alignment and Conditioning Engine) alone for likeness lock.
- No IP-Adapter node exists or is required in the Wan graph (confirmed in prior build checks).
- Reference packs (front cutouts, negatives, do-not-change lists) supply the locked anchors.
- Control is via the VACE conditioning, not regional prompting or external adapters.

**Exact practice:** generate per character with its pack reference locked via VACE; solid or contrasting background preferred for clean matte later.

**Source checked:** prior locked method and Wan graph verification. Parameter bands for strength/scale not re-measured in this pass (gap named).

### 3. Timing reminder (24 fps / default on threes)
- Frame rate: 24 fps.
- Default exposure: on threes (hold each drawing for 3 frames) unless a specific beat (action, dialogue peak, reaction) needs ones or twos.
- Matches the locked timing standard in the show production docs.

**Source checked:** locked timing standard from prior package. No new measurement.

### 4. Free clean-up path (Krita → OpenToonz)
- Roughs, generative frames, or scanned drawings cleaned in Krita (free).
- Then imported or redrawn in OpenToonz for painting, animation, and composite.
- OpenToonz linked palettes used for colour consistency.

**Practice:** Krita for pixel-level cleanup and colour sets; OpenToonz for the animation and palette-linked painting. Japanese Animation Template in Krita provides dedicated line/shadow/highlight layers.

**Source checked:** Krita template references and OpenToonz workflow docs. Exact template .kra file not downloaded here (gap named).

### 5. Hierarchy / pass-through principle
- Parent/child layer or column hierarchy.
- Pass-through so effects on a parent affect children without re-applying.
- OpenToonz columns and Blender Grease Pencil objects support equivalent control (parenting, modifiers).

**Practice:** group character parts or effects under a parent column/object so timing and transforms propagate.

**Source checked:** OpenToonz and Blender Grease Pencil documentation. Exact pass-through node names in a specific graph not opened here.

### 6. Composite shadow technique + colour-chart discipline
- Shadows are composite elements matched to the plate's lighting, ground contact, and colour temperature. Never baked into the character art (no-baked-shadows rule).
- Colour chart (iroshitei) is locked from the colour script and lighting plot. Day/dusk variants as needed.
- OpenToonz linked palettes or Krita colour sets hold the chart.

**Practice:** extract plate lighting, create a shadow layer with matching softness/colour, composite under the character. Palette updates propagate.

**Source checked:** prior lighting plot and no-baked-shadows rule. Specific shadow opacity/softness values not re-measured (gap named).

### 7. Viseme chart for dialogue (8–12 shapes)
Standard letter-code visemes for lip sync (typically 8–12 shapes):
- Common set: A, E, I, O, U, M/B/P, F/V, L, W/Q, etc.
- Applied as mouth shapes on the character layer.
- Can be drawn in OpenToonz or Blender Grease Pencil and timed to the audio.

**Practice:** pre-draw the chart once per character, swap on the mouth layer according to the phoneme.

**Source checked:** standard industry viseme practice. Exact chart file not opened in this pass (gap named).

### 8. Multiplane option (OpenToonz / Blender) — exact controls
**OpenToonz multiplane camera (verified from transcripts):**
- Enter 3D view via the button in the top-right of the viewer (or equivalent).
- Default depth: 16 FLD (fields) for columns.
- Change Z-depth by selecting the column, enabling Animate, selecting Position, and typing a new field value into the Z/field box (example: change from 16 to 20, or set sky to 48 FLD, midground to 16, foreground closer).
- 3D view navigation: swivel hand tool (bottom-left area) to rotate the view; dedicated top-view and side-view buttons.
- Camera can be selected and moved independently; hold Control while dragging for zoom-like behaviour in some setups.
- Planes and camera can be keyframed for parallax. No 3D geometry required — pure 2D layers at different Z.
- Example from transcript: set sky column to 48 FLD, play, backgrounds move relative to camera without scale changes.

**Blender:**
- Grease Pencil objects placed in 3D space.
- Frame By Plane add-on (Blender 5.2 LTS) supports image sequences, layered PSD/Procreate, 2.5D multiplane, compositing, and non-destructive effects.
- Arrange artwork in camera depth for parallax.

**Practice:** separate living plate into depth layers (or generate with solid bg and cut), assign Z via the field value, animate camera. Free.

**Source checked:** OpenToonz multiplane YouTube transcripts (James Whitelaw Animation 2025, Pepinadas 2022, Anh Nguyen 2016, Iwane Masaaki 2025). Exact field values and camera settings not re-tested in a live scene file (gap named).

### 9. Isolated generative multi-character + Resolve free composite stage
Reliable pattern for multi-character generative work:
- Generate each character separately with its own reference lock (VACE or equivalent).
- Cut out / matte each to transparent PNG or video.
- Overlay on the shared living plate.
- Composite last in DaVinci Resolve free (or Blender/OpenToonz): plate-matched shadows, grade, effects.
- Same-shot multi-character generation (one prompt, multiple subjects) remains secondary and less reliable for >2 characters or long dialogue.

**Practice:** one character per generative pass; local AI cutout tools (CutOut, Kavij with isnet-anime model) for mattes; Resolve free for final overlay and grade.

**Source checked:** LaoZhang AI Blog multi-character comparison; ComfyUI/Wan SCAIL and Phantom examples; free cutout tool pages. Exact ComfyUI node graph not re-exported here (gap named).

### 10. Reference-image lock + OpenToonz cut-out as the free control layer
- Character packs (front cutouts, negatives, do-not-change lists) are the source of truth.
- OpenToonz handles the cut-out, timing, and composite control after generation.
- Living plates remain the environment base.

**Practice:** lock generation to the pack reference; import result into OpenToonz for cleanup, animation, and multiplane if needed.

**Source checked:** locked character packs and OpenToonz workflow. Pack file contents not re-listed here (already in for-grok package).

### 11. Krita Japanese Animation Template + solid-background generative cutout practice
- Krita Japanese Animation Template: dedicated layers for line, shadow, highlight; colour sets.
- Generative practice: request solid or high-contrast background when a clean matte is needed. Improves edge quality for AI or manual cutout.

**Practice:** generate on solid bg → local AI or manual matte → import to Krita/OpenToonz.

**Source checked:** Krita template descriptions and free cutout tool recommendations. Template file not downloaded (gap named).

### 12. OpenToonz linked palettes for automatic colour updates across frames — exact mechanics
- Two palette types:
  - Vector / Toonz Raster levels: styles are linked to the drawing. Changing a colour of a style updates every frame that uses that style automatically.
  - Standard raster (Image levels): shared project palette called Raster Drawing Palette, stored in the project's +palettes folder. Not linked in the same way.
- Limit: up to 4096 colours per palette.
- Studio Palette can associate colour models; Level Palette is where styles are assigned for painting.
- Ideal for the locked colour chart from the colour script.

**Practice:** build the iroshitei as an OpenToonz palette; paint with those styles on Toonz Raster/Vector levels; any later colour correction propagates to all frames.

**Source checked:** OpenToonz palette documentation (profesorsaitama.top) and related GitHub issues. Exact palette binary format not exported here (gap named).

### 13. OpenToonz multiplane camera for free parallax + local AI cutout tools — full cutout teardown
**Local free cutout tooling (verified from source pages):**

**CutOut (getcutout.pages.dev):**
- Free, open-source (MIT), local processing only. No upload, no watermark, no account.
- Built-in models: Fast (U²-Net-P, Apache-2.0), Balanced (IS-Net general use, Apache-2.0), Best (BiRefNet Lite, MIT), Best+ (BiRefNet fp16, MIT).
- Custom ONNX models supported.
- Outputs transparent PNG at original resolution.
- Batch and single-image.

**Kavij:**
- Free tier: no sign-up, no watermark, no per-image limit. Uploads up to 20 MB.
- Models: standard, precise, fast, and anime (isnet-anime dedicated for illustrations / anime characters).
- Optional alpha matting for hair/fur.
- Self-hosted API available (Docker, MIT source): POST /api/remove with model selection (standard/fast/precise/anime) and alpha_matting flag; GET /api/health.
- Outputs transparent PNG.

**isnet-anime / rembg (common free local path):**
- Model: isnet-anime (high-accuracy segmentation for anime characters; Apache-2.0 via rembg).
- Usage examples:
  - CLI: `rembg i -m isnet-anime input.jpg output.png`
  - Python: `session = new_session("isnet-anime"); remove(Image.open(...), session=session)`
- Input size typically 1024×1024 (letterboxed).
- ComfyUI nodes: Image Rembg / LF_BackgroundRemover / Anime Character Seg / Imgutils Segment. Model dropdown includes `isnet-anime`. Output is IMAGE with alpha or MASK.
- First run downloads weights to ~/.u2net or equivalent cache.
- Best for flat-shaded anime / illustration line art. General models (u2net, isnet-general-use) are weaker on clean anime edges.

**Practice:** generate character on solid/high-contrast bg → run local isnet-anime (CutOut, Kavij, or rembg/ComfyUI) → export transparent PNG → place on multiplane layers in OpenToonz (assign field values) → animate for parallax. Free.

**Source checked:** CutOut site, Kavij pages and API docs, rembg/isnet-anime Hugging Face and ComfyUI node descriptions, Inupedia anime preprocessing. Exact ONNX inference parameters and local model hashes not re-run here (gap named).

### 14. OpenToonz linked palettes + isolated generative multi-character as the default free path
Default free path:
- Isolate each character.
- Lock with VACE / pack references.
- Generate (solid bg preferred).
- Cut out with local AI (isnet-anime via CutOut/Kavij/rembg) or manual.
- Overlay on living plate.
- Composite with plate-matched shadows and grade.
- Use OpenToonz linked palettes for colour consistency across frames.
- Optionally place layers at different field values for multiplane parallax.

**Source checked:** all prior items combined. No new invention.

## Free tools already in the umbrella (verified free)
- OpenToonz (including multiplane, linked palettes, Xsheet, 3D view). New BSD. Version referenced in nightlies and 1.x docs.
- Krita (cleanup, Japanese Animation Template, colour sets). GPL.
- Blender + Grease Pencil (cut-out, multiplane via add-ons such as Frame By Plane). GPL-3.0-or-later.
- DaVinci Resolve free (composite, grade). Free tier (free proprietary, not open source).
- Local AI cutout tools (CutOut MIT, Kavij / isnet-anime models, rembg Apache-2.0).

All notes are method references that transfer to the existing per-character → cutout → overlay pipeline. No new canon. Paid tools (Harmony, Nuke, etc.) remain method references only.

**Gaps named:**
- Exact VACE strength/scale bands on our current Wan graph not re-measured.
- Specific Krita template .kra file contents not opened.
- Frame By Plane add-on source not cloned and inspected node-by-node.
- Exact shadow opacity/softness values from a live plate not re-sampled.
- Viseme chart file not opened.
- OpenToonz palette binary format not exported.
- Live OpenToonz scene not built to re-measure exact field values and camera controls beyond transcript descriptions.
- Exact ONNX inference parameters and local model hashes for isnet-anime not re-run.

File updated in place. Next reverse-engineering items will be expanded to full substance and landed the same way.

## Completion appendix (2026-10-28)

Verification against the full research set found the 14 notes present in substance above. Appended here is only what was genuinely still missing — detail the entries point to but did not state, the second standing correction, and one licence label. Nothing above is rewritten.

### Note 2 completion — VACE research bands
Named in the gaps above as not re-measured on our graph; recorded here as research bands (starting points for the runner — the frame-1 + likeness gates still decide pass/fail):
- WanVaceToVideo strength: ~1.02 default; 1.10–1.25 for stronger reference adherence.
- Standard VACE: 20–30 steps, CFG 6–7.
- Distilled LightX2V: 4 steps, CFG 1.
- The reference is injected at the start of the graph, not later.

### Note 3 completion — exposure-sheet practice
The timing reminder above is executed as an exposure sheet: timing written explicitly per cut (action, dialogue, camera and layer columns; key poses numbered; holds and ones/twos/threes marked) so the next person executes without guessing. Our staging JSON and cue sheet are the digital equivalent — the timing map stays explicit and revisable rather than buried in the generator.

### Note 4 completion — clean-up entry points
- OpenToonz cleanup room: match-line workflow for shadow/highlight lines, ink/paint from palette, timing on the Xsheet.
- Krita → OpenToonz exporter plugin: moves animated layers into OpenToonz preserving stacking order and timing (clone frames deduplicated) — no re-timing at the border.
- Krita Fast Sketch Cleanup: turns rough sketches into cleaner line art that can be inked.

### Note 6 completion — shadow construction
The composite shadow pass is built as: duplicate the character layer, fill dark, soften the edge, multiply (or equivalent), matched to the plate's lighting direction, black levels and colour temperature. The chart's locked set per character is base + shadow + highlight, in the variant the scene's lighting key calls for.

### Note 7 completion — the viseme code chart
The chart used for dialogue mouth shapes (8–12 shapes; one shape covers several phonemes — readable, not phonetically perfect). Common letter codes:
- **A** = M/B/P — closed
- **B** = S/D/T class
- **C** = E/A
- **D** = wide open
- **E** = O
- **F** = U/OO
- **G** = F/V
- **X** = rest / silence

### Note 9 completion — the Resolve seat is Fusion
DaVinci Resolve's free tier includes Fusion, a full node-based compositor: MultiMerge layers the per-character cutouts over the living plate, colour correctors match the plate, soft-edge shadow layers carry the composite shadow pass, and the grade happens after all layers are together.

### Note 10 completion — consistency techniques, ranked
1. A single clean front reference reused in every generation — the strongest single step.
2. Image-to-video from an approved first frame.
3. Adapters (IP-Adapter / PuLID / FaceID-style) where the model supports them — see the standing correction below.
4. LoRA for long-running characters — higher effort, highest long-term consistency (status: standing correction below).
5. ControlNet / pose for structural guidance without fighting the identity lock.

OpenToonz cut-out rigging detail: parts on separate columns, skeleton tool links them and sets pivots, pegs carry the hierarchy, plastic tool for deformation when needed.

### Note 11 completion — template line colours + matte edges
Krita's template separates the guide colours: main line (black), highlight guides (red), shadow guides (blue), darker shadow guides (light green), plus time-sheet and composition-sheet layers. Matte finishing: after the removal pass, clean the edge (choke, spill removal) before overlay.

### Extras — TVPaint path, Nuke order, Grease Pencil
- **TVPaint (method reference):** the classic bitmap path — rough → breakdown → inbetween → clean-up → colour; its virtual red/blue pencils for shadow/highlight lines are the same technique as the OpenToonz match-line workflow.
- **Nuke (method reference):** integration order — match the plate's black levels, colour temperature and lighting direction first; shadows as a separate pass, never baked; final grade after all layers are together; grain/noise matched last.
- **Blender Grease Pencil cut-out:** parts as separate objects or layers under armature bones; mixes frame-by-frame drawings with transform animation.

### Standing correction — no IP-Adapter on the Wan stack
Restated in full (note 2 above carries the short form): on our Wan stack there is NO IP-Adapter — the likeness lock is VACE reference control. Adapter weight bands apply to engines that have adapters, not to the Wan graph. (For adapter-equipped engines, the research band for face/identity weight is typically 0.5–0.8 — higher copies more exactly and can fight scene lighting.)

### Standing correction — the LoRA picture is two lanes
The Wan LoRAs for Dorowani and Wispkin exist but are built on the older 1.3B base, so they do not load in the 5B scene. The SDXL keyframe LoRAs that failed on the missing ftfy module were never produced. Different fixes, different days. LoRA remains the highest long-term consistency tool where the base matches.

## Voice / DSP method references (2026-10-28)

Extracted from hyperpop / digicore production descriptions, Vocaloid 5 Reference Manual, and commercial plugin architecture notes. All paid tools remain method references only. Free-stack mappings noted where direct equivalents exist (Audacity, Ardour, open-source DSP, or custom builds). No canon invented.

### Digital Fairy / Yameii-style vocal chain (method reference)
- Formant shift first (+3.5 to +5.5 semitones via Little AlterBoy or Auto-Tune Throat) before any musical pitch change. Prevents chipmunk artefact by locking vocal-tract size before pitch.
- Soft head-voice / near-whisper recording. Do not belt.
- Zero-speed Auto-Tune (Soprano input type on EFX+) after formant lock for robotic snap.
- OTT 15–25 % depth + high-air shelf (6–10 kHz) + light bitcrush / slapback (50–70 ms, zero feedback, low mix).
- Free-stack mapping: formant via spectral tools in Audacity or custom LPC; zero-speed pitch via free pitch correctors or TD-PSOLA; OTT-style via free multiband compressors; air via high-shelf + short delay.

### Vocaloid 5 + Avanna (proprietary, method reference only)
- Install order: Vocaloid 5 Editor first, then Avanna V3. Sample-rate bug fixed in 5.6.2+ (or force 44.1 kHz in host).
- Character (CHA) formant direction reversed from V3/V4: positive values shrink the tract (feminine/cute). Recommended for Yameii-style: CHA +25 to +45, EXC +35 to +50, AIR/BRE +15 to +25, MOU +20 to +40.
- Velocity (VEL) controls consonant speed, not volume. Raise to 95–115 for fast trap timing.
- VSTi loads into host Channel Rack; notes and lyrics drawn inside Vocaloid Editor window (locks to host BPM/playhead).
- Do not double-formant: if CHA is already raised inside Vocaloid, omit external formant shifters on that bus.
- Free-stack mapping: none for the engine itself; method transfers to free TTS/formant tools where available.

### Deko-style dual bus (method reference)
- Avanna bus: HPF 150 Hz → Auto-Tune EFX+ (Soprano, speed 0) → OTT 20 % → Fresh Air → Soothe2 → short reverb/delay.
- Human digi bus: De-noise → Auto-Tune EFX+ (Soprano, formant on) → formant +2.0 to +3.5 → 1176-style → OTT 15 % → vocoder 10 % parallel → air → soothe.
- Master glue: smart:comp + smart:EQ sidechained to the beat bus.
- Free-stack mapping: HPF / EQ / compression / delay / reverb via Audacity or Ardour; sidechain via free tools or manual automation; vocoder via free alternatives where available.

### 20-module commercial DSP targets (for free-stack equivalents)
- EQ: ZDF SVF with pre-warping (no cookbook biquads above 8 kHz).
- Formant shifter: true spectral-envelope warping (cepstral/LPC) decoupled from F0 + unvoiced sibilant bypass (ZCR + spectral flatness).
- OTT: LR4 phase-compensated crossovers at 88.3 Hz / 2.5 kHz with dual upward/downward compression.
- Soothe-style: 2048-point STFT median-floor resonance suppressor (2–9 kHz).
- 808 saturation: split-band at 140 Hz (sub mono/phase-locked, upper harmonics saturated/clipped 4× oversampled).
- Stereo widener: all-pass decorrelation + micro-pitch Haas with 180 Hz HPF (mono-safe).
- Limiter: true-peak 4× oversampled lookahead brickwall (1.5 ms) with dual-stage release.
- Vocoder: 32-to-256 band Bark-scale filterbank with unvoiced consonantal noise detector.
- Remaining modules (Melodyne-style offline editor, wavetable synth, sidechain pump, etc.) mapped to free equivalents (Audacity/Ardour/open-source DSP or custom builds) where possible.

**Source checked:** Vocaloid 5 Reference Manual (Yamaha), Avanna/Vocaloid wiki entries, hyperpop production descriptions, commercial plugin architecture notes. Live Vocaloid session and exact stream screenshots not re-captured (gap named).

These are method references and free-stack mappings. Paid tools remain references only. No new canon invented.
