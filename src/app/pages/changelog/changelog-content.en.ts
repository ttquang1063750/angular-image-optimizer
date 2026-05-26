import { ChangelogContent } from './changelog-content';

export const changelogContentEn: ChangelogContent = {
  intro:
    'All notable changes to Image Optimizer are recorded here. Format follows Keep a Changelog.',

  noteTitle: 'Note',
  noteBody:
    'Versions below mark feature milestones, not formal releases. Strict semver versioning will start at v1.0.0 when js-tools.org goes public.',

  kindLabels: {
    added: 'Added',
    changed: 'Changed',
    fixed: 'Fixed',
  },

  entries: [
    {
      version: 'v0.5.0',
      date: '2026-05-26',
      codename: 'SEO Polish & Stability',
      groups: [
        {
          kind: 'added',
          items: [
            'Custom UrlSerializer: every internal routerLink + canonical + sitemap now uses `/lang/path/` (trailing slash) format, matching Cloudflare Pages 308 normalization — no more chained redirects when Googlebot crawls.',
            '`_redirects` (Cloudflare Pages): server-side redirect `/` → `/vi/` (Vietnam visitors) or `/en/`, replacing the client-side meta-refresh.',
            '1200×630 PNG OG image for LinkedIn/Slack/Facebook compatibility (SVG kept as source for re-export).',
            '`<meta name="robots" content="noindex">` on the root redirect stub.',
          ],
        },
        {
          kind: 'changed',
          items: [
            'HEIC decoder: heic2any → heic-to (modern libheif, decodes HEIC variants from iPhone 12+ and files with depth maps).',
            'Compression core: dropped compressorjs in favor of native Canvas API with single-pass `toBlob`. Initial bundle shrunk by ~37% raw / ~32% gzip.',
            'sitemap.xml + canonical + hreflang + og:url + breadcrumb all unified on the trailing-slash format — fixes GSC "Page with redirect" and "Redirect error" reports.',
            'Documentation cleanup: GEMINI.md → AGENTS.md, BACKLOG.md → ROADMAP.md, added MIT LICENSE, removed PLAN/TASK/SEO_PLAN.',
          ],
        },
        {
          kind: 'fixed',
          items: [
            'Donate FAB on mobile (< 600px) was oval and overlapped file-item action buttons → moved to bottom-left at a fixed 48×48 square.',
            'Pipeline error message after a HEIC decode failure now extracts the message from `{ code, message }` shape correctly instead of falling back to "unknown error".',
          ],
        },
      ],
    },
    {
      version: 'v0.4.0',
      date: '2026-05-22',
      codename: 'Landing & SEO',
      groups: [
        {
          kind: 'added',
          items: [
            'Static Site Generation (SSG) with @angular/ssr — 9 routes prerendered.',
            'Path-based i18n routing: /vi/, /en/, /vi/optimize, /vi/about, /vi/changelog, /vi/blog.',
            'Full landing page with 6 sections: Hero, Features (8 cards), How-it-works (3 steps), Comparison (vs TinyPNG/Squoosh), FAQ (8 questions), CTA.',
            'Marketing chrome: sticky header with nav + theme/lang switcher + "Open app" CTA; footer with links + copyright.',
            'About page: project story, tech stack, privacy commitment, open source, Support CTA, contact.',
            'Changelog page (this one) with versioned timeline.',
            'Central SeoService: title, description, OG/Twitter cards, canonical, hreflang × 3 (vi/en/x-default), JSON-LD.',
            'JSON-LD: SoftwareApplication, FAQPage, BreadcrumbList, AboutPage.',
            '1200×630 SVG OG image with branding.',
            'theme-color meta tags for mobile chrome (light + dark).',
            '`npm run verify:seo` script validates prerendered HTML.',
          ],
        },
        {
          kind: 'changed',
          items: [
            'Settings gear button moved from a floating FAB inside the app to an inline header button — only visible on /optimize.',
            'Theme toggle + Lang switcher moved out of image-uploader into shared/ui — reused by marketing header + app shell.',
            'Lang switcher now navigates via Router (preserves current path) instead of just updating a signal.',
            'Support modal migrated to CDK Dialog — accessible focus trap + Esc + outside click closes.',
            'AppShellLayout lazy-loaded via loadComponent — marketing routes no longer bundle CDK Dialog/PresetManager.',
          ],
        },
      ],
    },
    {
      version: 'v0.3.0',
      date: '2026-03-15',
      codename: 'Presets & Watermarks',
      groups: [
        {
          kind: 'added',
          items: [
            'Save multiple config presets (name + format + resize + watermark + naming).',
            'Export / Import presets as JSON — reuse across machines.',
            'Up to 5 watermarks per image (text or PNG logo).',
            'Watermarks support position, opacity, and size as % of image width.',
            'Drag-reorder watermarks + drag-reorder files before exporting zip.',
            'Bulk naming: prefix, suffix, auto-numbering with configurable start index.',
          ],
        },
        {
          kind: 'changed',
          items: [
            'Watermark refactored to a discriminated union (TextWatermarkConfig | ImageWatermarkConfig) for stricter typing.',
            'MAX_WATERMARKS = 5 also enforced when importing presets to guard against client-side DoS.',
          ],
        },
      ],
    },
    {
      version: 'v0.2.0',
      date: '2025-11-08',
      codename: 'Polish & Locale',
      groups: [
        {
          kind: 'added',
          items: [
            'i18n: Vietnamese + English. Defaults to navigator.language, persisted in localStorage.',
            'Dark mode via CSS variables — follows prefers-color-scheme, manual toggle available.',
            'HEIC support (iPhone photos) via heic2any.',
            'Optional EXIF preservation (GPS, timestamps) when compressing JPEG → JPEG.',
            'Keyboard shortcuts: Ctrl/⌘ + O opens file picker, Ctrl/⌘ + S downloads zip, Esc closes modals.',
            'Tooltips show exact byte sizes.',
          ],
        },
        {
          kind: 'fixed',
          items: [
            'Memory leak: ObjectURL is revoked when clearing the list or removing a file.',
            'Duplicate file names in zip — auto-appends (1), (2), …',
          ],
        },
      ],
    },
    {
      version: 'v0.1.0',
      date: '2025-08-20',
      codename: 'Initial release',
      groups: [
        {
          kind: 'added',
          items: [
            'Drag-drop multiple images or click to browse.',
            '3 compression presets: Light (high quality), Medium (balanced), Max (smallest output).',
            'Output formats: JPEG or WebP.',
            'Resize modes: Auto (per preset), Width, Height, or Percent.',
            'Concurrent processing up to 3 images via RxJS mergeMap — never freezes the browser.',
            'Quality comparison modal with original vs compressed slider.',
            'Per-file real-time progress via Angular Signals.',
            'Download individual files or bundle everything as .zip via JSZip.',
          ],
        },
      ],
    },
  ],
};
