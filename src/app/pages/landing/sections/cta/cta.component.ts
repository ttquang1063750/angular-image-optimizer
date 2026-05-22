import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../translation.service';

@Component({
  selector: 'app-landing-cta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss',
})
export class CtaComponent {
  private readonly translation = inject(TranslationService);
  readonly t = this.translation.t;
  readonly lang = this.translation.currentLang;
}
