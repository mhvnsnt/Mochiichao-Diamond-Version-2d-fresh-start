#!/usr/bin/env python3
"""
NSBMD (Nitro BMD0/MDL0) -> web JSON converter for the Mochiichao 3D world lane.

Port of the NSBMD model format as held in the extracted corpus
(~/workspace/env-pullin-hgss-bw2/extracted). Structure reverse-engineered from
the held files themselves (see MODEL-CENSUS.md for the layout notes):

  BMD0 header -> block table -> MDL0 (+ optional TEX0)
  MDL0: model dict (16-byte names) -> ModelInfo
    ModelInfo+0x00  u32  (points at tail data; not the SBC in these exports)
    ModelInfo+0x04  u32  offset -> section A (unused here)
    ModelInfo+0x08  u32  offset -> materials section (u32 hdr, then mat dict)
    ModelInfo+0x0C  u32  offset -> shapes dict
    ModelInfo+0x1C  fx32 posScale (vertex fixed-point scale, 20.12)
  Dict: {u8 rev, u8 count, u16 total, u16 entrySize, u16 entryOff} + patricia
        tree + records + count*16-byte names. For the materials dict the
        "records" are a table of u32 offsets (stride = MaterialData size)
        relative to the materials-section base.
  MaterialData (44 bytes): tag u16, size u16 (0x2C), diffAmb u32, specEmi u32,
        polyAttr u32, polyAttrMask u32, texImageParam u32, texPlttBase u32,
        texScaleS/T fx16, rotSin/Cos fx16, transS/T fx16, ...
  Shapes: after the shapes dict come count 16-byte shape headers
        {u32 flag, u32 primRelated, u32 dlOffset, u32 dlSize}; each
        shape has its own display list, starting at
        shapeHeadersBase + dlOffset + 16*i (the offset is relative
        to the shape's own header) and running dlSize-16 bytes
        (validated on land + building files: every shape parses
        standalone with coherent bounds).
  Display lists: GX FIFO packed format - one u32 holds 4 command bytes,
        followed by each command's parameter words in order.

Material -> texture binding: by name (material name minus a trailing
"_lm<digits>" light suffix = texture name), the DS field convention.
Shape -> material binding: dict order (shape i uses material i) when the
counts match; otherwise shapes fall back to material 0 and the JSON records
bindingConfidence accordingly.

GX vertex commands interpreted: MTX_* (matrix stack, restore = identity for
these field models), COLOR, NORMAL, TEXCOORD, VTX_16/10/XY/XZ/DIFF,
POLYGON_ATTR, TEXIMAGE_PARAM, PLTT_BASE, BEGIN_VTXS/END_VTXS.
Primitive types: triangles, quads, tri-strip, quad-strip -> triangle list.

Output JSON:
  { name, posScale,
    materials: [{name, texName, polyAttr}],
    shapes: [{name, tris: [[x,y,z, u,v, nx,ny,nz] x N] (N % 3 == 0)],
             bounds: [minx,miny,minz,maxx,maxy,maxz]}],
    bindingConfidence: "order" | "fallback" }
Coordinates are raw DS units * posScale already applied (fx decode).
UVs are in texel units (divide by texture size at render time).
"""
import json
import re
import struct
import sys


def u32(d, o):
    return struct.unpack_from('<I', d, o)[0]


def u16(d, o):
    return struct.unpack_from('<H', d, o)[0]


def s16(d, o):
    return struct.unpack_from('<h', d, o)[0]


def find_dicts(d, start, end):
    """Scan for valid dict headers; return list of dict descriptors."""
    out = []
    off = start
    while off < end - 8:
        rev, cnt = d[off], d[off + 1]
        if rev == 0 and 1 <= cnt <= 90:
            tot, es, eo = u16(d, off + 2), u16(d, off + 4), u16(d, off + 6)
            if es == 8 and 12 <= eo <= 240 and tot >= 40 and off + tot <= end:
                # validate names zone: cnt consecutive 16B printable names
                found = None
                for nz in range(off + 8, off + tot - 16 * cnt + 1):
                    ok = True
                    for i in range(cnt):
                        s = d[nz + i * 16: nz + i * 16 + 16]
                        z = s.find(b'\x00')
                        name = s[:z] if z >= 0 else s
                        if len(name) < 2 or any(b < 0x20 or b > 0x7e for b in name):
                            ok = False
                            break
                    if ok:
                        found = nz
                        break
                if found is not None:
                    names = [d[found + i * 16: found + i * 16 + 16]
                             .split(b'\x00')[0].decode() for i in range(cnt)]
                    out.append({'off': off, 'count': cnt, 'total': tot,
                                'names': names, 'namesOff': found})
                    off += tot
                    continue
        off += 4
    return out


