import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../translation.service';

interface FaqItem {
  qKey: string;
  aKey: string;
}

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  private readonly translation = inject(TranslationService);
  readonly t = this.translation.t;

  readonly items: FaqItem[] = [
    { qKey: 'faq_q1', aKey: 'faq_a1' },
    { qKey: 'faq_q2', aKey: 'faq_a2' },
    { qKey: 'faq_q3', aKey: 'faq_a3' },
    { qKey: 'faq_q4', aKey: 'faq_a4' },
    { qKey: 'faq_q5', aKey: 'faq_a5' },
    { qKey: 'faq_q6', aKey: 'faq_a6' },
    { qKey: 'faq_q7', aKey: 'faq_a7' },
    { qKey: 'faq_q8', aKey: 'faq_a8' },
  ];
}
