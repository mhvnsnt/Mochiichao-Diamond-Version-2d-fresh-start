# Where the big files live

Model weights and other heavy production material never live on a
local disk. Code, documents and manifests live in GitHub. Anything
too large for GitHub lives in TeraBox, with a manifest recording the
exact byte sizes and sha256 hashes so any copy can be proven
complete. Kaggle datasets hold the weights the notebooks need.

Local disk is a workbench, not a warehouse: if a file exists only
locally, that is a staging debt to clear.
