import { Component, HostListener, ViewChild, inject, signal } from '@angular/core';
import { TranslationService } from '../translation.service';
import { UploaderStateService } from '../uploader-state.service';
import { ProcessedFile } from '../image-processing.model';
import { ComparisonModalComponent } from './comparison-modal/comparison-modal.component';
import { DropZoneComponent } from './drop-zone/drop-zone.component';
import { FileListComponent } from './file-list/file-list.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [ComparisonModalComponent, DropZoneComponent, FileListComponent, SettingsPanelComponent],
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

  readonly showConfig = signal<boolean>(true);

  @ViewChild(DropZoneComponent) dropZone?: DropZoneComponent;

  toggleConfig(): void {
    this.showConfig.update((val) => !val);
  }

  /**
   * Keyboard shortcuts:
   *  - Cmd/Ctrl+O   → open file picker
   *  - Cmd/Ctrl+S   → download all (chỉ khi có file đã nén)
   *  - Escape       → đóng comparison modal
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

    if (!isMod && event.key === 'Escape' && this.comparingFile()) {
      this.state.closeComparison();
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
