# The phone seat

The phone seat runs a model on the owner's own phone chip, inside
the app, through WebGPU. The default phone model is the 1.7B MLC
build, about one gigabyte, which fits both of the owner's Motorola
phones. The bigger 4B build is an opt-in for the eight-gigabyte
phone only.

Expected speed on that class of chip is roughly eight to twenty
tokens per second, an estimate until the owner's first run measures
it. After the model downloads once, the phone seat works with no
network at all.
