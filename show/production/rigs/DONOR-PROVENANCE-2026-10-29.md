# Donor extraction — provenance record, 2026-10-29

Every source below was verified first-hand on 2026-10-29 (GitHub
API reads and, where a file was studied, a local fetch with size +
sha256 recorded). Donor studio files were studied on the local
workbench only and are **not** in this repo — what landed is the
extracted construction, in `RIG-AND-SHEET-SPEC.md` beside this
file, plus one CC-BY carry-over (`open-movie-kit/`). Local study
copies live under the workbench donor-extraction folder, not in
any repo.

Licence buckets use the owner's classification law: open source /
free proprietary / free-but-restricted / paid — verified at the
source, never guessed.

---

## A. The owner's own repos

### A1. Gumball guide set — `mhvnsnt/cn-gigaleak-gumball`
Repo tree verified via the Git Trees API (9 files). Four PDFs
fetched and hash-verified against the API blob sizes:

| File | Bytes | sha256 |
|---|---|---|
| `GUMBALL_GUIDE_2012_HR_text.pdf` | 5,493,889 | 5bc51cb397f491e33ef6509959187d52a09e0623491fca7e379d8a97597bcea8 |
| `COMPGUIDE_CHARACTERS.PDF` | 2,242,511 | 1043bf898c98d80611053f6e1f46ace87d8e2d0571e577bdcd9ff798e148d935 |
| `AWG_Colour_Palettes_001.pdf` | 237,673 | 12cdeb7eb25e6d81d3de4641d4b267b987af197182662797e01ac3a173488f8c |
| `Gumball_Bible_text.pdf` | 11,392,220 | 2626326d8b1d2569a8d3af8928b607e951368f5575c9eb0efddb9a0db1d9aa8d |

Licence bucket: studio
production documents held in the owner's archive — **not a free
licence**; studied + extracted only, never re-hosted.
Extracted: the 78-page guide's section order → spec §1; the
compositing guide's integration rules (exposure, ambient colour,
feet gradients, rim lights, cast shadows, per-character issues)
→ spec §4; the palette sheet's CMYK + sanctioned-tint format →
spec §2.

### A2. Big Buck Bunny production tree — `mhvnsnt/disney-tva-bbb-pulls`
The repo itself is **catalogues only** (verified: 9 markdown
files, no production data). The real files live in its **release
`v1.0.0`** (draft), verified via the Releases API:
`bbb-production-files-2026-10-12.zip` in four parts —
283,115,520 ×3 + 231,537,514 bytes = **1,080,884,074 bytes
total**, asset ids 634952922 / 634962973 / 634971584 / 634983718.
The repo's own catalogue records the tree as 422 files pulled
from the Internet Archive item `bickbuckbunnyblenderfiles`,
every file MD5-verified at pull time (2026-10-12), including
`production/chars/` with 7 character rigs and a `pyconstraints/`
folder of rig-constraint Python scripts, plus envs 102 / mattes
49 / props 34 / scenes 137 / scripts 41 / sets 17 files.
Licence bucket: **free with attribution — CC-BY 3.0** (verified
at the licensor's own project statement; see B1).
**Download verification (this pass):** all four parts fetched;
sha256 aa 5268821c7f897366…, ab ccaa73e090f599ad…,
ac 84dd512d768580b9…, ad 9f14412cf957ced3…. Assembled archive
= 1,080,884,074 bytes, zip CRC check clean; its own listing =
**423 entries (422 production files + `production/MD5SUMS`)**,
203 `.blend` — the catalogue's counts (chars 42 / envs 102 /
mattes 49 / props 34 / scenes 137 / scripts 41 / sets 17) match
the listing exactly. Extracted files were cross-checked against
`production/MD5SUMS` (422 entries): all seven checks passed
(the five scripts + two character rigs). Extracted:
folder/rig discipline → spec §5; the five `pyconstraints`
scripts are carried in `open-movie-kit/pyconstraints/` (see
B1): `footroll.py` 1,271 B sha256 f9dd77f33c999156…;
`pivot_change.py` 2,195 B sha256 b706b8b5bc76e0a3…;
`rotation_difference.py` 889 B sha256 dbc27705d97a0f04…;
`rotation_difference_2.py` 893 B sha256 236942ff145f53b1…;
`bone_preserve_volume.py` 1,906 B sha256 7ec98018b517b27c….
Also in the same release, **located but not fetched**:
`disney-tva-new-bibles-2026-10-12.zip` (348,207,778 bytes) —
studio bible PDFs; outside this pass's extraction set.

