import {
  AfterViewInit,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SettingsStateService } from '../../settings-state.service';
import { UploaderStateService } from '../../uploader-state.service';
import { TranslationService } from '../../translation.service';
import {
  ImageWatermarkItem,
  TextWatermarkItem,
  WatermarkCoordinates,
  WatermarkItem,
  WatermarkPosition,
} from '../../image-processing.model';
import {
  WATERMARK_DRAG_COORD_DECIMALS,
  WATERMARK_IMAGE_PRESET_PADDING_RATIO,
} from '../../image-processing.constants';

export interface WatermarkPreviewDialogData {
  /** Watermark được focus khi mở dialog. */
  initialWatermarkId: string;
}

type PresetPosition = Exclude<WatermarkPosition, WatermarkCoordinates>;

const COORD_ROUND = 10 ** WATERMARK_DRAG_COORD_DECIMALS;

/**
 * Dialog tách riêng để user kéo thả watermark trực quan lên ảnh nền. Chạy
 * trong CDK Dialog (overlay, focus trap, Esc, backdrop click — tất cả handled
 * by CDK). State watermark đọc/ghi trực tiếp qua SettingsStateService.
 */
@Component({
  selector: 'app-watermark-preview-dialog',
  standalone: true,
  imports: [],
  templateUrl: './watermark-preview-dialog.component.html',
  styleUrl: './watermark-preview-dialog.component.scss',
})
export class WatermarkPreviewDialogComponent implements AfterViewInit, OnDestroy {
  private readonly dialogRef = inject(DialogRef<void>);
  private readonly data = inject<WatermarkPreviewDialogData>(DIALOG_DATA);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);
  private readonly translation = inject(TranslationService);

  readonly t = this.translation.t;
  readonly watermarks = this.settings.watermarks;

  readonly activeId = signal<string>(this.data.initialWatermarkId);

  readonly imageWidth = signal<number>(0);
  readonly imageHeight = signal<number>(0);
  readonly imageAspectRatio = computed(() => {
    const w = this.imageWidth();
    const h = this.imageHeight();
    return w > 0 && h > 0 ? `${w} / ${h}` : null;
  });

  readonly previewContainerWidth = computed(() => {
    const w = this.imageWidth();
    const h = this.imageHeight();
    if (!w || !h) return 'auto';
    return `min(100%, calc(var(--preview-max-height, 55vh) * ${w / h}))`;
  });

  readonly previewBgUrl = computed(() => {
    const files = this.state.processedFiles();
    if (files.length === 0) return null;
    return files[0].result?.decodedOriginalUrl || this.state.createBlobUrl(files[0].file);
  });

  /** AbortController cho drag listeners — cleanup khi dialog đóng. */
  private dragAbortController: AbortController | null = null;

  ngAfterViewInit(): void {
    // Nếu watermark đang ở preset position khi mở dialog → switch sang custom
    // (50,50) làm điểm khởi đầu cho user kéo.
    const item = this.watermarks().find((w) => w.id === this.activeId());
    if (item && !this.isCustomPosition(item.position)) {
      this.settings.updateWatermark(this.activeId(), { position: { x: 50, y: 50 } });
      this.state.markSettingsChanged();
    }
  }

  ngOnDestroy(): void {
    this.abortActiveDrag();
  }

  close(): void {
    this.dialogRef.close();
  }

  selectInModal(id: string): void {
    this.activeId.set(id);
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      this.imageWidth.set(img.naturalWidth);
      this.imageHeight.set(img.naturalHeight);
    }
  }

  isCustomPosition(position: WatermarkPosition): position is WatermarkCoordinates {
    return typeof position === 'object' && position !== null;
  }

  getWatermarkStyle(item: WatermarkItem): Record<string, string> {
    return item.type === 'text'
      ? this.getTextWatermarkStyle(item)
      : this.getImageWatermarkStyle(item);
  }

  private getTextWatermarkStyle(item: TextWatermarkItem): Record<string, string> {
    const base: Record<string, string> = {
      position: 'absolute',
      opacity: String(item.opacity),
      'pointer-events': 'auto',
      'user-select': 'none',
      'font-size': `calc(1cqw * ${item.fontSize})`,
      'font-family': 'var(--font-family)',
      'font-weight': 'bold',
      color: item.color,
      'white-space': 'nowrap',
    };
    return { ...base, ...this.getPositionStyle(item.position, item.fontSize, 'text') };
  }

  private getImageWatermarkStyle(item: ImageWatermarkItem): Record<string, string> {
    const base: Record<string, string> = {
      position: 'absolute',
      opacity: String(item.opacity),
      'pointer-events': 'auto',
      'user-select': 'none',
      width: `${item.size}%`,
      height: 'auto',
    };
    const padding = item.size * WATERMARK_IMAGE_PRESET_PADDING_RATIO;
    return { ...base, ...this.getPositionStyle(item.position, padding, 'image') };
  }

  private getPositionStyle(
    position: WatermarkPosition,
    padding: number,
    variant: 'text' | 'image',
  ): Record<string, string> {
    if (this.isCustomPosition(position)) {
      const style: Record<string, string> = {
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      };
      if (variant === 'text') style['text-align'] = 'center';
      return style;
    }
    return this.getPresetPositionStyle(position, padding, variant);
  }

  private getPresetPositionStyle(
    position: PresetPosition,
    padding: number,
    variant: 'text' | 'image',
  ): Record<string, string> {
    const isText = variant === 'text';
    switch (position) {
      case 'top-left':
        return isText
          ? {
              left: `${padding}%`,
              top: `${padding}%`,
              transform: 'translateY(-50%)',
              'text-align': 'left',
            }
          : { left: `${padding}%`, top: `${padding}%`, transform: 'none' };
      case 'top-right':
        return isText
          ? {
              right: `${padding}%`,
              top: `${padding}%`,
              transform: 'translateY(-50%)',
              'text-align': 'right',
            }
          : { right: `${padding}%`, top: `${padding}%`, transform: 'none' };
      case 'bottom-left':
        return isText
          ? {
              left: `${padding}%`,
              bottom: `${padding}%`,
              transform: 'translateY(50%)',
              'text-align': 'left',
            }
          : { left: `${padding}%`, bottom: `${padding}%`, transform: 'none' };
      case 'bottom-right':
        return isText
          ? {
              right: `${padding}%`,
              bottom: `${padding}%`,
              transform: 'translateY(50%)',
              'text-align': 'right',
            }
          : { right: `${padding}%`, bottom: `${padding}%`, transform: 'none' };
      case 'center':
        return isText
          ? {
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              'text-align': 'center',
            }
          : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
  }

  startDrag(event: MouseEvent | TouchEvent, item: WatermarkItem): void {
    // Reject right-click cho mouse; TouchEvent không có `button` field.
    if (event instanceof MouseEvent && event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault();

    this.activeId.set(item.id);

    const overlayEl = event.currentTarget as HTMLElement;
    const container = overlayEl.parentElement;
    if (!container) return;

    this.abortActiveDrag();
    this.dragAbortController = new AbortController();
    const { signal } = this.dragAbortController;

    const onMove = (moveEvent: MouseEvent | TouchEvent): void => {
      const clientX =
        moveEvent instanceof TouchEvent ? moveEvent.touches[0]?.clientX : moveEvent.clientX;
      const clientY =
        moveEvent instanceof TouchEvent ? moveEvent.touches[0]?.clientY : moveEvent.clientY;

      if (clientX === undefined || clientY === undefined) return;

      const rect = container.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      this.settings.updateWatermark(item.id, {
        position: {
          x: Math.round(x * COORD_ROUND) / COORD_ROUND,
          y: Math.round(y * COORD_ROUND) / COORD_ROUND,
        },
      });
    };

    const onEnd = (): void => {
      this.abortActiveDrag();
      this.state.markSettingsChanged();
    };

    document.addEventListener('mousemove', onMove, { signal });
    document.addEventListener('mouseup', onEnd, { signal });
    document.addEventListener('touchmove', onMove, { signal, passive: false });
    document.addEventListener('touchend', onEnd, { signal });
  }

  private abortActiveDrag(): void {
    this.dragAbortController?.abort();
    this.dragAbortController = null;
  }
}
