import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bulk-bg-en" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faad14" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c3002f" stop-opacity="0.16"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#bulk-bg-en)" rx="16"/>
  <g transform="translate(80 80)">
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="rotate(-5)"/>
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="translate(40 30) rotate(2)"/>
    <rect width="180" height="120" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2" transform="translate(80 60)"/>
    <text x="170" y="135" font-family="-apple-system, Segoe UI, sans-serif" font-size="22" font-weight="700" fill="var(--color-primary)" opacity="0.6" transform="rotate(-15 170 135)">© BRAND</text>
  </g>
  <g transform="translate(440 100)" fill="var(--color-text-muted)" font-family="-apple-system, Segoe UI, sans-serif">
    <text x="0" y="40" font-size="32" font-weight="800">100 images</text>
    <text x="0" y="80" font-size="20">→ resize to 1920px</text>
    <text x="0" y="110" font-size="20">→ corner watermark</text>
    <text x="0" y="140" font-size="20">→ IMG_001 to IMG_100</text>
    <text x="0" y="180" font-size="22" font-weight="700" fill="var(--color-success)">~30 seconds</text>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>Familiar scenario: you just shot 100 product photos for your online shop, or 150 event photos for a client. You need to resize them to 1920px wide, add a small corner watermark, and rename them consistently <code>IMG_001.jpg</code> → <code>IMG_100.jpg</code>. By hand in Photoshop, that's 1-2 hours. With <a href="/en/optimize">Image Optimizer</a> it's ~30 seconds.</p>

<p>This post walks through a standard workflow for anyone batching images regularly: e-commerce, bloggers, photographers, marketing teams.</p>

<h2>Step 1: Upload the batch</h2>

<p>Three ways to get files in:</p>

<ul>
  <li><strong>Drag-drop</strong>: pick a folder in Finder/Explorer and drag it onto the app's drop zone.</li>
  <li><strong>Click to browse</strong>: tap the drop zone or "Choose files" button → file picker opens → multi-select with Cmd/Ctrl+Click.</li>
  <li><strong>Keyboard</strong>: press <code>Cmd + O</code> (Mac) or <code>Ctrl + O</code> (Windows) to open the file picker from anywhere on the page.</li>
</ul>

<p>The app accepts JPG, PNG, HEIC (iPhone), and WebP. No file count limit — in practice a batch of 200 × 5MB runs fine on an 8GB-RAM machine.</p>

<h2>Step 2: Set up a preset once, reuse forever</h2>

<p>This is the most important tip — don't reconfigure every time. Open Settings (gear icon, top-right), build your standard workflow:</p>

<ul>
  <li><strong>Compression level</strong>: "Medium" for web, "Maximum" for thumbnails.</li>
  <li><strong>Format</strong>: WebP for the smallest size, JPEG for client compatibility.</li>
  <li><strong>Size</strong>: pick "Width" → enter 1920 (web full-width) or 800 (thumbnail).</li>
  <li><strong>Naming</strong>: prefix <code>IMG_</code>, enable "Numbering", start index at 1.</li>
  <li><strong>Watermark</strong>: see step 3.</li>
</ul>

<p>Save the preset with the "Save preset" button → give it a name (e.g. "E-commerce 1920px + logo"). Next time, pick it from the dropdown. Export presets as JSON to share with your team or to use on another machine.</p>

<h2>Step 3: Watermark — text vs PNG logo</h2>

<p>Two watermark choices:</p>

<h3>Text watermark</h3>

<p>Fast and flexible. Good when:</p>

<ul>
  <li>You don't have a logo PNG yet.</li>
  <li>You need to change wording often (e.g. <code>© 2026 - John Doe Photography</code>).</li>
  <li>The brand name is the main element (no recognizable logo).</li>
</ul>

<p>You can tweak: font size as a % of image width, color, opacity, position (4 corners + center).</p>

<h3>Image watermark (PNG logo)</h3>

<p>More professional. Upload a PNG logo (transparent background recommended). Tweakable:</p>

<ul>
  <li><strong>Position</strong>: 4 corners + center.</li>
  <li><strong>Size</strong>: % of image width (5-30% is common).</li>
  <li><strong>Opacity</strong>: 0-100% (40-70% for subtle, 80-100% for prominent).</li>
</ul>

<h3>Multi-watermark</h3>

<p>The app allows up to 5 watermarks per image. Use case: main brand logo bottom-right + capture date top-left + copyright text along the bottom. Each watermark has independent position, size, and opacity.</p>

<p>Drag-and-drop to reorder layers — later watermarks render on top of earlier ones.</p>

<h2>Step 4: Naming conventions</h2>

<p>Consistent file naming matters for SEO and folder organization. The app supports:</p>

<ul>
  <li><strong>Prefix</strong>: <code>IMG_</code>, <code>2026-summer_</code>, <code>brand-name_</code></li>
  <li><strong>Suffix</strong>: <code>_compressed</code>, <code>_web</code>, <code>_thumb</code></li>
  <li><strong>Numbering</strong>: auto-padding ensures correct sort order (<code>001, 002, …, 100</code> rather than <code>1, 10, 100, 2</code>).</li>
  <li><strong>Start index</strong>: continue from any number — handy when appending to an older batch.</li>
</ul>

<p>Output can be <code>IMG_001.webp</code> → <code>IMG_100.webp</code>, sorted correctly in any file manager.</p>

<h2>Step 5: Download + organize</h2>

<p>When the batch finishes, two options:</p>

<ul>
  <li><strong>Per-file download</strong>: handy when you only need a few.</li>
  <li><strong>Zip download</strong>: keyboard shortcut <code>Cmd/Ctrl + S</code>. The app handles name collisions by appending <code>(1)</code>, <code>(2)</code>...</li>
</ul>

<p>The folder inside the zip keeps the original upload order. Just extract.</p>

<h2>Workflow for a wedding/event photographer</h2>

<p>Real example from a working photographer:</p>

<ol>
  <li>Export 500 full-resolution JPEGs from Lightroom (2-3 GB).</li>
  <li>Open Image Optimizer, load the "Client preview" preset (resize 2048px + watermark logo + naming <code>EVENT_NAME_001</code>).</li>
  <li>Drag-drop the folder — app reports "500 files added".</li>
  <li>Wait ~3 minutes (3 in parallel, ~3s each).</li>
  <li>Download a ~300MB zip. Send to the client via WeTransfer.</li>
</ol>

<p>Total hands-on time: ~30 seconds. The rest is the machine working.</p>

<h2>Wrap-up</h2>

<p>The biggest win in bulk processing is setting up the right preset once and reusing it. Spend 10 minutes building a preset → save hours on every shoot/batch.</p>

<p><a href="/en/optimize"><strong>Set up your bulk workflow now →</strong></a></p>
`.trim();

export const bulkWatermarkGuideEn: BlogPost = {
  topicId: 'bulk-watermark',
  slug: 'bulk-resize-watermark-guide',
  lang: 'en',
  title: 'Bulk resize + watermark guide',
  description:
    'A standard workflow for resizing, watermarking, and renaming 100+ images in 30 seconds. Applies to e-commerce, photographers, and bloggers.',
  publishedAt: '2026-02-08',
  author: 'Tang Thanh Quang',
  tags: ['bulk', 'watermark', 'resize', 'workflow'],
  contentHtml,
  heroSvg,
};
