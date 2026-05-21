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
import {
  DEFAULT_SETTINGS,
  INPUT_RANGES,
  PRESET_EXPORT_FILENAME,
  PRESET_STORAGE_KEY,
  VALID_COMPRESSION_PRESETS,
  VALID_OUTPUT_FORMATS,
  VALID_RESIZE_MODES,
  VALID_WATERMARK_POSITIONS,
  VALID_WATERMARK_TYPES,
} from './image-processing.constants';

@Injectable({
  providedIn: 'root',
})
export class SettingsStateService {
  private readonly compressionService = inject(ImageCompressionService);

  readonly selectedPreset = signal<CompressionPreset>(DEFAULT_SETTINGS.selectedPreset);
  readonly selectedFormat = signal<OutputFormat>(DEFAULT_SETTINGS.selectedFormat);
  readonly selectedResizeMode = signal<ResizeMode>(DEFAULT_SETTINGS.selectedResizeMode);
  readonly resizeWidth = signal<number>(DEFAULT_SETTINGS.resizeWidth);
  readonly resizeHeight = signal<number>(DEFAULT_SETTINGS.resizeHeight);
  readonly resizePercent = signal<number>(DEFAULT_SETTINGS.resizePercent);

  readonly namePrefix = signal<string>(DEFAULT_SETTINGS.namePrefix);
  readonly nameSuffix = signal<string>(DEFAULT_SETTINGS.nameSuffix);
  readonly includeNumbering = signal<boolean>(DEFAULT_SETTINGS.includeNumbering);
  readonly startNumberingIndex = signal<number>(DEFAULT_SETTINGS.startNumberingIndex);

  readonly includeWatermark = signal<boolean>(DEFAULT_SETTINGS.includeWatermark);
  readonly watermarkType = signal<WatermarkType>(DEFAULT_SETTINGS.watermarkType);
  readonly watermarkText = signal<string>(DEFAULT_SETTINGS.watermarkText);
  readonly watermarkPosition = signal<WatermarkPosition>(DEFAULT_SETTINGS.watermarkPosition);
  readonly watermarkFontSize = signal<number>(DEFAULT_SETTINGS.watermarkFontSize);
  readonly watermarkOpacity = signal<number>(DEFAULT_SETTINGS.watermarkOpacity);
  readonly watermarkColor = signal<string>(DEFAULT_SETTINGS.watermarkColor);
  readonly watermarkImage = signal<Blob | null>(null);
  readonly watermarkImageSize = signal<number>(DEFAULT_SETTINGS.watermarkImageSize);
  readonly watermarkImagePreviewUrl = signal<string | null>(null);

  readonly customPresets = signal<UserPreset[]>([]);

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

  constructor() {
    this.loadPresetsFromStorage();
  }

  setWatermarkImage(blob: Blob | null): void {
    // Revoke preview URL cũ trước khi tạo URL mới
    const oldUrl = this.watermarkImagePreviewUrl();
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    this.watermarkImage.set(blob);
    this.watermarkImagePreviewUrl.set(blob ? URL.createObjectURL(blob) : null);
  }

