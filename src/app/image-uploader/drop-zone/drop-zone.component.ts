import { Component, inject, output, signal } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { getInputFiles } from '../../utils/dom-event';

@Component({
  selector: 'app-drop-zone',
  standalone: true,
  imports: [],
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.scss',
})
export class DropZoneComponent {
  private readonly translationService = inject(TranslationService);

  readonly t = this.translationService.t;
  readonly isDragging = signal<boolean>(false);

  readonly filesSelected = output<File[]>();

  onFileSelected(event: Event): void {
    const files = getInputFiles(event);
    if (!files || files.length === 0) return;
    this.emitFiles(Array.from(files));
    // Reset input để có thể chọn lại cùng file
    (event.target as HTMLInputElement).value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.emitFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  private emitFiles(files: File[]): void {
    const imageFiles = files.filter(
      (f) =>
        f.type.startsWith('image/') ||
        f.name.toLowerCase().endsWith('.heic') ||
        f.name.toLowerCase().endsWith('.heif'),
    );
    if (imageFiles.length === 0) return;
    this.filesSelected.emit(imageFiles);
  }
}
