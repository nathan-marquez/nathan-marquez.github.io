# Media performance

Implement the four optimizations Nathan approved in chat: defer offscreen videos, use short portfolio previews, optimize images and full videos, and fetch displayed posts concurrently. Preserve the existing design, content, audio in full demos, links, pagination and GitHub Pages hosting.

Approach: keep the buildless site and original media. Generate optimized assets and a small synchronous media manifest; a shared browser helper renders responsive images and defers video sources until near the viewport. This avoids a framework migration or external hosting service. Portfolio previews are silent, short loops; full posts retain complete demos and controls. Respect reduced motion and data saving with manual playback.

Verification: behavioral DOM tests for loading boundaries, playback, pagination, concurrent fetches and failures; inspect desktop/mobile layout in the browser; validate generated assets, durations, audio, MP4 fast-start metadata and byte reductions. Push to the existing default branch after verification, as requested.
