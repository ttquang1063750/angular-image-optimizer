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
  FileNamePattern,
  ImageWatermarkConfig,
  ProcessedFile,
  TextWatermarkConfig,
  WatermarkConfig,
} from './image-processing.model';
import {
  COMPRESSION_PRESETS,
  CONVERT_SIZE_THRESHOLD,
  DEFAULT_CONCURRENCY,
  FORCE_REENCODE_QUALITY,
  HEIC_CONVERT_QUALITY,
  WATERMARK_OUTPUT_QUALITY,
} from './image-processing.constants';

interface ResizeDimensions {
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  getOptionsByPreset(preset: CompressionPreset): CompressionOptions {
    return COMPRESSION_PRESETS[preset] ?? COMPRESSION_PRESETS.medium;
  }

  async generateZip(processedFiles: ProcessedFile[]): Promise<Blob> {
    const zip = new JSZip();
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
          catchError((error) =>
            of({
              fileId,
              status: 'error' as const,
              error: error.message || 'Unknown error',
            }),
          ),
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
    const dimensions = await this.resolveResizeDimensions(sourceBlob, options);
    const compressed = await this.runCompressor(sourceBlob, options, dimensions);
    const watermarked = await this.applyWatermarkIfNeeded(compressed, options.watermark);
    const fileName = this.buildFileName(file.name, watermarked.type, options.namePattern, index);
    return this.buildResult(file, watermarked, fileName);
  }

  // --- Pipeline steps ---

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
      const conversion = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: HEIC_CONVERT_QUALITY,
      });
      return Array.isArray(conversion) ? conversion[0] : conversion;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      throw new Error(`Không thể chuyển đổi file HEIC: ${message}`, { cause: err });
    }
  }

  private async resolveResizeDimensions(
    blob: File | Blob,
    options: CompressionOptions,
  ): Promise<ResizeDimensions> {
    switch (options.resizeMode) {
      case 'width':
        return { width: options.resizeWidth };
      case 'height':
        return { height: options.resizeHeight };
      case 'percent': {
        const { width, height } = await this.readImageSize(blob);
        const ratio = (options.resizePercent ?? 100) / 100;
        return {
          width: Math.round(width * ratio),
          height: Math.round(height * ratio),
        };
      }
      default:
        return {};
    }
  }

  private readImageSize(blob: File | Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Không thể đọc kích thước ảnh'));
      };
      img.src = url;
    });
  }

  private runCompressor(
    blob: File | Blob,
    options: CompressionOptions,
    dimensions: ResizeDimensions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      new Compressor(blob, {
        quality: options.quality,
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: options.resizeMode === 'auto' ? options.maxWidthOrHeight : undefined,
        maxHeight: options.resizeMode === 'auto' ? options.maxWidthOrHeight : undefined,
        strict: false,
        mimeType: options.format ?? 'image/jpeg',
        convertSize:
          options.quality < FORCE_REENCODE_QUALITY || options.format === 'image/webp'
            ? 0
            : CONVERT_SIZE_THRESHOLD,
        success: (result: Blob) => resolve(result),
        error: (err) => reject(err),
      });
    });
  }

  private async applyWatermarkIfNeeded(
    blob: Blob,
    watermark: WatermarkConfig | undefined,
  ): Promise<Blob> {
    if (!watermark) return blob;
    if (watermark.type === 'text' && !watermark.text) return blob;
    if (watermark.type === 'image' && !watermark.image) return blob;
    try {
      return await this.applyWatermark(blob, watermark);
    } catch {
      // Vẫn tiếp tục với ảnh đã nén nếu lỗi đóng dấu
      return blob;
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
    const targetExt = blobType === 'image/webp' ? '.webp' : '.jpg';
    const lower = fileName.toLowerCase();
    const isJpeg = blobType === 'image/jpeg';

    const hasCorrectExt = isJpeg
      ? lower.endsWith('.jpg') || lower.endsWith('.jpeg')
      : lower.endsWith('.webp');

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
  ): CompressedImageResult {
    const compressedFile = new File([finalBlob], fileName, {
      type: finalBlob.type,
      lastModified: Date.now(),
    });
    const originalSize = originalFile.size;
    const compressedSize = compressedFile.size;
    const savedPercentage = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalFile,
      compressedFile,
      originalSize,
      compressedSize,
      savedPercentage: parseFloat(savedPercentage.toFixed(2)),
      compressedUrl: URL.createObjectURL(compressedFile),
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

  private async applyWatermark(blob: Blob, config: WatermarkConfig): Promise<Blob> {
    const baseImg = await this.loadImage(blob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Không thể khởi tạo Canvas Context');

    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    ctx.drawImage(baseImg, 0, 0);
    ctx.globalAlpha = config.opacity;

    if (config.type === 'text') {
      this.drawTextWatermark(ctx, canvas.width, canvas.height, config);
    } else {
      const logo = await this.loadImage(config.image);
      this.drawImageWatermark(ctx, canvas.width, canvas.height, logo, config);
    }

    return this.canvasToBlob(canvas, blob.type);
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
        reject(new Error('Không thể tải ảnh'));
      };
      img.src = url;
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Lỗi khi xuất Canvas sang Blob'));
        },
        mimeType,
        WATERMARK_OUTPUT_QUALITY,
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

    // Chuyển anchor sang góc trên-trái cho drawImage
    let drawX = x;
    let drawY = y - targetHeight / 2;
    if (align === 'right') drawX = x - targetWidth;
    else if (align === 'center') drawX = x - targetWidth / 2;

    if (config.position.startsWith('top-')) drawY = padding;
    else if (config.position.startsWith('bottom-')) drawY = canvasHeight - targetHeight - padding;

    ctx.drawImage(logo, drawX, drawY, targetWidth, targetHeight);
  }

  private computeAnchor(
    position: WatermarkConfig['position'],
    canvasWidth: number,
    canvasHeight: number,
    padding: number,
  ): { x: number; y: number; align: CanvasTextAlign } {
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
}
