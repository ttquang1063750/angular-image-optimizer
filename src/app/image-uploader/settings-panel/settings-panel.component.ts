import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { SettingsStateService } from '../../settings-state.service';
import { UploaderStateService } from '../../uploader-state.service';
import { CompressionPreset, OutputFormat, ResizeMode } from '../../image-processing.model';
import { INPUT_RANGES, NumberRange } from '../../image-processing.constants';
import { validateNumberInput } from '../../utils/dom-event';
import { NamingConfigComponent } from './naming-config/naming-config.component';
import { WatermarkConfigComponent } from './watermark-config/watermark-config.component';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [NamingConfigComponent, WatermarkConfigComponent],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss',
})
export class SettingsPanelComponent {
  private readonly translationService = inject(TranslationService);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly selectedPreset = this.settings.selectedPreset;
  readonly selectedFormat = this.settings.selectedFormat;
  readonly selectedResizeMode = this.settings.selectedResizeMode;
  readonly resizeWidth = this.settings.resizeWidth;
  readonly resizeHeight = this.settings.resizeHeight;
  readonly resizePercent = this.settings.resizePercent;

  readonly ranges = INPUT_RANGES;
  readonly errors = signal<Record<string, string>>({});

  setPreset(preset: CompressionPreset): void {
    this.settings.selectedPreset.set(preset);
    this.state.markSettingsChanged();
  }

  setFormat(format: OutputFormat): void {
    this.settings.selectedFormat.set(format);
    this.state.markSettingsChanged();
  }

  setResizeMode(mode: ResizeMode): void {
    this.settings.selectedResizeMode.set(mode);
    this.state.markSettingsChanged();
  }

  updateResizeValue(event: Event, type: 'width' | 'height' | 'percent'): void {
    const range = type === 'percent' ? this.ranges.resizePercent : this.ranges.resizePx;
    const value = this.validate(type, event, range);
    if (value === null) return;

    if (type === 'width') this.settings.resizeWidth.set(value);
    if (type === 'height') this.settings.resizeHeight.set(value);
    if (type === 'percent') this.settings.resizePercent.set(value);
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
