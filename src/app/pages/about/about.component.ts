import { Component, EnvironmentInjector, computed, effect, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';
import { openSupportDialogLazy } from '../../shared/ui/support-dialog/open-support-dialog';
import { AboutContent } from './about-content';
import { aboutContentVi } from './about-content.vi';
import { aboutContentEn } from './about-content.en';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly t = this.translation.t;
  readonly content = computed<AboutContent>(() =>
    this.translation.currentLang() === 'vi' ? aboutContentVi : aboutContentEn,
  );

  constructor() {
    effect(() => {
      const t = this.translation.t();
      this.seo.setRoute({
        titleKey: 'seo_about_title',
        descriptionKey: 'seo_about_description',
        path: 'about',
        breadcrumbs: [
          { name: t['nav_landing'], path: '' },
          { name: t['nav_about'], path: 'about' },
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: t['seo_about_title'],
          description: t['seo_about_description'],
        },
      });
    });
  }

  async openSupport(): Promise<void> {
    await openSupportDialogLazy(this.envInjector, this.t()['modal_support_title']);
  }
}
