#!/usr/bin/env python3
"""Validate generated paths, video duration/audio, previews and MP4 fast start."""
import json
from pathlib import Path
import struct
from optimize_media import ROOT, probe, display_dimensions


def atoms(path):
    result = []
    with path.open('rb') as stream:
        while True:
            header = stream.read(8)
            if not header:
                break
            size, kind = struct.unpack('>I4s', header)
            header_size = 8
            if size == 1:
                size = struct.unpack('>Q', stream.read(8))[0]
                header_size = 16
            result.append(kind)
            if size == 0:
                break
            assert size >= header_size, f'Invalid MP4 atom: {path}'
            stream.seek(size - header_size, 1)
    return result


if __name__ == '__main__':
    manifest = json.loads((ROOT / 'media-manifest.js').read_text().split('window.siteMedia = ', 1)[1].rstrip(';\n'))
    for original, asset in manifest.items():
        output = ROOT / asset['src']
        assert output.is_file() and output.stat().st_size > 0, output
        if asset['kind'] == 'image':
            for candidate in asset['srcset'].split(', '):
                assert (ROOT / candidate.rsplit(' ', 1)[0]).is_file(), candidate
            continue
        assert (ROOT / asset['poster']).is_file()
        before, after = probe(ROOT / original), probe(output)
        assert abs(float(before['format']['duration']) - float(after['format']['duration'])) < 0.15, original
        assert any(s['codec_type'] == 'audio' for s in before['streams']) == any(s['codec_type'] == 'audio' for s in after['streams']), f'Audio changed: {original}'
        video = next(s for s in after['streams'] if s['codec_type'] == 'video')
        assert display_dimensions(video) == (asset['width'], asset['height']), original
        if not asset.get('hdr'):
            assert video['codec_name'] == 'h264' and video['pix_fmt'] in {'yuv420p', 'yuvj420p'}, original
        for path in [output] + ([ROOT / asset['preview']] if 'preview' in asset else []):
            kinds = atoms(path)
            assert kinds.index(b'moov') < kinds.index(b'mdat'), f'Not fast-start: {path}'
        if 'preview' in asset:
            preview = probe(ROOT / asset['preview'])
            assert float(preview['format']['duration']) <= 8.1
            assert not any(s['codec_type'] == 'audio' for s in preview['streams'])
    sizes = json.loads((ROOT / 'scripts/media-sizes.json').read_text())
    original = sum(r['originalBytes'] for r in sizes)
    optimized = sum(r['optimizedBytes'] for r in sizes)
    assert optimized < original / 2
    print(f'Validated {len(manifest)} assets; primary media {original / 1e6:.1f} MB → {optimized / 1e6:.1f} MB ({1 - optimized / original:.1%} smaller).')
