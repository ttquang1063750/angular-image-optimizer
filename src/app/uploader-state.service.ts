import { Injectable, computed, inject, signal } from '@angular/core';
import { ImageCompressionService } from './image-compression.service';
import { CompressionOptions, FileStatusUpdate, ProcessedFile } from './image-processing.model';
import { SettingsStateService } from './settings-state.service';

interface CompressionItem {
  file: File;
  id: string;
  index: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploaderStateService {
  private readonly compressionService = inject(ImageCompressionService);
  private readonly settings = inject(SettingsStateService);

  readonly processedFiles = signal<ProcessedFile[]>([]);
  readonly isCompressing = signal<boolean>(false);
  readonly settingsChanged = signal<boolean>(false);
  readonly comparingFile = signal<ProcessedFile | null>(null);
  readonly comparisonSliderValue = signal<number>(50);

  readonly completedCount = computed(
    () => this.processedFiles().filter((f) => f.status === 'done').length,
  );

  // Cache blob URL theo File để tránh gọi createObjectURL nhiều lần cho cùng một file
  private readonly blobUrlCache = new Map<File, string>();

  addFiles(files: File[]): void {
    if (files.length === 0) return;

    this.isCompressing.set(true);

    const newProcessedFiles: ProcessedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'queued',
      progress: 0,
    }));

    const indexOffset = this.processedFiles().length;
    this.processedFiles.update((current) => [...current, ...newProcessedFiles]);

    const items: CompressionItem[] = newProcessedFiles.map((f, i) => ({
      file: f.file,
      id: f.id,
      index: indexOffset + i,
    }));

    this.runCompressionTask(items, this.settings.currentOptions());
  }

  recompressAll(): void {
    const currentFiles = this.processedFiles();
    if (currentFiles.length === 0) return;

    this.isCompressing.set(true);
    this.settingsChanged.set(false);

    // Revoke URL kết quả nén cũ trước khi tạo kết quả mới
    currentFiles.forEach((f) => this.revokeResultUrl(f));

    this.processedFiles.update((files) =>
      files.map((f) => ({ ...f, status: 'queued', progress: 0, result: undefined })),
    );

    const items: CompressionItem[] = currentFiles.map((f, index) => ({
      file: f.file,
      id: f.id,
      index,
    }));

    this.runCompressionTask(items, this.settings.currentOptions());
  }

  removeFile(id: string): void {
    this.processedFiles.update((files) => {
      const target = files.find((f) => f.id === id);
      if (target) this.revokeResultUrl(target);
      return files.filter((f) => f.id !== id);
    });
  }

  reorderFiles(fromIndex: number, toIndex: number): void {
    const files = this.processedFiles();
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= files.length) return;
    if (toIndex < 0 || toIndex >= files.length) return;

    const next = [...files];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    this.processedFiles.set(next);

    // Thứ tự chỉ ảnh hưởng tên file đầu ra khi numbering bật → mark recompress
    if (this.settings.includeNumbering()) {
      this.markSettingsChanged();
    }
  }

  clearAll(): void {
    this.processedFiles().forEach((f) => this.revokeResultUrl(f));
    this.processedFiles.set([]);
    this.settingsChanged.set(false);
    this.cleanupBlobUrls();
  }

  markSettingsChanged(): void {
    if (this.processedFiles().length > 0) {
      this.settingsChanged.set(true);
    }
  }

  openComparison(file: ProcessedFile): void {
    if (file.status === 'done' && file.result) {
      this.comparingFile.set(file);
      this.comparisonSliderValue.set(50);
    }
  }

  closeComparison(): void {
    this.comparingFile.set(null);
  }

  setComparisonSlider(value: number): void {
    this.comparisonSliderValue.set(value);
  }

  createBlobUrl(file: File): string {
    const cached = this.blobUrlCache.get(file);
    if (cached) return cached;

    const url = URL.createObjectURL(file);
    this.blobUrlCache.set(file, url);
    return url;
  }

  generateZip(): Promise<Blob> {
    return this.compressionService.generateZip(this.processedFiles());
  }

  private runCompressionTask(items: CompressionItem[], options: CompressionOptions): void {
    this.compressionService.compressImagesWithProgress(items, options).subscribe({
      next: (update: FileStatusUpdate) => {
        this.processedFiles.update((currentFiles) =>
          currentFiles.map((pf) => {
            if (update.fileId !== pf.id) return pf;
            return {
              ...pf,
              status: update.status,
              progress: update.progress ?? pf.progress,
              result: update.result ?? pf.result,
              error: update.error ?? pf.error,
            };
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
