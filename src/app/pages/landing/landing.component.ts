import { Component, computed, effect, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';
import { SEO_BASE_URL } from '../../shared/seo/seo.constants';
import { HeroComponent } from './sections/hero/hero.component';
import { FeaturesComponent } from './sections/features/features.component';
import { HowItWorksComponent } from './sections/how-it-works/how-it-works.component';
import { ComparisonComponent } from './sections/comparison/comparison.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaComponent } from './sections/cta/cta.component';

const FAQ_KEYS = [
  ['faq_q1', 'faq_a1'],
  ['faq_q2', 'faq_a2'],
  ['faq_q3', 'faq_a3'],
  ['faq_q4', 'faq_a4'],
  ['faq_q5', 'faq_a5'],
  ['faq_q6', 'faq_a6'],
  ['faq_q7', 'faq_a7'],
  ['faq_q8', 'faq_a8'],
] as const;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    ComparisonComponent,
    FaqComponent,
    CtaComponent,
  ],
  template: `
    <app-landing-hero></app-landing-hero>
    <app-landing-features></app-landing-features>
    <app-landing-how-it-works></app-landing-how-it-works>
    <app-landing-comparison></app-landing-comparison>
    <app-landing-faq></app-landing-faq>
    <app-landing-cta></app-landing-cta>
  `,
})
export class LandingComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);

  private readonly jsonLd = computed(() => {
    const t = this.translation.t();
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Image Optimizer',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        url: SEO_BASE_URL,
        description: t['seo_landing_description'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_KEYS.map(([qKey, aKey]) => ({
          '@type': 'Question',
          name: t[qKey],
          acceptedAnswer: { '@type': 'Answer', text: t[aKey] },
        })),
      },
    ];
  });

  constructor() {
    effect(() => {
      this.translation.currentLang();
      this.seo.setRoute({
        titleKey: 'seo_landing_title',
        descriptionKey: 'seo_landing_description',
        path: '',
        jsonLd: this.jsonLd(),
      });
    });
  }
}
