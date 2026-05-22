import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);

  readonly installPromptEvent = signal<BeforeInstallPromptEvent | null>(null);
  readonly canInstall = computed(() => !!this.installPromptEvent());
  readonly updateAvailable = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.installPromptEvent.set(e as BeforeInstallPromptEvent);
      });

      window.addEventListener('appinstalled', () => {
        this.installPromptEvent.set(null);
      });

      if (this.swUpdate.isEnabled) {
        this.swUpdate.versionUpdates.subscribe((event) => {
          if (event.type === 'VERSION_READY') {
            this.updateAvailable.set(true);
          }
        });
      }
    }
  }

  installApp(): void {
    const promptEvent = this.installPromptEvent();
    if (!promptEvent) return;

    // Luôn clear prompt event sau khi prompt — dù user accept, dismiss, hay
    // browser throw. Tránh stuck button state nếu Promise reject.
    const clear = (): void => this.installPromptEvent.set(null);
    promptEvent.prompt();
    promptEvent.userChoice.then(clear, clear);
  }

  reloadApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Luôn reload dù activateUpdate fail (vd. không có waiting worker).
    // User click "Reload" → phải reload, không kẹt button.
    const reload = (): void => window.location.reload();
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(reload, reload);
    } else {
      reload();
    }
  }
}
