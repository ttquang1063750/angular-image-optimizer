import { Component, inject } from '@angular/core';
import { Lang, TranslationService } from '../../../translation.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [],
  templateUrl: './lang-switcher.component.html',
  styleUrl: './lang-switcher.component.scss',
})
export class LangSwitcherComponent {
  private readonly translation = inject(TranslationService);

  readonly currentLang = this.translation.currentLang;

  setLang(lang: Lang): void {
    if (this.currentLang() === lang) return;
    this.translation.setLang(lang);
  }
}
