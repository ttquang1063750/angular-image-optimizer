import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../translation.service';

interface Feature {
  iconKey: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  private readonly translation = inject(TranslationService);
  readonly t = this.translation.t;

  readonly features: Feature[] = [
    { iconKey: 'privacy', titleKey: 'feature_privacy_title', descKey: 'feature_privacy_desc' },
    { iconKey: 'bulk', titleKey: 'feature_bulk_title', descKey: 'feature_bulk_desc' },
    { iconKey: 'webp', titleKey: 'feature_webp_title', descKey: 'feature_webp_desc' },
    {
      iconKey: 'watermark',
      titleKey: 'feature_watermark_title',
      descKey: 'feature_watermark_desc',
    },
    { iconKey: 'exif', titleKey: 'feature_exif_title', descKey: 'feature_exif_desc' },
    { iconKey: 'presets', titleKey: 'feature_presets_title', descKey: 'feature_presets_desc' },
    { iconKey: 'drag', titleKey: 'feature_drag_title', descKey: 'feature_drag_desc' },
    { iconKey: 'save', titleKey: 'feature_save_title', descKey: 'feature_save_desc' },
  ];
}
