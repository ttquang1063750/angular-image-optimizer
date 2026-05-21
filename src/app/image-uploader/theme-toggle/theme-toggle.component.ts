import { Component, inject } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { TranslationService } from '../../translation.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);

  readonly currentTheme = this.themeService.currentTheme;
  readonly t = this.translationService.t;

  toggle(): void {
    this.themeService.toggle();
  }
}
