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
  WatermarkType,
  WatermarkItem,
  SavedWatermarkData,
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
  DEFAULT_WATERMARK,
  MAX_WATERMARKS,
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
  readonly watermarks = signal<WatermarkItem[]>([]);

  readonly preserveExif = signal<boolean>(DEFAULT_SETTINGS.preserveExif);

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
      watermarks: this.buildWatermarkConfigList(),
      preserveExif: this.preserveExif(),
    };
  });

  constructor() {
    this.watermarks.set(this.initWatermarksFromDefault());
    this.loadPresetsFromStorage();
  }

  private initWatermarksFromDefault(): WatermarkItem[] {
    const defaultWms = DEFAULT_SETTINGS.watermarks || [];
    return defaultWms.map((w) => {
      if (w.type === 'text') {
        return {
          id: w.id,
          type: 'text',
          text: w.text,
          fontSize: w.fontSize,
          color: w.color,
          opacity: w.opacity,
          position: w.position,
        };
      } else {
        return {
          id: w.id,
          type: 'image',
          image: null,
          imageName: w.imageName || null,
          previewUrl: null,
          size: w.size,
          opacity: w.opacity,
          position: w.position,
        };
      }
    });
  }

  setWatermarkImage(id: string, file: File | null): void {
    this.watermarks.update((list) =>
      list.map((w) => {
        if (w.id === id && w.type === 'image') {
          if (w.previewUrl) URL.revokeObjectURL(w.previewUrl);
          return {
            ...w,
            image: file,
            imageName: file ? file.name || 'logo.png' : null,
            previewUrl: file ? URL.createObjectURL(file) : null,
          };
        }
        return w;
      }),
    );
  }

  replaceWatermark(id: string, newItem: WatermarkItem): void {
    if (newItem.id !== id) return;
    const old = this.watermarks().find((w) => w.id === id);
    if (!old) return;

    if (old.type === 'image' && old.previewUrl) {
      const newPreviewUrl = newItem.type === 'image' ? newItem.previewUrl : null;
      if (old.previewUrl !== newPreviewUrl) {
        URL.revokeObjectURL(old.previewUrl);
      }
    }

    this.watermarks.update((list) => list.map((w) => (w.id === id ? newItem : w)));
  }

  addWatermark(type: WatermarkType): void {
    const current = this.watermarks();
    if (current.length >= MAX_WATERMARKS) return;

    const id = crypto.randomUUID();
    let newItem: WatermarkItem;
    if (type === 'text') {
      newItem = {
        id,
        type: 'text',
        text: 'Watermark',
        fontSize: DEFAULT_WATERMARK.fontSizePercent,
        color: DEFAULT_WATERMARK.color,
        opacity: DEFAULT_WATERMARK.opacity,
        position: 'bottom-right',
      };
    } else {
      newItem = {
        id,
        type: 'image',
        image: null,
        imageName: null,
        previewUrl: null,
        size: DEFAULT_WATERMARK.imageSizePercent,
        opacity: DEFAULT_WATERMARK.opacity,
        position: 'bottom-right',
      };
    }

    this.watermarks.set([...current, newItem]);
  }

  removeWatermark(id: string): void {
    const item = this.watermarks().find((w) => w.id === id);
    if (item && item.type === 'image' && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.watermarks.update((list) => list.filter((w) => w.id !== id));
  }

  updateWatermark(id: string, updates: Partial<WatermarkItem>): void {
    this.watermarks.update((list) =>
      list.map((w) => {
        if (w.id === id) {
          return { ...w, ...updates } as WatermarkItem;
        }
        return w;
      }),
    );
  }

  setWatermarks(items: WatermarkItem[]): void {
    const newItemIds = new Set(items.map((item) => item.id));
    for (const w of this.watermarks()) {
      if (w.type === 'image' && w.previewUrl && !newItemIds.has(w.id)) {
        URL.revokeObjectURL(w.previewUrl);
      }
    }
    this.watermarks.set(items);
  }

  private clearAllWatermarkPreviewUrls(): void {
    for (const w of this.watermarks()) {
      if (w.type === 'image' && w.previewUrl) {
        URL.revokeObjectURL(w.previewUrl);
      }
    }
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
    const savedWatermarks: SavedWatermarkData[] = [];
    if (this.includeWatermark()) {
      for (const w of this.watermarks()) {
        if (w.type === 'text') {
          savedWatermarks.push({
            id: w.id,
            type: 'text',
            text: w.text,
            fontSize: w.fontSize,
            color: w.color,
            opacity: w.opacity,
            position: w.position,
          });
        } else {
          let base64: string | null = null;
          if (w.image) {
            try {
              base64 = await this.blobToBase64(w.image);
            } catch {
              // Encode fail
            }
          }
          savedWatermarks.push({
            id: w.id,
            type: 'image',
            imageBase64: base64,
            imageName: w.imageName,
            size: w.size,
            opacity: w.opacity,
            position: w.position,
          });
        }
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
      watermarks: savedWatermarks,
      preserveExif: this.preserveExif(),
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
    this.preserveExif.set(data.preserveExif);

    this.clearAllWatermarkPreviewUrls();

    const items: WatermarkItem[] = [];
    const source = data.watermarks ?? [];
    for (const w of source) {
      if (items.length >= MAX_WATERMARKS) break;
      if (w.type === 'text') {
        items.push({
          id: w.id || crypto.randomUUID(),
          type: 'text',
          text: w.text,
          fontSize: w.fontSize,
          color: w.color,
          opacity: w.opacity,
          position: w.position,
        });
      } else {
        let blob: Blob | null = null;
        let previewUrl: string | null = null;
        if (w.imageBase64) {
          try {
            blob = this.base64ToBlob(w.imageBase64);
            previewUrl = URL.createObjectURL(blob);
          } catch {
            // ignore
          }
        }
        items.push({
          id: w.id || crypto.randomUUID(),
          type: 'image',
          image: blob,
          imageName: w.imageName || null,
          previewUrl,
          size: w.size,
          opacity: w.opacity,
          position: w.position,
        });
      }
    }

    this.watermarks.set(items);
  }

  private buildWatermarkConfigList(): WatermarkConfig[] | undefined {
    if (!this.includeWatermark()) return undefined;

    const list: WatermarkConfig[] = [];
    for (const w of this.watermarks()) {
      if (w.type === 'text') {
        if (w.text.trim()) {
          list.push({
            type: 'text',
            text: w.text,
            fontSize: w.fontSize,
            color: w.color,
            opacity: w.opacity,
            position: w.position,
          });
        }
      } else {
        if (w.image) {
          list.push({
            type: 'image',
            image: w.image,
            size: w.size,
            opacity: w.opacity,
            position: w.position,
          });
        }
      }
    }
    return list.length > 0 ? list : undefined;
  }

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
    const includeWatermark = this.pickBoolean(
      raw['includeWatermark'],
      DEFAULT_SETTINGS.includeWatermark,
    );

    if (!selectedPreset || !selectedFormat || !selectedResizeMode) return null;

    const watermarks: SavedWatermarkData[] = [];
    if (Array.isArray(raw['watermarks'])) {
      for (const item of raw['watermarks']) {
        if (watermarks.length >= MAX_WATERMARKS) break;
        const validatedWm = this.sanitizeSavedWatermark(item);
        if (validatedWm) watermarks.push(validatedWm);
      }
    } else {
      // Backward compatibility
      const watermarkType = this.pickEnum(raw['watermarkType'], VALID_WATERMARK_TYPES) || 'text';
      const watermarkPosition =
        this.pickEnum(raw['watermarkPosition'], VALID_WATERMARK_POSITIONS) || 'bottom-right';
      const watermarkOpacity = this.clampNumber(
        raw['watermarkOpacity'],
        INPUT_RANGES.watermarkOpacity.min,
        INPUT_RANGES.watermarkOpacity.max,
        DEFAULT_WATERMARK.opacity,
      );

      if (watermarkType === 'text') {
        watermarks.push({
          id: crypto.randomUUID(),
          type: 'text',
          text: this.pickString(raw['watermarkText'], DEFAULT_WATERMARK.text),
          fontSize: this.clampNumber(
            raw['watermarkFontSize'],
            INPUT_RANGES.watermarkFontSize.min,
            INPUT_RANGES.watermarkFontSize.max,
            DEFAULT_WATERMARK.fontSizePercent,
          ),
          color: this.pickString(raw['watermarkColor'], DEFAULT_WATERMARK.color),
          opacity: watermarkOpacity,
          position: watermarkPosition,
        });
      } else {
        const wmBase64 = raw['watermarkImageBase64'];
        const watermarkImageBase64 =
          typeof wmBase64 === 'string' && wmBase64.startsWith('data:') ? wmBase64 : null;
        watermarks.push({
          id: crypto.randomUUID(),
          type: 'image',
          imageBase64: watermarkImageBase64,
          imageName:
            typeof raw['watermarkImageName'] === 'string' ? raw['watermarkImageName'] : null,
          size: this.clampNumber(
            raw['watermarkImageSize'],
            INPUT_RANGES.watermarkImageSize.min,
            INPUT_RANGES.watermarkImageSize.max,
            DEFAULT_WATERMARK.imageSizePercent,
          ),
          opacity: watermarkOpacity,
          position: watermarkPosition,
        });
      }
    }

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
      includeWatermark,
      watermarks,
      preserveExif: this.pickBoolean(raw['preserveExif'], DEFAULT_SETTINGS.preserveExif),
    };
  }

  private sanitizeSavedWatermark(item: unknown): SavedWatermarkData | null {
    if (!item || typeof item !== 'object') return null;
    const rec = item as Record<string, unknown>;

    const type = this.pickEnum(rec['type'], VALID_WATERMARK_TYPES);
    const position = this.pickEnum(rec['position'], VALID_WATERMARK_POSITIONS);
    if (!type || !position) return null;

    const id = typeof rec['id'] === 'string' ? rec['id'] : crypto.randomUUID();
    const opacity = this.clampNumber(
      rec['opacity'],
      INPUT_RANGES.watermarkOpacity.min,
      INPUT_RANGES.watermarkOpacity.max,
      DEFAULT_WATERMARK.opacity,
    );

    if (type === 'text') {
      return {
        id,
        type: 'text',
        text: this.pickString(rec['text'], DEFAULT_WATERMARK.text),
        fontSize: this.clampNumber(
          rec['fontSize'],
          INPUT_RANGES.watermarkFontSize.min,
          INPUT_RANGES.watermarkFontSize.max,
          DEFAULT_WATERMARK.fontSizePercent,
        ),
        color: this.pickString(rec['color'], DEFAULT_WATERMARK.color),
        opacity,
        position,
      };
    } else {
      const imgBase64 = rec['imageBase64'];
      const imageBase64 =
        typeof imgBase64 === 'string' && imgBase64.startsWith('data:') ? imgBase64 : null;
      return {
        id,
        type: 'image',
        imageBase64,
        imageName: typeof rec['imageName'] === 'string' ? rec['imageName'] : null,
        size: this.clampNumber(
          rec['size'],
          INPUT_RANGES.watermarkImageSize.min,
          INPUT_RANGES.watermarkImageSize.max,
          DEFAULT_WATERMARK.imageSizePercent,
        ),
        opacity,
        position,
      };
    }
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
