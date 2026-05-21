import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../../translation.service';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { WatermarkPosition, WatermarkType } from '../../../image-processing.model';
import { INPUT_RANGES, NumberRange } from '../../../image-processing.constants';
import {
  getInputFiles,
  getInputValue,
  getSelectValue,
  validateNumberInput,
} from '../../../utils/dom-event';

@Component({
  selector: 'app-watermark-config',
  standalone: true,
  imports: [],
  templateUrl: './watermark-config.component.html',
  styleUrl: './watermark-config.component.scss',
})
export class WatermarkConfigComponent {
  private readonly translationService = inject(TranslationService);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly includeWatermark = this.settings.includeWatermark;
  readonly watermarkType = this.settings.watermarkType;
  readonly watermarkText = this.settings.watermarkText;
  readonly watermarkPosition = this.settings.watermarkPosition;
  readonly watermarkFontSize = this.settings.watermarkFontSize;
  readonly watermarkOpacity = this.settings.watermarkOpacity;
  readonly watermarkColor = this.settings.watermarkColor;
  readonly watermarkImage = this.settings.watermarkImage;
  readonly watermarkImageSize = this.settings.watermarkImageSize;
  readonly watermarkImagePreviewUrl = this.settings.watermarkImagePreviewUrl;

  readonly ranges = INPUT_RANGES;
  readonly errors = signal<Record<string, string>>({});

  toggle(): void {
    this.settings.includeWatermark.update((v) => !v);
    this.state.markSettingsChanged();
  }

  setType(type: WatermarkType): void {
    this.settings.watermarkType.set(type);
    this.state.markSettingsChanged();
  }

  onPositionChange(event: Event): void {
    this.settings.watermarkPosition.set(getSelectValue<WatermarkPosition>(event));
    this.state.markSettingsChanged();
  }

  onTextChange(event: Event): void {
    this.settings.watermarkText.set(getInputValue(event));
    this.state.markSettingsChanged();
  }

  onColorChange(event: Event): void {
    this.settings.watermarkColor.set(getInputValue(event));
    this.state.markSettingsChanged();
  }

  onFontSizeChange(event: Event): void {
    const value = this.validate('fontSize', event, this.ranges.watermarkFontSize);
    if (value === null) return;
    this.settings.watermarkFontSize.set(value);
    this.state.markSettingsChanged();
  }

  onOpacityChange(event: Event): void {
    const value = this.validate('opacity', event, this.ranges.watermarkOpacity);
    if (value === null) return;
    this.settings.watermarkOpacity.set(value);
    this.state.markSettingsChanged();
  }

  onImageSizeChange(event: Event): void {
    const value = this.validate('imageSize', event, this.ranges.watermarkImageSize);
    if (value === null) return;
    this.settings.watermarkImageSize.set(value);
    this.state.markSettingsChanged();
  }

  onImageSelected(event: Event): void {
    const files = getInputFiles(event);
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    this.settings.setWatermarkImage(file);
    this.state.markSettingsChanged();
  }

  removeImage(): void {
    this.settings.setWatermarkImage(null);
    this.state.markSettingsChanged();
  }

  errorFor(field: string): string | undefined {
    return this.errors()[field];
  }

  private validate(field: string, event: Event, range: NumberRange): number | null {
    const result = validateNumberInput(event, range.min, range.max);
    if (result.valid) {
      this.clearError(field);
      return result.value;
    }
    const dict = this.t();
    const msg =
      result.reason === 'nan'
        ? dict['error_value_nan']
        : dict['error_value_range']
            .replace('{min}', String(range.min))
            .replace('{max}', String(range.max));
    this.errors.update((e) => ({ ...e, [field]: msg }));
    return null;
  }

  private clearError(field: string): void {
    this.errors.update((e) => {
      if (!(field in e)) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }
}
