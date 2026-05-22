import {
  Component,
  EnvironmentInjector,
  inject,
  input,
  runInInjectionContext,
} from '@angular/core';
import { ProcessedFile } from '../../../image-processing.model';
import { TranslationService } from '../../../translation.service';
import { UploaderStateService } from '../../../uploader-state.service';

@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [],
  templateUrl: './file-item.component.html',
  styleUrl: './file-item.component.scss',
})
export class FileItemComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly item = input.required<ProcessedFile>();
  readonly t = this.translationService.t;

  remove(): void {
    this.state.removeFile(this.item().id);
  }

  async openCrop(): Promise<void> {
    const [{ Dialog }, { CropDialogComponent }] = await Promise.all([
      import('@angular/cdk/dialog'),
      import('../../crop-modal/crop-modal.component'),
    ]);

    runInInjectionContext(this.envInjector, () => {
      const dialog = inject(Dialog);
      dialog.open(CropDialogComponent, {
        data: { file: this.item() },
        panelClass: 'crop-dialog-panel',
        disableClose: true,
      });
    });
  }

  openComparison(): void {
    this.state.openComparison(this.item());
  }

  download(): void {
    const current = this.item();
    if (current.status !== 'done' || !current.result) return;
    const link = document.createElement('a');
    link.href = current.result.compressedUrl;
    link.download = current.result.compressedFile.name;
    link.click();
  }

  createBlobUrl(file: File): string {
    return this.state.createBlobUrl(file);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${new Intl.NumberFormat('en-US').format(value)} ${sizes[i]}`;
  }

  formatExactBytes(bytes: number): string {
    return new Intl.NumberFormat('en-US').format(bytes) + ' bytes';
  }
}
