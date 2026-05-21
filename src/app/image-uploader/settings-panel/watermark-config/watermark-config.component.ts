import { Component, inject, signal } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { TranslationService } from '../../../translation.service';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { WatermarkItem, WatermarkPosition, WatermarkType } from '../../../image-processing.model';
import {
  DEFAULT_WATERMARK,
  INPUT_RANGES,
  MAX_WATERMARKS,
  NumberRange,
} from '../../../image-processing.constants';
import {
  getInputFiles,
  getInputValue,
  getSelectValue,
  validateNumberInput,
} from '../../../utils/dom-event';

@Component({
  selector: 'app-watermark-config',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './watermark-config.component.html',
  styleUrl: './watermark-config.component.scss',
})
export class WatermarkConfigComponent {
  private readonly translationService = inject(TranslationService);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly includeWatermark = this.settings.includeWatermark;
  readonly watermarks = this.settings.watermarks;

  readonly ranges = INPUT_RANGES;
  readonly maxWatermarks = MAX_WATERMARKS;
  readonly errors = signal<Record<string, string>>({});
  readonly expandedId = signal<string | null>(null);

  constructor() {
    const list = this.watermarks();
    if (list.length > 0) {
      this.expandedId.set(list[0].id);
    }
  }

  toggle(): void {
    this.settings.includeWatermark.update((v) => !v);
    this.state.markSettingsChanged();
  }

  addWatermark(type: WatermarkType): void {
    this.settings.addWatermark(type);
    const list = this.watermarks();
    if (list.length > 0) {
      const newId = list[list.length - 1].id;
      this.expandedId.set(newId);
    }
    this.state.markSettingsChanged();
  }

  removeWatermark(id: string): void {
    this.settings.removeWatermark(id);
    if (this.expandedId() === id) {
      const list = this.watermarks();
      this.expandedId.set(list.length > 0 ? list[0].id : null);
    }
    this.state.markSettingsChanged();
  }

  toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  updateType(id: string, type: WatermarkType): void {
    const item = this.watermarks().find((w) => w.id === id);
    if (!item || item.type === type) return;

    const newItem: WatermarkItem =
      type === 'text'
        ? {
            id,
            type: 'text',
            text: DEFAULT_WATERMARK.text,
            fontSize: DEFAULT_WATERMARK.fontSizePercent,
            color: DEFAULT_WATERMARK.color,
            opacity: item.opacity,
            position: item.position,
          }
        : {
            id,
            type: 'image',
            image: null,
            imageName: null,
            previewUrl: null,
            size: DEFAULT_WATERMARK.imageSizePercent,
            opacity: item.opacity,
            position: item.position,
          };

    this.settings.replaceWatermark(id, newItem);
    this.state.markSettingsChanged();
  }

  onPositionChange(id: string, event: Event): void {
    this.settings.updateWatermark(id, {
      position: getSelectValue<WatermarkPosition>(event),
    });
    this.state.markSettingsChanged();
  }

  onTextChange(id: string, event: Event): void {
    this.settings.updateWatermark(id, {
      text: getInputValue(event),
    });
    this.state.markSettingsChanged();
  }

  onColorChange(id: string, event: Event): void {
    this.settings.updateWatermark(id, {
      color: getInputValue(event),
    });
    this.state.markSettingsChanged();
  }

  onFontSizeChange(id: string, event: Event): void {
    const value = this.validate(id, 'fontSize', event, this.ranges.watermarkFontSize);
    if (value === null) return;
    this.settings.updateWatermark(id, { fontSize: value });
    this.state.markSettingsChanged();
  }

  onOpacityChange(id: string, event: Event): void {
    const value = this.validate(id, 'opacity', event, this.ranges.watermarkOpacity);
    if (value === null) return;
    this.settings.updateWatermark(id, { opacity: value });
    this.state.markSettingsChanged();
  }

  onImageSizeChange(id: string, event: Event): void {
    const value = this.validate(id, 'imageSize', event, this.ranges.watermarkImageSize);
    if (value === null) return;
    this.settings.updateWatermark(id, { size: value });
    this.state.markSettingsChanged();
  }

  onImageSelected(id: string, event: Event): void {
    const files = getInputFiles(event);
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    this.settings.setWatermarkImage(id, file);
    this.state.markSettingsChanged();
  }

  removeImage(id: string): void {
    this.settings.setWatermarkImage(id, null);
    this.state.markSettingsChanged();
  }

  errorFor(id: string, field: string): string | undefined {
    return this.errors()[`${id}_${field}`];
  }

  onDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.watermarks()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.settings.setWatermarks(list);
    this.state.markSettingsChanged();
  }

  private validate(id: string, field: string, event: Event, range: NumberRange): number | null {
    const result = validateNumberInput(event, range.min, range.max);
    const key = `${id}_${field}`;
    if (result.valid) {
      this.clearError(key);
      return result.value;
    }
    const dict = this.t();
    const msg =
      result.reason === 'nan'
        ? dict['error_value_nan']
        : dict['error_value_range']
            .replace('{min}', String(range.min))
            .replace('{max}', String(range.max));
    this.errors.update((e) => ({ ...e, [key]: msg }));
    return null;
  }

  private clearError(key: string): void {
    this.errors.update((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }
}
