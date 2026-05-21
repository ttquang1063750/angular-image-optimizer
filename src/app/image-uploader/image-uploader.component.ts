import { Component, HostListener, ViewChild, inject, signal } from '@angular/core';
import { TranslationService } from '../translation.service';
import { UploaderStateService } from '../uploader-state.service';
import { ProcessedFile } from '../image-processing.model';
import { ComparisonModalComponent } from './comparison-modal/comparison-modal.component';
import { DropZoneComponent } from './drop-zone/drop-zone.component';
import { FileListComponent } from './file-list/file-list.component';
import { LangSwitcherComponent } from './lang-switcher/lang-switcher.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { PresetManagerComponent } from './settings-panel/preset-manager/preset-manager.component';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [
    ComparisonModalComponent,
    DropZoneComponent,
    FileListComponent,
    LangSwitcherComponent,
    SettingsPanelComponent,
    ThemeToggleComponent,
    PresetManagerComponent,
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
})
export class ImageUploaderComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly processedFiles = this.state.processedFiles;
  readonly isCompressing = this.state.isCompressing;
  readonly settingsChanged = this.state.settingsChanged;
  readonly completedCount = this.state.completedCount;
  readonly comparingFile = this.state.comparingFile;

  readonly showSettings = signal<boolean>(false);
  readonly showConfig = signal<boolean>(true);

  @ViewChild(DropZoneComponent) dropZone?: DropZoneComponent;

  toggleSettings(): void {
    this.showSettings.update((val) => !val);
  }

  toggleConfig(): void {
    this.showConfig.update((val) => !val);
  }

  closeSettings(): void {
    this.showSettings.set(false);
  }

  openSettings(): void {
    this.showSettings.set(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSettings()) return;

    const target = event.target as HTMLElement;
    const clickedInsideFab = target.closest('.settings-toggle-fab');
    const clickedInsidePopover = target.closest('.settings-popover');

    if (!clickedInsideFab && !clickedInsidePopover) {
      this.showSettings.set(false);
    }
  }

  /**
   * Keyboard shortcuts:
   *  - Cmd/Ctrl+O   → open file picker
   *  - Cmd/Ctrl+S   → download all (chỉ khi có file đã nén)
   *  - Escape       → đóng comparison modal hoặc settings popover
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.altKey) return;
    const isMod = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();

    if (isMod && !event.shiftKey && key === 'o') {
      event.preventDefault();
      this.dropZone?.openFilePicker();
      return;
    }

    if (isMod && !event.shiftKey && key === 's') {
      event.preventDefault();
      if (this.completedCount() > 0 && !this.isCompressing()) {
        this.downloadAll();
      }
      return;
    }

    if (!isMod && event.key === 'Escape') {
      if (this.comparingFile()) {
        this.state.closeComparison();
        return;
      }
      if (this.showSettings()) {
        this.closeSettings();
      }
    }
  }

  onFilesSelected(files: File[]): void {
    this.state.addFiles(files);
  }

  recompressAll(): void {
    this.state.recompressAll();
  }

  clearAll(): void {
    this.state.clearAll();
  }

  async downloadAll(): Promise<void> {
    const doneFiles = this.processedFiles().filter((f) => f.status === 'done');
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1 && doneFiles[0].result) {
      this.downloadSingle(doneFiles[0]);
    } else {
      const zipBlob = await this.state.generateZip();
      const url = URL.createObjectURL(zipBlob);
      this.downloadFile(url, `compressed_images_${new Date().getTime()}.zip`);
      URL.revokeObjectURL(url);
    }
  }

  downloadSingle(item: ProcessedFile): void {
    if (item.status === 'done' && item.result) {
      this.downloadFile(item.result.compressedUrl, item.result.compressedFile.name);
    }
  }

  private downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }
}
