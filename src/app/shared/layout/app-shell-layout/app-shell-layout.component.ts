import { Component, EnvironmentInjector, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslationService } from '../../../translation.service';
import { LangSwitcherComponent } from '../../ui/lang-switcher/lang-switcher.component';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { openSupportDialogLazy } from '../../ui/support-dialog/open-support-dialog';
import { PresetManagerComponent } from '../../../image-uploader/settings-panel/preset-manager/preset-manager.component';
import { PwaService } from '../../pwa/pwa.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LangSwitcherComponent,
    ThemeToggleComponent,
    PresetManagerComponent,
  ],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.scss',
})
export class AppShellLayoutComponent {
  private readonly translation = inject(TranslationService);
  private readonly envInjector = inject(EnvironmentInjector);
  protected readonly pwa = inject(PwaService);

  readonly t = this.translation.t;
  readonly lang = this.translation.currentLang;
  protected readonly showSettings = signal(false);

  async openSupport(): Promise<void> {
    await openSupportDialogLazy(this.envInjector, this.t()['modal_support_title']);
  }

  toggleSettings(): void {
    this.showSettings.update((v) => !v);
  }

  closeSettings(): void {
    this.showSettings.set(false);
  }

  installApp(): void {
    this.pwa.installApp();
    this.closeSettings();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSettings()) return;
    const target = event.target as HTMLElement;
    if (target.closest('.settings-toggle') || target.closest('.settings-popover')) return;
    this.closeSettings();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showSettings()) this.closeSettings();
  }
}
