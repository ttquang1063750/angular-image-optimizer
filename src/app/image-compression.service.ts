import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, catchError, startWith } from 'rxjs/operators';
import type JSZip from 'jszip';
import type { heicTo } from 'heic-to';

import {
  CompressionOptions,
  CompressedImageResult,
  FileStatusUpdate,
  CompressionPreset,
  FileNamePattern,
  ImageWatermarkConfig,
  ProcessedFile,
  TextWatermarkConfig,
  WatermarkConfig,
} from './image-processing.model';
import {
  COMPRESSION_PRESETS,
  DEFAULT_CONCURRENCY,
  FORCE_REENCODE_QUALITY,
  HEIC_CONVERT_QUALITY,
} from './image-processing.constants';
import { preserveJpegExif } from './utils/exif';

interface ResizeDimensions {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  private jsZipCtor: typeof JSZip | null = null;
  private heicToFn: typeof heicTo | null = null;

  private async getJSZip(): Promise<typeof JSZip> {
    if (!this.jsZipCtor) {
      this.jsZipCtor = (await import('jszip')).default;
    }
    return this.jsZipCtor;
  }

  private async getHeicTo(): Promise<typeof heicTo> {
    if (!this.heicToFn) {
      this.heicToFn = (await import('heic-to')).heicTo;
    }
    return this.heicToFn;
  }

  getOptionsByPreset(preset: CompressionPreset): CompressionOptions {
    return COMPRESSION_PRESETS[preset] ?? COMPRESSION_PRESETS.medium;
  }

  async generateZip(processedFiles: ProcessedFile[]): Promise<Blob> {
    const JSZipCtor = await this.getJSZip();
    const zip = new JSZipCtor();
    const usedNames = new Set<string>();

    processedFiles.forEach((pf) => {
      if (pf.status === 'done' && pf.result) {
        const finalName = this.deduplicateName(pf.result.compressedFile.name, usedNames);
        usedNames.add(finalName);
        zip.file(finalName, pf.result.compressedFile);
      }
    });

    return await zip.generateAsync({ type: 'blob' });
  }

