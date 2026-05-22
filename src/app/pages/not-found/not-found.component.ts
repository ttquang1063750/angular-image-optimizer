import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container">
      <h1>404</h1>
      <p>{{ t()['seo_not_found_description'] }}</p>
      <a [routerLink]="['/', lang()]">{{ t()['app_shell_back_to_home'] }}</a>
    </article>
  `,
  styles: [
    `
      .container {
        text-align: center;
        padding: 80px 24px;
      }
      h1 {
        font-size: 4rem;
        margin-bottom: 16px;
      }
      a {
        color: var(--color-primary);
        text-decoration: none;
      }
    `,
  ],
})
export class NotFoundComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);

  readonly lang = this.translation.currentLang;
  readonly t = this.translation.t;

  constructor() {
    effect(() => {
      this.lang();
      this.seo.setRoute({
        titleKey: 'seo_not_found_title',
        descriptionKey: 'seo_not_found_description',
        path: '404',
        noIndex: true,
      });
    });
  }
}
