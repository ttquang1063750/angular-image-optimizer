import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { SettingsStateService } from '../../../settings-state.service';
import { TranslationService } from '../../../translation.service';
import { UploaderStateService } from '../../../uploader-state.service';

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

  readonly presetName = signal<string>('');
  readonly activePresetId = signal<string>('default');

  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly showDeleteConfirm = signal<boolean>(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  updatePresetName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.presetName.set(input.value);
  }

  onPresetChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.activePresetId.set(value);

    this.clearMessages();

    if (value === 'default') {
      this.settings.resetToDefaults();
      this.uploaderState.markSettingsChanged();
      this.showSuccess(this.t()['msg_preset_loaded']);
    } else {
      this.settings.loadCustomPreset(value);
      this.uploaderState.markSettingsChanged();
      this.showSuccess(this.t()['msg_preset_loaded']);
    }
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
      if (saved) {
        const newPreset = this.customPresets()[this.customPresets().length - 1];
        if (newPreset) {
          this.activePresetId.set(newPreset.id);
        }
        this.presetName.set('');
        this.showSuccess(this.t()['msg_preset_saved']);
      }
    } catch (e) {
      this.errorMessage.set(
        e instanceof DOMException && e.name === 'QuotaExceededError'
          ? 'LocalStorage quota exceeded! Please delete old presets.'
          : 'Failed to save preset.',
      );
    }
  }

  deletePreset(): void {
    const activeId = this.activePresetId();
    if (activeId === 'default') return;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const activeId = this.activePresetId();
    if (activeId === 'default') return;

    this.settings.deleteCustomPreset(activeId);
    this.activePresetId.set('default');
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
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const success = this.settings.importPresets(text);
      if (success) {
        this.showSuccess(this.t()['msg_preset_imported']);
        input.value = '';
      } else {
        this.errorMessage.set(this.t()['msg_invalid_preset_file']);
      }
    };
    reader.readAsText(file);
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set(null);
      }
    }, 3000);
  }

  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
