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
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then(() => {
        this.installPromptEvent.set(null);
      });
    }
  }

  reloadApp(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.swUpdate.isEnabled) {
        this.swUpdate.activateUpdate().then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  }
}
