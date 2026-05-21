# SEO Landing Page — Implementation Plan

> Living document. Cập nhật khi quyết định thay đổi hoặc phase hoàn thành.

## 🎯 Mục tiêu
Kéo traffic hữu cơ về app `/optimize` thông qua landing page + blog + about. Target keywords (cần research kỹ trước Phase 6):
- **Brand/transactional**: `image optimizer`, `nén ảnh online`, `compress image free`, `webp converter online`
- **Long-tail/blog**: `nén ảnh không upload lên server`, `webp vs jpeg`, `bulk image resize`, `client side image compression`, `preserve exif when compressing`

Định nghĩa thành công:
- Landing page Lighthouse > 95 (Performance + SEO + Accessibility)
- Mỗi route có unique title/description/OG/canonical/hreflang
- Sitemap.xml + robots.txt valid
- Top 3 blog post ranked top 30 cho ít nhất 1 long-tail keyword trong 6 tháng

---

## ✅ Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| 1 | **SSG (prerender)** qua `@angular/ssr` | Content tĩnh, deploy CDN free, không cần Node server |
| 2 | Route: `/` → landing, `/optimize` → app | Root path SEO target chính; chấp nhận user cũ phải click CTA |
| 3 | Scope: landing + blog + about + changelog | Full marketing site |
| 4 | i18n: path-based `/vi/...`, `/en/...` | Chuẩn SEO, hreflang index riêng từng ngôn ngữ |

---

## 🏗 Kiến trúc

### Route structure
```
''                          → redirect to /:lang (detect từ navigator.language / Accept-Language, default 'vi')
':lang'                     → MarketingLayout (header + footer)
  ''                        → LandingComponent
  'about'                   → AboutComponent
  'changelog'               → ChangelogComponent
  'blog'                    → BlogListComponent
  'blog/:slug'              → BlogPostComponent
':lang/optimize'            → AppShellLayout (header tối giản) + OptimizeComponent [lazy load]
'**'                        → NotFoundComponent
```

### Cây thư mục đề xuất
```
src/
  app/
    pages/                          # marketing pages
      landing/
        landing.component.{ts,html,scss}
        sections/
          hero/
          features/
          how-it-works/
          comparison/
          faq/
          cta/
      about/
      changelog/
      blog/
        blog-list.component.{ts,html,scss}
        blog-post.component.{ts,html,scss}
        posts/                      # TS modules export frontmatter + content
          why-webp.{vi,en}.ts
          client-side-privacy.{vi,en}.ts
          bulk-watermark-guide.{vi,en}.ts
    optimize/                       # di chuyển ImageUploader vào đây
      optimize.component.{ts,html,scss}     # wrapper, chứa <app-image-uploader>
      image-uploader/               # giữ nguyên code hiện tại
    shared/
      layout/
        marketing-header/           # nav: logo + langswitch + "Mở app" CTA
        marketing-footer/           # links, copyright, social
        app-shell/                  # header tối giản cho /optimize
      seo/
        seo.service.ts              # set Title/Meta/OG/JSON-LD/canonical/hreflang
        structured-data/
          software-app.ts
          faq-page.ts
          blog-posting.ts
      ui/
        cta-button/
        accordion/                  # reuse cho FAQ
    app.routes.ts                   # route definition
  i18n/
    {vi,en}/
      landing.ts                    # extend dictionary hiện tại
      blog/                         # nếu tách blog content khỏi posts/
  robots.txt                        # build-time copy vào dist
public/
  og-image.png                      # 1200x630 OG default
  og-image-vi.png
```

### i18n strategy chi tiết
- `TranslationService` cần adapt: nhận `lang` từ route param qua `ActivatedRoute`, không chỉ từ signal/localStorage
- Root guard: `''` route → redirect `/{detectedLang}`. Detect order: route param > localStorage > navigator.language > 'vi'
- Lang switcher: thay vì set signal, gọi `router.navigate([newLang, ...currentPathSegments])`
- Hreflang tags trong `<head>` per page:
  ```html
  <link rel="alternate" hreflang="vi" href="https://domain.com/vi/page">
  <link rel="alternate" hreflang="en" href="https://domain.com/en/page">
  <link rel="alternate" hreflang="x-default" href="https://domain.com/vi/page">
  ```
