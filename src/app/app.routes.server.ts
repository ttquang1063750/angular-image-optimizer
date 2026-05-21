import { RenderMode, ServerRoute } from '@angular/ssr';

const langs = async () => [{ lang: 'vi' }, { lang: 'en' }];

export const serverRoutes: ServerRoute[] = [
  // Root → resolved via redirect guard tại runtime; vẫn prerender HTML rỗng
  { path: '', renderMode: RenderMode.Prerender },

  // Marketing routes prerendered cho cả vi + en
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/about', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/changelog', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/blog', renderMode: RenderMode.Prerender, getPrerenderParams: langs },

  // /optimize là SPA app — không cần SEO, không prerender (tránh việc bundle
  // compressorjs/jszip/heic2any chạy server-side gây lỗi window).
  { path: ':lang/optimize', renderMode: RenderMode.Client },

  // Blog post slugs — Phase 6 sẽ điền danh sách thực; Phase 1 empty.
  {
    path: ':lang/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [],
  },

  // 404
  { path: '**', renderMode: RenderMode.Prerender },
];
