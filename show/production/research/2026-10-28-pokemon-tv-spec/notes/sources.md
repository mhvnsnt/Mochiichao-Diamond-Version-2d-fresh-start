# Sources read 2026-10-28 (index + open)

- AWN OLM Asia/Celsys 2019-11-26 https://www.awn.com/animationworld/olm-asia-launches-new-pok-mon-animation-series-help-celsys-clip-studio-paint — verified open. Producer Hiroyuki Kato: >300 shots, 4,000-5,000 drawings/ep; CSP used genga + douga/inbetween; OLM Asia opened Dec 2017, 2-month animator training, several dozen animators.
- Kanzenshuu Animation Production Guide (Toei, industry-standard process) https://www.kanzenshuu.com/animation-production/process/ — open full. Timesheet 1 line=1 frame, 24fps; traditional ep 3,000-5,000 drawings, modern 3,000-4,000; ~300 backgrounds/ep modern; afureko 2-3h ensemble; RETAS PRO scanning/vector, shadow layer separation; compositing pans/3D space.
- Jarrett Martin How Anime is Made (2023, rev 2025-10-02) https://www.jarrettmartin.jp/how-anime-is-made-republished/ — open full. Settei types incl expression sheet, sakkan correction collection, color design per location/time; e-conte TV format A+B=21min content (1260s); 15-20 animators/ep good schedule, never >30, ~300 cuts, sections 15-20 cuts; layout/genga/douga checks (enshutsu/sakkan/sou-sakkan retakes); douga in RETAS Stylos or CSP, paper douga norm 2023; shiage PaintMan/CSP per iro-shitei; backgrounds Photoshop/CSP + stock textures; satsuei almost all After Effects, time-remapping not PNG seq; afureko often over e-conte, no lip flaps yet, flaps adjusted to voice, <2h ensemble; CT movie.
- ANN Answerman software 2018-03-30 https://www.animenewsnetwork.com/answerman/2018-03-30/.129615 — open. RETAS suite Stylos/TraceMan/PaintMan/CoreRETAS industry default; After Effects for advanced comp + proprietary plugins; 3DS Max/Maya CG; Premiere/Avid edit.
- Iwane Masaaki Animage Mar 2015 interview, Dogasu transl. https://dogasu.bulbagarden.net/features/translations/animage_masaaki_iwane.html — open. Solo key animation whole episodes; regular ep key animation ~1.5 months, Mega specials ~2 months & >1,000 drawings for one long final cut; XY (2013) onwards +20-30% drawings vs earlier allotment; drawing allotment = budget control; digital freed cel-layer stacking limits; 3D staff camera moves in XY battles.
- Bulbapedia/Bulbanews HD: DP121 The Lonely Snover 2009-04-02 first HD 16:9 ep https://bulbanews.bulbagarden.net/wiki/Pok%C3%A9mon_to_begin_HD_broadcast_in_April and https://en.wikipedia.org/wiki/Pok%C3%A9mon:_Diamond_and_Pearl:_Galactic_Battles — 4:3 since 1997, digital broadcast early AG but not full HD.
- Pokemon runtime 22 min (Wikipedia series infobox) / ~25 min Japanese with OP/ED/segments, ~21 min dub (Bulbapedia animated series page).
- Digital transition: Bulbapedia via search — cel until ep AG? 'Here's Lookin at You Elekid', digital from Aug 2002; corroborated Namu wiki list 2002 transitions Pokemon among others.
- Tezuka mouth: Scribd Tezuka Animation Vol1 — TV mouth = 3 positions open/mid/closed (poor source quality, corroborated by general kuchipaku practice; flag).
- AnimeInterp CVPR2021 https://openaccess.thecvf.com/content/CVPR2021/html/Siyao_Deep_Animation_Video_Interpolation_in_the_Wild_CVPR_2021_paper.html — natural VFI fails on animation: flat colour lacks texture for flow, exaggerated non-linear large motion; producers replicate drawing 2-3x.
- Tools licences (official/index):
  OpenToonz https://opentoonz.github.io/e/ New BSD, free commercial/noncommercial, based on Toonz Ghibli version; Plastic mesh tool doc.
  Tahoma2D BSD-3 (list of 2D software).
  Krita GPL-3.0-only (list); docs.krita.org animation/onion skin.
  Blender GPL-2.0-or-later (list); docs.blender.org Grease Pencil 2D/cut-out, modifiers.
  Synfig https://www.synfig.org/ GPLv3, vector tweening auto inbetweens, bones for cutout bitmap/vector, skeleton distortion.
  Natron https://natrongithub.github.io/about GPL, free/open compositor, OpenFX.
  Kdenlive GPL-3.0-or-later.
  Inochi2D/Inochi Creator BSD-2 https://nlnet.nl/project/Inochi2D/ mesh warp puppet, physics, masking; itch version nagware evaluation — compile from source free.
  RIFE MIT (Practical-RIFE); FILM Apache-2.0 (google-research/frame-interpolation).
  ToonCrafter Apache-2.0 per secondary, limits 16 frames 512x320, struggles semantics/occlusion appearance/disappearance — research only.
  EbSynth http://ebsynth.com/ free beta, NOT open source (no licence published), propagates painted keyframe; newer ebsynth.com shows Pro upsell — flag risk.
  CACANi paid proprietary (AlternativeTo) — excluded per no-paid rule; open equivalent = Synfig tweening + OpenToonz Plastic + AnimeInterp research.
  Storyboarder: free/source-available, GitHub API license=null — do NOT claim MIT; use with caveat or replace with Krita/Blender boards.
