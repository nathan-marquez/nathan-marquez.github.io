const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setImmediate(resolve));

async function page(filename, query = '') {
    const dom = new JSDOM(readFileSync(filename, 'utf8'), { runScripts: 'outside-only', pretendToBeVisual: true, url: `https://example.test/${filename}${query}` });
    const w = dom.window;
    w.fetch = async url => ({ ok: existsSync(url), status: existsSync(url) ? 200 : 404,
        text: async () => readFileSync(url, 'utf8'), json: async () => JSON.parse(readFileSync(url, 'utf8')) });
    w.HTMLMediaElement.prototype.pause = () => {};
    w.scrollTo = () => {};
    await tick();
    for (const script of w.document.scripts) {
        const src = script.getAttribute('src');
        assert.ok(!src || !src.startsWith('https:'), 'Content rendering must not depend on a third party script request');
        w.eval(src ? readFileSync(src.split('?')[0], 'utf8') : script.textContent);
    }
    await tick();
    return w;
}

test('homepage shows four recent links without fetching video media', async () => {
    const w = await page('index.html');
    assert.equal(w.document.querySelectorAll('.post-preview').length, 4);
    assert.equal(w.document.querySelectorAll('video').length, 0);
    const profile = w.document.querySelector('.profile-pic');
    assert.ok(profile.getAttribute('src').endsWith('.webp'));
    assert.ok(existsSync(profile.getAttribute('src')));
    assert.ok(profile.getAttribute('srcset').includes('500w'));
});

test('portfolio preserves five/four pagination, media covers, links and ordering', async () => {
    const w = await page('portfolio.html');
    assert.equal(w.document.querySelectorAll('.post').length, 5);
    assert.ok(w.document.querySelector('h3').textContent.startsWith('Soupy'));
    for (const video of w.document.querySelectorAll('video')) assert.ok(existsSync(video.getAttribute('poster')));
    w.document.querySelector('#pagination button').click();
    await tick();
    assert.equal(w.document.querySelectorAll('.post').length, 4);
    assert.ok(w.document.querySelector('h3').textContent.startsWith('Ploopy'));
    assert.ok(w.document.querySelector('#pagination').textContent.includes('Page 2 of 2'));
});

for (const post of JSON.parse(readFileSync('posts.json', 'utf8'))) {
    test(`post ${post} renders with real Marked and valid optimized assets`, async () => {
        const w = await page('post.html', `?file=posts/${post}&from=portfolio.html`);
        assert.equal(w.document.querySelectorAll('article h1').length >= 1, true);
        assert.equal(w.document.querySelector('#back-link').getAttribute('href'), 'portfolio.html');
        assert.ok(!w.document.querySelector('article').textContent.includes('Error loading post.'));
        for (const image of w.document.querySelectorAll('article img')) {
            assert.ok(existsSync(image.getAttribute('src')), image.src);
            assert.ok(!/\.(mp4|webm|mov)$/i.test(image.src));
            assert.ok(image.getAttribute('width'));
        }
        for (const video of w.document.querySelectorAll('video')) {
            assert.ok(existsSync(video.dataset.src || video.getAttribute('src')));
            assert.ok(existsSync(video.getAttribute('poster')));
            assert.equal(video.controls, true);
        }
    });
}
