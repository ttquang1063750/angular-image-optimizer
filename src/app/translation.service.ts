import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Lang, TRANSLATIONS } from './i18n';

export type { Lang } from './i18n';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentLang = signal<Lang>(this.getInitialLang());

  readonly t = computed(() => TRANSLATIONS[this.currentLang()]);

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (this.isBrowser) localStorage.setItem('lang', lang);
  }

  private getInitialLang(): Lang {
    if (!this.isBrowser) return 'vi';

    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'vi' || saved === 'en') return saved;

    return navigator.language.startsWith('vi') ? 'vi' : 'en';
  }
}
