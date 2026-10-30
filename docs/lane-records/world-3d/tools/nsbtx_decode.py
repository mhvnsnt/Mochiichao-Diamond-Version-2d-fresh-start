#!/usr/bin/env python3
"""
NSBTX (BTX0) / embedded TEX0 decoder -> PNGs, with 4x4-texel support.

Port of the texture format as held (extends the env-pullin nsbtx.py format
notes, which confirmed formats by data-segment size and did not cover the
4x4 compressed format). 4x4 format (GBATEK): each 4x4 block has 4 bytes of
2-bit texel indices (one byte per row) in the texture data region, plus a
u16 header per block in the separate 4x4 data region (TEX0+0x18 offset):
bits 0-13 = palette address (x2 bytes, relative to the texture's palette
base in the palette region), bits 14-15 = interpolation mode:
  0: [c0, c1, (c0+c1)/2, transparent]
  1: [c0, c1, c2, c3]
  2: [c0, c1, (3*c0+5*c1)/8, (5*c0+3*c1)/8]
  3: [c0, c1, c2, transparent]

Usage: nsbtx_decode.py <file.nsbtx|file.nsbmd> <outdir>
For .nsbmd, decodes the embedded TEX0 block if present.
"""
import struct
import sys
import os
from PIL import Image


def u16(d, o):
    return struct.unpack_from('<H', d, o)[0]


def u32(d, o):
    return struct.unpack_from('<I', d, o)[0]


