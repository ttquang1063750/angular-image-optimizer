import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from '../../../translation.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.scss',
})
export class AppShellLayoutComponent {
  private readonly translation = inject(TranslationService);

  readonly t = this.translation.t;
  protected readonly isSupportModalOpen = signal(false);

  toggleSupportModal(open: boolean): void {
    this.isSupportModalOpen.set(open);
  }
}
