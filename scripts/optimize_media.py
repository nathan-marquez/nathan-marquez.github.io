#!/usr/bin/env python3
"""Generate deployable media. Requires Pillow, ffmpeg and ffprobe; no build at runtime."""
import hashlib
import json
import io
import re
from pathlib import Path
import subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'media/optimized'
RECIPE = b'media-v1-webp82-h264crf23-30fps-1280-preview8s-crf27'


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)]))


def display_dimensions(stream):
    rotation = next((s.get('rotation', 0) for s in stream.get('side_data_list', []) if s.get('side_data_type') == 'Display Matrix'), 0)
    if abs(round(rotation)) % 180 == 90:
        return stream['height'], stream['width']
    return stream['width'], stream['height']


def run(args, target):
    if not target.exists():
        temporary = target.with_name('.' + target.stem + '.tmp' + target.suffix)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', *args, str(temporary)], check=True)
        temporary.replace(target)


def optimize(path):
    relative = path.relative_to(ROOT).as_posix()
    digest = hashlib.sha256(RECIPE + path.read_bytes()).hexdigest()[:10]
    stem = OUT / path.relative_to(ROOT / 'media').with_suffix('')
    stem.parent.mkdir(parents=True, exist_ok=True)
    name = f'{stem}.{digest}'
    url = lambda p: p.relative_to(ROOT).as_posix()
    if path.suffix.lower() in {'.jpg', '.jpeg', '.png'}:
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert('RGBA' if original.mode == 'RGBA' else 'RGB')
            max_width = 500 if relative == 'media/me.jpg' else 1520
            widths = sorted({min(image.width, w) for w in (480, 960, max_width) if w <= max_width} | {min(image.width, max_width)})
            variants = []
            for width in widths:
                resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                output = Path(f'{name}-{width}.webp')
                resized.save(output, 'WEBP', quality=82, method=6)
                variants.append((width, output, resized.height))
            default = next((v for v in variants if v[0] >= 760), variants[-1])
            entry = {'kind': 'image', 'src': url(default[1]), 'width': default[0], 'height': default[2],
                     'srcset': ', '.join(f'{url(p)} {w}w' for w, p, _ in variants)}
    else:
        info = probe(path)
        video = next(s for s in info['streams'] if s['codec_type'] == 'video' and not s.get('disposition', {}).get('attached_pic'))
        # Keep the one HDR phone clip in its original color space instead of washing out its highlights.
        hdr = video.get('color_transfer') in {'arib-std-b67', 'smpte2084'}
        width = min(video['width'], 1280)
        width -= width % 2
        height = round(video['height'] * width / video['width'] / 2) * 2
        full = Path(f'{name}-full.mp4')
        if hdr:
            run(['-i', str(path), '-map', '0:v:0', '-map', '0:a?', '-c', 'copy', '-tag:v', 'hvc1', '-movflags', '+faststart'], full)
            width, height = display_dimensions(video)
        else:
            run(['-i', str(path), '-map', '0:v:0', '-map', '0:a?', '-vf', f'scale={width}:{height},fps=30',
                 '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
                 '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart'], full)
        poster = Path(f'{name}-poster.webp')
        if not poster.exists():
            frame = subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-ss', '0.5', '-i', str(full), '-frames:v', '1', '-vf', 'scale=min(960\\,iw):-2', '-f', 'image2pipe', '-vcodec', 'png', '-threads', '1', '-'])
            Image.open(io.BytesIO(frame)).save(poster, 'WEBP', quality=80, method=6)
        preview = None
        # Only the first video of a post needs a feed preview.
        if relative in PREVIEWS:
            preview = Path(f'{name}-preview.mp4')
            run(['-i', str(full), '-t', '8', '-an', '-vf', 'scale=min(960\\,iw):-2,fps=24', '-c:v', 'libx264',
                 '-threads', '2', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], preview)
        entry = {'kind': 'video', 'src': url(full), 'poster': url(poster), 'width': width, 'height': height}
        if preview:
            entry['preview'] = url(preview)
        if hdr:
            entry['hdr'] = True
    print(f'{relative}: ready', flush=True)
    return relative, entry


PREVIEWS = {'media/soupy/soupy_demo.mp4', 'media/cursor_hackathon/cursor_demo.mp4',
            'media/writeaway/write_away.mp4', 'media/hellafast_demo.mp4',
            'media/ploopy/ploopy_demo.mp4', 'media/small_acadia.mp4'}

if __name__ == '__main__':
    inputs = [p for p in sorted((ROOT / 'media').rglob('*')) if p.is_file() and OUT not in p.parents
              and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.mp4', '.webm', '.mov'}]
    with ThreadPoolExecutor(max_workers=2) as pool:
        manifest = dict(pool.map(optimize, inputs))
    (ROOT / 'media-manifest.js').write_text('// Generated by scripts/optimize_media.py.\nwindow.siteMedia = ' + json.dumps(manifest, indent=2) + ';\n')
    report = []
    for source, entry in manifest.items():
        original = (ROOT / source).stat().st_size
        optimized = (ROOT / entry['src']).stat().st_size
        report.append({'source': source, 'originalBytes': original, 'optimizedBytes': optimized,
                       'previewBytes': (ROOT / entry['preview']).stat().st_size if 'preview' in entry else None})
    (ROOT / 'scripts/media-sizes.json').write_text(json.dumps(report, indent=2) + '\n')
    profile = manifest['media/me.jpg']
    index = ROOT / 'index.html'
    markup = f'<img src="{profile["src"]}" srcset="{profile["srcset"]}" sizes="(max-width: 600px) 200px, 250px" alt="Nathan Marquez" class="profile-pic" width="250" height="333" fetchpriority="high" decoding="async">'
    original_index = index.read_bytes()
    newline = '\r\n' if b'\r\n' in original_index else '\n'
    updated_index = re.sub(r'<img[^>]*class="profile-pic"[^>]*>', lambda _: markup, index.read_text())
    index.write_bytes(updated_index.replace('\n', newline).encode())
    print(f'Generated {len(manifest)} entries', flush=True)
