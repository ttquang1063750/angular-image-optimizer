import { Component, inject } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import { FileItemComponent } from './file-item/file-item.component';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [FileItemComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss',
})
export class FileListComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly processedFiles = this.state.processedFiles;
}
