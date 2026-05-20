import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, catchError, startWith } from 'rxjs/operators';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

import {
  CompressionOptions,
  CompressedImageResult,
  FileStatusUpdate,
  CompressionPreset,
  ProcessedFile,
} from './image-processing.model';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  /**
   * Chuyển đổi Preset thành CompressionOptions cụ thể.
   */
  getOptionsByPreset(preset: CompressionPreset): CompressionOptions {
    switch (preset) {
      case 'light':
        return { maxSizeMB: 2, maxWidthOrHeight: 2560 };
      case 'medium':
        return { maxSizeMB: 1, maxWidthOrHeight: 1920 };
      case 'max':
        return { maxSizeMB: 0.5, maxWidthOrHeight: 1280 };
      default:
        return { maxSizeMB: 1, maxWidthOrHeight: 1920 };
    }
  }

  /**
   * Tạo file Zip từ danh sách các file đã nén thành công.
   * Đảm bảo không có file nào bị ghi đè nếu trùng tên.
   */
  async generateZip(processedFiles: ProcessedFile[]): Promise<Blob> {
    const zip = new JSZip();
    const usedNames = new Set<string>();

    processedFiles.forEach((pf) => {
      if (pf.status === 'done' && pf.result) {
        const originalName = pf.result.compressedFile.name;
        let finalName = originalName;
        let counter = 1;

        // Xử lý trùng tên trong file Zip
        while (usedNames.has(finalName)) {
          const lastDotIndex = originalName.lastIndexOf('.');
          if (lastDotIndex === -1) {
            finalName = `${originalName}_${counter}`;
          } else {
            const namePart = originalName.substring(0, lastDotIndex);
            const extPart = originalName.substring(lastDotIndex);
            finalName = `${namePart}_${counter}${extPart}`;
          }
          counter++;
        }

        usedNames.add(finalName);
        zip.file(finalName, pf.result.compressedFile);
      }
    });

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Nén một danh sách các file ảnh với khả năng kiểm soát đồng thời và cập nhật tiến trình.
...
   * @param items Danh sách các đối tượng chứa file và ID duy nhất.
   * @param options Cấu hình nén.
   * @param concurrency Số lượng file nén đồng thời (mặc định là 3).
   * @returns Một Observable phát ra các cập nhật trạng thái (FileStatusUpdate) cho từng file.
   */
  compressImagesWithProgress(
    items: { file: File; id: string }[],
    options: CompressionOptions,
    concurrency = 3,
  ): Observable<FileStatusUpdate> {
    // Chuyển mảng file thành một stream, mỗi file là một emission
    return from(items).pipe(
      mergeMap((item) => {
        const fileId = item.id;

        // Gọi hàm nén và trả về một Observable cho mỗi file
        return this.compressSingleImage(item.file, fileId, options).pipe(
          catchError((error) => {
            return of({
              fileId,
              status: 'error' as const,
              error: error.message || 'Unknown error',
            });
          }),
          startWith({
            fileId,
            status: 'compressing' as const,
            progress: 0,
          }),
        );
      }, concurrency),
    );
  }

  /**
   * Logic nén cho một file duy nhất, trả về một Observable có cập nhật tiến trình.
   * @param file File ảnh cần nén.
   * @param fileId ID duy nhất của file.
   * @param options Cấu hình nén.
   * @returns Một Observable phát ra các cập nhật tiến trình và kết quả cuối cùng.
   */
  private compressSingleImage(
    file: File,
    fileId: string,
    options: CompressionOptions,
  ): Observable<FileStatusUpdate> {
    // Tạo một Observable mới để bao bọc logic nén bất đồng bộ
    return new Observable((subscriber) => {
      imageCompression(file, {
        ...options,
        useWebWorker: true,
        // Callback `onProgress` của thư viện là chìa khóa để cập nhật UI
        onProgress: (progress: number) => {
          subscriber.next({
            fileId,
            status: 'compressing',
            progress: Math.round(progress),
          });
        },
      })
        .then((compressedFile) => {
          const originalSize = file.size;
          const compressedSize = compressedFile.size;
          const savedPercentage = ((originalSize - compressedSize) / originalSize) * 100;

          const result: CompressedImageResult = {
            originalFile: file,
            compressedFile: compressedFile,
            originalSize: originalSize,
            compressedSize: compressedSize,
            savedPercentage: parseFloat(savedPercentage.toFixed(2)),
            originalUrl: URL.createObjectURL(file),
            compressedUrl: URL.createObjectURL(compressedFile),
          };

          // Phát ra kết quả cuối cùng khi hoàn thành
          subscriber.next({
            fileId,
            status: 'done',
            progress: 100,
            result: result,
          });

          // Hoàn thành Observable cho file này
          subscriber.complete();
        })
        .catch((error) => {
          // Gửi lỗi nếu có sự cố
          subscriber.error(error);
        });
    });
  }
}