  compressImagesWithProgress(
    items: { file: File; id: string; index?: number }[],
    options: CompressionOptions,
    concurrency = DEFAULT_CONCURRENCY,
  ): Observable<FileStatusUpdate> {
    return from(items).pipe(
      mergeMap((item) => {
        const fileId = item.id;

        return this.compressSingleImage(item.file, fileId, options, item.index).pipe(
          catchError((error) => {
            console.error('Compression pipeline failed:', error);
            let message = 'Unknown error';
            if (error instanceof Error) {
              message = error.message;
            } else if (typeof error === 'string') {
              message = error;
            } else if (error && typeof error === 'object' && 'message' in error) {
              message = String((error as any).message);
            }

            return of({
              fileId,
              status: 'error' as const,
              error: message,
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

  private compressSingleImage(
    file: File,
    fileId: string,
    options: CompressionOptions,
    index = 0,
  ): Observable<FileStatusUpdate> {
    return new Observable((subscriber) => {
      this.runPipeline(file, options, index)
        .then((result) => {
          subscriber.next({ fileId, status: 'done', progress: 100, result });
          subscriber.complete();
        })
        .catch((err: Error) => subscriber.error(err));
    });
  }

  private async runPipeline(
    file: File,
    options: CompressionOptions,
    index: number,
  ): Promise<CompressedImageResult> {
    const sourceBlob = await this.prepareSource(file);
    const baseImg = await this.loadImage(sourceBlob);
    const dimensions = this.resolveResizeDimensions(baseImg.width, baseImg.height, options);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: options.format !== 'image/jpeg' });
    if (!ctx) throw new Error('Không thể khởi tạo Canvas Context');

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Background trắng cho JPEG
    if (options.format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Step 1: Draw Image (Resize)
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // Step 2: Draw Watermarks
    if (options.watermarks && options.watermarks.length > 0) {
      for (const config of options.watermarks) {
        if (config.type === 'text' && !config.text) continue;
        if (config.type === 'image' && !config.image) continue;

        ctx.save();
        ctx.globalAlpha = config.opacity;
        if (config.type === 'text') {
          this.drawTextWatermark(ctx, canvas.width, canvas.height, config);
        } else {
          try {
            const logo = await this.loadImage(config.image);
            this.drawImageWatermark(ctx, canvas.width, canvas.height, logo, config);
          } catch {
            // ignore logo load failures
          }
        }
        ctx.restore();
      }
    }

    // Step 3: Compression (Single Pass)
    let finalBlob = await this.canvasToBlob(canvas, options.format ?? 'image/jpeg', options.quality);

    // Step 4: Strict Mode Check (Nếu nén nhẹ mà phình to hơn file gốc, và không resize/watermark/format change)
    const isOriginalEligible =
      !options.watermarks?.length &&
      options.resizeMode === 'auto' &&
      dimensions.width === baseImg.width &&
      dimensions.height === baseImg.height &&
      (options.format === undefined || options.format === file.type);

    if (isOriginalEligible && options.quality >= FORCE_REENCODE_QUALITY) {
      if (finalBlob.size > sourceBlob.size) {
        finalBlob = sourceBlob;
      }
    }

    // Step 5: Preserve EXIF (JPEG only)
    const withExif = await this.preserveExifIfEligible(file, finalBlob, options);

    const fileName = this.buildFileName(file.name, withExif.type, options.namePattern, index);
    return this.buildResult(file, withExif, fileName, sourceBlob);
  }

  private async preserveExifIfEligible(
    originalFile: File,
    compressed: Blob,
    options: CompressionOptions,
  ): Promise<Blob> {
    if (!options.preserveExif) return compressed;
    if (originalFile.type !== 'image/jpeg') return compressed;
    if (compressed.type !== 'image/jpeg') return compressed;
    try {
      return await preserveJpegExif(originalFile, compressed);
    } catch {
      return compressed;
    }
  }

  private isHeic(file: File): boolean {
    const name = file.name.toLowerCase();
    return (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      name.endsWith('.heic') ||
      name.endsWith('.heif')
    );
  }

  private async prepareSource(file: File): Promise<File | Blob> {
    if (!this.isHeic(file)) return file;
    try {
      const heicToFn = await this.getHeicTo();
      return await heicToFn({
        blob: file,
        type: 'image/jpeg',
        quality: HEIC_CONVERT_QUALITY,
      });
    } catch (err) {
      // heic2any reject với nhiều shape khác nhau: Error, plain object { code, message },
      // string, hoặc thậm chí DOMException. Cố gắng extract message hữu ích nhất.
      console.error('HEIC convert failed. Raw error:', err);
      throw new Error(`Không thể chuyển đổi file HEIC: ${this.describeError(err)}`, {
        cause: err,
      });
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const o = err as { message?: unknown; code?: unknown };
      if (typeof o.message === 'string' && o.message) return o.message;
      if (typeof o.code !== 'undefined') return `code ${String(o.code)}`;
      try {
        return JSON.stringify(err);
      } catch {
        return Object.prototype.toString.call(err);
      }
    }
    return String(err);
  }

  private resolveResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    options: CompressionOptions,
  ): ResizeDimensions {
    switch (options.resizeMode) {
      case 'width': {
        const width = options.resizeWidth ?? originalWidth;
        const ratio = width / originalWidth;
        return { width, height: Math.round(originalHeight * ratio) };
      }
      case 'height': {
        const height = options.resizeHeight ?? originalHeight;
        const ratio = height / originalHeight;
        return { width: Math.round(originalWidth * ratio), height };
      }
      case 'percent': {
        const ratio = (options.resizePercent ?? 100) / 100;
        return {
          width: Math.round(originalWidth * ratio),
          height: Math.round(originalHeight * ratio),
        };
      }
      case 'auto':
      default: {
        const max = options.maxWidthOrHeight;
        if (originalWidth <= max && originalHeight <= max) {
          return { width: originalWidth, height: originalHeight };
        }
        const ratio = Math.min(max / originalWidth, max / originalHeight);
        return {
          width: Math.round(originalWidth * ratio),
          height: Math.round(originalHeight * ratio),
        };
      }
    }
  }

  private loadImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Không thể đọc kích thước ảnh'));
      };
      img.src = url;
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Lỗi khi xuất Canvas sang Blob'));
        },
        mimeType,
        quality,
      );
    });
  }

  private drawTextWatermark(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    config: TextWatermarkConfig,
  ): void {
    const fontSize = (canvasWidth * config.fontSize) / 100;
    ctx.font = `bold ${fontSize}px Inter, Roboto, sans-serif`;
    ctx.fillStyle = config.color;
    ctx.textBaseline = 'middle';

    const padding = fontSize;
    const { x, y, align } = this.computeAnchor(config.position, canvasWidth, canvasHeight, padding);
    ctx.textAlign = align;
    ctx.fillText(config.text, x, y);
  }

  private drawImageWatermark(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    logo: HTMLImageElement,
    config: ImageWatermarkConfig,
  ): void {
    const targetWidth = (canvasWidth * config.size) / 100;
    const targetHeight = targetWidth * (logo.height / logo.width);
    const padding = targetWidth * 0.05;

    const { x, y, align } = this.computeAnchor(config.position, canvasWidth, canvasHeight, padding);

    let drawX = x;
    let drawY = y - targetHeight / 2;

    if (typeof config.position === 'object' && config.position !== null) {
      drawX = x - targetWidth / 2;
      drawY = y - targetHeight / 2;
    } else {
      if (align === 'right') drawX = x - targetWidth;
      else if (align === 'center') drawX = x - targetWidth / 2;

      const posStr = config.position as string;
      if (posStr.startsWith('top-')) drawY = padding;
      else if (posStr.startsWith('bottom-')) drawY = canvasHeight - targetHeight - padding;
    }

    ctx.drawImage(logo, drawX, drawY, targetWidth, targetHeight);
  }

  private computeAnchor(
    position: WatermarkConfig['position'],
    canvasWidth: number,
    canvasHeight: number,
    padding: number,
  ): { x: number; y: number; align: CanvasTextAlign } {
    if (typeof position === 'object' && position !== null) {
      const xVal = (canvasWidth * position.x) / 100;
      const yVal = (canvasHeight * position.y) / 100;
      return { x: xVal, y: yVal, align: 'center' };
    }

    switch (position) {
      case 'top-left':
        return { x: padding, y: padding, align: 'left' };
      case 'top-right':
        return { x: canvasWidth - padding, y: padding, align: 'right' };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding, align: 'left' };
      case 'bottom-right':
        return { x: canvasWidth - padding, y: canvasHeight - padding, align: 'right' };
      case 'center':
        return { x: canvasWidth / 2, y: canvasHeight / 2, align: 'center' };
    }
  }

