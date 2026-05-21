import { CompressionOptions, CompressionPreset } from './image-processing.model';

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
