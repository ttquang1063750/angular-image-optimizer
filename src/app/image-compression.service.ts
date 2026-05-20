import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, catchError, startWith } from 'rxjs/operators';
import Compressor from 'compressorjs';
import JSZip from 'jszip';
import heic2any from 'heic2any';

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
        return { quality: 0.9, maxWidthOrHeight: 3840, resizeMode: 'auto' }; // Giữ chất lượng cực cao
      case 'medium':
        return { quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' }; // Cân bằng, giảm độ phân giải xuống 1600px
      case 'max':
        return { quality: 0.2, maxWidthOrHeight: 1024, resizeMode: 'auto' }; // Nén mạnh, 1024px
      default:
        return { quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' };
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
   * Nén một danh sách các file ảnh với khả năng kiểm soát đồng thời.
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
    return from(items).pipe(
      mergeMap((item) => {
        const fileId = item.id;

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
   * Logic nén cho một file duy nhất bằng Compressor.js.
   * @param file File ảnh cần nén.
   * @param fileId ID duy nhất của file.
   * @param options Cấu hình nén.
   * @returns Một Observable phát ra kết quả nén.
   */
  private compressSingleImage(
    file: File,
    fileId: string,
    options: CompressionOptions,
  ): Observable<FileStatusUpdate> {
    return new Observable((subscriber) => {
      // Hàm xử lý nén chính sau khi đã đảm bảo file ở định dạng browser hiểu được
      const runCompression = (
        targetFile: File | Blob,
        originalFileName: string,
        finalWidth?: number,
        finalHeight?: number,
      ) => {
        new Compressor(targetFile, {
          quality: options.quality,
          width: finalWidth,
          height: finalHeight,
          maxWidth: options.resizeMode === 'auto' ? options.maxWidthOrHeight : undefined,
          maxHeight: options.resizeMode === 'auto' ? options.maxWidthOrHeight : undefined,
          // Ép nén ngay cả khi dung lượng mới lớn hơn
          strict: false,
          // Sử dụng định dạng được yêu cầu (mặc định là jpeg)
          mimeType: options.format ?? 'image/jpeg',
          // Tự động chuyển đổi sang định dạng đích nếu cần thiết
          convertSize: options.quality < 0.8 || options.format === 'image/webp' ? 0 : 5000000,
          success: (result: Blob) => {
            let fileName = originalFileName;
            // Đảm bảo extension đúng với định dạng đầu ra
            const targetExt = result.type === 'image/webp' ? '.webp' : '.jpg';
            const isTargetJpeg = result.type === 'image/jpeg';

            const hasCorrectExt = isTargetJpeg
              ? fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')
              : fileName.toLowerCase().endsWith('.webp');

            if (!hasCorrectExt) {
              const lastDotIndex = fileName.lastIndexOf('.');
              const nameWithoutExt =
                lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
              fileName = `${nameWithoutExt}${targetExt}`;
            }

            const compressedFile = new File([result], fileName, {
              type: result.type,
              lastModified: Date.now(),
            });

            const originalSize = file.size; // Luôn so sánh với file gốc ban đầu
            const compressedSize = compressedFile.size;
            const savedPercentage = ((originalSize - compressedSize) / originalSize) * 100;

            const compressionResult: CompressedImageResult = {
              originalFile: file,
              compressedFile: compressedFile,
              originalSize: originalSize,
              compressedSize: compressedSize,
              savedPercentage: parseFloat(savedPercentage.toFixed(2)),
              originalUrl: URL.createObjectURL(file),
              compressedUrl: URL.createObjectURL(compressedFile),
            };

            subscriber.next({
              fileId,
              status: 'done',
              progress: 100,
              result: compressionResult,
            });
            subscriber.complete();
          },
          error: (err) => {
            subscriber.error(err);
          },
        });
      };

      // Xử lý thông số kích thước dựa trên resizeMode
      const prepareAndRun = async (blob: File | Blob) => {
        let targetW: number | undefined;
        let targetH: number | undefined;

        if (options.resizeMode === 'width') {
          targetW = options.resizeWidth;
        } else if (options.resizeMode === 'height') {
          targetH = options.resizeHeight;
        } else if (options.resizeMode === 'percent') {
          // Cần đọc kích thước gốc để tính %
          const img = new Image();
          const url = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = url;
          });
          URL.revokeObjectURL(url);
          const ratio = (options.resizePercent ?? 100) / 100;
          targetW = Math.round(img.width * ratio);
          targetH = Math.round(img.height * ratio);
        }

        runCompression(blob, file.name, targetW, targetH);
      };

      // Kiểm tra nếu là file HEIC/HEIF thì convert sang JPEG trước
      const isHeic =
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      if (isHeic) {
        heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        })
          .then((conversionResult) => {
            const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
            prepareAndRun(blob);
          })
          .catch((err) => {
            subscriber.error(new Error(`Không thể chuyển đổi file HEIC: ${err.message}`));
          });
      } else {
        prepareAndRun(file);
      }
    });
  }
}
