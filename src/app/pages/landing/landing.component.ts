import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../translation.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Tối ưu hình ảnh ngay trong trình duyệt</h1>
      <p>Nén, resize, watermark và đổi định dạng — 100% client-side, không upload.</p>
      <a [routerLink]="['/', lang(), 'optimize']" class="cta-primary">Mở app ngay →</a>
    </section>
    <section class="placeholder">
      <p><em>Phase 3 sẽ build out features grid, how-it-works, comparison, FAQ.</em></p>
    </section>
  `,
  styles: [
    `
      .hero {
        text-align: center;
        padding: 80px 24px;
        h1 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        p {
          font-size: 1.2rem;
          color: var(--color-text-muted);
          margin-bottom: 32px;
        }
        .cta-primary {
          display: inline-block;
          padding: 14px 32px;
          background: var(--color-primary);
          color: var(--color-text-on-primary);
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05rem;
        }
      }
      .placeholder {
        text-align: center;
        padding: 40px;
        color: var(--color-text-subtle);
      }
    `,
  ],
})
export class LandingComponent {
  private readonly translation = inject(TranslationService);
  readonly lang = this.translation.currentLang;
}
