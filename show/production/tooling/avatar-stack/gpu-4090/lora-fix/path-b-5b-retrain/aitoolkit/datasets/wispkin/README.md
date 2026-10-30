# datasets/wispkin — filled by the builder, not by hand
Run `../../build_dataset_from_refpacks.py --pack-root <reference-packs> --character wispkin`
from path-b-5b-retrain/. It writes <char>_NNN.png + same-stem .txt captions here
(ai-toolkit format: folder of images, captions as .txt with the same name —
per ai-toolkit's own example configs). Source: the character's reference-pack
stills (see ../../DATASET-SPEC.md). Do not drop generated art in here labelled
canon.
