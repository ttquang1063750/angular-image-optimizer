import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-theme', this.currentTheme());
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, theme);
  }

  toggle(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';

    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
