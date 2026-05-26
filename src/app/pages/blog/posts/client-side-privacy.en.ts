import { BlogPost } from '../blog-post.model';

const heroSvg = `
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="priv-bg-en" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#52c41a" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#1890ff" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="800" height="360" fill="url(#priv-bg-en)" rx="16"/>
  <g transform="translate(280 60)" fill="none" stroke="var(--color-text-muted)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M120 0 L0 60 V160 C0 220 50 260 120 280 C190 260 240 220 240 160 V60 Z" fill="var(--color-surface)" stroke="var(--color-success)" stroke-width="8"/>
    <path d="M70 150 L110 190 L180 110" stroke="var(--color-success)" stroke-width="10"/>
  </g>
</svg>
`.trim();

const contentHtml = `
<p>Most "online image compressors" work like this: you upload images to their server, the server runs ImageMagick or similar, and sends you back the compressed file. Simple. But ask yourself: what does that server <em>actually</em> do with your image?</p>

<p>Answers per popular tools' Privacy Policies:</p>

<ul>
  <li>"Files are deleted within 1 hour" — meaning for that hour they can read, copy, or log metadata.</li>
  <li>"We may analyze uploaded content to improve our service" — you just handed them training data.</li>
  <li>"We use third-party CDNs for processing" — your file may bounce through 3-4 different servers.</li>
</ul>

<p>For e-commerce product shots this is fine. For client photos, internal company images, or anything with EXIF GPS — not fine at all.</p>

<h2>The fix: compress right in the browser</h2>

<p>Modern browsers (2020+) ship a Canvas API powerful enough to run the entire compression pipeline client-side. No upload, no server, no server logs. The file stays on your machine from start to finish.</p>

<p>Standard client-side compression workflow:</p>

<ol>
  <li>User drops a file into the browser → it becomes a <code>Blob</code> in memory.</li>
  <li>Create an off-screen <code>&lt;canvas&gt;</code>, draw the Blob into it at target dimensions (resize).</li>
  <li>Call <code>canvas.toBlob(callback, 'image/webp', 0.8)</code> — browser encodes WebP/JPEG at quality 0.8.</li>
  <li>Hand the new Blob back as a download (createObjectURL).</li>
</ol>

<p>It all runs locally. <a href="/en/optimize/">Image Optimizer</a> is open source and implements exactly this pattern — you can audit the code on GitHub to confirm there's no upload endpoint anywhere.</p>

<h2>Performance: is client-side slower?</h2>

<p>Short answer: <strong>no</strong>, it's usually faster. Why:</p>

<ul>
  <li><strong>No network latency</strong>: uploading 50MB on an average connection takes ~30s. Compressing locally takes ~2s per image.</li>
  <li><strong>Parallel processing</strong>: use <code>RxJS mergeMap(concurrent: 3)</code> to handle 3 images at once, exploiting multi-core CPU.</li>
  <li><strong>No quota walls</strong>: server-side tools cap file count/size to manage their costs. Client-side has no such concept.</li>
</ul>

<p>The only real bottleneck is browser RAM. In practice, 64-bit Chrome handles batches of 200 × 5MB images fine on an 8GB machine.</p>

<h2>When client-side is NOT the right call</h2>

<p>Being fair, a few cases where server-side still wins:</p>

<ul>
  <li><strong>Old / low-end mobile</strong>: 2GB-RAM devices can struggle with big batches. Single images are still fine.</li>
  <li><strong>Specialty formats</strong>: pro RAW formats (CR3, NEF, ARW) need large decoders (~50MB+) — not practical to ship in a browser bundle.</li>
  <li><strong>Automated pipelines</strong>: if you need a programmatic API call (CI/CD upload), a server-side service like Cloudinary fits better.</li>
  <li><strong>AI processing</strong>: deep-learning upscaling (Topaz, ESRGAN) requires GPU servers.</li>
</ul>

<p>But for 95% of use cases (compress, resize, watermark, format convert) client-side wins on privacy, speed, and cost.</p>

<h2>How to verify a tool is actually client-side</h2>

<p>Don't trust marketing copy. Check yourself:</p>

<ol>
  <li>Open DevTools → Network tab.</li>
  <li>Clear the log, then upload an image.</li>
  <li>Look for any POST request with a large payload. If you only see GET requests for CSS/JS, no upload happened.</li>
  <li>Disable network (DevTools → Network → Offline) once the page is loaded. Compress an image. If it still works, it's 100% client-side.</li>
</ol>

<p><a href="/en/optimize/">Image Optimizer</a> passes both checks. Source is MIT on GitHub — you can self-host on your own domain.</p>

<h2>Wrap-up</h2>

<p>Client-side image processing is no longer experimental. In 2026, every modern browser is fast enough to batch-process images faster than uploading to a server would take. Combined with privacy, bandwidth savings, and zero backend, this should be the default for new web apps.</p>

<p><a href="/en/optimize/"><strong>Try Image Optimizer running 100% in your browser →</strong></a></p>
`.trim();

export const clientSidePrivacyEn: BlogPost = {
  topicId: 'client-side-privacy',
  slug: 'client-side-image-compression',
  lang: 'en',
  title: 'Client-side image compression: privacy + speed',
  description:
    'Why compressing images in the browser is both faster and more private than uploading to a server. Technical breakdown + how to verify a tool is truly client-side.',
  publishedAt: '2026-03-20',
  author: 'Tang Thanh Quang',
  tags: ['privacy', 'client-side', 'canvas', 'performance'],
  contentHtml,
  heroSvg,
};
