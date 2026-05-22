import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { TranslationService } from '../../translation.service';
import { SEO_BASE_URL, SEO_DEFAULT_OG_IMAGE } from './seo.constants';

describe('SeoService', () => {
  let service: SeoService;
  let translation: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('lang');
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    translation = TestBed.inject(TranslationService);
    translation.setLang('vi');
  });

  it('smoke', () => {
    expect(service).toBeTruthy();
  });

  describe('setRoute', () => {
    it('set <title> từ i18n key', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
      });
      expect(document.title).toBe(translation.t()['seo_landing_title']);
    });

    it('set meta description', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      const tag = document.head.querySelector('meta[name="description"]');
      expect(tag?.getAttribute('content')).toBe(translation.t()['seo_about_description']);
    });

    it('set canonical link đúng base + lang + path', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      const link = document.head.querySelector('link[rel="canonical"]');
      expect(link?.getAttribute('href')).toBe(`${SEO_BASE_URL}/vi/about`);
    });

    it('canonical cho landing (path rỗng) không có trailing slash', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
      });
      const link = document.head.querySelector('link[rel="canonical"]');
      expect(link?.getAttribute('href')).toBe(`${SEO_BASE_URL}/vi`);
    });

    it('set hreflang alternates cho vi, en, x-default', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      const links = document.head.querySelectorAll('link[rel="alternate"][data-seo-hreflang]');
      const byLang: Record<string, string | null> = {};
      links.forEach((el) => {
        byLang[el.getAttribute('hreflang') ?? ''] = el.getAttribute('href');
      });

      expect(byLang['vi']).toBe(`${SEO_BASE_URL}/vi/about`);
      expect(byLang['en']).toBe(`${SEO_BASE_URL}/en/about`);
      expect(byLang['x-default']).toBe(`${SEO_BASE_URL}/vi/about`);
    });

    it('set html[lang] theo current lang', () => {
      translation.setLang('en');
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('OG tags reflect title + description + canonical + lang', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
      });

      const get = (selector: string) =>
        document.head.querySelector(selector)?.getAttribute('content');

      expect(get('meta[property="og:title"]')).toBe(translation.t()['seo_landing_title']);
      expect(get('meta[property="og:description"]')).toBe(
        translation.t()['seo_landing_description'],
      );
      expect(get('meta[property="og:url"]')).toBe(`${SEO_BASE_URL}/vi`);
      expect(get('meta[property="og:image"]')).toBe(SEO_DEFAULT_OG_IMAGE);
      expect(get('meta[property="og:locale"]')).toBe('vi_VN');
      expect(get('meta[property="og:type"]')).toBe('website');
    });

    it('robots noindex,nofollow khi noIndex=true', () => {
      service.setRoute({
        titleKey: 'seo_not_found_title',
        descriptionKey: 'seo_not_found_description',
        path: '404',
        noIndex: true,
      });
      const robots = document.head.querySelector('meta[name="robots"]')?.getAttribute('content');
      expect(robots).toBe('noindex,nofollow');
    });

    it('robots index,follow khi noIndex falsy', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
      });
      const robots = document.head.querySelector('meta[name="robots"]')?.getAttribute('content');
      expect(robots).toBe('index,follow');
    });

    it('ghi JSON-LD vào <head> với data-seo marker', () => {
      const ld = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Image Optimizer',
      };
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        jsonLd: ld,
      });
      const script = document.head.querySelector('script[type="application/ld+json"][data-seo]');
      expect(script).not.toBeNull();
      expect(JSON.parse(script?.textContent ?? '{}')).toEqual(ld);
    });

    it('ghi nhiều JSON-LD khi truyền array', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        jsonLd: [{ '@type': 'A' }, { '@type': 'B' }],
      });
      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo]',
      );
      expect(scripts).toHaveLength(2);
    });

    it('call lần 2 thay thế JSON-LD cũ, không tích lũy', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        jsonLd: { '@type': 'First' },
      });
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
        jsonLd: { '@type': 'Second' },
      });
      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo]',
      );
      expect(scripts).toHaveLength(1);
      expect(JSON.parse(scripts[0].textContent ?? '{}')['@type']).toBe('Second');
    });

    it('call lần 2 không nhân đôi hreflang links', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      service.setRoute({
        titleKey: 'seo_changelog_title',
        descriptionKey: 'seo_changelog_description',
        path: 'changelog',
      });
      const links = document.head.querySelectorAll('link[rel="alternate"][data-seo-hreflang]');
      expect(links).toHaveLength(3);
    });

    it('breadcrumbs auto-generate JSON-LD BreadcrumbList với absolute URL', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
        breadcrumbs: [
          { name: 'Home', path: '' },
          { name: 'About', path: 'about' },
        ],
      });

      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo]',
      );
      const parsed = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'));
      const breadcrumb = parsed.find((d) => d['@type'] === 'BreadcrumbList');

      expect(breadcrumb).toBeDefined();
      expect(breadcrumb.itemListElement).toHaveLength(2);
      expect(breadcrumb.itemListElement[0]).toMatchObject({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SEO_BASE_URL}/vi`,
      });
      expect(breadcrumb.itemListElement[1]).toMatchObject({
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${SEO_BASE_URL}/vi/about`,
      });
    });

    it('breadcrumbs cộng dồn vào jsonLd hiện có (không thay thế)', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        jsonLd: { '@context': 'https://schema.org', '@type': 'SoftwareApplication' },
        breadcrumbs: [{ name: 'Home', path: '' }],
      });

      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo]',
      );
      expect(scripts).toHaveLength(2);
      const types = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}')['@type']);
      expect(types).toContain('SoftwareApplication');
      expect(types).toContain('BreadcrumbList');
    });

    it('breadcrumbs rỗng không emit BreadcrumbList', () => {
      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
        breadcrumbs: [],
      });
      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo]',
      );
      expect(scripts).toHaveLength(0);
    });

    it('keywords meta tag set khi có, remove khi không có', () => {
      service.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        keywords: ['image optimizer', 'nén ảnh'],
      });
      expect(document.head.querySelector('meta[name="keywords"]')?.getAttribute('content')).toBe(
        'image optimizer, nén ảnh',
      );

      service.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
      });
      expect(document.head.querySelector('meta[name="keywords"]')).toBeNull();
    });
  });
});