### A3. Smiling Friends puppet rigs — `mhvnsnt/cn-gigaleak-cartoon-vault`
Tree verified via the Git Trees API. `smiling-friends/
smiling-friends.zip` (748,767 bytes, sha256
91bcdb866f2b923db1287a1523a442b62c9232759a3e0a3a604eed2281fa4b66)
fetched; it wraps a tar.gz holding two
byte-identical copies of two XFL-format .fla rigs. Both .fla
packages were extracted in full via their zip central
directories — **29 entries each, every file's size and CRC32
verified against the directory record** — and every symbol
timeline was parsed:

| Rig file | Bytes | sha256 |
|---|---|---|
| `PimRigUpdate.fla` | 296,483 | 0d23c0b60a1ff4feed2fc6ee783ecf6c12a97a65b15b0822dceb67301a2d8a0b |
| `Charlie.fla` | 82,390 | 4fc151c5bde20ff92e61d5f7e8b5d8492f2eb8332149d5ed0b2c72c0e2c63c53 |

Per the vault's own README, the zip came from a
`duck-dodgers_202610` mirror release, byte-verified against
archive.org sources. (The README also mentions a Randy
Cunningham zip; it is **not** in the verified tree.) Licence
bucket: studio production files — **not a free licence**;
studied + extracted only. Extracted: the two root patterns
(5-layer core stack; 9-layer root adding a torso-move helper
layer, a body mask with clipped detail layer, and a back-costume
layer), the four-piece eye system with mask clipping, lid/pupil
frame counts, the mouth-as-frame-chart symbol (28 and 25
frames), arm pose-frame counts (2–6 per arm symbol), leg
pose-frame counts (11 and 10), costume/back-view pieces → spec
§3a–§3e.

### A4. Foster's puppet rig — `mhvnsnt/cn-gigaleak-fosters-home`, release `frankie-rig-fla-v1`
Release existence verified via the Releases API (draft, one
asset): `pds3hx.fla`, **18,385,408 bytes**, asset id 651528239.
Fetched; sha256
2cb5f107f76943ee97d12ae848ff0f45ea3556ce09cd95f8d40b167e58e52e31
(size matches the API record exactly). The file is the older
**binary (OLE2) Flash format**, not XFL — it cannot be unzipped;
construction was read from its embedded library/linkage names
(404 unique descriptive strings found by UTF-16 string scan —
part names, part-file paths, and turnaround references; no art
extracted). Licence bucket: studio production file — **not a
free licence**; studied + extracted only. Extracted: view-code
part-naming grammar, part-per-file linked libraries, the shared
generic-hands library, angle-specific mouth files, dated
turnarounds, shot-coded instance names → spec §3f.
Also verified in the same repo (existence only, not fetched):
`fosters-complete-v1` (published, 3,402,743,036 bytes across 8
split parts), `fosters-flash-v1` (published, 90,993,866 bytes),
`fosters-001-cowchicken-v1`, `fosters-cnleaks-main-v1`,
`fosters-cnleaks-002-v1`, `fosters-cnleaks-006-v1`,
`fosters-cnleaks-007-v1`, `fosters-7z-v1`.

### A5. Teen Titans — `mhvnsnt/cn-gigaleak-teen-titans`
Release `teen-titans-complete-v1` verified via the Releases API
(published): `TEEN_TITANS.zip.part-aa` 508,559,360 bytes (66
downloads) + `.part-ab` 227,413,775 bytes; plus draft releases
`teen-titans-cnleaks-v1` and `teen-titans-cowchicken-v1`.
Verified as existing; **not fetched** — outside this pass's
named extraction set (Teen Titans 2003 remains the study
assignment for action range-of-motion in `CAST-RIG-SPECS.md`).
Licence bucket: studio production files — not a free licence.

