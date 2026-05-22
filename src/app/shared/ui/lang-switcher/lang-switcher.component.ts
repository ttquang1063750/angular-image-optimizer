import { Component, inject } from '@angular/core';
import { Router, UrlSegment, UrlSegmentGroup } from '@angular/router';
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
  private readonly router = inject(Router);

  readonly currentLang = this.translation.currentLang;

  setLang(lang: Lang): void {
    if (this.currentLang() === lang) return;

    const tree = this.router.parseUrl(this.router.url);
    const primary = tree.root.children['primary'];

    if (primary && primary.segments.length > 0) {
      const next = [new UrlSegment(lang, {}), ...primary.segments.slice(1)];
      tree.root.children['primary'] = new UrlSegmentGroup(next, primary.children);
    } else {
      tree.root.children['primary'] = new UrlSegmentGroup([new UrlSegment(lang, {})], {});
    }

    this.router.navigateByUrl(tree);
  }
}
