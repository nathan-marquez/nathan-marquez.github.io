# Media Performance Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make portfolio media load quickly without changing the design.
**Architecture:** Generated WebP images, H.264 full demos, silent preview clips and poster frames, described by media-manifest.js. Shared media.js renders optimized images and manages viewport video loading. Fetch post Markdown concurrently in stable order.
**Tech Stack:** Vanilla JS, Python/Pillow, FFmpeg, Node test runner + jsdom.
**Spec:** docs/superpowers/specs/2026-11-06-media-performance-design.md

## Global Constraints
- Preserve content, full demo duration/audio, page URLs, ordering and GitHub Pages.
- No runtime framework or external media service.
- Original assets remain available; future unmapped media must still work.

## Review Focus
- Reduced motion/data saving and missing IntersectionObserver retain manual controls.
- Pagination changes cannot let an earlier request overwrite the current page.
- A failed post cannot hide successful posts.
- Full demos retain audio and duration, including portrait and HDR input.
- Offscreen media sources stay absent until near the viewport.

### Task 1: Generate optimized assets
- [x] Add scripts/optimize_media.py to generate responsive WebP images, poster frames, short silent previews and fast-start H.264 full demos. Write media-manifest.js and a size report.
- [x] Verify all outputs exist, fit their size bounds, preserve full duration/audio, and have MP4 moov before mdat.

### Task 2: Media rendering and feed loading
- [x] Write tests/media.test.cjs and tests/blog.test.cjs covering deferred loading, optimized sources, fallbacks, playback preferences, concurrent loading, errors, order and stale pagination responses; observe failures.
- [x] Implement media.js and integrate it into index.html, portfolio.html, post.html and blog.js. Fetch posts concurrently into ordered placeholders, guarding stale responses.
- [x] Run node --test tests/*.test.cjs and syntax checks; expected zero failures.

### Task 3: Verify and publish
- [x] Inspect preview pages in the browser, including both portfolio pages and long posts.
- [x] Review the complete diff and address material findings; rerun tests.
- [ ] Commit, push HEAD to master without force, wait for GitHub Pages, and verify deployed assets.

## Verification record

22 JavaScript behavioral/integration tests and the rotation regression test pass.
All 34 generated media entries pass path, duration, audio, dimensions and MP4
fast-start checks. All 19 full videos/previews decode without errors. Browser
checks cover desktop, a 390 px phone viewport, both portfolio pages, offscreen
source deferral, full-demo playback, homepage sizing and first-click native
manual playback in reduced-motion mode.

Independent review found rapid-click pagination and rotated HDR dimensions;
both have RED→GREEN regression coverage. Browser testing additionally found
that empty-source native controls consumed the first manual click; manual
mode now supplies a source with preload=none, confirmed not buffered before
interaction and playing on the first click. Source assets and full-demo audio
remain intact. The HDR clip keeps its original HEVC/HLG color data through a
fast-start remux. No additional hosting or runtime framework was introduced.
