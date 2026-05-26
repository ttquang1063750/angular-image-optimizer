import { RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_POSTS } from './pages/blog/blog-posts.registry';

const langs = async () => [{ lang: 'vi' }, { lang: 'en' }];

const blogSlugs = async () => BLOG_POSTS.map((p) => ({ lang: p.lang, slug: p.slug }));

export const serverRoutes: ServerRoute[] = [
  // Root → resolved via redirect guard tại runtime; vẫn prerender HTML rỗng
  { path: '', renderMode: RenderMode.Prerender },

  // Marketing routes prerendered cho cả vi + en
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/about', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/changelog', renderMode: RenderMode.Prerender, getPrerenderParams: langs },
  { path: ':lang/blog', renderMode: RenderMode.Prerender, getPrerenderParams: langs },

  // /optimize là SPA app — prerender để Cloudflare Pages phục vụ trực tiếp file tĩnh
  { path: ':lang/optimize', renderMode: RenderMode.Prerender, getPrerenderParams: langs },

  // Blog posts — prerender từng slug × lang từ registry.
  {
    path: ':lang/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: blogSlugs,
  },

  // 404
  { path: '**', renderMode: RenderMode.Prerender },
];
