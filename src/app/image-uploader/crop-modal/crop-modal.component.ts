import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { isPlatformBrowser } from '@angular/common';
import { ProcessedFile } from '../../image-processing.model';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import type Cropper from 'cropperjs';

/** Aspect ratio modes — string sentinel thay cho NaN số khó đọc. */
export type AspectMode = 'free' | '1:1' | '4:3' | '16:9';

const ASPECT_RATIOS: Record<AspectMode, number> = {
  free: Number.NaN,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

@Component({
  selector: 'app-crop-modal',
  standalone: true,
  imports: [],
  templateUrl: './crop-modal.component.html',
  styleUrl: './crop-modal.component.scss',
  // Default Emulated encapsulation: styles của component KHÔNG leak global.
  // cropperjs/dist/cropper.css đã được @use trong src/styles.scss để áp
  // cho DOM dynamic mà Cropper tạo.
})
export class CropModalComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dialogRef = inject(DialogRef<void>);
  readonly data = inject<{ file: ProcessedFile }>(DIALOG_DATA);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;

  imageUrl = '';
  private shouldRevoke = false;
  private cropper: Cropper | null = null;

  /** Mode hiện tại — driver state cho UI active class + aspect ratio thực. */
  readonly currentMode = signal<AspectMode>('free');

  /** True khi cropper init thành công. Driver cho disable Apply button. */
  readonly cropperReady = signal(false);

  /** Error message i18n-resolved khi init hoặc apply fail. Null = không có lỗi. */
  readonly loadError = signal<string | null>(null);

  readonly canApply = computed(() => this.cropperReady() && !this.loadError());

  /**
   * Public chỉ cho test mock (vi.spyOn override). Production code không gọi
   * trực tiếp — ngAfterViewInit gọi internally.
   * @internal
   */
  async loadCropperModule(): Promise<typeof import('cropperjs')> {
    return import('cropperjs');
  }

  ngOnInit(): void {
    if (this.data.file.result?.decodedOriginalUrl) {
      this.imageUrl = this.data.file.result.decodedOriginalUrl;
      this.shouldRevoke = false;
    } else {
      this.imageUrl = URL.createObjectURL(this.data.file.file);
      this.shouldRevoke = true;
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const CropperModule = await this.loadCropperModule();
      const CropperCtor = CropperModule.default;

      this.cropper = new CropperCtor(this.imageElement.nativeElement, {
        aspectRatio: ASPECT_RATIOS.free,
        viewMode: 1,
        background: false,
        responsive: true,
        autoCropArea: 0.8,
        checkOrientation: false,
      });
      this.cropperReady.set(true);
    } catch {
      this.loadError.set(this.t()['crop_load_error']);
    }
  }

  setMode(mode: AspectMode): void {
    if (!this.cropper) return;
    this.currentMode.set(mode);
    this.cropper.setAspectRatio(ASPECT_RATIOS[mode]);
  }

  rotate(degree: number): void {
    if (!this.cropper) return;
    this.cropper.rotate(degree);
  }

  flip(axis: 'x' | 'y'): void {
    if (!this.cropper) return;
    const data = this.cropper.getData();
    // Toggle sign — nếu 0 fallback -1. cropperjs scaleX(1|-1) là toggle phổ biến.
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

    if (!canvas) {
      this.loadError.set(this.t()['crop_apply_error']);
      return;
    }

    const mimeType = this.data.file.file.type || 'image/jpeg';
    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          this.loadError.set(this.t()['crop_apply_error']);
          return;
        }
        const croppedFile = new File([blob], this.data.file.file.name, {
          type: mimeType,
          lastModified: Date.now(),
        });
        this.state.updateFile(this.data.file.id, croppedFile);
        this.close();
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
    if (this.imageUrl && this.shouldRevoke) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }
}
