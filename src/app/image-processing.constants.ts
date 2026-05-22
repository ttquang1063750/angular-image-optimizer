import {
  CompressionOptions,
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  SavedPresetData,
  WatermarkPosition,
  WatermarkType,
} from './image-processing.model';

// Số lượng ảnh xử lý đồng thời tối đa
export const DEFAULT_CONCURRENCY = 3;

// Ngưỡng dung lượng để Compressor.js tự động convert sang định dạng đích (bytes)
export const CONVERT_SIZE_THRESHOLD = 5_000_000;

// Quality áp dụng khi convert HEIC sang JPEG (trước bước nén chính)
export const HEIC_CONVERT_QUALITY = 0.9;

// Quality khi xuất Canvas sau bước đóng watermark
export const WATERMARK_OUTPUT_QUALITY = 0.95;

// Cấu hình tương ứng với từng preset nén
export const COMPRESSION_PRESETS: Record<CompressionPreset, CompressionOptions> = {
  light: { quality: 0.9, maxWidthOrHeight: 3840, resizeMode: 'auto' },
  medium: { quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' },
  max: { quality: 0.2, maxWidthOrHeight: 1024, resizeMode: 'auto' },
};

// Giá trị mặc định cho resize
export const DEFAULT_RESIZE = {
  width: 1200,
  height: 1200,
  percent: 50,
};

// Giá trị mặc định cho watermark
export const DEFAULT_WATERMARK = {
  text: 'Image Optimizer',
  fontSizePercent: 3,
  imageSizePercent: 15,
  opacity: 0.5,
  color: '#ffffff',
};

// Ngưỡng quality dưới mức này thì luôn re-encode (không skip để giữ file gốc)
export const FORCE_REENCODE_QUALITY = 0.8;

// Khoảng giá trị hợp lệ cho từng ô nhập số. Dùng để vừa render `min`/`max`
// trên input vừa kiểm tra trong handler.
export interface NumberRange {
  min: number;
  max: number;
  step?: number;
}

export const INPUT_RANGES = {
  resizePx: { min: 1, max: 10000 } satisfies NumberRange,
  resizePercent: { min: 1, max: 100 } satisfies NumberRange,
  startNumberingIndex: { min: 0, max: 9999 } satisfies NumberRange,
  watermarkFontSize: { min: 1, max: 20 } satisfies NumberRange,
  watermarkOpacity: { min: 0.1, max: 1, step: 0.1 } satisfies NumberRange,
  watermarkImageSize: { min: 1, max: 50 } satisfies NumberRange,
} as const;

// Cấu hình mặc định cho mọi settings — dùng cho cả signal initializer
// và resetToDefaults() để giữ "one source of truth".
export const DEFAULT_SETTINGS: SavedPresetData = {
  selectedPreset: 'medium',
  selectedFormat: 'image/jpeg',
  selectedResizeMode: 'auto',
  resizeWidth: DEFAULT_RESIZE.width,
  resizeHeight: DEFAULT_RESIZE.height,
  resizePercent: DEFAULT_RESIZE.percent,
  namePrefix: '',
  nameSuffix: '',
  includeNumbering: false,
  startNumberingIndex: 1,
  includeWatermark: false,
  watermarks: [
    {
      id: 'default-text-wm',
      type: 'text',
      text: DEFAULT_WATERMARK.text,
      fontSize: DEFAULT_WATERMARK.fontSizePercent,
      color: DEFAULT_WATERMARK.color,
      opacity: DEFAULT_WATERMARK.opacity,
      position: 'bottom-right',
    },
  ],
  preserveExif: false,
};

// Giới hạn số lượng watermark tối đa
export const MAX_WATERMARKS = 5;

// Padding mặc định cho image watermark khi ở preset position (% so với size
// của watermark). 0.05 → padding = 5% size để watermark cách edge tương xứng.
export const WATERMARK_IMAGE_PRESET_PADDING_RATIO = 0.05;

// Số chữ số thập phân cho coordinate khi drag watermark (0-100 percentage).
// 1 decimal đủ chính xác cho UI + tránh float drift sau nhiều thao tác.
export const WATERMARK_DRAG_COORD_DECIMALS = 1;

// Preset feature: storage key, export filename, default id sentinel
export const PRESET_STORAGE_KEY = 'angular_image_optimizer_presets';
export const PRESET_EXPORT_FILENAME = 'angular_image_optimizer_presets.json';
export const DEFAULT_PRESET_ID = 'default';

// Thời gian hiển thị toast success (ms)
export const TOAST_TIMEOUT_MS = 3000;

// Giới hạn dung lượng file import (10 MB)
export const PRESET_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

// Whitelist các giá trị enum cho validation khi import preset
export const VALID_COMPRESSION_PRESETS: readonly CompressionPreset[] = ['light', 'medium', 'max'];
export const VALID_OUTPUT_FORMATS: readonly OutputFormat[] = [
  'image/jpeg',
  'image/webp',
  'image/avif',
];
export const VALID_RESIZE_MODES: readonly ResizeMode[] = ['auto', 'width', 'height', 'percent'];
export const VALID_WATERMARK_TYPES: readonly WatermarkType[] = ['text', 'image'];
export const VALID_WATERMARK_POSITIONS: readonly WatermarkPosition[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
  'center',
];

// Các cấu hình cho kính lúp phóng to của Modal so sánh
export const COMPARISON_ZOOM_FACTOR = 2.5;
export const COMPARISON_LENS_SIZE_PX = 160;

