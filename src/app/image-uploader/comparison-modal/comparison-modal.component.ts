import { Component, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import { getNumberValue } from '../../utils/dom-event';

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
  readonly comparisonSliderValue = this.state.comparisonSliderValue;

  close(): void {
    this.state.closeComparison();
  }

  updateSlider(event: Event): void {
    this.state.setComparisonSlider(getNumberValue(event));
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
