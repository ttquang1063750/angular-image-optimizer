import { Component, computed, effect, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';
import { ChangelogContent } from './changelog-content';
import { changelogContentVi } from './changelog-content.vi';
import { changelogContentEn } from './changelog-content.en';

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [],
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.scss',
})
export class ChangelogComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);

  readonly t = this.translation.t;
  readonly content = computed<ChangelogContent>(() =>
    this.translation.currentLang() === 'vi' ? changelogContentVi : changelogContentEn,
  );

  constructor() {
    effect(() => {
      const t = this.translation.t();
      this.seo.setRoute({
        titleKey: 'seo_changelog_title',
        descriptionKey: 'seo_changelog_description',
        path: 'changelog',
        breadcrumbs: [
          { name: t['nav_landing'], path: '' },
          { name: t['nav_changelog'], path: 'changelog' },
        ],
      });
    });
  }
}
