# RECORD — EP01-V3-005-dorowani-manual-keyimage-v1.png

**What this is:** the Dorowani-with-Manual key image for EP01 cut V3-005
(`show/episodes/EP01/GENERATION-PACKAGE.md`: "Dorowani crosses the path
with the Manual … checks the latch mid-frame", staging background
gate-dawn). Dorowani carrying the Manual, composited onto the real EP01
Gate dawn plate.

**File:** `show/episodes/EP01/animatic/EP01-V3-005-dorowani-manual-keyimage-v1.png`
— PNG, 1280×720, 1,198,211 bytes,
sha256 `28499a7d4b1d962d2e568e7c19f151158c4607120f621d9c1e79c5faf4e3b14d`.

**Status — CURRENT for its use:** this is the current Dorowani-with-Manual
key image at the Gate (first version of this piece; no predecessor exists
for this use, so it supersedes nothing). It does **not** replace
`EP01-V3-005-flow-composite-startframe.png` — that is a different piece
(the Flow composite clip's start frame) and stays current for its own use.

**Owner grade — PASS, 80% likeness (Jamar, 2026-10-28).** His ruling, in
substance: the picture is "good enough"; it is "honestly like 80% there";
"we'll use it"; "mark that one as 80% likeness … but you can say pass".
It reads like another artist drew the character — not the artist who
usually draws him — slightly off, but accurate and approved for use. It
is **not** the most accurate rendition of Dorowani: the ones we make are
better and closer to the likeness, and the canon main renditions remain
the primary ones. This piece is approved for use at its grade; it
displaces no canon rendition.

**Source:** Grok generation `grok_1793207907354.jpg` (1136×1744 —
Dorowani holding the Manual before a generic stone-arch forest
background; the owner ruled of that generation "this is him") + the
owner's directed edit pass (four fixes, then a touch-up pass; the
complete edit log is reproduced below). Outside the edited zones the
character is the source generation's own pixels; the background is not
the Grok background at all — see plate facts.

**Plate facts:** the background is this repo's real EP01 Gate dawn
plate, `show/assets/backgrounds/gate/EP01-PLATE-gate-dawn-v1-derived-still.png`
(1280×720, git blob `2d03a4794d721c25afc038f102915581a118ec30`),
byte-verified at composite time — not a lookalike or a regeneration.
The character was cut out and composited onto it, feet planted on the
path; the one soft contact shadow was drawn on the plate at composite
time, never on the character (no baked shadow in the character art).

**Font facts:** the book's "MANUAL" lettering is typeset in **01
Digitall** — the game's own font file, `src/assets/fonts/01-digitall.ttf`,
taken from this repo — silver-gray (202,206,212), perspective-matched to
the cover; re-set at ~85% of its first size in the touch-up pass on the
owner's note.

**Edit history:** the complete EDIT-LOG.md from the edit workspace is
reproduced below, verbatim. Its "deliverable" filenames are the edit
workspace's names; the file landed here is its v2 deliverable, under the
name at the top of this record.

---

# EDIT LOG — Dorowani-with-Manual key image, owner's four fixes

