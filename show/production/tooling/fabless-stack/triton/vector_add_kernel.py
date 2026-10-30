"""Triton kernel smoke — vector add, the "hello world" of the kernel layer.

Part of the Fabless Stack (link 4: kernel primitives). This is a REAL Triton
kernel: the same source compiles to PTX on an NVIDIA seat, to AMDGCN on a
ROCm seat, unchanged. On a GPU-less machine it runs through Triton's
documented CPU interpreter mode:

    TRITON_INTERPRET=1 python3 vector_add_kernel.py

which executes the kernel semantics on CPU tensors so kernel logic can be
developed and verified without a GPU. On any GPU seat, run it without the
env var and it executes on the device.

Requires: pip install triton torch  (Triton: MIT; PyTorch: BSD-3-style)
"""
import torch
import triton
import triton.language as tl


@triton.jit
def vector_add_kernel(x_ptr, y_ptr, out_ptr, n_elements, BLOCK: tl.constexpr):
    pid = tl.program_id(axis=0)
    offsets = pid * BLOCK + tl.arange(0, BLOCK)
    mask = offsets < n_elements
    x = tl.load(x_ptr + offsets, mask=mask)
    y = tl.load(y_ptr + offsets, mask=mask)
    tl.store(out_ptr + offsets, x + y, mask=mask)


def main() -> None:
    n = 4096
    x = torch.randn(n)
    y = torch.randn(n)
    out = torch.empty_like(x)
    grid = (triton.cdiv(n, 1024),)
    vector_add_kernel[grid](x, y, out, n, BLOCK=1024)
    expected = x + y
    max_err = (out - expected).abs().max().item()
    print(f"n={n} max_err={max_err}")
    assert max_err == 0.0, f"kernel mismatch: {max_err}"
    print("TRITON SMOKE PASS: vector_add output matches torch reference exactly")


if __name__ == "__main__":
    main()
