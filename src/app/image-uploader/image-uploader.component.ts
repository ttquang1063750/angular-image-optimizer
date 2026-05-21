import { Component, inject } from '@angular/core';
import { TranslationService } from '../translation.service';
import { UploaderStateService } from '../uploader-state.service';
import { ProcessedFile } from '../image-processing.model';
import { ComparisonModalComponent } from './comparison-modal/comparison-modal.component';
import { DropZoneComponent } from './drop-zone/drop-zone.component';
import { FileListComponent } from './file-list/file-list.component';
import { LangSwitcherComponent } from './lang-switcher/lang-switcher.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';

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