PARAM_COUNT = {
    0x10: 0, 0x11: 1, 0x12: 1, 0x13: 1, 0x14: 0, 0x15: 16, 0x16: 12,
    0x17: 16, 0x18: 12, 0x19: 9, 0x1A: 3, 0x1B: 3,
    0x20: 1, 0x21: 1, 0x22: 1, 0x23: 2, 0x24: 1, 0x25: 1, 0x26: 1, 0x27: 1,
    0x30: 1, 0x31: 1, 0x32: 1, 0x33: 1, 0x34: 1, 0x35: 1, 0x36: 1, 0x37: 32,
    0x40: 1, 0x41: 0, 0x50: 1, 0x60: 1, 0x70: 1, 0x71: 0, 0x72: 1,
}


def s10(v):
    v &= 0x3FF
    return v - 0x400 if v & 0x200 else v


def run_dl(dl, pos_scale, spans=None):
    """Execute one GX display list; return list of vertices
    [x, y, z, u, v] grouped in triangles (flat list, len % 3 == 0).
    If spans (sorted list of (end_offset, tag)) is given, each vertex is
    returned as [x, y, z, u, v, tag] where tag is the span active at the
    byte offset of the vertex's command (NSBMD models store ONE continuous
    display list; the shape headers carve it into per-shape spans)."""
    verts = []          # current primitive's vertices
    tris = []
    pos = [0.0, 0.0, 0.0]
    uv = [0.0, 0.0]
    prim = None
    i = 0
    n = len(dl)

    def tag_at(off):
        if not spans:
            return 0
        for end, tag in spans:
            if off < end:
                return tag
        return spans[-1][1]

    def emit(v):
        verts.append(v)

    def flush():
        nonlocal verts
        if prim is None or len(verts) < 3:
            verts = []
            return
        if prim == 0:      # separate triangles
            for k in range(0, len(verts) - 2, 3):
                tris.extend(verts[k:k + 3])
        elif prim == 1:    # separate quads
            for k in range(0, len(verts) - 3, 4):
                a, b, c, dd = verts[k:k + 4]
                tris.extend([a, b, c, a, c, dd])
        elif prim == 2:    # triangle strip
            for k in range(len(verts) - 2):
                if k % 2 == 0:
                    tris.extend([verts[k], verts[k + 1], verts[k + 2]])
                else:
                    tris.extend([verts[k + 1], verts[k], verts[k + 2]])
        elif prim == 3:    # quad strip
            for k in range(0, len(verts) - 3, 2):
                a, b, c, dd = verts[k], verts[k + 1], verts[k + 2], verts[k + 3]
                tris.extend([a, b, c, b, dd, c])
        verts = []

    while i + 4 <= n:
        cmd_word = u32(dl, i)
        i += 4
        cmds = [cmd_word & 0xFF, (cmd_word >> 8) & 0xFF,
                (cmd_word >> 16) & 0xFF, (cmd_word >> 24) & 0xFF]
        for cmd in cmds:
            if cmd == 0x00:
                continue
            cmd_off = i
            pc = PARAM_COUNT.get(cmd)
            if pc is None:
                raise ValueError(f'unknown GX command {cmd:#x} at dl {i:#x}')
            params = []
            for _ in range(pc):
                if i + 4 > n:
                    params.append(0)
                else:
                    params.append(u32(dl, i))
                i += 4
            if cmd == 0x40:        # BEGIN_VTXS
                flush()
                prim = params[0] & 0xFF
            elif cmd == 0x41:      # END_VTXS
                flush()
                prim = None
            elif cmd == 0x22:      # TEXCOORD: s16 s, s16 t in 12.4 texel fixed
                w = params[0]
                uv = [s16v(w & 0xFFFF) / 16.0, s16v((w >> 16) & 0xFFFF) / 16.0]
            elif cmd == 0x23:      # VTX_16: s16 x,y (12 frac), s16 z
                w0, w1 = params
                pos = [s16v(w0 & 0xFFFF) / 4096.0 * pos_scale,
                       s16v((w0 >> 16) & 0xFFFF) / 4096.0 * pos_scale,
                       s16v(w1 & 0xFFFF) / 4096.0 * pos_scale]
                emit((pos[0], pos[1], pos[2], uv[0], uv[1], tag_at(cmd_off)))
            elif cmd == 0x24:      # VTX_10: 3x s10, 6 frac
                w = params[0]
                pos = [s10(w) / 64.0 * pos_scale,
                       s10(w >> 10) / 64.0 * pos_scale,
                       s10(w >> 20) / 64.0 * pos_scale]
                emit((pos[0], pos[1], pos[2], uv[0], uv[1], tag_at(cmd_off)))
            elif cmd == 0x25:      # VTX_XY
                w = params[0]
                pos[0] = s16v(w & 0xFFFF) / 4096.0 * pos_scale
                pos[1] = s16v((w >> 16) & 0xFFFF) / 4096.0 * pos_scale
                emit((pos[0], pos[1], pos[2], uv[0], uv[1], tag_at(cmd_off)))
            elif cmd == 0x26:      # VTX_XZ
                w = params[0]
                pos[0] = s16v(w & 0xFFFF) / 4096.0 * pos_scale
                pos[2] = s16v((w >> 16) & 0xFFFF) / 4096.0 * pos_scale
                emit((pos[0], pos[1], pos[2], uv[0], uv[1], tag_at(cmd_off)))
            elif cmd == 0x27:      # VTX_DIFF: s10 offsets added.
                # Empirically (held land DLs) the offsets behave as 9-frac-bit
                # values in vertex space (median step ~42 DS units at
                # posScale 64); the textbook 6-frac reading gives impossible
                # 300+ unit steps on every one of 312 samples. See census.
                w = params[0]
                pos[0] += s10(w) / 512.0 * pos_scale
                pos[1] += s10(w >> 10) / 512.0 * pos_scale
                pos[2] += s10(w >> 20) / 512.0 * pos_scale
                emit((pos[0], pos[1], pos[2], uv[0], uv[1], tag_at(cmd_off)))
            # all other commands (matrix stack, colors, attrs) are consumed
            # for stream alignment; field models are single-node/identity.
    flush()
    return tris


