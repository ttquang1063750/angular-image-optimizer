import { Injectable, signal, computed } from '@angular/core';
import { Lang, TRANSLATIONS } from './i18n';

export type { Lang } from './i18n';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  readonly currentLang = signal<Lang>(this.getInitialLang());

  readonly t = computed(() => TRANSLATIONS[this.currentLang()]);

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }

  private getInitialLang(): Lang {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'vi' || saved === 'en') return saved;

    // Mặc định theo trình duyệt hoặc tiếng Việt
    return navigator.language.startsWith('vi') ? 'vi' : 'en';
  }
}
