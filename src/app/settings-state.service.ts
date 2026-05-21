import { Injectable, computed, inject, signal } from '@angular/core';
import { ImageCompressionService } from './image-compression.service';
import {
  CompressionOptions,
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  SavedPresetData,
  UserPreset,
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

  readonly customPresets = signal<UserPreset[]>([]);

  constructor() {
    this.loadPresetsFromStorage();
  }

  private loadPresetsFromStorage(): void {
    try {
      const stored = localStorage.getItem('angular_image_optimizer_presets');
      if (stored) {
        this.customPresets.set(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }

  private savePresetsToStorage(presets: UserPreset[]): void {
    localStorage.setItem('angular_image_optimizer_presets', JSON.stringify(presets));
    this.customPresets.set(presets);
  }

  async saveCustomPreset(name: string): Promise<boolean> {
    if (!name.trim()) return false;
    const exists = this.customPresets().some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (exists) return false;

    let watermarkImageBase64: string | null = null;
    const wmImage = this.watermarkImage();
    if (wmImage && this.includeWatermark() && this.watermarkType() === 'image') {
      try {
        watermarkImageBase64 = await this.blobToBase64(wmImage);
      } catch {
        // Ignore
      }
    }

    const data: SavedPresetData = {
      selectedPreset: this.selectedPreset(),
      selectedFormat: this.selectedFormat(),
      selectedResizeMode: this.selectedResizeMode(),
      resizeWidth: this.resizeWidth(),
      resizeHeight: this.resizeHeight(),
      resizePercent: this.resizePercent(),
      namePrefix: this.namePrefix(),
      nameSuffix: this.nameSuffix(),
      includeNumbering: this.includeNumbering(),
      startNumberingIndex: this.startNumberingIndex(),
      includeWatermark: this.includeWatermark(),
      watermarkType: this.watermarkType(),
      watermarkText: this.watermarkText(),
      watermarkPosition: this.watermarkPosition(),
      watermarkFontSize: this.watermarkFontSize(),
      watermarkOpacity: this.watermarkOpacity(),
      watermarkColor: this.watermarkColor(),
      watermarkImageBase64,
      watermarkImageSize: this.watermarkImageSize(),
    };

    const newPreset: UserPreset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data,
      createdAt: Date.now(),
    };

    const updated = [...this.customPresets(), newPreset];
    this.savePresetsToStorage(updated);
    return true;
  }

  loadCustomPreset(id: string): void {
    const preset = this.customPresets().find((p) => p.id === id);
    if (!preset) return;

    const data = preset.data;
    this.selectedPreset.set(data.selectedPreset);
    this.selectedFormat.set(data.selectedFormat);
    this.selectedResizeMode.set(data.selectedResizeMode);
    this.resizeWidth.set(data.resizeWidth);
    this.resizeHeight.set(data.resizeHeight);
    this.resizePercent.set(data.resizePercent);
    this.namePrefix.set(data.namePrefix);
    this.nameSuffix.set(data.nameSuffix);
    this.includeNumbering.set(data.includeNumbering);
    this.startNumberingIndex.set(data.startNumberingIndex);
    this.includeWatermark.set(data.includeWatermark);
    this.watermarkType.set(data.watermarkType);
    this.watermarkText.set(data.watermarkText);
    this.watermarkPosition.set(data.watermarkPosition);
    this.watermarkFontSize.set(data.watermarkFontSize);
    this.watermarkOpacity.set(data.watermarkOpacity);
    this.watermarkColor.set(data.watermarkColor);
    this.watermarkImageSize.set(data.watermarkImageSize);

    if (data.watermarkImageBase64) {
      try {
        const blob = this.base64ToBlob(data.watermarkImageBase64);
        this.setWatermarkImage(blob);
      } catch {
        this.setWatermarkImage(null);
      }
    } else {
      this.setWatermarkImage(null);
    }
  }

  deleteCustomPreset(id: string): void {
    const updated = this.customPresets().filter((p) => p.id !== id);
    this.savePresetsToStorage(updated);
  }

  resetToDefaults(): void {
    this.selectedPreset.set('medium');
    this.selectedFormat.set('image/jpeg');
    this.selectedResizeMode.set('auto');
    this.resizeWidth.set(DEFAULT_RESIZE.width);
    this.resizeHeight.set(DEFAULT_RESIZE.height);
    this.resizePercent.set(DEFAULT_RESIZE.percent);
    this.namePrefix.set('');
    this.nameSuffix.set('');
    this.includeNumbering.set(false);
    this.startNumberingIndex.set(1);
    this.includeWatermark.set(false);
    this.watermarkType.set('text');
    this.watermarkText.set(DEFAULT_WATERMARK.text);
    this.watermarkPosition.set('bottom-right');
    this.watermarkFontSize.set(DEFAULT_WATERMARK.fontSizePercent);
    this.watermarkOpacity.set(DEFAULT_WATERMARK.opacity);
    this.watermarkColor.set(DEFAULT_WATERMARK.color);
    this.watermarkImageSize.set(DEFAULT_WATERMARK.imageSizePercent);
    this.setWatermarkImage(null);
  }

  exportPresets(): void {
    const dataStr = JSON.stringify(this.customPresets(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'angular_image_optimizer_presets.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  importPresets(jsonText: string): boolean {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) return false;

      const validPresets: UserPreset[] = [];
      for (const item of parsed) {
        if (item && typeof item === 'object' && item.id && item.name && item.data) {
          validPresets.push({
            id: item.id,
            name: item.name,
            data: item.data,
            createdAt: item.createdAt || Date.now(),
          });
        }
      }

      if (validPresets.length === 0) return false;

      const current = [...this.customPresets()];
      for (const imported of validPresets) {
        const indexById = current.findIndex((p) => p.id === imported.id);
        const indexByName = current.findIndex(
          (p) => p.name.toLowerCase() === imported.name.toLowerCase(),
        );

        if (indexById > -1) {
          current[indexById] = imported;
        } else if (indexByName > -1) {
          current[indexByName] = { ...imported, id: current[indexByName].id };
        } else {
          current.push(imported);
        }
      }

      this.savePresetsToStorage(current);
      return true;
    } catch {
      return false;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
}
