import { Component, inject, signal, WritableSignal, computed } from '@angular/core';
import { ImageCompressionService } from '../image-compression.service';
import { TranslationService, Lang } from '../translation.service';
import { ThemeService } from '../theme.service';
import {
  ProcessedFile,
  FileStatusUpdate,
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  WatermarkPosition,
  CompressionOptions,
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

  readonly t = this.translationService.t;
  readonly currentLang = this.translationService.currentLang;
  readonly currentTheme = this.themeService.currentTheme;

  readonly isCompressing = signal<boolean>(false);
  readonly processedFiles: WritableSignal<ProcessedFile[]> = signal<ProcessedFile[]>([]);
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

  // Watermark
  readonly includeWatermark = signal<boolean>(false);
  readonly watermarkText = signal<string>(DEFAULT_WATERMARK.text);
  readonly watermarkPosition = signal<WatermarkPosition>('bottom-right');
  readonly watermarkFontSize = signal<number>(DEFAULT_WATERMARK.fontSizePercent);
  readonly watermarkOpacity = signal<number>(DEFAULT_WATERMARK.opacity);
  readonly watermarkColor = signal<string>(DEFAULT_WATERMARK.color);

  // So sánh ảnh
  readonly comparingFile = signal<ProcessedFile | null>(null);
  readonly comparisonSliderValue = signal<number>(50);

  // Trạng thái theo dõi thay đổi cấu hình
  readonly settingsChanged = signal<boolean>(false);

  // Tính toán số lượng file đã hoàn thành
  readonly completedCount = computed(
    () => this.processedFiles().filter((f) => f.status === 'done').length,
  );

  // Cache URL để tránh gọi createObjectURL nhiều lần
  private readonly blobUrlCache = new Map<File, string>();

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
    this.markSettingsAsChanged();
  }

  setFormat(format: OutputFormat): void {
    this.selectedFormat.set(format);
    this.markSettingsAsChanged();
  }

  setResizeMode(mode: ResizeMode): void {
    this.selectedResizeMode.set(mode);
    this.markSettingsAsChanged();
  }

  updateResizeValue(event: Event, type: 'width' | 'height' | 'percent'): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (isNaN(value) || value <= 0) return;

    if (type === 'width') this.resizeWidth.set(value);
    if (type === 'height') this.resizeHeight.set(value);
    if (type === 'percent') this.resizePercent.set(value);
    this.markSettingsAsChanged();
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
    this.markSettingsAsChanged();
  }

  toggleNumbering(): void {
    this.includeNumbering.update((v) => !v);
    this.markSettingsAsChanged();
  }

  toggleWatermark(): void {
    this.includeWatermark.update((v) => !v);
    this.markSettingsAsChanged();
  }

  setWatermarkPosition(pos: WatermarkPosition): void {
    this.watermarkPosition.set(pos);
    this.markSettingsAsChanged();
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
    this.markSettingsAsChanged();
  }

  private markSettingsAsChanged(): void {
    if (this.processedFiles().length > 0) {
      this.settingsChanged.set(true);
    }
  }

  private getCompressionOptions() {
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

  recompressAll(): void {
    const currentFiles = this.processedFiles();
    if (currentFiles.length === 0) return;

    this.isCompressing.set(true);
    this.settingsChanged.set(false);

    // Revoke URL của kết quả nén cũ trước khi tạo kết quả mới
    currentFiles.forEach((f) => this.revokeResultUrl(f));

    // Đặt lại trạng thái cho các file hiện có
    this.processedFiles.update((files) =>
      files.map((f) => ({ ...f, status: 'queued', progress: 0, result: undefined })),
    );

    const options = this.getCompressionOptions();

    const compressionItems = currentFiles.map((f, index) => ({
      file: f.file,
      id: f.id,
      index: index,
    }));

    this.runCompressionTask(compressionItems, options);
  }

  private runCompressionTask(
    items: { file: File; id: string; index: number }[],
    options: CompressionOptions,
  ): void {
    this.compressionService.compressImagesWithProgress(items, options).subscribe({
      next: (update: FileStatusUpdate) => {
        this.processedFiles.update((currentFiles) =>
          currentFiles.map((pf) => {
            if (update.fileId === pf.id) {
              return {
                ...pf,
                status: update.status,
                progress: update.progress ?? pf.progress,
                result: update.result ?? pf.result,
                error: update.error ?? pf.error,
              };
            }
            return pf;
          }),
        );
      },
      error: () => {
        this.isCompressing.set(false);
      },
      complete: () => {
        this.isCompressing.set(false);
        this.cleanupBlobUrls();
      },
    });
  }

  private processFiles(files: File[]): void {
    // Chỉ lọc các file ảnh (bao gồm cả HEIC/HEIF)
    const imageFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.name.toLowerCase().endsWith('.heic') ||
        f.name.toLowerCase().endsWith('.heif'),
    );
    if (imageFiles.length === 0) return;

    this.isCompressing.set(true);

    // 1. Khởi tạo trạng thái ban đầu cho các file mới
    const newProcessedFiles: ProcessedFile[] = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      status: 'queued',
      progress: 0,
    }));

    // Thêm vào danh sách hiện có
    this.processedFiles.update((current) => [...current, ...newProcessedFiles]);

    const options = this.getCompressionOptions();

    // Lấy index dựa trên toàn bộ danh sách để đánh số đúng
    const currentTotal = this.processedFiles().length - newProcessedFiles.length;

    const compressionItems = newProcessedFiles.map((f, index) => ({
      file: f.file,
      id: f.id,
      index: currentTotal + index,
    }));

    // 2. Gọi logic nén chung
    this.runCompressionTask(compressionItems, options);
  }

  openComparison(item: ProcessedFile): void {
    if (item.status === 'done' && item.result) {
      this.comparingFile.set(item);
      this.comparisonSliderValue.set(50);
    }
  }

  closeComparison(): void {
    this.comparingFile.set(null);
  }

  updateComparisonSlider(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.comparisonSliderValue.set(input.valueAsNumber);
  }

  async downloadAll(): Promise<void> {
    const doneFiles = this.processedFiles().filter((f) => f.status === 'done');
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1 && doneFiles[0].result) {
      // Nếu chỉ có 1 file, tải trực tiếp
      this.downloadSingle(doneFiles[0]);
    } else {
      // Nếu nhiều file, nén Zip
      const zipBlob = await this.compressionService.generateZip(this.processedFiles());
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

  private downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1000; // Sử dụng hệ thập phân (SI units) phổ biến trên Web và macOS/Linux
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${new Intl.NumberFormat('en-US').format(value)} ${sizes[i]}`;
  }

  formatExactBytes(bytes: number): string {
    return new Intl.NumberFormat('en-US').format(bytes) + ' bytes';
  }

  createBlobUrl(file: File): string {
    const cachedUrl = this.blobUrlCache.get(file);
    if (cachedUrl) return cachedUrl;

    const newUrl = URL.createObjectURL(file);
    this.blobUrlCache.set(file, newUrl);
    return newUrl;
  }

  removeFile(id: string): void {
    this.processedFiles.update((files) => {
      const target = files.find((f) => f.id === id);
      if (target) this.revokeResultUrl(target);
      return files.filter((f) => f.id !== id);
    });
  }

  clearAll(): void {
    this.processedFiles().forEach((f) => this.revokeResultUrl(f));
    this.processedFiles.set([]);
    this.settingsChanged.set(false);
    this.cleanupBlobUrls();
  }

  private revokeResultUrl(file: ProcessedFile): void {
    if (file.result?.compressedUrl) {
      URL.revokeObjectURL(file.result.compressedUrl);
    }
  }

  private cleanupBlobUrls(): void {
    this.blobUrlCache.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrlCache.clear();
  }
}
