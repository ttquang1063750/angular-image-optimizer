import { Component, PLATFORM_ID, inject, isDevMode, AfterViewInit, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-adsense',
  standalone: true,
  imports: [],
  templateUrl: './adsense.component.html',
  styleUrl: './adsense.component.scss',
})
export class AdsenseComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  readonly adSlot = input.required<string>();
  readonly adClient = input<string>('ca-pub-3175971990265774');
  readonly adFormat = input<string>('auto');
  readonly fullWidthResponsive = input<boolean>(true);
  readonly adStyleDisplay = input<string>('block');

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly isDev = isDevMode();

  ngAfterViewInit(): void {
    if (this.isBrowser && !this.isDev) {
      try {
        const globalWindow = window as unknown as { adsbygoogle: unknown[] };
        globalWindow.adsbygoogle = globalWindow.adsbygoogle || [];
        globalWindow.adsbygoogle.push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }
}