### A6. TRIPPEDD Foster's study — `mhvnsnt/TRIPPEDD-Production-studios-`
`production/WIZARD_GANG_EP01/animation-study/fosters-home/
CATALOG.md` (2,882 bytes) fetched and read: public-source
pipeline notes (vector art → Flash puppet build → After Effects
composite; two-studio production; character-first development).
Corroborates the A4 pipeline shape; no files extracted from it.

### A7. Method/prestudy material already in the repo
`show/production/animation-techniques-archive/` (Preston Blair
mouth charts, model-sheet and timing templates) and
`mhvnsnt/animation-research-library` (public-domain / CC
animation research) were **already landed** before this pass;
this pass cites them, it does not re-pull them.

---

## B. External free sources (widened scope, 2026-10-29)

### B1. Blender Foundation open movies — official sources
Big Buck Bunny (Project Peach, 2008): the licensor's own
statement — "all of the Project Peach results (film, trailers,
images, models, textures, files, documentation) are licensed
under the Creative Commons Attribution 3.0 license", attribution
string "(c) copyright Blender Foundation |
www.bigbuckbunny.org", logos/trademarks excluded, the film's
score separately CC-BY-NC-ND 3.0 (not used here).
Bucket: **free with attribution (CC-BY 3.0)** — carry-over
permitted with attribution. Official homes: studio.blender.org
and download.blender.org (the repo's own
`RIG-TEARDOWN-open-movies.md` records these; the newer films'
production files are subscription-gated downloads there, the
older films free — **free proprietary distribution, CC-BY
content**). Carry record: `open-movie-kit/pyconstraints/`
carries the rig-constraint scripts from the A2 tree verbatim
under this licence, attributed in that folder's README.

### B2. Published method references (no files carried)
The Blair mouth/expression system is used through the repo's
own already-landed techniques archive (A7). No other external
method files were fetched in this pass; no external *leak*
material was fetched under any heading.

---

## C. Named gaps (honest)

1. **Rick & Morty Toon Boom files — NOT LOCATED.** Named in
   the repo's transfer manifest as held material, but not found
   in any of the owner's 148 repositories (full list pulled via
   the API), not in GitHub code search, and not in the local
   workspace trees searched. Either the manifest entry refers
   to material under another name/location, or it was never
   pulled in. Lead preserved; nothing invented.
2. **`khsqgj.pdf`** (in A3's vault repo, `misc-pdfs/`, 7,830,039
   bytes, sha256
   4f370172378d4c4d5b1671aed858d00e326ccedb03057c9743b56c2995f6f306)
   — 18 image-only scanned
   pages, no text layer, no title metadata. **Unidentified**;
   the vault README also lists it as unidentified. No OCR tool
   was available in this pass to identify it.
3. **Lilo & Stitch, Digimon, Monster Rancher** — no repos of
   the owner's exist for these (verified against the full repo
   list). Their rig/sheet material circulates only as leak
   downloads; per the widened-scope ruling they are recorded
   here as named gaps, **not fetched**. Their style influence
   already exists in canon through design leans, not files.
4. **Foster's complete pull / Teen Titans complete pull /
   Disney-TVA bibles zip** — located and verified (A2, A4,
   A5) but deliberately not fetched in this pass (multi-GB;
   outside the named extraction set). The Foster's single-rig
   release (A4) carried everything §3f needed.
5. **BBB local tree listing — RESOLVED during this pass.**
   The four-part archive was downloaded, assembled, CRC-checked,
   listed, and cross-checked against the production `MD5SUMS`;
   the catalogue's 422-file claim is confirmed (see A2). The
   local 1.08 GB archive + parts were deleted from the
   workbench after extraction — the durable home is the owner's
   release (A2), per the staging law.

---

*Method note: repository trees, release records, and file bytes
above were read through the GitHub API with the owner's PAT on
2026-10-29. Sizes are the API's own numbers where a file was not
fetched, and locally measured (with sha256) where it was.*
