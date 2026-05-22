import { Component, EnvironmentInjector, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../translation.service';
import { openSupportDialogLazy } from '../../ui/support-dialog/open-support-dialog';
import { LogoComponent } from '../../ui/logo/logo.component';

@Component({
  selector: 'app-marketing-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './marketing-footer.component.html',
  styleUrl: './marketing-footer.component.scss',
})
export class MarketingFooterComponent {
  private readonly translation = inject(TranslationService);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly lang = this.translation.currentLang;
  readonly t = this.translation.t;
  readonly currentYear = new Date().getFullYear();

  copyright(): string {
    return this.t()['footer_copyright'].replace('{year}', String(this.currentYear));
  }

  async openSupport(): Promise<void> {
    await openSupportDialogLazy(this.envInjector, this.t()['modal_support_title']);
  }
}
