// Định nghĩa các mức độ nén
export type CompressionPreset = 'light' | 'medium' | 'max';

// Định nghĩa định dạng đầu ra
export type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/avif';

// Định nghĩa chế độ resize
export type ResizeMode = 'auto' | 'width' | 'height' | 'percent';

// Định nghĩa pattern đặt tên file
export interface FileNamePattern {
  prefix?: string;
  suffix?: string;
  includeNumbering: boolean;
  startIndex: number;
}

export interface WatermarkCoordinates {
  x: number; // 0 -> 100
  y: number; // 0 -> 100
}

// Định nghĩa vị trí watermark
export type WatermarkPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center'
  | WatermarkCoordinates;

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
  watermarks?: WatermarkConfig[];
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
  isCropped?: boolean;
}

// Định nghĩa các watermark đã lưu trong preset
export type SavedWatermarkData = SavedTextWatermarkData | SavedImageWatermarkData;

export interface SavedTextWatermarkData {
  id: string;
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: WatermarkPosition;
}

export interface SavedImageWatermarkData {
  id: string;
  type: 'image';
  imageBase64: string | null;
  imageName?: string | null;
  size: number;
  opacity: number;
  position: WatermarkPosition;
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
  // Giữ các trường cũ để tương thích ngược khi load preset cũ
  watermarkType?: WatermarkType;
  watermarkText?: string;
  watermarkPosition?: WatermarkPosition;
  watermarkFontSize?: number;
  watermarkOpacity?: number;
  watermarkColor?: string;
  watermarkImageBase64?: string | null;
  watermarkImageName?: string | null;
  watermarkImageSize?: number;
  // Trường mới cho multi-watermark
  watermarks?: SavedWatermarkData[];
  preserveExif: boolean;
}

// Interface đại diện cho một preset tùy chỉnh của người dùng
export interface UserPreset {
  id: string;
  name: string;
  data: SavedPresetData;
  createdAt: number;
}

// Định nghĩa trạng thái hiển thị của watermark trên UI (chứa file Blob và preview URL)
export type WatermarkItem = TextWatermarkItem | ImageWatermarkItem;

export interface TextWatermarkItem {
  id: string;
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: WatermarkPosition;
}

export interface ImageWatermarkItem {
  id: string;
  type: 'image';
  image: Blob | null;
  imageName: string | null;
  previewUrl: string | null;
  size: number;
  opacity: number;
  position: WatermarkPosition;
}