  async saveCustomPreset(name: string): Promise<boolean> {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = this.customPresets().some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;

    const data = await this.buildSavedPresetData();
    const newPreset: UserPreset = {
      id: crypto.randomUUID(),
      name: trimmed,
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
    this.applyPresetData(preset.data);
  }

  deleteCustomPreset(id: string): void {
    const updated = this.customPresets().filter((p) => p.id !== id);
    this.savePresetsToStorage(updated);
  }

  resetToDefaults(): void {
    this.applyPresetData(DEFAULT_SETTINGS);
  }

  exportPresets(): void {
    const dataStr = JSON.stringify(this.customPresets(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = PRESET_EXPORT_FILENAME;
    link.click();
    URL.revokeObjectURL(url);
  }

  importPresets(jsonText: string): boolean {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return false;
    }
    if (!Array.isArray(parsed)) return false;

    const validPresets: UserPreset[] = [];
    for (const item of parsed) {
      const validated = this.validateImportedPreset(item);
      if (validated) validPresets.push(validated);
    }
    if (validPresets.length === 0) return false;

    const current = [...this.customPresets()];
    for (const imported of validPresets) {
      const indexByName = current.findIndex(
        (p) => p.name.toLowerCase() === imported.name.toLowerCase(),
      );

      if (indexByName > -1) {
        // Trùng tên: ghi đè data nhưng giữ id hiện hữu
        current[indexByName] = { ...imported, id: current[indexByName].id };
      } else {
        current.push(imported);
      }
    }

    this.savePresetsToStorage(current);
    return true;
  }

  // Corrupt/invalid storage được im lặng bỏ qua — user trải nghiệm sạch
  // (signal vẫn ở giá trị mặc định empty array). Mọi item failed validation
  // bị filter; partial recovery vẫn hữu ích nếu chỉ một entry lỗi.
  private loadPresetsFromStorage(): void {
    let stored: string | null;
    try {
      stored = localStorage.getItem(PRESET_STORAGE_KEY);
    } catch {
      return;
    }
    if (!stored) return;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const valid: UserPreset[] = [];
      for (const item of parsed) {
        const v = this.validateImportedPreset(item);
        if (v) valid.push(v);
      }
      this.customPresets.set(valid);
    } catch {
      // JSON corrupt: giữ state mặc định
    }
  }

  private savePresetsToStorage(presets: UserPreset[]): void {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
    this.customPresets.set(presets);
  }

  private async buildSavedPresetData(): Promise<SavedPresetData> {
    let watermarkImageBase64: string | null = null;
    const wmImage = this.watermarkImage();
    if (wmImage && this.includeWatermark() && this.watermarkType() === 'image') {
      try {
        watermarkImageBase64 = await this.blobToBase64(wmImage);
      } catch {
        // Encode fail: preset vẫn save được nhưng không có watermark image
      }
    }

    return {
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
  }

  private applyPresetData(data: SavedPresetData): void {
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

  /**
   * Validate một item từ JSON ngoại lai và normalize về `UserPreset`. Re-issue
   * `id` mới (không tin id từ file ngoại) và clamp/whitelist mọi field.
   * Trả về `null` nếu cấu trúc tối thiểu không hợp lệ.
   */
  private validateImportedPreset(item: unknown): UserPreset | null {
    if (!item || typeof item !== 'object') return null;
    const rec = item as Record<string, unknown>;
    if (typeof rec['name'] !== 'string' || !rec['name'].trim()) return null;
    const rawData = rec['data'];
    if (!rawData || typeof rawData !== 'object') return null;

    const data = this.sanitizePresetData(rawData as Record<string, unknown>);
    if (!data) return null;

    return {
      id: crypto.randomUUID(),
      name: (rec['name'] as string).trim(),
      data,
      createdAt: typeof rec['createdAt'] === 'number' ? rec['createdAt'] : Date.now(),
    };
  }

  private sanitizePresetData(raw: Record<string, unknown>): SavedPresetData | null {
    const selectedPreset = this.pickEnum(raw['selectedPreset'], VALID_COMPRESSION_PRESETS);
    const selectedFormat = this.pickEnum(raw['selectedFormat'], VALID_OUTPUT_FORMATS);
    const selectedResizeMode = this.pickEnum(raw['selectedResizeMode'], VALID_RESIZE_MODES);
    const watermarkType = this.pickEnum(raw['watermarkType'], VALID_WATERMARK_TYPES);
    const watermarkPosition = this.pickEnum(raw['watermarkPosition'], VALID_WATERMARK_POSITIONS);

    if (!selectedPreset || !selectedFormat || !selectedResizeMode) return null;
    if (!watermarkType || !watermarkPosition) return null;

    const wmBase64 = raw['watermarkImageBase64'];
    const watermarkImageBase64 =
      typeof wmBase64 === 'string' && wmBase64.startsWith('data:') ? wmBase64 : null;

    return {
      selectedPreset,
      selectedFormat,
      selectedResizeMode,
      resizeWidth: this.clampNumber(
        raw['resizeWidth'],
        INPUT_RANGES.resizePx.min,
        INPUT_RANGES.resizePx.max,
        DEFAULT_SETTINGS.resizeWidth,
      ),
      resizeHeight: this.clampNumber(
        raw['resizeHeight'],
        INPUT_RANGES.resizePx.min,
        INPUT_RANGES.resizePx.max,
        DEFAULT_SETTINGS.resizeHeight,
      ),
      resizePercent: this.clampNumber(
        raw['resizePercent'],
        INPUT_RANGES.resizePercent.min,
        INPUT_RANGES.resizePercent.max,
        DEFAULT_SETTINGS.resizePercent,
      ),
      namePrefix: this.pickString(raw['namePrefix'], DEFAULT_SETTINGS.namePrefix),
      nameSuffix: this.pickString(raw['nameSuffix'], DEFAULT_SETTINGS.nameSuffix),
      includeNumbering: this.pickBoolean(
        raw['includeNumbering'],
        DEFAULT_SETTINGS.includeNumbering,
      ),
      startNumberingIndex: this.clampNumber(
        raw['startNumberingIndex'],
        INPUT_RANGES.startNumberingIndex.min,
        INPUT_RANGES.startNumberingIndex.max,
        DEFAULT_SETTINGS.startNumberingIndex,
      ),
      includeWatermark: this.pickBoolean(
        raw['includeWatermark'],
        DEFAULT_SETTINGS.includeWatermark,
      ),
      watermarkType,
      watermarkText: this.pickString(raw['watermarkText'], DEFAULT_SETTINGS.watermarkText),
      watermarkPosition,
      watermarkFontSize: this.clampNumber(
        raw['watermarkFontSize'],
        INPUT_RANGES.watermarkFontSize.min,
        INPUT_RANGES.watermarkFontSize.max,
        DEFAULT_SETTINGS.watermarkFontSize,
      ),
      watermarkOpacity: this.clampNumber(
        raw['watermarkOpacity'],
        INPUT_RANGES.watermarkOpacity.min,
        INPUT_RANGES.watermarkOpacity.max,
        DEFAULT_SETTINGS.watermarkOpacity,
      ),
      watermarkColor: this.pickString(raw['watermarkColor'], DEFAULT_SETTINGS.watermarkColor),
      watermarkImageBase64,
      watermarkImageSize: this.clampNumber(
        raw['watermarkImageSize'],
        INPUT_RANGES.watermarkImageSize.min,
        INPUT_RANGES.watermarkImageSize.max,
        DEFAULT_SETTINGS.watermarkImageSize,
      ),
    };
  }

  private pickEnum<T extends string>(value: unknown, whitelist: readonly T[]): T | null {
    return typeof value === 'string' && (whitelist as readonly string[]).includes(value)
      ? (value as T)
      : null;
  }

  private pickString(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
  }

  private pickBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
  }

  private clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    return Math.min(Math.max(value, min), max);
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
    if (parts.length !== 2) throw new Error('Invalid base64 data URL');
    const contentType = parts[0].split(':')[1] ?? 'application/octet-stream';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
}
