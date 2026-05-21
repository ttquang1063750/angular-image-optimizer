import { Component, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { SettingsStateService } from '../../settings-state.service';
import { UploaderStateService } from '../../uploader-state.service';
import {
  CompressionPreset,
  OutputFormat,
  ResizeMode,
  WatermarkPosition,
} from '../../image-processing.model';
import { getInputValue, getNumberValue, getSelectValue } from '../../utils/dom-event';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss',
})
export class SettingsPanelComponent {
  private readonly translationService = inject(TranslationService);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;

  // Settings signals (re-expose từ SettingsStateService cho template)
  readonly selectedPreset = this.settings.selectedPreset;
  readonly selectedFormat = this.settings.selectedFormat;
  readonly selectedResizeMode = this.settings.selectedResizeMode;
  readonly resizeWidth = this.settings.resizeWidth;
  readonly resizeHeight = this.settings.resizeHeight;
  readonly resizePercent = this.settings.resizePercent;
  readonly namePrefix = this.settings.namePrefix;
  readonly nameSuffix = this.settings.nameSuffix;
  readonly includeNumbering = this.settings.includeNumbering;
  readonly startNumberingIndex = this.settings.startNumberingIndex;
  readonly includeWatermark = this.settings.includeWatermark;
  readonly watermarkText = this.settings.watermarkText;
  readonly watermarkPosition = this.settings.watermarkPosition;
  readonly watermarkFontSize = this.settings.watermarkFontSize;
  readonly watermarkOpacity = this.settings.watermarkOpacity;
  readonly watermarkColor = this.settings.watermarkColor;

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
    const value = getNumberValue(event);
    if (isNaN(value) || value <= 0) return;

    if (type === 'width') this.settings.resizeWidth.set(value);
    if (type === 'height') this.settings.resizeHeight.set(value);
    if (type === 'percent') this.settings.resizePercent.set(value);
    this.state.markSettingsChanged();
  }

  updateNamingValue(event: Event, type: 'prefix' | 'suffix' | 'start'): void {
    if (type === 'start') {
      const val = getNumberValue(event);
      if (!isNaN(val)) this.settings.startNumberingIndex.set(val);
    } else {
      const value = getInputValue(event);
      if (type === 'prefix') this.settings.namePrefix.set(value);
      if (type === 'suffix') this.settings.nameSuffix.set(value);
    }
    this.state.markSettingsChanged();
  }

  toggleNumbering(): void {
    this.settings.includeNumbering.update((v) => !v);
    this.state.markSettingsChanged();
  }

  toggleWatermark(): void {
    this.settings.includeWatermark.update((v) => !v);
    this.state.markSettingsChanged();
  }

  onWatermarkPositionChange(event: Event): void {
    this.settings.watermarkPosition.set(getSelectValue<WatermarkPosition>(event));
    this.state.markSettingsChanged();
  }

  updateWatermarkValue(event: Event, type: 'text' | 'size' | 'opacity' | 'color'): void {
    if (type === 'text') this.settings.watermarkText.set(getInputValue(event));
    if (type === 'color') this.settings.watermarkColor.set(getInputValue(event));

    if (type === 'size' || type === 'opacity') {
      const val = getNumberValue(event);
      if (!isNaN(val)) {
        if (type === 'size') this.settings.watermarkFontSize.set(val);
        if (type === 'opacity') this.settings.watermarkOpacity.set(val);
      }
    }
    this.state.markSettingsChanged();
  }
}
