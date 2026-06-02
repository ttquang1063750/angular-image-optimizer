import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, catchError, startWith } from 'rxjs/operators';

import {
  CompressionOptions,
  CompressedImageResult,
  FileStatusUpdate,
  CompressionPreset,
  ProcessedFile,
} from './image-processing.model';
import {
  COMPRESSION_PRESETS,
  DEFAULT_CONCURRENCY,
} from './image-processing.constants';
import { ImageCompressorEngine } from './core/image-compressor-engine';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  private readonly engine = new ImageCompressorEngine();

  getOptionsByPreset(preset: CompressionPreset): CompressionOptions {
    return COMPRESSION_PRESETS[preset] ?? COMPRESSION_PRESETS.medium;
  }

  async generateZip(processedFiles: ProcessedFile[]): Promise<Blob> {
    return this.engine.generateZip(processedFiles);
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
      this.engine.runPipeline(file, options, index)
        .then((result) => {
          subscriber.next({ fileId, status: 'done', progress: 100, result });
          subscriber.complete();
        })
        .catch((err: Error) => subscriber.error(err));
    });
  }

  async prepareSource(file: File): Promise<File | Blob> {
    return this.engine.prepareSource(file);
  }

  isHeic(file: File): boolean {
    return this.engine.isHeic(file);
  }
}