- Canonical: tự ref ngôn ngữ hiện tại

### SeoService API thiết kế
```typescript
interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;       // absolute URL
  ogType?: 'website' | 'article';
  canonical: string;       // absolute URL
  alternates: { lang: string; href: string }[]; // hreflang
  jsonLd?: object | object[];
  noIndex?: boolean;       // true cho draft blog
}

seoService.setRoute(config): void
```

---

## 📅 Phase breakdown

### Phase 1: Routing + SSG setup (1.5d)
**Branch**: `feature/seo-phase-1-ssg`

Tasks:
- [ ] `ng add @angular/ssr` → enable prerender (chọn không server-routes nếu chỉ cần SSG)
- [ ] Xác nhận `angular.json` có `"prerender": true` ở build option
- [ ] Update `src/app/app.routes.ts` theo route structure trên — STUB component cho từng route
- [ ] Update `app.config.ts` provide router với `withInMemoryScrolling`, `withViewTransitions` (optional, smooth UX)
- [ ] Migrate `App` component: bỏ `ImageUploaderComponent` direct import, chỉ giữ `<router-outlet>`
- [ ] Tạo lang guard / resolver: route `''` redirect `/{detectedLang}`
- [ ] Adapt `TranslationService.setLanguage()` để observe route param thay đổi
- [ ] Lang switcher: chuyển `setLanguage(lang)` → `router.navigate(...)` giữ path hiện tại
- [ ] Update `index.html` `<html lang="en">` thành `<html lang="{{lang}}">` dynamic (qua DOCUMENT injection trong SeoService hoặc app initializer)
- [ ] Build verify: `npm run build` sinh ra `dist/.../vi/index.html`, `en/index.html`, `vi/optimize/index.html`, etc.
- [ ] Smoke test: curl từng prerender HTML, confirm `<title>`, ngôn ngữ đúng
- [ ] Update tests bị break (App component test, image-uploader test khi nó di chuyển)

**Definition of done**: Build prerender ra HTML cho tất cả route stub. `/optimize` vẫn hoạt động như cũ.

### Phase 2: Marketing shell + SeoService (1d)
**Branch**: `feature/seo-phase-2-shell`

Tasks:
- [ ] `MarketingHeaderComponent`: logo, nav (Landing, Blog, About), lang switcher, dark mode toggle, CTA button "Mở app →"
- [ ] `MarketingFooterComponent`: brand, links (privacy, source code, contact), copyright, optional social
- [ ] `AppShellLayoutComponent`: header tối giản cho `/optimize` (logo + back to landing)
- [ ] `SeoService` implement: dùng `Title`, `Meta`, `DOCUMENT` từ `@angular/platform-browser`. Method `setRoute(config: SeoConfig)`.
- [ ] JSON-LD: append `<script type="application/ld+json">` vào head qua `Renderer2`
- [ ] Lang switch in header: update query/path, không reload page
- [ ] Test SeoService với mock DOCUMENT + Meta

**Definition of done**: Truy cập `/vi/`, `/en/`, `/vi/optimize` hiển thị đúng header/footer. Mỗi route default có Title đúng (qua stub seoService.setRoute call).

### Phase 3: Landing page UI + content (2-3d)
**Branch**: `feature/seo-phase-3-landing`

Tasks:
- [ ] **Hero section**: H1 tagline ("Tối ưu ảnh ngay trong trình duyệt — không upload, không đăng ký"), subline, CTA primary "Mở app →" + secondary "Xem tính năng", hero illustration (SVG hoặc screenshot app)
- [ ] **Features grid** (6-8 card): Privacy 100% client-side, Bulk processing, WebP support, Watermark text+image, EXIF preservation, Compression presets, Drag-reorder, Save/load presets. Mỗi card có icon SVG + heading + 1 dòng description
- [ ] **How it works**: 3-4 step (Drop files → Choose preset → Download). Illustration hoặc screenshot
- [ ] **Comparison table**: vs TinyPNG vs Squoosh — feature matrix (privacy, free, bulk, watermark, no signup, etc.). Reuse global table styles
- [ ] **FAQ accordion** (8-12 Q): target long-tail keyword. Reuse `AccordionComponent` từ `shared/ui/`
- [ ] **CTA footer**: lặp lại nút "Mở app" prominent
- [ ] Responsive: mobile-first, breakpoint 640/1024
- [ ] Content i18n: extend dictionary `landing.ts` cho cả VI + EN
- [ ] Verify prerender HTML có toàn bộ nội dung text (không ẩn sau hydration)

