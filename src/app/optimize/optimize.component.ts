import { Component, effect, inject } from '@angular/core';
import { ImageUploaderComponent } from '../image-uploader/image-uploader.component';
import { TranslationService } from '../translation.service';
import { SeoService } from '../shared/seo/seo.service';

@Component({
  selector: 'app-optimize',
  standalone: true,
  imports: [ImageUploaderComponent],
  template: `<app-image-uploader></app-image-uploader>`,
})
export class OptimizeComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      this.translation.currentLang();
      this.seo.setRoute({
        titleKey: 'seo_optimize_title',
        descriptionKey: 'seo_optimize_description',
        path: 'optimize',
        noIndex: true,
      });
    });
  }
}
