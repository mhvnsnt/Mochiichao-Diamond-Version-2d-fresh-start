# Music model staging record

The ACE-Step music model weighs about twenty gigabytes across four
shards. It is staged as its own private Kaggle dataset because the
combined kit would exceed the notebook working quota. Each shard's
sha256 was checked against the publisher's manifest before the
dataset was marked ready.

Voice weights live in a separate dataset: the speech model files,
the vocoder, and six voice packs, byte-size verified one by one.
