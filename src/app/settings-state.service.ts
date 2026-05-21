import { Injectable, computed, inject, signal } from '@angular/core';
import { ImageCompressionService } from './image-compression.service';
import {
  CompressionOptions,
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  WatermarkPosition,
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
  readonly watermarkText = signal<string>(DEFAULT_WATERMARK.text);
  readonly watermarkPosition = signal<WatermarkPosition>('bottom-right');
  readonly watermarkFontSize = signal<number>(DEFAULT_WATERMARK.fontSizePercent);
  readonly watermarkOpacity = signal<number>(DEFAULT_WATERMARK.opacity);
  readonly watermarkColor = signal<string>(DEFAULT_WATERMARK.color);

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
  });
}