**Definition of done**: Landing page hoàn chỉnh ở cả 2 ngôn ngữ. View-source HTML đầy đủ content.

### Phase 4: SEO meta + structured data (0.5d)
**Branch**: `feature/seo-phase-4-meta`

Tasks:
- [ ] Per-route call `seoService.setRoute({...})` trong `OnInit` hoặc data resolver
- [ ] Landing: title, description, og:image (1200×630), JSON-LD `SoftwareApplication`
- [ ] About/Changelog: appropriate meta
- [ ] FAQ section: JSON-LD `FAQPage` với từng question/answer
- [ ] Canonical URL absolute (cần base URL từ env)
- [ ] Hreflang tags cho landing + about + changelog
- [ ] Robots `<meta name="robots" content="index,follow">` mặc định
- [ ] Verify qua [Rich Results Test](https://search.google.com/test/rich-results)

**Definition of done**: Mỗi route đầu ra HTML có đầy đủ meta + JSON-LD validate.

### Phase 5: About + Changelog (1d)
**Branch**: `feature/seo-phase-5-about-changelog`

Tasks:
- [ ] **About page**: project story, tech stack overview (Angular signals, RxJS, compressorjs), privacy commitment, open source link, contact
- [ ] **Changelog page**: version history. Decision: auto-generate từ `git log` (build-time script tạo TS file) HOẶC viết tay. Recommend tay vì control thông điệp tốt hơn
- [ ] Content i18n cho cả 2

**Definition of done**: 2 trang static có content thực tế (không placeholder).

### Phase 6: Blog scaffold + 3 posts (2-3d)
**Branch**: `feature/seo-phase-6-blog`

Tasks:
- [ ] `BlogListComponent`: list card với hero image, title, excerpt, date, lang. Sort by date desc
- [ ] `BlogPostComponent`: render content + author + date + reading time + table of contents (optional) + related posts
- [ ] Post format: TS module với named export
  ```ts
  export const post: BlogPost = {
    slug: 'why-webp',
    title: '...',
    description: '...',
    publishedAt: '2026-06-01',
    lang: 'vi',
    tags: ['webp', 'optimization'],
    contentHtml: `<p>...</p>`,
    heroImage: '/blog/webp-hero.png',
  };
  ```
- [ ] Hoặc dùng `marked` parse markdown nếu prefer
- [ ] **Post 1 (VI + EN)**: "WebP vs JPEG: khi nào nên chuyển?" — explain, browser support, savings, code example
- [ ] **Post 2 (VI + EN)**: "Nén ảnh client-side: privacy + tốc độ" — kỹ thuật, lợi ích, demo link
- [ ] **Post 3 (VI + EN)**: "Hướng dẫn bulk resize + watermark hàng loạt" — feature spotlight, use cases (e-commerce, blogger)
- [ ] Mỗi post: 1500-2500 từ, internal link về `/optimize`, JSON-LD `BlogPosting`
- [ ] Blog list & post add vào prerender routes manually
- [ ] OG image per post

**Definition of done**: 6 posts (3×2 langs) prerender-able, đầy đủ meta + content.

### Phase 7: Performance + Core Web Vitals (0.5d)
**Branch**: `feature/seo-phase-7-perf`

Tasks:
- [ ] `loadComponent: () => import(...)` cho `/optimize` route — tách bundle compressorjs/jszip/heic2any/cdk khỏi marketing routes
- [ ] Hero image: `NgOptimizedImage` với `priority`, fixed `width`/`height` để tránh CLS
- [ ] Preload font (nếu dùng web font): `<link rel="preload" as="font" crossorigin>`
- [ ] Preconnect to analytics domain (Plausible/Umami)
- [ ] Bundle audit: `ng build --stats-json` + bundle analyzer. Marketing route bundle < 100KB gzip
- [ ] Lighthouse audit landing page mobile + desktop. Target: Perf 95+, SEO 100, Accessibility 95+, Best Practices 95+
- [ ] Fix issues phát hiện (alt text, contrast, ARIA)

**Definition of done**: Lighthouse mobile landing > 95 mọi category. Bundle marketing < 100KB.

### Phase 8: Sitemap + robots + analytics (0.5d)
**Branch**: `feature/seo-phase-8-sitemap`

Tasks:
- [ ] Build script `scripts/generate-sitemap.ts` chạy sau `ng build`: list tất cả prerender HTML → sitemap.xml. Hỗ trợ hreflang alternate trong `<url>`
- [ ] `robots.txt` ở `public/`: `User-agent: *\nAllow: /\nSitemap: https://domain.com/sitemap.xml`
- [ ] Tích hợp analytics: Plausible (paid) hoặc Umami (self-host free) — KHÔNG Google Analytics để giữ message privacy
- [ ] Add tracking script vào `index.html` (defer, async)
- [ ] Google Search Console: submit sitemap, verify ownership qua meta tag

**Definition of done**: sitemap.xml accessible, GSC verified, analytics tracking events.

---

## 🧰 Tech additions

| Package | Mục đích | Khi thêm |
|---|---|---|
| `@angular/ssr` | SSG/prerender | Phase 1 |
| `@angular/platform-server` | Dep transitive của @angular/ssr | Phase 1 (auto) |
| `marked` (optional) | Blog markdown parsing nếu chọn format MD | Phase 6 |

**KHÔNG cần**: CMS, search backend, Algolia, MDX runtime, GA.

---

## ⚠️ Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| User cũ bookmark `/` mất app | UX regression | CTA "Mở app" prominent ở hero. Optional: detect `localStorage.angular_image_optimizer_presets` → show banner "Bạn đã dùng app trước, vào ngay" |
| Hydration mismatch SSR lang vs client lang | Console warning, layout shift | Server ưu tiên route param `:lang`, không tự detect. Client cũng đọc route param đầu tiên |
| Marketing bundle phình to do import nhầm compressorjs/cdk | LCP chậm, bounce rate cao | Lazy load `/optimize` route. CI gate: marketing bundle size < 100KB |
| Blog content stale → SEO không cập nhật | Mất ranking dần | Document lịch update vào CHANGELOG. Lên kế hoạch refresh content quarterly |
| i18n service hiện tại chỉ signal-based, khó test SSR | Block Phase 1 | Refactor `TranslationService` constructor nhận initial lang từ APP_INITIALIZER hoặc ActivatedRoute |
| Prerender bị block bởi browser API (window, navigator) trong landing | Build fail | Wrap với `isPlatformBrowser()` check. Test prerender ở Phase 1 với landing stub |

---

## 📌 Open questions cần research

1. **Domain & hosting cụ thể?** Cần biết để set canonical URL absolute trong SeoService. Nếu chưa có, dùng env var `BASE_URL` configurable
2. **Keyword research thực sự** chưa làm — danh sách trên là giả định. Trước Phase 3 cần verify qua Ahrefs/Ubersuggest hoặc Google Trends
3. **Logo + brand identity** cho marketing — hiện logo nào? OG image cần tạo
4. **Analytics provider** — Plausible (paid $9/mo) hay Umami (self-host free)?
5. **Blog: TS module vs markdown** — confirm sau khi prototype Phase 6
6. **Newsletter / email capture**? — bỏ qua nếu không có backend, hoặc dùng dịch vụ third-party (Buttondown, ConvertKit) — sau MVP

---

## 🎬 Progress tracker

| Phase | Status | Branch | Notes |
|---|---|---|---|
| 1. Routing + SSG | ✅ Done | feature/seo-phase-1-ssg | 9 routes prerendered. /optimize = Client mode (skip prerender). Dynamic-imported compressorjs/jszip/heic2any. Services SSR-safe via isPlatformBrowser. |
| 2. Marketing shell + SeoService | ⏳ Pending | - | - |
| 3. Landing page | ⏳ Pending | - | - |
| 4. SEO meta + structured data | ⏳ Pending | - | - |
| 5. About + Changelog | ⏳ Pending | - | - |
| 6. Blog scaffold + 3 posts | ⏳ Pending | - | - |
| 7. Performance | ⏳ Pending | - | - |
| 8. Sitemap + analytics | ⏳ Pending | - | - |

---

*Created: 2026-05-21. Will be updated as phases complete.*