def s16v(v):
    return v - 0x10000 if v & 0x8000 else v


def convert(path, bind_mode='order'):
    d = open(path, 'rb').read()
    if d[:4] != b'BMD0':
        raise ValueError('not BMD0')
    nblocks = struct.unpack_from('<H', d, 14)[0]
    block_offs = [u32(d, 16 + 4 * i) for i in range(nblocks)]
    mdl0 = block_offs[0]
    mdl0_size = u32(d, mdl0 + 4)
    mdl_end = mdl0 + mdl0_size

    dicts = find_dicts(d, mdl0 + 8, mdl_end)
    model_dict = dicts[0]
    mi = mdl0 + u32(d, model_dict['namesOff'] - 8 + 4)  # record: {u32, u32 off}
    # record zone = namesOff - count*8; second word of first record:
    mi = mdl0 + u32(d, model_dict['namesOff'] - model_dict['count'] * 8 + 4)

    pos_scale = u32(d, mi + 0x1C) / 4096.0
    mat_sec = mi + u32(d, mi + 0x08)
    shapes_dict_off = mi + u32(d, mi + 0x0C)

    # materials dict = first dict at/after mat_sec
    mat_dict = next(x for x in dicts if x['off'] >= mat_sec)
    # material records: u32 offset table inside the dict (stride const)
    mat_offsets = None
    cnt = mat_dict['count']
    for t in range(mat_dict['off'] + 8, mat_dict['namesOff'] - 4 * cnt + 1, 4):
        vals = [u32(d, t + 4 * i) for i in range(cnt)]
        diffs = [vals[i + 1] - vals[i] for i in range(cnt - 1)]
        if vals[0] > 0 and (cnt == 1 or all(x == diffs[0] and x > 0 for x in diffs)):
            mat_offsets = vals
            mat_stride = diffs[0]
            break
    materials = []
    if mat_offsets:
        for i, name in enumerate(mat_dict['names']):
            mo = mat_sec + mat_offsets[i]
            tex_param = u32(d, mo + 0x14)
            tex_name = re.sub(r'_lm\d+$', '', name)
            materials.append({
                'name': name, 'texName': tex_name,
                'polyAttr': u32(d, mo + 0x0C),
                'texParam': tex_param,
                'repeatS': (tex_param >> 16) & 1, 'flipS': (tex_param >> 17) & 1,
                'repeatT': (tex_param >> 18) & 1, 'flipT': (tex_param >> 19) & 1,
            })

    # shapes: each shape has its OWN display list. The header's
    # dlOffset is relative to the shape's own header position, so
    # DL i starts at headers_base + dlOffset_i + 16*i and runs
    # dlSize_i - 16 bytes (the size counts the 16-byte header).
    # (An earlier continuous-stream reading parsed without errors
    # but silently scrambled geometry across shape boundaries —
    # caught by the lane's offline render check, 2026-10-30.)
    sh = next(x for x in dicts if x['off'] == shapes_dict_off)
    headers_base = sh['off'] + sh['total']
    shapes = []
    for i, name in enumerate(sh['names']):
        ho = headers_base + i * 16
        dl_off, dl_size = u32(d, ho + 8), u32(d, ho + 12)
        dl_start = headers_base + dl_off + i * 16
        dl = d[dl_start: dl_start + max(0, dl_size - 16)]
        try:
            tris = run_dl(dl, pos_scale)
        except ValueError as e:
            tris = []
            print(f'  shape {name}: DL error {e}', file=sys.stderr)
        flat = []
        for v in tris:
            flat.extend([round(v[0], 3), round(v[1], 3), round(v[2], 3),
                         round(v[3], 2), round(v[4], 2)])
        xs = [v[0] for v in tris] or [0]
        ys = [v[1] for v in tris] or [0]
        zs = [v[2] for v in tris] or [0]
        shapes.append({'name': name, 'matIndex': i if i < len(materials) else 0,
                       'verts': flat,
                       'bounds': [min(xs), min(ys), min(zs),
                                  max(xs), max(ys), max(zs)],
                       'triCount': len(tris) // 3})
    binding = 'order' if len(materials) == len(shapes) else 'partial'
    if bind_mode == 'fit' and materials and shapes:
        binding = fit_bind(shapes, materials, model_dict['names'][0])
    return {
        'name': model_dict['names'][0],
        'posScale': pos_scale,
        'materials': materials,
        'shapes': shapes,
        'bindingConfidence': binding,
    }


def fit_bind(shapes, materials, model_name):
    """Evidence-based shape->material binding for building models, whose
    dict order does NOT match shape order (verified: wk_h01's main shell
    carries UVs spanning exactly its 64x64 wall texture while dict order
    would bind the 16x16 shadow texture). Rules, in order:
      1. a shadow-named material (kage/shadow) binds the flattest,
         lowest shape (the ground shadow plane);
      2. remaining shapes by triangle count (desc) bind the model's own
         primary materials (name shares the model's family prefix),
         in name order;
      3. leftover shapes bind leftover materials by UV-range fit.
    Mutates shapes' matIndex; returns 'fit'."""
    def is_shadow(m):
        return 'kage' in m['name'] or 'shadow' in m['name']

    def flatness(s):
        b = s['bounds']
        return (b[4] - b[1], b[1])  # (height span, base height)

    used_m = set()
    used_s = set()
    shadow_ms = [i for i, m in enumerate(materials) if is_shadow(m)]
    if shadow_ms:
        cand = sorted(range(len(shapes)), key=lambda i: flatness(shapes[i]))
        s0 = cand[0]
        shapes[s0]['matIndex'] = shadow_ms[0]
        used_m.add(shadow_ms[0])
        used_s.add(s0)
    fam = model_name.split('_')[0] + '_' if '_' in model_name else model_name
    primary = [i for i, m in enumerate(materials)
               if i not in used_m and not is_shadow(m)
               and (m['texName'].startswith(fam) or fam.rstrip('_') in m['texName'])]
    rest_s = sorted([i for i in range(len(shapes)) if i not in used_s],
                    key=lambda i: -shapes[i]['triCount'])
    for k, si in enumerate(rest_s):
        if k < len(primary):
            shapes[si]['matIndex'] = primary[k]
            used_m.add(primary[k])
            used_s.add(si)
    leftover_m = [i for i in range(len(materials)) if i not in used_m]
    for si in [i for i in range(len(shapes)) if i not in used_s]:
        if leftover_m:
            shapes[si]['matIndex'] = leftover_m.pop(0)
    return 'fit'


if __name__ == '__main__':
    bind = 'fit' if '--bind' in sys.argv and sys.argv[sys.argv.index('--bind') + 1] == 'fit' else 'order'
    args = [a for a in sys.argv[1:] if a != '--bind' and a != 'fit']
    out = convert(args[0], bind)
    dest = args[1]
    with open(dest, 'w') as f:
        json.dump(out, f)
    print(f"{out['name']}: {len(out['shapes'])} shapes, "
          f"{sum(s['triCount'] for s in out['shapes'])} tris, "
          f"binding={out['bindingConfidence']}")
    for s in out['shapes']:
        b = s['bounds']
        print(f"  {s['name']}: {s['triCount']} tris bounds "
              f"[{b[0]:.1f},{b[1]:.1f},{b[2]:.1f}]..[{b[3]:.1f},{b[4]:.1f},{b[5]:.1f}]")
