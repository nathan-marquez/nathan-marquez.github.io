const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { JSDOM } = require('jsdom');

function setup({ reduced = false, saveData = false, observer = true } = {}) {
    const dom = new JSDOM('<main></main>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/' });
    const w = dom.window;
    w.siteMedia = {
        'media/demo.mp4': { kind: 'video', src: 'media/demo-full.mp4', preview: 'media/demo-preview.mp4', poster: 'media/demo.webp', width: 1280, height: 720 },
        'media/photo.jpg': { kind: 'image', src: 'media/photo.webp', srcset: 'media/photo-small.webp 480w, media/photo.webp 960w', width: 960, height: 640 }
    };
    w.matchMedia = () => ({ matches: reduced });
    Object.defineProperty(w.navigator, 'connection', { value: { saveData } });
    const observers = [];
    if (observer) w.IntersectionObserver = class {
        constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
        observe(target) { this.targets.push(target); }
        unobserve(target) { this.targets = this.targets.filter(t => t !== target); }
        disconnect() { this.targets = []; }
    };
    w.HTMLMediaElement.prototype.load = function () { this.loads = (this.loads || 0) + 1; };
    w.HTMLMediaElement.prototype.play = function () { this.plays = (this.plays || 0) + 1; return Promise.resolve(); };
    w.HTMLMediaElement.prototype.pause = function () { this.pauses = (this.pauses || 0) + 1; };
    if (existsSync('media.js')) w.eval(readFileSync('media.js', 'utf8'));
    assert.ok(w.SiteMedia, 'Shared media loader is available');
    return { w, dom, root: w.document.querySelector('main'), observers };
}

test('full demos stay unfetched offscreen, load near view, play only in view and pause on exit', () => {
    const { w, root, observers } = setup();
    root.innerHTML = w.SiteMedia.videoHTML('media/demo.mp4', { controls: true });
    w.SiteMedia.activate(root);
    const video = root.querySelector('video');
    assert.equal(video.getAttribute('src'), null);
    assert.equal(video.poster, 'https://example.test/media/demo.webp');
    assert.equal(video.width, 1280);
    observers[0].callback([{ target: video, isIntersecting: true }]);
    assert.equal(video.getAttribute('src'), 'media/demo-full.mp4');
    assert.equal(video.loads, 1);
    assert.equal(video.plays, undefined);
    observers[1].callback([{ target: video, isIntersecting: true }]);
    assert.equal(video.plays, 1);
    observers[1].callback([{ target: video, isIntersecting: false }]);
    assert.equal(video.pauses, 1);
    // A full demo is not automatically restarted after the user has paused or left it.
    observers[1].callback([{ target: video, isIntersecting: true }]);
    assert.equal(video.plays, 1);
});

test('portfolio uses a short silent preview and resumes it on re-entry', () => {
    const { w, root, observers } = setup();
    root.innerHTML = w.SiteMedia.videoHTML('media/demo.mp4', { preview: true });
    w.SiteMedia.activate(root);
    const video = root.querySelector('video');
    observers[0].callback([{ target: video, isIntersecting: true }]);
    assert.equal(video.getAttribute('src'), 'media/demo-preview.mp4');
    assert.equal(video.muted, true);
    observers[1].callback([{ target: video, isIntersecting: true }]);
    observers[1].callback([{ target: video, isIntersecting: false }]);
    observers[1].callback([{ target: video, isIntersecting: true }]);
    assert.equal(video.plays, 2);
    w.SiteMedia.disconnect();
    assert.ok(observers.every(o => o.targets.length === 0));
});

for (const option of [{ reduced: true }, { saveData: true }, { observer: false }]) {
    test(`manual playback remains available with ${JSON.stringify(option)}`, () => {
        const { w, root } = setup(option);
        root.innerHTML = w.SiteMedia.videoHTML('media/demo.mp4', { controls: true });
        w.SiteMedia.activate(root);
        const video = root.querySelector('video');
        assert.equal(video.getAttribute('src'), 'media/demo-full.mp4', 'Native controls need a source before the first click');
        assert.equal(video.controls, true);
        assert.equal(video.preload, 'none', 'Manual mode must not buffer before play');
        assert.equal(video.loads, undefined);
        assert.equal(video.plays, undefined);
    });
}

test('post content uses optimized responsive images and converts video images before insertion', () => {
    const { w, root } = setup();
    root.innerHTML = w.SiteMedia.prepareContent('<p><img src="media/photo.jpg" alt="A &amp; B"><img src="media/demo.mp4" alt="Demo"><img src="media/new.jpg" alt="New"></p>');
    const images = root.querySelectorAll('img');
    assert.equal(images.length, 2);
    assert.equal(images[0].getAttribute('src'), 'media/photo.webp');
    assert.equal(images[0].alt, 'A & B');
    assert.equal(images[0].width, 960);
    assert.equal(images[0].getAttribute('loading'), 'eager');
    assert.ok(images[0].srcset.includes('480w'));
    assert.equal(images[1].getAttribute('src'), 'media/new.jpg');
    assert.equal(images[1].getAttribute('loading'), 'lazy');
    assert.equal(root.querySelector('video').getAttribute('src'), null);
    assert.equal(root.querySelector('video').getAttribute('aria-label'), 'Demo');
});

test('unknown videos and raw video tags keep usable controls and do not fetch eagerly', () => {
    const { w, root } = setup();
    root.innerHTML = w.SiteMedia.prepareContent('<video src="media/new.mp4" controls></video><video controls><source src="media/other.webm" type="video/webm"></video>');
    for (const video of root.querySelectorAll('video')) {
        assert.equal(video.getAttribute('src'), null);
        assert.equal(video.controls, true);
        assert.ok(video.dataset.src);
        assert.equal(video.querySelector('source[src]'), null);
    }
});
