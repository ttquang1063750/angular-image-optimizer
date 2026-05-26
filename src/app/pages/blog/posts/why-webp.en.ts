import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="webp-bg-en" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c3002f" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#1890ff" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#webp-bg-en)" rx="16"/>
  <g font-family="-apple-system, Segoe UI, sans-serif" font-weight="800" text-anchor="middle">
    <text x="240" y="180" font-size="84" fill="var(--color-danger)">JPEG</text>
    <text x="560" y="180" font-size="84" fill="var(--color-success)">WebP</text>
    <text x="240" y="230" font-size="22" fill="var(--color-text-muted)" font-weight="500">2.4 MB</text>
    <text x="560" y="230" font-size="22" fill="var(--color-text-muted)" font-weight="500">1.6 MB</text>
  </g>
  <g transform="translate(370 160)" stroke="var(--color-text-muted)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 20 L60 20 M48 8 L60 20 L48 32"/>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>WebP was created by Google in 2010, but it only became truly mainstream in late 2020 when Safari on iOS 14 finally added support. Today <strong>97%+ of browsers support WebP</strong>, including every modern version of Edge, Firefox, Chrome, and Safari across all platforms.</p>

<p>So why do people still use JPEG? Short answer: legacy software compatibility, offline editing tools, and habit. This post unpacks when to switch to WebP and when to stick with JPEG.</p>

<h2>Why WebP is smaller than JPEG</h2>

<p>JPEG uses DCT (Discrete Cosine Transform), a technique from 1992. WebP uses VP8 prediction (same codec family as YouTube's WebM video) plus better entropy coding. Specifically:</p>

<ul>
  <li><strong>Predictive coding</strong>: WebP predicts pixel values from neighboring pixels and only stores the delta. Uniform regions (sky, white walls) cost nearly nothing.</li>
  <li><strong>Smarter block-based chroma subsampling</strong>: WebP defaults to YUV420 but slices blocks more cleverly — fewer artifacts at high-contrast edges.</li>
  <li><strong>Lossless + alpha channel</strong>: WebP supports both a lossless mode (like PNG but ~26% smaller) and transparency — JPEG has no alpha.</li>
</ul>

<p>Real-world result: <strong>WebP saves 25-35% in file size</strong> versus JPEG at the same perceived quality. For images with large uniform regions (UI screenshots, illustrations), savings can hit 50%+.</p>

<h2>When you should switch to WebP</h2>

<p>For nearly every web use case:</p>

<ul>
  <li><strong>Website imagery</strong>: better page-speed scores, faster LCP, better Core Web Vitals — all of which lift SEO ranking. Google explicitly rewards WebP.</li>
  <li><strong>Email marketing</strong>: most modern email clients render WebP. Gmail, Outlook.com, and Apple Mail all support it.</li>
  <li><strong>Mobile app assets</strong>: iOS 14+ and Android 4+ decode WebP natively, shrinking your bundle.</li>
  <li><strong>Image-heavy blogs / portfolios</strong>: ~30% faster average load, especially on slow connections.</li>
</ul>

<h2>When to stick with JPEG</h2>

<p>A few cases where JPEG is still the safer choice:</p>

<ul>
  <li><strong>Sending files to clients on older editing software</strong>: Photoshop CS6 (2012) doesn't open WebP natively. Lightroom Classic before 11.4 doesn't either.</li>
  <li><strong>Print workflows</strong>: pro printers using older RIPs may not handle WebP.</li>
  <li><strong>Camera RAW pipelines</strong>: if your flow is RAW → JPEG for the client, keep JPEG so the client can open files without friction.</li>
  <li><strong>Internal Explorer &lt; IE11</strong>: rare, but if your audience runs old corporate Windows, you need a JPEG fallback.</li>
</ul>

<h2>Bulk converting in seconds</h2>

<p>The fastest way to convert a folder of JPEGs to WebP without installing anything:</p>

<ol>
  <li>Open <a href="/en/optimize/">Image Optimizer</a> in your browser.</li>
  <li>Drag-drop your JPEG folder onto the page.</li>
  <li>In Settings → "Output format" pick <strong>WebP</strong>.</li>
  <li>Choose the "Medium" preset for a balanced size/quality tradeoff.</li>
  <li>Download the .zip — every file is now .webp.</li>
</ol>

<p>The app processes 3 images in parallel via RxJS, so a large batch won't freeze your browser. Everything runs client-side — your files never hit a server.</p>

<h2>What about AVIF?</h2>

<p>AVIF (AV1 Image File Format) is next-gen — about 20% smaller than WebP again. But browser support sits at ~92% (Edge and some older Safari builds still trail). Encoding AVIF is also 5-10× slower than WebP. Recommendation: ship WebP in production for 2026, and re-evaluate AVIF in a year or two.</p>

<h2>Bottom line</h2>

<p>With 97%+ browser support and 25-35% file-size savings, WebP should be the default for any new web imagery. Keep JPEG only when you need legacy software compatibility. A bulk convert takes seconds in the browser — no reason to delay.</p>

<p><a href="/en/optimize/"><strong>Try a bulk WebP convert →</strong></a></p>
`.trim();

export const whyWebpEn: BlogPost = {
  topicId: 'why-webp',
  slug: 'webp-vs-jpeg',
  lang: 'en',
  title: 'WebP vs JPEG: when should you switch?',
  description:
    'WebP cuts 25-35% off JPEG file size at the same quality and is supported by 97%+ of browsers. This post breaks down when to switch and when to stick with JPEG.',
  publishedAt: '2026-04-12',
  author: 'Tang Thanh Quang',
  tags: ['webp', 'jpeg', 'optimization', 'performance'],
  contentHtml,
  heroSvg,
};
