import { Component, inject } from '@angular/core';
import { TranslationService, Lang } from '../../translation.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [],
  templateUrl: './lang-switcher.component.html',
  styleUrl: './lang-switcher.component.scss',
})
export class LangSwitcherComponent {
  private readonly translationService = inject(TranslationService);

  readonly currentLang = this.translationService.currentLang;

  setLang(lang: Lang): void {
    this.translationService.setLang(lang);
  }
}
