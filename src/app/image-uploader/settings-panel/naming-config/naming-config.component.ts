import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../../translation.service';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { INPUT_RANGES, NumberRange } from '../../../image-processing.constants';
import { getInputValue, validateNumberInput } from '../../../utils/dom-event';

@Component({
  selector: 'app-naming-config',
  standalone: true,
  imports: [],
  templateUrl: './naming-config.component.html',
  styleUrl: './naming-config.component.scss',
})
export class NamingConfigComponent {
  private readonly translationService = inject(TranslationService);
  private readonly settings = inject(SettingsStateService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly namePrefix = this.settings.namePrefix;
  readonly nameSuffix = this.settings.nameSuffix;
  readonly includeNumbering = this.settings.includeNumbering;
  readonly startNumberingIndex = this.settings.startNumberingIndex;

  readonly ranges = INPUT_RANGES;
  readonly errors = signal<Record<string, string>>({});

  updatePrefix(event: Event): void {
    this.settings.namePrefix.set(getInputValue(event));
    this.state.markSettingsChanged();
  }

  updateSuffix(event: Event): void {
    this.settings.nameSuffix.set(getInputValue(event));
    this.state.markSettingsChanged();
  }

  updateStartIndex(event: Event): void {
    const value = this.validate('startIndex', event, this.ranges.startNumberingIndex);
    if (value === null) return;
    this.settings.startNumberingIndex.set(value);
    this.state.markSettingsChanged();
  }

  toggleNumbering(): void {
    this.settings.includeNumbering.update((v) => !v);
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
