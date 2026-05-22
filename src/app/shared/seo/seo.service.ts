import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Lang, TranslationService } from '../../translation.service';
import {
  SEO_BASE_URL,
  SEO_DEFAULT_OG_IMAGE,
  SEO_SUPPORTED_LANGS,
  SEO_X_DEFAULT_LANG,
} from './seo.constants';

export interface SeoBreadcrumb {
  /** Tên hiển thị (đã resolve i18n, không phải key). */
  name: string;
  /**
   * Path sau lang segment, KHÔNG có leading slash.
   * VD: '' cho Home, 'blog', 'blog/webp-vs-jpeg'.
   */
  path: string;
}

export interface SeoRouteConfig {
  /** Dictionary key cho <title>. Bỏ qua nếu `title` được set. */
  titleKey?: string;
  /** Override raw — dùng cho post title (không nằm trong dictionary). */
  title?: string;
  /** Dictionary key cho meta description. Bỏ qua nếu `description` được set. */
  descriptionKey?: string;
  /** Override raw cho description. */
  description?: string;
  /**
   * Path sau lang segment, KHÔNG có leading slash.
   * VD: '' cho landing, 'about', 'blog', 'blog/webp-vs-jpeg'.
   */
  path: string;
  /** Override OG image (absolute URL). Mặc định dùng SEO_DEFAULT_OG_IMAGE. */
  ogImage?: string;
  /** Mặc định 'website'. Set 'article' cho blog posts. */
  ogType?: 'website' | 'article';
  /** JSON-LD object hoặc array of objects. */
  jsonLd?: object | object[];
  /**
   * Breadcrumb trail. Service auto-generate JSON-LD BreadcrumbList với
   * absolute URL. Truyền theo thứ tự từ root tới current.
   */
  breadcrumbs?: SeoBreadcrumb[];
  /** Set true cho draft hoặc 404. */
  noIndex?: boolean;
  /** Override keywords. */
  keywords?: string[];
}

/**
 * Source-of-truth cho head metadata mỗi route. Gọi từ ngOnInit hoặc data
 * resolver. Safe cho cả SSR (prerender) và browser — không đụng vào window.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly translation = inject(TranslationService);

  setRoute(config: SeoRouteConfig): void {
    const t = this.translation.t();
    const lang = this.translation.currentLang();

    const titleText =
      config.title ?? (config.titleKey ? (t[config.titleKey] ?? config.titleKey) : '');
    const descriptionText =
      config.description ??
      (config.descriptionKey ? (t[config.descriptionKey] ?? config.descriptionKey) : '');
    const canonical = this.buildUrl(lang, config.path);
    const ogImage = config.ogImage ?? SEO_DEFAULT_OG_IMAGE;
    const ogType = config.ogType ?? 'website';

    this.title.setTitle(titleText);
    this.meta.updateTag({ name: 'description', content: descriptionText });
    this.meta.updateTag({
      name: 'robots',
      content: config.noIndex ? 'noindex,nofollow' : 'index,follow',
    });

    if (config.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    } else {
      this.meta.removeTag('name="keywords"');
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: titleText });
    this.meta.updateTag({ property: 'og:description', content: descriptionText });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:locale', content: this.toOgLocale(lang) });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: titleText });
    this.meta.updateTag({ name: 'twitter:description', content: descriptionText });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.setHtmlLang(lang);
    this.setCanonical(canonical);
    this.setAlternates(config.path);

    const allJsonLd = this.combineJsonLd(config.jsonLd, config.breadcrumbs, lang);
    this.setJsonLd(allJsonLd);
  }

  private combineJsonLd(
    extra: object | object[] | undefined,
    breadcrumbs: SeoBreadcrumb[] | undefined,
    lang: Lang,
  ): object[] | undefined {
    const items: object[] = [];
    if (extra) {
      if (Array.isArray(extra)) {
        items.push(...extra);
      } else {
        items.push(extra);
      }
    }
    if (breadcrumbs && breadcrumbs.length > 0) {
      items.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: this.buildUrl(lang, b.path),
        })),
      });
    }
    return items.length > 0 ? items : undefined;
  }

  private buildUrl(lang: Lang, path: string): string {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const suffix = cleanPath ? `/${cleanPath}` : '';
    return `${SEO_BASE_URL}/${lang}${suffix}`;
  }

  private toOgLocale(lang: Lang): string {
    return lang === 'vi' ? 'vi_VN' : 'en_US';
  }

  private setHtmlLang(lang: Lang): void {
    this.document.documentElement.setAttribute('lang', lang);
  }

  private setCanonical(href: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setAlternates(path: string): void {
    const head = this.document.head;
    head.querySelectorAll('link[rel="alternate"][data-seo-hreflang]').forEach((el) => el.remove());

    for (const lang of SEO_SUPPORTED_LANGS) {
      this.appendAlternate(lang, this.buildUrl(lang, path));
    }
    this.appendAlternate('x-default', this.buildUrl(SEO_X_DEFAULT_LANG, path));
  }

  private appendAlternate(hreflang: string, href: string): void {
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-seo-hreflang', '');
    this.document.head.appendChild(link);
  }

  private setJsonLd(data: object | object[] | undefined): void {
    const head = this.document.head;
    head
      .querySelectorAll('script[type="application/ld+json"][data-seo]')
      .forEach((el) => el.remove());

    if (!data) return;
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', '');
      script.textContent = JSON.stringify(item);
      head.appendChild(script);
    }
  }
}
