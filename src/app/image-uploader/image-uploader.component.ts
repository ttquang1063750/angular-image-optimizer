import { Component, inject, signal } from '@angular/core';
import { ImageCompressionService } from '../image-compression.service';
import { TranslationService, Lang } from '../translation.service';
import { ThemeService } from '../theme.service';
import { UploaderStateService } from '../uploader-state.service';
import {
  ProcessedFile,
  CompressionPreset,
  CompressionOptions,
  OutputFormat,
  ResizeMode,
  WatermarkPosition,
} from '../image-processing.model';
import { DEFAULT_RESIZE, DEFAULT_WATERMARK } from '../image-processing.constants';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
})
export class ImageUploaderComponent {
  private readonly compressionService = inject(ImageCompressionService);
  private readonly translationService = inject(TranslationService);
  private readonly themeService = inject(ThemeService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly currentLang = this.translationService.currentLang;
  readonly currentTheme = this.themeService.currentTheme;

  // Re-expose state signals để template dùng trực tiếp
  readonly processedFiles = this.state.processedFiles;
  readonly isCompressing = this.state.isCompressing;
  readonly settingsChanged = this.state.settingsChanged;
  readonly comparingFile = this.state.comparingFile;
  readonly comparisonSliderValue = this.state.comparisonSliderValue;
  readonly completedCount = this.state.completedCount;

  // Settings signals giữ ở component cho tới khi tách <app-settings-panel>
  readonly selectedPreset = signal<CompressionPreset>('medium');
  readonly selectedFormat = signal<OutputFormat>('image/jpeg');
  readonly selectedResizeMode = signal<ResizeMode>('auto');
  readonly resizeWidth = signal<number>(DEFAULT_RESIZE.width);
  readonly resizeHeight = signal<number>(DEFAULT_RESIZE.height);
  readonly resizePercent = signal<number>(DEFAULT_RESIZE.percent);
  readonly namePrefix = signal<string>('');
  readonly nameSuffix = signal<string>('');
  readonly includeNumbering = signal<boolean>(false);
  readonly startNumberingIndex = signal<number>(1);
  readonly isDragging = signal<boolean>(false);

  readonly includeWatermark = signal<boolean>(false);
  readonly watermarkText = signal<string>(DEFAULT_WATERMARK.text);
  readonly watermarkPosition = signal<WatermarkPosition>('bottom-right');
  readonly watermarkFontSize = signal<number>(DEFAULT_WATERMARK.fontSizePercent);
  readonly watermarkOpacity = signal<number>(DEFAULT_WATERMARK.opacity);
  readonly watermarkColor = signal<string>(DEFAULT_WATERMARK.color);

  setLang(lang: Lang): void {
    this.translationService.setLang(lang);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processFiles(Array.from(input.files));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  setPreset(preset: CompressionPreset): void {
    this.selectedPreset.set(preset);
    this.state.markSettingsChanged();
  }

  setFormat(format: OutputFormat): void {
    this.selectedFormat.set(format);
    this.state.markSettingsChanged();
  }

  setResizeMode(mode: ResizeMode): void {
    this.selectedResizeMode.set(mode);
    this.state.markSettingsChanged();
  }

  updateResizeValue(event: Event, type: 'width' | 'height' | 'percent'): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (isNaN(value) || value <= 0) return;

    if (type === 'width') this.resizeWidth.set(value);
    if (type === 'height') this.resizeHeight.set(value);
    if (type === 'percent') this.resizePercent.set(value);
    this.state.markSettingsChanged();
  }

  updateNamingValue(event: Event, type: 'prefix' | 'suffix' | 'start'): void {
    const input = event.target as HTMLInputElement;
    if (type === 'start') {
      const val = input.valueAsNumber;
      if (!isNaN(val)) this.startNumberingIndex.set(val);
    } else {
      if (type === 'prefix') this.namePrefix.set(input.value);
      if (type === 'suffix') this.nameSuffix.set(input.value);
    }
    this.state.markSettingsChanged();
  }

  toggleNumbering(): void {
    this.includeNumbering.update((v) => !v);
    this.state.markSettingsChanged();
  }

  toggleWatermark(): void {
    this.includeWatermark.update((v) => !v);
    this.state.markSettingsChanged();
  }

  setWatermarkPosition(pos: WatermarkPosition): void {
    this.watermarkPosition.set(pos);
    this.state.markSettingsChanged();
  }

  updateWatermarkValue(event: Event, type: 'text' | 'size' | 'opacity' | 'color'): void {
    const input = event.target as HTMLInputElement;
    if (type === 'text') this.watermarkText.set(input.value);
    if (type === 'color') this.watermarkColor.set(input.value);

    const val = input.valueAsNumber;
    if (!isNaN(val)) {
      if (type === 'size') this.watermarkFontSize.set(val);
      if (type === 'opacity') this.watermarkOpacity.set(val);
    }
    this.state.markSettingsChanged();
  }

  recompressAll(): void {
    this.state.recompressAll(this.getCompressionOptions());
  }

  removeFile(id: string): void {
    this.state.removeFile(id);
  }

  clearAll(): void {
    this.state.clearAll();
  }

  openComparison(item: ProcessedFile): void {
    this.state.openComparison(item);
  }

  closeComparison(): void {
    this.state.closeComparison();
  }

  updateComparisonSlider(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.state.setComparisonSlider(input.valueAsNumber);
  }

  createBlobUrl(file: File): string {
    return this.state.createBlobUrl(file);
  }

  async downloadAll(): Promise<void> {
    const doneFiles = this.processedFiles().filter((f) => f.status === 'done');
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1 && doneFiles[0].result) {
      this.downloadSingle(doneFiles[0]);
    } else {
      const zipBlob = await this.state.generateZip();
      const url = URL.createObjectURL(zipBlob);
      this.downloadFile(url, `compressed_images_${new Date().getTime()}.zip`);
      URL.revokeObjectURL(url);
    }
  }

  downloadSingle(item: ProcessedFile): void {
    if (item.status === 'done' && item.result) {
      this.downloadFile(item.result.compressedUrl, item.result.compressedFile.name);
    }
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${new Intl.NumberFormat('en-US').format(value)} ${sizes[i]}`;
  }

  formatExactBytes(bytes: number): string {
    return new Intl.NumberFormat('en-US').format(bytes) + ' bytes';
  }

  private processFiles(files: File[]): void {
    const imageFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.name.toLowerCase().endsWith('.heic') ||
        f.name.toLowerCase().endsWith('.heif'),
    );
    if (imageFiles.length === 0) return;

    this.state.addFiles(imageFiles, this.getCompressionOptions());
  }

  private getCompressionOptions(): CompressionOptions {
    const baseOptions = this.compressionService.getOptionsByPreset(this.selectedPreset());
    return {
      ...baseOptions,
      format: this.selectedFormat(),
      resizeMode: this.selectedResizeMode(),
      resizeWidth: this.resizeWidth(),
      resizeHeight: this.resizeHeight(),
      resizePercent: this.resizePercent(),
      namePattern: {
        prefix: this.namePrefix(),
        suffix: this.nameSuffix(),
        includeNumbering: this.includeNumbering(),
        startIndex: this.startNumberingIndex(),
      },
      watermark: this.includeWatermark()
        ? {
            text: this.watermarkText(),
            position: this.watermarkPosition(),
            fontSize: this.watermarkFontSize(),
            opacity: this.watermarkOpacity(),
            color: this.watermarkColor(),
          }
        : undefined,
    };
  }

  private downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }
}
