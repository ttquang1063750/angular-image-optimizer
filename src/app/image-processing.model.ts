// Định nghĩa các mức độ nén
export type CompressionPreset = 'light' | 'medium' | 'max';

// Định nghĩa định dạng đầu ra
export type OutputFormat = 'image/jpeg' | 'image/webp';

// Định nghĩa chế độ resize
export type ResizeMode = 'auto' | 'width' | 'height' | 'percent';

// Định nghĩa pattern đặt tên file
export interface FileNamePattern {
  prefix?: string;
  suffix?: string;
  includeNumbering: boolean;
  startIndex: number;
}

// Định nghĩa vị trí watermark
export type WatermarkPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';

export type WatermarkType = 'text' | 'image';

// Discriminated union để TypeScript narrow type tự động dựa trên `type`.
// Watermark có 2 chế độ: text (chèn chữ) hoặc image (chèn logo).
export type WatermarkConfig = TextWatermarkConfig | ImageWatermarkConfig;

export interface TextWatermarkConfig {
  type: 'text';
  text: string;
  fontSize: number; // % so với chiều rộng base image
  color: string;
  opacity: number; // 0..1
  position: WatermarkPosition;
}

export interface ImageWatermarkConfig {
  type: 'image';
  image: Blob;
  size: number; // % so với chiều rộng base image
  opacity: number; // 0..1
  position: WatermarkPosition;
}

// Định nghĩa các tùy chọn sẽ truyền vào service
export interface CompressionOptions {
  quality: number; // Tỷ lệ chất lượng từ 0 đến 1
  maxWidthOrHeight: number; // Giới hạn tối đa trong chế độ auto
  format?: OutputFormat; // Định dạng đầu ra mong muốn (tùy chọn)
  resizeMode: ResizeMode;
  resizeWidth?: number;
  resizeHeight?: number;
  resizePercent?: number;
  namePattern?: FileNamePattern;
  watermark?: WatermarkConfig;
  // Giữ EXIF của ảnh gốc khi cả input và output đều là JPEG
  preserveExif?: boolean;
}

// Định nghĩa cấu trúc dữ liệu trả về cho mỗi file sau khi nén
export interface CompressedImageResult {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
  compressedUrl: string;
}

// Định nghĩa các trạng thái cập nhật cho một file
export type FileProcessingStatus = 'queued' | 'compressing' | 'done' | 'error';

// Interface cho đối tượng cập nhật mà Observable sẽ phát ra
export interface FileStatusUpdate {
  fileId: string; // Một ID duy nhất để xác định file
  status: FileProcessingStatus;
  progress?: number; // % tiến trình
  result?: CompressedImageResult; // Kết quả cuối cùng
  error?: string; // Thông báo lỗi
}

// Interface để quản lý trạng thái của từng file trên giao diện (UI)
export interface ProcessedFile {
  id: string;
  file: File;
  status: FileProcessingStatus;
  progress: number;
  result?: CompressedImageResult;
  error?: string;
}

// Interface đại diện cho dữ liệu cấu hình đã lưu
export interface SavedPresetData {
  selectedPreset: CompressionPreset;
  selectedFormat: OutputFormat;
  selectedResizeMode: ResizeMode;
  resizeWidth: number;
  resizeHeight: number;
  resizePercent: number;
  namePrefix: string;
  nameSuffix: string;
  includeNumbering: boolean;
  startNumberingIndex: number;
  includeWatermark: boolean;
  watermarkType: WatermarkType;
  watermarkText: string;
  watermarkPosition: WatermarkPosition;
  watermarkFontSize: number;
  watermarkOpacity: number;
  watermarkColor: string;
  watermarkImageBase64?: string | null;
  watermarkImageName?: string | null;
  watermarkImageSize: number;
  preserveExif: boolean;
}

// Interface đại diện cho một preset tùy chỉnh của người dùng
export interface UserPreset {
  id: string;
  name: string;
  data: SavedPresetData;
  createdAt: number;
}
