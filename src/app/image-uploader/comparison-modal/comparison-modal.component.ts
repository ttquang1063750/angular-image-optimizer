import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';

@Component({
  selector: 'app-comparison-modal',
  standalone: true,
  imports: [],
  templateUrl: './comparison-modal.component.html',
  styleUrl: './comparison-modal.component.scss',
})
export class ComparisonModalComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly comparingFile = this.state.comparingFile;

  readonly isHovering = signal<boolean>(false);
  readonly zoomPct = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  readonly lensPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  readonly imgSize = signal<{ w: number; h: number }>({ w: 0, h: 0 });
  readonly zoomFactor = 2.5;
  readonly lensSize = 160;

  close(): void {
    this.state.closeComparison();
  }

  onMouseMove(event: MouseEvent): void {
    const pane = event.currentTarget as HTMLElement;
    const img = pane.querySelector('img') as HTMLImageElement;
    if (!img) return;

    const paneRect = pane.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const x = event.clientX - imgRect.left;
    const y = event.clientY - imgRect.top;

    const pctX = (x / imgRect.width) * 100;
    const pctY = (y / imgRect.height) * 100;

    if (pctX >= 0 && pctX <= 100 && pctY >= 0 && pctY <= 100) {
      this.isHovering.set(true);
      this.zoomPct.set({ x: pctX, y: pctY });

      const lensX = imgRect.left - paneRect.left + x - this.lensSize / 2;
      const lensY = imgRect.top - paneRect.top + y - this.lensSize / 2;
      this.lensPos.set({ x: lensX, y: lensY });
      this.imgSize.set({ w: imgRect.width, h: imgRect.height });
    } else {
      this.isHovering.set(false);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return;
    const touch = event.touches[0];
    const pane = event.currentTarget as HTMLElement;
    const img = pane.querySelector('img') as HTMLImageElement;
    if (!img) return;

    const paneRect = pane.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const x = touch.clientX - imgRect.left;
    const y = touch.clientY - imgRect.top;

    const pctX = (x / imgRect.width) * 100;
    const pctY = (y / imgRect.height) * 100;

    if (pctX >= 0 && pctX <= 100 && pctY >= 0 && pctY <= 100) {
      event.preventDefault();
      this.isHovering.set(true);
      this.zoomPct.set({ x: pctX, y: pctY });

      const lensX = imgRect.left - paneRect.left + x - this.lensSize / 2;
      const lensY = imgRect.top - paneRect.top + y - this.lensSize / 2;
      this.lensPos.set({ x: lensX, y: lensY });
      this.imgSize.set({ w: imgRect.width, h: imgRect.height });
    } else {
      this.isHovering.set(false);
    }
  }

  onMouseLeave(): void {
    this.isHovering.set(false);
  }

  createBlobUrl(file: File): string {
    return this.state.createBlobUrl(file);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${new Intl.NumberFormat('en-US').format(value)} ${sizes[i]}`;
  }
}