**Source:** Grok image `grok_1793207907354.jpg` (1136×1744) — Dorowani holding the
Manual, generic stone-arch forest background. Owner ruled "this is him"; likeness
approved. All work was surgery on that image, not a redraw: outside the hand
patches, every character pixel is the source's own pixel.
**Deliverable:** `dorowani-manual-gate-fixed.png` (1280×720 — the Gate plate's
native size; fixes 1–2 were done at the source's full 1136×1744 resolution, the
composite canvas is the plate's own so no plate pixel was fabricated).

## Fix 1 — near eye white removed
Programmatic, from the pristine source (zero drift): the near eye's white
crescent was isolated by colour + connected components (1,278 px core + 77 px
anti-aliased fringe); the round specular highlight (185 px) was identified and
**preserved**. The crescent was filled by per-row sampling of his face blue
adjacent to the mask (fill mean RGB (49,138,197) vs face (43,136,198)), light
blur inside the mask + grain to match the painted texture. The red iris now sits
directly in blue. The far eye was not touched. (A first whole-image generative
attempt was rejected and discarded: it left the eye unchanged and drifted the
far eye.)

## Fix 2 — clawed hands → webbed hands
Canon reference `canon-cutouts/dorowani.png`: long blue fingers, no claws.
Done as two targeted generative patch edits (one per hand), pasted back onto the
fixed source through difference masks confined to the hand zones, so nothing
outside the hands changed (verified by pixel diff). Result: solid blue
rounded/webbed fingers gripping the spine (his right) and the cover edge (his
left), no white claw tips, no webbing artifacts. Small white "stitch" specks the
generator left in one finger gap were cleaned programmatically and pixel-audited.

## Fix 3 — wrong gate → our Gate plate (true composite)
Background plate is the repo's real file, byte-verified:
`show/assets/backgrounds/gate/EP01-PLATE-gate-dawn-v1-derived-still.png`
(1280×720, git blob `2d03a4794d721c25afc038f102915581a118ec30`) — the EP01 Gate
dawn plate (Keeper Board, wooden gate ajar, dirt path). Not a lookalike.
Cutout: rembg matte, then the matte was repaired by hand where the model fused
the stone arch into the silhouette — arch/mist removed via ink-outline component
analysis, and **his tail**, which the model dropped, was recovered from the
source by colour segmentation and re-attached. He is scaled to 612 px tall,
feet planted on the path (feet line y=700), centred on the path in front of the
gate. One soft contact shadow was drawn **on the plate** at composite time
(never on the character). A gentle dawn grade (warm, slightly desaturating) was
applied to the character layer only, so he sits in the plate's morning light.

## Fix 4 — MANUAL in the game's Y2K font
**Font used: "01 Digitall"** — the game's own font file, fetched from the repo:
`src/assets/fonts/01-digitall.ttf` (blob `21f991f4…`). The game's font records
(`src/lib/fonts.ts`, FONT_OPTIONS in the owner's chosen order) list Yagiza 1st,
01 Digitall 2nd, then the (never-delivered) Behance Y2K face, then Pokémon and
shipped Y2K faces. 01 Digitall is the digital/segment Y2K face among them — the
owner's "digicorn kind of Y2K" — and it is legible at cover size; Yagiza (his #1)
is an extreme slanted chrome logo face that would fight the cover. Specimens of
both were rendered and compared before choosing.
The old serif "MANUAL" was fully erased (cover surface reconstructed smoothly —
no ghost remains), then "MANUAL" was typeset in 01 Digitall, silver-gray
(202,206,212) like the original lettering, perspective-warped to the cover's
own tilt and centred on the cover, clear of both hands.

## Self-check (inspected on the final file, full size + zooms)
1. Near-eye white gone? **YES** — red eye sits in face blue, highlight kept; far eye untouched.
2. Hands webbed and clawless? **YES** — both hands solid blue fingers, zero white tips.
3. Background recognisably OUR Gate plate? **YES** — the actual EP01 Gate dawn plate (blob-verified), Keeper Board and all.
4. MANUAL spelled right in the Y2K font? **YES** — "MANUAL" in 01 Digitall, the game's own font file.
5. Face/body unchanged from the source? **YES** — outside the two hand patches and the eye crescent, the character is the source image pixel-for-pixel (diff-verified); the tail that was always in the source is present in the composite.

**Known limits:** final canvas is 1280×720 (the plate's native resolution);
the character's feet keep their toe claws exactly as drawn in the approved
source (not in the fix list). One early generative full-frame attempt was
rejected for likeness drift and played no part in the result.

---

## Touch-up pass — v2 (2026-10-28, Doro's zoom inspection + owner's fixes 3–4)

**Deliverable:** `dorowani-manual-gate-fixed-v2.png` (1280×720,
sha256 28499a7d…). Built by `v2/build_final.py` from v1
(sha256 af65ca92…); every step is confined to its repair zone and the result
is diff-verified against v1 (below). Inspection crops in this folder:
`v2-zoom-hand.png`, `v2-zoom-footL.png`, `v2-zoom-footR.png`,
`v2-zoom-edge.png`, `v2-zoom-lettering.png`, `v2-zoom-book.png`.

### Fix 1 (touch-up) — cover-edge hand rebuilt
The v1 cover-edge hand read as three stacked blue discs with dark gaps, plus
a detached blue speck in the grass at ~(839,491). Two generative patch edits
were made on the hand crop: the first still read as separate lobes and kept
the speck; the refined second pass merged the fingers into one connected
gripping silhouette and removed the speck. The paste back is deliberately
stingy: only hand-coloured pixels (+2px outline rim) inside the hand zone,
or the speck disk, are taken from the generated patch — the generator's own
redrawn background (a tan fence panel) is never pasted. The composite's dawn
grade (×1.05/1.01/0.93, saturation 0.96) was re-applied to the patch first,
same as the v1 pipeline. One judgement call to eyeball in `v2-zoom-hand.png`:
the new hand's top finger lies horizontally along the cover edge at the
"L"'s height — the same finger grammar as the (correct) spine hand — and the
cover's dark edge line keeps it clear of the lettering.

### Fix 2 (touch-up) — toe claws removed, plain feet
Three programmatic attempts (per-claw colour fill, arc caps, painted capsule
toes) all failed inspection — gray fringes, pasted-bean toes — and were
discarded. What worked: one generative edit of a wide crop (both legs, both
feet, ground and contact shadow in frame, 400×165), which kept the layout
and produced plain rounded blue toes on both feet, then a paste back
confined to the two toe zones (diff-masked), so legs, ground and the contact
shadow remain v1's own pixels. The planted foot's middle toe is a touch
long; the raised foot shows a faint outline ghost above the toes at 4× zoom
only. Both read clean at full size.

### Fix 3 (owner) — book-edge smear cleaned
The cover's right edge carried a wide muddy ramp (up to ~25px of navy/plate
blend) from the top corner down to the hand, a matte-feather artifact. The
true silhouette was recovered from the cutout's alpha edge
(`work/cutout-fixed.png`) mapped through the composite's own placement
(scale to 612 tall, dx from CX 655, dy 88), median-smoothed per row. Along
that line the edge was rebuilt: cover navy inside (per-row interior sample),
a 1–2px dark outline (8,16,24) on the line, and the real Gate plate restored
outside it — the plate is the true background, byte-available. Rows beside
the hand are handled by a background restore instead: everything right of
the pasted hand (+1px) is set back to plate, which also removes the ghost
outline of the old hand's wider silhouette. The book's shape and navy are
unchanged — only the transition is crisp now.

### Fix 4 (owner) — MANUAL re-typeset at ~85%
Same font (01 Digitall, the game's own file), same silver-gray (202,206,212),
same centre (758,448) and tilt (0.056): the word was re-set with the typeset
target width reduced 150 → 130px (font size 40 → 34; measured glyph width
153 → 130px = 85% of v1), perspective-warped onto the cover, clear of both
hands. Two things found on the way, recorded so they aren't rediscovered:
- **Base-image incident:** `work/stage4-erased.png` was overwritten by a
  `typeset2.py` rerun during this pass; the rerun's erase band re-lerped the
  spine area, so that file no longer matches v1 outside the word and was NOT
  used as the base. (Its stage5 output was restored from backup.) The v2
  base is v1 itself with only the word erased — per-column lerp over the
  word's own footprint (x 676–840, y 426–470), saved as `v2/base-erased.png`.
  v1 outside the word quad is the pre-typeset composite byte-for-byte, so
  nothing else was at risk.
- **typeset2.py's warp is broken as written:** it solves the forward
  homography and then uses it as the inverse — a probe maps the quad centre
  to (1447,843) instead of the layer centre — which is why its rerun draws
  nothing. The v2 typeset solves the inverse homography directly and asserts
  the centre maps to the layer centre (69, 14.5) before drawing.

### Diff verification (v2 vs v1, material change = max-channel diff > 8)
Total materially changed: **8,543 px** of 921,600. Changed pixels **outside
the allowed zones: 0**. Per zone (bounding boxes):
- hand: x 755–854, y 415–511 (3,223 px)
- edge band: x 815–854, y 368–511 (2,472 px; overlaps the hand box)
- feet (planted): x 544–659, y 654–703 (2,480 px)
- feet (raised): x 768–843, y 610–664 (1,478 px)
- lettering: x 681–854, y 415–479 (3,482 px — old word out, smaller word in)
Everything else — eye fix, face, body, shell, tail, Gate plate, Keeper
Board — is pixel-identical to v1.
