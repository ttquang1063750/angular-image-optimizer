import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import {
  DEFAULT_PRESET_ID,
  PRESET_IMPORT_MAX_BYTES,
  TOAST_TIMEOUT_MS,
} from '../../../image-processing.constants';
import { SettingsStateService } from '../../../settings-state.service';
import { TranslationService } from '../../../translation.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { getInputFiles, getInputValue, getSelectValue } from '../../../utils/dom-event';

@Component({
  selector: 'app-preset-manager',
  standalone: true,
  templateUrl: './preset-manager.component.html',
  styleUrl: './preset-manager.component.scss',
})
export class PresetManagerComponent {
  private readonly settings = inject(SettingsStateService);
  private readonly translationService = inject(TranslationService);
  private readonly uploaderState = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly customPresets = this.settings.customPresets;
  readonly defaultPresetId = DEFAULT_PRESET_ID;

  readonly presetName = signal<string>('');
  readonly activePresetId = signal<string>(DEFAULT_PRESET_ID);

  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly showDeleteConfirm = signal<boolean>(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  updatePresetName(event: Event): void {
    this.presetName.set(getInputValue(event));
  }

  onPresetChange(event: Event): void {
    const value = getSelectValue(event);
    this.activePresetId.set(value);
    this.clearMessages();

    if (value === DEFAULT_PRESET_ID) {
      this.settings.resetToDefaults();
    } else {
      this.settings.loadCustomPreset(value);
    }
    this.uploaderState.markSettingsChanged();
    this.showSuccess(this.t()['msg_preset_loaded']);
  }

  async savePreset(): Promise<void> {
    const name = this.presetName().trim();
    this.clearMessages();

    if (!name) {
      this.errorMessage.set(this.t()['msg_preset_name_empty']);
      return;
    }

    const exists = this.customPresets().some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.errorMessage.set(this.t()['msg_preset_name_exists']);
      return;
    }

    try {
      const saved = await this.settings.saveCustomPreset(name);
      if (!saved) return;
      const newPreset = this.customPresets()[this.customPresets().length - 1];
      if (newPreset) this.activePresetId.set(newPreset.id);
      this.presetName.set('');
      this.showSuccess(this.t()['msg_preset_saved']);
    } catch (e) {
      this.errorMessage.set(
        e instanceof DOMException && e.name === 'QuotaExceededError'
          ? this.t()['msg_preset_quota_exceeded']
          : this.t()['msg_preset_save_failed'],
      );
    }
  }

  deletePreset(): void {
    if (this.activePresetId() === DEFAULT_PRESET_ID) return;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const activeId = this.activePresetId();
    if (activeId === DEFAULT_PRESET_ID) return;

    this.settings.deleteCustomPreset(activeId);
    this.activePresetId.set(DEFAULT_PRESET_ID);
    this.settings.resetToDefaults();
    this.uploaderState.markSettingsChanged();
    this.clearMessages();
    this.showSuccess(this.t()['msg_preset_deleted']);
    this.showDeleteConfirm.set(false);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  exportPresets(): void {
    this.settings.exportPresets();
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileImport(event: Event): void {
    const files = getInputFiles(event);
    const file = files?.[0];
    if (!file) return;

    if (file.size > PRESET_IMPORT_MAX_BYTES) {
      this.errorMessage.set(this.t()['msg_preset_file_too_large']);
      this.resetFileInput(event);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const success = this.settings.importPresets(text);
      if (success) {
        this.showSuccess(this.t()['msg_preset_imported']);
      } else {
        this.errorMessage.set(this.t()['msg_invalid_preset_file']);
      }
      this.resetFileInput(event);
    };
    reader.readAsText(file);
  }

  private resetFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = '';
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set(null);
      }
    }, TOAST_TIMEOUT_MS);
  }

  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
