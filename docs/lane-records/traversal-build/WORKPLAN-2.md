# TRAVERSAL PART 2 — workplan (lane note, not a deliverable)

Order binding: (1) ported base 100% first per system, (2) expansion on top,
recorded as two separate layers. Visual standard binding: nothing lands
flat — top lip + shaded front face + height offset + render-time lip
shadow, from the kit's texture SETS. NSBMD polygons NOT claimed.

## Steps — ALL DONE (2026-10-30)
- [x] Read part-1 census/record/engine; maps; encounters; store skim
- [x] Recon: canvas actor/overlay passes; WorldEngine input/render/store
      wiring; part-1 drive.cjs save format; emerald sources (Strength
      boulders, bike Mach/Acro, dive, waterfall, surf), HGSS rock climb
- [x] Built-up renderer: composed ledge set (lip+face) + offset + lip
      shadow + face shading; same model for climb face / waterfall /
      boulder / dive edge
- [x] Boulder object system (push, hole-fill, switch, reset-on-reload,
      blocked cases) onto S-3 Mighty Push; placements: Cave of Echoes
      (hole path) + Junkyard (switch gate)
- [x] Bikes: key item (DRAFT name, neutral id), Mach + Acro modes,
      slopes, hop tiles, cracked-floor speed rule; placements:
      route_2 carries the whole bike grammar (slope + rails + cracked)
- [x] Crag Climb hook + faces: route_1 ledge bands x2 (two-way
      shortcuts inside existing elevation)
- [x] Wave audit/fix end-to-end + surf encounter consumer roll
- [x] Cascade ride: route_1 pond falls (24,30) + coral falls (12,20)
- [x] Deep Dive: boot_bay dive spots <-> new boot_bay_deep map
      (seaweed ground, depth palette, cave air-pocket via the cave
      pool dive link)
- [x] Spin/conveyor placed in dojo_1; snow/mud honest per-type seats
      (census-2 §7: snow has no Region 1 seat; mud cost-live, unplaced)
- [x] Tests per system; tsc / vitest / vite build receipts
      (527/527; battleTreatments suite failure pre-existing)
- [x] Proof drive 2: boulder seq, bike+hop, climb, waterfall, dive,
      slope x2, cracked x2, conveyor, depth frames — all identity-
      guarded, all probes exact (LANDING-RECORD-2 §5)
- [x] TRAVERSAL-CENSUS-2.md + LANDING-RECORD-2.md written (whole-
      census state table = LANDING-RECORD-2 §8)

As-shipped notes vs the plan above: the cracked stretch sits on
route_2 with the rest of the bike grammar (not dojo_1); the climb
faces sit inside route_1's ledge bands (not a pond cliff). Two
fixes landed during proof: the Mach bump-shed wrapper in
WorldEngine (a press that moves nothing now zeroes the charge) and
the canvas motif-layer fix (part-2 device motifs draw in the
foreground pass; deep-map rock re-bound to rock.png).

## PROOF-INFRA FINDING (2026-10-30, this session)
Port 4399 was NOT serving this tree: a python http.server rooted at
~/workspace/world-3d/tree/dist (the 3D lane's tree) held the port.
All drive2/drive3/drive4 frames captured before the fix are from
THAT build — discarded as proof. Server restarted rooted at this
tree's dist (served index chunk verified = dist's chunk, contains
boot_bay_deep). Proof re-run from scratch on drive4.
