import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '../../../translation.service';
import { LangSwitcherComponent } from '../../ui/lang-switcher/lang-switcher.component';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-marketing-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LangSwitcherComponent, ThemeToggleComponent],
  templateUrl: './marketing-header.component.html',
  styleUrl: './marketing-header.component.scss',
})
export class MarketingHeaderComponent {
  private readonly translation = inject(TranslationService);
  readonly lang = this.translation.currentLang;
  readonly t = this.translation.t;
}
