import { Injectable, computed, inject, signal } from '@angular/core';
import { ImageCompressionService } from './image-compression.service';
import {
  CompressionOptions,
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  WatermarkConfig,
  WatermarkPosition,
  WatermarkType,
} from './image-processing.model';
import { DEFAULT_RESIZE, DEFAULT_WATERMARK } from './image-processing.constants';

@Injectable({
  providedIn: 'root',
})
export class SettingsStateService {
  private readonly compressionService = inject(ImageCompressionService);

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

  readonly includeWatermark = signal<boolean>(false);
  readonly watermarkType = signal<WatermarkType>('text');
  readonly watermarkText = signal<string>(DEFAULT_WATERMARK.text);
  readonly watermarkPosition = signal<WatermarkPosition>('bottom-right');
  readonly watermarkFontSize = signal<number>(DEFAULT_WATERMARK.fontSizePercent);
  readonly watermarkOpacity = signal<number>(DEFAULT_WATERMARK.opacity);
  readonly watermarkColor = signal<string>(DEFAULT_WATERMARK.color);
  readonly watermarkImage = signal<Blob | null>(null);
  readonly watermarkImageSize = signal<number>(DEFAULT_WATERMARK.imageSizePercent);
  readonly watermarkImagePreviewUrl = signal<string | null>(null);

  readonly currentOptions = computed<CompressionOptions>(() => {
    const base = this.compressionService.getOptionsByPreset(this.selectedPreset());
    return {
      ...base,
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
      watermark: this.buildWatermarkConfig(),
    };
  });

  setWatermarkImage(blob: Blob | null): void {
    // Revoke preview URL cũ trước khi tạo URL mới
    const oldUrl = this.watermarkImagePreviewUrl();
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    this.watermarkImage.set(blob);
    this.watermarkImagePreviewUrl.set(blob ? URL.createObjectURL(blob) : null);
  }

  private buildWatermarkConfig(): WatermarkConfig | undefined {
    if (!this.includeWatermark()) return undefined;

    if (this.watermarkType() === 'image') {
      const image = this.watermarkImage();
      if (!image) return undefined;
      return {
        type: 'image',
        image,
        size: this.watermarkImageSize(),
        opacity: this.watermarkOpacity(),
        position: this.watermarkPosition(),
      };
    }

    return {
      type: 'text',
      text: this.watermarkText(),
      fontSize: this.watermarkFontSize(),
      opacity: this.watermarkOpacity(),
      color: this.watermarkColor(),
      position: this.watermarkPosition(),
    };
  }
}
