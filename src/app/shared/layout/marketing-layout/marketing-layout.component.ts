import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketingHeaderComponent } from '../marketing-header/marketing-header.component';
import { MarketingFooterComponent } from '../marketing-footer/marketing-footer.component';

@Component({
  selector: 'app-marketing-layout',
  standalone: true,
  imports: [RouterOutlet, MarketingHeaderComponent, MarketingFooterComponent],
  template: `
    <app-marketing-header></app-marketing-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-marketing-footer></app-marketing-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex-grow: 1;
      }
    `,
  ],
})
export class MarketingLayoutComponent {}
