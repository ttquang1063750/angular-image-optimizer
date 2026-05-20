import { Component, inject, signal, WritableSignal, computed } from '@angular/core';
import { ImageCompressionService } from '../image-compression.service';
import {
  ProcessedFile,
  FileStatusUpdate,
  CompressionPreset,
  OutputFormat,
} from '../image-processing.model';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
})
export class ImageUploaderComponent {
  private readonly compressionService = inject(ImageCompressionService);

  readonly isCompressing = signal<boolean>(false);
  readonly processedFiles: WritableSignal<ProcessedFile[]> = signal<ProcessedFile[]>([]);
  readonly selectedPreset = signal<CompressionPreset>('medium');
  readonly selectedFormat = signal<OutputFormat>('image/jpeg');
  readonly isDragging = signal<boolean>(false);

  // Tính toán số lượng file đã hoàn thành
  readonly completedCount = computed(
    () => this.processedFiles().filter((f) => f.status === 'done').length,
  );

  // Cache URL để tránh gọi createObjectURL nhiều lần
  private readonly blobUrlCache = new Map<File, string>();

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
  }

  setFormat(format: OutputFormat): void {
    this.selectedFormat.set(format);
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

    // 1. Khởi tạo trạng thái ban đầu cho tất cả các file trên UI
    const initialFiles: ProcessedFile[] = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file: file,
      status: 'queued',
      progress: 0,
    }));

    // Thêm vào danh sách hiện có thay vì thay thế hoàn toàn
    this.processedFiles.update((current) => [...current, ...initialFiles]);

    const options = this.compressionService.getOptionsByPreset(this.selectedPreset());
    options.format = this.selectedFormat();

    // Chuẩn bị dữ liệu để truyền vào service (bao gồm cả File và ID duy nhất)
    const compressionItems = initialFiles.map((f) => ({ file: f.file, id: f.id }));

    // 2. Gọi service và bắt đầu lắng nghe các cập nhật
    this.compressionService.compressImagesWithProgress(compressionItems, options, 3).subscribe({
      next: (update: FileStatusUpdate) => {
        // 3. Cập nhật trạng thái của từng file trong signal dựa trên ID duy nhất
        this.processedFiles.update((currentFiles) =>
          currentFiles.map((pf) => {
            if (update.fileId === pf.id && pf.status !== 'done') {
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
    this.processedFiles.update((files) => files.filter((f) => f.id !== id));
  }

  clearAll(): void {
    this.processedFiles.set([]);
    this.cleanupBlobUrls();
  }

  private cleanupBlobUrls(): void {
    this.blobUrlCache.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrlCache.clear();
  }
}
