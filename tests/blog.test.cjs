const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setImmediate(resolve));

async function setup(count = 7) {
    const dom = new JSDOM('<main><div id="posts-feed"></div></main>', { runScripts: 'outside-only', url: 'https://example.test/' });
    const w = dom.window;
    await tick();
    const requests = [];
    const pending = {};
    w.fetch = url => {
        requests.push(url);
        if (url === 'posts.json') return Promise.resolve({ ok: true, json: async () => Array.from({ length: count }, (_, i) => `${i}.md`) });
        return new Promise(resolve => { pending[url] = resolve; });
    };
    w.scrollTo = () => {};
    w.console.error = () => {}; // A missing post is an intentional fixture in the failure test.
    // Existing code unnecessarily requires marked for a feed that does not parse Markdown.
    w.marked = {};
    w.SiteMedia = { imageHTML: src => `<img src="${src}">`, videoHTML: () => '<video></video>', activate() {}, disconnect() {} };
    w.eval(readFileSync('blog.js', 'utf8'));
    await tick();
    return { w, requests, pending, root: w.document.querySelector('#posts-feed') };
}
function complete(pending, n, ok = true) {
    pending[`posts/${n}.md`]({ ok, status: ok ? 200 : 404, text: async () => `---\ndate: 2025-01-01\n---\n# Post ${n}\n\nDescription ${n}` });
}

test('all five post requests start together and render in order as they finish', async () => {
    const { requests, pending, root } = await setup();
    assert.equal(requests.filter(r => r.startsWith('posts/')).length, 5);
    complete(pending, 4);
    await tick();
    assert.ok(root.textContent.includes('Post 4'), 'A slow first post must not block later posts');
    for (let n = 3; n >= 0; n--) complete(pending, n);
    await tick();
    assert.deepEqual([...root.querySelectorAll('h3')].map(h => h.textContent), ['Post 0', 'Post 1', 'Post 2', 'Post 3', 'Post 4']);
});

test('a failed post does not hide the successful posts or break pagination', async () => {
    const { w, pending, root } = await setup();
    assert.ok(pending['posts/4.md'], 'Requests must be concurrent');
    for (let n = 0; n < 5; n++) complete(pending, n, n !== 2);
    await tick();
    assert.equal(root.querySelectorAll('h3').length, 4);
    assert.ok(root.textContent.includes('Error loading post: 2.md'));
    assert.ok(w.document.querySelector('#pagination').textContent.includes('Page 1 of 2'));
});

test('switching pages while earlier requests are pending never restores stale content', async () => {
    const { w, pending, root } = await setup();
    assert.ok(pending['posts/4.md'], 'Requests must be concurrent');
    const next = w.loadPosts(null, 2);
    await tick();
    complete(pending, 5);
    complete(pending, 6);
    await next;
    for (let n = 0; n < 5; n++) complete(pending, n);
    await tick();
    assert.deepEqual([...root.querySelectorAll('h3')].map(h => h.textContent), ['Post 5', 'Post 6']);
    assert.ok(w.document.querySelector('#pagination').textContent.includes('Page 2 of 2'));
});

test('rapid double-clicking Next while the list is loading cannot skip past the last page', async () => {
    const { w, pending } = await setup();
    const fetch = w.fetch;
    const lists = [];
    w.fetch = url => url === 'posts.json' ? new Promise(resolve => lists.push(resolve)) : fetch(url);
    const next = w.document.querySelector('#pagination button');
    next.click();
    next.click();
    lists[1]({ ok: true, json: async () => Array.from({ length: 7 }, (_, i) => `${i}.md`) });
    lists[0]({ ok: true, json: async () => Array.from({ length: 7 }, (_, i) => `${i}.md`) });
    await tick();
    assert.ok(w.document.querySelector('#pagination').textContent.includes('Page 2 of 2'));
    assert.ok(pending['posts/5.md']);
    assert.ok(pending['posts/6.md']);
});
