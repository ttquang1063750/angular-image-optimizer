import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Lang, TranslationService } from '../translation.service';

const SUPPORTED_LANGS: Lang[] = ['vi', 'en'];

function isLang(value: string | null | undefined): value is Lang {
  return value === 'vi' || value === 'en';
}

/**
 * Validate `:lang` param. Nếu hợp lệ, sync với TranslationService.
 * Nếu không hợp lệ (vd. /foo/...), redirect tới /vi/<path>.
 */
export const langGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  const translation = inject(TranslationService);
  const router = inject(Router);

  if (isLang(lang)) {
    if (translation.currentLang() !== lang) translation.setLang(lang);
    return true;
  }

  const rest = route.url.map((s) => s.path).join('/');
  const suffix = rest ? `/${rest}/` : '/';
  return router.parseUrl(`/vi${suffix}`);
};

/**
 * Root redirect: `/` → `/{detectedLang}/`.
 * - Browser: localStorage > navigator.language > 'vi'
 * - Server (prerender): 'vi' default
 */
export const rootRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  let lang: Lang = 'vi';
  if (isBrowser) {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (isLang(saved)) {
      lang = saved;
    } else if (navigator.language.startsWith('vi')) {
      lang = 'vi';
    } else {
      lang = 'en';
    }
  }

  return router.parseUrl(`/${lang}/`);
};

/**
 * Optimize redirect: `/optimize` → `/{detectedLang}/optimize`.
 */
export const optimizeRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  let lang: Lang = 'vi';
  if (isBrowser) {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (isLang(saved)) {
      lang = saved;
    } else if (navigator.language.startsWith('vi')) {
      lang = 'vi';
    } else {
      lang = 'en';
    }
  }

  return router.parseUrl(`/${lang}/optimize`);
};

export { SUPPORTED_LANGS };
