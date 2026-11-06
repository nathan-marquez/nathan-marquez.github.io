# Nathan Marquez - Personal Website

A minimal personal portfolio website built with plain HTML, CSS, and JavaScript. Hosted on GitHub Pages.

🔗 **Live Site**: [nathanjmarquez.com](https://nathanjmarquez.com)

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Markdown Parsing**: [Marked.js](https://marked.js.org/) (vendored locally)
- **Hosting**: GitHub Pages
- **Domain**: Custom domain via CNAME

## Project Structure

```
├── index.html              # About page with bio and recent posts preview
├── portfolio.html          # Full blog feed with thumbnails
├── contact.html            # Contact information
├── post.html              # Individual blog post viewer
├── style.css              # Minimal styling (Inter font, system defaults)
├── blog.js                # Blog system and markdown parser
├── posts.json             # List of blog post filenames
├── posts/                 # Markdown blog posts with frontmatter
│   ├── writeaway.md
│   ├── cursor-hackathon.md
│   └── ...
├── media/                 # Images and videos for blog posts
├── images/                # Site assets (profile photo, etc)
├── marquez_nathaniel_resume.pdf
└── CNAME                  # Custom domain configuration
```

## Local Development

### Running Locally

You need a local HTTP server because the blog system uses `fetch()` to load markdown files, which requires the HTTP protocol (won't work with `file://`).

**Easiest method - Python (built-in on macOS/Linux):**
```bash
python3 -m http.server 8000
```

Then open: http://localhost:8000

**Alternative - Node.js:**
```bash
npx serve
```

**To stop the server:** Press `Ctrl+C` in the terminal

**Running in background:**
```bash
python3 -m http.server 8000 &
# To stop: kill the process or run 'killall python3'
```

## Adding a New Blog Post

### 1. Create Markdown File

Create a new file in `posts/` with frontmatter:

```markdown
---
date: 2024-03-15
---

# Your Post Title

![Alt text](media/your-image.jpg)

Your content here...

For videos:
<video autoplay loop muted playsinline src="media/your-video.mp4"></video>
```

### 2. Add Media Assets

Place images/videos in `media/` folder. Supported formats:
- **Images**: `.jpg`, `.png`, `.gif`, `.webp`
- **Videos**: `.mp4`, `.webm`, `.mov`

### 3. Register Post

Add filename to `posts.json`:
```json
[
    "your-new-post.md",
    "writeaway.md",
    "cursor-hackathon.md"
]
```

### 4. Commit and Push

```bash
git add posts/your-new-post.md media/your-media.* posts.json
git commit -m "Add new blog post: Your Post Title"
git push origin master
```

Site updates automatically via GitHub Pages within ~1 minute.

## Features

### Blog System
- **Automatic parsing**: Markdown → HTML via Marked.js
- **Frontmatter support**: YAML-style metadata (currently: date)
- **Smart thumbnails**: 
  - Extracts first image/video from post
  - Auto-converts image syntax for videos (`.mp4`, `.webm`, `.mov`)
  - Full-width thumbnails in portfolio feed
- **Two views**:
  - About page: Simple list (date + title) of 4 most recent posts
  - Portfolio page: Full feed with thumbnails and excerpts

### Responsive Design
- Mobile-friendly via viewport meta tag
- Fluid typography and spacing
- Max-width container (800px) for readability

### Performance
- No build step or dependencies
- CDN-hosted libraries (Marked.js)
- Static hosting via GitHub Pages

## Customization

### Styling

Edit `style.css`:
```css
body {
    max-width: 800px;  /* Content width */
    font-family: 'Inter', sans-serif;  /* Typography */
}
```

### Colors

Currently minimal (black text, white background, gray accents). To customize:
```css
body { background-color: #ffffff; color: #000000; }
a { color: inherit; }  /* Links inherit text color */
.preview-date { color: #666; }  /* Date text */
```

### Fonts

Using Google Fonts Inter. To change:
1. Update `@import` in `style.css`
2. Change `font-family` in body selector

## Deployment

### GitHub Pages Setup

1. **Repository name**: `username.github.io`
2. **Branch**: `master` or `main`
3. **Settings** → Pages → Source: Deploy from branch
4. **Custom domain** (optional): Add `CNAME` file with domain

### Custom Domain

The `CNAME` file contains:
```
nathanjmarquez.com
www.nathanjmarquez.com
```

DNS setup (at domain registrar):
- `A` record → GitHub Pages IPs
- `CNAME` record: `www` → `username.github.io`

## File Conventions

### Naming
- **Posts**: Lowercase with hyphens (e.g., `my-blog-post.md`)
- **Media**: Descriptive names (e.g., `trendscope-demo.mp4`)
- **Dates**: YYYY-MM-DD format in frontmatter

### Post Frontmatter

Currently supported:
```yaml
---
date: 2024-03-15  # Post publication date
---
```

Extensible for future metadata (tags, author, etc).

## AI Agent Instructions

This site is designed to be AI-agent friendly:

### Code Structure
- **No build tools**: Pure HTML/CSS/JS
- **Clear separation**: Content (posts/) vs code (blog.js)
- **Documented**: Inline comments in JavaScript
- **Convention over configuration**: Minimal setup

### Making Changes
1. **New post**: Add `.md` file in `posts/`, update `posts.json`
2. **Styling**: Edit `style.css` (mobile-first, semantic classes)
3. **Blog logic**: Edit `blog.js` (async/await, modern JS)
4. **Pages**: Edit HTML files (semantic markup, no templating)

### Testing
Always test locally with HTTP server before pushing:
```bash
python3 -m http.server 8000
```

### Common Tasks
- **Update bio**: Edit `index.html` paragraphs
- **Add social link**: Update footer links in all HTML files
- **Change layout**: Modify `style.css` (flexbox/grid)
- **Extend frontmatter**: Parse additional fields in `blog.js`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Native `fetch()` API

No polyfills needed for target audience (developers, tech recruiters).

## License

See `LICENSE.txt` for details.

## Credits

- **Template inspiration**: HTML5 UP (Ethereal theme)
- **Font**: Inter by Rasmus Andersson
- **Markdown parser**: Marked.js

---

Built with ❤️ by Nathan Marquez

## Media performance

The live site uses generated files in `media/optimized/`; original files stay in
`media/` as source material. `media-manifest.js` maps each original path to its
optimized image/video, dimensions, poster and optional portfolio preview. Posts
continue to reference original paths, so the Markdown format has not changed.

After adding or replacing media, regenerate the assets and commit the generated
files, manifest and homepage together:

```sh
# Prerequisites: Python 3 + Pillow, ffmpeg and ffprobe.
python3 -m pip install Pillow
python3 scripts/optimize_media.py
python3 scripts/check_media.py
```

Images are responsive WebP (up to 1520 px for a 760 px content column, and 500 px
for the profile). Full demos use H.264 at up to 1280 px wide/30 fps with their
audio retained. The existing HDR phone clip is remuxed with fast-start metadata
without changing its HEVC video/colors. Portfolio video previews are silent,
up to eight seconds long, and at most 960 px wide. The script's `PREVIEWS` set
selects which videos get these short previews; add a new post's first video
there when needed. `scripts/media-sizes.json` records source and output sizes.

Video sources attach shortly before reaching the viewport; playback begins
only when visible and pauses offscreen. Reduced-motion/data-saving visitors get
static portfolio covers and manual full-demo playback. New assets without a
manifest entry fall back to their original paths until regenerated. Marked is
vendored locally (version and license in `vendor/`) so post rendering does not
wait for a third-party JavaScript CDN.

Development checks (no dependencies are needed to host the site):

```sh
npm install
npm test
```
