import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ProcessedFile } from '../../image-processing.model';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import type Cropper from 'cropperjs';

@Component({
  selector: 'app-crop-modal',
  standalone: true,
  imports: [],
  templateUrl: './crop-modal.component.html',
  styleUrl: './crop-modal.component.scss',
})
export class CropDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dialogRef = inject(DialogRef<void>);
  readonly data = inject<{ file: ProcessedFile }>(DIALOG_DATA);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;

  imageUrl = '';
  private cropper: Cropper | null = null;
  readonly NaN = Number.NaN;
  currentAspectRatio = Number.NaN;

  isNaN(val: number): boolean {
    return Number.isNaN(val);
  }

  ngOnInit(): void {
    this.imageUrl = URL.createObjectURL(this.data.file.file);
  }

  async loadCropperModule(): Promise<typeof import('cropperjs')> {
    return import('cropperjs');
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const CropperModule = await this.loadCropperModule();
        const CropperCtor = CropperModule.default;

        this.cropper = new CropperCtor(this.imageElement.nativeElement, {
          aspectRatio: NaN,
          viewMode: 1,
          background: false,
          responsive: true,
          autoCropArea: 0.8,
          checkOrientation: false,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error in ngAfterViewInit cropper initialization:', err);
      }
    }
  }

  setAspectRatio(ratio: number): void {
    if (!this.cropper) return;
    this.currentAspectRatio = ratio;
    this.cropper.setAspectRatio(ratio);
  }

  rotate(degree: number): void {
    if (!this.cropper) return;
    this.cropper.rotate(degree);
  }

  flip(axis: 'x' | 'y'): void {
    if (!this.cropper) return;
    const data = this.cropper.getData();
    if (axis === 'x') {
      this.cropper.scaleX(-data.scaleX || -1);
    } else {
      this.cropper.scaleY(-data.scaleY || -1);
    }
  }

  apply(): void {
    if (!this.cropper) return;
    const canvas = this.cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!canvas) return;

    const mimeType = this.data.file.file.type || 'image/jpeg';
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) {
          const croppedFile = new File([blob], this.data.file.file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });
          this.state.updateFile(this.data.file.id, croppedFile);
          this.close();
        }
      },
      mimeType,
      0.95,
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.cropper) {
      this.cropper.destroy();
    }
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }
}
