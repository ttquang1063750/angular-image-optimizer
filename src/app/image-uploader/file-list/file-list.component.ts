import { Component, inject, signal } from '@angular/core';
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

  readonly draggedIndex = signal<number | null>(null);
  readonly dragOverIndex = signal<number | null>(null);
  readonly draggedRowHeight = signal<number>(80);

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex.set(index);
    const target = event.currentTarget as HTMLElement | null;
    if (target?.offsetHeight) {
      this.draggedRowHeight.set(target.offsetHeight);
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.dragOverIndex() !== index) this.dragOverIndex.set(index);
  }

  isDropAbove(index: number): boolean {
    const from = this.draggedIndex();
    const over = this.dragOverIndex();
    if (from === null || over === null || index !== over || from === over) return false;
    return from > over;
  }

  isDropBelow(index: number): boolean {
    const from = this.draggedIndex();
    const over = this.dragOverIndex();
    if (from === null || over === null || index !== over || from === over) return false;
    return from < over;
  }

  onDragLeave(index: number): void {
    if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const fromIndex = this.draggedIndex();
    if (fromIndex !== null && fromIndex !== targetIndex) {
      this.state.reorderFiles(fromIndex, targetIndex);
    }
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }
}