def rgb555(v):
    return ((v & 31) * 255 // 31, ((v >> 5) & 31) * 255 // 31,
            ((v >> 10) & 31) * 255 // 31)


PAL_OVERRIDES = {
    'ngrass': 'grass', 'nsand': 'sandset', 'allpeak': 'apeak',
    'enccliff': 'enccriff', 'nbridge': 'dun_bridge',
    'conttree_b': 'conttree', 'conttree_t': 'conttree',
    'wcliff': 'criff', 'nectgr': 'nectgrass',
    'conttree2_b': 'conttree', 'conttree2_t': 'conttree',
}


def read_dict(d, base, rec_size):
    count = d[base + 1]
    total, esize, eoff = struct.unpack_from('<HHH', d, base + 2)
    rec_start = base + eoff + 4
    recs = []
    for i in range(count):
        if rec_size == 8:
            recs.append(struct.unpack_from('<HHHH', d, rec_start + i * 8))
        else:
            o, f = struct.unpack_from('<HH', d, rec_start + i * 4)
            recs.append((o, f, 0, 0))
    ns = rec_start + count * rec_size
    names = []
    for i in range(count):
        raw = d[ns + i * 16: ns + i * 16 + 16].split(b'\0')[0]
        names.append(raw.decode('ascii', errors='replace'))
    return recs, names


def decode_tex0(d, tex0, outdir):
    os.makedirs(outdir, exist_ok=True)
    tex_size_units, tex_dict_off = struct.unpack_from('<HH', d, tex0 + 0x0C)
    tex_data_off = u32(d, tex0 + 0x14)
    tex4x4_data_off = u32(d, tex0 + 0x18)
    pal_data_off = u32(d, tex0 + 0x24)
    pal_dict_off = u32(d, tex0 + 0x34)
    tex_total = tex_size_units * 8
    tex_region = d[tex0 + tex_data_off: tex0 + tex_data_off + tex_total]
    hdr_region = d[tex0 + tex4x4_data_off:] if tex4x4_data_off else b''
    # Palette region runs to EOF (the +0x20 size word is 0 in held files;
    # the env decoder's EOF slicing is the verified behaviour).
    pal_region = d[tex0 + pal_data_off:]

    tex_recs, tex_names = read_dict(d, tex0 + tex_dict_off, 8)
    pal_recs, pal_names = read_dict(d, tex0 + pal_dict_off, 4)

    palettes = []
    poffs = [r[0] * 8 for r in pal_recs]
    for i, po in enumerate(poffs):
        end = poffs[i + 1] if i + 1 < len(poffs) else len(pal_region)
        if end <= po:
            end = poffs[i + 2] if i + 2 < len(poffs) else len(pal_region)
        seg = pal_region[po:end]
        palettes.append([rgb555(u16(seg, j)) for j in range(0, len(seg) - 1, 2)])
    pal_by_name = {nm: palettes[i] for i, nm in enumerate(pal_names)
                   if i < len(palettes)}
    pal_base_by_name = {nm: poffs[i] for i, nm in enumerate(pal_names)}

    def palette_for(name, idx):
        for cand in (name, name + '_pl', PAL_OVERRIDES.get(name)):
            if cand and cand in pal_by_name and pal_by_name[cand]:
                return pal_by_name[cand], pal_base_by_name[cand]
        if idx < len(palettes) and palettes[idx]:
            return palettes[idx], poffs[idx]
        for i, p in enumerate(palettes):
            if p:
                return p, poffs[i]
        return [], 0

    offs = sorted(r[0] * 8 for r in tex_recs)
    hdr_cursor = 0   # 4x4 header blocks are stored in texture dict order
    results = []
    for idx, (voff, param, _origw, flags) in enumerate(tex_recs):
        start = voff * 8
        end = tex_total
        for o in offs:
            if o > start:
                end = o
                break
        seg = tex_region[start:end]
        w = 8 << ((param >> 4) & 7)
        h = 8 << ((param >> 7) & 7)
        fmt_code = (param >> 26) & 7 if False else None
        name = tex_names[idx] if idx < len(tex_names) else f'tex{idx}'
        pal, pal_base = palette_for(name, idx)
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        px = img.load()
        fmt = None
        if len(seg) == w * h // 4 and hdr_region:
            fmt = '4x4'
            nblocks = (w // 4) * (h // 4)
            for b in range(nblocks):
                bx, by = (b % (w // 4)) * 4, (b // (w // 4)) * 4
                hdr = u16(hdr_region, (hdr_cursor + b) * 2)
                mode = (hdr >> 14) & 3
                addr = pal_base + (hdr & 0x3FFF) * 2
                cols = []
                for k in range(4):
                    a = addr + k * 2 - (pal_data_off and 0)
                    # pal_region is already relative to palette data start;
                    # addr counts from palette region start as well when the
                    # texture's palette is the region base. Held files store
                    # the block address relative to the palette region start:
                    cols.append(rgb555(u16(pal_region, (hdr & 0x3FFF) * 2 + k * 2))
                                if (hdr & 0x3FFF) * 2 + k * 2 + 1 < len(pal_region)
                                else (0, 0, 0))
                if mode == 0:
                    four = [cols[0], cols[1],
                            tuple((cols[0][c] + cols[1][c]) // 2 for c in range(3)),
                            None]
                elif mode == 1:
                    four = cols
                elif mode == 2:
                    four = [cols[0], cols[1],
                            tuple((3 * cols[0][c] + 5 * cols[1][c]) // 8 for c in range(3)),
                            tuple((5 * cols[0][c] + 3 * cols[1][c]) // 8 for c in range(3))]
                else:
                    four = [cols[0], cols[1], cols[2], None]
                for row in range(4):
                    byte = seg[b * 4 + row]
                    for x in range(4):
                        sel = (byte >> (2 * x)) & 3
                        c = four[sel]
                        if c is not None:
                            px[bx + x, by + row] = (c[0], c[1], c[2], 255)
            hdr_cursor += nblocks
        elif len(seg) == w * h // 4:
            fmt = '2bpp'
            for i in range(w * h):
                v = (seg[i // 4] >> (2 * (i % 4))) & 3
                if pal and v < len(pal):
                    c = pal[v]
                    px[i % w, i // w] = (c[0], c[1], c[2], 0 if (flags & 0x8000 and v == 0) else 255)
        elif len(seg) == w * h // 2:
            fmt = '4bpp'
            for i in range(w * h):
                byte = seg[i // 2]
                v = (byte & 0xF) if i % 2 == 0 else (byte >> 4)
                if pal and v < len(pal):
                    c = pal[v]
                    px[i % w, i // w] = (c[0], c[1], c[2], 0 if (flags & 0x8000 and v == 0) else 255)
        elif len(seg) == w * h * 2:
            fmt = 'direct16'
            for i in range(w * h):
                v = u16(seg, i * 2)
                c = rgb555(v)
                px[i % w, i // w] = (c[0], c[1], c[2], 255 if v & 0x8000 else 0)
        elif len(seg) == w * h:
            a5 = (flags & 0x7) == 6
            fmt = 'a5i3' if a5 else ('a3i5' if (flags & 0x7) == 1 else '8bpp')
            abits = 5 if a5 else 3
            for i in range(w * h):
                byte = seg[i]
                if fmt == '8bpp':
                    v = byte
                    if pal and v < len(pal):
                        c = pal[v]
                        px[i % w, i // w] = (c[0], c[1], c[2], 0 if (flags & 0x8000 and v == 0) else 255)
                else:
                    v = byte & ((1 << (8 - abits)) - 1)
                    a = (byte >> (8 - abits)) & ((1 << abits) - 1)
                    alpha = a * 255 // ((1 << abits) - 1)
                    if pal and v < len(pal):
                        c = pal[v]
                        px[i % w, i // w] = (c[0], c[1], c[2], alpha)
        else:
            results.append((name, f'SKIP unconfirmed size {len(seg)} for {w}x{h}'))
            continue
        img.save(os.path.join(outdir, name + '.png'))
        results.append((name, f'{fmt} {w}x{h}'))
    return results


def main():
    path, outdir = sys.argv[1], sys.argv[2]
    d = open(path, 'rb').read()
    if d[:4] == b'BTX0':
        tex0 = u32(d, 16)
    elif d[:4] == b'BMD0':
        n = struct.unpack_from('<H', d, 14)[0]
        tex0 = None
        for i in range(n):
            off = u32(d, 16 + 4 * i)
            if d[off:off + 4] == b'TEX0':
                tex0 = off
                break
        if tex0 is None:
            print('no TEX0 block (external textures)')
            return
    else:
        raise ValueError('unknown file magic')
    for name, info in decode_tex0(d, tex0, outdir):
        print(f'  {name}: {info}')


if __name__ == '__main__':
    main()
