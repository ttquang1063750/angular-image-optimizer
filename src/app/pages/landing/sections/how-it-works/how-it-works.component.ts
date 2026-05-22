import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../translation.service';

interface Step {
  iconKey: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-landing-how-it-works',
  standalone: true,
  imports: [],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
})
export class HowItWorksComponent {
  private readonly translation = inject(TranslationService);
  readonly t = this.translation.t;

  readonly steps: Step[] = [
    { iconKey: 'drop', titleKey: 'how_step1_title', descKey: 'how_step1_desc' },
    { iconKey: 'tune', titleKey: 'how_step2_title', descKey: 'how_step2_desc' },
    { iconKey: 'download', titleKey: 'how_step3_title', descKey: 'how_step3_desc' },
  ];
}
