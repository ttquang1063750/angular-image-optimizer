import { Component, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import { FileItemComponent } from './file-item/file-item.component';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [FileItemComponent, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss',
})
export class FileListComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly processedFiles = this.state.processedFiles;

  onDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.state.reorderFiles(event.previousIndex, event.currentIndex);
  }
}
