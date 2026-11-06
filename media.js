/* Shared media rendering. Sources are attached only when a video is near the viewport. */
(() => {
    const assets = window.siteMedia || {};
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    let loadObserver;
    let playObserver;
    const activeVideos = new Set();
    const started = new WeakSet();

    function imageHTML(src, alt = '', { eager = false, profile = false } = {}) {
        const asset = assets[src];
        const dimensions = asset ? ` width="${asset.width}" height="${asset.height}" srcset="${escape(asset.srcset)}" sizes="${profile ? '(max-width: 600px) 200px, 250px' : '(max-width: 800px) calc(100vw - 40px), 760px'}"` : '';
        return `<img src="${escape(asset?.src || src)}" alt="${escape(alt)}"${dimensions} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
    }

    function videoHTML(src, { preview = false, controls = false, alt = '' } = {}) {
        const asset = assets[src];
        const source = preview ? (asset?.preview || asset?.src || src) : (asset?.src || src);
        const dimensions = asset ? ` width="${asset.width}" height="${asset.height}" poster="${escape(asset.poster)}"` : '';
        return `<video data-src="${escape(source)}" data-preview="${preview}"${dimensions} preload="none" loop muted playsinline${controls ? ' controls' : ''}${alt ? ` aria-label="${escape(alt)}"` : ''}></video>`;
    }

    // Transform inside an inert template, before original media URLs can start downloading.
    function prepareContent(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        let firstImage = true;
        template.content.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (/\.(mp4|webm|mov)(?:[?#]|$)/i.test(src)) {
                img.outerHTML = videoHTML(src, { controls: true, alt: img.alt });
            } else {
                img.outerHTML = imageHTML(src, img.alt, { eager: firstImage });
                firstImage = false;
            }
        });
        template.content.querySelectorAll('video:not([data-src])').forEach(video => {
            const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
            if (src) video.outerHTML = videoHTML(src, { controls: true, alt: video.getAttribute('aria-label') || '' });
        });
        return template.innerHTML;
    }

    function load(video) {
        if (!video.dataset.src) return;
        video.src = video.dataset.src;
        delete video.dataset.src;
        video.preload = 'metadata';
        video.load();
    }

    function play(video) {
        // Playback may be blocked by browser policy; the poster and controls still work.
        video.play()?.catch(() => {});
    }

    function activate(root) {
        const manualOnly = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData || !('IntersectionObserver' in window);
        if (!manualOnly && !loadObserver) {
            loadObserver = new IntersectionObserver(entries => {
                for (const { target, isIntersecting } of entries) {
                    if (isIntersecting) {
                        load(target);
                        loadObserver.unobserve(target);
                    }
                }
            }, { rootMargin: '250px 0px' });
            playObserver = new IntersectionObserver(entries => {
                for (const { target, isIntersecting } of entries) {
                    if (!isIntersecting) {
                        target.pause();
                    } else if (!document.hidden && (target.dataset.preview === 'true' || !started.has(target))) {
                        load(target);
                        started.add(target);
                        play(target);
                    }
                }
            }, { threshold: 0.1 });
        }
        root.querySelectorAll('video[data-src]').forEach(video => {
            if (activeVideos.has(video)) return;
            activeVideos.add(video);
            video.muted = true;
            // These run before the native play button's click/keyboard action.
            video.addEventListener('pointerdown', () => load(video));
            video.addEventListener('focus', () => load(video));
            video.addEventListener('keydown', event => {
                if (event.key === ' ' || event.key === 'Enter') load(video);
            });
            if (manualOnly) {
                if (video.dataset.preview !== 'true') {
                    // A source plus preload=none enables native controls without buffering.
                    // Empty-source native controls otherwise consume the first click just loading.
                    video.controls = true;
                    video.src = video.dataset.src;
                    delete video.dataset.src;
                }
            } else {
                loadObserver.observe(video);
                playObserver.observe(video);
            }
        });
    }

    function disconnect() {
        loadObserver?.disconnect();
        playObserver?.disconnect();
        loadObserver = playObserver = undefined;
        for (const video of activeVideos) video.pause();
        activeVideos.clear();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) for (const video of activeVideos) video.pause();
    });

    window.SiteMedia = { imageHTML, videoHTML, prepareContent, activate, disconnect };
})();
