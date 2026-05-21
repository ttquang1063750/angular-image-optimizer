import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../translation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container">
      <h1>404</h1>
      <p>Trang không tồn tại.</p>
      <a [routerLink]="['/', lang()]">← Về trang chủ</a>
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
  readonly lang = this.translation.currentLang;
}
