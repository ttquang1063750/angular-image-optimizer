import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslationService } from '../../../translation.service';

@Component({
  selector: 'app-marketing-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="marketing-header">
      <a [routerLink]="['/', lang()]" class="brand">Image Optimizer</a>
      <nav>
        <a [routerLink]="['/', lang(), 'blog']">Blog</a>
        <a [routerLink]="['/', lang(), 'about']">About</a>
        <a [routerLink]="['/', lang(), 'changelog']">Changelog</a>
      </nav>
      <a [routerLink]="['/', lang(), 'optimize']" class="cta">Mở app →</a>
    </header>
    <main><router-outlet></router-outlet></main>
    <footer class="marketing-footer">
      <small>© Image Optimizer — Client-side image compression</small>
    </footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .marketing-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--color-border-soft);
        .brand {
          font-weight: 700;
          color: var(--color-text);
          text-decoration: none;
        }
        nav {
          display: flex;
          gap: 16px;
          margin-left: 24px;
          flex-grow: 1;
          a {
            color: var(--color-text-muted);
            text-decoration: none;
            &:hover {
              color: var(--color-primary);
            }
          }
        }
        .cta {
          padding: 8px 16px;
          background: var(--color-primary);
          color: var(--color-text-on-primary);
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
        }
      }
      main {
        flex-grow: 1;
      }
      .marketing-footer {
        padding: 24px;
        text-align: center;
        color: var(--color-text-subtle);
        border-top: 1px solid var(--color-border-soft);
      }
    `,
  ],
})
export class MarketingLayoutComponent {
  private readonly translation = inject(TranslationService);
  readonly lang = this.translation.currentLang;
}
