import struct, sys
def seq_table(path):
    d = open(path,'rb').read()
    assert d[:4]==b'SDAT', d[:4]
    # chunks: SDAT header 16 bytes: magic(4) bom(2) ver(2) filesize(4) headersize(2) nblocks(2)
    hdr_size = struct.unpack('<H', d[12:14])[0]
    # block offsets follow: SYMB ofs, SYMB size, INFO ofs, INFO size, FAT, FILE
    symb_ofs, symb_size = struct.unpack('<II', d[16:24])
    base = symb_ofs
    assert d[base:base+4]==b'SYMB', d[base:base+4]
    rec_ofs = struct.unpack('<8I', d[base+8:base+40])
    seq_rec = base + rec_ofs[0]
    n = struct.unpack('<I', d[seq_rec:seq_rec+4])[0]
    names = []
    for i in range(n):
        o = struct.unpack('<I', d[seq_rec+4+4*i:seq_rec+8+4*i])[0]
        if o == 0: names.append(None); continue
        s = base + o
        e = d.index(b'\x00', s)
        names.append(d[s:e].decode('ascii', 'replace'))
    return names
for label, path in [
  ('HGSS gs_sound_data.sdat', '/home/hatch/workspace/pokemon-code-study/projects/pret-pokeheartgold/files/data/sound/gs_sound_data.sdat'),
  ('DIAMOND sound_data.sdat', '/home/hatch/workspace/pokemon-code-study/projects/pret-pokediamond/files/data/sound/sound_data.sdat'),
  ('BLACK wb_sound_data.sdat', '/home/hatch/workspace/pokemon-black-decomp/pokeblack/files/wb_sound_data.sdat'),
]:
    try:
        names = seq_table(path)
        print(f'== {label}: {len(names)} SEQ entries')
        for i,nm in enumerate(names):
            if nm and ('LVUP' in nm or 'LEVEL' in nm or 'VICTORY' in nm or nm.startswith('SEQ_ME')):
                print(f'  SEQ {i} (0x{i:03X}): {nm}')
    except Exception as e:
        print(f'== {label}: FAILED {e}')
