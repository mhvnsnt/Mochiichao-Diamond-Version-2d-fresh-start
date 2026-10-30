# Episode Foundry — Landing Package MANIFEST

Built 2026-10-28 (coordinator + 7 workers). Proposed repo home:
`show/production/episode-foundry/` — this package mirrors that layout.

## What this is
A continuous clip factory: the EP01 107-cut manifest is the queue; a
Kaggle batch kernel (Wan 2.1 VACE-1.3B, likeness-locked, FP16) loops
cuts in two concurrent shard sessions with a resumable shared ledger;
a local gate (frame-1 anchor / likeness sample / motion floor /
background persistence — finish-gate measurer code, unedited) grades
every clip; only PASS clips enter the ffmpeg-stitched growing
assembly. Headline pace metric: finished seconds of PASSED video per
GPU hour. Wielder board cards: #16 build, #17 proof cut, #18 SDXL
keyframe feed (project "Mochiichao Finish Queue", Backlog).

## Provenance / attribution of record
The owner-graded recipe being replicated is the 7-stage composite
recipe in flow-recipe/FLOW-RECIPE.md; its generation stage was
Google Flow / Veo 3.1 Lite (records-settled: encoder=Google metadata,
sha256 match to the landing record, credit arithmetic 50/day ÷ 10
= 5 clips/day). Wan+VACE is the replica's substitute engine
(flow-recipe/REPLICA-MAP.md). Prior production credited in the cut
manifest: V3-001/V3-002 (Flow road), V3-005 (Grok-built clip job,
per the convergence agreement).

## Launch state at packaging time
- Code dataset STAGED on Kaggle: marsfmmg/mochiichao-foundry-code
  (comfy_wait.py, accel_profile.py, queue-v3-078.json; the canon
  wispkin.png cutout + gate-night.mp4 plate ride in the dataset —
  both are existing repo/workspace assets, excluded from this
  package to avoid duplication).
- Proof kernel push BLOCKED once by Kaggle's 2-batch-session cap
  (other lanes' sessions); kernel not created. Retry = one command:
  kaggle kernels push -p launch/kernel-push  (metadata attaches
  wan22-consistency-kit + likeness-datasets + foundry-code).
- Proof cut: V3-078 (Wispkin, S5 Gate Night, 10 s, 4 passes),
  A/B protocol in accel/AB-PROTOCOL.md (baseline vs accel-a).
- SDXL keyframe feed READY-TO-RUN, blocked on the
  marsfmmg/mochiichao-sdxl-loras staging confirmation (main lane).

## Files (sha256)
```
73160e80584c5039706a82738bc7904ee9e13a8d09e9442bd96174d4e0432f14  ./CAP-ANALYSIS.md
689b7ef9543367328a965cb5771676735396751882c75283cbf48b0227d5fc44  ./README.md
c0398dc87052b227f098e465977905c91eeb3211958aedb899eb6b10e8e75e93  ./THROUGHPUT-ARCH.md
bbcec2d774fa979dbf5001bc6d63a638a756ef801230700daaeb83852698b696  ./accel/AB-PROTOCOL.md
895f6ded490cb049f94f0442b2e3faf0ca3fcd6221f5e94f19e403b80484cbdb  ./accel/ACCEL-TEARDOWN.md
f0e6820a5870294665cb7821f99b9c49c54561d391bd8182840918916bfc6b3b  ./accel/test_accel_profile.py
b1de5514cd8bbb0e47e43314dc577efc14117cc2f2eb3a8af420f25133a0755b  ./data/cut-manifest-summary.md
f6623acd4a598ae68803214d5e7db6d8ac7a66eb8aef4b69f1284b457f1eafeb  ./data/cut-manifest.json
344bdf4b273e037732af07f7a65da1712d21a9ebb97300c1f49b31a93cec55d1  ./flow-recipe/FLOW-RECIPE.md
2b2a1110380cecf641d7277855914918cf7f98e465aa46b4a8253bc902ee4101  ./flow-recipe/PROOF-PLAN.md
9509a634cc646e47e8471a81512ecc7f9913452c8051351833d57cd865d8c209  ./flow-recipe/REPLICA-MAP.md
8ebbf7b98819d70055d932e579bd6109f79d17520e78f6fb82cb48716c83e0ee  ./kernel/accel_profile.py
e0cb46b607430e3adbd94147b34e047909a0a1449e067c3e3550d5c0e8cca43c  ./kernel/foundry_kernel.py
8ebbf7b98819d70055d932e579bd6109f79d17520e78f6fb82cb48716c83e0ee  ./launch/code-dataset/accel_profile.py
26d16f8574f43b718cd0f4938020ab9fa8b69a7e9bed83d9a0e8510d88ca692a  ./launch/code-dataset/comfy_wait.py
0044fd75b114407f3a2e525e157848916adfffc429a149b6f5ce01d9f9a62593  ./launch/code-dataset/dataset-metadata.json
b1a76945e33f68ce2ee79a90f8113e36a5ccb76ff24e106731b8201077d5540b  ./launch/code-dataset/queue-v3-078.json
e0cb46b607430e3adbd94147b34e047909a0a1449e067c3e3550d5c0e8cca43c  ./launch/kernel-push/foundry_kernel.py
a56eafe1934a1f84baa42261d3910082b77c716694796d14a787b40edb13b426  ./launch/kernel-push/kernel-metadata.json
b1a76945e33f68ce2ee79a90f8113e36a5ccb76ff24e106731b8201077d5540b  ./launch/queue-v3-078.json
26d16f8574f43b718cd0f4938020ab9fa8b69a7e9bed83d9a0e8510d88ca692a  ./src/comfy_wait.py
7236966489f4df9450b57e3b4a9bb0ca95590554b87224010e0578f53c6f7d07  ./src/gate.py
3155107221f2349fcb01496b93cfd8bfe8d8835f0790de3e263fb9e3822c9b79  ./src/keyframe_feed.py
b6d5dd64e6556363cac6309be3e778c14ea6eb67fdc65f42df859a38df57b555  ./src/stitch.py
7ddbf96fe175e2eca6bd44e08eac3bb332c68c7cd5bc67fad698aacd46ba2eba  ./tests/test_comfy_wait.py
```
