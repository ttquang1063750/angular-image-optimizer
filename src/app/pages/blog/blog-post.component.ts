import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';
import { SEO_BASE_URL, SEO_DEFAULT_OG_IMAGE } from '../../shared/seo/seo.constants';
import { BlogPost, readingTimeMinutes } from './blog-post.model';
import { findPost, relatedPosts } from './blog-posts.registry';
import { AdsenseComponent } from '../../shared/ui/adsense/adsense.component';

interface RelatedView {
  post: BlogPost;
  readingMinutes: number;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, AdsenseComponent],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly t = this.translation.t;
  readonly lang = this.translation.currentLang;
  /**
   * Slug từ paramMap observable — reliable cho cả SSR/prerender lẫn runtime
   * navigation giữa các slug. Snapshot có thể chưa hydrate khi component
   * khởi tạo trong một số code path.
   */
  readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('slug') ?? '',
  });

  readonly post = computed<BlogPost | undefined>(() => findPost(this.slug(), this.lang()));
  readonly readingMinutes = computed(() => {
    const p = this.post();
    return p ? readingTimeMinutes(p.contentHtml) : 0;
  });
  /** Hero SVG đã trust — source là TS module nội bộ, không phải user input. */
  readonly heroSafe = computed<SafeHtml | null>(() => {
    const p = this.post();
    return p?.heroSvg ? this.sanitizer.bypassSecurityTrustHtml(p.heroSvg) : null;
  });
  /** ContentHtml chỉ chứa p/h2/h3/ul/ol/li/a/strong/em/code từ TS module — trust. */
  readonly contentSafe = computed<SafeHtml>(() => {
    const p = this.post();
    return p ? this.sanitizer.bypassSecurityTrustHtml(p.contentHtml) : '';
  });
  readonly related = computed<RelatedView[]>(() => {
    const p = this.post();
    if (!p) return [];
    return relatedPosts(p).map((rp) => ({
      post: rp,
      readingMinutes: readingTimeMinutes(rp.contentHtml),
    }));
  });

  constructor() {
    effect(() => {
      const t = this.translation.t();
      const p = this.post();
      const langValue = this.lang();
      const slugValue = this.slug();

      if (!p) {
        this.seo.setRoute({
          titleKey: 'blog_not_found_title',
          descriptionKey: 'blog_not_found_body',
          path: `blog/${slugValue}`,
          noIndex: true,
          breadcrumbs: [
            { name: t['nav_landing'], path: '' },
            { name: t['nav_blog'], path: 'blog' },
          ],
        });
        return;
      }

      const canonicalPath = `blog/${p.slug}`;
      this.seo.setRoute({
        title: `${p.title} — Image Optimizer`,
        description: p.description,
        path: canonicalPath,
        ogType: 'article',
        ogImage: SEO_DEFAULT_OG_IMAGE,
        keywords: p.tags,
        breadcrumbs: [
          { name: t['nav_landing'], path: '' },
          { name: t['nav_blog'], path: 'blog' },
          { name: p.title, path: canonicalPath },
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.description,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt ?? p.publishedAt,
          inLanguage: langValue,
          keywords: p.tags.join(', '),
          author: { '@type': 'Person', name: p.author },
          publisher: {
            '@type': 'Organization',
            name: 'Image Optimizer',
            url: SEO_BASE_URL,
          },
          mainEntityOfPage: `${SEO_BASE_URL}/${langValue}/${canonicalPath}`,
          image: SEO_DEFAULT_OG_IMAGE,
        },
      });
    });
  }
}