  private buildFileName(
    originalName: string,
    blobType: string,
    pattern: FileNamePattern | undefined,
    index: number,
  ): string {
    const baseName = pattern ? this.applyNamePattern(originalName, pattern, index) : originalName;
    return this.ensureCorrectExtension(baseName, blobType, !!pattern);
  }

  private applyNamePattern(originalName: string, pattern: FileNamePattern, index: number): string {
    const nameWithoutExt = this.stripExtension(originalName);
    const core = `${pattern.prefix ?? ''}${nameWithoutExt}${pattern.suffix ?? ''}`;
    return pattern.includeNumbering ? `${core}_${pattern.startIndex + index}` : core;
  }

  private ensureCorrectExtension(
    fileName: string,
    blobType: string,
    nameAlreadyStripped: boolean,
  ): string {
    const targetExt =
      blobType === 'image/webp' ? '.webp' : blobType === 'image/avif' ? '.avif' : '.jpg';
    const lower = fileName.toLowerCase();
    const isJpeg = blobType === 'image/jpeg';
    const isWebp = blobType === 'image/webp';
    const isAvif = blobType === 'image/avif';

    const hasCorrectExt = isJpeg
      ? lower.endsWith('.jpg') || lower.endsWith('.jpeg')
      : isWebp
        ? lower.endsWith('.webp')
        : isAvif
          ? lower.endsWith('.avif')
          : false;

    if (hasCorrectExt) return fileName;

    const base = nameAlreadyStripped ? fileName : this.stripExtension(fileName);
    return `${base}${targetExt}`;
  }

  private stripExtension(name: string): string {
    const lastDot = name.lastIndexOf('.');
    return lastDot === -1 ? name : name.substring(0, lastDot);
  }

  private buildResult(
    originalFile: File,
    finalBlob: Blob,
    fileName: string,
    sourceBlob?: File | Blob,
  ): CompressedImageResult {
    const compressedFile = new File([finalBlob], fileName, {
      type: finalBlob.type,
      lastModified: Date.now(),
    });
    const originalSize = originalFile.size;
    const compressedSize = compressedFile.size;
    const savedPercentage = ((originalSize - compressedSize) / originalSize) * 100;

    let decodedOriginalUrl = '';
    if (sourceBlob && sourceBlob !== originalFile) {
      decodedOriginalUrl = URL.createObjectURL(sourceBlob);
    }

    return {
      originalFile,
      compressedFile,
      originalSize,
      compressedSize,
      savedPercentage: parseFloat(savedPercentage.toFixed(2)),
      compressedUrl: URL.createObjectURL(compressedFile),
      decodedOriginalUrl,
    };
  }

  private deduplicateName(originalName: string, usedNames: Set<string>): string {
    if (!usedNames.has(originalName)) return originalName;

    const lastDot = originalName.lastIndexOf('.');
    const namePart = lastDot === -1 ? originalName : originalName.substring(0, lastDot);
    const extPart = lastDot === -1 ? '' : originalName.substring(lastDot);

    let counter = 1;
    let candidate = `${namePart}_${counter}${extPart}`;
    while (usedNames.has(candidate)) {
      counter++;
      candidate = `${namePart}_${counter}${extPart}`;
    }
    return candidate;
  }
}
