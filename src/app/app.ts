import { Component, HostListener, inject, signal } from '@angular/core';
import { TranslationService } from './translation.service';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { LangSwitcherComponent } from './shared/ui/lang-switcher/lang-switcher.component';
import { ThemeToggleComponent } from './shared/ui/theme-toggle/theme-toggle.component';
import { LogoComponent } from './shared/ui/logo/logo.component';
import { PresetManagerComponent } from './image-uploader/settings-panel/preset-manager/preset-manager.component';
import { PwaService } from './shared/pwa/pwa.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ImageUploaderComponent,
    LangSwitcherComponent,
    ThemeToggleComponent,
    LogoComponent,
    PresetManagerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly translation = inject(TranslationService);
  protected readonly pwa = inject(PwaService);

  readonly t = this.translation.t;
  protected readonly showSettings = signal(false);

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
